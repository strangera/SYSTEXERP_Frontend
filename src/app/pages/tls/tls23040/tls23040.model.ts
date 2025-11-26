// ✅ 明細型別（依你回傳欄位）
export interface InvoiceDetail {
  ID: number;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  tlt_no: string;
  tlt_name: string;
  TXN_GUIBegNo: string;
  gui_track: string;
  GUIBegNo: string;
  GUIEndNo: string;
  TXN_TotGUI: number;
  TXN_TotSaleAmt: number;
  TXN_Status: string;
  TXN_StatusName: string;
  TXN_Mode: string;
  TXN_ModeName: string;
  TXN_TaxFreeCertNo: string | null;
  USR_No: string;
  TXN_PkngUID: string | null;
  ORG_TXN_Date: string | null;
  ORG_ECR_No: string | null;
  ORG_TXN_No: number | null;
  TXN_MemCard: string;
  TXN_TotPayScoreAmt: number | null;
}

export interface PaymentDetail {
  ID: number;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  tlt_no: string;
  tlt_name: string;
  PAY_NO: string;
  PAY_NAME: string;
  TXN_PayAmt: number;
  CRD_Type: string | null;
  CRD_Name: string;
  CRD_No: string;
  TERM_No: string | null;
}

export interface DiscountDetail {
  ID: number;
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

// ✅ 後端 Data 每一個元素（包含三個清單）
export interface TLS23040Grouped {
  InvoiceDetail: InvoiceDetail[];
  PaymentDetail: PaymentDetail[];
  DiscountDetail: DiscountDetail[];
}
