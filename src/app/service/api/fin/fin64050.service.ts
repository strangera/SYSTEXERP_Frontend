import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

export type SortItem = { field: string; order: number };

export interface QueryFIN64050Request {
  PageSize?: number | null;
  PageIndex?: number | null;
  SortBy?: SortItem[] | null;

  BackDateFrom?: string | null; // 退票日(起)
  BackDateTo?: string | null;   // 退票日(迄)
  ChkNo?: string | null;        // 票據號碼(模糊)

  /** 前端預設要抓 2,5：給後端用（若後端暫時沒做也沒關係） */
  ChkStatusList?: string | null; // e.g. "2,5"

  // 兼容小寫（你們共用套件會帶）
  pageSize?: number | null;
  pageIndex?: number | null;
  orderBy?: string | null;
  offset?: number | null;

  OrderBy?: string | null;
  Offset?: number | null;

  [key: string]: any;
}

export interface QueryFIN64050Row {
  SEQ_NO: number;
  ID: number;

  CHK_No: string;

  VEN_No: string | null;
  VEN_Name: string | null;

  BNK_No: string | null;
  BNK_Name: string | null;

  CHK_ExpireDate: string | null;
  CHK_Amt: number | null;

  CHK_BNK_No: string | null;

  CHK_BackDate: string | null;

  Bounce_Tran_Status?: string | null;
  Bounce_VouNo?: string | null;
  Bounce_Comment?: string | null;
  Bounce_RCV_No?: string | null;

  CHK_Status: string | null;       // 0~5
  CHK_Status_Name: string | null;  // 中文

  IsSelectable?: 'Y' | 'N';

  [key: string]: any;
}

/** 退票更新（對齊 SP_FIN64050Update 的概念） */
export interface Fin64050UpdateRequest {
  BackDate: string;       // 必填：退票日期 yyyy-MM-dd
  IdList: number[];       // 必填：ARS4004.ID list
  CHK_Comment?: string;   // 選填：備註

  UPD_USR_No?: string;
  UPD_USR_Name?: string;

  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class Fin64050Service {
  /** ⚠️ 目前還沒有後端：先用 placeholder，等你們 Controller 上線再改路由 */
  private apiUrl = `${environment.ApiUrl}/FIN0000/ARS4000`;

  constructor(private http: HttpClient) {}

  queryFIN64050(body: QueryFIN64050Request): Observable<ApiResponse<QueryFIN64050Row[]>> {
    return this.http.post<ApiResponse<QueryFIN64050Row[]>>(
      `${this.apiUrl}/queryFIN64050`,
      body
    );
  }

  /** 支票退票（更新） */
  updateFIN64050(body: Fin64050UpdateRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateFIN64050`, body);
  }

  exportFIN64050Excel(body: QueryFIN64050Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN64050`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  exportFIN64050PDF(body: QueryFIN64050Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN64050PDF`;
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
