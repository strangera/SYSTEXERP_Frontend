// contract-flow.service.ts (修改後版本)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseCommissionCondition, BaseRentHigherCondition, BaseTierCondition, CommissionItem, ConditionDataItem, ConditionItem, ContractInfo, FareItem, FinalData, FixedRentCondition, GraduatedCommissionCondition } from '../tls13010.model';
import { DataChangeTracker, SubmitDataStructure } from '../tls13010.model';



// 工作流程步驟定義
export enum WorkflowStep {
  QUERY = 0,           // 查詢頁面
  CONTRACT_INFO = 1,   // 契約基本資訊 (CRU)
  DEDUCTION = 2,       // 代扣款設定 (NEXT1)
  COMMISSION = 3,      // 抽成設定 (NEXT2)
  CONDITION = 4,       // 條件設定 (NEXT3)
  FINAL = 5            // 最終確認
}

// 工作流程狀態
export interface WorkflowStatus {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  canProceed: boolean;
  contractId: string | null;
  lastModified: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ContractFlowService {
  private readonly STORAGE_KEY = 'TLS13010_CONTRACT_FLOW';

  // ========== 新增：記憶體快取層 ==========
  private memoryCache = new Map<string, any>();

  // 保留您原有的資料結構
  private contractData: {
    contractId: string | null,
    queryRowData: ContractInfo | null,
    step1: ContractInfo | null,
    step2: FareItem[],
    step3: CommissionItem[],
    step4: ConditionDataItem[],
    step5: FinalData | null,
    metadata: {
      createdAt: Date;
      lastModified: Date;
      version: number;
    }
  } = {
      contractId: null,
      queryRowData: null,
      step1: null,
      step2: [],
      step3: [],
      step4: [],
      step5: null,
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: 1
      }
    };

