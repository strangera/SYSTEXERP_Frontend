import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
// 主檔 request
export interface TLS32040Request extends ApiRequest {
  "ReportType": string, // 日=DAY 周=WEEK 月=MONTH 半年=HALFYEAR 年=YEAR
  "BaseDateFrom": Date, // 基準日期起
  "BaseDateTo": Date, // 基準日期訖
  "CompareDateFrom": Date, // 比較日期起
  "CompareDateTo": Date, // 比較日期訖
  "FloorList": string, //樓層（SYS3900） → TLTTALENT_LOCATION.tlt_floor (多選條件（逗號分隔，例如 "1,2,3"）。NULL 或空字串代表不篩選。)
  "AreaList": string, //區域（SYS3A00） → TLTTALENT_LOCATION.area_no (多選)
  "BusTypeList": string[], //大分類 → TLTTALENT.bus_type (多選)
  "BusClassList": { //中分類 → TLTTALENT.bus_class (多選)
    "BusType": string;
    "BusClass": string;
  }[],
  "BusSClassList": {
    "BusType": string;
    "BusClass": string;
    "BusSClass": string;
  }[],
  "TltKindList": string, // 櫃別（SYS1000 TLT_Kind） → TLTTALENT.tlt_kind (多選)
  "OrgList": string, // 組織 → TLTTALENT.org_id (多選)
  "TltNoList": string, // 專櫃編號 → TLTTALENT.tlt_no
  "TermTypeList": string, // 抽成別 → TLTTALENT.tlt_term_type
  "BuildingList": string, // 館別（SYS3800） → TLTTALENT_LOCATION.tlt_building
  "AmtTaxMode": string, // 銷售金額是否含稅：'G' = 含稅 (AVN_TotSaleAmt), 'N' = 未稅 (AVN_TotSaleNet). Default: 'G'
  "ReceFilter": string  // 是否開立業主發票：'A' = 全部 (default), 'Y' = 是, 'N' = 否
}

// 主檔 response
export interface TLS32040Response extends ApiRequest {
  "RowType": string, // 列別：'TEAM' / 'TeamSum' / 'BUILDING' / 'TOTAL'
  "TeamId": string, // 單位代碼（TEAM / 館別 / 總計用)
  "TeamName": string, // 單位名稱（TEAM / 館別 / 總計顯示用）
  "OrgId": string, // 樓組代碼
  "OrgName": string, // 樓組名稱
  "Base_Target": number, // 本期銷售目標
  "Base_SaleAmt": number, // 本期銷售金額
  "Base_PreOrderAmt": number, // 本期預售實績
  "Base_AchieveRate": number, // 本期達成率（銷售金額 / 目標）
  "Base_TxnCnt": number, // 本期交易筆數
  "Base_AvgTicket": number, // 本期客單價（銷售金額 / 來客數)
  "Comp_SaleAmt": number, // 上期銷售金額
  "Comp_PreOrderAmt": number, // 上期預售實績
  "Comp_TxnCnt": number, // 上期交易筆數
  "Comp_AvgTicket": number, // 上期客單價
  "Growth_SaleAmtPct": number, // 成長比(銷售金額成長率)
  "Diff_SaleAmt": number, // 銷售金額差異（本期 - 上期）
  "Diff_PreOrderAmt": number, // 預售差異（本期 - 上期）
  "Diff_TxnCnt": number, // 交易筆數差異
  "Diff_AvgTicket": number, // 客單價差異
  "Space": number, // 營業坪數（坪）
  "Base_MonthSpaceEff": number, // 本期月坪效
  "Comp_MonthSpaceEff": number, // 上期月坪效
  "Diff_MonthSpaceEff": number, // 月坪效差異（本期 - 上期）
  "Base_MonthSpaceContrib": number, // 本期月坪貢獻
  "Comp_MonthSpaceContrib": number, // 上期月坪貢獻
  "Diff_MonthSpaceContrib": number, // 月坪貢獻差異（本期 - 上期）
  "PrePerformance": number; // 預售業績
  "ConsumerNum": number; // 消費人數
  "ConsumerOrder": number; // 消費客單
}

// 明細 request
export interface TLS32040DetailRequest extends ApiRequest {
  "OrgId": string, // 點擊的樓組 OrgId

  "BaseDateFrom": string, // 基準日期起
  "BaseDateTo": string, // 基準日期訖
  "CompareDateFrom": string, // 比較日期起
  "CompareDateTo": string, // 比較日期訖

