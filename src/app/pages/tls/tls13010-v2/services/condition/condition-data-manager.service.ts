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
   * 自動計算金額範圍：接續既有項目最後一筆的迄金額 + 1
   */
  createGraduatedItem(
    talentId: string,
    startDate: string,
    endDate: string,
    existingItems: GraduatedCommissionCondition[] = []
  ): GraduatedCommissionCondition {
    const amountRange = this.getSmartAmountRange(existingItems);
    return {
      id: this.generateTempId(),
      talent_id: talentId,
      seq_no: this.getNextSeqNo(existingItems),
      cag_bdate: startDate || this.getDefaultStartDate(),
      cag_edate: endDate || this.getDefaultEndDate(),
      start_number: amountRange.start_number,
      end_number: amountRange.end_number,
      charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  /**
   * 建立包底加層級項目
   * 自動計算金額範圍：接續既有項目最後一筆的迄金額 + 1
   */
  createBaseTierItem(
    talentId: string,
    startDate: string,
    endDate: string,
    existingItems: BaseTierCondition[] = [],
    limitAmt: number = 0
  ): BaseTierCondition {
    const amountRange = this.getSmartAmountRange(existingItems);
    return {
      id: this.generateTempId(),
      talent_id: talentId,
      seq_no: this.getNextSeqNo(existingItems),
      tlt_id: '',
      cag_bdate: startDate || this.getDefaultStartDate(),
      cag_edate: endDate || this.getDefaultEndDate(),
      limit_amt: limitAmt,
      start_number: amountRange.start_number,
      end_number: amountRange.end_number,
      charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  /**
   * 取得既有包底加層級項目中第一筆的包底金額（用於新增時帶入）
   */
  getFirstLimitAmt(items: BaseTierCondition[]): number {
    const firstActive = items.find(item => item._status !== 'deleted');
    return firstActive?.limit_amt ?? 0;
  }

  /**
   * 判斷是否應複製一組新增（最後一筆 end_number = MAX，代表該組已完整，下次應開新組）
   */
  shouldAddPair(existingItems: (GraduatedCommissionCondition | BaseTierCondition)[]): boolean {
    const activeItems = existingItems.filter(item => item._status !== 'deleted');
    if (activeItems.length === 0) return false;
    const sorted = [...activeItems].sort((a, b) => (a.seq_no || 0) - (b.seq_no || 0));
    return sorted[sorted.length - 1].end_number === ConditionDataManagerService.MAX_AMOUNT;
  }

  /**
   * 重新排序 active 項目的 seq_no，確保連續無缺口
   * 原本是 [1,3,4] 的序號重排後變 [1,2,3]，原值改變者標為 modified
   * 在新增前呼叫，讓新筆從正確的號碼接續
   */
  renumberActiveItems<T extends { seq_no: number; _status?: string }>(items: T[]): T[] {
    const activeItems = items
      .filter(i => i._status !== 'deleted')
      .sort((a, b) => (a.seq_no || 0) - (b.seq_no || 0));
    const deletedItems = items.filter(i => i._status === 'deleted');

    let seq = 1;
    const renumbered = activeItems.map(item => {
      const newSeq = seq++;
      if (newSeq === item.seq_no) return item;
      return {
        ...item,
        seq_no: newSeq,
        _status: item._status === 'original' ? 'modified' : item._status
      } as T;
    });

    return [...renumbered, ...deletedItems];
  }

  /**
   * 取得最後一組的資料筆數（與最晚 cag_edate 相同的 active 項目數）
   * 用於複製新增時，確保新增筆數與最後一組一致
   */
  getLastGroupCount(existingItems: (GraduatedCommissionCondition | BaseTierCondition)[]): number {
    const activeItems = existingItems.filter(item => item._status !== 'deleted');
    if (activeItems.length === 0) return 1;

    let latestEnd: Date | null = null;
    for (const item of activeItems) {
      if (!item.cag_edate) continue;
      const d = this.parseDate(item.cag_edate);
      if (d && (!latestEnd || d > latestEnd)) latestEnd = d;
    }

    if (!latestEnd) return activeItems.length;

    return activeItems.filter(item => {
      const d = this.parseDate(item.cag_edate);
      return d && d.getTime() === latestEnd!.getTime();
    }).length;
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
    // 層級 / 包底加層級：同一期間可有多個金額層，最後一組已到契約截止日時仍允許新增
    if (commissionType === CommissionType.GRADUATED || commissionType === CommissionType.BASE_TIER) {
      const dates = this.getNextDatesForTieredItem(existingItems, startDate, endDate);
      if (commissionType === CommissionType.GRADUATED) {
        return this.createGraduatedItem(talentId, dates.bdate, dates.edate, existingItems as GraduatedCommissionCondition[]);
      } else {
        const limitAmt = this.getFirstLimitAmt(existingItems as BaseTierCondition[]);
        return this.createBaseTierItem(talentId, dates.bdate, dates.edate, existingItems as BaseTierCondition[], limitAmt);
      }
    }

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

  // =============== 金額範圍計算 ===============

  /** 最大金額上限 */
  static readonly MAX_AMOUNT = 9999999999999;

  /**
   * 智慧計算新增項目的金額範圍
   * - 無既有項目 → start_number: 0, end_number: 0
   * - 有既有項目 → start_number = 最後一筆 end_number + 1, end_number: 0
   * - 最後一筆已達上限 (9999999999999) → start_number: 0, end_number: 0（不應再新增）
   */
  getSmartAmountRange(
    existingItems: (GraduatedCommissionCondition | BaseTierCondition)[]
  ): { start_number: number; end_number: number } {
    const validItems = existingItems.filter(item => (item as any)._status !== 'deleted');
    if (validItems.length === 0) {
      return { start_number: 0, end_number: 0 };
    }

    const sortedItems = validItems.sort((a, b) => (a.seq_no || 0) - (b.seq_no || 0));
    const lastItem = sortedItems[sortedItems.length - 1];

    // 最後一筆已達上限，不應再新增
    if (lastItem.end_number === ConditionDataManagerService.MAX_AMOUNT) {
      return { start_number: 0, end_number: 0 };
    }

    return {
      start_number: (lastItem.end_number || 0) + 1,
      end_number: 0
    };
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
   * 計算層級/包底加層級類型的新增項目日期
   * - 無既有項目 → { bdate: contractStart, edate: contractEnd }
   * - 最晚截止日 < 契約截止日 → { bdate: 最晚截止日+1, edate: contractEnd }（新期間）
   * - 最晚截止日 = 契約截止日 → { bdate: 最後一組的起始日, edate: contractEnd }（同期間新層級，不擋）
   */
  getNextDatesForTieredItem(
    existingItems: ConditionItem[],
    contractStartDate: string,
    contractEndDate: string
  ): { bdate: string; edate: string } {
    const activeItems = existingItems.filter(item => item._status !== 'deleted');

    if (activeItems.length === 0) {
      return { bdate: contractStartDate, edate: contractEndDate };
    }

    let latestEnd: Date | null = null;
    let latestEDateStr: string | null = null;
    for (const item of activeItems) {
      if (!item.cag_edate) continue;
      const d = this.parseDate(item.cag_edate);
      if (d && (!latestEnd || d > latestEnd)) {
        latestEnd = d;
        latestEDateStr = item.cag_edate as string;
      }
    }

    if (!latestEnd || !latestEDateStr) {
      return { bdate: contractStartDate, edate: contractEndDate };
    }

    const contractEnd = this.parseDate(contractEndDate);

    // 最晚截止日 = 契約截止日 → 同期間新層級（允許，沿用該組的起始日）
    if (contractEnd && latestEnd.getTime() === contractEnd.getTime()) {
      const lastGroupItems = activeItems.filter(item => item.cag_edate === latestEDateStr);
      let groupBdate: string = latestEDateStr;
      for (const item of lastGroupItems) {
        if (!item.cag_bdate) continue;
        const bd = this.parseDate(item.cag_bdate);
        const gd = this.parseDate(groupBdate);
        if (bd && gd && bd < gd) groupBdate = item.cag_bdate as string;
      }
      return { bdate: groupBdate, edate: contractEndDate };
    }

    // 否則建立新期間
    const nextDay = new Date(latestEnd);
    nextDay.setDate(nextDay.getDate() + 1);
    return { bdate: this.formatDate(nextDay), edate: contractEndDate };
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
    return `${y}-${m}-${d}`;
  }
}
