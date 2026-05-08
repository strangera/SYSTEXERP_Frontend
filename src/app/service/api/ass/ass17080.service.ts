import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  QueryASS17080Request,
  QueryASS17080Response,
} from '@pages/ass/ass17080/ass17080.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS17080Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) { }

  /** 查詢報廢明細表 */
  queryASS17080(body: QueryASS17080Request): Observable<ApiResponse<QueryASS17080Response>> {
    return this.http.post<ApiResponse<QueryASS17080Response>>(
      `${this.apiUrl}/queryASS17080`,
      body,
    );
  }

  /** 匯出移轉交接作業明細 Excel */
  exportExcelASS17080(body: QueryASS17080Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportExcelASS17080`, body, { responseType: 'blob' });
  }
}
