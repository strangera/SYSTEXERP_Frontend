/**
 * TLS13020 Step 3: 抽成設定
 * 直接複用 TLS13010-v2 的子組件和服務
 */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';

import { NotificationService } from '@shared/component/notification-message/notification.service';
import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

// 使用 TLS13010-v2 的常數、模型、服務
import { CommissionType, CommissionTypeLabels } from '../../../../../tls13010-v2/core/constants';
import {
  getAnnualColumns,
  getCommissionMainColumns,
  getContractInfoColumns,
  getDiscountColumns,
  getLevelColumns
} from '../../../../../tls13010-v2/core/constants/commission-columns';
import {
  AnnualPerformanceItem,
  CommissionItem,
  ContractInfo,
  DiscountLevelItem,
  DiscountSettingItem,
  DropdownOption
} from '../../../../../tls13010-v2/core/models';

// 服務
import { CommissionCopyService } from '../../../../../tls13010-v2/services/commission/commission-copy.service';
import { CommissionCrudService, DetailType } from '../../../../../tls13010-v2/services/commission/commission-crud.service';
import { CommissionRemarkService } from '../../../../../tls13010-v2/services/commission/commission-remark.service';
import { CommissionSyncService } from '../../../../../tls13010-v2/services/commission/commission-sync.service';
import { CommissionDateValidatorService } from '../../../../../tls13010-v2/services/validation/commission-date-validator.service';
import { CommissionSubmitValidatorService } from '../../../../../tls13010-v2/services/validation/commission-submit-validator.service';

// 子組件
import {
  CommissionInfoComponent
} from '../../../../../tls13010-v2/components/contract-wizard/steps/step3-commission/commission-info/commission-info.component';
import {
  AddDetailEvent,
  BatchDeleteEvent,
  ButtonClickEvent,
  CommissionTableComponent,
  DetailBatchDeleteEvent,
  DetailFieldChangeEvent,
  FieldChangeEvent,
  TabChangeEvent
} from '../../../../../tls13010-v2/components/contract-wizard/steps/step3-commission/commission-table/commission-table.component';

@Component({
  selector: 'app-step3-commission',
  templateUrl: './step3-commission.component.html',
  styleUrls: ['./step3-commission.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CommissionInfoComponent,
    CommissionTableComponent
  ]
})
export class Step3CommissionComponent implements OnInit, OnChanges {
  // === 服務注入 ===
  private notificationService = inject(NotificationService);
  private syncService = inject(CommissionSyncService);
  private copyService = inject(CommissionCopyService);
  private remarkService = inject(CommissionRemarkService);
  private crudService = inject(CommissionCrudService);
  private dateValidator = inject(CommissionDateValidatorService);
  private submitValidator = inject(CommissionSubmitValidatorService);

  // === 輸入屬性 ===
  @Input() commissionItems: CommissionItem[] = [];
  @Input() commissionType = '';
  @Input() crudstatus: CRUDStatus = CRUDStatus.Create;
  @Input() contractStartDate = '';
  @Input() contractEndDate = '';
  @Input() contractInfo: ContractInfo | null = null;
  @Input() discountOptions: DropdownOption[] = [];
  @Input() isViewMode = false;

  // 參加資訊（同步自第一步驟）
  @Input() capSaletype1: boolean | string = false;
  @Input() capSaletype2: boolean | string = false;
  @Input() capSaletype3: boolean | string = false;
  @Input() capSaletype5: boolean | string = false;

  // === 輸出事件 ===
  @Output() commissionItemsChange = new EventEmitter<CommissionItem[]>();

  // === 狀態 ===
  readonly CRUDStatus = CRUDStatus;
  readonly CommissionType = CommissionType;
  dataLoaded = false;

  // === 欄位配置 ===
  contractInfoColumns: ColumnDef[] = [];
  commissionColumns: ColumnDef[] = [];
  detailColumnsMapCache: Record<string, ColumnDef[]> = {};

  // === 設定標籤頁 ===
  settingTabs = [
    { id: 'discount', label: '折扣設定', allowAdd: false, allowBatchDelete: false, showCheckbox: false },
    { id: 'level', label: '折扣別層級抽成設定', allowAdd: false, allowBatchDelete: false, showCheckbox: false },
    { id: 'annual', label: '年度總業績抽成設定', allowAdd: true, allowBatchDelete: true, showCheckbox: true }
  ];

