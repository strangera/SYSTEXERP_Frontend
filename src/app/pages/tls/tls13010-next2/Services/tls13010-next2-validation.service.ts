import { CommissionItem } from './../../tls13010/tls13010.model';
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

    // 詳細設定檢查
    this.validateDetailSettings(item, prefix, errors, warnings);
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
}
