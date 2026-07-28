/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';

// 服務與模型
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23050Service } from '../../../service/api/tls/tls23050.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

// 修正後的共通 Table 介面與欄位格式化工具路徑
import {
  formatAmount,
  ReportColumn
} from '../../../shared/components/table-report/table-report.model';

// UI 元件
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { BasicQueryPageComponent } from 'src/app/shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';

@Component({
  selector: 'app-tls23050',
  templateUrl: './tls23050.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    RadiobuttonComponent, MultiSelectComponent, ButtonComponent, TranslateModule,
    CalendarComponent, ButtonModule, TableReportComponent,
  ],
})
export class TLS23050Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 狀態管理 =====
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;
  historyRequestBody: any | null = null;
  footerData: Record<string, number> = {};

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單宣告 (符合 1000 規格) =====
  queryForm = this.formBuilder.group({
    TXN_Date: [this.yesterday, [Validators.required]],
    rece_yn: [null],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ECR_No: [],
    pageSize: [1000], // ⬅️ 依要求，初始與全域限制大小改為 1000
    pageIndex: [1],   // ⬅️ 依要求，初始頁碼改為 1
    SortBy: [[{ field: 'ECR_No', order: 1 }]],
  });

  // ===== 下拉選單資料源 =====
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  readonly WhetherOptions: any[] = [
    { value: null, label: '全部' },
    { value: 'Y', label: '使用業主發票' },
    { value: 'N', label: '非使用業主發票' },
  ];

  private dropdownInit$?: Observable<any>;

  constructor(
    private readonly tls23050Service: TLS23050Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23050', 'tls/tls23050', this.queryForm, (form) => this.onSubmit(form));
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
    });
  }

  // ========= 查詢（送出） =========
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;
      const payload: any = {
        TXN_Date: this.toDateOnly(val?.TXN_Date),
        rece_yn: val?.rece_yn ?? undefined,
        tlt_building: val?.tlt_building ?? undefined,
        tlt_floor: Array.isArray(val?.tlt_floor) && val?.tlt_floor.length ? val.tlt_floor : undefined,
        org_id: Array.isArray(val?.org_id) && val?.org_id.length ? val.org_id : undefined,
        ECR_No: Array.isArray(val?.ECR_No) && val?.ECR_No.length ? val.ECR_No : undefined,
        pageSize: 1000, // ⬅️ 固定為 1000 規格
        pageIndex: 1,  // pack 型報表固定第一頁
        SortBy: Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : [{ field: 'ECR_No', order: 1 }],
      };

      this.historyRequestBody = { ...payload };
      this.loading = true;
      this.messageService?.blockUi();

      this.tls23050Service.queryTLS23050(payload)
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

            // SP 動態產生付款方式欄位(依 POS1006.exportsort)，欄位標題以本次查詢回傳的標題列為準
            this.columns = this.buildDynamicColumns(headerRow);

            this.data = detailRows.map((r: any, i: number) => ({
              ...r,
              _rowKey: `${r?.ECR_No ?? ''}|${r?.TLT_No ?? ''}|${i}`,
            }));

            this.totalRecords = Number(res?.TotalCount ?? this.data.length);
            this.footerData = this.buildFooterFromTotalRow(headerRow, totalRow);

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

  // ========= <app-table-report> 查詢封裝調用（支援 1000 滾動） =========
  public queryTLS23050ForReport = (body: any) => {
    const formVal = this.queryForm.getRawValue() as any;
    const basePayload: any = {
      TXN_Date: this.toDateOnly(formVal?.TXN_Date),
      rece_yn: formVal?.rece_yn ?? undefined,
      tlt_building: formVal?.tlt_building ?? undefined,
      tlt_floor: Array.isArray(formVal?.tlt_floor) && formVal.tlt_floor.length ? formVal.tlt_floor : undefined,
      org_id: Array.isArray(formVal?.org_id) && formVal.org_id.length ? formVal.org_id : undefined,
      ECR_No: Array.isArray(formVal?.ECR_No) && formVal.ECR_No.length ? formVal.ECR_No : undefined,
    };

    const sortBy = Array.isArray(body?.SortBy) && body.SortBy.length ? body.SortBy : [{ field: 'ECR_No', order: 1 }];
    const pageIndex = Number(body?.pageIndex ?? 1);
    const pageSize = Number(body?.pageSize ?? 1000); // ⬅️ 固定 1000 分頁大小

    const payload: any = { ...basePayload, pageIndex, pageSize, SortBy: sortBy };

    return this.tls23050Service.queryTLS23050(payload).pipe(
      map((res: any) => {
        const rawRows: any[] = Array.isArray(res?.Data) ? res.Data : [];
        const split = this.splitReportRows(rawRows);
        const totalCount = Number(res?.TotalCount ?? 0);

        if (!split) {
          this.totalRecords = totalCount;
          return { Data: [], TotalCount: totalCount, GrandTotal: this.footerData ?? {} };
        }

        const { headerRow, detailRows, totalRow } = split;

        // 分頁/排序由 app-table-report 直接呼叫本函式，欄位仍須依當次標題列重新產生
        this.columns = this.buildDynamicColumns(headerRow);

        const rows = detailRows.map((r: any, i: number) => ({
          ...r,
          _rowKey: `${pageIndex}|${r?.ECR_No ?? ''}|${r?.TLT_No ?? ''}|${i}`,
        }));

        const grand = this.buildFooterFromTotalRow(headerRow, totalRow);

        this.footerData = grand;
        this.totalRecords = totalCount;

        if (this.historyRequestBody) {
          this.historyRequestBody = { ...this.historyRequestBody, ...basePayload, SortBy: sortBy, pageIndex, pageSize };
        }

        return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
      }),
    );
  };

  // ========= 檔案匯出維護 =========
  private buildExportBody() {
    if (!this.historyRequestBody) return null;
    const { pageSize, pageIndex, ...rest } = this.historyRequestBody;
    return rest;
  }

  onExportPDF(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23050Service.exportTLS23050PDF(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp) => this.handleFileExport(resp, '.pdf') });
  }

  onExportXLSX(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23050Service.exportTLS23050Excel(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (resp) => this.handleFileExport(resp, '.xlsx') });
  }

  private showExportWarn(): void {
    this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
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

  private toDateOnly(val: any): string | undefined {
    if (!val) return undefined;
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // ===== 報表欄位結構定義 =====
  // 後端 SP_TLS23050_Query 已改為動態欄位(付款方式依 POS1006.exportsort 動態產生，
  // 欄位名稱固定為 TXN_PayAmt{PAY_No}，欄位數量/標題會隨 POS1006 維護內容變動)。
  // 查詢結果第一列為標題列、最後一列為總計列，欄位結構與標題文字皆以當次回傳的
  // 標題列為準，不再於前端寫死；初始(尚未查詢)時僅顯示固定識別欄位。
  columns: ReportColumn[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '櫃位名稱', visible: true, align: 'left' },
  ];

  // 識別用途的固定欄位(不屬於動態產生的付款方式/金額欄位)，命名比對與後端
  // TLS23050Service.ExportExcel/ExportPDF 的 excludedKeys 規則保持一致(忽略大小寫)
  private readonly identityFields = new Set(['seq', 'ecr_no', 'tlt_no', 'tlt_name']);

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
   * 依標題列動態產生欄位設定：固定識別欄位(收銀機號/專櫃編號/櫃位名稱) + 其餘
   * 動態欄位(總金額、各付款方式、預售/溢收/退貨/作廢/換貨)，欄位標題文字取自
   * 標題列對應 key 的內容(即 POS1006.exportpayname)。
   */
  private buildDynamicColumns(headerRow: Record<string, unknown>): ReportColumn[] {
    const columns: ReportColumn[] = [
      { field: 'ECR_No', header: '收銀機號', visible: true },
      { field: 'TLT_No', header: '專櫃編號', visible: true },
      { field: 'TLT_Name', header: '櫃位名稱', visible: true, align: 'left' },
    ];

    Object.keys(headerRow ?? {}).forEach((key) => {
      if (this.identityFields.has(key.toLowerCase())) return;
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
  private buildFooterFromTotalRow(headerRow: Record<string, unknown>, totalRow: Record<string, unknown>): Record<string, number> {
    const footer: Record<string, number> = {};
    Object.keys(headerRow ?? {}).forEach((key) => {
      if (this.identityFields.has(key.toLowerCase())) return;
      footer[key] = Number(totalRow?.[key] ?? 0);
    });
    return footer;
  }
}
