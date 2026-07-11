import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
export type ExportFileResponse = HttpResponse<Blob>;

export interface QueryTLS2F030Request extends ApiRequest {
  sam_yyymm: string | null;
  money_type: string | null;
  sam_termno: number | null;
  floor_no: string[];
}

export interface QueryTLS2F030Data {
  tlt_no: string;
  tlt_name: string;
  sam_yyymm: string;
  money_type_desc: string;
  sam_termno: number;
  sam_ap_namt: number;
  sam_ap_tax: number;
  sam_ap_amt: number;
  balance: number;
  status: string;
}

export interface QueryTLS2F030SumData {
  sum_sam_ap_namt: number;
  sum_sam_ap_tax: number;
  sum_sam_ap_amt: number;
  sum_balance: number;
}

export interface QueryTLS2F030ResponseData {
  QueryData: QueryTLS2F030Data[];
  SumData: QueryTLS2F030SumData;
}

export interface QueryTLS2F030Response {
  Status: string;
  Data: QueryTLS2F030ResponseData;
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class Tls2f030Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  queryTLS2F030(params: QueryTLS2F030Request): Observable<QueryTLS2F030Response> {
    return this.http.post<QueryTLS2F030Response>(`${this.apiUrl}/queryTLS2F030`, params);
  }

  exportTLS2F030(params: QueryTLS2F030Request): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/exportTLS2F030`, params, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  exportTLS2F030PDF(params: QueryTLS2F030Request): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/exportTLS2F030PDF`, params, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
