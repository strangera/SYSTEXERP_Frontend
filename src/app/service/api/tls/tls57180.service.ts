import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface IExportPDFItem {
  ACP_YYYYMM: string;
  VEN_No: string;
  TLT_No: string;
  VEN_Uniform?: string;
}

export interface IExportPDFRequest {
  selectList: IExportPDFItem[];
}

export interface IQueryRequest {
  PageSize: number;
  PageIndex: number;
  SortBy?: { field: string; order: number }[];
  ACP_YYYYMM: string;
  VEN_No?: string;
  TLT_No?: string;
  VEN_Uniform?: string;
  PUR_GUINo?: string;
}

export interface IAutoMailItem extends IExportPDFItem {
  VEN_Name?: string;
  email?: string;
}

export interface IAutoMailRequest {
  SMTP_No?: string;
  selectList: IAutoMailItem[];
}

export interface IQueryData {
  ACP_YYYYMM?: string;
  VEN_No?: string;
  LOGO_CH_NAME?: string;
  VEN_Name?: string;
  VEN_Uniform?: string;
  TLT_No?: string;
  VEN_Email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TLS57180Service {
  private readonly apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private readonly http: HttpClient) { }

  exportTLS57180PDF(data: IExportPDFRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/exportTLS57180PDF`, data, { responseType: 'blob', observe: 'response' });
  }

  queryTLS57180(params: IQueryRequest): Observable<ApiResponse<IQueryData[]>> {
    return this.http.post<ApiResponse<IQueryData[]>>(`${this.apiUrl}/queryTLS57180`, params);
  }

  autoMailTLS57180(data: IAutoMailRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/autoMailTLS57180`, data);
  }
}
