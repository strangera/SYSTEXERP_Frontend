import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls56030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) {}

  /** 查詢 POS2023RTN 資料表 */
  queryTLS56030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS56030`, data);
  }

  /** 查詢商品管理編號/國際條碼/廠商貨號查詢商品 */
  queryPOS2004Detail_TLS56030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryPOS2004Detail_TLS56030`, data);
  }

  /** 新增 POS2023RTN 資料 */
  insertTLS56030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS56030`, data);
  }

  /** 更新 POS2023RTN、POS2024RTN 資料 */
  updateTLS56030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS56030`, data);
  }

  /** 查詢 POS2024RTN 資料表 */
  queryPOS2024RTN(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryPOS2024RTN`, data);
  }

  /** 根據狀態更新 POS2023RTN 資料 */
  updateStatusTLS56030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateStatusTLS56030`, data);
  }
}
