import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Ass16050DispatchData,
  Ass16050DispatchRequest,
  Ass16050QueryData,
  Ass16050QueryRequest,
} from '../../../pages/ass/ass16050/ass16050.model';

@Injectable({ providedIn: 'root' })
export class ASS16050Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) {}

  /** 查詢領用發料清單 */
  queryASS16050(
    body: Ass16050QueryRequest
  ): Observable<ApiResponse<Ass16050QueryData[]>> {
    return this.http.post<ApiResponse<Ass16050QueryData[]>>(
      `${this.apiUrl}/queryASS16050`,
      body
    );
  }

  /** 執行結案/發料（更新單據狀態為「領用發料」） */
  dispatchASS16050(
    body: Ass16050DispatchRequest
  ): Observable<ApiResponse<Ass16050DispatchData>> {
    return this.http.post<ApiResponse<Ass16050DispatchData>>(
      `${this.apiUrl}/dispatchASS16050`,
      body
    );
  }
}

// 重新匯出 model 介面，方便外部 component 沿用 service 路徑取得型別
export type {
  Ass16050DispatchData,
  Ass16050DispatchRequest,
  Ass16050GroupedRecord,
  Ass16050ItemRow,
  Ass16050QueryData,
  Ass16050QueryRequest,
} from '../../../pages/ass/ass16050/ass16050.model';
