import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './tls25030.service';

export interface TLS32030QueryRequest {
  PageSize: number;
  PageIndex: number;
  OrderBy: string;
  Offset: number;
  SortBy: { field: string; order: number }[];

  BaseDateFrom: string | null;
  BaseDateTo: string | null;
  CompareDateFrom: string | null;
  CompareDateTo: string | null;

  AmtTaxMode: string | null;
  ReceFilter: string | null;

  FloorList: (string | number)[];
  AreaList: (string | number)[];
  BusTypeList: (string | number)[];
  BusClassList: (string | number)[];
  /** 小分類：後端 TLS32030Request/Repository/SP 目前尚未支援此欄位，前端已送出但暫不生效，待後端補上對應參數 */
  BusSClassList: (string | number)[];
  TltKindList: (string | number)[];
  OrgList: (string | number)[];
  TltNoList: (string | number)[];
  TermTypeList: (string | number)[];
  BuildingList: (string | number)[];
}

export interface TLS32030Data {
  id: number;
  building: string;
  organization: string;
  counterType: string;
  counterNumber: string;
  counterName: string;

  compare_salesAmount: number;
  compare_salesCount: number;
  compare_customerCount: number;
  compare_unitPrice: number;
  compare_conversionRate: number;
  compare_averageSpend: number;
  compare_position: number;

  baseline_salesAmount: number;
  baseline_salesCount: number;
  baseline_customerCount: number;
  baseline_unitPrice: number;
  baseline_conversionRate: number;
  baseline_averageSpend: number;
  baseline_position: number;

  growth_salesAmount: number;
  growth_salesCount: number;
  growth_customerCount: number;
  growth_unitPrice: number;
  growth_conversionRate: number;
  growth_averageSpend: number;
  growth_position: number;

  diff_salesAmount: number;
  diff_salesCount: number;
  diff_customerCount: number;
  diff_unitPrice: number;
  diff_conversionRate: number;
  diff_averageSpend: number;
  diff_position: number;

  PrePerformance?: number; // 預售業績
  ConsumerNum?: number; // 消費人數
  ConsumerOrder?: number; // 消費客單
}

export interface TLS32030FooterData {
  TltNo: string,
  TltName: string,
  Org_Name: string,
  building_desc: string,
  SYS_Name: string,
  Base_LocationNo: string,
  Base_Space: number,
  Base_SaleAmt: number,
  Base_PreOrderAmt: number,
  Base_TxnCnt: number,
  Base_Target: number,
  Base_DaySpaceEff: number,
  Base_AchieveRate: number,
  Base_AvgTicket: number,
  Comp_LocationNo: string,
  Comp_Space: number,
  Comp_SaleAmt: number,
  Comp_PreOrderAmt: number,
  Comp_TxnCnt: number,
  Comp_Target: number,
  Comp_DaySpaceEff: number,
  Comp_AchieveRate: number,
  Comp_AvgTicket: number,
  Diff_SaleAmt: number,
  Diff_PreOrderAmt: number,
  Diff_TxnCnt: number,
  Diff_Target: number,
  Diff_DaySpaceEff: number,
  Diff_AchieveRate: number,
  Diff_AvgTicket: number,
  Growth_SaleAmtPct: number,
  Growth_PreOrderAmtPct: number,
  Growth_TxnCntPct: number,
  Growth_TargetPct: number,
  Growth_DaySpaceEffPct: number,
  Growth_AchieveRatePct: number,
  Growth_AvgTicketPct: number,

  TotalPrePerformance: number; // 預售業績總計
  TotalConsumerNum: number; // 消費人數總計
  TotalConsumerOrder: number; // 消費客單總計
}


@Injectable({ providedIn: 'root' })
export class TLS32030Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  queryTLS32030(request: TLS32030QueryRequest): Observable<ApiResponse<TLS32030Data[], TLS32030FooterData>> {
    return this.http.post<ApiResponse<TLS32030Data[], TLS32030FooterData>>(
      `${this.apiUrl}/queryTLS32030`,
      request
    );
  }
  ExportTLS32030PDF(request: TLS32030QueryRequest): Observable<import('@angular/common/http').HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportTLS32030PDF`,
      request,
      { observe: 'response', responseType: 'blob' }
    );
  }
  ExportTLS32030Excel(request: TLS32030QueryRequest): Observable<import('@angular/common/http').HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportTLS32030Excel`,
      request,
      { observe: 'response', responseType: 'blob' }
    );
  }
}
