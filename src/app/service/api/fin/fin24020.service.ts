import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// ============================================================================
// ✨ 應付作業 FIN24020 相關強型態介面 (Interface) 定義
// ============================================================================

/** 1. 查詢請求引數 (對齊後端 queryFIN24020Request) */
export interface IQueryFIN24020Request {
  ACP_No?: string | null;
  VEN_No?: string | null;
  ACP_YYYYMM?: string | null;
  Acp_TermNo?: number | null;
  RetDate_From?: string | Date | null;
  RetDate_To?: string | Date | null;
  RetAmt_From?: number | null;
  RetAmt_To?: number | null;
  PayGenerated?: string | null;
  Remark?: string | null;
  PageIndex?: number | null;
  PageSize?: number | null;
}

/** 2. 查詢回傳：明細資料列 (對齊後端 queryFIN24020ResponseDetail) */
export interface IQueryFIN24020ResponseDetail {
  SeqNo: number;
  ACP_No: string;
  ACP_YYYYMM: string;
  acp_termno: number;
  VEN_No: string;
  VEN_Name: string;
  ACP_Amt: number;
  ACP_BalanceAmt: number;
  ACP_ReserveAmt: number;
  RET_Amt: number;
  RET_Date: string | null; // 格式通常為 yyyy-MM-dd
  STATUS: string;          // Y / N
  Remark: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  RET_CRT_Date: string;
  RET_CRT_USR_No: string;
  RET_CRT_USR_Name: string;
  TotalCount: number;
}

/** 3. 查詢回傳：主檔打平與 Details 併行結構 (對齊後端 queryFIN24020Response) */
export interface IQueryFIN24020Response {
  ACP_No: string;
  VEN_No: string;
  VEN_Name: string;
  ACP_YYYYMM: string;
  ACP_ReserveAmt: number;
  acp_termno: number;
  ACP_Amt: number;
  ACP_Date: string | null; // 格式通常為 yyyy-MM-dd
  ACP_BalanceAmt: number;
  RET_Date: string | null; // 格式通常為 yyyy-MM-dd
  Details: IQueryFIN24020ResponseDetail[];
}

/** 4. 新增/修改明細列請求 (對齊後端 createFIN24020RequestItem) */
export interface ISaveFIN24020RequestItem {
  ACP_No: string;
  ACP_YYYYMM: string;
  acp_termno: number;
  RET_Date: string | null; // 格式為 yyyy-MM-dd
  RET_Amt: number;
  STATUS: string;
  Remark?: string | null;
}

/** 5. 新增/修改主請求載體 (對齊後端 createFIN24020Request / updateFIN24020Request) */
export interface ISaveFIN24020Request {
  ACP_No: string;
  VEN_No: string;
  VEN_Name: string;
  ACP_Amt: number;
  ACP_Date: string | null; // 格式為 yyyy-MM-dd
  ACP_ReserveAmt: number;
  Items: ISaveFIN24020RequestItem[];
}

/** 6. Excel 匯出回傳載體 (對齊後端 queryForExportFIN24020Response) */
export interface IQueryForExportFIN24020Response {
  Details: {
    ACP_No: string;
    VEN_No: string;
    VEN_Name: string;
    ACP_YYYYMM: string;
    acp_termno: number;
    ACP_Amt: number;
    ACP_BalanceAmt: number;
    ACP_ReserveAmt: number;
    RET_Amt: number;
    RET_Date: string;
    STATUS: string;
  }[];
}

// ============================================================================
// ⚙️ Angular Service 實作
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class Fin24020Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private readonly http: HttpClient) { }

  /**
   * 查詢保留款沖款維護清單 (打平巢狀結構)
   */
  queryFIN24020(params: IQueryFIN24020Request): Observable<ApiResponse<IQueryFIN24020Response[]>> {
    return this.http.post<ApiResponse<IQueryFIN24020Response[]>>(`${this.apiUrl}/queryFIN24020`, params);
  }

  /**
   * 建立全新保留款沖款主與明細資料
   */
  createFIN24020(params: ISaveFIN24020Request): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/createFIN24020`, params);
  }

  /**
   * 修改/更新既存保留款沖款主與明細資料 (支援清空明細)
   */
  updateFIN24020(params: ISaveFIN24020Request): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/updateFIN24020`, params);
  }

  /**
   * 查詢用於 Excel 匯出的扁平化清單
   */
  queryForExportFIN24020(params: IQueryFIN24020Request): Observable<ApiResponse<IQueryForExportFIN24020Response>> {
    return this.http.post<ApiResponse<IQueryForExportFIN24020Response>>(`${this.apiUrl}/queryForExportFIN24020`, params);
  }
}
