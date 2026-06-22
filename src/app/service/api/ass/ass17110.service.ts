import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  PrintASS17110Request,
  QueryASS17110Request,
  QueryASS17110Response,
} from '@pages/ass/ass17110/ass17110.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * ASS17110 耗材進耗存之會計科目報表 API
 * 後端 SP：dbo.SP_ASS17110Query
 * Endpoint（已對齊 swagger /ASS0000/ASS1000）：
 *   - queryASS17110         查詢
 *   - exportPDFASS17110     PDF 匯出
 *
 * 註：後端僅提供 PDF 匯出，無 Excel 匯出。
 */
@Injectable({
  providedIn: 'root',
})
export class ASS17110Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) {}

  /** 查詢耗材進耗存之會計科目報表 */
  queryASS17110(
    body: QueryASS17110Request,
  ): Observable<ApiResponse<QueryASS17110Response[]>> {
    return this.http.post<ApiResponse<QueryASS17110Response[]>>(
      `${this.apiUrl}/queryASS17110`,
      body,
    );
  }

  /** 匯出耗材進耗存之會計科目報表 PDF */
  exportPDFASS17110(body: PrintASS17110Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFASS17110`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}
