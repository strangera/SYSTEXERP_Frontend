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
      if (newData?.length > 0) {
        this.model = this.buildMenuModel(newData);
        console.log(this.model);

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
    const firstLevelMenu: MenuItem[] = [];
    const menuLookup = new Map<string, MenuItem>();
    lists.filter(item => item.prog_up === '').sort((a, b) => (a.prog_sort || 0) - (b.prog_sort || 0))
      .forEach(({ prog_name, prog_no, prog_ispage }) => {
        const menuItem: MenuItem = {
          label: prog_name,
          routerLink: `/${prog_no}`, // 第一層的 routerLink 直接給 /prog_no
          items: [],
          expanded: false,
          icon: prog_ispage === 'Y' ? 'pi pi-file' : 'pi pi-folder',
          hasChildrenOnly: false,
          prog_no: prog_no,
          selected: false
        };
        firstLevelMenu.push(menuItem);
        menuLookup.set(prog_no, menuItem);
      });
    // 建立第二層選單
    lists.filter(item => item.prog_up !== '' && item.sub_module_no === '').sort((a, b) => (a.prog_sort || 0) - (b.prog_sort || 0))
      .forEach(({ prog_name, prog_no, prog_up, prog_ispage }) => {
        const parentMenuItem = menuLookup.get(prog_up);
        if (parentMenuItem) {
          const menuItem: MenuItem = {
            label: prog_name,
            routerLink: `${parentMenuItem.routerLink}/${prog_no}`, // 使用父層的 routerLink
            items: [],
            expanded: false,
            icon: prog_ispage === 'Y' ? 'pi pi-file' : 'pi pi-folder',
            hasChildrenOnly: false,
            prog_no: prog_no,
            selected: false
          };
          parentMenuItem.items?.push(menuItem);
          parentMenuItem.icon = 'pi pi-folder'; // 父節點有子項目，確保是資料夾圖案
          parentMenuItem['hasChildrenOnly'] = true; // 標記為只有子節點
        }
      });
    // 處理更深層次的關聯
    const buildDeepLevel = (node: MenuItem, remainingLists: FunsrightInfo[]) => {
      remainingLists
        .filter(item => item.sub_module_no === node['prog_no'])
        .sort((a, b) => (a.prog_sort || 0) - (b.prog_sort || 0))
        .forEach(({ prog_name, prog_no, prog_ispage }) => {
          const newMenuItem: MenuItem = {
            label: prog_name,
            routerLink: node.routerLink ? `${node.routerLink}/${prog_no}` : undefined,
            items: [],
            expanded: false,
            icon: prog_ispage === 'Y' ? 'pi pi-file' : 'pi pi-folder',
            hasChildrenOnly: false,
            prog_no: prog_no,
            selected: false
          };
          if (!node.items) {
            node.items = [];
            node.icon = 'pi pi-folder';
            node['hasChildrenOnly'] = true;
          }
          node.items.push(newMenuItem);
          menuLookup.set(prog_no, newMenuItem); // 將新節點加入 menuLookup
          // 遞迴處理更深層次的子節點
          const nextRemainingLists = remainingLists.filter(item => item.sub_module_no !== node['prog_no']);
          buildDeepLevel(newMenuItem, nextRemainingLists);
        });
      if (node.items && node.items.length === 0) {
        node.items = undefined;
        node.icon = node.routerLink ? 'pi pi-file' : 'pi pi-folder';
        node['hasChildrenOnly'] = false;
      }
    };

    // 對第一層和第二層的每個節點執行深度查找
    firstLevelMenu.forEach(item => {
      const remainingLists = lists.filter(listItem => listItem.prog_up !== '' && listItem.sub_module_no !== '');
      buildDeepLevel(item, remainingLists);
    });
    firstLevelMenu.forEach(item => {
      if (item.items) {
        item.items.forEach(secondLevelItem => {
          const remainingLists = lists.filter(listItem => listItem.prog_up !== '' && listItem.sub_module_no !== '');
          buildDeepLevel(secondLevelItem, remainingLists);
        });
      }
    });

    console.log('包含更深層次關聯的選單模型 (Log):', JSON.stringify(firstLevelMenu, null, 2));
    return firstLevelMenu;
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
