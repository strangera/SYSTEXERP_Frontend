import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UpdateType } from '@pages/fin/fin35010/fin35010.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

/** 通用分頁排序介面 */
export interface PaginationSort {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
}

/** 查詢主列表 Request (整合分頁) */
export interface FIN35010QueryRequest extends PaginationSort {
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

/** 查詢主列表 Response Item */
export interface FIN35010Response {
  Id: number;
  CHK_No: string;
  VEN_No: string;
  VEN_Name: string;
  TLT_Name: string;
  CHK_Amt: number; // 修正：Swagger 為 CHK_Amt
  CHK_Type: string;
  Deposit_Type: string;
  CRT_Date: string;
  GuaranteeCategory: string;
  Status: string;
  Remark: string;
  CreateDate: string;
  UPD_Date: string;
  update_type: UpdateType;
  Data_Source: string;
}

/** 查詢明細 Response */
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
  TLT_BDate?: string;
  tlt_bdate: string;
  TLT_EDate?: string;
  tlt_edate: string;
  Return_EDate: string;
  Return_Get_Person: string;
  Remark: string;
}

/** 查詢專櫃 Request */
export interface FIN35010TLTRequest {
  Deposit_Type?: string;
  query_date?: string;
  tlt_no?: string;
  ven_no?: string;
  org_id?: string;
  PageSize: number;
  PageIndex: number;
  SortBy?: { field: string; order: number }[];
}

/** 查詢專櫃 Response Item */
export interface FIN35010TLTResponse {
  STO_No: string;
  Deposit_Mode: string;
  Data_Source: string;
  In_Date: string;
  Deposit_Type: string;
  CHK_Type: string;
  Status: string;
  CHK_Amt: number;//
  VEN_No: string;//
  VEN_Name: string;//
  tlt_no: string; //
  talent_id: number;
  org_id: string;
  TLT_Name: string;
  tlt_bdate: string;//
  tlt_edate: string;//
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
}

/** 新增/更新 Request (需包含 update_type) */
export interface FIN35010ModifyRequest extends Partial<FIN35010DetailResponse> {
  update_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class Fin35010Service {
  apiUrl: string = environment.ApiUrl + '/FIN0000/ARS1000';

  constructor(private http: HttpClient) { }

  /** 1. 查詢主列表 */
  queryFIN35010(body: FIN35010QueryRequest): Observable<ApiResponse<FIN35010Response[]>> {
    return this.http.post<ApiResponse<FIN35010Response[]>>(`${this.apiUrl}/queryFIN35010`, body);
  }

  /** 2. 查詢明細 */
  queryFIN35010Detail(body: { Id: number }): Observable<ApiResponse<FIN35010DetailResponse>> {
    return this.http.post<ApiResponse<FIN35010DetailResponse>>(`${this.apiUrl}/queryFIN35010Detail`, body);
  }

  /** 3. 查詢專櫃 (Swagger 新增) */
  queryFIN35010TLTTALENT(body: FIN35010TLTRequest): Observable<ApiResponse<FIN35010TLTResponse[]>> {
    return this.http.post<ApiResponse<FIN35010TLTResponse[]>>(`${this.apiUrl}/queryFIN35010TLTTALENT`, body);
  }

  /** 4. 單筆新增 */
  insertFIN35010(body: FIN35010ModifyRequest): Observable<ApiResponse<{ Id: number }[]>> {
    return this.http.post<ApiResponse<{ Id: number }[]>>(`${this.apiUrl}/insertFIN35010`, body);
  }

  /** 5. 批次新增 (Swagger 新增) */
  insertListFIN35010(body: { List: FIN35010ModifyRequest[] }): Observable<ApiResponse<{ Id: number }[]>> {
    return this.http.post<ApiResponse<{ Id: number }[]>>(`${this.apiUrl}/insertListFIN35010`, body);
  }

  /** 6. 更新 */
  updateFIN35010(body: FIN35010ModifyRequest): Observable<ApiResponse<{ Id: number }[]>> {
    return this.http.post<ApiResponse<{ Id: number }[]>>(`${this.apiUrl}/updateFIN35010`, body);
  }
}
