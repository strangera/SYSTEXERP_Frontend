import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * 領用退料查詢 — 請求參數（欄位名稱待後端定案時可再對齊）
 */
export interface ASS16060QueryRequest extends BaseQueryRequest {
  WH_ID?: string | null;
  RETURN_STATUS?: string | null;
  RETURN_NO?: string | null;
  RETURN_EMP_ID?: string | null;
  ORG_ID?: string | null;
  RETURN_DATE_S?: string | null;
  RETURN_DATE_E?: string | null;
}

/**
 * 領用退料查詢 — 列表列
 */
export interface ASS16060QueryRow {
  ID?: string | number | null;
  RETURN_NO?: string | null;
  RETURN_EMP_ID?: string | null;
  /** 倉別代碼（檢視時下拉 value；後端有回才顯示） */
  WH_ID?: string | null;
  WH_NAME?: string | null;
  ORG_ID?: string | null;
  RETURN_DATE?: string | null;
  RETURN_STATUS_NAME?: string | null;
  DETAIL_COUNT?: number | string | null;
  /** 退回說明（列表有回才帶入檢視） */
  REMARK?: string | null;
}

/** 列表列 → CRU 表單（控制項名與 ass16060-cru dataForm 一致） */
export function ass16060QueryRowToCruFormValue(row: ASS16060QueryRow): {
  WH_ID: string | null;
  RETURN_EMP_ID: string | null;
  ORG_ID: string | null;
  APPLY_DATE: Date | null;
  REMARK: string | null;
} {
  return {
    WH_ID: row.WH_ID ?? null,
    RETURN_EMP_ID: row.RETURN_EMP_ID ?? null,
    ORG_ID: row.ORG_ID ?? null,
    APPLY_DATE: row.RETURN_DATE ? new Date(row.RETURN_DATE) : null,
    REMARK: row.REMARK ?? null,
  };
}
