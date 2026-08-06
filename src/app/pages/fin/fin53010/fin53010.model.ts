import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Option } from '@service/utility/dropdown-api.model';
interface FIN53010Basic {
  /** 傳票號碼 yyyyMMddssss */
  VouNo: string;
  /** 補發票 (Y/N) */
  INV_YN: 'Y' | 'N';
  /** 傳票狀態 0:作廢 1:建立 2:確認(取消確認動作) 3:過帳 */
  PostFlag: '0' | '1' | '2' | '3';
  /** ROC/IFRS 0:ROC 1:IFRS 2:全部 */
  VouAccType: '0' | '1' | '2';
  /** 傳票類別 1:現金收入2:現金支出3:轉帳傳票 */
  VouType: '1' | '2' | '3';
  /** 傳票種類(SYS1000.VoucherType) */
  VoucherType: string;
}

interface CRT {
  CRT_USR_No?: string;
  CRT_Date?: string;
}

interface UPD {
  UPD_USR_No?: string;
  UPD_Date?: string;
}

export interface FIN53010Data extends Pick<FIN53010Basic, 'VouType' | 'VouNo' | 'PostFlag' | 'VoucherType'> {
  id: number;
  Remark: string;
  AccAmt: number;
  DetailCount: number;
  /** 是否可刪除（僅當日最後一張且狀態為建立） */
  CanDelete: boolean;
  VouDate: string;
}

export interface QueryFIN53010Detail extends FIN53010Basic, CRT, UPD {
  CompNo: string;
  Details: FIN53010Detail[];
  Remark: string;
  VouDate: string;
  id: number;
}

export type FIN53010DataDetail = Omit<ApiResponse<QueryFIN53010Detail[]>, 'Data'> & { Data: QueryFIN53010Detail; };

/**
 * 代表 FIN53010 記錄的明細。
 *
 * @interface FIN53010Detail
 * AccAmt: 借貸方 D/C 金額
 * AccDC: 借貸方D/C
 * AccName: 科目名稱
 * AccNo: 科目代號 (GLS1005)
 * DetailName: 廠商/員工名稱
 * DetailNo: 廠商/員工編號
 * NoteDesc: 摘要
 * ORG_ID: 組織編號
 * SerNo: 顯示用序號，10 為單位遞增
 * SubDetailNo: 對象編號
 * PTA: 立沖代號
 * id: 明細檔流水號
 * index: 索引
 */
export interface FIN53010Detail {
  AccAmt: number;
  AccDC: string;
  AccNo: string;
  DetailNo?: string;
  NoteDesc?: string;
  ORG_ID?: string;
  SerNo: number;
  SubDetailNo?: string;
  id: number;
  ACCT_KEY?: string | null;
}

/**
 * FIN53010 明細檔 (Table 顯示用)
 * AccAmtC: 貸方金額
 * AccAmtD: 借方金額
 * AccName: 科目名稱
 * DetailName: 廠商/員工名稱
 * ReflNo: 參考編號
 * PTA: 立沖代號
 * recKey: 對帳KEY值
 */
export interface FIN53010DetailTable extends FIN53010Detail {
  AccAmtC?: number;
  AccAmtD?: number;
  AccCName?: string;
  DetailName?: string;
  ReflNo?: string;
  PTA?: string;
  recKey?: string;
  /** 立帳已被沖帳 → 該列不可編輯 */
  _ptaLocked?: boolean;
}

export interface FIN53010Payload extends ApiRequest, Partial<Pick<FIN53010Basic, 'VouType' | 'PostFlag' | 'VouAccType'>> {
  Remark?: string;
  CRT_USR_No?: string;
  UPD_USR_No?: string;
  VouNoStart?: string;
  VouNoEnd?: string;
  VouDateStart?: Date;
  VouDateEnd?: Date;
  CrtDateStart?: Date;
  CrtDateEnd?: Date;
  UpdDateStart?: Date;
  UpdDateEnd?: Date;
  VoucherType?: string[];
}

export interface FIN53010Insert extends FIN53010Basic {
  VouDateEnd: Date;
  Remark?: string;
  Details: FIN53010Detail[];
}

/** Swagger InsertFIN53010Detail */
export interface InsertFIN53010DetailBody {
  index?: number;
  SerNo?: number;
  AccDC?: string | null;
  AccNo?: string | null;
  AccAmt?: number;
  ORG_ID?: string | null;
  DetailNo?: string | null;
  SubDetailNo?: string | null;
  ProjectNo?: string | null;
  NoteDesc?: string | null;
  PTA?: string | null;
  ACCT_KEY?: string | null;
}

/** Swagger insertAPS3001Data */
export interface InsertAPS3001DataBody {
  org_id?: string | null;
  ACP_YYYYMM?: string | null;
  ACP_Date?: string | null;
  VEN_No?: string | null;
  VEN_Name?: string | null;
  VEN_Uniform?: string | null;
  AccNo?: string | null;
  ACP_Amt?: number | null;
  VEN_PayType?: string | null;
  VEN_BNK_No?: string | null;
  VEN_BNK_BranchNo?: string | null;
  VEN_BankAccountNo?: string | null;
  VEN_AccountName?: string | null;
  ACP_ExpectPayDate?: string | null;
  NoteDesc?: string | null;
  VEN_CTRLYN?: string | null;
  PTA?: string | null;
}

