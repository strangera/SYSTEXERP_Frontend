import { Injectable, signal, WritableSignal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface AppTab {
  id: number; // 用於唯一識別，例如時間戳或唯一計數器
  header: string; // 標籤標題
  path: string; // 路由路徑
  queryParams?: any; // 路由參數
  componentRef?: any; // 如果需要，可以儲存組件實例的引用
}

@Injectable({
  providedIn: 'root'
})
export class TabService {
  // 開啟的分頁列表，使用 Signal 儲存
  openTabs: WritableSignal<AppTab[]> = signal([]);
  // 當前活躍分頁的索引
  activeIndex: WritableSignal<number> = signal(0);

  // 用於生成唯一 ID
  private tabIdCounter = 0;

  constructor(private router: Router) {
    // 監聽路由變化，自動將新的路由加入分頁
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navEvent = event as NavigationEnd;
      // 排除根路由 /
      if (navEvent.urlAfterRedirects === '/') return;

      // 檢查此路由是否已存在
      const existingTabIndex = this.openTabs().findIndex(tab => tab.path === navEvent.urlAfterRedirects);

      if (existingTabIndex !== -1) {
        // 如果已存在，則切換到該分頁
        this.activeIndex.set(existingTabIndex);
      } else {
        // 如果是新路由，則新增一個分頁
        this.addTab(navEvent.urlAfterRedirects);
      }
    });
  }

  // 新增分頁
  addTab(path: string, header?: string, queryParams?: any) {
    // 簡單地從路徑創建標題
    const defaultHeader = header || this.getPathSegment(path);

    const newTab: AppTab = {
      id: ++this.tabIdCounter,
      header: defaultHeader,
      path: path,
      queryParams: queryParams
    };

    this.openTabs.update(tabs => [...tabs, newTab]);

    // 將活躍索引設置為新分頁
    this.activeIndex.set(this.openTabs().length - 1);

    // 如果是外部呼叫 addTab，確保路由正確切換
    if (this.router.url !== path) {
      this.router.navigateByUrl(path);
    }
  }

  // 關閉分頁
  closeTab(index: number) {
    const closedTab = this.openTabs()[index];

    this.openTabs.update(tabs => tabs.filter((_, i) => i !== index));

    // 如果關閉的是活躍分頁
    if (index === this.activeIndex()) {
      // 嘗試切換到前一個或後一個分頁
      const newActiveIndex = Math.min(index, this.openTabs().length - 1);
      this.activeIndex.set(Math.max(0, newActiveIndex));

      // 導航到新的活躍分頁的路由
      const newActiveTab = this.openTabs()[this.activeIndex()];
      if (newActiveTab) {
        this.router.navigateByUrl(newActiveTab.path);
      } else {
        // 如果沒有分頁了，導航回首頁或空白頁
        this.router.navigate(['/']);
      }
    } else if (index < this.activeIndex()) {
      // 如果關閉的分頁在活躍分頁之前，活躍索引需要減一
      this.activeIndex.update(val => val - 1);
    }
  }

  // 切換分頁時觸發路由導航
  onTabChange(index: number) {
    this.activeIndex.set(index);
    const targetTab = this.openTabs()[index];
    if (targetTab && this.router.url !== targetTab.path) {
      this.router.navigateByUrl(targetTab.path);
    }
  }

  // 輔助函數：從路徑中獲取一個分段作為標題
  private getPathSegment(url: string): string {
    const parts = url.split('/');
    let lastSegment = parts.pop() || '';

    // 移除查詢參數
    if (lastSegment.includes('?')) {
      lastSegment = lastSegment.split('?')[0];
    }

    // 如果路徑以數字或空字串結尾，嘗試取前一個
    if (!lastSegment || !isNaN(Number(lastSegment))) {
      lastSegment = parts.pop() || '新分頁';
    }

    // 簡單的格式化，例如 user-management -> User Management
    return lastSegment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}
