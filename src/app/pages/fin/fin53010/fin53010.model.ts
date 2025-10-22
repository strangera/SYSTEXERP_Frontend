import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

interface FIN53010Basic {
  /** 傳票號碼 yyyyMMddssss */
  VouNo: string;
  /** 補發票 (Y/N) */
  INV_YN: 'Y' | 'N';
  /** 傳票狀態 0:作廢 1:建立 2:確認(取消確認動作) 3:過帳 */
  PostFlag: '0' | '1' | '3';
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

export interface FIN53010Data extends Pick<FIN53010Basic, 'VouType' | 'VouNo'> {
  id: number;
  Remark: string;
  AccAmt: number;
  DetailCount: number;
}

export interface QueryFIN53010Detail extends FIN53010Basic, CRT, UPD {
  CompNo: string;
  Details: FIN53010Detail[];
  Remark: string;
  VouDate: string;
  id: number;
}

export type FIN53010DataDetail = Omit<BaseQueryResponse<QueryFIN53010Detail>, 'Data'> & { Data: QueryFIN53010Detail; };

/**
 * 代表 FIN53010 記錄的明細。
 *
 * @interface FIN53010Detail
 * @property {number} AccAmt - 借貸方 D/C 金額
 * @property {string} AccDC - 借貸方D/C
 * @property {string} AccName - 科目名稱
 * @property {string} AccNo - 科目代號 (GLS1005)
 * @property {string} DetailName - 廠商/員工名稱
 * @property {string} DetailNo - 廠商/員工編號
 * @property {string} NoteDesc - 摘要
 * @property {string} ORG_ID - 組織編號
 * @property {number} SerNo - 顯示用序號，10 為單位遞增
 * @property {string} SubDetailNo - 對象編號
 * @property {string} [clearingCode] - 清什麼code?
 * @property {number} id - 明細檔流水號
 * @property {number} index - 索引
 */
export interface FIN53010Detail {
  AccAmt: number;
  AccDC: string;
  AccName: string;
  AccNo: string;
  DetailName: string;
  DetailNo: string;
  NoteDesc: string;
  ORG_ID: string;
  SerNo: number;
  SubDetailNo: string;
  id: number;
  index: number;
}

/**
 * FIN53010 明細檔 (Table 顯示用)
 * AccName: 科目名稱
 * DetailName: 廠商/員工名稱
 * AccAmtD: 借方金額
 * AccAmtC: 貸方金額
 * displayIndex: 顯示用索引值
 * recKey: 對帳KEY值
 */
export interface FIN53010DetailTable extends FIN53010Detail {
  AccAmtD?: number;
  AccAmtC?: number;
  displayIndex?: number;

  recKey?: number;
  clearingCode?: string;
  ReflNo?: string;
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

export type FIN53010InsertResult = Omit<BaseQueryResponse<any>, 'Data'> & {
  Data: {
    DetailCount: number;
    gls3002_id: number;
  };
};

export type FIN53010UpdateResult = Omit<BaseQueryResponse<any>, 'Data'> & {
  Data: {
    [key: string]: any;
  };
};

export type FIN53010DeleteResult = Omit<BaseQueryResponse<any>, 'Data'> & {
  Data: {
    [key: string]: any;
  };
};
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
