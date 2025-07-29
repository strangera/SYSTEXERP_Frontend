// shared/componentkit/smart-data-table/components/detail-table/detail-table.component.ts

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, ContentChild, ElementRef } from '@angular/core';
import { NgIf, NgFor, NgClass, NgStyle } from '@angular/common';

// PrimeNG 模組
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { PrimeTemplate } from 'primeng/api';

// 本地組件和服務
import { TableCellComponent } from '../table-cell/table-cell.component';
import { ColumnDef, isEditableColumn } from '../../types/column.types';
import { TableConfig, DetailTabOption, DetailEditContext } from '../../types/table.types';
import { TableStateService } from '../../services/table-state.service';
import { TableEditService } from '../../services/table-edit.service';

@Component({
  selector: 'app-detail-table',
  templateUrl: './detail-table.component.html',
  styleUrls: ['./detail-table.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, NgStyle,
    TableModule, ButtonModule, RippleModule, TooltipModule, PrimeTemplate,
    TableCellComponent
  ]
})
export class DetailTableComponent implements OnInit, OnChanges {

  @ViewChild('detailTable') detailTable!: Table;

  // ==================== 輸入屬性 ====================

  @Input() parentData: any = {};
  @Input() parentIndex: number = 0;
  @Input() detailData: any[] = [];
  @Input() detailColumns: ColumnDef[] = [];
  @Input() config: TableConfig = {};
  @Input() selectedDetailItems: any[] = [];
  @Input() editingDetailIndex: number | null = null;
  @Input() loading: boolean = false;

  // 分頁支援
  @Input() showDetailTabs: boolean = false;
  @Input() detailTabOptions: DetailTabOption[] = [];
  @Input() currentTabId: string = '';
  @Input() detailColumnsMap: { [tabId: string]: ColumnDef[] } = {};

  // ==================== 輸出事件 ====================

  @Output() detailSelectionChange = new EventEmitter<any[]>();
  @Output() detailSelect = new EventEmitter<any>();
  @Output() detailUnselect = new EventEmitter<any>();

  @Output() detailEditStart = new EventEmitter<{ data: any; parentData: any; parentIndex: number; detailIndex: number }>();
  @Output() detailEditSave = new EventEmitter<{ data: any; parentData: any; parentIndex: number; detailIndex: number }>();
  @Output() detailEditCancel = new EventEmitter<{ data: any; parentData: any; parentIndex: number; detailIndex: number }>();

  @Output() detailCellValueChange = new EventEmitter<DetailEditContext>();
  @Output() detailTabChange = new EventEmitter<{ parentData: any; tabId: string }>();

  @Output() addDetailItem = new EventEmitter<any>();
  @Output() batchDeleteDetail = new EventEmitter<{ selectedItems: any[]; parentData: any; parentIndex: number }>();

  // ==================== 內容投影 ====================

  @ContentChild('[detail-header-left]', { read: ElementRef }) detailHeaderLeft?: ElementRef;
  @ContentChild('[detail-header-right]', { read: ElementRef }) detailHeaderRight?: ElementRef;

  constructor(
    private stateService: TableStateService,
    private editService: TableEditService
  ) { }

