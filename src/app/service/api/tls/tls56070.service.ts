import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { ApiResponse } from '@service/system/auth.service';
// ----------------------------------------------------
// 1. /queryTLS56070 - 查詢 POS2023DAM
// ----------------------------------------------------
export interface QueryTLS56070Request {
  DAM_No?: string;
  HOS_NoList?: string[];
  LOGO_NoList?: string[];
  DAM_StatusList?: string[];
  APPLY_Date_Start?: string;
  APPLY_Date_End?: string;
  APPLY_USR?: string;
  APRV_Date_Start?: string;
  APRV_Date_End?: string;
  APRV_USR?: string;
}

export interface POS2023DAMResponse {
  id: number;
  DAM_No: string;
  SYS_StoreNo: string;
  LOGO_No: string;
  HOS_No: string;
  HOS_NAME: string;
  org_id: string;
  APPLY_Date: string;
  APPLY_USR_No: string;
  APPLY_USR_Name: string;
  DAM_TotQty: number;
  DAM_TotBuyNet: number;
  DAM_TotBuyTax: number;
  DAM_TotBuyAmt: number;
  DAM_TotSaleNet: number;
  DAM_TotSaleTax: number;
  DAM_TotSaleAmt: number;
  DAM_Status: string;
  APRV_Date: string;
  APRV_USR_No: string;
  APRV_USR_Name: string;
  VOID_Date: string;
  VOID_USR_No: string;
  VOID_USR_Name: string;
  DAM_Date: string;
  DAM_USR_No: string;
  DAM_USR_Name: string;
  ReAPRV_Date: string;
  ReAPRV_USR_No: string;
  ReAPRV_USR_Name: string;
  DAM_Remark: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

// ----------------------------------------------------
// 2. /queryPOS2004Detail_TLS56070 - 查詢商品
// ----------------------------------------------------
export interface QueryPOS2004DetailRequest {
  queryNo?: string;
  PLU_Name?: string;
  LOGO_No?: string;
  HOS_No?: string;
}

export interface POS2004DetailResponse {
  id: number;
  PLU_MagNo: string;
  PLU_Name: string;
  PLU_No: string;
  PLU_OrgPLUNo: string;
  PLU_Unit: string;
  UNIT_NAME: string;
  PLU_BoxQty: number;
  PLU_StockTaxType: string;
  PLU_SalePrc_UNI: number;
  PLU_SalePrc: number;
  PLU_TaxType: string;
  NowHaveQty: number;
}

// ----------------------------------------------------
// 3. /insertTLS56070 - 新增
// ----------------------------------------------------
export interface InsertTLS56070Request {
  SYS_StoreNo: string;
  LOGO_No: string;
  HOS_No: string;
  org_id: string;
  APPLY_Date: string;
  APPLY_USR_No: string;
  APPLY_USR_Name: string;
  DAM_TotQty: number;
  DAM_TotBuyNet: number;
  DAM_TotBuyTax: number;
  DAM_TotBuyAmt: number;
  DAM_TotSaleNet: number;
  DAM_TotSaleTax: number;
  DAM_TotSaleAmt: number;
  DAM_Remark: string;
  Details: InsertUpdateDetail[];
}

export interface InsertUpdateDetail {
  SYS_StoreNo: string;
  HOS_No: string;
  PLU_MagNo: string;
  PLU_No: string;
  PLU_Unit: string;
  PLU_BoxQty: number;
  PLU_Name: string;
  PLU_StockTaxType: string;
  DAD_ConfirmQty: number;
  DAD_BuyPrc: number;
  DAD_BuyNet: number;
  DAD_BuyTax: number;
  DAD_BuyAmt: number;
  PLU_TaxType: string;
  DAD_SalePrc: number;
  DAD_SaleTax: number;
  DAD_SaleAmt: number;
  DAD_Remark: string;
  id?: number;
  DAM_No?: string;
}

// ----------------------------------------------------
// 4. /updateTLS56070 - 更新
// ----------------------------------------------------
export interface UpdateTLS56070Request extends InsertTLS56070Request {
  id: number;
  DAM_Status: string;
  DAM_No: string;
  Details: InsertUpdateDetail[];
}

// ----------------------------------------------------
// 5. /queryPOS2024DAM - 查詢明細
// ----------------------------------------------------
export interface QueryPOS2024DAMRequest {
  DAM_No?: string;
  HOS_No?: string;
}

export interface POS2024DAMResponse {
  id: number;
  MID?: number;
  DAM_No?: string;
  SYS_StoreNo?: string;
  HOS_No?: string;
  DAD_SeqNo?: number;
  PLU_MagNo?: string;
  PLU_No?: string;
  PLU_Unit?: string;
  PLU_BoxQty?: number;
  PLU_Name?: string;
  DAD_ConfirmQty?: number;
  PLU_StockTaxType?: string;
  DAD_BuyPrc?: number;
  DAD_BuyNet?: number;
  DAD_BuyTax?: number;
  DAD_BuyAmt?: number;
  PLU_TaxType?: string;
  DAD_SalePrc?: number;
  DAD_SaleTax?: number;
  DAD_SaleAmt?: number;
  DAD_Remark?: string;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  UNIT_NAME?: string;
  NowHaveQty?: number;
}

// ----------------------------------------------------
// 6. /updateStatusTLS56070 - 更新狀態
// ----------------------------------------------------
export interface UpdateStatusTLS56070Request {
  DetailList: UpdateStatusDetail[];
}

export interface UpdateStatusDetail {
  DAM_No: string;
  DAM_Status: string;
}

@Injectable({
  providedIn: 'root',
})
export class Tls56070Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2023DAM 資料表
   * @param request 查詢條件
   * @returns Observable<ApiResponse<POS2023DAMResponse[]>>
   */
  queryTLS56070(request: QueryTLS56070Request): Observable<ApiResponse<POS2023DAMResponse[]>> {
    return this.http.post<ApiResponse<POS2023DAMResponse[]>>(
      `${this.apiUrl}/queryTLS56070`,
      request
    );
  }