/** Swagger insertAPS2002Data */
export interface InsertAPS2002DataBody {
  PUR_GUINo?: string | null;
  PUR_VoucherType?: string | null;
  ACP_Type?: string | null;
  PUR_GUIDate?: string | null;
  PUR_VenNo?: string | null;
  PUR_VenName?: string | null;
  PUR_VenUniform?: string | null;
  PUR_Net?: number;
  PUR_Tax?: number;
  PUR_Amt?: number;
  // PUR_Uniform?: string | null;
  PUR_TaxType?: string | null;
  PUR_DiscNo?: string | null;
  PUR_RepYYYYMM?: string | null;
  PUR_DirectType?: string | null;
  PUR_SeqNo?: number;
  PUR_Type?: string | null;
  PUR_Comb_Cnt?: number | null;
  PUR_Comb?: string | null;
  Source_Doc_No?: string | null;
  /** 折讓用：區別 'R'=退出 'C'=折讓（格式 23/24 時帶入，後端待確認） */
  Credit_Type?: string | null;
}

/** Swagger insertARS3001Data */
export interface InsertARS3001DataBody {
  ORG_ID?: string | null;
  ARS_Amt?: number | null;
  PTA_Date?: string | null;
  ARS_Date?: string | null;
  VEN_No?: string | null;
  VEN_Name?: string | null;
  VEN_Uniform?: string | null;
  AccNo?: string | null;
  NoteDesc?: string | null;
  ACCT_KEY?: string | null;
  PTA?: string | null;
}

/** Swagger insertAPS4023Data */
export interface InsertAPS4023DataBody {
  ID?: number;
  InvoiceType?: string | null;
  InvoicePrefix?: string | null;
  InvoiceNo?: string | null;
  InvoiceDate?: string | null;
  INV_DeclareYM?: string | null;
  Buyer_Uniform?: string | null;
  PUR_Amt?: number | null;
  PUR_TaxType?: string | null;
  PUR_Net?: number | null;
  PUR_Tax?: number | null;
  Source_Doc_No?: string | null;
  AssetType?: string | null;
  /** 折讓用：區別 'R'=退出 'C'=折讓（格式 33/34） */
  Credit_Type?: string | null;
}

/** Swagger insertAPS4002Data */
export interface InsertAPS4002DataBody {
  BNK_id?: string | null;
  DAmt?: number;
  CAmt?: number;
  VEN_No?: string | null;
  Remark?: string | null;
  Source_Date?: string | null;
  Status?: string | null;
}

/** Swagger insertFIN53010DetailData_NextRequest（五陣列一律送出，無資料為 []） */
export interface InsertFIN53010DetailDataNextBody {
  insertAPS3001Datas: InsertAPS3001DataBody[];
  insertAPS2002Datas: InsertAPS2002DataBody[];
  insertARS3001Datas: InsertARS3001DataBody[];
  /** 銷項發票（格式 35，寫入 APS4023） */
  insertAPS4023Datas: InsertAPS4023DataBody[];
  /** 銷項發票（格式 31/32，寫入 POS4023） */
  insertPOS4023Datas: InsertAPS4023DataBody[];
  insertAPS4002Datas: InsertAPS4002DataBody[];
}

/** Swagger InsertFIN53010Request */
export interface InsertFIN53010Request {
  VouNo?: string | null;
  VouType?: string | null;
  VouDate: string;
  PostFlag?: string | null;
  VoucherType?: string | null;
  INV_YN?: string | null;
  Remark?: string | null;
  VouAccType?: string | null;
  Details?: InsertFIN53010DetailBody[] | null;
  insertFIN53010DetailData_Next: InsertFIN53010DetailDataNextBody;
}

/** Swagger InsertFIN53010Response 單筆 */
export interface InsertFIN53010ResponseItem {
  gls3002_id?: number;
  DetailCount?: number;
  VouNo?: string | null;
}

/** Swagger UpdateFIN53010Detail */
export interface UpdateFIN53010DetailBody {
  id?: number | null;
  index?: number;
  SerNo?: number;
  AccDC?: string | null;
  AccNo?: string | null;
  AccAmt?: number;
  ORG_ID?: string | null;
  DetailNo?: string | null;
  SubDetailNo?: string | null;
  ProjectNo?: string | null;
  NoteDesc?: string | null;
  PTA?: string | null;
  ACCT_KEY?: string | null;
}

export type UpdateAPS3001DataBody = InsertAPS3001DataBody & { id?: number };
export type UpdateARS3001DataBody = InsertARS3001DataBody & { id?: number };
export type UpdateAPS2002DataBody = InsertAPS2002DataBody & { id?: number };
export type UpdateAPS4023DataBody = InsertAPS4023DataBody;
export type UpdateAPS4002DataBody = InsertAPS4002DataBody & { id?: number };

/** updateFIN53010DetailData_NextRequest */
export interface UpdateFIN53010DetailDataNextBody {
  updateAPS3001Datas?: UpdateAPS3001DataBody[] | null;
  updateAPS2002Datas?: UpdateAPS2002DataBody[] | null;
  updateARS3001Datas?: UpdateARS3001DataBody[] | null;
  /** 銷項發票（格式 35，寫入 APS4023） */
  updateAPS4023Datas?: UpdateAPS4023DataBody[] | null;
  /** 銷項發票（格式 31/32，寫入 POS4023） */
  updatePOS4023Datas?: UpdateAPS4023DataBody[] | null;
  updateAPS4002Datas?: UpdateAPS4002DataBody[] | null;
}

