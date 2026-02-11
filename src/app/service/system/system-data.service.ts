import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FunsrightInfo } from '@shared/models/system/funsrightInfo';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { BehaviorSubject, catchError, map, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SystemOptionsService } from './sys1000.service';

export interface QuerySystemCodeResponse {
  CRT_Date: string,
  CRT_USR_No: string,
  CRT_USR_Name: string,
  UPD_Date: string,
  UPD_USR_No: string,
  UPD_USR_Name: string,
  ID: number,
  SYS_Type: string,
  SYS_Code: string,
  SYS_Name: string,
  SYS_Enabled: string,
  SYS_Sort: number
}

@Injectable({
  providedIn: 'root'
})
export class SystemDataService {
  private readonly apiUrl: string = environment.ApiUrl;

  // 最佳實踐：只將 BehaviorSubject 設為 private，public 屬性保持為只讀 Observable
  private readonly _menuUpdated = new BehaviorSubject<FunsrightInfo[]>([]);
  public readonly menuUpdated = this._menuUpdated.asObservable(); // 使用 public readonly

  private readonly _sys1000 = new BehaviorSubject<unknown[]>([]);
  public readonly sys1000 = this._sys1000.asObservable(); // 使用 public readonly

  constructor(private readonly http: HttpClient) {
    // 初始化時從 localStorage 載入資料
    this.initializeFromSessionStorage();
  }

  /**
   * 初始化：從 localStorage 載入資料以在服務啟動時同步還原狀態。
   */
  private initializeFromSessionStorage(): void {
    const storedFunRightsInfo = localStorage.getItem('FunRightsInfo');
    if (storedFunRightsInfo) {
      // 避免在運行時解析失敗導致應用程式崩潰，使用 try-catch 包裹 JSON.parse
      try {
        this._menuUpdated.next(JSON.parse(storedFunRightsInfo) as FunsrightInfo[]);
      } catch (e) {
        console.error('Error parsing FunRightsInfo from localStorage during initialization', e);
        localStorage.removeItem('FunRightsInfo'); // 清除無效數據
      }
    }
    const storedSys1000 = localStorage.getItem('SYS1000');
    if (storedSys1000) {
      try {
        this._sys1000.next(JSON.parse(storedSys1000) as unknown[]);
      } catch (e) {
        console.error('Error parsing SYS1000 from localStorage during initialization', e);
        localStorage.removeItem('SYS1000'); // 清除無效數據
      }
    }
  }

  /**
   * 獲取使用者權限/選單資料
   * 最佳實踐：使用 tap 處理副作用 (localStorage 儲存)。
   * 最佳實踐：考慮使用 shareReplay(1) 避免重複呼叫 API。
   * @returns 包含權限資訊的 API 響應 Observable
   */
  getFunRightsInfo(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/User/GetUserDashboard`, {}).pipe(
      tap((response: ApiResponse<any>) => {
        if (response.Status === '0000' && response.Data?.funright_info) {
          // 1. 將資料儲存到 localStorage
          localStorage.setItem('FunRightsInfo', JSON.stringify(response.Data.funright_info));
          // 2. 更新 BehaviorSubject
          this._menuUpdated.next(response.Data.funright_info);
        }
      }),
      // 避免在 service 中進行不必要的 map 轉換 (tap 已足夠，且自動傳遞 response)
      catchError((error) => {
        console.error('Error fetching FunRightsInfo', error);
        return throwError(() => error);
      }),
      // 性能優化：確保多次訂閱只會執行一次 HTTP 請求，並重放最後一個值
      shareReplay(1)
    );
  }

  /**
   * 獲得系統代碼檔 (SYS1000)
   * 最佳實踐：使用 tap 處理副作用，並使用 shareReplay(1) 優化性能。
   * @returns 包含系統代碼的 API 響應 Observable
   */
  queryAllSystemCode(): Observable<ApiResponse<QuerySystemCodeResponse[]>> {
    return this.http.post<ApiResponse<QuerySystemCodeResponse[]>>(`${this.apiUrl}/User/queryAllSystemCode`, {}).pipe(
      tap((response: ApiResponse<QuerySystemCodeResponse[]>) => {
        if (response.Status === '0000' && response.Data) {
          // 1. 將資料儲存到 localStorage
          localStorage.setItem('SYS1000', JSON.stringify(response.Data));
          // 2. 更新 BehaviorSubject
          this._sys1000.next(response.Data);
        }
      }),
      shareReplay(1)
    );
  }
  /**
 * 定向更新特定類型的代碼檔
 * 回傳 Observable 確保呼叫端可以等待更新完成
 */
  refreshSystemCodeByType(sysType: string): Observable<QuerySystemCodeResponse[]> {
    const payload = {
      SYS_Type: sysType,
      SYS_Code: "",
      SYS_Name: "",
      SYS_Enabled: ""
    };

    return this.http.post<ApiResponse<QuerySystemCodeResponse[]>>(`${this.apiUrl}/User/queryFilterSystemCode`, payload).pipe(
      tap(response => {
        if (response.Status === '0000' && response.Data) {
          const allData = [...this._sys1000.getValue() as QuerySystemCodeResponse[]];
          const otherTypes = allData.filter(item => item.SYS_Type !== sysType);
          const updatedList = [...otherTypes, ...response.Data];

          this._sys1000.next(updatedList);
          localStorage.setItem('SYS1000', JSON.stringify(updatedList));
          SystemOptionsService.refreshCache();
        }
      }),
      // 轉換成只回傳資料部分，方便後續處理
      map(response => response.Data || []),
      catchError(err => {
        console.error('Refresh System Code Failed', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * 獲取目前頁面使用者權限 (同步操作)
   * 最佳實踐：簡化 try-catch，確保邏輯清晰。
   * @param progNo 程式編號
   * @returns FunsrightInfo 或 undefined
   */
  getUserPermissions(progNo: string): FunsrightInfo | undefined {
    // ⚠️ 最佳實踐：避免在 try-catch 中使用 console.error 報錯 (因為這是可預期的查找行為)
    // 這裡可以直接從 BehaviorSubject 獲取當前值，這是最快的方式。
    return this._menuUpdated.getValue().find(fun => fun.prog_No === progNo);
  }

  /**
   * 獲取系統通知
   */
  querySystemNotice(): Observable<ApiResponse<{ Pub_StartDate: string, Pub_EndDate: string, Pub_Type: string, Pub_Event: string, Pub_Description: string }[]>> {
    return this.http.post<ApiResponse<{ Pub_StartDate: string, Pub_EndDate: string, Pub_Type: string, Pub_Event: string, Pub_Description: string }[]>>(`${this.apiUrl}/User/querySystemNotice`, {}).pipe(
      catchError(error => {
        console.error('Error querying system notice:', error);
        return throwError(() => error);
      }),
      // 系統通知通常會經常變動，這裡暫時不使用 shareReplay(1)，保持每次呼叫都發出請求
    );
  }
}
