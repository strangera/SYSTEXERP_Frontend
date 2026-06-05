import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  QueryASS17040DataPayload,
  QueryASS17040Request,
} from '@pages/ass/ass17040/ass17040.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS17040Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) { }

  queryASS17040(
    body: QueryASS17040Request
  ): Observable<ApiResponse<QueryASS17040DataPayload>> {
    return this.http.post<ApiResponse<QueryASS17040DataPayload>>(
      `${this.apiUrl}/queryASS17040`,
      body
    );
  }

  exportPDFASS17040(body: QueryASS17040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFASS17040`, body, {
      responseType: 'blob',
    });
  }

  exportExcelASS17040(body: QueryASS17040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportExcelASS17040`, body, {
      responseType: 'blob',
    });
  }
}