/** UpdateFIN53010Request */
export interface UpdateFIN53010Request {
  id: number;
  CompNo?: string | null;
  VouNo?: string | null;
  VouType?: string | null;
  VouDate: string;
  PostFlag?: string | null;
  VoucherType?: string | null;
  INV_YN?: string | null;
  Remark?: string | null;
  VouAccType?: string | null;
  Details?: UpdateFIN53010DetailBody[] | null;
  updateFIN53010DetailData_Next?: UpdateFIN53010DetailDataNextBody | null;
}

/** @deprecated 請改用 InsertFIN53010Request */
export type FIN53010InsertPayload = InsertFIN53010Request;

/** @deprecated 請改用 UpdateFIN53010Request */
export type FIN53010UpdatePayload = UpdateFIN53010Request;

export type FIN53010InsertResult = Omit<ApiResponse<unknown[]>, 'Data'> & {
  Data: InsertFIN53010ResponseItem[] | null;
};

export type FIN53010UpdateResult = Omit<ApiResponse<unknown[]>, 'Data'> & {
  Data: InsertFIN53010ResponseItem[] | null;
};

export type FIN53010DeleteResult = Omit<ApiResponse<any[]>, 'Data'> & {
  Data: Record<string, any>;
};

/** updateStatusFIN53010 Request */
export interface VoidFIN53010Request {
  /** GLS3001_ID字串(用逗號分隔) */
  GLS3001_IDList: string;
}
export interface VendorList {
  VEN_No: string;
  VEN_Name: string;
  VEN_ShortName: string;
  VEN_Uniform: string;
}

export interface AccNoList {
  AccNo: string;
  AccCName: string;
}

export interface VoucherType {
  Id: number;
  VoucherKind: string;
  VoucherName: string;
  Status: string;
}

export interface NoteDescList {
  AccNoNoteDesc: Record<string, string[]>;
}

export type NoteDescResponse = Omit<ApiResponse<NoteDescList[]>, 'Data'> & {
  Data: NoteDescList;
};

export interface AccDescOption extends Option {
  data?: Option[];
}

/** queryPOS2013_FIN53010_DropDownList Request */
export interface QueryPos2013Fin53010Request {
  VEN_No?: string | null;
}

/**
 * queryPOS2013_FIN53010_DropDownList 單筆（Swagger Data.items）
 */
export interface Pos2013Fin53010DropdownItem {
  id?: number;
  mid?: number;
  VEN_No?: string | null;
  VEN_Name?: string | null;
  VEN_ShortName?: string | null;
  VEN_EngName?: string | null;
  VEN_Flag?: string | null;
  VEN_Uniform?: string | null;
  VEN_RemitFeeMode?: string | null;
  VEN_Post?: string | null;
  VEN_Address?: string | null;
  VEN_Tel?: string | null;
  VEN_Fax?: string | null;
  VEN_Email?: string | null;
  VEN_GUIAddr?: string | null;
  VEN_GUIEmail?: string | null;
  VEN_PayType?: string | null;
  VEN_BNK_No?: string | null;
  VEN_BNK_BranchNo?: string | null;
  VEN_BankAccountNo?: string | null;
  VEN_AccountName?: string | null;
  VEN_PayConditionDay?: number | null;
  VEN_CheckTitle?: string | null;
  VEN_Status?: string | null;
  Approved_Date?: string | null;
  VEN_DiscYN?: string | null;
  VEN_CTRLYN?: string | null;
  VEN_DiscDateB?: string | null;
  VEN_DiscDateE?: string | null;
  GUI_ID_WIRE?: string | null;
  VEN_Remark?: string | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  CHARGE_STAFF?: string | null;
  CHARGE_TITLE?: string | null;
  CHARGE_PID?: string | null;
  CHARGE_TEL?: string | null;
  CHARGE_ADDR?: string | null;
  CHARGE_EMAIL?: string | null;
  ORDER_ADDR?: string | null;
  ORDER_TEL?: string | null;
  ORDER_FAX?: string | null;
  FACTO_ADDR?: string | null;
  FACTO_TEL?: string | null;
  FACTO_FAX?: string | null;
  DELIVERY?: string | null;
  RETURN_ORDER?: string | null;
  DELIVERY_LIMIT?: string | null;
  VEN_ORDER_ADDR?: string | null;
  VEN_ORDER_TEL?: string | null;
  VEN_ORDER_FAX?: string | null;
  VEN_FACTO_ADDR?: string | null;
  VEN_FACTO_TEL?: string | null;
  VEN_FACTO_FAX?: string | null;
  VEN_DELIVERY?: string | null;
  VEN_RETURN_ORDER?: string | null;
  VEN_DELIVERY_LIMIT?: string | null;
  VEN_PostAddr?: string | null;
}

/**
 * queryGLS1005_FIN53010_DropDownList 單筆（Swagger Data.items）
 */
export interface Gls1005Fin53010DropdownItem {
  CompNo?: string | null;
  AccNo?: string | null;
  AccCName?: string | null;
  AccEName?: string | null;
  ClassNo?: string | null;
  AccDC?: string | null;
  Ledger_MD?: string | null;
  ParentAccNo?: string | null;
  Input_YN?: string | null;
  ABAT_YN?: string | null;
  NoteDesc?: string | null;
  Voucher_Type?: string | null;
  Budget_YN?: string | null;
  Org_YN?: string | null;
  ROC_AccNo?: string | null;
  IFRS_AccNo?: string | null;
  DEPRE_AccNo?: string | null;
  ACCUDEPRE_AccNo?: string | null;
  EXP_YEAR?: number | null;
  RESI_YEAR?: number | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  RESI_VALUE?: number | null;
}

