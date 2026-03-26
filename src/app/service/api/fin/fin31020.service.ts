import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// 查詢請求介面
export interface QueryFIN31020Request extends BaseQueryRequest {
  CAR_AccNo?: string;  // 調整科目代號
  CAR_Type?: string;   // 加減項
  Remark?: string;     // 備註
}

// 查詢結果資料介面
export interface FIN31020Data {
  Id?: number;            // ID (編輯時需要)
  CAR_AccNo: string;      // 調整科目代號
  CAR_Type: number;       // 加減項 (1:加項, 2:減項)
  Remark: string;         // 備註
  CRT_Date: string;       // 建立日期
  CRT_USR_No: string;     // 建立人員代號
  CRT_USR_Name: string;   // 建立人員姓名
  UPD_Date: string;       // 更新日期
  UPD_USR_No: string;     // 更新人員代號
  UPD_USR_Name: string;   // 更新人員姓名
  CanDel: boolean;        // 是否可刪除
}

// 新增請求介面 (必填: mid、CAR_AccNo、CAR_type、CRT_Date、CRT_USR_No、CRT_USR_Name)
export interface InsertFIN31020Request {
  Mid: number;            // 必填欄位
  CAR_AccNo: string;      // 調整科目代號 (必填)
  CAR_Type: string;       // 加減項 (必填)
  Remark?: string;        // 備註 (非必填)
}

// 編輯請求介面 (必填: mid、CAR_AccNo、CAR_type、UPD_Date、UPD_USR_No、UPD_USR_Name)
export interface UpdateFIN31020Request {
  Id: number;             // ID
  Mid: number;            // 必填欄位
  CAR_AccNo: string;      // 調整科目代號 (必填，但不可修改)
  CAR_Type: string;       // 加減項 (必填)
  Remark?: string;        // 備註 (非必填)
}

// 查詢單筆資料請求介面
export interface QueryFIN31020DetailRequest {
  CAR_AccNo: string;  // 調整科目代號
}

// 查詢單筆資料回應介面
export interface QueryFIN31020DetailResponse {
  Status: string;
  Data: {
    Id: number;
    Mid: number;
    CAR_AccNo: string;
    CAR_Type: string;
    Remark: string;
    CRT_Date: string;
    CRT_USR_No: string;
    CRT_USR_Name: string;
    UPD_Date: string;
    UPD_USR_No: string;
    UPD_USR_Name: string;
  };
  Error?: {
    Code: string;
    Message: string;
    Details: string;
  };
  Meta?: {
    Timestamp: string;
    RequestId: string;
  };
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

// API 回應介面
export interface FIN31020ApiResponse {
  Status: string;
  Message: string;
  Data?: { Id: number } | FIN31020Data;
  Error?: {
    Code: string;
    Message: string;
    Details: string;
  };
  Meta?: {
    Timestamp: string;
    RequestId: string;
  };
  TotalCount?: number;
  TotalPage?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FIN31020Service {
  private readonly apiUrl = `${environment.ApiUrl}/FIN0000/ARS1000`;

  constructor(private http: HttpClient) { }

  queryFIN31020(data: QueryFIN31020Request): Observable<BaseQueryResponse<FIN31020Data>> {
    return this.http.post<BaseQueryResponse<FIN31020Data>>(`${this.apiUrl}/queryFIN31020`, data);
  }

  queryFIN31020Detail(data: QueryFIN31020DetailRequest): Observable<QueryFIN31020DetailResponse> {
    return this.http.post<QueryFIN31020DetailResponse>(`${this.apiUrl}/queryFIN31020Detail`, data);
  }

  insertFIN31020(data: InsertFIN31020Request): Observable<FIN31020ApiResponse> {
    return this.http.post<FIN31020ApiResponse>(`${this.apiUrl}/insertFIN31020`, data);
  }

  updateFIN31020(data: UpdateFIN31020Request): Observable<FIN31020ApiResponse> {
    return this.http.post<FIN31020ApiResponse>(`${this.apiUrl}/updateFIN31020`, data);
  }

  deleteFIN31020(carAccNoList: string[]): Observable<FIN31020ApiResponse> {
    return this.http.post<FIN31020ApiResponse>(`${this.apiUrl}/deleteFIN31020`, { CAR_AccNoList: carAccNoList });
  }
}
