/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map } from 'rxjs/operators';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';

import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';

import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';

import {
  ApiResponse,
  Fin34020Service,
  QueryFIN34020Request,
  QueryFIN34020Row,
  SortItem,
} from '../../../service/api/fin/fin34020.service';

import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@UntilDestroy()
@Component({
  selector: 'app-fin34020',
  templateUrl: './fin34020.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule,
    ButtonModule,
    DropdownRangeComponent,
    MenubarComponent,
    ButtonComponent,
    CalendarRangeComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    TableReportComponent,
  ],
})
export class FIN34020Component extends BasicQueryPageComponent<any> {
  data: QueryFIN34020Row[] = [];
  totalRecords = 0;
  selectedItems: QueryFIN34020Row[] = [];
  totalSummary: Record<string, number> = {};
  lastQueryBody: any = null;
  tableVer = 0;

  /** 匯出按鈕 loading */
  btnLoading = false;

  /** 固定 pageSize（table-report 用得到） */
  readonly pageSizeFixed = 30;

  readonly defaultSort: SortItem[] = [
    { field: 'VEN_No', order: 1 },
    { field: 'ARS_Date', order: 1 },
    { field: 'ARS_No', order: 1 },
  ];
  private _currentSortBy: SortItem[] = this.defaultSort;

