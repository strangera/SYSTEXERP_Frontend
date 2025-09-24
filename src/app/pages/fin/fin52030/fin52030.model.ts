export interface FIN52030Data {
  id: number;
  TempNo: string;
  VouType: string;
  TempName: string;
  DetailCount: number;
}

export interface FIN52030Detail {
  index: number;
  id: number;
  SerNo: number;
  AccNo: string;
  DetailNo: string;
  NoteDesc: string;
  AccDC: string;
  AccAmt: number;
  ORG_ID: string;
  SubDetailNo: string;
}

export interface FIN52030Payload {
  TempNo: string;
  VouType: string;
  TempName: string;
  CRT_USR_No: string;
  UPD_USR_No: string;
}

export interface FIN52030InsertPayload {
  TempNo: string;
  VouType: string;
  TempName: string;
  Details: Omit<FIN52030Detail, 'id'>[];
}

export interface FIN52030UpdatePayload {
  id: number;
  TempNo: string;
  VouType: string;
  TempName: string;
  Details: FIN52030Detail[];
}

export interface FIN52030DeleteResult {
}
