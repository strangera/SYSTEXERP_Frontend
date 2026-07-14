import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, timeout } from 'rxjs/operators';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23030Service, TLS23030SumPayNoRow } from '../../../service/api/tls/tls23030.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { formatAmount, formatDate, formatTime, ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';

const TOTAL_FIELD_MAP = {
  TXN_PayAmt: 'Total_TXN_PayAmt',
  TXN_TaxAlwnc: 'Total_TXN_TaxAlwnc',
} as const;

@UntilDestroy()
@Component({
  selector: 'app-tls23030',
  standalone: true,
  templateUrl: './tls23030.component.html',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, DecimalPipe, TranslateModule,
    AccordionModule, CheckboxModule, ButtonModule, DialogModule, RadioButtonModule,
    MenubarComponent, CalendarRangeComponent, MultiSelectComponent, InputNumberRangeComponent,
    DropdownComponent, InputTextComponent, ButtonComponent, InputTextRangeComponent, TableReportComponent,
  ],
})
export class TLS23030Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 狀態管理 =====
  data: any[] = [];
  totalRecords = 0;
  summaryData: any[] = [];
  summaryTotals = { totalPayAmt: 0, totalTaxAlwnc: 0 };
  detailFooter: Record<string, any> | undefined = undefined;
  paymentSummary: TLS23030SumPayNoRow[] = [];
  private paymentSummaryTotal = 0;
  btnLoading = false;
  historyRequestBody: any | null = null;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單宣告 =====
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
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[
      { field: 'TXN_Date', order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
    ]],
  });

  // 小計結構配置
  detailSubtotals: Record<string, Record<string, number>> = {};
  readonly detailSubtotalFieldMap: Record<string, string> = {
    TXN_PayAmt: 'Subtotal_TXN_PayAmt',
    TXN_TaxAlwnc: 'Subtotal_TXN_TaxAlwnc',
  };

  // ===== 下拉選單資料源 =====
  paymentTypeOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  floorOptions: any[] = [];

  readonly WhetherOptions = [{ value: 'Y', label: '是' }, { value: 'N', label: '否' }, { value: null, label: '全部' }];
  readonly cardTypeOptions = getSYS1000Options('CREDIT_CRD_Type');
  readonly ticketStatusOptions = [{ value: '1', label: '已開' }, { value: '0', label: '未開' }];
  readonly txnStatusOptions = [
    { value: '1', label: '正常交易' }, { value: '2', label: '作廢交易' },
    { value: '3', label: '退貨交易' }, { value: '4', label: '預售交易' },
    { value: '5', label: '預售解約' }, { value: '6', label: '預售退貨' },
  ];

  private dropdownInit$?: Observable<any>;

  constructor(
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls23030Service: TLS23030Service,
    private readonly tls11010Service: Tls11010Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23030');
    this.queryForm.patchValue({ pageSize: 1000 }, { emitEvent: false });
    this.initDropdownData();
  }

  /**
   * 初始化下拉選單資料 (forkJoin 聲明式重構)
   */
  private initDropdownData(): void {
    this.dropdownInit$ ??= forkJoin({
      paymentTypes: this.dropDownListService.queryPOS1006_DropDownList().pipe(catchError(() => of({ Data: [] }))),
      buildings: this.tls11010Service.getBuildingOptions().pipe(catchError(() => of([]))),
      orgs: this.dropdownApiService.querySys3100().pipe(catchError(() => of([]))),
      ecrs: this.dropdownApiService.queryPos1002().pipe(catchError(() => of([]))),
      counters: this.dropdownApiService.queryTltTalent().pipe(catchError(() => of([]))),
      floors: this.dropdownApiService.querySys3900().pipe(map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name }))), catchError(() => of([]))),
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.dropdownInit$.pipe(untilDestroyed(this)).subscribe((res) => {
      const pRows = Array.isArray(res.paymentTypes?.Data) ? res.paymentTypes.Data : [];
      this.paymentTypeOptions = pRows.map((x: any) => ({
        label: `${x.No ?? ''}-${x.Name ?? ''}`,
        value: x.No ?? '',
        Name: x.Name ?? '',
        No: x.No ?? '',
        PAY_Type: x.PAY_Type ?? '',
      }));

      this.BUILDING_NO_Options = res.buildings || [];
      this.floorOptions = res.floors || [];

      const mapStandardOption = (x: any) => ({
        label: x.label,
        formLabel: `${x.label}`,
        value: x.value,
      });

      this.OrganizationCodeOptions = (res.orgs || []).map(mapStandardOption);
      this.ECRNoOptions = (res.ecrs || []).map(mapStandardOption);
      this.CounterOptions = (res.counters || []).map(mapStandardOption);
    });
  }

  // ========= 查詢（明細 / 彙總） =========
  onSubmit(form: FormGroup): void {
    this.loading = true;
    const raw = { ...form.getRawValue() };
    const isSummary = !!this.queryForm.get('showSummary')?.value;

    const ensureArr = (v: any) => Array.isArray(v) ? v : v == null || v === '' ? [] : [v];
    const toNumOrNull = (v: any) => (v === '' || v == null ? null : Number(v));
    const emptyToNull = (v: any) => (v === '' ? null : v);

    const payload: any = {
      TXN_DateStart: this.toDateOnly(raw['TXN_DateStart']),
      TXN_DateEnd: this.toDateOnly(raw['TXN_DateEnd']),
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
      pageSize: 1000,
      pageIndex: Number.isFinite(raw?.pageIndex) ? Number(raw.pageIndex) : 1,
      SortBy: this.sanitizeSort(
        Array.isArray(raw?.SortBy) && raw.SortBy.length ? raw.SortBy : [
          { field: 'TXN_Date', order: 1 }, { field: 'ECR_No', order: 1 }, { field: 'TXN_No', order: 1 }
        ]
      ),
    };

    delete payload.showSummary;
    if (isSummary) {
      delete payload.pageIndex;
      delete payload.pageSize;
    }

    // 清除空欄位
    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)) delete payload[k];
    });

    this.historyRequestBody = { ...payload };
    this.loadPaymentSummary(this.historyRequestBody);

    if (isSummary) {
      this.executeSummaryQuery(payload);
    } else {
      this.executeDetailQuery(payload);
    }
  }

  private executeSummaryQuery(payload: any): void {
    this.tls23030Service.queryTLS23030Summary(payload)
      .pipe(
        timeout(60_000),
        catchError((err) => {
          console.error('TLS23030 Summary 失敗:', err);
          return of({ Data: [] });
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((res: any) => {
        const packs = Array.isArray(res?.Data) ? res.Data : [];
        this.summaryTotals = packs.reduce(
          (acc: any, p: any) => ({
            totalPayAmt: acc.totalPayAmt + Number(p?.totalPayAmt ?? 0),
            totalTaxAlwnc: acc.totalTaxAlwnc + Number(p?.totalTaxAlwnc ?? 0),
          }),
          { totalPayAmt: 0, totalTaxAlwnc: 0 }
        );

        const details = packs.flatMap((p: any) => Array.isArray(p?.SummaryDetails) ? p.SummaryDetails : []);
        this.summaryData = details.map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${r?.PAY_NO ?? ''}|${i}`,
        }));

        this.data = [];
        this.totalRecords = this.summaryData.length;
        this.detailFooter = undefined;
      });
  }

  private executeDetailQuery(payload: any): void {
    this.tls23030Service.queryTLS23030(payload)
      .pipe(
        timeout(60_000),
        catchError((err) => {
          console.error('TLS23030 查詢失敗:', err);
          this.data = [];
          this.totalRecords = 0;
          this.detailFooter = this.buildFooterFromTotals({ Total_TXN_PayAmt: 0, Total_TXN_TaxAlwnc: 0 });
          return of({ Data: [], TotalCount: 0 });
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((res: any) => {
        const wrappers: any[] = Array.isArray(res?.Data) ? res.Data : res?.Data ? [res.Data] : [];
        const rawRows = this.extractRows(wrappers);

        this.data = rawRows.map((item: any, i: number) => {
          const ymd = this.toYMD(item?.TXN_Date) ?? '';
          const key = `${ymd}|${String(item?.ECR_No ?? '').trim()}|${String(item?.TXN_No ?? '').trim()}`;
          return { ...item, _rowKey: `${key}|${i}`, groupKey: key };
        });

        const totalCount = Number(res?.TotalCount ?? 0);
        this.totalRecords = Number.isFinite(totalCount) ? totalCount : this.data.length;

        const grand = wrappers.reduce((agg, w) => {
          agg.Total_TXN_PayAmt = (agg.Total_TXN_PayAmt ?? 0) + Number(w?.Total_TXN_PayAmt ?? 0);
          agg.Total_TXN_TaxAlwnc = (agg.Total_TXN_TaxAlwnc ?? 0) + Number(w?.Total_TXN_TaxAlwnc ?? 0);
          return agg;
        }, {} as Record<string, number>);

        this.detailFooter = this.buildFooterFromTotals(grand);
      });
  }

  onToggleSummary(): void {
    this.queryForm.patchValue({ pageIndex: 1 }, { emitEvent: false });
    this.onSubmit(this.queryForm);
  }

  // ========= <app-table-report> 連動封裝（明細） =========
  public queryTLS23030ForReport = (body: any) => {
    const safeBody = {
      ...body,
      pageSize: 1000,
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
      SortBy: this.sanitizeSort(Array.isArray(body?.SortBy) ? body.SortBy : []),
    };

    return this.tls23030Service.queryTLS23030(safeBody).pipe(
      map((res: any) => {
        const wrappers: any[] = Array.isArray(res?.Data) ? res.Data : res?.Data ? [res.Data] : [];
        const rawRows = this.extractRows(wrappers);
        const rows = rawRows.map((item: any, i: number) => {
          const ymd = this.toYMD(item?.TXN_Date) ?? '';
          const key = `${ymd}|${String(item?.ECR_No ?? '').trim()}|${String(item?.TXN_No ?? '').trim()}`;
          return { ...item, _rowKey: `${key}|${i}`, groupKey: key };
        });

        const grand = wrappers.reduce((agg: Record<string, number>, w: any) => {
          agg['Total_TXN_PayAmt'] = (agg['Total_TXN_PayAmt'] ?? 0) + Number(w?.Total_TXN_PayAmt ?? 0);
          agg['Total_TXN_TaxAlwnc'] = (agg['Total_TXN_TaxAlwnc'] ?? 0) + Number(w?.Total_TXN_TaxAlwnc ?? 0);
          return agg;
        }, {});

        const GrandTotal = {
          TXN_PayAmt: Number(grand[TOTAL_FIELD_MAP.TXN_PayAmt] ?? 0),
          TXN_TaxAlwnc: Number(grand[TOTAL_FIELD_MAP.TXN_TaxAlwnc] ?? 0),
        };

        const totalCount = Number.isFinite(Number(res?.TotalCount)) ? Number(res.TotalCount) : rows.length;
        return { Data: rows, TotalCount: totalCount, GrandTotal };
      })
    );
  };

  // ========= <app-table-report> 連動封裝（彙總） =========
  public queryTLS23030SummaryForReport = (body: any) =>
    this.tls23030Service.queryTLS23030Summary({
      ...body,
      pageSize: 1000,
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

        this.summaryTotals = totals;
        return {
          Data: rows,
          TotalCount: rows.length,
          GrandTotal: { Total_TXN_PayAmt: totals.totalPayAmt, Total_TXN_TaxAlwnc: totals.totalTaxAlwnc },
        };
      })
    );

  // ========= 付款別獨立小表封裝 =========
  public queryTLS23030PaymentSummaryForReport = (body: any) => {
    const p = { ...body };
    delete p.pageIndex;
    delete p.pageSize;

    return this.tls23030Service.queryTLS23030_SumPayNo(p).pipe(
      map((res: any) => {
        const list: TLS23030SumPayNoRow[] = Array.isArray(res?.Data) ? res.Data : [];
        const grouped = new Map<string, any>();

        for (const r of list) {
          const CRD_Type = String((r as any).CRD_Name ?? r.CRD_Type ?? '').trim() || '—';
          const key = `${r.PAY_NO}|${r.PAY_NAME}|${CRD_Type}`;
          const amt = Number(r?.Total_TXN_PayAmt ?? 0);

          if (!grouped.has(key)) {
            grouped.set(key, { ...r, CRD_Type, Total_TXN_PayAmt: amt });
          } else {
            grouped.get(key).Total_TXN_PayAmt += amt;
          }
        }

        const rows = Array.from(grouped.values());
        this.paymentSummary = rows;
        this.paymentSummaryTotal = rows.reduce((s, r: any) => s + Number(r?.Total_TXN_PayAmt ?? 0), 0);
        return { Data: rows, TotalCount: rows.length, GrandTotal: { Total_TXN_PayAmt: this.paymentSummaryTotal } };
      }),
      catchError((err) => {
        console.error('TLS23030_SumPayNo 失敗', err);
        this.paymentSummary = [];
        this.paymentSummaryTotal = 0;
        return of({ Data: [], TotalCount: 0, GrandTotal: { Total_TXN_PayAmt: 0 } });
      })
    );
  };

  // ========= 檔案匯出最佳實踐 =========
  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { pageIndex, pageSize, ...rest } = this.historyRequestBody;
    return rest;
  }

  onExportPDF(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    const exportBody = this.buildExportBody();
    const isSummary = !!this.queryForm.get('showSummary')?.value;
    const obs = isSummary ? this.tls23030Service.exportTLS23030SummaryPDF(exportBody) : this.tls23030Service.exportTLS23030PDF(exportBody);

    obs.pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (response) => this.handleFileExport(response, '.pdf') });
  }

  onExportXLSX(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    const exportBody = this.buildExportBody();
    const isSummary = !!this.queryForm.get('showSummary')?.value;
    const obs = isSummary ? this.tls23030Service.exportTLS23030SummaryExcel(exportBody) : this.tls23030Service.exportTLS23030Excel(exportBody);

    obs.pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (response) => this.handleFileExport(response, '.xlsx') });
  }

  private showExportWarn(): void {
    this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
  }

  private handleFileExport(response: HttpResponse<Blob>, ext: string): void {
    const cd = response.headers.get('Content-Disposition');
    const name = this.getFilenameFromHeader(cd, ext);
    const blob = response.body;
    if (blob && blob.size > 0) {
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private getFilenameFromHeader(cd: string | null, def: string): string {
    if (!cd) return `download${def}`;
    const star = /filename\*=([^;]+)/.exec(cd);
    if (star?.[1]) {
      try { return decodeURIComponent(star[1].replace(/^UTF-8''/, '')); } catch { }
    }
    const m = /filename="([^"]+)"/.exec(cd);
    if (m?.[1]) {
      try { return decodeURIComponent(m[1].replaceAll(/\+/g, ' ')); } catch { }
    }
    return `download${def}`;
  }

  // ========= Footer 資訊對應工廠 =========
  buildFooterFromTotals(grand?: Record<string, number>): Record<string, any> | undefined {
    if (!grand) return undefined;
    return {
      TXN_PayAmt: Number(grand[TOTAL_FIELD_MAP.TXN_PayAmt] ?? 0),
      TXN_TaxAlwnc: Number(grand[TOTAL_FIELD_MAP.TXN_TaxAlwnc] ?? 0),
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

  // ========= 工具群與資料清洗 =========
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

  private toYMD(d: any): string | null {
    const date = d instanceof Date ? d : new Date(d);
    return Number.isNaN(date.getTime()) ? null : `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }

  private toBoolOrNull(v: any): boolean | null {
    if (typeof v === 'boolean') return v;
    if (v == null || v === '') return null;
    if (v === 'Y' || v === 'true' || v === 1 || v === '1') return true;
    if (v === 'N' || v === 'false' || v === 0 || v === '0') return false;
    return null;
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (Number.isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private loadPaymentSummary(payload: any): void {
    const p = { ...payload };
    delete p.pageIndex;
    delete p.pageSize;
    this.queryTLS23030PaymentSummaryForReport(p).subscribe();
  }

  public groupKey = (row: any): string => {
    const ymd = this.toYMD(row?.TXN_Date) ?? '';
    return `${ymd}|${String(row?.ECR_No ?? '').trim()}|${String(row?.TXN_No ?? '').trim()}`;
  };

  private readonly GROUPKEY_SORT_EXPANSION = ['TXN_Date', 'ECR_No', 'TXN_No'];

  private sanitizeSort(uiSort: { field: string; order: 1 | -1 }[]): { field: string; order: 1 | -1 }[] {
    const seen = new Set<string>();
    const out: { field: string; order: 1 | -1 }[] = [];
    for (const s of uiSort ?? []) {
      if (!s?.field) continue;
      if (s.field === 'groupKey') {
        for (const f of this.GROUPKEY_SORT_EXPANSION) {
          if (!seen.has(f)) { out.push({ field: f, order: s.order }); seen.add(f); }
        }
        continue;
      }
      if (!seen.has(s.field)) { out.push({ field: s.field, order: s.order }); seen.add(s.field); }
    }
    if (out.length === 0) {
      for (const f of this.GROUPKEY_SORT_EXPANSION) out.push({ field: f, order: 1 });
    }
    return out;
  }
  private padTxnNo(v: any): string {
    const s = String(v ?? '').trim();
    return s ? s.padStart(6, '0') : '';
  }
  // ===== 報表欄位結構定義 (採用共通 ReportColumn 規範且修正對齊樣式) =====
  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: (v: any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'TXN_StatusName', header: '交易型態', visible: true },
    { field: 'PAY_NAME', header: '付款別', visible: true },
    { field: 'TXN_PayAmt', header: '金額', visible: true, align: 'right', format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'TXN_TaxAlwnc', header: '備抵稅額', visible: true, align: 'right', format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'TXN_GUIBegNo', header: '發票號碼', visible: true },
    { field: 'TXN_Time', header: '交易時間', visible: true, format: formatTime },
    { field: 'CRD_Name', header: '信用卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號/條碼', visible: true, align: 'right' },
    { field: 'TERM_No', header: '是否分期', visible: true, format: (v: any) => v == null ? '' : Number(v ?? 0) > 1 ? '是' : '否' },
    { field: 'TERM_Name', header: '分期期數', visible: true },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    { field: 'org_id', header: '組織編號', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
  ];

  summaryColumns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'PAY_NO', header: '付款別代號', visible: true },
    { field: 'PAY_NAME', header: '付款別', visible: true },
    { field: 'TXN_PayAmt', header: '金額', visible: true, align: 'right', format: formatAmount },
    { field: 'TXN_TaxAlwnc', header: '備抵稅額', visible: true, align: 'right', format: formatAmount },
    { field: 'org_id', header: '組織編號', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
  ];

  paymentSummaryColumns: ReportColumn[] = [
    { header: '支付別', field: 'PAY_NAME', align: 'left' },
    { header: '卡別', field: 'CRD_Type', align: 'center' },
    { header: '合計金額', field: 'Total_TXN_PayAmt', align: 'right', format: formatAmount, isTotal: true },
  ];
}
