import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  QueryASS13010Request,
  QueryASS13010Response,
  QueryASS13010ResultApiResponse,
} from '@pages/ass/ass13010/ass13010.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS13010Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) {}

  queryASS13010(body: QueryASS13010Request): Observable<ApiResponse<QueryASS13010Response[]>> {
    return this.http
      .post<QueryASS13010ResultApiResponse>(`${this.apiUrl}/queryASS13010`, body)
      .pipe(
        map(
          res =>
            ({
              ...res,
              Data: res.Data?.QueryData ?? [],
              TotalCount: res.Data?.TotalRows ?? res.TotalCount ?? 0,
            }) as ApiResponse<QueryASS13010Response[]>,
        ),
      );
  }
}

