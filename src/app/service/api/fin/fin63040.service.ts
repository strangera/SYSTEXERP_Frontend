import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

export interface SortItem {
  field: string;
  order: number; // 1 asc, -1 desc
}

/** ✅ 對齊 FIN63040Request.queryFIN63040Request */
export interface QueryFIN63040Request {
  PageSize?: number | null;
  PageIndex?: number | null;
  SortBy?: SortItem[] | null;

  ChkNo?: string | null;
  CompanyAccNo?: string | null;

  ExpireDateFrom?: string | null;
  ExpireDateTo?: string | null;
  PayDateFrom?: string | null;
  PayDateTo?: string | null;

  // 兼容你們 BasicQueryPageComponent 可能丟的小寫 key
  pageSize?: number | null;
  pageIndex?: number | null;
  orderBy?: string | null;
  offset?: number | null;

  OrderBy?: string | null;
  Offset?: number | null;

  [key: string]: any;
}

/** ✅ 對齊 FIN63040Response.queryFIN63040Response */
export interface QueryFIN63040Row {
  TotalCount?: number;

  CanPickupYn?: string | null; // Y/N
  RowNo?: string | null;

  CheckNo?: string | null;
  VendorNo?: string | null;
  VEN_Name?: string | null;

  CompanyAccNo?: string | null;
  CompanyAccName?: string | null;

  IssueDate?: string | null;
  ExpireDate?: string | null;
  PayDate?: string | null;

  CheckAmount?: number | null;
  CheckTitle?: string | null;

  NoEndorseYn?: string | null;
  Remark?: string | null;

  OrgId?: string | null;
  Org_Name?: string | null;

  CheckStatus?: string | null;
  StatusFlag?: string | null;

  PickupStatus?: string | null;
  PickupDate?: string | null;

  VoucherNoIssued?: string | null;
  VoucherNoPaid?: string | null;

  [key: string]: any;
}

/** ✅ 對齊 FIN63040Request.queryFIN63040DetailRequest */
export interface QueryFIN63040DetailRequest {
  ChkNo: string;
}

/** ✅ 對齊 FIN63040Response.queryFIN63040DetailResponse */
export interface QueryFIN63040DetailRow {
  CheckNo?: string | null;
  VendorNo?: string | null;
  VEN_Name?: string | null;

  CompanyAccNo?: string | null;
  CompanyAccName?: string | null;

  IssueDate?: string | null;
  ExpireDate?: string | null;
  PayDate?: string | null;

  CheckAmount?: number | null;
  CheckTitle?: string | null;

  NoEndorseYn?: string | null;
  Remark?: string | null;

  OrgId?: string | null;
  StatusFlag?: string | null;
  VouNo_paid?: string | null;

  CheckStatus?: string | null;
  PickupType?: string | null;
  PickupDate?: string | null;

  ProjectNo?: string | null;
  PamNo?: string | null;
  VoucherNoIssued?: string | null;

  [key: string]: any;
}

/** ✅ Repository 回傳 queryFIN63040DetailResult { ErrorMsg, QueryData } */
export interface QueryFIN63040DetailResult {
  ErrorMsg?: string | null;
  QueryData?: QueryFIN63040DetailRow | null;
}

/** ✅ 對齊 FIN63040Request.updateFIN63040Request */
export interface UpdateFIN63040Request {
  CheckNo: string;
  CheckTitle: string;
  Remark: string;
  NoEndorseYn: string; // Y/N
  StatusFlag: string;  // 1/2
  PickupType: string;  // 0/1/2
  PickupDate?: string | null;
  PayDate?: string | null;
  WithdrawDate?: string | null;
}

/** ✅ 對齊 FIN63040Request.updateFIN63040DetailRequest */
export interface UpdateFIN63040DetailRequest {
  PayDate: string;
  ChkNoList: string[];
}

@Injectable({ providedIn: 'root' })
export class Fin63040Service {
  private baseUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;

  constructor(private http: HttpClient) {}

  /** 查詢列表 */
  queryFIN63040(body: QueryFIN63040Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/queryFIN63040`, body);
  }

  /** 查詢明細 */
  queryFIN63040Detail(
    body: QueryFIN63040DetailRequest
  ): Observable<ApiResponse<QueryFIN63040DetailResult>> {
    return this.http.post<ApiResponse<QueryFIN63040DetailResult>>(
      `${this.baseUrl}/queryFIN63040Detail`,
      body
    );
  }

  /** 更新票據 */
  updateFIN63040(body: UpdateFIN63040Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/updateFIN63040`, body);
  }

  /** 支票兌現（多筆） */
  updateFIN63040Detail(body: UpdateFIN63040DetailRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/updateFIN63040Detail`, body);
  }

  /** 匯出 Excel（不分頁） */
  exportFIN63040Excel(body: QueryFIN63040Request): Observable<HttpResponse<Blob>> {
    const url = `${this.baseUrl}/exportFIN63040`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF（不分頁） */
  exportFIN63040PDF(body: QueryFIN63040Request): Observable<HttpResponse<Blob>> {
    const url = `${this.baseUrl}/exportFIN63040PDF`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /**
   * - 同時移除大小寫鍵：pageSize/pageIndex/orderBy/offset 與 PageSize/PageIndex/OrderBy/Offset
   * - 保留 SortBy（讓後端可依前端排序）
   */
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
