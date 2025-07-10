// tls13010.model.ts - 整理後版本
// ========== 1. 保留原有的核心介面（前端邏輯用） ==========

export enum WorkflowStep {
  QUERY = 0,
  CONTRACT_INFO = 1,
  DEDUCTION = 2,
  COMMISSION = 3,
  CONDITION = 4,
  FINAL = 5
}

export interface WorkflowStatus {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  canProceed: boolean;
  contractId: string | null;
  lastModified: Date;
  isNewContract?: boolean;
}

export interface ContractDataStructure {
  contractId: string | null;
  queryRowData: ContractInfo | null;
  step1: ContractInfo | null;
  step2: FareItem[];
  step3: CommissionItem[];
  step4: ConditionItem[];
  step5: FinalData | null;
  dataToDelete: any | null;
  unifiedCommissionData: UnifiedCommissionResponse | null;
  metadata: {
    createdAt: Date;
    lastModified: Date;
    version: number;
    _isNewContract: boolean;
  };
}

// ========== 2. 前端邏輯用的介面（保留追蹤欄位給前端使用） ==========

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
  _isNewContract?: boolean;
}

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
  _status?: 'new' | 'modified' | 'deleted' | 'original'; // 前端追蹤用
  _isNew?: boolean; // 前端追蹤用
}

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
  _status?: 'new' | 'modified' | 'deleted' | 'original'; // 前端追蹤用
  _originalSelected?: boolean; // 前端追蹤用
  _originalData?: Partial<FareItem>; // 前端追蹤用
  [key: string]: any;
}

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
  currentTab?: string;
  _status?: 'original' | 'modified' | 'new' | 'deleted'; // 前端追蹤用
  mainStartDate?: Date | string;
  mainEndDate?: Date | string;
}

export interface DiscountSettingItem {
  id?: number | string;
  selected: boolean;
  cag_barcode: string;
  startDate: Date;
  endDate: Date;
  rate?: number;
  _status?: 'original' | 'modified' | 'new' | 'deleted'; // 前端追蹤用
}

export interface AnnualPerformanceItem {
  id?: number | string;
  selected: boolean;
  startDate: Date;
  endDate: Date;
  discountAmount: number;
  rate: number;
  _status?: 'original' | 'modified' | 'new' | 'deleted'; // 前端追蹤用
}

export interface DiscountLevelItem {
  id?: number | string;
  selected: boolean;
  cag_barcode: string;
  startAmount: number;
  endAmount: number;
  rate: number;
  _status?: 'original' | 'modified' | 'new' | 'deleted'; // 前端追蹤用
}

// 條件設定相關介面（保留前端追蹤欄位）
export interface BaseConditionItem {
  id?: number | string;
  talent_id: string;
  _status?: 'original' | 'new' | 'modified' | 'deleted'; // 前端追蹤用
  _isNew?: boolean; // 前端追蹤用
  _fromNext2?: boolean; // 前端追蹤用
  _readonly?: boolean; // 前端追蹤用
}

export interface FixedRentCondition extends BaseConditionItem {
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  base_rent: number;
}

export interface BaseRentHigherCondition extends BaseConditionItem {
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  base_rent: number;
  cag_charge_rate?: number;
}

export interface GeneralCommissionCondition extends BaseConditionItem {
  tlt_id: string;
  tlt_id_desc: string;
  cag_taxtype: string;
  cag_bdate: string;
  cag_edate: string;
  cag_barcode?: string;
  cag_charge_rate?: number;
}

export interface BaseCommissionCondition extends BaseConditionItem {
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  limit_charge_rate: number;
}

export interface GraduatedCommissionCondition extends BaseConditionItem {
  seq_no: number;
  cag_bdate: string;
  cag_edate: string;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

export interface BaseTierCondition extends BaseConditionItem {
  seq_no: number;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

export type ConditionItem =
  | FixedRentCondition
  | BaseRentHigherCondition
  | GeneralCommissionCondition
  | BaseCommissionCondition
  | GraduatedCommissionCondition
  | BaseTierCondition;

// ========== 3. 新增：清理後的最終提交資料模型 ==========

export interface CleanSubmitData {
  // 基本合約資料 (Step 1)
  contractInfo: {
    operation: 'INSERT' | 'UPDATE';
    data: CleanContractInfo;
  };

