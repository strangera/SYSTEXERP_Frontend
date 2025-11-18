import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './tls23030.service';
@Injectable({
  providedIn: 'root'
})
export class TLS2J020Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';
  constructor(private http: HttpClient) { }


  queryTLS2J020(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2J020`, body);
  }
  insertTLS2J020(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS2J020`, body);
  }
  updateTLS2J020(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS2J020`, body);
  }
  deleteTLS2J020(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS2J020`, body);
  }
  // 品項名稱下拉選單
  dropdownTLS2J020editCHG_ItemName(body: any): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(
      `${this.apiUrl}/dropdownTLS2J020editCHG_ItemName`,
      body
    );
  }

}
