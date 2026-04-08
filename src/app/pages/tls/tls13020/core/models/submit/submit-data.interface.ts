/**
 * TLS12040-v2 提交資料結構
 * 對應現有 tls12040/models/tls12040submit.model.ts
 */

import { ChargeDetail, CommissionMaster, LevelChargeDetail, YearChargeDetail } from '../commission';
import { ConditionItem } from '../condition';
import { ContractInfo, LocationItem } from '../contract';
import { FareItem } from '../deduction';

/**
 * CRUD 操作類型
 */
export interface CrudOperations<T> {
  toInsert: T[];
  toUpdate: T[];
  toDelete: T[];
}

/**
 * 合約基本資料操作
 */
export interface ContractInfoOperation {
  operation: 'INSERT' | 'UPDATE';
  data: ContractInfo & {
    locationInfo: LocationItem[];
  };
}

/**
 * 代扣款操作
 */
export type DeductionOperations = CrudOperations<FareItem>;

/**
 * 抽成設定操作
 */
export interface CommissionOperations {
  masters: CrudOperations<CommissionMaster>;
  discountSettings: CrudOperations<ChargeDetail>;
  annualSettings: CrudOperations<YearChargeDetail>;
  levelSettings: CrudOperations<LevelChargeDetail>;
}

/**
 * 租金設定操作
 */
export interface ConditionOperations {
  fixedRents: CrudOperations<ConditionItem>;
  baseRentHigher: CrudOperations<ConditionItem>;
  baseCommissions: CrudOperations<ConditionItem>;
  graduated: CrudOperations<ConditionItem>;
  baseTier: CrudOperations<ConditionItem>;
}

/**
 * 提交元資料
 */
export interface SubmitMetadata {
  /** 專櫃招募編號 */
  apply_no: string;
  /** 合約編號 */
  contractId?: string;
  /** 抽成別 */
  commissionType: string;
  /** 是否為新合約 */
  isNewContract: boolean;
  /** 提交時間 */
  submittedAt: string;
  /** 總操作數 */
  totalOperations: number;
}

/**
 * 抽成別變更資訊
 */
export interface CommissionTypeChange {
  /** 是否有變更 */
  HasChanged: boolean;
  /** 原抽成別 */
  OriginalTermType: string;
  /** 新抽成別 */
  NewTermType: string;
  /** 需要清除的操作 */
  ClearOperations: {
    clearRentDetails?: boolean;
    clearLimitDetails?: boolean;
    clearLevelDetails?: boolean;
  };
}

/**
 * 完整提交資料結構
 */
export interface SubmitData {
  /** 合約基本資料 */
  contractInfo: ContractInfoOperation;
  /** 代扣款設定 */
  deductions: DeductionOperations;
  /** 抽成設定 */
  commissions: CommissionOperations;
  /** 租金設定 */
  conditions: ConditionOperations;
  /** 元資料 */
  metadata: SubmitMetadata;
  /** 抽成別變更 */
  commissionTypeChange?: CommissionTypeChange;
}

/**
 * API 回應格式
 */
export interface SubmitResponse {
  success: boolean;
  message: string;
  data?: {
    talentId?: string;
    contractNo?: string;
    totalProcessed?: number;
    processingTime?: string;
    warnings?: string[];
  };
}
