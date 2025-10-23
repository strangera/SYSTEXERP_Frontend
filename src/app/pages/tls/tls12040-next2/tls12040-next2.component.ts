import { ChangeDetectorRef, Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { MenubarComponent } from "@shared/component/menubar/menubar.component";
import { ButtonComponent } from "@shared/componentkit/button/button.component";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { AccordionModule } from "primeng/accordion";
import { debounceTime, distinctUntilChanged, lastValueFrom, Subscription } from 'rxjs';
import { ColumnDef, ExpandableEditTableComponent } from "@shared/componentkit/expandable-edit-table/expandable-edit-table.component";
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { TLS12040Service } from '@service/api/tls/tls12040.service';
import { TLS12040FlowService } from '../tls12040/Workflow/tls12040-contract-flow.service';
import { CruData, SimpleContractInfo } from '../tls12040-next1/models/tls12040-next1.model';
import { NgIf } from '@angular/common';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { DialogModule } from "primeng/dialog";
import { ChargeDetailBusinessModel, ChargeSettingBusinessModel, LevelChargeDetailBusinessModel, TLS12040ChargeQueryResponse } from './models/tls12040-next2.model';
import { FormGroup } from '@angular/forms';
import { TLS12040Next2ColumnsConfig } from './services/tls12040-next2-columns.config';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { TLS12040DataFlowService } from './services/tls12040-data-flow.service';
import { TLS12040DetailModel } from '../tls12040-cru/models/tls12040-cru.model';
import { Button } from "primeng/button";
interface CategoryItem {
  id: number;
}

@Component({
  selector: 'app-tls12040-next2',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, ProgressSpinnerModule, AccordionModule, ExpandableEditTableComponent, DialogModule,
    NgIf, Button],
  providers: [
    TLS12040DataFlowService
  ],
  templateUrl: './tls12040-next2.component.html',
  styleUrl: './tls12040-next2.component.scss'
})
export class TLS12040Next2Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {
  private routeState: any = null; // 保存路由狀態
  private readonly notificationService = inject(NotificationService);
  private readonly flowService = inject(TLS12040FlowService);

  private discountOptions: any[] = [];
  selectedSettingTab = 'discount';

  private viewModeSubscription?: Subscription;

  private subscriptions: Subscription[] = [];

  showConfirmDialog = false;
  hasUnsavedChanges = false;
  dataLoaded = false;
  commissionDataLoaded = false;
  contractInfoData: SimpleContractInfo[] = [];
  currentContractData: SimpleContractInfo | null = null;
  commissionColumns: ColumnDef[] = [];
  contractInfoColumns: any[] = [];
  discountColumns: ColumnDef[] = [];
  annualColumns: ColumnDef[] = [];
  levelColumns: ColumnDef[] = [];
  commissionData: ChargeSettingBusinessModel[] = [];
  dataForm: FormGroup;


  currentApplyNo: string | null = null;

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

  settingTabs = [
    {
      id: 'discount',
      label: '折扣設定',
      allowAdd: false,
      allowBatchDelete: false,
      showCheckbox: false
    },
    {
      id: 'level',
      label: '折扣別層級抽成設定',
      allowAdd: false,
      allowBatchDelete: false,
      showCheckbox: false
    },
    {
      id: 'annual',
      label: '年度總業績抽成設定',
      allowAdd: true,
      allowBatchDelete: true,
      showCheckbox: true
    }
  ];

  taxTypeOptions: any[] = [
    { label: '應稅', value: '1' },
    { label: '免稅', value: '0' }
  ];

  constructor(
    private route: ActivatedRoute,
    private tls12040Service: TLS12040Service,
    private cdr: ChangeDetectorRef,
    private locationOptionsService: LocationOptionsService,
    @Inject(TLS12040DataFlowService) private dataFlowService: TLS12040DataFlowService,

  ) {
    super();
    const navigation = this.router.getCurrentNavigation();
    this.routeState = navigation?.extras?.state;

    console.log('Constructor 中獲取的路由狀態:', this.routeState);
    this.dataForm = this.formBuilder.group({});
  }

  get visibleCommissionData() {
    return this.commissionData.filter(item => item._status !== 'deleted');
  }

  get isGeneralCommissionMode(): boolean {
    return this.currentCommissionType === '3';
  }

  get currentCommissionType(): string {
    // 1. 優先從 flowService 的 CRU 資料取得（最可靠的來源）
    const step1Data = this.flowService.getCruData();
    if (step1Data?.tlt_term_type) {
      // console.log('從 flowService CRU 資料取得 tlt_term_type:', step1Data.tlt_term_type);
      return step1Data.tlt_term_type.toString();
    }

    // 2. 如果 CRU 資料沒有，才檢查 contractInfoData
    if (this.contractInfoData && this.contractInfoData.length > 0) {
      const termType = this.contractInfoData[0].tlt_term_type;
      // console.log('從 contractInfoData 取得 tlt_term_type:', termType);
      return termType || '3';
    }

    // 3. 最後才使用預設值
    console.log('使用預設 tlt_term_type: 3');
    return '3';
  }

  async ngOnInit(): Promise<void> {
    try {
      console.log('=== TLS12040 Next2 初始化開始 ===');

      //  第一步:基礎設定
      this.initializePage('TLS12040', this.dataForm);
      this.handleRouterState();

      //  第二步:載入必要的選項資料
      console.log('📋 載入折扣選項...');
      this.discountOptions = await this.dataFlowService.loadDiscountOptions();
      if (this.discountOptions.length === 0) {
        console.warn('⚠️ 沒有載入到折扣選項');
      }
      console.log('=== CRUD 狀態調試 ===');
      console.log('當前 CRUD 狀態:', this.crudstatus);
      console.log('isReadOnlyMode:', this.isReadOnlyMode);
      console.log('isEditMode:', this.isEditMode);
      console.log('isCreateMode:', this.isCreateMode);
      //  第三步:初始化欄位配置
      this.initializeColumns();
      this.updateDiscountColumnOptions();

      //  第四步:訂閱資料狀態變更(要在載入資料前訂閱)
      this.subscribeToDataChanges();

      //  第五步:載入合約基本資訊(獨立載入,不影響抽成資料)
      this.loadContractInfo();

      //  第六步:決定資料來源並載入
      await this.loadCommissionData();

      //  新增第七步:確保資料一致性
      this.ensureDataConsistency();

      //  第八步:設定自動儲存(僅編輯模式)
      if (!this.isReadOnlyMode) {
        this.setupAutoSave();
      }

      console.log(' TLS12040 Next2 初始化完成');

    } catch (error) {
      console.error('❌ 初始化失敗:', error);
      this.notificationService.errorBubble('頁面初始化失敗');
    }
  }

  /**
   *  新增:確保資料一致性（學習 TLS13010）
   */
  private ensureDataConsistency(): void {
    console.log(' 確保資料一致性...');

    this.commissionData.forEach((item, index) => {
      // 1. 強制重置到 discount 標籤,避免狀態混亂
      this.selectedSettingTab = 'discount';

      // 2. 確保折扣項目有正確的日期
      this.fixDiscountItemDates(item);

      // 3. 更新顯示項目
      this.updateItemDisplayData(item);

      console.log(`  項目 ${index + 1} 已重置到 discount 標籤`);
    });

    // 4. 同步全域標籤狀態
    this.selectedSettingTab = 'discount';

    console.log(' 資料一致性確保完成');
  }

