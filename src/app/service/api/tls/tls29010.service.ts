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

  // 查詢 TLTTALENT_CHARGED 表
  queryTLTTALENT_CHARGED(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLTTALENT_CHARGED`, body);
  }

  // 新增 TALPORDERD_OPENDisc 資料表
  insertTLS29010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS29010`, body);
  }

  // 修改 TALPORDERD_OPENDisc 資料表
  updateTLS29010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS29010`, body);
  }

  // 刪除 TALPORDERD_OPENDisc 資料表 (明細都用update處理，先掛著)
  deleteTLS29010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS29010`, body);
  }

  // 刪除 主檔 TALPORDERM 資料表
  deleteTLS29010M(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS29010M`, body);
  }

  // ---20251017 SA新增需求---
  // 查詢 TLTTALENT 資料表，作為明細下拉選單
  queryTLTTALENT_Data(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLTTALENT_Data`, body);
  }

  // ---20251216 SA新增需求---
  // 查詢 主檔(TLTTALENT_CHARGEM) + 明細(TLTTALENT_CHARGED)的資料表下拉選單
  queryTLTTALENT_CHARGE_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTTALENT_CHARGE_DropDownList`, body);
  }

  // 核准 主檔
  apprTLS29010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/apprTLS29010`, body);
  }

  // ---dropDown下拉---

  // ---20251216 SA新增需求---
  // 活動申請編號 下拉選單
  dropdownTLS29010bypodno(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dropdownTLS29010bypodno`, body);
  }

  // 折扣別 下拉選單
  dropdownTLS29010bytalentid(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dropdownTLS29010bytalentid`, body);
  }
}
