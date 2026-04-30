import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import {
  FIN73020Data,
  FIN73020ExportRequest,
  FIN73020Option,
  FIN73020Query,
} from '@pages/fin/fin73020/fin73020.model';

@Injectable({ providedIn: 'root' })
export class FIN73020Service {
  private readonly baseUrl = `${environment.ApiUrl}/Controllers/FIN70000`;

  constructor(private readonly http: HttpClient) {}

  queryFIN73020(body: FIN73020Query): Observable<BaseQueryResponse<FIN73020Data>> {
    return this.http.post<BaseQueryResponse<FIN73020Data>>(
      `${this.baseUrl}/queryFIN73020`,
      body
    );
  }

  exportPDFFIN73020(body: FIN73020ExportRequest): Observable<HttpResponse<Blob>> {
    const payload = this.stripPaging(body as any);

    return this.http.post(`${this.baseUrl}/exportPDFFIN73020`, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  exportExcelFIN73020(body: FIN73020ExportRequest): Observable<HttpResponse<Blob>> {
    const payload = this.stripPaging(body as any);

    return this.http.post(`${this.baseUrl}/exportExcelFIN73020`, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  getStatusOptions(): Observable<FIN73020Option[]> {
    return of([
      { label: '請選擇', value: '' },
      { label: '建立', value: '1' },
      { label: '請款', value: '2' },
      { label: '拋轉傳票', value: '3' },
      { label: '撥補', value: '4' },
      { label: '作廢', value: '9' },
    ]);
  }

  private stripPaging<T extends Record<string, any>>(input: T): any {
    if (!input) return input;

    const {
      pageIndex,
      pageSize,
      PageIndex,
      PageSize,
      SortBy,
      OrderBy,
      Offset,
      ...rest
    } = input;

    return rest;
  }
}