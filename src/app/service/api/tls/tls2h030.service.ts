import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type ExportFileResponse = HttpResponse<Blob>;

@Injectable({
  providedIn: 'root'
})
export class Tls2h030Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  queryTLS2H030(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2H030`, params);
  }
  PrintTLS2H(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/PrintTLS2H`, params);
  }

  generateTLS2H030(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generateTLS2H030`, params);
  }
  RePrintTLS2H030(params: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/RePrintTLS2H030`, params, { observe: 'response', responseType: 'blob' }) as Observable<HttpResponse<Blob>>;
  }
}
