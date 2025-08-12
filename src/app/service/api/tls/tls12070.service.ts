import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls12070Service {
  // 專櫃訪談紀錄追蹤表
    apiUrl: string = environment.ApiUrl + '/TLS0000/TLS1000';
    constructor(private http: HttpClient) {}

  //  查詢 Customer_interview資料表
  queryTLS12070(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS12070`, body);
  }

  // 查詢 意願報表 toSumary
  queryTLS12070_Summary(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS12070_Summary`, body);
  }

  // 查詢 潛在客戶
  queryTBLUSER_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTBLUSER_DropDownList`, body);
  }  
}
