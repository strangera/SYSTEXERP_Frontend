import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// --- FIN15060 查詢參數 Model 定義 ---
export interface FIN15060QueryRequest extends BaseQueryRequest {
  DeclareYearMonth: string;           // 申報年月
  TaxCode: string;                    // 稅籍編號
}

// --- FIN15060 回應資料 Model 定義 ---
export interface FIN15060Data {
  InvoiceDate: string;                // 開立發票(日期)
  InvoiceNumber: string;              // 開立發票(字軌號碼)
  BuyerName: string;                  // 買受人(名稱)
  BuyerUniform: string;               // 買受人(統一編號)
  ItemName: string;                   // 貨物或勞務(名稱)
  ItemQty: number;                    // 貨物或勞務(數量)
  ExportType: string;                 // 外銷方式
  ProofDocName: string;               // 證明文件(名稱)
  ProofDocNumber: string;             // 證明文件(號碼)
  ProofDocAmount: number;             // 證明文件(金額)
  ExportDeclType: string;             // 出口報單(類別)
  ExportDeclNumber: string;           // 出口報單(號碼)
  ExportDeclAmount: number;           // 出口報單(金額)
}

@Injectable({
  providedIn: 'root'
})
export class FIN15060Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1560';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN15060(data: FIN15060QueryRequest): Observable<BaseQueryResponse<FIN15060Data>> {
    // return this.http.post<BaseQueryResponse<FIN15060Data>>(`${this.apiUrl}/queryFIN15060`, data);

    // 回傳假資料
    return new Observable<BaseQueryResponse<FIN15060Data>>(observer => {
      const Data: BaseQueryResponse<FIN15060Data> = {
        TotalCount: 2,
        Data: [
          {
            InvoiceDate: '2025-07-01',
            InvoiceNumber: 'AB12345678',
            BuyerName: '台灣科技公司',
            BuyerUniform: '12345678',
            ItemName: '電子零組件',
            ItemQty: 100,
            ExportType: '直接外銷',
            ProofDocName: '報關單',
            ProofDocNumber: 'D2026070001',
            ProofDocAmount: 600000,
            ExportDeclType: '出口',
            ExportDeclNumber: 'EXP202607001',
            ExportDeclAmount: 600000
          },
          {
            InvoiceDate: '2025-07-05',
            InvoiceNumber: 'CD87654321',
            BuyerName: '國際貿易行',
            BuyerUniform: '87654321',
            ItemName: '機械設備',
            ItemQty: 10,
            ExportType: '間接外銷',
            ProofDocName: '裝箱單',
            ProofDocNumber: 'P2026070002',
            ProofDocAmount: 1200000,
            ExportDeclType: '出口',
            ExportDeclNumber: 'EXP202607002',
            ExportDeclAmount: 1200000
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