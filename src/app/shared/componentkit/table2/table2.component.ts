/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  EventEmitter,
  Input,
  SimpleChanges,
  OnChanges,
  Output,
  ViewChild,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  Table,
  TableLazyLoadEvent,
  TablePageEvent,
  TableRowSelectEvent,
  TableRowUnSelectEvent,
  TableModule,
} from 'primeng/table';
import { SortMeta } from 'primeng/api';
import {
  AddButton,
  Column,
  ColumnGroup,
  FieldChangeEvent,
  LazyLoadEvent,
  RowEditSaveEvent,
  toggleButtons,
  validateRowData,
} from './table2.model';
import {
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { NotificationService } from '../../component/notification-message/notification.service';
import { QueryStateService } from '../../service/query-state.service';
import { BasicPrintData2Component } from '../../componentextends/basic-print/basic-print-data2.component';
import { CurrentPageService } from '../../../layout/app.menulist/current-page.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { NgIf, NgClass, NgFor, NgStyle } from '@angular/common';
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
import { TableExpansion2Component } from './table-expansion2/table-expansion2.component';
import { TableExport2Component } from './table-export2/table-export2.component';
import { BlockUIModule } from 'primeng/blockui';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Table2UtilityService } from './table2-utility.service';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-table2',
  templateUrl: './table2.component.html',
  styleUrls: ['./table2.component.scss'],
  animations: [toggleButtons],
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    NgFor,
    NgStyle,
    // PrimeNG
    DividerModule,
    TableModule,
    MultiSelectModule,
    TooltipModule,
    ButtonModule,
    FileUploadModule,
    DropdownModule,
    RippleModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    CheckboxModule,
    SkeletonModule,
    BlockUIModule,
    // 自家元件
    TableExpansion2Component,
    TableExport2Component,
    // Angular
    FormsModule,
    ImageModule
  ],
})
export class Table2Component
  extends BasicPrintData2Component
  implements OnInit, OnChanges, OnDestroy
{
  /* ======================= 基本與依賴 ======================= */
  @ViewChild('dt', { static: false }) dt!: Table;
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  private ngUnsubscribe = new Subject<void>();
  public funInfo: FunsrightInfo | undefined;

  constructor(
    private readonly queryStateService: QueryStateService,
    private readonly currentPageService: CurrentPageService,
    private readonly table2UtilityService: Table2UtilityService,
    private readonly sanitizer: DomSanitizer,
    private readonly messageService: NotificationService,
  ) {
    super();
  }

  /* ======================= Inputs/Outputs ======================= */
  // 基本設置
  @Input() dataKey = 'ID';
  @Input() tableKey: string | undefined = undefined;
  @Input() apiUrl?: string;
  @Input() title: string | undefined = undefined;
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
  @Output() lazyLoadData = new EventEmitter<LazyLoadEvent>();

  // 資料狀態欄位
  @Input() dataStatusField: string | undefined;
  @Input() dataStatusValue = {
    Original: 'original',
    New: 'new',
    Modified: 'modified',
    Deleted: 'deleted',
  };

  // ======= 由父層注入的總計 / 小計資料與欄位對應 =======
  @Input() externalTotals?: Record<string, number>;
  @Input() externalTotalFieldMap?: Record<string, string>;
  @Input() externalSubtotals?: Record<string | number, Record<string, number>>;
  @Input() externalSubtotalFieldMap?: Record<string, string>;

  // ===== 內部旗標 =====
  private _skipFirstLazy = true;
  private _skipFirstCalc = true;

  /* ======================= 生命週期 ======================= */
  ngOnInit(): void {
    this.ensureInitialGroupingSort();

    this.columns = (this.columns || []).map((col) => ({
      ...col,
      headerRow: col.headerRow ?? 1,
    }));

    this.currentPageService.currentPageProgNo$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((progNo) => {
        this.funInfo = progNo
          ? this.authService.getUserPermissions(progNo)
          : undefined;
      });

    this.rows =
      this.queryStateService.getQueryState(this.tableKey + 'rows')?.value ?? this.rows;

    this.showSubTotal = this.showSubTotal
      ? this.showSubTotal
      : this.columns?.some((c) => c.isSubTotal) ?? false;

    this.showTotal = this.showTotal
      ? this.showTotal
      : this.columns?.some((c) => c.isTotal) ?? false;

    // 初始 selectedColumns（若有歷史紀錄就還原）
    const saved = this.queryStateService.getQueryState(this.tableKey + 'Filter')?.value as Column[] | undefined;
    this.selectedColumns = (saved?.length ? saved : this.columns || []).filter(c => c.visible !== false && c.hidden !== true);
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
      this.showTotal   = this.showTotal   ? this.showTotal   : this.columns.some(c => c.isTotal);

      const saved = this.queryStateService.getQueryState(this.tableKey + 'Filter')?.value as Column[] | undefined;
      this.selectedColumns = (saved?.length ? saved : this.columns).filter(c => c.visible !== false && c.hidden !== true);

      if (changes['columns'].firstChange) {
        setTimeout(() => {
          this.rows = this.queryStateService.getQueryState(this.tableKey + 'rows')?.value ?? this.rows;
          this.multiSortMeta = this.queryStateService.getQueryState(this.tableKey + 'Sort')?.value ?? this.multiSortMeta;
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
    this.pages = Array.from({ length: this.totalPages }, (_, index) => ({
      label: `第 ${index + 1} 頁`,
      value: index + 1,
    }));

    if (this._skipFirstCalc) {
      this._skipFirstCalc = false;
      this.cdr.detectChanges?.();
      return;
    }

    if (this.totalPages > 0 && this.selectedPage && this.selectedPage > this.totalPages) {
      this.goToPage(this.totalPages);
    }

    this.cdr.detectChanges?.();
  }

  goToPage(pageNumber: number) {
    this.first = (pageNumber - 1) * this.rows;
    this.selectedPage = pageNumber;
    this.lazyLoadData.emit({
      pageIndex: this.selectedPage,
      pageSize : this.rows,
      SortBy   : this.multiSortMeta,
    });
  }
// 供 template 呼叫：點「匯出excel範本」按鈕
onExportExcel(): void {
  this.exportExcel.emit();
}

// 供 template 呼叫：選取 Excel 檔案時
onImportExcel(event: FileSelectEvent): void {
  this.importExcel.emit(event);
  this.fileUpload?.clear(); // 清掉上次選取，避免同檔案無法再次觸發
}

  onPageChange(event: TablePageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.queryStateService.setQueryState(this.tableKey + 'rows', this.rows);
    this.selectedPage = Math.ceil(event.first / event.rows + 1);
    this.calculateTotalPages();
  }

  onSort(event: any) {
    const raw = event.multisortmeta ?? event.multiSortMeta ?? [];
    const next = this.ensureGroupFirst(raw);  // 群組欄位優先

    this.lazyLoadData.emit({
      pageIndex: this.selectedPage ?? 1,
      pageSize : this.rows,
      SortBy   : next,
    });
  }

  loadDataLazy(event: TableLazyLoadEvent) {
    if (this._skipFirstLazy) { this._skipFirstLazy = false; return; }

    const pageSize  = event.rows && event.rows > 0 ? event.rows : this.rows;
    const pageIndex = (event.first ?? 0) / pageSize + 1;

    const sortRaw = event.multiSortMeta
      ?? (event as any).multisortmeta
      ?? (event.sortField ? [{ field: event.sortField, order: event.sortOrder }] : []);
    const sort = this.ensureGroupFirst(sortRaw);

    this.lazyLoadData.emit({ pageIndex, pageSize, SortBy: sort });
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
    this.table2UtilityService.toggleRowExpansionLogic(
      rowData,
      this.dataKey,
      this.expansionDataKey,
      this.expansionLoadFn,
      this.expandedRows,
      this,
    );
  }

  toggleExpandCollapse() {
    this.expandedRows = this.expression
      ? {}
      : Object.fromEntries(
          this.data
            .filter((p) => (p as any)[this.expansionDataKey]?.length)
            .map((p) => [(p as any)[this.dataKey], true]),
        );
    this.expression = !this.expression;
  }

  /* ======================= 行/欄位邏輯 ======================= */
  trackByRow = (index: number, item: any) =>
    (item as any)?.[this.dataKey] || index;

  get getVisibleHeaderCount(): number {
    const visibleCount = (this.selectedColumns?.length ?? 0);
    return 1
      + Number(this.showCheckBox)
      + visibleCount
      + Number(this.showManage)
      + (this.expansionDataKey ? 1 : 0)
      + (this.showSubTotal || this.showTotal ? 0 : 1);
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

  onRowEditSave(
    rowData: any,
    ri: number,
    htmlTableRowElement: HTMLTableRowElement,
  ) {
    if (
      !validateRowData(
        rowData,
        this.columns,
        this.data,
        this.messageService,
        this.dataKey,
      )
    ) {
      return;
    }

    const rowId = (rowData as any)[this.dataKey];
    const oldData = this.clonedProducts[rowId];

    if (typeof rowId === 'string' && rowId.startsWith('temp-')) {
      const savedId = `saved-${Date.now()}`;
      (rowData as any)[this.dataKey] = savedId;
      this.clonedProducts[savedId] = { ...oldData };
      if (this.dataStatusField) {
        (rowData as any)[this.dataStatusField] = this.dataStatusValue.New;
      }
      delete this.clonedProducts[rowId];
    } else {
      if (this.dataStatusField) {
        (rowData as any)[this.dataStatusField] = this.dataStatusValue.Modified;
      }
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
    this.selectedItems = selected.filter((item: any) =>
      this.isRowSelectable(item),
    );
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

      if (this.dataStatusField) {
        newRowData[this.dataStatusField] = this.dataStatusValue.New;
      }

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
    if (!col.groupField || col.hidden === true || col.visible === false)
      return false;
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
    return (
      this.columnGroup?.find((g) => g.field === groupField)?.header ?? groupField
    );
  }

  getGroupAlignClass(groupField: string): string {
    const align = this.columnGroup?.find((g) => g.field === groupField)?.align;
    return align ? 'text-' + align : 'text-center';
  }

  getGroupSubtotal(groupValue: any, field: string): number {
    if (this.externalSubtotals && this.externalSubtotalFieldMap) {
      const apiKey = this.externalSubtotalFieldMap[field];
      const gKey = String(groupValue ?? '').trim();
      const bucket = this.externalSubtotals[gKey];
      if (apiKey && bucket && apiKey in bucket) return Number(bucket[apiKey] ?? 0);
    }
    // fallback：同頁即時小計
    const g = this.groupRowsByArray[0];
    const key = String(groupValue ?? '').trim();
    const rows = this.data.filter(r => String((r as any)[g] ?? '').trim() === key);
    return rows.reduce((s, r) => s + Number((r as any)[field] ?? 0), 0);
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

  // ====== 讓群組欄位排序優先 ======
  private ensureInitialGroupingSort() {
    const g = this.groupRowsByArray[0];
    if (!g) return;

    const rest = (this.multiSortMeta || []).filter(s => s.field !== g);
    this.multiSortMeta = [{ field: g, order: 1 }, ...rest];

    if (!this.lazy) {
      this.data = [...this.data];
    }
  }

  private ensureGroupFirst(sort: SortMeta[] | undefined): SortMeta[] {
    const g = this.groupRowsByArray[0];
    if (!g) return sort ?? [];
    const list = Array.isArray(sort) ? [...sort] : [];
    const exist = list.find(s => s.field === g);
    const rest  = list.filter(s => s.field !== g);
    const order = exist?.order ?? 1; // 預設 ASC
    return [{ field: g, order }, ...rest];
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

    // 序號
    colspan += 1;

    // 勾選
    if (this.IsPrint && this.showCheckBox && !this.rowEditing && this.selectionMode === 'multiple') {
      colspan += 1;
    }

    // 展開鍵
    if (this.expansionColumns.length && this.IsPrint) {
      colspan += 1;
    }

    // 非小計欄
    colspan += nonSubtotalCols;

    // 管理欄位不包含在這個 colspan（在 footer 最後會多補一格）
    return colspan;
  }

  /** 將 `groupRowsBy` 正規化為陣列供 p-table 使用 */
  get groupRowsByArray(): string[] {
    const g = this.groupRowsBy as any;
    return Array.isArray(g) ? g : (g ? [g] : []);
  }
}
