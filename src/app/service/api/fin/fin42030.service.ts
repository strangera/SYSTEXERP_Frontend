import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
export interface FIN42030QueryRequest extends ApiRequest {
  YM?: string;
  Org_ID?: string;
  IsCludeDownOrg?: string; // 是否含以下部門(Y=是/N=否)
  ReportType?: number;
  AmtUnit?: number;
}

export interface FIN42030Data {
  Org_ID?: string;
  Org_Name?: string;
  Acc_No?: string;
  Acc_Name?: string;
  Item_No?: string;
  Item_Name?: string;

  CurrentAmount?: number;
  CurrentRatio?: number;
  BudgetSamePeriodAmount?: number;
  BudgetSamePeriodRatio?: number;
  GrowthRate?: number;

  CurrentAccumAmount?: number;
  CurrentAccumRatio?: number;
  BudgetAccumAmount?: number;
  BudgetAccumRatio?: number;
  AccumGrowthRate?: number;
}

@Injectable({ providedIn: 'root' })
export class FIN42030Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  queryFIN42030(body: FIN42030QueryRequest): Observable<any> {
    const url = `${this.apiUrl}/FIN0000/FIN4000/queryFIN42030`;
    return this.http.post<any>(url, body).pipe(
      tap((res) => console.log('🎯 FIN42030 查詢結果:', res)),
      catchError((err) => this.errorHandler.handleError(err))
    );
  }

  exportFIN42030Excel(body: FIN42030QueryRequest): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/FIN0000/FIN4000/exportFIN42030`;
    const payload = this.stripPaging(body);

    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  exportFIN42030PDF(body: FIN42030QueryRequest): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/FIN0000/FIN4000/exportFIN42030PDF`;
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