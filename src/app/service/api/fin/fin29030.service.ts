import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FIN29030Detail {
  PAM_No: string; // 付款編號
  CHK_No: string; // 支票號碼
  TicketStatusName: string; // 票據狀態
  PaymentBank: string; // 付款銀行
  IssueDate: Date; // 開票日期
  ExpireDate: Date; // 到期日
  VenNo: string; // 廠客代號
  VenName: string; // 廠客名稱
  TicketAmt: number // 票面金額/小計金額
}

// 2. 分組層級 (SubTotals 裡面的項目)
export interface FIN29030SubTotal {
  PAM_No: string;
  SummaryText: string;
  SubTotalTicketAmt: number;
  fIN29020_Details: FIN29030Detail[];
}

// 3. API Data 回傳的結構 (包含總計與列表)
export interface FIN29030Result {
  TotalCount: number;
  TotalPage: number;
  PageIndex: number;
  PageSize: number
  TotalTicketAmt: number;    // API 提供的總金額
  fIN29020_SubTotals: FIN29030SubTotal[];
}

// 4. 完整的 Response (Data 為單一物件)
export interface FIN29030QueryResponse {
  Status: string;
  Data: FIN29030Result;       // 這裡是物件
  TotalCount?: number;
  TotalPage?: number;
}

export interface FIN29030ProcessedResponse {
  Status: string;
  Data: FIN29030Detail[];       // 所有的明細 (List)
  SubTotals: any[];             // 所有的分組小計 (List)
  Totals: {                     // 總計物件
    TicketAmt: number;
  };
  TotalCount: number;
}


@Injectable({
  providedIn: 'root'
})
export class Fin29030Service {
  // 開票明細表
  apiUrl: string = environment.ApiUrl + '/FIN0000/APS1000';
  constructor(private http: HttpClient) { }
  /** 查詢開票明細表 - 包含資料預處理 *//** 查詢匯款明細表 - 包含資料預處理 */
  queryFIN29030(req: any): Observable<FIN29030ProcessedResponse> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN29030`, req).pipe(
      map(res => {
        const rawResponse = Array.isArray(res) ? res[0] : res;
        let rawData = rawResponse.Data;
        if (Array.isArray(rawData)) {
          rawData = rawData[0] || {};
        } else {
          rawData = rawData || {};
        }
        const rawSubTotals = rawData.fIN29030SubTotals || [];
        const allDetails = rawSubTotals.flatMap((sub: any) => sub.fIN29030Details || []);
        const subTotals = rawSubTotals.map((sub: any) => ({
          PAM_No: sub.PAM_No ?? 0,
          SummaryText: sub.SummaryText,
          TicketAmt: sub.SubTotalTicketAmt ?? 0,
        }));

        const totals = {
          TicketAmt: rawData.TotalTicketAmt ?? 0,
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

  // 匯出 開票明細表 PDF
  exportPDFFIN29030(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFFIN29030`, body, { responseType: 'blob' });
  }

  // 匯出 開票明細表 Excel
  exportExcelFIN29030(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportExcelFIN29030`, body, { responseType: 'blob' });
  }
}
