import { Component, isDevMode, OnInit, } from '@angular/core';
import { NavigationError, Router, RouterOutlet } from '@angular/router';
import { SwUpdate, VersionDetectedEvent, VersionReadyEvent } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { PrimeNGConfig } from 'primeng/api';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { filter, interval } from 'rxjs';
import { NotificationMessageComponent } from './shared/component/notification-message/notification-message.component';
import { VersionCheckService } from './service/system/version-check.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet, NotificationMessageComponent, ConfirmDialogModule],
})
export class AppComponent implements OnInit {
  constructor(
    private readonly primengConfig: PrimeNGConfig,
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly swUpdate: SwUpdate,
    private readonly notificationService: NotificationService,
    private readonly versionCheckService: VersionCheckService
  ) {
    this.translate.setDefaultLang('zh-tw');
    this.translate.use('zh-tw');
    this.handleRouteLoadErrors();
    this.checkForAppUpdate();
    this.startVersionMonitoring();
  }
  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.primengConfig.setTranslation({
      today: '今天',
      dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
      dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      dateFormat: 'yy/mm/dd',
      weekHeader: '週',
      emptyFilterMessage: '沒有符合條件的資料',
      passwordPrompt: '請輸入密碼',
      searchMessage: '搜尋中',	// { 0} results are available
      selectionMessage: '已選擇 {0} 個項目',	// { 0} items selected
      emptySelectionMessage: '沒有選擇', 	// No selected item
      emptySearchMessage: '沒有符合條件的資料',	// No results found
      emptyMessage: '沒有可供選擇的項目',	// No available options
      chooseYear: '選擇年份',
      chooseMonth: '選擇月份',
      chooseDate: '選擇日期',
      prevDecade: '上一個十年',
      nextDecade: '下一個十年',
      prevYear: '上一年',
      nextYear: '下一年',
      prevMonth: '上一月',
      nextMonth: '下一月',
      prevHour: '上一個小時',
      nextHour: '下一個小時',
      prevMinute: '上一分鐘',
      nextMinute: '下一分鐘',
      prevSecond: '上一秒',
      nextSecond: '下一秒',
      am: '上午',
      pm: '下午',
      weak: '弱',
      medium: '中',
      strong: '強',
      startsWith: '開頭為',
      contains: '包含',
      notContains: '不包含',
      endsWith: '結尾為',
      equals: '等於',
      notEquals: '不等於',
      noFilter: '無篩選器',
      lt: '小於',
      lte: '小於或等於',
      gt: '大於',
      gte: '大於或等於',
      dateIs: '日期為',
      dateIsNot: '日期不為',
      dateBefore: '日期在...之前',
      dateAfter: '日期在...之後',
      clear: '清除',
      apply: '應用',
      matchAll: '全部匹配',
      matchAny: '任何一個匹配',
      addRule: '新增規則',
      removeRule: '移除規則',
      accept: '是',
      reject: '否',
      choose: '選擇',
      upload: '上傳',
      cancel: '取消',
      pending: '待處理',
    });
  }
  /**
   * 監聽路由事件，捕捉動態載入模組 (Lazy Loading) 失敗的錯誤。
   */
  private handleRouteLoadErrors(): void {
    this.router.events
      .pipe(
        filter((e): e is NavigationError => e instanceof NavigationError)// 只過濾出 NavigationError 事件
      )
      .subscribe((error) => {
        const errorMsg = error.error.message;

        // 判斷是否為程式碼分割 (Code Splitting) 載入失敗的常見錯誤
        // 錯誤通常包含 "Loading chunk" 或 "Failed to fetch dynamically imported module" 等關鍵詞
        if (errorMsg.includes('chunk') || errorMsg.includes('module')) {
          console.error('偵測到動態模組載入失敗 (可能因版本更新):', error);

          // 提示使用者並執行強制重新載入
          const userConfirmed = confirm('應用程式已更新。為確保功能正常，需要重新載入頁面。點擊「確定」重新整理。');

          if (userConfirmed) {
            // 傳入 true 以強制從伺服器載入，不使用瀏覽器快取
            window.location.reload();
          }
        } else {
          // 其他路由錯誤，可以選擇性地報告或記錄
          console.error('發生其他路由錯誤:', error);
        }
      });
  }
  /**
   * 檢查是否有新的應用程式版本可用，並提示使用者。
   */
  private checkForAppUpdate(): void {
    // 只有在 Service Worker 啟用時才執行 (即非開發模式)
    if (!isDevMode() && this.swUpdate.isEnabled) {

      // 1. 【修正】偵聽是否有新版本被偵測到 (VERSION_DETECTED)
      this.swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionDetectedEvent => evt.type === 'VERSION_DETECTED')
      ).subscribe((evt) => {
        // 這裡 VersionDetectedEvent 只有 version 屬性，沒有 previousVersion
        console.log(`SW: 偵測到新版本。新版本雜湊/版本號: ${evt.version}。`);
        // 如果要顯示通知，例如：
        this.notificationService.infoBubble('新版本正在背景下載，請稍候。', '系統更新中...');
      });

      // 2. 偵聽是否有可用的新版本 (已下載到快取中) - VERSION_READY
      this.swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      ).subscribe((evt) => {
        // VersionReadyEvent 包含 previousVersion 和 currentVersion (即 version)
        console.log(`SW: 新版本已準備就緒。新版本: ${evt.currentVersion}。`);

        // 🔥 改為更積極的更新策略：自動更新而非詢問
        this.notificationService.infoBubble(
          '系統將在 5 秒後自動更新到最新版本...',
          '偵測到新版本'
        );

        // 5 秒後自動刷新
        setTimeout(() => {
          this.swUpdate.activateUpdate().then(() => {
            console.log('SW: 正在啟用新版本並重新載入頁面...');
            document.location.reload();
          });
        }, 5000);
      });

      // 3. 設定檢查間隔：每 5 分鐘主動檢查 (從 15 分鐘縮短)
      interval(5 * 60 * 1000).subscribe(() => {
        console.log('SW: 主動檢查是否有新版本...');
        this.swUpdate.checkForUpdate();
      });

      // 4. 在 App 啟動時主動檢查一次
      this.swUpdate.checkForUpdate();

      // 5. 🔥 每次使用者聚焦視窗時也檢查 (使用者從其他分頁切回來)
      window.addEventListener('focus', () => {
        console.log('SW: 視窗重新聚焦，檢查更新...');
        this.swUpdate.checkForUpdate();
      });
    }
  }

  /**
   * 🔥 啟動版本監控 (檢查 version.json)
   */
  private startVersionMonitoring(): void {
    // 訂閱版本更新事件
    this.versionCheckService.versionUpdateAvailable$.subscribe((newVersion) => {
      console.log('[App] 偵測到新版本:', newVersion);

      // 顯示通知並自動刷新
      this.notificationService.infoBubble(
        `新版本 ${newVersion.version} 已發布！系統將在 3 秒後自動更新...`,
        '系統更新通知'
      );

      // 3 秒後刷新頁面
      setTimeout(() => {
        console.log('[App] 正在重新載入頁面以套用新版本...');
        // 強制重新載入（不使用快取）
        window.location.reload();
      }, 3000);
    });

    // 啟動版本檢查
    this.versionCheckService.startVersionCheck();
  }
}
