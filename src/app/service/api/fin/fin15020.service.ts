import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// --- FIN15020 查詢參數 Model 定義 ---
export interface FIN15020QueryRequest extends BaseQueryRequest {
  ReturnOrderNumberStart?: string;     // 退出/折讓單號_起
  ReturnOrderNumberEnd?: string;       // 退出/折讓單號_迄
  InvoiceFormat?: string;              // 發票格式
  Character?: string;                  // 字軌
  InvoiceNumberStart?: string;         // 發票號碼_起
  InvoiceNumberEnd?: string;           // 發票號碼_迄
  ReturnDateStart?: string;            // 退出/折讓日期_起
  ReturnDateEnd?: string;              // 退出/折讓日期_迄
  AreaType?: string;                   // 區別
  DeclareMonth?: string;               // 申報年月
  DataYearMonthStart?: string;         // 資料所屬年月_起
  DataYearMonthEnd?: string;           // 資料所屬年月_迄
  TransmissionNumberStart?: string;    // 傳票號碼_起
  TransmissionNumberEnd?: string;      // 傳票號碼_迄
  VoucherNumberStart?: string;         // 憑證單號_起
  VoucherNumberEnd?: string;           // 憑證單號_迄
  PrintType?: string;                  // 列印方式(合併/分開列印)
  SystemType?: string;                 // 系統別
}

// --- FIN15020 回應資料 Model 定義 ---
export interface FIN15020Data {
  Sequence: number;                    // 序號
  InvoiceFormat: string;               // 發票格式
  ReturnOrderNumber: string;           // 退出/折讓單號
  Character: string;                   // 字軌
  InvoiceNumber: string;               // 發票號碼
  ReturnDate: string;                  // 退出/折讓日期
  AreaType: string;                    // 區別
  DeclareMonth: string;                // 申報年月
  DataYearMonth: string;               // 資料所屬年月
  ReturnAmount: number;                // 退出/折讓金額
  ReturnTax: number;                   // 退出/折讓稅額
  VoucherNumber: string;               // 憑證單號
  TransmissionNumber: string;          // 傳票號碼
  PrintType: string;                   // 列印方式
  SystemType: string;                  // 系統別
}

@Injectable({
  providedIn: 'root'
})
export class FIN15020Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1520';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN15020(data: FIN15020QueryRequest): Observable<BaseQueryResponse<FIN15020Data>> {
    // return this.http.post<BaseQueryResponse<FIN15020Data>>(`${this.apiUrl}/queryFIN15020`, data);

    // 回傳假資料
    return new Observable<BaseQueryResponse<FIN15020Data>>(observer => {
      const Data: BaseQueryResponse<FIN15020Data> = {
        TotalCount: 2,
        Data: [{
          Sequence: 1,
          InvoiceFormat: 'B02',
          ReturnOrderNumber: 'R202501',
          Character: 'AH',
          InvoiceNumber: '25678901',
          ReturnDate: '2025-07-15',
          AreaType: 'A',
          DeclareMonth: '202507',
          DataYearMonth: '202507',
          ReturnAmount: 10000,
          ReturnTax: 500,
          VoucherNumber: 'VC10001',
          TransmissionNumber: 'TRN5001',
          PrintType: '合併列印',
          SystemType: 'S1'
        }, {
          Sequence: 2,
          InvoiceFormat: 'B02',
          ReturnOrderNumber: 'R202502',
          Character: 'BG',
          InvoiceNumber: '25678902',
          ReturnDate: '2025-07-16',
          AreaType: 'B',
          DeclareMonth: '202507',
          DataYearMonth: '202507',
          ReturnAmount: 20000,
          ReturnTax: 1200,
          VoucherNumber: 'VC10002',
          TransmissionNumber: 'TRN5002',
          PrintType: '分開列印',
          SystemType: 'S2'
        }],
        Status: '',
        Message: '',
        TotalPage: 0
      };
      observer.next(Data);
      observer.complete();
    });
  }
}