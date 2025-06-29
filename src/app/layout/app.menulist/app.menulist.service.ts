import { Injectable } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { FunsrightInfo } from '../../shared/models/system/funsrightInfo';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppMenulistService {
  private menuUpdatedSource = new BehaviorSubject<MenuItem[]>([]); // 使用 BehaviorSubject 儲存最新的選單資料，初始值為空陣列
  menuUpdated = this.menuUpdatedSource.asObservable(); // 將 BehaviorSubject 轉換為 Observable，供外部訂閱

  private fixedMenuItems: MenuItem[] = [
    {
      prog_No: '000',
      label: '首頁',
      items: [
        {
          prog_No: 'dashboard',
          label: '佈告欄',
          parent_id: '000',
          routerLink: '/account/dashboard',
          expanded: false,
          icon: 'pi pi-bookmark',
          hasChildrenOnly: false,
          prog_ispage: 'Y',
          prog_sort: '1',
          selected: false,
          isSubModule: false
        }
      ],
      prog_sort: 0 // 給寫死的首頁一個排序值
    },
    {
      prog_No: '999',
      label: '測試',
      items: [
        {
          prog_No: '900001',
          label: '範例',
          parent_id: '999',
          routerLink: '/account/demo/demoInputTable',
          expanded: false,
          icon: 'pi pi-bookmark',
          hasChildrenOnly: false,
          prog_ispage: 'Y',
          prog_sort: '1',
          selected: false,
          isSubModule: false
        }],
      icon: 'pi pi-cog',
      prog_sort: 999 // 給寫死的測試一個排序值
    }
  ];

  // 建立選單模型 (遞迴方式)
  buildMenuModel(lists: FunsrightInfo[]): MenuItem[] {
    const menuLookup = new Map<string, MenuItem>();
    const dynamicMenu: MenuItem[] = [];
    // 先處理所有節點，建立基本的 MenuItem 物件並放入 menuLookup
    lists.forEach(({ prog_id, prog_No, prog_name, prog_up, prog_ispage, prog_sort, sub_module_no }) => {
      const menuItem: MenuItem = {
        prog_No: prog_No,
        label: prog_name,
        parent_id: prog_up,
        routerLink: prog_ispage === 'Y' ? `/account/${prog_No.slice(0, 3)}/${prog_No}` : undefined,
        items: undefined,
        expanded: false,
        icon: prog_ispage === 'Y' ? 'pi pi-bookmark' : sub_module_no === "" ? "pi pi-home" : 'pi pi-box',
        hasChildrenOnly: false,
        prog_ispage: prog_ispage,
        prog_sort: prog_sort || 0, // 確保 prog_sort 有預設值，方便排序
        selected: false,
        isSubModule: sub_module_no === "" && prog_up !== "", // 判斷是否為第一個子模組
        prog_id: prog_id
      };
      menuLookup.set(prog_No, menuItem);
    });
    // 建立選單的層級結構
    lists.forEach(({ prog_No, prog_up }) => {
      const menuItem = menuLookup.get(prog_No);
      if (menuItem) {
        if (prog_up !== "") {
          const parentItem = menuLookup.get(prog_up as string);
          if (parentItem) {
            parentItem.items = parentItem.items || [];
            parentItem.items.push(menuItem);
            if (parentItem.items) {
              parentItem['hasChildrenOnly'] = true;
            }
          }
        } else {
          dynamicMenu.push(menuItem);
        }
      }
    });
    // 對第一層選單和每個子層選單進行排序
    const sortMenuItems = (items: MenuItem[] | undefined) => {
      if (items) {
        items.sort((a, b) => a['prog_sort'] - b['prog_sort']);
        items.forEach(item => sortMenuItems(item.items)); // 遞迴排序子項目
      }
    };
    sortMenuItems(dynamicMenu); // 排序第一層選單及其子項目
    const combinedMenu = [...this.fixedMenuItems, ...dynamicMenu];
    this.menuUpdatedSource.next(combinedMenu);
    return combinedMenu;
  }
}
