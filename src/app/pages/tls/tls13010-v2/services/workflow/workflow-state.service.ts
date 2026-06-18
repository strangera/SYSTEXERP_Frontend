import { Injectable } from '@angular/core';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { BehaviorSubject, Observable, distinctUntilChanged, map } from 'rxjs';
import { WorkflowStep } from '../../core/constants';
import {
  CommissionItem,
  ConditionItem,
  ContractDataStructure,
  ContractInfo,
  ContractRequest,
  FareItem,
  FinalData,
  UnifiedCommissionResponse,
  WorkflowStatus
} from '../../core/models';

/**
 * 工作流程初始狀態
 */
const initialWorkflowStatus: WorkflowStatus = {
  currentStep: WorkflowStep.QUERY,
  completedSteps: [],
  canProceed: false,
  contractId: null,
  lastModified: new Date(),
  isNewContract: false,
  crudStatus: undefined
};

/**
 * 合約資料初始結構
 */
const initialContractData: ContractDataStructure = {
  contractId: null,
  queryRowData: null,
  step1: null,
  step2: [],
  step3: [],
  step4: [],
  step5: null,
  dataToDelete: null,
  unifiedCommissionData: null,
  locationData: [],
  commissionType: null,
  metadata: {
    createdAt: new Date(),
    lastModified: new Date(),
    version: 1,
    _isNewContract: false,
    _loadedFromAPI: false
  }
};

/**
 * 工作流程狀態服務
 *
 * 職責: 純狀態管理，不包含任何副作用
 * - 管理工作流程狀態 (WorkflowStatus)
 * - 管理合約資料 (ContractDataStructure)
 * - 提供細粒度的 Observable 訂閱
 */
@Injectable({ providedIn: 'root' })
export class WorkflowStateService {
  // 工作流程狀態
  private readonly workflowStatus$ = new BehaviorSubject<WorkflowStatus>(initialWorkflowStatus);

  // 合約資料
  private readonly contractData$ = new BehaviorSubject<ContractDataStructure>(initialContractData);

  // 檢視模式
  private readonly isViewMode$ = new BehaviorSubject<boolean>(false);

  // ========== 工作流程狀態 Selectors ==========

  /** 當前步驟 */
  readonly currentStep$: Observable<WorkflowStep> = this.workflowStatus$.pipe(
    map(s => s.currentStep),
    distinctUntilChanged()
  );

  /** 已完成步驟 */
  readonly completedSteps$: Observable<WorkflowStep[]> = this.workflowStatus$.pipe(
    map(s => s.completedSteps),
    distinctUntilChanged()
  );

  /** 是否可以繼續下一步 */
  readonly canProceed$: Observable<boolean> = this.workflowStatus$.pipe(
    map(s => s.canProceed),
    distinctUntilChanged()
  );

  /** 當前合約 ID */
  readonly contractId$: Observable<string | null> = this.workflowStatus$.pipe(
    map(s => s.contractId),
    distinctUntilChanged()
  );

  /** 是否為新合約 */
  readonly isNewContract$: Observable<boolean> = this.workflowStatus$.pipe(
    map(s => s.isNewContract ?? false),
    distinctUntilChanged()
  );

  /** CRUD 狀態 */
  readonly crudStatus$: Observable<CRUDStatus | undefined> = this.workflowStatus$.pipe(
    map(s => s.crudStatus),
    distinctUntilChanged()
  );

  // ========== 合約資料 Selectors ==========

  /** Step 1: 合約基本資料 */
  readonly step1Data$: Observable<ContractInfo | null> = this.contractData$.pipe(
    map(d => d.step1),
    distinctUntilChanged()
  );

  /** Step 2: 代扣款資料 */
  readonly step2Data$: Observable<FareItem[]> = this.contractData$.pipe(
    map(d => d.step2),
    distinctUntilChanged()
  );

  /** Step 3: 抽成資料 */
  readonly step3Data$: Observable<CommissionItem[]> = this.contractData$.pipe(
    map(d => d.step3),
    distinctUntilChanged()
  );

  /** Step 4: 條件資料 */
  readonly step4Data$: Observable<ConditionItem[]> = this.contractData$.pipe(
    map(d => d.step4),
    distinctUntilChanged()
  );

  /** 查詢列資料 */
  readonly queryRowData$: Observable<ContractRequest | null> = this.contractData$.pipe(
    map(d => d.queryRowData),
    distinctUntilChanged()
  );

  /** 統一抽成回應資料 */
  readonly unifiedCommissionData$: Observable<UnifiedCommissionResponse | null> = this.contractData$.pipe(
    map(d => d.unifiedCommissionData),
    distinctUntilChanged()
  );

  /** 檢視模式 */
  readonly viewMode$: Observable<boolean> = this.isViewMode$.asObservable();

  // ========== 同步存取方法 ==========

  /** 取得當前工作流程狀態 */
  getWorkflowStatus(): WorkflowStatus {
    return this.workflowStatus$.value;
  }

  /** 取得當前合約資料 */
  getContractData(): ContractDataStructure {
    return this.contractData$.value;
  }

