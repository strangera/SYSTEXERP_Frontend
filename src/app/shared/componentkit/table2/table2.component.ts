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
import { TableCaptionComponent } from '../table/table-caption/table-caption.component';

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
    TableCaptionComponent,
    // Angular
    FormsModule,

    ImageModule
  ],
})
export class Table2Component
  extends BasicPrintData2Component
  implements OnInit, OnChanges, OnDestroy
{

  private t2log(label: string, payload?: any) {
  // 用 console.groupCollapsed 比較好讀；要展開就點一下
  if (payload !== undefined) {
    console.groupCollapsed(`[Table2] ${label}`);
    console.log(payload);
    console.groupEnd();
  } else {
    console.log(`[Table2] ${label}`);
  }
}
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
     this.t2log('ngOnInit.done', { multiSortMeta: this.multiSortMeta });

     this.t2log('SUBTOTAL#1 init checkpoint', {
  groupRowsByArray: this.groupRowsByArray,                                  // 有沒有真的在分組
  subtotalCols: (this.selectedColumns || [])
                  .filter(c => c.isSubTotal && c.hidden !== true && c.visible !== false)
                  .map(c => c.field),                                        // 有沒有標 isSubTotal 的可見欄位
  externalSubtotalsCount: this.externalSubtotals ? Object.keys(this.externalSubtotals).length : 0,
  hasExternalSubtotalMap: !!this.externalSubtotals,                          // 你是不是有塞外部小計物件
  showSubTotalInput: this.showSubTotal,                                      // 你有沒有打算顯示小計（目前模板不檢查，但先看旗標）
  columnsTotal: this.columns?.length ?? 0,
  selectedColumnsTotal: this.selectedColumns?.length ?? 0
});
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
// table2.component.ts
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

  // ✅ 直接夾住頁碼並改 first，讓 p-table 自己觸發 onLazyLoad；不要呼叫 goToPage()
  if (this.totalPages > 0 && this.selectedPage && this.selectedPage > this.totalPages) {
    this.selectedPage = this.totalPages;
    this.first = (this.totalPages - 1) * this.rows;
    this.cdr.detectChanges?.();
    return;
  }

  this.cdr.detectChanges?.();
}
// 新增一個旗標
private _suppressNextLazy = false;



// ✅ 用下拉切頁
goToPage(pageNumber: number) {
  const newFirst = (pageNumber - 1) * this.rows;
  if (this.first === newFirst && this.selectedPage === pageNumber) return;

  // 先標記：下一個由 p-table 觸發的 onLazyLoad 要忽略
  this._suppressNextLazy = true;

  // 換頁位移
  this.first = newFirst;
  this.selectedPage = pageNumber;

  // 只手動送一次給父層，避免跟 p-table 的 onLazyLoad 重複
  const sort = this.ensureGroupFirst(this.multiSortMeta);
  this.lazyLoadData.emit({
    pageIndex: this.selectedPage ?? 1,
    pageSize : this.rows,
    SortBy   : sort,
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

  // 若是剛剛程式改 first 造成的 echo，直接吞掉一次
  if (this._suppressNextLazy) {
    this._suppressNextLazy = false;
    return;
  }

  const pageSize  = event.rows && event.rows > 0 ? event.rows : this.rows;
  const pageIndex = (event.first ?? 0) / pageSize + 1;

  const sortRaw = event.multiSortMeta
    ?? (event as any).multisortmeta
    ?? (event.sortField ? [{ field: event.sortField, order: event.sortOrder }] : []);
  const sort = this.ensureGroupFirst(sortRaw);

  this.selectedPage = pageIndex;
  this.queryStateService.setQueryState(this.tableKey + 'Sort', sort);
  this.dt.totalRecords = this.totalRecords !== 0 ? this.totalRecords : this.data.length;

  // 這裡才真正打 API（交給父層）
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

  // 新增：把目前群組列的 key（多鍵）組成同一字串
getGroupKeyFromRow(row: any): string {
  const fields = this.groupRowsByArray;
  if (!fields.length) return '';
  return fields.map(f => String((row ?? {})[f] ?? '')).join('|');
}
// 取小計：先找外部小計（externalSubtotals），找不到就用同頁加總
getGroupSubtotal(rowData: any, field: string): number {
  const groupKey = this.getGroupKeyFromRow(rowData);

  // 1) 外部小計（例如父層只塞「群組真正結束」的那幾組）
  if (this.externalSubtotals && this.externalSubtotalFieldMap) {
    const apiKey = this.externalSubtotalFieldMap[field];
    const bucket = groupKey ? this.externalSubtotals[groupKey] : undefined;
    if (apiKey && bucket && apiKey in bucket) return Number(bucket[apiKey] ?? 0);
  }

  // 2) fallback：同頁即時計算（多鍵完全比對）
  const rows = this.data.filter(r =>
    this.groupRowsByArray.every(f => String((r as any)[f] ?? '') === String((rowData as any)[f] ?? ''))
  );
  return rows.reduce((s, r) => s + Number((r as any)[field] ?? 0), 0);
}
// 只有在「外部小計有給到這組 key」時才渲染小計列（用來達成跨頁只在群組真正結束時顯示）
shouldRenderGroupFooter(rowData: any): boolean {
  const key = this.getGroupKeyFromRow(rowData);
  const usingExternal = !!this.externalSubtotals && Object.keys(this.externalSubtotals).length > 0;
  const hasBucket = usingExternal ? !!this.externalSubtotals?.[key] : true;

  this.t2log('SUBTOTAL#2 footer gate', {
    key,
    usingExternal,
    hasBucket,
    rowGroupValues: this.groupRowsByArray.map(f => `${f}=${(rowData ?? {})[f]}`)
  });

  if (usingExternal) return !!this.externalSubtotals?.[key];
  return true;
}
// 原本只處理第一個群組欄位，改成全部群組欄位都置前
// 放在 class 內
tmplPing(tag: string, extra?: any) {
  this.t2log(tag, extra);
  return true; // 讓它可用在 *ngIf 的邏輯鏈
}


}
