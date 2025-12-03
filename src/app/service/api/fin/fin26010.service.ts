import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

/**
 * FIN26010 查詢匯款銀行 Response
 * 對應 FIN26010Response.queryFIN26010Response
 */
export interface Fin26010Row {
  PAM_No?: string | null;          // 匯款單號
  CRT_Date?: string | null;        // 建立日期
  RMT_Date?: string | null;        // 匯款日期
  ACCNO?: string | null;           // 銀行代號(APS3007.BNK_id=GLS1005.ACCNO)
  ACCCNAME?: string | null;        // 銀行名稱(GLS1005.ACCCNAME)
  BNK_No?: string | null;          // 全省銀行代號(BNK_No+BNK_BranchNo)
  BNK_BRANCHNAME?: string | null;  // 全省銀行名稱

  // 若後端日後補回 Status / VouNo / File_Name / id 等欄位，可在這裡加 optional 欄位
  [key: string]: any;
}

/**
 * FIN26010 主表查詢 Request 型別
 * 對應 FIN26010Request.queryFIN26010Request
 */
export interface Fin26010Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];

  PamNo?: string;        // 匯款單號
  CRT_DateFrom?: string; // 建立日期(起)
  CRT_DateTo?: string;   // 建立日期(迄)
  RMT_DateFrom?: string; // 匯款日期(起)
  RMT_DateTo?: string;   // 匯款日期(迄)
  BNK_id?: string;       // 銀行代號(公司銀行科目代號)
  Status?: string;       // 拋轉傳票(Y/N)
  VouNo?: string;        // 傳票編號
  File_Name?: string;    // 檔案名稱

  [key: string]: any;
}

/**
 * 產生匯款檔 Request 型別
 * （目前仍沿用 IdList，等後端正式規格再調整）
 */
export interface Fin26010GenerateRequest {
  IdList: number[];     // APS3007.id 集合
  RMT_DateFrom: string; // 匯款日期起
  RMT_DateTo: string;   // 匯款日期迄
  BNK_id: string;       // 銀行代號
}

/**
 * 銀行代號下拉 Response
 * 對應 APS1002_GLS1005_APS1004_DownListResponse
 */
export interface Aps1002BankDropDownRow {
  BNK_DepositAccNo: string; // 公司銀行科目代號 (對應 BNK_id)
  ACCCNAME: string;         // 科目名稱
  BNK_No: string;           // 銀行代號
  BNK_BRANCHNAME: string;   // 銀行名稱
}

@Injectable({ providedIn: 'root' })
export class Fin26010Service {
  /**
   * 依後端 namespace（FIN0000.APS1000）推斷 Controller 路徑為 /FIN0000/APS1000
   * 若實際 Controller Route 不同，再調整這裡即可。
   */
  private apiUrl = `${environment.ApiUrl}/FIN0000/APS1000`;

  constructor(private http: HttpClient) {}

  /** 查詢匯款銀行主表 (APS3007) */
  queryFIN26010(body: Fin26010Request): Observable<ApiResponse<Fin26010Row[]>> {
    return this.http.post<ApiResponse<Fin26010Row[]>>(
      `${this.apiUrl}/queryFIN26010`,
      body
    );
  }

  /** 產生匯款檔：實作依後端規格為準 */
  generateRemitFile(
    body: Fin26010GenerateRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/generateFIN26010RemitFile`,
      body
    );
  }

  /** 銀行代號下拉：/queryAPS1002_DropDownList，POST {} */
  queryAPS1002DropDownList(): Observable<ApiResponse<Aps1002BankDropDownRow[]>> {
    return this.http.post<ApiResponse<Aps1002BankDropDownRow[]>>(
      `${environment.ApiUrl}/queryAPS1002_DropDownList`,
      {}
    );
  }
}

export { ApiResponse };
