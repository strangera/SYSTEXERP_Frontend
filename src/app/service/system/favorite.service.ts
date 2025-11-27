import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { catchError, EMPTY, Observable, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

interface Favorite {
  USER_No: string | undefined,
  PROG_No: string,
  FVT_SeqNo: number
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private readonly apiUrl: string = environment.ApiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) { }

  /**
   * 獲取我的最愛
   * @param user_No 使用者編號 (可選)
   * @returns 包含我的最愛列表的 API 響應 Observable
   */
  /**
   * 獲取我的最愛
   * 修正：移除 user_No 參數，直接從 AuthService 獲取。
   * @returns 包含我的最愛列表的 API 響應 Observable
   */
  getFavorites(): Observable<ApiResponse<Favorite[]>> {
    // 透過 switchMap 獲取當前 user_No，並確保只有登入狀態才發送請求
    return this.authService.user.pipe(
      // take(1) 或 takeUntilDestroyed(destroyRef) 來處理生命週期
      // 為了簡單起見，這裡使用 switchMap 來處理狀態
      switchMap(user => {
        const user_No = user?.user_No;

        if (!user_No) {
          // 如果沒有 user_no，則不發送請求，並返回一個空的 Observable，
          // 這樣呼叫者 (例如 component) 訂閱後不會收到錯誤，也不會發送 API 呼叫。
          console.warn('FavoriteService: 無使用者 ID，停止獲取最愛列表。');
          return EMPTY;
        }

        // 只有當 user_No 存在時才發送 HTTP 請求
        return this.http.post<ApiResponse<Favorite[]>>(`${this.apiUrl}/User/GetUserFavorite`, { user_No }).pipe(
          // 最佳實踐：使用 tap 運算子處理副作用 (Side Effect)，保持 map/response 的純淨
          tap((response: ApiResponse<Favorite[]>) => {
            // 將資料儲存到 sessionStorage
            if (response.Status === '0000' && response.Data) {
              sessionStorage.setItem('Favorites', JSON.stringify(response.Data));
            }
          }),
          // 標準做法：確保有 catchError 來處理 HTTP 級別錯誤
          catchError(error => {
            console.error('Error fetching favorites:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
    * 更新我的最愛 (此處也應該使用正確的 user_No，但您的後端可能從 Token 獲取)
    * 如果您的後端要求在 body 中傳遞 user_No，這裡也需要像 getFavorites 一樣使用 switchMap。
    * @param body 我的最愛列表
    * @returns 包含操作結果的 API 響應 Observable
    */
  updateUserFavorite(body: Favorite[]): Observable<ApiResponse<unknown>> {
    // 這裡暫時維持原樣，假設後端是從 Token 中讀取 user_No
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/User/UpdateUserFavorite`, { Favorites: body }).pipe(
      catchError(error => {
        console.error('Error updating favorites:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * 獲取本地儲存的我的最愛
   * 最佳實踐：使用 as Favorite[] 進行斷言，增加型別安全性。
   * @returns Favorite[] 或 null
   */
  getLocalFavorites(): Favorite[] | null {
    const favorites = sessionStorage.getItem('Favorites');
    return favorites ? JSON.parse(favorites) as Favorite[] : null;
  }

  /**
   * 清除本地儲存的我的最愛
   */
  clearLocalFavorites(): void {
    sessionStorage.removeItem('Favorites');
  }

  /**
   * 最佳實踐：新增一個方法，用於從 Service 內部通知菜單變動 (如果需要)
   * 這裡假設 Menu 變動由 SystemDataService 處理，此處僅提供資料獲取/更新功能。
   */
}
