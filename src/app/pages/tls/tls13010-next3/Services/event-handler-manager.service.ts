import { ConditionItem } from './../../tls13010/tls13010.model';
import { NotificationService } from '@shared/component/notification-message/notification.service';
// event-handler-manager.service.ts - 事件處理管理服務
import { Injectable } from '@angular/core';


/**
 * 事件處理管理服務
 * 負責表格操作事件的統一處理
 */
@Injectable({
  providedIn: 'root'
})
export class EventHandlerManager {

  constructor(private notificationService: NotificationService) { }

  /**
   * 處理表格保存事件
   */
  handleTableSave(event: any, type: string, isViewMode: boolean): {
    shouldSave: boolean;
    modifiedData?: any;
  } {
    console.log(`${type} 表格儲存:`, event);

    if (isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法編輯');
      return { shouldSave: false };
    }

    if (!event.newData) {
      return { shouldSave: false };
    }

    let modifiedData = { ...event.newData };

    //確保狀態正確更新
    modifiedData = this.ensureCorrectStatus(modifiedData, event.oldData);

    // 處理來自 Next2 的資料特殊邏輯
    if (event.newData._fromNext2) {
      if (type === 'baseRentHigher') {
        console.log('底租抽成取高者資料，租金可編輯，抽成率來自 Next2');

        // 檢查是否有人試圖修改抽成率
        if (event.oldData.cag_charge_rate !== event.newData.cag_charge_rate) {
          this.notificationService.warnBubble('抽成率來自抽成設定，無法編輯');
          modifiedData.cag_charge_rate = event.oldData.cag_charge_rate;
        }
      }
    }

    return {
      shouldSave: true,
      modifiedData
    };
  }

  private ensureCorrectStatus(newData: any, oldData?: any): any {
    const result = { ...newData };

    // 如果沒有狀態，根據情況設定
    if (!result._status) {
      result._status = 'original';
    }

    // 如果是新增的項目，保持 new 狀態
    if (result._status === 'new') {
      console.log('🆕 保持新增狀態:', result.id);
      return result;
    }

    // 如果有舊資料且內容有變更，標記為 modified
    if (oldData && this.hasDataChanged(newData, oldData)) {
      result._status = 'modified';
      console.log('📝 資料有變更，標記為已修改:', result.id);
    }

    return result;
  }

  /**
   * 檢查資料是否有變更
   */
  private hasDataChanged(newData: any, oldData: any): boolean {
    // 比較關鍵欄位
    const keyFields = [
      'base_rent', 'cag_charge_rate', 'limit_amt', 'limit_charge_rate',
      'start_number', 'end_number', 'charge_rate', 'cag_bdate', 'cag_edate'
    ];

    for (const field of keyFields) {
      if (newData[field] !== oldData[field]) {
        console.log(`📝 欄位 ${field} 有變更:`, {
          old: oldData[field],
          new: newData[field]
        });
        return true;
      }
    }

    return false;
  }


  /**
   * 處理表格編輯事件
   */
  handleTableEdit(event: any, type: string, isViewMode: boolean): boolean {
    console.log(`${type} 表格編輯:`, event);

    if (isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法編輯');
      return false;
    }

    // 檢查是否為來自 Next2 的唯讀資料
    if (event._fromNext2 && event._readonly) {
      this.notificationService.warnBubble('來自抽成設定的資料不可編輯');
      return false;
    }

    return true;
  }

  /**
   * 處理表格取消事件
   */
  handleTableCancel(event: any, type: string): void {
    console.log(`${type} 表格取消:`, event);
    // 目前無特殊處理邏輯
  }

  /**
   * 處理批次刪除事件
   */
  handleBatchDelete(selectedItems: any[], type: string, isViewMode: boolean): {
    shouldDelete: boolean;
    validItems: any[];
    itemsToRemove: any[];
    itemsToMarkDeleted: any[];
  } {
    if (isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法刪除項目');
      return {
        shouldDelete: false,
        validItems: [],
        itemsToRemove: [],
        itemsToMarkDeleted: []
      };
    }

    if (!selectedItems || selectedItems.length === 0) {
      this.notificationService.warnBubble('請選擇要刪除的項目');
      return {
        shouldDelete: false,
        validItems: [],
        itemsToRemove: [],
        itemsToMarkDeleted: []
      };
    }

    // 檢查是否包含來自 Next2 的唯讀資料
    const hasReadonlyItems = selectedItems.some(item => item._fromNext2 && item._readonly);
    if (hasReadonlyItems) {
      this.notificationService.warnBubble('無法刪除來自抽成設定的資料');
      return {
        shouldDelete: false,
        validItems: [],
        itemsToRemove: [],
        itemsToMarkDeleted: []
      };
    }

    // 分類處理項目
    const itemsToRemove: any[] = [];
    const itemsToMarkDeleted: any[] = [];

    selectedItems.forEach(item => {
      if (item._status === 'new') {
        // 新增項目：直接從陣列移除
        itemsToRemove.push(item);
      } else {
        // 現有項目：標記刪除狀態，保留在陣列中傳給後端
        itemsToMarkDeleted.push(item);
      }
    });

    const confirmMessage = `確定要刪除選取的 ${selectedItems.length} 個項目嗎？`;
    const shouldDelete = confirm(confirmMessage);

    if (shouldDelete) {
      console.log('批次刪除處理:', {
        總項目數: selectedItems.length,
        直接移除: itemsToRemove.length,
        標記刪除: itemsToMarkDeleted.length
      });
    }

    return {
      shouldDelete,
      validItems: selectedItems,
      itemsToRemove,
      itemsToMarkDeleted
    };
  }

