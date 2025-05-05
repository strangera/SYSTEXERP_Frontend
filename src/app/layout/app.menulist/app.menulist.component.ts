import { AppMenulistService } from './app.menulist.service';
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
    private authService: AuthService,
    private appMenulistService: AppMenulistService
  ) { }

  ngOnInit(): void {
    // 訂閱 AccessService 的 menuUpdated，當選單資料更新時重新建立選單
    this.menuUpdatedSubscription = this.authService.menuUpdated.subscribe((newData: FunsrightInfo[]) => {
      if (newData?.length > 0) {
        this.model = this.appMenulistService.buildMenuModel(newData);
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
      console.log(parent);
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
