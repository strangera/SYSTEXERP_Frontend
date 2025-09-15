// commission-data.service.ts - 修改版本，適應分離的 API
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TLS13010Service } from '@service/api/tls/tls13010.service';
import { ContractFlowService } from './../../tls13010/services/contract-flow.service';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import {
  CommissionItem,
  DiscountSettingItem,
  AnnualPerformanceItem,
  DiscountLevelItem,
  WorkflowStep,
  ChargeSettingApiItem
} from './../../tls13010/tls13010.model';

// 資料載入結果介面
export interface CommissionDataLoadResult {
  success: boolean;
  data: CommissionItem[];
  source: 'saved' | 'charge_api' | 'new_contract';
  warnings?: string[];
  errors?: string[];
  metadata?: {
    totalItems: number;
    newItems: number;
    modifiedItems: number;
    originalItems: number;
  };
}

// 載入選項介面
export interface CommissionDataLoadOptions {
  talentId: string;
  isNewContract: boolean;
  currentCommissionType?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  discountOptions: any[];
}

// 🎯 新增：單純的抽成設定 API 回應介面
export interface ChargeApiResponse {
  Status: string;
  Data: {
    TalentId: string;
    ChargeSettings: ChargeSettingApiItem[];
    TotalRecords: number;
  };
  Message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommissionDataService {

  constructor(
    private tls13010Service: TLS13010Service,
    private contractFlowService: ContractFlowService,
    private locationOptionsService: LocationOptionsService,
  ) { }

  /**
   * 主要載入方法 - 統一入口
   */
  async loadCommissionData(options: CommissionDataLoadOptions): Promise<CommissionDataLoadResult> {
    console.log('📄 CommissionDataService: 開始載入抽成資料', options);

    try {
      // 第一優先：嘗試載入暫存資料
      const savedResult = await this.tryLoadFromSavedData();
      if (savedResult.success) {
        return savedResult;
      }

      // 第二優先：根據模式載入
      if (options.isNewContract) {
        return this.loadForNewContract(options);
      } else {
        return await this.loadFromChargeAPI(options);
      }

    } catch (error) {
      console.error('❌ CommissionDataService: 載入失敗', error);
      return this.createErrorResult(error);
    }
  }

  /**
   * 載入折扣選項 - 使用現代語法
   */
  async loadDiscountOptions(): Promise<any[]> {
    try {
      // 🎯 使用 firstValueFrom 替代 toPromise
      const options = await firstValueFrom(
        this.locationOptionsService.getPaperTypeOptions('T102').pipe(
          catchError(error => {
            console.error('載入折扣選項時發生錯誤:', error);
            return of([]);
          })
        )
      );

      console.log('✅ 折扣選項載入完成:', options?.length || 0);
      return options || [];
    } catch (error) {
      console.error('❌ 載入折扣選項失敗:', error);
      return [];
    }
  }

  /**
   * 驗證載入的資料
   */
  validateCommissionData(data: CommissionItem[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
      errors.push('抽成資料格式錯誤：非陣列格式');
      return { isValid: false, errors };
    }

    data.forEach((item, index) => {
      if (!item.tlt_id) {
        errors.push(`抽成項目 ${index + 1} 缺少抽成類別編號`);
      }
      if (!item.tlt_id_desc) {
        errors.push(`抽成項目 ${index + 1} 缺少抽成類別名稱`);
      }
      if (typeof item.cag_taxtype === 'undefined') {
        errors.push(`抽成項目 ${index + 1} 缺少稅別設定`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ============ 私有方法 ============

  /**
   * 嘗試載入暫存資料
   */
  private async tryLoadFromSavedData(): Promise<CommissionDataLoadResult> {
    const savedData = this.contractFlowService.getStepData(WorkflowStep.COMMISSION);

    if (!this.isValidSavedData(savedData)) {
      return { success: false, data: [], source: 'saved' };
    }

    console.log('📦 使用暫存抽成資料');

    const processedData = savedData.map((item: { _status: any; }) => ({
      ...item,
      _status: item._status || 'original'
    }));

    const validation = this.validateCommissionData(processedData);
    if (!validation.isValid) {
      return {
        success: false,
        data: [],
        source: 'saved',
        errors: validation.errors
      };
    }

    return {
      success: true,
      data: processedData,
      source: 'saved',
      metadata: this.generateMetadata(processedData)
    };
  }

  /**
   * 新增合約模式載入
   */
  private loadForNewContract(options: CommissionDataLoadOptions): CommissionDataLoadResult {
    console.log('🆕 新增合約模式：初始化空資料');

    return {
      success: true,
      data: [],
      source: 'new_contract',
      metadata: {
        totalItems: 0,
        newItems: 0,
        modifiedItems: 0,
        originalItems: 0
      }
    };
  }

  /**
   * 🎯 修改：使用單純的抽成設定 API
   */
  private async loadFromChargeAPI(options: CommissionDataLoadOptions): Promise<CommissionDataLoadResult> {
    // 檢查是否有抽成類別
    if (!options.currentCommissionType) {
      console.warn('⚠ 無抽成類別，初始化為新合約模式');
      return this.loadForNewContract(options);
    }

    console.log('🔗 呼叫單純抽成設定 API:', options.talentId);

    try {
      // 🎯 使用 firstValueFrom 替代 toPromise
      const response = await firstValueFrom(
        this.tls13010Service.queryTLS13010Charge(options.talentId).pipe(
          catchError(error => {
            console.error('抽成設定 API 呼叫失敗:', error);
            throw error;
          })
        )
      );

      return this.processChargeAPIResponse(response, options);
    } catch (error) {
      console.error('❌ 抽成設定 API 載入失敗:', error);

      // 如果 API 失敗，根據錯誤類型決定處理方式
      if (this.isNotFoundError(error)) {
        console.log('🔭 查無資料，初始化為新合約模式');
        return this.loadForNewContract(options);
      }

      throw error;
    }
  }

  /**
   * 🎯 新增：處理單純抽成設定 API 回應
   */
  private processChargeAPIResponse(response: ChargeApiResponse, options: CommissionDataLoadOptions): CommissionDataLoadResult {
    console.log('📄 處理抽成設定 API 回應');

    const warnings: string[] = [];

    // 檢查 API 回應狀態
    if (response.Status !== '0000') {
      throw new Error(response.Message || '抽成設定查詢失敗');
    }

    // 轉換資料
    let commissionData: CommissionItem[] = [];
    if (response.Data?.ChargeSettings) {
      commissionData = this.convertChargeAPIData(response.Data, options);
    }

    // 🎯 注意：這裡不再儲存統一回應，因為是單純的抽成設定 API
    // this.contractFlowService.setUnifiedCommissionData(data); // 移除這行

    return {
      success: true,
      data: commissionData,
      source: 'charge_api',
      warnings,
      metadata: this.generateMetadata(commissionData)
    };
  }

  /**
   * 🎯 修改：轉換單純抽成設定 API 資料格式
   */
  private convertChargeAPIData(apiData: any, options: CommissionDataLoadOptions): CommissionItem[] {
    const result: CommissionItem[] = [];

    if (!apiData.ChargeSettings || !Array.isArray(apiData.ChargeSettings)) {
      return result;
    }

    apiData.ChargeSettings.forEach((chargeSetting: ChargeSettingApiItem, index: number) => {
      const commissionItem: CommissionItem = {
        id: chargeSetting.id || (index + 1),
        tlt_id: chargeSetting.tlt_id || '',
        tlt_id_desc: chargeSetting.tlt_id_desc || `抽成類別${index + 1}`,
        cag_taxtype: chargeSetting.cag_taxtype === '1' ? 1 : 0,
        discountSummary: this.generateDiscountSummary(chargeSetting),
        sst_amount: chargeSetting.sst_amount || 0,
        sst_rate: chargeSetting.sst_rate || 0,
        cap_saletype2: chargeSetting.cap_saletype2 === 'Y',
        cap_saletype1: chargeSetting.cap_saletype1 === 'Y',
        selectedSettingOption: 'discount',
        currentTab: 'discount',
        discountSettingItems: this.convertDiscountItems(chargeSetting.ChargeDetails || [], options),
        annualPerformanceItems: this.convertAnnualItems(chargeSetting.YearChargeDetails || []),
        discountLevelItems: this.convertLevelItems(chargeSetting.LevelChargeDetails || [], options),
        detailItems: [],
        _status: 'original',
        mainStartDate: options.contractStartDate,
        mainEndDate: options.contractEndDate
      };

      this.updateCommissionItemDetails(commissionItem);
      result.push(commissionItem);
    });

    return result;
  }

  /**
   * 轉換折扣設定項目
   */
  private convertDiscountItems(chargeDetails: any[], options: CommissionDataLoadOptions): DiscountSettingItem[] {
    // 如果有提供折扣選項，建立完整列表
    if (options.discountOptions?.length > 0) {
      return this.buildCompleteDiscountItems(chargeDetails, options);
    }

    // 否則只轉換現有資料
    return chargeDetails.map(detail => ({
      id: detail.id || this.generateTempId(),
      selected: true,
      cag_barcode: detail.cag_barcode || '',
      tlt_bdate: detail.tlt_bdate ? new Date(detail.tlt_bdate) : new Date(),
      tlt_edate: detail.tlt_edate ? new Date(detail.tlt_edate) : new Date(),
      cag_charge_rate: detail.cag_charge_rate || 0,
      _status: 'original',
      is_configured: detail.is_configured || true,
      is_enabled: detail.is_enabled || true
    }));
  }

  /**
   * 建立完整的折扣項目列表（包含所有選項）
   */
  private buildCompleteDiscountItems(existingDetails: any[], options: CommissionDataLoadOptions): DiscountSettingItem[] {
    const result: DiscountSettingItem[] = [];
    const contractStartDate = options.contractStartDate ? new Date(options.contractStartDate) : new Date();
    const contractEndDate = options.contractEndDate ? new Date(options.contractEndDate) : new Date();

    // 🎯 新增：檢查是否為新合約且沒有既有資料
    const isNewContractWithoutData = existingDetails.length === 0;

    options.discountOptions?.forEach((option, index) => {
      const existingItem = existingDetails.find(detail => detail.cag_barcode === option.value);

      if (existingItem) {
        // 已設定的項目
        result.push({
          id: existingItem.id || this.generateTempId(),
          selected: true,
          cag_barcode: existingItem.cag_barcode,
          tlt_bdate: existingItem.tlt_bdate ? new Date(existingItem.tlt_bdate) : contractStartDate,
          tlt_edate: existingItem.tlt_edate ? new Date(existingItem.tlt_edate) : contractEndDate,
          cag_charge_rate: existingItem.cag_charge_rate || 0,
          _status: 'original',
          is_configured: existingItem.is_configured || true,
          is_enabled: existingItem.is_enabled || true
        });
      } else {
        // 🎯 關鍵修改：未設定的項目，如果是新合約且是第一個選項（000-正品），預設勾選
        const isFirstOption = index === 0;
        const shouldSelectByDefault = isNewContractWithoutData && isFirstOption &&
          (option.value === '000' || option.label?.includes('正品'));

        result.push({
          id: this.generateTempId(),
          selected: shouldSelectByDefault, // 🎯 根據條件決定是否預設勾選
          cag_barcode: option.value,
          tlt_bdate: contractStartDate,
          tlt_edate: contractEndDate,
          cag_charge_rate: shouldSelectByDefault ? 0 : 0, // 可以設定預設抽成率
          _status: shouldSelectByDefault ? 'new' : 'new',
          is_configured: shouldSelectByDefault,
          is_enabled: shouldSelectByDefault
        });
      }
    });

    return result;
  }

  /**
   * 轉換年度業績項目
   */
  private convertAnnualItems(yearDetails: any[]): AnnualPerformanceItem[] {
    return yearDetails.map(detail => ({
      id: detail.id || this.generateTempId(),
      selected: true,
      tlt_bdate: detail.tlt_bdate ? new Date(detail.tlt_bdate) : new Date(),
      tlt_edate: detail.tlt_edate ? new Date(detail.tlt_edate) : new Date(),
      year_amount: detail.year_amount || 0,
      extra_rate: detail.extra_rate || 0,
      _status: 'original'
    }));
  }

  /**
   * 轉換層級抽成項目
   */
  private convertLevelItems(levelDetails: any[], options: CommissionDataLoadOptions): DiscountLevelItem[] {
    // 🎯 如果有折扣選項，使用新的建立方法
    if (options.discountOptions?.length > 0) {
      return this.buildCompleteLevelItems(levelDetails, options);
    } else {
      // 只轉換現有資料（保持原有邏輯）
      return levelDetails.map(detail => ({
        id: detail.id || this.generateTempId(),
        selected: true,
        cag_barcode: detail.cag_barcode || '',
        level_bmount: detail.level_bmount || 0,
        level_eamount: detail.level_eamount || 0,
        level_charge_rate: detail.level_charge_rate || 0,
        _status: 'original',
        is_configured: true,
        is_enabled: true
      }));
    }
  }

  private buildCompleteLevelItems(existingDetails: any[], options: CommissionDataLoadOptions): DiscountLevelItem[] {
    const result: DiscountLevelItem[] = [];

    // 🎯 新增：檢查是否為新合約且沒有既有資料
    const isNewContractWithoutData = existingDetails.length === 0;

    options.discountOptions?.forEach((option, index) => {
      const existingItem = existingDetails.find(detail => detail.cag_barcode === option.value);

      if (existingItem) {
        result.push({
          id: existingItem.id || this.generateTempId(),
          selected: true,
          cag_barcode: existingItem.cag_barcode,
          level_bmount: existingItem.level_bmount || 0,
          level_eamount: existingItem.level_eamount || 0,
          level_charge_rate: existingItem.level_charge_rate || 0,
          _status: 'original',
          is_configured: true,
          is_enabled: true
        });
      } else {
        // 🎯 關鍵修改：對於 level 項目也套用相同邏輯
        const isFirstOption = index === 0;
        const shouldSelectByDefault = isNewContractWithoutData && isFirstOption &&
          (option.value === '000' || option.label?.includes('正品'));

        result.push({
          id: this.generateTempId(),
          selected: shouldSelectByDefault, // 🎯 根據條件決定是否預設勾選
          cag_barcode: option.value,
          level_bmount: 0,
          level_eamount: 0,
          level_charge_rate: shouldSelectByDefault ? 0 : 0, // 可以設定預設抽成率
          _status: shouldSelectByDefault ? 'new' : 'new',
          is_configured: shouldSelectByDefault,
          is_enabled: shouldSelectByDefault
        });
      }
    });

    return result;
  }

  // ============ 工具方法 ============

  /**
   * 檢查是否為找不到資料的錯誤
   */
  private isNotFoundError(error: any): boolean {
    return error?.status === 404 ||
      error?.error?.Message?.includes('查無資料') ||
      error?.message?.includes('not found');
  }

  private isValidSavedData(data: any): boolean {
    return data && Array.isArray(data) && data.length > 0;
  }

  private generateDiscountSummary(chargeSetting: any): string {
    const summaryParts: string[] = [];

    if (chargeSetting.ChargeDetails?.length > 0) {
      const discountSummary = chargeSetting.ChargeDetails
        .map((detail: any) => `${detail.cag_barcode}(${detail.cag_charge_rate}%)`)
        .join(', ');
      summaryParts.push(`折扣設定: ${discountSummary}`);
    }

    if (chargeSetting.YearChargeDetails?.length > 0) {
      const yearSummary = chargeSetting.YearChargeDetails
        .map((detail: any) => `${detail.year_amount}以上(+${detail.extra_rate}%)`)
        .join(', ');
      summaryParts.push(`年度業績: ${yearSummary}`);
    }

    if (chargeSetting.LevelChargeDetails?.length > 0) {
      const levelSummary = chargeSetting.LevelChargeDetails
        .map((detail: any) => `${detail.cag_barcode}(${detail.level_charge_rate}%)`)
        .join(', ');
      summaryParts.push(`層級抽成: ${levelSummary}`);
    }

    return summaryParts.join('; ') || '尚未設定';
  }

  private updateCommissionItemDetails(commissionItem: CommissionItem): void {
    // 根據當前標籤設定 detailItems
    switch (commissionItem.currentTab) {
      case 'discount':
        commissionItem.detailItems = [...commissionItem.discountSettingItems];
        break;
      case 'annual':
        commissionItem.detailItems = [...commissionItem.annualPerformanceItems];
        break;
      case 'level':
        commissionItem.detailItems = [...commissionItem.discountLevelItems];
        break;
      default:
        commissionItem.detailItems = [...commissionItem.discountSettingItems];
    }
  }

  private generateMetadata(data: CommissionItem[]) {
    return {
      totalItems: data.length,
      newItems: data.filter(item => item._status === 'new').length,
      modifiedItems: data.filter(item => item._status === 'modified').length,
      originalItems: data.filter(item => item._status === 'original' || !item._status).length
    };
  }

  /**
   * 🎯 使用 substring 替代 substr (已廢棄)
   */
  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }

  private createErrorResult(error: any): CommissionDataLoadResult {
    return {
      success: false,
      data: [],
      source: 'new_contract',
      errors: [error?.message || '未知錯誤']
    };
  }
}
