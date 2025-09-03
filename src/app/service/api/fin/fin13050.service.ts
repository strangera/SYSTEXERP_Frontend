import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';


@Injectable({
  providedIn: 'root'
})
export class FIN13050Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // ✅ 查詢
  queryFIN13050(query: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13050`, query).pipe(
      tap(res => console.log('查詢結果:', res)),
      
    );
  }

  // ✅ 新增
  insertFIN13050(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/FIN0000/INV1000/insertFIN13050`, data).pipe(
      tap(res => console.log('新增結果:', res)),
      
    );
  }

  // ✅ 更新
  updateFIN13050(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/FIN0000/INV1000/updateFIN13050`, data).pipe(
      tap(res => console.log('更新結果:', res)),
      
    );
  }

  // ✅ 發票明細查詢（例如依據 GUI_No）
  queryDetailByGUI(param: { GUI_No: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13050Detail`, param).pipe(
      tap(res => console.log('明細查詢結果:', res)),
      
    );
  }

  // ✅ 進一步對應查詢（若需要）
  queryCorrespondByGUI(param: { GUI_Correspond: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13050Correspond`, param).pipe(
      tap(res => console.log('對應查詢結果:', res)),
      
    );
  }
}
