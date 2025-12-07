import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { MenubarComponent } from "@shared/component/menubar/menubar.component";
import { ButtonComponent } from "@shared/componentkit/button/button.component";
import { AccordionModule } from "primeng/accordion";
import { Button } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { Subscription } from 'rxjs';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { ContractSubmitService } from '../tls13010-next3/SubmitService/contract-submit.service';
import { ContractFlowService } from '../tls13010/services/contract-flow.service';
import { CommissionItem, ContractInfo } from '../tls13010/tls13010.model';
import { CommissionDataService } from './Services/commission-data.service';
import { CommissionTableService } from './Services/commission-table.service';
import { CommissionValidationService } from './Services/commission-validation.service';
import { TLS13010Next2ColumnsConfig } from './Services/tls13010-next2-columns.config';

@Component({
  selector: 'app-tls13010-next2',
  templateUrl: './tls13010-next2.component.html',
  styleUrls: ['./tls13010-next2.component.scss'],
  standalone: true,
  imports: [AccordionModule, ExpandableEditTableComponent, ProgressSpinnerModule, NgIf, ButtonComponent, DialogModule, MenubarComponent, Button]
})
export class TLS13010Next2Component extends BasicCruPageComponent<ContractInfo> implements OnInit, OnDestroy {

  // === 核心狀態 ===
  dataForm: FormGroup;

  // 檢視模式用 (衍生自 crudstatus)
  get isViewMode(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }
  dataLoaded = false;
  commissionDataLoaded = false; // 新增
  showConfirmDialog = false;

  // === 數據 ===
  currentTalentId = '';
  currentContractData: any = null; // 新增
  contractInfoData: ContractInfo[] = [];
  commissionData: CommissionItem[] = [];
  discountOptions: any[] = [];

  // === 表格配置 ===
  contractInfoColumns: ColumnDef[] = [];
  discountColumns: ColumnDef[] = [];
  annualColumns: ColumnDef[] = [];
  levelColumns: ColumnDef[] = [];
  commissionColumns: ColumnDef[] = [];
  detailColumns: ColumnDef[] = [];

  // === 設定標籤 ===
  selectedSettingTab = 'discount';
  settingTabs = [
    { id: 'discount', label: '折扣設定', allowAdd: false, allowBatchDelete: false, showCheckbox: false },
    { id: 'level', label: '折扣別層級抽成設定', allowAdd: false, allowBatchDelete: false, showCheckbox: false },
    { id: 'annual', label: '年度總業績抽成設定', allowAdd: true, allowBatchDelete: true, showCheckbox: true }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private contractFlowService: ContractFlowService,
    private tls13010Service: TLS13010Service,
    private commissionDataService: CommissionDataService,
    private validationService: CommissionValidationService,
    private tableService: CommissionTableService,
    private contractSubmitService: ContractSubmitService,
    private cdr: ChangeDetectorRef
  ) {
    super();
    this.dataForm = this.formBuilder.group({});
  }

