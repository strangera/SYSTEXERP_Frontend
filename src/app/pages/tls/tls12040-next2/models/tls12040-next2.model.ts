/**
 * 查詢專櫃抽成設定請求
 */
export interface TLS12040ChargeRequest {
  /** 合約編號系統 ID */
  apply_no: string;
}

/**
 * 專櫃抽成設定查詢結果
 */
export interface TltapplyChargeResult {
  /** 合約編號系統 ID */
  apply_no: string;
  /** 抽成主檔設定列表 */
  ChargeSettings: TltapplyChargeMainResponse[];
  /** 總筆數 */
  TotalRecords: number;
}

/**
 * 抽成主檔回應
 */
export interface TltapplyChargeMainResponse {
  id: number;
  talent_id: number;
  tlt_id: string;
  tlt_id_desc: string;
  cag_bdate: string; // ISO 日期字串
  cag_edate: string; // ISO 日期字串
  cag_taxtype: string;
  sst_amount?: number | null;
  sst_rate?: number | null;
  cap_saletype1: string;
  cap_saletype2: string;
  cag_remark: string;

  /** 折扣設定明細 (第一個分頁) */
  ChargeDetails: TltapplyChargeDetailResponse[];
  /** 年度業績抽成明細 (第二個分頁) */
  YearChargeDetails: TltapplyYearChargeResponse[];
  /** 折扣別層級抽成明細 (第三個分頁) */
  LevelChargeDetails: TltapplyLevelChargeResponse[];
}

/**
 * 折扣設定明細回應 (第一個分頁)
 */
export interface TltapplyChargeDetailResponse {
  id?: number | null;
  talent_id: number;
  tlt_id: string;
  cag_barcode: string;
  tlt_bdate?: string | null; // ISO 日期字串
  tlt_edate?: string | null; // ISO 日期字串
  cag_charge_rate?: number | null;
  /** 折數描述 (從 SYS1000.T101 取得) */
  barcode_desc: string;
  is_configured: boolean;
  is_enabled: boolean;
}

/**
 * 年度業績抽成明細回應 (第二個分頁)
 */
export interface TltapplyYearChargeResponse {
  id: number;
  talent_id: number;
  tlt_id: string;
  tlt_bdate: string; // ISO 日期字串
  tlt_edate: string; // ISO 日期字串
  year_amount: number;
  extra_rate: number;
}

/**
 * 折扣別層級抽成明細回應 (第三個分頁)
 */
export interface TltapplyLevelChargeResponse {
  id?: number | null;
  talent_id: number;
  tlt_id: string;
  seq_no: number;
  cag_barcode: string;
  level_bmount?: number | null;
  level_eamount?: number | null;
  level_charge_rate?: number | null;
  /** 折數描述 (從 SYS1000.T101 取得) */
  barcode_desc: string;
  is_configured?: boolean | null;
  is_enabled?: boolean | null;
}

// ============= 標準 API 回應格式 =============

/**
 * TLS12040 API 標準回應格式
 */
export interface TLS12040ChargeAPIResponse {
  Status: string;
  Data: TltapplyChargeResult;
  Error?: any;
  Meta: {
    Timestamp: string;
    RequestId: string;
  };
  Message: string;
  TotalCount: number;
  TotalPage: number;
}

// ============= 前端狀態管理相關介面 =============

/**
 * 抽成設定資料容器 (用於前端狀態管理)
 */
export interface TLS12040ChargeDataContainer {
  /** 原始抽成資料 */
  originalChargeData: TltapplyChargeMainResponse[];
  /** 當前抽成資料 */
  chargeData: TltapplyChargeMainResponse[];
  /** 顯示模式 */
  displayMode: 'summary' | 'detail';
  /** 選中的抽成設定ID */
  selectedChargeId?: number | null;
  /** 當前激活的分頁 */
  activeTab: 'charge-detail' | 'year-charge' | 'level-charge';
}

/**
 * 抽成統計資訊
 */
export interface TLS12040ChargeStatistics {
  /** 總抽成設定數 */
  totalChargeSettings: number;
  /** 啟用的抽成設定數 */
  enabledChargeSettings: number;
  /** 折扣設定明細數 */
  totalChargeDetails: number;
  /** 年度業績抽成明細數 */
  totalYearCharges: number;
  /** 層級抽成明細數 */
  totalLevelCharges: number;

  /** 按稅別類型統計 */
  byTaxType: {
    [taxType: string]: {
      count: number;
      totalAmount?: number;
    };
  };

