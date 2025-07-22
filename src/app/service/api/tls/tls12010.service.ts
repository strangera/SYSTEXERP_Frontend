import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls12010Service {
  // Potential_Customer 潛在客戶主檔
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS1000';
  constructor(private http: HttpClient) {}

  // 查詢 Potential_Customer 資料表
  queryTLS12010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS12010`, body);
  }

  // 查詢 Potential_Customer_Detail資料表
  queryTLS12010_Detail(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS12010_Detail`, body);
  }

  // 新增 Potential_Customer 資料表
  insertTLS12010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS12010`, body);
  }

  // 新增 Potential_Customer_Detail 資料表
  insertTLS12010_Detail(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS12010_Detail`, body);
  }

  // 更新 Potential_Customer 資料表
  updateTLS12010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS12010`, body);
  }

  // 更新 Potential_Customer_Detail 資料表
  updateTLS12010_Detail(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS12010_Detail`, body);
  }

  // 刪除 Potential_Customer 資料表
  deleteTLS12010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS12010`, body);
  }
  // --- dropDown ---

  // 查詢 大分類(業種)設定檔
  queryTLTBUSTYPE_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTBUSTYPE_DropDownList`, body);
  }

  // 查詢 品牌代碼(PLULOGO) 設定檔
  queryPLULOGO_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPLULOGO_DropDownList`, body);
  }

  // 查詢 廠商統一編號 設定檔  
  queryPOS2013_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS2013_DropDownList`, body);
  }
  // 查詢 經營方式 設定檔 (SYS1000.t117)
  querySYS1000_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS1000_DropDownList`, body);
  }
}
