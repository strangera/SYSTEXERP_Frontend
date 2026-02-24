import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  QueryASS11060DataWrapper,
  QueryASS11060Request,
  QueryASS11060Response,
  UpdateASS11060Request,
} from './ass11060.model';

@Injectable({
  providedIn: 'root'
})
export class ASS11060Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 廠商資料查詢
   * 將巢狀 Data.Data 攤平，回傳 Data 直接為陣列，TotalCount 提升至頂層
   */
  queryASS11060(params: QueryASS11060Request): Observable<ApiResponse<QueryASS11060Response[]>> {
    return this.http.post<ApiResponse<QueryASS11060DataWrapper>>(`${this.apiUrl}/queryASS11060`, params)
      .pipe(
        map(res => ({
          ...res,
          Data: res.Data as unknown as QueryASS11060Response[],
          TotalCount: (res.TotalCount ?? 0),
        }))
      );
  }

  /**
   * 廠商資料更新
   */
  updateASS11060(params: UpdateASS11060Request): Observable<ApiResponse<Record<string, never>>> {
    return this.http.post<ApiResponse<Record<string, never>>>(`${this.apiUrl}/updateASS11060`, params);
  }

  /**
   * 匯出 PDF
   */
  exportASS11060PDF(params: QueryASS11060Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFASS11060`, params, { responseType: 'blob' });
  }

  /**
   * 匯出 Excel
   */
  exportASS11060(params: QueryASS11060Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/ExportASS11060`, params, { responseType: 'blob' });
  }
}
