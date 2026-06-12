import { saveAs } from 'file-saver';
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectorRef,
  Component, EventEmitter, inject, Input,
  OnChanges,
  OnDestroy, OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import { SortMeta } from 'primeng/api';
import {
  Table, TableLazyLoadEvent,
  TableModule,
  TablePageEvent, TableRowSelectEvent,
  TableRowUnSelectEvent
} from 'primeng/table';

import {
  AddButton, Column, ColumnGroup, FieldChangeEvent, LazyLoadEvent,
  RowEditSaveEvent, toggleButtons, validateRowData
} from './tls2b010table.model';

import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { Observable, Subject, takeUntil } from 'rxjs';

import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { FunsrightInfo } from '@shared/models/system/funsrightInfo';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { CurrentPageService } from 'src/app/core/layout/app.menulist/current-page.service';
import { AuthService } from 'src/app/service/system/auth.service';
import { SystemDataService } from 'src/app/service/system/system-data.service';
import { REPORT_TITLES2 } from 'src/app/shared/componentkit/table2/report-titles2';
import { TableExport2 } from 'src/app/shared/componentkit/table2/table-export2/table-export2.component';
import { TableService } from 'src/app/shared/exports/report.service';
import { QueryStateService } from 'src/app/shared/service/query-state.service';
import { TLS2B010TableExportComponent } from './tls2b010table-export/tls2b010table-export.component';

