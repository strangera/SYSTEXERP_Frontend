import { Injectable } from '@angular/core';
import { DateFormatType, DATE_FORMAT_CONFIG } from '../types/column.types';

@Injectable({
  providedIn: 'root'
})
export class DateFormatterService {

  /**
   * 將原始值格式化為顯示字串
   * @param rawValue 原始值（可能是 Date、字串或數字）
   * @param formatType 日期格式類型
   * @returns 格式化後的字串
   */
  formatForDisplay(rawValue: any, formatType: DateFormatType = 'full-date'): string {
    if (!rawValue) return '';

    try {
      const dateObj = this.parseToDate(rawValue);
      if (!dateObj || isNaN(dateObj.getTime())) {
        console.warn('無效的日期值:', rawValue);
        return '';
      }

      return this.formatDate(dateObj, formatType);
    } catch (error) {
      console.error('日期格式化錯誤:', error, rawValue);
      return '';
    }
  }

  /**
   * 解析用戶輸入的字串為 Date 物件
   * @param inputValue 用戶輸入的字串
   * @param formatType 預期的日期格式
   * @returns Date 物件或 null
   */
  parseUserInput(inputValue: string, formatType: DateFormatType = 'full-date'): Date | null {
    if (!inputValue || !inputValue.trim()) return null;

    const trimmed = inputValue.trim();

    try {
      // 處理緊湊格式 YYYYMM (6位數字)
      if (/^\d{6}$/.test(trimmed)) {
        return this.parseCompactYearMonth(trimmed);
      }

      // 處理緊湊格式 YYYYMMDD (8位數字)
      if (/^\d{8}$/.test(trimmed)) {
        return this.parseCompactFullDate(trimmed, formatType);
      }

      // 處理標準格式 YYYY/MM 或 YYYY-MM
      if (/^\d{4}[\/-]\d{1,2}$/.test(trimmed)) {
        return this.parseYearMonth(trimmed);
      }

      // 處理完整日期格式 YYYY/MM/DD 或 YYYY-MM-DD
      if (/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(trimmed)) {
        return this.parseFullDate(trimmed, formatType);
      }

      // 嘗試通用解析
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }

      console.warn('無法解析的日期格式:', inputValue);
      return null;
    } catch (error) {
      console.error('日期解析錯誤:', error);
      return null;
    }
  }

  /**
   * 取得指定格式的 placeholder
   * @param formatType 日期格式類型
   * @returns placeholder 字串
   */
  getPlaceholder(formatType: DateFormatType): string {
    const config = DATE_FORMAT_CONFIG[formatType];
    return config.placeholder;
  }

  /**
   * 取得格式描述
   * @param formatType 日期格式類型
   * @returns 格式描述
   */
  getFormatDescription(formatType: DateFormatType): string {
    const config = DATE_FORMAT_CONFIG[formatType];
    return config.description;
  }

  /**
   * 取得格式範例
   * @param formatType 日期格式類型
   * @returns 範例陣列
   */
  getFormatExamples(formatType: DateFormatType): string[] {
    const config = DATE_FORMAT_CONFIG[formatType];
    return config.examples;
  }

  /**
   * 驗證日期有效性
   * @param year 年
   * @param month 月（0-11）
   * @param day 日
   * @returns 是否有效
   */
  isValidDate(year: number, month: number, day: number): boolean {
    if (year < 1900 || year > 2100) return false;
    if (month < 0 || month > 11) return false;
    if (day < 1 || day > 31) return false;

    const date = new Date(year, month, day);
    return date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day;
  }

  // ==================== 私有方法 ====================

  /**
   * 將各種格式轉換為 Date 物件
   */
  private parseToDate(rawValue: any): Date | null {
    if (rawValue instanceof Date) {
      return rawValue;
    }

    if (typeof rawValue === 'string') {
      // 處理 ISO 日期格式："2014-11-30T16:00:00.000Z"
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(rawValue)) {
        const match = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
          const year = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1;
          const day = parseInt(match[3], 10);
          return new Date(year, month, day);
        }
      }

      // 處理緊湊格式
      if (/^\d{6}$/.test(rawValue)) {
        return this.parseCompactYearMonth(rawValue);
      }

      if (/^\d{8}$/.test(rawValue)) {
        const year = parseInt(rawValue.substring(0, 4), 10);
        const month = parseInt(rawValue.substring(4, 6), 10) - 1;
        const day = parseInt(rawValue.substring(6, 8), 10);
        return new Date(year, month, day);
      }

      // 其他格式
      return new Date(rawValue);
    }

    if (typeof rawValue === 'number') {
      return new Date(rawValue);
    }

    return null;
  }

  /**
   * 根據格式類型格式化日期
   */
  private formatDate(date: Date, formatType: DateFormatType): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

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
  }

  /**
   * 解析緊湊年月格式 YYYYMM
   */
  private parseCompactYearMonth(value: string): Date | null {
    const year = parseInt(value.substring(0, 4), 10);
    const month = parseInt(value.substring(4, 6), 10) - 1;

    if (this.isValidDate(year, month, 1)) {
      return new Date(year, month, 1);
    }

    return null;
  }

  /**
   * 解析緊湊完整日期格式 YYYYMMDD
   */
  private parseCompactFullDate(value: string, formatType: DateFormatType): Date | null {
    const year = parseInt(value.substring(0, 4), 10);
    const month = parseInt(value.substring(4, 6), 10) - 1;
    const day = parseInt(value.substring(6, 8), 10);

    if (this.isValidDate(year, month, day)) {
      if (formatType.includes('year-month')) {
        return new Date(year, month, 1);
      } else {
        return new Date(year, month, day);
      }
    }

    return null;
  }

  /**
   * 解析年月格式 YYYY/MM 或 YYYY-MM
   */
  private parseYearMonth(value: string): Date | null {
    const parts = value.split(/[\/-]/);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;

    if (this.isValidDate(year, month, 1)) {
      return new Date(year, month, 1);
    }

    return null;
  }

  /**
   * 解析完整日期格式 YYYY/MM/DD 或 YYYY-MM-DD
   */
  private parseFullDate(value: string, formatType: DateFormatType): Date | null {
    const parts = value.split(/[\/-]/);
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

    return null;
  }
}
