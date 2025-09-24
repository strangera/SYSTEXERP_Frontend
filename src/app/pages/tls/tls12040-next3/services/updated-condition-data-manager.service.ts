// updated-condition-data-manager.service.ts
import { Injectable } from '@angular/core';
import { TLS12040SmartDateSegmentationService } from './smart-date-manager.service';
import { BaseCommissionCondition, BaseRentHigherCondition, BaseTierCondition, ConditionItem, FixedRentCondition, GeneralCommissionCondition, GraduatedCommissionCondition } from '../models/tls12040.table.model';
import { BottomTierDetailApiItem, RentSettingApiData } from '../models/tls12040-api.model';

/**
 * 條件數據管理服務 - 整合智能日期分段功能
 */
@Injectable({
  providedIn: 'root'
})
export class TLS12040UpConditionDataManager {

  constructor(private smartDateService: TLS12040SmartDateSegmentationService) { }

  /**
   * 生成暫時唯一 ID
   */
  private generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * 獲取下一個序號
   */
  private getNextSeqNo(existingItems: any[]): number {
    if (!existingItems || existingItems.length === 0) {
      return 1;
    }
    const maxSeqNo = Math.max(...existingItems.map(item => item.seq_no || 0));
    return maxSeqNo + 1;
  }

  /**
   * 智能創建新的條件項目
   */
  createSmartConditionItem(
    commissionType: string,
    talentId: string,
    contractStartDate: string,
    contractEndDate: string,
    existingItems: ConditionItem[]
  ): ConditionItem | null {

    // 特殊檢查：包底加階梯需要驗證是否可以新增
    if (commissionType === '6') {
      const canAddResult = this.smartDateService.canAddBaseTierItem(existingItems as BaseTierCondition[]);
      if (!canAddResult.canAdd) {
        throw new Error(canAddResult.reason || '無法新增包底加階梯項目');
      }
    }

    const smartItem = this.smartDateService.generateSmartNewItem(
      commissionType,
      talentId,
      contractStartDate,
      contractEndDate,
      existingItems
    );

    if (!smartItem) {
      throw new Error(`無法為抽成類型 ${commissionType} 創建項目`);
    }

    return smartItem;
  }

  /**
   * 根據抽成類型初始化空的條件數據（使用智能日期）
   */
  initializeEmptyConditions(
    commissionType: string,
    talentId: string,
    contractStartDate: string,
    contractEndDate: string,
    existingItems?: any[]
  ): ConditionItem[] {

    try {
      const newItem = this.createSmartConditionItem(
        commissionType,
        talentId,
        contractStartDate,
        contractEndDate,
        existingItems || []
      );

      return newItem ? [newItem] : [];
    } catch (error) {
      console.warn('智能創建項目失敗，使用默認創建:', error);
      // 失敗時回退到原始方法
      return [this.createLegacyItem(commissionType, talentId, existingItems)];
    }
  }

  /**
   * 傳統創建方法（備用）
   */
  private createLegacyItem(commissionType: string, talentId: string, existingItems?: any[]): ConditionItem {
    const baseItem = {
      id: this.generateTempId(),
      talent_id: talentId,
      cag_bdate: this.getDefaultStartDate(),
      cag_edate: this.getDefaultEndDate(),
      _status: 'new',
      _isNew: true
    };

    switch (commissionType) {
      case '1':
        return { ...baseItem, tlt_id: '', base_rent: 0 } as FixedRentCondition;
      case '2':
        return { ...baseItem, tlt_id: '', base_rent: 0, cag_charge_rate: 0 } as BaseRentHigherCondition;
      case '4':
        return { ...baseItem, tlt_id: '', limit_amt: 0, limit_charge_rate: 0 } as BaseCommissionCondition;
      case '5':
        return {
          ...baseItem,
          seq_no: this.getNextSeqNo(existingItems || []),
          start_number: 0,
          end_number: 0,
          charge_rate: 0
        } as GraduatedCommissionCondition;
      case '6':
        return {
          ...baseItem,
          seq_no: this.getNextSeqNo(existingItems || []),
          tlt_id: '',
          limit_amt: 0,
          start_number: 0,
          end_number: 0,
          charge_rate: 0
        } as BaseTierCondition;
      default:
        return baseItem as ConditionItem;
    }
  }

