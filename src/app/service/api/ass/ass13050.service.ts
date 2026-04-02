import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ASS13050QueryDataWrapper,
  ASS13050QueryRow,
  DownloadASS13050Request,
  QueryASS13050Request,
} from '../../../pages/ass/ass13050/ass13050.model';

@Injectable({
  providedIn: 'root'
})
export class ASS13050Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) { }

  /** 移轉交接表查詢 */
  queryASS13050(body: QueryASS13050Request): Observable<ApiResponse<ASS13050QueryRow[]>> {
    return this.http.post<ApiResponse<ASS13050QueryDataWrapper>>(`${this.apiUrl}/queryASS13050`, body)
      .pipe(
        map(res => {
          return {
            ...res,
            Data: res.Data.QueryData,
            TotalCount: res.Data.TotalRows
          } as ApiResponse<ASS13050QueryRow[]>
        })
      );
  }

  /** 下載報表 */
  downloadReportASS13050(body: DownloadASS13050Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportExcelASS13050`, body, { responseType: 'blob', observe: 'response' });
  }
}