  /** Report 欄位 */
  columns: ReportColumn[] = [
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '客戶名稱' },
    { field: 'PayType', header: '收/付' },
    { field: 'ARS_No', header: '應收帳款單號' },
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCName', header: '科目名稱' },
    {
      field: 'ARS_Date',
      header: '立帳日期',
      format: (v: any) => this.formatDate(v),
    },
    {
      field: 'PTA_Date',
      header: '預計收款日',
      format: (v: any) => this.formatDate(v),
    },
    {
      field: 'ARS_Amt',
      header: '立帳金額',
      align: 'right',
      format: (v: any) => this.moneyFormat(v),
    },
    { field: 'NoteDesc', header: '摘要' },
    { field: 'RefNo', header: '參考單號' },
    {
      field: 'RCV_Date',
      header: '收款日期',
      format: (v: any) => this.formatDate(v),
    },
    { field: 'VouNo', header: '傳票號碼' },
    {
      field: 'RcvOrAdjAmt',
      header: '收款/調整金額',
      align: 'right',
      format: (v: any) => this.moneyFormat(v),
    },
    {
      field: 'UnpaidBalanceAmt',
      header: '未沖餘額',
      align: 'right',
      format: (v: any) => this.moneyFormat(v),
    },
  ];

  /** 科目代號 options：label = AccNo - AccCName */
  accNoOptions: any[] = [];

  /** Radio options：前端用 boolean，送後端轉 string(1) */
  showOptions = [
    { value: true, label: '顯示' },
    { value: false, label: '不顯示' },
  ];

  /** 月結天數 */
  moneyTypeOptions = [
    { value: 0, label: '0' },
    { value: 11, label: '11' },
    { value: 15, label: '15' },
    { value: 30, label: '30' },
    { value: 45, label: '45' },
  ];

  vendorOptions: any[] = [];

  queryForm = this.formBuilder.group({
    VEN_No_From: ['' as string],
    VEN_No_To: ['' as string],

    ARS_Date_From: [null as Date | null],
    ARS_Date_To: [null as Date | null],
    RCV_Date_From: [null as Date | null],
    RCV_Date_To: [null as Date | null],
    ADJ_Date_From: [null as Date | null],
    ADJ_Date_To: [null as Date | null],

    AccNoList: [[] as string[]],
    MoneyTypeList: [[] as number[]],

    ShowARSAmount: [true as boolean],
    ShowZeroBalance: [true as boolean],

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin34020Service: Fin34020Service,
    private dropDownListService: DropDownListService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'FIN34020',
      'fin/fin34020cru',
      this.queryForm,
      (form) => this.onSubmit(form)
    );

    this.dropDownListService
      .queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.vendorOptions = rows.map((x: any) => ({
          label: `${x.VEN_No} - ${x.Name}`,
          value: x.VEN_No,
        }));
        this.cdr.detectChanges();
      });

    if ((this.dropDownListService as any)?.queryGLS1005_DropDownList) {
      (this.dropDownListService as any)
        .queryGLS1005_DropDownList()
        .pipe(untilDestroyed(this))
        .subscribe((res: any) => {
          const rows = Array.isArray(res?.Data) ? res.Data : [];
          this.accNoOptions = rows
            .map((x: any) => ({
              value: String(x.AccNo ?? x.No ?? ''),
              label: `${x.AccNo ?? x.No ?? ''} - ${x.AccCName ?? x.Name ?? ''}`,
            }))
            .filter((o: any) => o.value);
          this.cdr.detectChanges();
        });
    }
  }

  // ===== helpers =====

  moneyFormat(value: any): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return n.toLocaleString('en-US');
  }

  private formatDate(val: any): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(d.getDate()).padStart(2, '0')}`;
  }

  private toYmd(d: Date | string | null | undefined): string | undefined {
    if (!d) return undefined;
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return undefined;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter(
        (x) => x && typeof x.field === 'string' && typeof x.order === 'number'
      )
      .map((x) => ({
        field: String(x.field),
        order: Number(x.order) || 1,
      }));

    return cleaned.length ? cleaned : fallback;
  }

  /** 後端 ShowARSAmount / ShowZeroBalance 是 string(1) */
  private boolToFlag(v: any): string | undefined {
    if (v === true) return '1';
    if (v === false) return '0';
    if (v === '1' || v === '0') return v;
    return undefined;
  }

  /**
   * 共用 payload builder
   * 查詢 / lazy load / 匯出 都走這裡
   */
  private buildPayload(base: any): QueryFIN34020Request {
    const pageIndex =
      Number.isFinite(base?.pageIndex) && Number(base.pageIndex) >= 1
        ? Number(base.pageIndex)
        : Number.isFinite(base?.PageIndex) && Number(base.PageIndex) >= 1
          ? Number(base.PageIndex)
          : 1;

    const pageSize =
      Number.isFinite(base?.pageSize) && Number(base.pageSize) > 0
        ? Number(base.pageSize)
        : Number.isFinite(base?.PageSize) && Number(base.PageSize) > 0
          ? Number(base.PageSize)
          : this.pageSizeFixed;

    const sort = this.normalizeSort(
      base?.SortBy ?? base?.sortBy,
      this.defaultSort
    );

    const accNoList = Array.isArray(base?.AccNoList)
      ? base.AccNoList.length
        ? base.AccNoList.join(',')
        : undefined
      : typeof base?.AccNoList === 'string'
        ? base.AccNoList || undefined
        : undefined;

    const moneyTypeList = Array.isArray(base?.MoneyTypeList)
      ? base.MoneyTypeList.length
        ? base.MoneyTypeList.join(',')
        : undefined
      : typeof base?.MoneyTypeList === 'string'
        ? base.MoneyTypeList || undefined
        : undefined;

    const payload: QueryFIN34020Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      VEN_No_From: (base?.VEN_No_From ?? '').trim() || undefined,
      VEN_No_To: (base?.VEN_No_To ?? '').trim() || undefined,

      ARS_Date_From: this.toYmd(base?.ARS_Date_From),
      ARS_Date_To: this.toYmd(base?.ARS_Date_To),

      RCV_Date_From: this.toYmd(base?.RCV_Date_From),
      RCV_Date_To: this.toYmd(base?.RCV_Date_To),

      ADJ_Date_From: this.toYmd(base?.ADJ_Date_From),
      ADJ_Date_To: this.toYmd(base?.ADJ_Date_To),

      AccNoList: accNoList,
      MoneyTypeList: moneyTypeList,

      ShowARSAmount: this.boolToFlag(base?.ShowARSAmount),
      ShowZeroBalance: this.boolToFlag(base?.ShowZeroBalance),
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) {
        delete (payload as any)[k];
      }
    });

    return payload;
  }

  private parseQueryResponse(
    res: any
  ): {
    rows: QueryFIN34020Row[];
    total: number;
    totalSummary: Record<string, number>;
  } {
    const rows = Array.isArray(res?.Data?.QueryData)
      ? (res.Data.QueryData as QueryFIN34020Row[])
      : Array.isArray(res?.Data)
        ? (res.Data as QueryFIN34020Row[])
        : [];

    const totalSummary = this.coerceTotals(res?.Data?.TotalSummary);

    const total =
      Number(res?.TotalCount ?? rows.length) || rows.length;

    const mapped = rows.map((r: any, idx: number) => ({
      ...r,
      _rowKey: `${r.ARS_No ?? ''}|${r.VEN_No ?? ''}|${idx}`,
    }));

    return { rows: mapped, total, totalSummary };
  }
  private coerceTotals(src: any): Record<string, number> {
    const out: Record<string, number> = {};
    if (!src) return out;

    for (const k of Object.keys(src)) {
      const v = src[k];
      out[k] = typeof v === 'number' ? v : Number(v) || 0;
    }

    return out;
  }
  buildFooterFromTotals(): Record<string, any> | undefined {
    if (!this.totalSummary) return undefined;

    return {
      ARS_Amt: this.totalSummary['Total_ARS_Amt'] ?? 0,
      RcvOrAdjAmt: this.totalSummary['Total_RcvOrAdjAmt'] ?? 0,
      UnpaidBalanceAmt: this.totalSummary['Total_UnpaidBalanceAmt'] ?? 0,
    };
  }

  /** 給 app-table-report 用 */
  public queryFIN34020ForReport = (body: any) =>
    this.fin34020Service.queryFIN34020(this.buildPayload(body || {})).pipe(
      map((res: ApiResponse<any>) => {
        const parsed = this.parseQueryResponse(res);

        this.totalSummary = parsed.totalSummary;

        return {
          Data: parsed.rows,
          TotalCount: parsed.total,
          GrandTotal: parsed.totalSummary,
        };
      })
    );

  /** 查詢按鈕：一定從第一頁開始，並建立 lastQueryBody 給 table-report / 匯出 用 */
  onSubmit(_frm: any) {
    this.submitted = true;

    const raw = this.queryForm.getRawValue();

    const payload = this.buildPayload({
      ...raw,
      pageIndex: 1,
      pageSize: this.pageSizeFixed,
      SortBy: raw?.SortBy || this._currentSortBy || this.defaultSort,
    });

    payload.PageIndex = 1;
    payload.PageSize = this.pageSizeFixed;

    this._currentSortBy = payload.SortBy ?? this.defaultSort;

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.totalRecords = 0;
    this.tableVer++;

    this.fin34020Service
      .queryFIN34020(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);

          this.data = parsed.rows;
          this.totalRecords = parsed.total;
          this.totalSummary = parsed.totalSummary;

          this.lastQueryBody = {
            ...raw,
            ...payload,
            pageIndex: 1,
            pageSize: payload.PageSize ?? this.pageSizeFixed,
            SortBy: payload.SortBy ?? this.defaultSort,
          };

          this.saveQueryState();

          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('FIN34020 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onClear(frm: any) {
    frm.reset({
      VEN_No_From: '',
      VEN_No_To: '',
      ARS_Date_From: null,
      ARS_Date_To: null,
      RCV_Date_From: null,
      RCV_Date_To: null,
      ADJ_Date_From: null,
      ADJ_Date_To: null,
      MoneyTypeList: [],
      AccNoList: [],
      ShowZeroBalance: true,
      ShowARSAmount: true,
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.selectedItems = [];
    this.totalRecords = 0;
    this.lastQueryBody = null;
    this._currentSortBy = this.defaultSort;
    this.tableVer++;
  }

  private saveQueryState(): void {
    this.queryStateService.setQueryState('FIN34020', {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  /** =======================
   * 匯出：跟查詢同 payload，只是不送 PageIndex / PageSize
   * ======================= */

  private getFilenameFromHeader(
    contentDisposition: string | null,
    defaultExtension: string
  ): string {
    if (!contentDisposition) return `download${defaultExtension}`;

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(
          encodedFilename.replace(/^UTF-8''/, '')
        );
        return decoded;
      } catch {
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }

  private handleFileExport(
    response: HttpResponse<Blob>,
    fileExtension: string
  ): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(
      contentDisposition,
      fileExtension
    );
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
      this.messageService?.warnBubble?.(
        '沒有找到符合條件的資料，無法生成報表。'
      );
    }
  }

  /**
   * 匯出 payload：
   * 跟查詢傳一樣，只是不傳 PageIndex / PageSize
   */
  private buildExportBody(): QueryFIN34020Request | null {
    const base = this.lastQueryBody
      ? { ...this.lastQueryBody }
      : {
        ...this.queryForm.getRawValue(),
        SortBy: this._currentSortBy || this.defaultSort,
      };

    const payload = this.buildPayload(base);

    delete (payload as any).PageIndex;
    delete (payload as any).PageSize;
    delete (payload as any).Offset;
    delete (payload as any).OrderBy;

    return payload;
  }

  onExportPDF() {
    const exportBody = this.buildExportBody();
    if (!exportBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }

    this.btnLoading = true;

    this.fin34020Service
      .exportFIN34020PDF(exportBody)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.btnLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
        error: (err) => {
          console.error('PDF export error:', err);
          this.messageService?.errorBubble?.(
            err?.error?.Message || 'PDF 匯出失敗'
          );
        },
      });
  }

  onExportXLSX() {
    const exportBody = this.buildExportBody();
    if (!exportBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }

    this.btnLoading = true;

    this.fin34020Service
      .exportFIN34020Excel(exportBody)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.btnLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: (err) => {
          console.error('Excel export error:', err);
          this.messageService?.errorBubble?.(
            err?.error?.Message || 'Excel 匯出失敗'
          );
        },
      });
  }
}