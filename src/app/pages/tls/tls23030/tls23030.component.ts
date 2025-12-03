/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, finalize, map, timeout } from 'rxjs/operators';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { TLS23030Service, TLS23030SumPayNoRow } from '../../../service/api/tls/tls23030.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { DropDownListService } from '@service/utility/dropDownList.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// UI components
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';

import { getSYS1000Options } from '@service/system/sys1000.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';

// === 總計欄位鍵（給 footerData 用）===
const TOTAL_FIELD_MAP = {
  TXN_PayAmt: 'Total_TXN_PayAmt',
  TXN_TaxAlwnc: 'Total_TXN_TaxAlwnc',
} as const;

@UntilDestroy()
@Component({
  selector: 'app-tls23030',
  standalone: true,
  templateUrl: './tls23030.component.html',
  styleUrls: ['./tls23030.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DecimalPipe,

    // UI
    MenubarComponent,
    AccordionModule,
    CheckboxModule,
    ButtonModule,
    DialogModule,
    RadioButtonModule,
    TranslateModule,

    // Form widgets
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    InputTextComponent,
    ButtonComponent,
    InputTextRangeComponent,

    // Table
    TableReportComponent,
  ],
})
export class TLS23030Component extends BasicQueryPageComponent<any> {
  // 狀態
  data: any[] = [];               // 明細資料
  totalRecords = 0;               // 明細總筆數
  summaryData: any[] = [];        // 彙總明細資料
  summaryTotals = { totalPayAmt: 0, totalTaxAlwnc: 0 };

  // 明細表總計列（新增）
  detailFooter: Record<string, any> | undefined = undefined;

  // 付款別彙總（小表）
  paymentSummary: TLS23030SumPayNoRow[] = [];
  private paymentSummaryTotal = 0;

  btnLoading = false;
  historyRequestBody: any | null = null;

