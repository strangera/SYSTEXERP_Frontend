// 零用金拋轉作業 (FIN72030) API Service

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/utils/rxjs-operators/validate-api-response';
// 零用金拋轉作業 (FIN72030) 資料模型

export interface FIN72030Detail1NoteDescItem {
  PCS_No: string;
  PCS_SeqNo: number;
  NoteDesc: string;
}

export interface FIN72030QueryRequest {
  SYS_StoreNo: string;
  PCS_RqstNo: string;
  LoginUsrNo: string;
  LoginUsrName: string;
  VouDate?: string | null;
  Detail1NoteDescList?: FIN72030Detail1NoteDescItem[];
  Detail2NoteDesc?: string | null;
  Detail3NoteDesc?: string | null;
}

export interface FIN72030MasterResult {
  Voucher_No: string;           // 拋轉前為「系統自動給號」，拋轉後為實際傳票號碼
  Voucher_Type: string;
  Voucher_Class: string;
  Voucher_Date: string | null;
  Voucher_Desc: string;
  CRT_Date: string | null;
  CRT_USR_No: string;
  CRT_USR_Name: string;
}

export interface FIN72030DetailResult {
  PCS_No: string;
  PCS_SeqNo: number | null;
  SeqNo: number | null;
  AccSort: string;
  AccNo: string;
  AccCName: string;
  VEN_Uniform: string;
  VEN_Name: string;
  VEN_No: string;
  NOTeDesc: string;
  DebitAmt: number;
  CreditAmt: number;
  ORG_ID: string;
  ORG_Name: string;
  PTA: string;
  ProjectNo: string;
  RECON_Key: string | null;
}

export interface FIN72030QueryResult {
  MasterData: FIN72030MasterResult | null;
  DetailList: FIN72030DetailResult[];
}

export interface FIN72030PostingRequest {
  PCS_RqstNo: string;
  CreditOrgID?: string;
  VouDate?: string | null;
  Detail1NoteDescList?: FIN72030Detail1NoteDescItem[];
  Detail2NoteDesc?: string | null;
  Detail3NoteDesc?: string | null;
}

export interface FIN72030PostingResult {
  Voucher_No: string;
}

export interface PCS_RqstNoDropdownItem {
  PCS_RqstNo: string;
  PCS_RqstDate: string | null;
  Keep_UsrNo: string;
}


@Injectable({ providedIn: 'root' })
export class Fin72030Service {
  // 查詢 / 拋轉 endpoint 位於 /FIN70000/FIN70000，下拉位於 /FIN0000/FIN70000
  private readonly apiUrl = environment.ApiUrl + '/FIN70000/FIN70000';
  private readonly dropdownUrl = environment.ApiUrl + '/FIN0000/FIN70000';

  constructor(private http: HttpClient) { }

  queryFIN72030(payload: FIN72030QueryRequest): Observable<ApiResponse<FIN72030QueryResult>> {
    return this.http.post<ApiResponse<FIN72030QueryResult>>(
      `${this.apiUrl}/queryFIN72030`,
      payload
    );
  }

  postingFIN72030(payload: FIN72030PostingRequest): Observable<ApiResponse<FIN72030PostingResult>> {
    return this.http.post<ApiResponse<FIN72030PostingResult>>(
      `${this.apiUrl}/postingFIN72030`,
      payload
    );
  }

  getPCS_RqstNoDropDownList(): Observable<ApiResponse<PCS_RqstNoDropdownItem[]>> {
    return this.http.post<ApiResponse<PCS_RqstNoDropdownItem[]>>(
      `${this.dropdownUrl}/POS2064MPCS_RqstNoDropDownList`,
      {}
    );
  }

  getFIN72030RqstNoDropDownList(): Observable<ApiResponse<PCS_RqstNoDropdownItem[]>> {
    return this.http.post<ApiResponse<PCS_RqstNoDropdownItem[]>>(
      `${this.apiUrl}/getFIN72030RqstNoDropDownList`,
      {}
    );
  }
}
