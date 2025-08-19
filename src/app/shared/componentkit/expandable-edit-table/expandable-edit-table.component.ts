import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, TemplateRef, ContentChild, ElementRef, OnInit, OnChanges } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { NgIf, NgClass, NgFor, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, DecimalPipe } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { NotificationService } from '@shared/component/notification-message/notification.service';
// import { DisplayFieldConfig } from '../selector-panel/selector-panel.component';
// import { Column } from '../table/table.model';
import { Observable } from 'rxjs';
import { SelectorPanelComponent } from '../selector-panel/selector-panel.component';
import { TableValidationService } from './table-validation.service';

export interface DisplayFieldConfig {
  fieldName: string;
  displayLabel: string;
  formatValue?: (value: any) => string | number | null;
  isPrimaryField?: boolean;
}

export interface SelectorTableColumn {
  field: string;
  header: string;
  sortable?: boolean;
}

interface DataItem {
  id: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  details?: DetailItem[];
  expanded?: boolean;
}

interface DetailItem {
  id: number;
  description: string;
  manufacturer: string;
  quantity: number;
  price: number;
  discount: number;
}

// 🎯 語義化的日期格式類型
export type DateFormatType =
  | 'year-month'           // 年月格式 YYYY/MM
  | 'full-date'            // 完整日期 YYYY/MM/DD
  | 'year-month-compact'   // 年月緊湊格式 YYYYMM
  | 'full-date-compact'    // 完整日期緊湊格式 YYYYMMDD
  | 'year-month-dash'      // 年月橫線格式 YYYY-MM
  | 'full-date-dash';      // 完整日期橫線格式 YYYY-MM-DD

// 🎯 日期格式配置映射
export const DATE_FORMAT_CONFIG = {
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
} as const;

export interface ColumnDef {
  field: string;
  header: string;
  type?: string;
  editable?: boolean;
  hidden?: boolean;
  style?: string;
  options?: any[];

  required?: boolean;                    // 是否為必填欄位
  requiredMessage?: string;              // 自定義必填錯誤訊息
  validators?: ValidatorFn[];            // 自定義驗證器陣列

  selectorConfig?: {
    valuePropertyName: string; // 取值用的屬性名稱
    labelPropertyName: string; // 顯示用的屬性名稱
    displayFieldsConfig: DisplayFieldConfig[]; // 顯示欄位配置
    panelTableColumns: SelectorTableColumn[];   // 面板表格欄位
    searchFormFields: any[];  // 搜尋表單欄位配置
    searchMethod?: (searchParams: any) => Observable<any[]>;  // 搜尋方法
    panelDataSource?: any[];  // 面板資料來源
    totalDataCount?: number;  // 總筆數
  };

  directEdit?: boolean; //控制能否直接編輯checkbox

  allowDecimal?: boolean;  // 是否允許小數點
  decimalPlaces?: number;  // 小數位數，預設2位

  // 🎯 使用語義化的日期格式類型
  dateFormat?: DateFormatType;
  placeholder?: string;

  // 🎯 輸入長度限制
  maxLength?: number;
  minLength?: number;

  // 🔧 寬度控制參數
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  flex?: number;
  responsiveWidth?: {
    desktop?: string;
    tablet?: string;
    mobile?: string;
  };
  autoWidth?: boolean;
  readonly?: boolean;
}

@Component({
  selector: 'app-expandable-edit-table',
  templateUrl: './expandable-edit-table.component.html',
  styleUrls: ['./expandable-edit-table.component.scss'],
  standalone: true,
  imports: [NgIf, TableModule, NgClass, PrimeTemplate, ButtonDirective, Ripple, TooltipModule, NgFor, NgStyle, NgSwitch, NgSwitchCase, FormsModule, InputTextModule, InputNumberModule, DropdownModule, CheckboxModule, NgSwitchDefault, DialogModule, CalendarModule, DecimalPipe, ReactiveFormsModule, SelectorPanelComponent, SelectorPanelComponent]
})
export class ExpandableEditTableComponent implements OnInit, OnChanges {
  @ViewChild('dt') dt!: Table;
  @Input() title: string = '';
  @Input() mainColumns: ColumnDef[] = [];
  @Input() detailColumns: ColumnDef[] = [];
  @Input() data: any[] = [];
  @Input() detailKey: string = 'details';
  @Input() dataKey: string = 'id';
  @Input() showCheckBox: boolean = true;
  @Input() showPaginator: boolean = true;
  @Input() selectionMode: 'multiple' | 'single' | null = 'multiple';
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = '查無資料';
  @Input() readonly: boolean = false;
  @Input() expandedContentTemplate: TemplateRef<any> | null = null;

  @Input() showAddButton: boolean = true;
  @Input() showDetailAddButton: boolean = true;
  @Input() showBatchDelete: boolean = true;
  @Input() defaultNewItem: any = {};
  @Input() defaultNewDetailItem: any = {};

  @Input() showDetailTabs: boolean = false;
  @Input() detailTabOptions: { id: string, label: string }[] = [];
  @Input() defaultDetailTab: string = '';
  @Input() detailColumnsMap: { [tabId: string]: ColumnDef[] } = {};
  @Input() showDetailBatchDelete: boolean = true;

  //新增：自動編輯相關屬性
  @Input() autoEditOnAdd: boolean = true; // 新增項目時是否自動進入編輯狀態

  detailSelectedTabs: { [key: string]: string } = {};
  detailSelectedItems: { [mainRowKey: string]: any[] } = {};

  @Output() edit = new EventEmitter<any>();
  @Output() save = new EventEmitter<{ oldData: any, newData: any }>();
  @Output() cancel = new EventEmitter<any>();
  @Output() detailEdit = new EventEmitter<any>();
  @Output() detailSave = new EventEmitter<{ oldDetail: any, newDetail: any, parentData: any }>();
  @Output() detailCancel = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() detailTabChange = new EventEmitter<{ rowData: any, tabId: string }>();

  @Output() addMainItem = new EventEmitter<void>();
  @Output() addDetailItem = new EventEmitter<any>();
  @Output() batchDelete = new EventEmitter<any[]>();
  @Output() detailBatchDelete = new EventEmitter<{ selectedDetails: any[], parentData: any, rowIndex: number }>();
  @Output() dropdownChange = new EventEmitter<{
    rowData: any,
    field: string,
    newValue: any,
    oldValue: any,
    selectedOption?: any
  }>();

  expandedRows: { [key: string]: boolean } = {};
  selectedItems: any[] = [];
  clonedItems: { [s: string]: any } = {};
  clonedDetails: { [s: string]: any } = {};
  editingRow: number | null = null;
  editingDetail: { rowIndex: number, detailIndex: number } | null = null;
  totalRecords: number = 0;
  first: number = 0;
  rows: number = 10;
  isAllExpanded: boolean = false;

