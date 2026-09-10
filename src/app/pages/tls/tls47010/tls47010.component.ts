import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize, interval, Subscription, switchMap, take } from 'rxjs';
import { TLS47010Service, TLS47010TodayRecord } from '../../../service/api/tls/tls47010.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

const POLLING_INTERVAL_MS = 3000;
const FINISHED_STATUS_TEXTS = ['成功', '失敗'];

@Component({
  selector: 'app-tls47010',
  templateUrl: './tls47010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    TranslateModule,
    AsyncPipe,
    DatePipe
  ],
})
export class TLS47010Component extends BasicQueryPageComponent<unknown> implements OnInit {
  private readonly tls47010Service = inject(TLS47010Service);
  private readonly dropDown = inject(DropdownApiService);
  private readonly destroyRef = inject(DestroyRef);
  ECRNoOptions = this.dropDown.queryPos1002Filtered();
  dataTypeOptions = this.dropDown.queryDefTbl();
  queryForm = this.formBuilder.group({
    DEFTBL_List: [[], Validators.required],
    POS1002_List: [[], Validators.required],
  });
  private allSelected = false;
  private dataTypeLabelMap: Record<string, string> = {};
  private totalEcrCount = 0;
  private pollingSub?: Subscription;

  // 當天下傳紀錄(全部使用者)，含輪詢直到全部結案
  todayRecords: TLS47010TodayRecord[] = [];
  todayLoading = false;
  polling = false;

  constructor() { super(); }
  ngOnInit(): void {
    this.initializePage('TLS47010');
    this.dataTypeOptions.pipe(
      take(1),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(options => {
      this.dataTypeLabelMap = Object.fromEntries((options ?? []).map(o => [String(o.value), o.label]));
    });
    this.ECRNoOptions.pipe(
      take(1),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(options => {
      this.totalEcrCount = options?.length ?? 0;
    });
    this.queryTodayRecords();
  }

  // 查詢當天下傳紀錄(全部使用者)：獨立按鈕用，不受收銀機/資料類別必填驗證影響，任何時候可直接呼叫
  queryTodayRecords(): void {
    this.todayLoading = true;
    this.tls47010Service.queryTLS47010TodayRecords().pipe(
      finalize(() => { this.todayLoading = false; }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(res => {
      this.todayRecords = res.Data ?? [];
      this.syncPolling();
    });
  }
  // 用來接收子元件傳上來的全選狀態
  onEcrNoAllSelected(isAllSelected: boolean): void {
    console.log('全選狀態:', isAllSelected);
    this.allSelected = isAllSelected;
  }
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const requestBody = {
        POS1002_List: this.allSelected ? [] : form.value.POS1002_List,
        DEFTBL_List: form.value.DEFTBL_List
      }
      this.tls47010Service.insertTLS47010(requestBody).pipe(
        this.withLoading(),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(() => {
        this.messageService.successBubble('已送出下傳要求');
        // 新送出的批次已寫入DB，直接重新查當天紀錄即可併入清單，並依結果自動接續輪詢
        this.queryTodayRecords();
      });
    });
  }

  // 資料表代號 → 顯示名稱
  getDataTypeLabel(expType: string | null): string {
    if (!expType) return '';
    return this.dataTypeLabelMap[expType] ?? expType;
  }

  // 收銀機清單改用筆數顯示，避免選很多筆時整串代號洗版
  getEcrCountLabel(ecrLst: string | null): string {
    if (!ecrLst) {
      return `全選（${this.totalEcrCount}筆）`;
    }
    const count = ecrLst.split(',').filter(ecr => ecr.length > 0).length;
    return `${count}筆`;
  }

  get totalCount(): number {
    return this.todayRecords.length;
  }
  get successCount(): number {
    return this.todayRecords.filter(r => r.StatusText === '成功').length;
  }
  get failCount(): number {
    return this.todayRecords.filter(r => r.StatusText === '失敗').length;
  }
  get processingCount(): number {
    return this.totalCount - this.successCount - this.failCount;
  }

  // 依目前清單判斷是否要開始/停止輪詢：只要還有未結案(非成功/失敗)紀錄就輪詢，全部結案就停止
  private syncPolling(): void {
    if (this.hasPendingRecords()) {
      this.startPolling();
    } else {
      this.stopPolling();
    }
  }

  private hasPendingRecords(): boolean {
    return this.todayRecords.some(r => !FINISHED_STATUS_TEXTS.includes(r.StatusText));
  }

  private startPolling(): void {
    this.pollingSub?.unsubscribe();
    this.polling = true;
    this.pollingSub = interval(POLLING_INTERVAL_MS).pipe(
      switchMap(() => this.tls47010Service.queryTLS47010TodayRecords()),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: res => {
        this.todayRecords = res.Data ?? [];
        if (!this.hasPendingRecords()) {
          this.stopPolling();
        }
      },
      // 輪詢途中發生錯誤(如 HTTP 5xx)時 Observable 會直接終止，沒有這個 callback 的話
      // polling 旗標會永遠卡 true，「確定下傳」按鈕就永久 disable，所以要在這裡收尾恢復狀態
      error: () => {
        this.stopPolling();
      },
    });
  }

  private stopPolling(): void {
    this.pollingSub?.unsubscribe();
    this.pollingSub = undefined;
    this.polling = false;
  }
}
