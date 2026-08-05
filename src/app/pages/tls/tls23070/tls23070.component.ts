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
import { TLS23070Service } from '../../../service/api/tls/tls23070.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

// 修正為指定的共通 Table 欄位型態與格式化工具路徑
import {
  formatAmount,
  formatDate,
  ReportColumn
} from '../../../shared/components/table-report/table-report.model';

// UI 元件
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

interface SortItem { field: string; order: 1 | -1 }

@UntilDestroy()
@Component({
  selector: 'app-tls23070',
  templateUrl: './tls23070.component.html',
  standalone: true,
  imports: [
    CommonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    CalendarRangeComponent, MultiSelectComponent, InputTextModule, ButtonComponent,
    TranslateModule, CalendarComponent, ButtonModule, TableReportComponent, DialogComponent,
  ],
})
export class TLS23070Component extends BasicQueryPageComponent<any> implements OnInit {
  // ===== 排序狀態 =====
  sortMeta: SortItem[] = [];
  readonly defaultSort: SortItem[] = [{ field: 'tlt_no', order: 1 }];

  // ===== 表格控制機制 =====
  mainTableVisible = true;
  mainRenderKey = 0;
  detailTableVisible = true;
  detailRenderKey = 0;
  mainLoading = false;
  detailLoading = false;

  // ===== 資料集與欄位定義 =====
  // 後端回傳為扁平陣列，一次全打回來（無分頁機制）：第一筆是欄位名稱列，最後一筆是總計列，中間才是明細列
  data: any[] = [];
  totalRecords = 0;
  footerData: Record<string, unknown> | null = {};
  columns: ReportColumn[] = [];

  // ===== 匯出狀態管理 =====
  btnLoading = false;
  historyRequestBody: any | null = null;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單宣告 (符合 1000 規格與頁碼 1 起始) =====
  queryForm = this.formBuilder.group({
    TXN_Month: [null],
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    tlt_no: [],
    tlt_building: [null],
    tlt_floor: [],
    org_id: [],
    pageSize: [1000], // ⬅️ 依要求調整為 1000 規格
    pageIndex: [1],   // ⬅️ 初始頁碼改為 1
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  });

