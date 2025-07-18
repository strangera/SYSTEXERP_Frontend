import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls12010Service {
  // Potential_Customer 潛在客戶主檔
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';
  constructor(private http: HttpClient) { }

  // --- dropDown ---

  // 查詢 大分類(業種)設定檔
  queryTLTBUSTYPE_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTBUSTYPE_DropDownList`, body);
  }

  // 查詢 品牌代碼(PLULOGO) 設定檔
  queryPLULOGO_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPLULOGO_DropDownList`, body);
  }

  // 查詢 廠商統一編號 設定檔  
  queryPOS2013_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS2013_DropDownList`, body);
  }
  // 查詢 經營方式 設定檔 (SYS1000.t117)
  querySYS1000_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS1000_DropDownList`, body);
  }
}
