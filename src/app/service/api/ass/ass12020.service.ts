import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS12020DeleteRequest,
  ASS12020Detail,
  ASS12020DetailRequest,
  ASS12020DetailResponseData,
  ASS12020ExportPDFRequest,
  ASS12020InsertRequest,
  ASS12020QueryDataWrapper,
  ASS12020QueryRow,
  ASS12020UpdateRequest,
  QueryASS12020Request,
} from '@pages/ass/ass12020/ass12020.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS12020Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 詢價登錄查詢
   */
  queryASS12020(body: QueryASS12020Request): Observable<ApiResponse<ASS12020QueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS12020QueryDataWrapper>>(`${this.apiUrl}/queryASS12020`, body)
      .pipe(
        map(res => ({
          ...res,
          Data: res.Data.QueryData,
          TotalCount: res.Data.TotalRows,
        } as ApiResponse<ASS12020QueryRow[]>))
      );
  }

  /**
   * 新增詢價登錄
   */
  insertASS12020(body: ASS12020InsertRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/insertASS12020`, body);
  }

  /**
   * 更新詢價登錄
   */
  updateASS12020(body: ASS12020UpdateRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/updateASS12020`, body);
  }

  /**
   * 刪除詢價登錄 (單筆)
   */
  deleteASS12020(payload: ASS12020DeleteRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/deleteASS12020`, payload);
  }

  /**
   * 取得單筆詢價登錄詳細 (API 端點 detailASS12020)
   */
  detailASS12020(
    payload: ASS12020DetailRequest
  ): Observable<ApiResponse<ASS12020DetailResponseData>> {
    return this.http.post<ApiResponse<ASS12020DetailResponseData>>(
      `${this.apiUrl}/detailASS12020`,
      payload
    );
  }

  /**
   * 取得單筆詢價登錄 (編輯頁用)，將 detail 回傳轉成表單/明細用形狀
   */
  getASS12020Detail(id: string | number): Observable<ApiResponse<ASS12020Detail>> {
    const idNum = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.detailASS12020({ FAQuotationM_ID: idNum }).pipe(
      map(res => {
        if (res.Status !== '0000' || !res.Data) {
          return res as unknown as ApiResponse<ASS12020Detail>;
        }
        const d = res.Data;
        return {
          ...res,
          Data: {
            id: idNum,
            FAQuotationM_ID: idNum,
            SUPPLIER_ID: d.SUPPLIER_ID ?? null,
            EXPDATE: d.EXPDATE ?? null,
            NOTES: d.NOTES ?? null,
            Details: d.Details ?? [],
          },
        } as ApiResponse<ASS12020Detail>;
      })
    );
  }

  /**
   * 匯出 PDF
   */
  exportPDFASS12020(
    payload: ASS12020ExportPDFRequest
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFASS12020`, payload, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
