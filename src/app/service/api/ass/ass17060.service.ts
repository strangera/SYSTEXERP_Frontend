import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  QueryASS17060DataWrapper,
  QueryASS17060Detail,
  QueryASS17060Request,
} from '@pages/ass/ass17060/ass17060.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

type QueryASS17060RawResponse = Omit<ApiResponse<QueryASS17060Detail[]>, 'Data'> & {
  Data: QueryASS17060DataWrapper;
};

@Injectable({ providedIn: 'root' })
export class ASS17060Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  queryASS17060(body: QueryASS17060Request): Observable<ApiResponse<QueryASS17060Detail[]>> {
    return this.http.post<QueryASS17060RawResponse>(`${this.apiUrl}/queryASS17060`, body).pipe(
      map((res) => ({
        ...res,
        Data: res.Data?.Details ?? [],
        TotalCount: res.Data?.TotalRows ?? res.TotalCount ?? 0,
      }) as ApiResponse<QueryASS17060Detail[]>),
    );
  }
}
