import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../system/auth.service';

// Main Request and Response Interfaces
export interface IQueryTLS56050Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  MVM_No?: string;
  queryNo?: string;
  OUT_HOS_NoList?: string[];
  IN_HOS_NoList?: string[];
  LOGO_NoList?: string[];
  MVM_StatusList?: string[];
  APPLY_Date_Start?: string;
  APPLY_Date_End?: string;
  APPLY_USR?: string;
  APRV_Date_Start?: string;
  APRV_Date_End?: string;
  APRV_USR?: string;
  OUTGODS_Date_Start?: string;
  OUTGODS_Date_End?: string;
  OUTGODS_USR?: string;
}

export interface ITLS56050Response {
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

export interface ITLS56050Detail {
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

// Request Body for insert/update
export interface ITLS56050Request {
  id?: number;
  MVM_No?: string;
  OUTGODS_Date: string;
  OUTGODS_USR_No: string;
  OUTGODS_USR_Name: string;
  OUTGODS_TotQty: number;
  OUTGODS_TotBuyNet: number;
  OUTGODS_TotBuyTax: number;
  OUTGODS_TotBuyAmt: number;
  OUTGODS_TotSaleAmt: number;
  MVM_Remark?: string;
  Details: {
    id?: number;
    MVM_No?: string;
    OUTGODS_Qty: number;
    OUTGODS_BuyNet: number;
    OUTGODS_BuyTax: number;
    OUTGODS_BuyAmt: number;
    OUTGODS_SaleAmt: number;
    MVD_Remark?: string;
  }[];
}

export interface IQueryTLS56050InfoResponse {
  TLS56050Data: ITLS56050Response;
  detail_TLS56050: ITLS56050Detail[];
}

export interface IQueryTLS56050DropdownRequest {
  MVM_Status: string;
}

export interface IQueryTLS56050DropdownResponse {
  MVM_No: string;
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
export class Tls56050Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2021 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS56050Response 陣列的 API 響應
   */
  queryTLS56050(params: IQueryTLS56050Request): Observable<ApiResponse<ITLS56050Response[]>> {
    return this.http.post<ApiResponse<ITLS56050Response[]>>(`${this.apiUrl}/queryTLS56050`, params);
  }

  /**
   * 查詢 POS2021 資料表以取得調撥單號下拉選單
   * @param params 查詢條件
   * @returns 包含 MVM_No 陣列的 API 響應
   */
  queryTLS56050DropdownList(params: IQueryTLS56050DropdownRequest): Observable<ApiResponse<IQueryTLS56050DropdownResponse[]>> {
    return this.http.post<ApiResponse<IQueryTLS56050DropdownResponse[]>>(`${this.apiUrl}/queryTLS56050_DropDownList`, params);
  }

  /**
   * 根據調撥單號取得主檔與明細資料
   * @param MVM_No 調撥單號
   * @returns 包含主檔與明細的 API 響應
   */
  getTLS56050Info(MVM_No: string): Observable<ApiResponse<IQueryTLS56050InfoResponse>> {
    return this.http.post<ApiResponse<IQueryTLS56050InfoResponse>>(`${this.apiUrl}/GetTLS56050Info`, { MVM_No });
  }

  /**
   * 新增 POS2021 資料表
   * @param payload 請求主體
   * @returns API 響應
   */
  insertTLS56050(payload: ITLS56050Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertTLS56050`, payload);
  }

  /**
   * 更新 POS2021、POS2022 資料表
   * @param payload 請求主體
   * @returns API 響應
   */
  updateTLS56050(payload: ITLS56050Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateTLS56050`, payload);
  }

  /**
   * 根據狀態更新 POS2021 資料表
   * @param payload 請求主體
   * @returns API 響應
   */
  updateStatusTLS56050(payload: IUpdateStatusRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateStatusTLS56050`, payload);
  }
}