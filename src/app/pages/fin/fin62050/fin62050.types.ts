export type FIN62050RowType = 'INIT' | 'D' | 'A' | 'UD' | 'B' | 'C';

export interface FIN62050QueryRequest {
  StartDate: string;        // 'YYYY-MM-DD'
  EndDate: string;          // 'YYYY-MM-DD'
  ShowUnCheckYN: boolean;
  BankList: string[] | null;
}

export interface FIN62050ResponseItem {
  BNK_id: string;
  BNK_AccName: string;
  RowType: FIN62050RowType;
  VouDate: string | null;
  NoteDesc: string | null;
  CHK_No: string | null;
  VEN_No: string | null;
  VEN_NAME: string | null;
  CHK_Status: string | null;
  DebitAmt: number;
  CreditAmt: number;
  Balance: number | null;
}
