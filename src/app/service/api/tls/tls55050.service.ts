import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

// ====================================================================
// TLS55050 月結帳作業 介面定義
// ====================================================================
/** 通用請求 Body 結構 */
export interface Tls55050Body {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
  cls_Month: string; // 結帳月份 (例如: "202512")
  VEN_No: string | null;    // 廠商編號
}

/** 查詢結果項目 (上/下) */
export interface Tls55050Data {
  CanClose?: string;
  Msg?: string;
  Cls_Date?: string;
  // 以下為常見欄位，可依需求增加
  ACP_YYYYMM?: string;
  VEN_Name?: string;
  LOGO_CH_NAME?: string;
  OTA_Status?: string;
}

/** 傳票主檔明細結構 (對應 queryTLS55050M_D) */
export interface Gls600DataWrapper {
  Data: Gls600Data;
}

export interface Gls600Data {
  _gls6001: Gls6001;     // Swagger 顯示為單數物件
  _gls6002s: Gls6002[];  // Swagger 顯示為陣列
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
}

// ====================================================================
// Service 實作
// ====================================================================

@Injectable({
  providedIn: 'root'
})
export class Tls55050Service {
  private readonly apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private readonly http: HttpClient) { }

  /** 1. 查詢月結帳作業(上) */
  queryTLS55050_Up(body: Tls55050Body): Observable<ApiResponse<Tls55050Data[]>> {
    return this.http.post<ApiResponse<Tls55050Data[]>>(`${this.apiUrl}/queryTLS55050_Up`, body);
  }

  /** 2. 查詢月結帳作業(下) */
  queryTLS55050_Down(body: Tls55050Body): Observable<ApiResponse<Tls55050Data[]>> {
    return this.http.post<ApiResponse<Tls55050Data[]>>(`${this.apiUrl}/queryTLS55050_Down`, body);
  }

  /** 3. 查詢月結帳主檔明細 */
  queryTLS55050M_D(body: { VouNo: string }): Observable<ApiResponse<Gls600DataWrapper>> {
    // 修正 URL 為 queryTLS55050M_D
    return this.http.post<ApiResponse<Gls600DataWrapper>>(`${this.apiUrl}/queryTLS55050M_D`, body);
  }

  /** 4. 執行月結帳作業 */
  insertTLS55050(body: Tls55050Body): Observable<ApiResponse<Tls55050Data[]>> {
    return this.http.post<ApiResponse<Tls55050Data[]>>(`${this.apiUrl}/insertTLS55050`, body);
  }

  /** 5. 反月結帳作業 */
  reinsertTLS55050(body: Tls55050Body): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/reinsertTLS55050`, body);
  }

  /** 6. 執行月結鎖定 */
  lockTLS55050(body: Tls55050Body): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/LockTLS55050`, body);
  }

  /** 7. 執行月結反鎖定 */
  unLockTLS55050(body: Tls55050Body): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/UnLockTLS55050`, body);
  }
}
