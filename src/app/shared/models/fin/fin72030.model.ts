// 零用金拋轉作業 (FIN72030) 資料模型

export interface FIN72030QueryRequest {
  SYS_StoreNo: string;
  PCS_RqstNo: string;
  LoginUsrNo: string;
  LoginUsrName: string;
}

export interface FIN72030MasterResult {
  Voucher_No: string;           // 拋轉前為「系統自動給號」，拋轉後為實際傳票號碼
  Voucher_Type: string;
  Voucher_Class: string;
  Voucher_Date: string | null;
  Voucher_Desc: string;
  CRT_Date: string | null;
  CRT_USR_No: string;
  CRT_USR_Name: string;
}

export interface FIN72030DetailResult {
  PCS_No: string;
  PCS_SeqNo: number | null;
  SeqNo: number | null;
  AccSort: string;
  AccNo: string;
  AccCName: string;
  VEN_Uniform: string;
  VEN_Name: string;
  VEN_No: string;
  NOTeDesc: string;
  DebitAmt: number;
  CreditAmt: number;
  ORG_ID: string;
  ORG_Name: string;
  PTA: string;
  ProjectNo: string;
}

export interface FIN72030QueryResult {
  MasterData: FIN72030MasterResult | null;
  DetailList: FIN72030DetailResult[];
}

export interface FIN72030PostingRequest {
  PCS_RqstNo: string;
  CreditOrgID?: string;
}

export interface FIN72030PostingResult {
  Voucher_No: string;
}

export interface PCS_RqstNoDropdownItem {
  PCS_RqstNo: string;
  PCS_RqstDate: string | null;
  Keep_UsrNo: string;
}
