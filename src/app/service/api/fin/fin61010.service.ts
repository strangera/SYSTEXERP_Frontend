import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface FIN61010QueryRequest extends BaseQueryRequest {
  BNK_No?: string;
  CHK_StatusList?: string[];
}

export interface FIN61010Data {
  id: number;
  mid: number;
  BNK_No: string;
  BNK_Name: string;
  BNK_BranchNo: string;
  BNK_AccNo: string;
  CHK_Track: string;
  CHK_NumLen: number;
  CHK_BegNo: string;
  CHK_EndNo: string;
  CHK_LastUsedNo: string;
  CHK_Status: string;
  CHK_StatusName: string;
  CHK_UseDate: string;
  CHK_StopDate: string;
  HasIssuedRecord: boolean;
}

export interface FIN61010DetailData {
  id: number;
  mid: number;
  CHK_No: string;
  CHK_Status: string;
  CHK_StatusName: string;
  VEN_No: string;
  CHK_IssueDate: string;
  CHK_ExpireDate: string;
  CHK_Amt: number;
  CHK_PayDate: string;
  CHK_VoidDate: string;
  PAM_No: string;
  CHK_Comment: string;
  CRT_Date: string;
  UPD_Date: string;
}

export interface FIN61010InsertRequest {
  BNK_No: string;
  BNK_BranchNo: string;
  BNK_AccNo?: string;
  CHK_Track: string;
  CHK_BegNo: string;
  CHK_EndNo: string;
  CHK_Status: string;
  CHK_UseDate?: string | null;
  CHK_StopDate?: string | null;
}

export interface VoidItem {
  VoidDate?: string | null;
  CHK_No?: string;
  VoidReason?: string;
}

export interface FIN61010VoidHistoryData {
  CHK_No: string;
  VoidDate: string;
  VoidReason: string;
}

export interface FIN61010DetailWithVoidResult {
  Details: FIN61010DetailData[];
  VoidHistory: FIN61010VoidHistoryData[];
}

export interface FIN61010DetailQueryResponse {
  Status: string;
  Message: string;
  TotalCount: number;
  Data: FIN61010DetailWithVoidResult;
}

export interface FIN61010UpdateRequest {
  id: number;
  CHK_Status: string;
  BNK_No?: string;
  BNK_BranchNo?: string;
  BNK_AccNo?: string;
  CHK_Track?: string;
  CHK_BegNo?: string;
  CHK_EndNo?: string;
  CHK_UseDate?: string | null;
  CHK_StopDate?: string | null;
  VoidItems?: VoidItem[];
}

@Injectable({ providedIn: 'root' })
export class FIN61010Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;

  constructor(private http: HttpClient) {}

  queryFIN61010(data: FIN61010QueryRequest): Observable<BaseQueryResponse<FIN61010Data>> {
    return this.http.post<BaseQueryResponse<FIN61010Data>>(`${this.apiUrl}/queryFIN61010`, data);
  }

  queryFIN61010Detail(APS3005_id: number, pageSize = 30, pageIndex = 1): Observable<FIN61010DetailQueryResponse> {
    return this.http.post<FIN61010DetailQueryResponse>(
      `${this.apiUrl}/queryFIN61010Detail`,
      { APS3005_id, PageSize: pageSize, PageIndex: pageIndex }
    );
  }

  insertFIN61010(data: FIN61010InsertRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/insertFIN61010`, data);
  }

  updateFIN61010(data: FIN61010UpdateRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/updateFIN61010`, data);
  }
}