/**
 * 代扣款驗證服務
 */
import { Injectable } from '@angular/core';
import { FareItem } from '../../core/models/deduction';
import {
  createEmptyResult,
  DetailedValidationResult
} from './validation-result.interface';

@Injectable({
  providedIn: 'root'
})
export class DeductionValidatorService {

  /**
   * 驗證代扣款資料
   */
  validate(items: FareItem[] | null): DetailedValidationResult {
    const result = createEmptyResult();

    if (!items || items.length === 0) {
      // 代扣款可以為空，只給警告
      result.warnings.push('尚未設定代扣款項目');
      return result;
    }

    // 驗證已選取的項目
    const selectedItems = items.filter(item => item.is_selected);

    if (selectedItems.length === 0) {
      result.warnings.push('尚未選擇任何代扣款項目');
      return result;
    }

    // 驗證每個已選取的項目
    selectedItems.forEach((item, index) => {
      this.validateItem(item, index, result);
    });

    return result;
  }

  /**
   * 驗證單一代扣款項目
   */
  private validateItem(
    item: FareItem,
    index: number,
    result: DetailedValidationResult
  ): void {
    const itemLabel = item.cap_name || `項目 ${index + 1}`;

    // 驗證金額
    if (item.tpy_amount !== undefined && item.tpy_amount !== null) {
      if (typeof item.tpy_amount === 'number' && item.tpy_amount < 0) {
        result.isValid = false;
        result.errors.push(`${itemLabel}: 金額不能為負數`);
        result.fieldErrors.push({
          field: `items[${index}].tpy_amount`,
          message: '金額不能為負數'
        });
      }
    }

    // 驗證費率
    if (item.tpy_rate !== undefined && item.tpy_rate !== null) {
      const rate = Number(item.tpy_rate);
      if (!isNaN(rate) && (rate < 0 || rate > 100)) {
        result.warnings.push(`${itemLabel}: 費率建議在 0-100% 之間`);
      }
    }

    // 驗證日期
    if (item.tpy_bdate && item.tpy_edate) {
      const startDate = String(item.tpy_bdate);
      const endDate = String(item.tpy_edate);
      if (startDate > endDate) {
        result.isValid = false;
        result.errors.push(`${itemLabel}: 結束日期必須晚於起始日期`);
        result.fieldErrors.push({
          field: `items[${index}].tpy_edate`,
          message: '結束日期必須晚於起始日期'
        });
      }
    }
  }

  /**
   * 檢查是否有已選取的項目
   */
  hasSelectedItems(items: FareItem[] | null): boolean {
    if (!items) return false;
    return items.some(item => item.is_selected);
  }

  /**
   * 取得已選取項目數量
   */
  getSelectedCount(items: FareItem[] | null): number {
    if (!items) return 0;
    return items.filter(item => item.is_selected).length;
  }
}
