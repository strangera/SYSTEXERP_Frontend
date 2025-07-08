import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { ApiResponse } from '../../system/auth.service'; // 請確認你的 ApiResponse 介面路徑是否正確

/** 查詢 POS2018 資料表 (queryTLS52030) 的請求介面 */
export interface IQueryTLS52040Request {
  ODM_No?: string; // 驗收編號
  LOGO_No?: string; // 品牌代碼
  HOS_No?: string; // 倉庫代碼
  PLU_MagNo?: string; // 商品管理編號
  VEN_No?: string; // 廠商代號
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
export interface ITLS52040Data {
  id: number;
  ODM_No: string; // 驗收編號
  SYS_StoreNo: string; // 公司編號/店號
  VEN_No: string; // 廠商代號
  LOGO_No: string; // 品牌代碼
  LOGO_CH_NAME: string; // LOGO中文名稱
  HOS_No: string; // 倉庫代碼
  HOS_NAME: string; // 倉庫名稱
  org_id: string; // 組織代碼/所屬部門
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
}

/** 更新 POS2018 資料狀態 (updateTLS52040_Status) 的請求介面 */
export interface IUpdateTLS52040StatusRequest {
  ODM_No: string; // 驗收編號
  ODM_Status: string; // 驗收狀態 (例如 "審核", "作廢", "反審核")
  ODM_Status_Ori: string; // 原始狀態
  Request_No?: string | null; // 請款單號 (如果相關)
}

@Injectable({
  providedIn: 'root',
})
export class Tls52040Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2018 (進貨單主檔) 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS52040Data 陣列的 API 響應
   */
  queryTLS52040(params: IQueryTLS52040Request): Observable<ApiResponse<ITLS52040Data[]>> {
    return this.http.post<ApiResponse<ITLS52040Data[]>>(`${this.apiUrl}/queryTLS52030`, params);
  }

  /**
   * 更新 POS2018 (進貨單主檔) 資料狀態 (審核、作廢、反審核)
   * @param data 包含要更新的進貨單 ID 及目標狀態
   * @returns API 響應
   */
  updateStatusTLS52040(data: IUpdateTLS52040StatusRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateStatusTLS52040`, data);
  }
}
