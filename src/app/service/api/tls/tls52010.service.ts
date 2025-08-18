import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { SortMeta } from 'primeng/api'; // PrimeNG SortMeta 介面
import { ApiResponse } from '../../system/auth.service'; // 請確認你的 ApiResponse 介面路徑是否正確

// --- 共用介面定義 (如果這些介面已在其他地方定義並可引入，則可以移除此處重複的定義) ---
// export interface ApiResponse<T> { ... } // 假設已從 '../../system/auth.service' 引入

// --- TLS52010 服務相關的介面定義 ---

/** 查詢 POS2016 資料表 (queryTLS52010) 的請求介面 */
export interface IQueryTLS52010Request {
  PO_No?: string; // 採購單號
  HOS_No?: string; // 醫院代號
  LOGO_No?: string; // LOGO代碼
  VEN_No?: string; // 廠商代號
  PO_Status?: string; // 採購單狀態
  APPLY_Date_Start?: string; // 申請日期起
  APPLY_Date_End?: string; // 申請日期迄
  APPLY_USR?: string; // 申請人員
  APRV_Date_Start?: string; // 核准日期起
  APRV_Date_End?: string; // 核准日期迄
  APRV_USR?: string; // 核准人員
  CLOS_Date_Start?: string; // 結案日期起
  CLOS_Date_End?: string; // 結案日期迄
  CLOS_USR?: string; // 結案人員
}

/** POS2016 資料表 (queryTLS52010) 的單筆響應資料介面 */
export interface ITLS52010Data {
  id: number;
  PO_No: string; // 採購單號
  SYS_StoreNo: string; // 門店編號 (系統)
  VEN_No: string; // 廠商代號
  LOGO_No: string; // LOGO代碼
  HOS_No: string; // 醫院代號
  HOS_NAME: string; // 醫院名稱
  org_id: string; // 組織代碼
  ODM_TaxType: string; // 稅別
  APPLY_Date: string; // 申請日期 (ISO 格式字串)
  APPLY_USR_No: string; // 申請人員編號
  APPLY_USR_Name: string; // 申請人員姓名
  PO_TotalSubQty: number; // 採購總數量
  PO_TotalBuyNet: number; // 採購總淨額
  PO_TotalBuyTax: number; // 採購總稅額
  PO_TotalBuyAmt: number; // 採購總金額
  PO_TotalSaleNet: number; // 銷售總淨額
  PO_TotalSaleTax: number; // 銷售總稅額
  PO_TotalSaleAmt: number; // 銷售總金額
  PO_Status: string; // 採購單狀態
  APRV_Date: string | null; // 核准日期 (ISO 格式字串)
  APRV_USR_No: string | null; // 核准人員編號
  APRV_USR_Name: string | null; // 核准人員姓名
  VOID_Date: string | null; // 作廢日期 (ISO 格式字串)
  VOID_USR_No: string | null; // 作廢人員編號
  VOID_USR_Name: string | null; // 作廢人員姓名
  CLOS_Date: string | null; // 結案日期 (ISO 格式字串)
  CLOS_USR_No: string | null; // 結案人員編號
  CLOS_USR_Name: string | null; // 結案人員姓名
  PO_Remark: string | null; // 採購單備註
  CRT_Date: string; // 建立日期 (ISO 格式字串)
  CRT_USR_No: string; // 建立人員編號
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期 (ISO 格式字串)
  UPD_USR_No: string; // 變更人員編號
  UPD_USR_Name: string; // 變更人員姓名
  CanClos: boolean; // 是否可結案
}

/** 取得預算金額 (GetBudgetAmount) 的請求介面 */
export interface IGetBudgetAmountRequest {
  LOGO_No: string; // LOGO代碼
  YYYYMM: string; // 年月 (YYYYMM 格式字串)
}

/** 取得預算金額 (GetBudgetAmount) 的響應數據介面 */
export interface IBudgetAmountResponse {
  BudgetAmount: number; // 預算金額 (請根據實際響應調整，這裡假設是數字)
  // Swagger 範例只給了 200 OK 沒有 Data 結構，這裡假設直接返回數字或包含 BudgetAmount 的物件
  // 如果實際響應是像 ApiResponse 這種包裝，則返回值會是 ApiResponse<number> 或 ApiResponse<{BudgetAmount: number}>
}


