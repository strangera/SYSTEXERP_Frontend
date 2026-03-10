import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ASS13050QueryRow,
  DownloadASS13050Request,
  QueryASS13050Request,
} from '../../../pages/ass/ass13050/ass13050.model';

@Injectable({
  providedIn: 'root'
})
export class ASS13050Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  /** 移轉交接表查詢 */
  queryASS13050(body: QueryASS13050Request): Observable<ApiResponse<ASS13050QueryRow[]>> {
    return this.http.post<ApiResponse<ASS13050QueryRow[]>>(`${this.apiUrl}/queryASS13050`, body);
  }

  /** 下載報表 */
  downloadReportASS13050(body: DownloadASS13050Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/downloadReportASS13050`, body, { responseType: 'blob' });
  }
}
