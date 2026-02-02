/**
 * 折扣-層級同步服務
 * 負責處理折扣設定與層級抽成的自動同步邏輯
 */
import { Injectable } from '@angular/core';
import {
  CommissionItem,
  DiscountSettingItem,
  DiscountLevelItem
} from '../../core/models/commission';
import { CommissionRemarkService } from './commission-remark.service';

@Injectable({ providedIn: 'root' })
export class CommissionSyncService {

  constructor(private remarkService: CommissionRemarkService) {}

  /**
   * 根據折扣設定的勾選狀態，同步處理層級抽成項目
   */
  syncDiscountLevelBasedOnSelection(
    parentItem: CommissionItem,
    discountItem: DiscountSettingItem
  ): void {
    if (!parentItem.discountLevelItems) {
      parentItem.discountLevelItems = [];
    }

    const linkedLevelItems = parentItem.discountLevelItems.filter(
      level => level.charged_id === discountItem.id
    );

    if (discountItem.selected) {
      // 勾選邏輯：如果沒有對應的 level，新增一個
      if (linkedLevelItems.length === 0) {
        const contractPeriod = this.remarkService.formatContractPeriod(
          discountItem.tlt_bdate,
          discountItem.tlt_edate
        );

        const newLevelItem: DiscountLevelItem = {
          id: this.generateTempId(),
          _source: 'new',
          selected: false,
          cag_barcode: discountItem.cag_barcode,
          contract_period: contractPeriod,
          tlt_bdate: discountItem.tlt_bdate,
          tlt_edate: discountItem.tlt_edate,
          level_bmount: 0,
          level_eamount: 0,
          level_charge_rate: 0,
          charged_id: discountItem.id,
          _status: 'new',
          is_configured: true,
          is_enabled: true,
          _canDelete: false  // 第一個層級項目不可刪除
        };

        // 按照 discount 順序插入 level
        const insertIndex = this.calculateLevelInsertIndex(parentItem, discountItem);
        parentItem.discountLevelItems.splice(insertIndex, 0, newLevelItem);
      }
    } else {
      // 取消勾選邏輯：將對應的 level 設為 selected = false (不刪除)
      linkedLevelItems.forEach(level => {
        level.selected = false;
      });
    }
  }

  /**
   * 同步所有折扣設定到層級抽成
   * 1. 為已勾選的折扣設定創建對應的層級項目 (如果不存在)
   * 2. 更新未勾選折扣對應的層級項目狀態
   */
  syncDiscountToLevel(parentItem: CommissionItem): void {
    if (!parentItem.discountLevelItems) {
      parentItem.discountLevelItems = [];
    }

    // 取得所有有效的折扣設定 (已勾選且未刪除)
    const validDiscounts = parentItem.discountSettingItems?.filter(
      item => item.selected && item._status !== 'deleted'
    ) || [];

    const validDiscountIds = new Set(validDiscounts.map(d => d.id));

    // 為每個已勾選的折扣確保有對應的層級項目
    validDiscounts.forEach(discount => {
      this.syncDiscountLevelBasedOnSelection(parentItem, discount);
    });

    // 更新 level 的 selected 狀態 (未勾選的折扣對應的 level 設為 selected = false)
    parentItem.discountLevelItems.forEach(level => {
      if (!level.charged_id) return;

      const hasMatchingDiscount = validDiscountIds.has(level.charged_id);
      if (!hasMatchingDiscount) {
        level.selected = false;
      }
    });
  }

  /**
   * 填充 level 的 contract_period 欄位和同步日期
   */
  fillLevelContractPeriod(commissionItem: CommissionItem): void {
    if (!commissionItem.discountSettingItems || !commissionItem.discountLevelItems) {
      return;
    }

    commissionItem.discountLevelItems.forEach(level => {
      const correspondingDiscount = commissionItem.discountSettingItems.find(
        d => d.id === level.charged_id
      );

      if (correspondingDiscount) {
        level.contract_period = this.remarkService.formatContractPeriod(
          correspondingDiscount.tlt_bdate,
          correspondingDiscount.tlt_edate
        );
        level.tlt_bdate = correspondingDiscount.tlt_bdate;
        level.tlt_edate = correspondingDiscount.tlt_edate;
      }
    });
  }

  /**
   * 同步 discount 的日期變更到對應的 level 項目
   */
  syncDiscountDateToLevel(discountData: DiscountSettingItem, parentItem: CommissionItem): void {
    if (!parentItem.discountLevelItems) return;

    parentItem.discountLevelItems.forEach(level => {
      if (level.charged_id === discountData.id) {
        level.tlt_bdate = discountData.tlt_bdate;
        level.tlt_edate = discountData.tlt_edate;
        level.contract_period = this.remarkService.formatContractPeriod(
          discountData.tlt_bdate,
          discountData.tlt_edate
        );

        if (level._status !== 'new') {
          level._status = 'modified';
        }
      }
    });
  }

  /**
   * 計算 level 應該插入的位置
   */
  private calculateLevelInsertIndex(
    parentItem: CommissionItem,
    discountItem: DiscountSettingItem
  ): number {
    const discountIndex = parentItem.discountSettingItems?.findIndex(
      d => d.id === discountItem.id
    ) ?? -1;

    if (discountIndex === -1 || !parentItem.discountSettingItems) {
      return parentItem.discountLevelItems.length;
    }

    let insertIndex = 0;
    for (let i = 0; i < discountIndex; i++) {
      const prevDiscount = parentItem.discountSettingItems[i];
      const prevLevelCount = parentItem.discountLevelItems.filter(
        level => level.charged_id === prevDiscount.id &&
                 level._status !== 'deleted' &&
                 level.selected !== false
      ).length;
      insertIndex += prevLevelCount;
    }

    return insertIndex;
  }

  /**
   * 產生臨時 ID
   */
  private generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
