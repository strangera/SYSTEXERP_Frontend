import { Injectable } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ContractFlowService } from '@pages/tls/tls13010/services/contract-flow.service';
import { TLS13010Service } from '@service/api/tls/tls13010.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { firstValueFrom } from 'rxjs';

export interface SubmitOptions {
  isNext2Flow: boolean; // true 表示是 next2 提交，false 表示是 next3 提交
  onSuccess?: (response: any) => void; // 成功後的額外處理
  onError?: (error: any) => void; // 失敗後的額外處理
}

export interface SubmitResult {
  success: boolean;
  response?: any;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ContractSubmitService {

  constructor(
    private tls13010Service: TLS13010Service,
    private contractFlowService: ContractFlowService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  /**
   * 統一的契約提交流程
   * @param options 提交選項
   * @returns Promise<SubmitResult>
   */
  async submitContract(options: SubmitOptions): Promise<SubmitResult> {
    console.log('🚀 ContractSubmitService: 開始提交流程', {
      isNext2Flow: options.isNext2Flow,
      timestamp: new Date().toISOString()
    });

    try {
      // 1. 顯示載入中提示
      this.notificationService.blockUi();

      // 2. 生成清理後的提交資料
      const cleanData = this.contractFlowService.generateCleanSubmitData();

      console.log('📦 準備提交的資料:', {
        talentId: cleanData.metadata.talentId,
        contractId: cleanData.metadata.contractId,
        commissionType: cleanData.metadata.commissionType,
        isNewContract: cleanData.metadata.isNewContract,
        totalOperations: cleanData.metadata.totalOperations
      });

      // 3. 提交到後端
      const response = await firstValueFrom(
        this.tls13010Service.submitFinalTLS13010(cleanData)
      );

      console.log('✅ 提交成功，後端回應:', response);

      // 4. 刷新使用者資料權限（新增專櫃後需要更新權限）
      await this.refreshUserPermissions(cleanData.metadata.isNewContract);

      // 5. 顯示成功訊息
      this.showSuccessMessage(response, options.isNext2Flow);

      // 6. 執行自定義成功處理
      if (options.onSuccess) {
        options.onSuccess(response);
      }

      // 7. 清理暫存資料
      this.contractFlowService.onSubmitSuccess();

      // 8. 延遲導航（讓使用者看到成功訊息）
      await this.delayedNavigation(options.isNext2Flow);

      return {
        success: true,
        response
      };

    } catch (error) {
      console.error('❌ 提交失敗:', error);

      // 顯示錯誤訊息
      this.showErrorMessage(error);

      // 執行自定義錯誤處理
      if (options.onError) {
        options.onError(error);
      }

      return {
        success: false,
        error
      };

    } finally {
      // 無論成功或失敗都要解除載入中提示
      this.notificationService.unblockUi();
    }
  }

  /**
   * 刷新使用者資料權限
   * @param isNewContract 是否為新增契約
   */
  private async refreshUserPermissions(isNewContract: boolean): Promise<void> {
    // 只有在新增契約時才需要刷新權限
    if (!isNewContract) {
      console.log('ℹ️ 非新增契約，跳過權限刷新');
      return;
    }

    try {
      console.log('🔄 開始刷新使用者資料權限...');

      const refreshResponse = await firstValueFrom(
        this.tls13010Service.refreshUserDataPermissions()
      );

      console.log('✅ 權限刷新成功:', refreshResponse);

      // 可選：顯示權限刷新成功的提示
      // this.notificationService.infoBubble('權限已更新');

    } catch (error) {
      console.error('⚠️ 權限刷新失敗（不影響主流程）:', error);

      // 權限刷新失敗不應該阻止主流程，只記錄警告
      this.notificationService.warnBubble(
        '契約已成功建立，但權限更新失敗。請重新登入以查看新專櫃。'
      );
    }
  }

  /**
   * 顯示成功訊息
   */
  private showSuccessMessage(response: any, isNext2Flow: boolean): void {
    let successMessage = '契約資料提交成功！';

    // 根據回應內容構建詳細訊息
    const details: string[] = [];

    if (response.talentId) {
      details.push(`專櫃編號: ${response.talentId}`);
    }

    if (response.contractNo) {
      details.push(`契約編號: ${response.contractNo}`);
    }

    if (response.totalProcessed) {
      details.push(`處理項目數: ${response.totalProcessed}`);
    }

    if (response.processingTime) {
      details.push(`處理時間: ${response.processingTime}`);
    }

    // 組合完整訊息
    if (details.length > 0) {
      successMessage += '\n\n' + details.join('\n');
    }

    // Next2 流程特別提示
    if (isNext2Flow) {
      successMessage += '\n\n即將跳轉到下一步...';
    } else {
      successMessage += '\n\n即將返回列表頁...';
    }

    this.notificationService.successBubble(successMessage);

    // 顯示警告訊息（如果有）
    if (response.warnings?.length > 0) {
      response.warnings.forEach((warning: string) => {
        this.notificationService.warnBubble(warning);
      });
    }
  }

  /**
   * 顯示錯誤訊息
   */
  private showErrorMessage(error: any): void {
    let errorMessage = '契約資料提交失敗';

    // 解析錯誤訊息
    if (error?.error?.Message) {
      errorMessage += `: ${error.error.Message}`;
    } else if (error?.message) {
      errorMessage += `: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage += `: ${error}`;
    }

    // 根據 HTTP 狀態碼提供更具體的錯誤訊息
    if (error?.status === 400) {
      errorMessage = '資料格式錯誤，請檢查輸入內容';
    } else if (error?.status === 401) {
      errorMessage = '登入已過期，請重新登入';
    } else if (error?.status === 403) {
      errorMessage = '權限不足，無法執行此操作';
    } else if (error?.status === 404) {
      errorMessage = '找不到指定的資源';
    } else if (error?.status === 500) {
      errorMessage = '伺服器內部錯誤，請稍後重試或聯繫管理員';
    } else if (error?.status === 0) {
      errorMessage = '網路連線錯誤，請檢查網路狀態';
    }

    this.notificationService.errorBubble(errorMessage);

    // 詳細錯誤記錄（開發用）
    console.group('📋 詳細錯誤資訊');
    console.log('Status:', error?.status);
    console.log('StatusText:', error?.statusText);
    console.log('URL:', error?.url);
    console.log('Error Object:', error?.error);
    console.log('Full Error:', error);
    console.groupEnd();
  }

  /**
   * 延遲導航
   */
  private async delayedNavigation(isNext2Flow: boolean): Promise<void> {
    // 等待 2 秒讓使用者看到成功訊息
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (isNext2Flow) {
      // Next2 提交後的導航邏輯
      const commissionType = this.contractFlowService.getCurrentCommissionType();

      const extras: NavigationExtras = {
        state: { fromRoute: this.router.url }
      };

      if (commissionType === '3') {
        // 一般抽成直接回列表
        this.router.navigate(['account/tls/tls13010'], extras);
      } else {
        // 其他類型前往 next3
        this.router.navigate(['account/tls/tls13010next3'], extras);
      }
    } else {
      // Next3 提交後直接回列表
      const extras: NavigationExtras = {
        state: { fromRoute: this.router.url }
      };
      this.router.navigate(['account/tls/tls13010'], extras);
    }
  }

  /**
   * 驗證是否可以提交
   * @param commissionType 抽成類型
   * @returns 驗證結果和錯誤訊息
   */
  validateBeforeSubmit(commissionType?: string): { valid: boolean; message?: string } {
    try {
      const cleanData = this.contractFlowService.generateCleanSubmitData();

      // 基本驗證：檢查是否有資料
      if (cleanData.metadata.totalOperations === 0) {
        return {
          valid: false,
          message: '沒有可提交的資料，請先完成設定'
        };
      }

      // Next2 與 Next3 資料一致性驗證（僅限底租抽成取高者）
      if (commissionType === '2') {
        const next2MasterCount = cleanData.commissions.masters.toInsert.length +
          cleanData.commissions.masters.toUpdate.length;
        const next3RentCount = cleanData.conditions.baseRentHigher.toInsert.length +
          cleanData.conditions.baseRentHigher.toUpdate.length;

        if (next2MasterCount !== next3RentCount) {
          return {
            valid: false,
            message: `資料不一致：抽成設定有 ${next2MasterCount} 個項目，` +
              `但條件設定有 ${next3RentCount} 個項目。請檢查資料後再送出。`
          };
        }
      }

      return { valid: true };

    } catch (error) {
      console.error('驗證失敗:', error);
      return {
        valid: false,
        message: '資料驗證失敗，請檢查輸入內容'
      };
    }
  }
}
