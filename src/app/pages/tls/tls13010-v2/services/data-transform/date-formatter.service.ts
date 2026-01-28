import { Injectable } from '@angular/core';
import { DATE_FORMATS } from '../../core/constants';

/**
 * 日期格式化服務
 *
 * 職責: 統一處理日期格式轉換
 * - 前端顯示格式
 * - 後端 API 格式
 * - 代扣款緊湊格式
 */
@Injectable({ providedIn: 'root' })
export class DateFormatterService {

  /**
   * 格式化為後端標準格式 YYYY-MM-DD
   */
  formatForBackend(date: Date | string | null | undefined): string {
    if (!date) return '';

    try {
      const dateObj = this.toDate(date);
      if (!dateObj || isNaN(dateObj.getTime())) return '';

      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  }

  /**
   * 格式化為代扣款緊湊格式 YYYYMM (只有年月)
   */
  formatCompact(date: Date | string | null | undefined): string {
    if (!date) return '';

    try {
      // 如果已經是 YYYYMM 格式
      if (typeof date === 'string' && /^\d{6}$/.test(date)) {
        return date;
      }

      // 如果是 YYYYMMDD 格式，取前6位
      if (typeof date === 'string' && /^\d{8}$/.test(date)) {
        return date.substring(0, 6);
      }

      const dateObj = this.toDate(date);
      if (!dateObj || isNaN(dateObj.getTime())) return '';

      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');

      return `${year}${month}`;
    } catch {
      return '';
    }
  }

  /**
   * 格式化為前端顯示格式 YYYY/MM/DD
   */
  formatForDisplay(date: Date | string | null | undefined): string {
    if (!date) return '';

    try {
      const dateObj = this.toDate(date);
      if (!dateObj || isNaN(dateObj.getTime())) return '';

      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');

      return `${year}/${month}/${day}`;
    } catch {
      return '';
    }
  }

  /**
   * 格式化為可為 null 的後端格式
   */
  formatNullable(date: Date | string | null | undefined): string | null {
    if (!date || date === '') return null;
    const formatted = this.formatForBackend(date);
    return formatted === '' ? null : formatted;
  }

  /**
   * 解析各種格式的日期字串為 Date 物件
   */
  parseDate(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;

    try {
      // YYYYMM 格式
      if (/^\d{6}$/.test(dateString)) {
        const year = parseInt(dateString.substring(0, 4), 10);
        const month = parseInt(dateString.substring(4, 6), 10) - 1;
        return new Date(year, month, 1);
      }

      // YYYYMMDD 格式
      if (/^\d{8}$/.test(dateString)) {
        const year = parseInt(dateString.substring(0, 4), 10);
        const month = parseInt(dateString.substring(4, 6), 10) - 1;
        const day = parseInt(dateString.substring(6, 8), 10);
        return new Date(year, month, day);
      }

      // YYYY-MM-DD 或 ISO 格式
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  /**
   * 將輸入轉換為 Date 物件
   */
  private toDate(input: Date | string): Date | null {
    if (input instanceof Date) {
      return input;
    }

    if (typeof input === 'string') {
      return this.parseDate(input);
    }

    return null;
  }

  /**
   * 取得日期格式常數
   */
  getFormats(): typeof DATE_FORMATS {
    return DATE_FORMATS;
  }
}
