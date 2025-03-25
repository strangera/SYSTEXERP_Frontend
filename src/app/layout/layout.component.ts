import { Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
// Api
import { UserInfo } from '../models/system/userInfo';
import { AuthService } from '../service/system/auth.service';
// Component
import { AppMenulistComponent } from './app.menulist/app.menulist.component';
import { AppTopbarComponent } from './app.topbar/app.topbar.component';
// shared
import { ThemeService } from '../shared/service/theme.service';
import { LayoutService } from '../shared/service/layout.service';
// Tab Component
import { DashboardComponent } from '../pages/dashboard/dashboard.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit, OnDestroy {
  tabs: any[] = [];
  activeIndex: number = 2;
  overlayMenuOpenSubscription?: Subscription;
  menuOutsideClickListener: any;
  profileMenuOutsideClickListener: any;
  @ViewChild(AppMenulistComponent) appSidebar!: AppMenulistComponent;
  @ViewChild(AppTopbarComponent) appTopbar!: AppTopbarComponent;
  darkmode: boolean = false;
  user?: UserInfo | null;

  constructor(
    private themeService: ThemeService,
    private router: Router,
    private layoutService: LayoutService,
    private authService: AuthService,
    public renderer: Renderer2,
  ) {
    this.authService.user.subscribe(x => this.user = x);
  }

  ngOnInit() {
    // Theme
    this.darkmode = localStorage.getItem('darkmode') == 'true';
    if (this.darkmode) {
      this.themeService.switchTheme('bootstrap4-dark-blue');
    }

    this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
      if (!this.menuOutsideClickListener) {
        this.menuOutsideClickListener = this.renderer.listen('document', 'click', event => {
          const isOutsideClicked = !(this.appSidebar.el.nativeElement.isSameNode(event.target) || this.appSidebar.el.nativeElement.contains(event.target)
            || this.appTopbar.menuButton.nativeElement.isSameNode(event.target) || this.appTopbar.menuButton.nativeElement.contains(event.target));

          if (isOutsideClicked) {
            this.hideMenu();
          }
        });
      }

      if (!this.profileMenuOutsideClickListener) {
        this.profileMenuOutsideClickListener = this.renderer.listen('document', 'click', event => {
          const isOutsideClicked = !(this.appTopbar.menu.nativeElement.isSameNode(event.target) || this.appTopbar.menu.nativeElement.contains(event.target)
            || this.appTopbar.topbarMenuButton.nativeElement.isSameNode(event.target) || this.appTopbar.topbarMenuButton.nativeElement.contains(event.target));

          if (isOutsideClicked) {
            this.hideProfileMenu();
          }
        });
      }

      if (this.layoutService.state.staticMenuMobileActive) {
        this.blockBodyScroll();
      }
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.hideMenu();
        this.hideProfileMenu();
      });
  }

  ngOnDestroy() {
    if (this.overlayMenuOpenSubscription) {
      this.overlayMenuOpenSubscription.unsubscribe();
    }

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }

  hideMenu() {
    this.layoutService.state.overlayMenuActive = false;
    this.layoutService.state.staticMenuMobileActive = false;
    this.layoutService.state.menuHoverActive = false;
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
    this.unblockBodyScroll();
  }

  hideProfileMenu() {
    this.layoutService.state.profileSidebarVisible = false;
    if (this.profileMenuOutsideClickListener) {
      this.profileMenuOutsideClickListener();
      this.profileMenuOutsideClickListener = null;
    }
  }

  blockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.add('blocked-scroll');
    }
    else {
      document.body.className += ' blocked-scroll';
    }
  }

  unblockBodyScroll(): void {
    if (document.body.classList) {
      document.body.classList.remove('blocked-scroll');
    }
    else {
      document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
        'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }

  get containerClass() {
    return {
        'layout-theme-light': this.layoutService.config().colorScheme === 'light',
        'layout-theme-dark': this.layoutService.config().colorScheme === 'dark',
        'layout-overlay': this.layoutService.config().menuMode === 'overlay',
        'layout-static': this.layoutService.config().menuMode === 'static',
        'layout-static-inactive': this.layoutService.state.staticMenuDesktopInactive && this.layoutService.config().menuMode === 'static',
        'layout-overlay-active': this.layoutService.state.overlayMenuActive,
        'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
        'p-input-filled': this.layoutService.config().inputStyle === 'filled',
        'p-ripple-disabled': !this.layoutService.config().ripple
    }
  }

  // Tab
  // ----------------------------------------------------------------
  onAddTab(item: any) {
    let componentMap: any = {
      '000000':	'首頁',
      '000001':	DashboardComponent,
    };

    const component = componentMap[item.prog_no];
    const title = item.label;

    if (component) {
      this.tabs.push({ title, component });

      // TabView "activeIndex" not working for dynamically created tabs
      // https://github.com/primefaces/primeng/issues/5754
      // 使用 setTimeout 進行延遲更新
      setTimeout(() => {
        this.activeIndex = this.tabs.length - 1; // Set the active index to the latest tab
        //this.cdr.detectChanges(); // 检测更改
      }, 10);
    }
  }

  onTabClose(event: any, index: number) {
    console.log(index);
    this.tabs.splice(index, 1); // 从数组中移除被关闭的标签
    if (this.activeIndex >= this.tabs.length) {
      this.activeIndex = this.tabs.length - 1; // 更新活动标签索引
      console.log(this.activeIndex);
    }
  }
}
