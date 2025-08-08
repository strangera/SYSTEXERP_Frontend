import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { ApiResponse } from '../../system/auth.service'; // 請確認你的 ApiResponse 介面路徑是否正確

export interface TLS24080Request {
  TXN_Date_Start: string; // e.g. '2025-08-06T09:32:54.534Z'
  TXN_Date_End: string;
  UPD_Date_Start: string;
  UPD_Date_End: string;
  ECR_No: string[];
  TXN_No_Start: number;
  TXN_No_End: number;
  EditType: string;
}
export interface TLS24080Data {
  TLTNoEdit: TLTNoEditItem[];
  DiscCodeEdit: DiscCodeEditItem[];
  TLTIdEdit: TLTIdEditItem[];
  PayNoEdit: PayNoEditItem[];
  PreOrderEdit: PreOrderEditItem[];
  VoidEdit: VoidEditItem[];
}
export interface TLTNoEditItem {
  ID: number;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  PRM_TLT_No: string;
  PRM_TLT_Name: string;
  TLT_No: string;
  TLT_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface DiscCodeEditItem {
  ID: number;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  TLT_No: string;
  TLT_Name: string;
  tlt_id: string;
  TXN_Qty: number;
  TXN_SaleAmt: number;
  PRM_DiscCode: string;
  DiscCode: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface TLTIdEditItem {
  ID: number;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  TLT_No: string;
  TLT_Name: string;
  TXN_Qty: number;
  TXN_SaleAmt: number;
  PRM_TLT_Id: string;
  tlt_id: string;
  TXN_DiscCode: string;
  TXN_DiscCodeName: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface PayNoEditItem {
  ID: number;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  TLT_No: string;
  TLT_Name: string;
  PRM_PAY_No: string;
  PAY_No: string;
  TXN_PayAmt: number;
  PRM_TERM_No: number;
  TERM_No: number;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface PreOrderEditItem {
  ID: number;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  TLT_No: string;
  TLT_Name: string;
  PRM_TXN_PreOrder: string;
  TXN_PreOrder: string;
  PRM_POD_No: string;
  POD_No: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface VoidEditItem {
  ID: number;
  ORG_TXN_Date: string;
  ORG_ECR_No: string;
  ORG_TXN_No: number;
  TLT_No: string;
  TLT_Name: string;
  TXN_GUITrack: string;
  TXN_GUIBegNo: string;
  TXN_GUIEndNo: string;
  TXN_TotGUI: number;
  Void_Date: string;
  Void_USR_No: string;
  Void_USR_Name: string;
  TXN_Status: string;
}

@Injectable({
  providedIn: 'root',
})
export class Tls24080Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS5006 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS24080Data 陣列的 API 響應
   */
  queryTLS24080(params: TLS24080Request): Observable<ApiResponse<TLS24080Data[]>> {
    return this.http.post<ApiResponse<TLS24080Data[]>>(`${this.apiUrl}/queryTLS24080`, params);
  }
}
