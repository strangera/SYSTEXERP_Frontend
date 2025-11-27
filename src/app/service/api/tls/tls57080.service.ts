import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryTLS57080Request {
  StartDate: string,
  EndDate: string,
  PLU_MagNo: string,
  PLU_No: string,
  HOS_No: string,
  PLU_Name: string
}
export interface QueryTLS57080ApiResponse {
  Details: QueryTLS57080DetailsApiResponse[]
  PLU_NO: string,
}
export interface QueryTLS57080DetailsApiResponse {
  Date: string,
  nos: string,
  VEN_NO: string,
  HOS_NO: string,
  Trntype: string,
  qty: number,
  StockQty: number,
  GUINO: string,
  PLU_NO: string,
  PLU_Name: string,
  TRN_BuyPrc: number,
  TRN_SalePrc: number,
  TRN_BuyAmt: number
}


export type ExportFileResponse = HttpResponse<Blob>;

@Injectable({
  providedIn: 'root'
})
export class Tls57080Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`

  constructor(private http: HttpClient) { }
  /**
   * 查詢收銀機發票商品統計表資料
   * @param request 查詢參數
   * @returns 包含明細或彙總資料的 API Response
   */
  queryTLS57080(request: QueryTLS57080Request): Observable<ApiResponse<QueryTLS57080ApiResponse[]>> {
    return this.http.post<ApiResponse<QueryTLS57080ApiResponse[]>>(`${this.apiUrl}/queryTLS57080`, request)
  }

  exportTLS57080PDF(request: QueryTLS57080Request): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/exportTLS57080PDF`, request, {
      observe: 'response',
      responseType: 'blob'
    });
  }
  exportTLS57080(request: QueryTLS57080Request): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/exportTLS57080`, request, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
