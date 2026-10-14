/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';

// 服務與模型
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23060Service } from '../../../service/api/tls/tls23060.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

// 修正後的共通 Table 介面與欄位格式化工具路徑
import {
  formatAmount,
  formatDate,
  ReportColumn
} from '../../../shared/components/table-report/table-report.model';

// UI 元件
import { TranslateModule } from '@ngx-translate/core';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';

@UntilDestroy()
@Component({
  selector: 'app-tls23060',
  templateUrl: './tls23060.component.html',
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
    RadiobuttonComponent,
    MultiSelectComponent,
    ButtonComponent,
    TranslateModule,
    ButtonModule,
    TableReportComponent,
    DialogComponent,
  ],
})
export class TLS23060Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 主表狀態 =====
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;
  historyRequestBody: any = null;
  footerData: Record<string, number> = {};
  sortMeta: any[] = [];

  readonly defaultSort: any[] = [{ field: 'ECR_No', order: 1 }];
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單宣告（符合 1000 規格與 1 起始頁） =====
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    rece_yn: [null],
    ECR_No: [],
    tlt_no: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    pageSize: [1000], // ⬅️ 調整為 1000 規格
    pageIndex: [1],   // ⬅️ 調整為初始頁碼 1
    SortBy: [[{ field: 'ECR_No', order: 1 }]],
  });

  // ===== 下拉選單資料源 =====
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];

  readonly WhetherOptions: any[] = [
    { value: 'Y', label: '使用業主發票' },
    { value: 'N', label: '非使用業主發票' },
    { value: null, label: '全部' },
  ];

  // ===== 明細 Dialog 狀態 =====
  dialogVisible = false;
  dialogLoading = false;
  dialogData: any[] = [];
  dialogTotalRecords = 0;
  dialogFooterData: Record<string, number> = {};
  dialogHistoryRequestBody: any = null;
  selectedMainRow: any | null = null;

  private dropdownInit$?: Observable<any>;

  constructor(
    private readonly tls23060Service: TLS23060Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23060', 'tls/tls/tls23060cru', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map((s) => ({ ...s }));
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

    this.dropdownInit$.pipe(untilDestroyed(this)).subscribe((res: { floors: never[]; buildings: never[]; orgs: any; ecrs: any; counters: any; }) => {
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

  // ========= 主表查詢（送出） =========
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;
      const payload: any = {
        TXN_DateStart: this.toDateOnly(val?.TXN_DateStart),
        TXN_DateEnd: this.toDateOnly(val?.TXN_DateEnd),
        rece_yn: val?.rece_yn ?? undefined,
        ECR_No: Array.isArray(val?.ECR_No) && val.ECR_No.length ? val.ECR_No : undefined,
        tlt_no: Array.isArray(val?.tlt_no) && val.tlt_no.length ? val.tlt_no : undefined,
        tlt_building: val?.tlt_building ?? undefined,
        tlt_floor: Array.isArray(val?.tlt_floor) && val.tlt_floor.length ? val.tlt_floor : undefined,
        org_id: Array.isArray(val?.org_id) && val?.org_id.length ? val.org_id : undefined,
        pageSize: 1000, // ⬅️ 全域設定轉為 1000
        pageIndex: 1,
        SortBy: Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort,
      };

      this.historyRequestBody = { ...payload };
      this.loading = true;
      this.messageService?.blockUi();

      this.tls23060Service.queryTLS23060(payload)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
            this.messageService?.unblockUi();
          }),
        )
        .subscribe({
          next: (res: any) => {
            const rows: any[] = Array.isArray(res?.Data) ? res.Data : [];
            const split = this.splitReportRows(rows);

            if (!split) {
              this.data = [];
              this.totalRecords = 0;
              this.footerData = {};
              return;
            }

            const { headerRow, detailRows, totalRow } = split;

            // SP 動態產生支付別欄位(依 POS1006.exportsort)，欄位標題以本次查詢回傳的標題列為準
            this.columns = this.buildDynamicColumns(headerRow, this.baseColumns, this.identityFields);

            this.data = detailRows.map((r: any, i: number) => ({
              ...r,
              _rowKey: `${r?.ECR_No ?? ''}|${r?.TLT_No ?? ''}|${i}`,
            }));

            this.totalRecords = Number(res?.TotalCount ?? this.data.length);
            this.footerData = this.buildFooterFromTotalRow(headerRow, totalRow, this.identityFields);

            if (this.historyRequestBody) {
              this.historyRequestBody = { ...this.historyRequestBody, pageIndex: 1, pageSize: 1000 };
            }
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.footerData = {};
          },
        });
    });
  }

  // ========= 主表：提供給 app-table-report 的查詢函式 =========
  public queryTLS23060ForReport = (body: any) => {
    const formVal = this.queryForm.getRawValue() as any;
    const basePayload: any = {
      TXN_DateStart: this.toDateOnly(formVal?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(formVal?.TXN_DateEnd),
      rece_yn: formVal?.rece_yn ?? undefined,
      ECR_No: Array.isArray(formVal?.ECR_No) && formVal.ECR_No.length ? formVal.ECR_No : undefined,
      tlt_no: Array.isArray(formVal?.tlt_no) && formVal.tlt_no.length ? formVal.tlt_no : undefined,
      tlt_building: formVal?.tlt_building ?? undefined,
      tlt_floor: Array.isArray(formVal?.tlt_floor) && formVal.tlt_floor.length ? formVal.tlt_floor : undefined,
      org_id: Array.isArray(formVal?.org_id) && formVal.org_id.length ? formVal.org_id : undefined,
    };

    const formPageIndex = Number(formVal?.pageIndex) || 1;
    const pageIndex = body?.pageIndex != null ? Number(body.pageIndex) : formPageIndex;
    const sortBy = body?.SortBy && Array.isArray(body.SortBy) && body.SortBy.length ? body.SortBy : Array.isArray(formVal?.SortBy) && formVal.SortBy.length ? formVal.SortBy : this.defaultSort;

    return this.tls23060Service.queryTLS23060({
      ...basePayload,
      pageSize: 1000, // ⬅️ 固定採用 1000 規格
      pageIndex,
      SortBy: sortBy,
    }).pipe(
      map((res: any) => {
        const rows: any[] = Array.isArray(res?.Data) ? res.Data : [];
        const split = this.splitReportRows(rows);
        const totalCount = Number(res?.TotalCount ?? 0);

        if (!split) {
          this.totalRecords = totalCount;
          this.footerData = {};
          return { Data: [], TotalCount: totalCount, GrandTotal: {} };
        }

        const { headerRow, detailRows, totalRow } = split;

        // 分頁/排序由 app-table-report 直接呼叫本函式，欄位仍須依當次標題列重新產生
        this.columns = this.buildDynamicColumns(headerRow, this.baseColumns, this.identityFields);

        const dataRows = detailRows.map((r: any, i: number) => ({
          ...r,
          _rowKey: `${pageIndex}|${r?.ECR_No ?? ''}|${r?.TLT_No ?? ''}|${i}`,
        }));

        const grand = this.buildFooterFromTotalRow(headerRow, totalRow, this.identityFields);
        this.footerData = grand;
        this.totalRecords = totalCount;

        if (this.historyRequestBody) {
          this.historyRequestBody = { ...this.historyRequestBody, ...basePayload, SortBy: sortBy, pageIndex: 1, pageSize: 1000 };
        }

        return { Data: dataRows, TotalCount: totalCount, GrandTotal: grand };
      }),
    );
  };

  // ========= 彈窗明細觸發器 =========
  override onDetail(row: any): void {
    if (!row) return;
    this.selectedMainRow = row;
    this.dialogVisible = true;
    const formVal = this.queryForm.getRawValue() as any;

    const body: any = {
      PageSize: 0,
      PageIndex: 0,
      SortBy: [{ field: 'TXN_Date', order: 1 }],
      TXN_DateStart: this.toDateOnly(formVal?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(formVal?.TXN_DateEnd),
      rece_yn: formVal?.rece_yn ?? undefined,
      ECR_No: row?.ECR_No ?? undefined,
      tlt_no: row?.TLT_No ?? undefined,
      tlt_building: formVal?.tlt_building ?? [],
      tlt_floor: Array.isArray(formVal?.tlt_floor) ? formVal.tlt_floor : [],
      org_id: Array.isArray(formVal?.org_id) ? formVal.org_id : [],
    };

    this.dialogHistoryRequestBody = { ...body, pageIndex: 1, pageSize: 1000 };
    this.dialogLoading = true;

    this.queryTLS23060DetailForReport({ ...body, pageIndex: 1, pageSize: 1000 })
      .pipe(finalize(() => (this.dialogLoading = false)))
      .subscribe({
        error: () => {
          this.dialogData = [];
          this.dialogTotalRecords = 0;
          this.dialogFooterData = {};
        },
      });
  }

  // ========= 明細：提供給 Dialog 內 app-table-report 的查詢函式 =========
  public queryTLS23060DetailForReport = (body: any) =>
    this.tls23060Service.queryTLS23060Detail({
      ...(this.dialogHistoryRequestBody ?? {}),
      ...body,
      pageSize: 1000, // ⬅️ 明細表也同步為 1000
      pageIndex: 1,
      SortBy: Array.isArray(body?.SortBy) && body.SortBy.length ? body.SortBy : [{ field: 'TXN_Date', order: 1 }],
      TXN_DateStart: this.toDateOnly(body?.TXN_DateStart ?? this.queryForm.value?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(body?.TXN_DateEnd ?? this.queryForm.value?.TXN_DateEnd),
    }).pipe(
      map((res: any) => {
        const rows: any[] = Array.isArray(res?.Data) ? res.Data : [];
        const split = this.splitReportRows(rows);

        if (!split) {
          this.dialogFooterData = {};
          this.dialogTotalRecords = 0;
          this.dialogData = [];
          return { Data: [], TotalCount: 0, GrandTotal: {} };
        }

        const { headerRow, detailRows, totalRow } = split;

        // 明細表的支付別欄位同樣依當次回傳的標題列動態產生
        this.detailColumns = this.buildDynamicColumns(headerRow, this.baseDetailColumns, this.detailIdentityFields);

        const dataRows = detailRows.map((r: any, i: number) => ({
          ...r,
          _rowKey: `${r?.TXN_Date ?? ''}|${r?.ECR_No ?? ''}|${r?.TLT_No ?? ''}|${i}`,
        }));

        dataRows.sort((a, b) => (a.TXN_Date ?? '') > (b.TXN_Date ?? '') ? 1 : -1);

        const totalCount = Number(res?.TotalCount ?? dataRows.length);
        const grand = this.buildFooterFromTotalRow(headerRow, totalRow, this.detailIdentityFields);

        this.dialogFooterData = grand;
        this.dialogTotalRecords = totalCount;
        this.dialogData = dataRows;

        if (this.dialogHistoryRequestBody) {
          this.dialogHistoryRequestBody = { ...this.dialogHistoryRequestBody, pageIndex: 1, pageSize: 1000 };
        }

        return { Data: dataRows, TotalCount: totalCount, GrandTotal: grand };
      }),
    );

  onDialogClose(v: boolean): void {
    this.dialogVisible = v;
    if (!v) {
      this.selectedMainRow = null;
      this.dialogData = [];
      this.dialogTotalRecords = 0;
      this.dialogFooterData = {};
      this.dialogHistoryRequestBody = null;
    }
  }

  // ========= 檔案匯出功能群 =========
  onExportExcel(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23060Service.exporttls23060Excel(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.xlsx') });
  }

  onExportDetailExcel(): void {
    if (!this.dialogHistoryRequestBody) return this.showDetailWarn();
    this.btnLoading = true;
    const { pageSize, pageIndex, PageSize, PageIndex, ...body } = this.dialogHistoryRequestBody;
    this.tls23060Service.exportTLS23060DetailExcel(body)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.xlsx') });
  }

  onExportPDF(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23060Service.exporttls23060PDF(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf') });
  }

  onExportDetailPDF(): void {
    if (!this.dialogHistoryRequestBody) return this.showDetailWarn();
    this.btnLoading = true;
    const { pageSize, pageIndex, PageSize, PageIndex, ...body } = this.dialogHistoryRequestBody;
    this.tls23060Service.exportTLS23060DetailPDF(body)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp: HttpResponse<Blob>) => this.handleFileExport(resp, '.pdf') });
  }

  private showExportWarn(): void { this.messageService?.warnBubble?.('請先執行查詢以產生報表。'); }
  private showDetailWarn(): void { this.messageService?.warnBubble?.('請先點選主表資料開啟明細。'); }

  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { pageSize, pageIndex, PageSize, PageIndex, ...rest } = this.historyRequestBody;
    return rest;
  }

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
    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      try { return decodeURIComponent(filenameStarMatch[1].replace(/^UTF-8''/, '')); } catch { }
    }
    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      try { return decodeURIComponent(filenameMatch[1].replaceAll(/\+/g, ' ')); } catch { }
    }
    return `download${defaultExtension}`;
  }

  // ========= 動態欄位輔助工具（比照 TLS23050：SP 回傳「第一列=標題列、最後一列=總計列」）=========
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * 將 SP 回傳的單一結果集(第一列=標題列、最後一列=總計列、其餘為明細列)拆分。
   * 資料列數不足 2 列(缺標題或總計列)視為查無資料。
   */
  private splitReportRows(rows: any[]): { headerRow: any; detailRows: any[]; totalRow: any } | null {
    if (!Array.isArray(rows) || rows.length < 2) return null;
    return {
      headerRow: rows[0],
      detailRows: rows.slice(1, rows.length - 1),
      totalRow: rows[rows.length - 1],
    };
  }

  /**
   * 依標題列動態產生欄位設定：固定識別欄位 + 其餘動態欄位(支付別、預售/溢收/退貨/作廢/換貨)，
   * 欄位標題文字取自標題列對應 key 的內容(即 POS1006.exportpayname)。
   */
  private buildDynamicColumns(headerRow: Record<string, unknown>, baseColumns: ReportColumn[], identityFields: Set<string>): ReportColumn[] {
    const columns: ReportColumn[] = baseColumns.map((c) => ({ ...c }));

    Object.keys(headerRow ?? {}).forEach((key) => {
      if (identityFields.has(key.toLowerCase())) return;
      const label = headerRow[key];
      columns.push({
        field: key,
        header: label !== null && label !== undefined && label !== '' ? String(label) : key,
        visible: true,
        align: 'right',
        format: formatAmount,
        isTotal: true,
      });
    });

    return columns;
  }

  /** 依標題列的動態欄位 key，從總計列組出表尾合計資料(SP 已算好金額，這裡只需轉為數字) */
  private buildFooterFromTotalRow(headerRow: Record<string, unknown>, totalRow: Record<string, unknown>, identityFields: Set<string>): Record<string, number> {
    const footer: Record<string, number> = {};
    Object.keys(headerRow ?? {}).forEach((key) => {
      if (identityFields.has(key.toLowerCase())) return;
      footer[key] = Number(totalRow?.[key] ?? 0);
    });
    return footer;
  }

  // ===== 報表欄位結構定義 =====
  // 後端 SP_TLS23060_Query / SP_TLS23060QueryDetail 已改為動態欄位(支付別依 POS1006.exportsort 動態產生，
  // 欄位名稱固定為 TXN_PayAmt{PAY_No}，欄位數量/標題會隨 POS1006 維護內容變動)。
  // 查詢結果第一列為標題列、最後一列為總計列，欄位結構與標題文字皆以當次回傳的
  // 標題列為準，不再於前端寫死；初始(尚未查詢)時僅顯示固定識別欄位。
  private readonly baseColumns: ReportColumn[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '櫃位名稱', visible: true, align: 'left' },
  ];

  private readonly baseDetailColumns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '櫃位名稱', visible: true, align: 'left' },
  ];

  // 識別用途的固定欄位(不屬於動態產生的支付別/金額欄位)，命名比對與後端
  // TLS23060Service.exportExcel/exportExcel_Detail/ExportPDF/ExportPDF_Detail 的
  // excludedKeys 規則保持一致(忽略大小寫)
  private readonly identityFields = new Set(['seq', 'ecr_no', 'tlt_no', 'tlt_name']);
  private readonly detailIdentityFields = new Set(['seq', 'txn_date', 'ecr_no', 'tlt_no', 'tlt_name']);

  columns: ReportColumn[] = [...this.baseColumns];
  detailColumns: ReportColumn[] = [...this.baseDetailColumns];
}
