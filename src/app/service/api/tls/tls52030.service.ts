import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 請確認你的 ApiResponse 介面路徑是否正確
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確

/** 查詢 POS2018 資料表 (queryTLS52030) 的請求介面 */
export interface IQueryTLS52030Request {
  ODM_No?: string; // 驗收編號
  LOGO_No?: string; // 品牌代碼
  HOS_No?: string; // 倉庫代碼
  PLU_MagNo?: string; // 商品管理編號
  VEN_No?: string; // 廠商編號
  ODM_Status?: string; // 驗收狀態
  ODM_USR?: string; // 申請人員
  ODM_Date_Start?: string; // 申請日期起
  ODM_Date_End?: string; // 申請日期迄
  PO_No?: string; // 採購單號
  APRV_USR?: string; // 審核人員
  APRV_Date_Start?: string; // 審核(驗收)日期起
  APRV_Date_End?: string; // 審核(驗收)日期迄
}

/** POS2018 資料表 (queryTLS52030) 的單筆響應資料介面 */
export interface ITLS52030Data {
  id: number;
  ODM_No: string; // 驗收編號
  SYS_StoreNo: string; // 公司編號/店號
  VEN_No: string; // 廠商編號
  LOGO_No: string; // 品牌代碼
  LOGO_CH_NAME: string; // LOGO中文名稱
  HOS_No: string; // 倉庫代碼
  HOS_NAME: string; // 倉庫名稱
  org_id: string; // 組織代碼/組織名稱
  ODM_Date: string; // 申請日期
  ODM_USR_No: string; // 申請人員
  ODM_USR_Name: string; // 申請人員姓名
  ODM_TotalBuyNet: number; // 未稅進價小計
  ODM_TotalBuyTax: number; // 進價稅額小計
  ODM_TotalBuyAmt: number; // 進價合計
  ODM_TotalSaleNet: number; // 未稅售價小計
  ODM_TotalSaleTax: number; // 售價稅額小計
  ODM_TotalSaleAmt: number; // 售價合計
  ODM_Status: string; // 驗收狀態
  ODM_TaxType: string; // 單據稅別
  APRV_Date: string | null; // 審核(驗收)日期
  APRV_USR_No: string | null; // 審核人員
  APRV_USR_Name: string | null; // 審核人員姓名
  ReAPRV_Date: string | null; // 反審核日期
  ReAPRV_USR_No: string | null; // 反審核人員
  ReAPRV_USR_Name: string | null; // 反審核人員姓名
  Void_Date: string | null; // 作廢日期
  Void_USR_No: string | null; // 作廢人員
  Void_USR_Name: string | null; // 作廢人員姓名
  ODM_Remark: string | null; // 備註
  Request_No: string | null; // 請款單號
  ACP_No: string | null; // 應付帳款編號
  Voucher_No: string | null; // 傳票編號
  CRT_Date: string; // 建立日期
  CRT_USR_No: string; // 建立人員
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期
  UPD_USR_No: string; // 變更人員
  UPD_USR_Name: string; // 變更人員姓名
  CanAPRV: boolean; // 可否審核
}

/** 進貨單明細資料介面 (用於 insert/update TLS52030 的 Details 陣列) */
export interface IODDetail {
  SYS_StoreNo: string; // 公司編號/店號
  ODD_SeqNo?: number; // 明細序號 (新增時可選，更新時可能需要)
  PLU_MagNo: string; // 商品管理編號
  PLU_No: string; // 商品編號
  PLU_Unit: string; // 商品單位
  PLU_BoxQty: number; // 箱入數
  PLU_Name: string; // 商品名稱
  PLU_StockTaxType: string; // 進貨稅別
  ODD_BuyPrc: number; // 進貨單價
  ODD_BuyNet: number; // 進貨淨額
  ODD_BuyTax: number; // 進貨稅額
  ODD_BuyAmt: number; // 進貨金額
  PLU_TaxType: string; // 商品稅別
  ODD_SalePrc: number; // 銷售單價
  ODD_SaleTax: number; // 銷售稅額
  ODD_SaleAmt: number; // 銷售金額
  POD_SubQty?: number; // 採購數量 (來自採購單明細)
  ODD_ConfirmQty: number; // 確認數量
  ODD_ConfirmQty_Finished: number; // 已完成確認數量
  ODD_Remark: string | null; // 明細備註
  PO_No: string | null; // 採購單號 (可能來自採購單)
  id?: number; // 更新時可能包含的明細ID (Swagger update範例有)
  LOGO_No?: string; // 品牌代碼
  org_id?: string; // 組織代碼/組織名稱
  ODM_TaxType?: string; // 單據稅別
}

