import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23040Service } from '../../../service/api/tls/tls23040.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { timeout, catchError, debounceTime, takeUntil } from 'rxjs/operators';
import { of, Subject, Subscription } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentDetail, DiscountDetail, InvoiceDetail } from './tls23040.model';

@Component({
  selector: 'app-tls23040',
  templateUrl: './tls23040.component.html',
  styleUrls: ['./tls23040.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    InputTextComponent,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    PrimeTemplate,
    ButtonDirective,
    TranslateModule,
  ],
})
export class TLS23040Component extends BasicQueryPageComponent<any> {
  private readonly STORAGE_KEY = 'TLS23040:queryForm';
  private destroy$ = new Subject<void>();         // ✅ 統一退訂
  querySubscription: Subscription | null = null;

  totalRecords = 0;
  showPageSizeDialog = false;
  customPageSize = 10;
  useSummaryMode = false; // 預設為明細表模式
  displayMode: 'Report' | 'ByPaymentType' | 'ByDiscountType' = 'Report';

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ✅ 陣列欄位用 control<any[]>([])，避免 never[]；ECR_No 建議也用陣列，UI 預設「無選項」即可
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: this.formBuilder.control<any[]>([]),     // ← 原本 [null] 改成陣列
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: this.formBuilder.control<any[]>([]),
    TXN_Status: this.formBuilder.control<any[]>([]),
    TXN_FlagStatus: this.formBuilder.control<any[]>([]),
    TXN_PkngUID: [''],
    TXN_MemCard: [''],
    TXN_GUIBegNo: [''],
    tlt_building: [''],
    tlt_floor: this.formBuilder.control<any[]>([]),
    org_id: this.formBuilder.control<any[]>([]),
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  statusFlagOptions: any[] = [];
  TXN_SubtypeOptions: any[] = [];
  txnStatusOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  WhetherOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23040Service: TLS23040Service,
    private statusFlagService: StatusFlagService,
    private TXN_SubtypeService: TXN_SubtypeService,
    private txnStatusService: TxnStatusService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23040', '', this.queryForm);
    this.useSummaryMode = false;

    // ✅ 從 localStorage 還原
    this.restoreQueryFromStorage();

    // ✅ valueChanges：debounce + 自動退訂
    this.queryForm.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.saveQueryToStorage());

    // ✅ 下拉資料：一律加 takeUntil
    this.statusFlagService.getStatusFlags()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.statusFlagOptions = data);

    this.TXN_SubtypeService.getTXNSubtype()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.TXN_SubtypeOptions = data);

    this.txnStatusService.getTxnStatusOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.txnStatusOptions = data);

    this.floorService.getFloors()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.floorOptions = data);

    this.tls11010Service.getBuildingOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.BUILDING_NO_Options = data);

    this.tls11010Service.getOrgOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });

    this.ECRNoService.getECRNo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.ECRNoOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });

    this.counterNameService.getCounters()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.CounterOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  // 報表模式

  private cleanFormPayload(payload: any): any {
    // 後端不吃 displayMode 的話可保留這行；若吃就刪
    delete payload.displayMode;

    // 清理空值
    for (const key in payload) {
      const val = payload[key];
      if (val === '' || val === null || (Array.isArray(val) && val.length === 0)) {
        payload[key] = null;
      }
    }

    // ECR_No 保證為陣列型別（若後端需要）
    if (!Array.isArray(payload.ECR_No)) {
      payload.ECR_No = payload.ECR_No == null ? [] : [payload.ECR_No];
    }

    if (payload['IsHaveTERM_No'] === 'Y') payload['IsHaveTERM_No'] = true;
    if (payload['IsHaveTERM_No'] === 'N') payload['IsHaveTERM_No'] = false;

    return {
      ...payload,
      pageSize: payload.pageSize ?? 30,
      pageIndex: (payload.pageIndex ?? 1) - 1,
      Offset: 0,
      OrderBy: '',
      SortBy: payload.SortBy ?? [{ field: 'ID', order: 1 }],
    };
  }

  goToReportMode(): void {
    if (!this.customPageSize || this.customPageSize <= 0) {
      this.customPageSize = 1000;
    }
    this.showPageSizeDialog = true;
  }

  confirmPageSizeAndNavigate(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      this.queryForm.markAllAsTouched();
      return;
    }

    const queryFormValue = this.cleanFormPayload({
      ...this.queryForm.value,
      pageSize: this.customPageSize,
    });

    this.loading = true;
    this.messageService.blockUi();

    this.tls23040Service
      .queryTLS23040(queryFormValue)
      .pipe(
        timeout(30000),
        catchError((err) => {
          if (err?.name === 'TimeoutError') {
            this.messageService.warnBubble('查詢時間過久，請嘗試縮小查詢條件範圍');
          } else {
            this.messageService.errorBubble('查詢失敗');
          }
          this.loading = false;
          this.messageService.unblockUi();
          return of({ Status: '9999', Data: [], Error: null, Meta: null, Message: '', TotalCount: 0, TotalPage: 0 });
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.Status === '0000') {
            const groups = res.Data || [];

            let dataToNavigate: InvoiceDetail[] | PaymentDetail[] | DiscountDetail[] = [];
            switch (this.displayMode) {
              case 'Report':
                dataToNavigate = groups.flatMap((g: any) => g.InvoiceDetail ?? []);
                break;
              case 'ByPaymentType':
                dataToNavigate = groups.flatMap((g: any) => g.PaymentDetail ?? []);
                break;
              case 'ByDiscountType':
                dataToNavigate = groups.flatMap((g: any) => g.DiscountDetail ?? []);
                break;
            }

            this.queryStateService.setQueryState(this.ProgNo, queryFormValue);

            this.router.navigate(['account/tls/tls23040cru'], {
              state: {
                queryFormValue,
                pageSize: this.customPageSize,
                data: dataToNavigate,
                displayMode: this.displayMode,
                totalCount: res.TotalCount,
                totalPage: res.TotalPage,
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
