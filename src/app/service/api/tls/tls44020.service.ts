
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QueryBase {
  PageSize: number;
  PageIndex: number;
  SortBy?: string;
}

export interface QueryTLS44020Request extends QueryBase {
  Day: number;
  ECR_No: string[];
  TLT_No: string[];
  tlt_building: string[];
  tlt_floor: string[];
  area_no: string[];
  EDC_IP: string;
  EDC_Online: string;
  EDC_TmID: string;
}

export interface QueryTLS44020Response {
  ECR_LocNo: string;
  ECR_No: string;
  TLT_No: string;
  TLT_Name: string;
  EOS_Status: string | number;
  EOS_Online: string | number;
  // 中信
  EDC_IP1: string;
  EDC_Status1: string;
  EDC_Online1: string;
  EDC_TmID1: string;
  // 聯信
  EDC_IP2: string;
  EDC_Status2: string;
  EDC_Online2: string;
  EDC_TmID2: string;
  // 未使用
  EDC_IP3: string;
  EDC_Status3: string;
  EDC_Online3: string;
  EDC_TmID3: string;
}
// 前端對應的機台連線狀態型別
export type EDCStatus = '關機' | '離線' | '交易中';
@Injectable({
  providedIn: 'root',
})
export class TLS44020Service {
  private readonly apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private readonly http: HttpClient) { }

  queryTLS44020(data: Partial<QueryTLS44020Request>): Observable<ApiResponse<QueryTLS44020Response[]>> {
    return this.http.post<ApiResponse<QueryTLS44020Response[]>>(`${this.apiUrl}/queryTLS44020`, data);
  }
}