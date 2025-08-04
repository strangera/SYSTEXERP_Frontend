// tls13010-next2.component.ts - 完整修正版 (統一API適配)
import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { SelectItem, PrimeTemplate } from 'primeng/api';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { ContractFlowService } from '../tls13010/services/contract-flow.service';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { TLS13010_DROPDOWN_OPTIONS } from '../tls13010/tls13010.dropdown';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import {
  ContractInfo,
  CommissionItem,
  DiscountSettingItem,
  AnnualPerformanceItem,
  DiscountLevelItem,
  Step3DataChangeTracker,
  WorkflowStep,
  UnifiedCommissionResponse,
  ChargeSettingApiItem,
  CleanSubmitData,
} from '../tls13010/tls13010.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { ButtonDirective } from 'primeng/button';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tls13010-next2',
  templateUrl: './tls13010-next2.component.html',
  styleUrls: ['./tls13010-next2.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, NgIf, ProgressSpinnerModule, AccordionModule, ExpandableEditTableComponent, DialogModule, PrimeTemplate, ButtonDirective]
})
export class TLS13010Next2Component extends BasicCruPageComponent<ContractInfo> implements OnInit, OnDestroy {
  @ViewChild('expandedContent') expandedContentTemplate!: TemplateRef<any>;
  //檢視頁面參數
  isViewMode = false;
  private viewModeSubscription?: Subscription;

  private subscriptions: Subscription[] = [];
  dataForm: FormGroup;

  // 🎯 新增：資料載入狀態控制
  dataLoaded: boolean = false;
  commissionDataLoaded: boolean = false;

  // 當前合約資料
  currentTalentId: string = '';
  currentContractData: any = null;
  contractInfoData: ContractInfo[] = [];

  // 頂部選項卡選擇
  selectedSettingTab: string = 'discount';

  // 展開區域表格的動態列定義
  detailColumns: ColumnDef[] = [];

  showConfirmDialog = false;

  // 合約資訊欄位定義
  contractInfoColumns: ColumnDef[] = [
    {
      field: 'apply_no',
      header: '專櫃招募編號',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'talent_id',
      header: '專櫃編號',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'tlt_name',
      header: '品牌(專櫃)名稱',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'ven_uniform',
      header: '廠商統編',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'VEN_Name',
      header: '廠商名稱',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'contract_subno',
      header: '版本編號',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'tlt_term_type',
      header: '抽成別',
      type: 'dropdown',
      editable: false,
      options: TLS13010_DROPDOWN_OPTIONS.tltTermType,
      autoWidth: true
    },
    {
      field: 'tlt_bdate',
      header: '合約起始日',
      type: 'date',
      editable: false,
      autoWidth: true,
      dateFormat: 'full-date'
    },
    {
      field: 'tlt_edate',
      header: '合約終止日',
      type: 'date',
      editable: false,
      autoWidth: true,
      dateFormat: 'full-date'
    },
    {
      field: 'tlt_contract_bdate',
      header: '營運起始日',
      type: 'date',
      editable: false,
      autoWidth: true,
      dateFormat: 'full-date'
    },
    {
      field: 'tlt_contract_edate',
      header: '營運終止日',
      type: 'date',
      editable: false,
      autoWidth: true,
      dateFormat: 'full-date'
    }
  ];

  // 各類型的列定義
  discountColumns: ColumnDef[] = [
    {
      field: 'cag_barcode',
      header: '折扣別',
      type: 'dropdown',
      editable: true,
      options: []
    },
    { field: 'startDate', header: '合約起始日', type: 'date', editable: true, },
    { field: 'endDate', header: '合約終止日', type: 'date', editable: true, },
    { field: 'rate', header: '抽成率 (%)', type: 'number', editable: true, allowDecimal: true, decimalPlaces: 2 }
  ];

  annualColumns: ColumnDef[] = [
    { field: 'startDate', header: '帳務起', type: 'date', editable: true },
    { field: 'endDate', header: '帳務迄', type: 'date', editable: true },
    { field: 'discountAmount', header: '業績超過金額含', type: 'number', editable: true },
    { field: 'rate', header: '抽成率', type: 'number', editable: true, allowDecimal: true, decimalPlaces: 2 }
  ];

  levelColumns: ColumnDef[] = [
    {
      field: 'cag_barcode',
      header: '折扣別',
      type: 'dropdown',
      editable: true,
      options: []
    },
    { field: 'startAmount', header: '業績計算金額(起)', type: 'number', editable: true },
    { field: 'endAmount', header: '業績計算金額(迄)', type: 'number', editable: true },
    { field: 'rate', header: '抽成率', type: 'number', editable: true, allowDecimal: true, decimalPlaces: 2 }
  ];

  settingOptions: SelectItem[] = [
    { label: '折扣設定', value: 'discount' },
    { label: '年度總業績抽成設定', value: 'annual' },
    { label: '折扣別層級抽成設定', value: 'level' }
  ];

  settingTabs = [
    { id: 'discount', label: '折扣設定' },
    { id: 'annual', label: '年度總業績抽成設定' },
    { id: 'level', label: '折扣別層級抽成設定' }
  ];

  // 佣金表格列定義
  commissionColumns: ColumnDef[] = [
    { field: 'commissionType', header: '抽成類別', editable: false },
    { field: 'commissionTypeName', header: '抽成類別名稱', editable: true },
    { field: 'taxType', header: '稅別', editable: true, type: 'dropdown', options: TLS13010_DROPDOWN_OPTIONS.cagTaxTypeOption },
    { field: 'transactionAmount', header: '單筆交易金額(含)以上', editable: true, type: 'number' },
    { field: 'specialCommission', header: '特價抽成(%)', editable: true, type: 'number' },
    { field: 'fullPointActivity', header: '全館消費滿額集點活動', editable: true, type: 'checkbox' },
    { field: 'thousandDiscount', header: '滿仟送佰', editable: true, type: 'checkbox' },
  ];

  // 數據
  commissionData: CommissionItem[] = [];

  // 下拉選項
  taxTypeOptions: any[] = [
    { label: '應稅', value: 1 },
    { label: '免稅', value: 2 }
  ];

  discounts: any[] = [
    { value: 1, label: '正品' },
    { value: 2, label: '95折' },
    { value: 3, label: '90折' },
    { value: 4, label: '85折' },
    { value: 5, label: '80折' },
    { value: 6, label: '75折' },
    { value: 7, label: '70折' },
    { value: 8, label: '65折' },
    { value: 9, label: '60折' },
    { value: 10, label: '55折' },
    { value: 11, label: '50折' },
    { value: 12, label: '特價' }
  ];
  private discountOptions: any[] = [];

  constructor(
    private notificationService: NotificationService,
    private contractFlowService: ContractFlowService,
    private tls13010Service: TLS13010Service,
    private paperTypeService: LocationOptionsService,
    private route: ActivatedRoute,
  ) {
    super();
    this.dataForm = this.formBuilder.group({});
    this.updateDetailColumns();
  }

