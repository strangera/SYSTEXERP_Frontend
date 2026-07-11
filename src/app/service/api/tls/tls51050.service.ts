import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
// PLUUNIT  商品單位設定檔
export interface PluUnit {
  id: string;
  UNIT_No: string;
  UNIT_NAME: string;
  UNIT_Attribute: string;
  UNIT_Attribute_Name: string; // 報表顯示的名稱
  CHILD_UNIT: string; // 子項單位代號 --沒有使用
  CHILD_QTY: number; // 子項單位數量 --沒有使用
  UNIT_Remark: string;

  CRT_Date: Date;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: Date;
  UPD_USR_No: string;
  UPD_USR_Name: string;

  CanDel: boolean;  //能否刪除(僅顯示)
}
@Injectable({
  providedIn: 'root'
})
export class Tls51050Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';
  constructor(private http: HttpClient) { }

  // 查詢 PLUUNIT 資料表
  queryTLS51050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51050`, body);
  }

  // 新增 PLUUNIT 資料表
  insertTLS51050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS51050`, body);
  }

  // 更新 PLUUNIT 資料表
  updateTLS51050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS51050`, body);
  }

  // 刪除 PLUUNIT 資料表
  deleteTLS51050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS51050`, body);
  }
}
