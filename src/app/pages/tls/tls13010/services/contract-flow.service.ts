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
  DataCleaner,
  DataClearOperations,
  CommissionTypeChangeInfo
} from '../tls13010.model';
import { TLS13010Service } from '@service/api/tls/tls13010.service';

@Injectable({
  providedIn: 'root'
})
export class ContractFlowService {
  private readonly STORAGE_KEY = 'TLS13010_CONTRACT_FLOW';
  private readonly VIEW_MODE_KEY = 'TLS13010_VIEW_MODE';

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
      _isNewContract: true,
      _isViewMode: false,
      _loadedFromAPI: false
    }
  };

  // 工作流程狀態管理
  private workflowStatusSubject = new BehaviorSubject<WorkflowStatus>(this.initializeStatus());
  public workflowStatus$ = this.workflowStatusSubject.asObservable();

  constructor(private http: HttpClient, private tls13010Service: TLS13010Service) {
    this.loadFromStorage();
    this.setupAutoSave();

    this.restoreViewMode(); // 初始化時恢復檢視模式狀態
  }

  // ========== 清理後的資料生成方法 ==========
  generateCleanSubmitData(): CleanSubmitData {
    console.log('開始生成清理後的提交資料...');

    const step1Data = this.getStep1Data();
    const step2Data = this.getStep2Data();
    const step3Data = this.getStep3Data();
    const step4Data = this.getStep4Data();

    const modeInfo = this.getWorkflowModeInfo();

    // 驗證必要資料
    if (!step1Data) {
      throw new Error('缺少合約基本資料 (Step 1)');
    }

    // 從 Step1 CRU 頁面取得合約日期
    const contractStartDate = this.formatDateForBackend(step1Data.tlt_bdate);
    const contractEndDate = this.formatDateForBackend(step1Data.tlt_edate);

    console.log('從 CRU 頁面取得的合約日期:', {
      tlt_bdate: step1Data.tlt_bdate,
      tlt_edate: step1Data.tlt_edate,
      格式化後_起始日: contractStartDate,
      格式化後_結束日: contractEndDate
    });

    // 驗證合約日期
    if (!contractStartDate || !contractEndDate) {
      console.error('CRU 頁面的合約日期無效:', {
        原始tlt_bdate: step1Data.tlt_bdate,
        原始tlt_edate: step1Data.tlt_edate,
        格式化後起始日: contractStartDate,
        格式化後結束日: contractEndDate
      });
      throw new Error('合約起始日期或結束日期無效，請檢查 CRU 頁面的日期設定');
    }

    // 確保 step4Data 不會是 undefined 或 null
    const safeStep4Data = step4Data || [];
    const currentCommissionType = this.getCurrentCommissionType();

    console.log('Step4 條件資料除錯:', {
      原始step4Data長度: step4Data?.length || 0,
      安全step4Data長度: safeStep4Data.length,
      抽成類型: currentCommissionType,
      step4Data類型: typeof step4Data,
      step4Data是否為陣列: Array.isArray(step4Data)
    });

    // 檢查每個項目的詳細內容
    if (safeStep4Data.length > 0) {
      console.log('Step4 項目詳細檢查:');
      safeStep4Data.forEach((item, index) => {
        console.log(`項目 ${index}:`, {
          id: item.id,
          屬性列表: Object.keys(item),
          _status: item._status,
          有seq_no: 'seq_no' in item,
          有charge_rate: 'charge_rate' in item,
          有start_number: 'start_number' in item,
          有end_number: 'end_number' in item,
          項目內容預覽: {
            seq_no: (item as any).seq_no,
            charge_rate: (item as any).charge_rate,
            start_number: (item as any).start_number,
            end_number: (item as any).end_number
          }
        });
      });
    } else {
      console.warn('Step4 資料為空，可能的原因:', {
        原始step4Data: step4Data,
        工作流程資料: this.contractData?.step4
      });
    }

    console.log('準備清理的原始資料:', {
      step1Items: step1Data ? 1 : 0,
      step2Items: step2Data?.length || 0,
      step3Items: step3Data?.length || 0,
      step4Items: safeStep4Data.length,
      mode: modeInfo.modeName,
      合約日期範圍: `${contractStartDate} ~ ${contractEndDate}`
    });

    try {
      // 調用 DataCleaner 前的最後檢查
      console.log('準備調用 DataCleaner.cleanConditionData:', {
        輸入資料數量: safeStep4Data.length,
        抽成類型: currentCommissionType
      });

      // 調用 DataCleaner
      const cleanedConditions = DataCleaner.cleanConditionData(safeStep4Data, currentCommissionType);

      // 檢查 DataCleaner 的處理結果
      console.log('DataCleaner 處理結果:', {
        條件類型: Object.keys(cleanedConditions),
        各類型統計: Object.entries(cleanedConditions).map(([key, value]: [string, any]) => ({
          類型: key,
          toInsert: value?.toInsert?.length || 0,
          toUpdate: value?.toUpdate?.length || 0,
          toDelete: value?.toDelete?.length || 0
        }))
      });

      // 特別檢查 graduated 的結果
      if (cleanedConditions.graduated) {
        console.log('graduated 詳細結果:', {
          toInsert數量: cleanedConditions.graduated.toInsert.length,
          toUpdate數量: cleanedConditions.graduated.toUpdate.length,
          toDelete數量: cleanedConditions.graduated.toDelete.length,
          toInsert內容: cleanedConditions.graduated.toInsert,
          toUpdate內容: cleanedConditions.graduated.toUpdate,
          toDelete內容: cleanedConditions.graduated.toDelete
        });
      }

      // 使用 DataCleaner 清理各步驟資料
      const cleanData: CleanSubmitData = {
        contractInfo: {
          operation: modeInfo.isNewMode ? 'INSERT' : 'UPDATE',
          data: DataCleaner.cleanContractInfo(step1Data)
        },

        deductions: DataCleaner.cleanDeductionItems(step2Data || []),

        // 關鍵修正：傳遞合約日期給 DataCleaner
        commissions: DataCleaner.cleanCommissionData(
          step3Data || [],
          contractStartDate,
          contractEndDate
        ),

        conditions: cleanedConditions, // 使用已經處理過的結果

        metadata: {
          talentId: modeInfo.talentId,
          contractId: modeInfo.contractId,
          commissionType: currentCommissionType,
          isNewContract: modeInfo.isNewMode,
          submittedAt: new Date().toISOString(),
          totalOperations: this.calculateTotalOperations(step2Data, step3Data, safeStep4Data)
        }
      };

      // 檢測抽成別變更
      const commissionTypeChange = this.detectCommissionTypeChange();
      if (commissionTypeChange) {
        cleanData.commissionTypeChange = commissionTypeChange;
      }

      console.log('清理後的提交資料生成完成');
      console.log('清理後資料統計:', {
        contractOperation: cleanData.contractInfo.operation,
        deductionInserts: cleanData.deductions.toInsert.length,
        deductionUpdates: cleanData.deductions.toUpdate.length,
        deductionDeletes: cleanData.deductions.toDelete.length,
        commissionMasterInserts: cleanData.commissions.masters.toInsert.length,
        commissionMasterUpdates: cleanData.commissions.masters.toUpdate.length,
        conditionOperations: Object.entries(cleanData.conditions).map(([key, value]: [string, any]) => ({
          type: key,
          inserts: value?.toInsert?.length || 0,
          updates: value?.toUpdate?.length || 0,
          deletes: value?.toDelete?.length || 0
        })),
        totalOperations: cleanData.metadata.totalOperations
      });

      // 驗證 Commission Master 的日期是否正確設定
      if (cleanData.commissions.masters.toInsert.length > 0) {
        const firstMaster = cleanData.commissions.masters.toInsert[0];
        console.log('驗證第一個 Commission Master 的日期:', {
          tlt_id: firstMaster.tlt_id,
          cag_bdate: firstMaster.cag_bdate,
          cag_edate: firstMaster.cag_edate,
          是否等於合約日期: {
            起始日相符: firstMaster.cag_bdate === contractStartDate,
            結束日相符: firstMaster.cag_edate === contractEndDate
          }
        });
      }

      // 特別檢查條件資料的處理結果
      console.log('條件資料處理結果:', {
        原始step4長度: safeStep4Data.length,
        處理後條件: Object.keys(cleanData.conditions),
        各條件統計: Object.entries(cleanData.conditions).reduce((acc, [key, value]: [string, any]) => {
          acc[key] = {
            toInsert: value?.toInsert?.length || 0,
            toUpdate: value?.toUpdate?.length || 0,
            toDelete: value?.toDelete?.length || 0
          };
          return acc;
        }, {} as any)
      });

      console.log('最終要送出的完整 JSON:');
      console.log(JSON.stringify(cleanData, null, 2));
      return cleanData;

    } catch (error) {
      console.error('生成清理後資料時發生錯誤:', error);
      throw new Error(`生成提交資料失敗: ${error}`);
    }
  }

  /**
   * 🎯 新增：格式化日期給後端使用
   */
  private formatDateForBackend(date: any): string {
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

      if (isNaN(dateObj.getTime())) {
        console.warn('⚠️ 無效的日期值:', date);
        return '';
      }

      // 格式化為 YYYY-MM-DD
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;

    } catch (error) {
      console.error('❌ 日期格式化錯誤:', error, date);
      return '';
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

    // if (!cleanData.contractInfo.data.apply_no) {
    //   errors.push('專櫃招募編號不能為空');
    // }

    if (!cleanData.contractInfo.data.tlt_name) {
      errors.push('品牌名稱不能為空');
    }

    // 抽成設定驗證
    const hasCommissions = cleanData.commissions.masters.toInsert.length > 0 ||
      cleanData.commissions.masters.toUpdate.length > 0;

    if (!hasCommissions && cleanData.contractInfo.data.tlt_term_type === '3') {
      // warnings.push('一般抽成模式建議至少設定一個抽成項目');
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
    // 🎯 工作流程啟動後恢復檢視模式狀態
    setTimeout(() => {
      this.restoreViewMode();
    }, 100);

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
        _isNewContract: true,
        _isViewMode: false,
        _loadedFromAPI: false
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
          _isNewContract: false,
          _isViewMode: false,
          _loadedFromAPI: false
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

  // 檢視模式狀態管理
  private isViewModeSubject = new BehaviorSubject<boolean>(false);
  public isViewMode$ = this.isViewModeSubject.asObservable();
  /**
  * 設定檢視模式
  */
  setViewMode(isViewMode: boolean): void {
    this.isViewModeSubject.next(isViewMode);
    console.log('🔍 設定檢視模式:', isViewMode);
    this.persistViewMode(isViewMode);
  }


  /**
   * 🎯 新增：開始檢視工作流程
   */
  startViewWorkflow(queryRowData: any): void {
    console.log('🔍 開始檢視工作流程:', queryRowData);

    // 設定為檢視模式
    this.setViewMode(true);

    // 使用現有的編輯模式邏輯，但設定為唯讀
    this.initializeEditContractWorkflow(queryRowData);

    // 然後設定為檢視模式（會自動持久化）
    this.setViewMode(true);
  }


  /**
 * 取得當前是否為檢視模式
 */
  isViewMode(): boolean {
    return this.isViewModeSubject.value;
  }

  /**
 * 🎯 新增：從 router state 初始化工作流程
 */
  async initializeFromRouterState(routerState: any): Promise<boolean> {
    try {
      console.log('🚀 從 router state 初始化工作流程:', routerState);

      const { mode, talentId, contractData, loadFromAPI } = routerState;

      // 設定模式
      if (mode === 'view') {
        this.setViewMode(true);
      } else {
        this.setViewMode(false);
      }

      // 根據是否需要 API 載入決定初始化方式
      if (loadFromAPI && talentId) {
        // 需要從 API 載入
        return await this.loadContractFromAPI(talentId, mode);
      } else if (contractData) {
        // 直接使用傳遞的資料
        this.initializeFromContractData(contractData, mode);
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ 從 router state 初始化失敗:', error);
      return false;
    }
  }
  /**
   * 🎯 新增：清除檢視模式
   */
  clearViewMode(): void {
    this.isViewModeSubject.next(false);

    // 🎯 清除持久化資料
    this.clearPersistedViewMode();
    console.log('🗑️ 已清除檢視模式');
  }

  /**
  * 🎯 新增：清除持久化的檢視模式資料
  */
  private clearPersistedViewMode(): void {
    try {
      const contractId = this.contractData.contractId;
      if (contractId) {
        const viewModeKey = `${this.VIEW_MODE_KEY}_${contractId}`;
        sessionStorage.removeItem(viewModeKey);
        console.log('🗑️ 已清除檢視模式持久化資料:', contractId);
      }
    } catch (error) {
      console.warn('⚠️ 無法清除檢視模式持久化資料:', error);
    }
  }

  /**
   * 🎯 新增：從 API 載入合約資料
   */
  private async loadContractFromAPI(talentId: string, mode: string): Promise<boolean> {
    try {
      console.log('🔄 從 API 載入合約資料:', { talentId, mode });

      // 🎯 使用現有的查詢 API （您需要注入 TLS13010Service）
      const response = await this.tls13010Service.queryTLS13010({
        talent_id: talentId
        // 其他必要參數...
      }).toPromise();

      if (response?.Status === '0000' && response?.Data?.length > 0) {
        const contractData = response.Data[0];
        this.initializeFromContractData(contractData, mode);
        return true;
      }

      return false;

    } catch (error) {
      console.error('❌ API 載入失敗:', error);
      return false;
    }
  }

  /**
   * 從合約資料初始化工作流程
   */
  private initializeFromContractData(contractData: any, mode: string): void {
    const contractId = contractData.talent_id || contractData.apply_no;
    const isViewMode = mode === 'view';

    // 標記資料來源
    const enhancedContractData = {
      ...contractData,
      _isNewContract: false,
      _isViewMode: isViewMode,
      _loadedFromAPI: true
    };

    this.contractData = {
      contractId: contractId,
      queryRowData: enhancedContractData,
      step1: null, // 會從 queryRowData 建立
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
        _isNewContract: false,
        _isViewMode: isViewMode,
        _loadedFromAPI: true
      }
    };

    // 設定工作流程狀態
    const workflowStatus: WorkflowStatus = {
      currentStep: WorkflowStep.CONTRACT_INFO,
      completedSteps: isViewMode ? [WorkflowStep.CONTRACT_INFO] : [],
      canProceed: true,
      contractId: contractId,
      lastModified: new Date(),
      isNewContract: false
    };

    this.workflowStatusSubject.next(workflowStatus);

    console.log('✅ 工作流程初始化完成');
  }

  /**
   * 🎯 修正：儲存第1步資料
   */
  saveStep1Data(formData: ContractInfo): void {
    if (this.isViewMode()) {
      console.log('🔍 檢視模式，跳過 Step1 資料儲存');
      return;
    }
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
        // console.log('✅ 新增模式匹配，回傳 Step1 資料');
        return this.contractData.step1;
      }

      if (!isQueryForNewMode && !currentModeInfo.isNewMode && this.contractData.contractId === queryTalentId) {
        // console.log('✅ 編輯模式匹配，回傳 Step1 資料');
        return this.contractData.step1;
      }

      console.log('❌ 查詢參數與當前工作流程不匹配');
      return null;
    }

    // console.log('📋 直接回傳當前 Step1 資料');
    return this.contractData.step1;
  }

  /**
   * 🎯 修正：儲存第2步資料（代扣款）
   */
  saveStep2Data(data: FareItem[]): void {
    if (this.isViewMode()) {
      console.log('🔍 檢視模式，跳過 Step2 資料儲存');
      return;
    }
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
    if (this.isViewMode()) {
      console.log('🔍 檢視模式，跳過 Step3 資料儲存');
      return;
    }
    if (this.contractData.contractId) {
      this.contractData.step3 = Array.isArray(data) ? data : [data];
      this.contractData.metadata.lastModified = new Date();
      this.contractData.metadata.version += 1;
      this.updateWorkflowStatus(WorkflowStep.COMMISSION);
      this.saveToStorage();
    }
  }

  /**
   * 儲存第4步資料（條件設定）
   */
  saveStep4Data(data: ConditionItem[]): void {
    if (this.isViewMode()) {
      console.log('🔒 檢視模式，跳過 Step4 資料儲存');
      return;
    }

    console.log('💾 準備儲存 Step4 資料:', data);
    console.log('資料類型:', typeof data, '是否為陣列:', Array.isArray(data));
    console.log('資料長度:', data?.length);

    if (this.contractData.contractId) {
      // 確保資料格式正確
      this.contractData.step4 = Array.isArray(data) ? data : [data];
      this.contractData.metadata.lastModified = new Date();
      this.contractData.metadata.version += 1;
      this.updateWorkflowStatus(WorkflowStep.CONDITION);

      // 立即儲存到 storage
      this.saveToStorage();

      console.log('✅ Step4 資料儲存完成，項目數:', this.contractData.step4.length);

      // 驗證儲存結果
      const verification = this.getStep4Data();
      console.log('🔍 儲存驗證:', {
        storageItemCount: verification?.length || 0,
        originalItemCount: data?.length || 0,
        isConsistent: (verification?.length || 0) === (data?.length || 0)
      });

    } else {
      console.error('❌ 無 contractId，無法儲存 Step4 資料');
      throw new Error('無法儲存 Step4 資料：缺少 contractId');
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
    // 清除檢視模式
    this.clearViewMode();

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
        _isNewContract: false,
        _isViewMode: false,
        _loadedFromAPI: false
      }
    };

    this.workflowStatusSubject.next(this.initializeStatus());
    this.clearStorage();
    console.log('清空所有暫存資料');
  }

  /**
   * 🎯 新增：檢查當前合約的檢視模式狀態
   */
  checkContractViewMode(contractId: string): boolean {
    try {
      const viewModeKey = `${this.VIEW_MODE_KEY}_${contractId}`;
      const savedViewModeData = sessionStorage.getItem(viewModeKey);

      if (savedViewModeData) {
        const { isViewMode } = JSON.parse(savedViewModeData);
        return isViewMode === true;
      }
    } catch (error) {
      console.warn('⚠️ 檢查檢視模式狀態失敗:', error);
    }

    return false; // 預設為編輯模式
  }

  /**
  * 🎯 新增：強制設定為檢視模式（用於外部程式跳轉）
  */
  forceViewMode(contractId: string): void {
    console.log('🔒 強制設定為檢視模式:', contractId);

    // 先更新當前狀態
    this.setViewMode(true);

    // 確保資料結構中也有正確的標記
    if (this.contractData.metadata) {
      this.contractData.metadata._isViewMode = true;
    }
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
  // 在 contract-flow.service.ts 中
  getStep4Data(): ConditionItem[] {
    console.log('📖 讀取 Step4 資料...');
    console.log('contractData.step4:', this.contractData.step4);
    console.log('資料類型:', typeof this.contractData.step4);
    console.log('是否為陣列:', Array.isArray(this.contractData.step4));

    if (this.contractData.step4) {
      console.log('✅ 找到 Step4 資料，項目數量:', this.contractData.step4.length);
      return this.contractData.step4;
    } else {
      console.warn('⚠️ 沒有找到 Step4 資料，返回空陣列');
      return [];
    }
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

  /**
  * 🎯 新增：檢測抽成別是否有變更
  */
  detectCommissionTypeChange(): CommissionTypeChangeInfo | null {
    try {
      // 取得原始資料的抽成別
      const originalData = this.getCurrentData()?.queryRowData;
      const originalCommissionType = originalData?.tlt_term_type?.toString().trim();

      // 取得目前 Step1 的抽成別
      const currentStep1Data = this.getStep1Data();
      const currentCommissionType = currentStep1Data?.tlt_term_type?.toString().trim();

      console.log('🔍 抽成別變更檢測:', {
        originalCommissionType,
        currentCommissionType,
        hasChanged: originalCommissionType !== currentCommissionType
      });

      // 如果是新增模式，不需要變更檢測
      if (this.isNewContractMode()) {
        return null;
      }

      // 如果沒有變更，返回 null
      if (originalCommissionType === currentCommissionType) {
        return null;
      }

      // 有變更，建立變更資訊
      return {
        HasChanged: true,
        OriginalTermType: originalCommissionType || '',
        NewTermType: currentCommissionType || '',
        ClearOperations: this.generateClearOperations(originalCommissionType || '')
      };

    } catch (error) {
      console.error('❌ 檢測抽成別變更失敗:', error);
      return null;
    }
  }

  /**
   * 🎯 新增：根據原抽成別生成清除操作
   */
  private generateClearOperations(originalTermType: string): DataClearOperations {
    const clearOps: DataClearOperations = {
      clearRentDetails: false,
      clearCommissionMasters: false,
      clearChargedDetails: false,
      clearLimitDetails: false,
      clearLevelDetails: false
    };

    switch (originalTermType) {
      case '1': // 固定租金 -> 只清除租金條件
        clearOps.clearRentDetails = true;
        break;

      case '2': // 底租抽成取高者 -> 只清除租金條件 (抽成設定保留)
        clearOps.clearRentDetails = true;
        break;

      case '3': // 一般抽成 -> 無需清除條件設定
        // 不需要清除任何條件設定
        break;

      case '4': // 包底抽成 -> 清除包底條件
        clearOps.clearLimitDetails = true;
        break;

      case '5': // 階梯抽成 -> 清除階梯條件
        clearOps.clearLevelDetails = true;
        break;

      case '6': // 包底加階梯 -> 清除包底 + 階梯條件
        clearOps.clearLimitDetails = true;
        clearOps.clearLevelDetails = true;
        break;
    }


    return clearOps;
  }

  /**
   * 🎯 簡單的檢視模式判定（暫時都回傳 false，讓使用者選擇）
   */
  shouldBeViewMode(rowData: any): boolean {
    // 暫時先都回傳 false，表示都可以編輯
    // 未來有特殊需求再加判定邏輯
    return false;
  }

  /**
   * 🎯 智慧啟動（自動判定模式）
   */
  startSmartWorkflow(rowData: any): void {
    const isViewMode = this.shouldBeViewMode(rowData);

    if (isViewMode) {
      this.setViewMode(true);
    } else {
      this.setViewMode(false);
    }

    this.startWorkflow(rowData);
    console.log('🎯 智慧啟動完成，模式:', isViewMode ? '檢視' : '編輯');
  }

  /**
  * 🎯 新增：持久化檢視模式狀態
  */
  private persistViewMode(isViewMode: boolean): void {
    try {
      const contractId = this.contractData.contractId;
      if (contractId) {
        const viewModeKey = `${this.VIEW_MODE_KEY}_${contractId}`;
        sessionStorage.setItem(viewModeKey, JSON.stringify({
          isViewMode,
          contractId,
          timestamp: Date.now()
        }));
        console.log('💾 檢視模式已持久化:', { isViewMode, contractId });
      }
    } catch (error) {
      console.warn('⚠️ 無法持久化檢視模式狀態:', error);
    }
  }

  /**
   * 🎯 新增：從持久化儲存中恢復檢視模式
   */
  private restoreViewMode(): void {
    try {
      const contractId = this.contractData.contractId;
      if (contractId) {
        const viewModeKey = `${this.VIEW_MODE_KEY}_${contractId}`;
        const savedViewModeData = sessionStorage.getItem(viewModeKey);

        if (savedViewModeData) {
          const { isViewMode, timestamp } = JSON.parse(savedViewModeData);

          // 檢查資料是否過期（24小時）
          const now = Date.now();
          const maxAge = 24 * 60 * 60 * 1000; // 24小時

          if (now - timestamp < maxAge) {
            this.isViewModeSubject.next(isViewMode);
            console.log('🔄 恢復檢視模式狀態:', { isViewMode, contractId });
            return;
          } else {
            // 過期資料，清除
            sessionStorage.removeItem(viewModeKey);
            console.log('🗑️ 清除過期的檢視模式資料');
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ 無法恢復檢視模式狀態:', error);
    }

    // 預設為編輯模式
    this.isViewModeSubject.next(false);
  }
}
