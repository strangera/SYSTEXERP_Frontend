// tls13010-next2.component.ts - 重構簡化版本
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { lastValueFrom, Subscription } from 'rxjs';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { ContractFlowService } from '../tls13010/services/contract-flow.service';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { ContractInfo, CommissionItem, WorkflowStep } from '../tls13010/tls13010.model';
import { CommissionDataService } from './Services/commission-data.service';
import { TLS13010Next2ColumnsConfig } from './Services/tls13010-next2-columns.config';
import { CommissionTableService } from './Services/commission-table.service';
import { CommissionValidationService } from './Services/commission-validation.service';
import { AccordionModule } from "primeng/accordion";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { NgIf } from '@angular/common';
import { ButtonComponent } from "@shared/componentkit/button/button.component";
import { DialogModule } from "primeng/dialog";
import { MenubarComponent } from "@shared/component/menubar/menubar.component";
import { Button } from "primeng/button";

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
  isViewMode = false;
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
    private validationService: CommissionValidationService, // 新建
    private tableService: CommissionTableService, // 新建
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
    this.isViewMode = this.contractFlowService.isViewMode();
    const subscription = this.contractFlowService.isViewMode$.subscribe(isViewMode => {
      this.isViewMode = isViewMode;
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

      // 關鍵：載入後立即同步 cap_saletype1 和 cap_saletype2
      this.syncCapSaletypeFromStep1();

      this.ensureDataConsistency();
      this.saveToWorkflow();
    } else {
      this.notificationService.errorBubble('載入抽成資料失敗');
      this.commissionData = [];
      this.commissionDataLoaded = false;
    }
  }
  private syncCapSaletypeFromStep1(): void {
    const step1Data = this.contractFlowService.getStep1Data();
    if (!step1Data) return;

    // Y/N → boolean 轉換（供 checkbox 顯示）
    const toBoolean = (value: any): boolean => {
      return (value === true || value === 'Y' || value === 'true');
    };

    const standardCap1 = toBoolean(step1Data.cap_saletype1);
    const standardCap2 = toBoolean(step1Data.cap_saletype2);

    // 只需要同步到抽成項目就好
    this.commissionData.forEach((item) => {
      if (item._status !== 'deleted') {
        item.cap_saletype1 = standardCap1;
        item.cap_saletype2 = standardCap2;
      }
    });

    // 刪除多餘的 contractInfoData 同步
  }

  // 修改：當 Next2 的 cap_saletype 改變時，同步回 Step1
  private syncCapSaletypeToStep1(fieldName: string, newValue: boolean): void {
    // boolean → Y/N 轉換
    const ynValue = newValue ? 'Y' : 'N';

    console.log(`同步到 Step1: ${fieldName} = ${newValue} → ${ynValue}`);

    // 更新 step1 資料（存為 Y/N 格式）
    const step1Data = this.contractFlowService.getStep1Data();
    if (step1Data) {
      step1Data[fieldName] = ynValue;
      this.contractFlowService.saveStep1Data(step1Data);
      console.log('已同步回 Step1');
    }
  }

  // 在 next2 中新增轉換方法
  private convertToYN(value: any): string {
    if (value === true || value === 'true' || value === 'Y') return 'Y';
    if (value === false || value === 'false' || value === 'N') return 'N';
    return 'N'; // 預設為 N
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

      // 更新顯示項目
      this.tableService.updateDetailItems(item);
    });
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
        // 年度業績：直接設為 deleted，會從顯示中移除
        rowData._status = 'deleted';
        console.log('年度業績項目設為 deleted');
      } else if (originalType === 'discount' || originalType === 'level') {
        // 折扣和層級：根據是否有有效ID決定處理方式
        if (this.hasValidId(rowData)) {
          // 現有項目：設為 deleted 狀態（會在最終清理時進入 toDelete）
          rowData._status = 'deleted';
          console.log(`${originalType} 現有項目設為 deleted (ID: ${rowData.id})`);
        } else {
          // 新項目：直接從數組移除（不需要發送到後端）
          console.log(`${originalType} 新項目將被移除 (臨時ID: ${rowData.id})`);
          // 這裡可以選擇設為 deleted 或者在同步時直接移除
          rowData._status = 'deleted';
        }
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

    // 更新欄位值
    rowData[fieldName] = newValue;

    // 特殊處理：如果是 cap_saletype1 或 cap_saletype2，需要統一同步
    if (fieldName === 'cap_saletype1' || fieldName === 'cap_saletype2') {
      // 關鍵：統一設定所有抽成類別的相同欄位
      this.syncCapSaletypeToAllItems(fieldName, newValue);

      // 同步回 Step1
      this.syncCapSaletypeToStep1(fieldName, newValue);
    }

    // 更新狀態
    this.updateItemStatus(rowData);

    // 更新主數組
    this.updateMainArray(rowData);

    // 保存
    this.saveToWorkflow();
  }

  /**
   * 新增：統一同步所有抽成類別的 cap_saletype
   */
  private syncCapSaletypeToAllItems(fieldName: string, newValue: boolean): void {
    console.log(`統一設定所有抽成類別的 ${fieldName} = ${newValue}`);

    let updatedCount = 0;

    // 統一設定所有抽成項目的相同欄位
    this.commissionData.forEach((item, index) => {
      if (item._status !== 'deleted') {
        const oldValue = item[fieldName];

        // 更新值
        item[fieldName] = newValue;

        // 更新狀態
        this.updateItemStatus(item);

        if (oldValue !== newValue) {
          updatedCount++;
          console.log(`抽成項目 ${index + 1} (${item.tlt_id_desc}): ${fieldName} ${oldValue} → ${newValue}`);
        }
      }
    });

    // 同步到顯示資料（合約資訊表格，如果有的話）
    if (this.contractInfoData?.length > 0) {
      this.contractInfoData[0][fieldName] = newValue;
    }

    console.log(`統一同步完成，共更新了 ${updatedCount} 個抽成項目`);

    // 顯示提示訊息
    if (updatedCount > 1) {
      const actionText = newValue ? '勾選' : '取消勾選';
      const fieldText = fieldName === 'cap_saletype1' ? '滿件送佰' : '全館消費滿額集點活動';
      this.notificationService.infoBubble(`已統一${actionText}所有抽成類別的「${fieldText}」`);
    }
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
    const currentTab = parentItem.currentTab || 'discount';
    const detailId = detailData.id;
    const originalType = detailData._originalType;

    console.log('🔗 同步明細到父項目:', {
      detailId,
      originalType,
      currentTab,
      status: detailData._status,
      selected: detailData.selected
    });

    // 根據 originalType 而不是 currentTab 來決定更新哪個數組
    switch (originalType) {
      case 'discount':
        this.updateItemInArray(parentItem.discountSettingItems, detailId, detailData);
        break;
      case 'annual':
        this.updateItemInArray(parentItem.annualPerformanceItems, detailId, detailData);
        break;
      case 'level':
        this.updateItemInArray(parentItem.discountLevelItems, detailId, detailData);
        break;
      default:
        // 如果沒有 originalType，回退到使用 currentTab
        switch (currentTab) {
          case 'discount':
            this.updateItemInArray(parentItem.discountSettingItems, detailId, detailData);
            break;
          case 'annual':
            this.updateItemInArray(parentItem.annualPerformanceItems, detailId, detailData);
            break;
          case 'level':
            this.updateItemInArray(parentItem.discountLevelItems, detailId, detailData);
            break;
        }
    }

    // 同時更新 detailItems（用於顯示）
    this.updateItemInArray(parentItem.detailItems, detailId, detailData);
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

    // 先強制同步當前標籤的數據
    this.forceSyncCurrentTabData(rowData);

    // 設定新標籤
    rowData.currentTab = tabId;

    // 更新顯示項目
    this.refreshItemDetailDisplay(rowData);

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
          selected: item.selected || false,
          cag_barcode: item.cag_barcode || '',
          level_bmount: item.level_bmount || 0,
          level_eamount: item.level_eamount || 0,
          level_charge_rate: item.level_charge_rate || 0,
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

    // 只過濾真正的 deleted（annual 刪除），不過濾 selected 狀態
    commissionItem.detailItems = sourceArray
      .filter(item => {
        // 只有 annual 才需要過濾 deleted 狀態讓項目消失
        if (currentTab === 'annual' && item._status === 'deleted') {
          return false;
        }
        return true;
      })
      .map(item => ({
        ...item,
        _originalType: currentTab
      }));
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
      // 關鍵：新增後立即確保與 step1 同步
      const step1Data = this.contractFlowService.getStep1Data();
      if (step1Data) {
        result.newItem.cap_saletype1 = Boolean(step1Data.cap_saletype1);
        result.newItem.cap_saletype2 = Boolean(step1Data.cap_saletype2);
      }

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
  onSubmitNext(): void {
    const validation = this.validationService.validateAllData(this.commissionData);

    if (!validation.isValid) {
      this.notificationService.errorBubble(validation.errors[0]);
      return;
    }

    if (this.isViewMode) {
      this.navigateToNext();
      return;
    }

    if (this.isGeneralCommissionMode) {
      this.showConfirmDialog = true;
    } else {
      this.navigateToNext();
    }
  }

  onConfirmDialogResult(confirmed: boolean): void {
    this.showConfirmDialog = false;
    if (confirmed) {
      this.submitContract();
    }
  }

  private async submitContract(): Promise<void> {
    this.loading = true;
    this.notificationService.blockUi();

    try {
      const cleanData = this.contractFlowService.generateCleanSubmitData();
      const response = await lastValueFrom(this.tls13010Service.submitFinalTLS13010(cleanData));

      this.notificationService.successBubble('契約資料提交成功！');
      this.contractFlowService.onSubmitSuccess();

      setTimeout(() => {
        this.router.navigate(['account/tls/tls13010']);
      }, 2000);

    } catch (error) {
      this.notificationService.errorBubble('契約資料提交失敗');
    } finally {
      this.loading = false;
      this.notificationService.unblockUi();
    }
  }

  private navigateToNext(): void {
    if (this.isGeneralCommissionMode) {
      this.router.navigate(['account/tls/tls13010']);
    } else {
      this.router.navigate(['account/tls/tls13010next3']);
    }
  }

  // === 導航方法 ===
  override onCancel(): void {
    this.saveToWorkflow();
    this.router.navigate(['account/tls/tls13010next1']);
  }

  onClearAndExit(): void {
    this.contractFlowService.clearTempData();
    this.router.navigate(['account/tls/tls13010']);
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
}
