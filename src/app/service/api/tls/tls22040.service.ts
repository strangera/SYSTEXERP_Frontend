import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls22040Service {
  /** 📌 主查詢與明細查詢走的是 /TLS0000/TLS2000 */
  private baseUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) {}

  /**
   * 查詢電子發票上送筆數檢核表 (主檔)
   */
  queryTLS22040(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/queryTLS22040`, data);
  }

  /**
   * 查詢電子發票上送筆數檢核表 - 明細
   */
  queryTLS22040_Detail(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/queryTLS22040_Detail`, data);
  }

  /**
   * 呼叫重送 API (spCrtMig)
   *  API 在 /ExecSpFunc，不在 /TLS0000/TLS2000
   */
  callSpCrtMig(data: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/ExecSpFunc/CallspCrtMig`, data);
  }
}
