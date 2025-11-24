// ========== 基礎類型定義 ==========
export type DataStatus = 'original' | 'new' | 'modified' | 'deleted';
export type OperationType = 'INSERT' | 'UPDATE' | 'DELETE';

// ========== TLS12040 最終提交資料結構 ==========

/**
 * TLS12040 最終提交資料結構
 */
export interface TLS12040SubmitData {
  contractInfo: TLS12040ContractInfo;
  deductions: TLS12040Deductions;
  commissions: TLS12040Commissions;
  conditions: TLS12040Conditions;
  metadata: TLS12040Metadata;
  commissionTypeChange?: TLS12040CommissionTypeChange | null;
}

/**
 * 合約基本資料
 */
export interface TLS12040ContractInfo {
  operation: 'INSERT' | 'UPDATE';
  data: TLS12040ContractData;
}

/**
 * 合約詳細資料
 */
export interface TLS12040ContractData {
  // 基本資料
  apply_no: string;
  tlt_no?: string;
  tlt_name: string;
  apply_date?: string;
  apply_type?: string;
  apply_status?: string;
  contract_type?: string;
  ven_uniform: string;
  ven_no: string;
  VEN_Name: string;
  VEN_Address?: string;
  contract_subno?: string;

  // 日期欄位
  tlt_bdate: string;
  tlt_edate: string;
  tlt_contract_bdate: string;
  tlt_contract_edate: string;
  feedback_date?: string | null;
  due_date?: string | null;
  contact_Date?: string | null;

  // 商務條件
  tlt_term_type: string;
  comm_comp_type: string;
  paper_type?: string;
  bus_type?: string;
  bus_class?: string;
  bus_sclass?: string;

  // 組織與聯絡
  org_id?: string;
  contact_USR_No?: string;
  contact_USR_Name?: string;

  // 重要：補齊後端期望的所有欄位
  deco_type?: string;
  money_type?: string;
  check_typeList?: string[];
  edc_yn?: string;
  tlt_openflag?: string;
  comm_yn?: string;
  rece_yn?: string;
  pos_yn?: string;
  cash_yn?: string;
  store_way?: string;
  paytype?: string;
  vip_yn?: string;

  // 費用相關
  base_rent?: number;
  deposit?: number;
  credit_card?: number;
  check_day?: number;
  open_fees?: number;
  total_amt?: number;
  total_amt_vendor?: number;
  construct_deposit?: string;
  construct_fees?: number;
  expiration_deposit?: string;
  expiration_fees?: number;
  open_deposit?: string;

  // 其他設定
  invoice_type?: string;
  tlt_kind?: string;
  tlt_ctype_mtotal?: string;
  overall_status?: string;
  rent_ahead?: string;
  rent_period?: number;
  water_flag?: string;
  electric_flag?: string;
  gas_flag?: string;
  cap_saletype1?: string;
  cap_saletype2?: string;
  cap_saletype3?: string;
  cap_saletype4?: string;
  cap_saletype5?: string;


  // 聯絡資訊
  email?: string;
  invoice_email?: string;
  CHECK_TITLE?: string;
  store_tel?: string;
  bank_id?: string;
  vendor_acct_name?: string;
  vendor_acct_no?: string;
  contact_tel?: string;
  contact_fax?: string;
  contact_addr?: string;
  company_addr?: string;
  tlt_remark?: string;
  ticket_remarks?: string;
  total_amt_unit?: string;
  total_amt_vendor_unit?: string;
  approve_status: string;

  // 位置資訊
  locationInfo: TLS12040LocationInfo[];
}

/**
 * 位置資訊
 */
export interface TLS12040LocationInfo {
  id?: number;
  location_no: string;
  tlt_building?: string;
  tlt_floor?: string;
  area_no?: string;
  tlt_space?: number;
  _status?: 'new' | 'modified' | 'deleted';
}

/**
 * 代扣款設定
 */
