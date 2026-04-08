import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  WorkflowStep,
  getNextStep,
  getPreviousStep,
  getWorkflowStepRoute,
  isLastEditStep
} from '../../core/constants';
import { WorkflowStateService } from './workflow-state.service';

/**
 * 工作流程導航服務
 *
 * 職責: 處理步驟間的導航邏輯
 * - 前進/後退步驟
 * - 導航到特定步驟
 * - 導航驗證
 */
@Injectable({ providedIn: 'root' })
export class WorkflowNavigationService {
  constructor(
    private router: Router,
    private stateService: WorkflowStateService
  ) {}

  /**
   * 導航到下一步驟
   */
  goToNextStep(): boolean {
    const currentStep = this.stateService.getCurrentStep();
    const nextStep = getNextStep(currentStep);

    if (nextStep === null) {
      console.warn('[WorkflowNavigationService] 已經是最後一步');
      return false;
    }

    // 標記當前步驟完成
    this.stateService.markStepCompleted(currentStep);

    return this.navigateToStep(nextStep);
  }

  /**
   * 導航到上一步驟
   */
  goToPreviousStep(): boolean {
    const currentStep = this.stateService.getCurrentStep();
    const prevStep = getPreviousStep(currentStep);

    if (prevStep === null) {
      console.warn('[WorkflowNavigationService] 已經是第一步');
      return false;
    }

    return this.navigateToStep(prevStep);
  }

  /**
   * 導航到指定步驟
   */
  navigateToStep(step: WorkflowStep): boolean {
    const route = getWorkflowStepRoute(step);

    if (!route) {
      console.error('[WorkflowNavigationService] 無效的步驟:', step);
      return false;
    }

    // 更新當前步驟
    this.stateService.updateCurrentStep(step);

    // 執行導航
    this.router.navigate(['/account/tls', route]);
    return true;
  }

  /**
   * 返回查詢頁面
   */
  goToQueryPage(): void {
    this.stateService.reset();
    this.router.navigate(['/account/tls', 'tls13010']);
  }

  /**
   * 取消並返回
   */
  cancel(): void {
    this.stateService.reset();
    this.goToQueryPage();
  }

  /**
   * 檢查是否可以導航到指定步驟
   */
  canNavigateToStep(targetStep: WorkflowStep): boolean {
    const currentStep = this.stateService.getCurrentStep();
    const completedSteps = this.stateService.getWorkflowStatus().completedSteps;

    // 可以回到已完成的步驟
    if (completedSteps.includes(targetStep)) {
      return true;
    }

    // 可以前進到下一步 (如果當前步驟已完成)
    if (targetStep === currentStep + 1 && completedSteps.includes(currentStep)) {
      return true;
    }

    // 可以停留在當前步驟
    if (targetStep === currentStep) {
      return true;
    }

    return false;
  }

  /**
   * 檢查是否為最後編輯步驟
   */
  isLastStep(): boolean {
    const currentStep = this.stateService.getCurrentStep();
    return isLastEditStep(currentStep);
  }

  /**
   * 取得下一步驟 (如果有的話)
   */
  getNextStep(): WorkflowStep | null {
    const currentStep = this.stateService.getCurrentStep();
    return getNextStep(currentStep);
  }

  /**
   * 取得上一步驟 (如果有的話)
   */
  getPreviousStep(): WorkflowStep | null {
    const currentStep = this.stateService.getCurrentStep();
    return getPreviousStep(currentStep);
  }
}
