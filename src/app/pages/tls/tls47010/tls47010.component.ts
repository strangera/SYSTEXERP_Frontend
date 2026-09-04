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
import { interval, Subscription, switchMap, take } from 'rxjs';
import { TLS47010StatusItem, TLS47010Service, TLS47010TrackingKey } from '../../../service/api/tls/tls47010.service';
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

  // 下傳進度：目前這批的追蹤鍵與各筆最新狀態
  trackingKeys: TLS47010TrackingKey[] = [];
  statusItems: TLS47010StatusItem[] = [];
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
      ).subscribe(res => {
        this.messageService.successBubble('已送出下傳要求');
        // 後端理論上每筆都會回傳追蹤鍵，但 API 資料仍可能有例外髒資料，過濾掉避免畫面崩潰
        this.trackingKeys = (res.Data?.TrackingKeys ?? []).filter((key): key is TLS47010TrackingKey => !!key);
        this.statusItems = [];
        if (this.trackingKeys.length > 0) {
          this.startPolling();
        }
      });
    });
  }

  // 資料表代號 → 顯示名稱
  getDataTypeLabel(expType: string | null): string {
    if (!expType) return '';
    return this.dataTypeLabelMap[expType] ?? expType;
  }

  getStatusItem(id: number): TLS47010StatusItem | undefined {
    return this.statusItems.find(s => s.ID === id);
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
    return this.trackingKeys.length;
  }
  get successCount(): number {
    return this.statusItems.filter(s => s.StatusText === '成功').length;
  }
  get failCount(): number {
    return this.statusItems.filter(s => s.StatusText === '失敗').length;
  }
  get processingCount(): number {
    return this.totalCount - this.successCount - this.failCount;
  }

  private startPolling(): void {
    this.pollingSub?.unsubscribe();
    this.polling = true;
    this.pollingSub = interval(POLLING_INTERVAL_MS).pipe(
      switchMap(() => this.tls47010Service.queryTLS47010Status({ TrackingKeys: this.trackingKeys })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: res => {
        this.statusItems = res.Data ?? [];
        if (this.isAllFinished()) {
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

  private isAllFinished(): boolean {
    return this.trackingKeys.length > 0
      && this.trackingKeys.every(key => {
        const status = this.getStatusItem(key.ID);
        return !!status && FINISHED_STATUS_TEXTS.includes(status.StatusText);
      });
  }
}
