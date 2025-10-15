import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

export interface FIN53010Data {
  id: number;
  /** 傳票號碼 yyyyMMddssss */
  VouNo: string;
  /** 傳票類別 */
  VouType: string;
  Remark: string;
  AccAmt: number;
  DetailCount: number;
}

/**
 * FIN53010 明細檔
 * index: 序號 (以10為單位序編) 起始0
 * SerNo: 序號 (以10為單位序編)
 * AccNo: 科目代號 (GLS1005)
 * DetailNo: 廠商/員工編號(廠商讀取 pos2013.ven_no, 員工讀取 tblUser.user_no
 * NoteDesc: 摘要
 * AccDC: 借貸方D/C
 * AccAmt: 借貸方D/C 金額
 * ORG_ID: 組織代號
 * SubDetailNo: 對象編號
 */
export interface FIN53010Detail {
  index: number;
  SerNo: number;
  AccNo: string;
  AccDC: string;
  DetailNo: string;
  NoteDesc: string;
  AccAmt: number;
  ORG_ID: string;
  SubDetailNo: string;
}

/**
 * FIN53010 明細檔 (Table 顯示用)
 * AccName: 科目名稱
 * DetailName: 廠商/員工名稱
 * recKey: 對帳KEY值
 */
export interface FIN53010DetailTable extends FIN53010Detail {
  AccName?: string;
  DetailName?: string;
  recKey?: number;
  AccAmtD?: number;
  AccAmtC?: number;
  displayIndex?: number;
}

export interface FIN53010Payload extends BaseQueryRequest {
  /** 傳票類別 */
  VouType?: string;
  /** 登帳狀態 */
  PostFlag?: string;
  /** RPC/IFRS */
  VouAccType?: string;
  Remark?: string;
  CRT_USR_No?: string;
  UPD_USR_No?: string;
  VouNoStart?: number;
  VouNoEnd?: number;
  VouDateStart?: Date;
  VouDateEnd?: Date;
  CrtDateStart?: Date;
  CrtDateEnd?: Date;
  UpdDateStart?: Date;
  UpdDateEnd?: Date;
}

export interface FIN53010InsertPayload extends Omit<FIN53010Payload, 'creator' | 'modifier'> {
  creator: string;
  Details: FIN53010Detail[];
}

export interface FIN53010UpdatePayload extends Omit<FIN53010Payload, 'creator' | 'modifier'> {
  id: number;
  creator: string;
  Details: FIN53010Detail[];
}

export interface FIN53010DeleteResult {
}

export interface VendorList {
  VEN_No: string;
  VEN_Name: string;
  VEN_ShortName: string;
  VEN_Uniform: string;
}

export interface AccNoList {
  AccNo: string;
  AccName: string;
}
