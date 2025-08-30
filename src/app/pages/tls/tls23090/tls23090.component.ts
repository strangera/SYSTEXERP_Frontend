import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { TLS23090Service } from '../../../service/api/tls/tls23090.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { InstallmentPeriodService } from '../../../service/basic/installment-period.service';
import { AcquiringBankService } from '../../../service/basic/acquiring-bank.service';
import { ConnectionStatusService } from '../../../service/basic/connection-status.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls23090',
  templateUrl: './tls23090.component.html',
  styleUrls: ['./tls23090.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextComponent,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    TableComponent,
  ],
})
export class TLS23090Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;
  viewMode: 'credit' | 'counter' = 'credit';
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [],
    tlt_no: [],
    CRD_Type: [[]],
    CRD_No: [],
    TXN_PayAmt: [null],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    TERM_No: [],
    Acquirer: [[]],
    ConnStatus: [],
    IsHaveTERM_No: [null],
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
  });
  cardTypeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  WhetherOptions: any[] = [];
  installmentPeriodOptions: any[] = [];
  acquiringBankOptions: any[] = [];
  connectionStatusOptions: any[] = [
    { value: '1', label: '連線' },
    { value: '2', label: '離線' }
  ];




  constructor(
    private cardTypeService: CardTypeService,
    private tls23090Service: TLS23090Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private whetherService: WhetherService,
    private installmentPeriodService: InstallmentPeriodService,
    private acquiringBankService: AcquiringBankService,
    private connectionStatusService: ConnectionStatusService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23090', 'tls/tls23090', this.queryForm, (form) => this.onSubmit(form));
 this.columns = this.columnsCredit; // 預設顯示明細
    this.cardTypeService
      .getCardType().subscribe((data) => (this.cardTypeOptions = data));
    this.floorService
      .getFloors().subscribe((data) => (this.floorOptions = data));
    this.whetherService
      .getWhetherOptions().subscribe((data) => (this.WhetherOptions = data));
    this.tls11010Service
      .getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
    this.tls11010Service
      .getOrgOptions().subscribe((res) => {
        this.OrganizationCodeOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });
    this.ECRNoService.getECRNo().subscribe((res) => {
        this.ECRNoOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });
    this.counterNameService
      .getCounters().subscribe((res) => {
        this.CounterOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });
    this.installmentPeriodService
      .getInstallmentPeriods().subscribe((data) => (this.installmentPeriodOptions = data));
    this.acquiringBankService
      .getAcquiringBanks().subscribe((data) => (this.acquiringBankOptions = data));
   
  }


  
  // 送出查詢（無 doQuery / buildPayload）
