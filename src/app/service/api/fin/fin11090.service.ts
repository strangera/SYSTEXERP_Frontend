import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { environment } from '../../../../environments/environment';

// --- FIN11090 查詢參數 Model 定義 ---
export interface FIN11090QueryRequest extends BaseQueryRequest {
  TXN_Date?: string;         // 銷售日期
  ECR_No?: string[];           // 收銀機號
  TXN_No?: string;           // 交易序號
  TXN_GUITrack?: string;     // 字軌
  TXN_GUINo?: string;        // 發票號碼
}

// --- FIN11090 查詢回應 Model 定義 ---
export interface FIN11090Data {
  id?: number;               // ID
  TXN_Date?: string;         // 銷售日期
  ECR_No?: string;           // 收銀機號
  TXN_No?: number;           // 交易序號
  TXN_GUINo?: string;        // 發票號碼
  TXN_SaleAmt?: number;      // 銷售金額
  INV_RCancel?: string;      // 開立狀態
  SaleReturn_Status?: string; // 折讓狀態
  TXN_VoidDT?: string;       // 作廢日期
}

@Injectable({
  providedIn: 'root'
})
export class Fin11090Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/INV1000`;

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN11090(payload: FIN11090QueryRequest): Observable<BaseQueryResponse<FIN11090Data>> {
    // return this.http.post<BaseQueryResponse<FIN11090Data>>(`${this.apiUrl}/queryFIN11090`, payload);

    // 回傳模擬資料
    return of({
      Data: [
        {
          id: 10,
          TXN_Date: '2023-10-01',
          ECR_No: 'ECR001',
          TXN_No: 1001,
          TXN_GUINo: 'INV12345',
          TXN_SaleAmt: 1500,
          INV_RCancel: 'Y',
          SaleReturn_Status: 'Y',
          TXN_VoidDT: ''
        },
        {
          id: 20,
          TXN_Date: '2023-10-01',
          ECR_No: 'ECR002',
          TXN_No: 1002,
          TXN_GUINo: 'INV12346',
          TXN_SaleAmt: 2500,
          INV_RCancel: 'Y',
          SaleReturn_Status: 'N',
          TXN_VoidDT: '2023-10-02'
        },
        {
          id: 30,
          TXN_Date: '2023-10-02',
          ECR_No: 'ECR001',
          TXN_No: 1003,
          TXN_GUINo: 'INV12347',
          TXN_SaleAmt: 3500,
          INV_RCancel: 'Y',
          SaleReturn_Status: 'Y',
          TXN_VoidDT: ''
        }
      ],
      TotalCount: 2,
      Status: '0000',
      Message: '查詢成功',
      TotalPage: 1
    });
  }
}