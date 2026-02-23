/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';

import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';

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
  styleUrls: ['./fin34020.component.scss'],
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

  /** Report 欄位（改成 ReportColumn） */
  columns: ReportColumn[] = [
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '客戶名稱' },
    { field: 'PayType', header: '收/付' },
    { field: 'ARS_No', header: '應收帳款單號' },
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCName', header: '科目名稱' },
    { field: 'ARS_Date', header: '立帳日期', format: (v: any) => this.formatDate(v) },
    { field: 'PTA_Date', header: '預計收款日', format: (v: any) => this.formatDate(v) },
    { field: 'ARS_Amt', header: '立帳金額', align: 'right', format: (v: any) => this.moneyFormat(v) },
    { field: 'NoteDesc', header: '摘要' },
    { field: 'RefNo', header: '參考單號' },
    { field: 'RCV_Date', header: '收款日期', format: (v: any) => this.formatDate(v) },
    { field: 'VouNo', header: '傳票號碼' },
    { field: 'RcvOrAdjAmt', header: '收款/調整金額', align: 'right', format: (v: any) => this.moneyFormat(v) },
    { field: 'UnpaidBalanceAmt', header: '未沖餘額', align: 'right', format: (v: any) => this.moneyFormat(v) },
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

  /** ✅ 查詢表單（依你貼的欄位） */
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

    // table-report 也會塞 SortBy / pageIndex / pageSize 進來（你表單留著不衝突）
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

    // 1) 廠客
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

    // 2) 科目代號（如果你專案真的有這支）
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
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate()
    ).padStart(2, '0')}`;
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
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: Number(x.order) || 1 }));
    return cleaned.length ? cleaned : fallback;
  }

  /** 後端 ShowARSAmount / ShowZeroBalance 是 string(1) */
  private boolToFlag(v: any): string | undefined {
    if (v === true) return '1';
    if (v === false) return '0';
    return undefined;
  }

  /** ✅ TableReport body(pageIndex/pageSize/SortBy) -> 後端 QueryFIN34020Request(PageIndex/PageSize/SortBy) */
  private buildQueryPayload(base: any): QueryFIN34020Request {
    const pageIndex =
      Number.isFinite(base?.pageIndex) && Number(base.pageIndex) >= 1
        ? Number(base.pageIndex)
        : 1;

    const pageSize =
      Number.isFinite(base?.pageSize) && Number(base.pageSize) > 0
        ? Number(base.pageSize)
        : this.pageSizeFixed;

    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

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

      AccNoList:
        Array.isArray(base?.AccNoList) && base.AccNoList.length
          ? base.AccNoList.join(',')
          : undefined,

      MoneyTypeList:
        Array.isArray(base?.MoneyTypeList) && base.MoneyTypeList.length
          ? base.MoneyTypeList.join(',')
          : undefined,

      ShowARSAmount: this.boolToFlag(base?.ShowARSAmount),
      ShowZeroBalance: this.boolToFlag(base?.ShowZeroBalance),
    };

    // 清掉空值
    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  private parseQueryResponse(res: any): { rows: QueryFIN34020Row[]; total: number } {
    const rows = Array.isArray(res?.Data) ? (res.Data as QueryFIN34020Row[]) : [];
    const total =
      Number(res?.TotalCount ?? (res?.Data as any)?.TotalCount ?? rows.length) || rows.length;

    // 補 rowKey（table-report dataKey 用）
    const mapped = rows.map((r: any, idx: number) => ({
      ...r,
      _rowKey: `${r.ARS_No ?? ''}|${r.VEN_No ?? ''}|${idx}`,
    }));

    return { rows: mapped, total };
  }

  /** ✅ 給 app-table-report 用（滾動載入 / 排序都走這個） */
  public queryFIN34020ForReport = (body: any) =>
    this.fin34020Service.queryFIN34020(this.buildQueryPayload(body || {})).pipe(
      map((res: ApiResponse<any>) => {
        const parsed = this.parseQueryResponse(res);

        // ✅ 關鍵：如果這次回來 rows=0，告訴 table-report 已載完，避免無限打下一頁
        const totalCount =
          parsed.rows.length === 0 ? (this.data?.length ?? 0) : parsed.total;

        return { Data: parsed.rows, TotalCount: totalCount, GrandTotal: null };
      })
    );

  /** ✅ 查詢按鈕：一定從第一頁開始，並建立 lastQueryBody 給 table-report 用 */
  onSubmit(_frm: any) {
    this.submitted = true;

    const raw = this.queryForm.getRawValue();

    const payload = this.buildQueryPayload({
      ...raw,
      pageIndex: 1,
      pageSize: this.pageSizeFixed,
      SortBy: raw?.SortBy || this._currentSortBy || this.defaultSort,
    });

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

          // ✅ table-report 需要的小寫 pageIndex/pageSize + SortBy
          this.lastQueryBody = {
            ...raw,
            ...payload, // 含 PageIndex/PageSize/SortBy/條件
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
   * 匯出（沿用 lastQueryBody，移除分頁）
   * ======================= */
  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
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

  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  private buildExportBody(): any {
    if (!this.lastQueryBody) return null;

    const exportBody = { ...this.lastQueryBody };

    // 你專案有時候會混 pageIndex/pageSize & PageIndex/PageSize，這裡全部刪掉最保險
    delete exportBody.pageIndex;
    delete exportBody.pageSize;
    delete exportBody.PageIndex;
    delete exportBody.PageSize;

    delete exportBody.Offset;
    delete exportBody.OrderBy;

    return exportBody;
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
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
        error: (err) => {
          console.error(err);
          this.messageService.errorBubble('匯出失敗');
        },
        complete: () => (this.btnLoading = false),
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
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: (err) => {
          console.error(err);
          this.messageService.errorBubble('匯出失敗');
        },
        complete: () => (this.btnLoading = false),
      });
  }
}
