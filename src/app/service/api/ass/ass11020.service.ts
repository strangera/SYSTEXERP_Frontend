import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS11020Data, ASS11020InsertRequest, ASS11020QueryDataWrapper, ASS11020QueryRequest, ASS11020UpdateRequest } from '@pages/ass/ass11020/ass11020.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS11020Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢中分類資料
   */
  queryASS11020(payload: ASS11020QueryRequest): Observable<ApiResponse<ASS11020Data[]>> {
    return this.http.post<ApiResponse<ASS11020QueryDataWrapper>>(`${this.apiUrl}/queryASS11020`, payload)
      .pipe(
        map(res => {
          return {
            ...res,
            Data: res.Data.QueryData,
            TotalCount: res.Data.TotalCount
          } as ApiResponse<ASS11020Data[]>;
        })
      );
  }

  /**
   * 新增中分類資料
   */
  insertASS11020(payload: ASS11020InsertRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/insertASS11020`, payload);
  }

  /**
   * 更新中分類資料
   */
  updateASS11020(payload: ASS11020UpdateRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/updateASS11020`, payload);
  }
}
