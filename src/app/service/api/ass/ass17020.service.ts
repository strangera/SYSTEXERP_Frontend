import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS17020DataPayload,
  QueryASS17020Request,
} from '@pages/ass/ass17020/ass17020.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS17020Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) {}

  queryASS17020(
    body: QueryASS17020Request
  ): Observable<ApiResponse<ASS17020DataPayload>> {
    return this.http.post<ApiResponse<ASS17020DataPayload>>(
      `${this.apiUrl}/queryASS17020`,
      body
    );
  }

  exportPDFASS17020(body: QueryASS17020Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFASS17020`, body, {
      responseType: 'blob',
    });
  }

  exportExcelASS17020(body: QueryASS17020Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportExcelASS17020`, body, {
      responseType: 'blob',
    });
  }
}
