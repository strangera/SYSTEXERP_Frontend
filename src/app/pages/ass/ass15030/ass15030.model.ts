import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
export interface QueryASS15030Request extends ApiRequest {
  /** 基準年月 (格式: YYYYMM) */
  BaseYM?: string;
  /** 試算類型 (1: 折舊前試算, 2: 拋轉後) */
  Type?: string;
  /** 會計科目代碼 */
  STYPE_ID?: string;
  /** 保管單位代碼 */
  HOLD_ORG_ID?: string;
  /** 購入日期起 */
  GET_DATE_S?: string;
  /** 購入日期迄 */
  GET_DATE_E?: string;
  /** 入帳日期起 */
  BILL_DATE_S?: string;
  /** 入帳日期迄 */
  BILL_DATE_E?: string;
  /** 品項編號 */
  GOODS_ID?: string;
  /** 大分類編號 */
  B_CLASS_ID?: string;
  /** 中分類編號 */
  M_CLASS_ID?: string;
  /** 小分類編號 */
  S_CLASS_ID?: string;
  /** 是否顯示取得金額為 0 (1:是, 0:否) */
  SHOW_ZERO?: string;
  /** 是否顯示當期報廢變賣資料 (1:是, 0:否) */
  SHOW_HANDLE?: string;
}

export interface QueryASS15030SumResponse {
  /** 項次 (明細列=流水號 / 小計列='小計' / 總合計列='總合計') */
  SEQ?: string;
  /** 品項編號 (小計/總合計列為 NULL) */
  GOODS_ID?: string;
  /** 品項名稱 (小計/總合計列為 NULL) */
  GOODS_NAME?: string;
  /** 保管人員工編號 (小計/總合計列為 NULL) */
  HOLD_EMP_ID?: string;
  /** 保管單位+人員 */
  HOLD_ORG_NAME?: string;
  /** 取得價格合計 */
  GET_COST_TTL?: number;
  /** 異動價格合計 */
  FIX_AMT_TTL?: number;
  /** 異動後價格合計 */
  AFT_AMT_TTL?: number;
  /** 預留殘值合計 */
  RESI_VALUE_TTL?: number;
  /** 前期折舊金額合計 */
  PRE_DEPRE_TTL?: number;
  /** 本期折舊金額合計 */
  CUR_DEPRE_TTL?: number;
  /** 累計折舊金額合計 */
  ACC_DEPRE_TTL?: number;
  /** 未折舊金額合計 */
  UNDEPRE_TTL?: number;
}

export interface QueryASS15030DetailResponse {
  /** 項次 (明細為流水號 / 小計 / 總合計) */
  SEQ?: string;
  /** 財產編號 */
  ASSET_ID?: string;
  /** 品項名稱 */
  GOODS_NAME?: string;
  /** 購入日期 */
  GET_DATE?: string;
  /** 入帳日期 */
  BILL_DATE?: string;
  /** 保管單位+人員 */
  HOLD_ORG_ID?: string;
  /** 財產註記 */
  NOTES?: string;
  /** 取得價格 */
  FIR_GET_COST?: number;
  /** 異動價格 */
  MODIFY_AMT?: number;
  /** 異動後價格 */
  GET_COST?: number;
  /** 預留殘值 */
  RESI_VALUE?: number;
  /** 原始折舊年限 */
  FIR_EXP_YEAR?: number;
  /** 異動折舊年限 */
  MODIFY_YEAR?: number;
  /** 異動後折舊年限 */
  EXP_YEAR?: number;
  /** 已購入月數 */
  BUY_MONTHS?: number;
  /** 已入帳月數 */
  BILL_MONTHS?: number;
  /** 已攤提月數 */
  DEPRE_MONTHS?: number;
  /** 年度折舊金額 */
  DEPRE_AMOUNT?: number;
  /** 本期折舊金額 */
  THIS_DEPRE_AMT?: number;
  /** 累計折舊金額 */
  TAL_DEPRE_AMT?: number;
  /** 未折舊金額 */
  NO_DEPRE_AMT?: number;
}

/** ASS15030 財產目錄-彙總 查詢回應 wrapper */
export interface QueryASS15030SumResult {
  detail?: QueryASS15030SumResponse[];
  TOTAL_GET_COST_TTL?: number;
  TOTAL_FIX_AMT_TTL?: number;
  TOTAL_AFT_AMT_TTL?: number;
  TOTAL_RESI_VALUE_TTL?: number;
  TOTAL_PRE_DEPRE_TTL?: number;
  TOTAL_CUR_DEPRE_TTL?: number;
  TOTAL_ACC_DEPRE_TTL?: number;
  TOTAL_UNDEPRE_TTL?: number;
  TOTAL_COUNT?: number;
}

/** ASS15030 財產目錄-明細 查詢回應 wrapper */
export interface QueryASS15030DetailResult {
  detail?: QueryASS15030DetailResponse[];
  TOTAL_FIR_GET_COST?: number;
  TOTAL_MODIFY_AMT?: number;
  TOTAL_GET_COST?: number;
  TOTAL_RESI_VALUE?: number;
  TOTAL_DEPRE_AMOUNT?: number;
  TOTAL_THIS_DEPRE_AMT?: number;
  TOTAL_TAL_DEPRE_AMT?: number;
  TOTAL_NO_DEPRE_AMT?: number;
  TOTAL_COUNT?: number;
}
