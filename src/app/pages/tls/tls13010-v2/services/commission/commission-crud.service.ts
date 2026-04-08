/**
 * 抽成項目 CRUD 服務
 * 負責處理新增/刪除/更新項目
 */
import { Injectable } from '@angular/core';
import {
  CommissionItem,
  DiscountSettingItem,
  AnnualPerformanceItem,
  DiscountLevelItem
} from '../../core/models/commission';
import { OperationResult, DropdownOption } from '../../core/models/common.interface';
import { CommissionSyncService } from './commission-sync.service';

export type DetailType = 'discount' | 'annual' | 'level';

export interface AddCommissionOptions {
  contractStartDate: string | Date;
  contractEndDate: string | Date;
  discountOptions: DropdownOption[];
  defaultCapSaletype1?: boolean;
  defaultCapSaletype2?: boolean;
  defaultCapSaletype3?: boolean;
  defaultCapSaletype5?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CommissionCrudService {

  /** 折扣別排序對照表 (cag_barcode → Sort 值)，由外部設定 */
  private discountSortMap = new Map<string, number>();

  constructor(private syncService: CommissionSyncService) {}

  /**
   * 設定折扣別排序對照表
   */
  setDiscountSortMap(options: DropdownOption[]): void {
    this.discountSortMap = new Map(
      options.map(opt => [opt.value, opt.sort ?? 999])
    );
  }

  /**
   * 新增抽成項目
   */
  addCommissionItem(
    existingItems: CommissionItem[],
    options: AddCommissionOptions
  ): OperationResult {
    const activeItems = existingItems.filter(item => item._status !== 'deleted');

    if (activeItems.length >= 9) {
      return {
        success: false,
        message: '抽成項目最多只能建立9個'
      };
    }

    const nextNumber = activeItems.length;
    const newCommissionItem: CommissionItem = {
      id: this.generateTempId(),
      tlt_id: nextNumber.toString(),
      tlt_id_desc: `抽成類別${nextNumber}`,
      cag_taxtype: '1',
      discountSummary: '尚未設定',
      sst_amount: 0,
      sst_rate: 0,
      cap_saletype1: options.defaultCapSaletype1 ?? false,
      cap_saletype2: options.defaultCapSaletype2 ?? false,
      cap_saletype3: options.defaultCapSaletype3 ?? false,
      cap_saletype5: options.defaultCapSaletype5 ?? false,
      selectedSettingOption: 'discount',
      currentTab: 'discount',
      discountSettingItems: this.initializeDiscountItems(
        options.contractStartDate,
        options.contractEndDate,
        options.discountOptions
      ),
      annualPerformanceItems: [],
      discountLevelItems: [],
      detailItems: [],
      _status: 'new',
      mainStartDate: options.contractStartDate,
      mainEndDate: options.contractEndDate
    };

    // 同步已勾選的折扣設定到層級抽成
    newCommissionItem.discountSettingItems.filter(d => d.selected).forEach(selectedDiscount => {
      this.syncService.syncDiscountLevelBasedOnSelection(newCommissionItem, selectedDiscount);
    });

    // 設定初始的 detailItems
    this.updateDetailItems(newCommissionItem);

    return {
      success: true,
      message: `已新增${newCommissionItem.tlt_id_desc}`,
      data: newCommissionItem
    };
  }

  /**
   * 新增詳細項目 (折扣/年度/層級)
   */
  addDetailItem(
    parentItem: CommissionItem,
    type: DetailType,
    contractStartDate: string,
    contractEndDate: string
  ): OperationResult {
    switch (type) {
      case 'discount':
        return this.addDiscountItem(parentItem, contractStartDate, contractEndDate);
      case 'annual':
        return this.addAnnualItem(parentItem, contractStartDate, contractEndDate);
      case 'level':
        return this.addLevelItem(parentItem);
      default:
        return { success: false, message: '未知的項目類型' };
    }
  }

  /**
   * 移除詳細項目
   */
  removeDetailItem(
    item: DiscountSettingItem | AnnualPerformanceItem | DiscountLevelItem,
    parentItem: CommissionItem,
    type: DetailType
  ): void {
    const hasValidId = this.hasValidId(item);

    if (item._status === 'new' || !hasValidId) {
      // 新項目直接移除
      this.removeFromArray(item, parentItem, type);
    } else {
      // 現有項目標記為 deleted
      item._status = 'deleted';
    }

    this.updateDetailItems(parentItem);
  }

  /**
   * 批量刪除項目
   */
  batchDeleteItems(selectedItems: CommissionItem[], allItems: CommissionItem[]): void {
    selectedItems.forEach(item => {
      if (item._status === 'new' || !this.hasValidId(item)) {
        const index = allItems.findIndex(x => x.id === item.id);
        if (index > -1) {
          allItems.splice(index, 1);
        }
      } else {
        item._status = 'deleted';
      }
    });
  }

  /**
   * 批量刪除詳細項目
   * @returns 被阻擋的項目數量 (如果有些項目因為限制無法刪除)
   */
  batchDeleteDetailItems(
    selectedDetails: (DiscountSettingItem | AnnualPerformanceItem | DiscountLevelItem)[],
    parentItem: CommissionItem,
    type: DetailType
  ): { deletedCount: number; blockedCount: number } {
    let deletedCount = 0;
    let blockedCount = 0;

    selectedDetails.forEach(detail => {
      if (type === 'discount') {
        const discountItem = detail as DiscountSettingItem;
        discountItem.selected = false;
        discountItem.is_enabled = false;
        this.syncService.syncDiscountLevelBasedOnSelection(parentItem, discountItem);
      }

      // 層級項目刪除前檢查：不可刪除已勾選折扣的最後一個層級項目
      if (type === 'level') {
        const levelItem = detail as DiscountLevelItem;
        if (levelItem.charged_id) {
          const relatedDiscount = parentItem.discountSettingItems?.find(d => d.id === levelItem.charged_id);
          const isDiscountSelected = relatedDiscount?.selected === true;

          if (isDiscountSelected) {
            const otherLevelItems = parentItem.discountLevelItems?.filter(
              l => l.charged_id === levelItem.charged_id &&
                   l._status !== 'deleted' &&
                   l.id !== levelItem.id &&
                   !selectedDetails.some(sel => sel.id === l.id)  // 排除同批要刪除的
            ) || [];

            if (otherLevelItems.length === 0) {
              blockedCount++;
              return;  // 跳過此項目，不刪除
            }
          }
        }
      }

      if (detail._status === 'new' || !this.hasValidId(detail)) {
        this.removeFromArray(detail, parentItem, type);
      } else {
        detail._status = 'deleted';
      }
      deletedCount++;
    });

    this.updateDetailItems(parentItem);
    return { deletedCount, blockedCount };
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
      case 'level': {
        // 取得已勾選折扣的 id 集合，用來過濾對應的 level 項目
        const selectedDiscountIds = new Set(
          commissionItem.discountSettingItems
            ?.filter(d => d.selected && d._status !== 'deleted')
            .map(d => d.id) || []
        );
        commissionItem.detailItems = commissionItem.discountLevelItems
          .filter(item =>
            item._status !== 'deleted' &&
            (item.charged_id ? selectedDiscountIds.has(item.charged_id) : true)
          )
          .sort((a, b) => {
            // 按照折扣別的 Sort 值升序排列 (1→8)
            const aSort = this.discountSortMap.get(a.cag_barcode) ?? 999;
            const bSort = this.discountSortMap.get(b.cag_barcode) ?? 999;
            return aSort - bSort;
          })
          .map(item => ({ ...item, _originalType: 'level' }));
        break;
      }
    }
  }

