import { Injectable } from '@angular/core';
import { ConditionItem, FixedRentCondition, BaseRentHigherCondition, BaseCommissionCondition, GraduatedCommissionCondition, BaseTierCondition } from './../../tls13010/tls13010.model';

/**
 * 智能日期分段服務
 * 負責根據不同抽成類型的規則，自動計算新增項目的日期範圍
 */
@Injectable({
  providedIn: 'root'
})
export class SmartDateSegmentationService {

  /**
   * 根據抽成類型獲取新增項目的智能日期範圍
   */
  getSmartDateRange(
    commissionType: string,
    contractStartDate: string,
    contractEndDate: string,
    existingItems: ConditionItem[]
  ): { cag_bdate: string; cag_edate: string } {

    switch (commissionType) {
      case '1': // 固定租金
      case '2': // 底租抽成取高者
      case '4': // 包底抽成
        return this.getSequentialDateRange(contractStartDate, contractEndDate, existingItems);

      case '5': // 階梯式抽成
        return this.getGraduatedDateRange(contractStartDate, contractEndDate);

      case '6': // 包底加階梯
        return this.getBaseTierDateRange(contractStartDate, contractEndDate, existingItems as BaseTierCondition[]);

      default:
        return this.getDefaultDateRange(contractStartDate, contractEndDate);
    }
  }

  /**
   * 順序日期分段邏輯 (固定租金、底租抽成取高者、包底抽成)
   * 第一筆：契約起日 ~ 下一年1月1日
   * 後續筆：前一筆結束日+1天 ~ 契約終止日
   */
  private getSequentialDateRange(
    contractStartDate: string,
    contractEndDate: string,
    existingItems: ConditionItem[]
  ): { cag_bdate: string; cag_edate: string } {

    // 過濾掉已刪除的項目，只考慮有效項目
    const validItems = existingItems.filter(item => (item as any)._status !== 'deleted');

    if (validItems.length === 0) {
      // 第一筆資料：從契約起始日到下一年1月1日
      const startDate = new Date(contractStartDate);
      const firstEndDate = new Date(startDate.getFullYear() + 1, 0, 1); // 下一年1月1日
      const contractEnd = new Date(contractEndDate);

      // 如果下一年1月1日超過契約終止日，則使用契約終止日
      const endDate = firstEndDate > contractEnd ? contractEnd : firstEndDate;

      return {
        cag_bdate: this.formatDate(startDate),
        cag_edate: this.formatDate(endDate)
      };
    }

    // 找出最後一個時間段的結束日期
    const lastEndDate = this.getLatestEndDate(validItems);
    if (!lastEndDate) {
      // 如果找不到有效的結束日期，使用默認邏輯
      return this.getDefaultDateRange(contractStartDate, contractEndDate);
    }

    // 新的開始日期 = 最後結束日期 + 1天
    const newStartDate = this.addDays(new Date(lastEndDate), 1);
    const contractEnd = new Date(contractEndDate);

    return {
      cag_bdate: this.formatDate(newStartDate),
      cag_edate: this.formatDate(contractEnd)
    };
  }

  /**
   * 階梯式抽成日期範圍 (日期都是契約起訖日)
   */
  private getGraduatedDateRange(contractStartDate: string, contractEndDate: string): { cag_bdate: string; cag_edate: string } {
    return {
      cag_bdate: contractStartDate,
      cag_edate: contractEndDate
    };
  }

  /**
   * 包底加階梯日期範圍
   * 規則：當現有項目中有階梯金額迄值為999999999時，才能新增下一個區段
   * 新區段的日期使用契約起訖日
   */
  private getBaseTierDateRange(
    contractStartDate: string,
    contractEndDate: string,
    existingItems: BaseTierCondition[]
  ): { cag_bdate: string; cag_edate: string } {

    const validItems = existingItems.filter(item => (item as any)._status !== 'deleted');

    // 檢查是否有項目的end_number為999999999 (或9999999999)
    const hasMaxEndNumber = validItems.some(item =>
      item.end_number === 999999999 || item.end_number === 9999999999
    );

    if (validItems.length === 0 || hasMaxEndNumber) {
      // 可以新增下一個區段，使用契約起訖日
      return {
        cag_bdate: contractStartDate,
        cag_edate: contractEndDate
      };
    }

    // 如果沒有達到最大值，不應該新增，但還是返回契約日期
    return {
      cag_bdate: contractStartDate,
      cag_edate: contractEndDate
    };
  }

