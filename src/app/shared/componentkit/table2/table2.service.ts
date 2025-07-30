import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Table2Service {
  apiUrl = `${environment.ApiUrl}`;
  constructor(private http: HttpClient) { }

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
    return this.http.post(
      `${this.apiUrl}/exportExcel`, data,
      {
        responseType: 'blob',
        observe: 'response'
      }
    );
  }
}
