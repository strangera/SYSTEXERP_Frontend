import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class tls2b010tableService {
  apiUrl = `${environment.ApiUrl}`;

  constructor(private http: HttpClient) {}

  // ✅ 回傳 Observable<Blob>
  exportPDF(data: any): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportPDF`,
      data,
      {
        responseType: 'blob',
        observe: 'response'
      }
    );
  }

  exportExcel(data: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportExcel`, data, {
      responseType: 'blob',

      observe: 'response',
    });
  }
}
