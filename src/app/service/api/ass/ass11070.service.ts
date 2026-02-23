import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS11070Data,
  ASS11070InsertRequest,
  ASS11070QueryDataWrapper,
  ASS11070QueryRequest,
  ASS11070UpdateRequest,
} from '@pages/ass/ass11070/ass11070.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS11070Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS11070';

  constructor(private http: HttpClient) {}

  /**
   * 查詢備用供應商資料
   */
  queryASS11070(payload: ASS11070QueryRequest): Observable<ApiResponse<ASS11070Data[]>> {
    return this.http
      .post<ApiResponse<ASS11070QueryDataWrapper>>(`${this.apiUrl}/QueryASS11070`, payload)
      .pipe(
        map(res => {
          const data = res.Data;
          const list = Array.isArray(data) ? data : data?.QueryData ?? data?.Data ?? [];
          const total = Array.isArray(data) ? (res as any).TotalCount ?? list.length : (data?.TotalCount ?? list.length);
          return {
            ...res,
            Data: list,
            TotalCount: total,
          } as ApiResponse<ASS11070Data[]>;
        })
      );
  }

  /**
   * 新增備用供應商資料（後端 API 尚未提供時可能 404，可改為 stub）
   */
  insertASS11070(payload: ASS11070InsertRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/InsertASS11070`, payload);
  }

  /**
   * 更新備用供應商資料（後端 API 尚未提供時可能 404，可改為 stub）
   */
  updateASS11070(payload: ASS11070UpdateRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/UpdateASS11070`, payload);
  }
}
