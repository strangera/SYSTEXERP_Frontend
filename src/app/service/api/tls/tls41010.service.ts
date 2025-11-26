import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TLS41010Data } from '../../../pages/tls/tls41010/tls41010.model';

const API_URL = `${environment.ApiUrl}/TLS0000/TLS4000`;

export interface QueryTLS41010Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  ECR_No?: string;
  ECR_Name?: string;
  ECR_TLT_No?: string;
  ECR_TLT_Name?: string;
  ECR_ActiveDateStart?: string;
  ECR_ActiveDateEnd?: string;
  ECR_CloseDateStart?: string;
  ECR_CloseDateEnd?: string;
  ECR_Status?: string;
  ECR_AreaNo?: string;
  ECR_SubGroup?: string;
  ECR_LocNo?: string;
  ECR_Type?: string | null;
  ECR_SAL_Type?: string;
  ECR_GUI_Type?: string | null;
  ECR_USR_No?: string;
  ECR_USR_Name?: string;
  ECR_ComName?: string;
  ECR_IP?: string;
  ECR_SrvIP?: string;
  ECR_TmplNo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TLS41010Service {
  constructor(private http: HttpClient) { }

  queryTLS41010(params: QueryTLS41010Request): Observable<ApiResponse<TLS41010Data[]>> {
    return this.http.post<ApiResponse<TLS41010Data[]>>(`${API_URL}/queryTLS41010`, params);
  }

  insertTLS41010(data: Partial<TLS41010Data>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/insertTLS41010`, data);
  }

  updateTLS41010(data: Partial<TLS41010Data>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/updateTLS41010`, data);
  }

  deleteTLS41010(idList: number[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/deleteTLS41010`, { idList });
  }
  queryTLT_NoInfo(ECR_TLT_No: string): Observable<ApiResponse<any>> {
    const body = { ECR_TLT_No };
    return this.http.post<ApiResponse<any>>(`${API_URL}/queryTLT_NoInfo`, body);
  }
}
