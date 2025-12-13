// commission-data.service.ts - 修正版本，確保 cap_saletype 同步
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

// 新增：單純的抽成設定 API 回應介面
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
      // 使用 firstValueFrom 替代 toPromise
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
    console.log(' 新增合約模式：初始化空資料');

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
   * 修改：使用單純的抽成設定 API
   */
  private async loadFromChargeAPI(options: CommissionDataLoadOptions): Promise<CommissionDataLoadResult> {
    // 檢查是否有抽成類別
    if (!options.currentCommissionType) {
      console.warn('⚠️ 無抽成類別，初始化為新合約模式');
      return this.loadForNewContract(options);
    }

    console.log('🔗 呼叫單純抽成設定 API:', options.talentId);

    try {
      // 使用 firstValueFrom 替代 toPromise
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
   * 新增：處理單純抽成設定 API 回應
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

    return {
      success: true,
      data: commissionData,
      source: 'charge_api',
      warnings,
      metadata: this.generateMetadata(commissionData)
    };
  }

  /**
   * 修改：轉換單純抽成設定 API 資料格式 - 強化 cap_saletype 處理
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
        cag_taxtype: chargeSetting.cag_taxtype === '1' ? '1' : '0',
        discountSummary: this.generateDiscountSummary(chargeSetting),
        sst_amount: chargeSetting.sst_amount || 0,
        sst_rate: chargeSetting.sst_rate || 0,

        // 關鍵修正：優先使用 step1 的值，確保同步
        cap_saletype1: this.convertYNToBoolean(chargeSetting.cap_saletype1),
        cap_saletype2: this.convertYNToBoolean(chargeSetting.cap_saletype2),
        cap_saletype5: this.convertYNToBoolean(chargeSetting.cap_saletype5),

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
   * 將 Y/N 字串轉換為 boolean
   */
  private convertYNToBoolean(value: any): boolean {
    if (value === 'Y' || value === 'y' || value === true) {
      return true;
    }
    return false;
  }

  /**
   * 🆕 將後端的小數抽成率轉換為前端的百分比顯示值
   * 例如: 0.05 → 5, 0.1 → 10
   */
  private convertRateToPercentage(rate: number | null | undefined): number {
    if (rate === null || rate === undefined) return 0;
    return rate * 100;
  }

  /**
   * 🆕 將前端的百分比顯示值轉換為後端的小數抽成率
   * 例如: 5 → 0.05, 10 → 0.1
   */
  private convertPercentageToRate(percentage: number | null | undefined): number {
    if (percentage === null || percentage === undefined) return 0;
    return percentage / 100;
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
      _source: 'api',  // 🆕 標記為 API 來的資料
      selected: true,
      cag_barcode: detail.cag_barcode || '',
      tlt_bdate: detail.tlt_bdate ? new Date(detail.tlt_bdate) : new Date(),
      tlt_edate: detail.tlt_edate ? new Date(detail.tlt_edate) : new Date(),
      cag_charge_rate: this.convertRateToPercentage(detail.cag_charge_rate),  // 🔧 API 的 0.05 → 前端的 5
      _status: 'original',
      is_configured: detail.is_configured || true,
      is_enabled: detail.is_enabled || true
    }));
  }

  /**
   * 建立完整的折扣項目列表（包含所有選項）
   * 為所有 8 種折扣別建立項目，但只有既有資料的會被勾選
   */
  private buildCompleteDiscountItems(existingDetails: any[], options: CommissionDataLoadOptions): DiscountSettingItem[] {
    const result: DiscountSettingItem[] = [];
    const contractStartDate = options.contractStartDate ? new Date(options.contractStartDate) : new Date();
    const contractEndDate = options.contractEndDate ? new Date(options.contractEndDate) : new Date();

    const isNewContractWithoutData = existingDetails.length === 0;

    options.discountOptions?.forEach((option, index) => {
      // 找出這個折扣別的所有既有資料
      const existingItems = existingDetails.filter(detail => detail.cag_barcode === option.value);

      if (existingItems.length > 0) {
        // 有既有資料：為每筆既有資料建立項目（已勾選）
        existingItems.forEach(existingItem => {
          result.push({
            id: existingItem.id || this.generateTempId(),
            _source: 'api',  // 🆕 API 來的資料
            selected: true,
            cag_barcode: existingItem.cag_barcode,
            tlt_bdate: existingItem.tlt_bdate ? new Date(existingItem.tlt_bdate) : contractStartDate,
            tlt_edate: existingItem.tlt_edate ? new Date(existingItem.tlt_edate) : contractEndDate,
            cag_charge_rate: this.convertRateToPercentage(existingItem.cag_charge_rate),  // 🔧 API 的 0.05 → 前端的 5
            _status: 'original',
            is_configured: true,
            is_enabled: true
          });
        });
      } else {
        // 沒有既有資料：建立未勾選的項目（除了正品預設勾選）
        const isFirstOption = index === 0;
        const shouldSelectByDefault = isNewContractWithoutData && isFirstOption &&
          (option.value === '000' || option.label?.includes('正品'));

        result.push({
          id: this.generateTempId(),
          _source: 'new',  // 🆕 前端新增的資料
          selected: shouldSelectByDefault,
          cag_barcode: option.value,
          tlt_bdate: contractStartDate,
          tlt_edate: contractEndDate,
          cag_charge_rate: 0,
          _status: 'new',
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
      extra_rate: this.convertRateToPercentage(detail.extra_rate),  // 🔧 API 的 0.05 → 前端的 5
      _status: 'original'
    }));
  }

  /**
   * 轉換層級抽成項目
   */
  private convertLevelItems(levelDetails: any[], options: CommissionDataLoadOptions): DiscountLevelItem[] {
    // 如果有折扣選項，使用新的建立方法
    if (options.discountOptions?.length > 0) {
      return this.buildCompleteLevelItems(levelDetails, options);
    } else {
      // 只轉換現有資料（保持原有邏輯）
      return levelDetails.map(detail => ({
        id: detail.id || this.generateTempId(),
        _source: 'api',  // 🆕 API 來的資料
        selected: true,
        cag_barcode: detail.cag_barcode || '',
        contract_period: '', // 🆕 稍後會由 component 填入
        level_bmount: detail.level_bmount || 0,
        level_eamount: detail.level_eamount || 0,
        level_charge_rate: this.convertRateToPercentage(detail.level_charge_rate),  // 🔧 API 的 0.05 → 前端的 5
        charged_id: detail.charged_id || undefined, // 🔑 加入 charged_id
        _status: 'original',
        is_configured: true,
        is_enabled: true
      }));
    }
  }

  /**
   * 建立層級抽成項目
   * 只載入既有的層級資料，不預先建立新項目
   * 新項目由 syncDiscountToLevel 根據折扣設定動態產生
   */
  private buildCompleteLevelItems(existingDetails: any[], options: CommissionDataLoadOptions): DiscountLevelItem[] {
    // 只處理既有資料，不預先建立新項目
    if (existingDetails.length === 0) {
      return [];  // 沒有既有資料，返回空陣列
    }

    // 只載入既有的層級資料
    return existingDetails.map(existingItem => ({
      id: existingItem.id || this.generateTempId(),
      _source: 'api',  // 🆕 API 來的資料
      selected: true,
      cag_barcode: existingItem.cag_barcode,
      contract_period: '', // 🆕 稍後會由 component 填入
      level_bmount: existingItem.level_bmount || 0,
      level_eamount: existingItem.level_eamount || 0,
      level_charge_rate: this.convertRateToPercentage(existingItem.level_charge_rate),  // 🔧 API 的 0.05 → 前端的 5
      charged_id: existingItem.charged_id || undefined, // 🔑 加入 charged_id
      _status: 'original',
      is_configured: existingItem.is_configured ?? true,
      is_enabled: existingItem.is_enabled ?? true
    }));
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
   * 使用 substring 替代 substr (已廢棄)
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
