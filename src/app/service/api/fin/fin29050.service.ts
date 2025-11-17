import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from 'src/environments/environment';

// 查詢 Request
export interface QueryFIN29050Request extends BaseQueryRequest {
  VendorNoFrom?: string;
  VendorNoTo?: string;
  BillingDateFrom: string;
  BillingDateTo: string;
  PayableAmountFrom?: number;
  PayableAmountTo?: number;
  AccNoFrom?: string;
  AccNoTo?: string;
  ShowZeroBalance?: string;
}

// 明細 Row
export interface QueryFIN29050Response {
  VendorNo: string;
  VendorName: string;
  Notes: string;
  BillingDate: string;
  VouNo: string;
  PayableAmount: number;
  ClearedAmount: number;
  RetentionAmount: number;
  ClearedRetentionAmount: number;
  UnpaidAmount: number;
}

// 明細查詢 Request
export interface QueryFIN29050DetailRequest {
  VouNo: string;
}

// 明細查詢 Response
export interface QueryFIN29050DetailResponse {
  Status: string;
  Data: any; // 根據實際 API 回傳結構調整
  Error?: { Code: string; Message: string; Details?: string };
  Meta?: { Timestamp: string; RequestId: string };
  Message?: string;
}

@Injectable({ providedIn: 'root' })
export class FIN29050Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/FIN29050';

  constructor(private http: HttpClient) { }

  /** 查詢廠客應付帳款 */
  queryFIN29050(req: QueryFIN29050Request): Observable<BaseQueryResponse<QueryFIN29050Response>> {
    // return this.http.post<BaseQueryResponse<QueryFIN29050Response>>(`${this.apiUrl}/queryFIN29050`, req);

    // 回傳假資料供前端開發使用
    return of({
      Status: 'Success',
      Message: '',
      TotalCount: 2,
      TotalPage: 1,
      Data: [
        {
          VendorNo: '1001',
          VendorName: '廠商A',
          Notes: '測試資料A',
          BillingDate: '2024-01-15',
          VouNo: 'VOU123456',
          PayableAmount: 5000,
          ClearedAmount: 2000,
          RetentionAmount: 500,
          ClearedRetentionAmount: 200,
          UnpaidAmount: 2300,
        },
        {
          VendorNo: '1002',
          VendorName: '廠商B',
          Notes: '測試資料B',
          BillingDate: '2024-01-20',
          VouNo: 'VOU654321',
          PayableAmount: 7000,
          ClearedAmount: 3000,
          RetentionAmount: 700,
          ClearedRetentionAmount: 300,
          UnpaidAmount: 2700,
        },
      ],
    });
  }

  /** 查詢傳票明細 */
  queryFIN29050Detail(body: QueryFIN29050DetailRequest): Observable<QueryFIN29050DetailResponse> {
    return this.http.post<QueryFIN29050DetailResponse>(`${this.apiUrl}/queryFIN29050Detail`, body);
  }
}