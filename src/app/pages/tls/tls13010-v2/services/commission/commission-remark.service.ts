/**
 * 備註欄位生成服務
 * 負責格式化抽成項目的備註文字
 */
import { Injectable } from '@angular/core';
import { CommissionItem } from '../../core/models/commission';

@Injectable({ providedIn: 'root' })
export class CommissionRemarkService {

  /**
   * 根據折扣設定產生備註欄位文字
   * 格式: 折扣別-(起始日-終止日)-抽成率
   * 所有項目用逗號分隔
   */
  formatRemarkText(commissionItem: CommissionItem): string {
    if (!commissionItem.discountSettingItems || commissionItem.discountSettingItems.length === 0) {
      return '';
    }

    // 過濾出已勾選的項目
    const selectedDiscounts = commissionItem.discountSettingItems.filter(d => d.selected);

    if (selectedDiscounts.length === 0) {
      return '';
    }

    // 按折扣別排序後，產生所有備註項目
    const remarkParts = selectedDiscounts
      .sort((a, b) => (a.cag_barcode || '').localeCompare(b.cag_barcode || ''))
      .map(d => {
        const startDate = this.formatDateString(d.tlt_bdate).replace(/-/g, '/');
        const endDate = this.formatDateString(d.tlt_edate).replace(/-/g, '/');
        // 修正浮點數精度問題
        const rate = (d.cag_charge_rate || 0).toFixed(2).replace(/\.?0+$/, '');
        return `${d.cag_barcode}-(${startDate}-${endDate})-${rate}`;
      });

    return remarkParts.join(',');
  }

  /**
   * 格式化合約期間顯示
   * 格式: yyyy/mm/dd ~ yyyy/mm/dd
   */
  formatContractPeriod(startDate: Date | string | null | undefined, endDate: Date | string | null | undefined): string {
    const start = this.formatDateString(startDate);
    const end = this.formatDateString(endDate);

    if (!start || !end) {
      return '';
    }

    const formattedStart = start.replace(/-/g, '/');
    const formattedEnd = end.replace(/-/g, '/');

    return `${formattedStart} ~ ${formattedEnd}`;
  }

  /**
   * 格式化日期字串
   */
  private formatDateString(dateInput: Date | string | null | undefined): string {
    if (!dateInput) return '';

    // 處理 Date 物件
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return '';
      const year = dateInput.getFullYear();
      const month = String(dateInput.getMonth() + 1).padStart(2, '0');
      const day = String(dateInput.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // 處理字串
    if (typeof dateInput === 'string') {
      // 如果已經是 YYYY-MM-DD 格式
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput;
      }
      // 如果包含 T (ISO 格式)
      if (dateInput.includes('T')) {
        return dateInput.split('T')[0];
      }
    }

    // 嘗試轉換為 Date 再格式化
    try {
      const d = new Date(dateInput as string);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch {
      return '';
    }

    return '';
  }
}