  // 代扣款資料 (Step 2)
  deductions: {
    toInsert: CleanDeductionItem[];
    toUpdate: CleanDeductionItem[];
    toDelete: { id: number }[];
  };

  // 抽成設定資料 (Step 3)
  commissions: {
    masters: {
      toInsert: CleanCommissionMaster[];
      toUpdate: CleanCommissionMaster[];
      toDelete: { id: number }[];
    };
    details: {
      toInsert: CleanCommissionDetail[];
      toUpdate: CleanCommissionDetail[];
      toDelete: { id: number }[];
    };
    yearlyDetails: {
      toInsert: CleanYearlyDetail[];
      toUpdate: CleanYearlyDetail[];
      toDelete: { id: number }[];
    };
    levelDetails: {
      toInsert: CleanLevelDetail[];
      toUpdate: CleanLevelDetail[];
      toDelete: { id: number }[];
    };
  };

  // 條件設定資料 (Step 4)
  conditions: {
    rents: {
      toInsert: CleanRentCondition[];
      toUpdate: CleanRentCondition[];
      toDelete: { id: number }[];
    };
    limits: {
      toInsert: CleanLimitCondition[];
      toUpdate: CleanLimitCondition[];
      toDelete: { id: number }[];
    };
    levels: {
      toInsert: CleanGraduatedCondition[];
      toUpdate: CleanGraduatedCondition[];
      toDelete: { id: number }[];
    };
  };

  // 元資料
  metadata: {
    talentId: string;
    contractId: string;
    commissionType: string;
    isNewContract: boolean;
    submittedAt: string;
    totalOperations: number;
  };
}

// ========== 4. 清理後的個別資料模型（後端提交用） ==========

export interface CleanContractInfo {
  talent_id: string;
  apply_no: string;
  tlt_name: string;
  ven_uniform: string;
  VEN_Name: string;
  contract_subno?: string;

  // 日期欄位
  tlt_bdate: string;
  tlt_edate: string;
  tlt_contract_bdate: string;
  tlt_contract_edate: string;

  // 商務條件
  tlt_term_type: string;
  comm_comp_type: string;
  deco_type?: string;
  money_type?: string;
  check_type?: string;
  store_way?: string;

  // Y/N 欄位
  rece_yn?: string;
  pos_yn?: string;
  cash_yn?: string;

  // 聯絡資訊
  email?: string;
  store_tel?: string;
  contact_addr?: string;
  contact_tel?: string;
  contact_fax?: string;

  // 位置資訊
  locations: CleanLocationInfo[];
}

export interface CleanLocationInfo {
  id?: number;
  location_no: string;
  tlt_space: number;
}

export interface CleanDeductionItem {
  id?: number;
  talent_id: string;
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
  gui_flag?: string;
  org_id?: string;
  day_account?: string;
  interval?: number;
  down_payment?: number;
  period_nos?: number;
  tpy_1stamt?: number;
  tpy_rate?: number;
}

export interface CleanCommissionMaster {
  id?: number;
  talent_id: string;
  tlt_id: string;
  tlt_id_desc: string;
  cag_bdate: string;
  cag_edate: string;
  cag_taxtype: string;
  sst_amount?: number;
  sst_rate?: number;
  cap_saletype1?: string;
  cap_saletype2?: string;
}

export interface CleanCommissionDetail {
  id?: number;
  talent_id: string;
  tlt_id: string;
  cag_barcode: string;
  tlt_bdate: string;
  tlt_edate: string;
  cag_charge_rate: number;
}

export interface CleanYearlyDetail {
  id?: number;
  talent_id: string;
  tlt_id: string;
  tlt_bdate: string;
  tlt_edate: string;
  year_amount: number;
  extra_rate: number;
}

export interface CleanLevelDetail {
  id?: number;
  talent_id: string;
  tlt_id: string;
  seq_no: number;
  cag_barcode: string;
  level_bmount: number;
  level_eamount: number;
  level_charge_rate: number;
}

export interface CleanRentCondition {
  id?: number;
  talent_id: string;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  base_rent: number;
}

export interface CleanLimitCondition {
  id?: number;
  talent_id: string;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  limit_charge_rate: number;
}

export interface CleanGraduatedCondition {
  id?: number;
  talent_id: string;
  seq_no: number;
  cag_bdate: string;
  cag_edate: string;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

// ========== 5. 資料清理器類別 ==========

export class DataCleaner {

