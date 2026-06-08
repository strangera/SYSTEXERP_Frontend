import { EditColumnExtend } from '@shared/componentkit/table-edit/table-edit.model';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { Option } from 'src/app/service/utility/dropdown-api.model';

export interface TLS21020Data extends Partial<EditColumnExtend> {
  ABAT_YN: 'Y' | 'N';
  AccDC: 'D' | 'C';
  AccNo: string;
  AccNo_Name: string;
  AccNotes: string;
  ENTRY_TYPE: string;
  ItemDesc: string;
  ObjectNo: string;
  Org_ID: string;
  PAY_No: string;
  PAY_days: number;
  RelatedPartyAccNo: string;
  RelatedPartyAccNo_Name: string;
  SEQNO: number;
  VEN_No: string;
  id: number;
  Voucher_Type: string;
}

export interface TLS21020GLS1005Data {
  ABAT_YN: 'Y' | 'N';
  AccCName: string;
  AccDC: 'D' | 'C';
  AccEName: string;
  AccNo: string;
  Budget_YN: 'Y' | 'N';
  ClassNo: string;
  CompNo: string;
  IFRS_AccNo: string;
  Input_YN: 'Y' | 'N';
  Ledger_MD: string;
  NoteDesc: string;
  Org_YN: 'Y' | 'N';
  ParentAccNo: string;
  ROC_AccNo: string;
  Voucher_Type: string;
}

export interface TLS21020Query extends BaseQueryRequest {
  ENTRY_TYPE: string;
  pageSize?: number;
  pageIndex?: number;
}

export interface TLS21020GLS1005Query extends BaseQueryRequest {
  AccDC: string;
}

export interface TLS21020UpdateQuery extends BaseQueryRequest {
  ABAT_YN: 'Y' | 'N';
  AccNo: string;
  AccNotes: string;
  ObjectNo: string;
  Org_ID: string;
  PAY_No: string;
  PAY_days: number;
  RelatedPartyAccNo: string;
  VEN_No: string;
  id: number;
}

export interface POS2013 extends Option {
  Name: string;
  No?: string;
  ShortName?: string;
  VEN_Address?: string;
  VEN_EngName?: string;
  VEN_No: string;
}

export enum EntryType {
  'SD銷售日傳票' = 'SD',
  'WD自營日結傳票' = 'WD',
  'MR租金傳票' = 'MR',
  'MD代扣傳票' = 'MD',
  'PR抽成傳票' = 'PR',
  'PN進貨帳款-暫估應付' = 'PN',
  'PNC進貨帳款-成本結轉' = 'PNC',
  'PT進貨請款' = 'PT',
  SD = 'SD銷售日傳票',
  WD = 'WD自營日結傳票',
  MR = 'MR租金傳票',
  MD = 'MD代扣傳票',
  PR = 'PR抽成傳票',
  PN = 'PN進貨帳款-暫估應付',
  PNC = 'PNC進貨帳款-成本結轉',
  PT = 'PT進貨請款',
}
