import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})

// 4.1.1 基本資料維護作業(組織碼設定作業-41140-SYSB400)
export class Sysb400Service {
  apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';

  constructor(private http: HttpClient) { }

  // 查詢 SYS3100 資料表
  querySYSB400(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/querySYSB400`, body);
  }

  // 新增 SYS3100 資料表
  insertSYSB400(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertSYSB400`, body);
  }

  // 更新 SYS3100 資料表
  updateSYSB400(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateSYSB400`, body);
  }

  // 刪除 SYS3100 資料表
  deleteSYSB400(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteSYSB400`, body);
  }

  // 查詢 組織代碼下拉 SYS3100 下拉式
  querySYS3100_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3100_DropDownList`, body);
  }

  // 查詢 組織代碼下拉 SYS3100 樹狀下拉式
  querySYS3100_tree_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3100_tree_DropDownList`, body);
  }
}
