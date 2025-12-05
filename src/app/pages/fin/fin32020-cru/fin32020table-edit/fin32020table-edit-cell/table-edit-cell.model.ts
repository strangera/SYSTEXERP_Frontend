import { EditColumn } from "../fin32020table-edit.model";

// 定義 Cell 元件的輸入屬性
export interface CellInput {
  rowData: any;
  col: EditColumn;
  index: number;
  disabled: boolean;
  // 為了處理 NgModelChange 和自動插入行邏輯
  onValueChange: (rowData: any, value: any, col: EditColumn, index: number) => void;
  getOptions?: (rowData: any, col: any) => any;
  // 為了處理 Template 欄位 (可選)
  overlayPanel?: any; // OverlayPanel 實例
  templateDisplayValue?: (rowData: any, col: any) => string;
}
