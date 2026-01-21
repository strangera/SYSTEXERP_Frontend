import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS11030Data, ASS11030InsertRequest, ASS11030QueryRequest, ASS11030UpdateRequest, ASS11030UpdateResult } from '@pages/ass/ass11030/ass11030.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** 查詢回應資料結構 */
export interface ASS11030QueryDataWrapper {
  TotalCount: number;
  QueryData: ASS11030Data[];
}

@Injectable({ providedIn: 'root' })
export class ASS11030Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢小分類資料
   */
  queryASS11030(payload: ASS11030QueryRequest): Observable<ApiResponse<ASS11030QueryDataWrapper>> {
    return this.http.post<ApiResponse<ASS11030QueryDataWrapper>>(`${this.apiUrl}/queryASS11030`, payload);
  }

  /**
   * 新增小分類資料
   */
  insertASS11030(payload: ASS11030InsertRequest): Observable<ApiResponse<ASS11030UpdateResult>> {
    return this.http.post<ApiResponse<ASS11030UpdateResult>>(`${this.apiUrl}/insertASS11030`, payload);
  }

  /**
   * 更新小分類資料
   */
  updateASS11030(payload: ASS11030UpdateRequest): Observable<ApiResponse<ASS11030UpdateResult>> {
    return this.http.post<ApiResponse<ASS11030UpdateResult>>(`${this.apiUrl}/updateASS11030`, payload);
  }
}
