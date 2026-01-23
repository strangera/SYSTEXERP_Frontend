import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS11010Data, ASS11010InsertRequest, ASS11010QueryDataWrapper, ASS11010QueryRequest, ASS11010UpdateRequest, ASS11010UpdateResult } from '@pages/ass/ass11010/ass11010.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS11010Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢大分類資料
   */
  queryASS11010(payload: ASS11010QueryRequest): Observable<ApiResponse<ASS11010Data[]>> {
    return this.http.post<ApiResponse<ASS11010QueryDataWrapper>>(`${this.apiUrl}/QueryASS11010`, payload)
      .pipe(
        map(res => {
          return {
            ...res,
            Data: res.Data.QueryData,
            TotalCount: res.Data.TotalCount
          } as ApiResponse<ASS11010Data[]>;
        })
      );
  }

  /**
   * 新增大分類資料
   */
  insertASS11010(payload: ASS11010InsertRequest): Observable<ApiResponse<ASS11010UpdateResult>> {
    return this.http.post<ApiResponse<ASS11010UpdateResult>>(`${this.apiUrl}/insertASS11010`, payload);
  }

  /**
   * 更新大分類資料
   */
  updateASS11010(payload: ASS11010UpdateRequest): Observable<ApiResponse<ASS11010UpdateResult>> {
    return this.http.post<ApiResponse<ASS11010UpdateResult>>(`${this.apiUrl}/updateASS11010`, payload);
  }
}
