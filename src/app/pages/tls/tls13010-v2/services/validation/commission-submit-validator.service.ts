/**
 * 抽成提交驗證服務
 * 負責提交前的完整驗證
 */
import { Injectable, inject } from '@angular/core';
import { CommissionItem, DiscountSettingItem } from '../../core/models/commission';
import { CommissionDateValidatorService } from './commission-date-validator.service';
import { CommissionSyncService } from '../commission/commission-sync.service';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SubmitValidationResult {
  hasErrors: boolean;
  errorSummary: string;
  errorItems: Array<{ itemIndex: number; field: string; message: string }>;
}

@Injectable({ providedIn: 'root' })
export class CommissionSubmitValidatorService {
  private dateValidator = inject(CommissionDateValidatorService);
  private syncService = inject(CommissionSyncService);

  /**
   * 驗證所有抽成資料
   */
  validateAllData(
    commissionData: CommissionItem[],
    contractStartDate: string,
    contractEndDate: string
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const activeItems = commissionData.filter(item => item._status !== 'deleted');

    if (activeItems.length === 0) {
      result.warnings.push('尚未設定任何抽成項目');
      return result;
    }

    activeItems.forEach((item, index) => {
      const itemErrors = this.validateCommissionItem(
        item,
        index,
        contractStartDate,
        contractEndDate
      );
      result.errors.push(...itemErrors);
    });

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * 提交前驗證所有日期欄位
   */
  validateAllDatesBeforeSubmit(
    commissionData: CommissionItem[],
    contractStartDate: string,
    contractEndDate: string
  ): SubmitValidationResult {
    const result: SubmitValidationResult = {
      hasErrors: false,
      errorSummary: '',
      errorItems: []
    };

    const errorMessages: string[] = [];

    commissionData.forEach((commissionItem, itemIndex) => {
      if (commissionItem._status === 'deleted') return;

      // 驗證折扣設定日期
      commissionItem.discountSettingItems?.forEach((discount, discountIndex) => {
        if (discount._status === 'deleted' || !discount.selected) return;

        const dateErrors = this.validateDiscountDates(
          discount,
          contractStartDate,
          contractEndDate
        );

        dateErrors.forEach(error => {
          result.errorItems.push({
            itemIndex,
            field: `discount[${discountIndex}]`,
            message: error
          });
          discount._hasValidationError = true;
        });

        if (dateErrors.length > 0) {
          errorMessages.push(`抽成項目${itemIndex + 1}的折扣設定有日期錯誤`);
        }
      });

      // 檢查折扣設定日期重疊
      const selectedDiscounts = commissionItem.discountSettingItems?.filter(
        d => d.selected && d._status !== 'deleted'
      ) || [];

      const overlapResult = this.dateValidator.checkDateOverlap(selectedDiscounts);
      if (overlapResult.hasOverlap) {
        overlapResult.overlappingPairs.forEach(pair => {
          const d1 = selectedDiscounts[pair.index1];
          const d2 = selectedDiscounts[pair.index2];
          d1._hasDateOverlapError = true;
          d2._hasDateOverlapError = true;
        });
        errorMessages.push(`抽成項目${itemIndex + 1}的折扣設定日期有重疊`);
      }

      // 驗證年度業績日期
      commissionItem.annualPerformanceItems?.forEach((annual, annualIndex) => {
        if (annual._status === 'deleted') return;

        if (!this.dateValidator.validateDateWithinContract(
          annual.tlt_bdate, contractStartDate, contractEndDate
        )) {
          result.errorItems.push({
            itemIndex,
            field: `annual[${annualIndex}].tlt_bdate`,
            message: '帳務起始日超出合約期間'
          });
          annual._hasValidationError = true;
        }

        if (!this.dateValidator.validateDateWithinContract(
          annual.tlt_edate, contractStartDate, contractEndDate
        )) {
          result.errorItems.push({
            itemIndex,
            field: `annual[${annualIndex}].tlt_edate`,
            message: '帳務結束日超出合約期間'
          });
          annual._hasValidationError = true;
        }
      });
    });

    result.hasErrors = result.errorItems.length > 0;
    result.errorSummary = [...new Set(errorMessages)].join('；');

    return result;
  }

  /**
   * 確保所有已勾選的 discount 都有對應的 level 項目
   */
  ensureAllDiscountsHaveLevels(commissionData: CommissionItem[]): void {
    commissionData.forEach(commissionItem => {
      if (commissionItem._status === 'deleted') return;

      commissionItem.discountSettingItems?.forEach(discount => {
        if (!discount.selected || discount._status === 'deleted') return;

        const existingLevels = commissionItem.discountLevelItems?.filter(
          level => level.charged_id === discount.id && level._status !== 'deleted'
        ) || [];

        if (existingLevels.length === 0) {
          this.syncService.syncDiscountLevelBasedOnSelection(commissionItem, discount);
        }
      });
    });
  }

  // ========== 私有方法 ==========

  private validateCommissionItem(
    item: CommissionItem,
    index: number,
    contractStartDate: string,
    contractEndDate: string
  ): string[] {
    const errors: string[] = [];
    const itemLabel = `抽成項目${index + 1}`;

    // 驗證必填欄位
    if (!item.tlt_id_desc) {
      errors.push(`${itemLabel}: 請填寫抽成類別名稱`);
    }

    // 驗證折扣設定
    const selectedDiscounts = item.discountSettingItems?.filter(
      d => d.selected && d._status !== 'deleted'
    ) || [];

    if (selectedDiscounts.length === 0) {
      errors.push(`${itemLabel}: 請至少勾選一個折扣設定`);
    }

    selectedDiscounts.forEach((discount, i) => {
      const discountErrors = this.validateDiscountDates(
        discount,
        contractStartDate,
        contractEndDate
      );
      discountErrors.forEach(error => {
        errors.push(`${itemLabel} 折扣${i + 1}: ${error}`);
      });
    });

    return errors;
  }

  private validateDiscountDates(
    discount: DiscountSettingItem,
    contractStartDate: string,
    contractEndDate: string
  ): string[] {
    const errors: string[] = [];

    if (!discount.tlt_bdate) {
      errors.push('請填寫合約起始日');
    } else if (!this.dateValidator.validateDateWithinContract(
      discount.tlt_bdate, contractStartDate, contractEndDate
    )) {
      errors.push('合約起始日超出合約期間');
    }

    if (!discount.tlt_edate) {
      errors.push('請填寫合約終止日');
    } else if (!this.dateValidator.validateDateWithinContract(
      discount.tlt_edate, contractStartDate, contractEndDate
    )) {
      errors.push('合約終止日超出合約期間');
    }

    if (discount.tlt_bdate && discount.tlt_edate) {
      if (!this.dateValidator.validateDateRange(discount.tlt_bdate, discount.tlt_edate)) {
        errors.push('合約起始日不能大於終止日');
      }
    }

    return errors;
  }
}
