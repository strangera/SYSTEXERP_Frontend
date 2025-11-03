import { Injectable, inject, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FavoriteService } from '@service/system/favorite.service'; // 您的 Favorites HTTP Service
import { AuthService } from '@service/system/auth.service';
import { SystemDataService } from '@service/system/system-data.service';
import { FunsrightInfo } from '@shared/models/system/funsrightInfo';
import { Observable, EMPTY, catchError, map, switchMap, tap, throwError, take } from 'rxjs'; // 導入 take

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
      }
    });
  }

  /**
   * @description 公共方法：手動觸發載入我的最愛，確保使用當前正確的 userNo。
   */
  public fetchFavorites(): Observable<void> {
    const userNo = this.userNo();
    if (!userNo) {
      this.favorites.set([]); // 如果沒有使用者，清空並返回
      return EMPTY;
    }

    // 透過 funRightsInfo.pipe(take(1)) 確保在呼叫 API 時取得最新的功能權限資料
    return this.funRightsInfo.pipe(
      take(1), // 只取最新的菜單/權限資料
      switchMap(funRights => {
        if (funRights.length === 0) {
          // 如果菜單資料還沒載入，可能需要等待，但為了避免無限等待，這裡先返回 EMPTY
          // 實際應用中，如果菜單是透過一個 Resolver 載入，這裡應該會立即有值
          return EMPTY;
        }
        // 使用當前最新的 userNo 和 funRights 呼叫載入方法
        return this.loadFavorites(funRights);
      }),
      catchError(error => {
        console.error('Failed to fetch favorites in store:', error);
        return EMPTY;
      })
    );
  }

  private loadFavorites(funRights: FunsrightInfo[]): Observable<void> {
    // ... (載入邏輯不變，它依賴外部傳入的 userNo 和 funRights)
    return this.favoriteService.getFavorites().pipe(
      tap(response => {
        if (response.Status === '0000' && response.Data) {
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
          this.favorites.set([]);
        }
      }),
      map(() => void 0), // 轉換為 void
      catchError(error => {
        console.error('Error fetching favorites:', error);
        return throwError(() => error);
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
