import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls12060Service {
  // 還不確定table名稱，先加掛dropdown選項
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS1000';
  constructor(private http: HttpClient) {}

  // 查詢 Potential_Customer 資料表
  queryTLS12060(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS12060`, body);
  }

  // // 查詢 Potential_Customer_Detail資料表
  // queryTLS12010_Detail(body: any): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}/queryTLS12010_Detail`, body);
  // }

  // // 新增 Potential_Customer 資料表
  // insertTLS12010(body: any): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}/insertTLS12010`, body);
  // }

  // // 更新 Potential_Customer 資料表
  // updateTLS12010(body: any): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}/updateTLS12010`, body);
  // }


  // // 刪除 Potential_Customer 資料表
  // deleteTLS12010(body: any): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}/deleteTLS12010`, body);
  // }
  // --- dropDown ---
  //查詢 接待人員
  queryTBLUSER_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTBLUSER_DropDownList`, body);
  }

  // 查詢 大分類(業種)設定檔
  queryTLTBUSTYPE_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTBUSTYPE_DropDownList`, body);
  }

  // 查詢 廠商統一編號 設定檔  
  queryPOS2013_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS2013_DropDownList`, body);
  }
  // 查詢 樓層代碼 設定檔 (SYS3900)
  querySYS3900_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3900_DropDownList`, body);
  }

  //查詢 位置編號 設定檔(SYS3A00)
  queryPOS2002_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS2002_DropDownList`, body);
  }

  //查詢 區域代碼(SYS3A00)
  querySYS3A00_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3A00_DropDownList`, body);
  }

  //查詢 專櫃編號(TLTTALENT)
  queryTLTTALENT_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTTALENT_DropDownList`, body);
  }

  //查詢 館別(SYS3800)
  querySYS3800_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3800_DropDownList`, body);
  }
}
