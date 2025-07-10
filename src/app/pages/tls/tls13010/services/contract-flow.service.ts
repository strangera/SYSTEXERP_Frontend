// contract-flow.service.ts - 整合 DataCleaner 版本
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  CommissionItem,
  ConditionItem,
  ContractDataStructure,
  ContractInfo,
  FareItem,
  Step3DataChangeTracker,
  UnifiedCommissionResponse,
  WorkflowStatus,
  WorkflowStep,
  // 🎯 新增：導入清理後的資料模型
  CleanSubmitData,
  DataCleaner
} from '../tls13010.model';

@Injectable({
  providedIn: 'root'
})
export class ContractFlowService {
  private readonly STORAGE_KEY = 'TLS13010_CONTRACT_FLOW';

  // 記憶體快取層
  private memoryCache = new Map<string, any>();

  // 保留您原有的資料結構
  private contractData: ContractDataStructure = {
    contractId: null,
    queryRowData: null,
    step1: null,
    step2: [],
    step3: [],
    step4: [],
    step5: null,
    dataToDelete: null,
    unifiedCommissionData: null,
    metadata: {
      createdAt: new Date(),
      lastModified: new Date(),
      version: 1,
      _isNewContract: true
    }
  };

  // 工作流程狀態管理
  private workflowStatusSubject = new BehaviorSubject<WorkflowStatus>(this.initializeStatus());
  public workflowStatus$ = this.workflowStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
    this.setupAutoSave();
  }

  // ========== 🎯 新增：清理後的資料生成方法 ==========

  /**
   * 🆕 生成清理後的提交資料（推薦使用）
   */
  generateCleanSubmitData(): CleanSubmitData {
    console.log('🔄 開始生成清理後的提交資料...');

    const step1Data = this.getStep1Data();
    const step2Data = this.getStep2Data();
    const step3Data = this.getStep3Data();
    const step4Data = this.getStep4Data();

    const modeInfo = this.getWorkflowModeInfo();

    // 🎯 驗證必要資料
    if (!step1Data) {
      throw new Error('缺少合約基本資料 (Step 1)');
    }

    console.log('📋 準備清理的原始資料:', {
      step1Items: step1Data ? 1 : 0,
      step2Items: step2Data?.length || 0,
      step3Items: step3Data?.length || 0,
      step4Items: step4Data?.length || 0,
      mode: modeInfo.modeName
    });

    try {
      // 🎯 使用 DataCleaner 清理各步驟資料
      const cleanData: CleanSubmitData = {
        contractInfo: {
          operation: modeInfo.isNewMode ? 'INSERT' : 'UPDATE',
          data: DataCleaner.cleanContractInfo(step1Data)
        },

        deductions: DataCleaner.cleanDeductionItems(step2Data || []),

        commissions: DataCleaner.cleanCommissionData(step3Data || []),

        conditions: DataCleaner.cleanConditionData(step4Data || [], this.getCurrentCommissionType()),

        metadata: {
          talentId: modeInfo.talentId,
          contractId: modeInfo.contractId,
          commissionType: this.getCurrentCommissionType(),
          isNewContract: modeInfo.isNewMode,
          submittedAt: new Date().toISOString(),
          totalOperations: this.calculateTotalOperations(step2Data, step3Data, step4Data)
        }
      };

      console.log('✅ 清理後的提交資料生成完成');
      console.log('📊 清理後資料統計:', {
        contractOperation: cleanData.contractInfo.operation,
        deductionInserts: cleanData.deductions.toInsert.length,
        deductionUpdates: cleanData.deductions.toUpdate.length,
        deductionDeletes: cleanData.deductions.toDelete.length,
        commissionMasterInserts: cleanData.commissions.masters.toInsert.length,
        commissionMasterUpdates: cleanData.commissions.masters.toUpdate.length,
        totalOperations: cleanData.metadata.totalOperations
      });
      console.log('✅ 清理後的提交資料生成完成');
      console.log('🚀 最終要送出的完整 JSON:');
      console.log(JSON.stringify(cleanData, null, 2));
      return cleanData;

    } catch (error) {
      console.error('❌ 生成清理後資料時發生錯誤:', error);
      throw new Error(`生成提交資料失敗: ${error}`);
    }
  }

  /**
   * 🎯 計算總操作數量
   */
  private calculateTotalOperations(step2Data?: any[], step3Data?: any[], step4Data?: any[]): number {
    let totalOps = 1; // Step 1 合約基本資料

    // Step 2 代扣款
    if (step2Data) {
      totalOps += step2Data.filter(item => item.is_selected && item._status).length;
    }

    // Step 3 抽成設定
    if (step3Data) {
      step3Data.forEach(commission => {
        if (commission._status) totalOps++;
        totalOps += (commission.discountSettingItems?.filter((item: any) => item._status)?.length || 0);
        totalOps += (commission.annualPerformanceItems?.filter((item: any) => item._status)?.length || 0);
        totalOps += (commission.discountLevelItems?.filter((item: any) => item._status)?.length || 0);
      });
    }

    // Step 4 條件設定
    if (step4Data) {
      totalOps += step4Data.filter(item => item._status).length;
    }

    return totalOps;
  }

  /**
   * 🎯 驗證清理後的資料
   */
  validateCleanSubmitData(cleanData: CleanSubmitData): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 基本資料驗證
    if (!cleanData.contractInfo.data.talent_id && cleanData.contractInfo.operation === 'UPDATE') {
      errors.push('編輯模式必須有 talent_id');
    }

    if (!cleanData.contractInfo.data.apply_no) {
      errors.push('專櫃招募編號不能為空');
    }

    if (!cleanData.contractInfo.data.tlt_name) {
      errors.push('品牌名稱不能為空');
    }

    // 抽成設定驗證
    const hasCommissions = cleanData.commissions.masters.toInsert.length > 0 ||
      cleanData.commissions.masters.toUpdate.length > 0;

    if (!hasCommissions && cleanData.contractInfo.data.tlt_term_type === '3') {
      warnings.push('一般抽成模式建議至少設定一個抽成項目');
    }

    // 條件設定驗證
    const commissionType = cleanData.contractInfo.data.tlt_term_type;
    const hasConditions = Object.values(cleanData.conditions).some(conditionType =>
      conditionType.toInsert.length > 0 || conditionType.toUpdate.length > 0
    );

    if (['1', '2', '4', '5', '6'].includes(commissionType) && !hasConditions) {
      warnings.push(`抽成類型 ${commissionType} 建議設定對應的條件`);
    }

    console.log('🔍 資料驗證結果:', {
      isValid: errors.length === 0,
      errorsCount: errors.length,
      warningsCount: warnings.length
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ========== 保留原有的方法（向後相容） ==========

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
    const isNewMode = queryRowData._isNewContract === true;

    console.log('🚀 開始工作流程:', {
      isNewMode: isNewMode,
      queryData: queryRowData
    });

    if (isNewMode) {
      console.log('🆕 初始化新增工作流程');
      this.initializeNewContractWorkflow(queryRowData);
    } else {
      console.log('📝 初始化編輯工作流程');
      this.initializeEditContractWorkflow(queryRowData);
    }

    this.saveToStorage();
  }

  /**
   * 🎯 新增：初始化新增模式工作流程
   */
  private initializeNewContractWorkflow(queryRowData: any): void {
    const contractId = 'new_contract_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    this.contractData = {
      contractId: contractId,
      queryRowData: {
        ...queryRowData,
        talent_id: '',
        _isNewContract: true
      },
      step1: null,
      step2: [],
      step3: [],
      step4: [],
      step5: null,
      dataToDelete: null,
      unifiedCommissionData: null,
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: 1,
        _isNewContract: true
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

    console.log('✅ 新增模式工作流程初始化完成:', {
      contractId: contractId,
      talentId: ''
    });
  }

  /**
   * 🎯 新增：初始化編輯模式工作流程
   */
  private initializeEditContractWorkflow(queryRowData: any): void {
    const contractId = queryRowData.talent_id || queryRowData.apply_no || Date.now().toString();

    if (this.contractData.contractId === contractId) {
      console.log('📦 發現現有暫存資料，從暫存重新開始編輯:', contractId);
      const newStatus: WorkflowStatus = {
        currentStep: WorkflowStep.CONTRACT_INFO,
        completedSteps: this.workflowStatusSubject.value.completedSteps,
        canProceed: true,
        contractId: contractId,
        lastModified: new Date()
      };
      this.workflowStatusSubject.next(newStatus);
    } else {
      console.log('📝 開始新的編輯工作流程:', contractId);
      this.contractData = {
        contractId: contractId,
        queryRowData: queryRowData,
        step1: null,
        step2: [],
        step3: [],
        step4: [],
        step5: null,
        dataToDelete: null,
        unifiedCommissionData: null,
        metadata: {
          createdAt: new Date(),
          lastModified: new Date(),
          version: 1,
          _isNewContract: false
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
    }

    console.log('✅ 編輯模式工作流程初始化完成:', {
      contractId: contractId,
      talentId: queryRowData.talent_id
    });
  }

  /**
   * 🎯 修正：儲存第1步資料
   */
  saveStep1Data(formData: ContractInfo): void {
    console.log('💾 儲存 Step1 資料...');

    const modeInfo = this.getWorkflowModeInfo();

    if (modeInfo.isNewMode) {
      formData.talent_id = '';
      if (!this.contractData.contractId || !this.contractData.contractId.startsWith('new_contract_')) {
        this.contractData.contractId = 'new_contract_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }
    } else {
      const targetTalentId = formData.talent_id || formData.apply_no || this.contractData.contractId;
      this.contractData.contractId = targetTalentId;
      formData.talent_id = targetTalentId as string;
    }

    this.contractData.step1 = formData;
    this.contractData.metadata.lastModified = new Date();
    this.contractData.metadata.version += 1;

    this.updateWorkflowStatus(WorkflowStep.CONTRACT_INFO);
    this.saveToStorage();
  }

  /**
   * 取得第1步資料
   */
  getStep1Data(queryData?: any): ContractInfo | null {
    console.log('🔍 取得 Step1 資料...');

    if (queryData) {
      const queryTalentId = queryData.talent_id || queryData.apply_no;
      const isQueryForNewMode = queryData._isNewContract === true;
      const currentModeInfo = this.getWorkflowModeInfo();

      console.log('📋 查詢參數:', {
        queryTalentId: queryTalentId,
        isQueryForNewMode: isQueryForNewMode,
        currentMode: currentModeInfo.modeName,
        currentContractId: this.contractData.contractId
      });

      if (isQueryForNewMode && currentModeInfo.isNewMode) {
        console.log('✅ 新增模式匹配，回傳 Step1 資料');
        return this.contractData.step1;
      }

      if (!isQueryForNewMode && !currentModeInfo.isNewMode && this.contractData.contractId === queryTalentId) {
        console.log('✅ 編輯模式匹配，回傳 Step1 資料');
        return this.contractData.step1;
      }

      console.log('❌ 查詢參數與當前工作流程不匹配');
      return null;
    }

    console.log('📋 直接回傳當前 Step1 資料');
    return this.contractData.step1;
  }

  /**
   * 🎯 修正：儲存第2步資料（代扣款）
   */
  saveStep2Data(data: FareItem[]): void {
    if (this.contractData.contractId) {
      this.contractData.step2 = data;
      this.contractData.metadata.lastModified = new Date();
      this.contractData.metadata.version += 1;
      this.updateWorkflowStatus(WorkflowStep.DEDUCTION);
      this.saveToStorage();
    }
  }

  /**
   * 🎯 修正：儲存第3步資料（抽成設定）
   */
  saveStep3Data(data: CommissionItem[]): void {
    console.log('💾 儲存 Step3 資料到工作流程...');

    if (this.contractData.contractId) {
      this.contractData.step3 = Array.isArray(data) ? data : [data];
      this.contractData.metadata.lastModified = new Date();
      this.contractData.metadata.version += 1;
      this.updateWorkflowStatus(WorkflowStep.COMMISSION);
      this.saveToStorage();
    }
  }

  /**
   * 🎯 修正：儲存第4步資料（條件設定）
   */
  saveStep4Data(data: ConditionItem[]): void {
    if (this.contractData.contractId) {
      this.contractData.step4 = Array.isArray(data) ? data : [data];
      this.contractData.metadata.lastModified = new Date();
      this.contractData.metadata.version += 1;
      this.updateWorkflowStatus(WorkflowStep.CONDITION);
      this.saveToStorage();
    }
  }

  /**
   * 設定要刪除的資料
   */
  setDataToDelete(dataToDelete: any): void {
    this.contractData.dataToDelete = dataToDelete;
    this.contractData.metadata.lastModified = new Date();
    this.contractData.metadata.version += 1;
    this.saveToStorage();

    console.log('🗑️ 已記錄要刪除的資料:', dataToDelete);
  }

  /**
   * 清除要刪除的資料記錄
   */
  clearDataToDelete(): void {
    this.contractData.dataToDelete = null;
    this.contractData.metadata.lastModified = new Date();
    this.saveToStorage();

    console.log('🗑️ 已清除要刪除的資料記錄');
  }

  /**
   * 🎯 修正：儲存統一抽成設定資料
   */
  setUnifiedCommissionData(data: UnifiedCommissionResponse): void {
    this.contractData.unifiedCommissionData = data;
    this.contractData.metadata.lastModified = new Date();
    this.saveToStorage();
  }

  /**
   * 🎯 取得統一抽成設定資料
   */
  getUnifiedCommissionData(): UnifiedCommissionResponse | null {
    return this.contractData.unifiedCommissionData;
  }

  /**
   * 🎯 取得 Next3 用的條件設定資料
   */
  getRentSettingDataForNext3(): any {
    const unifiedData = this.getUnifiedCommissionData();
    return unifiedData?.RentSettingData || null;
  }

  /**
   * 🎯 檢查是否有要刪除的舊資料
   */
  hasDataToDelete(): boolean {
    const unifiedData = this.getUnifiedCommissionData();
    return !!(unifiedData?.DataToDelete && Object.keys(unifiedData.DataToDelete).length > 0);
  }

  /**
   * 🎯 取得要刪除的舊資料（統一處理）
   */
  getDataToDelete(): any {
    const unifiedData = this.getUnifiedCommissionData();

    if (unifiedData?.DataToDelete) {
      return unifiedData.DataToDelete;
    }

    return this.contractData.dataToDelete;
  }

  /**
   * 🎯 檢查抽成別是否有變更
   */
  isCommissionTypeChanged(): boolean {
    const unifiedData = this.getUnifiedCommissionData();
    return unifiedData?.IsTermTypeChanged === true;
  }

  /**
   * 🎯 取得抽成別變更警告訊息
   */
  getCommissionChangeWarning(): any {
    const unifiedData = this.getUnifiedCommissionData();
    return unifiedData?.Warning || null;
  }

  /**
   * 🎯 清除統一抽成設定資料
   */
  clearUnifiedCommissionData(): void {
    this.contractData.unifiedCommissionData = null;
    this.contractData.metadata.lastModified = new Date();
    this.saveToStorage();

    console.log('🗑️ 已清除統一抽成設定資料');
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

    if (!currentStatus.completedSteps.includes(completedStep)) {
      currentStatus.completedSteps.push(completedStep);
    }

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
        return true;
      default:
        return true;
    }
  }

  /**
   * 檢查是否可以訪問某個步驟
   */
  canAccessStep(targetStep: WorkflowStep): boolean {
    const currentStatus = this.workflowStatusSubject.value;

    if (currentStatus.completedSteps.includes(targetStep)) {
      return true;
    }

    if (targetStep === currentStatus.currentStep) {
      return true;
    }

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
      dataToDelete: null,
      unifiedCommissionData: null,
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: 1,
        _isNewContract: false
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
   * 🎯 保留舊的方法（向後相容，但建議使用新的 generateCleanSubmitData）
   */
  generateSubmitData(): any {
    console.warn('⚠️ generateSubmitData() 已過時，建議使用 generateCleanSubmitData()');

    try {
      // 嘗試使用新方法
      return this.generateCleanSubmitData();
    } catch (error) {
      console.error('❌ 新方法失敗，使用備援邏輯:', error);

      // 備援：簡化的舊邏輯
      const step1Data = this.getStep1Data();
      const isNewContract = !step1Data?.talent_id || step1Data.talent_id === '';

      return {
        step1: {
          operation: isNewContract ? 'INSERT' : 'UPDATE',
          data: step1Data
        },
        step2: { summary: { insert: 0, update: 0, delete: 0, unchanged: 0, total: 0 }, operations: { toInsert: [], toUpdate: [], toDelete: [] } },
        step3: { summary: { insert: 0, update: 0, delete: 0, unchanged: 0, total: 0 }, operations: { commissionMaster: { toInsert: [], toUpdate: [], toDelete: [] }, discountSettings: { toInsert: [], toUpdate: [], toDelete: [] }, annualSettings: { toInsert: [], toUpdate: [], toDelete: [] }, levelSettings: { toInsert: [], toUpdate: [], toDelete: [] } } },
        step4: { summary: { insert: 0, update: 0, delete: 0, unchanged: 0, total: 0 }, operations: { toInsert: [], toUpdate: [], toDelete: [] } },
        legacyDataToDelete: this.getDataToDelete(),
        metadata: {
          talentId: this.contractData.contractId || '',
          contractId: this.contractData.contractId || '',
          isNewContract: isNewContract,
          submittedAt: new Date(),
          totalOperations: 1,
          hasLegacyDataToDelete: this.hasDataToDelete(),
        }
      };
    }
  }

  // ========== 修改：儲存相關方法 (加強版本控制) ==========

  /**
   * 混合儲存：Memory + SessionStorage + 版本控制
   */
  private saveToStorage(): void {
    try {
      const saveData = {
        contractData: this.contractData,
        workflowStatus: this.workflowStatusSubject.value,
        timestamp: new Date().getTime()
      };

      this.memoryCache.set(this.STORAGE_KEY, saveData);
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));
    } catch (error) {
      console.warn('無法儲存工作流程資料:', error);
    }
  }

  /**
   * 優先順序載入：Memory > SessionStorage
   */
  private loadFromStorage(): void {
    try {
      if (this.memoryCache.has(this.STORAGE_KEY)) {
        const memoryData = this.memoryCache.get(this.STORAGE_KEY);
        this.applyLoadedData(memoryData);
        console.log('從記憶體載入工作流程資料');
        return;
      }

      const savedData = sessionStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
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
   * 🎯 修正：套用載入的資料（包含版本號）
   */
  private applyLoadedData(data: any): void {
    try {
      this.contractData = data.contractData;
      this.workflowStatusSubject.next(data.workflowStatus);
    } catch (error) {
      console.error('❌ 套用載入資料失敗:', error);
    }
  }

  /**
   * 清除所有儲存
   */
  private clearStorage(): void {
    try {
      this.memoryCache.delete(this.STORAGE_KEY);
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
    setInterval(() => {
      if (this.contractData.contractId) {
        this.saveToStorage();
      }
    }, 30000);

    window.addEventListener('beforeunload', () => {
      if (this.contractData.contractId) {
        this.saveToStorage();
      }
    });

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
    const totalSteps = Object.keys(WorkflowStep).length / 2 - 1;
    return Math.round((currentStatus.completedSteps.length / totalSteps) * 100);
  }

  /**
   * 取得第2步資料（代扣款）
   */
  getStep2Data(): FareItem[] {
    return this.contractData.step2;
  }

  /**
   * 🎯 修正：取得第3步資料（抽成設定）
   */
  getStep3Data(): CommissionItem[] {
    console.log('🔍 取得 Step3 資料...');
    console.log('📋 contractData.step3:', this.contractData.step3);
    console.log('📋 資料類型:', typeof this.contractData.step3);
    console.log('📋 是否為陣列:', Array.isArray(this.contractData.step3));

    if (this.contractData.step3) {
      console.log('✅ 找到 Step3 資料，項目數量:', this.contractData.step3.length);
      return this.contractData.step3;
    } else {
      console.warn('❌ 沒有找到 Step3 資料');
      return [];
    }
  }

  /**
   * 取得第4步資料（條件設定） - 新增別名方法
   */
  getStep4Data(): ConditionItem[] {
    return this.contractData.step4;
  }

  /**
   * 清空所有資料 - 新增別名方法給組件使用
   */
  clearAllData(): void {
    this.clearTempData();
  }

  /**
   * 取得當前有效的抽成別（優先使用暫存資料）
   */
  getCurrentCommissionType(): string {
    console.log('🔍 取得當前抽成別...');

    const step1Data = this.getStep1Data();
    if (step1Data?.tlt_term_type) {
      console.log('🎯 從 Step1 暫存取得抽成別:', step1Data.tlt_term_type);
      return step1Data.tlt_term_type.toString().trim();
    }

    if (!this.isNewContractMode()) {
      const queryData = this.getQueryRowData();
      if (queryData?.tlt_term_type) {
        console.log('🎯 從查詢資料取得抽成別:', queryData.tlt_term_type);
        return queryData.tlt_term_type.toString().trim();
      }
    }

    console.log('🎯 使用預設抽成別: 3');
    return '3';
  }

  /**
   * 取得當前合約的 talent_id
   */
  getCurrentTalentId(): string {
    if (this.isNewContractMode()) {
      console.log('🆕 新增模式：talent_id 回傳空字串');
      return '';
    }

    const step1Data = this.getStep1Data();
    if (step1Data?.talent_id) {
      console.log('📝 編輯模式：從 Step1 取得 talent_id:', step1Data.talent_id);
      return step1Data.talent_id.toString();
    }

    const queryData = this.getQueryRowData();
    if (queryData?.talent_id) {
      console.log('📝 編輯模式：從查詢資料取得 talent_id:', queryData.talent_id);
      return queryData.talent_id.toString();
    }

    console.warn('⚠️ 無法取得 talent_id');
    return '';
  }

  /**
   * 🎯 新增：統一的模式資訊獲取
   */
  getWorkflowModeInfo(): {
    isNewMode: boolean;
    talentId: string;
    contractId: string;
    modeName: string;
  } {
    const isNewMode = this.isNewContractMode();
    const talentId = this.getCurrentTalentId();
    const currentData = this.getCurrentData();

    return {
      isNewMode,
      talentId,
      contractId: currentData.contractId || '',
      modeName: isNewMode ? '新增模式' : '編輯模式'
    };
  }

  /**
   * 🎯 新增：完全清空並重新開始（新增模式專用）
   */
  clearAndStartNew(): void {
    console.log('🆕 清空所有資料並開始新增模式');

    this.clearTempData();

    const newStatus: WorkflowStatus = {
      currentStep: WorkflowStep.CONTRACT_INFO,
      completedSteps: [],
      canProceed: true,
      contractId: 'new_contract_' + Date.now(),
      lastModified: new Date()
    };

    this.workflowStatusSubject.next(newStatus);

    console.log('✅ 新增模式初始化完成');
  }

  /**
   * 🎯 新增：檢查是否為新增模式
   */
  isNewContractMode(): boolean {
    const currentData = this.getCurrentData();

    if (currentData.queryRowData?._isNewContract === true) {
      return true;
    }

    if (currentData.contractId?.startsWith('new_contract_')) {
      return true;
    }

    if (!currentData.contractId) {
      return true;
    }

    const step1Data = this.getStep1Data();
    if (step1Data && (!step1Data.talent_id || step1Data.talent_id === '')) {
      return true;
    }

    return false;
  }

  validateWorkflowData(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const modeInfo = this.getWorkflowModeInfo();

    if (!this.contractData.contractId) {
      errors.push('缺少 contractId');
    }

    if (modeInfo.isNewMode) {
      if (this.contractData.queryRowData?._isNewContract !== true) {
        warnings.push('新增模式標記不明確');
      }

      if (this.contractData.contractId && !this.contractData.contractId.startsWith('new_contract_')) {
        warnings.push('新增模式 contractId 格式異常');
      }
    }

    if (!modeInfo.isNewMode) {
      if (!modeInfo.talentId) {
        errors.push('編輯模式缺少 talent_id');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ========== 🎯 新增：除錯工具方法 ==========

  /**
   * 🎯 新增：取得工作流程狀態摘要（除錯用）
   */
  getWorkflowStatusSummary(): any {
    const modeInfo = this.getWorkflowModeInfo();
    const validation = this.validateWorkflowData();

    return {
      mode: modeInfo,
      validation: validation,

      hasStep1: !!this.contractData.step1,
      step2Count: this.contractData.step2?.length || 0,
      step3Count: this.contractData.step3?.length || 0,
      step4Count: this.contractData.step4?.length || 0,

      lastModified: this.contractData.metadata?.lastModified,

      currentStep: this.workflowStatusSubject.value.currentStep,
      completedSteps: this.workflowStatusSubject.value.completedSteps
    };
  }

  /**
   * 🎯 新增：重置為新增模式（清空並重新開始）
   */
  resetToNewMode(): void {
    console.log('🔄 重置為新增模式');

    this.clearTempData();

    const emptyQueryData = {
      talent_id: '',
      apply_no: '',
      tlt_name: '',
      _isNewContract: true
    };

    this.startWorkflow(emptyQueryData);

    console.log('✅ 已重置為新增模式');
  }

  // ========== 🎯 新增：最終提交相關方法 ==========

  /**
   * 🎯 新增：預覽提交資料（不實際送出）
   */
  previewSubmitData(): { cleanData: CleanSubmitData; validation: any } {
    const cleanData = this.generateCleanSubmitData();
    const validation = this.validateCleanSubmitData(cleanData);

    return { cleanData, validation };
  }

  /**
   * 🎯 新增：提交資料到後端（模擬）
   */
  submitToBackend(apiEndpoint: string = '/api/contracts/submit'): Observable<any> {
    const cleanData = this.generateCleanSubmitData();
    const validation = this.validateCleanSubmitData(cleanData);

    if (!validation.isValid) {
      throw new Error(`資料驗證失敗: ${validation.errors.join(', ')}`);
    }

    console.log('📤 提交清理後的資料到後端:', cleanData);

    // 🎯 TODO: 實際的 HTTP 請求
    // return this.http.post(apiEndpoint, cleanData);

    // 🎯 暫時模擬 API 回應
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          message: '契約資料提交成功',
          data: cleanData.metadata
        });
        observer.complete();
      }, 2000);
    });
  }

  /**
   * 🎯 新增：提交成功後的清理
   */
  onSubmitSuccess(): void {
    console.log('✅ 提交成功，清理暫存資料');
    this.clearAllData();
  }

  /**
   * 🎯 新增：取得提交資料大小（除錯用）
   */
  getSubmitDataSize(): { original: number; clean: number; reduction: string } {
    try {
      const originalData = this.generateSubmitData();
      const cleanData = this.generateCleanSubmitData();

      const originalSize = JSON.stringify(originalData).length;
      const cleanSize = JSON.stringify(cleanData).length;
      const reduction = ((originalSize - cleanSize) / originalSize * 100).toFixed(1);

      return {
        original: originalSize,
        clean: cleanSize,
        reduction: `${reduction}%`
      };
    } catch (error) {
      console.error('計算資料大小失敗:', error);
      return { original: 0, clean: 0, reduction: '0%' };
    }
  }
}