  /**
   *  新增:修復折扣項目的日期（避免日期消失問題）
   */
  private fixDiscountItemDates(commissionItem: ChargeSettingBusinessModel): void {
    const contractStartDate = this.getContractDate('start');
    const contractEndDate = this.getContractDate('end');

    if (commissionItem.ChargeDetails) {
      commissionItem.ChargeDetails.forEach((discount: any, index: number) => {
        // 檢查並修復起始日期
        if (!discount.tlt_bdate || isNaN(new Date(discount.tlt_bdate).getTime())) {
          discount.tlt_bdate = contractStartDate;
          console.log(`  修復項目 ${index} 的起始日期`);
        }
        // 檢查並修復結束日期
        if (!discount.tlt_edate || isNaN(new Date(discount.tlt_edate).getTime())) {
          discount.tlt_edate = contractEndDate;
          console.log(`  修復項目 ${index} 的結束日期`);
        }
      });
    }
  }

  /**
   *  改進:獨立的資料訂閱方法
   */
  private subscribeToDataChanges(): void {
    const subscription = this.dataFlowService.state$.subscribe(state => {
      console.log('📊 資料狀態更新:', {
        dataLoaded: state.uiState.dataLoaded,
        itemCount: state.currentEditData.length
      });

      this.commissionData = state.currentEditData;
      this.loading = state.uiState.loading;
      this.dataLoaded = state.uiState.dataLoaded;
      this.hasUnsavedChanges = state.uiState.hasUnsavedChanges;
      this.commissionDataLoaded = state.uiState.dataLoaded && state.currentEditData.length >= 0;

      this.cdr.detectChanges();
    });

    this.subscriptions.push(subscription);
  }

  /**
   *  改進:統一的抽成資料載入方法
   */
  async loadCommissionData(): Promise<void> {
    // 先檢查是否有暫存資料
    const savedData = this.flowService.getStepData('next2');

    if (savedData?.data?.commissionData && savedData.data.commissionData.length > 0) {
      //  有暫存，直接用暫存資料
      console.log('📦 從暫存載入抽成資料');
      this.commissionData = savedData.data.commissionData;
      this.dataLoaded = true;
      this.commissionDataLoaded = true;
      return;
    }

    // ❌ 沒有暫存，才打 API
    console.log('🌐 從 API 載入抽成資料');
    await this.dataFlowService.loadData(
      this.currentApplyNo,
      this.discountOptions,
      this.getContractDate('start'),
      this.getContractDate('end')
    );

    // 從 dataFlowService 取得資料
    this.commissionData = this.dataFlowService.getVisibleData();
    this.dataLoaded = true;
    this.commissionDataLoaded = true;
  }



  //獨立的合約資訊載入方法（學習 Next1）
  private loadContractInfo(): void {
    console.log('載入合約資訊...');

    const cruData = this.flowService.getCruData();
    console.log('🔍 完整 CRU 資料:', cruData);
    console.log('🔍 apply_no:', cruData?.apply_no);
    console.log('🔍 flowService 狀態:', this.flowService.getCurrentState());
    this.currentApplyNo = cruData?.apply_no || null;
    if (cruData) {
      this.prepareContractInfoDisplay(cruData);
      console.log(' 合約資訊載入完成:', this.contractInfoData);
    } else {
      console.warn('⚠️ 沒有 CRU 資料');
      this.contractInfoData = [];
    }
  }

  private handleRouterState(): void {
    console.log('=== Next2 狀態處理 ===');
    console.log('保存的路由狀態:', this.routeState);

    if (this.routeState?.crudstatus) {
      this.crudstatus = this.routeState.crudstatus;
      console.log('從路由狀態設定 CRUD 狀態:', this.crudstatus);
    } else {
      // 備用方案：從 workflow service 推斷
      const workflowState = this.flowService.getCurrentState();
      if (workflowState?.isNewContract !== undefined) {
        this.crudstatus = workflowState.isNewContract ? CRUDStatus.Create : CRUDStatus.Edit;
        console.log('從 workflow 推斷 CRUD 狀態:', this.crudstatus);
      } else {
        this.crudstatus = CRUDStatus.Edit;
        console.log('使用預設 CRUD 狀態:', this.crudstatus);
      }
    }

    console.log('最終 Next2 CRUD 狀態:', this.crudstatus);
    console.log('是否為唯讀模式:', this.isReadOnlyMode);
  }


  private initializeColumns(): void {
    this.contractInfoColumns = TLS12040Next2ColumnsConfig.getContractInfoColumns();
    this.annualColumns = TLS12040Next2ColumnsConfig.getAnnualColumns();
    this.commissionColumns = TLS12040Next2ColumnsConfig.getCommissionColumns();
  }

  private async loadWorkflowData(): Promise<void> {
    console.log('🔄 開始載入工作流程資料...');

    const cruData = this.flowService.getCruData();
    console.log('📋 CRU 資料:', cruData);

    // 設定 apply_no
    this.currentApplyNo = cruData?.apply_no || null;
    console.log('🔖 當前申請編號:', this.currentApplyNo);

    // 準備合約資訊顯示
    if (cruData) {
      this.prepareContractInfoDisplay(cruData);
    }

    //  關鍵:載入抽成資料
    try {
      await this.dataFlowService.loadData(
        this.currentApplyNo,
        this.discountOptions,
        cruData?.tlt_contract_bdate || cruData?.tlt_bdate,
        cruData?.tlt_contract_edate || cruData?.tlt_edate
      );

      console.log(' 工作流程資料載入完成');

    } catch (error) {
      console.error('❌ 載入抽成資料失敗:', error);
      this.notificationService.errorBubble('載入抽成資料失敗');
    }
  }


  /**
 * 更新折扣欄位選項
 */
  private updateDiscountColumnOptions(): void {
    console.log('更新折扣選項:', this.discountOptions);

    this.discountColumns = TLS12040Next2ColumnsConfig.getDiscountColumns(this.discountOptions);
    this.levelColumns = TLS12040Next2ColumnsConfig.getLevelColumns(this.discountOptions);

    console.log('折扣欄位更新完成:', {
      discountColumnsCount: this.discountColumns.length,
      levelColumnsCount: this.levelColumns.length
    });
  }


  private prepareContractInfoDisplay(cruData: TLS12040DetailModel): void {
    console.log('準備合約資訊顯示');

    this.contractInfoData = [{
      id: this.currentApplyNo,
      apply_no: cruData.apply_no,
      tlt_name: cruData.tlt_name || '',
      ven_uniform: cruData.ven_uniform || '',
      VEN_Name: cruData.VEN_Name || '',
      tlt_term_type: cruData.tlt_term_type?.toString() || '3',
      tlt_no: cruData.tlt_no || '',
      contract_subno: cruData.contract_subno || '',
      tlt_bdate: cruData.tlt_bdate || '',
      tlt_edate: cruData.tlt_edate || '',
      tlt_contract_bdate: cruData.tlt_contract_bdate || '',
      tlt_contract_edate: cruData.tlt_contract_edate || '',
    }];

    console.log('合約資訊:', this.contractInfoData);
  }
  /**
   * 取得當前標籤頁對應的資料
   * 這個方法會被 expandable-edit-table 呼叫
   */
  getCurrentItems(rowData: ChargeSettingBusinessModel): any[] {
    console.log('getCurrentItems 被呼叫，標籤:', this.selectedSettingTab, '資料:', rowData);

    switch (this.selectedSettingTab) {
      case 'discount':
        return rowData.ChargeDetails?.filter(item => item._status !== 'deleted') || [];
      case 'annual':
        return rowData.YearChargeDetails?.filter(item => item._status !== 'deleted') || [];
      case 'level':
        return rowData.LevelChargeDetails?.filter(item => item._status !== 'deleted') || [];
      default:
        return rowData.ChargeDetails?.filter(item => item._status !== 'deleted') || [];
    }
  }