  /**
   * 更新項目狀態
   */
  updateItemStatus(item: CommissionItem | DiscountSettingItem | AnnualPerformanceItem | DiscountLevelItem): void {
    if (item._status === 'new') {
      return;
    }
    if (item._status === 'original' || !item._status) {
      item._status = 'modified';
    }
  }

  // ========== 私有方法 ==========

  private addDiscountItem(
    parentItem: CommissionItem,
    contractStartDate: string | Date,
    contractEndDate: string | Date
  ): OperationResult {
    const newItem: DiscountSettingItem = {
      id: this.generateTempId(),
      _source: 'new',
      selected: false,
      cag_barcode: '',
      tlt_bdate: this.parseDate(contractStartDate),
      tlt_edate: this.parseDate(contractEndDate),
      cag_charge_rate: 0,
      _status: 'new',
      is_configured: false,
      is_enabled: false
    };

    parentItem.discountSettingItems.push(newItem);
    this.updateDetailItems(parentItem);

    return { success: true, data: newItem };
  }

  private addAnnualItem(
    parentItem: CommissionItem,
    contractStartDate: string,
    contractEndDate: string
  ): OperationResult {
    const dateRange = this.calculateNextAnnualDateRange(
      parentItem,
      contractStartDate,
      contractEndDate
    );

    if (!dateRange.isValid) {
      return { success: false, message: dateRange.errorMessage };
    }

    const newItem: AnnualPerformanceItem = {
      id: this.generateTempId(),
      selected: true,  // 新增的年度業績項目預設為已勾選，確保會被提交
      tlt_bdate: dateRange.startDate!,
      tlt_edate: dateRange.endDate!,
      year_amount: 0,
      extra_rate: 0,
      _status: 'new'
    };

    parentItem.annualPerformanceItems.push(newItem);
    this.updateDetailItems(parentItem);

    return { success: true, data: newItem };
  }

