import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls41030Service {
  // POS2001 收銀專櫃人員資料維護作業
    apiUrl: string = environment.ApiUrl + '/TLS0000/TLS4000';
    constructor(private http: HttpClient) { }
  
    // 查詢 POS2001 資料表
    queryTLS41030(body: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/queryTLS41030`, body);
    }
  
    // 新增 POS2001 資料表
    insertTLS41030(body: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/insertTLS41030`, body);
    }
  
    // 更新 POS2001 資料表
    updateTLS41030(body: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/updateTLS41030`, body);
    }
  
    // 刪除 POS2001 資料表
    deleteTLS41030(body: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/deleteTLS41030`, body);
    }

    //讀取專櫃 下拉
    queryTLTTALENT_DropDownList(body: any): Observable<any> {
      return this.http.post<any>(`${environment.ApiUrl}/queryTLTTALENT_DropDownList`, body);
    }

    // 異動檔 下傳
    execSpFunc(body: any): Observable<any> {
      return this.http.post<any>(`${environment.ApiUrl}/ExecSpFunc/ExecSpFunc`, body);
    }
}
