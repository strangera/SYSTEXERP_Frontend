// commission-type-change.service.ts

import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ContractFlowService } from '@pages/tls/tls13010/services/contract-flow.service';
import { DropdownOption } from '@pages/tls/tls13010/tls13010.dropdown';
import { NotificationService } from '@shared/component/notification-message/notification.service';

/**
 * 抽成別變更處理服務
 * 負責處理抽成別變更時的所有業務邏輯和警告訊息
 */
@Injectable({
  providedIn: 'root'
})
export class CommissionTypeChangeService {

  constructor(
    private contractFlowService: ContractFlowService,
    private messageService: NotificationService
  ) { }

  // ==================== 主要處理方法 ====================

  /**
   * 處理抽成別變更
   * @param newValue 新的抽成別值
   * @param formGroup 表單群組
   * @param tltTermTypeOptions 抽成別選項列表
   * @param isNewMode 是否為新增模式
   * @param saveCallback 儲存回調函數
   * @returns 是否允許變更
   */
  handleCommissionTypeChange(
    newValue: string,
    formGroup: FormGroup,
    tltTermTypeOptions: DropdownOption[],
    isNewMode: boolean,
    saveCallback: () => void
  ): boolean {
    console.log('🔄 處理抽成別變更:', newValue);

    // 新增模式不需要警告
    if (isNewMode) {
      console.log('ℹ️ 新增模式,直接允許變更');
      saveCallback();
      return true;
    }

    // 取得原始資料
    const originalData = this.contractFlowService.getCurrentData()?.queryRowData;
    const originalCommissionType = originalData?.tlt_term_type?.toString().trim();

    // 如果沒有原始資料或值相同,直接允許
    if (!originalCommissionType || originalCommissionType === newValue?.trim()) {
      saveCallback();
      return true;
    }

    // 抽成別確實有變更,顯示警告
    console.log('⚠️ 抽成別變更偵測:', {
      原始: originalCommissionType,
      新值: newValue
    });

    return this.showCommissionTypeChangeWarning(
      originalCommissionType,
      newValue,
      formGroup,
      tltTermTypeOptions,
      saveCallback
    );
  }

  /**
   * 顯示抽成別變更警告
   * @param originalType 原始抽成別
   * @param newType 新抽成別
   * @param formGroup 表單群組
   * @param tltTermTypeOptions 抽成別選項
   * @param saveCallback 儲存回調
   * @returns 是否允許變更
   */
  private showCommissionTypeChangeWarning(
    originalType: string,
    newType: string,
    formGroup: FormGroup,
    tltTermTypeOptions: DropdownOption[],
    saveCallback: () => void
  ): boolean {
    const originalName = this.getTermTypeName(originalType, tltTermTypeOptions);
    const newName = this.getTermTypeName(newType, tltTermTypeOptions);

    // 生成具體的清除資訊
    const clearOps = this.generateClearOperations(originalType);
    const clearDetails = this.generateClearDetails(clearOps);

    const warningMessage = this.buildWarningMessage(
      originalName,
      newName,
      clearDetails
    );

    // 顯示確認對話框
    if (!confirm(warningMessage)) {
      // 使用者取消,恢復原值
      console.log('❌ 使用者取消變更,恢復原值');
      formGroup.patchValue({ tlt_term_type: originalType }, { emitEvent: false });
      return false;
    } else {
      // 使用者確認變更
      console.log('✅ 使用者確認變更');
      this.messageService.warnBubble('抽成別已變更,相關條件設定將在送出時被清除');
      saveCallback();
      return true;
    }
  }

  /**
   * 建立警告訊息
   * @param originalName 原始抽成別名稱
   * @param newName 新抽成別名稱
   * @param clearDetails 清除詳情
   * @returns 警告訊息
   */
  private buildWarningMessage(
    originalName: string,
    newName: string,
    clearDetails: string
  ): string {
    return `⚠️ 抽成別變更警告\n\n` +
      `原始抽成別: ${originalName}\n` +
      `新抽成別: ${newName}\n\n` +
      `${clearDetails}\n\n` +
      `請確認是否要繼續?`;
  }

  // ==================== 清除操作相關 ====================

  /**
   * 產生清除操作配置
   * @param originalTermType 原始抽成別
   * @returns 清除操作配置
   */
  generateClearOperations(originalTermType: string): {
    clearRentDetails: boolean;
    clearLimitDetails: boolean;
    clearLevelDetails: boolean;
  } {
    return {
      clearRentDetails: originalTermType === '1' || originalTermType === '2',
      clearLimitDetails: originalTermType === '4' || originalTermType === '6',
      clearLevelDetails: originalTermType === '5' || originalTermType === '6'
    };
  }

  /**
   * 產生清除詳情文字
   * @param clearOps 清除操作配置
   * @returns 清除詳情文字
   */
  generateClearDetails(clearOps: {
    clearRentDetails: boolean;
    clearLimitDetails: boolean;
    clearLevelDetails: boolean;
  }): string {
    const willClear: string[] = [];
    const willKeep: string[] = ['抽成設定 (主檔、明細、年度業績、層級)'];

    if (clearOps.clearRentDetails) willClear.push('租金設定');
    if (clearOps.clearLimitDetails) willClear.push('包底設定');
    if (clearOps.clearLevelDetails) willClear.push('階梯設定');

    let message = '';

    if (willClear.length > 0) {
      message += `將清除: ${willClear.join('、')}\n`;
    } else {
      message += `無需清除條件設定\n`;
    }

    message += `將保留: ${willKeep.join('、')}`;

    return message;
  }

  // ==================== 輔助方法 ====================

