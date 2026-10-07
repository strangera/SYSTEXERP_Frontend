/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, NgZone, OnChanges, OnDestroy, Output, PLATFORM_ID, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableColumnReorderEvent, TableModule, TableSelectAllChangeEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, map, Observable, Subscription } from 'rxjs';
import { ReportSignatureComponent } from '../../biz-components/report-signature/report-signature.component';
import { ExportContext } from '../../exports/report-export.service';
import { QueryStateService } from '../../service/query-state.service';
import { TableReportCaptionComponent } from './components/table-report-caption/table-report-caption.component';
import { TableExpansionComponent } from './components/table-report-expansion/table-report-expansion.component';
import { TableReportDataFlowService } from './services/table-report-data-flow.service';
import { TableReportDragDropService } from './services/table-report-drag-drop.service';
import { TableReportPermissionService } from './services/table-report-permission.service'; // 新增
import { TableReportSelectionService } from './services/table-report-selection.service';
import { TableReportSubtotalService } from './services/table-report-subtotal.service';
import { TableReportUtilityService } from './services/table-report-utility.service';
import { ColumnWidthInfo, TableReportWidthService } from './services/table-report-width.service';
import { AddButton, ColumnGroup, ReportColumn, TableQueryPayload } from './table-report.model';

@UntilDestroy()
@Component({
  selector: 'app-table-report',
  host: { 'table-report-id': '複製時請自行取唯一名', '[class.fixed-height]': '!autoHeight' },
  standalone: true,
  imports: [ReportSignatureComponent, TableExpansionComponent, SkeletonModule, TableModule, CommonModule, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableReportCaptionComponent],
  templateUrl: './table-report.component.html',
  styleUrls: ['./table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TableReportWidthService,
    TableReportSelectionService,
    TableReportDragDropService,
    TableReportSubtotalService,
    TableReportPermissionService,
    TableReportDataFlowService,
  ]
})
export class TableReportComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('dt') public readonly dt!: Table;

  public readonly tableUtility = inject(TableReportUtilityService);
  public readonly widthService = inject(TableReportWidthService);
  public readonly selectionService = inject(TableReportSelectionService);
  public readonly dragDropService = inject(TableReportDragDropService);
  public readonly subtotalService = inject(TableReportSubtotalService);
  public readonly permissionService = inject(TableReportPermissionService);
  public readonly dataFlowService = inject(TableReportDataFlowService);
  public readonly sanitizer = inject(DomSanitizer);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly queryState = inject(QueryStateService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);

  /** 是否啟用虛擬捲動；改用欄位而非 template 內直接算 data.length>=30，讓 refreshVirtualScroll() 能真正關/開它 */
  virtualScrollEnabled = false;
  private intersectionObserver?: IntersectionObserver;
  private hasSelfHealedVirtualScroll = false;

  // Inputs & Outputs 宣告
  @Input() exportContext?: ExportContext;
  @Input() pageOrientation: string | null = 'Landscape';
  @Input() pageSizeSetting: string | null = 'A4';
  @Input() lastQueryBody?: any;
  @Input({ required: true }) totalRecords = 0;
  @Input({ required: true }) data: any[] = [];
  @Input({ required: true }) columns: ReportColumn[] = [];
  @Input() queryFunction?: (body: any) => Observable<any>;

  virtualData: any = [];
  @Input() ItemSize = 46;
  @Input() numToleratedItems?: number;
  get computedNumToleratedItems(): number {
    return this.numToleratedItems ?? Math.ceil(700 / this.ItemSize) * 2;
  }
  @Input() lazy = true;
  /** 有效 lazy 值：未接 queryFunction 時，無論 lazy 是否為預設 true，都視為前端排序/分頁模式 */
  public get effectiveLazy(): boolean {
    return this.lazy && !!this.queryFunction;
  }
  @Input() dataKey: string | undefined;
  selectedColumns: ReportColumn[] = [];

  public readonly currentProgNo = toSignal(
    this.route.data.pipe(map(d => (d['progNo'] as string) ?? null)),
    { initialValue: (this.route.snapshot.data['progNo'] as string) ?? null }
  );

  private readonly _tableKeyFromRoute = toSignal(
    this.route.url.pipe(map(urlSegments => urlSegments.at(-1)?.path ?? '')),
    { initialValue: this.route.snapshot.url.at(-1)!.path }
  );

  private _explicitTableKey?: string;
  @Input() set tableKey(val: string) {
    this._explicitTableKey = val;
  }
  get tableKey(): string {
    return this._explicitTableKey ?? this._tableKeyFromRoute() ?? '';
  }
  @Input() loading = false;
  public _loading = false;
  @Input() showReorder = true;
  @Input() showCheckBox = false;
  @Input() tableHeaderCheckboxLabel?: string;
  @Input() set selectedItems(val: any[]) {
    // 如果內部服務的已選取筆數跟外部傳入的一模一樣，代表是自己人觸發的更新，直接擋掉，不重複往下算！
    if (this.selectionService.selectedItems && val && this.selectionService.selectedItems.length === val.length) {
      return;
    }
    this.selectionService.syncSelectedItems(val || [], this.data, this.isRowSelectable);
  }
  get selectedItems(): any[] { return this.selectionService.selectedItems; }
  @Output() get selectionChange() { return this.selectionService.selectionChange; }
  @Output() get selectAllChange() { return this.selectionService.selectAllChange; }
  @Output() itemClick = new EventEmitter<any>();
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true;

  rowSelectableWrapper = ({ data }: { data: any, index: number; }): boolean =>
    !this.nonSelectableKeys.has(this.dataKey ? data[this.dataKey] : data);

  @Input() set isAllSelected(val: boolean) { this.selectionService.isAllSelected = val; }
  get isAllSelected(): boolean { return this.selectionService.isAllSelected; }

  @Output() dataChange = new EventEmitter<any[]>();
  @Input() customTemplates: Record<string, TemplateRef<any>> = {};
  @Input() showCaption = true;
  @Input() showSort = true;

  public get multiSortMeta() { return this.dt?.multiSortMeta || []; }
  private isSyncingSort = false;
  @Input() allowMultilineHeader = false;
  @Input() showFilter = true;
  @Input() showReportMode = true;
  @Input() showSignature = false;
  @Input() customReport = false;
  @Output() exportEvent = new EventEmitter<string>();
  @Output() delete = new EventEmitter<any>();
  @Input() showDelete = true;
  @Input() deleteDisabled: (rowData: any) => boolean | undefined = () => false;
  @Input() showInsert = false;
  @Output() insert = new EventEmitter<void>();
  @Input() showExcel = false;
  @Input() showExcelExport = true;
  @Input() showExcelImport = true;
  @Input() showCustomExcelImport = false;
  @Output() exportExcel = new EventEmitter<any>();
  @Input() exportExcelLoading = false;
  @Output() importExcel = new EventEmitter<FileSelectEvent>();
  @Input() columnGroup?: ColumnGroup[];
  /** 選用的第三層表頭分組（在 columnGroup 之上再多一層），對應 ReportColumn.topGroupField；不傳時表頭層次與現況完全一致 */
  @Input() topColumnGroup?: ColumnGroup[];
  @Input() showManage = true;
  @Input() showDetail = true;
  @Output() detail = new EventEmitter<any>();
  @Input() showEdit = true;
  @Input() editTooltip: string | ((rowData: any) => string) = '編輯';
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;
  @Input() detailDisabled: (rowData: any) => boolean | undefined = () => false;
  @Output() edit = new EventEmitter<any>();
  @Input() addButton: AddButton[] = [];
  @Input() buttonsLoading = false;
  @Input() footerData: any;
  @Input() footerPercentData: any;
  @Input() extraFooterData: any;
  @Input() footerSpanConfig?: { field: string; colSpan: number }[];
  @Input() groupRowsBy?: string;
  @Input() subTotalLabel = '小計';
  @Input() showSubTotalGroupValue = true;

  // 代理小計快取
  get groupTotals() { return this.subtotalService.groupTotals; }
  set groupTotals(val) { this.subtotalService.groupTotals = val; }

  @Input() subTotalData: any;
  @Output() selectButton = new EventEmitter<any>();
  @Input() showSummary = true;
  @Input() footerLabel = '總計';
  @Input() footerLabelField?: string;
  @Input() autoHeight = false;
  @Input() showFooterTotal = true;
  @Input() allowFooterHtml = false;
  @Input() expansionColumns: ReportColumn[] = [];
  @Input() expansionDataKey = 'details';
  @Input() expansionMultiSortMeta = [{ field: this.expansionDataKey, order: 1 }];
  @Input() expansionLoadFn?: (rowData: any) => Observable<any>;
  @Input() expansionShowSort = true;
  @Input() expansionShowReorder = true;
  expandedRows: Record<string, boolean> = {};
  private isNextPagePreloaded = false;
  /** 依全部已載入資料估算的欄寬（key = field）；不在表內的欄位沿用 col.width / 預設值 */
  columnWidths: Record<string, ColumnWidthInfo> = {};
  private loadMoreSub?: Subscription;
  @Output() linkClick = new EventEmitter<{ rowData: any, field: string }>();
  @Input() emptyMessage = '查無資料';

  public hasSearched = false;

  // 資料載入後預算，rowSelectableWrapper / template 查詢全部 O(1)
  readonly nonSelectableKeys = new Set<any>();
  _hasSubtotalColumns = false;

  private _buildSelectableCache(): void {
    this.nonSelectableKeys.clear();
    this.data.forEach(row => {
      if (!(this.isRowSelectable(row) ?? true)) {
        this.nonSelectableKeys.add(this.dataKey ? row[this.dataKey] : row);
      }
    });
    this.selectionService.cacheSelectableCount(this.data, this.isRowSelectable);
    this._hasSubtotalColumns = this.columns.some(col => col.isSubTotal && !!this.groupRowsBy);
  }

  constructor() {
    this.permissionService.initPermission(this.tableKey, (newKey) => {
      if (!this._explicitTableKey) {
        this.tableKey = newKey;
      }
    });
    this.onScroll = this.onScroll.bind(this);
  }

  // 權限傳聲筒
  hasPermission(action: string): boolean {
    return this.permissionService.hasPermission(action);
  }

  get footerRows(): any[] {
    if (this.footerData == null) return [];
    return Array.isArray(this.footerData) ? this.footerData : [this.footerData];
  }

  public get serialColumnWidth(): string {
    return this.widthService.serialColumnWidth;
  }

  /** 資料列欄寬（th/td 共用）：有估算結果用估算值，否則維持 col.width / 預設最小寬度 */
  getColWidth(col: ReportColumn): string | undefined {
    return this.columnWidths[col.field]?.px ?? col.width;
  }

  getColMinWidth(col: ReportColumn): string {
    return this.columnWidths[col.field]?.px ?? (col.width || '55px');
  }

  /** 只有內容超過上限被截斷的欄位才設 max-width（配合 CSS 省略號） */
  getColMaxWidth(col: ReportColumn): string | null {
    const info = this.columnWidths[col.field];
    return info?.truncated ? info.px : null;
  }

  /** 只有被截斷的欄位才回傳完整文字當原生 title，其餘回 null（不輸出 title 屬性） */
  getCellTitle(col: ReportColumn, rowData: any, rowIndex: number): string | null {
    if (!this.columnWidths[col.field]?.truncated) return null;
    const text = String(this.tableUtility.getFormattedValue(col, rowData?.[col.field], rowIndex, rowData) ?? '');
    return col.type === 'html' ? this.widthService.stripHtml(text) : text;
  }

  private recalculateColumnWidths(): void {
    const templateFields = new Set(Object.keys(this.customTemplates ?? {}).filter(k => !!this.customTemplates[k]));
    this.columnWidths = this.widthService.calculateColumnWidths(
      this.columns, this.data, this.totalRecords, this.showReorder, templateFields
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['columns'] || changes['totalRecords'] || changes['customTemplates'] || changes['showReorder']) {
      this.recalculateColumnWidths();
    }
    if (changes['data'] || changes['totalRecords']) {
      this.handleDataChange(changes);
    }
  }

  /**
   * PrimeNG p-table 虛擬捲動的 Scroller 只在第一次掛載時量測容器尺寸一次；若表格是在 app-dialog 這類「先建立、動畫結束才真正可視」
   * 的容器裡首次渲染，量到的尺寸常常不準，導致畫面完全沒有 <tr>，且不會自己恢復，只有使用者剛好觸發某次全域變更偵測(如拉視窗、點別處)
   * 讓 PrimeNG 內部重試邏輯剛好撞上瀏覽器已定案的版面時才會「巧合」補上。這裡改用 IntersectionObserver 偵測「真的變成可視」的那一刻，
   * 強制把虛擬捲動關掉再開啟一次，讓 PrimeNG 整個 Scroller 重新建立、重新量測，不必依賴上述時序巧合。
   */
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || typeof IntersectionObserver === 'undefined') return;
    this.ngZone.runOutsideAngular(() => {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        if (this.hasSelfHealedVirtualScroll || !entries[0]?.isIntersecting) return;
        this.hasSelfHealedVirtualScroll = true;
        this.intersectionObserver?.disconnect();
        if (this.virtualScrollEnabled) {
          this.ngZone.run(() => this.refreshVirtualScroll());
        }
      });
      this.intersectionObserver.observe(this.host.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  /** 強制重建虛擬捲動的 Scroller，讓它用當下容器的真實尺寸重新量測、補渲染資料列 */
  public refreshVirtualScroll(): void {
    if (!this.virtualScrollEnabled) return;
    this.virtualScrollEnabled = false;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.virtualScrollEnabled = this.data.length >= 30;
      this.cdr.detectChanges();
    });
  }

  /**
   * 核心視圖資料配給大腦
   */
  private handleDataChange(changes: SimpleChanges) {
    if (this.lastQueryBody) {
      this.hasSearched = true;
    }

    this.virtualScrollEnabled = this.data.length >= 30;

    if (changes['data']) {
      this.selectionService.reset();
      this.virtualData = [];
      this.subtotalService.clearGroupTotals();
      this._buildSelectableCache();
      // defer O(n×m) subtotal calc — runs after first paint
      setTimeout(() => {
        this.subtotalService.updateGroupTotals(this.data, this.columns, this.groupRowsBy);
        this.cdr.detectChanges();
      }, 0);
      this.isNextPagePreloaded = false;
    }

    if (this.data && this.data.length !== 0) {
      if (this.dt) {
        setTimeout(() => this.syncTableSortMeta());
        this.dt.scrollHeight = this.autoHeight ? (undefined as any) : '700px';
      }

      this.virtualData = this.data;
      this.cdr.detectChanges();
    }
  }
  // --- 轉發各分類服務事件門 ---

  getGroupSubtotal(rowData: any, col: ReportColumn): any {
    return this.subtotalService.getGroupSubtotal(rowData, col, this.columns, this.groupRowsBy, this.subTotalData);
  }

  updateGroupTotals(newData: any[]): void {
    this.subtotalService.updateGroupTotals(newData, this.columns, this.groupRowsBy);
  }

  onSelectionChange(event: any[]) {
    this.selectionService.handleSelectionChange(event, this.data, this.isRowSelectable);
  }

  onSelectAllChange(event: TableSelectAllChangeEvent) {
    this.selectionService.handleSelectAllChange(event, this.data, this.isRowSelectable);
  }

  onLazyLoad() {
    this.selectionService.handleLazyLoadSelection(this.data, this.isRowSelectable);
  }

  public onCustomDragStart(event: DragEvent, col: ReportColumn, index: number) {
    this.dragDropService.handleDragStart(event, col, index);
  }

  public onCustomDragOver(event: DragEvent, targetCol: ReportColumn) {
    this.dragDropService.handleDragOver(event, targetCol);
  }

  public onCustomDrop(event: DragEvent, targetCol: ReportColumn, targetIndex: number) {
    this.columns = this.dragDropService.handleDrop(
      event, targetCol, targetIndex, this.columns, this.tableKey, this.queryState
    );
    this.cdr.detectChanges();
  }

  // --- 後端 API 分頁、排序加載核心邏輯 ---

  loadMoreData() {
    if (this._loading || !this.queryFunction || !this.lastQueryBody) return;
    this.lastQueryBody = this.dataFlowService.normalizeQueryBody(this.lastQueryBody);
    const { pageSize } = this.lastQueryBody;
    const currentSort = this.dt?.multiSortMeta;
    if (currentSort) this.lastQueryBody.SortBy = currentSort;

    const nextPageIndex = Math.floor(this.data.length / pageSize) + 1;
    const body = {
      ...this.lastQueryBody,
      pageIndex: nextPageIndex,
      pageSize,
      // 呼叫端可能只認大寫欄位（見 ASS13070 等頁面的 queryFunction），兩種大小寫都要同步更新，否則會一直打回第一頁
      PageIndex: nextPageIndex,
      PageSize: pageSize,
      SortBy: currentSort && currentSort.length > 0 ? currentSort : (this.lastQueryBody.SortBy || undefined)
    };
    this._loading = true;
    this.loadMoreSub = this.queryFunction(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this._loading = false;
          this.isNextPagePreloaded = false;
          this.cdr.detectChanges(); // 消除 skeleton、清除 loading 狀態（取消時也會觸發）
        })
      )
      .subscribe(res => {
        if (res?.Data && res.Data.length > 0) {
          this.data = [...this.data, ...res.Data];
          this._buildSelectableCache();
          this.subtotalService.updateGroupTotals(res.Data, this.columns, this.groupRowsBy);
          this.virtualData = this.data;
          this.totalRecords = res.TotalCount || this.data.length;
          this.dataChange.emit(this.data);
        }
      });
  }

  onSort(event: any) {
    if (!this.effectiveLazy) {
      this.subtotalService.clearGroupTotals();
      this.subtotalService.updateGroupTotals(this.data, this.columns, this.groupRowsBy);
      this.cdr.detectChanges();
      return;
    }
    // 排序優先：若 loadMore 正在進行，立即取消（finalize 會自動 reset _loading / isNextPagePreloaded）
    if (this._loading) {
      this.loadMoreSub?.unsubscribe();
    }
    if (this.isSyncingSort) return;

    // 精準對接 PrimeNG 的全小寫大坑
    const incomingSorts: any[] = event.multisortmeta || [];

    if (this.groupRowsBy) {
      // 1. 動態偵測或繼承小計欄位的排序方向 (order)
      // 先看這次傳進來的事件有沒有包含小計欄位的排序
      const incomingGroupSort = incomingSorts.find(s => s.field === this.groupRowsBy);
      // 再看上一次表格留存的狀態有沒有小計欄位的排序
      const lastGroupSort = this.dt.multiSortMeta?.find(s => s.field === this.groupRowsBy);

      // 優先級：這次事件的方向 -> 上一次的方向 -> 預設升序 (1)
      const currentGroupOrder = incomingGroupSort ? incomingGroupSort.order : (lastGroupSort ? lastGroupSort.order : 1);

      const groupSortMeta = { field: this.groupRowsBy, order: currentGroupOrder };

      // 2. 清洗其餘欄位的排序條件：排除掉重複的小計欄位
      const cleanUserSorts = incomingSorts.filter(s => s.field !== this.groupRowsBy);

      // 3. 完美組裝：[ 動態小計分組固定第一, ...其餘無限個使用者多重排序 ]
      this.dt.multiSortMeta = [groupSortMeta, ...cleanUserSorts];

      // 4. 灌回 PrimeNG 控制核心，讓畫面的箭頭方向跟資料狀態完全對齊
      this.dt.tableService.onSort(this.dt.multiSortMeta);
    } else {
      // 常規無小積分組時：直接信任 PrimeNG 的多欄位排序陣列
      this.dt.multiSortMeta = [...incomingSorts];
    }

    // --- 以下後端 API 調配與視圖配給完全不變，100% 穩定對接 ---
    this.lastQueryBody = this.dataFlowService.normalizeQueryBody(this.lastQueryBody);
    const { pageSize } = this.lastQueryBody;
    if (!this.queryFunction || !this.lastQueryBody || !this.showSort) return;

    this.lastQueryBody = { ...this.lastQueryBody, pageIndex: 1, pageSize, PageIndex: 1, PageSize: pageSize, SortBy: this.dt.multiSortMeta };
    const body = { ...this.lastQueryBody, pageIndex: 1, pageSize, PageIndex: 1, PageSize: pageSize, SortBy: this.dt.multiSortMeta ?? undefined };
    this.loading = true;
    this.isNextPagePreloaded = true; // 排序期間防止 scroll 觸發 loadMore
    this.cdr.detectChanges(); // 立即顯示 loading overlay

    this.queryFunction(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
          this.isNextPagePreloaded = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(res => {
        this.hasSearched = true;
        if (res?.Data && res.Data.length > 0) {
          this.subtotalService.clearGroupTotals();
          this.subtotalService.updateGroupTotals(res.Data, this.columns, this.groupRowsBy);
          this.data = res.Data;
          this._buildSelectableCache();
          this.totalRecords = res.TotalCount || this.data.length;
          this.virtualScrollEnabled = this.effectiveLazy && this.data.length >= 30;
          this.virtualData = this.data;
          this.selectedItems = [];
          this.dataChange.emit(this.data);
          this.syncTableSortMeta();
          this.cdr.detectChanges();
        }
      });
  }

  customSort(event: TableQueryPayload) {
    if (!event.multiSortMeta || this.isSyncingSort) return;
    this.data = this.dataFlowService.executeClientSort(event, this.data);
    if (this.selectedItems && this.selectedItems.length > 0) this.selectedItems = [...this.selectedItems];
    this.subtotalService.clearGroupTotals();
    this.subtotalService.updateGroupTotals(this.data, this.columns, this.groupRowsBy);
    this.cdr.detectChanges();
    setTimeout(() => {
      if (!this.dt) return;
      this.isSyncingSort = true;
      this.virtualData = [...this.data];
      this.dt.restoreState();
      this.cdr.detectChanges();
      this.isSyncingSort = false;
    }, 0);
  }

  onScroll(event: any) {
    if (this._loading || !this.effectiveLazy) return;
    const target = event.originalEvent?.target;
    if (!target) return;
    const pageSize = this.dataFlowService.normalizeQueryBody(this.lastQueryBody)?.pageSize ?? 30;
    if (this.data.length >= pageSize && this.data.length < this.totalRecords) {
      if (!this.isNextPagePreloaded && target.scrollTop > 50) {
        this.isNextPagePreloaded = true;
        this.loadMoreData();
      }
    } else if (this.selectedItems && this.selectedItems.length > 0) {
      this.selectedItems = [...this.selectedItems];
      this.cdr.detectChanges();
    }
  }

  trackByFn(index: number, item: any) {
    return (this.dataKey && item?.[this.dataKey]) || index;
  }

  getGroupHeader(groupField: string): string {
    return this.columnGroup?.find(g => g.field === groupField)?.header ?? groupField;
  }

  getTopGroupHeader(topGroupField: string): string {
    return this.topColumnGroup?.find(g => g.field === topGroupField)?.header ?? topGroupField;
  }

  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as ReportColumn[];
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }

  isGroupLastRow(rowData: any, rowIndex: number): boolean {
    if (!this.groupRowsBy || !this.data || rowIndex === this.data.length - 1) return true;
    return this.tableUtility.isGroupLastRow(rowData, rowIndex, this.groupRowsBy, this.data);
  }

  private syncTableSortMeta() {
    if (!this.dt || !this.lastQueryBody?.SortBy) return;
    this.isSyncingSort = true;
    const sortBy = this.lastQueryBody.SortBy;
    const meta = Array.isArray(sortBy) ? [...sortBy] : [sortBy];
    this.dt.multiSortMeta = meta.map(m => ({ field: m.field || m.Field, order: m.order || m.Order }));
    setTimeout(() => {
      try {
        this.dt.tableService.onSort(this.dt.multiSortMeta || []);
        this.cdr.detectChanges();
      } finally {
        // 這裡萬一丟例外沒接住，isSyncingSort 會永久卡 true，導致後續所有排序點擊都被 onSort() 開頭的 guard 擋掉
        this.isSyncingSort = false;
      }
    }, 0);
  }
  getBtnLabel(btn: any, rowData: any): string {
    return typeof btn.label === 'function' ? btn.label(rowData) : btn.label;
  }

  getEditTooltip(rowData: any): string {
    return typeof this.editTooltip === 'function' ? this.editTooltip(rowData) : this.editTooltip;
  }
}