  /**
   * 清理合約基本資料
   */
  static cleanContractInfo(rawData: any): CleanContractInfo {
    return {
      talent_id: rawData.talent_id || '',
      apply_no: rawData.apply_no || '',
      tlt_name: rawData.tlt_name || '',
      ven_uniform: rawData.ven_uniform || '',
      VEN_Name: rawData.VEN_Name || '',
      contract_subno: rawData.contract_subno,

      tlt_bdate: this.formatDate(rawData.tlt_bdate),
      tlt_edate: this.formatDate(rawData.tlt_edate),
      tlt_contract_bdate: this.formatDate(rawData.tlt_contract_bdate),
      tlt_contract_edate: this.formatDate(rawData.tlt_contract_edate),

      tlt_term_type: rawData.tlt_term_type || '3',
      comm_comp_type: rawData.comm_comp_type || '2',
      deco_type: rawData.deco_type,
      money_type: rawData.money_type,
      check_type: rawData.check_type,
      store_way: rawData.store_way,

      rece_yn: rawData.rece_yn,
      pos_yn: rawData.pos_yn,
      cash_yn: rawData.cash_yn,

      email: rawData.email,
      store_tel: rawData.store_tel,
      contact_addr: rawData.contact_addr,
      contact_tel: rawData.contact_tel,
      contact_fax: rawData.contact_fax,

      locations: this.cleanLocationInfo(rawData.locationInfo || [])
    };
  }

  /**
   * 清理位置資訊
   */
  static cleanLocationInfo(rawLocations: any[]): CleanLocationInfo[] {
    return rawLocations
      .filter(location => location._status !== 'deleted')
      .map(location => ({
        ...(this.hasValidId(location.id) ? { id: Number(location.id) } : {}),
        location_no: location.location_no || '',
        tlt_space: Number(location.tlt_space) || 0
      }));
  }

  /**
   * 清理代扣款資料
   */
  static cleanDeductionItems(rawItems: any[]): {
    toInsert: CleanDeductionItem[];
    toUpdate: CleanDeductionItem[];
    toDelete: { id: number }[];
  } {
    const toInsert: CleanDeductionItem[] = [];
    const toUpdate: CleanDeductionItem[] = [];
    const toDelete: { id: number }[] = [];

    rawItems.forEach(item => {
      if (!item.is_selected) return; // 只處理已選中的項目

      const cleanItem: CleanDeductionItem = {
        ...(this.hasValidId(item.id) ? { id: Number(item.id) } : {}),
        talent_id: item.talent_id || '',
        cap_type: item.cap_type || '',
        cap_item: item.cap_item || '',
        cap_name: item.cap_name || '',
        tpy_bdate: this.formatDate(item.tpy_bdate),
        tpy_edate: this.formatDate(item.tpy_edate),
        tpy_type: item.tpy_type,
        tpy_qty: this.parseNumber(item.tpy_qty),
        tpy_unitamt: this.parseNumber(item.tpy_unitamt),
        tpy_amount: this.parseNumber(item.tpy_amount),
        tpy_totalamt: this.parseNumber(item.tpy_totalamt),
        gui_flag: item.gui_flag,
        org_id: item.org_id,
        day_account: item.day_account,
        interval: this.parseNumber(item.interval),
        down_payment: this.parseNumber(item.down_payment),
        period_nos: this.parseNumber(item.period_nos),
        tpy_1stamt: this.parseNumber(item.tpy_1stamt),
        tpy_rate: this.parseNumber(item.tpy_rate)
      };

      switch (item._status) {
        case 'new':
          toInsert.push(cleanItem);
          break;
        case 'modified':
          toUpdate.push(cleanItem);
          break;
        case 'deleted':
          if (this.hasValidId(item.id)) {
            toDelete.push({ id: Number(item.id) });
          }
          break;
      }
    });

    return { toInsert, toUpdate, toDelete };
  }

