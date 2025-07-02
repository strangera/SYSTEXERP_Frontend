import { animate, state, style, transition, trigger } from "@angular/animations";
import { NotificationService } from "../../component/notification-message/notification.service";
import { SortMeta } from "primeng/api";
export interface Column {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  visible?: boolean;  // 是否顯示 (可篩選欄位是否顯示？)
  hidden?: boolean;  // 是否隱藏 (是否為無法篩選欄位)
  format?: (value: any) => string | number | null; // 格式化(日期、時間...)

  showSort?: boolean;
  sortField?: string; // 排序欄位(預設為 field)

  disabled?: (value: any) => boolean;  // 是否禁用 (是否為禁用欄位)

  style?: string; // styles
  maxWidth?: string; // 最大寬度 max-w-{{ col.maxWidth }}

  validate?: ((value: string, rowData: any, data: any[], field: string, header: string) => { isValid: boolean, errorMessage: string[] })[]; // 驗證規則(如果是可輸入的欄位)

  type?: 'input' | 'inputNumber' | 'dropdown' | 'button' | 'html' | 'checkbox' | 'date' | 'default'; // 欄位類型
  prefix?: string;
  fractionDigits?: number;
  useGrouping?: boolean;

  options?: any | ((rowData: any) => any); // 支持靜態數據或基於 rowData 生成
  optionLabel?: string; // 下拉選單 optionLabel
  optionValue?: string; // 下拉選單 optionValue

  buttonLabel?: string; // 選擇按鈕 label
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
    pageSize: [100],
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
export function validateRowData(rowData: any, columns: Column[], data: any, messageService: NotificationService, dataKey: string): boolean {
  // 新增的預設判斷：檢查除了 dataKey 以外的所有欄位是否都為 null/undefined/空字串
  const otherColumns = columns.filter(col => col.field !== dataKey);
  const allOtherFieldsAreEmpty = otherColumns.every(col => {
    const value = rowData[col.field];
    return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
  });

  if (allOtherFieldsAreEmpty) {
    messageService.errorBubble('請輸入至少一個欄位的值', '未輸入任何值');
    return false; // 驗證失敗
  }

  // 原始的驗證邏輯
  return columns.every(col =>
    !(col.validate?.some(validateFn => {
      const { isValid, errorMessage } = validateFn(rowData[col.field], rowData, data, col.field, col.header);
      if (!isValid) {
        const [message, title] = errorMessage;
        messageService.errorBubble(message, title);
      }
      return !isValid;
    }))
  );
}
//formatDate：會輸出 2024/05/27 格式
export const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

//formatDateTime：會輸出 2024/05/27 14:30:25 格式
export const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

// formatYYYYMM 輸出為 YYYY/MM
export const formatYYYYMM = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}/${month}`;
};

// formatTimeHHMM 輸出為 HH:MM
export const formatTimeHHMM = (value: string | number): string => {
  if (!value) return '';
  const strValue = String(value).padStart(4, '0'); // 確保是4位數字，不足補0
  return `${strValue.substring(0, 2)}:${strValue.substring(2, 4)}`;
};

// 000,000,000
export const formatAmount = (number: number | string): string => {
  if (!number) return '0';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const formatYN = (value: string): string => {
  return value === 'Y' ? '是' : '否';
};
