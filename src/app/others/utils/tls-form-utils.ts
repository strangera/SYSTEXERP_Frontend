// shared/utils/tls-form-utils.ts
import { FormGroup } from '@angular/forms';

/**
 * TLS 模組共用表單工具類別
 *
 * 提供 TLS13010 和 TLS12040 共用的表單處理函數
 *
 * @example
 * ```typescript
 * import { TLSFormUtils } from '@others/utils/tls-form-utils';
 *
 * const today = TLSFormUtils.getTodayDate();
 * const futureDate = TLSFormUtils.getTodayDate(15); // 今天+15天
 * ```
 */
export class TLSFormUtils {
  /**
   * 取得今天的日期字串 (YYYY-MM-DD)
   * @param daysToAdd 要加的天數（可為負數），預設為 0
   * @returns 格式化的日期字串
   *
   * @example
   * ```typescript
   * TLSFormUtils.getTodayDate();     // "2025-12-08"
   * TLSFormUtils.getTodayDate(15);   // "2025-12-23"
   * TLSFormUtils.getTodayDate(-7);   // "2025-12-01"
   * ```
   */
  static getTodayDate(daysToAdd = 0): string {
    const date = new Date();
    if (daysToAdd !== 0) {
      date.setDate(date.getDate() + daysToAdd);
    }
    return this.formatDate(date);
  }

