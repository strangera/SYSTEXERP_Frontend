import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢 Request
export interface TLS57170QueryRequest extends BaseQueryRequest {
  SYS_StoreNo?: string;           // 門市編號
  STK_YM: string;                 // 存貨年月 - 必填
  HOS_No?: string;                // 倉別
  LOGO_No?: string[];             // 品牌
  PLU_MagNo?: string[];           // 商品管理編號
  PLU_No?: string;                // 國際條碼
  PLU_OrgPLUNo?: string;          // 廠商貨號
  FeeRate?: number;               // 推銷費用率, ex: 0.12
}

// 明細 Row
export interface TLS57170Data {
  VEN_No: string | null;          // 廠商編號
  VEN_Name: string | null;        // 廠商名稱
  LOGO_No: string | null;         // 品牌編號
  PLU_MagNo: string | null;       // 商品管理編號
  LOGO_CH_NAME: string | null;    // 品名
  PLU_No: string | null;          // 國際條碼
  Amt_A: number | null;           // 期末存貨售價(A)
  FeeRate_B: number | null;       // 推銷費用率(B)
  Amt_C: number | null;           // 淨變現價值(C)
  STK_UnitCost_D: number | null;  // 期末成本價(D)
  UP_PORFIT: number | null;       // 回升利益
  DOWN_COST: number | null;       // 跌價損失
}

// Response 結構（根據 API 回傳格式）
export interface TLS57170QueryResponse {
  Status: string;
  Data: Array<{
    TotalCount: number;
    QueryData: TLS57170Data[];
    payAmtTotalData: Array<{
      UP_PORFIT_Total: number;
      DOWN_COST_Total: number;
    }>;
  }>;
  Error: {
    Code: string;
    Message: string;
    Details: string;
  };
  Meta: {
    Timestamp: string;
    RequestId: string;
  };
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

@Injectable({ providedIn: 'root' })
export class TLS57170Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /** 查詢存貨評價分析表 */
  queryTLS57170(req: TLS57170QueryRequest): Observable<TLS57170QueryResponse> {
    return this.http.post<TLS57170QueryResponse>(`${this.apiUrl}/queryTLS57170`, req);
  }

  /** 匯出存貨評價分析表 Excel */
  exportTLS57170Excel(req: TLS57170QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS57170_Excel`, req, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出存貨評價分析表 PDF */
  exportTLS57170PDF(req: TLS57170QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS57170_PDF`, req, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }
}