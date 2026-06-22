
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

export interface QueryTLS44010Request extends QueryBase {
  Day: number;
  ECR_No: string[];
  TLT_No: string[];
  tlt_building: string[];
  tlt_floor: string[];
  area_no: string[];
  EOS_IP: string;
  EOS_Online: string;
}

export interface QueryTLS44010Response {
  ECR_LocNo: string;
  ECR_No: string;
  TLT_No: string;
  TLT_Name: string;
  EOS_Status: string | null;
  EOS_Online: string;
  EOS_CloseTime: string | Date | null;
}

// 狀態對應型別 (0: 暫停交易, 1: 登出, 2: 完成清帳, 3: 交易中, 4: 完成交班, 5: 關機)
export type EOSStatus = '0' | '1' | '2' | '3' | '4' | '5';

export interface VncSessionResponse {
  SessionToken: string;
  Password: string;
}

@Injectable({
  providedIn: 'root',
})
export class TLS44010Service {
  private readonly apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private readonly http: HttpClient) { }

  queryTLS44010(data: Partial<QueryTLS44010Request>): Observable<ApiResponse<QueryTLS44010Response[]>> {
    return this.http.post<ApiResponse<QueryTLS44010Response[]>>(`${this.apiUrl}/queryTLS44010`, data);
  }

  createVncSession(ecrNo: string): Observable<ApiResponse<VncSessionResponse>> {
    return this.http.post<ApiResponse<VncSessionResponse>>(`${this.apiUrl}/vnc/token`, { ECR_No: ecrNo });
  }
}
