import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢 Request
export interface FIN29020QueryRequest extends BaseQueryRequest {
  DateFrom: string;              // 匯款日期(起)
  DateTo: string;                // 匯款日期(迄)
  BNK_No?: string;               // 匯款銀行代號
  VEN_No?: string;               // 廠客代號
  WslipNoFrom?: string;            // 匯款單號(起)
  WslipNoTo?: string;              // 匯款單號(迄)
  RmtStatus?: string;            // 匯款狀態
}

// 1. 最底層明細
export interface FIN29020Detail {
  WslipNo: string;
  BankInfo: string;
  RmtDate: string;
  VendorName: string;
  VendorBankNo: string;
  VendorBankNane: string;
  VendorAccNo: string;
  VendorAccName: string;
  PayAmount: number;
  RemitAmount: number;
}

// 2. 分組層級 (SubTotals 裡面的項目)
export interface FIN29020SubTotal {
  RmtDate: string;
  SubTotal_PayAmount: number;
  SubTotal_RemitAmount: number;
  fIN29020_Details: FIN29020Detail[];
}

// 3. API Data 回傳的結構 (包含總計與列表)
export interface FIN29020Result {
  Total_PayAmount: number;    // API 提供的總金額
  Total_RemitAmount: number;  // API 提供的總金額
  fIN29020_SubTotals: FIN29020SubTotal[];
}

// 4. 完整的 Response (Data 為單一物件)
export interface FIN29020QueryResponse {
  Status: string;
  Data: FIN29020Result;       // 這裡是物件
  TotalCount?: number;
  TotalPage?: number;
}

@Injectable({ providedIn: 'root' })
export class FIN29020Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private http: HttpClient) { }

  /** 查詢匯款明細表 */
  queryFIN29020(req: FIN29020QueryRequest): Observable<FIN29020QueryResponse> {
    return this.http.post<FIN29020QueryResponse>(`${this.apiUrl}/queryFIN29020`, req);
  }

  /** 匯出匯款明細表 */
  exportFIN29020(req: FIN29020QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN29020`, req, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出匯款明細表 PDF */
  exportFIN29020PDF(req: FIN29020QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN29020PDF`, req, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }
}