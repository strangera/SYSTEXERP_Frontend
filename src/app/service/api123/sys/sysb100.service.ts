import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Sysb100Service {
  apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';

  constructor(private http: HttpClient) { }

  // 查詢 POS1001 資料表
  querySYSB100(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/querySYSB100`, body);
  }

  // 新增 POS1001 資料表
  insertSYSB100(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertSYSB100`, body);
  }

  // 更新 POS1001 資料表
  updateSYSB100(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateSYSB100`, body);
  }

  // 刪除 POS1001 資料表
  deleteSYSB100(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteSYSB100`, body);
  }
}
