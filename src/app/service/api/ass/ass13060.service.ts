import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS13060ApproveRequest,
  ASS13060AssetQueryRequest,
  ASS13060AssetQueryRow,
  ASS13060DeleteRequest,
  ASS13060InsertRequest,
  ASS13060PrintRequest,
  ASS13060QueryDataWrapper,
  ASS13060QueryRequest,
  ASS13060QueryRow,
  ASS13060UpdateRequest,
} from '@pages/ass/ass13060/ass13060.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS13060Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) {}

  /**
   * 查詢固資重估單
   * TODO: 待 API 規格確認後調整端點與 response 結構
   */
  queryASS13060(payload: ASS13060QueryRequest): Observable<ApiResponse<ASS13060QueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS13060QueryDataWrapper>>(`${this.apiUrl}/queryASS13060`, payload)
      .pipe(
        map((res) => {
          const wrapper = res.Data as unknown as ASS13060QueryDataWrapper;
          return {
            ...res,
            Data: wrapper?.QueryData ?? [],
            TotalCount: wrapper?.TotalRows ?? res.TotalCount ?? 0,
          } as ApiResponse<ASS13060QueryRow[]>;
        })
      );
  }

  /**
   * 新增固資重估單
   * TODO: 待 API 規格確認後調整
   */
  insertASS13060(payload: ASS13060InsertRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/insertASS13060`, payload);
  }

  /**
   * 修改固資重估單
   * TODO: 待 API 規格確認後調整
   */
  updateASS13060(payload: ASS13060UpdateRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/updateASS13060`, payload);
  }

  /**
   * 刪除固資重估單
   * TODO: 待 API 規格確認後調整
   */
  deleteASS13060(payload: ASS13060DeleteRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/deleteASS13060`, payload);
  }

  /**
   * 資產查詢（供批次新增品項彈窗使用）
   * TODO: 待 API 規格確認後調整端點與 request/response
   */
  queryASS13060Asset(
    payload: ASS13060AssetQueryRequest
  ): Observable<ApiResponse<ASS13060AssetQueryRow[]>> {
    return this.http.post<ApiResponse<ASS13060AssetQueryRow[]>>(
      `${this.apiUrl}/queryASS13060Asset`,
      payload
    );
  }

  /**
   * 審核固資重估單
   * TODO: 待 API 規格確認後調整
   */
  approveASS13060(payload: ASS13060ApproveRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/approveASS13060`, payload);
  }

  /**
   * 列印固資重估單
   * TODO: 待 API 規格確認後調整
   */
  printASS13060(payload: ASS13060PrintRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/printASS13060`, payload);
  }
}
