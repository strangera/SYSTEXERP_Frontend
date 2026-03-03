import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// --- Request Interfaces ---

export interface TLS24030Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  TXN_Date: string; // e.g. '2026-02-23'
  ECR_No: string;
  TLT_No: string;
  TXN_No: number;
}

export interface TLS24030DetailRequest {
  SYS_StoreNo: string;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
}

// --- Response Data Interfaces ---

/** 交易明細查詢結果項目 (queryTLS24030) */
export interface TLS24030Item {
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  TLT_No: string;
  TLT_Name: string;
  TXN_Status: string;
}

export interface TLS24030MainData {
  ID: number;
  SYS_StoreNo: string;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  TLT_No: string;
  TLT_Name: string;
  TXN_Status: string;
  TXN_Remark: string;
  USR_No: string;
  TXN_PreOrder: string;
  TXN_VIP: string;
  TXN_TaxType: string;
  TXN_TaxFreeCertNo: string;
  GUI_Track: string;
  TXN_GUIBegNo: string;
  TXN_GUIEndNo: string;
  TXN_CustCnt: number;
  TXN_MemCard: string;
  TXN_Uniform: string;
  TXN_Time: string;
  TXN_GUI_CarrType: string;
  TXN_GUIVehicle: string;
  TXN_GUIRemark: string;
  TXN_PrintTimes: number;
  IsHaveGUILoveCode: string;
  TXN_GUILoveCode: string;
  ORG_TXN_Date: string;
  ORG_ECR_No: string;
  TXN_Mode: string;
}

export interface ProductDetailList {
  ID: number;
  SYS_StoreNo: string;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  PLU_No: string;

  PLU_MagNo: string;
  PLU_Name: string;
  TXN_Qty: number;
  Unitprice: number;
  PLU_SalePrc: number;
  TXN_Disc: number;
  TXN_SaleAmt: number;
  tlt_id_desc: string;
  PLU_TaxType: string;
  TXN_DiscName: string;

  tlt_id: string;
  TXN_DiscCode: string;
}

export interface PaymentDetailsList {
  ID: number;
  SYS_StoreNo: string;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  PAY_No: string;

  PAY_Name: string;
  TXN_PayAmt: number;
  CRD_Name: string;
  CRD_No: string;
  TXN_CouponNo: string;
  TXN_PayDesc: string;
  TERM_Name: string;

  CRD_Type: string;
  TERM_No: number;
}

/** 交易明細詳細資料結構 (queryTLS24030_Detail) */
export interface TLS24030DetailResponse {
  MainData: TLS24030MainData;
  ProductDetailList: ProductDetailList[];
  PaymentDetailsList: PaymentDetailsList[];
}

@Injectable({
  providedIn: 'root',
})
export class Tls24030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  /**
   * 2.2.4 交易資料修正作業 (交易明細查詢)
   * @param params 查詢條件 (分頁、日期、收銀機號等)
   */
  queryTLS24030(params: TLS24030Request): Observable<ApiResponse<TLS24030Item[]>> {
    return this.http.post<ApiResponse<TLS24030Item[]>>(
      `${this.apiUrl}/queryTLS24030`,
      params
    );
  }

  /**
   * 交易明細查詢_明細作業
   * @param params 包含商店代號、交易日期、收銀機號、交易序號
   */
  queryTLS24030Detail(params: TLS24030DetailRequest): Observable<ApiResponse<TLS24030DetailResponse[]>> {
    return this.http.post<ApiResponse<TLS24030DetailResponse[]>>(
      `${this.apiUrl}/queryTLS24030_Detail`,
      params
    );
  }
}
