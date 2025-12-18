import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

@Injectable({
  providedIn: 'root'
})
export class Tls57020Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS57050`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢收銀機發票商品統計表資料
   * @param request 查詢參數
   * @returns 包含明細或彙總資料的 API Response
   */
  queryTLS57020(request: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/queryTLS57050`, request).pipe(
      map(res => {
        const data = request.ReportType === '明細' ? res.Data.DetailData : res.Data.SummaryData;
        return {
          Data: data,
          TotalCount: res.TotalCount,
          Message: res.Message,
          FooterData: request.ReportType === '明細' ? res.Data.DetailFooter : res.Data.SummaryFooter
        };
      })
    );
  }
}
