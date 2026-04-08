/**
 * TLS12080-v2 工作流程步驟枚舉
 */
export enum WorkflowStep {
  /** Step 1: 合約基本資料 */
  ContractInfo = 0,
  /** Step 2: 代扣款設定 */
  Deduction = 1,
  /** Step 3: 抽成設定 */
  Commission = 2,
  /** Step 4: 租金設定 */
  Condition = 3
}

/** 步驟標籤 */
export const STEP_LABELS: Record<WorkflowStep, string> = {
  [WorkflowStep.ContractInfo]: '合約基本資料',
  [WorkflowStep.Deduction]: '代扣款設定',
  [WorkflowStep.Commission]: '抽成設定',
  [WorkflowStep.Condition]: '租金設定'
};

/** 資料狀態 */
export type DataStatus = 'original' | 'new' | 'modified' | 'deleted';

/** 操作模式 */
export type WizardMode = 'create' | 'edit' | 'view' | 'renewal';
