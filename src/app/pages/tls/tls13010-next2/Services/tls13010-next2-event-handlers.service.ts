import { CommissionItem } from './../../tls13010/tls13010.model';
import { ContractFlowService } from './../../tls13010/services/contract-flow.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { Injectable } from '@angular/core';
import { CommissionItemOperationsService } from './commission-item-operations.service';

@Injectable({
  providedIn: 'root'
})
export class TLS13010Next2EventHandlersService {

  constructor(
    private itemOperationsService: CommissionItemOperationsService,
    private contractFlowService: ContractFlowService,
    private notificationService: NotificationService
  ) { }

  /**
   * 處理主表格儲存事件
   */
  handleItemSave(
    event: { oldData: any, newData: any },
    commissionData: CommissionItem[],
    selectedSettingTab: string
  ): void {
    const { oldData, newData } = event;
    const hasMainDataChanges = this.hasMainDataChanges(oldData, newData);

    if (hasMainDataChanges && oldData._status === 'original') {
      newData._status = 'modified';
    } else if (!newData._status && !this.hasItemId(newData)) {
      newData._status = 'new';
    }

    const index = commissionData.findIndex(item => item.id === newData.id);
    if (index > -1) {
      commissionData[index] = { ...newData };
    }

    this.syncDetailItemsToSource(newData, selectedSettingTab);
  }

  /**
   * 處理詳細資料儲存事件
   */
  handleDetailSave(
    event: { oldDetail: any, newDetail: any, parentData: any },
    commissionData: CommissionItem[]
  ): void {
    const { newDetail, parentData } = event;
    this.syncDetailBackToSource(newDetail, parentData);

    const mainIndex = commissionData.findIndex(item => item.id === parentData.id);
    if (mainIndex > -1) {
      commissionData[mainIndex] = { ...parentData };
    }
  }

  /**
   * 處理下拉選單變更事件
   */
  handleDropdownChange(
    event: { rowData: any, field: string, newValue: any, oldValue: any },
    commissionData: CommissionItem[]
  ): void {
    const { rowData, field, newValue, oldValue } = event;
    rowData[field] = newValue;

    if (rowData._status === 'original' && newValue !== oldValue) {
      rowData._status = 'modified';
    } else if (!rowData._status) {
      rowData._status = 'new';
    }

    const parentData = this.findParentCommissionItem(rowData, commissionData);
    if (parentData) {
      this.syncDetailBackToSource(rowData, parentData);
    }
  }

  /**
   * 處理標籤變更事件
   */
  handleDetailTabChange(
    event: { rowData: any, tabId: string },
    saveCallback: (item: CommissionItem) => void,
    refreshCallback: (item: CommissionItem) => void
  ): void {
    const { rowData, tabId } = event;

    // 先保存當前標籤的資料
    saveCallback(rowData);

    // 設定新的標籤
    rowData.currentTab = tabId;

    // 只更新這個項目的顯示
    refreshCallback(rowData);
  }

  /**
   * 處理批次刪除事件
   */
  handleBatchDelete(
    selectedItems: any[],
    commissionData: CommissionItem[],
    isViewMode: boolean
  ): boolean {
    if (isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法刪除項目');
      return false;
    }

    if (!confirm(`確定要刪除選取的 ${selectedItems.length} 個項目嗎？`)) {
      return false;
    }

    selectedItems.forEach(item => {
      if (item._status === 'new' || !this.hasItemId(item)) {
        const index = commissionData.findIndex(x => x.id === item.id);
        if (index > -1) {
          commissionData.splice(index, 1);
        }
      } else {
        item._status = 'deleted';
      }
    });

    return true;
  }

