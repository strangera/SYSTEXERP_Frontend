import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
// 主檔 request
export interface TLS32060Request extends ApiRequest {
  "BaseDateFrom": Date, // 基準日期起
  "BaseDateTo": Date, // 基準日期訖
  "CompareDateFrom": Date, // 比較日期起
  "CompareDateTo": Date, // 比較日期訖
  "AmtTaxMode": string, // 銷售金額是否含稅：'G' = 含稅 (AVN_TotSaleAmt), 'N' = 未稅 (AVN_TotSaleNet). Default: 'G'
  "ReceFilter": string  // 是否開立業主發票：'A' = 全部 (default), 'Y' = 是, 'N' = 否

  "FloorList": string, //樓層（SYS3900） → TLTTALENT_LOCATION.tlt_floor (多選條件（逗號分隔，例如 "1,2,3"）。NULL 或空字串代表不篩選。)
  "AreaList": string, //區域（SYS3A00） → TLTTALENT_LOCATION.area_no (多選)
  "BusTypeList": string[], //大分類 → TLTTALENT.bus_type (多選)
  "BusClassList": { //中分類 → TLTTALENT.bus_class (多選)
    "BusType": string;
    "BusClass": string;
  }[],
  "TltKindList": string, // 櫃別（SYS1000 TLT_Kind） → TLTTALENT.tlt_kind (多選)
  "OrgList": string, // 組織 → TLTTALENT.org_id (多選)
  "TltNoList": string, // 專櫃編號 → TLTTALENT.tlt_no
  "TermTypeList": string, // 抽成別 → TLTTALENT.tlt_term_type
  "BuildingList": string, // 館別（SYS3800） → TLTTALENT_LOCATION.tlt_building
}

// 主檔 response
export interface TLS32060Response extends ApiRequest {
  "RowType": string, // 列別：'TEAM' / 'TeamSum' / 'BUILDING' / 'TOTAL'
  "BuildingName": string, // 館別
  "TeamId": string, // 單位代碼（TEAM / 館別 / 總計用)
  "TeamName": string, // 單位名稱（TEAM / 館別 / 總計顯示用）
  "OrgId": string, // 樓組代碼
  "OrgName": string, // 樓組名稱

  "Bus_Class": string, // 中分類代碼（TEAM 有值，小計/合計/總計為 NULL）
  "BusClassName": string, // 中分類(商品類別)名稱
  "BusSClass": string, // 小分類代碼（TEAM 有值，小計/合計/總計為 NULL）
  "BusSClassName": string, // 小分類(商品類別)名稱

  "TltNo": string, // 專櫃編號
  "TltName": string, // 專櫃名稱
  "TltKindName": string, // 櫃別名稱
  "LocationNo": string, // 位置編號

  "Space": number, // 營業坪數（坪）

  "Base_Target": number, // 本期銷售目標
  "Base_SaleAmt": number, // 本期銷售金額
  "Base_PreOrderAmt": number, // 本期預售實績
  "Base_AchieveRate": number, // 本期達成率（銷售金額 / 目標）
  "Base_TxnCnt": number, // 本期交易筆數
  "Base_CustCnt": number, // 本期來客數
  "Base_AvgTicket": number, // 本期客單價（銷售金額 / 來客數)

  "Comp_SaleAmt": number, // 上期銷售金額
  "Comp_TxnCnt": number, // 上期交易筆數
  "Comp_AvgTicket": number, // 上期客單價
  "Comp_PreOrderAmt": number, // 上期預售實績
  "Growth_SaleAmtPct": number, // 成長比(銷售金額成長率)
  "Diff_SaleAmt": number, // 銷售金額差異（本期 - 上期）
  "Diff_TxnCnt": number, // 交易筆數差異
  "Diff_AvgTicket": number, // 客單價差異

  "Base_DaySpaceEff": number, // 本期日平均坪效（每坪每日銷售）
  "PrePerformance": number, // 預售業績
  "ConsumerNum": number, // 消費人數
  "ConsumerOrder": number // 消費客單

}

@Injectable({
  providedIn: 'root'
})
export class TLS32060Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢各櫃業績 總表
  queryTLS32060(data: TLS32060Request): Observable<ApiResponse<TLS32060Response[]>> {
    return this.http.post<ApiResponse<TLS32060Response[]>>(`${this.apiUrl}/queryTLS32060`, data);
  }

  // 查詢中分類業績 明細表(本作業無須明細)

  // 匯出 各櫃業績 報表
  exportTLS32060(request: TLS32060Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS32060`, request, {
      responseType: 'blob'
    });
  }

  // 匯出 各櫃業績 報表
  exportTLS32060PDF(request: TLS32060Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS32060PDF`, request, {
      responseType: 'blob'
    });
  }
}