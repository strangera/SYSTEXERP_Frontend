import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';

// --- TLS26040 查詢 Model 定義 ---
export interface TLS26040QueryRequest extends BaseQueryRequest {
  sad_date_start?: string;         // 銷售日期_起
  sad_date_end?: string;           // 銷售日期_迄
  tlt_noList?: string[];           // 專櫃編號清單
  sad_preorder_date_start?: string;// 預購業值入帳日_起
  sad_preorder_date_end?: string;  // 預購業值入帳日_迄
  batch_no?: string;               // 預售業值歸屬批號
  IsNotlt_no?: string;             // 篩選條件
}

// --- TLS26040 查詢插入 Model 定義 ---
export interface TLS26040QueryInsertRequest {
  sad_date_start?: string;         // 銷售日期_起
  sad_date_end?: string;           // 銷售日期_迄
  tlt_noList?: string[];           // 專櫃編號清單
  IsNotlt_no?: string;             // 篩選條件
}

// --- TLS26040 明細查詢 Model 定義 ---
export interface TLS26040DetailRequest extends BaseQueryRequest {
  sad_date?: string;               // 銷售日期
  tlt_no?: string;                 // 專櫃編號
}

// --- TLS26040 新增 Model 定義 ---
export interface TLS26040InsertRequest {
  sad_preorder_date?: string;      // 預購業值入帳日
  idList?: number[];               // ID清單
  sad_date_start?: string,        // 銷售日期_起
  sad_date_end?: string,      // 銷售日期_迄
}

// --- TLS26040 回應資料 Model 定義 ---
export interface TLS26040Data {
  id: number;
  sad_date: string;
  sad_preorder_date: string;
  tlt_no: string;
  tlt_name: string;
  batch_no: string;
  sad_preorder_amt: number;
  details?: any[];  // 展開的詳細資料
}

// --- TLS26040 明細回應資料 Model 定義 ---
export interface TLS26040DetailData {
  TXN_Date: string;                // 預售日期
  ECR_No: string;                  // 收銀機號
  TXN_No: number;                  // 交易序號
  TXN_TotSaleAmt: number;          // 業績金額
  TLT_No: string;                  // 專櫃編號
  tlt_name: string;                // 專櫃名稱
}

@Injectable({
  providedIn: 'root'
})
export class TLS26040Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢SALCHARGEM資料表
  queryTLS26040(data: TLS26040QueryRequest): Observable<BaseQueryResponse<TLS26040Data>> {
    return this.http.post<BaseQueryResponse<TLS26040Data>>(`${this.apiUrl}/queryTLS26040`, data);

    // 回傳假資料
    return new Observable<BaseQueryResponse<TLS26040Data>>(observer => {
      const Data: BaseQueryResponse<TLS26040Data> = {
        TotalCount: 2,
        Data: [
          {
            id: 1,
            sad_date: '2025-08-01',
            tlt_no: 'TLT001',
            tlt_name: '專櫃一',
            sad_preorder_date: '2025-07-25',
            sad_preorder_amt: 150000,
            batch_no: 'BATCH2025001'
          },
          {
            id: 2,
            sad_date: '2025-08-02',
            tlt_no: 'TLT002',
            tlt_name: '專櫃二',
            sad_preorder_date: '2025-07-26',
            sad_preorder_amt: 200000,
            batch_no: 'BATCH2025002'
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

  // 查詢SALCHARGEM資料表(插入用)
  queryTLS26040Insert(data: TLS26040QueryInsertRequest): Observable<BaseQueryResponse<TLS26040Data>> {
    return this.http.post<BaseQueryResponse<TLS26040Data>>(`${this.apiUrl}/queryTLS26040_insert`, data);
  }

  // 查詢預售明細(POS5006)資料
  queryTLS26040Detail(data: TLS26040DetailRequest): Observable<BaseQueryResponse<TLS26040DetailData>> {
    return this.http.post<BaseQueryResponse<TLS26040DetailData>>(`${this.apiUrl}/queryTLS26040_Detail`, data);
  }

  // 新增預售資料
  insertTLS26040(data: TLS26040InsertRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS26040`, data);
  }
}