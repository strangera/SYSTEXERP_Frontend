import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS16060DetailRow,
  ASS16060MasterRow,
  ASS16060QueryDataWrapper,
  ASS16060QueryRequest,
} from '@pages/ass/ass16060/ass16060.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** insertASS16060 — DetailTable 列（ASS16060DetailItem） */
export interface ASS16060DetailItem {
  LINE_NUM?: number | null;
  GOODS_ID?: string | null;
  QTY?: number | null;
  GOODS_PRICE?: number | null;
  TAX_CODE?: string | null;
  AMT?: number | null;
  CHECK_QTY?: number | null;
  NOTES?: string | null;
}

/** insertASS16060 — 請求本體 */
export interface ASS16060InsertRequest {
  MID: number;
  STO_NO: string;
  WH_ID: string;
  EMP_ID: string;
  ORG_ID: string;
  RETURN_DATE: string;
  NOTES?: string | null;
  CRT_USR_No: string;
  DetailTable: ASS16060DetailItem[];
}

/** queryASS16060Master — 單一主檔（含退回說明 NOTES 與狀態） */
export interface ASS16060MasterInfo {
  MTRETURN_ID?: string | null;
  EMP_ID?: string | null;
  ORG_ID?: string | null;
  WH_ID?: string | null;
  RETURN_DATE?: string | null;
  NOTES?: string | null;
  /** 1=已申請、2=已審核 */
  MTRETURNM_STATUS?: string | null;
}

/** updateASS16060 — 請求本體（明細只有 LINE_NUM、QTY、NOTES 有作用） */
export interface ASS16060UpdateRequest {
  MID: number;
  STO_NO: string;
  MTRETURN_ID: string;
  WH_ID: string;
  NOTES?: string | null;
  DetailTable: ASS16060DetailItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ASS16060Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) { }

  /**
   * 查詢主檔列表（給查詢頁用）
   * 後端原始回傳為 `ApiResponse<{ QueryData[], TotalCount, TotalPage }>`，
   * service 層攤平為 `ApiResponse<Row[]>` + 頂層 TotalCount，
   * 與 ASS16050 同模式。
   */
  queryASS16060M(
    body: ASS16060QueryRequest,
  ): Observable<ApiResponse<ASS16060MasterRow[]>> {
    return this.http
      .post<ApiResponse<ASS16060QueryDataWrapper<ASS16060MasterRow>>>(
        `${this.apiUrl}/queryASS16060`,
        body,
      )
      .pipe(map((res) => this.flattenWrapper(res)));
  }

  /** 查詢主檔+明細（給 CRU 頁帶 MTRETURN_ID 取單一單據明細用） */
  queryASS16060(
    body: ASS16060QueryRequest,
  ): Observable<ApiResponse<ASS16060DetailRow[]>> {
    return this.http
      .post<ApiResponse<ASS16060QueryDataWrapper<ASS16060DetailRow>>>(
        `${this.apiUrl}/queryASS16060D`,
        body,
      )
      .pipe(map((res) => this.flattenWrapper(res)));
  }

  insertASS16060(
    body: ASS16060InsertRequest,
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiUrl}/insertASS16060`,
      body,
    );
  }

  /** 查單一退回單主檔（SP_ASS16060Query 不回退回說明，編輯頁用這支） */
  queryASS16060Master(
    body: { MID: number; STO_NO: string; MTRETURN_ID: string },
  ): Observable<ApiResponse<ASS16060MasterInfo>> {
    return this.http.post<ApiResponse<ASS16060MasterInfo>>(
      `${this.apiUrl}/queryASS16060Master`,
      body,
    );
  }

  /** 審核（僅已申請單據；後端 SP_ASS16060Approve 把狀態改為 2） */
  approveASS16060(
    body: { MID: number; STO_NO: string; MTRETURN_ID: string },
  ): Observable<ApiResponse<{ MTRETURN_ID?: string; MTRETURNM_STATUS?: string; MESSAGE?: string }>> {
    return this.http.post<ApiResponse<{ MTRETURN_ID?: string; MTRETURNM_STATUS?: string; MESSAGE?: string }>>(
      `${this.apiUrl}/approveASS16060`,
      body,
    );
  }

  updateASS16060(
    body: ASS16060UpdateRequest,
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiUrl}/updateASS16060`,
      body,
    );
  }

  /** 把 `ApiResponse<Wrapper<T>>` 攤平為 `ApiResponse<T[]>`，並把 TotalCount 提升到頂層 */
  private flattenWrapper<T>(
    res: ApiResponse<ASS16060QueryDataWrapper<T>>,
  ): ApiResponse<T[]> {
    return {
      ...res,
      Data: res.Data?.QueryData ?? [],
      TotalCount: res.Data?.TotalCount ?? res.TotalCount ?? 0,
      TotalPage: res.Data?.TotalPage ?? res.TotalPage ?? 0,
    };
  }
}
