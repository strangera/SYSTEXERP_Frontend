// tls13010-next3.component.ts - 重構版本：清晰的結構和職責分離
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { catchError, firstValueFrom } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, NavigationExtras } from '@angular/router';

// 基礎組件和服務
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ContractFlowService } from '../tls13010/services/contract-flow.service';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';

// UI 組件
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';

// 模型定義
import {
  ContractInfo,
  FixedRentCondition,
  BaseRentHigherCondition,
  BaseCommissionCondition,
  GraduatedCommissionCondition,
  BaseTierCondition,
  GeneralCommissionCondition,
  ConditionItem,
  WorkflowStep,
  CleanSubmitData
} from '../tls13010/tls13010.model';
import { ConditionDataManager } from './Services/condition-data-manager.service';
import { TableConfigManager } from './Services/table-config-manager.service';
import { EventHandlerManager } from './Services/event-handler-manager.service';

@Component({
  selector: 'app-tls13010-next3',
  templateUrl: './tls13010-next3.component.html',
  styleUrls: ['./tls13010-next3.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    NgIf,
    ProgressSpinnerModule,
    AccordionModule,
    ExpandableEditTableComponent,
    DialogModule,
    PrimeTemplate,
    Button
  ]
})
export class Tls13010Next3Component extends BasicCruPageComponent<ConditionItem> implements OnInit, OnDestroy {

  // ===== 狀態管理 =====
  isViewMode = false;
  dataLoaded = false;
  conditionDataLoaded = false;
  showConfirmDialog = false;

  // ===== 訂閱管理 =====
  private viewModeSubscription?: Subscription;
  private subscriptions: Subscription[] = [];

  // ===== 表單數據 =====
  dataForm: FormGroup;
  currentTalentId = '';
  currentContractData: any = null;
  contractInfoData: ContractInfo[] = [];

  // ===== 條件數據 =====
  private allConditionItems: ConditionItem[] = [];
  fixedRentItems: FixedRentCondition[] = [];
  baseRentHigherItems: BaseRentHigherCondition[] = [];
  generalCommissionItems: GeneralCommissionCondition[] = [];
  baseCommissionItems: BaseCommissionCondition[] = [];
  graduatedItems: GraduatedCommissionCondition[] = [];
  baseTierItems: BaseTierCondition[] = [];

  // ===== 表格配置 =====
  contractInfoColumns: ColumnDef[] = [];
  fixedRentColumns: ColumnDef[] = [];
  baseRentHigherColumns: ColumnDef[] = [];
  generalCommissionColumns: ColumnDef[] = [];
  baseCommissionColumns: ColumnDef[] = [];
  graduatedColumns: ColumnDef[] = [];
  baseTierColumns: ColumnDef[] = [];

  constructor(
    private contractFlowService: ContractFlowService,
    private tls13010Service: TLS13010Service,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private paperTypeService: LocationOptionsService,
    private route: ActivatedRoute,
    // 新增的管理服務
    private conditionDataManager: ConditionDataManager,
    private tableConfigManager: TableConfigManager,
    private eventHandlerManager: EventHandlerManager
  ) {
    super();
    this.dataForm = this.formBuilder.group({});
  }

  // ===== 生命週期方法 =====

  ngOnInit(): void {
    console.log('Next3 組件初始化開始');

    this.setupViewModeUI();
    this.initializePage('TLS13010', this.dataForm);
    this.initializeTableConfigs();

    this.loadDiscountOptions().then(() => {
      this.loadWorkflowData();
    });
  }

