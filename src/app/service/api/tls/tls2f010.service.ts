import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type ExportFileResponse = HttpResponse<Blob>;

@Injectable({
  providedIn: 'root'
})
export class Tls2f010Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }
  queryTLS2F010(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/QueryTLS2F010`, params);
  }
  queryTLS2F010_TLT_No(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/QueryTLS2F010_TLT_No`, params);
  }
  queryTLS2F010InsertData(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/QueryTLS2F010InsertData`, params);
  }
}
