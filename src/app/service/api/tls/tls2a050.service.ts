import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QueryTLS2A050Request {
  TXN_DateStart: string | null;
  TXN_DateEnd: string | null;
  POS_TypeList?: string[] | null;
  pageIndex?: number;
  pageSize?: number;
  SortBy?: SortMeta[]
}

export interface ExportTLS2A050Request {
  FileName: string;
  ReportTitle: string;
  queryTLS2A050Request: QueryTLS2A050Request;
}

export interface QueryTLS2A050Detail {
  BOOK_PayCnt: number;
  ACT_PayCnt: number;
  BOOK_PayAmt: number;
  ACT_PayAmt: number;
  OVER_PayAmt: number;
  PAY_Name: string;
}

export interface QueryTLS2A050Response {
  TXN_Date: string;
  _DetailList: QueryTLS2A050Detail[];
}

export interface QueryTLS2A050Data {
  QueryData: QueryTLS2A050Response[];
  SumData: Record<string, number>;
}

export interface ApiResponseTLS2A050 {
  Status: string | number;
  Message: string;
  Data: QueryTLS2A050Data;
  TotalCount: number;
}

@Injectable({ providedIn: 'root' })
export class Tls2A050Service {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  queryTLS2A050(data: QueryTLS2A050Request): Observable<ApiResponseTLS2A050> {
    return this.http.post<ApiResponseTLS2A050>(`${this.apiUrl}/queryTLS2A050`, data);
  }

  exportTLS2A050(data: ExportTLS2A050Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS2A050`, data, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
