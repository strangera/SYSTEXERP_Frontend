import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  InsertSYS0790Request,
  QuerySYS0790Request,
  SYS0790QueryData,
  SYS0790QueryResponse,
} from '../../../pages/sys/sys0790/sys0790.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * SYS0790 使用者作業按鈕歷程報表 API service
 *
 * 後端對應 SP：
 *  - 查詢：dbo.SP_SYSUserOperationLogQuery
 *  - 新增：dbo.SP_SYSUserOperationLogInsert（前端按下任何功能按鈕後均需呼叫）
 *
 * 下拉統一使用 `DropdownApiService.queryTblUser()` 與 `getSYS1000Options('SYS_ID')`，
 * 不在本 service 重複包裝。
 */
@Injectable({ providedIn: 'root' })
export class SYS0790Service {
  private readonly http = inject(HttpClient);
  // 系統監控報表共用路由（對應 swagger /SYS0000/SYS0700）
  private readonly apiUrl = `${environment.ApiUrl}/SYS0000/SYS0700`;

  /**
   * SYS0790 查詢使用者作業按鈕歷程。
   * 後端清單包在 `Data.QueryData`，此處攤平成 `ApiResponse<SYS0790QueryData[]>`，
   * 並將 `TotalCount` 提到頂層供 table-report lazy loading 使用。
   */
  querySYS0790(body: QuerySYS0790Request): Observable<ApiResponse<SYS0790QueryData[]>> {
    return this.http
      .post<ApiResponse<SYS0790QueryResponse>>(`${this.apiUrl}/querySYS0790`, body)
      .pipe(
        map(res => ({
          ...res,
          Data: res.Data?.QueryData ?? [],
          TotalCount: res.Data?.TotalCount ?? res.TotalCount ?? 0,
        })),
      );
  }

  /**
   * SYS0790 新增使用者作業按鈕 LOG
   * 前端按下任何功能按鈕後（查詢／新增／修改／刪除…）皆需呼叫此 API。
   */
  insertSYS0790Log(body: InsertSYS0790Request): Observable<ApiResponse<{ Success: number }>> {
    return this.http.post<ApiResponse<{ Success: number }>>(`${this.apiUrl}/insertSYS0790`, body);
  }

  /**
   * SYS0790 匯出使用者作業按鈕歷程報表（PDF）
   */
  exportSYS0790PDF(body: QuerySYS0790Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportSYS0790`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }

  /**
   * SYS0790 匯出使用者作業按鈕歷程報表（Excel）
   */
  exportExcelSYS0790(body: QuerySYS0790Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportExcelSYS0790`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}
