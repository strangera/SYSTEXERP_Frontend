import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { ApiResponse } from '../../system/auth.service'; // 請確認你的 ApiResponse 介面路徑是否正確

/** 查詢 POS2031 資料表 (queryTLS52050) 的請求介面 */
export interface IQueryTLS52050Request {
  RJM_No?: string; // 退貨驗收單號
  LOGO_NoList?: string[]; // 品牌代碼列表
  HOS_NoList?: string[]; // 倉庫代碼列表
  PLU_MagNo?: string; // 商品管理編號 (用於查詢明細)
  VEN_No?: string; // 廠商代號
  RJM_StatusList?: string[]; // 退貨驗收狀態列表
  APPLY_USR?: string; // 申請人員編號
  APPLY_Date_Start?: string; // 申請日期起 (YYYY-MM-DD 或 ISO 格式)
  APPLY_Date_End?: string; // 申請日期迄 (YYYY-MM-DD 或 ISO 格式)
  CRN_No?: string; // 退貨單號 (關聯查詢)
  APRV_USR?: string; // 審核人員編號
  APRV_Date_Start?: string; // 審核日期起 (YYYY-MM-DD 或 ISO 格式)
  APRV_Date_End?: string; // 審核日期迄 (YYYY-MM-DD 或 ISO 格式)
  showReturnPriceOrdersOnly?: boolean; // 僅顯示回價變價單
}

/** POS2031 資料表 (queryTLS52050) 的單筆響應資料介面 (退貨驗收主檔) *//**
 * POS2008M 商品促銷主檔介面
 * 對應資料庫 POS2008M 資料表結構
 */
export interface ITLS52050Data {
  id: number; // ID
  MID: number; // 商戶編號
  MAM_No: string; // 促銷編號(變價單號)=POS2004.MAM_No PR+YYYYMMDD+SSSS (欄位長度改16)
  SYS_StoreNo: string; // 公司編號/店號
  VEN_No: string | null; // 廠商編號 (放在主檔，因要依廠商編號、品牌及啟用日期分拆為變價單)
  LOGO_No: string | null; // 品牌代碼 (新增欄位)

  MAM_BegDate: string | null; // 生效起始日期 (ISO 格式字串)
  MAM_EndDate: string | null; // 生效結束日期 (ISO 格式字串)
  MAM_Status: string; // 變價狀態: 0 已申請 1已審核 2變價生效中 3變價結束 9作廢
  MAM_Method: string | null; // 促銷方式 1 永久變價 H 降價促銷 (促銷方式只剩兩種)
  MAM_TotAmt: number | null; // 組合價格/滿額金額
  MAM_MaxCondition: number | null; // 限購組數
  MAM_DiscType: string | null; // 優惠方式Y:優惠價/N:折扣%
  MAM_Source: number | null; // 優先等級 1.低 2.中 3.高 數字越高等級越高 (原本varchar 改 numeric)
  MAM_Remark: string | null; // 變價備註
  MAM_ActiveDate: string | null; // 變價啟動日期 (ISO 格式字串)
  MAM_FirstActiveDate: string | null; // 第一次變價啟動日期 (ISO 格式字串)
  MAM_RecoverDate: string | null; // 變價回復日期 (ISO 格式字串)
  MAM_PLU_MagNo: string | null; // 促銷條碼貨號(憑券使用)
  MAM_BegTime: string | null; // 促銷開始時段(hhnn)
  MAM_EndTime: string | null; // 促銷結束時段(hhnn)
  MAM_DateType: string | null; // 日期種類: 1=每日, 2=每週, 3=每月
  MAM_Week1: string | null; // 星期一(Y/N)
  MAM_Week2: string | null; // 星期二(Y/N)
  MAM_Week3: string | null; // 星期三(Y/N)
  MAM_Week4: string | null; // 星期四(Y/N)
  MAM_Week5: string | null; // 星期五(Y/N)
  MAM_Week6: string | null; // 星期六(Y/N)
  MAM_Week7: string | null; // 星期日(Y/N)
  MAM_Day: number | null; // 每月幾號: 0=最後一天 (欄位改2 原本欄位大小8)
  MAM_Type: string | null; // 價格種類:1售價促銷,2進價促銷,3售價及進價促銷
  MAM_InvDesc: string | null; // POS顯示的促銷說明

  APPLY_Date: string | null; // 申請日期 (ISO 格式字串)
  APPLY_USR_No: string | null; // 申請人員
  APPLY_USR_Name: string | null; // 申請人員姓名
  APRV_Date: string | null; // 審核日期 (ISO 格式字串)
  APRV_USR_No: string | null; // 審核人員
  APRV_USR_Name: string | null; // 審核人員姓名
  ReAPRV_Date: string | null; // 反審核日期 (ISO 格式字串)
  ReAPRV_USR_No: string | null; // 反審核人員
  ReAPRV_USR_Name: string | null; // 反審核人員姓名
  Void_Date: string | null; // 作廢日期 (ISO 格式字串)
  Void_USR_No: string | null; // 作廢人員
  Void_USR_Name: string | null; // 作廢人員姓名
  CRT_Date: string | null; // 建立日期 (ISO 格式字串)
  CRT_USR_No: string | null; // 建立人員
  CRT_USR_Name: string | null; // 建立人員姓名
  UPD_Date: string | null; // 變更日期 (ISO 格式字串)
  UPD_USR_No: string | null; // 變更人員
  UPD_USR_Name: string | null; // 變更人員姓名
}

export interface POS2008Data {
  id?: number; // ID - 隱藏
  MID: string; // 商戶編號 - 隱藏
  MAM_No: string; // 促銷編號(變價單號) - 隱藏
  SYS_StoreNo: string; // 公司編號/店號 - 隱藏
  PLU_MagNo: string; // 商品管理編號
  PLU_Name: string; // 商品名稱
  CAT_LNo: string; // 大類代號
  CAT_MNo: string; // 中類代號
  CAT_SNo: string; // 小類代號
  PLU_OrderPrcRate: number; // 進價折數
  PLU_OrderPrc: number; // 調整前進價
  MAM_OrderPrc: number; // 調整後進價
  PLU_SalePrc: number; // 調整前售價
  MAM_UnitPrc: number; // 調整後售價
  MAD_Remark: string; // 單項說明
}

@Injectable({
  providedIn: 'root',
})
export class Tls52050Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2008M (商品促銷主檔) 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS52050Data 陣列的 API 響應
   */
  queryTLS52050(params: IQueryTLS52050Request): Observable<ApiResponse<ITLS52050Data[]>> {
    return this.http.post<ApiResponse<ITLS52050Data[]>>(`${this.apiUrl}/queryTLS52050`, params);
  }

  insertTLS52050(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertTLS52050`, data);
  }

  updateTLS52050(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateTLS52050`, data);
  }
}