/** queryAPS4023DetatilData_ByInvoiceNumber Request */
export interface QueryAps4023DetailDataByInvoiceNumberRequest {
  InvoiceNumber?: string | null;
}

/** queryAPS2002DetailData_ByInvoiceNo Request */
export interface QueryAps2002DetailDataByInvoiceNoRequest {
  InvoiceNo?: string | null;
}

/** queryAPS2002DetailData_ByInvoiceNo Response Data（進項折讓原始發票查詢） */
export interface Aps2002DetailDataByInvoiceNoData {
  PUR_GUINo?: string | null;
  /** 原格式（21/22/25），前端轉換為 23/24 後寫入 voucher_type */
  PUR_VoucherType?: string | null;
  /** 原發票日期 */
  PUR_GUIDate?: string | null;
  /** 原發票總金額 */
  PUR_Amt?: number | null;
  /** 銷受人統一編號 */
  PUR_VenUniform?: string | null;
  PUR_TaxType?: string | null;
  PUR_Net?: number | null;
  PUR_Tax?: number | null;
  /** 已退回/折讓金額（後端加總已有 23/24 records） */
  AlreadyAllowanceAmt?: number | null;
}

/** queryAPS2002OriginalInvoices_ForAllowance Request */
export interface QueryAps2002OriginalInvoicesForAllowanceRequest {
  InvoiceNo?: string | null;
  /** 折讓發票格式（23→查原始 21/25；24→查原始 22） */
  AllowanceType?: string | null;
  PageSize?: number | null;
  PageIndex?: number | null;
}

/** queryAPS4023OriginalInvoices_ForAllowance Request */
export interface QueryAps4023OriginalInvoicesForAllowanceRequest {
  InvoiceNumber?: string | null;
  /** 折讓發票格式（33→查原始 31/35；34→查原始 32） */
  AllowanceType?: string | null;
  PageSize?: number | null;
  PageIndex?: number | null;
}

/** queryPOS4023DetailData_ByInvoiceNumber Request */
export interface QueryPos4023DetailDataByInvoiceNumberRequest {
  InvoiceNumber?: string | null;
}

/** queryPOS4023SalesInvoices_ForPicker / queryAPS4023SalesInvoices_ForPicker Request */
export interface QuerySalesInvoicesForPickerRequest {
  InvoiceNumber?: string | null;
  PageSize?: number | null;
  PageIndex?: number | null;
}

/** 銷項發票 picker 正規化項目（POS4023 與 APS4023 統一成同一形狀供彈窗顯示／帶出） */
export interface SalesInvoicePickItem {
  /** 完整發票號碼（10碼） */
  InvoiceNumber: string;
  /** 發票格式（31/32/35） */
  InvoiceType: string;
  InvoiceDate: string | null;
  /** 發票總金額（含稅） */
  TotalAmount: number | null;
  NetAmount: number | null;
  TaxAmount: number | null;
  TaxType: string | null;
  BuyerUniform: string | null;
  DeclareYM: string | null;
  AssetType: string | null;
  SourceDocNo: string | null;
  /** 已綁定的傳票編號（有值＝已被某張傳票使用） */
  VoucherNo: string | null;
  /** 來源主檔 ID（POS4023.ID 或 APS4023.ID），帶回後存 row.id，存檔走 update */
  SourceId: number | null;
}

/** POS4023 銷項發票主檔（格式 31/32），供帶出／picker（欄位對齊 Models.POS4023） */
export interface Pos4023DetailDataByInvoiceNumberData {
  ID?: number;
  TXN_GUINo?: string | null;
  INV_GUIType?: string | null;
  INV_GUITrack?: string | null;
  INV_GUINumber?: string | null;
  TXN_Date?: string | null;
  INV_DeclareYM?: string | null;
  TXN_Uniform?: string | null;
  TXN_SaleAmt?: number | null;
  PLU_TaxType?: string | null;
  TXN_Net?: number | null;
  TXN_Tax?: number | null;
  Source_Doc_No?: string | null;
  AssetType?: string | null;
  Voucher_No?: string | null;
  INV_Cancel?: string | null;
}

/** getCalculatedPayDate Request */
export interface GetCalculatedPayDateRequest {
  VenNo?: string | null;
  _Date?: string | null;
}

/** getCalculatedPayDate Response */
export type GetCalculatedPayDateResult = Omit<ApiResponse<string | null[]>, 'Data'> & {
  Data: string | null;
};

/** getEmployeeBankAccount Request */
export interface GetEmployeeBankAccountRequest {
  UserNo: string;
}

/** getEmployeeBankAccount 單筆（欄位對齊 APS3001 匯款欄位；員工尚未進 POS2013 廠商主檔時改由 tblUser_BnkAcct 帶出） */
export interface EmployeeBankAccountItem {
  UserNo?: string | null;
  UserName?: string | null;
  VEN_BNK_No?: string | null;
  VEN_BNK_BranchNo?: string | null;
  VEN_BankAccountNo?: string | null;
  VEN_AccountName?: string | null;
  SEQ_NO?: number | null;
  RATIO?: number | null;
}

/** getEmployeeBankAccount Response */
export type GetEmployeeBankAccountResult = Omit<ApiResponse<EmployeeBankAccountItem[]>, 'Data'> & {
  Data: EmployeeBankAccountItem[] | null;
};

