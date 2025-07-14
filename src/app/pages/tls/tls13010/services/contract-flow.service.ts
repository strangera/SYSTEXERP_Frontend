// contract-flow.service.ts - 增強版：支援資料版本控制和同步
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommissionItem, ConditionItem, ContractDataStructure, ContractInfo, FareItem, Step3DataChangeTracker, UnifiedCommissionResponse, WorkflowStatus, WorkflowStep } from '../tls13010.model';
import { DataChangeTracker, SubmitDataStructure } from '../tls13010.model';

@Injectable({
  providedIn: 'root'
})
export class ContractFlowService {
  private readonly STORAGE_KEY = 'TLS13010_CONTRACT_FLOW';

  // ========== 新增：資料版本控制 ==========
  private dataVersions = new Map<string, number>();
  private readonly VERSION_KEY_PREFIX = 'version_';

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
      _isNewContract: true // 🎯 新增模式需要標記
    }
  };

  // 工作流程狀態管理
  private workflowStatusSubject = new BehaviorSubject<WorkflowStatus>(this.initializeStatus());
  public workflowStatus$ = this.workflowStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
    this.setupAutoSave();
    this.initializeDataVersions();
  }

  /**
   * 🎯 新增：初始化資料版本控制
   */
  private initializeDataVersions(): void {
    // 初始化各步驟的版本號
    this.dataVersions.set('step1', 0);
    this.dataVersions.set('step2', 0);
    this.dataVersions.set('step3', 0);
    this.dataVersions.set('step4', 0);
    this.dataVersions.set('unified', 0);
    console.log('📊 資料版本控制初始化完成');
  }

  /**
   * 🎯 新增：取得資料版本號
   */
  getDataVersion(stepKey: string): number {
    try {
      const version = this.dataVersions.get(stepKey);
      if (version === undefined) {
        console.warn(`⚠️ 步驟 ${stepKey} 的版本號不存在，返回 0`);
        this.dataVersions.set(stepKey, 0);
        return 0;
      }
      return version;
    } catch (error) {
      console.error(`❌ 取得版本號失敗 (${stepKey}):`, error);
      return 0;
    }
  }
  /**
   * 🎯 新增：增加資料版本號
   */
  private incrementDataVersion(stepKey: string): number {
    try {
      const currentVersion = this.dataVersions.get(stepKey) || 0;
      const newVersion = currentVersion + 1;
      this.dataVersions.set(stepKey, newVersion);
      console.log(`📈 ${stepKey} 版本號更新為:`, newVersion);

      // 立即觸發儲存確保版本號同步
      this.saveToStorage();

      return newVersion;
    } catch (error) {
      console.error(`❌ 更新版本號失敗 (${stepKey}):`, error);
      return this.getDataVersion(stepKey);
    }
  }

  /**
   * 🎯 新增：公開的版本增加方法 (用於 Next2 → Next3 同步)
   */
  public incrementDataVersionPublic(stepKey: string): number {
    try {
      const result = this.incrementDataVersion(stepKey);
      console.log(`🔄 公開版本更新: ${stepKey} -> ${this.getDataVersion(stepKey)}`);
      return this.getDataVersion(stepKey);
    } catch (error) {
      console.error(`❌ 公開版本更新失敗 (${stepKey}):`, error);
      return this.getDataVersion(stepKey);
    }
  }

  /**
   * 🎯 新增：檢查版本是否有變更
   */
  hasVersionChanged(stepKey: string, lastKnownVersion: number): boolean {
    const currentVersion = this.getDataVersion(stepKey);
    return currentVersion > lastKnownVersion;
  }

  /**
   * 🎯 新增：驗證和修復版本號完整性
   */
  private validateAndRepairVersions(): void {
    const requiredSteps = ['step1', 'step2', 'step3', 'step4', 'unified'];
    let hasRepaired = false;

    requiredSteps.forEach(stepKey => {
      if (!this.dataVersions.has(stepKey)) {
        console.warn(`⚠️ 缺少 ${stepKey} 版本號，補充為 0`);
        this.dataVersions.set(stepKey, 0);
        hasRepaired = true;
      }
    });

    if (hasRepaired) {
      console.log('🔧 已修復版本號完整性:', Object.fromEntries(this.dataVersions.entries()));
    }
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
    // 🎯 新增模式：生成新的 contractId，但 talent_id 保持空
    const contractId = 'new_contract_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    this.contractData = {
      contractId: contractId,
      queryRowData: {
        ...queryRowData,
        talent_id: '', // 🎯 新增模式 talent_id 統一為空
        _isNewContract: true // 🎯 確保標記存在
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
        _isNewContract: true // 🎯 新增模式需要標記
      }
    };

    this.initializeDataVersions();

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

    // 🎯 檢查是否有現有暫存資料
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
          _isNewContract: false // 🎯 編輯模式不需要 _isNewContract
        }
      };

      this.initializeDataVersions();

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
    console.log('📋 當前模式:', modeInfo);

    if (modeInfo.isNewMode) {
      // 🎯 新增模式：talent_id 保持空，使用 contractId 追蹤
      console.log('🆕 新增模式：保持 talent_id 為空');
      formData.talent_id = '';

      // 🎯 確保 contractId 存在
      if (!this.contractData.contractId || !this.contractData.contractId.startsWith('new_contract_')) {
        this.contractData.contractId = 'new_contract_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        console.log('🆕 重新生成 contractId:', this.contractData.contractId);
      }
    } else {
      // 🎯 編輯模式：使用表單中的 talent_id 或從現有資料取得
      const targetTalentId = formData.talent_id || formData.apply_no || this.contractData.contractId;
      console.log('📝 編輯模式：使用 talent_id:', targetTalentId);

      this.contractData.contractId = targetTalentId;
      formData.talent_id = targetTalentId as string;
    }

    // 🎯 儲存 Step1 資料
    this.contractData.step1 = formData;
    this.contractData.metadata.lastModified = new Date();
    this.contractData.metadata.version += 1;

    // 🎯 更新版本號
    this.incrementDataVersion('step1');

    this.updateWorkflowStatus(WorkflowStep.CONTRACT_INFO);
    this.saveToStorage();

    console.log('✅ Step1 資料儲存完成:', {
      mode: modeInfo.modeName,
      contractId: this.contractData.contractId,
      talentId: formData.talent_id
    });
  }


  /**
   * 取得第1步資料
   */
  getStep1Data(queryData?: any): ContractInfo | null {
    console.log('🔍 取得 Step1 資料...');

    // 🎯 如果有 queryData，檢查是否匹配當前工作流程
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

      // 🎯 新增模式匹配檢查
      if (isQueryForNewMode && currentModeInfo.isNewMode) {
        console.log('✅ 新增模式匹配，回傳 Step1 資料');
        return this.contractData.step1;
      }

      // 🎯 編輯模式匹配檢查
      if (!isQueryForNewMode && !currentModeInfo.isNewMode && this.contractData.contractId === queryTalentId) {
        console.log('✅ 編輯模式匹配，回傳 Step1 資料');
        return this.contractData.step1;
      }

      console.log('❌ 查詢參數與當前工作流程不匹配');
      return null;
    }

    // 🎯 沒有 queryData，直接回傳當前 Step1 資料
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

      // 🎯 更新版本號
      this.incrementDataVersion('step2');

      this.updateWorkflowStatus(WorkflowStep.DEDUCTION);
      this.saveToStorage();

      console.log('儲存第2步資料:', data);
    }
  }

  /**
   * 🎯 修正：儲存第3步資料（抽成設定）
   */
  saveStep3Data(data: CommissionItem[]): void {
    console.log('💾 儲存 Step3 資料到工作流程...');
    console.log('📋 輸入資料:', data);
    console.log('📋 輸入資料類型:', typeof data);
    console.log('📋 是否為陣列:', Array.isArray(data));

    if (this.contractData.contractId) {
      const previousVersion = this.getDataVersion('step3');

      this.contractData.step3 = Array.isArray(data) ? data : [data];
      this.contractData.metadata.lastModified = new Date();
      this.contractData.metadata.version += 1;

      // 🎯 更新版本號
      this.incrementDataVersion('step3');

      console.log('✅ 已儲存 Step3 資料:');
      console.log('   - 項目數量:', this.contractData.step3.length);
      console.log('   - 版本號從', previousVersion, '更新為', this.getDataVersion('step3'));
      console.log('   - 儲存的資料:', this.contractData.step3);

      this.updateWorkflowStatus(WorkflowStep.COMMISSION);
      this.saveToStorage();

      // 🎯 Debug: 驗證儲存結果
      const savedData = this.getStep3Data();
      console.log('🔍 驗證儲存結果:', savedData);
    } else {
      console.error('❌ 沒有 contractId，無法儲存 Step3 資料');
    }
  }

  /**
   * 🎯 修正：儲存第4步資料（條件設定）
   */
  saveStep4Data(data: ConditionItem[]): void {
    if (this.contractData.contractId) {
      const previousVersion = this.getDataVersion('step4');

      this.contractData.step4 = Array.isArray(data) ? data : [data];
      this.contractData.metadata.lastModified = new Date();
      this.contractData.metadata.version += 1;

      // 🎯 更新版本號
      this.incrementDataVersion('step4');

      console.log('儲存第4步資料:');
      console.log('   - 項目數量:', this.contractData.step4.length);
      console.log('   - 版本號從', previousVersion, '更新為', this.getDataVersion('step4'));

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
    const previousVersion = this.getDataVersion('unified');

    this.contractData.unifiedCommissionData = data;
    this.contractData.metadata.lastModified = new Date();

    // 🎯 更新版本號
    this.incrementDataVersion('unified');

    this.saveToStorage();

    console.log('💾 已儲存統一抽成設定資料:');
    console.log('   - 版本號從', previousVersion, '更新為', this.getDataVersion('unified'));
    console.log('   - 資料:', data);
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

    // 優先使用統一 API 的結果
    if (unifiedData?.DataToDelete) {
      return unifiedData.DataToDelete;
    }

    // 備援：使用原本的 dataToDelete
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
      dataToDelete: null,
      unifiedCommissionData: null,
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: 1,
        _isNewContract: false
      }
    };

    // 🎯 重置版本號
    this.initializeDataVersions();

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

  // ========== 修改：儲存相關方法 (加強版本控制) ==========

  /**
   * 混合儲存：Memory + SessionStorage + 版本控制
   */
  private saveToStorage(): void {
    try {
      const saveData = {
        contractData: this.contractData,
        workflowStatus: this.workflowStatusSubject.value,
        dataVersions: Object.fromEntries(this.dataVersions.entries()), // 🎯 新增版本號儲存
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
   * 🎯 修正：套用載入的資料（包含版本號）
   */
  private applyLoadedData(data: any): void {
    try {
      this.contractData = data.contractData;
      this.workflowStatusSubject.next(data.workflowStatus);

      // 🎯 恢復版本號
      if (data.dataVersions && typeof data.dataVersions === 'object') {
        this.dataVersions.clear();
        Object.entries(data.dataVersions).forEach(([key, value]) => {
          if (typeof value === 'number' && value >= 0) {
            this.dataVersions.set(key, value);
          } else {
            console.warn(`⚠️ 無效的版本號 ${key}: ${value}, 設為 0`);
            this.dataVersions.set(key, 0);
          }
        });
        console.log('📊 已恢復資料版本號:', Object.fromEntries(this.dataVersions.entries()));
      } else {
        // 舊版本相容性或無效版本資料
        console.warn('⚠️ 無版本號資料，重新初始化');
        this.initializeDataVersions();
      }

      // 🎯 驗證版本號完整性
      this.validateAndRepairVersions();
    } catch (error) {
      console.error('❌ 套用載入資料失敗:', error);
      this.initializeDataVersions();
    }
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
   * 🎯 修正：取得第3步資料（抽成設定）
   */
  getStep3Data(): CommissionItem[] {
    console.log('🔍 取得 Step3 資料...');
    console.log('📋 contractData.step3:', this.contractData.step3);
    console.log('📋 資料類型:', typeof this.contractData.step3);
    console.log('📋 是否為陣列:', Array.isArray(this.contractData.step3));
    console.log('📋 Step3 版本號:', this.getDataVersion('step3'));

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
    console.log('🔍 取得 Step4 資料，版本號:', this.getDataVersion('step4'));
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

    // 1. 優先從 Step1 暫存資料取得（最新的）
    const step1Data = this.getStep1Data();
    if (step1Data?.tlt_term_type) {
      console.log('🎯 從 Step1 暫存取得抽成別:', step1Data.tlt_term_type);
      return step1Data.tlt_term_type.toString().trim();
    }

    // 2. 備援：從查詢資料取得（編輯模式）
    if (!this.isNewContractMode()) {
      const queryData = this.getQueryRowData();
      if (queryData?.tlt_term_type) {
        console.log('🎯 從查詢資料取得抽成別:', queryData.tlt_term_type);
        return queryData.tlt_term_type.toString().trim();
      }
    }

    // 3. 預設值（新增模式或無資料）
    console.log('🎯 使用預設抽成別: 3');
    return '3'; // 預設為一般抽成
  }

  /**
   * 取得當前合約的 talent_id
   */
  getCurrentTalentId(): string {
    // 🎯 新增模式統一回傳空字串
    if (this.isNewContractMode()) {
      console.log('🆕 新增模式：talent_id 回傳空字串');
      return '';
    }

    // 🎯 編輯模式：優先從 Step1 資料取得
    const step1Data = this.getStep1Data();
    if (step1Data?.talent_id) {
      console.log('📝 編輯模式：從 Step1 取得 talent_id:', step1Data.talent_id);
      return step1Data.talent_id.toString();
    }

    // 🎯 編輯模式：備援從查詢資料取得
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
   * 🎯 新增：監聽資料變更的方法
   */
  watchDataChanges(stepKey: string, callback: (version: number) => void): () => void {
    let lastKnownVersion = this.getDataVersion(stepKey);

    const intervalId = setInterval(() => {
      const currentVersion = this.getDataVersion(stepKey);
      if (currentVersion > lastKnownVersion) {
        lastKnownVersion = currentVersion;
        callback(currentVersion);
      }
    }, 500); // 每 500ms 檢查一次

    // 返回清理函數
    return () => clearInterval(intervalId);
  }

  /**
   * 🎯 新增：取得資料變更摘要
   */
  getDataChangeSummary(): any {
    return {
      versions: Object.fromEntries(this.dataVersions.entries()),
      lastModified: this.contractData.metadata.lastModified,
      totalVersion: this.contractData.metadata.version,
      hasStep1: !!this.contractData.step1,
      step2Count: this.contractData.step2.length,
      step3Count: this.contractData.step3.length,
      step4Count: this.contractData.step4.length,
      hasUnifiedData: !!this.contractData.unifiedCommissionData
    };
  }

  /**
   * 🎯 新增：強制同步所有資料
   */
  forceSyncAllData(): void {
    console.log('🔄 強制同步所有資料...');

    // 更新所有步驟的版本號
    this.incrementDataVersion('step1');
    this.incrementDataVersion('step2');
    this.incrementDataVersion('step3');
    this.incrementDataVersion('step4');
    this.incrementDataVersion('unified');

    // 立即儲存
    this.saveToStorage();

    console.log('✅ 強制同步完成，最新版本號:', Object.fromEntries(this.dataVersions.entries()));
  }

  generateSubmitData(): SubmitDataStructure {
    const step1Data = this.getStep1Data();
    // 🎯 檢查是否為新增模式
    const isNewContract = !step1Data?.talent_id || step1Data.talent_id === '';

    const step2Data = this.getStep2Data();
    const step3Data = this.getStep3Data();
    const step4Data = this.getStep4Data();

    // Step 1: 合約基本資料
    const step1Operation = isNewContract ? 'INSERT' : 'UPDATE';

    // Step 2: 代扣款資料
    const step2Changes = DataChangeTracker.generateChangeSummary(step2Data || [], '代扣款設定');

    // Step 3: 抽成設定資料
    const step3Changes = Step3DataChangeTracker.generateStep3ChangeSummary(step3Data || []);

    // Step 4: 條件設定資料
    const step4Changes = DataChangeTracker.generateChangeSummary(step4Data || [], '條件設定');

    // 計算總操作數
    const totalOperations =
      1 +
      step2Changes.summary.insert + step2Changes.summary.update + step2Changes.summary.delete +
      step3Changes.summary.insert + step3Changes.summary.update + step3Changes.summary.delete +
      step4Changes.summary.insert + step4Changes.summary.update + step4Changes.summary.delete;

    // 🎯 取得要刪除的舊資料（統一處理）
    const dataToDelete = this.getDataToDelete();
    const hasLegacyDataToDelete = this.hasDataToDelete();

    return {
      step1: {
        operation: step1Operation,
        data: {
          ...step1Data!,
          talent_id: step1Data?.talent_id || ''
        }
      },
      step2: {
        summary: step2Changes.summary,
        operations: {
          toInsert: step2Changes.data.toInsert,
          toUpdate: step2Changes.data.toUpdate,
          toDelete: step2Changes.data.toDelete
        }
      },
      step3: step3Changes,
      step4: {
        summary: step4Changes.summary,
        operations: {
          toInsert: step4Changes.data.toInsert,
          toUpdate: step4Changes.data.toUpdate,
          toDelete: step4Changes.data.toDelete
        }
      },
      legacyDataToDelete: dataToDelete, // 🎯 統一的刪除資料
      metadata: {
        talentId: this.contractData.contractId || '',
        contractId: this.contractData.contractId || '',
        isNewContract: isNewContract,
        submittedAt: new Date(),
        totalOperations,
        hasLegacyDataToDelete, // 🎯 標記是否有舊資料要刪除
        dataVersions: Object.fromEntries(this.dataVersions.entries()) // 🎯 包含版本資訊
      }
    };
  }

  /**
  * 🎯 新增：完全清空並重新開始（新增模式專用）
  */
  clearAndStartNew(): void {
    console.log('🆕 清空所有資料並開始新增模式');

    // 1. 清空所有暫存資料
    this.clearTempData();

    // 2. 重置版本號
    this.initializeDataVersions();

    // 3. 設定為新增模式狀態
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

    // 方法1：明確標記為新增
    if (currentData.queryRowData?._isNewContract === true) {
      return true;
    }

    // 方法2：contractId 是新增格式
    if (currentData.contractId?.startsWith('new_contract_')) {
      return true;
    }

    // 方法3：沒有 contractId 或 talent_id
    if (!currentData.contractId) {
      return true;
    }

    // 方法4：Step1 資料中 talent_id 為空
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

    // 🎯 基本工作流程檢查
    if (!this.contractData.contractId) {
      errors.push('缺少 contractId');
    }

    // 🎯 新增模式特定檢查
    if (modeInfo.isNewMode) {
      if (this.contractData.queryRowData?._isNewContract !== true) {
        warnings.push('新增模式標記不明確');
      }

      if (this.contractData.contractId && !this.contractData.contractId.startsWith('new_contract_')) {
        warnings.push('新增模式 contractId 格式異常');
      }
    }

    // 🎯 編輯模式特定檢查
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
      // 基本資訊
      mode: modeInfo,
      validation: validation,

      // 資料狀態
      hasStep1: !!this.contractData.step1,
      step2Count: this.contractData.step2?.length || 0,
      step3Count: this.contractData.step3?.length || 0,
      step4Count: this.contractData.step4?.length || 0,

      // 版本資訊
      dataVersions: Object.fromEntries(this.dataVersions.entries()),
      lastModified: this.contractData.metadata?.lastModified,

      // 工作流程狀態
      currentStep: this.workflowStatusSubject.value.currentStep,
      completedSteps: this.workflowStatusSubject.value.completedSteps
    };
  }

  /**
   * 🎯 新增：重置為新增模式（清空並重新開始）
   */
  resetToNewMode(): void {
    console.log('🔄 重置為新增模式');

    // 1. 清空所有資料
    this.clearTempData();

    // 2. 初始化新增模式
    const emptyQueryData = {
      talent_id: '',
      apply_no: '',
      tlt_name: '',
      _isNewContract: true
    };

    this.startWorkflow(emptyQueryData);

    console.log('✅ 已重置為新增模式');
  }
}
