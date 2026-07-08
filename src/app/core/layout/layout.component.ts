import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, DestroyRef, effect, ElementRef, HostListener, inject, Renderer2, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { AuthService } from '@service/system/auth.service';
import { UserInfo } from '@shared/models/system/userInfo';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabViewModule } from 'primeng/tabview';
import { filter } from 'rxjs';
import { AppProgressBarComponent } from './app-progress-bar/app-progress-bar.component';
import { AppMenulistComponent } from './app.menulist/app.menulist.component';
import { AppTopbarComponent } from './app.topbar/app.topbar.component';
import { LayoutService } from './layout.service';

@UntilDestroy()
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  standalone: true,
  imports: [ProgressSpinnerModule, CommonModule, AppTopbarComponent, AppMenulistComponent, RouterOutlet, AppMenulistComponent, TabViewModule, AppProgressBarComponent]
})
export class LayoutComponent implements AfterViewInit { // 移除 OnDestroy (使用 takeUntilDestroyed)
  @ViewChild(AppMenulistComponent) appSidebar!: AppMenulistComponent;
  // 注意：#appTopbarDiv 這個模板變數是宣告在 AppTopbarComponent 自己的模板裡，
  // 父層的 @ViewChild 無法直接穿透子元件模板抓到它，只能先拿到元件實例再讀它公開的 ViewChild
  @ViewChild(AppTopbarComponent) appTopbarComponent!: AppTopbarComponent;
  @ViewChild('layoutMainContainer', { static: false }) layoutMainContainer!: ElementRef;
  @ViewChild('sidebarContainer') sidebarContainer!: ElementRef;
  @ViewChild('scrollContent') scrollContent!: ElementRef;
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly renderer = inject(Renderer2);
  public layoutService = inject(LayoutService);
  public readonly selectedTopMenuProgNo = signal<string | null>(null);
  // 將使用者狀態從 Property 轉換為 Signal，以獲得響應式追蹤
  // 如果 AuthService.user 已經是 Observable，這裡可以使用 toSignal()
  // 但為了保留您的邏輯，我們先保留 Property，並優化訂閱。
  user: UserInfo | null = null;
  // 使用 computed 創建派生狀態
  isDarkMode = computed(() => this.layoutService.config().colorScheme === 'dark');
  // 側邊欄是否固定狀態，讓 CSS 處理粘性
  isSidebarSticky = signal(false);

  constructor() {
    this.authService.user.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(x => this.user = x);
    // 1. 處理菜單開關/滾動鎖定 Effect
    effect(() => {
      const isMenuOpen = this.layoutService.isOverlayMenuActive() ||
        this.layoutService.isStaticMenuMobileActive() ||
        this.layoutService.isProfileSidebarVisible();
      // 將 DOM 操作封裝在 service 或像這裡的獨立 private 方法中
      this.toggleBodyScroll(!isMenuOpen);

      // 使用 Renderer2 進行類操作，而非直接操作 document.documentElement
      if (isMenuOpen) {
        this.renderer.addClass(document.documentElement, 'menu-active-state');
      } else {
        this.renderer.removeClass(document.documentElement, 'menu-active-state');
      }
    });
    // 2. 處理路由事件
    this.subscribeToRouterEvents();
  }

  ngAfterViewInit() {
    // 初始載入後調整 Padding
    this.adjustMainContainerPadding();
    // Topbar 高度會因為選單項目非同步載入、換行等原因在初始測量之後才變動，
    // 用 ResizeObserver 持續同步，避免手機版選單換行變高後蓋住下方內容
    const topbarEl = this.appTopbarComponent?.appTopbarDiv?.nativeElement;
    if (topbarEl) {
      const topbarResizeObserver = new ResizeObserver(() => this.adjustMainContainerPadding());
      topbarResizeObserver.observe(topbarEl);
      this.destroyRef.onDestroy(() => topbarResizeObserver.disconnect());
    }
    // 監聽 layoutService 的 overlayOpen$ 事件，這是一個冗餘的訂閱，因為 effect 已經處理了。
    // 如果 overlayOpen$ 是唯一觸發滾動鎖定的 Signal，則不需要這個訂閱。
    // 這裡我們移除它，因為 Menu 狀態變化已經被第一個 effect 追蹤。
    // 監聽側邊欄滾動 (DOM 交互)
    if (this.sidebarContainer?.nativeElement && this.scrollContent?.nativeElement) {
      // 將滾動邏輯轉移到 HostListener 或獨立的方法中
      this.renderer.listen(this.sidebarContainer.nativeElement, 'scroll', () => {
        const scrollTop = this.sidebarContainer.nativeElement.scrollTop;
        // 使用 Signal 更新狀態，讓模板響應 (但這裡直接操作 DOM class 也是可接受的，如果 CSS 邏輯簡單)
        // 這裡我們繼續使用 Renderer2 直接操作 DOM，因為它是滾動事件的即時響應。
        if (scrollTop > 0) {
          this.renderer.addClass(this.scrollContent.nativeElement, 'layout-sidebar-sticky');
        } else {
          this.renderer.removeClass(this.scrollContent.nativeElement, 'layout-sidebar-sticky');
        }
      });
    }
  }

