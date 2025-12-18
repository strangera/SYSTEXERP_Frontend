import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 根據 Swagger 定義的介面
export interface IExportPDFRequest {
  exportList:
  {
    talent_id: number,
    sam_yyymm: string,
    sad_date_Start: string | Date,
    sad_date_End: string | Date,
    money_type: string,
    money_type_name: string,
    sam_termno: number,
    tlt_term_type: string,
    tlt_term_type_name: string
  }[];
}

export interface IQueryRequest {
  PageSize: number;
  PageIndex: number;
  SortBy?: { field: string; order: number }[];
  tlt_noList?: string[];
  tlt_term_typeList?: string[];
  tlt_floorList?: string[];
  sam_yyymm?: string;
  money_typeList?: string[];
  sam_termnoList?: string[];
  tlt_buildingList?: string[];
  check_typeList?: string[];
  ven_uniform?: string;
}

export interface IQueryData {
  id: number,
  talent_id: number,
  sam_yyymm: string,
  money_type: string,
  money_type_name: string,
  sam_termno: number,
  tlt_term_type: string,
  tlt_term_type_name: string,
  tlt_no: string,
  contract_no: string,
  contract_subno: number,
  tlt_name: string
}


@Injectable({
  providedIn: 'root'
})
export class TLS2E080Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 匯出專櫃月對帳單 (PDF)
   * API: POST /TLS0000/TLS2000/exportTLS2E080PDF
   * @param data 查詢條件，包含 talent_id, sad_date_Start, sad_date_End
   * @returns 檔案串流 (Blob) 或其他 API 響應
   */
  exportTLS2E080PDF(data: IExportPDFRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/exportTLS2E080PDF`, data, { responseType: 'blob', observe: 'response' });
  }

  /**
   * 專櫃對帳單查詢
   * API: POST /TLS0000/TLS2000/queryTLS2E080
   * @param params 查詢條件
   * @returns 包含專櫃對帳單資料陣列的 API 響應
   */
  queryTLS2E080(params: IQueryRequest): Observable<ApiResponse<IQueryData[]>> {
    return this.http.post<ApiResponse<IQueryData[]>>(`${this.apiUrl}/queryTLS2E080`, params);
  }

  PrintTLS2E080PDF(data: IExportPDFRequest): Observable<ApiResponse<{ url: string }>> {
    return this.http.post<ApiResponse<{ url: string }>>(`${this.apiUrl}/printTLS2E080PDF`, data);
  }
}
