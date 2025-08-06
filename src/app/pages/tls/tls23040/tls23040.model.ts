export interface TLS23040ResponseItem {
  TXN_No: number;
  TXN_Date: string;
  ECR_No: string;
  tlt_no: string;
  tlt_name: string;
  gui_track: string;
  GUIBegNo: string;
  GUIEndNo: string;
  TXN_TotGUI: number;
  TXN_TotSaleAmt: number;
  TXN_Status: string;
  TXN_Mode: string;
  TXN_TaxFreeCertNo: string;
  USR_No: string;
  TXN_PkngUID: string;
  ORG_TXN_Date: string;
  ORG_ECR_No: string;
  ORG_TXN_No: number;
  TXN_MemCard: string;
  TXN_TotPayScoreAmt: number;
  PaymentDetail?: PaymentDetail[];
  DiscountDetail?: DiscountDetail[];
}

export interface PaymentDetail {
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  tlt_no: string;
  tlt_name: string;
  PAY_NO: string;
  PAY_NAME: string;
  TXN_PayAmt: number;
  CRD_Type: string;
  CRD_Name: string;
  CRD_No: string;
  TERM_No: number;
}

export interface DiscountDetail {
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  tlt_no: string;
  tlt_name: string;
  TXN_GUINo: string;
  PLU_SalePrc: number;
  TXN_Net: number;
  TXN_Tax: number;
  tlt_id: string;
  tlt_id_desc: string;
  TXN_DiscCode: string;
  TXN_DiscName: string;
  PLU_TaxType: string;
  PLU_TaxTypeName: string;
  PLU_MagNo: string;
  TXN_Status: string;
  TXN_StatusName: string;
}
