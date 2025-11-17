import { EditColumnExtend } from '@shared/componentkit/table-edit/table-edit.model';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { Option } from 'src/app/service/utility/dropdown-api.model';

export interface TLS21020Data extends Partial<EditColumnExtend> {
  ABAT_YN: string;
  AccDC: string;
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
}

export interface TLS21020GLS1005Data {
  ABAT_YN: string;
  AccCName: string;
  AccDC: string;
  AccEName: string;
  AccNo: string;
  Budget_YN: string;
  ClassNo: string;
  CompNo: string;
  IFRS_AccNo: string;
  Input_YN: string;
  Ledger_MD: string;
  NoteDesc: string;
  Org_YN: string;
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
  ABAT_YN: string;
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

export interface GLS1005 {
  ABAT_YN: 'Y' | 'N';
  AccCName: string;
  AccDC: string;
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

export interface POS2013 extends Option {
  Name?: string;
  No?: string;
  ShortName?: string;
  VEN_Address?: string;
  VEN_EngName?: string;
  VEN_No?: string;
}
