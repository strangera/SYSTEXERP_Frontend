/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { FileSelectEvent } from 'primeng/fileupload';
import { Table, TableLazyLoadEvent } from 'primeng/table';
// import { Observable } from 'rxjs';
import { BasicPrintDataComponent } from '../../../componentextends/basic-print/basic-print-data.component';
import { AddButton, Column, LazyLoadEvent } from './../table.model';
import { COMMON_IMPORTS } from './../import-table';
import { TableUtilityService } from './../table-utility.service';

@Component({
  selector: 'app-table-report',
  standalone: true,
  imports: [COMMON_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-report.component.html',
  styleUrls: ['./table-report.component.scss']
})
export class TableReportComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt', { static: false }) dt!: Table;                               // table 元件
  // 基本設置
  @Input() dataKey = 'ID';                                                      // table 資料key
  @Input() tableKey: string | undefined = undefined;                            // table 唯一標識 (必填)
  @Input() apiUrl?: string;                                                     // table API URL (可選)
  @Input() columns!: Column[];                                                  // table 欄位配置 (必填)
  originalColumns!: Column[];                                                   // table 原始欄位
  selectedColumns!: Column[];                                                   // table 預設顯示欄位
  @Input() data: any[] = [];                                                    // table 資料 (必填)
  @Output() dataChange = new EventEmitter<any[]>();                             // table 資料改變 (事件)
  @Input() loading = false;                                                     // 是否顯示 loading
  // select 選擇Row相關
  @Input() showCheckBox = false;                                                // 是否顯示 checkbox
  @Input() selectionMode: 'multiple' | 'single' | null | undefined = 'multiple';// table 勾選 Mode (預設多選)
  @Input() selectedItems: any = [];                                             // table 已勾選資料
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true; // 可選擇(條件)
  @Output() selectionChange = new EventEmitter<any>();                          // 資料變更(事件)
  // Header 相關
  @Input() showCaption = true;                                                  // 是否顯示 Caption
  // Header(左) 相關
  @Input() showHeader = true;                 // 是否顯示 Header
  @Input() showFilter = true;                 // 是否顯示 Filter
  @Input() showReportMode = true;             // 是否顯示 匯出按鈕
  @Input() customReport = false;               // 是否自訂報表
  @Output() exportEvent = new EventEmitter<string>(); // 自訂報表 事件
  // Header(右) 相關
  @Input() showExcel = false;                      // 是否顯示 匯出Excel
  @Input() showExcelExport = true;                 // 是否顯示 匯出Excel按鈕
  @Input() showExcelImport = true;                 // 是否顯示 匯入Excel按鈕
  @Output() exportExcel = new EventEmitter<any>(); // 匯出 Excel 事件
  @Input() exportExcelLoading = false;             // 匯出 Excel loading
  @Output() importExcel = new EventEmitter<FileSelectEvent>(); // 匯入 Excel 事件
  // Sort 相關
  // @Input() showSort = true;                                                     // 是否顯示排序
  @Input() multiSortMeta: SortMeta[] = [{ field: this.dataKey, order: 1 }];     // table 排序依據 (多重排序 {field欄位、order排序方向} )
  // 欄位群組
  // @Input() columnGroup?: ColumnGroup[];                                         // table 群組欄位
  // 資料小計
  // @Input() groupRowsBy = '';                                                    // table 群組資料
  // groupedDataCache = new Map();                                                 // 用於緩存已分組的數據
  // showSubTotal = false;                                                // 是否顯示群組小計
  // showTotal = false;                                                   // 資料總計
  // // expansion 收合展開
  // @Input() expansionColumns: Column[] = [];  // 收合展開 欄位配置(expansion必需配置)
  // @Input() expansionDataKey = 'details';            // 收合展開 資料key(expansion必需配置)
  // @Input() expansionMultiSortMeta = [{ field: this.expansionDataKey, order: 1 }];// 收合展開 排序欄位(單一排序)
  // @Input() expansionLoadFn?: (rowData: any) => Observable<any>; // 屬性來接收父層傳來的載入函數
  // expandedRows: Record<string, boolean> = {};// 收合展開 已展開資料
  // 管理 欄位
  // @Input() showManage = true;                // 是否顯示 管理欄位
  @Input() showDetail = true;                // 是否顯示 管理欄位(明細按鈕)
  // @Output() detail = new EventEmitter<any>();// 明細事件
  @Input() showEdit = true;                  // 是否顯示 管理欄位(編輯按鈕)
  // @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  // @Output() edit = new EventEmitter<any>();  // 編輯事件
  @Input() addButton: AddButton[] = [];      // 自定義 管理按鈕
  // @Input() buttonsLoading = false;           // 按鈕們 loading
  // @Output() selectButton = new EventEmitter<any>();             // 選擇 按鈕事件
  // Footer
  @Input() totalRecords = 0;                        // 記錄總數
  @Output() lazyLoadData = new EventEmitter<LazyLoadEvent>(); // Lazy 加載事件

  constructor(
    private readonly tableUtilityService: TableUtilityService
  ) { super(); }
  // 當 data 發生變化時，重置分頁與頁碼
  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['data']) {
    //   setTimeout(() => {
    //     this.dt.totalRecords = this.totalRecords !== 0 ? this.totalRecords : this.data.length;
    //     this.selectedItems = []
    //     this.selectionChange.emit(this.selectedItems);
    //   });
    // }
    // if (changes['columns'] && this.columns.length > 0) {
    //   this.originalColumns = this.columns;
    //   // this.showSubTotal = this.showSubTotal ? this.showSubTotal : this.columns.find(c => c.isSubTotal) !== undefined;
    //   // this.showTotal = this.showTotal ? this.showTotal : this.columns.find(c => c.isTotal) !== undefined;
    //   if (changes['columns'].firstChange) {
    //     setTimeout(() => { this.multiSortMeta = this.queryState.getQueryState(this.tableKey + 'Sort')?.value ?? this.multiSortMeta; }, 300);
    //   }
    // }
  }
  loadDataLazy(event: TableLazyLoadEvent) {
    if (this.totalRecords === 0 || !this.IsPrint) { return; }
    const pageSize = event.rows && event.rows > 0 ? event.rows : 30;
    const pageIndex = (event.first ?? 0) / pageSize + 1;
    this.multiSortMeta = event.multiSortMeta ?? [{ field: this.dataKey, order: 1 }];
    this.queryState.setQueryState(this.tableKey + 'Sort', this.multiSortMeta);
    this.lazyLoadData.emit({ pageIndex, pageSize, SortBy: this.multiSortMeta });
  }
  // 行追蹤
  trackByRow = (index: number, item: any) => { return item?.[this.dataKey] || index; };
  // 計算欄位總數(包含序號、勾選、管理、展開)
  // get getVisibleHeaderCount(): number {
  //   const visibleColumnCount = this.tableUtilityService.getVisibleColumnCount(this.selectedColumns);
  //   return 1 + Number(this.showCheckBox) + visibleColumnCount + Number(this.showManage) + (this.expansionDataKey ? 1 : 0) + (this.showSubTotal || this.showTotal ? 0 : 1);
  // }
  // get getVisibleHeaderCount(): number {
  //   const visibleColumnCount = this.tableUtilityService.getVisibleColumnCount(this.selectedColumns);
  //   return 1 + Number(this.showCheckBox) + visibleColumnCount + Number(this.showManage);
  // }
  // 行是否可選
  // rowSelectableWrapper = ({ data }: { data: any, index: number; }): boolean | undefined => { return this.isRowSelectable(data) };
  // 切換行展開
  // toggleRowExpansion(rowData: any) {
  //   this.tableUtilityService.toggleRowExpansionLogic(rowData, this.dataKey, this.expansionDataKey, this.expansionLoadFn, this.expandedRows, this);
  // }
  // 過濾欄位記錄保存
  // onFilterChange(event: MultiSelectChangeEvent) {
  //   this.columns.forEach(col => { col.visible = event.value.some((ev: any) => ev.field === col.field); });
  //   this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  // }
  // 資料勾選
  // onSelectionChange(event: any) {
  //   const selected = Array.isArray(event) ? event : event ? [event] : [];
  //   this.selectedItems = selected.filter((item: any) => this.isRowSelectable(item));
  //   this.selectionChange.emit(this.selectedItems);
  // }
  // editRow(rowData: any) { this.edit.emit(rowData); }// Edit 按鈕 事件
  // detailRow(rowData: any) { this.detail.emit(rowData); }// Detail 或 雙擊行 事件
  // onSelectButton(rowData: any) { this.selectButton.emit(rowData); }// 欄位Button 選擇 事件
  // 計算分組欄位跨度
  // getColumnSpan(columns: Column[], groupField: string): number {
  //   return this.tableUtilityService.getColumnSpan(columns, groupField);
  // }
  // 取得沒有分組的欄位
  // getUngroupedColumns(columns: Column[], columnGroup: ColumnGroup[]): Column[] {
  //   return this.tableUtilityService.getUngroupedColumns(columns, columnGroup);
  // }
  // 判斷是否應該渲染分組標題
  // shouldRenderGroupHeader(col: Column, index: number, columns: Column[]): boolean {
  //   return this.tableUtilityService.shouldRenderGroupHeader(col, index, columns);
  // }
  // 分組標題
  // getGroupHeader(groupField: string): string {
  //   return this.columnGroup?.find(g => g.field === groupField)?.header ?? groupField;
  // }
  // 分組欄位對齊
  // getGroupAlignClass(groupField: string): string {
  //   const align = this.columnGroup?.find(g => g.field === groupField)?.align;
  //   return align ? 'text-' + align : 'text-center';
  // }
  // 分組總計
  // getGroupSubtotal(groupValue: any, field: string): number {
  //   return this.tableUtilityService.getGroupSubtotal(this.data, this.groupRowsBy, groupValue, field);
  // }
  // 全表總計
  // getTotal(field: string): number {
  //   return this.tableUtilityService.getTotal(this.data, field);
  // }
  // // 獲取後端圖片
  // getImage(url: string): string | SafeUrl | undefined { return this.tableUtilityService.getImage(url); }
  // // 欄位調整
  // onColReorder(event: TableColumnReorderEvent) {
  //   this.columns = event.columns as Column[];
  //   this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  // }
}
