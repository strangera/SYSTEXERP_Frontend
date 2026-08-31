import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// 查詢 request
export interface TLS32080Request extends ApiRequest {
  ReportType: string; // 日=DAY 週=WEEK 月=MONTH 半年=HALFYEAR 年=YEAR 自訂區間=SAD
  BaseDateFrom: string; // 基準日期起
  BaseDateTo: string; // 基準日期訖
  CompareDateFrom: string; // 比較日期起
  CompareDateTo: string; // 比較日期訖
  BuildingList: string; // 館別（SYS3800） → TLTTALENT_LOCATION.tlt_building (多選)
  FloorList: string; // 樓層（SYS3900） → TLTTALENT_LOCATION.tlt_floor (多選)
  AreaList: string; // 區域（SYS3A00） → TLTTALENT_LOCATION.area_no (多選)
  BusTypeList: string[]; // 大分類 → TLTTALENT.bus_type (多選，僅在 BusClassList 未提供時生效)
  BusClassList: {
    BusType: string;
    BusClass: string;
  }[]; // 中分類
  BusSClassList: {
    BusType: string;
    BusClass: string;
    BusSClass: string;
  }[]; // 小分類
  TltKindList: string; // 櫃別（SYS1000 TLT_Kind） → TLTTALENT.tlt_kind (多選)
  OrgList: string; // 組織 → TLTTALENT.org_id (多選)
  TltNoList: string; // 專櫃編號 → TLTTALENT.tlt_no (多選)
  TermTypeList: string; // 抽成別 → TLTTALENT.tlt_term_type (多選)
  TltIdList: string; // 抽成類別 → TLTTALENT_CHARGEM.tlt_id (多選)
  DiscCodeList: string; // 折扣別 → SALCHARGE.sad_barcode（SYS1000 SYS_Type='T102'） (多選)
  AmtTaxMode: string; // 銷售金額是否含稅：G=含稅(預設), N=未稅
  ReceFilter: string; // 是否開立業主發票：A=全部(預設), Y=是, N=否
  PreSale: boolean; // 是否顯示預售欄位（純前端顯示控制）
  ConsumerNum: boolean; // 是否顯示消費人數/消費客單欄位（純前端顯示控制）
}

// 查詢 response
export interface TLS32080Response extends ApiRequest {
  RowType: string; // 列別：'DETAIL' / 'TOTAL'
  Building: string; // 館別代碼
  BuildingName: string; // 館別名稱
  OrgId: string; // 組織代碼
  OrgName: string; // 組織名稱
  TltKind: string; // 櫃別代碼（SYS1000 TLT_Kind）
  TltNo: string; // 專櫃編號
  TltName: string; // 櫃位名稱
  TltId: string; // 抽成類別代號
  TltIdDesc: string; // 抽成類別名稱
  DiscCode: string; // 折扣別代碼（SALCHARGE.sad_barcode）
  DiscDesc: string; // 折扣別名稱（SYS1000 SYS_Type='T102'）

  // 本期 (Base)
  Base_LocationNo: string; // 本期位置編號
  Base_Space: number; // 本期坪數
  Base_SaleAmt: number; // 本期銷售金額
  Base_TxnCnt: number; // 本期交易筆數
  Base_AvgTicket: number; // 本期客單價
  Base_PreOrderAmt: number; // 本期預售金額
  Base_ConsumerNum: number; // 本期消費人數
  Base_ConsumerOrder: number; // 本期消費客單
  Base_ChargeRate: number; // 本期抽成率

  // 比較期 (Comp)
  Comp_LocationNo: string; // 比較期位置編號
  Comp_Space: number; // 比較期坪數
  Comp_SaleAmt: number; // 比較期銷售金額
  Comp_TxnCnt: number; // 比較期交易筆數
  Comp_AvgTicket: number; // 比較期客單價
  Comp_PreOrderAmt: number; // 比較期預售金額
  Comp_ConsumerNum: number; // 比較期消費人數
  Comp_ConsumerOrder: number; // 比較期消費客單
  Comp_ChargeRate: number; // 比較期抽成率

  // 成長率 (Growth %)
  Growth_SaleAmtPct: number; // 銷售金額成長率
  Growth_TxnCntPct: number; // 交易筆數成長率
  Growth_AvgTicketPct: number; // 客單價成長率
  Growth_ChargeRatePct: number; // 抽成率成長率

  // 差異 (Diff)
  Diff_SaleAmt: number; // 銷售金額差異
  Diff_TxnCnt: number; // 交易筆數差異
  Diff_AvgTicket: number; // 客單價差異
  Diff_PreOrderAmt: number; // 預售金額差異
  Diff_ConsumerNum: number; // 消費人數差異
  Diff_ConsumerOrder: number; // 消費客單差異
  Diff_ChargeRate: number; // 抽成率差異
}

@Injectable({
  providedIn: 'root',
})
export class TLS32080Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢抽成類別折扣分析報表
  queryTLS32080(data: TLS32080Request): Observable<ApiResponse<TLS32080Response[]>> {
    return this.http.post<ApiResponse<TLS32080Response[]>>(`${this.apiUrl}/queryTLS32080`, data);
  }

  // 匯出抽成類別折扣分析報表 PDF
  exportTLS32080PDF(data: TLS32080Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS32080PDF`, data, { responseType: 'blob' });
  }

  // 匯出抽成類別折扣分析報表 Excel
  exportTLS32080Excel(data: TLS32080Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS32080Excel`, data, { responseType: 'blob' });
  }
}
