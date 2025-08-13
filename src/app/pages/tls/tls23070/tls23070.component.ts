import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23070Service } from '../../../service/api/tls/tls23070.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-tls23070',
  templateUrl: './tls23070.component.html',
  styleUrls: ['./tls23070.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
  ],
})
export class TLS23070Component extends BasicQueryPageComponent<any> {
  private readonly STORAGE_KEY = 'TLS23070:queryForm';
  private destroy$ = new Subject<void>();          // ✅ 統一退訂
  querySubscription: Subscription | null = null;

  showPageSizeDialog = false;
  customPageSize = 1000;
  data: any[] = [];
  totalRecords = 0;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ✅ 陣列欄位用 control<any[]>([])，避免 never[] 型別問題
  queryForm = this.formBuilder.group({

    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    tlt_no: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }])
  });

  CounterOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  WhetherOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];             // ✅ 不要 ['']

  constructor(
    private tls23070Service: TLS23070Service,
    private counterNameService: CounterNameService,
    private floorService: FloorService,
    private tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23070', 'TLS23070cru', this.queryForm);

    // ✅ localStorage 還原
    this.restoreQueryFromStorage();

    // ✅ debounce + 自動退訂：表單變更即保存
    this.queryForm.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.saveQueryToStorage());

    // ❌ 刪掉錯誤的 'TLS23010_queryForm' 讀取，統一用 STORAGE_KEY

    // ✅ 下拉資料全加 takeUntil，避免 memory leak
    this.counterNameService.getCounters()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.CounterOptions = res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
      });

    this.floorService.getFloors()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.floorOptions = data);

    this.tls11010Service.getBuildingOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.BUILDING_NO_Options = data);

    this.tls11010Service.getOrgOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.OrganizationCodeOptions = res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
      });
  }

  goToReportMode(): void {
    this.customPageSize = 1000;
    this.showPageSizeDialog = true;
  }

  confirmPageSizeAndNavigate(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      this.queryForm.markAllAsTouched();
      return;
    }

    const queryFormValue = {
      ...this.queryForm.value,
      pageSize: this.customPageSize,
    };

    this.loading = true;
    this.messageService.blockUi();

    this.tls23070Service
      .queryTLS23070(queryFormValue)
      .pipe(
        timeout(30000),
        catchError(() => {
          this.messageService.errorBubble('查詢失敗');
          this.loading = false;
          this.messageService.unblockUi();
          return of({ Status: '9999', Data: [] });
        })
      )
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            this.queryStateService.setQueryState(this.ProgNo, queryFormValue);
            this.router.navigate(['account/tls/tls23070cru'], {
              state: {
                queryFormValue,
                pageSize: this.customPageSize,
                data: res.Data || [],
              },
            });
          } else {
            this.messageService.errorBubble('查詢失敗');
          }
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
          this.showPageSizeDialog = false;
        },
      });
  }

  /** 立即把目前表單狀態存進 LocalStorage（日期會轉 ISO 字串） */
  private saveQueryToStorage(): void {
    const raw = this.queryForm.getRawValue();
    const payload = JSON.stringify(raw, (k, v) => (v instanceof Date ? v.toISOString() : v));
    localStorage.setItem(this.STORAGE_KEY, payload);
  }

  /** 從 LocalStorage 還原進表單（把 ISO 字串還原成 Date 物件） */
  private restoreQueryFromStorage(): void {
    const json = localStorage.getItem(this.STORAGE_KEY);
    if (!json) return;

    const parsed = JSON.parse(json, (_k, v) => {
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
        const d = new Date(v);
        return isNaN(d.getTime()) ? v : d;
      }
      return v;
    });

    this.queryForm.patchValue(parsed, { emitEvent: false });
  }

  /** 清除 LocalStorage 內儲存的查詢條件 */
  private clearQueryStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.querySubscription?.unsubscribe();
  }
}
