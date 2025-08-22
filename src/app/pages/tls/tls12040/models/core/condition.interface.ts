// ================================================================
// src/app/features/tls13010/models/core/condition.interface.ts

/**
 * 🎯 條件設定核心資料結構
 */
export interface ConditionCore {
  id?: number;
  talentId: string;
  conditionType: ConditionType;
  dateRange: ConditionDateRange;
}

/**
 * 條件類型
 */
export enum ConditionType {
  FIXED_RENT = 'FIXED_RENT',
  BASE_RENT_HIGHER = 'BASE_RENT_HIGHER',
  GUARANTEED_COMMISSION = 'GUARANTEED_COMMISSION',
  LADDER_COMMISSION = 'LADDER_COMMISSION',
  BASE_LADDER = 'BASE_LADDER'
}

/**
 * 條件日期區間
 */
export interface ConditionDateRange {
  startDate: string;    // 開始日期 YYYY-MM-DD
  endDate: string;      // 結束日期 YYYY-MM-DD
}

/**
 * 固定租金條件
 */
export interface FixedRentCondition extends ConditionCore {
  conditionType: ConditionType.FIXED_RENT;
  categoryId: string;     // 類別代碼
  baseRent: number;       // 底租金額
}

/**
 * 底租抽成取高者條件
 */
export interface BaseRentHigherCondition extends ConditionCore {
  conditionType: ConditionType.BASE_RENT_HIGHER;
  categoryId: string;     // 類別代碼
  baseRent: number;       // 底租金額
  commissionRate?: number; // 抽成費率
}

/**
 * 包底抽成條件
 */
export interface GuaranteedCommissionCondition extends ConditionCore {
  conditionType: ConditionType.GUARANTEED_COMMISSION;
  categoryId: string;     // 類別代碼
  limitAmount: number;    // 限制金額
  limitChargeRate: number; // 限制費率
}

/**
 * 階梯抽成條件
 */
export interface LadderCommissionCondition extends ConditionCore {
  conditionType: ConditionType.LADDER_COMMISSION;
  sequenceNo: number;     // 序號
  numberRange: NumberRange; // 數量區間
  chargeRate: number;     // 收費率
}

/**
 * 包底加階梯條件
 */
export interface BaseLadderCondition extends ConditionCore {
  conditionType: ConditionType.BASE_LADDER;
  sequenceNo: number;     // 序號
  categoryId: string;     // 類別代碼
  limitAmount: number;    // 限制金額
  numberRange: NumberRange; // 數量區間
  chargeRate: number;     // 收費率
}

/**
 * 數量區間
 */
export interface NumberRange {
  startNumber: number;    // 起始數量
  endNumber: number;      // 結束數量
}

/**
 * 聯合條件類型
 */
export type AnyCondition =
  | FixedRentCondition
  | BaseRentHigherCondition
  | GuaranteedCommissionCondition
  | LadderCommissionCondition
  | BaseLadderCondition;
