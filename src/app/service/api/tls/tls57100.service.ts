import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QueryTLS57100Request {
  ReportType: '明細' | '彙總';
  HOS_No?: string[];
  LOGO_No?: string[];
  VEN_No?: string;
  ODM_Date_Start?: string;
  ODM_Date_End?: string;
  APRV_Date_Start?: string;
  APRV_Date_End?: string;
  ODM_Type?: number[];
  Status?: string[];
  ODM_No?: string;
  pageIndex: number; // 當前頁碼
  pageSize: number; // 每頁顯示的數量
  SortBy?: SortMeta[]; // 排序欄位
}

export interface QueryTLS57100DetailResponse {
  TypeOrder: string;
  HOS_No?: string;
  HOS_NAME?: string;
  LOGO_No?: string;
  LOGO_CH_NAME?: string;
  ODM_Date: string;
  APRV_Date?: string;
  ODM_No: string;
  ODM_Type: string;
  ODM_Status: string;
  ODD_ConfirmQty?: number;
  PLU_MagNo?: string;
  PLU_Name?: string;
  ODD_SalePrc?: number;
  ODD_SaleAmt?: number;
  ODD_BuyNet?: number;
  ODD_BuyTax?: number;
  ODD_BuyAmt?: number;
}

export interface QueryTLS57100SummaryResponse {
  TypeOrder: string;
  HOS_No?: string;
  HOS_NAME?: string;
  LOGO_No?: string;
  LOGO_CH_NAME?: string;
  ODM_Date: string;
  APRV_Date?: string;
  ODM_No: string;
  ODM_Type: string;
  ODM_Status: string;
  ODD_ConfirmQty?: number;
  ODD_SalePrc?: number;
  ODM_TotalSaleAmt?: number;
  ODM_TotalBuyNet?: number;
  ODM_TotalBuyTax?: number;
  ODM_TotalBuyAmt?: number;
}

export interface QueryTLS57100ApiResponse {
  DetailData?: QueryTLS57100DetailResponse[];
  SummaryData?: QueryTLS57100SummaryResponse[];
  GrandTotal?: QueryTLS57100DetailResponse;
  SummaryTotal?: QueryTLS57100SummaryResponse;
}

@Injectable({
  providedIn: 'root'
})
export class Tls57100Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS57100`;

  constructor(private http: HttpClient) { }

  queryTLS57100(request: QueryTLS57100Request): Observable<any> {
    return this.http.post<ApiResponse<QueryTLS57100ApiResponse>>(`${this.apiUrl}/queryTLS57100`, request).pipe(
      map(res => {
        const data = request.ReportType === '明細' ? res.Data.DetailData : res.Data.SummaryData;
        return {
          Data: data,
          TotalCount: res.TotalCount,
          Message: res.Message,
          GrandTotal: request.ReportType === '明細' ? res.Data.GrandTotal : res.Data.SummaryTotal,
        };
      })
    );
  }

  exportTLS57100PDF(
    body: QueryTLS57100Request
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportTLS57100PDF`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }

  exportTLS57100Excel(
    body: QueryTLS57100Request
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportTLS57100Excel`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
}
