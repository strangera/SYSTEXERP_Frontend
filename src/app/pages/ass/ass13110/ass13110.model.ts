import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';
/**
 * ASS13110 資產差異表 - 查詢 Request
 */
export interface ASS13110QueryRequest extends ApiRequest {
  CHK_ID_S?: string;
  CHK_ID_E?: string;
  CHK_DATE_S?: Date | string;
  CHK_DATE_E?: Date | string;
  CHK_EMP_ID?: string;
  CHK_STATUS?: string[];
  DEPRE_YN?: string[];
}

/**
 * ASS13110 資產差異表 - 單筆資料列
 */
export interface ASS13110Row {
  ID: number;
  STO_NO: string;
  ASSET_ID: string;         // 財產編號
  GOODS_ID: string;         // 品項編號
  GOODS_NAME: string;       // 品項名稱
  GET_DATE: string;         // 購入日期
  GET_COST: number;         // 購入金額(未稅)
  TAL_DEPRE_AMT: number;    // 累計折舊金額
  BOOK_VALUE: number;       // 帳面價值
  ASSET_STATUS: string;     // 財產狀態(盤前)
  HOLD_ORG_ID: string;      // 保管單位
  HOLD_ORG_NAME: string;    // 保管單位名稱
  USE_ORG_ID: string;       // 使用單位
  DEPRE_YN: string;         // 資產類別 (1: 資產, 2: 列管品)
  DEPRE_YM_B: string;       // 折舊起始年月
  DEPRE_YM_E: string;       // 折舊結束年月
  DEPRE_AMOUNT: number;     // 折舊金額
  CHK_ID: string;           // 清點單號
  CHK_DATE: string;         // 清點日期
  CHK_EMP_ID: string;       // 清點人代碼
  CHK_STATUS: string;       // 盤後資產狀態
  CHK_STATUS_NAME: string;  // 盤後狀態名稱
  RN: number;
}

