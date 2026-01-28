import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

/**
 * FIN26010 查詢匯款銀行 Response
 * 對應 FIN26010Response.queryFIN26010Response
 */
export interface Fin26010Row {
  WSLIP_NO?: string | null;        // 匯款單號
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

  WSLIP_NO?: string;     // 匯款單號
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
 * 匯出 FIN26010 TXT 檔 Request 型別
 * 對應 API: /ExportLabel/ExportFIN26010TXT
 *
 * body:
 * {
 *   "WSLIP_NOList": ["xxx", "yyy"]
 * }
 */
export interface ExportFin26010TxtRequest {
  WSLIP_NOList: string[];
}

/**
 * 銀行代號下拉 Response
 * 對應 APS1002_GLS1005_APS1004_DownListResponse
 */
export interface Aps1002BankDropDownRow {
  BNK_DepositAccNo: string; // 公司銀行科目代號 (對應 BNK_id)
  BNK_AccName: string;         // 科目名稱
  BNK_No: string;           // 銀行代號
  BNK_BRANCHNAME: string;   // 銀行名稱
  BNK_id: string;         // 銀行代號 (同 BNK_DepositAccNo) 
}

@Injectable({ providedIn: 'root' })
export class Fin26010Service {
  /**
   * 依後端 namespace（FIN0000.APS1000）推斷 Controller 路徑為 /FIN0000/APS1000
   * 若實際 Controller Route 不同，再調整這裡即可。
   *
   * ⚠ 匯出 TXT 不走這個 Route，另用 /ExportLabel/ExportFIN26010TXT
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

  /**
   * 匯出 FIN26010 TXT 檔
   * API: POST /ExportLabel/ExportFIN26010TXT
   * body: { WSLIP_NOList: string[] }
   *
   * 注意：這個 API 開頭沒有 /FIN0000/APS1000
   */
  exportFIN26010TXT(
    body: ExportFin26010TxtRequest
  ): Observable<HttpResponse<Blob>> {
    const url = `${environment.ApiUrl}/ExportLabel/ExportFIN26010TXT`;
    return this.http.post(url, body, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  /** 銀行代號下拉：/queryAPS1002_DropDownList，POST {} */
  queryAPS1002DropDownList(): Observable<ApiResponse<Aps1002BankDropDownRow[]>> {
    return this.http.post<ApiResponse<Aps1002BankDropDownRow[]>>(
      `${environment.ApiUrl}/FIN0000/APS1000/queryBankAccount`,
      {}
    );
  }
}

export { ApiResponse };
