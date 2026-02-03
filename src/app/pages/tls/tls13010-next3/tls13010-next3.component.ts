import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { catchError, firstValueFrom, Subscription } from 'rxjs';

// 基礎組件和服務
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ContractFlowService } from '../tls13010/services/contract-flow.service';

// UI 組件
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';

// 模型定義
import {
  BaseCommissionCondition,
  BaseRentHigherCondition,
  BaseTierCondition,
  CleanSubmitData,
  ConditionItem,
  ContractInfo,
  FixedRentCondition,
  GeneralCommissionCondition,
  GraduatedCommissionCondition,
  WorkflowStep
} from '../tls13010/tls13010.model';
import { TABLE_CONFIGURATIONS, TableConfiguration } from './models/tls13010-next3.model';
import { ConditionDataManager } from './Services/condition-data-manager.service';
import { EventHandlerManager } from './Services/event-handler-manager.service';
import { SmartDateSegmentationService } from './Services/smart-date-manager.service';
import { TableConfigManager } from './Services/table-config-manager.service';
import { UpConditionDataManager } from './Services/updated-condition-data-manager.service';
import { ContractSubmitService } from './SubmitService/contract-submit.service';

@Component({
  selector: 'app-tls13010-next3',
  templateUrl: './tls13010-next3.component.html',
  styleUrls: ['./tls13010-next3.component.scss'],
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
export class Tls13010Next3Component extends BasicCruPageComponent<ConditionItem> implements OnInit, OnDestroy {
  tableConfigurations: TableConfiguration[] = TABLE_CONFIGURATIONS;
  globalTableSettings = {
    forceEditMode: true,        //全域控制 forceEditMode
    showActionColumn: false,
    showAddButton: true,
    showBatchDelete: true,
    showCheckBox: true,
    readonly: false,
  };

  // ===== 狀態管理 =====
  // 將 CRUDStatus 暴露給模板使用
  readonly CRUDStatus = CRUDStatus;

  dataLoaded = false;
  conditionDataLoaded = false;
  showConfirmDialog = false;

  // ===== 訂閱管理 =====
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

    private upconditionDataManager: UpConditionDataManager,

    private tableConfigManager: TableConfigManager,
    private eventHandlerManager: EventHandlerManager,
    private smartDateService: SmartDateSegmentationService,
    private contractSubmitService: ContractSubmitService,
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
      // 只顯示符合當前抽成類型的表格
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
    // 優先使用全域設定，其次使用表格個別設定，最後使用預設值
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

    this.setupViewModeUI();
    this.initializePage('TLS13010', this.dataForm);
    this.initializeTableConfigs();

    this.loadDiscountOptions().then(() => {
      this.loadWorkflowData();
    });
  }

  ngOnDestroy(): void {
    console.log('Next3 組件銷毀前暫存資料');

    if (this.crudstatus !== CRUDStatus.Read) {
      this.saveConditionDataToWorkflow();
    }

    // 清理訂閱
    this.subscriptions.forEach(sub => sub.unsubscribe());
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

    // 🔑 優先從 workflowStatus 恢復 crudStatus (支援頁面重新整理)
    const workflowStatus = this.contractFlowService.getCurrentStatus();
    if (workflowStatus?.crudStatus) {
      this.crudstatus = workflowStatus.crudStatus;
      console.log(`   從 workflowStatus 恢復 CRUD 狀態: ${this.crudstatus}`);

      // 同步 isViewMode 狀態
      const isViewMode = this.crudstatus === CRUDStatus.Read;
      this.contractFlowService.setViewMode(isViewMode);
      this.applyViewModeSettings(isViewMode);
    } else {
      // fallback: 初始化 CRUD 狀態
      const currentViewMode = this.contractFlowService.isViewMode();
      this.crudstatus = currentViewMode ? CRUDStatus.Read : CRUDStatus.Edit;
      console.log(`   從 isViewMode 推斷 CRUD 狀態: ${this.crudstatus}`);

      if (currentViewMode) {
        this.applyViewModeSettings(true);
      }
    }

    // 監聽檢視模式變更
    const viewModeSubscription = this.contractFlowService.isViewMode$.subscribe(isViewMode => {
      this.crudstatus = isViewMode ? CRUDStatus.Read : CRUDStatus.Edit;
      this.applyViewModeSettings(isViewMode);
    });
    this.subscriptions.push(viewModeSubscription);

    console.log(`   最終 CRUD 狀態: ${this.crudstatus}`);
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
      vendor_ven_no: step1Data?.vendor_ven_no || this.currentContractData?.vendor_ven_no || '',
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
      isViewMode: this.crudstatus === CRUDStatus.Read
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



  /**
   * 更新新契約初始化方法以使用智能日期
   */
  private initializeNewContractConditionData(commissionType: string): void {
    console.log('新增模式：初始化條件設定，抽成類型:', commissionType);

    // 取得合約起訖日期作為預設值
    const { startDate, endDate } = this.getContractDates();

    // 使用智能日期初始化，預設帳務起訖為合約起訖日
    this.allConditionItems = this.conditionDataManager.initializeSmartConditions(
      commissionType,
      this.currentTalentId,
      startDate || this.getDefaultStartDate(),
      endDate || this.getDefaultEndDate()
    );

    this.categorizeConditionItems();
    console.log('新增模式條件設定初始化完成');
  }

  /**
   * 日期變更時的自動調整邏輯
   */
  onContractDateChanged(): void {
    console.log('契約日期變更，重新計算項目日期範圍');

    const { startDate, endDate } = this.getContractDates();
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    if (!startDate || !endDate || !commissionType) {
      return;
    }

    // 只對新增項目重新計算日期
    this.adjustNewItemsDates(commissionType, startDate, endDate);
    this.saveConditionDataToWorkflow();
    this.notificationService.infoBubble('已根據契約日期調整項目日期');
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
        // 層級抽成使用契約起訖日
        this.adjustGraduatedItemsDates(contractStartDate, contractEndDate);
        break;
      case '6':
        // 包底加層級使用契約起訖日
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
      // 使用新的 Commission API
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

        // 修正：使用正確的資料路徑 ExistingData 而不是 RentSettingData
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

  onTableSave(event: any, commissionType: string): void {
    // 根據 commissionType 轉換為對應的類型標識
    const typeMap: Record<string, string> = {
      '1': 'fixedRent',
      '2': 'baseRentHigher',
      '4': 'baseCommission',
      '5': 'graduated',
      '6': 'baseTier'
    };

    const type = typeMap[commissionType] || commissionType;

    const result = this.eventHandlerManager.handleTableSave(event, type, this.crudstatus === CRUDStatus.Read);

    if (result.shouldSave && result.modifiedData) {
      event.newData = result.modifiedData;
      this.saveConditionDataToWorkflow();
      this.notificationService.successBubble(
        this.eventHandlerManager.formatSuccessMessage('save', 1, type)
      );
    }
  }

  onTableEdit(event: any, commissionType: string): boolean {
    const typeMap: Record<string, string> = {
      '1': 'fixedRent',
      '2': 'baseRentHigher',
      '4': 'baseCommission',
      '5': 'graduated',
      '6': 'baseTier'
    };

    const type = typeMap[commissionType] || commissionType;
    return this.eventHandlerManager.handleTableEdit(event, type, this.crudstatus === CRUDStatus.Read);
  }

  onTableCancel(event: any, commissionType: string): void {
    const typeMap: Record<string, string> = {
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
    const typeMap: Record<string, string> = {
      '1': 'fixedRent',
      '2': 'baseRentHigher',
      '4': 'baseCommission',
      '5': 'graduated',
      '6': 'baseTier'
    };

    const type = typeMap[commissionType] || commissionType;

    const result = this.eventHandlerManager.handleBatchDelete(selectedItems, type, this.crudstatus === CRUDStatus.Read);

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
   * 獲取契約起訖日期
   */
  private getContractDates(): { startDate: string; endDate: string } {
    const contractInfo = this.contractInfoData[0];
    return {
      startDate: contractInfo?.tlt_bdate || contractInfo?.tlt_contract_bdate || '',
      endDate: contractInfo?.tlt_edate || contractInfo?.tlt_contract_edate || ''
    };
  }
  onAddFixedRentItem(): void {
    if (this.crudstatus === CRUDStatus.Read) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }

    try {
      const { startDate, endDate } = this.getContractDates();

      const newItem = this.conditionDataManager.createSmartConditionItem(
        '1',
        this.currentTalentId,
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
    if (this.crudstatus === CRUDStatus.Read) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }

    try {
      const { startDate, endDate } = this.getContractDates();

      const newItem = this.conditionDataManager.createSmartConditionItem(
        '2',
        this.currentTalentId,
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
    if (this.crudstatus === CRUDStatus.Read) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }

    try {
      const { startDate, endDate } = this.getContractDates();

      const newItem = this.upconditionDataManager.createSmartConditionItem(
        '4',
        this.currentTalentId,
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
    if (this.crudstatus === CRUDStatus.Read) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }

    try {
      const { startDate, endDate } = this.getContractDates();

      const newItem = this.upconditionDataManager.createSmartConditionItem(
        '5',
        this.currentTalentId,
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
    if (this.crudstatus === CRUDStatus.Read) {
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
        this.currentTalentId,
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

  async onSubmitNext(): Promise<void> {
    console.log('Next3: 準備提交契約資料');

    // 先保存當前的條件設定到工作流程
    this.saveConditionDataToWorkflow();

    // 使用統一的提交服務驗證
    const commissionType = this.contractInfoData[0]?.tlt_term_type;
    const validation = this.contractSubmitService.validateBeforeSubmit(commissionType);
    if (!validation.valid) {
      this.notificationService.errorBubble(validation.message ?? '資料驗證失敗');
      return;
    }

    try {
      this.loading = true;

      // 使用統一的提交服務
      const result = await this.contractSubmitService.submitContract({
        isNext2Flow: false, // 標記為 Next3 流程
        onSuccess: (response) => {
          // Next3 特殊的成功處理（如果需要）
          console.log('Next3 提交成功，額外處理:', response);
        },
        onError: (error) => {
          // Next3 特殊的錯誤處理（如果需要）
          console.error('Next3 提交失敗，額外處理:', error);
        }
      });

      if (!result.success) {
        console.error('Next3: 提交流程失敗');
      }

    } finally {
      this.loading = false;
    }
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

    // 第一步：強制最後一次完整同步 - 確保所有資料都正確儲存
    console.log('强制同步 Next3 所有資料...');

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
      this.contractFlowService.saveStep4Data(this.allConditionItems);

      // 驗證資料是否正確儲存
      const verifyStep4 = this.contractFlowService.getStep4Data();
      console.log('驗證 Step4 資料儲存結果:', {
        原始項目數: this.allConditionItems.length,
        暫存項目數: verifyStep4?.length || 0,
        資料一致: (verifyStep4?.length || 0) === this.allConditionItems.length
      });

      // 如果資料不一致，重試一次
      if (!verifyStep4 || verifyStep4.length !== this.allConditionItems.length) {
        console.warn('資料不一致，重試儲存...');
        // 等待一下再重試
        setTimeout(() => {
          this.contractFlowService.saveStep4Data(this.allConditionItems);
        }, 100);

        // 再次驗證
        const retryVerify = this.contractFlowService.getStep4Data();
        console.log('重試後驗證結果:', {
          項目數: retryVerify?.length || 0
        });
      }

    } catch (syncError) {
      console.error('強制同步資料時發生錯誤:', syncError);
      this.notificationService.errorBubble('資料同步失敗，請重試');
      return;
    }

    // 第二步：檢查與 Next2 的數量一致性
    if (!this.validateNext2DataConsistency()) {
      return;
    }

    // 第三步：開始提交流程
    this.loading = true;
    this.notificationService.blockUi();

    try {
      // 最終確認所有步驟的資料都正確
      const finalVerification = {
        step1: !!this.contractFlowService.getStep1Data(),
        step2Count: this.contractFlowService.getStep2Data()?.length || 0,
        step3Count: this.contractFlowService.getStep3Data()?.length || 0,
        step4Count: this.contractFlowService.getStep4Data()?.length || 0
      };

      console.log('最終資料驗證:', finalVerification);

      // 生成清理後的提交資料
      const cleanSubmitData = this.contractFlowService.generateCleanSubmitData();

      console.log('Next3: 最終送出的完整 JSON:');
      console.log(JSON.stringify(cleanSubmitData, null, 2));

      // 特別檢查條件資料是否正確包含
      console.log('條件資料檢查:', {
        hasConditions: !!cleanSubmitData.conditions,
        conditionKeys: Object.keys(cleanSubmitData.conditions || {}),
        conditionCounts: Object.entries(cleanSubmitData.conditions || {}).map(([key, value]: [string, any]) => ({
          type: key,
          insertCount: value?.toInsert?.length || 0,
          updateCount: value?.toUpdate?.length || 0,
          deleteCount: value?.toDelete?.length || 0
        }))
      });

      // 檢查抽成別變更警告
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

      // 最終檢查：確保至少有基本的合約資料
      if (!cleanSubmitData.contractInfo?.data?.tlt_name) {
        console.error('Next3: 缺少基本合約資料');
        this.loading = false;
        this.notificationService.unblockUi();
        this.notificationService.errorBubble('缺少基本合約資料，請檢查第一步的資料填寫');
        return;
      }

      console.log('資料驗證通過，開始調用 API...');

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
      const extras: NavigationExtras = {
        state: { fromRoute: this.router.url }
      };
      this.router.navigate(['account/tls/tls13010'], extras);
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
    // 移除抽成設定與條件設定數量一致性檢查，直接返回 true
    return true;
  }

  // ===== 導航方法 =====

  override onCancel(): void {
    const contractTermType = this.contractInfoData[0]?.tlt_term_type?.toString().trim();

    // 檢視模式：根據合約類型決定導航目標
    if (contractTermType === '1') {
      console.log('🔍 檢視模式：合約類型為1，直接跳轉到 next1');
      this.router.navigate(['account/tls/tls13010next1']);
    } else {
      console.log('🔍 檢視模式：合約類型非1，跳轉到 next2');
      this.router.navigate(['account/tls/tls13010next2']);

    }
    this.saveConditionDataToWorkflow();
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
  onTableFieldChange(event: any, commissionType: string): void {
    console.log('🔥 Next3 收到欄位變更事件:', {
      fieldName: event.fieldName,
      newValue: event.newValue,
      oldValue: event.oldValue,
      rowId: event.rowData?.id,
      commissionType,
      timestamp: new Date().toISOString()
    });

    // 檢查資料是否正確
    console.log('📋 當前 rowData:', event.rowData);

    try {
      // 關鍵修正：確保正確更新狀態
      const modifiedData = this.updateDataStatus(event.rowData);

      // 立即更新到對應的資料陣列
      this.updateLocalDataArray(commissionType, modifiedData);

      // 立即保存到工作流程
      this.saveConditionDataToWorkflow();

      console.log('✅ 欄位變更已立即保存到暫存');

      // 驗證暫存是否成功
      const savedData = this.contractFlowService.getStepData(WorkflowStep.CONDITION);
      console.log('🔍 驗證暫存結果:', {
        savedItemCount: Array.isArray(savedData) ? savedData.length : 0,
        modifiedItemId: modifiedData.id,
        modifiedItemStatus: modifiedData._status
      });

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
    this.contractFlowService.saveStep4Data(this.allConditionItems);

    console.log('✅ 所有數據已強制同步，總項目:', this.allConditionItems.length);
  }
}
