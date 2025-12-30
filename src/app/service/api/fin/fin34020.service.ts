/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiError {
  Code?: string;
  Message?: string;
  Details?: string;
}

export interface ApiResponse<T> {
  Status?: string;
  Data?: T;
  TotalCount?: number;
  Error?: ApiError;
}

export interface SortItem {
  field: string;
  order: number; // 1 / -1
}

export interface QueryFIN34020Request {
  PageIndex?: number;
  PageSize?: number;
  SortBy?: SortItem[];

  MID?: number;
  STO_No?: string;

  VEN_No_From?: string;
  VEN_No_To?: string;

  ARS_Date_From?: string; // yyyy-mm-dd
  ARS_Date_To?: string;

  RCV_Date_From?: string;
  RCV_Date_To?: string;

  ADJ_Date_From?: string;
  ADJ_Date_To?: string;

  AccNoList?: string;       // comma string
  MoneyTypeList?: string;   // comma string

  ShowARSAmount?: boolean;
  ShowZeroBalance?: boolean;
}

export interface QueryFIN34020Row {
  TotalCount?: number;

  VEN_No?: string;
  VEN_Name?: string;
  PayType?: string;

  ARS_No?: string;

  AccNo?: string;
  AccCName?: string;

  ARS_Date?: string | Date;
  PTA_Date?: string | Date;

  ARS_Amt?: number;

  NoteDesc?: string;

  RefNo?: string;
  RCV_Date?: string | Date;
  VouNo?: string;

  RcvOrAdjAmt?: number;
  UnpaidBalanceAmt?: number;
}

@Injectable({ providedIn: 'root' })
export class Fin34020Service {
  // ✅ 你專案通常有 environment.ApiUrl；這裡先用相對路徑
  private readonly baseUrl = '/FIN0000/NTS1000';

  constructor(private http: HttpClient) {}

  queryFIN34020(body: QueryFIN34020Request): Observable<ApiResponse<QueryFIN34020Row[]>> {
    return this.http.post<ApiResponse<QueryFIN34020Row[]>>(`${this.baseUrl}/queryFIN34020`, body);
  }
}
