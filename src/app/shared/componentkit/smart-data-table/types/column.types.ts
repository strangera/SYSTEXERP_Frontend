// shared/componentkit/smart-data-table/types/column.types.ts

export type ColumnType = 'text' | 'number' | 'dropdown' | 'date' | 'checkbox';

export type DateFormatType =
  | 'year-month'           // 年月格式 YYYY/MM
  | 'full-date'            // 完整日期 YYYY/MM/DD
  | 'year-month-compact'   // 年月緊湊格式 YYYYMM
  | 'full-date-compact'    // 完整日期緊湊格式 YYYYMMDD
  | 'year-month-dash'      // 年月橫線格式 YYYY-MM
  | 'full-date-dash';      // 完整日期橫線格式 YYYY-MM-DD

export interface DateFormatConfig {
  format: string;
  placeholder: string;
  description: string;
  examples: string[];
  compactMode?: boolean;
  separator?: string;
}

export const DATE_FORMAT_CONFIG: Record<DateFormatType, DateFormatConfig> = {
  'year-month': {
    format: 'YYYY/MM',
    placeholder: 'YYYY/MM 或 201501',
    description: '年月格式（斜線分隔）',
    examples: ['2015/01', '201501', '2015-01'],
  },
  'full-date': {
    format: 'YYYY/MM/DD',
    placeholder: 'YYYY/MM/DD 或 20150115',
    description: '完整日期格式（斜線分隔）',
    examples: ['2015/01/15', '20150115', '2015-01-15'],
  },
  'year-month-compact': {
    format: 'YYYY/MM',
    placeholder: 'YYYYMM',
    description: '年月緊湊格式（純數字）',
    examples: ['201501', '202312'],
    compactMode: true
  },
  'full-date-compact': {
    format: 'YYYY/MM/DD',
    placeholder: 'YYYYMMDD',
    description: '完整日期緊湊格式（純數字）',
    examples: ['20150115', '20231225'],
    compactMode: true
  },
  'year-month-dash': {
    format: 'YYYY/MM',
    placeholder: 'YYYY-MM',
    description: '年月格式（橫線分隔）',
    examples: ['2015-01', '2023-12'],
    separator: '-'
  },
  'full-date-dash': {
    format: 'YYYY/MM/DD',
    placeholder: 'YYYY-MM-DD',
    description: '完整日期格式（橫線分隔）',
    examples: ['2015-01-15', '2023-12-25'],
    separator: '-'
  }
};

export interface ResponsiveWidth {
  desktop?: string;
  tablet?: string;
  mobile?: string;
}

export interface NumberConfig {
  allowDecimal?: boolean;
  decimalPlaces?: number;
  step?: number;
  min?: number;
  max?: number;
  useGrouping?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface DropdownOption {
  label: string;
  value: any;
  disabled?: boolean;
}

// 基礎欄位定義
export interface BaseColumnDef {
  field: string;
  header: string;
  hidden?: boolean;
  readonly?: boolean;

  // 寬度控制
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  flex?: number;
  responsiveWidth?: ResponsiveWidth;
  autoWidth?: boolean;

  // 樣式
  style?: string;
  headerStyle?: string;
  bodyStyle?: string;
}

// 可編輯欄位
export interface EditableColumnDef extends BaseColumnDef {
  editable: true;
  type: ColumnType;

  // 驗證
  required?: boolean;
  validator?: (value: any, rowData?: any) => ValidationResult;

  // 數字欄位專用
  numberConfig?: NumberConfig;

  // 下拉選單專用
  options?: DropdownOption[] | ((rowData?: any) => DropdownOption[]);

  // 日期欄位專用
  dateFormat?: DateFormatType;
  placeholder?: string;

  // 文字欄位專用
  maxLength?: number;

  // 事件處理
  onChange?: (newValue: any, oldValue: any, rowData: any) => void;
}

// 只顯示欄位
export interface DisplayColumnDef extends BaseColumnDef {
  editable?: false | undefined;  // 🔧 允許 undefined
  type?: ColumnType;

  // 自定義格式化
  formatter?: (value: any, rowData?: any) => string;

  // 自定義渲染（用於複雜內容）
  customTemplate?: any; // TemplateRef

  // 🔧 添加 placeholder 和 options 支援
  placeholder?: string;
  options?: DropdownOption[] | ((rowData?: any) => DropdownOption[]);
}

// 🔧 修改聯合型別，使其更靈活
export type ColumnDef = EditableColumnDef | DisplayColumnDef | {
  field: string;
  header: string;
  type?: ColumnType;
  editable?: boolean;
  hidden?: boolean;
  readonly?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  flex?: number;
  responsiveWidth?: ResponsiveWidth;
  autoWidth?: boolean;
  style?: string;
  headerStyle?: string;
  bodyStyle?: string;
  placeholder?: string;
  options?: DropdownOption[] | ((rowData?: any) => DropdownOption[]);
  required?: boolean;
  validator?: (value: any, rowData?: any) => ValidationResult;
  numberConfig?: NumberConfig;
  dateFormat?: DateFormatType;
  maxLength?: number;
  onChange?: (newValue: any, oldValue: any, rowData: any) => void;
  formatter?: (value: any, rowData?: any) => string;
  customTemplate?: any;
};

// 型別守衛
export function isEditableColumn(column: ColumnDef): column is EditableColumnDef {
  return column.editable === true;
}

export function isDisplayColumn(column: ColumnDef): column is DisplayColumnDef {
  return column.editable !== true;
}
