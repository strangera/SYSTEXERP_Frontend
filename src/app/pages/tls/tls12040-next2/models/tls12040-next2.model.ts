/**
 * TLS12040 Next2 - 專櫃抽成設定模型
 * 採用分層架構：API 層 -> 業務邏輯層 -> UI 狀態層
 */

// ============= 1. 基礎類型定義 =============

/**
 * 資料狀態追蹤
 */
export type DataStatus = 'original' | 'new' | 'modified' | 'deleted';

/**
 * 操作類型
 */
export type OperationType = 'INSERT' | 'UPDATE' | 'DELETE';

// ============= 2. API 請求/回應介面（純淨版本） =============

/**
 * 查詢抽成設定 API 請求
 */
export interface TLS12040ChargeQueryRequest {
  apply_no: string;
}

/**
 * 查詢抽成設定 API 回應
 */
export interface TLS12040ChargeQueryResponse {
  Status: string;
  Message: string;
  Data: {
    apply_no: string;
    ChargeSettings: ChargeSettingAPIModel[];
    TotalRecords: number;
  };
  Error?: any;
  Meta: {
    Timestamp: string;
    RequestId: string;
  };
  TotalCount: number;
  TotalPage: number;
}

/**
 * API 回傳的抽成設定模型（不含 UI 狀態）
 */
export interface ChargeSettingAPIModel {
  id: string;
  apply_no: string | null;
  tlt_id: string;
  tlt_id_desc: string;
  cag_bdate: string; // YYYY-MM-DD
  cag_edate: string; // YYYY-MM-DD
  cag_taxtype: string; // '0' | '1'
  sst_amount?: number | null;
  sst_rate?: number | null;
  cap_saletype1: string; // 'Y' | 'N'
  cap_saletype2: string; // 'Y' | 'N'
  cap_saletype5: string; // 'Y' | 'N'
  cag_remark: string;

  // 子資料
  ChargeDetails: ChargeDetailAPIModel[];
  YearChargeDetails: YearChargeDetailAPIModel[];
  LevelChargeDetails: LevelChargeDetailAPIModel[];
}

/**
 * API 回傳的折扣設定明細模型
 */
export interface ChargeDetailAPIModel {
  id?: number | null;
  apply_no: string;
  tlt_id: string;
  cag_barcode: string;
  tlt_bdate?: string | null | Date; // YYYY-MM-DD
  tlt_edate?: string | null | Date; // YYYY-MM-DD
  cag_charge_rate?: number | null;
  barcode_desc: string;
  is_configured: boolean;
  is_enabled: boolean;
}

/**
 * API 回傳的年度業績抽成明細模型
 */
export interface YearChargeDetailAPIModel {
  id: number;
  apply_no: string;
  tlt_id: string;
  tlt_bdate: string; // YYYY-MM-DD
  tlt_edate: string; // YYYY-MM-DD
  year_amount: number;
  extra_rate: number;
}

/**
 * API 回傳的層級抽成明細模型
 */
export interface LevelChargeDetailAPIModel {
  id?: number | null;
  charged_id?: number | null;
  apply_no: string;
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

// ============= 3. 業務邏輯層介面（含狀態追蹤） =============

/**
 * 業務邏輯層的抽成設定模型（含狀態）
 */
export interface ChargeSettingBusinessModel extends ChargeSettingAPIModel {
  // 狀態追蹤
  _status: DataStatus;
  _isExpanded?: boolean;
  _validationErrors?: ValidationError[];

  // 子資料（覆寫為業務模型）
  ChargeDetails: ChargeDetailBusinessModel[];
  YearChargeDetails: YearChargeDetailBusinessModel[];
  LevelChargeDetails: LevelChargeDetailBusinessModel[];

  // 新增：統一的明細資料屬性（用於表格顯示）
  detailItems?: any[];  // 動態設定，根據當前標籤顯示對應的資料
}

/**
 * 業務邏輯層的折扣設定明細模型（含狀態）
 */
export interface ChargeDetailBusinessModel extends ChargeDetailAPIModel {
  _status: DataStatus;
  is_selected?: boolean;
  _validationErrors?: ValidationError[];
}

/**
 * 業務邏輯層的年度業績抽成明細模型（含狀態）
 */
export interface YearChargeDetailBusinessModel extends YearChargeDetailAPIModel {
  _status: DataStatus;
  is_selected?: boolean;
  _validationErrors?: ValidationError[];
}

/**
 * 業務邏輯層的層級抽成明細模型（含狀態）
 */
export interface LevelChargeDetailBusinessModel extends LevelChargeDetailAPIModel {
  _status: DataStatus;
  is_selected?: boolean;
  _validationErrors?: ValidationError[];
}

// ============= 4. 表單資料介面 =============

/**
 * 抽成主檔表單資料
 */
export interface ChargeSettingFormData {
  id?: string;
  apply_no: string | null;
  tlt_id: string;
  tlt_id_desc: string;
  cag_bdate: string | Date;
  cag_edate: string | Date;
  cag_taxtype: string;
  sst_amount?: number | null;
  sst_rate?: number | null;
  cap_saletype1: boolean;
  cap_saletype2: boolean;
  cap_saletype5: boolean;