  /**
   * 使用 takeUntilDestroyed 簡化路由事件訂閱
   */
  private subscribeToRouterEvents() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.layoutService.onOutsideClick(); // 導航時關閉所有菜單
      this.toggleBodyScroll(true); // 導航後也確保 body 滾動被啟用
    });
  }
  /**
   * 使用 Renderer2 安全操作 DOM
   */
  private toggleBodyScroll(enable: boolean): void {
    if (!enable) {
      this.renderer.addClass(document.body, 'blocked-scroll');
    } else {
      this.renderer.removeClass(document.body, 'blocked-scroll');
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.windowWidth.set(window.innerWidth);
    this.adjustMainContainerPadding();
  }
  /**
   * 將 DOM 讀取/寫入邏輯隔離在專門的方法中
   */
  adjustMainContainerPadding(): void {
    const topbarEl = this.appTopbarComponent?.appTopbarDiv?.nativeElement;
    if (topbarEl && this.layoutMainContainer?.nativeElement) {
      // 使用 Renderer2 設置樣式
      this.renderer.setStyle(
        this.layoutMainContainer.nativeElement,
        'paddingTop',
        `${topbarEl.offsetHeight}px`
      );
    }
  }
  /**
   * containerClass 使用 computed，這是您已有的優化。
   */
  containerClass = computed(() => {
    const config = this.layoutService.config();
    return {
      'layout-theme-light': config.colorScheme === 'light',
      'layout-theme-dark': config.colorScheme === 'dark',
      'dark-theme': config.colorScheme === 'dark',
      'light-theme': config.colorScheme === 'light',
      'layout-overlay': config.menuMode === 'overlay',
      'layout-static': config.menuMode === 'static',
      'layout-static-inactive': this.layoutService.isStaticMenuDesktopInactive() && config.menuMode === 'static',
      'layout-overlay-active': this.layoutService.isOverlayMenuActive(),
      'layout-mobile-active': this.layoutService.isStaticMenuMobileActive(),
      'p-input-filled': config.inputStyle === 'filled',
      'p-ripple-disabled': !config.ripple,
      'layout-profile-sidebar-active': this.layoutService.isProfileSidebarVisible()
    };
  });

  onToggleTheme() {
    this.layoutService.toggleColorScheme();
  }

  // 點選頂部選單時，如果側邊欄目前是關閉的就自動打開，避免手機版點了看起來毫無反應
  onTopMenuClick(progNo: string | null) {
    this.selectedTopMenuProgNo.set(progNo);
    if (progNo) this.layoutService.openMenu();
  }

  windowWidth = signal(window.innerWidth);
  loadingMaskStyle = computed(() => {
    this.windowWidth(); // 訂閱視窗變化
    const isDesktop = this.windowWidth() > 991;
    const isMenuCollapsed = this.layoutService.isStaticMenuDesktopInactive();
    // 取得 Topbar 實際高度
    const topbarHeight = this.appTopbarComponent?.appTopbarDiv?.nativeElement?.offsetHeight || 80;
    // 1. 手機版：全寬
    if (!isDesktop) {
      return {
        'top': `${topbarHeight}px`,
        'left': '0',
        'width': '100vw', // 使用 vw 確保佔滿視窗
        'height': `calc(100vh - ${topbarHeight}px)`,
        'z-index': '9999'
      };
    }
    // 2. 桌機版
    // 重要：這裡的 marginLeft 必須跟你的 .layout-sidebar 寬度完全一致
    // 如果 CSS 是 24rem，這裡就必須是 24rem
    const marginLeft = isMenuCollapsed ? '0px' : '24rem';
    return {
      'top': `${topbarHeight - 10}px`,
      'left': isMenuCollapsed ? '0px' : `calc(${marginLeft} + 2rem)`, // marginLeft,
      'width': isMenuCollapsed ? '100vw' : `calc(100vw - ${marginLeft} - 2rem)`,
      'height': `calc(100vh - ${topbarHeight - 10}px)`,
      'transition': 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      'z-index': '9999'
    };
  });
}
