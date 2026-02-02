import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

export type SortItem = { field: string; order: number };

/** ========== Query (列表) ========== */
export interface QueryFIN64020Request {
  // paging/sort（如你們共用 table 會帶）
  PageSize?: number | null;
  PageIndex?: number | null;
  SortBy?: SortItem[] | null;

  // SP_FIN64020Query 條件
  CompanyAccNoList?: string | null; // 逗號分隔
  ExpireDateFrom?: string | null;
  ExpireDateTo?: string | null;
  ChkNo?: string | null;
  VouNoExpire?: string | null;
  ChkStatus?: string | null; // 0~5

  // 兼容你們 BasicQueryPageComponent / table 可能帶的小寫 key
  pageSize?: number | null;
  pageIndex?: number | null;
  orderBy?: string | null;
  offset?: number | null;

  OrderBy?: string | null;
  Offset?: number | null;

  [key: string]: any;
}

export interface QueryFIN64020Row {
  SEQ_NO: number;
  ID: number;

  CHK_No: string;

  VEN_No: string | null;
  VEN_Name: string | null;

  BNK_No: string | null;     // 票面銀行(含分行)
  BNK_Name: string | null;   // 票面銀行名稱

  CHK_ExpireDate: string | null;
  CHK_Amt: number | null;

  CHK_BNK_No: string | null; // 託收銀行(含分行)

  VouNo_Expire: string | null;

  CHK_Status: string | null;       // 0~5
  CHK_Status_Name: string | null;  // 中文

  IsSelectable: 'Y' | 'N';

  // 前端額外顯示用（後端之後若有此欄位也可直接帶）
  CollectDate?: string | null;
  CollectBankNo?: string | null;

  [key: string]: any;
}

/** ========== Update (託收) ========== */
export interface Fin64020CollectRequest {
  // 勾選多筆
  ChkNoList: string[];

  // 託收日期
  CollectDate: string;

  // 託收銀行(含分行代碼 or 你們定義的 bank key)
  CollectBankNo: string;

  // 若未來需要審計欄位可加
  UPD_USRNo?: string;
  UPD_USRName?: string;

  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class Fin64020Service {
  /**
   * ✅ 目前還沒後端：先用 placeholder
   * 你之後若要跟 FIN63020 一樣，可能會是 /FIN0000/ARS4000 或 /FIN0000/FIN64020
   */
  private apiUrl = `${environment.ApiUrl}/FIN0000/ARS4000`;

  constructor(private http: HttpClient) {}

  /** 查詢列表 */
  queryFIN64020(body: QueryFIN64020Request): Observable<ApiResponse<QueryFIN64020Row[]>> {
    return this.http.post<ApiResponse<QueryFIN64020Row[]>>(
      `${this.apiUrl}/queryFIN64020`,
      body
    );
  }

  /** 託收更新：狀態改為 2=託收，並記錄託收日期/託收銀行 */
  collectFIN64020(body: Fin64020CollectRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/collectFIN64020`, body);
  }

  /** 匯出 Excel（如果你也想要） */
  exportFIN64020Excel(body: QueryFIN64020Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN64020`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 PDF（如果你也想要） */
  exportFIN64020PDF(body: QueryFIN64020Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN64020PDF`;
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
