// form-state.service.ts

import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { ContractFlowService } from '@pages/tls/tls13010/services/contract-flow.service';

/**
 * 表單狀態管理服務
 * 負責處理表單的各種狀態控制、檢視模式、readonly 邏輯
 */
@Injectable({
  providedIn: 'root'
})
export class FormStateService {

  // 檢視模式狀態 (供外部訂閱)
  private viewModeSubject = new BehaviorSubject<boolean>(false);
  public viewMode$ = this.viewModeSubject.asObservable();

  // 表單 readonly 狀態
  private formReadonlySubject = new BehaviorSubject<boolean>(false);
  public formReadonly$ = this.formReadonlySubject.asObservable();

  constructor(
    private contractFlowService: ContractFlowService,
    private messageService: NotificationService,
    private router: Router
  ) { }

  // ==================== 表單狀態控制 ====================

  /**
   * 設定表單控制狀態
   * @param formGroup 表單群組
   * @param isViewMode 是否為檢視模式
   * @param isNewMode 是否為新增模式
   */
  setFormControlsState(
    formGroup: FormGroup,
    isViewMode: boolean,
    isNewMode: boolean
  ): void {
    console.log('🔧 設定表單控制狀態:', { isViewMode, isNewMode });

    // 設定整體 readonly 狀態
    const isFormReadonly = isViewMode;
    this.formReadonlySubject.next(isFormReadonly);

    // 確保所有欄位都是 enabled 狀態(移除所有 disabled)
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control && control.disabled) {
        control.enable();
      }
    });

    // 特殊處理:營運狀況在新增模式下設為固定值
    const tltOpenflagControl = formGroup.get('tlt_openflag');
    if (tltOpenflagControl && isNewMode) {
      tltOpenflagControl.setValue('9'); // 設定為未生效
    }

    console.log('✅ 表單控制狀態設定完成');
  }

  /**
   * 檢查特定欄位的 readonly 狀態(供 UI 參考)
   * @param fieldName 欄位名稱
   * @param isViewMode 是否為檢視模式
   * @param isNewMode 是否為新增模式
   * @returns 是否為 readonly
   */
  isFieldReadonly(
    fieldName: string,
    isViewMode: boolean,
    isNewMode: boolean
  ): boolean {
    // 檢視模式下所有欄位都是 readonly
    if (isViewMode) {
      return true;
    }

    // 系統自動產生或自動帶入的欄位永遠是 readonly
    const alwaysReadonlyFields = [
      'apply_no',        // 專櫃招募編號 - 系統自動產生
      'tlt_no',          // 專櫃編號 - 系統自動產生
      'contract_subno',  // 版次 - 系統自動產生
      'approve_status',  // 審核狀態 - 系統控制
      'VEN_Name',        // 廠商名稱 - 自動帶入
      'ven_no'           // 廠商編號 - 自動帶入
    ];

    if (alwaysReadonlyFields.includes(fieldName)) {
      return true;
    }

    // 特殊邏輯:營運狀況在新增模式下 readonly
    if (fieldName === 'tlt_openflag') {
      return isNewMode;
    }

    return false;
  }

  /**
   * 批次設定多個欄位的 readonly 狀態
   * @param fieldNames 欄位名稱陣列
   * @param isViewMode 是否為檢視模式
   * @param isNewMode 是否為新增模式
   * @returns readonly 狀態對應表
   */
  getFieldsReadonlyStatus(
    fieldNames: string[],
    isViewMode: boolean,
    isNewMode: boolean
  ): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};

    fieldNames.forEach(fieldName => {
      status[fieldName] = this.isFieldReadonly(fieldName, isViewMode, isNewMode);
    });

    return status;
  }

  // ==================== 檢視模式管理 ====================

  /**
   * 設定檢視模式
   * @param isViewMode 是否為檢視模式
   */
  setViewMode(isViewMode: boolean): void {
    console.log('👁️ 設定檢視模式:', isViewMode);
    this.viewModeSubject.next(isViewMode);
    this.contractFlowService.setViewMode(isViewMode);
  }

  /**
   * 取得目前檢視模式狀態
   * @returns 是否為檢視模式
   */
  isViewMode(): boolean {
    return this.viewModeSubject.value;
  }

  /**
   * 處理檢視模式變更
   * @param isViewMode 是否為檢視模式
   * @param formGroup 表單群組
   * @param isNewMode 是否為新增模式
   * @returns 新的標題
   */
  handleViewModeChange(
    isViewMode: boolean,
    formGroup: FormGroup,
    isNewMode: boolean
  ): string {
    console.log('🔄 處理檢視模式變更:', isViewMode);

    // 更新表單 readonly 狀態
    this.formReadonlySubject.next(isViewMode);

    // 更新標題
    const newTitle = this.getFormTitle(isViewMode, isNewMode);

    // 重新設定控制狀態
    setTimeout(() => {
      this.setFormControlsState(formGroup, isViewMode, isNewMode);
    }, 0);

    return newTitle;
  }

  /**
   * 退出檢視模式
   * @param messageService 訊息服務
   */
  exitViewMode(messageService?: NotificationService): void {
    console.log('🚪 退出檢視模式');

    this.setViewMode(false);

    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };

    this.router.navigate(['account/tls/tls13010'], extras);

    if (messageService) {
      messageService.infoBubble('已退出檢視模式');
    }
  }

  /**
   * 切換到編輯模式(移除 URL 參數)
   * @param messageService 訊息服務
   * @returns 是否成功切換
   */
  switchToEditMode(messageService?: NotificationService): boolean {
    if (confirm('確定要切換到編輯模式嗎?')) {
      console.log('✏️ 切換到編輯模式');

      // 移除 URL 參數,導航到乾淨的編輯頁面
      this.router.navigate(['account/tls/tls13010cru'], {
        queryParams: {}  // 清空參數
      });

      if (messageService) {
        messageService.infoBubble('已切換到編輯模式');
      }

      return true;
    }

    return false;
  }

  // ==================== 標題管理 ====================

  /**
   * 取得表單標題
   * @param isViewMode 是否為檢視模式
   * @param isNewMode 是否為新增模式
   * @returns 標題文字
   */
  getFormTitle(isViewMode: boolean, isNewMode: boolean): string {
    if (isViewMode) {
      return '檢視合約資料';
    }
    return isNewMode ? '新增合約資料' : '編輯合約資料';
  }

  /**
   * 取得頁面標題(與 getFormTitle 相同,保持向後兼容)
   * @param isNewMode 是否為新增模式
   * @returns 標題文字
   */
  getPageTitle(isNewMode: boolean): string {
    return isNewMode ? '新增合約資料' : '編輯合約資料';
  }

  // ==================== 按鈕顯示控制 ====================

  /**
   * 是否顯示編輯按鈕
   * @param isViewMode 是否為檢視模式
   * @returns 是否顯示
   */
  showEditButtons(isViewMode: boolean): boolean {
    return !isViewMode;
  }

  /**
   * 是否顯示檢視按鈕
   * @param isViewMode 是否為檢視模式
   * @returns 是否顯示
   */
  showViewButtons(isViewMode: boolean): boolean {
    return isViewMode;
  }

  /**
   * 取得按鈕配置
   * @param isViewMode 是否為檢視模式
   * @param isNewMode 是否為新增模式
   * @returns 按鈕顯示配置
   */
  getButtonConfiguration(isViewMode: boolean, isNewMode: boolean): {
    showSave: boolean;
    showSubmit: boolean;
    showCancel: boolean;
    showClear: boolean;
    showEdit: boolean;
    showExit: boolean;
  } {
    if (isViewMode) {
      return {
        showSave: false,
        showSubmit: false,
        showCancel: false,
        showClear: false,
        showEdit: true,    // 顯示編輯按鈕
        showExit: true     // 顯示退出按鈕
      };
    }

    return {
      showSave: true,
      showSubmit: true,
      showCancel: true,
      showClear: !isNewMode, // 新增模式不顯示清除按鈕
      showEdit: false,
      showExit: false
    };
  }

  // ==================== 表單驗證狀態 ====================

  /**
   * 檢查表單是否可以提交
   * @param formGroup 表單群組
   * @param isViewMode 是否為檢視模式
   * @returns 是否可以提交
   */
  canSubmit(formGroup: FormGroup, isViewMode: boolean): boolean {
    if (isViewMode) {
      return false; // 檢視模式不能提交
    }

    return formGroup.valid;
  }

  /**
   * 取得表單狀態摘要
   * @param formGroup 表單群組
   * @param isViewMode 是否為檢視模式
   * @param isNewMode 是否為新增模式
   * @returns 狀態摘要
   */
  getFormStateSummary(
    formGroup: FormGroup,
    isViewMode: boolean,
    isNewMode: boolean
  ): {
    mode: string;
    isReadonly: boolean;
    isValid: boolean;
    canSubmit: boolean;
    isDirty: boolean;
    totalFields: number;
    invalidFields: number;
  } {
    let mode = '編輯';
    if (isViewMode) mode = '檢視';
    else if (isNewMode) mode = '新增';

    const invalidFields = Object.keys(formGroup.controls).filter(
      key => formGroup.get(key)?.invalid
    ).length;

    return {
      mode,
      isReadonly: isViewMode,
      isValid: formGroup.valid,
      canSubmit: this.canSubmit(formGroup, isViewMode),
      isDirty: formGroup.dirty,
      totalFields: Object.keys(formGroup.controls).length,
      invalidFields
    };
  }

  // ==================== URL 參數處理 ====================

  /**
   * 從 URL 檢查是否為檢視模式
   * @param queryParams URL 查詢參數
   * @returns 是否為檢視模式
   */
  checkViewModeFromURL(queryParams: any): boolean {
    const mode = queryParams['mode'];
    return mode === 'view';
  }

  /**
   * 生成檢視模式的 URL 參數
   * @returns URL 參數物件
   */
  generateViewModeQueryParams(): any {
    return { mode: 'view' };
  }

  // ==================== 表單重設 ====================

  /**
   * 重設表單狀態
   * @param formGroup 表單群組
   * @param isNewMode 是否為新增模式
   */
  resetFormState(formGroup: FormGroup, isNewMode: boolean): void {
    console.log('🔄 重設表單狀態');

    // 重設 dirty 和 touched 狀態
    formGroup.markAsPristine();
    formGroup.markAsUntouched();

    // 重新設定控制狀態
    this.setFormControlsState(formGroup, false, isNewMode);
  }

  /**
   * 標記所有欄位為已觸碰(用於觸發驗證)
   * @param formGroup 表單群組
   */
  markAllFieldsAsTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markAllFieldsAsTouched(control);
      }
    });
  }

  // ==================== 欄位群組狀態 ====================

  /**
   * 取得必填欄位的填寫狀態
   * @param formGroup 表單群組
   * @param requiredFields 必填欄位列表
   * @returns 填寫狀態
   */
  getRequiredFieldsStatus(
    formGroup: FormGroup,
    requiredFields: string[]
  ): {
    total: number;
    filled: number;
    missing: string[];
    percentage: number;
  } {
    const missing: string[] = [];
    let filled = 0;

    requiredFields.forEach(fieldName => {
      const control = formGroup.get(fieldName);
      const value = control?.value;

      if (value !== null && value !== undefined && value !== '') {
        filled++;
      } else {
        missing.push(fieldName);
      }
    });

    return {
      total: requiredFields.length,
      filled,
      missing,
      percentage: Math.round((filled / requiredFields.length) * 100)
    };
  }

  /**
   * 檢查特定區塊的完成度
   * @param formGroup 表單群組
   * @param fieldNames 該區塊的欄位列表
   * @returns 完成度資訊
   */
  getSectionCompletionStatus(
    formGroup: FormGroup,
    fieldNames: string[]
  ): {
    isComplete: boolean;
    completedFields: number;
    totalFields: number;
    percentage: number;
    missingFields: string[];
  } {
    let completedFields = 0;
    const missingFields: string[] = [];

    fieldNames.forEach(fieldName => {
      const control = formGroup.get(fieldName);
      const value = control?.value;

      if (value !== null && value !== undefined && value !== '') {
        completedFields++;
      } else {
        missingFields.push(fieldName);
      }
    });

    const totalFields = fieldNames.length;
    const percentage = Math.round((completedFields / totalFields) * 100);

    return {
      isComplete: completedFields === totalFields,
      completedFields,
      totalFields,
      percentage,
      missingFields
    };
  }

  // ==================== 清理方法 ====================

  /**
   * 清理服務狀態(用於 ngOnDestroy)
   */
  cleanup(): void {
    console.log('🧹 清理 FormStateService');
    this.viewModeSubject.next(false);
    this.formReadonlySubject.next(false);
  }
}
