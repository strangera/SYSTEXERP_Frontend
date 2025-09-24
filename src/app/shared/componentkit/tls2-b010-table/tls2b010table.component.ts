/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component, EventEmitter, Input, SimpleChanges, OnChanges, Output,
  ViewChild, OnDestroy, OnInit,
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
import { TLS2B010TableExportComponent } from './tls2b010table-export/tls2b010table-export.component';
import { BlockUIModule } from 'primeng/blockui';
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'filterMerged', standalone: true })
export class FilterMergedPipe implements PipeTransform {
  transform(columns: any[], merged: string[]): any[] {
    if (!Array.isArray(columns)) return [];
    if (!Array.isArray(merged) || merged.length === 0) return columns;
    return columns.filter(c => !merged.includes(c.field));
  }
}

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
    FilterMergedPipe,
    TLS2B010TableExportComponent
  ],
})
export class tls2b010tableComponent
  extends BasicPrintData2Component
  implements OnInit, OnChanges, OnDestroy {

  trackByCol = (index: number, col: any) => col.key ?? col.__uid ?? col.field ?? index;

  @ViewChild('dt', { static: false }) dt!: Table;
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  private ngUnsubscribe = new Subject<void>();
  public funInfo: FunsrightInfo | undefined;

  constructor(
    private readonly queryStateService: QueryStateService,
    private readonly currentPageService: CurrentPageService,
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

  // 群組（仍保留群組功能，但無小計）
  @Input() columnGroup?: ColumnGroup[];
  @Input() groupRowsBy: string | string[] = '';
  groupedDataCache = new Map();

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

  // ===== Lazy 取數（加回這三個） =====
@Input() serverFetch?: (payload: LazyLoadEvent) => Observable<{
  rows: any[];
  totalRecords: number;
}>;

@Output() serverError = new EventEmitter<unknown>();
@Output() lazyLoadData = new EventEmitter<LazyLoadEvent>();

@Input() mergedColumns: string[] = [];  // ✅ 外部元件可指定要合併顯示的欄位

  // =====（已刪除）所有 externalTotals / externalSubtotals / Total/Subtotal Inputs =====

  /* ===== 內部旗標 ===== */
  private _skipFirstLazy = true;
  private _skipFirstCalc = true;
  private _suppressNextLazy = false;
  private lastEmitKey: string | null = null;
  private lastSortSig = '';
  rowGroupMeta: Record<string, { index: number; size: number }> = {};

  ngOnInit(): void {
    this.ensureInitialGroupingSort();
    this.lastSortSig = JSON.stringify(this.ensureGroupFirst(this.multiSortMeta));

    this.currentPageService.currentPageProgNo$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(progNo => {
        this.funInfo = progNo ? this.authService.getUserPermissions(progNo) : undefined;
      });

    this.rows = this.queryStateService.getQueryState(this.tableKey + 'rows')?.value ?? this.rows;

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
         this.updateRowGroupMeta();   // ✅ 重算群組
      });
    }

    if (changes['columns'] && this.columns?.length > 0) {
      this.originalColumns = this.columns;

      const saved = this.queryStateService.getQueryState(this.tableKey + 'Filter')?.value as Column[] | undefined;
      this.selectedColumns = (saved?.length ? saved : this.columns)
        .filter(c => c.visible !== false && c.hidden !== true);

      if (changes['columns'].firstChange) {
        setTimeout(() => {
          this.rows = this.queryStateService.getQueryState(this.tableKey + 'rows')?.value ?? this.rows;
          this.multiSortMeta = this.queryStateService.getQueryState(this.tableKey + 'Sort')?.value ?? this.multiSortMeta;
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
        this._suppressNextLazy = true;
        this.first = maxFirst;
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

  goToPage(pageNumber: number) {
    const newFirst = (pageNumber - 1) * this.rows;
    if (this.first === newFirst && this.selectedPage === pageNumber) return;

    this.first = newFirst;
    this.selectedPage = pageNumber;

    if (this.lazy) {
      this._suppressNextLazy = true;
      this.loadDataLazy({
        first: this.first,
        rows: this.rows,
        multiSortMeta: this.multiSortMeta
      } as TableLazyLoadEvent, true);
    }
  }

  onPageChange(event: TablePageEvent) {
    this.first = event.first;
       this.rows = event.rows;
    this.queryStateService.setQueryState(this.tableKey + 'rows', this.rows);
    this.selectedPage = Math.ceil(event.first / event.rows + 1);
    if (!this.lazy) this.calculateTotalPages();
  }


  loadDataLazy(event: TableLazyLoadEvent, force = false) {
    if (this._skipFirstLazy && !force) { this._skipFirstLazy = false; return; }
    if (this._suppressNextLazy && !force) { this._suppressNextLazy = false; return; }

    if (force) {
      this._skipFirstLazy = false;
      this._suppressNextLazy = false;
    }

    const pageSize = event.rows && event.rows > 0 ? event.rows : this.rows;
    let pageIndex  = (event.first ?? 0) / pageSize + 1;

  const sortRaw = event.multiSortMeta ?? (event as any).multisortmeta ??
    (event.sortField ? [{ field: event.sortField, order: event.sortOrder }] : []);
  const normalized = this.normalizeSortMeta(sortRaw);
  const sort = this.ensureGroupFirst(normalized);
    const sortSig = JSON.stringify(sort);

    if (!this.lastSortSig) {
      this.lastSortSig = sortSig;
    } else if (sortSig !== this.lastSortSig) {
      this.lastSortSig = sortSig;
      if (pageIndex !== 1) {
        pageIndex = 1;
        this._suppressNextLazy = true;
        this.first = 0;
      }
    }

    this.selectedPage = pageIndex;
    this.queryStateService.setQueryState(this.tableKey + 'Sort', sort);
    this.dt.totalRecords = this.totalRecords !== 0 ? this.totalRecords : this.data.length;

      const payload: LazyLoadEvent = { pageIndex, pageSize, SortBy: sort };
  this.lazyLoadData.emit(payload);
    const key = `${pageIndex}|${pageSize}|${sortSig}`;
    if (!force && key === this.lastEmitKey) return;
    this.lastEmitKey = key;

if (this.serverFetch) {
  this.loading = true;
  this.serverFetch(payload).subscribe({
    next: (res: { rows: any[]; totalRecords: number }) => {
      const rows = Array.isArray(res?.rows) ? res.rows : [];
      this.data = rows;
      this.updateRowGroupMeta();  // ✅
      this.dataChange.emit(this.data);

      this.totalRecords = Number(res?.totalRecords ?? rows.length) || 0;

      this.calculateTotalPages();
      this.loading = false;

      this.selectedItems = [];
      this.selectionChange.emit(this.selectedItems);
      this.selectedItemsChange.emit(this.selectedItems);
    },
    error: (err: unknown) => {
      this.loading = false;
      this.serverError.emit(err);
    }
  });
  return;
}

this.lazyLoadData.emit(payload);

  }

  /* ======================= Header（原 TableCaption） ======================= */

  onHeaderFilterChange(event: any) {
    this.columns = this.columns.map((col) => ({
      ...col,
      visible: event.value.some((ev: any) => ev.field === col.field),
    }));
    this.selectedColumns = this.columns.filter((col) => col.visible !== false);
    this.queryStateService.setQueryState(this.tableKey + 'Filter', this.columns);
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
    this.queryStateService.setQueryState(this.tableKey + 'Filter', this.selectedColumns);
  }

  trackByRow = (index: number, item: any) => (item as any)?.[this.dataKey] || index;

  get getVisibleHeaderCount(): number {
    const visibleCount =
      this.selectedColumns?.filter(c => c.hidden !== true && c.visible !== false).length ?? 0;

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

  canPerformAction(action: string): boolean {
    return (
      this.funInfo?.PrivilegeBehavior?.some(
        (behavior) => behavior.function_code === action,
      ) || false
    );
  }

  /* ======================= 群組排序（保留） ======================= */

  getColumnSpan(columns: Column[], groupField: string): number {
    return columns.filter(
      (col) =>
        col.groupField === groupField &&
        col.visible !== false &&
        col.hidden !== true,
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
    if (!gs.length) return;
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

  /* ========= 可見欄位 ========= */

  getColMinWidth(col: any): string {
    const text = (col?.header ?? '').toString();
    const len = [...text].length;
    const ch = Math.max(6, Math.min(40, len + 2));
    return `calc(${ch}ch + 1.25rem)`;
  }

  private get visibleCols() {
    const cols = this.selectedColumns?.length ? this.selectedColumns : this.columns || [];
    return cols.filter(c => c.visible !== false && c.hidden !== true);
  }

get leftFixedHeaderColumns() {
  // 只有凍結欄位（左側固定），沒有就回空陣列
  return this.visibleCols.filter(c => c.frozen === true);
}

get headerRow1Columns() {
  // 其餘一般欄位（未凍結），若沒有多表頭就允許 headerRow 為 null 或 1
  return this.visibleCols.filter(c => (c.headerRow === 1 || c.headerRow == null) && c.frozen !== true);
}



// 供模板呼叫
export(type: 'PDF' | 'Excel') {
  this.exportStatus = type;
  this.exportDialog = true;
}
getHeaderByField(field: string): string {
  const col = this.columns?.find(c => c.field === field);
  return col?.header ?? field;
}
onSort(event: any) {
  const raw = event.multisortmeta ?? event.multiSortMeta ?? [];
  const normalized = this.normalizeSortMeta(raw);
  const next = this.ensureGroupFirst(normalized);
  this.multiSortMeta = next;
  this.queryStateService.setQueryState(this.tableKey + 'Sort', next);
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

  // 去重（依 field）
  const unique: SortMeta[] = [];
  for (const s of cleaned) {
    if (!seen.has(s.field)) {
      seen.add(s.field);
      unique.push(s);
    }
  }
  return unique;
}

// 依 ECR_No（或你想要的 key）建立群組資訊
private updateRowGroupMeta() {
  this.rowGroupMeta = {};
  let lastKey: string | null = null;
  this.data.forEach((row, i) => {
    const key = String(row?.ECR_No ?? '');
    if (!key) return;

    if (lastKey === key) {
      this.rowGroupMeta[key].size++;
    } else {
      this.rowGroupMeta[key] = { index: i, size: 1 };
      lastKey = key;
    }
  });
}

// 幫手：判斷該列是否是群組第一筆、取 rowspan 數
isFirstInGroup(index: number, key: string): boolean {
  return this.rowGroupMeta[key]?.index === index;
}
getGroupSize(key: string): number {
  return this.rowGroupMeta[key]?.size || 1;
}

}
