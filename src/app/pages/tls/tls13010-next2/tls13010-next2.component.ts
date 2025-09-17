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

class ValidationContext {
  errors: string[] = [];
  errorItems: Set<any> = new Set();

  addError(message: string, item?: any) {
    this.errors.push(message);
    if (item) {
      this.errorItems.add(item);
      item._hasValidationError = true;
    }
  }

  get isValid(): boolean {
    return this.errors.length === 0;
  }

  markAllErrors(): void {
    this.errorItems.forEach(item => {
      item._hasValidationError = true;
    });
  }
}

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

  // 簡化的狀態追蹤
  private hasUnsavedChanges = false;

  // 只保留基本的重複保護
  private isSaving = false;


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
  ]
  // 數據
  commissionData: CommissionItem[] = [];

  // 下拉選項
  // taxTypeOptions: any[] = [
  //   { label: '應稅', value: 1 },
  //   { label: '免稅', value: 2 }
  // ];

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
      // this.setupAutoSave();
    } catch (error) {
      console.error('初始化失敗:', error);
      this.notificationService.errorBubble('頁面初始化失敗');
    }
  }

  /**
    * 核心方法：處理欄位變更事件（由表格觸發）
    */
  onFieldChange(event: { fieldName: string, newValue: any, rowData: any }): void {
    // console.log('🔥 收到欄位變更:', {
    //   fieldName: event.fieldName,
    //   newValue: event.newValue,
    //   rowData的ID: event.rowData?.id,
    //   rowData的dataKey: event.rowData?.[this.dataKey] || event.rowData?.id,
    //   timestamp: new Date().toISOString()
    // });

    try {
      // 檢查是否為詳細項目（通常詳細項目沒有主要的 dataKey）
      const isDetailItem = this.isDetailData(event.rowData);

      if (isDetailItem) {
        console.log('📋 這是詳細項目，尋找父項目...');
        this.handleDetailItemFieldChange(event);
      } else {
        console.log('📊 這是主項目');
        this.handleMainItemFieldChange(event);
      }

    } catch (error) {
      console.error('❌ 處理欄位變更時發生錯誤:', error);
      this.notificationService.errorBubble('資料更新失敗');
    }
  }

  private isDetailData(rowData: any): boolean {
    // 詳細資料通常有 _originalType 或者不在主要 commissionData 中
    return !!(rowData._originalType ||
      rowData.id?.toString().startsWith('temp_') &&
      !this.commissionData.some(item => item.id === rowData.id));
  }

  private handleDetailItemFieldChange(event: { fieldName: string, newValue: any, rowData: any }): void {
    // 尋找包含此詳細項目的父項目
    const parentItem = this.findParentOfDetailItem(event.rowData);

    if (!parentItem) {
      console.warn('⚠️ 找不到詳細項目的父項目:', event.rowData);
      return;
    }

    console.log('🔍 找到父項目:', {
      parentId: parentItem.id,
      detailId: event.rowData.id,
      currentTab: parentItem.currentTab
    });

    // 更新詳細項目狀態
    const modifiedDetail = this.updateItemStatus(event.rowData);

    // 直接更新父項目中的詳細項目
    this.updateDetailInParent(parentItem, modifiedDetail);

    // 更新父項目狀態
    const modifiedParent = this.updateItemStatus(parentItem);

    // 更新主陣列
    this.updateCommissionDataArray(modifiedParent);

    // 立即儲存
    this.saveToWorkflowImmediate();

    console.log('✅ 詳細項目欄位變更已處理:', {
      detailId: modifiedDetail.id,
      parentId: modifiedParent.id,
      fieldName: event.fieldName
    });
  }

  // 5. 新增：尋找詳細項目的父項目
  private findParentOfDetailItem(detailData: any): CommissionItem | null {
    for (const commissionItem of this.commissionData) {
      // 檢查 detailItems
      if (commissionItem.detailItems?.some(item => item.id === detailData.id)) {
        return commissionItem;
      }

      // 檢查各個分頁的資料
      if (commissionItem.discountSettingItems?.some(item => item.id === detailData.id) ||
        commissionItem.annualPerformanceItems?.some(item => item.id === detailData.id) ||
        commissionItem.discountLevelItems?.some(item => item.id === detailData.id)) {
        return commissionItem;
      }
    }

    return null;
  }

  // 6. 新增：更新父項目中的詳細項目
  private updateDetailInParent(parentItem: CommissionItem, modifiedDetail: any): void {
    const currentTab = parentItem.currentTab || 'discount';
    const detailId = modifiedDetail.id;

    // 更新 detailItems（用於顯示）
    if (parentItem.detailItems) {
      const detailIndex = parentItem.detailItems.findIndex(item => item.id === detailId);
      if (detailIndex > -1) {
        parentItem.detailItems[detailIndex] = { ...modifiedDetail };
        console.log(`✅ 已更新 detailItems[${detailIndex}]`);
      }
    }

    // 同步到對應的資料陣列
    switch (currentTab) {
      case 'discount':
        {
          const discountIndex = parentItem.discountSettingItems.findIndex(item => item.id === detailId);
          if (discountIndex > -1) {
            parentItem.discountSettingItems[discountIndex] = { ...modifiedDetail };
            console.log(`✅ 已更新 discountSettingItems[${discountIndex}]`);
          }
          break;
        }

      case 'annual':
        {
          const annualIndex = parentItem.annualPerformanceItems.findIndex(item => item.id === detailId);
          if (annualIndex > -1) {
            parentItem.annualPerformanceItems[annualIndex] = { ...modifiedDetail };
            console.log(`✅ 已更新 annualPerformanceItems[${annualIndex}]`);
          }
          break;
        }

      case 'level':
        {
          const levelIndex = parentItem.discountLevelItems.findIndex(item => item.id === detailId);
          if (levelIndex > -1) {
            parentItem.discountLevelItems[levelIndex] = { ...modifiedDetail };
            console.log(`✅ 已更新 discountLevelItems[${levelIndex}]`);
          }
          break;
        }
    }
  }

  private handleMainItemFieldChange(event: { fieldName: string, newValue: any, rowData: any }): void {
    const modifiedData = this.updateItemStatus(event.rowData);
    this.updateCommissionDataArray(modifiedData);
    this.saveToWorkflowImmediate();

    console.log('✅ 主項目欄位變更已處理:', {
      itemId: modifiedData.id,
      newStatus: modifiedData._status,
      fieldName: event.fieldName
    });
  }


  private updateItemStatus(itemData: any): any {
    const modifiedData = { ...itemData };

    // 如果是新增的資料，保持 new 狀態
    if (modifiedData._status === 'new') {
      console.log('🆕 保持新增狀態:', modifiedData.id);
      return modifiedData;
    }

    // 如果是原始資料，標記為已修改
    if (modifiedData._status === 'original' || !modifiedData._status) {
      modifiedData._status = 'modified';
      console.log('📝 標記為已修改:', modifiedData.id);
    }

    return modifiedData;
  }

  private updateCommissionDataArray(modifiedData: any): void {
    const itemId = modifiedData.id;
    const index = this.commissionData.findIndex(item => item.id === itemId);

    if (index > -1) {
      // 完全替換而不是合併，確保狀態正確更新
      this.commissionData[index] = { ...modifiedData };
      console.log(`✅ 已更新 commission data index ${index}:`, {
        id: modifiedData.id,
        _status: modifiedData._status
      });
    } else {
      console.error(`❌ 找不到 ID: ${itemId} 的項目`, {
        尋找的ID: itemId,
        現有的IDs: this.commissionData.map(item => item.id),
        修改的資料: modifiedData
      });

      // // 除錯資訊：顯示更多詳細資料
      // console.log('🔍 除錯資訊:', {
      //   commissionData長度: this.commissionData.length,
      //   modifiedData的所有屬性: Object.keys(modifiedData),
      //   是否有dataKey: this.dataKey,
      //   modifiedData的dataKey值: modifiedData[this.dataKey]
      // });
    }
  }
  /**
 * 立即儲存到工作流程（不依賴原有的 saveToWorkflow）
 */
  private saveToWorkflowImmediate(): void {
    // 簡單的重複保護
    if (this.isSaving) {
      console.log('🔒 儲存中，跳過重複請求');
      return;
    }

    console.log('💾 即時儲存到工作流程...');

    try {
      this.isSaving = true;

      // 確保所有資料都有正確的狀態標記
      const processedData = this.prepareCommissionDataForSubmit();

      // 儲存到工作流程服務
      this.contractFlowService.saveStep3Data(processedData);

      console.log('✅ 工作流程儲存成功，項目數量:', processedData.length);

      // 驗證儲存結果
      const savedData = this.contractFlowService.getStep3Data();
      if (Array.isArray(savedData) && savedData.length === processedData.length) {
        console.log('✅ 儲存驗證通過');
      } else {
        console.warn('⚠️ 儲存數量不一致');
      }

      setTimeout(() => {
        const savedData = this.contractFlowService.getStep3Data();
        console.log('儲存驗證:', {
          儲存前: this.commissionData.length,
          儲存後: savedData?.length || 0,
          詳細資料總數: this.commissionData.reduce((sum, item) =>
            sum + (item.detailItems?.length || 0), 0)
        });
      }, 100);

    } catch (error) {
      console.error('❌ 工作流程儲存失敗:', error);
      this.notificationService.errorBubble('暫存失敗，請重試');
    } finally {
      // 立即釋放鎖定
      this.isSaving = false;
    }
  }

  private initializeColumns(): void {
    this.contractInfoColumns = TLS13010Next2ColumnsConfig.getContractInfoColumns();
    this.annualColumns = TLS13010Next2ColumnsConfig.getAnnualColumns();
    this.commissionColumns = TLS13010Next2ColumnsConfig.getCommissionColumns();
    // discountColumns 和 levelColumns 會在 updateDiscountColumnOptions 中設定
  }

  ngOnDestroy(): void {
    console.log('🧹 Next2 組件銷毀...');

    // 移除防抖計時器清理
    // 如果還有未儲存的變更，最後一次儲存
    if (!this.isSaving) {
      this.saveToWorkflowImmediate();
    }

    // 原有的清理邏輯
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.viewModeSubscription) {
      this.viewModeSubscription.unsubscribe();
    }
  }

  /**
   * 新增：強制同步所有分頁的資料
   */
  private forceSyncAllTabsData(): void {
    console.log('🔄 強制同步所有項目的所有分頁資料...');

    this.commissionData.forEach((item, index) => {
      if (item.detailItems && item.detailItems.length > 0) {
        console.log(`📋 同步項目 ${index + 1} 的分頁資料`);

        // 強制同步當前分頁
        this.forceSyncCurrentTabData(item);

        // 如果有其他分頁的 detailItems，也要同步
        this.syncAllTabTypesForItem(item);
      }
    });

    console.log('✅ 所有分頁資料同步完成');
  }

  /**
   * 新增：同步單個項目的所有分頁類型
   */
  private syncAllTabTypesForItem(commissionItem: CommissionItem): void {
    if (!commissionItem.detailItems || commissionItem.detailItems.length === 0) {
      return;
    }

    // 按照 _originalType 分組
    const discountItems = commissionItem.detailItems.filter(item =>
      !item._originalType || item._originalType === 'discount'
    );
    const annualItems = commissionItem.detailItems.filter(item =>
      item._originalType === 'annual'
    );
    const levelItems = commissionItem.detailItems.filter(item =>
      item._originalType === 'level'
    );

    // 同步各分頁的資料
    if (discountItems.length > 0) {
      commissionItem.discountSettingItems = discountItems.map(item => this.mapToDiscountItem(item));
    }

    if (annualItems.length > 0) {
      commissionItem.annualPerformanceItems = annualItems.map(item => this.mapToAnnualItem(item));
    }

    if (levelItems.length > 0) {
      commissionItem.discountLevelItems = levelItems.map(item => this.mapToLevelItem(item));
    }
  }

  /**
   * 新增：映射到折扣項目格式
   */
  private mapToDiscountItem(item: any): any {
    return {
      id: item.id,
      selected: item.selected || false,
      cag_barcode: item.cag_barcode || '',
      tlt_bdate: this.ensureValidDate(item.tlt_bdate),
      tlt_edate: this.ensureValidDate(item.tlt_edate),
      cag_charge_rate: item.cag_charge_rate || 0,
      _status: item._status || (this.hasItemId(item) ? 'original' : 'new'),
      is_configured: item.is_configured || false,
      is_enabled: item.is_enabled || false
    };
  }

  /**
   * 新增：映射到年度業績項目格式
   */
  private mapToAnnualItem(item: any): any {
    return {
      id: item.id,
      selected: item.selected || false,
      tlt_bdate: this.ensureValidDate(item.tlt_bdate),
      tlt_edate: this.ensureValidDate(item.tlt_edate),
      year_amount: item.year_amount || 0,
      extra_rate: item.extra_rate || 0,
      _status: item._status || (this.hasItemId(item) ? 'original' : 'new'),
      is_configured: item.is_configured || false,
      is_enabled: item.is_enabled || false
    };
  }

  /**
   * 新增：映射到層級抽成項目格式
   */
  private mapToLevelItem(item: any): any {
    return {
      id: item.id,
      selected: item.selected || false,
      cag_barcode: item.cag_barcode || '',
      level_bmount: item.level_bmount || 0,
      level_eamount: item.level_eamount || 0,
      level_charge_rate: item.level_charge_rate || 0,
      _status: item._status || (this.hasItemId(item) ? 'original' : 'new'),
      is_configured: item.is_configured || false,
      is_enabled: item.is_enabled || false
    };
  }
  /**
  * 新增：設定檢視模式 UI
  */
  private setupViewModeUI(): void {
    console.log('🔧 Next2 設定檢視模式 UI 監聽');

    // 先檢查當前狀態
    const currentViewMode = this.contractFlowService.isViewMode();
    console.log('📋 Next2 當前檢視模式狀態:', currentViewMode);

    // 如果已經是檢視模式，立即設定
    if (currentViewMode) {
      this.isViewMode = true;
      this.applyViewModeSettings(true);
    }

    // 訂閱後續變更
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

    // 不需要手動更新欄位，readonly 屬性會自動處理所有事情
  }


  private saveToWorkflow(): void {
    // this.debouncedSave();
  }



  /**
   *  獲取當前資料狀態摘要
   */
  getDataStatusSummary(): any {
    const summary = {
      totalItems: this.commissionData.length,
      newItems: this.commissionData.filter(item => item._status === 'new').length,
      modifiedItems: this.commissionData.filter(item => item._status === 'modified').length,
      originalItems: this.commissionData.filter(item => item._status === 'original' || !item._status).length,
      hasUnsavedChanges: this.hasUnsavedChanges
    };

    console.log('📊 資料狀態摘要:', summary);
    return summary;
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

    // if (result.data.length > 0) {
    //   this.notificationService.infoBubble(`已載入 ${result.data.length} 個抽成項目`);
    // }
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

    // 優先使用 CRU 頁面編輯後的資料
    const step1Data = this.contractFlowService.getStep1Data();
    console.log('📝 Step1 編輯資料:', step1Data);

    // 準備合約資訊
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
      id: contractInfo.talent_id || 'new', // 新增模式顯示 'new'
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
      // 確保所有資料都有正確的狀態標記
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

      // 即時儲存，不用防抖
      this.saveToWorkflowImmediate();
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

      // 即時儲存，不用防抖
      this.saveToWorkflowImmediate();
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
    // 重新整理這個項目的顯示
    this.refreshSingleItemDetailDisplay(item);
    this.cdr.detectChanges();
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

    // 🔥 關鍵修復：強制同步當前分頁的所有 detailItems 資料
    this.forceSyncCurrentTabData(rowData);

    // 設定新的標籤
    rowData.currentTab = tabId;

    // 只更新這個項目的顯示
    this.refreshSingleItemDetailDisplay(rowData);

    // 🔥 立即儲存到工作流程
    this.saveToWorkflow();

    console.log('✅ 內層標籤切換完成');
  }

  /**
   * 新增：強制同步當前分頁的資料
   */
  private forceSyncCurrentTabData(commissionItem: CommissionItem): void {
    const currentTab = commissionItem.currentTab || 'discount';

    console.log('💾 強制同步當前分頁資料:', {
      itemId: commissionItem.id,
      currentTab,
      detailItemsCount: commissionItem.detailItems?.length || 0
    });

    if (!commissionItem.detailItems || commissionItem.detailItems.length === 0) {
      console.log('⚠️ 沒有 detailItems 需要同步');
      return;
    }

    // 過濾出屬於當前分頁的項目
    const currentTabItems = commissionItem.detailItems.filter(item =>
      !item._originalType || item._originalType === currentTab
    );

    console.log(`📋 準備同步 ${currentTabItems.length} 個 ${currentTab} 項目`);

    switch (currentTab) {
      case 'discount':
        // 完全替換而不是合併，確保資料一致性
        commissionItem.discountSettingItems = currentTabItems.map(item => ({
          id: item.id,
          selected: item.selected || false,
          cag_barcode: item.cag_barcode || '',
          tlt_bdate: this.ensureValidDate(item.tlt_bdate),
          tlt_edate: this.ensureValidDate(item.tlt_edate),
          cag_charge_rate: item.cag_charge_rate || 0,
          _status: item._status || (this.hasItemId(item) ? 'original' : 'new'),
          is_configured: item.is_configured || false,
          is_enabled: item.is_enabled || false
        }));
        console.log(`✅ 已同步 ${commissionItem.discountSettingItems.length} 個折扣設定`);
        break;

      case 'annual':
        commissionItem.annualPerformanceItems = currentTabItems.map(item => ({
          id: item.id,
          selected: item.selected || false,
          tlt_bdate: this.ensureValidDate(item.tlt_bdate),
          tlt_edate: this.ensureValidDate(item.tlt_edate),
          year_amount: item.year_amount || 0,
          extra_rate: item.extra_rate || 0,
          _status: item._status || (this.hasItemId(item) ? 'original' : 'new'),
          is_configured: item.is_configured || false,
          is_enabled: item.is_enabled || false
        }));
        console.log(`✅ 已同步 ${commissionItem.annualPerformanceItems.length} 個年度業績`);
        break;

      case 'level':
        commissionItem.discountLevelItems = currentTabItems.map(item => ({
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
        console.log(`✅ 已同步 ${commissionItem.discountLevelItems.length} 個層級抽成`);
        break;
    }
  }

  /**
 * 新增：確保日期格式正確的輔助方法
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
    } catch (error) {
      console.warn('日期轉換失敗，使用當前日期:', dateInput);
      return new Date();
    }
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

  // 判斷是否為一般抽成（簡潔版本）
  get isGeneralCommissionMode(): boolean {
    return this.currentCommissionType === '3';
  }

  // 取得按鈕類型（簡潔版本）
  getNextButtonType(): "submit" | "create" {
    return this.isGeneralCommissionMode ? 'submit' : 'create';
  }

  // 取得按鈕標籤（簡潔版本）
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
    console.log('準備提交...');

    // 執行驗證
    const validation = this.validateAllData();

    if (!validation.isValid) {
      // 標記錯誤並顯示
      this.handleValidationErrors(validation);
      return;
    }

    // 清除錯誤標記並繼續提交
    this.clearAllErrorMarks();

    // 原有提交邏輯
    if (!this.isSaving) {
      this.executeOriginalSubmitLogic();
    } else {
      setTimeout(() => this.executeOriginalSubmitLogic(), 100);
    }
  }

  // 3. 統一驗證方法 - 無需太多參數
  private validateAllData(): ValidationContext {
    const ctx = new ValidationContext();

    // 基本檢查
    if (this.commissionData.length === 0) {
      ctx.addError('請至少設定一個抽成項目');
      return ctx;
    }

    // 對每個項目執行驗證
    this.commissionData.forEach((item, index) => {
      this.validateCommissionItem(item, index + 1, ctx);
    });

    return ctx;
  }

  // 4. 單一項目驗證 - 只需要一個 context 參數
  private validateCommissionItem(item: CommissionItem, itemNumber: number, ctx: ValidationContext): void {
    const prefix = `抽成項目 ${itemNumber}`;

    // 基本欄位驗證
    if (!item.tlt_id?.trim()) ctx.addError(`${prefix}: 抽成類別不能為空`, item);
    if (!item.tlt_id_desc?.trim()) ctx.addError(`${prefix}: 抽成類別名稱不能為空`, item);
    if (typeof item.cag_taxtype === 'undefined') ctx.addError(`${prefix}: 請選擇稅別`, item);
    if (item.sst_amount < 0) ctx.addError(`${prefix}: 單筆交易金額不能為負數`, item);
    if (item.sst_rate < 0 || item.sst_rate > 100) ctx.addError(`${prefix}: 特價抽成率必須在0-100%之間`, item);

    // 折扣設定驗證 (包含日期重疊)
    this.validateDiscountItems(item, prefix, ctx);

    // 年度業績驗證 (包含日期重疊)
    this.validateAnnualItems(item, prefix, ctx);

    // 層級抽成驗證
    this.validateLevelItems(item, prefix, ctx);
  }

  // 5. 具體的驗證方法 - 簡化參數
  private validateDiscountItems(item: CommissionItem, prefix: string, ctx: ValidationContext): void {
    const activeItems = item.discountSettingItems?.filter(d => d._status !== 'deleted' && d.selected) || [];
    if (activeItems.length === 0) return;

    // 個別項目驗證
    activeItems.forEach((discount, index) => {
      const itemPrefix = `${prefix} 折扣設定 ${index + 1}`;

      if (!discount.cag_barcode) ctx.addError(`${itemPrefix}: 請選擇折扣別`, discount);

      if ((discount.cag_charge_rate || 0) < 0 || (discount.cag_charge_rate || 0) > 100) {
        ctx.addError(`${itemPrefix}: 抽成率必須在0-100%之間`, discount);
      }

      if (!this.isValidDateRange(discount.tlt_bdate, discount.tlt_edate)) {
        ctx.addError(`${itemPrefix}: 日期範圍無效`, discount);
      }
    });

    // 關鍵: 日期重疊驗證
    const overlapResult = this.validationService.validateDiscountDateOverlap(item.discountSettingItems);
    if (!overlapResult.isValid) {
      overlapResult.errors.forEach(error => ctx.addError(`${prefix}: ${error}`));
      // 標記重疊的項目
      item.discountSettingItems.forEach(d => {
        if (d._hasDateOverlapError) ctx.errorItems.add(d);
      });
    }
  }

  private validateAnnualItems(item: CommissionItem, prefix: string, ctx: ValidationContext): void {
    const activeItems = item.annualPerformanceItems?.filter(a => a._status !== 'deleted') || [];
    if (activeItems.length === 0) return;

    activeItems.forEach((annual, index) => {
      const itemPrefix = `${prefix} 年度業績 ${index + 1}`;

      if ((annual.year_amount || 0) <= 0) ctx.addError(`${itemPrefix}: 業績金額必須大於0`, annual);
      if ((annual.extra_rate || 0) < 0 || (annual.extra_rate || 0) > 100) {
        ctx.addError(`${itemPrefix}: 額外抽成率必須在0-100%之間`, annual);
      }
      if (!this.isValidDateRange(annual.tlt_bdate, annual.tlt_edate)) {
        ctx.addError(`${itemPrefix}: 日期範圍無效`, annual);
      }
    });

    // 年度業績日期重疊驗證
    const overlapResult = this.validationService.validateAnnualDateRanges(activeItems);
    if (!overlapResult.isValid) {
      overlapResult.errors.forEach(error => ctx.addError(`${prefix}: ${error}`));
      activeItems.forEach(a => {
        if (a._hasDateOverlapError) ctx.errorItems.add(a);
      });
    }
  }

  private validateLevelItems(item: CommissionItem, prefix: string, ctx: ValidationContext): void {
    const activeItems = item.discountLevelItems?.filter(l => l._status !== 'deleted' && l.selected) || [];
    if (activeItems.length === 0) return;

    activeItems.forEach((level, index) => {
      const itemPrefix = `${prefix} 層級抽成 ${index + 1}`;

      if (!level.cag_barcode) ctx.addError(`${itemPrefix}: 請選擇折扣別`, level);

      const bmount = level.level_bmount || 0;
      const eamount = level.level_eamount || 0;

      if (bmount < 0 || eamount < 0) ctx.addError(`${itemPrefix}: 金額不能為負數`, level);
      if (bmount >= eamount) ctx.addError(`${itemPrefix}: 起始金額必須小於結束金額`, level);
      if ((level.level_charge_rate || 0) < 0 || (level.level_charge_rate || 0) > 100) {
        ctx.addError(`${itemPrefix}: 抽成率必須在0-100%之間`, level);
      }
    });
  }

  // 6. 錯誤處理方法
  private handleValidationErrors(validation: ValidationContext): void {
    // 標記錯誤項目
    validation.markAllErrors();

    // 更新UI顯示
    this.commissionData.forEach(item => {
      this.updateSingleItemDetailDisplay(item);
    });
    this.cdr.detectChanges();

    // 顯示錯誤訊息
    this.showValidationErrors(validation.errors);
  }

  private showValidationErrors(errors: string[]): void {
    const maxShow = 5;
    const showErrors = errors.slice(0, maxShow);

    let message = `發現 ${errors.length} 個錯誤:\n\n`;
    message += showErrors.join('\n');

    if (errors.length > maxShow) {
      message += `\n\n...還有 ${errors.length - maxShow} 個錯誤`;
    }

    message += '\n\n請修正後重新提交';
    this.notificationService.errorBubble(message);
  }

  // 7. 輔助方法
  private isValidDateRange(startDate: any, endDate: any): boolean {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end;
  }

  private clearAllErrorMarks(): void {
    this.commissionData.forEach(item => {
      this.clearItemErrors(item);
      item.discountSettingItems?.forEach(d => this.clearItemErrors(d));
      item.annualPerformanceItems?.forEach(a => this.clearItemErrors(a));
      item.discountLevelItems?.forEach(l => this.clearItemErrors(l));
      item.detailItems?.forEach(detail => this.clearItemErrors(detail));
    });
    this.cdr.detectChanges();
  }

  private clearItemErrors(item: any): void {
    delete item._hasValidationError;
    delete item._hasError;
    delete item._hasDateOverlapError;
  }

  /**
   * 執行原有的提交邏輯
   */
  private executeOriginalSubmitLogic(): void {
    // 原有的提交邏輯保持不變
    if (this.isViewMode) {
      if (this.isGeneralCommissionMode) {
        this.router.navigate(['account/tls/tls13010']);
        return;
      } else {
        this.router.navigate(['account/tls/tls13010next3']);
        return;
      }
    }

    // 編輯模式：檢查資料完整性
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
      // 檢視模式：返回上一步，不帶參數
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
      // 使用新的清理資料方法
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

      // 驗證資料
      const validation = this.contractFlowService.validateCleanSubmitData(cleanSubmitData);

      if (!validation.isValid) {
        console.error('❌ Next2: 資料驗證失敗:', validation.errors);
        this.loading = false;
        this.notificationService.unblockUi();
        this.notificationService.errorBubble(`資料驗證失敗: ${validation.errors[0]}`);
        return;
      }

      // 顯示警告（如果有）
      if (validation.warnings.length > 0) {
        console.warn('⚠️ Next2: 提交警告:', validation.warnings);
        validation.warnings.forEach(warning => {
          this.notificationService.warnBubble(warning);
        });
      }

      // 調用真實的 API
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

    // 調用真實的 API
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

    // 顯示成功訊息
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

    // 顯示警告（如果有）
    if (response.warnings && response.warnings.length > 0) {
      response.warnings.forEach((warning: string) => {
        this.notificationService.warnBubble(warning);
      });
    }

    // 提交成功後清理暫存並導航
    this.contractFlowService.onSubmitSuccess();

    // 延遲導航，讓使用者看到成功訊息
    setTimeout(() => {
      this.router.navigate(['account/tls/tls13010']);
    }, 2000);
  }

  private handleSubmitError(error: any): void {
    this.loading = false;
    this.notificationService.unblockUi();

    console.error('💥 Next2: 處理提交錯誤:', error);

    let errorMessage = '契約資料提交失敗';

    // 解析錯誤訊息
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

    // 記錄詳細錯誤資訊供除錯
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
    // 第二優先：從 Step1 暫存資料取得
    const step1Data = this.contractFlowService.getStep1Data();
    if (step1Data?.tlt_bdate) {
      console.log('📅 從 Step1 取得起始日:', step1Data.tlt_bdate);

      // 關鍵修正：統一處理日期格式，避免時區問題
      const dateStr = this.extractDateStringFromInput(step1Data.tlt_bdate);
      console.log('📅 處理後的起始日:', dateStr);
      return dateStr;
    }

    // 最後備援：今天日期
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 使用預設起始日:', today);
    return today;
  }

  private getContractEndDate(): string {
    // 第二優先：從 Step1 暫存資料取得
    const step1Data = this.contractFlowService.getStep1Data();
    if (step1Data?.tlt_edate) {
      console.log('📅 從 Step1 取得結束日:', step1Data.tlt_edate);

      // 關鍵修正：統一處理日期格式，避免時區問題
      const dateStr = this.extractDateStringFromInput(step1Data.tlt_edate);
      console.log('📅 處理後的結束日:', dateStr);
      return dateStr;
    }

    // 最後備援：今天 + 1年
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const nextYearStr = nextYear.toISOString().split('T')[0];
    console.log('📅 使用預設結束日:', nextYearStr);
    return nextYearStr;
  }

  private extractDateStringFromInput(dateInput: any): string {
    if (!dateInput) {
      return new Date().toISOString().split('T')[0];
    }

    // 如果已經是 YYYY-MM-DD 格式的字符串，直接使用
    if (typeof dateInput === 'string') {
      // 檢查是否為 ISO 字符串格式 (包含 T 和時間部分)
      if (dateInput.includes('T')) {
        // 關鍵：從 ISO 字符串中提取日期部分，忽略時間和時區
        return dateInput.split('T')[0];
      }
      // 如果是純日期字符串，直接使用
      if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateInput;
      }
    }

    // 如果是 Date 對象，使用本地時間的日期部分
    if (dateInput instanceof Date) {
      const year = dateInput.getFullYear();
      const month = String(dateInput.getMonth() + 1).padStart(2, '0');
      const day = String(dateInput.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // 其他情況，嘗試解析後提取日期部分
    try {
      const parsedDate = new Date(dateInput);
      if (!isNaN(parsedDate.getTime())) {
        // 重要：使用 UTC 方法避免時區轉換
        const year = parsedDate.getUTCFullYear();
        const month = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.error('日期解析失敗:', error, '原始日期:', dateInput);
    }

    // 備援：返回今天日期
    return new Date().toISOString().split('T')[0];
  }

  // private formatDateToString(date: any): string {
  //   if (!date) return '';
  //   try {
  //     const dateObj = date instanceof Date ? date : new Date(date);
  //     if (isNaN(dateObj.getTime())) return '';

  //     const year = dateObj.getFullYear();
  //     const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  //     const day = String(dateObj.getDate()).padStart(2, '0');
  //     return `${year}-${month}-${day}`;
  //   } catch (error) {
  //     console.error('日期格式化失敗:', error, '原始日期:', date);
  //     return new Date().toISOString().split('T')[0];  // 備援
  //   }
  // }

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
    // 直接編輯模式下這個事件可能不會觸發，因為是透過 fieldChange 處理
    console.log('📝 表格儲存事件 (direct edit mode):', event);

    // 確保資料狀態正確
    const modifiedData = this.updateItemStatus(event.newData);
    this.updateCommissionDataArray(modifiedData);
  }

  onDetailSave(event: { oldDetail: any, newDetail: any, parentData: any }): void {
    // 類似處理明細資料的變更
    console.log('📝 明細儲存事件 (direct edit mode):', event);

    // 確保父項目狀態正確
    const modifiedParent = this.updateItemStatus(event.parentData);
    this.updateCommissionDataArray(modifiedParent);
  }


  onBeforeDetailSave(event: { data: any, preventDefault: () => void }): void {
    const { data } = event;
    console.log('🔍 onBeforeDetailSave 被觸發:', data);

    // 基本日期驗證
    if (data.tlt_bdate && data.tlt_edate) {
      const startDate = new Date(data.tlt_bdate);
      const endDate = new Date(data.tlt_edate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log('❌ 日期格式錯誤，阻止儲存');
        this.notificationService.errorBubble('日期格式錯誤，請重新輸入');
        event.preventDefault();
        return; // 確保這裡真的停止執行
      }

      if (startDate > endDate) {
        console.log('❌ 起始日期不能晚於結束日期');
        this.notificationService.errorBubble('起始日期必須早於結束日期');
        event.preventDefault();
        return; // 確保這裡真的停止執行
      }
    }

    // 年度業績重疊檢查
    if (data._originalType === 'annual') {
      const parentData = this.commissionData.find(item =>
        item.annualPerformanceItems.some(annual => annual.id === data.id)
      );

      if (parentData) {
        const validation = this.validationService.validateSingleAnnualItemOverlap(
          data,
          parentData.annualPerformanceItems,
          data.id
        );

        if (!validation.isValid) {
          console.log('❌ 年度業績重疊，阻止儲存');
          this.notificationService.errorBubble(validation.errors[0]);
          event.preventDefault();
          return; // 確保這裡真的停止執行
        }
      }
    }

    console.log('✅ 所有驗證通過');
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

  onDetailButtonClick(event: {
    detailData: any;
    field: string;
    parentData: any;
  }): void {
    console.log('🔘 詳細按鈕點擊事件:', event);

    // 判斷是否為複製按鈕
    if (event.field === 'copy_button') {
      this.copyDetailItem(event.detailData, event.parentData);
    }
  }

  /**
   * 複製詳細項目（插入到下一行）
   */
  private copyDetailItem(sourceItem: any, parentData: any): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法複製項目');
      return;
    }

    console.log('📋 開始複製項目:', sourceItem);

    // 取得當前標籤
    const currentTab = parentData.currentTab || 'discount';

    // 只處理 discount 和 level
    if (currentTab !== 'discount' && currentTab !== 'level') {
      console.log('⚠️ 此標籤類型不支援複製功能');
      return;
    }

    // 建立複製的項目
    const copiedItem = this.createCopiedItem(sourceItem, currentTab);

    // 找出原項目的索引位置
    let targetArray: any[] = [];
    let sourceIndex = -1;

    switch (currentTab) {
      case 'discount':
        targetArray = parentData.discountSettingItems || [];
        sourceIndex = targetArray.findIndex(item => item.id === sourceItem.id);
        break;

      case 'level':
        targetArray = parentData.discountLevelItems || [];
        sourceIndex = targetArray.findIndex(item => item.id === sourceItem.id);
        break;
    }

    // 插入到原項目的下一個位置
    if (sourceIndex !== -1) {
      targetArray.splice(sourceIndex + 1, 0, copiedItem);
      console.log(`✅ 已在索引 ${sourceIndex + 1} 位置插入複製項目`);
    } else {
      // 如果找不到原項目位置，就加到最後
      targetArray.push(copiedItem);
      console.log('⚠️ 找不到原項目位置，將複製項目加到最後');
    }

    // 更新顯示
    this.refreshSingleItemDetailDisplay(parentData);

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
  private createCopiedItem(sourceItem: any, itemType: string): any {
    const tempId = this.generateTempId();

    // 基礎複製物件
    const copiedItem: any = {
      id: tempId,
      _status: 'new',
      selected: true,  // 預設不勾選
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
        break;

      case 'level':
        // 層級抽成複製
        copiedItem.cag_barcode = sourceItem.cag_barcode || '';
        copiedItem.level_bmount = sourceItem.level_bmount || 0;
        copiedItem.level_eamount = sourceItem.level_eamount || 0;
        copiedItem.level_charge_rate = sourceItem.level_charge_rate || 0;
        break;
    }

    console.log('📋 複製完成的項目:', copiedItem);
    return copiedItem;
  }

  /**
   * 處理詳細資料欄位變更事件
   */
  onDetailFieldChange(event: {
    fieldName: string,
    newValue: any,
    detailData: any,
    parentData: any,
    rowIndex: number,
    detailIndex: number
  }): void {
    console.log('🔥 收到詳細資料欄位變更，委託給 onFieldChange:', {
      fieldName: event.fieldName,
      newValue: event.newValue,
      detailId: event.detailData?.id,
      parentId: event.parentData?.id
    });

    // 直接委託給統一的 onFieldChange 處理
    this.onFieldChange({
      fieldName: event.fieldName,
      newValue: event.newValue,
      rowData: event.detailData
    });
  }

  private syncToTargetArray(parentItem: CommissionItem, detailData: any): void {
    const currentTab = parentItem.currentTab || 'discount';
    const detailId = detailData.id;

    switch (currentTab) {
      case 'discount':
        {
          const discountIndex = parentItem.discountSettingItems.findIndex(item => item.id === detailId);
          if (discountIndex > -1) {
            parentItem.discountSettingItems[discountIndex] = { ...detailData };
          }
          break;
        }

      case 'annual':
        {
          const annualIndex = parentItem.annualPerformanceItems.findIndex(item => item.id === detailId);
          if (annualIndex > -1) {
            parentItem.annualPerformanceItems[annualIndex] = { ...detailData };
          }
          break;
        }

      case 'level':
        {
          const levelIndex = parentItem.discountLevelItems.findIndex(item => item.id === detailId);
          if (levelIndex > -1) {
            parentItem.discountLevelItems[levelIndex] = { ...detailData };
          }
          break;
        }
    }
  }

  /**
   * 新增：立即同步詳細資料到對應陣列
   */
  private syncDetailToParentArrayImmediate(modifiedDetail: any, parentData: any): void {
    const currentTab = parentData.currentTab || 'discount';
    const detailId = modifiedDetail.id;

    console.log(`🔄 立即同步詳細資料到 ${currentTab} 陣列:`, {
      detailId,
      currentTab
    });

    // 同步到對應的陣列
    switch (currentTab) {
      case 'discount':
        this.updateDetailInArrayImmediate(parentData.discountSettingItems, detailId, modifiedDetail);
        break;
      case 'annual':
        this.updateDetailInArrayImmediate(parentData.annualPerformanceItems, detailId, modifiedDetail);
        break;
      case 'level':
        this.updateDetailInArrayImmediate(parentData.discountLevelItems, detailId, modifiedDetail);
        break;
    }

    // 🔥 關鍵：也要同步 detailItems 陣列（用於顯示）
    this.updateDetailInArrayImmediate(parentData.detailItems, detailId, modifiedDetail);

    console.log(`✅ 已立即同步到 ${currentTab} 陣列`);
  }

  /**
   * 新增：立即更新陣列中的指定詳細資料項目
   */
  private updateDetailInArrayImmediate(array: any[], itemId: string, newDetailData: any): void {
    if (!Array.isArray(array)) {
      console.warn('目標陣列不存在，跳過更新');
      return;
    }

    const index = array.findIndex(item => item.id === itemId);
    if (index > -1) {
      // 🔥 關鍵：使用深拷貝確保資料獨立性
      array[index] = JSON.parse(JSON.stringify(newDetailData));
      console.log(`✅ 已立即更新陣列 index ${index}:`, {
        id: newDetailData.id,
        _status: newDetailData._status
      });
    } else {
      console.warn(`⚠️ 找不到詳細資料 ID: ${itemId}，可能需要新增`);
      // 如果找不到，可能是新項目，直接加入
      array.push(JSON.parse(JSON.stringify(newDetailData)));
      console.log(`✅ 已新增項目到陣列: ${itemId}`);
    }
  }


  /**
   * 更新詳細資料項目狀態
   */
  private updateDetailItemStatus(detailData: any): any {
    const modifiedDetail = { ...detailData };

    // 如果是新增的資料，保持 new 狀態
    if (modifiedDetail._status === 'new') {
      console.log('保持詳細資料新增狀態:', modifiedDetail.id);
      return modifiedDetail;
    }

    // 如果是原始資料，標記為已修改
    if (modifiedDetail._status === 'original' || !modifiedDetail._status) {
      modifiedDetail._status = 'modified';
      console.log('標記詳細資料為已修改:', modifiedDetail.id);
    }

    return modifiedDetail;
  }

  /**
   * 同步詳細資料到父項目的對應陣列
   */
  private syncDetailToParentArray(modifiedDetail: any, parentData: any, fieldName: string): void {
    const detailId = modifiedDetail.id;

    // 根據當前分頁決定要更新哪個陣列
    const currentTab = parentData.currentTab || 'discount';

    switch (currentTab) {
      case 'discount':
        this.updateDetailInArray(parentData.discountSettingItems, detailId, modifiedDetail);
        break;
      case 'annual':
        this.updateDetailInArray(parentData.annualPerformanceItems, detailId, modifiedDetail);
        break;
      case 'level':
        this.updateDetailInArray(parentData.discountLevelItems, detailId, modifiedDetail);
        break;
    }

    // 同時更新 detailItems 陣列（用於顯示）
    this.updateDetailInArray(parentData.detailItems, detailId, modifiedDetail);

    console.log(`已同步詳細資料到 ${currentTab} 陣列:`, {
      detailId,
      fieldName,
      currentTab
    });
  }

  /**
   * 更新陣列中的指定詳細資料項目
   */
  private updateDetailInArray(array: any[], itemId: string, newDetailData: any): void {
    if (!Array.isArray(array)) {
      console.warn('目標陣列不存在，跳過更新');
      return;
    }

    const index = array.findIndex(item => item.id === itemId);
    if (index > -1) {
      // 完全替換而不是合併，確保狀態正確更新
      array[index] = { ...newDetailData };
      console.log(`已更新詳細資料陣列 index ${index}:`, {
        id: newDetailData.id,
        _status: newDetailData._status
      });
    } else {
      console.warn(`找不到詳細資料 ID: ${itemId}`);
    }
  }

  /**
   * 獲取詳細資料狀態摘要
   */
  getDetailDataStatusSummary(): any {
    const summary = {
      totalParentItems: this.commissionData.length,
      detailItemCounts: this.commissionData.map(parent => ({
        parentId: parent.id,
        currentTab: parent.currentTab || 'discount',
        discountItems: parent.discountSettingItems?.length || 0,
        annualItems: parent.annualPerformanceItems?.length || 0,
        levelItems: parent.discountLevelItems?.length || 0,
        displayItems: parent.detailItems?.length || 0
      }))
    };

    console.log('詳細資料狀態摘要:', summary);
    return summary;
  }
}
