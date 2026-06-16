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
 * Endpoint 規劃（沿用 ASS1xxxx 系列慣例 /ASS0000/ASS1000/{op}{progNo}）：
 *   - queryASS17110         查詢
 *   - exportPDFASS17110     PDF 匯出
 *   - exportExcelASS17110   Excel 匯出
 *
 * 註：截至撰寫時間 backend swagger 尚未發佈 ASS17110 相關 endpoint，
 *     若上線前後端 path/欄位變更，請同步調整此 service 與 ass17110.model.ts。
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

  /** 匯出耗材進耗存之會計科目報表 Excel */
  exportExcelASS17110(body: PrintASS17110Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportExcelASS17110`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}
