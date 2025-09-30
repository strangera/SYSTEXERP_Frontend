import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({ providedIn: 'root' })
export class FIN13050Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // ✅ 查詢（對齊後端；不傳 Offset、OrderBy）
  queryFIN13050(query: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13050`, query)
      .pipe(
        tap((res) => console.log('查詢結果:', res)),
        
      );
  }

  // ✅ 新增
  insertFIN13050(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/insertFIN13050`, data)
      .pipe(
        tap((res) => console.log('新增結果:', res)),
        
      );
  }

  // ✅ 更新
  updateFIN13050(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/updateFIN13050`, data)
      .pipe(
        tap((res) => console.log('更新結果:', res)),
        
      );
  }

  // ✅ 明細/對應（若你仍需要）
  queryDetailByGUI(param: { GUI_No: string }): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13050Detail`, param)
      .pipe(
        tap((res) => console.log('明細查詢結果:', res)),
        
      );
  }

  queryCorrespondByGUI(param: { GUI_Correspond: string }): Observable<any> {
    return this.http
      .post<any>(
        `${this.apiUrl}/FIN0000/INV1000/queryFIN13050Correspond`,
        param
      )
      .pipe(
        tap((res) => console.log('對應查詢結果:', res)),
        
      );
  }
 deleteFIN13050(idList: number[]): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/deleteFIN13050`, { idList })
      .pipe(tap((res) => console.log('刪除結果:', res)));
  }
  queryVendorList(): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/GLS1000/queryVendorList`, {})
      .pipe(
        tap(res => console.log('VendorList:', res)),
      );
  }
// ✅ SYS1000 下拉欄位（依 SYS_Type）
querySYS1000DropDownList(sysType: string): Observable<any> {
  return this.http
    .post<any>(`${this.apiUrl}/querySYS1000_DropDownList`, {
      SYS_Type: sysType,
    })
    .pipe(
      tap((res) => console.log('SYS1000 下拉資料:', res)),
      // 若你想沿用全域錯誤處理可解開以下一行
      // catchError(err => this.errorHandler.handle(err))
    );
}
}
