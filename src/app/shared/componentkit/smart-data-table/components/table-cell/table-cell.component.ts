// 直接修復 - table-cell.component.ts
// 🎯 完全移植原版邏輯，確保編輯功能正常運作

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgClass, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG 模組
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';

// 本地服務和型別
import { ColumnDef, DateFormatType } from '../../types/column.types';

// 🎯 直接從原版複製的日期格式配置
const DATE_FORMAT_CONFIG = {
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

@Component({
  selector: 'app-table-cell',
  templateUrl: './table-cell.component.html',
  styleUrls: ['./table-cell.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgClass,
    FormsModule, DecimalPipe,
    InputTextModule, InputNumberModule, DropdownModule,
    CheckboxModule, ButtonModule, DialogModule, CalendarModule
  ]
})
export class TableCellComponent implements OnInit, OnChanges {

  @Input() value: any;
  @Input() column!: ColumnDef;
  @Input() rowData: any;
  @Input() isEditing: boolean = false;
  @Input() readonly: boolean = false;

  @Output() valueChange = new EventEmitter<any>();

  // 🎯 直接從原版複製的狀態管理
  datePickerVisible: boolean = false;
  temporaryDate: Date | null = null;
  internalValue: any;

  constructor() { }

  ngOnInit() {
    this.internalValue = this.value;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      this.internalValue = this.value;
    }
  }

  // ==================== 🎯 直接從原版複製的日期處理邏輯 ====================

  private formatDateForDisplay(rawValue: any, formatType: DateFormatType): string {
    if (!rawValue) return '';

    try {
      let dateObj: Date;

      if (rawValue instanceof Date) {
        dateObj = rawValue;
      } else if (typeof rawValue === 'string') {
        // 處理 ISO 日期格式："2014-11-30T16:00:00.000Z"
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
        else {
          dateObj = new Date(rawValue);
        }
      } else if (typeof rawValue === 'number') {
        dateObj = new Date(rawValue);
      } else {
        return '';
      }

      if (isNaN(dateObj.getTime())) {
        console.warn('無效的日期值:', rawValue);
        return '';
      }

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

  private isValidDate(year: number, month: number, day: number): boolean {
    if (year < 1900 || year > 2100) return false;
    if (month < 0 || month > 11) return false;
    if (day < 1 || day > 31) return false;

    const date = new Date(year, month, day);
    return date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day;
  }

  // ==================== 🎯 直接從原版複製的方法 ====================

  getDateDisplayValue(): string {
    if (!this.column.type || this.column.type !== 'date') {
      return '';
    }

    const formatType = (this.column as any).dateFormat || 'full-date';
    return this.formatDateForDisplay(this.value, formatType);
  }

  getDateInputValue(): string {
    return this.getDateDisplayValue();
  }

  onDateInputChange(inputValue: string): void {
    if (!this.column.type || this.column.type !== 'date') {
      return;
    }

    const formatType = (this.column as any).dateFormat || 'full-date';

    if (!inputValue || inputValue.trim() === '') {
      this.onValueChange(null);
      return;
    }

    const parsed = this.parseUserInput(inputValue, formatType);
    if (parsed) {
      this.onValueChange(parsed);
    }
  }

  getDatePlaceholder(): string {
    if (!this.column.type || this.column.type !== 'date') {
      return '';
    }

    if ((this.column as any).placeholder) {
      return (this.column as any).placeholder;
    }

    const formatType = (this.column as any).dateFormat || 'full-date';
    const config = (DATE_FORMAT_CONFIG as any)[formatType];
    return config.placeholder;
  }

  openDatePicker(): void {
    let initialDate = new Date();
    if (this.value) {
      const existingDate = new Date(this.value);
      if (!isNaN(existingDate.getTime())) {
        initialDate = existingDate;
      }
    }

    this.temporaryDate = initialDate;
    this.datePickerVisible = true;
  }

  confirmDateSelection(): void {
    if (this.temporaryDate) {
      this.onValueChange(this.temporaryDate);
    }
    this.cancelDateSelection();
  }

  cancelDateSelection(): void {
    this.datePickerVisible = false;
    this.temporaryDate = null;
  }

  // ==================== 🎯 直接從原版複製的下拉選單邏輯 ====================

  getFieldOptions(): any[] {
    if (!this.column.options) {
      return [];
    }

    if (typeof this.column.options === 'function') {
      return this.column.options(this.rowData);
    }

    return this.column.options;
  }

  getDropdownDisplayText(): string {
    const value = this.value;

    if (!value && value !== 0) {
      return '';
    }

    const options = this.getFieldOptions();

    if (!options || options.length === 0) {
      return String(value);
    }

    const foundOption = options.find((option: any) => {
      if (typeof option === 'object' && option !== null) {
        return option.value === value || option.value === String(value);
      }
      return option === value;
    });

    if (foundOption) {
      return typeof foundOption === 'object' ? foundOption.label : String(foundOption);
    }

    return String(value);
  }

  onDropdownChange(newValue: any): void {
    this.onValueChange(newValue);
  }

  // ==================== 🎯 直接從原版複製的數字處理 ====================

  getNumberInputConfig(): any {
    const col = this.column as any;

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

  getNumberDisplayValue(): string {
    if (this.value === null || this.value === undefined) {
      return '';
    }

    const num = Number(this.value);
    if (isNaN(num)) {
      return String(this.value);
    }

    return num.toLocaleString();
  }

  // ==================== Checkbox 處理 ====================

  getCheckboxValue(): boolean {
    return !!this.value;
  }

  onCheckboxChange(checked: boolean): void {
    this.onValueChange(checked);
  }

  // ==================== 核心值處理 ====================

  onValueChange(newValue: any): void {
    this.internalValue = newValue;
    this.valueChange.emit(newValue);
  }

  // ==================== 顯示邏輯 ====================

  getDisplayValue(): string {
    if (this.value === null || this.value === undefined) {
      return '';
    }
    return String(this.value);
  }

  // ==================== 工具方法 ====================

  get fieldType(): string {
    return this.column.type || 'text';
  }

  get canEdit(): boolean {
    // 🔧 修復：嚴格檢查 editable 欄位，只有明確設為 true 的才可編輯
    if (this.column.editable !== true) {
      return false;
    }
    return this.isEditing && !this.readonly;
  }

  get canDisplay(): boolean {
    return !this.canEdit;
  }
}
