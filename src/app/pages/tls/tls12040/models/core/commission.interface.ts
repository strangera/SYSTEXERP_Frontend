// ================================================================
// src/app/features/tls13010/models/core/commission.interface.ts

/**
 * 🎯 抽成設定核心資料結構
 */
export interface CommissionCore {
  id?: number;
  commissionType: string;          // 抽成類型代碼
  commissionTypeName: string;      // 抽成類型名稱
  taxType: CommissionTaxType;      // 稅別
  dateRange: CommissionDateRange;  // 日期區間
  settings: CommissionSettings;    // 抽成設定

  // 明細資料
  discountSettings: DiscountSetting[];     // 折扣設定
  annualPerformance: AnnualPerformance[];  // 年度業績設定
  levelSettings: LevelSetting[];           // 層級設定
}

/**
 * 抽成稅別
 */
export enum CommissionTaxType {
  TAXABLE = 1,      // 應稅
  TAX_FREE = 0      // 免稅
}

/**
 * 抽成日期區間
 */
export interface CommissionDateRange {
  startDate: string;    // 開始日期 YYYY-MM-DD
  endDate: string;      // 結束日期 YYYY-MM-DD
}

/**
 * 抽成設定
 */
export interface CommissionSettings {
  transactionAmount?: number;     // 成交金額
  specialCommission?: number;     // 特殊抽成
  thousandDiscount: boolean;      // 千元折扣
  fullPointActivity: boolean;     // 滿點活動
}

/**
 * 折扣設定明細
 */
export interface DiscountSetting {
  id?: number;
  isSelected: boolean;
  barcode: string;         // 商品條碼
  dateRange: CommissionDateRange;
  rate?: number;          // 費率
}

/**
 * 年度業績設定明細
 */
export interface AnnualPerformance {
  id?: number;
  isSelected: boolean;
  dateRange: CommissionDateRange;
  discountAmount: number;  // 折扣金額
  rate: number;           // 費率
}

/**
 * 層級設定明細
 */
export interface LevelSetting {
  id?: number;
  isSelected: boolean;
  barcode: string;         // 商品條碼
  amountRange: AmountRange; // 金額區間
  rate: number;           // 費率
}

/**
 * 金額區間
 */
export interface AmountRange {
  startAmount: number;    // 起始金額
  endAmount: number;      // 結束金額
}
