import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * TLS56080 (同業調撥作業) 主檔查詢條件介面
 * 對應 Swagger: POST /TLS0000/TLS5000/queryTLS56080 的 Request Body
 */
export interface IQueryTLS56080Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  TRD_No?: string; // 交易單號
  queryNo?: string; // 查詢編號
  HOS_NoList?: string[]; // 品牌清單
  LOGO_NoList?: string[]; // 廠商貨號清單
  TRD_StatusList?: string[]; // 交易狀態清單
  TRD_ReasonList?: string[]; // 交易原因清單
  APPLY_Date_Start?: string; // 申請日期起
  APPLY_Date_End?: string; // 申請日期迄
  APPLY_USR?: string; // 申請人員
  APRV_Date_Start?: string; // 核准日期起
  APRV_Date_End?: string; // 核准日期迄
  APRV_USR?: string; // 核准人員
}

/**
 * TLS56080 (同業調撥作業) 主檔查詢回應資料介面
 * 對應 Swagger: POST /TLS0000/TLS5000/queryTLS56080 的 Response Data
 */
export interface IQueryTLS56080Response {
  id: number;
  MID: number;
  TRD_No: string; // 交易單號
  SYS_StoreNo: string; // 系統門市編號
  LOGO_No: string; // 廠商貨號
  HOS_No: string; // 品牌編號
  HOS_NAME: string; // 品牌名稱
  VEN_No: string; // 廠商編號
  VEN_Name: string; // 廠商名稱
  TRD_Status: string; // 交易狀態代碼
  TRD_Status_Name: string; // 交易狀態名稱
  TRD_Reason: string; // 交易原因代碼
  TRD_Reason_Name: string; // 交易原因名稱
  APPLY_Date: string | null; // 申請日期
  APPLY_USR_No: string; // 申請人員編號
  APPLY_USR_Name: string; // 申請人員名稱
  IN_TotBuyAmt: number; // 調入總進價
  OUT_TotBuyAmt: number; // 調出總進價
  DIFF_TotBuyAmt: number; // 差異總進價
  APRV_Date: string; // 核准日期
  APRV_USR_No: string; // 核准人員編號
  APRV_USR_Name: string; // 核准人員名稱
  VOID_Date: string; // 作廢日期
  VOID_USR_No: string; // 作廢人員編號
  VOID_USR_Name: string; // 作廢人員名稱
  CLOS_Date: string; // 結案日期
  CLOS_USR_No: string; // 結案人員編號
  CLOS_USR_Name: string; // 結案人員名稱
  Confim_Date: string; // 確認日期
  Confim_USR_No: string; // 確認人員編號
  Confim_USR_Name: string; // 確認人員名稱
  TRD_Remark: string; // 備註
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

/**
 * 查詢 STORETRADED 資料表 (同業調撥明細) 條件介面
 * 對應 Swagger: POST /TLS0000/TLS5000/querySTORETRADED 的 Request Body
 */
export interface IQuerySTORETRADEDRequest {
  TRD_No: string; // 交易單號
  OUT_HOS_No?: string; // 查詢編號 (國際條碼/商品管理編號/廠商貨號)
}

/**
 * STORETRADED (同業調撥明細) 回應資料介面
 * 對應 Swagger: POST /TLS0000/TLS5000/querySTORETRADED 的 Response Data
 */
export interface IQuerySTORETRADEDResponse {
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  id: number;
  MID: number;
  TRD_No: string; // 交易單號
  SYS_StoreNo: string; // 系統門市編號
  HOS_No: string; // 品牌編號
  TRD_SeqNo: number; // 項次
  PLU_MagNo: string; // 商品管理編號
  PLU_No: string; // 國際條碼
  PLU_Unit: string; // 單位代碼
  PLU_BoxQty: number; // 箱入數
  PLU_Name: string; // 商品名稱
  TRD_Type: string; // 交易類型
  PLU_SalePrc: number; // 售價
  TRD_Qty: number; // 交易數量
  TRD_Amt: number; // 交易金額
  TRD_Remark: string; // 備註
  UNIT_NAME: string; // 單位名稱
  NowHaveQty: number; // 目前庫存量
}

/**
 * 新增/更新同業調撥單的明細介面
 * 對應 Swagger: POST /TLS0000/TLS5000/insertTLS56080 和 updateTLS56080 的 Details 陣列
 */
export interface ITLS56080Detail {
  SYS_StoreNo: string;
  HOS_No: string;
  PLU_MagNo: string;
  PLU_No: string;
  PLU_Unit: string;
  PLU_BoxQty: number;
  PLU_Name: string;
  TRD_Type: string;
  PLU_SalePrc: number;
  TRD_Qty: number;
  TRD_Amt: number;
  TRD_Remark: string;
  id?: number; // 更新時需要
  TRD_No?: string; // 更新時需要
}

/**
 * 新增/更新同業調撥單主檔介面
 * 對應 Swagger: POST /TLS0000/TLS5000/insertTLS56080 和 updateTLS56080 的 Request Body
 */
export interface IModifyTLS56080Request {
  id?: number; // 更新時需要
  TRD_No?: string;
  SYS_StoreNo: string;
  HOS_No: string;
  VEN_No: string;
  LOGO_No: string;
  TRD_Reason: string;
  IN_TotBuyAmt: number;
  OUT_TotBuyAmt: number;
  DIFF_TotBuyAmt: number;
  APPLY_Date: string;
  APPLY_USR_No: string;
  APPLY_USR_Name?: string;
  TRD_Remark: string;
  Details: ITLS56080Detail[];
}

/**
 * 根據狀態更新 STORETRADEM 資料介面
 * 對應 Swagger: POST /TLS0000/TLS5000/updateStatusTLS56080 的 Request Body
 */
export interface IUpdateStatusTLS56080Request {
  DetailList: {
    TRD_No: string;
    TRD_Status: string;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class Tls56080Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 STORETRADEM (同業調撥主檔) 資料表。
   * @param params 查詢條件。
   * @returns 包含 IQueryTLS56080Response 陣列的 API 響應。
   */
  queryTLS56080(
    params: IQueryTLS56080Request,
  ): Observable<ApiResponse<IQueryTLS56080Response[]>> {
    return this.http.post<ApiResponse<IQueryTLS56080Response[]>>(
      `${this.apiUrl}/queryTLS56080`,
      params,
    ).pipe(
      map(response => {
        return {
          ...response,
          Data: response.Data.map(item => ({
            ...item,
            APPLY_Date: item.APPLY_Date ? new Date(item.APPLY_Date).toISOString() : null,
          }))
        };
      })
    )
  }

  /**
   * 查詢 STORETRADED (同業調撥明細) 資料表。
   * @param params 查詢條件。
   * @returns 包含 IQuerySTORETRADEDResponse 陣列的 API 響應。
   */
  querySTORETRADED(
    params: IQuerySTORETRADEDRequest,
  ): Observable<ApiResponse<IQuerySTORETRADEDResponse[]>> {
    return this.http.post<ApiResponse<IQuerySTORETRADEDResponse[]>>(
      `${this.apiUrl}/querySTORETRADED`,
      params,
    );
  }

  /**
   * 新增一筆同業調撥單。
   * @param data 要新增的調撥單資料。
   * @returns API 響應。
   */
  insertTLS56080(data: IModifyTLS56080Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS56080`, data);
  }

  /**
   * 更新一筆同業調撥單。
   * @param data 要更新的調撥單資料。
   * @returns API 響應。
   */
  updateTLS56080(data: IModifyTLS56080Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS56080`, data);
  }

  /**
   * 根據狀態更新一筆或多筆同業調撥單。
   * @param data 包含交易單號和狀態的陣列。
   * @returns API 響應。
   */
  updateStatusTLS56080(data: IUpdateStatusTLS56080Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateStatusTLS56080`, data);
  }
}