  async ngOnInit(): Promise<void> {
    this.setupViewMode();
    this.initializePage('TLS13010', this.dataForm);
    this.initializeColumns();

    try {
      await this.loadData();
    } catch (error) {
      this.notificationService.errorBubble('頁面初始化失敗');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.saveToWorkflow();
  }

  // === 初始化方法 ===
  private setupViewMode(): void {
    // 初始化 CRUD 狀態
    const currentViewMode = this.contractFlowService.isViewMode();
    this.crudstatus = currentViewMode ? CRUDStatus.Read : CRUDStatus.Edit;

    const subscription = this.contractFlowService.isViewMode$.subscribe(isViewMode => {
      this.crudstatus = isViewMode ? CRUDStatus.Read : CRUDStatus.Edit;
    });
    this.subscriptions.push(subscription);
  }

  private initializeColumns(): void {
    this.contractInfoColumns = TLS13010Next2ColumnsConfig.getContractInfoColumns();
    this.annualColumns = TLS13010Next2ColumnsConfig.getAnnualColumns();
    this.commissionColumns = TLS13010Next2ColumnsConfig.getCommissionColumns();
    this.updateDetailColumns();
  }

  private async loadData(): Promise<void> {
    this.loading = true;
    try {
      // 1. 載入下拉選項
      this.discountOptions = await this.commissionDataService.loadDiscountOptions();
      this.updateDiscountColumns();

      // 2. 載入工作流程數據
      await this.loadWorkflowData();

      // 3. 載入抽成數據
      await this.loadCommissionData();

      this.dataLoaded = true;
    } finally {
      this.loading = false;
    }
  }

  private async loadWorkflowData(): Promise<void> {
    const workflowData = this.contractFlowService.getCurrentData();

    if (!workflowData.contractId && !this.contractFlowService.isNewContractMode()) {
      this.router.navigate(['account/tls/tls13010cru']);
      return;
    }

    const modeInfo = this.contractFlowService.getWorkflowModeInfo();
    this.currentTalentId = modeInfo.talentId;
    this.currentContractData = workflowData?.queryRowData; // 設定 currentContractData
    this.prepareContractInfoDisplay();
  }

  private async loadCommissionData(): Promise<void> {
    const options = {
      talentId: this.currentTalentId,
      isNewContract: this.contractFlowService.isNewContractMode(),
      currentCommissionType: this.contractFlowService.getCurrentCommissionType(),
      contractStartDate: this.getContractDate('start'),
      contractEndDate: this.getContractDate('end'),
      discountOptions: this.discountOptions
    };

    const result = await this.commissionDataService.loadCommissionData(options);

    if (result.success) {
      this.commissionData = result.data;
      this.commissionDataLoaded = true;
      this.ensureDataConsistency();
      this.saveToWorkflow();
    } else {
      this.notificationService.errorBubble('載入抽成資料失敗');
      this.commissionData = [];
      this.commissionDataLoaded = false;
    }
  }

  // === 數據處理方法 ===
  private updateDiscountColumns(): void {
    this.discountColumns = TLS13010Next2ColumnsConfig.getDiscountColumns(this.discountOptions);
    this.levelColumns = TLS13010Next2ColumnsConfig.getLevelColumns(this.discountOptions);
    this.updateDetailColumns();
  }

  private ensureDataConsistency(): void {
    this.commissionData.forEach(item => {
      // 強制重置所有項目到 discount 標籤，避免狀態混亂
      item.currentTab = 'discount';

      // 修復日期問題：確保折扣項目有正確的日期
      this.fixDiscountItemDates(item);

      // 🆕 初始化 discount 的 selected 狀態（根據是否有對應的 level）
      this.initializeDiscountSelectedState(item);

      // 🆕 填充 level 的 contract_period 欄位
      this.fillLevelContractPeriod(item);

      // 🆕 同步折扣設定到層級抽成
      // 確保層級抽成項目的數量和內容與折扣設定一致
      this.syncDiscountChangesToLevel(item);

      // 更新顯示項目
      this.tableService.updateDetailItems(item);
    });
  }

  /**
   * 🆕 初始化 discount 和 level 的 selected 狀態（雙向同步）
   * 邏輯：如果 level 存在且不是 deleted，則 discount 和 level 都設為 selected = true
   */
  private initializeDiscountSelectedState(commissionItem: CommissionItem): void {
    if (!commissionItem.discountSettingItems || !commissionItem.discountLevelItems) {
      return;
    }

    // 先處理每個 discount
    commissionItem.discountSettingItems.forEach(discount => {
      // 找到對應的 level（_status !== 'deleted'）
      const correspondingLevels = commissionItem.discountLevelItems.filter(
        level => level.charged_id === discount.id && level._status !== 'deleted'
      );

      if (correspondingLevels.length > 0) {
        // 如果有對應的 level，discount 和 level 都設為 selected = true
        discount.selected = true;
        correspondingLevels.forEach(level => {
          level.selected = true;
        });
      } else {
        // 如果沒有對應的 level，discount 設為 selected = false（除非原本就是勾選的）
        // 這裡保持原本的狀態，不強制改變
      }
    });

    // 再處理沒有對應 discount 的 level（理論上不應該發生，但保險起見）
    commissionItem.discountLevelItems.forEach(level => {
      if (level._status === 'deleted') {
        level.selected = false;
        return;
      }

      const correspondingDiscount = commissionItem.discountSettingItems.find(
        d => d.id === level.charged_id
      );

      if (correspondingDiscount) {
        // level 的 selected 跟隨 discount
        level.selected = correspondingDiscount.selected;
      } else {
        // 沒有對應的 discount，設為 false
        level.selected = false;
      }
    });

    console.log('✅ 初始化 selected 狀態完成:', {
      discounts: commissionItem.discountSettingItems.map(d => ({
        id: d.id,
        cag_barcode: d.cag_barcode,
        selected: d.selected
      })),
      levels: commissionItem.discountLevelItems.map(l => ({
        id: l.id,
        charged_id: l.charged_id,
        cag_barcode: l.cag_barcode,
        selected: l.selected,
        _status: l._status
      }))
    });
  }

  /**
   * 🆕 填充 level 的 contract_period 欄位
   */
  private fillLevelContractPeriod(commissionItem: CommissionItem): void {
    if (!commissionItem.discountSettingItems || !commissionItem.discountLevelItems) {
      return;
    }

    commissionItem.discountLevelItems.forEach(level => {
      // 找到對應的 discount
      const correspondingDiscount = commissionItem.discountSettingItems.find(
        d => d.id === level.charged_id
      );

      if (correspondingDiscount) {
        // 格式化合約期間
        level.contract_period = this.formatContractPeriod(
          correspondingDiscount.tlt_bdate,
          correspondingDiscount.tlt_edate
        );
      }
    });
  }

  /**
   * 🆕 格式化合約期間顯示
   */
  private formatContractPeriod(startDate: any, endDate: any): string {
    const formatDate = (date: any) => {
      if (!date) return '';
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    };

    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start && end ? `${start} ~ ${end}` : '';
  }

  /**
   * 修復折扣項目的日期（避免日期消失問題）
   */
  private fixDiscountItemDates(commissionItem: any): void {
    const contractStartDate = this.getContractDate('start');
    const contractEndDate = this.getContractDate('end');

    if (commissionItem.discountSettingItems) {
      commissionItem.discountSettingItems.forEach((discount: any, index: number) => {
        // 檢查並修復起始日期
        if (!discount.tlt_bdate || isNaN(new Date(discount.tlt_bdate).getTime())) {
          discount.tlt_bdate = new Date(contractStartDate);
        }
        // 檢查並修復結束日期
        if (!discount.tlt_edate || isNaN(new Date(discount.tlt_edate).getTime())) {
          discount.tlt_edate = new Date(contractEndDate);
        }
      });
    }
  }

  private prepareContractInfoDisplay(): void {
    const step1Data = this.contractFlowService.getStep1Data();
    const currentData = this.contractFlowService.getCurrentData()?.queryRowData;

    this.contractInfoData = [{
      id: this.currentTalentId || 'new',
      talent_id: step1Data?.talent_id || currentData?.talent_id || '',
      tlt_no: step1Data?.tlt_no || currentData?.tlt_no || '',
      vendor_ven_no: step1Data?.vendor_ven_no || currentData?.vendor_ven_no || '',
      apply_no: step1Data?.apply_no || currentData?.apply_no || '',
      tlt_name: step1Data?.tlt_name || currentData?.tlt_name || '',
      VEN_Name: step1Data?.VEN_Name || currentData?.VEN_Name || '',
      ven_uniform: step1Data?.ven_uniform || currentData?.ven_uniform || '',
      contract_subno: step1Data?.contract_subno || currentData?.contract_subno || '',
      tlt_bdate: step1Data?.tlt_bdate || currentData?.tlt_bdate || '',
      tlt_edate: step1Data?.tlt_edate || currentData?.tlt_edate || '',
      tlt_contract_bdate: step1Data?.tlt_contract_bdate || currentData?.tlt_contract_bdate || '',
      tlt_contract_edate: step1Data?.tlt_contract_edate || currentData?.tlt_contract_edate || '',
      tlt_term_type: (step1Data?.tlt_term_type || currentData?.tlt_term_type || '3').toString()
    }];
  }

  // === 事件處理方法 ===
  onFieldChange(event: { fieldName: string, newValue: any, rowData: any }): void {
    // 檢查是否為明細項目
    if (this.isDetailItem(event.rowData)) {
      this.handleDetailFieldChange(event);
    } else {
      this.handleMainFieldChange(event);
    }
  }

  /**
   * 判斷是否為明細項目
   */
  private isDetailItem(rowData: any): boolean {
    return !!(rowData._originalType ||
      (rowData.id?.toString().startsWith('temp_') &&
        !this.commissionData.some(item => item.id === rowData.id)));
  }

  /**
   * 處理明細項目欄位變更
   */
  private handleDetailFieldChange(event: { fieldName: string, newValue: any, rowData: any }): void {
    const { fieldName, newValue, rowData } = event;

    console.log('🔄 處理明細欄位變更:', {
      fieldName,
      newValue,
      itemId: rowData.id,
      originalType: rowData._originalType,
      currentStatus: rowData._status
    });

    // 更新明細項目的欄位值
    rowData[fieldName] = newValue;

    // 特殊處理：selected 欄位的狀態變更
    if (fieldName === 'selected') {
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
    const originalType = rowData._originalType;

    console.log('處理 selected 變更:', {
      itemId: rowData.id,
      originalType,
      newValue,
      currentStatus: rowData._status,
      hasValidId: this.hasValidId(rowData)
    });

    if (newValue === false) {
      // 取消勾選的處理邏輯
      if (originalType === 'annual') {
        // 年度業績：設為 deleted（年度業績可以刪除）
        rowData._status = 'deleted';
        console.log('年度業績項目設為 deleted');
      } else if (originalType === 'discount' || originalType === 'level') {
        // 🔑 方案 B：discount 和 level 只更新 selected 狀態，不刪除
        // 不設定 _status = 'deleted'，只是取消勾選
        console.log(`${originalType} 取消勾選，但保留資料 (ID: ${rowData.id})`);
        // selected 已經在前面更新了，這裡不需要做任何事
      } else {
        // 其他類型的通用處理
        rowData._status = 'deleted';
        console.log('其他項目設為 deleted');
      }
    } else if (newValue === true) {
      // 重新勾選的處理邏輯
      if (rowData._status === 'deleted') {
        // 從 deleted 狀態恢復
        rowData._status = this.hasValidId(rowData) ? 'original' : 'new';
        console.log(`項目從 deleted 恢復為 ${rowData._status}`);
      } else {
        // 一般的勾選變更
        this.updateItemStatus(rowData);
        console.log('一般勾選變更處理');
      }
    }

    // 🆕 如果是折扣設定的 selected 變更，同步到層級抽成
    if (originalType === 'discount') {
      const parentItem = this.findParentOfDetailItem(rowData);
      if (parentItem) {
        console.log('🔄 折扣設定勾選狀態變更，直接調用 syncDiscountLevelBasedOnSelection');
        // 🔑 直接調用 table service 的方法來同步單個 discount 對應的 level
        this.tableService.syncDiscountLevelBasedOnSelection(parentItem, rowData);
        // 更新主數組
        this.updateMainArray(parentItem);
      }
    }

    console.log('selected 處理完成，最終狀態:', rowData._status);
  }
  /**
   * 處理主項目欄位變更
   */
  private handleMainFieldChange(event: { fieldName: string, newValue: any, rowData: any }): void {
    const { fieldName, newValue, rowData } = event;

    console.log('處理主項目欄位變更:', {
      fieldName,
      newValue,
      itemId: rowData.id,
      是否為cap_saletype: fieldName === 'cap_saletype1' || fieldName === 'cap_saletype2'
    });
    rowData[fieldName] = newValue;
    // 更新狀態
    this.updateItemStatus(rowData);

    // 更新主數組
    this.updateMainArray(rowData);

    // 保存
    this.saveToWorkflow();
  }

  /**
   * 找到明細項目的父項目
   */
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

  /**
   * 同步明細到父項目數組
   */
  private syncDetailToParentArray(detailData: any, parentItem: CommissionItem): void {
    const originalType = detailData._originalType;
    const detailId = detailData.id;

    // ⚠️ 直接更新,不要創建新陣列
    switch (originalType) {
      case 'discount':
        {
          const discountIndex = parentItem.discountSettingItems.findIndex(item => item.id === detailId);
          if (discountIndex > -1) {
            // ✅ 直接更新物件屬性,不要替換整個物件
            Object.assign(parentItem.discountSettingItems[discountIndex], detailData);
          }
          break;
        }

      case 'annual':
        {
          const annualIndex = parentItem.annualPerformanceItems.findIndex(item => item.id === detailId);
          if (annualIndex > -1) {
            Object.assign(parentItem.annualPerformanceItems[annualIndex], detailData);
          }
          break;
        }

      case 'level':
        {
          const levelIndex = parentItem.discountLevelItems.findIndex(item => item.id === detailId);
          if (levelIndex > -1) {
            Object.assign(parentItem.discountLevelItems[levelIndex], detailData);
          }
          break;
        }
    }

    // 同時更新 detailItems
    const detailItemsIndex = parentItem.detailItems.findIndex(item => item.id === detailId);
    if (detailItemsIndex > -1) {
      Object.assign(parentItem.detailItems[detailItemsIndex], detailData);
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

  /**
   * 更新主數組中的項目
   */
  private updateMainArray(modifiedItem: any): void {
    const index = this.commissionData.findIndex(item => item.id === modifiedItem.id);
    if (index > -1) {
      this.commissionData[index] = { ...modifiedItem };
    }
  }

  /**
   * 更新項目狀態
   */
  private updateItemStatus(item: any): any {
    if (item._status === 'new') {
      return item;
    }

    if (item._status === 'original' || !item._status) {
      item._status = 'modified';
    }

    return item;
  }

  onDetailFieldChange(event: any): void {
    // 直接委託給統一的 onFieldChange 處理
    this.onFieldChange({
      fieldName: event.fieldName,
      newValue: event.newValue,
      rowData: event.detailData
    });
  }

  onDetailTabChange(event: { rowData: any, tabId: string }): void {
    const { rowData, tabId } = event;

    console.log('='.repeat(100));
    console.log('🔄 onDetailTabChange 開始');
    console.log('目標標籤:', tabId);
    console.log('當前標籤:', rowData.currentTab);
    console.log('切換前的 discountLevelItems:', rowData.discountLevelItems?.map((l: any) => ({
      id: l.id,
      charged_id: l.charged_id,
      cag_barcode: l.cag_barcode,
      selected: l.selected,
      _status: l._status,
      contract_period: l.contract_period
    })));
    console.log('切換前的 discountSettingItems:', rowData.discountSettingItems?.map((d: any) => ({
      id: d.id,
      cag_barcode: d.cag_barcode,
      selected: d.selected,
      _status: d._status
    })));

    // 先強制同步當前標籤的數據
    this.forceSyncCurrentTabData(rowData);

    console.log('同步後的 discountLevelItems:', rowData.discountLevelItems?.map((l: any) => ({
      id: l.id,
      charged_id: l.charged_id,
      selected: l.selected,
      _status: l._status
    })));

    // 設定新標籤
    rowData.currentTab = tabId;

    // 🆕 如果切換到層級標籤，需要動態更新欄位定義
    if (tabId === 'level') {
      console.log('🔄 切換到層級標籤，同步折扣設定並更新欄位');

      console.log('同步前的 level 數量:', rowData.discountLevelItems?.length);

      // 同步折扣設定到層級抽成
      this.syncDiscountChangesToLevel(rowData);

      console.log('同步後的 level 數量:', rowData.discountLevelItems?.length);
      console.log('同步後的 discountLevelItems:', rowData.discountLevelItems?.map((l: any) => ({
        id: l.id,
        charged_id: l.charged_id,
        selected: l.selected,
        _status: l._status
      })));

      // 更新層級欄位定義（使用當前項目的折扣設定）
      this.updateLevelColumnsForItem(rowData);
    }

    console.log('準備刷新顯示');
    // 更新顯示項目
    this.refreshItemDetailDisplay(rowData);

    console.log('刷新後的 detailItems 數量:', rowData.detailItems?.length);
    console.log('='.repeat(100));

    // 保存
    this.saveToWorkflow();
  }

  /**
   * 強制同步當前標籤的數據（避免數據遺失）
   */
  private forceSyncCurrentTabData(commissionItem: CommissionItem): void {
    const currentTab = commissionItem.currentTab || 'discount';

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
        commissionItem.discountSettingItems = currentTabItems.map(item => ({
          id: item.id,
          _source: item._source,  // 🔑 加這個
          selected: item.selected || false,
          cag_barcode: item.cag_barcode || '',
          tlt_bdate: this.ensureValidDate(item.tlt_bdate),
          tlt_edate: this.ensureValidDate(item.tlt_edate),
          cag_charge_rate: item.cag_charge_rate || 0,
          _status: item._status || (this.hasValidId(item) ? 'original' : 'new'),
          is_configured: item.is_configured || false,
          is_enabled: item.is_enabled || false
        }));
        break;

      case 'annual':
        commissionItem.annualPerformanceItems = currentTabItems.map(item => ({
          id: item.id,
          selected: item.selected || false,
          tlt_bdate: this.ensureValidDate(item.tlt_bdate),
          tlt_edate: this.ensureValidDate(item.tlt_edate),
          year_amount: item.year_amount || 0,
          extra_rate: item.extra_rate || 0,
          _status: item._status || (this.hasValidId(item) ? 'original' : 'new')
        }));
        break;

      case 'level':
        commissionItem.discountLevelItems = currentTabItems.map(item => ({
          id: item.id,
          _source: item._source,  // 🔑 加這個
          selected: item.selected || false,
          cag_barcode: item.cag_barcode || '',
          contract_period: item.contract_period || '',  // 🔑 加這個
          level_bmount: item.level_bmount || 0,
          level_eamount: item.level_eamount || 0,
          level_charge_rate: item.level_charge_rate || 0,
          charged_id: item.charged_id,  // 🔑 加這個（最重要！）
          _status: item._status || (this.hasValidId(item) ? 'original' : 'new'),
          is_configured: item.is_configured || false,
          is_enabled: item.is_enabled || false
        }));
        break;
    }
  }

  /**
   * 刷新單一項目的明細顯示
   */
  private refreshItemDetailDisplay(commissionItem: CommissionItem): void {
    const currentTab = commissionItem.currentTab || 'discount';
    let sourceArray: any[] = [];

    console.log('='.repeat(80));
    console.log('🔍 refreshItemDetailDisplay 開始');
    console.log('當前標籤:', currentTab);
    console.log('抽成類別:', commissionItem.tlt_id);

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

    console.log('📦 原始資料:', {
      類型: currentTab,
      總數: sourceArray.length,
      項目: sourceArray.map(item => ({
        id: item.id,
        charged_id: item.charged_id,
        cag_barcode: item.cag_barcode,
        selected: item.selected,
        _status: item._status,
        level_bmount: item.level_bmount,
        level_eamount: item.level_eamount
      }))
    });

    // 如果是 level 標籤,檢查 discount 資料
    if (currentTab === 'level') {
      console.log('🔍 檢查對應的 discount 資料:');
      console.log('所有 discountSettingItems:', commissionItem.discountSettingItems?.map(d => ({
        id: d.id,
        cag_barcode: d.cag_barcode,
        selected: d.selected,
        _status: d._status,
        tlt_bdate: d.tlt_bdate,
        tlt_edate: d.tlt_edate
      })));

      // 取得有效的 discount
      const validDiscounts = commissionItem.discountSettingItems
        ?.filter(d => d.selected && d._status !== 'deleted') || [];

      console.log('✅ 有效的 discounts:', {
        數量: validDiscounts.length,
        IDs: validDiscounts.map(d => d.id),
        明細: validDiscounts.map(d => ({
          id: d.id,
          cag_barcode: d.cag_barcode,
          tlt_bdate: d.tlt_bdate,
          tlt_edate: d.tlt_edate
        }))
      });

      const validDiscountIds = new Set(validDiscounts.map(d => d.id));

      console.log('🔑 有效的 discount IDs 集合:', Array.from(validDiscountIds));

      // 檢查每個 level 項目
      console.log('📋 檢查每個 level 項目:');
      sourceArray.forEach((level, index) => {
        const hasMatching = validDiscountIds.has(level.charged_id);
        console.log(`  Level ${index + 1}:`, {
          id: level.id,
          charged_id: level.charged_id,
          charged_id_type: typeof level.charged_id,
          cag_barcode: level.cag_barcode,
          _status: level._status,
          有對應discount: hasMatching,
          對應的discount: validDiscounts.find(d => d.id === level.charged_id)?.id
        });
      });
    }

    // 過濾邏輯
    commissionItem.detailItems = sourceArray
      .filter(item => {
        console.log(`  🔍 過濾項目 (id: ${item.id}):`, {
          _status: item._status,
          會被過濾: item._status === 'deleted'
        });

        // 1. 所有類型都要過濾 deleted 狀態
        if (item._status === 'deleted') {
          console.log(`    ❌ 項目 ${item.id} 被過濾 (deleted)`);
          return false;
        }

        // 2. Level 額外檢查：
        //    (a) 過濾 selected === false 的項目（方案 B）
        //    (b) 是否有對應的 discount
        if (currentTab === 'level') {
          // 🆕 方案 B：過濾掉 selected === false 的 level
          if (item.selected === false) {
            console.log(`    ❌ 項目 ${item.id} 被過濾 (selected = false)`);
            return false;
          }

          const validDiscounts = commissionItem.discountSettingItems
            ?.filter(d => d.selected && d._status !== 'deleted') || [];
          const validDiscountIds = new Set(validDiscounts.map(d => d.id));

          const hasMatchingDiscount = validDiscountIds.has(item.charged_id);

          console.log(`    🔍 Level 項目 ${item.id} 檢查:`, {
            selected: item.selected,
            charged_id: item.charged_id,
            charged_id_type: typeof item.charged_id,
            有對應: hasMatchingDiscount,
            可用IDs: Array.from(validDiscountIds),
            可用IDs_types: Array.from(validDiscountIds).map(id => typeof id)
          });

          if (!hasMatchingDiscount) {
            console.log(`    ❌ 項目 ${item.id} 被過濾 (無對應 discount)`);
            console.log(`    charged_id: ${item.charged_id} (${typeof item.charged_id})`);
            console.log(`    可用的 discount IDs: ${Array.from(validDiscountIds).join(', ')}`);
            return false;
          }

          console.log(`    ✅ 項目 ${item.id} 保留 (有對應 discount 且 selected = true)`);
        }

        return true;
      })
      .map(item => ({
        ...item,
        _originalType: currentTab
      }));

    console.log('📊 過濾結果:', {
      原始數量: sourceArray.length,
      過濾後數量: commissionItem.detailItems.length,
      顯示項目: commissionItem.detailItems.map(i => ({
        id: i.id,
        charged_id: i.charged_id,
        cag_barcode: i.cag_barcode,
        _status: i._status
      }))
    });
    console.log('='.repeat(80));
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
   * 檢查是否有有效ID
   */
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

  onAddCommissionItem(): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }

    const result = this.tableService.addCommissionItem(
      this.commissionData,
      this.getContractDate('start'),
      this.getContractDate('end'),
      this.discountOptions
    );

    if (result.success) {
      this.commissionData = [...this.commissionData, result.newItem];
      this.saveToWorkflow();
      this.notificationService.infoBubble('新增完成');
    } else {
      this.notificationService.warnBubble(result.message || '新增失敗');
    }
  }
  onAddDetailItem(parentData: any): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法新增明細項目');
      return;
    }

    const result = this.tableService.addDetailItem(
      parentData,
      this.getContractDate('start'),
      this.getContractDate('end')
    );

    if (result.success) {
      this.saveToWorkflow();
    } else {
      this.notificationService.errorBubble(result.message || '新增失敗');
    }
  }