  datePickerVisible: boolean = false;
  currentDateField: { data: any, field: string, isDetail: boolean, rowIndex?: number, detailIndex?: number } | null = null;
  temporaryDate: Date | null = null;

  //selector 相關的控制項和資料
  private selectorControls: Map<string, FormControl> = new Map();
  private selectorSuggestions: Map<string, any[]> = new Map();
  private selectorSearchForms: Map<string, FormGroup> = new Map();


  constructor(
    private cdr: ChangeDetectorRef,
    private messageService: NotificationService,
    private fb: FormBuilder,
    private validationService: TableValidationService
  ) { }

  ngOnInit() {
    this.totalRecords = this.data.length;
    this.initializeDetailArrays();
    // 🎯 不再自動初始化日期欄位，保持原始資料格式
  }

  ngOnChanges() {
    if (this.data) {
      this.totalRecords = this.data.length;
      this.initializeDetailArrays();

      this.cleanupInvalidSelections();

      if (this.showDetailTabs) {
        this.data.forEach(item => {
          const rowKey = item[this.dataKey];
          if (!this.detailSelectedTabs[rowKey]) {
            this.detailSelectedTabs[rowKey] = this.defaultDetailTab;
          }
        });
      }
    }
  }

  ngOnDestroy() {
    this.cleanupSelectorResources();
    if (this.inputTimeout) {
      clearTimeout(this.inputTimeout);
    }
    // 🆕 重置驗證狀態
    this.validationService.reset();
  }

  private userInputValue = '';
  private inputTimeout: any = null;

  // 🎯 核心功能：純粹的日期格式化，不修改原始資料
  private formatDateForDisplay(rawValue: any, formatType: DateFormatType): string {
    if (!rawValue) return '';

    try {
      let dateObj: Date;

      // 處理各種可能的輸入格式
      if (rawValue instanceof Date) {
        dateObj = rawValue;
      } else if (typeof rawValue === 'string') {
        // 🔧 處理你的 ISO 日期格式："2014-11-30T16:00:00.000Z"
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(rawValue)) {
          // 解析 ISO 字串但忽略時區，只取日期部分
          const match = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1;
            const day = parseInt(match[3], 10);
            dateObj = new Date(year, month, day);
          } else {
            dateObj = new Date(rawValue);
          }
        }
        // 處理緊湊格式 YYYYMM
        else if (/^\d{6}$/.test(rawValue)) {
          const year = parseInt(rawValue.substring(0, 4), 10);
          const month = parseInt(rawValue.substring(4, 6), 10) - 1;
          dateObj = new Date(year, month, 1);
        }
        // 處理緊湊格式 YYYYMMDD
        else if (/^\d{8}$/.test(rawValue)) {
          const year = parseInt(rawValue.substring(0, 4), 10);
          const month = parseInt(rawValue.substring(4, 6), 10) - 1;
          const day = parseInt(rawValue.substring(6, 8), 10);
          dateObj = new Date(year, month, day);
        }
        // 處理標準格式
        else {
          dateObj = new Date(rawValue);
        }
      } else if (typeof rawValue === 'number') {
        dateObj = new Date(rawValue);
      } else {
        return '';
      }

      // 檢查日期有效性
      if (isNaN(dateObj.getTime())) {
        console.warn('無效的日期值:', rawValue);
        return '';
      }

      // 根據格式類型格式化
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');

