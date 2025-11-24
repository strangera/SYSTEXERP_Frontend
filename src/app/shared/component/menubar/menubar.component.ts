import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { tap } from 'rxjs';
import { FavoriteStoreService } from 'src/app/core/layout/app.topbar/favorite-store.service';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { NotificationService } from '../notification-message/notification.service';
import { SystemDataService } from './../../../service/system/system-data.service';

// 移除不再需要的 Favorite 介面定義

@UntilDestroy()
@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BreadcrumbModule,
    PrimeTemplate,
    RouterLink,
    NgIf,
    NgClass
  ],
})
export class MenubarComponent implements OnInit {
  @Input() ProgNo = '';
  @Input() customBreadcrumbItems: MenuItem[] = [];
  home = { icon: 'pi pi-home', routerLink: '/account/dashboard' };
  breadcrumbItems: MenuItem[] = [];
  menu: string[] = [];

  // 使用者選單
  funRightsInfo: FunsrightInfo[] = []; // 功能權限資訊

  // ** 服務注入 (使用 inject() 保持風格一致) **
  private readonly messageService = inject(NotificationService);
  private readonly systemDataService = inject(SystemDataService);
  private readonly favoriteStore = inject(FavoriteStoreService); // 新增我的最愛 Store Service

  // ** 核心狀態: 我的最愛狀態 (Computed Signal) **
  // 依賴於 FavoriteStoreService 中的 favorites() signal
  public readonly isFavorite = computed(() => {
    // 讀取 Store 中的最愛列表
    const favorites = this.favoriteStore.favorites();
    // 判斷當前頁面 (ProgNo) 是否在列表中
    return favorites.some(fav => fav.prog_No === this.ProgNo);
  });

  noProgNo = false;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (this.customBreadcrumbItems.length > 0) { return; }
    this.breadcrumbItems = [];
    // 訂閱菜單更新，建立麵包屑
    this.systemDataService.menuUpdated.pipe(untilDestroyed(this)).subscribe((newData: FunsrightInfo[]) => {

      this.funRightsInfo = [...newData];
      this.menu = [];
      this.breadcrumbItems = [];
      this.getMenuName(this.funRightsInfo, this.ProgNo);

      // 構建麵包屑項目
      for (let i = this.menu.length - 1; i >= 0; i--) {
        if (this.menu[i]) {
          this.breadcrumbItems.push({
            label: this.menu[i],
            // 只有最後一個項目可以執行 'toggleFavorite'
            command: i === 0 ? () => this.toggleFavorite() : undefined,
            isLast: i === 0 // 標記是否為最後一個
          });
          this.breadcrumbItems = [...this.breadcrumbItems];
          this.cdr.detectChanges();
        }
      }
    });
  }

  getMenuName(funs: FunsrightInfo[], progNo: string): void {
    const prog = funs.find(x => x.prog_No === progNo);
    if (!prog) {
      this.noProgNo = true;
      this.menu = ['未知頁面，請加入this.initializePage(\'程式代碼\');'];
      return;
    }

    this.noProgNo = false;
    this.menu.push(prog.prog_name);
    if (prog.prog_up) this.getMenuName(funs, prog.prog_up);
  }

  // ** 移除舊的 checkIfFavorite 方法 **

  /**
   * 切換我的最愛狀態 (新增或移除)
   * 透過呼叫 FavoriteStoreService 的 updateFavoritesOrder 統一處理 API 呼叫和本地狀態更新。
   */
  toggleFavorite() {
    const favorites = this.favoriteStore.favorites();
    const isCurrentlyFavorite = this.isFavorite(); // 讀取 computed signal 的值
    const progNo = this.ProgNo;

    let newFavorites: FunsrightInfo[];

    if (isCurrentlyFavorite) {
      // 移除操作：過濾掉當前項目
      newFavorites = favorites.filter(fav => fav.prog_No !== progNo);
      this.favoriteStore.updateFavoritesOrder(newFavorites).pipe(
        tap(() => this.messageService.successBubble('我的最愛', '已成功移除最愛項目。'))
      ).subscribe({
        error: error => {
          console.error('Error removing favorite:', error);
          this.messageService.errorBubble('操作失敗', '移除最愛時發生錯誤。');
        }
      });
    } else {
      // 新增操作：找到完整的 FunsrightInfo 資訊
      const itemToAdd = this.funRightsInfo.find(item => item.prog_No === progNo);

      if (!itemToAdd) {
        this.messageService.errorBubble('錯誤', '找不到對應的選單項目資訊，無法新增最愛。');
        return;
      }

      // 添加到列表末尾
      newFavorites = [...favorites, itemToAdd];

      this.favoriteStore.updateFavoritesOrder(newFavorites).pipe(
        tap(() => this.messageService.successBubble('我的最愛', '已成功新增最愛項目。'))
      ).subscribe({
        error: error => {
          console.error('Error adding favorite:', error);
          this.messageService.errorBubble('操作失敗', '新增最愛時發生錯誤。');
        }
      });
    }
  }
}
