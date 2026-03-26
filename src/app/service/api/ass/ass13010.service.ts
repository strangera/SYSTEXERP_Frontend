import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  DetailASS13010Request,
  DetailASS13010Response,
  DeleteASS13010Request,
  DeleteASS13010ResultApiResponse,
  ExportPDFASS13010Request,
  InsertASS13010Request,
  InsertASS13010Response,
  QueryASS13010Request,
  QueryASS13010Response,
  QueryASS13010ResultApiResponse,
} from '@pages/ass/ass13010/ass13010.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS13010Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) {}

  queryASS13010(body: QueryASS13010Request): Observable<ApiResponse<QueryASS13010Response[]>> {
    return this.http.post<QueryASS13010ResultApiResponse>(`${this.apiUrl}/queryASS13010`, body).pipe(
      map(
        res =>
          ({
            ...res,
            Data: res.Data?.QueryData ?? [],
            TotalCount: res.Data?.TotalRows ?? res.TotalCount ?? 0,
          }) as ApiResponse<QueryASS13010Response[]>,
      ),
    );
  }

  detailASS13010(body: DetailASS13010Request): Observable<ApiResponse<DetailASS13010Response>> {
    return this.http.post<ApiResponse<DetailASS13010Response>>(`${this.apiUrl}/detailASS13010`, body);
  }

  insertASS13010(body: InsertASS13010Request): Observable<ApiResponse<InsertASS13010Response>> {
    return this.http.post<ApiResponse<InsertASS13010Response>>(`${this.apiUrl}/insertASS13010`, body);
  }

  /**
   * 匯出 PDF
   */
  exportPDFASS13010(body: ExportPDFASS13010Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFASS13010`, body, { responseType: 'blob' });
  }

  /**
   * 刪除
   */
  deleteASS13010(body: DeleteASS13010Request): Observable<DeleteASS13010ResultApiResponse> {
    return this.http.post<DeleteASS13010ResultApiResponse>(`${this.apiUrl}/deleteASS13010`, body);
  }
}

