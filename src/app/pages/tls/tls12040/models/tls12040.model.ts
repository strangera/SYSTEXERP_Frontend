// models/tls12040.model.ts
/**
 * TLS12040 查詢請求介面
 */
export interface TLS12040QueryRequest {
  /** 專櫃招募編號 (YYYYMMDD+3碼流水號) */
  apply_no?: string;

  /** 大分類代號 */
  bus_type?: number[];

  /** 專櫃編號 */
  tlt_no?: string;

  /** 櫃位名稱 */
  tlt_name?: string;

  /** 廠商統一編號 */
  ven_uniform?: number[];

  /** 位置編號 */
  location_no?: number[];

  /** 版本編號範圍 */
  contract_subno_from?: string;  // 改為 string 類型
  contract_subno_to?: string;    // 改為 string 類型

  /** 營運狀況 */
  tlt_openflagList?: string[];   // 改為陣列

  /** 合約狀態 */
  approve_status?: string[];

  /** 區域 */
  area_no?: number[];

  /** 樓層 */
  tlt_floor?: number[];

  /** 洽談者 */
  contact_USR_No?: string[];

  /** 組織代碼 */
  org_id?: string;

  /** 營運狀況 */
  operatingStatus?: string;

  /** 抽成計算方式 */
  comm_comp_type?: string[];

  /** 回函日期範圍 */
  feedback_date_from?: Date;
  feedback_date_to?: Date;

  /** 回函截止日範圍 */
  due_date_from?: Date;
  due_date_to?: Date;

  /** 洽談日期範圍 */
  contact_Date_from?: Date;
  contact_Date_to?: Date;

  /** 營業型態 */
  paper_typeList?: string[];

  /** 契約起始日範圍 */
  tlt_bdate_start_from?: Date;
  tlt_bdate_start_to?: Date;

  /** 契約截止日範圍 */
  tlt_edate_start_from?: Date;
  tlt_edate_start_to?: Date;

  /** 營運起始日範圍 */
  tlt_contract_bdate_from?: Date;
  tlt_contract_bdate_to?: Date;

  /** 營運截止日範圍 */
  tlt_contract_edate_from?: Date;
  tlt_contract_edate_to?: Date;

  /** 櫃別 */
  tlt_kindList?: string[];

  /** 裝潢方式 */
  deco_typeList?: string[];

  /** 抽成別 */
  tlt_term_typeList?: string[];

  /** 結帳方式 */
  money_typeList?: string[];

  /** 付款方式 */
  paytypeList?: string[];

  /** 配合方式 */
  store_wayList?: string[];

  /** 是否開立業主發票 */
  rece_yn?: string;  // 改為 string 類型 ("Y" 或不傳)

  /** 是否使用業主收銀機 */
  pos_yn?: string;   // 改為 string 類型

  /** 是否為業主收現 */
  cash_yn?: string;  // 改為 string 類型
}

/**
 * TLS12040 查詢回應介面
 */
export interface TLS12040QueryResponse {
  Status: string;
  Message?: string;
  Data: ContractItem[];
  TotalCount?: number;
}

/**
 * 專櫃要約書項目
 */
export interface ContractItem {
  id: number;
  mid: number;

  /** 專櫃招募編號 */
  apply_no: string;

  /** 專櫃編號 */
  tlt_no: string;

  /** 專櫃名稱 */
  tlt_name: string;

  /** 合約狀態 */
  apply_type: string;

  /** 營業狀態: 0=已撤櫃, 1=營運中, 9=核准時合約尚未開始 */
  tlt_openflag: string;

  approve_status: string;

  tlt_contract_bdate: string;

  /** 是否可編輯 */
  CanEdit: boolean;
  CanVoid: boolean;
}