private toIso(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  }
  private ensureArr = (v: any) => (Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]));
  private toBoolOrNull(v: any): boolean | null {
    if (typeof v === 'boolean') return v;
    if (v == null || v === '') return null;
    const s = String(v).toUpperCase();
    if (s === 'Y' || s === 'TRUE' || s === '1') return true;
    if (s === 'N' || s === 'FALSE' || s === '0') return false;
    return null;
  }
  money = (val: any) => Number(val || 0).toLocaleString('en-US');
  formatDate(val: string): string {
    const date = new Date(val);
    return isNaN(date.getTime())
      ? val
      : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
          .getDate()
          .toString()
          .padStart(2, '0')}`;
  }

  /** ✅ 完整 onSubmit（會依 viewMode 走不同 API，並攤平資料） */
onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const val = this.queryForm.getRawValue() as any;

    // 分頁 / 排序
const pageSize  = Number(val?.pageSize);        // ✅ 吃共用 table 丟上來的值
const pageIndex = Number(val?.pageIndex) || 1;  // 頁碼預設 1 沒問題
const offset    = pageSize ? Math.max(0, (pageIndex - 1) * pageSize) : 0; // 沒 pageSize 就 0
    const sortByArr = Array.isArray(val?.SortBy) && val.SortBy.length
      ? val.SortBy
      : [{ field: 'TXN_Date', order: 1 }];
    const orderBy   = sortByArr.map((s: any) => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`).join(',');

    // 共用 payload
    const ensureArr = (v: any) => Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]);
    const toIso = (x: any) => {
      if (!x) return undefined;
      const d = typeof x === 'string' ? new Date(x) : (x as Date);
      if (isNaN(d.getTime())) return undefined;
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
    };
    const toBoolOrNull = (v: any): boolean | null => {
      if (typeof v === 'boolean') return v;
      if (v == null || v === '') return null;
      const s = String(v).toUpperCase();
      if (s === 'Y' || s === 'TRUE' || s === '1') return true;
      if (s === 'N' || s === 'FALSE' || s === '0') return false;
      return null;
    };

    const common: any = {
      PageSize:   pageSize,
      PageIndex:  pageIndex,
      Offset:     offset,
      SortBy:     sortByArr,
      OrderBy:    orderBy,

      TXN_DateStart: toIso(val?.TXN_DateStart ?? this.yesterday),
      TXN_DateEnd:   toIso(val?.TXN_DateEnd   ?? this.yesterday),

      ECR_No:       ensureArr(val?.ECR_No),
      TLT_No:       ensureArr(val?.tlt_no),            // 表單 tlt_no → API 要 TLT_No
      CRD_Type:     ensureArr(val?.CRD_Type),
      CRD_No:       (val?.CRD_No ?? '') || undefined,
      TXN_PayAmt:   val?.TXN_PayAmt === '' || val?.TXN_PayAmt == null ? undefined : Number(val.TXN_PayAmt),

      tlt_building: (val?.tlt_building ?? '') || undefined,
      tlt_floor:    ensureArr(val?.tlt_floor),
      org_id:       ensureArr(val?.org_id),
    };

    // 兩個 API 會用到的剩餘鍵（命名依 CounterCard 規格）
    const extra = {
      IsHaveTERM_No: toBoolOrNull(val?.IsHaveTERM_No),
      TERM_No:       ensureArr(val?.TERM_No),
      Acquirer:      ensureArr(val?.Acquirer),
      Conn_Status:   (val?.ConnStatus ?? '') || undefined,
    };

    // 去空值
    const prune = (o: any) => {
      Object.keys(o).forEach(k => {
        const v = o[k];
        if (v === '' || v === null || v === undefined) delete o[k];
        if (Array.isArray(v) && v.length === 0) delete o[k];
      });
      return o;
    };

    const payload = prune({ ...common, ...extra });

    this.loading = true;
    this.messageService?.blockUi();

    const call$ = this.viewMode === 'counter'
      ? this.tls23090Service.queryTLS23090CounterCard(payload)
      : this.tls23090Service.queryTLS23090(payload);

    call$.subscribe({
      next: (res) => {
        if (this.viewMode === 'counter') {
          // 🚩 重點：CounterCard 可能是 Data.QueryData，也可能是 Data 直接是陣列（雙格式相容）
          const items: any[] =
            Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData :
            Array.isArray(res?.Data)            ? res.Data :
            [];

          const pick = (obj: any, brand: string, field: 'Count'|'Amount') =>
            Number(obj?.[brand]?.[field] ?? 0);

          this.data = items.map((r: any, i: number) => {
            const list = r?.CRD_Type_List || {};
            return {
              TXN_Date: r?.TXN_Date,
              ECR_No:   r?.ECR_No,
              tlt_no:   r?.tlt_no,
              tlt_name: r?.tlt_name,

              AE_Count:       pick(list,'AE','Count'),       AE_Amount:       pick(list,'AE','Amount'),
              DA_Count:       pick(list,'DA','Count'),       DA_Amount:       pick(list,'DA','Amount'),
              MASTER_Count:   pick(list,'MASTER','Count'),   MASTER_Amount:   pick(list,'MASTER','Amount'),
              VISA_Count:     pick(list,'VISA','Count'),     VISA_Amount:     pick(list,'VISA','Amount'),
              JCB_Count:      pick(list,'JCB','Count'),      JCB_Amount:      pick(list,'JCB','Amount'),
              UnionPay_Count: pick(list,'UnionPay','Count'), UnionPay_Amount: pick(list,'UnionPay','Amount'),
              NCCC_Count:     pick(list,'NCCC','Count'),     NCCC_Amount:     pick(list,'NCCC','Amount'),
              Others_Count:   pick(list,'Others','Count'),   Others_Amount:   pick(list,'Others','Amount'),
              Total_Count:    pick(list,'Total','Count'),    Total_Amount:    pick(list,'Total','Amount'),

              _rowKey: `cnt|${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
            };
          });

          // 你若要用 Summary 當頁腳總計，可在這裡存下來（看你的 TableComponent 是否支援）
          // this.backendTotals = res?.Data?.Summary ?? null;

          this.columns = this.columnsCounter;  // 切到彙總欄位
          this.totalRecords =
            typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
        } else {
          // 信用卡明細：攤平成 tLS23090_CreditDetails
          const packs = Array.isArray(res?.Data) ? res.Data : [];
          const flat  = packs.flatMap((x: any) => x?.tLS23090_CreditDetails ?? []);
          this.data = flat.map((row: any, i: number) => ({
            ...row,
            _rowKey: `crt|${row?.TXN_Date ?? ''}|${row?.ECR_No ?? ''}|${row?.TXN_No ?? ''}|${i}`,
          }));
          this.columns = this.columnsCredit;
          this.totalRecords =
            typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
        }
      },
      error: (err) => {
       
        this.data = [];
        this.totalRecords = 0;
         this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService?.unblockUi();
      },
    });
  });
}


  onModeChange(): void {
    this.columns = this.viewMode === 'credit' ? this.columnsCredit : this.columnsCounter;
    this.queryForm.patchValue({ pageIndex: 1 }, { emitEvent: false });
    this.onSubmit(this.queryForm);
  }
columns: any[] = [];               // 目前使用的欄位
  private columnsCredit = [          // 原本的明細欄位搬到這裡
    { field: 'TXN_Date', header: '銷售日期', format: this.formatDate },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'TXN_No', header: '交易序號' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
    { field: 'CRD_Name', header: '信用卡卡別' },
    { field: 'CRD_No', header: '信用卡卡號' },
    { field: 'TXN_PayAmt', header: '金額', style: 'text-right', format: (v: number) => this.money(v) },
    { field: 'TXN_Point', header: '紅利', style: 'text-right', format: (v: number) => this.money(v) },
    { field: 'TERM_No', header: '分期' },
    // { field: 'TXN_PeriodType', header: '分期期別' },
    { field: 'TERM_Name', header: '分期期數' },
    { field: 'EDC_InstHeadAmt', header: '頭期款分期金額', style: 'text-right', format: (v: number) => this.money(v) },
    { field: 'EDC_InstEachAmt', header: '每期分期金額', style: 'text-right', format: (v: number) => this.money(v) },
  ];

  // ✅ 新增：彙總欄位（依 API 結構展開 CRD_Type_List）
  private columnsCounter = [
    { field: 'TXN_Date', header: '銷售日期', format: this.formatDate },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱', style: 'text-left' },

    // 各卡別 Count/Amount
    { field: 'AE_Count', header: 'AE 筆數', style: 'text-right' },
    { field: 'AE_Amount', header: 'AE 金額', style: 'text-right', format: (v: number) => this.money(v) },

    { field: 'DA_Count', header: 'DA 筆數', style: 'text-right' },
    { field: 'DA_Amount', header: 'DA 金額', style: 'text-right', format: (v: number) => this.money(v) },

    { field: 'MASTER_Count', header: 'MASTER 筆數', style: 'text-right' },
    { field: 'MASTER_Amount', header: 'MASTER 金額', style: 'text-right', format: (v: number) => this.money(v) },

    { field: 'VISA_Count', header: 'VISA 筆數', style: 'text-right' },
    { field: 'VISA_Amount', header: 'VISA 金額', style: 'text-right', format: (v: number) => this.money(v) },

    { field: 'JCB_Count', header: 'JCB 筆數', style: 'text-right' },
    { field: 'JCB_Amount', header: 'JCB 金額', style: 'text-right', format: (v: number) => this.money(v) },

    { field: 'UnionPay_Count', header: '銀聯 筆數', style: 'text-right' },
    { field: 'UnionPay_Amount', header: '銀聯 金額', style: 'text-right', format: (v: number) => this.money(v) },

    { field: 'NCCC_Count', header: 'NCCC 筆數', style: 'text-right' },
    { field: 'NCCC_Amount', header: 'NCCC 金額', style: 'text-right', format: (v: number) => this.money(v) },

    { field: 'Others_Count', header: '其它 筆數', style: 'text-right' },
    { field: 'Others_Amount', header: '其它 金額', style: 'text-right', format: (v: number) => this.money(v) },

    { field: 'Total_Count', header: '總筆數', style: 'text-right' },
    { field: 'Total_Amount', header: '總金額', style: 'text-right', format: (v: number) => this.money(v) },
  ];

  // === 其餘原本屬性略（options、yesterday、queryForm 等）===
}
