import { animate, state, style, transition, trigger } from "@angular/animations";
import { NotificationService } from "../../component/notification-message/notification.service";
import { SortMeta } from "primeng/api";
export interface Column {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  visible?: boolean;  // 是否顯示 (可篩選欄位是否顯示？)
  hidden?: boolean;  // 是否隱藏 (是否為無法篩選欄位)
  format?: (value: any) => string | number | null; // 格式化(日期、時間...)

  sortField?: string; // 排序欄位(預設為 field)

  disabled?: (value: any) => boolean;  // 是否禁用 (是否為禁用欄位)

  style?: string; // styles
  maxWidth?: string; // 最大寬度 max-w-{{ col.maxWidth }}

  validate?: ((value: string, rowData: any, data: any[], field: string) => { isValid: boolean, errorMessage: string[] })[]; // 驗證規則(如果是可輸入的欄位)

  type?: 'input' | 'inputNumber' | 'dropdown' | 'button' | 'html' | 'checkbox' | 'date' | 'default'; // 欄位類型
  prefix?: string;
  fractionDigits?: number;

  options?: any | ((rowData: any) => any); // 支持靜態數據或基於 rowData 生成
  optionLabel?: string; // 下拉選單 optionLabel
  optionValue?: string; // 下拉選單 optionValue

  buttonLabel?: string; // 選擇按鈕 label
  chipLabel?: string | undefined; // chips 顯示的 label
  checkboxValue?: string; // checkbox 顯示的 ngModel（適用於陣列資料）
  checkboxLabel?: (value: any) => string; // checkbox 顯示的 label（適用於陣列資料）
  checkboxTrueLabel?: string; // checkbox 非編輯模式 true 顯示文字（適用於單一布林值）
  checkboxFalseLabel?: string; // checkbox 非編輯模式 false 顯示文字（適用於單一布林值）
  dateFormat?: string; // 日期格式（例如 'yy-mm-dd'，僅適用於 type='date'）
  frozen?: boolean;  // 是否凍結 (是否為凍結欄位)
  alignFrozen?: string; // 凍結欄位對齊方式

}

export interface LazyLoadEvent {
  pageIndex: number; // 當前頁碼
  pageSize: number; // 每頁顯示的數量
  SortBy: SortMeta[]; // 排序欄位
}

export const createPaginationConfig = (defaultSortBy?: SortMeta[]) => {
  return {
    pageSize: [10],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [defaultSortBy],
  };
};

export const toggleButtons = trigger('toggleButtons', [
  state('hidden', style({ transform: 'translateX(-10px)', width: '0px', opacity: 0 })),
  state('visible', style({ transform: 'translateX(0px)', width: 'auto', opacity: 1 })),
  transition('hidden <=> visible', [animate('300ms ease-in-out')])
]);

export const expandAnimation = trigger('expandAnimation', [
  state('collapsed', style({ height: '0px', opacity: 0 })),
  state('expanded', style({ height: '*', opacity: 1 })),
  transition('collapsed <=> expanded', animate('200ms ease-in-out'))
]);


export interface AddButton {
  label: string;
  icon: string;
  action: (rowData: any) => void;
  disabled?: (rowData: any) => boolean;
}

export const CreationColumns: Column[] = [
  { field: 'CRT_Date', header: '建立日期', visible: false, format: (value: string) => formatDateTime(value) },
  { field: 'CRT_USR_No', header: '建立人員', visible: false },
  { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
  { field: 'UPD_Date', header: '變更日期', visible: false, format: (value: string) => formatDateTime(value) },
  { field: 'UPD_USR_No', header: '變更人員', visible: false },
  { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
];


export interface RowEditSaveEvent {
  oldData: any;
  newData: any;
  ri: number;
  data: any[];
}
// 欄位變更事件
export interface FieldChangeEvent {
  rowData: any;
  field: string;
  value: any;
}

// 新增一個方法來驗證行數據
export function validateRowData(rowData: any, columns: Column[], data: any, messageService: NotificationService): boolean {
  return columns.every(col =>
    !(col.validate?.some(validateFn => {
      const { isValid, errorMessage } = validateFn(rowData[col.field], rowData, data, col.field);
      if (!isValid) {
        const [message, title] = errorMessage;
        messageService.errorBubble(message, title);
      }
      return !isValid; // 发现验证失败则返回 true，导致 `some` 终止循环
    }))
  );
}

// yyyy-MM-dd
export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
};
// yyy-mm-dd hh:mm:ss
export const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
};
// 000,000,000
export const formatNumber = (number: number | string): string => {
  if (!number) return '0';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