  /**
   * 預設日期範圍
   */
  private getDefaultDateRange(contractStartDate: string, contractEndDate: string): { cag_bdate: string; cag_edate: string } {
    return {
      cag_bdate: contractStartDate,
      cag_edate: contractEndDate
    };
  }

  /**
   * 檢查是否可以新增包底加階梯項目
   */
  canAddBaseTierItem(existingItems: BaseTierCondition[]): { canAdd: boolean; reason?: string } {
    const validItems = existingItems.filter(item => (item as any)._status !== 'deleted');

    if (validItems.length === 0) {
      return { canAdd: true };
    }

    // 檢查是否有項目的end_number為最大值
    const hasMaxEndNumber = validItems.some(item =>
      item.end_number === 999999999 || item.end_number === 9999999999
    );

    if (!hasMaxEndNumber) {
      return {
        canAdd: false,
        reason: '需要先將現有階梯的迄值設定為999999999才能新增下一個區段'
      };
    }

    return { canAdd: true };
  }

  /**
   * 獲取現有項目中最晚的結束日期
   */
  private getLatestEndDate(items: ConditionItem[]): string | null {
    const endDates = items
      .map(item => item.cag_edate)
      .filter(date => date && date.trim() !== '')
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return endDates.length > 0 ? endDates[0] : null;
  }

