import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
// 零用金盤點作業 (FIN72050) 資料模型
type PCCType = '1' | '2' | string; // 1=總額, 2=點鈔
/* -------------------------------------------------------------------------- */
/* 列表查詢                                                                    */
/* -------------------------------------------------------------------------- */

export interface QueryFIN72050Request extends ApiRequest {
  PCC_No?: string;              // 盤點單號（模糊查詢）
  Keep_UsrNo?: string;          // 保管人代碼
  Keep_OrgID?: string;          // 保管單位
  Keep_QuotaAmt_From?: number;  // 額度（起）
  Keep_QuotaAmt_To?: number;    // 額度（迄）
  PCS_RqstNo?: string;          // 支出請款單號
  PCC_Status?: string;          // 盤點單狀態（1/2/9）
  PCC_DIFF_AMT_From?: number;   // 盤點餘額/差異數（起）
  PCC_DIFF_AMT_To?: number;     // 盤點餘額/差異數（迄）
  PCS_Remark?: string;          // 說明（模糊）
  PCC_DateFrom?: string;        // 盤點日期（起）
  PCC_DateTo?: string;          // 盤點日期（迄）
}

export interface FIN72050QueryData {
  SeqNo: number;
  PCS_PST_No: string;        // 盤點單號
  PCC_Date: string;          // 盤點日期
  Keep_UsrName: string;      // 保管人姓名（swagger 未回 Keep_UsrNo，故省略）
  Keep_QuotaAmt: number;     // 零用金額度
  PCC_Status: string;        // 狀態名稱（queryFIN72050 後端直接回中文：盤點中/已結案/作廢）
  PCC_Status_Name?: string;  // 狀態名稱（前端 map 自 PCC_Status，便於 columns 統一用此欄位）
  PCC_ActAmt: number;        // 盤點金額
  PCC_NOPAY_AMT: number;     // 已支付未請款金額
  PCC_NOREC_AMT: number;     // 已請款未撥補金額
  PCC_DIFF_AMT: number;      // 盤點後差異數
  PCS_Remark?: string;       // 備註說明
}

/* -------------------------------------------------------------------------- */
/* 取單筆詳細（編輯 / 檢視）                                                    */
/* -------------------------------------------------------------------------- */

export interface QueryFIN72050DetailRequest {
  PCS_PST_No: string;
}

