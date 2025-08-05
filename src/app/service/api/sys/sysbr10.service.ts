import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { ApiResponse } from '../../system/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SYSBR10Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
  ) {}

  // ✅ 查詢列表
  querySYSBR10(query: any): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(
      `${this.apiUrl}/SYS0000/BAS1000/querySYSBR10`,
      query
    ).pipe(
      tap(res => console.log('查詢結果:', res)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // ✅ 查詢明細
  querySYSBR10Detail(pos5101_id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/SYS0000/BAS1000/querySYSBR10_Detail`,
      { pos5101_id }
    ).pipe(
      tap(res => console.log('明細結果:', res)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // ✅ 新增
  insertSYSBR10(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/SYS0000/BAS1000/insertSYSBR10`,
      data
    ).pipe(
      tap(res => console.log('新增結果:', res)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // ✅ 更新（無資料時 ID 傳 0）
  updateSYSBR10(data: any): Observable<ApiResponse<any>> {
    if (!data.id) data.id = 0;

    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/SYS0000/BAS1000/updateSYSBR10`,
      data
    ).pipe(
      tap(res => console.log('更新結果:', res)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  // ✅ 刪除（批次 idList）
  deleteSYSBR10(idList: number[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/SYS0000/BAS1000/deleteSYSBR10`,
      { idList }
    ).pipe(
      tap(res => console.log('刪除結果:', res)),
      catchError(error => this.errorHandler.handleError(error))
    );
  }
  updateSYSBR10_PubEable(payload: { id: number; pub_enable: string }): Observable<ApiResponse<any>> {
  return this.http.post<ApiResponse<any>>(
    `${this.apiUrl}/SYS0000/BAS1000/updateSYSBR10_PubEable`,
    payload
  );
}
}
