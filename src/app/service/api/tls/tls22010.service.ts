import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls22010Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) {}

  // 查詢收銀機對帳查詢作業
  queryTLS22010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS22010`, data);
  }

  // 查詢收銀機對帳查詢作業 - 明細
  queryTLS22010_Detail(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS22010_Detail`, data);
  }
}
