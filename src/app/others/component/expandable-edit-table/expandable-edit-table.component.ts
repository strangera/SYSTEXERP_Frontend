import { DecimalPipe, NgClass, NgFor, NgIf, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { ChangeDetectorRef, Component, ContentChild, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { Ripple } from 'primeng/ripple';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
// import { DisplayFieldConfig } from '../selector-panel/selector-panel.component';
// import { Column } from '../table/table.model';
import { Observable } from 'rxjs';
import { DateUtils } from 'src/app/core/utils/date-utils';
import { SelectorPanelComponent } from '../selector-panel/selector-panel.component';
import { TableWidthCalculatorService } from './services/table-width-calculator.service';
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

// 語義化的日期格式類型
export type DateFormatType =
  | 'year-month'           // 年月格式 YYYY/MM
  | 'full-date'            // 完整日期 YYYY/MM/DD
  | 'year-month-compact'   // 年月緊湊格式 YYYYMM
  | 'full-date-compact'    // 完整日期緊湊格式 YYYYMMDD
  | 'year-month-dash'      // 年月橫線格式 YYYY-MM
  | 'full-date-dash';      // 完整日期橫線格式 YYYY-MM-DD

// 日期格式配置映射
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
  headerTooltip?: string;  // 表頭旁小驚嘆號的提示文字
  type?: string;
  editable?: boolean;
  hidden?: boolean;
  style?: string;
  options?: any[];

  buttonLabel?: string;    // 按鈕文字
  buttonLabelFunction?: (rowData: any) => string;  // 動態按鈕文字（優先於 buttonLabel）
  buttonIcon?: string;     // 按鈕圖示
  buttonClass?: string;    // 按鈕樣式
  buttonTooltip?: string;  // 提示文字
  showCondition?: (rowData: any, allData: any[]) => boolean;  // 按鈕顯示條件函數

  defaultValue?: any;  // 預設值

  defaultValueFunction?: () => any;

  required?: boolean;                    // 是否為必填欄位
  requiredMessage?: string;              // 自定義必填錯誤訊息
  validators?: ValidatorFn[];            // 自定義驗證器陣列

  // 自動編輯配置（更靈活）
  autoEditOnSelect?: boolean;    // 當此欄位被勾選(true)時自動進入編輯模式
  autoSaveOnUnselect?: boolean;  // 當此欄位被取消勾選(false)時自動儲存並退出編輯
  autoEditOnChange?: boolean;    // 當此欄位有任何變更時自動進入編輯模式

  selectorConfig?: {
    valuePropertyName: string; // 取值用的屬性名稱
    labelPropertyName: string; // 顯示用的屬性名稱
    displayFieldsConfig: DisplayFieldConfig[]; // 顯示欄位配置
    panelTableColumns: SelectorTableColumn[];   // 面板表格欄位
    searchFormFields: any[];  // 搜尋表單欄位配置
    searchMethod?: (searchParams: any, rowData?: any) => Observable<any[]>;  // 搜尋方法
    panelDataSource?: any[];  // 面板資料來源
    totalDataCount?: number;  // 總筆數
  };

  directEdit?: boolean; //控制能否直接編輯checkbox

  allowDecimal?: boolean;  // 是否允許小數點
  decimalPlaces?: number;  // 小數位數，預設2位
  displayMultiplier?: number;  // 顯示倍率(例如 100 表示 0.2 顯示為 20，用於百分比等場景)
  useGrouping?: boolean;  // 是否使用千分位分隔符，預設為 true

  // 使用語義化的日期格式類型
  dateFormat?: DateFormatType;
  placeholder?: string;
  responsiveWidth?: {
    desktop?: string;
    tablet?: string;
    mobile?: string;
  };
  autoWidth?: boolean;
  readonly?: boolean;
  maxLength?: number;  // 最大字元數（自動鉗制）
  minLength?: number;  // 最小字元數（自動鉗制）
  maxValue?: number;  // 最大數值（自動鉗制）
  minValue?: number;  // 最小數值（自動鉗制）
  validateMax?: number;      // 即時驗證上限（不鉗制，超過就把該格標紅並顯示驚嘆號）
  validateMessage?: string;  // validateMax 觸發時的提示文字

  customCheckboxHandler?: (event: {
    rowData: any,
    field: string,
    newValue: boolean,
    oldValue: boolean,
    parentData?: any
  }) => void;
}

@Component({
  selector: 'app-expandable-edit-table',
  templateUrl: './expandable-edit-table.component.html',
  styleUrls: ['./expandable-edit-table.component.scss'],
  standalone: true,
  imports: [NgIf, TableModule, NgClass, PrimeTemplate, ButtonDirective, Ripple, TooltipModule, NgFor, NgStyle, NgSwitch, NgSwitchCase, FormsModule, InputTextModule, InputNumberModule, DropdownModule, CheckboxModule, NgSwitchDefault, DialogModule, CalendarModule, DecimalPipe, ReactiveFormsModule, SelectorPanelComponent, SelectorPanelComponent, MultiSelectModule]
})
export class ExpandableEditTableComponent implements OnInit, OnChanges {
  @ViewChild('dt') dt!: Table;
  @Input() showSequenceNumber = true; //外層序號是否顯示
  @Input() showDetailSequenceNumber = true; //內層序號是否顯示
  @Input() forceEditMode = false; // 強制編輯模式
  @Input() showActionColumn = true;  // 新增控制操作欄的屬性
  @Input() showDetailActionColumn = true;  // 控制詳細資料表格的操作欄
  @Input() title = '';
  @Input() mainColumns: ColumnDef[] = [];
  @Input() detailColumns: ColumnDef[] = [];
  @Input() data: any[] = [];
  @Input() detailKey = 'details';
  @Input() dataKey = 'id';
  @Input() showCheckBox = true;
  @Input() showPaginator = true;
  @Input() selectionMode: 'multiple' | 'single' | null = 'multiple';
  @Input() loading = false;
  @Input() emptyMessage = '查無資料';
  @Input() readonly = false;
  @Input() expandedContentTemplate: TemplateRef<any> | null = null;

  @Input() showAddButton = true;
  @Input() showDetailAddButton = true;
  @Input() showBatchDelete = true;
  @Input() defaultNewItem: any = {};
  @Input() defaultNewDetailItem: any = {};

  @Input() showDetailTabs = false;
  @Input() detailTabOptions: { id: string, label: string, allowAdd: boolean, allowBatchDelete: boolean, showCheckbox: boolean }[] = [];
  @Input() defaultDetailTab = '';
  @Input() detailColumnsMap: { [tabId: string]: ColumnDef[] } = {};
  @Input() showDetailBatchDelete = true;

  //新增：自動編輯相關屬性
  @Input() autoEditOnAdd = true; // 新增項目時是否自動進入編輯狀態
  @Input() autoAddDetailRowOnTab = false;
  @Input() autoAddRowOnTab = false; // 控制是否啟用 Tab 自動新增行功能

  //自動寬度處理
  @Input() enableDynamicWidth = false;
  @Input() minColumnWidth = 60;
  @Input() maxColumnWidth = 300;

  // 每一筆資料前是否重複顯示外層表頭（從第二筆開始，適用於有展開功能的表格）
  @Input() showHeaderInExpansion = false;

  // 欄位顯示切換（齒輪圖示 multiSelect）
  @Input() showColumnToggle = false;

  detailSelectedTabs: { [key: string]: string } = {};
  detailSelectedItems: { [mainRowKey: string]: any[] } = {};

  // 欄位切換相關狀態
  columnToggleOptions: ColumnDef[] = [];
  selectedVisibleColumns: ColumnDef[] = [];
  private _lastMainColumnsRef: ColumnDef[] | null = null;

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

  @Output() fieldChange = new EventEmitter<{
    fieldName: string,
    newValue: any,
    rowData: any
  }>();

  @Output() detailFieldChange = new EventEmitter<{
    fieldName: string,
    newValue: any,
    detailData: any,
    parentData: any,
    rowIndex: number,
    detailIndex: number
  }>();

  @Output() buttonClick = new EventEmitter<{
    rowData: any;
    field: string;  // 欄位名稱，您可以用這個判斷是哪個按鈕
  }>();

  @Output() detailButtonClick = new EventEmitter<{
    detailData: any;
    field: string;  // 欄位名稱，您可以用這個判斷是哪個按鈕
    parentData: any;
  }>();

  @Output() beforeSave = new EventEmitter<{
    data: any,
    preventDefault: () => void
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

  // 簡化狀態管理 - 只儲存使用者正在輸入的值
  private userInputValues: Map<string, string> = new Map();

  private debounceTimers: Map<string, any> = new Map();

  private computedColumnWidths: { [field: string]: number } = {};
  private readonly DEBOUNCE_DELAY = 300; // 300ms 防抖延遲

  constructor(
    private cdr: ChangeDetectorRef,
    private messageService: NotificationService,
    private fb: FormBuilder,
    private validationService: TableValidationService,
    private widthCalculator: TableWidthCalculatorService
  ) { }

  ngOnInit() {
    this.totalRecords = this.data.length;
    this.initializeDetailArrays();
    // 初始化預設值
    this.initializeDefaultValues();
    if (this.enableDynamicWidth) {
      setTimeout(() => this.calculateDynamicWidths(), 100);
    }
    if (this.showColumnToggle) {
      this.initColumnToggle();
    }
  }

  ngOnChanges() {
    if (this.showColumnToggle) {
      this.initColumnToggle();
    }
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

    if (this.enableDynamicWidth && this.data) {
      this.widthCalculator.clearCache();
      setTimeout(() => this.calculateDynamicWidths(), 50);
    }
  }

  // ========== 欄位顯示切換 ==========
  initColumnToggle(): void {
    // mainColumns reference 沒換就不重初始化，避免 change detection loop
    if (this._lastMainColumnsRef === this.mainColumns) return;
    this._lastMainColumnsRef = this.mainColumns;

    // 排除操作型欄位（checkbox、button）不加入齒輪選單
    this.columnToggleOptions = this.mainColumns.filter(col =>
      col.type !== 'button' && col.field !== 'is_selected'
    );
    // 初始可見欄位 = 未標記 hidden 的欄位
    this.selectedVisibleColumns = this.columnToggleOptions.filter(col => !col.hidden);
  }

  onColumnToggleChange(selected: ColumnDef[]): void {
    this.columnToggleOptions.forEach(opt => {
      const col = this.mainColumns.find(c => c.field === opt.field);
      if (col) {
        col.hidden = !selected.some(s => s.field === col.field);
      }
    });
  }

  private calculateDynamicWidths(): void {
    const containerWidth = this.getTableContainerWidth();
    if (containerWidth <= 0) return;

    const fixedWidth = this.calculateFixedColumnsWidth();

    this.computedColumnWidths = this.widthCalculator.calculateOptimalWidths(
      this.data,
      this.mainColumns,
      containerWidth,
      {
        minColumnWidth: this.minColumnWidth,
        maxColumnWidth: this.maxColumnWidth,
        fixedColumnsWidth: fixedWidth
      }
    );

    this.cdr.detectChanges();
  }


  private getTableContainerWidth(): number {
    const container = document.querySelector('.expandable-edit-table-container');
    if (container) {
      const rect = container.getBoundingClientRect();
      return Math.max(rect.width - 60, 800);
    }
    return Math.max(globalThis.innerWidth - 100, 800);
  }

  private calculateFixedColumnsWidth(): number {
    let fixedWidth = 0;
    if (this.showSequenceNumber) fixedWidth += 40;
    if (this.showCheckBox && !this.readonly) fixedWidth += 45;
    if (this.detailKey) fixedWidth += 40;
    if (!this.readonly && this.showActionColumn) fixedWidth += 80;
    return fixedWidth;
  }

  ngOnDestroy(): void {
    console.log('🧹 清理防抖計時器...');

    // 清理所有防抖計時器
    this.debounceTimers.forEach((timer, key) => {
      console.log(`🗑️ 清除計時器: ${key}`);
      clearTimeout(timer);
    });
    this.debounceTimers.clear();

    // 原有的清理邏輯...
    this.cleanupSelectorResources();
    this.userInputValues.clear();
    this.validationService.reset();
  }


  // 核心功能：純粹的日期格式化，不修改原始資料
  private formatDateForDisplay(rawValue: any, formatType: DateFormatType): string {
    if (!rawValue) return '';

    try {
      let dateObj: Date;

      // 統一日期對象創建邏輯
      if (rawValue instanceof Date) {
        dateObj = rawValue;
      } else if (typeof rawValue === 'string') {
        // 處理 ISO 日期格式
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(rawValue)) {
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
        // 標準格式
        else {
          dateObj = new Date(rawValue);
        }
      } else if (typeof rawValue === 'number') {
        dateObj = new Date(rawValue);
      } else {
        return '';
      }

      // 檢查日期有效性和合理性
      if (isNaN(dateObj.getTime())) {
        console.warn('無效的日期值:', rawValue);
        return '';
      }

      if (!this.isValidDateRange(dateObj)) {
        console.warn('日期超出合理範圍:', dateObj);
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

  // 詳細資料文字輸入處理
  onDetailTextInputChange(detailData: any, column: ColumnDef, inputValue: string, rowIndex: number, detailIndex: number): void {
    let processedValue = inputValue;

    // 應用長度限制
    if (column.maxLength && inputValue.length > column.maxLength) {
      processedValue = inputValue.substring(0, column.maxLength);
    }

    const oldValue = detailData[column.field];
    detailData[column.field] = processedValue;

    // 新增：觸發詳細資料欄位變更事件
    this.triggerDetailFieldChangeEvent(column.field, processedValue, detailData, rowIndex, detailIndex, oldValue);

    // 如果是直接編輯模式，觸發儲存
    if (column.directEdit) {
      const parentData = this.data[rowIndex];
      this.onDetailDirectEditChange(detailData, parentData, column.field, processedValue, rowIndex, detailIndex);
    }
  }

  // 對外接口：取得格式化的日期顯示值
  getDateDisplayValue(rowData: any, column: ColumnDef): string {
    const field = column.field;
    const rawValue = rowData[field];
    const formatType = column.dateFormat || 'full-date';

    return this.formatDateForDisplay(rawValue, formatType);
  }


  onDateInputChange(rowData: any, column: ColumnDef, inputValue: string, isDetail: boolean = false, detailIndex?: number): void {
    const fieldKey = this.getFieldKey(rowData, column.field, isDetail, detailIndex);

    // 只暫存用戶輸入，不做任何解析或格式化
    this.userInputValues.set(fieldKey, inputValue);

    console.log(`📝 日期輸入暫存: ${column.field} = "${inputValue}"`);

    // 如果是空值，立即清空
    if (!inputValue || inputValue.trim() === '') {
      rowData[column.field] = null;
      this.userInputValues.delete(fieldKey);
      this.triggerFieldChangeEvent(column.field, null, rowData);
    }
  }

  onTextInputChange(rowData: any, column: ColumnDef, inputValue: string): void {
    const oldValue = rowData[column.field];
    let processedValue = inputValue;

    if (column.maxLength && inputValue.length > column.maxLength) {
      processedValue = inputValue.substring(0, column.maxLength);
    }

    rowData[column.field] = processedValue;

    // 🔥 立即觸發 fieldChange 事件（與下拉選單一致）
    this.fieldChange.emit({
      fieldName: column.field,
      newValue: processedValue,
      rowData
    });

    // 🔥 強制變更檢測（與下拉選單一致）
    this.cdr.detectChanges();

    if (column.directEdit) {
      this.onDirectEditChange(rowData, column.field, processedValue);
    }
  }

  // 獲取日期輸入值（編輯時使用）
  getDateInputValue(rowData: any, column: ColumnDef, isDetail: boolean = false, detailIndex?: number): string {
    const fieldKey = this.getFieldKey(rowData, column.field, isDetail, detailIndex);

    // 優先顯示用戶正在輸入的值
    const userInput = this.userInputValues.get(fieldKey);
    if (userInput !== undefined) {
      console.log(`📝 顯示用戶輸入: "${userInput}"`);
      return userInput;
    }

    // 否則顯示格式化的值
    const displayValue = this.getDateDisplayValue(rowData, column);
    // console.log(`📅 顯示格式化值: "${displayValue}"`);
    return displayValue;
  }
  /**
  * 觸發儲存事件（如果需要）
  */
  private triggerSaveIfNeeded(rowData: any, column: ColumnDef, newValue: any, isDetail = false, detailIndex?: number): void {
    if (column.directEdit) {
      if (isDetail && detailIndex !== undefined) {
        // 詳細資料直接編輯
        const parentData = this.data.find(item => item[this.detailKey]?.includes(rowData));
        if (parentData) {
          this.onDetailDirectEditChange(rowData, parentData, column.field, newValue, undefined, detailIndex);
        }
      } else {
        // 主資料直接編輯
        this.onDirectEditChange(rowData, column.field, newValue);
      }
    }
  }

  private showDateFormatHint(inputValue: string, formatType: DateFormatType): void {
    let hint = '';

    if (formatType.includes('year-month')) {
      hint = `日期格式錯誤：「${inputValue}」\n支援格式：202508、2025/08、2025-08`;
    } else {
      hint = `日期格式錯誤：「${inputValue}」\n支援格式：20250815、2025/08/15、2025-08-15`;
    }

    this.messageService.warnBubble(hint);
  }

  /**
   * 清理輸入狀態（在行編輯結束時呼叫）
   */
  private cleanupDateInputStates(rowData: any): void {
    const rowKey = rowData[this.dataKey];
    const keysToDelete: string[] = [];

    this.userInputValues.forEach((value, key) => {
      if (key.startsWith(`${rowKey}_`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.userInputValues.delete(key));
  }


  // Blur 時統一處理：驗證 → 轉換 → 格式化 → 儲存
  onDateInputBlur(rowData: any, column: ColumnDef, isDetail: boolean = false, detailIndex?: number): void {
    const fieldKey = this.getFieldKey(rowData, column.field, isDetail, detailIndex);
    const userInput = this.userInputValues.get(fieldKey);
    const formatType = column.dateFormat || 'full-date';

    console.log(` 日期 Blur 處理開始: ${column.field}`, {
      userInput,
      currentValue: rowData[column.field],
      formatType
    });

    // 如果沒有用戶輸入，表示沒有修改，直接跳過
    if (userInput === undefined) {
      console.log(`⭐ 沒有用戶輸入，跳過處理`);
      return;
    }

    // 空值處理
    if (!userInput || userInput.trim() === '') {
      const oldValue = rowData[column.field];
      rowData[column.field] = null;
      this.userInputValues.delete(fieldKey);
      this.triggerFieldChangeEvent(column.field, null, rowData, oldValue);
      console.log(`日期已清空`);
      return;
    }

    // 核心：統一日期解析邏輯
    const parsedDate = this.parseUserDateInput(userInput.trim(), formatType);

    if (parsedDate && this.isValidDateRange(parsedDate)) {
      // 解析成功且合理
      const oldValue = rowData[column.field];
      rowData[column.field] = parsedDate;
      this.userInputValues.delete(fieldKey);

      console.log(`日期解析成功: "${userInput}" -> ${this.formatDateForDisplay(parsedDate, formatType)}`);

      this.triggerFieldChangeEvent(column.field, parsedDate, rowData, oldValue);
      this.triggerSaveIfNeeded(rowData, column, parsedDate, isDetail, detailIndex);
    } else {
      // ❌ 解析失敗：保持原值，清除無效輸入，顯示錯誤提示
      this.userInputValues.delete(fieldKey);
      this.showDateFormatHint(userInput, formatType);

      console.warn(`❌ 日期格式錯誤，保持原值: "${userInput}"`);
    }

    this.cdr.detectChanges();
  }

  private parseUserDateInput(inputValue: string, formatType: DateFormatType): Date | null {
    console.log(`🔍 解析用戶日期輸入: "${inputValue}" (期望格式: ${formatType})`);

    if (!inputValue) return null;

    try {
      // 年月格式處理
      if (formatType.includes('year-month')) {
        return this.parseYearMonthInput(inputValue);
      }
      // 完整日期格式處理
      else {
        return this.parseFullDateInput(inputValue);
      }
    } catch (error) {
      console.error('日期解析錯誤:', error, inputValue);
      return null;
    }
  }

  // 4. 新增：日期合理性驗證
  private isValidDateRange(date: Date): boolean {
    if (!date || isNaN(date.getTime())) {
      return false;
    }
    const year = date.getFullYear();
    const isReasonable = year >= 1900 && year <= 2100;
    return isReasonable;
  }

  private triggerFieldChangeEvent(fieldName: string, newValue: any, rowData: any, oldValue?: any): void {
    console.log(`🔥 觸發欄位變更事件: ${fieldName}`, {
      舊值: oldValue,
      新值: newValue,
      rowId: rowData[this.dataKey]
    });

    // 發出 fieldChange 事件
    this.fieldChange.emit({
      fieldName,
      newValue,
      rowData
    });
  }

  // 這個方法和實作都要保留
  private getFieldKey(rowData: any, field: string, isDetail: boolean = false, detailIndex?: number): string {
    const mainKey = `${rowData[this.dataKey]}_${field}`;
    return isDetail ? `${mainKey}_detail_${detailIndex}` : mainKey;
  }

  /**
   * 智慧日期解析 - 支援多種輸入格式
   */
  private parseSmartDateInput(inputValue: string, formatType: DateFormatType): Date | null {
    if (!inputValue) return null;

    try {
      // 年月格式處理
      if (formatType.includes('year-month')) {
        return this.parseYearMonthInput(inputValue);
      }

      // 完整日期格式處理
      else {
        return this.parseFullDateInput(inputValue);
      }
    } catch (error) {
      console.error('日期解析錯誤:', error);
      return null;
    }
  }

  /**
   * 解析年月輸入 (202508, 2025/08, 2025-08 -> 2025/08)
   */
  private parseYearMonthInput(input: string): Date | null {
    let year: number, month: number;

    if (/^\d{6}$/.test(input)) {
      // 202508 -> 2025/08
      year = parseInt(input.substring(0, 4), 10);
      month = parseInt(input.substring(4, 6), 10);
    }
    else if (/^\d{4}[\/-]\d{1,2}$/.test(input)) {
      // 2025/08 或 2025-08 -> 2025/08
      const parts = input.split(/[\/-]/);
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
    }
    else if (/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(input)) {
      // 如果使用者輸入完整日期但要年月格式，提取年月部分
      const parts = input.split(/[\/-]/);
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
    }
    else {
      return null;
    }

    // 驗證年月範圍
    if (year < 1900 || year > 2100 || month < 1 || month > 12) {
      return null;
    }

    return new Date(year, month - 1, 1);
  }

  /**
  * 解析完整日期輸入 (20250815, 2025/08/15, 2025-08-15 -> 2025/08/15)
  */
  private parseFullDateInput(input: string): Date | null {
    let year: number, month: number, day: number;

    if (/^\d{8}$/.test(input)) {
      // 20250815 -> 2025/08/15
      year = parseInt(input.substring(0, 4), 10);
      month = parseInt(input.substring(4, 6), 10);
      day = parseInt(input.substring(6, 8), 10);
    }
    else if (/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(input)) {
      // 2025/08/15 或 2025-08-15 -> 2025/08/15
      const parts = input.split(/[\/-]/);
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    }
    else if (/^\d{6}$/.test(input)) {
      // 如果使用者在日期欄位只輸入年月，預設為該月1號
      year = parseInt(input.substring(0, 4), 10);
      month = parseInt(input.substring(4, 6), 10);
      day = 1;
    }
    else if (/^\d{4}[\/-]\d{1,2}$/.test(input)) {
      // 如果使用者輸入 2025/08，預設為該月1號
      const parts = input.split(/[\/-]/);
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = 1;
    }
    else {
      return null;
    }

    // 驗證日期有效性
    if (!this.isValidDate(year, month - 1, day)) {
      return null;
    }

    return new Date(year, month - 1, day);
  }


  // 對外接口：取得欄位的 placeholder
  getDatePlaceholder(column: ColumnDef): string {
    // if (column.placeholder) {
    //   return column.placeholder;
    // }

    // const formatType = column.dateFormat || 'full-date';

    // // 根據格式提供更明確的提示
    // switch (formatType) {
    //   case 'year-month':
    //     return '例：2024/01 或 202401';
    //   case 'year-month-compact':
    //     return '例：202401';
    //   case 'year-month-dash':
    //     return '例：2024-01';
    //   case 'full-date':
    //     return '例：2024/01/15 或 20240115';
    //   case 'full-date-compact':
    //     return '例：20240115';
    //   case 'full-date-dash':
    //     return '例：2024-01-15';
    //   default:
    //     return '請輸入日期';
    // }
    return "";
  }

  // 輔助方法：日期有效性檢查
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

    // 如果啟用自動編輯，在新增後自動進入編輯狀態
    if (this.autoEditOnAdd) {
      setTimeout(() => {
        const lastIndex = this.data.length - 1;
        if (lastIndex >= 0) {
          console.log(' 自動進入新增項目的編輯模式');
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

  isPreviousRowExpanded(ri: number): boolean {
    if (ri === 0) return false;
    const prevRow = this.data[ri - 1];
    return prevRow ? !!this.expandedRows[prevRow[this.dataKey]] : false;
  }

  onRowEditInit(rowData: any, rowIndex: number) {
    this.editingRow = rowIndex;
    this.clonedItems[rowData[this.dataKey]] = { ...rowData };

    // 深拷貝包括詳細資料
    this.clonedItems[rowData[this.dataKey]] = {
      ...rowData,
      [this.detailKey]: rowData[this.detailKey] ?
        JSON.parse(JSON.stringify(rowData[this.detailKey])) : []
    };

    //在進入編輯模式時套用預設值（包括動態預設值）
    this.mainColumns.forEach(column => {
      const currentValue = rowData[column.field];

      // 如果欄位沒有值且有預設值函數
      if ((currentValue === undefined || currentValue === null || currentValue === '') && column.defaultValueFunction) {
        try {
          const defaultValue = column.defaultValueFunction();
          if (defaultValue !== null && defaultValue !== undefined) {
            rowData[column.field] = defaultValue;
            console.log(` 編輯模式套用動態預設值 ${column.field}: ${defaultValue}`);
          }
        } catch (error) {
          console.error(`❌ 動態預設值函數執行失敗 ${column.field}:`, error);
        }
      }

      // 如果欄位沒有值且有靜態預設值
      else if ((currentValue === undefined || currentValue === null || currentValue === '') && column.defaultValue !== undefined) {
        rowData[column.field] = column.defaultValue;
        console.log(` 編輯模式套用靜態預設值 ${column.field}: ${column.defaultValue}`);
      }
    });

    this.edit.emit(rowData);

    if (!rowData[this.detailKey]) {
      rowData[this.detailKey] = [];
    }

    this.cdr.detectChanges();
  }

  onRowEditSave(rowData: any) {
    try {
      // 新增：保存前最後一次驗證所有日期欄位
      this.validateAllDateFieldsBeforeSave(rowData);

      // 驗證
      const validationResult = this.validationService.validateRow(rowData, this.mainColumns, this.dataKey);

      if (!validationResult.isValid) {
        const errorMessage = this.validationService.formatValidationErrors(validationResult.errors);
        this.messageService.warnBubble(errorMessage);
        return;
      }

      // 讓父元件決定是否可以儲存
      let canSave = true;
      const preventSave = () => { canSave = false; };

      this.beforeSave.emit({
        data: rowData,
        preventDefault: preventSave
      });

      if (!canSave) {
        return;
      }

      // 儲存
      const oldData = this.clonedItems[rowData[this.dataKey]];
      delete this.clonedItems[rowData[this.dataKey]];
      this.editingRow = null;

      // 清理日期輸入狀態
      this.cleanupDateInputStates(rowData);
      this.validationService.clearRowValidationErrors(rowData, this.dataKey);

      this.save.emit({ oldData, newData: rowData });
      this.cdr.detectChanges();
    } catch (error) {
      console.error('儲存行時出錯：', error);
      this.messageService.warnBubble('儲存失敗，請檢查輸入內容');
    }
  }

  /**
 * 新增：保存前驗證所有日期欄位
 */
  private validateAllDateFieldsBeforeSave(rowData: any): void {
    const rowKey = rowData[this.dataKey];

    // 檢查是否有未處理的用戶輸入
    const pendingDateInputs: string[] = [];

    this.userInputValues.forEach((value, key) => {
      if (key.startsWith(`${rowKey}_`)) {
        pendingDateInputs.push(key);
      }
    });

    if (pendingDateInputs.length > 0) {
      console.log(` 保存前處理待驗證的日期輸入:`, pendingDateInputs);

      // 強制處理所有待驗證的日期輸入
      pendingDateInputs.forEach(key => {
        const fieldName = key.split('_')[1]; // 提取欄位名稱
        const column = this.findColumnByField(fieldName);

        if (column && column.type === 'date') {
          console.log(` 強制處理日期欄位: ${fieldName}`);
          // 觸發 blur 處理
          this.onDateInputBlur(rowData, column, false);
        }
      });
    }
  }

  onRowEditCancel(rowData: any, rowIndex: number) {
    try {
      const originalData = this.clonedItems[rowData[this.dataKey]];

      // 加這段：檢查是否為新增且未填寫的空資料
      if (rowData._isNew && rowData._isEmpty && !rowData.location_no) {
        console.log('🗑️ 偵測到空資料（未選擇位置），自動刪除');

        // 從資料陣列中移除
        const index = this.data.findIndex(item => item[this.dataKey] === rowData[this.dataKey]);
        if (index > -1) {
          this.data.splice(index, 1);
          this.data = [...this.data]; // 觸發變更檢測
          console.log(`已從索引 ${index} 移除空資料`);
        }

        // 清理備份
        delete this.clonedItems[rowData[this.dataKey]];
        this.editingRow = null;

        // 顯示提示訊息
        this.messageService.infoBubble('已取消新增');

        this.cdr.detectChanges();
        return; // ⚠️ 重要：這裡要 return，不執行後面的邏輯
      }

      // 下面是原本的程式碼，保持不變
      Object.keys(originalData).forEach(key => {
        if (key !== this.detailKey) {
          rowData[key] = originalData[key];
        }
      });

      if (originalData[this.detailKey]) {
        rowData[this.detailKey] = JSON.parse(JSON.stringify(originalData[this.detailKey]));
      }

      delete this.clonedItems[rowData[this.dataKey]];
      this.editingRow = null;

      this.cleanupDateInputStates(rowData);
      this.validationService.clearRowValidationErrors(rowData, this.dataKey);

      this.cancel.emit(rowData);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('取消編輯行時出錯：', error);
    }
  }

  onDetailEditInit(detailData: any, rowData: any, rowIndex: number, detailIndex: number) {
    this.editingDetail = { rowIndex, detailIndex };

    // 不要只備份 detailData，備份整個 rowData
    const parentKey = rowData[this.dataKey];
    if (!this.clonedItems[parentKey]) {
      // 深拷貝整個父項目，包括所有子項目
      this.clonedItems[parentKey] = JSON.parse(JSON.stringify(rowData));
    }

    this.detailEdit.emit(detailData);
  }

  onDetailEditCancel(detailData: any, rowData: any, rowIndex: number, detailIndex: number) {
    const parentKey = rowData[this.dataKey];
    const originalParentData = this.clonedItems[parentKey];

    if (originalParentData) {
      // 還原整個父項目
      Object.assign(rowData, originalParentData);

      // 觸發 Next2 的同步邏輯
      this.detailCancel.emit({
        detailData,
        parentData: rowData,
        shouldRefreshDisplay: true
      });
    }

    this.editingDetail = null;
    delete this.clonedItems[parentKey];
  }
  onDetailEditSave(detailData: any, rowData: any) {
    try {
      // 只做通用的驗證框架，不包含具體業務邏輯
      let canSave = true;
      const preventSave = () => { canSave = false; };

      // 發出 beforeSave 事件，讓父組件處理業務驗證
      this.beforeSave.emit({
        data: detailData,
        preventDefault: preventSave
      });

      if (!canSave) {
        return; // 父組件阻止儲存
      }

      // 原有的儲存邏輯
      const oldDetail = this.clonedDetails[detailData.id];
      delete this.clonedDetails[detailData.id];
      this.editingDetail = null;

      this.detailSave.emit({
        oldDetail,
        newDetail: detailData,
        parentData: rowData
      });

    } catch (error) {
      console.error('儲存詳細資料時發生錯誤:', error);
      this.messageService.warnBubble('儲存失敗，請檢查輸入內容');
    }
  }
  /**
 * 清理詳細資料的日期輸入狀態
 */
  private cleanupDetailDateInputStates(detailData: any, detailIndex: number): void {
    const detailKey = detailData[this.dataKey] || detailData.id;
    const keysToDelete: string[] = [];

    this.userInputValues.forEach((value, key) => {
      if (key.includes(`${detailKey}_`) && key.includes(`_detail_${detailIndex}`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.userInputValues.delete(key));
    console.log(`清理詳細資料 ${detailIndex} 的日期輸入狀態:`, keysToDelete);
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
    let count = 0;

    // 序號欄（可選）
    if (this.showSequenceNumber) {
      count += 1;
    }

    // 其他欄位...
    if (this.showCheckBox && this.selectionMode === 'multiple' && !this.readonly) {
      count += 1;
    }

    if (this.detailKey) {
      count += 1;
    }

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

    // 修復：如果有現有值就用現有值，沒有就用今天的日期
    let initialDate: Date;

    if (data[field] && data[field] instanceof Date && !isNaN(data[field].getTime())) {
      // 使用現有的有效日期
      initialDate = new Date(data[field]);
    } else {
      // 使用今天的日期
      initialDate = new Date();
    }

    this.temporaryDate = initialDate;
    this.datePickerVisible = true;
  }

  confirmDateSelection() {
    if (this.currentDateField && this.temporaryDate) {
      const column = this.getCurrentEditingColumn();
      const oldValue = this.currentDateField.data[this.currentDateField.field];

      //  關鍵修正：使用日期工具，返回字串格式
      let finalDateString: string;

      // 根據格式處理日期
      if (column?.dateFormat?.includes('year-month')) {
        const year = this.temporaryDate.getFullYear();
        const month = String(this.temporaryDate.getMonth() + 1).padStart(2, '0');
        finalDateString = `${year}-${month}-01`;
      } else {
        //  使用 DateUtils 處理，避免時區問題
        finalDateString = DateUtils.toDateString(this.temporaryDate);
      }

      console.log('📅 日期選擇確認:', {
        欄位: this.currentDateField.field,
        選擇的日期: this.temporaryDate,
        最終字串: finalDateString,
        舊值: oldValue
      });

      //  儲存為字串格式
      this.currentDateField.data[this.currentDateField.field] = finalDateString;

      // 清理用戶輸入狀態
      const fieldKey = this.getFieldKey(
        this.currentDateField.data,
        this.currentDateField.field,
        this.currentDateField.isDetail,
        this.currentDateField.detailIndex
      );
      this.userInputValues.delete(fieldKey);

      // 觸發 fieldChange 事件（明細行用 detailFieldChange，主行用 fieldChange）
      if (this.currentDateField.isDetail) {
        this.triggerDetailFieldChangeEvent(
          this.currentDateField.field,
          finalDateString,
          this.currentDateField.data,
          this.currentDateField.rowIndex ?? 0,
          this.currentDateField.detailIndex ?? 0,
          oldValue
        );
      } else {
        this.triggerFieldChangeEvent(
          this.currentDateField.field,
          finalDateString,
          this.currentDateField.data,
          oldValue
        );
      }

      // 如果是直接編輯模式，觸發保存
      if (column?.directEdit) {
        this.triggerSaveIfNeeded(
          this.currentDateField.data,
          column,
          finalDateString,  //  傳遞字串
          this.currentDateField.isDetail,
          this.currentDateField.detailIndex
        );
      }

      this.cdr.detectChanges();
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

    // 如果啟用自動編輯，在新增後自動進入編輯狀態
    if (this.autoEditOnAdd) {
      setTimeout(() => {
        const detailArray = parentData[this.detailKey];
        if (detailArray && detailArray.length > 0) {
          const lastDetailIndex = detailArray.length - 1;
          console.log(' 自動進入新增詳細項目的編輯模式');
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

    // 立即觸發 fieldChange 事件
    this.fieldChange.emit({
      fieldName: field,
      newValue,
      rowData
    });

    // 強制變更檢測
    this.cdr.detectChanges();

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

  //  寬度控制相關方法
  getColumnStyle(col: ColumnDef): any {
    const styles: any = {};

    // 只處理動態寬度
    if (this.enableDynamicWidth && this.computedColumnWidths[col.field]) {
      const width = Math.ceil(this.computedColumnWidths[col.field]);
      styles.width = `${width}px`;
      styles.minWidth = `${Math.max(this.minColumnWidth, width - 20)}px`;
    }

    // 只保留 style 字符串解析
    if (col.style) {
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

    return styles;
  }



  private camelCase(str: string): string {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }


  hasCaptionContent(): boolean {
    return (
      (!this.readonly && this.showAddButton) ||
      (!this.readonly && this.showBatchDelete) ||
      !!this.detailKey ||
      this.showColumnToggle ||
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

  // 主表格表頭操作欄位樣式
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

  // 主表格表身操作欄位樣式
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

  // 詳細資料表格表頭操作欄位樣式
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

  // 詳細資料表格表身操作欄位樣式
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
    // 🔧 優先使用欄位定義的 useGrouping，若未定義則預設為 true
    const useGrouping = col.useGrouping !== undefined ? col.useGrouping : true;

    const baseConfig: any = {
      mode: 'decimal',
      useGrouping: useGrouping  // 使用欄位定義的千分位設定
    };

    // 🔧 修復: 只在欄位定義有設定 minValue 時才加入 min，避免刪除時自動填 0
    if (col.minValue !== undefined) {
      baseConfig.min = col.minValue;
    }

    // 🔧 只在欄位定義有設定 maxValue 時才加入 max
    if (col.maxValue !== undefined) {
      baseConfig.max = col.maxValue;
    }

    if (col.allowDecimal) {
      return {
        ...baseConfig,
        // 🔧 修復: 不設置 minFractionDigits，避免 Backspace 刪除時自動補 0
        // minFractionDigits: 0,
        maxFractionDigits: col.decimalPlaces || 2,
        step: col.decimalPlaces === 1 ? 0.1 : 0.01
      };
    }

    return {
      ...baseConfig,
      // 🔧 修復: 不設置 minFractionDigits，避免 Backspace 刪除時自動補 0
      // minFractionDigits: 0,
      maxFractionDigits: 0,
      step: 1
    };
  }

  getExpandedColspan(): number {
    let colspan = 0;

    // 序號欄（可選）
    if (this.showSequenceNumber) {
      colspan += 1;
    }

    // 其他欄位...
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

  // 檢查欄位是否可編輯的方法
  isFieldEditable(column: ColumnDef, isEditing: boolean): boolean {
    // 如果欄位設為不可編輯，則永遠不可編輯
    if (column.editable === false) {
      return false;
    }

    // 如果欄位設為可編輯或未設定，則根據當前編輯狀態決定
    return isEditing && (column.editable === true || column.editable === undefined);
  }

  // 檢查欄位是否應該顯示為輸入控件
  shouldShowInputControl(column: ColumnDef, isEditing: boolean, rowData?: any): boolean {
    // 如果開啟強制編輯模式，且欄位沒有明確禁止編輯
    if (this.forceEditMode && column.editable !== false) {
      return true;
    }

    // 直接編輯模式
    if (column.directEdit === true && column.editable !== false) {
      return true;
    }

    // 原有邏輯：正在編輯且可編輯
    return this.isFieldEditable(column, isEditing);
  }

  // 檢查欄位是否應該顯示為純文字
  shouldShowDisplayOnly(column: ColumnDef, isEditing: boolean, rowData?: any): boolean {
    // 如果開啟強制編輯模式，且欄位沒有明確禁止編輯
    if (this.forceEditMode && column.editable !== false) {
      return false;
    }

    // 直接編輯模式
    if (column.directEdit === true && column.editable !== false) {
      return false;
    }

    // 原有邏輯
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

    console.log(`直接編輯變更: ${field} = ${newValue} (第${(rowIndex || 0) + 1}行)`);

    // 觸發和編輯保存一樣的事件，讓外部組件知道資料已更新
    this.save.emit({
      oldData: { ...rowData, [field]: oldValue },
      newData: { ...rowData }
    });
  }

  // 新增：處理詳細資料直接編輯欄位的變更事件
  onDetailDirectEditChange(detailData: any, parentData: any, field: string, newValue: any, rowIndex?: number, detailIndex?: number): void {
    const oldValue = detailData[field];
    detailData[field] = newValue;

    console.log(`詳細資料直接編輯變更: ${field} = ${newValue} (主行${(rowIndex || 0) + 1}, 詳細行${(detailIndex || 0) + 1})`);

    // 觸發詳細資料保存事件
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

      // 注意：不要在這裡監聽 valueChanges
      // 因為 selector-panel 的事件會直接處理值的更新
      // 避免重複觸發 onDirectEditChange
    }

    return this.selectorControls.get(key)!;
  }

  // 新增：取得 selector 建議項目
  getSelectorSuggestions(rowData: any, fieldName: string): any[] {
    const key = `${rowData[this.dataKey]}_${fieldName}`;
    return this.selectorSuggestions.get(key) || [];
  }

  // 新增：處理 selector 搜尋輸入變更
  onSelectorSearchInputChanged(searchParams: any, rowData: any, column: ColumnDef): void {
    const key = `${rowData[this.dataKey]}_${column.field}`;

    if (column.selectorConfig?.searchMethod) {
      column.selectorConfig.searchMethod(searchParams, rowData).subscribe(suggestions => {
        this.selectorSuggestions.set(key, suggestions);
      });
    }
  }

  // 新增：處理 selector 搜尋表單變更
  // 把原來的方法完全替換為：
  onSelectorSearchFormChanged(formValue: any, rowData: any, column: ColumnDef): void {
    console.log('🚨 表格收到搜尋表單變更:', formValue);
    console.log('🔍 表單值詳細:', JSON.stringify(formValue, null, 2));

    if (column.selectorConfig?.searchMethod) {
      console.log('🚀 準備執行搜尋:', formValue);

      column.selectorConfig.searchMethod(formValue, rowData).subscribe({
        next: (results) => {
          console.log('搜尋成功，結果數量:', results.length);

          if (column.selectorConfig) {
            column.selectorConfig.panelDataSource = results;

            // 關鍵：從 LocationService 的特殊物件中取得分頁資訊
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

  // 新增：更新總筆數的方法（在 ExpandableEditTable 中加入）
  private updateTotalCount(selectorConfig: any, results: any[], searchParams: any): void {
    const pageSize = searchParams.pageSize || 10;
    const pageIndex = searchParams.pageIndex || 0;

    // 簡化邏輯：如果回傳的資料少於 pageSize，表示是最後一頁
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

  // 新增：取得 selector 搜尋表單
  getSelectorSearchForm(rowData: any, column: ColumnDef): FormGroup {
    const key = `${rowData[this.dataKey]}_${column.field}`;

    if (!this.selectorSearchForms.has(key)) {
      const form = this.createSelectorSearchForm(column);
      this.selectorSearchForms.set(key, form);
    }

    return this.selectorSearchForms.get(key)!;
  }

  // 新增：建立 selector 搜尋表單
  private createSelectorSearchForm(column: ColumnDef): FormGroup {
    const formConfig: { [key: string]: any } = {};

    if (column.selectorConfig?.searchFormFields) {
      column.selectorConfig.searchFormFields.forEach(field => {
        formConfig[field.name] = [''];
      });
    }

    // 修正：統一使用大寫 SortBy
    formConfig['pageSize'] = [10];
    formConfig['pageIndex'] = [1];
    formConfig['SortBy'] = [[]];  // 用大寫，預設空陣列

    return this.fb.group(formConfig);
  }

  // 新增：清理 selector 相關資源
  private cleanupSelectorResources(): void {
    this.selectorControls.clear();
    this.selectorSuggestions.clear();
    this.selectorSearchForms.clear();
  }

  //===============處理table發出的事件=============================
  // 在 expandable-edit-table.component.ts 中新增以下方法
  // 在 cleanupSelectorResources() 方法之後新增：

  /**
   * 處理 selector-panel 的 itemSelected 事件
   */
  onSelectorItemSelected(selectedItem: any, rowData: any, column: ColumnDef): void {
    console.log(' 表格收到 selector item selected:', {
      selectedItem,
      rowDataId: rowData.id || rowData[this.dataKey],
      field: column.field
    });

    const oldValue = rowData[column.field];
    const newValue = selectedItem[column.selectorConfig?.valuePropertyName || 'value'];

    // 更新 rowData
    rowData[column.field] = newValue;

    // 更新對應的 FormControl
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
      selectedOption: selectedItem // 這裡傳遞完整的選擇項目資料
    });

    console.log('表格發出 dropdownChange 事件，包含 selectedOption');
  }

  /**
   * 處理 selector-panel 的 valueChanged 事件
   */
  onSelectorValueChanged(event: { oldValue: any, newValue: any, selectedItem: any }, rowData: any, column: ColumnDef): void {
    console.log('🔄 表格收到 selector value changed:', {
      event,
      rowDataId: rowData.id || rowData[this.dataKey],
      field: column.field
    });

    // 更新 rowData
    rowData[column.field] = event.newValue;

    // 發出 dropdownChange 事件
    this.dropdownChange.emit({
      rowData,
      field: column.field,
      newValue: event.newValue,
      oldValue: event.oldValue,
      selectedOption: event.selectedItem // 傳遞完整的選擇項目資料
    });
  }

  /**
   * 處理 selector-panel 的 selectionChanged 事件
   */
  onSelectorSelectionChanged(selectedItem: any, rowData: any, column: ColumnDef): void {
    console.log(' 表格收到 selector selection changed:', selectedItem);

    // 與 itemSelected 使用相同的處理邏輯
    this.onSelectorItemSelected(selectedItem, rowData, column);
  }

  //=================欄位必填用===================
  /**
  * 檢查欄位是否為必填
  */
  isFieldRequired(column: ColumnDef): boolean {
    return this.validationService.isFieldRequired(column);
  }

  /**
   * 取得列的驗證錯誤訊息
   */
  getRowValidationErrors(rowData: any): string[] {
    return this.validationService.getRowValidationErrors(rowData, this.dataKey);
  }

  /**
  * 檢查列是否有驗證錯誤
  */
  hasRowValidationErrors(rowData: any): boolean {
    return this.validationService.hasRowValidationErrors(rowData, this.dataKey);
  }
  //=================處理數字欄位 blur 事件==================================
  onDetailNumberModelChange(
    newValue: any,
    fieldName: string,
    detailData: any,
    rowIndex: number,
    detailIndex: number
  ): void {
    console.log('詳細資料數字變更:', {
      fieldName,
      newValue,
      rowIndex,
      detailIndex
    });

    // 數值處理邏輯...
    let numericValue: number;
    if (newValue === null || newValue === undefined || newValue === '') {
      numericValue = 0;
    } else if (typeof newValue === 'number') {
      numericValue = newValue;
    } else if (typeof newValue === 'string') {
      const cleanValue = newValue.replace(/,/g, '');
      numericValue = parseFloat(cleanValue) || 0;
    } else {
      numericValue = 0;
    }

    // 自動限制到最大值和最小值
    const column = this.findColumnByField(fieldName);
    if (column) {
      if (column.maxValue !== undefined && numericValue > column.maxValue) {
        numericValue = column.maxValue;
      }
      if (column.minValue !== undefined && numericValue < column.minValue) {
        numericValue = column.minValue;
      }
    }

    const oldValue = detailData[fieldName];
    detailData[fieldName] = numericValue;

    //觸發詳細資料欄位變更事件
    this.triggerDetailFieldChangeEvent(fieldName, numericValue, detailData, rowIndex, detailIndex, oldValue);

    // // 強制變更檢測
    // this.cdr.detectChanges();

    // 處理直接編輯
    this.handleDirectEditForNumber(fieldName, numericValue, detailData, true);
  }

  onDetailDropdownChange(detailData: any, field: string, newValue: any, rowIndex: number, detailIndex: number): void {
    const oldValue = detailData[field];
    detailData[field] = newValue;

    //  新增：觸發詳細資料欄位變更事件
    this.triggerDetailFieldChangeEvent(field, newValue, detailData, rowIndex, detailIndex, oldValue);

    // 立即觸發 fieldChange 事件
    this.fieldChange.emit({
      fieldName: field,
      newValue,
      rowData: detailData
    });

    // 強制變更檢測
    this.cdr.detectChanges();

    // 原有邏輯...
    this.dropdownChange.emit({
      rowData: detailData,
      field,
      newValue,
      oldValue
    });
  }

  onNumberFieldBlur(event: any, fieldName: string, rowData: any): void {
    console.log(' 數字欄位 Blur:', {
      fieldName,
      eventValue: event.value,
      eventTarget: event.target?.value,
      currentRowValue: rowData[fieldName]
    });

    const rowId = rowData[this.dataKey] || 'unknown';
    const debounceKeyMain = `${rowId}_${fieldName}_main`;
    const debounceKeyDetail = `${rowId}_${fieldName}_detail`;

    // 立即執行任何待處理的計算
    [debounceKeyMain, debounceKeyDetail].forEach(key => {
      if (this.debounceTimers.has(key)) {
        console.log(`⚡ Blur 立即執行防抖計算: ${key}`);
        clearTimeout(this.debounceTimers.get(key));
        this.debounceTimers.delete(key);
      }
    });

    // 確保最終值正確
    let finalValue = event.value !== undefined ? event.value : event.target?.value;

    if (typeof finalValue === 'string') {
      finalValue = parseFloat(finalValue.replace(/,/g, '')) || 0;
    } else if (typeof finalValue !== 'number') {
      finalValue = rowData[fieldName] || 0;
    }

    // 如果值有差異，同步並觸發最終計算
    if (Math.abs((rowData[fieldName] || 0) - finalValue) > 0.001) {
      console.log(`📄 Blur 最終修正: ${rowData[fieldName]} → ${finalValue}`);
      rowData[fieldName] = finalValue;

      this.fieldChange.emit({
        fieldName,
        newValue: finalValue,
        rowData
      });
    }
  }
  //=====================預設值=====================
  getFieldDefaultValue(column: ColumnDef, rowData: any): any {
    // 如果有值就使用現有值
    let currentValue = rowData[column.field];
    if (currentValue !== undefined && currentValue !== null && currentValue !== '') {
      // 🔑 如果是數字類型且設定了 displayMultiplier，將實際值轉換為顯示值
      // 例如: 後端的 0.2 → 前端顯示 20 (0.2 × 100)
      if (column.type === 'number' && column.displayMultiplier && column.displayMultiplier > 0) {
        currentValue = currentValue * column.displayMultiplier;
      }
      return currentValue;
    }

    // 新增：檢查是否有動態預設值函數
    if (column.defaultValueFunction && typeof column.defaultValueFunction === 'function') {
      return column.defaultValueFunction();
    }

    // 使用靜態預設值
    return column.defaultValue || '';
  }

  /**
   * 🔑 取得數字欄位的顯示值（用於唯讀模式顯示）
   * 如果設定了 displayMultiplier，會將實際值轉換為顯示值
   * 例如: 後端的 0.2 → 前端顯示 20 (0.2 × 100)
   */
  getNumberDisplayValue(column: ColumnDef, rowData: any): number {
    const actualValue = rowData[column.field];

    // 如果沒有值，返回 0
    if (actualValue === undefined || actualValue === null || actualValue === '') {
      return 0;
    }

    // 如果設定了 displayMultiplier，將實際值轉換為顯示值
    if (column.displayMultiplier && column.displayMultiplier > 0) {
      return actualValue * column.displayMultiplier;
    }

    return actualValue;
  }

  // 設定新增項目的預設值
  private applyDefaultValues(newItem: any, columns: ColumnDef[]): void {
    columns.forEach(column => {
      if (column.defaultValue !== undefined && (newItem[column.field] === undefined || newItem[column.field] === null || newItem[column.field] === '')) {
        newItem[column.field] = column.defaultValue;
      }
    });
  }

  // private debouncedCalculation(
  //   fieldKey: string,
  //   callback: () => void,
  //   delay: number = this.DEBOUNCE_DELAY
  // ): void {
  //   // 清除現有計時器
  //   if (this.debounceTimers.has(fieldKey)) {
  //     clearTimeout(this.debounceTimers.get(fieldKey));
  //     console.log(`🔄 清除舊的防抖計時器: ${fieldKey}`);
  //   }

  //   // 設置新的計時器
  //   const timer = setTimeout(() => {
  //     console.log(`⏰ 防抖延遲結束，執行計算: ${fieldKey}`);
  //     callback();
  //     this.debounceTimers.delete(fieldKey);
  //   }, delay);

  //   this.debounceTimers.set(fieldKey, timer);
  //   console.log(`⏱️ 設置防抖計時器: ${fieldKey} (${delay}ms)`);
  // }

  // 🔄 重構數字欄位處理 - 使用 input 事件 + 防抖
  onNumberInputChange(event: any, fieldName: string, rowData: any, isDetail: boolean = false): void {
    // 統一取值邏輯
    let inputValue = event.value !== undefined ? event.value : event.target?.value;

    if (typeof inputValue === 'string') {
      inputValue = parseFloat(inputValue.replace(/,/g, '')) || 0;
    } else if (typeof inputValue !== 'number') {
      inputValue = 0;
    }

    const oldValue = rowData[fieldName];
    rowData[fieldName] = inputValue;

    // 🔥 立即觸發計算（無防抖延遲）
    this.fieldChange.emit({
      fieldName,
      newValue: inputValue,
      rowData
    });

    // 🔥 立即強制更新UI
    this.cdr.detectChanges();

    // 處理直接編輯
    this.handleDirectEditForNumber(fieldName, inputValue, rowData, isDetail);
  }

  /**
 * 輔助方法：根據欄位名稱查找欄位定義
 */
  private findColumnByField(fieldName: string): ColumnDef | undefined {
    // 先從主要欄位找
    let column = this.mainColumns.find(col => col.field === fieldName);

    if (!column) {
      // 再從詳細欄位找
      column = this.detailColumns.find(col => col.field === fieldName);
    }

    // 如果還沒找到且有分頁欄位
    if (!column && this.showDetailTabs && this.detailColumnsMap) {
      for (const tabColumns of Object.values(this.detailColumnsMap)) {
        column = tabColumns.find(col => col.field === fieldName);
        if (column) break;
      }
    }

    return column;
  }

  //  輔助方法：查找父資料
  private findParentData(detailData: any): any {
    for (const mainItem of this.data) {
      if (mainItem[this.detailKey] && Array.isArray(mainItem[this.detailKey])) {
        if (mainItem[this.detailKey].includes(detailData)) {
          return mainItem;
        }
      }
    }
    console.warn(`⚠️ 無法找到詳細資料的父項目:`, detailData);
    return null;
  }

  onNumberModelChange(
    newValue: any,
    fieldName: string,
    rowData: any,
    isDetail: boolean = false
  ): void {
    console.log('數字輸入變更:', {
      fieldName,
      newValue,
      valueType: typeof newValue,
      isDetail,
      rowId: rowData[this.dataKey] || 'unknown'
    });

    // 數值處理（保持原有邏輯）
    let numericValue: number;
    if (newValue === null || newValue === undefined || newValue === '') {
      numericValue = 0;
    } else if (typeof newValue === 'number') {
      numericValue = newValue;
    } else if (typeof newValue === 'string') {
      const cleanValue = newValue.replace(/,/g, '');
      numericValue = parseFloat(cleanValue) || 0;
    } else {
      numericValue = 0;
    }

    // 🔑 獲取欄位配置（用於倍率轉換和範圍限制）
    const column = this.findColumnByField(fieldName);

    // 🔑 如果設定了 displayMultiplier，將顯示值轉換回實際值
    // 例如: 使用者輸入 20 → 後端儲存 0.2 (20 ÷ 100)
    if (column?.displayMultiplier && column.displayMultiplier > 0) {
      numericValue = numericValue / column.displayMultiplier;
      console.log(`應用倍率轉換: 顯示值 ${newValue} → 實際值 ${numericValue} (倍率: ${column.displayMultiplier})`);
    }

    // 自動限制到最大值和最小值（保持原有邏輯）
    // 注意: maxValue 和 minValue 應該是「實際值」的範圍，不是「顯示值」的範圍
    if (column) {
      if (column.maxValue !== undefined && numericValue > column.maxValue) {
        numericValue = column.maxValue;
      }
      if (column.minValue !== undefined && numericValue < column.minValue) {
        numericValue = column.minValue;
      }
    }

    // 🔥 關鍵修復：更新數據並觸發 fieldChange 事件
    const oldValue = rowData[fieldName];
    rowData[fieldName] = numericValue;

    // 即時上限驗證：超過 validateMax 就把該格標紅（不鉗制數值）
    if (column?.validateMax !== undefined) {
      this.setCellValidation(
        rowData,
        fieldName,
        numericValue > column.validateMax,
        column.validateMessage || `數值不可大於 ${column.validateMax}`
      );
    }

    // 🔥 根據是否為 detail 項目觸發不同的事件
    if (isDetail) {
      // 找到父項目和索引
      let foundParent = false;
      for (let rowIndex = 0; rowIndex < this.data.length; rowIndex++) {
        const mainItem = this.data[rowIndex];
        if (mainItem[this.detailKey] && Array.isArray(mainItem[this.detailKey])) {
          const detailIndex = mainItem[this.detailKey].indexOf(rowData);
          if (detailIndex > -1) {
            console.log('🔥 Detail 數字變更，觸發 detailFieldChange:', {
              fieldName,
              newValue: numericValue,
              detailId: rowData[this.dataKey],
              parentId: mainItem[this.dataKey],
              rowIndex,
              detailIndex
            });
            this.triggerDetailFieldChangeEvent(
              fieldName,
              numericValue,
              rowData,
              rowIndex,
              detailIndex,
              oldValue
            );
            foundParent = true;
            break;
          }
        }
      }
      if (!foundParent) {
        console.warn('⚠️ 無法找到 detail 項目的父項目，改用一般 fieldChange');
        this.fieldChange.emit({
          fieldName,
          newValue: numericValue,
          rowData
        });
      }
    } else {
      // 一般欄位：觸發 fieldChange 事件
      this.fieldChange.emit({
        fieldName,
        newValue: numericValue,
        rowData
      });
    }

    // 🔥 強制變更檢測
    this.cdr.detectChanges();

    // 處理直接編輯
    this.handleDirectEditForNumber(fieldName, numericValue, rowData, isDetail);
  }

  onNumberInput(
    event: any,
    fieldName: string,
    rowData: any,
    isDetail: boolean = false
  ): void {
    console.log('數字輸入事件:', {
      fieldName,
      eventValue: event.value,
      eventTarget: event.target?.value,
      isDetail,
      rowId: rowData[this.dataKey] || 'unknown'
    });

    // 從 PrimeNG InputNumber 的 onInput 事件取值
    let inputValue = event.value;

    if (inputValue === undefined || inputValue === null) {
      inputValue = event.target?.value || event.originalEvent?.target?.value;
    }

    console.log(`Input 事件取得的值: "${inputValue}" (類型: ${typeof inputValue})`);

    // 數值處理
    let numericValue: number;

    if (inputValue === null || inputValue === undefined || inputValue === '') {
      numericValue = 0;
    } else if (typeof inputValue === 'number') {
      numericValue = inputValue;
    } else if (typeof inputValue === 'string') {
      const cleanValue = inputValue.replace(/,/g, '');
      numericValue = parseFloat(cleanValue) || 0;
    } else {
      console.warn(`Input 事件未預期的數值類型: ${typeof inputValue}`, inputValue);
      numericValue = 0;
    }

    // 取得欄位設定並進行鉗制
    const column = this.findColumnByField(fieldName);

    if (column) {
      // 自動鉗制到最大值和最小值
      if (column.maxValue !== undefined && numericValue > column.maxValue) {
        console.log(`Input: 數值超過最大值，自動設為最大值: ${numericValue} → ${column.maxValue}`);
        numericValue = column.maxValue;
      }

      if (column.minValue !== undefined && numericValue < column.minValue) {
        console.log(`Input: 數值低於最小值，自動設為最小值: ${numericValue} → ${column.minValue}`);
        numericValue = column.minValue;
      }
    }

    console.log(`Input 事件最終數值: ${inputValue} → ${numericValue}`);

    // 立即更新 rowData
    const oldValue = rowData[fieldName];
    rowData[fieldName] = numericValue;

    console.log(`Input 事件更新 ${fieldName}: ${oldValue} → ${numericValue}`);

    // 🔥 根據是否為 detail 項目觸發不同的事件
    if (isDetail) {
      // 找到父項目和索引
      let foundParent = false;
      for (let rowIndex = 0; rowIndex < this.data.length; rowIndex++) {
        const mainItem = this.data[rowIndex];
        if (mainItem[this.detailKey] && Array.isArray(mainItem[this.detailKey])) {
          const detailIndex = mainItem[this.detailKey].indexOf(rowData);
          if (detailIndex > -1) {
            console.log('🔥 Detail Input 事件，觸發 detailFieldChange:', {
              fieldName,
              newValue: numericValue,
              detailId: rowData[this.dataKey],
              rowIndex,
              detailIndex
            });
            this.triggerDetailFieldChangeEvent(
              fieldName,
              numericValue,
              rowData,
              rowIndex,
              detailIndex,
              oldValue
            );
            foundParent = true;
            break;
          }
        }
      }
      if (!foundParent) {
        this.fieldChange.emit({
          fieldName,
          newValue: numericValue,
          rowData
        });
      }
    } else {
      // 立即觸發欄位變更事件
      this.fieldChange.emit({
        fieldName,
        newValue: numericValue,
        rowData
      });
    }

    // 處理直接編輯模式
    this.handleDirectEditForNumber(fieldName, numericValue, rowData, isDetail);
  }

  private handleDirectEditForNumber(
    fieldName: string,
    newValue: number,
    rowData: any,
    isDetail: boolean
  ): void {
    const column = this.findColumnByField(fieldName);

    if (column?.directEdit) {
      console.log(` 直接編輯模式: ${fieldName} = ${newValue}`);

      if (isDetail) {
        const parentData = this.findParentData(rowData);
        if (parentData) {
          this.onDetailDirectEditChange(rowData, parentData, fieldName, newValue);
        } else {
          console.warn(`⚠️ 找不到詳細資料的父資料`);
        }
      } else {
        this.onDirectEditChange(rowData, fieldName, newValue);
      }
    }
  }

  onCheckboxChange(rowData: any, field: string, newValue: any, rowIndex: number, column: ColumnDef): void {
    console.log(`Checkbox 變更: ${field} = ${newValue} (第${rowIndex + 1}行)`);

    // 勾選時：立即更新 + 進入編輯模式
    if (newValue === true) {
      rowData[field] = newValue;

      this.fieldChange.emit({
        fieldName: field,
        newValue: newValue,
        rowData: rowData
      });

      // 檢查是否啟用自動編輯
      if (column.autoEditOnSelect && !this.isRowEditing(rowIndex)) {
        console.log(`勾選，自動進入編輯模式`);
        setTimeout(() => {
          this.onRowEditInit(rowData, rowIndex);
          this.cdr.detectChanges();
        }, 150);
      }
    }

    // 取消勾選時：特殊處理
    else if (newValue === false) {
      // 新增：檢查是否啟用自動保存退出
      if (column.autoSaveOnUnselect && this.isRowEditing(rowIndex)) {
        console.log(`取消勾選，自動保存並退出編輯模式`);
        this.handleUnselectWithCancel(rowData, rowIndex, field, newValue);
      } else {
        // 如果沒有啟用自動保存退出，只更新值
        rowData[field] = newValue;

        this.fieldChange.emit({
          fieldName: field,
          newValue: newValue,
          rowData: rowData
        });
      }
    }

    // 觸發直接編輯保存事件
    if (column.directEdit) {
      this.onDirectEditChange(rowData, field, newValue, rowIndex, column);
    }

    if (column.customCheckboxHandler) {
      column.customCheckboxHandler({
        rowData,
        field,
        newValue,
        oldValue: !newValue, // 簡單的反向邏輯
        parentData: undefined // 主表格沒有父資料
      });
    }
  }

  // 專門處理取消勾選的方法
  private async handleUnselectWithCancel(rowData: any, rowIndex: number, field: string, newValue: any): Promise<void> {
    try {
      // 步驟1：執行取消編輯
      this.onRowEditCancel(rowData, rowIndex);

      // 步驟2：等待取消完成
      await this.waitForEditCancel();

      // 步驟3：確保 checkbox 狀態正確
      rowData[field] = newValue;
      this.cdr.detectChanges();

      console.log(` 取消勾選完成，${field} = ${newValue}`);
    } catch (error) {
      console.error('處理取消勾選時發生錯誤:', error);
      // 容錯：強制設定狀態
      rowData[field] = newValue;
      this.cdr.detectChanges();
    }
  }

  // 等待編輯取消完成的輔助方法
  private waitForEditCancel(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }

  onButtonClick(rowData: any, field: string): void {
    this.buttonClick.emit({ rowData, field });
  }

  onDetailButtonClick(detailData: any, field: string, parentData: any): void {
    this.detailButtonClick.emit({
      detailData,
      field,
      parentData
    });
  }

  // 新增方法來檢查當前 tab 是否允許操作
  canAddDetailForCurrentTab(rowData: any): boolean {
    const currentTab = this.getDetailSelectedTab(rowData);
    const tabConfig = this.detailTabOptions.find(tab => tab.id === currentTab);
    return tabConfig?.allowAdd || false;
  }

  canDeleteDetailForCurrentTab(rowData: any): boolean {
    const currentTab = this.getDetailSelectedTab(rowData);
    const tabConfig = this.detailTabOptions.find(tab => tab.id === currentTab);
    return tabConfig?.allowBatchDelete || false;
  }

  canShowCheckboxForCurrentTab(rowData: any): boolean {
    const currentTab = this.getDetailSelectedTab(rowData);
    const tabConfig = this.detailTabOptions.find(tab => tab.id === currentTab);
    return tabConfig?.showCheckbox || false;
  }

  onDetailCheckboxChange(detailData: any, field: string, newValue: any, rowIndex: number, detailIndex: number, column: ColumnDef): void {
    console.log(`內層 Checkbox 變更: ${field} = ${newValue} (主行${rowIndex + 1}, 詳細行${detailIndex + 1})`);

    const oldValue = detailData[field];

    // 勾選時：立即更新 + 進入編輯模式
    if (newValue === true) {
      detailData[field] = newValue;

      //  新增：觸發詳細資料欄位變更事件
      this.triggerDetailFieldChangeEvent(field, newValue, detailData, rowIndex, detailIndex, oldValue);

      if (column.autoEditOnSelect && !this.isDetailEditing(rowIndex, detailIndex)) {
        console.log(`勾選，自動進入詳細編輯模式`);
        setTimeout(() => {
          const parentData = this.data[rowIndex];
          this.onDetailEditInit(detailData, parentData, rowIndex, detailIndex);
          this.cdr.detectChanges();
        }, 150);
      }
    }
    // 取消勾選時：特殊處理
    else if (newValue === false) {
      if (column.autoSaveOnUnselect && this.isDetailEditing(rowIndex, detailIndex)) {
        console.log(`取消勾選，自動儲存並退出詳細編輯模式`);
        const parentData = this.data[rowIndex];
        this.onDetailEditSave(detailData, parentData);
      } else {
        detailData[field] = newValue;

        //  新增：觸發詳細資料欄位變更事件
        this.triggerDetailFieldChangeEvent(field, newValue, detailData, rowIndex, detailIndex, oldValue);
      }
    }

    // 觸發直接編輯儲存事件
    if (column.directEdit) {
      const parentData = this.data[rowIndex];
      this.onDetailDirectEditChange(detailData, parentData, field, newValue, rowIndex, detailIndex);
    }

    if (column.customCheckboxHandler) {
      const parentData = this.data[rowIndex];
      column.customCheckboxHandler({
        rowData: detailData,
        field,
        newValue,
        oldValue: oldValue,
        parentData
      });
    }
  }

  onDetailDateInputChange(detailData: any, column: ColumnDef, inputValue: string, rowIndex: number, detailIndex: number): void {
    const fieldKey = this.getFieldKey(detailData, column.field, true, detailIndex);

    // 暫存用戶輸入
    this.userInputValues.set(fieldKey, inputValue);

    console.log(`詳細資料日期輸入暫存: ${column.field} = "${inputValue}"`);

    // 如果是空值，立即清空
    if (!inputValue || inputValue.trim() === '') {
      const oldValue = detailData[column.field];
      detailData[column.field] = null;
      this.userInputValues.delete(fieldKey);

      //  新增：觸發詳細資料欄位變更事件
      this.triggerDetailFieldChangeEvent(column.field, null, detailData, rowIndex, detailIndex, oldValue);
    }
  }

  onDetailDateInputBlur(detailData: any, column: ColumnDef, rowIndex: number, detailIndex: number): void {
    const fieldKey = this.getFieldKey(detailData, column.field, true, detailIndex);
    const userInput = this.userInputValues.get(fieldKey);
    const formatType = column.dateFormat || 'full-date';

    console.log(`詳細資料日期 Blur 處理: ${column.field}`, {
      userInput,
      currentValue: detailData[column.field],
      formatType
    });

    // 如果沒有用戶輸入，表示沒有修改，直接跳過
    if (userInput === undefined) {
      return;
    }

    // 空值處理
    if (!userInput || userInput.trim() === '') {
      const oldValue = detailData[column.field];
      detailData[column.field] = null;
      this.userInputValues.delete(fieldKey);

      //  新增：觸發詳細資料欄位變更事件
      this.triggerDetailFieldChangeEvent(column.field, null, detailData, rowIndex, detailIndex, oldValue);
      return;
    }

    // 統一日期解析邏輯
    const parsedDate = this.parseUserDateInput(userInput.trim(), formatType);

    if (parsedDate && this.isValidDateRange(parsedDate)) {
      const oldValue = detailData[column.field];
      detailData[column.field] = parsedDate;
      this.userInputValues.delete(fieldKey);

      console.log(`詳細資料日期解析成功: "${userInput}" -> ${this.formatDateForDisplay(parsedDate, formatType)}`);

      //  新增：觸發詳細資料欄位變更事件
      this.triggerDetailFieldChangeEvent(column.field, parsedDate, detailData, rowIndex, detailIndex, oldValue);

      this.triggerSaveIfNeeded(detailData, column, parsedDate, true, detailIndex);
    } else {
      this.userInputValues.delete(fieldKey);
      this.showDateFormatHint(userInput, formatType);
      console.warn(`詳細資料日期格式錯誤，保持原值: "${userInput}"`);
    }

    this.cdr.detectChanges();
  }

  /**
  *  新增：觸發詳細資料欄位變更事件的統一方法
  */
  private triggerDetailFieldChangeEvent(
    fieldName: string,
    newValue: any,
    detailData: any,
    rowIndex: number,
    detailIndex: number,
    oldValue?: any
  ): void {
    console.log(`🔥 觸發詳細資料欄位變更事件: ${fieldName}`, {
      新值: newValue,
      舊值: oldValue,
      detailId: detailData.id,
      主行: rowIndex + 1,
      詳細行: detailIndex + 1,
      timestamp: new Date().toISOString()
    });

    //  發出詳細資料專用的 fieldChange 事件
    this.detailFieldChange.emit({
      fieldName,
      newValue,
      detailData,
      parentData: this.data[rowIndex],
      rowIndex,
      detailIndex
    });

    //  也發出通用的 fieldChange 事件（向後兼容）
    this.fieldChange.emit({
      fieldName,
      newValue,
      rowData: detailData
    });
  }

  handleDateInput(event: Event, rowData: any, column: ColumnDef): void {
    const target = event.target as HTMLInputElement;
    const inputValue = target?.value || '';
    this.onDateInputChange(rowData, column, inputValue);
  }
  //初始化顯示Table預設
  private initializeDefaultValues(): void {
    this.data.forEach(rowData => {
      this.mainColumns.forEach(column => {
        // 如果欄位沒有值但有預設值函數，應用預設值
        if (!rowData[column.field] && column.defaultValueFunction) {
          try {
            const defaultValue = column.defaultValueFunction();
            if (defaultValue !== null && defaultValue !== undefined) {
              rowData[column.field] = defaultValue;
            }
          } catch (error) {
            console.error(`預設值函數執行失敗 ${column.field}:`, error);
          }
        }
      });
    });
  }

  // 檢查是否為最後一個可編輯欄位
  private isLastEditableField(currentColumn: ColumnDef, rowData: any): boolean {
    const editableColumns = this.mainColumns.filter(col =>
      !col.hidden &&
      col.editable !== false &&
      this.shouldShowInputControl(col, true, rowData)
    );

    const currentIndex = editableColumns.findIndex(col => col.field === currentColumn.field);
    return currentIndex === editableColumns.length - 1;
  }

  // 檢查是否為最後一行
  private isLastRow(rowIndex: number): boolean {
    return rowIndex === this.data.length - 1;
  }

  // 修改原有的 Tab 鍵處理，加入詳細資料的判斷
  onFieldKeyDown(event: KeyboardEvent, rowData: any, column: ColumnDef, rowIndex: number, isDetail: boolean = false, detailIndex?: number): void {
    // 主表格的處理
    if (!isDetail) {
      // 修正：只檢查 autoAddRowOnTab，移除 forceEditMode 的限制
      if (!this.autoAddRowOnTab) {
        return;
      }

      if (event.key === 'Tab' && !event.shiftKey) {
        const isLastField = this.isLastEditableField(column, rowData);
        const isLastRow = this.isLastRow(rowIndex);

        if (isLastField && isLastRow) {
          event.preventDefault();
          setTimeout(() => {
            this.onAddMainItem();
          }, 100);
        }
      }
    }
    // 詳細資料表格的處理
    else {
      // 修正：只檢查 autoAddDetailRowOnTab，移除 forceEditMode 的限制
      if (!this.autoAddDetailRowOnTab) {
        return;
      }

      if (event.key === 'Tab' && !event.shiftKey && detailIndex !== undefined) {
        const isLastDetailField = this.isLastEditableDetailField(column, rowData, rowData);
        const isLastDetailRow = this.isLastDetailRow(rowData, detailIndex);

        if (isLastDetailField && isLastDetailRow) {
          event.preventDefault();
          setTimeout(() => {
            this.onAddDetailItem(rowData, rowIndex);
          }, 100);
        }
      }
    }
  }

  private isLastEditableDetailField(currentColumn: ColumnDef, detailData: any, rowData: any): boolean {
    const detailColumns = this.getDetailColumnsForTab(rowData);
    const editableDetailColumns = detailColumns.filter(col =>
      !col.hidden &&
      col.editable !== false &&
      this.shouldShowInputControl(col, true, detailData)
    );

    const currentIndex = editableDetailColumns.findIndex(col => col.field === currentColumn.field);
    return currentIndex === editableDetailColumns.length - 1;
  }

  // 檢查是否為詳細資料的最後一行
  private isLastDetailRow(rowData: any, detailIndex: number): boolean {
    const detailArray = rowData[this.detailKey] || [];
    return detailIndex === detailArray.length - 1;
  }

  //=======錯誤訊息背景顏色==========
  /**
 * 檢查行是否有錯誤
 */
  hasRowErrors(rowData: any): boolean {
    // 檢查主要資料是否有錯誤標記
    if (rowData._hasError || rowData._hasValidationError || rowData._hasDuplicateDateError) {
      return true;
    }

    // 檢查詳細項目是否有錯誤
    if (rowData[this.detailKey]) {
      return rowData[this.detailKey].some((detail: any) =>
        detail._hasError || detail._hasValidationError || detail._hasDateOverlapError || detail._hasDuplicateDateError
      );
    }

    return false;
  }

  /**
   * 檢查詳細項目是否有錯誤
   */
  hasDetailErrors(detailData: any): boolean {
    return !!(detailData._hasError || detailData._hasValidationError || detailData._hasDateOverlapError || detailData._hasDuplicateDateError);
  }

  /**
   * 獲取行的錯誤樣式類
   */
  getRowErrorClass(rowData: any): string {
    if (this.hasRowErrors(rowData)) {
      return 'error-row';
    }
    return '';
  }

  /**
   * 獲取詳細項目的錯誤樣式類
   */
  getDetailErrorClass(detailData: any): string {
    if (this.hasDetailErrors(detailData)) {
      return 'error-row';
    }
    return '';
  }

  /**
   * 檢查特定欄位是否有錯誤（用於單格錯誤標記）
   */
  hasCellError(rowData: any, field: string): boolean {
    return !!(rowData?._errorFields && Array.isArray(rowData._errorFields) && rowData._errorFields.includes(field));
  }

  /**
   * 取得單格的錯誤提示文字（供欄位驚嘆號 tooltip 使用）
   */
  getCellErrorMessage(rowData: any, field: string): string {
    return rowData?._errorMessages?.[field] || '';
  }

  /**
   * 設定/清除單格驗證狀態（標紅 + 記錄提示文字）
   */
  private setCellValidation(rowData: any, field: string, hasError: boolean, message: string): void {
    if (!Array.isArray(rowData._errorFields)) rowData._errorFields = [];
    if (!rowData._errorMessages) rowData._errorMessages = {};

    const idx = rowData._errorFields.indexOf(field);
    if (hasError) {
      if (idx === -1) rowData._errorFields.push(field);
      rowData._errorMessages[field] = message;
      rowData._hasValidationError = true;
    } else {
      if (idx !== -1) rowData._errorFields.splice(idx, 1);
      delete rowData._errorMessages[field];
      if (rowData._errorFields.length === 0) delete rowData._hasValidationError;
    }
    this.cdr.detectChanges();
  }

  /**
   * 清除錯誤狀態
   */
  clearRowErrors(rowData: any): void {
    delete rowData._hasError;
    delete rowData._hasValidationError;
    delete rowData._hasDateOverlapError;

    if (rowData[this.detailKey]) {
      rowData[this.detailKey].forEach((detail: any) => {
        delete detail._hasError;
        delete detail._hasValidationError;
        delete detail._hasDateOverlapError;
      });
    }
  }
}
