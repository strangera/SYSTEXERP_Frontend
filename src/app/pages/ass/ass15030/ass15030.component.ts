import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { ASS15030Service } from '@service/api/ass/ass15030.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize, map, Observable } from 'rxjs';
import { Option } from '../../../service/utility/dropdown-api.model';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { formatDate } from '../../../shared/componentkit/table-report/table-report.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { removeEmptyValues } from '../../../shared/utils/object-utils';
import {
  QueryASS15030DetailResponse,
  QueryASS15030Request,
  QueryASS15030SumResponse,
} from './ass15030.model';

//3.1.5.3  財產目錄
@UntilDestroy()
@Component({
  selector: 'app-ass15030',
  templateUrl: './ass15030.component.html',
  styleUrl: './ass15030.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, RadiobuttonComponent, DropdownComponent, CalendarRangeComponent, CalendarComponent, CheckboxModule, ButtonComponent, TableReportComponent, TranslateModule, ButtonModule]
})
export class ASS15030Component extends BasicQueryPageComponent<any> implements OnInit {
  private static readonly SUBTOTAL_SEQ = '小計';
  private static readonly GRANDTOTAL_SEQ = '總合計';
  private static readonly GROUP_KEY_FIELD = '__groupKey';

  queryForm = this.formBuilder.group({
    paperType: ['1'], // 報表型態 1=折舊前試算 2=拋轉
    accountCode: [null as string | null], // 會計科目代碼
    keeperUnit: [null as string | null], // 保管單位
    purchaseDateFrom: [null as Date | null], // 購入日期(起)
    purchaseDateTo: [null as Date | null], // 購入日期(訖)
    bigCategoryCode: [null as string | null], // 大分類編號
    midCategoryCode: [null as string | null], // 中分類編號
    smlCategoryCode: [null as string | null], // 小分類編號
    entryDateFrom: [null as Date | null], // 入帳日期(起)
    entryDateTo: [null as Date | null], // 入帳日期(訖)
    itemCode: [null as string | null], // 品項編號
    baseYYMM: [null as string | null, [Validators.required]], // 基準日 YYYYMM
    showReceiveAmount: [false], // 是否顯示取得金額為0 (勾選=true)
    showScrapData: [false], // 是否顯示當期報廢、變賣資料 (勾選=true)
    reportStyle: ['1'], // 報表樣式 1=彙總 2=明細
  });
  data: any[] = [];
  totalRecords = 0;
  subTotalData: any[] = [];
  footerData: any | null = null;
  readonly tableLoading = signal(false);
  exportPdfLoading = false;
  exportExcelLoading = false;
  private readonly defaultPageSize = 30;
  lastQueryBody?: QueryASS15030Request & { pageIndex?: number; pageSize?: number };

  private readonly summaryColumns: any[] = [
    { field: 'SEQ', header: '項次', visible: true },
    { field: 'GOODS_ID', header: '品項編號', visible: true },
    { field: 'GOODS_NAME', header: '品項名稱', visible: true },
    { field: 'HOLD_ORG_NAME', header: '保管單位', visible: true },
    { field: 'GET_COST_TTL', header: '取得價格\n合計', visible: true, isSubTotal: true },
    { field: 'FIX_AMT_TTL', header: '異動價格\n合計', visible: true, isSubTotal: true },
    { field: 'AFT_AMT_TTL', header: '異動後價格\n合計', visible: true, isSubTotal: true },
    { field: 'RESI_VALUE_TTL', header: '預留總值\n合計', visible: true, isSubTotal: true },
    { field: 'PRE_DEPRE_TTL', header: '前期折舊金額', visible: true, isSubTotal: true },
    { field: 'CUR_DEPRE_TTL', header: '本期\n折舊金額\n合計', visible: true, isSubTotal: true },
    { field: 'ACC_DEPRE_TTL', header: '累計\n折舊金額\n合計', visible: true, isSubTotal: true },
    { field: 'UNDEPRE_TTL', header: '未折舊金額\n合計', visible: true, isSubTotal: true },
  ];

