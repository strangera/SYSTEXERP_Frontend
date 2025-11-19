import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢 Request
export interface FIN29020QueryRequest extends BaseQueryRequest {
  IssueDateFrom: string;
  IssueDateTo: string;
  BankCodeList?: string[];
  CheckNoFrom?: string;
  CheckNoTo?: string;
  VendorNoList?: string[];
  DueDate?: string;
  CheckStatusList?: string[];
}

// 明細 Row
export interface FIN29020Data {
  ID: number;
  RemittanceNo: string;
  BankCode: string;
  RemittanceDate: string;
  VendorName: string;
  RemittanceBankCode: string;
  PaymentBankName: string;
  BankAccount: string;
  AccountName: string;
  AccountAmount: number;
  RemittanceAmount: number;
}

@Injectable({ providedIn: 'root' })
export class FIN29020Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/FIN29020';

  constructor(private http: HttpClient) { }

  /** 查詢票據資料 */
  queryFIN29020(req: FIN29020QueryRequest): Observable<BaseQueryResponse<FIN29020Data>> {
    // return this.http.post<BaseQueryResponse<FIN29020Data>>(`${this.apiUrl}/queryFIN29020`, req);
    // 回傳假資料供前端開發使用
    return of({
      Status: 'Success',
      Message: '',
      TotalCount: 1,
      TotalPage: 1,
      Data: [
        {
          ID: 1,
          RemittanceNo: 'RM20240001',
          BankCode: '004',
          RemittanceDate: '2024-06-01',
          VendorName: '供應商A',
          RemittanceBankCode: '004',
          PaymentBankName: '台灣銀行',
          BankAccount: '123456789012',
          AccountName: '供應商A帳戶',
          AccountAmount: 100000,
          RemittanceAmount: 100000
        },
      ]
    })
  }
}