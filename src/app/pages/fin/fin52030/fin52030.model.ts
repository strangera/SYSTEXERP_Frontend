import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Option } from '@service/utility/dropdown-api.model';
export interface FIN52030Data {
  id: number;
  TempNo: string;
  VouType: string;
  TempName: string;
  DetailCount: number;
  CRT_USR_Name: string;
  UPD_USR_Name: string;
}

/**
 * FIN52030 明細檔
 * AccAmt: 借貸方D/C 金額
 * AccCName: 科目名稱
 * AccDC: 借貸方D/C
 * AccNo: 科目代號 (GLS1005)
 * DetailNo: 廠商/員工編號(廠商讀取 pos2013.ven_no, 員工讀取 tblUser.user_no
 * DetailNoName: 廠商/員工名稱
 * NoteDesc: 摘要
 * ORG_ID: 組織代號
 * SerNo: 序號 (以10為單位序編)
 * SubDetailNo: 對象編號
 * id: 明細檔 ID
 * index: 序號 (以10為單位序編) 起始0
 */
export interface FIN52030Detail {
  AccAmt: number;
  AccCName?: string;
  AccDC: string;
  AccNo: string;
  ACCT_KEY?: string | null;
  DetailNo?: string;
  DetailNoName?: string;
  NoteDesc?: string;
  ORG_ID?: string;
  SerNo: number;
  SubDetailNo?: string;
  id?: number;
  index?: number;
}

/**
 * FIN52030 明細檔 (API 回傳用)
 * Details: 明細資料陣列
 * CRT_Date: 建立日期
 * CRT_USR_No: 建立人員編號
 * CRT_USR_Name: 建立人員姓名
 * TempNo: 常用傳票編號
 * TempName: 常用傳票名稱
 * UPD_Date: 更新日期
 * UPD_USR_No: 更新人員編號
 * UPD_USR_Name: 更新人員姓名
 * VouType: 傳票類別 1:現金收入2:現金支出3:轉帳傳票
 * VouTypeName: 傳票類別名稱
 * id: 主檔 ID
 */
export interface FIN52030DetailData {
  CRT_Date: Date;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  Details: FIN52030Detail[];
  TempNo: string;
  TempName: string;
  UPD_Date: Date;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  VouType: '1' | '2' | '3';
  VouTypeName?: string;
  /** TODO: 待確認後端 GetFIN52030Detail 是否回傳「傳票型態」(SYS1000.VoucherType) code，若有請使用此欄位。 */
  VoucherType?: string;
  id: number;
};

export type FIN52030DetailDataResponse = Omit<ApiResponse<FIN52030DetailData[]>, 'Data'> & { Data: FIN52030DetailData; };

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
  recKey?: string | null;
  AccAmtD?: number;
  AccAmtC?: number;
}

export interface FIN52030Payload extends ApiRequest {
  TempNo?: string;
  VouType?: '1' | '2' | '3';
  TempName?: string;
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
  AccNoNoteDesc: Record<string, string[]>;
}

export type NoteDescResponse = Omit<ApiResponse<NoteDescList[]>, 'Data'> & {
  Data: NoteDescList;
};

export interface AccDescOption extends Option {
  data?: Option[];
}
