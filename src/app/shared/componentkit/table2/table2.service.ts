import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

import { Observable } from 'rxjs';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Table2Service {
  apiUrl = `${environment.ApiUrl}`;
  constructor(private http: HttpClient) { }

exportPDF(payload: any): Observable<Blob> {
  
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/pdf'  // ⛳ 很關鍵
  });

  return this.http.post(`${this.apiUrl}/exportPDF`, payload, {
    headers,
    responseType: 'blob'  // ✅ 不要 cast 成 'json'
  });
}


  exportExcel(data: any): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportExcel`, data,
      {
        responseType: 'blob',
        observe: 'response'
      }
    );
  }
}