  ngOnInit(): void {
    this.setupViewModeUI();
    this.initializePage('TLS13010', this.dataForm);

    this.loadDiscountOptions().then(() => {
      this.loadWorkflowData();
      this.setupAutoSave();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());

    if (this.viewModeSubscription) {
      this.viewModeSubscription.unsubscribe();
    }
  }

  private setupAutoSave(): void {
    if (this.isViewMode) {
      console.log('🔍 Next2 檢視模式，跳過自動儲存設定');
      return;
    }

    if (this.dataForm) {
      const formSubscription = this.dataForm.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        this.saveToWorkflow();
      });
      this.subscriptions.push(formSubscription);
    }
  }

  /**
  * 🎯 新增：設定檢視模式 UI
  */
  private setupViewModeUI(): void {
    console.log('🔧 Next2 設定檢視模式 UI 監聽');

    // 🎯 先檢查當前狀態
    const currentViewMode = this.contractFlowService.isViewMode();
    console.log('📋 Next2 當前檢視模式狀態:', currentViewMode);

    // 🎯 如果已經是檢視模式，立即設定
    if (currentViewMode) {
      this.isViewMode = true;
      this.applyViewModeSettings(true);
    }

    // 🎯 訂閱後續變更
    this.viewModeSubscription = this.contractFlowService.isViewMode$.subscribe(isViewMode => {
      console.log('🔍 Next2 檢視模式變更:', isViewMode);
      this.isViewMode = isViewMode;
      this.applyViewModeSettings(isViewMode);
    });
  }


  private applyViewModeSettings(isViewMode: boolean): void {
    console.log('⚙️ Next2 套用檢視模式設定:', isViewMode);

    if (isViewMode) {
      console.log('🔒 Next2 啟用檢視模式 - 表格將自動變為唯讀');
    } else {
      console.log('🔓 Next2 停用檢視模式 - 表格將恢復可編輯');
    }

    // 🎯 不需要手動更新欄位，readonly 屬性會自動處理所有事情
  }


  private saveToWorkflow(): void {
    if (this.isViewMode) {
      console.log('🔍 Next2 檢視模式，跳過資料儲存');
      return;
    }
    if (this.hasCommissionChanges()) {
      Step3DataChangeTracker.setCurrentTalentId(this.currentTalentId);
      const processedData = this.prepareCommissionDataForSubmit();
      this.contractFlowService.saveStep3Data(processedData);
      console.log('✅ 已暫存抽成資料到工作流程:', processedData);
    }
  }

  private hasCommissionChanges(): boolean {
    return this.commissionData.some(item =>
      item._status === 'new' ||
      item._status === 'modified' ||
      item._status === 'deleted' ||
      this.hasDetailItemChanges(item)
    );
  }

  private hasDetailItemChanges(commissionItem: CommissionItem): boolean {
    const hasDiscountChanges = commissionItem.discountSettingItems.some(item =>
      item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
    );

    const hasAnnualChanges = commissionItem.annualPerformanceItems.some(item =>
      item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
    );

    const hasLevelChanges = commissionItem.discountLevelItems.some(item =>
      item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
    );

    return hasDiscountChanges || hasAnnualChanges || hasLevelChanges;
  }

  private prepareCommissionDataForSubmit(): CommissionItem[] {
    console.log('🔄 準備抽成資料供提交，原始資料:', this.commissionData);

    const processedData = this.commissionData.map(item => {
      const processedItem = {
        ...item,
        _status: item._status || (this.hasItemId(item) ? 'original' : 'new'),

        discountSettingItems: item.discountSettingItems.map(detail => ({
          ...detail,
          _status: detail._status || (this.hasItemId(detail) ? 'original' : 'new')
        })),

        annualPerformanceItems: item.annualPerformanceItems.map(detail => ({
          ...detail,
          _status: detail._status || (this.hasItemId(detail) ? 'original' : 'new')
        })),

        discountLevelItems: item.discountLevelItems.map(detail => ({
          ...detail,
          _status: detail._status || (this.hasItemId(detail) ? 'original' : 'new')
        }))
      };

      return processedItem;
    });

    console.log('✅ 處理後的抽成資料:', processedData);
    return processedData;
  }

  private loadDiscountOptions(): Promise<void> {
    return new Promise((resolve) => {
      console.log('🔽 開始載入折數選項...');
      this.paperTypeService.getPaperTypeOptions('T102').subscribe({
        next: (options: any[]) => {
          console.log('📥 API 回傳的折扣選項:', options);
          this.discountOptions = options;
          this.discounts = [...this.discountOptions];
          console.log('🔄 設定折扣選項:', this.discountOptions);
          this.updateDiscountColumnOptions();
          resolve();
        },
        error: (error: any) => {
          console.error('❌ 載入折數選項失敗:', error);
          this.discountOptions = [];
          this.discounts = [];
          this.updateDiscountColumnOptions();
          resolve();
        }
      });
    });
  }

  private updateDiscountColumnOptions(): void {
    console.log('🟢 更新折扣選項:', this.discountOptions);
    this.discountColumns = this.discountColumns.map(col => {
      if (col.field === 'cag_barcode') {
        return { ...col, options: [...this.discountOptions] };
      }
      return col;
    });

    this.levelColumns = this.levelColumns.map(col => {
      if (col.field === 'cag_barcode') {
        return { ...col, options: [...this.discountOptions] };
      }
      return col;
    });

    this.updateDetailColumns();
  }

  private loadWorkflowData(): void {
    console.log('🚀 Next2 開始載入工作流程資料...');

    const workflowData = this.contractFlowService.getCurrentData();
    console.log('📋 工作流程資料:', workflowData);

    // 🎯 統一使用 ContractFlowService 的模式判定
    if (workflowData.contractId || this.contractFlowService.isNewContractMode()) {
      // 🎯 統一獲取模式資訊和 talent_id
      const modeInfo = this.contractFlowService.getWorkflowModeInfo();
      this.currentTalentId = modeInfo.talentId;
      this.currentContractData = workflowData?.queryRowData;

      console.log('✅ 工作流程狀態確認:', {
        mode: modeInfo.modeName,
        currentTalentId: this.currentTalentId,
        contractId: modeInfo.contractId
      });

      // 🎯 設定追蹤 ID（新增模式使用特殊標識）
      Step3DataChangeTracker.setCurrentTalentId(this.currentTalentId || 'NEW_CONTRACT');

      // 🎯 準備合約資訊顯示
      this.prepareContractInfoDisplay();

      // 🎯 載入抽成資料
      this.loadCommissionDataWithPriority();
    } else {
      console.warn('❌ 沒有有效的工作流程資料，重導向到前一步');
      this.router.navigate(['account/tls/tls13010cru']);
    }
  }

  private prepareContractInfoDisplay(): void {
    console.log('📊 準備合約資訊顯示...');

    // 🎯 優先使用 CRU 頁面編輯後的資料
    const step1Data = this.contractFlowService.getStep1Data();
    console.log('📝 Step1 編輯資料:', step1Data);

    // 🎯 準備合約資訊
    const contractInfo = {
      talent_id: step1Data?.talent_id || this.currentContractData?.talent_id || '',
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

    console.log('📊 準備顯示的合約資訊:', contractInfo);

    this.contractInfoData = [{
      id: contractInfo.talent_id || 'new', // 🎯 新增模式顯示 'new'
      ...contractInfo
    }];

    console.log('📊 最終合約資訊陣列:', this.contractInfoData);
  }


  private loadCommissionDataWithPriority(): void {
    this.loading = true;
    this.commissionDataLoaded = false;

    console.log('🔍 載入抽成資料優先順序判定...');

    // 🎯 第一優先：檢查是否有暫存資料
    const savedCommissionData = this.contractFlowService.getStepData(WorkflowStep.COMMISSION);

    if (savedCommissionData && Array.isArray(savedCommissionData) && savedCommissionData.length > 0) {
      console.log('📦 找到暫存抽成資料，使用暫存資料');
      this.loadSavedCommissionData(savedCommissionData);
      return;
    }

    // 🎯 第二優先：根據模式載入
    if (this.contractFlowService.isNewContractMode()) {
      console.log('🆕 新增模式：初始化空的抽成設定');
      this.initializeEmptyCommissionData();
    } else {
      console.log('📝 編輯模式：載入抽成資料');
      this.loadUnifiedCommissionData();
    }
  }

  private loadSavedCommissionData(savedData: CommissionItem[]): void {
    console.log('📦 載入暫存抽成資料:', savedData);

    try {
      this.commissionData = savedData.map(item => ({
        ...item,
        _status: item._status || 'original'
      }));

      this.commissionDataLoaded = true;
      this.dataLoaded = true;
      this.loading = false;
      this.updateDetailItemsForDisplay();

      console.log('✅ 暫存抽成資料載入完成');
      console.log('📊 載入的抽成項目數量:', this.commissionData.length);

      // 🎯 驗證載入結果
      this.validateLoadedCommissionData();

    } catch (error) {
      console.error('❌ 暫存抽成資料處理失敗:', error);
      this.loading = false;
      this.notificationService.errorBubble('載入暫存抽成資料失敗');

      // 🎯 降級處理
      if (this.contractFlowService.isNewContractMode()) {
        this.initializeEmptyCommissionData();
      } else {
        this.loadUnifiedCommissionData();
      }
    }
  }

  private validateLoadedCommissionData(): void {
    console.log('🔍 驗證載入的抽成資料...');

    const totalItems = this.commissionData.length;
    const newItems = this.commissionData.filter(item => item._status === 'new').length;
    const modifiedItems = this.commissionData.filter(item => item._status === 'modified').length;
    const originalItems = this.commissionData.filter(item => item._status === 'original' || !item._status).length;

    console.log('📊 抽成資料統計:', {
      totalItems: totalItems,
      newItems: newItems,
      modifiedItems: modifiedItems,
      originalItems: originalItems,
      mode: this.contractFlowService.isNewContractMode() ? '新增' : '編輯'
    });

    // 🎯 檢查每個抽成項目的明細數量
    this.commissionData.forEach((item, index) => {
      const discountCount = item.discountSettingItems?.length || 0;
      const annualCount = item.annualPerformanceItems?.length || 0;
      const levelCount = item.discountLevelItems?.length || 0;

      console.log(`📋 抽成項目 ${index + 1} (${item.commissionTypeName}):`, {
        discountSettings: discountCount,
        annualPerformance: annualCount,
        discountLevel: levelCount,
        status: item._status || 'none'
      });
    });
  }


  // private loadCommissionData(): void {
  //   this.loading = true;
  //   this.commissionDataLoaded = false;

  //   // 🎯 首先檢查是否為新增模式
  //   const workflowData = this.contractFlowService.getCurrentData();
  //   const isNewContract = workflowData?.queryRowData?._isNewContract;

  //   console.log('🔍 載入抽成資料，模式判定:', {
  //     isNewContract: isNewContract,
  //     currentTalentId: this.currentTalentId
  //   });

  //   // 🎯 檢查暫存資料
  //   const savedCommissionData = this.contractFlowService.getStepData(WorkflowStep.COMMISSION);

  //   if (savedCommissionData && Array.isArray(savedCommissionData) && savedCommissionData.length > 0) {
  //     console.log('📦 找到暫存抽成資料，使用暫存資料');
  //     this.commissionData = savedCommissionData.map(item => ({
  //       ...item,
  //       _status: item._status || 'original'
  //     }));
  //     this.commissionDataLoaded = true;
  //     this.dataLoaded = true;
  //     this.loading = false;
  //     this.updateDetailItemsForDisplay();
  //   } else if (isNewContract) {
  //     // 🎯 新增模式：初始化空的抽成資料
  //     console.log('🆕 新增模式：初始化空的抽成設定');
  //     this.initializeEmptyCommissionData();
  //     this.loading = false;
  //   } else {
  //     // 🎯 編輯模式：從 API 載入
  //     console.log('📝 編輯模式：從 API 載入抽成資料');
  //     this.loadUnifiedCommissionData();
  //   }
  // }



  // 🎯 修正：使用統一 API 載入資料
  private loadUnifiedCommissionData(): void {
    // 🎯 檢查是否為新增模式
    if (this.contractFlowService.isNewContractMode()) {
      console.log('🆕 新增模式，初始化空的抽成設定');
      this.initializeEmptyCommissionData();
      return;
    }

    // 🎯 編輯模式：獲取當前抽成別
    const currentCommissionType = this.contractFlowService.getCurrentCommissionType();
    if (!currentCommissionType) {
      console.warn('❌ 無法取得抽成別，降級到原本的 API');
      this.loadCommissionDataFromAPI();
      return;
    }

    this.loading = true;
    this.dataLoaded = false;
    this.commissionDataLoaded = false;

    console.log('🔍 呼叫統一抽成設定 API:', {
      talentId: this.currentTalentId,
      currentCommissionType
    });

    const request = {
      TalentId: this.currentTalentId,
      CurrentTltTermType: currentCommissionType
    };

    this.tls13010Service.queryTLS13010ChargeUnified(request).subscribe({
      next: (response) => {
        console.log('✅ 統一抽成設定 API 回應:', response);
        this.handleUnifiedCommissionResponse(response.Data);
      },
      error: (error) => {
        console.error('❌ 統一抽成設定 API 失敗:', error);
        this.loading = false;
        this.notificationService.errorBubble('載入抽成設定資料失敗');
        this.loadCommissionDataFromAPI();
      }
    });
  }



  // 🎯 修正：處理統一 API 回應
  private handleUnifiedCommissionResponse(data: UnifiedCommissionResponse): void {
    try {
      console.log('🔄 處理統一 API 回應:', data);

      // 🎯 重要：將完整的 API 回應存到 contractFlowService
      this.contractFlowService.setUnifiedCommissionData(data);

      // 處理抽成別變更警告
      if (data.IsTermTypeChanged && data.Warning) {
        console.log('⚠️ 抽成別已變更:', data.Warning.Message);
        this.notificationService.warnBubble(data.Warning.Message);

        if (data.Warning.ItemsToBeDeleted && data.Warning.ItemsToBeDeleted.length > 0) {
          console.log('🗑️ 將被刪除的項目:', data.Warning.ItemsToBeDeleted);
        }
      }

      // 🎯 修正：處理統一 API 的資料結構
      if (data.ExistingChargeData?.ChargeSettings) {
        console.log('📊 載入現有抽成設定資料');
        this.convertUnifiedAPIDataToCommissionItems(data.ExistingChargeData);
        this.commissionDataLoaded = true;
      } else if (data.ActionType === 'CLEAR_AND_INIT' || data.ActionType === 'INIT_NEW') {
        console.log('🆕 初始化空的抽成設定');
        this.initializeEmptyCommissionData();
      } else {
        console.log('📭 沒有抽成設定資料，初始化空資料');
        this.initializeEmptyCommissionData();
      }

      this.dataLoaded = true;
      this.loading = false;
      this.updateDetailItemsForDisplay();
      this.saveCommissionDataToWorkflow();

      if (data.UserMessage) {
        this.notificationService.infoBubble(data.UserMessage);
      }

    } catch (error) {
      console.error('❌ 處理統一 API 回應時發生錯誤:', error);
      this.loading = false;
      this.notificationService.errorBubble('處理抽成設定資料時發生錯誤');
      this.initializeEmptyCommissionData();
    }
  }

  // 🎯 修正：轉換統一 API 資料格式
  private convertUnifiedAPIDataToCommissionItems(apiData: any): void {
    this.commissionData = [];

    console.log('🔄 轉換統一 API 資料:', apiData);

    if (apiData.ChargeSettings && Array.isArray(apiData.ChargeSettings)) {
      apiData.ChargeSettings.forEach((chargeSetting: ChargeSettingApiItem, index: number) => {
        const commissionItem: CommissionItem = {
          id: chargeSetting.id || (index + 1),
          commissionType: chargeSetting.tlt_id || '',
          commissionTypeName: chargeSetting.tlt_id_desc || '抽成類別' + (index + 1),
          taxType: chargeSetting.cag_taxtype === '1' ? 1 : 0,
          discountSummary: this.generateDiscountSummary(chargeSetting),
          transactionAmount: chargeSetting.sst_amount || 0,
          specialCommission: chargeSetting.sst_rate || 0,
          fullPointActivity: chargeSetting.cap_saletype2 === 'Y',
          thousandDiscount: chargeSetting.cap_saletype1 === 'Y',
          selectedSettingOption: 'discount',

          // 🎯 修正：確保每個項目都有 currentTab
          currentTab: 'discount',

          discountSettingItems: this.convertChargeDetails(chargeSetting.ChargeDetails || []),
          annualPerformanceItems: this.convertYearChargeDetails(chargeSetting.YearChargeDetails || []),
          discountLevelItems: this.convertLevelChargeDetails(chargeSetting.LevelChargeDetails || []),

          detailItems: [],
          _status: 'original',

          mainStartDate: this.getContractStartDate(),
          mainEndDate: this.getContractEndDate()
        };

        this.updateCommissionItemDetails(commissionItem);
        this.commissionData.push(commissionItem);
      });
    }

    this.updateDetailItemsForDisplay();
    console.log('✅ 已轉換統一 API 資料為 CommissionItem 格式:', this.commissionData.length, '筆');
  }


  private loadCommissionDataFromAPI(): void {
    // 🎯 檢查是否為新增模式
    const workflowData = this.contractFlowService.getCurrentData();
    const isNewContract = workflowData?.queryRowData?._isNewContract;

    if (isNewContract || !this.currentTalentId || this.currentTalentId === 'NEW_CONTRACT') {
      console.log('🆕 新增模式或無 talent_id，初始化空的抽成設定');
      this.initializeEmptyCommissionData();
      return;
    }

    this.loading = true;
    this.dataLoaded = false;
    this.commissionDataLoaded = false;

    this.tls13010Service.queryTLS13010Charge(this.currentTalentId).subscribe({
      next: (response) => {
        if (response?.Data?.ChargeSettings && Array.isArray(response.Data.ChargeSettings)) {
          this.convertAPIDataToCommissionItems(response.Data);
          this.commissionDataLoaded = true;
        } else if (response?.Data && Array.isArray(response.Data)) {
          this.convertAPIDataToCommissionItems({ ChargeSettings: response.Data });
          this.commissionDataLoaded = true;
        } else {
          this.initializeEmptyCommissionData();
        }

        this.dataLoaded = true;
        this.loading = false;
        this.updateDetailItemsForDisplay();
        this.saveCommissionDataToWorkflow();
      },
      error: (error) => {
        console.error('❌ 載入抽成設定資料失敗:', error);
        this.notificationService.errorBubble('載入抽成設定資料失敗');
        this.initializeEmptyCommissionData();
        this.loading = false;
      }
    });
  }
  // 工具方法
  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getDiscountLabelByValue(value: string): string {
    const option = this.discountOptions.find(opt => String(opt.value) === String(value));
    if (option) return option.label;
    return value || '未設定';
  }

  private generateDiscountSummary(chargeSetting: any): string {
    console.log('🏷️ 生成折扣摘要，輸入資料:', chargeSetting);

    const summaryParts: string[] = [];

    if (chargeSetting.ChargeDetails && chargeSetting.ChargeDetails.length > 0) {
      const discountSummary = chargeSetting.ChargeDetails.map((detail: any) => {
        const discountLabel = this.getDiscountLabelByValue(detail.cag_barcode);
        return `${discountLabel}(${detail.cag_charge_rate}%)`;
      }).join(', ');
      summaryParts.push(`折扣設定: ${discountSummary}`);
    }

    if (chargeSetting.YearChargeDetails && chargeSetting.YearChargeDetails.length > 0) {
      const yearSummary = chargeSetting.YearChargeDetails.map((detail: any) => {
        return `${detail.year_amount}以上(+${detail.extra_rate}%)`;
      }).join(', ');
      summaryParts.push(`年度業績: ${yearSummary}`);
    }

    if (chargeSetting.LevelChargeDetails && chargeSetting.LevelChargeDetails.length > 0) {
      const levelSummary = chargeSetting.LevelChargeDetails.map((detail: any) => {
        const discountLabel = this.getDiscountLabelByValue(detail.cag_barcode);
        return `${discountLabel}(${detail.level_charge_rate}%)`;
      }).join(', ');
      summaryParts.push(`層級抽成: ${levelSummary}`);
    }

    const summary = summaryParts.join('; ') || '尚未設定';
    console.log('🏷️ 生成的摘要:', summary);
    return summary;
  }

  private convertAPIDataToCommissionItems(apiData: any): void {
    this.commissionData = [];

    if (apiData.ChargeSettings && Array.isArray(apiData.ChargeSettings)) {
      apiData.ChargeSettings.forEach((chargeSetting: any, index: number) => {
        const commissionItem: CommissionItem = {
          id: chargeSetting.id || (index + 1),
          commissionType: chargeSetting.tlt_id || '',
          commissionTypeName: chargeSetting.tlt_id_desc || '抽成類別' + (index + 1),
          taxType: chargeSetting.cag_taxtype === '1' ? 1 : 0,
          discountSummary: this.generateDiscountSummary(chargeSetting),
          transactionAmount: chargeSetting.sst_amount || 0,
          specialCommission: chargeSetting.sst_rate || 0,
          fullPointActivity: chargeSetting.cap_saletype2 === 'Y',
          thousandDiscount: chargeSetting.cap_saletype1 === 'Y',
          selectedSettingOption: 'discount',
          currentTab: 'discount',

          discountSettingItems: this.convertChargeDetails(chargeSetting.ChargeDetails || []),
          annualPerformanceItems: this.convertYearChargeDetails(chargeSetting.YearChargeDetails || []),
          discountLevelItems: this.convertLevelChargeDetails(chargeSetting.LevelChargeDetails || []),

          detailItems: [],
          _status: 'original',

          mainStartDate: this.getContractStartDate(),
          mainEndDate: this.getContractEndDate()
        };

        this.updateCommissionItemDetails(commissionItem);
        this.commissionData.push(commissionItem);
      });
    }

    this.updateDetailItemsForDisplay();
    console.log('✅ 已轉換 API 資料為 CommissionItem 格式:', this.commissionData.length, '筆');
  }

  private convertChargeDetails(chargeDetails: any[]): DiscountSettingItem[] {
    console.log('🔄 開始轉換折扣設定資料:', chargeDetails);

    return chargeDetails.map(detail => {
      const cag_barcode = detail.cag_barcode || '';
      console.log(`📝 處理折扣設定項目，原始 cag_barcode: ${cag_barcode}`);

      return {
        id: detail.id || this.generateTempId(),
        selected: true,
        cag_barcode: cag_barcode,
        startDate: detail.tlt_bdate ? new Date(detail.tlt_bdate) : new Date(),
        endDate: detail.tlt_edate ? new Date(detail.tlt_edate) : new Date(),
        rate: detail.cag_charge_rate || 0,
        _status: 'original'
      };
    });
  }

  private convertYearChargeDetails(yearDetails: any[]): AnnualPerformanceItem[] {
    if (!Array.isArray(yearDetails)) {
      return [];
    }

    return yearDetails.map(detail => {
      return {
        id: detail.id || this.generateTempId(),
        selected: true,
        startDate: detail.tlt_bdate ? new Date(detail.tlt_bdate) : new Date(),
        endDate: detail.tlt_edate ? new Date(detail.tlt_edate) : new Date(),
        discountAmount: detail.year_amount || 0,
        rate: detail.extra_rate || 0,
        _status: 'original'
      };
    });
  }

  private convertLevelChargeDetails(levelDetails: any[]): DiscountLevelItem[] {
    console.log('🔄 開始轉換層級抽成資料:', levelDetails);

    return levelDetails.map(detail => {
      const cag_barcode = detail.cag_barcode || '';
      console.log(`📝 處理層級抽成項目，原始 cag_barcode: ${cag_barcode}`);

      return {
        id: detail.id || this.generateTempId(),
        selected: true,
        cag_barcode: cag_barcode,
        startAmount: detail.level_bmount || 0,
        endAmount: detail.level_eamount || 0,
        rate: detail.level_charge_rate || 0,
        _status: 'original'
      };
    });
  }

  private initializeEmptyCommissionData(): void {
    console.log('🆕 初始化空的抽成資料');

    this.commissionData = [];
    this.commissionDataLoaded = true;
    this.dataLoaded = true;
    this.loading = false;

    console.log('✅ 空的抽成資料初始化完成');
  }


  private updateCommissionItemDetails(commissionItem: CommissionItem): void {
    switch (this.selectedSettingTab) {
      case 'discount':
        commissionItem.detailItems = [...commissionItem.discountSettingItems];
        break;
      case 'annual':
        commissionItem.detailItems = [...commissionItem.annualPerformanceItems];
        break;
      case 'level':
        commissionItem.detailItems = [...commissionItem.discountLevelItems];
        break;
      default:
        commissionItem.detailItems = [...commissionItem.discountSettingItems];
    }
  }

  hasCommissionData(): boolean {
    // 數據已載入，且有抽成項目（未被刪除的）
    const hasData = this.dataLoaded &&
      this.commissionData &&
      this.commissionData.filter(item => item._status !== 'deleted').length > 0;
    return hasData;
  }


  private saveCommissionDataToWorkflow(): void {
    console.log('💾 Next2 儲存抽成資料到工作流程...');

    try {
      // 🎯 確保所有資料都有正確的狀態標記
      const processedData = this.commissionData.map(item => ({
        ...item,
        _status: item._status || 'original',
        discountSettingItems: item.discountSettingItems.map(detail => ({
          ...detail,
          _status: detail._status || 'original'
        })),
        annualPerformanceItems: item.annualPerformanceItems.map(detail => ({
          ...detail,
          _status: detail._status || 'original'
        })),
        discountLevelItems: item.discountLevelItems.map(detail => ({
          ...detail,
          _status: detail._status || 'original'
        }))
      }));

      console.log('📋 處理後的抽成資料:', processedData);

      // 🎯 儲存到工作流程服務
      this.contractFlowService.saveStep3Data(processedData);

      // 🎯 驗證儲存結果
      this.verifyStoredCommissionData();

      console.log('✅ Next2 抽成資料儲存完成');

    } catch (error) {
      console.error('❌ Next2 儲存抽成資料失敗:', error);
      this.notificationService.errorBubble('儲存抽成資料失敗');
    }
  }

  private verifyStoredCommissionData(): void {
    const savedData = this.contractFlowService.getStep3Data();
    console.log('🔍 驗證 Next2 儲存結果:', {
      savedDataType: Array.isArray(savedData) ? '陣列' : typeof savedData,
      savedDataLength: Array.isArray(savedData) ? savedData.length : 0,
      originalDataLength: this.commissionData.length
    });

    if (Array.isArray(savedData) && savedData.length !== this.commissionData.length) {
      console.warn('⚠️ 儲存後的抽成項目數量不匹配:', {
        saved: savedData.length,
        original: this.commissionData.length
      });
    }
  }

  changeSettingTab(tab: string): void {
    console.log('🔄 切換標籤，從', this.selectedSettingTab, '到', tab);
    this.saveCurrentTabDataBeforeSwitch();
    this.selectedSettingTab = tab;
    this.updateDetailColumns();
    this.updateDetailItemsForDisplay();
  }

  private saveCurrentTabDataBeforeSwitch(): void {
    console.log('💾 切換標籤前保存資料，當前標籤:', this.selectedSettingTab);

    this.commissionData.forEach((commissionItem, index) => {
      if (commissionItem.detailItems && commissionItem.detailItems.length > 0) {
        console.log(`💾 保存項目 ${index} 的 detailItems 到對應陣列`);

        switch (this.selectedSettingTab) {
          case 'discount':
            commissionItem.discountSettingItems = commissionItem.detailItems.map(item => ({
              ...item,
              _status: item._status || (this.hasItemId(item) ? 'original' : 'new')
            }));
            console.log(`✅ 已保存折扣設定 ${commissionItem.discountSettingItems.length} 筆`);
            break;

          case 'annual':
            commissionItem.annualPerformanceItems = commissionItem.detailItems.map(item => ({
              ...item,
              _status: item._status || (this.hasItemId(item) ? 'original' : 'new')
            }));
            console.log(`✅ 已保存年度業績 ${commissionItem.annualPerformanceItems.length} 筆`);
            break;

          case 'level':
            commissionItem.discountLevelItems = commissionItem.detailItems.map(item => ({
              ...item,
              _status: item._status || (this.hasItemId(item) ? 'original' : 'new')
            }));
            console.log(`✅ 已保存層級抽成 ${commissionItem.discountLevelItems.length} 筆`);
            break;
        }
      }
    });

    this.saveToWorkflow();
  }

  updateDetailColumns(): void {
    switch (this.selectedSettingTab) {
      case 'discount':
        this.detailColumns = [...this.discountColumns];
        break;
      case 'annual':
        this.detailColumns = this.annualColumns;
        break;
      case 'level':
        this.detailColumns = [...this.levelColumns];
        break;
      default:
        this.detailColumns = [...this.discountColumns];
    }
  }

  getCurrentItems(rowData: CommissionItem): any[] {
    const currentTab = rowData.currentTab || 'discount';

    switch (currentTab) {
      case 'discount':
        return rowData.discountSettingItems.filter(i => i._status !== 'deleted');
      case 'annual':
        return rowData.annualPerformanceItems.filter(i => i._status !== 'deleted');
      case 'level':
        return rowData.discountLevelItems.filter(i => i._status !== 'deleted');
      default:
        return rowData.discountSettingItems.filter(i => i._status !== 'deleted');
    }
  }

  addDetailItem(rowData: CommissionItem): void {
    const currentTab = rowData.currentTab || this.selectedSettingTab || 'discount';

    console.log('🔍 DEBUG addDetailItem:');
    console.log('  - rowData.id:', rowData.id);
    console.log('  - 當前標籤:', currentTab);

    switch (currentTab) {
      case 'discount':
        this.addDiscountSettingItem(rowData);
        break;
      case 'annual':
        this.addAnnualPerformanceItem(rowData);
        break;
      case 'level':
        this.addDiscountLevelItem(rowData);
        break;
      default:
        console.warn('⚠️ 未知的標籤類型:', currentTab);
        this.addDiscountSettingItem(rowData);
    }

    // 🎯 移除這行，因為上面的三個方法已經直接更新了 detailItems
    // this.refreshSingleItemDetailDisplay(rowData);

    this.saveCommissionDataToWorkflow();
  }

  // 新增方法 - 只刷新單一項目的顯示，不影響其他項目
  private refreshSingleItemDetailDisplay(commissionItem: CommissionItem): void {
    const currentTab = commissionItem.currentTab || 'discount';
    console.log('🔄 刷新單一項目顯示，項目ID:', commissionItem.id, '標籤:', currentTab);

    // 🎯 重要：直接更新對應的 detailItems，不要重建整個陣列
    let newDetailItems: any[] = [];

    switch (currentTab) {
      case 'discount':
        newDetailItems = commissionItem.discountSettingItems
          .filter(item => item._status !== 'deleted')
          .map(item => ({
            ...item,
            _originalType: 'discount'
          }));
        break;

      case 'annual':
        newDetailItems = commissionItem.annualPerformanceItems
          .filter(item => item._status !== 'deleted')
          .map(item => ({
            ...item,
            _originalType: 'annual'
          }));
        break;

      case 'level':
        newDetailItems = commissionItem.discountLevelItems
          .filter(item => item._status !== 'deleted')
          .map(item => ({
            ...item,
            _originalType: 'level'
          }));
        break;
    }

    // 🎯 只更新這個項目的 detailItems
    commissionItem.detailItems = newDetailItems;

    console.log(`✅ 項目 ${commissionItem.id} 的明細資料已刷新，共 ${newDetailItems.length} 筆`);
  }

  removeDetailItem(rowData: CommissionItem, index: number): void {
    // 🎯 修正：使用項目的 currentTab 而不是全域的 selectedSettingTab
    const currentTab = rowData.currentTab || 'discount';

    console.log('🗑️ 移除明細項目:', {
      parentId: rowData.id,
      index: index,
      currentTab: currentTab
    });

    switch (currentTab) {
      case 'discount':
        this.removeDiscountSettingItem(rowData, index);
        break;
      case 'annual':
        this.removeAnnualPerformanceItem(rowData, index);
        break;
      case 'level':
        this.removeDiscountLevelItem(rowData, index);
        break;
    }

    // 🎯 重要：更新單一項目的顯示，而不是全部
    this.updateSingleItemDetailDisplay(rowData);
    this.saveCommissionDataToWorkflow();
  }


  getSettingTitle(): string {
    switch (this.selectedSettingTab) {
      case 'discount':
        return '折扣設定';
      case 'annual':
        return '年度總業績抽成設定';
      case 'level':
        return '折扣別層級抽成設定';
      default:
        return '折扣設定';
    }
  }

  updateDetailItemsForDisplay(): void {
    console.log('🔄 更新顯示資料，當前全域標籤:', this.selectedSettingTab);

    this.commissionData.forEach((item, index) => {
      if (!item.currentTab) {
        item.currentTab = 'discount';
      }

      // 🎯 只有在長度不匹配時才更新（表示有新增或刪除）
      const shouldUpdate = this.shouldUpdateDetailItemsFromSource(item);

      if (shouldUpdate) {
        console.log(`🔄 項目 ${index} 需要從來源更新 detailItems`);
        this.refreshSingleItemDetailDisplay(item);
      } else {
        console.log(`⚪ 項目 ${index} 的 detailItems 保持不變`);
      }
    });

    // 🎯 不要重新賦值整個陣列，避免觸發不必要的重新渲染
    // this.commissionData = [...this.commissionData];
  }


  private shouldUpdateDetailItemsFromSource(commissionItem: CommissionItem): boolean {
    if (!commissionItem.detailItems || commissionItem.detailItems.length === 0) {
      return true;
    }

    let sourceLength = 0;
    const itemCurrentTab = commissionItem.currentTab || 'discount';

    switch (itemCurrentTab) {
      case 'discount':
        sourceLength = commissionItem.discountSettingItems?.filter(i => i._status !== 'deleted').length || 0;
        break;
      case 'annual':
        sourceLength = commissionItem.annualPerformanceItems?.filter(i => i._status !== 'deleted').length || 0;
        break;
      case 'level':
        sourceLength = commissionItem.discountLevelItems?.filter(i => i._status !== 'deleted').length || 0;
        break;
    }

    const needUpdate = commissionItem.detailItems.length !== sourceLength;

    console.log(`🔍 檢查項目 ${commissionItem.id} 是否需要更新:`, {
      itemCurrentTab,
      currentDetailItemsLength: commissionItem.detailItems.length,
      sourceLength,
      needUpdate
    });

    return needUpdate;
  }

  createDiscountSettingItem(): DiscountSettingItem {
    const startDate = this.contractInfoData[0]?.tlt_bdate
      ? new Date(this.contractInfoData[0].tlt_bdate)
      : new Date();
    const endDate = this.contractInfoData[0]?.tlt_edate
      ? new Date(this.contractInfoData[0].tlt_edate)
      : new Date();

    return {
      id: this.generateTempId(),
      selected: false,
      cag_barcode: '',
      startDate: startDate,
      endDate: endDate,
      rate: 0,
      _status: 'new'
    };
  }

  createAnnualPerformanceItem(): AnnualPerformanceItem {
    return {
      id: this.generateTempId(),
      selected: false,
      startDate: new Date(),
      endDate: new Date(),
      discountAmount: 0,
      rate: 0,
      _status: 'new'
    };
  }

  createDiscountLevelItem(): DiscountLevelItem {
    return {
      id: this.generateTempId(),
      selected: false,
      cag_barcode: '',
      startAmount: 0,
      endAmount: 0,
      rate: 0,
      _status: 'new'
    };
  }

  onAddCommissionItem(): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }
    // 計算下一個抽成類別編號（最多到9）
    const existingItems = this.commissionData.filter(item => item._status !== 'deleted');
    const nextNumber = existingItems.length;

    if (nextNumber >= 9) {
      this.notificationService.warnBubble('抽成項目最多只能建立9個');
      return;
    }

    // 自動產生抽成類別編號和名稱
    const commissionType = nextNumber.toString(); //數字自動產0 1 2 3 4 5 6
    const commissionTypeName = `抽成類別${nextNumber}`;

    const newCommissionItem: CommissionItem = {
      id: this.generateTempId(),
      commissionType: commissionType, // 🎯 自動帶值
      commissionTypeName: commissionTypeName, // 🎯 自動帶值
      taxType: 1,
      discountSummary: '尚未設定',
      transactionAmount: 0,
      specialCommission: 0,
      fullPointActivity: false,
      thousandDiscount: false,
      selectedSettingOption: 'discount',
      currentTab: 'discount',
      discountSettingItems: [],
      annualPerformanceItems: [],
      discountLevelItems: [],
      detailItems: [],
      _status: 'new',
      mainStartDate: this.getContractStartDate(),
      mainEndDate: this.getContractEndDate()
    };

    this.commissionData = [...this.commissionData, newCommissionItem];
    this.updateDetailItemsForDisplay();
    this.saveToWorkflow();

    console.log('✅ 新增抽成項目完成，ID:', newCommissionItem.id, '類別:', commissionType);
    this.notificationService.infoBubble(`已新增${commissionTypeName}`);
  }


  addDiscountSettingItem(item: CommissionItem): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法新增明細項目');
      return;
    }

    // 🎯 確保陣列存在
    if (!item.discountSettingItems) {
      item.discountSettingItems = [];
      console.log('📝 初始化 discountSettingItems 陣列');
    }

    const newItem = this.createDiscountSettingItem();
    newItem._status = 'new';
    newItem.id = this.generateTempId();

    item.discountSettingItems.push(newItem);
    console.log('✅ 新增折扣設定項目完成，新增後數量:', item.discountSettingItems.length);

    // 🎯 重要：直接將新項目加入 detailItems，不要重新構建整個陣列
    if (item.currentTab === 'discount') {
      const displayItem = {
        ...newItem,
        _originalType: 'discount'
      };
      item.detailItems.push(displayItem);
      console.log('✅ 已將新項目加入 detailItems');
    }

    // 🎯 標記主項目為已修改
    if (item._status === 'original') {
      item._status = 'modified';
    }
  }

  addAnnualPerformanceItem(item: CommissionItem): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法新增明細項目');
      return;
    }
    // 🎯 確保陣列存在
    if (!item.annualPerformanceItems) {
      item.annualPerformanceItems = [];
      console.log('📝 初始化 annualPerformanceItems 陣列');
    }

    const newItem = this.createAnnualPerformanceItem();
    newItem._status = 'new';
    newItem.id = this.generateTempId();

    item.annualPerformanceItems.push(newItem);
    console.log('✅ 新增年度業績項目完成，新增後數量:', item.annualPerformanceItems.length);

    // 🎯 重要：直接將新項目加入 detailItems，不要重新構建整個陣列
    if (item.currentTab === 'annual') {
      const displayItem = {
        ...newItem,
        _originalType: 'annual'
      };
      item.detailItems.push(displayItem);
      console.log('✅ 已將新項目加入 detailItems');
    }

    // 🎯 標記主項目為已修改
    if (item._status === 'original') {
      item._status = 'modified';
    }
  }

  addDiscountLevelItem(item: CommissionItem): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法新增明細項目');
      return;
    }
    // 🎯 確保陣列存在
    if (!item.discountLevelItems) {
      item.discountLevelItems = [];
      console.log('📝 初始化 discountLevelItems 陣列');
    }

    const newItem = this.createDiscountLevelItem();
    newItem._status = 'new';
    newItem.id = this.generateTempId();

    item.discountLevelItems.push(newItem);
    console.log('✅ 新增折扣層級項目完成，新增後數量:', item.discountLevelItems.length);

    // 🎯 重要：直接將新項目加入 detailItems，不要重新構建整個陣列
    if (item.currentTab === 'level') {
      const displayItem = {
        ...newItem,
        _originalType: 'level'
      };
      item.detailItems.push(displayItem);
      console.log('✅ 已將新項目加入 detailItems');
    }

    // 🎯 標記主項目為已修改
    if (item._status === 'original') {
      item._status = 'modified';
    }
  }


  removeDiscountSettingItem(item: CommissionItem, index: number): void {
    const target = item.discountSettingItems[index];
    if (target._status === 'new') {
      item.discountSettingItems.splice(index, 1);
    } else {
      target._status = 'deleted';
    }
    this.saveToWorkflow();
  }

  removeAnnualPerformanceItem(item: CommissionItem, index: number): void {
    const target = item.annualPerformanceItems[index];
    if (target._status === 'new') {
      item.annualPerformanceItems.splice(index, 1);
    } else {
      target._status = 'deleted';
    }

    this.saveToWorkflow();
  }

  removeDiscountLevelItem(item: CommissionItem, index: number): void {
    const target = item.discountLevelItems[index];
    if (target._status === 'new') {
      item.discountLevelItems.splice(index, 1);
    } else {
      target._status = 'deleted';
    }

    this.saveToWorkflow();
  }

  // 表格事件處理
  onItemEdit(item: any): void {
  }

  onItemSave(event: { oldData: any, newData: any }): void {
    console.log('💾 主表格儲存事件:', event);

    const { oldData, newData } = event;
    const hasMainDataChanges = this.hasMainDataChanges(oldData, newData);

    if (hasMainDataChanges && oldData._status === 'original') {
      newData._status = 'modified';
      console.log(`📝 主項目 ${newData.commissionType} 有變更，標記為 modified`);
    } else if (!newData._status && !this.hasItemId(newData)) {
      newData._status = 'new';
      console.log(`🆕 主項目 ${newData.commissionType} 是新項目，標記為 new`);
    }

    const index = this.commissionData.findIndex(item => item.id === newData.id);
    if (index > -1) {
      this.commissionData[index] = { ...newData };
    }

    this.syncDetailItemsToSource(newData);
    this.updateDetailItemsForDisplay();
    this.saveToWorkflow();

    console.log('💾 主表格儲存完成，當前狀態:', newData._status);
  }

  private hasMainDataChanges(oldData: any, newData: any): boolean {
    const mainFields = [
      'commissionType', 'commissionTypeName', 'taxType',
      'transactionAmount', 'specialCommission',
      'fullPointActivity', 'thousandDiscount'
    ];

    return mainFields.some(field =>
      this.normalizeValue(oldData[field]) !== this.normalizeValue(newData[field])
    );
  }

  private normalizeValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    if (value instanceof Date) return value.getTime().toString();
    if (typeof value === 'string') return value.trim();
    return String(value);
  }

  syncDetailItemsToSource(itemData: CommissionItem): void {
    switch (this.selectedSettingTab) {
      case 'discount':
        itemData.discountSettingItems = [];
        itemData.detailItems.forEach(detail => {
          itemData.discountSettingItems.push({ ...detail });
        });
        break;
      case 'annual':
        itemData.annualPerformanceItems = [];
        itemData.detailItems.forEach(detail => {
          itemData.annualPerformanceItems.push({ ...detail });
        });
        break;
      case 'level':
        itemData.discountLevelItems = [];
        itemData.detailItems.forEach(detail => {
          itemData.discountLevelItems.push({ ...detail });
        });
        break;
    }
  }

  onItemCancel(item: any): void { }

  onDropdownChange(event: { rowData: any, field: string, newValue: any, oldValue: any }): void {
    console.log('🔄 下拉選單變更:', event);

    const { rowData, field, newValue, oldValue } = event;
    rowData[field] = newValue;

    if (rowData._status === 'original' && newValue !== oldValue) {
      rowData._status = 'modified';
      console.log(`📝 下拉選單變更，標記為 modified: ${field} = ${newValue}`);
    } else if (!rowData._status) {
      rowData._status = 'new';
    }

    const parentData = this.findParentCommissionItem(rowData);
    if (parentData) {
      this.syncDetailBackToSource(rowData, parentData);
    }

    this.saveToWorkflow();
  }

  private findParentCommissionItem(detailData: any): CommissionItem | null {
    for (const commissionItem of this.commissionData) {
      const foundInDiscount = commissionItem.discountSettingItems.some(item => item.id === detailData.id);
      const foundInAnnual = commissionItem.annualPerformanceItems.some(item => item.id === detailData.id);
      const foundInLevel = commissionItem.discountLevelItems.some(item => item.id === detailData.id);

      if (foundInDiscount || foundInAnnual || foundInLevel) {
        return commissionItem;
      }
    }
    return null;
  }

  onDetailSave(event: { oldData: any, newData: any, parentData: any }): void {
    console.log('💾 明細表格儲存事件:', event);

    const { oldData, newData, parentData } = event;

    if (!newData.id) {
      newData.id = oldData.id || this.generateTempId();
    }

    this.logFieldChanges(oldData, newData);
    const hasDetailChanges = this.hasDetailDataChanges(oldData, newData);

    if (hasDetailChanges || !newData._status) {
      if (oldData._status === 'original' && hasDetailChanges) {
        newData._status = 'modified';
        console.log(`📝 明細項目有變更，標記為 modified`);
      } else if (!newData._status || newData._status === 'new') {
        newData._status = newData._status || 'new';
        console.log(`🆕 明細項目標記為 ${newData._status}`);
      }
    }

    this.ensureDetailFieldValues(newData);
    this.syncDetailBackToSource(newData, parentData);
    this.syncToDetailItems(newData, parentData);

    // 🎯 不要在這裡調用 updateDetailItemsForDisplay，避免刷新其他項目
    // this.updateDetailItemsForDisplay();

    this.saveToWorkflow();

    console.log('💾 明細表格儲存完成，當前狀態:', newData._status);
  }

  private syncToDetailItems(detailData: any, parentData: CommissionItem): void {
    const detailIndex = parentData.detailItems.findIndex(item => item.id === detailData.id);
    if (detailIndex > -1) {
      parentData.detailItems[detailIndex] = { ...detailData };
      console.log(`✅ 已同步更新 detailItems [${detailIndex}]`);
    }
  }

  private logFieldChanges(oldData: any, newData: any): void {
    let fieldsToCheck: string[] = [];

    switch (this.selectedSettingTab) {
      case 'discount':
        fieldsToCheck = ['cag_barcode', 'startDate', 'endDate', 'rate'];
        break;
      case 'annual':
        fieldsToCheck = ['startDate', 'endDate', 'discountAmount', 'rate'];
        break;
      case 'level':
        fieldsToCheck = ['cag_barcode', 'startAmount', 'endAmount', 'rate'];
        break;
    }

    console.log('🔍 欄位變更檢查:');
    fieldsToCheck.forEach(field => {
      const oldValue = oldData[field];
      const newValue = newData[field];

      if (this.normalizeValue(oldValue) !== this.normalizeValue(newValue)) {
        console.log(`🔄 欄位變更 ${field}: "${oldValue}" → "${newValue}"`);
      } else {
        console.log(`⚪ 欄位無變更 ${field}: "${oldValue}"`);
      }
    });
  }

  private ensureDetailFieldValues(detailData: any): void {
    switch (this.selectedSettingTab) {
      case 'discount':
        if (detailData.cag_barcode === undefined || detailData.cag_barcode === null) {
          detailData.cag_barcode = '';
        }
        if (detailData.rate === undefined || detailData.rate === null || detailData.rate === '') {
          detailData.rate = 0;
        } else {
          detailData.rate = Number(detailData.rate);
        }
        if (!detailData.startDate) {
          detailData.startDate = this.contractInfoData[0]?.tlt_bdate
            ? new Date(this.contractInfoData[0].tlt_bdate)
            : new Date();
        }
        if (!detailData.endDate) {
          detailData.endDate = this.contractInfoData[0]?.tlt_edate
            ? new Date(this.contractInfoData[0].tlt_edate)
            : new Date();
        }
        break;

      case 'annual':
        if (!detailData.startDate) {
          detailData.startDate = new Date();
        }
        if (!detailData.endDate) {
          detailData.endDate = new Date();
        }
        if (detailData.discountAmount === undefined || detailData.discountAmount === null || detailData.discountAmount === '') {
          detailData.discountAmount = 0;
        } else {
          detailData.discountAmount = Number(detailData.discountAmount);
        }
        if (detailData.rate === undefined || detailData.rate === null || detailData.rate === '') {
          detailData.rate = 0;
        } else {
          detailData.rate = Number(detailData.rate);
        }
        break;

      case 'level':
        if (detailData.cag_barcode === undefined || detailData.cag_barcode === null) {
          detailData.cag_barcode = '';
        }
        if (detailData.startAmount === undefined || detailData.startAmount === null || detailData.startAmount === '') {
          detailData.startAmount = 0;
        } else {
          detailData.startAmount = Number(detailData.startAmount);
        }
        if (detailData.endAmount === undefined || detailData.endAmount === null || detailData.endAmount === '') {
          detailData.endAmount = 0;
        } else {
          detailData.endAmount = Number(detailData.endAmount);
        }
        if (detailData.rate === undefined || detailData.rate === null || detailData.rate === '') {
          detailData.rate = 0;
        } else {
          detailData.rate = Number(detailData.rate);
        }
        break;
    }
  }

  private syncDetailBackToSource(detailData: any, parentData: CommissionItem): void {
    console.log('🔄 同步明細資料回主資料結構:', detailData);

    // 🎯 修正：使用項目的 currentTab 而不是全域的 selectedSettingTab
    const currentTab = parentData.currentTab || 'discount';
    console.log('🔄 當前項目標籤:', currentTab);

    switch (currentTab) {
      case 'discount':
        const discountIndex = parentData.discountSettingItems.findIndex(item => item.id === detailData.id);
        if (discountIndex > -1) {
          parentData.discountSettingItems[discountIndex] = {
            ...parentData.discountSettingItems[discountIndex],
            ...detailData,
            cag_barcode: detailData.cag_barcode || '',
            rate: detailData.rate || 0,
            startDate: detailData.startDate || new Date(),
            endDate: detailData.endDate || new Date(),
            _status: detailData._status || 'original'
          };
          console.log(`✅ 已更新折扣設定項目 [${discountIndex}]:`, parentData.discountSettingItems[discountIndex]);
        }
        break;

      case 'annual':
        const annualIndex = parentData.annualPerformanceItems.findIndex(item => item.id === detailData.id);
        if (annualIndex > -1) {
          parentData.annualPerformanceItems[annualIndex] = {
            ...parentData.annualPerformanceItems[annualIndex],
            ...detailData,
            startDate: detailData.startDate || new Date(),
            endDate: detailData.endDate || new Date(),
            discountAmount: detailData.discountAmount || 0,
            rate: detailData.rate || 0,
            _status: detailData._status || 'original'
          };
          console.log(`✅ 已更新年度業績項目 [${annualIndex}]:`, parentData.annualPerformanceItems[annualIndex]);
        }
        break;

      case 'level':
        const levelIndex = parentData.discountLevelItems.findIndex(item => item.id === detailData.id);
        if (levelIndex > -1) {
          parentData.discountLevelItems[levelIndex] = {
            ...parentData.discountLevelItems[levelIndex],
            ...detailData,
            cag_barcode: detailData.cag_barcode || '',
            startAmount: detailData.startAmount || 0,
            endAmount: detailData.endAmount || 0,
            rate: detailData.rate || 0,
            _status: detailData._status || 'original'
          };
          console.log(`✅ 已更新層級抽成項目 [${levelIndex}]:`, parentData.discountLevelItems[levelIndex]);
        }
        break;
    }

    const mainIndex = this.commissionData.findIndex(item => item.id === parentData.id);
    if (mainIndex > -1) {
      this.commissionData[mainIndex] = { ...parentData };
      console.log(`✅ 已同步更新主資料陣列項目 [${mainIndex}]`);
    }
  }

  private hasDetailDataChanges(oldData: any, newData: any): boolean {
    console.log('🔍 檢查明細資料變更:', { oldData, newData, selectedTab: this.selectedSettingTab });

    let fieldsToCheck: string[] = [];

    switch (this.selectedSettingTab) {
      case 'discount':
        fieldsToCheck = ['cag_barcode', 'startDate', 'endDate', 'rate'];
        break;
      case 'annual':
        fieldsToCheck = ['startDate', 'endDate', 'discountAmount', 'rate'];
        break;
      case 'level':
        fieldsToCheck = ['cag_barcode', 'startAmount', 'endAmount', 'rate'];
        break;
      default:
        return false;
    }

    const hasChanges = fieldsToCheck.some(field => {
      const oldValue = this.normalizeValue(oldData[field]);
      const newValue = this.normalizeValue(newData[field]);
      const changed = oldValue !== newValue;

      if (changed) {
        console.log(`🔍 欄位 ${field} 有變更: "${oldValue}" → "${newValue}"`);
      }

      return changed;
    });

    console.log('🔍 檢查結果:', hasChanges ? '有變更' : '無變更');
    return hasChanges;
  }

  onDetailCancel(item: CommissionItem): void {
    this.updateDetailItemsForDisplay();
  }

  onDetailClear(item: CommissionItem, settingType: string): void {
    switch (settingType) {
      case 'discount':
        item.discountSettingItems.forEach(i => {
          i.selected = false;
          i.cag_barcode = '';
          i.rate = 0;
          i.startDate = this.contractInfoData[0]?.tlt_bdate
            ? new Date(this.contractInfoData[0].tlt_bdate)
            : new Date();
          i.endDate = this.contractInfoData[0]?.tlt_edate
            ? new Date(this.contractInfoData[0].tlt_edate)
            : new Date();
        });
        break;
      case 'annual':
        item.annualPerformanceItems.forEach(i => {
          i.selected = false;
          i.discountAmount = 0;
          i.rate = 0;
          i.startDate = new Date();
          i.endDate = new Date();
        });
        break;
      case 'level':
        item.discountLevelItems.forEach(i => {
          i.selected = false;
          i.cag_barcode = '';
          i.startAmount = 0;
          i.endAmount = 0;
          i.rate = 0;
        });
        break;
    }
    this.updateDetailItemsForDisplay();
  }

  formatDate(date: Date): string {
    if (!date) return '';

    try {
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  }

  onRowSave(event: any) {
    if (event && 'oldData' in event && 'newData' in event) {
      this.saveCommissionDataToWorkflow();
    }
  }

  onRowCancel(event: any) {
  }

  onDetailEdit(event: any): void {
  }

  onDetailTabChange(event: { rowData: any, tabId: string }) {
    const { rowData, tabId } = event;

    console.log('🔄 內層標籤變更:', {
      itemId: rowData.id,
      from: rowData.currentTab || 'discount',
      to: tabId
    });

    // 🎯 先保存當前標籤的資料
    this.saveItemTabDataBeforeSwitch(rowData);

    // 🎯 設定新的標籤
    rowData.currentTab = tabId;

    // 🎯 只更新這個項目的顯示
    this.refreshSingleItemDetailDisplay(rowData);

    console.log('✅ 內層標籤切換完成');
  }

  private saveItemTabDataBeforeSwitch(commissionItem: CommissionItem): void {
    const currentTab = commissionItem.currentTab || 'discount';
    console.log('💾 保存項目標籤資料，項目ID:', commissionItem.id, '當前標籤:', currentTab);

    if (commissionItem.detailItems && commissionItem.detailItems.length > 0) {
      const currentTypeItems = commissionItem.detailItems.filter(item =>
        !item._originalType || item._originalType === currentTab
      );

      switch (currentTab) {
        case 'discount':
          commissionItem.discountSettingItems = currentTypeItems.map(item => ({
            id: item.id,
            selected: item.selected || false,
            cag_barcode: item.cag_barcode || '',
            startDate: item.startDate || new Date(),
            endDate: item.endDate || new Date(),
            rate: item.rate || 0,
            _status: item._status || (this.hasItemId(item) ? 'original' : 'new')
          }));
          break;

        case 'annual':
          commissionItem.annualPerformanceItems = currentTypeItems.map(item => ({
            id: item.id,
            selected: item.selected || false,
            startDate: item.startDate || new Date(),
            endDate: item.endDate || new Date(),
            discountAmount: item.discountAmount || 0,
            rate: item.rate || 0,
            _status: item._status || (this.hasItemId(item) ? 'original' : 'new')
          }));
          break;

        case 'level':
          commissionItem.discountLevelItems = currentTypeItems.map(item => ({
            id: item.id,
            selected: item.selected || false,
            cag_barcode: item.cag_barcode || '',
            startAmount: item.startAmount || 0,
            endAmount: item.endAmount || 0,
            rate: item.rate || 0,
            _status: item._status || (this.hasItemId(item) ? 'original' : 'new')
          }));
          break;
      }
    }

    this.saveToWorkflow();
  }

  private updateSingleItemDetailDisplay(commissionItem: CommissionItem): void {
    const currentTab = commissionItem.currentTab || 'discount';
    console.log('🔄 更新單一項目顯示資料，項目ID:', commissionItem.id, '標籤:', currentTab);

    // 🎯 使用 refreshSingleItemDetailDisplay 來避免重複代碼
    this.refreshSingleItemDetailDisplay(commissionItem);

    // 🎯 只更新這一個項目在主陣列中的引用
    const itemIndex = this.commissionData.findIndex(item => item.id === commissionItem.id);
    if (itemIndex > -1) {
      this.commissionData[itemIndex] = { ...commissionItem };
    }
  }

  onBatchDelete(selectedItems: any[]) {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法刪除項目');
      return;
    }
    if (confirm(`確定要刪除選取的 ${selectedItems.length} 個項目嗎？`)) {
      selectedItems.forEach(item => {
        if (item._status === 'new' || !this.hasItemId(item)) {
          const index = this.commissionData.findIndex(x => x.id === item.id);
          if (index > -1) {
            this.commissionData.splice(index, 1);
          }
        } else {
          item._status = 'deleted';
        }
      });

      this.saveToWorkflow();
    }
  }

  get visibleCommissionData() {
    return this.commissionData.filter(item => item._status !== 'deleted');
  }

  get currentCommissionType(): string {
    // 優先從合約資訊表格資料中取得
    if (this.contractInfoData && this.contractInfoData.length > 0) {
      return this.contractInfoData[0].tlt_term_type || '3';
    }

    // 備用：從 Step1 資料取得
    const step1Data = this.contractFlowService.getStep1Data();
    if (step1Data?.tlt_term_type) {
      return step1Data.tlt_term_type.toString();
    }

    // 預設值
    return '3';
  }

  // 🎯 判斷是否為一般抽成（簡潔版本）
  get isGeneralCommissionMode(): boolean {
    return this.currentCommissionType === '3';
  }

  // 🎯 取得按鈕類型（簡潔版本）
  getNextButtonType(): "submit" | "create" {
    return this.isGeneralCommissionMode ? 'submit' : 'create';
  }

  // 🎯 取得按鈕標籤（簡潔版本）
  getNextButtonLabel(): string {
    return this.isGeneralCommissionMode ? '確認' : '下一步(租金設定)';
  }

  onAddDetailItem(parentData: any) {
    // 檢查 parentData 是否有 currentTab
    if (!parentData.currentTab) {
      console.warn('⚠️ parentData 沒有 currentTab，設定為預設值 discount');
      parentData.currentTab = 'discount';
    }

    this.addDetailItem(parentData);
  }

  onDetailBatchDelete(event: { selectedDetails: any[], parentData: any, rowIndex: number }) {
    const { selectedDetails, parentData } = event;

    console.log('🔍 DEBUG 批次刪除明細:', {
      selectedCount: selectedDetails.length,
      parentId: parentData.id,
      parentCurrentTab: parentData.currentTab,
      selectedDetailIds: selectedDetails.map(d => d.id)
    });

    if (confirm(`確定要刪除選取的 ${selectedDetails.length} 個明細項目嗎？`)) {
      selectedDetails.forEach(detail => {
        console.log(`🔍 處理刪除項目 ${detail.id}, _status: ${detail._status}`);

        if (detail._status === 'new' || !this.hasItemId(detail)) {
          console.log(`🗑️ 直接移除新項目 ${detail.id}`);
          this.removeDetailFromArrays(detail, parentData);
        } else {
          console.log(`🏷️ 標記已存在項目為已刪除 ${detail.id}`);
          detail._status = 'deleted';
          this.markDetailAsDeleted(detail, parentData);
        }
      });

      // 🎯 重要：只更新這個項目的顯示
      this.updateSingleItemDetailDisplay(parentData);
      this.saveCommissionDataToWorkflow();

      console.log(`✅ 已處理 ${selectedDetails.length} 個明細項目的刪除`);
    }
  }

  private removeDetailFromArrays(detail: any, parentData: CommissionItem): void {
    // 🎯 修正：使用項目的 currentTab 而不是全域的 selectedSettingTab
    const currentTab = parentData.currentTab || 'discount';

    console.log('🗑️ 從陣列中移除明細項目:', {
      detailId: detail.id,
      parentId: parentData.id,
      currentTab: currentTab
    });

    switch (currentTab) {
      case 'discount':
        const discountIndex = parentData.discountSettingItems.findIndex(d => d.id === detail.id);
        if (discountIndex > -1) {
          parentData.discountSettingItems.splice(discountIndex, 1);
          console.log(`✅ 已從 discountSettingItems 移除項目 [${discountIndex}]`);
        } else {
          console.warn(`⚠️ 在 discountSettingItems 中找不到項目 ${detail.id}`);
        }
        break;
      case 'annual':
        const annualIndex = parentData.annualPerformanceItems.findIndex(d => d.id === detail.id);
        if (annualIndex > -1) {
          parentData.annualPerformanceItems.splice(annualIndex, 1);
          console.log(`✅ 已從 annualPerformanceItems 移除項目 [${annualIndex}]`);
        } else {
          console.warn(`⚠️ 在 annualPerformanceItems 中找不到項目 ${detail.id}`);
        }
        break;
      case 'level':
        const levelIndex = parentData.discountLevelItems.findIndex(d => d.id === detail.id);
        if (levelIndex > -1) {
          parentData.discountLevelItems.splice(levelIndex, 1);
          console.log(`✅ 已從 discountLevelItems 移除項目 [${levelIndex}]`);
        } else {
          console.warn(`⚠️ 在 discountLevelItems 中找不到項目 ${detail.id}`);
        }
        break;
    }
  }

  private markDetailAsDeleted(detail: any, parentData: CommissionItem): void {
    // 🎯 修正：使用項目的 currentTab 而不是全域的 selectedSettingTab
    const currentTab = parentData.currentTab || 'discount';

    console.log('🏷️ 標記明細項目為已刪除:', {
      detailId: detail.id,
      parentId: parentData.id,
      currentTab: currentTab
    });

    switch (currentTab) {
      case 'discount':
        const discountItem = parentData.discountSettingItems.find(d => d.id === detail.id);
        if (discountItem) {
          discountItem._status = 'deleted';
          console.log(`✅ 已標記 discountSettingItems 中的項目為已刪除`);
        } else {
          console.warn(`⚠️ 在 discountSettingItems 中找不到項目 ${detail.id}`);
        }
        break;
      case 'annual':
        const annualItem = parentData.annualPerformanceItems.find(d => d.id === detail.id);
        if (annualItem) {
          annualItem._status = 'deleted';
          console.log(`✅ 已標記 annualPerformanceItems 中的項目為已刪除`);
        } else {
          console.warn(`⚠️ 在 annualPerformanceItems 中找不到項目 ${detail.id}`);
        }
        break;
      case 'level':
        const levelItem = parentData.discountLevelItems.find(d => d.id === detail.id);
        if (levelItem) {
          levelItem._status = 'deleted';
          console.log(`✅ 已標記 discountLevelItems 中的項目為已刪除`);
        } else {
          console.warn(`⚠️ 在 discountLevelItems 中找不到項目 ${detail.id}`);
        }
        break;
    }
  }

  // 導航方法
  onSubmitNext(): void {
    if (this.isViewMode) {
      // 🎯 檢視模式：直接導航，不帶參數
      this.router.navigate(['account/tls/tls13010next3']);
      return;
    }

    // 編輯模式：原有邏輯
    this.saveCommissionDataToWorkflow();

    const hasCommissionItems = this.commissionData.length > 0;
    if (!hasCommissionItems) {
      this.notificationService.warnBubble('請至少設定一個抽成項目');
      return;
    }

    if (this.isGeneralCommissionMode) {
      const validation = this.validateGeneralCommissionData();
      if (!validation.isValid) {
        this.notificationService.warnBubble(validation.errors[0]);
        return;
      }
      this.showConfirmDialog = true;
    } else {
      this.router.navigate(['account/tls/tls13010next3']);
    }
  }

  onConfirmDialogResult(confirmed: boolean): void {
    this.showConfirmDialog = false;
    if (confirmed) {
      this.submitGeneralCommissionContract();
    }
  }

  private validateGeneralCommissionData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 🎯 使用新的驗證方法
    try {
      const validation = this.contractFlowService.validateCleanSubmitData(
        this.contractFlowService.generateCleanSubmitData()
      );

      return {
        isValid: validation.isValid,
        errors: validation.errors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`資料驗證過程發生錯誤: ${error}`]
      };
    }
  }

  override onCancel(): void {
    if (this.isViewMode) {
      // 🎯 檢視模式：返回上一步，不帶參數
      this.router.navigate(['account/tls/tls13010next1']);
      return;
    }

    // 編輯模式：原有邏輯
    this.saveCommissionDataToWorkflow();
    this.router.navigate(['account/tls/tls13010next1']);
  }

  onRealCancel(): void {
    if (confirm('確定要離開契約編輯流程嗎？所有暫存資料將會保留。')) {
      this.saveCommissionDataToWorkflow();
      this.router.navigate(['account/tls/tls13010']);
      this.notificationService.infoBubble('已離開契約編輯流程');
    }
  }

  onClearAndExit(): void {
    this.contractFlowService.clearTempData();
    this.router.navigate(['account/tls/tls13010']);
    this.notificationService.infoBubble('已清空暫存資料並離開');
  }

  private hasItemId(item: any): boolean {
    return item.id && item.id !== 'temp_' && !item.id.toString().startsWith('temp_');
  }

  getCommissionItemCount(): number {
    return this.commissionData.filter(item => item._status !== 'deleted').length;
  }

  reloadData(): void {
    if (confirm('確定要重新載入資料嗎？未儲存的變更將會遺失。')) {
      // this.loadCommissionData();
      this.notificationService.infoBubble('已重新載入資料');
    }
  }

  saveAllChanges(): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法儲存變更');
      return;
    }
    this.saveCommissionDataToWorkflow();
    this.notificationService.successBubble('所有變更已儲存');
  }

  private submitGeneralCommissionContract(): void {
    console.log('📤 Next2: 開始送出一般抽成合約（使用清理後資料）...');

    // 顯示載入中
    this.loading = true;
    this.notificationService.blockUi();

    try {
      // 🎯 使用新的清理資料方法
      const cleanSubmitData = this.contractFlowService.generateCleanSubmitData();

      console.log('🚀 Next2: 最終送出的完整 JSON:');
      console.log(JSON.stringify(cleanSubmitData, null, 2));

      if (cleanSubmitData.commissionTypeChange?.HasChanged) {
        const changeInfo = cleanSubmitData.commissionTypeChange;
        const warningMessage = `⚠️ 抽成別已變更：${this.getTermTypeName(changeInfo.OriginalTermType)} → ${this.getTermTypeName(changeInfo.NewTermType)}\n原有條件設定將被清除。`;

        if (!confirm(`${warningMessage}\n\n確定要繼續送出嗎？`)) {
          this.loading = false;
          this.notificationService.unblockUi();
          return;
        }
      }

      // 🎯 驗證資料
      const validation = this.contractFlowService.validateCleanSubmitData(cleanSubmitData);

      if (!validation.isValid) {
        console.error('❌ Next2: 資料驗證失敗:', validation.errors);
        this.loading = false;
        this.notificationService.unblockUi();
        this.notificationService.errorBubble(`資料驗證失敗: ${validation.errors[0]}`);
        return;
      }

      // 🎯 顯示警告（如果有）
      if (validation.warnings.length > 0) {
        console.warn('⚠️ Next2: 提交警告:', validation.warnings);
        validation.warnings.forEach(warning => {
          this.notificationService.warnBubble(warning);
        });
      }

      // 🎯 調用真實的 API
      this.callCleanSubmitAPI(cleanSubmitData);

    } catch (error) {
      console.error('❌ Next2: 準備提交資料時發生錯誤:', error);
      this.loading = false;
      this.notificationService.unblockUi();
      this.notificationService.errorBubble(`準備提交資料時發生錯誤: ${error}`);
    }
  }

  private callCleanSubmitAPI(cleanData: CleanSubmitData): void {
    console.log('📤 Next2: 調用真實 API 提交契約資料...');

    // 🎯 調用真實的 API
    this.tls13010Service.submitFinalTLS13010(cleanData).subscribe({
      next: (response) => {
        console.log('✅ Next2: 契約提交成功:', response);
        this.handleSubmitSuccess(response);
      },
      error: (error) => {
        console.error('❌ Next2: 契約提交失敗:', error);
        this.handleSubmitError(error);
      }
    });
  }

  private handleSubmitSuccess(response: any): void {
    this.loading = false;
    this.notificationService.unblockUi();

    console.log('🎉 Next2: 處理提交成功回應:', response);

    // 🎯 顯示成功訊息
    let successMessage = '契約資料提交成功！';
    if (response.talentId) {
      successMessage += `\n專櫃編號: ${response.talentId}`;
    }
    if (response.contractNo) {
      successMessage += `\n合約編號: ${response.contractNo}`;
    }
    if (response.totalProcessed) {
      successMessage += `\n處理項目數: ${response.totalProcessed}`;
    }

    this.notificationService.successBubble(successMessage);

    // 🎯 顯示警告（如果有）
    if (response.warnings && response.warnings.length > 0) {
      response.warnings.forEach((warning: string) => {
        this.notificationService.warnBubble(warning);
      });
    }

    // 🎯 提交成功後清理暫存並導航
    this.contractFlowService.onSubmitSuccess();

    // 🎯 延遲導航，讓使用者看到成功訊息
    setTimeout(() => {
      this.router.navigate(['account/tls/tls13010']);
    }, 2000);
  }

  private handleSubmitError(error: any): void {
    this.loading = false;
    this.notificationService.unblockUi();

    console.error('💥 Next2: 處理提交錯誤:', error);

    let errorMessage = '契約資料提交失敗';

    // 🎯 解析錯誤訊息
    if (error?.error?.Message) {
      errorMessage += `: ${error.error.Message}`;
    } else if (error?.message) {
      errorMessage += `: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage += `: ${error}`;
    }

    // 🎯 特殊錯誤處理
    if (error?.status === 400) {
      errorMessage = '資料格式錯誤，請檢查輸入內容';
    } else if (error?.status === 500) {
      errorMessage = '伺服器內部錯誤，請稍後重試或聯繫管理員';
    } else if (error?.status === 0) {
      errorMessage = '網路連線錯誤，請檢查網路狀態';
    }

    this.notificationService.errorBubble(errorMessage);

    // 🎯 記錄詳細錯誤資訊供除錯
    console.group('❌ Next2: 詳細錯誤資訊');
    console.log('Status:', error?.status);
    console.log('StatusText:', error?.statusText);
    console.log('Error Object:', error?.error);
    console.log('Full Error:', error);
    console.groupEnd();
  }

  getDeductionItemCount(): number {
    const step2Data = this.contractFlowService.getStep2Data();
    return Array.isArray(step2Data) ? step2Data.filter(item => item._status !== 'deleted').length : 0;
  }

  private getTermTypeName(termType: string): string {
    switch (termType) {
      case '1': return '固定租金';
      case '2': return '底租抽成取高者';
      case '3': return '一般抽成';
      case '4': return '包底抽成';
      case '5': return '階梯式抽成';
      case '6': return '包底加階梯';
      default: return `未知類型(${termType})`;
    }
  }

  private getContractStartDate(): string {
    // 🎯 第一優先：從合約資訊表格取得（你上方顯示的 tlt_bdate）
    if (this.contractInfoData && this.contractInfoData.length > 0) {
      const startDate = this.contractInfoData[0].tlt_bdate;
      if (startDate) {
        console.log('📅 從合約資訊表格取得起始日:', startDate);
        return typeof startDate === 'string' ? startDate : this.formatDateToString(startDate);
      }
    }

    // 🎯 第二優先：從 Step1 暫存資料取得
    const step1Data = this.contractFlowService.getStep1Data();
    if (step1Data?.tlt_bdate) {
      console.log('📅 從 Step1 取得起始日:', step1Data.tlt_bdate);
      return typeof step1Data.tlt_bdate === 'string' ?
        step1Data.tlt_bdate : this.formatDateToString(step1Data.tlt_bdate);
    }

    // 🎯 最後備援：今天日期
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 使用預設起始日:', today);
    return today;
  }

  private getContractEndDate(): string {
    // 🎯 第一優先：從合約資訊表格取得（你上方顯示的 tlt_edate）
    if (this.contractInfoData && this.contractInfoData.length > 0) {
      const endDate = this.contractInfoData[0].tlt_edate;
      if (endDate) {
        console.log('📅 從合約資訊表格取得結束日:', endDate);
        return typeof endDate === 'string' ? endDate : this.formatDateToString(endDate);
      }
    }

    // 🎯 第二優先：從 Step1 暫存資料取得
    const step1Data = this.contractFlowService.getStep1Data();
    if (step1Data?.tlt_edate) {
      console.log('📅 從 Step1 取得結束日:', step1Data.tlt_edate);
      return typeof step1Data.tlt_edate === 'string' ?
        step1Data.tlt_edate : this.formatDateToString(step1Data.tlt_edate);
    }

    // 🎯 最後備援：今天 + 1年
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().split('T')[0];
    console.log('📅 使用預設結束日:', nextYearStr);
    return nextYearStr;
  }

  private formatDateToString(date: any): string {
    if (!date) return '';

    try {
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }

      if (typeof date === 'string') {
        // 如果已經是 YYYY-MM-DD 格式就直接回傳
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return date;
        }

        // 否則嘗試轉換
        return new Date(date).toISOString().split('T')[0];
      }

      return new Date(date).toISOString().split('T')[0];
    } catch (error) {
      console.error('日期格式化失敗:', error, '原始日期:', date);
      return new Date().toISOString().split('T')[0];
    }
  }


}
