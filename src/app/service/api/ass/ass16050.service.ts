import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Ass16050DetailRow,
  Ass16050DispatchData,
  Ass16050DispatchRequest,
  Ass16050MasterRow,
  Ass16050QueryDataWrapper,
  Ass16050QueryRequest,
} from '../../../pages/ass/ass16050/ass16050.model';

@Injectable({ providedIn: 'root' })
export class ASS16050Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) {}

  /**
   * 查詢主檔列表（給查詢頁用）
   * 後端原始回傳為 `ApiResponse<{ QueryData[], TotalCount, TotalPage }>`，
   * 在 service 層攤平為 `ApiResponse<Row[]>` + 頂層 TotalCount，
   * 以符合專案規範（CLAUDE.local.md §2 — TotalCount 必須與 Data 同層級）。
   */
  queryASS16050M(
    body: Ass16050QueryRequest,
  ): Observable<ApiResponse<Ass16050MasterRow[]>> {
    return this.http
      .post<ApiResponse<Ass16050QueryDataWrapper<Ass16050MasterRow>>>(
        `${this.apiUrl}/queryASS16050M`,
        body,
      )
      .pipe(map((res) => this.flattenWrapper(res)));
  }

  /** 查詢主檔+明細（給 CRU 頁帶 MTAPPLY_ID 取單一單據明細用） */
  queryASS16050(
    body: Ass16050QueryRequest,
  ): Observable<ApiResponse<Ass16050DetailRow[]>> {
    return this.http
      .post<ApiResponse<Ass16050QueryDataWrapper<Ass16050DetailRow>>>(
        `${this.apiUrl}/queryASS16050`,
        body,
      )
      .pipe(map((res) => this.flattenWrapper(res)));
  }

  /** 執行結案/發料（更新單據狀態為「領用發料」） */
  dispatchASS16050(
    body: Ass16050DispatchRequest,
  ): Observable<ApiResponse<Ass16050DispatchData>> {
    return this.http.post<ApiResponse<Ass16050DispatchData>>(
      `${this.apiUrl}/dispatchASS16050`,
      body,
    );
  }

  /** 把 `ApiResponse<Wrapper<T>>` 攤平為 `ApiResponse<T[]>`，並把 TotalCount 提升到頂層 */
  private flattenWrapper<T>(
    res: ApiResponse<Ass16050QueryDataWrapper<T>>,
  ): ApiResponse<T[]> {
    return {
      ...res,
      Data: res.Data?.QueryData ?? [],
      TotalCount: res.Data?.TotalCount ?? res.TotalCount ?? 0,
      TotalPage: res.Data?.TotalPage ?? res.TotalPage ?? 0,
    };
  }
}

export type {
  Ass16050DetailRow,
  Ass16050DispatchData,
  Ass16050DispatchRequest,
  Ass16050MasterDisplayRow,
  Ass16050MasterRow,
  Ass16050QueryRequest,
} from '../../../pages/ass/ass16050/ass16050.model';
