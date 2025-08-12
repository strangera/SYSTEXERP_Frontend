import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../shared/component/notification-message/notification.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS: string = environment.LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
  ) { }

  handleError(error: HttpErrorResponse): Observable<never> {
    let userFriendlyMessage: string;

    // 增加一個方法來安全地取得錯誤訊息
    const getBackendMessage = (err: HttpErrorResponse): string | null => {
      if (err.error && typeof err.error === 'object' && err.error.Message) {
        return err.error.Message;
      } else if (typeof err.error === 'string') {
        return err.error;
      }
      return null;
    };

    const backendMessage = getBackendMessage(error);

    switch (error.status) {
      case 0:
        userFriendlyMessage = '網路連線有問題或請求逾時。請檢查您的網路或稍後重試。';
        break;
      case 401:
        userFriendlyMessage = '您的會話已過期或未經授權，請重新登入。';
        this.authService.logout();
        break;
      case 403:
        userFriendlyMessage = '您沒有執行此操作的權限。';
        break;
      case 404:
        userFriendlyMessage = '找不到請求的資源。請檢查網址或稍後再試。';
        break;
      case 408:
        // 專門處理 408 Request Timeout 錯誤
        userFriendlyMessage = backendMessage || '請求伺服器逾時。請檢查您的網路或稍後重試。';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        userFriendlyMessage = backendMessage || '伺服器內部發生錯誤。請稍後再試，或聯繫系統管理員。';
        break;
      default:
        // 處理其他所有錯誤，優先使用後端訊息
        userFriendlyMessage = backendMessage || `發生未知錯誤 (狀態碼: ${error.status})。`;
        break;
    }

    console.error('HTTP Error Details:', error);
    this.notificationService.errorBubble(userFriendlyMessage);
    this.notificationService.unblockUi();

    // 記錄錯誤到 Session Storage
    try {
      const errorsString = sessionStorage.getItem(this.LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS);
      const errors = errorsString ? JSON.parse(errorsString) : [];

      const MAX_ERROR_LOGS = 100;
      errors.unshift({
        datetime: new Date().toLocaleString(),
        status: error.status,
        message: userFriendlyMessage,
        originalError: error.message
      });

      if (errors.length > MAX_ERROR_LOGS) {
        errors.splice(MAX_ERROR_LOGS);
      }
      sessionStorage.setItem(this.LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS, JSON.stringify(errors));
    } catch (e) {
      console.error('Error logging to Session Storage:', e);
    }

    // 重新拋出錯誤，使用 userFriendlyMessage 作為新的錯誤訊息
    return throwError(() => new Error(userFriendlyMessage));
  }
}