  /** 取得當前步驟 */
  getCurrentStep(): WorkflowStep {
    return this.workflowStatus$.value.currentStep;
  }

  /** 取得 Step 1 資料 */
  getStep1Data(): ContractInfo | null {
    return this.contractData$.value.step1;
  }

  /** 取得 Step 2 資料 */
  getStep2Data(): FareItem[] {
    return this.contractData$.value.step2;
  }

  /** 取得 Step 3 資料 */
  getStep3Data(): CommissionItem[] {
    return this.contractData$.value.step3;
  }

  /** 取得 Step 4 資料 */
  getStep4Data(): ConditionItem[] {
    return this.contractData$.value.step4;
  }

  /** 取得查詢列資料 */
  getQueryRowData(): ContractRequest | null {
    return this.contractData$.value.queryRowData;
  }

  /** 是否為檢視模式 */
  isViewMode(): boolean {
    return this.isViewMode$.value;
  }

  /** 是否為新合約模式 */
  isNewContractMode(): boolean {
    return this.workflowStatus$.value.isNewContract ?? false;
  }

  // ========== 更新方法 ==========

  /** 更新工作流程狀態 */
  updateWorkflowStatus(partial: Partial<WorkflowStatus>): void {
    const current = this.workflowStatus$.value;
    this.workflowStatus$.next({
      ...current,
      ...partial,
      lastModified: new Date()
    });
  }

  /** 更新當前步驟 */
  updateCurrentStep(step: WorkflowStep): void {
    this.updateWorkflowStatus({ currentStep: step });
  }

  /** 標記步驟完成 */
  markStepCompleted(step: WorkflowStep): void {
    const current = this.workflowStatus$.value;
    if (!current.completedSteps.includes(step)) {
      this.updateWorkflowStatus({
        completedSteps: [...current.completedSteps, step]
      });
    }
  }

  /** 設定是否可以繼續 */
  setCanProceed(canProceed: boolean): void {
    this.updateWorkflowStatus({ canProceed });
  }

  /** 設定合約 ID */
  setContractId(contractId: string | null): void {
    this.updateWorkflowStatus({ contractId });
  }

  /** 設定新合約模式 */
  setNewContractMode(isNew: boolean): void {
    this.updateWorkflowStatus({ isNewContract: isNew });
  }

  /** 設定 CRUD 狀態 */
  setCrudStatus(status: CRUDStatus): void {
    this.updateWorkflowStatus({ crudStatus: status });
  }

  /** 設定檢視模式 */
  setViewMode(isViewMode: boolean): void {
    this.isViewMode$.next(isViewMode);
  }

  // ========== 合約資料更新方法 ==========

  /** 更新合約資料 */
  updateContractData(partial: Partial<ContractDataStructure>): void {
    const current = this.contractData$.value;
    this.contractData$.next({
      ...current,
      ...partial,
      metadata: {
        ...current.metadata,
        lastModified: new Date(),
        version: current.metadata.version + 1
      }
    });
  }

  /** 設定查詢列資料 */
  setQueryRowData(data: ContractRequest | null): void {
    this.updateContractData({ queryRowData: data });
  }

  /** 設定 Step 1 資料 */
  setStep1Data(data: ContractInfo | null): void {
    this.updateContractData({ step1: data });
  }

  /** 設定 Step 2 資料 */
  setStep2Data(data: FareItem[]): void {
    this.updateContractData({ step2: data });
  }

  /** 設定 Step 3 資料 */
  setStep3Data(data: CommissionItem[]): void {
    this.updateContractData({ step3: data });
  }

  /** 設定 Step 4 資料 */
  setStep4Data(data: ConditionItem[]): void {
    this.updateContractData({ step4: data });
  }

  /** 設定最終資料 */
  setFinalData(data: FinalData | null): void {
    this.updateContractData({ step5: data });
  }

  /** 設定統一抽成回應資料 */
  setUnifiedCommissionData(data: UnifiedCommissionResponse | null): void {
    this.updateContractData({ unifiedCommissionData: data });
  }

  /** 取得位置資料 */
  getLocationData(): unknown[] {
    return this.contractData$.value.locationData;
  }

  /** 設定位置資料 */
  setLocationData(data: unknown[]): void {
    this.updateContractData({ locationData: data });
  }

  /** 設定抽成類型 */
  setCommissionType(type: string | null): void {
    this.updateContractData({ commissionType: type });
  }

  // ========== 重置方法 ==========

  /** 重置工作流程狀態 */
  resetWorkflowStatus(): void {
    this.workflowStatus$.next({ ...initialWorkflowStatus, lastModified: new Date() });
  }

  /** 重置合約資料 */
  resetContractData(): void {
    this.contractData$.next({
      ...initialContractData,
      metadata: {
        ...initialContractData.metadata,
        createdAt: new Date(),
        lastModified: new Date()
      }
    });
  }

  /** 完全重置 */
  reset(): void {
    this.resetWorkflowStatus();
    this.resetContractData();
    this.setViewMode(false);
  }
}
