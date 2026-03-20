import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ASS13110QueryRequest, ASS13110Row } from '@pages/ass/ass13110/ass13110.model';

interface ASS13110QueryResponseWrapper {
  Details: ASS13110Row[];
  TotalRows: number;
  TotalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ASS13110Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  /**
   * 查詢資產差異表資料
   */
  queryASS13110(payload: ASS13110QueryRequest): Observable<ApiResponse<ASS13110Row[]>> {
    return this.http
      .post<ApiResponse<ASS13110QueryResponseWrapper>>(
        `${this.apiUrl}/queryASS13110`,
        payload,
      )
      .pipe(
        map(res => {
          return {
            ...res,
            Data: res.Data?.Details ?? [],
            TotalCount: res.Data?.TotalRows ?? res.TotalCount ?? 0,
          } as ApiResponse<ASS13110Row[]>;
        }),
      );
  }

  /**
   * 匯出資產差異表 PDF
   */
  exportASS13110Pdf(payload: ASS13110QueryRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFASS13110`, payload, {
      responseType: 'blob',
    });
  }
}