  // 表單
  readonly yesterday: Date = (() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 1); return d;
  })();
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [],
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [],
    PAY_NO: [] as string[],
    TXN_PayAmt_Start: [null],
    TXN_PayAmt_End: [null],
    TXN_Status: [],
    TXN_MemCard: [''],
    CRD_Type: [],
    CRD_No: [''],
    IsHaveTERM_No: [],
    pay_taxtype: [''],
    org_id: [],
    VOU_Check: false,
    rece_yn: [''],
    cash_yn: [''],
    tlt_building: [''],
    tlt_floor: [],
    showSummary: [false],
    ...createPaginationConfig([
      { field: 'TXN_Date', order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
    ]),
  });
  // 小計 map（groupKey -> 小計物件）
  detailSubtotals: Record<string, Record<string, number>> = {};

  // 欄位對應：畫面欄位 -> 小計欄位鍵
  detailSubtotalFieldMap: Record<string, string> = {
    TXN_PayAmt: 'Subtotal_TXN_PayAmt',
    TXN_TaxAlwnc: 'Subtotal_TXN_TaxAlwnc',
  };
  private padTxnNo(v: any): string {
    const s = String(v ?? '').trim();
    return s ? s.padStart(6, '0') : '';
  }

  // 明細欄位
  columns: any[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: string) => this.formatDate(v) },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: (v: any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'TXN_StatusName', header: '交易型態', visible: true },

    { field: 'PAY_NAME', header: '付款別', visible: true },
    { field: 'TXN_PayAmt', header: '金額', visible: true, style: 'text-right', format: (n: number) => this.money(n), isTotal: true, isSubTotal: true },
    { field: 'TXN_TaxAlwnc', header: '備抵稅額', visible: true, style: 'text-right', format: (n: number) => this.money(n), isTotal: true, isSubTotal: true },

    { field: 'TXN_GUIBegNo', header: '發票號碼', visible: true },
    { field: 'TXN_Time', header: '交易時間', visible: true, format: (v: string) => this.formatDateTime(v) },
    { field: 'CRD_Name', header: '信用卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號/條碼', visible: true, style: 'text-right' },
    {
      field: 'IsHaveTERM_No',
      header: '是否分期',
      visible: true,
      format: (_: any, row: any) => {
        // footer 列（沒有 _rowKey）→ 不顯示
        if (!row || !row._rowKey) return '';
        return Number(row?.TERM_No ?? 0) > 1 ? '是' : '否';
      }
    },
{ field: 'TERM_Name', header: '分期期數', visible: true },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    { field: 'org_id', header: '組織編號', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
  ];

  // 彙總欄位
  summaryColumns = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: string) => this.formatDate(v) },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'PAY_NO', header: '付款別代號', visible: true },
    { field: 'PAY_NAME', header: '付款別', visible: true },
    { field: 'TXN_PayAmt', header: '金額', visible: true, style: 'text-right', format: (n: number) => this.money(n) },
    { field: 'TXN_TaxAlwnc', header: '備抵稅額', visible: true, style: 'text-right', format: (n: number) => this.money(n) },
    { field: 'org_id', header: '組織編號', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
  ];

  // 付款別彙總欄位
  paymentSummaryColumns = [
    { header: '支付別', field: 'PAY_NAME', style: 'text-left' },
    { header: '卡別', field: 'CRD_Type', style: 'text-center' }, // 顯示 CRD_Name 或正規化後的卡別
    { header: '合計金額', field: 'Total_TXN_PayAmt', style: 'text-right', format: (val: number) => Number(val ?? 0).toLocaleString(), isTotal: true },
  ];

  // 下拉（若未取回資料不影響畫面使用）
  WhetherOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
    { value: null, label: '全部' },
  ];
  paymentTypeOptions: Array<{ label: string; value: string; Name: string; No: string; PAY_Type: string; }> = [];
  cardTypeOptions = getSYS1000Options('CREDIT_CRD_Type');
  txnStatusOptions: any[] = [
    { value: '1', label: '正常交易' },
    { value: '2', label: '作廢' },
    { value: '3', label: '退貨' },
  ];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  ticketStatusOptions: any[] = [
    { value: '1', label: '已開' },
    { value: '0', label: '未開' },
  ];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];

  constructor(
    private floorService: FloorService,
    private tls23030Service: TLS23030Service,
    private tls11010Service: Tls11010Service,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  // -------------------- lifecycle --------------------
  ngOnInit(): void {
    this.initializePage('TLS23030');
    this.queryForm.patchValue({ pageSize: 30 }, { emitEvent: false });

    // 下拉資料：失敗不影響畫面
    this.dropDownListService.queryPOS1006_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.paymentTypeOptions = rows.map((x: any) => ({
          label: `${x.No ?? ''}-${x.Name ?? ''}`,
          value: x.No ?? '',
          Name: x.Name ?? '',
          No: x.No ?? '',
          PAY_Type: x.PAY_Type ?? '',
        }));
      });

    this.tls11010Service.getBuildingOptions().subscribe(v => this.BUILDING_NO_Options = v || []);
    this.tls11010Service.getOrgOptions().subscribe(v => this.OrganizationCodeOptions = (v || []).map((x) => ({
      label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
    })));
    this.ECRNoService.getECRNo().subscribe(v => this.ECRNoOptions = (v || []).map((x) => ({
      label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
    })));
    this.counterNameService.getCounters().subscribe(v => this.CounterOptions = (v || []).map((x) => ({
      label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value,
    })));
    this.floorService.getFloors().subscribe(v => this.floorOptions = v || []);
    // 其餘下拉：若未使用就不特別載入
  }

  // -------------------- main actions --------------------
  onSubmit(form: FormGroup): void {
    this.loading = true;

    // 1) 讀取表單 & 正規化
    const raw: any = { ...form.getRawValue() };
    const isSummary = !!this.queryForm.get('showSummary')?.value;

    // 日期轉 yyyy-MM-dd
    raw['TXN_DateStart'] = this.toDateOnly(raw['TXN_DateStart']);
    raw['TXN_DateEnd'] = this.toDateOnly(raw['TXN_DateEnd']);

    const ensureArr = (v: any) => Array.isArray(v) ? v : v == null || v === '' ? [] : [v];
    const toNumOrNull = (v: any) => (v === '' || v == null ? null : Number(v));
    const emptyToNull = (v: any) => (v === '' ? null : v);

    // 2) 組 payload（基礎條件）
    const payload: any = {
      TXN_DateStart: raw['TXN_DateStart'],
      TXN_DateEnd: raw['TXN_DateEnd'],
      ECR_No: ensureArr(raw['ECR_No']),
      TXN_No_Start: toNumOrNull(raw['TXN_No_Start']),
      TXN_No_End: toNumOrNull(raw['TXN_No_End']),
      TLT_No: ensureArr(raw['TLT_No']),
      PAY_NO: ensureArr(raw['PAY_NO']),
      TXN_PayAmt_Start: toNumOrNull(raw['TXN_PayAmt_Start']),
      TXN_PayAmt_End: toNumOrNull(raw['TXN_PayAmt_End']),
      TXN_Status: ensureArr(raw['TXN_Status']),
      TXN_MemCard: emptyToNull(raw['TXN_MemCard']),
      CRD_Type: ensureArr(raw['CRD_Type']),
      CRD_No: emptyToNull(raw['CRD_No']),
      IsHaveTERM_No: this.toBoolOrNull(raw['IsHaveTERM_No']),
      pay_taxtype: emptyToNull(raw['pay_taxtype']),
      org_id: ensureArr(raw['org_id']),
      VOU_Check: this.toBoolOrNull(raw['VOU_Check']),
      rece_yn: emptyToNull(raw['rece_yn']),
      cash_yn: emptyToNull(raw['cash_yn']),
      tlt_building: emptyToNull(raw['tlt_building']),
      tlt_floor: ensureArr(raw['tlt_floor']),
      // 分頁/排序（明細才送；彙總不需要）
      pageSize: 30,
      pageIndex: Number.isFinite(raw?.pageIndex) ? Number(raw.pageIndex) : 1,
      SortBy: this.sanitizeSort(
        Array.isArray(raw?.SortBy) && raw.SortBy.length
          ? raw.SortBy
          : [
            { field: 'TXN_Date', order: 1 },
            { field: 'ECR_No', order: 1 },
            { field: 'TXN_No', order: 1 },
          ]
      ),
    };

    // 不送 showSummary 給後端
    delete (payload as any).showSummary;

    // 彙總模式：移除分頁鍵
    if (isSummary) {
      delete payload.pageIndex;
      delete payload.pageSize;
    }

    // 3) 清除空值
    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    // 4) 記錄最後查詢、載入付款別小表
    this.historyRequestBody = { ...payload };
    this.loadPaymentSummary(this.historyRequestBody);

    // 5) 彙總 / 明細 分支
    if (isSummary) {
      // ===== 彙總 =====
      this.tls23030Service
        .queryTLS23030Summary(payload)
        .pipe(
          timeout(60_000),
          catchError((err) => {
            console.error('TLS23030 Summary 失敗:', err);
            return of({ Data: [] });
          }),
          finalize(() => (this.loading = false)),
        )
        .subscribe((res: any) => {
          const packs = Array.isArray(res?.Data) ? res.Data : [];

          // 頁面上顯示的總金額/備抵稅額
          const totals = packs.reduce(
            (acc: any, p: any) => ({
              totalPayAmt: acc.totalPayAmt + Number(p?.totalPayAmt ?? 0),
              totalTaxAlwnc: acc.totalTaxAlwnc + Number(p?.totalTaxAlwnc ?? 0),
            }),
            { totalPayAmt: 0, totalTaxAlwnc: 0 },
          );
          this.summaryTotals = totals;

          // 彙總列
          const details = packs.flatMap((p: any) =>
            Array.isArray(p?.SummaryDetails) ? p.SummaryDetails : []
          );
          this.summaryData = details.map((r: any, i: number) => ({
            ...r,
            _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${r?.PAY_NO ?? ''}|${i}`,
          }));

          // 清空明細狀態
          this.data = [];
          this.totalRecords = this.summaryData.length;
          this.detailFooter = undefined;
        });

      return;
    }

    // ===== 明細 =====
    this.tls23030Service
      .queryTLS23030(payload)
      .pipe(
        timeout(60_000),
        catchError((err) => {
          console.error('TLS23030 查詢失敗:', err);
          // 清空狀態與總計
          this.data = [];
          this.totalRecords = 0;
          this.detailFooter = this.buildFooterFromTotals({ Total_TXN_PayAmt: 0, Total_TXN_TaxAlwnc: 0 });
          return of({ Data: [], TotalCount: 0 });
        }),
        finalize(() => (this.loading = false)),
      )
      .subscribe((res: any) => {
        // 展平成 rows
        const wrappers: any[] = Array.isArray(res?.Data) ? res.Data : res?.Data ? [res.Data] : [];
        const rawRows = this.extractRows(wrappers);

        // 加上 _rowKey / groupKey（供表格分組與唯一鍵）
        const rows = rawRows.map((item: any, i: number) => {
          const ymd = this.toYMD(item?.TXN_Date) ?? '';
          const ecr = String(item?.ECR_No ?? '').trim();
          const txn = String(item?.TXN_No ?? '').trim();
          const key = `${ymd}|${ecr}|${txn}`;
          return { ...item, _rowKey: `${key}|${i}`, groupKey: key };
        });

        // 總筆數
        const totalCount = Number(res?.TotalCount ?? 0);
        this.data = rows;
        this.totalRecords = Number.isFinite(totalCount) ? totalCount : rows.length;

        // 明細總計（由包裝層累加）
        const grand = wrappers.reduce((agg, w) => {
          agg.Total_TXN_PayAmt = (agg.Total_TXN_PayAmt ?? 0) + Number(w?.Total_TXN_PayAmt ?? 0);
          agg.Total_TXN_TaxAlwnc = (agg.Total_TXN_TaxAlwnc ?? 0) + Number(w?.Total_TXN_TaxAlwnc ?? 0);
          return agg;
        }, {} as Record<string, number>);
        this.detailFooter = this.buildFooterFromTotals(grand);
      });
  }


  onToggleSummary() {
    this.queryForm.patchValue({ pageIndex: 1 }, { emitEvent: false });
    this.onSubmit(this.queryForm);
  }

  // -------------------- 查詢函式（給 app-table-report 用） --------------------
  /** 明細：供 app-table-report infinite scroll / 排序使用 */
  /** 明細：供 app-table-report infinite scroll / 排序使用（不插小計列） */
  public queryTLS23030ForReport = (body: any) => {
    const safeBody = {
      ...body,
      pageSize: 30,
      // ✅ 確保 DateOnly
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
    };
    safeBody.SortBy = this.sanitizeSort(Array.isArray(body?.SortBy) ? body.SortBy : []);

    return this.tls23030Service.queryTLS23030(safeBody).pipe(
      map((res: any) => {
        // 展平成 rows
        const wrappers: any[] = Array.isArray(res?.Data) ? res.Data : res?.Data ? [res.Data] : [];
        const rawRows = this.extractRows(wrappers);

        const rows = rawRows.map((item: any, i: number) => {
          const ymd = this.toYMD(item?.TXN_Date) ?? '';
          const ecr = String(item?.ECR_No ?? '').trim();
          const txn = String(item?.TXN_No ?? '').trim();
          const key = `${ymd}|${ecr}|${txn}`;
          return {
            ...item,
            _rowKey: `${key}|${i}`,
            groupKey: key,          // ★ 給 app-table-report 分組用
          };
        });

        // 彙總 API 回來的包裝物件總計，映射到欄位鍵（避免 TS4111 用 bracket 存取）
        const grand = wrappers.reduce((agg: Record<string, number>, w: any) => {
          agg['Total_TXN_PayAmt'] = (agg['Total_TXN_PayAmt'] ?? 0) + Number(w?.['Total_TXN_PayAmt'] ?? w?.Total_TXN_PayAmt ?? 0);
          agg['Total_TXN_TaxAlwnc'] = (agg['Total_TXN_TaxAlwnc'] ?? 0) + Number(w?.['Total_TXN_TaxAlwnc'] ?? w?.Total_TXN_TaxAlwnc ?? 0);
          return agg;
        }, {});

        // 只回傳需要被加總的欄位（和 columns 裡 isTotal:true 對齊）
        const GrandTotal = {
          TXN_PayAmt: Number(grand[TOTAL_FIELD_MAP.TXN_PayAmt] ?? 0),
          TXN_TaxAlwnc: Number(grand[TOTAL_FIELD_MAP.TXN_TaxAlwnc] ?? 0),
        };

        const totalCount = Number.isFinite(Number(res?.TotalCount)) ? Number(res.TotalCount) : rows.length;
        return { Data: rows, TotalCount: totalCount, GrandTotal };
      })
    );

  }


  /** 彙總：供 app-table-report 使用 */
  public queryTLS23030SummaryForReport = (body: any) =>
    this.tls23030Service.queryTLS23030Summary({
      ...body,
      pageSize: 30,
      // ✅ 確保 DateOnly
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
    }).pipe(
      map((res: any) => {
        const packs = Array.isArray(res?.Data) ? res.Data : [];
        const totals = packs.reduce(
          (acc: any, p: any) => ({
            totalPayAmt: acc.totalPayAmt + Number(p?.totalPayAmt ?? 0),
            totalTaxAlwnc: acc.totalTaxAlwnc + Number(p?.totalTaxAlwnc ?? 0),
          }),
          { totalPayAmt: 0, totalTaxAlwnc: 0 }
        );

        const details = packs.flatMap((p: any) => Array.isArray(p?.SummaryDetails) ? p.SummaryDetails : []);
        const rows = details.map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${r?.PAY_NO ?? ''}|${i}`,
        }));

        const GrandTotal = {
          Total_TXN_PayAmt: totals.totalPayAmt,
          Total_TXN_TaxAlwnc: totals.totalTaxAlwnc,
        };

        // 更新頁面上的 totals，方便 header 顯示
        this.summaryTotals = totals;

        return { Data: rows, TotalCount: rows.length, GrandTotal };
      })
    );

  // === 付款別彙總：正規化 / 合併空白或 Null 卡別 ===
  private normalizeCardLabel(crdType: any, crdName: any): string {
    const s = String((crdName ?? crdType) ?? '').trim();
    return s || '—';
  }

  /** 付款別彙總：供 app-table-report 使用（同時也會在 onSubmit 時主動載入） */
  public queryTLS23030PaymentSummaryForReport = (body: any) => {
    const p = { ...body };
    delete p.pageIndex; delete p.pageSize;

    return this.tls23030Service.queryTLS23030_SumPayNo(p).pipe(
      map((res: any) => {
        const list: TLS23030SumPayNoRow[] = Array.isArray(res?.Data) ? res.Data : [];

        // 依 (PAY_NO, PAY_NAME, 正規化後 CRD_Type) 合併
        const grouped = new Map<string, any>();
        for (const r of list) {
          const CRD_Type = this.normalizeCardLabel(r.CRD_Type, (r as any).CRD_Name);
          const key = `${r.PAY_NO}|${r.PAY_NAME}|${CRD_Type}`;
          const amt = Number(r?.Total_TXN_PayAmt ?? 0);

          if (!grouped.has(key)) {
            grouped.set(key, { ...r, CRD_Type, Total_TXN_PayAmt: amt });
          } else {
            grouped.get(key).Total_TXN_PayAmt += amt;
          }
        }

        const rows = Array.from(grouped.values());
        const totalPay = rows.reduce((s, r: any) => s + Number(r?.Total_TXN_PayAmt ?? 0), 0);

        // 同步到頁面狀態（付款別小表與 footer）
        this.paymentSummary = rows;
        this.paymentSummaryTotal = totalPay;

        return { Data: rows, TotalCount: rows.length, GrandTotal: { Total_TXN_PayAmt: totalPay } };
      }),
      catchError(err => {
        console.error('TLS23030_SumPayNo 失敗', err);
        this.paymentSummary = [];
        this.paymentSummaryTotal = 0;
        return of({ Data: [], TotalCount: 0, GrandTotal: { Total_TXN_PayAmt: 0 } });
      })
    );
  };

  // -------------------- 匯出 --------------------
  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { pageIndex, pageSize, ...rest } = this.historyRequestBody;
    return rest;
  }

  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }

    this.btnLoading = true;

    const exportBody = this.buildExportBody(); // 會移除 pageIndex/pageSize
    const isSummary = !!this.queryForm.get('showSummary')?.value;

    const obs = isSummary
      ? this.tls23030Service.exportTLS23030SummaryPDF(exportBody)
      : this.tls23030Service.exportTLS23030PDF(exportBody);

    obs
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (response: HttpResponse<Blob>) =>
          this.handleFileExport(response, '.pdf'),
      });
  }

  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }

    this.btnLoading = true;

    const exportBody = this.buildExportBody(); // 會移除 pageIndex/pageSize
    const isSummary = !!this.queryForm.get('showSummary')?.value;

    const obs = isSummary
      ? this.tls23030Service.exportTLS23030SummaryExcel(exportBody)
      : this.tls23030Service.exportTLS23030Excel(exportBody);

    obs
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (response: HttpResponse<Blob>) =>
          this.handleFileExport(response, '.xlsx'),
      });
  }

  private handleFileExport(response: HttpResponse<Blob>, ext: string): void {
    const cd = response.headers.get('Content-Disposition');
    const name = this.getFilenameFromHeader(cd, ext);
    const blob = response.body;
    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private getFilenameFromHeader(cd: string | null, def: string): string {
    if (!cd) return `download${def}`;
    const star = /filename\*=([^;]+)/.exec(cd);
    if (star?.[1]) {
      try { return decodeURIComponent(star[1].replace(/^UTF-8''/, '')); } catch { return star[1]; }
    }
    const m = /filename="([^"]+)"/.exec(cd);
    if (m?.[1]) {
      try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch { return m[1]; }
    }
    return `download${def}`;
  }

  // -------------------- footer builders --------------------
  buildFooterFromTotals(grand?: Record<string, number>): Record<string, any> | undefined {
    if (!grand) return undefined;
    return {
      TXN_PayAmt: Number(grand[TOTAL_FIELD_MAP.TXN_PayAmt] ?? 0),
      TXN_TaxAlwnc: Number(grand[TOTAL_FIELD_MAP.TXN_TaxAlwnc] ?? 0),
      // 這行是關鍵：讓「是否分期」footer 一律空白
      IsHaveTERM_No: '',
    };
  }


  buildSummaryFooter(): Record<string, any> {
    return {
      TXN_PayAmt: this.summaryTotals.totalPayAmt ?? 0,
      TXN_TaxAlwnc: this.summaryTotals.totalTaxAlwnc ?? 0,
    };
  }

  buildPaymentSummaryFooterFromState(): Record<string, any> {
    return { Total_TXN_PayAmt: this.paymentSummaryTotal ?? 0 };
  }

  // -------------------- helpers --------------------
  private extractRows(wrappers: any[]): any[] {
    const rows: any[] = [];
    for (const w of wrappers || []) {
      const s1 = w?.tLS23030_SubTotals ?? w?.TLS23030_SubTotals ?? w?.tls23030_SubTotals ?? [];
      if (Array.isArray(s1) && s1.length) {
        for (const st of s1) {
          const details = st?.tLS23030_Details ?? st?.TLS23030_Details ?? st?.tls23030_Details ?? [];
          if (Array.isArray(details)) rows.push(...details);
        }
      } else {
        const d = w?.Details ?? w?.details ?? w?.Rows ?? w?.rows ?? [];
        if (Array.isArray(d)) rows.push(...d);
      }
    }
    return rows;
  }

  private toApiSort(uiSort: Array<{ field: string; order: 1 | -1 }>): Array<{ field: string; order: 1 | -1 }> {
    const seen = new Set<string>();
    const out: Array<{ field: string; order: 1 | -1 }> = [];
    for (const s of uiSort ?? []) {
      if (!seen.has(s.field)) { out.push(s); seen.add(s.field); }
    }
    return out;
  }

  private toYMD(d: any): string | null {
    const date = d instanceof Date ? d : new Date(d);
    return isNaN(date.getTime())
      ? null
      : `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
  private toBoolOrNull(v: any): boolean | null {
    if (typeof v === 'boolean') return v;
    if (v == null || v === '') return null;
    if (v === 'Y' || v === 'true' || v === 1 || v === '1') return true;
    if (v === 'N' || v === 'false' || v === 0 || v === '0') return false;
    return null;
  }
  private formatDate(val: string): string {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
  }
  private formatDateTime(val: string): string {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const HH = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${HH}:${mm}`;
  }
  money(val: number): string {
    return Number(val ?? 0).toLocaleString('en-US');
  }

  private loadPaymentSummary(payload: any): void {
    const p = { ...payload }; delete p.pageIndex; delete p.pageSize;
    this.queryTLS23030PaymentSummaryForReport(p).subscribe(); // 直接觸發載入，同步 state
  }



  public groupKey = (row: any): string => {
    const ymd = this.toYMD(row?.TXN_Date) ?? '';
    const ecr = String(row?.ECR_No ?? '').trim();
    const txn = String(row?.TXN_No ?? '').trim();
    return `${ymd}|${ecr}|${txn}`;
  };
  /** groupKey 對應的後端真實排序欄位 */
  private readonly GROUPKEY_SORT_EXPANSION = ['TXN_Date', 'ECR_No', 'TXN_No'];

  /** 將 UI 的 SortBy 轉成後端可接受，會移除 groupKey 並展開成真實欄位 */
  private sanitizeSort(uiSort: Array<{ field: string; order: 1 | -1 }>): Array<{ field: string; order: 1 | -1 }> {
    const seen = new Set<string>();
    const out: Array<{ field: string; order: 1 | -1 }> = [];

    for (const s of uiSort ?? []) {
      if (!s?.field) continue;

      // 遇到 groupKey：展開為 TXN_Date, ECR_No, TXN_No（用同一個 order）
      if (s.field === 'groupKey') {
        for (const f of this.GROUPKEY_SORT_EXPANSION) {
          if (!seen.has(f)) {
            out.push({ field: f, order: s.order });
            seen.add(f);
          }
        }
        continue; // 不把 groupKey 自己加進去
      }

      // 其餘正常欄位去重後加進去
      if (!seen.has(s.field)) {
        out.push({ field: s.field, order: s.order });
        seen.add(s.field);
      }
    }

    // 若最後仍然沒有排序（例如 UI 只給了 groupKey），補上預設排序以確保穩定性
    if (out.length === 0) {
      for (const f of this.GROUPKEY_SORT_EXPANSION) out.push({ field: f, order: 1 });
    }
    return out;
  }
  // 1) 新增這個工具函式（放在 component 裡即可）
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    // 輸出 yyyy-MM-dd（只有日期、無時間/時區）
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
