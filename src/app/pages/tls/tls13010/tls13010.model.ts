// tls13010.model.ts
// 統一管理 TLS13010 相關型別

// 查詢結果/合約主資料型別
export interface ContractItem {
  talent_id: string;
  apply_no: string;
  tlt_no: string;
  tlt_name: string;
  ven_uniform: string;
  ven_no: string;
  VEN_Name: string;
  paper_type: string;
  contract_subno: string;
  feedback_date: string;
  due_date: string;
  tlt_bdate: string;
  tlt_edate: string;
  contact_Date: string;
  tlt_contract_bdate: string;
  tlt_contract_edate: string;
  bus_type: string;
  bus_class: string;
  bus_sclass: string;
  deco_type: string;
  money_type: string;
  check_type: string;
  tlt_term_type: string;
  comm_comp_type: string;
  comm_yn: string;
  store_way: string;
  rece_yn: string;
  pos_yn: string;
  cash_yn: string;
  tlt_openflag: string;
  org_id: string;
  rent_ahead: string;
  rent_period: string;
  base_rent: string;
  deposit: string;
  total_amt: string;
  total_amt_vendor: string;
  open_deposit: string;
  open_fees: string;
  construct_deposit: string;
  construct_fees: string;
  expiration_deposit: string;
  expiration_fees: string;
  check_day: string;
  tlt_kind: string;
  edc_yn: string;
  tlt_ctype_mtotal: string;
  overall_status: string;
  paytype: string;
  vip_yn: string;
  credit_card: string;
  invoice_type: string;
  water_flag: string;
  electric_flag: string;
  gas_flag: string;
  email: string;
  invoice_email: string;
  CHECK_TITLE: string;
  store_tel: string;
  bank_id: string;
  vendor_acct_name: string;
  vendor_acct_no: string;
  contact_tel: string;
  contact_fax: string;
  contact_addr: string;
  tlt_remark: string;
  ticket_remarks: string;
  source_type: string;
  rental_count: string;
  contract_type: string;
}

// CRU 編輯頁 - 分類資料型別
export interface CategoryItem {
  id: number;
  bus_type: string;
  bus_type_name: string;
  bus_class: string;
  bus_class_name: string;
  bus_sclass: string;
  bus_sclass_name: string;
  bus_sclass_desc: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  _status?: 'new' | 'modified' | 'deleted' | 'original';
}

// CRU 編輯頁 - 地點資料型別
export interface LocationItem {
  id?: number | string;
  location_no: string;
  tlt_building: string;
  tlt_floor: string;
  area_no: string;
  tlt_space: number;
  building_desc: string;
  floor_desc: string;
  area_desc: string;
  _status?: 'new' | 'modified' | 'deleted' | 'original';
  _isNew?: boolean; // 標記是否為新資料
}

// 合約主檔（CRU）
export interface ContractInfo {
  id: string | number;
  talent_id: string;
  apply_no: string;
  tlt_name: string;
  VEN_Name: string;
  contract_subno?: string;
  cap_name?: string;
  cap_item?: string;
  org_id?: string;
  tpy_type?: string;
  tlt_contract_bdate?: string;
  tlt_contract_edate?: string;
  tlt_bdate?: string;
  tlt_edate?: string;
  tpy_amount?: number;
  tpy_unitamt?: number;
  tpy_qty?: number;
  ven_uniform?: string;
  comm_comp_type?: string;
  originalFareData?: string;
  locationInfo?: LocationItem[];
  bus_type?: string;
  bus_class?: string;
  tlt_term_type?: string;
}

// 代扣款設定（next1）
export interface DeductionData {
  // 這裡可根據 next1 表格細化
  id?: string | number;
  cap_type: string;
  cap_item: string;
  cap_name: string;
  tpy_bdate?: string;
  tpy_edate?: string;
  // ... 其他欄位 ...
}

// 抽成設定（next2）
export interface CommissionData {
  // 這裡可根據 next2 表格細化
  id?: string | number;
  commissionType: string;
  commissionTypeName: string;
  // ... 其他欄位 ...
}

// 條件設定（next3）
export interface ConditionData {
  // 這裡可根據 next3 表格細化
  id?: string | number;
  type: string;
  value: string;
  // ... 其他欄位 ...
}

// 最終確認/送出
export interface FinalData {
  // 這裡可根據送出 API 結構細化
  contractInfo: ContractInfo;
  deductionData: DeductionData[];
  commissionData: CommissionData[];
  conditionData: ConditionData[];
  // ... 其他欄位 ...
}

