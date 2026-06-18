/**
 * 合約基本資料驗證服務
 */
import { Injectable } from '@angular/core';
import { ContractInfo } from '../../core/models/contract';
import {
  createEmptyResult,
  DetailedValidationResult
} from './validation-result.interface';

@Injectable({
  providedIn: 'root'
})
export class ContractValidatorService {

  /**
   * 驗證合約基本資料
   */
  validate(data: ContractInfo | null, isEditMode: boolean = false): DetailedValidationResult {
    const result = createEmptyResult();

    if (!data) {
      result.isValid = false;
      result.errors.push('缺少合約基本資料');
      return result;
    }

    // 編輯模式必須有 talent_id
    if (isEditMode && !data.talent_id) {
      this.addFieldError(result, 'talent_id', '編輯模式必須有合約ID');
    }

    // 品牌名稱必填
    if (!data.tlt_name?.trim()) {
      this.addFieldError(result, 'tlt_name', '品牌名稱不能為空');
    }

    // 驗證日期
    this.validateDates(data, result);

    // 驗證組織
    if (!data.org_id) {
      result.warnings.push('建議選擇組織');
    }

    // 驗證廠商
    if (!data.ven_no) {
      this.addFieldError(result, 'ven_no', '請選擇廠商');
    }

    // 驗證抽成類型
    if (!data.tlt_term_type) {
      this.addFieldError(result, 'tlt_term_type', '請選擇抽成類型');
    }

    return result;
  }

  /**
   * 驗證日期欄位
   */
  private validateDates(data: ContractInfo, result: DetailedValidationResult): void {
    // 合約起始日
    if (!data.tlt_bdate) {
      this.addFieldError(result, 'tlt_bdate', '合約起始日不能為空');
    }

    // 合約結束日
    if (!data.tlt_edate) {
      this.addFieldError(result, 'tlt_edate', '合約結束日不能為空');
    }

    // 日期順序檢查
    if (data.tlt_bdate && data.tlt_edate) {
      const startDate = new Date(data.tlt_bdate);
      const endDate = new Date(data.tlt_edate);

      if (startDate > endDate) {
        this.addFieldError(result, 'tlt_edate', '合約結束日必須晚於起始日');
      }
    }
  }

  /**
   * 快速驗證必填欄位
   */
  validateRequired(data: ContractInfo | null): boolean {
    if (!data) return false;

    return !!(
      data.tlt_name?.trim() &&
      data.tlt_bdate &&
      data.tlt_edate &&
      data.ven_no &&
      data.tlt_term_type
    );
  }

  /**
   * 新增欄位錯誤
   */
  private addFieldError(
    result: DetailedValidationResult,
    field: string,
    message: string
  ): void {
    result.isValid = false;
    result.errors.push(message);
    result.fieldErrors.push({ field, message });
  }
}
