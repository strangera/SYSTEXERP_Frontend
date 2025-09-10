/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { finalize, map } from 'rxjs/operators';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23040Service } from '../../../service/api/tls/tls23040.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import {
  createPaginationConfig,
  LazyLoadEvent,
} from '../../../shared/componentkit/table/table.model';
import { CounterNameService } from '../../../service/basic/counter-name.service';

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
import { TranslateModule } from '@ngx-translate/core';
import { Table2Component } from '@shared/componentkit/table2/table2.component';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tls23040',
  templateUrl: './tls23040.component.html',
  styleUrls: ['./tls23040.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    TranslateModule,
    Table2Component,
    ButtonModule, // ✅ p-button
  ],
})
export class TLS23040Component extends BasicQueryPageComponent<any> {
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  // === 視圖切換 ===
  viewMode: 'invoice' | 'payment' | 'discount' = 'invoice';

  // === 三組資料 ===
  invoiceRows: any[] = [];
  paymentRows: any[] = [];
  discountRows: any[] = [];

  // === 畫面資料 ===
  get activeData() {
    return this.viewMode === 'payment'
      ? this.paymentRows
      : this.viewMode === 'discount'
      ? this.discountRows
      : this.invoiceRows;
  }
  get activeColumns() {
    return this.viewMode === 'payment'
      ? this.paymentColumns
      : this.viewMode === 'discount'
      ? this.discountColumns
      : this.invoiceColumns;
  }

  // 群組欄位 / 小計是否顯示（依視圖）
  activeGroupBy = '';                 // invoice: '', payment: 'PAY_NO', discount: 'TXN_DiscCode'
  activeShowSubTotal = false;         // invoice: false, others: true

  // 給 Table2 的加總容器（動態視圖專用）
  activeExternalTotals: Record<string, number> = {};
  activeExternalTotalFieldMap: Record<string, string> = {};
  activeExternalSubtotals: Record<string, Record<string, number>> = {};
  activeExternalSubtotalFieldMap: Record<string, string> = {};

  totalRecords = 0;

  // 排序
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [
    { field: 'TXN_Date', order: 1 },
    { field: 'ECR_No', order: 1 },
    { field: 'TXN_No', order: 1 },
  ];

  // 匯出控制
  btnLoading = false;
  historyRequestBody: any | null = null; // ✅ 記錄最後查詢 payload（匯出沿用）

  // 控制項
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
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [],
    TXN_Status: [],
    TXN_FlagStatus: [],
    TXN_PkngUID: [''],
    TXN_MemCard: [''],
    TXN_GUIBegNo: [''],
    tlt_building: [''],
    tlt_floor: [],
    org_id: [],
    ...createPaginationConfig([
      { field: 'TXN_Date', order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
    ]),
  });

  // 下拉
  statusFlagOptions: any[] = [];
  TXN_SubtypeOptions: any[] = [];
  txnStatusOptions: any[] = [
    { value: '1', label: '正常交易' },
    { value: '2', label: '作廢' },
    { value: '3', label: '退貨' },
  ];
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
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
    this.initializePage('TLS23040', 'tls/tls23040cru', this.queryForm, (form) =>
      this.onSubmit(form),
    );
    this.sortMeta = this.defaultSort.map((x) => ({ ...x }));

    this.statusFlagService.getStatusFlags().subscribe((d) => (this.statusFlagOptions = d));
    this.TXN_SubtypeService.getTXNSubtype().subscribe((d) => (this.TXN_SubtypeOptions = d));
    this.floorService.getFloors().subscribe((d) => (this.floorOptions = d));
    this.tls11010Service.getBuildingOptions().subscribe((d) => (this.BUILDING_NO_Options = d));

    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  // 提供給 Table2 的 lazy 載入
