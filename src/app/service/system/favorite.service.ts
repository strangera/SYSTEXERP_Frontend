import { Injectable } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './auth.service';

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

  constructor(private readonly http: HttpClient) { }

  /**
   * 獲取我的最愛
   * @param user_No 使用者編號 (可選)
   * @returns 包含我的最愛列表的 API 響應 Observable
   */
  getFavorites(user_No?: string): Observable<ApiResponse<Favorite[]>> {
    return this.http.post<ApiResponse<Favorite[]>>(`${this.apiUrl}/User/GetUserFavorite`, { user_No: user_No }).pipe(
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
  }

  /**
   * 更新我的最愛
   * @param body 我的最愛列表
   * @returns 包含操作結果的 API 響應 Observable
   */
  updateUserFavorite(body: Favorite[]): Observable<ApiResponse<unknown>> {
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
