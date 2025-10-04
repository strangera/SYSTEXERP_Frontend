import { AppMenulistService } from './app.menulist.service';
import { ElementRef, Input, OnDestroy, OnInit, Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { CurrentPageService } from './current-page.service';
import { NgFor, NgIf } from '@angular/common';
import { AppMenuItemComponent } from './app-menu-item/app-menu-item.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from '@service/system/auth.service';
import { FunsrightInfo } from '@shared/models/system/funsrightInfo';

@UntilDestroy()
@Component({
  selector: 'app-menulist',
  templateUrl: './app.menulist.component.html',
  styleUrls: ['./app.menulist.component.scss'],
  standalone: true,
  imports: [NgFor, NgIf, AppMenuItemComponent]
})
export class AppMenulistComponent implements OnInit, OnDestroy {
  @Input() activeTopMenuProgNo: string | null = null; // 新增：接收來自頂部菜單的激活 prog_no
  model: MenuItem[] = [];                     // 選單模型
  private menuUpdatedSubscription: Subscription | undefined;
  private currentPageProgNoSubscription: Subscription | undefined;

  constructor(
    public el: ElementRef,
    private readonly currentPageService: CurrentPageService, // 注入 Service
    private readonly authService: AuthService,
    private readonly appMenulistService: AppMenulistService,
  ) { }

  ngOnInit(): void {
    // 訂閱 AccessService 的 menuUpdated，當選單資料更新時重新建立選單
    this.menuUpdatedSubscription = this.authService.menuUpdated.subscribe((newData: FunsrightInfo[]) => {
      if (newData?.length > 0) {
        this.model = this.appMenulistService.buildMenuModel(newData);
      } else {
        this.authService.getFunRightsInfo().pipe(untilDestroyed(this)).subscribe();
        this.authService.queryAllSystemCode().pipe(untilDestroyed(this)).subscribe();
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
      setTimeout(() => {
        const selectedElement = this.el.nativeElement.querySelector('.menuitem-selected');
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 101);
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
      if (item['prog_No'] === progNo) {
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
    return this.activeTopMenuProgNo ? this.model.filter(item => item['prog_No'] === this.activeTopMenuProgNo) : this.model;
  }
}
