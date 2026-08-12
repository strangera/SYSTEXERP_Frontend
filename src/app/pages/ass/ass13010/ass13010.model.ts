export interface QueryASS13010SortField {
  field: string;
  order: number;
}

export interface QueryASS13010Request {
  PageSize: number;
  PageIndex: number;
  OrderBy?: string | null;
  Offset?: number | null;
  SortBy?: QueryASS13010SortField[] | null;
  MID?: number | null;
  STO_NO?: string | null;
  ASSET_ID?: string | null;
  GOODS_ID?: string | null;
  ORI_ASSET_ID?: string | null;
  ASSET_STATUS?: string | null;
  DEPRE_YN?: string | null;
  SUBPOENA_ID?: string | null;
  GET_DATE_S?: string | null;
  GET_DATE_E?: string | null;
  GET_COST_S?: number | null;
  GET_COST_E?: number | null;
  BILL_DATE_S?: string | null;
  BILL_DATE_E?: string | null;
  EXP_YEAR_S?: number | null;
  EXP_YEAR_E?: number | null;
  RESI_VALUE_S?: number | null;
  RESI_VALUE_E?: number | null;
  ONSALE_AMT_S?: number | null;
  ONSALE_AMT_E?: number | null;
  HANDLE_DATE_S?: string | null;
  HANDLE_DATE_E?: string | null;
  HOLD_EMP_ID?: string | null;
  HOLD_ORG_ID?: string | null;
  USE_EMP_ID?: string | null;
  USE_ORG_ID?: string | null;
  LOCATION_ID?: string | null;
  SUPPLIER_ID?: string | null;
  STYPE_D?: string | null;
  STYPE_C?: string | null;
  STYPE_ID?: string | null;
  STYPE_ID2?: string | null;
  EQUIP_ID?: string | null;
  FIX_N?: string | null;
  LEND_TYPE?: string | null;
  HANDLE_VENDOR?: string | null;
  HANDLE_VID?: string | null;
  HANDLE_NOTE?: string | null;
  PURCHASE_NOTES?: string | null;
}

export interface QueryASS13010Response {
  ID: number;
  ASSET_ID: string | null;
  GOODS_ID: string | null;
  ASSET_STATUS: string | null;
  ASSET_STATUS_NAME: string | null;
  DEPRE_YN: string | null;
  DEPRE_YN_NAME: string | null;
  SUBPOENA_ID: string | null;
  GET_DATE: string | null;
  GET_COST: number | null;
  BILL_DATE: string | null;
  DEPRE_ID: string | null;
  TAL_DEPRE_AMT: number | null;
  TAL_DEPRE_MON: number | null;
}

export interface QueryASS13010Result {
  QueryData: QueryASS13010Response[];
  TotalRows: number;
  TotalPages: number;
}

export interface QueryASS13010ResultApiResponse {
  Status: string;
  Data: QueryASS13010Result | null;
  Error?: {
    Code?: string;
    Message?: string;
    Details?: string;
  } | null;
  Meta?: {
    Timestamp?: string;
    RequestId?: string;
  } | null;
  Message?: string | null;
  TotalCount?: number;
  TotalPage?: number;
}

export interface DetailASS13010Request {
  ID: string;
}

