import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** --- Interfaces --- **/

// 通用的 Detail 請求介面
export interface TLS57190DetailRequest {
  PageSize?: number;
  PageIndex?: number;
  DateFrom: string;
  DateTo: string;
  HOS_NO?: string | null;
  LOGO_No?: string | null;
  PLU_MagNo?: string | null;
  PLU_No?: string | null;
  PLU_Name?: string | null;
  ShowType: string;
}

// 1. 修正 Request Interface (原始報表)
export interface TLS57190QueryRequest {
  ShowType: 'M' | 'D' | 'A';
  DateFrom: string;
  DateTo: string;
  HOS_NO?: string | null;
  LOGO_No?: string | null;
  PLU_MagNo?: string | null;
  PLU_No?: string | null;
  PLU_Name?: string | null;
  PageSize?: number;
  PageIndex?: number;
}

// 2. 修正 Data Interface (原始報表)
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
  TXN_Net: number;
  EndQty: number;
  EndCost: number;
  EndSalePrcNet: number;
  EndSalePrc: number;
  AvgUnitCost: number;
  SaleAmt: number;
  GrossProfit: number;
  GrossMarginPct: string;
  TotalCount?: number;
  SortNo?: number;
}

// 3. 每日商品進銷存異動明細報表_第一層 Data Interface
export interface TLS57190DetailMasterData {
  VEN_No: string | null;
  VEN_Name: string | null;
  SYS_StoreNo: string | null;
  HOS_No: string | null;
  HOS_NAME: string | null;
  LOGO_No: string | null;
  LOGO_CH_NAME: string | null;
  PLU_MagNo: string | null;
  PLU_Name: string | null;
  TotalCount: number;
}

// 4. 每日商品進銷存異動明細報表 Data Interface
export interface TLS57190DetailData {
  VEN_No: string | null;
  VEN_Name: string | null;
  DocDate: string | null;
  STK_TYPE: string | null;
  DocNo: string | null;
  SYS_StoreNo: string | null;
  HOS_No: string | null;
  HOS_NAME: string | null;
  PLU_MagNo: string | null;
  PLU_Name: string | null;
  MoveDate: string | null;
  MoveQty: number;
  StockQty: number;
  SalePrice: number;
  SaleChangeAmt: number;
  SaleStockAmt: number;
  UnitCost: number;
  CostChangeAmt: number;
  CostStockAmt: number;
  RowType: string | null;
}

/** --- Service --- **/

@Injectable({ providedIn: 'root' })
export class TLS57190Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /** 1. 查詢每日商品進銷存報表 (原本的) */
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

  /** 2. 查詢每日商品進銷存異動明細報表_第一層 */
  queryTLS57190Detail_Master(req: TLS57190DetailRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS57190Detail_Master`, req).pipe(
      map(res => {
        if (res.Data) {
          return {
            ...res,
            Data: res.Data.Datas as TLS57190DetailMasterData[]
          };
        }
        return res;
      })
    );
  }

  /** 3. 查詢每日商品進銷存異動明細報表 (第二層) */
  queryTLS57190Detail(req: TLS57190DetailRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS57190Detail`, req).pipe(
      map(res => {
        if (res.Data) {
          return {
            ...res,
            Data: res.Data.Datas as TLS57190DetailData[]
          };
        }
        return res;
      })
    );
  }

  /** 4. 匯出每日商品進銷存異動明細報表 Excel */
  exportTLS57190DetailExcel(body: TLS57190DetailRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS57190Detail`, body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }

  /** 5. 匯出每日商品進銷存異動明細報表 PDF */
  exportTLS57190DetailPDF(body: TLS57190DetailRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS57190DetailPDF`, body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }

  /** 原有的匯出方法保留 */
  exportTLS57190Excel(body: TLS57190QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS57190`, body, { observe: 'response', responseType: 'blob' });
  }

  exportTLS57190PDF(body: TLS57190QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS57190PDF`, body, { observe: 'response', responseType: 'blob' });
  }
}
