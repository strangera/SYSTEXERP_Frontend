import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS12030InsertRequest,
  ASS12030InsertResult,
  ASS12030Detail,
  ASS12030QueryDataWrapper,
  ASS12030QueryRow,
  ASS12030SubpoenaRequest,
  ASS12030UpdateRequest,
  ASS12030UpdateResult,
  ASS12030VoidResult,
  QueryASS12030Request,
} from '@pages/ass/ass12030/ass12030.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS12030Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) {}

  /**
   * 採購申請查詢
   */
  queryASS12030(body: QueryASS12030Request): Observable<ApiResponse<ASS12030QueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS12030QueryDataWrapper>>(`${this.apiUrl}/queryASS12030`, body)
      .pipe(
        map(res => ({
          ...res,
          Data: res.Data?.QueryData ?? [],
          TotalCount: res.Data?.TotalRows ?? 0,
        } as ApiResponse<ASS12030QueryRow[]>)),
      );
  }

  /**
   * 新增採購申請
   */
  insertASS12030(body: ASS12030InsertRequest): Observable<ApiResponse<ASS12030InsertResult>> {
    return this.http.post<ApiResponse<ASS12030InsertResult>>(`${this.apiUrl}/insertASS12030`, body);
  }

  /**
   * 取得單筆採購申請明細 (編輯/明細頁用)
   */
  detailASS12030(body: ASS12030SubpoenaRequest): Observable<ApiResponse<ASS12030Detail>> {
    return this.http.post<ApiResponse<ASS12030Detail>>(`${this.apiUrl}/detailASS12030`, body);
  }

  /**
   * 更新採購申請
   */
  updateASS12030(body: ASS12030UpdateRequest): Observable<ApiResponse<ASS12030UpdateResult>> {
    return this.http.post<ApiResponse<ASS12030UpdateResult>>(`${this.apiUrl}/updateASS12030`, body);
  }

  /**
   * 刪除採購申請
   */
  deleteASS12030(body: ASS12030SubpoenaRequest): Observable<ApiResponse<ASS12030UpdateResult>> {
    return this.http.post<ApiResponse<ASS12030UpdateResult>>(`${this.apiUrl}/deleteASS12030`, body);
  }

  /**
   * 作廢採購申請
   */
  voidASS12030(body: ASS12030SubpoenaRequest): Observable<ApiResponse<ASS12030VoidResult>> {
    return this.http.post<ApiResponse<ASS12030VoidResult>>(`${this.apiUrl}/voidASS12030`, body);
  }

  /**
   * 匯出 PDF
   */
  exportPDFASS12030(body: ASS12030SubpoenaRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFASS12030`, body, {
      responseType: 'blob',
      observe: 'response',
    });
  }

}
