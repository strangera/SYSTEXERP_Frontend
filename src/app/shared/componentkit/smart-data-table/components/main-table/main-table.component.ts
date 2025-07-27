// 完整修復 - main-table.component.ts
// 🎯 完全複製原版邏輯，確保編輯功能正常運作

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { NgIf, NgFor, NgClass, NgStyle, JsonPipe } from '@angular/common';

// PrimeNG 模組
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { PrimeTemplate } from 'primeng/api';

// 本地組件和服務
import { TableCellComponent } from '../table-cell/table-cell.component';
import { ColumnDef } from '../../types/column.types';
import { TableConfig, EditContext } from '../../types/table.types';
import { TableStateService } from '../../services/table-state.service';

@Component({
  selector: 'app-main-table',
  templateUrl: './main-table.component.html',
  styleUrls: ['./main-table.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, NgStyle, JsonPipe,
    TableModule, ButtonModule, RippleModule, TooltipModule, PrimeTemplate,
    TableCellComponent
  ]
})
export class MainTableComponent implements OnInit, OnChanges {

  @ViewChild('dt') dt!: Table;

  // ==================== 輸入屬性 ====================

  @Input() data: any[] = [];
  @Input() columns: ColumnDef[] = [];
  @Input() config: TableConfig = {};
  @Input() selectedItems: any[] = [];
  @Input() expandedRows: { [key: string]: boolean } = {};
  @Input() editingRowIndex: number | null = null;
  @Input() loading: boolean = false;

  // ==================== 輸出事件 ====================

  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() rowExpand = new EventEmitter<any>();
  @Output() rowCollapse = new EventEmitter<any>();

  @Output() rowEditStart = new EventEmitter<{ data: any; index: number }>();
  @Output() rowEditSave = new EventEmitter<{ data: any; index: number }>();
  @Output() rowEditCancel = new EventEmitter<{ data: any; index: number }>();

  @Output() cellValueChange = new EventEmitter<EditContext>();
  @Output() pageChange = new EventEmitter<any>();

  // ==================== 內部狀態 ====================

  totalRecords: number = 0;
  first: number = 0;
  rows: number = 10;

  // 🔧 直接從原版複製的編輯狀態管理
  clonedItems: { [s: string]: any } = {};

  constructor(private stateService: TableStateService) { }

  ngOnInit() {
    this.initializeTable();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.totalRecords = this.data?.length || 0;
      this.stateService.initializeDetailArrays(this.data, this.config.detailKey || 'details');
    }

