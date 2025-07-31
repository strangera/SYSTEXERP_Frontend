import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls41050Service {
    apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;
  
    constructor(
      private http: HttpClient,
    ) { }
  
    // 新增POS1002資料表
    queryTLS41050(data: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/queryTLS41050`, data);
    }
  
    // 更新POS1002資料
    updateTLS41050(data: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/updateTLS41050`, data);
    }

    // 查收銀機號 下拉
    queryPOS1002_DropDownList(data: any): Observable<any> {
      return this.http.post<any>(`${environment.ApiUrl}/queryPOS1002_DropDownList`, data);
    }

    //查詢 專櫃主檔 下拉
    queryTLTTALENT_DropDownList(data: any): Observable<any> {
      return this.http.post<any>(`${environment.ApiUrl}/queryTLTTALENT_DropDownList`, data);
    }

    // 異動檔 下傳
    execSpFunc(body: any): Observable<any> {
      return this.http.post<any>(`${environment.ApiUrl}/ExecSpFunc/ExecSpFunc`, body);
    }
}
