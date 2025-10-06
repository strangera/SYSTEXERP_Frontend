import { TLS12040SubmitData, TLS12040DataCleanerClass } from './../models/tls12040submit.model';
import { Injectable } from '@angular/core';
import { TLS12040DetailModel } from '@pages/tls/tls12040-cru/models/tls12040-cru.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { BehaviorSubject } from 'rxjs';
// 核心資料介面 - 用 interface 控制結構
export interface TLS12040CoreData {
  readonly applyNo: string;
  readonly contractId: string;
  readonly isNewContract: boolean;
}

// 各步驟資料介面 - 簡化版
export interface TLS12040StepData<T = any> {
  readonly stepName: string;
  readonly data: T;
  readonly timestamp: Date;
  readonly isValid: boolean;
}

// 完整流程資料 - 用 Map 管理避免複雜的物件結構
export interface TLS12040FlowState extends TLS12040CoreData {
  readonly currentStep: string;
  readonly completedSteps: Set<string>;
  readonly stepData: Map<string, TLS12040StepData>;
  readonly status: CRUDStatus;
  readonly metadata: {
    readonly createdAt: Date;
    readonly lastModified: Date;
    readonly version: number;
  };
}

// 資料清理介面 - 統一清理邏輯
export interface TLS12040DataCleaner<T = any> {
  clean(data: any): T;
  validate(data: T): boolean;
}

// 各步驟的資料清理器
class CruDataCleaner implements TLS12040DataCleaner {
  clean(data: any) {
    return {
      apply_no: data.apply_no || '',
      apply_date: data.apply_date || '',
      apply_status: data.apply_status || '',
      apply_type: data.apply_type || '',
      contract_type: data.contract_type || '',
      tlt_no: data.tlt_no || '',
      tlt_name: data.tlt_name || '',
      ven_uniform: data.ven_uniform || '',
      ven_no: data.ven_no || '',
      VEN_Name: data.VEN_Name || '',
      contract_subno: data.contract_subno || '',
      tlt_bdate: data.tlt_bdate || '',
      tlt_edate: data.tlt_edate || '',
      tlt_contract_bdate: data.tlt_contract_bdate || '',
      tlt_contract_edate: data.tlt_contract_edate || '',
      feedback_date: data.feedback_date || '',
      due_date: data.due_date || '',
      contact_Date: data.contact_Date || '',
      tlt_term_type: data.tlt_term_type || '',
      comm_comp_type: data.comm_comp_type || '',
      paper_type: data.paper_type || '',
      bus_type: data.bus_type || '',
      bus_class: data.bus_class || '',
      bus_sclass: data.bus_sclass || '',
      org_id: data.org_id || '',
      contact_USR_No: data.contact_USR_No || '',
      contact_USR_Name: data.contact_USR_Name || '',
      deco_type: data.deco_type || '',
      money_type: data.money_type || '',
      check_typeList: data.check_typeList || [],
      edc_yn: data.edc_yn || '',
      tlt_openflag: data.tlt_openflag || '',
      comm_yn: data.comm_yn || '',
      rece_yn: data.rece_yn || '',
      pos_yn: data.pos_yn || '',
      cash_yn: data.cash_yn || '',
      store_way: data.store_way || '',
      paytype: data.paytype || '',
      vip_yn: data.vip_yn || '',
      base_rent: data.base_rent || 0,
      deposit: data.deposit || 0,
      credit_card: data.credit_card || 0,
      check_day: data.check_day || 0,
      open_fees: data.open_fees || 0,
      total_amt: data.total_amt || 0,
      total_amt_vendor: data.total_amt_vendor || 0,
      construct_deposit: data.construct_deposit || '',
      construct_fees: data.construct_fees || 0,
      expiration_deposit: data.expiration_deposit || '',
      expiration_fees: data.expiration_fees || 0,
      open_deposit: data.open_deposit || '',
      invoice_type: data.invoice_type || '',
      tlt_kind: data.tlt_kind || '',
      tlt_ctype_mtotal: data.tlt_ctype_mtotal || '',
      overall_status: data.overall_status || '',
      rent_ahead: data.rent_ahead || '',
      rent_period: data.rent_period || 0,
      water_flag: data.water_flag || '',
      electric_flag: data.electric_flag || '',
      gas_flag: data.gas_flag || '',
      cap_saletype1: data.cap_saletype1 || '',
      cap_saletype2: data.cap_saletype2 || '',
      cap_saletype3: data.cap_saletype3 || '',
      cap_saletype4: data.cap_saletype4 || '',
      email: data.email || '',
      invoice_email: data.invoice_email || '',
      CHECK_TITLE: data.CHECK_TITLE || '',
      store_tel: data.store_tel || '',
      bank_id: data.bank_id || '',
      vendor_acct_name: data.vendor_acct_name || '',
      vendor_acct_no: data.vendor_acct_no || '',
      contact_tel: data.contact_tel || '',
      contact_fax: data.contact_fax || '',
      contact_addr: data.contact_addr || '',
      company_addr: data.company_addr || '',
      tlt_remark: data.tlt_remark || '',
      ticket_remarks: data.ticket_remarks || '',
      total_amt_unit: data.total_amt_unit || '',
      total_amt_vendor_unit: data.total_amt_vendor_unit || '',
      approve_status: data.approve_status || '',
      VEN_Address: data.VEN_Address || '',
      locationData: Array.isArray(data.locationData) ?
        data.locationData
          .filter((item: any) => {
            const hasLocationNo = item.location_no && item.location_no.trim() !== '';
            if (!hasLocationNo) {
              console.log('過濾掉空位置編號的資料:', item);
            }
            return hasLocationNo;
          })
          .map((item: any) => ({
            id: item.id || '',
            apply_no: item.apply_no || '',
            location_no: item.location_no.trim(),
            tlt_building: item.tlt_building || '',
            tlt_floor: item.tlt_floor || '',
            area_no: item.area_no || '',
            tlt_space: Number(item.tlt_space) || 0,
            building_desc: item.building_desc || '',
            floor_desc: item.floor_desc || '',
            area_desc: item.area_desc || '',
            _status: item._status || 'original',
            _isNew: Boolean(item._isNew)
          })) : []
    };
  }
  validate(data: any): boolean {
    return true;
  }
}

