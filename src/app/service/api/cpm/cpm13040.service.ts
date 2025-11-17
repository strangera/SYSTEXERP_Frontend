import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class CPM13040Service {
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`;

  constructor(private http: HttpClient) { }

  /** 查詢報表 */
  queryCPM13040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryCPM13040`, data);
  }
  queryCPM13040Detail(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryCPM13040Detail`, data);
  }

  /** 匯出 Excel */
  exportCPM13040Excel(body: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM13040Excel`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  /** 匯出 PDF */
  exportCPM13040PDF(body: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportCPM13040PDF`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