// next1 - 扣款項目
export interface FareItem {
  id?: string | number;
  serialNumber?: number;
  talent_id: number;
  cap_type: string;
  cap_item: string;
  cap_name: string;
  tpy_bdate?: string;
  tpy_edate?: string;
  tpy_type?: string;
  tpy_qty?: number;
  tpy_unitamt?: number;
  tpy_amount?: number;
  tpy_totalamt?: number;
  day_account?: string;
  interval?: number;
  down_payment?: number;
  period_nos?: number;
  tpy_1stamt?: number;
  cap_saletype?: string;
  edc_bank?: string;
  instms_type?: string;
  pay_no?: string;
  gui_flag?: string;
  tpy_rate?: number;
  org_id?: string;
  is_commonly_used?: string;
  cap_tax_type?: string;
  acc_no?: string;
  data_source: string;
  is_selected: boolean;
  is_new_item: boolean;
  _status?: 'new' | 'modified' | 'deleted' | 'original';

  _originalSelected?: boolean;    // 追蹤初始選中狀態
  _originalData?: Partial<FareItem>; // 追蹤原始資料用於比較
  [key: string]: any;
}

// next2 - 抽成設定
export interface CommissionItem {
  id: number | string;
  commissionType: string;
  commissionTypeName: string;
  taxType: number;
  discountSummary: string;
  transactionAmount: number;
  specialCommission: number;
  fullPointActivity: boolean;
  thousandDiscount: boolean;
  selectedSettingOption: string;
  discountSettingItems: DiscountSettingItem[];
  annualPerformanceItems: AnnualPerformanceItem[];
  discountLevelItems: DiscountLevelItem[];
  detailItems: any[];
  _status?: 'original' | 'modified' | 'new' | 'deleted';

  mainStartDate?: Date | string;  // 對應 TLTTALENT_CHARGEM.cag_bdate
  mainEndDate?: Date | string;    // 對應 TLTTALENT_CHARGEM.cag_edate
}
export interface DiscountSettingItem {
  id?: number | string;
  selected: boolean;
  cag_barcode: string;
  startDate: Date;      // 對應 TLTTALENT_CHARGED.tlt_bdate
  endDate: Date;        // 對應 TLTTALENT_CHARGED.tlt_edate
  rate: number;
  _status?: 'original' | 'modified' | 'new' | 'deleted';
}
export interface AnnualPerformanceItem {
  id?: number | string;
  selected: boolean;
  startDate: Date;       // 對應 TLTTALENT_YEARCHARGED.tlt_bdate
  endDate: Date;         // 對應 TLTTALENT_YEARCHARGED.tlt_edate
  discountAmount: number;
  rate: number;
  _status?: 'original' | 'modified' | 'new' | 'deleted';
}
export interface DiscountLevelItem {
  id?: number | string;
  selected: boolean;
  cag_barcode: string;
  startAmount: number;   // 對應 TLTTALENT_LEVEL_CHARGED.level_bmount
  endAmount: number;     // 對應 TLTTALENT_LEVEL_CHARGED.level_eamount
  rate: number;
  _status?: 'original' | 'modified' | 'new' | 'deleted';
}

export interface ChangeSummary {
  insert: number;
  update: number;
  delete: number;
  unchanged: number;
  total: number;
}

// 基礎條件項目介面
export interface BaseConditionItem {
  id?: number | string;
  talent_id: string;
  _status?: 'original' | 'new' | 'modified' | 'deleted';
  _isNew?: boolean;
}

// 一般抽成條件
export interface GeneralCommissionCondition extends BaseConditionItem {
  tlt_id: string;           // 抽成類別
  tlt_id_desc: string;      // 抽成類別名稱
  cag_taxtype: string;      // 稅別
  cag_bdate: string;        // 帳務起
  cag_edate: string;        // 帳務迄
  cag_barcode?: string;     // 折扣別
  cag_charge_rate?: number; // 抽成率
}

// 固定租金條件 (對應 TLTTALENT_RENT)
export interface FixedRentCondition extends BaseConditionItem {
  tlt_id: string;           // 帳務期別
  cag_bdate: string;        // 帳務起始日
  cag_edate: string;        // 帳務結束日
  base_rent: number;        // 租金金額
}

