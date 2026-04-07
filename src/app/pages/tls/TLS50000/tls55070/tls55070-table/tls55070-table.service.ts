import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TLS55070TableService {
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
