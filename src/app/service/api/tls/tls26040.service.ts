import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface TLS26040QueryRequest {
  preOrderDateFrom: string;      // 預售日期(起始)
  preOrderDateTo: string;        // 預售日期(截止)
  settlementDateFrom: string;    // 結帳日期(起始)
  settlementDateTo: string;      // 結帳日期(截止)
  receivingMachineNo: string;    // 收銀機號
  counterCode: string;           // 專櫃編號
  batchNo: string;               // 批號
}

export interface TLS26040Data {
  serialNo: number;           // 序號
  preOrderDate: string;       // 預售日期
  settlementDate: string;     // 結帳日期
  receivingMachineNo: string; // 收銀機機號
  counterCode: string;        // 櫃別編號
  counterName: string;        // 櫃位名稱
  batchNo: string;            // 批號
  transactionNo: string;      // 交易序號
  amount: number;             // 金額
}

export interface TLS26040QueryRequest2 {
  preOrderDateFrom: string;      // 預售日期(起)
  preOrderDateTo: string;        // 預售日期(訖)
  transactionNo: string;         // 交易序號
  receivingMachineNo: string;    // 收銀機號
  counterCode: string;           // 專櫃編號
}

export interface TLS26040Data2 {
  preOrderDate: string;        // 預售日期
  counterCode: string;         // 櫃別編號
  receivingMachineNo: string;  // 收銀機機號
  transactionNo: string;       // 交易序號
  amount: number;              // 來源金額
}


@Injectable({
  providedIn: 'root'
})
export class TLS26040Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryTLS26040(data: TLS26040QueryRequest): Observable<BaseQueryResponse<TLS26040Data>> {
    // return this.http.post<BaseQueryResponse<TLS26040Data>>(`${this.apiUrl}/queryTLS26040`, data);

    // 回傳假資料
    return of({
      Status: '0000',
      TotalCount: 1,
      Data: [{
        serialNo: 1,
        preOrderDate: '2023-10-01',
        settlementDate: '2023-10-02',
        receivingMachineNo: 'RM001',
        counterCode: 'C001',
        counterName: '櫃位A',
        batchNo: 'BATCH001',
        transactionNo: 'TXN001',
        amount: 1000
      }],
      Message: '成功',
      TotalPage: 1
    });
  }

  // 查詢未設定結帳日期之資料
  queryTLS26040_2(data: TLS26040QueryRequest2): Observable<BaseQueryResponse<TLS26040Data2>> {
    // return this.http.post<BaseQueryResponse<TLS26040Data>>(`${this.apiUrl}/queryTLS26040`, data);

    // 回傳假資料
    return of({
      Status: '0000',
      TotalCount: 1,
      Data: [{
        preOrderDate: '2020/10/15',
        counterCode: '000092',
        receivingMachineNo: '0000921',
        transactionNo: '041375',
        amount: 50200
      }],
      Message: '成功',
      TotalPage: 1
    });
  }
}
