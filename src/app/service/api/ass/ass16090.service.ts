import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** 查詢 Request */
export interface Ass16090QueryRequest extends BaseQueryRequest {
  MID?: number | null;
  STO_NO?: string | null;
  WH_ID?: string | null;
  DAMAGEM_STATUS?: string | null;
  DAMAGEM_ID?: string | null;
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

/** 查詢列表 Row */
export interface Ass16090Row {
  ROWNO?: number | null;
  ID?: number | null;
  DAMAGEM_ID?: string | null;
  EMP_ID?: string | null;
  EMP_NAME?: string | null;
  ORG_ID?: string | null;
  ORG_NAME?: string | null;
  WH_ID?: string | null;
  WH_NAME?: string | null;
  APPLY_DATE?: string | null;
  APRV_DATE?: string | null;
  DAMAGEM_STATUS?: string | null;
  DAMAGEM_STATUS_NAME?: string | null;
  DETAIL_COUNT?: number | null;
  NOTES?: string | null;
  Details?: Ass16090DetailRow[] | null;
  TotalCount?: number | null;
  [key: string]: any;
}

/** 詳細查詢 Request */
export interface Ass16090DetailRequest {
  MID?: number | null;
  STO_NO?: string | null;
  ID?: number | null;
  DAMAGEM_ID?: string | null;
}

/** 明細 Row */
export interface Ass16090DetailRow {
  D_ID?: number | null;
  DAMAGEM_M_ID?: number | null;
  LINE_NUM?: number | null;
  GOODS_ID?: string | null;
  GOODS_NAME?: string | null;
  GOODS_UNIT?: string | null;
  GOODS_UNIT_NAME?: string | null;
  QTY?: number | null;
  NOTES?: string | null;

  /** queryASS16090_DropDownList 帶回欄位 */
  APPLYABLE_QTY?: number | null;
  ACTUAL_STOCK_QTY?: number | null;
  SAFE_QTY?: number | null;
  STOCK_SAFE?: string | null;

  [key: string]: any;
}

/** 詳細 Response 主檔 */
export interface Ass16090DetailResponse {
  ID?: number | null;
  DAMAGEM_ID?: string | null;
  EMP_ID?: string | null;
  EMP_NAME?: string | null;
  ORG_ID?: string | null;
  ORG_NAME?: string | null;
  WH_ID?: string | null;
  WH_NAME?: string | null;
  APPLY_DATE?: string | null;
  NOTES?: string | null;
  DAMAGEM_STATUS?: string | null;
  DAMAGEM_STATUS_NAME?: string | null;
  APRV_EMP_ID?: string | null;
  APRV_EMP_NAME?: string | null;
  APRV_DATE?: string | null;
  Details?: Ass16090DetailRow[] | null;
}

/** 新增明細 */
export interface Ass16090InsertDetail {
  LINE_NUM?: number | null;
  GOODS_ID?: string | null;
  QTY?: number | null;
  NOTES?: string | null;
}

/** 新增 Request */
export interface Ass16090InsertRequest {
  MID?: number | null;
  STO_NO?: string | null;
  WH_ID: string;
  EMP_ID: string;
  ORG_ID: string;
  APPLY_DATE: string;
  NOTES?: string | null;
  DetailList: Ass16090InsertDetail[];
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

/** 更新 Request */
export interface Ass16090UpdateRequest extends Ass16090InsertRequest {
  ID: number;
  DAMAGEM_ID?: string | null;
}

/** 審核 Request */
export interface Ass16090ApproveRequest {
  MID?: number | null;
  STO_NO?: string | null;
  ID?: number | null;
  APRV_EMP_ID?: string | null;
  APRV_DATE?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

/** 作廢 Request */
export interface Ass16090VoidRequest {
  MID?: number | null;
  STO_NO?: string | null;
  ID?: number | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

/** ASS16090 品項下拉 Request */
export interface QueryDDLASS16090Request {
  Keyword?: string | null;
  WH_ID?: string | null;
  GoodsPrefix?: string | null;
}

/** ASS16090 品項下拉 Response */
export interface QueryDDLASS16090Response {
  GOODS_ID?: string | null;
  GOODS_NAME?: string | null;
  UNIT?: string | null;
  APPLYABLE_QTY?: number | null;
  ACTUAL_STOCK_QTY?: number | null;
  SAFE_QTY?: number | null;
  STOCK_SAFE?: string | null;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class ASS16090Service {
  private apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private http: HttpClient) {}

  queryASS16090(
    body: Ass16090QueryRequest
  ): Observable<ApiResponse<Ass16090Row[]>> {
    return this.http.post<ApiResponse<Ass16090Row[]>>(
      `${this.apiUrl}/queryASS16090`,
      body
    );
  }

  queryDetailASS16090(
    body: Ass16090DetailRequest
  ): Observable<ApiResponse<Ass16090DetailResponse>> {
    return this.http.post<ApiResponse<Ass16090DetailResponse>>(
      `${this.apiUrl}/queryDetailASS16090`,
      body
    );
  }

  insertASS16090(
    body: Ass16090InsertRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/insertASS16090`,
      body
    );
  }

  updateASS16090(
    body: Ass16090UpdateRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/updateASS16090`,
      body
    );
  }

  approveASS16090(
    body: Ass16090ApproveRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/approveASS16090`,
      body
    );
  }

  voidASS16090(body: Ass16090VoidRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/voidASS16090`,
      body
    );
  }

  /** 品項下拉 / 搜尋 */
  queryASS16090_DropDownList(
    body: QueryDDLASS16090Request
  ): Observable<ApiResponse<QueryDDLASS16090Response[]>> {
    return this.http.post<ApiResponse<QueryDDLASS16090Response[]>>(
      `${this.apiUrl}/queryASS16090_DropDownList`,
      body
    );
  }
}

export { ApiResponse };