  /**
    * 標籤切換處理
    */
  changeSettingTab(tab: string): void {
    console.log('切換標籤,從', this.selectedSettingTab, '到', tab);

    if (this.selectedSettingTab === tab) {
      return;
    }

    //  關鍵:先強制同步當前標籤的數據
    this.forceSyncCurrentTabData();

    // 切換標籤
    this.selectedSettingTab = tab;

    // 更新所有項目的顯示
    this.commissionData.forEach(item => {
      this.updateItemDisplayData(item);
    });

    // 觸發變更檢測
    this.cdr.detectChanges();

    // 標籤切換後儲存
    setTimeout(() => {
      this.saveToWorkflow();
    }, 100);
  }

  private forceSyncCurrentTabData(): void {
    const currentTab = this.selectedSettingTab;

    console.log('🔄 強制同步當前標籤數據:', currentTab);

    this.commissionData.forEach(commissionItem => {
      if (!commissionItem.detailItems || commissionItem.detailItems.length === 0) {
        return;
      }

      // 過濾出屬於當前標籤的項目
      const currentTabItems = commissionItem.detailItems.filter(item =>
        !item._originalType || item._originalType === currentTab
      );

      // 根據標籤類型同步到對應數組
      switch (currentTab) {
        case 'discount':
          commissionItem.ChargeDetails = currentTabItems.map(item => ({
            id: item.id,
            apply_no: item.apply_no || commissionItem.apply_no,
            tlt_id: item.tlt_id || commissionItem.tlt_id,
            cag_barcode: item.cag_barcode || '',
            tlt_bdate: this.ensureValidDate(item.tlt_bdate),
            tlt_edate: this.ensureValidDate(item.tlt_edate),
            cag_charge_rate: item.cag_charge_rate || 0,
            barcode_desc: item.barcode_desc || '',
            is_configured: item.is_configured || false,
            is_enabled: item.is_enabled || false,
            _status: item._status || (this.hasValidId(item) ? 'original' : 'new'),
            is_selected: item.is_selected || false
          }));
          break;

        case 'annual':
          commissionItem.YearChargeDetails = currentTabItems.map(item => ({
            id: item.id,
            apply_no: item.apply_no || commissionItem.apply_no,
            tlt_id: item.tlt_id || commissionItem.tlt_id,
            tlt_bdate: this.formatDateString(item.tlt_bdate),
            tlt_edate: this.formatDateString(item.tlt_edate),
            year_amount: item.year_amount || 0,
            extra_rate: item.extra_rate || 0,
            _status: item._status || (this.hasValidId(item) ? 'original' : 'new'),
            is_selected: item.is_selected || false
          }));
          break;

        case 'level':
          commissionItem.LevelChargeDetails = currentTabItems.map(item => ({
            id: item.id,
            apply_no: item.apply_no || commissionItem.apply_no,
            tlt_id: item.tlt_id || commissionItem.tlt_id,
            seq_no: item.seq_no || 1,
            cag_barcode: item.cag_barcode || '',
            level_bmount: item.level_bmount || 0,
            level_eamount: item.level_eamount || 0,
            level_charge_rate: item.level_charge_rate || 0,
            barcode_desc: item.barcode_desc || '',
            is_configured: item.is_configured || false,
            is_enabled: item.is_enabled || false,
            _status: item._status || (this.hasValidId(item) ? 'original' : 'new'),
            is_selected: item.is_selected || false
          }));
          break;
      }
    });

    console.log(' 當前標籤數據同步完成');
  }

  /**
 * 更新單個項目的顯示資料
 */
  private updateItemDisplayData(commissionItem: ChargeSettingBusinessModel): void {
    const currentTab = this.selectedSettingTab;

    // 根據當前標籤設定對應的資料到 detailItems(如果表格有使用這個屬性)
    switch (currentTab) {
      case 'discount':
        // 確保有預設的8個折扣選項
        if (!commissionItem.ChargeDetails || commissionItem.ChargeDetails.length === 0) {
          commissionItem.ChargeDetails = this.createDefaultDiscountItems(commissionItem);
        }
        break;

      case 'level':
        // 確保有預設的8個層級選項
        if (!commissionItem.LevelChargeDetails || commissionItem.LevelChargeDetails.length === 0) {
          commissionItem.LevelChargeDetails = this.createDefaultLevelItems(commissionItem);
        }
        break;

      case 'annual':
        // annual 不需要預設項目,直接使用 API 回來的資料
        if (!commissionItem.YearChargeDetails) {
          commissionItem.YearChargeDetails = [];
        }
        break;
    }
  }

  /**
 * 建立預設的 discount 項目（8個折扣選項）
 */
  private createDefaultDiscountItems(parentItem: ChargeSettingBusinessModel): any[] {
    if (!this.discountOptions || this.discountOptions.length === 0) {
      console.warn('⚠️ 沒有折扣選項,無法建立預設項目');
      return [];
    }

    console.log(' 建立預設折扣項目');
    const contractStartDate = this.getContractDate('start');
    const contractEndDate = this.getContractDate('end');

    return this.discountOptions.map((option, index) => {
      //  更寬鬆的預選邏輯 - 只要是 000 或包含正品就預選
      const shouldSelectByDefault = (option.value === '000' || option.label?.includes('正品'));

      const item = {
        id: this.generateTempId(),
        apply_no: parentItem.apply_no,
        tlt_id: parentItem.tlt_id,
        cag_barcode: option.value,
        tlt_bdate: contractStartDate,
        tlt_edate: contractEndDate,
        cag_charge_rate: 0,
        barcode_desc: option.label || '',
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault,
        _status: 'new',
        is_selected: shouldSelectByDefault, // 關鍵:確保勾選狀態正確
        _originalType: 'discount'
      };

      console.log(`建立項目: ${option.value} (${option.label}) - ${shouldSelectByDefault ? '預選' : '不預選'}`);
      return item;
    });
  }


  /**
   * 建立預設的 level 項目（8個折扣選項）
   */
  private createDefaultLevelItems(parentItem: ChargeSettingBusinessModel): any[] {
    if (!this.discountOptions || this.discountOptions.length === 0) {
      console.warn('⚠️ 沒有折扣選項,無法建立預設項目');
      return [];
    }

    console.log(' 建立預設層級項目');

    return this.discountOptions.map((option, index) => {
      //  更寬鬆的預選邏輯 - 只要是 000 或包含正品就預選
      const shouldSelectByDefault = (option.value === '000' || option.label?.includes('正品'));

      const item = {
        id: this.generateTempId(),
        apply_no: parentItem.apply_no,
        tlt_id: parentItem.tlt_id,
        seq_no: index + 1,
        cag_barcode: option.value,
        level_bmount: 0,
        level_eamount: 0,
        level_charge_rate: 0,
        barcode_desc: option.label || '',
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault,
        _status: 'new',
        is_selected: shouldSelectByDefault, // 關鍵:確保勾選狀態正確
        _originalType: 'level'
      };

      console.log(`建立層級項目: ${option.value} (${option.label}) - ${shouldSelectByDefault ? '預選' : '不預選'}`);
      return item;
    });
  }


  /**
   * 取得當前標籤對應的欄位配置
   */
  getCurrentColumns(): any[] {
    switch (this.selectedSettingTab) {
      case 'discount':
        return this.discountColumns;
      case 'annual':
        return this.annualColumns;
      case 'level':
        return this.levelColumns;
      default:
        return this.discountColumns;
    }
  }

  /**
     * 檢查項目是否有有效 ID
     */
  private hasItemId(item: any): boolean {
    return item.id && item.id !== 'temp_' && !item.id.toString().startsWith('temp_');
  }

  /**
   * 使用折扣選項增強抽成資料
   */
  private enhanceCommissionDataWithDiscountOptions(): void {
    console.log('使用折扣選項增強抽成資料...');

    this.commissionData.forEach(commissionItem => {
      // 增強 discount 項目
      if (!commissionItem.ChargeDetails || commissionItem.ChargeDetails.length === 0) {
        commissionItem.ChargeDetails = this.createInitialDiscountItems();
      }

      // 增強 level 項目
      if (!commissionItem.LevelChargeDetails || commissionItem.LevelChargeDetails.length === 0) {
        commissionItem.LevelChargeDetails = this.createInitialLevelItems();
      }
    });

    console.log('抽成資料增強完成');
  }

