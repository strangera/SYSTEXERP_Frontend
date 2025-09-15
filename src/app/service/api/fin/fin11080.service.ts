import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

// --- 查詢參數 Model 定義 ---
export interface FIN11080QueryRequest extends BaseQueryRequest {
  MID: number;             // 固定為0
  SYS_StoreNo: string;     // 固定為'10'
  TXN_Date_Start: string;  // 銷售日期_起 (ISO字串)
  TXN_Date_End: string;    // 銷售日期_訖 (ISO字串)
}

// --- 重號明細查詢參數 Model 定義 ---
export interface FIN11080DetailQueryRequest extends BaseQueryRequest {
  MID: number;             // 固定為0
  SYS_StoreNo: string;     // 店號
  TXN_Date: string;        // 交易日期 (ISO字串)
}

// --- 回應資料 Model 定義 ---
export interface FIN11080Data {
  MID: number;
  SYS_StoreNo: string;
  TXN_Date: string;                     // 交易日期
  TxnCount_Normal_A: number;            // 一般交易(A)
  TxnCount_VoidOrReturn_B: number;      // 作廢退貨(B)
  TxnCount_Cancelled_C: number;         // 註銷(C)
  ActualInv_Normal_AD: number;          // 當日正負(A-D)
  ActualInv_CrossPeriodReturn_B: number;// 跨期作廢退貨(B-D-E)
  ActualInv_Cancelled: number;          // 註銷
  CNT?: string;                         // 發票是否重號
}

// --- 重號明細回應資料 Model 定義 ---
export interface FIN11080DetailData {
  TXN_Date: string;        // 交易日期
  ECR_No: string;          // 收銀機號
  TXN_No: number;          // 交易序號
  TXN_GUINo: string;       // 發票號碼
}

@Injectable({
  providedIn: 'root'
})
export class FIN11080Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 查詢電子發票筆數核對表
  queryFIN11080(params: FIN11080QueryRequest): Observable<BaseQueryResponse<FIN11080Data>> {
    return this.http.post<BaseQueryResponse<FIN11080Data>>(`${this.apiUrl}/queryFIN11080`, params);
  }

  // 查詢電子發票筆數核對表_顯示重號明細
  queryFIN11080_Detail(params: FIN11080DetailQueryRequest): Observable<BaseQueryResponse<FIN11080DetailData>> {
    return this.http.post<BaseQueryResponse<FIN11080DetailData>>(`${this.apiUrl}/queryFIN11080_Detail`, params);
  }
}