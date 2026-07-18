/**
 * TLS12080-V2 Step 4: 租金設定
 * 複用 TLS13010-V2 的服務
 */
import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { NotificationService } from '@shared/components/notification-message/notification.service';
import { ColumnDef, ExpandableEditTableComponent } from '@others/component/expandable-edit-table/expandable-edit-table.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

// 使用 TLS13010-V2 的常數、模型、服務
import { CommissionType } from '../../../../../tls13010-v2/core/constants';
import {
  BaseCommissionCondition,
  BaseRentHigherCondition,
  BaseTierCondition,
  ConditionItem,
  FixedRentCondition,
  GraduatedCommissionCondition
} from '../../../../../tls13010-v2/core/models/condition';
import { ConditionDataManagerService } from '../../../../../tls13010-v2/services/condition/condition-data-manager.service';
import { ConditionTableConfigService } from '../../../../../tls13010-v2/services/condition/condition-table-config.service';

/**
 * 表格配置介面
 */
export interface TableConfiguration {
  commissionType: string;
  title: string;
  dataProperty: string;
  displayDataProperty: string;
  columnsProperty: string;
  addMethod: string;
  emptyMessage: string;
  visible: boolean;
}

/**
 * 表格配置常數
 */
export const TABLE_CONFIGURATIONS: TableConfiguration[] = [
  {
    commissionType: '1',
    title: '固定租金',
    dataProperty: 'fixedRentItems',
    displayDataProperty: 'displayFixedRentItems',
    columnsProperty: 'fixedRentColumns',
    addMethod: 'onAddFixedRentItem',
    emptyMessage: '尚未設定固定租金項目',
    visible: true
  },
  {
    commissionType: '2',
    title: '底租抽成取高者',
    dataProperty: 'baseRentHigherItems',
    displayDataProperty: 'displayBaseRentHigherItems',
    columnsProperty: 'baseRentHigherColumns',
    addMethod: 'onAddBaseRentHigherItem',
    emptyMessage: '尚未設定底租抽成取高者項目',
    visible: true
  },
  {
    commissionType: '4',
    title: '包底抽成',
    dataProperty: 'baseCommissionItems',
    displayDataProperty: 'displayBaseCommissionItems',
    columnsProperty: 'baseCommissionColumns',
    addMethod: 'onAddBaseCommissionItem',
    emptyMessage: '尚未設定包底抽成項目',
    visible: true
  },
  {
    commissionType: '5',
    title: '層級抽成',
    dataProperty: 'graduatedItems',
    displayDataProperty: 'displayGraduatedItems',
    columnsProperty: 'graduatedColumns',
    addMethod: 'onAddGraduatedItem',
    emptyMessage: '尚未設定層級抽成項目',
    visible: true
  },
  {
    commissionType: '6',
    title: '包底加層級',
    dataProperty: 'baseTierItems',
    displayDataProperty: 'displayBaseTierItems',
    columnsProperty: 'baseTierColumns',
    addMethod: 'onAddBaseTierItem',
    emptyMessage: '尚未設定包底加層級項目',
    visible: true
  }
];

@Component({
  selector: 'app-step4-condition',
  templateUrl: './step4-condition.component.html',
  styleUrls: ['./step4-condition.component.scss'],
  standalone: true,
  imports: [
    NgIf, NgFor,
    AccordionModule,
    ProgressSpinnerModule,
    ExpandableEditTableComponent
  ]
})
export class Step4ConditionComponent implements OnInit, OnChanges {
  // === 服務注入 ===
  private tableConfigService = inject(ConditionTableConfigService);
  private dataManagerService = inject(ConditionDataManagerService);
  private messageService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  // === 輸入屬性 ===
  @Input() conditionItems: ConditionItem[] = [];
  @Input() commissionType: string = '';
  @Input() crudstatus: CRUDStatus = CRUDStatus.Create;
  @Input() talentId: string = '';
  @Input() contractStartDate: string = '';
  @Input() contractEndDate: string = '';
  @Input() contractInfoData: any[] = [];
  @Input() isViewMode = false;  // 保留向後相容
  @Input() loading = false;

