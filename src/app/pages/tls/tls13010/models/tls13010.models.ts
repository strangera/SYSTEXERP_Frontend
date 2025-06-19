// tls13010.models.ts

// 基本資料模型
export interface BaseModel {
  id?: number | string;
  talent_id: string;
  tlt_id: string;
  tlt_id_desc?: string;
  cag_bdate: string;
  cag_edate: string;
}

// 抽成類型列舉
export enum CommissionType {
  FIXED_RENT = '1',           // 固定租金
  BASE_RENT_HIGHER = '2',     // 底租抽成取高者
  GENERAL = '3',             // 一般抽成
  BASE_COMMISSION = '4',      // 包底抽成
  GRADUATED = '5',           // 階梯式抽成
  BASE_TIER = '6'            // 包底加階梯
}

// 契約資訊
export interface ContractInfo extends BaseModel {
  apply_no: string;
  tlt_name: string;
  VEN_Name: string;
  ven_uniform?: string;
  comm_comp_type: CommissionType;
  contract_subno?: string;
  tlt_bdate?: string;
  tlt_edate?: string;
  tlt_contract_bdate?: string;
  tlt_contract_edate?: string;
}

// 固定租金資料
export interface FixedRentData extends BaseModel {
  base_rent: number;
}

// 底租抽成取高者資料
export interface BaseRentHigherData extends BaseModel {
  base_rent: number;
  charge_rate: number;
}

// 包底抽成資料
export interface BaseCommissionData extends BaseModel {
  limit_amt: number;
  charge_rate: number;
}

// 階梯式抽成資料
export interface GraduatedCommissionData extends BaseModel {
  seq_no: number;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

// 包底加階梯資料
export interface BaseTierData extends BaseModel {
  limit_amt: number;
  seq_no: number;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

// API 回應介面
export interface ApiResponse<T> {
  Status: string;
  Data: T;
  Error?: any;
  Message?: string;
  TotalCount?: number;
  TotalPage?: number;
}

// 條件設定資料
export interface ConditionData {
  graduatedItems: GraduatedCommissionData[];
  baseTierItems: BaseTierData[];
  baseCommissionItems: BaseCommissionData[];
  fixedRentItems: FixedRentData[];
  baseRentHigherItems: BaseRentHigherData[];
}

// 工作流程資料
export interface WorkflowData {
  contractInfo: ContractInfo;
  deductionData: any; // 待定義
  commissionData: any; // 待定義
  conditionData: ConditionData;
  talentId: string;
}
