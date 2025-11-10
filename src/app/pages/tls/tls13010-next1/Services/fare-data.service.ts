import { FareItem } from './../../tls13010/tls13010.model';
import { Injectable } from '@angular/core';
import { FareDefaultsService } from './fare-defaults.service';

/**
 * 扣款資料管理服務
 * 負責扣款資料的處理、驗證、清理等功能
 */
@Injectable({
  providedIn: 'root'
})
export class FareDataService {

  constructor(private fareDefaultsService: FareDefaultsService) { }

  /**
   * 處理 API 資料，設定正確的初始狀態並套用預設值
   * @param faresByType API 回傳的扣款資料
   * @param isNewContract 是否為新增合約模式
   * @param contractInfo 合約資訊(用於預設值)
   * @param totalLocationSpace 總坪數(用於預設值)
   */
  processAPIData(
    faresByType: any,
    isNewContract: boolean = false,
    contractInfo?: any,
    totalLocationSpace?: number
  ): Record<string, FareItem[]> {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    const processedData: Record<string, FareItem[]> = { A: [], B: [], C: [], D: [], E: [] };

    console.log('📄 處理 API 資料，設定正確的初始狀態並套用預設值...');

    capTypes.forEach(capType => {
      if (Array.isArray(faresByType[capType])) {
        console.log(`📊 處理 ${capType} 類型，共 ${faresByType[capType].length} 筆`);

        processedData[capType] = faresByType[capType].map((item: FareItem, index: number) => {
          // 記錄原始選中狀態
          const originalSelected = item.is_selected || false;

          // 設定正確的初始 _status
          let initialStatus: 'original' | 'new' | 'modified' | 'deleted' | undefined = undefined;

          if (originalSelected && item.data_source === 'CONTRACT_EXISTING') {
            initialStatus = 'original';
            console.log(`📋 ${item.cap_item} (${capType}) - 合約原有資料，狀態: original`);
          }

          // 根據 data_source 決定 ID 處理
          let finalId: string;
          if (item.data_source === 'CONTRACT_EXISTING') {
            if (item.id && item.id.toString() !== '0' && item.id.toString() !== '') {
              finalId = item.id.toString();
            } else {
              console.error(`❌ 合約項目 ${item.cap_item} 缺少有效 ID！原始 ID: ${item.id}`);
              finalId = `error_missing_id_${item.cap_item}_${Date.now()}`;
            }
          } else {
            finalId = isNewContract
              ? `temp_new_${capType}_${item.cap_item}_${Date.now()}_${index}`
              : `temp_${capType}_${item.cap_item}_${Date.now()}_${index}`;
          }

          const processedItem: FareItem = {
            ...item,
            id: finalId,
            cap_type: item.cap_type || capType,
            _status: initialStatus,
            _originalSelected: originalSelected,
            _originalData: { ...item }
          };

          // 🔥 新增：在 API 資料處理時就套用預設值
          // 只對非合約原有項目或未選擇的項目套用預設值
          if (this.fareDefaultsService.needsDefaults(processedItem)) {
            this.fareDefaultsService.applyDefaults(processedItem, contractInfo, totalLocationSpace);
            console.log(`✨ ${processedItem.cap_item} 套用預設值`);
          }

          return processedItem;
        });

        console.log(`📊 ${capType} 類型處理完成: ${processedData[capType].length} 筆`);
      }
    });

    return processedData;
  }

  /**
   * 處理新增模式的 API 資料
   * @param faresByType API 回傳的扣款資料
   * @param contractInfo 合約資訊
   * @param totalLocationSpace 總坪數
   */
  processNewContractAPIData(
    faresByType: any,
    contractInfo?: any,
    totalLocationSpace?: number
  ): Record<string, FareItem[]> {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    const processedData: Record<string, FareItem[]> = { A: [], B: [], C: [], D: [], E: [] };

    console.log('📝 處理新增模式 API 資料...');

    capTypes.forEach(capType => {
      if (Array.isArray(faresByType[capType])) {
        processedData[capType] = faresByType[capType].map((item: FareItem, index: number) => {
          const processedItem = {
            ...item,
            id: `temp_new_${capType}_${item.cap_item}_${Date.now()}_${index}`,
            cap_type: item.cap_type || capType,
            is_selected: false,
            data_source: 'APS_AVAILABLE',
            _status: undefined,
            _originalSelected: false,
            _originalData: { ...item }
          } as FareItem;

          // 🔥 新增：套用預設值
          this.fareDefaultsService.applyDefaults(processedItem, contractInfo, totalLocationSpace);

          return processedItem;
        });
      }
    });

    return processedData;
  }

