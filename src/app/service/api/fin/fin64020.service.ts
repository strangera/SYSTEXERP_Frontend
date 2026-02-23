import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** ========== Query (列表) ========== */
export interface QueryFIN64020Request {
  PageSize?: number | null;
  PageIndex?: number | null;
  SortBy?: SortMeta[] | null;

  CompanyAccNoList?: string[] | null;
  ExpireDateFrom?: string | null;
  ExpireDateTo?: string | null;
  ChkNo?: string | null;
  VouNoExpire?: string | null;
  ChkStatus?: string | null;
}

export interface QueryFIN64020Row {
  SEQ_NO: number,
  ID: number,
  CHK_No: string,
  VEN_No: string,
  VEN_Name: string,
  BNK_No: string,
  BNK_Name: string,
  CHK_ExpireDate: string,
  CHK_Amt: number,
  CHK_BNK_No: string,
  VouNo_Expire: string,
  CHK_Status: string,
  CHK_Status_Name: string,
  IsSelectable: string
}

/** ========== Update (執行託收更新) ========== */
export interface Fin64020UpdateRequest {
  IdList: number[];        // 對應後端的 decimal array
  ColleDate: string;       // 託收日期
  BNK_No: string;          // 銀行代碼
  BNK_BranchNo: string;    // 分行代碼
}

@Injectable({ providedIn: 'root' })
export class Fin64020Service {
  // 修正後的 API 路徑
  private apiUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;

  constructor(private http: HttpClient) { }

  /** 查詢應收票據託收作業清單 */
  queryFIN64020(body: QueryFIN64020Request): Observable<ApiResponse<QueryFIN64020Row[]>> {
    return this.http.post<ApiResponse<QueryFIN64020Row[]>>(
      `${this.apiUrl}/queryFIN64020`,
      body
    );
  }

  /** 執行應收票據託收更新 */
  updateFIN64020(body: Fin64020UpdateRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/updateFIN64020`,
      body
    );
  }
}