export interface DetailASS13010Response {
  /** 主鍵值 */
  ID: number;
  /** 財產代號 */
  ASSET_ID: string | null;
  /** 購入日期 */
  GET_DATE: string | null;
  /** 財產狀態 (1:使用中, 3:維修中, 4:報廢, 5:變賣, 7:庫存未使用) */
  ASSET_STATUS: string | null;
  /** 保管人 */
  HOLD_EMP_ID: string | null;
  /** 保管單位 */
  HOLD_ORG_ID: string | null;
  /** 使用人 */
  USE_EMP_ID: string | null;
  /** 使用單位 */
  USE_ORG_ID: string | null;
  /** 財產類型 (1:資產, 2:列管品) */
  DEPRE_YN: string | null;
  /** 折舊會計科目 */
  STYPE_ID: string | null;
  /** 累計折舊科目 */
  STYPE_ID2: string | null;
  /** 購入金額(未稅) */
  GET_COST: number | null;
  /** 進貨單號 */
  SUBPOENA_ID: string | null;
  /** 資產註記說明 */
  NOTES: string | null;
  /** 採購說明 */
  PURCHASE_NOTES: string | null;
  /** 折舊年限(年) */
  EXP_YEAR: number | null;
  /** 變賣金額 */
  ONSALE_AMT: number | null;
  /** 位置代號 */
  LOCATION_ID: string | null;
  /** 維修合約編號 */
  FIX_N: string | null;
  /** 利潤中心部門代號 */
  FORG_ID: string | null;
  /** 入帳日期 */
  BILL_DATE: string | null;
  /** 處分日期(報廢或變賣) */
  HANDLE_DATE: string | null;
  /** 處分說明 */
  HANDLE_NOTE: string | null;
  /** 處分廠商 */
  HANDLE_VENDOR: string | null;
  /** 處分傳票編號 */
  HANDLE_VID: string | null;
  /** 處分暫存傳票KEY */
  HANDLE_VKEY: number | null;
  /** 預留殘值 */
  RESI_VALUE: number | null;
  /** 會計科目(借) */
  STYPE_D: string | null;
  /** 會計科目(貸) */
  STYPE_C: string | null;
  /** 攤提代號 */
  DEPRE_ID: string | null;
  /** 稅額 */
  GET_COST_TAX: number | null;
  /** 使用狀態 (1:使用中, 6:閒置中) */
  USE_STATUS: string | null;
  /** 已提列折舊金額 */
  DEPRE_AMT: number | null;
  /** 折舊年限(月) */
  EXP_MONTH: number | null;
  /** 原保管單位 */
  ORI_ORG_ID: string | null;
  /** 原保管人 */
  ORI_EMP_ID: string | null;
  /** 資產維護單號 */
  ASSET_INS_ID: string | null;
  /** 維修總金額 */
  FIX_AMT: number | null;
  /** 品項編號 */
  GOODS_ID: string | null;
  /** 供應商編號 */
  SUPPLIER_ID: string | null;
  /** 設備編號 */
  EQUIP_ID: string | null;
  /** 攤提起始日期 */
  DEPRE_SDATE: string | null;
  /** 檔案來源 (1:審核入檔, 2:手動新增) */
  SOURCE_STATUS: string | null;
  /** 已攤提金額 */
  TAL_DEPRE_AMT: number | null;
  /** 已攤提月數 */
  TAL_DEPRE_MON: number | null;
  /** 批次驗收單號 */
  SUBCHECK_ID: string | null;
  /** 原始購入金額 */
  FIR_GET_COST: number | null;
  /** 原始折舊年限 */
  FIR_EXP_YEAR: number | null;
  /** 出借狀態 */
  LEND_TYPE: string | null;
  /** 原始財產編號 */
  ORI_ASSET_ID: string | null;
  /** 原資產轉入已攤提月數 */
  ORI_IMPORT_DEPRE_MON: number | null;
  /** 原資產轉入已攤提金額 */
  ORI_IMPORT_DEPRE_AMT: number | null;
  /** 扣抵代號 */
  REDU_CODE: string | null;
  /** 變賣稅額 */
  ONSALE_RATE: number | null;
  /** 變賣未稅金額 */
  ONSALE_NORATE_AMT: number | null;
  /** 延長折舊年限 */
  EXTEND_EXP_YEAR: number | null;
  /** 批次報廢單號 */
  DAMAGEM_ID: string | null;
  /** 保固年限(日) */
  Warranty_YEAR: number | null;

/** 異動金額 = 購入金額 - 原始購入金額 */
CHANGE_AMT: number | null;

/** 異動折舊年限(年) = 折舊年限 - 原始折舊年限 */
CHANGE_EXP_YEAR: number | null;
}

// ==================== 匯出 PDF ====================
export interface ExportPDFASS13010Request {
  ID: string;
}

