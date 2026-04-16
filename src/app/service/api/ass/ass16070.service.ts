import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Ass16070QueryRequest extends BaseQueryRequest {
  MID?: number | null;
  STO_NO?: string | null;
  OUT_WH_ID?: string | null;
  IN_WH_ID?: string | null;
  WHMOVE_ID?: string[] | string | null;
  WHMOVE_STATUS?: string | null;
  EMP_ID?: string | null;
  GOODS_ID?: string[] | string | null;
  ORG_ID?: string | null;
  APPLY_DATE_S?: string | null;
  APPLY_DATE_E?: string | null;
  APRV_DATE_S?: string | null;
  APRV_DATE_E?: string | null;
  APRV_EMP_ID?: string | null;
  [key: string]: any;
}

export interface Ass16070Row {
  RowNo?: number | null;
  ID?: number | null;
  WHMOVE_ID?: string | null;
  EMP_ID?: string | null;
  EmpName?: string | null;
  ORG_ID?: string | null;
  OrgName?: string | null;
  APPLY_DATE?: string | null;
  OUT_WH_ID?: string | null;
  OutWhName?: string | null;
  OUTGODS_DATE?: string | null;
  IN_WH_ID?: string | null;
  InWhName?: string | null;
  SUBCHK_DATE?: string | null;
  WHMOVE_STATUS?: string | null;
  WhmoveStatusName?: string | null;
  ItemCount?: number | null;
  Details?: Ass16070DetailItem[] | null;
  [key: string]: any;
}

export interface Ass16070DetailRequest {
  ID: string | number;
}

export interface Ass16070DetailItem {
  ID?: number | null;
  LINE_NUM?: number | null;
  GOODS_ID?: string | null;
  GOODS_NAME?: string | null;
  UNIT?: string | null;
  QTY?: number | null;
  NOTES?: string | null;
  APPLYABLE_QTY?: number | null;
  ACTUAL_STOCK_QTY?: number | null;
  SAFE_QTY?: number | null;
  STOCK_SAFE?: string | null;
  [key: string]: any;
}

export interface Ass16070DetailResponse {
  ID?: number | null;
  WHMOVE_ID?: string | null;
  OUT_WH_ID?: string | null;
  OutWhName?: string | null;
  IN_WH_ID?: string | null;
  InWhName?: string | null;
  EMP_ID?: string | null;
  ORG_ID?: string | null;
  APPLY_DATE?: string | null;
  NOTES?: string | null;
  WHMOVE_STATUS?: string | null;
  WhmoveStatusName?: string | null;
  APRV_EMP_ID?: string | null;
  APRV_DATE?: string | null;
  OUTGODS_DATE?: string | null;
  SUBCHK_DATE?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  CRT_DATE?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  UPD_DATE?: string | null;
  Details?: Ass16070DetailItem[] | null;
}

export interface Ass16070DetailPayload {
  GOODS_ID: string;
  QTY: number;
  NOTES?: string | null;
}

export interface Ass16070InsertRequest {
  MID?: number | null;
  STO_NO?: string | null;
  OUT_WH_ID?: string | null;
  IN_WH_ID?: string | null;
  EMP_ID?: string | null;
  ORG_ID?: string | null;
  APPLY_DATE?: string | null;
  NOTES?: string | null;
  DetailList: Ass16070DetailPayload[];
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

export interface Ass16070UpdateRequest {
  ID: number;
  MID?: number | null;
  STO_NO?: string | null;
  OUT_WH_ID?: string | null;
  IN_WH_ID?: string | null;
  EMP_ID?: string | null;
  ORG_ID?: string | null;
  APPLY_DATE?: string | null;
  NOTES?: string | null;
  DetailList: Ass16070DetailPayload[];
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

export interface Ass16070ApproveRequest {
  ID: number;
  APRV_EMP_ID?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

export interface Ass16070VoidRequest {
  ID: number;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

export interface QueryDDLASS16070Request {
  Keyword?: string | null;
  GoodsPrefix?: string | null;
  WH_ID?: string | null;
}

export interface QueryDDLASS16070Response {
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
export class ASS16070Service {
  private apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private http: HttpClient) {}

  queryASS16070(
    body: Ass16070QueryRequest
  ): Observable<ApiResponse<Ass16070Row[]>> {
    return this.http.post<ApiResponse<Ass16070Row[]>>(
      `${this.apiUrl}/queryASS16070`,
      body
    );
  }

  queryDetailASS16070(
    body: Ass16070DetailRequest
  ): Observable<ApiResponse<Ass16070DetailResponse>> {
    return this.http.post<ApiResponse<Ass16070DetailResponse>>(
      `${this.apiUrl}/queryDetailASS16070`,
      body
    );
  }

  insertASS16070(
    body: Ass16070InsertRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/insertASS16070`,
      body
    );
  }

  updateASS16070(
    body: Ass16070UpdateRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/updateASS16070`,
      body
    );
  }

  approveASS16070(
    body: Ass16070ApproveRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/approveASS16070`,
      body
    );
  }

  voidASS16070(
    body: Ass16070VoidRequest
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/voidASS16070`,
      body
    );
  }

  queryASS16070_DropDownList(
    body: QueryDDLASS16070Request
  ): Observable<ApiResponse<QueryDDLASS16070Response[]>> {
    return this.http.post<ApiResponse<QueryDDLASS16070Response[]>>(
      `${this.apiUrl}/queryASS16090_DropDownList`,
      body
    );
  }
}

export { ApiResponse };