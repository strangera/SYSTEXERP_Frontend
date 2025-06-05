import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Sysb600Service {
  apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';

  constructor(private http: HttpClient) { }

  // 查詢 SYS3900 資料表
  querySYSB600(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/querySYSB600`, body);
  }

  // 新增 SYS3900 資料表
  insertSYSB600(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertSYSB600`, body);
  }

  // 更新 SYS3900 資料表
  updateSYSB600(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateSYSB600`, body);
  }

  // 刪除 SYS3900 資料表
  deleteSYSB600(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteSYSB600`, body);
  }
}
