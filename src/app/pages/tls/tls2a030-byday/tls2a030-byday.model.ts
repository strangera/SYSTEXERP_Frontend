export interface DayPayToolRow {
  PAY_NO: string;
  PAY_NAME: string;
  OVER_PayAmt: number;
  PreAudit_OVER_PayAmt: number;
  Actual_ReceivedAmt: number;
  BOOK_PayAmt: number;
  Compare_CD: string;
  Compare_AB: string;
}

export interface DaySubTotal {
  OVER_SubTotal_PayAmt: number;
  PreAudit_OVER_SubTotal_PayAmt: number;
  Actual_ReceivedAmt_SubTotal: number;
  BOOK_SubTotal_PayAmt: number;
  Compare_CD_SubTotal: string;
  Compare_AB_SubTotal: string;
}

export interface DayGroup {
  TXN_Date: string;
  mainData: DayPayToolRow[];
  subtotalData: DaySubTotal | null;
}

export interface DayTotal {
  OVER_Total_PayAmt: number;
  PreAudit_OVER_Total_PayAmt: number;
  Actual_ReceivedAmt_Total: number;
  BOOK_Total_PayAmt: number;
  Compare_CD_Total: string;
  Compare_AB_Total: string;
}

export interface TLS2A030ByDayState {
  SaleDateStart: string;
  SaleDateEnd: string;
  ECR_No_Start: string;
  ECR_No_End: string;
}
