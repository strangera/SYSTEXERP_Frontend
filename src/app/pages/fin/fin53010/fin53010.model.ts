import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

interface FIN53010Basic {
  /** 傳票號碼 yyyyMMddssss */
  VouNo: string;
  /** 補發票 (Y/N) */
  INV_YN: 'Y' | 'N';
  /** 傳票狀態 0:作廢 1:建立 2:確認 3:過帳 */
  PostFlag: '0' | '1' | '2' | '3';
  /** ROC/IFRS 0:共用 1:ROC 2:IFRS 3:全部 */
  VouAccType: '0' | '1' | '2' | '3';
  /** 傳票類別 1:現金收入2:現金支出3:轉帳傳票 */
  VouType: '0' | '1' | '2';
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

export interface FIN53010Data extends Pick<FIN53010Basic, 'VouType' | 'VouNo'> {
  id: number;
  Remark: string;
  AccAmt: number;
  DetailCount: number;
}

interface QueryFIN53010Detail extends FIN53010Basic, CRT, UPD {
  CompNo: string;
  Details: FIN53010Detail[];
  Remark: string;
  VouDate: string;
  id: number;
}

export type FIN53010DataDetail = Omit<BaseQueryResponse<QueryFIN53010Detail>, 'Data'> & { Data: QueryFIN53010Detail; };

/**
 * FIN53010 明細檔
 * id: 明細檔流水號
 * SerNo: 顯示用序號 10為單位序編
 * AccDC: 借貸方D/C
 * AccNo: 科目代號 (GLS1005)
 * AccAmt: 借貸方D/C 金額
 * ORG_ID: 組織編號
 * DetailNo: 廠商/員工編號
 * SubDetailNo: 對象編號
 * NoteDesc: 摘要
 */
export interface FIN53010Detail {
  id: number;
  SerNo: number;
  AccDC: string;
  AccNo: string;
  AccAmt: number;
  ORG_ID: string;
  DetailNo: string;
  SubDetailNo: string;
  NoteDesc: string;
}

/**
 * FIN53010 明細檔 (Table 顯示用)
 * AccName: 科目名稱
 * DetailName: 廠商/員工名稱
 */
export interface FIN53010DetailTable extends FIN53010Detail {
  AccName?: string;
  DetailName?: string;
  AccAmtD?: number;
  AccAmtC?: number;
  displayIndex?: number;
}

export interface FIN53010Payload extends BaseQueryRequest, Partial<Pick<FIN53010Basic, 'VouType' | 'PostFlag' | 'VouAccType'>> {
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

export interface FIN53010Insert extends FIN53010Basic {
  VouDateEnd: Date;
  Remark?: string;
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
