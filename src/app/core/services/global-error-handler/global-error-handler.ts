import { HttpClient } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { AuthService } from '@service/system/auth.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  // 注意：在 ErrorHandler 中必須使用 Injector 動態注入 HttpClient
  // 如果直接在 constructor 注入 HttpClient，會引發 Angular 核心啟動時的循環依賴錯誤 (Circular Dependency)
  constructor(private injector: Injector) { }

  handleError(error: any): void {
    // 1. 依舊保留原本在 F12 Console 印出錯誤的行為，方便本地開發除錯
    console.error('TSRD 前端攔截到未處理異常:', error);

    try {
      const http = this.injector.get(HttpClient);
      const authService = this.injector.get(AuthService);

      // 2. 擷取錯誤資訊
      const message = error.message ? error.message : error.toString();
      const stackTrace = error.stack ? error.stack : '';
      const currentUrl = window.location.href;

      // 3. 嘗試從 localStorage 或你的權限服務中拿目前登入的人員編號 (若有的話)
      const userNo = authService.currentUserValue?.user_No || 'Unknown'; // 如果拿不到使用者資訊，就寫 'Unknown'
      const userName = authService.currentUserValue?.user_Name || 'Unknown'; // 如果拿不到使用者資訊，就寫 'Unknown'

      // 4. 組裝 DTO
      const errorPayload = {
        Url: currentUrl,
        Message: message,
        StackTrace: stackTrace,
        User: userNo + '(' + userName + ')', // 如果拿不到使用者資訊，就寫 'Unknown'
      };

      // 5. 用非同步的方式，悄悄把錯誤丟回後端剛建好的 API
      // 請更換成你們正式或測試環境的後端實體 Domain BaseUrl
      const backendApiUrl = environment.ApiUrl + '/TSRDERP_Main/Controllers/api/ClientLog/record-error';

      http.post(backendApiUrl, errorPayload).subscribe({
        error: (err) => console.error('無法將錯誤日誌回傳至後端:', err)
      });

    } catch (loggingError) {
      // 防止日誌元件自己爆掉導致無窮迴圈
      console.error('ErrorHandler 內部發生錯誤:', loggingError);
    }
  }
}
