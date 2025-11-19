import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢 Request
export interface FIN29080QueryRequest extends BaseQueryRequest {
  QueryDateFrom: string;
  QueryDateTo: string;
  PaymentDateFrom?: string;
  PaymentDateTo?: string;
}

// 明細 Row
export interface FIN29080Data {
  ID: number;
  PaymentDate: string;
  PayableAmount: number;
  DeductionAmount: number;
  DiscountInterest: number;
  EstimatedPayable: number;
}

@Injectable({ providedIn: 'root' })
export class FIN29080Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/FIN29080';

  constructor(private http: HttpClient) { }

  /** 查詢預估應付款資料 */
  queryFIN29080(req: FIN29080QueryRequest): Observable<BaseQueryResponse<FIN29080Data>> {
    // return this.http.post<BaseQueryResponse<FIN29080Data>>(`${this.apiUrl}/queryFIN29080`, req);
    // 回傳假資料供前端開發使用
    return of({
      Status: 'Success',
      Message: '',
      TotalCount: 3,
      TotalPage: 1,
      Data: [
        {
          ID: 1,
          PaymentDate: '2024-06-15',
          PayableAmount: 500000,
          DeductionAmount: 10000,
          DiscountInterest: 5000,
          EstimatedPayable: 485000
        },
        {
          ID: 2,
          PaymentDate: '2024-06-20',
          PayableAmount: 750000,
          DeductionAmount: 15000,
          DiscountInterest: 7500,
          EstimatedPayable: 727500
        },
        {
          ID: 3,
          PaymentDate: '2024-06-25',
          PayableAmount: 300000,
          DeductionAmount: 6000,
          DiscountInterest: 3000,
          EstimatedPayable: 291000
        }
      ]
    });
  }
}