import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from '../../../../environments/environment';
// --- TLS26040 查詢 Model 定義 ---
export interface TLS26040QueryRequest extends ApiRequest {
  sad_date_start?: string;         // 預售日期_起
  sad_date_end?: string;           // 預售日期_迄
  tlt_noList?: string[];           // 專櫃編號清單
  ECR_NoList?: string[];           // 收銀機號清單 (新增)
  sad_preorder_date_start?: string;// 預購業值入帳日_起
  sad_preorder_date_end?: string;  // 預購業值入帳日_迄
  batch_no?: string;               // 預售業值歸屬批號
}

// --- TLS26040 查詢插入 Model 定義 ---
export interface TLS26040QueryInsertRequest {
  sad_date_start?: string;         // 預售日期_起
  sad_date_end?: string;           // 預售日期_迄
  ECR_NoList?: string[];           // 收銀機號清單 (新增)
  tlt_noList?: string[];           // 專櫃編號清單
  IsNotlt_no?: string;             // 篩選條件
}

// --- TLS26040 明細查詢 Model 定義 ---
export interface TLS26040DetailRequest extends ApiRequest {
  sad_date?: string;               // 預售日期
  tlt_no?: string;                 // 專櫃編號
}

// --- TLS26040 新增 Model 定義 ---
export interface TLS26040InsertRequest {
  sad_preorder_date?: string;      // 預購業值入帳日
  sad_date_start?: string;         // 預售日期_起
  sad_date_end?: string;           // 預售日期_迄
  idList?: number[];               // ID清單
}

// --- TLS26040 還原 Model 定義 --- (新增)
export interface TLS26040RevertRequest {
  id: number;                      // ID
}

// --- TLS26040 回應資料 Model 定義 ---
export interface TLS26040Data {
  id: number;
  sad_date: string;
  sad_preorder_date: string;
  tlt_no: string;
  tlt_name: string;
  batch_no: string;
  talent_id: string;
  TXN_TotSaleAmt: number;          // 修正欄位名稱
  isClose: string;                 // 是否已關帳
  details?: any[];  // 展開的詳細資料
  rowKey?: string;  // 前端組合鍵 (sad_date_tlt_no_batch_no)，供表格展開/選取識別
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
  queryTLS26040(data: TLS26040QueryRequest): Observable<ApiResponse<TLS26040Data[]>> {
    return this.http.post<ApiResponse<TLS26040Data[]>>(`${this.apiUrl}/queryTLS26040`, data);
  }

  // 查詢SALCHARGEM資料表(插入用)
  queryTLS26040Insert(data: TLS26040QueryInsertRequest): Observable<ApiResponse<TLS26040Data[]>> {
    return this.http.post<ApiResponse<TLS26040Data[]>>(`${this.apiUrl}/queryTLS26040_insert`, data);
  }

  // 查詢預售明細(POS5006)資料
  queryTLS26040Detail(data: TLS26040DetailRequest): Observable<ApiResponse<TLS26040DetailData[]>> {
    return this.http.post<ApiResponse<TLS26040DetailData[]>>(`${this.apiUrl}/queryTLS26040_Detail`, data);
  }

  // 新增預售資料
  insertTLS26040(data: TLS26040InsertRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS26040`, data);
  }

  // 還原預售資料 (新增)
  revertTLS26040(data: TLS26040RevertRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/RevertTLS26040`, data);
  }

  /** 匯出 Excel */
  exportExcelTLS26040(payload: TLS26040QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http
      .post(`${this.apiUrl}/exportTLS26040_Excel`, payload, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(take(1));
  }

  /** 匯出 PDF */
  exportPDFTLS26040(payload: TLS26040QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http
      .post(`${this.apiUrl}/exportTLS26040_PDF`, payload, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(take(1));
  }
}
