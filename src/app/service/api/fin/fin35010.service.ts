import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

/** 查詢主列表 Request 介面 (繼承分頁及排序欄位) */
export interface FIN35010QueryRequest {
  VEN_No?: string;
  VEN_Name?: string;
  TLT_Name?: string;
  TLT_BDateFrom?: string;
  TLT_BDateTo?: string;
  TLT_EDateFrom?: string;
  TLT_EDateTo?: string;
  DepositDateFrom?: string;
  DepositDateTo?: string;
  CHK_ExpireDateFrom?: string;
  CHK_ExpireDateTo?: string;
  UPD_DateFrom?: string;
  UPD_DateTo?: string;
  CHK_No?: string;
  Status?: string;
  CHK_Type?: string;
  Deposit_Type?: string;
  OrgId?: string;
  CHK_AmtFrom?: number;
  CHK_AmtTo?: number;
  Remark?: string;
}

/** 查詢主列表 Response Item 介面 */
export interface FIN35010Response {
  Id: number;
  CHK_No: string;
  VEN_No: string;
  VEN_Name: string;
  TLT_Name: string;
  Amount: number; // 註：Swagger 顯示 Amount
  CHK_Type: string;
  GuaranteeCategory: string;
  Status: string;
  Remark: string;
  CreateDate: string;
  UPD_Date: string;
}

/** 查詢明細 Response 介面 (用於查詢單一項目) */
export interface FIN35010DetailResponse {
  Id: number;
  STO_No: string;
  Deposit_Mode: string;
  Data_Source: string;
  In_Date: string;
  Deposit_Type: string;
  CHK_Type: string;
  Status: string;
  CHK_No: string;
  CHK_Amt: number;
  CHK_ExpireDate: string;
  Deposit_Date: string;
  Return_Date: string;
  VEN_No: string;
  VEN_Name: string;
  TLT_No: string;
  Talent_Id: number;
  Org_Id: string;
  TLT_Name: string;
  TLT_BDate: string;
  TLT_EDate: string;
  Return_EDate: string;
  Return_Get_Person: string;
  Remark: string;
}

/** 新增 Request 介面 (同明細欄位，但包含 update_type) */
export interface FIN35010InsertRequest extends FIN35010DetailResponse {
  update_type: string;
}

/** 更新 Request 介面 (同明細欄位，但包含 update_type) */
export interface FIN35010UpdateRequest extends FIN35010DetailResponse {
  update_type: string;
}

/** 新增/更新/刪除操作回傳的 ID */
export interface FIN35010ModifyResult {
  Id: number;
}

@Injectable({
  providedIn: 'root'
})
export class Fin35010Service {
  apiUrl: string = environment.ApiUrl + '/FIN0000/ARS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢存入保證金主列表
   * @param body 查詢條件
   */
  queryFIN35010(body: FIN35010QueryRequest): Observable<ApiResponse<FIN35010Response[]>> {
    return this.http.post<ApiResponse<FIN35010Response[]>>(`${this.apiUrl}/queryFIN35010`, body);
  }

  /**
   * 查詢存入保證金明細
   * @param body 包含 Id 的請求
   */
  queryFIN35010Detail(body: { Id: number }): Observable<ApiResponse<FIN35010DetailResponse>> {
    return this.http.post<ApiResponse<FIN35010DetailResponse>>(`${this.apiUrl}/queryFIN35010Detail`, body);
  }

  /**
   * 新增存入保證金資料
   * @param body 包含新增資料的陣列
   */
  insertFIN35010(body: FIN35010InsertRequest): Observable<ApiResponse<FIN35010ModifyResult[]>> {
    // 註：Swagger 回傳的 Data 是 FIN35010ModifyResult[]
    return this.http.post<ApiResponse<FIN35010ModifyResult[]>>(`${this.apiUrl}/insertFIN35010`, body);
  }

  /**
   * 更新存入保證金資料
   * @param body 包含更新資料的陣列
   */
  updateFIN35010(body: FIN35010UpdateRequest): Observable<ApiResponse<FIN35010ModifyResult[]>> {
    // 註：Swagger 回傳的 Data 是 FIN35010ModifyResult[]
    return this.http.post<ApiResponse<FIN35010ModifyResult[]>>(`${this.apiUrl}/updateFIN35010`, body);
  }
}
