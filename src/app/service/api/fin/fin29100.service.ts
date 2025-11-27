import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢請求介面
export interface QueryFIN29100Request extends BaseQueryRequest {
  TxnDate_From?: string;     // 匯款/開票/調撥日期起
  TxnDate_To?: string;       // 匯款/開票/調撥日期迄
  BNK_No?: string;           // 銀行代號
  DocNo_From: string;       // 匯款/開票/調撥單號起
  DocNo_To: string;         // 匯款/開票/調撥單號迄
  TxnType?: string;          // 型態
}

// 查詢結果資料介面
export interface FIN29100Data {
  Seqno: number;
  TxnType: string;
  TxnDocumentNo: string;
  TxnDate: string;
  VendorNo: string;
  TxnAmount: number;
  TxnFee: number;
  PaymentBank: string;
  CheckNo: string;
  CheckExpireDate: string;
}

@Injectable({ providedIn: 'root' })
export class FIN29100Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private http: HttpClient) { }

  queryFIN29100(data: QueryFIN29100Request): Observable<BaseQueryResponse<FIN29100Data>> {
    return this.http.post<BaseQueryResponse<FIN29100Data>>(`${this.apiUrl}/queryFIN29100`, data);
  }

  exportFIN29100_PDF(data: QueryFIN29100Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN29100PDF`, data, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  exportFIN29100_Excel(data: QueryFIN29100Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN29100Excel`, data, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}