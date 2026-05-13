import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS16030ExportRequest,
  ASS16030InsertRequest,
  ASS16030InsertResponse,
  ASS16030QueryData,
  ASS16030QueryRequest,
  ASS16030QueryResultWrapper,
  ASS16030UpdateRequest,
} from '@pages/ass/ass16030/ass16030.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, map, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS16030Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) {}

  /**
   * 查詢領用申請單清單
   *
   * 後端實際回傳結構為 `ApiResponse<{ TotalRows, TotalPages, QueryData: T[] }>`，
   * 與 ass11090 / ass12050 / ass13010 / ass13080 等其他 ASS API 一致；
   * swagger 雖標示為 `ApiResponse<T[]>`，但 runtime 為 wrapped。
   * 在此 service 將 `Data.QueryData` 攤平至 `Data`、`Data.TotalRows` 提升至 `TotalCount`，
   * 對 component 介面則維持 `ApiResponse<ASS16030QueryData[]>` 的契約。
   */
  queryASS16030(
    req: ASS16030QueryRequest,
  ): Observable<ApiResponse<ASS16030QueryData[]>> {
    return this.http
      .post<ApiResponse<ASS16030QueryResultWrapper>>(
        `${this.apiUrl}/queryASS16030`,
        req,
      )
      .pipe(
        map(
          res =>
            ({
              ...res,
              Data: res.Data?.QueryData ?? [],
              TotalCount: res.Data?.TotalRows ?? res.TotalCount ?? 0,
            }) as ApiResponse<ASS16030QueryData[]>,
        ),
      );
  }

  /** 新增領用申請單 */
  insertASS16030(
    payload: ASS16030InsertRequest,
  ): Observable<ApiResponse<ASS16030InsertResponse>> {
    return this.http.post<ApiResponse<ASS16030InsertResponse>>(
      `${this.apiUrl}/insertASS16030`,
      payload,
    );
  }

  /** 修改領用申請單 */
  updateASS16030(
    payload: ASS16030UpdateRequest,
  ): Observable<ApiResponse<{ ID: number }>> {
    return this.http.post<ApiResponse<{ ID: number }>>(
      `${this.apiUrl}/updateASS16030`,
      payload,
    );
  }

  // TODO: 待後端 API 上線 — Swagger 中尚無 /ASS0000/ASS1000/exportPDFASS16030
  exportPDFASS16030(
    body: ASS16030ExportRequest,
  ): Observable<HttpResponse<Blob>> {
    return this.http
      .post(`${this.apiUrl}/exportPDFASS16030`, body, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(take(1));
  }
}
