import { Injectable, effect, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface AppConfig {
  inputStyle: string;
  colorScheme: 'light' | 'dark';
  theme: string;
  ripple: boolean;
  menuMode: string;
  scale: number;
}
@Injectable({ providedIn: 'root' })
export class LayoutService {
  config = signal<AppConfig>({
    ripple: false,
    inputStyle: 'outlined',
    menuMode: 'static',
    colorScheme: 'light',
    theme: 'blue',
    scale: 14,
  });

  // 在這裡保留一份初始配置，用於 effect 內部判斷是否主題發生了變化
  private initialConfig: AppConfig = { ...this.config() }; // 深拷貝初始值
  // 從 localStorage 載入預設值
  isStaticMenuDesktopInactive = signal(
    localStorage.getItem('app-menu-desktop-inactive') === 'true'
  ); // 桌機靜態模式下側邊欄是否不活躍 (true: 關閉/收合)
  isOverlayMenuActive = signal(
    localStorage.getItem('app-menu-overlay-active') === 'true'
  );     // 覆蓋模式下側邊欄是否活躍 (true: 開啟)
  isStaticMenuMobileActive = signal(
    localStorage.getItem('app-menu-mobile-active') === 'true'
  );  // 手機模式下側邊欄是否活躍 (true: 開啟)

  isProfileSidebarVisible = signal(false);   // 個人資料側邊欄是否可見 (你原先的 profileSidebarVisible)
  isConfigSidebarVisible = signal(false);   // 配置側邊欄是否可見 (你原先的 configSidebarVisible)
  isMenuHoverActive = signal(false);      // 菜單懸停是否活躍 (你原先的 menuHoverActive)

  private readonly configUpdate = new Subject<AppConfig>();
  private readonly overlayOpen = new Subject<void>();
  configUpdate$ = this.configUpdate.asObservable();
  overlayOpen$ = this.overlayOpen.asObservable();

  constructor() {
    // **重要**：由於信號已在宣告時從 localStorage 載入，這裡無需額外處理

    effect(() => {
      const config = this.config();
      this.updateThemeClass(config.colorScheme);
      // 當 colorScheme 或 theme 改變時才需要重新載入
      if (
        config.colorScheme !== this.initialConfig.colorScheme ||
        config.theme !== this.initialConfig.theme
      ) {
        this.loadThemeCss(config.theme, config.colorScheme);
      }
      // 更新 initialConfig 以便下次 effect 運行時進行比較
      this.initialConfig = { ...config };

      this.changeScale(config.scale);
      this.onConfigUpdate();
    }, { allowSignalWrites: true });

    // 監聽 overlayOpen$ 以在側邊欄打開時強制關閉其他側邊欄
    this.overlayOpen$.subscribe(() => {
      // 當任何一個 overlay (例如 menu 或 profile sidebar) 打開時，
      // 確保其他類似的 overlay 關閉，避免多個重疊。
      if (this.isOverlayMenuActive() || this.isStaticMenuMobileActive()) {
        this.isProfileSidebarVisible.set(false); // 確保 profileSidebar 關閉
      }
      if (this.isProfileSidebarVisible()) {
        this.isOverlayMenuActive.set(false);
        this.isStaticMenuMobileActive.set(false);
      }
    });
  }

  // 現在的邏輯是根據 colorScheme 和 theme 來構建路徑
  private loadThemeCss(themeName: string, colorScheme: string) {
    const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = `lara-${colorScheme}-${themeName}.css`;
    }
  }

  onMenuToggle() {
    if (this.isOverlay()) {
      this.isOverlayMenuActive.update(val => !val);
      // **ADDED**: Save overlay state
      localStorage.setItem('app-menu-overlay-active', this.isOverlayMenuActive().toString());

      if (this.isOverlayMenuActive()) {
        this.overlayOpen.next();
      }
    } else if (this.isDesktop()) {// Static menu mode
      this.isStaticMenuDesktopInactive.update(val => !val);
      // **ADDED**: Save desktop inactive state
      localStorage.setItem('app-menu-desktop-inactive', this.isStaticMenuDesktopInactive().toString());

    } else { // Mobile mode
      this.isStaticMenuMobileActive.update(val => !val);
      // **ADDED**: Save mobile active state
      localStorage.setItem('app-menu-mobile-active', this.isStaticMenuMobileActive().toString());

      if (this.isStaticMenuMobileActive()) {
        this.overlayOpen.next();
      }
    }
    // 確保只在菜單實際打開時發送 overlayOpen 事件
    if (this.isOverlayMenuActive() || this.isStaticMenuMobileActive()) {
      this.overlayOpen.next();
    }
  }
  // 用於在外部點擊時關閉所有菜單
  onOutsideClick() {
    this.isOverlayMenuActive.set(false);
    this.isStaticMenuMobileActive.set(false);
    this.isProfileSidebarVisible.set(false); // 也關閉個人資料側邊欄
    this.isMenuHoverActive.set(false); // 關閉 hover 狀態
    this.isConfigSidebarVisible.set(false); // 根據需求決定是否關閉配置側邊欄

    // **ADDED**: When closed by outside click, save the closed state
    localStorage.setItem('app-menu-overlay-active', 'false');
    localStorage.setItem('app-menu-mobile-active', 'false');
  }

  showProfileSidebar() {
    this.isProfileSidebarVisible.update(val => !val); // 切換顯示狀態
    if (this.isProfileSidebarVisible()) {
      this.overlayOpen.next(); // 打開時發送事件
    }
  }
  showConfigSidebar() {
    this.isConfigSidebarVisible.set(true);
  }

  hideConfigSidebar() { // 提供一個方法來關閉配置側邊欄
    this.isConfigSidebarVisible.set(false);
  }

  isOverlay() {
    return this.config().menuMode === 'overlay';
  }

  isDesktop() {
    return window.innerWidth > 991;
  }
  isMobile() {
    return !this.isDesktop();
  }

  onConfigUpdate() {
    this.configUpdate.next(this.config());
  }

  updateThemeClass(colorScheme: 'light' | 'dark') {
    if (colorScheme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else if (colorScheme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  }
  changeScale(value: number) {
    document.documentElement.style.fontSize = `${value}px`;
  }
  // 切換佈景主題 (light/dark)
  toggleColorScheme() {
    this.config.update(currentConfig => {
      const newColorScheme = currentConfig.colorScheme === 'light' ? 'dark' : 'light';
      return {
        ...currentConfig,
        colorScheme: newColorScheme,
      };
    });
  }
  changeTheme(newTheme: string) {
    this.config.update(currentConfig => ({
      ...currentConfig,
      theme: newTheme
    }));
  }
}
