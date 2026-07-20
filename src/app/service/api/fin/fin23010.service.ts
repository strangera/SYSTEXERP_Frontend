import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** 查詢頁清單查詢條件 */
export interface QueryFIN23010Request extends ApiRequest {
  PREP_NO?: string | null;
  APPY_DateS?: string | null;
  APPY_DateE?: string | null;
  PREP_AmtS?: number | null;
  PREP_AmtE?: number | null;
  CLOSE_DateS?: string | null;
  CLOSE_DateE?: string | null;
  VEN_No?: string | null;
  VEN_PayType?: string | null;
  BNK_No?: string | null;
  BNK_AccNo?: string | null;
  BNK_AccountName?: string | null;
  VEN_CTRLYN?: string | null;
  VEN_CheckTitle?: string | null;
  PAY_DateS?: string | null;
  PAY_DateE?: string | null;
  Summary?: string | null;
}

/** 查詢頁清單每一列 */
export interface FIN23010Data {
  RowNum: number;
  id: number;
  StoNo: string | null;
  PrepNo: string | null;
  PrepAmt: number;
  ApplyDate: string | null;
  PlanCloseDate: string | null;
  VenNo: string | null;
  VenName: string | null;
  PayType: string | null;
  PayTypeName: string | null;
  BnkNo: string | null;
  BnkAccNo: string | null;
  BnkAccountName: string | null;
  VenCtrlYN: string | null;
  VenCtrlYNName: string | null;
  VenCheckTitle: string | null;
  Summary: string | null;
  PlanPayDate: string | null;
}

/** 編輯畫面單筆資料 */
export interface FIN23010Detail {
  id: number;
  STO_No: string | null;
  PREP_NO: string | null;
  APPY_Date: string;
  VEN_No: string | null;
  VenName: string | null;
  VenEmpType: number | null;
  PREP_Amt: number;
  PAY_Date: string;
  CLOSE_Date: string;
  CLOSE_Status: string | null;
  Status: string | null;
  VEN_PayType: string | null;
  PayTypeName: string | null;
  BNK_id: string | null;
  BNK_No: string | null;
  BNK_BranchNo: string | null;
  BNK_AccNo: string | null;
  BNK_AccountName: string | null;
  VEN_CheckTitle: string | null;
  VEN_CTRLYN: string | null;
  CostOrg: string | null;
  CostOrgName: string | null;
  Summary: string | null;
  REDEEM_NO: string | null;
  VouNo: string | null;
  CRT_Date: string | null;
  CRT_USR_No: string | null;
  CRT_USR_Name: string | null;
  UPD_Date: string | null;
  UPD_USR_No: string | null;
  UPD_USR_Name: string | null;
  CanEdit: boolean;
}

export interface SaveFIN23010Request {
  ActionMode: 'I' | 'U';
  id?: number | null;
  APPY_Date: string;
  VEN_No: string;
  PREP_Amt: number;
  PAY_Date: string;
  CLOSE_Date: string;
  VEN_PayType?: string | null;
  BNK_id?: string | null;
  BNK_No?: string | null;
  BNK_BranchNo?: string | null;
  BNK_AccNo?: string | null;
  BNK_AccountName?: string | null;
  VEN_CheckTitle?: string | null;
  VEN_CTRLYN?: string | null;
  CostOrg: string;
  Summary?: string | null;
}

export interface SaveFIN23010Response {
  Success: boolean;
  Message: string;
  id: number | null;
  PrepNo: string | null;
}

export interface VoidFIN23010Response {
  Success: boolean;
  Message: string;
}

/** 廠商查詢結果(SP_FIN23010QueryVen) */
export interface QueryVenFIN23010Response {
  VenNo: string | null;
  VenName: string | null;
  VenShortName: string | null;
  PayType: string | null;
  PayTypeName: string | null;
  BnkNo: string | null;
  BnkAccNo: string | null;
  BnkAccountName: string | null;
  CheckTitle: string | null;
  VEN_PayConditionDay: number | null;
  VEN_Status: string | null;
  VEN_StatusName: string | null;
}

/** 員工查詢結果(SP_FIN23010QueryEmp) */
export interface QueryEmpFIN23010Response {
  VenNo: string | null;
  VenName: string | null;
  PayType: string | null;
  PayTypeName: string | null;
  BnkNo: string | null;
  BnkAccNo: string | null;
  BnkAccountName: string | null;
  CostOrg: string | null;
  Org_Name: string | null;
}

@Injectable({ providedIn: 'root' })
export class FIN23010Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private readonly http: HttpClient) { }

  /** 查詢頁清單查詢 */
  queryFIN23010(body: QueryFIN23010Request): Observable<ApiResponse<FIN23010Data[]>> {
    return this.http.post<ApiResponse<FIN23010Data[]>>(`${this.apiUrl}/queryFIN23010`, body);
  }

  /** 進入編輯畫面，依 id 取得單筆資料 */
  getByIdFIN23010(id: number): Observable<ApiResponse<FIN23010Detail>> {
    return this.http.post<ApiResponse<FIN23010Detail>>(`${this.apiUrl}/getByIdFIN23010`, { id });
  }

  /** 新增/修改(合併) */
  saveFIN23010(body: SaveFIN23010Request): Observable<ApiResponse<SaveFIN23010Response>> {
    return this.http.post<ApiResponse<SaveFIN23010Response>>(`${this.apiUrl}/saveFIN23010`, body);
  }

  /** 作廢 */
  voidFIN23010(id: number): Observable<ApiResponse<VoidFIN23010Response>> {
    return this.http.post<ApiResponse<VoidFIN23010Response>>(`${this.apiUrl}/voidFIN23010`, { id });
  }

  /** 新增頁「申請廠商/員工」選擇廠商時，依廠商編號查詢廠商資料 */
  queryVenFIN23010(VEN_No: string): Observable<ApiResponse<QueryVenFIN23010Response>> {
    return this.http.post<ApiResponse<QueryVenFIN23010Response>>(`${this.apiUrl}/queryVenFIN23010`, { VEN_No });
  }

  /** 新增頁「申請廠商/員工」選擇員工時，依員工編號查詢員工資料 */
  queryEmpFIN23010(user_No: string): Observable<ApiResponse<QueryEmpFIN23010Response>> {
    return this.http.post<ApiResponse<QueryEmpFIN23010Response>>(`${this.apiUrl}/queryEmpFIN23010`, { user_No });
  }
}
