import { TemplateRef } from "@angular/core";
import { CalendarTypeView } from "primeng/calendar";

export interface EditColumn {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  format?: (value: any, index?: number, rowData?: any) => string | number | null; // 格式化(日期、時間...)
  disabled?: (value: any, index?: number, rowData?: any) => boolean;  // 是否禁用 (是否為禁用欄位)
  validate?: ((value: any, rowData: any, data: any[], field: string, header: string) => { isValid: boolean, errorMessage: string[]; })[];
  type?: 'input' | 'inputNumber' | 'percent' | 'dropdown' | 'date' | 'template' | 'checkbox'; // 欄位類型
  groupField?: string;
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
  /** 下拉搜尋欄位輸入時的回呼，可用來動態更新 options（filterQuery: 使用者輸入的文字） */
  onFilter?: (filterQuery: string, rowData: any, col: EditColumn, index: number) => void;
  allowCustomValue?: boolean; // 允許輸入不在選項中的自訂值
  /** 下拉欄位若值不在 options 中則改用 input 文字輸入框（預設 false：維持下拉） */
  dropdownFallbackToInput?: boolean;
  /** 輸入框優先：預設顯示文字輸入框，右側按鈕可選開啟選項清單 */
  inputWithDropdown?: boolean;
  /** 判斷該列的 options 是否已載入完成（避免 async 載入中誤判 fallback） */
  isOptionsLoaded?: (rowData: any) => boolean;
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
  onDblClick?: (rowData: any, value: any, col: EditColumn, index: number) => void;
  /** 唯讀（可聚焦/雙擊但不可打字，用於「只能挑選不可手輸入」的欄位，如 35 發票） */
  readonly?: (value: any, index: number, rowData: any) => boolean;

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
