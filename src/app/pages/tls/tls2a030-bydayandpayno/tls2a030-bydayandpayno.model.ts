export interface ECRPayRow {
  ECR_No: string;
  OVER_PayAmt: number;
  PreAudit_OVER_PayAmt: number;
  Actual_ReceivedAmt: number;
  BOOK_PayAmt: number;
  Compare_CD: string;
  Compare_AB: string;
}

export interface TLS2A030ByDayAndPayNoState {
  TXN_Date: string;
  PAY_NO: string;
  PAY_NAME?: string;
  ECR_No_Start: string;
  ECR_No_End: string;
  SaleDateStart: string;
  SaleDateEnd: string;
}
