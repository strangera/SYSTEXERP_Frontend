import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

/** 查詢結果每列：對應 SP_FIN32020Query 的 SELECT 欄位 */
export interface Fin32020Row {
  AdjustNo: string;          // 調整單號 (H.ADJ_No)
  AdjustDate: string;        // 調整日期 (H.ADJ_Date)
  AdjustRemark?: string | null; // 備註 (H.Remark)

  ARS_No: string;            // 應收帳款單號 (D.ARS_No)
  AdjustAccNo: string;       // 調整科目 (D.AccNo)
  AdjustAmt: number;         // 調整金額 (D.ADJ_Amt)

  VouNo?: string | null;     // 傳票編號 (ISNULL(H.VouNo, D.VouNo))

  [key: string]: any;
}

/** 查詢 Request：對應 SP_FIN32020Query 的參數 */
export interface Fin32020QueryRequest {
  ADJ_No?: string | null;         // 調整單號
  ADJ_Date_From?: string | null;  // 調整日期起 yyyy-MM-dd
  ADJ_Date_To?: string | null;    // 調整日期迄 yyyy-MM-dd
  Remark?: string | null;         // 備註 (模糊)
  VouNo_From?: string | null;     // 傳票編號起
  VouNo_To?: string | null;       // 傳票編號迄

  // 若之後有做分頁/排序，可以一起傳給後端（不一定要用）
  PageIndex?: number;
  PageSize?: number;
  SortBy?: { field: string; order: number }[];
  OrderBy?: string | null;
  Offset?: number | null;

  [key: string]: any;
}

/** 明細 TVP：對應 FIN32010AdjDetailType（給 CRU 用，這裡先保留） */
export interface Fin32020DetailItem {
  SeqNo: number;
  AccNo: string;
  ADJ_Amt: number;
  Remark?: string | null;
  ARS_No: string;
}

/** 新增/修改 Request：對應 SP_FIN32020Add / SP_FIN32020Update（給 CRU 用） */
export interface Fin32020SaveRequest {
  STO_No: string;
  ADJ_No: string;
  ADJ_Date: string;                // yyyy-MM-dd
  AdjRemark?: string | null;
  VouNo?: string | null;
  gls3001_id?: number | null;

  DetailList: Fin32020DetailItem[];

  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

/** 調整科目清單：對應 SP_FIN32020GetAdjAcc（給 CRU 下拉用） */
export interface Fin32020AdjAccRow {
  CAR_AccNo: string;
  CAR_type: string;
  Remark?: string | null;
}

/** GetARS 查回的應收單：對應 SP_FIN32020GetARS（給 CRU 用） */
export interface Fin32020ARSRow {
  ARS_No: string;       // 應收帳款單號
  CustNo: string;       // 廠客代號
  ARS_Date: string;     // 立帳日
  PTA_Date: string;     // 預計收款日
  ARS_Amt: number;      // 應收金額
  NoteDesc?: string | null; // 備註
}

export interface Fin32020GetARSRequest {
  CustNo?: string | null;
  ARS_No?: string | null;
}

@Injectable({ providedIn: 'root' })
export class FIN32020Service {
  /**
   * 這裡先假設 Controller 會做在 /FIN0000/ARS3000
   * 之後後端實作好，如果路徑不同，改這個就好
   */
  private apiUrl = `${environment.ApiUrl}/FIN0000/ARS3000`;

  constructor(private http: HttpClient) {}

  /** 查詢應收帳款調整作業列表 (SP_FIN32020Query) */
  queryFIN32020(
    body: Fin32020QueryRequest
  ): Observable<ApiResponse<Fin32020Row[]>> {
    return this.http.post<ApiResponse<Fin32020Row[]>>(
      `${this.apiUrl}/queryFIN32020`,
      body
    );
  }

  /** 新增 (SP_FIN32020Add) — 給 CRU 用，先保留 */
  addFIN32020(
    body: Fin32020SaveRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/addFIN32020`,
      body
    );
  }

  /** 修改 (SP_FIN32020Update) — 給 CRU 用，先保留 */
  updateFIN32020(
    body: Fin32020SaveRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/updateFIN32020`,
      body
    );
  }

  /** 取得調整科目清單 (SP_FIN32020GetAdjAcc) — 給 CRU 用，先保留 */
  getAdjAcc(): Observable<ApiResponse<Fin32020AdjAccRow[]>> {
    return this.http.post<ApiResponse<Fin32020AdjAccRow[]>>(
      `${this.apiUrl}/getFIN32020AdjAcc`,
      {}
    );
  }

  /** 查詢未產生傳票的應收帳款 (SP_FIN32020GetARS) — 給 CRU 用，先保留 */
  getARS(
    body: Fin32020GetARSRequest
  ): Observable<ApiResponse<Fin32020ARSRow[]>> {
    return this.http.post<ApiResponse<Fin32020ARSRow[]>>(
      `${this.apiUrl}/getFIN32020ARS`,
      body
    );
  }
}

export { ApiResponse };
