/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SortMeta } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { FileSelectEvent } from 'primeng/fileupload';
import { MultiSelectChangeEvent } from 'primeng/multiselect';
import { Table, TableColumnReorderEvent, TableLazyLoadEvent, TablePageEvent, TableRowSelectEvent, TableRowUnSelectEvent } from 'primeng/table';
import { Observable } from 'rxjs';
import { BasicPrintDataComponent } from '../../componentextends/basic-print/basic-print-data.component';
import { AddButton, Column, ColumnGroup, FieldChangeEvent, LazyLoadEvent, RowEditSaveEvent } from '../table/table.model';
import { COMMON_IMPORTS } from '../table/import-table';
import { TableUtilityService } from '../table/table-utility.service';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-customFooter-table',
  templateUrl: './customFooterTable.component.html',
  styleUrl: './customFooterTable.component.scss',
  standalone: true,
  imports: [COMMON_IMPORTS],
})
export class CustomFooterTableComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt', { static: false }) dt!: Table;                               // table 元件
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
  @Output() selectionChange = new EventEmitter<any>();                          // 資料變更(事件)
  @Output() select = new EventEmitter<TableRowSelectEvent>();                   // 資料勾選(事件)
  @Output() unSelect = new EventEmitter<TableRowUnSelectEvent>();               // 資料取消勾選(事件)
  @Output() itemClick = new EventEmitter<any>();                                // 資料點選(事件)
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
  @Input() deletepTooltip = '刪除';              // 刪除按鈕提示
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
  @Input() insertRowData = false;                   // 預設新增模式 (關聯：需要加入dataKey, dataChange)
  @Input() defaultInsertData: any = {};             // 預設新增資料 (可選，預設為所有資料為null)
  @Input() dataStatusField: string | undefined;     // 資料狀態 (如果有值增加狀態欄位；如果沒有值不增加狀態欄位)
  @Input() dataStatusValue = {                      // 預設 original/new/modified/deleted (可選)
    Original: 'original',
    New: 'new',
    Modified: 'modified',
    Deleted: 'deleted'
  };
  // expansion 收合展開
  @Input() expansionColumns: Column[] = [];  // 收合展開 欄位配置(expansion必需配置)
  @Input() expansionDataKey = 'details';            // 收合展開 資料key(expansion必需配置)
  @Input() expansionMultiSortMeta = [{ field: this.expansionDataKey, order: 1 }];// 收合展開 排序欄位(單一排序)
  @Input() expansionShowPaginator = false;   // expansion 是否顯示分頁器
  @Input() expansionRows = 10;               // expansion 每頁顯示行數
  @Input() expansionRowsPerPageOptions = [10, 30, 50]; // expansion 分頁選項
  @Input() expansionScrollHeight = '300px';  // expansion 表格高度
  @Input() expansionLoadFn?: (rowData: any) => Observable<any>; // 屬性來接收父層傳來的載入函數
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
  @Input() footerData: any[] = [];                  // 自定義 Footer 資料

  // 分頁器
  @Input() scrollHeight = '650px';                  // table 高度
  @Input() scrollable = true;                        // 是否要滾輪
  @Input() showPaginator = true;                    // 是否顯示 分頁器
  @Input() totalRecords = 0;                        // 記錄總數
  @Input() rowsPerPageOptions: any[] | undefined = [10, 30, 50];// 分頁選項
  totalPages = 0;                                   // 共幾頁數
  @Input() rows = 10;                                         // 每頁顯示的行數
  first = 0;                                        // 當前表格的起始索引
  pages: { label: string, value: number; }[] = [];   // (右上)下拉選單 頁數選項
  selectedPage: number | null = 1;                  // (右上)下拉選單 當前選擇的頁數
  @Input() lazy = false;                                      // 是否啟用 Lazy 加載
  @Output() lazyLoadData = new EventEmitter<LazyLoadEvent>(); // Lazy 加載事件
  // 其他
  @Input() emptyMessage = '查無資料';                // table 無資料時顯示文字

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly tableUtilityService: TableUtilityService
  ) { super(); }
  // 當 data 發生變化時，重置分頁與頁碼
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      setTimeout(() => {
        this.dt.totalRecords = this.totalRecords !== 0 ? this.totalRecords : this.data.length;
        this.selectedItems = []
        this.selectionChange.emit(this.selectedItems);
      });
    }
    // 僅在 columns 首次被設定時執行初始化邏輯// 這樣就不會在每次 data 變動時都重置 filter 狀態
    if (changes['columns'] && this.columns.length > 0) {
      this.originalColumns = this.columns;
      this.showSubTotal = this.showSubTotal ? this.showSubTotal : this.columns.find(c => c.isSubTotal) !== undefined;
      this.showTotal = this.showTotal ? this.showTotal : this.columns.find(c => c.isTotal) !== undefined;
      if (changes['columns'].firstChange) {
        setTimeout(() => {// 恢復歷史紀錄，如果沒有就使用預設值
          this.rows = this.queryState.getQueryState(this.tableKey + 'rows')?.value ?? this.rows; // 取得分頁狀態
          this.multiSortMeta = this.queryState.getQueryState(this.tableKey + 'Sort')?.value ?? this.multiSortMeta;
        }, 300);
      }
    }
  }
  // 右上dropdown 跳轉頁數
  goToPage(pageNumber: number) {
    this.first = (pageNumber - 1) * this.rows; // 計算起始索引
    this.selectedPage = pageNumber; // 更新選擇的頁數
    this.lazyLoadData.emit({ pageIndex: this.selectedPage, pageSize: this.rows, SortBy: this.multiSortMeta });
  }
  // Table內建 分頁器變動
  onPageChange(event: TablePageEvent) {
    this.queryState.setQueryState(this.tableKey + 'rows', this.rows); // 保存分頁狀態
    this.selectedPage = Math.ceil((event.first / event.rows) + 1); // 更新下拉選單中的頁碼
    this.dt.totalRecords = this.totalRecords !== 0 ? this.totalRecords : this.data.length;
  }
  loadDataLazy(event: TableLazyLoadEvent) {
    if (this.totalRecords === 0 || !this.IsPrint || this.rowEditing) { return; }
    const pageSize = event.rows && event.rows > 0 ? event.rows : 30;
    const pageIndex = (event.first ?? 0) / pageSize + 1;
    this.selectedPage = pageIndex;
    this.multiSortMeta = event.multiSortMeta ?? [{ field: this.dataKey, order: 1 }];
    this.queryState.setQueryState(this.tableKey + 'Sort', this.multiSortMeta);
    this.lazyLoadData.emit({ pageIndex, pageSize, SortBy: this.multiSortMeta });
  }
  // 行追蹤
  trackByRow = (index: number, item: any) => { return item?.[this.dataKey] || index; };
  // 計算欄位總數(包含序號、勾選、管理、展開)
  get getVisibleHeaderCount(): number {
    const visibleColumnCount = this.tableUtilityService.getVisibleColumnCount(this.selectedColumns);
    return 1 + Number(this.showCheckBox) + visibleColumnCount + Number(this.showManage) + (this.expansionDataKey ? 1 : 0) + (this.showSubTotal || this.showTotal ? 0 : 1);
  }
  // 行是否可選
  rowSelectableWrapper = ({ data }: { data: any, index: number; }): boolean | undefined => { return this.isRowSelectable(data) && !this.rowEditing; };
  // 切換行展開
  toggleRowExpansion(rowData: any) {
    this.tableUtilityService.toggleRowExpansionLogic(rowData, this.dataKey, this.expansionDataKey, this.expansionLoadFn, this.expandedRows, this);
  }
  // 過濾欄位記錄保存
  onFilterChange(event: MultiSelectChangeEvent) {
    this.columns.forEach(col => {
      col.visible = event.value.some((ev: any) => ev.field === col.field);
    });
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
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
    if (this.insertRowData && this.tableUtilityService.isNewRowUnchanged(rowData, this.columns, this.dataKey, this.defaultInsertData)) {
      this.messageService.errorBubble('請輸入至少一個欄位的值', '未輸入任何值');
      return;// 驗證邏輯
    }
    if (!this.tableUtilityService.validateRowData(rowData, this.columns, this.data, this.messageService)) {
      return;// 執行整行驗證
    }
    const rowId = rowData[this.dataKey];
    const oldData = this.clonedProducts[rowId];

    // 判斷是否為新增中的資料 (ID 以 'temp-' 開頭)
    if (typeof rowId === 'string' && rowId.startsWith('temp-')) {
      // 產生一個新的已儲存的 ID，並更新資料
      const savedId = `saved-${new Date().getTime()}`;
      rowData[this.dataKey] = savedId;
      // 同時更新 clonedProducts 的 key，確保下次編輯時能找到正確的備份
      this.clonedProducts[savedId] = { ...oldData };
      // 如果有dataStatusField,則更新該欄位的值 dataStatusValue
      if (this.dataStatusField) {
        rowData[this.dataStatusField] = this.dataStatusValue.New;
      }
      delete this.clonedProducts[rowId];
    } else {
      if (this.dataStatusField) {
        rowData[this.dataStatusField] = this.dataStatusValue.Modified;
      }
      delete this.clonedProducts[rowId]; // 如果是舊資料，則刪除備份即可
    }

    this.rowEditing = false;
    this.dt.saveRowEdit(rowData, htmlTableRowElement ?? null);
    this.rowEditSave.emit({ oldData, newData: rowData, ri, data: this.data });
    this.dataChange.emit(this.data);
  }
  // 行編輯取消
  onRowEditCancel(rowData: any, ri: number) {
    const rowId = rowData[this.dataKey];
    const isNewTempRow = typeof rowId === 'string' && rowId.startsWith('temp-'); // 判斷是否為新增中的資料 (ID 以 'temp-' 開頭)
    if (isNewTempRow) {
      this.data = this.data.filter(item => item[this.dataKey] !== rowId);// 移除這筆新增中的資料
      this.dataChange.emit(this.data);
    } else {
      // 如果是已儲存（暫存）或舊資料，則還原
      const originalRowData = this.clonedProducts[rowId];
      if (originalRowData) {
        this.data[ri] = originalRowData;
        this.data = [...this.data];
        this.dataChange.emit(this.data);
      }
    }
    delete this.clonedProducts[rowId];// 無論是哪種情況，都刪除備份的原始數據
    this.rowEditing = false;
    this.dt.cancelRowEdit(rowData);
    this.rowEditCancel.emit({ data: this.data, rowData, ri });
    this.cdr.detectChanges();
  }
  // 處理失去焦點時的驗證 (alwaysEdit 模式專用)
  onFieldBlur(rowData: any, field: string, value: any) {
    if (!this.alwaysEdit && !this.alwaysBlurValidate) {
      return;
    }
    const column = this.columns.find(col => col.field === field);
    if (column) {
      this.tableUtilityService.validateSingleField(value, rowData, this.data, column, this.messageService);
    }
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
  // 處理值變化事件
  onFieldChange(rowData: any, field: string, value: any, index?: number) { this.fieldChange.emit({ rowData, field, value, index }); }
  // Insert 按鈕
  insertRow() {
    if (this.insertRowData) {
      const { newRowData, data } = this.tableUtilityService.insertNewRow(this.data, this.originalColumns, this.dataKey, this.defaultInsertData);
      this.rowEditing = true;
      this.multiSortMeta = [{ field: this.dataKey, order: 0 }];
      this.data = data;
      this.clonedProducts[newRowData[this.dataKey]] = { ...newRowData }; // 儲存備份
      this.dataChange.emit(this.data);
      this.onRowEditInit(newRowData);
    } else {
      this.insert.emit();
    }
  }
  // Delete 按鈕
  deleteRow(selectedItems: any) {
    if (this.dataStatusField) {
      selectedItems = selectedItems.map((item: any) => {
        if (this.dataStatusField !== undefined) {
          item[this.dataStatusField] = this.dataStatusValue.Deleted;
        }
        return item;
      });
      console.log('🚨 DEBUG - 刪除後的資料:', selectedItems);
    }
    this.delete.emit(selectedItems);
    if (this.deleteData) {
      this.data = this.data.filter(item => !selectedItems.includes(item));
      this.dataChange.emit(this.data);
      this.selectedItems = [];
    }
  }
  // Edit 按鈕 事件
  editRow(rowData: any) { this.edit.emit(rowData); }
  // Detail 或 雙擊行 事件
  detailRow(rowData: any) { this.detail.emit(rowData); }
  // 欄位Button 選擇 事件
  onSelectButton(rowData: any) { this.selectButton.emit(rowData); }
  // 防止XSS
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
  // 計算分組欄位跨度
  getColumnSpan(columns: Column[], groupField: string): number {
    return this.tableUtilityService.getColumnSpan(columns, groupField);
  }
  // 取得沒有分組的欄位
  getUngroupedColumns(columns: Column[], columnGroup: ColumnGroup[]): Column[] {
    return this.tableUtilityService.getUngroupedColumns(columns, columnGroup);
  }
  // 判斷是否應該渲染分組標題
  shouldRenderGroupHeader(col: Column, index: number, columns: Column[]): boolean {
    return this.tableUtilityService.shouldRenderGroupHeader(col, index, columns);
  }
  // 分組標題
  getGroupHeader(groupField: string): string {
    return this.columnGroup?.find(g => g.field === groupField)?.header ?? groupField;
  }
  // 分組欄位對齊
  getGroupAlignClass(groupField: string): string {
    const align = this.columnGroup?.find(g => g.field === groupField)?.align;
    return align ? 'text-' + align : 'text-center';
  }
  // 分組總計
  getGroupSubtotal(groupValue: any, field: string): number {
    return this.tableUtilityService.getGroupSubtotal(this.data, this.groupRowsBy, groupValue, field);
  }
  // 全表總計
  getTotal(field: string): number {
    return this.tableUtilityService.getTotal(this.data, field);
  }
  // 獲取後端圖片
  getImage(url: string): string | SafeUrl | undefined {
    return this.tableUtilityService.getImage(url);
  }
  // 欄位調整
  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as Column[];
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }
}