/** 新增 POS2018 資料表 (insertTLS52030) 的請求介面 */
export interface ITLS52030Request {
  id?: number; // ID
  ODM_No?: string; // 進貨單號
  SYS_StoreNo: string; // 公司編號/店號
  VEN_No: string; // 廠商編號
  LOGO_No: string; // 品牌代碼
  HOS_No: string; // 倉庫代碼
  org_id: string | null; // 組織代碼/組織名稱
  ODM_Date: string | Date; // 申請日期
  APRV_Date: string | Date | null; // 審核(驗收)日期
  ODM_USR_No: string; // 申請人員
  ODM_USR_Name: string; // 申請人員姓名
  ODM_TotalBuyNet: number; // 未稅進價小計
  ODM_TotalBuyTax: number; // 進價稅額小計
  ODM_TotalBuyAmt: number; // 進價合計
  ODM_TotalSaleNet?: number; // 未稅售價小計
  ODM_TotalSaleTax?: number; // 售價稅額小計
  ODM_TotalSaleAmt: number; // 售價合計
  ODM_Status?: string; // 驗收狀態
  ODM_TaxType?: string; // 單據稅別
  ODM_Remark: string | null; // 備註
  Details: IODDetail[]; // 明細資料陣列
}

/** 取得採購單資料 (GetPOS2016) 的請求介面 */
export interface IGetPOS2016Request {
  // LOGO_No?: string | null; // 品牌代碼
  HOS_No?: string | null; // 倉庫代碼
  VEN_No?: string | null; // 廠商編號
  ODM_No?: string | null; // 目前編輯的驗收單號(排除占用時不計本張單)，新增時不帶
}

/** 取得採購單明細及驗收資料 (GetPOS2017AndPOS2019) 的請求介面 */
export interface IGetPOS2017AndPOS2019Request {
  PO_NoList: string[]; // 採購單號列表
}

/** 採購單明細資料介面 (GetPOS2017AndPOS2019 響應中的 POS2017 明細) */
export interface ICombinedPOS2017Data {
  id: number;
  PO_No: string; // 採購單號
  POD_SeqNo: number; // 明細序號
  PLU_MagNo: string; // 商品管理編號
  PLU_No: string; // 商品編號
  PLU_Name: string; // 商品名稱
  PLU_Unit: string; // 商品單位
  UNIT_NAME: string; // 單位名稱
  PLU_BoxQty: number; // 箱入數
  PLU_StockTaxType: string; // 進貨稅別
  POD_BuyPrc: number; // 採購單價
  POD_BuyNet: number; // 採購淨額
  POD_SalePrc: number; // 銷售單價
  POD_SaleAmt: number; // 銷售金額
  POD_SubQty: number; // 採購數量
  POD_Remark: string | null; // 明細備註
  // 可能還需要其他來自 POS2017 的字段
}

