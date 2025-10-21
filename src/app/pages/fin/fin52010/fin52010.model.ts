import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

export interface FIN52010Data {
  CompNo: string;
  AccNo: string;
  AccCName: string;
  AccEName?: string;
  ClassNo: string;
  AccDC: 'D' | 'C';
  Ledger_MD: '0' | '1';
  ParentAccNo: string;
  Input_YN: 'N' | 'Y';
  ABAT_YN?: 'N' | 'Y';
  NoteDesc?: string;
  Voucher_Type: string;
  Budget_YN: 'N' | 'Y';
  Org_YN: 'N' | 'Y';
  ROC_AccNo?: string;
  IFRS_AccNo?: string;
  CRT_Date?: Date;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: Date;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
}

export interface FIN52010Detail {

}

export interface FIN52010Payload extends BaseQueryRequest {
  AccYear: string;
  OpenDate: Date;
  CloseDate: Date;
  DefaultVouDate: string;
  ORG_ID: string;
  AccNoTotPL: string;
  AccNoCurPL: string;
  CashAccNo: string;
  AccNoAR: string;
  AccNoAP: string;
  AccNoInTax: string;
  AccNoOutTax: string;
  AccNoPost: string;
  AccNoRemitFee: string;
  advanceExpenseAccNo: string;
  billTransferCon: 'N' | 'Y';
}
