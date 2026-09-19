/**
 * 代扣款欄位定義配置
 * 依照不同類型 (A/B/C/D/E) 定義各自的欄位
 */
import { TLS13010_DROPDOWN_OPTIONS } from '@pages/tls/shared/constants/tls13010.dropdown';
import { ColumnDef } from '@others/component/expandable-edit-table/expandable-edit-table.component';

/** 單位下拉：最前面加一個空白選項（顯示為空列，選了即送出空白），讓使用者可不指定單位 */
const TPY_TYPE_OPTIONS_WITH_BLANK = [
  { label: ' ', value: '' },
  ...TLS13010_DROPDOWN_OPTIONS.tpyTypeOption,
];

/**
 * 扣款類型枚舉
 */
export enum FareCapType {
  A = 'A', // 一次扣款
  B = 'B', // 每月扣款
  C = 'C', // 平均分攤
  D = 'D', // 比率分攤
  E = 'E'  // 活動扣款
}

/**
 * 扣款類型名稱
 */
export const FARE_CAP_TYPE_LABELS: Record<FareCapType, string> = {
  [FareCapType.A]: '一次扣款',
  [FareCapType.B]: '每月扣款',
  [FareCapType.C]: '平均分攤',
  [FareCapType.D]: '比率分攤',
  [FareCapType.E]: '活動扣款'
};

/**
 * 代扣款變更檢測配置
 */
export const FARE_CHANGE_DETECTION_CONFIG = {
  A: {
    editableFields: ['tpy_bdate', 'tpy_type', 'tpy_unitamt', 'tpy_qty', 'gui_flag', 'org_id'],
    numericFields: ['tpy_unitamt', 'tpy_qty', 'tpy_amount'],
    dateFields: ['tpy_bdate']
  },
  B: {
    editableFields: ['tpy_bdate', 'tpy_edate', 'tpy_type', 'tpy_unitamt', 'tpy_qty', 'gui_flag', 'day_account', 'interval'],
    numericFields: ['tpy_unitamt', 'tpy_qty', 'tpy_amount', 'interval'],
    dateFields: ['tpy_bdate', 'tpy_edate']
  },
  C: {
    editableFields: ['tpy_bdate', 'tpy_edate', 'tpy_totalamt', 'tpy_amount', 'gui_flag'],
    numericFields: ['tpy_totalamt', 'tpy_amount', 'period_nos', 'down_payment'],
    dateFields: ['tpy_bdate', 'tpy_edate']
  },
  D: {
    editableFields: ['tpy_bdate', 'tpy_edate', 'cap_saletype', 'instms_type', 'edc_bank', 'pay_no', 'calc_type', 'over_base_rate', 'down_payment', 'tpy_type', 'tpy_rate', 'gui_flag'],
    numericFields: ['over_base_rate', 'down_payment', 'tpy_rate'],
    dateFields: ['tpy_bdate', 'tpy_edate']
  },
  E: {
    editableFields: ['tpy_bdate', 'tpy_edate', 'cap_saletype', 'tpy_type', 'tpy_rate', 'pay_no', 'gui_flag'],
    numericFields: ['tpy_rate'],
    dateFields: ['tpy_bdate', 'tpy_edate']
  }
};

/**
 * 取得共用的基本欄位 (A/B/C/E 類型使用)
 * 與舊版 next1 完全一致 - 大部分欄位使用 autoWidth，讓瀏覽器自動計算寬度
 */
function getBaseColumns(): ColumnDef[] {
  return [
    {
      field: 'is_selected',
      header: '新增',
      type: 'checkbox',
      editable: true,
      autoWidth: true  // 與舊版一致
    },
    {
      field: 'copy_button',
      header: '複製',
      type: 'button',
      buttonIcon: 'pi pi-copy',
      buttonClass: 'p-button-sm p-button-secondary',
      buttonTooltip: '複製此扣款項目',
      style: 'width: 50px;'  // 與舊版一致
    },
    {
      field: 'cap_item',
      header: '扣款代號',
      type: 'text',
      editable: false
      // 與舊版一致，不設定 style
    },
    {
      field: 'cap_name',
      header: '扣款名稱',
      type: 'text',
      editable: false,
      autoWidth: true  // 與舊版一致
    }
  ];
}

