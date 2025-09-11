import {
  CommissionItem,
  DiscountSettingItem,
  AnnualPerformanceItem,
  DiscountLevelItem
} from './../../tls13010/tls13010.model';
// commission-item-operations.service.ts
import { Injectable } from '@angular/core';

export interface ItemOperationResult {
  success: boolean;
  message?: string;
  newItem?: any;
  updatedParent?: CommissionItem;
}

@Injectable({
  providedIn: 'root'
})
export class CommissionItemOperationsService {

  constructor() { }

  /**
   * 新增主要抽成項目
   */
  addCommissionItem(
    existingItems: CommissionItem[],
    contractStartDate: string,
    contractEndDate: string,
    discountOptions: any[]
  ): ItemOperationResult {

    const activeItems = existingItems.filter(item => item._status !== 'deleted');

    if (activeItems.length >= 9) {
      return {
        success: false,
        message: '抽成項目最多只能建立9個'
      };
    }

    const nextNumber = activeItems.length;
    const tlt_id = nextNumber.toString();
    const tlt_id_desc = `抽成類別${nextNumber}`;

    const newCommissionItem: CommissionItem = {
      id: this.generateTempId(),
      tlt_id,
      tlt_id_desc,
      cag_taxtype: 1,
      discountSummary: '尚未設定',
      sst_amount: 0,
      sst_rate: 0,
      cap_saletype2: false,
      cap_saletype1: false,
      selectedSettingOption: 'discount',
      currentTab: 'discount',
      discountSettingItems: this.initializeDiscountItems(contractStartDate, contractEndDate, discountOptions),
      annualPerformanceItems: [],
      discountLevelItems: this.initializeLevelItems(contractStartDate, contractEndDate, discountOptions),
      detailItems: [],
      _status: 'new',
      mainStartDate: contractStartDate,
      mainEndDate: contractEndDate
    };

    // 設定初始的 detailItems
    this.updateItemDetailItems(newCommissionItem);

    return {
      success: true,
      message: `已新增${tlt_id_desc}`,
      newItem: newCommissionItem
    };
  }

  /**
   * 新增明細項目（統一入口）
   */
  addDetailItem(
    parentItem: CommissionItem,
    type: 'discount' | 'annual' | 'level',
    contractStartDate: string,
    contractEndDate: string
  ): ItemOperationResult {

    // 確保 parentItem 有 mainStartDate 和 mainEndDate
    if (!parentItem.mainStartDate) {
      parentItem.mainStartDate = contractStartDate;
    }
    if (!parentItem.mainEndDate) {
      parentItem.mainEndDate = contractEndDate;
    }

    switch (type) {
      case 'discount':
        return this.addDiscountSettingItem(parentItem, contractStartDate, contractEndDate);
      case 'annual':
        return this.addAnnualPerformanceItem(parentItem); // 不再需要傳遞日期參數
      case 'level':
        return this.addDiscountLevelItem(parentItem, contractStartDate, contractEndDate);
      default:
        return { success: false, message: '未知的項目類型' };
    }
  }
  /**
   * 新增折扣設定項目
   */
  private addDiscountSettingItem(
    parentItem: CommissionItem,
    contractStartDate: string,
    contractEndDate: string
  ): ItemOperationResult {

    if (!parentItem.discountSettingItems) {
      parentItem.discountSettingItems = [];
    }

    const newItem: DiscountSettingItem = {
      id: this.generateTempId(),
      selected: false,
      cag_barcode: '',
      tlt_bdate: new Date(contractStartDate),
      tlt_edate: new Date(contractEndDate),
      cag_charge_rate: 0,
      _status: 'new',
      is_configured: false,
      is_enabled: false
    };

    parentItem.discountSettingItems.push(newItem);

    // 如果當前標籤是 discount，同時更新 detailItems
    if (parentItem.currentTab === 'discount') {
      const displayItem = { ...newItem, _originalType: 'discount' };
      parentItem.detailItems.push(displayItem);
    }

    this.markParentAsModified(parentItem);

    return {
      success: true,
      newItem,
      updatedParent: parentItem
    };
  }

