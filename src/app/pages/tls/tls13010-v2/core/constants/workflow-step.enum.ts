/**
 * 工作流程步驟枚舉
 */
export enum WorkflowStep {
  /** 查詢頁面 */
  QUERY = 0,
  /** 合約基本資料 */
  CONTRACT_INFO = 1,
  /** 代扣款設定 */
  DEDUCTION = 2,
  /** 抽成設定 */
  COMMISSION = 3,
  /** 租金設定 */
  CONDITION = 4,
  /** 最終提交 */
  FINAL = 5
}

/**
 * 工作流程步驟中文標籤
 */
export const WorkflowStepLabels: Record<WorkflowStep, string> = {
  [WorkflowStep.QUERY]: '查詢',
  [WorkflowStep.CONTRACT_INFO]: '合約基本資料',
  [WorkflowStep.DEDUCTION]: '代扣款設定',
  [WorkflowStep.COMMISSION]: '抽成設定',
  [WorkflowStep.CONDITION]: '租金設定',
  [WorkflowStep.FINAL]: '完成'
};

/**
 * 工作流程步驟對應的路由
 */
export const WorkflowStepRoutes: Record<WorkflowStep, string> = {
  [WorkflowStep.QUERY]: 'tls13010',
  [WorkflowStep.CONTRACT_INFO]: 'tls13010cru',
  [WorkflowStep.DEDUCTION]: 'tls13010next1',
  [WorkflowStep.COMMISSION]: 'tls13010next2',
  [WorkflowStep.CONDITION]: 'tls13010next3',
  [WorkflowStep.FINAL]: 'tls13010'
};

/**
 * 取得下一步驟
 */
export function getNextStep(current: WorkflowStep): WorkflowStep | null {
  const next = current + 1;
  return next <= WorkflowStep.FINAL ? next as WorkflowStep : null;
}

/**
 * 取得上一步驟
 */
export function getPreviousStep(current: WorkflowStep): WorkflowStep | null {
  const prev = current - 1;
  return prev >= WorkflowStep.QUERY ? prev as WorkflowStep : null;
}

/**
 * 判斷是否為最後一個編輯步驟
 */
export function isLastEditStep(step: WorkflowStep): boolean {
  return step === WorkflowStep.CONDITION;
}

/**
 * 取得步驟標籤
 */
export function getWorkflowStepLabel(step: WorkflowStep): string {
  return WorkflowStepLabels[step] || '';
}

/**
 * 取得步驟路由
 */
export function getWorkflowStepRoute(step: WorkflowStep): string {
  return WorkflowStepRoutes[step] || '';
}
