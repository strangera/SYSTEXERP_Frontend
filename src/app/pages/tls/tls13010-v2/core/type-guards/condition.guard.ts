import {
  BaseCommissionCondition,
  BaseRentHigherCondition,
  BaseTierCondition,
  ConditionItem,
  FixedRentCondition,
  GeneralCommissionCondition,
  GraduatedCommissionCondition
} from '../models/condition';

/**
 * 判斷是否為固定租金條件
 */
export function isFixedRentCondition(item: ConditionItem): item is FixedRentCondition {
  return 'base_rent' in item && !('cag_charge_rate' in item) && !('seq_no' in item);
}

/**
 * 判斷是否為底租抽成取高者條件
 */
export function isBaseRentHigherCondition(item: ConditionItem): item is BaseRentHigherCondition {
  return 'base_rent' in item && 'cag_charge_rate' in item && !('limit_amt' in item);
}

/**
 * 判斷是否為一般抽成條件
 */
export function isGeneralCommissionCondition(item: ConditionItem): item is GeneralCommissionCondition {
  return 'tlt_id_desc' in item && 'cag_taxtype' in item && !('limit_amt' in item);
}

/**
 * 判斷是否為包底抽成條件
 */
export function isBaseCommissionCondition(item: ConditionItem): item is BaseCommissionCondition {
  return 'limit_amt' in item && 'limit_charge_rate' in item && !('seq_no' in item);
}

/**
 * 判斷是否為層級抽成條件
 */
export function isGraduatedCommissionCondition(item: ConditionItem): item is GraduatedCommissionCondition {
  return 'seq_no' in item && 'charge_rate' in item && !('limit_amt' in item);
}

/**
 * 判斷是否為包底加層級條件
 */
export function isBaseTierCondition(item: ConditionItem): item is BaseTierCondition {
  return 'seq_no' in item && 'limit_amt' in item && 'charge_rate' in item;
}

/**
 * 根據抽成別取得條件類型名稱
 */
export function getConditionTypeName(commissionType: string): string {
  const typeNames: Record<string, string> = {
    '1': '固定租金',
    '2': '底租抽成取高者',
    '3': '一般抽成',
    '4': '包底抽成',
    '5': '層級抽成',
    '6': '包底加層級'
  };
  return typeNames[commissionType] || '未知類型';
}
