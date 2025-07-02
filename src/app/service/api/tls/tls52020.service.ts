import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { ApiResponse } from '../../system/auth.service'; // 請確認你的 ApiResponse 介面路徑是否正確
/** 查詢 POS2016 資料表 (queryTLS52020) 的請求介面 */
export interface IQueryTLS52020Request {
  CRN_No?: string; // 採購單號
  HOS_No?: string; // 醫院代號
  LOGO_No?: string; // LOGO代碼
  VEN_No?: string; // 廠商代號
  CRN_Status?: string; // 採購單狀態
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

/** POS2016 資料表 (queryTLS52020) 的單筆響應資料介面 */
export interface ITLS52020Data {
  id: number;
  CRN_No: string; // 採購單號
  SYS_StoreNo: string; // 門店編號 (系統)
  VEN_No: string; // 廠商代號
  LOGO_No: string; // LOGO代碼
  HOS_No: string; // 醫院代號
  HOS_NAME: string; // 醫院名稱
  org_id: string; // 組織代碼
  CRN_Status: string; // 採購單狀態
  CRN_TotalSubQty: number; // 退貨數量合計
  CRN_TotalBuyNet: number; // 未稅進價小計
  CRN_TotalBuyTax: number; // 進價稅額小計
  CRN_TotalBuyAmt: number; // 進價合計
  CRN_TotalSaleAmt: number; // 售價合計
  CRN_Remark: string | null; // 採購單備註
  APPLY_Date: string; // 申請日期 (ISO 格式字串)
  APPLY_USR_No: string; // 申請人員編號
  APPLY_USR_Name: string; // 申請人員姓名
  APRV_Date: string | null; // 核准日期 (ISO 格式字串)
  APRV_USR_No: string | null; // 核准人員編號
  APRV_USR_Name: string | null; // 核准人員姓名
  ReAPRV_Date: string | null;    //反審核日期
  ReAPRV_USR_No: string | null;   //反審核人員編號
  ReAPRV_USR_Name: string | null;//反審核人員姓名
  VOID_Date: string | null; // 作廢日期 (ISO 格式字串)
  VOID_USR_No: string | null; // 作廢人員編號
  VOID_USR_Name: string | null; // 作廢人員姓名
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

/** 更新 POS2016 資料狀態 (SetCloseTLS52020) 的請求介面 */
export interface ISetCloseTLS52020Request {
  idList: number[]; // 要設定狀態的採購單 ID 列表
  PO_Status: string; // 要設定的狀態 (例如 "結案", "作廢" 等)
}
@Injectable({
  providedIn: 'root',
})
export class Tls52020Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2016 (採購單主檔) 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS52020Data 陣列的 API 響應
   */
  queryTLS52020(params: IQueryTLS52020Request): Observable<ApiResponse<ITLS52020Data[]>> {
    return this.http.post<ApiResponse<ITLS52020Data[]>>(`${this.apiUrl}/queryTLS52020`, params);
  }
  /**
   * 根據狀態更新 POS2016 (採購單主檔) 資料 (結案或作廢)
   * @param data 包含要更新的採購單 ID 列表及目標狀態
   * @returns API 響應
   *///!!!未完成
  SetCloseTLS52020(data: ISetCloseTLS52020Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/SetCloseTLS52020`, data);
  }
}
