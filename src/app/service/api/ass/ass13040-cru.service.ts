import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS13040AssetQueryDataWrapper,
  ASS13040AssetQueryRequest,
  ASS13040AssetQueryRow,
  ASS13040DetailRequest,
  ASS13040DetailResponseData,
  ASS13040InsertRequest,
  ASS13040UpdateRequest,
} from '@pages/ass/ass13040-cru/ass13040-cru.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS13040CRUService {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  detailASS13040(body: ASS13040DetailRequest): Observable<ApiResponse<ASS13040DetailResponseData>> {
    return this.http.post<ApiResponse<ASS13040DetailResponseData>>(
      `${this.apiUrl}/detailASS13040`,
      body,
    );
  }

  insertASS13040(body: ASS13040InsertRequest | FormData): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/insertASS13040`, body);
  }

  updateASS13040(body: ASS13040UpdateRequest | FormData): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/updateASS13040`, body);
  }

  queryASS13040Assets(
    body: ASS13040AssetQueryRequest,
  ): Observable<ApiResponse<ASS13040AssetQueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS13040AssetQueryDataWrapper | ASS13040AssetQueryRow[]>>(
        `${this.apiUrl}/queryASS13040Assets`,
        body,
      )
      .pipe(
        map(res => {
          const data = res.Data;
          if (Array.isArray(data)) {
            return {
              ...res,
              Data: data,
            } as ApiResponse<ASS13040AssetQueryRow[]>;
          }

          return {
            ...res,
            Data: data?.QueryData ?? [],
            TotalCount: data?.TotalRows ?? data?.TotalCount ?? res.TotalCount ?? 0,
          } as ApiResponse<ASS13040AssetQueryRow[]>;
        }),
      );
  }
}
