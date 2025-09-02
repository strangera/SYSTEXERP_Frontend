export interface Column {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  format?: (value: any) => string | number | null; // 格式化(日期、時間...)
  disabled?: (value: any, index?: number, rowData?: any) => boolean;  // 是否禁用 (是否為禁用欄位)
  validate?: ((value: any, rowData: any, data: any[], field: string, header: string) => { isValid: boolean, errorMessage: string[]; })[];
  type?: 'input' | 'inputNumber' | 'dropdown'; // 欄位類型
  // dropdown
  options?: any | ((rowData: any) => any); // 支持靜態數據或基於 rowData 生成
  optionLabel?: string; // 下拉選單 optionLabel
  optionValue?: string; // 下拉選單 optionValue
  templateLabel?: string; // 模板欄位 label
  showClear?: boolean; // 是否顯示清除按鈕
}
// 欄位變更事件
export interface FieldChangeEvent {
  rowData: any;
  field: string;
  value: any;
  index?: number;
}
