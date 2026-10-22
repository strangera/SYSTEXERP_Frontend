import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
// 1. 修正查詢參數 Interface，使其與後端 DTO 結構一致
export interface TLS32010QueryRequest extends ApiRequest {
  // 日期條件
  DateFrom: string | null;  // 統一使用 DateFrom
  DateTo: string | null;    // 統一使用 DateTo
  reportType?: string;      // 報表類型
  eventID?: string | null;  // 活動ID

  // 合約查詢條件：改為字串陣列以匹配前端 multi-select 與後端 List<string>
  BuildingList?: string[] | null;
  FloorList?: string[] | null;
  AreaList?: string[] | null;
  BusTypeList?: string[] | null;
  BusClassList?: string[] | null;
  BusSClassList?: string[] | null;
  CabinetKindList?: string[] | null;
  TermTypeList?: string[] | null;
  OrgList?: string[] | null;
  TltNoList?: string[] | null;

  TaxFlag?: string; // 配合後端改為 TaxFlag (1 或 2)
  PreSale?: boolean;
  ConsumerNum?: boolean;
}

// 查詢結果 Model (保持不變)
export interface TLS32010Data {
  RowNo: number | null; // 改大寫
  BuildingDesc: string; // 改大寫
  OrgName: string;
  CabinetKindName: string;
  TltNo: string;
  TltName: string;
  LocationNoList: string;
  TltSpace: number;
  Budget: number;
  SaleAmt: number;
  CustCnt: number;
  AvgTicketAmt: number;
  MonthlySpaceEfficiency: number;
  MonthlySpaceContrib: number;
  IsPartialPeriod?: number | null;
  AchievementRate: number;
  TltSpaceRank: number | null;
  BudgetRank: number | null;
  SaleAmtRank: number | null;
  CustCntRank: number | null;
  AvgTicketAmtRank: number | null;
  MonthlySpaceEfficiencyRank: number | null;
  AchievementRateRank: number | null;

  PreOrderAmt: number | null; // 預售實績
  ConsumerNum: number | null; // 消費人數
  ConsumerOrder: number | null; // 消費客單
}

@Injectable({
  providedIn: 'root'
})
export class TLS32010Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  // 查詢櫃位營業報表資料
  queryTLS32010(data: TLS32010QueryRequest): Observable<ApiResponse<TLS32010Data[]>> {
    return this.http.post<ApiResponse<TLS32010Data[]>>(this.apiUrl + '/queryTLS32010', data);
  }

  // 匯出 PDF
  exportTLS32010PDF(body: TLS32010QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS32010PDF`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  // 匯出 Excel
  exportTLS32010Excel(body: TLS32010QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS32010Excel`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
