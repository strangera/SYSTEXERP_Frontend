import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class FIN13020Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
  ) {}

  // ✅ 查詢
  queryFIN13020(query: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13020`, query)
      .pipe(tap((res) => console.log('查詢結果:', res)));
  }

  // ✅ 新增
  insertFIN13020(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/insertFIN13020`, data)
      .pipe(tap((res) => console.log('新增結果:', res)));
  }

  // ✅ 更新
  updateFIN13020(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/updateFIN13020`, data)
      .pipe(tap((res) => console.log('更新結果:', res)));
  }

  // ✅ 刪除
  deleteFIN13020(idList: number[]): Observable<any> {
    const body = { idList };
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/deleteFIN13020`, body)
      .pipe(tap((res) => console.log('刪除結果:', res)));
  }

  // ✅ 依字軌查發票號碼清單
  queryINV1000List(param: { GUI_Track: string }) {
    return this.http.post<ApiResponse<any[]>>(
      `${this.apiUrl}/FIN0000/INV1000/queryFIN13020_InvoiceNumber`,
      param,
    );
  }

  // ✅ 依「字軌+號碼」查對應資訊
  queryCorrespondByGUINoCorrespond(param: {
    InvoiceNumber_Correspond: string;
  }) {
    return this.http.post<any>(
      `${this.apiUrl}/FIN0000/INV1000/queryFIN13020_Correspond`,
      param,
    );
  }
}
