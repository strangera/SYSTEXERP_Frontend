import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from 'src/environments/environment';

// 查詢電子發票參數維護 Request
export interface QueryFIN11210Request extends BaseQueryRequest {
  ECR_No?: string[];    // 收銀機號
  ARG_No?: string[];    // 參數代號
  ARG_Desc?: string;    // 參數說明
}

// 電子發票參數維護 Response 資料結構
export interface FIN11210Data {
  ID: number;              // 主鍵ID
  ECR_No?: string;         // 收銀機號
  ARG_No?: string;         // 參數代號
  ARG_Data?: string;       // 參數內容
  ARG_Desc?: string;       // 參數說明
  CRT_Date?: string;       // 建立日期
  CRT_USR_No?: string;     // 建立人員
  CRT_USR_Name?: string;   // 建立人員名稱
  UPD_Date?: string;       // 變更日期
  UPD_USR_No?: string;     // 變更人員
  UPD_USR_Name?: string;   // 變更人員名稱
}

// 新增電子發票參數維護 Request
export interface InsertFIN11210Request {
  ECR_No?: string;      // 收銀機號
  ARG_No?: string;      // 參數代號
  ARG_Data?: string;    // 參數內容
  ARG_Desc?: string;    // 參數說明
}

// 修改電子發票參數維護 Request
export interface UpdateFIN11210Request {
  ID: number;           // 主鍵ID
  ARG_Data?: string;    // 參數內容
}

// 刪除電子發票參數維護 Request
export interface DeleteFIN11210Request {
  idList: number[];
}

@Injectable({
  providedIn: 'root'
})
export class FIN11210Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN11210(req: QueryFIN11210Request): Observable<BaseQueryResponse<FIN11210Data>> {
    return this.http.post<BaseQueryResponse<FIN11210Data>>(`${this.apiUrl}/queryFIN11210`, req);
  }

  // 新增
  insertFIN11210(req: InsertFIN11210Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN11210`, req);
  }

  // 修改
  updateFIN11210(req: UpdateFIN11210Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN11210`, req);
  }

  // 刪除
  deleteFIN11210(req: DeleteFIN11210Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteFIN11210`, req);
  }
}