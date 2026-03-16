import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS13060ApproveRequest,
  ASS13060AssetQueryRequest,
  ASS13060AssetQueryRow,
  ASS13060DeleteRequest,
  ASS13060ExportPDFRequest,
  ASS13060InsertRequest,
  ASS13060InsertResponseData,
  ASS13060QueryRequest,
  ASS13060QueryRow,
  ASS13060UpdateRequest,
  QueryDetailASS13060Data,
  QueryDetailASS13060Request,
} from '@pages/ass/ass13060/ass13060.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS13060Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢固資重估單
   */
  queryASS13060(payload: ASS13060QueryRequest): Observable<ApiResponse<ASS13060QueryRow[]>> {
    return this.http.post<ApiResponse<ASS13060QueryRow[]>>(
      `${this.apiUrl}/queryASS13060`,
      payload
    );
  }

  /**
   * 固資重估單明細查詢
   */
  queryDetailASS13060(
    payload: QueryDetailASS13060Request
  ): Observable<ApiResponse<QueryDetailASS13060Data>> {
    return this.http.post<ApiResponse<QueryDetailASS13060Data>>(
      `${this.apiUrl}/queryDetailASS13060`,
      payload
    );
  }

  /**
   * 新增固資重估單
   */
  insertASS13060(
    payload: ASS13060InsertRequest
  ): Observable<ApiResponse<ASS13060InsertResponseData>> {
    return this.http.post<ApiResponse<ASS13060InsertResponseData>>(
      `${this.apiUrl}/insertASS13060`,
      payload
    );
  }

  /**
   * 修改固資重估單
   */
  updateASS13060(payload: ASS13060UpdateRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/updateASS13060`, payload);
  }

  /**
   * 刪除固資重估單
   */
  deleteASS13060(payload: ASS13060DeleteRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/deleteASS13060`, payload);
  }

  /**
   * 資產查詢（供批次新增品項彈窗使用）
   */
  queryFAASSETChooseListASS13060(
    payload: ASS13060AssetQueryRequest
  ): Observable<ApiResponse<ASS13060AssetQueryRow[]>> {
    return this.http.post<ApiResponse<ASS13060AssetQueryRow[]>>(
      `${this.apiUrl}/queryFAASSETChooseListASS13060`,
      payload
    );
  }

  /**
   * 審核固資重估單
   */
  approveASS13060(payload: ASS13060ApproveRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/approveASS13060`, payload);
  }

  /**
   * 列印固資重估單（匯出 PDF）
   */
  exportPDFASS13060(
    payload: ASS13060ExportPDFRequest
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFASS13060`, payload, {
      responseType: 'blob',
      observe: 'response',
    }).pipe(
      take(1)
    );
  }
}
