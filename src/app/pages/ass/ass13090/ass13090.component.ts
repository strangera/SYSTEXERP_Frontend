import { DatePipe, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13090Service } from '@service/api/ass/ass13090.service';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { Observable, catchError, finalize, map, of } from 'rxjs';
import { Option } from '../../../service/utility/dropdown-api.model';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/components/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../shared/components/table-report/table-report.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { removeEmptyValues } from '../../../shared/utils/object-utils';
import { ApiResponse } from '../../../shared/utils/rxjs-operators/validate-api-response';
import {
  AmorASS13090Request,
  AmorASS13090Response,
  AmortizeASS13090Request,
  PrintASS13090Request,
  QueryASS13090QueryDataRow,
  QueryASS13090Request,
  ResultLayoutMode,
} from './ass13090.model';

const ASS13090_COLUMNS_CONFIGURED: ReportColumn[] = [
  { field: 'DEPRE_ID', header: '攤提代號', visible: true },
  { field: 'GOODS_ID', header: '品項編號', visible: true },
  { field: 'GET_DATE', header: '購入日期', visible: true },
  { field: 'BILL_DATE', header: '入帳日期', visible: true },
  { field: 'SYS_Name', header: '資產類型', visible: true },
  { field: 'ASSET_COST', header: '購入金額', visible: true },
  {
    field: 'DEPRE_STATUS',
    header: '攤提狀態',
    visible: true,
    cellClass: (row: QueryASS13090QueryDataRow) =>
      row.DEPRE_STATUS === '未攤提'
        ? 'text-red-500'
        : '',
  },
];

const ASS13090_COLUMNS_UNAMORTIZED: ReportColumn[] = [
  { field: 'DEPRE_ID', header: '攤提代號', visible: true },
  { field: 'GOODS_ID', header: '料項編號', visible: true },
  { field: 'GET_DATE', header: '購入日期', visible: true },
  { field: 'BILL_DATE', header: '入帳日期', visible: true },
  { field: 'SYS_Name', header: '資產類型', visible: true },
  { field: 'GET_COST', header: '購入金額', visible: true },
  {
    field: 'DEPRE_STATUS_TEXT',
    header: '折舊狀態',
    visible: true,
    cellClass: (row: AmorASS13090Response) =>
      row.DEPRE_STATUS_TEXT === '未設定'
        ? 'text-red-500'
        : '',
  },
];

type DateOrString = Date | string | null;

