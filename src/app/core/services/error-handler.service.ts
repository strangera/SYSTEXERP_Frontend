import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../service/system/auth.service';
import { NotificationService } from '../../shared/component/notification-message/notification.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS: string = environment.LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
  ) { }

  handleError(error: HttpErrorResponse): Observable<never> {
    let userFriendlyMessage: string;
    let notificationHeader: string | undefined; // 用於儲存彈出訊息的標題
    let notificationDetails: string;            // 用於儲存彈出訊息的詳細內容

    // 增加一個方法來安全地取得錯誤訊息
    const getBackendMessage = (err: HttpErrorResponse): string | null => {
      // 檢查是否為 JSON 物件且包含 Message
      if (err.error && typeof err.error === 'object' && err.error.Message) {
        return String(err.error.Message); // 確保是字串
      }
      // 檢查是否為純字串錯誤
      else if (typeof err.error === 'string') {
        return err.error;
      }
      return null;
    };

    const backendMessage = getBackendMessage(error);

    switch (error.status) {
      case 0:
        notificationHeader = '網路連線錯誤';
        notificationDetails = '網路連線有問題或請求逾時。請檢查您的網路或稍後重試。';
        userFriendlyMessage = notificationHeader + ': ' + notificationDetails;
        break;
      case 401:
        notificationHeader = '未經授權';
        notificationDetails = '您的會話已過期或未經授權，請重新登入。';
        userFriendlyMessage = notificationHeader + ': ' + notificationDetails;
        this.authService.logout();
        break;
      case 403:
        notificationHeader = '權限不足';
        notificationDetails = '您沒有執行此操作的權限。';
        userFriendlyMessage = notificationHeader + ': ' + notificationDetails;
        break;
      case 404:
        notificationHeader = '資源不存在';
        notificationDetails = '找不到請求的資源。請檢查網址或稍後再試。';
        userFriendlyMessage = notificationHeader + ': ' + notificationDetails;
        break;
      case 408:
        // 專門處理 408 Request Timeout 錯誤
        userFriendlyMessage = backendMessage || '請求伺服器逾時。請檢查您的網路或稍後重試。';
        notificationDetails = userFriendlyMessage;
        notificationHeader = '請求逾時 (408)';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        userFriendlyMessage = backendMessage || '伺服器內部發生錯誤。請稍後再試，或聯繫系統管理員。';
        notificationDetails = userFriendlyMessage;
        notificationHeader = 'OH 失敗!!!';
        break;
      default:
        // 處理其他所有錯誤
        userFriendlyMessage = backendMessage || `發生未知錯誤 (狀態碼: ${error.status})。`;
        notificationDetails = userFriendlyMessage;
        notificationHeader = `失敗!!!`;
        break;
    }

    // --- 【新增的後端訊息拆分邏輯】 ---
    if (backendMessage && backendMessage.includes('原因：')) {
      // 找到 "原因：" 的索引
      const causeIndex = backendMessage.indexOf('原因：');

      // "原因："前面的部分作為 Header
      notificationHeader = backendMessage.substring(0, causeIndex).trim();

      // "原因："後面的部分作為 Details
      notificationDetails = backendMessage.substring(causeIndex + 3).trim();

      // 更新 userFriendlyMessage 以便於 log
      userFriendlyMessage = notificationHeader + ' - 原因：' + notificationDetails;

      // 如果 header 是空的，給一個預設值
      if (!notificationHeader) {
        notificationHeader = `伺服器回應 (${error.status})`;
      }
    } else {
      // 如果沒有 "原因：" 且使用後端訊息，則將後端訊息作為 Details
      // 且 Header 保持 switch-case 中定義的狀態標題
      if (backendMessage) {
        notificationDetails = backendMessage;
        userFriendlyMessage = notificationHeader + '：' + notificationDetails;
      }
      // 對於沒有後端訊息的狀況 (例如 status: 0)，保持 switch-case 的結果
    }
    // --- 【結束新增的後端訊息拆分邏輯】 ---

    console.error('HTTP Error Details:', error);

    // 使用拆分後的 header 和 details 呼叫 notificationService
    this.notificationService.errorBubble(notificationDetails, notificationHeader);
    this.notificationService.unblockUi();

    // 記錄錯誤到 Session Storage (使用 userFriendlyMessage)
    try {
      const errorsString = sessionStorage.getItem(this.LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS);
      const errors = errorsString ? JSON.parse(errorsString) : [];

      const MAX_ERROR_LOGS = 100;
      errors.unshift({
        datetime: new Date().toLocaleString(),
        status: error.status,
        message: userFriendlyMessage, // 使用完整的訊息 log
        originalError: error.message
      });

      if (errors.length > MAX_ERROR_LOGS) {
        errors.splice(MAX_ERROR_LOGS);
      }
      sessionStorage.setItem(this.LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS, JSON.stringify(errors));
    } catch (e) {
      console.error('Error logging to Session Storage:', e);
    }

    // 重新拋出錯誤
    return throwError(() => new Error(userFriendlyMessage));
  }
}
