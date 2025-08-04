import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse, DropdownOption } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// --- FIN15010 查詢參數 Model 定義 ---
export interface FIN15010QueryRequest extends BaseQueryRequest {
  InvoiceDateStart?: string;          // 發票日期_起
  InvoiceDateEnd?: string;            // 發票日期_迄
  FormatCode?: string[];              // 發票格式 (多選)
  Character?: string;                 // 字軌
  InvoiceNumberStart?: string;        // 發票號碼_起
  InvoiceNumberEnd?: string;          // 發票號碼_迄
  DataYearMonthStart?: string;        // 資料所屬年月_起
  DataYearMonthEnd?: string;          // 資料所屬年月_迄
  DeclareYearMonthStart?: string;     // 申報年月_起
  DeclareYearMonthEnd?: string;       // 申報年月_迄
  SellerUniformStart?: string;        // 廠商統一編號_起
  SellerUniformEnd?: string;          // 廠商統一編號_迄
  InvoiceType?: string[];             // 類別區分 (多選)
  PrintType?: string;                 // 列印方式
  BuyerUniform?: string;              // 客戶編號(統一編號)
  InvoiceUsage?: string;              // 發票使用別
  CarrierType?: string;               // 傳票類立者
  CarrierNumberStart?: string;        // 傳票號碼_起
  CarrierNumberEnd?: string;          // 傳票號碼_迄
  BuildDateStart?: string;            // 建立日期_起
  BuildDateEnd?: string;              // 建立日期_迄
  SystemType?: string;                // 系統別
  TaxType?: string[];                 // 課稅別 (多選)
  DeductionCode?: string;             // 扣抵代碼
  CertNumberStart?: string;           // 憑證號碼_起
  CertNumberEnd?: string;             // 憑證號碼_迄
}

// --- FIN15010 回應資料 Model 定義 ---
export interface FIN15010Data {
  Sequence: number;             // 序號
  FormatCode: string;           // 格式代號
  Character: string;            // 字軌
  InvoiceNumber: string;        // 發票號碼
  InvoiceDate: string;          // 發票日期
  DataYearMonth: string;        // 資料所屬年月
  DeclareYearMonth: string;     // 申報年月
  SellerUniform: string;        // 廠商編號(統一編號)
  BuyerUniform: string;         // 客戶編號(統一編號)
  InvoiceAmount: number;        // 發票金額
  InvoiceTax: number;           // 發票稅額
  DeductionAmount: number;      // 應稅總金額
  InvoiceType: string;          // 發票類別
  InvoiceUsage: string;         // 發票使用別
  CarrierType: string;          // 傳票類立者
  CarrierNumber: string;        // 傳票號碼
  BuildDate: string;            // 建立日期
  PrintType: string;            // 列印方式(合併/分開列印)
  SystemType: string;           // 系統別
}

@Injectable({
  providedIn: 'root'
})
export class FIN15010Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1500';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN15010(data: FIN15010QueryRequest): Observable<BaseQueryResponse<FIN15010Data>> {
    // return this.http.post<BaseQueryResponse<FIN15010Data>>(`${this.apiUrl}/queryFIN15010`, data);

    // 回傳假資料
    return new Observable<BaseQueryResponse<FIN15010Data>>(observer => {
      const Data: BaseQueryResponse<FIN15010Data> = {
        TotalCount: 2,
        Data: [{
          Sequence: 1,
          FormatCode: 'A01',
          Character: 'AB',
          InvoiceNumber: '12345678',
          InvoiceDate: '2025-07-01',
          DataYearMonth: '202507',
          DeclareYearMonth: '202507',
          SellerUniform: '12345678',
          BuyerUniform: '87654321',
          InvoiceAmount: 5000,
          InvoiceTax: 250,
          DeductionAmount: 5250,
          InvoiceType: '01',
          InvoiceUsage: '1',
          CarrierType: 'C',
          CarrierNumber: '10001',
          BuildDate: '2025-07-01',
          PrintType: '合併列印',
          SystemType: 'S1'
        }, {
          Sequence: 2,
          FormatCode: 'A01',
          Character: 'CD',
          InvoiceNumber: '87654321',
          InvoiceDate: '2025-07-02',
          DataYearMonth: '202507',
          DeclareYearMonth: '202507',
          SellerUniform: '87654321',
          BuyerUniform: '12345678',
          InvoiceAmount: 8000,
          InvoiceTax: 400,
          DeductionAmount: 8400,
          InvoiceType: '02',
          InvoiceUsage: '2',
          CarrierType: 'B',
          CarrierNumber: '20001',
          BuildDate: '2025-07-02',
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