  /**
   * 驗證新項目的日期範圍
   */
  validateNewItemDates(
    newItem: ConditionItem,
    contractStartDate: string,
    contractEndDate: string,
    existingItems: ConditionItem[]
  ): { isValid: boolean; errors: string[] } {

    const dateValidation = this.smartDateService.validateDateRange(
      newItem.cag_bdate,
      newItem.cag_edate,
      contractStartDate,
      contractEndDate
    );

    if (!dateValidation.isValid) {
      return dateValidation;
    }

    // 檢查日期重疊（針對需要順序分段的類型）
    const overlapCheck = this.smartDateService.checkDateOverlap(
      newItem.cag_bdate,
      newItem.cag_edate,
      existingItems,
      typeof newItem.id === 'string' ? newItem.id : undefined
    );

    if (overlapCheck.hasOverlap) {
      return {
        isValid: false,
        errors: ['新增項目的日期範圍與現有項目重疊']
      };
    }

    return { isValid: true, errors: [] };
  }

  /**
   * 將後端數據映射到前端模型
   */
  mapBackendDataToFrontend(apiData: RentSettingApiData, commissionType: string): ConditionItem[] {
    const conditions: ConditionItem[] = [];

    switch (commissionType) {
      case '1':
        conditions.push(...this.mapRentData(apiData));
        break;
      case '2':
        conditions.push(...this.mapBaseRentHigherData(apiData));
        break;
      case '4':
        conditions.push(...this.mapBaseCommissionData(apiData));
        break;
      case '5':
        conditions.push(...this.mapGraduatedCommissionData(apiData));
        break;
      case '6':
        conditions.push(...this.mapBaseTierData(apiData));
        break;
    }

    // 確保所有從後端映射的資料都有 original 狀態
    conditions.forEach(condition => {
      if (!(condition as any)._status) {
        (condition as any)._status = 'original';
      }
    });

    return conditions;
  }

