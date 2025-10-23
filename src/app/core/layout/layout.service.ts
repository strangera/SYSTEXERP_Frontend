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
  isStaticMenuDesktopInactive = signal(false); // 桌機靜態模式下側邊欄是否不活躍
  isOverlayMenuActive = signal(false);         // 覆蓋模式下側邊欄是否活躍
  isStaticMenuMobileActive = signal(false);    // 手機模式下側邊欄是否活躍
  isProfileSidebarVisible = signal(false);     // 個人資料側邊欄是否可見 (你原先的 profileSidebarVisible)
  isConfigSidebarVisible = signal(false);      // 配置側邊欄是否可見 (你原先的 configSidebarVisible)
  isMenuHoverActive = signal(false);           // 菜單懸停是否活躍 (你原先的 menuHoverActive)

  private readonly configUpdate = new Subject<AppConfig>();
  private readonly overlayOpen = new Subject<void>();
  configUpdate$ = this.configUpdate.asObservable();
  overlayOpen$ = this.overlayOpen.asObservable();

  constructor() {
    this.loadMenuState();
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

  private loadMenuState() {
    // 覆蓋模式
    const overlayActive = localStorage.getItem('menuActive_overlay');
    if (overlayActive !== null) {
      this.isOverlayMenuActive.set(overlayActive === 'true');
    }

    // 桌面靜態模式
    const desktopInactive = localStorage.getItem('menuInactive_desktop');
    if (desktopInactive !== null) {
      this.isStaticMenuDesktopInactive.set(desktopInactive === 'true');
    }

    // 手機靜態模式
    const mobileActive = localStorage.getItem('menuActive_mobile');
    if (mobileActive !== null) {
      this.isStaticMenuMobileActive.set(mobileActive === 'true');
    }
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
      this.isOverlayMenuActive.update(val => {
        const newVal = !val;
        localStorage.setItem('menuActive_overlay', String(newVal));
        return newVal;
      });
      if (this.isOverlayMenuActive()) {
        this.overlayOpen.next();
      }
    } else if (this.isDesktop()) { // Static menu mode (桌面靜態模式)
      this.isStaticMenuDesktopInactive.update(val => {
        const newVal = !val;
        localStorage.setItem('menuInactive_desktop', String(newVal));
        return newVal;
      });
    } else { // Mobile mode (手機模式)
      this.isStaticMenuMobileActive.update(val => {
        const newVal = !val;
        localStorage.setItem('menuActive_mobile', String(newVal));
        return newVal;
      });
      if (this.isStaticMenuMobileActive()) {
        this.overlayOpen.next();
      }
    }

    // 原始的 overlayOpen 觸發邏輯保持不變
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