  private addLevelItem(parentItem: CommissionItem): OperationResult {
    const newItem: DiscountLevelItem = {
      id: this.generateTempId(),
      _source: 'new',
      selected: false,
      cag_barcode: '',
      contract_period: '',
      level_bmount: 0,
      level_eamount: 0,
      level_charge_rate: 0,
      charged_id: undefined,
      _status: 'new',
      is_configured: false,
      is_enabled: false,
      _canDelete: true  // 手動新增的項目可以刪除
    };

    parentItem.discountLevelItems.push(newItem);
    this.updateDetailItems(parentItem);

    return { success: true, data: newItem };
  }

  private initializeDiscountItems(
    contractStartDate: string | Date,
    contractEndDate: string | Date,
    discountOptions: DropdownOption[]
  ): DiscountSettingItem[] {
    if (!discountOptions || discountOptions.length === 0) {
      return [];
    }

    // 解析日期，確保有效
    const startDate = this.parseDate(contractStartDate);
    const endDate = this.parseDate(contractEndDate);

    return discountOptions.map((option, index) => {
      const isFirstOption = index === 0;
      const is000Option = option.value === '000' || option.label?.includes('正品');
      const shouldSelectByDefault = isFirstOption && is000Option;

      return {
        id: this.generateTempId(),
        _source: 'new' as const,
        selected: shouldSelectByDefault,
        cag_barcode: option.value,
        tlt_bdate: startDate,
        tlt_edate: endDate,
        cag_charge_rate: 0,
        _status: 'new' as const,
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault
      };
    });
  }

  /** 解析日期，支援 Date 物件和各種字串格式 */
  private parseDate(dateInput: Date | string | null | undefined): Date {
    if (!dateInput) {
      return new Date();
    }

    // 已經是 Date 物件
    if (dateInput instanceof Date) {
      return isNaN(dateInput.getTime()) ? new Date() : new Date(dateInput);
    }

    // 字串格式
    if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      if (!trimmed) return new Date();

      // 嘗試解析
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return new Date();
  }

  private calculateNextAnnualDateRange(
    parentItem: CommissionItem,
    contractStartDate: string | Date,
    contractEndDate: string | Date
  ): { isValid: boolean; startDate?: Date; endDate?: Date; errorMessage?: string } {
    const contractStart = this.parseDate(contractStartDate);
    const contractEnd = this.parseDate(contractEndDate);
    const existingItems = parentItem.annualPerformanceItems?.filter(
      item => item._status !== 'deleted'
    ) || [];

    if (existingItems.length === 0) {
      return { isValid: true, startDate: contractStart, endDate: contractEnd };
    }

    const latestEndDate = existingItems.reduce((latest, item) => {
      const itemEndDate = new Date(item.tlt_edate);
      return itemEndDate > latest ? itemEndDate : latest;
    }, new Date('1900-01-01'));

    const nextStartDate = new Date(latestEndDate);
    nextStartDate.setDate(nextStartDate.getDate() + 1);

    if (nextStartDate > contractEnd) {
      return {
        isValid: false,
        errorMessage: '合約期間內已無可用的日期區間'
      };
    }

    return { isValid: true, startDate: nextStartDate, endDate: contractEnd };
  }

  private removeFromArray(
    item: DiscountSettingItem | AnnualPerformanceItem | DiscountLevelItem,
    parentItem: CommissionItem,
    type: DetailType
  ): void {
    let array: (DiscountSettingItem | AnnualPerformanceItem | DiscountLevelItem)[];

    switch (type) {
      case 'discount':
        array = parentItem.discountSettingItems;
        break;
      case 'annual':
        array = parentItem.annualPerformanceItems;
        break;
      case 'level':
        array = parentItem.discountLevelItems;
        break;
    }

    const index = array.findIndex(x => x.id === item.id);
    if (index > -1) {
      array.splice(index, 1);
    }
  }

  private hasValidId(item: { id?: number | string }): boolean {
    if (!item.id) return false;
    const idStr = String(item.id);
    return !idStr.startsWith('temp_') && Number(item.id) > 0;
  }

  private generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
