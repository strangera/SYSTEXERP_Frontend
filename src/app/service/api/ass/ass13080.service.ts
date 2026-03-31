import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ApproveASS13080Request,
  ASS13080QueryDataWrapper,
  ASS13080QueryRow,
  CancelASS13080Request,
  CreateASS13080Request,
  CreateASS13080Result,
  PrintASS13080Request,
  QueryASS13080Request,
  QueryFAASSETChooseListASS13060Request,
  QueryFAASSETChooseListASS13060Response,
  QueryFAASSETChooseListASS13060Result,
} from '@pages/ass/ass13080/ass13080.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** ASS13080 資產變賣作業 API */
@Injectable({ providedIn: 'root' })
export class ASS13080Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  /** 查詢 */
  queryASS13080(body: QueryASS13080Request): Observable<ApiResponse<ASS13080QueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS13080QueryRow[] | ASS13080QueryDataWrapper>>(
        `${this.apiUrl}/queryASS13080`,
        body
      )
      .pipe(
        map(res => {
          const raw = res.Data;
          const list = Array.isArray(raw) ? raw : (raw as ASS13080QueryDataWrapper)?.Details ?? [];
          const total =
            (res as ApiResponse<ASS13080QueryRow[]>).TotalCount ??
            (raw as ASS13080QueryDataWrapper)?.TotalRows ??
            0;
          return { ...res, Data: list, TotalCount: total } as ApiResponse<ASS13080QueryRow[]>;
        })
      );
  }

  /** 新增（確認變賣） */
  insertASS13080(body: CreateASS13080Request): Observable<ApiResponse<CreateASS13080Result>> {
    return this.http.post<ApiResponse<CreateASS13080Result>>(`${this.apiUrl}/insertASS13080`, body);
  }

  /** 變賣審核 */
  approveASS13080(body: ApproveASS13080Request): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/approveASS13080`, body);
  }

  /** 取消變賣 */
  cancelASS13080(body: CancelASS13080Request): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/cancelASS13080`, body);
  }

  /** 列印 */
  printASS13080(body: PrintASS13080Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFASS13080`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  /** 資產編號下拉（queryFAASSETChooseListASS13060） */
  queryFAASSETChooseListASS13060(
    body: QueryFAASSETChooseListASS13060Request
  ): Observable<ApiResponse<QueryFAASSETChooseListASS13060Response[]>> {
    return this.http
      .post<ApiResponse<QueryFAASSETChooseListASS13060Result | QueryFAASSETChooseListASS13060Response[]>>(
        `${this.apiUrl}/queryFAASSETChooseListASS13060`,
        body
      )
      .pipe(
        map(res => {
          const raw = res.Data;
          const list = Array.isArray(raw)
            ? raw
            : (raw as QueryFAASSETChooseListASS13060Result)?.QueryData ?? [];
          const total =
            (res as ApiResponse<QueryFAASSETChooseListASS13060Response[]>).TotalCount ??
            (raw as QueryFAASSETChooseListASS13060Result)?.TotalRows ??
            0;
          return {
            ...res,
            Data: list,
            TotalCount: total,
          } as ApiResponse<QueryFAASSETChooseListASS13060Response[]>;
        })
      );
  }
}

