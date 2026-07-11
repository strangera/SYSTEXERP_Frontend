import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';

type DateOrString = Date | string | null;

/**
 * ASS16040 領用審核作業 — 查詢請求
 * SPEC §7.1/§7.2: queryASS16040M（主檔模式）/ queryASS16040（主檔+明細模式）共用此 Request
 */
export interface ASS16040QueryRequest extends ApiRequest {
  MTAPPLY_ID?: string | null;          // 領用單號（長度 15）
  EMP_ID?: string | null;              // 申請人代號
  FASITEM_ID?: number | null;          // 品項編號（FASITEM.ID, int64）
  APPLY_DATE_S?: DateOrString;         // 申請日期起
  APPLY_DATE_E?: DateOrString;         // 申請日期迄
  APRV_DATE_S?: DateOrString;          // 審核日期起
  APRV_DATE_E?: DateOrString;          // 審核日期迄
  ORG_ID?: string | null;              // 部門代號
  CHECK_DATE?: DateOrString;           // 發料日期
  APRV_EMP_ID?: string | null;         // 審核者代號
  WH_ID?: string | null;               // 倉別
  STATUS?: string | null;              // 領用單狀態 (MTAPPLY_STATUS)
}

/**
 * ASS16040 主檔模式列（給查詢頁用）
 * 來源：POST /ASS0000/ASS1000/queryASS16040M
 * SPEC §7.1
 */
export interface ASS16040MasterRow {
  MASTER_ID: number;
  MTAPPLY_ID: string;
  EMP_ID: string;
  ORG_ID: string;
  APPLY_DATE: string;
  MTAPPLY_STATUS: string;
  AMT: number | null;
  APRV_EMP_ID: string | null;
  APRV_DATE: string | null;
  WH_ID: string;
  CHECK_DATE: string | null;
  TOTAL_COUNT: number;              // 明細筆數
  // ↓ 後端待補欄位（user-answer-Q-007）；前端 model 預留 binding
  SUGGEST_DAYS?: number | null;
  NOTES?: string | null;
}

/**
 * ASS16040 主檔 + 明細模式列（給 CRU 頁用）
 * 後端把主檔欄位 join 在每筆明細上。
 * 來源：POST /ASS0000/ASS1000/queryASS16040
 * SPEC §7.2
 */
export interface ASS16040DetailRow extends ASS16040MasterRow {
  DETAIL_ID: number;
  MID: number | null;
  STO_NO: string | null;
  MTAPPLYM_ID: number;
  FASITEM_ID: number;
  LINE_NUM: number;
  QTY: number;
  GOODS_PRICE: number | null;
  TAX_CODE: string | null;
  ITEM_AMT: number | null;
  CHECK_QTY: number | null;
  RETURN_QTY: number | null;
  NOTES: string | null;             // 明細層 NOTES（單項說明）
  GOODS_ID?: string;                // 攤平自 FASITEM lookup，供前端排序/顯示
  GOODS_NAME?: string;
  UNIT_NAME?: string;
  CRT_USR_No?: string | null;
  CRT_Date?: string | null;
  CRT_USR_Name?: string | null;
  UPD_USR_No?: string | null;
  UPD_Date?: string | null;
  UPD_USR_Name?: string | null;
}

/**
 * 後端原始（巢狀）回傳結構 — service 層展平 mapping 使用
 * SPEC §10.2
 */
export interface ASS16040NestedQueryData<T> {
  QueryData?: T[] | null;
  TotalCount?: number;
  TotalPage?: number;
}

/**
 * 審核 Request — 只送 MTAPPLY_ID（APRV_EMP_ID 由後端 JWT 取，前端不送）
 * SPEC §7.3, user-answer-Q-005
 */
export interface ASS16040ApproveRequest {
  MTAPPLY_ID: string;
}

/**
 * FASITEM 下拉 row 子集（CRU 頁明細「單位」資料來源）
 * SPEC §6.3, user-answer-Q-009/011
 */
export interface FASITEMDropdownRow {
  ID: number;                     // 對應 FASITEM_ID（下拉 value）
  GOODS_ID: string;
  GOODS_NAME: string;
  UNIT_NAME?: string | null;      // 單位名稱（明細「單位」欄位直接顯示此欄位）
  UNIT?: string | null;
}
