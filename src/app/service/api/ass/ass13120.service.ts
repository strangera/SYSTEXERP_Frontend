// 折舊攤提作業 (ASS13120) API Service

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryASS13120Response {
  /** 例如：最後傳票產生日期：2026年05月 / 最後傳票產生日期：查無資料 */
  Result: string;
  IsHaveAssetNotApproved: boolean;//是否有變賣、作廢(未審核)的資產
}

export interface CreatePdEntryRequest {
  /** 折舊年月，格式：yyyyMM，例如 202606 */
  DepreYM: string;
}

export interface CreatePdEntryResult {
  IsSuccess: boolean;
  Message: string;
  MID: number;
  CompNo: string;
  DepreYM: string;
  VouDate: string;
  VouNo: string;
  SrcSheetType: string;
  SrcSheetNo: string;
  DebitAmount: number;
  CreditAmount: number;
  BalanceAmount: number;
  VoucherDetailCount: number;
  UpdatedDepreRecordCount: number;
}

export interface CreatePdEntryDetail {
  SerNo: number;
  AccDC: string;
  AccNo: string;
  AccAmt: number;
  ORG_ID: string | null;
  DetailNo: string | null;
  SubDetailNo: string | null;
  ProjectNo: string | null;
  NoteDesc: string | null;
  PTA: string | null;
}

export interface CreatePdEntryResponse {
  IsSuccess: boolean;
  Message: string;
  ErrorNumber: number | null;
  VouNo: string | null;
  Result: CreatePdEntryResult | null;
  Details: CreatePdEntryDetail[];
}

@Injectable({ providedIn: 'root' })
export class ASS13120Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  queryASS13120(): Observable<ApiResponse<QueryASS13120Response>> {
    return this.http.post<ApiResponse<QueryASS13120Response>>(`${this.apiUrl}/queryASS13120`, {});
  }

  createASS13120(body: CreatePdEntryRequest): Observable<ApiResponse<CreatePdEntryResponse>> {
    return this.http.post<ApiResponse<CreatePdEntryResponse>>(`${this.apiUrl}/createASS13120`, body);
  }
}