/**
 * A 類型 (一次扣款) 欄位定義
 * 與舊版 next1 完全一致 - 不設定固定寬度，讓瀏覽器自動計算
 */
export function getDeductionAColumns(contractDates?: { bdate?: string; edate?: string }): ColumnDef[] {
  return [
    ...getBaseColumns(),
    {
      field: 'tpy_bdate',
      header: '起始年月',
      type: 'date',
      editable: true,
      dateFormat: 'year-month',
      required: true,
      defaultValueFunction: () => contractDates?.bdate ? new Date(contractDates.bdate) : null
    },
    {
      field: 'tpy_type',
      header: '單位',
      type: 'dropdown',
      editable: true,
      options: TPY_TYPE_OPTIONS_WITH_BLANK,
      required: true
    },
    {
      field: 'tpy_unitamt',
      header: '單價',
      type: 'number',
      editable: true,
      required: true
    },
    {
      field: 'tpy_qty',
      header: '數量',
      type: 'number',
      editable: true,
      required: true,
      allowDecimal: true,
      decimalPlaces: 3
    },
    {
      field: 'tpy_amount',
      header: '扣款金額(未稅)',
      type: 'number',
      editable: false,
      autoWidth: true
    },
    {
      field: 'gui_flag',
      header: '開立發票',
      type: 'dropdown',
      editable: false,
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ],
      required: true,
      autoWidth: true
    }
  ];
}

/**
 * B 類型 (每月扣款) 欄位定義
 * 欄位較多，設定明確寬度避免格子過小
 */
export function getDeductionBColumns(contractDates?: { bdate?: string; edate?: string }): ColumnDef[] {
  return [
    ...getBaseColumns(),
    {
      field: 'tpy_bdate',
      header: '扣款起始年月',
      type: 'date',
      editable: true,
      dateFormat: 'year-month',
      required: true,
      style: 'min-width: 110px;',
      defaultValueFunction: () => contractDates?.bdate ? new Date(contractDates.bdate) : null
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'date',
      editable: true,
      dateFormat: 'year-month',
      required: true,
      style: 'min-width: 110px;',
      defaultValueFunction: () => contractDates?.edate ? new Date(contractDates.edate) : null
    },
    {
      field: 'tpy_type',
      header: '單位',
      type: 'dropdown',
      editable: true,
      options: TPY_TYPE_OPTIONS_WITH_BLANK,
      required: true,
      style: 'min-width: 120px;'
    },
    {
      field: 'tpy_unitamt',
      header: '單價',
      type: 'number',
      editable: true,
      required: true,
      style: 'min-width: 80px;'
    },
    {
      field: 'tpy_qty',
      header: '數量',
      type: 'number',
      editable: true,
      required: true,
      allowDecimal: true,
      style: 'min-width: 70px;'
    },
    {
      field: 'tpy_amount',
      header: '扣款金額(未稅)',
      type: 'number',
      editable: false,
      style: 'min-width: 110px;'
    },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: false,
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ],
      required: true,
      style: 'min-width: 100px;'
    },
    {
      field: 'day_account',
      header: '是否以日計算',
      type: 'dropdown',
      editable: true,
      options: [
        { label: '是', value: 'Y' },
        { label: '否', value: 'N' }
      ],
      required: true,
      style: 'min-width: 100px;'
    },
    {
      field: 'interval',
      header: '扣款週期數(月)',
      type: 'number',
      editable: true,
      required: true,
      style: 'min-width: 100px;'
    }
  ];
}

/**
 * C 類型 (平均分攤) 欄位定義
 * 與舊版 next1 完全一致
 */
