
export interface TLS2A060Query {
  TXN_Date: string;           // 銷售日期 (必填)
  Floor_No?: string;          // 樓層
  ECR_No_Start?: string;      // 收銀機號(起)
  ECR_No_End?: string;        // 收銀機號(迄)
  Building_No?: string;       // 館別
  TXN_GUIPaper?: string;      // 發票格式
}

export interface TLS2A060Data {
  TLT_No?: string;           // 專櫃編號
  tlt_name?: string;         // 專櫃名稱
  Talent_ID: number;         // 合約編號id
  INV_GUIType?: string;      // 發票格式
  TXN_GUINo?: string;        // 發票號碼
  TXN_Date: string;          // 交易日期
  ECR_No?: string;           // 收銀機號
  TXN_No: number;            // 交易序號
  void_TXN_Date?: string;    // 作廢日期
  void_ECR_No?: string;      // 作廢機台
  void_TXN_No?: number;      // 作廢交易序號
  TXN_SaleAmt?: number;      // 金額
  detailId?: number;         // 明細id（POS30011_void_invoice.id => 代表已審核）
  check_status?: string;     // 審核狀況
  check_remark?: string;     // 備註
}

export interface TLS2A060footerData {
  group_name: string;        // 總計
  TXN_SaleAmt: number;       // 金額
}
