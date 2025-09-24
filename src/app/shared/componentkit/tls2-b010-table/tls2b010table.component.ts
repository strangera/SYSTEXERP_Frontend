/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component, EventEmitter, Input, SimpleChanges, OnChanges, Output,
  ViewChild, OnDestroy, OnInit, inject,
} from '@angular/core';
import {
  Table, TableLazyLoadEvent, TablePageEvent, TableRowSelectEvent,
  TableRowUnSelectEvent, TableModule,
} from 'primeng/table';
import { SortMeta } from 'primeng/api';
import {
  AddButton, Column, ColumnGroup, FieldChangeEvent, LazyLoadEvent,
  RowEditSaveEvent, toggleButtons, validateRowData,
} from './tls2b010table.model';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { NotificationService } from '../../component/notification-message/notification.service';
import { QueryStateService } from '../../service/query-state.service';
import { BasicPrintData2Component } from '../../componentextends/basic-print/basic-print-data2.component';
import { CurrentPageService } from '../../../layout/app.menulist/current-page.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { SkeletonModule } from 'primeng/skeleton';
import { tls2b010tableExpansionComponent } from './tls2b010table-expansion/tls2b010table-expansion.component';
import { TableExport2Component } from './tls2b010table-export/tls2b010table-export.component';
import { BlockUIModule } from 'primeng/blockui';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { tls2b010tableService } from './tls2b010table.service';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ImageModule } from 'primeng/image';
import { tls2b010tableUtilityService } from './tls2b010table-utility.service';

