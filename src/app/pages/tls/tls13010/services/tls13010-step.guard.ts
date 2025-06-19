// tls13010-step.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { ContractFlowService, WorkflowStep } from './contract-flow.service';
import { NotificationService } from '../../../../shared/component/notification-message/notification.service';

@Injectable({
  providedIn: 'root'
})
export class TLS13010StepGuard implements CanActivate {

  constructor(
    private contractFlowService: ContractFlowService,
    private router: Router,
    private messageService: NotificationService
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const targetStep = this.getStepFromRoute(route);
    const currentStatus = this.contractFlowService.getCurrentStatus();

    console.log('路由守衛檢查:', {
      targetStep,
      currentStep: currentStatus.currentStep,
      completedSteps: currentStatus.completedSteps,
      contractId: currentStatus.contractId
    });

    // 檢查是否有進行中的工作流程
    if (!currentStatus.contractId) {
      console.log('沒有進行中的工作流程，重導向到查詢頁面');
      this.messageService.warnBubble('請先從查詢頁面選擇要編輯的項目');
      this.router.navigate(['/TLS/TLS13010']);
      return false;
    }

    // 檢查是否可以訪問目標步驟
    if (!this.contractFlowService.canAccessStep(targetStep)) { // 修改這裡
      const stepName = this.contractFlowService.getStepName(targetStep); // 修改這裡
      const currentStepName = this.contractFlowService.getStepName(currentStatus.currentStep); // 修改這裡

      console.log(`無法訪問步驟 ${stepName}，當前應在 ${currentStepName}`);
      this.messageService.warnBubble(`請依序完成流程，當前應在：${currentStepName}`);

      // 重導向到應該在的步驟
      this.redirectToCorrectStep(currentStatus.currentStep);
      return false;
    }

    return true;
  }

  /**
   * 從路由取得步驟編號
   */
  private getStepFromRoute(route: ActivatedRouteSnapshot): WorkflowStep {
    // 從路由 data 取得步驟編號
    if (route.data && route.data['step'] !== undefined) {
      return route.data['step'] as WorkflowStep;
    }

    // 從路由路徑判斷步驟
    const path = route.routeConfig?.path || '';

    switch (path) {
      case 'TLS13010CRU':
        return WorkflowStep.CONTRACT_INFO;
      case 'TLS13010NEXT1':
        return WorkflowStep.DEDUCTION;
      case 'TLS13010NEXT2':
        return WorkflowStep.COMMISSION;
      case 'TLS13010NEXT3':
        return WorkflowStep.CONDITION;
      default:
        return WorkflowStep.QUERY;
    }
  }

  /**
   * 重導向到正確的步驟
   */
  private redirectToCorrectStep(currentStep: WorkflowStep): void {
    switch (currentStep) {
      case WorkflowStep.CONTRACT_INFO:
        this.router.navigate(['/TLS/TLS13010CRU']);
        break;
      case WorkflowStep.DEDUCTION:
        this.router.navigate(['/TLS/TLS13010NEXT1']);
        break;
      case WorkflowStep.COMMISSION:
        this.router.navigate(['/TLS/TLS13010NEXT2']);
        break;
      case WorkflowStep.CONDITION:
        this.router.navigate(['/TLS/TLS13010NEXT3']);
        break;
      default:
        this.router.navigate(['/TLS/TLS13010']);
    }
  }
}
