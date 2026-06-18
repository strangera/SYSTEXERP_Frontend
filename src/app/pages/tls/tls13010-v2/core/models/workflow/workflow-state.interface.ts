import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { WorkflowStep } from '../../constants';
import { CommissionItem } from '../commission';
import { ConditionItem } from '../condition';
import { ContractInfo, ContractRequest } from '../contract';
import { FareItem } from '../deduction';

/**
 * 工作流程狀態
 */
export interface WorkflowStatus {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  canProceed: boolean;
  contractId: string | null;
  lastModified: Date;
  isNewContract?: boolean;
  crudStatus?: CRUDStatus;
}

/**
 * 合約資料結構 (工作流程中的完整資料)
 */
export interface ContractDataStructure {
  contractId: string | number | null;
  queryRowData: ContractRequest | null;
  step1: ContractInfo | null;
  step2: FareItem[];
  step3: CommissionItem[];
  step4: ConditionItem[];
  step5: FinalData | null;
  dataToDelete: unknown | null;
  unifiedCommissionData: UnifiedCommissionResponse | null;
  locationData: unknown[];
  commissionType: string | null;
  metadata: ContractMetadata;
}

/**
 * 合約元數據
 */
export interface ContractMetadata {
  createdAt: Date;
  lastModified: Date;
  version: number;
  _isNewContract: boolean;
  _loadedFromAPI: boolean;
}

/**
 * 最終資料
 */
export interface FinalData {
  contractInfo: ContractInfo;
  deductionData: unknown[];
  commissionData: unknown[];
  conditionData: unknown[];
}

/**
 * 統一抽成回應
 */
export interface UnifiedCommissionResponse {
  TalentId: string;
  TalentName: string;
  OriginalTltTermType: string;
  CurrentTltTermType: string;
  IsTermTypeChanged: boolean;
  HasError: boolean;
  ErrorMessage?: string | null;
  ActionType: string;
  UserMessage?: string;
  Warning?: UnifiedCommissionWarning;
  ExistingChargeData?: TalentChargeApiData;
  RentSettingData?: RentSettingApiData;
  DataToDelete?: CommissionDataStructure;
  NewDataStructure?: NewCommissionDataStructure;
}

/**
 * 統一抽成警告
 */
export interface UnifiedCommissionWarning {
  Message: string;
  ItemsToBeDeleted: string[];
  TotalItemsCount: number;
  HasCriticalData: boolean;
}

/**
 * API 回傳的抽成設定資料
 */
export interface TalentChargeApiData {
  TalentId: string;
  ChargeSettings: ChargeSettingApiItem[];
  TotalRecords: number;
}

/**
 * API 回傳的抽成設定項目
 */
export interface ChargeSettingApiItem {
  id: number;
  talent_id: string;
  tlt_id: string;
  tlt_id_desc: string;
  cag_bdate: string;
  cag_edate: string;
  cag_taxtype: string;
  sst_amount: number | null;
  sst_rate: number | null;
  cap_saletype1: string | null | boolean;
  cap_saletype2: string | null | boolean;
  cap_saletype5: string | null | boolean;
  cag_remark: string | null;
  ChargeDetails: ChargeDetailApiItem[];
  YearChargeDetails: YearChargeDetailApiItem[];
  LevelChargeDetails: LevelChargeDetailApiItem[];
}

export interface ChargeDetailApiItem {
  id: number;
  talent_id: string;
  tlt_id: string;
  cag_barcode: string;
  tlt_bdate: string;
  tlt_edate: string;
  cag_charge_rate: number;
  barcode_desc?: string;
}

export interface YearChargeDetailApiItem {
  id: number;
  talent_id: string;
  tlt_id: string;
  tlt_bdate: string;
  tlt_edate: string;
  year_amount: number;
  extra_rate: number;
}

export interface LevelChargeDetailApiItem {
  id: number;
  charged_id: number;
  talent_id: string;
  tlt_id: string;
  seq_no: number;
  cag_barcode: string;
  level_bmount: number;
  level_eamount: number;
  level_charge_rate: number;
  barcode_desc?: string;
}

/**
 * API 回傳的租金設定資料
 */
export interface RentSettingApiData {
  CommissionMasters?: CommissionMasterApiItem[];
  ChargedDetails?: ChargeDetailApiItem[];
  RentDetails?: RentDetailApiItem[];
  LimitDetails?: LimitDetailApiItem[];
  LevelDetails?: LevelDetailApiItem[];
  BottomTierDetails?: BottomTierDetailApiItem[];
}

export interface CommissionMasterApiItem {
  id: number;
  talent_id: string;
  tlt_id: string;
  tlt_id_desc: string;
  cag_bdate: string;
  cag_edate: string;
  cag_taxtype: string;
  sst_amount: number | null;
  sst_rate: number | null;
  cap_saletype1: string | null;
  cap_saletype2: string | null;
  cap_saletype5: string | null;
  cag_remark: string | null;
}

export interface RentDetailApiItem {
  id: number;
  talent_id: string;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  base_rent: number;
}

export interface LimitDetailApiItem {
  id: number;
  talent_id: string;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  limit_charge_rate: number;
}

export interface LevelDetailApiItem {
  id: number;
  talent_id: string;
  seq_no: number;
  cag_bdate: string;
  cag_edate: string;
  limit_amt?: number;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

export interface BottomTierDetailApiItem {
  id: number;
  talent_id: string;
  seq_no: number;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

export interface CommissionDataStructure {
  CommissionMasters?: CommissionMasterApiItem[];
  ChargedDetails?: ChargeDetailApiItem[];
  RentDetails?: RentDetailApiItem[];
  LimitDetails?: LimitDetailApiItem[];
  LevelDetails?: LevelDetailApiItem[];
}

export interface NewCommissionDataStructure {
  TermType: string;
  ChargedDetails?: unknown[];
  RentDetails?: unknown[];
  LimitDetails?: unknown[];
  LevelDetails?: unknown[];
}