export function getDeductionCColumns(contractDates?: { bdate?: string; edate?: string }): ColumnDef[] {
  const baseColumns = getBaseColumns();
  // 在「複製按鈕」後面插入「自動計算」按鈕
  const copyButtonIndex = baseColumns.findIndex(col => col.field === 'copy_button');
  const autoCalcButton: ColumnDef = {
    field: 'auto_calc',
    header: '自動計算',
    type: 'button',
    buttonIcon: 'pi pi-calculator',
    buttonClass: 'p-button-sm p-button-info',
    buttonTooltip: '根據總金額自動計算'
    // 與舊版一致，不設定 style
  };
  baseColumns.splice(copyButtonIndex + 1, 0, autoCalcButton);

  return [
    ...baseColumns,
    {
      field: 'tpy_bdate',
      header: '扣款起始年月',
      type: 'date',
      editable: true,
      dateFormat: 'year-month',
      required: true,
      defaultValueFunction: () => contractDates?.bdate ? new Date(contractDates.bdate) : null
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'date',
      editable: true,
      dateFormat: 'year-month',
      required: true,
      defaultValueFunction: () => contractDates?.edate ? new Date(contractDates.edate) : null
    },
    {
      field: 'tpy_totalamt',
      header: '總金額',
      type: 'number',
      editable: true,
      required: true,
      autoWidth: true
    },
    {
      field: 'period_nos',
      header: '期數',
      type: 'number',
      editable: false
    },
    {
      field: 'tpy_amount',
      header: '每月金額',
      type: 'number',
      editable: true,
      required: true,
      autoWidth: true
    },
    {
      field: 'down_payment',
      header: '首期金額',
      type: 'number',
      editable: true
    },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: false,
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ],
      required: true
    }
  ];
}

/**
 * D 類型 (比率分攤) 欄位定義
 * 欄位較多，使用緊湊樣式 (與舊版 next1 相同配置)
 */
export function getDeductionDColumns(contractDates?: { bdate?: string; edate?: string }, payNoOptions: unknown[] = []): ColumnDef[] {
  return [
    ...getBaseColumns().map(col => ({
      ...col,
      style: col.field === 'cap_item' ? 'width: 55px; min-width: 55px; font-size: 0.65rem;' :
        col.field === 'cap_name' ? 'width: 80px; min-width: 80px; font-size: 0.8rem; white-space: normal; word-break: break-word; line-height: 1.2;' :
          col.field === 'is_selected' ? 'width: 45px; min-width: 45px; font-size: 0.65rem; text-align: center;' :
            col.field === 'copy_button' ? 'width: 45px; min-width: 45px; font-size: 0.65rem;' :
              col.style
    })),
    {
      field: 'cap_saletype',
      header: '銷售類型',
      type: 'dropdown',
      editable: true,
      hidden: true,
      options: TLS13010_DROPDOWN_OPTIONS.capSaletypeOptions,
      style: 'width: 90px; min-width: 90px; font-size: 0.65rem;'
    },
    {
      field: 'instms_type',
      header: '期數',
      type: 'dropdown',
      editable: true,
      hidden: true,
      options: TLS13010_DROPDOWN_OPTIONS.instmsTypeOptions,
      style: 'width: 60px; min-width: 60px; font-size: 0.65rem;'
    },
    {
      field: 'edc_bank',
      header: '收單行',
      type: 'dropdown',
      editable: true,
      hidden: true,
      options: TLS13010_DROPDOWN_OPTIONS.edcBankOptions,
      style: 'width: 90px; min-width: 90px; font-size: 0.65rem;'
    },
    {
      field: 'pay_no',
      header: '支付編號',
      type: 'dropdown',
      editable: true,
      hidden: true,
      options: payNoOptions,
      style: 'width: 90px; min-width: 90px; font-size: 0.65rem;'
    },
    {
      field: 'calc_type',
      header: '券類計算方式',
      type: 'dropdown',
      editable: true,
      hidden: true,
      options: TLS13010_DROPDOWN_OPTIONS.calcTypeOptions,
      style: 'width: 90px; min-width: 90px; font-size: 0.65rem;'
    },
    {
      field: 'over_base_rate',
      header: '超過基準比率',
      type: 'number',
      editable: true,
      allowDecimal: true,
      decimalPlaces: 4,
      style: 'width: 70px; min-width: 70px; font-size: 0.65rem;'
    },
    // 加抽比率欄位暫時隱藏
    // {
    //   field: 'rent_plus_rate',
    //   header: '加抽比率',
    //   type: 'number',
    //   editable: true,
    //   required: true,
    //   allowDecimal: true,
    //   decimalPlaces: 3,
    //   style: 'width: 70px; min-width: 70px; font-size: 0.65rem;'
    // },
    {
      field: 'down_payment',
      header: '超過基準金額',
      type: 'number',
      editable: true,
      style: 'width: 80px; min-width: 80px; font-size: 0.65rem;'
    },
    {
      field: 'tpy_bdate',
      header: '扣款起始年月',
      type: 'date',
      editable: true,
      dateFormat: 'year-month',
      required: true,
      style: 'width: 95px; min-width: 95px; font-size: 0.65rem;',
      defaultValueFunction: () => contractDates?.bdate ? new Date(contractDates.bdate) : null
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'date',
      editable: true,
      dateFormat: 'year-month',
      required: true,
      style: 'width: 95px; min-width: 95px; font-size: 0.65rem;',
      defaultValueFunction: () => contractDates?.edate ? new Date(contractDates.edate) : null
    },
    {
      field: 'tpy_type',
      header: '單位',
      type: 'dropdown',
      editable: true,
      options: TPY_TYPE_OPTIONS_WITH_BLANK,
      required: true,
      style: 'width: 60px; min-width: 60px; font-size: 0.65rem;'
    },
    {
      field: 'tpy_rate',
      header: '比率',
      headerTooltip: '比率請輸入 1 以下的數字，如 2% 請輸入 0.02',
      type: 'number',
      editable: true,
      required: true,
      allowDecimal: true,
      decimalPlaces: 3,
      validateMax: 1,
      validateMessage: '比率請輸入 1 以下的數字，如 2% 請輸入 0.02',
      style: 'width: 70px; min-width: 70px; max-width: 80px; font-size: 0.65rem;'
    },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: false,
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ],
      required: true,
      style: 'width: 75px; min-width: 75px; max-width: 85px; font-size: 0.65rem;'
    }
  ];
}

