import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

// --- FIN13070 查詢參數 Model 定義 ---
export interface FIN13070QueryRequest extends ApiRequest {
  TXN_Date?: string;              // 發票日期
  ECR_NoList?: string[];          // 收銀機號清單
  TXN_GUINo_Start?: string;       // 發票號碼(起)
  TXN_GUINo_End?: string;         // 發票號碼(訖)
}

// --- FIN13070 回應資料 Model 定義 ---
export interface FIN13070Data {
  ID?: number;                    // ID
  TXN_Date?: string;              // 發票日期
  ECR_No?: string;                // 收銀機號
  TXN_No?: number;                // 交易序號
  TXN_GUINo?: string;             // 發票號碼
  TXN_SaleAmt?: number;           // 銷售金額
  INV_Cancel?: string;            // 發票狀態
  TXN_VoidDT?: string;            // 作廢日期
}

// --- FIN13070 更新請求參數 Model 定義 ---
export interface FIN13070UpdateRequest {
  selectList: { ID: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class FIN13070Service {

  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢作廢發票
  queryFIN13070(params: FIN13070QueryRequest): Observable<ApiResponse<FIN13070Data[]>> {
    return this.http.post<ApiResponse<FIN13070Data[]>>(`${this.apiUrl}/queryFIN13070`, params);

    // 模擬資料
    return of({
      Status: '0000',
      Data: [
        {
          ID: 1,
          TXN_Date: '2024-06-01',
          ECR_No: 'ECR001',
          TXN_No: 1001,
          TXN_GUINo: 'A123456789',
          TXN_SaleAmt: 1500,
          INV_Cancel: 'Y',
          TXN_VoidDT: '2024-06-02'
        },
        {
          ID: 2,
          TXN_Date: '2024-06-01',
          ECR_No: 'ECR002',
          TXN_No: 1002,
          TXN_GUINo: 'B987654321',
          TXN_SaleAmt: 2000,
          INV_Cancel: 'Y',
          TXN_VoidDT: '2024-06-02'
        },
        {
          ID: 3,
          TXN_Date: '2024-06-01',
          ECR_No: 'ECR003',
          TXN_No: 1003,
          TXN_GUINo: 'C192837465',
          TXN_SaleAmt: 1800,
          INV_Cancel: 'Y',
          TXN_VoidDT: '2024-06-02'
        }
      ],
      Message: '成功',
      TotalCount: 3,
      TotalPage: 1
    });
  }

  // 發票取消作廢更新
  updateFIN13070(params: FIN13070UpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN13070`, params);

    // 模擬成功回應
    // return of({ Status: '0000', Message: '發票取消作廢成功' });
  }
}