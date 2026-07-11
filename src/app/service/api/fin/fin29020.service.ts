import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢 Request
export interface FIN29020QueryRequest extends ApiRequest {
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
export interface FIN29020ProcessedResponse {
  Status: string;
  Data: FIN29020Detail[];       // 所有的明細 (List)
  SubTotals: any[];             // 所有的分組小計 (List)
  Totals: {                     // 總計物件
    PayAmount: number;
    RemitAmount: number;
  };
  TotalCount: number;
}
@Injectable({ providedIn: 'root' })
export class FIN29020Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private http: HttpClient) { }

  /** 查詢匯款明細表 - 包含資料預處理 *//** 查詢匯款明細表 - 包含資料預處理 */
  queryFIN29020(req: FIN29020QueryRequest): Observable<FIN29020ProcessedResponse> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN29020`, req).pipe(
      map(res => {
        const rawResponse = Array.isArray(res) ? res[0] : res;
        let rawData = rawResponse.Data;
        if (Array.isArray(rawData)) {
          rawData = rawData[0] || {};
        } else {
          rawData = rawData || {};
        }
        const rawSubTotals = rawData.fIN29020_SubTotals || rawData.FIN29020_SubTotals || [];
        const allDetails = rawSubTotals.flatMap((sub: any) =>
          sub.fIN29020_Details || sub.FIN29020_Details || []
        );
        const subTotals = rawSubTotals.map((sub: any) => ({
          RmtDate: sub.RmtDate,
          PayAmount: sub.SubTotal_PayAmount ?? 0,
          RemitAmount: sub.SubTotal_RemitAmount ?? 0,
        }));
        const totals = {
          PayAmount: rawData.Total_PayAmount ?? 0,
          RemitAmount: rawData.Total_RemitAmount ?? 0
        };

        return {
          Status: rawResponse.Status,
          Data: allDetails,
          SubTotals: subTotals,
          Totals: totals,
          TotalCount: rawResponse.TotalCount ?? allDetails.length
        };
      })
    );
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
