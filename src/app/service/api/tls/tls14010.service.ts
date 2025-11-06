import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls14010Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS1000';
  constructor(private http: HttpClient) { }

  // 查詢 TLTTALENT 資料表
  queryTLS14010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS14010`, body);
  }
}