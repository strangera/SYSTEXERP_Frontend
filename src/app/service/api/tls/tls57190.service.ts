import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 1. 修正 Request Interface，對齊 Swagger 欄位名稱
export interface TLS57190QueryRequest {
  ShowType: 'M' | 'D';           // SP 參數：@Mode，'M'=彙總, 'D'=明細
  DateFrom: string;
  DateTo: string;
  HOS_NO?: string | null;     // SP 參數：@HOS_No (注意大小寫)
  LOGO_No?: string | null;    // SP 參數：@LOGO_No
  PLU_MagNo?: string | null;
  PLU_No?: string | null;
  PLU_Name?: string | null;
  PageSize?: number;
  PageIndex?: number;
}

// 2. 修正 Data Interface，對齊 Swagger 輸出
export interface TLS57190Data {
  LOGO_No: string | null;
  LOGO_CH_NAME: string | null;
  PLU_MagNo?: string | null;
  PLU_No?: string | null;
  PLU_Name?: string | null;
  BeginQty: number;
  BeginCost: number;
  InQty: number;
  InCost: number;
  InRtnQty: number;
  InRtnCost: number;
  SaleQty: number;
  SaleCost: number;
  TXN_Net: number;             // Swagger 有此欄位
  EndQty: number;
  EndCost: number;
  EndSalePrcNet: number;       // Swagger 有此欄位
  EndSalePrc: number;          // Swagger 有此欄位
  AvgUnitCost: number;
  SaleAmt: number;
  GrossProfit: number;
  GrossMarginPct: string;      // Swagger 定義為 string (例如 "25.5%")
  TotalCount?: number;
  SortNo?: number;
}

@Injectable({ providedIn: 'root' })
export class TLS57190Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /** 查詢每日商品進銷存報表 */
  queryTLS57190(req: TLS57190QueryRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS57190`, req).pipe(
      map(res => {
        if (res.Data) {
          return {
            ...res,
            Data: res.Data.Datas as TLS57190Data[],
            SumData: res.Data.SumData as TLS57190Data,
            TotalCount: res.Data.SumData?.TotalCount || 0
          };
        }
        return res;
      })
    );
  }

  /** 匯出每日商品進銷存報表 Excel */
  exportTLS57190Excel(body: TLS57190QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS57190`, body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }

  /** 匯出每日商品進銷存報表 PDF */
  exportTLS57190PDF(body: TLS57190QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS57190PDF`, body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
}
