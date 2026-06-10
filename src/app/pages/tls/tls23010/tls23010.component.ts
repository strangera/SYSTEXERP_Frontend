import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map, shareReplay } from 'rxjs/operators';
import { formatAmount, formatDate, formatYN, ReportColumn } from 'src/app/shared/componentkit/table-report/table-report.model';
import { yesterday } from 'src/app/shared/models/system/query-form.model';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23010Data, TLS23010OtherData, TLS23010Service } from '../../../service/api/tls/tls23010.service';
import { ECRNoService } from '../../../service/basic/queryPOS1002.service';
import { CashierService } from '../../../service/basic/queryPOS2001.service';
import { FloorService } from '../../../service/basic/querySYS3900.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextRange2Component } from './input-text-range2/input-text-range2.component';

@Component({
  selector: 'app-tls23010',
  templateUrl: './tls23010.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeQuickComponent, MultiSelectComponent, InputTextComponent, DropdownComponent,
    InputTextModule, ButtonComponent, DialogModule, RadioButtonModule, TranslateModule,
    ButtonModule, CheckboxModule, TableReportComponent, InputTextRange2Component
  ],
})
export class TLS23010Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 狀態管理 =====
  pdfSummary: string[] = [];
  data: TLS23010Data[] = [];
  showTable = true;
  summaryData: any[] = [];
  totalRecords = 0;
  btnLoading = false;
  historyRequestBody: any | null = null;

  detailTotals: Record<string, number> = {};
  summaryTotals: Record<string, number> = {};

  private readonly detailTotalFieldMap: Record<string, string> = {
    TXN_TotGUI: 'Total_TXN_TotGUI',
    TXN_TotSaleAmt: 'Total_TXN_TotSaleAmt',
    TXN_TotOver: 'Total_TXN_TotOver',
    TXN_TotDisc: 'Total_TXN_TotDisc',
    TXN_PayAmt: 'Total_TXN_PayAmt',
  };

  // ===== 表單宣告 =====
  queryForm = this.formBuilder.group({
    TXN_DateStart: [yesterday, [Validators.required]],
    TXN_DateEnd: [yesterday, [Validators.required]],
    ECR_No: [[]],
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [[]],
    TXN_GUIBegNo: [null, [Validators.maxLength(8), Validators.minLength(8)]],
    TXN_GUIEndNo: [null, [Validators.maxLength(8), Validators.minLength(8)]],
    TXN_Status: [[]],
    TXN_FlagStatus: [[]],
    USR_No: [''],
    TXN_PreOrderNo: [''],
    TXN_PkngUID: [''],
    TXN_MemCard: [''],
    TXN_Uniform: [''],
    TXN_GUILoveCode: [''],
    TXN_GUI_CarrType: [[]],
    TXN_GUIVehicle: [''],
    rece_yn: [''],
    cash_yn: [''],
    tlt_building: [''],
    tlt_floor: [[]],
    org_id: [[]],
    TXN_Subtype: [''],
    showSummary: [false],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[
      { field: 'TXN_Date', order: 1 },
      { field: 'tlt_no', order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
    ]],
  });

  // ===== 下拉選單資料源 =====
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  cashierOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  readonly statusFlagOptions = [
    { value: '1', label: '外交官零稅' },
    { value: '2', label: '事後登錄' },
    { value: '3', label: '預售' },
  ];
  readonly whetherOptions = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
    { value: null, label: '全部' },
  ];
  readonly txnStatusOptions = [
    { value: '1', label: '正常交易' },
    { value: '2', label: '作廢交易' },
    { value: '3', label: '退貨交易' },
    { value: '4', label: '預售交易' },
    { value: '5', label: '預售解約' },
    { value: '6', label: '預售退貨' },
  ];
  readonly carrierTypeOptions = getSYS1000Options('TXN_GUI_CarrType');

  private dropdownInit$?: Observable<any>;

  constructor(
    private readonly tls23010Service: TLS23010Service,
    private readonly cdr: ChangeDetectorRef,
    private readonly tls11010Service: Tls11010Service,
    private readonly floorService: FloorService,
    private readonly counterNameService: CounterNameService,
    private readonly ECRNoService: ECRNoService,
    private readonly cashierService: CashierService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23010', 'tls/tls23010', this.queryForm, (form) => this.onSubmit(form));
    this.initDropdownData();
  }

  private initDropdownData(): void {
    this.dropdownInit$ ??= forkJoin({
      floors: this.floorService.getFloors(),
      buildings: this.tls11010Service.getBuildingOptions(),
      orgs: this.tls11010Service.getOrgOptions(),
      counters: this.counterNameService.getCounters(),
      ecrs: this.ECRNoService.getECRNo(),
      cashiers: this.cashierService.getCashierOptions(),
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.dropdownInit$.pipe(untilDestroyed(this)).subscribe((res) => {
      this.floorOptions = res.floors || [];
      this.BUILDING_NO_Options = res.buildings || [];

      const mapStandardOption = (x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      });

      this.OrganizationCodeOptions = (res.orgs || []).map(mapStandardOption);
      this.CounterOptions = (res.counters || []).map(mapStandardOption);
      this.ECRNoOptions = (res.ecrs || []).map(mapStandardOption);
      this.cashierOptions = (res.cashiers || []).map(mapStandardOption);
    });
  }

  // ========= 查詢（明細 / 彙總） =========
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const val = this.queryForm.getRawValue();
      const isSummary = !!val.showSummary;

      this.resetTableState();

      setTimeout(() => {
        this.showTable = true;
        this.cdr.detectChanges();

        const payload = this.cleanPayload({
          ...val,
          TXN_DateStart: this.toDateOnly(val.TXN_DateStart),
          TXN_DateEnd: this.toDateOnly(val.TXN_DateEnd),
          TXN_No_Start: this.normalizeTxnNo(val.TXN_No_Start) || undefined,
          TXN_No_End: this.normalizeTxnNo(val.TXN_No_End) || undefined,
        });
        delete payload.showSummary;

        if (!isSummary) {
          this.executeDetailQuery(payload);
        } else {
          this.executeSummaryQuery(payload);
        }
      });
    });
  }

  private resetTableState(): void {
    this.showTable = false;
    this.data = [];
    this.summaryData = [];
    this.totalRecords = 0;
    this.detailTotals = {};
    this.summaryTotals = {};
    this.historyRequestBody = null;
    this.cdr.detectChanges();
  }

  private cleanPayload(obj: any): any {
    return Object.keys(obj).reduce((acc: any, key) => {
      const val = obj[key];
      if (
        val !== null &&
        val !== undefined &&
        !(Array.isArray(val) && val.length === 0) &&
        !(typeof val === 'string' && val.trim() === '')
      ) {
        acc[key] = val;
      }
      return acc;
    }, {});
  }

  private executeDetailQuery(payload: any): void {
    this.historyRequestBody = { ...payload };
    this.tls23010Service.queryTLS23010(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp: any) => {
          const queryData = resp?.Data?.QueryData ?? resp?.Data ?? [];
          this.data = (Array.isArray(queryData) ? queryData : []) as TLS23010Data[];
          this.detailTotals = this.coerceNumberMap(resp?.Data?.TotalSummary);
          this.totalRecords = Number(resp?.TotalCount ?? this.data.length ?? 0);
          this.finalizeQuerySuccess();
        },
        error: () => this.handleQueryError(),
      });
  }

  private executeSummaryQuery(payload: any): void {
    const summaryBody = { ...payload };
    delete summaryBody.pageIndex;
    delete summaryBody.pageSize;

    this.tls23010Service.queryTLS23010Summary(summaryBody)
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp: any) => {
          const dataArr = Array.isArray(resp?.Data) ? resp.Data : [];
          const head = dataArr[0] ?? {};
          const details = head?.tLS23010Summary_Details ?? head?.TLS23010Summary_Details ?? [];

          this.summaryData = Array.isArray(details) ? details.map((row: any) => ({ ...row })) : [];
          this.totalRecords = this.summaryData.length;
          this.summaryTotals = this.coerceNumberMap({
            Total_TXN_TotGUI: head?.Total_TXN_TotGUI,
            Total_TXN_TotGUI_Inv: head?.Total_TXN_TotGUI_Inv,
          });

          this.historyRequestBody = {
            ...summaryBody,
            pageIndex: 1,
            pageSize: this.summaryData.length || 30,
          };
          this.finalizeQuerySuccess();
        },
        error: () => this.handleQueryError(),
      });
  }

  private finalizeQuerySuccess(): void {
    this.updatePdfSummary?.();
    this.queryStateService?.setQueryState?.(this.ProgNo, this.queryForm.value);
  }

  private handleQueryError(): void {
    this.data = [];
    this.summaryData = [];
    this.totalRecords = 0;
    this.detailTotals = {};
    this.summaryTotals = {};
    this.pdfSummary = [];
  }

  onToggleSummary(): void {
    this.queryForm.patchValue({ pageIndex: 1, pageSize: 30 }, { emitEvent: false });
    this.onSubmit(this.queryForm);
  }

  public queryTLS23010ForReport = (body: any) =>
    this.tls23010Service.queryTLS23010({
      ...body,
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
    }).pipe(
      map((res: any) => ({
        Data: res?.Data?.QueryData ?? res?.Data ?? [],
        TotalCount: Number(res?.TotalCount ?? res?.Data?.TotalCount ?? 0),
        GrandTotal: res?.Data?.TotalSummary ?? null,
      }))
    );

  public queryTLS23010SummaryForReport = (body: any) =>
    this.tls23010Service.queryTLS23010Summary({
      ...body,
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
    }).pipe(
      map((resp: any) => {
        const dataArr = Array.isArray(resp?.Data) ? resp.Data : [];
        const head = dataArr[0] ?? {};
        const all = head?.tLS23010Summary_Details ?? head?.TLS23010Summary_Details ?? [];

        this.summaryTotals = this.coerceNumberMap({
          Total_TXN_TotGUI: head?.Total_TXN_TotGUI,
          Total_TXN_TotGUI_Inv: head?.Total_TXN_TotGUI_Inv,
        });

        return {
          Data: Array.isArray(all) ? all : [],
          TotalCount: all.length || 0,
          GrandTotal: null,
        };
      })
    );

  loadDetails = (row: TLS23010Data) => {
    return this.tls23010Service.queryTLS23010Detail({
      SYS_StoreNo: row.SYS_StoreNo,
      TXN_Date: row.TXN_Date,
      ECR_No: row.ECR_No,
      TXN_No: row.TXN_No,
    }).pipe(map((list: any[]) => ({ Data: list ?? [] })));
  };

  private prepareExportBody(): any {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return null;
    }
    const exportBody = { ...this.historyRequestBody };
    const omitKeys = ['pageIndex', 'pageSize', 'PageIndex', 'PageSize', 'Offset', 'OrderBy'];
    omitKeys.forEach(k => delete exportBody[k]);
    return exportBody;
  }

  onExportPDF(): void {
    const body = this.prepareExportBody();
    if (!body) return;

    this.btnLoading = true;
    const obs$ = this.isSummaryMode ? this.tls23010Service.exportTLS23010SummaryPDF(body) : this.tls23010Service.exportTLS23010PDF(body);
    obs$.pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp) => this.handleFileExport(resp, '.pdf') });
  }

  onExportXLSX(): void {
    const body = this.prepareExportBody();
    if (!body) return;

    this.btnLoading = true;
    const obs$ = this.isSummaryMode ? this.tls23010Service.exportTLS23010SummaryExcel(body) : this.tls23010Service.exportTLS23010Excel(body);
    obs$.pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp) => this.handleFileExport(resp, '.xlsx') });
  }

  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const blob = response.body;
    if (blob && blob.size > 0) {
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      a.remove();
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      try { return decodeURIComponent(filenameStarMatch[1].replace(/^UTF-8''/, '')); } catch { return filenameStarMatch[1]; }
    }
    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      try { return decodeURIComponent(filenameMatch[1].replaceAll('+', ' ')); } catch { return filenameMatch[1]; }
    }
    return `download${defaultExtension}`;
  }

  // ========= 資料計算與轉換核心 =========
  private getSum(field: string): number {
    if (!this.isSummaryMode) {
      const mapped = this.detailTotalFieldMap[field];
      if (mapped != null && typeof this.detailTotals?.[mapped] === 'number') {
        return this.detailTotals[mapped];
      }
      return (this.data ?? []).reduce((s, r: any) => s + (Number(r?.[field]) || 0), 0);
    }
    return (this.summaryData ?? []).reduce((s, r) => s + (Number(r?.[field]) || 0), 0);
  }

  private buildSummaryFromLocal(): void {
    const A = this.getSum('TXN_TotGUI');
    const B = this.getSum('TXN_TotPayAmt');
    const C = this.getSum('TXN_TotOver');
    const D = this.getSum('TXN_Deposit');
    const E = this.getSum('TXN_DepositSettle');
    const F = this.getSum('TXN_DepositUsed');
    const G = this.getSum('TXN_TotDisc');
    const H = this.getSum('TXN_PresaleSettle') || this.getSum('TXN_TaxFreeCertNo');

    const discountValue = A + B - C + E - G + H;
    const paymentValue = A + B + D - F;

    this.renderPdfSummaryText(A, B, C, D, E, F, G, H, discountValue, paymentValue);
  }

  private updatePdfSummary(): void {
    if (this.isSummaryMode) {
      this.pdfSummary = [];
      return;
    }

    const req = this.historyRequestBody;
    if (!req) {
      this.buildSummaryFromLocal();
      return;
    }

    this.tls23010Service.queryOtherData(req)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (data: TLS23010OtherData | null) => {
          if (!data) {
            this.buildSummaryFromLocal();
            return;
          }
          const A = Number(data.A ?? 0);
          const B = Number(data.B ?? 0);
          const C = Number(data.C ?? 0);
          const D = Number(data.D ?? 0);
          const E = Number(data.E ?? 0);
          const F = Number(data.F ?? 0);
          const G = Number(data.G ?? 0);
          const H = Number(data.H ?? 0);

          const discountValue = Number.isFinite(Number(data.tlt_AchAmt)) ? Number(data.tlt_AchAmt) : (A + B - C + E - G + H);
          const paymentValue = Number.isFinite(Number(data.pay_AchAmt)) ? Number(data.pay_AchAmt) : (A + B + D - F);

          this.renderPdfSummaryText(A, B, C, D, E, F, G, H, discountValue, paymentValue);
        },
        error: () => this.buildSummaryFromLocal(),
      });
  }

  private renderPdfSummaryText(A: number, B: number, C: number, D: number, E: number, F: number, G: number, H: number, disc: number, pay: number): void {
    this.pdfSummary = [
      `(A)發票金額 =\t${A.toLocaleString()}`,
      `(B)已開發票的支付工具 =\t${B.toLocaleString()}`,
      `(C)已開發票的支付工具溢收 =\t${C.toLocaleString()}`,
      `(D)訂金 =\t${D.toLocaleString()}`,
      `(E)訂金結帳全額 =\t${E.toLocaleString()}`,
      `(F)訂金結帳的訂金 =\t${F.toLocaleString()}`,
      `(G)預售 =\t${G.toLocaleString()}`,
      `(H)預售結帳金額 =\t${H.toLocaleString()}`,
      '====================================================',
      `折扣別(專櫃業績) = (A)+(B)-(C)+(E)-(G)+(H) =\t${disc.toLocaleString()}`,
      `付款別(支付工具) = (A)+(B)+(D)-(F) =\t${pay.toLocaleString()}`,
    ];
  }

  buildFooterFromTotals(): Record<string, any> | undefined {
    if (!this.detailTotals) return undefined;
    return {
      TXN_TotGUI: this.detailTotals['Total_TXN_TotGUI'] ?? 0,
      TXN_TotSaleAmt: this.detailTotals['Total_TXN_TotSaleAmt'] ?? 0,
      TXN_TotOver: this.detailTotals['Total_TXN_TotOver'] ?? 0,
      TXN_TotDisc: this.detailTotals['Total_TXN_TotDisc'] ?? 0,
      TXN_PayAmt: this.detailTotals['Total_TXN_PayAmt'] ?? 0,
    };
  }

  buildFooterFromSummaryTotals(): Record<string, any> | undefined {
    if (!this.summaryTotals) return undefined;
    return {
      TXN_TotGUI: this.summaryTotals['Total_TXN_TotGUI'] ?? 0,
    };
  }

  // ========= 資料格式化小工具群 =========
  private normalizeTxnNo(v: any, maxLen = 6): string {
    const s = String(v ?? '').trim();
    if (!s) return '';
    const digits = s.replace(/\D+/g, '');
    return digits ? digits.padStart(maxLen, '0') : '';
  }

  private coerceNumberMap(src: any): Record<string, number> {
    const out: Record<string, number> = {};
    if (!src) return out;
    for (const k of Object.keys(src)) { out[k] = Number(src[k]) || 0; }
    return out;
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (Number.isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  formatISOToHHMMSS = (val: string): string => {
    if (!val) return '';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  getLabelFromOptions = (value: any, options: any[]): string => options?.find((o) => String(o.value) === String(value))?.label ?? value;
  padTxnNo = (v: any): string => this.normalizeTxnNo(v, 6);
  pToYesNoSafe = (val: unknown): string => String(val ?? '').trim().toUpperCase() === 'P' ? '是' : '否';
  nullpToYesNoSafe = (val: unknown): string => String(val ?? '').trim().toUpperCase() === 'N' ? '否' : '是';

  get isSummaryMode(): boolean {
    return !!this.queryForm.get('showSummary')?.value;
  }

  // ===== 報表欄位結構定義 (已採用共通 ReportColumn 規範) =====
  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, align: 'right', format: (v: any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'TXN_Uniform', header: '統一編號', visible: true },
    { field: 'gui_track', header: '字軌', visible: true },
    { field: 'GUIBegNo', header: '發票起始號碼', visible: true },
    { field: 'GUIEndNo', header: '發票結束號碼', visible: true },
    { field: 'TXN_TotGUI', header: '發票金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_TotSaleAmt', header: '銷售金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_TotOver', header: '溢收金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'TXN_VIP', header: '外交官零稅', visible: true, format: formatYN },
    { field: 'TXN_Mode', header: '事後登錄', visible: true, format: this.pToYesNoSafe, showSort: false },
    { field: 'TXN_PreOrder', header: '預售', visible: true, format: this.nullpToYesNoSafe, showSort: false },
    { field: 'TXN_StatusName', header: '交易型態', visible: true },
    { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true },
    { field: 'TXN_Time', header: '交易時間', visible: true, format: this.formatISOToHHMMSS },
    { field: 'USR_No', header: '收銀員', visible: true, align: 'left' },
    { field: 'TXN_PreOrderNo', header: '預售/訂金單號', visible: true },
    { field: 'ORG_TXN_Date', header: '原交易日期', visible: true, format: formatDate },
    { field: 'ORG_ECR_No', header: '原收銀機號', visible: true },
    { field: 'ORG_TXN_No', header: '原交易序號', visible: true, align: 'right' },
    { field: 'TXN_PkngUID', header: '停車車牌', visible: true },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    { field: 'TXN_TotDisc', header: '折扣/讓金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
    { field: 'GUILoveStatus', header: '捐贈狀態', visible: true, format: formatYN },
    { field: 'TXN_GUILoveCode', header: '捐贈社福團體代碼', visible: true },
    { field: 'TXN_GUIRemark', header: '防偽隨機碼', visible: true },
    { field: 'TXN_GUI_CarrType', header: '載具種類', visible: true, format: (v: any) => this.getLabelFromOptions(v, this.carrierTypeOptions) },
    { field: 'TXN_GUIVehicle', header: '載具號碼', visible: true },
    { field: 'TXN_PrintTimes', header: '發票列印次數', visible: true, align: 'right' },
    { field: 'TXN_PrintGUI', header: '電子發票是否列印', visible: true, format: formatYN },
    { field: 'CRD_Name', header: '信用卡別', visible: true },
    { field: 'CRD_No', header: '號碼', visible: true },
    { field: 'TERM_No', header: '分期期數', visible: true, align: 'right' },
    { field: 'TXN_PayAmt', header: '金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
  ];

  detailcolumns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', format: formatDate },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'TXN_No', header: '交易序號', align: 'right', format: (v: any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
    { field: 'PAY_NAME', header: '付款別' },
    { field: 'CRD_Name', header: '卡別' },
    { field: 'CRD_No', header: '號碼' },
    { field: 'TERM_No', header: '分期期數', align: 'right' },
    { field: 'TXN_PayAmt', header: '金額', align: 'right', format: formatAmount, isTotal: true },
  ];

  summaryColumns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'TXN_DateStart', header: '銷售日期(起)', visible: true, format: formatDate },
    { field: 'TXN_DateEnd', header: '銷售日期(迄)', visible: true, format: formatDate },
    { field: 'TXN_TotGUI', header: '發票金額', visible: true, align: 'right', format: formatAmount, isTotal: true },
  ];
}
