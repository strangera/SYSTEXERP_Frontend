import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
// 主檔 request
export interface TLS32050Request extends ApiRequest {
  "BaseDateFrom": Date, // 基準日期起
  "BaseDateTo": Date, // 基準日期訖
  "CompareDateFrom": Date, // 比較日期起
  "CompareDateTo": Date, // 比較日期訖
  "AmtTaxMode": string, // 銷售金額是否含稅：'G' = 含稅 (AVN_TotSaleAmt), 'N' = 未稅 (AVN_TotSaleNet). Default: 'G'
  "ReceFilter": string  // 是否開立業主發票：'A' = 全部 (default), 'Y' = 是, 'N' = 否

  "FloorList": string, //樓層（SYS3900） → TLTTALENT_LOCATION.tlt_floor (多選條件（逗號分隔，例如 "1,2,3"）。NULL 或空字串代表不篩選。)
  "AreaList": string, //區域（SYS3A00） → TLTTALENT_LOCATION.area_no (多選)
  "BusTypeList": string[], //大分類 → TLTTALENT.bus_type (多選)
  "BusClassList": string[], //中分類 → TLTTALENT.bus_class (多選)
  "BusSClassList": string[], //小分類 → TLTTALENT.bus_sclass (多選)

  "TltKindList": string, // 櫃別（SYS1000 TLT_Kind） → TLTTALENT.tlt_kind (多選)
  "OrgList": string, // 組織 → TLTTALENT.org_id (多選)
  "TltNoList": string, // 專櫃編號 → TLTTALENT.tlt_no
  "TermTypeList": string, // 抽成別 → TLTTALENT.tlt_term_type
  "BuildingList": string, // 館別（SYS3800） → TLTTALENT_LOCATION.tlt_building
  "ReportType"?: string, // 報表類型：1=日 2=週 3=月 4=半年 5=年 6=區間（月坪效欄位僅 3/4/5 顯示）
}

// 主檔 response
export interface TLS32050Response extends ApiRequest {
  "RowType": string, // 列別：'TEAM' / 'TeamSum' / 'BUILDING' / 'TOTAL'
  "BuildingName": string | null, // 館別
  "TeamId": string | null, // 單位代碼（TEAM / 館別 / 總計用)
  "TeamName": string, // 單位名稱（TEAM / 館別 / 總計顯示用）
  "OrgId": string | null, // 樓組代碼
  "OrgName": string | null, // 樓組名稱

  "TltKindName": string | null, // 櫃別名稱
  "Bus_Type": string | null, // 大分類代碼
  "BusClassName": string | null, // 中分類(商品類別)名稱
  "Bus_Class": string | null, // 中分類代碼（TEAM 有值，小計/合計/總計為 NULL）

  "Base_Target": number, // 本期銷售目標
  "Base_SaleAmt": number, // 本期銷售金額
  "Base_AchieveRate": number, // 本期達成率（銷售金額 / 目標）
  "Base_TxnCnt": number, // 本期交易筆數
  "Base_AvgTicket": number, // 本期客單價（銷售金額 / 來客數)

  "Comp_SaleAmt": number, // 上期銷售金額
  "Comp_TxnCnt": number, // 上期交易筆數
  "Comp_AvgTicket": number, // 上期客單價
  "Growth_SaleAmtPct": number, // 成長比(銷售金額成長率)
  "Diff_SaleAmt": number, // 銷售金額差異（本期 - 上期）
  "Diff_TxnCnt": number, // 交易筆數差異
  "Diff_AvgTicket": number, // 客單價差異
  "Space": number, // 營業坪數（坪）
  "Base_MonthSpaceEff": number | string, // 本期月坪效
  "Comp_MonthSpaceEff": number | string, // 上期月坪效
  "Diff_MonthSpaceEff": number | string, // 月坪效差異（本期 - 上期）
  "Base_MonthSpaceContrib": number | string, // 本期月坪貢獻
  "Comp_MonthSpaceContrib": number | string, // 上期月坪貢獻
  "Diff_MonthSpaceContrib": number | string, // 月坪貢獻差異（本期 - 上期）
  "AVN_PreOrderAmt": number; // 預售金額
  "PrePerformance": number; // 預售業績
  "ConsumerNum": number; // 消費人數
  "ConsumerOrder": number; // 消費客單
}