  /**
   * 處理詳細項目批次刪除
   */
  handleDetailBatchDelete(
    event: { selectedDetails: any[], parentData: any, rowIndex: number },
    isViewMode: boolean
  ): boolean {
    if (isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法刪除項目');
      return false;
    }

    const { selectedDetails, parentData } = event;
    const currentTab = parentData.currentTab || 'discount' as 'discount' | 'annual' | 'level';

    if (!confirm(`確定要刪除選取的 ${selectedDetails.length} 個明細項目嗎？`)) {
      return false;
    }

    const result = this.itemOperationsService.batchDeleteDetailItems(
      parentData,
      selectedDetails,
      currentTab
    );

    if (result.success) {
      this.notificationService.infoBubble(result.message || '刪除完成');
      return true;
    } else {
      this.notificationService.errorBubble(result.message || '刪除失敗');
      return false;
    }
  }

  // ============ 私有方法 ============

  private hasMainDataChanges(oldData: any, newData: any): boolean {
    const mainFields = [
      'tlt_id', 'tlt_id_desc', 'cag_taxtype',
      'sst_amount', 'sst_rate',
      'cap_saletype2', 'cap_saletype1'
    ];

    return mainFields.some(field =>
      this.normalizeValue(oldData[field]) !== this.normalizeValue(newData[field])
    );
  }

  private normalizeValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    if (value instanceof Date) return value.getTime().toString();
    if (typeof value === 'string') return value.trim();
    return String(value);
  }

  private syncDetailItemsToSource(itemData: CommissionItem, selectedSettingTab: string): void {
    switch (selectedSettingTab) {
      case 'discount':
        itemData.discountSettingItems = [];
        itemData.detailItems.forEach((detail: any) => {
          itemData.discountSettingItems.push({ ...detail });
        });
        break;
      case 'annual':
        itemData.annualPerformanceItems = [];
        itemData.detailItems.forEach((detail: any) => {
          itemData.annualPerformanceItems.push({ ...detail });
        });
        break;
      case 'level':
        itemData.discountLevelItems = [];
        itemData.detailItems.forEach((detail: any) => {
          itemData.discountLevelItems.push({ ...detail });
        });
        break;
    }
  }

  private syncDetailBackToSource(detailData: any, parentData: CommissionItem): void {
    const currentTab = parentData.currentTab || 'discount';

    switch (currentTab) {
      case 'discount':
        {
          const discountIndex = parentData.discountSettingItems.findIndex(item => item.id === detailData.id);
          if (discountIndex > -1) {
            parentData.discountSettingItems[discountIndex] = {
              ...parentData.discountSettingItems[discountIndex],
              ...detailData,
              _status: detailData._status || 'original'
            };
          }
          break;
        }
      case 'annual':
        {
          const annualIndex = parentData.annualPerformanceItems.findIndex(item => item.id === detailData.id);
          if (annualIndex > -1) {
            parentData.annualPerformanceItems[annualIndex] = {
              ...parentData.annualPerformanceItems[annualIndex],
              ...detailData,
              _status: detailData._status || 'original'
            };
          }
          break;
        }
      case 'level':
        {
          const levelIndex = parentData.discountLevelItems.findIndex(item => item.id === detailData.id);
          if (levelIndex > -1) {
            parentData.discountLevelItems[levelIndex] = {
              ...parentData.discountLevelItems[levelIndex],
              ...detailData,
              _status: detailData._status || 'original'
            };
          }
          break;
        }
    }
  }

  private findParentCommissionItem(detailData: any, commissionData: CommissionItem[]): CommissionItem | null {
    for (const commissionItem of commissionData) {
      const foundInDiscount = commissionItem.discountSettingItems.some(item => item.id === detailData.id);
      const foundInAnnual = commissionItem.annualPerformanceItems.some(item => item.id === detailData.id);
      const foundInLevel = commissionItem.discountLevelItems.some(item => item.id === detailData.id);

      if (foundInDiscount || foundInAnnual || foundInLevel) {
        return commissionItem;
      }
    }
    return null;
  }

  private hasItemId(item: any): boolean {
    return item.id && item.id !== 'temp_' && !item.id.toString().startsWith('temp_');
  }
}