  // === 輸出事件 ===
  @Output() conditionItemsChange = new EventEmitter<ConditionItem[]>();
  @Output() dataChange = new EventEmitter<ConditionItem[]>();  // 保留向後相容

  // === 常數 ===
  readonly CRUDStatus = CRUDStatus;
  readonly CommissionType = CommissionType;

  // === 表格配置 ===
  tableConfigurations: TableConfiguration[] = TABLE_CONFIGURATIONS;

  // === 條件數據 ===
  fixedRentItems: FixedRentCondition[] = [];
  baseRentHigherItems: BaseRentHigherCondition[] = [];
  baseCommissionItems: BaseCommissionCondition[] = [];
  graduatedItems: GraduatedCommissionCondition[] = [];
  baseTierItems: BaseTierCondition[] = [];

  // === 表格欄位配置 ===
  contractInfoColumns: ColumnDef[] = [];
  fixedRentColumns: ColumnDef[] = [];
  baseRentHigherColumns: ColumnDef[] = [];
  baseCommissionColumns: ColumnDef[] = [];
  graduatedColumns: ColumnDef[] = [];
  baseTierColumns: ColumnDef[] = [];

  // === 顯示用資料（快取穩定引用，避免每次 CD 回傳新陣列導致 ngOnChanges 連鎖觸發）===
  displayFixedRentItems: FixedRentCondition[] = [];
  displayBaseRentHigherItems: BaseRentHigherCondition[] = [];
  displayBaseCommissionItems: BaseCommissionCondition[] = [];
  displayGraduatedItems: GraduatedCommissionCondition[] = [];
  displayBaseTierItems: BaseTierCondition[] = [];

  private refreshDisplayItems(): void {
    this.displayFixedRentItems = this.dataManagerService.filterDisplayItems(this.fixedRentItems);
    this.displayBaseRentHigherItems = this.dataManagerService.filterDisplayItems(this.baseRentHigherItems);
    this.displayBaseCommissionItems = this.dataManagerService.filterDisplayItems(this.baseCommissionItems);
    this.displayGraduatedItems = this.dataManagerService.filterDisplayItems(this.graduatedItems);
    this.displayBaseTierItems = this.dataManagerService.filterDisplayItems(this.baseTierItems);
  }

  get isFormReadonly(): boolean {
    return this.crudstatus === CRUDStatus.Read || this.isViewMode;
  }

  // === 生命週期 ===
  ngOnInit(): void {
    this.initializeTableConfigs();
    this.categorizeConditionItems();
    this.refreshDisplayItems();
    this.initializeIfEmpty();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conditionItems']?.firstChange || changes['commissionType']) {
      this.categorizeConditionItems();
      this.refreshDisplayItems();
      this.initializeIfEmpty();
    }