class Next1DataCleaner implements TLS12040DataCleaner {
  clean(data: any) {
    return {
      fareData: data.fareData || {},
      selectedItems: (data.selectedItems || []).filter((item: any) => item.is_selected),
      contractInfo: data.contractInfo || null
    };
  }

  validate(data: any): boolean {
    return !!(data.selectedItems && data.selectedItems.length > 0);
  }
}

class Next2DataCleaner implements TLS12040DataCleaner {
  clean(data: any) {
    console.log('Next2DataCleaner 清理資料:', data);

    return {
      // 主要的抽成設定資料
      commissionData: Array.isArray(data.commissionData) ? data.commissionData : (data.commissionSettings || []),
      // 當前選擇的標籤
      selectedSettingTab: data.selectedSettingTab || 'discount',
      // 當前的抽成類型
      currentCommissionType: data.currentCommissionType || data.commissionType || '3',
      // 合約資訊
      contractInfoData: data.contractInfoData || data.contractInfo || [],
      // 當前申請編號
      currentApplyNo: data.currentApplyNo || data.apply_no || '',
      // 額外設定
      additionalSettings: data.additionalSettings || {},
      // 儲存時間戳
      savedAt: new Date().toISOString()
    };
  }

  validate(data: any): boolean {
    const hasCommissionData = data.commissionData && Array.isArray(data.commissionData);
    const hasApplyNo = data.currentApplyNo && data.currentApplyNo.trim() !== '';

    console.log('Next2DataCleaner 驗證結果:', {
      hasCommissionData,
      hasApplyNo,
      dataLength: data.commissionData?.length || 0
    });

    return hasCommissionData || hasApplyNo;
  }
}

class Next3DataCleaner implements TLS12040DataCleaner {
  clean(data: any) {
    console.log('Next3DataCleaner 清理資料:', data);

    // Next3 儲存的是條件項目陣列，直接返回
    if (Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        // 確保所有必要屬性都存在
        _status: item._status || 'original',
        _fromNext2: item._fromNext2 || false,
        _readonly: item._readonly || false
      }));
    }

    // 如果是舊格式或空資料，返回空陣列
    return [];
  }

  validate(data: any): boolean {
    // Next3 的驗證：至少要有條件項目陣列（可以是空的）
    const isValid = Array.isArray(data);

    console.log('Next3DataCleaner 驗證結果:', {
      isValid,
      dataType: Array.isArray(data) ? 'array' : typeof data,
      itemCount: Array.isArray(data) ? data.length : 0
    });

    return isValid;
  }
}

