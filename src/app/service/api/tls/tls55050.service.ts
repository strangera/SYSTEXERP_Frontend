import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service'; // 根據您的專案路徑引用

// ====================================================================
// TLS55050 月結帳作業 介面定義
// ====================================================================

/** * 通用請求 Body (五個 API 使用相同的結構)
 */
export interface Tls55050Body {
  cls_Month: string; // 結帳月份 (例如: "202512")
  VEN_No: string;    // 廠商編號
}

/**
 * 查詢結果 Data 項目 (根據 queryTLS55050 預期結構，通常與 insert 的 Data 相似或更多欄位)
 */
export interface Tls55050Data {
  CanClose: string;
  Msg: string;
  Cls_Date: string;
  // 若查詢有其他特定欄位可在此擴充
}

/**
 * 月結執行結果 Data 項目 (insertTLS55050 響應)
 */
export interface Tls55050ActionRes {
  CanClose: string;
  Msg: string;
  Cls_Date: string;
}

// ====================================================================
// Service 實作
// ====================================================================

@Injectable({
  providedIn: 'root'
})
export class Tls55050Service {
  private readonly apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(
    private readonly http: HttpClient,
  ) { }

  /**
   * 1. 查詢月結帳作業 (/queryTLS55050)
   * @param body { cls_Month, VEN_No }
   */
  queryTLS55050(body: Tls55050Body): Observable<ApiResponse<Tls55050Data[]>> {
    return this.http.post<ApiResponse<Tls55050Data[]>>(`${this.apiUrl}/queryTLS55050`, body);
  }

  /**
   * 2. 執行月結帳作業 (/insertTLS55050)
   * @param body { cls_Month, VEN_No }
   */
  insertTLS55050(body: Tls55050Body): Observable<ApiResponse<Tls55050ActionRes[]>> {
    return this.http.post<ApiResponse<Tls55050ActionRes[]>>(`${this.apiUrl}/insertTLS55050`, body);
  }

  /**
   * 3. 反月結帳作業 (/reinsertTLS55050)
   * @param body { cls_Month, VEN_No }
   */
  reinsertTLS55050(body: Tls55050Body): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/reinsertTLS55050`, body);
  }

  /**
   * 4. 執行月結鎖定 (/LockTLS55050)
   * @param body { cls_Month, VEN_No }
   */
  lockTLS55050(body: Tls55050Body): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/LockTLS55050`, body);
  }

  /**
   * 5. 執行月結反鎖定 (/UnLockTLS55050)
   * @param body { cls_Month, VEN_No }
   */
  unLockTLS55050(body: Tls55050Body): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/UnLockTLS55050`, body);
  }
}