  cag_remark: string;
}

/**
 * 折扣設定明細表單資料
 */
export interface ChargeDetailFormData {
  id?: number | null;
  apply_no: string;
  tlt_id: string;
  cag_barcode: string;
  tlt_bdate?: string | Date | null;
  tlt_edate?: string | Date | null;
  cag_charge_rate?: number | null;
  barcode_desc: string;
  is_configured: boolean;
  is_enabled: boolean;
  selected?: boolean;
}

/**
 * 年度業績抽成表單資料
 */
export interface YearChargeFormData {
  id?: number;
  apply_no: string;
  tlt_id: string;
  tlt_bdate: string | Date;
  tlt_edate: string | Date;
  year_amount: number;
  extra_rate: number;
  selected?: boolean;
}

/**
 * 層級抽成表單資料
 */
export interface LevelChargeFormData {
  id?: number | null;
  apply_no: string;
  tlt_id: string;
  seq_no: number;
  cag_barcode: string;
  level_bmount?: number | null;
  level_eamount?: number | null;
  level_charge_rate?: number | null;
  barcode_desc: string;
  is_configured?: boolean | null;
  is_enabled?: boolean | null;
  selected?: boolean;
}

// ============= 5. 提交資料介面（清理後的版本） =============

/**
 * 提交抽成設定的完整請求
 */
export interface TLS12040ChargeSubmitRequest {
  apply_no: string;
  chargeSettings: ChargeSettingOperations;
  metadata: SubmissionMetadata;
}

/**
 * 抽成設定操作集合
 */
export interface ChargeSettingOperations {
  masters: MasterOperations;
  chargeDetails: DetailOperations;
  yearChargeDetails: DetailOperations;
  levelChargeDetails: DetailOperations;
}

/**
 * 主檔操作
 */
export interface MasterOperations {
  toInsert: CleanChargeSettingData[];
  toUpdate: CleanChargeSettingData[];
  toDelete: { id: string }[];
}

/**
 * 明細操作
 */
export interface DetailOperations {
  toInsert: any[];
  toUpdate: any[];
  toDelete: { id: number }[];
}

/**
 * 清理後的抽成設定資料（提交用）
 */
export interface CleanChargeSettingData {
  id?: string;
  apply_no: string | null;
  tlt_id: string;
  tlt_id_desc: string;
  cag_bdate: string; // YYYY-MM-DD
  cag_edate: string; // YYYY-MM-DD
  cag_taxtype: string;
  sst_amount?: number | null;
  sst_rate?: number | null;
  cap_saletype1: string; // 'Y' | 'N'
  cap_saletype2: string; // 'Y' | 'N'
  cap_saletype5: string;

  cag_remark: string;
}

/**
 * 清理後的折扣設定明細資料（提交用）
 */
export interface CleanChargeDetailData {
  id?: number | null;
  apply_no: string;
  tlt_id: string;
  cag_barcode: string;
  tlt_bdate?: string | null; // YYYY-MM-DD
  tlt_edate?: string | null; // YYYY-MM-DD
  cag_charge_rate?: number | null;
}

/**
 * 清理後的年度業績抽成明細資料（提交用）
 */
export interface CleanYearChargeDetailData {
  id?: number;
  apply_no: string;
  tlt_id: string;
  tlt_bdate: string; // YYYY-MM-DD
  tlt_edate: string; // YYYY-MM-DD
  year_amount: number;
  extra_rate: number;
}

/**
 * 清理後的層級抽成明細資料（提交用）
 */
export interface CleanLevelChargeDetailData {
  id?: number | null;
  apply_no: string;
  tlt_id: string;
  seq_no: number;
  cag_barcode: string;
  level_bmount?: number | null;
  level_eamount?: number | null;
  level_charge_rate?: number | null;
}

/**
 * 提交元數據
 */
export interface SubmissionMetadata {
  apply_no: string;
  contractId: string;
  submittedAt: string;
  totalOperations: number;
  operationSummary: {
    insertCount: number;
    updateCount: number;
    deleteCount: number;
  };
}

// ============= 6. UI 狀態管理介面 =============

/**
 * TLS12040 頁面狀態
 */
export interface TLS12040PageState {
  // 載入狀態
  loading: boolean;
  saving: boolean;
  error?: string | null;
  success?: string | null;