  /**
   * 格式化日期為 YYYY-MM-DD
   * @param date Date 物件
   * @returns 格式化的日期字串
   */
  static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 檢查必填欄位是否都已填寫
   * @param form FormGroup 實例
   * @param fields 要檢查的欄位名稱陣列
   * @returns 檢查結果 { isValid: boolean, missingFields: string[] }
   *
   * @example
   * ```typescript
   * const result = TLSFormUtils.checkRequiredFields(
   *   this.dataForm,
   *   ['talent_id', 'tlt_no', 'tlt_name']
   * );
   *
   * if (!result.isValid) {
   *   console.log('缺少欄位:', result.missingFields);
   * }
   * ```
   */
  static checkRequiredFields(
    form: FormGroup,
    fields: string[]
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    for (const fieldName of fields) {
      const control = form.get(fieldName);
      const value = control?.value;

      if (value === null || value === undefined || value === '') {
        missingFields.push(fieldName);
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * 取得欄位的顯示名稱
   * @param fieldName 欄位名稱
   * @param customMap 自訂對照表（選填）
   * @returns 欄位顯示名稱
   *
   * @example
   * ```typescript
   * TLSFormUtils.getFieldDisplayName('talent_id'); // "專櫃編號"
   * TLSFormUtils.getFieldDisplayName('custom_field', { custom_field: '自訂欄位' }); // "自訂欄位"
   * ```
   */
  static getFieldDisplayName(
    fieldName: string,
    customMap?: Record<string, string>
  ): string {
    // 如果有提供自訂對照表，優先使用
    if (customMap && customMap[fieldName]) {
      return customMap[fieldName];
    }

    // 預設欄位名稱對照表
    const defaultFieldNames: Record<string, string> = {
      // 基本資料
      'talent_id': '專櫃編號',
      'apply_no': '招募編號',
      'tlt_no': '櫃位編號',
      'tlt_name': '櫃位名稱',
      'ven_no': '廠商編號',
      'vendor_ven_no': '廠商統編',
      'VEN_Name': '廠商名稱',

      // 日期相關
      'tlt_bdate': '契約起始日',
      'tlt_edate': '契約截止日',
      'tlt_contract_bdate': '營運起始日',
      'tlt_contract_edate': '營運截止日',
      'feedback_date': '回函日期',
      'due_date': '回函截止日',
      'contact_Date': '洽談日期',

      // 抽成設定
      'tlt_term_type': '抽成別',
      'tlt_ctype_mtotal': '包底類別',
      'overall_status': '超出部份處理方式',
      'base_rent': '固定租金',
      'rent_ahead': '預收租金',
      'comm_yn': '是否為抽成',

      // 付款資訊
      'paytype': '付款方式',
      'CHECK_TITLE': '票據抬頭',
      'bank_id': '銀行代號',
      'vendor_acct_name': '帳戶名稱',
      'vendor_acct_no': '銀行帳號',

      // 保證金
      'open_deposit': '準時開業保證金付款方式',
      'open_fees': '準時開業保證金',
      'construct_deposit': '施工保證金付款方式',
      'construct_fees': '施工保證金',
      'expiration_deposit': '合約屆滿保證金付款方式',
      'expiration_fees': '合約屆滿保證金',

      // 其他
      'contact_USR_No': '洽談者',
      'vip_yn': '配合會員卡',
      'credit_card': '會員卡折數'
    };

    return defaultFieldNames[fieldName] || fieldName;
  }

  /**
   * 檢查欄位值是否有效（不為空、null 或 undefined）
   * @param value 要檢查的值
   * @returns 是否有效
   */
  static isValidValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  /**
   * 安全地取得表單控制項的值
   * @param form FormGroup 實例
   * @param fieldName 欄位名稱
   * @param defaultValue 預設值（如果欄位不存在或無值）
   * @returns 欄位值或預設值
   */
  static getFormValue<T = any>(
    form: FormGroup,
    fieldName: string,
    defaultValue: T | null = null
  ): T | null {
    const control = form.get(fieldName);
    if (!control) {
      return defaultValue;
    }

    const value = control.value;
    return this.isValidValue(value) ? value : defaultValue;
  }

  /**
   * 設定表單日期自動填充
   * @param form FormGroup 實例
   * @param config 設定物件
   *
   * @example
   * ```typescript
   * TLSFormUtils.setupDateAutoFill(this.dataForm, {
   *   feedbackDate: 'feedback_date',
   *   feedbackDeadline: 'due_date',
   *   daysToAdd: 15
   * });
   * ```
   */
  static setupDateAutoFill(
    form: FormGroup,
    config: {
      feedbackDate?: string;
      feedbackDeadline?: string;
      daysToAdd?: number;
    } = {}
  ): void {
    const {
      feedbackDate = 'feedback_date',
      feedbackDeadline = 'due_date',
      daysToAdd = 15
    } = config;

    const today = this.getTodayDate();
    const deadline = this.getTodayDate(daysToAdd);

    // 只在欄位為空時才設定
    if (!this.getFormValue(form, feedbackDate)) {
      form.patchValue({ [feedbackDate]: today }, { emitEvent: false });
    }

    if (!this.getFormValue(form, feedbackDeadline)) {
      form.patchValue({ [feedbackDeadline]: deadline }, { emitEvent: false });
    }
  }

  /**
   * 驗證日期範圍（結束日不得早於起始日）
   * @param startDate 起始日
   * @param endDate 結束日
   * @returns 是否有效
   */
  static validateDateRange(startDate: string | Date, endDate: string | Date): boolean {
    if (!startDate || !endDate) {
      return true; // 如果其中一個為空，不進行驗證
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return end >= start;
  }

  /**
   * 取得表單所有錯誤訊息
   * @param form FormGroup 實例
   * @returns 錯誤訊息陣列
   */
  static getAllFormErrors(form: FormGroup): string[] {
    const errors: string[] = [];

    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.errors) {
        const displayName = this.getFieldDisplayName(key);
        errors.push(`${displayName}: ${JSON.stringify(control.errors)}`);
      }
    });

    return errors;
  }

  /**
   * 清除表單特定欄位的值
   * @param form FormGroup 實例
   * @param fieldNames 要清除的欄位名稱陣列
   * @param emitEvent 是否觸發事件，預設為 false
   */
  static clearFormFields(
    form: FormGroup,
    fieldNames: string[],
    emitEvent = false
  ): void {
    const patchValue: Record<string, any> = {};

    fieldNames.forEach(fieldName => {
      if (form.get(fieldName)) {
        patchValue[fieldName] = null;
      }
    });

    if (Object.keys(patchValue).length > 0) {
      form.patchValue(patchValue, { emitEvent });
    }
  }

  /**
   * 計算兩個日期之間的天數差
   * @param startDate 起始日
   * @param endDate 結束日
   * @returns 天數差（結束日 - 起始日）
   */
  static getDaysDifference(startDate: string | Date, endDate: string | Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }
}
