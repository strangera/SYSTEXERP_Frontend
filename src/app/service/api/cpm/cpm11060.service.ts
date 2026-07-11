import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢遺拾物品地點 Request
export interface QueryCPM11060Request extends ApiRequest {
  SYS_Code?: string;   // 遺拾物品地點代碼
  SYS_Name?: string;   // 遺拾物品地點名稱
}

// 遺拾物品地點 Response 資料結構
export interface CPM11060Data {
  ID: number;              // 主鍵ID
  SYS_Code?: string;       // 遺拾物品地點代碼
  SYS_Name?: string;       // 遺拾物品地點名稱
  CRT_Date?: string;       // 建立日期
  CRT_USR_No?: string;     // 建立人員
  CRT_USR_Name?: string;   // 建立人員名稱
  UPD_Date?: string;       // 變更日期
  UPD_USR_No?: string;     // 變更人員
  UPD_USR_Name?: string;   // 變更人員名稱
}

// 新增遺拾物品地點 Request
export interface InsertCPM11060Request {
  SYS_Code: string;
  SYS_Name: string;
}

// 修改遺拾物品地點 Request
export interface UpdateCPM11060Request {
  ID: number;
  SYS_Name: string;
}

// 刪除遺拾物品地點 Request
export interface DeleteCPM11060Request {
  idList: number[];
}

@Injectable({
  providedIn: 'root'
})
export class CPM11060Service {
  private apiUrl = environment.ApiUrl + '/CPM0000/CPM1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryCPM11060(req: QueryCPM11060Request): Observable<ApiResponse<CPM11060Data[]>> {
    return this.http.post<ApiResponse<CPM11060Data[]>>(`${this.apiUrl}/queryCPM11060`, req);
  }

  // 新增
  insertCPM11060(req: InsertCPM11060Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertCPM11060`, req);
  }

  // 修改
  updateCPM11060(req: UpdateCPM11060Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateCPM11060`, req);
  }

  // 刪除
  deleteCPM11060(req: DeleteCPM11060Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteCPM11060`, req);
  }
}