// 底租抽成取高者條件 (TLTTALENT_RENT + TLTTALENT_CHARGED)
export interface BaseRentHigherCondition extends BaseConditionItem {
  tlt_id: string;           // 帳務期別
  cag_bdate: string;        // 帳務起始日
  cag_edate: string;        // 帳務結束日
  base_rent: number;        // 租金金額
  cag_charge_rate: number;  // 抽成率
}

// 包底抽成條件 (對應 TLTTALENT_LIMIT)
export interface BaseCommissionCondition extends BaseConditionItem {
  tlt_id: string;           // 帳務期別
  cag_bdate: string;        // 帳務起始日
  cag_edate: string;        // 帳務結束日
  limit_amt: number;        // 包底金額
  limit_charge_rate: number; // 抽成率
}

// 階梯式抽成條件 (對應 TLTTALENT_LEVEL + TLTTALENT_LEVELD)
export interface GraduatedCommissionCondition extends BaseConditionItem {
  seq_no: number;           // 序號
  cag_bdate: string;        // 帳務起始日
  cag_edate: string;        // 帳務結束日
  start_number: number;     // 階梯金額(起值)
  end_number: number;       // 階梯金額(迄值)
  charge_rate: number;      // 抽成率
}

// 包底加階梯條件 (TLTTALENT_LIMIT + TLTTALENT_LEVEL + TLTTALENT_LEVELD)
export interface BaseTierCondition extends BaseConditionItem {
  seq_no: number;           // 序號
  tlt_id: string;
  cag_bdate: string;        // 帳務起始日
  cag_edate: string;        // 帳務結束日
  limit_amt: number;        // 包底金額
  start_number: number;     // 階梯金額(起值)
  end_number: number;       // 階梯金額(迄值)
  charge_rate: number;      // 抽成率
}

// 🎯 向後相容：保留舊的 ConditionDataItem 介面
export interface ConditionDataItem {
  id?: number | string;
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
  G: string;
  _status?: 'original' | 'new' | 'modified' | 'deleted';
  _isNew?: boolean;
}

// 統一的條件設定容器
export interface CommissionConditionData {
  fixedRentItems: FixedRentCondition[];
  baseRentHigherItems: BaseRentHigherCondition[];
  baseCommissionItems: BaseCommissionCondition[];
  graduatedItems: GraduatedCommissionCondition[];
  baseTierItems: BaseTierCondition[];
}

// 🎯 新增：條件設定的聯合類型
export type ConditionItem =
  | FixedRentCondition
  | BaseRentHigherCondition
  | GeneralCommissionCondition
  | BaseCommissionCondition
  | GraduatedCommissionCondition
  | BaseTierCondition;

// 資料變更追蹤介面
export interface BaseDataItem {
  id?: string | number;
  _status?: 'original' | 'new' | 'modified' | 'deleted';
  _isNew?: boolean;
}

// 提交資料結構
export interface SubmitDataStructure {
  step1: {
    operation: 'INSERT' | 'UPDATE';
    data: ContractInfo;
  };
  step2: {
    summary: ChangeSummary;
    operations: {
      toInsert: FareItem[];
      toUpdate: FareItem[];
      toDelete: FareItem[];
    };
  };
  step3: Step3ChangeSummary;
  step4: {
    summary: ChangeSummary;
    operations: {
      toInsert: ConditionItem[];
      toUpdate: ConditionItem[];
      toDelete: ConditionItem[];
    };
  };
  legacyDataToDelete?: {
    CommissionMasters?: CommissionMaster[];
    ChargedDetails?: ChargedDetail[];
    RentDetails?: RentDetail[];
    LimitDetails?: LimitDetail[];
    LevelDetails?: LevelDetail[];
  } | null;
  metadata: {
    talentId: string;
    contractId: string;
    submittedAt: Date;
    totalOperations: number;
    hasLegacyDataToDelete?: boolean; // 🎯 新增：標記是否有舊資料要刪除
  };
}

export interface ChangeSummary {
  insert: number;
  update: number;
  delete: number;
  unchanged: number;
  total: number;
}

// 🎯 新增：條件設定的 API 請求/回應介面

// API 請求介面
export interface TLS13010CommissionRequest {
  TalentId: string;
  CurrentTltTermType: string;
}

// API 回應介面
export interface TLS13010CommissionResponse {
  Status: string;
  Data: CommissionResponseData;
  Error?: any;
  Meta?: any;
  Message?: string;
  TotalCount?: number;
  TotalPage?: number;
}

