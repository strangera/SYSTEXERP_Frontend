import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS15080QueryDataWrapper,
  ASS15080QueryRequest,
  ASS15080QueryRow,
} from '@pages/ass/ass15080/ass15080.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS15080Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) {}

  queryASS15080(
    body: ASS15080QueryRequest
  ): Observable<ApiResponse<ASS15080QueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS15080QueryDataWrapper>>(
        `${this.apiUrl}/queryASS15080`,
        body
      )
      .pipe(
        map(
          (res) =>
            ({
              ...res,
              Data: res.Data?.QueryData ?? [],
              TotalCount:
                res.Data?.TotalRows ?? res.TotalCount ?? 0,
            }) as ApiResponse<ASS15080QueryRow[]>
        )
      );
  }
}
