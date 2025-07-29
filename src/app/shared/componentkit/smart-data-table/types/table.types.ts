// shared/componentkit/smart-data-table/types/table.types.ts

import { EventEmitter, TemplateRef } from '@angular/core';
import { ColumnDef } from './column.types';

export type SelectionMode = 'single' | 'multiple' | null;

export interface TableConfig {
  // 基本設定
  readonly?: boolean;
  loading?: boolean;

  // 分頁設定
  paginator?: boolean;
  rows?: number;
  totalRecords?: number;

  // 選擇設定
  selectionMode?: SelectionMode;
  showCheckBox?: boolean;

  // 展開設定
  expandable?: boolean;
  detailKey?: string;

  // 按鈕顯示設定
  showAddButton?: boolean;
  showBatchDelete?: boolean;
  showDetailAddButton?: boolean;
  showDetailBatchDelete?: boolean;

  // 詳細資料分頁設定
  showDetailTabs?: boolean;
  defaultDetailTab?: string;

  // 響應式設定
  responsive?: boolean;

  // 訊息設定
  emptyMessage?: string;

  // 資料鍵值
  dataKey?: string;

  // 自定義模板
  expandedContentTemplate?: TemplateRef<any>;

  // 🔧 添加缺少的屬性
  showRefreshButton?: boolean;
  showLoadingIndicator?: boolean;
  showSelectionInfo?: boolean;
  showFooter?: boolean;
}

export interface DetailTabOption {
  id: string;
  label: string;
  columns?: ColumnDef[];
}

export interface TableState {
  // 編輯狀態
  editingRow: number | null;
  editingDetail: { rowIndex: number; detailIndex: number } | null;

  // 選擇狀態
  selectedItems: any[];
  detailSelectedItems: { [mainRowKey: string]: any[] };

  // 展開狀態
  expandedRows: { [key: string]: boolean };
  isAllExpanded: boolean;

  // 分頁狀態
  first: number;

  // 詳細資料分頁狀態
  detailSelectedTabs: { [key: string]: string };

  // 複製的資料（用於取消編輯）
  clonedItems: { [key: string]: any };
  clonedDetails: { [key: string]: any };
}

export interface EditContext {
  rowData: any;
  rowIndex: number;
  field: string;
  oldValue: any;
  newValue: any;
}

export interface DetailEditContext extends EditContext {
  parentData: any;
  detailIndex: number;
}

// 事件介面
export interface TableEvents {
  // 主表格事件
  onRowEdit?: (data: any) => void;
  onRowSave?: (context: { oldData: any; newData: any }) => void;
  onRowCancel?: (data: any) => void;

  // 詳細資料事件
  onDetailEdit?: (data: any) => void;
  onDetailSave?: (context: { oldDetail: any; newDetail: any; parentData: any }) => void;
  onDetailCancel?: (data: any) => void;

  // 選擇事件
  onRowSelect?: (data: any) => void;
  onRowUnselect?: (data: any) => void;
  onSelectionChange?: (selectedItems: any[]) => void;

  // 操作事件
  onAddMainItem?: () => void;
  onAddDetailItem?: (parentData: any) => void;
  onBatchDelete?: (selectedItems: any[]) => void;
  onDetailBatchDelete?: (context: { selectedDetails: any[]; parentData: any; rowIndex: number }) => void;

  // 展開事件
  onRowExpand?: (data: any) => void;
  onRowCollapse?: (data: any) => void;

  // 分頁事件
  onPageChange?: (event: any) => void;

  // 詳細資料分頁事件
  onDetailTabChange?: (context: { rowData: any; tabId: string }) => void;

  // 欄位變更事件
  onFieldChange?: (context: EditContext) => void;
  onDropdownChange?: (context: EditContext) => void;
}

// 表格操作介面
export interface TableActions {
  // 編輯操作
  startEdit(rowIndex: number): void;
  saveEdit(rowIndex: number): void;
  cancelEdit(rowIndex: number): void;

  // 詳細資料編輯操作
  startDetailEdit(rowIndex: number, detailIndex: number): void;
  saveDetailEdit(rowIndex: number, detailIndex: number): void;
  cancelDetailEdit(rowIndex: number, detailIndex: number): void;

  // 展開操作
  expandRow(rowData: any): void;
  collapseRow(rowData: any): void;
  expandAll(): void;
  collapseAll(): void;

  // 選擇操作
  selectRow(rowData: any): void;
  unselectRow(rowData: any): void;
  selectAll(): void;
  unselectAll(): void;

  // 新增操作
  addMainItem(): void;
  addDetailItem(parentData: any): void;

  // 刪除操作
  batchDelete(): void;
  detailBatchDelete(parentData: any): void;
}

// 預設值
export const DEFAULT_TABLE_CONFIG: Required<TableConfig> = {
  readonly: false,
  loading: false,
  paginator: true,
  rows: 10,
  totalRecords: 0,
  selectionMode: 'multiple',
  showCheckBox: true,
  expandable: false,
  detailKey: 'details',
  showAddButton: true,
  showBatchDelete: true,
  showDetailAddButton: true,
  showDetailBatchDelete: true,
  showDetailTabs: false,
  defaultDetailTab: '',
  responsive: true,
  emptyMessage: '查無資料',
  dataKey: 'id',
  expandedContentTemplate: null as any,
  showRefreshButton: false,
  showLoadingIndicator: false,
  showSelectionInfo: false,
  showFooter: false
};

export const DEFAULT_TABLE_STATE: TableState = {
  editingRow: null,
  editingDetail: null,
  selectedItems: [],
  detailSelectedItems: {},
  expandedRows: {},
  isAllExpanded: false,
  first: 0,
  detailSelectedTabs: {},
  clonedItems: {},
  clonedDetails: {}
};
