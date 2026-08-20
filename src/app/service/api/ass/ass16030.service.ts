import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS16030DetailQueryData,
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

  constructor(private readonly http: HttpClient) {}

  /**
   * 主檔清單查詢（queryASS16030M）— 查詢頁列表用。
   * 後端回 `ApiResponse<{ TotalCount, TotalPage, QueryData: ASS16030QueryData[] }>`，
   * 此處攤平到 `Data` 陣列、`TotalCount` 提升到頂層。
   */
  queryASS16030M(
    req: ASS16030QueryRequest,
  ): Observable<ApiResponse<ASS16030QueryData[]>> {
    return this.http
      .post<ApiResponse<ASS16030QueryResultWrapper<ASS16030QueryData>>>(
        `${this.apiUrl}/queryASS16030`,
        req,
      )
      .pipe(
        map(
          res =>
            ({
              ...res,
              Data: res.Data?.QueryData ?? [],
              TotalCount: res.Data?.TotalCount ?? res.TotalCount ?? 0,
            }) as ApiResponse<ASS16030QueryData[]>,
        ),
      );
  }

  /**
   * 單據明細查詢（queryASS16030 D endpoint）— CRU edit/read 模式進頁載入用。
   * 傳 `{ MTAPPLY_ID }`，回傳該單據的 master + 所有 detail 列（扁平化結構）。
   * 若該單據無 detail，仍會回一列只含 master 欄位（DETAIL_ID 為 null）。
   */
  queryASS16030(
    req: ASS16030QueryRequest,
  ): Observable<ApiResponse<ASS16030DetailQueryData[]>> {
    return this.http
      .post<ApiResponse<ASS16030QueryResultWrapper<ASS16030DetailQueryData>>>(
        `${this.apiUrl}/queryASS16030D`,
        req,
      )
      .pipe(
        map(
          res =>
            ({
              ...res,
              Data: res.Data?.QueryData ?? [],
              TotalCount: res.Data?.TotalCount ?? res.TotalCount ?? 0,
            }) as ApiResponse<ASS16030DetailQueryData[]>,
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

  /** 修改領用申請單（response: `{ ID }`） */
  updateASS16030(
    payload: ASS16030UpdateRequest,
  ): Observable<ApiResponse<{ ID: string | null }>> {
    return this.http.post<ApiResponse<{ ID: string | null }>>(
      `${this.apiUrl}/updateASS16030`,
      payload,
    );
  }

  /**
   * 匯出領用申請單 PDF。
   * Swagger 中 request 同 `QueryASS16030Request`（傳 `MTAPPLY_ID` 過濾），
   * response 為 PDF blob，前端需透過 `FileExportService.executeFileExport()` 處理下載。
   */
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
