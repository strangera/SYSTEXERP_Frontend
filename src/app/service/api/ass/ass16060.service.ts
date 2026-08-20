import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS16060DetailRow,
  ASS16060MasterRow,
  ASS16060QueryDataWrapper,
  ASS16060QueryRequest,
} from '@pages/ass/ass16060/ass16060.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** insertASS16060 — DetailTable 列（ASS16060DetailItem） */
export interface ASS16060DetailItem {
  LINE_NUM?: number | null;
  GOODS_ID?: string | null;
  QTY?: number | null;
  GOODS_PRICE?: number | null;
  TAX_CODE?: string | null;
  AMT?: number | null;
  CHECK_QTY?: number | null;
  NOTES?: string | null;
}

/** insertASS16060 — 請求本體 */
export interface ASS16060InsertRequest {
  MID: number;
  STO_NO: string;
  WH_ID: string;
  EMP_ID: string;
  ORG_ID: string;
  RETURN_DATE: string;
  NOTES?: string | null;
  CRT_USR_No: string;
  DetailTable: ASS16060DetailItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ASS16060Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) { }

  /**
   * 查詢主檔列表（給查詢頁用）
   * 後端原始回傳為 `ApiResponse<{ QueryData[], TotalCount, TotalPage }>`，
   * service 層攤平為 `ApiResponse<Row[]>` + 頂層 TotalCount，
   * 與 ASS16050 同模式。
   */
  queryASS16060M(
    body: ASS16060QueryRequest,
  ): Observable<ApiResponse<ASS16060MasterRow[]>> {
    return this.http
      .post<ApiResponse<ASS16060QueryDataWrapper<ASS16060MasterRow>>>(
        `${this.apiUrl}/queryASS16060`,
        body,
      )
      .pipe(map((res) => this.flattenWrapper(res)));
  }

  /** 查詢主檔+明細（給 CRU 頁帶 MTRETURN_ID 取單一單據明細用） */
  queryASS16060(
    body: ASS16060QueryRequest,
  ): Observable<ApiResponse<ASS16060DetailRow[]>> {
    return this.http
      .post<ApiResponse<ASS16060QueryDataWrapper<ASS16060DetailRow>>>(
        `${this.apiUrl}/queryASS16060D`,
        body,
      )
      .pipe(map((res) => this.flattenWrapper(res)));
  }

  insertASS16060(
    body: ASS16060InsertRequest,
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiUrl}/insertASS16060`,
      body,
    );
  }

  /** 把 `ApiResponse<Wrapper<T>>` 攤平為 `ApiResponse<T[]>`，並把 TotalCount 提升到頂層 */
  private flattenWrapper<T>(
    res: ApiResponse<ASS16060QueryDataWrapper<T>>,
  ): ApiResponse<T[]> {
    return {
      ...res,
      Data: res.Data?.QueryData ?? [],
      TotalCount: res.Data?.TotalCount ?? res.TotalCount ?? 0,
      TotalPage: res.Data?.TotalPage ?? res.TotalPage ?? 0,
    };
  }
}
