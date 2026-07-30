import { ApiRequest } from '@shared/utils/rxjs-operators/validate-api-response';

/**
 * ASS14030 傳票審核傳送作業 - 資料模型
 */

/** 查詢條件 */
export interface QueryASS14030Request extends ApiRequest {
  /** 傳票種類，可多選，逗號分隔（PC資材報廢/PD折舊/PM月結庫存/PS資材變賣/PU資材進貨） */
  SrcSheetType?: string | null;
  /** 傳票日期 起 */
  VouDateS?: string | null;
  /** 傳票日期 迄 */
  VouDateE?: string | null;
  /** 傳票狀態：0未拋轉、1已拋轉 */
  Trans_Status?: string | null;
  /** 結帳單號 */
  ORI_SLIP?: string | null;
}

/** 查詢回應資料結構（巢狀 Data） */
export interface ASS14030QueryDataWrapper {
  TotalRows: number;
  TotalPages: number;
  QueryData: ASS14030QueryRow[];
}

/** 傳票審核傳送查詢結果一筆 */
export interface ASS14030QueryRow {
  /** 收付類型（應收/應付） */
  PayType?: string | null;
  /** 傳票編號 */
  VouNo?: string | null;
  /** 傳票種類 */
  SrcSheetType?: string | null;
  /** 傳票種類名稱 */
  Voucher_Name?: string | null;
  /** 發票維護單號 */
  RECEIPT_INS_ID?: string | null;
  /** 傳票日期 */
  VouDate?: string | null;
  /** 傳票摘要 */
  Remark?: string | null;
  /** 傳票狀態（已拋轉/未拋轉） */
  Trans_Status?: string | null;
  /** 結帳單號 */
  ORI_SLIP?: string | null;
}

/** 查詢明細 條件 */
export interface QueryASS14030DetailRequest {
  /** 發票維護單號 */
  RECEIPT_INS_ID: string;
}

/** 傳票審核傳送明細 - 傳票主檔 */
export interface ASS14030DetailMaster {
  RECEIPT_INS_ID?: string | null;
  GLS6001ID?: number | null;
  /** 傳票編號 */
  VouNo?: string | null;
  /** 傳票種類名稱 */
  Voucher_Name?: string | null;
  /** 傳票種類 */
  SrcSheetType?: string | null;
  /** 傳票日期 */
  VouDate?: string | null;
  /** 摘要 */
  Remark?: string | null;
  /** 結帳單號 */
  ORI_SLIP?: string | null;
  /** 傳票類別 */
  VouType?: string | null;
  /** 傳票類別名稱（傳票型態） */
  VouTypeName?: string | null;
  /** 傳票狀態 */
  PostFlag?: string | null;
  /** 傳票狀態名稱 */
  PostFlagName?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  CRT_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  UPD_Date?: string | null;
  CompNo?: string | null;
  INV_YN?: string | null;
  /** 拋轉狀態 */
  Trans_Status?: string | null;
  /** 拋轉後傳票編號 */
  TransVouNo?: string | null;
  MID?: number | null;
  STO_NO?: string | null;
  SUPPLIER_ID?: string | null;
}

/** 傳票審核傳送明細 - 明細項目 */
export interface ASS14030DetailItem {
  /** 項次 */
  ItemNo?: number | null;
  GLS6001ID?: number | null;
  /** 傳票明細主鍵 */
  GLS6002ID?: number | null;
  /** 序號 */
  SerNo?: number | null;
  /** 科目代號 */
  AccNo?: string | null;
  /** 科目名稱 */
  AccCName?: string | null;
  /** 對象代號（廠商代號） */
  DetailNo?: string | null;
  /** 對象名稱（廠商） */
  VEN_Name?: string | null;
  /** 摘要 */
  NoteDesc?: string | null;
  /** 借方金額 */
  DebitAmt?: number | null;
  /** 貸方金額 */
  CreditAmt?: number | null;
  AccDC?: string | null;
  AccAmt?: number | null;
  /** 部門代號（組織代號） */
  ORG_ID?: string | null;
  /** 活動代號 */
  ProjectNo?: string | null;
  /** 立沖代號 */
  PTA?: string | null;
  /** 對象別編號 */
  SubDetailNo?: string | null;
  /** 對帳 KEY */
  ReconcileKey?: string | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

/** 傳票審核傳送明細 查詢結果 */
export interface ASS14030DetailResult {
  /** 傳票主檔 */
  Master?: ASS14030DetailMaster | null;
  /** 傳票明細 */
  Details?: ASS14030DetailItem[] | null;
}

/** 更新傳票明細一筆 */
export interface UpdateASS14030DetailItem {
  /** 傳票明細主鍵 */
  GLS6002ID: number;
  /** 會計科目 */
  AccNo: string;
  /** 部門代號 */
  ORG_ID: string;
  /** 摘要 */
  NoteDesc?: string | null;
  /** 對象別編號 */
  SubDetailNo?: string | null;
  /** 對帳 KEY 值 */
  ReconcileKey?: string | null;
}

/** 更新傳票審核傳送作業 請求 */
export interface UpdateASS14030Request {
  /** 發票維護單號 */
  RECEIPT_INS_ID: string;
  /** 傳票日期 */
  VouDate: string;
  /** 傳票摘要 */
  Remark?: string | null;
  /** 傳票明細 */
  Details: UpdateASS14030DetailItem[];
}

/** 更新傳票審核傳送作業 結果 */
export interface UpdateASS14030Result {
  RECEIPT_INS_ID?: string | null;
  /** 傳票主檔更新筆數 */
  MasterUpdateCount?: number | null;
  /** 傳票明細更新筆數 */
  DetailUpdateCount?: number | null;
  /** 更新結果訊息 */
  ResultMessage?: string | null;
}

/** 查詢應收付明細 條件 */
export interface QueryASS14030PayDetailRequest {
  /** 發票維護單號 */
  RECEIPT_INS_ID: string;
}

/** 應收付明細一筆 */
export interface ASS14030PayDetailRow {
  /** 序號（應付帳款代號） */
  SeqNo?: number | null;
  /** 組織代號 */
  ORG_ID?: string | null;
  /** 客戶代碼／統編 */
  VEN_Uniform?: string | null;
  /** 廠商代碼 */
  SUPPLIER_ID?: string | null;
  /** 傳票類型 */
  VouType?: string | null;
  /** 年月 */
  sam_yyymm?: string | null;
  /** 帳次 */
  sam_termno?: number | null;
  /** 金額 */
  Amt?: number | null;
  /** 付款方式 */
  VEN_PayType?: string | null;
  /** 銀行代碼 */
  BNKNo?: string | null;
  /** 帳號 */
  VEN_BankAccountNo?: string | null;
  /** 戶名 */
  VEN_AccountName?: string | null;
  /** 廠商名稱（公司抬頭） */
  VEN_Name?: string | null;
  /** 會計科目 */
  AccNo?: string | null;
  /** 預計付款／收款日 */
  Pay_Date?: string | null;
  /** 立帳日 */
  VouDate?: string | null;
  /** 摘要 */
  Remark?: string | null;
}

/** 查詢應收付明細 回應（巢狀 Data） */
export interface ASS14030PayDetailResult {
  TotalCount: number;
  QueryData: ASS14030PayDetailRow[] | null;
}
