import { EventEmitter, Injectable } from '@angular/core';
import { TableSelectAllChangeEvent } from 'primeng/table';

@Injectable()
export class TableReportSelectionService {
  public selectedItems: any[] = [];
  public isAllSelected = false;

  // 內部通知元件狀態變更的 EventEmitters
  public selectionChange = new EventEmitter<any[]>();
  public selectAllChange = new EventEmitter<boolean>();

  /**
   * 初始化或從外部同步已選取項目
   */
  public syncSelectedItems(items: any[], data: any[], isRowSelectable: (rowData: any) => boolean | undefined) {
    this.selectedItems = [...items];
    this.checkIfAllSelected(data, isRowSelectable);
  }

  /**
   * 處理單一勾選變更
   */
  public handleSelectionChange(event: any[], data: any[], isRowSelectable: (rowData: any) => boolean | undefined) {
    this.selectedItems = [...event];
    this.checkIfAllSelected(data, isRowSelectable);

    this.selectionChange.emit(this.selectedItems);
    this.selectAllChange.emit(this.isAllSelected);
  }

  /**
   * 處理全選/全取消變更
   */
  public handleSelectAllChange(event: TableSelectAllChangeEvent, data: any[], isRowSelectable: (rowData: any) => boolean | undefined) {
    const checked = event.checked;
    if (checked) {
      // 僅過濾出目前資料中真正「可以被勾選」的資料
      this.selectedItems = data.filter(rowData => isRowSelectable(rowData) ?? true);
      this.isAllSelected = this.selectedItems.length > 0;
    } else {
      this.selectedItems = [];
      this.isAllSelected = false;
    }

    this.selectionChange.emit(this.selectedItems);
    this.selectAllChange.emit(this.isAllSelected);
  }

  /**
   * 處理 Lazy 載入時的全選保持邏輯
   */
  public handleLazyLoadSelection(data: any[], isRowSelectable: (rowData: any) => boolean | undefined) {
    if (this.isAllSelected) {
      this.selectedItems = data.filter(rowData => isRowSelectable(rowData) ?? true);
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(true);
    } else {
      this.selectedItems = [...this.selectedItems];
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(false);
    }
  }

  /**
   * 重置勾選狀態
   */
  public reset() {
    this.selectedItems = [];
    this.isAllSelected = false;
  }

  /**
   * 檢查當前選取的筆數是否等於全部可選取的筆數
   */
  private checkIfAllSelected(data: any[], isRowSelectable: (rowData: any) => boolean | undefined) {
    const selectableRows = data.filter(rowData => isRowSelectable(rowData) ?? true);
    this.isAllSelected = selectableRows.length > 0 && this.selectedItems.length === selectableRows.length;
  }
}
