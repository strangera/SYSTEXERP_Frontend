import { inject, Injectable, signal } from '@angular/core';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { environment } from 'src/environments/environment';

const DEBUG_KEY = 'AppDebugModeEnabled';
// 定義 SQL 數據的型別
export interface ExecutedSqlDetail {
  sql: string;
  // 如果您在後端還收集了其他資訊，例如 time, params 等，也可以在這裡加上
}

/** 完整 API 呼叫的除錯記錄項目 */
export interface ApiSqlHistoryEntry {
  apiUrl: string;       // API 請求路徑
  sqlData: ExecutedSqlDetail[]; // 該 API 產生的 SQL 列表
  stackTrace: string | null; // 堆疊追蹤資訊
  timestamp: Date;      // 記錄時間戳 (可選，但推薦)
}

@Injectable({
  providedIn: 'root'
})
export class DebugToggleService {
  public readonly showDebugToggleInMenu: boolean = environment.showDebugToggleInMenu;
  private readonly initialDebugState = localStorage.getItem(DEBUG_KEY) === 'true';
  // 專門用於控制是否要顯示除錯資訊的開關狀態 (預設關閉)
  public isDebugEnabled = signal<boolean>(this.initialDebugState);

  // 儲存最近一次 API 呼叫所收集到的 SQL 資訊
  public latestSqlData = signal<ExecutedSqlDetail[]>([]);

  // 儲存所有歷史 SQL 語法記錄的 Signal (儲存完整的 ApiSqlHistoryEntry 陣列)
  public allSqlHistory = signal<ApiSqlHistoryEntry[]>([]);

  // 儲存最近一次 API 呼叫所收集到的 StackTrace
  public latestStackTrace = signal<string | null>(null);
  private readonly notificationService = inject(NotificationService);
  constructor() {
    //  方便開發者：將指令公開到瀏覽器全域變數 (僅限非生產環境)
    if (!environment.production) {
      (window as any).SQL_ON = () => this.enableDebugByCommand(true);
      (window as any).SQL_OFF = () => this.enableDebugByCommand(false);

      // 如果服務已經初始化時發現 Local Storage 是開啟的，我們就 Log 一下
      if (this.initialDebugState) {
        console.log(`[Debug Service] 偵測到 Local Storage 啟用，SQL 偵錯模式自動開啟。`);
      } else {
        console.log('[Debug Service] 已啟用全域除錯指令：enableAppDebug() / disableAppDebug()');
      }
    }
  }
  /**
   * 切換除錯開關狀態。
   */
  toggleDebug(enable: boolean) {
    this.isDebugEnabled.set(enable);

    //  關鍵：每次切換都必須將最新狀態寫入 Local Storage
    localStorage.setItem(DEBUG_KEY, enable.toString());

    if (!enable) {
      // 如果關閉了，清除所有舊數據
      this.latestSqlData.set([]);
      this.latestStackTrace.set(null);
      this.allSqlHistory.set([]);
    } else {
      this.notificationService.successBubble('SQL 偵錯模式已開啟。');
    }
  }

  /**
     *  供 Console 指令呼叫的方法，強制開啟或關閉除錯模式。
     */
  public enableDebugByCommand(enable: boolean): void {
    if (environment.production && enable) {
      console.error('生產環境下不允許使用指令強制開啟除錯模式！');
      this.notificationService.errorBubble('生產環境下不允許開啟除錯模式。');
      return;
    }
    this.toggleDebug(enable);

    // 可以在這裡做額外的 Log 或通知
    console.log(`[Debug] 偵錯模式已透過指令設定為: ${enable ? '開啟' : '關閉'}`);
  }

  /**
   * 在 Interceptor 中呼叫，用於儲存並顯示 SQL 資訊。
   * 修正邏輯：將完整的 API 呼叫記錄到 allSqlHistory 中。
   * @param apiUrl API 請求路徑
   * @param sqlData 來自 Header 的 Base64 解碼後的 SQL 列表
   * @param stackTrace 來自 Header 的 Base64 解碼後的 StackTrace
   */
  setAndShowSqlData(apiUrl: string, sqlData: string[] | ExecutedSqlDetail[], stackTrace: string | null = null) {
    let processedSqlData: ExecutedSqlDetail[] = [];

    // 檢查並轉換：如果陣列中的第一個元素是字串，則進行轉換
    if (sqlData.length > 0 && typeof sqlData[0] === 'string') {
      processedSqlData = (sqlData as string[]).map(sqlString => ({
        sql: sqlString
      }));
    } else {
      processedSqlData = sqlData as ExecutedSqlDetail[];
    }

    // 1. 更新最新的 SQL 資訊
    this.latestSqlData.set(processedSqlData);
    this.latestStackTrace.set(stackTrace);

    // 2. 只有當有實際 SQL 數據時才記錄到歷史記錄中
    if (processedSqlData.length > 0) {
      // 建立新的歷史記錄項目
      const newEntry: ApiSqlHistoryEntry = {
        apiUrl: apiUrl,
        sqlData: processedSqlData,
        stackTrace: stackTrace,
        timestamp: new Date()
      };

      // 更新 allSqlHistory Signal (追加新的 API 呼叫記錄)
      this.allSqlHistory.update(currentHistory => [...currentHistory, newEntry]);

      // 這裡可以觸發通知
      // this.notificationService.show('info', `API 呼叫 [${apiUrl}] 包含 ${processedSqlData.length} 條 SQL 語法`);

    } else {
      // 如果沒有 SQL 數據，清除最新數據 (但保持歷史記錄不變)
      this.latestSqlData.set([]);
      this.latestStackTrace.set(null);
    }
  }

  /**
   * 為了保持向下相容性，但請注意此函數現在回傳的是 ApiSqlHistoryEntry[]
   * 如果您的舊程式碼需要 ExecutedSqlDetail[]，此函數的設計應重新考慮。
   */
  getAllSqlHistory(): ApiSqlHistoryEntry[] {
    return this.allSqlHistory();
  }
}