//3.1.3.9 資產攤提作業
@UntilDestroy()
@Component({
  selector: 'app-ass13090',
  templateUrl: './ass13090.component.html',
  standalone: true,
  providers: [DatePipe],
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    CalendarRangeComponent,
    CalendarComponent,
    RadiobuttonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class ASS13090Component extends BasicQueryPageComponent<QueryASS13090QueryDataRow | AmorASS13090Response> implements OnInit {
  queryForm = this.formBuilder.group({
    amortCode: [null as string | null], // 攤提代號
    itemCode: [null as string | null], // 品項編號
    inputDateFrom: [null as Date | null], // 購入日期起
    inputDateTo: [null as Date | null], // 購入日期(訖)
    assetStatus: [null as string | null], // 資產狀態
    assetType: [null as string | null], // 資產類型
    accountCode: [null as string | null], // 會計科目代號
    inputAmountFrom: [null as number | null], // 購入金額(起)
    inputAmountTo: [null as number | null], // 購入金額(訖)
    purchaseNo: [null as string | null], // 採購單號 → SUBPOENA_ID
    amortYearMonth: [null as DateOrString], // 攤提年月
    conditionFilter: [], // 1:已設定攤提 → DEPRE_STATUS Y；0:未設定 → N
    pageSize: [1000],
    pageIndex: [1],
  });

  data: QueryASS13090QueryDataRow[] | AmorASS13090Response[] = [];
  totalRecords = 0;
  readonly tableLoading = signal(false);
  /** 上次查詢條件（含分頁／排序；餵給 table-report lazy / sort） */
  lastQueryBody?: Record<string, unknown>;
  /** 上次執行的查詢版型（決定結果表欄位與操作） */
  resultLayoutMode: ResultLayoutMode = ResultLayoutMode.Query;
  selectedRows: QueryASS13090QueryDataRow[] = [];
  exportExcelLoading = false;
  exportPdfLoading = false;
  columns: ReportColumn[] = [...ASS13090_COLUMNS_CONFIGURED];
  itemCodeOptions: Option[] = [];
  assetStatusOptions: Option[] = [];
  assetTypeOptions: Option[] = [];
  accountCodeOptions: Option[] = [];
  purchaseNoOptions: Option[] = [];
  conditionFilterOptions: Option[] = [
    { value: '1', label: '已設定攤提' },
    { value: '0', label: '未設定攤提' },
  ];

  constructor(
    private readonly dropdownApiService: DropdownApiService,
    private readonly ass13090Service: ASS13090Service,
    private readonly fileExportService: FileExportService,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  /**
   * 供 app-table-report：捲動載入更多／排序後重查（與 queryASS15050ForReport 同型）
   */
  queryASS13090ForReport = (
    body: Record<string, unknown>
  ): Observable<{ Data: QueryASS13090QueryDataRow[]; TotalCount: number; Status?: string; Message?: string }> => {
    return this.queryForCurrentLayout(body);
  };

  private queryForCurrentLayout(
    body: Record<string, unknown>
  ): Observable<{ Data: QueryASS13090QueryDataRow[]; TotalCount: number; Status?: string; Message?: string }> {
    const req = this.recordToQueryRequest(body);
    const clean = removeEmptyValues(req as Record<string, unknown>);
    const api$: Observable<ApiResponse<unknown>> =
      this.resultLayoutMode === ResultLayoutMode.AmortizationSetting
        ? this.ass13090Service.amorASS13090(clean as AmorASS13090Request)
        : this.ass13090Service.queryASS13090(clean as QueryASS13090Request);

    return api$.pipe(
      map((res): { Data: QueryASS13090QueryDataRow[]; TotalCount: number; Status?: string; Message?: string } => {
        try {
          if (!this.isAss13090ApiSuccess(res?.Status)) {
            return {
              Data: [],
              TotalCount: 0,
              Status: String(res?.Status ?? ''),
              Message: res?.Message,
            };
          }
          const apiRows = this.unwrapApiRowsByLayout(res.Data, this.resultLayoutMode);
          const rows = apiRows.map(row => this.normalizeApiRow(row));
          const totalCount = this.pickAss13090TotalCount(res, res.Data, rows.length);
          return {
            Data: rows,
            TotalCount: totalCount,
            Status: String(res.Status ?? ''),
            Message: res.Message,
          };
        } catch (e) {
          return {
            Data: [],
            TotalCount: 0,
            Status: 'MAP_ERR',
            Message: e instanceof Error ? e.message : String(e),
          };
        }
      }),
      catchError((err: unknown) =>
        of({
          Data: [] as QueryASS13090QueryDataRow[],
          TotalCount: 0,
          Status: 'HTTP_ERR',
          Message: this.queryErrorToMessage(err),
        }),
      ),
    );
  }

  ngOnInit(): void {
    this.initializePage('ASS13090', 'ass/ass13090cru', this.queryForm, frm => this.onSubmit(frm));
    this.loadDropdownOptions();
  }

  onSubmit(frm: FormGroup): void {
    this.submitByLayoutMode(frm, ResultLayoutMode.Query);
  }

  onAmortizationSettingClick(frm: FormGroup): void {
    this.submitByLayoutMode(frm, ResultLayoutMode.AmortizationSetting);
  }

  private submitByLayoutMode(frm: FormGroup, layoutMode: ResultLayoutMode): void {
    this.handleSubmit(
      frm,
      () => {
        if (!this.hasPermission(this.Actions.Query)) {
          this.loading = false;
          this.tableLoading.set(false);
          return;
        }
        frm.patchValue({ pageIndex: 1 });
        const raw = frm.getRawValue();
        const built = this.buildQueryRequest(raw as Record<string, unknown>, {});
        this.lastQueryBody = removeEmptyValues(built as Record<string, unknown>);
        this.resultLayoutMode = layoutMode;
        this.applyResultTableLayout(layoutMode);
        this.selectedRows = [];
        this.queryStateService.setQueryState(this.ProgNo, raw);
        this.tableLoading.set(true);
        this.queryASS13090ForReport(this.lastQueryBody)
          .pipe(
            untilDestroyed(this),
            finalize(() => {
              this.loading = false;
              this.tableLoading.set(false);
            }),
          )
          .subscribe({
            next: res => {
              if (!this.isAss13090ApiSuccess(res.Status)) {
                this.data = [];
                this.totalRecords = 0;
                this.messageService.warnBubble(res.Message || '查詢失敗');
                return;
              }
              this.data = res.Data ?? [];
              this.totalRecords = res.TotalCount ?? this.data.length;

              // 2. 預設查詢的項目全部勾選
              if (layoutMode === ResultLayoutMode.AmortizationSetting) {
                if (this.data.length > 1000) {
                  // 超過 1000 筆不預設勾選，避免出現第二頁的內容沒有勾選到
                  this.selectedRows = [];
                } else {
                  setTimeout(() => {
                    this.selectedRows = [...(this.data as QueryASS13090QueryDataRow[])];
                    console.log('selectedRows length', this.selectedRows.length);
                  }, 0);
                }
              } else {
                this.selectedRows = [];
              }
            },
            error: err => {
              this.data = [];
              this.totalRecords = 0;
              this.messageService.warnBubble(this.queryErrorToMessage(err));
            },
          });
      },
    );
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  /** 條件為「未設定攤提」時：圖示表頭 + 勾選 + 序號連結 + 攤提按鈕 */
  get isUnamortizedResultLayout(): boolean {
    return this.resultLayoutMode === ResultLayoutMode.AmortizationSetting;
  }

  private applyResultTableLayout(layoutMode: ResultLayoutMode = this.resultLayoutMode): void {
    this.columns =
      layoutMode === ResultLayoutMode.AmortizationSetting ? [...ASS13090_COLUMNS_UNAMORTIZED] : [...ASS13090_COLUMNS_CONFIGURED];
  }

  onSelectionChange(rows: QueryASS13090QueryDataRow[]): void {
    this.selectedRows = rows ?? [];
  }

  onBatchAmortize(): void {
    if (!this.selectedRows.length) {
      this.messageService.warnBubble('請先勾選要攤提的資料');
      return;
    }
    const assetIds = this.selectedRows
      .map(row => String(row.ASSET_ID ?? '').trim())
      .filter(id => id.length > 0);
    if (!assetIds.length) {
      this.messageService.warnBubble('勾選資料缺少資產編號，無法攤提');
      return;
    }
    const req: AmortizeASS13090Request = { AssetIds: assetIds };

    this.tableLoading.set(true);
    this.ass13090Service
      .amortizeASS13090(req)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.tableLoading.set(false)),
      )
      .subscribe({
        next: res => {
          if (!this.isAss13090ApiSuccess(res.Status)) {
            this.messageService.warnBubble(res.Message || res.Data?.ResultMsg || '攤提設定失敗');
            return;
          }
          this.selectedRows = [];
          this.messageService.successBubble(res.Data?.ResultMsg || '攤提設定完成');
          this.onAmortizationSettingClick(this.queryForm);
        },
        error: err => this.messageService.warnBubble(this.queryErrorToMessage(err)),
      });
  }

  onExportExcel(): void {
    const req = this.buildExportRequestFromLastQuery();
    if (!req) {
      this.messageService.warnBubble('請先執行查詢');
      return;
    }
    this.fileExportService
      .executeFileExport(
        this.ass13090Service.exportExcelASS13090(req).pipe(untilDestroyed(this)),
        '.xlsx',
        v => (this.exportExcelLoading = v),
      )
      .subscribe();
  }

  onExportPdf(): void {
    const req = this.buildExportRequestFromLastQuery();
    if (!req) {
      this.messageService.warnBubble('請先執行查詢');
      return;
    }
    this.fileExportService
      .executeFileExport(
        this.ass13090Service.exportPDFASS13090(req).pipe(untilDestroyed(this)),
        '.pdf',
        v => (this.exportPdfLoading = v),
      )
      .subscribe();
  }

  override onEdit(data: QueryASS13090QueryDataRow): void {
    if (this.hasPermission(this.Actions.Edit)) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  override onDetail(data: QueryASS13090QueryDataRow): void {
    if (this.hasPermission(this.Actions.Query)) {
      this.navigateWithState(CRUDStatus.Read, data);
    }
  }

  /** 將 table 傳入的 body（分頁／排序）與目前表單合併成 API request */
  private recordToQueryRequest(body: Record<string, unknown>): QueryASS13090Request {
    const raw = this.queryForm.getRawValue() as Record<string, unknown>;
    return this.buildQueryRequest(
      raw,
      body as Partial<QueryASS13090Request> & { pageSize?: number; pageIndex?: number },
    );
  }

  private buildQueryRequest(
    raw: Record<string, unknown>,
    override: Partial<QueryASS13090Request> & { pageSize?: number; pageIndex?: number },
  ): QueryASS13090Request {
    const depreStatus =
      raw['conditionFilter'] === '0' ? 'N' : raw['conditionFilter'] === '1' ? 'Y' : undefined;
    const pageSize = override.PageSize ?? override.pageSize ?? (raw['pageSize'] as number) ?? 30;
    const pageIndex = override.PageIndex ?? override.pageIndex ?? (raw['pageIndex'] as number) ?? 1;
    return {
      STO_NO:
        this.authService.getUserInfo()?.SYS_StoreNo ??
        this.authService.currentUserValue?.SYS_StoreNo ??
        null,
      DEPRE_ID: (raw['amortCode'] as string | null) ?? null,
      GOODS_ID: (raw['itemCode'] as string | null) ?? null,
      ASSET_STATUS: (raw['assetStatus'] as string | null) ?? null,
      DEPRE_YN: (raw['assetType'] as string | null) ?? null,
      SUBPOENA_ID: (raw['purchaseNo'] as string | null) ?? null,
      GET_DATE_S: this.toIsoStart((raw['inputDateFrom'] as Date | null) ?? null),
      GET_DATE_E: this.toIsoEnd((raw['inputDateTo'] as Date | null) ?? null),
      ASSET_COST_S: (raw['inputAmountFrom'] as number | null) ?? null,
      ASSET_COST_E: (raw['inputAmountTo'] as number | null) ?? null,
      DEPRE_STATUS: depreStatus ?? null,
      DEPRE_YM: this.formatDepreYm(raw['amortYearMonth'] as DateOrString),
      STYPE_ID: (raw['accountCode'] as string | null) ?? null,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: override.SortBy ?? undefined,
      OrderBy: override.OrderBy ?? null,
      Offset: override.Offset ?? null,
    };
  }

  private toIsoStart(d: Date | null): string | null {
    if (!d) return null;
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.toISOString();
  }

  private toIsoEnd(d: Date | null): string | null {
    if (!d) return null;
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x.toISOString();
  }

  private formatDepreYm(v: DateOrString): string | null {
    if (v == null || v === '') return null;
    if (typeof v === 'string') {
      const s = v.trim();
      if (/^\d{6}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4)}`;
      if (/^\d{4}-\d{2}$/.test(s)) return s;
      const d = new Date(s);
      return Number.isNaN(d.getTime()) ? null : (this.datePipe.transform(d, 'yyyy-MM') ?? null);
    }
    return this.datePipe.transform(v, 'yyyy-MM') ?? null;
  }

  private fmtDisplayDate(v: string | Date | null | undefined): string {
    if (v == null || v === '') return '';
    const d = v instanceof Date ? v : new Date(v);
    if (Number.isNaN(d.getTime())) return typeof v === 'string' ? v : '';
    return this.datePipe.transform(d, 'yyyy/MM/dd') ?? '';
  }

  /** 後端 Data：陣列或 { QueryData } */
  private unwrapAss13090ApiRows(data: unknown): QueryASS13090QueryDataRow[] {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object' && 'QueryData' in data) {
      const qd = (data as { QueryData?: QueryASS13090QueryDataRow[] | null }).QueryData;
      return Array.isArray(qd) ? qd : [];
    }
    return [];
  }

  /** amorASS13090 回傳資料轉成列表列型別 */
  private unwrapAmorApiRows(data: unknown): QueryASS13090QueryDataRow[] {
    const list = Array.isArray(data)
      ? data
      : data && typeof data === 'object' && 'QueryData' in data
        ? ((data as { QueryData?: AmorASS13090Response[] | null }).QueryData ?? [])
        : [];
    if (!Array.isArray(list)) {
      return [];
    }
    return list.map(row => ({
      ASSET_ID: row.ASSET_ID ?? null,
      DEPRE_ID: row.DEPRE_ID ?? null,
      GOODS_ID: row.GOODS_ID ?? null,
      GET_DATE: row.GET_DATE ?? null,
      BILL_DATE: row.BILL_DATE ?? null,
      SYS_Name: row.SYS_Name ?? null,
      GET_COST: row.GET_COST ?? null,
      DEPRE_STATUS_TEXT: row.DEPRE_STATUS_TEXT ?? null,
      RowNum: row.RowNum ?? null,
    }));
  }

  private unwrapApiRowsByLayout(data: unknown, layoutMode: ResultLayoutMode): QueryASS13090QueryDataRow[] {
    return layoutMode === ResultLayoutMode.AmortizationSetting ? this.unwrapAmorApiRows(data) : this.unwrapAss13090ApiRows(data);
  }

  private pickAss13090TotalCount(res: ApiResponse<unknown>, data: unknown, rowCount: number): number {
    if (typeof res.TotalCount === 'number') {
      return res.TotalCount;
    }
    if (data && typeof data === 'object' && 'TotalCount' in data) {
      const t = (data as { TotalCount?: number }).TotalCount;
      if (typeof t === 'number') {
        return t;
      }
    }
    return rowCount;
  }

  /** 後端 Status 多為 '0000'（trim 避免空白） */
  private isAss13090ApiSuccess(status: unknown): boolean {
    return String(status ?? '').trim() === '0000';
  }

  private queryErrorToMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (body && typeof body === 'object' && 'Message' in body) {
        return String((body as { Message?: unknown }).Message ?? err.message);
      }
      if (typeof body === 'string' && body.length) {
        return body;
      }
      return err.message || `HTTP ${err.status}`;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return '查詢失敗，請稍後再試';
  }

  private normalizeApiRow(r: QueryASS13090QueryDataRow): QueryASS13090QueryDataRow {
    return {
      ...r,
      GET_DATE: this.fmtDisplayDate(r.GET_DATE ?? undefined),
      BILL_DATE: this.fmtDisplayDate(r.BILL_DATE ?? undefined),
    };
  }

  private buildExportRequestFromLastQuery(): PrintASS13090Request | null {
    if (!this.lastQueryBody) {
      return null;
    }
    const q = this.lastQueryBody;
    const sortBy = Array.isArray(q['SortBy']) ? (q['SortBy'] as Record<string, unknown>[]) : [];
    const firstSort = sortBy[0] ?? null;
    const sortField = firstSort?.['field'] != null ? String(firstSort['field']) : null;
    const sortOrderRaw = firstSort?.['order'];
    const sortOrder = typeof sortOrderRaw === 'number' ? sortOrderRaw : null;
    return removeEmptyValues({
      STO_NO: (q['STO_NO'] as string | null) ?? null,
      DEPRE_ID: (q['DEPRE_ID'] as string | null) ?? null,
      GOODS_ID: (q['GOODS_ID'] as string | null) ?? null,
      ASSET_STATUS: (q['ASSET_STATUS'] as string | null) ?? null,
      DEPRE_YN: (q['DEPRE_YN'] as string | null) ?? null,
      STYPE_ID: (q['STYPE_ID'] as string | null) ?? null,
      SUBPOENA_ID: (q['SUBPOENA_ID'] as string | null) ?? null,
      GET_DATE_S: (q['GET_DATE_S'] as string | null) ?? null,
      GET_DATE_E: (q['GET_DATE_E'] as string | null) ?? null,
      ASSET_COST_S: (q['ASSET_COST_S'] as number | null) ?? null,
      ASSET_COST_E: (q['ASSET_COST_E'] as number | null) ?? null,
      DEPRE_STATUS: (q['DEPRE_STATUS'] as string | null) ?? null,
      DEPRE_YM: (q['DEPRE_YM'] as string | null) ?? null,
      SortField: sortField,
      SortOrder: sortOrder,
    }) as PrintASS13090Request;
  }

  private loadDropdownOptions(): void {
    this.dropdownApiService
      .queryFasItemDropdown({})
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.itemCodeOptions = opts ?? []));

    this.dropdownApiService
      .querySys1000({ SYS_Type: 'ASSET_STATUS' })
      .pipe(untilDestroyed(this))
      .subscribe(list => {
        this.assetStatusOptions = (list ?? []).map(x => ({
          value: x.No,
          label: x.Name,
        }));
      });

    this.dropdownApiService
      .querySys1000({ SYS_Type: 'ASSET_TYPE' })
      .pipe(untilDestroyed(this))
      .subscribe(list => {
        this.assetTypeOptions = (list ?? []).map(x => ({
          value: x.No,
          label: `${x.No} - ${x.Name}`,
        }));
      });

    // 目前無 queryFASAccNoDropDownList，先用 GLS1005 科目下拉
    this.dropdownApiService
      .queryGls1005()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.accountCodeOptions = opts ?? []));

    // 採購單號(SUBPOENA_ID)下拉：用 ASS15070 進貨單號 API（回傳 SUBPOENA_ID），
    // 與後端 queryASS13090 篩選欄位 SUBPOENA_ID 對齊；
    // 原 queryFAASSCHKM_DropDownList 回傳的是 SUBCHECK_ID（驗收單號，如 20241017001-01），
    // 不是採購單號（SUBPOENA_ID，如 20241017001），會造成選了之後查不到資料。
    this.dropdownApiService
      .queryFAASSCHKMASS15070_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.purchaseNoOptions = opts ?? []));
  }
}
