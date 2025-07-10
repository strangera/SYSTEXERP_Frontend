import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../system/auth.service';
import { SortMeta } from 'primeng/api';
import { TLS41010Data } from '../../../pages/tls/tls41010/tls41010.model';

const API_URL = `${environment.ApiUrl}/TLS0000/TLS4000`;

export interface QueryTLS41010Request {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortMeta[];
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
  ECR_Type?: string;
  ECR_SAL_Type?: string;
  ECR_GUI_Type?: string;
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
}
