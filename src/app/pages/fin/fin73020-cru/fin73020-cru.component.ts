import { Component } from '@angular/core';
import { KeyValue, NgIf, NgFor, KeyValuePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-fin73020-cru',
    templateUrl: './fin73020-cru.component.html',
    styleUrls: ['./fin73020-cru.component.scss'],
    standalone: true,
    imports: [TableModule, PrimeTemplate, NgIf, FormsModule, NgFor, KeyValuePipe]
})
export class FIN73020CRUComponent {
  rows: RowData[] = [
    { subsystemItem: '基本資料維護', operationName: '扣款項目維護作業', checked: false, operationChecked: false, functionButtons: { 刪除: false, 查詢: false, 確定修改: false }, remark: '' },
    { subsystemItem: '基本資料維護', operationName: '專櫃位置資料維護', checked: false, operationChecked: false, functionButtons: { 刪除: false, 查詢: false, 確定修改: false }, remark: '' },
    { subsystemItem: '商場招商管理', operationName: '潛在客戶資料維護', checked: false, operationChecked: false, functionButtons: { 刪除: false, 查詢: false, 確定修改: false }, remark: '' },
    { subsystemItem: '商場招商管理', operationName: '專櫃訪談記錄維護', checked: false, operationChecked: false, functionButtons: { 刪除: false, 查詢: false, 確定修改: false }, remark: '' },
  ];

  // 計算子系統項目的 rowspan 值
  getRowspan(subsystemItem: string): number {
    return this.rows.filter(row => row.subsystemItem === subsystemItem).length;
  }

  // 檢查是否應顯示子系統項目欄位（只在第一次出現時顯示）
  shouldShowSubsystemItem(row: RowData, index: number): boolean {
    return index === this.rows.findIndex(r => r.subsystemItem === row.subsystemItem);
  }

  // 當子系統項目被勾選時，自動勾選後面的所有項目
  onSubsystemCheckboxChange(subsystemItem: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.rows.forEach(row => {
      if (row.subsystemItem === subsystemItem) {
        row.checked = isChecked;
        row.operationChecked = isChecked;
        Object.keys(row.functionButtons).forEach(key => {
          row.functionButtons[key] = isChecked;
        });
      }
    });
  }

  // 當作業名稱被勾選時，自動勾選所有功能按鈕
  onOperationCheckboxChange(row: RowData, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    row.operationChecked = isChecked;
    Object.keys(row.functionButtons).forEach(key => {
      row.functionButtons[key] = isChecked;
    });

    this.checkSubsystemItem(row.subsystemItem);
  }

  // 檢查子系統項目是否應勾選
  checkSubsystemItem(subsystemItem: string): void {
    const relatedRows = this.rows.filter(row => row.subsystemItem === subsystemItem);
    const allOperationsChecked = relatedRows.every(row => row.operationChecked);
    const allButtonsChecked = relatedRows.every(row => Object.values(row.functionButtons).every(val => val === true));

    // 當所有作業名稱和功能按鈕都被勾選時，自動勾選子系統項目
    if (allOperationsChecked && allButtonsChecked) {
      relatedRows.forEach(row => row.checked = true);
    } else {
      relatedRows.forEach(row => row.checked = false);
    }
  }

  // 設置功能按鈕值
  setButtonValue(row: RowData, key: unknown, value: boolean): void {
    row.functionButtons[key as string] = value;
    this.checkAllButtonsSelected(row);
    this.checkSubsystemItem(row.subsystemItem);
  }

  // 檢查所有功能按鈕是否勾選
  checkAllButtonsSelected(row: RowData): void {
    const allChecked = Object.values(row.functionButtons).every(val => val === true);
    row.operationChecked = allChecked;
  }

  trackByKey(index: number, item: KeyValue<unknown, unknown>): string {
    return String(item.key);
  }

  getButtonValue(row: RowData, key: unknown): boolean {
    return row.functionButtons[key as string];
  }
}

interface RowData {
  subsystemItem: string;
  operationName?: string;
  checked: boolean;
  operationChecked: boolean;
  functionButtons: Record<string, boolean>;
  remark: string; // 新增的備註屬性
}
