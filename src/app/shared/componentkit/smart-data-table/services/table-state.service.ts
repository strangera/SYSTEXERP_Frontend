// shared/componentkit/smart-data-table/services/table-state.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableState, TableConfig, DEFAULT_TABLE_STATE, DEFAULT_TABLE_CONFIG } from '../types/table.types';

@Injectable({
  providedIn: 'root'
})
export class TableStateService {

  // 狀態主體
  private stateSubject = new BehaviorSubject<TableState>(DEFAULT_TABLE_STATE);
  private configSubject = new BehaviorSubject<TableConfig>(DEFAULT_TABLE_CONFIG);

  // 對外暴露的 Observable
  public readonly state$ = this.stateSubject.asObservable();
  public readonly config$ = this.configSubject.asObservable();

  // 快速存取當前狀態
  get currentState(): TableState {
    return this.stateSubject.value;
  }

  get currentConfig(): TableConfig {
    return this.configSubject.value;
  }

  // ==================== 配置管理 ====================

  /**
   * 更新表格配置
   */
  updateConfig(config: Partial<TableConfig>): void {
    const newConfig = { ...this.currentConfig, ...config };
    this.configSubject.next(newConfig);
  }

  /**
   * 重置配置為預設值
   */
  resetConfig(): void {
    this.configSubject.next({ ...DEFAULT_TABLE_CONFIG });
  }

  // ==================== 編輯狀態管理 ====================

  /**
   * 開始編輯主表格行
   */
  startRowEdit(rowIndex: number, rowData: any, dataKey: string): void {
    const currentState = this.currentState;

    // 檢查是否已有其他行在編輯
    if (currentState.editingRow !== null || currentState.editingDetail !== null) {
      console.warn('已有其他行在編輯中，請先完成或取消當前編輯');
      return;
    }

    // 複製資料用於取消操作
    const clonedItems = { ...currentState.clonedItems };
    clonedItems[rowData[dataKey]] = { ...rowData };

    this.updateState({
      editingRow: rowIndex,
      clonedItems
    });
  }

  /**
   * 儲存主表格行編輯
   */
  saveRowEdit(rowData: any, dataKey: string): void {
    const currentState = this.currentState;
    const clonedItems = { ...currentState.clonedItems };
    delete clonedItems[rowData[dataKey]];

    this.updateState({
      editingRow: null,
      clonedItems
    });
  }

  /**
   * 取消主表格行編輯
   */
  cancelRowEdit(rowData: any, dataKey: string): any {
    const currentState = this.currentState;
    const originalData = currentState.clonedItems[rowData[dataKey]];
    const clonedItems = { ...currentState.clonedItems };
    delete clonedItems[rowData[dataKey]];

    this.updateState({
      editingRow: null,
      clonedItems
    });

    return originalData;
  }

  /**
   * 開始編輯詳細資料
   */
  startDetailEdit(rowIndex: number, detailIndex: number, detailData: any, detailKey: string = 'id'): void {
    const currentState = this.currentState;

    // 檢查是否已有其他在編輯
    if (currentState.editingRow !== null || currentState.editingDetail !== null) {
      console.warn('已有其他項目在編輯中，請先完成或取消當前編輯');
      return;
    }

    // 複製詳細資料
    const clonedDetails = { ...currentState.clonedDetails };
    clonedDetails[detailData[detailKey]] = { ...detailData };

    this.updateState({
      editingDetail: { rowIndex, detailIndex },
      clonedDetails
    });
  }

  /**
   * 儲存詳細資料編輯
   */
  saveDetailEdit(detailData: any, detailKey: string = 'id'): void {
    const currentState = this.currentState;
    const clonedDetails = { ...currentState.clonedDetails };
    delete clonedDetails[detailData[detailKey]];

    this.updateState({
      editingDetail: null,
      clonedDetails
    });
  }

  /**
   * 取消詳細資料編輯
   */
  cancelDetailEdit(detailData: any, detailKey: string = 'id'): any {
    const currentState = this.currentState;
    const originalData = currentState.clonedDetails[detailData[detailKey]];
    const clonedDetails = { ...currentState.clonedDetails };
    delete clonedDetails[detailData[detailKey]];

    this.updateState({
      editingDetail: null,
      clonedDetails
    });

    return originalData;
  }

  /**
   * 檢查指定行是否在編輯中
   */
  isRowEditing(rowIndex: number): boolean {
    return this.currentState.editingRow === rowIndex;
  }

  /**
   * 檢查指定詳細資料是否在編輯中
   */
  isDetailEditing(rowIndex: number, detailIndex: number): boolean {
    const editing = this.currentState.editingDetail;
    return editing !== null &&
      editing.rowIndex === rowIndex &&
      editing.detailIndex === detailIndex;
  }

