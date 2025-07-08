import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment'; // 確保路徑正確
import { NotificationService } from '../../shared/component/notification-message/notification.service'; // 確保路徑正確
import { AuthService } from './auth.service';

/**
 * 集中處理應用程式中的 HTTP 錯誤。
 * 該服務負責解析錯誤類型、向用戶顯示通知、執行特定錯誤相關的路由跳轉，
 * 並將錯誤訊息記錄到 session storage 以供除錯。
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  // 從環境變數中取得儲存例外錯誤的 Session Storage 鍵值
  private LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS: string = environment.LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
  ) { }

  /**
   * 處理 HttpErrorResponse 並執行相應的操作。
   * 這通常作為 RxJS Observable chain 中 catchError 運算符的回調函數。
   * @param error 傳入的 HttpErrorResponse 物件。
   * @returns 返回一個包含錯誤的 Observable，以便錯誤可以繼續傳播到訂閱者。
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    let userFriendlyMessage = '發生未知錯誤，請稍後再試。'; // 預設使用者友善的錯誤訊息
    // 根據 HTTP 狀態碼判斷錯誤類型並設定對應訊息
    if (error.status === 0) {
      // 網路錯誤 (如斷線、DNS 解析失敗) 或請求逾時
      userFriendlyMessage = '網路連線有問題或請求逾時。請檢查您的網路或稍後重試。';
    } else if (error.status === 401) {
      // 未經授權 (Unauthorized)：Token 過期、無效或缺少。導向登入頁面。
      userFriendlyMessage = '您的會話已過期或未經授權，請重新登入。';
      this.authService.logout();
    } else if (error.status === 403) {
      // 禁止存取 (Forbidden)：有權限但無此操作權限。
      userFriendlyMessage = '您沒有執行此操作的權限。';
    } else if (error.status === 404) {
      // 資源未找到 (Not Found)：請求的 URL 不存在。
      userFriendlyMessage = '找不到請求的資源。請檢查網址或稍後再試。';
    } else if (error.status >= 500 && error.status < 600) {
      // 伺服器錯誤 (Server Error)：5xx 系列錯誤
      userFriendlyMessage = '伺服器內部發生錯誤。請稍後再試，或聯繫系統管理員。';
    } else {
      // 其他 HTTP 錯誤或來自後端的自定義錯誤訊息
      // 嘗試從 error.error 中提取訊息，確保其存在且為預期格式
      if (error.error && typeof error.error === 'object' && error.error.Message) {
        userFriendlyMessage = error.error.Message;
      } else if (typeof error.error === 'string') {
        userFriendlyMessage = error.error; // 有些後端直接返回字串錯誤
      } else {
        // 如果無法解析具體錯誤訊息，使用預設訊息
        userFriendlyMessage = `發生未知錯誤${error.status}。`;
      }
    }
    // 將詳細的錯誤資訊輸出到瀏覽器控制台 (用於開發和除錯)
    console.error('HTTP Error Details:', error);
    console.error('User-friendly Message:', userFriendlyMessage);
    // 向用戶顯示錯誤訊息泡泡通知
    this.notificationService.errorBubble(userFriendlyMessage);
    // 解除任何可能被加載中的 UI 阻擋 (例如進度條或遮罩)
    this.notificationService.unblockUi();
    // 將錯誤訊息記錄到 Session Storage (用於後續除錯或報錯)
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

    // 重新拋出錯誤，讓訂閱者知道發生了錯誤
    return throwError(() => new Error(userFriendlyMessage));
  }
}
