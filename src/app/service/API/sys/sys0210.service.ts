import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Sys0210Service {
  apiUrl: string = environment.ApiUrl + '/Role';

  constructor(private http: HttpClient) { }

  // 查詢 tblRole 資料表
  queryRole(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryRole`, body);
  }

  // 新增 tblRole 資料表
  createRole(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/createRole`, body);
  }

  // 更新 tblRole 資料表
  updateRole(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateRole`, body);
  }

  // 刪除 tblRole 資料表
  deleteRole(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/DeleteRole`, body);
  }
}
