import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  QueryASS17030DataWrapper,
  QueryASS17030Detail,
  QueryASS17030Request,
} from '@pages/ass/ass17030/ass17030.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS17030Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  queryASS17030(body: QueryASS17030Request): Observable<ApiResponse<QueryASS17030Detail[]>> {
    const pageIndex = body.PageIndex ?? 1;
    return this.http
      .post<ApiResponse<QueryASS17030DataWrapper | QueryASS17030Detail[]>>(
        `${this.apiUrl}/queryASS17030`,
        body
      )
      .pipe(
        map(res => {
          const data = res.Data;
          if (Array.isArray(data)) {
            const list = data.map((row, i) => this.withRowKey(row, pageIndex, i));
            return {
              ...res,
              Data: list,
              TotalCount: res.TotalCount ?? list.length,
            } as ApiResponse<QueryASS17030Detail[]>;
          }
          const wrapper = data as QueryASS17030DataWrapper;
          const rawList = wrapper?.Details ?? [];
          const list = rawList.map((row, i) => this.withRowKey(row, pageIndex, i));
          const total = wrapper?.TotalRows ?? res.TotalCount ?? list.length;
          return {
            ...res,
            Data: list,
            TotalCount: total,
          } as ApiResponse<QueryASS17030Detail[]>;
        })
      );
  }

  private withRowKey(row: QueryASS17030Detail, pageIndex: number, index: number): QueryASS17030Detail {
    const key = `${pageIndex}_${index}_${row.RowNo ?? ''}_${row.Goods ?? ''}`;
    return { ...row, _rowKey: key };
  }
}
