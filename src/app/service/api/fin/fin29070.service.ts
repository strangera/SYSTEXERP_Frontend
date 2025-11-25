import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢 Request
export interface FIN29070QueryRequest extends BaseQueryRequest {
  VEN_No_From: string;           // 廠商代號(起)
  VEN_No_To: string;             // 廠商代號(迄)
  ODM_Date_From: string;          // 立帳日期(起) - 必填
  ODM_Date_To: string;            // 立帳日期(迄) - 必填
}

// 明細 Row
export interface FIN29070Data {
  VendorNo: string | null;        // 廠商代號
  PostingDate: string | null;     // 立帳日期
  APAccountNo: string | null;     // 應付科目
  VoucherNo: string | null;       // 對應傳票號碼
  CompanyNo: string | null;       // 組織代號
  RelatedAccNo: string | null;    // 對應科目代號
  Description: string | null;     // 摘要
  Amount: number | null;          // 金額
}

@Injectable({ providedIn: 'root' })
export class FIN29070Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';

  constructor(private http: HttpClient) { }

  /** 查詢廠商應付對應科目明細表 */
  queryFIN29070(req: FIN29070QueryRequest): Observable<BaseQueryResponse<FIN29070Data>> {
    return this.http.post<BaseQueryResponse<FIN29070Data>>(`${this.apiUrl}/queryFIN29070`, req);
  }

  /** 匯出廠商應付對應科目明細表 Excel */
  exportFIN29070Excel(req: FIN29070QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN29070Excel`, req, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出廠商應付對應科目明細表 PDF */
  exportFIN29070PDF(req: FIN29070QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportFIN29070PDF`, req, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }
}