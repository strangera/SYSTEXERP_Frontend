import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls51060Service {

  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';
  constructor(private http: HttpClient) { }

  // 查詢 PLULOGO 資料表
  queryTLS51060(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51060`, body);
  }

  // 新增 PLULOGO 資料表
  insertTLS51060(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS51060`, body);
  }

  // 更新 PLULOGO 資料表
  updateTLS51060(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS51060`, body);
  }

  // 刪除 PLULOGO 資料表
  deleteTLS51060(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS51060`, body);
  }

  // 查詢 POS2034 倉別 下拉選單
  queryPOS2034_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS2034_DropDownList`, body);
  }

  // 查詢 PLULOGO 資料表 (包含折扣別)
  queryPLULOGO_OrderPrcRate_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPLULOGO_OrderPrcRate_DropDownList`, body);
  }
}