export interface CommissionWarning {
  Message: string;
  ItemsToBeDeleted: string[];
  TotalItemsCount: number;
  HasCriticalData: boolean;
}

export interface CommissionResponseData {
  TalentId: string;
  TalentName: string;
  OriginalTltTermType: string;
  CurrentTltTermType: string;
  IsTermTypeChanged: boolean;
  HasError: boolean;
  ErrorMessage?: string | null;
  ActionType?: string;        // 🎯 新增：如 "CLEAR_AND_INIT"
  UserMessage?: string;       // 🎯 新增：給使用者的訊息
  Warning?: CommissionWarning; // 🎯 新增：警告訊息結構
  DataToDelete?: CommissionDataStructure; // 要刪除的舊資料
  NewDataStructure?: {        // 新的資料結構
    TermType: string;
    ChargedDetails?: any[];
    RentDetails?: any[];
    LimitDetails?: any[];
    LevelDetails?: any[];
  } | null;
  ExistingData?: CommissionDataStructure | null; // 現有資料
}


export interface CommissionDataStructure {
  CommissionMasters?: CommissionMaster[];
  ChargedDetails?: ChargedDetail[];
  RentDetails?: RentDetail[];
  LimitDetails?: LimitDetail[];
  LevelDetails?: LevelDetail[];
}

// 🎯 後端資料表對應介面

// TLTTALENT_CHARGEM
export interface CommissionMaster {
  id: number;
  talent_id: number;
  tlt_id: string;           // 抽成類別
  tlt_id_desc: string;      // 抽成類別名稱
  cag_bdate: string;        // 日期起日
  cag_edate: string;        // 日期迄日
  cag_taxtype: string;      // 課稅別
  sst_amount: number;       // 單筆交易金額
  sst_rate: number;         // 超過單筆交易金額特價抽成比率
  cap_saletype1: string;    // 參加滿千送百
  cap_saletype2: string;    // 參加全館消費滿額集點
  cag_remark: string;       // 抽成類別備註
}

// TLTTALENT_CHARGED
export interface ChargedDetail {
  id: number;
  talent_id: number;
  tlt_id: string;           // 抽成類別
  cag_barcode: string;      // 折數
  tlt_bdate: string;        // 抽成起始日期
  tlt_edate: string;        // 抽成終止日期
  cag_charge_rate: number;  // 抽成比率
}

// TLTTALENT_RENT
export interface RentDetail {
  id: number;
  talent_id: number;
  tlt_id: string;           // 抽成類別
  cag_bdate: string;        // 日期起日
  cag_edate: string;        // 日期迄日
  base_rent: number;        // 租金
}

// TLTTALENT_LIMIT
export interface LimitDetail {
  id: number;
  talent_id: number;
  tlt_id: string;           // 抽成類別
  cag_bdate: string;        // 包底日期起日
  cag_edate: string;        // 包底日期迄日
  limit_amt: number;        // 包底金額
  limit_charge_rate: number; // 包底比率
}

// TLTTALENT_LEVELD (階梯設定明細)
export interface LevelDetail {
  id: number;
  talent_id: number;
  seq_no: number;           // 序號
  cag_bdate: string;        // 抽成日期起日
  cag_edate: string;        // 抽成日期迄日
  limit_amt?: number;       // 包底金額(包底加階梯用)
  start_number: number;     // 起始金額
  end_number: number;       // 終止金額
  charge_rate: number;      // 層級抽取比率
}

export interface Step3ChangeOperations {
  commissionMaster: {
    toInsert: any[];
    toUpdate: any[];
    toDelete: any[];
  };
  discountSettings: {
    toInsert: any[];
    toUpdate: any[];
    toDelete: any[];
  };
  annualSettings: {
    toInsert: any[];
    toUpdate: any[];
    toDelete: any[];
  };
  levelSettings: {
    toInsert: any[];
    toUpdate: any[];
    toDelete: any[];
  };
}

export interface Step3ChangeSummary {
  summary: ChangeSummary;
  operations: Step3ChangeOperations;
}

// 資料變更追蹤工具類
export class DataChangeTracker {