  ngOnInit() {
    this.initializeDetailTable();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['detailData'] || changes['currentTabId']) {
      this.initializeDetailTable();
    }
  }

  // ==================== 初始化 ====================

  private initializeDetailTable(): void {
    // 詳細資料表格的初始化邏輯
  }

  // ==================== 分頁操作 ====================

  /**
   * 處理分頁切換
   */
  onTabChange(tabId: string): void {
    this.detailTabChange.emit({ parentData: this.parentData, tabId });
  }

  /**
   * 取得當前分頁的欄位
   */
  get currentColumns(): ColumnDef[] {
    if (this.showDetailTabs && this.currentTabId && this.detailColumnsMap[this.currentTabId]) {
      return this.detailColumnsMap[this.currentTabId];
    }
    return this.detailColumns;
  }

  /**
   * 取得可見欄位
   */
  get visibleColumns(): ColumnDef[] {
    return this.currentColumns.filter(col => !col.hidden);
  }

  // ==================== 詳細資料操作 ====================

  /**
   * 開始編輯詳細資料
   */
  onDetailEditStart(detailData: any, detailIndex: number): void {
    if (this.config.readonly || this.editingDetailIndex !== null) {
      return;
    }

    const detailKey = this.config.dataKey || 'id';
    this.stateService.startDetailEdit(this.parentIndex, detailIndex, detailData, detailKey);

    this.detailEditStart.emit({
      data: detailData,
      parentData: this.parentData,
      parentIndex: this.parentIndex,
      detailIndex
    });
  }

  /**
   * 儲存詳細資料編輯
   */
  onDetailEditSave(detailData: any, detailIndex: number): void {
    // 驗證資料
    if (!this.editService.isRowValid(detailData, this.currentColumns)) {
      console.warn('詳細資料驗證失敗，無法儲存');
      return;
    }

    const detailKey = this.config.dataKey || 'id';
    this.stateService.saveDetailEdit(detailData, detailKey);

    this.detailEditSave.emit({
      data: detailData,
      parentData: this.parentData,
      parentIndex: this.parentIndex,
      detailIndex
    });
  }

  /**
   * 取消詳細資料編輯
   */
  onDetailEditCancel(detailData: any, detailIndex: number): void {
    const detailKey = this.config.dataKey || 'id';
    const originalData = this.stateService.cancelDetailEdit(detailData, detailKey);

    // 恢復原始資料
    if (originalData) {
      Object.assign(detailData, originalData);
    }

    this.detailEditCancel.emit({
      data: detailData,
      parentData: this.parentData,
      parentIndex: this.parentIndex,
      detailIndex
    });
  }

  // ==================== 單元格操作 ====================

  /**
   * 處理詳細資料單元格值變更
   */
  onDetailCellValueChange(value: any, detailData: any, column: ColumnDef, detailIndex: number): void {
    const oldValue = detailData[column.field];
    detailData[column.field] = value;

    const context: DetailEditContext = {
      rowData: detailData,
      rowIndex: this.parentIndex,
      field: column.field,
      oldValue,
      newValue: value,
      parentData: this.parentData,
      detailIndex
    };

    this.detailCellValueChange.emit(context);
  }

  // ==================== 選擇操作 ====================

  /**
   * 處理詳細資料選擇變更
   */
  onDetailSelectionChange(selectedItems: any[]): void {
    this.detailSelectionChange.emit(selectedItems);
  }

  /**
   * 處理詳細資料選擇
   */
  onDetailSelect(event: any): void {
    this.detailSelect.emit(event.data);
  }

  /**
   * 處理詳細資料取消選擇
   */
  onDetailUnselect(event: any): void {
    this.detailUnselect.emit(event.data);
  }

  // ==================== 工具列操作 ====================

  /**
   * 新增詳細資料項目
   */
  onAddDetailItem(): void {
    if (this.config.readonly) {
      return;
    }
    this.addDetailItem.emit(this.parentData);
  }

  /**
   * 批次刪除詳細資料
   */
  onBatchDeleteDetail(): void {
    if (this.config.readonly || this.selectedDetailItems.length === 0) {
      return;
    }

    this.batchDeleteDetail.emit({
      selectedItems: [...this.selectedDetailItems],
      parentData: this.parentData,
      parentIndex: this.parentIndex
    });
  }

  // ==================== 狀態檢查 ====================

  /**
   * 檢查詳細資料是否在編輯中
   */
  isDetailEditing(detailIndex: number): boolean {
    return this.stateService.isDetailEditing(this.parentIndex, detailIndex);
  }

  /**
   * 檢查欄位是否可編輯
   */
  isColumnEditable(column: ColumnDef): boolean {
    return isEditableColumn(column) && !this.config.readonly;
  }

  // ==================== 佈局和樣式 ====================

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

    return styles;
  }

  /**
   * 取得詳細資料表格的總欄位數
   */
  get totalDetailColumnCount(): number {
    let count = 1; // 序號欄

    // 選擇欄
    if (this.showCheckboxColumn) {
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
      this.config.showDetailBatchDelete !== false;
  }

  /**
   * 是否顯示新增按鈕
   */
  get showAddButton(): boolean {
    return !this.config.readonly &&
      this.config.showDetailAddButton !== false;
  }

  /**
   * 是否顯示批次刪除按鈕
   */
  get showBatchDeleteButton(): boolean {
    return !this.config.readonly &&
      this.config.showDetailBatchDelete !== false;
  }

  /**
   * 批次刪除按鈕是否禁用
   */
  get isBatchDeleteDisabled(): boolean {
    return this.selectedDetailItems.length === 0 || this.config.readonly || this.loading;
  }

  /**
   * 是否有工具列內容
   */
  get hasToolbarContent(): boolean {
    return this.showDetailTabs ||
      this.showAddButton ||
      this.showBatchDeleteButton ||
      this.hasDetailHeaderContent();
  }

  /**
   * 檢查是否有自定義標頭內容
   */
  hasDetailHeaderContent(): boolean {
    return (this.detailHeaderLeft?.nativeElement?.children.length > 0) ||
      (this.detailHeaderRight?.nativeElement?.children.length > 0);
  }

  // ==================== 工具方法 ====================

  /**
   * 追蹤函數用於 ngFor
   */
  trackByDetailFn = (index: number, item: any) => {
    const dataKey = this.config.dataKey || 'id';
    return item[dataKey] || index;
  }

  /**
   * 取得詳細資料的空資料訊息
   */
  get detailEmptyMessage(): string {
    return '查無詳細資料';
  }

  /**
   * 取得單元格值
   */
  getDetailCellValue(detailData: any, column: ColumnDef): any {
    return detailData[column.field];
  }
}
