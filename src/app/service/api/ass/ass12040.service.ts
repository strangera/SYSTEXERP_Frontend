import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS12040ApproveRequest,
  ASS12040DetailRequest,
  ASS12040DetailResponse,
  ASS12040QueryDataWrapper,
  ASS12040QueryRequest,
  ASS12040QueryRow,
} from '@pages/ass/ass12040/ass12040.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * ASS12040 採購單審核作業 API
 * TODO: 待 API 規格確認後補上路徑與參數（審核是否區分強制結案/審核確認）
 */
@Injectable({ providedIn: 'root' })
export class ASS12040Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  /**
   * 查詢功能
   */
  queryASS12040(payload: ASS12040QueryRequest): Observable<ApiResponse<ASS12040QueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS12040QueryRow[] | ASS12040QueryDataWrapper>>(
        `${this.apiUrl}/queryASS12040`,
        payload
      )
      .pipe(
        map(res => {
          const raw = res.Data;
          const list = Array.isArray(raw)
            ? raw
            : (raw as ASS12040QueryDataWrapper)?.QueryData ?? [];
          const total =
            (res as ApiResponse<ASS12040QueryRow[]>).TotalCount ??
            (raw as ASS12040QueryDataWrapper)?.TotalRows ??
            0;
          return { ...res, Data: list, TotalCount: total } as ApiResponse<ASS12040QueryRow[]>;
        })
      );
  }

  /**
   * 詳細功能（取得單筆）
   */
  detailASS12040(payload: ASS12040DetailRequest): Observable<ApiResponse<ASS12040DetailResponse>> {
    return this.http.post<ApiResponse<ASS12040DetailResponse>>(
      `${this.apiUrl}/detailASS12040`,
      payload
    );
  }

  /**
   * 審核功能（強制結案 / 審核確認 皆先共用此介面）
   * TODO: 審核功能 API 參數與回傳規格待後端確認；是否區分強制結案與審核確認端點
   */
  approveASS12040(payload: ASS12040ApproveRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/approveASS12040`, payload);
  }
}
