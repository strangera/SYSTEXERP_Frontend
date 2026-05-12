import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/** 領用退料作業 — queryASS16060 請求（與後端 QueryASS16060Request 對齊） */
export interface ASS16060QueryRequest extends BaseQueryRequest {
  WH_ID?: string | null;
  /** 退回單狀態 SYS1000: AM_MTRETURNM_STATUS */
  MTRETURNM_STATUS?: string | null;
  /** 退回單號（支援模糊查詢） */
  MTRETURN_ID?: string | null;
  EMP_ID?: string | null;
  ORG_ID?: string | null;
  RETURN_DATE_START?: string | null;
  RETURN_DATE_END?: string | null;
}

/** 領用退料作業 — queryASS16060 列表列（與後端 QueryASS16060Response 對齊） */
export interface ASS16060QueryRow {
  MTRETURN_ID?: string | null;
  EMP_ID?: string | null;
  EMP_NAME?: string | null;
  WH_ID?: string | null;
  WH_NAME?: string | null;
  ORG_ID?: string | null;
  ORG_NAME?: string | null;
  RETURN_DATE?: string | null;
  MTRETURNM_STATUS?: string | null;
  /** 狀態名稱（SYS1000） */
  STATUS_NAME?: string | null;
  DetailCount?: number | null;
  /** 後端若於列上回傳總筆數可選用 */
  TotalCount?: number | null;
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
    RETURN_EMP_ID: row.EMP_ID ?? null,
    ORG_ID: row.ORG_ID ?? null,
    APPLY_DATE: row.RETURN_DATE ? new Date(row.RETURN_DATE) : null,
    REMARK: null,
  };
}
