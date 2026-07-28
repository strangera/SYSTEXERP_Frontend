/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SortItem { field: string; order: number }

/** ========== Request ========== */
export interface QueryFIN34020Request {
  PageSize?: number | null;
  PageIndex?: number | null;
  SortBy?: SortItem[] | null;

  /** 廠商編號(起/迄) */
  VEN_No_From?: string | null;
  VEN_No_To?: string | null;

  /** 立帳日期(起/迄) yyyy-mm-dd */
  ARS_Date_From?: string | null;
  ARS_Date_To?: string | null;

  /** 收款日期(起/迄) yyyy-mm-dd */
  RCV_Date_From?: string | null;
  RCV_Date_To?: string | null;

  /** 調整日期(起/迄) yyyy-mm-dd */
  ADJ_Date_From?: string | null;
  ADJ_Date_To?: string | null;

  /** 科目代號清單(多筆逗號分隔) */
  AccNoList?: string | null; // 多選不使用，改為區間
  AccNo_Start?: string | null;
  AccNo_End?: string | null;

  /** 月結天數(多筆逗號分隔) */
  MoneyTypeList?: string | null;

  /** 是否顯示應收金額 (string(1)) */
  ShowARSAmount?: string | null;

  /** 是否顯示餘額為0 (string(1)) */
  ShowZeroBalance?: string | null;

  /** 相容擴充（你專案常用） */
  [key: string]: any;
}

/** ========== Response Row ========== */
export interface QueryFIN34020Row {
  TotalCount?: number;

  VEN_No?: string;
  VEN_Name?: string;
  PayType?: string;

  ARS_No?: string;

  AccNo?: string;
  AccCName?: string;

  ARS_Date?: string | null; // date
  PTA_Date?: string | null; // date

  ARS_Amt?: number | null;

  NoteDesc?: string;

  RefNo?: string;
  RCV_Date?: string | null; // date
  VouNo?: string; // 第一行的傳票號碼

  RcvOrAdjAmt?: number | null;
  UnpaidBalanceAmt?: number | null;

  // 新增第二行欄位
  Pay_VouNo?: string; // 第二行的傳票號碼
  Pay_Amt?: number | null; // 調整/收款金額
}

@Injectable({ providedIn: 'root' })
export class Fin34020Service {
  /** ✅ /FIN0000/ARS1000 */
  private apiUrl = `${environment.ApiUrl}/FIN0000/ARS1000`;

  constructor(private http: HttpClient) { }

  queryFIN34020(body: QueryFIN34020Request): Observable<ApiResponse<QueryFIN34020Row[]>> {
    return this.http.post<ApiResponse<QueryFIN34020Row[]>>(
      `${this.apiUrl}/queryFIN34020`,
      body
    );
  }

  /** ✅ 匯出 Excel（後端：exportFIN34020） */
  exportFIN34020Excel(body: QueryFIN34020Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN34020`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** ✅ 匯出 PDF（後端：exportFIN34020PDF） */
  exportFIN34020PDF(body: QueryFIN34020Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportFIN34020PDF`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({ Accept: 'application/pdf' }),
    }) as Observable<HttpResponse<Blob>>;
  }

  /** ✅ 匯出時移除分頁欄位 */
  private stripPaging<T extends Record<string, any>>(
    input: T
  ): Omit<T, 'PageSize' | 'PageIndex' | 'pageSize' | 'pageIndex' | 'OrderBy' | 'Offset' | 'orderBy' | 'offset'> {
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

