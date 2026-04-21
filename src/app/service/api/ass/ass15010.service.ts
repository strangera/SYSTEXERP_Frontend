import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  QueryASS15010ApiRequest,
  QueryASS15010Response,
} from '@pages/ass/ass15010/ass15010.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS15010Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) { }

  queryASS15010(body: QueryASS15010ApiRequest): Observable<ApiResponse<QueryASS15010Response[]>> {
    return this.http.post<ApiResponse<QueryASS15010Response[]>>(
      `${this.apiUrl}/queryASS15010`,
      body,
    )
      .pipe(
        map(res => {
          return {
            ...res,
            Data: res.Data,
            TotalCount: res.Data.length
          } as ApiResponse<QueryASS15010Response[]>;
        })
      );
  }

  exportLabelTablePDFASS15010(body: QueryASS15010ApiRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportLabelTablePDFASS15010`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  exportLabelPDFASS15010(body: QueryASS15010ApiRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportLabelPDFASS15010`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}
