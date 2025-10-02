import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from 'src/environments/environment';

// 查詢物品類別 Request
export interface QueryCPM11050Request extends BaseQueryRequest {
  SYS_Code?: string;   // 物品類別代碼
  SYS_Name?: string;   // 物品類別名稱
}

// 物品類別 Response 資料結構
export interface CPM11050Data {
  ID: number;              // 主鍵ID
  SYS_Code?: string;       // 物品類別代碼
  SYS_Name?: string;       // 物品類別名稱
  CRT_Date?: string;       // 建立日期
  CRT_USR_No?: string;     // 建立人員
  CRT_USR_Name?: string;   // 建立人員名稱
  UPD_Date?: string;       // 變更日期
  UPD_USR_No?: string;     // 變更人員
  UPD_USR_Name?: string;   // 變更人員名稱
}

// 新增物品類別 Request
export interface InsertCPM11050Request {
  SYS_Code: string;
  SYS_Name: string;
}

// 修改物品類別 Request
export interface UpdateCPM11050Request {
  ID: number;
  SYS_Name: string;
}

// 刪除物品類別 Request
export interface DeleteCPM11050Request {
  idList: number[];
}

@Injectable({
  providedIn: 'root'
})
export class CPM11050Service {
  private apiUrl = environment.ApiUrl + '/CPM0000/CPM1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryCPM11050(req: QueryCPM11050Request): Observable<BaseQueryResponse<CPM11050Data>> {
    return this.http.post<BaseQueryResponse<CPM11050Data>>(`${this.apiUrl}/queryCPM11050`, req);
  }

  // 新增
  insertCPM11050(req: InsertCPM11050Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertCPM11050`, req);
  }

  // 修改
  updateCPM11050(req: UpdateCPM11050Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateCPM11050`, req);
  }

  // 刪除
  deleteCPM11050(req: DeleteCPM11050Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteCPM11050`, req);
  }
}