import { animate, state, style, transition, trigger } from '@angular/animations';
import { ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { combineLatest, filter, Subscription } from 'rxjs';
import { AccessService } from '../../shared/service/access.service';
import { CurrentPageService } from './current-page.service';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { AuthService } from '../../service/system/auth.service';

@Component({
  selector: 'app-menulist',
  templateUrl: './app.menulist.component.html',
  styleUrls: ['./app.menulist.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('children', [
      state('collapsed', style({ height: '0' })),
      state('expanded', style({ height: '*' })),
      transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class AppMenulistComponent implements OnInit, OnDestroy, OnChanges {
  @Output() menuaddTab = new EventEmitter<any>();   // 新增選單
  @Input() activeTopMenuProgNo: string | null = null; // 新增：接收來自頂部菜單的激活 prog_no
  model: MenuItem[] = [];                     // 選單模型
  flatMenuList: MenuItem[] = [];               // 扁平化選單
  activeItem: MenuItem | null = null;           // 用於追蹤當前激活的選單項目
  private routerLinkMap = new Map<string, MenuItem>(); // 用於快速查找選單項目
  filteredModel: MenuItem[] = []; // 新增：用於顯示過濾後的菜單
  private currentPageProgNoSubscription: Subscription | undefined;
  private subscriptions = new Subscription(); // 用於管理訂閱

  constructor(
    public el: ElementRef,
    private accessService: AccessService,
    private currentPageService: CurrentPageService, // 注入 Service
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      combineLatest([
        this.authService.funRightsInfo$.pipe(filter(data => !!data)), // 確保 funRightsInfo 有值
        this.currentPageService.currentPageProgNo$ // 監聽當前頁面 ProgNo 的變化
      ]).subscribe(([funRightsInfo, currentPageProgNo]) => {
        this.model = this.buildMenuModel(funRightsInfo);
        this.flatMenuList = this.flattenMenu(this.model);
        this.filterMenuByTopMenu();
        if (currentPageProgNo) {
          this.setActiveItemByProgNo(currentPageProgNo);
        } else {
          this.clearSelection();
        }
      })
    );

    this.accessService.menuUpdated.subscribe(newData => {
      this.model = this.buildMenuModel(newData);
      this.flatMenuList = this.flattenMenu(this.model);
      this.filterMenuByTopMenu(); // 數據更新後重新過濾
      // 重新設置激活項，如果當前有 ProgNo
      if (this.currentPageService.currentPageProgNoSubject.value) {
        this.setActiveItemByProgNo(this.currentPageService.currentPageProgNoSubject.value);
      }
    });
    // 訂閱 currentPageProgNo 的變化
    this.currentPageProgNoSubscription = this.currentPageService.currentPageProgNo$.subscribe(progNo => {
      if (progNo) {
        this.setActiveItemByProgNo(progNo);
      } else {
        this.clearSelection(); // 如果 ProgNo 為 null，清除選中狀態
      }
    });
  }

  ngOnDestroy(): void {
    if (this.currentPageProgNoSubscription) {
      this.currentPageProgNoSubscription.unsubscribe();
    }
    this.subscriptions.unsubscribe(); // 取消 combineLatest 的訂閱
  }

  ngOnChanges(): void {
    this.filterMenuByTopMenu(); // 當 activeTopMenuProgNo 改變時重新過濾
  }
  // 更新選單模型
  updateMenuModel(funRightsInfo: FunsrightInfo[]) {
    if (!Array.isArray(funRightsInfo) || funRightsInfo.length === 0) {
      this.clearMenu();
      return;
    }
    this.model = this.buildMenuModel(funRightsInfo);
    this.flatMenuList = this.flattenMenu(this.model);
  }
  private clearMenu() {
    this.model = this.flatMenuList = [];
    this.activeItem = null;
  }
  // 建立選單模型
  buildMenuModel(lists: FunsrightInfo[]): MenuItem[] {
    const menuLookup = new Map<string, MenuItem>();
    const menu: MenuItem[] = [];

    lists.forEach(({ prog_name: label, prog_no: id, path, parent_id: parentId }) => {
      const menuItem: MenuItem = {
        label: label,
        routerLink: path ? [path] : undefined,
        items: undefined,
        prog_no: id,
        parent_id: parentId,
        expanded: false,
        icon: undefined,
        hasChildrenOnly: false
      };

      menuLookup.set(id as string, menuItem); // 先將 menuItem 加入 lookup，方便後續父節點引用

      if (parentId !== '0') {
        const parentItem = menuLookup.get(parentId as string);
        if (parentItem) {
          parentItem.items = parentItem.items || [];
          parentItem.items.push(menuItem);
          if (parentItem.items && !parentItem.routerLink) {
            parentItem['hasChildrenOnly'] = true;
            parentItem.icon = 'pi pi-home'; // 父節點有子項目，使用房子圖案
          }
        }
      } else {
        menu.push(menuItem);
      }
    });

    // 第二次遍歷 menuLookup 來設定沒有子選單的項目的 icon
    menuLookup.forEach(item => {
      if (!item.items) {
        item.icon = 'pi pi-bookmark'; // 沒有子選單的項目使用書籤圖案
      }
    });

    return menu;
  }

  // 根據 ProgNo 設置激活的選單項目
  private setActiveItemByProgNo(progNo: string) {
    this.clearSelection(); // 清除之前的選中狀態
    const item = this.findItemByProgNo(this.model, progNo);
    if (item) {
      item['selected'] = true;
      this.activeItem = item;
      this.markParentsActive(item);
    }
  }

  // 清除所有選單項的選中狀態
  private clearSelection() {
    const clearSelected = (items: MenuItem[]) => {
      items.forEach(item => {
        item['selected'] = false;
        if (item.items) {
          clearSelected(item.items);
        }
      });
    };
    if (this.model && this.model.length > 0) {
      clearSelected(this.model);
    }
    this.activeItem = null;
  }

  private markParentsActive(item: MenuItem | null) {
    if (item && item['parent_id'] !== '0') {
      const parent = this.findItemByProgNo(this.model, item['parent_id']);
      if (parent) {
        parent['selected'] = true;
        parent.expanded = true;
        this.markParentsActive(parent);
      }
    }
  }

  private findItemByProgNo(items: MenuItem[], progNo: string): MenuItem | null {
    for (const item of items) {
      if (item['prog_no'] === progNo) {
        return item;
      }
      if (item.items) {
        const found = this.findItemByProgNo(item.items, progNo);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  // 查找激活的選單項目 (這個方法現在主要用於建立 routerLinkMap)
  private flattenMenu(items: MenuItem[], flatList: MenuItem[] = []): MenuItem[] {
    items.forEach(item => {
      flatList.push(item);
      if (item.routerLink && item.routerLink[0]) {
        this.routerLinkMap.set(item.routerLink[0], item); // 儲存 routerLink 和選單項目的對應關係
      }
      if (item.items) { this.flattenMenu(item.items, flatList); }
    });
    return flatList;
  }
  toggleActive(item: MenuItem) {
    if (item.items) {
      item.expanded = !item.expanded;
    }
  }

  // 根據頂部菜單的 prog_no 過濾顯示的菜單項
  private filterMenuByTopMenu() {
    if (this.activeTopMenuProgNo) {
      this.filteredModel = this.model.filter(item => item['prog_no'] === this.activeTopMenuProgNo);
    } else {
      this.filteredModel = this.model;
    }
  }
}
