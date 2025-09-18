import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryTLS2G040Params {
  budget_yymm: string;
  bus_type?: string | null;
  bus_class?: string | null;
  bus_sclass?: string | null;
  org_ids?: string[] | null;
  tlt_nos?: string[] | null;
  report_type: 'bus_type' | 'bus_class' | 'bus_sclass' | 'org_id' | 'tlt_no';
}

// 後端 Response DTO
export interface TLS2G040Response {
  bus_type?: string | null;
  bus_type_name?: string | null;
  bus_class?: string | null;
  bus_class_name?: string | null;
  bus_sclass?: string | null;
  bus_sclass_name?: string | null;
  org_id?: string | null;
  org_name?: string | null;
  tlt_no?: string | null;
  tlt_name?: string | null;
  total_budget: number;
  // 後端回傳的每日預算，鍵值對
  DailyBudgets: Record<string, number>;
}

// 處理後要給 Component 使用的資料格式
// 包含了 DailyBudgets 扁平化後的每日欄位
export interface TLS2G040Data {
  bus_type?: string | null;
  bus_type_name?: string | null;
  bus_class?: string | null;
  bus_class_name?: string | null;
  bus_sclass?: string | null;
  bus_sclass_name?: string | null;
  org_id?: string | null;
  org_name?: string | null;
  tlt_no?: string | null;
  tlt_name?: string | null;
  total_budget: number;
  // 每日預算動態欄位，例如 daily_1, daily_2...
  [key: string]: any;
}

// 後端完整回傳結果
export interface QueryTLS2G040Result extends ApiResponse<TLS2G040Response[]> {
  Data: TLS2G040Response[];
  TotalCount: number;
  FooterTotal: TLS2G040Response;
}
@Injectable({
  providedIn: 'root'
})
export class TLS2G040Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/TLTBUDGET';

  constructor(private http: HttpClient) { }

  /**
   * 查詢專櫃預算日報表
   * @param params 查詢條件
   * @returns 包含 TLS2G040Data 陣列的 Observable
   */
  public queryTLS2G040(params: QueryTLS2G040Params): Observable<QueryTLS2G040Result> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2G040`, params)
      .pipe(
        map(response => {
          const processDailyBudgets = (item: TLS2G040Response): TLS2G040Data => {
            const processedItem: TLS2G040Data = { ...item } as TLS2G040Data;
            if (item.DailyBudgets) {
              for (const day in item.DailyBudgets) {
                if (Object.prototype.hasOwnProperty.call(item.DailyBudgets, day)) {
                  processedItem[`daily_${day}`] = item.DailyBudgets[day];
                }
              }
            }
            delete processedItem['DailyBudgets'];
            return processedItem;
          };

          // 處理一般資料
          const processedData: TLS2G040Data[] = response.Data?.map(processDailyBudgets) || [];
          // 處理總計資料
          const processedFooterTotal: TLS2G040Data | null = response.FooterTotal ? processDailyBudgets(response.FooterTotal) : null;

          return {
            ...response,
            Data: processedData, // 回傳處理好的資料陣列
            FooterTotal: processedFooterTotal // 回傳處理好的總計資料
          };
        })
      );
  }
}
