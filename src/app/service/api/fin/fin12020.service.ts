import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';

// --- FIN12020 查詢參數 Model 定義 ---
export interface FIN12020QueryRequest extends BaseQueryRequest {
  invoice_month_start?: string;         // 發票年月(起)
  invoice_month_end?: string;           // 發票年月(訖)
  invoice_type?: string;                // 發票類別
  prefix?: string;                      // 字軌
  invoice_no?: string;                  // 發票號碼
  invoice_no_start?: string;            // 發票號碼(起)
  invoice_no_end?: string;              // 發票號碼(迄)
  cashier_no?: string;                  // 收銀機號
  invoice_status?: string;              // 發票狀態
  usage_type?: string;                  // 使用別
}

// --- FIN12020 回應資料 Model 定義 ---
export interface FIN12020Data {
  invoice_month?: string;               // 發票年月
  prefix?: string;                      // 字軌
  invoice_no_start?: string;            // 發票號碼(起)
  invoice_no_end?: string;              // 發票號碼(迄)
  next_invoice_no?: string;             // NEXT發票配號號碼
  usage_type?: string;                  // 使用別
  invoice_status?: string;              // 使用狀態
}

@Injectable({
  providedIn: 'root'
})
export class FIN12020Service {

  constructor() { }

  // 查詢
  queryFIN12020(params: FIN12020QueryRequest): Observable<BaseQueryResponse<FIN12020Data>> {
    // 回傳假資料
    return new Observable((observer) => {
      observer.next({
        Data: [
          {
            invoice_month: '202406',
            prefix: 'AB',
            invoice_no_start: '000001',
            invoice_no_end: '000100',
            next_invoice_no: '000101',
            usage_type: '一般',
            invoice_status: '啟用'
          },
          {
            invoice_month: '202406',
            prefix: 'CD',
            invoice_no_start: '000101',
            invoice_no_end: '000200',
            next_invoice_no: '000201',
            usage_type: '特別',
            invoice_status: '停用'
          }
        ],
        Status: '0000',
        TotalCount: 2,
        TotalPage: 1,
        Message: '查詢成功'
      } as BaseQueryResponse<FIN12020Data>);
      observer.complete();
    });
  }
}