export interface InsertASS13010Request {
  MID?: number | null;
  STO_NO?: string | null;
  ASSET_ID?: string | null;
  GET_DATE?: string | null;
  ASSET_STATUS?: string | null;
  HOLD_EMP_ID?: string | null;
  HOLD_ORG_ID?: string | null;
  USE_EMP_ID?: string | null;
  USE_ORG_ID?: string | null;
  DEPRE_YN?: string | null;
  STYPE_ID?: string | null;
  STYPE_ID2?: string | null;
  GET_COST?: number | null;
  SUBPOENA_ID?: string | null;
  NOTES?: string | null;
  PURCHASE_NOTES?: string | null;
  EXP_YEAR?: number | null;
  ONSALE_AMT?: number | null;
  LOCATION_ID?: string | null;
  FIX_N?: string | null;
  FORG_ID?: string | null;
  BILL_DATE?: string | null;
  HANDLE_DATE?: string | null;
  HANDLE_NOTE?: string | null;
  HANDLE_VENDOR?: string | null;
  HANDLE_VID?: string | null;
  HANDLE_VKEY?: number | null;
  RESI_VALUE?: number | null;
  STYPE_D?: string | null;
  STYPE_C?: string | null;
  DEPRE_ID?: string | null;
  GET_COST_TAX?: number | null;
  USE_STATUS?: string | null;
  DEPRE_AMT?: number | null;
  EXP_MONTH?: number | null;
  ORI_ORG_ID?: string | null;
  ORI_EMP_ID?: string | null;
  ASSET_INS_ID?: string | null;
  FIX_AMT?: number | null;
  GOODS_ID?: string | null;
  SUPPLIER_ID?: string | null;
  EQUIP_ID?: string | null;
  /** 送出可為 Date，由 HTTP interceptor 轉成與其他日期欄位相同的時間字串 */
  DEPRE_SDATE?: string | Date | null;
  SOURCE_STATUS?: string | null;
  SUBCHECK_ID?: string | null;
  FIR_GET_COST?: number | null;
  FIR_EXP_YEAR?: number | null;
  LEND_TYPE?: string | null;
  ORI_ASSET_ID?: string | null;
  TAL_DEPRE_AMT?: number | null;
  TAL_DEPRE_MON?: number | null;
  REDU_CODE?: string | null;
  ONSALE_RATE?: number | null;
  ONSALE_NORATE_AMT?: number | null;
  EXTEND_EXP_YEAR?: number | null;
  DAMAGEM_ID?: string | null;
  Warranty_YEAR?: number | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
}

export interface InsertASS13010Response {
  Message?: string | null;
}

// ==================== 更新 ====================
/**
 * 更新資產維護作業（updateASS13010）
 *
 * 欄位依你提供的 UpdateASS13010Request 截圖：
 * - 判斷是否已攤提：TAL_DEPRE_AMT > 0（此判斷在前端用於鎖欄位）
 * - 後端 update 需要：ID/GET_DATE/ASSET_STATUS/EQUIP_ID/PURCHASE_NOTES(採購說明)/RESI_VALUE(預留殘值)/EXP_YEAR/EXP_MONTH/HOLD_EMP_ID/USE_EMP_ID/DEPRE_SDATE/TAL_DEPRE_AMT/TAL_DEPRE_MON/UPD_USR_No/UPD_USR_Name（購入金額無對應欄位；EXP_MONTH 為原折舊年限(月)，TAL_DEPRE_MON 為已攤提月數）
 */
export interface UpdateASS13010Request {
  ID: number;
  GET_DATE?: string | null;
  /** 購入金額（GET_COST） */
  GET_COST?: number | null;
  ASSET_STATUS?: string | null;
  EQUIP_ID?: string | null;
  PURCHASE_NOTES?: string | null;
  RESI_VALUE?: number | null;
  EXP_YEAR?: number | null;
  EXP_MONTH?: number | null;
  HOLD_EMP_ID?: string | null;
  USE_EMP_ID?: string | null;
  /** 送出可為 Date，由 HTTP interceptor 轉成與其他日期欄位相同的時間字串 */
  DEPRE_SDATE?: string | Date | null;
  TAL_DEPRE_AMT?: number | null;
  TAL_DEPRE_MON?: number | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

export interface UpdateASS13010Response {
  Message?: string | null;
}

// ==================== 刪除 ====================
export interface DeleteASS13010Request {
  IDS: number[];
}

export interface DeleteASS13010ResultApiResponse {
  Status?: string;
  Data?: {
    Message?: string | null;
  } | null;
  Error?: {
    Code?: string;
    Message?: string;
    Details?: string;
  } | null;
  Meta?: {
    Timestamp?: string;
    RequestId?: string;
  } | null;
  Message?: string | null;
  TotalCount?: number;
  TotalPage?: number;
}

