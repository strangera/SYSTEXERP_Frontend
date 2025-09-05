import { animate, state, style, transition, trigger } from "@angular/animations";
import { NotificationService } from "../../component/notification-message/notification.service";
import { SortMeta } from "primeng/api";
export interface Column {
  field: string;
  header: string;
  visible?: boolean;
  hidden?: boolean;
  format?: (value: any) => string | number | null;

  // 群組/小計/總計
  groupField?: string;
  isSubTotal?: boolean;
  isTotal?: boolean;

  // 排序
  showSort?: boolean;
  sortField?: string;

  /** ✅ 表頭兩列控制；不用給預設（在 component 會用 ?? 1 補） */
  rowspan?: boolean;
  headerRow?: 1 | 2;

  /** ✅ 樣式在 template 有用到 [ngClass]="col.style" */
  style?: string | string[] | Set<string> | { [klass: string]: any };

  /** ✅ 是否顯示「*」必填標記（template 有 col.required） */
  required?: boolean;

  /** ✅ 編輯/輸入相關 */
  disabled?: (value: any) => boolean;
  validate?: ((
    value: string,
    rowData: any,
    data: any[],
    field: string,
    header: string
  ) => { isValid: boolean; errorMessage: string[] })[];

  /** ✅ 列型別：template 用到 'image'、'html'、'date'... */
  type?: 'input' | 'inputNumber' | 'dropdown' | 'button' | 'html' | 'date' | 'image' | 'default';
  prefix?: string;
  fractionDigits?: number;
  useGrouping?: boolean;

  /** ✅ dropdown 用 */
  options?: any | ((rowData: any) => any);
  optionLabel?: string;
  optionValue?: string;

  /** ✅ button / checkbox / date 額外屬性（template 有使用） */
  buttonLabel?: string;
  checkboxTrueLabel?: string;
  checkboxFalseLabel?: string;
  dateFormat?: string;
  minDate?: Date;   // ← p-calendar 用
  maxDate?: Date;   // ← p-calendar 用

  /** ✅ 凍結欄位 */
  frozen?: boolean;
  alignFrozen?: 'left' | 'right';
   exportFormat?: any; // ← 讓它能放物件/陣列，而不是字串
}

export interface ColumnGroup {
  field: string;
  header: string;
  align?: 'left' | 'center' | 'right';
}

export interface ColumnGroupRow {
  columns: ColumnGroup[];
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
  action: (rowData: any, event?: Event) => void;
  disabled?: (rowData: any) => boolean;
}

export interface RowEditSaveEvent {
  oldData: any;
  newData: any;
  ri: number;
  data: any[];
}
// 欄位變更事件
/** 若你之後可能需要帶 rowIndex，可做成可選屬性（不影響現在的呼叫） */
export interface FieldChangeEvent {
  rowData: any;
  field: string;
  value: any;
  rowIndex?: number;   // 可選，現在沒用到也不會報錯
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
export const formatTimeHHMM = (value: string | number | Date): string => {
  if (!value) return '';

  if (value instanceof Date) {
    const hh = String(value.getHours()).padStart(2, '0');
    const mm = String(value.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  const strValue = String(value).padStart(4, '0'); // 確保是4位數，不足補0
  return `${strValue.substring(0, 2)}:${strValue.substring(2, 4)}`;
};


// 000,000,000
export const formatAmount = (val: number | string): string => {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString(); // eg. 1,000,000
};
export const formatYN = (value: string): string => {
  return value === 'Y' ? '是' : '否';
};

export const formatTimeToHHMMSS = (date: Date): string => {
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}
// formatDateToYYYYMMDD：輸出為 YYYYMMDD
export const formatDateToYYYYMMDD = (value: string | Date): string => {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};

// 輸出YYYYMM格式的日期
export const formatYYYYMMToDate = (value: string): Date | null => {
  if (!value || !/^\d{6}$/.test(value)) return null;
  const year = Number(value.substring(0, 4));
  const month = Number(value.substring(4, 6)) - 1; // JS 月份從 0 開始
  return new Date(year, month, 1);
};

// 將 "YYYYMM" 轉為 Date 物件
export function convertYYYYMMToDate(yyyymm: string): Date | null {
  if (!/^\d{6}$/.test(yyyymm)) return null;
  const year = Number(yyyymm.substring(0, 4));
  const month = Number(yyyymm.substring(4, 6)) - 1; // JS 月份從 0 開始
  return new Date(year, month, 1);
}

// 將 Date 轉為 "YYYYMM" 物件
export function convertDateToYYYYMM(date: Date): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份從 1 開始
  return `${year}${month}`;
}
