import { Option } from '@service/utility/dropdown-api.model';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';

export interface FIN52030Data {
  id: number;
  TempNo: string;
  VouType: string;
  TempName: string;
  DetailCount: number;
}

/**
 * FIN52030 明細檔
 * AccAmt: 借貸方D/C 金額
 * AccDC: 借貸方D/C
 * AccNo: 科目代號 (GLS1005)
 * DetailNo: 廠商/員工編號(廠商讀取 pos2013.ven_no, 員工讀取 tblUser.user_no
 * NoteDesc: 摘要
 * ORG_ID: 組織代號
 * SerNo: 序號 (以10為單位序編)
 * SubDetailNo: 對象編號
 * index: 序號 (以10為單位序編) 起始0
 */
export interface FIN52030Detail {
  AccAmt: number;
  AccDC: string;
  AccNo: string;
  DetailNo?: string;
  NoteDesc?: string;
  ORG_ID?: string;
  SerNo: number;
  SubDetailNo?: string;
  index: number;
}

export interface FIN52030DetailData {
  CRT_Date: Date;
  CRT_USR_No: string;
  Details: FIN52030Detail[];
  TempName: string;
  TempNo: string;
  UPD_Date: Date;
  UPD_USR_No: string;
  VouType: '1' | '2' | '3';
  id: number;
};

export type FIN52030DetailDataResponse = Omit<BaseQueryResponse<FIN52030DetailData>, 'Data'> & { Data: FIN52030DetailData; };

/**
 * FIN52030 明細檔 (Table 顯示用)
 * AccName: 科目名稱
 * DetailName: 廠商/員工名稱
 * recKey: 對帳KEY值
 * AccAmtD: 借方金額
 * AccAmtC: 貸方金額
 */
export interface FIN52030DetailTable extends FIN52030Detail {
  AccName?: string;
  DetailName?: string;
  recKey?: number;
  AccAmtD?: number;
  AccAmtC?: number;
}

export interface FIN52030Payload extends BaseQueryRequest {
  TempNo: string;
  VouType: string;
  TempName: string;
  CRT_USR_No?: string;
  UPD_USR_No?: string;
}

export interface FIN52030InsertPayload extends Omit<FIN52030Payload, 'CRT_USR_No' | 'UPD_USR_No'> {
  CRT_USR_No: string;
  Details: FIN52030Detail[];
}

export interface FIN52030UpdatePayload extends Omit<FIN52030Payload, 'CRT_USR_No' | 'UPD_USR_No'> {
  id: number;
  UPD_USR_No: string;
  Details: FIN52030Detail[];
}

export interface FIN52030DeleteResult {
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

export interface NoteDescList {
  AccNoNoteDesc: { [key: string]: string[]; };
}

export type NoteDescResponse = Omit<BaseQueryResponse<NoteDescList>, 'Data'> & {
  Data: NoteDescList;
};

export interface AccDescOption extends Option {
  data?: Option[];
}
