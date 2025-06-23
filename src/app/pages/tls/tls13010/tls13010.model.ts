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
}

// next2 - 抽成設定
export interface CommissionItem {
  id: number;
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
}
export interface DiscountSettingItem {
  selected: boolean;
  cag_barcode: string;
  startDate: Date;
  endDate: Date;
  rate: number;
  _status?: 'original' | 'modified' | 'new' | 'deleted';
}
export interface AnnualPerformanceItem {
  selected: boolean;
  startDate: Date;
  endDate: Date;
  discountAmount: number;
  rate: number;
  _status?: 'original' | 'modified' | 'new' | 'deleted';
}
export interface DiscountLevelItem {
  selected: boolean;
  cag_barcode: string;
  startAmount: number;
  endAmount: number;
  rate: number;
  _status?: 'original' | 'modified' | 'new' | 'deleted';
}

// next3 - 條件設定
export interface ConditionDataItem {
  id?: number | string;
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
  G: string;
}


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
  step3: {
    summary: ChangeSummary;
    operations: {
      toInsert: CommissionItem[];
      toUpdate: CommissionItem[];
      toDelete: CommissionItem[];
    };
  };
  step4: {
    summary: ChangeSummary;
    operations: {
      toInsert: ConditionDataItem[];
      toUpdate: ConditionDataItem[];
      toDelete: ConditionDataItem[];
    };
  };
  metadata: {
    talentId: string;
    contractId: string;
    submittedAt: Date;
    totalOperations: number;
  };
}

export interface ChangeSummary {
  insert: number;
  update: number;
  delete: number;
  unchanged: number;
  total: number;
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


export interface BaseConditionItem {
  id?: number | string;
  talent_id: string;
  tlt_id: string;           // 帳務期別
  cag_bdate: string;        // 帳務起始日
  cag_edate: string;        // 帳務結束日
  _status?: 'original' | 'new' | 'modified' | 'deleted';
}

// 固定租金條件 (對應 TLTTALENT_RENT)
export interface FixedRentCondition extends BaseConditionItem {
  base_rent: number;        // 租金金額
}

// 底租抽成取高者條件 (TLTTALENT_RENT + TLTTALENT_CHARGED)
export interface BaseRentHigherCondition extends BaseConditionItem {
  base_rent: number;        // 租金金額
  cag_charge_rate: number;  // 抽成率
}

// 包底抽成條件 (對應 TLTTALENT_LIMIT)
export interface BaseCommissionCondition extends BaseConditionItem {
  limit_amt: number;        // 包底金額
  limit_charge_rate: number; // 抽成率
}

// 階梯式抽成條件 (對應 TLTTALENT_LEVEL + TLTTALENT_LEVELD)
export interface GraduatedCommissionCondition extends BaseConditionItem {
  seq_no: number;           // 序號
  limit_amt?: number;       // 限制金額
  start_number: number;     // 階梯金額(起值)
  end_number: number;       // 階梯金額(迄值)
  charge_rate: number;      // 抽成率
}

// 包底加階梯條件 (TLTTALENT_LIMIT + TLTTALENT_LEVEL)
export interface BaseTierCondition extends BaseConditionItem {
  seq_no: number;           // 序號
  limit_amt: number;        // 包底金額
  start_number: number;     // 階梯金額(起值)
  end_number: number;       // 階梯金額(迄值)
  charge_rate: number;      // 抽成率
}

// 統一的條件設定容器
export interface CommissionConditionData {
  fixedRentItems: FixedRentCondition[];
  baseRentHigherItems: BaseRentHigherCondition[];
  baseCommissionItems: BaseCommissionCondition[];
  graduatedItems: GraduatedCommissionCondition[];
  baseTierItems: BaseTierCondition[];
}
// 之後會陸續加入 CRU、扣款、抽成、條件設定等型別