  /**
   * 查詢商品管理編號/國際條碼/廠商貨號
   * @param request 查詢條件
   * @returns Observable<ApiResponse<POS2004DetailResponse[]>>
   */
  queryPOS2004Detail(request: QueryPOS2004DetailRequest): Observable<ApiResponse<POS2004DetailResponse[]>> {
    return this.http.post<ApiResponse<POS2004DetailResponse[]>>(
      `${this.apiUrl}/queryPOS2004Detail_TLS56070`,
      request
    );
  }

  /**
   * 新增 POS2023DAM 資料表
   * @param request 新增資料
   * @returns Observable<any>
   */
  insertTLS56070(request: InsertTLS56070Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertTLS56070`, request);
  }

  /**
   * 更新 POS2023DAM、POS2024DAM 資料
   * @param request 更新資料
   * @returns Observable<any>
   */
  updateTLS56070(request: UpdateTLS56070Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateTLS56070`, request);
  }

  /**
   * 查詢 POS2024DAM 資料表
   * @param request 查詢條件
   * @returns Observable<ApiResponse<POS2024DAMResponse[]>>
   */
  queryPOS2024DAM(request: QueryPOS2024DAMRequest): Observable<ApiResponse<POS2024DAMResponse[]>> {
    return this.http.post<ApiResponse<POS2024DAMResponse[]>>(
      `${this.apiUrl}/queryPOS2024DAM`,
      request
    );
  }

  /**
   * 根據狀態更新 POS2023DAM 資料
   * @param request 更新狀態資料
   * @returns Observable<any>
   */
  updateStatusTLS56070(request: UpdateStatusTLS56070Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateStatusTLS56070`, request);
  }
}
