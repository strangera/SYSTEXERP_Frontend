import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QueryASS15070Request, QueryASS15070Row } from '@pages/ass/ass15070/ass15070.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

interface QueryASS15070Result {
  Details: QueryASS15070Row[];
  TotalRows: number;
  TotalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ASS15070Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  /**
   * 查詢財產進貨清單
   */
  queryASS15070(payload: QueryASS15070Request): Observable<ApiResponse<QueryASS15070Row[]>> {
    return this.http
      .post<ApiResponse<QueryASS15070Result>>(`${this.apiUrl}/queryASS15070`, payload)
      .pipe(
        map(res => ({
          ...res,
          Data: res.Data?.Details ?? [],
          TotalCount: res.Data?.TotalRows ?? res.TotalCount ?? 0,
        }) as ApiResponse<QueryASS15070Row[]>),
      );
  }

  /**
   * 匯出財產進貨清單 PDF
   */
  exportPDFASS15070(payload: QueryASS15070Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFASS15070`, payload, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}
