import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, fromEvent, merge, timer } from 'rxjs';
import { debounceTime, takeUntil, filter } from 'rxjs/operators';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { WorkflowStep } from '../../core/constants';
import {
  ContractInfo,
  ContractRequest,
  FareItem,
  CommissionItem,
  ConditionItem,
  UnifiedCommissionResponse
} from '../../core/models';
import { WorkflowStateService } from './workflow-state.service';
import { WorkflowStorageService } from './workflow-storage.service';
import { WorkflowNavigationService } from './workflow-navigation.service';

/**
 * 工作流程門面服務
 *
 * 職責: 整合所有工作流程相關服務，提供高階 API
 * - 初始化工作流程 (新增/編輯/檢視)
 * - 自動保存機制
 * - 步驟間資料傳遞
 * - 提交合約
 */
@Injectable({ providedIn: 'root' })
export class WorkflowFacadeService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly AUTO_SAVE_INTERVAL = 30000; // 30 秒自動保存

  constructor(
    private stateService: WorkflowStateService,
    private storageService: WorkflowStorageService,
    private navigationService: WorkflowNavigationService
  ) {
    this.initAutoSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========== 工作流程初始化 ==========

  /**
   * 開始新合約工作流程
   */
  startNewContractWorkflow(): void {
    // 重置狀態
    this.stateService.reset();

    // 設定新合約模式
    this.stateService.setNewContractMode(true);
    this.stateService.setContractId(`new_contract_${Date.now()}`);
    this.stateService.setCrudStatus(CRUDStatus.Create);

    // 導航到第一步
    this.navigationService.navigateToStep(WorkflowStep.CONTRACT_INFO);
  }

  /**
   * 開始編輯合約工作流程
   */
  startEditContractWorkflow(queryRowData: ContractRequest): void {
    // 重置狀態
    this.stateService.reset();

    // 設定編輯模式
    this.stateService.setNewContractMode(false);
    this.stateService.setQueryRowData(queryRowData);
    this.stateService.setContractId(queryRowData.talent_id);
    this.stateService.setCrudStatus(CRUDStatus.Edit);

    // 導航到第一步
    this.navigationService.navigateToStep(WorkflowStep.CONTRACT_INFO);
  }

  /**
   * 開始檢視合約工作流程
   */
  startViewContractWorkflow(queryRowData: ContractRequest): void {
    // 重置狀態
    this.stateService.reset();

    // 設定檢視模式
    this.stateService.setNewContractMode(false);
    this.stateService.setQueryRowData(queryRowData);
    this.stateService.setContractId(queryRowData.talent_id);
    this.stateService.setCrudStatus(CRUDStatus.Read);
    this.stateService.setViewMode(true);

    // 導航到第一步
    this.navigationService.navigateToStep(WorkflowStep.CONTRACT_INFO);
  }

  /**
   * 嘗試恢復上次工作流程
   */
  tryRestoreWorkflow(): boolean {
    const storedData = this.storageService.load();

    if (!storedData) {
      return false;
    }

    // 恢復狀態
    this.stateService.updateWorkflowStatus(storedData.workflowStatus);
    this.stateService.updateContractData(storedData.contractData);

    return true;
  }

  // ========== 步驟資料管理 ==========

  /**
   * 保存 Step 1 資料並前進
   */
  saveStep1AndProceed(data: ContractInfo): void {
    this.stateService.setStep1Data(data);
    this.saveToStorage();
    this.navigationService.goToNextStep();
  }

  /**
   * 保存 Step 2 資料並前進
   */
  saveStep2AndProceed(data: FareItem[]): void {
    this.stateService.setStep2Data(data);
    this.saveToStorage();
    this.navigationService.goToNextStep();
  }

  /**
   * 保存 Step 3 資料並前進
   */
  saveStep3AndProceed(data: CommissionItem[]): void {
    this.stateService.setStep3Data(data);
    this.saveToStorage();
    this.navigationService.goToNextStep();
  }

  /**
   * 保存 Step 4 資料 (最後一步，不自動前進)
   */
  saveStep4(data: ConditionItem[]): void {
    this.stateService.setStep4Data(data);
    this.saveToStorage();
  }

  /**
   * 設定 Step 2 資料 (僅設定，不前進)
   */
  setStep2Data(data: FareItem[]): void {
    this.stateService.setStep2Data(data);
    this.saveToStorage();
  }

  /**
   * 設定 Step 3 資料 (僅設定，不前進)
   */
  setStep3Data(data: CommissionItem[]): void {
    this.stateService.setStep3Data(data);
    this.saveToStorage();
  }

  /**
   * 設定 Step 4 資料 (別名)
   */
  setStep4Data(data: ConditionItem[]): void {
    this.saveStep4(data);
  }

  /**
   * 產生提交資料 (用於最終儲存)
   */
  generateSubmitData(): {
    step1: ContractInfo | null;
    step2: FareItem[];
    step3: CommissionItem[];
    step4: ConditionItem[];
    isNew: boolean;
  } {
    return {
      step1: this.stateService.getStep1Data(),
      step2: this.stateService.getStep2Data(),
      step3: this.stateService.getStep3Data(),
      step4: this.stateService.getStep4Data(),
      isNew: this.stateService.isNewContractMode()
    };
  }

  /**
   * 清除所有資料
   */
  clearAllData(): void {
    this.stateService.reset();
    this.storageService.clear();
  }

  /**
   * 設定統一抽成回應資料
   */
  setUnifiedCommissionData(data: UnifiedCommissionResponse | null): void {
    this.stateService.setUnifiedCommissionData(data);
    this.saveToStorage();
  }

  /**
   * 設定 Step 1 資料 (僅設定，不前進)
   */
  setStep1Data(data: ContractInfo): void {
    this.stateService.setStep1Data(data);
    this.saveToStorage();
  }

  /**
   * 取得位置資料
   */
  getLocationData(): any[] {
    return this.stateService.getLocationData();
  }

  /**
   * 設定位置資料
   */
  setLocationData(data: any[]): void {
    this.stateService.setLocationData(data);
    this.saveToStorage();
  }

  /**
   * 設定抽成類型
   */
  setCommissionType(type: string): void {
    this.stateService.setCommissionType(type);
    this.saveToStorage();
  }

  // ========== 導航 ==========

  /**
   * 前進到下一步
   */
  goToNextStep(): boolean {
    return this.navigationService.goToNextStep();
  }

  /**
   * 返回上一步
   */
  goToPreviousStep(): boolean {
    return this.navigationService.goToPreviousStep();
  }

  /**
   * 導航到指定步驟
   */
  goToStep(step: WorkflowStep): boolean {
    return this.navigationService.navigateToStep(step);
  }

  /**
   * 取消並返回查詢頁面
   */
  cancel(): void {
    this.storageService.clear();
    this.navigationService.cancel();
  }

  // ========== 狀態查詢 ==========

  /** 取得當前步驟 */
  getCurrentStep(): WorkflowStep {
    return this.stateService.getCurrentStep();
  }

  /**
   * 取得當前狀態物件 (用於組件初始化)
   */
  getCurrentStatus(): { isNewMode: boolean; isViewMode: boolean; isEditMode: boolean } {
    const isNew = this.stateService.isNewContractMode();
    const isView = this.stateService.isViewMode();
    return {
      isNewMode: isNew,
      isViewMode: isView,
      isEditMode: !isNew && !isView
    };
  }

  /** 是否為新合約模式 */
  isNewContractMode(): boolean {
    return this.stateService.isNewContractMode();
  }

  /** 是否為檢視模式 */
  isViewMode(): boolean {
    return this.stateService.isViewMode();
  }

  /** 取得查詢列資料 */
  getQueryRowData(): ContractRequest | null {
    return this.stateService.getQueryRowData();
  }

  /** 取得 Step 1 資料 */
  getStep1Data(): ContractInfo | null {
    return this.stateService.getStep1Data();
  }

  /** 取得 Step 2 資料 */
  getStep2Data(): FareItem[] {
    return this.stateService.getStep2Data();
  }

  /** 取得 Step 3 資料 */
  getStep3Data(): CommissionItem[] {
    return this.stateService.getStep3Data();
  }

  /** 取得 Step 4 資料 */
  getStep4Data(): ConditionItem[] {
    return this.stateService.getStep4Data();
  }

  // ========== Observable 訂閱 ==========

  /** 當前步驟變更 */
  get currentStep$(): Observable<WorkflowStep> {
    return this.stateService.currentStep$;
  }

  /** 是否為檢視模式 */
  get viewMode$(): Observable<boolean> {
    return this.stateService.viewMode$;
  }

  /** Step 1 資料 */
  get step1Data$(): Observable<ContractInfo | null> {
    return this.stateService.step1Data$;
  }

  /** Step 2 資料 */
  get step2Data$(): Observable<FareItem[]> {
    return this.stateService.step2Data$;
  }

  /** Step 3 資料 */
  get step3Data$(): Observable<CommissionItem[]> {
    return this.stateService.step3Data$;
  }

  /** Step 4 資料 */
  get step4Data$(): Observable<ConditionItem[]> {
    return this.stateService.step4Data$;
  }

  // ========== 私有方法 ==========

  /**
   * 保存到 SessionStorage
   */
  private saveToStorage(): void {
    const workflowStatus = this.stateService.getWorkflowStatus();
    const contractData = this.stateService.getContractData();
    this.storageService.save(workflowStatus, contractData);
  }

  /**
   * 初始化自動保存機制
   */
  private initAutoSave(): void {
    // 定時自動保存
    timer(this.AUTO_SAVE_INTERVAL, this.AUTO_SAVE_INTERVAL)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.stateService.getCurrentStep() !== WorkflowStep.QUERY) {
          this.saveToStorage();
        }
      });

    // 頁面離開前保存
    if (typeof window !== 'undefined') {
      fromEvent(window, 'beforeunload')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.saveToStorage();
        });
    }
  }
}
