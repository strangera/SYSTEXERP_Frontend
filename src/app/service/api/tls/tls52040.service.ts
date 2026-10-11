import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 請確認你的 ApiResponse 介面路徑是否正確
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確

/** 查詢 POS2031 資料表 (queryTLS52040) 的請求介面 */
export interface IQueryTLS52040Request {
  RJM_No?: string; // 退貨驗收單號
  LOGO_NoList?: string[]; // 品牌代碼列表
  HOS_NoList?: string[]; // 倉庫代碼列表
  PLU_MagNo?: string; // 商品管理編號 (用於查詢明細)
  VEN_No?: string; // 廠商編號
  RJM_StatusList?: string[]; // 退貨驗收狀態列表
  APPLY_USR?: string; // 申請人員編號
  APPLY_Date_Start?: string; // 申請日期起 (YYYY-MM-DD 或 ISO 格式)
  APPLY_Date_End?: string; // 申請日期迄 (YYYY-MM-DD 或 ISO 格式)
  CRN_No?: string; // 退貨單號 (關聯查詢)
  APRV_USR?: string; // 審核人員編號
  APRV_Date_Start?: string; // 審核日期起 (YYYY-MM-DD 或 ISO 格式)
  APRV_Date_End?: string; // 審核日期迄 (YYYY-MM-DD 或 ISO 格式)
}

/** POS2031 資料表 (queryTLS52040) 的單筆響應資料介面 (退貨驗收主檔) */
export interface ITLS52040Data {
  id: number;
  RJM_No: string; // 退貨驗收單號
  SYS_StoreNo: string; // 門店編號 (系統)
  VEN_No: string; // 廠商編號
  LOGO_No: string; // 品牌代碼
  LOGO_CH_NAME: string; // 品牌中文名稱
  HOS_No: string; // 倉庫代號
  HOS_NAME: string; // 倉庫名稱
  org_id: string; // 組織代碼
  APPLY_Date: string; // 驗收日期 (ISO 格式字串)
  APPLY_USR_No: string; // 驗收人員編號
  APPLY_USR_Name: string; // 驗收人員姓名
  RJM_TotalBuyNet: number; // 未稅進價小計
  RJM_TotalBuyTax: number; // 進價稅額小計
  RJM_TotalBuyAmt: number; // 進價合計
  RJM_TotalSaleNet: number; // 未稅售價小計
  RJM_TotalSaleTax: number; // 售價稅額小計
  RJM_TotalSaleAmt: number; // 售價合計
  RJM_Status: string; // 退貨驗收狀態
  RJM_TaxType: string; // 單據稅別
  APRV_Date: string | null; // 審核日期 (ISO 格式字串)
  APRV_USR_No: string | null; // 審核人員編號
  APRV_USR_Name: string | null; // 審核人員姓名
  ReAPRV_Date: string | null; // 反審核日期 (ISO 格式字串)
  ReAPRV_USR_No: string | null; // 反審核人員編號
  ReAPRV_USR_Name: string | null; // 反審核人員姓名
  Void_Date: string | null; // 作廢日期 (ISO 格式字串)
  Void_USR_No: string | null; // 作廢人員編號
  Void_USR_Name: string | null; // 作廢人員姓名
  RJM_Remark: string | null; // 退貨驗收單備註
  Request_No: string | null; // 請款單號
  Rebate_No: string | null; // 折讓單號
  ACP_No: string | null; // 應付帳款編號
  Voucher_No: string | null; // 傳票編號
  CRT_Date: string; // 建立日期 (ISO 格式字串)
  CRT_USR_No: string; // 建立人員編號
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期 (ISO 格式字串)
  UPD_USR_No: string; // 變更人員編號
  UPD_USR_Name: string; // 變更人員姓名
  CanAPRV: boolean; // 可否審核
  CanReAPRV: boolean; // 可否反審核
}

