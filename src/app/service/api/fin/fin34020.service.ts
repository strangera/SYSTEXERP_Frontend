/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';

export type SortItem = { field: string; order: number };

/** ========== Request ========== */
export interface QueryFIN34020Request {
  PageSize?: number | null;
  PageIndex?: number | null;
  SortBy?: SortItem[] | null;

  /** 廠商代號(起/迄) */
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
  AccNoList?: string | null;

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
  VouNo?: string;

  RcvOrAdjAmt?: number | null;
  UnpaidBalanceAmt?: number | null;
}

@Injectable({ providedIn: 'root' })
export class Fin34020Service {
  /** ✅ 新 API：/FIN0000/ARS1000/queryFIN34020 */
  private apiUrl = `${environment.ApiUrl}/FIN0000/ARS1000`;

  constructor(private http: HttpClient) {}

  queryFIN34020(body: QueryFIN34020Request): Observable<ApiResponse<QueryFIN34020Row[]>> {
    return this.http.post<ApiResponse<QueryFIN34020Row[]>>(
      `${this.apiUrl}/queryFIN34020`,
      body
    );
  }
}

export { ApiResponse };
