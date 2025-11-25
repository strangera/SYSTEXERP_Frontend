import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryTLS57080Request {
  ReportType: string,
  TXN_Date_Start?: string,
  TXN_Date_End?: string,
}

export interface QueryTLS57080ApiResponse {
  TXN_Date?: string,
}

@Injectable({
  providedIn: 'root'
})
export class Tls57080Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS57050`;

  constructor(private http: HttpClient) { }
  /**
   * 查詢收銀機發票商品統計表資料
   * @param request 查詢參數
   * @returns 包含明細或彙總資料的 API Response
   */
  queryTLS57080(request: QueryTLS57080Request): Observable<any> {
    return this.http.post<ApiResponse<QueryTLS57080ApiResponse>>(`${this.apiUrl}/queryTLS57080`, request).pipe(
      // map(res => {
      //   const data = request.ReportType === '明細' ? res.Data.DetailData : res.Data.SummaryData;
      //   return {
      //     Data: data,
      //     TotalCount: res.TotalCount,
      //     Message: res.Message
      //   };
      // })
    );
  }
}
