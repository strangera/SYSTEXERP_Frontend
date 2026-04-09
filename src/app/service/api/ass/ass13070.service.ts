import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS13070ExportRequest,
  ASS13070QueryDataWrapper,
  ASS13070QueryRequest,
  ASS13070QueryRow,
  ASS13070TransferRequest,
  ASS13070TransferResultRequest,
  ASS13070TransferResultRow,
} from '@pages/ass/ass13070/ass13070.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS13070Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  /**
   * 查詢可移轉財產清單（回應 Data 內為 Details[]，此處轉成標準 Data[]）
   */
  queryASS13070(payload: ASS13070QueryRequest): Observable<ApiResponse<ASS13070QueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS13070QueryRow[] | ASS13070QueryDataWrapper>>(`${this.apiUrl}/queryASS13070`, payload)
      .pipe(
        map(res => {
          const raw = res.Data as ASS13070QueryRow[] | ASS13070QueryDataWrapper | undefined;
          const list = Array.isArray(raw) ? raw : raw?.Details ?? [];
          const total =
            res.TotalCount ?? (raw && !Array.isArray(raw) ? raw.TotalRows : undefined) ?? 0;
          return { ...res, Data: list, TotalCount: total } as ApiResponse<ASS13070QueryRow[]>;
        }),
      );
  }

  /** 轉移財產 */
  transferASS13070(payload: ASS13070TransferRequest): Observable<ApiResponse<{ TotalCount?: number; MsgType?: string; Message?: string }>> {
    return this.http.post<ApiResponse<{ TotalCount?: number; MsgType?: string; Message?: string }>>(
      `${this.apiUrl}/transferASS13070`,
      payload,
    );
  }

  /** 轉移結果明細 */
  transferResultASS13070(
    payload: ASS13070TransferResultRequest,
  ): Observable<ApiResponse<ASS13070TransferResultRow[]>> {
    return this.http.post<ApiResponse<ASS13070TransferResultRow[]>>(
      `${this.apiUrl}/transferResultASS13070`,
      payload,
    );
  }

  /** 匯出 Excel */
  exportExcelASS13070(payload: ASS13070ExportRequest): Observable<HttpResponse<Blob>> {
    return this.http
      .post(`${this.apiUrl}/exportExcelASS13070`, payload, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(take(1));
  }

  /** 匯出 PDF */
  exportPDFASS13070(payload: ASS13070ExportRequest): Observable<HttpResponse<Blob>> {
    return this.http
      .post(`${this.apiUrl}/exportPDFASS13070`, payload, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(take(1));
  }
}
