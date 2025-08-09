import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';

// --- FIN11090 查詢參數 Model 定義 ---
export interface FIN11090QueryRequest extends BaseQueryRequest {
  prefix?: string;           // 字軌
  invoice_no?: string;       // 發票號碼
  invoice_date?: string;     // 發票日期
  cashier_no?: string;       // 收銀機號
  txn_seq?: string;          // 交易序號
  void_date_from?: string;    // 作廢日期(起)
  void_date_to?: string;      // 作廢日期(迄)
  void_user?: string;         // 作廢人員
}

// --- FIN11090 查詢回應 Model 定義 ---
export interface FIN11090Data {
  prefix?: string;           // 字軌
  invoice_no?: string;       // 發票號碼
  invoice_date?: string;     // 發票日期
  cashier_no?: string;       // 收銀機號
  txn_seq?: string;          // 交易序號
  invoice_amt?: number;      // 交易金額
  void_date?: string;         // 作廢日期
  void_user?: string;         // 作廢人員
}

@Injectable({
  providedIn: 'root'
})
export class Fin11090Service {

  constructor() { }

  // 查詢
  queryFIN11090(params: FIN11090QueryRequest): Observable<BaseQueryResponse<FIN11090Data>> {
    // 回傳假資料
    return new Observable(observer => {
      observer.next({
        Data: [
          {
            prefix: 'AB',
            invoice_no: '12345678',
            invoice_date: '2025-07-01',
            cashier_no: 'C1001',
            txn_seq: '000001',
            invoice_amt: 1000,
            void_date: '2025-07-03',
            void_user: 'User1'
          },
          {
            prefix: 'CD',
            invoice_no: '87654321',
            invoice_date: '2025-07-02',
            cashier_no: 'C2002',
            txn_seq: '000002',
            invoice_amt: 2000,
            void_date: '2025-07-04',
            void_user: 'User2'
          }
        ],
        Status: '0000',
        TotalCount: 2,
        TotalPage: 1,
        Message: '查詢成功'
      } as BaseQueryResponse<FIN11090Data>);
      observer.complete();
    });
  }

  // 新增
  insertFIN11090(body: FIN11090Data): Observable<{ Status: string, Message: string }> {
    return new Observable(observer => {
      observer.next({ Status: '0000', Message: '新增成功' });
      observer.complete();
    });
  }
}