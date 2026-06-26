import { EventEmitter, Injectable } from '@angular/core';
import { TableSelectAllChangeEvent } from 'primeng/table';

@Injectable()
export class TableReportSelectionService {
  public selectedItems: any[] = [];
  public isAllSelected = false;

  // 內部通知元件狀態變更的 EventEmitters
  public selectionChange = new EventEmitter<any[]>();
  public selectAllChange = new EventEmitter<boolean>();

  // 資料載入時預先快取，避免每次勾選都重算
  private _selectableCount = 0;

  /** 資料變更時呼叫一次，預算可選總數 */
  public cacheSelectableCount(data: any[], isRowSelectable: (rowData: any) => boolean | undefined): void {
    this._selectableCount = data.filter(r => isRowSelectable(r) ?? true).length;
  }

  /**
   * 初始化或從外部同步已選取項目
   */
  public syncSelectedItems(items: any[], _data: any[], _isRowSelectable: (rowData: any) => boolean | undefined) {
    this.selectedItems = [...items];
    this._checkIfAllSelected();
  }

  /**
   * 處理單一勾選變更
   */
  public handleSelectionChange(event: any[], _data: any[], _isRowSelectable: (rowData: any) => boolean | undefined) {
    this.selectedItems = [...event];
    this._checkIfAllSelected();

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
    this._selectableCount = 0;
  }

  /** O(1)：比筆數，不再重掃資料 */
  private _checkIfAllSelected(): void {
    this.isAllSelected = this._selectableCount > 0 && this.selectedItems.length === this._selectableCount;
  }
}
