import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { ApiResponse } from '../../system/auth.service'; // 請確認你的 ApiResponse 介面路徑是否正確
/** 查詢 POS2031P 資料表 (queryTLS52020) 的請求介面 */
export interface IQueryTLS52020Request {
  CRN_No?: string; // 退貨單編號
  HOS_NoList?: string[]; // 醫院代號列表
  LOGO_NoList?: string[]; // 品牌代碼列表
  VEN_No?: string; // 廠商代號
  CRN_StatusList?: string[]; // 退貨單狀態列表
  APPLY_Date_Start?: string; // 申請日期起 (YYYY-MM-DD 或 ISO 格式)
  APPLY_Date_End?: string; // 申請日期迄 (YYYY-MM-DD 或 ISO 格式)
  APPLY_USR?: string; // 申請人員編號
  APRV_Date_Start?: string; // 核准日期起 (YYYY-MM-DD 或 ISO 格式)
  APRV_Date_End?: string; // 核准日期迄 (YYYY-MM-DD 或 ISO 格式)
  APRV_USR?: string; // 核准人員編號
  CLOS_Date_Start?: string; // 結案日期起 (YYYY-MM-DD 或 ISO 格式)
  CLOS_Date_End?: string; // 結案日期迄 (YYYY-MM-DD 或 ISO 格式)
  CLOS_USR?: string; // 結案人員編號
}
/** POS2031P 資料表 (queryTLS52020) 的單筆響應資料介面 */
export interface ITLS52020Data {
  id: number;
  CRN_No: string; // 退貨單編號
  SYS_StoreNo: string; // 門店編號 (系統)
  VEN_No: string; // 廠商代號
  LOGO_No: string; // 品牌代碼
  HOS_No: string; // 醫院代號
  HOS_NAME: string; // 醫院名稱
  CRN_TaxType: string;
  org_id: string; // 組織代碼
  CRN_Status: string; // 退貨單狀態
  CRN_TotalSubQty: number; // 退貨數量合計
  CRN_TotalBuyNet: number; // 未稅進價小計
  CRN_TotalBuyTax: number; // 進價稅額小計
  CRN_TotalBuyAmt: number; // 進價合計
  CRN_TotalSaleAmt: number; // 售價合計
  CRN_Remark: string | null; // 退貨單備註
  APPLY_Date: string; // 申請日期 (ISO 格式字串)
  APPLY_USR_No: string; // 申請人員編號
  APPLY_USR_Name: string; // 申請人員姓名
  APRV_Date: string | null; // 核准日期 (ISO 格式字串)
  APRV_USR_No: string | null; // 核准人員編號
  APRV_USR_Name: string | null; // 核准人員姓名
  ReAPRV_Date: string | null;     // 反審核日期
  ReAPRV_USR_No: string | null;   // 反審核人員編號
  ReAPRV_USR_Name: string | null; // 反審核人員姓名
  Void_Date: string | null; // 作廢日期 (ISO 格式字串)
  Void_USR_No: string | null; // 作廢人員編號
  Void_USR_Name: string | null; // 作廢人員姓名
  CLOS_Date: string | null; // 結案日期 (ISO 格式字串)
  CLOS_USR_No: string | null; // 結案人員編號
  CLOS_USR_Name: string | null; // 結案人員姓名
  CRT_Date: string; // 建立日期 (ISO 格式字串)
  CRT_USR_No: string; // 建立人員編號
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期 (ISO 格式字串)
  UPD_USR_No: string; // 變更人員編號
  UPD_USR_Name: string; // 變更人員姓名
  CanClos: boolean; // 是否可結案
}
/** 查詢廠商所有商品 (queryPOS2004Detail_VEN_No_TLS52020) 的請求介面 */
export interface IQueryPOS2004DetailVENNoTLS52020Request {
  VEN_No?: string; // 廠商代號
  LOGO_No?: string; // 品牌代碼
  PLU_MagNo?: string; // 商品管理編號
  PLU_Name?: string; // 商品名稱
  CAT_LNo?: string; // 大分類代碼
  CAT_MNo?: string; // 中分類代碼
  CAT_SNo?: string; // 小分類代碼
}
/** POS2004 商品資料的響應介面 (用於多個查詢) */
export interface IPOS2004DetailData {
  id: number;
  PLU_MagNo: string; // 商品管理編號
  PLU_Name: string; // 商品名稱
  PLU_No: string; // 國際條碼
  PLU_Unit: string; // 單位編號
  UNIT_NAME: string; // 單位名稱
  PLU_BoxQty: number; // 包裝入數
  PLU_StockTaxType: string; // 進貨稅別 (0免稅, 1應稅)
  PLU_SalePrc_UNI: number; // 未稅進價
  PLU_SalePrc: number; // 含稅售價
}
/** 新增更新 請求 */
export interface TLS52020Request {
  id?: number; // 主檔 ID (用於更新時識別)
  CRN_No?: string; // 退貨單編號
  org_id?: string;
  SYS_StoreNo?: string; // 門店編號 (系統)
  VEN_No?: string; // 廠商代號
  LOGO_No?: string; // 品牌代碼
  HOS_No?: string; // 醫院代號
  CRN_TaxType?: string; // 退貨稅別
  CRN_TotalSubQty?: number; // 退貨數量合計
  CRN_TotalBuyNet?: number; // 未稅進價小計
  CRN_TotalBuyTax?: number; // 進價稅額小計
  CRN_TotalBuyAmt?: number; // 進價合計
  CRN_TotalSaleAmt?: number; // 售價總計
  APPLY_Date?: Date; // 申請日期 (ISO 格式字串)
  APPLY_USR_No?: string; // 申請人員編號
  APPLY_USR_Name?: string; // 申請人員姓名
  CRN_Status?: string; // 退貨單狀態
  CRN_Remark?: string | null; // 退貨單備註
  YYYYMM?: string; // 年月 (例如 "202507")
  Details?: TLS52020Detail[]; // 退貨單明細列表
}
/** 新增更新明細 */
export interface TLS52020Detail {
  id?: number,
  CRN_No?: string
  SYS_StoreNo?: string,
  HOS_No?: string | null,
  PLU_MagNo: string,
  PLU_No: string,
  PLU_Name: string,
  PLU_Unit: string,
  PLU_BoxQty: number,
  PLU_StockTaxType: string,
  PLU_TaxType?: string,
  CRN_SubQty: number,
  CRN_BuyPrc: number,
  CRN_BuyNet?: number,
  CRN_BuyTax?: number,
  CRN_BuyAmt?: number,
  CRN_SalePrc: number,
  CRN_SaleTax?: number,
  CRN_SaleAmt?: number,
  CRN_Remark: string,
}
/** POS2032P 資料表 (queryPOS2032P) 的單筆響應資料介面 */
export interface IPOS2032PData {
  id: number,
  CRN_No: string,
  SYS_StoreNo: string,
  HOS_No: string,
  CRN_SeqNo: number,
  PLU_MagNo: string,
  PLU_No: string,
  PLU_Unit: string,
  PLU_BoxQty: number,
  PLU_Name: string,
  CRN_SubQty: number,
  PLU_StockTaxType: string,
  CRN_BuyPrc: number,
  CRN_BuyNet: number,
  CRN_BuyTax: number,
  CRN_BuyAmt: number,
  PLU_TaxType: string,
  CRN_SalePrc: number,
  CRN_SaleTax: number,
  CRN_SaleAmt: number,
  CRN_Remark: string,
  UNIT_NAME: string
  CRT_Date: string,
  CRT_USR_No: string,
  CRT_USR_Name: string,
  UPD_Date: string,
  UPD_USR_No: string,
  UPD_USR_Name: string,
  PLU_SalePrc_UNI: number,
  PLU_SalePrc: number
}
export interface ISetCloseTLS52020Request {
  _DetailList:
  {
    CRN_No: string,
    CRN_Status: string,
    CRN_Status_Ori: string
  }[]
}
@Injectable({
  providedIn: 'root',
})
export class Tls52020Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2031P (退貨單主檔) 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS52020Data 陣列的 API 響應
   */
  queryTLS52020(params: IQueryTLS52020Request): Observable<ApiResponse<ITLS52020Data[]>> {
    return this.http.post<ApiResponse<ITLS52020Data[]>>(`${this.apiUrl}/queryTLS52020`, params);
  }
  /**
   * 查詢 POS2032P (退貨單明細) 資料表
   * @param params 查詢條件 (退貨單編號)
   * @returns 包含 IPOS2032PData 陣列的 API 響應
   */
  queryPOS2032P(params: { CRN_No?: string; }): Observable<ApiResponse<IPOS2032PData[]>> {
    return this.http.post<ApiResponse<IPOS2032PData[]>>(`${this.apiUrl}/queryPOS2032P`, params);
  }
  /**
   * 查詢廠商所有商品 (POS2004 資料)
   * @param params 查詢條件
   * @returns 包含 IPOS2004DetailData 陣列的 API 響應
   */
  queryPOS2004DetailVENNoTLS52020(params: IQueryPOS2004DetailVENNoTLS52020Request): Observable<ApiResponse<IPOS2004DetailData[]>> {
    return this.http.post<ApiResponse<IPOS2004DetailData[]>>(`${this.apiUrl}/queryPOS2004Detail_VEN_No_TLS52020`, params);
  }
  /**
   * 取得標籤檔資料
   * @param params 查詢條件 (退貨單編號)
   * @returns API 響應 (通常包含標籤資料)
   */
  getLabelTLS52020(params: { CRN_No?: string; }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/getLabelTLS52020`, params);
  }
  /**
   * 根據狀態更新 POS2031P (退貨單主檔) 資料 (例如：結案、作廢、審核等)
   * @param data 包含要更新的退貨單 ID 列表及目標狀態
   * @returns API 響應
   */
  updateStatusTLS52020(data: ISetCloseTLS52020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateStatusTLS52020`, data);
  }
  /**
   * 新增 POS2031P (退貨單主檔) 資料表
   * @param data 包含退貨單主檔及明細資料
   * @returns API 響應 (通常為成功訊息或 ID)
   */
  insertTLS52020(data: TLS52020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertTLS52020`, data);
  }
  /**
   * 更新 POS2031P (退貨單主檔) 及 POS2032P (退貨單明細) 資料
   * @param data 包含退貨單主檔及明細資料
   * @returns API 響應 (通常為成功訊息)
   */
  updateTLS52020(data: TLS52020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateTLS52020`, data);
  }
}