  /**
   * 將條件項目按類型分類
   */
  categorizeConditionItems(items: ConditionItem[]): {
    fixedRent: FixedRentCondition[];
    baseRentHigher: BaseRentHigherCondition[];
    generalCommission: GeneralCommissionCondition[];
    baseCommission: BaseCommissionCondition[];
    graduated: GraduatedCommissionCondition[];
    baseTier: BaseTierCondition[];
  } {
    const result = {
      fixedRent: [] as FixedRentCondition[],
      baseRentHigher: [] as BaseRentHigherCondition[],
      generalCommission: [] as GeneralCommissionCondition[],
      baseCommission: [] as BaseCommissionCondition[],
      graduated: [] as GraduatedCommissionCondition[],
      baseTier: [] as BaseTierCondition[]
    };

    items.forEach(item => {
      const enhancedItem = {
        ...item,
        _status: (item as any)._status || 'original',
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
   * 驗證條件數據的完整性
   */
  validateConditions(conditions: ConditionItem[], commissionType: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (conditions.length === 0) {
      errors.push('至少需要一個條件設定項目');
    }

    switch (commissionType) {
      case '1':
        this.validateFixedRentConditions(conditions as FixedRentCondition[], errors, warnings);
        break;
      case '2':
        this.validateBaseRentHigherConditions(conditions as BaseRentHigherCondition[], errors, warnings);
        break;
      case '4':
        this.validateBaseCommissionConditions(conditions as BaseCommissionCondition[], errors, warnings);
        break;
      case '5':
        this.validateGraduatedCommissionConditions(conditions as GraduatedCommissionCondition[], errors, warnings);
        break;
      case '6':
        this.validateBaseTierConditions(conditions as BaseTierCondition[], errors, warnings);
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 過濾顯示用的數據（排除已刪除的項目）
   */
  filterDisplayItems<T extends ConditionItem>(items: T[]): T[] {
    return items.filter(item => {
      const status = (item as any)._status;
      return status !== 'deleted';
    });
  }

  /**
   * 統計各狀態的項目數量
   */
  getItemCounts(items: ConditionItem[]): {
    total: number;
    display: number;
    new: number;
    modified: number;
    deleted: number;
    original: number;
  } {
    return {
      total: items.length,
      display: this.filterDisplayItems(items).length,
      new: items.filter(item => (item as any)._status === 'new').length,
      modified: items.filter(item => (item as any)._status === 'modified').length,
      deleted: items.filter(item => (item as any)._status === 'deleted').length,
      original: items.filter(item => (item as any)._status === 'original').length
    };
  }

  // =============== 私有方法 ===============

  private mapRentData(data: RentSettingApiData): FixedRentCondition[] {
    if (!data.RentDetails?.length) return [];

    return data.RentDetails.map((item: any) => ({
      id: item.id,
      talent_id: item.talent_id.toString(),
      tlt_id: item.tlt_id || '',
      cag_bdate: this.formatDate(item.cag_bdate),
      cag_edate: this.formatDate(item.cag_edate),
      base_rent: item.base_rent || 0,
      _status: 'original'
    }));
  }

  private mapBaseRentHigherData(data: RentSettingApiData): BaseRentHigherCondition[] {
    if (!data.RentDetails?.length || !data.ChargedDetails?.length) return [];

    return data.RentDetails.map((rentItem: any, index: number) => ({
      id: rentItem.id,
      talent_id: rentItem.talent_id.toString(),
      tlt_id: rentItem.tlt_id || '',
      cag_bdate: this.formatDate(rentItem.cag_bdate),
      cag_edate: this.formatDate(rentItem.cag_edate),
      base_rent: rentItem.base_rent || 0,
      cag_charge_rate: data.ChargedDetails?.[index]?.cag_charge_rate || 0,
      _status: 'original'
    }));
  }

  private mapBaseCommissionData(data: RentSettingApiData): BaseCommissionCondition[] {
    if (!data.LimitDetails?.length) return [];

    return data.LimitDetails.map((item: any) => ({
      id: item.id,
      talent_id: item.talent_id.toString(),
      tlt_id: item.tlt_id || '',
      cag_bdate: this.formatDate(item.cag_bdate),
      cag_edate: this.formatDate(item.cag_edate),
      limit_amt: item.limit_amt || 0,
      limit_charge_rate: item.limit_charge_rate || 0,
      _status: 'original'
    }));
  }

  private mapGraduatedCommissionData(data: RentSettingApiData): GraduatedCommissionCondition[] {
    if (!data.LevelDetails?.length) return [];

    return data.LevelDetails.map((item: any) => ({
      id: item.id,
      talent_id: item.talent_id.toString(),
      seq_no: item.seq_no || 0,
      cag_bdate: this.formatDate(item.cag_bdate),
      cag_edate: this.formatDate(item.cag_edate),
      start_number: item.start_number || 0,
      end_number: item.end_number || 0,
      charge_rate: item.charge_rate || 0,
      _status: 'original'
    }));
  }

  private mapBaseTierData(data: RentSettingApiData): BaseTierCondition[] {
    if (data.BottomTierDetails?.length) {
      return data.BottomTierDetails.map((item: BottomTierDetailApiItem) => ({
        id: item.id,
        talent_id: item.talent_id.toString(),
        seq_no: item.seq_no || 0,
        tlt_id: '',
        cag_bdate: this.formatDate(item.cag_bdate),
        cag_edate: this.formatDate(item.cag_edate),
        limit_amt: item.limit_amt || 0,
        start_number: item.start_number || 0,
        end_number: item.end_number || 0,
        charge_rate: item.charge_rate || 0,
        _status: 'original'
      }));
    }

    if (!data.LimitDetails?.length || !data.LevelDetails?.length) return [];

    return data.LevelDetails.map((levelItem: any) => ({
      id: levelItem.id,
      talent_id: levelItem.talent_id.toString(),
      seq_no: levelItem.seq_no || 0,
      tlt_id: '',
      cag_bdate: this.formatDate(levelItem.cag_bdate),
      cag_edate: this.formatDate(levelItem.cag_edate),
      limit_amt: levelItem.limit_amt || data.LimitDetails?.[0]?.limit_amt || 0,
      start_number: levelItem.start_number || 0,
      end_number: levelItem.end_number || 0,
      charge_rate: levelItem.charge_rate || 0,
      _status: 'original'
    }));
  }

  // 類型判斷方法
  private isFixedRentCondition(item: ConditionItem): boolean {
    return 'base_rent' in item && !('cag_charge_rate' in item);
  }

  private isBaseRentHigherCondition(item: ConditionItem): boolean {
    return 'base_rent' in item && 'cag_charge_rate' in item;
  }

  private isBaseCommissionCondition(item: ConditionItem): boolean {
    return 'limit_amt' in item && !('seq_no' in item);
  }

  private isGraduatedCommissionCondition(item: ConditionItem): boolean {
    return 'seq_no' in item && !('limit_amt' in item);
  }

  private isBaseTierCondition(item: ConditionItem): boolean {
    return 'limit_amt' in item && 'seq_no' in item;
  }

  // 驗證方法
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
      if (!item.cag_charge_rate || item.cag_charge_rate <= 0) {
        warnings.push(`第 ${index + 1} 項：抽成率可能需要設定`);
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
    });
  }

  private validateGraduatedCommissionConditions(conditions: GraduatedCommissionCondition[], errors: string[], warnings: string[]): void {
    conditions.forEach((item, index) => {
      if (item.start_number >= item.end_number) {
        errors.push(`第 ${index + 1} 項：起值必須小於迄值`);
      }
      if (!item.charge_rate || item.charge_rate <= 0) {
        errors.push(`第 ${index + 1} 項：抽成率必須大於 0`);
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
    });
  }

  // 工具方法
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
