import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, Type, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
// Api
import { UserInfo } from '../models/system/userInfo';
import { AuthService } from '../service/system/auth.service';
// Component
import { AppMenulistComponent } from './app.menulist/app.menulist.component';
import { AppTopbarComponent } from './app.topbar/app.topbar.component';
// shared
import { LayoutService } from '../shared/service/layout.service';
// Tab Component
import { FormBuilder, FormGroup } from '@angular/forms';
import { FunsrightInfo } from '../models/system/funsrightInfo';

interface TabItem {
  title: string;
  component: Type<any> | string;
}

interface AddTabItem {
  prog_no: string;
  label: string;
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements AfterViewInit, OnDestroy {
  @ViewChild(AppMenulistComponent) appSidebar!: AppMenulistComponent;
  selectedTopMenuProgNo: string | null = null;
  @ViewChild(AppTopbarComponent) appTopbar!: AppTopbarComponent;
  @ViewChild('layoutMainContainer', { static: false }) layoutMainContainer!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;
  tabs: TabItem[] = [];
  activeIndex = 2;
  menuOutsideClickListener: (() => void) | null = null;
  user: UserInfo | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private layoutService: LayoutService,
    private authService: AuthService,
    public renderer: Renderer2,
    private formBuilder: FormBuilder
  ) {
    this.subscriptions.push(this.authService.user.subscribe(x => this.user = x));
  }

  ngAfterViewInit() {
    this.subscribeToRouterEvents();
    this.waitForElementsToInitialize();
    this.adjustMainContainerPadding();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.clearMenuOutsideClickListener();
  }
  private waitForElementsToInitialize() {
    const checkTimeout = 5000; // 超時時間，5秒
    const startTime = Date.now();

    const checkElements = () => {
      const sidebarElement = this.appSidebar?.el?.nativeElement;
      const menuButtonElement = this.appTopbar?.menuButton?.nativeElement;
      const searchInputElement = this.searchInput?.nativeElement;

      if (sidebarElement && menuButtonElement && searchInputElement && this.appTopbar.appTopbarDiv && this.layoutMainContainer) { // 確保 appTopbarDiv 和 layoutMainContainer 也存在
        this.initializeMenuListeners();
        this.adjustMainContainerPadding(); // 確保在初始載入後也調整一次
      } else if (Date.now() - startTime < checkTimeout) {
        requestAnimationFrame(checkElements);
      } else {
        console.error('Failed to initialize elements within timeout.');
      }
    };

    requestAnimationFrame(checkElements);
  }

  private initializeMenuListeners() {
    const sidebarElement = this.appSidebar?.el?.nativeElement;
    const menuButtonElement = this.appTopbar?.menuButton?.nativeElement;
    const searchInputElement = this.searchInput?.nativeElement;

    if (!sidebarElement || !menuButtonElement || !searchInputElement) {
      console.error('One or more menu related elements are not initialized');
      return;
    }

    this.clearMenuOutsideClickListener();

    this.menuOutsideClickListener = this.createOutsideClickListener(
      [sidebarElement, menuButtonElement, searchInputElement],
      this.hideMenu.bind(this)
    );

    if (this.layoutService.state.staticMenuMobileActive) {
      this.toggleBodyScroll(false);
    }
  }

  private createOutsideClickListener(elements: HTMLElement[], callback: () => void): () => void {
    return this.renderer.listen('document', 'click', event => {
      const isOutsideClicked = elements.every(
        element => !element.contains(event.target as HTMLElement)
      );

      if (isOutsideClicked) {
        callback();
      }
    });
  }

  private subscribeToRouterEvents() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.hideMenu();
    });
  }

  private hideMenu() {
    this.layoutService.state.overlayMenuActive = false;
    this.layoutService.state.staticMenuMobileActive = false;
    this.layoutService.state.menuHoverActive = false;
    this.clearMenuOutsideClickListener();
    this.toggleBodyScroll(true);
  }

  private clearMenuOutsideClickListener() {
    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
      this.menuOutsideClickListener = null;
    }
  }

  private toggleBodyScroll(enable: boolean): void {
    document.body.classList.toggle('blocked-scroll', !enable);
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.adjustMainContainerPadding();
  }

  adjustMainContainerPadding(): void {
    if (this.appTopbar.appTopbarDiv && this.layoutMainContainer) {
      this.renderer.setStyle(this.layoutMainContainer.nativeElement, 'paddingTop', `${this.appTopbar.appTopbarDiv.nativeElement.offsetHeight}px`);
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

  private delayAction(callback: () => void, delay = 10): void {
    setTimeout(callback, delay);
  }

  onAddTab(item: AddTabItem) {
    const existingTabIndex = this.tabs.findIndex(tab => tab.component === item.prog_no);
    if (existingTabIndex !== -1) {
      this.delayAction(() => (this.activeIndex = existingTabIndex));
      return;
    }

    const component = item.prog_no;
    if (component) {
      this.tabs.push({ title: item.label, component });
      this.delayAction(() => (this.activeIndex = this.tabs.length - 1));
    }
  }

  onTabClose(index: number) {
    this.tabs.splice(index, 1);
    if (this.activeIndex >= this.tabs.length) {
      this.activeIndex = this.tabs.length - 1;
    }
  }

  queryForm = this.formBuilder.nonNullable.group({
    query_data: ['']
  });

  onSubmit(frm: FormGroup) {
    const funRightsInfo = sessionStorage.getItem("FunRightsInfo");
    if (!funRightsInfo || !frm.controls["query_data"].value) {
      console.log("Please enter a search query.");
      return;
    }

    let menuData: FunsrightInfo[];
    try {
      menuData = JSON.parse(funRightsInfo);
    } catch (error) {
      console.error("Failed to parse menu data. Please refresh the page.", error);
      return;
    }

    const query = frm.controls["query_data"].value.toLowerCase();

    const findItems = menuData.filter(item =>
      item.prog_name?.toLowerCase().includes(query) ||
      item.prog_no?.toLowerCase() === query
    );
    console.log("Found items:", findItems);

    const matchedItem = findItems.find(item => item.path !== '');
    if (matchedItem) {
      this.router.navigate([matchedItem.path]);
      this.queryForm.reset();
    } else {
      console.log("No matching item found.");
    }
  }

  onMaskClick() {
    this.hideMenu();
  }
}
