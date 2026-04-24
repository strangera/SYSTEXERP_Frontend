export interface FIN73020Data {
  dataKey?: string;

  SeqNo?: number | null;
  PCS_No?: string | null;
  PCS_Date?: string | null;
  PCS_UsrNo?: string | null;
  PCS_UsrName?: string | null;
  PCS_OrgID?: string | null;
  PCS_OrgName?: string | null;
  Keep_UsrNo?: string | null;
  Keep_UsrName?: string | null;
  Keep_OrgID?: string | null;
  Keep_OrgName?: string | null;
  PCS_Status?: string | null;
  PCS_StatusName?: string | null;
  PCS_RqstNo?: string | null;
  PCS_SeqNo?: number | null;
  AccNo?: string | null;
  AccName?: string | null;
  NOTeDesc?: string | null;
  PCS_DtlType?: string | null;
  PCS_DtlTypeName?: string | null;
  PCS_GUINo?: string | null;
  ORG_ID?: string | null;
  Dtl_OrgName?: string | null;
  PUR_Date?: string | null;
  PCS_Net?: number | null;
  PCS_Tax?: number | null;
  PCS_Amt?: number | null;
  RowTypeDesc?: string | null;
  RowType?: number | null;
}

export interface FIN73020Query {
  MID?: number | null;
  SYS_StoreNo?: string | null;
  PCS_RqstNo?: string | null;
  RqstDate_S?: string | null;
  RqstDate_E?: string | null;
  PCS_UsrNo?: string | null;
  Keep_UsrNo?: string | null;
  PCS_Status?: string | null;
  Keep_OrgID?: string | null;

  pageIndex: number;
  pageSize: number;
  SortBy?: any[];
}

export interface FIN73020ExportRequest {
  MID?: number | null;
  SYS_StoreNo?: string | null;
  PCS_RqstNo?: string | null;
  RqstDate_S?: string | null;
  RqstDate_E?: string | null;
  PCS_UsrNo?: string | null;
  Keep_UsrNo?: string | null;
  PCS_Status?: string | null;
  Keep_OrgID?: string | null;
}

export interface FIN73020Option {
  label: string;
  value: string;
}