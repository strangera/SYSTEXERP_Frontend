import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';

interface TLS13010FareRequest {
  talentId: string;
  showAll: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TLS13010Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(private http: HttpClient, private errorHandler: ErrorHandlerService) { }

  /** 查詢契約書維護資料 */
  queryTLS13010(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13010`, payload).pipe(
      tap((res) => console.log('查詢結果:', res)),
    );
  }

  /** 查詢契約書維護地點資料 */
  queryTLS13010Location(talentId: string) {
    const payload = { TalentId: talentId };
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13010Location`, payload).pipe(
      tap((res) => console.log('查詢地點資料結果:', res)),
    );
  }

  /** 查詢契約書維護地點資料 */
  // Service 方法
  queryTLS13010Fare(request: TLS13010FareRequest) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13010Fare`, request).pipe(
      tap((res) => console.log('查詢扣款資料結果:', res)),
    );
  }
  /** 刪除扣款項目資料 */
  deleteTLS11020(idList: number[]) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/deleteTLS11020`, { idList }).pipe(
      tap((res) => console.log('刪除結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /** 新增扣款項目資料 */
  insertTLS11020(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/insertTLS11020`, payload).pipe(
      tap((res) => console.log('新增結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /** 更新扣款項目資料 */
  updateTLS11020(payload: any) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/updateTLS11020`, payload).pipe(
      tap((res) => console.log('更新結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  /** 查詢契約書抽成設定資料 */
  queryTLS13010Charge(talentId: string) {
    const payload = { TalentId: talentId };
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13010Charge`, payload).pipe(
      tap((res) => console.log('查詢抽成設定資料結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }

  queryTLS13010Commission(request: { TalentId: string; CurrentTltTermType: string }) {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13010Commission`, request).pipe(
      tap((res) => console.log('處理抽成設定資料結果:', res)),
      catchError(this.errorHandler.handleError)
    );
  }
}
