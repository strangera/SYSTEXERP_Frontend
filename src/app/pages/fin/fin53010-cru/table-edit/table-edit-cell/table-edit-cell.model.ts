import { EditColumn } from "../table-edit.model";

// 定義 Cell 元件的輸入屬性
export interface CellInput {
  rowData: any;
  col: EditColumn;
  index: number;
  disabled: boolean;
  // 為了處理 NgModelChange 和自動插入行邏輯
  onValueChange: (rowData: any, value: any, col: EditColumn, index: number) => void;
  // cellEditOnClick：此格是剛被點擊啟用的格子，下拉/日曆應自動展開（單擊即開，不用點兩下）
  autoOpen?: boolean;
  getOptions?: (rowData: any, col: any) => any;
  // 為了處理 Template 欄位 (可選)
  overlayPanel?: any; // OverlayPanel 實例
  templateDisplayValue?: (rowData: any, col: any) => string;
}
