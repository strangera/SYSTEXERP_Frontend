import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  apiUrl = `${environment.ApiUrl}`;
  constructor(private http: HttpClient) { }

  exportPDF(data: any): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/TSRDERP_Main/Controllers/exportPDF`,
      data,
      {
        responseType: 'blob',
        observe: 'response'
      }
    );
  }
  exportExcel(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/exportExcel`, data);
  }
}
