import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { CarrierTypeService } from '../../../service/basic/carrier-type.service';
import { TLS23010Service } from '../../../service/api/tls/tls23010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { FloorService } from '../../../service/basic/floor.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CashierService } from '../../../service/basic/cashier.service';
import { Subscription, EMPTY, throwError, BehaviorSubject } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { timeout, catchError, finalize, debounceTime } from 'rxjs/operators';
// 既有 import 保留，新增這些


interface MainData {
  SYS_StoreNo: string;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  tlt_no?: string;
  tlt_name?: string;
  // 可依需求加更多欄位…
  [key: string]: any;
}

const now = new Date();


//型態別報表
@Component({
  selector: 'app-tls23010',
  templateUrl: './tls23010.component.html',
  styleUrls: ['./tls23010.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    PrimeTemplate,
    ButtonDirective,
    TranslateModule,
  ],
})
export class TLS23010Component extends BasicQueryPageComponent<any> {
  // ====== 1) 這些放在類別內屬性區 ======
  private readonly STORAGE_KEY = 'TLS23010:queryForm';
  private formValueSub?: Subscription;

  displayMode: 'Detail' | 'Summary' = 'Detail'; // 預設顯示明細報表
  querySubscription: Subscription | null = null;
  customPageSize = 1000;
  progressValue = 0;
  showPageSizeDialog = false;
  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();
  
