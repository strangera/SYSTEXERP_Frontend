import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ColumnDef, ExpandableEditTableComponent } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Subscription, firstValueFrom, catchError } from 'rxjs';
import { TLS12040TableConfigManager } from './services/tls12040-table-config-manager.service';
import { TABLE_CONFIGURATIONS, TableConfiguration } from './models/tls12040-next3.model';
import { SimpleContractInfo } from '../tls12040-next1/models/tls12040-next1.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { BaseCommissionCondition, BaseRentHigherCondition, BaseTierCondition, ConditionItem, FixedRentCondition, GeneralCommissionCondition, GraduatedCommissionCondition } from './models/tls12040.table.model';
import { TLS12040SmartDateSegmentationService } from './services/smart-date-manager.service';
import { TLS12040ConditionDataManager } from './services/condition-data-manager.service';
import { TLS12040UpConditionDataManager } from './services/updated-condition-data-manager.service';
import { TLS12040EventHandlerManager } from './services/event-handler-manager.service';
import { TLS12040FlowService } from '../tls12040/Workflow/tls12040-contract-flow.service';
import { TLS12040Service } from '@service/api/tls/tls12040.service';
import { TLS12040DetailModel } from '../tls12040-cru/models/tls12040-cru.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ContractSubmitService } from '../tls13010-next3/SubmitService/contract-submit.service';

// 工作流程步驟定義
enum WorkflowStep {
  CONTRACT = 'cru',
  LOCATION = 'next1',
  COMMISSION = 'next2',
  CONDITION = 'next3'
}

export interface TEST {
  test: string;
}

@Component({
  selector: 'app-tls12040-next3',
  templateUrl: './tls12040-next3.component.html',
  styleUrls: ['./tls12040-next3.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    NgIf, NgFor, NgClass,
    ProgressSpinnerModule,
    AccordionModule,
    ExpandableEditTableComponent,
    DialogModule,
    PrimeTemplate,
    Button
  ]
})

export class TLS12040Next3Component extends BasicCruPageComponent<TEST> implements OnInit, OnDestroy {
  tableConfigurations: TableConfiguration[] = TABLE_CONFIGURATIONS;
  globalTableSettings = {
    forceEditMode: true,
    showActionColumn: false,
    showAddButton: true,
    showBatchDelete: true,
    showCheckBox: true,
    readonly: false,
  };

  // ===== 狀態管理 =====
  isViewMode = false;


  // 使用 CRUDStatus 判斷模式
  get isReadOnlyMode(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  get isEditMode(): boolean {
    return this.crudstatus === CRUDStatus.Edit;
  }

  get isCreateMode(): boolean {
    return this.crudstatus === CRUDStatus.Create;
  }

  dataLoaded = false;
  conditionDataLoaded = false;
  showConfirmDialog = false;

  // ===== 訂閱管理 =====
  private viewModeSubscription?: Subscription;
  private subscriptions: Subscription[] = [];

  // ===== 表單數據 =====
  dataForm: FormGroup;
  currentApplyNo = ''; // 從 currentTalentId 改為 currentApplyNo
  currentContractData: any = null;
  contractInfoData: SimpleContractInfo[] = [];

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
    private contractFlowService: TLS12040FlowService,
    private tls12040Service: TLS12040Service,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private paperTypeService: LocationOptionsService,
    private route: ActivatedRoute,
    // 新增的管理服務
    private conditionDataManager: TLS12040ConditionDataManager,
    private upconditionDataManager: TLS12040UpConditionDataManager,
    private tableConfigManager: TLS12040TableConfigManager,
    private eventHandlerManager: TLS12040EventHandlerManager,
    private smartDateService: TLS12040SmartDateSegmentationService,
    private contractSubmitService: ContractSubmitService
  ) {
    super();
    this.dataForm = this.formBuilder.group({});
  }

  /**
   * 獲取可見的表格配置
   */
  getVisibleTableConfigurations(): TableConfiguration[] {
    const currentCommissionType = this.contractInfoData[0]?.tlt_term_type;
    return this.tableConfigurations.filter(config => {
      return config.commissionType === currentCommissionType && config.visible;
    });
  }

  /**
   * 獲取表格數據
   */
  getTableData(tableConfig: TableConfiguration): any[] {
    return this[tableConfig.displayDataProperty as keyof this] as any[];
  }

  /**
   * 獲取表格欄位配置
   */
  getTableColumns(tableConfig: TableConfiguration): ColumnDef[] {
    return this[tableConfig.columnsProperty as keyof this] as ColumnDef[];
  }

