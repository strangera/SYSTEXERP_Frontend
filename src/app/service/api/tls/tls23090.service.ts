import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SortField {
  field: string;
  order: 1 | -1;
}

export interface QueryTLS23090Request {
  TXN_DateStart?: string;
  TXN_DateEnd?: string;
  ECR_No?: string[];
  TLT_No?: string[];
  CRD_Type?: string[];
  CRD_No?: string;
  TXN_PayAmt?: number;
  tlt_building?: string | string[];
  tlt_floor?: string[];
  org_id?: string[];
  IsHaveTERM_No?: boolean | null;
  TERM_No?: string[];
  Acquirer?: string[];
  Conn_Status?: string;
  SortBy?: SortField[];
  pageIndex?: number;
  pageSize?: number;
}

export interface CreditCardDetail {
  TXN_Date?: string;
  ECR_No?: string;
  TXN_No?: string | number;
  tlt_no?: string;
  tlt_name?: string;
  CRD_Name?: string;
  CRD_No?: string;
  TXN_PayAmt?: number;
  TXN_Point?: number;
  INST_Amt?: number;
  PAY_Name?: string;
  TERM_Name?: string;
  EDC_InstHeadAmt?: number;
  EDC_InstEachAmt?: number;
}

export interface InstallmentSummaryItem {
  TERM_No: string | number;
  TERM_Name?: string;
  TotalAmt?: number;
}

export interface CreditCardWrapper {
  tLS23090_CreditDetails?: CreditCardDetail[];
  TLS23090_CreditDetails?: CreditCardDetail[];
  CreditDetails?: CreditCardDetail[];
  Details?: CreditCardDetail[];
  TotalPayAmt?: number;
  TotalPoint?: number;
  TotalInstAmt?: number;
  GrandTotalStr?: string;
  InstallmentSummary?: InstallmentSummaryItem[];
}

export interface CreditCardApiResponse {
  Data?: CreditCardWrapper | CreditCardWrapper[];
  TotalCount?: number;
}

export interface CardBrandData {
  Count?: number;
  Amount?: number;
}

export interface CounterCardItem {
  TXN_Date?: string;
  ECR_No?: string;
  tlt_no?: string;
  tlt_name?: string;
  CRD_Type_List?: Record<string, CardBrandData>;
}

export interface CounterCardSummary {
  AE?: CardBrandData;
  DA?: CardBrandData;
  MASTER?: CardBrandData;
  VISA?: CardBrandData;
  JCB?: CardBrandData;
  UnionPay?: CardBrandData;
  Others?: CardBrandData;
  Total?: CardBrandData;
}

export interface CounterCardApiData {
  QueryData?: CounterCardItem[];
  Summary?: CounterCardSummary;
}

export interface CounterCardApiResponse {
  Data?: CounterCardApiData | CounterCardItem[];
  TotalCount?: number;
}

@Injectable({ providedIn: 'root' })
export class TLS23090Service {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.ApiUrl;

  queryTLS23090(query: QueryTLS23090Request): Observable<CreditCardApiResponse> {
    return this.http.post<CreditCardApiResponse>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23090_CreditCard`, query);
  }

  queryTLS23090CounterCard(body: QueryTLS23090Request): Observable<CounterCardApiResponse> {
    return this.http.post<CounterCardApiResponse>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23090_CounterCard`, body);
  }

  exporttls23090CreditPDF(body: QueryTLS23090Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/TLS0000/TLS2000/exportTLS23090_CreditCardPDF`, body, { observe: 'response', responseType: 'blob' });
  }

  exporttls23090CounterPDF(body: QueryTLS23090Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/TLS0000/TLS2000/exportTLS23090_CounterCardPDF`, body, { observe: 'response', responseType: 'blob' });
  }

  exporttls23090CreditExcel(body: QueryTLS23090Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/TLS0000/TLS2000/exportTLS23090_CreditCard`, this.stripPaging(body), { observe: 'response', responseType: 'blob' });
  }

  exporttls23090CounterExcel(body: QueryTLS23090Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/TLS0000/TLS2000/exportTLS23090_CounterCard`, this.stripPaging(body), { observe: 'response', responseType: 'blob' });
  }

  private stripPaging(input: QueryTLS23090Request): Omit<QueryTLS23090Request, 'pageSize' | 'pageIndex'> {
    const { pageSize: _ps, pageIndex: _pi, ...rest } = input;
    return rest;
  }
}