  /**
   * 清理抽成設定資料
   */
  static cleanCommissionData(rawCommissions: any[]): {
    masters: { toInsert: CleanCommissionMaster[]; toUpdate: CleanCommissionMaster[]; toDelete: { id: number }[] };
    details: { toInsert: CleanCommissionDetail[]; toUpdate: CleanCommissionDetail[]; toDelete: { id: number }[] };
    yearlyDetails: { toInsert: CleanYearlyDetail[]; toUpdate: CleanYearlyDetail[]; toDelete: { id: number }[] };
    levelDetails: { toInsert: CleanLevelDetail[]; toUpdate: CleanLevelDetail[]; toDelete: { id: number }[] };
  } {
    const result = {
      masters: { toInsert: [], toUpdate: [], toDelete: [] } as any,
      details: { toInsert: [], toUpdate: [], toDelete: [] } as any,
      yearlyDetails: { toInsert: [], toUpdate: [], toDelete: [] } as any,
      levelDetails: { toInsert: [], toUpdate: [], toDelete: [] } as any
    };

    rawCommissions.forEach(commission => {
      if (commission._status === 'deleted') {
        if (this.hasValidId(commission.id)) {
          result.masters.toDelete.push({ id: Number(commission.id) });
        }
        return;
      }

      // 處理主檔
      const cleanMaster: CleanCommissionMaster = {
        ...(this.hasValidId(commission.id) ? { id: Number(commission.id) } : {}),
        talent_id: commission.talent_id || '',
        tlt_id: commission.commissionType || '',
        tlt_id_desc: commission.commissionTypeName || '',
        cag_bdate: this.formatDate(commission.mainStartDate),
        cag_edate: this.formatDate(commission.mainEndDate),
        cag_taxtype: commission.taxType === 1 ? '1' : '0',
        sst_amount: this.parseNumber(commission.transactionAmount),
        sst_rate: this.parseNumber(commission.specialCommission),
        cap_saletype1: commission.thousandDiscount ? 'Y' : 'N',
        cap_saletype2: commission.fullPointActivity ? 'Y' : 'N'
      };

      switch (commission._status) {
        case 'new':
          result.masters.toInsert.push(cleanMaster);
          break;
        case 'modified':
          result.masters.toUpdate.push(cleanMaster);
          break;
      }

      // 處理折扣設定明細
      commission.discountSettingItems?.forEach((detail: any) => {
        if (detail._status === 'deleted') {
          if (this.hasValidId(detail.id)) {
            result.details.toDelete.push({ id: Number(detail.id) });
          }
          return;
        }

        const cleanDetail: CleanCommissionDetail = {
          ...(this.hasValidId(detail.id) ? { id: Number(detail.id) } : {}),
          talent_id: commission.talent_id || '',
          tlt_id: commission.commissionType || '',
          cag_barcode: detail.cag_barcode || '',
          tlt_bdate: this.formatDate(detail.startDate),
          tlt_edate: this.formatDate(detail.endDate),
          cag_charge_rate: this.parseNumber(detail.rate) || 0
        };

        if (detail._status === 'new') {
          result.details.toInsert.push(cleanDetail);
        } else if (detail._status === 'modified') {
          result.details.toUpdate.push(cleanDetail);
        }
      });

      // 處理年度業績明細
      commission.annualPerformanceItems?.forEach((detail: any) => {
        if (detail._status === 'deleted') {
          if (this.hasValidId(detail.id)) {
            result.yearlyDetails.toDelete.push({ id: Number(detail.id) });
          }
          return;
        }

        const cleanYearly: CleanYearlyDetail = {
          ...(this.hasValidId(detail.id) ? { id: Number(detail.id) } : {}),
          talent_id: commission.talent_id || '',
          tlt_id: commission.commissionType || '',
          tlt_bdate: this.formatDate(detail.startDate),
          tlt_edate: this.formatDate(detail.endDate),
          year_amount: this.parseNumber(detail.discountAmount) || 0,
          extra_rate: this.parseNumber(detail.rate) || 0
        };

        if (detail._status === 'new') {
          result.yearlyDetails.toInsert.push(cleanYearly);
        } else if (detail._status === 'modified') {
          result.yearlyDetails.toUpdate.push(cleanYearly);
        }
      });

      // 處理層級抽成明細
      commission.discountLevelItems?.forEach((detail: any, index: number) => {
        if (detail._status === 'deleted') {
          if (this.hasValidId(detail.id)) {
            result.levelDetails.toDelete.push({ id: Number(detail.id) });
          }
          return;
        }

        const cleanLevel: CleanLevelDetail = {
          ...(this.hasValidId(detail.id) ? { id: Number(detail.id) } : {}),
          talent_id: commission.talent_id || '',
          tlt_id: commission.commissionType || '',
          seq_no: index + 1,
          cag_barcode: detail.cag_barcode || '',
          level_bmount: this.parseNumber(detail.startAmount) || 0,
          level_eamount: this.parseNumber(detail.endAmount) || 0,
          level_charge_rate: this.parseNumber(detail.rate) || 0
        };

        if (detail._status === 'new') {
          result.levelDetails.toInsert.push(cleanLevel);
        } else if (detail._status === 'modified') {
          result.levelDetails.toUpdate.push(cleanLevel);
        }
      });
    });

    return result;
  }

