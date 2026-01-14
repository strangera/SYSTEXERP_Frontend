import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from './tls25030.service';

// 查詢 Request - 對齊 SP 參數
export interface TLS57190QueryRequest {
  Mode: 'S' | 'D';                // 'S'=彙總, 'D'=明細
  DateFrom: string;               // 開始日期
  DateTo: string;                 // 結束日期
  HOS_No?: string | null;         // 倉別 (SP 內為 VARCHAR(10))
  LOGO_No?: string | null;        // 品牌
  PLU_MagNo?: string | null;      // 商品管理編號
  PLU_No?: string | null;         // 國際條碼
  PLU_Name?: string | null;       // 商品名稱
}

// 報表資料 Row - 對齊 SP SELECT 輸出
export interface TLS57190Data {
  LOGO_No: string | null;         // 品牌編號
  LOGO_CH_NAME: string | null;    // 品牌名稱
  HOS_No: string | null;          // 倉別編號
  HOS_NAME: string | null;        // 倉別名稱

  // 明細模式 ('D') 才有的欄位
  PLU_MagNo?: string | null;      // 管理編號
  PLU_No?: string | null;         // 國際條碼
  PLU_Name?: string | null;       // 商品名稱

  // 數量與成本
  BeginQty: number;               // 期初數量
  BeginCost: number;              // 期初成本
  InQty: number;                  // 進貨數量
  InCost: number;                 // 進貨成本
  InRtnQty: number;               // 進退數量
  InRtnCost: number;              // 進退成本
  SaleQty: number;                // 銷貨數量
  SaleCost: number;               // 銷貨成本價(總成本)
  EndQty: number;                 // 期末數量
  EndCost: number;                // 期末成本

  AvgUnitCost: number;            // 平均單位成本
  SaleAmt: number;                // 銷貨收入(售價金額)

  // 計算欄位
  GrossProfit: number;            // 毛利
  GrossMarginPct: number;         // 毛利率 (%)
}

@Injectable({ providedIn: 'root' })
export class TLS57190Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /** 查詢存貨評價分析表 */
  queryTLS57190(req: TLS57190QueryRequest): Observable<ApiResponse<TLS57190Data[]>> {
    return this.http.post<ApiResponse<TLS57190Data[]>>(`${this.apiUrl}/queryTLS57190`, req);
  }

  /** 匯出存貨評價分析表 Excel */
  exportTLS57190Excel(body: TLS57190QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS57190Excel`, body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }

  /** 匯出存貨評價分析表 PDF */
  exportTLS57190PDF(body: TLS57190QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportTLS57190PDF`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
}
