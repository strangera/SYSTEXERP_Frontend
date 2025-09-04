// 共用業務常數 - 適用於 TLS12040, TLS13010 等專櫃相關功能

// ========== 基礎選項定義 ==========

// 裝潢方式 (1:統設統裝(A統) 2:統設自裝 3:自設統裝 4:自設自裝)
export const DECO_TYPE_OPTIONS = {
  '1': '統設統裝(A統)',
  '2': '統設自裝',
  '3': '自設統裝',
  '4': '自設自裝'
} as const;

// 結帳方式 10=十日結 15=半月結 30=月結
export const MONEY_TYPE_OPTIONS = {
  '10': '十日結',
  '15': '半月結',
  '30': '月結'
} as const;

// 對帳方式(1:傳真 2:郵寄 3:網路)可複選
export const CHECK_TYPE_OPTIONS = {
  '1': '傳真',
  '2': '郵寄',
  '3': '網路'
} as const;

// 抽成別
export const TLT_TERM_TYPE_OPTIONS = {
  '1': '固定租金',
  '2': '底租抽成取高者',
  '3': '一般抽成',
  '4': '包底抽成',
  '5': '階梯式抽成',
  '6': '包底加階梯'
} as const;

// 配合方式(1=專櫃 2=自營)
export const STORE_WAY_OPTIONS = {
  '1': '專櫃',
  '2': '自營'
} as const;

// 付款方式(1:匯款 2:支票)
export const PAYTYPE_OPTIONS = {
  '1': '匯款',
  '2': '支票'
} as const;

// 發票類型 invoice_type(0:發票 1:收據)
export const INVOICE_TYPE_OPTIONS = {
  '0': '發票',
  '1': '收據'
} as const;

// 專櫃種類 tlt_kind(1.正櫃 2.臨時櫃 3.特賣會 4.虛擬櫃)
export const TLT_KIND_OPTIONS = {
  '1': '正櫃',
  '2': '臨時櫃',
  '3': '特賣會',
  '4': '虛擬櫃'
} as const;

// 營運狀態
export const TLT_OPENFLAG_OPTIONS = {
  '0': '閉店/撤櫃',
  '1': '營業中',
  '2': '已撤櫃',
  '9': '合約未生效'
} as const;

// 抽成額計算方式
export const COMM_COMP_TYPE_OPTIONS = {
  '2': '除稅'
} as const;

// 合約狀態
export const APPROVE_STATUS_OPTIONS = {
  '1': '未審核',
  '2': '已審核',
  '3': '已作廢'
} as const;

// 申請案件狀態
export const APPLY_STATUS_OPTIONS = {
  '1': '洽談中',
  '2': '簽約中',
  '3': '已轉合約',
  '5': '已作廢'
} as const;

//包底類別
export const TLT_CTYPE_MTOTAL_OPTIONS = {
  '1': '年包',
  '2': '月包',
  '3': '期間包',
} as const;


//目標營業額單位(業主)
export const TOTAL_AMT_UNIT_OPTIONS = {
  'M': '月',
  'Y': '年',
  'C': '檔期',
} as const;

//目標營業額單位(業主)
export const TOTAL_AMT_VENDOR_UNIT_OPTIONS = {
  'M': '月',
  'Y': '年',
  'C': '檔期',
} as const;

export const DEPOSIT_PAYMENT_OPTIONS = {
  '1': '現金',
  '2': '支票',
  '3': '履約保證金',
} as const;

export const OVERALL_STATUS_OPTIONS = {
  '1': '全部',
  '2': '部份',
} as const;


export const TPY_TYPE_OPTIONS = {
  '01': '坪數',
  '02': '收銀機台數',
  '03': '人數',
  '04': '度數',
  '05': '每坪每天',
  '06': '線數',
} as const;

// ========== 通用格式化函數 ==========

// 多選格式化函數
export const formatMultipleOptions = (value: string, options: Record<string, string>): string => {
  if (!value) return '';
  const values = value.includes(',') ? value.split(',').map(v => v.trim()) : [value];
  const labels = values.map(v => options[v]).filter(Boolean);
  return labels.join(', ');
};

// 單選格式化函數
export const formatSingleOption = (value: string, options: Record<string, string>): string => {
  if (!value) return '';
  const trimmedValue = value.toString().trim();
  return options[trimmedValue] || value;
};

