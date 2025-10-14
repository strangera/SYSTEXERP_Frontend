// commission-table.service.ts - 專門處理表格事件和數據操作
import { Injectable } from '@angular/core';
import { CommissionItem, DiscountSettingItem, AnnualPerformanceItem, DiscountLevelItem } from '../../tls13010/tls13010.model';
import { ContractFlowService } from '@pages/tls/tls13010/services/contract-flow.service';

export interface OperationResult {
  success: boolean;
  message?: string;
  newItem?: any;
  updatedParent?: CommissionItem;
}

@Injectable({
  providedIn: 'root'
})
export class CommissionTableService {

  constructor(
    private contractFlowService: ContractFlowService,

  ) { }

  /**
   * 處理欄位變更事件
   */
  handleFieldChange(event: { fieldName: string, newValue: any, rowData: any }, commissionData: CommissionItem[]): void {
    const { fieldName, newValue, rowData } = event;

    // 更新欄位值
    rowData[fieldName] = newValue;

    // 更新狀態
    this.updateItemStatus(rowData);

    // 更新主數組中的項目
    this.updateItemInArray(rowData, commissionData);
  }

  /**
   * 處理明細欄位變更事件
   */
  handleDetailFieldChange(event: any, commissionData: CommissionItem[]): void {
    const { fieldName, newValue, detailData, parentData } = event;

    // 更新明細欄位值
    detailData[fieldName] = newValue;

    // 更新明細狀態
    this.updateItemStatus(detailData);

    // 同步到父項目的對應數組
    this.syncDetailToParent(detailData, parentData);

    // 更新父項目狀態
    this.updateItemStatus(parentData);

    // 更新主數組
    this.updateItemInArray(parentData, commissionData);
  }

  /**
   * 處理標籤切換
   */
  handleTabChange(event: { rowData: any, tabId: string }): void {
    const { rowData, tabId } = event;

    // 設定新的標籤
    rowData.currentTab = tabId;

    // 更新顯示項目
    this.updateDetailItems(rowData);
  }