export interface TLS12040Deductions {
  toInsert: TLS12040FareItem[];
  toUpdate: TLS12040FareItem[];
  toDelete: TLS12040FareItem[];
}

/**
 * 代扣款項目
 */
export interface TLS12040FareItem {
  id?: number;
  cap_type: string;
  cap_item: string;
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
  tpy_rate?: number;
}

/**
 * 抽成設定
 */
export interface TLS12040Commissions {
  masters: TLS12040CommissionMasters;
  discountSettings: TLS12040CommissionDetails;
  annualSettings: TLS12040CommissionDetails;
  levelSettings: TLS12040CommissionDetails;
}

/**
 * 抽成主檔操作
 */
export interface TLS12040CommissionMasters {
  toInsert: TLS12040CommissionMaster[];
  toUpdate: TLS12040CommissionMaster[];
  toDelete: TLS12040CommissionMaster[];
}

/**
 * 抽成明細操作
 */
export interface TLS12040CommissionDetails {
  toInsert: any[];
  toUpdate: any[];
  toDelete: any[];
}

/**
 * 抽成主檔
 */
export interface TLS12040CommissionMaster {
  id?: number;
  tlt_id: string;
  tlt_id_desc: string;
  cag_taxtype: string;
  sst_amount?: number;
  sst_rate?: number;
  cap_saletype1?: string;
  cap_saletype2?: string;
  cap_saletype5?: string;
  cag_bdate: string;
  cag_edate: string;
}

/**
 * 條件設定
 */
export interface TLS12040Conditions {
  fixedRents: TLS12040ConditionOperations;
  baseRentHigher: TLS12040ConditionOperations;
  baseCommissions: TLS12040ConditionOperations;
  graduated: TLS12040ConditionOperations;
  baseTier: TLS12040ConditionOperations;
}

/**
 * 條件操作
 */
export interface TLS12040ConditionOperations {
  toInsert: any[];
  toUpdate: any[];
  toDelete: any[];
}

/**
 * 元數據
 */
export interface TLS12040Metadata {
  apply_no: string;
  contractId: string;
  commissionType: string;
  isNewContract: boolean;
  submittedAt: string;
  totalOperations: number;
}

/**
 * 抽成別變更資訊
 */
export interface TLS12040CommissionTypeChange {
  HasChanged: boolean;
  OriginalTermType: string;
  NewTermType: string;
  ClearOperations: TLS12040DataClearOperations;
}

/**
 * 資料清除操作
 */
export interface TLS12040DataClearOperations {
  clearRentDetails: boolean;
  clearCommissionMasters: boolean;
  clearChargedDetails: boolean;
  clearLimitDetails: boolean;
  clearLevelDetails: boolean;
}

// ========== 資料清理器 ==========

/**
 * TLS12040 資料清理器
 */
export class TLS12040DataCleanerClass {

