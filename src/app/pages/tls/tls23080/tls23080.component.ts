/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';

// 服務與模型
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TLS23080Service } from '../../../service/api/tls/tls23080.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

// 修正為指定的共通 Table 欄位型態與格式化工具路徑
import {
  formatAmount,
  formatDate,
  ReportColumn
} from '../../../shared/components/table-report/table-report.model';

// UI 元件
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BasicQueryPageComponent } from 'src/app/shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';

@UntilDestroy()
@Component({
  selector: 'app-tls23080',
  templateUrl: './tls23080.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeComponent, MultiSelectComponent, RadiobuttonComponent, InputTextModule,
    ButtonComponent, TranslateModule, ButtonModule, TableReportComponent,
  ],
})
export class TLS23080Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 狀態管理 =====
  data: any[] = [];
  totalRecords = 0;
  btnLoading = false;

  // 保留原有固定物件 reference 優化設計
  historyRequestBody: any = {};
  private querying = false;
  private lastQueryKey = '';
  footerData: Record<string, number> = {};

  // ===== 下拉選單資料源 =====
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  readonly WhetherOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
    { value: null, label: '全部' },
  ];

  readonly defaultSort: any[] = [{ field: 'TXN_Date', order: 1 }];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單宣告（符合 1000 規格與頁碼 1 起始） =====
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    tlt_openflag: ['N'],
    ECR_No: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    pageSize: [1000], // ⬅️ 調整為 1000 規格
    pageIndex: [1],   // ⬅️ 調整初始頁碼為 1
    SortBy: [[{ field: 'TXN_Date', order: 1 }]],
  });

  constructor(
    private readonly tls23080Service: TLS23080Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23080', 'tls/tls23080', this.queryForm, (form) => this.onSubmit(form));

    // 下拉選單整合 forkJoin 載入
    forkJoin({
      floors: this.dropdownApiService.querySys3900().pipe(map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name }))), take(1)),
      buildings: this.tls11010Service.getBuildingOptions().pipe(take(1)),
      orgs: this.dropdownApiService.querySys3100().pipe(take(1)),
      ecrs: this.dropdownApiService.queryPos1002().pipe(take(1)),
      counters: this.dropdownApiService.queryTltTalent().pipe(take(1)),
    }).pipe(untilDestroyed(this)).subscribe({
      next: ({ floors, buildings, orgs, ecrs, counters }) => {
        this.floorOptions = floors ?? [];
        this.BUILDING_NO_Options = buildings ?? [];

        const mapStandardOption = (x: any) => ({
          label: x.label,
          formLabel: `${x.label}`,
          value: x.value,
        });

        this.OrganizationCodeOptions = (orgs ?? []).map(mapStandardOption);
        this.ECRNoOptions = (ecrs ?? []).map(mapStandardOption);
        this.CounterOptions = (counters ?? []).map(mapStandardOption);
      },
    });
  }

  // ========= 查詢（送出） =========
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;
      const payload: any = {
        TXN_DateStart: this.toDateOnly(val?.TXN_DateStart),
        TXN_DateEnd: this.toDateOnly(val?.TXN_DateEnd),
        tlt_openflag: val?.tlt_openflag ?? undefined,
        ECR_No: Array.isArray(val?.ECR_No) && val.ECR_No.length ? val.ECR_No : undefined,
        tlt_building: Array.isArray(val?.tlt_building) && val.tlt_building.length ? val.tlt_building : undefined,
        tlt_floor: Array.isArray(val?.tlt_floor) && val.tlt_floor.length ? val.tlt_floor : undefined,
        org_id: Array.isArray(val?.org_id) && val.org_id.length ? val.org_id : undefined,
        pageIndex: 1,
        pageSize: 1000, // ⬅️ 調整為全域指定之 1000 規格
        SortBy: Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort,
      };

      const compactPayload = this.compactObject(payload);
      const key = JSON.stringify(compactPayload);

      if (this.querying || key === this.lastQueryKey) return;
      this.lastQueryKey = key;

      Object.assign(this.historyRequestBody, compactPayload);
      this.loading = true;
      this.querying = true;
      this.messageService?.blockUi();

      this.tls23080Service.queryTLS23080(compactPayload)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
            this.querying = false;
            this.messageService?.unblockUi();
          })
        )
        .subscribe({
          next: (res: any) => {
            const rows: any[] = Array.isArray(res?.Data) ? res.Data : [];
            const split = this.splitReportRows(rows);

            if (!split) {
              this.data = [];
              this.totalRecords = 0;
              this.footerData = {};
              this.columns = [...this.baseColumns];
              this.historyRequestBody.pageIndex = 1;
              this.historyRequestBody.pageSize = 1000;
              return;
            }

            const { headerRow, detailRows, totalRow } = split;

            // 支付別欄位由 SP 動態產生，欄位標題以本次查詢回傳的標題列為準
            this.columns = this.buildDynamicColumns(headerRow, this.baseColumns, this.identityFields);

            this.data = detailRows.map((r: any, i: number) => ({
              ...r,
              _rowKey: `${r?.TXN_Date ?? ''}|${i}`,
            }));

            this.totalRecords = typeof res?.TotalCount === 'number' ? Number(res.TotalCount) : this.data.length;
            this.footerData = this.buildFooterFromTotalRow(headerRow, totalRow, this.identityFields);

            this.historyRequestBody.pageIndex = 1;
            this.historyRequestBody.pageSize = 1000;
            this.historyRequestBody.SortBy = compactPayload.SortBy ?? this.defaultSort;
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.footerData = {};
            this.columns = [...this.baseColumns];
            this.historyRequestBody.pageIndex = 1;
            this.historyRequestBody.pageSize = 1000;
          },
        });
    });
  }

  // ========= <app-table-report> 查詢封裝調用（支援 1000 規格滾動） =========
  public queryTLS23080ForReport = (body: any) => {
    const formVal = this.queryForm.getRawValue() as any;
    const basePayload: any = {
      TXN_DateStart: this.toDateOnly(formVal?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(formVal?.TXN_DateEnd),
      tlt_openflag: formVal?.tlt_openflag ?? undefined,
      ECR_No: Array.isArray(formVal?.ECR_No) && formVal.ECR_No.length ? formVal.ECR_No : undefined,
      tlt_building: Array.isArray(formVal?.tlt_building) && formVal.tlt_building.length ? formVal.tlt_building : undefined,
      tlt_floor: Array.isArray(formVal?.tlt_floor) && formVal.tlt_floor.length ? formVal.tlt_floor : undefined,
      org_id: Array.isArray(formVal?.org_id) && formVal.org_id.length ? formVal.org_id : undefined,
    };

    const pageIndex = body?.pageIndex != null ? Number(body.pageIndex) : 1;
    const sortBy = body?.SortBy && Array.isArray(body.SortBy) && body.SortBy.length ? body.SortBy : Array.isArray(formVal?.SortBy) && formVal.SortBy.length ? formVal.SortBy : this.defaultSort;

    return this.tls23080Service.queryTLS23080({
      ...basePayload,
      pageIndex,
      pageSize: 1000,
      SortBy: sortBy,
    }).pipe(
      map((res: any) => {
        const rows: any[] = Array.isArray(res?.Data) ? res.Data : [];
        const split = this.splitReportRows(rows);
        const totalCount = Number(res?.TotalCount ?? 0);

        if (!split) {
          this.footerData = {};
          this.totalRecords = totalCount;
          return { Data: [], TotalCount: totalCount, GrandTotal: {} };
        }

        const { headerRow, detailRows, totalRow } = split;

        // 分頁/排序由 app-table-report 直接呼叫本函式，欄位仍須依當次標題列重新產生
        this.columns = this.buildDynamicColumns(headerRow, this.baseColumns, this.identityFields);

        const dataRows = detailRows.map((r: any, i: number) => ({
          ...r,
          _rowKey: `${pageIndex}|${r?.TXN_Date ?? ''}|${i}`,
        }));

        const grand = this.buildFooterFromTotalRow(headerRow, totalRow, this.identityFields);
        this.footerData = grand;
        this.totalRecords = totalCount;

        Object.assign(this.historyRequestBody, {
          ...basePayload,
          SortBy: sortBy,
          pageIndex: 1,
          pageSize: 1000,
        });

        return { Data: dataRows, TotalCount: totalCount, GrandTotal: grand };
      })
    );
  };

  // ========= 檔案匯出維護組件 =========
  private buildExportBody() {
    const src = this.historyRequestBody || {};
    const { pageSize, pageIndex, PageSize, PageIndex, ...rest } = src;
    return rest;
  }

  onExportPDF(): void {
    if (!this.historyRequestBody || !Object.keys(this.historyRequestBody).length) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23080Service.exportTLS23080PDF(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (response) => this.handleFileExport(response, '.pdf') });
  }

  onExportXLSX(): void {
    if (!this.historyRequestBody || !Object.keys(this.historyRequestBody).length) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23080Service.exportTLS23080Excel(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (response) => this.handleFileExport(response, '.xlsx') });
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
    const filenameStarMatch = /filename\*=([^;]+)/i.exec(contentDisposition);
    if (filenameStarMatch?.[1]) {
      try { return decodeURIComponent(filenameStarMatch[1].trim().replace(/^UTF-8''/, '')); } catch { }
    }
    const filenameMatch = /filename="([^"]+)"/i.exec(contentDisposition);
    if (filenameMatch?.[1]) {
      try { return decodeURIComponent(filenameMatch[1].replaceAll(/\+/g, ' ')); } catch { }
    }
    return `download${defaultExtension}`;
  }

  // ========= 動態欄位輔助工具（比照 TLS23060/TLS23070：SP 回傳「第一列=標題列、最後一列=總計列」）=========
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
   * 依標題列動態產生欄位設定：固定識別欄位(銷售日期) + 其餘動態支付別欄位，
   * 欄位標題文字取自標題列對應 key 的內容。
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

  onViewTLS23080(row: any): void {
    const dateOnly = this.toDateOnly(row?.TXN_Date);
    this.router.navigate(['/account/tls/tls23080cru'], {
      state: { criteria: { TXN_Date: dateOnly } },
    });
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private compactObject(obj: any): any {
    const out: any = Array.isArray(obj) ? [] : {};
    Object.keys(obj || {}).forEach((k) => {
      const v = obj[k];
      if (v === undefined || v === null || (Array.isArray(v) && v.length === 0)) return;
      out[k] = v;
    });
    return out;
  }

  // ===== 報表欄位結構定義 =====
  // 後端 SP_TLS23080_Query 已改為動態欄位(支付別依 POS1006 動態產生，欄位名稱固定為
  // TXN_PayAmt{PAY_No}，欄位數量/標題會隨支付工具維護內容變動)。查詢結果第一列為標題列、
  // 最後一列為總計列，欄位結構與標題文字皆以當次回傳的標題列為準，不再於前端寫死；
  // 初始(尚未查詢)時僅顯示固定識別欄位(銷售日期)。
  private readonly baseColumns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, align: 'left', format: formatDate },
  ];

  // 識別用途的固定欄位(不屬於動態產生的支付別/金額欄位)
  private readonly identityFields = new Set(['txn_date']);

  columns: ReportColumn[] = [...this.baseColumns];
}