  "FloorList": string, //樓層（SYS3900） → TLTTALENT_LOCATION.tlt_floor (多選條件（逗號分隔，例如 "1,2,3"）。NULL 或空字串代表不篩選。)
  "AreaList": string, //區域（SYS3A00） → TLTTALENT_LOCATION.area_no (多選)
  "BusTypeList": string[], //大分類 → TLTTALENT.bus_type (多選)
  "BusClassList": { //中分類 → TLTTALENT.bus_class (多選)
    "BusType": string;
    "BusClass": string;
  }[],
  "BusSClassList": {
    "BusType": string;
    "BusClass": string;
    "BusSClass": string;
  }[],
  "TltKindList": string, // 櫃別（SYS1000 TLT_Kind） → TLTTALENT.tlt_kind (多選)
  "OrgList": string, // 組織 → TLTTALENT.org_id (多選)
  "TltNoList": string, // 專櫃編號 → TLTTALENT.tlt_no
  "TermTypeList": string, // 抽成別 → TLTTALENT.tlt_term_type
  "BuildingList": string, // 館別（SYS3800） → TLTTALENT_LOCATION.tlt_building
  "AmtTaxMode": string, // 銷售金額是否含稅：'G' = 含稅 (AVN_TotSaleAmt), 'N' = 未稅 (AVN_TotSaleNet). Default: 'G'
  "ReceFilter": string  // 是否開立業主發票：'A' = 全部 (default), 'Y' = 是, 'N' = 否
}

// 明細 response
export interface TLS32040DetailResponse extends ApiRequest {
  "RowType": string, // 列別：'TEAM' / 'TeamSum' / 'BUILDING' / 'TOTAL'
  "TeamId": string, // 單位代碼（TEAM / 館別 / 總計用)
  "TeamName": string, // 單位名稱（TEAM / 館別 / 總計顯示用）
  "OrgId": string, // 樓組代碼
  "OrgName": string, // 樓組名稱
  "Space": number, // 營業坪數（坪）

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

  "Base_DaySpaceEff": number, // 本期日平均坪效（每坪每日銷售）
  "BaseCustCnt": number, // 本期顧客數（用于計算客單價）
  "CompCustCnt": number, // 上期顧客數（用于計算客單價）
  "TotalSpace": number, // 總坪數（用于計算坪效）
  "BaseDays": number, //基準天數（用于計算坪效）
}

// 折線圖 request
export interface TLS32040ChartRequest extends ApiRequest {
  "Year": number, // 年度 (例如 2025) 必填

  "FloorList": string, //樓層（SYS3900） → TLTTALENT_LOCATION.tlt_floor (多選條件（逗號分隔，例如 "1,2,3"）。NULL 或空字串代表不篩選。)
  "AreaList": string, //區域（SYS3A00） → TLTTALENT_LOCATION.area_no (多選)
  "BusTypeList": string, //大分類 → TLTTALENT.bus_type (多選)
  "BusClassList": string, //中分類 → TLTTALENT.bus_class (多選)
  "TltKindList": string, // 櫃別（SYS1000 TLT_Kind） → TLTTALENT.tlt_kind (多選)
  "OrgList": string, // 組織 → TLTTALENT.org_id (多選)
  "TltNoList": string, // 專櫃編號 → TLTTALENT.tlt_no
  "TermTypeList": string, // 抽成別 → TLTTALENT.tlt_term_type
  "BuildingList": string, // 館別（SYS3800） → TLTTALENT_LOCATION.tlt_building
  "AmtTaxMode": string, // 銷售金額是否含稅：'G' = 含稅 (AVN_TotSaleAmt), 'N' = 未稅 (AVN_TotSaleNet). Default: 'G'
  "ReceFilter": string  // 是否開立業主發票：'A' = 全部 (default), 'Y' = 是, 'N' = 否
}

// 折線圖 response
export interface TLS32040ChartResponse extends ApiRequest {
  "Building": string, // 館別代碼
  "BuildingName": string, // 館別名稱
  "TeamId": string, // 單位代碼（TEAM / 館別 / 總計用)
  "TeamName": string, // 單位名稱（TEAM / 館別 / 總計顯示用）
  "OrgId": string, // 樓組代碼
  "OrgName": string, // 樓組名稱
  "SaleYear": number, // 年度
  "SaleMonth": number, // 月份
  "YearMonth": string, // YYYY-MM
  "SaleAmt": number// 營業額
}


@Injectable({
  providedIn: 'root'
})
export class TLS32040Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢組織預售業績 總表資料
  queryTLS32040(data: TLS32040Request): Observable<ApiResponse<TLS32040Response[]>> {
    return this.http.post<ApiResponse<TLS32040Response[]>>(`${this.apiUrl}/queryTLS32040`, data);
  }

  // 查詢組織預售業績 明細資料
  queryTLS32040Detail(data: TLS32040DetailRequest): Observable<ApiResponse<TLS32040DetailResponse[]>> {
    return this.http.post<ApiResponse<TLS32040DetailResponse[]>>(`${this.apiUrl}/queryTLS32040Detail`, data);
  }

  // 查詢組織預售業績 總表折線圖
  queryTLS32040Chart(data: TLS32040ChartRequest): Observable<ApiResponse<TLS32040ChartResponse[]>> {
    return this.http.post<ApiResponse<TLS32040ChartResponse[]>>(`${this.apiUrl}/queryTLS32040Chart`, data);
  }

  // 查詢組織預售業績 總表PDF
  exportTLS32040PDF(request: TLS32040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS32040PDF`, request, {
      responseType: 'blob'
    });
  }

  // 查詢組織預售業績 總表Excel
  exportTLS32040Excel(request: TLS32040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS32040Excel`, request, {
      responseType: 'blob'
    });
  }
}