   private readonly QUERY_TIMEOUT_MS = 30_000; // 30 秒


  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [[]], // ✅ 收銀機號 → 陣列
    TXN_No_Start: [null], // 交易序號(起)
    TXN_No_End: [null], // 交易序號(迄)
    TLT_No: [[]], // ✅ 專櫃編號 → 陣列
    TXN_GUIBegNo: [''], // 發票起始號碼
    TXN_GUIEndNo: [''], // 發票結束號碼
    TXN_Status: [[]], // ✅ 狀態 → 陣列
    TXN_FlagStatus: [[]], // ✅ 狀態旗標 → 陣列
    USR_No: [''], // 收銀員編號
    TXN_PreOrderNo: [''], // 預售/訂金編號
    TXN_PkngUID: [''], // 停車卡號
    TXN_MemCard: [''], // 會員卡號
    TXN_Uniform: [''], // 統一編號
    TXN_GUILoveCode: [''], // 愛心碼
    TXN_GUI_CarrType: [[]], // ✅ 載具種類 → 陣列
    TXN_GUI_CarrId: [''], // 載具號碼
    rece_yn: [''], // 是否開立業主發票 (s/空)
    cash_yn: [''], // 是否為業主收現 (s/空)
    tlt_building: [''], // 館別
    tlt_floor: [[]], // ✅ 樓層 → 陣列
    org_id: [[]], // ✅ 組織代碼 → 陣列
    TXN_Subtype: [''], // 交易附屬型態
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]), // 包含 PageSize, PageIndex, Offset, OrderBy, SortBy
  });


  // 下拉選單選項
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  TXN_SubtypeOptions: any[] = [];
  statusFlagOptions: any[] = [];
  whetherOptions: any[] = [];
  transactionSubTypeOptions: any[] = [];
  carrierTypeOptions: any[] = [];
  txnStatusOptions: any[] = [];
  cashierOptions: any[] = []; // 收銀員下拉選單
  ECRNoOptions: any[] = []; // 收銀機號下拉選單
  checkTotalAmount = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];
  CounterOptions: any[] = []; // 專櫃選項

  

  // 展開式表格的載入狀態
  expandLoading = false;
  //data為detailColumns 的data的data

  getYesNoLabel(value: any): string {
    return value === 'Y' ? '是' : value === 'N' ? '否' : value;
  }

  constructor(
    private tls23010Service: TLS23010Service,
    private statusFlagService: StatusFlagService,
    private whetherService: WhetherService,
    private TXN_SubtypeService: TXN_SubtypeService,
    private carrierTypeService: CarrierTypeService,
    private tls11010Service: Tls11010Service,
    private floorService: FloorService,
    private txnStatusService: TxnStatusService,
    private counterNameService: CounterNameService,
    private ECRNoService: ECRNoService,
    private cashierService: CashierService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23010', '', this.queryForm, 
    );

    this.restoreQueryFromStorage();
    this.formValueSub = this.queryForm.valueChanges
    .pipe(debounceTime(300))
    .subscribe(() => this.saveQueryToStorage());
    const savedQuery = localStorage.getItem('TLS23010_queryForm');
    if (savedQuery) {
      const parsedQuery = JSON.parse(savedQuery);
      this.queryForm.patchValue(parsedQuery);
    }

    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));

    this.statusFlagService
      .getStatusFlags()
      .subscribe((data) => (this.statusFlagOptions = data));
    this.whetherService
      .getWhetherOptions()
      .subscribe((data) => (this.whetherOptions = data));
    this.TXN_SubtypeService.getTXNSubtype().subscribe(
      (data) => (this.TXN_SubtypeOptions = data),
    );
    this.carrierTypeService
      .getCarrierType()
      .subscribe((data) => (this.carrierTypeOptions = data));
    this.tls11010Service
      .getBuildingOptions()
      .subscribe((res) => (this.BUILDING_NO_Options = res));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.txnStatusService
      .getTxnStatusOptions()
      .subscribe((data) => (this.txnStatusOptions = data));
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.cashierService.getCashierOptions().subscribe((res) => {
      this.cashierOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.customPageSize = 1000; // ✅ 強制設值
  }

/** 立即把目前表單狀態存進 LocalStorage（日期會轉 ISO 字串） */
private saveQueryToStorage(): void {
  const raw = this.queryForm.getRawValue();
  const payload = JSON.stringify(raw, (k, v) => (v instanceof Date ? v.toISOString() : v));
  localStorage.setItem(this.STORAGE_KEY, payload);
}


  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  goToReportMode(): void {
    if (!this.customPageSize || this.customPageSize <= 0) {
      this.customPageSize = 1000;
    }
    this.showPageSizeDialog = true;
  }
  fetchDetailData = async (payload: any): Promise<any[]> => {
    const { TXN_Date, ECR_No, TXN_No } = payload;

    const body = {
      TXN_DateStart: TXN_Date,
      TXN_DateEnd: TXN_Date,
      ECR_No: [ECR_No],
      TXN_No_Start: TXN_No,
      TXN_No_End: TXN_No,
      // ✅ 不需要 PageSize、PageIndex、Offset、OrderBy、SortBy
    };

    return new Promise((resolve) => {
      this.tls23010Service.queryTLS23010(body, 'Detail').subscribe({
        next: (res) => {
          const detailList = res?.Data?.[0]?.DetailList ?? [];
          resolve(detailList);
        },
        error: () => resolve([]),
      });
    });
  };
confirmPageSizeAndNavigate(): void {
  this.submitted = true;
  if (this.queryForm.invalid) {
    this.messageService.warnBubble('請確認欄位資料是否完整');
    this.queryForm.markAllAsTouched();
    return;
  }

  const rawFormValue = { ...this.queryForm.value };
  for (const key in rawFormValue) {
    const typedKey = key as keyof typeof rawFormValue;
    if (rawFormValue[typedKey] === '') rawFormValue[typedKey] = null;
  }

  const queryFormValue = { ...rawFormValue,pageSize: this.customPageSize, };

  // 若已有查詢在跑，先取消
  this.querySubscription?.unsubscribe();

  this.loading = true;
  this.messageService.blockUi();

  this.querySubscription = this.tls23010Service
    .queryTLS23010(queryFormValue, this.displayMode)
    .pipe(
      timeout(this.QUERY_TIMEOUT_MS),
      catchError((err) => {
        if (err?.name === 'TimeoutError') {
          this.messageService.warnBubble(
            '查詢逾時（30 秒）。請調整查詢條件後再試，例如：縮短日期區間、指定機號/專櫃、或輸入交易序號範圍。'
          );
          this.loading = false;
          this.messageService.unblockUi();
          this.showPageSizeDialog = false;
          return EMPTY;
        }
        return throwError(() => err);
      })
    )
    .subscribe({
      next: (res) => {
        if (res.Status === '0000') {
          const mainData = (res.Data || []).map((row: any) => ({
            ...row,
            TXN_Key: `${row.TXN_Date}_${row.ECR_No}_${row.TXN_No}`,
            DetailList: row.DetailList || [],
          }));

          this.queryStateService.setQueryState(this.ProgNo, queryFormValue);

          this.router
            .navigate(['account/tls/tls23010cru'], {
              state: {
                queryFormValue,
                data: mainData,
                pageSize: this.customPageSize,
                displayMode: this.displayMode,
              },
            })
            .then(() => {
              this.loading = false;
              this.messageService.unblockUi(); // ✅ 跳轉完成才解除
              this.showPageSizeDialog = false;
            });
        } else {
          this.messageService.errorBubble('查詢失敗');
          this.loading = false;
          this.messageService.unblockUi();
          this.showPageSizeDialog = false;
        }
      },
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
        this.loading = false;
        this.messageService.unblockUi();
        this.showPageSizeDialog = false;
      },
    });
}



  cancelQuery(): void {
    if (this.querySubscription) {
      this.querySubscription.unsubscribe();
      this.querySubscription = null;
    }
    this.loading = false;
    this.showPageSizeDialog = false;
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
onClearClick(): void {
  this.queryForm.reset({
    TXN_DateStart: this.yesterday,
    TXN_DateEnd: this.yesterday,
    ECR_No: null,
    TLT_No: null,
    TXN_Status: null,
    TXN_FlagStatus: null,
    TXN_GUI_CarrType: null,
    tlt_floor: null,
    org_id: null,
  });
  this.clearQueryStorage();
  this.messageService.infoBubble('已清除查詢條件');
}



}
