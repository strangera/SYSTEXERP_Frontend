import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

export type SortItem = { field: string; order: number };

/** ========== Query (列表) ========== */
export interface QueryFIN63030Request {
  PageSize?: number | null;
  PageIndex?: number | null;
  SortBy?: SortItem[] | null;

  CompanyAccNo?: string | null;     // BNK_DepositAccNo
  ExpireDateFrom?: string | null;   // yyyy-MM-dd
  ExpireDateTo?: string | null;     // yyyy-MM-dd
  ChkNo?: string | null;            // 模糊
  VouNoPaid?: string | null;        // 模糊
  CheckStatus?: string | null;      // 1/2/3

  // 兼容可能帶的小寫 key
  pageSize?: number | null;
  pageIndex?: number | null;
  orderBy?: string | null;
  offset?: number | null;

  OrderBy?: string | null;
  Offset?: number | null;

  [key: string]: any;
}

export interface QueryFIN63030Row {
  TotalCount?: number;
  RowNo?: number;

  CheckNo?: string;
  VendorNo?: string;
  VEN_Name?: string;

  CompanyAccNo?: string;
  CompanyAccName?: string;

  IssueDate?: string | null;   // yyyy/MM/dd (SP 已 FORMAT)
  ExpireDate?: string | null;  // yyyy/MM/dd
  PayDate?: string | null;     // yyyy/MM/dd

  CheckAmount?: number | null;

  CheckStatus?: string | null;       // 1/2/3
  CheckStatusName?: string | null;   // 未異動/到期/兌現

  VoucherNoPaid?: string | null;
  VoucherNoIssued?: string | null;

  [key: string]: any;
}

/** ========== 到期拋轉傳票（✅ 對齊後端 TransVoucherFIN63030Request） ========== */
export interface FIN63030TransVoucherRequest {
  ExpireDateFrom: string;           // 必填 yyyy-MM-dd
  ExpireDateTo: string;             // 必填 yyyy-MM-dd
  ChkNo?: string | null;            // 可空 = 整批
  BNK_No?: string | null;           // 可空（後端 MaxLength 10，但非 Required）

  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class Fin63030Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;

  constructor(private http: HttpClient) {}

  /** 查詢列表 */
  queryFIN63030(body: QueryFIN63030Request): Observable<ApiResponse<QueryFIN63030Row[]>> {
    return this.http.post<ApiResponse<QueryFIN63030Row[]>>(
      `${this.apiUrl}/queryFIN63030`,
      body
    );
  }

  /** 到期拋轉傳票（✅ URL 大小寫對齊後端：TransVoucherFIN63030） */
  transVoucherFIN63030(body: FIN63030TransVoucherRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/TransVoucherFIN63030`,
      body
    );
  }

  /** 匯出 Excel（後端：exportFIN63030） */
  exportFIN63030Excel(body: QueryFIN63030Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN63030`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF（後端：exportFIN63030PDF） */
  exportFIN63030PDF(body: QueryFIN63030Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN63030PDF`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({ Accept: 'application/pdf' }),
    }) as Observable<HttpResponse<Blob>>;
  }

  private stripPaging<T extends Record<string, any>>(
    input: T
  ): Omit<
    T,
    | 'PageSize' | 'PageIndex' | 'OrderBy' | 'Offset'
    | 'pageSize' | 'pageIndex' | 'orderBy' | 'offset'
  > {
    if (!input) return input as any;

    const {
      PageSize, PageIndex, OrderBy, Offset,
      pageSize, pageIndex, orderBy, offset,
      ...rest
    } = input as any;

    return rest as any;
  }
}

export { ApiResponse };