@Component({
  selector: 'app-tls2b010table',
  templateUrl: './tls2b010table.component.html',
  styleUrls: ['./tls2b010table.component.scss'],
  animations: [toggleButtons],
  standalone: true,
  imports: [
    NgIf, NgClass, NgFor,
    // PrimeNG
    DividerModule, TableModule, MultiSelectModule, TooltipModule, ButtonModule,
    FileUploadModule, DropdownModule, RippleModule, InputTextModule, InputNumberModule,
    CalendarModule, CheckboxModule, SkeletonModule, BlockUIModule,
    // 自家元件
    TableExport2Component,
    // Angular
    FormsModule, ImageModule,
  ],
})
export class tls2b010tableComponent
  extends BasicPrintData2Component
  implements OnInit, OnChanges, OnDestroy {
    trackByCol = (index: number, col: any) => col.key ?? col.__uid ?? col.field ?? index;


  /* ====== 基本與依賴 ====== */
  @ViewChild('dt', { static: false }) dt!: Table;
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  private ngUnsubscribe = new Subject<void>();
  public funInfo: FunsrightInfo | undefined;

  constructor(
    private readonly queryStateService: QueryStateService,
    private readonly currentPageService: CurrentPageService,
    private readonly tls2b010tableUtilityService: tls2b010tableUtilityService,
    private readonly sanitizer: DomSanitizer,
    private readonly messageService: NotificationService,
  ) { super(); }

  /* ======================= Inputs/Outputs ======================= */
  // 基本
  @Input() dataKey = 'ID';
  @Input() tableKey?: string;
  @Input() apiUrl?: string;
  @Input() title?: string;

  // 欄位 / 資料
  @Input() columns!: Column[];
  originalColumns!: Column[];
  selectedColumns!: Column[];
  @Input() data: any[] = [];
  @Output() dataChange = new EventEmitter<any[]>();
  @Input() loading = false;
  @Input() disabled = false;

  // 欄位群組 / 小計 / 總計
  @Input() columnGroup?: ColumnGroup[];
  /** 支援 string 或 string[]；實際給 p-table 用 getter 轉陣列 */
  @Input() groupRowsBy: string | string[] = '';
  groupedDataCache = new Map();
  @Input() showSubTotal = false;
  @Input() showTotal = false;

  // 選取與勾選
  @Input() showCheckBox = false;
  @Input() selectionMode: 'multiple' | 'single' | null | undefined = 'multiple';
  @Input() selectedItems: any = [];
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true;
  @Output() selectionChange = new EventEmitter<any>();
  @Output() selectedItemsChange = new EventEmitter<any>();
  @Output() select = new EventEmitter<TableRowSelectEvent>();
  @Output() unSelect = new EventEmitter<TableRowUnSelectEvent>();
  @Output() itemClick = new EventEmitter<any>();

  // 排序
  @Input() showSort = true;
  @Input() multiSortMeta: SortMeta[] = [{ field: this.dataKey, order: 1 }];

  // 行編輯
  @Input() rowEditing = false;
  clonedProducts: Record<string, any> = {};
  @Output() rowEditInit = new EventEmitter<any>();
  @Output() rowEditSave = new EventEmitter<RowEditSaveEvent>();
  @Output() rowEditCancel = new EventEmitter<any>();
  @Input() rowEditDisabled: (rowData: any) => boolean | undefined = () => false;
  @Input() alwaysEdit = false;
  @Input() alwaysBlurValidate = false;

  // Header 顯示
  @Input() showCaption = true;
  @Input() showHeader = true;
  @Input() showReportMode = true;
  @Input() showFilter = true;

  // Insert / Delete
  @Input() showInsert = false;
  @Input() insertRowData = false;
  @Input() defaultInsertData: any = {};
  @Output() insert = new EventEmitter<any>();
  @Input() insertDisabled = false;
  @Input() deleteData = false;
  @Output() delete = new EventEmitter<any>();
  @Input() showDelete = true;
  @Input() deleteIcon = 'pi pi-trash';
  @Input() deletepTooltip = '刪除';

  // 自訂報表
  @Input() customReport = false;
  @Output() exportEvent = new EventEmitter<string>();

  // Expansion
  @Input() expansionColumns: Column[] = [];
  @Input() expansionDataKey = '';
  @Input() expansionSortField = '';
  @Input() expansionSortOrder = 0;
  @Input() showExpandCollapse = true;
  @Input() expansionMultiSortMeta = [{ field: this.expansionDataKey, order: 1 }];
  @Input() expansionShowPaginator = false;
  @Input() expansionRows = 20;
  @Input() expansionRowsPerPageOptions = [20, 40, 60, 80, 100];
  @Input() expansionScrollHeight = '300px';
  @Input() expansionLoadFn?: (rowData: any) => Observable<any>;
  expandedRows: Record<string, boolean> = {};
  expression = false;

  // Excel
  @Input() showExcel = false;
  @Input() showExcelExport = true;
  @Input() showExcelImport = true;
  @Output() exportExcel = new EventEmitter<any>();
  @Input() exportExcelLoading = false;
  @Output() importExcel = new EventEmitter<FileSelectEvent>();
  @Input() showPage = true;
  @Input() showCustomExcelImport = false;

  // 管理欄
  @Input() showManage = true;
  @Input() showDetail = true;
  @Output() detail = new EventEmitter<any>();
  @Input() showEdit = true;
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;
  @Output() edit = new EventEmitter<any>();
  @Input() addButton: AddButton[] = [];
  @Input() buttonsLoading = false;
  @Input() showRowEdit = false;

  // 欄位事件
  @Output() fieldChange = new EventEmitter<FieldChangeEvent>();
  @Output() selectButton = new EventEmitter<any>();
  @Output() filterChange = new EventEmitter<{ rowData: any; value: string }>();

  // Footer / 其他
  @Input() showFooter = false;
  @Input() emptyMessage = '查無資料';

  // 分頁
  @Input() scrollHeight = '450px';
  @Input() scrollable = true;
  @Input() showPaginator = true;
  @Input() totalRecords = 0;
  @Input() rowsPerPageOptions: any[] | undefined = [20, 40, 60, 80, 100];
  totalPages = 0;
  @Input() rows = 20;
  first = 0;
  pages: { label: string; value: number }[] = [];
  selectedPage: number | null = 1;
  @Input() lazy = false;

  /** 父層不用再寫 onLazyLoadData；若提供此函式，tls2b010table 會自己打 API 並把資料落地 */
  @Input() serverFetch?: (payload: LazyLoadEvent) => Observable<{
    rows: any[];
    totalRecords: number;
    externalTotals?: Record<string, number>;
    externalSubtotals?: Record<string, Record<string, number>>;
  }>;
  @Output() serverError = new EventEmitter<any>();

  /** 若未提供 serverFetch，仍可沿用舊的 (lazyLoadData) 事件 */
  @Output() lazyLoadData = new EventEmitter<LazyLoadEvent>();

  // 資料狀態欄位
  @Input() dataStatusField?: string;
  @Input() dataStatusValue = {
    Original: 'original',
    New: 'new',
    Modified: 'modified',
    Deleted: 'deleted',
  };

  // 父層注入的總計 / 小計
  @Input() externalTotals?: Record<string, number>;
  @Input() externalTotalFieldMap?: Record<string, string>;
  @Input() externalSubtotals?: Record<string | number, Record<string, number>>;
  @Input() externalSubtotalFieldMap?: Record<string, string>;

  /* ===== 內部旗標（穩定機制） ===== */
  private _skipFirstLazy = true;      // PrimeNG 初始 onLazyLoad
  private _skipFirstCalc = true;      // 初算頁資訊
  private _suppressNextLazy = false;  // 程式性改 first/rows 的 echo
  private lastEmitKey: string | null = null; // 去重鍵：pageIndex|pageSize|sortJson
  private lastSortSig = '';                  // 排序簽章（偵測排序變更→回第1頁）

  /* ======================= 生命週期 ======================= */
  ngOnInit(): void {
    this.ensureInitialGroupingSort();
    this.lastSortSig = JSON.stringify(this.ensureGroupFirst(this.multiSortMeta));
   

    this.currentPageService.currentPageProgNo$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(progNo => {
        this.funInfo = progNo ? this.authService.getUserPermissions(progNo) : undefined;
      });

    this.rows = this.queryStateService.getQueryState(this.tableKey + 'rows')?.value ?? this.rows;

    this.showSubTotal = this.showSubTotal ? this.showSubTotal : (this.columns?.some(c => c.isSubTotal) ?? false);
    this.showTotal    = this.showTotal    ? this.showTotal    : (this.columns?.some(c => c.isTotal) ?? false);

    const saved = this.queryStateService.getQueryState(this.tableKey + 'Filter')?.value as Column[] | undefined;
    this.selectedColumns = (saved?.length ? saved : this.columns || [])
      .filter(c => c.visible !== false && c.hidden !== true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.groupedDataCache.clear();

    if (changes['data']) {
      setTimeout(() => {
        this.dt.totalRecords = this.totalRecords !== 0 ? this.totalRecords : this.data.length;
        this.selectedItems = [];
        this.selectionChange.emit(this.selectedItems);
        this.selectedItemsChange.emit(this.selectedItems);
        this.calculateTotalPages();
      });
    }

    if (changes['columns'] && this.columns?.length > 0) {
      this.originalColumns = this.columns;
      this.showSubTotal = this.showSubTotal ? this.showSubTotal : this.columns.some(c => c.isSubTotal);
      this.showTotal    = this.showTotal    ? this.showTotal    : this.columns.some(c => c.isTotal);

      const saved = this.queryStateService.getQueryState(this.tableKey + 'Filter')?.value as Column[] | undefined;
      this.selectedColumns = (saved?.length ? saved : this.columns)
        .filter(c => c.visible !== false && c.hidden !== true);

      if (changes['columns'].firstChange) {
        setTimeout(() => {
  this.rows = this.queryStateService.getQueryState(this.tableKey + 'rows')?.value ?? this.rows;
  this.multiSortMeta = this.queryStateService.getQueryState(this.tableKey + 'Sort')?.value ?? this.multiSortMeta;
  // ✅ 同步簽章
  this.lastSortSig = JSON.stringify(this.ensureGroupFirst(this.multiSortMeta));
}, 300);
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /* ======================= 分頁 / 排序 ======================= */

  calculateTotalPages() {
    this.dt.totalRecords = this.totalRecords !== 0 ? this.totalRecords : this.data.length;
    this.totalPages = Math.ceil(this.dt.totalRecords / this.rows);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => ({
      label: `第 ${i + 1} 頁`,
      value: i + 1,
    }));

    if (this._skipFirstCalc) {
      this._skipFirstCalc = false;
      this.cdr.detectChanges?.();
      return;
    }

    if (this.lazy) {
      const maxFirst = Math.max(0, (this.totalPages - 1) * this.rows);
      if (this.first > maxFirst) {
        // 夾回最後一頁，並吞掉下一次 onLazyLoad
        this._suppressNextLazy = true;
        this.first = maxFirst;
      }
      this.cdr.detectChanges?.();
      return;
    }

    // 非 lazy：必要時把 first 換到最後一頁
    if (this.totalPages > 0 && this.selectedPage && this.selectedPage > this.totalPages) {
      this.selectedPage = this.totalPages;
      this._suppressNextLazy = true;
      this.first = (this.totalPages - 1) * this.rows;
      this.cdr.detectChanges?.();
    }
  }

  /** 右上下拉切頁（同步 paginator） */
goToPage(pageNumber: number) {
  const newFirst = (pageNumber - 1) * this.rows;
  if (this.first === newFirst && this.selectedPage === pageNumber) return;

  this.first = newFirst;
  this.selectedPage = pageNumber;

  if (this.lazy) {
    this._suppressNextLazy = true; // 吞掉 p-table 的 echo
    this.loadDataLazy({
      first: this.first,
      rows: this.rows,
      multiSortMeta: this.multiSortMeta
    } as TableLazyLoadEvent, true);   // 強制打 API
  }
}


  /** paginator 點擊（同步下拉） */
  onPageChange(event: TablePageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.queryStateService.setQueryState(this.tableKey + 'rows', this.rows);
    this.selectedPage = Math.ceil(event.first / event.rows + 1);
    if (!this.lazy) this.calculateTotalPages();
  }

  // 排序：只記錄，不 emit；讓 onLazyLoad 帶正確 sort
  onSort(event: any) {
    const raw = event.multisortmeta ?? event.multiSortMeta ?? [];
    const next = this.ensureGroupFirst(raw);
    this.multiSortMeta = next;
    this.queryStateService.setQueryState(this.tableKey + 'Sort', next);
    // PrimeNG 會自行觸發 onLazyLoad
  }

  /** ✅ 唯一 API 觸發點（統一做去重／抑制 echo／排序變更回第1頁） */
loadDataLazy(event: TableLazyLoadEvent, force = false) {
  // 1) 跳過首發 / 抑制 echo：force=true 時一律執行
  if (this._skipFirstLazy && !force) { this._skipFirstLazy = false; return; }
  if (this._suppressNextLazy && !force) { this._suppressNextLazy = false; return; }

  // 強制呼叫時，直接清旗標避免後續早退
  if (force) {
    this._skipFirstLazy = false;
    this._suppressNextLazy = false;
  }

  // 2) 解析分頁與排序
const pageSize = event.rows && event.rows > 0 ? event.rows : this.rows;
let pageIndex  = (event.first ?? 0) / pageSize + 1;

const sortRaw = event.multiSortMeta ?? (event as any).multisortmeta ??
  (event.sortField ? [{ field: event.sortField, order: event.sortOrder }] : []);

const sort    = this.ensureGroupFirst(sortRaw);
const sortSig = JSON.stringify(sort);

// ✅ 第一次先「建簽章、不回第一页」
if (!this.lastSortSig) {
  this.lastSortSig = sortSig;
} else if (sortSig !== this.lastSortSig) {
  // ✅ 之後才把「排序變更」視為要回第 1 頁
  this.lastSortSig = sortSig;
  if (pageIndex !== 1) {
    pageIndex = 1;
    this._suppressNextLazy = true;
    this.first = 0;
  }
}

  // 同步頁碼&排序狀態（供右上 dropdown 與 paginator 顯示）
  this.selectedPage = pageIndex;
  this.queryStateService.setQueryState(this.tableKey + 'Sort', sort);
  this.dt.totalRecords = this.totalRecords !== 0 ? this.totalRecords : this.data.length;

  // 3) 去重：同一個 pageIndex|pageSize|sortSig 就不重打
  const payload: LazyLoadEvent = { pageIndex, pageSize, SortBy: sort };
  const key = `${pageIndex}|${pageSize}|${sortSig}`;
  if (!force && key === this.lastEmitKey) return;
  this.lastEmitKey = key;

  // 4) 打 API：優先用 serverFetch，否則對外 emit 事件
  if (this.serverFetch) {
    this.loading = true; // [loading]="loading && data.length === 0"
    this.serverFetch(payload).subscribe({
      next: (res) => {
        const rows = Array.isArray(res?.rows) ? res.rows : [];
        this.data = rows;
        this.dataChange.emit(this.data);

        this.totalRecords = Number(res?.totalRecords ?? rows.length) || 0;

        // 後端若回傳總計/小計，落地至對應 input
        if (res?.externalTotals)    this.externalTotals = { ...res.externalTotals };
        if (res?.externalSubtotals) this.externalSubtotals = { ...res.externalSubtotals };

        // 依新 totalRecords 重算總頁/頁碼清單
        this.calculateTotalPages();
        this.loading = false;

        // 清選取
        this.selectedItems = [];
        this.selectionChange.emit(this.selectedItems);
        this.selectedItemsChange.emit(this.selectedItems);
      },
      error: (err) => {
        this.loading = false;
        this.serverError.emit(err);
      }
    });
    return;
  }

  // 無 serverFetch：維持舊行為交給父層
  this.lazyLoadData.emit(payload);
}


  /* ======================= Header（原 TableCaption）相關 ======================= */

  /** 欄位過濾 MultiSelect 變更 */
  onHeaderFilterChange(event: any) {
    this.columns = this.columns.map((col) => ({
      ...col,
      visible: event.value.some((ev: any) => ev.field === col.field),
    }));
    this.selectedColumns = this.columns.filter((col) => col.visible !== false);
    this.queryStateService.setQueryState(this.tableKey + 'Filter', this.columns);
  }

  /** 報表模式開關（繼承自 BasicPrintData2Component.toggleVisibility）已存在 */

  /** 匯出 Excel 範本（維持原有對外事件） */
  onExportExcel() { this.exportExcel.emit(); }

  /** 匯入 Excel */
  onImportExcel(event?: FileSelectEvent) {
    this.importExcel.emit(event);
    if (event) this.fileUpload?.clear();
  }

  /** 全展開/收合 */
  toggleExpandCollapse() {
    this.expression = !this.expression;
    this.tls2b010tableUtilityService.toggleExpandCollapseLogic(
      this.data, this.expression, this.dataKey, this.expansionDataKey,
      this.expansionLoadFn, this.expandedRows, this
    );
  }

  /* ======================= Column 重新排序（for onColReorder 綁定） ======================= */
  onColReorder(event: any) {
    if (Array.isArray(event?.columns) && event.columns.length) {
      this.columns = [...event.columns] as Column[];
    } else if (Number.isInteger(event?.dragIndex) && Number.isInteger(event?.dropIndex)) {
      const from = event.dragIndex as number;
      const to = event.dropIndex as number;
      const arr = [...this.columns];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      this.columns = arr;
    }
    this.selectedColumns = (this.columns || []).filter(c => c.visible !== false && c.hidden !== true);
    this.queryStateService.setQueryState(this.tableKey + 'Filter', this.selectedColumns);
  }

  /* ======================= Expansion ======================= */
  toggleRowExpansion(rowData: any) {
    this.tls2b010tableUtilityService.toggleRowExpansionLogic(
      rowData,
      this.dataKey,
      this.expansionDataKey,
      this.expansionLoadFn,
      this.expandedRows,
      this,
    );
  }

  /* ======================= 行/欄位邏輯（原本就有） ======================= */
  trackByRow = (index: number, item: any) => (item as any)?.[this.dataKey] || index;

get getVisibleHeaderCount(): number {
  const visibleCount =
    this.selectedColumns?.filter(c => c.hidden !== true && c.visible !== false).length ?? 0;

  // 1 = 序號
  // + 勾選欄（僅在 IsPrint 且 multiple 且非編輯）
  // + 展開欄（僅在有 expansion 且 IsPrint）
  // + 可見資料欄
  // + 管理欄（與表頭條件一致）
  return 1
    + (this.IsPrint && this.showCheckBox && !this.rowEditing && this.selectionMode === 'multiple' ? 1 : 0)
    + (this.expansionDataKey && this.IsPrint ? 1 : 0)
    + visibleCount
    + (this.IsPrint && this.showManage && (!this.alwaysEdit || (this.alwaysEdit && this.rowEditing)) ? 1 : 0);
}


  rowSelectableWrapper = ({ data }: { data: any; index: number }) =>
    this.isRowSelectable(data) && !this.rowEditing;

  onFilterChange(event: any) {
    this.columns = this.columns.map((col) => ({
      ...col,
      visible: event.value.some((ev: any) => ev.field === col.field),
    }));
    this.selectedColumns = this.columns.filter((col) => col.visible !== false);
  }

  onRowEditInit(rowData: any) {
    this.dt.initRowEdit(rowData);
    this.clonedProducts[(rowData as any)[this.dataKey]] = { ...rowData };
    this.rowEditing = true;
    this.rowEditInit.emit(rowData);
    this.selectedItems = [];
    this.selectionChange.emit(this.selectedItems);
  }

  onRowEditSave(rowData: any, ri: number, htmlTableRowElement: HTMLTableRowElement) {
    if (!validateRowData(rowData, this.columns, this.data, this.messageService, this.dataKey)) return;

    const rowId = (rowData as any)[this.dataKey];
    const oldData = this.clonedProducts[rowId];

    if (typeof rowId === 'string' && rowId.startsWith('temp-')) {
      const savedId = `saved-${Date.now()}`;
      (rowData as any)[this.dataKey] = savedId;
      this.clonedProducts[savedId] = { ...oldData };
      if (this.dataStatusField) (rowData as any)[this.dataStatusField] = this.dataStatusValue.New;
      delete this.clonedProducts[rowId];
    } else {
      if (this.dataStatusField) (rowData as any)[this.dataStatusField] = this.dataStatusValue.Modified;
      delete this.clonedProducts[rowId];
    }

    this.rowEditing = false;
    this.dt.saveRowEdit(rowData, htmlTableRowElement ?? null);
    this.rowEditSave.emit({ oldData, newData: rowData, ri, data: this.data });
    this.dataChange.emit(this.data);
  }

  onRowEditCancel(rowData: any, ri: number) {
    const rowId = (rowData as any)[this.dataKey];
    const isNewTempRow = typeof rowId === 'string' && rowId.startsWith('temp-');

    if (isNewTempRow) {
      this.data = this.data.filter((item) => (item as any)[this.dataKey] !== rowId);
      this.dataChange.emit(this.data);
    } else {
      const originalRowData = this.clonedProducts[rowId];
      if (originalRowData) {
        this.data[ri] = originalRowData;
        this.data = [...this.data];
        this.dataChange.emit(this.data);
      }
    }

    delete this.clonedProducts[rowId];
    this.rowEditing = false;
    this.dt.cancelRowEdit(rowData);
    this.rowEditCancel.emit({ data: this.data, rowData, ri });
    this.cdr.detectChanges?.();
  }

  onSelectionChange(event: any) {
    const selected = Array.isArray(event) ? event : event ? [event] : [];
    this.selectedItems = selected.filter((item: any) => this.isRowSelectable(item));
    this.selectionChange.emit(this.selectedItems);
    this.selectedItemsChange.emit(this.selectedItems);
  }

  getOptions(rowData: any, col: Column) {
    return typeof col.options === 'function'
      ? col.options(rowData) || undefined
      : col.options || undefined;
  }

  onFieldChange(rowData: any, field: string, value: any) {
    this.fieldChange.emit({ rowData, field, value } as FieldChangeEvent);
  }

  onFieldBlur(_rowData: any, _field: string, _value: any) {
    if (!this.alwaysEdit && !this.alwaysBlurValidate) return;
  }

  filterOptions(event: AutoCompleteCompleteEvent) {
    this.filterChange.emit({
      rowData: (event as any)?.originalEvent,
      value: event?.query,
    });
  }

  editRow(rowData: any) { this.edit.emit(rowData); }
  detailRow(rowData: any) { this.detail.emit(rowData); }
  onSelectButton(rowData: any) { this.selectButton.emit(rowData); }

  insertRow() {
    if (this.insertRowData) {
      this.rowEditing = true;
      this.multiSortMeta = [{ field: this.dataKey, order: 0 }];

      const newRowData: Record<string, any> = {};
      (this.columns || []).forEach((col) => {
        newRowData[col.field] =
          this.defaultInsertData[col.field] !== undefined
            ? this.defaultInsertData[col.field]
            : null;
      });

      const tempId = `temp-${Date.now()}`;
      newRowData[this.dataKey] = tempId;

      if (this.dataStatusField) newRowData[this.dataStatusField] = this.dataStatusValue.New;

      this.data = [newRowData, ...this.data];
      this.clonedProducts[tempId] = { ...newRowData };
      this.dataChange.emit(this.data);
      this.onRowEditInit(newRowData);
    } else {
      this.insert.emit();
    }
  }

  deleteRow(selectedItems: any[]) {
    if (this.dataStatusField) {
      selectedItems = selectedItems.map((item) => {
        (item as any)[this.dataStatusField!] = this.dataStatusValue.Deleted;
        return item;
      });
    }

    this.delete.emit(selectedItems);

    if (this.deleteData) {
      this.data = this.data.filter((item) => !selectedItems.includes(item));
      this.dataChange.emit(this.data);
      this.selectedItems = [];
    }
  }

  canPerformAction(action: string): boolean {
    return (
      this.funInfo?.PrivilegeBehavior?.some(
        (behavior) => behavior.function_code === action,
      ) || false
    );
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /** 提供給 <p-image> 使用的簡單來源處理 */
  getImage(src: any): string {
    if (!src) return '';
    if (typeof src === 'string') return src;
    try {
      if (src instanceof Blob) return URL.createObjectURL(src);
      if (src?.data) {
        const blob = new Blob([src.data], { type: src.type || 'image/png' });
        return URL.createObjectURL(blob);
      }
    } catch {}
    return String(src);
  }

  /* ======================= 欄位群組 / 小計 / 總計 ======================= */

  getColumnSpan(columns: Column[], groupField: string): number {
    return columns.filter(
      (col) =>
        col.groupField === groupField &&
        col.visible !== false &&
        col.hidden !== true,
    ).length;
  }

  getUngroupedColumns(columns: Column[], columnGroup: ColumnGroup[]): Column[] {
    const groupFields = columnGroup.map((g) => g.field);
    return columns.filter(
      (col) =>
        (!col.groupField || !groupFields.includes(col.groupField)) &&
        col.visible !== false &&
        col.hidden !== true,
    );
  }

  shouldRenderGroupHeader(
    col: Column,
    index: number,
    columns: Column[],
  ): boolean {
    if (!col.groupField || col.hidden === true || col.visible === false) return false;
    const currentGroup = col.groupField;
    for (let i = 0; i < index; i++) {
      const prev = columns[i];
      if (
        prev.groupField === currentGroup &&
        prev.visible !== false &&
        prev.hidden !== true
      ) {
        return false;
      }
    }
    return true;
  }

  getGroupHeader(groupField: string): string {
    return this.columnGroup?.find((g) => g.field === groupField)?.header ?? groupField;
  }

  getGroupAlignClass(groupField: string): string {
    const align = this.columnGroup?.find((g) => g.field === groupField)?.align;
    return align ? 'text-' + align : 'text-center';
  }

  getTotal(field: string): number {
    // 1) 外部總計
    if (this.externalTotals && this.externalTotalFieldMap) {
      const apiKey = this.externalTotalFieldMap[field];
      if (apiKey && apiKey in this.externalTotals) {
        return Number(this.externalTotals[apiKey] ?? 0);
      }
    }
    // 2) 退回前端加總
    return this.data.reduce((sum, row) => sum + Number((row as any)[field] ?? 0), 0);
  }

  /** 小計要顯示的欄位（selectedColumns 中標了 isSubTotal 的、且可見的） */
  getSubtotalColumns() {
    return (this.selectedColumns || []).filter(
      c => c.isSubTotal && c.hidden !== true && c.visible !== false
    );
  }

  /** 小計標籤跨欄位（序號 + 勾選 + 展開 + 非小計欄） */
  getSubtotalLabelColspan(): number {
    const nonSubtotalCols =
      (this.selectedColumns || []).filter(c => !c.isSubTotal && c.hidden !== true && c.visible !== false).length;

    let colspan = 0;
    colspan += 1; // 序號
    if (this.IsPrint && this.showCheckBox && !this.rowEditing && this.selectionMode === 'multiple') colspan += 1;
    if (this.expansionColumns.length && this.IsPrint) colspan += 1;
    colspan += nonSubtotalCols;
    return colspan; // 管理欄位不包含在這個 colspan
  }

  /** 將 `groupRowsBy` 正規化為陣列供 p-table 使用 */
  get groupRowsByArray(): string[] {
    const g = this.groupRowsBy as any;
    return Array.isArray(g) ? g : (g ? [g] : []);
  }

  // 讓群組欄位排序優先（初始化）
  private ensureInitialGroupingSort() {
    const gs = this.groupRowsByArray;
    if (!gs.length) return;
    const rest = (this.multiSortMeta || []).filter(s => !gs.includes(s.field));
    const lead = gs.map(field => ({ field, order: 1 as 1 | -1 }));
    this.multiSortMeta = [...lead, ...rest];
    if (!this.lazy) this.data = [...this.data];
  }

  // 讓群組欄位排序優先（動態）
  private ensureGroupFirst(sort: SortMeta[] | undefined): SortMeta[] {
    const gs = this.groupRowsByArray;
    if (!gs.length) return sort ?? [];
    const list = Array.isArray(sort) ? [...sort] : [];
    const rest = list.filter(s => !gs.includes(s.field));
    const lead = gs.map(field => {
      const exist = list.find(s => s.field === field);
      return { field, order: (exist?.order ?? 1) as 1 | -1 };
    });
    return [...lead, ...rest];
  }

  // === 分組 key（公開，避免 NG private 錯誤） ===
  getGroupKeyFromRow(row: any): string {
    const fields = this.groupRowsByArray;
    if (!fields.length) return '';
    return fields.map(f => String((row ?? {})[f] ?? '')).join('|');
  }

  // 取小計：先找外部小計（externalSubtotals），找不到就用同頁加總
  getGroupSubtotal(rowData: any, field: string): number {
    const groupKey = this.getGroupKeyFromRow(rowData);

    if (this.externalSubtotals && this.externalSubtotalFieldMap) {
      const apiKey = this.externalSubtotalFieldMap[field];
      const bucket = groupKey ? this.externalSubtotals[groupKey] : undefined;
      if (apiKey && bucket && apiKey in bucket) return Number(bucket[apiKey] ?? 0);
    }

    // fallback：同頁即時計算（多鍵完全比對）
    const rows = this.data.filter(r =>
      this.groupRowsByArray.every(f => String((r as any)[f] ?? '') === String((rowData as any)[f] ?? ''))
    );
    return rows.reduce((s, r) => s + Number((r as any)[field] ?? 0), 0);
  }

  // 決定是否渲染群組尾（小計列）
  shouldRenderGroupFooter(_rowData: any): boolean {
    const usingExternal = !!this.externalSubtotals && Object.keys(this.externalSubtotals).length > 0;
    return usingExternal ? true : true;
  }
  // ========= Export（補上讓 template 可呼叫） =========


/** 開啟匯出對話框：type = 'PDF' | 'Excel' */
export(type: 'PDF' | 'Excel') {
  this.exportStatus = type;
  this.exportDialog = true;
}
// 點展開按鈕時先阻止冒泡，再走原有邏輯
onToggleRow(ev: MouseEvent, rowData: any) {
  ev?.stopPropagation();
  this.toggleRowExpansion(rowData);
}

//（可選）若要在「使用 pRowToggler / 外部展開事件」時自動載入明細，可用這一個。
//有用 (onRowExpand)="onRowExpandHandler($event)" 才會觸發；你現在是手動按鈕就可以不加。
onRowExpandHandler(event: any) {
  const rowData = event?.data ?? event; // PrimeNG 版本差異
  if (!rowData) return;

  if (this.expansionLoadFn && !rowData[this.expansionDataKey]?.length && !rowData.expansionLoading) {
    rowData.expansionLoading = true;
    this.expansionLoadFn(rowData).subscribe({
      next: (resp: any) => {
        // 允許回傳 { Data: [...] } 或直接 [...]
        const list = Array.isArray(resp?.Data) ? resp.Data : (Array.isArray(resp) ? resp : []);
        rowData[this.expansionDataKey] = list;
        rowData.expansionLoading = false;
      },
      error: () => { rowData.expansionLoading = false; }
    });
  }
}
getColMinWidth(col: any): string {
  const text = (col?.header ?? '').toString();
  // 用展開運算子避免代理對（emoji/CJK 擴充等）計數錯誤
  const len = [...text].length;

  // 基準：每字 1ch，保留 sortIcon/必填星號/邊距空間；下限/上限做個夾取
  const ch = Math.max(6, Math.min(40, len + 2)); // 6ch~40ch
  return `calc(${ch}ch + 1.25rem)`; // 多 1.25rem 做左右 padding / icon 空間
}


get bodyColumnsOrdered(): any[] {
  if (this.hasTwoHeaderRows) {
    return [
      ...this.leftFixedHeaderColumns,
      ...this.headerRow1Columns,
      ...this.headerRow2Columns,
    ];
  } else {
    return [
      ...this.leftFixedHeaderColumns,
      ...this.headerRow1Columns,
    ];
  }
}



// -----------------------------------------------------
/** 取得目前可見欄位（selectedColumns 優先，其次 columns） */
private get visibleCols() {
  const cols = this.selectedColumns?.length ? this.selectedColumns : this.columns || [];
  return cols.filter(c => c.visible !== false && c.hidden !== true);
}

/** 沒有 headerRow（= undefined/null）的欄位：固定放最左邊，且表頭要 rowspan=2 */
get leftFixedHeaderColumns() {
  return this.visibleCols.filter(c => c.headerRow == null);
}

/** 表頭第 1 列欄位（headerRow = 1） */
get headerRow1Columns() {
  return this.visibleCols.filter(c => c.headerRow === 1);
}

/** 表頭第 2 列欄位（headerRow = 2） */
get headerRow2Columns() {
  return this.visibleCols.filter(c => c.headerRow === 2);
}


/** 是否需要兩列表頭：只要有任一個 row2 欄位就需要；或你也可強制兩列 */
get hasTwoHeaderRows(): boolean {
  return this.headerRow2Columns.length > 0;
}


}
