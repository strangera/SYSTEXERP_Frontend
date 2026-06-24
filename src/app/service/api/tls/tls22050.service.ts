import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QueryTLS22050Request {
  TXN_Date?: string | null;
  POS_TypeList?: string[] | null;
  VOU_CheckList?: string[] | null;
  pageIndex?: number;
  pageSize?: number;
  SortBy?: SortMeta[];
}

export interface QueryTLS22050Detail {
  TXN_Date: string;
  PAY_No: string;
  ECR_No: string;
  TXN_No: number;
  BOOK_PayAmt: number;
  ACT_PayAmt: number;
  OVER_PayAmt: number;
  OrderNo: string;
}

export interface QueryTLS22050Response {
  TXN_Date: string;
  PAY_No: string;
  PAY_Name: string;
  _DetailList: QueryTLS22050Detail[];
  BOOK_PayCnt_Sum: number;
  ACT_PayAmt_Sum: number;
  OVER_PayAmt_Sum: number;
}

export interface ApiResponseTLS22050 {
  Status: string | number;
  Message: string;
  Data: QueryTLS22050Response[];
  TotalCount: number;
}

@Injectable({ providedIn: 'root' })
export class Tls22050Service {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  queryTLS22050(data: QueryTLS22050Request): Observable<ApiResponseTLS22050> {
    return this.http.post<ApiResponseTLS22050>(`${this.apiUrl}/queryTLS22050`, data);
  }
}
