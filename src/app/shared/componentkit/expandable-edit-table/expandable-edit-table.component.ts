import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, TemplateRef, ContentChild, ElementRef, OnInit, OnChanges } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
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

  // 🎯 使用語義化的日期格式類型
  dateFormat?: DateFormatType;
  placeholder?: string;

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
  imports: [NgIf, TableModule, NgClass, PrimeTemplate, ButtonDirective, Ripple, TooltipModule, NgFor, NgStyle, NgSwitch, NgSwitchCase, FormsModule, InputTextModule, InputNumberModule, DropdownModule, CheckboxModule, NgSwitchDefault, DialogModule, CalendarModule, DecimalPipe]
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
    oldValue: any
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

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.totalRecords = this.data.length;
    this.initializeDetailArrays();
    // 🎯 不再自動初始化日期欄位，保持原始資料格式
  }

  ngOnChanges() {
    if (this.data) {
      this.totalRecords = this.data.length;
      this.initializeDetailArrays();

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
      // 處理緊湊格式 YYYYMM (6位數字)
      if (/^\d{6}$/.test(trimmed)) {
        const year = parseInt(trimmed.substring(0, 4), 10);
        const month = parseInt(trimmed.substring(4, 6), 10) - 1;
        if (this.isValidDate(year, month, 1)) {
          return new Date(year, month, 1);
        }
      }
      // 處理緊湊格式 YYYYMMDD (8位數字)
      else if (/^\d{8}$/.test(trimmed)) {
        const year = parseInt(trimmed.substring(0, 4), 10);
        const month = parseInt(trimmed.substring(4, 6), 10) - 1;
        const day = parseInt(trimmed.substring(6, 8), 10);
        if (this.isValidDate(year, month, day)) {
          if (formatType.includes('year-month')) {
            return new Date(year, month, 1);
          } else {
            return new Date(year, month, day);
          }
        }
      }
      // 處理標準格式 YYYY/MM 或 YYYY-MM
      else if (/^\d{4}[\/-]\d{1,2}$/.test(trimmed)) {
        const parts = trimmed.split(/[\/-]/);
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        if (this.isValidDate(year, month, 1)) {
          return new Date(year, month, 1);
        }
      }
      // 處理完整日期格式 YYYY/MM/DD 或 YYYY-MM-DD
      else if (/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(trimmed)) {
        const parts = trimmed.split(/[\/-]/);
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (this.isValidDate(year, month, day)) {
          if (formatType.includes('year-month')) {
            return new Date(year, month, 1);
          } else {
            return new Date(year, month, day);
          }
        }
      }
      // 嘗試通用解析
      else {
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }

      console.warn('無法解析的日期格式:', inputValue);
      return null;
    } catch (error) {
      console.error('日期解析錯誤:', error);
      return null;
    }
  }

  // 🎯 對外接口：取得格式化的日期顯示值
  getDateDisplayValue(rowData: any, column: ColumnDef): string {
    const field = column.field;
    const rawValue = rowData[field];
    const formatType = column.dateFormat || 'full-date';

    return this.formatDateForDisplay(rawValue, formatType);
  }

  // 🎯 對外接口：取得日期輸入值（編輯時使用）
  getDateInputValue(rowData: any, column: ColumnDef): string {
    // 編輯時顯示和非編輯時相同
    return this.getDateDisplayValue(rowData, column);
  }

  // 🎯 對外接口：處理日期輸入變更
  onDateInputChange(rowData: any, column: ColumnDef, inputValue: string): void {
    const field = column.field;
    const formatType = column.dateFormat || 'full-date';

    if (!inputValue || inputValue.trim() === '') {
      rowData[field] = null;
      return;
    }

    const parsed = this.parseUserInput(inputValue, formatType);
    if (parsed) {
      rowData[field] = parsed;
      console.log(`✅ 日期輸入更新: ${field} = ${parsed}`);
    } else {
      console.warn(`無效的日期輸入: ${inputValue}`);
      // 可以選擇保留無效輸入或清空
      // rowData[field] = null;
    }
  }

  // 🎯 對外接口：取得欄位的 placeholder
  getDatePlaceholder(column: ColumnDef): string {
    if (column.placeholder) {
      return column.placeholder;
    }

    const formatType = column.dateFormat || 'full-date';
    const config = DATE_FORMAT_CONFIG[formatType];
    return config.placeholder;
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
    if (this.editingRow !== null || this.editingDetail !== null) {
      console.warn('請先完成當前編輯操作');
      return;
    }
    this.addMainItem.emit();
  }

  onBatchDelete() {
    // console.log('🔍 DEBUG 批次刪除檢查:');
    // console.log('  selectedItems.length:', this.selectedItems.length);
    // console.log('  editingRow:', this.editingRow);
    // console.log('  editingDetail:', this.editingDetail);
    // console.log('  selectedItems:', this.selectedItems);

    if (this.selectedItems.length === 0) {
      console.warn('請選擇要刪除的項目');
      return;
    }
    if (this.editingRow !== null || this.editingDetail !== null) {
      console.warn('請先完成當前編輯操作');
      return;
    }
    this.batchDelete.emit([...this.selectedItems]);
  }

  onDetailBatchDelete(parentData: any, rowIndex: number) {
    const parentKey = parentData[this.dataKey];
    const selectedDetails = this.detailSelectedItems[parentKey] || [];

    if (selectedDetails.length === 0) {
      console.warn('請選擇要刪除的明細項目');
      return;
    }
    if (this.editingRow !== null || this.editingDetail !== null) {
      console.warn('請先完成當前編輯操作');
      return;
    }

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
      const oldData = this.clonedItems[rowData[this.dataKey]];
      delete this.clonedItems[rowData[this.dataKey]];
      this.editingRow = null;
      this.save.emit({ oldData, newData: rowData });
      this.cdr.detectChanges();
    } catch (error) {
      console.error('保存行時出錯：', error);
    }
  }

  onRowEditCancel(rowData: any, rowIndex: number) {
    try {
      this.data[rowIndex] = this.clonedItems[rowData[this.dataKey]];
      delete this.clonedItems[rowData[this.dataKey]];
      this.editingRow = null;
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
    return this.mainColumns.filter(col => !col.hidden).length +
      (this.showCheckBox ? 1 : 0) +
      (this.detailKey ? 1 : 0) +
      1;
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
      // 直接設定 Date 物件到主欄位
      this.currentDateField.data[this.currentDateField.field] = this.temporaryDate;

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
    if (this.editingRow !== null || this.editingDetail !== null) {
      console.warn('請先完成當前編輯操作');
      return;
    }
    this.addDetailItem.emit(parentData);
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
}
