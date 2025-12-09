import { TemplateRef } from "@angular/core";
import { CalendarTypeView } from "primeng/calendar";

export interface EditColumn {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  format?: (value: any, index?: number, rowData?: any) => string | number | null; // 格式化(日期、時間...)
  disabled?: (value: any, index?: number, rowData?: any) => boolean;  // 是否禁用 (是否為禁用欄位)
  validate?: ((value: any, rowData: any, data: any[], field: string, header: string) => { isValid: boolean, errorMessage: string[]; })[];
  type?: 'input' | 'inputNumber' | 'percent' | 'dropdown' | 'date' | 'template'; // 欄位類型
  groupField?: string;
  width?: string;
  textAlign?: 'left' | 'right' | 'center' | 'justify' | 'match-parent' | 'initial' | 'inherit' | 'unset' | 'revert' | 'revert-layer' | 'unset';
  showSort?: boolean;
  // inputNumber
  min?: number; // 最小值
  max?: number; // 最大值
  minLength?: string | number | null;
  maxLength?: string | number | null;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  suffix?: string;
  placeholder?: string; // 提示文字
  // dropdown
  options?: any | ((rowData: any) => any); // 支持靜態數據或基於 rowData 生成
  optionLabel?: string; // 下拉選單 optionLabel
  optionValue?: string; // 下拉選單 optionValue
  templateLabel?: string; // 模板欄位 label
  showClear?: boolean; // 是否顯示清除按鈕
  // date
  timeOnly?: boolean;
  showTime?: boolean;
  hourFormat?: string;
  dateFormat?: string;
  showSeconds?: boolean;
  view?: CalendarTypeView;
  minDate?: Date;
  maxDate?: Date;
  isUserInput?: boolean; // 模板是否當成輸入欄位
  // default value generator for new rows
  defaultValueFunction?: () => any;
  // 事件
  calculate?: (rowData: any, value: any) => Record<string, any>;
  onFocus?: (rowData: any, value: any, col: EditColumn, index: number) => void;
  onBlur?: (rowData: any, value: any, col: EditColumn, index: number) => void;

  /** Template 顯示相關配置 */
  templateRef?: TemplateRef<any>; // 自定義模板
  templateDisplayField?: string; // 用於顯示名稱的欄位
  tableTemplate?: () => TemplateRef<any>; // 自定義表格模板
}
export interface ColumnGroup {
  field: string;
  header: string;
  align?: 'left' | 'center' | 'right';
}
// 欄位變更事件
export interface FieldChangeEvent {
  rowData: any;
  field: string;
  value: any;
  index?: number;
}

export interface EditColumnExtend {
  _TABLE_KEY: string;
  _dataStatus: 'original' | 'new' | 'modified' | 'deleted';
  _rowValidationError: boolean;
  _isAutoInsertCandidate: boolean;
  [key: string]: any;
}
