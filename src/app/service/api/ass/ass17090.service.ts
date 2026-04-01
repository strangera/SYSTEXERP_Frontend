import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS17090QueryDataWrapper,
  ASS17090QueryRequest,
  ASS17090QueryRow,
} from '@pages/ass/ass17090/ass17090.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS17090Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  queryASS17090(body: ASS17090QueryRequest): Observable<ApiResponse<ASS17090QueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS17090QueryRow[] | ASS17090QueryDataWrapper>>(
        `${this.apiUrl}/queryASS17090`,
        body
      )
      .pipe(
        map((res) => {
          const data = res.Data;
          if (Array.isArray(data)) {
            return {
              ...res,
              Data: data,
              TotalCount: res.TotalCount ?? data.length,
            } as ApiResponse<ASS17090QueryRow[]>;
          }

          const wrapper = data as ASS17090QueryDataWrapper;
          const list = wrapper?.Details ?? [];
          const total = wrapper?.TotalRows ?? res.TotalCount ?? list.length;

          return {
            ...res,
            Data: list,
            TotalCount: total,
          } as ApiResponse<ASS17090QueryRow[]>;
        })
      );
  }

  exportExcelASS17090(body: ASS17090QueryRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportExcelASS17090`, body, {
      responseType: 'blob',
    });
  }
}
