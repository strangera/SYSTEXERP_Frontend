
import { Injectable } from '@angular/core';
import { TLS12040FareItem } from '../models/tls12040-next1.model';
import { Tls12040FareDataService } from './tls12040-fare-data.service';

/**
 * 扣款狀態管理服務
 * 負責管理扣款項目的選擇狀態和變更狀態
 */
@Injectable({
  providedIn: 'root'
})
export class Tls12040FareStatusService {

  constructor(private fareDataService: Tls12040FareDataService) { }

  /**
   * 更新項目選擇狀態
   */
  updateItemSelectionStatus(item: TLS12040FareItem): void {
    const isContractExisting = item.data_source === 'CONTRACT_EXISTING';
    const hasChanges = this.fareDataService.hasDataChanges(item);

    console.log(`🔍 updateItemSelectionStatus 被呼叫:`, {
      cap_item: item.cap_item,
      is_selected: item.is_selected,
      data_source: item.data_source,
      isContractExisting,
      current_status: item._status
    });

    if (item.is_selected) {
      // ✅ 被勾選
      if (isContractExisting) {
        // 原本就存在於合約的項目
        if (item._status === 'deleted') {
          // 從刪除狀態恢復
          item._status = hasChanges ? 'modified' : 'original';
          console.log(`✅ 項目 ${item.cap_item} 恢復勾選，狀態: deleted → ${item._status}`);
        } else {
          // 檢查資料是否有變更
          if (hasChanges) {
            item._status = 'modified';
            console.log(`🔍 項目 ${item.cap_item} 資料已變更，狀態: → modified`);
          } else {
            item._status = 'original';
            console.log(`✅ 項目 ${item.cap_item} 無變更，狀態: → original`);
          }
        }
      } else {
        // 原本不存在於合約的項目 → 新增
        item._status = 'new';
        console.log(`✅ 項目 ${item.cap_item} 勾選，狀態: 無 → new`);
      }
    } else {
      // ❌ 取消勾選
      if (isContractExisting) {
        // 原本存在於合約的項目 → 刪除
        item._status = 'deleted';
        console.log(`❌ 項目 ${item.cap_item} 取消勾選，狀態: → deleted`);
      } else {
        // 原本不存在於合約的項目 → 回到無狀態
        delete item._status;
        console.log(`❌ 項目 ${item.cap_item} 取消勾選，狀態: new → 無狀態`);
      }
    }
  }

  /**
   * 批次選擇所有項目
   */
  selectAllItems(items: TLS12040FareItem[]): void {
    //console.log(`📄 批次選擇 ${items.length} 個項目`);

    items.forEach(item => {
      const wasSelected = item.is_selected;
      item.is_selected = true;

      // 只有狀態改變時才更新 _status
      if (!wasSelected) {
        this.updateItemSelectionStatus(item);
      }
    });
  }

  /**
   * 批次取消選擇所有項目
   */
  deselectAllItems(items: TLS12040FareItem[]): void {
    //console.log(`📄 批次取消選擇 ${items.length} 個項目`);

    items.forEach(item => {
      const wasSelected = item.is_selected;
      item.is_selected = false;

      // 只有狀態改變時才更新 _status
      if (wasSelected) {
        this.updateItemSelectionStatus(item);
      }
    });
  }

  /**
   * 處理表格資料更新後的狀態
   */
  handleTableDataUpdate(newData: any, capType: string): void {
    //console.log(`📋 處理 ${capType} 類型表格資料更新:`, newData.cap_item);

    // 🔥 強制檢查是否有變更
    const hasChanges = this.fareDataService.hasDataChanges(newData);
    const isContractExisting = newData.data_source === 'CONTRACT_EXISTING';

    // 狀態邏輯判定
    if (newData.is_selected) {
      // ✅ 被勾選
      if (isContractExisting) {
        // 原本就存在於合約的項目
        if (newData._status === 'deleted') {
          // 從刪除狀態恢復
          newData._status = hasChanges ? 'modified' : 'original';
          //console.log(`✅ 項目 ${newData.cap_item} 恢復勾選，狀態: deleted → ${newData._status}`);
        } else {
          // 檢查資料是否有變更
          if (hasChanges) {
            newData._status = 'modified';
            //console.log(`🔍 項目 ${newData.cap_item} 資料已變更，狀態: → modified`);
          } else {
            newData._status = 'original';
            //console.log(`✅ 項目 ${newData.cap_item} 無變更，狀態: → original`);
          }
        }
      } else {
        // 原本不存在於合約的項目 → 新增
        newData._status = 'new';
        //console.log(`✅ 項目 ${newData.cap_item} 勾選，狀態: 無 → new`);
      }
    } else {
      // ❌ 取消勾選
      if (isContractExisting) {
        // 原本存在於合約的項目 → 刪除
        newData._status = 'deleted';
        //console.log(`❌ 項目 ${newData.cap_item} 取消勾選，狀態: → deleted`);
      } else {
        // 原本不存在於合約的項目 → 回到無狀態
        delete newData._status;
        //console.log(`❌ 項目 ${newData.cap_item} 取消勾選，狀態: new → 無狀態`);
      }
    }
  }

  /**
   * 檢查是否有未儲存的變更
   */
  hasUnsavedChanges(originalFareData: Record<string, TLS12040FareItem[]>): boolean {
    return Object.keys(originalFareData).some(capType =>
      originalFareData[capType].some(item =>
        item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
      )
    );
  }

  /**
   * 取得指定類型的選中項目數量
   */
  getSelectedCount(items: TLS12040FareItem[]): number {
    if (!Array.isArray(items)) {
      return 0;
    }
    return items.filter(item => item && item.is_selected).length;
  }

  /**
   * 取得指定類型的總項目數量
   */
  getTotalCount(items: TLS12040FareItem[]): number {
    if (!Array.isArray(items)) {
      return 0;
    }
    return items.length;
  }

  /**
   * 檢查是否有任何資料
   */
  hasAnyData(originalFareData: Record<string, TLS12040FareItem[]>): boolean {
    return Object.keys(originalFareData).some(capType =>
      originalFareData[capType].length > 0
    );
  }

  /**
   * 取得總選中項目數量
   */
  getTotalSelectedCount(originalFareData: Record<string, TLS12040FareItem[]>): number {
    return Object.keys(originalFareData).reduce((total, capType) =>
      total + this.getSelectedCount(originalFareData[capType]), 0
    );
  }

  /**
   * 取得總項目數量
   */
  getTotalItemCount(originalFareData: Record<string, TLS12040FareItem[]>): number {
    return Object.keys(originalFareData).reduce((total, capType) =>
      total + this.getTotalCount(originalFareData[capType]), 0
    );
  }

  /**
   * 檢查指定類型是否有資料
   */
  hasDataForType(fareData: Record<string, TLS12040FareItem[]>, capType: string): boolean {
    return fareData[capType] && Array.isArray(fareData[capType]) && fareData[capType].length > 0;
  }

  /**
   * 驗證是否至少選擇了一個項目
   */
  validateHasSelectedItems(originalFareData: Record<string, TLS12040FareItem[]>): boolean {
    return Object.keys(originalFareData).some(capType =>
      originalFareData[capType].some(item => item.is_selected)
    );
  }
}