/** queryAPS4023DetatilData_ByInvoiceNumber 200 Data（發票主檔） */
export interface Aps4023DetailDataByInvoiceNumberData {
  ID?: number;
  mid?: number;
  STO_No?: string | null;
  InvoiceNumber?: string | null;
  InvoiceType?: string | null;
  InvoiceDate?: string | null;
  InvoiceTime?: string | null;
  Seller_Uniform?: string | null;
  Buyer_Uniform?: string | null;
  Buyer_VenNo?: string | null;
  Buyer_Name?: string | null;
  Group_Mark?: string | null;
  Donate_Mark?: string | null;
  Invoice_VoidDT?: string | null;
  Invoice_Cancel?: string | null;
  PUR_Net?: number;
  PUR_Tax?: number;
  PUR_Amt?: number;
  PUR_TaxType?: string | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  Print_Date?: string | null;
  ORG_INV_Date?: string | null;
  ORG_INV_Time?: string | null;
  TXN_Ret_No?: string | null;
  INV_RcvTime?: string | null;
  INV_VoidTime?: string | null;
  INV_RjtTime?: string | null;
  Credit_Type?: string | null;
  Source_Doc_No?: string | null;
  Voucher_No?: string | null;
  INV_DeclareYM?: string | null;
  INV_REMARK?: string | null;
  SAL_Type?: string | null;
  AssetType?: string | null;
  TXN_GUIRemark?: string | null;
  /** 已退回/折讓金額（後端加總已有 33/34 records） */
  AlreadyAllowanceAmt?: number | null;
}
export interface QueryFIN53010DetailDataByVouNoRequest {
  VouNo?: string | null;
}
export interface APS3001 {
  id?: number | null;
  mid?: number | null;
  STO_No?: string | null;
  ACP_No?: string | null;
  org_id?: string | null;
  ACP_YYYYMM?: string | null;
  acp_termno?: number | null;
  ACP_Date?: string | null;
  VEN_No?: string | null;
  VEN_Name?: string | null;
  VEN_Uniform?: string | null;
  AccNo?: string | null;
  AccCName?: string | null;
  ACP_SourceNo?: string | null;
  ACP_Amt?: number | null;
  PTA_Amt?: number | null;
  ACP_ReserveAmt?: number | null;
  RET_Amt?: number | null;
  ACP_Status?: string | null;
  VEN_PayType?: string | null;
  VEN_BNK_No?: string | null;
  VEN_BNK_BranchNo?: string | null;
  VEN_BankAccountNo?: string | null;
  VEN_AccountName?: string | null;
  ACP_ExpectPayDate?: string | null;
  VEN_CheckTitle?: string | null;
  VEN_CTRLYN?: string | null;
  NoteDesc?: string | null;
  gls3001_id?: number | null;
  VouNo?: string | null;
  CompNo?: string | null;
  PTA?: string | null;
  SubDetailNo?: string | null;
  ProjectNo?: string | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  PAM_No?: string | null;
}

export interface APS2002 {
  id?: number | null;
  mid?: number | null;
  STO_No?: string | null;
  PUR_GUINo?: string | null;
  PUR_VoucherType?: string | null;
  ACP_Type?: string | null;
  PUR_GUIDate?: string | null;
  PUR_VenNo?: string | null;
  PUR_VenName?: string | null;
  PUR_VenUniform?: string | null;
  PUR_Net?: number | null;
  PUR_Tax?: number | null;
  PUR_Amt?: number | null;
  PUR_Uniform?: string | null;
  PUR_TaxType?: string | null;
  PUR_GUIStatus?: string | null;
  PUR_ExpAPDate?: string | null;
  ACP_YYYYMM?: string | null;
  PUR_ExpGLDate?: string | null;
  PUR_ExpMediaDate?: string | null;
  PUR_GUIBalance?: number | null;
  PUR_DiscNo?: string | null;
  ACP_No?: string | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  PUR_RepYYYYMM?: string | null;
  ODM_VendorOrderNo?: string | null;
  PUR_DirectType?: string | null;
  PUR_SeqNo?: number | null;
  SAL_Type?: string | null;
  tlt_no?: string | null;
  contract_no?: string | null;
  contract_subno?: number | null;
  PUR_Remark?: string | null;
  TXN_Ret_No?: string | null;
  Credit_Type?: string | null;
  Source_Doc_No?: string | null;
  Voucher_No?: string | null;
  PUR_Type?: string | null;
  SYS_ORIGIN?: string | null;
  PUR_Comb_Cnt?: number | null;
  PUR_Comb?: string | null;
  /** 原發票日期（後端 self-join：23/24 折讓列由 b.PUR_GUIDate 帶入，21/22/25 正常列為 null） */
  Orig_InvoiceDate?: string | null;
  /** 原發票總金額（後端 self-join：23/24 折讓列由原始 21/22/25 帶入，其餘為 null） */
  Orig_Amount?: number | null;
}

export interface ARS3001 {
  id?: number | null;
  mid?: number | null;
  STO_No?: string | null;
  ARS_No?: string | null;
  ORG_ID?: string | null;
  sam_yyymm?: string | null;
  sam_termno?: number | null;
  ARS_Amt?: number | null;
  PTA_Amt?: number | null;
  PTA_Date?: string | null;
  ARS_Date?: string | null;
  VEN_No?: string | null;
  VEN_Name?: string | null;
  VEN_Uniform?: string | null;
  AccNo?: string | null;
  ARS_SourceNo?: string | null;
  ARS_Status?: string | null;
  PTA?: string | null;
  ACCT_KEY?: string | null;
  NoteDesc?: string | null;
  gls3001_id?: number | null;
  CompNo?: string | null;
  VouNo?: string | null;
  SubDetailNo?: string | null;
  ProjectNo?: string | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  PAM_No?: string | null;
}

