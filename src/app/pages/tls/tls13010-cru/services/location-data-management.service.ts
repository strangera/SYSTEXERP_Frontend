// location-data-management.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NotificationService } from '@shared/component/notification-message/notification.service';
import { TLS13010Service } from '@service/api/tls/tls13010.service';
import { LocationItem } from '@pages/tls/tls13010/tls13010.model';
import { DropdownOption } from '@pages/tls/tls13010/tls13010.dropdown';


/**
 * 位置資料管理服務
 * 負責處理專櫃位置的所有業務邏輯
 */
@Injectable({
  providedIn: 'root'
})
export class LocationDataManagementService {

  constructor(
    private tls13010Service: TLS13010Service,
    private messageService: NotificationService
  ) { }

  // ==================== 資料準備與清理 ====================

  /**
   * 準備位置資料以供提交
   * @param locationData 原始位置資料陣列
   * @returns 清理後的位置資料陣列
   */
  prepareLocationDataForSubmit(locationData: LocationItem[]): LocationItem[] {
    // 過濾掉標記為刪除且為新增的項目
    const validLocationData = locationData.filter(item => {
      if (item._status === 'deleted' && item._isNew) {
        return false;  // 新增後又刪除的不需要提交
      }
      if (!item.location_no || item.location_no.trim() === '') {
        console.warn('過濾掉沒有位置編號的項目:', item);
        return false;
      }
      return true;
    });

    //確保所有項目都有正確的狀態並清理空 key
    return validLocationData.map(item => {
      const cleanedItem = this.cleanObjectKeys({
        ...item,
        _status: item._status || 'original'
      });

      //確保必要欄位存在且有效
      return {
        id: cleanedItem.id,
        talent_id: cleanedItem.talent_id,
        location_no: cleanedItem.location_no || '',
        tlt_building: cleanedItem.tlt_building || '',
        tlt_floor: cleanedItem.tlt_floor || '',
        area_no: cleanedItem.area_no || '',
        tlt_space: cleanedItem.tlt_space || 0,
        building_desc: cleanedItem.building_desc || '',
        floor_desc: cleanedItem.floor_desc || '',
        area_desc: cleanedItem.area_desc || '',
        _status: cleanedItem._status,
        _isNew: cleanedItem._isNew || false
      } as LocationItem;
    });
  }

