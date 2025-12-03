import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  Renderer2,
  signal,
  ViewChild
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AppMenulistComponent } from './app.menulist/app.menulist.component';
import { AppTopbarComponent } from './app.topbar/app.topbar.component';
import { LayoutService } from './layout.service';
// 最佳實踐：在 Angular 16+，推薦使用 takeUntilDestroyed
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// 由於您使用了 @ngneat/until-destroy，我們保留其 Decorator，但在 RxJS 鏈中使用 takeUntilDestroyed
import { UntilDestroy } from '@ngneat/until-destroy';
import { AuthService } from '@service/system/auth.service';
import { UserInfo } from '@shared/models/system/userInfo';
import { TabViewModule } from 'primeng/tabview';
import { AppProgressBarComponent } from './app-progress-bar/app-progress-bar.component';
import { TabService } from './app.tab/tab.service';


@UntilDestroy()
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  standalone: true,
  imports: [CommonModule, AppTopbarComponent, AppMenulistComponent, RouterOutlet, AppMenulistComponent, TabViewModule, AppProgressBarComponent]
})
export class LayoutComponent implements AfterViewInit { // 移除 OnDestroy (使用 takeUntilDestroyed)

  // 最佳實踐：使用 inject 獲取依賴，特別是內建服務 (可選，但更現代)
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(AppMenulistComponent) appSidebar!: AppMenulistComponent;
  @ViewChild('appTopbarDiv') appTopbarDivRef!: ElementRef;
  @ViewChild('layoutMainContainer', { static: false }) layoutMainContainer!: ElementRef;
  @ViewChild('sidebarContainer') sidebarContainer!: ElementRef;
  @ViewChild('scrollContent') scrollContent!: ElementRef;
  public readonly selectedTopMenuProgNo = signal<string | null>(null);
  // 移除未使用的 @ViewChild('searchInput')

  // 最佳實踐：將使用者狀態從 Property 轉換為 Signal，以獲得響應式追蹤
  // 如果 AuthService.user 已經是 Observable，這裡可以使用 toSignal()
  // 但為了保留您的邏輯，我們先保留 Property，並優化訂閱。
  user: UserInfo | null = null;

  // 最佳實踐：使用 computed 創建派生狀態
  isDarkMode = computed(() => this.layoutService.config().colorScheme === 'dark');
  // 側邊欄是否固定狀態，讓 CSS 處理粘性
  isSidebarSticky = signal(false);

  constructor(
    private readonly router: Router,
    public layoutService: LayoutService, // 保持 public，因為模板中可能使用
    private readonly authService: AuthService,
    private readonly renderer: Renderer2, // 保持 private，在類內部使用
    public tabService: TabService
  ) {
    // 最佳實踐：使用 takeUntilDestroyed 處理所有訂閱，並移除 this.subscriptions
    this.authService.user
      .pipe(takeUntilDestroyed(this.destroyRef)) // 統一管理訂閱生命週期
      .subscribe(x => this.user = x);

    // 1. 處理菜單開關/滾動鎖定 Effect
    effect(() => {
      const isMenuOpen = this.layoutService.isOverlayMenuActive() ||
        this.layoutService.isStaticMenuMobileActive() ||
        this.layoutService.isProfileSidebarVisible();

      // 最佳實踐：將 DOM 操作封裝在 service 或像這裡的獨立 private 方法中
      this.toggleBodyScroll(!isMenuOpen);

      // 最佳實踐：使用 Renderer2 進行類操作，而非直接操作 document.documentElement
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

    // 監聽 layoutService 的 overlayOpen$ 事件，這是一個冗餘的訂閱，因為 effect 已經處理了。
    // 如果 overlayOpen$ 是唯一觸發滾動鎖定的 Signal，則不需要這個訂閱。
    // 這裡我們移除它，因為 Menu 狀態變化已經被第一個 effect 追蹤。

    // 監聽側邊欄滾動 (DOM 交互)
    if (this.sidebarContainer?.nativeElement && this.scrollContent?.nativeElement) {
      // 最佳實踐：將滾動邏輯轉移到 HostListener 或獨立的方法中
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
   * 最佳實踐：使用 takeUntilDestroyed 簡化路由事件訂閱
   */
  private subscribeToRouterEvents() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef) // 統一訂閱管理
    ).subscribe(() => {
      this.layoutService.onOutsideClick(); // 導航時關閉所有菜單
      // 導航後也確保 body 滾動被啟用
      this.toggleBodyScroll(true);
    });
  }

  /**
   * 最佳實踐：使用 Renderer2 安全操作 DOM
   */
  private toggleBodyScroll(enable: boolean): void {
    if (!enable) {
      this.renderer.addClass(document.body, 'blocked-scroll');
    } else {
      this.renderer.removeClass(document.body, 'blocked-scroll');
    }
  }

  /**
   * 最佳實踐：將 DOM 讀取/寫入邏輯隔離在專門的方法中
   */
  @HostListener('window:resize')
  adjustMainContainerPadding(): void {
    // 修正：使用 appTopbarDivRef 替代 this.appTopbar.appTopbarDiv
    if (this.appTopbarDivRef?.nativeElement && this.layoutMainContainer?.nativeElement) {
      // 使用 Renderer2 設置樣式
      this.renderer.setStyle(
        this.layoutMainContainer.nativeElement,
        'paddingTop',
        `${this.appTopbarDivRef.nativeElement.offsetHeight}px` // 直接讀取 ElementRef
      );
    }
  }

  /**
   * 最佳實踐：containerClass 使用 computed，這是您已有的優化。
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

  // 移除已棄用的 Subject 和 Subscription 陣列
  // private readonly destroy$ = new Subject<void>();
  // private readonly subscriptions: Subscription[] = [];
}
