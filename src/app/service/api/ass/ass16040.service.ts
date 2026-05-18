import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import {
  ASS16040ApproveRequest,
  ASS16040Data,
  ASS16040QueryRequest,
} from '@pages/ass/ass16040/ass16040.model';

@Injectable({
  providedIn: 'root',
})
export class ASS16040Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  /**
   * 查詢領用審核單列表
   */
  queryASS16040(payload: ASS16040QueryRequest): Observable<ApiResponse<ASS16040Data[]>> {
    return this.http.post<ApiResponse<ASS16040Data[]>>(
      `${this.apiUrl}/queryASS16040`,
      payload,
    );
  }

  /**
   * 確認審核
   */
  approveASS16040(payload: ASS16040ApproveRequest): Observable<ApiResponse<{ MTAPPLY_ID: string }>> {
    return this.http.post<ApiResponse<{ MTAPPLY_ID: string }>>(
      `${this.apiUrl}/approveASS16040`,
      payload,
    );
  }
}