  private readonly detailColumns: any[] = [
    { field: 'SEQ', header: '項次', visible: true },
    { field: 'ASSET_ID', header: '財產編號', visible: true },
    { field: 'GOODS_NAME', header: '項目名稱', visible: true },
    { field: 'GET_DATE', header: '購入\n日期', visible: true, format: (v: string) => formatDate(v) },
    { field: 'BILL_DATE', header: '入帳\n日期', visible: true, format: (v: string) => formatDate(v) },
    { field: 'HOLD_ORG_ID', header: '保管單位', visible: true },
    { field: 'FIR_GET_COST', header: '取得價格', visible: true, isSubTotal: true },
    { field: 'MODIFY_AMT', header: '異動價格', visible: true, isSubTotal: true },
    { field: 'GET_COST', header: '異動後價格', visible: true, isSubTotal: true },
    { field: 'RESI_VALUE', header: '預留\n殘值', visible: true, isSubTotal: true },
    { field: 'FIR_EXP_YEAR', header: '耐用\n年數', visible: true, isSubTotal: true },
    { field: 'MODIFY_YEAR', header: '異動\n耐用\n年數', visible: true, isSubTotal: true },
    { field: 'EXP_YEAR', header: '異動後\n耐用\n年數', visible: true, isSubTotal: true },
    { field: 'BUY_MONTHS', header: '已購入\n月數', visible: true, isSubTotal: true },
    { field: 'BILL_MONTHS', header: '已入帳\n月數', visible: true, isSubTotal: true },
    { field: 'DEPRE_MONTHS', header: '已攤提\n月數', visible: true, isSubTotal: true },
    { field: 'DEPRE_AMOUNT', header: '本年\n折舊金額', visible: true, isSubTotal: true },
    { field: 'THIS_DEPRE_AMT', header: '本期\n折舊金額', visible: true, isSubTotal: true },
    { field: 'TAL_DEPRE_AMT', header: '累計\n折舊金額', visible: true, isSubTotal: true },
    { field: 'NO_DEPRE_AMT', header: '未折舊金額', visible: true, isSubTotal: true },
    { field: 'NOTES', header: '財產註記', visible: true },
  ];

  columns: any[] = [...this.summaryColumns];

  paperTypeOptions: Option[] = [
    { value: '1', label: '折舊前試算' },
    { value: '2', label: '拋轉' },
  ];
  accountCodeOptions: Option[] = [];
  keeperUnitOptions: Option[] = [];
  bigCategoryCodeOptions: Option[] = [];
  midCategoryCodeOptions: Option[] = [];
  smlCategoryCodeOptions: Option[] = [];
  itemCodeOptions: Option[] = [];
  reportStyleOptions: Option[] = [
    { value: '1', label: '彙總' },
    { value: '2', label: '明細' },
  ];

  constructor(
    private readonly dropdownApiService: DropdownApiService,
    private readonly ass15030Service: ASS15030Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS15030', '', this.queryForm, frm => this.onSubmit(frm));
    this.loadDropdownOptions();
    this.setupCategoryCascade();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(
      frm,
      () => {
        if (!this.hasPermission(this.Actions.Query)) {
          this.tableLoading.set(false);
          return;
        }
        this.columns = this.getColumnsByReportStyle(this.queryForm.controls.reportStyle.value);
        const request = this.buildRequest({
          pageSize: this.defaultPageSize,
          pageIndex: 1,
          SortBy: this.lastQueryBody?.SortBy,
        });
        this.lastQueryBody = request;

        this.tableLoading.set(true);
        this.queryFunction(request)
          .pipe(
            untilDestroyed(this),
            finalize(() => {
              this.tableLoading.set(false);
              this.loading = false;
            }),
          )
          .subscribe({
            next: res => {
              this.data = res.Data ?? [];
              this.totalRecords = res.TotalCount ?? 0;
              this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
            },
            error: () => {
              this.data = [];
              this.totalRecords = 0;
              this.subTotalData = [];
              this.footerData = null;
            },
          });
      },
      v => this.tableLoading.set(v),
    );
  }

