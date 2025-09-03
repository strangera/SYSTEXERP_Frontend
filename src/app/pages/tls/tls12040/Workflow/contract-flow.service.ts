import { Injectable } from '@angular/core';
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
      construct_deposit: data.construct_deposit || 0,
      construct_fees: data.construct_fees || 0,
      expiration_deposit: data.expiration_deposit || 0,
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
      company_register_address: data.company_register_address || '',
      locationInfo: data.locationInfo || []
    };
  }
  validate(data: any): boolean {
    return !!(data.apply_no && data.tlt_name);
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
    return {
      commissionSettings: data.commissionSettings || [],
      commissionType: data.commissionType || '',
      additionalSettings: data.additionalSettings || {}
    };
  }

  validate(data: any): boolean {
    return !!(data.commissionType);
  }
}

class Next3DataCleaner implements TLS12040DataCleaner {
  clean(data: any) {
    return {
      finalSettings: data.finalSettings || {},
      submitReady: data.submitReady || false
    };
  }

  validate(data: any): boolean {
    return data.submitReady === true;
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
  getNext1Data = <T>() => this.getStepData<T>('next1');

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
    const requiredSteps = ['cru', 'next1'];  // 必要步驟

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

  // ========== 清理方法 - 超級簡化 ==========

  /**
   * 清空所有資料
   */
  clearAll(): void {
    this._state = this.createInitialState();
    this.CRUDStatus$.next(CRUDStatus.Edit);  // 重置為編輯模式
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
      status: CRUDStatus.Edit,  // 預設編輯模式
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
        this._state = {
          ...data,
          stepData: new Map(data.stepData),
          completedSteps: new Set(data.completedSteps)
        };
        this.notifyStateChange();
      }
    } catch (error) {
      console.warn('載入失敗:', error);
    }
  }
}
