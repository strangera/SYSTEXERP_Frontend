import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 請確認你的 ApiResponse 介面路徑是否正確
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確

/** 查詢 POS2021 (倉別調撥主檔) 的請求介面 */
export interface IQueryTLS56040Request {
  MVM_No?: string; // 調撥單號
  queryNo?: string; // 查詢號碼
  OUT_HOS_NoList?: string[]; // 調出醫院代號列表
  IN_HOS_NoList?: string[]; // 調入醫院代號列表
  LOGO_NoList?: string[]; // LOGO代碼列表
  MVM_StatusList?: string[]; // 調撥單狀態列表
  APPLY_Date_Start?: string; // 申請日期起
  APPLY_Date_End?: string; // 申請日期迄
  APPLY_USR?: string; // 申請人員
  APRV_Date_Start?: string; // 核准日期起
  APRV_Date_End?: string; // 核准日期迄
  APRV_USR?: string; // 核准人員
}

/** POS2021 (倉別調撥主檔) 的單筆響應資料介面 */
export interface ITLS56040Data {
  id: number;
  MID: number;
  MVM_No: string; // 調撥單號
  SYS_StoreNo: string; // 門店編號 (系統)
  LOGO_No: string; // LOGO代碼
  OUT_HOS_No: string; // 調出醫院代號
  OUT_HOS_NAME: string; // 調出醫院名稱
  IN_HOS_No: string; // 調入醫院代號
  IN_HOS_NAME: string; // 調入醫院名稱
  org_id: string; // 組織代碼
  Org_Name: string; // 組織名稱
  MVM_Status: string; // 調撥單狀態
  MVM_Status_Name: string; // 調撥單狀態名稱
  APPLY_Date: string; // 申請日期
  APPLY_USR_No: string; // 申請人員編號
  APPLY_USR_Name: string; // 申請人員姓名
  APPLY_TotQty: number; // 申請總數量
  APPLY_TotBuyNet: number; // 申請總進貨淨額
  APPLY_TotBuyTax: number; // 申請總進貨稅額
  APPLY_TotBuyAmt: number; // 申請總進貨金額
  APPLY_TotSaleAmt: number; // 申請總銷售金額
  OUTGODS_TotQty: number; // 調出總數量
  OUTGODS_TotBuyNet: number; // 調出總進貨淨額
  OUTGODS_TotBuyTax: number; // 調出總進貨稅額
  OUTGODS_TotBuyAmt: number; // 調出總進貨金額
  OUTGODS_TotSaleAmt: number; // 調出總銷售金額
  Confirm_TotQty: number; // 確認總數量
  Confirm_TotBuyNet: number; // 確認總進貨淨額
  Confirm_TotBuyTax: number; // 確認總進貨稅額
  Confirm_TotBuyAmt: number; // 確認總進貨金額
  Confirm_TotSaleAmt: number; // 確認總銷售金額
  APRV_Date: string | null; // 核准日期
  APRV_USR_No: string | null; // 核准人員編號
  APRV_USR_Name: string | null; // 核准人員姓名
  VOID_Date: string | null; // 作廢日期
  VOID_USR_No: string | null; // 作廢人員編號
  VOID_USR_Name: string | null; // 作廢人員姓名
  OUTGODS_Date: string | null; // 調出日期
  OUTGODS_USR_No: string | null; // 調出人員編號
  OUTGODS_USR_Name: string | null; // 調出人員姓名
  Confirm_Date: string | null; // 確認日期
  Confirm_USR_No: string | null; // 確認人員編號
  Confirm_USR_Name: string | null; // 確認人員姓名
  MVM_Remark: string | null; // 備註
  CRT_Date: string; // 建立日期
  CRT_USR_No: string; // 建立人員編號
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期
  UPD_USR_No: string; // 變更人員編號
  UPD_USR_Name: string; // 變更人員姓名
}

/** 調撥單明細資料介面 (用於 insert/update TLS56040 的 Details 陣列) */
export interface IMVDetail {
  SYS_StoreNo: string; // 門店編號 (系統)
  PLU_MagNo: string; // 商品管理編號
  PLU_No: string; // 商品編號
  PLU_Unit: string; // 商品單位
  PLU_BoxQty: number; // 箱入數
  PLU_Name: string; // 商品名稱
  PLU_StockTaxType: string; // 進貨稅別
  PLU_TaxType: string; // 售價稅別
  MVD_BuyPrc: number; // 進貨單價
  MVD_SalePrc: number; // 銷售單價
  APPLY_Qty: number; // 申請數量
  APPLY_BuyNet: number; // 申請進貨淨額
  APPLY_BuyTax: number; // 申請進貨稅額
  APPLY_BuyAmt: number; // 申請進貨金額
  APPLY_SaleAmt: number; // 申請銷售金額
  MVD_Remark?: string; // 明細備註
  MVM_Status?: string;
  id?: number; // 更新時可能包含的明細ID
  MVM_No?: string; // 更新時可能包含的調撥單號
}