      switch (formatType) {
        case 'year-month':
          return `${year}/${month}`;
        case 'year-month-compact':
          return `${year}${month}`;
        case 'year-month-dash':
          return `${year}-${month}`;
        case 'full-date':
          return `${year}/${month}/${day}`;
        case 'full-date-compact':
          return `${year}${month}${day}`;
        case 'full-date-dash':
          return `${year}-${month}-${day}`;
        default:
          return `${year}/${month}/${day}`;
      }
    } catch (error) {
      console.error('日期格式化錯誤:', error, rawValue);
      return '';
    }
  }

  // 🎯 解析用戶輸入的日期字串，轉換為適當的儲存格式
  private parseUserInput(inputValue: string, formatType: DateFormatType): any {
    if (!inputValue || !inputValue.trim()) return null;

    const trimmed = inputValue.trim();

    try {
      // 🎯 年月格式處理
      if (formatType.includes('year-month')) {
        // 格式: YYYY/MM, YYYY-MM, YYYYMM
        let year: number, month: number;

        if (/^\d{4}[\/-]\d{1,2}$/.test(trimmed)) {
          // YYYY/MM 或 YYYY-MM
          const parts = trimmed.split(/[\/-]/);
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
        } else if (/^\d{6}$/.test(trimmed)) {
          // YYYYMM
          year = parseInt(trimmed.substring(0, 4), 10);
          month = parseInt(trimmed.substring(4, 6), 10);
        } else if (/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(trimmed)) {
          // 如果使用者輸入了完整日期，但要求年月格式，只取年月
          const parts = trimmed.split(/[\/-]/);
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
        } else {
          return null;
        }

        // 驗證年月有效性
        if (year < 1900 || year > 2100 || month < 1 || month > 12) {
          return null;
        }

        return new Date(year, month - 1, 1);
      }

      // 🎯 完整日期格式處理
      else {
        let year: number, month: number, day: number;

        if (/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(trimmed)) {
          // YYYY/MM/DD 或 YYYY-MM-DD
          const parts = trimmed.split(/[\/-]/);
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        } else if (/^\d{8}$/.test(trimmed)) {
          // YYYYMMDD
          year = parseInt(trimmed.substring(0, 4), 10);
          month = parseInt(trimmed.substring(4, 6), 10);
          day = parseInt(trimmed.substring(6, 8), 10);
        } else if (/^\d{4}[\/-]\d{1,2}$/.test(trimmed)) {
          // 如果使用者只輸入了年月，自動補充日期為1號
          const parts = trimmed.split(/[\/-]/);
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = 1;
        } else {
          return null;
        }

        // 驗證日期有效性
        if (!this.isValidDate(year, month - 1, day)) {
          return null;
        }

        return new Date(year, month - 1, day);
      }
    } catch (error) {
      console.error('日期解析錯誤:', error);
      return null;
    }
  }

  // 🎯 通用文字輸入處理（支援長度限制）
  onTextInputChange(rowData: any, column: ColumnDef, inputValue: string): void {
    let processedValue = inputValue;

    // 應用長度限制
    if (column.maxLength && inputValue.length > column.maxLength) {
      processedValue = inputValue.substring(0, column.maxLength);
    }

    rowData[column.field] = processedValue;

    // 如果是直接編輯模式，觸發儲存
    if (column.directEdit) {
      this.onDirectEditChange(rowData, column.field, processedValue);
    }
  }

  // 🎯 詳細資料文字輸入處理
  onDetailTextInputChange(detailData: any, column: ColumnDef, inputValue: string, rowIndex: number, detailIndex: number): void {
    let processedValue = inputValue;

    // 應用長度限制
    if (column.maxLength && inputValue.length > column.maxLength) {
      processedValue = inputValue.substring(0, column.maxLength);
    }

    detailData[column.field] = processedValue;

    // 如果是直接編輯模式，觸發儲存
    if (column.directEdit) {
      // 需要找到父資料
      const parentData = this.data[rowIndex];
      this.onDetailDirectEditChange(detailData, parentData, column.field, processedValue, rowIndex, detailIndex);
    }
  }

  // 🎯 清理欄位狀態（在行編輯結束時呼叫）
  private cleanupFieldStates(rowData: any): void {
    const rowKey = rowData[this.dataKey];
    const keysToDelete: string[] = [];

    this.fieldInputStates.forEach((state, key) => {
      if (key.startsWith(`${rowKey}_`)) {
        if (state.timeout) {
          clearTimeout(state.timeout);
        }
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.fieldInputStates.delete(key));
  }

  // 🎯 對外接口：取得格式化的日期顯示值
  getDateDisplayValue(rowData: any, column: ColumnDef): string {
    const field = column.field;
    const rawValue = rowData[field];
    const formatType = column.dateFormat || 'full-date';

    return this.formatDateForDisplay(rawValue, formatType);
  }

  private isCurrentlyEditing(rowData: any, field: string): boolean {
    // 這裡可以根據你的編輯狀態邏輯來判斷
    // 簡單的判斷方式：檢查是否有焦點或正在編輯狀態
    return this.userInputValue !== '';
  }

  // 每個欄位的輸入狀態管理
  private fieldInputStates: Map<string, {
    userInput: string;
    isValid: boolean;
    originalValue: any;
    errorMessage: string;
    timeout?: any;
  }> = new Map();

  // 🎯 獲取欄位的唯一鍵
  private getFieldKey(rowData: any, field: string, isDetail: boolean = false, detailIndex?: number): string {
    const mainKey = `${rowData[this.dataKey]}_${field}`;
    return isDetail ? `${mainKey}_detail_${detailIndex}` : mainKey;
  }


  // 🎯 對外接口：處理日期輸入變更
  onDateInputChange(rowData: any, column: ColumnDef, inputValue: string, isDetail: boolean = false, detailIndex?: number): void {
    const fieldKey = this.getFieldKey(rowData, column.field, isDetail, detailIndex);
    const field = column.field;
    const formatType = column.dateFormat || 'full-date';

    // 🎯 應用長度限制
    let processedValue = inputValue;
    if (column.maxLength && inputValue.length > column.maxLength) {
      processedValue = inputValue.substring(0, column.maxLength);
    }

    // 獲取或建立欄位狀態
    let fieldState = this.fieldInputStates.get(fieldKey);
    if (!fieldState) {
      fieldState = {
        userInput: processedValue,
        isValid: true,
        originalValue: rowData[field],
        errorMessage: ''
      };
      this.fieldInputStates.set(fieldKey, fieldState);
    }

    // 更新使用者輸入
    fieldState.userInput = processedValue;
    fieldState.errorMessage = '';

    // 清除之前的延遲驗證
    if (fieldState.timeout) {
      clearTimeout(fieldState.timeout);
    }

    // 🎯 即時驗證但不立即更新資料
    if (!processedValue || processedValue.trim() === '') {
      fieldState.isValid = true;
      rowData[field] = null;
      return;
    }

    // 🎯 延遲驗證和更新
    fieldState.timeout = setTimeout(() => {
      const parsed = this.parseUserInput(processedValue, formatType);

      if (parsed) {
        fieldState!.isValid = true;
        fieldState!.errorMessage = '';
        rowData[field] = parsed;
        console.log(`✅ 日期輸入更新: ${field} = ${parsed}`);

        // 🎯 觸發儲存事件（如果是直接編輯模式）
        if (column.directEdit) {
          if (isDetail) {
            this.onDetailDirectEditChange(rowData, rowData, field, parsed, undefined, detailIndex);
          } else {
            this.onDirectEditChange(rowData, field, parsed);
          }
        }
      } else {
        fieldState!.isValid = false;
        fieldState!.errorMessage = this.getDateErrorMessage(processedValue, formatType);
        console.warn(`⚠️ 無效的日期輸入: ${processedValue}`);

        // 🎯 顯示錯誤訊息
        this.showErrorMessage(fieldState!.errorMessage);
      }

      this.cdr.detectChanges();
    }, 300);
  }

  // 🎯 獲取日期錯誤訊息
  private getDateErrorMessage(inputValue: string, formatType: DateFormatType): string {
    if (formatType.includes('year-month')) {
      return `無效的年月格式：${inputValue}。請輸入如 2024/01、202401 或 2024-01 的格式`;
    } else {
      return `無效的日期格式：${inputValue}。請輸入如 2024/01/15、20240115 或 2024-01-15 的格式`;
    }
  }

  // 🎯 顯示錯誤訊息的方法（你需要根據你的訊息服務來實作）
  private showErrorMessage(message: string): void {
    // 🎯 這裡使用你現有的錯誤訊息系統
    // 例如: this.messageService.add({severity:'error', summary: '輸入錯誤', detail: message});
    // 或者: this.toastr.error(message, '輸入錯誤');
    console.error('輸入錯誤:', message);

    // 🎯 如果你有全域的錯誤訊息服務，在這裡呼叫它
    // 暫時用 alert 示範，你可以改成你的訊息系統
    // alert(message);
    this.messageService.warnBubble(message);
  }

  // 🎯 獲取日期輸入值（編輯時使用）
  getDateInputValue(rowData: any, column: ColumnDef, isDetail: boolean = false, detailIndex?: number): string {
    const fieldKey = this.getFieldKey(rowData, column.field, isDetail, detailIndex);
    const fieldState = this.fieldInputStates.get(fieldKey);

    // 如果有使用者正在輸入的值，顯示使用者輸入
    if (fieldState && fieldState.userInput !== undefined) {
      return fieldState.userInput;
    }

    // 否則顯示格式化的值
    return this.getDateDisplayValue(rowData, column);
  }

  // 🎯 檢查欄位是否有效
  isFieldValid(rowData: any, column: ColumnDef, isDetail: boolean = false, detailIndex?: number): boolean {
    const fieldKey = this.getFieldKey(rowData, column.field, isDetail, detailIndex);
    const fieldState = this.fieldInputStates.get(fieldKey);
    return fieldState ? fieldState.isValid : true;
  }

  // 🎯 處理輸入框失焦事件
  onDateInputBlur(rowData: any, column: ColumnDef, isDetail: boolean = false, detailIndex?: number): void {
    const fieldKey = this.getFieldKey(rowData, column.field, isDetail, detailIndex);
    const fieldState = this.fieldInputStates.get(fieldKey);

    if (fieldState) {
      // 清除超時，立即執行驗證
      if (fieldState.timeout) {
        clearTimeout(fieldState.timeout);
        delete fieldState.timeout;
      }

      // 如果輸入無效，恢復原值
      if (!fieldState.isValid && fieldState.userInput) {
        const formatType = column.dateFormat || 'full-date';
        const parsed = this.parseUserInput(fieldState.userInput, formatType);

        if (!parsed) {
          // 恢復到原始值
          rowData[column.field] = fieldState.originalValue;
          fieldState.userInput = this.getDateDisplayValue(rowData, column);
          fieldState.isValid = true;
        }
      }

      this.cdr.detectChanges();
    }
  }

  // 🎯 對外接口：取得欄位的 placeholder
  getDatePlaceholder(column: ColumnDef): string {
    if (column.placeholder) {
      return column.placeholder;
    }

    const formatType = column.dateFormat || 'full-date';

    // 根據格式提供更明確的提示
    switch (formatType) {
      case 'year-month':
        return '例：2024/01 或 202401';
      case 'year-month-compact':
        return '例：202401';
      case 'year-month-dash':
        return '例：2024-01';
      case 'full-date':
        return '例：2024/01/15 或 20240115';
      case 'full-date-compact':
        return '例：20240115';
      case 'full-date-dash':
        return '例：2024-01-15';
      default:
        return '請輸入日期';
    }
  }

  // 🎯 輔助方法：日期有效性檢查
  private isValidDate(year: number, month: number, day: number): boolean {
    if (year < 1900 || year > 2100) return false;
    if (month < 0 || month > 11) return false;
    if (day < 1 || day > 31) return false;

    const date = new Date(year, month, day);
    return date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day;
  }

  // 保留原有的其他方法...
  initializeDetailArrays() {
    if (this.data && this.data.length > 0) {
      this.data.forEach(rowData => {
        if (!rowData[this.detailKey]) {
          rowData[this.detailKey] = [];
        }
      });
    }
  }

  onAddMainItem() {
    // 🚀 直接新增，不檢查編輯狀態
    this.addMainItem.emit();

    // 🎯 如果啟用自動編輯，在新增後自動進入編輯狀態
    if (this.autoEditOnAdd) {
      setTimeout(() => {
        const lastIndex = this.data.length - 1;
        if (lastIndex >= 0) {
          console.log('🔧 自動進入新增項目的編輯模式');
          this.onRowEditInit(this.data[lastIndex], lastIndex);
        }
      }, 100);
    }
  }

  onBatchDelete() {
    if (this.selectedItems.length === 0) {
      console.warn('請選擇要刪除的項目');
      return;
    }

    // 🚀 直接刪除，讓使用者有最流暢的體驗
    this.batchDelete.emit([...this.selectedItems]);
  }

  onDetailBatchDelete(parentData: any, rowIndex: number) {
    const parentKey = parentData[this.dataKey];
    const selectedDetails = this.detailSelectedItems[parentKey] || [];

    if (selectedDetails.length === 0) {
      console.warn('請選擇要刪除的明細項目');
      return;
    }

    // 🚀 直接刪除明細
    this.detailBatchDelete.emit({
      selectedDetails: [...selectedDetails],
      parentData: parentData,
      rowIndex: rowIndex
    });
  }

  onDetailSelectionChange(parentData: any, selectedItems: any[]) {
    const parentKey = parentData[this.dataKey];
    this.detailSelectedItems[parentKey] = selectedItems;
  }

  getDetailSelectedCount(parentData: any): number {
    const parentKey = parentData[this.dataKey];
    return this.detailSelectedItems[parentKey]?.length || 0;
  }

  trackByFn(index: number, item: any) {
    return item[this.dataKey] || index;
  }

  toggleExpandAll() {
    if (this.isAllExpanded) {
      this.expandedRows = {};
    } else {
      this.data.forEach(item => {
        this.expandedRows[item[this.dataKey]] = true;
      });
    }
    this.isAllExpanded = !this.isAllExpanded;
  }

  toggleRow(rowData: any) {
    if (this.expandedRows[rowData[this.dataKey]]) {
      delete this.expandedRows[rowData[this.dataKey]];
    } else {
      this.expandedRows[rowData[this.dataKey]] = true;
    }
  }

  onRowEditInit(rowData: any, rowIndex: number) {
    this.editingRow = rowIndex;
    this.clonedItems[rowData[this.dataKey]] = { ...rowData };
    this.edit.emit(rowData);

    if (!rowData[this.detailKey]) {
      rowData[this.detailKey] = [];
    }

    this.cdr.detectChanges();
  }

  onRowEditSave(rowData: any) {
    try {
      // 🆕 使用驗證服務執行驗證
      const validationResult = this.validationService.validateRow(rowData, this.mainColumns, this.dataKey);

      if (!validationResult.isValid) {
        const errorMessage = this.validationService.formatValidationErrors(validationResult.errors);
        this.messageService.warnBubble(errorMessage);
        return; // 阻止儲存
      }

      // 原有的儲存邏輯
      const oldData = this.clonedItems[rowData[this.dataKey]];
      delete this.clonedItems[rowData[this.dataKey]];
      this.editingRow = null;

      // 清除驗證錯誤
      this.validationService.clearRowValidationErrors(rowData, this.dataKey);
      this.cleanupFieldStates(rowData);

      this.save.emit({ oldData, newData: rowData });
      this.cdr.detectChanges();
    } catch (error) {
      console.error('保存行時出錯：', error);
      this.messageService.warnBubble('儲存失敗，請檢查輸入內容');
    }
  }

  onRowEditCancel(rowData: any, rowIndex: number) {
    try {
      this.data[rowIndex] = this.clonedItems[rowData[this.dataKey]];
      delete this.clonedItems[rowData[this.dataKey]];
      this.editingRow = null;

      // 🆕 清除驗證錯誤
      this.validationService.clearRowValidationErrors(rowData, this.dataKey);
      this.cleanupFieldStates(rowData);

      this.cancel.emit(rowData);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('取消編輯行時出錯：', error);
    }
  }

  onDetailEditInit(detailData: any, rowData: any, rowIndex: number, detailIndex: number) {
    console.log('Detail edit:', event);
    this.editingDetail = { rowIndex, detailIndex };
    this.clonedDetails[detailData.id] = { ...detailData };
    this.detailEdit.emit(detailData);
  }

  onDetailEditSave(detailData: any, rowData: any) {
    const oldDetail = this.clonedDetails[detailData.id];
    delete this.clonedDetails[detailData.id];
    this.editingDetail = null;
    this.detailSave.emit({ oldDetail, newDetail: detailData, parentData: rowData });
  }

  onDetailEditCancel(detailData: any, rowData: any, rowIndex: number, detailIndex: number) {
    rowData[this.detailKey][detailIndex] = this.clonedDetails[detailData.id];
    delete this.clonedDetails[detailData.id];
    this.editingDetail = null;
    this.detailCancel.emit(detailData);
  }

  onSelectionChange(event: any) {
    this.selectedItems = event;
  }

  onRowSelect(event: any) {
    this.rowSelect.emit(event.data);
  }

  onRowUnselect(event: any) {
    this.rowUnselect.emit(event.data);
  }

  isDetailEditing(rowIndex: number, detailIndex: number): boolean {
    return this.editingDetail !== null &&
      this.editingDetail.rowIndex === rowIndex &&
      this.editingDetail.detailIndex === detailIndex;
  }

  isRowEditing(rowIndex: number): boolean {
    return this.editingRow === rowIndex;
  }

  get visibleColumnsCount(): number {
    let count = 1; // 序號欄

    // 勾選框欄（只在非 readonly 且啟用時計算）
    if (this.showCheckBox && this.selectionMode === 'multiple' && !this.readonly) {
      count += 1;
    }

    // 展開欄
    if (this.detailKey) {
      count += 1;
    }

    // 主要欄位數量（排除隱藏的）
    count += this.mainColumns.filter(col => !col.hidden).length;

    return count;
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }

  // 日期選擇器相關方法
  openDatePicker(data: any, field: string, isDetail: boolean = false, rowIndex?: number, detailIndex?: number) {
    this.currentDateField = { data, field, isDetail, rowIndex, detailIndex };

    // 嘗試從現有值創建日期
    let initialDate = new Date();
    if (data[field]) {
      const existingDate = new Date(data[field]);
      if (!isNaN(existingDate.getTime())) {
        initialDate = existingDate;
      }
    }

    this.temporaryDate = initialDate;
    this.datePickerVisible = true;
  }

  confirmDateSelection() {
    if (this.currentDateField && this.temporaryDate) {
      const column = this.getCurrentEditingColumn();

      if (column && column.dateFormat && column.dateFormat.includes('year-month')) {
        // 🎯 年月格式：將日期設為該月的第一天
        const year = this.temporaryDate.getFullYear();
        const month = this.temporaryDate.getMonth();
        const adjustedDate = new Date(year, month, 1);

        this.currentDateField.data[this.currentDateField.field] = adjustedDate;
        console.log(`✅ 年月選擇完成: ${year}/${month + 1}`);
      } else {
        // 🎯 完整日期格式：直接使用選擇的日期
        this.currentDateField.data[this.currentDateField.field] = this.temporaryDate;
        console.log(`✅ 日期選擇完成: ${this.temporaryDate}`);
      }

      if (this.currentDateField.isDetail) {
        this.cdr.detectChanges();
      }
    }

    this.datePickerVisible = false;
    this.currentDateField = null;
    this.temporaryDate = null;
  }

  cancelDateSelection() {
    this.datePickerVisible = false;
    this.currentDateField = null;
    this.temporaryDate = null;
  }

  handleDetailDateClick(event: Event, detailData: any, field: string, rowIndex: number, detailIndex: number) {
    event.stopPropagation();
    this.openDatePicker(detailData, field, true, rowIndex, detailIndex);
  }

  onAddDetailItem(parentData: any, rowIndex: number) {
    // 🚀 直接新增明細，不檢查編輯狀態
    this.addDetailItem.emit(parentData);

    // 🎯 如果啟用自動編輯，在新增後自動進入編輯狀態
    if (this.autoEditOnAdd) {
      setTimeout(() => {
        const detailArray = parentData[this.detailKey];
        if (detailArray && detailArray.length > 0) {
          const lastDetailIndex = detailArray.length - 1;
          console.log('🔧 自動進入新增詳細項目的編輯模式');
          this.onDetailEditInit(
            detailArray[lastDetailIndex],
            parentData,
            rowIndex,
            lastDetailIndex
          );
        }
      }, 100);
    }
  }
  onDetailTabChange(rowData: any, tabId: string) {
    const rowKey = rowData[this.dataKey];
    this.detailSelectedTabs[rowKey] = tabId;
    this.detailTabChange.emit({ rowData, tabId });
  }

  getDetailSelectedTab(rowData: any): string {
    const rowKey = rowData[this.dataKey];
    if (!this.detailSelectedTabs[rowKey]) {
      this.detailSelectedTabs[rowKey] = this.defaultDetailTab;
    }
    return this.detailSelectedTabs[rowKey];
  }

  getDetailColumnsForTab(rowData: any): ColumnDef[] {
    const selectedTab = this.getDetailSelectedTab(rowData);
    if (this.detailColumnsMap && this.detailColumnsMap[selectedTab]) {
      return this.detailColumnsMap[selectedTab];
    }
    return this.detailColumns;
  }

  getFieldOptions(rowData: any, field: string): any[] {
    // 先檢查 mainColumns
    let column = this.mainColumns.find(col => col.field === field);

    // 如果沒找到，檢查 detailColumns
    if (!column) {
      column = this.detailColumns.find(col => col.field === field);
    }

    // 如果還是沒找到，檢查當前選中的 tab 的 columns
    if (!column && this.showDetailTabs) {
      const currentTab = this.getDetailSelectedTab(rowData);
      const tabColumns = this.detailColumnsMap[currentTab] || [];
      column = tabColumns.find(col => col.field === field);
    }

    return column?.options || [];
  }

  onDropdownChange(rowData: any, field: string, newValue: any): void {
    const oldValue = rowData[field];
    rowData[field] = newValue;

    this.dropdownChange.emit({
      rowData,
      field,
      newValue,
      oldValue
    });
  }

  getDropdownDisplayText(rowData: any, col: ColumnDef): string {
    const value = rowData[col.field];

    if (!value && value !== 0) {
      return '';
    }

    const options = this.getFieldOptions(rowData, col.field);

    if (!options || options.length === 0) {
      return value;
    }

    const foundOption = options.find(option => {
      if (typeof option === 'object' && option !== null) {
        return option.value === value || option.value === String(value);
      }
      return option === value;
    });

    if (foundOption) {
      return typeof foundOption === 'object' ? foundOption.label : foundOption;
    }

    return value;
  }

  // 🔧 寬度控制相關方法
  getColumnStyle(col: ColumnDef): any {
    const styles: any = {};
    const screenWidth = window.innerWidth;

    if (col.responsiveWidth) {
      if (screenWidth < 768 && col.responsiveWidth.mobile) {
        styles.width = col.responsiveWidth.mobile;
        styles.minWidth = col.responsiveWidth.mobile;
      } else if (screenWidth < 1024 && col.responsiveWidth.tablet) {
        styles.width = col.responsiveWidth.tablet;
        styles.minWidth = col.responsiveWidth.tablet;
      } else if (col.responsiveWidth.desktop) {
        styles.width = col.responsiveWidth.desktop;
        styles.minWidth = col.responsiveWidth.desktop;
      }
    }
    else if (col.width) {
      styles.width = col.width;
      styles.minWidth = col.width;
    }
    else if (col.autoWidth) {
      const defaultWidth = this.getTypeDefaultWidth(col.type, screenWidth);
      styles.width = defaultWidth;
      styles.minWidth = defaultWidth;
    }
    else if (col.flex) {
      styles.flex = col.flex;
      if (col.minWidth) {
        styles.minWidth = col.minWidth;
      }
    }

    if (col.maxWidth) {
      styles.maxWidth = col.maxWidth;
    }

    if (col.style) {
      if (typeof col.style === 'string') {
        const styleArray = col.style.split(';');
        styleArray.forEach(style => {
          if (style.trim()) {
            const [property, value] = style.split(':').map(s => s.trim());
            if (property && value) {
              styles[this.camelCase(property)] = value;
            }
          }
        });
      }
    }

    return styles;
  }

  private getTypeDefaultWidth(type: string = 'text', screenWidth: number): string {
    const widthMap: { [key: string]: { desktop: string, tablet: string, mobile: string } } = {
      'checkbox': { desktop: '60px', tablet: '50px', mobile: '45px' },
      'date': { desktop: '150px', tablet: '130px', mobile: '120px' },
      'number': { desktop: '110px', tablet: '100px', mobile: '90px' },
      'dropdown': { desktop: '130px', tablet: '120px', mobile: '110px' },
      'text': { desktop: '120px', tablet: '110px', mobile: '100px' }
    };

    const typeWidth = widthMap[type] || widthMap['text'];

    if (screenWidth < 768) {
      return typeWidth.mobile;
    } else if (screenWidth < 1024) {
      return typeWidth.tablet;
    } else {
      return typeWidth.desktop;
    }
  }

  getResponsiveColumnStyle(col: ColumnDef): any {
    const baseStyle = this.getColumnStyle(col);
    const screenWidth = window.innerWidth;

    if (screenWidth < 768) {
      if (baseStyle.width && typeof baseStyle.width === 'string' && baseStyle.width.includes('px')) {
        const widthValue = parseInt(baseStyle.width);
        baseStyle.width = Math.max(60, widthValue * 0.8) + 'px';
      }
    } else if (screenWidth < 1024) {
      if (baseStyle.width && typeof baseStyle.width === 'string' && baseStyle.width.includes('px')) {
        const widthValue = parseInt(baseStyle.width);
        baseStyle.width = Math.max(80, widthValue * 0.9) + 'px';
      }
    }

    return baseStyle;
  }

  private camelCase(str: string): string {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  getDefaultColumnWidth(col: ColumnDef): string {
    if (col.width || col.minWidth) {
      return '';
    }

    switch (col.type) {
      case 'checkbox':
        return '80px';
      case 'date':
        return '140px';
      case 'number':
        return '110px';
      case 'dropdown':
        return '120px';
      case 'text':
        return col.field.includes('name') || col.field.includes('title') ? '200px' : '120px';
      default:
        return '120px';
    }
  }

  hasCaptionContent(): boolean {
    return (
      (!this.readonly && this.showAddButton) ||
      (!this.readonly && this.showBatchDelete) ||
      !!this.detailKey ||
      this.hasCaptionLeftContent() ||
      this.hasCaptionRightContent()
    );
  }

  @ContentChild('[caption-left]', { read: ElementRef }) captionLeft?: ElementRef;
  @ContentChild('[caption-right]', { read: ElementRef }) captionRight?: ElementRef;

  hasCaptionLeftContent(): boolean {
    return this.captionLeft?.nativeElement?.children.length > 0;
  }

  hasCaptionRightContent(): boolean {
    return this.captionRight?.nativeElement?.children.length > 0;
  }

  // 🎯 主表格表頭操作欄位樣式
  getActionHeaderStyle(): any {
    return {
      position: 'sticky',
      right: '0',
      zIndex: '3',
      // backgroundColor: 'var(--table-header-bg, #c7d2fe)', // 保持表頭背景色
      width: '120px',
      minWidth: '120px',
      textAlign: 'center'
    };
  }

  // 🎯 主表格表身操作欄位樣式
  getActionBodyStyle(): any {
    return {
      position: 'sticky',
      right: '0',
      zIndex: '2',
      backgroundColor: '#fff', // 表身背景色
      width: '120px',
      minWidth: '120px',
      textAlign: 'center'
    };
  }

  // 🎯 詳細資料表格表頭操作欄位樣式
  getDetailActionHeaderStyle(): any {
    return {
      position: 'sticky',
      right: '0',
      zIndex: '3',
      backgroundColor: '#4a69bd', // 詳細資料表頭背景色
      width: '120px',
      minWidth: '120px',
      textAlign: 'center',
      color: '#fff' // 白色文字
    };
  }

  // 🎯 詳細資料表格表身操作欄位樣式
  getDetailActionBodyStyle(): any {
    return {
      position: 'sticky',
      right: '0',
      zIndex: '2',
      backgroundColor: '#f8f9fa', // 詳細資料表身背景色
      width: '120px',
      minWidth: '120px',
      textAlign: 'center'
    };
  }

  // 取得數字輸入的設定
  getNumberInputConfig(col: ColumnDef): any {
    if (col.allowDecimal) {
      return {
        mode: 'decimal',
        minFractionDigits: 0,
        maxFractionDigits: col.decimalPlaces || 2,
        step: col.decimalPlaces === 1 ? 0.1 : 0.01,
        useGrouping: false
      };
    }

    return {
      mode: 'decimal',
      minFractionDigits: 0,
      maxFractionDigits: 0,
      step: 1,
      useGrouping: false
    };
  }

  getExpandedColspan(): number {
    let colspan = 1; // 序號欄

    if (this.showCheckBox && this.selectionMode === 'multiple' && !this.readonly) {
      colspan += 1;
    }

    if (this.detailKey) {
      colspan += 1;
    }

    colspan += this.mainColumns.filter(col => !col.hidden).length;

    if (!this.readonly) {
      colspan += 1;
    }

    return colspan;
  }

  // 🎯 新增：檢查欄位是否可編輯的方法
  isFieldEditable(column: ColumnDef, isEditing: boolean): boolean {
    // 如果欄位設為不可編輯，則永遠不可編輯
    if (column.editable === false) {
      return false;
    }

    // 如果欄位設為可編輯或未設定，則根據當前編輯狀態決定
    return isEditing && (column.editable === true || column.editable === undefined);
  }

  // 🎯 新增：檢查欄位是否應該顯示為輸入控件
  shouldShowInputControl(column: ColumnDef, isEditing: boolean): boolean {
    if (column.directEdit === true && column.editable !== false) {
      return true;
    }
    return this.isFieldEditable(column, isEditing);
  }

  // 🎯 新增：檢查欄位是否應該顯示為純文字
  shouldShowDisplayOnly(column: ColumnDef, isEditing: boolean): boolean {
    if (column.directEdit === true && column.editable !== false) {
      return false;
    }
    return !this.isFieldEditable(column, isEditing);
  }

  private cleanupInvalidSelections(): void {
    // 清理主表格的無效選取
    if (this.selectedItems.length > 0) {
      this.selectedItems = this.selectedItems.filter(selectedItem => {
        return this.data.some(dataItem => dataItem[this.dataKey] === selectedItem[this.dataKey]);
      });
    }
  }

  onDirectEditChange(rowData: any, field: string, newValue: any, rowIndex?: number, column?: ColumnDef): void {
    const oldValue = rowData[field];
    rowData[field] = newValue;

    console.log(`✅ 直接編輯變更: ${field} = ${newValue} (第${(rowIndex || 0) + 1}行)`);

    // 🎯 觸發和編輯保存一樣的事件，讓外部組件知道資料已更新
    this.save.emit({
      oldData: { ...rowData, [field]: oldValue },
      newData: { ...rowData }
    });
  }

  // 🎯 新增：處理詳細資料直接編輯欄位的變更事件
  onDetailDirectEditChange(detailData: any, parentData: any, field: string, newValue: any, rowIndex?: number, detailIndex?: number): void {
    const oldValue = detailData[field];
    detailData[field] = newValue;

    console.log(`✅ 詳細資料直接編輯變更: ${field} = ${newValue} (主行${(rowIndex || 0) + 1}, 詳細行${(detailIndex || 0) + 1})`);

    // 🎯 觸發詳細資料保存事件
    this.detailSave.emit({
      oldDetail: { ...detailData, [field]: oldValue },
      newDetail: { ...detailData },
      parentData: parentData
    });
  }

  getCalendarView(): 'date' | 'month' | 'year' {
    if (!this.currentDateField) {
      return 'date';
    }

    // 從當前編輯的欄位取得日期格式
    const column = this.getCurrentEditingColumn();
    if (!column || !column.dateFormat) {
      return 'date';
    }

    const dateFormat = column.dateFormat;

    // 根據日期格式決定 Calendar 的顯示模式
    if (dateFormat.includes('year-month')) {
      return 'month';  // 只顯示年月選擇
    } else {
      return 'date';   // 顯示完整日期選擇
    }
  }

  getCalendarDateFormat(): string {
    if (!this.currentDateField) {
      return 'yy/mm/dd';
    }

    const column = this.getCurrentEditingColumn();
    if (!column || !column.dateFormat) {
      return 'yy/mm/dd';
    }

    const dateFormat = column.dateFormat;

    // 根據日期格式類型返回 PrimeNG Calendar 的格式
    switch (dateFormat) {
      case 'year-month':
      case 'year-month-compact':
      case 'year-month-dash':
        return 'yy/mm';
      case 'full-date':
      case 'full-date-compact':
      case 'full-date-dash':
      default:
        return 'yy/mm/dd';
    }
  }

  private getCurrentEditingColumn(): ColumnDef | null {
    if (!this.currentDateField) {
      return null;
    }

    const fieldName = this.currentDateField.field;

    // 從主欄位中尋找
    let column = this.mainColumns.find(col => col.field === fieldName);

    // 如果沒找到，從詳細欄位中尋找
    if (!column) {
      column = this.detailColumns.find(col => col.field === fieldName);
    }

    // 如果還是沒找到，從當前分頁的詳細欄位中尋找
    if (!column && this.showDetailTabs && this.currentDateField.data) {
      const currentTab = this.getDetailSelectedTab(this.currentDateField.data);
      const tabColumns = this.detailColumnsMap[currentTab] || [];
      column = tabColumns.find(col => col.field === fieldName);
    }

    return column || null;
  }

  //===========================特殊下拉功能區域=============================
  getSelectorControl(rowData: any, fieldName: string): FormControl {
    const key = `${rowData[this.dataKey]}_${fieldName}`;

    if (!this.selectorControls.has(key)) {
      const control = new FormControl(rowData[fieldName] || '');
      this.selectorControls.set(key, control);

      // 🎯 注意：不要在這裡監聽 valueChanges
      // 因為 selector-panel 的事件會直接處理值的更新
      // 避免重複觸發 onDirectEditChange
    }

    return this.selectorControls.get(key)!;
  }

  // 🎯 新增：取得 selector 建議項目
  getSelectorSuggestions(rowData: any, fieldName: string): any[] {
    const key = `${rowData[this.dataKey]}_${fieldName}`;
    return this.selectorSuggestions.get(key) || [];
  }

  // 🎯 新增：處理 selector 搜尋輸入變更
  onSelectorSearchInputChanged(searchParams: any, rowData: any, column: ColumnDef): void {
    const key = `${rowData[this.dataKey]}_${column.field}`;

    if (column.selectorConfig?.searchMethod) {
      column.selectorConfig.searchMethod(searchParams).subscribe(suggestions => {
        this.selectorSuggestions.set(key, suggestions);
      });
    }
  }

  // 🎯 新增：處理 selector 搜尋表單變更
  // 🎯 把原來的方法完全替換為：
  onSelectorSearchFormChanged(formValue: any, rowData: any, column: ColumnDef): void {
    console.log('🚨 表格收到搜尋表單變更:', formValue);
    console.log('🔍 表單值詳細:', JSON.stringify(formValue, null, 2));

    if (column.selectorConfig?.searchMethod) {
      console.log('🚀 準備執行搜尋:', formValue);

      column.selectorConfig.searchMethod(formValue).subscribe({
        next: (results) => {
          console.log('✅ 搜尋成功，結果數量:', results.length);

          if (column.selectorConfig) {
            column.selectorConfig.panelDataSource = results;

            // 🎯 關鍵：從 LocationService 的特殊物件中取得分頁資訊
            const paginationInfo = (results as any).__paginationInfo;

            if (paginationInfo) {
              // 有分頁資訊，使用後端提供的總筆數
              column.selectorConfig.totalDataCount = paginationInfo.totalCount;
              console.log('📊 使用後端分頁資訊:', {
                總筆數: paginationInfo.totalCount,
                總頁數: paginationInfo.totalPages,
                當前頁: paginationInfo.currentPage,
                每頁筆數: paginationInfo.pageSize
              });
            }
          }

          console.log('📊 面板資料已更新:', {
            資料筆數: results.length,
            總筆數: column.selectorConfig?.totalDataCount
          });
        },
        error: (error) => {
          console.error('❌ 搜尋失敗:', error);
          if (column.selectorConfig) {
            column.selectorConfig.panelDataSource = [];
            column.selectorConfig.totalDataCount = 0;
          }
        }
      });
    }
  }

  // 🎯 新增：更新總筆數的方法（在 ExpandableEditTable 中加入）
  private updateTotalCount(selectorConfig: any, results: any[], searchParams: any): void {
    const pageSize = searchParams.pageSize || 10;
    const pageIndex = searchParams.pageIndex || 0;

    // 🎯 簡化邏輯：如果回傳的資料少於 pageSize，表示是最後一頁
    if (results.length < pageSize) {
      // 最後一頁：計算總筆數
      selectorConfig.totalDataCount = pageIndex * pageSize + results.length;
      console.log('📊 總筆數 (最後頁):', selectorConfig.totalDataCount);
    } else {
      // 不是最後一頁：估算總筆數（至少還有下一頁）
      selectorConfig.totalDataCount = (pageIndex + 1) * pageSize + 1;
      console.log('📊 總筆數 (估計):', selectorConfig.totalDataCount);
    }
  }

  // 🎯 新增：取得 selector 搜尋表單
  getSelectorSearchForm(rowData: any, column: ColumnDef): FormGroup {
    const key = `${rowData[this.dataKey]}_${column.field}`;

    if (!this.selectorSearchForms.has(key)) {
      const form = this.createSelectorSearchForm(column);
      this.selectorSearchForms.set(key, form);
    }

    return this.selectorSearchForms.get(key)!;
  }

  // 🎯 新增：建立 selector 搜尋表單
  private createSelectorSearchForm(column: ColumnDef): FormGroup {
    const formConfig: { [key: string]: any } = {};

    if (column.selectorConfig?.searchFormFields) {
      column.selectorConfig.searchFormFields.forEach(field => {
        formConfig[field.name] = [''];
      });
    }

    // 🎯 修正：統一使用大寫 SortBy
    formConfig['pageSize'] = [10];
    formConfig['pageIndex'] = [1];
    formConfig['SortBy'] = [[]];  // 用大寫，預設空陣列

    return this.fb.group(formConfig);
  }

  // 🎯 新增：清理 selector 相關資源
  private cleanupSelectorResources(): void {
    this.selectorControls.clear();
    this.selectorSuggestions.clear();
    this.selectorSearchForms.clear();
  }

  //===============處理table發出的事件=============================
  // 在 expandable-edit-table.component.ts 中新增以下方法
  // 🎯 在 cleanupSelectorResources() 方法之後新增：

  /**
   * 🎯 處理 selector-panel 的 itemSelected 事件
   */
  onSelectorItemSelected(selectedItem: any, rowData: any, column: ColumnDef): void {
    console.log('🎯 表格收到 selector item selected:', {
      selectedItem,
      rowDataId: rowData.id || rowData[this.dataKey],
      field: column.field
    });

    const oldValue = rowData[column.field];
    const newValue = selectedItem[column.selectorConfig?.valuePropertyName || 'value'];

    // 🎯 更新 rowData
    rowData[column.field] = newValue;

    // 🎯 更新對應的 FormControl
    const control = this.getSelectorControl(rowData, column.field);
    if (control) {
      control.setValue(newValue, { emitEvent: false }); // 不觸發 valueChanges
    }

    // 🚨 關鍵：發出 dropdownChange 事件，包含完整的 selectedItem
    this.dropdownChange.emit({
      rowData,
      field: column.field,
      newValue,
      oldValue,
      selectedOption: selectedItem // 🎯 這裡傳遞完整的選擇項目資料
    });

    console.log('✅ 表格發出 dropdownChange 事件，包含 selectedOption');
  }

  /**
   * 🎯 處理 selector-panel 的 valueChanged 事件
   */
  onSelectorValueChanged(event: { oldValue: any, newValue: any, selectedItem: any }, rowData: any, column: ColumnDef): void {
    console.log('🔄 表格收到 selector value changed:', {
      event,
      rowDataId: rowData.id || rowData[this.dataKey],
      field: column.field
    });

    // 🎯 更新 rowData
    rowData[column.field] = event.newValue;

    // 🎯 發出 dropdownChange 事件
    this.dropdownChange.emit({
      rowData,
      field: column.field,
      newValue: event.newValue,
      oldValue: event.oldValue,
      selectedOption: event.selectedItem // 🎯 傳遞完整的選擇項目資料
    });
  }

  /**
   * 🎯 處理 selector-panel 的 selectionChanged 事件
   */
  onSelectorSelectionChanged(selectedItem: any, rowData: any, column: ColumnDef): void {
    console.log('🎯 表格收到 selector selection changed:', selectedItem);

    // 🎯 與 itemSelected 使用相同的處理邏輯
    this.onSelectorItemSelected(selectedItem, rowData, column);
  }

  //=================欄位必填用===================
  /**
  * 🎯 檢查欄位是否為必填
  */
  isFieldRequired(column: ColumnDef): boolean {
    return this.validationService.isFieldRequired(column);
  }

  /**
   * 🎯 取得列的驗證錯誤訊息
   */
  getRowValidationErrors(rowData: any): string[] {
    return this.validationService.getRowValidationErrors(rowData, this.dataKey);
  }

  /**
  * 🎯 檢查列是否有驗證錯誤
  */
  hasRowValidationErrors(rowData: any): boolean {
    return this.validationService.hasRowValidationErrors(rowData, this.dataKey);
  }

}
