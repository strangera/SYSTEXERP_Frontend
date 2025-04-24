import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// 4.1.1 基本資料維護作業(組織階層設定作業-41130-SYSB300)
export class Sysb300Service {
  apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';

  constructor(private http: HttpClient) {}

  // 查詢 SYS3000 資料表
  querySYS3000(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/querySYS3000`, body);
  }

  // 新增 SYS3000 資料表
  insertSYS3000(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertSYS3000`, body);
  }

  // 更新 SYS3000 資料表
  updateSYS3000(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateSYS3000`, body);
  }
}
