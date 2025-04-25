import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// 4.1.1 基本資料維護作業(組織碼設定作業-41140-SYSB400)
export class Sysb400Service {
  apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';
  
    constructor(private http: HttpClient) {}
  
    // 查詢 SYS3100 資料表
    querySYS3100(body: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/querySYS3100`, body);
    }
  
    // 新增 SYS3100 資料表
    insertSYS3100(body: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/insertSYS3100`, body);
    }
  
    // 更新 SYS3100 資料表
    updateSYS3100(body: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/updateSYS3100`, body);
    }
}
