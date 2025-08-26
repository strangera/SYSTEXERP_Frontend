import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../system/auth.service';

// Main Request and Response Interfaces
export interface IQueryTLS56060Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  MVM_No?: string;
  queryNo?: string;
  IN_HOS_NoList?: string[];
  LOGO_NoList?: string[];
  MVM_StatusList?: string[];
  OUTGODS_Date_Start?: string;
  OUTGODS_Date_End?: string;
}

export interface ITLS56060Response {
  id: number;
  MID: number;
  MVM_No: string;
  SYS_StoreNo: string;
  LOGO_No: string;
  OUT_HOS_No: string;
  OUT_HOS_NAME: string;
  IN_HOS_No: string;
  IN_HOS_NAME: string;
  org_id: string;
  Org_Name: string;
  MVM_Status: string;
  MVM_Status_Name: string;
  APPLY_Date: string;
  APPLY_USR_No: string;
  APPLY_USR_Name: string;
  APPLY_TotQty: number;
  APPLY_TotBuyNet: number;
  APPLY_TotBuyTax: number;
  APPLY_TotBuyAmt: number;
  APPLY_TotSaleAmt: number;
  OUTGODS_TotQty: number;
  OUTGODS_TotBuyNet: number;
  OUTGODS_TotBuyTax: number;
  OUTGODS_TotBuyAmt: number;
  OUTGODS_TotSaleAmt: number;
  Confirm_TotQty: number;
  Confirm_TotBuyNet: number;
  Confirm_TotBuyTax: number;
  Confirm_TotBuyAmt: number;
  Confirm_TotSaleAmt: number;
  APRV_Date: string;
  APRV_USR_No: string;
  APRV_USR_Name: string;
  VOID_Date: string;
  VOID_USR_No: string;
  VOID_USR_Name: string;
  OUTGODS_Date: string;
  OUTGODS_USR_No: string;
  OUTGODS_USR_Name: string;
  Confirm_Date: string;
  Confirm_USR_No: string;
  Confirm_USR_Name: string;
  MVM_Remark: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface ITLS56060Detail {
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  id: number;
  MID: number;
  MVM_No: string;
  SYS_StoreNo: string;
  MVD_SeqNo: number;
  PLU_MagNo: string;
  PLU_No: string;
  PLU_Unit: string;
  PLU_BoxQty: number;
  PLU_Name: string;
  PLU_StockTaxType: string;
  PLU_TaxType: string;
  MVD_BuyPrc: number;
  MVD_SalePrc: number;
  APPLY_Qty: number;
  OUTGODS_QTY: number;
  Confirm_QTY: number;
  APPLY_BuyNet: number;
  APPLY_BuyTax: number;
  APPLY_BuyAmt: number;
  APPLY_SaleAmt: number;
  OUTGODS_BuyNet: number;
  OUTGODS_BuyTax: number;
  OUTGODS_BuyAmt: number;
  OUTGODS_SaleAmt: number;
  Confirm_BuyNet: number;
  Confirm_BuyTax: number;
  Confirm_BuyAmt: number;
  Confirm_SaleAmt: number;
  MVD_Remark: string;
  NowHaveQty: number;
}

export interface IQueryTLS56060InfoResponse {
  TLS56060Data: ITLS56060Response;
  detail_TLS56060: ITLS56060Detail[];
}

export interface ITLS56060Request {
  id?: number;
  MVM_No: string;
  Confirm_Date: string;
  Confirm_USR_No: string;
  Confirm_USR_Name: string;
  Confirm_TotQty: number;
  Confirm_TotBuyNet: number;
  Confirm_TotBuyTax: number;
  Confirm_TotBuyAmt: number;
  Confirm_TotSaleAmt: number;
  MVM_Remark?: string;
  Details: {
    id: number;
    MVM_No: string;
    Confirm_Qty: number;
    Confirm_BuyNet: number;
    Confirm_BuyTax: number;
    Confirm_BuyAmt: number;
    Confirm_SaleAmt: number;
    MVD_Remark?: string;
  }[];
}

export interface IUpdateStatusRequest {
  DetailList: {
    MVM_No: string;
    MVM_Status: string;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class Tls56060Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2021 (調撥單主檔) 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS56060Response 陣列的 API 響應
   */
  queryTLS56060(params: IQueryTLS56060Request): Observable<ApiResponse<ITLS56060Response[]>> {
    return this.http.post<ApiResponse<ITLS56060Response[]>>(`${this.apiUrl}/queryTLS56060`, params);
  }

  /**
   * 根據調撥單號取得主檔與明細資料
   * @param MVM_No 調撥單號
   * @returns 包含主檔與明細的 API 響應
   */
  getTLS56060Info(MVM_No: string): Observable<ApiResponse<IQueryTLS56060InfoResponse>> {
    return this.http.post<ApiResponse<IQueryTLS56060InfoResponse>>(`${this.apiUrl}/GetTLS56060Info`, { MVM_No });
  }

  /**
   * 更新 POS2021、POS2022 資料表
   * @param payload 請求主體
   * @returns API 響應
   */
  updateTLS56060(payload: ITLS56060Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateTLS56060`, payload);
  }

  /**
   * 根據狀態更新 POS2021 資料表
   * @param payload 請求主體
   * @returns API 響應
   */
  updateStatusTLS56060(payload: IUpdateStatusRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateStatusTLS56060`, payload);
  }
}
