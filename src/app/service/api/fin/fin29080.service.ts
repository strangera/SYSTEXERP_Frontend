import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢 Request
export interface FIN29080QueryRequest extends BaseQueryRequest {
  ACP_Date_From: string;              // 立帳日期(起) - 必填
  ACP_Date_To: string;                // 立帳日期(迄) - 必填
  ACP_ExpectPayDate_From?: string;    // 預計付款日(起)
  ACP_ExpectPayDate_To?: string;      // 預計付款日(迄)
}

// 明細 Row
export interface FIN29080Data {
  ExpectedPayDate: string | null;     // 預計付款日
  PayableAmount: number | null;       // 應付金額
  WithholdAmount: number | null;      // 代扣款項
  DiscountInterest: number | null;    // 貼現利息
  EstimatedPayable: number | null;    // 預估應付款
}

@Injectable({ providedIn: 'root' })
export class FIN29080Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private http: HttpClient) { }

  /** 查詢應付帳款預估表 */
  queryFIN29080(req: FIN29080QueryRequest): Observable<BaseQueryResponse<FIN29080Data>> {
    return this.http.post<BaseQueryResponse<FIN29080Data>>(`${this.apiUrl}/queryFIN29080`, req);
  }

  /** 匯出應付帳款預估表 Excel */
  exportFIN29080Excel(req: FIN29080QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN29080Excel`, req, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出應付帳款預估表 PDF */
  exportFIN29080PDF(req: FIN29080QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN29080PDF`, req, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }
}