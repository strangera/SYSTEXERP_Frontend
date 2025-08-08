import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// --- FIN15040 查詢參數 Model 定義 ---
export interface FIN15040QueryRequest extends BaseQueryRequest {
  InvoiceDateStart?: string;         // 發票日期_起
  InvoiceDateEnd?: string;           // 發票日期_迄
  InvoiceFormat?: string;            // 發票格式
  Character?: string;                // 字軌
  InvoiceNumberStart?: string;       // 發票號碼_起
  InvoiceNumberEnd?: string;         // 發票號碼_迄
  SellerUniform?: string;            // 廠商編號(統一編號)
  DeclareYearMonth?: string;         // 申報年月
  DataYearMonthStart?: string;       // 資料所屬年月_起
  DataYearMonthEnd?: string;         // 資料所屬年月_迄
  TaxType?: string;                  // 課稅別
  VoucherNumberStart?: string;       // 憑證單號_起
  VoucherNumberEnd?: string;         // 憑證單號_迄
  TransmissionNumberStart?: string;  // 傳票號碼_起
  TransmissionNumberEnd?: string;    // 傳票號碼_迄
  SystemType?: string;               // 系統別
  AssetRemark?: string;              // 資產註記
  InvoiceCreator?: string;           // 傳票建立者
  IsUniform?: string;                // 是否有統一編號
  PrintType?: string;                // 列印方式(合併/分開列印)
}

// --- FIN15040 回應資料 Model 定義 ---
export interface FIN15040Data {
  Sequence: number;                  // 序號
  InvoiceFormat: string;             // 格式代號
  Character: string;                 // 字軌
  InvoiceNumber: string;             // 發票號碼
  InvoiceDate: string;               // 發票日期
  DataYearMonth: string;             // 資料所屬年月
  DeclareYearMonth: string;          // 申報年月
  BuyerUniform: string;              // 買受人統一編號
  InvoiceAmount: number;             // 發票金額
  InvoiceTax: number;                // 發票稅額
  InvoiceTotal: number;              // 發票總金額
  TaxType: string;                   // 課稅別
  VoucherNumber: string;             // 傳票號碼
  SystemType: string;                // 系統別
}

@Injectable({
  providedIn: 'root'
})
export class FIN15040Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1540';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN15040(data: FIN15040QueryRequest): Observable<BaseQueryResponse<FIN15040Data>> {
    // return this.http.post<BaseQueryResponse<FIN15040Data>>(`${this.apiUrl}/queryFIN15040`, data);

    // 回傳假資料
    return new Observable<BaseQueryResponse<FIN15040Data>>(observer => {
      const Data: BaseQueryResponse<FIN15040Data> = {
        TotalCount: 10,
        Data: [
          { Sequence: 1, InvoiceFormat: '31', Character: 'KY', InvoiceNumber: '43633051', InvoiceDate: '2019/01/01', DataYearMonth: '201901', DeclareYearMonth: '201902', BuyerUniform: '53266865', InvoiceAmount: 7563, InvoiceTax: 378, InvoiceTotal: 7941, TaxType: '應稅', VoucherNumber: '20190120009', SystemType: '專櫃營運管理' },
          { Sequence: 2, InvoiceFormat: '31', Character: 'KY', InvoiceNumber: '43633053', InvoiceDate: '2019/01/04', DataYearMonth: '201901', DeclareYearMonth: '201902', BuyerUniform: '69115908', InvoiceAmount: 27524, InvoiceTax: 1376, InvoiceTotal: 28900, TaxType: '應稅', VoucherNumber: '20190220014', SystemType: '專櫃營運管理' },
          { Sequence: 3, InvoiceFormat: '31', Character: 'KY', InvoiceNumber: '43633054', InvoiceDate: '2019/01/19', DataYearMonth: '201901', DeclareYearMonth: '201902', BuyerUniform: '54066372', InvoiceAmount: 4076, InvoiceTax: 204, InvoiceTotal: 4280, TaxType: '應稅', VoucherNumber: '20190228105', SystemType: '專櫃營運管理' },
          { Sequence: 4, InvoiceFormat: '31', Character: 'KY', InvoiceNumber: '43633055', InvoiceDate: '2019/01/19', DataYearMonth: '201901', DeclareYearMonth: '201902', BuyerUniform: '54066372', InvoiceAmount: 1505, InvoiceTax: 75, InvoiceTotal: 1580, TaxType: '應稅', VoucherNumber: '20190228105', SystemType: '專櫃營運管理' },
          { Sequence: 5, InvoiceFormat: '31', Character: 'KY', InvoiceNumber: '43633056', InvoiceDate: '2019/01/21', DataYearMonth: '201901', DeclareYearMonth: '201902', BuyerUniform: '54789026', InvoiceAmount: 648, InvoiceTax: 32, InvoiceTotal: 680, TaxType: '應稅', VoucherNumber: '20190228105', SystemType: '專櫃營運管理' },
          { Sequence: 6, InvoiceFormat: '31', Character: 'KY', InvoiceNumber: '43633057', InvoiceDate: '2019/01/22', DataYearMonth: '201901', DeclareYearMonth: '201902', BuyerUniform: '99575490', InvoiceAmount: 1270, InvoiceTax: 64, InvoiceTotal: 1334, TaxType: '應稅', VoucherNumber: '20190228105', SystemType: '專櫃營運管理' },
          { Sequence: 7, InvoiceFormat: '31', Character: 'KY', InvoiceNumber: '43633058', InvoiceDate: '2019/01/22', DataYearMonth: '201901', DeclareYearMonth: '201902', BuyerUniform: '53524006', InvoiceAmount: 47619, InvoiceTax: 2381, InvoiceTotal: 50000, TaxType: '應稅', VoucherNumber: '20190228105', SystemType: '專櫃營運管理' },
          { Sequence: 8, InvoiceFormat: '31', Character: 'KY', InvoiceNumber: '43633059', InvoiceDate: '2019/01/26', DataYearMonth: '201901', DeclareYearMonth: '201902', BuyerUniform: '73689568', InvoiceAmount: 7761, InvoiceTax: 388, InvoiceTotal: 8149, TaxType: '應稅', VoucherNumber: '20190228105', SystemType: '專櫃營運管理' },
          { Sequence: 9, InvoiceFormat: '31', Character: 'KY', InvoiceNumber: '43633060', InvoiceDate: '2019/01/30', DataYearMonth: '201901', DeclareYearMonth: '201902', BuyerUniform: '69115908', InvoiceAmount: 699, InvoiceTax: 0, InvoiceTotal: 699, TaxType: '免稅', VoucherNumber: '20190228105', SystemType: '專櫃營運管理' },
          { Sequence: 10, InvoiceFormat: '31', Character: 'KY', InvoiceNumber: '43633061', InvoiceDate: '2019/01/30', DataYearMonth: '201901', DeclareYearMonth: '201902', BuyerUniform: '86911294', InvoiceAmount: 47619, InvoiceTax: 2381, InvoiceTotal: 50000, TaxType: '應稅', VoucherNumber: '20190228105', SystemType: '專櫃營運管理' }
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