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
import { Table2Component } from '@shared/componentkit/table2/table2.component';

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
    Table2Component, // ✅ 使用 table2 才能顯示總計/小計
  ],
})
export class TLS23090Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;

  // 檢視模式
  viewMode: 'credit' | 'counter' = 'credit';

  // 排序
  readonly defaultSortCredit = [
    { field: 'TXN_Date', order: 1 },
    { field: 'ECR_No',   order: 1 },
    { field: 'TXN_No',   order: 1 },
  ];
  readonly defaultSortCounter = [
    { field: 'TXN_Date', order: 1 },
    { field: 'ECR_No',   order: 1 },
    { field: 'tlt_no',   order: 1 },
  ];
  sortMeta: any[] = [];
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  // ✅ 不再帶 Offset / OrderBy；只保留 PageIndex / PageSize / SortBy
  private readonly includePagingAndSorting = true;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // 表單
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
    ...createPaginationConfig([
      { field: 'TXN_Date', order: 1 },
      { field: 'ECR_No',   order: 1 },
      { field: 'TXN_No',   order: 1 },
    ]),
  });

  // 選項
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

  // ====== 總計 / 小計 ======
  detailTotals: Record<string, number> = {};
  externalTotalFieldMap: Record<string, string> = {};
  // 信用卡明細視圖：欄位 -> API 總計鍵
  private readonly creditTotalFieldMap: Record<string, string> = {
    TXN_PayAmt:      'TotalPayAmt',
    TXN_Point:       'TotalPoint',
    EDC_InstHeadAmt: 'TotalInstHeadAmt',
    EDC_InstEachAmt: 'TotalInstEachAmt',
  };
  // 櫃位彙總視圖：欄位 -> 自行彙總鍵
  private readonly counterTotalFieldMap: Record<string, string> = {
    AE_Count: 'TOTAL_AE_Count', AE_Amount: 'TOTAL_AE_Amount',
    DA_Count: 'TOTAL_DA_Count', DA_Amount: 'TOTAL_DA_Amount',
    MASTER_Count: 'TOTAL_MASTER_Count', MASTER_Amount: 'TOTAL_MASTER_Amount',
    VISA_Count: 'TOTAL_VISA_Count', VISA_Amount: 'TOTAL_VISA_Amount',
    JCB_Count: 'TOTAL_JCB_Count', JCB_Amount: 'TOTAL_JCB_Amount',
    UnionPay_Count: 'TOTAL_UnionPay_Count', UnionPay_Amount: 'TOTAL_UnionPay_Amount',
    NCCC_Count: 'TOTAL_NCCC_Count', NCCC_Amount: 'TOTAL_NCCC_Amount',
    Others_Count: 'TOTAL_Others_Count', Others_Amount: 'TOTAL_Others_Amount',
    Total_Count: 'TOTAL_Total_Count', Total_Amount: 'TOTAL_Total_Amount',
  };

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

    // 初始排序與欄位（信用卡明細）
    this.sortMeta = this.defaultSortCredit.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });
    this.columns = this.columnsCredit;
    this.externalTotalFieldMap = { ...this.creditTotalFieldMap };

    // 選項
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
  }

  // ===== 表格 Lazy 事件（分頁 / 排序） =====
  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup): void {
    const currSort = JSON.stringify(form.value?.SortBy ?? []);
    const nextSort = JSON.stringify(event.SortBy ?? []);
    const nextPageIndex = currSort !== nextSort ? 1 : (event.pageIndex ?? form.value.pageIndex ?? 1);

    form.patchValue({
      pageIndex: nextPageIndex,
      pageSize : event.pageSize ?? form.value.pageSize,
      SortBy   : event.SortBy ?? form.value.SortBy,
    }, { emitEvent: false });

    this.sortMeta = (event.SortBy ?? []).map(s => ({ ...s }));

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

  // ===== 查詢 =====
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      const defaultSort = this.viewMode === 'counter'
        ? this.defaultSortCounter
        : this.defaultSortCredit;

      const sortByArr: any[] =
        (Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy :
         (this.sortMeta.length ? this.sortMeta : defaultSort)).map((s:any) => ({ ...s }));

      // 分頁（✅ 不帶 Offset / OrderBy）
      const pageSize  = Number.isFinite(val?.pageSize) ? Number(val.pageSize) : 10;
      const pageIndex = Number.isFinite(val?.pageIndex) ? Number(val.pageIndex) : 1;

      const payload = this.prune({
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

        IsHaveTERM_No: this.toBoolOrNull(val?.IsHaveTERM_No),
        TERM_No      : this.ensureArr(val?.TERM_No),
        Acquirer     : this.ensureArr(val?.Acquirer),
        Conn_Status  : (val?.ConnStatus ?? '') || undefined,

        // ✅ 僅保留這三個鍵
        PageSize: pageSize,
        PageIndex: pageIndex,
        SortBy: sortByArr,
      });

      this.loading = true;
      this.messageService?.blockUi();

      const call$ = this.viewMode === 'counter'
        ? this.tls23090Service.queryTLS23090CounterCard(payload)
        : this.tls23090Service.queryTLS23090(payload);

      call$.subscribe({
        next: (res) => {
          if (this.viewMode === 'counter') {
            // ================= 櫃位彙總 =================
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

            // 設定欄位與總計映射，並前端彙總
            this.columns = this.columnsCounter;
            this.externalTotalFieldMap = { ...this.counterTotalFieldMap };
            this.detailTotals = this.sumCounterTotals(this.data, this.counterTotalFieldMap);

            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
          } else {
            // ================= 信用卡明細 =================
            const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
            const flat  = wrappers.flatMap((x: any) => x?.tLS23090_CreditDetails ?? []);

            this.data = flat.map((row: any, idx: number) => ({
              ...row,
              _rowKey: `crt|${row?.TXN_Date ?? ''}|${row?.ECR_No ?? ''}|${row?.TXN_No ?? idx}`,
            }));

            this.columns = this.columnsCredit;
            this.externalTotalFieldMap = { ...this.creditTotalFieldMap };

            // 從所有 wrapper 聚合總計（避免多 wrapper 時遺漏）
            const totalsAgg = {
              TotalPayAmt: 0,
              TotalPoint: 0,
              TotalInstHeadAmt: 0,
              TotalInstEachAmt: 0,
            };
            for (const w of wrappers) {
              totalsAgg.TotalPayAmt      += Number(w?.TotalPayAmt ?? 0);
              totalsAgg.TotalPoint       += Number(w?.TotalPoint ?? 0);
              totalsAgg.TotalInstHeadAmt += Number(w?.TotalInstHeadAmt ?? 0);
              totalsAgg.TotalInstEachAmt += Number(w?.TotalInstEachAmt ?? 0);
            }
            this.detailTotals = totalsAgg;

            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;
          }
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.detailTotals = {};
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          this.messageService?.unblockUi();
        },
      });
    });
  }

  // 切換檢視模式
  onModeChange(): void {
    const nextDefault = this.viewMode === 'credit' ? this.defaultSortCredit : this.defaultSortCounter;
    this.columns = this.viewMode === 'credit' ? this.columnsCredit : this.columnsCounter;
    this.externalTotalFieldMap = this.viewMode === 'credit'
      ? { ...this.creditTotalFieldMap }
      : { ...this.counterTotalFieldMap };
    this.detailTotals = {};

    this.sortMeta = nextDefault.map(x => ({ ...x }));
    this.queryForm.patchValue({ pageIndex: 1, SortBy: this.sortMeta }, { emitEvent: false });

    // 重設簽章並查詢
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

  // 前端彙總（櫃位彙總視圖）
  private sumCounterTotals(rows: any[], map: Record<string, string>): Record<string, number> {
    const totals: Record<string, number> = {};
    Object.values(map).forEach(k => totals[k] = 0);
    rows.forEach(r => {
      Object.entries(map).forEach(([field, key]) => {
        totals[key] += Number(r?.[field] ?? 0);
      });
    });
    return totals;
  }

  // 欄位
  columns: any[] = [];
  private columnsCredit = [
    { field: 'TXN_Date', header: '銷售日期', format: (v: any) => this.formatDate(v), visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'CRD_Name', header: '信用卡卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號', visible: true },

    { field: 'TXN_PayAmt', header: '金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
    { field: 'TXN_Point', header: '紅利', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
    { field: 'TERM_No', header: '分期', visible: true },
    { field: 'TERM_Name', header: '分期期數', visible: true },
    { field: 'EDC_InstHeadAmt', header: '頭期款分期金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
    { field: 'EDC_InstEachAmt', header: '每期分期金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
  ];

  private columnsCounter = [
    { field: 'TXN_Date', header: '銷售日期', format: (v: any) => this.formatDate(v), visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },

    { field: 'AE_Count', header: 'AE 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'AE_Amount', header: 'AE 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'DA_Count', header: 'DA 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'DA_Amount', header: 'DA 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'MASTER_Count', header: 'MASTER 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'MASTER_Amount', header: 'MASTER 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'VISA_Count', header: 'VISA 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'VISA_Amount', header: 'VISA 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'JCB_Count', header: 'JCB 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'JCB_Amount', header: 'JCB 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'UnionPay_Count', header: '銀聯 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'UnionPay_Amount', header: '銀聯 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'NCCC_Count', header: 'NCCC 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'NCCC_Amount', header: 'NCCC 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'Others_Count', header: '其它 筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'Others_Amount', header: '其它 金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },

    { field: 'Total_Count', header: '總筆數', style: 'text-right', isTotal: true, visible: true },
    { field: 'Total_Amount', header: '總金額', style: 'text-right', format: (v: number) => this.money(v), isTotal: true, visible: true },
  ];
}