  /**
   * 日期加減天數
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * 格式化日期為 YYYY-MM-DD 格式
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 驗證日期範圍是否合理
   */
  validateDateRange(
    startDate: string,
    endDate: string,
    contractStartDate: string,
    contractEndDate: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const contractStart = new Date(contractStartDate);
    const contractEnd = new Date(contractEndDate);

    // 基本日期邏輯檢查
    if (start >= end) {
      errors.push('開始日期必須小於結束日期');
    }

    // 契約日期範圍檢查
    if (start < contractStart) {
      errors.push('開始日期不能早於契約起始日');
    }

    if (end > contractEnd) {
      errors.push('結束日期不能晚於契約終止日');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 檢查日期範圍是否與現有項目重疊
   */
  checkDateOverlap(
    newStartDate: string,
    newEndDate: string,
    existingItems: ConditionItem[],
    excludeItemId?: string
  ): { hasOverlap: boolean; conflictItems: ConditionItem[] } {

    const validItems = existingItems.filter(item =>
      (item as any)._status !== 'deleted' &&
      item.id !== excludeItemId
    );

    const newStart = new Date(newStartDate);
    const newEnd = new Date(newEndDate);

    const conflictItems = validItems.filter(item => {
      const itemStart = new Date(item.cag_bdate);
      const itemEnd = new Date(item.cag_edate);

      // 檢查日期範圍重疊
      return (newStart <= itemEnd && newEnd >= itemStart);
    });

    return {
      hasOverlap: conflictItems.length > 0,
      conflictItems
    };
  }

  /**
   * 獲取建議的下一個序號
   */
  getNextSequenceNumber(existingItems: (GraduatedCommissionCondition | BaseTierCondition)[]): number {
    const validItems = existingItems.filter(item => (item as any)._status !== 'deleted');

    if (validItems.length === 0) {
      return 1;
    }

    const maxSeqNo = Math.max(...validItems.map(item => item.seq_no || 0));
    return maxSeqNo + 1;
  }

  /**
   * 獲取智能金額範圍建議 (用於階梯和包底加階梯)
   */
  getSmartAmountRange(
    existingItems: (GraduatedCommissionCondition | BaseTierCondition)[],
    commissionType: '5' | '6'
  ): { start_number: number; end_number: number | null } {

    const validItems = existingItems.filter(item => (item as any)._status !== 'deleted');

    if (validItems.length === 0) {
      // 第一筆從0開始，迄值設為null讓使用者自己輸入
      return {
        start_number: 0,
        end_number: null  // 改為null，讓使用者自己決定
      };
    }

    // 找出當前最大的end_number
    const maxEndNumber = Math.max(...validItems.map(item => item.end_number || 0));

    // 從table-config-manager.service.ts看到最大值是9999999999999
    const MAX_VALUE = 9999999999999;

    // 檢查是否已達最大值
    if (maxEndNumber >= MAX_VALUE) {
      // 如果上一筆已是最大值，新的一筆從0重新開始
      console.log('上一筆已達最大值，新階梯從0重新開始');
      return {
        start_number: 0,
        end_number: null  // 讓使用者自己輸入
      };
    }

    // 一般情況：接續上一個的結束值+1
    return {
      start_number: maxEndNumber + 1,
      end_number: null  // 不預設結束值，讓使用者自己決定
    };
  }
  /**
   * 生成完整的新增項目數據（整合日期和其他智能邏輯）
   */
  generateSmartNewItem(
    commissionType: string,
    talentId: string,
    contractStartDate: string,
    contractEndDate: string,
    existingItems: ConditionItem[]
  ): ConditionItem | null {

    // 獲取基本日期範圍
    const dateRange = this.getSmartDateRange(commissionType, contractStartDate, contractEndDate, existingItems);

    const baseItem = {
      id: this.generateTempId(),
      talent_id: talentId,
      cag_bdate: dateRange.cag_bdate,
      cag_edate: dateRange.cag_edate,
      _status: 'new' as const,  // 明確指定字面量類型
      _isNew: true
    };

    // 根據類型添加特定欄位，並明確指定返回類型
    switch (commissionType) {
      case '1': // 固定租金
        return {
          ...baseItem,
          tlt_id: '',
          base_rent: 0
        } as FixedRentCondition;

      case '2': // 底租抽成取高者
        return {
          ...baseItem,
          tlt_id: '',
          base_rent: 0,
          cag_charge_rate: 0
        } as BaseRentHigherCondition;

      case '4': // 包底抽成
        return {
          ...baseItem,
          tlt_id: '',
          limit_amt: 0,
          limit_charge_rate: 0
        } as BaseCommissionCondition;

      case '5': // 階梯式抽成
        {
          const gradAmountRange = this.getSmartAmountRange(existingItems as GraduatedCommissionCondition[], '5');
          return {
            ...baseItem,
            seq_no: this.getNextSequenceNumber(existingItems as GraduatedCommissionCondition[]),
            start_number: gradAmountRange.start_number,
            end_number: gradAmountRange.end_number || 0,  // 如果是null就設為0讓使用者輸入
            charge_rate: 0
          } as GraduatedCommissionCondition;
        }

      case '6': // 包底加階梯
        {
          const tierAmountRange = this.getSmartAmountRange(existingItems as BaseTierCondition[], '6');
          return {
            ...baseItem,
            seq_no: this.getNextSequenceNumber(existingItems as BaseTierCondition[]),
            tlt_id: '',
            limit_amt: 0,
            start_number: tierAmountRange.start_number,
            end_number: tierAmountRange.end_number || 0,  // 如果是null就設為0讓使用者輸入
            charge_rate: 0
          } as BaseTierCondition;
        }

      default:
        return {
          ...baseItem,
          tlt_id: ''
        } as ConditionItem;
    }
  }

  /**
   * 生成暫時唯一ID
   */
  private generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
 * 新增：驗證階梯金額範圍的方法
 */
  validateGraduatedAmountRange(
    newItem: GraduatedCommissionCondition | BaseTierCondition,
    existingItems: (GraduatedCommissionCondition | BaseTierCondition)[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 基本驗證
    if (newItem.start_number >= newItem.end_number) {
      errors.push('起值必須小於迄值');
    }

    if (newItem.start_number < 0) {
      errors.push('起值不能小於0');
    }

    if (newItem.end_number > 9999999999999) {
      errors.push('迄值不能超過9,999,999,999,999');
    }

    // 檢查是否與現有範圍重疊
    const validItems = existingItems.filter(item =>
      (item as any)._status !== 'deleted' &&
      item.id !== newItem.id
    );

    for (const existingItem of validItems) {
      // 檢查範圍重疊
      const hasOverlap = (
        (newItem.start_number >= existingItem.start_number && newItem.start_number <= existingItem.end_number) ||
        (newItem.end_number >= existingItem.start_number && newItem.end_number <= existingItem.end_number) ||
        (newItem.start_number <= existingItem.start_number && newItem.end_number >= existingItem.end_number)
      );

      if (hasOverlap) {
        errors.push(`金額範圍與現有項目重疊 (${existingItem.start_number} ~ ${existingItem.end_number})`);
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
