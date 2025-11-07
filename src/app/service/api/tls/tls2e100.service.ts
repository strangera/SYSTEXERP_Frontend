import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TLS2E100Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }
  /** 年度對帳單 查詢 */
  queryTLS2E100(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2E100`, body).pipe(
      map(res => {
        const mainData = res?.Data?.mainData ?? [];
        const totalData = res?.Data?.totalData ?? [];
        return {
          Data: mainData,
          TotalCount: res?.TotalCount ?? mainData.length,
          footerData: Array.isArray(totalData) && totalData.length > 0 ? totalData[0] : totalData
        };
      })
    );
  }

  /** 匯出 Excel */
  exportTLS2E100(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2E100Excel`, body, {
      responseType: 'blob'
    });
  }

  /** 匯出 PDF */
  exportTLS2E100PDF(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2E100PDF`, body, {
      responseType: 'blob'
    });
  }
}
