export interface FIN71020Data {
  ID: number;
  Keep_UsrNo: string;
  Keep_UsrName: string;
  Keep_QuotaAmt: number;
  Keep_Orgid: string;
  Keep_OrgName: string;
  Keep_Remark: string;
  CanDelete?: boolean;
}

export interface FIN71020UsrNo {
  Keep_UsrNo: string;
  Keep_UsrName: string;
  Org_No: string;
  Org_Name: string;
}

export interface FIN71020OrgNo {
  Org_No: string;
  Org_Name: string;
}

export interface FIN71020Insert {
  Keep_UsrNo: string;
  Keep_QuotaAmt: number;
  Keep_Orgid: string;
  Keep_Remark?: string;
}

export interface FIN71020Update {
  ID: number;
  Keep_UsrNo: string;
  Keep_QuotaAmt: number;
  Keep_Orgid: string;
  Keep_Remark?: string;
}

export interface FIN71020Delete {
  IDs: number[];
}