/** POS2004 資料表的詳細商品數據介面 (queryPOS2004Detail & queryPOS2004Detail_VEN_No 響應) */
export interface IPOS2004DetailData {
  id?: number;
  PO_No: string;
  HOS_No: string;
  POD_SeqNo?: number;
  PLU_MagNo: string; // 商品管理編號
  PLU_Name: string; // 商品名稱
  PLU_No: string; // 國際條碼
  PLU_Unit: string; // 商品單位
  UNIT_NAME: string; // 單位名稱
  PLU_BoxQty: number; // 包裝入數
  PLU_StockTaxType: string; // 進貨稅別
  PLU_TaxType: string; // 售價稅別
  PLU_SalePrc_UNI?: number; // 單價
  PLU_SalePrc?: number; // 售價
  POD_SubQty?: number; // 採購數量
  POD_BuyNet?: number; // 採購淨額
  POD_SaleAmt?: number; // 銷售金額
  POD_Remark?: string; // 備註
}

/** 商品管理編號/國際條碼/廠商貨號查詢商品 (queryPOS2004Detail) 的請求介面 */
export interface IQueryPOS2004DetailRequest {
  VEN_No: string | null; // 廠商代號
  queryNo: string; // 查詢編號 (商品管理編號/國際條碼/廠商貨號)
  PLU_Name?: string; // 商品名稱 (查詢條件，可選)
  LOGO_No: string | null; // LOGO代碼
}

export interface IQueryPOS2004DetailResponse {
  id: number,
  PLU_MagNo: string,
  PLU_Name: string,
  PLU_No: string,
  PLU_OrgPLUNo: string,
  PLU_Unit: string,
  UNIT_NAME: string,
  PLU_BoxQty: number,
  PLU_StockTaxType: string,
  PLU_SalePrc_UNI: number,
  PLU_SalePrc: number,
  PLU_TaxType: string
}

/** 查詢廠商所有商品 (queryPOS2004Detail_VEN_No) 的請求介面 */
export interface IQueryPOS2004DetailByVenNoRequest {
  VEN_No: string; // 廠商代號
  PLU_MagNo?: string; // 商品管理編號 (查詢條件，可選)
  PLU_Name?: string; // 商品名稱 (查詢條件，可選)
  CAT_LNo?: string; // 大分類代碼 (查詢條件，可選)
  CAT_MNo?: string; // 中分類代碼 (查詢條件，可選)
  CAT_SNo?: string; // 小分類代碼 (查詢條件，可選)
  LOGO_No: string; // LOGO代碼
}


/** 採購單明細資料介面 (用於 insert/update TLS52010 的 Details 陣列) */
export interface IPODetail {
  POD_SeqNo?: number; // 明細序號
  SYS_StoreNo: string; // 門店編號
  PLU_MagNo: string; // 商品管理編號
  PLU_No: string; // 商品編號
  PLU_Name: string; // 商品名稱
  PLU_Unit: string; // 商品單位
  PLU_BoxQty: number; // 箱入數
  PLU_StockTaxType: string; // 進貨稅別
  PLU_TaxType: string; // 售價稅別
  POD_SubQty: number; // 採購數量
  POD_BuyPrc: number; // 採購單價
  POD_BuyNet: number; // 採購淨額
  POD_SalePrc: number; // 銷售單價
  POD_SaleAmt: number; // 銷售金額
  POD_Remark: string | null; // 明細備註
  id?: number; // 更新時可能包含的明細ID (Swagger update範例有)
}


/** 新增 POS2016 資料表 (insertTLS52010) 的請求介面 */
export interface ITLS52010Request {
  id?: number;
  org_id: string | null;
  PO_No: string; // 採購單號
  ODM_TaxType: string;
  SYS_StoreNo: string; // 門店編號 (系統)
  VEN_No: string; // 廠商代號
  LOGO_No: string; // LOGO代碼
  HOS_No: string; // 醫院代號
  PO_Status: string; // 資料狀態
  PO_TotalSubQty: number; // 採購總數量
  PO_TotalSaleNet?: number; // 售價未稅小計
  PO_TotalSaleTax?: number; // 售價稅額
  PO_TotalSaleAmt: number; // 售價總金額
  PO_TotalBuyAmt: number; // 採購總金額
  PO_TotalBuyTax: number; // 採購稅額
  PO_TotalBuyNet: number; // 採購淨額
  APPLY_Date: string | Date; // 申請日期 (ISO 格式字串)
  APPLY_USR_No: string; // 申請人員編號
  APPLY_USR_Name: string; // 申請人員姓名
  PO_Remark: string | null; // 採購單備註
  BudgetAmount: number | null; // 預算金額 (可選，但範例有)
  YYYYMM: string; // 年月 (YYYYMM 格式字串)
  Details: IPODetail[]; // 明細資料陣列
}

/** 查詢 POS2017 資料表 (queryPOS2017) 的請求介面 */
export interface IQueryPOS2017Request {
  PO_No: string; // 採購單號
}

