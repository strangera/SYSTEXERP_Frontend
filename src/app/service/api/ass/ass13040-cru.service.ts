import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS13040AssetQueryRequest,
  ASS13040AssetQueryRow,
  ASS13040DetailRequest,
  ASS13040DetailResponseData,
} from '@pages/ass/ass13040-cru/ass13040-cru.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS13040CRUService {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) { }

  /** 查詢報廢單主檔+明細（Request 僅需 ID：主檔值/報廢單ID） */
  detailASS13040(body: ASS13040DetailRequest): Observable<ApiResponse<ASS13040DetailResponseData>> {
    return this.http.post<ApiResponse<ASS13040DetailResponseData>>(
      `${this.apiUrl}/queryDetailASS13040`,
      body,
    );
  }

  insertASS13040(body: FormData): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/insertASS13040`, body);
  }

  updateASS13040(body: FormData): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/updateASS13040`, body);
  }

  /**
   * 資產 popup 查詢（對接 queryFAASSETChooseListASS13040）
   */
  queryASS13040Assets(
    body: ASS13040AssetQueryRequest,
  ): Observable<ApiResponse<ASS13040AssetQueryRow[]>> {
    return this.http.post<ApiResponse<ASS13040AssetQueryRow[]>>(
      `${this.apiUrl}/queryFAASSETChooseListASS13040`,
      body,
    );
  }
}
