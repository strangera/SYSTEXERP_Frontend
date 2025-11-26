import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QueryTLS57050Request {
  ReportType: string,
  TXN_Date_Start?: string,
  TXN_Date_End?: string,
  LOGO_No: string,
  VEN_No: string,
  ECR_No: string,
  TXN_SaleNoteNo: string,
  TXN_No: number,
  PLU_MagNo: string,
  PLU_No: string,
  PLU_OrgPLUNo: string,
  pageIndex: number,
  pageSize: number,
  SortBy?: SortMeta[]
}

export interface QueryTLS57050ApiResponse {
  DetailData: DetailData[],
  SummaryData: SummaryData[]
}
export interface DetailData {
  TXN_SaleNoteNo: string,
  TXN_Date: string,
  ECR_No: string,
  TXN_No: number,
  LOGO_No: string,
  LOGO_CH_NAME: string,
  GUINO: string,
  PLU_MagNo: string,
  PLU_No: string,
  PLU_Name: string,
  TXN_Qty: number,
  PLU_SalePrc: number,
  TXN_SaleAmt: number,
  TotRebate: number,
  TotDisc: number
}

export interface SummaryData {
  TXN_SaleNoteNo: string,
  TXN_Date: string,
  ECR_No: string,
  TXN_No: number,
  LOGO_No: string,
  LOGO_CH_NAME: string,
  GUINO: string,
  TXN_TotQty: number,
  PLU_SalePrc: number,
  TXN_TotSaleAmt: number,
  TotRebate: number,
  TotDisc: number
}

@Injectable({
  providedIn: 'root'
})
export class Tls57050Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS57050`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢收銀機發票商品統計表資料
   * @param request 查詢參數
   * @returns 包含明細或彙總資料的 API Response
   */
  queryTLS57050(request: QueryTLS57050Request): Observable<any> {
    return this.http.post<ApiResponse<QueryTLS57050ApiResponse>>(`${this.apiUrl}/queryTLS57050`, request).pipe(
      map(res => {
        const data = request.ReportType === '明細' ? res.Data.DetailData : res.Data.SummaryData;
        return {
          Data: data,
          TotalCount: res.TotalCount,
          Message: res.Message
        };
      })
    );
  }

  /**
   * 匯出收銀機發票商品統計報表 (PDF)
   * @param request 查詢參數
   * @returns 報表檔案的 Blob
   */
  exportTLS57050PDF(request: QueryTLS57050Request): Observable<HttpResponse<Blob>> {
    // 設置 responseType 為 'blob'，以便接收二進位檔案
    return this.http.post(`${this.apiUrl}/exportTLS57050PDF`, request,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }

  /**
   * 匯出收銀機發票商品統計報表 (Excel)
   * @param request 查詢參數
   * @returns 報表檔案的 Blob
   */
  exportTLS57050Excel(request: QueryTLS57050Request): Observable<HttpResponse<Blob>> {
    // 設置 responseType 為 'blob'，以便接收二進位檔案
    return this.http.post(`${this.apiUrl}/exportTLS57050Excel`, request, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
