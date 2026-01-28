/**
 * 條件設定驗證服務
 */
import { Injectable } from '@angular/core';
import { CommissionType, CommissionTypeLabels } from '../../core/constants';
import { ConditionItem } from '../../core/models/condition';
import {
  isBaseRentHigherCondition,
  isBaseTierCondition,
  isFixedRentCondition,
  isGraduatedCommissionCondition,
  isBaseCommissionCondition
} from '../../core/type-guards';
import {
  createEmptyResult,
  DetailedValidationResult
} from './validation-result.interface';

@Injectable({
  providedIn: 'root'
})
export class ConditionValidatorService {

  /**
   * 驗證條件設定資料
   */
  validate(
    items: ConditionItem[] | null,
    commissionType: CommissionType | string
  ): DetailedValidationResult {
    const result = createEmptyResult();

    // 一般抽成類型不需要條件設定
    if (commissionType === CommissionType.GENERAL_COMMISSION) {
      return result;
    }

    if (!items || items.length === 0) {
      // 非一般抽成類型應該要有條件設定
      const typeName = CommissionTypeLabels[commissionType as CommissionType] || commissionType;
      result.warnings.push(`抽成類型「${typeName}」建議設定對應的條件`);
      return result;
    }

    // 根據抽成類型驗證對應的條件
    items.forEach((item, index) => {
      this.validateItemByType(item, index, commissionType, result);
    });

    return result;
  }

  /**
   * 根據類型驗證條件項目
   */
  private validateItemByType(
    item: ConditionItem,
    index: number,
    commissionType: CommissionType | string,
    result: DetailedValidationResult
  ): void {
    const itemLabel = `條件項目 ${index + 1}`;

    switch (commissionType) {
      case CommissionType.FIXED_RENT:
        if (isFixedRentCondition(item)) {
          this.validateFixedRentCondition(item, itemLabel, result);
        }
        break;

      case CommissionType.BASE_RENT_HIGHER:
        if (isBaseRentHigherCondition(item)) {
          this.validateBaseRentCondition(item, itemLabel, result);
        }
        break;

      case CommissionType.BASE_COMMISSION:
        if (isBaseCommissionCondition(item)) {
          this.validatePackageBaseCondition(item, itemLabel, result);
        }
        break;

      case CommissionType.GRADUATED:
        if (isGraduatedCommissionCondition(item)) {
          this.validateGraduatedCondition(item, itemLabel, result);
        }
        break;

      case CommissionType.BASE_TIER:
        if (isBaseTierCondition(item)) {
          this.validateBaseTierCondition(item, itemLabel, result);
        }
        break;
    }
  }

  /**
   * 驗證固定租金條件
   */
  private validateFixedRentCondition(
    item: any,
    label: string,
    result: DetailedValidationResult
  ): void {
    if (item.base_rent === undefined || item.base_rent === null) {
      result.warnings.push(`${label}: 建議設定基本租金`);
    } else if (Number(item.base_rent) < 0) {
      result.isValid = false;
      result.errors.push(`${label}: 基本租金不能為負數`);
    }
  }

  /**
   * 驗證底租抽成取高者條件
   */
  private validateBaseRentCondition(
    item: any,
    label: string,
    result: DetailedValidationResult
  ): void {
    // 驗證抽成比率
    if (item.cag_charge_rate !== undefined && item.cag_charge_rate !== null) {
      const rate = Number(item.cag_charge_rate);
      if (rate < 0 || rate > 100) {
        result.warnings.push(`${label}: 抽成比率建議在 0-100% 之間`);
      }
    }

    // 驗證基本租金
    if (item.base_rent !== undefined && Number(item.base_rent) < 0) {
      result.isValid = false;
      result.errors.push(`${label}: 基本租金不能為負數`);
    }
  }

  /**
   * 驗證包底抽成條件
   */
  private validatePackageBaseCondition(
    item: any,
    label: string,
    result: DetailedValidationResult
  ): void {
    // 驗證包底金額
    if (item.package_base !== undefined && Number(item.package_base) < 0) {
      result.isValid = false;
      result.errors.push(`${label}: 包底金額不能為負數`);
    }

    // 驗證抽成比率
    if (item.cag_charge_rate !== undefined) {
      const rate = Number(item.cag_charge_rate);
      if (rate < 0 || rate > 100) {
        result.warnings.push(`${label}: 抽成比率建議在 0-100% 之間`);
      }
    }
  }

  /**
   * 驗證層級抽成條件
   */
  private validateGraduatedCondition(
    item: any,
    label: string,
    result: DetailedValidationResult
  ): void {
    // 驗證序號
    if (item.seq_no === undefined || item.seq_no === null) {
      result.warnings.push(`${label}: 建議設定層級序號`);
    }

    // 驗證起始金額和結束金額
    if (item.start_number !== undefined && item.end_number !== undefined) {
      const start = Number(item.start_number);
      const end = Number(item.end_number);
      if (start > end) {
        result.isValid = false;
        result.errors.push(`${label}: 結束金額必須大於等於起始金額`);
      }
    }

    // 驗證抽成比率
    if (item.charge_rate !== undefined) {
      const rate = Number(item.charge_rate);
      if (rate < 0 || rate > 100) {
        result.warnings.push(`${label}: 抽成比率建議在 0-100% 之間`);
      }
    }
  }

  /**
   * 驗證包底加層級條件
   */
  private validateBaseTierCondition(
    item: any,
    label: string,
    result: DetailedValidationResult
  ): void {
    // 同時驗證包底和層級的規則
    this.validatePackageBaseCondition(item, label, result);
    this.validateGraduatedCondition(item, label, result);
  }

  /**
   * 根據抽成類型檢查是否需要條件設定
   */
  requiresConditionSetup(commissionType: CommissionType | string): boolean {
    return commissionType !== CommissionType.GENERAL_COMMISSION;
  }

  /**
   * 取得抽成類型對應的條件說明
   */
  getConditionDescription(commissionType: CommissionType | string): string {
    const descriptions: Record<string, string> = {
      [CommissionType.FIXED_RENT]: '設定固定租金金額',
      [CommissionType.BASE_RENT_HIGHER]: '設定底租金額和抽成比率，取兩者較高者',
      [CommissionType.GENERAL_COMMISSION]: '依抽成設定頁面的比率計算',
      [CommissionType.BASE_COMMISSION]: '設定包底金額和超過部分的抽成比率',
      [CommissionType.GRADUATED]: '設定不同業績區間的抽成比率',
      [CommissionType.BASE_TIER]: '結合包底金額和層級抽成'
    };

    return descriptions[commissionType] || '';
  }
}
