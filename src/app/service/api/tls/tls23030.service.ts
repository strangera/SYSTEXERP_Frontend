import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, map } from 'rxjs'; // ⬅️ 多加 map
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

export interface ApiResponse<T> {
  Status: string;
  Data: T[];
  Error?: { Code: string; Message: string; Details?: string };
  Meta?: { Timestamp?: string; RequestId?: string };
  Message?: string;
  TotalCount?: number;
  TotalPage?: number;
}

export interface POS1006Item {
  No: string;
  Name: string;
  PAY_Type: string;
}

@Injectable({ providedIn: 'root' })
export class TLS23030Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // 既有查詢
  queryTLS23030(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23030`;
    return this.http.post<any>(url, body).pipe(
      tap(res => console.log('🎯 TLS23030 查詢結果:', res)),
      
    );
  }

  // ✅ 新增：POS1006 下拉資料（原始回傳）
queryPOS1006_DropDownList(): Observable<ApiResponse<POS1006Item>> {
  const url = `${this.apiUrl}/TLS0000/TLS2000/queryPOS1006_DropDownList`;
  return this.http.post<ApiResponse<POS1006Item>>(url, {}).pipe(
    tap(res => console.log('🎯 POS1006 下拉原始資料:', res)),
    
  );
}

// 轉成 UI 需要的 options
queryPOS1006Options(): Observable<Array<{ label: string; value: string; payload: POS1006Item }>> {
  return this.queryPOS1006_DropDownList().pipe(
    map(res => (Array.isArray(res?.Data) ? res.Data : []).map(x => ({
      label: `${x.No}-${x.Name}`,
      value: x.No,
      payload: x,
    })))
  );
}
  queryTLS23030Summary(body: any): Observable<any> {
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS23030_Summary`;
    return this.http.post<any>(url, body).pipe(
      tap(res => console.log('🎯 TLS23030 Summary 結果:', res)),
      catchError(err => this.errorHandler.handleError(err))
    );
  }

}
