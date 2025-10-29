import { Injectable, inject, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FavoriteService } from '@service/system/favorite.service'; // 您的 Favorites HTTP Service
import { AuthService } from '@service/system/auth.service';
import { SystemDataService } from '@service/system/system-data.service';
import { FunsrightInfo } from '@shared/models/system/funsrightInfo';
import { Observable, EMPTY, catchError, map, switchMap, tap, throwError } from 'rxjs';

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
  private readonly funRightsInfo = this.systemDataService.menuUpdated;

  constructor() {
    // 當使用者登入狀態或權限變更時，自動觸發重新載入
    this.funRightsInfo.pipe(
      // 確保有 userNo 和權限資料
      switchMap(funRights => {
        const userNo = this.userNo();
        if (!userNo || funRights.length === 0) return EMPTY;
        return this.loadFavorites(userNo, funRights);
      }),
      catchError(error => {
        console.error('Failed to load favorites in store:', error);
        return EMPTY;
      })
    ).subscribe(); // 使用 Service 預設的生命週期

    // 監聽使用者登入/登出，確保狀態清空/載入
    toObservable(this.userNo).subscribe(userNo => {
      if (!userNo) {
        this.favorites.set([]); // 登出時清空狀態
      }
    });
  }

  private loadFavorites(userNo: string, funRights: FunsrightInfo[]): Observable<void> {
    return this.favoriteService.getFavorites(userNo).pipe(
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

  // **操作方法 (Actions)**

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
