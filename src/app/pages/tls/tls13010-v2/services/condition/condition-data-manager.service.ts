/**
 * 條件設定資料管理服務
 * 負責條件資料的建立、分類、驗證等操作
 */
import { Injectable } from '@angular/core';
import { CommissionType } from '../../core/constants';
import {
  ConditionItem,
  FixedRentCondition,
  BaseRentHigherCondition,
  BaseCommissionCondition,
  GraduatedCommissionCondition,
  BaseTierCondition,
  CategorizedConditions
} from '../../core/models/condition';

@Injectable({
  providedIn: 'root'
})
export class ConditionDataManagerService {

  /**
   * 產生暫時唯一 ID
   */
  generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * 獲取下一個序號
   */
  getNextSeqNo(existingItems: any[]): number {
    if (!existingItems || existingItems.length === 0) {
      return 1;
    }
    const maxSeqNo = Math.max(...existingItems.map(item => item.seq_no || 0));
    return maxSeqNo + 1;
  }

  /**
   * 根據抽成類型初始化空的條件資料
   * 注意: 類型 4, 5, 6 不預先產生資料，等使用者按新增時才建立
   */
  initializeEmptyConditions(
    commissionType: string,
    talentId: string,
    contractStartDate: string,
    contractEndDate: string
  ): ConditionItem[] {
    switch (commissionType) {
      case CommissionType.FIXED_RENT:
        return [this.createFixedRentItem(talentId, contractStartDate, contractEndDate)];
      case CommissionType.BASE_RENT_HIGHER:
        return [this.createBaseRentHigherItem(talentId, contractStartDate, contractEndDate)];
      case CommissionType.BASE_COMMISSION:
      case CommissionType.GRADUATED:
      case CommissionType.BASE_TIER:
        // 這些類型不預先產生資料
        return [];
      default:
        return [];
    }
  }

  /**
   * 建立固定租金項目
   */
  createFixedRentItem(talentId: string, startDate: string, endDate: string): FixedRentCondition {
    return {
      id: this.generateTempId(),
      talent_id: talentId,
      tlt_id: '',
      cag_bdate: startDate || this.getDefaultStartDate(),
      cag_edate: endDate || this.getDefaultEndDate(),
      base_rent: 0,
      _status: 'new',
      _isNew: true
    };
  }

