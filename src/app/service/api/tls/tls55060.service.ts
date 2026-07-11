import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// --- 原有 Interfaces ---
export interface QueryTLS55060Request extends ApiRequest {
  id?: number;
  SrcSheetTypeList?: string[];
  VouDate_Start?: string;
  VouDate_End?: string;
  PostFlagList?: string[];
  No?: string;
}

export interface TLS55060GLS6001 {
  id: number;
  mid: number;
  CompNo: string;
  VouNo: string;
  VouType: string;
  VouDate: string;
  SrcSheetType: string;
  SrcSheetNo: string;
  PostFlag: string;
  INV_YN: string;
  Remark: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  Trans_Status: string;
  No: string;
  Trans_Status_Name: string;
}

export interface Gls600DataWrapper {
  Data: Gls600Data;
}

export interface Gls600Data {
  _gls6001: Gls6001;
  _gls6002s: Gls6002[];
}

export interface Gls6001 {
  id: number;
  mid: number;
  CompNo: string;
  VouNo: string;
  VouType: string;
  VouDate: string;
  SrcSheetType: string;
  SrcSheetNo: string;
  PostFlag: string;
  INV_YN: string;
  Remark: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  Trans_Status: string;
}

export interface Gls6002 {
  id: number;
  mid: number;
  gls6001_id: number;
  SerNo: number;
  AccDC: string;
  AccNo: string;
  AccAmt: number;
  ORG_ID: string;
  DetailNo: string;
  SubDetailNo: string;
  ProjectNo: string;
  NoteDesc: string;
  PTA: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  VEN_NO: string;
  HOS_NAME: string;
  ACCCNAME: string;
  VEN_NAME: string;
  DAccAmt: number;
  CAccAmt: number;
}

export interface Tls55010DateRequest {
  TXN_Date: string;
}

export interface QueryTLS55060RawItem {
  _GLS6001: TLS55060GLS6001;
  _GLS6002List: Gls6002[];
  TotalDAmt: number;
  TotalCAmt: number;
}

export type TLS55060QueryItem = TLS55060GLS6001 & {
  _GLS6002List: Gls6002[];
  TotalDAmt: number;
  TotalCAmt: number;
};

// --- 新增：TLS2000 相關 Interfaces (GLS6004 / GLS6005) ---

/** 專櫃暫存傳票查詢 請求參數 (通用) */
export interface QueryTLS2C040Request extends ApiRequest {
  id?: number;
}

/** GLS6004 應收資料項 */
export interface GLS6004Item {
  VOUNO: string;
  SrcSheetType: string;
  org_id: string;
  org_name: string;
  CustomerNo: string;
  DetailNo: string;
  VouType: string;
  sam_yyymm: string;
  sam_termno: string;
  ar_amt: number;
  pta_amt: number;
  accno: string;
  ent_date: string;
  perget_date: string;
  SrcVouNo: string;
  notedesc: string;
}

/** GLS6004 應收回應格式 */
export interface GLS6004Response {
  _GLS6004List: GLS6004Item[];
  Total_ar_amt: number;
}

/** GLS6005 應付資料項 */
export interface GLS6005Item {
  VOUNO: string;
  SrcSheetType: string;
  org_id: string;
  org_name: string;
  CustomerNo: string;
  DetailNo: string;
  VouType: string;
  sam_yyymm: string;
  sam_termno: string;
  ap_amt: number;
  pta_amt: number;
  accno: string;
  ent_date: string;
  perget_date: string;
  SrcVouNo: string;
  notedesc: string;
  Ven_Uniform: string;
  PTA: string;
  AP_Status: string;
  Trans_Status: string;
}

/** GLS6005 應付回應格式 */
export interface GLS6005Response {
  _GLS6005List: GLS6005Item[];
  Total_AP_Amt: number;
}

@Injectable({
  providedIn: 'root'
})
export class TLS55060Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS5000';
  private apiTls2000Url = environment.ApiUrl + '/TLS0000/TLS2000'; // 新增 TLS2000 路徑

  constructor(private http: HttpClient) { }

  /** 原有的 TLS55060 查詢 */
  queryTLS55060(req: QueryTLS55060Request): Observable<ApiResponse<TLS55060QueryItem[]>> {
    return this.http.post<ApiResponse<QueryTLS55060RawItem[]>>(`${this.apiUrl}/queryTLS55060`, req).pipe(
      map(response => {
        const data = Array.isArray(response.Data)
          ? response.Data.map(item => ({
            ...item._GLS6001,
            _GLS6002List: this.sortGLS6002(item._GLS6002List),
            TotalDAmt: Number(item.TotalDAmt) || 0,
            TotalCAmt: Number(item.TotalCAmt) || 0
          }))
          : [];

        return {
          ...response,
          Data: data
        };
      })
    );
  }

  private sortGLS6002(list: Gls6002[] | null | undefined): Gls6002[] {
    if (!Array.isArray(list)) {
      return [];
    }
    return [...list].sort((left, right) => {
      if (left.AccDC !== right.AccDC) {
        return left.AccDC === 'D' ? -1 : 1;
      }
      return (left.AccNo || '').localeCompare(right.AccNo || '');
    });
  }

  queryTLS55010(request: Tls55010DateRequest): Observable<ApiResponse<Gls600DataWrapper>> {
    return this.http.post<ApiResponse<Gls600DataWrapper>>(`${this.apiUrl}/queryTLS55010`, request);
  }

  queryTLS55050M_D(body: { VouNo: string }): Observable<ApiResponse<Gls600DataWrapper>> {
    return this.http.post<ApiResponse<Gls600DataWrapper>>(`${this.apiUrl}/queryTLS55050M_D`, body);
  }

  // --- 新增 API 方法 ---

  /** 查詢專櫃暫存傳票查詢作業-應收 (GLS6004) */
  queryTLS2C040_GLS6004(req: QueryTLS2C040Request): Observable<ApiResponse<GLS6004Response>> {
    return this.http.post<ApiResponse<GLS6004Response>>(
      `${this.apiTls2000Url}/queryTLS2C040_GLS6004`,
      req
    );
  }

  /** 查詢專櫃暫存傳票查詢作業-應付 (GLS6005) */
  queryTLS2C040_GLS6005(req: QueryTLS2C040Request): Observable<ApiResponse<GLS6005Response>> {
    return this.http.post<ApiResponse<GLS6005Response>>(
      `${this.apiTls2000Url}/queryTLS2C040_GLS6005`,
      req
    );
  }
}