  static trackArrayChanges<T extends BaseDataItem>(items: T[]): {
    toInsert: T[];
    toUpdate: T[];
    toDelete: T[];
    unchanged: T[];
  } {
    const toInsert: T[] = [];
    const toUpdate: T[] = [];
    const toDelete: T[] = [];
    const unchanged: T[] = [];

    items.forEach(item => {
      switch (item._status) {
        case 'new':
          toInsert.push(item);
          break;
        case 'modified':
          toUpdate.push(item);
          break;
        case 'deleted':
          toDelete.push(item);
          break;
        case 'original':
        default:
          unchanged.push(item);
          break;
      }
    });

    return { toInsert, toUpdate, toDelete, unchanged };
  }

  static generateChangeSummary<T extends BaseDataItem>(items: T[], typeName: string) {
    const changes = this.trackArrayChanges(items);

    return {
      type: typeName,
      summary: {
        insert: changes.toInsert.length,
        update: changes.toUpdate.length,
        delete: changes.toDelete.length,
        unchanged: changes.unchanged.length,
        total: items.length
      },
      data: {
        toInsert: changes.toInsert,
        toUpdate: changes.toUpdate,
        toDelete: changes.toDelete
      }
    };
  }

}

// 🎯 新增：條件設定工具類
export class ConditionDataHelper {

  /**
   * 將前端條件資料轉換為後端 API 格式
   */
  static convertToApiFormat(conditionData: CommissionConditionData, commissionType: string): any {
    const result: any = {};

    switch (commissionType) {
      case '1': // 固定租金
        result.RentDetails = conditionData.fixedRentItems.map(item => ({
          talent_id: item.talent_id,
          tlt_id: item.tlt_id,
          cag_bdate: item.cag_bdate,
          cag_edate: item.cag_edate,
          base_rent: item.base_rent,
          _status: item._status
        }));
        break;

      case '2': // 底租抽成取高者
        result.RentDetails = conditionData.baseRentHigherItems.map(item => ({
          talent_id: item.talent_id,
          tlt_id: item.tlt_id,
          cag_bdate: item.cag_bdate,
          cag_edate: item.cag_edate,
          base_rent: item.base_rent,
          _status: item._status
        }));
        result.ChargedDetails = conditionData.baseRentHigherItems.map(item => ({
          talent_id: item.talent_id,
          tlt_id: item.tlt_id,
          cag_barcode: '', // 需要額外處理
          tlt_bdate: item.cag_bdate,
          tlt_edate: item.cag_edate,
          cag_charge_rate: item.cag_charge_rate,
          _status: item._status
        }));
        break;

      case '4': // 包底抽成
        result.LimitDetails = conditionData.baseCommissionItems.map(item => ({
          talent_id: item.talent_id,
          tlt_id: item.tlt_id,
          cag_bdate: item.cag_bdate,
          cag_edate: item.cag_edate,
          limit_amt: item.limit_amt,
          limit_charge_rate: item.limit_charge_rate,
          _status: item._status
        }));
        break;

      case '5': // 階梯式抽成
        result.LevelDetails = conditionData.graduatedItems.map(item => ({
          talent_id: item.talent_id,
          seq_no: item.seq_no,
          cag_bdate: item.cag_bdate,
          cag_edate: item.cag_edate,
          start_number: item.start_number,
          end_number: item.end_number,
          charge_rate: item.charge_rate,
          _status: item._status
        }));
        break;

      case '6': // 包底加階梯
        result.LimitDetails = conditionData.baseTierItems.map(item => ({
          talent_id: item.talent_id,
          tlt_id: item.tlt_id || '0',
          cag_bdate: item.cag_bdate,
          cag_edate: item.cag_edate,
          limit_amt: item.limit_amt,
          limit_charge_rate: 0,
          _status: item._status
        }));
        result.LevelDetails = conditionData.baseTierItems.map(item => ({
          talent_id: item.talent_id,
          seq_no: item.seq_no,
          cag_bdate: item.cag_bdate,
          cag_edate: item.cag_edate,
          limit_amt: item.limit_amt,
          start_number: item.start_number,
          end_number: item.end_number,
          charge_rate: item.charge_rate,
          _status: item._status
        }));
        break;
    }

    return result;
  }

  /**
   * 取得條件設定摘要
   */
  static getConditionSummary(conditionData: CommissionConditionData, commissionType: string): string {
    switch (commissionType) {
      case '1':
        return `固定租金 ${conditionData.fixedRentItems.length} 個項目`;
      case '2':
        return `底租抽成取高者 ${conditionData.baseRentHigherItems.length} 個項目`;
      case '3':
        return '一般抽成 (無需額外條件設定)';
      case '4':
        return `包底抽成 ${conditionData.baseCommissionItems.length} 個項目`;
      case '5':
        return `階梯式抽成 ${conditionData.graduatedItems.length} 個項目`;
      case '6':
        return `包底加階梯 ${conditionData.baseTierItems.length} 個項目`;
      default:
        return '未知抽成類型';
    }
  }
}

