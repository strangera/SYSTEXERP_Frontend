import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';

import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { ExpandableEditTableComponent, ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';

import {
  ConditionItem,
  FixedRentCondition,
  BaseRentHigherCondition,
  BaseCommissionCondition,
  GraduatedCommissionCondition,
  BaseTierCondition
} from '../../../../core/models/condition/condition-types.interface';
import { ContractInfo } from '../../../../core/models/contract/contract-info.interface';
import { CommissionType } from '../../../../core';
import { Subscription } from 'rxjs';

interface TableConfiguration {
  commissionType: string;
  title: string;
  dataProperty: keyof ConditionData;
  columnsProperty: keyof ColumnData;
  emptyMessage: string;
  visible: boolean;
}

interface ConditionData {
  fixedRentItems: FixedRentCondition[];
  baseRentHigherItems: BaseRentHigherCondition[];
  baseCommissionItems: BaseCommissionCondition[];
  graduatedItems: GraduatedCommissionCondition[];
  baseTierItems: BaseTierCondition[];
}

interface ColumnData {
  fixedRentColumns: ColumnDef[];
  baseRentHigherColumns: ColumnDef[];
  baseCommissionColumns: ColumnDef[];
  graduatedColumns: ColumnDef[];
  baseTierColumns: ColumnDef[];
}

@Component({
  selector: 'app-step4-condition',
  templateUrl: './step4-condition.component.html',
  styleUrls: ['./step4-condition.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AccordionModule,
    DialogModule,
    ProgressSpinnerModule,
    ButtonModule,
    ButtonComponent,
    ExpandableEditTableComponent
  ]
})
export class Step4ConditionComponent implements OnInit, OnDestroy {
  @Input() conditionItems: ConditionItem[] = [];
  @Input() contractInfo: ContractInfo | null = null;
  @Input() commissionType: string = '';
  @Input() isViewMode = false;

  @Output() dataChange = new EventEmitter<ConditionItem[]>();

  private subscriptions: Subscription[] = [];

  // 表格配置
  tableConfigurations: TableConfiguration[] = [
    {
      commissionType: '1',
      title: '固定租金',
      dataProperty: 'fixedRentItems',
      columnsProperty: 'fixedRentColumns',
      emptyMessage: '尚未設定固定租金項目',
      visible: false
    },
    {
      commissionType: '2',
      title: '底租抽成取高者',
      dataProperty: 'baseRentHigherItems',
      columnsProperty: 'baseRentHigherColumns',
      emptyMessage: '尚未設定底租抽成取高者項目',
      visible: false
    },
    {
      commissionType: '4',
      title: '包底抽成',
      dataProperty: 'baseCommissionItems',
      columnsProperty: 'baseCommissionColumns',
      emptyMessage: '尚未設定包底抽成項目',
      visible: false
    },
    {
      commissionType: '5',
      title: '層級抽成',
      dataProperty: 'graduatedItems',
      columnsProperty: 'graduatedColumns',
      emptyMessage: '尚未設定層級抽成項目',
      visible: false
    },
    {
      commissionType: '6',
      title: '包底加層級',
      dataProperty: 'baseTierItems',
      columnsProperty: 'baseTierColumns',
      emptyMessage: '尚未設定包底加層級項目',
      visible: false
    }
  ];

  // 條件資料
  conditionData: ConditionData = {
    fixedRentItems: [],
    baseRentHigherItems: [],
    baseCommissionItems: [],
    graduatedItems: [],
    baseTierItems: []
  };

  // 欄位定義
  columnData: ColumnData = {
    fixedRentColumns: [],
    baseRentHigherColumns: [],
    baseCommissionColumns: [],
    graduatedColumns: [],
    baseTierColumns: []
  };

  // 合約資訊顯示
  contractInfoData: any[] = [];
  contractInfoColumns: ColumnDef[] = [
    { field: 'apply_no', header: '專櫃招募編號', type: 'text', editable: false },
    { field: 'tlt_no', header: '專櫃編號', type: 'text', editable: false },
    { field: 'tlt_name', header: '櫃位名稱', type: 'text', editable: false },
    { field: 'VEN_Name', header: '廠商名稱', type: 'text', editable: false },
    { field: 'tlt_term_type_desc', header: '抽成別', type: 'text', editable: false },
    { field: 'tlt_bdate', header: '契約起始日', type: 'text', editable: false },
    { field: 'tlt_edate', header: '契約截止日', type: 'text', editable: false }
  ];

  // 狀態
  loading = false;
  showConfirmDialog = false;

  constructor() {
    this.initializeColumnDefinitions();
  }

  ngOnInit(): void {
    this.updateVisibleTables();
    this.updateContractInfoDisplay();
    this.groupConditionItems();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * 初始化欄位定義
   */
  private initializeColumnDefinitions(): void {
    // 固定租金欄位
    this.columnData.fixedRentColumns = [
      { field: 'cag_bdate', header: '開始日期', type: 'date', editable: true, style: 'width: 25%' },
      { field: 'cag_edate', header: '結束日期', type: 'date', editable: true, style: 'width: 25%' },
      { field: 'rent_amount', header: '租金金額', type: 'number', editable: true, style: 'width: 25%' },
      { field: 'cag_remark', header: '備註', type: 'text', editable: true, style: 'width: 25%' }
    ];

    // 底租抽成取高者欄位
    this.columnData.baseRentHigherColumns = [
      { field: 'cag_bdate', header: '開始日期', type: 'date', editable: true, style: 'width: 20%' },
      { field: 'cag_edate', header: '結束日期', type: 'date', editable: true, style: 'width: 20%' },
      { field: 'base_rent', header: '底租金額', type: 'number', editable: true, style: 'width: 20%' },
      { field: 'comm_rate', header: '抽成比例(%)', type: 'number', editable: true, style: 'width: 20%' },
      { field: 'cag_remark', header: '備註', type: 'text', editable: true, style: 'width: 20%' }
    ];

    // 包底抽成欄位
    this.columnData.baseCommissionColumns = [
      { field: 'cag_bdate', header: '開始日期', type: 'date', editable: true, style: 'width: 20%' },
      { field: 'cag_edate', header: '結束日期', type: 'date', editable: true, style: 'width: 20%' },
      { field: 'base_amount', header: '包底金額', type: 'number', editable: true, style: 'width: 20%' },
      { field: 'comm_rate', header: '抽成比例(%)', type: 'number', editable: true, style: 'width: 20%' },
      { field: 'cag_remark', header: '備註', type: 'text', editable: true, style: 'width: 20%' }
    ];

    // 層級抽成欄位
    this.columnData.graduatedColumns = [
      { field: 'cag_bdate', header: '開始日期', type: 'date', editable: true, style: 'width: 14%' },
      { field: 'cag_edate', header: '結束日期', type: 'date', editable: true, style: 'width: 14%' },
      { field: 'level_no', header: '層級', type: 'number', editable: false, style: 'width: 14%' },
      { field: 'level_bamt', header: '起始金額', type: 'number', editable: true, style: 'width: 14%' },
      { field: 'level_eamt', header: '結束金額', type: 'number', editable: true, style: 'width: 14%' },
      { field: 'comm_rate', header: '抽成比例(%)', type: 'number', editable: true, style: 'width: 14%' },
      { field: 'cag_remark', header: '備註', type: 'text', editable: true, style: 'width: 14%' }
    ];

    // 包底加層級欄位
    this.columnData.baseTierColumns = [
      { field: 'cag_bdate', header: '開始日期', type: 'date', editable: true, style: 'width: 12%' },
      { field: 'cag_edate', header: '結束日期', type: 'date', editable: true, style: 'width: 12%' },
      { field: 'base_amount', header: '包底金額', type: 'number', editable: true, style: 'width: 12%' },
      { field: 'level_no', header: '層級', type: 'number', editable: false, style: 'width: 12%' },
      { field: 'level_bamt', header: '起始金額', type: 'number', editable: true, style: 'width: 12%' },
      { field: 'level_eamt', header: '結束金額', type: 'number', editable: true, style: 'width: 12%' },
      { field: 'comm_rate', header: '抽成比例(%)', type: 'number', editable: true, style: 'width: 12%' },
      { field: 'cag_remark', header: '備註', type: 'text', editable: true, style: 'width: 12%' }
    ];
  }

  /**
   * 更新顯示的表格
   */
  private updateVisibleTables(): void {
    this.tableConfigurations.forEach(config => {
      config.visible = config.commissionType === this.commissionType;
    });
  }

  /**
   * 更新合約資訊顯示
   */
  private updateContractInfoDisplay(): void {
    if (this.contractInfo) {
      this.contractInfoData = [{
        ...this.contractInfo,
        tlt_term_type_desc: this.getCommissionTypeDesc(this.contractInfo.tlt_term_type || '')
      }];
    }
  }

  /**
   * 取得抽成別描述
   */
  private getCommissionTypeDesc(type: string): string {
    const typeMap: { [key: string]: string } = {
      '1': '固定租金',
      '2': '底抽取高',
      '3': '一般抽成',
      '4': '底抽',
      '5': '級距抽成',
      '6': '底抽加層級'
    };
    return typeMap[type] || type;
  }

  /**
   * 取得當前抽成類型名稱
   */
  getCurrentCommissionTypeName(): string {
    return this.getCommissionTypeDesc(this.commissionType);
  }

  /**
   * 依抽成類型分組條件項目
   */
  private groupConditionItems(): void {
    // 清空資料
    this.conditionData = {
      fixedRentItems: [],
      baseRentHigherItems: [],
      baseCommissionItems: [],
      graduatedItems: [],
      baseTierItems: []
    };

    // 根據抽成類型分組
    this.conditionItems.forEach(item => {
      const conditionType = item.condition_type || this.commissionType;

      switch (conditionType) {
        case '1':
          this.conditionData.fixedRentItems.push(item as FixedRentCondition);
          break;
        case '2':
          this.conditionData.baseRentHigherItems.push(item as BaseRentHigherCondition);
          break;
        case '4':
          this.conditionData.baseCommissionItems.push(item as BaseCommissionCondition);
          break;
        case '5':
          this.conditionData.graduatedItems.push(item as GraduatedCommissionCondition);
          break;
        case '6':
          this.conditionData.baseTierItems.push(item as BaseTierCondition);
          break;
      }
    });
  }

  /**
   * 取得可見的表格配置
   */
  getVisibleTableConfigurations(): TableConfiguration[] {
    return this.tableConfigurations.filter(config => config.visible);
  }

  /**
   * 取得表格資料
   */
  getTableData(tableConfig: TableConfiguration): any[] {
    const data = this.conditionData[tableConfig.dataProperty] as any[];
    return data.filter(item => item._status !== 'deleted');
  }

  /**
   * 取得表格欄位
   */
  getTableColumns(tableConfig: TableConfiguration): ColumnDef[] {
    return this.columnData[tableConfig.columnsProperty];
  }

  /**
   * 取得表格設定
   */
  getTableSetting(tableConfig: TableConfiguration, settingName: string): boolean {
    if (settingName === 'readonly') {
      return this.isViewMode;
    }
    if (settingName === 'forceEditMode') {
      return !this.isViewMode;
    }
    return true;
  }

  /**
   * 是否顯示不支援類型訊息
   */
  shouldShowUnsupportedTypeMessage(): boolean {
    // 抽成別 '3' (一般抽成) 不需要條件設定
    if (this.commissionType === CommissionType.GeneralCommission) {
      return false;
    }

    const supportedTypes = ['1', '2', '4', '5', '6'];
    return !supportedTypes.includes(this.commissionType);
  }

  /**
   * 新增項目
   */
  onAddItem(tableConfig: TableConfiguration): void {
    const newItem: ConditionItem = {
      id: `temp_${Date.now()}`,
      apply_no: this.contractInfo?.apply_no || '',
      condition_type: tableConfig.commissionType,
      cag_bdate: this.contractInfo?.tlt_contract_bdate || '',
      cag_edate: this.contractInfo?.tlt_contract_edate || '',
      _status: 'new'
    };

    // 根據類型添加額外欄位
    switch (tableConfig.commissionType) {
      case '1':
        (newItem as FixedRentCondition).base_rent = 0;
        this.conditionData.fixedRentItems.push(newItem as FixedRentCondition);
        break;
      case '2':
        (newItem as BaseRentHigherCondition).base_rent = 0;
        (newItem as BaseRentHigherCondition).cag_charge_rate = 0;
        this.conditionData.baseRentHigherItems.push(newItem as BaseRentHigherCondition);
        break;
      case '4':
        (newItem as BaseCommissionCondition).limit_amt = 0;
        (newItem as BaseCommissionCondition).limit_charge_rate = 0;
        this.conditionData.baseCommissionItems.push(newItem as BaseCommissionCondition);
        break;
      case '5':
        (newItem as GraduatedCommissionCondition).seq_no = this.conditionData.graduatedItems.length + 1;
        (newItem as GraduatedCommissionCondition).start_number = 0;
        (newItem as GraduatedCommissionCondition).end_number = 0;
        (newItem as GraduatedCommissionCondition).charge_rate = 0;
        this.conditionData.graduatedItems.push(newItem as GraduatedCommissionCondition);
        break;
      case '6':
        (newItem as BaseTierCondition).limit_amt = 0;
        (newItem as BaseTierCondition).seq_no = this.conditionData.baseTierItems.length + 1;
        (newItem as BaseTierCondition).start_number = 0;
        (newItem as BaseTierCondition).end_number = 0;
        (newItem as BaseTierCondition).charge_rate = 0;
        this.conditionData.baseTierItems.push(newItem as BaseTierCondition);
        break;
    }

    this.conditionItems.push(newItem);
    this.emitDataChange();
  }

  /**
   * 表格欄位變更
   */
  onTableFieldChange(event: any, commissionType: string): void {
    const { fieldName, newValue, rowData } = event;
    const item = this.conditionItems.find(i => i.id === rowData.id);
    if (item) {
      (item as any)[fieldName] = newValue;
      if (item._status !== 'new') {
        item._status = 'modified';
      }
      this.emitDataChange();
    }
  }

  /**
   * 表格儲存
   */
  onTableSave(event: any, commissionType: string): void {
    const { row } = event;
    const item = this.conditionItems.find(i => i.id === row.id);
    if (item && item._status !== 'new') {
      item._status = 'modified';
    }
    this.emitDataChange();
  }

  /**
   * 表格編輯
   */
  onTableEdit(event: any, commissionType: string): void {
    // 編輯模式進入
  }

  /**
   * 表格取消
   */
  onTableCancel(event: any, commissionType: string): void {
    this.groupConditionItems();
  }

  /**
   * 批次刪除
   */
  onBatchDelete(items: any[], commissionType: string): void {
    items.forEach(item => {
      const conditionItem = this.conditionItems.find(i => i.id === item.id);
      if (conditionItem) {
        if (conditionItem._status === 'new') {
          const index = this.conditionItems.indexOf(conditionItem);
          this.conditionItems.splice(index, 1);
        } else {
          conditionItem._status = 'deleted';
        }
      }
    });
    this.groupConditionItems();
    this.emitDataChange();
  }

  /**
   * 呼叫表格方法（用於動態呼叫）
   */
  callTableMethod(methodName: string): void {
    const config = this.getVisibleTableConfigurations()[0];
    if (config) {
      this.onAddItem(config);
    }
  }

  /**
   * 發送資料變更事件
   */
  private emitDataChange(): void {
    this.dataChange.emit([...this.conditionItems]);
  }
}
