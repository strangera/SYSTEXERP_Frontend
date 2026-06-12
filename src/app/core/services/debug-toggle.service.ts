import { inject, Injectable, signal } from '@angular/core';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { environment } from 'src/environments/environment';

const DEBUG_KEY = 'AppDebugModeEnabled';

// 定義 SQL 數據的型別
export interface ExecutedSqlDetail {
  sql: string;
}

export interface ApiMetrics {
  totalTime: number;          // 前端計時的總時間（體感）
  beforeDbTime: number;       // ✨ 新增：進 DB 前 C# 耗時 (對應 BeforeDbTimeMs)
  dbTime: number;             // 後端回傳的 DbTimeMs
  afterDbTime: number;        // ✨ 新增：出 DB 後 C# 耗時 (對應 AfterDbTimeMs)
  networkTime: number;        // 網路與序列化損耗
  totalBackendTime?: number;  // 後端總時間 (對應 TotalBackendTimeMs)
}

/** 完整 API 呼叫的除錯記錄項目 */
export interface ApiSqlHistoryEntry {
  apiUrl: string;
  sqlData: ExecutedSqlDetail[];
  stackTrace: string | null;
  timestamp: Date;
  metrics?: ApiMetrics; // 新增選擇性欄位存放效能數據
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
    // 💡 原本邏輯：只在非正式環境綁定全域指令
    // if (!environment.production) { ... }

    // 🛠️ 調整：前端一律允許，讓生產環境也可以在 F12 Console 呼叫指令。改由後端權限控管是否真正回傳 SQL 資料。
    (window as any).SQL_ON = () => this.enableDebugByCommand(true);
    (window as any).SQL_OFF = () => this.enableDebugByCommand(false);

    if (this.initialDebugState) {
      console.log(`[Debug Service] 偵測到 Local Storage 啟用，SQL 偵錯模式自動開啟。`);
    } else {
      console.log('[Debug Service] 已啟用全域除錯指令：SQL_ON() / SQL_OFF()');
    }
  }

  /**
   * 切換除錯開關狀態。
   */
  toggleDebug(enable: boolean) {
    this.isDebugEnabled.set(enable);
    // 關鍵：每次切換都必須將最新狀態寫入 Local Storage
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
   * 供 Console 指令呼叫的方法，強制開啟或關閉除錯模式。
   */
  public enableDebugByCommand(enable: boolean): void {
    // 💡 原本邏輯：正式環境下阻斷並拒絕開啟除錯模式
    // if (environment.production && enable) {
    //   console.error('生產環境下不允許使用指令強制開啟除錯模式！');
    //   this.notificationService.errorBubble('生產環境下不允許開啟除錯模式。');
    //   return;
    // }

    // 🛠️ 調整：前端一律放行，是否回傳效能與 SQL 數據改由後端 API 依帳號權限或環境判斷。
    this.toggleDebug(enable);
    console.log(`[Debug] 偵錯模式已透過指令設定為: ${enable ? '開啟' : '關閉'}`);
  }

  /**
   * 在 Interceptor 中呼叫，用於儲存並顯示 SQL 資訊。
   */
  setAndShowSqlData(
    apiUrl: string,
    sqlData: string[] | ExecutedSqlDetail[],
    stackTrace: string | null = null,
    metrics?: ApiMetrics
  ) {
    let processedSqlData: ExecutedSqlDetail[] = [];
    if (sqlData.length > 0 && typeof sqlData[0] === 'string') {
      processedSqlData = (sqlData as string[]).map(sqlString => ({ sql: sqlString }));
    } else {
      processedSqlData = sqlData as ExecutedSqlDetail[];
    }

    this.latestSqlData.set(processedSqlData);
    this.latestStackTrace.set(stackTrace);

    if (processedSqlData.length > 0) {
      const newEntry: ApiSqlHistoryEntry = {
        apiUrl: apiUrl,
        sqlData: processedSqlData,
        stackTrace: stackTrace,
        timestamp: new Date(),
        metrics: metrics
      };

      this.allSqlHistory.update(currentHistory => {
        const MAX_ENTRIES = 15;
        const TRIM_COUNT = 5;
        const updatedHistory = [...currentHistory, newEntry];

        if (updatedHistory.length > MAX_ENTRIES) {
          return updatedHistory.slice(TRIM_COUNT);
        }
        return updatedHistory;
      });
    } else {
      this.latestSqlData.set([]);
      this.latestStackTrace.set(null);
    }
  }

  /**
   * 清除所有歷史 SQL 記錄
   */
  public clearHistory(): void {
    this.allSqlHistory.set([]);
    this.latestSqlData.set([]);
    this.latestStackTrace.set(null);
    this.notificationService.infoBubble('所有 SQL 歷史記錄已清除。');
    console.log('[Debug Service] 所有 SQL 歷史記錄已手動清除。');
  }

  /**
   * 為了保持向下相容性，但請注意此函數現在回傳的是 ApiSqlHistoryEntry[]
   */
  getAllSqlHistory(): ApiSqlHistoryEntry[] {
    return this.allSqlHistory();
  }
}