  /**
   * 獲取表格設定 (支援全域設定覆蓋)
   */
  getTableSetting(tableConfig: TableConfiguration, settingName: keyof TableConfiguration): any {
    const globalValue = this.globalTableSettings[settingName as keyof typeof this.globalTableSettings];
    const tableValue = tableConfig[settingName];
    return globalValue !== undefined ? globalValue : tableValue;
  }

  /**
   * 動態調用表格相關方法
   */
  callTableMethod(methodName: string): void {
    if (typeof this[methodName as keyof this] === 'function') {
      (this[methodName as keyof this] as Function)();
    } else {
      console.warn(`方法 ${methodName} 不存在`);
    }
  }

  // ===== 生命週期方法 =====

  ngOnInit(): void {
    console.log('Next3 組件初始化開始');
    console.log('當前 CRUD 狀態:', this.crudstatus);
    console.log('是否為唯讀模式:', this.isReadOnlyMode);
    console.log('路由狀態:', this.router.getCurrentNavigation()?.extras?.state);

    this.setupViewModeUI();
    this.initializePage('TLS12040', this.dataForm);
    this.initializeTableConfigs();

    this.loadDiscountOptions().then(() => {
      this.loadWorkflowData();
    });
  }

  ngOnDestroy(): void {
    console.log('Next3 組件銷毀前暫存資料');

    if (!this.isReadOnlyMode && this.allConditionItems.length > 0) {
      console.log('組件銷毀前最後儲存');
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
  }

  // ===== 數據載入方法 =====

  private loadWorkflowData(): void {
    console.log('開始載入工作流程資料');

    const workflowData = this.contractFlowService.getCurrentState();

    if (workflowData.contractId || this.contractFlowService.getCurrentState().isNewContract) {
      const state = this.contractFlowService.getCurrentState();
      this.currentApplyNo = state.applyNo || ''; // 修正：從 applyNo 取值
      this.currentContractData = this.contractFlowService.getCruData();

      console.log('工作流程狀態確認:', {
        isNewContract: state.isNewContract,
        currentApplyNo: this.currentApplyNo,
        contractId: state.contractId
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

    const cruData = this.contractFlowService.getCruData();

    const contractInfo = {
      apply_no: cruData?.apply_no || this.currentContractData?.apply_no || '',
      tlt_no: cruData?.tlt_no || this.currentContractData?.tlt_no || '',
      tlt_name: cruData?.tlt_name || this.currentContractData?.tlt_name || '',
      VEN_Name: cruData?.VEN_Name || this.currentContractData?.VEN_Name || '',
      ven_uniform: cruData?.ven_uniform || this.currentContractData?.ven_uniform || '',
      contract_subno: cruData?.contract_subno || this.currentContractData?.contract_subno || '',
      comm_comp_type: cruData?.comm_comp_type || this.currentContractData?.comm_comp_type || '',
      tlt_bdate: cruData?.tlt_bdate || this.currentContractData?.tlt_bdate || '',
      tlt_edate: cruData?.tlt_edate || this.currentContractData?.tlt_edate || '',
      tlt_contract_bdate: cruData?.tlt_contract_bdate || this.currentContractData?.tlt_contract_bdate || '',
      tlt_contract_edate: cruData?.tlt_contract_edate || this.currentContractData?.tlt_contract_edate || '',
      tlt_term_type: (cruData?.tlt_term_type || this.currentContractData?.tlt_term_type || '3').toString().trim(),
    };

    this.contractInfoData = [{
      id: contractInfo.apply_no || 'new',
      ...contractInfo
    }];

    console.log('合約資訊設定完成');
  }

  private loadDataWithPriority(): void {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    console.log('載入資料優先順序判定:', {
      commissionType,
      isNewContract: this.contractFlowService.getCurrentState().isNewContract,
      currentApplyNo: this.currentApplyNo,
      isViewMode: this.isViewMode
    });

    // 第一優先：檢查是否有 Next3 暫存資料
    const savedNext3Data = this.contractFlowService.getStepData(WorkflowStep.CONDITION);

    if (savedNext3Data && Array.isArray(savedNext3Data) && savedNext3Data.length > 0) {
      console.log('使用 Next3 暫存資料，項目數量:', savedNext3Data.length);
      this.loadConditionDataFromCache(savedNext3Data);
    } else if (this.contractFlowService.getCurrentState().isNewContract) {
      console.log('新增模式：初始化空的條件設定');
      this.initializeNewContractConditionData(commissionType || '3');
    } else {
      console.log('編輯模式：載入條件設定');
      this.loadExistingConditionData();
    }

    this.conditionDataLoaded = true;
    this.dataLoaded = true;
  }

  /**
   * 更新新契約初始化方法以使用智能日期
   */
  private initializeNewContractConditionData(commissionType: string): void {
    console.log('新增模式：初始化條件設定，抽成類型:', commissionType);

    // 修正：使用 currentApplyNo 而非 currentTalentId
    this.allConditionItems = this.conditionDataManager.initializeEmptyConditions(
      commissionType,
      this.currentApplyNo
    );

    this.categorizeConditionItems();
    console.log('新增模式條件設定初始化完成');
  }

  /**
   * 日期變更時的自動調整邏輯
   */
  onContractDateChanged(): void {
    console.log('合約日期變更，重新計算項目日期範圍');

    const { startDate, endDate } = this.getContractDates();
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    if (!startDate || !endDate || !commissionType) {
      return;
    }

    // 只對新增項目重新計算日期
    this.adjustNewItemsDates(commissionType, startDate, endDate);
    this.saveConditionDataToWorkflow();
    this.notificationService.infoBubble('已根據合約日期調整項目日期');
  }

  /**
   * 調整新增項目的日期
   */
  private adjustNewItemsDates(commissionType: string, contractStartDate: string, contractEndDate: string): void {
    switch (commissionType) {
      case '1':
        this.adjustItemsDatesForType(this.fixedRentItems, contractStartDate, contractEndDate);
        break;
      case '2':
        this.adjustItemsDatesForType(this.baseRentHigherItems, contractStartDate, contractEndDate);
        break;
      case '4':
        this.adjustItemsDatesForType(this.baseCommissionItems, contractStartDate, contractEndDate);
        break;
      case '5':
        // 層級抽成使用合約起迄日
        this.adjustGraduatedItemsDates(contractStartDate, contractEndDate);
        break;
      case '6':
        // 包底加層級使用合約起迄日
        this.adjustBaseTierItemsDates(contractStartDate, contractEndDate);
        break;
    }
  }

  private adjustItemsDatesForType(items: ConditionItem[], contractStartDate: string, contractEndDate: string): void {
    const newItems = items.filter(item => (item as any)._status === 'new');

    newItems.forEach((item, index) => {
      if (index === 0) {
        // 第一個新增項目使用智能日期邏輯
        const dateRange = this.smartDateService.getSmartDateRange(
          this.contractInfoData[0]?.tlt_term_type || '1',
          contractStartDate,
          contractEndDate,
          items.filter(i => (i as any)._status !== 'new')
        );
        item.cag_bdate = dateRange.cag_bdate;
        item.cag_edate = dateRange.cag_edate;
      }
    });
  }

  private adjustGraduatedItemsDates(contractStartDate: string, contractEndDate: string): void {
    const newItems = this.graduatedItems.filter(item => (item as any)._status === 'new');
    newItems.forEach(item => {
      item.cag_bdate = contractStartDate;
      item.cag_edate = contractEndDate;
    });
  }

  private adjustBaseTierItemsDates(contractStartDate: string, contractEndDate: string): void {
    const newItems = this.baseTierItems.filter(item => (item as any)._status === 'new');
    newItems.forEach(item => {
      item.cag_bdate = contractStartDate;
      item.cag_edate = contractEndDate;
    });
  }

  private getDefaultStartDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getDefaultEndDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  }

  private async loadExistingConditionData(): Promise<void> {
    const commissionType = this.contractInfoData[0]?.tlt_term_type || '3';

    console.log('🔗 開始載入現有條件資料，抽成類型:', commissionType);

    try {
      // 使用新的 Commission API，修正：使用 ApplyNo
      const request = {
        apply_no: this.currentApplyNo,
        CurrentTltTermType: commissionType
      };

      console.log('📤 呼叫 queryTLS12040Commission API:', request);

      const response = await firstValueFrom(
        this.tls12040Service.queryTLS12040Commission(request).pipe(
          catchError(error => {
            console.error('Commission API 呼叫失敗:', error);
            throw error;
          })
        )
      );

      if (response?.Status === '0000' && response?.Data?.ExistingData) {
        console.log('✅ Commission API 回應成功:', response.Data);

        this.allConditionItems = this.conditionDataManager.mapBackendDataToFrontend(
          response.Data.ExistingData,
          commissionType
        );

        console.log('📋 轉換後的條件項目數量:', this.allConditionItems.length);
      } else {
        console.log('⚠️ Commission API 無資料或回應異常，使用空條件');
        this.allConditionItems = this.conditionDataManager.initializeEmptyConditions(
          commissionType,
          this.currentApplyNo
        );
      }

    } catch (error) {
      console.error('❌ Commission API 呼叫失敗:', error);

      // API 失敗時初始化為空條件
      this.allConditionItems = this.conditionDataManager.initializeEmptyConditions(
        commissionType,
        this.currentApplyNo
      );

      // 根據錯誤類型顯示適當訊息
      if (this.isNotFoundError(error)) {
        console.log('🔭 查無條件資料，初始化空條件設定');
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
      error?.error?.Status === '1001';
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

  onTableSave(event: any, commissionType: string): void {
    if (this.isReadOnlyMode) {
      this.notificationService.infoBubble('檢視模式下無法儲存');
      return;
    }
    // 根據 commissionType 轉換為對應的類型標識
    const typeMap: { [key: string]: string } = {
      '1': 'fixedRent',
      '2': 'baseRentHigher',
      '4': 'baseCommission',
      '5': 'graduated',
      '6': 'baseTier'
    };

    const type = typeMap[commissionType] || commissionType;

    const result = this.eventHandlerManager.handleTableSave(event, type, this.isViewMode);

    if (result.shouldSave && result.modifiedData) {
      event.newData = result.modifiedData;
      this.saveConditionDataToWorkflow();
      this.notificationService.successBubble(
        this.eventHandlerManager.formatSuccessMessage('save', 1, type)
      );
    }
  }

  onTableEdit(event: any, commissionType: string): boolean {
    const typeMap: { [key: string]: string } = {
      '1': 'fixedRent',
      '2': 'baseRentHigher',
      '4': 'baseCommission',
      '5': 'graduated',
      '6': 'baseTier'
    };

    const type = typeMap[commissionType] || commissionType;
    return this.eventHandlerManager.handleTableEdit(event, type, this.isViewMode);
  }

  onTableCancel(event: any, commissionType: string): void {
    const typeMap: { [key: string]: string } = {
      '1': 'fixedRent',
      '2': 'baseRentHigher',
      '4': 'baseCommission',
      '5': 'graduated',
      '6': 'baseTier'
    };

    const type = typeMap[commissionType] || commissionType;
    this.eventHandlerManager.handleTableCancel(event, type);
  }

  onBatchDelete(selectedItems: any[], commissionType: string): void {
    if (this.isReadOnlyMode) {
      this.notificationService.infoBubble('檢視模式下無法刪除項目');
      return;
    }
    const typeMap: { [key: string]: string } = {
      '1': 'fixedRent',
      '2': 'baseRentHigher',
      '4': 'baseCommission',
      '5': 'graduated',
      '6': 'baseTier'
    };

    const type = typeMap[commissionType] || commissionType;

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

  /**
   * 檢查是否應該顯示不支援類型的訊息
   */
  shouldShowUnsupportedTypeMessage(): boolean {
    if (!this.contractInfoData.length) {
      return false;
    }

    const currentCommissionType = this.contractInfoData[0]?.tlt_term_type;
    const visibleConfigs = this.getVisibleTableConfigurations();

    return visibleConfigs.length === 0 && !!currentCommissionType;
  }

  // ===== 工具方法：全域表格設定控制 =====

  /**
   * 切換全域 forceEditMode
   */
  toggleGlobalForceEditMode(): void {
    this.globalTableSettings.forceEditMode = !this.globalTableSettings.forceEditMode;
    console.log('全域 forceEditMode 切換為:', this.globalTableSettings.forceEditMode);
  }

  /**
   * 批量更新表格設定
   */
  updateGlobalTableSettings(settings: Partial<typeof this.globalTableSettings>): void {
    Object.assign(this.globalTableSettings, settings);
    console.log('全域表格設定已更新:', this.globalTableSettings);
  }

  /**
   * 動態更新特定表格的設定
   */
  updateTableConfiguration(commissionType: string, updates: Partial<TableConfiguration>): void {
    const config = this.tableConfigurations.find(c => c.commissionType === commissionType);
    if (config) {
      Object.assign(config, updates);
      console.log(`表格配置已更新 (${commissionType}):`, updates);
    }
  }

  // ===== 智能新增項目方法 =====

  /**
   * 獲取合約起迄日期
   */
  private getContractDates(): { startDate: string; endDate: string } {
    const contractInfo = this.contractInfoData[0];
    return {
      startDate: contractInfo?.tlt_bdate || contractInfo?.tlt_contract_bdate || '',
      endDate: contractInfo?.tlt_edate || contractInfo?.tlt_contract_edate || ''
    };
  }

  onAddFixedRentItem(): void {
    if (this.isReadOnlyMode) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }

    try {
      const { startDate, endDate } = this.getContractDates();

      const newItem = this.conditionDataManager.createSmartConditionItem(
        '1',
        this.currentApplyNo, // 修正：使用 currentApplyNo
        startDate,
        endDate,
        this.fixedRentItems
      );

      if (newItem) {
        // 驗證日期範圍
        const validation = this.conditionDataManager.validateNewItemDates(
          newItem,
          startDate,
          endDate,
          this.fixedRentItems
        );

        if (!validation.isValid) {
          this.notificationService.warnBubble(`新增失敗: ${validation.errors[0]}`);
          return;
        }

        this.fixedRentItems.push(newItem as FixedRentCondition);
        this.saveConditionDataToWorkflow();
        this.notificationService.successBubble('已新增固定租金項目');

        console.log(' 智能新增固定租金:', {
          id: newItem.id,
          dateRange: `${newItem.cag_bdate} ~ ${newItem.cag_edate}`,
          totalItems: this.fixedRentItems.length
        });
      }
    } catch (error) {
      console.error('新增固定租金項目失敗:', error);
      this.notificationService.errorBubble(error instanceof Error ? error.message : '新增固定租金項目失敗');
    }
  }

  /**
   * 智能新增底租抽成取高者項目
   */
  onAddBaseRentHigherItem(): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }

    try {
      const { startDate, endDate } = this.getContractDates();

      const newItem = this.conditionDataManager.createSmartConditionItem(
        '2',
        this.currentApplyNo, // 修正：使用 currentApplyNo
        startDate,
        endDate,
        this.baseRentHigherItems
      );

      if (newItem) {
        // 驗證日期範圍
        const validation = this.conditionDataManager.validateNewItemDates(
          newItem,
          startDate,
          endDate,
          this.baseRentHigherItems
        );

        if (!validation.isValid) {
          this.notificationService.warnBubble(`新增失敗: ${validation.errors[0]}`);
          return;
        }

        this.baseRentHigherItems.push(newItem as BaseRentHigherCondition);
        this.saveConditionDataToWorkflow();
        this.notificationService.successBubble('已新增底租抽成取高者項目');

        console.log(' 智能新增底租抽成取高者:', {
          id: newItem.id,
          dateRange: `${newItem.cag_bdate} ~ ${newItem.cag_edate}`,
          totalItems: this.baseRentHigherItems.length
        });
      }
    } catch (error) {
      console.error('新增底租抽成取高者項目失敗:', error);
      this.notificationService.errorBubble(error instanceof Error ? error.message : '新增底租抽成取高者項目失敗');
    }
  }

  /**
   * 智能新增包底抽成項目
   */
  onAddBaseCommissionItem(): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }

    try {
      const { startDate, endDate } = this.getContractDates();

      const newItem = this.upconditionDataManager.createSmartConditionItem(
        '4',
        this.currentApplyNo, // 修正：使用 currentApplyNo
        startDate,
        endDate,
        this.baseCommissionItems
      );

      if (newItem) {
        // 驗證日期範圍
        const validation = this.upconditionDataManager.validateNewItemDates(
          newItem,
          startDate,
          endDate,
          this.baseCommissionItems
        );

        if (!validation.isValid) {
          this.notificationService.warnBubble(`新增失敗: ${validation.errors[0]}`);
          return;
        }

        this.baseCommissionItems.push(newItem as BaseCommissionCondition);
        this.saveConditionDataToWorkflow();
        this.notificationService.successBubble('已新增包底抽成項目');

        console.log(' 智能新增包底抽成:', {
          id: newItem.id,
          dateRange: `${newItem.cag_bdate} ~ ${newItem.cag_edate}`,
          totalItems: this.baseCommissionItems.length
        });
      }
    } catch (error) {
      console.error('新增包底抽成項目失敗:', error);
      this.notificationService.errorBubble(error instanceof Error ? error.message : '新增包底抽成項目失敗');
    }
  }

  /**
   * 智能新增層級抽成項目
   */
  onAddGraduatedItem(): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }

    try {
      const { startDate, endDate } = this.getContractDates();

      const newItem = this.upconditionDataManager.createSmartConditionItem(
        '5',
        this.currentApplyNo, // 修正：使用 currentApplyNo
        startDate,
        endDate,
        this.graduatedItems
      );

      if (newItem) {
        const graduatedItem = newItem as GraduatedCommissionCondition;

        this.graduatedItems.push(graduatedItem);
        this.saveConditionDataToWorkflow();
        this.notificationService.successBubble('已新增層級抽成項目');

        console.log(' 智能新增層級抽成:', {
          id: graduatedItem.id,
          seqNo: graduatedItem.seq_no,
          dateRange: `${graduatedItem.cag_bdate} ~ ${graduatedItem.cag_edate}`,
          amountRange: `${graduatedItem.start_number} ~ ${graduatedItem.end_number}`,
          totalItems: this.graduatedItems.length
        });
      }
    } catch (error) {
      console.error('新增層級抽成項目失敗:', error);
      this.notificationService.errorBubble(error instanceof Error ? error.message : '新增層級抽成項目失敗');
    }
  }

