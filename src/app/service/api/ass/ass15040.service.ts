import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  PrintASS15040Request,
  QueryASS15040Request,
  QueryASS15040Result,
} from '@pages/ass/ass15040/ass15040.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS15040Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) { }

  /** 查詢財產目錄之會計科目報表 */
  queryASS15040(body: QueryASS15040Request): Observable<ApiResponse<QueryASS15040Result | null>> {
    return this.http.post<ApiResponse<QueryASS15040Result | null>>(`${this.apiUrl}/queryASS15040`, body);
  }

  /** 匯出財產目錄之會計科目報表 PDF */
  exportPDFASS15040(body: PrintASS15040Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFASS15040`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  /** 匯出財產目錄之會計科目報表 Excel */
  exportExcelASS15040(body: PrintASS15040Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportExcelASS15040`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}