/** 驗收資料介面 (GetPOS2017AndPOS2019 響應中的 POS2019 資料) */
export interface IPOS2019Data {
  id: number;
  ODM_No: string; // 驗收編號
  ODD_SeqNo: number; // 進貨明細序號
  PO_No: string; // 採購單號
  POD_SeqNo: number; // 採購明細序號
  ODD_ConfirmQty: number; // 已確認數量
  CRT_Date: string; // 建立日期
  CRT_USR_No: string; // 建立人員
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期
  UPD_USR_No: string; // 變更人員
  UPD_USR_Name: string; // 變更人員姓名
  // 可能還需要其他來自 POS2019 的字段
}

/** 取得採購單明細及驗收資料 (GetPOS2017AndPOS2019) 的響應介面 */
export interface IGetPOS2017AndPOS2019Response {
  POS2017: ICombinedPOS2017Data[];
  POS2019: IPOS2019Data[];
  // Swagger 範例沒有給出 Data 結構，這裡假設會返回這兩個陣列
}

/** 更新 POS2018 資料狀態 (updateTLS52030_Status) 的請求介面 */
export interface IUpdateTLS52030StatusRequest {
  ODM_No: string; // 驗收編號
  ODM_Status: string; // 驗收狀態 (例如 "審核", "作廢", "反審核")
  ODM_Status_Ori: string; // 原始狀態
  Request_No?: string | null; // 請款單號 (如果相關)
}

@Injectable({
  providedIn: 'root',
})
export class Tls52030Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2018 (進貨單主檔) 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS52030Data 陣列的 API 響應
   */
  queryTLS52030(params: IQueryTLS52030Request): Observable<ApiResponse<ITLS52030Data[]>> {
    return this.http.post<ApiResponse<ITLS52030Data[]>>(`${this.apiUrl}/queryTLS52030`, params);
  }

  /**
   * 新增 POS2018 (進貨單主檔) 資料
   * @param data 要新增的進貨單資料，包含主檔及明細
   * @returns API 響應
   */
  insertTLS52030(data: ITLS52030Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertTLS52030`, data);
  }

  /**
   * 取得採購單資料 (POS2016)
   * @param params 查詢條件 (LOGO_No, HOS_No, VEN_No)
   * @returns 包含 IGetPOS2016Data 陣列的 API 響應
   */
  getPOS2016(params: IGetPOS2016Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/GetPOS2016`, params).pipe(
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
   * 取得採購單明細及驗收資料 (POS2017 和 POS2019)
   * @param params 查詢條件 (PO_NoList)
   * @returns 包含 POS2017 和 POS2019 資料的 API 響應
   */
  getPOS2017AndPOS2019(params: IGetPOS2017AndPOS2019Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/GetPOS2017AndPOS2019`, params);
  }

  /**
   * 取得進貨驗收明細資料 (POS2019)
   * @param params 查詢條件 (ODM_No)
   * @returns 包含 POS2019 資料的 API 響應
   */
  GetPOS2019(params: { ODM_No?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/GetPOS2019`, params);
  }

  /**
   * 更新 POS2018、POS2019 (進貨單主檔及明細) 資料
   * @param data 要更新的進貨單資料，包含主檔及明細
   * @returns API 響應
   */
  updateTLS52030(data: ITLS52030Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateTLS52030`, data);
  }

  /**
   * 更新 POS2018 (進貨單主檔) 資料狀態 (審核、作廢、反審核)
   * @param data 包含要更新的進貨單 ID 及目標狀態
   * @returns API 響應
   */
  updateStatusTLS52030(data: IUpdateTLS52030StatusRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateStatusTLS52030`, data);
  }
  /**
     * 匯出採購單
     * @param params 查詢條件 (PO_No)
     * @returns API 響應
     */
  exportTLS52030(params: { ODM_NoList: string[] }): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS52030`, params,
      {
        observe: 'response',
        responseType: 'blob'
      });
  }
  /**
   * 匯出採購單PDF
   * @param params 查詢條件 (PO_No)
   * @returns API 響應
  */
  exportTLS52030PDF(params: { ODM_NoList: string[] }): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS52030PDF`, params,
      {
        observe: 'response',
        responseType: 'blob'
      });
  }
}
