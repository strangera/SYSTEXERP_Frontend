/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { COMMON_IMPORTS } from '@shared/componentkit/table/import-table';
import { TableUtilityService } from '@shared/componentkit/table/table-utility.service';
import { AddButton, Column, ColumnGroup, FieldChangeEvent, LazyLoadEvent } from '@shared/componentkit/table/table.model';
import { SortMeta } from 'primeng/api';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { FileSelectEvent } from 'primeng/fileupload';
import { MultiSelectChangeEvent } from 'primeng/multiselect';
import { Table, TableColumnReorderEvent, TableLazyLoadEvent, TablePageEvent, TableRowReorderEvent, TableRowSelectEvent, TableRowUnSelectEvent } from 'primeng/table';
import { debounceTime, fromEvent } from 'rxjs';

@Component({
  selector: 'app-table-subheader',
  standalone: true,
  imports: [CommonModule, ...COMMON_IMPORTS],
  templateUrl: './table-subheader.component.html',
  styleUrl: './table-subheader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableSubheaderComponent extends BasicPrintDataComponent implements OnChanges, AfterViewInit {
  /** 自訂群組表頭顯示 template */
  @Input() groupHeaderTemplate?: TemplateRef<any>;
  /** table 元件 */
  @ViewChild('dt', { static: false }) dt!: Table;

  // 基本設置
  /** table 資料key @default 'ID' */
  @Input() dataKey = 'ID';
  /** table 唯一標識 (必填) @default undefined */
  @Input() tableKey: string | undefined = undefined;
  /** table API URL (可選) */
  @Input() apiUrl?: string;
  /** table 標題 @default undefined */
  @Input() title: string | undefined = undefined;
  /** table 欄位配置 (必填) */
  @Input() columns!: Column[];
  /** table 原始欄位 */
  originalColumns!: Column[];
  /** table 預設顯示欄位 */
  selectedColumns!: Column[];
  /** table 資料 (必填) @default [] */
  @Input() data: any[] = [];
  /** table 資料改變 (事件) */
  @Output() dataChange = new EventEmitter<any[]>();
  /** 是否顯示 loading @default false */
  @Input() loading = false;
  /** 是否禁用 table @default false */
  @Input() disabled = false;
  /** 是否顯示序號 @default true */
  @Input() showSerialNo = true;

  // select 選擇Row相關
  /** 是否顯示 checkbox @default false */
  @Input() showCheckBox = false;
  /** table 勾選 Mode (預設多選) @default 'multiple' */
  @Input() selectionMode: 'multiple' | 'single' | null | undefined = 'multiple';
  /** table 已勾選資料 @default [] */
  @Input() selectedItems: any = [];
  /** 可選擇(條件) @default () => true */
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true;
  /** 資料變更(事件) */
  @Output() selectionChange = new EventEmitter<any>();
  /** 資料變更(雙向綁定用) */
  @Output() selectedItemsChange = new EventEmitter<any>();
  /** 資料勾選(事件) */
  @Output() select = new EventEmitter<TableRowSelectEvent>();
  /** 資料取消勾選(事件) */
  @Output() unSelect = new EventEmitter<TableRowUnSelectEvent>();
  /** 資料點選(事件) */
  @Output() itemClick = new EventEmitter<any>();
  /** 資料重新排序(事件) */
  @Output() rowReorder = new EventEmitter<TableRowReorderEvent>();

  // Header 相關
  /** 是否顯示 Caption @default true */
  @Input() showCaption = true;

  // Header(左)
  /** 是否顯示 Header @default true */
  @Input() showHeader = true;
  /** 是否顯示 Filter @default true */
  @Input() showFilter = true;
  /** 是否顯示 匯出按鈕 @default true */
  @Input() showReportMode = true;
  /** 是否顯示 匯出PDF按鈕 @default true */

  @Input() pageOrientation: string | null = 'Landscape'; // PDF橫式
  @Input() pageSizeSetting: string | null = 'A4'; // PDF A4

  @Input() showReportPDF = true;
  /** 是否顯示 匯出Excel按鈕 @default true */
  @Input() showReportExcel = true;
  /** 是否自訂報表 @default false */
  @Input() customReport = false;
  /** 自訂報表 事件 */
  @Output() exportEvent = new EventEmitter<string>();
  /** 是否顯示 Insert新增按鈕 @default false */
  @Input() showInsert = false;
  /** 新增事件 */
  @Output() insert = new EventEmitter<any>();
  /** 新增按鈕是否禁用 @default false */
  @Input() insertDisabled = false;
  /** 預先刪除資料 (關聯：需要加入dataKey, dataChange) @default false */
  @Input() deleteData = false;
  /** 刪除事件 */
  @Output() delete = new EventEmitter<any>();
  /** 是否顯示刪除按鈕 @default true */
  @Input() showDelete = true;
  /** 刪除按鈕圖示 @default 'pi pi-trash' */
  @Input() deleteIcon = 'pi pi-trash';
  /** 刪除按鈕提示 @default '刪除' */
  @Input() deletepTooltip = '刪除';

  // Header(右) 相關
  /** 是否顯示 匯出Excel @default false */
  @Input() showExcel = false;
  /** 是否顯示 匯出Excel按鈕 @default true */
  @Input() showExcelExport = true;
  /** 是否顯示 匯入Excel按鈕 @default true */
  @Input() showExcelImport = true;
  /** 是否顯示 自訂匯入Excel按鈕 @default false */
  @Input() showCustomExcelImport = false;
  /** 匯出 Excel 事件 */
  @Output() exportExcel = new EventEmitter<any>();
  /** 匯出 Excel loading @default false */
  @Input() exportExcelLoading = false;
  /** 匯入 Excel 事件 */
  @Output() importExcel = new EventEmitter<FileSelectEvent>();
  /** 是否顯示 下拉選單分頁器 @default true */
  @Input() showPage = true;

  // Sort 相關
  /** 是否顯示排序 @default true */
  @Input() showSort = true;
  /** table 排序依據 (多重排序 {field欄位、order排序方向} ) @default [{ field: this.dataKey, order: 1 }] */
  @Input() multiSortMeta: SortMeta[] = [{ field: this.dataKey, order: 1 }];
  /** 欄位群組 */
  @Input() columnGroup?: ColumnGroup[];

  // 資料小計
  /** table 群組資料 @default '' */
  @Input() groupRowsBy = '';
  // 群組依據欄位名稱
  @Input() groupRowsByName = '';
  // 是否顯示群組表頭
  @Input() showGroupheader = true;
  /** 用於緩存已分組的數據 @default new Map() */
  groupedDataCache = new Map();
  /** 是否顯示群組小計 @default false */
  @Input() showSubTotal = false;

  // 資料總計
  /** 是否顯示總計 @default false */
  @Input() showTotal = false;

  // 管理 欄位
  /** 是否顯示 管理欄位 @default true */
  @Input() showManage = true;
  /** 是否顯示 管理欄位(明細按鈕) @default true */
  @Input() showDetail = true;
  /** 明細事件 */
  @Output() detail = new EventEmitter<any>();
  @Output() detailWithColValue = new EventEmitter<{ row: any, col: Column, value: any }>();
  /** 是否顯示 管理欄位(編輯按鈕) @default true */
  @Input() showEdit = true;
  /** Row禁止編輯條件 @default () => false */
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;
  /** 編輯事件 */
  @Output() edit = new EventEmitter<any>();
  /** 自定義 管理按鈕 @default [] */
  @Input() addButton: AddButton[] = [];
  /** 按鈕們 loading @default false */
  @Input() buttonsLoading = false;

  // body
  /** 是否顯示 排序欄位 @default false */
  @Input() showReorder = false;
  /** input 變更事件 */
  @Output() fieldChange = new EventEmitter<FieldChangeEvent>();
  /** 選擇 按鈕事件 */
  @Output() selectButton = new EventEmitter<any>();
  /** autoComplete 過濾事件 */
  @Output() filterChange = new EventEmitter<{ rowData: any, value: string; }>();

  // Footer
  /** 是否顯示 Footer @default false */
  @Input() showFooter = false;
  /** 分頁器 @default n/a */
  /** table 高度 @default '867px' */
  @Input() scrollHeight = '867px';
  /** 是否要滾輪 @default true */
  @Input() scrollable = true;
  /** 是否顯示 分頁器 @default true */
  @Input() showPaginator = true;
  /** 記錄總數 @default 0 */
  @Input() totalRecords = 0;
  /** 分頁選項 @default [20, 40, 60, 80, 100] */
  @Input() rowsPerPageOptions: any[] | undefined = [20, 40, 60, 80, 100];
  /** 共幾頁數 @default 0 */
  totalPages = 0;
  /** 每頁顯示的行數 @default 20 */
  @Input() rows = 20;
  /** 當前表格的起始索引 @default 0 */
  first = 0;
  /** (右上)下拉選單 頁數選項 @default [] */
  pages: { label: string, value: number; }[] = [];
  /** (右上)下拉選單 當前選擇的頁數 @default 1 */
  selectedPage: number | null = 1;
  /** 是否啟用 Lazy 加載 @default false */
  @Input() lazy = false;
  /** Lazy 加載事件 */
  @Output() lazyLoadData = new EventEmitter<LazyLoadEvent>();

  // 其他
  /** table 無資料時顯示文字 @default '查無資料' */
  @Input() emptyMessage = '查無資料';

  constructor(
    private readonly tableUtilityService: TableUtilityService,
    private readonly cd: ChangeDetectorRef,
  ) { super(); }

  // 當 data 發生變化時，重置分頁與頁碼
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      setTimeout(() => {
        this.dt.totalRecords = this.totalRecords !== 0 ? this.totalRecords : this.data.length;
        this.selectedItems = [];
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

  // 視窗大小變化時重新計算表格寬度
  ngAfterViewInit() {
    fromEvent(window, 'resize')
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.cd.detectChanges();
      });
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
    if (this.totalRecords === 0 || !this.IsPrint) { return; }
    const pageSize = event.rows && event.rows > 0 ? event.rows : 30;
    const pageIndex = (event.first ?? 0) / pageSize + 1;
    this.selectedPage = pageIndex;
    this.multiSortMeta = event.multiSortMeta ?? [{ field: this.dataKey, order: 1 }];
    this.queryState.setQueryState(this.tableKey + 'Sort', this.multiSortMeta);
    this.lazyLoadData.emit({ pageIndex, pageSize, SortBy: this.multiSortMeta });
  }

  // 行追蹤
  trackByRow = (index: number, item: any) => { return item?.[this.dataKey] || index; };

  // 計算欄位總數(包含序號、勾選、管理)
  get getVisibleHeaderCount(): number {
    const visibleColumnCount = this.tableUtilityService.getVisibleColumnCount(this.selectedColumns);
    return 1 + Number(this.showCheckBox) + visibleColumnCount + Number(this.showManage) + (this.showSubTotal || this.showTotal ? 0 : 1);
  }

  // 行是否可選
  rowSelectableWrapper = ({ data }: { data: any, index: number; }): boolean | undefined => { return this.isRowSelectable(data); };

  // 過濾欄位記錄保存
  onFilterChange(event: MultiSelectChangeEvent) {
    this.columns.forEach(col => {
      col.visible = event.value.some((ev: any) => ev.field === col.field);
    });
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }

  // 資料勾選
  onSelectionChange(event: any) {
    const selected = Array.isArray(event) ? event : event ? [event] : [];
    this.selectedItems = selected.filter((item: any) => this.isRowSelectable(item));
    this.selectionChange.emit(this.selectedItems);
    this.selectedItemsChange.emit(this.selectedItems);
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
    this.insert.emit();
  }

  // Delete 按鈕
  deleteRow(selectedItems: any) {
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
  detailRow(rowData: any, col?: Column, value?: any) {
    if (col && value) {
      this.detailWithColValue.emit({ row: rowData, col, value });
    }
    this.detail.emit(rowData);
  }

  // 欄位Button 選擇 事件
  onSelectButton(rowData: any) { this.selectButton.emit(rowData); }

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

  // 欄位調整
  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as Column[];
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }

  // 資料列重新排序
  onRowReorder(event: TableRowReorderEvent): void {
    this.rowReorder.emit(event);
  }
}