  ngOnDestroy(): void {
    console.log('Next3 組件銷毀前暫存資料');

    if (!this.isViewMode) {
      this.saveConditionDataToWorkflow();
    }

    // 清理訂閱
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.viewModeSubscription) {
      this.viewModeSubscription.unsubscribe();
    }
  }

  // ===== 初始化方法 =====

  private initializeTableConfigs(): void {
    console.log('初始化表格配置');

    this.contractInfoColumns = this.tableConfigManager.getContractInfoColumns();
    this.fixedRentColumns = this.tableConfigManager.getFixedRentColumns();
    this.baseRentHigherColumns = this.tableConfigManager.getBaseRentHigherColumns();
    this.generalCommissionColumns = this.tableConfigManager.getGeneralCommissionColumns();
    this.baseCommissionColumns = this.tableConfigManager.getBaseCommissionColumns();
    this.graduatedColumns = this.tableConfigManager.getGraduatedColumns();
    this.baseTierColumns = this.tableConfigManager.getBaseTierColumns();
  }

  private setupViewModeUI(): void {
    console.log('設定檢視模式 UI 監聽');

    const currentViewMode = this.contractFlowService.isViewMode();
    if (currentViewMode) {
      this.isViewMode = true;
      this.applyViewModeSettings(true);
    }

    this.viewModeSubscription = this.contractFlowService.isViewMode$.subscribe(isViewMode => {
      this.isViewMode = isViewMode;
      this.applyViewModeSettings(isViewMode);
    });
  }

  private applyViewModeSettings(isViewMode: boolean): void {
    console.log('套用檢視模式設定:', isViewMode);
    // 表格的 readonly 屬性會根據 isViewMode 自動處理
  }

  // ===== 數據載入方法 =====

  private loadWorkflowData(): void {
    console.log('開始載入工作流程資料');

    const workflowData = this.contractFlowService.getCurrentData();

    if (workflowData.contractId || this.contractFlowService.isNewContractMode()) {
      const modeInfo = this.contractFlowService.getWorkflowModeInfo();
      this.currentTalentId = modeInfo.talentId;
      this.currentContractData = workflowData?.queryRowData;

      console.log('工作流程狀態確認:', {
        mode: modeInfo.modeName,
        currentTalentId: this.currentTalentId,
        contractId: modeInfo.contractId
      });

      this.prepareContractInfoDisplay();
      this.loadDataWithPriority();
    } else {
      console.warn('沒有有效的工作流程資料，重導向到前一步');
      this.router.navigate(['account/tls/tls13010cru']);
    }
  }

  private prepareContractInfoDisplay(): void {
    console.log('準備合約資訊顯示');

    const step1Data = this.contractFlowService.getStep1Data();

    const contractInfo = {
      talent_id: step1Data?.talent_id || this.currentContractData?.talent_id || '',
      tlt_no: step1Data?.tlt_no || this.currentContractData?.tlt_no || '',
      apply_no: step1Data?.apply_no || this.currentContractData?.apply_no || '',
      tlt_name: step1Data?.tlt_name || this.currentContractData?.tlt_name || '',
      VEN_Name: step1Data?.VEN_Name || this.currentContractData?.VEN_Name || '',
      ven_uniform: step1Data?.ven_uniform || this.currentContractData?.ven_uniform || '',
      contract_subno: step1Data?.contract_subno || this.currentContractData?.contract_subno || '',
      comm_comp_type: step1Data?.comm_comp_type || this.currentContractData?.comm_comp_type || '',
      tlt_bdate: step1Data?.tlt_bdate || this.currentContractData?.tlt_bdate || '',
      tlt_edate: step1Data?.tlt_edate || this.currentContractData?.tlt_edate || '',
      tlt_contract_bdate: step1Data?.tlt_contract_bdate || this.currentContractData?.tlt_contract_bdate || '',
      tlt_contract_edate: step1Data?.tlt_contract_edate || this.currentContractData?.tlt_contract_edate || '',
      tlt_term_type: (step1Data?.tlt_term_type || this.currentContractData?.tlt_term_type || '3').toString().trim(),
    };

    this.contractInfoData = [{
      id: contractInfo.talent_id || 'new',
      ...contractInfo
    }];

    console.log('合約資訊設定完成');
  }

  private loadDataWithPriority(): void {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    console.log('載入資料優先順序判定:', {
      commissionType,
      isNewContract: this.contractFlowService.isNewContractMode(),
      currentTalentId: this.currentTalentId,
      isViewMode: this.isViewMode
    });

    // 第一優先：檢查是否有 Next3 暫存資料
    const savedNext3Data = this.contractFlowService.getStepData(WorkflowStep.CONDITION);

    if (savedNext3Data && Array.isArray(savedNext3Data) && savedNext3Data.length > 0) {
      console.log('使用 Next3 暫存資料，項目數量:', savedNext3Data.length);
      this.loadConditionDataFromCache(savedNext3Data);
    } else if (this.contractFlowService.isNewContractMode()) {
      console.log('新增模式：初始化空的條件設定');
      this.initializeNewContractConditionData(commissionType || '3');
    } else {
      console.log('編輯模式：載入條件設定');
      this.loadExistingConditionData();
    }

    this.conditionDataLoaded = true;
    this.dataLoaded = true;
  }


  private initializeNewContractConditionData(commissionType: string): void {
    console.log('新增模式：初始化條件設定，抽成類型:', commissionType);

    this.allConditionItems = this.conditionDataManager.initializeEmptyConditions(
      commissionType,
      this.currentTalentId
    );

    this.categorizeConditionItems();
    console.log('新增模式條件設定初始化完成');
  }

  private async loadExistingConditionData(): Promise<void> {
    const commissionType = this.contractInfoData[0]?.tlt_term_type || '3';

    console.log('🔗 開始載入現有條件資料，抽成類型:', commissionType);

    try {
      // 🎯 使用新的 Commission API
      const request = {
        TalentId: this.currentTalentId,
        CurrentTltTermType: commissionType
      };

      console.log('📤 呼叫 queryTLS13010Commission API:', request);

      const response = await firstValueFrom(
        this.tls13010Service.queryTLS13010Commission(request).pipe(
          catchError(error => {
            console.error('Commission API 呼叫失敗:', error);
            throw error;
          })
        )
      );

      if (response?.Status === '0000' && response?.Data?.ExistingData) {
        console.log('✅ Commission API 回應成功:', response.Data);

        // 🎯 修正：使用正確的資料路徑 ExistingData 而不是 RentSettingData
        this.allConditionItems = this.conditionDataManager.mapBackendDataToFrontend(
          response.Data.ExistingData,
          commissionType
        );

        console.log('📋 轉換後的條件項目數量:', this.allConditionItems.length);
      } else {
        console.log('⚠️ Commission API 無資料或回應異常，使用空條件');
        this.allConditionItems = this.conditionDataManager.initializeEmptyConditions(
          commissionType,
          this.currentTalentId
        );
      }

    } catch (error) {
      console.error('❌ Commission API 呼叫失敗:', error);

      // API 失敗時初始化為空條件
      this.allConditionItems = this.conditionDataManager.initializeEmptyConditions(
        commissionType,
        this.currentTalentId
      );

      // 根據錯誤類型顯示適當訊息
      if (this.isNotFoundError(error)) {
        console.log('📭 查無條件資料，初始化空條件設定');
      } else {
        this.notificationService.warnBubble('載入條件設定時發生錯誤，已初始化為空設定');
      }
    }

    // 分類條件項目
    this.categorizeConditionItems();
  }

  /**
 * 檢查是否為找不到資料的錯誤
 */
  private isNotFoundError(error: any): boolean {
    return error?.status === 404 ||
      error?.error?.Message?.includes('查無資料') ||
      error?.message?.includes('not found') ||
      error?.error?.Status === '1001'; // 根據你們的錯誤碼調整
  }

  private loadConditionDataFromCache(savedData: ConditionItem[]): void {
    try {
      console.log('從暫存載入條件資料:', savedData);
      this.allConditionItems = savedData;
      this.categorizeConditionItems();
      console.log('暫存條件資料載入完成');
    } catch (error) {
      console.error('暫存條件資料載入失敗:', error);
      this.initializeEmptyConditionData();
    }
  }

  private categorizeConditionItems(): void {
    const categorized = this.conditionDataManager.categorizeConditionItems(this.allConditionItems);

    this.fixedRentItems = categorized.fixedRent;
    this.baseRentHigherItems = categorized.baseRentHigher;
    this.generalCommissionItems = categorized.generalCommission;
    this.baseCommissionItems = categorized.baseCommission;
    this.graduatedItems = categorized.graduated;
    this.baseTierItems = categorized.baseTier;

    console.log('條件項目分類完成:', {
      fixedRent: this.fixedRentItems.length,
      baseRentHigher: this.baseRentHigherItems.length,
      generalCommission: this.generalCommissionItems.length,
      baseCommission: this.baseCommissionItems.length,
      graduated: this.graduatedItems.length,
      baseTier: this.baseTierItems.length
    });
  }

  private initializeEmptyConditionData(): void {
    this.fixedRentItems = [];
    this.baseRentHigherItems = [];
    this.generalCommissionItems = [];
    this.baseCommissionItems = [];
    this.graduatedItems = [];
    this.baseTierItems = [];
    this.allConditionItems = [];
  }

  private async loadDiscountOptions(): Promise<void> {
    return new Promise((resolve) => {
      console.log('開始載入折數選項...');
      this.paperTypeService.getPaperTypeOptions('T102').subscribe({
        next: (options: any[]) => {
          console.log('折扣選項載入成功:', options);
          this.tableConfigManager.setDiscountOptions(options);
          this.updateGeneralCommissionColumns();
          resolve();
        },
        error: (error: any) => {
          console.error('載入折數選項失敗:', error);
          this.tableConfigManager.setDiscountOptions([]);
          resolve();
        }
      });
    });
  }

  private updateGeneralCommissionColumns(): void {
    this.generalCommissionColumns = this.tableConfigManager.getGeneralCommissionColumns();
  }

  // ===== 顯示數據方法 =====

  get displayFixedRentItems(): FixedRentCondition[] {
    return this.conditionDataManager.filterDisplayItems(this.fixedRentItems);
  }

  get displayBaseRentHigherItems(): BaseRentHigherCondition[] {
    return this.conditionDataManager.filterDisplayItems(this.baseRentHigherItems);
  }

  get displayGeneralCommissionItems(): GeneralCommissionCondition[] {
    return this.conditionDataManager.filterDisplayItems(this.generalCommissionItems);
  }

  get displayBaseCommissionItems(): BaseCommissionCondition[] {
    return this.conditionDataManager.filterDisplayItems(this.baseCommissionItems);
  }

  get displayGraduatedItems(): GraduatedCommissionCondition[] {
    return this.conditionDataManager.filterDisplayItems(this.graduatedItems);
  }

  get displayBaseTierItems(): BaseTierCondition[] {
    return this.conditionDataManager.filterDisplayItems(this.baseTierItems);
  }

  // ===== 業務邏輯方法 =====

  shouldShowCommissionType(commissionTypeCode: string): boolean {
    const currentCommissionType = this.contractInfoData[0]?.tlt_term_type;
    return currentCommissionType === commissionTypeCode;
  }

  getCurrentCommissionTypeName(): string {
    const code = this.contractInfoData[0]?.tlt_term_type;
    return this.tableConfigManager.getCommissionTypeName(code || '');
  }

  hasConditionData(): boolean {
    return this.getConditionItemCount() > 0;
  }

  getConditionItemCount(): number {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    switch (commissionType) {
      case '1': return this.displayFixedRentItems.length;
      case '2': return this.displayBaseRentHigherItems.length;
      case '3': return this.displayGeneralCommissionItems.length;
      case '4': return this.displayBaseCommissionItems.length;
      case '5': return this.displayGraduatedItems.length;
      case '6': return this.displayBaseTierItems.length;
      default: return 0;
    }
  }

  getNewItemCount(): number {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    switch (commissionType) {
      case '1': return this.fixedRentItems.filter(item => item._status === 'new').length;
      case '2': return this.baseRentHigherItems.filter(item => item._status === 'new').length;
      case '3': return this.generalCommissionItems.filter(item => item._status === 'new').length;
      case '4': return this.baseCommissionItems.filter(item => item._status === 'new').length;
      case '5': return this.graduatedItems.filter(item => item._status === 'new').length;
      case '6': return this.baseTierItems.filter(item => item._status === 'new').length;
      default: return 0;
    }
  }

  getDeletedItemCount(): number {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    switch (commissionType) {
      case '1': return this.fixedRentItems.filter(item => item._status === 'deleted').length;
      case '2': return this.baseRentHigherItems.filter(item => item._status === 'deleted').length;
      case '3': return this.generalCommissionItems.filter(item => item._status === 'deleted').length;
      case '4': return this.baseCommissionItems.filter(item => item._status === 'deleted').length;
      case '5': return this.graduatedItems.filter(item => item._status === 'deleted').length;
      case '6': return this.baseTierItems.filter(item => item._status === 'deleted').length;
      default: return 0;
    }
  }

  // ===== 事件處理方法 =====

  onTableSave(event: any, type: string): void {
    const result = this.eventHandlerManager.handleTableSave(event, type, this.isViewMode);

    if (result.shouldSave && result.modifiedData) {
      // 更新數據
      event.newData = result.modifiedData;
      this.saveConditionDataToWorkflow();
      this.notificationService.successBubble(
        this.eventHandlerManager.formatSuccessMessage('save', 1, type)
      );
    }
  }

  onTableEdit(event: any, type: string): boolean {
    return this.eventHandlerManager.handleTableEdit(event, type, this.isViewMode);
  }

  onTableCancel(event: any, type: string): void {
    this.eventHandlerManager.handleTableCancel(event, type);
  }

  onBatchDelete(selectedItems: any[], type: string): void {
    const result = this.eventHandlerManager.handleBatchDelete(selectedItems, type, this.isViewMode);

    if (result.shouldDelete) {
      // 直接移除新增項目
      result.itemsToRemove.forEach(item => {
        this.removeItemFromArray(item, type);
      });

      // 標記刪除現有項目
      result.itemsToMarkDeleted.forEach(item => {
        item._status = 'deleted';
      });

      this.saveConditionDataToWorkflow();
      this.notificationService.successBubble(
        this.eventHandlerManager.formatSuccessMessage('delete', selectedItems.length, type)
      );

      this.cdr.detectChanges();
    }
  }

  // ===== 新增項目方法 =====

  onAddFixedRentItem(): void {
    const result = this.eventHandlerManager.handleAddItem('fixedRent', this.isViewMode, () =>
      this.conditionDataManager.initializeEmptyConditions('1', this.currentTalentId)[0]
    );

    if (result.shouldAdd && result.newItem) {
      this.fixedRentItems.push(result.newItem);
      this.saveConditionDataToWorkflow();
    }
  }

  onAddBaseRentHigherItem(): void {
    const result = this.eventHandlerManager.handleAddItem('baseRentHigher', this.isViewMode, () =>
      this.conditionDataManager.initializeEmptyConditions('2', this.currentTalentId)[0]
    );

    if (result.shouldAdd && result.newItem) {
      this.baseRentHigherItems.push(result.newItem);
      this.saveConditionDataToWorkflow();
    }
  }

  onAddBaseCommissionItem(): void {
    const result = this.eventHandlerManager.handleAddItem('baseCommission', this.isViewMode, () =>
      this.conditionDataManager.initializeEmptyConditions('4', this.currentTalentId)[0]
    );

    if (result.shouldAdd && result.newItem) {
      this.baseCommissionItems.push(result.newItem);
      this.saveConditionDataToWorkflow();
    }
  }

  onAddGraduatedItem(): void {
    const result = this.eventHandlerManager.handleAddItem('graduated', this.isViewMode, () => {
      // 傳入現有項目以計算正確序號
      const newItem = this.conditionDataManager.initializeEmptyConditions(
        '5',
        this.currentTalentId,
        this.graduatedItems
      )[0] as GraduatedCommissionCondition;

      // 不需要再次設定 seq_no，因為已在 createGraduatedItem 中正確設定
      return newItem;
    });

    if (result.shouldAdd && result.newItem) {
      this.graduatedItems.push(result.newItem);
      this.saveConditionDataToWorkflow();
    }
  }

  onAddBaseTierItem(): void {
    const result = this.eventHandlerManager.handleAddItem('baseTier', this.isViewMode, () => {
      // 傳入現有項目以計算正確序號
      const newItem = this.conditionDataManager.initializeEmptyConditions(
        '6',
        this.currentTalentId,
        this.baseTierItems
      )[0] as BaseTierCondition;

      // 不需要再次設定 seq_no，因為已在 createBaseTierItem 中正確設定
      return newItem;
    });

    if (result.shouldAdd && result.newItem) {
      this.baseTierItems.push(result.newItem);
      this.saveConditionDataToWorkflow();
    }
  }

  private removeItemFromArray(item: any, type: string): void {
    switch (type) {
      case 'fixedRent':
        {
          const fixedIndex = this.fixedRentItems.findIndex(x => x.id === item.id);
          if (fixedIndex > -1) this.fixedRentItems.splice(fixedIndex, 1);
          break;
        }
      case 'baseRentHigher':
        {
          const baseRentIndex = this.baseRentHigherItems.findIndex(x => x.id === item.id);
          if (baseRentIndex > -1) this.baseRentHigherItems.splice(baseRentIndex, 1);
          break;
        }
      case 'baseCommission':
        {
          const baseCommIndex = this.baseCommissionItems.findIndex(x => x.id === item.id);
          if (baseCommIndex > -1) this.baseCommissionItems.splice(baseCommIndex, 1);
          break;
        }
      case 'graduated':
        {
          const gradIndex = this.graduatedItems.findIndex(x => x.id === item.id);
          if (gradIndex > -1) this.graduatedItems.splice(gradIndex, 1);
          break;
        }
      case 'baseTier':
        {
          const tierIndex = this.baseTierItems.findIndex(x => x.id === item.id);
          if (tierIndex > -1) this.baseTierItems.splice(tierIndex, 1);
          break;
        }
    }
  }

  // ===== 數據保存方法 =====

  private saveConditionDataToWorkflow(): void {
    // 重新組合所有條件項目（包括標記為刪除的項目）
    this.allConditionItems = [
      ...this.fixedRentItems,
      ...this.baseRentHigherItems.map(item => ({
        ...item,
        _fromNext2: item._fromNext2 || false,
        _status: item._status || 'original',
        _readonly: item._readonly || false
      })),
      ...this.generalCommissionItems,
      ...this.baseCommissionItems,
      ...this.graduatedItems,
      ...this.baseTierItems
    ];

    console.log('Next3 儲存條件設定資料到工作流程');
    console.log('儲存資料統計:', this.conditionDataManager.getItemCounts(this.allConditionItems));

    try {
      this.contractFlowService.saveStep4Data(this.allConditionItems);

      // 驗證儲存結果
      const savedData = this.contractFlowService.getStepData(WorkflowStep.CONDITION);
      if (Array.isArray(savedData)) {
        console.log('儲存驗證 - 暫存資料項目數:', savedData.length);
      }

      console.log('已儲存條件設定資料到工作流程');
    } catch (error) {
      console.error('Next3 儲存條件設定資料失敗:', error);
      this.notificationService.errorBubble('儲存條件設定資料失敗');
    }
  }

  // ===== 提交相關方法 =====

  onSubmitNext(): void {
    if (this.isViewMode) {
      this.router.navigate(['account/tls/tls13010']);
      this.notificationService.infoBubble('已結束檢視');
      return;
    }

    // 驗證數據
    const commissionType = this.contractInfoData[0]?.tlt_term_type ?? '3';
    const currentItems = this.getCurrentConditionItems();
    const validation = this.conditionDataManager.validateConditions(currentItems, commissionType);

    if (!validation.isValid) {
      this.notificationService.errorBubble(`資料驗證失敗: ${validation.errors[0]}`);
      return;
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        this.notificationService.warnBubble(warning);
      });
    }

    this.saveConditionDataToWorkflow();
    this.showConfirmDialog = true;
  }

  onConfirmDialogResult(confirmed: boolean): void {
    this.showConfirmDialog = false;
    if (confirmed) {
      this.submitContractData();
    }
  }

  private getCurrentConditionItems(): ConditionItem[] {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    switch (commissionType) {
      case '1': return this.displayFixedRentItems;
      case '2': return this.displayBaseRentHigherItems;
      case '3': return this.displayGeneralCommissionItems;
      case '4': return this.displayBaseCommissionItems;
      case '5': return this.displayGraduatedItems;
      case '6': return this.displayBaseTierItems;
      default: return [];
    }
  }

  private submitContractData(): void {
    console.log('Next3: 開始送出合約資料');

    // 檢查與 Next2 的數量一致性
    if (!this.validateNext2DataConsistency()) {
      return;
    }

    this.loading = true;
    this.notificationService.blockUi();

    try {
      // 最後一次暫存條件設定資料
      this.saveConditionDataToWorkflow();

      // 使用清理資料方法
      const cleanSubmitData = this.contractFlowService.generateCleanSubmitData();

      console.log('Next3: 最終送出的完整 JSON:');
      console.log(JSON.stringify(cleanSubmitData, null, 2));

      // 檢查抽成類型變更警告
      if (cleanSubmitData.commissionTypeChange?.HasChanged) {
        const changeInfo = cleanSubmitData.commissionTypeChange;
        const originalName = this.tableConfigManager.getCommissionTypeName(changeInfo.OriginalTermType);
        const newName = this.tableConfigManager.getCommissionTypeName(changeInfo.NewTermType);

        const warningDetails = this.generateClearWarningDetails(changeInfo.ClearOperations);
        const warningMessage = `抽成別已變更：${originalName} → ${newName}\n\n將清除以下資料：\n${warningDetails}\n\n確定要繼續送出嗎？`;

        if (!confirm(warningMessage)) {
          this.loading = false;
          this.notificationService.unblockUi();
          return;
        }
      }

      // 驗證資料
      const validation = this.contractFlowService.validateCleanSubmitData(cleanSubmitData);

      if (!validation.isValid) {
        console.error('Next3: 資料驗證失敗:', validation.errors);
        this.loading = false;
        this.notificationService.unblockUi();
        this.notificationService.errorBubble(`資料驗證失敗: ${validation.errors[0]}`);
        return;
      }

      // 顯示警告（如果有）
      if (validation.warnings.length > 0) {
        console.warn('Next3: 提交警告:', validation.warnings);
        validation.warnings.forEach(warning => {
          this.notificationService.warnBubble(warning);
        });
      }

      // 調用真實的 API
      this.callCleanSubmitAPI(cleanSubmitData);

    } catch (error) {
      console.error('Next3: 準備提交資料時發生錯誤:', error);
      this.loading = false;
      this.notificationService.unblockUi();
      this.notificationService.errorBubble(`準備提交資料時發生錯誤: ${error}`);
    }
  }

  private callCleanSubmitAPI(cleanData: CleanSubmitData): void {
    console.log('Next3: 調用真實 API 提交契約資料...');

    this.tls13010Service.submitFinalTLS13010(cleanData).subscribe({
      next: (response) => {
        console.log('Next3: 契約提交成功:', response);
        this.handleSubmitSuccess(response);
      },
      error: (error) => {
        console.error('Next3: 契約提交失敗:', error);
        this.handleSubmitError(error);
      }
    });
  }

  private handleSubmitSuccess(response: any): void {
    this.loading = false;
    this.notificationService.unblockUi();

    console.log('Next3: 處理提交成功回應:', response);

    let successMessage = '契約資料提交成功！';
    const details: string[] = [];

    if (response.talentId) details.push(`專櫃編號: ${response.talentId}`);
    if (response.contractNo) details.push(`合約編號: ${response.contractNo}`);
    if (response.totalProcessed) details.push(`處理項目數: ${response.totalProcessed}`);

    if (details.length > 0) {
      successMessage += '\n\n' + details.join('\n');
    }

    this.notificationService.successBubble(successMessage);

    // 顯示警告（如果有）
    if (response.warnings?.length > 0) {
      response.warnings.forEach((warning: string) => {
        this.notificationService.warnBubble(warning);
      });
    }

    // 提交成功後清理暫存並導航
    this.contractFlowService.onSubmitSuccess();

    setTimeout(() => {
      this.router.navigate(['account/tls/tls13010']);
    }, 3000);
  }

  private handleSubmitError(error: any): void {
    this.loading = false;
    this.notificationService.unblockUi();

    console.error('Next3: 處理提交錯誤:', error);

    let errorMessage = '契約資料提交失敗';

    if (error?.error?.Message) {
      errorMessage += `: ${error.error.Message}`;
    } else if (error?.message) {
      errorMessage += `: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage += `: ${error}`;
    }

    // 特殊錯誤處理
    if (error?.status === 400) {
      errorMessage = '資料格式錯誤，請檢查輸入內容';
    } else if (error?.status === 500) {
      errorMessage = '伺服器內部錯誤，請稍後重試或聯繫管理員';
    } else if (error?.status === 0) {
      errorMessage = '網路連線錯誤，請檢查網路狀態';
    }

    this.notificationService.errorBubble(errorMessage);

    console.group('Next3: 詳細錯誤資訊');
    console.log('Status:', error?.status);
    console.log('StatusText:', error?.statusText);
    console.log('URL:', error?.url);
    console.log('Error Object:', error?.error);
    console.log('Full Error:', error);
    console.groupEnd();
  }

  private validateNext2DataConsistency(): boolean {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    if (commissionType !== '2') {
      return true; // 非底租抽成取高者不需檢查
    }

    try {
      const cleanData = this.contractFlowService.generateCleanSubmitData();

      const next2MasterCount = cleanData.commissions.masters.toInsert.length +
        cleanData.commissions.masters.toUpdate.length;
      const next3RentCount = cleanData.conditions.baseRentHigher.toInsert.length +
        cleanData.conditions.baseRentHigher.toUpdate.length;

      console.log('Next3: 數量一致性檢查:', {
        next2MasterCount,
        next3RentCount,
        isConsistent: next2MasterCount === next3RentCount
      });

      if (next2MasterCount !== next3RentCount) {
        this.notificationService.errorBubble(
          `資料不一致：抽成設定有 ${next2MasterCount} 個項目，` +
          `但條件設定有 ${next3RentCount} 個項目。請檢查資料後再送出。`
        );
        return false;
      }

      return true;

    } catch (error) {
      console.error('Next3: 一致性檢查失敗:', error);
      this.notificationService.warnBubble('無法驗證資料一致性，請檢查資料完整性');
      return true; // 允許繼續，但給出警告
    }
  }

  // ===== 導航方法 =====

  override onCancel(): void {
    if (this.isViewMode) {
      this.router.navigate(['account/tls/tls13010next2']);
      return;
    }

    console.log('Next3 返回前一頁，先暫存資料');
    this.saveConditionDataToWorkflow();
    this.router.navigate(['account/tls/tls13010next2']);
  }

  onClearAndExit(): void {
    this.contractFlowService.clearTempData();
    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };
    this.router.navigate(['account/tls/tls13010'], extras);
    this.notificationService.infoBubble('已清空暫存資料並離開');
  }

  // ===== 工具方法 =====

  private generateClearWarningDetails(clearOps: any): string {
    const details: string[] = [];

    if (clearOps.clearRentDetails) details.push('• 租金設定');
    if (clearOps.clearCommissionMasters) details.push('• 抽成主檔');
    if (clearOps.clearChargedDetails) details.push('• 抽成明細');
    if (clearOps.clearLimitDetails) details.push('• 包底設定');
    if (clearOps.clearLevelDetails) details.push('• 階梯設定');

    return details.length > 0 ? details.join('\n') : '• 無需清除資料';
  }
}
