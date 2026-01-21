import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS11090Data, ASS11090DetailRequest, ASS11090QueryRequest } from '@pages/ass/ass11090/ass11090.model';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS11090Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢資材中分類會計科目維護資料
   */
  queryASS11090(payload: ASS11090QueryRequest): Observable<BaseQueryResponse<ASS11090Data>> {
    return this.http.post<BaseQueryResponse<ASS11090Data>>(`${this.apiUrl}/ASS11090Query`, payload);
  }

  /**
   * 查詢資材中分類會計科目維護明細資料
   */
  queryASS11090Detail(payload: ASS11090DetailRequest): Observable<ApiResponse<ASS11090Data>> {
    return this.http.post<ApiResponse<ASS11090Data>>(`${this.apiUrl}/ASS11090Detail`, payload);
  }
}
