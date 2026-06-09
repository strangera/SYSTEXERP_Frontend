import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  CloseFIN72050Request,
  CloseVoidFIN72050Result,
  DeleteFIN72050Request,
  DeleteFIN72050Result,
  FIN72050Detail,
  FIN72050QueryData,
  GetPCCNoFIN72050Request,
  GetPCCNoFIN72050Result,
  InsertFIN72050Request,
  InsertFIN72050Result,
  QueryFIN72050DetailRequest,
  QueryFIN72050Request,
  UpdateFIN72050Request,
  UpdateFIN72050Result,
  VoidFIN72050Request,
  getFIN72050StatusName,
} from '@shared/models/fin/fin72050.model';

/**
 * 零用金盤點作業 (FIN72050) API service
 *
 * 下拉資料統一使用 `DropdownApiService` (queryTblUserOrgid / querySys3100 /
 * queryPOS2064MPCS_RqstNoDropDownList)，不在本 service 重複包裝。
 */
@Injectable({ providedIn: 'root' })
export class FIN72050Service {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/FIN70000';

  /** 列表查詢 */
  queryFIN72050(req: QueryFIN72050Request): Observable<BaseQueryResponse<FIN72050QueryData>> {
    return this.http
      .post<BaseQueryResponse<FIN72050QueryData>>(`${this.apiUrl}/queryFIN72050`, req)
      .pipe(
        map(res => ({
          ...res,
          Data: (res.Data ?? []).map(item => ({
            ...item,
            // 若後端未回 PCC_Status_Name，前端 map 一次；有則保留後端值
            PCC_Status_Name: item.PCC_Status_Name?.trim()
              ? item.PCC_Status_Name
              : getFIN72050StatusName(item.PCC_Status),
          })),
        }))
      );
  }

  /** 查詢單筆詳細（編輯 / 檢視） */
  queryFIN72050Detail(req: QueryFIN72050DetailRequest): Observable<ApiResponse<FIN72050Detail>> {
    return this.http.post<ApiResponse<FIN72050Detail>>(`${this.apiUrl}/queryFIN72050Detail`, req);
  }

  /** 自動取號（新增第一階段：保管人+盤點日期 → 盤點單號 + 四個金額） */
  getPCCNoFIN72050(req: GetPCCNoFIN72050Request): Observable<ApiResponse<GetPCCNoFIN72050Result>> {
    return this.http.post<ApiResponse<GetPCCNoFIN72050Result>>(`${this.apiUrl}/getPCCNoFIN72050`, req);
  }

  /** 確定新增 */
  insertFIN72050(req: InsertFIN72050Request): Observable<ApiResponse<InsertFIN72050Result>> {
    return this.http.post<ApiResponse<InsertFIN72050Result>>(`${this.apiUrl}/insertFIN72050`, req);
  }

  /** 確定修改 */
  updateFIN72050(req: UpdateFIN72050Request): Observable<ApiResponse<UpdateFIN72050Result>> {
    return this.http.post<ApiResponse<UpdateFIN72050Result>>(`${this.apiUrl}/updateFIN72050`, req);
  }

  /** 結案：PCC_Status 1 → 2 */
  closeFIN72050(req: CloseFIN72050Request): Observable<ApiResponse<CloseVoidFIN72050Result>> {
    return this.http.post<ApiResponse<CloseVoidFIN72050Result>>(`${this.apiUrl}/closeFIN72050`, req);
  }

  /** 作廢：PCC_Status 1 → 9 */
  voidFIN72050(req: VoidFIN72050Request): Observable<ApiResponse<CloseVoidFIN72050Result>> {
    return this.http.post<ApiResponse<CloseVoidFIN72050Result>>(`${this.apiUrl}/voidFIN72050`, req);
  }

  /** 批次刪除（查詢頁勾選後刪除多筆盤點單） */
  deleteFIN72050(req: DeleteFIN72050Request): Observable<ApiResponse<DeleteFIN72050Result>> {
    return this.http.post<ApiResponse<DeleteFIN72050Result>>(`${this.apiUrl}/deleteFIN72050`, req);
  }
}