  // ===== 下拉選單資料源 =====
  CounterOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];

  // ===== 明細 Dialog 狀態 =====
  dialogVisible = false;
  selectedMainRow: any | null = null;
  dialogData: any[] = [];
  dialogTotalRecords = 0;
  dialogFooterData: Record<string, unknown> | null = null;
  dialogHistoryRequestBody: any | null = null;

  private dropdownInit$?: Observable<any>;

  // 支付別以外的固定文字欄位；其餘欄位一律視為金額欄位（右靠、千分位格式化、列入合計）
  private readonly textFields = new Set(['tlt_no', 'tlt_name', 'TXN_Date', 'ECR_No']);

  constructor(
    public readonly tls23070Service: TLS23070Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly tls11010Service: Tls11010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23070', 'tls/tls23070', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map((x) => ({ ...x }));

    // 月份與日期區間同步機制
    this.queryForm.controls.TXN_Month.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((d: Date | null) => {
        if (!d || isNaN(new Date(d).getTime())) return;
        const { start, end } = this.getMonthRange(d);
        this.queryForm.patchValue({ TXN_DateStart: start, TXN_DateEnd: end, pageIndex: 1 }, { emitEvent: false });
      });

    this.queryForm.controls.TXN_DateStart.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.clearMonthIfNotExactRange());
    this.queryForm.controls.TXN_DateEnd.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.clearMonthIfNotExactRange());

    this.initDropdownData();
  }

  /**
   * 初始化下拉選單資料 (forkJoin 聲明式打包優化)
   */
  private initDropdownData(): void {
    this.dropdownInit$ ??= forkJoin({
      counters: this.dropdownApiService.queryTltTalent().pipe(catchError(() => of([]))),
      floors: this.dropdownApiService.querySys3900().pipe(map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name }))), catchError(() => of([]))),
      buildings: this.tls11010Service.getBuildingOptions().pipe(catchError(() => of([]))),
      orgs: this.dropdownApiService.querySys3100().pipe(catchError(() => of([]))),
    }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.dropdownInit$.pipe(untilDestroyed(this)).subscribe((res: { floors: never[]; buildings: never[]; counters: any; orgs: any; }) => {
      this.floorOptions = res.floors || [];
      this.BUILDING_NO_Options = res.buildings || [];

      const mapStandardOption = (x: any) => ({
        label: x.label,
        formLabel: `${x.label}`,
        value: x.value,
      });

      this.CounterOptions = (res.counters || []).map(mapStandardOption);
      this.OrganizationCodeOptions = (res.orgs || []).map(mapStandardOption);
    });
  }

  // ========= 主表查詢（送出） =========
  // 後端無分頁機制，一次把全部資料打回來，故只呼叫一次 API，不再走 app-table-report 的 queryFunction 分批載入。
  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService?.warnBubble?.('請確認必填欄位');
      return;
    }

    const val = this.queryForm.getRawValue() as any;
    const payload: any = {
      TXN_DateStart: this.toDateOnly(val?.TXN_DateStart),
      TXN_DateEnd: this.toDateOnly(val?.TXN_DateEnd),
      tlt_no: Array.isArray(val?.tlt_no) && val.tlt_no.length ? val.tlt_no : undefined,
      tlt_building: val?.tlt_building ?? undefined,
      tlt_floor: Array.isArray(val?.tlt_floor) && val.tlt_floor.length ? val.tlt_floor : undefined,
      org_id: Array.isArray(val?.org_id) && val?.org_id.length ? val.org_id : undefined,
      SortBy: Array.isArray(val?.SortBy) && val.SortBy.length ? val.SortBy : this.defaultSort,
    };

    this.historyRequestBody = payload;

    this.data = [];
    this.columns = [];
    this.totalRecords = 0;
    this.footerData = {};

    this.mainTableVisible = false;
    this.mainRenderKey++;

    Promise.resolve().then(() => {
      this.mainTableVisible = true;
      this.mainLoading = true;

      this.tls23070Service.queryTLS23070(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.mainLoading = false)))
        .subscribe((res: any) => {
          const { columns, dataRows, totalRow } = this.parseReportRows(res?.Data);
          this.columns = columns;
          this.data = dataRows;
          this.totalRecords = dataRows.length;
          this.footerData = totalRow;
        });
    });
  }

  // ========= 明細彈窗啟動器 =========
  // 同樣無分頁機制，一次把全部資料打回來，故只呼叫一次 API。
  override onDetail(row: any): void {
    if (!row || this.detailLoading) return;

    this.selectedMainRow = row;
    this.dialogVisible = true;

    const body: any = {
      ...(this.historyRequestBody ?? {}),
      tlt_no: row?.tlt_no ? [row.tlt_no] : undefined,
      SortBy: [{ field: 'TXN_Date', order: 1 }],
    };

    this.dialogHistoryRequestBody = body;
    this.dialogData = [];
    this.detailColumns = [];
    this.dialogTotalRecords = 0;
    this.dialogFooterData = null;
    this.detailLoading = true;

    this.tls23070Service.queryTLS23070Detail(body)
      .pipe(untilDestroyed(this), finalize(() => { this.detailLoading = false; }))
      .subscribe((res: any) => {
        const { columns, dataRows, totalRow } = this.parseReportRows(res?.Data);
        this.detailColumns = columns;
        this.dialogData = dataRows;
        this.dialogTotalRecords = dataRows.length;
        this.dialogFooterData = totalRow;
      });
  }

  onDialogClose(v: boolean): void {
    this.dialogVisible = v;
    if (!v) {
      this.selectedMainRow = null;
      this.dialogData = [];
      this.dialogFooterData = null;
      this.dialogTotalRecords = 0;
      this.dialogHistoryRequestBody = null;
    }
  }

  // ========= 檔案匯出維護機制 =========
  onExportPDF(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23070Service.exporttls23070PDF(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService?.warnBubble?.('PDF 匯出失敗。'),
      });
  }

  onExportExcel(): void {
    if (!this.historyRequestBody) return this.showExportWarn();
    this.btnLoading = true;
    this.tls23070Service.exportTLS23070Excel(this.buildExportBody())
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: () => this.messageService?.warnBubble?.('EXCEL 匯出失敗。'),
      });
  }

  private showExportWarn(): void { this.messageService?.warnBubble?.('請先執行查詢以產生報表。'); }

  private buildExportBody() {
    return this.historyRequestBody ?? null;
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

  // ========= 動態欄位解析 =========
  // 後端第一筆是欄位名稱列(field -> 中文標籤)，最後一筆是總計列，中間才是明細列(不含小計)。
  private parseReportRows(rows: any[]): { columns: ReportColumn[]; dataRows: any[]; totalRow: Record<string, unknown> | null } {
    if (!Array.isArray(rows) || rows.length === 0) {
      return { columns: [], dataRows: [], totalRow: null };
    }
    const [headerRow, ...rest] = rows;
    const totalRow = rest.length > 0 ? rest[rest.length - 1] : null;
    const dataRows = (rest.length > 0 ? rest.slice(0, -1) : []).map((row: any, index: number) => ({
      ...row,
      _rowKey: row?.tlt_no ? `${row.tlt_no}|${row.TXN_Date ?? index}` : index,
    }));
    return { columns: this.buildColumnsFromHeaderRow(headerRow), dataRows, totalRow };
  }

  private buildColumnsFromHeaderRow(headerRow: Record<string, unknown>): ReportColumn[] {
    return Object.keys(headerRow ?? {}).map((field) => {
      const isText = this.textFields.has(field);
      return {
        field,
        header: String(headerRow[field] ?? field),
        visible: true,
        align: isText ? (field === 'tlt_name' ? 'left' : undefined) : 'right',
        format: isText ? (field === 'TXN_Date' ? formatDate : undefined) : formatAmount,
        isTotal: !isText,
      } as ReportColumn;
    });
  }

  private getMonthRange(d: Date) {
    const year = d.getFullYear();
    const month = d.getMonth();
    return { start: new Date(year, month, 1, 0, 0, 0), end: new Date(year, month + 1, 0, 23, 59, 59) };
  }

  private clearMonthIfNotExactRange() {
    const start = this.queryForm.value.TXN_DateStart;
    const end = this.queryForm.value.TXN_DateEnd;
    if (!start || !end) {
      this.queryForm.patchValue({ TXN_Month: null }, { emitEvent: false });
      return;
    }
    const { start: mStart, end: mEnd } = this.getMonthRange(new Date(start));
    if (new Date(start).getTime() !== mStart.getTime() || new Date(end).getTime() !== mEnd.getTime()) {
      this.queryForm.patchValue({ TXN_Month: null }, { emitEvent: false });
    }
  }

  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = x instanceof Date ? x : new Date(x);
    if (isNaN(d.getTime())) return undefined;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  detailColumns: ReportColumn[] = [];
}
