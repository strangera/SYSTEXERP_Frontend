// rent-calculation.service.ts

import { Injectable } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { DateValidationService } from '../validation/date-validation.service';

/**
 * 租金計算服務
 * 負責處理所有租金相關的計算邏輯
 */
@Injectable({
  providedIn: 'root'
})
export class RentCalculationService {

  constructor(
    private dateValidationService: DateValidationService
  ) { }

  // ==================== 主要設定方法 ====================

  /**
   * 設定預收租金計算邏輯
   * @param formGroup 表單群組
   * @param messageService 訊息服務
   * @returns Subscription 陣列(需要在 component 中管理)
   */
  setupRentAheadCalculation(
    formGroup: FormGroup,
    messageService: NotificationService
  ): Subscription[] {
    const subscriptions: Subscription[] = [];

    // ✅ 使用計數器機制,跳過前 2 次觸發(設定監聽器 + API 載入資料)
    let skipCount = 0;
    const SKIP_INITIAL_LOADS = 2;

    const rentAheadSubscription = formGroup.get('rent_ahead')?.valueChanges.subscribe((rentAhead) => {
      // 跳過初始載入階段
      if (skipCount < SKIP_INITIAL_LOADS) {
        skipCount++;
        console.log(`⏭️ 跳過 rent_ahead 第 ${skipCount} 次觸發 (初始載入)`, rentAhead);

        // 即使跳過計算,仍然要更新驗證器
        this.updateBaseRentValidators(formGroup, rentAhead);
        return;
      }

      console.log('📊 預收租金選項變更 (使用者操作):', rentAhead);

      if (rentAhead === 'Y') {
        this.calculateRentPeriodIfPossible(formGroup, messageService);
        // 設定固定租金為必填
        this.updateBaseRentValidators(formGroup, rentAhead);
      } else {
        // 預收租金為否時,清空期數
        formGroup.get('rent_period')?.setValue(0);
        this.updateBaseRentValidators(formGroup, rentAhead);
      }
    });

    if (rentAheadSubscription) {
      subscriptions.push(rentAheadSubscription);
    }

    // 監聽合約起始日變更(只做日期驗證,不計算 rent_period)
    const startDateSubscription = formGroup.get('tlt_bdate')?.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.dateValidationService.validateContractDates(formGroup, messageService);
    });

    if (startDateSubscription) {
      subscriptions.push(startDateSubscription);
    }

    // 監聽合約迄日變更(只做日期驗證,不計算 rent_period)
    const endDateSubscription = formGroup.get('tlt_edate')?.valueChanges.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.dateValidationService.validateContractDates(formGroup, messageService);
    });

    if (endDateSubscription) {
      subscriptions.push(endDateSubscription);
    }

    return subscriptions;
  }

  // ==================== 計算方法 ====================

  /**
   * 檢查條件並計算預收租金期數
   * @param formGroup 表單群組
   * @param messageService 訊息服務
   */
  calculateRentPeriodIfPossible(
    formGroup: FormGroup,
    messageService: NotificationService
  ): void {
    const rentAhead = formGroup.get('rent_ahead')?.value;
    const startDate = formGroup.get('tlt_bdate')?.value;
    const endDate = formGroup.get('tlt_edate')?.value;

    // 檢查必要條件
    if (rentAhead !== 'Y') {
      console.log('ℹ️ 預收租金為"否",不需要計算期數');
      return;
    }

    if (!startDate || !endDate) {
      console.log('⚠️ 日期未完整填寫,無法計算期數');
      return;
    }

    console.log('🔢 開始計算租金期數', {
      預收租金: rentAhead,
      起始日: startDate,
      迄日: endDate
    });

    // 使用 DateValidationService 計算
    this.dateValidationService.calculateAndSetRentPeriod(
      formGroup,
      messageService
    );
  }

  /**
   * 更新固定租金驗證器
   * @param formGroup 表單群組
   * @param rentAhead 預收租金選項值
   */
  updateBaseRentValidators(formGroup: FormGroup, rentAhead?: string): void {
    const baseRentControl = formGroup.get('base_rent');

    if (!baseRentControl) {
      console.warn('⚠️ 找不到 base_rent 控制項');
      return;
    }

    // 如果沒有傳入 rentAhead,從表單取得
    const rentAheadValue = rentAhead || formGroup.get('rent_ahead')?.value;

    // 清除現有驗證器
    baseRentControl.clearValidators();

    if (rentAheadValue === 'Y') {
      // 預收租金為"是":固定租金必填且必須大於 0
      baseRentControl.setValidators([Validators.required, Validators.min(1)]);
      console.log('✅ 預收租金為"是":固定租金設為必填');
    } else {
      // 預收租金為"否":固定租金非必填,但不能小於 0
      baseRentControl.setValidators([Validators.min(0)]);
      console.log('ℹ️ 預收租金為"否":固定租金非必填');
    }

    // 更新驗證狀態 (不觸發 valueChanges 事件)
    baseRentControl.updateValueAndValidity({ emitEvent: false });
  }

  // ==================== 輔助方法 ====================

  /**
   * 驗證租金相關欄位
   * @param formGroup 表單群組
   * @returns 驗證結果
   */
  validateRentFields(formGroup: FormGroup): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const rentAhead = formGroup.get('rent_ahead')?.value;

    // 如果預收租金為"是",檢查必要欄位
    if (rentAhead === 'Y') {
      const baseRent = formGroup.get('base_rent')?.value;
      const rentPeriod = formGroup.get('rent_period')?.value;

      if (!baseRent || baseRent <= 0) {
        errors.push('預收租金為"是"時,固定租金必須大於 0');
      }

      if (!rentPeriod || rentPeriod <= 0) {
        errors.push('預收租金為"是"時,租金期數必須大於 0');
      }

      const startDate = formGroup.get('tlt_bdate')?.value;
      const endDate = formGroup.get('tlt_edate')?.value;

      if (!startDate) {
        errors.push('請填寫洽談起始日');
      }

      if (!endDate) {
        errors.push('請填寫洽談迄日');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 取得租金相關欄位的摘要資訊
   * @param formGroup 表單群組
   * @returns 租金摘要
   */
  getRentSummary(formGroup: FormGroup): {
    rentAhead: string;
    baseRent: number;
    rentPeriod: number;
    isPreRent: boolean;
  } {
    const rentAhead = formGroup.get('rent_ahead')?.value || 'N';
    const baseRent = Number(formGroup.get('base_rent')?.value) || 0;
    const rentPeriod = Number(formGroup.get('rent_period')?.value) || 0;

    return {
      rentAhead,
      baseRent,
      rentPeriod,
      isPreRent: rentAhead === 'Y'
    };
  }

  /**
   * 計算總租金金額
   * @param baseRent 固定租金
   * @param rentPeriod 租金期數
   * @returns 總租金金額
   */
  calculateTotalRent(baseRent: number, rentPeriod: number): number {
    if (!baseRent || !rentPeriod) {
      return 0;
    }

    const total = baseRent * rentPeriod;
    console.log('💰 計算總租金:', {
      固定租金: baseRent,
      期數: rentPeriod,
      總金額: total
    });

    return total;
  }

  /**
   * 重設租金相關欄位
   * @param formGroup 表單群組
   */
  resetRentFields(formGroup: FormGroup): void {
    console.log('🔄 重設租金相關欄位');

    formGroup.patchValue({
      rent_ahead: 'N',
      base_rent: 0,
      rent_period: 0
    }, { emitEvent: false });

    // 重設後更新驗證器
    this.updateBaseRentValidators(formGroup, 'N');
  }

  /**
   * 檢查是否啟用預收租金
   * @param formGroup 表單群組
   * @returns 是否啟用
   */
  isPreRentEnabled(formGroup: FormGroup): boolean {
    return formGroup.get('rent_ahead')?.value === 'Y';
  }

  /**
   * 取得租金設定狀態
   * @param formGroup 表單群組
   * @returns 狀態描述
   */
  getRentSetupStatus(formGroup: FormGroup): {
    text: string;
    class: string;
    isComplete: boolean;
  } {
    const rentAhead = formGroup.get('rent_ahead')?.value;

    if (rentAhead !== 'Y') {
      return {
        text: '未使用預收租金',
        class: 'text-gray-500',
        isComplete: true
      };
    }

    const baseRent = formGroup.get('base_rent')?.value;
    const rentPeriod = formGroup.get('rent_period')?.value;

    if (!baseRent || baseRent <= 0) {
      return {
        text: '請設定固定租金',
        class: 'text-red-500',
        isComplete: false
      };
    }

    if (!rentPeriod || rentPeriod <= 0) {
      return {
        text: '租金期數未計算',
        class: 'text-orange-500',
        isComplete: false
      };
    }

    return {
      text: `已設定 (${rentPeriod}期)`,
      class: 'text-green-500',
      isComplete: true
    };
  }

  // ==================== 初始化方法 ====================

  /**
   * 初始化租金設定(用於載入既有資料後)
   * @param formGroup 表單群組
   * @param messageService 訊息服務
   */
  initializeRentSettings(
    formGroup: FormGroup,
    messageService: NotificationService
  ): void {
    console.log('🔧 初始化租金設定');

    const rentAhead = formGroup.get('rent_ahead')?.value;

    // 根據預收租金設定驗證器
    this.updateBaseRentValidators(formGroup, rentAhead);

    // ❌ 移除自動計算邏輯 - 載入資料時不應該重新計算 rent_period
    // 只有使用者手動操作 rent_ahead 下拉選單時才會計算
    console.log('ℹ️ 初始化完成,不重新計算 rent_period (保留原值)');
  }
}
