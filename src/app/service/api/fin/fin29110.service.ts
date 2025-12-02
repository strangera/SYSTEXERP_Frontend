import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

// ==== 主表每列型別（對應 SP_FIN29110Query 回傳欄位） ====
export interface Fin29110Row {
  VendorNo: string;        // 廠商代號
  LTYPE_NAME: string;      // 廠商名稱（來源欄位）

  Overdue_Over301Days: number;
  Overdue_241_300_Days: number;
  Overdue_181_240_Days: number;
  Overdue_121_180_Days: number;
  Overdue_61_120_Days: number;
  Overdue_0_60_Days: number;

  NotDue_Over301Days: number;
  NotDue_241_300_Days: number;
  NotDue_181_240_Days: number;
  NotDue_121_180_Days: number;
  NotDue_61_120_Days: number;
  NotDue_0_60_Days: number;

  SumAmount: number;       // 總計

  [key: string]: any;
}


// ==== 主表 Request 型別（對應 SP_FIN29110Query 參數） ====
export interface Fin29110Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];

  /** 新增：後端有定義 */
  OrderBy?: string | null;
  Offset?: number | null;

  AnalysisDate?: string;
  BucketDays?: number;
  Periods?: number;
  DateType?: string;
  PayDate?: string;
  DueFlag?: string;
  RefDateFrom?: string;
  RefDateTo?: string;
  VEN_No_From?: string;
  VEN_No_To?: string;

  [key: string]: any;
}
// ==== 明細每列型別（對應 SP_FIN29110QueryDetail 回傳欄位） ====
export interface Fin29110DetailRow {
  RowNo: number;              // 序號
  ACP_No: string;             // 應付ID
  STO_No: string;             // 組織代號
  ACP_YYYYMM: string;         // 帳款年月
  ACP_TermNo: number;         // 帳款帳次
  ACP_Amt: number;            // 應付金額
  PTA_Amt: number;            // 沖帳金額
  ACP_BalanceAmt: number;     // 應付帳款餘額
  ACP_Date: string;           // 立帳日期
  ACP_ExpectPayDate: string;  // 預計付款日
  VEN_No: string;             // 廠商代號
  VEN_Name: string;           // 廠商名稱
  VEN_Uniform: string;        // 統一編號
  AccNo: string;              // 會計科目代號
  ACP_SourceNo: string;       // 帳款來源單號
  VouNo: string;              // 傳票號碼
  Status: string;             // 狀態
  AgeDays: number;            // 帳齡天數
  [key: string]: any;
}

// ==== 明細 Request 型別（對應 SP_FIN29110QueryDetail 參數） ====
export interface Fin29110DetailRequest {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];

  OrderBy?: string | null;
  Offset?: number | null;

  AnalysisDate: string;
  BucketDays: number;
  DateType: string;
  PayDate: string;
  Side: string;      // 'O' / 'N'
  BucketN: number;   // 0~5
  VEN_No?: string | null;
}

@Injectable({ providedIn: 'root' })
export class Fin29110Service {
  // 後端 Controller: /FIN0000/APS1000
  private apiUrl = `${environment.ApiUrl}/FIN0000/APS1000`;

  constructor(private http: HttpClient) {}

  /** 查詢 應付帳款帳齡分析表（主表） */
  queryFIN29110(body: Fin29110Request): Observable<ApiResponse<Fin29110Row[]>> {
    return this.http.post<ApiResponse<Fin29110Row[]>>(
      `${this.apiUrl}/queryFIN29110`,
      body
    );
  }

  /** 查詢 明細（dialog 用） */
  queryFIN29110Detail(
    body: Fin29110DetailRequest
  ): Observable<ApiResponse<Fin29110DetailRow[]>> {
    return this.http.post<ApiResponse<Fin29110DetailRow[]>>(
      `${this.apiUrl}/queryFIN29110_Detail`,
      body
    );
  }

  /** 匯出 Excel（與主表查詢條件相同，但不帶 PageIndex/PageSize） */
  exportFIN29110Excel(
    body: Fin29110Request
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportFIN29110Excel`,
      body,
      { responseType: 'blob', observe: 'response' }
    ) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF（與主表查詢條件相同，但不帶 PageIndex/PageSize） */
  exportFIN29110PDF(
    body: Fin29110Request
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportFIN29110PDF`,
      body,
      { responseType: 'blob', observe: 'response' }
    ) as Observable<HttpResponse<Blob>>;
  }
}

export { ApiResponse };
