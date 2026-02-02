import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS11100Data, ASS11100DeleteRequest, ASS11100InsertRequest, ASS11100QueryDataWrapper, ASS11100QueryRequest, ASS11100UpdateRequest } from '@pages/ass/ass11100/ass11100.model';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

type ASS11100QueryRawResponse = Omit<BaseQueryResponse<ASS11100Data>, 'Data' | 'TotalCount'> & {
  Data: ASS11100QueryDataWrapper;
};

@Injectable({ providedIn: 'root' })
export class ASS11100Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢倉別設定資料。後端回傳巢狀 Data.QueryData / Data.TotalCount，在此扁平化為 Data / TotalCount。
   */
  queryASS11100(payload: ASS11100QueryRequest): Observable<BaseQueryResponse<ASS11100Data>> {
    return this.http
      .post<ASS11100QueryRawResponse>(`${this.apiUrl}/queryASS11100`, payload)
      .pipe(
        map(res => ({
          ...res,
          Data: res.Data.QueryData,
          TotalCount: res.Data.TotalCount ?? (res.Data as any).TotalRows ?? (res as any).TotalCount ?? 0
        } as BaseQueryResponse<ASS11100Data>))
      );
  }

  /**
   * 刪除倉別設定資料
   */
  deleteASS11100(payload: ASS11100DeleteRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deleteASS11100`, payload);
  }

  /**
   * 新增倉別設定資料
   */
  insertASS11100(payload: ASS11100InsertRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertASS11100`, payload);
  }

  /**
   * 更新倉別設定資料
   */
  updateASS11100(payload: ASS11100UpdateRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateASS11100`, payload);
  }
}
