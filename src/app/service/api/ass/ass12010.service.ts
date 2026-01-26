import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS12010Data, ASS12010InsertRequest, ASS12010QueryRequest, ASS12010UpdateRequest } from '@pages/ass/ass12010/ass12010.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS12010Service {
  // TODO: 等 API 規格確認後，更新此路徑
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢請購申請資料
   * TODO: 等 API 規格確認後，更新端點路徑
   */
  queryASS12010(payload: ASS12010QueryRequest): Observable<ApiResponse<ASS12010Data[]>> {
    return this.http.post<ApiResponse<ASS12010Data[]>>(`${this.apiUrl}/queryASS12010`, payload);
  }

  /**
   * 新增請購申請資料
   * TODO: 等 API 規格確認後，更新端點路徑
   */
  insertASS12010(payload: ASS12010InsertRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertASS12010`, payload);
  }

  /**
   * 更新請購申請資料
   * TODO: 等 API 規格確認後，更新端點路徑
   */
  updateASS12010(payload: ASS12010UpdateRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateASS12010`, payload);
  }
}