    if (changes['config']) {
      this.rows = this.config.rows || 10;
    }
  }

  // ==================== 初始化 ====================

  private initializeTable(): void {
    this.totalRecords = this.data?.length || 0;
    this.rows = this.config.rows || 10;
    this.stateService.initializeDetailArrays(this.data, this.config.detailKey || 'details');
  }

  // ==================== 🔧 修復編輯邏輯 - 直接從原版複製 ====================

  /**
   * 開始編輯行 - 完全複製原版邏輯
   */
  onRowEditStart(rowData: any, rowIndex: number): void {
    if (this.config.readonly || this.editingRowIndex !== null) {
      console.warn('已有其他行在編輯中或表格為唯讀狀態');
      return;
    }

    const dataKey = this.config.dataKey || 'id';

    // 🔧 直接複製原版的編輯邏輯
    this.clonedItems[rowData[dataKey]] = { ...rowData };

    // 更新狀態
    this.stateService.startRowEdit(rowIndex, rowData, dataKey);

    this.rowEditStart.emit({ data: rowData, index: rowIndex });
  }

  /**
   * 儲存行編輯 - 完全複製原版邏輯
   */
  onRowEditSave(rowData: any, rowIndex: number): void {
    try {
      const dataKey = this.config.dataKey || 'id';
      const oldData = this.clonedItems[rowData[dataKey]];

      // 清理複製的資料
      delete this.clonedItems[rowData[dataKey]];

      // 更新狀態
      this.stateService.saveRowEdit(rowData, dataKey);

      this.rowEditSave.emit({ data: rowData, index: rowIndex });
    } catch (error) {
      console.error('保存行時出錯：', error);
    }
  }

  /**
   * 取消行編輯 - 完全複製原版邏輯
   */
  onRowEditCancel(rowData: any, rowIndex: number): void {
    try {
      const dataKey = this.config.dataKey || 'id';
      const originalData = this.clonedItems[rowData[dataKey]];

      // 🔧 關鍵：恢復原始資料
      if (originalData) {
        // 將原始資料復原到當前資料中
        Object.assign(rowData, originalData);
      }

      // 清理複製的資料
      delete this.clonedItems[rowData[dataKey]];

      // 更新狀態
      this.stateService.cancelRowEdit(rowData, dataKey);

      this.rowEditCancel.emit({ data: rowData, index: rowIndex });
    } catch (error) {
      console.error('取消編輯行時出錯：', error);
    }
  }

  // ==================== 單元格操作 ====================

  /**
   * 處理單元格值變更 - 直接更新資料
   */
  onCellValueChange(value: any, rowData: any, column: ColumnDef, rowIndex: number): void {
    const oldValue = rowData[column.field];

    // 🔧 直接更新資料，不需要複雜的狀態管理
    rowData[column.field] = value;

    const context: EditContext = {
      rowData,
      rowIndex,
      field: column.field,
      oldValue,
      newValue: value
    };

    this.cellValueChange.emit(context);
  }

  // ==================== 選擇操作 ====================

  /**
   * 處理選擇變更
   */
  onSelectionChange(selectedItems: any[]): void {
    this.stateService.setSelectedItems(selectedItems);
    this.selectionChange.emit(selectedItems);
  }

  /**
   * 處理行選擇
   */
  onRowSelect(event: any): void {
    this.rowSelect.emit(event.data);
  }

  /**
   * 處理行取消選擇
   */
  onRowUnselect(event: any): void {
    this.rowUnselect.emit(event.data);
  }

  // ==================== 展開操作 ====================

  /**
   * 處理行展開
   */
  onRowToggle(event: any): void {
    const rowData = event.data;
    const dataKey = this.config.dataKey || 'id';
    const rowKey = rowData[dataKey];
    const isExpanded = event.expanded;

    this.stateService.setRowExpanded(rowKey, isExpanded);

    if (isExpanded) {
      this.rowExpand.emit(rowData);
    } else {
      this.rowCollapse.emit(rowData);
    }
  }

  // ==================== 分頁操作 ====================

  /**
   * 處理分頁變更
   */
  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.stateService.setFirst(event.first);
    this.pageChange.emit(event);
  }

  // ==================== 🔧 修復狀態檢查 ====================

  /**
   * 檢查行是否在編輯中 - 直接使用 editingRowIndex
   */
  isRowEditing(rowIndex: number): boolean {
    return this.editingRowIndex === rowIndex;
  }

  /**
   * 檢查行是否已展開
   */
  isRowExpanded(rowData: any): boolean {
    const dataKey = this.config.dataKey || 'id';
    const rowKey = rowData[dataKey];
    return this.stateService.isRowExpanded(rowKey);
  }

  // ==================== 樣式和佈局 ====================

  /**
   * 取得欄位樣式
   */
  getColumnStyle(column: ColumnDef): any {
    const styles: any = {};

    if (column.width) {
      styles.width = column.width;
      styles.minWidth = column.width;
    }

    if (column.minWidth) {
      styles.minWidth = column.minWidth;
    }

    if (column.maxWidth) {
      styles.maxWidth = column.maxWidth;
    }

    // 🔧 添加原版的樣式處理
    if (column.style) {
      if (typeof column.style === 'string') {
        const styleArray = column.style.split(';');
        styleArray.forEach(style => {
          if (style.trim()) {
            const [property, value] = style.split(':').map(s => s.trim());
            if (property && value) {
              styles[this.camelCase(property)] = value;
            }
          }
        });
      }
    }

    return styles;
  }

  /**
   * 字串轉駝峰命名
   */
  private camelCase(str: string): string {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  /**
   * 取得可見欄位
   */
  get visibleColumns(): ColumnDef[] {
    return this.columns.filter(col => !col.hidden);
  }

  /**
   * 取得表格欄位總數（包含序號、選擇、展開、操作欄）
   */
  get totalColumnCount(): number {
    let count = 1; // 序號欄

    // 選擇欄
    if (this.showCheckboxColumn) {
      count += 1;
    }

    // 展開欄
    if (this.config.expandable) {
      count += 1;
    }

    // 資料欄位
    count += this.visibleColumns.length;

    // 操作欄
    if (!this.config.readonly) {
      count += 1;
    }

    return count;
  }

  /**
   * 是否顯示核取方塊欄位
   */
  get showCheckboxColumn(): boolean {
    return !this.config.readonly &&
      this.config.showCheckBox !== false &&
      this.config.selectionMode === 'multiple';
  }

  /**
   * 是否顯示展開欄位
   */
  get showExpandColumn(): boolean {
    return this.config.expandable === true;
  }

  /**
   * 是否顯示操作欄位
   */
  get showActionColumn(): boolean {
    return !this.config.readonly;
  }

  /**
   * 取得操作欄位樣式
   */
  getActionColumnStyle(): any {
    return {
      width: '120px',
      minWidth: '120px',
      textAlign: 'center'
    };
  }

  // ==================== 🔧 添加原版的欄位處理方法 ====================

  /**
   * 取得欄位選項（下拉選單用）
   */
  getFieldOptions(rowData: any, field: string): any[] {
    // 先檢查 columns
    let column = this.columns.find(col => col.field === field);

    if (!column?.options) {
      return [];
    }

    if (typeof column.options === 'function') {
      return column.options(rowData);
    }

    return column.options;
  }

  /**
   * 取得下拉選單顯示文字
   */
  getDropdownDisplayText(rowData: any, col: ColumnDef): string {
    const value = rowData[col.field];

    if (!value && value !== 0) {
      return '';
    }

    const options = this.getFieldOptions(rowData, col.field);

    if (!options || options.length === 0) {
      return String(value);
    }

    const foundOption = options.find((option: any) => {
      if (typeof option === 'object' && option !== null) {
        return option.value === value || option.value === String(value);
      }
      return option === value;
    });

    if (foundOption) {
      return typeof foundOption === 'object' ? foundOption.label : String(foundOption);
    }

    return String(value);
  }

  /**
   * 取得數字輸入配置
   */
  getNumberInputConfig(col: ColumnDef): any {
    const columnAny = col as any;

    if (columnAny.allowDecimal) {
      return {
        mode: 'decimal',
        minFractionDigits: 0,
        maxFractionDigits: columnAny.decimalPlaces || 2,
        step: columnAny.decimalPlaces === 1 ? 0.1 : 0.01,
        useGrouping: false
      };
    }

    return {
      mode: 'decimal',
      minFractionDigits: 0,
      maxFractionDigits: 0,
      step: 1,
      useGrouping: false
    };
  }

  // ==================== 工具方法 ====================

  /**
   * 追蹤函數用於 ngFor
   */
  trackByFn = (index: number, item: any) => {
    const dataKey = this.config.dataKey || 'id';
    return item[dataKey] || index;
  }

  /**
   * 取得空資料訊息
   */
  get emptyMessage(): string {
    return this.config.emptyMessage || '查無資料';
  }

  /**
   * 🔧 關鍵修復：檢查欄位是否可編輯
   */
  isColumnEditable(column: ColumnDef): boolean {
    return column.editable === true && !this.config.readonly;
  }

  /**
   * 取得欄位在指定行的值
   */
  getCellValue(rowData: any, column: ColumnDef): any {
    return rowData[column.field];
  }

  /**
   * 🔧 添加原版的下拉變更處理
   */
  onDropdownChange(rowData: any, field: string, newValue: any): void {
    const oldValue = rowData[field];
    rowData[field] = newValue;

    // 觸發變更事件
    this.cellValueChange.emit({
      rowData,
      rowIndex: -1, // 在此層級不知道確切的 rowIndex
      field,
      oldValue,
      newValue
    });
  }
}
