/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PrimeTemplate, SortMeta } from 'primeng/api';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { Button, ButtonDirective } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { Ripple } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableLazyLoadEvent, TableModule, TablePageEvent, TableRowSelectEvent, TableRowUnSelectEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { CurrentPageService } from '../../../layout/app.menulist/current-page.service';
import { NotificationService } from '../../component/notification-message/notification.service';
import { BasicPrintDataComponent } from '../../componentextends/basic-print/basic-print-data.component';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { QueryStateService } from '../../service/query-state.service';
import { TableExpansionComponent } from './table-expansion/table-expansion.component';
import { TableExportComponent } from './table-export/table-export.component';
import { AddButton, Column, ColumnGroup, FieldChangeEvent, LazyLoadEvent, RowEditSaveEvent, toggleButtons, validateRowData } from './table.model';
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  animations: [toggleButtons],
  standalone: true,
  imports: [
    NgIf,
    DividerModule,
    TableModule,
    PrimeTemplate,
    MultiSelectModule,
    TooltipModule,
    FormsModule,
    Button,
    NgClass,
    ButtonDirective,
    FileUploadModule,
    DropdownModule,
    NgFor,
    Ripple,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    CheckboxModule,
    NgStyle,
    SkeletonModule,
    TableExpansionComponent,
    TableExportComponent,
    AutoCompleteModule
  ],
})
export class TableComponent extends BasicPrintDataComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('dt', { static: false }) dt!: Table;                               // table 元件
  @ViewChild('fileUpload') fileUpload!: FileUpload;                             // 檔案上傳 元件
  // 基本設置
  @Input() dataKey = 'ID';                                                      // table 資料key
  @Input() tableKey: string | undefined = undefined;                            // table 唯一標識 (必填)
  @Input() apiUrl?: string;                                                     // table API URL (可選)
  @Input() title: string | undefined = undefined;                               // table 標題
  @Input() columns!: Column[];                                                  // table 欄位配置 (必填)
  originalColumns!: Column[];                                                   // table 原始欄位
  selectedColumns!: Column[];                                                   // table 預設顯示欄位
  @Input() data: any[] = [];                                                    // table 資料 (必填)
  @Output() dataChange = new EventEmitter<any[]>();                             // table 資料改變 (事件)
  @Input() loading = false;                                                     // 是否顯示 loading
  @Input() disabled = false;                                                    // 是否禁用 table
  // select 選擇Row相關
  @Input() showCheckBox = false;                                                // 是否顯示 checkbox
  @Input() selectionMode: 'multiple' | 'single' | null | undefined = 'multiple';// table 勾選 Mode (預設多選)
  @Input() selectedItems: any = [];                                             // table 已勾選資料
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true; // 可選擇(條件)
  @Output() select = new EventEmitter<TableRowSelectEvent>();                   // 資料勾選(事件)
  @Output() unSelect = new EventEmitter<TableRowUnSelectEvent>();               // 資料取消勾選(事件)
  @Output() selectionChange = new EventEmitter<any>();                          // 資料變更(事件)
  @Output() itemClick = new EventEmitter<any>();                                // row資料點選(事件)
  // Header 相關
  @Input() showCaption = true;                                                  // 是否顯示 Caption
  // Header(左) 相關
  @Input() showHeader = true;                 // 是否顯示 Header
  @Input() showFilter = true;                 // 是否顯示 Filter
  @Input() showReportMode = true;             // 是否顯示 匯出按鈕
  @Input() showInsert = false;                // 是否顯示 Insert新增按鈕
  @Output() insert = new EventEmitter<any>(); // 新增事件
  @Input() insertDisabled = false;            // 新增按鈕是否禁用
  @Input() deleteData = false;                // 預先刪除資料 (關聯：需要加入dataKey, dataChange)
  @Output() delete = new EventEmitter<any>(); // 刪除事件
  @Input() showDelete = true;                    // 是否顯示刪除按鈕
  @Input() deleteIcon = 'pi pi-trash';          // 刪除按鈕圖示
  // Header(右) 相關
  @Input() showExcel = false;                      // 是否顯示 匯出Excel
  @Input() showExcelExport = true;                 // 是否顯示 匯出Excel按鈕
  @Input() showExcelImport = true;                 // 是否顯示 匯入Excel按鈕
  @Output() exportExcel = new EventEmitter<any>(); // 匯出 Excel 事件
  @Input() exportExcelLoading = false;             // 匯出 Excel loading
  @Output() importExcel = new EventEmitter<FileSelectEvent>(); // 匯入 Excel 事件
  @Input() showPage = true;                        // 是否顯示 下拉選單分頁器
  // Sort 相關
  @Input() showSort = true;                                                     // 是否顯示排序
  @Input() multiSortMeta: SortMeta[] = [{ field: this.dataKey, order: 1 }];     // table 排序依據 (多重排序 {field欄位、order排序方向} )
  // 欄位群組
  @Input() columnGroup?: ColumnGroup[];                                         // table 群組欄位
  // 資料小計
  @Input() groupRowsBy = '';                                                    // table 群組資料
  groupedDataCache = new Map();                                                 // 用於緩存已分組的數據
  @Input() showSubTotal = false;                                                // 是否顯示群組小計
  // 資料總計
  @Input() showTotal = false;                                                   // 是否顯示總計
  // rowEdit 相關
  @Input() showRowEdit = false;                                                 // 是否顯示 Row編輯按鈕
  @Input() rowEditing = false;                                                  // 是否正在編輯Row
  clonedProducts: Record<string, any> = {};                                     // 儲存編輯前資料
  @Output() rowEditInit = new EventEmitter<any>();                              // Row 編輯初始化事件
  @Output() rowEditSave = new EventEmitter<RowEditSaveEvent>();                 // Row 編輯保存事件
  @Output() rowEditCancel = new EventEmitter<any>();                            // Row 編輯取消事件
  @Input() rowEditDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  @Input() alwaysEdit = false;                                                  // 是否總是編輯
  @Input() alwaysBlurValidate = false;                                         // 是否總是驗證欄位 (true:總是驗證、false:只在送出時驗證)
  @Input() insertRowData = false;             // 預設新增模式 (關聯：需要加入dataKey, dataChange)
  @Input() defaultInsertData: any = {};       // 預設新增資料 (可選，預設為所有資料為null)
  // expansion 收合展開
  @Input() expansionColumns: Column[] = [];  // 收合展開 欄位配置(expansion必需配置)
  @Input() expansionDataKey = '';            // 收合展開 資料key(expansion必需配置)
  @Input() expansionSortField = '';          // 收合展開 排序欄位(單一排序)
  @Input() expansionSortOrder = 0;           // 收合展開 排序方向 (1:升序、-1:降序)
  expression = false;                        // 收合展開 狀態 (true:展開、false:收合)
  expandedRows: Record<string, boolean> = {};// 收合展開 已展開資料
  // 管理 欄位
  @Input() showManage = true;                // 是否顯示 管理欄位
  @Input() showDetail = true;                // 是否顯示 管理欄位(明細按鈕)
  @Output() detail = new EventEmitter<any>();// 明細事件
  @Input() showEdit = true;                  // 是否顯示 管理欄位(編輯按鈕)
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  @Output() edit = new EventEmitter<any>();  // 編輯事件
  @Input() addButton: AddButton[] = [];      // 自定義 管理按鈕
  @Input() buttonsLoading = false;           // 按鈕們 loading
  // body
  @Output() fieldChange = new EventEmitter<FieldChangeEvent>(); // input 變更事件
  @Output() selectButton = new EventEmitter<any>();             // 選擇 按鈕事件
  @Output() filterChange = new EventEmitter<{ rowData: any, value: string; }>(); // autoComplete 過濾事件
  // Footer
  @Input() showFooter = false;                      // 是否顯示 Footer
  // 分頁器
  @Input() scrollHeight = '400px';                  // table 高度
  @Input() scrollable = true;                        // 是否要滾輪
  @Input() showPaginator = true;                    // 是否顯示 分頁器
  @Input() totalRecords = 0;                        // 記錄總數
  totalPages = 0;                                   // 共幾頁數
  rows = 10;                                         // 每頁顯示的行數
  first = 0;                                        // 當前表格的起始索引
  pages: { label: string, value: number; }[] = [];   // (右上)下拉選單 頁數選項
  selectedPage: number | null = 1;                  // (右上)下拉選單 當前選擇的頁數
  @Input() lazy = false;                                      // 是否啟用 Lazy 加載
  @Output() lazyLoadData = new EventEmitter<LazyLoadEvent>(); // Lazy 加載事件
  // 其他
  @Input() emptyMessage = '查無資料';                // table 無資料時顯示文字
  // 權限
  private ngUnsubscribe = new Subject<void>();
  public funInfo: FunsrightInfo | undefined;

  public showClear = (col: Column): boolean => {
    if (typeof col?.optionShowClear === 'boolean') return col.optionShowClear;
    return true;
  };

  constructor(
    private readonly queryStateService: QueryStateService,
    private readonly messageService: NotificationService,
    private readonly currentPageService: CurrentPageService,
    private sanitizer: DomSanitizer
  ) { super(); }
  ngOnInit(): void {
    this.currentPageService.currentPageProgNo$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(progNo => {
      if (progNo) {
        this.funInfo = this.authService.getUserPermissions(progNo);
      } else {
        this.funInfo = undefined;
      }
    });
    this.rows = this.queryStateService.getQueryState(this.tableKey + 'rows')?.value ?? this.rows; // 取得分頁狀態
    this.showSubTotal = this.showSubTotal ? this.showSubTotal : this.columns.find(c => c.isSubTotal) !== undefined;
    this.showTotal = this.showTotal ? this.showTotal : this.columns.find(c => c.isTotal) !== undefined;
  }
  // 當 data 發生變化時，重置分頁與頁碼
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      setTimeout(() => {
        const dataLength = this.totalRecords !== 0 ? this.totalRecords : this.data.length;
        if (dataLength > 0) {
          this.calculateTotalPages(); // 計算總頁數
        } else {
          this.dt.totalRecords = 0;
        }
        this.selectionChange.emit(this.selectedItems);
      });
    }
    if (changes['columns']) {
      this.originalColumns = this.columns;
      this.columns = this.columns.filter(col => !col.hidden);
      this.multiSortMeta = this.queryStateService.getQueryState(this.tableKey + 'Sort')?.value ?? this.multiSortMeta; // 取得排序歷史紀錄
      this.selectedColumns = this.queryStateService.getQueryState(this.tableKey + 'Filter')?.value ?? this.columns.filter(col => col.visible !== false); // 取得顯示欄位
    }
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  // 計算總頁數並生成頁面選項
  calculateTotalPages() {
    this.dt.totalRecords = this.totalRecords !== 0 ? this.totalRecords : this.data.length;
    this.totalPages = Math.ceil(this.dt.totalRecords / this.rows);
    this.pages = Array.from({ length: this.totalPages }, (_, index) => ({ label: `第 ${index + 1} 頁`, value: index + 1 }));
    // 若當前頁數超過最大頁數，則移動到最大頁數，但至少為 1
    if (this.selectedPage && this.selectedPage > this.totalPages) { this.goToPage(Math.max(this.totalPages, 1)); }
    this.cdr.detectChanges(); // 在计算完所有页面信息后，通知 Angular 更新 UI
  }
  // 右上dropdown 跳轉頁數
  goToPage(pageNumber: number) {
    this.first = (pageNumber - 1) * this.rows; // 計算起始索引
    this.selectedPage = pageNumber; // 更新選擇的頁數
    this.lazyLoadData.emit({ pageIndex: this.selectedPage, pageSize: this.rows, SortBy: this.multiSortMeta });
  }
  // Table內建 分頁器變動
  onPageChange(event: TablePageEvent) {
    this.first = event.first;   // 更新當前起始索引
    this.rows = event.rows;     // 更新每頁行數
    this.queryStateService.setQueryState(this.tableKey + 'rows', this.rows); // 保存分頁狀態
    this.selectedPage = Math.ceil((event.first / event.rows) + 1); // 更新下拉選單中的頁碼
    this.calculateTotalPages();
  }
  onSort(event: any) {
    this.multiSortMeta = event.multisortmeta;
    this.queryStateService.setQueryState(this.tableKey + 'Sort', this.multiSortMeta);
  }
  loadDataLazy(event: TableLazyLoadEvent) {
    setTimeout(() => {
      if (this.totalRecords === 0) { return; }
      const pageSize = event.rows && event.rows > 0 ? event.rows : 30;
      const pageIndex = (event.first ?? 0) / pageSize + 1;
      const SortBy = event.multiSortMeta ?? [{ field: this.dataKey, order: 1 }];
      this.lazyLoadData.emit({ pageIndex, pageSize, SortBy });
    });
  }
  /* =================================核心程式碼======================================= */
  // 行追蹤
  trackByRow = (index: number, item: any) => { return item?.[this.dataKey] || index; };
  // 計算欄位總數(包含序號、勾選、管理、展開)
  get getVisibleHeaderCount(): number { return 1 + Number(this.showCheckBox) + this.selectedColumns.length + Number(this.showManage) + (this.expansionDataKey ? 1 : 0); }
  // 行是否可選
  rowSelectableWrapper = ({ data }: { data: any, index: number; }): boolean | undefined => { return this.isRowSelectable(data) && !this.rowEditing; };
  // 展開所有 符合的row
  toggleExpandCollapse() {
    this.expandedRows = this.expression ? {} : Object.fromEntries(this.data.filter(p => p[this.expansionDataKey]?.length).map(p => [p[this.dataKey], true]));
    this.expression = !this.expression;
  }
  // 過濾欄位記錄保存
  onFilterChange(event: any) {
    this.columns = this.columns.map(col => ({
      ...col,
      visible: event.value.some((ev: any) => ev.field === col.field),
    }));
    this.selectedColumns = this.columns.filter(col => col.visible !== false);
    this.queryStateService.setQueryState(this.tableKey + 'Filter', this.selectedColumns);
  }
  // 行編輯初始化
  onRowEditInit(rowData: any) {
    this.dt.initRowEdit(rowData);   // 初始化編輯
    this.clonedProducts[rowData[this.dataKey]] = { ...rowData }; // 儲存原始數據
    this.rowEditing = true;         // 开启编辑模式
    this.rowEditInit.emit(rowData); // 發射事件
    this.selectedItems = [];
    this.selectionChange.emit(this.selectedItems);
  }
  // 行編輯保存
  onRowEditSave(rowData: any, ri: number, htmlTableRowElement: HTMLTableRowElement) {
    // 在 alwaysEdit 和 alwaysBlurValidate 模式下，跳過驗證因為已在失去焦點時驗證過
    if (!this.alwaysEdit && !this.alwaysBlurValidate && !validateRowData(rowData, this.columns, this.data, this.messageService, this.dataKey)) return; // 如果驗證不通過，返回
    const oldData = this.clonedProducts[rowData[this.dataKey]]; // 儲存原始數據
    delete this.clonedProducts[rowData[this.dataKey]]; // 刪除原始數據
    this.rowEditing = false; // 關閉編輯模式
    this.dt.saveRowEdit(rowData, htmlTableRowElement ?? null); // 手動保存編輯狀態
    this.rowEditSave.emit({ oldData, newData: rowData, ri, data: this.data }); // 發射事件
    this.dataChange.emit(this.data);
  }
  // 行編輯取消
  onRowEditCancel(rowData: any, ri: number) {
    const originalRowData = this.clonedProducts[rowData[this.dataKey]];

    // 檢查除了 dataKey 以外的所有欄位是否都為 null/undefined/空字串
    const otherColumns = this.columns.filter(col => col.field !== this.dataKey);
    const allOtherFieldsAreEmptyInOriginal = originalRowData && otherColumns.every(col => {
      const value = originalRowData[col.field];
      return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
    });
    if (allOtherFieldsAreEmptyInOriginal) {
      // 如果原始資料除了 dataKey 以外都是空的，則直接從數據中刪除該行
      this.data = this.data.filter(item => item[this.dataKey] !== rowData[this.dataKey]);
    } else {
      // 否則，恢復到原始資料
      this.data[ri] = originalRowData;
      this.data = [...this.data]; // 觸發 Angular 變更檢測
    }
    this.dataChange.emit(this.data);
    delete this.clonedProducts[rowData[this.dataKey]]; // 刪除儲存的原始數據
    this.rowEditing = false; // 關閉編輯模式
    this.dt.cancelRowEdit(rowData); // 手動取消編輯狀態 (PrimeNG Table 內部狀態)
    this.rowEditCancel.emit({ data: this.data, rowData, ri }); // 發射事件
    this.cdr.detectChanges(); // 強制檢測變更，確保 UI 更新
  }
  // 資料勾選
  onSelectionChange(event: any) {
    const selected = Array.isArray(event) ? event : event ? [event] : [];
    this.selectedItems = selected.filter((item: any) => this.isRowSelectable(item));
    this.selectionChange.emit(this.selectedItems);
  }
  // (欄位是Dropdown使用): 獲取Dropdown的選項，支持function加入或直接給List
  getOptions(rowData: any, col: Column) { return typeof col.options === 'function' ? (col.options(rowData) || undefined) : col.options || undefined; }
  // autoComplete觸發事件
  filterOptions(event: AutoCompleteCompleteEvent) {
    this.filterChange.emit({ rowData: event.originalEvent, value: event.query });
  }
  // (欄位是Input、Dropdown使用): 處理值變化事件
  onFieldChange(rowData: any, field: string, value: any, index?: number) { this.fieldChange.emit({ rowData, field, value, index }); }

  // 處理失去焦點時的驗證 (alwaysEdit 模式專用)
  onFieldBlur(rowData: any, field: string, value: any) {
    if (!this.alwaysEdit && !this.alwaysBlurValidate) return; // 只在 alwaysEdit 和 alwaysBlurValidate 模式下執行

    const column = this.columns.find(col => col.field === field);
    if (column?.validate) {
      const hasValidationError = column.validate.some(validateFn => {
        const { isValid, errorMessage } = validateFn(value, rowData, this.data, field, column.header);
        if (!isValid) {
          const [message, title] = errorMessage;
          this.messageService.errorBubble(message, title);
        }
        return !isValid;
      });

      if (!hasValidationError) {
        console.log(`欄位 ${column.header} 驗證通過`);
      }
    }
  }
  // 事件類型 (有需求可使用)
  editRow(rowData: any) { this.edit.emit(rowData); }                // Edit 按鈕 事件
  detailRow(rowData: any) { this.detail.emit(rowData); }            // Detail 或 雙擊行 事件
  onSelectButton(rowData: any) { this.selectButton.emit(rowData); } // 欄位Button 選擇 事件
  // Insert 按鈕
  insertRow() {
    if (this.insertRowData) {
      this.rowEditing = true;
      this.multiSortMeta = [{ field: this.dataKey, order: 0 }];
      const newRowData: Record<string, any> = {};
      this.originalColumns.forEach(col => {
        newRowData[col.field] = this.defaultInsertData[col.field] !== undefined
          ? this.defaultInsertData[col.field] : null;
      });
      newRowData[this.dataKey] = new Date().getTime();
      this.data = [newRowData, ...this.data];
      console.log(this.data);
      this.dataChange.emit(this.data);
      this.onRowEditInit(newRowData);
    } else {
      this.insert.emit();
    }
  }
  // Delete 按鈕
  deleteRow(selectedItems: any) {
    this.delete.emit(selectedItems);
    if (this.deleteData) {
      this.data = this.data.filter(item => !selectedItems.includes(item));
      this.dataChange.emit(this.data);
      this.selectedItems = [];
    }
    this.selectedItems = [];
  }
  onExportExcel() { this.exportExcel.emit(); }                      // 匯出Excel範本 事件
  onImportExcel(event: FileSelectEvent) {                           // 匯入Excel
    this.importExcel.emit(event);
    this.fileUpload.clear();
  }
  // 權限
  canPerformAction(action: string): boolean {
    return this.funInfo?.PrivilegeBehavior?.some(behavior => behavior.function_code === action) || false;
  }
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  getColumnSpan(columns: Column[], groupField: string): number {
    return columns.filter(col => col.groupField === groupField && col.visible !== false && col.hidden !== true).length;
  }

  getUngroupedColumns(columns: Column[], columnGroup: ColumnGroup[]): Column[] {
    const groupFields = columnGroup.map(g => g.field);
    return columns.filter(
      col =>
        (!col.groupField || !groupFields.includes(col.groupField)) &&
        col.visible !== false &&
        col.hidden !== true
    );
  }
  shouldRenderGroupHeader(col: Column, index: number, columns: Column[]): boolean {
    if (!col.groupField || col.hidden === true || col.visible === false) return false;
    const currentGroup = col.groupField;
    for (let i = 0; i < index; i++) {
      const prev = columns[i]; // ✅ 只看這次 ngFor 的欄位
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
    return this.columnGroup?.find(g => g.field === groupField)?.header ?? groupField;
  }
  getGroupAlignClass(groupField: string): string {
    const align = this.columnGroup?.find(g => g.field === groupField)?.align;
    return align ? 'text-' + align : 'text-center';
  }
  getGroupSubtotal(groupValue: any, field: string): number {
    if (!this.groupedDataCache.has(groupValue)) {
      const rows = this.data.filter(item => item[this.groupRowsBy] === groupValue);
      this.groupedDataCache.set(groupValue, rows);
    }
    return this.groupedDataCache.get(groupValue).reduce((sum: number, row: any) => sum + (row[field] || 0), 0);
  }
  // 全表總計
  getTotal(field: string): number {
    return this.data.reduce((sum, row) => sum + (row[field] || 0), 0);
  }
}
