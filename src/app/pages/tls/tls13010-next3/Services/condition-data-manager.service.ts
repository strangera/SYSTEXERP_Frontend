import {
  ConditionItem,
  FixedRentCondition,
  BaseRentHigherCondition,
  BaseCommissionCondition,
  GraduatedCommissionCondition,
  BaseTierCondition,
  GeneralCommissionCondition,
  RentSettingApiData,
  BottomTierDetailApiItem
} from './../../tls13010/tls13010.model';
// condition-data-manager.service.ts - 條件數據管理服務
import { Injectable } from '@angular/core';
import { SmartDateSegmentationService } from './smart-date-manager.service';
/**
 * 條件數據管理服務
 * 負責條件數據的創建、分類、驗證等操作
 */
@Injectable({
  providedIn: 'root'
})


export class ConditionDataManager {

  constructor(private smartDateService: SmartDateSegmentationService) { }
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

    // 找出目前最大的序號（包括已刪除的項目）
    const maxSeqNo = Math.max(...existingItems.map(item => item.seq_no || 0));
    return maxSeqNo + 1;
  }


  /**
   * 根據抽成類型初始化空的條件數據
   */
  initializeEmptyConditions(commissionType: string, talentId: string, existingItems?: any[]): ConditionItem[] {
    switch (commissionType) {
      case '1':
        return [this.createFixedRentItem(talentId)];
      case '2':
        return [this.createBaseRentHigherItem(talentId)];
      case '4':
        return [this.createBaseCommissionItem(talentId)];
      case '5':
        return [this.createGraduatedItem(talentId, existingItems as GraduatedCommissionCondition[])];
      case '6':
        return [this.createBaseTierItem(talentId, existingItems as BaseTierCondition[])];
      default:
        return [];
    }
  }

  /**
   * 使用智能日期初始化空的條件數據（新方法）
   */
  initializeSmartConditions(
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
      return this.initializeEmptyConditions(commissionType, talentId, existingItems);
    }
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

    // console.log('🔄 後端資料映射完成:', {
    //   類型: commissionType,
    //   項目數量: conditions.length,
    //   狀態統計: this.getStatusStats(conditions)
    // });

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
      // 確保狀態信息在分類過程中被保留
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

    // console.log('🗂️ 條件項目分類完成:', {
    //   fixedRent: result.fixedRent.length,
    //   baseRentHigher: result.baseRentHigher.length,
    //   generalCommission: result.generalCommission.length,
    //   baseCommission: result.baseCommission.length,
    //   graduated: result.graduated.length,
    //   baseTier: result.baseTier.length,
    //   各類型狀態統計: {
    //     fixedRent: this.getStatusStats(result.fixedRent),
    //     baseRentHigher: this.getStatusStats(result.baseRentHigher),
    //     baseCommission: this.getStatusStats(result.baseCommission),
    //     graduated: this.getStatusStats(result.graduated),
    //     baseTier: this.getStatusStats(result.baseTier)
    //   }
    // });

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

    // 基本驗證
    if (conditions.length === 0) {
      errors.push('至少需要一個條件設定項目');
    }

    // 按類型進行特定驗證
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
    const filtered = items.filter(item => {
      const status = (item as any)._status;
      // 只排除明確標記為 deleted 的項目
      const shouldShow = status !== 'deleted';

      if (!shouldShow) {
        console.log('🗑️ 過濾掉已刪除項目:', item.id);
      }

      return shouldShow;
    });

    // console.log('🔍 過濾結果:', {
    //   原始數量: items.length,
    //   過濾後數量: filtered.length,
    //   狀態統計: this.getStatusStats(items)
    // });

    return filtered;
  }

  private getStatusStats(items: any[]): any {
    const stats = {
      new: 0,
      original: 0,
      modified: 0,
      deleted: 0,
      undefined: 0
    };

    items.forEach(item => {
      const status = item._status;
      if (status) {
        stats[status as keyof typeof stats]++;
      } else {
        stats.undefined++;
      }
    });

    return stats;
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
    const stats = {
      total: items.length,
      display: this.filterDisplayItems(items).length,
      new: items.filter(item => (item as any)._status === 'new').length,
      modified: items.filter(item => (item as any)._status === 'modified').length,
      deleted: items.filter(item => (item as any)._status === 'deleted').length,
      original: items.filter(item => (item as any)._status === 'original').length
    };

    console.log('📊 項目狀態統計:', stats);
    return stats;
  }



  // =============== 私有方法 ===============

  private createFixedRentItem(talentId: string): FixedRentCondition {
    return {
      id: this.generateTempId(), // 新增唯一 ID
      talent_id: talentId,
      tlt_id: '',
      cag_bdate: this.getDefaultStartDate(),
      cag_edate: this.getDefaultEndDate(),
      base_rent: 0,
      _status: 'new',
      _isNew: true
    };
  }

  private createBaseRentHigherItem(talentId: string): BaseRentHigherCondition {
    return {
      id: this.generateTempId(), // 新增唯一 ID
      talent_id: talentId,
      tlt_id: '',
      cag_bdate: this.getDefaultStartDate(),
      cag_edate: this.getDefaultEndDate(),
      base_rent: 0,
      cag_charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  private createBaseCommissionItem(talentId: string): BaseCommissionCondition {
    return {
      id: this.generateTempId(), // 新增唯一 ID
      talent_id: talentId,
      tlt_id: '',
      cag_bdate: this.getDefaultStartDate(),
      cag_edate: this.getDefaultEndDate(),
      limit_amt: 0,
      limit_charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }
  private createGraduatedItem(talentId: string, existingItems: GraduatedCommissionCondition[] = []): GraduatedCommissionCondition {
    return {
      id: this.generateTempId(), // 新增唯一 ID
      talent_id: talentId,
      seq_no: this.getNextSeqNo(existingItems), // 使用正確的序號
      cag_bdate: this.getDefaultStartDate(),
      cag_edate: this.getDefaultEndDate(),
      start_number: 0,
      end_number: 0,
      charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  private createBaseTierItem(talentId: string, existingItems: BaseTierCondition[] = []): BaseTierCondition {
    return {
      id: this.generateTempId(), // 新增唯一 ID
      talent_id: talentId,
      seq_no: this.getNextSeqNo(existingItems), // 使用正確的序號
      tlt_id: '',
      cag_bdate: this.getDefaultStartDate(),
      cag_edate: this.getDefaultEndDate(),
      limit_amt: 0,
      start_number: 0,
      end_number: 0,
      charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

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
    console.log('🔍 mapBaseTierData - 開始處理包底加層級資料');
    console.log('📦 API 資料結構:', {
      hasBottomTierDetails: !!data.BottomTierDetails?.length,
      hasLevelDetails: !!data.LevelDetails?.length,
      hasLimitDetails: !!data.LimitDetails?.length
    });

    // 第一優先：使用新的 BottomTierDetails（如果存在）
    if (data.BottomTierDetails?.length) {
      console.log('✅ 使用 BottomTierDetails 資料，項目數量:', data.BottomTierDetails.length);
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

    if (!data.LevelDetails?.length) {
      console.log('⚠️ 沒有可用的包底加層級資料');
      return [];
    }

    console.log('✅ 使用 LevelDetails 資料（可能包含 limit_amt），項目數量:', data.LevelDetails.length);

    return data.LevelDetails.map((levelItem: any) => {
      const baseTierItem: BaseTierCondition = {
        id: levelItem.id,
        talent_id: levelItem.talent_id.toString(),
        seq_no: levelItem.seq_no || 0,
        tlt_id: '',
        cag_bdate: this.formatDate(levelItem.cag_bdate),
        cag_edate: this.formatDate(levelItem.cag_edate),
        // 優先從 levelItem 讀取 limit_amt，如果沒有再從 LimitDetails 取，最後才用 0
        limit_amt: levelItem.limit_amt || data.LimitDetails?.[0]?.limit_amt || 0,
        start_number: levelItem.start_number || 0,
        end_number: levelItem.end_number || 0,
        charge_rate: levelItem.charge_rate || 0,
        _status: 'original'
      };

      console.log(`📋 項目 ${baseTierItem.seq_no} 資料:`, {
        limit_amt: baseTierItem.limit_amt,
        start_number: baseTierItem.start_number,
        end_number: baseTierItem.end_number
      });

      return baseTierItem;
    });
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

  // 3. 添加新的智能創建方法（不改動現有方法）
  /**
   * 使用智能日期創建新項目
   */
  createSmartConditionItem(
    commissionType: string,
    talentId: string,
    contractStartDate: string,
    contractEndDate: string,
    existingItems: ConditionItem[]
  ): ConditionItem | null {

    if (commissionType === '6') {
      const canAddResult = this.smartDateService.canAddBaseTierItem(existingItems as BaseTierCondition[]);
      if (!canAddResult.canAdd) {
        throw new Error(canAddResult.reason || '無法新增包底加層級項目');
      }
    }

    const smartItem = this.smartDateService.generateSmartNewItem(
      commissionType,
      talentId,
      contractStartDate,
      contractEndDate,
      existingItems
    );

    return smartItem;
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

    // 檢查日期重疊
    const overlapCheck = this.smartDateService.checkDateOverlap(
      newItem.cag_bdate,
      newItem.cag_edate,
      existingItems,
      newItem.id !== undefined ? String(newItem.id) : undefined
    );

    if (overlapCheck.hasOverlap) {
      return {
        isValid: false,
        errors: ['新增項目的日期範圍與現有項目重疊']
      };
    }

    return { isValid: true, errors: [] };
  }
}
