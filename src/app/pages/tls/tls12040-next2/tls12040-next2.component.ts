import { ChangeDetectorRef, Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { MenubarComponent } from "@shared/component/menubar/menubar.component";
import { ButtonComponent } from "@shared/componentkit/button/button.component";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { AccordionModule } from "primeng/accordion";
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
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

  // 新增：當前申請編號
  currentApplyNo = '';

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
    const step1Data = this.flowService.getCruData<TLS12040DetailModel>();
    if (step1Data?.tlt_term_type) {
      // console.log('從 flowService CRU 資料取得 tlt_term_type:', step1Data.tlt_term_type);
      return step1Data.tlt_term_type.toString();
    }

    // 2. 如果 CRU 資料沒有，才檢查 contractInfoData
    if (this.contractInfoData && this.contractInfoData.length > 0) {
      const termType = this.contractInfoData[0].tlt_term_type;
      console.log('從 contractInfoData 取得 tlt_term_type:', termType);
      return termType || '3';
    }

    // 3. 最後才使用預設值
    console.log('使用預設 tlt_term_type: 3');
    return '3';
  }

  async ngOnInit(): Promise<void> {
    this.initializePage('TLS12040', this.dataForm);
    console.log('當前 CRUD 狀態:', this.crudstatus);
    console.log('是否為唯讀模式:', this.isReadOnlyMode);
    console.log('路由狀態:', this.router.getCurrentNavigation()?.extras?.state);
    this.handleRouterState();
    try {
      // 1. 先檢查是否有暫存的 Next2 資料
      const savedNext2Data = this.flowService.getNext2Data();
      console.log('🔍 檢查暫存的 Next2 資料:', savedNext2Data);

      // 2. 先訂閱資料狀態變更
      this.dataFlowService.state$.subscribe(state => {
        this.commissionData = state.currentEditData;
        this.loading = state.uiState.loading;
        this.dataLoaded = state.uiState.dataLoaded;
        this.hasUnsavedChanges = state.uiState.hasUnsavedChanges;
        this.commissionDataLoaded = state.uiState.dataLoaded && state.currentEditData.length >= 0;
        this.cdr.detectChanges();
      });

      // 3. 初始化欄位配置
      this.initializeColumns();

      // 4. 載入折扣選項
      this.discountOptions = await this.dataFlowService.loadDiscountOptions();
      if (this.discountOptions.length === 0) {
        console.warn('沒有載入到折扣選項');
      }
      this.updateDiscountColumnOptions();

      // 5. 優先檢查暫存資料，如果有則使用暫存資料
      if (savedNext2Data && this.isValidSavedData(savedNext2Data)) {
        console.log('📦 發現有效的暫存 Next2 資料，優先使用暫存資料');
        await this.loadFromSavedData(savedNext2Data);
      } else {
        console.log(' 沒有暫存資料或資料無效，從工作流程載入');
        // 載入工作流程資料
        await this.loadWorkflowData();
      }

      // 6. 設定自動儲存 (僅編輯模式)
      if (!this.isReadOnlyMode) {
        this.setupAutoSave();
      }

    } catch (error) {
      console.error('初始化失敗:', error);
      this.notificationService.errorBubble('頁面初始化失敗');
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

  // 4. 新增檢查暫存資料有效性的方法
  private isValidSavedData(savedData: any): boolean {
    if (!savedData) return false;

    const hasCommissionData = savedData.commissionData && Array.isArray(savedData.commissionData);
    const hasApplyNo = savedData.currentApplyNo && savedData.currentApplyNo.trim() !== '';

    console.log('🔍 檢查暫存資料有效性:', {
      hasCommissionData,
      hasApplyNo,
      commissionDataLength: savedData.commissionData?.length || 0,
      applyNo: savedData.currentApplyNo
    });

    return hasCommissionData && hasApplyNo;
  }

  // 5. 新增從暫存資料載入的方法
  private async loadFromSavedData(savedData: any): Promise<void> {
    try {
      console.log('🔄 開始從暫存資料載入...');

      // 恢復基本狀態
      this.currentApplyNo = savedData.currentApplyNo || '';
      this.selectedSettingTab = savedData.selectedSettingTab || 'discount';
      this.contractInfoData = savedData.contractInfoData || [];

      console.log(' 恢復基本狀態:', {
        currentApplyNo: this.currentApplyNo,
        selectedSettingTab: this.selectedSettingTab,
        contractInfoDataLength: this.contractInfoData.length
      });

      // 恢復抽成資料 - 透過 dataFlowService 設定
      if (savedData.commissionData && Array.isArray(savedData.commissionData)) {
        console.log('📊 恢復抽成資料:', savedData.commissionData.length, '筆');

        // 直接更新 dataFlowService 的狀態
        this.dataFlowService['stateManager'].currentEditData = savedData.commissionData;
        this.dataFlowService['stateManager'].uiState.dataLoaded = true;
        this.dataFlowService['stateManager'].uiState.hasUnsavedChanges = false;

        // 通知狀態變更
        this.dataFlowService['notifyStateChange']();

        // 同步到組件
        this.commissionData = savedData.commissionData;
        this.dataLoaded = true;
        this.commissionDataLoaded = true;
      }

      // 恢復額外設定
      if (savedData.additionalSettings) {
        this.hasUnsavedChanges = savedData.additionalSettings.hasUnsavedChanges || false;
      }

      console.log('✅ 暫存資料載入完成');

      // 觸發變更檢測
      this.cdr.detectChanges();

    } catch (error) {
      console.error('❌ 從暫存資料載入失敗:', error);
      // 如果載入失敗，回退到正常流程
      await this.loadWorkflowData();
    }
  }


  private initializeColumns(): void {
    this.contractInfoColumns = TLS12040Next2ColumnsConfig.getContractInfoColumns();
    this.annualColumns = TLS12040Next2ColumnsConfig.getAnnualColumns();
    this.commissionColumns = TLS12040Next2ColumnsConfig.getCommissionColumns();
  }

  private async loadWorkflowData(): Promise<void> {
    console.log('開始載入工作流程資料...');

    const cruData = this.flowService.getCruData<TLS12040DetailModel>();
    console.log('CRU 資料:', cruData);

    // 直接設定 apply_no，不管是否為空
    this.currentApplyNo = cruData?.apply_no || '';
    console.log('當前申請編號:', this.currentApplyNo);
    if (cruData) {
      // 準備合約資訊顯示
      this.prepareContractInfoDisplay(cruData);
    }
    // 直接載入資料，API 會根據 apply_no 是否為空回傳對應資料
    try {
      await this.dataFlowService.loadData(
        this.currentApplyNo, // 空字串或實際編號都可以
        this.discountOptions,
        cruData?.tlt_contract_bdate || cruData?.tlt_bdate,
        cruData?.tlt_contract_edate || cruData?.tlt_edate
      );
    } catch (error) {
      console.error('載入抽成資料失敗:', error);
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
    console.log('切換標籤，從', this.selectedSettingTab, '到', tab);

    if (this.selectedSettingTab === tab) {
      return;
    }

    this.selectedSettingTab = tab;
    // this.clearProcessedDataCache();

    this.commissionData.forEach(item => {
      this.updateItemDisplayData(item);
    });

    this.cdr.detectChanges();

    // 標籤切換後儲存
    setTimeout(() => {
      this.saveToWorkflow();
    }, 100);
  }
  /**
 * 更新單個項目的顯示資料
 */
  private updateItemDisplayData(commissionItem: ChargeSettingBusinessModel): void {
    const currentTab = this.selectedSettingTab;

    // 根據當前標籤設定對應的資料到 detailItems（如果表格有使用這個屬性）
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
        // annual 不需要預設項目，直接使用 API 回來的資料
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
      return [];
    }

    console.log(' TLS12040 創建預設折扣項目 (參考 TLS13010)');

    return this.discountOptions.map((option, index) => {
      //  修正：更寬鬆的預選邏輯 - 只要是 000 或包含正品就預選
      const shouldSelectByDefault = (option.value === '000' || option.label?.includes('正品'));

      const item = {
        id: this.generateTempId(),
        apply_no: parentItem.apply_no,
        tlt_id: parentItem.tlt_id,
        cag_barcode: option.value,
        tlt_bdate: null,
        tlt_edate: null,
        cag_charge_rate: 0,
        barcode_desc: option.label || '',
        is_configured: shouldSelectByDefault,
        is_enabled: shouldSelectByDefault,
        _status: 'new',
        is_selected: shouldSelectByDefault, // 關鍵：確保勾選狀態正確
        _originalType: 'discount'
      };

      console.log(`創建項目: ${option.value} (${option.label}) - ${shouldSelectByDefault ? '預選' : '不預選'}`);
      return item;
    });
  }


  /**
   * 建立預設的 level 項目（8個折扣選項）
   */
  private createDefaultLevelItems(parentItem: ChargeSettingBusinessModel): any[] {
    if (!this.discountOptions || this.discountOptions.length === 0) {
      return [];
    }

    console.log(' TLS12040 創建預設層級項目 (參考 TLS13010)');

    return this.discountOptions.map((option, index) => {
      //  修正：更寬鬆的預選邏輯 - 只要是 000 或包含正品就預選
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
        is_selected: shouldSelectByDefault, // 關鍵：確保勾選狀態正確
        _originalType: 'level'
      };

      console.log(`創建層級項目: ${option.value} (${option.label}) - ${shouldSelectByDefault ? '預選' : '不預選'}`);
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
      commissionData: this.commissionData || [],

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

    console.log('💾 準備儲存 Next2 資料:', {
      commissionDataLength: dataToSave.commissionData.length,
      selectedTab: dataToSave.selectedSettingTab,
      applyNo: dataToSave.currentApplyNo,
      hasContractInfo: dataToSave.contractInfoData.length > 0
    });

    // 呼叫 flowService 儲存資料
    const success = this.flowService.setNext2Data(dataToSave);

    if (success) {
      console.log('✅ Next2 資料儲存成功');
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

    if (!confirm(`確定要刪除選取的 ${selectedItems.length} 個項目嗎？`)) {
      return;
    }

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

    if (!confirm(`確定要刪除選取的 ${selectedDetails.length} 個明細項目嗎？`)) {
      return;
    }

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

    const cruData = this.flowService.getCruData<SimpleContractInfo>();
    if (!cruData?.apply_no) {
      this.notificationService.errorBubble('缺少申請編號，無法新增項目');
      return;
    }

    const newItem: ChargeSettingBusinessModel = {
      id: this.generateTempId(),
      apply_no: cruData.apply_no,
      tlt_id: this.generateNewTltId(),
      tlt_id_desc: '新抽成類別',
      cag_bdate: this.getContractDate('start'),
      cag_edate: this.getContractDate('end'),
      cag_taxtype: '1',
      sst_amount: null,
      sst_rate: null,
      cap_saletype1: 'N',
      cap_saletype2: 'N',
      cag_remark: '',
      _status: 'new',
      ChargeDetails: this.createDefaultDiscountItems({
        apply_no: cruData.apply_no,
        tlt_id: this.generateNewTltId()
      } as ChargeSettingBusinessModel),
      YearChargeDetails: [],
      LevelChargeDetails: this.createDefaultLevelItems({
        apply_no: cruData.apply_no,
        tlt_id: this.generateNewTltId()
      } as ChargeSettingBusinessModel)
    };

    this.commissionData = [...this.commissionData, newItem];
    this.saveToWorkflow();
    this.notificationService.infoBubble('新增完成');
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
  }): void { }

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
    try {
      this.loading = true;
      this.notificationService.blockUi();

      // 生成提交資料
      const submitData = this.flowService.generateTLS12040SubmitData();
      console.log('準備提交的資料:', submitData);

      // 呼叫 API 提交
      const response = await this.tls12040Service.submitFinalTLS12040(submitData).toPromise();

      if (response.Status === '0000') {
        this.notificationService.successBubble('契約資料提交成功！');
        this.flowService.onSubmitSuccess();

        // 延遲導航回列表頁
        setTimeout(() => {
          this.router.navigate(['account/tls/tls12040']);
        }, 2000);
      } else {
        throw new Error(response.Message || '提交失敗');
      }

    } catch (error) {
      console.error('提交失敗:', error);
      this.notificationService.errorBubble('契約資料提交失敗，請重試');
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

    //  新增：保護 cag_barcode 不被意外修改
    if (fieldName === 'cag_barcode' && rowData.cag_barcode && rowData.cag_barcode !== newValue) {
      console.warn('⚠️ 嘗試修改 cag_barcode，這可能不是預期的行為:', {
        itemId: rowData.id,
        originalValue: rowData.cag_barcode,
        newValue: newValue,
        stackTrace: new Error().stack
      });

      // 如果不是明確的用戶操作，則阻止修改
      if (fieldName === 'cag_barcode' && this.selectedSettingTab !== 'annual') {
        console.log('阻止 cag_barcode 的意外修改');
        return;
      }
    }

    // 判斷是主檔還是明細
    const isDetail = this.isDetailItem(event.rowData);

    if (isDetail) {
      this.handleDetailFieldChange(event);
    } else {
      this.dataFlowService.updateField(
        rowData.id,
        'master',
        fieldName,
        newValue
      );
    }

    setTimeout(() => {
      if (this.commissionData.length > 0) {
        this.saveToWorkflow();
      }
    }, 200);
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

  get processedCommissionData(): ChargeSettingBusinessModel[] {
    return this.visibleCommissionData.map(item => {
      // 建立一個新的物件，包含動態的 detailItems
      const processedItem = { ...item };

      // 根據當前選中的標籤，設定對應的資料到一個統一的屬性名稱
      switch (this.selectedSettingTab) {
        case 'discount':
          // 確保有 8 個折扣選項
          if (!processedItem.ChargeDetails || processedItem.ChargeDetails.length === 0) {
            processedItem.ChargeDetails = this.createDefaultDiscountItems(processedItem);
          }
          // 將資料複製到統一的 detailItems 屬性
          processedItem.detailItems = processedItem.ChargeDetails.filter(detail => detail._status !== 'deleted');
          break;

        case 'level':
          // 確保有 8 個層級選項
          if (!processedItem.LevelChargeDetails || processedItem.LevelChargeDetails.length === 0) {
            processedItem.LevelChargeDetails = this.createDefaultLevelItems(processedItem);
          }
          // 將資料複製到統一的 detailItems 屬性
          processedItem.detailItems = processedItem.LevelChargeDetails.filter(detail => detail._status !== 'deleted');
          break;

        case 'annual':
          if (!processedItem.YearChargeDetails) {
            processedItem.YearChargeDetails = [];
          }
          // 關鍵：annual 要過濾掉 deleted 的項目
          processedItem.detailItems = processedItem.YearChargeDetails.filter(detail => detail._status !== 'deleted');
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
    const cruData = this.flowService.getCruData<SimpleContractInfo>();
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

    if (typeof dateInput === 'string' && dateInput.includes('T')) {
      return dateInput.split('T')[0];
    }

    try {
      // 修正：使用本地時間而非 UTC 時間
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
   * 強制同步當前標籤的數據（避免數據遺失）
   */
  private forceSyncCurrentTabData(commissionItem: ChargeSettingBusinessModel): void {
    const currentTab = this.selectedSettingTab;

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
  }

  /**
 * 複製詳細項目（插入到下一行）
 */
  private copyDetailItem(sourceItem: any, parentData: ChargeSettingBusinessModel): void {
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
