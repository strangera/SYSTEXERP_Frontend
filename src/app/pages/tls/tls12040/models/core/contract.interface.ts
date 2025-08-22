/**
 * 🎯 合約核心資料結構 - 業務邏輯層
 * 不包含 UI 狀態，只包含純粹的業務資料
 */
export interface ContractCore {
  // 基本識別資訊
  talentId: string;
  applyNo: string;
  contractNo?: string;
  contractSubNo?: string;

  // 合約基本資訊
  counterName: string;        // 櫃位名稱
  vendorCode: string;         // 廠商統編
  vendorName: string;         // 廠商名稱

  // 日期區間
  dateRange: ContractDateRange;

  // 商務條件
  businessConditions: BusinessConditions;

  // 組織與聯絡
  organizationInfo: OrganizationInfo;

  // 財務設定
  financialSettings: FinancialSettings;

  // 位置資訊
  locations: LocationInfo[];

  // 聯絡資訊
  contactInfo: ContactInfo;

  // 其他設定
  additionalSettings: AdditionalSettings;
}

/**
 * 合約日期區間
 */
export interface ContractDateRange {
  contractStart: string;      // 合約起始日 YYYY-MM-DD
  contractEnd: string;        // 合約結束日 YYYY-MM-DD
  operationStart: string;     // 營運起始日 YYYY-MM-DD
  operationEnd: string;       // 營運結束日 YYYY-MM-DD
  feedbackDate?: string;      // 回函日期
  dueDate?: string;          // 到期日
  contactDate?: string;      // 聯絡日期
}

/**
 * 商務條件
 */
export interface BusinessConditions {
  commissionType: CommissionType;           // 抽成別
  commissionCompType: string;               // 抽成公司類型
  paperType?: string;                       // 紙本類型
  businessType?: string;                    // 業種
  businessClass?: string;                   // 業態
  businessSubClass?: string;                // 業態細項
  decorationType?: string;                  // 裝潢類型
  moneyType?: string;                      // 金額類型
  checkTypes: string[];                    // 檢核類型
}

/**
 * 抽成類型枚舉
 */
export enum CommissionType {
  FIXED_RENT = '1',           // 固定租金
  BASE_RENT_HIGHER = '2',     // 底租抽成取高者
  GENERAL_COMMISSION = '3',   // 一般抽成
  GUARANTEED_COMMISSION = '4', // 包底抽成
  LADDER_COMMISSION = '5',    // 階梯抽成
  BASE_LADDER = '6'           // 包底加階梯
}

/**
 * 組織資訊
 */
export interface OrganizationInfo {
  orgId?: string;             // 組織代碼
  contactUserNo?: string;     // 聯絡人員工號
  contactUserName?: string;   // 聯絡人姓名
}

/**
 * 財務設定
 */
export interface FinancialSettings {
  baseRent?: number;          // 底租
  deposit?: number;           // 保證金
  creditCard?: number;        // 信用卡手續費
  checkDay?: number;          // 對帳日
  openFees?: number;          // 開櫃費
  totalAmount?: number;       // 目標營業額(業主)
  totalAmountVendor?: number; // 目標營業額(廠商)
  constructDeposit?: number;  // 裝修保證金
  constructFees?: number;     // 裝修費
  expirationDeposit?: number; // 到期保證金
  expirationFees?: number;    // 到期費用
  openDeposit?: string;       // 開櫃保證金

  // 單位資訊
  totalAmountUnit?: string;        // 目標營業額單位(業主)
  totalAmountVendorUnit?: string;  // 目標營業額單位(廠商)
}

/**
 * 位置資訊
 */
export interface LocationInfo {
  id?: number;
  locationNo: string;         // 位置編號
  building?: string;          // 建築物
  floor?: string;            // 樓層
  areaNo?: string;           // 區域編號
  space?: number;            // 坪數

  // 描述欄位（用於顯示）
  buildingDesc?: string;
  floorDesc?: string;
  areaDesc?: string;
}

/**
 * 聯絡資訊
 */
export interface ContactInfo {
  email?: string;
  invoiceEmail?: string;
  checkTitle?: string;
  storeTel?: string;
  bankId?: string;
  vendorAcctName?: string;
  vendorAcctNo?: string;
  contactTel?: string;
  contactFax?: string;
  contactAddr?: string;
  companyAddr?: string;
  remark?: string;
  ticketRemarks?: string;
}

/**
 * 其他設定
 */
export interface AdditionalSettings {
  edcYn?: string;             // EDC設定
  openFlag?: string;          // 開櫃旗標
  commissionYn?: string;      // 抽成設定
  receiveYn?: string;         // 收據設定
  posYn?: string;            // POS設定
  cashYn?: string;           // 現金設定
  storeWay?: string;         // 店面方式
  payType?: string;          // 付款方式
  vipYn?: string;            // VIP設定
  invoiceType?: string;      // 發票類型
  counterKind?: string;      // 櫃位類型
  counterCtypeTotal?: string; // 櫃位總計類型
  overallStatus?: string;    // 整體狀態
  rentAhead?: string;        // 預付租金
  rentPeriod?: number;       // 租金週期
  waterFlag?: string;        // 水費旗標
  electricFlag?: string;     // 電費旗標
  gasFlag?: string;          // 瓦斯費旗標
  salesTypes: SalesTypeSettings; // 銷售類型設定
  approveStatus: string;     // 核准狀態
}

/**
 * 銷售類型設定
 */
export interface SalesTypeSettings {
  saletype1?: string;
  saletype2?: string;
  saletype3?: string;
  saletype4?: string;
}
