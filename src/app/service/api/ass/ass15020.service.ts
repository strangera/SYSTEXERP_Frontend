import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS15020QueryDataWrapper,
  ASS15020QueryRequest,
  ASS15020QueryRow,
} from '@pages/ass/ass15020/ass15020.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS15020Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1500';

  constructor(private http: HttpClient) {}

  /**
   * 財產保管清冊查詢
   * 若後端回傳為 { Data: { QueryData, TotalRows } } 會在此轉成 { Data, TotalCount }
   */
  queryASS15020(body: ASS15020QueryRequest): Observable<ApiResponse<ASS15020QueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS15020QueryRow[] | ASS15020QueryDataWrapper>>(
        `${this.apiUrl}/queryASS15020`,
        body
      )
      .pipe(
        map(res => {
          const data = res.Data;
          if (Array.isArray(data)) {
            return { ...res, Data: data, TotalCount: res.TotalCount ?? data.length };
          }
          const wrapper = data as ASS15020QueryDataWrapper;
          const list = wrapper?.QueryData ?? [];
          const total = wrapper?.TotalRows ?? wrapper?.TotalCount ?? list.length;
          return {
            ...res,
            Data: list,
            TotalCount: total,
          } as ApiResponse<ASS15020QueryRow[]>;
        })
      );
  }
}