// ========== 專用格式化函數 ==========

export const formatDecoType = (value: string): string => {
  return formatSingleOption(value, DECO_TYPE_OPTIONS);
};

export const formatMoneyType = (value: string): string => {
  return formatSingleOption(value, MONEY_TYPE_OPTIONS);
};

export const formatCheckType = (value: string): string => {
  return formatMultipleOptions(value, CHECK_TYPE_OPTIONS);
};

export const formatTltTermType = (value: string): string => {
  return formatSingleOption(value, TLT_TERM_TYPE_OPTIONS);
};

export const formatStoreWay = (value: string): string => {
  return formatSingleOption(value, STORE_WAY_OPTIONS);
};

export const formatPaytype = (value: string): string => {
  return formatSingleOption(value, PAYTYPE_OPTIONS);
};

export const formatInvoiceType = (value: string): string => {
  return formatSingleOption(value, INVOICE_TYPE_OPTIONS);
};

export const formatTltKind = (value: string): string => {
  return formatSingleOption(value, TLT_KIND_OPTIONS);
};

export const formatOpenflagStatus = (value: string): string => {
  return formatSingleOption(value, TLT_OPENFLAG_OPTIONS);
};

export const formatCommCompType = (value: string): string => {
  return formatSingleOption(value, COMM_COMP_TYPE_OPTIONS);
};

export const formatApproveStatus = (value: string): string => {
  return formatSingleOption(value, APPROVE_STATUS_OPTIONS);
};

export const formatApplyStatus = (value: string): string => {
  return formatSingleOption(value, APPLY_STATUS_OPTIONS);
};

export const formatTltctypemtotal = (value: string): string => {
  return formatSingleOption(value, TLT_CTYPE_MTOTAL_OPTIONS);
};

export const formatTotal = (value: string): string => {
  return formatSingleOption(value, TOTAL_AMT_UNIT_OPTIONS);
};

export const formatTotalAmtVendorUnit = (value: string): string => {
  return formatSingleOption(value, TOTAL_AMT_VENDOR_UNIT_OPTIONS);
};

// ========== 轉換為下拉選單格式 ==========

export interface DropdownOption {
  value: string | number;
  label: string;
}

const convertToDropdownOptions = (options: Record<string, string>): DropdownOption[] => {
  return Object.entries(options).map(([value, label]) => ({ value, label }));
};

// 共用下拉選單選項
export const SHARED_DROPDOWN_OPTIONS = {
  decorationType: convertToDropdownOptions(DECO_TYPE_OPTIONS),
  moneyType: convertToDropdownOptions(MONEY_TYPE_OPTIONS),
  checkType: convertToDropdownOptions(CHECK_TYPE_OPTIONS),
  tltTermType: convertToDropdownOptions(TLT_TERM_TYPE_OPTIONS),
  storeWay: convertToDropdownOptions(STORE_WAY_OPTIONS),
  paytype: convertToDropdownOptions(PAYTYPE_OPTIONS),
  invoiceType: convertToDropdownOptions(INVOICE_TYPE_OPTIONS),
  tltKind: convertToDropdownOptions(TLT_KIND_OPTIONS),
  openflagStatus: convertToDropdownOptions(TLT_OPENFLAG_OPTIONS),
  commCompType: convertToDropdownOptions(COMM_COMP_TYPE_OPTIONS),
  approveStatus: convertToDropdownOptions(APPROVE_STATUS_OPTIONS),
  applyStatus: convertToDropdownOptions(APPLY_STATUS_OPTIONS),
  tltctypemtotal: convertToDropdownOptions(TLT_CTYPE_MTOTAL_OPTIONS),
  totalAmt: convertToDropdownOptions(TOTAL_AMT_UNIT_OPTIONS),
  totalAmtVendor: convertToDropdownOptions(TOTAL_AMT_VENDOR_UNIT_OPTIONS),
  depositPayment: convertToDropdownOptions(DEPOSIT_PAYMENT_OPTIONS),
  overallStatus: convertToDropdownOptions(OVERALL_STATUS_OPTIONS),
  tpyTypeOption: convertToDropdownOptions(TPY_TYPE_OPTIONS),
  yesNo: [{ value: 'Y', label: '是' }, { value: 'N', label: '否' }]
} as const;