  /**
   * 驗證和修復暫存資料
   * @param data 暫存資料
   * @param contractInfo 合約資訊
   * @param totalLocationSpace 總坪數
   */
  validateAndFixData(
    data: any,
    contractInfo?: any,
    totalLocationSpace?: number
  ): Record<string, FareItem[]> {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    const validatedData: Record<string, FareItem[]> = { A: [], B: [], C: [], D: [], E: [] };

    console.log('🔍 驗證和修復暫存資料...');

    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item && item.cap_type && capTypes.includes(item.cap_type)) {
          // 確保 _originalSelected 存在
          if (typeof item._originalSelected === 'undefined') {
            item._originalSelected = item.data_source === 'CONTRACT_EXISTING' && item.is_selected;
            console.warn(`⚠️ 補充暫存資料 ${item.cap_item}: 設定 _originalSelected = ${item._originalSelected}`);
          }

          // 修正狀態邏輯
          let validStatus = item._status;
          if (item.is_selected && !validStatus && item._originalSelected) {
            validStatus = 'original';
            console.warn(`⚠️ 修復暫存資料 ${item.cap_item}: 已勾選的原有項目補上 original 狀態`);
          }

          const validatedItem: FareItem = {
            ...item,
            id: item.id ? item.id.toString() : `missing_id_${Date.now()}_${Math.random()}`,
            cap_type: item.cap_type,
            _status: validStatus,
            _originalSelected: item._originalSelected,
            _originalData: item._originalData || { ...item }
          };

          // 🔥 新增：補充缺少的預設值
          if (this.fareDefaultsService.needsDefaults(validatedItem)) {
            this.fareDefaultsService.applyDefaults(validatedItem, contractInfo, totalLocationSpace);
            console.log(`✨ 暫存資料 ${validatedItem.cap_item} 補充預設值`);
          }

          validatedData[item.cap_type].push(validatedItem);
        }
      });
    }

    return validatedData;
  }

  /**
   * 清理扣款項目用於儲存
   */
  cleanFareItemForStorage(item: FareItem): FareItem {
    const cleanedItem: FareItem = {
      // 基本資訊
      id: item.id,
      cap_item: item.cap_item,
      cap_name: item.cap_name,
      cap_type: item.cap_type,
      is_selected: item.is_selected,
      data_source: item.data_source,
      talent_id: item.talent_id,
      is_new_item: item.is_new_item,

      // 日期和業務欄位
      tpy_bdate: item.tpy_bdate,
      tpy_edate: item.tpy_edate,
      tpy_type: item.tpy_type,
      tpy_qty: item.tpy_qty,
      tpy_unitamt: item.tpy_unitamt,
      tpy_amount: item.tpy_amount,
      tpy_totalamt: item.tpy_totalamt,
      tpy_rate: item.tpy_rate,
      down_payment: item.down_payment,
      period_nos: item.period_nos,
      day_account: item.day_account,
      interval: item.interval,
      gui_flag: item.gui_flag,
      org_id: item.org_id,

      // 系統欄位
      _status: item._status,
      _originalSelected: item._originalSelected,
      _originalData: item._originalData,

      // 其他業務欄位
      cap_saletype: item.cap_saletype,
      edc_bank: item.edc_bank,
      instms_type: item.instms_type,
      pay_no: item.pay_no,
      is_commonly_used: item.is_commonly_used,
      cap_tax_type: item.cap_tax_type,
      acc_no: item.acc_no,
      calc_type: item.calc_type,
      rent_plus_rate: item.rent_plus_rate,
      over_base_rate: item.over_base_rate,
    };

    return cleanedItem;
  }

  /**
   * 準備儲存資料
   */
  prepareSaveData(originalFareData: Record<string, FareItem[]>): FareItem[] {
    const mergedFareItems: FareItem[] = [];

    Object.keys(originalFareData).forEach(capType => {
      if (!Array.isArray(originalFareData[capType])) {
        console.warn(`⚠️ 修正儲存資料：${capType} 不是陣列，重置為空陣列`);
        originalFareData[capType] = [];
      } else {
        originalFareData[capType].forEach(item => {
          if (!item.cap_type) {
            item.cap_type = capType;
          }
          const cleanedItem = this.cleanFareItemForStorage(item);
          mergedFareItems.push(cleanedItem);
        });
      }
    });

    return mergedFareItems;
  }

  /**
   * 檢查資料是否有變更
   */
  hasDataChanges(item: FareItem): boolean {
    if (!item._originalData) {
      console.log(`⚠️ 項目 ${item.cap_item} 沒有原始資料，視為無變更`);
      return false;
    }

    const editableFields = [
      'tpy_bdate', 'tpy_edate', 'tpy_type', 'tpy_qty', 'tpy_unitamt',
      'tpy_amount', 'tpy_totalamt', 'day_account', 'interval',
      'down_payment', 'period_nos', 'gui_flag',
      'tpy_rate', 'org_id',
      'cap_saletype',
      'edc_bank',
      'instms_type',
      'pay_no',
      'calc_type',
      'rent_plus_rate',
      'over_base_rate'
    ];

    for (const field of editableFields) {
      const currentValue = (item as any)[field];
      const originalValue = (item._originalData as any)[field];

      const normalizedCurrent = this.normalizeValue(currentValue);
      const normalizedOriginal = this.normalizeValue(originalValue);

      if (normalizedCurrent !== normalizedOriginal) {
        // console.log(`🔍 項目 ${item.cap_item} 欄位 ${field} 有變更:`, {
        //   原始: originalValue,
        //   目前: currentValue
        // });
        return true;
      }
    }

    return false;
  }

  /**
   * 標準化值用於比較
   */
  private normalizeValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    return String(value);
  }

  /**
   * 根據顯示模式過濾資料
   */
  filterDataByMode(
    originalData: Record<string, FareItem[]>,
    showMode: 'common' | 'all'
  ): Record<string, FareItem[]> {
    const filteredData: Record<string, FareItem[]> = { A: [], B: [], C: [], D: [], E: [] };

    Object.keys(originalData).forEach(capType => {
      if (!Array.isArray(originalData[capType])) {
        originalData[capType] = [];
      }

      let filteredItems = [...originalData[capType]];

      if (showMode === 'common') {
        // 常用模式：合約項目 + 常用項目 + 已勾選項目
        filteredItems = filteredItems.filter(item =>
          item.data_source === 'CONTRACT_EXISTING' ||
          item.is_commonly_used === 'Y' ||
          item.is_selected === true
        );
      }
      // 全部模式：顯示所有項目

      filteredData[capType] = filteredItems;
    });

    return filteredData;
  }

  /**
  * 根據每個類型獨立的顯示模式過濾資料（支援每個群組獨立模式）
  * @param originalData 原始資料
  * @param showModeByType 每個類型的顯示模式 { 'A': 'common', 'B': 'all', ... }
  */
  filterDataByModePerType(
    originalData: Record<string, FareItem[]>,
    showModeByType: Record<string, 'common' | 'all'>
  ): Record<string, FareItem[]> {
    const filteredData: Record<string, FareItem[]> = { A: [], B: [], C: [], D: [], E: [] };

    Object.keys(originalData).forEach(capType => {
      if (!Array.isArray(originalData[capType])) {
        originalData[capType] = [];
      }

      let filteredItems = [...originalData[capType]];
      const mode = showModeByType[capType] || 'common'; // 預設為 common

      if (mode === 'common') {
        // 常用模式：合約項目 + 常用項目 + 已勾選項目
        filteredItems = filteredItems.filter(item =>
          item.data_source === 'CONTRACT_EXISTING' ||
          item.is_commonly_used === 'Y' ||
          item.is_selected === true
        );
      }
      // 全部模式：顯示所有項目

      filteredData[capType] = filteredItems;
    });

    return filteredData;
  }

  /**
   * @deprecated 此方法已棄用，請改用 FareDefaultsService.applyDefaults()
   * 套用動態預設值
   */
  applyDynamicDefaults(item: any, contractInfoData: any[]): void {
    console.warn('⚠️ applyDynamicDefaults 已棄用，請改用 FareDefaultsService');
    const contractInfo = contractInfoData[0];

    if (!item.tpy_bdate && contractInfo?.tlt_contract_bdate) {
      item.tpy_bdate = new Date(contractInfo.tlt_contract_bdate);
    }

    if (!item.tpy_edate && contractInfo?.tlt_contract_edate) {
      item.tpy_edate = new Date(contractInfo.tlt_contract_edate);
    }

    if (!item.gui_flag) {
      item.gui_flag = 'Y';
    }

    if (!item.day_account) {
      item.day_account = 'Y';
    }

    if (!item.interval) {
      item.interval = 1;
    }
  }
}
