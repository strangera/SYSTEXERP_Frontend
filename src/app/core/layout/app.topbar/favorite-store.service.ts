import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '@service/system/auth.service';
import { FavoriteService } from '@service/system/favorite.service'; // 您的 Favorites HTTP Service
import { SystemDataService } from '@service/system/system-data.service';
import { FunsrightInfo } from '@shared/models/system/funsrightInfo';
import { EMPTY, Observable, catchError, map, switchMap, take, tap } from 'rxjs'; // 導入 take

// 假設您的 Favorite 介面已拉出
interface FavoriteBody {
  USER_No: string | undefined,
  PROG_No: string,
  FVT_SeqNo: number
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteStoreService {
  private favoriteService = inject(FavoriteService);
  private authService = inject(AuthService);
  private systemDataService = inject(SystemDataService);

  // **核心狀態 (Signals)**
  public readonly favorites = signal<FunsrightInfo[]>([]);
  public readonly editingFavorites = signal(false);
  public readonly selectedFavorites = signal<FunsrightInfo[]>([]);

  // 依賴於其他 Service 的 Computed
  private readonly userNo = computed(() => this.authService.currentUserValue?.user_No);
  // 這裡保留 funRightsInfo 作為 Observable，用於 fetchFavorites 內部取值
  private readonly funRightsInfo = this.systemDataService.menuUpdated;

  constructor() {

    // 監聽使用者登入/登出，確保狀態清空
    toObservable(this.userNo).subscribe(userNo => {
      if (!userNo) {
        this.favorites.set([]); // 登出時清空狀態
        this.favoriteService.clearLocalFavorites(); // 最佳實踐：同時清除 SessionStorage
      } else {
        // 【新增/修正】一旦使用者登入，就應該立即觸發載入
        // 確保 Store 狀態在登入後盡快更新
        this.fetchFavorites().subscribe();
      }
    });
  }

  /**
   * @description 公共方法：手動觸發載入我的最愛，確保使用當前正確的 userNo。
   */
  public fetchFavorites(): Observable<void> {
    const userNo = this.userNo();
    if (!userNo) {
      this.favorites.set([]);
      return EMPTY;
    }

    // 【優化】這裡的邏輯是正確的：等待菜單/權限資料準備好 (take(1))，然後才去載入最愛。
    return this.funRightsInfo.pipe(
      take(1), // 只取最新的菜單/權限資料
      switchMap(funRights => {
        // **修正點：如果菜單還沒載入，不應該返回 EMPTY，而是返回一個非錯誤的完成信號，或者等待。**
        // 由於您使用 BehaviorSubject，如果菜單是空的，表示還未從 API 載入，我們應該停止後續的 API 呼叫。
        if (funRights.length === 0) {
          // 判斷 BehaviorSubject 的當前值是否為初始值，如果是，則表示尚未載入
          console.warn('FavoriteStoreService: Menu data not available, stop loading favorites.');
          return EMPTY; // 返回 EMPTY 讓流程終止，但不會報錯
        }
        // 使用當前最新的 userNo 和 funRights 呼叫載入方法
        return this.loadFavorites(funRights);
      }),
      catchError(error => {
        console.error('Failed to fetch favorites in store:', error);
        return EMPTY; // 錯誤時返回 EMPTY 讓外部訂閱完成，不中斷應用
      })
    );
  }

  private loadFavorites(funRights: FunsrightInfo[]): Observable<void> {
    return this.favoriteService.getFavorites().pipe(
      tap(response => {
        if (response.Status === '0000') {
          const favoritesWithDetails: FunsrightInfo[] = [];
          response.Data.forEach((fav: any) => { // 假設 response.Data 是原始 Favorite 結構
            const matchingFunRight = funRights.find(item => item.prog_No === fav.PROG_No);
            if (matchingFunRight) favoritesWithDetails.push(matchingFunRight);
          });

          // 更新核心狀態
          this.favorites.set(favoritesWithDetails.map(item => ({
            ...item,
            path: `/account/${item.prog_No.slice(0, 3).toLowerCase()}/${item.prog_No.toLowerCase()}`,
          })));
        } else {
          console.warn(`Favorite API 業務錯誤: ${response.Message}. 保留當前最愛狀態。`);
        }
      }),
      map(() => void 0), // 轉換為 void
      catchError(error => {
        console.error('Error fetching favorites in loadFavorites:', error);
        // 【重要修正】這裡應返回 EMPTY 而非 throwError，避免外部流程中斷。
        return EMPTY;
      })
    );
  }

  // **操作方法 (Actions) - 以下維持不變**

  toggleEditing() {
    this.editingFavorites.update(isEditing => !isEditing);
    this.selectedFavorites.set([]); // 切換編輯狀態時清空選擇
  }

  updateSelected(selected: FunsrightInfo[]) {
    this.selectedFavorites.set(selected);
  }

  // 刪除選定的最愛 (並重新排序)
  deleteSelectedFavorites(): Observable<void> {
    const remainingFavorites = this.favorites().filter(favorite =>
      !this.selectedFavorites().some(selected => selected.prog_No === favorite.prog_No)
    );

    return this.updateFavoritesOrder(remainingFavorites);
  }

  // 排序我的最愛
  updateFavoritesOrder(newOrder: FunsrightInfo[]): Observable<void> {
    const userNo = this.userNo();
    if (!userNo) return EMPTY;

    const body: FavoriteBody[] = newOrder.map((favorite, index) => ({
      USER_No: userNo,
      PROG_No: favorite.prog_No,
      FVT_SeqNo: index + 1,
    }));

    return this.favoriteService.updateUserFavorite(body).pipe(
      tap(() => {
        // 成功後更新本地狀態
        this.favorites.set(newOrder);
        this.editingFavorites.set(false);
        this.selectedFavorites.set([]);
      }),
      map(() => void 0)
    );
  }
}
