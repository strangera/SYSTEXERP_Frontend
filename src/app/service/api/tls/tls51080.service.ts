import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls51080Service {
  // 分倉資料處理 WAREHOUSE
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';
  constructor(private http: HttpClient) { }

  // 查詢 WAREHOUSE 資料表
  queryTLS51080(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51080`, body);
  }

  // 新增 WAREHOUSE 資料表
  insertTLS51080(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS51080`, body);
  }

  // 更新 WAREHOUSE 資料表
  updateTLS51080(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS51080`, body);
  }

  // 刪除 WAREHOUSE 資料表
  deleteTLS51080(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS51080`, body);
  }
  // 查詢 SYS3100/POS1001 部門編號/分店 資料表
  querySYS3100_join_POS1001_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3100_join_POS1001_DropDownList`, body);
  }

  // 查詢 SYS3100 組織代碼 資料表
  querySYS3100_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3100_DropDownList`, body);
  }

  // 查詢 SYS3800 館別代碼 資料表
  querySYS3800_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3800_DropDownList`, body);
  }
}
