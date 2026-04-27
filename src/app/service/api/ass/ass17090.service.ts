import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS17090QueryRequest,
  QueryASS17090Detail,
  QueryASS17090Response,
} from '@pages/ass/ass17090/ass17090.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS17090Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  queryASS17090(body: ASS17090QueryRequest): Observable<ApiResponse<QueryASS17090Response>> {
    return this.http
      .post<ApiResponse<QueryASS17090Response | QueryASS17090Detail[]>>(
        `${this.apiUrl}/queryASS17090`,
        body
      )
      .pipe(
        map((res) => {
          const data = res.Data;
          if (Array.isArray(data)) {
            const normalized: QueryASS17090Response = {
              Details: data,
              TotalRows: res.TotalCount ?? data.length,
            };
            return {
              ...res,
              Data: normalized,
              TotalCount: res.TotalCount ?? data.length,
            } as ApiResponse<QueryASS17090Response>;
          }

          const wrapper = data as QueryASS17090Response;
          const total =
            res.TotalCount ?? wrapper.TotalRows ?? wrapper.Details?.length ?? 0;

          return {
            ...res,
            Data: wrapper,
            TotalCount: total,
          } as ApiResponse<QueryASS17090Response>;
        })
      );
  }

  exportExcelASS17090(body: ASS17090QueryRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportExcelASS17090`, body, {
      responseType: 'blob',
    });
  }
}
