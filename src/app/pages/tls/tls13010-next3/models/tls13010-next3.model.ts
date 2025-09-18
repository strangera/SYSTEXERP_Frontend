export interface TableConfiguration {
  commissionType: string;
  title: string;
  dataProperty: string;
  displayDataProperty: string;
  columnsProperty: string;
  addMethod: string;
  batchDeleteMethod: string;
  saveMethod: string;
  editMethod: string;
  cancelMethod: string;
  emptyMessage: string;
  visible: boolean;
  forceEditMode?: boolean;
  readonly?: boolean;
  showAddButton?: boolean;
  showBatchDelete?: boolean;
  showCheckBox?: boolean;
  showActionColumn?: boolean;
  autoAddRowOnTab?: boolean;
}

// 在 component 中使用的完整配置
export const TABLE_CONFIGURATIONS: TableConfiguration[] = [
  {
    commissionType: '1',
    title: '固定租金',
    dataProperty: 'fixedRentItems',
    displayDataProperty: 'displayFixedRentItems',
    columnsProperty: 'fixedRentColumns',
    addMethod: 'onAddFixedRentItem',
    batchDeleteMethod: 'onBatchDelete',
    saveMethod: 'onTableSave',
    editMethod: 'onTableEdit',
    cancelMethod: 'onTableCancel',
    emptyMessage: '尚未設定固定租金項目',
    visible: true,
    forceEditMode: true, // 統一控制
    readonly: false,
    showAddButton: true,
    showBatchDelete: true,
    showCheckBox: true,
    showActionColumn: false,
    autoAddRowOnTab: true,
  },
  {
    commissionType: '2',
    title: '底租抽成取高者',
    dataProperty: 'baseRentHigherItems',
    displayDataProperty: 'displayBaseRentHigherItems',
    columnsProperty: 'baseRentHigherColumns',
    addMethod: 'onAddBaseRentHigherItem',
    batchDeleteMethod: 'onBatchDelete',
    saveMethod: 'onTableSave',
    editMethod: 'onTableEdit',
    cancelMethod: 'onTableCancel',
    emptyMessage: '尚未設定底租抽成取高者項目',
    visible: true,
    forceEditMode: true,
    readonly: false,
    showAddButton: true,
    showBatchDelete: true,
    showCheckBox: true,
    showActionColumn: false,
    autoAddRowOnTab: true,

  },
  {
    commissionType: '4',
    title: '包底抽成',
    dataProperty: 'baseCommissionItems',
    displayDataProperty: 'displayBaseCommissionItems',
    columnsProperty: 'baseCommissionColumns',
    addMethod: 'onAddBaseCommissionItem',
    batchDeleteMethod: 'onBatchDelete',
    saveMethod: 'onTableSave',
    editMethod: 'onTableEdit',
    cancelMethod: 'onTableCancel',
    emptyMessage: '尚未設定包底抽成項目',
    visible: true,
    forceEditMode: true,
    readonly: false,
    showAddButton: true,
    showBatchDelete: true,
    showCheckBox: true,
    showActionColumn: false,
    autoAddRowOnTab: true,

  },
  {
    commissionType: '5',
    title: '階梯式抽成',
    dataProperty: 'graduatedItems',
    displayDataProperty: 'displayGraduatedItems',
    columnsProperty: 'graduatedColumns',
    addMethod: 'onAddGraduatedItem',
    batchDeleteMethod: 'onBatchDelete',
    saveMethod: 'onTableSave',
    editMethod: 'onTableEdit',
    cancelMethod: 'onTableCancel',
    emptyMessage: '尚未設定階梯式抽成項目',
    visible: true,
    forceEditMode: true,
    readonly: false,
    showAddButton: true,
    showBatchDelete: true,
    showCheckBox: true,
    showActionColumn: false,
    autoAddRowOnTab: true,
  },
  {
    commissionType: '6',
    title: '包底加階梯',
    dataProperty: 'baseTierItems',
    displayDataProperty: 'displayBaseTierItems',
    columnsProperty: 'baseTierColumns',
    addMethod: 'onAddBaseTierItem',
    batchDeleteMethod: 'onBatchDelete',
    saveMethod: 'onTableSave',
    editMethod: 'onTableEdit',
    cancelMethod: 'onTableCancel',
    emptyMessage: '尚未設定包底加階梯項目',
    visible: true,
    forceEditMode: true,
    readonly: false,
    showAddButton: true,
    showBatchDelete: true,
    showCheckBox: true,
    showActionColumn: false,
    autoAddRowOnTab: true,
  }
];
