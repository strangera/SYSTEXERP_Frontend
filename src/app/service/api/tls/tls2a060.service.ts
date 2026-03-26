import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TLS2A060Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  // 作廢發票審核作業-查詢
  queryTLS2A060(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2A060`, data);
  }

  // 作廢發票審核作業-新增、更新
  insertTLS2A060(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS2A060`, data);
  }
}
