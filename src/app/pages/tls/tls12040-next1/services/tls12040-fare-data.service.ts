
import { Injectable } from '@angular/core';
import { TLS12040FareItem } from '../models/tls12040-next1.model';

/**
 * 扣款資料管理服務
 * 負責扣款資料的處理、驗證、清理等功能
 */
@Injectable({
  providedIn: 'root'
})
export class Tls12040FareDataService {

  /**
   * 處理 API 資料，設定正確的初始狀態
   */
  processAPIData(faresByType: any, isNewContract: boolean = false): Record<string, TLS12040FareItem[]> {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    const processedData: Record<string, TLS12040FareItem[]> = { A: [], B: [], C: [], D: [], E: [] };

    console.log('📄 處理 API 資料，設定正確的初始狀態...');

    capTypes.forEach(capType => {
      if (Array.isArray(faresByType[capType])) {
        console.log(`📊 處理 ${capType} 類型，共 ${faresByType[capType].length} 筆`);

        processedData[capType] = faresByType[capType].map((item: TLS12040FareItem, index: number) => {
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

          const processedItem: TLS12040FareItem = {
            ...item,
            id: finalId,
            cap_type: item.cap_type || capType,
            _status: initialStatus,
            _originalSelected: originalSelected,
            _originalData: { ...item }
          };

          return processedItem;
        });

        console.log(`📊 ${capType} 類型處理完成: ${processedData[capType].length} 筆`);
      }
    });

    return processedData;
  }

  /**
   * 處理新增模式的 API 資料
   */
  processNewContractAPIData(faresByType: any): Record<string, TLS12040FareItem[]> {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    const processedData: Record<string, TLS12040FareItem[]> = { A: [], B: [], C: [], D: [], E: [] };

    console.log('🆕 處理新增模式 API 資料...');

    capTypes.forEach(capType => {
      if (Array.isArray(faresByType[capType])) {
        processedData[capType] = faresByType[capType].map((item: TLS12040FareItem, index: number) => {
          const processedItem = {
            ...item,
            id: `temp_new_${capType}_${item.cap_item}_${Date.now()}_${index}`,
            cap_type: item.cap_type || capType,
            is_selected: false,
            data_source: 'APS_AVAILABLE',
            _status: undefined,
            _originalSelected: false,
            _originalData: { ...item }
          } as TLS12040FareItem;

          return processedItem;
        });
      }
    });

    return processedData;
  }

  /**
   * 驗證和修復暫存資料
   */
  validateAndFixData(data: any): Record<string, TLS12040FareItem[]> {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    const validatedData: Record<string, TLS12040FareItem[]> = { A: [], B: [], C: [], D: [], E: [] };

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

          const validatedItem: TLS12040FareItem = {
            ...item,
            id: item.id ? item.id.toString() : `missing_id_${Date.now()}_${Math.random()}`,
            cap_type: item.cap_type,
            _status: validStatus,
            _originalSelected: item._originalSelected,
            _originalData: item._originalData || { ...item }
          };

          validatedData[item.cap_type].push(validatedItem);
        }
      });
    }

    return validatedData;
  }

  /**
   * 清理扣款項目用於儲存
   */
  cleanFareItemForStorage(item: TLS12040FareItem): TLS12040FareItem {
    const cleanedItem: TLS12040FareItem = {
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
      tpy_1stamt: item.tpy_1stamt,
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
      acc_no: item.acc_no
    };

    return cleanedItem;
  }

  /**
   * 準備儲存資料
   */
  prepareSaveData(originalFareData: Record<string, TLS12040FareItem[]>): TLS12040FareItem[] {
    const mergedFareItems: TLS12040FareItem[] = [];

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
  hasDataChanges(item: TLS12040FareItem): boolean {
    if (!item._originalData) {
      console.log(`⚠️ 項目 ${item.cap_item} 沒有原始資料，視為無變更`);
      return false;
    }

    const editableFields = [
      'tpy_bdate', 'tpy_edate', 'tpy_type', 'tpy_qty', 'tpy_unitamt',
      'tpy_amount', 'tpy_totalamt', 'day_account', 'interval',
      'down_payment', 'period_nos', 'tpy_1stamt', 'gui_flag',
      'tpy_rate', 'org_id'
    ];

    for (const field of editableFields) {
      const currentValue = (item as any)[field];
      const originalValue = (item._originalData as any)[field];

      const normalizedCurrent = this.normalizeValue(currentValue);
      const normalizedOriginal = this.normalizeValue(originalValue);

      if (normalizedCurrent !== normalizedOriginal) {
        console.log(`🔍 項目 ${item.cap_item} 欄位 ${field} 有變更:`, {
          原始: originalValue,
          目前: currentValue
        });
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
    originalData: Record<string, TLS12040FareItem[]>,
    showMode: 'common' | 'all'
  ): Record<string, TLS12040FareItem[]> {
    const filteredData: Record<string, TLS12040FareItem[]> = { A: [], B: [], C: [], D: [], E: [] };

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
   * 套用動態預設值
   */
  applyDynamicDefaults(item: any, contractInfoData: any[]): void {
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