  onBatchDelete(selectedItems: any[]): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法刪除項目');
      return;
    }

    if (!confirm(`確定要刪除選取的 ${selectedItems.length} 個項目嗎？`)) {
      return;
    }

    this.tableService.batchDeleteItems(selectedItems, this.commissionData);
    this.saveToWorkflow();
  }

  onDetailBatchDelete(event: { selectedDetails: any[], parentData: any }): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法刪除項目');
      return;
    }

    const { selectedDetails, parentData } = event;

    if (!confirm(`確定要刪除選取的 ${selectedDetails.length} 個明細項目嗎？`)) {
      return;
    }

    // 處理刪除邏輯
    selectedDetails.forEach(detail => {
      if (detail._status === 'new' || !this.hasValidId(detail)) {
        // 新項目直接從數組移除
        this.removeDetailFromArrays(detail, parentData);
      } else {
        // 現有項目標記為 deleted
        detail._status = 'deleted';
        this.syncDetailToParentArray(detail, parentData);
      }
    });

    // 重新刷新顯示
    this.refreshItemDetailDisplay(parentData);
    this.updateMainArray(parentData);
    this.saveToWorkflow();
  }

  /**
   * 從所有相關數組中移除明細項目
   */
  private removeDetailFromArrays(detail: any, parentData: any): void {
    const detailId = detail.id;

    // 從 detailItems 移除
    const detailIndex = parentData.detailItems.findIndex((item: any) => item.id === detailId);
    if (detailIndex > -1) {
      parentData.detailItems.splice(detailIndex, 1);
    }

    // 從對應的具體數組移除
    const currentTab = parentData.currentTab || 'discount';
    switch (currentTab) {
      case 'discount':
        {
          const discountIndex = parentData.discountSettingItems.findIndex((item: any) => item.id === detailId);
          if (discountIndex > -1) {
            parentData.discountSettingItems.splice(discountIndex, 1);
          }
          break;
        }
      case 'annual':
        {
          const annualIndex = parentData.annualPerformanceItems.findIndex((item: any) => item.id === detailId);
          if (annualIndex > -1) {
            parentData.annualPerformanceItems.splice(annualIndex, 1);
          }
          break;
        }
      case 'level':
        {
          const levelIndex = parentData.discountLevelItems.findIndex((item: any) => item.id === detailId);
          if (levelIndex > -1) {
            parentData.discountLevelItems.splice(levelIndex, 1);
          }
          break;
        }
    }
  }

  /**
   * 處理按鈕點擊事件
   */
  onButtonClick(event: { action: string, rowData: any, parentData?: any }): void {
    const { action, rowData, parentData } = event;

    console.log('🔘 按鈕點擊:', { action, rowData, parentData });

    switch (action) {
      case 'copyDiscount':
        this.handleCopyDiscount(rowData, parentData);
        break;
      default:
        console.warn('未知的按鈕動作:', action);
    }
  }

  /**
   * 處理複製折扣設定
   */
  private handleCopyDiscount(discountItem: any, parentData: any): void {
    if (this.isViewMode) {
      this.notificationService.infoBubble('檢視模式下無法複製項目');
      return;
    }

    console.log('📋 複製折扣設定:', discountItem);

    // 使用 table service 複製項目
    const result = this.tableService.copyDiscountItem(discountItem, parentData, this.discountOptions);

    if (result.success) {
      // 同步到層級抽成
      this.syncDiscountChangesToLevel(parentData);

      // 更新顯示
      this.refreshItemDetailDisplay(parentData);
      this.updateMainArray(parentData);
      this.saveToWorkflow();

      this.notificationService.successBubble('折扣設定已複製');
    } else {
      this.notificationService.errorBubble(result.message || '複製失敗');
    }
  }

  /**
   * 同步折扣設定變更到層級抽成
   */
  private syncDiscountChangesToLevel(parentData: any): void {
    // 使用 table service 的同步方法
    this.tableService.syncDiscountToLevel(parentData, this.discountOptions);

    // 如果當前在層級標籤，需要重新產生層級抽成的下拉選項
    if (parentData.currentTab === 'level') {
      this.updateLevelColumnsForItem(parentData);
    }
  }

  /**
   * 更新特定項目的層級抽成欄位定義（動態下拉選項）
   */
  private updateLevelColumnsForItem(parentData: any): void {
    // 從折扣設定取得層級抽成的下拉選項
    const levelOptions = this.tableService.getDiscountOptionsForLevel(parentData, this.discountOptions);

    // 更新層級欄位的選項
    this.levelColumns = TLS13010Next2ColumnsConfig.getLevelColumns(levelOptions);
    this.updateDetailColumns();
  }

  // === 標籤切換 ===
  changeSettingTab(tab: string): void {
    this.selectedSettingTab = tab;
    this.updateDetailColumns();
    this.updateAllDetailItems();
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

  private updateAllDetailItems(): void {
    this.commissionData.forEach(item => {
      this.tableService.updateDetailItems(item);
    });
    this.cdr.detectChanges();
  }

  // === 驗證和提交 ===
  /**
   * 🔧 確保所有已勾選的 discount 都有對應的 level 項目
   * 這個方法在提交前調用，確保即使使用者沒有切換到 level 標籤，
   * 也能正確建立 level 項目
   */
  private ensureAllDiscountsHaveLevels(): void {
    console.log('='.repeat(80));
    console.log('🔄 開始確保所有 discount 都有對應的 level');

    this.commissionData.forEach((commissionItem, commissionIndex) => {
      // 跳過已刪除的抽成項目
      if (commissionItem._status === 'deleted') {
        return;
      }

      console.log(`\n處理抽成項目 ${commissionIndex + 1}: ${commissionItem.tlt_id_desc}`);

      // 遍歷所有折扣設定
      commissionItem.discountSettingItems?.forEach((discount, discountIndex) => {
        console.log(`  檢查 discount ${discountIndex + 1}: ${discount.cag_barcode}, selected: ${discount.selected}, status: ${discount._status}`);

        // 只處理已勾選且未刪除的 discount
        if (!discount.selected || discount._status === 'deleted') {
          console.log(`    ⏭️ 跳過 (未勾選或已刪除)`);
          return;
        }

        // 檢查是否已有對應的 level
        const existingLevels = commissionItem.discountLevelItems?.filter(
          level => level.charged_id === discount.id && level._status !== 'deleted'
        ) || [];

        console.log(`    找到 ${existingLevels.length} 個對應的 level (charged_id: ${discount.id})`);

        if (existingLevels.length === 0) {
          // 沒有對應的 level，需要新增
          console.log(`    ✨ 需要新增 level 項目`);
          this.tableService.syncDiscountLevelBasedOnSelection(commissionItem, discount);
          console.log(`    ✅ 已為 ${discount.cag_barcode} 新增 level 項目`);
        } else {
          // 已有對應的 level，確保 selected = true
          existingLevels.forEach(level => {
            if (!level.selected) {
              console.log(`    🔧 修正 level selected 狀態: false → true`);
              level.selected = true;
            }
          });
        }
      });
    });

    console.log('\n✅ 所有 discount 的 level 檢查完成');
    console.log('='.repeat(80));
  }

  async onSubmitNext(): Promise<void> {
    console.log('📝 Next2: 準備提交契約資料');

    // 🔒 防止重複提交
    if (this.loading) {
      console.warn('⚠️ 正在提交中，忽略重複請求');
      return;
    }

    // 🔧 關鍵修正：在提交前強制同步所有 discount 到 level
    console.log('🔄 提交前強制同步所有 discount 到 level');
    this.ensureAllDiscountsHaveLevels();

    // 驗證資料
    const validation = this.validationService.validateAllData(this.commissionData);
    if (!validation.isValid) {
      this.notificationService.errorBubble(validation.errors[0]);
      return;
    }

    // 保存到工作流程
    this.saveToWorkflow();

    try {
      this.loading = true;

      // 使用統一的提交服務
      const result = await this.contractSubmitService.submitContract({
        isNext2Flow: true, // ⭐ 標記為 Next2 流程
        onSuccess: (response) => {
          console.log('Next2 提交成功，額外處理:', response);
        },
        onError: (error) => {
          console.error('Next2 提交失敗，額外處理:', error);
        }
      });

      if (!result.success) {
        console.error('Next2: 提交流程失敗');
      }

    } finally {
      this.loading = false;
    }
  }

  onConfirmDialogResult(confirmed: boolean): void {
    this.showConfirmDialog = false;
    if (confirmed) {
      this.onSubmitNext();
    }
  }

  // === 導航方法 ===
  override onCancel(): void {
    this.saveToWorkflow();

    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url }
    };

    this.router.navigate(['account/tls/tls13010next1'], extras);
  }

  onClearAndExit(): void {
    this.contractFlowService.clearTempData();

    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url }
    };

    this.router.navigate(['account/tls/tls13010'], extras);
    this.notificationService.infoBubble('已清空暫存資料並離開');
  }

  // === 工具方法 ===
  private saveToWorkflow(): void {
    // 直接傳送，不經過 prepareCommissionDataForSubmit
    this.contractFlowService.saveStep3Data(this.commissionData);
  }

  private getContractDate(type: 'start' | 'end'): string {
    const step1Data = this.contractFlowService.getStep1Data();
    const fieldName = type === 'start' ? 'tlt_bdate' : 'tlt_edate';

    if (step1Data?.[fieldName]) {
      return this.formatDateString(step1Data[fieldName]);
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

  // === Getter 方法 ===
  get visibleCommissionData() {
    return this.commissionData.filter(item => item._status !== 'deleted');
  }

  get isGeneralCommissionMode(): boolean {
    return this.currentCommissionType === '3';
  }

  get currentCommissionType(): string {
    if (this.contractInfoData?.length > 0) {
      return this.contractInfoData[0].tlt_term_type || '3';
    }
    return this.contractFlowService.getStep1Data()?.tlt_term_type?.toString() || '3';
  }

  hasCommissionData(): boolean {
    return this.dataLoaded && this.commissionData.filter(item => item._status !== 'deleted').length > 0;
  }

  getCommissionItemCount(): number {
    return this.commissionData.filter(item => item._status !== 'deleted').length;
  }

  // === 空的事件處理方法（保持模板兼容） ===
  onItemEdit(item: any): void { }
  onItemCancel(item: any): void { }
  onItemSave(event: any): void { }
  onDetailEdit(event: any): void { }
  onDetailSave(event: any): void { }
  onDetailCancel(item: any): void { }
  onBeforeDetailSave(event: any): void { }
  onDropdownChange(event: any): void { }

  onDetailButtonClick(event: {
    detailData: any;
    field: string;
    parentData: any;
  }): void {
    console.log('詳細按鈕點擊事件:', event);

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

    console.log('開始複製項目:', sourceItem);

    // 取得當前標籤
    const currentTab = parentData.currentTab || 'discount';

    // 只處理 discount 和 level
    if (currentTab !== 'discount' && currentTab !== 'level') {
      console.log('此標籤類型不支援複製功能');
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
  private createCopiedItem(sourceItem: any, itemType: string): any {
    const tempId = this.generateTempId();

    // 基礎複製物件
    const copiedItem: any = {
      id: tempId,
      _status: 'new',
      selected: false,  // 複製的項目預設不勾選
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

    console.log('複製完成的項目:', copiedItem);
    return copiedItem;
  }

  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }

  /**
 * 前往 Next3（不提交後端，只導航）
 */
  onGoToNext3(): void {
    console.log('📝 Next2: 前往 Next3 設定條件');

    // 🔧 關鍵修正：在前往 Next3 前也要確保 discount 都有對應的 level
    console.log('🔄 前往 Next3 前強制同步所有 discount 到 level');
    this.ensureAllDiscountsHaveLevels();

    // 驗證資料
    const validation = this.validationService.validateAllData(this.commissionData);
    if (!validation.isValid) {
      this.notificationService.errorBubble(validation.errors[0]);
      return;
    }

    // 只保存到暫存，不提交後端
    this.saveToWorkflow();

    // 直接導航到 Next3
    this.router.navigate(['account/tls/tls13010next3']);

    // 提示訊息
    // this.notificationService.infoBubble('抽成資料已暫存，請繼續設定條件');
  }
}
