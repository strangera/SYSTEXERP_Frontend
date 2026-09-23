import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RecalculationTLS2A010Request } from 'src/app/pages/tls/tls2a010/tls2a010.model';

@Injectable({
  providedIn: 'root'
})
export class Tls2a010Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  /** 查詢 各支付工具審核作業 */
  queryTLS2A010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2A010`, data).pipe(
      map(res => {
        if (res?.Data?.mainData) {
          res.footerData = res?.Data?.totalData ? res.Data.totalData[0] : {};
          res.Data = res.Data.mainData;
        }
        console.log('queryTLS2A010 處理後的 res:', res);
        return res; // 保持原結構，只改 Data.mainData
      })
    );
  }


  /** 查詢明細 */
  queryDetailTLS2A010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryDetailTLS2A010`, data);
  }

  /** 新增 */
  insertTLS2A010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS2A010`, data);
  }

  /** 更新 */
  updateTLS2A010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS2A010`, data);
  }
  updateModPayAmt(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateModPayAmt`, data);
  }
  /** 新增明細前刪除 */
  deletePOS30011Detail(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deletePOS30011Detail`, data);
  }
  /** 重算 */
  recalculationTLS2A010(data: RecalculationTLS2A010Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recalculationTLS2A010`, data);
  }
  exportTLS2A010Excel(data: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS2A010Excel`, data, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