/**
 * E 類型 (活動扣款) 欄位定義
 * 與舊版 next1 完全一致
 */
export function getDeductionEColumns(contractDates?: { bdate?: string; edate?: string }, payNoOptions: unknown[] = []): ColumnDef[] {
  return [
    ...getBaseColumns(),
    {
      field: 'tpy_bdate',
      header: '扣款起始年月',
      type: 'date',
      editable: true,
      dateFormat: 'year-month',
      required: true,
      defaultValueFunction: () => contractDates?.bdate ? new Date(contractDates.bdate) : null
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'date',
      editable: true,
      dateFormat: 'year-month',
      required: true,
      defaultValueFunction: () => contractDates?.edate ? new Date(contractDates.edate) : null
    },
    {
      field: 'cap_saletype',
      header: '銷售類型',
      type: 'dropdown',
      editable: true,
      options: TLS13010_DROPDOWN_OPTIONS.capSaletypeOptionsE,
      autoWidth: true
    },
    {
      field: 'tpy_type',
      header: '單位',
      type: 'dropdown',
      editable: true,
      options: TPY_TYPE_OPTIONS_WITH_BLANK,
      required: true,
      autoWidth: true
    },
    {
      field: 'tpy_rate',
      header: '比率',
      headerTooltip: '比率請輸入 1 以下的數字，如 2% 請輸入 0.02',
      type: 'number',
      editable: true,
      required: true,
      allowDecimal: true,
      decimalPlaces: 3,
      validateMax: 1,
      validateMessage: '比率請輸入 1 以下的數字，如 2% 請輸入 0.02'
    },
    {
      field: 'pay_no',
      header: '支付編號',
      type: 'dropdown',
      editable: true,
      options: payNoOptions,
      autoWidth: true
    },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: false,
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ],
      required: true
    }
  ];
}

/**
 * 依照類型取得欄位定義
 */
export function getDeductionColumnsByType(
  capType: FareCapType,
  contractDates?: { bdate?: string; edate?: string },
  payNoOptions: unknown[] = []
): ColumnDef[] {
  switch (capType) {
    case FareCapType.A:
      return getDeductionAColumns(contractDates);
    case FareCapType.B:
      return getDeductionBColumns(contractDates);
    case FareCapType.C:
      return getDeductionCColumns(contractDates);
    case FareCapType.D:
      return getDeductionDColumns(contractDates, payNoOptions);
    case FareCapType.E:
      return getDeductionEColumns(contractDates, payNoOptions);
    default:
      return getDeductionBColumns(contractDates);
  }
}

/**
 * 設定欄位為唯讀模式
 */
export function setColumnsReadonly(columns: ColumnDef[], readonly: boolean): ColumnDef[] {
  return columns.map(col => ({
    ...col,
    editable: readonly ? false : (col.field === 'is_selected' ? true : col.editable)
  }));
}