// 在 tls13010.model.ts 中修正 Step3DataChangeTracker

export class Step3DataChangeTracker {

  private static currentTalentId: string = '';

  static setCurrentTalentId(talentId: string): void {
    this.currentTalentId = talentId;
  }

  static generateStep3ChangeSummary(commissionItems: CommissionItem[], talentId?: string): Step3ChangeSummary {
    console.log('🔄 開始處理 Step3 變更追蹤，輸入資料:', commissionItems);

    if (talentId) {
      this.currentTalentId = talentId;
    }

    // 1. 準備 4 個資料表的變更操作
    const commissionMasterOps = this.processCommissionMasters(commissionItems);
    const discountSettingsOps = this.processDiscountSettings(commissionItems);
    const annualSettingsOps = this.processAnnualSettings(commissionItems);
    const levelSettingsOps = this.processLevelSettings(commissionItems);

    // 2. 計算總體統計
    const totalInserts =
      commissionMasterOps.toInsert.length +
      discountSettingsOps.toInsert.length +
      annualSettingsOps.toInsert.length +
      levelSettingsOps.toInsert.length;

    const totalUpdates =
      commissionMasterOps.toUpdate.length +
      discountSettingsOps.toUpdate.length +
      annualSettingsOps.toUpdate.length +
      levelSettingsOps.toUpdate.length;

    const totalDeletes =
      commissionMasterOps.toDelete.length +
      discountSettingsOps.toDelete.length +
      annualSettingsOps.toDelete.length +
      levelSettingsOps.toDelete.length;

    const totalUnchanged = commissionItems.filter(item =>
      item._status === 'original' || !item._status
    ).length;

    const result: Step3ChangeSummary = {
      summary: {
        insert: totalInserts,
        update: totalUpdates,
        delete: totalDeletes,
        unchanged: totalUnchanged,
        total: totalInserts + totalUpdates + totalDeletes + totalUnchanged
      },
      operations: {
        commissionMaster: commissionMasterOps,
        discountSettings: discountSettingsOps,
        annualSettings: annualSettingsOps,
        levelSettings: levelSettingsOps
      }
    };

    console.log('✅ Step3 變更追蹤完成:', result);
    return result;
  }

  /**
   * 🎯 修正：處理抽成主檔 (TLTTALENT_CHARGEM)
   */
  private static processCommissionMasters(commissionItems: CommissionItem[]): {
    toInsert: any[], toUpdate: any[], toDelete: any[]
  } {
    const toInsert: any[] = [];
    const toUpdate: any[] = [];
    const toDelete: any[] = [];

    commissionItems.forEach(item => {
      // 🎯 只處理有狀態變更的項目
      if (item._status) {
        const masterData = {
          // 🎯 修正：確保有 id，但新增項目不包含 id
          ...(this.hasValidId(item) ? { id: item.id } : {}),
          talent_id: this.currentTalentId,
          tlt_id: item.commissionType,
          tlt_id_desc: item.commissionTypeName,
          cag_bdate: item.mainStartDate || this.getDefaultStartDate(),
          cag_edate: item.mainEndDate || this.getDefaultEndDate(),
          cag_taxtype: item.taxType === 1 ? '1' : '0',
          sst_amount: item.transactionAmount,
          sst_rate: item.specialCommission,
          cap_saletype1: item.thousandDiscount ? 'Y' : 'N',
          cap_saletype2: item.fullPointActivity ? 'Y' : 'N',
          _status: item._status
          // 🎯 移除 _operation
        };

        switch (item._status) {
          case 'new':
            toInsert.push(masterData);
            break;
          case 'modified':
            toUpdate.push(masterData);
            break;
          case 'deleted':
            toDelete.push(masterData);
            break;
        }
      }
    });

    return { toInsert, toUpdate, toDelete };
  }

