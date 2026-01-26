/**
 * 抽成別類型枚舉
 * 取代原本散落在代碼中的魔術數字 '1'-'6'
 */
export enum CommissionType {
  /** 固定租金 */
  FIXED_RENT = '1',
  /** 底租抽成取高者 */
  BASE_RENT_HIGHER = '2',
  /** 一般抽成 */
  GENERAL_COMMISSION = '3',
  /** 包底抽成 */
  BASE_COMMISSION = '4',
  /** 層級抽成 */
  GRADUATED = '5',
  /** 包底加層級 */
  BASE_TIER = '6'
}

/**
 * 抽成別中文標籤對照
 */
export const CommissionTypeLabels: Record<CommissionType, string> = {
  [CommissionType.FIXED_RENT]: '固定租金',
  [CommissionType.BASE_RENT_HIGHER]: '底租抽成取高者',
  [CommissionType.GENERAL_COMMISSION]: '一般抽成',
  [CommissionType.BASE_COMMISSION]: '包底抽成',
  [CommissionType.GRADUATED]: '層級抽成',
  [CommissionType.BASE_TIER]: '包底加層級'
};

/**
 * 取得抽成別標籤
 */
export function getCommissionTypeLabel(type: CommissionType | string): string {
  return CommissionTypeLabels[type as CommissionType] || type;
}

/**
 * 判斷是否為有效的抽成別
 */
export function isValidCommissionType(type: string): type is CommissionType {
  return Object.values(CommissionType).includes(type as CommissionType);
}

/**
 * 判斷是否需要租金設定 (固定租金、底租抽成取高者)
 */
export function requiresRentSetting(type: CommissionType | string): boolean {
  return type === CommissionType.FIXED_RENT || type === CommissionType.BASE_RENT_HIGHER;
}

/**
 * 判斷是否需要包底設定 (包底抽成、包底加層級)
 */
export function requiresBaseSetting(type: CommissionType | string): boolean {
  return type === CommissionType.BASE_COMMISSION || type === CommissionType.BASE_TIER;
}

/**
 * 判斷是否需要層級設定 (層級抽成、包底加層級)
 */
export function requiresLevelSetting(type: CommissionType | string): boolean {
  return type === CommissionType.GRADUATED || type === CommissionType.BASE_TIER;
}
