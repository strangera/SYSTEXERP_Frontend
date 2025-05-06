import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Sysb500Service {
  apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';

  constructor(private http: HttpClient) {}

  // 查詢 SYS3A00 資料表
  querySYSB500(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/querySYSB500`, body);
  }

  // 新增 SYS3A00 資料表
  insertSYSB500(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertSYSB500`, body);
  }

  // 更新 SYS3A00 資料表
  updateSYSB500(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateSYSB500`, body);
  }

  // 刪除 SYS3A00 資料表
  deleteSYSB500(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteSYSB500`, body);
  }
}
