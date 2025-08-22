// ================================================================
// src/app/features/tls13010/models/core/deduction.interface.ts

/**
 * 🎯 代扣款核心資料結構
 */
export interface DeductionCore {
  id?: number;
  deductionType: DeductionType;    // 扣款類型
  itemCode: string;                // 項目代碼
  itemName: string;                // 項目名稱
  dateRange?: DeductionDateRange;  // 日期區間
  paymentInfo: PaymentInfo;        // 付款資訊
  calculationInfo: CalculationInfo; // 計算資訊
  organizationId?: string;         // 組織代碼
  isSelected: boolean;             // 是否選用
}

/**
 * 扣款類型
 */
export enum DeductionType {
  ONE_TIME = 'A',         // 一次性扣款
  MONTHLY = 'B',          // 每月扣款
  AVERAGE_SPLIT = 'C',    // 平均分攤
  RATIO_SPLIT = 'D',      // 比率分攤
  EVENT_DEDUCTION = 'E'   // 活動扣款
}

/**
 * 代扣款日期區間
 */
export interface DeductionDateRange {
  startDate?: string;     // 開始日期 YYYYMM
  endDate?: string;       // 結束日期 YYYYMM
}

/**
 * 付款資訊
 */
export interface PaymentInfo {
  paymentType?: string;   // 付款類型
  quantity?: number;      // 數量
  unitAmount?: number;    // 單價
  amount?: number;        // 金額
  totalAmount?: number;   // 總金額
  guiFlag?: string;      // GUI 旗標
}

/**
 * 計算資訊（用於分期、分攤等）
 */
export interface CalculationInfo {
  dayAccount?: string;    // 日帳戶
  interval?: number;      // 間隔
  downPayment?: number;   // 頭期款
  periodNumbers?: number; // 期數
  firstAmount?: number;   // 首期金額
  rate?: number;          // 費率
}
