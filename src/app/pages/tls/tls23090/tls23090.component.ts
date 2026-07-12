import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';
import { BasicQueryPageComponent } from 'src/app/shared/componentextends/basic-qpage/basic-query-page.component';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import {
  CounterCardApiData, CounterCardApiResponse, CounterCardItem, CounterCardSummary,
  CreditCardApiResponse, CreditCardDetail, CreditCardWrapper,
  InstallmentSummaryItem, QueryTLS23090Request, SortField, TLS23090Service,
} from '../../../service/api/tls/tls23090.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { formatDate, ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';

interface LabelOption {
  label: string;
  value: string;
  formLabel?: string;
}

interface CreditCardRow extends CreditCardDetail {
  _rowKey: string;
}

interface CounterCardRow {
  TXN_Date?: string;
  ECR_No?: string;
  tlt_no?: string;
  tlt_name?: string;
  AE_Count: number; AE_Amount: number;
  DA_Count: number; DA_Amount: number;
  MASTER_Count: number; MASTER_Amount: number;
  VISA_Count: number; VISA_Amount: number;
  JCB_Count: number; JCB_Amount: number;
  UnionPay_Count: number; UnionPay_Amount: number;
  Others_Count: number; Others_Amount: number;
  Total_Count: number; Total_Amount: number;
  _rowKey: string;
}

interface InstallmentRow {
  termNo: number;
  termName: string;
  total: number;
}

interface TableQueryResult {
  Data: (CreditCardRow | CounterCardRow)[];
  TotalCount: number;
  GrandTotal: Record<string, number>;
}

type StringOrArray = string | string[] | null;

interface TLS23090FormValue {
  TXN_DateStart: Date | null;
  TXN_DateEnd: Date | null;
  ECR_No: StringOrArray;
  tlt_no: StringOrArray;
  CRD_Type: string[] | null;
  CRD_No: string | null;
  TXN_PayAmt: number | null;
  tlt_building: StringOrArray;
  tlt_floor: StringOrArray;
  org_id: StringOrArray;
  TERM_No: StringOrArray;
  Acquirer: string[] | null;
  ConnStatus: string | null;
  IsHaveTERM_No: string | boolean | null;
  pageSize: number | null;
  pageIndex: number | null;
  SortBy: SortField[] | null;
}

@Component({
  selector: 'app-tls23090',
  templateUrl: './tls23090.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeComponent, MultiSelectComponent, DropdownComponent, InputTextComponent,
    ButtonComponent, RadioButtonModule, TranslateModule, ButtonModule, TableReportComponent,
  ],
})
export class TLS23090Component extends BasicQueryPageComponent<CreditCardRow | CounterCardRow> implements OnInit {
  private readonly tls23090Service = inject(TLS23090Service);
  private readonly dropdownApiService = inject(DropdownApiService);
  private readonly tls11010Service = inject(Tls11010Service);
  private readonly destroyRef = inject(DestroyRef);

  data: (CreditCardRow | CounterCardRow)[] = [];
  totalRecords = 0;
  btnLoading = false;
  historyRequestBody: QueryTLS23090Request | null = null;
  columns: ReportColumn[] = [];
  sortMeta: SortField[] = [];
  installmentSummary: InstallmentRow[] = [];

  private grandTotal: Record<string, number> = {};
  private creditGrandTotalStr = '';
  readonly creditFooterSpanConfig = [{ field: 'PAY_Name', colSpan: 4 }];
  private _viewMode: 'credit' | 'counter' = 'credit';

  get viewMode(): 'credit' | 'counter' { return this._viewMode; }
  set viewMode(v: 'credit' | 'counter') {
    if (this._viewMode === v) return;
    this._viewMode = v;
    this.applyViewMode();
  }

