import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class CPM13030Service {
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`;

  constructor(private http: HttpClient) {}

  /** 查詢報表 */
  queryCPM13030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryCPM13030`, data);
  }

    /** 匯出 Excel */
     exportCPM13030(body: any): Observable<HttpResponse<Blob>> {
      return this.http.post(`${this.apiUrl}/exportCPM13030`, body, {
        observe: 'response',
        responseType: 'blob'
      });
    }

    /** 匯出 PDF */
    exportCPM13030PDF(body: any): Observable<HttpResponse<Blob>> {
      return this.http.post(`${this.apiUrl}/exportCPM13030PDF`, body, {
        observe: 'response',
        responseType: 'blob'
      });
    }
}
