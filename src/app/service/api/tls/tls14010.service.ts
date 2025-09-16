import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls14010Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS1000';
  constructor(private http: HttpClient) { }

  // 查詢 TLTTALENT 資料表
  queryTLS14010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS14010`, body);
  }

  // 查詢 區域代碼(SYS3A00) 下拉選單
  querySYS3A00_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3A00_DropDownList`, body);
  }

  // 查詢 專櫃大分類(TLTBUSTYPE) 下拉選單
  queryTLTBUSTYPE_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTBUSTYPE_DropDownList`, body);
  }

  // 查詢 樓層代碼(SYS3900) 下拉選單
  querySYS3900_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3900_DropDownList`, body);
  }

  // 查詢 專櫃(TLTTALENT) 下拉選單
  queryTLTTALENT_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTTALENT_DropDownList`, body);
  }

  // 查詢 館別(SYS3800) 下拉選單
  querySYS3800_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3800_DropDownList`, body);
  }

  //查詢 位置編號(SYS3A00) 下拉選單
  queryPOS2002_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS2002_DropDownList`, body);
  }

  //查詢組織代碼(SYS3100) 下拉選單
  querySYS3100_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3100_DropDownList`, body);
  }
}