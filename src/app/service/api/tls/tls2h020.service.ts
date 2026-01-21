import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type ExportFileResponse = HttpResponse<Blob>;

@Injectable({
  providedIn: 'root'
})
export class Tls2h020Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  queryTLS2H020(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2H020`, params);
  }


  generateTLS2H020(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generateTLS2H020`, params);
  }
}