  /** 按銷售類型統計 */
  bySaleType: {
    [saleType: string]: {
      count: number;
    };
  };
}

// ============= 表單相關介面 =============

/**
 * 抽成主檔表單資料
 */
export interface TLS12040ChargeMainFormData {
  id?: number;
  talent_id: number;
  tlt_id: string;
  tlt_id_desc: string;
  cag_bdate: string;
  cag_edate: string;
  cag_taxtype: string;
  sst_amount?: number | null;
  sst_rate?: number | null;
  cap_saletype1: string;
  cap_saletype2: string;
  cag_remark: string;
}

/**
 * 折扣設定明細表單資料
 */
export interface TLS12040ChargeDetailFormData {
  id?: number | null;
  talent_id: number;
  tlt_id: string;
  cag_barcode: string;
  tlt_bdate?: string | null;
  tlt_edate?: string | null;
  cag_charge_rate?: number | null;
  barcode_desc: string;
  is_configured: boolean;
  is_enabled: boolean;
}

/**
 * 年度業績抽成表單資料
 */
export interface TLS12040YearChargeFormData {
  id?: number;
  talent_id: number;
  tlt_id: string;
  tlt_bdate: string;
  tlt_edate: string;
  year_amount: number;
  extra_rate: number;
}

/**
 * 層級抽成表單資料
 */
export interface TLS12040LevelChargeFormData {
  id?: number | null;
  talent_id: number;
  tlt_id: string;
  seq_no: number;
  cag_barcode: string;
  level_bmount?: number | null;
  level_eamount?: number | null;
  level_charge_rate?: number | null;
  barcode_desc: string;
  is_configured?: boolean | null;
  is_enabled?: boolean | null;
}

// ============= 資料操作相關介面 =============

/**
 * 抽成設定操作類型
 */
export type ChargeOperationType = 'create' | 'update' | 'delete' | 'view';

/**
 * 抽成設定操作請求
 */
export interface TLS12040ChargeOperationRequest {
  operation: ChargeOperationType;
  apply_no: string;
  chargeData?: TLS12040ChargeMainFormData;
  detailData?: TLS12040ChargeDetailFormData[];
  yearData?: TLS12040YearChargeFormData[];
  levelData?: TLS12040LevelChargeFormData[];
}

/**
 * 抽成設定驗證結果
 */
export interface TLS12040ChargeValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
    type: 'required' | 'format' | 'range' | 'duplicate' | 'business';
  }[];
  warnings?: {
    field: string;
    message: string;
  }[];
}

// ============= 查詢和篩選相關介面 =============

/**
 * 抽成設定查詢條件
 */
export interface TLS12040ChargeQueryParams {
  apply_no: string;
  talent_id?: number;
  tlt_id?: string;
  cag_taxtype?: string;
  cap_saletype1?: string;
  cap_saletype2?: string;
  date_from?: string;
  date_to?: string;
  is_enabled?: boolean;
}

/**
 * 抽成設定篩選條件
 */
export interface TLS12040ChargeFilterParams {
  taxTypes?: string[];
  saleTypes?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  enabledOnly?: boolean;
  hasDetails?: boolean;
  hasYearCharge?: boolean;
  hasLevelCharge?: boolean;
}

// ============= UI 狀態相關介面 =============

/**
 * 抽成設定頁面狀態
 */
export interface TLS12040ChargePageState {
  loading: boolean;
  saving: boolean;
  error?: string | null;
  success?: string | null;

  /** 資料狀態 */
  dataLoaded: boolean;
  lastUpdateTime?: string;

  /** UI 狀態 */
  selectedRows: number[];
  expandedRows: number[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';

  /** 模態框狀態 */
  showEditModal: boolean;
  showDeleteConfirm: boolean;
  showDetailModal: boolean;

  /** 分頁狀態 */
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

// ============= 匯出用型別 =============

/**
 * 所有抽成相關型別的聯合型別
 */
export type TLS12040ChargeTypes =
  | TLS12040ChargeRequest
  | TltapplyChargeResult
  | TltapplyChargeMainResponse
  | TltapplyChargeDetailResponse
  | TltapplyYearChargeResponse
  | TltapplyLevelChargeResponse;

/**
 * 所有表單資料型別的聯合型別
 */
export type TLS12040ChargeFormTypes =
  | TLS12040ChargeMainFormData
  | TLS12040ChargeDetailFormData
  | TLS12040YearChargeFormData
  | TLS12040LevelChargeFormData;
