import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// --- Request Interfaces ---

/** 自營交易修正查詢參數 */
export interface Tls55020QueryRequest {
  pageSize?: number;
  pageIndex?: number;
  SortBy?: { field: string; order: number }[];
  TXN_Date: string; // 交易日期 'YYYY-MM-DD'
  ECR_No?: string;
  TLT_No?: string;
  TXN_No?: number;
}

/** 查詢明細請求參數 */
export interface Tls55020DetailRequest {
  SYS_StoreNo: string;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
}

/** 更新明細請求參數 */
export interface Tls55020UpdateRequest {
  SYS_StoreNo: string;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  POS5006_ID: number;
  updatePOS5007_Details: {
    ID: number;
    PLU_MagNo: string;
  }[];
}

// --- Data Models (Response) ---

/** 自營交易主檔資料 */
export interface Tls55020MasterData {
  ID: number;
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
  TXN_TotGUI: number;
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
  TXN_Ret_No: string;
  tlt_term_type: string;
  CanEdit: boolean;
}

/** 商品明細資料 */
export interface ProductDetail {
  ID: number;
  SYS_StoreNo: string;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  PLU_MagNo: string;
  PLU_Name: string;
  PLU_No: string;
  TXN_Qty: number;
  PLU_SalePrc: number;
  Unitprice: number;
  TXN_Disc: number;
  TXN_SaleAmt: number;
  tlt_id: string;
  tlt_id_desc: string;
  PLU_TaxType: string;
  TXN_DiscCode: string;
  TXN_DiscName: string;
  Contract_No: string;
  Contract_SubNo: string;

  isQtyDiscEditable?: boolean; // 控制數量與折扣是否可編輯
  isEditable?: boolean; // 用來標記是否允許修改
}

/** 支付明細資料 */
export interface PaymentDetail {
  ID: number;
  SYS_StoreNo: string;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  PAY_No: string;
  PAY_Name: string;
  TXN_PayAmt: number;
  CRD_Type: string;
  CRD_Name: string;
  CRD_No: string;
  TXN_CouponNo: string;
  TXN_PayDesc: string;
  TERM_No: number;
  TERM_Name: string;
}

/** 查詢明細回傳結構 */
export interface Tls55020DetailData {
  ProductDetailList: ProductDetail[];
  PaymentDetailsList: PaymentDetail[];
}

@Injectable({
  providedIn: 'root'
})
export class Tls55020Service {
  private readonly apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  /**
   * 2.5.5.1 查詢自營交易修正作業 (主檔列表)
   * @param params 查詢過濾與分頁參數
   */
  queryTLS55020(params: Tls55020QueryRequest): Observable<ApiResponse<Tls55020MasterData[]>> {
    return this.http.post<ApiResponse<Tls55020MasterData[]>>(
      `${this.apiUrl}/queryTLS55020`,
      params
    ).pipe(
      map(res => {
        console.log(res.Data);

        return {
          ...res,
          Data: res.Data.map(item => ({
            ...item,
            tlt_term_type: item.tlt_term_type?.trim(),
            TXN_Time: this.datePipe.transform(item.TXN_Time, 'HH:mm') || '',
            TXN_PreOrder: item.TXN_PreOrder === null ? 'N' : item.TXN_PreOrder,
          }))
        }
      })
    )
  }

  /**
   * 2.5.5.2 查詢自營交易修正_明細作業
   * @param params 包含商店編號、日期、機號、交易序號
   */
  queryTLS55020Detail(params: Tls55020DetailRequest): Observable<ApiResponse<Tls55020DetailData[]>> {
    return this.http.post<ApiResponse<Tls55020DetailData[]>>(
      `${this.apiUrl}/queryTLS55020_Detail`,
      params
    );
  }

  /**
   * 2.5.5.3 自營交易修正 (更新明細)
   * @param body 更新內容，包含 POS5006_ID 與待更新的明細清單
   */
  updateTLS55020Detail(body: Tls55020UpdateRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/updateTLS55020_Detail`,
      body
    );
  }
}