  /**
   * 智能新增包底加層級項目
   */
  onAddBaseTierItem(): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }

    try {
      // 先檢查是否可以新增
      const canAddResult = this.smartDateService.canAddBaseTierItem(this.baseTierItems);
      if (!canAddResult.canAdd) {
        this.notificationService.warnBubble(canAddResult.reason || '無法新增包底加層級項目');
        return;
      }

      const { startDate, endDate } = this.getContractDates();

      const newItem = this.upconditionDataManager.createSmartConditionItem(
        '6',
        this.currentApplyNo, // 修正：使用 currentApplyNo
        startDate,
        endDate,
        this.baseTierItems
      );

      if (newItem) {
        const baseTierItem = newItem as BaseTierCondition;

        this.baseTierItems.push(baseTierItem);
        this.saveConditionDataToWorkflow();
        this.notificationService.successBubble('已新增包底加層級項目');

        console.log(' 智能新增包底加層級:', {
          id: baseTierItem.id,
          seqNo: baseTierItem.seq_no,
          dateRange: `${baseTierItem.cag_bdate} ~ ${baseTierItem.cag_edate}`,
          amountRange: `${baseTierItem.start_number} ~ ${baseTierItem.end_number}`,
          totalItems: this.baseTierItems.length
        });
      }
    } catch (error) {
      console.error('新增包底加層級項目失敗:', error);
      this.notificationService.errorBubble(error instanceof Error ? error.message : '新增包底加層級項目失敗');
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
    if (this.isReadOnlyMode) {
      console.log('唯讀模式，跳過資料儲存');
      return;
    }
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
      this.contractFlowService.setStepData(WorkflowStep.CONDITION, this.allConditionItems);

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
    if (this.isReadOnlyMode) {
      this.router.navigate(['account/tls/tls12040']);
      this.notificationService.infoBubble('已結束檢視');
      return;
    }

    // 提交前最後一次強制保存
    this.forceSyncAllData();

    // 驗證數據
    const commissionType = this.contractInfoData[0]?.tlt_term_type ?? '3';
    const currentItems = this.getCurrentConditionItems();

    const validation = this.conditionDataManager.validateConditions(currentItems, commissionType);

    if (!validation.isValid) {
      console.error('❌ 驗證失敗:', validation.errors);
      this.notificationService.errorBubble(`資料驗證失敗: ${validation.errors[0]}`);
      return;
    }

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

    // 第一步：強制最後一次完整同步
    console.log('強制同步 Next3 所有資料...');

    try {
      // 重新組合所有條件項目，確保沒有遺漏
      this.allConditionItems = [
        ...this.fixedRentItems,
        ...this.baseRentHigherItems,
        ...this.generalCommissionItems,
        ...this.baseCommissionItems,
        ...this.graduatedItems,
        ...this.baseTierItems
      ];

      console.log('條件項目統計:', {
        fixedRent: this.fixedRentItems.length,
        baseRentHigher: this.baseRentHigherItems.length,
        generalCommission: this.generalCommissionItems.length,
        baseCommission: this.baseCommissionItems.length,
        graduated: this.graduatedItems.length,
        baseTier: this.baseTierItems.length,
        總計: this.allConditionItems.length
      });

      // 立即強制儲存到工作流程
      this.contractFlowService.setStepData(WorkflowStep.CONDITION, this.allConditionItems);

      // 驗證資料是否正確儲存
      const verifyStep4 = this.contractFlowService.getStepData(WorkflowStep.CONDITION);
      const verifyStep4Array = Array.isArray(verifyStep4) ? verifyStep4 : [];
      console.log('驗證 Step4 資料儲存結果:', {
        原始項目數: this.allConditionItems.length,
        暫存項目數: verifyStep4Array.length,
        資料一致: verifyStep4Array.length === this.allConditionItems.length
      });

    } catch (syncError) {
      console.error('強制同步資料時發生錯誤:', syncError);
      this.notificationService.errorBubble('資料同步失敗，請重試');
      return;
    }

    // 第二步：開始提交流程
    this.loading = true;
    this.notificationService.blockUi();

    try {
      //  修正：使用 TLS12040 專用的生成方法
      const submitData = this.contractFlowService.generateTLS12040SubmitData();

      console.log('Next3: 最終送出的完整資料:');
      console.log(JSON.stringify(submitData, null, 2));

      // 驗證資料
      const validation = this.validateTLS12040SubmitData(submitData);

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

      console.log('資料驗證通過，開始調用 API...');

      //  修正：調用 TLS12040 專用的 API
      this.callTLS12040SubmitAPI(submitData);

    } catch (error) {
      console.error('Next3: 準備提交資料時發生錯誤:', error);
      this.loading = false;
      this.notificationService.unblockUi();
      this.notificationService.errorBubble(`準備提交資料時發生錯誤: ${error}`);
    }
  }

  /**
  * 驗證 TLS12040 提交資料
  */
  private validateTLS12040SubmitData(submitData: any): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 基本檢查
    if (!submitData) {
      errors.push('提交資料為空');
      return { isValid: false, errors, warnings };
    }

    // // 檢查基本合約資料
    // if (!submitData.contractInfo?.data?.apply_no) {
    //   errors.push('缺少申請編號');
    // }

    if (!submitData.contractInfo?.data?.tlt_name) {
      errors.push('缺少品牌名稱');
    }

    // 檢查必要的操作類型
    if (!submitData.contractInfo?.operation) {
      errors.push('缺少合約操作類型');
    }

    // // 檢查元數據
    // if (!submitData.metadata?.apply_no) {
    //   errors.push('缺少元數據中的申請編號');
    // }

    // 檢查條件資料（根據抽成類型）
    const commissionType = submitData.metadata?.commissionType;
    if (commissionType && commissionType !== '3') {
      const conditionData = submitData.conditions;
      if (!conditionData) {
        warnings.push('沒有條件設定資料');
      } else {
        // 檢查是否有對應抽成類型的條件設定
        const hasRelevantConditions = this.checkRelevantConditions(conditionData, commissionType);
        if (!hasRelevantConditions) {
          warnings.push(`抽成類型 ${commissionType} 沒有對應的條件設定`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 檢查是否有對應的條件設定
   */
  private checkRelevantConditions(conditionData: any, commissionType: string): boolean {
    switch (commissionType) {
      case '1':
        return conditionData.fixedRents?.toInsert?.length > 0 ||
          conditionData.fixedRents?.toUpdate?.length > 0;
      case '2':
        return conditionData.baseRentHigher?.toInsert?.length > 0 ||
          conditionData.baseRentHigher?.toUpdate?.length > 0;
      case '4':
        return conditionData.baseCommissions?.toInsert?.length > 0 ||
          conditionData.baseCommissions?.toUpdate?.length > 0;
      case '5':
        return conditionData.graduated?.toInsert?.length > 0 ||
          conditionData.graduated?.toUpdate?.length > 0;
      case '6':
        return conditionData.baseTier?.toInsert?.length > 0 ||
          conditionData.baseTier?.toUpdate?.length > 0;
      default:
        return true; // 一般抽成不需要條件設定
    }
  }

  /**
   * 調用 TLS12040 提交 API
   */
  private callTLS12040SubmitAPI(submitData: any): void {
    console.log('Next3: 調用 TLS12040 API 提交合約資料...');

    //  修正：使用正確的 service 方法名稱
    this.tls12040Service.submitFinalTLS12040(submitData).subscribe({
      next: (response) => this.handleSubmitSuccess(response),
      error: (error) => this.handleSubmitError(error)
    });
  }

  /**
   * 處理提交成功
   */
  private handleSubmitSuccess(response: any): void {
    this.loading = false;
    this.notificationService.unblockUi();

    console.log('Next3: 處理提交成功回應:', response);

    let successMessage = '合約資料提交成功！';
    if (response.message) {
      successMessage += '\n' + response.message;
    }

    //  修正：顯示更詳細的成功資訊
    if (response.success && response.data) {
      const summary = [
        `專櫃編號: ${response.data.talentId || response.talentId || ''}`,
        `合約編號: ${response.data.contractNo || response.contractNo || ''}`,
        `處理項目: ${response.data.totalProcessed || response.totalProcessed || 0} 筆`
      ].filter(item => item.includes(':') && !item.endsWith(': ')).join('\n');

      if (summary) {
        successMessage += '\n\n' + summary;
      }
    }

    this.notificationService.successBubble(successMessage);

    // 提交成功後清理暫存並導航
    this.contractFlowService.onSubmitSuccess();

    setTimeout(() => {
      this.router.navigate(['account/tls/tls12040']);
    }, 3000);
  }

  /**
   * 處理提交錯誤
   */
  private handleSubmitError(error: any): void {
    this.loading = false;
    this.notificationService.unblockUi();

    console.error('Next3: 處理提交錯誤:', error);

    let errorMessage = '合約資料提交失敗';

    if (error?.error?.Message) {
      errorMessage += `: ${error.error.Message}`;
    } else if (error?.message) {
      errorMessage += `: ${error.message}`;
    }

    //  修正：提供更詳細的錯誤資訊
    if (error?.error?.Data?.errors) {
      const detailErrors = error.error.Data.errors.slice(0, 3).join('; ');
      errorMessage += `\n詳細錯誤: ${detailErrors}`;
    }

    this.notificationService.errorBubble(errorMessage);
  }

  // ===== 導航方法 =====

  override onCancel(): void {
    if (!this.isReadOnlyMode) {
      console.log('Next3 返回前一頁，先暫存資料');
      this.saveConditionDataToWorkflow();
    }

    const navigationExtras: NavigationExtras = {
      state: {
        crudstatus: this.crudstatus,
        fromRoute: this.router.url
      }
    };

    // 根據合約類型決定返回目標
    const tltTermType = this.contractInfoData[0]?.tlt_term_type?.toString().trim();
    if (tltTermType === '1') {
      // 固定租金：返回 next1（因為 next2 被跳過）
      console.log('🔍 合約類型為固定租金(1)，返回 next1');
      this.router.navigate(['account/tls/tls12040next1'], navigationExtras);
    } else {
      // 其他類型：正常返回 next2
      console.log('🔍 合約類型非固定租金，返回 next2');
      this.router.navigate(['account/tls/tls12040next2'], navigationExtras);
    }
  }

  onClearAndExit(): void {
    this.contractFlowService.clearAll();
    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };
    this.router.navigate(['account/tls/tls12040'], extras);
    this.notificationService.infoBubble('已清空暫存資料並離開');
  }

  // ===== 工具方法 =====

  onTableFieldChange(event: any, commissionType: string): void {
    console.log('🔥 Next3 收到欄位變更事件:', {
      fieldName: event.fieldName,
      newValue: event.newValue,
      oldValue: event.oldValue,
      rowId: event.rowData?.id,
      commissionType,
      timestamp: new Date().toISOString()
    });

    try {
      // 關鍵修正：確保正確更新狀態
      const modifiedData = this.updateDataStatus(event.rowData);

      // 立即更新到對應的資料陣列
      this.updateLocalDataArray(commissionType, modifiedData);

      // 立即保存到工作流程
      this.saveConditionDataToWorkflow();

      console.log('✅ 欄位變更已立即保存到暫存');

    } catch (error) {
      console.error('❌ 保存欄位變更時發生錯誤:', error);
    }
  }

  private updateDataStatus(data: any): any {
    const modifiedData = { ...data };

    // 如果是新增的資料，保持 new 狀態
    if (modifiedData._status === 'new') {
      console.log(' 保持新增狀態:', modifiedData.id);
      return modifiedData;
    }

    // 如果是原始資料，標記為已修改
    if (modifiedData._status === 'original' || !modifiedData._status) {
      modifiedData._status = 'modified';
      console.log('📝 標記為已修改:', modifiedData.id);
    }

    return modifiedData;
  }

  /**
   * 更新本地數據陣列
   */
  private updateLocalDataArray(commissionType: string, modifiedData: any): void {
    const dataId = modifiedData.id;

    switch (commissionType) {
      case '1':
        this.updateItemInArray(this.fixedRentItems, dataId, modifiedData);
        break;
      case '2':
        this.updateItemInArray(this.baseRentHigherItems, dataId, modifiedData);
        break;
      case '4':
        this.updateItemInArray(this.baseCommissionItems, dataId, modifiedData);
        break;
      case '5':
        this.updateItemInArray(this.graduatedItems, dataId, modifiedData);
        break;
      case '6':
        this.updateItemInArray(this.baseTierItems, dataId, modifiedData);
        break;
    }
  }

  /**
   * 更新陣列中的指定項目
   */
  private updateItemInArray(array: any[], itemId: string, newData: any): void {
    const index = array.findIndex(item => item.id === itemId);
    if (index > -1) {
      // 🔑 關鍵修正：完全替換而不是合併，確保狀態正確更新
      array[index] = { ...newData };
      console.log(`✅ 已更新 ${itemId}:`, {
        id: newData.id,
        _status: newData._status,
        主要欄位: {
          base_rent: newData.base_rent,
          charge_rate: newData.charge_rate || newData.cag_charge_rate,
          limit_amt: newData.limit_amt
        }
      });
    } else {
      console.warn(`⚠️ 找不到 ID: ${itemId} 的項目`);
    }
  }

  private forceSyncAllData(): void {
    console.log('🔄 強制同步所有數據...');

    // 重新組合所有條件項目
    this.allConditionItems = [
      ...this.fixedRentItems,
      ...this.baseRentHigherItems,
      ...this.generalCommissionItems,
      ...this.baseCommissionItems,
      ...this.graduatedItems,
      ...this.baseTierItems
    ];

    // 立即保存
    this.contractFlowService.setStepData(WorkflowStep.CONDITION, this.allConditionItems);

    console.log('✅ 所有數據已強制同步，總項目:', this.allConditionItems.length);
  }
}
