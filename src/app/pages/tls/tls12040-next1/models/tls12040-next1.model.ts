/**
 * TLS12040 扣款項目介面
 */
export interface TLS12040FareItem {
  id?: string;
  serialNumber?: number;
  mid?: number;
  apply_no?: string;
  talent_id?: number;

  // 扣款基本資訊
  cap_type: string;          // 扣款類型 A/B/C/D/E
  cap_item: string;          // 扣款項目代碼
  cap_name: string;          // 扣款項目名稱

  // 日期欄位
  tpy_bdate?: string | null | Date;     // 開始日期
  tpy_edate?: string | null | Date;     // 結束日期

  // 金額相關
  tpy_type?: string | null;      // 扣款方式
  tpy_qty?: number | null;       // 數量
  tpy_unitamt?: number | null;   // 單價
  tpy_amount?: number | null;    // 金額
  tpy_totalamt?: number | null;  // 總金額
  tpy_rate?: number | null;      // 比率

  // C類型專用欄位 (平均分攤)
  down_payment?: number | null;  // 頭期款
  period_nos?: number | null;    // 期數

  // 設定欄位
  day_account?: string | null;   // 入帳日
  interval?: number | null;      // 間隔
  gui_flag?: string | null;      // GUI旗標
  org_id?: string | null;        // 組織ID

  // 業務欄位
  cap_saletype?: string | null;  // 銷售類型
  edc_bank?: string | null;      // EDC銀行
  instms_type?: string | null;   // 分期類型
  pay_no?: string | null;        // 付款編號

  // D類型專用欄位 (比率分攤)
  calc_type?: string | null;         // 券類計算方式
  rent_plus_rate?: number | null;    // 加抽比率
  over_base_rate?: number | null;    // 超過基準比率

  // 分類標記
  is_commonly_used?: string;     // 是否常用 Y/N
  cap_tax_type?: string;         // 稅別類型
  acc_no?: string;               // 會計科目

  // 資料來源與狀態
  data_source: string;           // 資料來源 APS_AVAILABLE/CONTRACT_EXISTING
  is_selected: boolean;          // 是否選中
  is_new_item: boolean;          // 是否新項目

  // 內部狀態管理
  _status?: 'new' | 'modified' | 'deleted' | 'original';
  _originalSelected?: boolean;   // 原始選中狀態
  _originalData?: Partial<TLS12040FareItem>; // 原始資料備份

  // 動態屬性支持
  [key: string]: any;
}

/**
 * TLS12040 API 回應格式
 */
export interface TLS12040APIResponse {
  Status: string;
  Data: TLS12040APIData;
  Error?: any;
  Meta: {
    Timestamp: string;
    RequestId: string;
  };
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

/**
 * TLS12040 API 資料結構
 */
export interface TLS12040APIData {
  apply_no: string;
  ShowAll: boolean;
  FaresByType: TLS12040FaresByType;
}

/**
 * 按類型分組的扣款資料
 */
export interface TLS12040FaresByType {
  A: TLS12040FareItem[];  // 一次扣款
  B: TLS12040FareItem[];  // 每月扣款
  C: TLS12040FareItem[];  // 平均分攤
  D: TLS12040FareItem[];  // 比率分攤
  E: TLS12040FareItem[];  // 活動扣款
  Z?: TLS12040FareItem[]; // 其他類型
}

/**
 * TLS12040 查詢參數
 */
export interface TLS12040QueryParams {
  apply_no: string;
  showAll: boolean;
  capType?: string;
}

/**
 * TLS12040 扣款資料容器
 */
export interface TLS12040FareDataContainer {
  originalFareData: { [key: string]: TLS12040FareItem[] };
  fareData: { [key: string]: TLS12040FareItem[] };
  showMode: 'common' | 'all';
}

/**
 * TLS12040 扣款統計資訊
 */
export interface TLS12040FareStatistics {
  totalItems: number;
  selectedItems: number;
  commonItems: number;
  newItems: number;
  modifiedItems: number;
  deletedItems: number;
  byType: {
    [capType: string]: {
      total: number;
      selected: number;
      common: number;
    }
  };
}

export interface SimpleContractInfo {
  id: string | null;
  apply_no: string | null;
  tlt_no: string;
  tlt_name: string;
  ven_uniform: string;
  VEN_Name: string;
  contract_subno: string;
  tlt_term_type: string;
  tlt_bdate: string;
  tlt_edate: string;
  tlt_contract_bdate: string;
  tlt_contract_edate: string;
}

// 定義 CRU 資料型別
export interface CruData {
  apply_no: string;
  tlt_no: string;
  tlt_name: string;
  ven_uniform: string;
  VEN_Name: string;
  contract_subno: string;
  tlt_term_type: string;
  tlt_bdate: string;
  tlt_edate: string;
  tlt_contract_bdate: string;
  tlt_contract_edate: string;
  [key: string]: any; // 允許其他屬性
}

export interface Next1Data {
  applyNo: any;
  fareData: { [key: string]: TLS12040FareItem[] };
  originalFareData: { [key: string]: TLS12040FareItem[] };  // 🔥 完整的原始資料
  showModeByType?: { [key: string]: 'common' | 'all' };  // 🔥 新增：各群組的顯示模式
  selectedItems: any[];
  contractInfo: any;
  timestamp: any;
}
