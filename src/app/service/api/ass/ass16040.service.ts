import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  ASS16040ApproveRequest,
  ASS16040DetailRow,
  ASS16040MasterRow,
  ASS16040NestedQueryData,
  ASS16040QueryRequest,
} from '@pages/ass/ass16040/ass16040.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { environment } from '../../../../environments/environment';

/**
 * 後端原始（巢狀）回傳結構 — 內部使用，service 層展平後對外回傳標準 ApiResponse<T[]>。
 * SPEC §10.2
 */
type NestedQueryResponse<T> = Omit<ApiResponse<ASS16040NestedQueryData<T>>, 'Data'> & {
  Data: ASS16040NestedQueryData<T>;
};

/**
 * ASS16040 領用審核作業 API service。
 * 巢狀 Response 由 service 層展平成 `{ Data: T[], TotalCount: number }`，符合 CLAUDE.local.md §2 規範。
 */
@Injectable({ providedIn: 'root' })
export class ASS16040Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  /**
   * 查詢領用單列表（主檔模式）— 給查詢頁用。
   * 後端內部對應 `dbo.SP_ASS16040Query @Mode='M'`。
   * SPEC §7.1
   */
  queryASS16040M(payload: ASS16040QueryRequest): Observable<ApiResponse<ASS16040MasterRow[]>> {
    return this.http
      .post<NestedQueryResponse<ASS16040MasterRow>>(`${this.apiUrl}/queryASS16040`, payload)
      .pipe(map(res => this.flattenNested<ASS16040MasterRow>(res)));
  }

  /**
   * 查詢領用單主檔 + 明細（給 CRU 頁用）。
   * 後端內部對應 `dbo.SP_ASS16040Query @Mode='D'`。
   * SPEC §7.2
   */
  queryASS16040(payload: ASS16040QueryRequest): Observable<ApiResponse<ASS16040DetailRow[]>> {
    return this.http
      .post<NestedQueryResponse<ASS16040DetailRow>>(`${this.apiUrl}/queryASS16040D`, payload)
      .pipe(map(res => this.flattenNested<ASS16040DetailRow>(res)));
  }

  /**
   * 確認審核 — 將單據狀態由「領用申請」更新為「審核確認」。
   * 後端內部對應 `dbo.SP_ASS16040Approve`。
   * APRV_EMP_ID 由後端從 JWT 取，前端不送（SPEC §7.3, user-answer-Q-005）。
   */
  approveASS16040(
    payload: ASS16040ApproveRequest,
  ): Observable<ApiResponse<{ MTAPPLY_ID: string }>> {
    return this.http.post<ApiResponse<{ MTAPPLY_ID: string }>>(
      `${this.apiUrl}/approveASS16040`,
      payload,
    );
  }

  /**
   * 將後端巢狀 `{ Data: { QueryData: T[], TotalCount, TotalPage } }` 展平為元件層可用的
   * `{ Data: T[], TotalCount, TotalPage }`。
   * SPEC §10.2
   */
  private flattenNested<T>(res: NestedQueryResponse<T>): ApiResponse<T[]> {
    const inner = res?.Data;
    const data: T[] = inner?.QueryData ?? [];
    return {
      Status: res?.Status,
      Message: res?.Message,
      Data: data,
      TotalCount: inner?.TotalCount ?? 0,
      TotalPage: inner?.TotalPage ?? 0,
      Error: res?.Error,
      Meta: res?.Meta,
    } as ApiResponse<T[]>;
  }
}