  // 資料狀態
  dataLoaded: boolean;
  lastRefreshTime?: Date;
  hasUnsavedChanges: boolean;

  // UI 互動狀態
  selectedTab: 'charge-detail' | 'year-charge' | 'level-charge';
  selectedMasterId?: number | null;
  expandedMasterIds: number[];

  // 表格狀態
  sortConfig?: {
    field: string;
    direction: 'asc' | 'desc';
  };

  // 模態框狀態
  showEditModal: boolean;
  showDeleteConfirm: boolean;
  editingItem?: any;

  // 篩選狀態
  filters: {
    taxType?: string;
    saleType?: string;
    dateRange?: {
      start: string;
      end: string;
    };
    enabledOnly?: boolean;
  };
}

/**
 * TLS12040 資料容器
 */
export interface TLS12040DataContainer {
  // 原始資料（不可變）
  originalData: ChargeSettingAPIModel[];

  // 業務資料（可編輯）
  businessData: ChargeSettingBusinessModel[];

  // 快取和統計
  statistics?: ChargeStatistics;
  validationResults?: ValidationResults;
}

// ============= 7. 驗證和統計介面 =============

/**
 * 驗證錯誤
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * 驗證結果
 */
export interface ValidationResults {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * 抽成統計資訊
 */
export interface ChargeStatistics {
  totalMasters: number;
  enabledMasters: number;
  totalDetails: number;
  totalYearCharges: number;
  totalLevelCharges: number;

  byTaxType: Record<string, number>;
  bySaleType: Record<string, number>;

  pendingChanges: {
    insertCount: number;
    updateCount: number;
    deleteCount: number;
  };
}

// ============= 8. 資料轉換器類別 =============

/**
 * 資料轉換器 - 負責在不同層級間轉換資料
 */
export class TLS12040DataTransformer {

  /**
   * API 模型轉為業務模型
   */
  static apiToBusinessModel(apiData: ChargeSettingAPIModel[]): ChargeSettingBusinessModel[] {
    return apiData.map(item => ({
      ...item,
      _status: 'original' as DataStatus,
      ChargeDetails: item.ChargeDetails.map(detail => ({
        ...detail,
        _status: 'original' as DataStatus
      })),
      YearChargeDetails: item.YearChargeDetails.map(detail => ({
        ...detail,
        _status: 'original' as DataStatus
      })),
      LevelChargeDetails: item.LevelChargeDetails.map(detail => ({
        ...detail,
        _status: 'original' as DataStatus
      }))
    }));
  }

  /**
   * 業務模型轉為表單資料
   */
  static businessToFormData(businessData: ChargeSettingBusinessModel): ChargeSettingFormData {
    return {
      id: businessData.id,
      apply_no: businessData.apply_no,
      tlt_id: businessData.tlt_id,
      tlt_id_desc: businessData.tlt_id_desc,
      cag_bdate: businessData.cag_bdate,
      cag_edate: businessData.cag_edate,
      cag_taxtype: businessData.cag_taxtype,
      sst_amount: businessData.sst_amount,
      sst_rate: businessData.sst_rate,
      cap_saletype1: businessData.cap_saletype1 === 'Y',
      cap_saletype2: businessData.cap_saletype2 === 'Y',
      cap_saletype5: businessData.cap_saletype5 === 'Y',
      cag_remark: businessData.cag_remark
    };
  }

  /**
   * 表單資料轉為清理後的提交資料
   */
  static formToCleanData(formData: ChargeSettingFormData): CleanChargeSettingData {
    return {
      id: formData.id,
      apply_no: formData.apply_no,
      tlt_id: formData.tlt_id,
      tlt_id_desc: formData.tlt_id_desc,
      cag_bdate: this.formatDateForAPI(formData.cag_bdate),
      cag_edate: this.formatDateForAPI(formData.cag_edate),
      cag_taxtype: formData.cag_taxtype,
      sst_amount: formData.sst_amount,
      sst_rate: formData.sst_rate,
      cap_saletype1: formData.cap_saletype1 ? 'Y' : 'N',
      cap_saletype2: formData.cap_saletype2 ? 'Y' : 'N',
      cap_saletype5: formData.cap_saletype5 ? 'Y' : 'N',
      cag_remark: formData.cag_remark
    };
  }