/** #/components/schemas/APS4023 */
export interface APS4023 {
  ID?: number | null;
  mid?: number | null;
  STO_No?: string | null;
  InvoiceNumber?: string | null;
  InvoiceType?: string | null;
  InvoiceDate?: string | null;
  InvoiceTime?: string | null;
  Seller_Uniform?: string | null;
  Buyer_Uniform?: string | null;
  Buyer_VenNo?: string | null;
  Buyer_Name?: string | null;
  Group_Mark?: string | null;
  Donate_Mark?: string | null;
  Invoice_VoidDT?: string | null;
  Invoice_Cancel?: string | null;
  PUR_Net?: number | null;
  PUR_Tax?: number | null;
  PUR_Amt?: number | null;
  PUR_TaxType?: string | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  Print_Date?: string | null;
  ORG_INV_Date?: string | null;
  ORG_INV_Time?: string | null;
  TXN_Ret_No?: string | null;
  INV_RcvTime?: string | null;
  INV_VoidTime?: string | null;
  INV_RjtTime?: string | null;
  Credit_Type?: string | null;
  Source_Doc_No?: string | null;
  Voucher_No?: string | null;
  INV_DeclareYM?: string | null;
  INV_REMARK?: string | null;
  SAL_Type?: string | null;
  AssetType?: string | null;
  TXN_GUIRemark?: string | null;
  /** 原發票日期（後端 self-join：33/34 折讓列由 b.InvoiceDate 帶入，31/32/35 正常列為 null） */
  Orig_InvoiceDate?: string | null;
  /** 原發票總金額（後端 self-join：33/34 折讓列由原始 31/32/35 帶入，其餘為 null） */
  Orig_Amount?: number | null;
}

