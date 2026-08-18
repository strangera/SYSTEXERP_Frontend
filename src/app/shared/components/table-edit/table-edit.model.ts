import { TemplateRef } from "@angular/core";
import { CalendarTypeView } from "primeng/calendar";

export interface EditColumn {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  format?: (value: any, index?: number, rowData?: any) => string | number | null; // 格式化(日期、時間...)
  disabled?: (value: any, index?: number, rowData?: any) => boolean;  // 是否禁用 (是否為禁用欄位)
  hidden?: boolean | ((rowData: any, index?: number) => boolean); // 是否隱藏 (是否為隱藏欄位)
  validate?: ((value: any, rowData: any, data: any[], field: string, header: string) => { isValid: boolean, errorMessage: string[]; })[];
  /** 標頭紅色 * 顯示控制：validate 使用非 validateRequired 的條件式必填時，用這個補上/動態顯示必填星號（純顯示，不影響實際驗證） */
  required?: boolean | (() => boolean);
  type?: 'input' | 'inputNumber' | 'percent' | 'dropdown' | 'autoComplete' | 'date' | 'template' | 'checkbox' | 'dropdownTable' | 'custom';
  groupField?: string;
  maxWidth?: string;
  minWidth?: string;
  width?: string;
  textAlign?: 'left' | 'right' | 'center' | 'justify' | 'match-parent' | 'initial' | 'inherit' | 'unset' | 'revert' | 'revert-layer' | 'unset';
  showSort?: boolean;
  cellClass?: string | ((rowData: any) => string);
  /** * 新增: 定義該欄位是否需要加總
   * 'sum': 數值加總 (最常用)
   * 'avg': 平均
   * 'count': 計數 (如果是非數值欄位可能有用)
   */
  aggregate?: 'sum' | 'avg' | 'count';
  // AutoComplete
  forceSelection?: boolean; // AutoComplete 是否強制選取建議項
  onFilterComplete?: (event: any, rowData: any, col: EditColumn, index: number) => void; // AutoComplete 搜尋完成事件
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
  optionsAsync?: boolean; // options 是否為異步數據
  optionLabel?: string; // 下拉選單 optionLabel
  optionValue?: string; // 下拉選單 optionValue
  templateLabel?: string; // 模板欄位 label
  showClear?: boolean; // 是否顯示清除按鈕
  triggerFields?: string[]; /** 下拉連動：當這些欄位的值改變時，觸發 options 重新獲取 (僅適用於 options 為 function 的情況) */
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
  // Checkbox
  label?: string;
  binary?: boolean; // 是否為二元 (true/false) 模式，預設為 true
  falseValue?: any; // 未選中時的值，預設為 false
  trueValue?: any;// 選中時的值，預設為 true
  value?: any; // 是否為群組模式 (不常用於單元格，但保留)
  // default value generator for new rows
  defaultValueFunction?: () => any;
  // 事件
  calculate?: (rowData: any, value: any) => Record<string, any>;
  onFocus?: (rowData: any, value: any, col: EditColumn, index: number) => void;
  onBlur?: (rowData: any, value: any, col: EditColumn, index: number) => void;
  onChange?: (rowData: any, value: any, col: EditColumn, index: number) => void;

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
