import { AnnualPerformanceItem, CommissionItem, DiscountSettingItem } from './../../tls13010/tls13010.model';
// tls13010-next2-validation.service.ts
import { Injectable } from '@angular/core';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TLS13010Next2ValidationService {

  /**
   * 驗證一般抽成數據
   */
  validateGeneralCommissionData(commissionData: CommissionItem[]): ValidationResult {
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
      this.validateCommissionItem(item, index + 1, errors, warnings);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 驗證是否有抽成數據
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
   * 驗證日期範圍
   */
  validateDateRange(startDate: Date | string, endDate: Date | string): ValidationResult {
    const errors: string[] = [];

    if (!startDate || !endDate) {
      errors.push('起始日期和結束日期都必須填寫');
      return { isValid: false, errors };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      errors.push('日期格式錯誤');
      return { isValid: false, errors };
    }

    if (start >= end) {
      errors.push('起始日期必須早於結束日期');
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * 驗證抽成率
   */
  validateCommissionRate(rate: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (rate < 0) {
      errors.push('抽成率不能為負數');
    } else if (rate > 100) {
      errors.push('抽成率不能超過100%');
    } else if (rate > 50) {
      warnings.push('抽成率超過50%，請確認是否正確');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============ 私有方法 ============

  private validateCommissionItem(
    item: CommissionItem,
    itemIndex: number,
    errors: string[],
    warnings: string[]
  ): void {
    const prefix = `抽成項目 ${itemIndex}`;

    // 必填欄位檢查
    if (!item.tlt_id || !item.tlt_id.trim()) {
      errors.push(`${prefix}: 抽成類別不能為空`);
    }

    if (!item.tlt_id_desc || !item.tlt_id_desc.trim()) {
      errors.push(`${prefix}: 抽成類別名稱不能為空`);
    }

    if (typeof item.cag_taxtype === 'undefined') {
      errors.push(`${prefix}: 請選擇稅別`);
    }

    // 數值檢查
    if (item.sst_amount < 0) {
      errors.push(`${prefix}: 單筆交易金額不能為負數`);
    }

    if (item.sst_rate < 0) {
      errors.push(`${prefix}: 特價抽成率不能為負數`);
    } else if (item.sst_rate > 100) {
      errors.push(`${prefix}: 特價抽成率不能超過100%`);
    }

    // 檢查折扣設定
    const activeDiscountItems = item.discountSettingItems?.filter(d =>
      d._status !== 'deleted' && d.selected
    ) || [];

    if (activeDiscountItems.length > 0) {
      activeDiscountItems.forEach((discount, index) => {
        if (!discount.cag_barcode) {
          errors.push(`${prefix} 折扣設定 ${index + 1}: 請選擇折扣別`);
        }

        const rateValidation = this.validateCommissionRate(discount.cag_charge_rate || 0);
        if (!rateValidation.isValid) {
          errors.push(`${prefix} 折扣設定 ${index + 1}: ${rateValidation.errors[0]}`);
        }
        if (rateValidation.warnings?.length) {
          warnings.push(`${prefix} 折扣設定 ${index + 1}: ${rateValidation.warnings[0]}`);
        }

        const dateValidation = this.validateDateRange(discount.tlt_bdate, discount.tlt_edate);
        if (!dateValidation.isValid) {
          errors.push(`${prefix} 折扣設定 ${index + 1}: ${dateValidation.errors[0]}`);
        }
      });
    }

    // 檢查年度業績設定（包含日期重疊檢查）
    const activeAnnualItems = item.annualPerformanceItems?.filter(a =>
      a._status !== 'deleted'
    ) || [];

    if (activeAnnualItems.length > 0) {
      // 先檢查個別項目
      activeAnnualItems.forEach((annual, index) => {
        if ((annual.year_amount || 0) <= 0) {
          errors.push(`${prefix} 年度業績設定 ${index + 1}: 業績金額必須大於0`);
        }

        const rateValidation = this.validateCommissionRate(annual.extra_rate || 0);
        if (!rateValidation.isValid) {
          errors.push(`${prefix} 年度業績設定 ${index + 1}: ${rateValidation.errors[0]}`);
        }

        const dateValidation = this.validateDateRange(annual.tlt_bdate, annual.tlt_edate);
        if (!dateValidation.isValid) {
          errors.push(`${prefix} 年度業績設定 ${index + 1}: ${dateValidation.errors[0]}`);
        }
      });

      // 檢查整體日期區間重疊
      const overlapValidation = this.validateAnnualDateRanges(activeAnnualItems);
      if (!overlapValidation.isValid) {
        overlapValidation.errors.forEach(error => {
          errors.push(`${prefix}: ${error}`);
        });
      }
    }

    // 檢查層級抽成設定
    const activeLevelItems = item.discountLevelItems?.filter(l =>
      l._status !== 'deleted' && l.selected
    ) || [];

    if (activeLevelItems.length > 0) {
      activeLevelItems.forEach((level, index) => {
        if (!level.cag_barcode) {
          errors.push(`${prefix} 層級抽成設定 ${index + 1}: 請選擇折扣別`);
        }

        const bmount = level.level_bmount || 0;
        const eamount = level.level_eamount || 0;

        if (bmount < 0 || eamount < 0) {
          errors.push(`${prefix} 層級抽成設定 ${index + 1}: 業績計算金額不能為負數`);
        }

        if (bmount >= eamount) {
          errors.push(`${prefix} 層級抽成設定 ${index + 1}: 起始金額必須小於結束金額`);
        }

        const rateValidation = this.validateCommissionRate(level.level_charge_rate || 0);
        if (!rateValidation.isValid) {
          errors.push(`${prefix} 層級抽成設定 ${index + 1}: ${rateValidation.errors[0]}`);
        }
      });
    }
  }

  private validateDetailSettings(
    item: CommissionItem,
    prefix: string,
    errors: string[],
    warnings: string[]
  ): void {
    // 檢查折扣設定
    const activeDiscountItems = item.discountSettingItems?.filter(d =>
      d._status !== 'deleted' && d.selected
    ) || [];

    if (activeDiscountItems.length > 0) {
      activeDiscountItems.forEach((discount, index) => {
        if (!discount.cag_barcode) {
          errors.push(`${prefix} 折扣設定 ${index + 1}: 請選擇折扣別`);
        }

        const rateValidation = this.validateCommissionRate(discount.cag_charge_rate || 0);
        if (!rateValidation.isValid) {
          errors.push(`${prefix} 折扣設定 ${index + 1}: ${rateValidation.errors[0]}`);
        }
        if (rateValidation.warnings?.length) {
          warnings.push(`${prefix} 折扣設定 ${index + 1}: ${rateValidation.warnings[0]}`);
        }

        const dateValidation = this.validateDateRange(discount.tlt_bdate, discount.tlt_edate);
        if (!dateValidation.isValid) {
          errors.push(`${prefix} 折扣設定 ${index + 1}: ${dateValidation.errors[0]}`);
        }
      });
    }

    // 檢查年度業績設定
    const activeAnnualItems = item.annualPerformanceItems?.filter(a =>
      a._status !== 'deleted'
    ) || [];

    if (activeAnnualItems.length > 0) {
      activeAnnualItems.forEach((annual, index) => {
        if ((annual.year_amount || 0) <= 0) {
          errors.push(`${prefix} 年度業績設定 ${index + 1}: 業績金額必須大於0`);
        }

        const rateValidation = this.validateCommissionRate(annual.extra_rate || 0);
        if (!rateValidation.isValid) {
          errors.push(`${prefix} 年度業績設定 ${index + 1}: ${rateValidation.errors[0]}`);
        }

        const dateValidation = this.validateDateRange(annual.tlt_bdate, annual.tlt_edate);
        if (!dateValidation.isValid) {
          errors.push(`${prefix} 年度業績設定 ${index + 1}: ${dateValidation.errors[0]}`);
        }
      });
    }

    // 檢查層級抽成設定
    const activeLevelItems = item.discountLevelItems?.filter(l =>
      l._status !== 'deleted' && l.selected
    ) || [];

    if (activeLevelItems.length > 0) {
      activeLevelItems.forEach((level, index) => {
        if (!level.cag_barcode) {
          errors.push(`${prefix} 層級抽成設定 ${index + 1}: 請選擇折扣別`);
        }

        const bmount = level.level_bmount || 0;
        const eamount = level.level_eamount || 0;

        if (bmount < 0 || eamount < 0) {
          errors.push(`${prefix} 層級抽成設定 ${index + 1}: 業績計算金額不能為負數`);
        }

        if (bmount >= eamount) {
          errors.push(`${prefix} 層級抽成設定 ${index + 1}: 起始金額必須小於結束金額`);
        }

        const rateValidation = this.validateCommissionRate(level.level_charge_rate || 0);
        if (!rateValidation.isValid) {
          errors.push(`${prefix} 層級抽成設定 ${index + 1}: ${rateValidation.errors[0]}`);
        }
      });
    }
  }
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

  /**
 * 驗證年度業績項目的日期區間是否重疊
 */
  validateAnnualDateRanges(annualItems: AnnualPerformanceItem[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 過濾出未刪除的項目
    const activeItems = annualItems.filter(item => item._status !== 'deleted');

    if (activeItems.length <= 1) {
      return { isValid: true, errors: [] };
    }

    // 排序項目以便檢查
    const sortedItems = activeItems.sort((a, b) => {
      const dateA = new Date(a.tlt_bdate);
      const dateB = new Date(b.tlt_bdate);
      return dateA.getTime() - dateB.getTime();
    });

    // 檢查相鄰項目是否重疊
    for (let i = 0; i < sortedItems.length - 1; i++) {
      const currentItem = sortedItems[i];
      const nextItem = sortedItems[i + 1];

      const currentStart = new Date(currentItem.tlt_bdate);
      const currentEnd = new Date(currentItem.tlt_edate);
      const nextStart = new Date(nextItem.tlt_bdate);
      const nextEnd = new Date(nextItem.tlt_edate);

      // 檢查日期有效性
      if (isNaN(currentStart.getTime()) || isNaN(currentEnd.getTime()) ||
        isNaN(nextStart.getTime()) || isNaN(nextEnd.getTime())) {
        errors.push('存在無效的日期格式');
        continue;
      }

      // 檢查每個項目內部的日期邏輯
      if (currentStart >= currentEnd) {
        errors.push(`年度業績項目 ${i + 1}: 起始日期必須早於結束日期`);
      }

      if (nextStart >= nextEnd) {
        errors.push(`年度業績項目 ${i + 2}: 起始日期必須早於結束日期`);
      }

      // 檢查重疊：如果當前項目的結束日期 >= 下一個項目的開始日期，就是重疊
      if (currentEnd >= nextStart) {
        errors.push(
          `年度業績項目 ${i + 1} (${this.formatDate(currentStart)} ~ ${this.formatDate(currentEnd)}) ` +
          `與項目 ${i + 2} (${this.formatDate(nextStart)} ~ ${this.formatDate(nextEnd)}) 日期區間重疊`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 檢查新增/修改的年度業績項目是否與現有項目重疊
   */
  validateSingleAnnualItemOverlap(
    newItem: AnnualPerformanceItem,
    existingItems: AnnualPerformanceItem[],
    excludeItemId?: string
  ): ValidationResult {
    const errors: string[] = [];

    const newStart = new Date(newItem.tlt_bdate);
    const newEnd = new Date(newItem.tlt_edate);

    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
      errors.push('日期格式錯誤');
      return { isValid: false, errors };
    }

    if (newStart >= newEnd) {
      errors.push('起始日期必須早於結束日期');
      return { isValid: false, errors };
    }

    // 檢查與其他項目的重疊
    const otherItems = existingItems.filter(item =>
      item._status !== 'deleted' &&
      item.id !== excludeItemId
    );

    for (const otherItem of otherItems) {
      const otherStart = new Date(otherItem.tlt_bdate);
      const otherEnd = new Date(otherItem.tlt_edate);

      if (isNaN(otherStart.getTime()) || isNaN(otherEnd.getTime())) {
        continue; // 跳過無效日期的項目
      }

      // 檢查是否重疊：新項目的開始時間 < 其他項目的結束時間 AND 其他項目的開始時間 < 新項目的結束時間
      if (newStart < otherEnd && otherStart < newEnd) {
        errors.push(
          `日期區間 (${this.formatDate(newStart)} ~ ${this.formatDate(newEnd)}) ` +
          `與現有項目 (${this.formatDate(otherStart)} ~ ${this.formatDate(otherEnd)}) 重疊`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 格式化日期顯示
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }


  /**
 * 驗證折扣設定項目的日期是否重疊（同一折扣別）
 */
  validateDiscountDateOverlap(discountItems: DiscountSettingItem[]): ValidationResult {
    const errors: string[] = [];

    // 過濾出未刪除的項目
    const activeItems = discountItems.filter(item => item._status !== 'deleted');

    // 按折扣別分組
    const groupedByDiscount = this.groupDiscountItemsByType(activeItems);

    // 檢查每個折扣別內部是否有日期重疊
    Object.entries(groupedByDiscount).forEach(([discountType, items]) => {
      if (items.length <= 1) return;

      // 按起始日期排序
      const sortedItems = items.sort((a, b) => {
        const dateA = new Date(a.tlt_bdate || new Date());
        const dateB = new Date(b.tlt_bdate || new Date());
        return dateA.getTime() - dateB.getTime();
      });

      // 檢查相鄰項目是否重疊
      for (let i = 0; i < sortedItems.length - 1; i++) {
        const currentItem = sortedItems[i];
        const nextItem = sortedItems[i + 1];

        const currentStart = new Date(currentItem.tlt_bdate || new Date());
        const currentEnd = new Date(currentItem.tlt_edate || new Date());
        const nextStart = new Date(nextItem.tlt_bdate || new Date());
        const nextEnd = new Date(nextItem.tlt_edate || new Date());

        // 檢查日期有效性
        if (isNaN(currentStart.getTime()) || isNaN(currentEnd.getTime()) ||
          isNaN(nextStart.getTime()) || isNaN(nextEnd.getTime())) {
          errors.push(`${discountType} 存在無效的日期格式`);
          continue;
        }

        // 檢查重疊：如果當前項目的終止日期 >= 下一個項目的起始日期，就是重疊
        if (currentEnd >= nextStart) {
          errors.push(
            `${discountType} 日期區間重疊: ` +
            `項目 ${i + 1} (${this.formatDate(currentStart)} ~ ${this.formatDate(currentEnd)}) ` +
            `與項目 ${i + 2} (${this.formatDate(nextStart)} ~ ${this.formatDate(nextEnd)})`
          );

          // 標記錯誤的項目ID
          currentItem._hasDateOverlapError = true;
          nextItem._hasDateOverlapError = true;
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 按折扣別分組項目
   */
  private groupDiscountItemsByType(items: DiscountSettingItem[]): { [discountType: string]: DiscountSettingItem[] } {
    return items.reduce((groups, item) => {
      const discountType = item.cag_barcode || '未設定';
      if (!groups[discountType]) {
        groups[discountType] = [];
      }
      groups[discountType].push(item);
      return groups;
    }, {} as { [discountType: string]: DiscountSettingItem[] });
  }
}
