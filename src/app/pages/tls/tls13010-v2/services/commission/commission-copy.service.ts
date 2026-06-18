/**
 * 複製功能服務
 * 負責處理折扣設定和層級抽成的複製功能
 */
import { Injectable } from '@angular/core';
import {
  CommissionItem,
  DiscountLevelItem,
  DiscountSettingItem
} from '../../core/models/commission';
import { OperationResult } from '../../core/models/common.interface';
import { CommissionRemarkService } from './commission-remark.service';

@Injectable({ providedIn: 'root' })
export class CommissionCopyService {

  constructor(private remarkService: CommissionRemarkService) {}

  /**
   * 複製折扣設定項目
   * 新項目起始日 = 原項目終止日 + 1 天
   * 新項目終止日 = 合約終止日
   */
  copyDiscountItem(
    sourceItem: DiscountSettingItem,
    parentItem: CommissionItem
  ): OperationResult {
    // 檢查原項目的終止日是否已經是合約終止日
    const contractEndDate = this.parseDate(parentItem.mainEndDate);
    const sourceEndDate = this.parseDate(sourceItem.tlt_edate);

    contractEndDate.setHours(0, 0, 0, 0);
    sourceEndDate.setHours(0, 0, 0, 0);

    if (sourceEndDate.getTime() >= contractEndDate.getTime()) {
      return {
        success: false,
        message: '此折扣設定的終止日已達合約終止日，無法複製'
      };
    }

    // 計算新項目的日期
    const newStartDate = new Date(sourceEndDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    const newEndDate = new Date(contractEndDate);

    const newDiscountId = this.generateTempId();

    const newItem: DiscountSettingItem = {
      id: newDiscountId,
      selected: sourceItem.selected,
      cag_barcode: sourceItem.cag_barcode,
      tlt_bdate: newStartDate,
      tlt_edate: newEndDate,
      cag_charge_rate: sourceItem.cag_charge_rate,
      _status: 'new',
      is_configured: sourceItem.is_configured,
      is_enabled: sourceItem.is_enabled
    };

    // 找到原項目位置並插入
    const sourceIndex = parentItem.discountSettingItems.findIndex(d => d.id === sourceItem.id);
    if (sourceIndex !== -1) {
      parentItem.discountSettingItems.splice(sourceIndex + 1, 0, newItem);
    } else {
      parentItem.discountSettingItems.push(newItem);
    }

    // 如果新複製的折扣設定是已勾選的，需要同步產生對應的層級抽成項目
    if (newItem.selected) {
      this.copyRelatedLevelItems(sourceItem, newItem, parentItem);

      // 確保至少有一個層級項目存在
      this.ensureAtLeastOneLevelItem(newItem, parentItem);
    }

    return {
      success: true,
      message: '已複製折扣設定項目',
      data: newItem
    };
  }

  /**
   * 複製層級抽成項目
   */
  copyLevelItem(
    sourceItem: DiscountLevelItem,
    parentItem: CommissionItem
  ): OperationResult {
    const newItem: DiscountLevelItem = {
      id: this.generateTempId(),
      _source: 'new',
      selected: sourceItem.selected,
      cag_barcode: sourceItem.cag_barcode,
      contract_period: sourceItem.contract_period,
      tlt_bdate: sourceItem.tlt_bdate,
      tlt_edate: sourceItem.tlt_edate,
      level_bmount: sourceItem.level_bmount,
      level_eamount: sourceItem.level_eamount,
      level_charge_rate: sourceItem.level_charge_rate,
      charged_id: sourceItem.charged_id,
      _status: 'new',
      is_configured: sourceItem.is_configured,
      is_enabled: sourceItem.is_enabled,
      _canDelete: true  // 複製出來的項目可以刪除
    };

    // 找到原項目位置並插入
    const sourceIndex = parentItem.discountLevelItems.findIndex(l => l.id === sourceItem.id);
    if (sourceIndex !== -1) {
      parentItem.discountLevelItems.splice(sourceIndex + 1, 0, newItem);
    } else {
      parentItem.discountLevelItems.push(newItem);
    }

    return {
      success: true,
      message: '已複製層級抽成項目',
      data: newItem
    };
  }

  /**
   * 複製相關的層級項目
   */
  private copyRelatedLevelItems(
    sourceDiscount: DiscountSettingItem,
    newDiscount: DiscountSettingItem,
    parentItem: CommissionItem
  ): void {
    const relatedLevelItems = parentItem.discountLevelItems?.filter(
      level => level.charged_id === sourceDiscount.id && level._status !== 'deleted'
    ) || [];

    const newContractPeriod = this.remarkService.formatContractPeriod(
      newDiscount.tlt_bdate,
      newDiscount.tlt_edate
    );

    relatedLevelItems.forEach((sourceLevelItem, index) => {
      const newLevelItem: DiscountLevelItem = {
        id: this.generateTempId(),
        selected: sourceLevelItem.selected,
        cag_barcode: newDiscount.cag_barcode,
        contract_period: newContractPeriod,
        tlt_bdate: newDiscount.tlt_bdate,
        tlt_edate: newDiscount.tlt_edate,
        level_bmount: sourceLevelItem.level_bmount,
        level_eamount: sourceLevelItem.level_eamount,
        level_charge_rate: sourceLevelItem.level_charge_rate,
        charged_id: newDiscount.id,
        _status: 'new',
        is_configured: sourceLevelItem.is_configured,
        is_enabled: sourceLevelItem.is_enabled,
        _canDelete: index > 0  // 第一個不可刪除，其他可以
      };

      parentItem.discountLevelItems.push(newLevelItem);
    });
  }

  /**
   * 確保折扣設定至少有一個對應的層級項目
   */
  private ensureAtLeastOneLevelItem(
    discountItem: DiscountSettingItem,
    parentItem: CommissionItem
  ): void {
    if (!parentItem.discountLevelItems) {
      parentItem.discountLevelItems = [];
    }

    // 檢查是否已有對應的層級項目
    const existingLevelItems = parentItem.discountLevelItems.filter(
      level => level.charged_id === discountItem.id && level._status !== 'deleted'
    );

    if (existingLevelItems.length === 0) {
      // 建立新的層級項目
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

      parentItem.discountLevelItems.push(newLevelItem);
    }
  }

  /**
   * 解析日期
   */
  private parseDate(dateInput: Date | string | undefined): Date {
    if (!dateInput) return new Date();

    if (dateInput instanceof Date) {
      return new Date(dateInput);
    }

    return new Date(dateInput);
  }

  /**
   * 產生臨時 ID
   */
  private generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