  /**
   * 建立底租抽成取高者項目
   */
  createBaseRentHigherItem(talentId: string, startDate: string, endDate: string): BaseRentHigherCondition {
    return {
      id: this.generateTempId(),
      talent_id: talentId,
      tlt_id: '',
      cag_bdate: startDate || this.getDefaultStartDate(),
      cag_edate: endDate || this.getDefaultEndDate(),
      base_rent: 0,
      cag_charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  /**
   * 建立包底抽成項目
   */
  createBaseCommissionItem(talentId: string, startDate: string, endDate: string): BaseCommissionCondition {
    return {
      id: this.generateTempId(),
      talent_id: talentId,
      tlt_id: '',
      cag_bdate: startDate || this.getDefaultStartDate(),
      cag_edate: endDate || this.getDefaultEndDate(),
      limit_amt: 0,
      limit_charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  /**
   * 建立層級抽成項目
   */
  createGraduatedItem(
    talentId: string,
    startDate: string,
    endDate: string,
    existingItems: GraduatedCommissionCondition[] = []
  ): GraduatedCommissionCondition {
    return {
      id: this.generateTempId(),
      talent_id: talentId,
      seq_no: this.getNextSeqNo(existingItems),
      cag_bdate: startDate || this.getDefaultStartDate(),
      cag_edate: endDate || this.getDefaultEndDate(),
      start_number: 0,
      end_number: 0,
      charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  /**
   * 建立包底加層級項目
   */
  createBaseTierItem(
    talentId: string,
    startDate: string,
    endDate: string,
    existingItems: BaseTierCondition[] = []
  ): BaseTierCondition {
    return {
      id: this.generateTempId(),
      talent_id: talentId,
      seq_no: this.getNextSeqNo(existingItems),
      tlt_id: '',
      cag_bdate: startDate || this.getDefaultStartDate(),
      cag_edate: endDate || this.getDefaultEndDate(),
      limit_amt: 0,
      start_number: 0,
      end_number: 0,
      charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  /**
   * 根據抽成類型建立新項目
   * 自動計算起始日期：接續既有項目最晚截止日的隔天
   */
  createConditionItem(
    commissionType: string,
    talentId: string,
    startDate: string,
    endDate: string,
    existingItems: ConditionItem[] = []
  ): ConditionItem | null {
    const smartStartDate = this.getNextStartDate(existingItems, startDate, endDate);
    if (smartStartDate === null) {
      return null;
    }
    switch (commissionType) {
      case CommissionType.FIXED_RENT:
        return this.createFixedRentItem(talentId, smartStartDate, endDate);
      case CommissionType.BASE_RENT_HIGHER:
        return this.createBaseRentHigherItem(talentId, smartStartDate, endDate);
      case CommissionType.BASE_COMMISSION:
        return this.createBaseCommissionItem(talentId, smartStartDate, endDate);
      case CommissionType.GRADUATED:
        return this.createGraduatedItem(talentId, smartStartDate, endDate, existingItems as GraduatedCommissionCondition[]);
      case CommissionType.BASE_TIER:
        return this.createBaseTierItem(talentId, smartStartDate, endDate, existingItems as BaseTierCondition[]);
      default:
        return null;
    }
  }

  /**
   * 將條件項目按類型分類
   */
  categorizeConditionItems(items: ConditionItem[]): CategorizedConditions {
    const result: CategorizedConditions = {
      fixedRent: [],
      baseRentHigher: [],
      generalCommission: [],
      baseCommission: [],
      graduated: [],
      baseTier: []
    };

    items.forEach(item => {
      const enhancedItem = {
        ...item,
        _status: item._status || 'original',
        _fromNext2: (item as any)._fromNext2 || false,
        _readonly: (item as any)._readonly || false
      };

      if (this.isBaseRentHigherCondition(enhancedItem)) {
        result.baseRentHigher.push(enhancedItem as BaseRentHigherCondition);
      } else if (this.isFixedRentCondition(enhancedItem)) {
        result.fixedRent.push(enhancedItem as FixedRentCondition);
      } else if (this.isBaseTierCondition(enhancedItem)) {
        result.baseTier.push(enhancedItem as BaseTierCondition);
      } else if (this.isBaseCommissionCondition(enhancedItem)) {
        result.baseCommission.push(enhancedItem as BaseCommissionCondition);
      } else if (this.isGraduatedCommissionCondition(enhancedItem)) {
        result.graduated.push(enhancedItem as GraduatedCommissionCondition);
      }
    });

    return result;
  }

  /**
   * 過濾顯示用的資料（排除已刪除的項目）
   */
  filterDisplayItems<T extends ConditionItem>(items: T[]): T[] {
    return items.filter(item => item._status !== 'deleted');
  }

  // =============== 私有方法：類型判斷 ===============

  private isFixedRentCondition(item: any): boolean {
    return 'base_rent' in item && !('cag_charge_rate' in item);
  }

  private isBaseRentHigherCondition(item: any): boolean {
    return 'base_rent' in item && 'cag_charge_rate' in item;
  }

  private isBaseCommissionCondition(item: any): boolean {
    return 'limit_amt' in item && !('seq_no' in item);
  }

  private isGraduatedCommissionCondition(item: any): boolean {
    return 'seq_no' in item && !('limit_amt' in item);
  }

  private isBaseTierCondition(item: any): boolean {
    return 'limit_amt' in item && 'seq_no' in item;
  }

  // =============== 工具方法 ===============

  private getDefaultStartDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * 計算新增項目的起始日期
   * 取既有未刪除項目中最晚的 cag_edate + 1 天
   * 若無既有項目則回傳契約起始日，若已超過契約截止日則回傳 null（不允許新增）
   */
  getNextStartDate(existingItems: ConditionItem[], contractStartDate: string, contractEndDate: string): string | null {
    const activeItems = existingItems.filter(item => item._status !== 'deleted');
    if (activeItems.length === 0) {
      return contractStartDate;
    }

    let latestEnd: Date | null = null;
    for (const item of activeItems) {
      if (!item.cag_edate) continue;
      const d = this.parseDate(item.cag_edate);
      if (d && (!latestEnd || d > latestEnd)) {
        latestEnd = d;
      }
    }

    if (!latestEnd) {
      return contractStartDate;
    }

    // 最晚截止日 + 1 天
    const nextDay = new Date(latestEnd);
    nextDay.setDate(nextDay.getDate() + 1);

    // 若超過契約截止日，不允許新增
    const contractEnd = this.parseDate(contractEndDate);
    if (contractEnd && nextDay > contractEnd) {
      return null;
    }

    return this.formatDate(nextDay);
  }

  private parseDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
    const str = String(value);
    // 支援 yyyy/MM/dd 和 yyyy-MM-dd
    const normalized = str.replace(/\//g, '-');
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  }
}
