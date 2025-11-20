import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢 Request
export interface FIN29020QueryRequest extends BaseQueryRequest {
  DateFrom: string;              // 匯款日期(起)
  DateTo: string;                // 匯款日期(迄)
  BNK_No?: string;               // 匯款銀行代號
  VEN_No?: string;               // 廠客代號
  PamNoFrom?: string;            // 匯款單號(起)
  PamNoTo?: string;              // 匯款單號(迄)
  RmtStatus?: string;            // 匯款狀態
}

// 明細 Row
export interface FIN29020Data {
  STO_No: string | null;                    // 分店編號
  PAM_No: string | null;                    // 匯款單號
  RMT_Date: string | null;                  // 匯款日期
  VEN_No: string | null;                    // 廠商代號
  VEN_Name: string | null;                  // 廠商名稱
  CompanyBNK_No: string | null;             // 匯款銀行代號
  CompanyBNK_Name: string | null;           // 匯款銀行名稱
  CompanyBNK_BranchNo: string | null;       // 匯款銀行分行代號
  CompanyBNK_AccNo: string | null;          // 銀行帳號
  VendorBNK_No: string | null;              // 解款銀行代號
  VendorBNK_Name: string | null;            // 解款銀行名稱
  VendorBNK_BranchNo: string | null;        // 解款銀行分行代號
  VendorBNK_AccNo: string | null;           // 解款帳號
  VendorBNK_AccName: string | null;         // 帳戶名稱
  Pay_TotNet: number | null;                // 帳款金額
  RMT_Amt: number | null;                   // 匯款金額
  RMT_Fee: number | null;                   // 匯款手續費
  RMT_Status: string | null;                // 匯款狀態(0=未確認 1=已確認)
  RMT_ExpMediaCnt: number | null;           // 媒體匯出次數
}

@Injectable({ providedIn: 'root' })
export class FIN29020Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private http: HttpClient) { }

  /** 查詢匯款明細表 */
  queryFIN29020(req: FIN29020QueryRequest): Observable<BaseQueryResponse<FIN29020Data>> {
    return this.http.post<BaseQueryResponse<FIN29020Data>>(`${this.apiUrl}/queryFIN29020`, req);
  }

  /** 匯出匯款明細表 */
  exportFIN29020(req: FIN29020QueryRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/exportFIN29020`, req);
  }

  /** 匯出匯款明細表 PDF */
  exportFIN29020PDF(req: FIN29020QueryRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/exportFIN29020PDF`, req);
  }
}