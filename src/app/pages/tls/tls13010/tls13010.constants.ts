
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
  '5': '層級抽成',
  '6': '包底加層級'
} as const;

// 配合方式(1=專櫃 2=自營)
export const STORE_WAY_OPTIONS = {
  '1': '專櫃',
  '2': '自營'
} as const;

// 付款方式(1:匯款 2:支票)
export const PAYTYPE_OPTIONS = {
  '1': '匯款',
  '2': '支票',
  '3': '現金',
} as const;

// 收款方式
// export const STORE_WAY_OPTIONS = {
//   '1': '現場收款',
//   '2': '統一收款',
//   '3': '分期收款'
// } as const;

// 發票類型 invoice_type(0:發票 1:收據)
export const INVOICE_TYPE_OPTIONS = {
  '0': '發票',
  '1': '收據',
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

// 抄表類型
export const METER_TYPE_OPTIONS = {
  'WATER': '水表',
  'ELECTRIC': '電表',
  'GAS': '瓦斯表'
} as const;

// 超出部份處理方式(1:全部 2:部份)
export const OVERALL_STATUS_OPTIONS = {
  '1': '全部',
  '2': '部份',
} as const;

// 包底類別
export const TLT_CTYPE_MTOTAL_OPTIONS = {
  '1': '年包',
  '2': '月包',
  '0': '期間包',
} as const;

export const TPY_TYPE_OPTIONS = {
  '01': '坪數',
  '02': '收銀機台數',
  '03': '人數',
  '04': '度數',
  '05': '每坪每天',
  '06': '線數',
} as const;

export const CAG_TAXTYPE_OPTIONS = {
  '0': '免稅',
  '1': '應稅',
} as const;

export const COMM_COMP_TYPE_OPTIONS = {
  // '1': '含稅',
  '2': '除稅'
} as const;

// 合約狀態
export const APPROVE_STATUS_OPTIONS = {
  '1': '未審核',
  '2': '已審核',
  '3': '已作廢',
} as const;

//申請案件狀態
export const APPLY_STATUS_OPTIONS = {
  '1': '洽談中',
  '2': '簽約中',
  '3': '已轉合約',
  '5': '已作廢',
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

//銷售類型
export const CAP_SALE_TYPE_OPTIONS = {
  '1': '銷售額',
  '2': '信用卡',
  '3': '信用卡分期',
  '5': '券類',
  '6': '滿千送百-發行',
  '7': '滿千送百-兌回',
  '8': '會員卡集點-銷售',
  '10': '全館消費滿額集點-銷售',
  '11': '全館消費滿額集點-點數',
  '52': '一卡通',
  '55': 'line pay',
} as const;


//銷售類型
export const CAP_SALE_TYPE_OPTIONS_E = {
  '1': '銷售額',
  '2': '信用卡',
  '3': '信用卡分期',
  '5': '券類',
  '6': '滿千送百-發行',
  '7': '滿千送百-兌回',
  '8': '會員卡集點-銷售',
  '10': '全館消費滿額集點-銷售',
  '11': '全館消費滿額集點-點數',
  '52': '一卡通',
  '55': 'line pay',
} as const;


//信用卡期數
export const INSTMS_TYPE_OPTIONS = {
  '3': '3',
  '6': '6',
  '9': '9',
  '12': '12',
  '14': '14',
} as const;

//收單行
export const EDC_BANK_OPTIONS = {
  'N': '聯合信用卡',
  'C': '中國信託',
  'S': '中信-停車場',
} as const;

//收單行
export const CALC_TYPE_OPTIONS = {
  '1': '單筆',
  '2': '單月累積金額',
  '3': '全租期累計營業額',
} as const;

// ========== 格式化函數 ==========

// 通用的多選格式化函數
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

// ========== 專門的格式化函數 ==========

// 對帳方式格式化
export const formatCheckType = (value: string): string => {
  return formatMultipleOptions(value, CHECK_TYPE_OPTIONS);
};

// 結帳方式格式化
export const formatMoneyType = (value: string): string => {
  return formatSingleOption(value, MONEY_TYPE_OPTIONS);
};

// 裝潢方式格式化
export const formatDecoType = (value: string): string => {
  return formatSingleOption(value, DECO_TYPE_OPTIONS);
};

// 抽成別格式化
export const formatTltTermType = (value: string): string => {
  return formatSingleOption(value, TLT_TERM_TYPE_OPTIONS);
};

// 配合方式格式化
export const formatStoreWay = (value: string): string => {
  return formatSingleOption(value, STORE_WAY_OPTIONS);
};

// 付款方式格式化
export const formatPaytype = (value: string): string => {
  return formatSingleOption(value, PAYTYPE_OPTIONS);
};



// 發票類型格式化
export const formatInvoiceType = (value: string): string => {
  return formatSingleOption(value, INVOICE_TYPE_OPTIONS);
};

// 專櫃種類格式化
export const formatTltKind = (value: string): string => {
  return formatSingleOption(value, TLT_KIND_OPTIONS);
};

// 營運狀態格式化
export const formatOpenflagStatus = (value: string): string => {
  return formatSingleOption(value, TLT_OPENFLAG_OPTIONS);
};

// 抄表類型格式化（複選）
export const formatMeterType = (value: string): string => {
  return formatMultipleOptions(value, METER_TYPE_OPTIONS);
};

// 包底類別格式化
export const formatTltCtypeMototal = (value: string): string => {
  return formatSingleOption(value, TLT_CTYPE_MTOTAL_OPTIONS);
};

// 合約狀態格式化
export const formatApproveStatus = (value: string): string => {
  return formatSingleOption(value, APPROVE_STATUS_OPTIONS);
};

// 合約狀態格式化
export const formatApplyStatus = (value: string): string => {
  return formatSingleOption(value, APPLY_STATUS_OPTIONS);
};

// 目標營業額單位(業主)
export const formaTotalAmtUnit = (value: string): string => {
  return formatSingleOption(value, TOTAL_AMT_UNIT_OPTIONS);
};

// 目標營業額單位(廠商)
export const formaTotalAmtVendorUnit = (value: string): string => {
  return formatSingleOption(value, TOTAL_AMT_VENDOR_UNIT_OPTIONS);
};

// ========== 數字格式化 ==========

// 金額格式化（加千分位）
export const formatCurrency = (value: string | number): string => {
  if (!value || value === '0') return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0' : num.toLocaleString('zh-TW');
};

// 數量格式化
export const formatCount = (value: string | number): string => {
  if (!value || value === '0') return '0';
  const num = typeof value === 'string' ? parseInt(value) : value;
  return isNaN(num) ? '0' : num.toString();
};

export const formatCommCompType = (value: string): string => {
  return formatSingleOption(value, COMM_COMP_TYPE_OPTIONS);
};
