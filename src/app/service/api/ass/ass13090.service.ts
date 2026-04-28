import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AmorASS13090Request,
  AmorASS13090Response,
  AmorASS13090Result,
  AmortizeASS13090Request,
  AmortizeASS13090Response,
  ContinuedASS13090Request,
  ContinuedASS13090Response,
  DetailASS13090Request,
  DetailASS13090Result,
  PrintASS13090Request,
  QueryASS13090QueryDataRow,
  QueryASS13090Request,
} from '@pages/ass/ass13090/ass13090.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** ASS13090 資產攤提作業查詢 */
@Injectable({ providedIn: 'root' })
export class ASS13090Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) { }

  queryASS13090(body: QueryASS13090Request): Observable<ApiResponse<QueryASS13090QueryDataRow[]>> {
    return this.http.post<ApiResponse<QueryASS13090QueryDataRow[]>>(`${this.apiUrl}/queryASS13090`, body);
  }

  detailASS13090(body: DetailASS13090Request): Observable<ApiResponse<DetailASS13090Result>> {
    return this.http.post<ApiResponse<DetailASS13090Result>>(`${this.apiUrl}/detailASS13090`, body);
  }

  amorASS13090(body: AmorASS13090Request): Observable<ApiResponse<AmorASS13090Response[] | AmorASS13090Result>> {
    return this.http.post<ApiResponse<AmorASS13090Response[] | AmorASS13090Result>>(`${this.apiUrl}/amorASS13090`, body);
  }

  exportPDFASS13090(body: PrintASS13090Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFASS13090`, body, { observe: 'response', responseType: 'blob' });
  }

  exportExcelASS13090(body: PrintASS13090Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportExcelASS13090`, body, { observe: 'response', responseType: 'blob', });
  }

  continuedASS13090(body: ContinuedASS13090Request): Observable<ApiResponse<ContinuedASS13090Response>> {
    return this.http.post<ApiResponse<ContinuedASS13090Response>>(`${this.apiUrl}/continuedASS13090`, body);
  }

  amortizeASS13090(body: AmortizeASS13090Request): Observable<ApiResponse<AmortizeASS13090Response>> {
    return this.http.post<ApiResponse<AmortizeASS13090Response>>(`${this.apiUrl}/amortizeASS13090`, body);
  }
}
