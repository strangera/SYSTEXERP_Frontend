import {
  ElementRef,
  Input,
  Component,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
// 移除 Subscription, OnDestroy, OnInit
import { AppMenuItemComponent } from './app-menu-item/app-menu-item.component';
// 移除 UntilDestroy, untilDestroyed
import { FunsrightInfo } from '@shared/models/system/funsrightInfo';
import { SystemDataService } from '@service/system/system-data.service';
import { AppMenulistService } from './app.menulist.service';
import { CurrentPageService } from './current-page.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-menulist',
  templateUrl: './app.menulist.component.html',
  styleUrls: ['./app.menulist.component.scss'],
  standalone: true,
  imports: [AppMenuItemComponent] // 稍後將在 HTML 中使用 @for/@if，但這裡保留 NgFor/NgIf 以便相容
})
export class AppMenulistComponent { // 移除 implements OnInit, OnDestroy

  public el: ElementRef = inject(ElementRef);
  private readonly currentPageService = inject(CurrentPageService);
  private readonly appMenulistService = inject(AppMenulistService);
  private readonly systemDataService = inject(SystemDataService);

  @Input({ required: true }) set activeTopMenuProgNo(progNo: string | null) {
    this.activeTopMenu.set(progNo);
  }
  public readonly activeTopMenu = signal<string | null>(null);

  private readonly rawFunRights = toSignal(this.systemDataService.menuUpdated, { initialValue: [] as FunsrightInfo[] });
  private readonly currentPageProgNo = toSignal(this.currentPageService.currentPageProgNo$, { initialValue: null as string | null });

  private rawMenuModel = signal<MenuItem[]>([]);
  private initialRequested = false;

  constructor() {
    effect(() => {
      const newData = this.rawFunRights();
      if (newData?.length > 0) {
        // 重建選單並更新 Signal
        const newModel = this.appMenulistService.buildMenuModel(newData);
        this.rawMenuModel.set(newModel);
      } else if (newData.length === 0 && !this.initialRequested) {
        // 首次載入發起一次請求；無任何權限的帳號回來也是空陣列，不重複打否則會無限迴圈
        this.initialRequested = true;
        this.systemDataService.getFunRightsInfo().subscribe();
        this.systemDataService.queryAllSystemCode().subscribe();
      }
    }, { allowSignalWrites: true }); // 允許寫入 rawMenuModel

    effect(() => {
      const progNo = this.currentPageProgNo();
      const model = this.rawMenuModel(); // 確保 effect 在 model 變動時也執行

      if (progNo && model.length > 0) {
        this.setActiveItemByProgNo(progNo, model);
      } else {
        this.clearSelection(model);
      }
    });
  }

  public readonly filteredMenu = computed<MenuItem[]>(() => {
    const activeProgNo = this.activeTopMenu();
    const model = this.rawMenuModel();

    if (!activeProgNo) {
      return model;
    }
    // 根據頂部選單的 ProgNo 進行過濾
    return model.filter(item => item['prog_No'] === activeProgNo);
  });

  // -----------------------------------------------------------
  // 菜單操作邏輯 (已修改為接受 model 參數，並使用 requestAnimationFrame)
  // -----------------------------------------------------------

  // 根據 ProgNo 設置激活的選單項目
  private setActiveItemByProgNo(progNo: string, model: MenuItem[]) {
    this.clearSelection(model); // 清除之前的選中狀態
    const item = this.findItemRecursive(model, progNo);
    if (item) {
      item['selected'] = true;
      this.markParentsActiveRecursive(item, model);

      // 使用 requestAnimationFrame 替代 setTimeout (更平滑)
      requestAnimationFrame(() => {
        const selectedElement = this.el.nativeElement.querySelector('.menuitem-selected');
        if (selectedElement) {
          // 增加 100ms 延遲以確保 DOM 渲染完成
          setTimeout(() => {
            selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      });
    }
  }

  // 清除所有選單項的選中狀態
  private clearSelection(model: MenuItem[]) {
    const clearSelected = (items: MenuItem[]) => {
      items.forEach(item => {
        item['selected'] = false;
        item['expanded'] = false; // 確保在切換頁面時折疊
        if (item.items) {
          clearSelected(item.items);
        }
      });
    };
    if (model && model.length > 0) {
      clearSelected(model);
    }
  }

  private markParentsActiveRecursive(item: MenuItem | null, model: MenuItem[]) {
    if (item && item['parent_id'] !== '') {
      const parent = this.findItemRecursive(model, item['parent_id']);
      if (parent) {
        parent['selected'] = true;
        parent.expanded = true;
        this.markParentsActiveRecursive(parent, model);
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
}
