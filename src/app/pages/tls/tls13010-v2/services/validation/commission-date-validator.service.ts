/**
 * 抽成日期驗證服務
 * 負責日期格式轉換和驗證
 */
import { Injectable } from '@angular/core';

export interface DateOverlapResult {
  hasOverlap: boolean;
  overlappingPairs: Array<{ index1: number; index2: number }>;
}

@Injectable({ providedIn: 'root' })
export class CommissionDateValidatorService {

  /**
   * 驗證日期是否在合約期間內
   */
  validateDateWithinContract(
    date: Date | string | undefined,
    contractStart: string,
    contractEnd: string
  ): boolean {
    if (!date) return false;

    const targetDate = this.parseDate(date);
    const startDate = this.parseDate(contractStart);
    const endDate = this.parseDate(contractEnd);

    targetDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return targetDate >= startDate && targetDate <= endDate;
  }

  /**
   * 檢查日期重疊
   */
  checkDateOverlap(
    items: Array<{ tlt_bdate?: Date | string; tlt_edate?: Date | string; _status?: string }>,
    excludeDeleted = true
  ): DateOverlapResult {
    const result: DateOverlapResult = {
      hasOverlap: false,
      overlappingPairs: []
    };

    const validItems = excludeDeleted
      ? items.filter(item => item._status !== 'deleted')
      : items;

    for (let i = 0; i < validItems.length; i++) {
      for (let j = i + 1; j < validItems.length; j++) {
        const item1 = validItems[i];
        const item2 = validItems[j];

        if (this.hasDateRangeOverlap(
          item1.tlt_bdate, item1.tlt_edate,
          item2.tlt_bdate, item2.tlt_edate
        )) {
          result.hasOverlap = true;
          result.overlappingPairs.push({ index1: i, index2: j });
        }
      }
    }

    return result;
  }

  /**
   * 檢查兩個日期範圍是否重疊
   */
  hasDateRangeOverlap(
    start1: Date | string | undefined,
    end1: Date | string | undefined,
    start2: Date | string | undefined,
    end2: Date | string | undefined
  ): boolean {
    if (!start1 || !end1 || !start2 || !end2) return false;

    const s1 = this.parseDate(start1);
    const e1 = this.parseDate(end1);
    const s2 = this.parseDate(start2);
    const e2 = this.parseDate(end2);

    s1.setHours(0, 0, 0, 0);
    e1.setHours(0, 0, 0, 0);
    s2.setHours(0, 0, 0, 0);
    e2.setHours(0, 0, 0, 0);

    // 兩個範圍重疊的條件：!(e1 < s2 || e2 < s1)
    return !(e1 < s2 || e2 < s1);
  }

  /**
   * 解析日期
   */
  parseDate(dateInput: Date | string | undefined): Date {
    if (!dateInput) return new Date();

    if (dateInput instanceof Date) {
      return new Date(dateInput);
    }

    // 處理 ISO 格式
    if (typeof dateInput === 'string' && dateInput.includes('T')) {
      return new Date(dateInput.split('T')[0]);
    }

    return new Date(dateInput);
  }

  /**
   * 格式化日期為 YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 驗證日期範圍 (起始日 <= 終止日)
   */
  validateDateRange(
    startDate: Date | string | undefined,
    endDate: Date | string | undefined
  ): boolean {
    if (!startDate || !endDate) return false;

    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return start <= end;
  }
}
