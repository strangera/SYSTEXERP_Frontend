import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// 查詢 request
export interface TLS32070Request extends ApiRequest {
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
  TltIdList: string; // 抽成類別 → TLTTALENT_CHARGEM.tlt_id (多选)
}

// 查詢 response
export interface TLS32070Response extends ApiRequest {
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

  // 本期 (Base)
  Base_LocationNo: string; // 本期位置編號
  Base_Space: number; // 本期坪數
  Base_SaleAmt: number; // 本期銷售金額
  Base_TxnCnt: number; // 本期交易筆數
  Base_AvgTicket: number; // 本期客單價

  // 比較期 (Comp)
  Comp_LocationNo: string; // 比較期位置編號
  Comp_Space: number; // 比較期坪數
  Comp_SaleAmt: number; // 比較期銷售金額
  Comp_TxnCnt: number; // 比較期交易筆數
  Comp_AvgTicket: number; // 比較期客單價

  // 成長率 (Growth %)
  Growth_SaleAmtPct: number; // 銷售金額成長率
  Growth_TxnCntPct: number; // 交易筆數成長率
  Growth_AvgTicketPct: number; // 客單價成長率

  // 差異 (Diff)
  Diff_SaleAmt: number; // 銷售金額差異
  Diff_TxnCnt: number; // 交易筆數差異
  Diff_AvgTicket: number; // 客單價差異
}

@Injectable({
  providedIn: 'root',
})
export class TLS32070Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢抽成類別分析報表
  queryTLS32070(data: TLS32070Request): Observable<ApiResponse<TLS32070Response[]>> {
    return this.http.post<ApiResponse<TLS32070Response[]>>(`${this.apiUrl}/queryTLS32070`, data);
  }

  // 匯出抽成類別分析報表 PDF
  exportTLS32070PDF(data: TLS32070Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS32070PDF`, data, { responseType: 'blob' });
  }

  // 匯出抽成類別分析報表 Excel
  exportTLS32070Excel(data: TLS32070Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS32070Excel`, data, { responseType: 'blob' });
  }
}