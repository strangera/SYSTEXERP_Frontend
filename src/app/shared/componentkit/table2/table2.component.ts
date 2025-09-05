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
import { NgIf, NgClass, NgFor } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms'; // ✅ 修正
import { ButtonModule } from 'primeng/button'; // ✅ 用 Module
import { DropdownModule } from 'primeng/dropdown';
import { RippleModule } from 'primeng/ripple'; // ✅ 用 Module
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { SkeletonModule } from 'primeng/skeleton';
import { TableExpansion2Component } from './table-expansion2/table-expansion2.component';
import { TableExport2Component } from './table-export2/table-export2.component';
import { BlockUIModule } from 'primeng/blockui';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { Table2UtilityService } from './table2-utility.service';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { NgStyle } from '@angular/common';
import { ImageModule } from 'primeng/image';
@Component({
  selector: 'app-table2',
  templateUrl: './table2.component.html',
  styleUrl: './table2.component.scss',
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
    // 👉 sanitizer / messageService / cdr 都沿用父類 BasicPrintData2Component 提供的成員
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
  @Input() groupRowsBy = '';
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

  // ======= 新增：由父層注入的總計 / 小計資料與欄位對應 =======
/**
 * 總計資料（來自 API），例如：
 * {
 *   Total_TXN_TotGUI: 35,
 *   Total_TXN_TotSaleAmt: 35,
 *   ...
 * }
 */
@Input() externalTotals?: Record<string, number>;

/**
 * 總計欄位對應：table 欄位 -> externalTotals 的 key
 * 例如：{ TXN_TotGUI: 'Total_TXN_TotGUI', TXN_TotSaleAmt: 'Total_TXN_TotSaleAmt' }
 */
@Input() externalTotalFieldMap?: Record<string, string>;

/**
 * 小計資料（來自 API），結構： groupValue -> (apiKey -> value)
 * 例如：
 * {
 *   "10": { "Sub_TXN_TotGUI": 100, "Sub_TXN_TotSaleAmt": 200 },
 *   "11": { "Sub_TXN_TotGUI": 50,  "Sub_TXN_TotSaleAmt": 70  }
 * }
 */
@Input() externalSubtotals?: Record<string | number, Record<string, number>>;

/**
 * 小計欄位對應：table 欄位 -> externalSubtotals[groupValue] 的 key
 * 例如：{ TXN_TotGUI: 'Sub_TXN_TotGUI', TXN_TotSaleAmt: 'Sub_TXN_TotSaleAmt' }
 */
@Input() externalSubtotalFieldMap?: Record<string, string>;

  /* ======================= 生命週期 ======================= */
  ngOnInit(): void {
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
      this.queryStateService.getQueryState(this.tableKey + 'rows')?.value ??
      this.rows;

    this.showSubTotal = this.showSubTotal
      ? this.showSubTotal
      : this.columns?.some((c) => c.isSubTotal) ?? false;

    this.showTotal = this.showTotal
      ? this.showTotal
      : this.columns?.some((c) => c.isTotal) ?? false;
       // ✅ 初始 selectedColumns（若有歷史紀錄就還原，否則用目前 columns 的可見欄）
  const saved = this.queryStateService.getQueryState(this.tableKey + 'Filter')?.value as Column[] | undefined;
  this.selectedColumns = (saved?.length ? saved : this.columns || []).filter(c => c.visible !== false && c.hidden !== true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.groupedDataCache.clear();
    if (changes['data']) {
      setTimeout(() => {
        this.dt.totalRecords =
          this.totalRecords !== 0 ? this.totalRecords : this.data.length;
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

  // ✅ 還原歷史或給預設
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

  // ⛳ 第一次不要自動 goToPage，避免一進頁就 emit
  if (this._skipFirstCalc) {
    this._skipFirstCalc = false;
    this.cdr.detectChanges?.();
    return;
  }

  // 之後只有在總頁數 > 0 且目前頁 > 總頁數時才修正頁碼（不 emit 第一次）
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
      pageSize: this.rows,
      SortBy: this.multiSortMeta,
    });
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
    // ✅ 不帶 index，符合你的 FieldChangeEvent
    this.fieldChange.emit({ rowData, field, value } as FieldChangeEvent);
  }

  onFieldBlur(rowData: any, field: string, value: any) {
    if (!this.alwaysEdit && !this.alwaysBlurValidate) return;
    // 如果有單欄驗證工具，可在這裡調用
    // this.table2UtilityService.validateSingleField(value, rowData, this.data, column, this.messageService);
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

  onExportExcel() { this.exportExcel.emit(); }
  onImportExcel(event: FileSelectEvent) {
    this.importExcel.emit(event);
    this.fileUpload?.clear();
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
      this.columnGroup?.find((g) => g.field === groupField)?.header ??
      groupField
    );
  }

  getGroupAlignClass(groupField: string): string {
    const align = this.columnGroup?.find((g) => g.field === groupField)?.align;
    return align ? 'text-' + align : 'text-center';
  }

getGroupSubtotal(groupValue: any, field: string): number {
  if (this.externalSubtotals && this.externalSubtotalFieldMap) {
    const apiKey = this.externalSubtotalFieldMap[field];
    const gKey = String(groupValue ?? '').trim();   // ← 加了 trim
    const bucket = this.externalSubtotals[gKey];
    if (apiKey && bucket && apiKey in bucket) return bucket[apiKey] ?? 0;
  }
  // fallback：同頁即時小計
  if (!this.groupedDataCache.has(groupValue)) {
    const key = String(groupValue ?? '').trim();    // ← 保守再 trim 一次
    const rows = this.data.filter(r => String((r as any)[this.groupRowsBy] ?? '').trim() === key);
    this.groupedDataCache.set(groupValue, rows);
  }
  return (this.groupedDataCache.get(groupValue) as any[]).reduce((s, r) => s + (r[field] || 0), 0);
}


getTotal(field: string): number {
  // 1) 外部總計
  if (this.externalTotals && this.externalTotalFieldMap) {
    const apiKey = this.externalTotalFieldMap[field];
    if (apiKey && apiKey in this.externalTotals) {
      return this.externalTotals[apiKey] ?? 0;
    }
  }
  // 2) 退回前端加總
  return this.data.reduce((sum, row) => sum + ((row as any)[field] || 0), 0);
}

  /* ======================= 欄位重排 / 圖片 ======================= */

  // ① 欄位拖拉後儲存排序（對應 template: (onColReorder)="onColReorder($event)"）
onColReorder(event: any /* TableColumnReorderEvent */) {
  this.columns = event.columns as Column[];
  // 你若是存「整組 columns」或「只存可見欄位」都可，這裡存整組
  this.queryStateService.setQueryState(this.tableKey + 'Filter', this.columns);
}
// ② 取得圖片（對應 template: [src]="getImage(row[col.field])" 之類）


  getImage(url: string): string | SafeUrl | undefined {
    return url;
  }

// 跳過「第一次」p-table 初始化時自動觸發的 onLazyLoad
private _skipFirstLazy = true;
private _skipFirstCalc = true;

// 如需保險，也幫父層沒做排序時把群組欄位塞到第一順位
private ensureGroupFirst(sort: SortMeta[] | undefined): SortMeta[] {
  const g = this.groupRowsBy;
  if (!g) return sort ?? [];
  const list = Array.isArray(sort) ? [...sort] : [];
  const exist = list.find(s => s.field === g);
  const rest  = list.filter(s => s.field !== g);
  const order = exist?.order ?? 1; // 沒指定就 ASC
  return [{ field: g, order }, ...rest];
}
}