  /**
   * 清理物件中的空 key 和無效 key
   * @param obj 要清理的物件
   * @returns 清理後的物件
   */
  cleanObjectKeys(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanObjectKeys(item));
    }

    if (typeof obj === 'object') {
      const cleaned: any = {};

      Object.keys(obj).forEach(key => {
        //  過濾空 key 和無效 key
        if (key && key.trim() !== '' && key !== 'undefined' && key !== 'null') {
          const value = obj[key];

          // 遞迴清理嵌套物件
          if (typeof value === 'object' && value !== null) {
            cleaned[key] = this.cleanObjectKeys(value);
          } else {
            cleaned[key] = value;
          }
        } else {
          console.warn(`⚠️ 發現並移除空/無效 key: "${key}"`);
        }
      });

      return cleaned;
    }

    return obj;
  }

  // ==================== 計算與統計 ====================

  /**
   * 計算總營業坪數
   * @param locationData 位置資料陣列
   * @returns 總營業坪數
   */
  calculateTotalSpace(locationData: LocationItem[]): number {
    return locationData
      .filter(item => item._status !== 'deleted')  //  排除已刪除的項目
      .reduce((total: number, item: LocationItem) => {
        const area = parseFloat(item.tlt_space.toString()) || 0;
        return total + area;
      }, 0);
  }

  /**
   * 取得可顯示的位置資料(過濾已刪除)
   * @param locationData 原始位置資料
   * @returns 過濾後的位置資料
   */
  getDisplayLocationData(locationData: LocationItem[]): LocationItem[] {
    return locationData.filter(item => item._status !== 'deleted');
  }

  // ==================== 驗證相關 ====================

  /**
   * 驗證位置編號是否重複(即時驗證)
   * @param locationNo 要檢查的位置編號
   * @param currentRowId 當前行的 ID
   * @param locationData 所有位置資料
   * @returns 是否重複
   */
  validateDuplicateLocationNo(
    locationNo: string,
    currentRowId: string,
    locationData: LocationItem[]
  ): boolean {
    if (!locationNo || locationNo.trim() === '') {
      return false;
    }

    // 檢查是否有其他行使用相同的位置編號
    const duplicates = locationData.filter(item =>
      item.id !== currentRowId && // 排除自己
      item._status !== 'deleted' && // 排除已刪除的
      item.location_no &&
      item.location_no.trim().toLowerCase() === locationNo.trim().toLowerCase()
    );

    if (duplicates.length > 0) {
      console.warn('❌ 位置編號重複:', {
        當前行: currentRowId,
        重複編號: locationNo,
        重複數量: duplicates.length
      });

      return true; // 重複
    }

    console.log(' 位置編號可用:', locationNo);
    return false; // 不重複
  }

  /**
   * 🔍 檢查位置編號是否重複
   * @param locationNo 位置編號
   * @param currentId 當前ID
   * @param locationData 所有位置資料
   * @returns 是否重複
   */
  isLocationNoDuplicate(
    locationNo: string,
    currentId: string,
    locationData: LocationItem[]
  ): boolean {
    if (!locationNo || !locationNo.trim()) {
      return false;
    }

    const trimmedLocationNo = locationNo.trim();

    // 檢查是否有其他行使用相同的位置編號
    const hasDuplicate = locationData.some(item =>
      item.id !== currentId &&              // 排除自己
      item._status !== 'deleted' &&         // 排除已刪除
      item.location_no?.trim() === trimmedLocationNo
    );

    console.log('🔍 重複檢查:', {
      檢查位置: trimmedLocationNo,
      當前ID: currentId,
      是否重複: hasDuplicate,
      現有位置: locationData
        .filter(item => item._status !== 'deleted')
        .map(item => ({
          id: item.id,
          location_no: item.location_no
        }))
    });

    return hasDuplicate;
  }

  /**
   * 檢查位置資料是否重複(用於儲存時驗證)
   * @param newData 新的位置資料
   * @param locationData 所有位置資料
   * @returns 是否重複
   */
  checkLocationDuplicate(newData: LocationItem, locationData: LocationItem[]): boolean {
    const newLocationNo = newData.location_no?.trim();

    if (!newLocationNo) return false;

    // 檢查是否與其他項目重複(排除自己)
    const duplicateCount = locationData.filter(item =>
      item.id !== newData.id &&
      item._status !== 'deleted' &&
      item.location_no?.trim() === newLocationNo
    ).length;

    console.log('🔍 重複檢查結果:', {
      位置編號: newLocationNo,
      重複數量: duplicateCount,
      是否重複: duplicateCount > 0
    });

    return duplicateCount > 0;
  }

  /**
   * 🔍 判斷是否為空白位置新增行
   * @param locationData 位置資料
   * @returns 是否為空白行
   */
  isEmptyLocationRow(locationData: LocationItem): boolean {
    if (!locationData._isNew) {
      return false;
    }

    const keyFields = ['location_no', 'tlt_space'];

    const isEmpty = keyFields.every(field => {
      const value = (locationData as any)[field];
      return value === null ||
        value === undefined ||
        value === '' ||
        value === 0 ||
        (typeof value === 'string' && value.trim() === '');
    });

    return isEmpty;
  }

  /**
   * 檢查位置資料是否有變更
   * @param oldData 舊資料
   * @param newData 新資料
   * @returns 是否有變更
   */
  hasLocationDataChanged(oldData: LocationItem, newData: LocationItem): boolean {
    const fieldsToCheck = [
      'location_no', 'tlt_building', 'tlt_floor',
      'area_no', 'tlt_space'
    ];

    return fieldsToCheck.some(field =>
      (oldData as any)[field] !== (newData as any)[field]
    );
  }

  // ==================== 錯誤處理 ====================

  /**
   * 🧹 清除位置錯誤標記
   * @param rowData 行資料
   */
  clearLocationError(rowData: any): void {
    delete rowData._hasDuplicateError;
    delete rowData._hasError;
    delete rowData._errorMessage;
  }

  // ==================== ID 生成 ====================

  /**
   * 產生臨時 ID
   * @returns 臨時 ID 字串
   */
  generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }


  // ==================== 資料載入 ====================

  /**
   * 載入既有的位置資料
   * @param talentId 專櫃ID
   * @param locationWithDetailsOptions 位置選項
   * @returns Observable<LocationItem[]>
   */
  loadExistingLocationData(
    talentId: string,
    locationWithDetailsOptions: DropdownOption[]
  ): Observable<LocationItem[]> {
    return new Observable(observer => {
      this.tls13010Service.queryTLS13010Location(talentId).subscribe({
        next: (response) => {
          if (response?.Data?.Locations && response.Data.Locations.length > 0) {
            const locationData = response.Data.Locations.map((item: LocationItem) => {
              const locationOption = locationWithDetailsOptions.find(
                opt => opt.value === item.location_no
              );

              return {
                ...item,
                building_desc: String(item.building_desc ||
                  (locationOption as any)?.building_desc || ''),
                floor_desc: String(item.floor_desc ||
                  (locationOption as any)?.floor_desc || ''),
                area_desc: String(item.area_desc ||
                  (locationOption as any)?.area_desc || ''),
                _status: 'original',  //  明確設定為原始狀態
                _isNew: false         //  標記為既有資料
              };
            });

            observer.next(locationData);
            observer.complete();
          } else {
            observer.next([]);
            observer.complete();
          }
        },
        error: (err) => {
          console.warn('載入位置資料失敗:', err);
          this.messageService.warnBubble('載入位置資料失敗');
          observer.error(err);
        }
      });
    });
  }

  // ==================== 批次操作 ====================

  /**
   * 處理批次刪除位置
   * @param selectedItems 選中的項目
   * @param currentLocationData 目前的位置資料
   * @returns 處理後的位置資料
   */
  processBatchDelete(
    selectedItems: LocationItem[],
    currentLocationData: LocationItem[]
  ): {
    updatedData: LocationItem[];
    deletedCount: number;
    message: string;
  } {
    console.log('🔥 批次刪除開始');
    console.log('🔍 選中的項目:', selectedItems);

    if (!selectedItems || selectedItems.length === 0) {
      return {
        updatedData: currentLocationData,
        deletedCount: 0,
        message: '請選擇要刪除的項目'
      };
    }

    // 過濾有效項目
    const validItems = selectedItems.filter((item): item is LocationItem & { id: string } => {
      if (!item.id) {
        console.warn('⚠️ 發現沒有 ID 的項目:', item);
        return false;
      }
      return true;
    });

    if (validItems.length === 0) {
      return {
        updatedData: currentLocationData,
        deletedCount: 0,
        message: '沒有有效的項目可以刪除'
      };
    }

    // 分類處理
    const idsToRemove = new Set<string>();
    const idsToMarkDeleted = new Set<string>();

    validItems.forEach(item => {
      const itemId = String(item.id);
      if (item._status === 'new' || item._isNew) {
        idsToRemove.add(itemId);
        console.log(`🗑️ 新增項目將直接移除: ${itemId}`);
      } else {
        idsToMarkDeleted.add(itemId);
        console.log(`🏷️ 既有項目將標記刪除: ${itemId}`);
      }
    });

    //  處理資料
    const updatedData = currentLocationData
      .filter(item => {
        // 移除新增項目
        if (item.id && idsToRemove.has(String(item.id))) {
          console.log(`❌ 移除項目: ${item.id} (${item.location_no})`);
          return false;
        }
        return true;
      })
      .map(item => {
        // 標記既有項目為刪除
        if (item.id && idsToMarkDeleted.has(String(item.id))) {
          console.log(`🏷️ 標記刪除: ${item.id} (${item.location_no})`);
          return { ...item, _status: 'deleted' as const };
        }
        return item;
      });

    console.log(' 批次刪除完成');

    return {
      updatedData,
      deletedCount: validItems.length,
      message: `已刪除 ${validItems.length} 個位置項目`
    };
  }

  /**
   * 建立新的空白位置項目
   * @returns 新的位置項目
   */
  createEmptyLocationItem(): LocationItem {
    return {
      id: this.generateTempId(),
      location_no: '',
      tlt_building: '',
      tlt_floor: '',
      area_no: '',
      tlt_space: 0,
      building_desc: '',
      floor_desc: '',
      area_desc: '',
      _status: 'new',  // 設定為新增狀態
      _isNew: true     // 標記新資料
    };
  }

  /**
   * 檢查是否有未完成的空白新增行
   * @param locationData 位置資料
   * @returns 是否有空白行
   */
  hasEmptyNewRow(locationData: LocationItem[]): boolean {
    return locationData.some(item =>
      item._isNew &&
      item._isEmpty &&
      !item.location_no
    );
  }

  /**
   * 移除位置項目
   * @param itemId 要移除的項目 ID
   * @param currentLocationData 目前的位置資料
   * @returns 更新後的位置資料
   */
  removeLocationItem(itemId: string, currentLocationData: LocationItem[]): LocationItem[] {
    console.log('🗑️ 開始移除位置項目:', itemId);

    const beforeLength = currentLocationData.length;

    // 從陣列中移除
    const updatedData = currentLocationData.filter(item => item.id !== itemId);

    const afterLength = updatedData.length;

    console.log('📊 移除結果:', {
      移除前數量: beforeLength,
      移除後數量: afterLength,
      是否成功: beforeLength > afterLength
    });

    return updatedData;
  }

  // ==================== 位置選項處理 ====================

  /**
   * 處理從 selector panel 選擇的位置
   * @param selectedOption 選中的選項
   * @returns 格式化的位置資料
   */
  handleLocationSelectionFromSelectorPanel(selectedOption: any): Partial<LocationItem> {
    const locationData = {
      location_no: selectedOption.value || selectedOption.location_no || '',
      tlt_building: selectedOption.tlt_building || '',
      tlt_floor: selectedOption.tlt_floor || '',
      area_no: selectedOption.area_no || '',
      tlt_space: Number(selectedOption.tlt_space) || 0,
      building_desc: selectedOption.building_desc || '',
      floor_desc: selectedOption.floor_desc || '',
      area_desc: selectedOption.area_desc || ''
    };

    console.log('📋 從 selector-panel 取得的位置資料:', locationData);

    return locationData;
  }

  // ==================== 位置狀態管理 ====================

  /**
   * 取得位置設定狀態
   * @param locationData 位置資料
   * @returns 狀態文字和樣式類別
   */
  getLocationSetupStatus(locationData: LocationItem[]): { text: string; class: string } {
    if (locationData.length === 0) {
      return { text: '未設定', class: 'text-red-500' };
    } else {
      const hasEmptyLocation = locationData.some((item: LocationItem) => !item.location_no);
      if (hasEmptyLocation) {
        return { text: '設定不完整', class: 'text-orange-500' };
      } else {
        return { text: '設定完成', class: 'text-green-500' };
      }
    }
  }
}