// 明細 request
export interface TLS32050DetailRequest extends ApiRequest {
  "BaseDateFrom": string, // 基準日期起
  "BaseDateTo": string, // 基準日期訖
  "CompareDateFrom": string, // 比較日期起
  "CompareDateTo": string, // 比較日期訖
  "OrgId": string, // 組織 →
  "BusClass": string, // 中分類 →
  "TltKind": string, //櫃別 →
  "AmtTaxMode": string, // 銷售金額是否含稅：'G' = 含稅 (AVN_TotSaleAmt), 'N' = 未稅 (AVN_TotSaleNet). Default: 'G'
  "ReceFilter": string  // 是否開立業主發票：'A' = 全部 (default), 'Y' = 是, 'N' = 否
  "FloorList": string, //樓層（SYS3900） → TLTTALENT_LOCATION.tlt_floor (多選條件（逗號分隔，例如 "1,2,3"）。NULL 或空字串代表不篩選。)
  "AreaList": string, //區域（SYS3A00） → TLTTALENT_LOCATION.area_no (多選)
  "BusTypeList": string[], //大分類 → TLTTALENT.bus_type (多選)
  "BusClassList": string[], //中分類 → TLTTALENT.bus_class (多選)
  "BusSClassList": string[], //小分類 → TLTTALENT.bus_sclass (多選)
  "TltKindList": string, // 櫃別（SYS1000 TLT_Kind） → TLTTALENT.tlt_kind (多選)
  "TltNoList": string, // 專櫃編號 → TLTTALENT.tlt_no
  "TermTypeList": string, // 抽成別 → TLTTALENT.tlt_term_type
  "BuildingList": string, // 館別（SYS3800） → TLTTALENT_LOCATION.tlt_building
}

// 明細 response
export interface TLS32050DetailResponse extends ApiRequest {
  "tlt_no": string, // 專櫃代號
  "tlt_name": string, // 專櫃名稱
  "floor_desc": string, // 大分類名稱
  "TimeType": string, // 時段類型（營業實績 / 交易筆數 / 營業實績佔比

  "H08": number, // 08時段
  "H09": number, // 09 時段
  "H10": number, // 10 時段
  "H11": number, // 11 時段
  "H12": number, // 12 時段
  "H13": number, // 13 時段
  "H14": number, // 14 時段
  "H15": number, // 15 時段
  "H16": number, // 16 時段
  "H17": number, // 17 時段
  "H18": number, // 18 時段
  "H19": number, // 19 時段
  "H20": number, // 20 時段
  "H21": number, // 21 時段
  "H22": number, // 22 時段
  "H23": number, // 23 時段

  "ReentryAmt": number, // 補登
  "PresaleCheckoutAmt": number, // 預售結帳
  "SubTotal": number, // 小計
}

@Injectable({
  providedIn: 'root'
})
export class TLS32050Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢中分類業績 總表
  queryTLS32050(data: TLS32050Request): Observable<ApiResponse<TLS32050Response[]>> {
    return this.http.post<ApiResponse<TLS32050Response[]>>(`${this.apiUrl}/queryTLS32050`, data);
  }

  // 查詢中分類業績 明細表
  queryTLS32050Detail(data: TLS32050DetailRequest): Observable<ApiResponse<TLS32050DetailResponse[]>> {
    return this.http.post<ApiResponse<TLS32050DetailResponse[]>>(`${this.apiUrl}/queryTLS32050Detail`, data);
  }

  // 匯出 中分類業績 報表
  exportTLS32050(request: TLS32050Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS32050`, request, {
      responseType: 'blob'
    });
  }

  // 匯出 中分類業績 報表
  exportTLS32050PDF(request: TLS32050Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS32050PDF`, request, {
      responseType: 'blob'
    });
  }
}