/** POS2017 資料表 (queryPOS2017) 的單筆響應資料介面 */
export interface IPOS2017Data {
  id: number,
  PO_No: string,
  HOS_No: string,
  SYS_StoreNo: string,
  POD_SeqNo: number,
  PLU_MagNo: string,
  PLU_No: string,
  PLU_Unit: string,
  PLU_BoxQty: number,
  PLU_Name: string,
  PLU_StockTaxType: string,
  POD_SubQty: number,
  POD_BuyPrc: number,
  POD_BuyNet: number,
  POD_BuyTax: number,
  POD_BuyAmt: number,
  PLU_TaxType: string,
  POD_SalePrc: number,
  POD_SaleTax: number,
  POD_SaleAmt: number,
  POD_Remark: string,
  UNIT_NAME: string,
  CRT_Date: string,
  CRT_USR_No: string,
  CRT_USR_Name: string,
  UPD_Date: string,
  UPD_USR_No: string,
  UPD_USR_Name: string,
}

/** 更新 POS2016 資料狀態 (SetCloseTLS52010) 的請求介面 */
export interface ISetCloseTLS52010Request {
  idList: number[]; // 要設定狀態的採購單 ID 列表
  PO_Status: string; // 要設定的狀態 (例如 "結案", "作廢" 等)
}

@Injectable({
  providedIn: 'root',
})
export class Tls52010Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2016 (採購單主檔) 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS52010Data 陣列的 API 響應
   */
  queryTLS52010(params: IQueryTLS52010Request): Observable<ApiResponse<ITLS52010Data[]>> {
    return this.http.post<ApiResponse<ITLS52010Data[]>>(`${this.apiUrl}/queryTLS52010`, params);
  }

  /**
   * 取得預算金額
   * @param params 預算查詢條件 (LOGO_No, YYYYMM)
   * @returns 預算金額的 API 響應
   */
  GetBudgetAmount(params: IGetBudgetAmountRequest): Observable<ApiResponse<number>> { // 假設返回的 Data 是數字
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/GetBudgetAmount`, params);
  }
  /**
   * 查詢 POS2004 (商品詳細資料) 資料表
   * @param params 查詢條件 (VEN_No, queryNo, PLU_Name, LOGO_No)
   * @returns 包含 IPOS2004DetailData 陣列的 API 響應
   */
  queryPOS2004Detail(params: IQueryPOS2004DetailRequest): Observable<ApiResponse<IQueryPOS2004DetailResponse[]>> {
    return this.http.post<ApiResponse<IQueryPOS2004DetailResponse[]>>(`${this.apiUrl}/queryPOS2004Detail`, params);
  }
  /**
   * 查詢廠商所有商品 (POS2004 詳細資料)
   * @param params 查詢條件 (VEN_No, LOGO_No, PLU_MagNo, PLU_Name, CAT_LNo, CAT_MNo, CAT_SNo)
   * @returns 包含 IPOS2004DetailData 陣列的 API 響應
   */
  queryPOS2004DetailByVenNo(params: IQueryPOS2004DetailByVenNoRequest): Observable<ApiResponse<IPOS2004DetailData[]>> {
    return this.http.post<ApiResponse<IPOS2004DetailData[]>>(`${this.apiUrl}/queryPOS2004Detail_VEN_No`, params);
  }
  /**
   * 查詢 POS2017 (採購單明細) 資料表
   * @param params 查詢條件 (PO_No)
   * @returns 包含 IPOS2017Data 陣列的 API 響應
   */
  queryPOS2017(params: IQueryPOS2017Request): Observable<ApiResponse<IPOS2017Data[]>> {
    return this.http.post<ApiResponse<IPOS2017Data[]>>(`${this.apiUrl}/queryPOS2017`, params);
  }

  /**
   * 根據狀態更新 POS2016 (採購單主檔) 資料 (結案或作廢)
   * @param data 包含要更新的採購單 ID 列表及目標狀態
   * @returns API 響應
   */
  updateStatusTLS52010(data: ISetCloseTLS52010Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateStatusTLS52010`, data);
  }
  /**
   * 新增 POS2016 (採購單主檔) 資料
   * @param data 要新增的採購單資料，包含主檔及明細
   * @returns API 響應
   */
  insertTLS52010(data: ITLS52010Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertTLS52010`, data);
  }

  /**
   * 更新 POS2016、POS2017 (採購單主檔及明細) 資料
   * @param data 要更新的採購單資料，包含主檔及明細
   * @returns API 響應
   */
  updateTLS52010(data: ITLS52010Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateTLS52010`, data);
  }


  /**
   * 取得標籤檔資料
   * @param params 查詢條件 (PO_No)
   * @returns API 響應
   */
  getLabelTLS52010(params: { PO_No: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/getLabelTLS52010`, params);
  }
}
