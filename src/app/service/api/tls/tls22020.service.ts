// src/app/service/api/tls/tls22020.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TLS22020Request {
  // 如果有查詢條件，請補上欄位；目前為空
}

export interface TLS22020Response {
  Status: string;
  Data: TLS22020Item[];
  Error?: {
    Code: string;
    Message: string;
    Details: string;
  };
  Meta?: {
    Timestamp: string;
    RequestId: string;
  };
  Message?: string;
  TotalCount: number;
  TotalPage: number;
}

export interface TLS22020Item {
  ECR_No: string;
  tlt_no: string;
  tlt_name: string;
  pay_NoDataList: PayNoData[];
}

export interface PayNoData {
  Pay_No: string;
  Pay_Name: string;
  TXN_PayAmt: number;
  SLE_PayAmt: number;
  Diff_PayAmt: number;
}

@Injectable({
  providedIn: 'root'
})
export class TLS22020Service {
  private apiUrl = '/TLS0000/TLS2000/queryTLS22020';

  constructor(private http: HttpClient) {}

  getReport(body: TLS22020Request): Observable<TLS22020Response> {
    return this.http.post<TLS22020Response>(this.apiUrl, body);
  }
}