/** 退貨驗收明細資料介面 (用於 insert/update TLS52040 的 Details 陣列，對應 POS2032) */
export interface ITLS52040Detail {
  id?: number; // 明細 ID (更新時識別)
  SYS_StoreNo?: string; // 門店編號 (系統)
  HOS_No?: string; // 倉庫代碼
  PLU_MagNo?: string; // 商品管理編號
  PLU_No?: string; // 國際條碼
  PLU_Unit?: string; // 單位編號
  PLU_BoxQty?: number; // 包裝入數
  PLU_Name?: string; // 商品名稱
  RJD_ConfirmQty?: number; // 確認數量 (本次驗收數量)
  PLU_StockTaxType?: string; // 進貨稅別
  RJD_BuyPrc?: number; // 進貨單價 (未稅)
  RJD_BuyNet?: number; // 進貨淨額 (小計)
  RJD_BuyTax?: number; // 進貨稅額
  RJD_BuyAmt?: number; // 進貨金額 (含稅小計)
  PLU_TaxType?: string; // 商品稅別 (0=免稅、1=應稅)
  RJD_SalePrc?: number; // 銷售單價 (含稅)
  RJD_SaleTax?: number; // 銷售稅額
  RJD_SaleAmt?: number; // 銷售金額 (售價小計)
  RJD_Remark?: string | null; // 明細備註
  CRN_SubQty?: number; // 採購數量 (來自採購單明細，用於參考)
  RJD_ConfirmQty_Finished?: number; // 已完成確認數量 (累計已驗收數量)
  CRN_No?: string; // 退貨單號 (關聯)
  RJM_No?: string; // 退貨驗收單號 (主檔關聯)
  LOGO_No?: string; // 品牌代碼
  org_id?: string; // 組織代碼
  RJM_TaxType?: string; // 單據稅別
}

/** 新增 POS2031 資料表 (insertTLS52040) 的請求介面 */
export interface TLS52040Request {
  id?: number; // 主檔 ID (更新時識別)
  RJM_No?: string; // 退貨驗收單號
  SYS_StoreNo?: string; // 門店編號 (系統)
  HOS_No?: string; // 倉庫代碼
  VEN_No?: string; // 廠商編號
  LOGO_No?: string; // 品牌代碼
  org_id?: string; // 組織代碼
  RJM_TaxType?: string; // 單據稅別
  RJM_Status?: string; // 退貨驗收狀態 (通常為初始狀態，例如 '0' 已申請)
  RJM_TotalBuyNet?: number; // 未稅進價小計
  RJM_TotalBuyTax?: number; // 進價稅額小計
  RJM_TotalBuyAmt?: number; // 進價合計
  RJM_TotalSaleNet?: number; // 未稅售價小計
  RJM_TotalSaleTax?: number; // 售價稅額小計
  RJM_TotalSaleAmt?: number; // 售價合計
  RJM_Remark?: string | null; // 退貨驗收單備註
  APRV_Date?: string; // 審核日期 (ISO 格式字串)
  APPLY_Date?: string; // 申請日期 (ISO 格式字串)
  APPLY_USR_No?: string; // 申請人員編號
  APPLY_USR_Name?: string; // 申請人員姓名
  Details?: ITLS52040Detail[]; // 退貨驗收明細列表
}

/** 取得退貨單資料 (GetPOS2031P) 的請求介面 */
export interface IGetPOS2031PRequest {
  // LOGO_No?: string | null; // 品牌代碼
  HOS_No?: string | null; // 倉庫代碼
  VEN_No?: string | null; // 廠商編號
}

/** 取得退貨單明細及驗收資料 (GetPOS2032PAndPOS2032) 的請求介面 */
export interface IGetPOS2032PAndPOS2032Request {
  CRN_NoList?: string[]; // 退貨單號列表
}

/** 取得退貨單明細及驗收資料 (GetPOS2032PAndPOS2032) 的響應介面 */
export interface IGetPOS2032PAndPOS2032Response {
  // Swagger 沒有提供具體 schema，這裡假設它會返回退貨單明細和已驗收資料的列表
  // 根據 insert/update 的 detail 結構，可能返回 ITLS52040Detail[]
  Details: ITLS52040Detail[];
  // 如果後端返回的是兩個獨立的陣列，則需要調整
  // 例如: Pos2032PDetails: IPOS2032PDetail[]; Pos2032Details: IPOS2032AcceptanceDetail[];
}

/** 取得進貨驗收明細資料 (GetPOS2032) 的請求介面 */
export interface IGetPOS2032Request {
  RJM_No?: string; // 退貨驗收單號
}

