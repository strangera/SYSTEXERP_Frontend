import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** ========== 1.6.4 應收票據兌現作業 (FIN64030) ========== */

/** 查詢 Request */
export interface QueryFIN64030Request {
  PageSize?: number | null;
  PageIndex?: number | null;
  SortBy?: SortMeta[] | null;
  CompanyAccNoList?: string[] | null;
  ExpireDateFrom?: string | null;
  ExpireDateTo?: string | null;
  ChkNo?: string | null;
  // --- 根據 SP 補上缺失的查詢欄位 ---
  VouNoExpire?: string | null; // 到期傳票編號(模糊)
  ChkStatus?: string | null;   // 狀態(0~5)
}

/** 查詢結果 Row (完整對應 SP_FIN64030Query 欄位) */
export interface QueryFIN64030Row {
  SEQ_NO: number;
  ID: number;
  CHK_No: string;
  VEN_No: string;
  VEN_Name: string;
  BNK_No: string;
  BNK_Name: string;
  CHK_ExpireDate: string;
  CHK_Amt: number;
  CHK_BNK_No: string;
  VouNo_Expire: string;    // 對應 SP 的 A4.VouNo_received
  CHK_Status: string;
  CHK_Status_Name: string;
  IsSelectable: string;
  // --- 補上 SP 新增的託收檔 (ARS4006) 資訊 ---
  ARS4006_ID?: number;
  Colle_BNK_No?: string;
  Colle_BNK_BranchNo?: string;
  Colle_BNK_AccNo?: string;
  ColleDate?: string;      // 託收日
  Colle_Tran_Status?: string;
  Colle_Comment?: string;
}

/** 兌現更新 Request */
export interface Fin64030UpdateRequest {
  IdList: number[];    // 勾選的資料 ID 清單
  CashDate: string;    // 兌現日期
}

/** 兌現更新成功回傳結果 (包含傳票資訊) */
export interface Fin64030UpdateResponse {
  CashUpdatedCount: number;
  VouNo: string;
  GLS3001_ID: number;
  VoucherProcessedCount: number;
  VoucherTotalAmt: number;
}

@Injectable({ providedIn: 'root' })
export class Fin64030Service {
  // API 路徑比照 64020
  private apiUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;

  constructor(private http: HttpClient) { }

  /** * 1.6.4 應收票據兌現作業 - 查詢清單
   */
  queryFIN64030(body: QueryFIN64030Request): Observable<ApiResponse<QueryFIN64030Row[]>> {
    return this.http.post<ApiResponse<QueryFIN64030Row[]>>(
      `${this.apiUrl}/queryFIN64030`,
      body
    );
  }

  /** * 1.6.4 應收票據兌現更新 - 執行兌現 (含自動拋轉傳票)
   */
  updateFIN64030(body: Fin64030UpdateRequest): Observable<ApiResponse<Fin64030UpdateResponse>> {
    return this.http.post<ApiResponse<Fin64030UpdateResponse>>(
      `${this.apiUrl}/updateFIN64030`,
      body
    );
  }
}
