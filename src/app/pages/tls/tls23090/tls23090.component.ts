/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule, NgIf } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';

// 服務與模型
import { getSYS1000Options } from '@service/system/sys1000.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23090Service } from '../../../service/api/tls/tls23090.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

// 修正為指定的共通 Table 欄位型態與格式化工具路徑
import {
  formatDate,
  ReportColumn
} from '../../../shared/componentkit/table-report/table-report.model';

// UI 元件
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BasicQueryPageComponent } from 'src/app/shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

@UntilDestroy()
@Component({
  selector: 'app-tls23090',
  templateUrl: './tls23090.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeQuickComponent, MultiSelectComponent, DropdownComponent, InputTextComponent,
    InputTextModule, ButtonComponent, DialogModule, RadioButtonModule, TranslateModule,
    ButtonModule, NgIf, TableReportComponent,
  ],
})
export class TLS23090Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 狀態管理 =====
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;
  historyRequestBody: any | null = null;
  columns: ReportColumn[] = [];
  sortMeta: any[] = [];

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

  // 預設排序配置
  readonly defaultSortCredit = [
    { field: 'TXN_Date', order: 1 as 1 | -1 },
    { field: 'ECR_No', order: 1 as 1 | -1 },
    { field: 'TXN_No', order: 1 as 1 | -1 },
  ];
  readonly defaultSortCounter = [
    { field: 'TXN_Date', order: 1 as 1 | -1 },
    { field: 'ECR_No', order: 1 as 1 | -1 },
    { field: 'tlt_no', order: 1 as 1 | -1 },
  ];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單宣告 (符合 1000 規格與頁碼 1 起始) =====
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
    pageSize: [1000], // ⬅️ 調整為 1000 規格
    pageIndex: [1],   // ⬅️ 調整初始頁碼為 1
    SortBy: [[{ field: 'TXN_Date', order: 1 }, { field: 'ECR_No', order: 1 }, { field: 'TXN_No', order: 1 }]],
  });

  // ===== 下拉選項資料源 =====
  cardTypeOptions = getSYS1000Options('CREDIT_CRD_Type');
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  installmentPeriodOptions = getSYS1000Options('T109');
  acquiringBankOptions = getSYS1000Options('T113');

  readonly WhetherOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
    { value: null, label: '全部' },
  ];
  readonly connectionStatusOptions: any[] = [
    { value: '1', label: '連線' },
    { value: '2', label: '離線' },
  ];

  // ===== 總計對應欄位對照 =====
  private readonly creditTotalFieldMap: Record<string, string> = {
    TXN_PayAmt: 'TotalPayAmt', TXN_Point: 'TotalPoint', INST_Amt: 'TotalInstAmt',
  };
  private readonly counterTotalFieldMap: Record<string, string> = {
    AE_Count: 'TOTAL_AE_Count', AE_Amount: 'TOTAL_AE_Amount', DA_Count: 'TOTAL_DA_Count', DA_Amount: 'TOTAL_DA_Amount',
    MASTER_Count: 'TOTAL_MASTER_Count', MASTER_Amount: 'TOTAL_MASTER_Amount', VISA_Count: 'TOTAL_VISA_Count', VISA_Amount: 'TOTAL_VISA_Amount',
    JCB_Count: 'TOTAL_JCB_Count', JCB_Amount: 'TOTAL_JCB_Amount', UnionPay_Count: 'TOTAL_UnionPay_Count', UnionPay_Amount: 'TOTAL_UnionPay_Amount',
    Others_Count: 'TOTAL_Others_Count', Others_Amount: 'TOTAL_Others_Amount', Total_Count: 'TOTAL_Total_Count', Total_Amount: 'TOTAL_Total_Amount',
  };

  private readonly sortFieldAliasMap: Record<string, string> = {
    Others_Amount: 'O_Amount', Others_Count: 'O_Count', Total_Amount: 'Amount', Total_Count: 'Count',
  };

  private dropdownInit$?: Observable<any>;

  constructor(
    private readonly tls23090Service: TLS23090Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23090', 'tls/tls23090cru', this.queryForm, (form) => this.onSubmit(form));

    this.sortMeta = this.defaultSortCredit.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta }, { emitEvent: false });
    this.columns = this.columnsCredit;

    this.initDropdownData();
  }

  /**
   * 初始化下拉選單資料 (forkJoin 聲明式打包優化)
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

  // ========= 查詢（送出） =========
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;
      const defaultSort = this.viewMode === 'counter' ? this.defaultSortCounter : this.defaultSortCredit;
      const rawSortByArr: any[] = (Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : (this.sortMeta.length ? this.sortMeta : defaultSort)).map((s: any) => ({ ...s }));
      const sortByArr = this.mapSortFields(rawSortByArr);

      const payloadBase = this.prune({
        TXN_DateStart: this.toDateOnly(val?.TXN_DateStart ?? this.yesterday),
        TXN_DateEnd: this.toDateOnly(val?.TXN_DateEnd ?? this.yesterday),
        ECR_No: this.ensureArr(val?.ECR_No),
        TLT_No: this.ensureArr(val?.tlt_no),
        CRD_Type: this.ensureArr(val?.CRD_Type),
        CRD_No: (val?.CRD_No ?? '') || undefined,
        TXN_PayAmt: (val?.TXN_PayAmt === '' || val?.TXN_PayAmt == null) ? undefined : Number(val.TXN_PayAmt),
        tlt_building: (val?.tlt_building ?? '') || undefined,
        tlt_floor: this.ensureArr(val?.tlt_floor),
        org_id: this.ensureArr(val?.org_id),
        IsHaveTERM_No: this.toBoolOrNull(val?.IsHaveTERM_No),
        TERM_No: this.ensureArr(val?.TERM_No),
        Acquirer: this.ensureArr(val?.Acquirer),
        Conn_Status: (val?.ConnStatus ?? '') || undefined,
        SortBy: sortByArr,
      });

      const payload = { ...payloadBase, pageIndex: Number(val?.pageIndex) || 1, pageSize: 1000 }; // ⬅️ 調整為 1000 規格
      this.historyRequestBody = { ...payload };
      this.loading = true;
      this.messageService?.blockUi();

      const call$ = this.viewMode === 'counter' ? this.tls23090Service.queryTLS23090CounterCard(payload) : this.tls23090Service.queryTLS23090(payload);

      call$.pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
          this.messageService?.unblockUi();
        })
      ).subscribe({
        next: (res: any) => {
          if (this.viewMode === 'counter') {
            const items: any[] = Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData : Array.isArray(res?.Data) ? res.Data : [];
            const pick = (obj: any, brand: string, field: 'Count' | 'Amount') => Number(obj?.[brand]?.[field] ?? 0);

            const rows = items.map((r: any, i: number) => {
              const list = r?.CRD_Type_List || {};
              return {
                TXN_Date: r?.TXN_Date, ECR_No: r?.ECR_No, tlt_no: r?.tlt_no, tlt_name: r?.tlt_name,
                AE_Count: pick(list, 'AE', 'Count'), AE_Amount: pick(list, 'AE', 'Amount'),
                DA_Count: pick(list, 'DA', 'Count'), DA_Amount: pick(list, 'DA', 'Amount'),
                MASTER_Count: pick(list, 'MASTER', 'Count'), MASTER_Amount: pick(list, 'MASTER', 'Amount'),
                VISA_Count: pick(list, 'VISA', 'Count'), VISA_Amount: pick(list, 'VISA', 'Amount'),
                JCB_Count: pick(list, 'JCB', 'Count'), JCB_Amount: pick(list, 'JCB', 'Amount'),
                UnionPay_Count: pick(list, 'UnionPay', 'Count'), UnionPay_Amount: pick(list, 'UnionPay', 'Amount'),
                Others_Count: pick(list, 'Others', 'Count'), Others_Amount: pick(list, 'Others', 'Amount'),
                Total_Count: pick(list, 'Total', 'Count'), Total_Amount: pick(list, 'Total', 'Amount'),
                _rowKey: `cnt|${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
              };
            });

            this.columns = this.columnsCounter;
            this.data = rows;
            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;

            const summary = res?.Data?.Summary ?? null;
            this.grandTotal = summary ? this.summaryToCounterGrandTotal(summary) : this.computeCounterGrandTotal(res);
          } else {
            const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res?.Data] : []);
            const takeDetails = (w: any) => w?.tLS23090_CreditDetails ?? w?.TLS23090_CreditDetails ?? w?.CreditDetails ?? w?.Details ?? [];

            const rows = wrappers
              .flatMap((w: any) => Array.isArray(takeDetails(w)) ? takeDetails(w) : [])
              .map((r: any, idx: number) => ({
                ...r,
                _rowKey: `crt|${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.TXN_No ?? idx}`,
              }));

            this.columns = this.columnsCredit;
            this.data = rows;
            this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;
            this.grandTotal = this.computeCreditGrandTotal(wrappers);
            this.creditGrandTotalStr = wrappers[0]?.GrandTotalStr ?? '';
            this.installmentSummary = (wrappers[0]?.InstallmentSummary ?? []).map((s: any) => ({
              termNo: Number(s.TERM_No),
              termName: s.TERM_Name ?? String(s.TERM_No),
              total: Number(s.TotalAmt ?? 0),
            }));
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

  // ========= <app-table-report> 查詢調用群（支援 1000 規格分頁） =========
  public queryTLS23090CreditForReport = (body: any) => {
    const apiSortBy = this.mapSortFields(body?.SortBy);
    return this.tls23090Service.queryTLS23090({
      ...(body || {}),
      SortBy: apiSortBy,
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
      pageSize: body?.pageSize ?? 1000, // ⬅️ 固定 1000 規格
      pageIndex: body?.pageIndex ?? 1,
    }).pipe(
      map((res: any) => {
        const wrappers = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res?.Data] : []);
        const takeDetails = (w: any) => w?.tLS23090_CreditDetails ?? w?.TLS23090_CreditDetails ?? w?.CreditDetails ?? w?.Details ?? [];

        const rows = wrappers
          .flatMap((w: any) => Array.isArray(takeDetails(w)) ? takeDetails(w) : [])
          .map((r: any, idx: number) => ({
            ...r,
            _rowKey: `crt|${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.TXN_No ?? idx}`,
          }));

        const totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;
        const grand: Record<string, number> = {};

        Object.entries(this.creditTotalFieldMap).forEach(([field, apiKey]) => {
          grand[field] = wrappers.reduce((acc: number, w: any) => acc + Number(w?.[apiKey] ?? 0), 0);
        });

        const instSummary = (wrappers[0]?.InstallmentSummary ?? []).map((s: any) => ({
          termNo: Number(s.TERM_No),
          termName: s.TERM_Name ?? String(s.TERM_No),
          total: Number(s.TotalAmt ?? 0),
        }));
        if (!body?.pageIndex || Number(body?.pageIndex) === 1) {
          this.grandTotal = { ...grand };
          this.creditGrandTotalStr = wrappers[0]?.GrandTotalStr ?? '';
          this.installmentSummary = instSummary;
        }
        return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
      })
    );
  };

  public queryTLS23090CounterForReport = (body: any) => {
    const apiSortBy = this.mapSortFields(body?.SortBy);
    return this.tls23090Service.queryTLS23090CounterCard({
      ...(body || {}),
      SortBy: apiSortBy,
      pageSize: body?.pageSize ?? 1000, // ⬅️ 固定 1000 規格
      pageIndex: body?.pageIndex ?? 1,
    }).pipe(
      map((res: any) => {
        const items: any[] = Array.isArray(res?.Data?.QueryData) ? res.Data.QueryData : Array.isArray(res?.Data) ? res.Data : [];
        const pick = (obj: any, brand: string, field: 'Count' | 'Amount') => Number(obj?.[brand]?.[field] ?? 0);

        const rows = items.map((r: any, i: number) => {
          const list = r?.CRD_Type_List || {};
          return {
            TXN_Date: r?.TXN_Date, ECR_No: r?.ECR_No, tlt_no: r?.tlt_no, tlt_name: r?.tlt_name,
            AE_Count: pick(list, 'AE', 'Count'), AE_Amount: pick(list, 'AE', 'Amount'),
            DA_Count: pick(list, 'DA', 'Count'), DA_Amount: pick(list, 'DA', 'Amount'),
            MASTER_Count: pick(list, 'MASTER', 'Count'), MASTER_Amount: pick(list, 'MASTER', 'Amount'),
            VISA_Count: pick(list, 'VISA', 'Count'), VISA_Amount: pick(list, 'VISA', 'Amount'),
            JCB_Count: pick(list, 'JCB', 'Count'), JCB_Amount: pick(list, 'JCB', 'Amount'),
            UnionPay_Count: pick(list, 'UnionPay', 'Count'), UnionPay_Amount: pick(list, 'UnionPay', 'Amount'),
            Others_Count: pick(list, 'Others', 'Count'), Others_Amount: pick(list, 'Others', 'Amount'),
            Total_Count: pick(list, 'Total', 'Count'), Total_Amount: pick(list, 'Total', 'Amount'),
            _rowKey: `cnt|${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
          };
        });

        const totalCount = typeof res?.TotalCount === 'number' ? res.TotalCount : rows.length;
        let grand: Record<string, number> = {};
        const summary = res?.Data?.Summary ?? null;

        if (summary) {
          grand = this.summaryToCounterGrandTotal(summary);
        } else {
          const carrier = Array.isArray(res?.Data) ? res.Data[0] : (res?.Data ?? res ?? {});
          Object.entries(this.counterTotalFieldMap).forEach(([field, apiKey]) => {
            grand[field] = Number(carrier?.Totals?.[apiKey] ?? carrier?.Summary?.[apiKey] ?? carrier?.[apiKey] ?? 0);
          });
        }

        if (!body?.pageIndex || Number(body?.pageIndex) === 1) {
          this.grandTotal = { ...grand };
        }
        return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
      })
    );
  };

  // ========= 檢視模式轉換 =========
  onModeChange(): void {
    this.applyViewMode();
  }

  private applyViewMode(): void {
    const nextDefault = this.viewMode === 'credit' ? this.defaultSortCredit : this.defaultSortCounter;
    this.columns = this.viewMode === 'credit' ? this.columnsCredit : this.columnsCounter;
    this.sortMeta = nextDefault.map(x => ({ ...x }));
    this.grandTotal = {};
    this.installmentSummary = [];

    this.queryForm.patchValue({ pageIndex: 1, SortBy: this.sortMeta }, { emitEvent: false });
    this.onSubmit(this.queryForm);
  }

  // ========= 檔案匯出維護機制 =========
  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { ...rest } = this.historyRequestBody;
    return rest;
  }

  onExportCreditPDF(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23090Service.exporttls23090CreditPDF(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService?.warnBubble?.('PDF 匯出失敗（信用卡明細）。'),
      });
  }

  onExportCounterPDF(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23090Service.exporttls23090CounterPDF(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService?.warnBubble?.('PDF 匯出失敗（專櫃卡別分析）。'),
      });
  }

  onExportCreditExcel(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    const body = { ...this.historyRequestBody, SortBy: this.mapSortFields(this.historyRequestBody?.SortBy) };
    this.tls23090Service.exporttls23090CreditExcel(body)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: () => this.messageService?.warnBubble?.('EXCEL 匯出失敗（信用卡明細）。'),
      });
  }

  onExportCounterExcel(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    const body = { ...this.historyRequestBody, SortBy: this.mapSortFields(this.historyRequestBody?.SortBy) };
    this.tls23090Service.exporttls23090CounterExcel(body)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: () => this.messageService?.warnBubble?.('EXCEL 匯出失敗（專櫃卡別分析）。'),
      });
  }

  private showExportWarn(): void { this.messageService?.warnBubble?.('請先執行查詢以產生報表。'); }

  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;
    if (blob && blob.size > 0) {
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;
    const filenameStarMatch = /filename\*=([^;]+)/i.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      try { return decodeURIComponent(filenameStarMatch[1].trim().replace(/^UTF-8''/, '')); } catch { }
    }
    const filenameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      try { return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' ')); } catch { }
    }
    return `download${defaultExtension}`;
  }

  // ========= 輔助整理工廠群與計算清洗機制 =========
  installmentSummary: { termNo: number; termName: string; total: number }[] = [];

  buildFooterFromGrandTotal(): Record<string, any> | undefined {
    if (!this.grandTotal || Object.keys(this.grandTotal).length === 0) return undefined;
    const footer: Record<string, any> = {};
    for (const col of this.columns) {
      if (col?.isTotal) {
        const raw = this.grandTotal[col.field] ?? 0;
        footer[col.field] = (raw as number).toLocaleString();
      }
    }
    if (this.viewMode === 'credit' && this.creditGrandTotalStr) {
      footer['PAY_Name'] = this.creditGrandTotalStr;
    }
    return footer;
  }

  private mapSortFields(sortBy: any[] | undefined | null): any[] | undefined {
    if (!Array.isArray(sortBy)) return sortBy ?? undefined;
    return sortBy.map(s => ({ ...s, field: this.sortFieldAliasMap[s.field] ?? s.field }));
  }

  private computeCreditGrandTotal(wrappers: any[]): Record<string, number> {
    const grand: Record<string, number> = {};
    Object.entries(this.creditTotalFieldMap).forEach(([field, apiKey]) => {
      grand[field] = wrappers.reduce((acc: number, w: any) => acc + Number(w?.[apiKey] ?? 0), 0);
    });
    return grand;
  }

  private computeCounterGrandTotal(res: any): Record<string, number> {
    const carrier = Array.isArray(res?.Data) ? res.Data[0] : (res?.Data ?? res ?? {});
    const grand: Record<string, number> = {};
    Object.entries(this.counterTotalFieldMap).forEach(([field, apiKey]) => {
      grand[field] = Number(carrier?.Totals?.[apiKey] ?? carrier?.Summary?.[apiKey] ?? carrier?.[apiKey] ?? 0);
    });
    return grand;
  }

  private summaryToCounterGrandTotal(summary: any): Record<string, number> {
    if (!summary || typeof summary !== 'object') return {};
    const pick = (brand: string, key: 'Count' | 'Amount') => Number(summary?.[brand]?.[key] ?? 0);
    return {
      AE_Count: pick('AE', 'Count'), AE_Amount: pick('AE', 'Amount'),
      DA_Count: pick('DA', 'Count'), DA_Amount: pick('DA', 'Amount'),
      MASTER_Count: pick('MASTER', 'Count'), MASTER_Amount: pick('MASTER', 'Amount'),
      VISA_Count: pick('VISA', 'Count'), VISA_Amount: pick('VISA', 'Amount'),
      JCB_Count: pick('JCB', 'Count'), JCB_Amount: pick('JCB', 'Amount'),
      UnionPay_Count: pick('UnionPay', 'Count'), UnionPay_Amount: pick('UnionPay', 'Amount'),
      Others_Count: pick('Others', 'Count'), Others_Amount: pick('Others', 'Amount'),
      Total_Count: pick('Total', 'Count'), Total_Amount: pick('Total', 'Amount'),
    };
  }

  private ensureArr = (v: any) => Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]);
  private padTxnNo = (v: any): string => String(v ?? '').trim().padStart(6, '0');

  private toBoolOrNull(v: any): boolean | null {
    if (typeof v === 'boolean') return v;
    if (v == null || v === '') return null;
    const s = String(v).toUpperCase();
    return (s === 'Y' || s === 'TRUE' || s === '1') ? true : (s === 'N' || s === 'FALSE' || s === '0') ? false : null;
  }

  private prune<T extends Record<string, any>>(obj: T): T {
    const out: any = { ...obj };
    Object.keys(out).forEach((k) => {
      const v = out[k];
      if (v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)) delete out[k];
      else if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) delete out[k];
    });
    return out as T;
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ===== 報表欄位結構定義 (採用共通 ReportColumn 規範且校正對齊) =====
  private readonly columnsCredit: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', format: formatDate, visible: true, width: '80px' },
    { field: 'ECR_No', header: '收銀機號', visible: true, width: '70px' },
    { field: 'TXN_No', header: '交易序號', visible: true, format: (v: any) => this.padTxnNo(v), width: '70px' },
    { field: 'tlt_no', header: '專櫃編號', visible: true, width: '70px' },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, align: 'left' },
    { field: 'CRD_Name', header: '信用卡卡別', visible: true, width: '70px' },
    { field: 'CRD_No', header: '信用卡卡號', visible: true, width: '130px' },
    { field: 'TXN_PayAmt', header: '金額', align: 'right', format: formatAmount, isTotal: true, visible: true, width: '70px' },
    { field: 'TXN_Point', header: '紅利', align: 'right', format: formatAmount, isTotal: true, visible: true, width: '70px' },
    { field: 'INST_Amt', header: '分期', align: 'right', format: formatAmount, isTotal: true, visible: true, width: '70px' },
    { field: 'PAY_Name', header: '分期期別', visible: true, format: v => v ? v : '--', width: '100px' },
    { field: 'TERM_Name', header: '分期期數', visible: true, format: v => v ? v : '--', width: '50px' },
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
  // 預先格式化的字串（來自合計列）直接 pass-through
  if (typeof val === 'string') return val !== '' ? val : '--';
  if (val === null || val === undefined || Number(val) === 0) return '--';
  const num = Number(val);
  if (isNaN(num)) return '--';
  return num.toLocaleString(); // eg. 1,000,000
};
