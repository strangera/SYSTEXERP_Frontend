import { Component, OnInit, ViewChild, TemplateRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { CommissionDataService } from './Services/commission-data.service';
import { CommissionItemOperationsService } from './Services/commission-item-operations.service';
import { TLS13010Next2ColumnsConfig } from './Services/tls13010-next2-columns.config';
import { TLS13010Next2ValidationService } from './Services/tls13010-next2-validation.service';
import { TLS13010Next2EventHandlersService } from './Services/tls13010-next2-event-handlers.service';

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

  // 資料載入狀態控制
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

  contractInfoColumns: ColumnDef[] = [];
  discountColumns: ColumnDef[] = [];
  annualColumns: ColumnDef[] = [];
  levelColumns: ColumnDef[] = [];
  commissionColumns: ColumnDef[] = [];

  settingTabs = [
    {
      id: 'discount',
      label: '折扣設定',
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
    },
    {
      id: 'level',
      label: '折扣別層級抽成設定',
      allowAdd: false,
      allowBatchDelete: false,
      showCheckbox: false
    }
  ]
  // 數據
  commissionData: CommissionItem[] = [];

  // 下拉選項
  taxTypeOptions: any[] = [
    { label: '應稅', value: 1 },
    { label: '免稅', value: 2 }
  ];

  private discountOptions: any[] = [];

  constructor(
    private notificationService: NotificationService,
    private contractFlowService: ContractFlowService,
    private tls13010Service: TLS13010Service,
    private paperTypeService: LocationOptionsService,
    private route: ActivatedRoute,
    private commissionDataService: CommissionDataService,
    private itemOperationsService: CommissionItemOperationsService,
    private validationService: TLS13010Next2ValidationService,
    private eventHandlersService: TLS13010Next2EventHandlersService,
    private cdr: ChangeDetectorRef,
  ) {
    super();
    this.dataForm = this.formBuilder.group({});
    this.updateDetailColumns();
  }

  async ngOnInit(): Promise<void> {
    this.setupViewModeUI();
    this.initializePage('TLS13010', this.dataForm);

    try {
      // 初始化所有 columns
      this.initializeColumns();

      // 先載入折扣選項
      this.discountOptions = await this.commissionDataService.loadDiscountOptions();
      this.updateDiscountColumnOptions();

      await this.loadWorkflowData();
      this.setupAutoSave();
    } catch (error) {
      console.error('初始化失敗:', error);
      this.notificationService.errorBubble('頁面初始化失敗');
    }
  }

  private initializeColumns(): void {
    this.contractInfoColumns = TLS13010Next2ColumnsConfig.getContractInfoColumns();
    this.annualColumns = TLS13010Next2ColumnsConfig.getAnnualColumns();
    this.commissionColumns = TLS13010Next2ColumnsConfig.getCommissionColumns();
    // discountColumns 和 levelColumns 會在 updateDiscountColumnOptions 中設定
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
    return this.validationService.hasCommissionChanges(this.commissionData);
  }

  // private hasDetailItemChanges(commissionItem: CommissionItem): boolean {
  //   const hasDiscountChanges = commissionItem.discountSettingItems.some(item =>
  //     item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
  //   );

  //   const hasAnnualChanges = commissionItem.annualPerformanceItems.some(item =>
  //     item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
  //   );

  //   const hasLevelChanges = commissionItem.discountLevelItems.some(item =>
  //     item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
  //   );

  //   return hasDiscountChanges || hasAnnualChanges || hasLevelChanges;
  // }

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
  private updateDiscountColumnOptions(): void {
    console.log('🟢 更新折扣選項:', this.discountOptions);

    this.discountColumns = TLS13010Next2ColumnsConfig.getDiscountColumns(this.discountOptions);
    this.levelColumns = TLS13010Next2ColumnsConfig.getLevelColumns(this.discountOptions);

    this.updateDetailColumns();
  }

  private async loadWorkflowData(): Promise<void> {
    console.log('Next2 開始載入工作流程資料...');

    const workflowData = this.contractFlowService.getCurrentData();

    if (workflowData.contractId || this.contractFlowService.isNewContractMode()) {
      const modeInfo = this.contractFlowService.getWorkflowModeInfo();
      this.currentTalentId = modeInfo.talentId;
      this.currentContractData = workflowData?.queryRowData;

      Step3DataChangeTracker.setCurrentTalentId(this.currentTalentId || 'NEW_CONTRACT');

      this.prepareContractInfoDisplay();
      await this.loadCommissionDataUsingService();
    } else {
      console.warn('沒有有效的工作流程資料，重導向到前一步');
      this.router.navigate(['account/tls/tls13010cru']);
    }
  }

  private async loadCommissionDataUsingService(): Promise<void> {
    this.loading = true;

    try {
      const options = {
        talentId: this.currentTalentId,
        isNewContract: this.contractFlowService.isNewContractMode(),
        currentCommissionType: this.contractFlowService.getCurrentCommissionType(),
        contractStartDate: this.getContractStartDate(),
        contractEndDate: this.getContractEndDate(),
        discountOptions: this.discountOptions || []
      };

      const result = await this.commissionDataService.loadCommissionData(options);

      if (result.success) {
        this.handleLoadSuccess(result);
      } else {
        this.handleLoadError(result);
      }

    } catch (error) {
      console.error('載入抽成資料失敗:', error);
      this.notificationService.errorBubble('載入抽成資料失敗');
      this.initializeEmptyCommissionData();
    } finally {
      this.loading = false;
    }
  }

  private handleLoadSuccess(result: any): void {
    this.commissionData = result.data;
    this.commissionDataLoaded = true;
    this.dataLoaded = true;

    // 簡單粗暴的重置方案：強制所有項目回到 discount 狀態
    this.resetAllItemsToDiscountTab();

    this.saveCommissionDataToWorkflow();

    if (result.warnings?.length > 0) {
      result.warnings.forEach((warning: string) => {
        this.notificationService.warnBubble(warning);
      });
    }

    if (result.data.length > 0) {
      this.notificationService.infoBubble(`已載入 ${result.data.length} 個抽成項目`);
    }
  }

  private resetAllItemsToDiscountTab(): void {
    console.log('強制重置所有項目到 discount 標籤...');

    this.commissionData.forEach((item, index) => {
      // 1. 強制設定為 discount 標籤
      item.currentTab = 'discount';

      // 2. 確保有 discount 資料
      if (!item.discountSettingItems || item.discountSettingItems.length === 0) {
        // 如果沒有 discount 資料，初始化空的
        item.discountSettingItems = [];
      }

      // 3. 修復 discount 項目的日期（如果有缺失）
      this.fixDiscountItemDates(item);

      // 4. 直接設定 detailItems 為 discount 的內容
      item.detailItems = item.discountSettingItems
        .filter(discount => discount._status !== 'deleted')
        .map(discount => ({ ...discount, _originalType: 'discount' }));

      console.log(`項目 ${index + 1} 重置完成，discount 項目數: ${item.detailItems.length}`);
    });

    // 強制觸發 UI 更新
    this.cdr.detectChanges();
  }

  private fixDiscountItemDates(commissionItem: any): void {
    const contractStartDate = this.getContractStartDate();
    const contractEndDate = this.getContractEndDate();

    if (commissionItem.discountSettingItems) {
      commissionItem.discountSettingItems.forEach((discount: any, index: number) => {
        // 檢查並修復起始日期
        if (!discount.tlt_bdate || isNaN(new Date(discount.tlt_bdate).getTime())) {
          discount.tlt_bdate = new Date(contractStartDate);
          console.log(`修復 discount ${index + 1} 起始日期: ${contractStartDate}`);
        }

        // 檢查並修復結束日期
        if (!discount.tlt_edate || isNaN(new Date(discount.tlt_edate).getTime())) {
          discount.tlt_edate = new Date(contractEndDate);
          console.log(`修復 discount ${index + 1} 結束日期: ${contractEndDate}`);
        }
      });
    }
  }

  private handleLoadError(result: any): void {
    if (result.errors?.length > 0) {
      this.notificationService.errorBubble(result.errors[0]);
    }
    this.initializeEmptyCommissionData();
  }

  private prepareContractInfoDisplay(): void {
    console.log('📊 準備合約資訊顯示...');

    // 🎯 優先使用 CRU 頁面編輯後的資料
    const step1Data = this.contractFlowService.getStep1Data();
    console.log('📝 Step1 編輯資料:', step1Data);

    // 🎯 準備合約資訊
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

    console.log('📊 準備顯示的合約資訊:', contractInfo);

    this.contractInfoData = [{
      id: contractInfo.talent_id || 'new', // 🎯 新增模式顯示 'new'
      ...contractInfo
    }];

    console.log('📊 最終合約資訊陣列:', this.contractInfoData);
  }


  // 工具方法
  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
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
    return this.validationService.hasCommissionData(this.commissionData, this.dataLoaded);
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

      // 儲存到工作流程服務
      this.contractFlowService.saveStep3Data(processedData);


      console.log('✅ Next2 抽成資料儲存完成');

    } catch (error) {
      console.error('❌ Next2 儲存抽成資料失敗:', error);
      this.notificationService.errorBubble('儲存抽成資料失敗');
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
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法新增明細項目');
      return;
    }

    const currentTab = (rowData.currentTab || 'discount') as 'discount' | 'annual' | 'level';

    const result = this.itemOperationsService.addDetailItem(
      rowData,
      currentTab,
      this.getContractStartDate(),
      this.getContractEndDate()
    );

    if (result.success) {
      this.updateSingleItemDetailDisplay(rowData);
      this.saveCommissionDataToWorkflow();
    } else {
      this.notificationService.errorBubble(result.message || '新增失敗');
    }
  }

  // 只刷新單一項目的顯示，不影響其他項目
  private refreshSingleItemDetailDisplay(commissionItem: CommissionItem): void {
    const currentTab = commissionItem.currentTab || 'discount';

    let sourceArray: any[] = [];

    switch (currentTab) {
      case 'discount':
        sourceArray = commissionItem.discountSettingItems || [];
        break;
      case 'annual':
        sourceArray = commissionItem.annualPerformanceItems || [];
        break;
      case 'level':
        sourceArray = commissionItem.discountLevelItems || [];
        break;
    }

    // 修正：不管來源陣列是否為空，都要更新 detailItems
    const newDetailItems = sourceArray
      .filter(item => item._status !== 'deleted')
      .map(item => ({
        ...item,
        _originalType: currentTab
      }));

    commissionItem.detailItems = newDetailItems; // 直接設定，不保持舊值
  }

  removeDetailItem(rowData: CommissionItem, index: number): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法刪除項目');
      return;
    }

    const currentTab = (rowData.currentTab || 'discount') as 'discount' | 'annual' | 'level';

    const result = this.itemOperationsService.removeDetailItem(rowData, index, currentTab);

    if (result.success) {
      this.updateSingleItemDetailDisplay(rowData);
      this.saveCommissionDataToWorkflow();
    } else {
      this.notificationService.errorBubble(result.message || '刪除失敗');
    }
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
    console.log('更新顯示資料，當前全域標籤:', this.selectedSettingTab);

    this.commissionData.forEach((item, index) => {
      // 確保每個項目都有 currentTab
      if (!item.currentTab) {
        item.currentTab = 'discount';
      }

      // 關鍵修改：每次都強制更新 detailItems，不要依賴 shouldUpdate 判斷
      console.log(`強制更新項目 ${index} 的 detailItems`);
      this.refreshSingleItemDetailDisplay(item);
    });

    // 強制觸發變更檢測
    this.cdr.detectChanges();
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

  onAddCommissionItem(): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }

    const result = this.itemOperationsService.addCommissionItem(
      this.commissionData,
      this.getContractStartDate(),
      this.getContractEndDate(),
      this.discountOptions
    );

    if (result.success && result.newItem) {
      this.commissionData = [...this.commissionData, result.newItem];
      this.updateDetailItemsForDisplay();
      this.saveToWorkflow();
      this.notificationService.infoBubble(result.message || '新增完成');
    } else {
      this.notificationService.warnBubble(result.message || '新增失敗');
    }
  }

  // 表格事件處理
  onItemEdit(item: any): void {
  }

  onItemCancel(item: any): void { }

  onDetailCancel(item: CommissionItem): void {
    this.updateDetailItemsForDisplay();
  }

  onDetailClear(item: CommissionItem, settingType: string): void {
    switch (settingType) {
      case 'discount':
        item.discountSettingItems.forEach(i => {
          i.selected = false;
          i.cag_barcode = '';
          i.cag_charge_rate = 0;
          i.tlt_bdate = this.contractInfoData[0]?.tlt_bdate
            ? new Date(this.contractInfoData[0].tlt_bdate)
            : new Date();
          i.tlt_edate = this.contractInfoData[0]?.tlt_edate
            ? new Date(this.contractInfoData[0].tlt_edate)
            : new Date();
        });
        break;
      case 'annual':
        item.annualPerformanceItems.forEach(i => {
          i.selected = false;
          i.year_amount = 0;
          i.extra_rate = 0;
          i.tlt_bdate = new Date();
          i.tlt_edate = new Date();
        });
        break;
      case 'level':
        item.discountLevelItems.forEach(i => {
          i.selected = false;
          i.cag_barcode = '';
          i.level_bmount = 0;
          i.level_eamount = 0;
          i.level_charge_rate = 0;
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
            tlt_bdate: item.tlt_bdate || new Date(),
            tlt_edate: item.tlt_edate || new Date(),
            cag_charge_rate: item.cag_charge_rate || 0,
            _status: item._status || (this.hasItemId(item) ? 'original' : 'new'),
            is_configured: item.is_configured || false,
            is_enabled: item.is_enabled || false
          }));
          break;

        case 'annual':
          commissionItem.annualPerformanceItems = currentTypeItems.map(item => ({
            id: item.id,
            selected: item.selected || false,
            tlt_bdate: item.tlt_bdate || new Date(),
            tlt_edate: item.tlt_edate || new Date(),
            year_amount: item.year_amount || 0,
            extra_rate: item.extra_rate || 0,
            _status: item._status || (this.hasItemId(item) ? 'original' : 'new'),
            is_configured: item.is_configured || false,
            is_enabled: item.is_enabled || false
          }));
          break;

        case 'level':
          commissionItem.discountLevelItems = currentTypeItems.map(item => ({
            id: item.id,
            selected: item.selected || false,
            cag_barcode: item.cag_barcode || '',
            level_bmount: item.level_bmount || 0,
            level_eamount: item.level_eamount || 0,
            level_charge_rate: item.level_charge_rate || 0,
            _status: item._status || (this.hasItemId(item) ? 'original' : 'new'),
            is_configured: item.is_configured || false,
            is_enabled: item.is_enabled || false
          }));
          break;
      }
    }

    this.saveToWorkflow();
  }

  private updateSingleItemDetailDisplay(commissionItem: CommissionItem): void {
    // 使用 service 的方法
    this.itemOperationsService.updateItemDetailItems(commissionItem);

    // 更新主陣列中的引用
    const itemIndex = this.commissionData.findIndex(item => item.id === commissionItem.id);
    if (itemIndex > -1) {
      this.commissionData[itemIndex] = { ...commissionItem };
    }
  }

  // onBatchDelete(selectedItems: any[]) {
  //   if (this.isViewMode) {
  //     this.notificationService.infoBubble('檢視模式下無法刪除項目');
  //     return;
  //   }
  //   if (confirm(`確定要刪除選取的 ${selectedItems.length} 個項目嗎？`)) {
  //     selectedItems.forEach(item => {
  //       if (item._status === 'new' || !this.hasItemId(item)) {
  //         const index = this.commissionData.findIndex(x => x.id === item.id);
  //         if (index > -1) {
  //           this.commissionData.splice(index, 1);
  //         }
  //       } else {
  //         item._status = 'deleted';
  //       }
  //     });

  //     this.saveToWorkflow();
  //   }
  // }

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
  // 導航方法
  onSubmitNext(): void {
    if (this.isViewMode) {
      if (this.isGeneralCommissionMode) {
        // 一般抽成檢視：回到列表
        this.router.navigate(['account/tls/tls13010']);
        return;
      } else {
        // 其他抽成檢視：到 Next3
        this.router.navigate(['account/tls/tls13010next3']);
        return;
      }
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
    return this.validationService.validateGeneralCommissionData(this.commissionData);
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
    this.saveCommissionDataToWorkflow();
    this.router.navigate(['account/tls/tls13010']);
    this.notificationService.infoBubble('已離開契約編輯流程');
  }

  onClearAndExit(): void {
    this.contractFlowService.clearTempData();
    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };
    this.router.navigate(['account/tls/tls13010'], extras);
    this.messageService.infoBubble('已清空暫存資料並離開');
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
      const tlt_bdate = this.contractInfoData[0].tlt_bdate;
      if (tlt_bdate) {
        console.log('📅 從合約資訊表格取得起始日:', tlt_bdate);
        return typeof tlt_bdate === 'string' ? tlt_bdate : this.formatDateToString(tlt_bdate);
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
      const tlt_edate = this.contractInfoData[0].tlt_edate;
      if (tlt_edate) {
        console.log('📅 從合約資訊表格取得結束日:', tlt_edate);
        return typeof tlt_edate === 'string' ? tlt_edate : this.formatDateToString(tlt_edate);
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
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return '';

      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('日期格式化失敗:', error, '原始日期:', date);
      return new Date().toISOString().split('T')[0];  // 備援
    }
  }

  shouldShowSubmitButton(): boolean {
    if (this.isViewMode) {
      return false;
    }
    return this.isGeneralCommissionMode; // 只有一般抽成顯示「確認」按鈕
  }

  shouldShowNextStepButton(): boolean {
    if (this.isViewMode) {
      return false;
    }
    return !this.isGeneralCommissionMode; // 只有非一般抽成顯示「下一步」按鈕
  }

  onItemSave(event: { oldData: any, newData: any }): void {
    this.eventHandlersService.handleItemSave(event, this.commissionData, this.selectedSettingTab);
    this.updateDetailItemsForDisplay();
    this.saveToWorkflow();
  }

  onDetailSave(event: { oldDetail: any, newDetail: any, parentData: any }): void {
    this.eventHandlersService.handleDetailSave(event, this.commissionData);
    this.saveToWorkflow();
  }

  onDropdownChange(event: { rowData: any, field: string, newValue: any, oldValue: any }): void {
    this.eventHandlersService.handleDropdownChange(event, this.commissionData);
    this.saveToWorkflow();
  }

  onBatchDelete(selectedItems: any[]): void {
    if (this.eventHandlersService.handleBatchDelete(selectedItems, this.commissionData, this.isViewMode)) {
      this.saveToWorkflow();
    }
  }

  onDetailBatchDelete(event: { selectedDetails: any[], parentData: any, rowIndex: number }): void {
    if (this.eventHandlersService.handleDetailBatchDelete(event, this.isViewMode)) {
      this.itemOperationsService.updateItemDetailItems(event.parentData);
      this.saveToWorkflow();
    }
  }
}
