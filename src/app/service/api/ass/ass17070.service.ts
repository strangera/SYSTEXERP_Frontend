import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QueryASS17070DataWrapper, QueryASS17070Request } from '@pages/ass/ass17070/ass17070.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS17070Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  /**
   * ASS17070 查詢
   */
  queryASS17070(params: QueryASS17070Request): Observable<ApiResponse<QueryASS17070DataWrapper>> {
    return this.http.post<ApiResponse<QueryASS17070DataWrapper>>(`${this.apiUrl}/queryASS17070`, params);
  }
}

