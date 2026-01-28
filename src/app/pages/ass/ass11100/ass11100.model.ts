import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/**
 * ASS11100 倉別設定作業 - 資料模型（對齊 QueryASS11100Response）
 */
export interface ASS11100Data {
  WH_ID?: string;       // 倉別代號
  WH_NAME?: string;     // 倉別
  ATT_ORG_ID?: string;  // 所屬部門代號
  NOTES?: string;       // 備註
}

/**
 * ASS11100 查詢請求參數（繼承 BaseQueryRequest，不帶 STO_NO）
 */
export interface ASS11100QueryRequest extends BaseQueryRequest {
  WH_ID?: string;       // 倉別代號
  WH_NAME?: string;     // 倉別
  ATT_ORG_ID?: string;  // 所屬部門代號
  NOTES?: string;       // 備註
}

/** 查詢回應資料結構（後端若回傳巢狀 Data.QueryData / Data.TotalCount 時使用） */
export interface ASS11100QueryDataWrapper {
  TotalCount: number;
  QueryData: ASS11100Data[];
}

/**
 * ASS11100 刪除請求參數（不以 BaseDeleteRequest 的 idList 識別）
 */
export interface ASS11100DeleteRequest {
  WH_ID?: string;       // 倉別代號
  ATT_ORG_ID?: string;  // 所屬部門代號
}

/**
 * ASS11100 新增請求參數
 * WH_ATTR、CRT_USR_No、CRT_USR_Name 由 CRU 組裝（WH_ATTR 固定 '1'，CRT 從 this.user）
 */
export interface ASS11100InsertRequest {
  WH_ID: string;
  WH_NAME: string;
  ATT_ORG_ID: string;
  NOTES?: string;
  WH_ATTR: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
}

/**
 * ASS11100 更新請求參數
 * WH_ATTR、UPD_USR_No、UPD_USR_Name 由 CRU 組裝（WH_ATTR 固定 '1'，UPD 從 this.user）
 */
export interface ASS11100UpdateRequest {
  WH_ID: string;
  WH_NAME: string;
  ATT_ORG_ID: string;
  NOTES?: string;
  WH_ATTR: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}
