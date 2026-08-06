import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../service/system/auth.service';
import { NotificationService } from '../../shared/components/notification-message/notification.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS: string = environment.LOCAL_STORAGE_KEY_HANDLE_EXCEPTION_ERRORS;

  // 專供「錯誤回報」用的 HttpClient：直接走 HttpBackend 繞過所有 interceptor。
  // 若用一般 HttpClient，回報請求自己失敗時會再被 errorInterceptor 攔到 → 又呼叫 handleError → 無窮遞迴。
  private readonly diagHttp: HttpClient;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    httpBackend: HttpBackend,
  ) {
    this.diagHttp = new HttpClient(httpBackend);
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    // responseType:'blob' 的匯出類 API（如 exportTLS32020Excel）失敗時，err.error 會是 Blob 而非解析好的 JSON，
    // 必須先讀出文字內容再嘗試解析，不然後端 ValidateModel 等回傳的具體錯誤訊息會被吃掉，只看到通用訊息。
    if (error.error instanceof Blob && error.error.type?.includes('json')) {
      return from(this.parseBlobErrorBody(error.error)).pipe(
        switchMap((parsedBody) => this.processError(error, parsedBody)),
      );
    }
    return this.processError(error, error.error);
  }

  private async parseBlobErrorBody(blob: Blob): Promise<any> {
    try {
      return JSON.parse(await blob.text());
    } catch {
      return null;
    }
  }

  private processError(error: HttpErrorResponse, errorBody: any): Observable<never> {
    let userFriendlyMessage: string;
    let notificationHeader: string | undefined; // 用於儲存彈出訊息的標題
    let notificationDetails: string;            // 用於儲存彈出訊息的詳細內容

    // 增加一個方法來安全地取得錯誤訊息
    const getBackendMessage = (body: any): string | null => {
      if (body && typeof body === 'object') {
        // ValidateModelAttribute 把逐欄位驗證錯誤放在 Data（字串陣列），比固定泛用文字的 Message 更有診斷價值，優先採用
        if (Array.isArray(body.Data) && body.Data.length > 0 && body.Data.every((d: unknown) => typeof d === 'string')) {
          return body.Data.join('; ');
        }
        if (body.Message) {
          return String(body.Message); // 確保是字串
        }
      }
      // 檢查是否為純字串錯誤
      else if (typeof body === 'string') {
        return body;
      }
      return null;
    };

    const backendMessage = getBackendMessage(errorBody);

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
        notificationHeader = '系統錯誤';
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

    // console.error('HTTP Error Details:', error);

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

    // Phase 4：把「使用者實際遭遇的 API 錯誤」悄悄回報後端持久化，供維運儀表板觀察。
    this.reportApiError(error, userFriendlyMessage);

    // 【地雷 5】重拋「原始 HttpErrorResponse」，而非 new Error()。
    // 原因：
    //  1. 保留 error.status / error.error，讓 component 能針對特定狀態碼（如 409）做客製處理。
    //  2. 讓 GlobalErrorHandler 的 `instanceof HttpErrorResponse` 守衛能正確攔到、避免重複落地。
    // 注意：使用者提示 (Toast) 已在上面跳過，component 端只是「選擇性」加工，不需再跳一次。
    return throwError(() => error);
  }

  /**
   * 將前端遭遇的 API 錯誤回報後端（record-api-error）。
   * 走 diagHttp（HttpBackend）繞過 interceptor，並排除「回報端點本身」避免遞迴。
   */
  private reportApiError(error: HttpErrorResponse, userFriendlyMessage: string): void {
    try {
      const apiUrl = error.url ?? '';

      // 避免回報「回報端點本身」造成無窮遞迴（record-error / record-api-error）。
      if (apiUrl.includes('/ClientLog/record')) {
        return;
      }

      const userNo = this.authService.currentUserValue?.user_No || 'Unknown';
      const userName = this.authService.currentUserValue?.user_Name || 'Unknown';

      const payload = {
        Status: error.status,
        ApiUrl: apiUrl,
        PageUrl: globalThis.location.href,
        User: `${userNo}(${userName})`,
        Message: userFriendlyMessage,
      };

      const endpoint = environment.ApiUrl + '/BasicEIP_Core/DiagnosticsModule/api/ClientLog/record-api-error';
      this.diagHttp.post(endpoint, payload).subscribe({
        error: (err) => console.error('無法將 API 錯誤回報至後端:', err)
      });
    } catch (e) {
      console.error('reportApiError 內部發生錯誤:', e);
    }
  }
}
