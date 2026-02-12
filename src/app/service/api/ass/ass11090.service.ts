import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
<<<<<<< HEAD
import {
  ASS11090Data,
  ASS11090DetailRequest,
  ASS11090QueryDataWrapper,
  ASS11090QueryRequest,
  ASS11090UpdateRequest
} from '@pages/ass/ass11090/ass11090.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
=======
import { ASS11090Data, ASS11090DetailRequest, ASS11090QueryRequest, ASS11090UpdateRequest } from '@pages/ass/ass11090/ass11090.model';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
>>>>>>> dev
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS11090Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢資材中分類會計科目維護資料
   */
<<<<<<< HEAD
  queryASS11090(payload: ASS11090QueryRequest): Observable<ApiResponse<ASS11090Data[]>> {
    return this.http.post<ApiResponse<ASS11090QueryDataWrapper>>(`${this.apiUrl}/queryASS11090`, payload)
      .pipe(
        map(res => {
          // res.TotalCount 已在根層級，...res 會自動帶入，只需覆蓋 Data
          return {
            ...res,
            Data: res.Data.QueryData,
          } as ApiResponse<ASS11090Data[]>;
        })
      );
=======
  queryASS11090(payload: ASS11090QueryRequest): Observable<BaseQueryResponse<ASS11090Data>> {
    return this.http.post<BaseQueryResponse<ASS11090Data>>(`${this.apiUrl}/ASS11090Query`, payload);
>>>>>>> dev
  }

  /**
   * 查詢資材中分類會計科目維護明細資料
   */
  queryASS11090Detail(payload: ASS11090DetailRequest): Observable<ApiResponse<ASS11090Data>> {
<<<<<<< HEAD
    return this.http.post<ApiResponse<ASS11090Data>>(`${this.apiUrl}/detailASS11090`, payload);
=======
    return this.http.post<ApiResponse<ASS11090Data>>(`${this.apiUrl}/ASS11090Detail`, payload);
>>>>>>> dev
  }

  /**
   * 更新資材中分類會計科目維護資料
   */
<<<<<<< HEAD
  updateASS11090(payload: ASS11090UpdateRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/updateASS11090`, payload);
=======
  updateASS11090(payload: ASS11090UpdateRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/ASS11090Update`, payload);
>>>>>>> dev
  }
}
