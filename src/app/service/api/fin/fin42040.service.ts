import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
export interface FIN42040QueryRequest extends ApiRequest {
  YM?: string;
  CompareYM?: string;
  Org_ID?: string;
  Org_Name?: string;
  IsCludeDownOrg?: string; // 是否含以下部門(Y=是/N=否)
  ReportType?: number;
  AmtUnit?: number;
}

export interface FIN42040Data {
  SortNo?: number;
  LevelNo?: number;
  RowType?: string;

  AccountCode?: string;
  AccountName?: string;

  CurrentAmount?: number;
  CurrentRatio?: number;
  CompareAmount?: number;
  CompareRatio?: number;
  GrowthRate?: number;

  CurrentAccumAmount?: number;
  CurrentAccumRatio?: number;
  CompareAccumAmount?: number;
  CompareAccumRatio?: number;
  AccumGrowthRate?: number;
}

@Injectable({ providedIn: 'root' })
export class FIN42040Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  queryFIN42040(body: FIN42040QueryRequest): Observable<any> {
    const url = `${this.apiUrl}/FIN0000/FIN4000/queryFIN42040`;

    return this.http.post<any>(url, body).pipe(
      tap((res) => console.log('🎯 FIN42040 查詢結果:', res)),
      catchError((err) => this.errorHandler.handleError(err))
    );
  }

  exportFIN42040Excel(body: FIN42040QueryRequest): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/FIN0000/FIN4000/exportFIN42040`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  exportFIN42040PDF(body: FIN42040QueryRequest): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/FIN0000/FIN4000/exportFIN42040PDF`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  private stripPaging<T extends Record<string, any>>(input: T): any {
    if (!input) return input;

    const {
      PageSize,
      PageIndex,
      OrderBy,
      Offset,
      pageSize,
      pageIndex,
      orderBy,
      offset,
      ...rest
    } = input as any;

    return rest;
  }
}