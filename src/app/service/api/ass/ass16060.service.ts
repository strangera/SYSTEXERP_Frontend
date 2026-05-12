import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS16060QueryRequest, ASS16060QueryRow } from '@pages/ass/ass16060/ass16060.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** CRU router state / 表單列資料（與 BasicCruPage rowdata 對齊） */
export interface ASS16060CruRowData {
  WH_ID?: string | null;
  RETURN_EMP_ID?: string | null;
  ORG_ID?: string | null;
  APPLY_DATE?: Date | string | null;
  REMARK?: string | null;
}

/** insertASS16060 — DetailTable 列（ASS16060DetailItem） */
export interface ASS16060DetailItem {
  LINE_NUM?: number | null;
  GOODS_ID?: string | null;
  QTY?: number | null;
  GOODS_PRICE?: number | null;
  TAX_CODE?: string | null;
  AMT?: number | null;
  CHECK_QTY?: number | null;
  NOTES?: string | null;
}

/** insertASS16060 — 請求本體 */
export interface ASS16060InsertRequest {
  MID: number;
  STO_NO: string;
  WH_ID: string;
  EMP_ID: string;
  ORG_ID: string;
  RETURN_DATE: string;
  NOTES?: string | null;
  CRT_USR_No: string;
  DetailTable: ASS16060DetailItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ASS16060Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) {}

  queryASS16060(
    body: ASS16060QueryRequest,
  ): Observable<ApiResponse<ASS16060QueryRow[]>> {
    return this.http.post<ApiResponse<ASS16060QueryRow[]>>(
      `${this.apiUrl}/queryASS16060`,
      body,
    );
  }

  insertASS16060(
    body: ASS16060InsertRequest,
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiUrl}/insertASS16060`,
      body,
    );
  }
}
