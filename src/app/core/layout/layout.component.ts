import { AfterViewInit, Component, effect, ElementRef, HostListener, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { Subject, Subscription, filter } from 'rxjs';
import { AppMenulistComponent } from './app.menulist/app.menulist.component';
import { AppTopbarComponent } from './app.topbar/app.topbar.component';
import { LayoutService } from './layout.service';
import { computed } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserInfo } from '@shared/models/system/userInfo';
import { AuthService } from '@service/system/auth.service';

@UntilDestroy()
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  standalone: true,
  imports: [NgIf, NgClass, AppTopbarComponent, AppMenulistComponent, RouterOutlet, AppMenulistComponent]
})
export class LayoutComponent implements AfterViewInit, OnDestroy {
  @ViewChild(AppMenulistComponent) appSidebar!: AppMenulistComponent;
  @ViewChild(AppTopbarComponent) appTopbar!: AppTopbarComponent;
  @ViewChild('layoutMainContainer', { static: false }) layoutMainContainer!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('sidebarContainer') sidebarContainer!: ElementRef; // 監聽滾動的容器
  @ViewChild('scrollContent') scrollContent!: ElementRef;   // 要添加 class 的元素
  private destroy$ = new Subject<void>();

  selectedTopMenuProgNo: string | null = null;
  activeIndex = 2;
  menuOutsideClickListener: (() => void) | null = null;
  user: UserInfo | null = null;
  private subscriptions: Subscription[] = [];
  isDarkMode = computed(() => this.layoutService.config().colorScheme === 'dark');

  constructor(
    private router: Router,
    public layoutService: LayoutService,
    private authService: AuthService,
    public renderer: Renderer2
  ) {
    this.subscriptions.push(this.authService.user.pipe(untilDestroyed(this)).subscribe(x => this.user = x));
    // 監聽 layoutService 的 isOverlayMenuActive 或 isStaticMenuMobileActive 變化來啟用/禁用滾動
    // 更好的做法是 effect 內部處理 toggleBodyScroll，但在組件內監聽也可以
    effect(() => {
      const overlayActive = this.layoutService.isOverlayMenuActive();
      const mobileActive = this.layoutService.isStaticMenuMobileActive();
      // 這裡可以根據 isOverlayMenuActive 或 isStaticMenuMobileActive 的狀態來決定是否啟用滾動
      // 由於 onOutsideClick 已經包含了 toggleBodyScroll(true)
      // 這裡可以確保在菜單打開時，body 滾動被禁用
      this.toggleBodyScroll(!(overlayActive || mobileActive));
    });
    // 監聽所有側邊欄 Signal 變化來決定是否添加或移除 menu-active 相關的 class
    // 這是更直接的方法，替代了之前的 createOutsideClickListener 和 hideMenu 邏輯
    effect(() => {
      const isOverlayActive = this.layoutService.isOverlayMenuActive();
      const isStaticMobileActive = this.layoutService.isStaticMenuMobileActive();
      const isProfileSidebarVisible = this.layoutService.isProfileSidebarVisible();

      // 這裡可以根據你的 CSS 框架來應用正確的 class
      // 例如，如果你的 CSS 類名是 layout-mobile-active，則在 mobileActive 為 true 時添加
      if (isOverlayActive || isStaticMobileActive || isProfileSidebarVisible) {
        // 當任何一個主要側邊欄打開時，可能需要添加一個通用類來處理遮罩或 body 滾動
        document.documentElement.classList.add('menu-active-state'); // 自定義一個通用類
      } else {
        document.documentElement.classList.remove('menu-active-state');
      }
    }, { allowSignalWrites: true }); // 如果 effect 內部有 Signal 寫入，記得加這個
  }

  ngAfterViewInit() {
    this.subscribeToRouterEvents();
    this.adjustMainContainerPadding(); // 確保在初始載入後也調整一次

    // 監聽 layoutService 的 overlayOpen$ 事件，以便在菜單打開時添加 body 的 class
    this.subscriptions.push(
      this.layoutService.overlayOpen$.pipe(untilDestroyed(this)).subscribe(() => {
        this.toggleBodyScroll(false); // 禁用滾動
      })
    );
    if (this.sidebarContainer?.nativeElement && this.scrollContent?.nativeElement) {
      this.renderer.listen(this.sidebarContainer.nativeElement, 'scroll', () => {
        const scrollTop = this.sidebarContainer.nativeElement.scrollTop;
        if (scrollTop > 0) {
          this.renderer.addClass(this.scrollContent.nativeElement, 'layout-sidebar-sticky');
        } else {
          this.renderer.removeClass(this.scrollContent.nativeElement, 'layout-sidebar-sticky');
        }
      });
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }
  private subscribeToRouterEvents() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), untilDestroyed(this)).subscribe(() => {
      this.layoutService.onOutsideClick(); // 導航時關閉所有菜單
    });
  }
  private toggleBodyScroll(enable: boolean): void {
    document.body.classList.toggle('blocked-scroll', !enable);
  }
  @HostListener('window:resize', ['$event'])
  adjustMainContainerPadding(): void {
    if (this.appTopbar.appTopbarDiv && this.layoutMainContainer) {
      this.renderer.setStyle(this.layoutMainContainer.nativeElement, 'paddingTop', `${this.appTopbar.appTopbarDiv.nativeElement.offsetHeight}px`);
    }
  }
  containerClass = computed(() => {
    const config = this.layoutService.config();
    return {
      'layout-theme-light': config.colorScheme === 'light',
      'layout-theme-dark': config.colorScheme === 'dark',
      'dark-theme': config.colorScheme === 'dark',
      'light-theme': config.colorScheme === 'light',
      'layout-overlay': config.menuMode === 'overlay',
      'layout-static': config.menuMode === 'static',
      // 直接使用 layoutService 中的 Signal
      'layout-static-inactive': this.layoutService.isStaticMenuDesktopInactive() && config.menuMode === 'static',
      'layout-overlay-active': this.layoutService.isOverlayMenuActive(),
      'layout-mobile-active': this.layoutService.isStaticMenuMobileActive(),
      'p-input-filled': config.inputStyle === 'filled',
      'p-ripple-disabled': !config.ripple,
      // 增加 profileSidebarVisible 的 class
      'layout-profile-sidebar-active': this.layoutService.isProfileSidebarVisible()
    };
  });
  onToggleTheme() {
    this.layoutService.toggleColorScheme();
  }
}
