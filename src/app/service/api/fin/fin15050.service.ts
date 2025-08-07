import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// --- FIN15050 查詢參數 Model 定義 ---
export interface FIN15050QueryRequest extends BaseQueryRequest {
  DeclareYearMonth?: string;         // 申報年月
  UsageType?: string;                // 使用別
  Character?: string;                // 字軌
  InvoiceNumberStart?: string;       // 發票號碼_起
  InvoiceNumberEnd?: string;         // 發票號碼_迄
}

// --- FIN15050 回應資料 Model 定義 ---
export interface FIN15050Data {
  DeclareYearMonth: string;          // 申報年月
  UsageType: string;                 // 使用別
  Character: string;                 // 字軌
  InvoiceNumber: string;             // 發票號碼
  IssueDate: string;                 // 開立日期
  BuyerName: string;                 // 買受人名稱
  Amount: number;                    // 金額
}

@Injectable({
  providedIn: 'root'
})
export class FIN15050Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1560';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN15050(data: FIN15050QueryRequest): Observable<BaseQueryResponse<FIN15050Data>> {
    // return this.http.post<BaseQueryResponse<FIN15050Data>>(`${this.apiUrl}/queryFIN15050`, data);

    // 回傳假資料
    return new Observable<BaseQueryResponse<FIN15050Data>>(observer => {
      const Data: BaseQueryResponse<FIN15050Data> = {
        TotalCount: 2,
        Data: [
          {
            DeclareYearMonth: '202507',
            UsageType: '自用',
            Character: 'AB',
            InvoiceNumber: '12345678',
            IssueDate: '2025-07-10',
            BuyerName: '台灣科技公司',
            Amount: 5000
          },
          {
            DeclareYearMonth: '202507',
            UsageType: '轉售',
            Character: 'CD',
            InvoiceNumber: '87654321',
            IssueDate: '2025-07-15',
            BuyerName: '國際貿易行',
            Amount: 12000
          }
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