/** 更新 POS2031 資料狀態 (審核、作廢、反審核) (updateStatusTLS52040) 的請求介面 */
export interface IUpdateStatusTLS52040Request {
  id?: number; // 主檔 ID
  RJM_No?: string; // 退貨驗收單號
  RJM_Status?: string; // 要設定的狀態
  RJM_Status_Ori?: string; // 原始狀態
  Rebate_No?: string; // 折讓單號 (如果相關)
}

/** 取得標籤檔資料 (getLabelTLS52040) 的請求介面 */
export interface IGetLabelTLS52040Request {
  CRN_No?: string; // 退貨單編號
}

@Injectable({
  providedIn: 'root',
})
export class Tls52040Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2031 (退貨驗收主檔) 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS52040Data 陣列的 API 響應
   */
  queryTLS52040(params: IQueryTLS52040Request): Observable<ApiResponse<ITLS52040Data[]>> {
    return this.http.post<ApiResponse<ITLS52040Data[]>>(`${this.apiUrl}/queryTLS52040`, params);
  }

  /**
   * 新增 POS2031 (退貨驗收主檔) 資料表
   * @param data 包含退貨驗收主檔及明細資料
   * @returns API 響應 (通常為成功訊息或 ID)
   */
  insertTLS52040(data: TLS52040Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertTLS52040`, data);
  }

  /**
   * 取得退貨單資料 (POS2031P)
   * @param params 查詢條件 (LOGO_No, HOS_No, VEN_No)
   * @returns 包含 ITLS52040Data 陣列的 API 響應 (假設返回退貨單主檔列表)
   */
  GetPOS2031P(params: IGetPOS2031PRequest): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.apiUrl}/GetPOS2031P`, params).pipe(
      map((response: ApiResponse<any>) => {
        return {
          ...response,
          Data: response.Data.Data,
          TotalCount: response.Data.TotalCount
        };
      })
    );
  }

  /**
   * 取得退貨單明細及驗收資料 (POS2032P 和 POS2032)
   * @param params 查詢條件 (CRN_NoList)
   * @returns 包含 ITLS52040Detail 陣列的 API 響應 (假設返回退貨驗收明細列表)
   */
  GetPOS2032PAndPOS2032(params: IGetPOS2032PAndPOS2032Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/GetPOS2032PAndPOS2032`, params);
  }

  /**
   * 取得進貨驗收明細資料 (POS2032)
   * @param params 查詢條件 (RJM_No)
   * @returns 包含 ITLS52040Detail 陣列的 API 響應 (假設返回退貨驗收明細列表)
   */
  GetPOS2032(params: IGetPOS2032Request): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/GetPOS2032`, params);
  }

  /**
   * 更新 POS2031、POS2032 (退貨驗收主檔及明細) 資料
   * @param data 包含退貨驗收主檔及明細資料
   * @returns API 響應
   */
  updateTLS52040(data: TLS52040Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateTLS52040`, data);
  }

  /**
   * 更新 POS2031 (退貨驗收主檔) 資料狀態 (審核、作廢、反審核)
   * @param data 包含要更新的退貨驗收單號及目標狀態等資訊
   * @returns API 響應
   */
  updateStatusTLS52040(data: IUpdateStatusTLS52040Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateStatusTLS52040`, data);
  }

  /**
   * 取得標籤檔資料
   * @param params 查詢條件 (退貨單編號)
   * @returns API 響應 (通常包含標籤資料，具體結構未知，使用 any)
   */
  getLabelTLS52040(params: IGetLabelTLS52040Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/getLabelTLS52040`, params);
  }
  /**
       * 匯出退貨單Excel
       * @param params 查詢條件 (CRN_No)
       * @returns API 響應
       */
  exportTLS52040(params: { RJM_NoList: string[] }): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS52040`, params,
      {
        observe: 'response',
        responseType: 'blob'
      });
  }
  /**
   * 匯出退貨單PDF
   * @param params 查詢條件 (CRN_No)
   * @returns API 響應
  */
  exportTLS52040PDF(params: { RJM_NoList: string[] }): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS52040PDF`, params,
      {
        observe: 'response',
        responseType: 'blob'
      });
  }
}
