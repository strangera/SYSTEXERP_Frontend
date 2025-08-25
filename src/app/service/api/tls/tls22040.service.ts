import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls22040Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) {}

  // 查詢電子發票上送筆數檢核表
  queryTLS22040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS22040`, data);
  }

  // 查詢電子發票上送筆數檢核表 - 明細
  queryTLS22040_Detail(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS22040_Detail`, data);
  }
}
