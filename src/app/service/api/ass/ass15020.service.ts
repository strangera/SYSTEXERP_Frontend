import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS15020QueryDataWrapper,
  ASS15020QueryRequest,
} from '@pages/ass/ass15020/ass15020.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS15020Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * ASS15020 查詢
   *
   * API Response Data 結構：
   * {
   *   Details: [...],
   *   Total: {
   *     TtlOriPurchaseAmt,
   *     TtlChangeAmt,
   *     TtlTotalAmt
   *   },
   *   TotalRows,
   *   TotalPages
   * }
   *
   * 不在 Service 內將 Data.Details 攤平成陣列，
   * 保留完整 Wrapper 給 Component 做資料接收。
   */
  queryASS15020(
    body: ASS15020QueryRequest
  ): Observable<ApiResponse<ASS15020QueryDataWrapper>> {
    return this.http.post<ApiResponse<ASS15020QueryDataWrapper>>(
      `${this.apiUrl}/queryASS15020`,
      body
    );
  }

  /**
   * ASS15020 匯出 Excel
   */
  exportExcelASS15020(body: ASS15020QueryRequest): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/exportExcelASS15020`,
      body,
      {
        responseType: 'blob',
      }
    );
  }
}