  /**
   * 取得抽成別名稱
   * @param termType 抽成別代碼
   * @param tltTermTypeOptions 抽成別選項
   * @returns 抽成別名稱
   */
  getTermTypeName(termType: string, tltTermTypeOptions: DropdownOption[]): string {
    const option = tltTermTypeOptions.find(opt => opt.value === termType);
    return option ? option.label : `未知類型(${termType})`;
  }

  /**
   * 檢查抽成別是否變更
   * @param formGroup 表單群組
   * @param isNewMode 是否為新增模式
   * @returns 是否變更
   */
  hasCommissionTypeChanged(formGroup: FormGroup, isNewMode: boolean): boolean {
    if (isNewMode) {
      return false;
    }

    const originalData = this.contractFlowService.getCurrentData()?.queryRowData;
    const originalCommissionType = originalData?.tlt_term_type?.toString().trim();
    const currentCommissionType = formGroup.get('tlt_term_type')?.value?.toString().trim();

    const hasChanged = originalCommissionType !== currentCommissionType;

    // if (hasChanged) {
    //   console.log('🔍 抽成別已變更:', {
    //     原始: originalCommissionType,
    //     目前: currentCommissionType
    //   });
    // }

    return hasChanged;
  }

  /**
   * 取得抽成別變更資訊
   * @param formGroup 表單群組
   * @param tltTermTypeOptions 抽成別選項
   * @param isNewMode 是否為新增模式
   * @returns 變更資訊
   */
  getCommissionTypeChangeInfo(
    formGroup: FormGroup,
    tltTermTypeOptions: DropdownOption[],
    isNewMode: boolean
  ): {
    hasChanged: boolean;
    originalType?: string;
    originalName?: string;
    currentType?: string;
    currentName?: string;
    clearOperations?: any;
  } {
    if (isNewMode) {
      return { hasChanged: false };
    }

    const originalData = this.contractFlowService.getCurrentData()?.queryRowData;
    const originalType = originalData?.tlt_term_type?.toString().trim();
    const currentType = formGroup.get('tlt_term_type')?.value?.toString().trim();

    if (!originalType || originalType === currentType) {
      return { hasChanged: false };
    }

    return {
      hasChanged: true,
      originalType,
      originalName: this.getTermTypeName(originalType, tltTermTypeOptions),
      currentType,
      currentName: this.getTermTypeName(currentType, tltTermTypeOptions),
      clearOperations: this.generateClearOperations(originalType)
    };
  }

  /**
   * 驗證抽成別設定
   * @param formGroup 表單群組
   * @returns 驗證結果
   */
  validateCommissionType(formGroup: FormGroup): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const commissionType = formGroup.get('tlt_term_type')?.value;

    if (!commissionType || commissionType.trim() === '') {
      errors.push('請選擇抽成別');
    }

    // 根據不同抽成別檢查必要設定
    const validTypes = ['1', '2', '3', '4', '5', '6'];
    if (commissionType && !validTypes.includes(commissionType)) {
      errors.push(`無效的抽成別: ${commissionType}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 取得抽成別相關欄位應該清除的列表
   * @param originalTermType 原始抽成別
   * @returns 需要清除的欄位列表
   */
  getFieldsToClear(originalTermType: string): string[] {
    const clearOps = this.generateClearOperations(originalTermType);
    const fields: string[] = [];

    // 這些欄位始終不清除(抽成主檔資料)
    // 實際要清除的欄位需要根據你的資料結構調整

    if (clearOps.clearRentDetails) {
      // 租金設定相關欄位
      fields.push(
        'base_rent',
        'rent_period',
        'rent_ahead'
        // ... 其他租金相關欄位
      );
    }

    if (clearOps.clearLimitDetails) {
      // 包底設定相關欄位
      fields.push(
        'limit_amount'
        // ... 其他包底相關欄位
      );
    }

    if (clearOps.clearLevelDetails) {
      // 階梯設定相關欄位
      fields.push(
        'level_config'
        // ... 其他階梯相關欄位
      );
    }

    return fields;
  }

  /**
   * 取得抽成別說明文字
   * @param termType 抽成別代碼
   * @returns 說明文字
   */
  getCommissionTypeDescription(termType: string): string {
    const descriptions: { [key: string]: string } = {
      '1': '固定租金制 - 每月支付固定租金',
      '2': '固定租金加抽成 - 固定租金加業績抽成',
      '3': '一般抽成 - 純業績抽成',
      '4': '保證抽成(包底) - 業績抽成但保證最低金額',
      '5': '階梯抽成 - 依業績區間不同抽成比例',
      '6': '保證階梯抽成 - 階梯抽成加保證底薪'
    };

    return descriptions[termType] || '未知的抽成別類型';
  }

  /**
   * 取得抽成別圖示
   * @param termType 抽成別代碼
   * @returns 圖示 CSS class
   */
  getCommissionTypeIcon(termType: string): string {
    const icons: { [key: string]: string } = {
      '1': 'pi pi-dollar',
      '2': 'pi pi-plus-circle',
      '3': 'pi pi-percentage',
      '4': 'pi pi-shield',
      '5': 'pi pi-sort-amount-up',
      '6': 'pi pi-shield-plus'
    };

    return icons[termType] || 'pi pi-question-circle';
  }

  /**
   * 重設抽成別為預設值
   * @param formGroup 表單群組
   */
  resetCommissionTypeToDefault(formGroup: FormGroup): void {
    console.log('🔄 重設抽成別為預設值');
    formGroup.patchValue({
      tlt_term_type: '3' // 預設為一般抽成
    });
  }
}
