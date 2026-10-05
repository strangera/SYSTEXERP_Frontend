/**
 * 合約日期驗證工具
 *
 * 提供通用的日期驗證功能,適用於 TLS13010 和 TLS12040
 */

export interface ContractDateRange {
  /** 合約起始日 */
  tlt_bdate: Date | string | null;
  /** 合約終止日 */
  tlt_edate: Date | string | null;
}

export interface DateValidationResult {
  /** 是否通過驗證 */
  isValid: boolean;
  /** 錯誤訊息 */
  errorMessage?: string;
}

/**
 * 合約日期驗證器
 */
export class ContractDateValidator {

  /**
   * 驗證單一日期是否在合約期間內
   *
   * @param date 要驗證的日期
   * @param contractRange 合約日期範圍
   * @param fieldLabel 欄位標籤(用於錯誤訊息)
   * @returns 驗證結果
   */
  static validateDateInContractRange(
    date: Date | string | null,
    contractRange: ContractDateRange,
    fieldLabel: string = '日期'
  ): DateValidationResult {
    // 如果日期為空,視為通過(必填驗證應由其他機制處理)
    if (!date) {
      return { isValid: true };
    }

    // 如果合約日期範圍不完整,無法驗證
    if (!contractRange.tlt_bdate || !contractRange.tlt_edate) {
      console.warn('⚠️ 合約日期範圍不完整,無法進行日期驗證');
      return { isValid: true };
    }

    const targetDate = this.parseDate(date);
    const contractStart = this.parseDate(contractRange.tlt_bdate);
    const contractEnd = this.parseDate(contractRange.tlt_edate);

    // 如果任何日期無效,無法驗證
    if (!targetDate || !contractStart || !contractEnd) {
      console.warn('⚠️ 日期格式無效,無法進行驗證');
      return { isValid: true };
    }

    // 只比較年月(忽略日)
    const targetYM = this.getYearMonth(targetDate);
    const startYM = this.getYearMonth(contractStart);
    const endYM = this.getYearMonth(contractEnd);

    const isValid = targetYM >= startYM && targetYM <= endYM;

    if (!isValid) {
      const startStr = this.formatYearMonth(contractStart);
      const endStr = this.formatYearMonth(contractEnd);
      const targetStr = this.formatYearMonth(targetDate);

      return {
        isValid: false,
        errorMessage: `${fieldLabel}(${targetStr})必須在合約期間內(${startStr} ~ ${endStr})`
      };
    }

    return { isValid: true };
  }

  /**
   * 驗證日期範圍是否在合約期間內
   *
   * @param startDate 起始日期
   * @param endDate 結束日期
   * @param contractRange 合約日期範圍
   * @param startFieldLabel 起始日期欄位標籤
   * @param endFieldLabel 結束日期欄位標籤
   * @returns 驗證結果
   */
  static validateDateRangeInContract(
    startDate: Date | string | null,
    endDate: Date | string | null,
    contractRange: ContractDateRange,
    startFieldLabel: string = '起始日期',
    endFieldLabel: string = '結束日期'
  ): DateValidationResult {
    // 驗證起始日期
    const startResult = this.validateDateInContractRange(
      startDate,
      contractRange,
      startFieldLabel
    );

    if (!startResult.isValid) {
      return startResult;
    }

    // 驗證結束日期
    const endResult = this.validateDateInContractRange(
      endDate,
      contractRange,
      endFieldLabel
    );

    if (!endResult.isValid) {
      return endResult;
    }

    // 驗證起始日期 <= 結束日期
    if (startDate && endDate) {
      const start = this.parseDate(startDate);
      const end = this.parseDate(endDate);

      if (start && end) {
        const startYM = this.getYearMonth(start);
        const endYM = this.getYearMonth(end);

        if (startYM > endYM) {
          return {
            isValid: false,
            errorMessage: `${startFieldLabel}不可大於${endFieldLabel}`
          };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * 驗證扣款項目的日期是否在合約期間內
   * 用於 TLS13010 和 TLS12040 的扣款項目驗證
   *
   * @param fareItem 扣款項目
   * @param contractRange 合約日期範圍
   * @param capType 扣款類型(A/B/C/D/E)
   * @returns 驗證結果
   */
  static validateFareItemDates(
    fareItem: any,
    contractRange: ContractDateRange,
    capType: string
  ): DateValidationResult {
    const capTypeName = this.getCapTypeName(capType);
    const itemLabel = `${capTypeName}(${fareItem.cap_item || fareItem.cap_name || '未命名'})`;

    // A類型:只驗證 tpy_bdate(因為 tpy_edate 會自動等於 tpy_bdate)
    if (capType === 'A') {
      return this.validateDateInContractRange(
        fareItem.tpy_bdate,
        contractRange,
        `${itemLabel}的起始年月`
      );
    }

    // B/C/D/E類型:驗證 tpy_bdate 和 tpy_edate
    return this.validateDateRangeInContract(
      fareItem.tpy_bdate,
      fareItem.tpy_edate,
      contractRange,
      `${itemLabel}的起始年月`,
      `${itemLabel}的結束年月`
    );
  }

  // ========== 私有輔助方法 ==========

  /**
   * 解析日期為 Date 物件
   */
  private static parseDate(date: Date | string | null): Date | null {
    if (!date) return null;

    try {
      if (date instanceof Date) {
        return isNaN(date.getTime()) ? null : date;
      }

      if (typeof date === 'string') {
        // 處理 YYYYMM 格式
        if (/^\d{6}$/.test(date)) {
          const year = parseInt(date.substring(0, 4));
          const month = parseInt(date.substring(4, 6)) - 1;
          return new Date(year, month, 1);
        }

        // 處理 YYYYMMDD 格式
        if (/^\d{8}$/.test(date)) {
          const year = parseInt(date.substring(0, 4));
          const month = parseInt(date.substring(4, 6)) - 1;
          const day = parseInt(date.substring(6, 8));
          return new Date(year, month, day);
        }

        // 處理 ISO 日期格式
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? null : parsed;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * 取得年月數值(用於比較)
   * 格式: YYYYMM
   */
  private static getYearMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return year * 100 + month;
  }

  /**
   * 格式化年月為字串
   * 格式: YYYY/MM
   */
  private static formatYearMonth(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
  }

  /**
   * 取得扣款類型名稱
   */
  private static getCapTypeName(capType: string): string {
    const typeNames: { [key: string]: string } = {
      'A': '一次扣款',
      'B': '每月扣款',
      'C': '平均分攤',
      'D': '比率分攤'
    };
    return typeNames[capType] || capType;
  }
}
