import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { AuthService } from '@service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { environment } from 'src/environments/environment';

/**
 * 全域「JavaScript 執行期錯誤」攔截器。
 *
 * 職責邊界（重要）：
 *  - 這裡只負責「未被 catch 的前端 JS 例外」（template 噴錯、null 取值、第三方套件丟錯…）。
 *  - HTTP / API 錯誤一律由 errorInterceptor → ErrorHandlerService 處理，不在這裡重複落地。
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  // 注意：在 ErrorHandler 中必須使用 Injector 動態注入 HttpClient
  // 如果直接在 constructor 注入 HttpClient，會引發 Angular 核心啟動時的循環依賴錯誤 (Circular Dependency)
  constructor(private injector: Injector) { }

  // 【地雷 2】去重用：記錄「錯誤訊息 → 最後回報時間」，避免 render 迴圈在數秒內把後端洗版
  private readonly recentErrors = new Map<string, number>();
  private readonly DEDUP_WINDOW_MS = 5000; // 同一則錯誤 5 秒內只回報一次

  handleError(error: any): void {
    // 【地雷 1】HTTP 錯誤已由 errorInterceptor / ErrorHandlerService 跳 Toast 並落地，
    // 這裡若再 post 一次會造成「同一個 API 錯誤被當成未處理前端異常」重複記錄，故直接略過。
    if (error instanceof HttpErrorResponse) {
      console.error('HTTP 錯誤已於攔截器處理，全域略過落地:', error);
      return;
    }

    // 1. 依舊保留在 F12 Console 印出錯誤的行為，方便本地開發除錯
    console.error('TSRD 前端攔截到未處理異常:', error);

    // 【地雷 7】JS 執行期錯誤時，主動關掉全域 Loader/遮罩。
    // 情境：blockUi() 後在 subscribe callback 內同步噴 JS 例外（例如取 null 屬性），
    // 此路徑不會經過 errorInterceptor / ErrorHandlerService（那邊才有 unblockUi），
    // 遮罩會永久卡住、使用者只能重整。故在此補一次。
    try {
      this.injector.get(NotificationService).unblockUi();
    } catch { /* notification 取不到時不影響後續落地 */ }

    // 【地雷 2】時間窗去重：同一則錯誤短時間內只回報一次，防止無窮 re-render 把後端打爆
    const dedupKey = (error?.message ?? String(error)).slice(0, 200);
    const now = Date.now();

    // 【地雷 8】順手清掉過期紀錄，避免 recentErrors Map 在長時間開著的分頁無限成長
    for (const [key, ts] of this.recentErrors) {
      if (now - ts > this.DEDUP_WINDOW_MS) {
        this.recentErrors.delete(key);
      }
    }

    const lastReportedAt = this.recentErrors.get(dedupKey);
    if (lastReportedAt && now - lastReportedAt < this.DEDUP_WINDOW_MS) {
      return; // 視窗內的重複錯誤：已記過，跳過後端回報
    }
    this.recentErrors.set(dedupKey, now);

    try {
      const http = this.injector.get(HttpClient);
      const authService = this.injector.get(AuthService);

      // 2. 擷取錯誤資訊
      const message = error.message ? error.message : error.toString();
      const stackTrace = error.stack ? error.stack : '';
      const currentUrl = window.location.href;

      // 3. 嘗試從權限服務中拿目前登入的人員編號 (若拿不到則寫 'Unknown')
      const userNo = authService.currentUserValue?.user_No || 'Unknown';
      const userName = authService.currentUserValue?.user_Name || 'Unknown';

      // 4. 組裝 DTO
      const errorPayload = {
        Url: currentUrl,
        Message: message,
        StackTrace: stackTrace,
        User: userNo + '(' + userName + ')',
      };

      // 5. 用非同步的方式，悄悄把錯誤丟回後端 ClientLog API
      const backendApiUrl = environment.ApiUrl + '/BasicEIP_Core/DiagnosticsModule/api/ClientLog/record-error';

      http.post(backendApiUrl, errorPayload).subscribe({
        error: (err) => console.error('無法將錯誤日誌回傳至後端:', err)
      });

    } catch (loggingError) {
      // 防止日誌元件自己爆掉導致無窮迴圈
      console.error('ErrorHandler 內部發生錯誤:', loggingError);
    }
  }
}
