import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// --- FIN15030 查詢參數 Model 定義 ---
export interface FIN15030QueryRequest extends BaseQueryRequest {
  ReturnOrderNumberStart?: string;   // 退出/折讓單號_起
  ReturnOrderNumberEnd?: string;     // 退出/折讓單號_迄
  InvoiceFormat?: string;            // 發票格式
  Character?: string;                // 字軌
  InvoiceNumberStart?: string;       // 發票號碼_起
  InvoiceNumberEnd?: string;         // 發票號碼_迄
  ReturnDateStart?: string;          // 退出/折讓日期_起
  ReturnDateEnd?: string;            // 退出/折讓日期_迄
  AreaType?: string;                 // 區別
  DeclareYearMonth?: string;         // 申報年月
  DataYearMonthStart?: string;       // 資料所屬年月_起
  DataYearMonthEnd?: string;         // 資料所屬年月_迄
  VoucherNumberStart?: string;       // 憑證單號_起
  VoucherNumberEnd?: string;         // 憑證單號_迄
  TransmissionNumberStart?: string;  // 傳票號碼_起
  TransmissionNumberEnd?: string;    // 傳票號碼_迄
  PrintType?: string;                // 列印方式(合併/分開列印)
  SystemType?: string;               // 系統別
}

// --- FIN15030 回應資料 Model 定義 ---
export interface FIN15030Data {
  Sequence: number;                  // 序號
  ReturnOrderNumber: string;         // 退出/折讓單號
  InvoiceFormat: string;             // 發票格式
  Character: string;                 // 字軌
  InvoiceNumber: string;             // 發票號碼
  ReturnDate: string;                // 退出/折讓日期
  AreaType: string;                  // 區別
  DeclareYearMonth: string;          // 申報年月
  DataYearMonth: string;             // 資料所屬年月
  ReturnAmount: number;              // 退出/折讓金額
  ReturnTax: number;                 // 退出/折讓稅額
  VoucherNumber: string;             // 憑證單號
  TransmissionNumber: string;        // 傳票號碼
  SystemType: string;                // 系統別
  UniformNumber: string;             // 統一編號
}

@Injectable({
  providedIn: 'root'
})
export class FIN15030Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1530';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN15030(data: FIN15030QueryRequest): Observable<BaseQueryResponse<FIN15030Data>> {
    // return this.http.post<BaseQueryResponse<FIN15030Data>>(`${this.apiUrl}/queryFIN15030`, data);

    // 回傳假資料
    return new Observable<BaseQueryResponse<FIN15030Data>>(observer => {
      const Data: BaseQueryResponse<FIN15030Data> = {
        TotalCount: 3,
        Data: [
          {
            Sequence: 1,
            ReturnOrderNumber: '20190124001',
            InvoiceFormat: '33',
            Character: 'JB',
            InvoiceNumber: '44068957',
            ReturnDate: '2019/01/20',
            AreaType: '折讓',
            DeclareYearMonth: '201902',
            DataYearMonth: '201902',
            ReturnAmount: 1210,
            ReturnTax: 60,
            VoucherNumber: '60',
            TransmissionNumber: '20190120009',
            SystemType: '27365925',
            UniformNumber: '27365925'
          },
          {
            Sequence: 2,
            ReturnOrderNumber: '20190225001',
            InvoiceFormat: '33',
            Character: 'KY',
            InvoiceNumber: '43633124',
            ReturnDate: '2019/02/20',
            AreaType: '折讓',
            DeclareYearMonth: '201902',
            DataYearMonth: '201902',
            ReturnAmount: 27749,
            ReturnTax: 1387,
            VoucherNumber: '1387',
            TransmissionNumber: '20190220014',
            SystemType: '27365925',
            UniformNumber: '27365925'
          },
          {
            Sequence: 3,
            ReturnOrderNumber: '20190302001',
            InvoiceFormat: '33',
            Character: 'LA',
            InvoiceNumber: '77881166',
            ReturnDate: '2019/02/28',
            AreaType: '折讓',
            DeclareYearMonth: '201902',
            DataYearMonth: '201902',
            ReturnAmount: 16065,
            ReturnTax: 803,
            VoucherNumber: '803',
            TransmissionNumber: '20190228105',
            SystemType: '53575264',
            UniformNumber: '53575264'
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