export interface APS4002 {
  id?: number | null;
  mid?: number | null;
  TXN_No?: string | null;
  BNK_id?: string | null;
  DAmt?: number | null;
  CAmt?: number | null;
  VEN_No?: string | null;
  Remark?: string | null;
  VouNo?: string | null;
  Status?: string | null;
  Source_No?: string | null;
  Source_Date?: string | null;
  SYS_ORIGIN?: string | null;
  CRT_Date?: string | null;
  CRT_USR_No?: string | null;
  CRT_USR_Name?: string | null;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

export type FIN53010Aps3001Row = APS3001 & { VEN_PayType_Name?: string | null };

/**
 * Swagger `#/components/schemas/_APS2002DataInfo`
 * `queryFIN53010DetailData_ByVouNo` 之 `_APS2002.Details` 單筆（與 DB 版 `APS2002` 欄位命名不同）
 */
export interface Fin53010Aps2002ByVouNoRow {
  VoucherType?: string | null;
  TrackNo?: string | null;
  InvoiceDate?: string | null;
  DeclareYM?: string | null;
  VendorTaxID?: string | null;
  InvoiceUsage?: string | null;
  InvoiceAmount?: number | null;
  TaxType?: string | null;
  NetAmount?: number | null;
  TaxAmount?: number | null;
  DeductionCodeDesc?: string | null;
  CategoryType?: string | null;
  SourceDocNo?: string | null;
  TotalCount?: number | null;
}

/**
 * Swagger `#/components/schemas/_APS2002Data`
 * `queryFIN53010DetailData_ByVouNo` 之 `_APS2002` 區塊（含合計與明細）
 */
export interface Fin53010Aps2002ByVouNoBucket {
  Details?: Fin53010Aps2002ByVouNoRow[] | null;
  Total_InvoiceAmount?: number | null;
  Total_NetAmount?: number | null;
  Total_TaxAmount?: number | null;
}

/** 關聯明細表（ByVouNo）列型別 */
export type FIN53010Aps2002Row = Fin53010Aps2002ByVouNoRow;

/** 進項折讓 APS2002_C 明細列 */
export interface FIN53010Aps2002_CRow {
  Orig_RepYYYYMM?: string | null;
  InvoiceNo?: string | null;
  VoucherType?: string | null;
  Orig_InvoiceDate?: string | null;
  CreditDate?: string | null;
  RepYYYYMM?: string | null;
  CreditTypeDesc?: string | null;
  Orig_Amount?: number | null;
  BuyerUniformNo?: string | null;
  ReturnedAmount?: number | null;
  CreditAmount?: number | null;
  TaxTypeDesc?: string | null;
  CreditNetAmount?: number | null;
  CreditTaxAmount?: number | null;
}

export type FIN53010Ars3001Row = ARS3001;

export type FIN53010Aps4002QueryRow = APS4002;

export type FIN53010Aps4023Row = APS4023;

/** 銷項折讓 APS4023_C 明細列 */
export interface FIN53010Aps4023_CRow {
  Original_Invoice_DeclareYM?: string | null;
  Invoice_Number?: string | null;
  Invoice_Type?: string | null;
  Original_Invoice_Date?: string | null;
  Credit_Invoice_Date?: string | null;
  DeclareYM?: string | null;
  Credit_Type_Flag?: string | null;
  Buyer_Uniform_No?: string | null;
  Returned_Amount_Zero?: number | null;
  Returned_Amount?: number | null;
  Tax_Type?: string | null;
  pur_net?: number | null;
  pur_tax?: number | null;
}

export interface FIN53010DetailBucket<T> {
  Details?: T[] | null;
}

export interface Fin53010Aps3001ByVouNoBucket {
  Details?: FIN53010Aps3001Row[] | null;
  Total_ACP_Amt?: number | null;
}

export interface Fin53010Ars3001ByVouNoBucket {
  Details?: FIN53010Ars3001Row[] | null;
  Total_ars_amt?: number | null;
}

export interface Fin53010Aps2002_CByVouNoBucket {
  Details?: FIN53010Aps2002_CRow[] | null;
  Total_CreditAmount?: number | null;
  Total_CreditNetAmount?: number | null;
  Total_CreditTaxAmount?: number | null;
}

export interface Fin53010Aps4023ByVouNoBucket {
  Details?: FIN53010Aps4023Row[] | null;
  Total_TotalAmount?: number | null;
  Total_NetAmount?: number | null;
  Total_TaxAmount?: number | null;
}

export interface Fin53010Aps4023_CByVouNoBucket {
  Details?: FIN53010Aps4023_CRow[] | null;
  Total_Returned_Amount?: number | null;
  Total_pur_net?: number | null;
  Total_pur_tax?: number | null;
}

export interface FIN53010Aps4002ByVouNoRow {
  BNK_id?: string | null;
  BNK_AccName?: string | null;
  DAmt?: number | null;
  CAmt?: number | null;
  VEN_No?: string | null;
  VEN_Name?: string | null;
  Remark?: string | null;
}

export interface Fin53010Aps4002ByVouNoBucket {
  Details?: FIN53010Aps4002ByVouNoRow[] | null;
}

export interface QueryFIN53010DetailDataByVouNoResponse {
  _APS3001?: Fin53010Aps3001ByVouNoBucket | null;
  _APS2002?: Fin53010Aps2002ByVouNoBucket | null;
  _APS2002_C?: Fin53010Aps2002_CByVouNoBucket | null;
  _ARS3001?: Fin53010Ars3001ByVouNoBucket | null;
  _APS4023?: Fin53010Aps4023ByVouNoBucket | null;
  _APS4023_C?: Fin53010Aps4023_CByVouNoBucket | null;
  _APS4002?: Fin53010Aps4002ByVouNoBucket | null;
}

export type FIN53010DetailDataByVouNoResult = Omit<ApiResponse<QueryFIN53010DetailDataByVouNoResponse[]>, 'Data'> & {
  /** 單筆物件（非陣列） */
  Data: QueryFIN53010DetailDataByVouNoResponse | null;
};

export type QueryFIN53010DetailDataByVouNoForUpdateRequest = QueryFIN53010DetailDataByVouNoRequest;

export interface Pos4023 {
  ID?: number | null;
  mid?: number | null;
  SYS_StoreNo?: string | null;
  TXN_Date?: string | null;
  ECR_No?: string | null;
  TXN_No?: number | null;
  TXN_GUINo?: string | null;
  TXN_GUIPaper?: string | null;
  TXN_SaleAmt?: number | null;
  TXN_SaleTax?: number | null;
  TXN_SaleNoTax?: number | null;
  TXN_Net?: number | null;
  TXN_Tax?: number | null;
  PLU_TaxType?: string | null;
  TXN_Uniform?: string | null;
  INV_Cancel?: string | null;
  INV_YM?: string | null;
  INV_DeclareYM?: string | null;
  INV_GUITrack?: string | null;
  INV_GUINumber?: string | null;
  INV_GUIType?: string | null;
  INV_TXNType?: string | null;
  Voucher_No?: string | null;
}

export interface QueryFIN53010DetailDataByVouNoForUpdateResponse {
  _APS3001s?: APS3001[] | null;
  _APS2002s?: APS2002[] | null;
  _ARS3001s?: ARS3001[] | null;
  _APS4023s?: APS4023[] | null;
  _POS4023s?: Pos4023[] | null;
  _APS4002s?: APS4002[] | null;
  Total_ACP_Amt?: number;
  Total_ARS_Amt?: number;
  Total_PUR_Amt_APS2002?: number;
  Total_PUR_Net_APS2002?: number;
  Total_PUR_Tax_APS2002?: number;
  Total_PUR_Amt_APS4023?: number;
  Total_PUR_Net_APS4023?: number;
  Total_PUR_Tax_APS4023?: number;
  Total_DAmt?: number;
  Total_CAmt?: number;
}

export type FIN53010DetailDataByVouNoForUpdateResult = Omit<ApiResponse<QueryFIN53010DetailDataByVouNoForUpdateResponse[]>, 'Data'> & {
  Data: QueryFIN53010DetailDataByVouNoForUpdateResponse | null;
};

/** FIN53010 新增多步驟：應付帳款（Voucher_Type=3） */
export interface FIN53010StepAP {
  /** 更新 APS3001 時帶入 */
  id?: number;
  /** 顯示用序號（10 為單位遞增），不送 API */
  SerNo?: number;
  org_id?: string;
  ven_no?: string;
  ven_pay_type?: string;
  acp_amt?: number;
  acp_expect_pay_date?: Date | null;
  acp_date?: Date | null;
  ven_bnk_no?: string;
  ven_bnk_branch_no?: string;
  ven_bank_account?: string;
  ven_ctrlyn?: string;
  ven_check_title?: string;
  acc_no?: string;
  note_desc?: string;
  PTA?: string | null;
  /** 應付單號（唯讀顯示，編輯既有資料時帶入） */
  ACP_No?: string | null;
}

/** FIN53010 新增多步驟：應收帳款（Voucher_Type=4） */
export interface FIN53010StepAR {
  /** 更新 ARS3001 時帶入 */
  id?: number;
  /** 顯示用序號（10 為單位遞增），不送 API */
  SerNo?: number;
  org_id?: string;
  ven_no?: string;
  ars_amt?: number;
  pta_date?: Date | null;
  ars_date?: Date | null;
  acc_no?: string;
  note_desc?: string;
  ACCT_KEY?: string | null;
  PTA?: string | null;
  /** 應收單號（唯讀顯示，編輯既有資料時帶入） */
  ARS_No?: string | null;
}

/** FIN53010 新增多步驟：銷項發票（Voucher_Type=6）單列 */
export interface FIN53010StepSalesInvoiceRow {
  /** APS4023 主檔 ID（insert／update APS4023Data 用） */
  id?: number;
  /** 顯示用序號（10 為單位遞增），不送 API */
  SerNo?: number;
  invoice_type?: string;
  invoice_prefix?: string;
  invoice_no?: string;
  invoice_date?: Date | null;
  declare_ym?: Date | null;
  buyer_uniform?: string;
  total_amount?: number;
  tax_type?: string;
  net_amount?: number;
  tax_amount?: number;
  source_doc_no?: string;
  summary_count?: number;
  asset_flag?: string;
  /** 來自 POS4023（手開發票），唯讀，不送 insert/update API */
  isPOS4023?: boolean;
  /** 發票作廢旗標 (來自 APS4023.Invoice_Cancel)，'Y' = 作廢 */
  inv_cancel?: string;
  /** 已通過 APS2001/POS1017 配號驗證，submit 時必須為 true */
  _invoiceValidated?: boolean;
  /** 折讓用：區別 'R'=退出 'C'=折讓（格式 33/34 時帶入） */
  credit_type?: string;
  /** 折讓用：退出/折讓日期（格式 33/34；invoice_date 仍為原發票日期） */
  credit_date?: Date | null;
  /** 退回/折讓總金額（含稅，= 未稅 + 稅額，系統計算顯示用，不供輸入） */
  allowance_amount?: number;
  /** 折讓防呆用：挑原始發票當下帶入的原發票總金額（PUR_Amt），僅前端驗證用，不送 API */
  orig_invoice_amount?: number;
  /** 折讓防呆用：挑原始發票當下該發票「已退回/折讓金額」快照，僅前端驗證用，不送 API */
  already_allowance_amt?: number;
}

/** FIN53010 新增多步驟：進項發票（Voucher_Type=5）單列 */
export interface FIN53010StepPurchaseInvoiceRow {
  /** 更新 APS2002 時帶入 */
  id?: number;
  /** 顯示用序號（10 為單位遞增），不送 API */
  SerNo?: number;
  voucher_type?: string;
  track_no?: string;
  invoice_no?: string;
  invoice_date?: Date | null;
  declare_ym?: Date | null;
  /** 廠商統一編號（顯示用，送 API 作 PUR_VenUniform） */
  vendor_tax_id?: string;
  /** 廠商代號（POS2013.VEN_No，送 API 作 PUR_VenNo） */
  ven_no?: string;
  invoice_usage?: string;
  invoice_amount?: number;
  tax_type?: string;
  net_amount?: number;
  tax_amount?: number;
  deduction_code?: string;
  category_type?: string;
  source_doc_no?: string;
  /** 彙加註記（自動計算：格式22/25且發票號空白或0000000000時為'A'） */
  comb?: string;
  total_count?: number;
  /** 折讓用：區別 'R'=退出 'C'=折讓（格式 23/24 時帶入） */
  credit_type?: string;
  /** 折讓用：退出/折讓日期（格式 23/24；invoice_date 仍為原發票日期） */
  credit_date?: Date | null;
  /** 退回/折讓總金額（含稅，= 未稅 + 稅額，系統計算顯示用，不供輸入） */
  allowance_amount?: number;
  /** 折讓防呆用：挑原始發票當下帶入的原發票總金額（PUR_Amt），僅前端驗證用，不送 API */
  orig_invoice_amount?: number;
  /** 折讓防呆用：挑原始發票當下該發票「已退回/折讓金額」快照，僅前端驗證用，不送 API */
  already_allowance_amt?: number;
}

/** FIN53010 新增多步驟：銀行存款（Voucher_Type=7） */
export interface FIN53010StepBankDeposit {
  /** 更新 APS4002 時帶入 */
  id?: number;
  /** 顯示用序號（10 為單位遞增），不送 API */
  SerNo?: number;
  ven_no?: string;
  bank_no?: string;
  deposit_amt?: number;
  withdraw_amt?: number;
  status?: string;
  note_desc?: string;
  txn_date?: Date | null;
}

export interface QueryGLS3003AbatAcctRequest {
  AccNo?: string | null;
  VouNo?: string | null;
  PTA?: string | null;
  /** 廠商或員工代號（對應 GLS3002.DetailNo，模糊查詢） */
  VEN_No?: string | null;
}

export interface QueryGLS3003AbatAcctResponse {
  RowNum?: number | null;
  VouNo?: string | null;
  NoteDesc?: string | null;
  DebitAmt?: number | null;
  CreditAmt?: number | null;
  PTA?: string | null;
  VEN_No?: string | null;
  VEN_Uniform?: string | null;
  VEN_ShortName?: string | null;
  USR_Name?: string | null;
}

export interface CheckGLS3003PtaLockedRequest {
  Gls3002Ids: number[];
}

export interface CheckGLS3003PtaLockedResponse {
  Gls3002Id: number;
  PTA?: string | null;
  AccNo?: string | null;
  AccAmt?: number | null;
}
