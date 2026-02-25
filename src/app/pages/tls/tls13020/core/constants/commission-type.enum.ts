/**
 * TLS12040-v2 抽成別枚舉
 */
export enum CommissionType {
  /** 固定租金 */
  FixedRent = '1',
  /** 底租抽成取高者 */
  BaseRentHigher = '2',
  /** 一般抽成 */
  GeneralCommission = '3',
  /** 包底抽成 */
  BaseCommission = '4',
  /** 層級抽成 */
  GraduatedCommission = '5',
  /** 包底加層級 */
  BaseTier = '6'
}

/** 抽成別名稱對應 */
export const COMMISSION_TYPE_NAMES: Record<CommissionType, string> = {
  [CommissionType.FixedRent]: '固定租金',
  [CommissionType.BaseRentHigher]: '底租抽成取高者',
  [CommissionType.GeneralCommission]: '一般抽成',
  [CommissionType.BaseCommission]: '包底抽成',
  [CommissionType.GraduatedCommission]: '層級抽成',
  [CommissionType.BaseTier]: '包底加層級'
};

/** 需要 Step3 (抽成設定) 的抽成別 */
export const COMMISSION_TYPES_WITH_STEP3 = [
  CommissionType.BaseRentHigher,
  CommissionType.GeneralCommission,
  CommissionType.BaseCommission,
  CommissionType.GraduatedCommission,
  CommissionType.BaseTier
];

/** 需要 Step4 (條件設定) 的抽成別 */
export const COMMISSION_TYPES_WITH_STEP4 = [
  CommissionType.FixedRent,
  CommissionType.BaseRentHigher,
  CommissionType.BaseCommission,
  CommissionType.GraduatedCommission,
  CommissionType.BaseTier
];

/** 需要包底類別的抽成別 */
export const COMMISSION_TYPES_WITH_BAODI = [
  CommissionType.BaseRentHigher,
  CommissionType.BaseCommission,
  CommissionType.BaseTier
];

/** 需要固定租金欄位的抽成別 */
export const COMMISSION_TYPES_WITH_BASE_RENT = [
  CommissionType.FixedRent,
  CommissionType.BaseRentHigher
];