  /**
   * 新增年度業績項目
   */
  private addAnnualPerformanceItem(parentItem: CommissionItem): ItemOperationResult {
    if (!parentItem.annualPerformanceItems) {
      parentItem.annualPerformanceItems = [];
    }

    // 計算新項目的日期區間（避免重疊）
    const dateRange = this.calculateNextAnnualDateRangeWithoutOverlap(parentItem);

    if (!dateRange.isValid) {
      return {
        success: false,
        message: dateRange.errorMessage || '無法計算有效的日期區間'
      };
    }

    const newItem: AnnualPerformanceItem = {
      id: this.generateTempId(),
      selected: false,
      tlt_bdate: dateRange.startDate!,
      tlt_edate: dateRange.endDate!,
      year_amount: 0,
      extra_rate: 0,
      _status: 'new'
    };

    parentItem.annualPerformanceItems.push(newItem);

    // 如果當前標籤是 annual，同時更新 detailItems
    if (parentItem.currentTab === 'annual') {
      const displayItem = { ...newItem, _originalType: 'annual' };
      parentItem.detailItems.push(displayItem);
    }

    this.markParentAsModified(parentItem);

    return {
      success: true,
      newItem,
      updatedParent: parentItem
    };
  }

  private calculateNextAnnualDateRangeWithoutOverlap(parentItem: CommissionItem): {
    isValid: boolean;
    startDate?: Date;
    endDate?: Date;
    errorMessage?: string;
  } {
    const contractStartDate = this.parseDate(parentItem.mainStartDate);
    const contractEndDate = this.parseDate(parentItem.mainEndDate);
    console.log('這裡:', parentItem.mainStartDate);
    console.log('這裡:', parentItem.mainEndDate);

    console.log('這裡:', contractStartDate);
    console.log('這裡:', contractEndDate);
    // 測試版本：如果非刪除項目少於等於1個，直接使用合約日期
    if (parentItem.annualPerformanceItems?.filter(item => item._status !== 'deleted').length <= 1) {
      console.log('項目數量少於等於1，使用合約日期');
      return {
        isValid: true,
        startDate: contractStartDate,
        endDate: contractEndDate
      };
    }

    // 檢查是否所有項目都沒有實際的日期資料
    const hasAnyRealData = parentItem.annualPerformanceItems.some(item => {
      if (item._status === 'deleted') return false;

      // 檢查是否有真實的日期資料（不是預設值或無效值）
      const hasDate = item.tlt_bdate && item.tlt_edate;
      const startDate = hasDate ? new Date(item.tlt_bdate) : null;
      const endDate = hasDate ? new Date(item.tlt_edate) : null;

      return startDate && endDate &&
        !isNaN(startDate.getTime()) &&
        !isNaN(endDate.getTime()) &&
        startDate.getTime() !== endDate.getTime(); // 排除相同日期的無效項目
    });

    console.log('是否有真實資料:', hasAnyRealData);

    // 如果沒有任何真實資料，直接使用合約日期
    if (!hasAnyRealData) {
      console.log('沒有真實資料，使用合約日期');
      return {
        isValid: true,
        startDate: contractStartDate,
        endDate: contractEndDate
      };
    }

    // 其餘的區間計算邏輯保持不變...
    console.log('有真實資料，執行區間計算');

    const validItems = parentItem.annualPerformanceItems.filter(item =>
      item._status !== 'deleted' &&
      item.tlt_bdate &&
      item.tlt_edate &&
      !isNaN(new Date(item.tlt_bdate).getTime()) &&
      !isNaN(new Date(item.tlt_edate).getTime())
    );

    const occupiedRanges = validItems.map(item => ({
      start: new Date(item.tlt_bdate),
      end: new Date(item.tlt_edate)
    })).sort((a, b) => a.start.getTime() - b.start.getTime());

    let availableStart = contractStartDate;

    for (const range of occupiedRanges) {
      if (availableStart < range.start) {
        const availableEnd = new Date(range.start);
        availableEnd.setDate(availableEnd.getDate() - 1);

        if (availableEnd >= availableStart) {
          return {
            isValid: true,
            startDate: availableStart,
            endDate: availableEnd
          };
        }
      }

      const nextStart = new Date(range.end);
      nextStart.setDate(nextStart.getDate() + 1);
      availableStart = nextStart;
    }

    if (availableStart <= contractEndDate) {
      return {
        isValid: true,
        startDate: availableStart,
        endDate: contractEndDate
      };
    }

    return {
      isValid: false,
      errorMessage: '合約期間內已無可用的日期區間，請調整現有項目的日期設定'
    };
  }

