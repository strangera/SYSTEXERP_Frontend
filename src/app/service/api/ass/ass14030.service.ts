import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS14030DetailResult,
  ASS14030PayDetailResult,
  ASS14030PayDetailRow,
  ASS14030QueryDataWrapper,
  ASS14030QueryRow,
  QueryASS14030DetailRequest,
  QueryASS14030PayDetailRequest,
  QueryASS14030Request,
  UpdateASS14030Request,
  UpdateASS14030Result,
} from '@pages/ass/ass14030/ass14030.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS14030Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) {}

  /**
   * 傳票審核傳送查詢
   */
  queryASS14030(body: QueryASS14030Request): Observable<ApiResponse<ASS14030QueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS14030QueryDataWrapper>>(`${this.apiUrl}/queryASS14030`, body)
      .pipe(
        map(res => ({
          ...res,
          Data: res.Data?.QueryData ?? [],
          TotalCount: res.Data?.TotalRows ?? 0,
        } as ApiResponse<ASS14030QueryRow[]>)),
      );
  }

  /**
   * 傳票審核傳送明細查詢
   */
  queryASS14030Detail(body: QueryASS14030DetailRequest): Observable<ApiResponse<ASS14030DetailResult>> {
    return this.http.post<ApiResponse<ASS14030DetailResult>>(`${this.apiUrl}/queryASS14030Detail`, body);
  }

  /**
   * 更新傳票審核傳送作業
   */
  updateASS14030(body: UpdateASS14030Request): Observable<ApiResponse<UpdateASS14030Result>> {
    return this.http.post<ApiResponse<UpdateASS14030Result>>(`${this.apiUrl}/updateASS14030`, body);
  }

  /**
   * 查詢應收付明細
   */
  queryASS14030PayDetail(body: QueryASS14030PayDetailRequest): Observable<ApiResponse<ASS14030PayDetailRow[]>> {
    return this.http
      .post<ApiResponse<ASS14030PayDetailResult>>(`${this.apiUrl}/queryASS14030PayDetail`, body)
      .pipe(
        map(res => ({
          ...res,
          Data: res.Data?.QueryData ?? [],
          TotalCount: res.Data?.TotalCount ?? 0,
        } as ApiResponse<ASS14030PayDetailRow[]>)),
      );
  }
}
