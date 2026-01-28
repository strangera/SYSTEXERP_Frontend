/**
 * 條件設定資料管理服務
 * 負責條件資料的建立、分類、驗證等操作
 */
import { Injectable } from '@angular/core';
import { CommissionType } from '../../core/constants';
import {
  ConditionItem,
  ConditionItemStatus,
  FixedRentCondition,
  BaseRentHigherCondition,
  BaseCommissionCondition,
  GraduatedCommissionCondition,
  BaseTierCondition,
  CategorizedConditions,
  ConditionValidationResult,
  ConditionItemCounts
} from '../../core/models/condition';
import { RentSettingApiData } from '../../core/models/workflow';

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
   */
  createConditionItem(
    commissionType: string,
    talentId: string,
    startDate: string,
    endDate: string,
    existingItems: ConditionItem[] = []
  ): ConditionItem | null {
    switch (commissionType) {
      case CommissionType.FIXED_RENT:
        return this.createFixedRentItem(talentId, startDate, endDate);
      case CommissionType.BASE_RENT_HIGHER:
        return this.createBaseRentHigherItem(talentId, startDate, endDate);
      case CommissionType.BASE_COMMISSION:
        return this.createBaseCommissionItem(talentId, startDate, endDate);
      case CommissionType.GRADUATED:
        return this.createGraduatedItem(talentId, startDate, endDate, existingItems as GraduatedCommissionCondition[]);
      case CommissionType.BASE_TIER:
        return this.createBaseTierItem(talentId, startDate, endDate, existingItems as BaseTierCondition[]);
      default:
        return null;
    }
  }

  /**
   * 將後端資料映射到前端模型
   */
  mapBackendDataToFrontend(apiData: RentSettingApiData, commissionType: string): ConditionItem[] {
    const conditions: ConditionItem[] = [];

    switch (commissionType) {
      case CommissionType.FIXED_RENT:
        conditions.push(...this.mapRentData(apiData));
        break;
      case CommissionType.BASE_RENT_HIGHER:
        conditions.push(...this.mapBaseRentHigherData(apiData));
        break;
      case CommissionType.BASE_COMMISSION:
        conditions.push(...this.mapBaseCommissionData(apiData));
        break;
      case CommissionType.GRADUATED:
        conditions.push(...this.mapGraduatedData(apiData));
        break;
      case CommissionType.BASE_TIER:
        conditions.push(...this.mapBaseTierData(apiData));
        break;
    }

    // 確保所有從後端映射的資料都有 original 狀態
    conditions.forEach(condition => {
      if (!condition._status) {
        condition._status = 'original';
      }
    });

    return conditions;
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

  /**
   * 統計各狀態的項目數量
   */
  getItemCounts(items: ConditionItem[]): ConditionItemCounts {
    return {
      total: items.length,
      display: this.filterDisplayItems(items).length,
      new: items.filter(item => item._status === 'new').length,
      modified: items.filter(item => item._status === 'modified').length,
      deleted: items.filter(item => item._status === 'deleted').length,
      original: items.filter(item => item._status === 'original').length
    };
  }

  /**
   * 驗證條件資料的完整性
   */
  validateConditions(conditions: ConditionItem[], commissionType: string): ConditionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 過濾出非刪除的項目進行驗證
    const activeConditions = this.filterDisplayItems(conditions);

    // 基本驗證
    if (activeConditions.length === 0) {
      errors.push('至少需要一個條件設定項目');
    }

    // 按類型進行特定驗證
    switch (commissionType) {
      case CommissionType.FIXED_RENT:
        this.validateFixedRentConditions(activeConditions as FixedRentCondition[], errors, warnings);
        break;
      case CommissionType.BASE_RENT_HIGHER:
        this.validateBaseRentHigherConditions(activeConditions as BaseRentHigherCondition[], errors, warnings);
        break;
      case CommissionType.BASE_COMMISSION:
        this.validateBaseCommissionConditions(activeConditions as BaseCommissionCondition[], errors, warnings);
        break;
      case CommissionType.GRADUATED:
        this.validateGraduatedConditions(activeConditions as GraduatedCommissionCondition[], errors, warnings);
        break;
      case CommissionType.BASE_TIER:
        this.validateBaseTierConditions(activeConditions as BaseTierCondition[], errors, warnings);
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // =============== 私有方法：資料映射 ===============

  private mapRentData(data: RentSettingApiData): FixedRentCondition[] {
    if (!data.RentDetails?.length) return [];

    return data.RentDetails.map((item: any) => ({
      id: item.id,
      talent_id: String(item.talent_id),
      tlt_id: item.tlt_id || '',
      cag_bdate: this.formatDate(item.cag_bdate),
      cag_edate: this.formatDate(item.cag_edate),
      base_rent: item.base_rent || 0,
      _status: 'original' as ConditionItemStatus
    }));
  }

  private mapBaseRentHigherData(data: RentSettingApiData): BaseRentHigherCondition[] {
    if (!data.RentDetails?.length) return [];

    return data.RentDetails.map((rentItem: any, index: number) => ({
      id: rentItem.id,
      talent_id: String(rentItem.talent_id),
      tlt_id: rentItem.tlt_id || '',
      cag_bdate: this.formatDate(rentItem.cag_bdate),
      cag_edate: this.formatDate(rentItem.cag_edate),
      base_rent: rentItem.base_rent || 0,
      cag_charge_rate: data.ChargedDetails?.[index]?.cag_charge_rate || 0,
      _status: 'original' as ConditionItemStatus
    }));
  }

  private mapBaseCommissionData(data: RentSettingApiData): BaseCommissionCondition[] {
    if (!data.LimitDetails?.length) return [];

    return data.LimitDetails.map((item: any) => ({
      id: item.id,
      talent_id: String(item.talent_id),
      tlt_id: item.tlt_id || '',
      cag_bdate: this.formatDate(item.cag_bdate),
      cag_edate: this.formatDate(item.cag_edate),
      limit_amt: item.limit_amt || 0,
      limit_charge_rate: item.limit_charge_rate || 0,
      _status: 'original' as ConditionItemStatus
    }));
  }

  private mapGraduatedData(data: RentSettingApiData): GraduatedCommissionCondition[] {
    if (!data.LevelDetails?.length) return [];

    return data.LevelDetails.map((item: any) => ({
      id: item.id,
      talent_id: String(item.talent_id),
      seq_no: item.seq_no || 0,
      cag_bdate: this.formatDate(item.cag_bdate),
      cag_edate: this.formatDate(item.cag_edate),
      start_number: item.start_number || 0,
      end_number: item.end_number || 0,
      charge_rate: item.charge_rate || 0,
      _status: 'original' as ConditionItemStatus
    }));
  }

  private mapBaseTierData(data: RentSettingApiData): BaseTierCondition[] {
    // 第一優先：使用新的 BottomTierDetails（如果存在）
    if (data.BottomTierDetails?.length) {
      return data.BottomTierDetails.map((item: any) => ({
        id: item.id,
        talent_id: String(item.talent_id),
        seq_no: item.seq_no || 0,
        tlt_id: '',
        cag_bdate: this.formatDate(item.cag_bdate),
        cag_edate: this.formatDate(item.cag_edate),
        limit_amt: item.limit_amt || 0,
        start_number: item.start_number || 0,
        end_number: item.end_number || 0,
        charge_rate: item.charge_rate || 0,
        _status: 'original' as ConditionItemStatus
      }));
    }

    // 第二優先：使用 LevelDetails
    if (!data.LevelDetails?.length) return [];

    return data.LevelDetails.map((levelItem: any) => ({
      id: levelItem.id,
      talent_id: String(levelItem.talent_id),
      seq_no: levelItem.seq_no || 0,
      tlt_id: '',
      cag_bdate: this.formatDate(levelItem.cag_bdate),
      cag_edate: this.formatDate(levelItem.cag_edate),
      limit_amt: levelItem.limit_amt || data.LimitDetails?.[0]?.limit_amt || 0,
      start_number: levelItem.start_number || 0,
      end_number: levelItem.end_number || 0,
      charge_rate: levelItem.charge_rate || 0,
      _status: 'original' as ConditionItemStatus
    }));
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

  // =============== 私有方法：驗證 ===============

  private validateFixedRentConditions(conditions: FixedRentCondition[], errors: string[], warnings: string[]): void {
    conditions.forEach((item, index) => {
      if (!item.base_rent || item.base_rent <= 0) {
        errors.push(`第 ${index + 1} 項：租金金額必須大於 0`);
      }
      if (!item.cag_bdate) {
        errors.push(`第 ${index + 1} 項：帳務起日期為必填`);
      }
      if (!item.cag_edate) {
        errors.push(`第 ${index + 1} 項：帳務迄日期為必填`);
      }
    });
  }

  private validateBaseRentHigherConditions(conditions: BaseRentHigherCondition[], errors: string[], warnings: string[]): void {
    conditions.forEach((item, index) => {
      if (!item.base_rent || item.base_rent <= 0) {
        errors.push(`第 ${index + 1} 項：租金金額必須大於 0`);
      }
      if (!item.cag_bdate) {
        errors.push(`第 ${index + 1} 項：帳務起日期為必填`);
      }
      if (!item.cag_edate) {
        errors.push(`第 ${index + 1} 項：帳務迄日期為必填`);
      }
    });
  }

  private validateBaseCommissionConditions(conditions: BaseCommissionCondition[], errors: string[], warnings: string[]): void {
    conditions.forEach((item, index) => {
      if (!item.limit_amt || item.limit_amt <= 0) {
        errors.push(`第 ${index + 1} 項：包底金額必須大於 0`);
      }
      if (!item.limit_charge_rate || item.limit_charge_rate <= 0) {
        errors.push(`第 ${index + 1} 項：抽成率必須大於 0`);
      }
      if (!item.cag_bdate) {
        errors.push(`第 ${index + 1} 項：帳務起日期為必填`);
      }
      if (!item.cag_edate) {
        errors.push(`第 ${index + 1} 項：帳務迄日期為必填`);
      }
    });
  }

  private validateGraduatedConditions(conditions: GraduatedCommissionCondition[], errors: string[], warnings: string[]): void {
    conditions.forEach((item, index) => {
      if (item.start_number >= item.end_number) {
        errors.push(`第 ${index + 1} 項：起值必須小於迄值`);
      }
      if (!item.charge_rate || item.charge_rate <= 0) {
        errors.push(`第 ${index + 1} 項：抽成率必須大於 0`);
      }
      if (!item.cag_bdate) {
        errors.push(`第 ${index + 1} 項：帳務起日期為必填`);
      }
      if (!item.cag_edate) {
        errors.push(`第 ${index + 1} 項：帳務迄日期為必填`);
      }
    });
  }

  private validateBaseTierConditions(conditions: BaseTierCondition[], errors: string[], warnings: string[]): void {
    conditions.forEach((item, index) => {
      if (!item.limit_amt || item.limit_amt <= 0) {
        errors.push(`第 ${index + 1} 項：包底金額必須大於 0`);
      }
      if (item.start_number >= item.end_number) {
        errors.push(`第 ${index + 1} 項：起值必須小於迄值`);
      }
      if (!item.charge_rate || item.charge_rate <= 0) {
        errors.push(`第 ${index + 1} 項：抽成率必須大於 0`);
      }
      if (!item.cag_bdate) {
        errors.push(`第 ${index + 1} 項：帳務起日期為必填`);
      }
      if (!item.cag_edate) {
        errors.push(`第 ${index + 1} 項：帳務迄日期為必填`);
      }
    });
  }

  // =============== 工具方法 ===============

  private formatDate(date: any): string {
    if (!date) return '';
    try {
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }

      if (date instanceof Date || typeof date === 'string') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      return String(date).split('T')[0] || '';
    } catch {
      return '';
    }
  }

  private getDefaultStartDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