  /**
   * 收集所有變更的資料並組織為提交請求
   */
  static collectChangesForSubmission(
    businessData: ChargeSettingBusinessModel[],
    applyNo: string
  ): TLS12040ChargeSubmitRequest {
    const masters: MasterOperations = { toInsert: [], toUpdate: [], toDelete: [] };
    const chargeDetails: DetailOperations = { toInsert: [], toUpdate: [], toDelete: [] };
    const yearChargeDetails: DetailOperations = { toInsert: [], toUpdate: [], toDelete: [] };
    const levelChargeDetails: DetailOperations = { toInsert: [], toUpdate: [], toDelete: [] };

    let totalOperations = 0;

    businessData.forEach(master => {
      // 處理主檔
      if (master._status === 'new') {
        const cleanData = this.businessToCleanMaster(master);
        masters.toInsert.push(cleanData);
        totalOperations++;
      } else if (master._status === 'modified') {
        const cleanData = this.businessToCleanMaster(master);
        masters.toUpdate.push(cleanData);
        totalOperations++;
      } else if (master._status === 'deleted') {
        masters.toDelete.push({ id: master.id });
        totalOperations++;
      }

      // 處理各種明細
      this.collectDetailChanges(master.ChargeDetails, chargeDetails, totalOperations);
      this.collectDetailChanges(master.YearChargeDetails, yearChargeDetails, totalOperations);
      this.collectDetailChanges(master.LevelChargeDetails, levelChargeDetails, totalOperations);
    });

    return {
      apply_no: applyNo,
      chargeSettings: {
        masters,
        chargeDetails,
        yearChargeDetails,
        levelChargeDetails
      },
      metadata: {
        apply_no: businessData[0]?.apply_no?.toString() || '',
        contractId: applyNo,
        submittedAt: new Date().toISOString(),
        totalOperations,
        operationSummary: {
          insertCount: masters.toInsert.length,
          updateCount: masters.toUpdate.length,
          deleteCount: masters.toDelete.length
        }
      }
    };
  }

  // 私有輔助方法
  private static formatDateForAPI(date: string | Date): string {
    if (!date) return '';

    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private static businessToCleanMaster(business: ChargeSettingBusinessModel): CleanChargeSettingData {
    return {
      id: business.id,
      apply_no: business.apply_no,
      tlt_id: business.tlt_id,
      tlt_id_desc: business.tlt_id_desc,
      cag_bdate: business.cag_bdate,
      cag_edate: business.cag_edate,
      cag_taxtype: business.cag_taxtype,
      sst_amount: business.sst_amount,
      sst_rate: business.sst_rate,
      cap_saletype1: business.cap_saletype1,
      cap_saletype2: business.cap_saletype2,
      cap_saletype5: business.cap_saletype5,
      cag_remark: business.cag_remark
    };
  }

  private static collectDetailChanges(details: any[], operations: DetailOperations, totalCount: number): void {
    details.forEach(detail => {
      if (detail._status === 'new') {
        operations.toInsert.push(this.cleanDetailForSubmission(detail));
        totalCount++;
      } else if (detail._status === 'modified') {
        operations.toUpdate.push(this.cleanDetailForSubmission(detail));
        totalCount++;
      } else if (detail._status === 'deleted' && detail.id) {
        operations.toDelete.push({ id: detail.id });
        totalCount++;
      }
    });
  }

  private static cleanDetailForSubmission(detail: any): any {
    // 移除所有 _ 開頭的內部狀態屬性
    const clean = { ...detail };
    Object.keys(clean).forEach(key => {
      if (key.startsWith('_')) {
        delete clean[key];
      }
    });
    return clean;
  }
}

// ============= 9. 工具類型和常數 =============

/**
 * 抽成設定相關常數
 */
export const TLS12040_CONSTANTS = {
  TAX_TYPES: {
    TAXED: '1',
    NON_TAXED: '0'
  },
  SALE_TYPES: {
    YES: 'Y',
    NO: 'N'
  },
  DEFAULT_PAGE_SIZE: 20,
  MAX_CHARGE_RATE: 100,
  MIN_CHARGE_RATE: 0
} as const;

/**
 * 所有相關類型的聯合類型（用於泛型約束）
 */
export type TLS12040ModelTypes =
  | ChargeSettingAPIModel
  | ChargeSettingBusinessModel
  | ChargeSettingFormData
  | CleanChargeSettingData;