  /**
   * 新增：建立初始折扣項目
   */
  private createInitialDiscountItems(): any[] {
    return this.discountOptions.map((option, index) => {
      const isFirstOption = index === 0;
      const shouldSelectByDefault = isFirstOption &&
        (option.value === '000' || option.label?.includes('正品'));

      return {
        id: this.generateTempId(),
        apply_no: 0,
        tlt_id: '',
        cag_barcode: option.value,
        tlt_bdate: null,
        tlt_edate: null,
        cag_charge_rate: 0,
        barcode_desc: option.label || '',
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault,
        _status: 'new',
        is_selected: shouldSelectByDefault
      };
    });
  }

  /**
   * 新增：建立初始層級項目
   */
  private createInitialLevelItems(): any[] {
    return this.discountOptions.map((option, index) => {
      const isFirstOption = index === 0;
      const shouldSelectByDefault = isFirstOption &&
        (option.value === '000' || option.label?.includes('正品'));

      return {
        id: this.generateTempId(),
        apply_no: 0,
        tlt_id: '',
        seq_no: index + 1,
        cag_barcode: option.value,
        level_bmount: 0,
        level_eamount: 0,
        level_charge_rate: 0,
        barcode_desc: option.label || '',
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault,
        _status: 'new',
        is_selected: shouldSelectByDefault
      };
    });
  }