  /**
   * 清理合約基本資料
   */
  static cleanContractInfo(rawData: any): TLS12040ContractData {
    console.log('🎯 開始清理合約基本資料的日期欄位...');

    const convertBooleanToYN = (value: any): string => {
      if (value === true || value === 'true' || value === 'Y') return 'Y';
      if (value === false || value === 'false' || value === 'N') return 'N';
      return 'N';
    };
    const locationSource = rawData.locationData || rawData.locationInfo || [];
    const cleanedData: TLS12040ContractData = {
      // 基本資料
      apply_no: rawData.apply_no || '',
      tlt_no: rawData.tlt_no,
      tlt_name: rawData.tlt_name || '',
      apply_date: this.formatDate(rawData.apply_date),
      apply_type: rawData.apply_type,
      apply_status: rawData.apply_status,
      approve_status: rawData.approve_status,
      contract_type: rawData.contract_type,
      ven_uniform: rawData.ven_uniform || '',
      ven_no: rawData.ven_no || '',
      VEN_Name: rawData.VEN_Name || '',
      contract_subno: rawData.contract_subno,

      // 重要：確保日期欄位為字串格式
      tlt_bdate: this.formatDate(rawData.tlt_bdate),
      tlt_edate: this.formatDate(rawData.tlt_edate),
      tlt_contract_bdate: this.formatDate(rawData.tlt_contract_bdate),
      tlt_contract_edate: this.formatDate(rawData.tlt_contract_edate),
      feedback_date: this.formatNullableDate(rawData.feedback_date),
      due_date: this.formatNullableDate(rawData.due_date),
      contact_Date: this.formatNullableDate(rawData.contact_Date),

      // 商務條件
      tlt_term_type: rawData.tlt_term_type || '3',
      comm_comp_type: rawData.comm_comp_type || '2',
      paper_type: rawData.paper_type,
      bus_type: rawData.bus_type,
      bus_class: rawData.bus_class,
      bus_sclass: rawData.bus_sclass,

      // 其他所有欄位保持不變...
      org_id: rawData.org_id,
      contact_USR_No: rawData.contact_USR_No,
      contact_USR_Name: rawData.contact_USR_Name,
      deco_type: rawData.deco_type,
      money_type: rawData.money_type,
      check_typeList: rawData.check_typeList || [],
      edc_yn: rawData.edc_yn,
      tlt_openflag: rawData.tlt_openflag,
      comm_yn: rawData.comm_yn,
      rece_yn: rawData.rece_yn,
      pos_yn: rawData.pos_yn,
      cash_yn: rawData.cash_yn,
      store_way: rawData.store_way,
      paytype: rawData.paytype,
      vip_yn: rawData.vip_yn,

      // 費用相關
      base_rent: this.parseNumber(rawData.base_rent),
      deposit: this.parseNumber(rawData.deposit),
      credit_card: this.parseNumber(rawData.credit_card),
      check_day: this.parseNumber(rawData.check_day) || 0,
      open_fees: this.parseNumber(rawData.open_fees),
      total_amt: this.parseNumber(rawData.total_amt),
      total_amt_vendor: this.parseNumber(rawData.total_amt_vendor),
      construct_deposit: (rawData.construct_deposit),
      construct_fees: this.parseNumber(rawData.construct_fees),
      expiration_deposit: (rawData.expiration_deposit),
      expiration_fees: this.parseNumber(rawData.expiration_fees),
      open_deposit: rawData.open_deposit,

      // 其他設定
      invoice_type: rawData.invoice_type,
      tlt_kind: rawData.tlt_kind,
      tlt_ctype_mtotal: rawData.tlt_ctype_mtotal,
      overall_status: rawData.overall_status,
      rent_ahead: rawData.rent_ahead,
      rent_period: this.parseNumber(rawData.rent_period),
      water_flag: rawData.water_flag || 'N',
      electric_flag: rawData.electric_flag || 'N',
      gas_flag: rawData.gas_flag || 'N',
      cap_saletype1: convertBooleanToYN(rawData.cap_saletype1),
      cap_saletype2: convertBooleanToYN(rawData.cap_saletype2),
      cap_saletype3: convertBooleanToYN(rawData.cap_saletype3),
      cap_saletype4: convertBooleanToYN(rawData.cap_saletype4),
      cap_saletype5: convertBooleanToYN(rawData.cap_saletype5),


      // 聯絡資訊
      email: rawData.email,
      invoice_email: rawData.invoice_email,
      CHECK_TITLE: rawData.CHECK_TITLE,
      store_tel: rawData.store_tel,
      bank_id: rawData.bank_id,
      vendor_acct_name: rawData.vendor_acct_name,
      vendor_acct_no: rawData.vendor_acct_no,
      contact_tel: rawData.contact_tel,
      contact_fax: rawData.contact_fax,
      contact_addr: rawData.contact_addr,
      VEN_Address: rawData.VEN_Address,
      company_addr: rawData.company_addr,
      tlt_remark: rawData.tlt_remark,
      ticket_remarks: rawData.ticket_remarks,
      total_amt_unit: rawData.total_amt_unit,
      total_amt_vendor_unit: rawData.total_amt_vendor_unit,

      // 位置資訊
      locationInfo: this.cleanLocationInfo(locationSource)
    };

    return cleanedData;
  }