  /**
   * 🎯 修正：處理折扣設定明細 (TLTTALENT_CHARGED)
   */
  private static processDiscountSettings(commissionItems: CommissionItem[]): {
    toInsert: any[], toUpdate: any[], toDelete: any[]
  } {
    const toInsert: any[] = [];
    const toUpdate: any[] = [];
    const toDelete: any[] = [];

    commissionItems.forEach(commission => {
      commission.discountSettingItems.forEach(detail => {
        if (detail._status) {
          const detailData = {
            // 🎯 修正：確保有 id，但新增項目不包含 id
            ...(this.hasValidId(detail) ? { id: detail.id } : {}),
            talent_id: this.currentTalentId,
            tlt_id: commission.commissionType,
            cag_barcode: detail.cag_barcode,
            tlt_bdate: this.formatDate(detail.startDate),
            tlt_edate: this.formatDate(detail.endDate),
            cag_charge_rate: detail.rate,
            _status: detail._status
            // 🎯 移除 _operation 和 _parentId
          };

          switch (detail._status) {
            case 'new':
              toInsert.push(detailData);
              break;
            case 'modified':
              toUpdate.push(detailData);
              break;
            case 'deleted':
              toDelete.push(detailData);
              break;
          }
        }
      });
    });

    return { toInsert, toUpdate, toDelete };
  }

  /**
   * 🎯 修正：處理年度業績明細 (TLTTALENT_YEARCHARGED)
   */
  private static processAnnualSettings(commissionItems: CommissionItem[]): {
    toInsert: any[], toUpdate: any[], toDelete: any[]
  } {
    const toInsert: any[] = [];
    const toUpdate: any[] = [];
    const toDelete: any[] = [];

    commissionItems.forEach(commission => {
      commission.annualPerformanceItems.forEach(detail => {
        if (detail._status) {
          const detailData = {
            ...(this.hasValidId(detail) ? { id: detail.id } : {}),
            talent_id: this.currentTalentId,
            tlt_id: commission.commissionType,
            tlt_bdate: this.formatDate(detail.startDate),
            tlt_edate: this.formatDate(detail.endDate),
            year_amount: detail.discountAmount,
            extra_rate: detail.rate,
            _status: detail._status
          };

          switch (detail._status) {
            case 'new':
              toInsert.push(detailData);
              break;
            case 'modified':
              toUpdate.push(detailData);
              break;
            case 'deleted':
              toDelete.push(detailData);
              break;
          }
        }
      });
    });

    return { toInsert, toUpdate, toDelete };
  }

  /**
   * 🎯 修正：處理層級抽成明細 (TLTTALENT_LEVEL_CHARGED)
   */
  private static processLevelSettings(commissionItems: CommissionItem[]): {
    toInsert: any[], toUpdate: any[], toDelete: any[]
  } {
    const toInsert: any[] = [];
    const toUpdate: any[] = [];
    const toDelete: any[] = [];

    commissionItems.forEach(commission => {
      commission.discountLevelItems.forEach((detail, index) => {
        if (detail._status) {
          const detailData = {
            ...(this.hasValidId(detail) ? { id: detail.id } : {}),
            talent_id: this.currentTalentId,
            tlt_id: commission.commissionType,
            seq_no: index + 1, // 序號
            cag_barcode: detail.cag_barcode,
            level_bmount: detail.startAmount,
            level_eamount: detail.endAmount,
            level_charge_rate: detail.rate,
            _status: detail._status
          };

          switch (detail._status) {
            case 'new':
              toInsert.push(detailData);
              break;
            case 'modified':
              toUpdate.push(detailData);
              break;
            case 'deleted':
              toDelete.push(detailData);
              break;
          }
        }
      });
    });

    return { toInsert, toUpdate, toDelete };
  }

  // 🎯 輔助方法
  private static hasValidId(item: any): boolean {
    return item.id !== null && item.id !== undefined && item.id !== '';
    // 移除對 temp_ 的限制，因為前端需要這些 ID 來追蹤狀態
  }


  private static formatDate(date: any): string {
    if (!date) return '';

    try {
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      } else if (typeof date === 'string') {
        return new Date(date).toISOString().split('T')[0];
      }
      return '';
    } catch (error) {
      console.warn('日期格式化失敗:', date, error);
      return '';
    }
  }

  private static getDefaultStartDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private static getDefaultEndDate(): string {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  }
}

export type BaseRentHigherItem = BaseRentHigherCondition;
export type BaseCommissionItem = BaseCommissionCondition;
export type GraduatedItem = GraduatedCommissionCondition;
export type BaseTierItem = BaseTierCondition;

// 🎯 修正 CommissionData 型別使用問題
export type CommissionResponseApiData = CommissionResponseData;
