// commission-table.service.ts - 專門處理表格事件和數據操作 (修正後版本)
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
   * 處理明細欄位變更事件 (強化 Discount 與 Level 的同步控制)
   */
  handleDetailFieldChange(event: any, commissionData: CommissionItem[]): void {
    const { fieldName, newValue, detailData, parentData } = event;

    // 1. 更新明細欄位值
    detailData[fieldName] = newValue;

    // 2. 更新明細狀態
    this.updateItemStatus(detailData);

    // 3. 處理 DiscountSettingItem 的 is_enabled / selected 變更
    if (parentData.currentTab === 'discount' && (fieldName === 'is_enabled' || fieldName === 'selected')) {
      // 確保 selected 和 is_enabled 保持同步，這裡使用 selected 代表勾選狀態
      const discountItem: DiscountSettingItem = detailData;
      discountItem.selected = newValue;
      discountItem.is_enabled = newValue;

      // 🔑 關鍵：當 Discount 的勾選狀態改變時，立即同步 Level
      this.syncDiscountLevelBasedOnSelection(parentData, discountItem);
    }

    // 4. 同步到父項目的對應數組
    this.syncDetailToParent(detailData, parentData);

    // 5. 更新父項目狀態
    this.updateItemStatus(parentData);

    // 6. 更新主數組
    this.updateItemInArray(parentData, commissionData);
  }

  // 根據折扣設定的勾選狀態，同步處理層級抽成項目
  syncDiscountLevelBasedOnSelection(parentItem: CommissionItem, discountItem: DiscountSettingItem): void {
    const linkedLevelItems = parentItem.discountLevelItems?.filter(
      level => level.charged_id === discountItem.id
    ) || [];

    console.log(`🔍 syncDiscountLevelBasedOnSelection:`, {
      discountId: discountItem.id,
      discountBarcode: discountItem.cag_barcode,
      discountSelected: discountItem.selected,
      discountSource: discountItem._source,
      linkedLevelCount: linkedLevelItems.length
    });

    if (discountItem.selected) {
      // --- 勾選邏輯 ---
      if (linkedLevelItems.length === 0) {


        // 🔑 不管 discount 是 API 還是 new，只要沒有對應的 level 就新增
        const contractPeriod = this.formatContractPeriod(discountItem.tlt_bdate, discountItem.tlt_edate);

        const newLevelItem: DiscountLevelItem = {
          id: this.generateTempId(),
          _source: 'new',  // 🆕 前端新增的
          selected: true,
          cag_barcode: discountItem.cag_barcode,
          contract_period: contractPeriod,  // 🆕 合約期間
          level_bmount: 0,
          level_eamount: 0,
          level_charge_rate: 0,
          charged_id: discountItem.id,
          _status: 'new',
          is_configured: true,
          is_enabled: true
        };
        parentItem.discountLevelItems.push(newLevelItem);
        console.log(`✅ 已為折扣 ${discountItem.cag_barcode} (ID: ${discountItem.id}) 新增一個 Level 項目 (ID: ${newLevelItem.id})`);
      } else if (linkedLevelItems.length > 0) {
        // 如果已存在 level，將 selected 設為 true
        linkedLevelItems.forEach(level => {
          level.selected = false;
        });
        console.log(`🔄 已將折扣 ${discountItem.cag_barcode} 的 ${linkedLevelItems.length} 個 Level 項目 selected 設為 true`);
      }
    } else {
      // --- 取消勾選邏輯（方案 B：只更新 selected 狀態）---
      linkedLevelItems.forEach(level => {
        level.selected = false;  // 🆕 只設定 selected = false，不刪除
      });
      console.log(`🔄 已將折扣 ${discountItem.cag_barcode} 的 ${linkedLevelItems.length} 個 Level 項目 selected 設為 false`);
    }

    // 重新計算 Level 顯示
    this.updateDetailItems(parentItem);
  }

  /**
   * 🆕 格式化合約期間顯示
   */
  private formatContractPeriod(startDate: any, endDate: any): string {
    const formatDate = (date: any) => {
      if (!date) return '';
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    };

    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start && end ? `${start} ~ ${end}` : '';
  }

  // 保持原有代碼，並從此處開始向下貼上...

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

    console.log('🆕 新增抽成項目時的 cap_saletype 預設值:', {
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
      discountLevelItems: [], // 先初始化為空陣列
      detailItems: [],
      _status: 'new',
      mainStartDate: contractStartDate,
      mainEndDate: contractEndDate
    };

    // 🆕 立即同步折扣設定到層級抽成
    // 這樣已勾選的折扣設定（例如預設的正品）會自動產生對應的層級項目
    // 由於 initializeDiscountItems 已經生成了帶有 temp ID 的 Discount Items
    // 這裡我們需要手動觸發 Level 的生成
    newCommissionItem.discountSettingItems.filter(d => d.selected).forEach(selectedDiscount => {
      this.syncDiscountLevelBasedOnSelection(newCommissionItem, selectedDiscount);
    });

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
      if (currentTab === 'discount') {
        const discountItem: DiscountSettingItem = detail;
        // 如果是 Discount 刪除，強制同步 Level
        discountItem.selected = false;
        discountItem.is_enabled = false;
        this.syncDiscountLevelBasedOnSelection(parentData, discountItem); // 標記 Level deleted 或移除

        if (discountItem._status === 'new' || !this.hasValidId(discountItem)) {
          this.removeFromArray(parentData, discountItem, currentTab); // 移除 Discount
        } else {
          discountItem._status = 'deleted'; // 標記 Discount deleted
        }

      } else if (detail._status === 'new' || !this.hasValidId(detail)) {
        this.removeFromArray(parentData, detail, currentTab);
      } else {
        detail._status = 'deleted';
      }
    });

    this.updateDetailItems(parentData);
    return true;
  }

  /**
   * 複製折扣設定項目
   */
  copyDiscountItem(
    sourceItem: DiscountSettingItem,
    parentItem: CommissionItem,
    discountOptions: any[]
  ): OperationResult {
    const newDiscountId = this.generateTempId();

    const newItem: DiscountSettingItem = {
      id: newDiscountId,
      selected: sourceItem.selected,
      cag_barcode: sourceItem.cag_barcode,
      tlt_bdate: new Date(sourceItem.tlt_bdate),
      tlt_edate: new Date(sourceItem.tlt_edate),
      cag_charge_rate: sourceItem.cag_charge_rate,
      _status: 'new',
      is_configured: sourceItem.is_configured,
      is_enabled: sourceItem.is_enabled
    };

    parentItem.discountSettingItems.push(newItem);

    // 🆕 如果新複製的折扣設定是已勾選的，需要同步產生對應的層級抽成項目
    if (newItem.selected) {
      // 找出原始折扣設定關聯的層級項目
      // 注意：這裡應該用 sourceItem 的 ID 找，因為要複製的是它的 Level 內容
      const relatedLevelItems = parentItem.discountLevelItems?.filter(
        level => level.charged_id === sourceItem.id && level._status !== 'deleted'
      ) || [];

      // 為新複製的折扣設定產生對應的層級項目
      relatedLevelItems.forEach(sourceLevelItem => {
        const newLevelItem: DiscountLevelItem = {
          id: this.generateTempId(), // 確保是新的 ID
          selected: sourceLevelItem.selected,
          cag_barcode: newItem.cag_barcode,
          level_bmount: sourceLevelItem.level_bmount,
          level_eamount: sourceLevelItem.level_eamount,
          level_charge_rate: sourceLevelItem.level_charge_rate,
          charged_id: newDiscountId, // 🔑 關鍵：使用新折扣設定的 ID 關聯
          _status: 'new', // 複製的 Level 也是本次新增
          is_configured: sourceLevelItem.is_configured,
          is_enabled: sourceLevelItem.is_enabled
        };

        parentItem.discountLevelItems.push(newLevelItem);
      });

      console.log('📋 複製折扣設定並同步層級抽成:', {
        原始折扣ID: sourceItem.id,
        新折扣ID: newDiscountId,
        複製的層級項目數: relatedLevelItems.length
      });
    }

    this.updateDetailItems(parentItem);
    this.updateItemStatus(parentItem);

    return {
      success: true,
      message: `已複製折扣設定項目${newItem.selected && parentItem.discountLevelItems?.filter(l => l.charged_id === newDiscountId).length > 0 ? ` (包含 ${parentItem.discountLevelItems.filter(l => l.charged_id === newDiscountId).length} 個層級抽成項目)` : ''}`,
      newItem,
      updatedParent: parentItem
    };
  }

  /**
   * 從折扣設定取得層級抽成的下拉選項
   * 返回原始的折扣別選項即可,不需要特殊處理
   * charged_id 只是內部關聯用,不影響選項顯示
   */
  getDiscountOptionsForLevel(parentItem: CommissionItem, discountOptions: any[]): any[] {
    // 直接返回原始的折扣別選項
    // 因為 cag_barcode 是獨立欄位,不需要改成用 ID
    return discountOptions;
  }

  /**
   * 🔧 修正後的同步邏輯
   *
   * 核心原則: 當 Level 項目進入 Level 畫面時，它必須連結到一個 "有效" 的 Discount Item。
   * 此函式主要用於清理無效 Level 項目（已無對應 Discount）
   *
   */
  syncDiscountToLevel(parentItem: CommissionItem, discountOptions: any[]): void {
    console.log('🔄 同步折扣設定到層級抽成 (方案 B：基於 selected 狀態)');

    if (!parentItem.discountLevelItems) {
      parentItem.discountLevelItems = [];
    }

    // 取得所有「有效」的折扣設定 (已勾選且未刪除)
    const validDiscounts = parentItem.discountSettingItems
      ?.filter(item => item.selected && item._status !== 'deleted') || [];

    // 建立有效 discount 的 ID 集合
    const validDiscountIds = new Set(validDiscounts.map(d => d.id));

    console.log('有效的 discount IDs:', Array.from(validDiscountIds));

    // 🆕 方案 B 邏輯：遍歷所有 level，根據是否有對應的 discount 來更新 selected 狀態
    parentItem.discountLevelItems.forEach(level => {
      // 檢查是否為「未關聯」的 Level 項目
      if (!level.charged_id) {
        // 未關聯的項目，保持原狀
        return;
      }

      // 檢查這個 level 的 charged_id 是否有對應的 discount
      const hasMatchingDiscount = validDiscountIds.has(level.charged_id);

      if (hasMatchingDiscount) {
        // 有對應的 discount → 設定 selected = true
        level.selected = true;
        console.log(`  ✅ Level ${level.id} (charged_id: ${level.charged_id}) → selected = true`);
      } else {
        // 沒有對應的 discount → 設定 selected = false（不刪除）
        level.selected = false;
        console.log(`  ❌ Level ${level.id} (charged_id: ${level.charged_id}) → selected = false`);
      }
    });

    console.log('同步完成，Level 狀態:', parentItem.discountLevelItems.map(l => ({
      id: l.id,
      charged_id: l.charged_id,
      selected: l.selected,
      _status: l._status
    })));
  }


  /**
   * 檢查是否有有效ID
   * 🔑 修正：檢查 API 數字 ID 或 temp ID
   */
  private hasValidId(item: any): boolean {
    return (item.id && !String(item.id).startsWith('temp_')) ||
      (item.id && Number(item.id) > 0);
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
        // 🔑 關鍵：在切換到 Level 畫面時，確保只顯示 _status !== 'deleted' 的項目
        commissionItem.detailItems = commissionItem.discountLevelItems
          .filter(item => item._status !== 'deleted')
          .map(item => ({ ...item, _originalType: 'level' }));
        break;
    }
  }

  // === 私有方法 (保持原有邏輯，僅修正 addDiscountItem/addLevelItem 確保 id 是 temp_id) ===

  /**
   * 新增折扣項目
   */
  private addDiscountItem(parentItem: CommissionItem, contractStartDate: string, contractEndDate: string): OperationResult {
    // 確保 ID 是字串
    const newId = this.generateTempId();

    const newItem: DiscountSettingItem = {
      id: newId,
      _source: 'new',  // 🆕 前端新增的資料
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
    // 確保 ID 是字串
    const newId = this.generateTempId();

    const newItem: DiscountLevelItem = {
      id: newId,
      _source: 'new',  // 🆕 前端新增的資料
      selected: false,
      cag_barcode: '',
      contract_period: '',  // 🆕 合約期間（稍後填入）
      level_bmount: 0,
      level_eamount: 0,
      level_charge_rate: 0,
      charged_id: undefined, // 🆕 初始化為 undefined，表示尚未關聯，需使用者手動選擇 cag_barcode
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
   * 計算下一個年度業績日期範圍 (略)
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
   * 初始化折扣項目 (略)
   */
  private initializeDiscountItems(contractStartDate: string, contractEndDate: string, discountOptions: any[]): DiscountSettingItem[] {
    if (!discountOptions || discountOptions.length === 0) {
      return [];
    }

    // 為所有折扣別建立項目
    return discountOptions.map((option, index) => {
      const isFirstOption = index === 0;
      const is000Option = option.value === '000' || option.label?.includes('正品');
      const shouldSelectByDefault = isFirstOption && is000Option;

      return {
        id: this.generateTempId(),
        _source: 'new',  // 🆕 前端新增的資料
        selected: shouldSelectByDefault,  // 只有正品預設勾選
        cag_barcode: option.value,
        tlt_bdate: new Date(contractStartDate),
        tlt_edate: new Date(contractEndDate),
        cag_charge_rate: 0,
        _status: 'new',
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault
      };
    });
  }

  /**
   * 初始化層級項目 (略)
   */
  private initializeLevelItems(contractStartDate: string, contractEndDate: string, discountOptions: any[]): DiscountLevelItem[] {
    // 不預先建立任何層級項目
    // 層級項目會在折扣設定變更時，透過 syncDiscountToLevel 自動產生
    return [];
  }

  /**
   * 同步明細到父項目 (略)
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
   * 更新數組中的項目 (略)
   */
  private updateDetailInArray(array: any[], itemId: string, newData: any): void {
    if (!Array.isArray(array)) return;

    const index = array.findIndex(item => item.id === itemId);
    if (index > -1) {
      array[index] = { ...newData };
    }
  }

  /**
   * 從數組中移除項目 (略)
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
   * 更新項目在主數組中的引用 (略)
   */
  private updateItemInArray(modifiedItem: any, commissionData: CommissionItem[]): void {
    const index = commissionData.findIndex(item => item.id === modifiedItem.id);
    if (index > -1) {
      commissionData[index] = { ...modifiedItem };
    }
  }

  /**
   * 更新項目狀態 (略)
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
   * 解析日期 (略)
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
   * 生成臨時ID (略)
   */
  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }
}
