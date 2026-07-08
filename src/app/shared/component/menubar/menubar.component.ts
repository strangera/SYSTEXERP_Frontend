import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, Input, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Observable, finalize, map, take } from 'rxjs';
import { FavoriteStoreService } from 'src/app/core/layout/app.topbar/favorite-store.service';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { NotificationService } from '../notification-message/notification.service';
import { SystemDataService } from './../../../service/system/system-data.service';

@Component({
  selector: 'app-menubar',
  template: `
  <div class="relative w-full min-w-0">
    <div class="w-full overflow-x-auto whitespace-nowrap">
      <p-breadcrumb class="inline-block min-w-max w-full"
        [model]="(customBreadcrumbItems.length ? customBreadcrumbItems : (breadcrumbItems$ | async)) ?? undefined"
        [home]="home">
        <ng-template pTemplate="item" let-item>
          <div class="cursor-pointer" [routerLink]="item.url">
            <span class="text-sm font-semibold" [class.text-red-500]="noProgNo" [class.text-color]="!noProgNo">
              {{ item.label }}
            </span>

            @if (item.isLast && !noProgNo) {
              @if (isUpdating()) {
                <i class="pi pi-spinner pi-spin text-color"></i>
              } @else {
                <i [class]="isFavorite() ? 'pi pi-star-fill text-yellow-400' : 'pi pi-star text-color'"></i>
              }
            }
          </div>
        </ng-template>
      </p-breadcrumb>
    </div>
  </div>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, // 保持 OnPush
  host: { class: 'block min-w-0' },
  imports: [
    BreadcrumbModule,
    PrimeTemplate,
    RouterLink,
    AsyncPipe
  ],
})
export class MenubarComponent implements OnInit {
  @Input() ProgNo = '';
  @Input() customBreadcrumbItems: MenuItem[] = [];

  private readonly messageService = inject(NotificationService);
  private readonly systemDataService = inject(SystemDataService);
  private readonly favoriteStore = inject(FavoriteStoreService);
  private readonly destroyRef = inject(DestroyRef);
  readonly isUpdating = signal(false);
  readonly home = { icon: 'pi pi-home', routerLink: '/account/dashboard' };

  // 使用 Signal/Computed 處理「我的最愛」狀態
  readonly isFavorite = computed(() =>
    this.favoriteStore.favorites().some(fav => fav.prog_No === this.ProgNo)
  );

  // 將 breadcrumb 轉為 Observable，配合 AsyncPipe 自動觸發變更偵測（AsyncPipe 會在元件銷毀時自動取消訂閱）
  breadcrumbItems$!: Observable<MenuItem[]>;
  noProgNo = false;

  ngOnInit(): void {
    if (this.customBreadcrumbItems.length > 0) return;

    // 初始化載入
    this.favoriteStore.fetchFavorites().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    // 優化邏輯：將數據轉換邏輯封裝在 pipe 中
    this.breadcrumbItems$ = this.systemDataService.menuUpdated.pipe(
      map((newData: FunsrightInfo[]) => {
        const menuPath = this.getMenuPath(newData, this.ProgNo);

        if (menuPath.length === 0) {
          this.noProgNo = true;
          return [{ label: '未知頁面，請檢查程式代碼' }];
        }

        this.noProgNo = false;
        // 將路徑轉換成 PrimeNG 需要的 MenuItem 格式
        return menuPath.map((name, index) => ({
          label: name,
          isLast: index === menuPath.length - 1,
          // command 只有最後一項需要
          command: index === menuPath.length - 1 ? () => this.toggleFavorite() : undefined
        }));
      })
    );
  }

  /**
   * 迭代法取代遞迴，效能更好且不會有 Stack Overflow 風險
   */
  private getMenuPath(funs: FunsrightInfo[], targetNo: string): string[] {
    const path: string[] = [];
    let currentNo: string | undefined = targetNo;
    const menuMap = new Map(funs.map(f => [f.prog_No, f])); // 轉為 Map 提升查詢速度至 O(1)

    while (currentNo) {
      const prog = menuMap.get(currentNo);
      if (!prog) break;
      path.unshift(prog.prog_name); // 加入陣列開頭
      currentNo = prog.prog_up;
    }
    return path;
  }

  toggleFavorite(): void {
    if (this.isUpdating()) return; // 防止重複點擊

    const favorites = this.favoriteStore.favorites();
    const isCurrentlyFavorite = this.isFavorite();

    this.systemDataService.menuUpdated.pipe(take(1)).subscribe(menu => {
      if (!menu.length) {
        this.messageService.warnBubble('請稍候', '系統選單資料尚未載入。');
        return;
      }

      // 開始轉圈
      this.isUpdating.set(true);

      if (isCurrentlyFavorite) {
        const newFavorites = favorites.filter(fav => fav.prog_No !== this.ProgNo);
        this.updateFavoriteStore(newFavorites, '已成功移除最愛項目。');
      } else {
        const itemToAdd = menu.find(item => item.prog_No === this.ProgNo);
        if (!itemToAdd) {
          this.isUpdating.set(false);
          return;
        }
        this.updateFavoriteStore([...favorites, itemToAdd], '已成功新增最愛項目。');
      }
    });
  }

  private updateFavoriteStore(list: FunsrightInfo[], successMsg: string): void {
    this.favoriteStore.updateFavoritesOrder(list).pipe(
      take(1),
      finalize(() => this.isUpdating.set(false))
    ).subscribe({
      next: () => this.messageService.successBubble('我的最愛', successMsg),
      error: () => this.messageService.errorBubble('操作失敗', '更新最愛時發生錯誤。')
    });
  }
}