  /**
   * 清理位置資訊
   */
  static cleanLocationInfo(rawLocations: any[]): TLS12040LocationInfo[] {
    return rawLocations
      .map(location => ({
        ...(this.hasValidId(location.id) ? { id: Number(location.id) } : {}),
        location_no: location.location_no || '',
        tlt_building: location.tlt_building,
        tlt_floor: location.tlt_floor,
        area_no: location.area_no,
        tlt_space: this.parseNumber(location.tlt_space),
        _status: location._status
      }));
  }

  /**
   * 清理代扣款資料
   */
  static cleanDeductionItems(rawItems: any[]): TLS12040Deductions {
    const toInsert: TLS12040FareItem[] = [];
    const toUpdate: TLS12040FareItem[] = [];
    const toDelete: TLS12040FareItem[] = [];

    console.log('🧹 DataCleaner 開始處理扣款項目:', {
      總數: rawItems.length,
      刪除狀態項目: rawItems.filter(item => item._status === 'deleted').length
    });

    rawItems.forEach(item => {
      // 刪除的項目處理
      if (item._status === 'deleted') {
        console.log('🗑️ 發現刪除項目:', {
          cap_item: item.cap_item,
          id: item.id,
          id_type: typeof item.id,
          hasValidId: this.hasValidId(item.id)
        });

        if (this.hasValidId(item.id)) {
          toDelete.push({ id: Number(item.id) } as TLS12040FareItem);
          console.log('✅ 加入 toDelete:', item.id);
        } else {
          console.warn('❌ ID 無效,未加入 toDelete:', item.id);
        }
        return;
      }

      // 只有被勾選的項目才處理新增/修改
      if (!item.is_selected) return;

      const cleanItem: TLS12040FareItem = {
        ...(this.hasValidId(item.id) ? { id: Number(item.id) } : {}),
        cap_type: item.cap_type || '',
        cap_item: item.cap_item || '',
        tpy_bdate: this.formatCompactDate(item.tpy_bdate),
        tpy_edate: this.formatCompactDate(item.tpy_edate),
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
        tpy_rate: this.parseNumber(item.tpy_rate)
      };

      switch (item._status) {
        case 'new':
          toInsert.push(cleanItem);
          break;
        case 'modified':
          toUpdate.push(cleanItem);
          break;
      }
    });

    return { toInsert, toUpdate, toDelete };
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
      let dateObj: Date;
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        if (date.includes('T')) {
          dateObj = new Date(date);
        } else {
          dateObj = new Date(date);
        }
      } else {
        dateObj = new Date(date);
      }
      if (isNaN(dateObj.getTime())) return '';

      // 使用本地時間組成 YYYY-MM-DD
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  }

  private static formatNullableDate(date: any): string | null {
    if (!date || date === '') return null;
    const formatted = this.formatDate(date);
    return formatted === '' ? null : formatted;
  }

  private static formatCompactDate(date: any): string {
    if (!date) return '';

    try {
      let dateObj: Date;
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        if (/^\d{6}$/.test(date)) {
          return date; // 已經是 YYYYMM 格式
        } else if (/^\d{8}$/.test(date)) {
          return date.substring(0, 6); // YYYYMMDD 格式，取前6位
        } else {
          dateObj = new Date(date);
        }
      } else {
        dateObj = new Date(date);
      }

      if (isNaN(dateObj.getTime())) {
        console.warn('無效的代扣款日期值:', date);
        return '';
      }

      // 格式化為緊湊年月格式 YYYYMM
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      return `${year}${month}`;

    } catch (error) {
      console.error('代扣款日期格式化錯誤:', error, date);
      return '';
    }
  }

  private static parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }
}
