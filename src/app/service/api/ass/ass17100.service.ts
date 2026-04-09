import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  QueryASS17100Request,
  QueryASS17100Response,
} from '@pages/ass/ass17100/ass17100.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS17100Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) {}

  queryASS17100(body: QueryASS17100Request): Observable<ApiResponse<QueryASS17100Response[]>> {
    return this.http.post<ApiResponse<QueryASS17100Response[]>>(
      `${this.apiUrl}/queryASS17100`,
      body,
    );
  }

  exportPDFASS17100(body: QueryASS17100Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFASS17100`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}
