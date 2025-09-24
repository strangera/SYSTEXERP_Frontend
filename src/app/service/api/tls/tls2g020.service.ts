import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls2g020Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) {}

  // 查詢預估業績管理作業清單
  queryTLS2G020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2G020`, data);
  }

  // 查詢預估業績管理作業明細
  queryTLS2G020Deatil(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2G020Deatil`, data);
  }

  // 更新預估業績管理作業明細
  updateTLS2G020Deatil(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS2G020Deatil`, data);
  }
}