  readonly defaultSortCredit: SortField[] = [
    { field: 'TXN_Date', order: 1 },
    { field: 'ECR_No', order: 1 },
    { field: 'TXN_No', order: 1 },
  ];
  readonly defaultSortCounter: SortField[] = [
    { field: 'TXN_Date', order: 1 },
    { field: 'ECR_No', order: 1 },
    { field: 'tlt_no', order: 1 },
  ];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [null as string[] | null],
    tlt_no: [null as string[] | null],
    CRD_Type: [[] as string[]],
    CRD_No: [null as string | null],
    TXN_PayAmt: [null as number | null],
    tlt_building: [null as string[] | null],
    tlt_floor: [null as string[] | null],
    org_id: [null as string[] | null],
    TERM_No: [null as string[] | null],
    Acquirer: [[] as string[]],
    ConnStatus: [null as string | null],
    IsHaveTERM_No: [null as string | null],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [this.defaultSortCredit],
  });

  cardTypeOptions = getSYS1000Options('CREDIT_CRD_Type');
  floorOptions: LabelOption[] = [];
  BUILDING_NO_Options: LabelOption[] = [];
  OrganizationCodeOptions: LabelOption[] = [];
  ECRNoOptions: LabelOption[] = [];
  CounterOptions: LabelOption[] = [];
  installmentPeriodOptions = getSYS1000Options('T109');
  acquiringBankOptions = getSYS1000Options('T113');

  readonly WhetherOptions: LabelOption[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
    { value: '', label: '全部' },
  ];
  readonly connectionStatusOptions: LabelOption[] = [
    { value: '1', label: '連線' },
    { value: '2', label: '離線' },
  ];

  private readonly creditTotalFieldMap: Record<string, keyof CreditCardWrapper> = {
    TXN_PayAmt: 'TotalPayAmt',
    TXN_Point: 'TotalPoint',
    INST_Amt: 'TotalInstAmt',
  };

  private readonly counterBrands = ['AE', 'DA', 'MASTER', 'VISA', 'JCB', 'UnionPay', 'Others', 'Total'] as const;

  private readonly sortFieldAliasMap: Record<string, string> = {
    Others_Amount: 'O_Amount',
    Others_Count: 'O_Count',
    Total_Amount: 'Amount',
    Total_Count: 'Count',
  };

  private dropdownInit$?: Observable<{
    floors: LabelOption[];
    buildings: LabelOption[];
    orgs: LabelOption[];
    ecrs: LabelOption[];
    counters: LabelOption[];
  }>;

  ngOnInit(): void {
    this.initializePage('TLS23090', 'tls/tls23090cru', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSortCredit.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });
    this.columns = this.columnsCredit;
    this.initDropdownData();
  }

  private initDropdownData(): void {
    const mapOption = (x: { label: string; value: string }): LabelOption => ({
      label: x.label,
      formLabel: x.label,
      value: x.value,
    });

    this.dropdownInit$ ??= forkJoin({
      floors: this.dropdownApiService.querySys3900().pipe(
        map(items => (items ?? []).map(i => ({ value: i.No, label: i.Name } as LabelOption))),
        catchError(() => of([] as LabelOption[]))
      ),
      buildings: this.tls11010Service.getBuildingOptions().pipe(
        map(items => (items ?? []) as LabelOption[]),
        catchError(() => of([] as LabelOption[]))
      ),
      orgs: this.dropdownApiService.querySys3100().pipe(
        map(items => (items ?? []) as LabelOption[]),
        catchError(() => of([] as LabelOption[]))
      ),
      ecrs: this.dropdownApiService.queryPos1002().pipe(
        map(items => (items ?? []) as LabelOption[]),
        catchError(() => of([] as LabelOption[]))
      ),
      counters: this.dropdownApiService.queryTltTalent().pipe(
        map(items => (items ?? []) as LabelOption[]),
        catchError(() => of([] as LabelOption[]))
      ),
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.dropdownInit$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
      this.floorOptions = res.floors;
      this.BUILDING_NO_Options = res.buildings;
      this.OrganizationCodeOptions = res.orgs.map(mapOption);
      this.ECRNoOptions = res.ecrs.map(mapOption);
      this.CounterOptions = res.counters.map(mapOption);
    });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as TLS23090FormValue;
      const defaultSort = this.viewMode === 'counter' ? this.defaultSortCounter : this.defaultSortCredit;
      const rawSort: SortField[] = (Array.isArray(val.SortBy) && val.SortBy.length ? val.SortBy : (this.sortMeta.length ? this.sortMeta : defaultSort)).map(s => ({ ...s }));

      const payload: QueryTLS23090Request = {
        ...this.prune({
          TXN_DateStart: this.toDateOnly(val.TXN_DateStart ?? this.yesterday),
          TXN_DateEnd: this.toDateOnly(val.TXN_DateEnd ?? this.yesterday),
          ECR_No: this.ensureArr(val.ECR_No),
          TLT_No: this.ensureArr(val.tlt_no),
          CRD_Type: this.ensureArr(val.CRD_Type),
          CRD_No: val.CRD_No || undefined,
          TXN_PayAmt: val.TXN_PayAmt != null ? Number(val.TXN_PayAmt) : undefined,
          tlt_building: this.ensureArr(val.tlt_building),
          tlt_floor: this.ensureArr(val.tlt_floor),
          org_id: this.ensureArr(val.org_id),
          IsHaveTERM_No: this.toBoolOrNull(val.IsHaveTERM_No),
          TERM_No: this.ensureArr(val.TERM_No),
          Acquirer: this.ensureArr(val.Acquirer),
          Conn_Status: val.ConnStatus || undefined,
          SortBy: this.mapSortFields(rawSort),
        }),
        pageIndex: Number(val.pageIndex) || 1,
        pageSize: 1000,
      };

      this.historyRequestBody = { ...payload };
      this.loading = true;
      this.messageService?.blockUi();

      const call$: Observable<CreditCardApiResponse | CounterCardApiResponse> = this.viewMode === 'counter'
        ? this.tls23090Service.queryTLS23090CounterCard(payload)
        : this.tls23090Service.queryTLS23090(payload);

      call$.pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
          this.messageService?.unblockUi();
        })
      ).subscribe({
        next: (res) => {
          if (this.viewMode === 'counter') {
            this.handleCounterResponse(res as CounterCardApiResponse);
          } else {
            this.handleCreditResponse(res as CreditCardApiResponse);
          }
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.grandTotal = {};
          this.installmentSummary = [];
        },
      });
    });
  }

  private handleCreditResponse(res: CreditCardApiResponse): void {
    const wrappers = this.extractCreditWrappers(res);
    const rows = this.mapCreditRows(wrappers);
    this.columns = this.columnsCredit;
    this.data = rows;
    this.totalRecords = res.TotalCount ?? rows.length;
    this.grandTotal = this.computeCreditGrandTotal(wrappers);
    this.creditGrandTotalStr = wrappers[0]?.GrandTotalStr ?? '';
    this.installmentSummary = this.mapInstallmentSummary(wrappers[0]?.InstallmentSummary);
  }

  private handleCounterResponse(res: CounterCardApiResponse): void {
    const items = this.extractCounterItems(res);
    const rows = items.map((r, i) => this.mapCounterRow(r, i));
    const summary = (res.Data as CounterCardApiData)?.Summary ?? null;
    this.columns = this.columnsCounter;
    this.data = rows;
    this.totalRecords = res.TotalCount ?? rows.length;
    this.grandTotal = summary ? this.summaryToCounterGrandTotal(summary) : this.computeCounterGrandTotal(rows);
  }

  public queryTLS23090CreditForReport = (body: QueryTLS23090Request): Observable<TableQueryResult> => {
    return this.tls23090Service.queryTLS23090({
      ...body,
      SortBy: this.mapSortFields(body.SortBy),
      TXN_DateStart: this.toDateOnly(body.TXN_DateStart ?? this.queryForm.value.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body.TXN_DateEnd ?? this.queryForm.value.TXN_DateEnd),
      pageSize: body.pageSize ?? 1000,
      pageIndex: body.pageIndex ?? 1,
    }).pipe(
      map((res): TableQueryResult => {
        const wrappers = this.extractCreditWrappers(res);
        const rows = this.mapCreditRows(wrappers);
        const grand = this.computeCreditGrandTotal(wrappers);
        if (!body.pageIndex || body.pageIndex === 1) {
          this.grandTotal = { ...grand };
          this.creditGrandTotalStr = wrappers[0]?.GrandTotalStr ?? '';
          this.installmentSummary = this.mapInstallmentSummary(wrappers[0]?.InstallmentSummary);
        }
        return { Data: rows, TotalCount: res.TotalCount ?? rows.length, GrandTotal: grand };
      })
    );
  };

  public queryTLS23090CounterForReport = (body: QueryTLS23090Request): Observable<TableQueryResult> => {
    return this.tls23090Service.queryTLS23090CounterCard({
      ...body,
      SortBy: this.mapSortFields(body.SortBy),
      pageSize: body.pageSize ?? 1000,
      pageIndex: body.pageIndex ?? 1,
    }).pipe(
      map((res): TableQueryResult => {
        const items = this.extractCounterItems(res);
        const rows = items.map((r, i) => this.mapCounterRow(r, i));
        const summary = (res.Data as CounterCardApiData)?.Summary ?? null;
        const grand = summary ? this.summaryToCounterGrandTotal(summary) : this.computeCounterGrandTotal(rows);
        if (!body.pageIndex || body.pageIndex === 1) {
          this.grandTotal = { ...grand };
        }
        return { Data: rows, TotalCount: res.TotalCount ?? rows.length, GrandTotal: grand };
      })
    );
  };

  private applyViewMode(): void {
    this.columns = this.viewMode === 'credit' ? this.columnsCredit : this.columnsCounter;
    const nextDefault = this.viewMode === 'credit' ? this.defaultSortCredit : this.defaultSortCounter;
    this.sortMeta = nextDefault.map(x => ({ ...x }));
    this.grandTotal = {};
    this.installmentSummary = [];
    this.queryForm.patchValue({ pageIndex: 1, SortBy: this.sortMeta }, { emitEvent: false });
    this.onSubmit(this.queryForm);
  }

  onExportCreditPDF(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23090Service.exporttls23090CreditPDF({ ...this.historyRequestBody })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService?.warnBubble?.('PDF 匯出失敗（信用卡明細）。'),
      });
  }

  onExportCounterPDF(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23090Service.exporttls23090CounterPDF({ ...this.historyRequestBody })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService?.warnBubble?.('PDF 匯出失敗（專櫃卡別分析）。'),
      });
  }

  onExportCreditExcel(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23090Service.exporttls23090CreditExcel({ ...this.historyRequestBody, SortBy: this.mapSortFields(this.historyRequestBody.SortBy) })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: () => this.messageService?.warnBubble?.('EXCEL 匯出失敗（信用卡明細）。'),
      });
  }

  onExportCounterExcel(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23090Service.exporttls23090CounterExcel({ ...this.historyRequestBody, SortBy: this.mapSortFields(this.historyRequestBody.SortBy) })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: () => this.messageService?.warnBubble?.('EXCEL 匯出失敗（專櫃卡別分析）。'),
      });
  }

  buildFooterFromGrandTotal(): Record<string, string> | undefined {
    if (!Object.keys(this.grandTotal).length) return undefined;
    const footer: Record<string, string> = {};
    for (const col of this.columns) {
      if (col?.isTotal) {
        footer[col.field] = (this.grandTotal[col.field] ?? 0).toLocaleString();
      }
    }
    if (this.viewMode === 'credit' && this.creditGrandTotalStr) {
      footer['PAY_Name'] = this.creditGrandTotalStr;
    }
    return footer;
  }

  private extractCreditWrappers(res: CreditCardApiResponse): CreditCardWrapper[] {
    return Array.isArray(res.Data) ? res.Data : (res.Data ? [res.Data] : []);
  }

  private extractCounterItems(res: CounterCardApiResponse): CounterCardItem[] {
    if (!res.Data) return [];
    if (Array.isArray(res.Data)) return res.Data;
    return res.Data.QueryData ?? [];
  }

  private mapCreditRows(wrappers: CreditCardWrapper[]): CreditCardRow[] {
    const getDetails = (w: CreditCardWrapper): CreditCardDetail[] =>
      w.tLS23090_CreditDetails ?? w.TLS23090_CreditDetails ?? w.CreditDetails ?? w.Details ?? [];
    return wrappers
      .flatMap(w => getDetails(w))
      .map((r, idx) => ({ ...r, _rowKey: `crt|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? idx}` }));
  }

  private mapCounterRow(r: CounterCardItem, index: number): CounterCardRow {
    const list = r.CRD_Type_List ?? {};
    const pick = (brand: string, field: 'Count' | 'Amount') => Number(list[brand]?.[field] ?? 0);
    return {
      TXN_Date: r.TXN_Date, ECR_No: r.ECR_No, tlt_no: r.tlt_no, tlt_name: r.tlt_name,
      AE_Count: pick('AE', 'Count'), AE_Amount: pick('AE', 'Amount'),
      DA_Count: pick('DA', 'Count'), DA_Amount: pick('DA', 'Amount'),
      MASTER_Count: pick('MASTER', 'Count'), MASTER_Amount: pick('MASTER', 'Amount'),
      VISA_Count: pick('VISA', 'Count'), VISA_Amount: pick('VISA', 'Amount'),
      JCB_Count: pick('JCB', 'Count'), JCB_Amount: pick('JCB', 'Amount'),
      UnionPay_Count: pick('UnionPay', 'Count'), UnionPay_Amount: pick('UnionPay', 'Amount'),
      Others_Count: pick('Others', 'Count'), Others_Amount: pick('Others', 'Amount'),
      Total_Count: pick('Total', 'Count'), Total_Amount: pick('Total', 'Amount'),
      _rowKey: `cnt|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.tlt_no ?? ''}|${index}`,
    };
  }

  private mapInstallmentSummary(items?: InstallmentSummaryItem[]): InstallmentRow[] {
    return (items ?? []).map(s => ({
      termNo: Number(s.TERM_No),
      termName: s.TERM_Name ?? String(s.TERM_No),
      total: Number(s.TotalAmt ?? 0),
    }));
  }

  private computeCreditGrandTotal(wrappers: CreditCardWrapper[]): Record<string, number> {
    const grand: Record<string, number> = {};
    for (const [field, apiKey] of Object.entries(this.creditTotalFieldMap)) {
      grand[field] = wrappers.reduce((acc, w) => acc + Number(w[apiKey] ?? 0), 0);
    }
    return grand;
  }

  private computeCounterGrandTotal(rows: CounterCardRow[]): Record<string, number> {
    const grand: Record<string, number> = {};
    for (const brand of this.counterBrands) {
      grand[`${brand}_Count`] = rows.reduce((acc, r) => acc + (r[`${brand}_Count` as keyof CounterCardRow] as number ?? 0), 0);
      grand[`${brand}_Amount`] = rows.reduce((acc, r) => acc + (r[`${brand}_Amount` as keyof CounterCardRow] as number ?? 0), 0);
    }
    return grand;
  }

  private summaryToCounterGrandTotal(summary: CounterCardSummary): Record<string, number> {
    const grand: Record<string, number> = {};
    for (const brand of this.counterBrands) {
      const s = summary[brand as keyof CounterCardSummary];
      grand[`${brand}_Count`] = Number(s?.Count ?? 0);
      grand[`${brand}_Amount`] = Number(s?.Amount ?? 0);
    }
    return grand;
  }

  private mapSortFields(sortBy: SortField[] | undefined | null): SortField[] | undefined {
    if (!Array.isArray(sortBy)) return sortBy ?? undefined;
    return sortBy.map(s => ({ ...s, field: this.sortFieldAliasMap[s.field] ?? s.field }));
  }

  private showExportWarn(): void {
    this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
  }

  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const filename = this.getFilenameFromHeader(response.headers.get('Content-Disposition'), fileExtension);
    const blob = response.body;
    if (!blob || blob.size === 0) {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
      return;
    }
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    globalThis.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;
    const starMatch = /filename\*=([^;]+)/i.exec(contentDisposition);
    if (starMatch?.[1]) {
      return decodeURIComponent(starMatch[1].trim().replace(/^UTF-8''/, ''));
    }
    const match = /filename="([^"]+)"/i.exec(contentDisposition);
    if (match?.[1]) {
      return decodeURIComponent(match[1].replaceAll(/\+/g, ' '));
    }
    return `download${defaultExtension}`;
  }

  private ensureArr(v: string | string[] | null | undefined): string[] {
    if (Array.isArray(v)) return v;
    if (v == null || v === '') return [];
    return [v];
  }

  private toBoolOrNull(v: string | boolean | null | undefined): boolean | null {
    if (typeof v === 'boolean') return v;
    if (v == null || v === '') return null;
    const s = String(v).toUpperCase();
    return (s === 'Y' || s === 'TRUE' || s === '1') ? true
      : (s === 'N' || s === 'FALSE' || s === '0') ? false
        : null;
  }

  private prune<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const out = { ...obj } as Record<string, unknown>;
    for (const k of Object.keys(out)) {
      const v = out[k];
      if (v === '' || v === null || v === undefined) delete out[k];
      else if ((Array.isArray(v) && v.length === 0) || (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)) delete out[k];
    }
    return out as Partial<T>;
  }

  private toDateOnly(x: Date | string | null | undefined): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (Number.isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private readonly columnsCredit: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', format: formatDate, visible: true, width: '80px' },
    { field: 'ECR_No', header: '收銀機號', visible: true, width: '70px' },
    { field: 'TXN_No', header: '交易序號', visible: true, format: (v: string | number) => String(v ?? '').trim().padStart(6, '0'), width: '70px' },
    { field: 'tlt_no', header: '專櫃編號', visible: true, width: '70px' },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'CRD_Name', header: '信用卡卡別', visible: true, width: '70px' },
    { field: 'CRD_No', header: '信用卡卡號', visible: true, width: '130px' },
    { field: 'TXN_PayAmt', header: '金額', align: 'right', format: formatAmount, isTotal: true, visible: true, width: '70px' },
    { field: 'TXN_Point', header: '紅利', align: 'right', format: formatAmount, isTotal: true, visible: true, width: '70px' },
    { field: 'INST_Amt', header: '分期', align: 'right', format: formatAmount, isTotal: true, visible: true, width: '70px' },
    { field: 'PAY_Name', header: '分期期別', visible: true, format: (v: string) => v || '--', width: '100px' },
    { field: 'TERM_Name', header: '分期期數', visible: true, format: (v: string) => v || '--', width: '50px' },
    { field: 'EDC_InstHeadAmt', header: '頭期款分期金額', align: 'right', format: formatAmount, visible: true, width: '70px' },
    { field: 'EDC_InstEachAmt', header: '每期分期金額', align: 'right', format: formatAmount, visible: true, width: '70px' },
  ];

  private readonly columnsCounter: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', format: formatDate, visible: true },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃編號/名稱', visible: true, align: 'left' },
    { field: 'AE_Count', header: 'AE 筆數', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'AE_Amount', header: 'AE 金額', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'DA_Count', header: 'DA 筆數', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'DA_Amount', header: 'DA 金額', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'MASTER_Count', header: 'MASTER 筆數', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'MASTER_Amount', header: 'MASTER 金額', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'VISA_Count', header: 'VISA 筆數', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'VISA_Amount', header: 'VISA 金額', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'JCB_Count', header: 'JCB 筆數', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'JCB_Amount', header: 'JCB 金額', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'UnionPay_Count', header: 'UnionPay 筆數', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'UnionPay_Amount', header: 'UnionPay 金額', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'Others_Count', header: '其他 筆數', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'Others_Amount', header: '其他 金額', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'Total_Count', header: '合計 筆數', align: 'right', format: formatAmount, isTotal: true, visible: true },
    { field: 'Total_Amount', header: '合計 金額', align: 'right', format: formatAmount, isTotal: true, visible: true },
  ];
}

export const formatAmount = (val: number | string | null | undefined): string => {
  if (typeof val === 'string') return val !== '' ? val : '--';
  if (val == null || Number(val) === 0) return '--';
  const num = Number(val);
  return Number.isNaN(num) ? '--' : num.toLocaleString();
};