  /**
   * 工具方法：產生臨時 ID
   */
  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }


  private setupAutoSave(): void {
    if (this.isReadOnlyMode) {
      console.log('唯讀模式，跳過自動儲存設定');
      return;
    }

    // 監聽 commissionData 變更
    const dataSubscription = this.dataFlowService.state$.pipe(
      debounceTime(500), // 500ms 防抖
      distinctUntilChanged((prev, curr) => {
        // 比較關鍵資料是否有變更
        const prevData = JSON.stringify(prev.currentEditData);
        const currData = JSON.stringify(curr.currentEditData);
        return prevData === currData;
      })
    ).subscribe((state) => {
      if (state.currentEditData.length > 0) {
        console.log('📊 資料狀態變更，觸發自動儲存');
        this.saveToWorkflow();
      }
    });
    this.subscriptions.push(dataSubscription);

    // 監聽標籤切換
    let lastTab = this.selectedSettingTab;
    const tabCheckInterval = setInterval(() => {
      if (this.selectedSettingTab !== lastTab) {
        console.log('🏷️ 標籤變更，觸發自動儲存');
        lastTab = this.selectedSettingTab;
        this.saveToWorkflow();
      }
    }, 1000);

    // 清理定時器
    this.subscriptions.push({
      unsubscribe: () => clearInterval(tabCheckInterval)
    } as any);
  }


  private saveToWorkflow(): void {
    if (this.isReadOnlyMode) {
      console.log('🔒 唯讀模式，跳過資料儲存');
      return;
    }

    // 新增：檢查資料是否已載入
    if (!this.dataLoaded || !this.commissionData || this.commissionData.length === 0) {
      console.log('資料尚未載入完成，跳過儲存:', {
        dataLoaded: this.dataLoaded,
        commissionDataLength: this.commissionData?.length || 0
      });
      return;
    }

    // // 新增：檢查申請編號
    // if (!this.currentApplyNo) {
    //   console.log('缺少申請編號，跳過儲存');
    //   return;
    // }


    // 準備要儲存的資料 - 使用與 Next2DataCleaner 相匹配的格式
    const dataToSave = {
      // 主要資料
      commissionData: JSON.parse(JSON.stringify(this.commissionData || [])),  // 🔥 深拷貝

      // UI 狀態
      selectedSettingTab: this.selectedSettingTab,
      currentCommissionType: this.currentCommissionType,
      currentApplyNo: this.currentApplyNo,

      // 合約資訊
      contractInfoData: this.contractInfoData || [],

      // 額外設定
      additionalSettings: {
        hasUnsavedChanges: this.hasUnsavedChanges,
        dataLoaded: this.dataLoaded,
        commissionDataLoaded: this.commissionDataLoaded
      }
    };

    // console.log('💾 準備儲存 Next2 資料:', {
    //   commissionDataLength: dataToSave.commissionData.length,
    //   selectedTab: dataToSave.selectedSettingTab,
    //   applyNo: dataToSave.currentApplyNo,
    //   hasContractInfo: dataToSave.contractInfoData.length > 0
    // });

    // 呼叫 flowService 儲存資料
    const success = this.flowService.setNext2Data(dataToSave);

    if (success) {
      console.log(' Next2 資料儲存成功');
      this.hasUnsavedChanges = false;

      // 立即驗證儲存結果
      const savedData = this.flowService.getNext2Data();
      console.log('🔍 驗證儲存結果:', savedData);
    } else {
      console.error('❌ Next2 資料儲存失敗');
    }
  }

  // 原有的事件處理方法保持不變
  onDetailTabChange(event: { rowData: any, tabId: string }): void {
    console.log('內層標籤切換事件:', event);

    // 直接呼叫 changeSettingTab 來統一處理
    this.changeSettingTab(event.tabId);
  }

  onItemEdit(item: any): void { }

  onItemSave(event: { oldData: any, newData: any }): void { }

  onItemCancel(item: any): void { }

  onDetailEdit(event: any): void { }

  onDetailSave(event: { oldDetail: any, newDetail: any, parentData: any }): void { }

  onBeforeDetailSave(event: { data: any, preventDefault: () => void }): void { }

  onDetailCancel(item: ChargeSettingBusinessModel): void { }

  onBatchDelete(selectedItems: any[]): void {
    if (this.isReadOnlyMode) {
      this.notificationService.infoBubble('檢視模式下無法刪除項目');
      return;
    }

    // if (!confirm(`確定要刪除選取的 ${selectedItems.length} 個項目嗎？`)) {
    //   return;
    // }

    selectedItems.forEach(item => {
      if (this.hasValidId(item)) {
        // 現有項目標記為 deleted
        item._status = 'deleted';
        this.dataFlowService.updateField(item.id, 'master', '_status', 'deleted');
      } else {
        // 新項目直接從數組移除
        const index = this.commissionData.findIndex(commission => commission.id === item.id);
        if (index > -1) {
          this.commissionData.splice(index, 1);
        }
      }
    });

    this.saveToWorkflow();
    this.notificationService.infoBubble(`已刪除 ${selectedItems.length} 個項目`);
  }

  onDetailBatchDelete(event: { selectedDetails: any[], parentData: any }): void {
    if (this.isReadOnlyMode) {
      this.notificationService.infoBubble('檢視模式下無法刪除項目');
      return;
    }

    const { selectedDetails, parentData } = event;

    // if (!confirm(`確定要刪除選取的 ${selectedDetails.length} 個明細項目嗎？`)) {
    //   return;
    // }

    // 處理刪除邏輯
    selectedDetails.forEach(detail => {
      const originalType = detail._originalType || this.selectedSettingTab;

      if (detail._status === 'new' || !this.hasValidId(detail)) {
        // 新項目直接從數組移除
        this.removeDetailFromArrays(detail, parentData);
      } else {
        // 現有項目標記為 deleted
        detail._status = 'deleted';
        this.syncDetailToParentArray(detail, parentData);

        // 通知資料流服務
        this.dataFlowService.updateField(
          detail.id,
          this.getDetailItemType(detail),
          '_status',
          'deleted',
          parentData.id
        );
      }
    });

    // 重新刷新顯示
    this.refreshItemDetailDisplay(parentData);

    // 關鍵：強制觸發變更檢測，確保 UI 更新
    this.cdr.detectChanges();

    this.updateMainArray(parentData);
    this.saveToWorkflow();

    this.notificationService.infoBubble(`已刪除 ${selectedDetails.length} 個明細項目`);
  }


  onAddCommissionItem(): void {
    if (this.isReadOnlyMode) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }

    const cruData = this.flowService.getCruData();

    // 修正：新增模式下 apply_no 可以是空的，後端會生成
    const applyNo = cruData?.apply_no || '';  // 允許空字串
    const defaultCapSaletype1 = cruData?.cap_saletype1 || 'N';
    const defaultCapSaletype2 = cruData?.cap_saletype2 || 'N';
    const defaultCapSaletype5 = cruData?.cap_saletype5 || 'N';

    const newItem: ChargeSettingBusinessModel = {
      id: this.generateTempId(),
      apply_no: applyNo,  // 可以是空字串
      tlt_id: this.generateNewTltId(),
      tlt_id_desc: '新抽成類別',
      cag_bdate: this.getContractDate('start'),
      cag_edate: this.getContractDate('end'),
      cag_taxtype: '1',
      sst_amount: null,
      sst_rate: null,
      // 使用從 CRU 資料讀取的預設值
      cap_saletype1: defaultCapSaletype1,
      cap_saletype2: defaultCapSaletype2,
      cap_saletype5: defaultCapSaletype5,
      cag_remark: '',
      _status: 'new',
      ChargeDetails: this.createDefaultDiscountItems({
        apply_no: applyNo,
        tlt_id: this.generateNewTltId()
      } as ChargeSettingBusinessModel),
      YearChargeDetails: [],
      LevelChargeDetails: this.createDefaultLevelItems({
        apply_no: applyNo,
        tlt_id: this.generateNewTltId()
      } as ChargeSettingBusinessModel)
    };

    this.commissionData = [...this.commissionData, newItem];
    this.saveToWorkflow();
    // this.notificationService.infoBubble('新增完成');
  }

  private generateNewTltId(): string {
    // 取得所有現有的 tlt_id，轉換為數字
    const existingIds = this.commissionData
      .filter(item => item._status !== 'deleted')
      .map(item => parseInt(item.tlt_id))
      .filter(id => !isNaN(id)) // 過濾掉無效的數字
      .sort((a, b) => a - b); // 排序

    console.log('現有的 tlt_id:', existingIds);

    // 從 0 開始找第一個可用的數字
    for (let i = 0; i <= 9; i++) {
      if (!existingIds.includes(i)) {
        console.log(`分配新的 tlt_id: ${i}`);
        return i.toString();
      }
    }
    this.notificationService.errorBubble('已達到最大抽成項目數量限制（10個）');
    // 如果 0-9 都被使用了，拋出錯誤
    throw new Error('已達到最大抽成項目數量限制（10個）');
  }

  onAddDetailItem(parentData: ChargeSettingBusinessModel): void {
    if (this.isReadOnlyMode) {
      this.notificationService.infoBubble('檢視模式下無法新增明細項目');
      return;
    }

    const newItem = this.createNewDetailItem(parentData);

    switch (this.selectedSettingTab) {
      case 'discount':
        if (!parentData.ChargeDetails) parentData.ChargeDetails = [];
        parentData.ChargeDetails.push(newItem);
        break;
      case 'annual':
        if (!parentData.YearChargeDetails) parentData.YearChargeDetails = [];
        parentData.YearChargeDetails.push(newItem);
        break;
      case 'level':
        if (!parentData.LevelChargeDetails) parentData.LevelChargeDetails = [];
        parentData.LevelChargeDetails.push(newItem);
        break;
    }

    // 標記主檔為已修改
    if (parentData._status === 'original') {
      parentData._status = 'modified';
    }

    this.saveToWorkflow();
  }


  onDropdownChange(event: { rowData: any, field: string, newValue: any, oldValue: any }): void { }

  onDetailButtonClick(event: {
    detailData: any;
    field: string;
    parentData: any;
  }): void {
    // 判斷是否為複製按鈕
    if (event.field === 'copy_button') {
      this.copyDetailItem(event.detailData, event.parentData);
    }
  }

  ngOnDestroy(): void {
    // 最後一次儲存
    if (!this.isReadOnlyMode && this.commissionData.length > 0) {
      console.log('🔚 組件銷毀前最後儲存');
      this.saveToWorkflow();
    }

    this.subscriptions.forEach(sub => sub.unsubscribe());

    if (this.viewModeSubscription) {
      this.viewModeSubscription.unsubscribe();
    }
  }

  onSubmitNext(): void {
    if (this.isReadOnlyMode) {
      this.navigateToNext();
      return;
    }

    // 執行進階驗證
    const validationResult = this.validateAllData();
    if (!validationResult.isValid) {
      this.notificationService.errorBubble(validationResult.errors[0] || '資料驗證失敗');
      return;
    }

    if (this.isGeneralCommissionMode) {
      // 一般抽成模式：顯示確認對話框
      console.log('顯示確認對話框');
      this.showConfirmDialog = true;
    } else {
      // 其他抽成模式：直接導航到下一步
      this.navigateToNext();
    }
  }

  private validateAllData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 驗證主檔
    this.commissionData.forEach((item, index) => {
      if (item._status === 'deleted') return;

      if (!item.tlt_id || !item.tlt_id_desc) {
        errors.push(`第 ${index + 1} 個抽成項目缺少必要資訊`);
      }

      if (!item.cag_bdate || !item.cag_edate) {
        errors.push(`第 ${index + 1} 個抽成項目缺少日期設定`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private navigateToNext(): void {
    if (this.isGeneralCommissionMode) {
      this.router.navigate(['account/tls/tls12040']);
    } else {
      const navigationExtras: NavigationExtras = {
        state: {
          crudstatus: this.crudstatus,
          fromRoute: this.router.url
        }
      };
      // 重要：要使用 navigationExtras
      this.router.navigate(['account/tls/tls12040next3'], navigationExtras);
    }
  }

  onClearAndExit(): void {
    console.log('清空並離開');
    this.flowService.clearAll();
    this.router.navigate(['account/tls/tls12040']);
    this.messageService.infoBubble('已清空暫存資料並離開');
  }

  onConfirmDialogResult(confirmed: boolean): void {
    this.showConfirmDialog = false;

    if (confirmed) {
      this.performSubmit();
    }
    // 如果取消，就什麼都不做
  }

  private async performSubmit(): Promise<void> {
    this.loading = true;
    this.notificationService.blockUi();

    try {
      const submitData = this.flowService.generateTLS12040SubmitData();
      const response = await lastValueFrom(this.tls12040Service.submitFinalTLS12040(submitData));

      this.notificationService.successBubble('契約資料提交成功！');
      this.flowService.onSubmitSuccess();

      setTimeout(() => {
        this.router.navigate(['account/tls/tls12040']);
      }, 2000);

    } catch (error) {
      this.notificationService.errorBubble('契約資料提交失敗');
    } finally {
      this.loading = false;
      this.notificationService.unblockUi();
    }
  }

  override onCancel(): void {
    const navigationExtras: NavigationExtras = {
      state: {
        crudstatus: this.crudstatus,
        fromRoute: this.router.url
      }
    };

    this.router.navigate(['account/tls/tls12040next1'], navigationExtras);
  }

  /**
  * 建立新的明細項目
  */
  private createNewDetailItem(parentData: ChargeSettingBusinessModel): any {
    const tempId = this.generateTempId();

    switch (this.selectedSettingTab) {
      case 'discount':
        return {
          id: null,
          apply_no: parentData.apply_no,
          tlt_id: parentData.tlt_id,
          cag_barcode: '',
          tlt_bdate: null,
          tlt_edate: null,
          cag_charge_rate: 0,
          barcode_desc: '',
          is_configured: false,
          is_enabled: false,
          _status: 'new',
          is_selected: false
        };
      case 'annual':
        // 關鍵修正：實現智能日期接續邏輯
        const dateRange = this.calculateAnnualDateRange(parentData);
        return {
          id: tempId,
          apply_no: parentData.apply_no,
          tlt_id: parentData.tlt_id,
          tlt_bdate: dateRange.startDate,
          tlt_edate: dateRange.endDate,
          year_amount: 0,
          extra_rate: 0,
          _status: 'new',
          is_selected: false
        };
      case 'level':
        return {
          id: null,
          apply_no: parentData.apply_no,
          tlt_id: parentData.tlt_id,
          seq_no: (parentData.LevelChargeDetails?.length || 0) + 1,
          cag_barcode: '',
          level_bmount: 0,
          level_eamount: 0,
          level_charge_rate: 0,
          barcode_desc: '',
          is_configured: false,
          is_enabled: false,
          _status: 'new',
          is_selected: false
        };
      default:
        return {};
    }
  }

  /**
   * 計算 Annual 項目的智能日期範圍
   */
  private calculateAnnualDateRange(parentData: ChargeSettingBusinessModel): { startDate: string; endDate: string } {
    const contractStartDate = this.getContractDate('start'); // 2025-07-29
    const contractEndDate = this.getContractDate('end');     // 2027-07-28

    // 取得現有的年度業績項目，按結束日期排序
    const existingAnnualItems = (parentData.YearChargeDetails || [])
      .filter(item => item._status !== 'deleted')
      .sort((a, b) => new Date(a.tlt_edate).getTime() - new Date(b.tlt_edate).getTime());

    console.log('現有年度業績項目:', existingAnnualItems);
    console.log('契約起訖日期:', { contractStartDate, contractEndDate });

    if (existingAnnualItems.length === 0) {
      // 第一筆：使用契約起訖日期
      console.log('第一筆年度業績，使用契約起訖日期');
      return {
        startDate: contractStartDate,
        endDate: contractEndDate
      };
    }

    // 找到最後一筆項目的結束日期
    const lastItem = existingAnnualItems[existingAnnualItems.length - 1];
    const lastEndDate = new Date(lastItem.tlt_edate);

    console.log('最後一筆項目結束日期:', lastItem.tlt_edate);

    // 新項目的開始日期 = 最後一筆的結束日期 + 1天
    const newStartDate = new Date(lastEndDate);
    newStartDate.setDate(newStartDate.getDate() + 1);

    // 新項目的結束日期 = 契約結束日期
    const newEndDate = new Date(contractEndDate);

    // 檢查日期是否合理（新開始日期不能超過契約結束日期）
    if (newStartDate > newEndDate) {
      console.warn('日期範圍已超過契約期限，使用契約結束日期');
      return {
        startDate: this.formatLocalDateString(newEndDate),
        endDate: this.formatLocalDateString(newEndDate)
      };
    }

    const result = {
      startDate: this.formatLocalDateString(newStartDate),
      endDate: this.formatLocalDateString(newEndDate)
    };

    console.log('計算出的新日期範圍:', result);
    return result;
  }

  getDetailKey(): string {
    return 'detailItems';  // 固定使用這個屬性名稱
  }

  onFieldChange(event: { fieldName: string, newValue: any, rowData: any }): void {
    const { fieldName, newValue, rowData } = event;
    console.log('🚨🚨🚨 onFieldChange 被觸發！', { fieldName, newValue, itemId: rowData?.id });
    // 判斷是主檔還是明細
    const isDetail = this.isDetailItem(rowData);

    if (isDetail) {
      this.handleDetailFieldChange(event);
    } else {
      // 🔥 修復：直接在 commissionData 陣列中找到並更新原始項目
      const index = this.commissionData.findIndex(item => item.id === rowData.id);
      if (index === -1) {
        console.error(`找不到 commission item: ${rowData.id}`);
        return;
      }

      //  處理 master 項目的欄位變更
      if (fieldName === 'cap_saletype1' || fieldName === 'cap_saletype2' || fieldName === 'cap_saletype5') {
        const ynValue = newValue ? 'Y' : 'N';
        (this.commissionData[index] as any)[fieldName] = ynValue;
      } else {
        (this.commissionData[index] as any)[fieldName] = newValue;
      }

      // 標記狀態為已修改（除非是新項目）
      if (this.commissionData[index]._status !== 'new') {
        this.commissionData[index]._status = 'modified';
      }
      // 強制觸發變更檢測
      this.cdr.detectChanges();
    }

    console.log('💾 準備儲存:', {
      fieldName,
      newValue,
      updatedValue: (this.commissionData.find(x => x.id === rowData.id) as any)?.[fieldName]
    });

    setTimeout(() => this.saveToWorkflow(), 200);
  }


  /**
 * 處理明細資料的欄位變更
 */
  private handleDetailFieldChange(event: { fieldName: string, newValue: any, rowData: any }): void {
    const { fieldName, newValue, rowData } = event;

    console.log('📄 處理明細欄位變更:', {
      fieldName,
      newValue,
      itemId: rowData.id,
      currentStatus: rowData._status
    });

    // 更新明細項目的欄位值
    rowData[fieldName] = newValue;

    // 特殊處理：selected 欄位的狀態變更
    if (fieldName === 'is_selected' || fieldName === 'selected') {
      this.handleSelectedFieldChange(rowData, newValue);
    } else {
      // 其他欄位變更的狀態處理
      this.updateItemStatus(rowData);
    }

    // 找到父項目並同步數據
    const parentItem = this.findParentOfDetailItem(rowData);
    if (parentItem) {
      this.syncDetailToParentArray(rowData, parentItem);
      this.updateItemStatus(parentItem);
      this.updateMainArray(parentItem);
    }

    this.saveToWorkflow();
  }

  private handleSelectedFieldChange(rowData: any, newValue: boolean): void {
    const originalType = rowData._originalType || this.selectedSettingTab;

    console.log('處理 selected 變更:', {
      itemId: rowData.id,
      originalType,
      newValue,
      currentStatus: rowData._status,
      hasValidId: this.hasValidId(rowData),
      currentCagBarcode: rowData.cag_barcode  //  新增：記錄當前的 cag_barcode
    });

    //  修正：在處理選擇狀態變更時，確保不會意外修改 cag_barcode
    const originalCagBarcode = rowData.cag_barcode;

    if (newValue === false) {
      // 取消勾選的處理邏輯
      if (originalType === 'annual') {
        rowData._status = 'deleted';
        console.log('年度業績項目設為 deleted');
      } else if (originalType === 'discount' || originalType === 'level') {
        if (this.hasValidId(rowData)) {
          rowData._status = 'deleted';
          console.log(`${originalType} 現有項目設為 deleted (ID: ${rowData.id})`);
        } else {
          console.log(`${originalType} 新項目將被移除 (臨時ID: ${rowData.id})`);
          rowData._status = 'deleted';
        }
      } else {
        rowData._status = 'deleted';
        console.log('其他項目設為 deleted');
      }
    } else if (newValue === true) {
      // 重新勾選的處理邏輯
      if (rowData._status === 'deleted') {
        rowData._status = this.hasValidId(rowData) ? 'original' : 'new';
        console.log(`項目從 deleted 恢復為 ${rowData._status}`);
      } else {
        this.updateItemStatus(rowData);
        console.log('一般勾選變更處理');
      }
    }

    //  重要：確保 cag_barcode 值不會被意外修改
    if (rowData.cag_barcode !== originalCagBarcode) {
      console.warn('⚠️ 發現 cag_barcode 被意外修改，正在還原:', {
        original: originalCagBarcode,
        modified: rowData.cag_barcode
      });
      rowData.cag_barcode = originalCagBarcode;
    }

    console.log('selected 處理完成，最終狀態:', {
      status: rowData._status,
      cag_barcode: rowData.cag_barcode,
      selected: rowData.is_selected
    });
  }

  /**
 * 找到明細項目的父項目
 */
  private findParentOfDetailItem(detailData: any): ChargeSettingBusinessModel | null {
    for (const commissionItem of this.commissionData) {
      // 檢查 ChargeDetails
      if (commissionItem.ChargeDetails?.some(item => item.id === detailData.id)) {
        return commissionItem;
      }

      // 檢查 YearChargeDetails
      if (commissionItem.YearChargeDetails?.some(item => item.id === detailData.id)) {
        return commissionItem;
      }

      // 檢查 LevelChargeDetails
      if (commissionItem.LevelChargeDetails?.some(item => item.id === detailData.id)) {
        return commissionItem;
      }

      // 檢查 detailItems
      if (commissionItem.detailItems?.some(item => item.id === detailData.id)) {
        return commissionItem;
      }
    }
    return null;
  }


  private isDetailItem(rowData: any): boolean {
    return !this.commissionData.some(item => item.id === rowData.id);
  }


  private getDetailItemType(rowData: any): 'chargeDetail' | 'yearChargeDetail' | 'levelChargeDetail' {
    // 根據當前標籤或資料特徵判斷類型
    switch (this.selectedSettingTab) {
      case 'discount': return 'chargeDetail';
      case 'annual': return 'yearChargeDetail';
      case 'level': return 'levelChargeDetail';
      default: return 'chargeDetail';
    }
  }

  /**
 *  修正:確保 processedCommissionData 正確處理所有狀態
 */
  get processedCommissionData(): ChargeSettingBusinessModel[] {
    return this.visibleCommissionData.map(item => {
      // 建立新物件,包含動態的 detailItems
      const processedItem = { ...item };
      (processedItem as any).cap_saletype1 = item.cap_saletype1 === 'Y';
      (processedItem as any).cap_saletype2 = item.cap_saletype2 === 'Y';
      (processedItem as any).cap_saletype5 = item.cap_saletype5 === 'Y';
      // 根據當前選中的標籤,設定對應的資料到統一的屬性名稱
      switch (this.selectedSettingTab) {
        case 'discount':
          //  確保有 8 個折扣選項
          if (!processedItem.ChargeDetails || processedItem.ChargeDetails.length === 0) {
            processedItem.ChargeDetails = this.createDefaultDiscountItems(processedItem);
          }

          //  過濾掉已刪除的項目
          processedItem.detailItems = processedItem.ChargeDetails
            .filter(detail => detail._status !== 'deleted')
            .map(detail => ({
              ...detail,
              _originalType: 'discount'
            }));
          break;

        case 'level':
          //  確保有 8 個層級選項
          if (!processedItem.LevelChargeDetails || processedItem.LevelChargeDetails.length === 0) {
            processedItem.LevelChargeDetails = this.createDefaultLevelItems(processedItem);
          }

          //  過濾掉已刪除的項目
          processedItem.detailItems = processedItem.LevelChargeDetails
            .filter(detail => detail._status !== 'deleted')
            .map(detail => ({
              ...detail,
              _originalType: 'level'
            }));
          break;

        case 'annual':
          if (!processedItem.YearChargeDetails) {
            processedItem.YearChargeDetails = [];
          }

          //  關鍵:annual 要過濾掉 deleted 的項目
          processedItem.detailItems = processedItem.YearChargeDetails
            .filter(detail => detail._status !== 'deleted')
            .map(detail => ({
              ...detail,
              _originalType: 'annual'
            }));
          break;

        default:
          processedItem.detailItems = [];
      }

      return processedItem;
    });
  }

  private hasValidId(item: any): boolean {
    const result = item.id &&
      !String(item.id).startsWith('temp_') &&
      !isNaN(Number(item.id)) &&
      Number(item.id) > 0;

    console.log('hasValidId 檢查:', {
      id: item.id,
      result: result,
      詳細檢查: {
        有id: !!item.id,
        不是temp開頭: !String(item.id).startsWith('temp_'),
        是數字: !isNaN(Number(item.id)),
        大於0: Number(item.id) > 0
      }
    });

    return result;
  }

  /**
  * 從所有相關數組中移除明細項目
  */
  private removeDetailFromArrays(detail: any, parentData: ChargeSettingBusinessModel): void {
    const detailId = detail.id;

    // 從 detailItems 移除
    if (parentData.detailItems) {
      const detailIndex = parentData.detailItems.findIndex((item: any) => item.id === detailId);
      if (detailIndex > -1) {
        parentData.detailItems.splice(detailIndex, 1);
      }
    }

    // 修正：使用 selectedSettingTab 而不是 currentTab，使用正確的 TLS12040 屬性名稱
    const currentTab = this.selectedSettingTab; // 使用組件的 selectedSettingTab
    switch (currentTab) {
      case 'discount':
        {
          // 修正：使用 ChargeDetails 而不是 discountSettingItems
          if (parentData.ChargeDetails) {
            const discountIndex = parentData.ChargeDetails.findIndex((item: any) => item.id === detailId);
            if (discountIndex > -1) {
              parentData.ChargeDetails.splice(discountIndex, 1);
            }
          }
          break;
        }
      case 'annual':
        {
          // 修正：使用 YearChargeDetails 而不是 annualPerformanceItems
          if (parentData.YearChargeDetails) {
            const annualIndex = parentData.YearChargeDetails.findIndex((item: any) => item.id === detailId);
            if (annualIndex > -1) {
              parentData.YearChargeDetails.splice(annualIndex, 1);
            }
          }
          break;
        }
      case 'level':
        {
          // 修正：使用 LevelChargeDetails 而不是 discountLevelItems
          if (parentData.LevelChargeDetails) {
            const levelIndex = parentData.LevelChargeDetails.findIndex((item: any) => item.id === detailId);
            if (levelIndex > -1) {
              parentData.LevelChargeDetails.splice(levelIndex, 1);
            }
          }
          break;
        }
    }
  }

  /**
     * 同步明細到父項目數組
     */
  private syncDetailToParentArray(detailData: any, parentItem: ChargeSettingBusinessModel): void {
    const currentTab = this.selectedSettingTab;
    const detailId = detailData.id;
    const originalType = detailData._originalType;

    console.log('🔗 同步明細到父項目:', {
      detailId,
      originalType,
      currentTab,
      status: detailData._status,
      selected: detailData.is_selected
    });

    // 根據 originalType 而不是 currentTab 來決定更新哪個數組
    switch (originalType) {
      case 'discount':
        this.updateItemInArray(parentItem.ChargeDetails, detailId, detailData);
        break;
      case 'annual':
        this.updateItemInArray(parentItem.YearChargeDetails, detailId, detailData);
        break;
      case 'level':
        this.updateItemInArray(parentItem.LevelChargeDetails, detailId, detailData);
        break;
      default:
        // 如果沒有 originalType，回退到使用 currentTab
        switch (currentTab) {
          case 'discount':
            this.updateItemInArray(parentItem.ChargeDetails, detailId, detailData);
            break;
          case 'annual':
            this.updateItemInArray(parentItem.YearChargeDetails, detailId, detailData);
            break;
          case 'level':
            this.updateItemInArray(parentItem.LevelChargeDetails, detailId, detailData);
            break;
        }
    }

    // 同時更新 detailItems（用於顯示）
    if (parentItem.detailItems) {
      this.updateItemInArray(parentItem.detailItems, detailId, detailData);
    }
  }

  /**
* 更新數組中的項目
*/
  private updateItemInArray(array: any[], itemId: string, newData: any): void {
    if (!Array.isArray(array)) return;

    const index = array.findIndex(item => item.id === itemId);
    if (index > -1) {
      array[index] = { ...newData };
    }
  }

  onDetailFieldChange(event: any): void {
    // 直接委託給統一的 onFieldChange 處理
    this.onFieldChange({
      fieldName: event.fieldName,
      newValue: event.newValue,
      rowData: event.detailData
    });
  }

  private updateItemStatus(item: any): any {
    if (item._status === 'new') {
      return item;
    }

    if (item._status === 'original' || !item._status) {
      item._status = 'modified';
    }

    return item;
  }

  private refreshItemDetailDisplay(commissionItem: ChargeSettingBusinessModel): void {
    const currentTab = this.selectedSettingTab;
    let sourceArray: any[] = [];

    switch (currentTab) {
      case 'discount':
        sourceArray = commissionItem.ChargeDetails || [];
        break;
      case 'annual':
        sourceArray = commissionItem.YearChargeDetails || [];
        break;
      case 'level':
        sourceArray = commissionItem.LevelChargeDetails || [];
        break;
    }

    // 關鍵修正：annual 項目的 deleted 狀態要從顯示中完全移除
    commissionItem.detailItems = sourceArray
      .filter(item => {
        // annual 類型的 deleted 項目完全從顯示中移除
        if (currentTab === 'annual' && item._status === 'deleted') {
          console.log(`Annual 項目 ${item.id} 因為 deleted 狀態被過濾掉`);
          return false;
        }
        return true;
      })
      .map(item => ({
        ...item,
        _originalType: currentTab
      }));

    console.log(`刷新顯示完成，當前標籤: ${currentTab}, 顯示項目數: ${commissionItem.detailItems?.length || 0}`);
  }

  private updateMainArray(modifiedItem: any): void {
    const index = this.commissionData.findIndex(item => item.id === modifiedItem.id);
    if (index > -1) {
      this.commissionData[index] = { ...modifiedItem };
    }
  }

  private getContractDate(type: 'start' | 'end'): string {
    const cruData = this.flowService.getCruData();
    const fieldName = type === 'start' ? 'tlt_bdate' : 'tlt_edate';

    if (cruData?.[fieldName]) {
      return this.formatDateString(cruData[fieldName]);
    }

    // 修正預設日期計算
    const defaultDate = new Date();
    if (type === 'end') {
      // 使用更精確的日期計算，避免月份邊界問題
      defaultDate.setFullYear(defaultDate.getFullYear() + 1);
      defaultDate.setDate(defaultDate.getDate() - 1); // 確保是前一天
    }
    return this.formatLocalDateString(defaultDate);
  }

  private formatLocalDateString(date: Date): string {
    // 使用本地時間格式化，避免時區問題
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateString(dateInput: any): string {
    if (!dateInput) return this.formatLocalDateString(new Date());

    // 🔥 關鍵修復：如果已經是 YYYY-MM-DD 格式，直接返回
    if (typeof dateInput === 'string') {
      const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateOnlyRegex.test(dateInput)) {
        return dateInput; // ✅ 直接返回，不經過 Date 物件
      }

      if (dateInput.includes('T')) {
        return dateInput.split('T')[0];
      }
    }

    try {
      if (dateInput instanceof Date) {
        return this.formatLocalDateString(dateInput);
      }

      const date = new Date(dateInput);
      return this.formatLocalDateString(date);
    } catch {
      return this.formatLocalDateString(new Date());
    }
  }

  hasCommissionData(): boolean {
    return this.dataLoaded && this.commissionData.filter(item => item._status !== 'deleted').length > 0;
  }

  getCommissionItemCount(): number {
    return this.commissionData.filter(item => item._status !== 'deleted').length;
  }

  /**
 * 確保日期格式正確
 */
  private ensureValidDate(dateInput: any): Date {
    if (!dateInput) {
      return new Date();
    }

    if (dateInput instanceof Date) {
      return new Date(dateInput);
    }

    try {
      const date = new Date(dateInput);
      return isNaN(date.getTime()) ? new Date() : date;
    } catch {
      return new Date();
    }
  }

  /**
 * 複製詳細項目（插入到下一行）
 */
  copyDetailItem(sourceItem: any, parentData: ChargeSettingBusinessModel): void {
    if (this.isReadOnlyMode) {
      this.notificationService.infoBubble('檢視模式下無法複製項目');
      return;
    }

    console.log('開始複製項目:', sourceItem);

    // 取得當前標籤
    const currentTab = this.selectedSettingTab;

    // 只處理 discount 和 level
    if (currentTab !== 'discount' && currentTab !== 'level') {
      console.log('此標籤類型不支援複製功能');
      return;
    }

    // 建立複製的項目
    const copiedItem = this.createCopiedItem(sourceItem, currentTab, parentData);

    // 找出原項目的索引位置
    let targetArray: any[] = [];
    let sourceIndex = -1;

    switch (currentTab) {
      case 'discount':
        targetArray = parentData.ChargeDetails || [];
        sourceIndex = targetArray.findIndex(item => item.id === sourceItem.id);
        break;

      case 'level':
        targetArray = parentData.LevelChargeDetails || [];
        sourceIndex = targetArray.findIndex(item => item.id === sourceItem.id);
        break;
    }

    // 插入到原項目的下一個位置
    if (sourceIndex !== -1) {
      targetArray.splice(sourceIndex + 1, 0, copiedItem);
      console.log(`已在索引 ${sourceIndex + 1} 位置插入複製項目`);
    } else {
      // 如果找不到原項目位置，就加到最後
      targetArray.push(copiedItem);
      console.log('找不到原項目位置，將複製項目加到最後');
    }

    // 更新顯示
    this.refreshItemDetailDisplay(parentData);

    // 強制觸發變更檢測
    this.cdr.detectChanges();

    // 儲存到工作流程
    this.saveToWorkflow();

    // 顯示成功訊息
    this.notificationService.successBubble('項目複製成功');
  }

  /**
   * 建立複製的項目（只處理 discount 和 level）
   */
  private createCopiedItem(sourceItem: any, itemType: string, parentData: ChargeSettingBusinessModel): any {
    const tempId = this.generateTempId();

    // 基礎複製物件
    const copiedItem: any = {
      id: tempId,
      apply_no: parentData.apply_no,
      tlt_id: parentData.tlt_id,
      _status: 'new',
      is_selected: false,  // 複製的項目預設不勾選
      is_configured: false,
      is_enabled: false
    };

    // 根據類型處理特定欄位
    switch (itemType) {
      case 'discount':
        // 折扣設定複製
        copiedItem.cag_barcode = sourceItem.cag_barcode || '';
        copiedItem.cag_charge_rate = sourceItem.cag_charge_rate || 0;
        copiedItem.tlt_bdate = sourceItem.tlt_bdate ? new Date(sourceItem.tlt_bdate) : new Date();
        copiedItem.tlt_edate = sourceItem.tlt_edate ? new Date(sourceItem.tlt_edate) : new Date();
        copiedItem.barcode_desc = sourceItem.barcode_desc || '';
        break;

      case 'level':
        // 層級抽成複製
        copiedItem.cag_barcode = sourceItem.cag_barcode || '';
        copiedItem.level_bmount = sourceItem.level_bmount || 0;
        copiedItem.level_eamount = sourceItem.level_eamount || 0;
        copiedItem.level_charge_rate = sourceItem.level_charge_rate || 0;
        copiedItem.barcode_desc = sourceItem.barcode_desc || '';
        copiedItem.seq_no = (parentData.LevelChargeDetails?.length || 0) + 1;
        break;
    }

    console.log('複製完成的項目:', copiedItem);
    return copiedItem;
  }
}
