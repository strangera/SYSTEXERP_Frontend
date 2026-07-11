import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  FIN73030Query,
  FIN73030FilterBody,
  FIN73030TableRow,
  QueryFIN73030SPResponse,
} from '@pages/fin/fin73030/fin73030.model';

@Injectable({ providedIn: 'root' })
export class FIN73030Service {
  /** 與 FIN73010 相同模組 */
  private readonly apiUrl = `${environment.ApiUrl}/FIN0000/FIN70000`;

  constructor(private readonly http: HttpClient) {}

  queryFIN73030(body: FIN73030Query): Observable<ApiResponse<QueryFIN73030SPResponse[]>> {
    return this.http.post<ApiResponse<QueryFIN73030SPResponse[]>>(
      `${this.apiUrl}/queryFIN73030`,
      body,
    );
  }

  exportPDFFIN73030(body: FIN73030FilterBody): Observable<HttpResponse<Blob>> {
    return this.http
      .post(`${this.apiUrl}/exportPDFFIN73030`, body, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(take(1));
  }

  exportExcelFIN73030(body: FIN73030FilterBody): Observable<HttpResponse<Blob>> {
    return this.http
      .post(`${this.apiUrl}/exportExcelFIN73030`, body, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(take(1));
  }

  toTableRow(item: QueryFIN73030SPResponse, index: number): FIN73030TableRow {
    const rowKey = `${item.PCS_RqstNo ?? ''}_${String(item.PCS_RqstDate ?? '')}_${index}`;
    return {
      ...item,
      rowKey,
      expansionLines: [
        {
          PCS_ItemDesc: item.PCS_ItemDesc ?? '',
          unit: '',
          quantity: null,
          unitPrice: null,
          PCS_TotAmt: item.PCS_TotAmt ?? null,
        },
      ],
    };
  }
}