@UntilDestroy()
@Component({
  selector: 'app-tls2b010table',
  templateUrl: './tls2b010table.component.html',
  styleUrls: ['./tls2b010table.component.scss'],
  animations: [toggleButtons],
  standalone: true,
  imports: [
    NgIf, NgClass, NgFor,
    DividerModule, TableModule, MultiSelectModule, TooltipModule, ButtonModule,
    FileUploadModule, DropdownModule, RippleModule, InputTextModule, InputNumberModule,
    CalendarModule, CheckboxModule, SkeletonModule, BlockUIModule,
    FormsModule,
    TLS2B010TableExportComponent
  ],
})
export class tls2b010tableComponent
  implements OnInit, OnChanges, OnDestroy {

  /* ===== Utilities ===== */
  trackByCol = (_: number, col: any) => col.key ?? col.__uid ?? col.field;
  trackByRow = (_: number, item: any) => (item as any)?.[this.dataKey] ?? _;

  @ViewChild('dt', { static: false }) dt!: Table;
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  private ngUnsubscribe = new Subject<void>();
  public funInfo: FunsrightInfo | undefined;

  constructor(
    private readonly messageService: NotificationService,
  ) { }

  /* ======================= Inputs / Outputs ======================= */
  // 基本
  @Input() dataKey = 'ID';
  @Input() tableKey?: string;
  @Input() apiUrl?: string;
  @Input() title?: string;
  @Input() groupPageSize = 20;

  // 欄位 / 資料
  @Input() columns: Column[] = [];
  originalColumns!: Column[];
  selectedColumns: Column[] = [];

  private _data: any[] = [];
  @Input() set data(v: any[]) {
    this._data = Array.isArray(v) ? v : [];
    this.rebuildPageGroupMeta();       // data 變更先重建 meta
    this.dataChange.emit(this._data);
  }
  get data(): any[] { return this._data; }

  @Output() dataChange = new EventEmitter<any[]>();
  @Input() loading = false;
  @Input() disabled = false;

  // 群組（僅排序輔助；無小計）
  @Input() columnGroup?: ColumnGroup[];
  @Input() groupRowsBy: string | string[] = '';

  // 直向合併
  /** 群組鍵（資料欄位名稱）預設 'ECR_No' */
  public groupKey = 'ECR_No';
  /** 需要直向合併的欄位 */
  @Input() mergedColumns: string[] = [];
  get hasRowSpan(): boolean {
    return Array.isArray(this.mergedColumns) && this.mergedColumns.length > 0;
  }

  // 勾選與選取
  @Input() showCheckBox = false;
  @Input() selectionMode: 'multiple' | 'single' | null | undefined = 'multiple';
  @Input() selectedItems: any[] = [];
  get hasNoSelection(): boolean { return this.selectedItems.length === 0; }
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true;
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() selectedItemsChange = new EventEmitter<any[]>();
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
  @Input() showCustomHeader = true;

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
  @Input() showPaginator = true;
  @Input() totalRecords = 0;
  @Input() rowsPerPageOptions: number[] = [20, 40, 60, 80, 100];
  totalPages = 0;
  @Input() rows = 20;
  first = 0;
  pages: { label: string; value: number }[] = [];
  selectedPage: number | null = 1;
  @Input() lazy = false;

  // Lazy 取數（事件往外丟）
  @Input() serverFetch?: (payload: LazyLoadEvent) => Observable<{ rows: any[]; totalRecords: number }>;
  @Output() serverError = new EventEmitter<unknown>();
  @Output() lazyLoadData = new EventEmitter<LazyLoadEvent>();
  /** 是否顯示總計列（footer） @default false */
  @Input() showTotal = false;
  /** 後端回來的總計：{ 欄位名稱: 數值 }，例如 { BOOK_PayAmt: 123, ACT_PayAmt: 456, OVER_PayAmt: 789 } */
  @Input() totals: Record<string, number> = {};

  /** 取得 footer 總計：優先吃 this.totals[col.field]；沒有就用前端加總（排除 __isTotal 資料列） */
  getFooterTotal(field: string): number {
    if (this.totals && Object.prototype.hasOwnProperty.call(this.totals, field)) {
      const v = this.totals[field];
      return typeof v === 'number' ? v : Number(v || 0);
    }
    // fallback：前端加總（不含你可能插入的 __isTotal 列）
    return (this.data || [])
      .filter(r => !r?.__isTotal)
      .reduce((sum, r) => sum + Number(r?.[field] || 0), 0);
  }


  /* ===== 內部旗標 ===== */
  private _skipFirstLazy = true;
  private _skipFirstCalc = true;
  private _suppressNextLazy = false;
  private lastEmitKey: string | null = null;
  private lastSortSig = '';
  readonly defaultPageSize = 20;
  // 本「頁」的群組 meta（rowspan 用）
  private pageGroupMeta: Record<string, { index: number; size: number }> = {};
  currentPage = inject(CurrentPageService);
  systemDataService = inject(SystemDataService);
  queryState = inject(QueryStateService);

  /* ======================= LifeCycle ======================= */
  ngOnInit(): void {
    this.ensureInitialGroupingSort();
    this.lastSortSig = JSON.stringify(this.ensureGroupFirst(this.multiSortMeta));

    this.currentPage.currentPageProgNo$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(progNo => {
        this.funInfo = progNo ? this.systemDataService.getUserPermissions(progNo) : undefined;
      });

    this.rows = this.queryState.getQueryState(this.tableKey + 'rows')?.value ?? this.rows;

    const saved = this.queryState.getQueryState(this.tableKey + 'Filter')?.value as Column[] | undefined;
    this.selectedColumns = (saved?.length ? saved : this.columns || [])
      .filter(c => c.visible !== false && c.hidden !== true);

    this.rebuildPageGroupMeta();
    this.calculateTotalPages();
  }
  cdr = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] && this.columns?.length > 0) {
      this.originalColumns = this.columns;
      const saved = this.queryState.getQueryState(this.tableKey + 'Filter')?.value as Column[] | undefined;
      this.selectedColumns = (saved?.length ? saved : this.columns)
        .filter(c => c.visible !== false && c.hidden !== true);

      if (changes['columns'].firstChange) {
        setTimeout(() => {
          this.rows = this.queryState.getQueryState(this.tableKey + 'rows')?.value ?? this.rows;
          this.multiSortMeta = this.queryState.getQueryState(this.tableKey + 'Sort')?.value ?? this.multiSortMeta;
          this.lastSortSig = JSON.stringify(this.ensureGroupFirst(this.multiSortMeta));
        }, 0);
      }
    }

    if (changes['data'] || changes['totalRecords']) {
      this.rebuildPageGroupMeta();
      this.calculateTotalPages();
      this.resyncFirstAfterRowsChange();
      this.cdr.detectChanges?.();
    }

    if (changes['rows'] && !changes['rows'].firstChange) {
      this.resyncFirstAfterRowsChange();   // ★ rows 變了也同步
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /* ======================= 分頁 / 排序 ======================= */

  private getBoundTotal(): number {
    return this.totalRecords && this.totalRecords > 0
      ? this.totalRecords
      : (this.data?.length ?? 0);
  }

  private getPageRows(): any[] {
    if (this.lazy) return this.data ?? []; // lazy: this.data 就是本頁
    const start = this.first ?? 0;
    const end = Math.min(start + (this.rows ?? 0), this.data?.length ?? 0);
    return (this.data ?? []).slice(start, end);
  }

  calculateTotalPages() {
    const total = this.getBoundTotal();
    this.totalPages = this.rows > 0 ? Math.ceil(total / this.rows) : 0;
    this.pages = Array.from({ length: this.totalPages }, (_, i) => ({ label: `第 ${i + 1} 頁`, value: i + 1 }));

    if (this._skipFirstCalc) {
      this._skipFirstCalc = false;
      this.cdr.detectChanges?.();
      return;
    }

    if (this.lazy) {
      const maxFirst = Math.max(0, (this.totalPages - 1) * this.rows);
      if (this.first > maxFirst) {

        // 讓它自然觸發下一次 onLazyLoad，不要抑制
        this.first = maxFirst;
        return; // 提早結束這次計算，等待下一個事件
      }
      this.cdr.detectChanges?.();
      return;
    }

    if (this.totalPages > 0 && this.selectedPage && this.selectedPage > this.totalPages) {
      this.selectedPage = this.totalPages;
      this._suppressNextLazy = true;
      this.first = (this.totalPages - 1) * this.rows;
      this.cdr.detectChanges?.();
    }
  }
  getGlobalGroupDisplayIndex(rowIndexGlobal: number, rowData: any): number {
    const localNo = this.getGroupDisplayIndex(rowIndexGlobal, rowData);
    const pageNo = this.selectedPage ?? 1;
    const offset = (pageNo - 1) * (this.rows || 20);
    return offset + localNo;
  }
  /** 給右上角頁碼下拉用 */
  goToPage(pageNumber: number) {
    const unit = this.rows || 20;
    const newFirst = (pageNumber - 1) * unit;

    if (this.first === newFirst && this.selectedPage === pageNumber) return;

    this.first = newFirst;
    this.selectedPage = pageNumber;

    if (this.lazy) {
      this.loadDataLazy(
        {
          first: newFirst,
          rows: this.rows,
          multiSortMeta: this.multiSortMeta,
        } as TableLazyLoadEvent,
        true
      );
    } else {
      this.rebuildPageGroupMeta();
      this.calculateTotalPages();
    }

    this.cdr.detectChanges?.();
  }


  onPageChange(event: TablePageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.queryState.setQueryState(this.tableKey + 'rows', this.rows);
    this.selectedPage = Math.ceil(event.first / this.rows + 1);

    if (!this.lazy) {
      this.rebuildPageGroupMeta();
      this.calculateTotalPages();
    }
  }

  loadDataLazy(event: TableLazyLoadEvent, force = false) {
    if (this._skipFirstLazy && !force) { this._skipFirstLazy = false; return; }
    if (force) { this._skipFirstLazy = false; }

    // ✅ pageSize 統一用 groupPageSize（你要的一頁 20 筆），沒有才退回 event.rows / rows
    const pageSize = event.rows && event.rows > 0 ? event.rows : (this.rows || 20);

    console.log('loadDataLazy event.rows =', event.rows);
    console.log('loadDataLazy this.rows =', this.rows);
    console.log('loadDataLazy groupPageSize =', this.groupPageSize);
    console.log('loadDataLazy final pageSize =', pageSize);
    const sortRaw = event.multiSortMeta ?? (event as any).multisortmeta ??
      (event.sortField ? [{ field: event.sortField, order: event.sortOrder }] : []);
    const normalized = this.normalizeSortMeta(sortRaw);
    const sort = this.ensureGroupFirst(normalized);
    const sortSig = JSON.stringify(sort);

    const userSorted = !!(event.sortField || (Array.isArray(event.multiSortMeta) && event.multiSortMeta.length));

    // ✅ pageIndex 直接吃「現在選到第幾頁」，不要再用 first / pageSize + 1
    const pageIndex = this.selectedPage ?? 1;

    if (!this.lastSortSig) {
      this.lastSortSig = sortSig;
    } else if (sortSig !== this.lastSortSig) {
      this.lastSortSig = sortSig;

      // 若使用者改排序，強制回第 1 頁
      if (userSorted && pageIndex !== 1) {
        this.first = 0;
        this.selectedPage = 1;
        return;
      }
    }

    // 這裡 selectedPage 已經由 goToPage / onPageChange 維護，不要再覆寫
    this.queryState.setQueryState(this.tableKey + 'Sort', sort);

    const payload: LazyLoadEvent = { pageIndex, pageSize, SortBy: sort };

    const key = `${pageIndex}|${pageSize}|${sortSig}`;
    if (!force && key === this.lastEmitKey) return;
    this.lastEmitKey = key;

    this.lazyLoadData.emit(payload);
  }


  /* ======================= 群組 / RowSpan ======================= */

  /** 統一的群組鍵生成（含空值處理） */
  private buildGroupKey(raw: any, rowIndex: number): string {
    return (raw !== undefined && raw !== null && String(raw) !== '')
      ? String(raw)
      : `__row_${rowIndex}`;
  }







  /* ======================= Header / Filter ======================= */

  onHeaderFilterChange(event: any) {
    this.columns = this.columns.map((col) => ({
      ...col,
      visible: event.value.some((ev: any) => ev.field === col.field),
    }));
    this.selectedColumns = this.columns.filter((col) => col.visible !== false && col.hidden !== true);
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }

  onExportExcel() { this.exportExcel.emit(); }

  onImportExcel(event?: FileSelectEvent) {
    this.importExcel.emit(event);
    if (event) this.fileUpload?.clear();
  }

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
    this.queryState.setQueryState(this.tableKey + 'Filter', this.selectedColumns);
  }
  IsPrint = true;

  get getVisibleHeaderCount(): number {
    const visibleCount = this.selectedColumns?.filter(c => c.hidden !== true && c.visible !== false).length ?? 0;
    return 1
      + (this.IsPrint && this.showCheckBox && !this.rowEditing && this.selectionMode === 'multiple' ? 1 : 0)
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

  /* ======================= Row edit / actions ======================= */

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
      delete this.clonedProducts[rowId];
    } else {
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
    const selected = Array.isArray(event) ? event : (event ? [event] : []);
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
          (this as any).defaultInsertData?.[col.field] !== undefined
            ? (this as any).defaultInsertData[col.field]
            : null;
      });

      const tempId = `temp-${Date.now()}`;
      newRowData[this.dataKey] = tempId;

      this.data = [newRowData, ...this.data];
      this.clonedProducts[tempId] = { ...newRowData };
      this.dataChange.emit(this.data);
      this.onRowEditInit(newRowData);
    } else {
      (this as any).insert.emit();
    }
  }

  deleteRow(selectedItems: any[]) {
    (this as any).delete.emit(selectedItems);

    if ((this as any).deleteData) {
      this.data = this.data.filter((item) => !selectedItems.includes(item));
      this.dataChange.emit(this.data);
      this.selectedItems = [];
    }
  }

  hasPermission(action: string): boolean {
    return this.funInfo?.PrivilegeBehavior?.some(b => b.function_code === action) || false;
  }

  /* ======================= 群組排序（讓群組鍵固定優先） ======================= */

  getColumnSpan(columns: Column[], groupField: string): number {
    return columns.filter(
      (col) => col.groupField === groupField && col.visible !== false && col.hidden !== true,
    ).length;
  }

  shouldRenderGroupHeader(col: Column, index: number, columns: Column[]): boolean {
    if (!col.groupField || col.hidden === true || col.visible === false) return false;
    const currentGroup = col.groupField;
    for (let i = 0; i < index; i++) {
      const prev = columns[i];
      if (prev.groupField === currentGroup && prev.visible !== false && prev.hidden !== true) return false;
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

  get groupRowsByArray(): string[] {
    const g = this.groupRowsBy as any;
    return Array.isArray(g) ? g : (g ? [g] : []);
  }

  private ensureInitialGroupingSort() {
    const gs = this.groupRowsByArray;
    const rest = (this.multiSortMeta || []).filter(s => !gs.includes(s.field));
    const lead = gs.map(field => ({ field, order: 1 as 1 | -1 }));
    this.multiSortMeta = [...lead, ...rest];
    if (!this.lazy) this.data = [...this.data];
  }

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

  private normalizeSortMeta(list: any[] | undefined): SortMeta[] {
    if (!Array.isArray(list)) return [];
    const seen = new Set<string>();
    const cleaned = list
      .map((s: any) => {
        const f = Array.isArray(s?.field) ? s.field[0] : s?.field;
        const ord = s?.order === -1 ? -1 : 1;
        return f ? ({ field: String(f), order: ord } as SortMeta) : null;
      })
      .filter(Boolean) as SortMeta[];

    const unique: SortMeta[] = [];
    for (const s of cleaned) {
      if (!seen.has(s.field)) {
        seen.add(s.field);
        unique.push(s);
      }
    }
    return unique;
  }

  /* ======================= 補齊樣板使用的輔助（避免 2339） ======================= */

  /** 依欄名長度估算最小寬度，避免標題擠在一起 */
  getColMinWidth(col: any): string {
    const text = (col?.header ?? '').toString();
    const len = [...text].length;
    const ch = Math.max(6, Math.min(40, len + 2));
    return `calc(${ch}ch + 1.25rem)`;
  }

  /** 目前可視欄位（selectedColumns > columns），排除 hidden/visible=false */
  private get visibleCols() {
    const cols = this.selectedColumns?.length ? this.selectedColumns : this.columns || [];
    return cols.filter(c => c.visible !== false && c.hidden !== true);
  }

  /** 舊模板保留的存取子（左側固定欄，但我們已不凍結，只是個分組） */
  get leftFixedHeaderColumns() {
    return this.visibleCols.filter(c => c.frozen === true);
  }

  /** 其他欄位（非 frozen），亦是模板使用的迴圈來源 */
  get headerRow1Columns() {
    return this.visibleCols.filter(c => (c.headerRow === 1 || c.headerRow == null) && c.frozen !== true);
  }

  exportDialog = false;
  exportStatus: 'PDF' | 'Excel' = 'PDF';
  /* ======================= 匯出 ======================= */
  export(type: 'PDF' | 'Excel'): void {
    this.exportStatus = type;
    this.exportDialog = true;
  }
  /** 把 PrimeNG 提供的 rowIndex（可能是全域）換算成本頁索引（0 開始） */
  private toPageIndex(globalIndex: number): number {
    // lazy 模式：每頁大小就是 this.rows
    if (this.lazy) return Math.max(0, globalIndex % (this.rows || 1));
    // 非 lazy：以 this.first（當前頁起始）換算
    return Math.max(0, globalIndex - (this.first || 0));
  }

  /** 樣板用：接受「全域」rowIndex，內部換算成本頁索引再產生群組鍵 */
  getGroupKeyValue(rowData: any, rowIndexGlobal: number): string {
    const local = this.toPageIndex(rowIndexGlobal);
    const raw = rowData?.[this.groupKey];
    return (raw !== undefined && raw !== null && String(raw) !== '')
      ? String(raw)
      : `__row_${local}`;
  }

  /** 判斷是否為「本頁」群組首列：頁首一定畫 rowspan 的首格 */
  isFirstInGroupOnPage(rowIndexGlobal: number, key: string): boolean {
    if (!this.hasRowSpan) return false;
    const local = this.toPageIndex(rowIndexGlobal);
    if (local === 0) return true; // 跨頁延續：第二頁也要當作首列畫出
    const m = this.pageGroupMeta[key];
    return !!m && m.index === local;
  }
  private resyncFirstAfterRowsChange() {
    if (!this.lazy) return;
    const curPage = this.selectedPage ?? 1;
    // 避免因為重設 first 又觸發一次 onLazyLoad
    this._suppressNextLazy = true;
    this.first = (curPage - 1) * (this.rows || 0);
  }


  /** 取得本頁的 rowspan；meta 查不到也回 1，避免整欄被吃掉 */
  getPageRowSpan(rowIndexGlobal: number, key: string): number {
    if (!this.hasRowSpan) return 1;
    const local = this.toPageIndex(rowIndexGlobal);
    const m = this.pageGroupMeta[key];
    return (m && m.index === local) ? m.size : 1;
  }
  // 新增：本頁分組的序號 (1-based)
  private pageGroupOrder: Record<string, number> = {};

  // 調整：重建本頁 group meta 時，順便建立組序
  private rebuildPageGroupMeta(): void {
    const rows = this.getPageRows();
    const meta: Record<string, { index: number; size: number }> = {};
    const order: Record<string, number> = {};

    let lastKey: string | null = null;
    let groupNo = 0;

    rows.forEach((row, i) => {
      const key = this.buildGroupKey(row?.[this.groupKey], i);
      if (lastKey === key) {
        meta[key].size++;
      } else {
        groupNo++;
        meta[key] = { index: i, size: 1 };
        order[key] = groupNo;         // 這一組在本頁的組序
        lastKey = key;
      }
    });

    this.pageGroupMeta = meta;
    this.pageGroupOrder = order;
  }

  // 取得本頁組序，用於序號顯示（fallback 為 rowIndex+1）
  getGroupDisplayIndex(rowIndexGlobal: number, rowData: any): number {
    const key = this.getGroupKeyValue(rowData, rowIndexGlobal);
    const local = this.toPageIndex(rowIndexGlobal);
    return this.pageGroupOrder[key] ?? (local + 1);
  }

  toggleVisibility(): void {
    this.IsPrint = !this.IsPrint;
  }
  /**
   * PDF 匯出
   * columns 由 Table2 傳進來，會帶有 exportFormat（若有設定）
   * 這裡只在 exportFormat 是「字串」時才送給後端
   */
  exportPDFDownload(event: TableExport2, columns: Column[], apiUrl?: string): void {
    const ProgNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const funInfo = this.systemDataService.getUserPermissions(ProgNo); // 取得權限
    const queryState = this.queryState.getQueryState(`query${ProgNo}`);
    const userInfo = this.authService.currentUserValue;

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const formattedToday = `${year}${month}${day}`;

    const pdfColumns = columns.map(col => {
      const c: any = {
        field: col.field,
        header: col.header,
        visible: col.visible !== false
      };

      // ⭐ 只有在 exportFormat 是非空字串時才加到 body
      if (typeof (col as any).exportFormat === 'string' && (col as any).exportFormat.trim() !== '') {
        c.exportFormat = (col as any).exportFormat.trim();
      }

      return c;
    });

    const body = {
      query_condition: {
        ServiceName: apiUrl ? `${apiUrl}` : `query${ProgNo}`,
        Conditions: queryState?.value || []
      },
      report_title: REPORT_TITLES2[`query${ProgNo}`] || funInfo?.prog_name,
      columns: pdfColumns,
      config: {
        ...event,
        footer_DataType: ProgNo
      },
      file_name: `${userInfo?.user_No}_${funInfo?.prog_id}_${formattedToday}`
    };

    this.tableService.exportPDF(body).pipe(untilDestroyed(this)).subscribe({
      next: (response: HttpResponse<Blob>) => {
        if (response.body) {
          const contentDisposition = response.headers.get('content-disposition');
          let filename = `${body.file_name}.pdf`;
          if (contentDisposition) {
            const filenameRegex = /filename\*=UTF-8''(.+?)(?:\.pdf)?$|filename="(.+?)(?:\.pdf)?"$/;
            const matches = contentDisposition.match(filenameRegex);
            if (matches) {
              filename = matches[1] || matches[2] || filename;
              filename = decodeURIComponent(filename);
            }
            filename = filename.replace(/["']/g, '');
          }
          const blob = new Blob([response.body], { type: 'application/pdf' });
          saveAs(blob, filename);
        } else {
          console.error('Response body is empty!');
        }
        this.exportDialog = false;
      },
      error: (err: any) => {
        console.error('Error downloading PDF:', err);
        this.exportDialog = false;
      }
    });
  }

  /**
   * Excel 匯出
   * 同樣只在 exportFormat 是「字串」時才送給後端
   */
  exportExcelDownload(event: TableExport2, columns: Column[], apiUrl?: string): void {
    const ProgNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const funInfo = this.systemDataService.getUserPermissions(ProgNo); // 取得權限
    const queryState = this.queryState.getQueryState(`query${ProgNo}`);
    const userInfo = this.authService.currentUserValue;

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const formattedToday = `${year}${month}${day}`;

    const excelColumns = columns.map(col => {
      const c: any = {
        field: col.field,
        header: col.header,
        visible: col.visible !== false
      };

      // ⭐ 只有在 exportFormat 是非空字串時才加到 body
      if (typeof (col as any).exportFormat === 'string' && (col as any).exportFormat.trim() !== '') {
        c.exportFormat = (col as any).exportFormat.trim();
      }

      return c;
    });

    const body = {
      query_condition: {
        ServiceName: apiUrl ? `${apiUrl}` : `query${ProgNo}`,
        Conditions: queryState?.value || []
      },
      report_title: REPORT_TITLES2[`query${ProgNo}`] || funInfo?.prog_name,
      columns: excelColumns,
      config: event,
      file_name: `${userInfo?.user_No}_${funInfo?.prog_id}_${formattedToday}`
    };

    this.tableService.exportExcel(body).pipe(untilDestroyed(this)).subscribe({
      next: (response: HttpResponse<Blob>) => {
        if (response.body) {
          const contentDisposition = response.headers.get('content-disposition');
          let filename = `${body.file_name}.xlsx`;
          if (contentDisposition) {
            const filenameRegex = /filename\*=UTF-8''(.+?)(?:\.xlsx)?$|filename="(.+?)(?:\.xlsx)?"$/;
            const matches = contentDisposition.match(filenameRegex);
            if (matches) {
              filename = matches[1] || matches[2] || filename;
              filename = decodeURIComponent(filename);
            }
            filename = filename.replace(/["']/g, '');
          }
          const blob = new Blob(
            [response.body],
            { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
          );
          saveAs(blob, filename);
        } else {
          console.error('Response body is empty!');
        }
        this.exportDialog = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error downloading Excel:', err);
        this.exportDialog = false;
        this.cdr.detectChanges();
      }
    });
  }
  tableService = inject(TableService);
  authService = inject(AuthService);

}