  /**
   * 清理條件設定資料
   */
  static cleanConditionData(rawConditions: any[], commissionType: string): {
    rents: { toInsert: CleanRentCondition[]; toUpdate: CleanRentCondition[]; toDelete: { id: number }[] };
    limits: { toInsert: CleanLimitCondition[]; toUpdate: CleanLimitCondition[]; toDelete: { id: number }[] };
    levels: { toInsert: CleanGraduatedCondition[]; toUpdate: CleanGraduatedCondition[]; toDelete: { id: number }[] };
  } {
    const result = {
      rents: { toInsert: [], toUpdate: [], toDelete: [] } as any,
      limits: { toInsert: [], toUpdate: [], toDelete: [] } as any,
      levels: { toInsert: [], toUpdate: [], toDelete: [] } as any
    };

    rawConditions.forEach(condition => {
      if (condition._status === 'deleted') {
        if (this.hasValidId(condition.id)) {
          if ('base_rent' in condition) {
            result.rents.toDelete.push({ id: Number(condition.id) });
          } else if ('limit_amt' in condition && !('seq_no' in condition)) {
            result.limits.toDelete.push({ id: Number(condition.id) });
          } else if ('seq_no' in condition) {
            result.levels.toDelete.push({ id: Number(condition.id) });
          }
        }
        return;
      }

      // 處理租金條件
      if ('base_rent' in condition) {
        const cleanRent: CleanRentCondition = {
          ...(this.hasValidId(condition.id) ? { id: Number(condition.id) } : {}),
          talent_id: condition.talent_id || '',
          tlt_id: condition.tlt_id || '',
          cag_bdate: this.formatDate(condition.cag_bdate),
          cag_edate: this.formatDate(condition.cag_edate),
          base_rent: this.parseNumber(condition.base_rent) || 0
        };

        if (condition._status === 'new') {
          result.rents.toInsert.push(cleanRent);
        } else if (condition._status === 'modified') {
          result.rents.toUpdate.push(cleanRent);
        }
      }
      // 處理包底條件
      else if ('limit_amt' in condition && !('seq_no' in condition)) {
        const cleanLimit: CleanLimitCondition = {
          ...(this.hasValidId(condition.id) ? { id: Number(condition.id) } : {}),
          talent_id: condition.talent_id || '',
          tlt_id: condition.tlt_id || '',
          cag_bdate: this.formatDate(condition.cag_bdate),
          cag_edate: this.formatDate(condition.cag_edate),
          limit_amt: this.parseNumber(condition.limit_amt) || 0,
          limit_charge_rate: this.parseNumber(condition.limit_charge_rate) || 0
        };

        if (condition._status === 'new') {
          result.limits.toInsert.push(cleanLimit);
        } else if (condition._status === 'modified') {
          result.limits.toUpdate.push(cleanLimit);
        }
      }
      // 處理階梯條件
      else if ('seq_no' in condition) {
        const cleanLevel: CleanGraduatedCondition = {
          ...(this.hasValidId(condition.id) ? { id: Number(condition.id) } : {}),
          talent_id: condition.talent_id || '',
          seq_no: condition.seq_no || 0,
          cag_bdate: this.formatDate(condition.cag_bdate),
          cag_edate: this.formatDate(condition.cag_edate),
          start_number: this.parseNumber(condition.start_number) || 0,
          end_number: this.parseNumber(condition.end_number) || 0,
          charge_rate: this.parseNumber(condition.charge_rate) || 0
        };

        if (condition._status === 'new') {
          result.levels.toInsert.push(cleanLevel);
        } else if (condition._status === 'modified') {
          result.levels.toUpdate.push(cleanLevel);
        }
      }
    });

    return result;
  }

