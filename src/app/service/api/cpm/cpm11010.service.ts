import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from 'src/environments/environment';

// 查詢服務台位置檔 Request 介面
export interface QueryCPM11010Request extends BaseQueryRequest {
  building_no?: string[];   // 館別
  FLOOR_NO?: string[];      // 營業樓層
  AREA_NO?: string[];       // 營業區域
  Service_Id?: string[];    // 服務台位置編號
  Service_Name?: string;    // 服務台位置名稱
}

// 查詢服務台位置檔 Response 資料結構
export interface CPM11010Data {
  ID: number;               // 主鍵ID
  building_no?: string;     // 館別
  building_desc?: string;   // 館別名稱
  FLOOR_NO?: string;        // 營業樓層
  FLOOR_desc?: string;      // 樓層名稱
  AREA_NO?: string;         // 營業區域
  AREA_desc?: string;       // 區域名稱
  Service_Id?: string;      // 服務台位置編號
  Service_Name?: string;    // 服務台位置名稱
  CRT_Date?: string;        // 建立日期
  CRT_USR_No?: string;      // 建立人員編號
  CRT_USR_Name?: string;    // 建立人員名稱
  UPD_Date?: string;        // 更新日期
  UPD_USR_No?: string;      // 更新人員編號
  UPD_USR_Name?: string;    // 更新人員名稱
}

// 新增服務台位置檔 Request 介面
export interface InsertCPM11010Request {
  building_no?: string;     // 館別
  FLOOR_NO?: string;        // 營業樓層
  AREA_NO?: string;         // 營業區域
  Service_Name?: string;    // 服務台位置名稱
}

// 修改服務台位置檔 Request 介面
export interface UpdateCPM11010Request {
  ID: number;               // 主鍵ID
  Service_Name?: string;    // 服務台位置名稱
}

// 刪除服務台位置檔 Request 介面
export interface DeleteCPM11010Request {
  idList: number[];         // 要刪除的ID清單
}

@Injectable({
  providedIn: 'root'
})
export class CPM11010Service {

  private apiUrl = environment.ApiUrl + '/CPM0000/CPM1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryCPM11010(req: QueryCPM11010Request): Observable<BaseQueryResponse<CPM11010Data>> {
    return this.http.post<BaseQueryResponse<CPM11010Data>>(`${this.apiUrl}/queryCPM11010`, req);
  }

  // 新增
  insertCPM11010(req: InsertCPM11010Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertCPM11010`, req);
  }

  // 修改
  updateCPM11010(req: UpdateCPM11010Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateCPM11010`, req);
  }

  // 刪除
  deleteCPM11010(req: DeleteCPM11010Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteCPM11010`, req);
  }
}