  /**
   * 處理新增項目事件
   */
  handleAddItem(type: string, isViewMode: boolean, createItemFn: () => any): {
    shouldAdd: boolean;
    newItem?: any;
  } {
    if (isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return { shouldAdd: false };
    }

    const newItem = createItemFn();

    // 確保新增項目有正確的狀態
    newItem._status = 'new';
    newItem._isNew = true;

    const typeNames = {
      'fixedRent': '固定租金',
      'baseRentHigher': '底租抽成取高者',
      'baseCommission': '包底抽成',
      'graduated': '階梯式抽成',
      'baseTier': '包底加階梯'
    };

    const typeName = typeNames[type as keyof typeof typeNames] || type;
    this.notificationService.successBubble(`已新增${typeName}項目`);

    console.log('🆕 新增項目:', {
      id: newItem.id,
      type: type,
      _status: newItem._status,
      _isNew: newItem._isNew
    });

    return {
      shouldAdd: true,
      newItem
    };
  }

  /**
   * 驗證編輯權限
   */
  validateEditPermission(item: any, field: string, isViewMode: boolean): {
    canEdit: boolean;
    reason?: string;
  } {
    if (isViewMode) {
      return {
        canEdit: false,
        reason: '檢視模式下無法編輯'
      };
    }

    // 檢查特定欄位的編輯權限
    if (item._fromNext2 && item._readonly) {
      return {
        canEdit: false,
        reason: '來自抽成設定的資料不可編輯'
      };
    }

    // 特殊欄位檢查
    if (item._fromNext2 && field === 'cag_charge_rate') {
      return {
        canEdit: false,
        reason: '抽成率來自抽成設定，無法編輯'
      };
    }

    return { canEdit: true };
  }

  /**
   * 處理資料狀態變更
   */
  updateItemStatus(item: any, operation: 'create' | 'update' | 'delete'): any {
    const updatedItem = { ...item };

    switch (operation) {
      case 'create':
        updatedItem._status = 'new';
        updatedItem._isNew = true;
        break;
      case 'update':
        if (updatedItem._status !== 'new') {
          updatedItem._status = 'modified';
        }
        break;
      case 'delete':
        if (updatedItem._status === 'new') {
          // 新增項目可以直接移除
          return null;
        } else {
          updatedItem._status = 'deleted';
        }
        break;
    }

    return updatedItem;
  }

  /**
   * 驗證資料完整性
   */
  validateItemData(item: any, type: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 基本必填欄位檢查
    if (!item.cag_bdate) {
      errors.push('帳務起日期為必填');
    }
    if (!item.cag_edate) {
      errors.push('帳務迄日期為必填');
    }

    // 根據類型進行特定驗證
    switch (type) {
      case 'fixedRent':
        if (!item.base_rent || item.base_rent <= 0) {
          errors.push('租金金額必須大於 0');
        }
        break;
      case 'baseRentHigher':
        if (!item.base_rent || item.base_rent <= 0) {
          errors.push('租金金額必須大於 0');
        }
        break;
      case 'baseCommission':
        if (!item.limit_amt || item.limit_amt <= 0) {
          errors.push('包底金額必須大於 0');
        }
        if (!item.limit_charge_rate || item.limit_charge_rate <= 0) {
          errors.push('抽成率必須大於 0');
        }
        break;
      case 'graduated':
        if (item.start_number >= item.end_number) {
          errors.push('起值必須小於迄值');
        }
        if (!item.charge_rate || item.charge_rate <= 0) {
          errors.push('抽成率必須大於 0');
        }
        break;
      case 'baseTier':
        if (!item.limit_amt || item.limit_amt <= 0) {
          errors.push('包底金額必須大於 0');
        }
        if (item.start_number >= item.end_number) {
          errors.push('起值必須小於迄值');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 格式化成功訊息
   */
  formatSuccessMessage(operation: string, count: number = 1, type?: string): string {
    const typeNames = {
      'fixedRent': '固定租金',
      'baseRentHigher': '底租抽成取高者',
      'baseCommission': '包底抽成',
      'graduated': '階梯式抽成',
      'baseTier': '包底加階梯'
    };

    const typeName = type ? typeNames[type as keyof typeof typeNames] || type : '';

    switch (operation) {
      case 'save':
        return '條件設定已儲存';
      case 'add':
        return `已新增${typeName}項目`;
      case 'delete':
        return `已刪除 ${count} 個項目`;
      case 'update':
        return `已更新${typeName}項目`;
      default:
        return '操作完成';
    }
  }

  /**
   * 格式化錯誤訊息
   */
  formatErrorMessage(operation: string, error: any, type?: string): string {
    const typeNames = {
      'fixedRent': '固定租金',
      'baseRentHigher': '底租抽成取高者',
      'baseCommission': '包底抽成',
      'graduated': '階梯式抽成',
      'baseTier': '包底加階梯'
    };

    const typeName = type ? typeNames[type as keyof typeof typeNames] || type : '';

    switch (operation) {
      case 'save':
        return `儲存${typeName}項目失敗: ${error.message || error}`;
      case 'add':
        return `新增${typeName}項目失敗: ${error.message || error}`;
      case 'delete':
        return `刪除${typeName}項目失敗: ${error.message || error}`;
      case 'update':
        return `更新${typeName}項目失敗: ${error.message || error}`;
      default:
        return `操作失敗: ${error.message || error}`;
    }
  }
}
