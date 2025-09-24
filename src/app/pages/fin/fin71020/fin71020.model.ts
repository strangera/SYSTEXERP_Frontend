interface FIN71020Payload {
  [x: string]: any;
}

export interface FIN71020Data {
  Keep_UsrNo: string;
  Keep_QuotaAmt: number;
  Keep_Orgid: string;
  Keep_Remark: string;
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

export interface FIN71020Insert extends FIN71020Payload {

}

export interface FIN71020Update extends FIN71020Payload {

}
