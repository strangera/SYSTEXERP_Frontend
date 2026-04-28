import { BaseQueryRequest } from '@shared/models/api/base-api.interface';

/** API 列（明細／小計／總計）；小計與總計列多數欄位可為 null */
export interface FIN73040Data {
  dataKey?: string;

  SeqNo: number | null;
  Keep_OrgID: string | null;
  Org_Name: string | null;
  Keep_UsrNo: string | null;
  Keep_UsrName: string | null;
  PCS_Date: string | null;
  PCS_RqstNo: string | null;
  PCS_RqstDate: string | null;
  PCS_PayDate: string | null;
  PayAmt: number | null;
  UnpaidAmt: number | null;
  RowTypeDesc?: string | null;
  RowType?: number | null;
}

export interface FIN73040Query extends BaseQueryRequest {
  SYS_StoreNo?: string;
  PCS_RqstNo?: string;
  Keep_UsrNo?: string;
  Keep_OrgID?: string;
  PCS_Date_S?: string;
  PCS_Date_E?: string;
  PCS_RqstDate_S?: string;
  PCS_RqstDate_E?: string;
  PCS_PayDate_S?: string;
  PCS_PayDate_E?: string;
  PageIndex?: number;
  PageSize?: number;
  SortBy?: Array<{ field: string; order: number }>;
}

export interface FIN73040Option {
  label: string;
  value: string;
}

export interface FIN73040DropdownFilter {
  userNo?: string;
  userName?: string;
  orgNo?: string;
  orgName?: string;
}