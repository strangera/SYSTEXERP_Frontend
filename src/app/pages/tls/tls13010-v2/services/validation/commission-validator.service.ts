/**
 * 抽成設定驗證服務
 */
import { Injectable } from '@angular/core';
import { CommissionType, CommissionTypeLabels } from '../../core/constants';
import { CommissionItem } from '../../core/models/commission';
import {
  createEmptyResult,
  DetailedValidationResult
} from './validation-result.interface';

@Injectable({
  providedIn: 'root'
})
export class CommissionValidatorService {

  /**
   * 驗證抽成設定資料
   */
  validate(
    items: CommissionItem[] | null,
    commissionType: CommissionType | string
  ): DetailedValidationResult {
    const result = createEmptyResult();

    // 固定租金類型不需要抽成設定
    if (commissionType === CommissionType.FIXED_RENT) {
      return result;
    }

    if (!items || items.length === 0) {
      // 一般抽成以外的類型，抽成設定可以為空
      if (commissionType === CommissionType.GENERAL_COMMISSION) {
        result.warnings.push('一般抽成模式建議至少設定一個抽成項目');
      }
      return result;
    }

    // 驗證每個抽成項目
    items.forEach((item, index) => {
      this.validateItem(item, index, result);
    });

    // 驗證日期是否有重疊
    this.validateDateOverlap(items, result);

    return result;
  }

  /**
   * 驗證單一抽成項目
   */
  private validateItem(
    item: CommissionItem,
    index: number,
    result: DetailedValidationResult
  ): void {
    const itemLabel = `抽成項目 ${index + 1}`;

    // 驗證抽成比率
    if (item.charge_rate !== undefined && item.charge_rate !== null) {
      const rate = Number(item.charge_rate);
      if (isNaN(rate)) {
        result.isValid = false;
        result.errors.push(`${itemLabel}: 抽成比率格式不正確`);
      } else if (rate < 0 || rate > 100) {
        result.warnings.push(`${itemLabel}: 抽成比率建議在 0-100% 之間`);
      }
    }

    // 驗證起始日期
    if (!item.cag_bdate) {
      result.isValid = false;
      result.errors.push(`${itemLabel}: 起始日期不能為空`);
      result.fieldErrors.push({
        field: `items[${index}].cag_bdate`,
        message: '起始日期不能為空'
      });
    }

    // 驗證結束日期
    if (!item.cag_edate) {
      result.isValid = false;
      result.errors.push(`${itemLabel}: 結束日期不能為空`);
      result.fieldErrors.push({
        field: `items[${index}].cag_edate`,
        message: '結束日期不能為空'
      });
    }

    // 日期順序檢查
    if (item.cag_bdate && item.cag_edate) {
      const startDate = new Date(item.cag_bdate);
      const endDate = new Date(item.cag_edate);
      if (startDate > endDate) {
        result.isValid = false;
        result.errors.push(`${itemLabel}: 結束日期必須晚於起始日期`);
        result.fieldErrors.push({
          field: `items[${index}].cag_edate`,
          message: '結束日期必須晚於起始日期'
        });
      }
    }
  }

  /**
   * 驗證日期是否有重疊
   */
  private validateDateOverlap(
    items: CommissionItem[],
    result: DetailedValidationResult
  ): void {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const item1 = items[i];
        const item2 = items[j];

        if (this.hasDateOverlap(item1, item2)) {
          result.warnings.push(
            `抽成項目 ${i + 1} 和 ${j + 1} 的日期範圍有重疊`
          );
        }
      }
    }
  }

  /**
   * 檢查兩個項目的日期是否重疊
   */
  private hasDateOverlap(item1: CommissionItem, item2: CommissionItem): boolean {
    if (!item1.cag_bdate || !item1.cag_edate || !item2.cag_bdate || !item2.cag_edate) {
      return false;
    }

    const start1 = new Date(item1.cag_bdate).getTime();
    const end1 = new Date(item1.cag_edate).getTime();
    const start2 = new Date(item2.cag_bdate).getTime();
    const end2 = new Date(item2.cag_edate).getTime();

    return start1 <= end2 && end1 >= start2;
  }

  /**
   * 根據抽成類型檢查是否需要設定抽成
   */
  requiresCommissionSetup(commissionType: CommissionType | string): boolean {
    return commissionType !== CommissionType.FIXED_RENT;
  }

  /**
   * 取得抽成類型名稱
   */
  getCommissionTypeName(type: CommissionType | string): string {
    return CommissionTypeLabels[type as CommissionType] || `未知類型 (${type})`;
  }
}
