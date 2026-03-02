import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({ providedIn: 'root' })
export class FIN13020Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
  ) {}

  queryFIN13020(query: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13020`, query)
      .pipe(tap((res) => console.log('查詢結果:', res)));
  }

  insertFIN13020(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/insertFIN13020`, data)
      .pipe(tap((res) => console.log('新增結果:', res)));
  }

  updateFIN13020(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/updateFIN13020`, data)
      .pipe(tap((res) => console.log('更新結果:', res)));
  }

  deleteFIN13020(idList: number[]): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/deleteFIN13020`, { idList })
      .pipe(tap((res) => console.log('刪除結果:', res)));
  }

  queryINV1000List(param: { GUI_Track: string }) {
    return this.http.post<ApiResponse<any[]>>(
      `${this.apiUrl}/FIN0000/INV1000/queryFIN13020_InvoiceNumber`,
      param,
    );
  }

  // ✅ 依「字軌+號碼」查對應資訊（預設 Source=APS）
  queryCorrespondByGUINoCorrespond(param: {
    InvoiceNumber_Correspond: string;
    Source?: 'APS' | 'POS' | string;
  }) {
    return this.http.post<any>(
      `${this.apiUrl}/FIN0000/INV1000/queryFIN13020_Correspond`,
      {
        Source: 'APS',
        ...param,
      },
    );
  }

  // ✅ 新增成功後列印
  // 如果後端回傳 PDF，這樣寫最保險；若只是回 Status，也一樣可用
  printFIN13020(payload: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/FIN0000/INV1000/printFIN13020`, payload, {
      responseType: 'blob',
    });
  }
}