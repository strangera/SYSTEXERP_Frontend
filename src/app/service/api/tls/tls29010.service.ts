import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls29010Service {
  // POS2004 TALPORDERD_OPENDisc 折扣開放維護作業
    apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';
    constructor(private http: HttpClient) { }

  // 查詢 TALPORDERM 資料表
  queryTLS29010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS29010`, body);
  }

  // 查詢 TALPORDERD_OPENDisc 資料表
  queryTLS29010_Detail(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS29010_Detail`, body);
  }

  // 新增 TALPORDERD_OPENDisc 資料表
  insertTLS29010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS29010`, body);
  }

  // 修改 TALPORDERD_OPENDisc 資料表
  updateTLS29010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS29010`, body);
  }

  // 刪除 TALPORDERD_OPENDisc 資料表
  deleteTLS29010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS29010`, body);
  }

  // ---dropDown下拉---

  // 查詢 專櫃編號
  queryTLTTALENT_Status_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTTALENT_Status_DropDownList`, body);
  }

  // 查詢 部門編號(SYS3100)
  querySYS3100_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3100_DropDownList`, body);
  }
}
