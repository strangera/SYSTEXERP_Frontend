import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TLS31010Request {
  IsExcel?: boolean;
  TXN_Date: string | Date;
  tlt_building: string[]
  tlt_floor: string[]
  area_no: string[]
  bus_type: string[]
  bus_class: string[]
  bus_sclass: string[]
  tlt_kind: string[]
  tlt_term_type: string[]
  org_id: string[]
  TaxType: string
  IsRece_Yn: string
  /** 是否顯示預售業績欄位（對應查詢畫面「預售」勾選框），列印/匯出報表用 */
  PreSale?: boolean
  /** 是否顯示消費人數/消費客單欄位（對應查詢畫面「消費人數」勾選框），列印/匯出報表用 */
  ConsumerNum?: boolean
}

export interface TLS31010QueryData {
  group_name?: string
  building_desc: string
  org_name: string
  tlt_kind: string
  tlt_no: string
  location_no: string
  tlt_name: string
  budget: number
  AVN_TotSaleAmt: number
  AchievementRate: number
  BudgetRate: number
  PerformanceRate: number
  TxnCount: number
  AvgTicket: number
  tlt_space: number
  MonthlyPSM: number
  MonthlyBudgetTotal: number
  MonthlySalesTotal: number
  CompletionRate: number
}

export interface TLS31010QueryFooterData {
  budget: number
  AVN_TotSaleAmt: number
  AchievementRate: number
  BudgetRate: number
  PerformanceRate: number
  TxnCount: number
  AvgTicket: number
  tlt_space: number
  MonthlyPSM: number
  MonthlyBudgetTotal: number
  MonthlySalesTotal: number
  CompletionRate: number
}

export interface TLS31010TotalData {
  TotalBudget: number,
  TotalSales: number,
  AvgAchievementRate: number,
  TotalTxnCount: number,
  AvgTicket: number,
  TotalSpace: number,
  AvgPSM: number,
  TotalMonthlyBudget: number,
  TotalMonthlySales: number,
  AvgCompletionRate: number,
  TotalPrePerformance: number, // 預售業績總計
  TotalConsumerNum: number, // 消費人數總計
  TotalConsumerOrder: number, // 消費客單總計
}

export interface TLS31010Response {
  QueryData: TLS31010QueryData[];
  TotalData: TLS31010TotalData;
}

export interface TLS31010FormattedResponse extends ApiResponse<TLS31010QueryData[]> {
  TotalData?: TLS31010TotalData;
}

@Injectable({
  providedIn: 'root'
})
export class Tls31010Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS3000';
  constructor(private http: HttpClient) { }

  queryTLS31010(body: TLS31010Request): Observable<TLS31010FormattedResponse> {
    return this.http.post<ApiResponse<TLS31010Response>>(`${this.apiUrl}/queryTLS31010`, body).pipe(
      map(res => {
        // 將 TotalData 映射到與 columns 相符的 key 名稱
        const mappedTotalData = res.Data?.TotalData ? {
          budget: res.Data.TotalData.TotalBudget,
          AVN_TotSaleAmt: res.Data.TotalData.TotalSales,
          AchievementRate: res.Data.TotalData.AvgAchievementRate,
          TxnCount: res.Data.TotalData.TotalTxnCount,
          AvgTicket: res.Data.TotalData.AvgTicket,
          MonthlyBudgetTotal: res.Data.TotalData.TotalMonthlyBudget,
          MonthlySalesTotal: res.Data.TotalData.TotalMonthlySales,
          CompletionRate: res.Data.TotalData.AvgCompletionRate,

          PrePerformance: res.Data.TotalData.TotalPrePerformance,
          ConsumerNum: res.Data.TotalData.TotalConsumerNum,
          ConsumerOrder: res.Data.TotalData.TotalConsumerOrder,
        } : null;

        return {
          ...res,
          Data: res.Data?.QueryData || [],
          TotalData: mappedTotalData, // 這裡傳出的已經是處理過的結構
          TotalCount: res.TotalCount || 0
        } as any; // 這裡可以用 any 避開類型檢查，或更新 TLS31010FormattedResponse 的定義
      })
    );
  }

  printTLS31010(body: TLS31010Request | null): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS31010`, body);
  }
}
