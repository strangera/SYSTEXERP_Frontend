import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls56020Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(
    private http: HttpClient,
  ) { }

  // 查詢POS2023資料表
  queryTLS56020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS56020`, data);
  }

  // 國際條碼/商品管理編號/廠商貨號查詢商品
  queryPOS2004Detail_TLS56020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryPOS2004Detail_TLS56020`, data);
  }

  // 新增POS2023資料表
  insertTLS56020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS56020`, data);
  }

  // 更新POS2023、POS2024資料
  updateTLS56020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS56020`, data);
  }

  // 查詢POS2024資料
  queryPOS2024(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryPOS2024`, data);
  }

  // 根據狀態更新POS2023資料
  updateStatusTLS56020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateStatusTLS56020`, data);
  }
}