  // private calculateNextAnnualDateRange(parentItem: CommissionItem): { startDate: Date, endDate: Date } {
  //   // 獲取合約的總體日期範圍
  //   const contractStartDate = this.parseDate(parentItem.mainStartDate);
  //   const contractEndDate = this.parseDate(parentItem.mainEndDate);

  //   // 如果沒有現有的年度業績項目，使用合約起始日期
  //   const existingItems = parentItem.annualPerformanceItems?.filter(item => item._status !== 'deleted') || [];

  //   if (existingItems.length === 0) {
  //     return {
  //       startDate: contractStartDate,
  //       endDate: contractEndDate
  //     };
  //   }

  //   // 找出最後一個項目的結束日期
  //   const latestEndDate = existingItems.reduce((latest, item) => {
  //     const itemEndDate = this.parseDate(item.tlt_edate);
  //     return itemEndDate > latest ? itemEndDate : latest;
  //   }, new Date('1900-01-01'));

  //   // 計算下一個區間的起始日期（最後結束日期的隔天）
  //   const nextStartDate = new Date(latestEndDate);
  //   nextStartDate.setDate(nextStartDate.getDate() + 1);

  //   // 檢查是否還有可用的日期範圍
  //   if (nextStartDate > contractEndDate) {
  //     // 如果超出合約範圍，返回一個提示性的範圍
  //     return {
  //       startDate: contractEndDate,
  //       endDate: contractEndDate
  //     };
  //   }

  //   // 嘗試分配一年的區間，但不能超過合約結束日期
  //   const nextEndDate = new Date(nextStartDate);
  //   nextEndDate.setFullYear(nextEndDate.getFullYear() + 1);
  //   nextEndDate.setDate(nextEndDate.getDate() - 1); // 設為12/31

  //   // 確保不超過合約結束日期
  //   const finalEndDate = nextEndDate > contractEndDate ? contractEndDate : nextEndDate;

  //   return {
  //     startDate: nextStartDate,
  //     endDate: finalEndDate
  //   };
  // }

  private parseDate(dateInput: any): Date {
    console.log('🔍 parseDate 輸入:', dateInput, '類型:', typeof dateInput);

    if (!dateInput) {
      return new Date();
    }

    // 如果已經是 Date 對象，直接使用
    if (dateInput instanceof Date) {
      return new Date(dateInput);
    }

    // 如果是字符串，特別處理避免時區問題
    if (typeof dateInput === 'string') {
      // 🎯 關鍵修正：如果是 ISO 字符串，先提取日期部分
      if (dateInput.includes('T')) {
        const datePart = dateInput.split('T')[0];
        console.log('🔧 從 ISO 字符串提取日期部分:', datePart);

        // 使用 YYYY-MM-DD 格式創建本地時間的 Date 對象
        const [year, month, day] = datePart.split('-').map(Number);
        const result = new Date(year, month - 1, day); // month 是 0-based
        console.log('🔧 創建的 Date 對象:', result);
        return result;
      }

      // 🎯 如果是純日期字符串 YYYY-MM-DD，直接用構造函數創建本地時間
      if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateInput.split('-').map(Number);
        const result = new Date(year, month - 1, day); // month 是 0-based
        console.log('🔧 從純日期字符串創建的 Date 對象:', result);
        return result;
      }

      // 其他字符串格式，正常解析
      const result = new Date(dateInput);
      console.log('🔧 一般解析的 Date 對象:', result);
      return result;
    }