  queryFunction = (body: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }): Observable<{ Data: any[]; TotalCount: number }> => {
    const rawPageIndex = Number(body.pageIndex ?? body.PageIndex ?? 1) || 1;
    const apiPageSize = Number(body.PageSize ?? this.defaultPageSize) || this.defaultPageSize;
    const apiPageIndex = rawPageIndex;
    const request = this.buildRequest({
      ...body,
      pageIndex: apiPageIndex,
      PageIndex: apiPageIndex,
      pageSize: apiPageSize,
      PageSize: apiPageSize,
    });
    this.lastQueryBody = request;
    return this.queryByReportStyle(request).pipe(
      map(({ rows, totalCount }) => {
        const part = this.partitionRows(rows, apiPageIndex);
        this.syncSummaryRowsFromPage(part, apiPageIndex);
        const effectivePageSize = Math.max(1, part.details.length);
        this.lastQueryBody = {
          ...(request as QueryASS15030Request),
          pageIndex: rawPageIndex,
          pageSize: effectivePageSize,
        };
        return {
          Data: this.mapDetailsWithDataKey(part.details, apiPageIndex),
          TotalCount: totalCount,
        };
      }),
    );
  };

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  override onCreate(): void {
    if (this.hasPermission(this.Actions.Create)) {
      this.navigateWithState(CRUDStatus.Create, null);
    }
  }

  override onEdit(data: any): void {
    if (this.hasPermission(this.Actions.Edit)) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  override onDetail(data: any): void {
    this.navigateWithState(CRUDStatus.Read, data);
  }

  private loadDropdownOptions(): void {
    this.dropdownApiService
      .queryGls1005()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.accountCodeOptions = opts ?? []));

    this.dropdownApiService
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.keeperUnitOptions = opts ?? []));

    this.dropdownApiService
      .queryFaClassM({})
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.bigCategoryCodeOptions = opts ?? []));

    this.dropdownApiService
      .queryFasItemDropdown({})
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.itemCodeOptions = opts ?? []));
  }

  private setupCategoryCascade(): void {
    this.queryForm.controls.bigCategoryCode.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(bigCode => {
        this.queryForm.patchValue(
          { midCategoryCode: null, smlCategoryCode: null },
          { emitEvent: false },
        );
        this.midCategoryCodeOptions = [];
        this.smlCategoryCodeOptions = [];
        if (!bigCode) return;
        this.dropdownApiService
          .queryFaClass1({ CLASS_ID: bigCode })
          .pipe(untilDestroyed(this))
          .subscribe(opts => (this.midCategoryCodeOptions = opts ?? []));
      });

    this.queryForm.controls.midCategoryCode.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(midCode => {
        this.queryForm.patchValue({ smlCategoryCode: null }, { emitEvent: false });
        this.smlCategoryCodeOptions = [];
        if (!midCode) return;
        this.dropdownApiService
          .queryFaClass2({ CLASS_ID: midCode })
          .pipe(untilDestroyed(this))
          .subscribe(opts => (this.smlCategoryCodeOptions = opts ?? []));
      });
  }

  private buildRequest(body?: {
    pageSize?: number;
    PageSize?: number;
    pageIndex?: number;
    PageIndex?: number;
    SortBy?: unknown;
  }): QueryASS15030Request {
    const q = this.queryForm.getRawValue();
    const pageSize = body?.pageSize ?? body?.PageSize ?? this.defaultPageSize;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? 1;
    const sortBy = Array.isArray(body?.SortBy) ? body?.SortBy : undefined;

    const payload: QueryASS15030Request = {
      STYPE_ID: q.accountCode || undefined,
      HOLD_ORG_ID: q.keeperUnit || undefined,
      GET_DATE_S: this.toApiDateValue(q.purchaseDateFrom),
      GET_DATE_E: this.toApiDateValue(q.purchaseDateTo),
      B_CLASS_ID: q.bigCategoryCode || undefined,
      M_CLASS_ID: q.midCategoryCode || undefined,
      S_CLASS_ID: q.smlCategoryCode || undefined,
      BILL_DATE_S: this.toApiDateValue(q.entryDateFrom),
      BILL_DATE_E: this.toApiDateValue(q.entryDateTo),
      GOODS_ID: q.itemCode || undefined,
      BaseYM: this.toBaseYm(q.baseYYMM),
      Type: q.paperType || undefined,
      SHOW_ZERO: q.showReceiveAmount ? '1' : '0',
      SHOW_HANDLE: q.showScrapData ? '1' : '0',
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: sortBy,
    };

    return removeEmptyValues(payload) as QueryASS15030Request;
  }

  private queryByReportStyle(
    request: QueryASS15030Request,
  ): Observable<{ rows: any[]; totalCount: number }> {
    const reportStyle = this.queryForm.controls.reportStyle.value;
    if (reportStyle === '2') {
      return this.ass15030Service.queryASS15030Detail(request).pipe(
        map(res => {
          const list = res.Status === '0000' ? (res.Data ?? []) : [];
          const rows = this.mapDetailRows(list);
          const totalCount = list[0]?.TOTAL_COUNT ?? res.TotalCount ?? rows.length;
          return { rows, totalCount };
        }),
      );
    }
    return this.ass15030Service.queryASS15030Sum(request).pipe(
      map(res => {
        const list = res.Status === '0000' ? (res.Data ?? []) : [];
        const rows = this.mapSummaryRows(list);
        const totalCount = list[0]?.TOTAL_COUNT ?? res.TotalCount ?? rows.length;
        return { rows, totalCount };
      }),
    );
  }

  private mapSummaryRows(rows: QueryASS15030SumResponse[]): any[] {
    return (rows ?? []).map((row, idx) => ({
      ...row,
      SEQ: this.normalizeSeqValue(row.SEQ, `${idx + 1}`),
      GOODS_ID: this.isSubtotalRow(row.SEQ) ? null : (row.GOODS_ID ?? ''),
      GOODS_NAME: this.isSubtotalRow(row.SEQ) ? null : (row.GOODS_NAME ?? ''),
      HOLD_ORG_NAME: this.isSubtotalRow(row.SEQ) ? null : (row.HOLD_ORG_NAME ?? ''),
      GET_COST_TTL: row.GET_COST_TTL ?? 0,
      FIX_AMT_TTL: row.FIX_AMT_TTL ?? 0,
      AFT_AMT_TTL: row.AFT_AMT_TTL ?? 0,
      RESI_VALUE_TTL: row.RESI_VALUE_TTL ?? 0,
      PRE_DEPRE_TTL: row.PRE_DEPRE_TTL ?? 0,
      CUR_DEPRE_TTL: row.CUR_DEPRE_TTL ?? 0,
      ACC_DEPRE_TTL: row.ACC_DEPRE_TTL ?? 0,
      UNDEPRE_TTL: row.UNDEPRE_TTL ?? 0,
    }));
  }

  private mapDetailRows(rows: QueryASS15030DetailResponse[]): any[] {
    return (rows ?? []).map((row, idx) => ({
      ...row,
      SEQ: this.normalizeSeqValue(row.SEQ, `${idx + 1}`),
      ASSET_ID: this.isSubtotalRow(row.SEQ) ? null : (row.ASSET_ID ?? ''),
      GOODS_NAME: this.isSubtotalRow(row.SEQ) ? null : (row.GOODS_NAME ?? ''),
      GET_DATE: this.isSubtotalRow(row.SEQ) ? null : (row.GET_DATE ?? ''),
      BILL_DATE: this.isSubtotalRow(row.SEQ) ? null : (row.BILL_DATE ?? ''),
      HOLD_ORG_ID: this.isSubtotalRow(row.SEQ) ? null : (row.HOLD_ORG_ID ?? ''),
      FIR_GET_COST: row.FIR_GET_COST ?? 0,
      MODIFY_AMT: row.MODIFY_AMT ?? 0,
      GET_COST: row.GET_COST ?? 0,
      RESI_VALUE: row.RESI_VALUE ?? 0,
      FIR_EXP_YEAR: row.FIR_EXP_YEAR ?? 0,
      MODIFY_YEAR: row.MODIFY_YEAR ?? 0,
      EXP_YEAR: row.EXP_YEAR ?? 0,
      BUY_MONTHS: row.BUY_MONTHS ?? 0,
      BILL_MONTHS: row.BILL_MONTHS ?? 0,
      DEPRE_MONTHS: row.DEPRE_MONTHS ?? 0,
      DEPRE_AMOUNT: row.DEPRE_AMOUNT ?? 0,
      THIS_DEPRE_AMT: row.THIS_DEPRE_AMT ?? 0,
      TAL_DEPRE_AMT: row.TAL_DEPRE_AMT ?? 0,
      NO_DEPRE_AMT: row.NO_DEPRE_AMT ?? 0,
      NOTES: row.NOTES ?? '',
    }));
  }

  private getColumnsByReportStyle(reportStyle: string | null | undefined): any[] {
    return reportStyle === '2' ? [...this.detailColumns] : [...this.summaryColumns];
  }

  private normalizeSeqValue(seq: string | undefined, fallback: string): string {
    const trimmed = String(seq ?? '').trim();
    return trimmed || fallback;
  }

  private isSubtotalRow(seq: string | undefined): boolean {
    return String(seq ?? '').trim() === ASS15030Component.SUBTOTAL_SEQ;
  }

  private isGrandTotalRow(seq: string | undefined): boolean {
    return String(seq ?? '').trim() === ASS15030Component.GRANDTOTAL_SEQ;
  }

  private partitionRows(rows: any[], pageIndex: number): { details: any[]; subTotals: any[]; grandTotal: any | null } {
    const details: any[] = [];
    const subTotals: any[] = [];
    let grandTotal: any | null = null;
    let groupNo = 1;
    let currentGroupKey = this.buildGroupKey(pageIndex, groupNo);

    for (const row of rows ?? []) {
      if (this.isSubtotalRow(row?.SEQ)) {
        subTotals.push({
          ...row,
          [ASS15030Component.GROUP_KEY_FIELD]: currentGroupKey,
        });
        groupNo += 1;
        currentGroupKey = this.buildGroupKey(pageIndex, groupNo);
      } else if (this.isGrandTotalRow(row?.SEQ)) {
        grandTotal = row;
      } else {
        details.push({
          ...row,
          [ASS15030Component.GROUP_KEY_FIELD]: currentGroupKey,
        });
      }
    }
    return { details, subTotals, grandTotal };
  }

  private mergeSubTotals(existing: any[], incoming: any[]): any[] {
    return [...(existing ?? []), ...(incoming ?? [])];
  }

  private mapDetailsWithDataKey(details: any[], pageIndex: number): any[] {
    return (details ?? []).map((item, idx) => ({
      ...item,
      dataKey: item.dataKey ?? `${pageIndex}-${item[ASS15030Component.GROUP_KEY_FIELD] ?? 'g'}-${item.SEQ ?? idx}-${idx}`,
    }));
  }

  private buildGroupKey(pageIndex: number, groupNo: number): string {
    return `P${pageIndex}_G${groupNo}`;
  }

  private syncSummaryRowsFromPage(
    part: { details: any[]; subTotals: any[]; grandTotal: any | null },
    pageIndex: number,
  ): void {
    if (pageIndex <= 1) {
      this.subTotalData = [...part.subTotals];
      this.footerData = part.grandTotal;
      return;
    }

    this.subTotalData = this.mergeSubTotals(this.subTotalData, part.subTotals);
    if (part.grandTotal) {
      this.footerData = part.grandTotal;
    }
  }

  onExportPdf(): void {
    const request = this.buildRequest({
      PageSize: this.lastQueryBody?.PageSize ?? 0,
      PageIndex: this.lastQueryBody?.PageIndex ?? 0,
      SortBy: this.lastQueryBody?.SortBy,
    });
    this.exportPdfLoading = true;
    const isDetail = this.queryForm.controls.reportStyle.value === '2';
    const export$ = isDetail
      ? this.ass15030Service.exportPDFASS15080Detail(request)
      : this.ass15030Service.exportPDFASS15080Sum(request);
    export$
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.exportPdfLoading = false)),
      )
      .subscribe({
        next: blob => {
          const reportName = isDetail ? '財產目錄_明細' : '財產目錄_彙總';
          this.downloadBlob(blob, `${reportName}_${this.getTimestamp()}.pdf`);
        },
      });
  }

  onExportExcel(): void {
    const request = this.buildRequest({
      PageSize: this.lastQueryBody?.PageSize ?? 0,
      PageIndex: this.lastQueryBody?.PageIndex ?? 0,
      SortBy: this.lastQueryBody?.SortBy,
    });
    const isDetail = this.queryForm.controls.reportStyle.value === '2';
    const export$ = isDetail
      ? this.ass15030Service.exportExcelASS15030Detail(request)
      : this.ass15030Service.exportExcelASS15030Sum(request);
    this.exportExcelLoading = true;
    export$
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.exportExcelLoading = false)),
      )
      .subscribe({
        next: blob => {
          const reportName = isDetail ? '財產目錄_明細' : '財產目錄_彙總';
          this.downloadBlob(blob, `${reportName}_${this.getTimestamp()}.xlsx`);
        },
        error: () => this.messageService.warnBubble('匯出 Excel 失敗，請稍後再試'),
      });
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }

  private getTimestamp(): string {
    const now = new Date();
    return (
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      '_' +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0')
    );
  }

  private toApiDateValue(value: unknown): string | undefined {
    if (value == null || value === '') return undefined;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    return undefined;
  }

  private toBaseYm(value: unknown): string | undefined {
    if (value == null || value === '') return undefined;
    if (value instanceof Date) {
      const y = value.getFullYear();
      const m = (value.getMonth() + 1).toString().padStart(2, '0');
      return `${y}${m}`;
    }
    if (typeof value === 'string') {
      const nums = value.replace(/\D/g, '');
      if (nums.length >= 6) return nums.substring(0, 6);
    }
    return undefined;
  }
}
