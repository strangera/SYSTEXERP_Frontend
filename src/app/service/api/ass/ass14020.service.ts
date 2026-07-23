import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// 查詢請款關帳作業 回應
export interface queryASS14020Response {
  ID: number | null;
  MID: number | null;
  STO_NO: string | null;
  RECEIPT_INS_ID: string | null;
  NTX_AMT: number | null;
  TX_AMT: number | null;
  AMT: number | null;
}

export interface queryASS14020Result {
  TotalCount: number;
  QueryData: queryASS14020Response[] | null;
}

// 建立請款關帳進貨傳票 請求
export interface closeASS14020ReceiptInvoiceItem {
  ReceiptInsId: string;
  NoTaxAmt: number;
  TaxAmt: number;
}

export interface closeASS14020Request {
  CloseDate: string;
  ReceiptInvoices: closeASS14020ReceiptInvoiceItem[];
}

export interface closeASS14020Response {
  VouNo: string | null;
}

export interface closeASS14020Result {
  VoucherList: closeASS14020Response[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class Ass14020Service {
  // 請款關帳作業
  apiUrl: string = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  // 查詢請款關帳作業
  queryASS14020(): Observable<ApiResponse<queryASS14020Result>> {
    return this.http.post<ApiResponse<queryASS14020Result>>(`${this.apiUrl}/queryASS14020`, {});
  }

  // 建立請款關帳進貨傳票
  closeASS14020(body: closeASS14020Request): Observable<ApiResponse<closeASS14020Result>> {
    return this.http.post<ApiResponse<closeASS14020Result>>(`${this.apiUrl}/closeASS14020`, body);
  }
}
