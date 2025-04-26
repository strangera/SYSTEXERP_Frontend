import { animate, state, style, transition, trigger } from '@angular/animations';
import { ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { CurrentPageService } from './current-page.service';
import { FunsrightInfo } from '../../shared/models/system/funsrightInfo';
import { AuthService } from '../../service/system/auth.service';

@Component({
  selector: 'app-menulist',
  templateUrl: './app.menulist.component.html',
  styleUrls: ['./app.menulist.component.scss'],
  animations: [
    trigger('children', [
      state('collapsed', style({ height: '0' })),
      state('expanded', style({ height: '*' })),
      transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class AppMenulistComponent implements OnInit, OnDestroy {
  @Input() activeTopMenuProgNo: string | null = null; // 新增：接收來自頂部菜單的激活 prog_no
  model: MenuItem[] = [];                     // 選單模型
  private menuUpdatedSubscription: Subscription | undefined;
  private currentPageProgNoSubscription: Subscription | undefined;

  constructor(
    public el: ElementRef,
    private currentPageService: CurrentPageService, // 注入 Service
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // 訂閱 AccessService 的 menuUpdated，當選單資料更新時重新建立選單
    this.menuUpdatedSubscription = this.authService.menuUpdated.subscribe((newData: FunsrightInfo[]) => {
      if (newData?.length > 0) { this.model = this.buildMenuModel(newData); }
    });
    // 訂閱 currentPageProgNo 的變化
    this.currentPageProgNoSubscription = this.currentPageService.currentPageProgNo$.subscribe(progNo => {
      progNo ? this.setActiveItemByProgNo(progNo) : this.clearSelection();
    });
  }

  ngOnDestroy(): void {
    this.currentPageProgNoSubscription?.unsubscribe();
    this.menuUpdatedSubscription?.unsubscribe();
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
      if (item['prog_no'] === progNo) { return item; }
      if (item.items) {
        const found = this.findItemByProgNo(item.items, progNo);
        if (found) { return found; }
      }
    }
    return null;
  }
  toggleActive(item: MenuItem) {
    if (item.items) { item.expanded = !item.expanded; }
  }

  get filteredMenu(): MenuItem[] {
    return this.activeTopMenuProgNo ? this.model.filter(item => item['prog_no'] === this.activeTopMenuProgNo) : this.model;
  }
}
