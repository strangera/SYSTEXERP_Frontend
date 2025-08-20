import { DateFormatType, ColumnDef, DATE_FORMAT_CONFIG } from './../../smart-data-table/types/column.types';
// date-handler.service.ts
// 🎯 日期處理服務，專門處理日期相關的邏輯

import { Injectable } from '@angular/core';

export interface DateInputState {
  rowData: any;
  field: string;
  userInput: string;
  isDetail: boolean;
  detailIndex?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DateHandlerService {

  // 🎯 存儲用戶正在輸入的日期值
  private userInputValues = new Map<string, string>();

  /**
   * 🎯 核心功能：純粹的日期格式化，不修改原始資料
   */
  formatDateForDisplay(rawValue: any, formatType: DateFormatType): string {
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

  /**
   * 🎯 獲取日期輸入值（編輯時使用）
   */
  getDateInputValue(rowData: any, column: ColumnDef, isDetail: boolean = false, detailIndex?: number): string {
    const fieldKey = this.getFieldKey(rowData, column.field, isDetail, detailIndex);

    // 🎯 優先顯示使用者正在輸入的值
    const userInput = this.userInputValues.get(fieldKey);
    if (userInput !== undefined) {
      return userInput;
    }

    // 🎯 否則顯示格式化後的值
    return this.formatDateForDisplay(rowData[column.field], column.dateFormat || 'full-date');
  }

  /**
   * 🎯 處理日期輸入變更
   */
  onDateInputChange(rowData: any, column: ColumnDef, inputValue: string, isDetail: boolean = false, detailIndex?: number): void {
    const fieldKey = this.getFieldKey(rowData, column.field, isDetail, detailIndex);

    // 套用長度限制
    let processedValue = inputValue;
    if (column.maxLength && inputValue.length > column.maxLength) {
      processedValue = inputValue.substring(0, column.maxLength);
    }

    // 🎯 只儲存使用者輸入，不做任何處理
    this.userInputValues.set(fieldKey, processedValue);
  }

  /**
   * 🎯 Blur 時統一處理：驗證 → 轉換 → 格式化 → 儲存
   */
  onDateInputBlur(
    rowData: any,
    column: ColumnDef,
    isDetail: boolean = false,
    detailIndex?: number,
    onSave?: (rowData: any, column: ColumnDef, newValue: any, isDetail: boolean, detailIndex?: number) => void,
    onError?: (inputValue: string, formatType: DateFormatType) => void
  ): void {
    const fieldKey = this.getFieldKey(rowData, column.field, isDetail, detailIndex);
    const userInput = this.userInputValues.get(fieldKey);
    const formatType = column.dateFormat || 'full-date';

    // 如果沒有使用者輸入，使用當前顯示值
    const inputValue = userInput !== undefined ? userInput : this.formatDateForDisplay(rowData[column.field], formatType);

    console.log(`🎯 處理日期 Blur: ${column.field} = "${inputValue}"`);

    // 🎯 空值處理
    if (!inputValue || inputValue.trim() === '') {
      rowData[column.field] = null;
      this.userInputValues.delete(fieldKey);
      onSave?.(rowData, column, null, isDetail, detailIndex);
      console.log(`✅ 日期已清空`);
      return;
    }

    // 🎯 嘗試解析使用者輸入
    const parsedDate = this.parseSmartDateInput(inputValue.trim(), formatType);

    if (parsedDate) {
      // ✅ 解析成功：更新資料 + 格式化顯示
      const oldValue = rowData[column.field];
      rowData[column.field] = parsedDate;

      // 清除使用者輸入狀態（這樣 getDateInputValue 會顯示格式化後的值）
      this.userInputValues.delete(fieldKey);

      console.log(`✅ 日期解析成功: "${inputValue}" -> ${this.formatDateForDisplay(parsedDate, formatType)}`);

      // 觸發儲存事件
      onSave?.(rowData, column, parsedDate, isDetail, detailIndex);

    } else {
      // ❌ 解析失敗：恢復到原始值 + 顯示錯誤提示
      console.warn(`❌ 日期格式錯誤: "${inputValue}"`);

      // 清除無效輸入
      this.userInputValues.delete(fieldKey);

      // 顯示友善的錯誤提示
      onError?.(inputValue, formatType);
    }
  }

  /**
   * 🎯 智慧日期解析 - 支援多種輸入格式
   */
  parseSmartDateInput(inputValue: string, formatType: DateFormatType): Date | null {
    if (!inputValue) return null;

    try {
      // 🎯 年月格式處理
      if (formatType.includes('year-month')) {
        return this.parseYearMonthInput(inputValue);
      }
      // 🎯 完整日期格式處理
      else {
        return this.parseFullDateInput(inputValue);
      }
    } catch (error) {
      console.error('日期解析錯誤:', error);
      return null;
    }
  }

  /**
   * 🎯 解析年月輸入 (202508, 2025/08, 2025-08 -> 2025/08)
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
   * 🎯 解析完整日期輸入 (20250815, 2025/08/15, 2025-08-15 -> 2025/08/15)
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

  /**
   * 🎯 對外接口：獲得欄位的 placeholder
   */
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

  /**
   * 🎯 輔助方法：日期有效性檢查
   */
  private isValidDate(year: number, month: number, day: number): boolean {
    if (year < 1900 || year > 2100) return false;
    if (month < 0 || month > 11) return false;
    if (day < 1 || day > 31) return false;

    const date = new Date(year, month, day);
    return date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day;
  }

  /**
   * 🎯 生成字段唯一鍵
   */
  private getFieldKey(rowData: any, field: string, isDetail: boolean = false, detailIndex?: number): string {
    const mainKey = `${rowData.id || rowData.key}_${field}`;
    return isDetail ? `${mainKey}_detail_${detailIndex}` : mainKey;
  }

  /**
   * 🎯 清理輸入狀態（在行編輯結束時呼叫）
   */
  cleanupDateInputStates(rowData: any): void {
    const rowKey = rowData.id || rowData.key;
    const keysToDelete: string[] = [];

    this.userInputValues.forEach((value, key) => {
      if (key.startsWith(`${rowKey}_`)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.userInputValues.delete(key));
  }

  /**
   * 🎯 獲取日期格式提示信息
   */
  getDateFormatHint(inputValue: string, formatType: DateFormatType): string {
    const config = DATE_FORMAT_CONFIG[formatType];

    if (!config) return '日期格式錯誤';

    let hint = `日期格式錯誤：「${inputValue}」\n`;
    hint += `支援格式：${config.examples.join('、')}`;

    return hint;
  }

  /**
   * 🎯 重置服務狀態
   */
  reset(): void {
    this.userInputValues.clear();
  }
}