    // 其他類型，嘗試轉換
    const result = new Date(dateInput);
    console.log('🔧 其他類型轉換的 Date 對象:', result);
    return result;
  }


  /**
   * 新增折扣層級項目
   */
  private addDiscountLevelItem(
    parentItem: CommissionItem,
    contractStartDate: string,
    contractEndDate: string
  ): ItemOperationResult {

    if (!parentItem.discountLevelItems) {
      parentItem.discountLevelItems = [];
    }

    const newItem: DiscountLevelItem = {
      id: this.generateTempId(),
      selected: false,
      cag_barcode: '',
      level_bmount: 0,
      level_eamount: 0,
      level_charge_rate: 0,
      _status: 'new',
      is_configured: false,
      is_enabled: false
    };

    parentItem.discountLevelItems.push(newItem);

    // 如果當前標籤是 level，同時更新 detailItems
    if (parentItem.currentTab === 'level') {
      const displayItem = { ...newItem, _originalType: 'level' };
      parentItem.detailItems.push(displayItem);
    }

    this.markParentAsModified(parentItem);

    return {
      success: true,
      newItem,
      updatedParent: parentItem
    };
  }

  /**
   * 移除明細項目
   */
  removeDetailItem(
    parentItem: CommissionItem,
    itemIndex: number,
    type: 'discount' | 'annual' | 'level'
  ): ItemOperationResult {

    let targetArray: any[];
    let targetItem: any;

    switch (type) {
      case 'discount':
        targetArray = parentItem.discountSettingItems;
        break;
      case 'annual':
        targetArray = parentItem.annualPerformanceItems;
        break;
      case 'level':
        targetArray = parentItem.discountLevelItems;
        break;
      default:
        return { success: false, message: '未知的項目類型' };
    }

    if (itemIndex < 0 || itemIndex >= targetArray.length) {
      return { success: false, message: '項目索引無效' };
    }

    targetItem = targetArray[itemIndex];

    if (targetItem._status === 'new') {
      // 新項目直接移除
      targetArray.splice(itemIndex, 1);
    } else {
      // 現有項目標記為已刪除
      targetItem._status = 'deleted';
    }

    this.markParentAsModified(parentItem);

    return {
      success: true,
      updatedParent: parentItem
    };
  }

  /**
   * 批次刪除明細項目
   */
  batchDeleteDetailItems(
    parentItem: CommissionItem,
    selectedItems: any[],
    type: 'discount' | 'annual' | 'level'
  ): ItemOperationResult {

    let deletedCount = 0;

    selectedItems.forEach(item => {
      if (item._status === 'new' || !this.hasValidId(item.id)) {
        // 新項目直接從陣列移除
        this.removeFromArray(parentItem, item, type);
        deletedCount++;
      } else {
        // 現有項目標記為已刪除
        this.markItemAsDeleted(parentItem, item, type);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      this.markParentAsModified(parentItem);
    }

    return {
      success: true,
      message: `已刪除 ${deletedCount} 個項目`,
      updatedParent: parentItem
    };
  }

  /**
   * 更新項目的 detailItems 顯示
   */
  updateItemDetailItems(commissionItem: CommissionItem): void {
    const currentTab = commissionItem.currentTab || 'discount';

    switch (currentTab) {
      case 'discount':
        commissionItem.detailItems = commissionItem.discountSettingItems
          .filter(item => item._status !== 'deleted')
          .map(item => ({ ...item, _originalType: 'discount' }));
        break;
      case 'annual':
        commissionItem.detailItems = commissionItem.annualPerformanceItems
          .filter(item => item._status !== 'deleted')
          .map(item => ({ ...item, _originalType: 'annual' }));
        break;
      case 'level':
        commissionItem.detailItems = commissionItem.discountLevelItems
          .filter(item => item._status !== 'deleted')
          .map(item => ({ ...item, _originalType: 'level' }));
        break;
    }
  }

  // ============ 私有工具方法 ============

  private initializeDiscountItems(
    contractStartDate: string,
    contractEndDate: string,
    discountOptions: any[]
  ): DiscountSettingItem[] {

    if (!discountOptions || discountOptions.length === 0) {
      return [];
    }

    return discountOptions.map((option, index) => {
      // 🎯 關鍵修改：預設勾選第一個選項且是 "000-正品"
      const isFirstOption = index === 0;
      const is000Option = option.value === '000' || option.label?.includes('正品');
      const shouldSelectByDefault = isFirstOption && is000Option;

      return {
        id: `temp_discount_${Date.now()}_${index}`,
        selected: shouldSelectByDefault, // 第一個且是 000-正品 時預設勾選
        cag_barcode: option.value,
        tlt_bdate: new Date(contractStartDate),
        tlt_edate: new Date(contractEndDate),
        cag_charge_rate: 0, // 可以設定預設抽成率，例如 0
        _status: shouldSelectByDefault ? 'new' : 'new',
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault
      };
    });
  }


  private initializeLevelItems(
    contractStartDate: string,
    contractEndDate: string,
    discountOptions: any[]
  ): DiscountLevelItem[] {

    if (!discountOptions || discountOptions.length === 0) {
      return [];
    }

    return discountOptions.map((option, index) => {
      // 🎯 關鍵修改：預設勾選第一個選項且是 "000-正品"
      const isFirstOption = index === 0;
      const is000Option = option.value === '000' || option.label?.includes('正品');
      const shouldSelectByDefault = isFirstOption && is000Option;

      return {
        id: `temp_level_${Date.now()}_${index}`,
        selected: shouldSelectByDefault, // 第一個且是 000-正品 時預設勾選
        cag_barcode: option.value,
        level_bmount: 0,
        level_eamount: 0,
        level_charge_rate: 0, // 可以設定預設抽成率
        _status: shouldSelectByDefault ? 'new' : 'new',
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault
      };
    });
  }

  private markParentAsModified(parentItem: CommissionItem): void {
    if (parentItem._status === 'original') {
      parentItem._status = 'modified';
    }
  }

  private removeFromArray(parentItem: CommissionItem, item: any, type: 'discount' | 'annual' | 'level'): void {
    switch (type) {
      case 'discount':
        {
          const discountIndex = parentItem.discountSettingItems.findIndex(d => d.id === item.id);
          if (discountIndex > -1) {
            parentItem.discountSettingItems.splice(discountIndex, 1);
          }
          break;
        }
      case 'annual':
        {
          const annualIndex = parentItem.annualPerformanceItems.findIndex(d => d.id === item.id);
          if (annualIndex > -1) {
            parentItem.annualPerformanceItems.splice(annualIndex, 1);
          }
          break;
        }
      case 'level':
        {
          const levelIndex = parentItem.discountLevelItems.findIndex(d => d.id === item.id);
          if (levelIndex > -1) {
            parentItem.discountLevelItems.splice(levelIndex, 1);
          }
          break;
        }
    }
  }

  private markItemAsDeleted(
    parentItem: CommissionItem,
    item: any,
    type: 'discount' | 'annual' | 'level'
  ): void {
    switch (type) {
      case 'discount': {
        const discountIndex = parentItem.discountSettingItems.findIndex(d => d.id === item.id);
        if (discountIndex > -1) {
          parentItem.discountSettingItems.splice(discountIndex, 1);
        }
        break;
      }
      case 'annual': {
        const annualIndex = parentItem.annualPerformanceItems.findIndex(d => d.id === item.id);
        if (annualIndex > -1) {
          parentItem.annualPerformanceItems.splice(annualIndex, 1);
        }
        break;
      }
      case 'level': {
        const levelIndex = parentItem.discountLevelItems.findIndex(d => d.id === item.id);
        if (levelIndex > -1) {
          parentItem.discountLevelItems.splice(levelIndex, 1);
        }
        break;
      }
    }
  }

  private hasValidId(id: any): boolean {
    return id &&
      !String(id).startsWith('temp_') &&
      !isNaN(Number(id)) &&
      Number(id) > 0;
  }

  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }


}