    if (changes['contractStartDate'] || changes['contractEndDate']) {
      this.syncNewItemsDates();
    }
  }

  // === 初始化方法 ===
  private initializeTableConfigs(): void {
    this.contractInfoColumns = this.tableConfigService.getContractInfoColumns();
    this.fixedRentColumns = this.tableConfigService.getFixedRentColumns();
    this.baseRentHigherColumns = this.tableConfigService.getBaseRentHigherColumns();
    this.baseCommissionColumns = this.tableConfigService.getBaseCommissionColumns();
    this.graduatedColumns = this.tableConfigService.getGraduatedColumns();
    this.baseTierColumns = this.tableConfigService.getBaseTierColumns();
  }

  /**
   * 根據 commissionType 直接分配條件項目到對應的陣列
   * 不使用 property 偵測（避免 limit_amt 等多餘欄位導致誤判）
   */
  private categorizeConditionItems(): void {
    this.fixedRentItems = [];
    this.baseRentHigherItems = [];
    this.baseCommissionItems = [];
    this.graduatedItems = [];
    this.baseTierItems = [];

    if (!this.conditionItems?.length) return;

    const items = this.conditionItems.map(item => ({
      ...item,
      _status: item._status || 'original'
    }));

    switch (this.commissionType) {
      case CommissionType.FIXED_RENT:
        this.fixedRentItems = items as any[];
        break;
      case CommissionType.BASE_RENT_HIGHER:
        this.baseRentHigherItems = items as any[];
        break;
      case CommissionType.BASE_COMMISSION:
        this.baseCommissionItems = items as any[];
        break;
      case CommissionType.GRADUATED:
        this.graduatedItems = items as any[];
        break;
      case CommissionType.BASE_TIER:
        this.baseTierItems = items as any[];
        break;
    }
  }

  private initializeIfEmpty(): void {
    if (this.isFormReadonly) return;

    const hasData = this.getCurrentTypeItemCount() > 0;
    if (!hasData && this.requiresCondition()) {
      this.addInitialItem();
    }
  }

  private requiresCondition(): boolean {
    return this.commissionType !== '' &&
      this.commissionType !== CommissionType.GENERAL_COMMISSION;
  }

  private getCurrentTypeItemCount(): number {
    // 使用來源陣列（非 display 陣列），因為 refreshDisplayItems 可能尚未執行
    const countActive = (items: ConditionItem[]) => items.filter(i => i._status !== 'deleted').length;
    switch (this.commissionType) {
      case CommissionType.FIXED_RENT: return countActive(this.fixedRentItems);
      case CommissionType.BASE_RENT_HIGHER: return countActive(this.baseRentHigherItems);
      case CommissionType.BASE_COMMISSION: return countActive(this.baseCommissionItems);
      case CommissionType.GRADUATED: return countActive(this.graduatedItems);
      case CommissionType.BASE_TIER: return countActive(this.baseTierItems);
      default: return 0;
    }
  }

  private addInitialItem(): void {
    switch (this.commissionType) {
      case CommissionType.FIXED_RENT: this.onAddFixedRentItem(); break;
      case CommissionType.BASE_RENT_HIGHER: this.onAddBaseRentHigherItem(); break;
      case CommissionType.BASE_COMMISSION: this.onAddBaseCommissionItem(); break;
      case CommissionType.GRADUATED: this.onAddGraduatedItem(); break;
      case CommissionType.BASE_TIER: this.onAddBaseTierItem(); break;
    }
  }

  private syncNewItemsDates(): void {
    if (!this.contractStartDate || !this.contractEndDate) return;

    const syncItems = (items: ConditionItem[]) => {
      items.forEach(item => {
        if (item._status === 'new') {
          item.cag_bdate = this.contractStartDate;
          item.cag_edate = this.contractEndDate;
        }
      });
    };

    syncItems(this.fixedRentItems);
    syncItems(this.baseRentHigherItems);
    syncItems(this.baseCommissionItems);
    syncItems(this.graduatedItems);
    syncItems(this.baseTierItems);

    this.emitConditionItemsChange();
  }

  // === 表格配置方法 ===
  getVisibleTableConfigurations(): TableConfiguration[] {
    return this.tableConfigurations.filter(config =>
      config.commissionType === this.commissionType && config.visible
    );
  }

  getTableData(tableConfig: TableConfiguration): any[] {
    return this[tableConfig.displayDataProperty as keyof this] as any[];
  }

  getTableColumns(tableConfig: TableConfiguration): ColumnDef[] {
    return this[tableConfig.columnsProperty as keyof this] as ColumnDef[];
  }

  callTableMethod(methodName: string): void {
    if (typeof this[methodName as keyof this] === 'function') {
      (this[methodName as keyof this] as Function)();
    }
  }

  // === 新增項目方法 ===
  private readonly DATE_FULL_MSG = '已超過契約截止日，無法再新增項目';

  onAddFixedRentItem(): void {
    if (this.isFormReadonly) return;

    const newItem = this.dataManagerService.createConditionItem(
      CommissionType.FIXED_RENT,
      this.talentId,
      this.contractStartDate,
      this.contractEndDate,
      this.fixedRentItems
    );

    if (newItem) {
      this.fixedRentItems = [...this.fixedRentItems, newItem as FixedRentCondition];
      this.emitConditionItemsChange();
    } else {
      this.messageService.warnBubble(this.DATE_FULL_MSG);
    }
  }

  onAddBaseRentHigherItem(): void {
    if (this.isFormReadonly) return;

    const newItem = this.dataManagerService.createConditionItem(
      CommissionType.BASE_RENT_HIGHER,
      this.talentId,
      this.contractStartDate,
      this.contractEndDate,
      this.baseRentHigherItems
    );

    if (newItem) {
      this.baseRentHigherItems = [...this.baseRentHigherItems, newItem as BaseRentHigherCondition];
      this.emitConditionItemsChange();
    } else {
      this.messageService.warnBubble(this.DATE_FULL_MSG);
    }
  }

  onAddBaseCommissionItem(): void {
    if (this.isFormReadonly) return;

    const newItem = this.dataManagerService.createConditionItem(
      CommissionType.BASE_COMMISSION,
      this.talentId,
      this.contractStartDate,
      this.contractEndDate,
      this.baseCommissionItems
    );

    if (newItem) {
      this.baseCommissionItems = [...this.baseCommissionItems, newItem as BaseCommissionCondition];
      this.emitConditionItemsChange();
    } else {
      this.messageService.warnBubble(this.DATE_FULL_MSG);
    }
  }

  onAddGraduatedItem(): void {
    if (this.isFormReadonly) return;

    const activeItems = this.graduatedItems.filter(i => i._status !== 'deleted');
    if (this.dataManagerService.shouldAddPair(activeItems)) {
      const dates = this.dataManagerService.getNextDatesForTieredItem(
        this.graduatedItems, this.contractStartDate, this.contractEndDate
      );
      const count = this.dataManagerService.getLastGroupCount(activeItems);
      const row1 = this.dataManagerService.createGraduatedItem(
        this.talentId, dates.bdate, dates.edate, activeItems
      ) as GraduatedCommissionCondition;
      const newRows: GraduatedCommissionCondition[] = [row1];
      for (let i = 1; i < count; i++) {
        newRows.push({ ...row1, id: this.dataManagerService.generateTempId(), seq_no: row1.seq_no + i, start_number: 0, end_number: 0, charge_rate: 0 });
      }
      this.graduatedItems = [...this.graduatedItems, ...newRows];
      this.emitConditionItemsChange();
      return;
    }

    const newItem = this.dataManagerService.createConditionItem(
      CommissionType.GRADUATED,
      this.talentId,
      this.contractStartDate,
      this.contractEndDate,
      this.graduatedItems
    );

    if (newItem) {
      this.graduatedItems = [...this.graduatedItems, newItem as GraduatedCommissionCondition];
      this.emitConditionItemsChange();
    }
  }

  onAddBaseTierItem(): void {
    if (this.isFormReadonly) return;

    const activeItems = this.baseTierItems.filter(i => i._status !== 'deleted');
    if (this.dataManagerService.shouldAddPair(activeItems)) {
      const dates = this.dataManagerService.getNextDatesForTieredItem(
        this.baseTierItems, this.contractStartDate, this.contractEndDate
      );
      const count = this.dataManagerService.getLastGroupCount(activeItems);
      const limitAmt = this.dataManagerService.getFirstLimitAmt(activeItems);
      const row1 = this.dataManagerService.createBaseTierItem(
        this.talentId, dates.bdate, dates.edate, activeItems, limitAmt
      ) as BaseTierCondition;
      const newRows: BaseTierCondition[] = [row1];
      for (let i = 1; i < count; i++) {
        newRows.push({ ...row1, id: this.dataManagerService.generateTempId(), seq_no: row1.seq_no + i, start_number: 0, end_number: 0, charge_rate: 0, limit_amt: limitAmt });
      }
      this.baseTierItems = [...this.baseTierItems, ...newRows];
      this.emitConditionItemsChange();
      return;
    }

    const newItem = this.dataManagerService.createConditionItem(
      CommissionType.BASE_TIER,
      this.talentId,
      this.contractStartDate,
      this.contractEndDate,
      this.baseTierItems
    );

    if (newItem) {
      this.baseTierItems = [...this.baseTierItems, newItem as BaseTierCondition];
      this.emitConditionItemsChange();
    }
  }

  // === 表格事件處理 ===
  onTableSave(event: any, commissionType: string): void {
    if (this.isFormReadonly) return;

    const { newData } = event;
    if (newData) {
      if (newData._status !== 'new' && newData._status !== 'deleted') {
        newData._status = 'modified';
      }
      this.updateLocalDataArray(commissionType, newData);
      this.emitConditionItemsChange();
    }
  }

  onTableEdit(event: any, commissionType: string): boolean {
    return !this.isFormReadonly;
  }

  onTableCancel(event: any, commissionType: string): void {
    // 取消編輯，不需要特別處理
  }

  onBatchDelete(selectedItems: any[], commissionType: string): void {
    if (this.isFormReadonly) return;

    selectedItems.forEach(item => {
      if (item._status === 'new') {
        this.removeItemFromArray(item, commissionType);
      } else {
        item._status = 'deleted';
      }
    });

    this.emitConditionItemsChange();
    this.cdr.detectChanges();
  }

  onTableFieldChange(event: any, commissionType: string): void {
    const { rowData } = event;

    if (rowData) {
      if (rowData._status !== 'new' && rowData._status !== 'deleted') {
        rowData._status = 'modified';
      }
      this.updateLocalDataArray(commissionType, rowData);
      this.emitConditionItemsChange();
    }
  }

  // === 輔助方法 ===
  private updateLocalDataArray(commissionType: string, modifiedData: any): void {
    const dataId = modifiedData.id;

    switch (commissionType) {
      case '1': this.updateItemInArray(this.fixedRentItems, dataId, modifiedData); break;
      case '2': this.updateItemInArray(this.baseRentHigherItems, dataId, modifiedData); break;
      case '4': this.updateItemInArray(this.baseCommissionItems, dataId, modifiedData); break;
      case '5': this.updateItemInArray(this.graduatedItems, dataId, modifiedData); break;
      case '6': this.updateItemInArray(this.baseTierItems, dataId, modifiedData); break;
    }
  }

  private updateItemInArray(array: any[], itemId: string, newData: any): void {
    const index = array.findIndex(item => item.id === itemId);
    if (index > -1) {
      array[index] = { ...newData };
    }
  }

  private removeItemFromArray(item: any, commissionType: string): void {
    switch (commissionType) {
      case '1': this.fixedRentItems = this.fixedRentItems.filter(x => x.id !== item.id); break;
      case '2': this.baseRentHigherItems = this.baseRentHigherItems.filter(x => x.id !== item.id); break;
      case '4': this.baseCommissionItems = this.baseCommissionItems.filter(x => x.id !== item.id); break;
      case '5': this.graduatedItems = this.graduatedItems.filter(x => x.id !== item.id); break;
      case '6': this.baseTierItems = this.baseTierItems.filter(x => x.id !== item.id); break;
    }
  }

  private emitConditionItemsChange(): void {
    const allItems: ConditionItem[] = [
      ...this.fixedRentItems,
      ...this.baseRentHigherItems,
      ...this.baseCommissionItems,
      ...this.graduatedItems,
      ...this.baseTierItems
    ];

    this.refreshDisplayItems();
    this.conditionItemsChange.emit(allItems);
    this.dataChange.emit(allItems);  // 向後相容
  }

  // === 輔助 getter ===
  shouldShowUnsupportedTypeMessage(): boolean {
    if (!this.commissionType) return false;
    if (this.commissionType === CommissionType.GENERAL_COMMISSION) return false;
    const visibleConfigs = this.getVisibleTableConfigurations();
    return visibleConfigs.length === 0 && !!this.commissionType;
  }

  getCurrentCommissionTypeName(): string {
    return this.tableConfigService.getCommissionTypeName(this.commissionType);
  }
}