fetchTLS23040 = (evt: LazyLoadEvent) => {
  const raw = this.queryForm.getRawValue() as any;

  // ---- 小工具 ----
  const toIso = (x: any) => {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
  };
  const ensureArr = (v: any) =>
    Array.isArray(v) ? v : v == null || v === '' ? [] : [v];
  const toNumOrUndef = (v: any) =>
    v == null || v === '' || isNaN(Number(v)) ? undefined : Number(v);

  // ---- 分頁/排序（事件優先，其次表單/預設） ----
  const pageIndex = Number.isFinite(evt?.pageIndex) ? Number(evt!.pageIndex) : Number(raw?.pageIndex ?? 1);
  const pageSize  = Number.isFinite(evt?.pageSize)  ? Number(evt!.pageSize)  : Number(raw?.pageSize  ?? 20);

  const uiSortBy = this.ensureGroupFirst(
    Array.isArray((evt as any)?.SortBy) && (evt as any).SortBy.length
      ? (evt as any).SortBy
      : (Array.isArray(raw?.SortBy) && raw.SortBy.length ? raw.SortBy : this.defaultSort)
  );
  const sortBy = uiSortBy; // 此頁 API 就吃同一組排序規則

  // ---- 組 payload（與 onSubmit 對齊） ----
  const payload: any = {
    TXN_DateStart: toIso(raw?.TXN_DateStart ?? this.yesterday),
    TXN_DateEnd:   toIso(raw?.TXN_DateEnd   ?? this.yesterday),

    ...(ensureArr(raw?.ECR_No    ).length ? { ECR_No: ensureArr(raw?.ECR_No) } : {}),
    ...(ensureArr(raw?.TLT_No    ).length ? { TLT_No: ensureArr(raw?.TLT_No) } : {}),
    ...(ensureArr(raw?.TXN_Status).length ? { TXN_Status: ensureArr(raw?.TXN_Status) } : {}),
    ...(ensureArr(raw?.TXN_FlagStatus).length ? { TXN_FlagStatus: ensureArr(raw?.TXN_FlagStatus) } : {}),
    ...(ensureArr(raw?.tlt_floor ).length ? { tlt_floor: ensureArr(raw?.tlt_floor) } : {}),
    ...(ensureArr(raw?.org_id    ).length ? { org_id: ensureArr(raw?.org_id) } : {}),

    ...(raw?.tlt_building ? { tlt_building: raw.tlt_building } : {}),
    ...(raw?.TXN_PkngUID  ? { TXN_PkngUID:  raw.TXN_PkngUID  } : {}),
    ...(raw?.TXN_MemCard  ? { TXN_MemCard:  raw.TXN_MemCard  } : {}),
    ...(raw?.TXN_GUIBegNo ? { TXN_GUIBegNo: raw.TXN_GUIBegNo } : {}),

    ...(toNumOrUndef(raw?.TXN_No_Start) != null ? { TXN_No_Start: toNumOrUndef(raw?.TXN_No_Start) } : {}),
    ...(toNumOrUndef(raw?.TXN_No_End)   != null ? { TXN_No_End:   toNumOrUndef(raw?.TXN_No_End)   } : {}),

    pageIndex,
    pageSize,
    SortBy: sortBy,
  };

  // ---- 呼叫 API ----
  return this.tls23040Service.queryTLS23040(payload).pipe(
    map((res: any) => {
      const packs: any[] = Array.isArray(res?.Data) ? res.Data : [];

      // ========= 依回傳包裝展平三類明細 =========
      const inv = packs.flatMap(p =>
        Array.isArray(p?.invoice?.InvoiceDetail) ? p.invoice.InvoiceDetail : []
      ).map((r: any, i: number) => {
        const isNormal = String(r?.TXN_StatusName ?? '') === '正常交易';
        return {
          ...r,
          ORG_TXN_Date: isNormal ? '' : (r?.ORG_TXN_Date ?? ''),
          ORG_ECR_No : isNormal ? '' : (r?.ORG_ECR_No  ?? ''),
          ORG_TXN_No : isNormal ? '' : (r?.ORG_TXN_No  ?? ''),
          _rowKey: `inv|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
        };
      });

      const pay = packs.flatMap(p =>
        Array.isArray(p?.payment?.PaymentDetail) ? p.payment.PaymentDetail : []
      ).map((r: any, i: number) => ({
        ...r,
        _rowKey: `pay|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
      }));

      const disc = packs.flatMap(p =>
        Array.isArray(p?.discount?.DiscountDetail) ? p.discount.DiscountDetail : []
      ).map((r: any, i: number) => ({
        ...r,
        _rowKey: `disc|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
      }));

      // ========= 依視圖決定 rows / 群組 / 總計&小計 =========
      let rows: any[] = [];
      let externalTotals: Record<string, number> = {};
      let externalSubtotals: Record<string, Record<string, number>> = {};

      if (this.viewMode === 'invoice') {
        this.activeGroupBy = '';
        this.activeShowSubTotal = false;

        rows = inv;

        const guiSum  = inv.reduce((s, r) => s + (Number(r?.TXN_TotGUI    ?? 0)), 0);
        const saleSum = inv.reduce((s, r) => s + (Number(r?.TXN_TotSaleAmt ?? 0)), 0);

        externalTotals = {
          Total_TXN_TotGUI: guiSum,
          Total_TXN_TotSaleAmt: saleSum,
        };

        this.activeExternalTotalFieldMap = {
          TXN_TotGUI: 'Total_TXN_TotGUI',
          TXN_TotSaleAmt: 'Total_TXN_TotSaleAmt',
        };
        this.activeExternalSubtotalFieldMap = {};
      }
      else if (this.viewMode === 'payment') {
        this.activeGroupBy = 'PAY_NO';
        this.activeShowSubTotal = true;

        rows = pay;

        const totalAmt = pay.reduce((s, r) => s + (Number(r?.TXN_PayAmt ?? 0)), 0);
        externalTotals = { Total_TXN_PayAmt: totalAmt };

        // 依 PAY_NO 聚合小計
        const sub: Record<string, Record<string, number>> = {};
for (const r of pay) {
  const g = String(r?.PAY_NO ?? 'UNKNOWN');
  const bucket = (sub[g] = sub[g] || { ['SubTotal_TXN_PayAmt']: 0 } as Record<string, number>);
  bucket['SubTotal_TXN_PayAmt'] = (bucket['SubTotal_TXN_PayAmt'] || 0) + Number(r?.TXN_PayAmt ?? 0);
}
externalSubtotals = sub;


        this.activeExternalTotalFieldMap    = { TXN_PayAmt: 'Total_TXN_PayAmt' };
        this.activeExternalSubtotalFieldMap = { TXN_PayAmt: 'SubTotal_TXN_PayAmt' };
      }
      else { // discount
        this.activeGroupBy = 'TXN_DiscCode';
        this.activeShowSubTotal = true;

        rows = disc;

        const salePrc = disc.reduce((s, r) => s + (Number(r?.PLU_SalePrc ?? 0)), 0);
        const net     = disc.reduce((s, r) => s + (Number(r?.TXN_Net     ?? 0)), 0);
        const tax     = disc.reduce((s, r) => s + (Number(r?.TXN_Tax     ?? 0)), 0);

        externalTotals = {
          Total_PLU_SalePrc: salePrc,
          Total_TXN_Net:     net,
          Total_TXN_Tax:     tax,
        };

        const sub: Record<string, Record<string, number>> = {};
        for (const r of disc) {
          const g = String(r?.TXN_DiscCode ?? 'UNKNOWN');
          const bucket = (sub[g] = sub[g] || { SubTotal_SalePrc: 0, SubTotal_Net: 0, SubTotal_Tax: 0 });
 bucket['SubTotal_SalePrc'] = (bucket['SubTotal_SalePrc'] || 0) + Number(r?.PLU_SalePrc ?? 0);
  bucket['SubTotal_Net']     = (bucket['SubTotal_Net']     || 0) + Number(r?.TXN_Net     ?? 0);
  bucket['SubTotal_Tax']     = (bucket['SubTotal_Tax']     || 0) + Number(r?.TXN_Tax     ?? 0);
        }
        externalSubtotals = sub;

        this.activeExternalTotalFieldMap = {
          PLU_SalePrc: 'Total_PLU_SalePrc',
          TXN_Net:     'Total_TXN_Net',
          TXN_Tax:     'Total_TXN_Tax',
        };
        this.activeExternalSubtotalFieldMap = {
          PLU_SalePrc: 'SubTotal_SalePrc',
          TXN_Net:     'SubTotal_Net',
          TXN_Tax:     'SubTotal_Tax',
        };
      }

      // 將狀態同步給畫面（若你的 template 有綁定這些 map / groupBy）
      this.activeExternalTotals       = externalTotals;
      this.activeExternalSubtotals    = externalSubtotals;

      // 回傳給 Table2
      const totalRecords =
        Number(res?.TotalCount ?? rows.length ?? 0);

      return {
        rows,
        totalRecords,
        externalTotals,
        externalSubtotals,
      };
    })
  );
};


  /** 送出查詢（不包含 Offset/OrderBy） */
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const raw = this.queryForm.getRawValue() as any;
      const toIso = (x: any) => {
        if (!x) return undefined;
        const d = typeof x === 'string' ? new Date(x) : (x as Date);
        if (isNaN(d.getTime())) return undefined;
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 19);
      };

      const pageSize = Number(raw?.pageSize) || 10;
      const pageIndex = Number(raw?.pageIndex) || 1;
      const sortByArr =
        Array.isArray(raw?.SortBy) && raw.SortBy.length
          ? raw.SortBy
          : (this.sortMeta.length ? this.sortMeta : this.defaultSort);

      // ✅ 組 payload：不放 Offset/OrderBy
      const payload: any = {
        TXN_DateStart: toIso(raw?.TXN_DateStart ?? this.yesterday),
        TXN_DateEnd: toIso(raw?.TXN_DateEnd ?? this.yesterday),
        ...(raw?.ECR_No?.length ? { ECR_No: raw.ECR_No } : {}),
        ...(raw?.TLT_No?.length ? { TLT_No: raw.TLT_No } : {}),
        ...(raw?.TXN_Status?.length ? { TXN_Status: raw.TXN_Status } : {}),
        ...(raw?.TXN_FlagStatus?.length ? { TXN_FlagStatus: raw.TXN_FlagStatus } : {}),
        ...(raw?.tlt_floor?.length ? { tlt_floor: raw.tlt_floor } : {}),
        ...(raw?.org_id?.length ? { org_id: raw.org_id } : {}),
        ...(raw?.tlt_building ? { tlt_building: raw.tlt_building } : {}),
        ...(raw?.TXN_PkngUID ? { TXN_PkngUID: raw.TXN_PkngUID } : {}),
        ...(raw?.TXN_MemCard ? { TXN_MemCard: raw.TXN_MemCard } : {}),
        ...(raw?.TXN_GUIBegNo ? { TXN_GUIBegNo: raw.TXN_GUIBegNo } : {}),
        ...(raw?.TXN_No_Start != null && raw?.TXN_No_Start !== '' ? { TXN_No_Start: Number(raw.TXN_No_Start) } : {}),
        ...(raw?.TXN_No_End   != null && raw?.TXN_No_End   !== '' ? { TXN_No_End:   Number(raw.TXN_No_End)   } : {}),
        pageIndex,
        pageSize,
        SortBy: sortByArr,
      };

      // ✅ 匯出沿用同一包參數
      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23040Service.queryTLS23040(payload).subscribe({
        next: (res) => {
          const packs = Array.isArray(res?.Data) ? res.Data : [];

          // ===== Flatten 三種明細 =====
          const invoiceDetails = packs.flatMap((p: any) =>
            Array.isArray(p?.invoice?.InvoiceDetail) ? p.invoice.InvoiceDetail : [],
          );
          this.invoiceRows = invoiceDetails.map((r: any, i: number) => {
            const isNormal = String(r?.TXN_StatusName ?? '') === '正常交易';
            return {
              ...r,
              ORG_TXN_Date: isNormal ? '' : r?.ORG_TXN_Date ?? '',
              ORG_ECR_No: isNormal ? '' : r?.ORG_ECR_No ?? '',
              ORG_TXN_No: isNormal ? '' : r?.ORG_TXN_No ?? '',
              _rowKey: `inv|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
            };
          });

          const paymentDetails = packs.flatMap((p: any) =>
            Array.isArray(p?.payment?.PaymentDetail) ? p.payment.PaymentDetail : [],
          );
          this.paymentRows = paymentDetails.map((r: any, i: number) => ({
            ...r,
            _rowKey: `pay|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
          }));

          const discountDetails = packs.flatMap((p: any) =>
            Array.isArray(p?.discount?.DiscountDetail) ? p.discount.DiscountDetail : [],
          );
          this.discountRows = discountDetails.map((r: any, i: number) => ({
            ...r,
            _rowKey: `disc|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
          }));

          // 更新總筆數（如果後端沒給就用目前視圖筆數）
          this.totalRecords = Number(res?.TotalCount ?? this.activeData.length ?? 0);

          // 依目前視圖重算 總計/小計 + 群組鍵
          this.recomputeAggregatesForView();
        },
        error: () => {
          this.invoiceRows = [];
          this.paymentRows = [];
          this.discountRows = [];
          this.totalRecords = 0;

          this.activeExternalTotals = {};
          this.activeExternalSubtotals = {};
        },
        complete: () => {
          this.loading = false;
          this.messageService?.unblockUi();
        },
      });
    });
  }

  onViewChange() {
    this.recomputeAggregatesForView();
    this.totalRecords = this.activeData.length;
  }

  /** 依視圖建立 totals/subtotals 與群組欄位/是否顯示小計 */
  private recomputeAggregatesForView() {
    // 1) 預設清空
    this.activeExternalTotals = {};
    this.activeExternalTotalFieldMap = {};
    this.activeExternalSubtotals = {};
    this.activeExternalSubtotalFieldMap = {};
    this.activeGroupBy = '';
    this.activeShowSubTotal = false;

    if (this.viewMode === 'invoice') {
      // ---- 發票：僅總計（不分組）----
      const guiSum = this.invoiceRows.reduce((s, r) => s + Number(r?.TXN_TotGUI ?? 0), 0);
      const saleSum = this.invoiceRows.reduce((s, r) => s + Number(r?.TXN_TotSaleAmt ?? 0), 0);

      this.activeExternalTotals = {
        Total_TXN_TotGUI: guiSum,
        Total_TXN_TotSaleAmt: saleSum,
      };
      this.activeExternalTotalFieldMap = {
        TXN_TotGUI: 'Total_TXN_TotGUI',
        TXN_TotSaleAmt: 'Total_TXN_TotSaleAmt',
      };
      // 無小計/群組
      this.activeGroupBy = '';
      this.activeShowSubTotal = false;
      return;
    }

    if (this.viewMode === 'payment') {
      // ---- 付款：以 PAY_NO 分組；金額小計/總計 ----
      this.activeGroupBy = 'PAY_NO';
      this.activeShowSubTotal = true;

      const totalAmt = this.paymentRows.reduce((s, r) => s + Number(r?.TXN_PayAmt ?? 0), 0);
      this.activeExternalTotals = { Total_TXN_PayAmt: totalAmt };
      this.activeExternalTotalFieldMap = { TXN_PayAmt: 'Total_TXN_PayAmt' };

      // 小計（以 PAY_NO 聚合）
      const sub: Record<string, Record<string, number>> = {};
      for (const row of this.paymentRows) {
        const g = String(row?.PAY_NO ?? 'UNKNOWN');
        sub[g] = sub[g] || { SubTotal_TXN_PayAmt: 0 };
        sub[g]['SubTotal_TXN_PayAmt'] =
          (sub[g]['SubTotal_TXN_PayAmt'] || 0) + Number(row?.TXN_PayAmt ?? 0);
      }
      this.activeExternalSubtotals = sub;
      this.activeExternalSubtotalFieldMap = { TXN_PayAmt: 'SubTotal_TXN_PayAmt' };
      return;
    }

    // ---- 折扣：以 TXN_DiscCode 分組；三欄小計/總計 ----
    this.activeGroupBy = 'TXN_DiscCode';
    this.activeShowSubTotal = true;

    const totalSalePrc = this.discountRows.reduce((s, r) => s + Number(r?.PLU_SalePrc ?? 0), 0);
    const totalNet = this.discountRows.reduce((s, r) => s + Number(r?.TXN_Net ?? 0), 0);
    const totalTax = this.discountRows.reduce((s, r) => s + Number(r?.TXN_Tax ?? 0), 0);

    this.activeExternalTotals = {
      Total_PLU_SalePrc: totalSalePrc,
      Total_TXN_Net: totalNet,
      Total_TXN_Tax: totalTax,
    };
    this.activeExternalTotalFieldMap = {
      PLU_SalePrc: 'Total_PLU_SalePrc',
      TXN_Net: 'Total_TXN_Net',
      TXN_Tax: 'Total_TXN_Tax',
    };

    const sub: Record<string, Record<string, number>> = {};
    for (const row of this.discountRows) {
      const g = String(row?.TXN_DiscCode ?? 'UNKNOWN');
      const bucket = (sub[g] = sub[g] || {
        SubTotal_SalePrc: 0,
        SubTotal_Net: 0,
        SubTotal_Tax: 0,
      } as Record<string, number>);
      bucket['SubTotal_SalePrc'] =
        (bucket['SubTotal_SalePrc'] || 0) + Number(row?.PLU_SalePrc ?? 0);
      bucket['SubTotal_Net'] = (bucket['SubTotal_Net'] || 0) + Number(row?.TXN_Net ?? 0);
      bucket['SubTotal_Tax'] = (bucket['SubTotal_Tax'] || 0) + Number(row?.TXN_Tax ?? 0);
    }
    this.activeExternalSubtotals = sub;
    this.activeExternalSubtotalFieldMap = {
      PLU_SalePrc: 'SubTotal_SalePrc',
      TXN_Net: 'SubTotal_Net',
      TXN_Tax: 'SubTotal_Tax',
    };
  }

  /** 群組欄位優先排序（invoice 無群組會原樣返回） */
  private ensureGroupFirst(sortBy: any[] | undefined): any[] {
    const g = this.activeGroupBy;
    if (!g) return Array.isArray(sortBy) ? [...sortBy] : [];
    const list = Array.isArray(sortBy) ? [...sortBy] : [];
    const exist = list.find((s) => s.field === g);
    const rest = list.filter((s) => s.field !== g);
    const order = exist?.order ?? 1;
    return [{ field: g, order }, ...rest];
  }

  // ===== 匯出：產出「發票報表」 =====
  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    if (this.invoiceRows.length === 0) {
      this.messageService?.warnBubble?.('目前沒有發票明細可匯出。');
      return;
    }
    this.btnLoading = true;
    this.tls23040Service
      .exportTLS23040PDF(this.historyRequestBody)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (response: HttpResponse<Blob>) => this.handleFileExport(response, '.pdf'),
      });
  }

  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    if (this.invoiceRows.length === 0) {
      this.messageService?.warnBubble?.('目前沒有發票明細可匯出。');
      return;
    }
    this.btnLoading = true;
    this.tls23040Service
      .exportTLS23040Excel(this.historyRequestBody)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (response: HttpResponse<Blob>) => this.handleFileExport(response, '.xlsx'),
      });
  }

  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
        return decoded;
      } catch {
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }

  // ===== 欄位 =====
  private formatDate(val: string): string {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }
  private formatNumber(val: number): string {
    return Number(val ?? 0).toLocaleString('en-US');
  }
  private getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  // === 發票明細 ===
  invoiceColumns = [
    {
      field: 'TXN_Date',
      header: '銷售日期',
      visible: true,
      format: (val: string) => this.formatDate(val),
    },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'gui_track', header: '發票起始號碼(字軌)', visible: true },
    { field: 'GUIBegNo', header: '發票起始號碼', visible: true },
    { field: 'GUIEndNo', header: '發票結束號碼', visible: true },

    // ✅ 總計（不顯示小計）
    {
      field: 'TXN_TotGUI',
      header: '發票金額',
      visible: true,
      isTotal: true,
      style: 'text-right',
      format: (val: number) => this.formatNumber(val),
    },
    {
      field: 'TXN_TotSaleAmt',
      header: '業績金額',
      visible: true,
      isTotal: true,
      style: 'text-right',
      format: (val: number) => this.formatNumber(val),
    },

    {
      field: 'TXN_StatusName',
      header: '交易型態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.txnStatusOptions),
    },
    { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true },
    { field: 'USR_No', header: '收銀員', visible: true },
    { field: 'TXN_PkngUID', header: '停車卡號', visible: true },
    {
      field: 'ORG_TXN_Date',
      header: '原交易日期',
      visible: true,
      format: (val: string) => this.formatDate(val),
    },
    { field: 'ORG_ECR_No', header: '原收銀機號', visible: true },
    { field: 'ORG_TXN_No', header: '原交易序號', visible: true },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    {
      field: 'TXN_TotPayScoreAmt',
      header: '會員積點折抵',
      visible: true,
      style: 'text-right',
      format: (val: number) => this.formatNumber(val),
    },
  ];

  // === 付款明細 ===
  paymentColumns = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: string) => this.formatDate(v) },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'PAY_NO', header: '付款別代號', visible: true },
    { field: 'PAY_NAME', header: '付款別', visible: true },
    {
      field: 'TXN_PayAmt',
      header: '金額',
      visible: true,
      isTotal: true,
      isSubTotal: true,
      style: 'text-right',
      format: (val: number) => this.formatNumber(val),
    },
    { field: 'CRD_Name', header: '信用卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號/條碼', visible: true, style: 'text-right' },
    { field: 'TERM_No', header: '分期', visible: true },
  ];

  // === 折扣/金額明細 ===
  discountColumns = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: string) => this.formatDate(v) },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },

    // ✅ 三欄：小計 + 總計
    {
      field: 'PLU_SalePrc',
      header: '單項售價',
      visible: true,
      isTotal: true,
      isSubTotal: true,
      style: 'text-right',
      format: (val: number) => this.formatNumber(val),
    },
    {
      field: 'TXN_Net',
      header: '未稅(免稅)金額',
      visible: true,
      isTotal: true,
      isSubTotal: true,
      style: 'text-right',
      format: (val: number) => this.formatNumber(val),
    },
    {
      field: 'TXN_Tax',
      header: '稅額',
      visible: true,
      isTotal: true,
      isSubTotal: true,
      style: 'text-right',
      format: (val: number) => this.formatNumber(val),
    },

    { field: 'tlt_id_desc', header: '商品抽成類別', visible: true },
    { field: 'TXN_DiscCode', header: '歸屬折扣代號', visible: true },
    { field: 'TXN_DiscName', header: '歸屬折扣名稱', visible: true },
    { field: 'PLU_TaxTypeName', header: '稅別名稱', visible: true },
    { field: 'PLU_MagNo', header: '單品編號', visible: true },
    { field: 'TXN_StatusName', header: '狀態', visible: true },
  ];
}
