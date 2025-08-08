export interface ITxnData {
  TXN_No: string;
  TXN_GUIBegNo: string;
  TXN_GUIEndNo: string;
  TXN_TotSaleAmt: number;
  sad_preorder_Amt: number;
  sad_settle_Amt: number;
  TXN_TotSaleAmt_Sum: number;
  TXN_TotExtraAmt: number;
  TXN_TotHaveTax: number;
  TXN_ChangeHaveTax: number;
  TXN_TotOver: number;
  TXN_TotGUI: number;
  GUI_NET: number;
  TXN_TotTax: number;
  TXN_TotGUISaleNoTax: number;
  TXN_TotOver_Sum: number;
  GUI_REFUND: number;
  TXN_TotPayAmt: number;
}
