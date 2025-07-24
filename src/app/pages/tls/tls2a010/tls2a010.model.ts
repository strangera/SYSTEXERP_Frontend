export interface TLS2A010Data {
  TXN_Date: string;         // 日期，例如：'2024/05/08'
  ECR_No: string;           // 收銀機代號，例如：'000081'
  TXN_No: string;           // 交易序號
  TLT_NO: string;           // 專櫃編號
  tlt_name: string;         // 專櫃名稱
  TXN_GUINo: string;        // 發票號碼
  CRD_No: string;           // 付款卡號
  TXN_PayAmt: number;       // 付款金額
  check_status: number;     // 審核狀態 (1~4)
  check_Remark: string;     // 備註
}
