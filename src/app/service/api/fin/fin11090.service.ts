import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// --- FIN11090 Model 定義 ---
export interface FIN11090 {
  prefix?: string;           // 字軌
  invoice_no?: string;       // 發票號碼
  invoice_date?: string;     // 發票日期
  cashier_no?: string;       // 收銀機代號
  txn_seq?: string;          // 交易序號
}

// --- FIN11090 Model 定義 ---
export interface FIN11090QueryResponse {
  prefix?: string;           // 字軌
  invoice_no?: string;       // 發票號碼
  invoice_date?: string;     // 發票日期
  cashier_no?: string;       // 收銀機代號
  invoice_amt?: string;      // 交易金額
}

@Injectable({
  providedIn: 'root'
})
export class Fin11090Service {

  constructor() { }

  // 查詢
  queryFIN11090(params: any): Observable<any> {
    // 回傳假資料
    return new Observable((observer) => {
      observer.next({
        Data: [
          {
            prefix: 'AB',
            invoice_no: '12345678',
            invoice_date: '2025-07-01',
            cashier_no: 'C1001',
            txn_seq: '000001',
            invoice_amt: '1000'
          },
          {
            prefix: 'CD',
            invoice_no: '87654321',
            invoice_date: '2025-07-02',
            cashier_no: 'C2002',
            txn_seq: '000002',
            invoice_amt: '2000'
          }
        ],
        Status: '0000',
        TotalCount: 2
      });
      observer.complete();
    });
  }

  // 新增
  insertFIN11090(body: any): Observable<any> {
    return new Observable((observer) => {
      observer.next({ Status: '0000', Message: '新增成功' });
      observer.complete();
    });
  }
}
