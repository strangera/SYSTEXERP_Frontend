import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';

type DateOrString = Date | string | null;

export interface ASS16040QueryRequest extends ApiRequest {
  MTAPPLY_ID?: string | null;
  EMP_ID?: string | null;
  FASITEM_ID?: number | null;

  APPLY_DATE_S?: DateOrString;
  APPLY_DATE_E?: DateOrString;

  APRV_DATE_S?: DateOrString;
  APRV_DATE_E?: DateOrString;

  ORG_ID?: string | null;
  CHECK_DATE?: DateOrString;
  APRV_EMP_ID?: string | null;
  WH_ID?: string | null;
  STATUS?: string | null;
}

/**
 * 主檔
 */
export interface ASS16040MasterRow {
  MASTER_ID: number;

  MTAPPLY_ID: string;

  EMP_ID: string;

  ORG_ID: string;

  APPLY_DATE: string;

  /**
   * 建議需求(日)
   */
  REQUIRE_DATE?: number | null;

  /**
   * 主檔說明
   */
  MASTER_NOTES?: string | null;

  MTAPPLY_STATUS: string;

  AMT: number | null;

  APRV_EMP_ID: string | null;

  APRV_DATE: string | null;

  WH_ID: string;

  CHECK_DATE: string | null;

  TOTAL_COUNT: number;
}

/**
 * 主檔 + 明細
 */
export interface ASS16040DetailRow
  extends ASS16040MasterRow
{
  DETAIL_ID: number;

  MID: number | null;

  STO_NO: string | null;

  MTAPPLYM_ID: number;

  FASITEM_ID: number;

  LINE_NUM: number;

  QTY: number;

  /**
   * 單位代碼
   */
  Unit?: string | null;

  GOODS_PRICE: number | null;

  TAX_CODE: string | null;

  ITEM_AMT: number | null;

  CHECK_QTY: number | null;

  RETURN_QTY: number | null;

  /**
   * 明細說明
   */
  NOTES: string | null;

  GOODS_ID?: string;

  GOODS_NAME?: string;

  UNIT_NAME?: string;

  CRT_USR_No?: string | null;

  CRT_Date?: string | null;

  CRT_USR_Name?: string | null;

  UPD_USR_No?: string | null;

  UPD_Date?: string | null;

  UPD_USR_Name?: string | null;
}

export interface ASS16040NestedQueryData<T> {
  QueryData?: T[] | null;
  TotalCount?: number;
  TotalPage?: number;
}

export interface ASS16040ApproveRequest {
  MTAPPLY_ID: string;
}

export interface FASITEMDropdownRow {
  ID: number;
  GOODS_ID: string;
  GOODS_NAME: string;
  UNIT_NAME?: string | null;
  UNIT?: string | null;
}