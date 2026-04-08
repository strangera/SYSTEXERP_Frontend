import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS11080QueryRequest, ASS11080QueryResponse, ASS11080UpdateRequest } from '@pages/ass/ass11080/ass11080.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS11080Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢處分資產基本設定
   * @param tag 可選的 TAG 參數，空字串或 undefined 查詢所有資料，有值查詢特定 TAG
   */
  queryASS11080(tag?: string): Observable<ApiResponse<ASS11080QueryResponse>> {
    const request: ASS11080QueryRequest = tag ? { TAG: tag } : {};
    return this.http.post<ApiResponse<ASS11080QueryResponse>>(`${this.apiUrl}/queryASS11080`, request);
  }

  /**
   * 更新處分資產基本設定
   */
  updateASS11080(payload: ASS11080UpdateRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/updateASS11080`, payload);
  }
}
