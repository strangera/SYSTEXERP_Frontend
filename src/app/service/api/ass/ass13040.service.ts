import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS13040QueryDataWrapper,
  ASS13040QueryRequest,
  ASS13040QueryRow,
} from '@pages/ass/ass13040/ass13040.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** 對應 ApproveASS13040Request：ID 必填，其餘由後端自動帶入 */
export interface ASS13040ApproveRequest {
  ID: number; // 報廢單主檔 FAASSABANM.ID (必填)
  APRV_EMP_ID?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

/** 對應 DeleteASS13040Request：Ids 必填，其餘由後端自動帶入 */
export interface DeleteASS13040Request {
  Ids: number[]; // 主檔 ID 清單 (可多筆)
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

/** deleteASS13040 回傳的 Data 結構 */
export interface DeleteASS13040ResponseData {
  Message: string;
}

/** exportpdfass13040 Request（僅需帶 Ids） */
export interface ExportPDFASS13040Request {
  Ids: number[];
  MID?: number;
  STO_NO?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ASS13040Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private readonly http: HttpClient) {}

  approveASS13040(body: ASS13040ApproveRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/approveASS13040`, body);
  }

  deleteASS13040(body: DeleteASS13040Request): Observable<ApiResponse<DeleteASS13040ResponseData>> {
    return this.http.post<ApiResponse<DeleteASS13040ResponseData>>(
      `${this.apiUrl}/deleteASS13040`,
      body,
    );
  }

  /** 匯出報廢單 PDF */
  exportpdfass13040(body: ExportPDFASS13040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportpdfass13040`, body, {
      responseType: 'blob',
    });
  }

  queryASS13040(body: ASS13040QueryRequest): Observable<ApiResponse<ASS13040QueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS13040QueryDataWrapper | ASS13040QueryRow[]>>(
        `${this.apiUrl}/queryASS13040`,
        body,
      )
      .pipe(
        map(res => {
          const data = res.Data;
          if (Array.isArray(data)) {
            return {
              ...res,
              Data: data,
            } as ApiResponse<ASS13040QueryRow[]>;
          }

          return {
            ...res,
            Data: data?.QueryData ?? [],
            TotalCount: data?.TotalRows ?? data?.TotalCount ?? res.TotalCount ?? 0,
          } as ApiResponse<ASS13040QueryRow[]>;
        }),
      );
  }
}
