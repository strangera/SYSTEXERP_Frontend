// contract-flow.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  WorkflowData,
  ContractInfo,
  ConditionData,
  CommissionType
} from '../models/tls13010.models';

@Injectable({
  providedIn: 'root'
})
export class ContractFlowService {
  private currentData = new BehaviorSubject<WorkflowData | null>(null);
  private step1Data = new BehaviorSubject<ContractInfo | null>(null);
  private step2Data = new BehaviorSubject<any>(null);
  private step3Data = new BehaviorSubject<any>(null);
  private step4Data = new BehaviorSubject<ConditionData | null>(null);

  constructor() { }

  // 設定當前工作流程資料
  setCurrentData(data: WorkflowData): void {
    this.currentData.next(data);
  }

  // 取得當前工作流程資料
  getCurrentData(): WorkflowData | null {
    return this.currentData.value;
  }

  // Step 1: 契約資訊
  setStep1Data(data: ContractInfo): void {
    this.step1Data.next(data);
  }

  getStep1Data(): ContractInfo | null {
    return this.step1Data.value;
  }

  // Step 2: 扣款設定
  setStep2Data(data: any): void {
    this.step2Data.next(data);
  }

  getStep2Data(): any {
    return this.step2Data.value;
  }

  // Step 3: 抽成設定
  setStep3Data(data: any): void {
    this.step3Data.next(data);
  }

  getStep3Data(): any {
    return this.step3Data.value;
  }

  // Step 4: 條件設定
  setStep4Data(data: ConditionData): void {
    this.step4Data.next(data);
  }

  getStep4Data(): ConditionData | null {
    return this.step4Data.value;
  }

  // 清除所有資料
  clearAllData(): void {
    this.currentData.next(null);
    this.step1Data.next(null);
    this.step2Data.next(null);
    this.step3Data.next(null);
    this.step4Data.next(null);
  }

  // 取得當前抽成類型
  getCurrentCommissionType(): CommissionType | null {
    return this.step1Data.value?.comm_comp_type || null;
  }

  // 檢查是否所有步驟都已完成
  isAllStepsCompleted(): boolean {
    return !!(
      this.step1Data.value &&
      this.step2Data.value &&
      this.step3Data.value &&
      this.step4Data.value
    );
  }
}
