// contract-flow.service.ts (增強版)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

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

  // 保留您原有的資料結構，但加強功能
  private contractData: {
    contractId: string | null,
    queryRowData: any | null,      // 新增：查詢頁面的原始資料
    step1: any | null,             // CRU頁面的資料
    step2: any[],                  // 代扣款資料
    step3: any[],                  // 抽成設定資料
    step4: any[],                  // 條件設定資料
    step5: any | null,             // 最終資料
    metadata: {                    // 新增：元資料
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

  // 新增：工作流程狀態管理
  private workflowStatusSubject = new BehaviorSubject<WorkflowStatus>(this.initializeStatus());
  public workflowStatus$ = this.workflowStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
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

    // 清空舊資料
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

    // 更新狀態
    const newStatus: WorkflowStatus = {
      currentStep: WorkflowStep.CONTRACT_INFO,
      completedSteps: [],
      canProceed: true,
      contractId: contractId,
      lastModified: new Date()
    };

    this.workflowStatusSubject.next(newStatus);
    this.saveToStorage();

    console.log('開始新工作流程:', contractId, queryRowData);
  }

  /**
   * 檢查是否可以繼續現有工作流程
   */
  continueWorkflow(queryRowData: any): boolean {
    const contractId = queryRowData.talent_id || queryRowData.apply_no;

    if (this.contractData.contractId === contractId) {
      console.log('繼續現有工作流程:', contractId);
      return true;
    }

    return false;
  }

  // ========== 保留您原有的方法，但加強功能 ==========

  /**
   * 儲存第1步資料 (增強版)
   */
  saveStep1Data(formData: any): void {
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
   * 取得第1步資料 (增強版)
   */
  getStep1Data(queryData?: any): any {
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
   * 儲存第2步資料（代扣款）- 增強版
   */
  saveStep2Data(data: any): void {
    if (this.contractData.contractId) {
      // 支援多種資料格式
      if (Array.isArray(data)) {
        this.contractData.step2 = data;
      } else if (data && typeof data === 'object') {
        // 如果是物件，可能包含不同類型的扣款
        this.contractData.step2 = [data];
      }

      this.contractData.metadata.lastModified = new Date();
      this.contractData.metadata.version += 1;
      this.updateWorkflowStatus(WorkflowStep.DEDUCTION);
      this.saveToStorage();

      console.log('儲存第2步資料:', data);
    }
  }

  /**
   * 儲存第3步資料（抽成設定）- 新增
   */
  saveStep3Data(data: any): void {
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
   * 儲存第4步資料（條件設定）- 新增
   */
  saveStep4Data(data: any): void {
    if (this.contractData.contractId) {
      this.contractData.step4 = Array.isArray(data) ? data : [data];
      this.contractData.metadata.lastModified = new Date();
      this.contractData.metadata.version += 1;
      this.updateWorkflowStatus(WorkflowStep.CONDITION);
      this.saveToStorage();

      console.log('儲存第4步資料:', data);
    }
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

  // ========== 原有方法保留 ==========

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
  getStep1Field(fieldName: string): any {
    return this.contractData.step1?.[fieldName];
  }

  /**
   * 最終送出所有資料
   */
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
  } // contract-flow.service.ts (增強版)

  // ========== 新增：儲存相關方法 ==========

  /**
   * 儲存到 localStorage
   */
  private saveToStorage(): void {
    try {
      const saveData = {
        contractData: this.contractData,
        workflowStatus: this.workflowStatusSubject.value,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));
    } catch (error) {
      console.warn('無法儲存工作流程資料到 localStorage:', error);
    }
  }

  /**
   * 從 localStorage 載入
   */
  private loadFromStorage(): void {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);

        // 檢查資料是否過期 (24小時)
        const now = new Date().getTime();
        const savedTime = parsedData.timestamp || 0;
        const hoursDiff = (now - savedTime) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          this.contractData = parsedData.contractData;
          this.workflowStatusSubject.next(parsedData.workflowStatus);
          console.log('從 localStorage 載入工作流程資料');
        } else {
          this.clearStorage();
          console.log('工作流程資料已過期，已清除');
        }
      }
    } catch (error) {
      console.warn('無法從 localStorage 載入工作流程資料:', error);
      this.clearStorage();
    }
  }

  /**
   * 清除 localStorage
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('無法清除 localStorage:', error);
    }
  }

  // ========== 輔助方法 ==========

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
}
