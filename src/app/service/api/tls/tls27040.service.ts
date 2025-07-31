import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TLS27040Service {

  private readonly apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS6118（實收信用卡調整作業 - 聯合）
   */
  queryPOS6118(body: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/queryPOS6118`, body);
  }

  /**
   * 查詢 POS6119（實收信用卡調整作業 - 中信）
   */
  queryPOS6119(body: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/queryPOS6119`, body);
  }

  /**
   * 查詢 POS6119P（實收信用卡調整作業 - 中信 P）
   */
  queryPOS6119P(body: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/queryPOS6119P`, body);
  }
}
