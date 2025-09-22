// commission-validation.service.ts - 專門處理驗證邏輯
import { Injectable } from '@angular/core';
import { CommissionItem, DiscountSettingItem, AnnualPerformanceItem } from '../../tls13010/tls13010.model';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CommissionValidationService {

  /**
   * 驗證所有抽成數據
   */
  validateAllData(commissionData: CommissionItem[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 基本檢查
    if (!commissionData || commissionData.length === 0) {
      errors.push('請至少設定一個抽成項目');
      return { isValid: false, errors };
    }

    const activeItems = commissionData.filter(item => item._status !== 'deleted');
    if (activeItems.length === 0) {
      errors.push('請至少保留一個有效的抽成項目');
      return { isValid: false, errors };
    }

    // 逐項檢查
    activeItems.forEach((item, index) => {
      const itemErrors = this.validateCommissionItem(item, index + 1);
      errors.push(...itemErrors.errors);
      if (itemErrors.warnings) {
        warnings.push(...itemErrors.warnings);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 驗證單一抽成項目
   */
  validateCommissionItem(item: CommissionItem, itemIndex: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const prefix = `抽成項目 ${itemIndex}`;

    // 必填欄位檢查
    if (!item.tlt_id?.trim()) {
      errors.push(`${prefix}: 抽成類別不能為空`);
    }
    if (!item.tlt_id_desc?.trim()) {
      errors.push(`${prefix}: 抽成類別名稱不能為空`);
    }
    if (typeof item.cag_taxtype === 'undefined') {
      errors.push(`${prefix}: 請選擇稅別`);
    }

    // 數值檢查
    if (item.sst_amount < 0) {
      errors.push(`${prefix}: 單筆交易金額不能為負數`);
    }
    if (item.sst_rate < 0 || item.sst_rate > 100) {
      errors.push(`${prefix}: 特價抽成率必須在0-100%之間`);
    }

    // 折扣設定檢查
    const discountErrors = this.validateDiscountItems(item.discountSettingItems, prefix);
    errors.push(...discountErrors.errors);

    // 年度業績檢查
    const annualErrors = this.validateAnnualItems(item.annualPerformanceItems, prefix);
    errors.push(...annualErrors.errors);

    // 層級抽成檢查
    const levelErrors = this.validateLevelItems(item.discountLevelItems, prefix);
    errors.push(...levelErrors.errors);

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * 驗證折扣設定項目
   */
  validateDiscountItems(items: DiscountSettingItem[], prefix: string): ValidationResult {
    const errors: string[] = [];
    const activeItems = items?.filter(d => d._status !== 'deleted' && d.selected) || [];

    activeItems.forEach((discount, index) => {
      const itemPrefix = `${prefix} 折扣設定 ${index + 1}`;

      if (!discount.cag_barcode) {
        errors.push(`${itemPrefix}: 請選擇折扣別`);
      }

      if ((discount.cag_charge_rate || 0) < 0 || (discount.cag_charge_rate || 0) > 100) {
        errors.push(`${itemPrefix}: 抽成率必須在0-100%之間`);
      }

      if (!this.isValidDateRange(discount.tlt_bdate, discount.tlt_edate)) {
        errors.push(`${itemPrefix}: 日期範圍無效`);
      }
    });

    // 檢查同一折扣別的日期重疊
    const overlapErrors = this.checkDiscountDateOverlap(activeItems, prefix);
    errors.push(...overlapErrors);

    return { isValid: errors.length === 0, errors };
  }

  /**
   * 驗證年度業績項目
   */
  validateAnnualItems(items: AnnualPerformanceItem[], prefix: string): ValidationResult {
    const errors: string[] = [];
    const activeItems = items?.filter(a => a._status !== 'deleted') || [];

    activeItems.forEach((annual, index) => {
      const itemPrefix = `${prefix} 年度業績 ${index + 1}`;

      if ((annual.year_amount || 0) <= 0) {
        errors.push(`${itemPrefix}: 業績金額必須大於0`);
      }

      if ((annual.extra_rate || 0) < 0 || (annual.extra_rate || 0) > 100) {
        errors.push(`${itemPrefix}: 額外抽成率必須在0-100%之間`);
      }

      if (!this.isValidDateRange(annual.tlt_bdate, annual.tlt_edate)) {
        errors.push(`${itemPrefix}: 日期範圍無效`);
      }
    });

    // 檢查年度業績日期重疊
    const overlapErrors = this.checkAnnualDateOverlap(activeItems, prefix);
    errors.push(...overlapErrors);

    return { isValid: errors.length === 0, errors };
  }

  /**
   * 驗證層級抽成項目
   */
  validateLevelItems(items: any[], prefix: string): ValidationResult {
    const errors: string[] = [];
    const activeItems = items?.filter(l => l._status !== 'deleted' && l.selected) || [];

    activeItems.forEach((level, index) => {
      const itemPrefix = `${prefix} 層級抽成 ${index + 1}`;

      if (!level.cag_barcode) {
        errors.push(`${itemPrefix}: 請選擇折扣別`);
      }

      const bmount = level.level_bmount || 0;
      const eamount = level.level_eamount || 0;

      if (bmount < 0 || eamount < 0) {
        errors.push(`${itemPrefix}: 金額不能為負數`);
      }

      // if (bmount >= eamount) {
      //   errors.push(`${itemPrefix}: 起始金額必須小於結束金額`);
      // }

      if ((level.level_charge_rate || 0) < 0 || (level.level_charge_rate || 0) > 100) {
        errors.push(`${itemPrefix}: 抽成率必須在0-100%之間`);
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  /**
   * 檢查折扣設定日期重疊
   */
  private checkDiscountDateOverlap(items: DiscountSettingItem[], prefix: string): string[] {
    const errors: string[] = [];

    // 按折扣別分組
    const groups = this.groupBy(items, 'cag_barcode');

    Object.entries(groups).forEach(([discountType, groupItems]) => {
      if (groupItems.length <= 1) return;

      // 檢查每一對項目是否有重疊
      for (let i = 0; i < groupItems.length; i++) {
        for (let j = i + 1; j < groupItems.length; j++) {
          const item1 = groupItems[i];
          const item2 = groupItems[j];

          if (this.hasDateOverlap(item1.tlt_bdate, item1.tlt_edate, item2.tlt_bdate, item2.tlt_edate)) {
            const date1 = `${this.formatDate(item1.tlt_bdate)}-${this.formatDate(item1.tlt_edate)}`;
            const date2 = `${this.formatDate(item2.tlt_bdate)}-${this.formatDate(item2.tlt_edate)}`;
            errors.push(`${prefix}: 折扣別 ${discountType} 的日期範圍重疊 (${date1} 與 ${date2})`);
            break; // 找到一個重疊就停止，避免重複訊息
          }
        }
      }
    });

    return errors;
  }

  /**
 * 格式化日期用於錯誤訊息
 */
  private formatDate(date: any): string {
    if (!date) return '未設定';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '無效日期';

    // 使用本地時間格式化，避免 UTC 時區轉換問題
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 檢查年度業績日期重疊
   */
  private checkAnnualDateOverlap(items: AnnualPerformanceItem[], prefix: string): string[] {
    const errors: string[] = [];

    if (items.length <= 1) return errors;

    const sorted = items.sort((a, b) =>
      new Date(a.tlt_bdate).getTime() - new Date(b.tlt_bdate).getTime()
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      if (this.hasDateOverlap(current.tlt_bdate, current.tlt_edate, next.tlt_bdate, next.tlt_edate)) {
        errors.push(`${prefix}: 年度業績設定日期重疊`);
        break;
      }
    }

    return errors;
  }

  /**
   * 檢查兩個日期範圍是否重疊
   */
  private hasDateOverlap(start1: any, end1: any, start2: any, end2: any): boolean {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);

    // 確保日期有效
    if (isNaN(s1.getTime()) || isNaN(e1.getTime()) || isNaN(s2.getTime()) || isNaN(e2.getTime())) {
      return false;
    }

    // 修正：檢查是否有任何重疊（包含完全相同的日期）
    // 兩個範圍有重疊的條件：start1 <= end2 && start2 <= end1
    const hasOverlap = s1.getTime() <= e2.getTime() && s2.getTime() <= e1.getTime();

    // 允許的情況：兩個範圍緊鄰但不重疊
    // 例如：範圍1是1/1-1/10，範圍2是1/11-1/20
    const isAdjacent = (e1.getTime() + 24 * 60 * 60 * 1000 === s2.getTime()) ||
      (e2.getTime() + 24 * 60 * 60 * 1000 === s1.getTime());

    // 如果有重疊且不是緊鄰（差一天），就是不允許的重疊
    return hasOverlap && !isAdjacent;
  }

  /**
   * 驗證日期範圍
   */
  private isValidDateRange(startDate: any, endDate: any): boolean {
    if (!startDate || !endDate) return false;

    const start = new Date(startDate);
    const end = new Date(endDate);

    return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
  }

  /**
   * 按指定欄位分組
   */
  private groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key] || '未設定');
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as { [key: string]: T[] });
  }

  /**
   * 檢查是否有抽成數據
   */
  hasCommissionData(commissionData: CommissionItem[], dataLoaded: boolean): boolean {
    return dataLoaded &&
      commissionData &&
      commissionData.filter(item => item._status !== 'deleted').length > 0;
  }

  /**
   * 檢查是否有變更
   */
  hasCommissionChanges(commissionData: CommissionItem[]): boolean {
    return commissionData.some(item =>
      item._status === 'new' ||
      item._status === 'modified' ||
      item._status === 'deleted' ||
      this.hasDetailItemChanges(item)
    );
  }

  /**
   * 檢查明細項目是否有變更
   */
  private hasDetailItemChanges(commissionItem: CommissionItem): boolean {
    const hasDiscountChanges = commissionItem.discountSettingItems?.some(item =>
      item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
    ) || false;

    const hasAnnualChanges = commissionItem.annualPerformanceItems?.some(item =>
      item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
    ) || false;

    const hasLevelChanges = commissionItem.discountLevelItems?.some(item =>
      item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
    ) || false;

    return hasDiscountChanges || hasAnnualChanges || hasLevelChanges;
  }
}
