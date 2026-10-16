import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23040Service } from '../../../service/api/tls/tls23040.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { formatAmount, formatDate, ReportColumn, } from '../../../shared/components/table-report/table-report.model';

@Component({
  selector: 'app-tls23040',
  templateUrl: './tls23040.component.html',
  styles: [`
    :host ::ng-deep {
      app-table-report .p-datatable-tbody > tr,
      app-table-report .p-datatable-tbody > tr > td {
        height: 60px !important;
        min-height: 60px !important;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    InputTextComponent,
    ButtonComponent,
    CheckboxModule,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    ButtonModule,
    InputTextRangeComponent,
    TableReportComponent,
  ],
})
export class TLS23040Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 狀態管理 =====
  viewMode: 'invoice' | 'payment' | 'discount' = 'invoice';
  invoiceRows: any[] = [];
  paymentRows: any[] = [];
  discountRows: any[] = [];

  private invoiceTotals: { TotalGUI: number; TotalSaleAmt: number } | null = null;
  private paymentTotals: { TotalPayAmt: number } | null = null;
  private discountTotals: { TotalSalePrc: number; TotalNet: number; TotalTax: number } | null = null;

  activeFooter: Record<string, number> | undefined = undefined;
  totalRecords = 0;
  public lastTotalCount = 0;
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
    TXN_Status: [],
    TXN_FlagStatus: [],
    TXN_PkngUID: [''],
    TXN_MemCard: [''],
    TXN_GUIBegNo: [''],
    tlt_building: [''],
    tlt_floor: [],
    org_id: [],
    ORG_TXN_DateStart: [null],
    ORG_TXN_DateEnd: [null],
    ExcludeNoGUI: [false],
    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[
      { field: 'tlt_no', order: 1 },
      { field: 'TXN_Date', order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
    ]],
  });

  // ===== 下拉選單資料源 =====
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  readonly statusFlagOptions = [
    { value: '1', label: '外交官零稅' },
    { value: '2', label: '事後登錄' },
  ];
  readonly txnStatusOptions = [
    { value: '1', label: '正常交易' }, { value: '2', label: '作廢交易' },
    { value: '3', label: '退貨交易' }, { value: '4', label: '預售交易' },
    { value: '5', label: '預售解約' }, { value: '6', label: '預售退貨' },
  ];

  private dropdownInit$?: Observable<any>;

  constructor(
    private readonly tls23040Service: TLS23040Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls11010Service: Tls11010Service,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23040', 'tls/tls23040cru', this.queryForm, (form) => this.onSubmit(form));
    this.queryForm.patchValue({ pageSize: 1000 }, { emitEvent: false });
    this.initDropdownData();
  }

  /**
   * 初始化下拉選單資料 (forkJoin 最佳實踐)
   */
  private initDropdownData(): void {
    this.dropdownInit$ ??= forkJoin({
      floors: this.dropdownApiService.querySys3900().pipe(map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name }))), catchError(() => of([]))),
      buildings: this.tls11010Service.getBuildingOptions().pipe(catchError(() => of([]))),
      orgs: this.dropdownApiService.querySys3100().pipe(catchError(() => of([]))),
      ecrs: this.dropdownApiService.queryPos1002().pipe(catchError(() => of([]))),
      counters: this.dropdownApiService.queryTltTalent().pipe(catchError(() => of([]))),
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.dropdownInit$.pipe(untilDestroyed(this)).subscribe((res) => {
      this.floorOptions = res.floors || [];
      this.BUILDING_NO_Options = res.buildings || [];

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

  // 畫面動態導引繫結
  get activeRows() {
    return this.viewMode === 'payment' ? this.paymentRows : this.viewMode === 'discount' ? this.discountRows : this.invoiceRows;
  }

  get activeColumns() {
    return this.viewMode === 'payment' ? this.paymentColumns : this.viewMode === 'discount' ? this.discountColumns : this.invoiceColumns;
  }

  // ========= 查詢（送出） =========
  onSubmit(form: FormGroup): void {
    const raw = this.queryForm.getRawValue() as any;
    const safeSort = this.sanitizeSortBy(raw?.SortBy);
    const sortBy = safeSort.length ? safeSort : this.getDefaultSortBy(this.viewMode);

    const payload: any = {
      TXN_DateStart: this.toDateOnly(raw?.TXN_DateStart ?? this.yesterday),
      TXN_DateEnd: this.toDateOnly(raw?.TXN_DateEnd ?? this.yesterday),
      ...((raw?.ECR_No ?? []).length ? { ECR_No: raw.ECR_No } : {}),
      ...((raw?.TLT_No ?? []).length ? { TLT_No: raw.TLT_No } : {}),
      ...((raw?.TXN_Status ?? []).length ? { TXN_Status: raw.TXN_Status } : {}),
      ...((raw?.TXN_FlagStatus ?? []).length ? { TXN_FlagStatus: raw.TXN_FlagStatus } : {}),
      ...((raw?.tlt_floor ?? []).length ? { tlt_floor: raw.tlt_floor } : {}),
      ...((raw?.org_id ?? []).length ? { org_id: raw.org_id } : {}),
      ...(raw?.tlt_building ? { tlt_building: raw.tlt_building } : {}),
      ...(raw?.TXN_PkngUID ? { TXN_PkngUID: raw.TXN_PkngUID } : {}),
      ...(raw?.TXN_MemCard ? { TXN_MemCard: raw.TXN_MemCard } : {}),
      ...(raw?.TXN_GUIBegNo ? { TXN_GUIBegNo: raw.TXN_GUIBegNo } : {}),
      ...(this.toNumOrUndef(raw?.TXN_No_Start) != null ? { TXN_No_Start: this.toNumOrUndef(raw?.TXN_No_Start) } : {}),
      ...(this.toNumOrUndef(raw?.TXN_No_End) != null ? { TXN_No_End: this.toNumOrUndef(raw?.TXN_No_End) } : {}),
      ...(this.toDateOnly(raw?.ORG_TXN_DateStart) ? { ORG_TXN_DateStart: this.toDateOnly(raw?.ORG_TXN_DateStart) } : {}),
      ...(this.toDateOnly(raw?.ORG_TXN_DateEnd) ? { ORG_TXN_DateEnd: this.toDateOnly(raw?.ORG_TXN_DateEnd) } : {}),
      ExcludeNoGUI: raw?.ExcludeNoGUI === true,
      pageIndex: Number(raw?.pageIndex) || 1,
      pageSize: Number(raw?.pageSize) || 1000,
      SortBy: sortBy,
    };

    this.historyRequestBody = { ...payload };
    this.loading = true;
    this.messageService?.blockUi();

    this.tls23040Service.queryTLS23040(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
          this.messageService?.unblockUi();
        })
      )
      .subscribe({
        next: (res: any) => {
          const packs: any[] = Array.isArray(res?.Data) ? res.Data : [];

          // 1. 處理發票明細
          this.invoiceRows = packs
            .flatMap(p => Array.isArray(p?.invoice?.InvoiceDetail) ? p.invoice.InvoiceDetail : [])
            .map((r: any, i: number) => {
              const isOrgBlank = ['正常交易', '預售交易'].includes(String(r?.TXN_StatusName ?? ''));
              const dateOnly = formatDate(r?.TXN_Date);
              const txnNoPadded = this.padTxnNo(r?.TXN_No);
              return {
                ...r,
                ORG_TXN_Date: isOrgBlank ? '' : (r?.ORG_TXN_Date ?? ''),
                ORG_ECR_No: isOrgBlank ? '' : (r?.ORG_ECR_No ?? ''),
                ORG_TXN_No: isOrgBlank ? '' : (r?.ORG_TXN_No ?? ''),
                TXN_DateOnly: dateOnly,
                _grpKey: `${dateOnly}/${r?.ECR_No ?? ''}/${txnNoPadded}`,
                _rowKey: `inv|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
              };
            });
          this.invoiceTotals = {
            TotalGUI: packs.reduce((s, p) => s + Number(p?.invoice?.TotalGUI ?? 0), 0),
            TotalSaleAmt: packs.reduce((s, p) => s + Number(p?.invoice?.TotalSaleAmt ?? 0), 0),
          };

          // 2. 處理付款明細
          this.paymentRows = packs
            .flatMap(p => Array.isArray(p?.payment?.PaymentDetail) ? p.payment.PaymentDetail : [])
            .map((r: any, i: number) => {
              const dateOnly = formatDate(r?.TXN_Date);
              const txnNoPadded = this.padTxnNo(r?.TXN_No);
              return {
                ...r,
                TXN_DateOnly: dateOnly,
                _grpKey: `${dateOnly}/${r?.ECR_No ?? ''}/${txnNoPadded}`,
                _rowKey: `pay|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
              };
            });
          this.paymentTotals = {
            TotalPayAmt: packs.reduce((s, p) => s + Number(p?.payment?.TotalPayAmt ?? 0), 0),
          };

          // 3. 處理折扣明細
          this.discountRows = packs
            .flatMap(p => Array.isArray(p?.discount?.DiscountDetail) ? p.discount.DiscountDetail : [])
            .map((r: any, i: number) => {
              const dateOnly = formatDate(r?.TXN_Date);
              const txnNoPadded = this.padTxnNo(r?.TXN_No);
              return {
                ...r,
                TXN_DateOnly: dateOnly,
                _grpKey: `${dateOnly}/${r?.ECR_No ?? ''}/${txnNoPadded}`,
                _rowKey: `disc|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
              };
            });
          this.discountTotals = {
            TotalSalePrc: packs.reduce((s, p) => s + Number(p?.discount?.TotalSalePrc ?? 0), 0),
            TotalNet: packs.reduce((s, p) => s + Number(p?.discount?.TotalNet ?? 0), 0),
            TotalTax: packs.reduce((s, p) => s + Number(p?.discount?.TotalTax ?? 0), 0),
          };

          this.lastTotalCount = Number(res?.TotalCount ?? this.activeRows.length ?? 0);
          this.totalRecords = this.lastTotalCount;
          this.updateActiveFooter();
        },
        error: () => this.handleQueryError()
      });
  }

  private handleQueryError(): void {
    this.invoiceRows = this.paymentRows = this.discountRows = [];
    this.invoiceTotals = this.paymentTotals = this.discountTotals = null;
    this.totalRecords = 0;
    this.lastTotalCount = 0;
    this.activeFooter = undefined;
  }

  onViewChange(): void {
    this.totalRecords = this.lastTotalCount;
    this.updateActiveFooter();
    if (this.historyRequestBody) {
      this.historyRequestBody = {
        ...this.historyRequestBody,
        pageIndex: 1,
        SortBy: this.getDefaultSortBy(this.viewMode),
      };
    }
  }

  // ========= <app-table-report> 報表封裝調用群 =========
  public queryTLS23040ForReport = (body: any) => {
    const safeSort = this.sanitizeSortBy(body?.SortBy);
    const sortBy = safeSort.length ? safeSort : this.getDefaultSortBy(this.viewMode);

    if (this.historyRequestBody) {
      this.historyRequestBody = { ...this.historyRequestBody, SortBy: sortBy };
    }

    return this.tls23040Service.queryTLS23040({
      ...body,
      pageSize: 1000,
      SortBy: sortBy,
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
    }).pipe(
      map((res: any) => {
        const packs: any[] = Array.isArray(res?.Data) ? res.Data : [];
        let rows: any[] = [];
        let grand: Record<string, number> = {};

        if (this.viewMode === 'invoice') {
          rows = packs
            .flatMap(p => Array.isArray(p?.invoice?.InvoiceDetail) ? p.invoice.InvoiceDetail : [])
            .map((r: any, i: number) => {
              const isOrgBlank = ['正常交易', '預售交易'].includes(String(r?.TXN_StatusName ?? ''));
              const dateOnly = formatDate(r?.TXN_Date);
              const txnNoPadded = this.padTxnNo(r?.TXN_No);
              return {
                ...r,
                ORG_TXN_Date: isOrgBlank ? '' : (r?.ORG_TXN_Date ?? ''),
                ORG_ECR_No: isOrgBlank ? '' : (r?.ORG_ECR_No ?? ''),
                ORG_TXN_No: isOrgBlank ? '' : (r?.ORG_TXN_No ?? ''),
                TXN_DateOnly: dateOnly,
                _grpKey: `${dateOnly}/${r?.ECR_No ?? ''}/${txnNoPadded}`,
                _rowKey: `inv|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
              };
            });
          grand = {
            TXN_TotGUI: packs.reduce((s, p) => s + Number(p?.invoice?.TotalGUI ?? 0), 0),
            TXN_TotSaleAmt: packs.reduce((s, p) => s + Number(p?.invoice?.TotalSaleAmt ?? 0), 0),
          };
        } else if (this.viewMode === 'payment') {
          rows = packs
            .flatMap(p => Array.isArray(p?.payment?.PaymentDetail) ? p.payment.PaymentDetail : [])
            .map((r: any, i: number) => {
              const dateOnly = formatDate(r?.TXN_Date);
              const txnNoPadded = this.padTxnNo(r?.TXN_No);
              return {
                ...r,
                TXN_DateOnly: dateOnly,
                _grpKey: `${dateOnly}/${r?.ECR_No ?? ''}/${txnNoPadded}`,
                _rowKey: `pay|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
              };
            });
          grand = { TXN_PayAmt: packs.reduce((s, p) => s + Number(p?.payment?.TotalPayAmt ?? 0), 0) };
        } else {
          rows = packs
            .flatMap(p => Array.isArray(p?.discount?.DiscountDetail) ? p.discount.DiscountDetail : [])
            .map((r: any, i: number) => {
              const dateOnly = formatDate(r?.TXN_Date);
              const txnNoPadded = this.padTxnNo(r?.TXN_No);
              return {
                ...r,
                TXN_DateOnly: dateOnly,
                _grpKey: `${dateOnly}/${r?.ECR_No ?? ''}/${txnNoPadded}`,
                _rowKey: `disc|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
              };
            });
          grand = {
            TXN_SaleAmt: packs.reduce((s, p) => s + Number(p?.discount?.TotalSalePrc ?? 0), 0),
            TXN_Net: packs.reduce((s, p) => s + Number(p?.discount?.TotalNet ?? 0), 0),
            TXN_Tax: packs.reduce((s, p) => s + Number(p?.discount?.TotalTax ?? 0), 0),
          };
        }

        const totalCount = Number(res?.TotalCount ?? rows.length ?? 0);
        this.lastTotalCount = totalCount;
        this.totalRecords = totalCount;
        this.activeFooter = { ...grand };
        return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
      })
    );
  };

  // ========= 檔案匯出與 URL 解析最佳實踐 =========
  onExportPDFClick(ev?: Event): void {
    ev?.preventDefault?.();
    ev?.stopPropagation?.();
    this.onExportPDF();
  }

  onExportPDF(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    if (this.lastTotalCount <= 0) return this.showNoDataWarn();

    this.btnLoading = true;
    this.tls23040Service.exportTLS23040PDF({ ...this.historyRequestBody, ReportType: this.viewMode })
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (res) => {
          const urlPath = res?.Data;
          if (!urlPath) {
            this.messageService?.warnBubble?.(res?.ReturnMessage || '沒有回傳 PDF 路徑');
            return;
          }
          const openUrl = this.resolveTempUrlForOpen(urlPath);
          if (!openUrl) {
            this.messageService?.warnBubble?.('PDF 路徑不正確，無法開啟。');
            return;
          }
          globalThis.open(openUrl, '_blank', 'noopener');
        },
        error: () => this.messageService?.errorBubble?.('PDF 匯出失敗'),
      });
  }

  onExportXLSX(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    if (this.lastTotalCount <= 0) return this.showNoDataWarn();

    this.btnLoading = true;
    this.tls23040Service.exportTLS23040Excel({ ...this.historyRequestBody, ReportType: this.viewMode })
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (r: HttpResponse<Blob>) => this.handleFileExport(r, '.xlsx'),
        error: () => this.messageService?.errorBubble?.('Excel 匯出失敗'),
      });
  }

  private showExportWarn(): void { this.messageService?.warnBubble?.('請先執行查詢以產生報表。'); }
  private showNoDataWarn(): void { this.messageService?.warnBubble?.('目前沒有資料可匯出。'); }

  private resolveTempUrlForOpen(pathOrUrl: string): string {
    if (!pathOrUrl) return '';
    if (pathOrUrl.toLowerCase().startsWith('http://') || pathOrUrl.toLowerCase().startsWith('https://')) {
      return pathOrUrl;
    }
    const idx = pathOrUrl.indexOf('/temp/');
    const tempPath = idx >= 0 ? pathOrUrl.substring(idx) : pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    const apiBase = this.tls23040Service.apiUrl || '';
    const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
    return `${cleanBase}${tempPath}`;
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

  // 依檢視維度更新總計資訊
  private updateActiveFooter() {
    if (this.viewMode === 'invoice') {
      this.activeFooter = this.invoiceTotals ? { TXN_TotGUI: this.invoiceTotals.TotalGUI, TXN_TotSaleAmt: this.invoiceTotals.TotalSaleAmt } : undefined;
    } else if (this.viewMode === 'payment') {
      this.activeFooter = this.paymentTotals ? { TXN_PayAmt: this.paymentTotals.TotalPayAmt } : undefined;
    } else {
      this.activeFooter = this.discountTotals ? { TXN_SaleAmt: this.discountTotals.TotalSalePrc, TXN_Net: this.discountTotals.TotalNet, TXN_Tax: this.discountTotals.TotalTax } : undefined;
    }
  }

  // ========= 工具群與小清洗機制 =========
  private readonly ensureArr = (v: any) => Array.isArray(v) ? v : v == null || v === '' ? [] : [v];
  private readonly toNumOrUndef = (v: any) => v == null || v === '' || Number.isNaN(Number(v)) ? undefined : Number(v);
  private readonly padTxnNo = (v: any): string => String(v ?? '').trim().padStart(6, '0');
  private readonly sanitizeSortBy = (sortBy: any[] | undefined) => Array.isArray(sortBy) ? sortBy.filter(s => s && typeof s.field === 'string' && !s.field.startsWith('_')) : [];

  private getDefaultSortBy(mode: 'invoice' | 'payment' | 'discount') {
    const base = [
      { field: 'TXN_Date', order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 }
    ];
    return mode === 'payment' ? base : [{ field: 'tlt_no', order: 1 }, ...base];
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (Number.isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private readonly getLabelFromOptions = (value: any, options: any[]): string => options?.find((opt) => String(opt.value) === String(value))?.label ?? value;

  // ===== 報表欄位結構定義 (採用共通 ReportColumn 規範且修正對齊樣式) =====
  invoiceColumns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: (v: any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'gui_track', header: '發票起始號碼(字軌)', visible: true },
    { field: 'GUIBegNo', header: '發票起始號碼', visible: true },
    { field: 'GUIEndNo', header: '發票結束號碼', visible: true },
    { field: 'TXN_TotGUI', header: '發票金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_TotSaleAmt', header: '業績金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_StatusName', header: '交易型態', visible: true, format: (val: any) => this.getLabelFromOptions(val, this.txnStatusOptions) },
    { field: 'TXN_VIP', header: '外交官零稅', visible: true, format: (v: any) => v === 'Y' ? '是' : '否' },
    { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true },
    { field: 'USR_No', header: '收銀員', visible: true },
    { field: 'TXN_PkngUID', header: '停車卡號', visible: true },
    { field: 'ORG_TXN_Date', header: '原交易日期', visible: true, format: formatDate },
    { field: 'ORG_ECR_No', header: '原收銀機號', visible: true },
    { field: 'ORG_TXN_No', header: '原交易序號', visible: true, format: (v: any) => this.padTxnNo(v) },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    { field: 'TXN_TotPayScoreAmt', header: '會員積點折抵', visible: true, align: 'right', format: formatAmount },
  ];

  paymentColumns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: (v: any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'PAY_NO', header: '付款別代號', visible: true },
    { field: 'PAY_NAME', header: '付款別', visible: true },
    { field: 'TXN_PayAmt', header: '金額', visible: true, align: 'right', format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'CRD_Name', header: '信用卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號/條碼', visible: true, align: 'right' },
    { field: 'TERM_No', header: '分期', visible: true },
  ];

  discountColumns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: (v: any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'TXN_SaleAmt', header: '單項售價', visible: true, align: 'right', format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'TXN_Net', header: '未稅(免稅)金額', visible: true, align: 'right', format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'TXN_Tax', header: '稅額', visible: true, align: 'right', format: formatAmount, isTotal: true, isSubTotal: true },
    { field: 'tlt_id', header: '抽成別代號', visible: true },
    { field: 'tlt_id_desc', header: '商品抽成類別', visible: true },
    { field: 'PRM_TXN_DiscName', header: '原折扣', visible: true },
    { field: 'PLU_TaxTypeName', header: '稅別', visible: true },
    { field: 'PLU_No', header: '報帳條碼', visible: true },
    { field: 'TXN_StatusName', header: '狀態', visible: true },
  ];
}