  // 工作流程狀態管理
  private workflowStatusSubject = new BehaviorSubject<WorkflowStatus>(this.initializeStatus());
  public workflowStatus$ = this.workflowStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
    this.setupAutoSave(); // 新增自動儲存設定
  }

  /**
   * 初始化工作流程狀態
   */
  private initializeStatus(): WorkflowStatus {
    return {
      currentStep: WorkflowStep.QUERY,
      completedSteps: [],
      canProceed: false,
      contractId: null,
      lastModified: new Date()
    };
  }

  /**
   * 開始新的工作流程 (從查詢頁面進入)
   */
  startWorkflow(queryRowData: any): void {
    const contractId = queryRowData.talent_id || queryRowData.apply_no || Date.now().toString();

    // 檢查是否有現有的暫存資料
    if (this.contractData.contractId === contractId) {
      // 有暫存資料，統一從 CRU 開始，但保留已完成的步驟記錄
      console.log('發現現有暫存資料，從 CRU 重新開始編輯:', contractId);

      const newStatus: WorkflowStatus = {
        currentStep: WorkflowStep.CONTRACT_INFO, // 固定從 CRU 開始
        completedSteps: this.workflowStatusSubject.value.completedSteps, // 保留已完成步驟
        canProceed: true,
        contractId: contractId,
        lastModified: new Date()
      };

      this.workflowStatusSubject.next(newStatus);
      this.saveToStorage();

    } else {
      // 全新的資料，清空舊資料重新開始
      console.log('開始新的工作流程:', contractId);

      this.contractData = {
        contractId: contractId,
        queryRowData: queryRowData,
        step1: null,
        step2: [],
        step3: [],
        step4: [],
        step5: null,
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
          version: 1
        }
      };

      const newStatus: WorkflowStatus = {
        currentStep: WorkflowStep.CONTRACT_INFO,
        completedSteps: [],
        canProceed: true,
        contractId: contractId,
        lastModified: new Date()
      };

      this.workflowStatusSubject.next(newStatus);
      this.saveToStorage();
    }
  }

  /**
   * 儲存第1步資料
   */
  saveStep1Data(formData: ContractInfo): void {
    const contractId = formData.talent_id || formData.apply_no;
    this.contractData.contractId = contractId;
    this.contractData.step1 = formData;
    this.contractData.metadata.lastModified = new Date();
    this.contractData.metadata.version += 1;

    // 更新工作流程狀態
    this.updateWorkflowStatus(WorkflowStep.CONTRACT_INFO);
    this.saveToStorage();

    console.log('儲存第1步資料:', contractId, formData);
  }

  /**
   * 取得第1步資料
   */
  getStep1Data(queryData?: any): ContractInfo | null {
    if (queryData) {
      const contractId = queryData.talent_id || queryData.apply_no;
      if (this.contractData.contractId === contractId) {
        return this.contractData.step1;
      }
      return null;
    }

    return this.contractData.step1;
  }

  /**
   * 儲存第2步資料（代扣款）
   */
  saveStep2Data(data: FareItem[]): void {
    if (this.contractData.contractId) {
      // 🔧 修正：直接儲存物件格式，不要包成陣列
      this.contractData.step2 = data;  // 直接儲存，保持原格式

      this.contractData.metadata.lastModified = new Date();
      this.contractData.metadata.version += 1;
      this.updateWorkflowStatus(WorkflowStep.DEDUCTION);
      this.saveToStorage();

      console.log('儲存第2步資料 (修正版):', data);
    }
  }

  /**
   * 儲存第3步資料（抽成設定）
   */
  saveStep3Data(data: CommissionItem[]): void {
    if (this.contractData.contractId) {
      this.contractData.step3 = Array.isArray(data) ? data : [data];
      this.contractData.metadata.lastModified = new Date();
      this.contractData.metadata.version += 1;
      this.updateWorkflowStatus(WorkflowStep.COMMISSION);
      this.saveToStorage();

      console.log('儲存第3步資料:', data);
    }
  }

  /**
   * 儲存第4步資料（條件設定）
   */
  saveStep4Data(data: ConditionDataItem[] | ConditionItem[]): void {
    if (this.contractData.contractId) {
      // 如果傳入的是 ConditionItem[]，轉換為 ConditionDataItem[]
      if (data.length > 0 && this.isConditionItem(data[0])) {
        this.contractData.step4 = (data as ConditionItem[]).map(item =>
          this.convertConditionItemToDataItem(item)
        );
      } else {
        this.contractData.step4 = Array.isArray(data) ? data as ConditionDataItem[] : [data as ConditionDataItem];
      }

      this.contractData.metadata.lastModified = new Date();
      this.contractData.metadata.version += 1;
      this.updateWorkflowStatus(WorkflowStep.CONDITION);
      this.saveToStorage();

      console.log('儲存第4步資料:', this.contractData.step4);
    }
  }

  // 🎯 新增輔助方法
  private isConditionItem(item: any): boolean {
    return item && typeof item === 'object' &&
      'talent_id' in item &&
      ('tlt_id' in item || 'seq_no' in item);
  }

  private convertConditionItemToDataItem(item: ConditionItem): ConditionDataItem {
    return {
      id: item.id || Date.now() + Math.random(),
      A: item.talent_id || '',
      B: this.getConditionType(item),
      C: this.getConditionValue1(item),
      D: this.getConditionValue2(item),
      E: this.getConditionValue3(item),
      F: JSON.stringify(item),
      G: item._status || 'original',
      _status: item._status,
      _isNew: item._isNew
    };
  }

  private getConditionType(item: ConditionItem): string {
    if ('base_rent' in item && 'cag_charge_rate' in item) return 'baseRentHigher';
    if ('base_rent' in item) return 'fixedRent';
    if ('limit_amt' in item && 'seq_no' in item) return 'baseTier';
    if ('limit_amt' in item) return 'baseCommission';
    if ('seq_no' in item) return 'graduated';
    return 'unknown';
  }

  private getConditionValue1(item: ConditionItem): string {
    if ('tlt_id' in item) return item.tlt_id || '';
    if ('seq_no' in item) return item.seq_no?.toString() || '';
    return '';
  }

  private getConditionValue2(item: ConditionItem): string {
    if ('cag_bdate' in item) return item.cag_bdate || '';
    return '';
  }

  private getConditionValue3(item: ConditionItem): string {
    if ('cag_edate' in item) return item.cag_edate || '';
    return '';
  }


  /**
   * 取得步驟資料
   */
  getStepData(step: WorkflowStep): any {
    switch (step) {
      case WorkflowStep.CONTRACT_INFO:
        return this.contractData.step1;
      case WorkflowStep.DEDUCTION:
        return this.contractData.step2;
      case WorkflowStep.COMMISSION:
        return this.contractData.step3;
      case WorkflowStep.CONDITION:
        return this.contractData.step4;
      default:
        return null;
    }
  }

  /**
   * 更新工作流程狀態
   */
  private updateWorkflowStatus(completedStep: WorkflowStep): void {
    const currentStatus = this.workflowStatusSubject.value;

    // 更新已完成步驟
    if (!currentStatus.completedSteps.includes(completedStep)) {
      currentStatus.completedSteps.push(completedStep);
    }

    // 更新當前步驟 (允許前進到下一步)
    if (completedStep >= currentStatus.currentStep) {
      currentStatus.currentStep = Math.min(completedStep + 1, WorkflowStep.FINAL);
    }

    currentStatus.canProceed = this.validateStepCompletion(completedStep);
    currentStatus.lastModified = new Date();

    this.workflowStatusSubject.next(currentStatus);
  }

  /**
   * 驗證步驟是否完成
   */
  private validateStepCompletion(step: WorkflowStep): boolean {
    switch (step) {
      case WorkflowStep.CONTRACT_INFO:
        return !!(this.contractData.step1?.tlt_name && this.contractData.step1?.apply_no);
      case WorkflowStep.DEDUCTION:
        return this.contractData.step2?.length > 0;
      case WorkflowStep.COMMISSION:
        return this.contractData.step3?.length > 0;
      case WorkflowStep.CONDITION:
        return true; // 條件設定可以為空
      default:
        return true;
    }
  }

  /**
   * 檢查是否可以訪問某個步驟
   */
  canAccessStep(targetStep: WorkflowStep): boolean {
    const currentStatus = this.workflowStatusSubject.value;

    // 總是可以回到已完成的步驟
    if (currentStatus.completedSteps.includes(targetStep)) {
      return true;
    }

    // 可以訪問當前步驟
    if (targetStep === currentStatus.currentStep) {
      return true;
    }

    // 不能跳過步驟
    return false;
  }

  /**
   * 取得當前狀態
   */
  getCurrentStatus(): WorkflowStatus {
    return this.workflowStatusSubject.value;
  }

  /**
   * 取得當前資料
   */
  getCurrentData(): any {
    return this.contractData;
  }

  /**
   * 取得查詢頁面資料
   */
  getQueryRowData(): any {
    return this.contractData.queryRowData;
  }

  /**
   * 清空所有暫存
   */
  clearTempData(): void {
    this.contractData = {
      contractId: null,
      queryRowData: null,
      step1: null,
      step2: [],
      step3: [],
      step4: [],
      step5: null,
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: 1
      }
    };

    this.workflowStatusSubject.next(this.initializeStatus());
    this.clearStorage();
    console.log('清空所有暫存資料');
  }

  /**
   * 取得某個欄位的值（給第5步用）
   */
  getStep1Field(fieldName: keyof ContractInfo): ContractInfo[keyof ContractInfo] | undefined {
    return this.contractData.step1?.[fieldName];
  }

  /**
   * 最終送出所有資料
   */
  submitAllData(): Observable<any> {
    console.log('送出所有暫存資料:', this.contractData);

    // 準備最終的資料結構
    const finalData = {
      // 基本契約資料 (Step 1) - 單筆
      contractInfo: this.contractData.step1,

      // 代扣款資料 (Step 2) - 多筆
      deductionData: this.contractData.step2,

      // 抽成設定資料 (Step 3) - 多筆
      commissionData: this.contractData.step3,

      // 條件設定資料 (Step 4) - 多筆
      conditionData: this.contractData.step4,

      // 元資料
      metadata: this.contractData.metadata
    };

    // 這裡之後會呼叫您的後端API
    // return this.http.put('/api/contracts/complete', finalData);

    // 暫時回傳模擬的 Observable
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, data: finalData });
        observer.complete();
      }, 1000);
    });
  }

  // ========== 修改：儲存相關方法 (localStorage → sessionStorage + Memory) ==========

  /**
   * 混合儲存：Memory + SessionStorage
   */
  private saveToStorage(): void {
    try {
      const saveData = {
        contractData: this.contractData,
        workflowStatus: this.workflowStatusSubject.value,
        timestamp: new Date().getTime()
      };

      // 1. 立即儲存到記憶體（最快速）
      this.memoryCache.set(this.STORAGE_KEY, saveData);

      // 2. 備份到 sessionStorage（分頁關閉前保持）
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));

      console.log('資料已儲存到記憶體和 SessionStorage');
    } catch (error) {
      console.warn('無法儲存工作流程資料到 SessionStorage，但記憶體暫存仍有效:', error);
    }
  }

  /**
   * 優先順序載入：Memory > SessionStorage
   */
  private loadFromStorage(): void {
    try {
      // 1. 優先從記憶體載入（最快）
      if (this.memoryCache.has(this.STORAGE_KEY)) {
        const memoryData = this.memoryCache.get(this.STORAGE_KEY);
        this.applyLoadedData(memoryData);
        console.log('從記憶體載入工作流程資料');
        return;
      }

      // 2. 降級到 sessionStorage
      const savedData = sessionStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);

        // 同步回記憶體
        this.memoryCache.set(this.STORAGE_KEY, parsedData);
        this.applyLoadedData(parsedData);
        console.log('從 SessionStorage 載入工作流程資料');
      }
    } catch (error) {
      console.warn('無法載入工作流程資料:', error);
      this.clearStorage();
    }
  }

  /**
   * 套用載入的資料
   */
  private applyLoadedData(data: any): void {
    this.contractData = data.contractData;
    this.workflowStatusSubject.next(data.workflowStatus);
  }

  /**
   * 清除所有儲存
   */
  private clearStorage(): void {
    try {
      // 清除記憶體快取
      this.memoryCache.delete(this.STORAGE_KEY);

      // 清除 sessionStorage
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('無法清除儲存:', error);
    }
  }

  // ========== 新增：自動儲存機制 ==========

  /**
   * 設定自動儲存機制
   */
  private setupAutoSave(): void {
    // 每 30 秒自動備份到 sessionStorage
    setInterval(() => {
      if (this.contractData.contractId) {
        this.saveToStorage();
      }
    }, 30000);

    // 監聽分頁即將關閉，確保最後一次儲存
    window.addEventListener('beforeunload', () => {
      if (this.contractData.contractId) {
        this.saveToStorage();
      }
    });

    // 監聽分頁獲得焦點時，檢查是否有其他分頁的更新
    window.addEventListener('focus', () => {
      this.syncFromSessionStorage();
    });
  }

  /**
   * 從 sessionStorage 同步最新資料（多分頁情況）
   */
  private syncFromSessionStorage(): void {
    try {
      const savedData = sessionStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const savedTimestamp = parsedData.timestamp || 0;
        const currentTimestamp = this.memoryCache.get(this.STORAGE_KEY)?.timestamp || 0;

        // 如果 sessionStorage 的資料比記憶體新，就同步過來
        if (savedTimestamp > currentTimestamp) {
          this.memoryCache.set(this.STORAGE_KEY, parsedData);
          this.applyLoadedData(parsedData);
          console.log('從其他分頁同步最新資料');
        }
      }
    } catch (error) {
      console.warn('同步資料失敗:', error);
    }
  }

  // ========== 輔助方法保持不變 ==========

  /**
   * 取得步驟名稱
   */
  getStepName(step: WorkflowStep): string {
    switch (step) {
      case WorkflowStep.QUERY: return '查詢';
      case WorkflowStep.CONTRACT_INFO: return '契約資訊';
      case WorkflowStep.DEDUCTION: return '代扣款設定';
      case WorkflowStep.COMMISSION: return '抽成設定';
      case WorkflowStep.CONDITION: return '條件設定';
      case WorkflowStep.FINAL: return '完成';
      default: return '未知';
    }
  }

  /**
   * 取得進度百分比
   */
  getProgressPercentage(): number {
    const currentStatus = this.workflowStatusSubject.value;
    const totalSteps = Object.keys(WorkflowStep).length / 2 - 1; // 扣除 QUERY
    return Math.round((currentStatus.completedSteps.length / totalSteps) * 100);
  }

  /**
   * 取得第2步資料（代扣款）
   */
  getStep2Data(): FareItem[] {
    return this.contractData.step2;
  }

  /**
   * 取得第3步資料（抽成設定）
   */
  getStep3Data(): CommissionItem[] {
    return this.contractData.step3;
  }

  /**
   * 取得第4步資料（條件設定） - 新增別名方法
   */
  getStep4Data(): ConditionDataItem[] {
    return this.contractData.step4;
  }

  /**
   * 清空所有資料 - 新增別名方法給組件使用
   */
  clearAllData(): void {
    this.clearTempData();
  }

  generateSubmitData(): SubmitDataStructure {
    const step1Data = this.getStep1Data();
    const step2Data = this.getStep2Data();
    const step3Data = this.getStep3Data();
    const step4Data = this.getStep4Data();

    console.log('🔍 生成提交資料 - 原始資料檢查:');
    console.log('Step1:', step1Data);
    console.log('Step2:', step2Data);
    console.log('Step3:', step3Data);
    console.log('Step4:', step4Data);

    // Step 1: 合約基本資料 (單筆，判斷是新增還是修改)
    const step1Operation = step1Data?.talent_id ? 'UPDATE' : 'INSERT';

    // Step 2: 代扣款資料 (多筆，追蹤變更)
    const step2Changes = DataChangeTracker.generateChangeSummary(step2Data || [], '代扣款設定');

    // Step 3: 抽成設定資料 (多筆，追蹤變更)
    const step3Changes = DataChangeTracker.generateChangeSummary(step3Data || [], '抽成設定');

    // 🎯 Step 4: 條件設定資料 - 轉換為 ConditionItem 型別
    const step4ConditionItems = (step4Data || []).map(dataItem =>
      this.convertDataItemToConditionItem(dataItem)
    );
    const step4Changes = DataChangeTracker.generateChangeSummary(step4ConditionItems, '條件設定');

    // 計算總操作數
    const totalOperations =
      1 + // Step 1 一定有一個操作
      step2Changes.summary.insert + step2Changes.summary.update + step2Changes.summary.delete +
      step3Changes.summary.insert + step3Changes.summary.update + step3Changes.summary.delete +
      step4Changes.summary.insert + step4Changes.summary.update + step4Changes.summary.delete;

    return {
      step1: {
        operation: step1Operation,
        data: step1Data!
      },
      step2: {
        summary: step2Changes.summary,
        operations: {
          toInsert: step2Changes.data.toInsert,
          toUpdate: step2Changes.data.toUpdate,
          toDelete: step2Changes.data.toDelete
        }
      },
      step3: {
        summary: step3Changes.summary,
        operations: {
          toInsert: step3Changes.data.toInsert,
          toUpdate: step3Changes.data.toUpdate,
          toDelete: step3Changes.data.toDelete
        }
      },
      step4: {
        summary: step4Changes.summary,
        operations: {
          toInsert: step4Changes.data.toInsert,
          toUpdate: step4Changes.data.toUpdate,
          toDelete: step4Changes.data.toDelete
        }
      },
      metadata: {
        talentId: this.contractData.contractId || '',
        contractId: this.contractData.contractId || '',
        submittedAt: new Date(),
        totalOperations
      }
    };
  }

  private convertDataItemToConditionItem(dataItem: ConditionDataItem): ConditionItem {
    try {
      const parsedData = JSON.parse(dataItem.F || '{}');
      const baseItem = {
        id: dataItem.id,
        talent_id: dataItem.A,
        _status: dataItem._status,
        _isNew: dataItem._isNew
      };

      // 根據 B 欄位判斷類型
      switch (dataItem.B) {
        case 'fixedRent':
          return {
            ...baseItem,
            tlt_id: dataItem.C,
            cag_bdate: dataItem.D,
            cag_edate: dataItem.E,
            base_rent: parsedData.base_rent || 0
          } as FixedRentCondition;

        case 'baseRentHigher':
          return {
            ...baseItem,
            tlt_id: dataItem.C,
            cag_bdate: dataItem.D,
            cag_edate: dataItem.E,
            base_rent: parsedData.base_rent || 0,
            cag_charge_rate: parsedData.cag_charge_rate || 0
          } as BaseRentHigherCondition;

        case 'baseCommission':
          return {
            ...baseItem,
            tlt_id: dataItem.C,
            cag_bdate: dataItem.D,
            cag_edate: dataItem.E,
            limit_amt: parsedData.limit_amt || 0,
            limit_charge_rate: parsedData.limit_charge_rate || 0
          } as BaseCommissionCondition;

        case 'graduated':
          return {
            ...baseItem,
            seq_no: parseInt(dataItem.C) || 0,
            cag_bdate: dataItem.D,
            cag_edate: dataItem.E,
            start_number: parsedData.start_number || 0,
            end_number: parsedData.end_number || 0,
            charge_rate: parsedData.charge_rate || 0
          } as GraduatedCommissionCondition;

        case 'baseTier':
          return {
            ...baseItem,
            seq_no: parseInt(dataItem.C) || 0,
            tlt_id: '',
            cag_bdate: dataItem.D,
            cag_edate: dataItem.E,
            limit_amt: parsedData.limit_amt || 0,
            start_number: parsedData.start_number || 0,
            end_number: parsedData.end_number || 0,
            charge_rate: parsedData.charge_rate || 0
          } as BaseTierCondition;

        default:
          // 預設返回固定租金類型
          return {
            ...baseItem,
            tlt_id: dataItem.C,
            cag_bdate: dataItem.D,
            cag_edate: dataItem.E,
            base_rent: 0
          } as FixedRentCondition;
      }
    } catch (error) {
      console.error('轉換 ConditionDataItem 失敗:', error);
      // 返回預設值
      return {
        id: dataItem.id,
        talent_id: dataItem.A,
        tlt_id: '',
        cag_bdate: '',
        cag_edate: '',
        base_rent: 0,
        _status: dataItem._status,
        _isNew: dataItem._isNew
      } as FixedRentCondition;
    }
  }
}
