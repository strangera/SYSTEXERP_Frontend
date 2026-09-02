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
  /** 統一編號/身分證字號(模糊查詢；原票據抬頭欄位改用途) */
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
  /** 統一編號/身分證字號(原票據抬頭欄位改用途) */
  VenCheckTitle: string | null;
  Summary: string | null;
  PlanPayDate: string | null;
  VouNo: string | null;
  /** 結案狀態(Y/N) */
  CloseStatus: string | null;
  /** 結案狀態(中文名稱) */
  CloseStatusName: string | null;
  /** 狀態代碼(原始值 0作廢/1建立中/2已付款/3已抽單) */
  StatusCode: string | null;
  /** 狀態(中文名稱，建立中時依簽核結果細分審核中/已審核/已駁回) */
  StatusName: string | null;
  /** 傳票狀態(中文名稱) */
  VouStatusName: string | null;
  /** 是否可刪除('1'=可刪除) */
  CanVoid: string | null;

  CanEdit: string | null;
  IsSend: string | null;
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
  /** 結案狀態(中文名稱) */
  CloseStatusName: string | null;
  /** 狀態(0作廢/1建立中/2已付款/3已抽單) */
  Status: string | null;
  /** 狀態(中文名稱，建立中時依簽核結果細分審核中/已審核/已駁回) */
  StatusName: string | null;
  /** 簽核結果(NULL=尚無結果/Y=通過/N=駁回) */
  EIP_ApproveYN: string | null;
  /** 簽核結果(中文名稱) */
  EipApproveYNName: string | null;
  VEN_PayType: string | null;
  PayTypeName: string | null;
  BNK_id: string | null;
  BNK_No: string | null;
  BNK_BranchNo: string | null;
  BNK_AccNo: string | null;
  BNK_AccountName: string | null;
  /** 統一編號/身分證字號(原票據抬頭欄位改用途) */
  VEN_CheckTitle: string | null;
  CostOrg: string | null;
  CostOrgName: string | null;
  /** 會計科目代號(GLS1005) */
  AccNo: string | null;
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
  /** 統一編號/身分證字號(原票據抬頭欄位改用途) */
  VEN_CheckTitle?: string | null;
  CostOrg: string;
  /** 會計科目代號(GLS1005) */
  AccNo: string;
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

/** 「申請廠商/員工」清單即時查詢條件 */
export interface QueryVenEmpFIN23010Request {
  /** 關鍵字(編號/名稱/簡稱，模糊查詢；空值查前50筆) */
  Keyword?: string | null;
  /** 類型篩選：V=廠商 E=員工，空值=不篩選 */
  VenEmpType?: 'V' | 'E' | null;
}

/** 「申請廠商/員工」清單即時查詢結果(對應POS2013，一支API取代原本廠商/員工分開查詢) */
export interface QueryVenEmpFIN23010Response {
  VenNo: string | null;
  VenName: string | null;
  VenShortName: string | null;
  /** 1=統編(公司) 2=身分證(個人，本作業視為員工) 3=自編編號 (對應POS2013.VEN_Flag) */
  VenFlag: string | null;
  PayType: string | null;
  PayTypeName: string | null;
  BnkNo: string | null;
  BnkAccNo: string | null;
  BnkAccountName: string | null;
  CheckTitle: string | null;
  PayConditionDay: number | null;
  VenStatus: string | null;
  VenStatusName: string | null;
  /** 統一編號/身分證字號(供選定後帶入表單，之後串接EIP/其他用途；不對應畫面顯示欄位) */
  VenUniform: string | null;
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
  /** 送審 */
  sendFIN23010(id: number): Observable<ApiResponse<SaveFIN23010Response>> {
    return this.http.post<ApiResponse<SaveFIN23010Response>>(`${this.apiUrl}/sendFIN23010`, { id });
  }
  /** 新增頁「申請廠商/員工」選擇廠商時，依廠商編號查詢廠商資料 */
  queryVenFIN23010(VEN_No: string): Observable<ApiResponse<QueryVenFIN23010Response>> {
    return this.http.post<ApiResponse<QueryVenFIN23010Response>>(`${this.apiUrl}/queryVenFIN23010`, { VEN_No });
  }

  /** 新增頁「申請廠商/員工」選擇員工時，依員工編號查詢員工資料 */
  queryEmpFIN23010(user_No: string): Observable<ApiResponse<QueryEmpFIN23010Response>> {
    return this.http.post<ApiResponse<QueryEmpFIN23010Response>>(`${this.apiUrl}/queryEmpFIN23010`, { user_No });
  }

  /** 新增頁「申請廠商/員工」清單即時查詢(一支API取代原本分開查詢廠商/員工的流程，直接查POS2013) */
  queryVenEmpFIN23010(body: QueryVenEmpFIN23010Request): Observable<ApiResponse<QueryVenEmpFIN23010Response[]>> {
    return this.http.post<ApiResponse<QueryVenEmpFIN23010Response[]>>(`${this.apiUrl}/queryVenEmpFIN23010`, body);
  }
}