export interface FIN72050Detail {
  id: number;
  MID: number;
  SYS_StoreNo: string;
  PCS_PST_No: string;
  PCC_Date: string;
  Keep_UsrNo: string;
  Keep_UsrName: string;
  Keep_OrgID: string;
  Keep_QuotaAmt: number;
  PCC_Status: '1' | '2' | '9' | string;
  PCC_Status_Name: string;
  PCC_ActAmt: number;
  PCC_NOPAY_AMT: number;
  PCC_NOREC_AMT: number;
  PCC_DIFF_AMT: number;
  PCS_APRVDate?: string;
  PCS_APRVUsrNo?: string;
  PCS_APRVUsrName?: string;
  PCC_Type: PCCType;
  PCC_ActAmt_1: number;
  PCC_ActAmt_5: number;
  PCC_ActAmt_10: number;
  PCC_ActAmt_50: number;
  PCC_ActAmt_100: number;
  PCC_ActAmt_200: number;
  PCC_ActAmt_500: number;
  PCC_ActAmt_1000: number;
  PCC_ActAmt_2000: number;
  PCC_CountAmt: number;
  PCS_Remark?: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

/* -------------------------------------------------------------------------- */
/* 自動取號(新增第一階段)                                                       */
/* -------------------------------------------------------------------------- */

export interface GetPCCNoFIN72050Request {
  DateNow: string;     // YYYY-MM-DD
  Keep_UsrNo: string;
}

export interface GetPCCNoFIN72050Result {
  PCC_SerialNo: string;
  Keep_QuotaAmt: number;
  PCC_NOPAY_AMT: number;
  PCC_NOREC_AMT: number;
  PCC_DIFF_AMT: number;
}

/* -------------------------------------------------------------------------- */
/* 新增 / 修改                                                                 */
/* -------------------------------------------------------------------------- */

export interface InsertFIN72050Request {
  MID?: number;
  SYS_StoreNo: string;
  PCS_PST_No: string;
  PCC_Date: string;
  Keep_UsrNo: string;
  Keep_UsrName?: string;
  Keep_OrgID?: string;
  Keep_QuotaAmt: number;
  PCC_Type: PCCType;
  PCC_CountAmt?: number;
  PCC_ActAmt_1?: number;
  PCC_ActAmt_5?: number;
  PCC_ActAmt_10?: number;
  PCC_ActAmt_50?: number;
  PCC_ActAmt_100?: number;
  PCC_ActAmt_200?: number;
  PCC_ActAmt_500?: number;
  PCC_ActAmt_1000?: number;
  PCC_ActAmt_2000?: number;
  PCS_Remark?: string;
}

export interface UpdateFIN72050Request {
  PCS_PST_No: string;
  PCC_Type: PCCType;
  PCC_CountAmt?: number;
  PCC_ActAmt_1?: number;
  PCC_ActAmt_5?: number;
  PCC_ActAmt_10?: number;
  PCC_ActAmt_50?: number;
  PCC_ActAmt_100?: number;
  PCC_ActAmt_200?: number;
  PCC_ActAmt_500?: number;
  PCC_ActAmt_1000?: number;
  PCC_ActAmt_2000?: number;
  PCS_Remark?: string;
}

export interface InsertFIN72050Result {
  PCS_PST_No: string;
  PCC_NOPAY_AMT?: number;
  PCC_NOREC_AMT?: number;
  PCC_DIFF_AMT?: number;
}

export type UpdateFIN72050Result = InsertFIN72050Result;

/* -------------------------------------------------------------------------- */
/* 結案 / 作廢                                                                 */
/* -------------------------------------------------------------------------- */

export interface CloseFIN72050Request {
  PCS_PST_No: string;
}

export interface VoidFIN72050Request {
  PCS_PST_No: string;
}

export interface CloseVoidFIN72050Result {
  PCS_PST_No?: string;
  ReturnCode: number;   // 0=成功, -1=狀態錯誤/找不到, -99=系統錯誤
  ReturnMsg: string;
}

/* -------------------------------------------------------------------------- */
/* 共用 / UI 常數                                                              */
/* -------------------------------------------------------------------------- */

// 狀態下拉（前端硬編，SPEC §7.2）
export const FIN72050_STATUS_OPTIONS: { No: string; Name: string; Label: string }[] = [
  { No: '1', Name: '盤點中', Label: '1 - 盤點中' },
  { No: '2', Name: '已結案', Label: '2 - 已結案' },
  { No: '9', Name: '作廢', Label: '9 - 作廢' },
];

// 面額（依規格欄位 PCC_ActAmt_{denom}，依使用者要求由大至小顯示）
// qtyControlName 對應「數量」FormControl（qty_{denom}），三欄表格使用。
export const FIN72050_DENOMINATIONS: {
  key: string;
  controlName: string;
  qtyControlName: string;
  label: string;
  amount: number;
}[] = [
    { key: '2000', controlName: 'PCC_ActAmt_2000', qtyControlName: 'qty_2000', label: '2000 元', amount: 2000 },
    { key: '1000', controlName: 'PCC_ActAmt_1000', qtyControlName: 'qty_1000', label: '1000 元', amount: 1000 },
    { key: '500', controlName: 'PCC_ActAmt_500', qtyControlName: 'qty_500', label: '500 元', amount: 500 },
    { key: '200', controlName: 'PCC_ActAmt_200', qtyControlName: 'qty_200', label: '200 元', amount: 200 },
    { key: '100', controlName: 'PCC_ActAmt_100', qtyControlName: 'qty_100', label: '100 元', amount: 100 },
    { key: '50', controlName: 'PCC_ActAmt_50', qtyControlName: 'qty_50', label: '50 元', amount: 50 },
    { key: '10', controlName: 'PCC_ActAmt_10', qtyControlName: 'qty_10', label: '10 元', amount: 10 },
    { key: '5', controlName: 'PCC_ActAmt_5', qtyControlName: 'qty_5', label: '5 元', amount: 5 },
    { key: '1', controlName: 'PCC_ActAmt_1', qtyControlName: 'qty_1', label: '1 元', amount: 1 },
  ];

export function getFIN72050StatusName(status?: string | null): string {
  const map: Record<string, string> = {
    '1': '盤點中',
    '2': '已結案',
    '9': '作廢',
  };
  return map[String(status ?? '')] ?? '';
}

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
  queryFIN72050(req: QueryFIN72050Request): Observable<ApiResponse<FIN72050QueryData[]>> {
    // 後端回傳：{ Status, Data: { QueryData: T[], TotalCount, TotalPage }, Message, ... }
    // 為符合前端規範（元件用 res.Data / res.TotalCount），在此 map 拍平。
    interface RawResponse {
      Status: string;
      Message: string;
      Data?: {
        QueryData?: FIN72050QueryData[];
        TotalCount?: number;
        TotalPage?: number;
      };
    }
    return this.http.post<RawResponse>(`${this.apiUrl}/queryFIN72050`, req).pipe(
      map(res => {
        // queryFIN72050 後端的 PCC_Status 直接回中文（swagger 描述：盤點單狀態名稱），
        // 與 detailFIN72050 回代碼不同。前端統一以 PCC_Status_Name 顯示中文。
        const items = (res.Data?.QueryData ?? []).map(item => ({
          ...item,
          PCC_Status_Name: item.PCC_Status ?? '',
        }));
        return {
          Status: res.Status,
          Message: res.Message,
          Data: items,
          TotalCount: res.Data?.TotalCount ?? items.length,
          TotalPage: res.Data?.TotalPage ?? 0,
        } as ApiResponse<FIN72050QueryData[]>;
      })
    );
  }

  /** 查詢單筆詳細（編輯 / 檢視） */
  queryFIN72050Detail(req: QueryFIN72050DetailRequest): Observable<ApiResponse<FIN72050Detail>> {
    return this.http.post<ApiResponse<FIN72050Detail>>(`${this.apiUrl}/detailFIN72050`, req);
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
}
