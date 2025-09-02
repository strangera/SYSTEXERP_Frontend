/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { InstallmentPeriodService } from '../../../service/basic/installment-period.service';
import { AcquiringBankService } from '../../../service/basic/acquiring-bank.service';
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

  // 兩種檢視
  viewMode: 'credit' | 'counter' = 'credit';

  // 預設排序（日期新到舊）
  readonly defaultSortCredit = [
    { field: 'TXN_Date', order: -1 },
    { field: 'ECR_No',   order: 1 },
    { field: 'TXN_No',   order: 1 },
  ];
  readonly defaultSortCounter = [
    { field: 'TXN_Date', order: -1 },
    { field: 'ECR_No',   order: 1 },
    { field: 'tlt_no',   order: 1 },
  ];

  // 當前表頭排序狀態（同步給 <app-table [multiSortMeta]>）
  sortMeta: any[] = [];

  // 僅避免重複查詢
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  // 若後端要接收分頁/排序，設 true（會帶 PageSize/PageIndex/Offset/SortBy/OrderBy）
  private readonly includePagingAndSorting = true;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // 查詢表單
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
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
    // 初始帶「信用卡明細」預設排序
    ...createPaginationConfig([
      { field: 'TXN_Date', order: -1 },
      { field: 'ECR_No',   order: 1 },
      { field: 'TXN_No',   order: 1 },
    ]),
  });

  // 下拉選單選項
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
    { value: '2', label: '離線' },
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
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23090', 'tls/tls23090cru', this.queryForm, (form) => this.onSubmit(form));

    // 初始化排序狀態（信用卡明細）
    this.sortMeta = this.defaultSortCredit.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });

    // 取選項
    this.cardTypeService.getCardType().subscribe(data => this.cardTypeOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.whetherService.getWhetherOptions().subscribe(data => this.WhetherOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.ECRNoService.getECRNo().subscribe(res => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.installmentPeriodService.getInstallmentPeriods().subscribe(data => this.installmentPeriodOptions = data);
    this.acquiringBankService.getAcquiringBanks().subscribe(data => this.acquiringBankOptions = data);

    // 預設顯示明細欄位
    this.columns = this.columnsCredit;
  }

  // ===== 表格 Lazy 事件（分頁 / 排序） =====
  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup): void {
    const currSort = JSON.stringify(form.value?.SortBy ?? []);
    const nextSort = JSON.stringify(event.SortBy ?? []);
    const nextPageIndex = currSort !== nextSort ? 1 : (event.pageIndex ?? form.value.pageIndex ?? 1);

    // 同步到表單（不觸發 valueChanges）
    form.patchValue({
      pageIndex: nextPageIndex,
      pageSize : event.pageSize ?? form.value.pageSize,
      SortBy   : event.SortBy ?? form.value.SortBy,
    }, { emitEvent: false });

    // 更新表頭排序狀態
    this.sortMeta = (event.SortBy ?? []).map(s => ({ ...s }));

    // 產生查詢簽章（避免重複呼叫）
    const sig = JSON.stringify({
      viewMode : this.viewMode,
      pageIndex: form.value.pageIndex,
      pageSize : form.value.pageSize,
      SortBy   : form.value.SortBy,
    });
    if (sig === this.lastQuerySig) return;
    this.lastQuerySig = sig;

    if (this.lazyTimer) clearTimeout(this.lazyTimer);
    this.lazyTimer = setTimeout(() => this.onSubmit(form), 0);
  }

  // ===== 送出查詢 =====
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      // 依當前檢視決定預設排序
      const defaultSort = this.viewMode === 'counter'
        ? this.defaultSortCounter
        : this.defaultSortCredit;

      // 排序來源：表單 → sortMeta → defaultSort
      const sortByArr: any[] =
        (Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy :
         (this.sortMeta.length ? this.sortMeta : defaultSort)).map((s:any) => ({ ...s }));

      const orderBy = sortByArr.length
        ? sortByArr.map(s => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`).join(',')
        : undefined;

      // 共同條件
      const common: any = {
        TXN_DateStart: this.toIso(val?.TXN_DateStart ?? this.yesterday),
        TXN_DateEnd  : this.toIso(val?.TXN_DateEnd   ?? this.yesterday),

        ECR_No     : this.ensureArr(val?.ECR_No),
        TLT_No     : this.ensureArr(val?.tlt_no),   // 表單 tlt_no → API TLT_No
        CRD_Type   : this.ensureArr(val?.CRD_Type),
        CRD_No     : (val?.CRD_No ?? '') || undefined,
        TXN_PayAmt : (val?.TXN_PayAmt === '' || val?.TXN_PayAmt == null)
                      ? undefined : Number(val.TXN_PayAmt),

        tlt_building: (val?.tlt_building ?? '') || undefined,
        tlt_floor   : this.ensureArr(val?.tlt_floor),
        org_id      : this.ensureArr(val?.org_id),
      };

      // 額外條件
      const extra = {
        IsHaveTERM_No: this.toBoolOrNull(val?.IsHaveTERM_No),
        TERM_No      : this.ensureArr(val?.TERM_No),
        Acquirer     : this.ensureArr(val?.Acquirer),
        Conn_Status  : (val?.ConnStatus ?? '') || undefined,
      };

      // 分頁/排序鍵
      const pageSize  = Number.isFinite(val?.pageSize) ? Number(val.pageSize) : 10;
      const pageIndex = Number.isFinite(val?.pageIndex) ? Number(val.pageIndex) : 1;
      const offset    = Math.max(0, (pageIndex - 1) * pageSize);

      const pagingSort: any = this.includePagingAndSorting ? {
        PageSize: pageSize,
        PageIndex: pageIndex,
        Offset: offset,
        SortBy: sortByArr,
        ...(orderBy ? { OrderBy: orderBy } : {}),
      } : {};

      // 組 payload（去除空值）
      const payload = this.prune({ ...common, ...extra, ...pagingSort });

      // 呼叫 API
      this.loading = true;
      this.messageService?.blockUi();

      const call$ = this.viewMode === 'counter'
        ? this.tls23090Service.queryTLS23090CounterCard(payload)
        : this.tls23090Service.queryTLS23090(payload);

      call$.subscribe({
        next: (res) => {
          if (this.viewMode === 'counter') {
            // 櫃位彙總
            const items: any[] =
              Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData :
              Array.isArray(res?.Data)            ? res.Data :
              [];

            const pick = (obj: any, brand: string, field: 'Count'|'Amount') =>
              Number(obj?.[brand]?.[field] ?? 0);

            this.data = items.map((r: any) => {
              const list = r?.CRD_Type_List || {};
              return {
                TXN_Date: r?.TXN_Date,
                ECR_No  : r?.ECR_No,
                tlt_no  : r?.tlt_no,
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

                _rowKey: `cnt|${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}`,
              };
            });

            this.columns = this.columnsCounter;
            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
          } else {
            // 信用卡明細
            const packs = Array.isArray(res?.Data) ? res.Data : [];
            const flat  = packs.flatMap((x: any) => x?.tLS23090_CreditDetails ?? []);
            this.data = flat.map((row: any, idx: number) => ({
              ...row,
              _rowKey: `crt|${row?.TXN_Date ?? ''}|${row?.ECR_No ?? ''}|${row?.TXN_No ?? idx}`,
            }));

            this.columns = this.columnsCredit;
            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
          }
        },
        error: () => {
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

  // 切換檢視模式 → 重設排序 + 回第一頁 + 重查
  onModeChange(): void {
    const nextDefault = this.viewMode === 'credit' ? this.defaultSortCredit : this.defaultSortCounter;
    this.columns = this.viewMode === 'credit' ? this.columnsCredit : this.columnsCounter;

    this.sortMeta = nextDefault.map(x => ({ ...x }));
    this.queryForm.patchValue({ pageIndex: 1, SortBy: this.sortMeta }, { emitEvent: false });

    // 重設簽章，避免卡住
    this.lastQuerySig = null;
    this.onSubmit(this.queryForm);
  }

  // ====== 工具 ======
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
  private prune<T extends Record<string, any>>(obj: T): T {
    const out: any = { ...obj };
    Object.keys(out).forEach((k) => {
      const v = out[k];
      if (v === '' || v === null || v === undefined) delete out[k];
      else if (Array.isArray(v) && v.length === 0) delete out[k];
      else if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) delete out[k];
    });
    return out as T;
  }

  // 欄位定義
  columns: any[] = [];
  private columnsCredit = [
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
    { field: 'TERM_Name', header: '分期期數' },
    { field: 'EDC_InstHeadAmt', header: '頭期款分期金額', style: 'text-right', format: (v: number) => this.money(v) },
    { field: 'EDC_InstEachAmt', header: '每期分期金額', style: 'text-right', format: (v: number) => this.money(v) },
  ];
  private columnsCounter = [
    { field: 'TXN_Date', header: '銷售日期', format: this.formatDate },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱', style: 'text-left' },

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


}
