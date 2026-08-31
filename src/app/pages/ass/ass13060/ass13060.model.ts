import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * ASS13060 固定資產重估作業 - 資料模型
 */

/**
 * ASS13060 查詢請求參數
 */
export interface ASS13060QueryRequest extends ApiRequest {
  /** 固資重估單編號 */
  ASSET_EVAL_ID?: string | null;
  /** 固資重估單狀態 */
  ASSET_EVAL_STATUS?: string | null;
  /** 申請日期(起) */
  APPLY_DATE_S?: Date | string | null;
  /** 申請日期(迄) */
  APPLY_DATE_E?: Date | string | null;
  /** 申請人員編號 */
  EMP_ID?: string | null;
  /** 部門代號 */
  ORG_ID?: string | null;
  /** 商品管理編號 */
  GOODS_ID?: string | null;
}

/**
 * ASS13060 查詢結果資料
 */
export interface ASS13060QueryRow {
  ID?: number;
  MID?: number;
  STO_NO?: string;
  /** 是否可勾選
   *
   * - Y = 可勾選
   * - N = 不可勾選 */
  CHECK_STATUS?: string;
  /** 固資重估單號 */
  ASSET_EVAL_ID?: string;
  /** 單據狀態代碼
   * - 1已申請
   * - 2已審核 */
  ASSET_EVAL_STATUS?: string;
  /** 單據狀態名稱 */
  ASSET_EVAL_STATUS_NAME?: string;
  /** 申請日期 */
  APPLY_DATE?: Date | string;
  /** 申請人員代碼 */
  EMP_ID?: string;
  /** 申請人員名稱 */
  EMP_NAME?: string;
  /** 部門代號 */
  ORG_ID?: string;
  /** 部門名稱 */
  Org_Name?: string;
}

/**
 * ASS13060 明細項目（與 API Items 一致）
 */
export interface ASS13060DetailItem {
  ASSET_ID?: string;
  QTY?: number;
  GOODS_UNIT?: string;
  UPD_GET_COST?: number;
  UPD_EXP_YEAR?: number;
  NOTES?: string;
  GET_COST?: number;
  EXP_YEAR?: number;
  FIR_EXP_YEAR?: number;
  FIR_GET_COST?: number;
  STYPE_ID?: string;
  STYPE_ID2?: string;
  USE_ORG_ID?: string;
  TAL_DEPRE_MON?: number;
  TAL_DEPRE_AMT?: number;
}

/**
 * ASS13060 新增請求參數
 */
export interface ASS13060InsertRequest {
  ASSET_EVAL_ID?: string;
  EMP_ID: string;
  ORG_ID: string;
  APPLY_DATE: Date | string;
  NOTES?: string;
  EVAL_TYPE?: string;
  Items: ASS13060DetailItem[];
}

/**
 * ASS13060 修改請求參數
 */
export interface ASS13060UpdateRequest {
  ASSET_EVAL_ID: string;
  EMP_ID: string;
  ORG_ID: string;
  APPLY_DATE: Date | string;
  NOTES?: string;
  EVAL_TYPE?: string;
  Items: ASS13060DetailItem[];
}

/**
 * ASS13060 刪除請求參數
 */
export interface ASS13060DeleteRequest {
  Ids: number[];
}

/**
 * ASS13060 審核請求參數
 */
export interface ASS13060ApproveRequest {
  Ids: number[];
  APRV_EMP_ID: string;
  APRV_DATE: string;
}

/**
 * ASS13060 列印/匯出 PDF 請求參數
 */
export interface ASS13060ExportPDFRequest {
  MID?: number;
  STO_NO?: string | null;
  Ids: number[];
}

/**
 * ASS13060 新增回應 Data
 */
export interface ASS13060InsertResponseData {
  NewID?: number;
  NewASSET_EVAL_ID?: string;
  ErrCode?: number;
  ErrMsg?: string;
}

/**
 * ASS13060 資產查詢請求參數（批次新增彈窗用）
 */
export interface ASS13060AssetQueryRequest extends ApiRequest {
  ASSET_ID?: string | null;
  GOODS_NAME?: string | null;
  B_CLASS_ID?: string | null;
  M_CLASS_ID?: string | null;
  S_CLASS_ID?: string | null;
  HOLD_EMP_ID?: string | null;
  HOLD_ORG_ID?: string | null;
  ASSET_STATUS?: string | null;
}

/**
 * ASS13060 資產查詢結果（批次新增彈窗用）
 */
export interface ASS13060AssetQueryRow {
  ID?: number;
  MID?: number;
  STO_NO?: string;
  ASSET_ID?: string;
  GET_DATE?: Date | string;
  AssetName?: string;
  Unit?: string;
  UnitName?: string;
  ASSET_STATUS?: string;
  ASSET_STATUSName?: string;
  PurchaseAmt?: number;
  ChangeAmt?: number;
  TotalAmt?: number;
  FIR_EXP_YEAR?: number;
  UPD_EXP_YEAR_SUM?: number;
  SUM_DEPRE_MONTH?: number;
  SUM_DEPRE_AMOUNT?: number;
  STYPE_ID?: string;
  STYPE_ID2?: string;
  HOLD_EMP_ID?: string;
  user_Name?: string;
  HOLD_ORG_ID?: string;
  Org_Name?: string;
  USE_EMP_ID?: string;
  USE_ORG_ID?: string;
}

/**
 * ASS13060 明細查詢（queryDetailASS13060）請求參數
 */
export interface QueryDetailASS13060Request {
  ID: number;
}

/**
 * ASS13060 明細查詢 Master 資料
 */
export interface QueryDetailASS13060Master {
  ID?: number;
  ASSET_EVAL_ID?: string;
  EMP_ID?: string;
  ORG_ID?: string;
  EVAL_YYYYMM?: string;
  APPLY_DATE?: string | Date;
  ASSET_EVAL_STATUS?: string;
  ASSET_EVAL_STATUS_N?: string;
  APRV_EMP_ID?: string;
  APRV_DATE?: string | Date;
  EVAL_TYPE?: string;
  NOTES?: string;
}

/**
 * ASS13060 明細查詢 Detail 資料列
 */
export interface QueryDetailASS13060DetailRow {
  ID?: number;
  ASSET_EVAL_ID?: string;
  LINE_NUM?: number;
  ASSET_ID?: string;
  QTY?: number;
  GOODS_UNIT?: string;
  GET_COST?: number;
  EXP_YEAR?: number;
  UPD_GET_COST?: number;
  UPD_EXP_YEAR?: number;
  FIR_GET_COST?: number;
  FIR_EXP_YEAR?: number;
  STYPE_ID?: string;
  STYPE_ID2?: string;
  USE_ORG_ID?: string;
  TAL_DEPRE_MON?: number;
  TAL_DEPRE_AMT?: number;
  NOTES?: string;
}

/**
 * ASS13060 明細查詢回應 Data 結構
 */
export interface QueryDetailASS13060Data {
  Master?: QueryDetailASS13060Master;
  Details?: QueryDetailASS13060DetailRow[];
}
