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
  styleUrls: ['./app.menulist.component.scss']
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
    // 加入寫死的選單項目
    this.model = [
      {
        prog_no: '000',
        label: '首頁',
        items: [{ prog_no: '000000', label: '布告欄', parent_id: '000', routerLink: '/dashboard', icon: 'pi pi-bookmark', prog_ispage: 'Y' }],
      },
      {
        prog_no: '999',
        label: '測試',
        items: [{ prog_no: '999999', label: '範例', parent_id: '999', routerLink: '/demo/demoInputTable', icon: 'pi pi-bookmark', prog_ispage: 'Y' }],
        icon: 'pi pi-cog',
      }
    ];
    // 訂閱 AccessService 的 menuUpdated，當選單資料更新時重新建立選單
    this.menuUpdatedSubscription = this.authService.menuUpdated.subscribe((newData: FunsrightInfo[]) => {
      if (newData?.length > 0) {
        this.model = [...this.model, ...this.buildMenuModel(newData)];
      }
    });
    // 訂閱 currentPageProgNo 的變化
    this.currentPageProgNoSubscription = this.currentPageService.currentPageProgNo$.subscribe(progNo => {
      if (progNo) {
        this.setActiveItemByProgNo(progNo)
      } else {
        this.clearSelection();
      }
    });
  }

  ngOnDestroy(): void {
    this.currentPageProgNoSubscription?.unsubscribe();
    this.menuUpdatedSubscription?.unsubscribe();
  }

  // 建立選單模型 (遞迴方式)
  buildMenuModel(lists: FunsrightInfo[]): MenuItem[] {
    const menuLookup = new Map<string, MenuItem>();
    const menu: MenuItem[] = [];
    lists.forEach(({ prog_no, prog_name, prog_up, prog_ispage }) => {
      const menuItem: MenuItem = {
        prog_no: prog_no,
        label: prog_name,
        parent_id: prog_up,
        routerLink: '/' + prog_no,
        items: undefined,
        expanded: false,
        icon: prog_ispage === 'Y' ? 'pi pi-bookmark' : 'pi pi-home',
        hasChildrenOnly: false,
        prog_ispage: prog_ispage,
      };
      menuLookup.set(prog_no, menuItem); // 先將 menuItem 加入 lookup，方便後續父節點引用
      if (prog_up !== "") {
        const parentItem = menuLookup.get(prog_up as string);
        if (parentItem) {
          menuItem.routerLink = parentItem['routerLink'] + '/' + menuItem['prog_no'] // 路由依照複層的 prog_no 再加上自己的 prog_no
          parentItem.items = parentItem.items || [];
          parentItem.items.push(menuItem);
          if (parentItem.items) {
            parentItem['hasChildrenOnly'] = true;
          }
        }
      } else {
        menu.push(menuItem);
      }
    });
    return menu;
  }

  // 根據 ProgNo 設置激活的選單項目
  private setActiveItemByProgNo(progNo: string) {
    this.clearSelection(); // 清除之前的選中狀態
    const item = this.findItemRecursive(this.model, progNo);
    if (item) {
      item['selected'] = true;
      this.markParentsActiveRecursive(item);
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

  private markParentsActiveRecursive(item: MenuItem | null) {
    if (item && item['parent_id'] !== '') {
      const parent = this.findItemRecursive(this.model, item['parent_id']);
      if (parent) {
        parent['selected'] = true;
        parent.expanded = true;
        this.markParentsActiveRecursive(parent);
      }
    }
  }

  private findItemRecursive(items: MenuItem[], progNo: string): MenuItem | null {
    for (const item of items) {
      if (item['prog_no'] === progNo) {
        return item;
      }
      if (item.items) {
        const found = this.findItemRecursive(item.items, progNo);
        if (found) {
          return found;
        }
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
