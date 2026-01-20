import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS11080Data, ASS11080UpdateRequest, ASS11080UpdateResult } from '@pages/ass/ass11080/ass11080.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS11080Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS2000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢處分資產基本設定
   */
  queryASS11080(): Observable<ApiResponse<ASS11080Data>> {
    return this.http.post<ApiResponse<ASS11080Data>>(`${this.apiUrl}/queryASS11080`, {});
  }

  /**
   * 更新處分資產基本設定
   */
  updateASS11080(payload: ASS11080UpdateRequest): Observable<ApiResponse<ASS11080UpdateResult>> {
    return this.http.post<ApiResponse<ASS11080UpdateResult>>(`${this.apiUrl}/updateASS11080`, payload);
  }
}
