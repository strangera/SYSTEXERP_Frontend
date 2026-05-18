import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  QueryASS15030DetailResponse,
  QueryASS15030Request,
  QueryASS15030SumResponse,
} from '@pages/ass/ass15030/ass15030.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS15030Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) { }

  queryASS15030Sum(
    body: QueryASS15030Request
  ): Observable<ApiResponse<QueryASS15030SumResponse[]>> {
    return this.http.post<ApiResponse<QueryASS15030SumResponse[]>>(
      `${this.apiUrl}/queryASS15030Sum`,
      body
    );
  }

  queryASS15030Detail(
    body: QueryASS15030Request
  ): Observable<ApiResponse<QueryASS15030DetailResponse[]>> {
    return this.http.post<ApiResponse<QueryASS15030DetailResponse[]>>(
      `${this.apiUrl}/queryASS15030Detail`,
      body
    );
  }

  exportPDFASS15080Sum(body: QueryASS15030Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFASS15080Sum`, body, {
      responseType: 'blob',
    });
  }

  exportPDFASS15080Detail(body: QueryASS15030Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFASS15080Detail`, body, {
      responseType: 'blob',
    });
  }

  exportExcelASS15030Sum(body: QueryASS15030Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportExcelASS15030Sum`, body, {
      responseType: 'blob',
    });
  }

  exportExcelASS15030Detail(body: QueryASS15030Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportExcelASS15030Detail`, body, {
      responseType: 'blob',
    });
  }
}
