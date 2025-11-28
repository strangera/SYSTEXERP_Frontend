import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

/**
 * FIN26010 匯款銀行
 *
 * 主檔 APS3007 對應列型別
 */
export interface Fin26010Row {
  id: number;            // APS3007.id 流水號
  mid: number;           // APS3007.mid 群組識別
  STO_No: string;        // 分店編號
  PAM_No: string;        // 匯款單號 (A+YYYYMMDDxxx)
  RMT_Date: string;      // 匯款日期
  BNK_id: string;        // 帳戶編號 (銀行代號)
  BNK_No: string;        // 匯款銀行代碼
  BNK_BranchNo: string;  // 匯款銀行分行代號
  BNK_AccNo: string;     // 匯款帳號
  gls3001_id?: number | null; // 傳票主檔 ID
  VouNo?: string | null;      // 傳票編號
  Status?: string | null;     // 狀態 (Y/N)
  File_Name?: string | null;  // 電匯檔案名稱
  CRT_Date?: string | null;   // 建立日期
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;

  [key: string]: any;
}

/**
 * FIN26010 主表查詢 Request 型別
 * （實際參數名稱可依 SP 設計後再調整）
 */
export interface Fin26010Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];

  PAM_No?: string;          // 匯款單號
  CRT_DateFrom?: string;    // 建立日期(起)
  CRT_DateTo?: string;      // 建立日期(迄)
  RMT_DateFrom: string;     // 匯款日期(起) ＊必填
  RMT_DateTo: string;       // 匯款日期(迄) ＊必填
  BNK_id: string;           // 銀行代號(帳戶編號) ＊必填
  BNK_Name?: string;        // 銀行名稱(如有需要)
  TossSummon?: string | null; // 拋轉傳票（例如 'Y' / 'N'）
  VouNo?: string;           // 傳票編號
  File_Name?: string;       // 檔案名稱

  [key: string]: any;
}

/**
 * 產生匯款檔 Request 型別
 * 實際欄位可依後端設計再補
 */
export interface Fin26010GenerateRequest {
  IdList: number[];     // APS3007.id 之集合（選取列）
  RMT_DateFrom: string; // 匯款日期起
  RMT_DateTo: string;   // 匯款日期迄
  BNK_id: string;       // 銀行代號
}

/**
 * 如未來需要明細(APS3008)，可以先定義
 */
export interface Fin26010DetailRow {
  id: number;
  mid: number;
  STO_No: string;
  PAM_No: string;
  RMT_Item: number;
  VEN_No?: string | null;
  ACP_YYYYMM?: string | null;
  ACP_Amt?: number | null;
  RMT_Amt: number;
  RMT_Fee: number;
  RMT_BnkNo?: string | null;
  RMT_BnkBranchNo?: string | null;
  RMT_BnkAccNo?: string | null;
  RMT_BnkAccName?: string | null;
  COMP_WIRE_FEE: number;
  CASH_BACK_AMT: number;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;

  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class Fin26010Service {
  /**
   * 後端 Controller 路徑先預設成 /FIN0000/APS3000
   * 實際完成後端時再調整
   */
  private apiUrl = `${environment.ApiUrl}/FIN0000/APS3000`;

  constructor(private http: HttpClient) {}

  /** 查詢匯款銀行主表 (APS3007) */
  queryFIN26010(body: Fin26010Request): Observable<ApiResponse<Fin26010Row[]>> {
    return this.http.post<ApiResponse<Fin26010Row[]>>(
      `${this.apiUrl}/queryFIN26010`,
      body
    );
  }

  /** 產生匯款檔：產生檔案 & 更新 APS3008 檔名，實作留給後端 */
  generateRemitFile(
    body: Fin26010GenerateRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/generateFIN26010RemitFile`,
      body
    );
  }

  // 如未來需要匯出 Excel / PDF，可再補類似 FIN29110 的 export API
}

export { ApiResponse };
