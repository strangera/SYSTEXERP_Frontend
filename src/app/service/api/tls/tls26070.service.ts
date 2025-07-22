import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse, DropdownOption } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// 查詢參數 Model
export interface TLS26070QueryRequest extends BaseQueryRequest {
  // 日期查詢條件
  reportType?: string;
  inputDate?: string;
  year?: string;
  week?: string;
  weekDateRange?: string;
  month?: string;
  halfYear?: string;
  startDate?: string;
  endDate?: string;
  // 合約查詢條件
  team?: string[];
  area?: string[];
  categoryMain?: string[];
  categorySub?: string[];
  type?: string[];
  serial?: string[];
  item?: string[];
  taxType?: string;
}

// 查詢結果 Model
export interface TLS26070Data {
  TEAM: string;
  GROUP: string;
  TARGET_2024: number;
  SALES_2024: number;
  ACHIEVEMENT_RATE: string;
  TX_COUNT_2024: number;
  AVG_TX_2024: number;
  SALES_2023: number;
  TX_COUNT_2023: number;
  AVG_TX_2023: number;
  GROWTH_RATE: string;
  SALES_DIFF: number;
  TX_COUNT_DIFF: number;
  AVG_TX_DIFF: number;
  SALES_YIELD: number;
  MONTHLY_PERFORMANCE: number;
}

@Injectable({
  providedIn: 'root'
})
export class TLS26070Service {
  private apiUrl: string = environment.ApiUrl + '/TLS26070';

  constructor(private http: HttpClient) { }

  // 查詢
  queryTLS26070(data: TLS26070QueryRequest): Observable<BaseQueryResponse<TLS26070Data>> {
    // return this.http.post<BaseQueryResponse<TLS26070Data>>(`${this.apiUrl}/queryTLS26070`, data);

    // 假資料範例
    return new Observable<BaseQueryResponse<TLS26070Data>>(observer => {
      const Data: BaseQueryResponse<TLS26070Data> = {
        TotalCount: 3,
        Data: [
          {
            TEAM: '商街Team',
            GROUP: '1F',
            TARGET_2024: 61900000,
            SALES_2024: 56471122,
            ACHIEVEMENT_RATE: '91.2%',
            TX_COUNT_2024: 9430,
            AVG_TX_2024: 5988,
            SALES_2023: 65064344,
            TX_COUNT_2023: 10621,
            AVG_TX_2023: 6126,
            GROWTH_RATE: '-13.2%',
            SALES_DIFF: -8593121,
            TX_COUNT_DIFF: -1191,
            AVG_TX_DIFF: -138,
            SALES_YIELD: 2349.37,
            MONTHLY_PERFORMANCE: 24043
          },
          // ... (請依據查詢結果圖擴充)
        ],
        Status: '',
        Message: '',
        TotalPage: 0
      };
      observer.next(Data);
      observer.complete();
    });
  }
}