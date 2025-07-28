// 直接修復 - smart-data-table.component.ts
// 🎯 修復主組件的編輯狀態管理，確保與原版邏輯一致

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { NgIf, NgClass, CommonModule, JsonPipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// 子組件
import { TableHeaderComponent } from './components/table-header/table-header.component';
import { MainTableComponent } from './components/main-table/main-table.component';
import { DetailTableComponent } from './components/detail-table/detail-table.component';

// 型別和服務
import { ColumnDef } from './types/column.types';
import { TableConfig, TableState, DetailTabOption, EditContext, DetailEditContext, DEFAULT_TABLE_CONFIG } from './types/table.types';
import { TableStateService } from './services/table-state.service';

@Component({
  selector: 'app-smart-data-table',
  templateUrl: './smart-data-table.component.html',
  styleUrls: ['./smart-data-table.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgClass, CommonModule, JsonPipe,
    TableHeaderComponent, MainTableComponent, DetailTableComponent
  ],
  providers: [
    // 🔧 移除全域服務，使用本地實例
    TableStateService
  ]
})
export class SmartDataTableComponent implements OnInit, OnDestroy, OnChanges {

  private destroy$ = new Subject<void>();

  // ==================== 基本屬性 ====================

  @Input() title: string = '';
  @Input() data: any[] = [];
  @Input() columns: ColumnDef[] = [];
  @Input() config: Partial<TableConfig> = {};

  // ==================== 詳細資料相關 ====================

  @Input() detailColumns: ColumnDef[] = [];
  @Input() detailKey: string = 'details';
  @Input() showDetailTabs: boolean = false;
  @Input() detailTabOptions: DetailTabOption[] = [];
  @Input() defaultDetailTab: string = '';
  @Input() detailColumnsMap: { [tabId: string]: ColumnDef[] } = {};

  // ==================== 預設新增項目 ====================

  @Input() defaultNewItem: any = {};
  @Input() defaultNewDetailItem: any = {};

  // ==================== 自定義模板 ====================

  @Input() expandedContentTemplate: TemplateRef<any> | null = null;

  // ==================== 主要事件 ====================

  @Output() dataChange = new EventEmitter<any[]>();

  // 主表格事件
  @Output() rowEdit = new EventEmitter<any>();
  @Output() rowSave = new EventEmitter<{ oldData: any; newData: any }>();
  @Output() rowCancel = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any[]>();

  // 詳細資料事件
  @Output() detailEdit = new EventEmitter<any>();
  @Output() detailSave = new EventEmitter<{ oldDetail: any; newDetail: any; parentData: any }>();
  @Output() detailCancel = new EventEmitter<any>();
  @Output() detailTabChange = new EventEmitter<{ rowData: any; tabId: string }>();

  // 操作事件
  @Output() addMainItem = new EventEmitter<void>();
  @Output() addDetailItem = new EventEmitter<any>();
  @Output() batchDelete = new EventEmitter<any[]>();
  @Output() detailBatchDelete = new EventEmitter<{ selectedDetails: any[]; parentData: any; rowIndex: number }>();

  // 欄位變更事件
  @Output() fieldChange = new EventEmitter<EditContext>();
  @Output() dropdownChange = new EventEmitter<EditContext>();

  // ==================== 🔧 簡化內部狀態 - 直接從原版複製 ====================

  mergedConfig: TableConfig = {};

  // 🔧 直接複製原版的狀態管理
  selectedItems: any[] = [];
  expandedRows: { [key: string]: boolean } = {};
  editingRowIndex: number | null = null;
  editingDetail: { rowIndex: number; detailIndex: number } | null = null;
  detailSelectedItems: { [mainRowKey: string]: any[] } = {};
  detailSelectedTabs: { [key: string]: string } = {};

  // 複製的資料（用於取消編輯）
  clonedItems: { [key: string]: any } = {};
  clonedDetails: { [key: string]: any } = {};

  constructor(private stateService: TableStateService) { }

  ngOnInit() {
    this.initializeComponent();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config']) {
      this.mergeConfig();
    }

    if (changes['data']) {
      this.initializeDetailArrays();
      this.initializeDetailTabs();
    }
  }

  // ==================== 初始化 ====================

  private initializeComponent(): void {
    this.mergeConfig();
    this.initializeDetailArrays();
    this.initializeDetailTabs();
  }

  private mergeConfig(): void {
    this.mergedConfig = {
      ...DEFAULT_TABLE_CONFIG,
      ...this.config,
      detailKey: this.detailKey,
      showDetailTabs: this.showDetailTabs,
      defaultDetailTab: this.defaultDetailTab
    };
  }

  private initializeDetailArrays(): void {
    if (this.data && this.data.length > 0) {
      this.data.forEach(rowData => {
        if (!rowData[this.detailKey]) {
          rowData[this.detailKey] = [];
        }
      });
    }
  }

  private initializeDetailTabs(): void {
    if (this.showDetailTabs && this.data) {
      const dataKey = this.mergedConfig.dataKey || 'id';
      this.data.forEach(item => {
        const rowKey = item[dataKey];
        if (!this.detailSelectedTabs[rowKey]) {
          this.detailSelectedTabs[rowKey] = this.defaultDetailTab;
        }
      });
    }
  }

  // ==================== 表格頭部事件處理 ====================

  onAddMainItem(): void {
    if (this.editingRowIndex !== null || this.editingDetail !== null) {
      console.warn('請先完成當前編輯操作');
      return;
    }
    this.addMainItem.emit();
  }

  onBatchDelete(): void {
    if (this.selectedItems.length === 0) {
      console.warn('請選擇要刪除的項目');
      return;
    }
    if (this.editingRowIndex !== null || this.editingDetail !== null) {
      console.warn('請先完成當前編輯操作');
      return;
    }
    this.batchDelete.emit([...this.selectedItems]);
  }

  onExpandAll(): void {
    const dataKey = this.mergedConfig.dataKey || 'id';
    if (this.isAllExpanded) {
      this.expandedRows = {};
    } else {
      this.data.forEach(item => {
        this.expandedRows[item[dataKey]] = true;
      });
    }
  }

  // ==================== 🔧 修復主表格事件處理 ====================

  onRowEditStart(event: { data: any; index: number }): void {
    if (this.editingRowIndex !== null || this.editingDetail !== null) {
      console.warn('已有其他行在編輯中');
      return;
    }

    const dataKey = this.mergedConfig.dataKey || 'id';

    // 🔧 修復：確保編輯狀態正確設定
    this.editingRowIndex = event.index;
    this.clonedItems[event.data[dataKey]] = { ...event.data };

    // 🔧 同步狀態到服務
    this.stateService.startRowEdit(event.index, event.data, dataKey);

    this.rowEdit.emit(event.data);
    
    console.log(`✅ 主組件開始編輯: ${event.index}, 當前editingRowIndex: ${this.editingRowIndex}`);
  }

  onRowEditSave(event: { data: any; index: number }): void {
    const dataKey = this.mergedConfig.dataKey || 'id';
    const oldData = this.clonedItems[event.data[dataKey]];

    // 🔧 修復：正確清理編輯狀態
    delete this.clonedItems[event.data[dataKey]];
    this.editingRowIndex = null;

    // 🔧 同步狀態到服務
    this.stateService.saveRowEdit(event.data, dataKey);

    this.rowSave.emit({ oldData, newData: event.data });
    
    console.log(`✅ 主組件儲存編輯: ${event.index}, editingRowIndex: ${this.editingRowIndex}`);
  }

  onRowEditCancel(event: { data: any; index: number }): void {
    const dataKey = this.mergedConfig.dataKey || 'id';
    const originalData = this.clonedItems[event.data[dataKey]];

    // 🔧 關鍵：恢復原始資料
    if (originalData) {
      Object.assign(event.data, originalData);
    }

    // 🔧 修復：正確清理編輯狀態
    delete this.clonedItems[event.data[dataKey]];
    this.editingRowIndex = null;

    // 🔧 同步狀態到服務
    this.stateService.cancelRowEdit(event.data, dataKey);

    this.rowCancel.emit(event.data);
    
    console.log(`✅ 主組件取消編輯: ${event.index}, editingRowIndex: ${this.editingRowIndex}`);
  }

  onSelectionChange(selectedItems: any[]): void {
    this.selectedItems = selectedItems;
    this.selectionChange.emit(selectedItems);
  }

  onRowSelect(data: any): void {
    this.rowSelect.emit(data);
  }

  onRowUnselect(data: any): void {
    this.rowUnselect.emit(data);
  }

  onRowExpand(data: any): void {
    const dataKey = this.mergedConfig.dataKey || 'id';
    const rowKey = data[dataKey];
    this.expandedRows[rowKey] = true;
  }

  onRowCollapse(data: any): void {
    const dataKey = this.mergedConfig.dataKey || 'id';
    const rowKey = data[dataKey];
    delete this.expandedRows[rowKey];
  }

  onCellValueChange(context: EditContext): void {
    this.fieldChange.emit(context);

    // 如果是下拉選單，同時觸發下拉變更事件
    const column = this.columns.find(col => col.field === context.field);
    if (column?.type === 'dropdown') {
      this.dropdownChange.emit(context);
    }
  }

  // ==================== 詳細資料事件處理 ====================

  onDetailEditStart(event: { data: any; parentData: any; parentIndex: number; detailIndex: number }): void {
    if (this.editingRowIndex !== null || this.editingDetail !== null) {
      console.warn('已有其他項目在編輯中');
      return;
    }

    const detailKey = this.mergedConfig.dataKey || 'id';

    this.editingDetail = { rowIndex: event.parentIndex, detailIndex: event.detailIndex };
    this.clonedDetails[event.data[detailKey]] = { ...event.data };

    this.detailEdit.emit(event.data);
  }

  onDetailEditSave(event: { data: any; parentData: any; parentIndex: number; detailIndex: number }): void {
    const detailKey = this.mergedConfig.dataKey || 'id';
    const oldDetail = this.clonedDetails[event.data[detailKey]];

    delete this.clonedDetails[event.data[detailKey]];
    this.editingDetail = null;

    this.detailSave.emit({
      oldDetail,
      newDetail: event.data,
      parentData: event.parentData
    });
  }

  onDetailEditCancel(event: { data: any; parentData: any; parentIndex: number; detailIndex: number }): void {
    const detailKey = this.mergedConfig.dataKey || 'id';
    const originalData = this.clonedDetails[event.data[detailKey]];

    if (originalData) {
      Object.assign(event.data, originalData);
    }

    delete this.clonedDetails[event.data[detailKey]];
    this.editingDetail = null;

    this.detailCancel.emit(event.data);
  }

  onDetailSelectionChange(parentData: any, selectedItems: any[]): void {
    const dataKey = this.mergedConfig.dataKey || 'id';
    const parentKey = parentData[dataKey];
    this.detailSelectedItems[parentKey] = selectedItems;
  }

  onDetailTabChange(event: { parentData: any; tabId: string }): void {
    const dataKey = this.mergedConfig.dataKey || 'id';
    const rowKey = event.parentData[dataKey];
    this.detailSelectedTabs[rowKey] = event.tabId;
    this.detailTabChange.emit({
      rowData: event.parentData,
      tabId: event.tabId
    });
  }

  onAddDetailItem(parentData: any): void {
    if (this.editingRowIndex !== null || this.editingDetail !== null) {
      console.warn('請先完成當前編輯操作');
      return;
    }
    this.addDetailItem.emit(parentData);
  }

  onDetailBatchDelete(event: { selectedItems: any[]; parentData: any; parentIndex: number }): void {
    if (event.selectedItems.length === 0) {
      console.warn('請選擇要刪除的詳細資料項目');
      return;
    }
    if (this.editingRowIndex !== null || this.editingDetail !== null) {
      console.warn('請先完成當前編輯操作');
      return;
    }

    this.detailBatchDelete.emit({
      selectedDetails: event.selectedItems,
      parentData: event.parentData,
      rowIndex: event.parentIndex
    });
  }

  onDetailCellValueChange(context: DetailEditContext): void {
    // 轉換為通用的 EditContext
    const editContext: EditContext = {
      rowData: context.rowData,
      rowIndex: context.rowIndex,
      field: context.field,
      oldValue: context.oldValue,
      newValue: context.newValue
    };

    this.fieldChange.emit(editContext);
  }

  // ==================== 工具方法 ====================

  /**
   * 取得指定行的詳細資料
   */
  getRowDetailData(rowData: any): any[] {
    return rowData[this.detailKey] || [];
  }

  /**
   * 取得指定行的詳細資料選中項目
   */
  getRowDetailSelectedItems(rowData: any): any[] {
    const dataKey = this.mergedConfig.dataKey || 'id';
    const parentKey = rowData[dataKey];
    return this.detailSelectedItems[parentKey] || [];
  }

  /**
   * 取得指定行的當前詳細資料分頁
   */
  getRowDetailCurrentTab(rowData: any): string {
    const dataKey = this.mergedConfig.dataKey || 'id';
    const rowKey = rowData[dataKey];
    return this.detailSelectedTabs[rowKey] || this.defaultDetailTab;
  }

  /**
   * 取得指定行的詳細資料欄位
   */
  getRowDetailColumns(rowData: any): ColumnDef[] {
    if (this.showDetailTabs) {
      const currentTab = this.getRowDetailCurrentTab(rowData);
      return this.detailColumnsMap[currentTab] || this.detailColumns;
    }
    return this.detailColumns;
  }

  /**
   * 檢查是否有展開內容
   */
  get hasExpandableContent(): boolean {
    return this.mergedConfig.expandable === true ||
      this.detailColumns.length > 0 ||
      !!this.expandedContentTemplate;
  }

  /**
   * 取得選中項目數量
   */
  get selectedCount(): number {
    return this.selectedItems.length;
  }

  /**
   * 檢查是否全部展開
   */
  get isAllExpanded(): boolean {
    if (!this.data || this.data.length === 0) return false;
    const dataKey = this.mergedConfig.dataKey || 'id';
    return this.data.every(item => this.expandedRows[item[dataKey]]);
  }

  /**
   * 取得表格樣式類別
   */
  get tableContainerClass(): string {
    let classes = 'smart-data-table-container';

    if (this.mergedConfig.loading) {
      classes += ' loading';
    }

    if (this.mergedConfig.readonly) {
      classes += ' readonly';
    }

    if (this.hasExpandableContent) {
      classes += ' expandable';
    }

    return classes;
  }
}
