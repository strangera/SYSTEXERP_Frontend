// TLS13010 相關的常數定義和格式化函數

// ========== 選項對照表 ==========

// 裝潢方式 (1:統設統裝(A統) 2:統設自裝 3:自設統裝 4:自設自裝) (TLTTALENT.deco_type)
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

// 對帳方式(1:傳真 2:郵寄 3:網路 )可複選
export const CHECK_TYPE_OPTIONS = {
  '1': '傳真',
  '2': '郵寄',
  '3': '網路'
} as const;


// 抽成別
export const COMMISSION_COMP_TYPE_OPTIONS = {
  '1': '固定租金',
  '2': '底租抽成取高者',
  '3': '一般抽成',
  '4': '包底抽成',
  '5': '階梯式抽成',
  '6': '包底加階梯'
} as const;


//抽成額計算方式(1:含稅, 2:除稅)--畫面上只有2的選項
export const COMM_COMP_TYPE_OPTIONS = {
  '1': '含稅',
  '2': '除稅'
} as const;

// 配合方式(1=專櫃 2=自營)
export const TLT_TERM_TYPE_OPTIONS = {
  '1': '專櫃',
  '2': '自營'
} as const;

// 營業類型 paper_type /*營業型態(sys1000.T101)*/
export const BUSINESS_TYPE_OPTIONS = {
  '1': '零售',
  '2': '餐飲',
  '3': '服務業',
  '4': '其他'
} as const;

// 付款方式 /*付款方式(1:匯款  2:支票)*/
export const PAYTYPE_OPTIONS = {
  '1': '匯款',
  '2': '支票'
} as const;

// 收款方式
export const STORE_WAY_OPTIONS = {
  '1': '現場收款',
  '2': '統一收款',
  '3': '分期收款'
} as const;

// 發票類型 invoice_type  /*請款單據別 0:發票 1:收據*/
export const INVOICE_TYPE_OPTIONS = {
  '1': '發票',
  '2': '收據',
} as const;

// 專櫃種類 tlt_kind /*專櫃櫃別: 1.正櫃 2.臨時櫃 3.特賣會 4.虛擬櫃 */
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
  '2': '合約結束',
  '9': '核准時合約尚未開始'
} as const;

// // 開幕狀態
// export const TLT_OPENFLAG_OPTIONS = {
//   '1': '已開幕',
//   '2': '未開幕',
//   '3': '籌備中'
// } as const;

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

/* 合約狀態 = 申請案件內容(1:新設立 2:續約 3:合約異動 4:撤櫃)*/
export const APPLY_TYPE_OPTIONS = {
  '1': '新設立',
  '2': '續約',
  '3': '合約異動',
  '4': '撤櫃'
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
  return options[value] || value;
};

// ========== 專門的格式化函數 ==========

// 對帳方式格式化
export const formatCheckType = (value: string): string => {
  return formatMultipleOptions(value, CHECK_TYPE_OPTIONS);
};

// 營業類型格式化
export const formatBusinessType = (value: string): string => {
  return formatSingleOption(value, BUSINESS_TYPE_OPTIONS);
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
export const formatCommissionCompType = (value: string): string => {
  return formatSingleOption(value, COMMISSION_COMP_TYPE_OPTIONS);
};

// 配合方式格式化
export const formatTltTermType = (value: string): string => {
  return formatSingleOption(value, TLT_TERM_TYPE_OPTIONS);
};

// 付款方式格式化
export const formatPaytype = (value: string): string => {
  return formatSingleOption(value, PAYTYPE_OPTIONS);
};

// 收款方式格式化
export const formatStoreWay = (value: string): string => {
  return formatSingleOption(value, STORE_WAY_OPTIONS);
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

// 開幕狀態格式化
export const formatTltOpenflag = (value: string): string => {
  return formatSingleOption(value, TLT_OPENFLAG_OPTIONS);
};

// 抄表類型格式化（複選）
export const formatMeterType = (value: string): string => {
  return formatMultipleOptions(value, METER_TYPE_OPTIONS);
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