  // ==================== 選擇狀態管理 ====================

  /**
   * 設定選中的項目
   */
  setSelectedItems(items: any[]): void {
    this.updateState({ selectedItems: [...items] });
  }

  /**
   * 添加選中項目
   */
  addSelectedItem(item: any): void {
    const currentItems = this.currentState.selectedItems;
    if (!currentItems.find(i => i === item)) {
      this.updateState({ selectedItems: [...currentItems, item] });
    }
  }

  /**
   * 移除選中項目
   */
  removeSelectedItem(item: any): void {
    const currentItems = this.currentState.selectedItems;
    const newItems = currentItems.filter(i => i !== item);
    this.updateState({ selectedItems: newItems });
  }

  /**
   * 清空選中項目
   */
  clearSelectedItems(): void {
    this.updateState({ selectedItems: [] });
  }

  /**
   * 設定詳細資料選中項目
   */
  setDetailSelectedItems(parentKey: string, items: any[]): void {
    const currentDetailSelected = { ...this.currentState.detailSelectedItems };
    currentDetailSelected[parentKey] = [...items];
    this.updateState({ detailSelectedItems: currentDetailSelected });
  }

  /**
   * 取得詳細資料選中項目數量
   */
  getDetailSelectedCount(parentKey: string): number {
    return this.currentState.detailSelectedItems[parentKey]?.length || 0;
  }

  // ==================== 展開狀態管理 ====================

  /**
   * 設定行展開狀態
   */
  setRowExpanded(rowKey: string, expanded: boolean): void {
    const expandedRows = { ...this.currentState.expandedRows };
    if (expanded) {
      expandedRows[rowKey] = true;
    } else {
      delete expandedRows[rowKey];
    }
    this.updateState({ expandedRows });
  }

  /**
   * 展開所有行
   */
  expandAll(data: any[], dataKey: string): void {
    const expandedRows: { [key: string]: boolean } = {};
    data.forEach(item => {
      expandedRows[item[dataKey]] = true;
    });
    this.updateState({
      expandedRows,
      isAllExpanded: true
    });
  }

  /**
   * 收合所有行
   */
  collapseAll(): void {
    this.updateState({
      expandedRows: {},
      isAllExpanded: false
    });
  }

  /**
   * 切換全部展開/收合
   */
  toggleExpandAll(data: any[], dataKey: string): void {
    if (this.currentState.isAllExpanded) {
      this.collapseAll();
    } else {
      this.expandAll(data, dataKey);
    }
  }

  /**
   * 檢查行是否已展開
   */
  isRowExpanded(rowKey: string): boolean {
    return !!this.currentState.expandedRows[rowKey];
  }

  // ==================== 分頁狀態管理 ====================

  /**
   * 設定分頁起始位置
   */
  setFirst(first: number): void {
    this.updateState({ first });
  }

  /**
   * 處理分頁變更
   */
  handlePageChange(event: any): void {
    this.updateState({ first: event.first });
  }

  // ==================== 詳細資料分頁管理 ====================

  /**
   * 設定詳細資料分頁
   */
  setDetailTab(rowKey: string, tabId: string): void {
    const detailSelectedTabs = { ...this.currentState.detailSelectedTabs };
    detailSelectedTabs[rowKey] = tabId;
    this.updateState({ detailSelectedTabs });
  }

  /**
   * 取得詳細資料當前分頁
   */
  getDetailTab(rowKey: string, defaultTab: string = ''): string {
    return this.currentState.detailSelectedTabs[rowKey] || defaultTab;
  }

  // ==================== 重置與清理 ====================

  /**
   * 重置所有狀態
   */
  resetState(): void {
    this.stateSubject.next({ ...DEFAULT_TABLE_STATE });
  }

  /**
   * 清理編輯狀態（在切換資料時使用）
   */
  clearEditingState(): void {
    this.updateState({
      editingRow: null,
      editingDetail: null,
      clonedItems: {},
      clonedDetails: {}
    });
  }

  /**
   * 初始化詳細資料陣列（確保每行都有詳細資料陣列）
   */
  initializeDetailArrays(data: any[], detailKey: string): void {
    if (data && data.length > 0) {
      data.forEach(rowData => {
        if (!rowData[detailKey]) {
          rowData[detailKey] = [];
        }
      });
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 更新狀態的通用方法
   */
  private updateState(partialState: Partial<TableState>): void {
    const currentState = this.currentState;
    const newState = { ...currentState, ...partialState };
    this.stateSubject.next(newState);
  }

  /**
   * 銷毀服務時清理資源
   */
  ngOnDestroy(): void {
    this.stateSubject.complete();
    this.configSubject.complete();
  }
}
