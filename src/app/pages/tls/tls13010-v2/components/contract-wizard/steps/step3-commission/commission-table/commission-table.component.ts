/**
 * 抽成設定表格子組件
 * 處理抽成項目的表格顯示和事件轉發
 */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ColumnDef, ExpandableEditTableComponent } from '@others/component/expandable-edit-table/expandable-edit-table.component';
import { AccordionModule } from 'primeng/accordion';
import { CommissionItem } from '../../../../../core/models';

// 標籤頁選項型別
type DetailTabOption = { id: string; label: string; allowAdd: boolean; allowBatchDelete: boolean; showCheckbox: boolean };

// 事件介面定義
export interface FieldChangeEvent {
  fieldName: string;
  newValue: unknown;
  rowData: unknown;
}

export interface DetailFieldChangeEvent {
  fieldName: string;
  newValue: unknown;
  detailData: unknown;
  parentData: CommissionItem;
}

export interface TabChangeEvent {
  rowData: CommissionItem;
  tabId: string;
}

export interface AddDetailEvent {
  parentData: CommissionItem;
}

export interface BatchDeleteEvent {
  selectedItems: unknown[];
}

export interface DetailBatchDeleteEvent {
  selectedDetails: unknown[];
  parentData: CommissionItem;
}

export interface ButtonClickEvent {
  field: string;
  detailData: unknown;
  parentData: CommissionItem;
}

@Component({
  selector: 'app-commission-table',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    ExpandableEditTableComponent
  ],
  templateUrl: './commission-table.component.html'
})
export class CommissionTableComponent {
  // === 輸入屬性 ===
  /** 抽成資料 */
  @Input() commissionData: CommissionItem[] = [];

  /** 抽成主欄位定義 */
  @Input() commissionColumns: ColumnDef[] = [];

  /** 標籤頁選項 */
  @Input() settingTabs: DetailTabOption[] = [];

  /** 各標籤頁對應的欄位定義 */
  @Input() detailColumnsMap: Record<string, ColumnDef[]> = {};

  /** 是否為檢視模式 */
  @Input() isViewMode = false;

  /** 資料是否已載入 */
  @Input() dataLoaded = false;

  /** 手風琴標題 */
  @Input() headerText = '抽成設定';

  /** 預設展開的標籤 */
  @Input() defaultDetailTab = 'discount';

  // === 輸出事件 ===
  /** 主項目欄位變更 */
  @Output() fieldChange = new EventEmitter<FieldChangeEvent>();

  /** 明細項目欄位變更 */
  @Output() detailFieldChange = new EventEmitter<DetailFieldChangeEvent>();

  /** 標籤頁切換 */
  @Output() detailTabChange = new EventEmitter<TabChangeEvent>();

  /** 新增主項目 */
  @Output() addMainItem = new EventEmitter<void>();

  /** 新增明細項目 */
  @Output() addDetailItem = new EventEmitter<AddDetailEvent>();

  /** 批量刪除主項目 */
  @Output() batchDelete = new EventEmitter<BatchDeleteEvent>();

  /** 批量刪除明細項目 */
  @Output() detailBatchDelete = new EventEmitter<DetailBatchDeleteEvent>();

  /** 明細按鈕點擊 */
  @Output() detailButtonClick = new EventEmitter<ButtonClickEvent>();

  // === 計算屬性 ===
  /** 過濾掉已刪除的項目 */
  get visibleCommissionData(): CommissionItem[] {
    return this.commissionData.filter(item => item._status !== 'deleted');
  }

  // === 事件處理方法（轉發至父組件）===
  onFieldChange(event: { fieldName: string; newValue: unknown; rowData: unknown }): void {
    this.fieldChange.emit(event);
  }

  onDetailFieldChange(event: { fieldName: string; newValue: unknown; detailData: unknown; parentData: unknown }): void {
    this.detailFieldChange.emit({
      fieldName: event.fieldName,
      newValue: event.newValue,
      detailData: event.detailData,
      parentData: event.parentData as CommissionItem
    });
  }

  onDetailTabChange(event: { rowData: unknown; tabId: string }): void {
    this.detailTabChange.emit({
      rowData: event.rowData as CommissionItem,
      tabId: event.tabId
    });
  }

  onAddMainItem(): void {
    this.addMainItem.emit();
  }

  onAddDetailItem(parentData: unknown): void {
    this.addDetailItem.emit({
      parentData: parentData as CommissionItem
    });
  }

  onBatchDelete(selectedItems: unknown[]): void {
    this.batchDelete.emit({ selectedItems });
  }

  onDetailBatchDelete(event: { selectedDetails: unknown[]; parentData: unknown }): void {
    this.detailBatchDelete.emit({
      selectedDetails: event.selectedDetails,
      parentData: event.parentData as CommissionItem
    });
  }

  onDetailButtonClick(event: { field: string; detailData: unknown; parentData: unknown }): void {
    this.detailButtonClick.emit({
      field: event.field,
      detailData: event.detailData,
      parentData: event.parentData as CommissionItem
    });
  }
}
