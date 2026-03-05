import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS13040QueryDataWrapper,
  ASS13040QueryRequest,
  ASS13040QueryRow,
} from '@pages/ass/ass13040/ass13040.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS13040Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  queryASS13040(body: ASS13040QueryRequest): Observable<ApiResponse<ASS13040QueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS13040QueryDataWrapper | ASS13040QueryRow[]>>(
        `${this.apiUrl}/queryASS13040`,
        body,
      )
      .pipe(
        map(res => {
          const data = res.Data;
          if (Array.isArray(data)) {
            return {
              ...res,
              Data: data,
            } as ApiResponse<ASS13040QueryRow[]>;
          }

          return {
            ...res,
            Data: data?.QueryData ?? [],
            TotalCount: data?.TotalRows ?? data?.TotalCount ?? res.TotalCount ?? 0,
          } as ApiResponse<ASS13040QueryRow[]>;
        }),
      );
  }
}
