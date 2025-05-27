// TLS13010 下拉選單選項
// 基於 tls13010.constants.ts 的選項對照表

import {
  DECO_TYPE_OPTIONS,
  MONEY_TYPE_OPTIONS,
  CHECK_TYPE_OPTIONS,
  COMMISSION_COMP_TYPE_OPTIONS,
  COMM_COMP_TYPE_OPTIONS,
  TLT_TERM_TYPE_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  PAYTYPE_OPTIONS,
  STORE_WAY_OPTIONS,
  INVOICE_TYPE_OPTIONS,
  TLT_KIND_OPTIONS,
  TLT_OPENFLAG_OPTIONS,
  METER_TYPE_OPTIONS,
  OVERALL_STATUS_OPTIONS
} from './tls13010.constants';

// ========== 介面定義 ==========
export interface DropdownOption {
  value: string | number;
  label: string;
}

// ========== 轉換函數 ==========
// 將對照表轉換成下拉選單格式
const convertToDropdownOptions = (options: Record<string, string>): DropdownOption[] => {
  return Object.entries(options).map(([value, label]) => ({
    value,
    label
  }));
};

// ========== 下拉選單選項 ==========

// 裝潢方式選項
export const decorationTypeDropdownOptions: DropdownOption[] = convertToDropdownOptions(DECO_TYPE_OPTIONS);

// 結帳方式選項
export const moneyTypeDropdownOptions: DropdownOption[] = convertToDropdownOptions(MONEY_TYPE_OPTIONS);

// 對帳方式選項 (可複選)
export const checkTypeDropdownOptions: DropdownOption[] = convertToDropdownOptions(CHECK_TYPE_OPTIONS);

// 抽成別選項
export const commissionCompTypeDropdownOptions: DropdownOption[] = convertToDropdownOptions(COMMISSION_COMP_TYPE_OPTIONS);

// 抽成額計算方式選項
// export const commCompTypeDropdownOptions: DropdownOption[] = convertToDropdownOptions(COMM_COMP_TYPE_OPTIONS);
// 抽成額計算方式選項 (固定除稅)
export const commCompTypeDropdownOptions: DropdownOption[] = [
  { value: '2', label: '除稅' }
];

// 配合方式選項
export const tltTermTypeDropdownOptions: DropdownOption[] = convertToDropdownOptions(TLT_TERM_TYPE_OPTIONS);

// 營業類型選項
export const businessTypeDropdownOptions: DropdownOption[] = convertToDropdownOptions(BUSINESS_TYPE_OPTIONS);

// 付款方式選項
export const paytypeDropdownOptions: DropdownOption[] = convertToDropdownOptions(PAYTYPE_OPTIONS);

// 收款方式選項
export const storeWayDropdownOptions: DropdownOption[] = convertToDropdownOptions(STORE_WAY_OPTIONS);

// 發票類型選項
export const invoiceTypeDropdownOptions: DropdownOption[] = convertToDropdownOptions(INVOICE_TYPE_OPTIONS);

// 專櫃種類選項
export const tltKindDropdownOptions: DropdownOption[] = convertToDropdownOptions(TLT_KIND_OPTIONS);

// 營運狀態選項
export const openflagStatusDropdownOptions: DropdownOption[] = convertToDropdownOptions(TLT_OPENFLAG_OPTIONS);

// 抄表類型選項 (可複選)
export const meterTypeDropdownOptions: DropdownOption[] = convertToDropdownOptions(METER_TYPE_OPTIONS);

// 超出部份處理方式選項
export const overallStatusDropdownOptions: DropdownOption[] = convertToDropdownOptions(OVERALL_STATUS_OPTIONS);

// ========== Y/N 選項 ==========
export const yesNoDropdownOptions: DropdownOption[] = [
  { value: 'Y', label: '是' },
  { value: 'N', label: '否' }
];

// ========== 保證金相關選項 ==========
export const depositPaymentDropdownOptions: DropdownOption[] = [
  { value: 1, label: '現金' },
  { value: 2, label: '支票' },
  { value: 3, label: '履約保證金' }
];

// 保證金類型選項
export const depositTypeDropdownOptions: DropdownOption[] = [
  { value: '1', label: '準時開業' },
  { value: '2', label: '施工保證' },
  { value: '3', label: '契約屆滿保證票' }
];

// ========== 統一匯出所有選項 ==========
export const TLS13010_DROPDOWN_OPTIONS = {
  decorationType: decorationTypeDropdownOptions,
  moneyType: moneyTypeDropdownOptions,
  checkType: checkTypeDropdownOptions,
  commissionCompType: commissionCompTypeDropdownOptions,
  commCompType: commCompTypeDropdownOptions,
  tltTermType: tltTermTypeDropdownOptions,
  businessType: businessTypeDropdownOptions,
  paytype: paytypeDropdownOptions,
  storeWay: storeWayDropdownOptions,
  invoiceType: invoiceTypeDropdownOptions,
  tltKind: tltKindDropdownOptions,
  openflagStatus: openflagStatusDropdownOptions,
  meterType: meterTypeDropdownOptions,
  overallStatus: overallStatusDropdownOptions,
  yesNo: yesNoDropdownOptions,
  depositPayment: depositPaymentDropdownOptions,
  depositType: depositTypeDropdownOptions
} as const;
