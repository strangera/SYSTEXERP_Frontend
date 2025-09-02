import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS51130Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // ✅ 查詢
  queryTLS51130(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS5000/queryTLS51130`, query).pipe(
      tap(res => console.log('查詢結果:', res)),
      
    );
  }

  // ✅ 新增
  insertTLS51130(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS5000/insertTLS51130`, data).pipe(
      tap(res => console.log('新增結果:', res)),
      
    );
  }

  // ✅ 更新
  updateTLS51130(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS5000/updateTLS51130`, data).pipe(
      tap(res => console.log('更新結果:', res)),
      
    );
  }

  // ✅ 刪除
  deleteTLS51130(idList: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS5000/deleteTLS51130`, { idList }).pipe(
      tap(res => console.log('刪除結果:', res)),
      
    );
  }
}
