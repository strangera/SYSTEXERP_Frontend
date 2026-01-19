import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS11010Data, ASS11010InsertRequest, ASS11010QueryRequest, ASS11010UpdateRequest, ASS11010UpdateResult } from '@pages/ass/ass11010/ass11010.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** 查詢回應資料結構 */
export interface ASS11010QueryDataWrapper {
  TotalCount: number;
  QueryData: ASS11010Data[];
}

@Injectable({ providedIn: 'root' })
export class ASS11010Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢大分類資料
   */
  queryASS11010(payload: ASS11010QueryRequest): Observable<ApiResponse<ASS11010QueryDataWrapper>> {
    return this.http.post<ApiResponse<ASS11010QueryDataWrapper>>(`${this.apiUrl}/QueryASS11010`, payload);
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
