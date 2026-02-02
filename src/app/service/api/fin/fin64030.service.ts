import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

export type SortItem = { field: string; order: number };

export interface QueryFIN64030Request {
  PageSize?: number | null;
  PageIndex?: number | null;
  SortBy?: SortItem[] | null;

  CompanyAccNoList?: string | null; // 多選：逗號分隔（同 FIN64020）
  ExpireDateFrom?: string | null;
  ExpireDateTo?: string | null;

  ChkNo?: string | null;        // 票據號碼(模糊)
  VouNoPaid?: string | null;    // 兌現傳票號(模糊) - 若你後端定義
  ChkStatus?: string | null;    // 0~5

  // 兼容小寫
  pageSize?: number | null;
  pageIndex?: number | null;
  orderBy?: string | null;
  offset?: number | null;

  OrderBy?: string | null;
  Offset?: number | null;

  [key: string]: any;
}

export interface QueryFIN64030Row {
  SEQ_NO: number;
  ID: number;

  CHK_No: string;

  VEN_No: string | null;
  VEN_Name: string | null;

  BNK_No: string | null;
  BNK_Name: string | null;

  CHK_ExpireDate: string | null;
  CHK_Amt: number | null;

  CHK_BNK_No: string | null; // 託收銀行(含分行) - 若查得到

  CHK_Status: string | null;      // 0~5
  CHK_Status_Name: string | null; // 中文

  VouNo_Paid?: string | null;     // 兌現傳票號（若你後端回）
  PayDate?: string | null;        // 兌現日（若你後端回）

  IsSelectable?: 'Y' | 'N'; // 若你後端也輸出，可直接用；沒有就前端判斷

  [key: string]: any;
}

/** 兌現更新 */
export interface Fin64030CashRequest {
  ChkNoList: string[];

  PayDate: string;         // 兌現日
  CashBankNo: string;      // 兌現銀行（如需要）
  VouNoPaid?: string;      // 兌現傳票號（如需要）

  UPD_USRNo?: string;
  UPD_USRName?: string;

  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class Fin64030Service {
  /** 目前還沒後端：先 placeholder */
  private apiUrl = `${environment.ApiUrl}/FIN0000/ARS4000`;

  constructor(private http: HttpClient) {}

  queryFIN64030(body: QueryFIN64030Request): Observable<ApiResponse<QueryFIN64030Row[]>> {
    return this.http.post<ApiResponse<QueryFIN64030Row[]>>(
      `${this.apiUrl}/queryFIN64030`,
      body
    );
  }

  /** 兌現 */
  cashFIN64030(body: Fin64030CashRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/cashFIN64030`, body);
  }

  exportFIN64030Excel(body: QueryFIN64030Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN64030`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  exportFIN64030PDF(body: QueryFIN64030Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN64030PDF`;
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
