import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { convertDateToYYYY } from '@shared/componentkit/table/table.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢參數
export interface QueryTLS2G030Params {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  budget_yy?: string;
  bus_type?: string[] | null;
  tlt_no?: string[] | null;
}

// 後端 Response DTO 的 Data 物件格式
export interface TLS2G030DataResponse {
  tlt_no: string;
  tlt_name: string;
  talent_id: number;
  SalesAmount01: number;
  SalesAmount02: number;
  SalesAmount03: number;
  SalesAmount04: number;
  SalesAmount05: number;
  SalesAmount06: number;
  SalesAmount07: number;
  SalesAmount08: number;
  SalesAmount09: number;
  SalesAmount10: number;
  SalesAmount11: number;
  SalesAmount12: number;
  AvgCommRate01: number;
  AvgCommRate02: number;
  AvgCommRate03: number;
  AvgCommRate04: number;
  AvgCommRate05: number;
  AvgCommRate06: number;
  AvgCommRate07: number;
  AvgCommRate08: number;
  AvgCommRate09: number;
  AvgCommRate10: number;
  AvgCommRate11: number;
  AvgCommRate12: number;
  CommAmount01: number;
  CommAmount02: number;
  CommAmount03: number;
  CommAmount04: number;
  CommAmount05: number;
  CommAmount06: number;
  CommAmount07: number;
  CommAmount08: number;
  CommAmount09: number;
  CommAmount10: number;
  CommAmount11: number;
  CommAmount12: number;
}

export interface QueryTLS2G030Result extends ApiResponse<TLS2G030DataResponse[]> {
  Data: TLS2G030DataResponse[];
  TotalCount: number;
  FooterTotal: TLS2G030DataResponse;
}

@Injectable({
  providedIn: 'root'
})
export class Tls2g030Service {
  private readonly apiUrl = environment.ApiUrl;

  constructor(private http: HttpClient) { }

  /**
   * 查詢專櫃預算作業清單
   * @param params 查詢條件
   * @returns 包含 TLS2G030DataResponse 陣列的 Observable
   */
  public queryTLS2G030(params: QueryTLS2G030Params): Observable<QueryTLS2G030Result> {
    const body = {
      ...params,
      budget_yy: convertDateToYYYY(params.budget_yy ? new Date(params.budget_yy) : new Date()), // 年
      PageSize: 30,
      PageIndex: 1,
      SortBy: [{ field: 'tlt_no', order: 1 }],
    }
    const url = `${this.apiUrl}/TLS0000/TLS2000/queryTLS2G030`;
    return this.http.post<QueryTLS2G030Result>(url, body);
  }
  /**
  * 匯出專櫃預算日報表為PDF
  * @param params 查詢條件
  * @returns Observable of a Blob (PDF file)
  */
  public exportTLS2G030Pdf(params: QueryTLS2G030Params): Observable<any> {
    const body = {
      ...params,
      budget_yy: convertDateToYYYY(params.budget_yy ? new Date(params.budget_yy) : new Date()), // 年
      SortBy: [{ field: 'tlt_no', order: 1 }],
    }
    return this.http.post(`${this.apiUrl}/TLS0000/TLS2000/exportTLS2G030Pdf`, body, {
      responseType: 'blob',
      observe: 'response'
    });
  }
  /**
  * 匯出專櫃預算日報表為Excel
  * @param params 查詢條件
  * @returns Observable of a Blob (Excel file)
  */
  public exportTLS2G030Excel(params: QueryTLS2G030Params): Observable<any> {
    const body = {
      ...params,
      budget_yy: convertDateToYYYY(params.budget_yy ? new Date(params.budget_yy) : new Date()), // 年
      SortBy: [{ field: 'tlt_no', order: 1 }],
    }
    return this.http.post(`${this.apiUrl}/TLS0000/TLS2000/exportTLS2G030Excel`, body, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
