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
 * index: table 排序 起始0
 * SerNo: 顯示用序號 10為單位序編
 * AccDC: 借貸方D/C
 * AccNo: 科目代號 (GLS1005)
 * AccAmt: 借貸方D/C 金額
 * ORG_ID: 部門代號
 * DetailNo: 細項編號
 * SubDetailNo: 次細項編號
 * ProjectNo: 專案代號
 * NoteDesc: 摘要
 * PTA: PTA編號
 */
export interface FIN53010Detail {
  index: number;
  SerNo: number;
  AccDC: string;
  AccNo: string;
  AccAmt: number;
  ORG_ID: string;
  DetailNo: string;
  SubDetailNo: string;
  ProjectNo: string;
  NoteDesc: string;
  PTA: string;
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

export interface FIN53010Insert {
  VouNo: string;
  /** 傳票類別 */
  VouType: string;
  VouDateEnd: Date;
  /** 登帳狀態 */
  PostFlag: string;
  /** 傳票種類 */
  VoucherType: string;
  /** 補發票 (Y/N) */
  INV_YN: string;
  Remark?: string;
  /** RPC/IFRS */
  VouAccType?: string;
  Details: FIN53010Detail[];
}

export interface FIN53010InsertPayload extends Omit<FIN53010Payload, 'CRT_USR_No'> {
  CRT_USR_No: string;
  Details: FIN53010Detail[];
}

export interface FIN53010UpdatePayload extends Omit<FIN53010Payload, 'UPD_USR_No'> {
  id: number;
  UPD_USR_No: string;
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
  AccCName: string;
}