  // === 計算屬性 ===
  get isFormReadonly(): boolean {
    return this.crudstatus === CRUDStatus.Read || this.isViewMode;
  }

  get commissionTypeName(): string {
    return CommissionTypeLabels[this.commissionType as CommissionType] || this.commissionType || '未設定';
  }

  get requiresCommission(): boolean {
    return this.commissionType !== '' &&
      this.commissionType !== CommissionType.FIXED_RENT;
  }

  get contractInfoDataArray(): ContractInfo[] {
    return this.contractInfo ? [this.contractInfo] : [];
  }

  get detailColumnsMap(): Record<string, ColumnDef[]> {
    return this.detailColumnsMapCache;
  }

  // === 生命週期 ===
  ngOnInit(): void {
    this.initializeColumns();
    this.initializeData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['discountOptions'] && !changes['discountOptions'].firstChange) {
      this.updateDetailColumnsMap();
    }
  }

  private initializeColumns(): void {
    this.contractInfoColumns = getContractInfoColumns();
    this.commissionColumns = getCommissionMainColumns();
    this.updateDetailColumnsMap();
  }

  private updateDetailColumnsMap(): void {
    this.detailColumnsMapCache = {
      'discount': getDiscountColumns(this.discountOptions),
      'annual': getAnnualColumns(),
      'level': getLevelColumns(this.discountOptions)
    };
  }

  private initializeData(): void {
    this.commissionItems.forEach(item => {
      this.ensureDataConsistency(item);
    });
    this.dataLoaded = true;
  }

  // === 事件處理 ===
  onFieldChange(event: FieldChangeEvent): void {
    const { fieldName, newValue, rowData } = event;
    const item = rowData as CommissionItem;

    item[fieldName as keyof CommissionItem] = newValue as never;
    this.crudService.updateItemStatus(item);
    this.emitChanges();
  }

  onDetailFieldChange(event: DetailFieldChangeEvent): void {
    const { fieldName, newValue, detailData, parentData } = event;
    const detail = detailData as DiscountSettingItem | AnnualPerformanceItem | DiscountLevelItem;
    const originalType = (detail as { _originalType?: string })._originalType || 'discount';

    // 找到來源陣列中的原始項目（單向資料流：直接修改來源）
    if (detail.id == null) return;
    const sourceItem = this.findSourceItem(parentData, detail.id, originalType as DetailType);
    if (!sourceItem) return;

    // 日期驗證
    if (fieldName === 'tlt_bdate' || fieldName === 'tlt_edate') {
      if (!this.validateDateField(sourceItem, fieldName, newValue)) {
        return;
      }
    }

    // 更新來源陣列中的欄位值
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sourceItem as any)[fieldName] = newValue;

    // 特殊處理：selected 欄位
    if (fieldName === 'selected' && originalType === 'discount') {
      this.handleDiscountSelectedChange(sourceItem as DiscountSettingItem, parentData, newValue as boolean);
    }

    // 同步 discount 日期到 level
    if ((fieldName === 'tlt_bdate' || fieldName === 'tlt_edate') && originalType === 'discount') {
      this.syncService.syncDiscountDateToLevel(sourceItem as DiscountSettingItem, parentData);
    }

    // 更新狀態
    this.crudService.updateItemStatus(sourceItem);
    this.crudService.updateItemStatus(parentData);

    // 重新產生 detailItems（單向流：來源→顯示）
    this.crudService.updateDetailItems(parentData);

    // discount 任何欄位變更都需要更新折扣摘要（cag_charge_rate、日期等）
    if (originalType === 'discount') {
      parentData.remark = this.remarkService.formatRemarkText(parentData);
    }

    this.emitChanges();
  }

  onDetailTabChange(event: TabChangeEvent): void {
    const { rowData, tabId } = event;

    // 切換標籤（來源陣列已是最新，不需要同步）
    rowData.currentTab = tabId;

    // 如果切換到 level 標籤，需要同步折扣設定
    if (tabId === 'level') {
      this.syncService.syncDiscountToLevel(rowData);
      this.syncService.fillLevelContractPeriod(rowData);
    }

    // 更新顯示項目
    this.crudService.updateDetailItems(rowData);
    this.emitChanges();
  }

  onAddCommissionItem(): void {
    if (this.isFormReadonly) {
      this.notificationService.infoBubble('檢視模式下無法新增項目');
      return;
    }

    const result = this.crudService.addCommissionItem(this.commissionItems, {
      contractStartDate: this.contractStartDate,
      contractEndDate: this.contractEndDate,
      discountOptions: this.discountOptions,
      // 同步第一步驟的參加資訊
      defaultCapSaletype1: this.capSaletype1 === 'Y' || this.capSaletype1 === true,
      defaultCapSaletype2: this.capSaletype2 === 'Y' || this.capSaletype2 === true,
      defaultCapSaletype3: this.capSaletype3 === 'Y' || this.capSaletype3 === true,
      defaultCapSaletype5: this.capSaletype5 === 'Y' || this.capSaletype5 === true
    });

    if (result.success) {
      const newItem = result.data as CommissionItem;
      newItem.remark = this.remarkService.formatRemarkText(newItem);
      this.commissionItems = [...this.commissionItems, newItem];
      this.emitChanges();
      this.notificationService.infoBubble('新增完成');
    } else {
      this.notificationService.warnBubble(result.message || '新增失敗');
    }
  }

  onAddDetailItem(event: AddDetailEvent): void {
    if (this.isFormReadonly) {
      this.notificationService.infoBubble('檢視模式下無法新增明細項目');
      return;
    }

    const parentData = event.parentData;
    const currentTab = parentData.currentTab || 'discount';

    const result = this.crudService.addDetailItem(
      parentData,
      currentTab as DetailType,
      this.contractStartDate,
      this.contractEndDate
    );

    if (result.success) {
      this.emitChanges();
    } else {
      this.notificationService.errorBubble(result.message || '新增失敗');
    }
  }

  onBatchDelete(event: BatchDeleteEvent): void {
    if (this.isFormReadonly) {
      this.notificationService.infoBubble('檢視模式下無法刪除項目');
      return;
    }

    this.crudService.batchDeleteItems(
      event.selectedItems as CommissionItem[],
      this.commissionItems
    );
    this.emitChanges();
  }

  onDetailBatchDelete(event: DetailBatchDeleteEvent): void {
    if (this.isFormReadonly) {
      this.notificationService.infoBubble('檢視模式下無法刪除項目');
      return;
    }

    const parentData = event.parentData;
    const currentTab = parentData.currentTab || 'discount';

    const result = this.crudService.batchDeleteDetailItems(
      event.selectedDetails as (DiscountSettingItem | AnnualPerformanceItem | DiscountLevelItem)[],
      parentData,
      currentTab as DetailType
    );

    if (currentTab === 'discount') {
      parentData.remark = this.remarkService.formatRemarkText(parentData);
    }

    if (result.blockedCount > 0) {
      this.notificationService.warnBubble(
        `已刪除 ${result.deletedCount} 項，${result.blockedCount} 項因為是已勾選折扣的最後一個層級項目而無法刪除`
      );
    } else if (result.deletedCount > 0) {
      this.notificationService.infoBubble(`已刪除 ${result.deletedCount} 項`);
    }

    this.emitChanges();
  }

  onDetailButtonClick(event: ButtonClickEvent): void {
    if (this.isFormReadonly) {
      this.notificationService.infoBubble('檢視模式下無法執行此操作');
      return;
    }

    const { field, detailData, parentData } = event;
    const originalType = (detailData as { _originalType?: string })._originalType || 'discount';

    if (field === 'copy_button' || field === 'copy_level_button') {
      if (originalType === 'discount') {
        this.handleCopyDiscount(detailData as DiscountSettingItem, parentData);
      } else if (originalType === 'level') {
        this.handleCopyLevel(detailData as DiscountLevelItem, parentData);
      }
    }

    if (field === 'delete_level_button') {
      this.handleDeleteLevel(detailData as DiscountLevelItem, parentData);
    }
  }

  // === 私有方法 ===

  /**
   * 根據 id 和類型，從來源陣列中找到原始項目
   */
  private findSourceItem(
    parentItem: CommissionItem,
    itemId: string | number,
    type: DetailType
  ): DiscountSettingItem | AnnualPerformanceItem | DiscountLevelItem | undefined {
    switch (type) {
      case 'discount':
        return parentItem.discountSettingItems.find(d => d.id === itemId);
      case 'annual':
        return parentItem.annualPerformanceItems.find(a => a.id === itemId);
      case 'level':
        return parentItem.discountLevelItems.find(l => l.id === itemId);
    }
  }

  private handleDeleteLevel(levelItem: DiscountLevelItem, parentData: CommissionItem): void {
    if (levelItem.charged_id) {
      const relatedLevelItems = parentData.discountLevelItems?.filter(
        l => l.charged_id === levelItem.charged_id && l._status !== 'deleted' && l.id !== levelItem.id
      ) || [];

      const relatedDiscount = parentData.discountSettingItems?.find(d => d.id === levelItem.charged_id);
      const isDiscountSelected = relatedDiscount?.selected === true;

      if (isDiscountSelected && relatedLevelItems.length === 0) {
        this.notificationService.warnBubble('已勾選的折扣設定至少需要保留一個層級抽成項目');
        return;
      }
    }

    this.crudService.removeDetailItem(levelItem, parentData, 'level');
    this.emitChanges();
    this.notificationService.infoBubble('已刪除層級抽成項目');
  }

  private handleDiscountSelectedChange(
    discountItem: DiscountSettingItem,
    parentData: CommissionItem,
    selected: boolean
  ): void {
    discountItem.selected = selected;

    if (selected) {
      discountItem.is_enabled = true;
      discountItem.is_configured = true;
    } else {
      discountItem.is_enabled = false;
    }

    this.syncService.syncDiscountLevelBasedOnSelection(parentData, discountItem);
    parentData.remark = this.remarkService.formatRemarkText(parentData);
  }

  private handleCopyDiscount(sourceItem: DiscountSettingItem, parentData: CommissionItem): void {
    if (!parentData.mainEndDate) {
      parentData.mainEndDate = this.contractEndDate;
    }

    const result = this.copyService.copyDiscountItem(sourceItem, parentData);

    if (result.success) {
      this.crudService.updateDetailItems(parentData);
      parentData.remark = this.remarkService.formatRemarkText(parentData);
      this.emitChanges();
      this.notificationService.infoBubble('複製完成');
    } else {
      this.notificationService.warnBubble(result.message || '複製失敗');
    }
  }

  private handleCopyLevel(sourceItem: DiscountLevelItem, parentData: CommissionItem): void {
    const result = this.copyService.copyLevelItem(sourceItem, parentData);

    if (result.success) {
      this.crudService.updateDetailItems(parentData);
      this.emitChanges();
      this.notificationService.infoBubble('複製完成');
    } else {
      this.notificationService.warnBubble(result.message || '複製失敗');
    }
  }

  private validateDateField(
    item: DiscountSettingItem | AnnualPerformanceItem | DiscountLevelItem,
    _fieldName: string,
    newValue: unknown
  ): boolean {
    if (!newValue) return true;

    const isValid = this.dateValidator.validateDateWithinContract(
      newValue as Date | string,
      this.contractStartDate,
      this.contractEndDate
    );

    if (!isValid) {
      (item as { _hasValidationError?: boolean })._hasValidationError = true;
      this.notificationService.errorBubble('日期超出合約期間');
      return false;
    }

    (item as { _hasValidationError?: boolean })._hasValidationError = false;
    return true;
  }

  private ensureDataConsistency(item: CommissionItem): void {
    // 每次進入 Step 3 時，強制重置 currentTab 為 'discount'
    // 確保從其他步驟切換回來時，預設顯示折扣設定 tab
    item.currentTab = 'discount';

    // 同步折扣到層級
    this.syncService.syncDiscountToLevel(item);
    this.syncService.fillLevelContractPeriod(item);

    // 更新備註
    item.remark = this.remarkService.formatRemarkText(item);

    // 更新 detailItems (基於 currentTab = 'discount')
    this.crudService.updateDetailItems(item);
  }

  private emitChanges(): void {
    this.commissionItemsChange.emit(this.commissionItems);
  }

  /**
   * 公開方法：在儲存前同步所有資料
   * 由 contract-wizard 在 onSave 前呼叫
   *
   * 單向資料流架構下，來源陣列已經是最新的，不需要額外同步。
   * 保留此方法以維持 contract-wizard 的呼叫介面。
   */
  public syncAllDataBeforeSave(): void {
    // 來源陣列已經是最新的（單向資料流），不需要額外同步
  }
}
