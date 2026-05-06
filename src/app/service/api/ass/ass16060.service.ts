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

/** 新增 API 明細列（占位，後端定案後調整） */
export interface ASS16060InsertDetailRow {
  GOODS_ID?: string;
  UNIT?: string;
  QTY?: number;
  ITEM_REMARK?: string;
}

/** 新增 API 請求（占位） */
export interface ASS16060InsertRequest {
  WH_ID: string;
  RETURN_EMP_ID: string;
  ORG_ID: string;
  APPLY_DATE: string | Date;
  REMARK?: string | null;
  /** 明細 JSON 字串 */
  DetailJson?: string;
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