  /**
   * 新增抽成項目
   */
  addCommissionItem(
    existingItems: CommissionItem[],
    contractStartDate: string,
    contractEndDate: string,
    discountOptions: any[]
  ): OperationResult {
    const activeItems = existingItems.filter(item => item._status !== 'deleted');

    if (activeItems.length >= 9) {
      return {
        success: false,
        message: '抽成項目最多只能建立9個'
      };
    }

    // 修正：從 step1 資料獲取預設值（第一優先）
    const step1Data = this.contractFlowService.getStep1Data();

    // 統一轉換為 Y/N 字串格式
    const defaultCapSaletype1 = this.convertToBoolean(step1Data?.cap_saletype1);
    const defaultCapSaletype2 = this.convertToBoolean(step1Data?.cap_saletype2);
    const defaultCapSaletype5 = this.convertToBoolean(step1Data?.cap_saletype5);

    console.log(' 新增抽成項目時的 cap_saletype 預設值:', {
      step1原始資料: {
        cap_saletype1: step1Data?.cap_saletype1,
        cap_saletype2: step1Data?.cap_saletype2
      },
      轉換後YN值: {
        defaultCapSaletype1,
        defaultCapSaletype2
      }
    });

    const nextNumber = activeItems.length;
    const newCommissionItem: CommissionItem = {
      id: this.generateTempId(),
      tlt_id: nextNumber.toString(),
      tlt_id_desc: `抽成類別${nextNumber}`,
      cag_taxtype: '1',
      discountSummary: '尚未設定',
      sst_amount: 0,
      sst_rate: 0,

      // 關鍵修正：使用 Y/N 字串格式
      cap_saletype1: defaultCapSaletype1,
      cap_saletype2: defaultCapSaletype2,
      cap_saletype5: defaultCapSaletype5,

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
    this.updateDetailItems(newCommissionItem);

    return {
      success: true,
      message: `已新增${newCommissionItem.tlt_id_desc}`,
      newItem: newCommissionItem
    };
  }

  /**
   * 統一轉換為 boolean（處理 Y/N 或 true/false）
   */
  private convertToBoolean(value: any): boolean {
    if (value === 'Y' || value === 'y' || value === true || value === 'true') {
      return true;
    }
    return false;
  }

  /**
   * 新增明細項目
   */
  addDetailItem(
    parentItem: CommissionItem,
    contractStartDate: string,
    contractEndDate: string
  ): OperationResult {
    const currentTab = parentItem.currentTab || 'discount';

    switch (currentTab) {
      case 'discount':
        return this.addDiscountItem(parentItem, contractStartDate, contractEndDate);
      case 'annual':
        return this.addAnnualItem(parentItem);
      case 'level':
        return this.addLevelItem(parentItem, contractStartDate, contractEndDate);
      default:
        return { success: false, message: '未知的項目類型' };
    }
  }

  /**
   * 批次刪除項目
   */
  batchDeleteItems(selectedItems: any[], commissionData: CommissionItem[]): void {
    selectedItems.forEach(item => {
      if (item._status === 'new' || !this.hasValidId(item)) {
        const index = commissionData.findIndex(x => x.id === item.id);
        if (index > -1) {
          commissionData.splice(index, 1);
        }
      } else {
        item._status = 'deleted';
      }
    });
  }

  /**
   * 處理明細批次刪除
   */
  handleDetailBatchDelete(event: { selectedDetails: any[], parentData: any }): boolean {
    const { selectedDetails, parentData } = event;
    const currentTab = parentData.currentTab || 'discount';

    if (!confirm(`確定要刪除選取的 ${selectedDetails.length} 個明細項目嗎？`)) {
      return false;
    }

    selectedDetails.forEach(detail => {
      if (detail._status === 'new') {
        this.removeFromArray(parentData, detail, currentTab);
      } else {
        detail._status = 'deleted';
      }
    });

    this.updateDetailItems(parentData);
    return true;
  }

  /**
   * 更新項目的 detailItems 顯示
   */
  updateDetailItems(commissionItem: CommissionItem): void {
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

  // === 私有方法 ===

  /**
   * 新增折扣項目
   */
  private addDiscountItem(parentItem: CommissionItem, contractStartDate: string, contractEndDate: string): OperationResult {
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
    this.updateDetailItems(parentItem);
    this.updateItemStatus(parentItem);

    return { success: true, newItem, updatedParent: parentItem };
  }

  /**
   * 新增年度業績項目
   */
  private addAnnualItem(parentItem: CommissionItem): OperationResult {
    const dateRange = this.calculateNextAnnualDateRange(parentItem);

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
    this.updateDetailItems(parentItem);
    this.updateItemStatus(parentItem);

    return { success: true, newItem, updatedParent: parentItem };
  }

  /**
   * 新增層級項目
   */
  private addLevelItem(parentItem: CommissionItem, contractStartDate: string, contractEndDate: string): OperationResult {
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
    this.updateDetailItems(parentItem);
    this.updateItemStatus(parentItem);

    return { success: true, newItem, updatedParent: parentItem };
  }

  /**
   * 計算下一個年度業績日期範圍
   */
  private calculateNextAnnualDateRange(parentItem: CommissionItem): {
    isValid: boolean;
    startDate?: Date;
    endDate?: Date;
    errorMessage?: string;
  } {
    const contractStartDate = this.parseDate(parentItem.mainStartDate);
    const contractEndDate = this.parseDate(parentItem.mainEndDate);

    const existingItems = parentItem.annualPerformanceItems?.filter(item => item._status !== 'deleted') || [];

    if (existingItems.length === 0) {
      return {
        isValid: true,
        startDate: contractStartDate,
        endDate: contractEndDate
      };
    }

    // 找出最後一個項目的結束日期
    const latestEndDate = existingItems.reduce((latest, item) => {
      const itemEndDate = this.parseDate(item.tlt_edate);
      return itemEndDate > latest ? itemEndDate : latest;
    }, new Date('1900-01-01'));

    // 計算下一個區間的起始日期
    const nextStartDate = new Date(latestEndDate);
    nextStartDate.setDate(nextStartDate.getDate() + 1);

    if (nextStartDate > contractEndDate) {
      return {
        isValid: false,
        errorMessage: '合約期間內已無可用的日期區間，請調整現有項目的日期設定'
      };
    }

    return {
      isValid: true,
      startDate: nextStartDate,
      endDate: contractEndDate
    };
  }

  /**
   * 初始化折扣項目
   */
  private initializeDiscountItems(contractStartDate: string, contractEndDate: string, discountOptions: any[]): DiscountSettingItem[] {
    if (!discountOptions || discountOptions.length === 0) {
      return [];
    }

    return discountOptions.map((option, index) => {
      const isFirstOption = index === 0;
      const is000Option = option.value === '000' || option.label?.includes('正品');
      const shouldSelectByDefault = isFirstOption && is000Option;

      return {
        id: `temp_discount_${Date.now()}_${index}`,
        selected: shouldSelectByDefault,
        cag_barcode: option.value,
        tlt_bdate: new Date(contractStartDate),
        tlt_edate: new Date(contractEndDate),
        cag_charge_rate: 0,
        _status: shouldSelectByDefault ? 'new' : 'new',
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault
      };
    });
  }

  /**
   * 初始化層級項目
   */
  private initializeLevelItems(contractStartDate: string, contractEndDate: string, discountOptions: any[]): DiscountLevelItem[] {
    if (!discountOptions || discountOptions.length === 0) {
      return [];
    }

    return discountOptions.map((option, index) => {
      const isFirstOption = index === 0;
      const is000Option = option.value === '000' || option.label?.includes('正品');
      const shouldSelectByDefault = isFirstOption && is000Option;

      return {
        id: `temp_level_${Date.now()}_${index}`,
        selected: shouldSelectByDefault,
        cag_barcode: option.value,
        level_bmount: 0,
        level_eamount: 0,
        level_charge_rate: 0,
        _status: shouldSelectByDefault ? 'new' : 'new',
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault
      };
    });
  }

  /**
   * 同步明細到父項目
   */
  private syncDetailToParent(detailData: any, parentData: any): void {
    const currentTab = parentData.currentTab || 'discount';
    const detailId = detailData.id;

    switch (currentTab) {
      case 'discount':
        this.updateDetailInArray(parentData.discountSettingItems, detailId, detailData);
        break;
      case 'annual':
        this.updateDetailInArray(parentData.annualPerformanceItems, detailId, detailData);
        break;
      case 'level':
        this.updateDetailInArray(parentData.discountLevelItems, detailId, detailData);
        break;
    }

    // 同時更新 detailItems
    this.updateDetailInArray(parentData.detailItems, detailId, detailData);
  }

  /**
   * 更新數組中的項目
   */
  private updateDetailInArray(array: any[], itemId: string, newData: any): void {
    if (!Array.isArray(array)) return;

    const index = array.findIndex(item => item.id === itemId);
    if (index > -1) {
      array[index] = { ...newData };
    }
  }

  /**
   * 從數組中移除項目
   */
  private removeFromArray(parentItem: CommissionItem, item: any, type: string): void {
    switch (type) {
      case 'discount':
        {
          const index = parentItem.discountSettingItems.findIndex(d => d.id === item.id);
          if (index > -1) {
            parentItem.discountSettingItems.splice(index, 1);
          }
          break;
        }
      case 'annual':
        {
          const index = parentItem.annualPerformanceItems.findIndex(d => d.id === item.id);
          if (index > -1) {
            parentItem.annualPerformanceItems.splice(index, 1);
          }
          break;
        }
      case 'level':
        {
          const index = parentItem.discountLevelItems.findIndex(d => d.id === item.id);
          if (index > -1) {
            parentItem.discountLevelItems.splice(index, 1);
          }
          break;
        }
    }
  }

  /**
   * 更新項目在主數組中的引用
   */
  private updateItemInArray(modifiedItem: any, commissionData: CommissionItem[]): void {
    const index = commissionData.findIndex(item => item.id === modifiedItem.id);
    if (index > -1) {
      commissionData[index] = { ...modifiedItem };
    }
  }

  /**
   * 更新項目狀態
   */
  private updateItemStatus(item: any): any {
    if (item._status === 'new') {
      return item;
    }

    if (item._status === 'original' || !item._status) {
      item._status = 'modified';
    }

    return item;
  }

  /**
   * 解析日期
   */
  private parseDate(dateInput: any): Date {
    if (!dateInput) return new Date();
    if (dateInput instanceof Date) return new Date(dateInput);

    if (typeof dateInput === 'string' && dateInput.includes('T')) {
      const datePart = dateInput.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    try {
      return new Date(dateInput);
    } catch {
      return new Date();
    }
  }

  /**
   * 檢查是否有有效ID
   */
  private hasValidId(item: any): boolean {
    return item.id &&
      !String(item.id).startsWith('temp_') &&
      !isNaN(Number(item.id)) &&
      Number(item.id) > 0;
  }

  /**
   * 生成臨時ID
   */
  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }
}
