import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** 查詢 Request */
export interface QueryASS16080Request extends BaseQueryRequest {
  OUT_WH_ID?: string | null;
  IN_WH_ID?: string | null;
  WHMOVE_STATUS?: string | null;
  WHMOVE_ID?: string | null;
  EMP_ID?: string | null;
  GOODS_ID?: string | null;
  ORG_ID?: string | null;
  APPLY_DATE_S?: string | null;
  APPLY_DATE_E?: string | null;
  APRV_DATE_S?: string | null;
  APRV_DATE_E?: string | null;
  APRV_EMP_ID?: string | null;
  [key: string]: any;
}

/** 查詢列表 Response Row */
export interface QueryASS16080Response {
  RowNo?: number | null;
  WHMOVE_ID?: string | null;
  EMP_ID?: string | null;
  ORG_ID?: string | null;
  APPLY_DATE?: string | null;
  OUT_WH_ID?: string | null;
  OutWhName?: string | null;
  OUTGODS_DATE?: string | null;
  IN_WH_ID?: string | null;
  InWhName?: string | null;
  SUBCHK_DATE?: string | null;
  WHMOVE_STATUS?: string | null;
  APRV_EMP_ID?: string | null;
  APRV_DATE?: string | null;
  DetailCount?: number | null;

  /** 前端展開用 */
  Details?: QueryDetailASS16080DetailResponse[] | null;
  [key: string]: any;
}

/** 詳細查詢 Request */
export interface QueryDetailASS16080Request {
  WHMOVE_ID: string;
}

/** 詳細主檔 */
export interface QueryDetailASS16080MasterResponse {
  ID?: number | null;
  WHMOVE_ID?: string | null;
  WHMOVE_STATUS?: string | null;
  OUT_WH_ID?: string | null;
  OutWhName?: string | null;
  IN_WH_ID?: string | null;
  InWhName?: string | null;
  EMP_ID?: string | null;
  EmpName?: string | null;
  ORG_ID?: string | null;
  APPLY_DATE?: string | null;
  NOTES?: string | null;
}

/** 詳細明細 */
export interface QueryDetailASS16080DetailResponse {
  RowNo?: number | null;
  DetailID?: number | null;
  GOODS_ID?: string | null;
  GOODS_NAME?: string | null;
  UNIT?: string | null;
  QTY?: number | null;
  OUTGODS_QTY?: number | null;
  NOTES?: string | null;
  [key: string]: any;
}

/** 詳細查詢 Result */
export interface QueryDetailASS16080Result {
  Master?: QueryDetailASS16080MasterResponse | null;
  Details?: QueryDetailASS16080DetailResponse[] | null;
}

/** 出庫明細 */
export interface UpdateOutASS16080Detail {
  DetailID?: number | null;
  QTY?: number | null;
}

/** 調撥出庫 Request */
export interface UpdateOutASS16080Request {
  WHMOVE_ID?: string | null;
  Details?: UpdateOutASS16080Detail[] | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

/** 入庫明細 */
export interface UpdateInASS16080Detail {
  DetailID?: number | null;
  QTY?: number | null;
}

/** 調撥入庫 Request */
export interface UpdateInASS16080Request {
  WHMOVE_ID?: string | null;
  Details?: UpdateInASS16080Detail[] | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ASS16080Service {
  private apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private http: HttpClient) {}

  queryASS16080(
    body: QueryASS16080Request
  ): Observable<ApiResponse<QueryASS16080Response[]>> {
    return this.http.post<ApiResponse<QueryASS16080Response[]>>(
      `${this.apiUrl}/queryASS16080`,
      body
    );
  }

  queryDetailASS16080(
    body: QueryDetailASS16080Request
  ): Observable<ApiResponse<QueryDetailASS16080Result>> {
    return this.http.post<ApiResponse<QueryDetailASS16080Result>>(
      `${this.apiUrl}/queryDetailASS16080`,
      body
    );
  }

  updateOutASS16080(
    body: UpdateOutASS16080Request
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/updateOutASS16080`,
      body
    );
  }

  updateInASS16080(
    body: UpdateInASS16080Request
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/updateInASS16080`,
      body
    );
  }
}

export { ApiResponse };