@Injectable({
  providedIn: 'root'
})
export class TLS12040FlowService {
  private readonly STORAGE_KEY = 'TLS12040_FLOW';

  // 新增 CRUDStatus$ 屬性
  public CRUDStatus$ = new BehaviorSubject<CRUDStatus>(CRUDStatus.Edit);

  // 使用 readonly 的 state，避免外部直接修改
  private _state: TLS12040FlowState = this.createInitialState();

  // 資料清理器 Map - 避免大量 switch case
  private readonly cleaners = new Map<string, TLS12040DataCleaner>([
    ['cru', new CruDataCleaner()],
    ['next1', new Next1DataCleaner()],
    ['next2', new Next2DataCleaner()],
    ['next3', new Next3DataCleaner()]
  ]);

  // 狀態變更通知
  private stateSubject = new BehaviorSubject<TLS12040FlowState>(this._state);
  public state$ = this.stateSubject.asObservable();

  // 檢視模式
  private viewModeSubject = new BehaviorSubject<boolean>(false);
  public isViewMode$ = this.viewModeSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  // ========== 核心方法 - 用 interface 簡化 ==========

  /**
   * 開始工作流程 - 統一入口
   */
  startFlow(coreData: Pick<TLS12040CoreData, 'applyNo' | 'isNewContract'>, initialData?: any): void {
    const contractId = coreData.isNewContract
      ? `new_${Date.now()}`
      : coreData.applyNo;

    this._state = {
      ...coreData,
      contractId,
      currentStep: 'cru',
      completedSteps: new Set<string>(),
      stepData: new Map(),
      status: CRUDStatus.Edit,
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: 1
      }
    };

    // 如果有初始資料，直接設定
    if (initialData) {
      this.setStepData('cru', initialData);
    }

