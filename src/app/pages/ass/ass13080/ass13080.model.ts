import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

export interface QueryASS13080Request extends BaseQueryRequest {
  ASSET_SALENO?: string | null;
  ASSET_ID?: string | null;
  GOODS_ID?: string | null;
  GET_DATE_S?: string | null;
  GET_DATE_E?: string | null;
  ASSET_STATUS?: string | null;
  DEPRE_ID?: string | null;
  HOLD_ORG_ID?: string | null;
  HOLD_EMP_ID?: string | null;
  USE_ORG_ID?: string | null;
  USE_EMP_ID?: string | null;
  STYPE_ID?: string | null;
  GET_COST_S?: number | null;
  GET_COST_E?: number | null;
  SUBCHECK_ID?: string | null;
  BILL_DATE_S?: string | null;
  BILL_DATE_E?: string | null;
}

export interface ASS13080QueryRow {
  ROWNO?: number;
  ID?: number;
  MID?: number;
  STO_NO?: string;
  ASSET_SALENO?: string;
  ASSET_ID?: string;
  GOODS_ID?: string;
  GOODS_NAME?: string;
  ASSET_STATUS?: string;
  ASSET_STATUS_NAME?: string;
  HOLD_EMP_ID?: string;
  HOLD_EMP_NAME?: string;
  USE_EMP_ID?: string;
  USE_EMP_NAME?: string;
  GET_COST?: number;
  DEPRE_ID?: string;
}

export interface ASS13080QueryDataWrapper {
  Details?: ASS13080QueryRow[];
  TotalRows?: number;
  TotalPages?: number;
}

export interface ASS13080Detail {
  ID?: number | null;
  ASSET_SALENO?: string | null;
  ASSET_ID?: string | null;
  /** 1:資產 2:列管品（detailASS13010 等） */
  DEPRE_YN?: string | null;
  GOODS_ID?: string | null;
  GOODS_NAME?: string | null;
  ASSET_STATUS?: string | null;
  ASSET_STATUS_NAME?: string | null;
  HOLD_EMP_ID?: string | null;
  HOLD_EMP_NAME?: string | null;
  USE_EMP_ID?: string | null;
  USE_EMP_NAME?: string | null;
  GET_COST?: number | null;
  DEPRE_ID?: string | null;
  PO_NO?: string | null;
  BUY_DATE?: string | null;
  BUY_AMT?: number | null;
  CHG_AMT?: number | null;
  VENDOR_NO?: string | null;
  DEVICE_NO?: string | null;
  ACC_NO_DR?: string | null;
  ACC_NO_CR?: string | null;
  TXN_DATE?: string | null;
  DEPR_ACC_NO?: string | null;
  ACCU_DEPR_ACC_NO?: string | null;
  DEPR_YEARS?: number | null;
  CHG_YEARS?: number | null;
  RESIDUAL_AMT?: number | null;
  DEPR_DUE?: number | null;
  UNAMORT_AMT?: number | null;
  AMORT_AMT?: number | null;
  AMORT_MONTHS?: number | null;
  HOLD_ORG_ID?: string | null;
  USE_ORG_ID?: string | null;
  LOC_NO?: string | null;
  MAINT_CONTRACT_NO?: string | null;
  SOLD_DATE?: string | null;
  SOLD_VENDOR_NO?: string | null;
  SOLD_VOUCHER_NO?: string | null;
  SOLD_AMT_TAX?: number | null;
  SOLD_REMARK?: string | null;
  ASSET_REMARK?: string | null;
}

export interface CreateASS13080Request {
  ASSET_ID: string;
  SALDATE: string;
  BUYER_VENNO: string;
  SALE_AMT: number;
  HANDLE_NOTE?: string;
}

export interface CreateASS13080Result {
  ID?: number;
  ASSET_SALENO?: string;
  ErrCode?: number;
  ErrMsg?: string;
}

export interface ApproveASS13080Request {
  ID: number;
}

export interface CancelASS13080Request {
  ID: number;
}

export type PrintASS13080Request = Omit<
  QueryASS13080Request,
  'PageSize' | 'PageIndex' | 'OrderBy' | 'Offset' | 'SortBy'
>;

// ==================== 資產選擇列表（queryFAASSETChooseListASS13060） ====================

export interface QueryFAASSETChooseListASS13060Request extends BaseQueryRequest {
  MID?: number | null;
  STO_NO?: string | null;
  ASSET_ID?: string | null;
  GOODS_NAME?: string | null;
  B_CLASS_ID?: string | null;
  M_CLASS_ID?: string | null;
  S_CLASS_ID?: string | null;
  HOLD_EMP_ID?: string | null;
  HOLD_ORG_ID?: string | null;
  ASSET_STATUS?: string | null;
}

export interface QueryFAASSETChooseListASS13060Response {
  ID?: number;
  MID?: number | null;
  STO_NO?: string | null;
  ASSET_ID?: string | null;
  GET_DATE?: string | null;
  AssetName?: string | null;
  Unit?: string | null;
  UnitName?: string | null;
  ASSET_STATUS?: string | null;
  ASSET_STATUSName?: string | null;
  PurchaseAmt?: number | null;
  ChangeAmt?: number | null;
  TotalAmt?: number | null;
  FIR_EXP_YEAR?: number | null;
  UPD_EXP_YEAR_SUM?: number | null;
  SUM_DEPRE_MONTH?: number | null;
  SUM_DEPRE_AMOUNT?: number | null;
  STYPE_ID?: string | null;
  STYPE_ID2?: string | null;
  HOLD_EMP_ID?: string | null;
  user_Name?: string | null;
  HOLD_ORG_ID?: string | null;
  Org_Name?: string | null;
  USE_EMP_ID?: string | null;
  USE_ORG_ID?: string | null;
}

export interface QueryFAASSETChooseListASS13060Result {
  QueryData?: QueryFAASSETChooseListASS13060Response[] | null;
  TotalRows?: number;
  TotalPages?: number;
}

