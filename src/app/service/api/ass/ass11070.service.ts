import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  DetailASS11070Request,
  DetailASS11070Response,
  InsertASS11070Request,
  QueryASS11070DataWrapper,
  QueryASS11070Request,
  QueryASS11070Response,
  UpdateASS11070Request,
} from '@pages/ass/ass11070/ass11070.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS11070Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) {}

  /**
   * 查詢備用供應商資料
   */
  queryASS11070(payload: QueryASS11070Request): Observable<ApiResponse<QueryASS11070Response[]>> {
    return this.http
      .post<ApiResponse<QueryASS11070DataWrapper>>(`${this.apiUrl}/queryASS11070`, payload)
      .pipe(
        map(res => {
          const data = res.Data;
          const list = Array.isArray(data) ? data : data?.QueryData ?? data?.Data ?? [];
          const total = !Array.isArray(data)
            ? data?.TotalCount ?? (res as any).TotalCount ?? list.length
            : (res as any).TotalCount ?? list.length;
          return {
            ...res,
            Data: list,
            TotalCount: total,
          } as ApiResponse<QueryASS11070Response[]>;
        })
      );
  }

  /**
   * 查詢備用供應商明細
   */
  detailASS11070(payload: DetailASS11070Request): Observable<ApiResponse<DetailASS11070Response>> {
    return this.http.post<ApiResponse<DetailASS11070Response>>(`${this.apiUrl}/detailASS11070`, payload);
  }

  /**
   * 新增備用供應商資料
   */
  insertASS11070(payload: InsertASS11070Request): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/insertASS11070`, payload);
  }

  /**
   * 更新備用供應商資料
   */
  updateASS11070(payload: UpdateASS11070Request): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/updateASS11070`, payload);
  }

  /**
   * 匯出備用供應商資料 PDF
   */
  exportPDFASS11070(payload: QueryASS11070Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFASS11070`, payload, { responseType: 'blob' });
  }
}