    this.notifyStateChange();
    this.saveToStorage();
  }

  /**
   * 設定步驟資料 - 統一方法，自動清理
   */
  setStepData<T>(stepName: string, rawData: any): boolean {
    if (this.viewModeSubject.value) {
      console.log('檢視模式，跳過資料儲存');
      return false;
    }

    const cleaner = this.cleaners.get(stepName);
    if (!cleaner) {
      console.error(`找不到步驟 ${stepName} 的資料清理器`);
      return false;
    }

    try {
      // 自動清理資料
      const cleanedData = cleaner.clean(rawData);
      const isValid = cleaner.validate(cleanedData);

      const stepData: TLS12040StepData<T> = {
        stepName,
        data: cleanedData,
        timestamp: new Date(),
        isValid
      };

      // 更新 state - 創建新物件保持 immutable
      const newStepData = new Map(this._state.stepData);
      newStepData.set(stepName, stepData);

      const newCompletedSteps = new Set(this._state.completedSteps);
      if (isValid) {
        newCompletedSteps.add(stepName);
      }

      this._state = {
        ...this._state,
        stepData: newStepData,
        completedSteps: newCompletedSteps,
        currentStep: this.getNextStep(stepName),
        metadata: {
          ...this._state.metadata,
          lastModified: new Date(),
          version: this._state.metadata.version + 1
        }
      };

      this.notifyStateChange();
      this.saveToStorage();
      return true;

    } catch (error) {
      console.error(`步驟 ${stepName} 資料清理失敗:`, error);
      return false;
    }
  }

  /**
   * 取得步驟資料 - 統一方法
   */
  getStepData<T>(stepName: string): T | null {
    const stepData = this._state.stepData.get(stepName);
    return stepData?.data as T || null;
  }

  /**
   * 檢查步驟是否完成
   */
  isStepCompleted(stepName: string): boolean {
    return this._state.completedSteps.has(stepName);
  }

  /**
   * 取得當前狀態 - 唯讀
   */
  getCurrentState(): Readonly<TLS12040FlowState> {
    return this._state;
  }

  // ========== 便利方法 ==========

  // CRU 資料
  setCruData = (data: any) => this.setStepData('cru', data);
  getCruData = <T>() => this.getStepData<T>('cru');

  // Next1 資料
  setNext1Data = (data: any) => this.setStepData('next1', data);
  getNext1Data<T>(): T | null {
    console.log('取得 Next1 資料，當前 stepData:', this._state.stepData);

    const stepData = this._state.stepData.get('next1');
    if (stepData && stepData.data) {
      console.log('找到 Next1 資料:', stepData.data);
      return stepData.data as T;
    }

    console.log('沒有 Next1 資料');
    return null;
  }

  // Next2 資料
  setNext2Data = (data: any) => this.setStepData('next2', data);
  getNext2Data = <T>() => this.getStepData<T>('next2');

  // Next3 資料
  setNext3Data = (data: any) => this.setStepData('next3', data);
  getNext3Data = <T>() => this.getStepData<T>('next3');

  // ========== 檢視模式 ==========

  setViewMode(isViewMode: boolean): void {
    this.viewModeSubject.next(isViewMode);
  }

  isViewMode(): boolean {
    return this.viewModeSubject.value;
  }

  // ========== 資料驗證和提交 ==========

  /**
   * 驗證所有步驟資料
   */
  validateAllSteps(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredSteps = ['cru', 'next1'];

    for (const stepName of requiredSteps) {
      if (!this.isStepCompleted(stepName)) {
        errors.push(`步驟 ${stepName} 未完成`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 產生提交資料 - 自動整理所有步驟
   */
  generateSubmitData(): any {
    const submitData: any = {
      metadata: {
        applyNo: this._state.applyNo,
        contractId: this._state.contractId,
        isNewContract: this._state.isNewContract,
        submittedAt: new Date()
      }
    };

    // 自動收集所有步驟的已清理資料
    this._state.stepData.forEach((stepData, stepName) => {
      submitData[stepName] = stepData.data;
    });

    return submitData;
  }

  /**
   * 生成 TLS12040 專用的提交資料
   */
  generateTLS12040SubmitData(): TLS12040SubmitData {
    console.log('開始生成 TLS12040 提交資料...');

    // 取得各步驟資料
    const cruData = this.getCruData<TLS12040DetailModel>();
    const next1Data = this.getNext1Data();
    const next2Data = this.getNext2Data();
    const next3Data = this.getNext3Data();

    console.log('原始資料檢查:', {
      hasCruData: !!cruData,
      hasNext1Data: !!next1Data,
      hasNext2Data: !!next2Data,
      hasNext3Data: !!next3Data
    });

    // 1. 處理合約基本資料
    const contractInfo = {
      operation: this._state.isNewContract ? 'INSERT' as const : 'UPDATE' as const,
      data: TLS12040DataCleanerClass.cleanContractInfo(cruData)
    };

    // 2. 處理代扣款資料 (來自 Next1)
    const deductions = this.processNext1DeductionData(next1Data);

    // 3. 處理抽成資料 (來自 Next2)
    const commissions = this.processNext2CommissionData(next2Data);

    // 4. 處理條件資料 (來自 Next3)
    const conditions = this.processNext3ConditionData(next3Data);

    // 5. 生成元數據
    const metadata = {
      apply_no: this._state.applyNo,
      contractId: this._state.contractId,
      commissionType: cruData?.tlt_term_type || '3',
      isNewContract: this._state.isNewContract,
      submittedAt: new Date().toISOString(),
      totalOperations: this.calculateTotalOperations(deductions, commissions, conditions)
    };

    const submitData: TLS12040SubmitData = {
      contractInfo,
      deductions,
      commissions,
      conditions,
      metadata,
      commissionTypeChange: null
    };

    console.log('TLS12040 提交資料生成完成:', {
      contractOperation: submitData.contractInfo.operation,
      applyNo: submitData.metadata.apply_no,
      totalOperations: submitData.metadata.totalOperations,
      commissionType: submitData.metadata.commissionType
    });

    return submitData;
  }

  /**
   * 處理 Next1 代扣款資料
   */
  private processNext1DeductionData(next1Data: any): any {
    console.log('處理 Next1 代扣款資料...');

    if (!next1Data?.selectedItems) {
      console.log('沒有 Next1 代扣款資料');
      return { toInsert: [], toUpdate: [], toDelete: [] };
    }

    return TLS12040DataCleanerClass.cleanDeductionItems(next1Data.selectedItems);
  }

  /**
   * 處理 Next2 抽成資料
   */
  private processNext2CommissionData(next2Data: any): any {
    console.log('處理 Next2 抽成資料...');

    if (!next2Data?.commissionData) {
      console.log('沒有 Next2 抽成資料');
      return {
        masters: { toInsert: [], toUpdate: [], toDelete: [] },
        discountSettings: { toInsert: [], toUpdate: [], toDelete: [] },
        annualSettings: { toInsert: [], toUpdate: [], toDelete: [] },
        levelSettings: { toInsert: [], toUpdate: [], toDelete: [] }
      };
    }

    const commissionData = next2Data.commissionData;
    const masters = { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] };
    const discountSettings = { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] };
    const annualSettings = { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] };
    const levelSettings = { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] };

    commissionData.forEach((commission: any) => {
      // 處理主檔
      if (commission._status === 'deleted') {
        if (this.hasValidId(commission.id)) {
          masters.toDelete.push({ id: Number(commission.id) } as any);
        }
        return;
      }

      const cleanMaster = {
        ...(this.hasValidId(commission.id) ? { id: Number(commission.id) } : {}),
        tlt_id: commission.tlt_id || '',
        tlt_id_desc: commission.tlt_id_desc || '',
        cag_taxtype: commission.cag_taxtype === 1 ? '1' : '0',
        sst_amount: this.parseNumber(commission.sst_amount),
        sst_rate: this.parseNumber(commission.sst_rate),
        cap_saletype1: commission.cap_saletype1 === true || commission.cap_saletype1 === 'Y' ? 'Y' : 'N',
        cap_saletype2: commission.cap_saletype2 === true || commission.cap_saletype2 === 'Y' ? 'Y' : 'N',
        cag_bdate: this.formatDate(commission.cag_bdate),
        cag_edate: this.formatDate(commission.cag_edate)
      };

      switch (commission._status) {
        case 'new':
          masters.toInsert.push(cleanMaster);
          break;
        case 'modified':
          masters.toUpdate.push(cleanMaster);
          break;
      }

      // 處理各種明細
      this.processCommissionDetails(commission, discountSettings, annualSettings, levelSettings);
    });

    return { masters, discountSettings, annualSettings, levelSettings };
  }

  /**
   * 處理抽成明細
   */
  private processCommissionDetails(
    commission: any,
    discountSettings: any,
    annualSettings: any,
    levelSettings: any
  ): void {
    // 處理折扣設定明細
    commission.ChargeDetails?.forEach((detail: any) => {
      if (!detail.is_selected && this.hasValidId(detail.id)) {
        discountSettings.toDelete.push({ id: Number(detail.id) } as any);
        return;
      }

      if (!detail.is_selected && !this.hasValidId(detail.id)) {
        return;
      }

      const cleanDetail = {
        ...(this.hasValidId(detail.id) ? { id: Number(detail.id) } : {}),
        tlt_id: commission.tlt_id || '',
        cag_barcode: detail.cag_barcode || '',
        tlt_bdate: this.formatDate(detail.tlt_bdate),
        tlt_edate: this.formatDate(detail.tlt_edate),
        cag_charge_rate: this.parseNumber(detail.cag_charge_rate) || 0
      };

      switch (detail._status) {
        case 'new':
          discountSettings.toInsert.push(cleanDetail);
          break;
        case 'modified':
          discountSettings.toUpdate.push(cleanDetail);
          break;
        case 'deleted':
          if (this.hasValidId(detail.id)) {
            discountSettings.toDelete.push({ id: Number(detail.id) } as any);
          }
          break;
      }
    });

    // 處理年度業績明細
    commission.YearChargeDetails?.forEach((detail: any) => {
      const cleanAnnual = {
        ...(this.hasValidId(detail.id) ? { id: Number(detail.id) } : {}),
        tlt_id: commission.tlt_id || '',
        tlt_bdate: this.formatDate(detail.tlt_bdate),
        tlt_edate: this.formatDate(detail.tlt_edate),
        year_amount: this.parseNumber(detail.year_amount) || 0,
        extra_rate: this.parseNumber(detail.extra_rate) || 0
      };

      switch (detail._status) {
        case 'new':
          annualSettings.toInsert.push(cleanAnnual);
          break;
        case 'modified':
          annualSettings.toUpdate.push(cleanAnnual);
          break;
        case 'deleted':
          if (this.hasValidId(detail.id)) {
            annualSettings.toDelete.push({ id: Number(detail.id) });
          }
          break;
      }
    });

    // 處理層級抽成明細
    commission.LevelChargeDetails?.forEach((detail: any, index: number) => {
      if (!detail.is_selected && this.hasValidId(detail.id)) {
        levelSettings.toDelete.push({ id: Number(detail.id) });
        return;
      }

      if (!detail.is_selected && !this.hasValidId(detail.id)) {
        return;
      }

      const cleanLevel = {
        ...(this.hasValidId(detail.id) ? { id: Number(detail.id) } : {}),
        tlt_id: commission.tlt_id || '',
        seq_no: index + 1,
        cag_barcode: detail.cag_barcode || '',
        level_bmount: this.parseNumber(detail.level_bmount) || 0,
        level_eamount: this.parseNumber(detail.level_eamount) || 0,
        level_charge_rate: this.parseNumber(detail.level_charge_rate) || 0
      };

      switch (detail._status) {
        case 'new':
          levelSettings.toInsert.push(cleanLevel);
          break;
        case 'modified':
          levelSettings.toUpdate.push(cleanLevel);
          break;
        case 'deleted':
          if (this.hasValidId(detail.id)) {
            levelSettings.toDelete.push({ id: Number(detail.id) });
          }
          break;
      }
    });
  }

  /**
   * 處理 Next3 條件資料
   */
  private processNext3ConditionData(next3Data: any): any {
    console.log('處理 Next3 條件資料...');

    if (!next3Data || !Array.isArray(next3Data)) {
      console.log('沒有 Next3 條件資料');
      return {
        fixedRents: { toInsert: [], toUpdate: [], toDelete: [] },
        baseRentHigher: { toInsert: [], toUpdate: [], toDelete: [] },
        baseCommissions: { toInsert: [], toUpdate: [], toDelete: [] },
        graduated: { toInsert: [], toUpdate: [], toDelete: [] },
        baseTier: { toInsert: [], toUpdate: [], toDelete: [] }
      };
    }

    const result = {
      fixedRents: { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] },
      baseRentHigher: { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] },
      baseCommissions: { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] },
      graduated: { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] },
      baseTier: { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] }
    };

    next3Data.forEach((condition: any) => {
      if (condition._status === 'deleted') {
        this.handleDeletedCondition(condition, result);
        return;
      }

      // 根據條件類型分類處理
      if ('base_rent' in condition && 'cag_charge_rate' in condition) {
        this.processBaseRentHigherCondition(condition, result.baseRentHigher);
      } else if ('base_rent' in condition) {
        this.processFixedRentCondition(condition, result.fixedRents);
      } else if ('limit_amt' in condition && 'seq_no' in condition) {
        this.processBaseTierCondition(condition, result.baseTier);
      } else if ('limit_amt' in condition) {
        this.processBaseCommissionCondition(condition, result.baseCommissions);
      } else if ('seq_no' in condition) {
        this.processGraduatedCondition(condition, result.graduated);
      }
    });

    return result;
  }

  /**
   * 處理被刪除的條件
   */
  private handleDeletedCondition(condition: any, result: any): void {
    if (!this.hasValidId(condition.id)) return;

    const deleteItem = { id: Number(condition.id) } as any;

    if ('base_rent' in condition && 'cag_charge_rate' in condition) {
      result.baseRentHigher.toDelete.push(deleteItem);
    } else if ('base_rent' in condition) {
      result.fixedRents.toDelete.push(deleteItem);
    } else if ('limit_amt' in condition && 'seq_no' in condition) {
      result.baseTier.toDelete.push(deleteItem);
    } else if ('limit_amt' in condition) {
      result.baseCommissions.toDelete.push(deleteItem);
    } else if ('seq_no' in condition) {
      result.graduated.toDelete.push(deleteItem);
    }
  }

  /**
   * 處理固定租金條件
   */
  private processFixedRentCondition(condition: any, operations: any): void {
    const cleanItem = {
      ...(this.hasValidId(condition.id) ? { id: Number(condition.id) } : {}),
      talent_id: condition.talent_id || '',
      tlt_id: condition.tlt_id || '',
      cag_bdate: this.formatDate(condition.cag_bdate),
      cag_edate: this.formatDate(condition.cag_edate),
      base_rent: this.parseNumber(condition.base_rent) || 0
    };

    if (condition._status === 'new') {
      operations.toInsert.push(cleanItem);
    } else if (condition._status === 'modified') {
      operations.toUpdate.push(cleanItem);
    }
  }

  /**
   * 處理底租抽成取高者條件
   */
  private processBaseRentHigherCondition(condition: any, operations: any): void {
    const cleanItem = {
      ...(this.hasValidId(condition.id) ? { id: Number(condition.id) } : {}),
      apply_no: condition.apply_no || '',
      tlt_id: condition.tlt_id || '',
      cag_bdate: this.formatDate(condition.cag_bdate),
      cag_edate: this.formatDate(condition.cag_edate),
      base_rent: this.parseNumber(condition.base_rent) || 0,
      cag_charge_rate: this.parseNumber(condition.cag_charge_rate) || 0
    };

    if (condition._status === 'new') {
      operations.toInsert.push(cleanItem);
    } else if (condition._status === 'modified') {
      operations.toUpdate.push(cleanItem);
    }
  }

  /**
   * 處理包底抽成條件
   */
  private processBaseCommissionCondition(condition: any, operations: any): void {
    const cleanItem = {
      ...(this.hasValidId(condition.id) ? { id: Number(condition.id) } : {}),
      apply_no: condition.apply_no || '',
      tlt_id: condition.tlt_id || '',
      cag_bdate: this.formatDate(condition.cag_bdate),
      cag_edate: this.formatDate(condition.cag_edate),
      limit_amt: this.parseNumber(condition.limit_amt) || 0,
      limit_charge_rate: this.parseNumber(condition.limit_charge_rate) || 0
    };

    if (condition._status === 'new') {
      operations.toInsert.push(cleanItem);
    } else if (condition._status === 'modified') {
      operations.toUpdate.push(cleanItem);
    }
  }

  /**
   * 處理層級抽成條件
   */
  private processGraduatedCondition(condition: any, operations: any): void {
    const cleanItem = {
      ...(this.hasValidId(condition.id) ? { id: Number(condition.id) } : {}),
      apply_no: condition.apply_no || '',
      seq_no: condition.seq_no || 0,
      cag_bdate: this.formatDate(condition.cag_bdate),
      cag_edate: this.formatDate(condition.cag_edate),
      start_number: this.parseNumber(condition.start_number) || 0,
      end_number: this.parseNumber(condition.end_number) || 0,
      charge_rate: this.parseNumber(condition.charge_rate) || 0
    };

    if (condition._status === 'new') {
      operations.toInsert.push(cleanItem);
    } else if (condition._status === 'modified') {
      operations.toUpdate.push(cleanItem);
    }
  }

  /**
   * 處理包底加層級條件
   */
  private processBaseTierCondition(condition: any, operations: any): void {
    const cleanItem = {
      ...(this.hasValidId(condition.id) ? { id: Number(condition.id) } : {}),
      apply_no: condition.apply_no || '',
      seq_no: condition.seq_no || 0,
      ...(condition.tlt_id ? { tlt_id: condition.tlt_id } : {}),
      cag_bdate: this.formatDate(condition.cag_bdate),
      cag_edate: this.formatDate(condition.cag_edate),
      limit_amt: this.parseNumber(condition.limit_amt) || 0,
      start_number: this.parseNumber(condition.start_number) || 0,
      end_number: this.parseNumber(condition.end_number) || 0,
      charge_rate: this.parseNumber(condition.charge_rate) || 0
    };

    if (condition._status === 'new') {
      operations.toInsert.push(cleanItem);
    } else if (condition._status === 'modified') {
      operations.toUpdate.push(cleanItem);
    }
  }

  /**
   * 計算總操作數
   */
  private calculateTotalOperations(deductions: any, commissions: any, conditions: any): number {
    let total = 0;

    // 計算代扣款操作數
    total += deductions.toInsert.length + deductions.toUpdate.length + deductions.toDelete.length;

    // 計算抽成操作數
    total += commissions.masters.toInsert.length + commissions.masters.toUpdate.length + commissions.masters.toDelete.length;
    total += commissions.discountSettings.toInsert.length + commissions.discountSettings.toUpdate.length + commissions.discountSettings.toDelete.length;
    total += commissions.annualSettings.toInsert.length + commissions.annualSettings.toUpdate.length + commissions.annualSettings.toDelete.length;
    total += commissions.levelSettings.toInsert.length + commissions.levelSettings.toUpdate.length + commissions.levelSettings.toDelete.length;

    // 計算條件操作數
    Object.values(conditions).forEach((operation: any) => {
      total += operation.toInsert.length + operation.toUpdate.length + operation.toDelete.length;
    });

    return total;
  }

  // ========== 清理方法 - 超級簡化 ==========

  /**
   * 清空所有資料
   */
  clearAll(): void {
    this._state = this.createInitialState();
    this.CRUDStatus$.next(CRUDStatus.Edit);
    this.notifyStateChange();
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * 提交成功後清理
   */
  onSubmitSuccess = () => this.clearAll();

  // ========== 私有輔助方法 ==========

  private createInitialState(): TLS12040FlowState {
    return {
      applyNo: '',
      contractId: '',
      isNewContract: true,
      currentStep: 'cru',
      completedSteps: new Set(),
      stepData: new Map(),
      status: CRUDStatus.Edit,
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: 1
      }
    };
  }

  private getNextStep(currentStep: string): string {
    const stepOrder = ['cru', 'next1', 'next2', 'next3'];
    const currentIndex = stepOrder.indexOf(currentStep);
    return stepOrder[currentIndex + 1] || currentStep;
  }

  private notifyStateChange(): void {
    this.stateSubject.next(this._state);
  }

  // 輔助方法
  private hasValidId(id: any): boolean {
    return id &&
      !String(id).startsWith('temp_') &&
      !String(id).includes('new_') &&
      !isNaN(Number(id)) &&
      Number(id) > 0;
  }

  private formatDate(date: any): string {
    if (!date) return '';
    try {
      let dateObj: Date;
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else {
        dateObj = new Date(date);
      }
      if (isNaN(dateObj.getTime())) return '';

      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  }

  private parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  // ========== 儲存載入 - 簡化版 ==========

  private saveToStorage(): void {
    try {
      // 將 Map 和 Set 轉為可序列化的格式
      const serializable = {
        ...this._state,
        stepData: Array.from(this._state.stepData.entries()),
        completedSteps: Array.from(this._state.completedSteps)
      };
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializable));
    } catch (error) {
      console.warn('儲存失敗:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = sessionStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        console.log('從 SessionStorage 載入的原始資料:', data);

        // 重建 Map 結構
        const stepDataMap = new Map();
        if (data.stepData && Array.isArray(data.stepData)) {
          data.stepData.forEach(([key, value]: [string, any]) => {
            stepDataMap.set(key, value);
          });
        }

        // 重建 Set 結構
        const completedStepsSet = new Set();
        if (data.completedSteps && Array.isArray(data.completedSteps)) {
          data.completedSteps.forEach((step: string) => {
            completedStepsSet.add(step);
          });
        }

        // 修正：從 CRU 資料取得正確的 applyNo
        let correctedApplyNo = data.applyNo || '';
        const cruStepData = stepDataMap.get('cru');
        if (cruStepData?.data?.apply_no && !correctedApplyNo) {
          correctedApplyNo = cruStepData.data.apply_no;
          console.log('從 CRU 資料修正 applyNo:', correctedApplyNo);
        }

        // 修正：根據是否有 apply_no 決定 isNewContract
        const correctedIsNewContract = !correctedApplyNo || correctedApplyNo === '';

        this._state = {
          ...data,
          stepData: stepDataMap,
          completedSteps: completedStepsSet,
          applyNo: correctedApplyNo,
          isNewContract: correctedIsNewContract,
          contractId: correctedIsNewContract ? data.contractId : correctedApplyNo
        };

        this.notifyStateChange();
        console.log('載入並修正完成，最終狀態:', this._state);
      }
    } catch (error) {
      console.error('載入失敗:', error);
    }
  }
}
