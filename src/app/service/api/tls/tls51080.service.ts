import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
//POS2034 倉庫設定檔
export interface POS2034 {
  'id': string;
  'STO_No': string; // 公司編號/店號
  'HOS_No': string; // 倉庫代碼 STO_NO+HOS_NO唯一值 STO_NO+HOS_NO唯一值
  'HOS_NAME': string; // 倉庫名稱
  'org_id': string; // 組織代碼/組織名稱
  'org_name': string; // 部門名稱
  'building_no': string; // 館別代碼
  'HOS_Remark'?: string; // 備註說明

  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;

  'CanDel': boolean; //能否刪除(僅顯示)
}
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
}