  // ========== 輔助方法 ==========

  private static hasValidId(id: any): boolean {
    return id &&
      !String(id).startsWith('temp_') &&
      !String(id).includes('new_') &&
      !isNaN(Number(id)) &&
      Number(id) > 0;
  }

  private static formatDate(date: any): string {
    if (!date) return '';
    try {
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      return new Date(date).toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  private static parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }
}

// ========== 6. 保留的 API 相關介面 ==========

export interface UnifiedCommissionResponse {
  TalentId: string;
  TalentName: string;
  OriginalTltTermType: string;
  CurrentTltTermType: string;
  IsTermTypeChanged: boolean;
  HasError: boolean;
  ErrorMessage?: string | null;
  ActionType: string;
  UserMessage?: string;
  Warning?: UnifiedCommissionWarning;
  ExistingChargeData?: TalentChargeApiData;
  RentSettingData?: RentSettingApiData;
  DataToDelete?: CommissionDataStructure;
  NewDataStructure?: NewCommissionDataStructure;
}

export interface UnifiedCommissionWarning {
  Message: string;
  ItemsToBeDeleted: string[];
  TotalItemsCount: number;
  HasCriticalData: boolean;
}

export interface TalentChargeApiData {
  TalentId: string;
  ChargeSettings: ChargeSettingApiItem[];
  TotalRecords: number;
}

export interface ChargeSettingApiItem {
  id: number;
  talent_id: number;
  tlt_id: string;
  tlt_id_desc: string;
  cag_bdate: string;
  cag_edate: string;
  cag_taxtype: string;
  sst_amount: number | null;
  sst_rate: number | null;
  cap_saletype1: string | null;
  cap_saletype2: string | null;
  cag_remark: string | null;
  ChargeDetails: ChargeDetailApiItem[];
  YearChargeDetails: YearChargeDetailApiItem[];
  LevelChargeDetails: LevelChargeDetailApiItem[];
}

export interface ChargeDetailApiItem {
  id: number;
  talent_id: number;
  tlt_id: string;
  cag_barcode: string;
  tlt_bdate: string;
  tlt_edate: string;
  cag_charge_rate: number;
  barcode_desc?: string;
}

export interface YearChargeDetailApiItem {
  id: number;
  talent_id: number;
  tlt_id: string;
  tlt_bdate: string;
  tlt_edate: string;
  year_amount: number;
  extra_rate: number;
}

export interface LevelChargeDetailApiItem {
  id: number;
  talent_id: number;
  tlt_id: string;
  seq_no: number;
  cag_barcode: string;
  level_bmount: number;
  level_eamount: number;
  level_charge_rate: number;
  barcode_desc?: string;
}

export interface RentSettingApiData {
  CommissionMasters?: CommissionMasterApiItem[];
  ChargedDetails?: ChargeDetailApiItem[];
  RentDetails?: RentDetailApiItem[];
  LimitDetails?: LimitDetailApiItem[];
  LevelDetails?: LevelDetailApiItem[];
}

export interface CommissionMasterApiItem {
  id: number;
  talent_id: number;
  tlt_id: string;
  tlt_id_desc: string;
  cag_bdate: string;
  cag_edate: string;
  cag_taxtype: string;
  sst_amount: number | null;
  sst_rate: number | null;
  cap_saletype1: string | null;
  cap_saletype2: string | null;
  cag_remark: string | null;
}

export interface RentDetailApiItem {
  id: number;
  talent_id: number;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  base_rent: number;
}

export interface LimitDetailApiItem {
  id: number;
  talent_id: number;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  limit_charge_rate: number;
}

export interface LevelDetailApiItem {
  id: number;
  talent_id: number;
  seq_no: number;
  cag_bdate: string;
  cag_edate: string;
  limit_amt?: number;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

export interface CommissionDataStructure {
  CommissionMasters?: CommissionMaster[];
  ChargedDetails?: ChargedDetail[];
  RentDetails?: RentDetail[];
  LimitDetails?: LimitDetail[];
  LevelDetails?: LevelDetail[];
}

export interface CommissionMaster {
  id: number;
  talent_id: number;
  tlt_id: string;
  tlt_id_desc: string;
  cag_bdate: string;
  cag_edate: string;
  cag_taxtype: string;
  sst_amount: number;
  sst_rate: number;
  cap_saletype1: string;
  cap_saletype2: string;
  cag_remark: string;
}

export interface ChargedDetail {
  id: number;
  talent_id: number;
  tlt_id: string;
  cag_barcode: string;
  tlt_bdate: string;
  tlt_edate: string;
  cag_charge_rate: number;
}

export interface RentDetail {
  id: number;
  talent_id: number;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  base_rent: number;
}

export interface LimitDetail {
  id: number;
  talent_id: number;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  limit_charge_rate: number;
}

export interface LevelDetail {
  id: number;
  talent_id: number;
  seq_no: number;
  cag_bdate: string;
  cag_edate: string;
  limit_amt?: number;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

export interface NewCommissionDataStructure {
  TermType: string;
  ChargedDetails?: any[];
  RentDetails?: any[];
  LimitDetails?: any[];
  LevelDetails?: any[];
}

// ========== 7. 其他保留的介面 ==========

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

export interface FinalData {
  contractInfo: ContractInfo;
  deductionData: any[];
  commissionData: any[];
  conditionData: any[];
}

// ========== 8. 向後相容的型別別名 ==========

export type BaseRentHigherItem = BaseRentHigherCondition;
export type BaseCommissionItem = BaseCommissionCondition;
export type GraduatedItem = GraduatedCommissionCondition;
export type BaseTierItem = BaseTierCondition;
export type CommissionResponseApiData = any; // 保持相容性

// ========== 9. 保留的工具類別（簡化版） ==========

export class Step3DataChangeTracker {
  private static currentTalentId: string = '';

  static setCurrentTalentId(talentId: string): void {
    this.currentTalentId = talentId;
  }

  static generateStep3ChangeSummary(commissionItems: CommissionItem[], talentId?: string): any {
    // 保留原有邏輯，但標記為將來可移除
    console.warn('Step3DataChangeTracker.generateStep3ChangeSummary is deprecated, use DataCleaner.cleanCommissionData instead');

    if (talentId) {
      this.currentTalentId = talentId;
    }

    // 簡化的實作，建議未來改用 DataCleaner
    return {
      summary: {
        insert: 0,
        update: 0,
        delete: 0,
        unchanged: 0,
        total: commissionItems.length
      },
      operations: {
        commissionMaster: { toInsert: [], toUpdate: [], toDelete: [] },
        discountSettings: { toInsert: [], toUpdate: [], toDelete: [] },
        annualSettings: { toInsert: [], toUpdate: [], toDelete: [] },
        levelSettings: { toInsert: [], toUpdate: [], toDelete: [] }
      }
    };
  }
}
