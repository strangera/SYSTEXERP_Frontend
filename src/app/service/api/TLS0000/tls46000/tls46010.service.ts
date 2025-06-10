import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
// POS10015 門市系統主機設定
export class Tls46010Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS4000';

  constructor(private http: HttpClient) {}

  // 查詢 POS10015 資料表
  queryTLS46010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS46010`, body);
  }

  // 新增 POS10015 資料表
  insertTLS46010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS46010`, body);
  }

  // 更新 POS10015 資料表
  updateTLS46010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS46010`, body);
  }

  // 刪除 POS10015 資料表
  deleteTLS46010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS46010`, body);
  }
}