/** 新增 POS2021 資料表 (insertTLS56040) 的請求介面 */
export interface ITLS56040Request {
  id?: number;
  MVM_No?: string; // 更新時需要
  SYS_StoreNo: string;
  LOGO_No: string;
  OUT_HOS_No: string; // 調出醫院代號
  IN_HOS_No: string; // 調入醫院代號
  org_id: string | null;
  APPLY_Date: string | Date; // 申請日期
  APPLY_USR_No: string; // 申請人員編號
  APPLY_USR_Name: string; // 申請人員姓名
  APPLY_TotQty: number; // 申請總數量
  APPLY_TotBuyNet: number; // 申請總進貨淨額
  APPLY_TotBuyTax: number; // 申請總進貨稅額
  APPLY_TotBuyAmt: number; // 申請總進貨金額
  APPLY_TotSaleAmt: number; // 申請總銷售金額
  MVM_Remark?: string | null; // 備註
  MVM_Status?: string | null; // 狀態
  Details: IMVDetail[]; // 明細資料陣列
}

/** 查詢 POS2022 (倉別調撥明細) 的請求介面 */
export interface IQueryPOS2022Request {
  MVM_No: string; // 調撥單號
  OUT_HOS_No: string;
}

/** POS2022 (倉別調撥明細) 的單筆響應資料介面 */
export interface IPOS2022Data {
  id?: number;
  MID?: number;
  MVM_No?: string; // 調撥單號
  SYS_StoreNo?: string;
  MVD_SeqNo?: number; // 明細序號
  PLU_MagNo?: string; // 商品管理編號
  PLU_No?: string; // 商品編號
  PLU_Unit?: string; // 商品單位
  PLU_BoxQty?: number; // 箱入數
  PLU_Name?: string; // 商品名稱
  PLU_StockTaxType?: string; // 進貨稅別
  PLU_TaxType?: string; // 售價稅別
  MVD_BuyPrc?: number; // 進貨單價
  MVD_SalePrc?: number; // 銷售單價
  APPLY_Qty?: number; // 申請數量
  OUTGODS_QTY?: number; // 調出數量
  STK_CurrentQty: number; // 目前庫存量
  Confirm_QTY?: number; // 確認數量
  PLU_SalePrc?: number; // 售價
  APPLY_BuyNet?: number; // 申請進貨淨額
  APPLY_BuyTax?: number; // 申請進貨稅額
  APPLY_BuyAmt?: number; // 申請進貨金額
  APPLY_SaleAmt?: number; // 申請銷售金額
  OUTGODS_BuyNet?: number; // 調出進貨淨額
  OUTGODS_BuyTax?: number; // 調出進貨稅額
  OUTGODS_BuyAmt?: number; // 調出進貨金額
  OUTGODS_SaleAmt?: number; // 調出銷售金額
  Confirm_BuyNet?: number; // 確認進貨淨額
  Confirm_BuyTax?: number; // 確認進貨稅額
  Confirm_BuyAmt?: number; // 確認進貨金額
  Confirm_SaleAmt?: number; // 確認銷售金額
  MVD_Remark?: string | null; // 明細備註
  UNIT_NAME?: string; // 單位名稱
}

/** 更新 POS2021 資料狀態 (updateStatusTLS56040) 的請求介面 */
export interface IUpdateStatusTLS56040Request {
  DetailList: {
    MVM_No: string; // 調撥單號
    MVM_Status: string; // 目標狀態
  }[];
}


@Injectable({
  providedIn: 'root',
})
export class Tls56040Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2021 (倉別調撥主檔) 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS56040Data 陣列的 API 響應
   */
  queryTLS56040(params: IQueryTLS56040Request): Observable<ApiResponse<ITLS56040Data[]>> {
    return this.http.post<ApiResponse<ITLS56040Data[]>>(`${this.apiUrl}/queryTLS56040`, params);
  }

  /**
   * 新增 POS2021 (倉別調撥主檔) 資料
   * @param data 要新增的調撥單資料，包含主檔及明細
   * @returns API 響應
   */
  insertTLS56040(data: ITLS56040Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertTLS56040`, data);
  }

  /**
   * 更新 POS2021、POS2022 (倉別調撥主檔及明細) 資料
   * @param data 要更新的調撥單資料，包含主檔及明細
   * @returns API 響應
   */
  updateTLS56040(data: ITLS56040Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateTLS56040`, data);
  }

  /**
   * 查詢 POS2022 (倉別調撥明細) 資料表
   * @param params 查詢條件 (MVM_No)
   * @returns 包含 IPOS2022Data 陣列的 API 響應
   */
  queryPOS2022(params: IQueryPOS2022Request): Observable<ApiResponse<IPOS2022Data[]>> {
    return this.http.post<ApiResponse<IPOS2022Data[]>>(`${this.apiUrl}/queryPOS2022`, params);
  }

  /**
   * 根據狀態更新 POS2021 (倉別調撥主檔) 資料
   * @param data 包含要更新的調撥單號及目標狀態
   * @returns API 響應
   */
  updateStatusTLS56040(data: IUpdateStatusTLS56040Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateStatusTLS56040`, data);
  }
}
