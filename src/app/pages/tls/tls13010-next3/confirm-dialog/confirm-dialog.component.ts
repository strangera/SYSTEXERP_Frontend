import { NotificationService } from './../../../../shared/component/notification-message/notification.service';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ContractFlowService, WorkflowStep } from '../../../../service/API/tls/tls13010contract-flow/contract-flow.service';
import { TLS13010_DROPDOWN_OPTIONS } from '../../tls13010/tls13010.dropdown';

// 🎯 資料摘要介面
interface DataSummary {
  contractInfo: ContractSummary;
  deductionInfo: DeductionSummary;
  commissionInfo: CommissionSummary;
  conditionInfo: ConditionSummary;
}

interface ContractSummary {
  hasChanges: boolean;
  talent_id: string;
  apply_no: string;
  tlt_name: string;
  VEN_Name: string;
  comm_comp_type: string;
  comm_comp_type_name: string;
  locationCount: number;
  totalSpace: number;
  contractPeriod: string;
  operationPeriod: string;
  keyChanges: string[];
}

interface DeductionSummary {
  hasData: boolean;
  totalItems: number;
  selectedItems: number;
  typeBreakdown: { [key: string]: { total: number; selected: number; name: string } };
  selectedItemsList: Array<{
    type: string;
    typeName: string;
    item: string;
    name: string;
    amount?: number;
    period?: string;
  }>;
}

interface CommissionSummary {
  hasData: boolean;
  totalItems: number;
  itemsList: Array<{
    id: number;
    commissionTypeName: string;
    taxTypeName: string;
    discountSummary: string;
    transactionAmount: number;
    specialCommission: number;
    settingsCount: {
      discount: number;
      annual: number;
      level: number;
    };
  }>;
}

interface ConditionSummary {
  hasData: boolean;
  commissionType: string;
  commissionTypeName: string;
  conditionCount: number;
  conditionDetails: string[];
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<boolean>();

  dataSummary: DataSummary | null = null;
  loading = false;
  currentContractData: any = null;

  constructor(
    private contractFlowService: ContractFlowService,
    private messageService: NotificationService,
    private router: Router
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      console.log('🎯 確認對話框開啟，開始載入資料摘要...');
      this.loadDataSummary();
    }
  }

  // 🎯 載入資料摘要
  private loadDataSummary(): void {
    try {
      const workflowData = this.contractFlowService.getCurrentData();
      this.currentContractData = workflowData.queryRowData;
      this.dataSummary = this.generateDataSummary();
      console.log('📊 資料摘要生成完成:', this.dataSummary);
    } catch (error) {
      console.error('❌ 載入資料摘要失敗:', error);
      this.messageService.errorBubble('載入確認資料失敗');
      this.onCancel();
    }
  }

  // 🎯 生成資料摘要
  private generateDataSummary(): DataSummary {
    const step1Data = this.contractFlowService.getStep1Data();
    const step2Data = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);
    const step3Data = this.contractFlowService.getStepData(WorkflowStep.COMMISSION);
    const step4Data = this.contractFlowService.getStepData(WorkflowStep.CONDITION);

    return {
      contractInfo: this.generateContractSummary(step1Data),
      deductionInfo: this.generateDeductionSummary(step2Data),
      commissionInfo: this.generateCommissionSummary(step3Data),
      conditionInfo: this.generateConditionSummary(step4Data)
    };
  }

  // 🎯 生成契約資訊摘要
  private generateContractSummary(step1Data: any): ContractSummary {
    const originalData = this.currentContractData;
    const keyChanges: string[] = [];

    if (step1Data && originalData) {
      if (originalData.tlt_name !== step1Data.tlt_name) {
        keyChanges.push(`櫃位名稱: ${originalData.tlt_name} → ${step1Data.tlt_name}`);
      }
      if (originalData.ven_uniform !== step1Data.ven_uniform) {
        keyChanges.push(`廠商統編: ${originalData.ven_uniform} → ${step1Data.ven_uniform}`);
      }
      if (originalData.comm_comp_type !== step1Data.comm_comp_type) {
        const oldTypeName = this.getCommissionTypeName(originalData.comm_comp_type);
        const newTypeName = this.getCommissionTypeName(step1Data.comm_comp_type);
        keyChanges.push(`抽成別: ${oldTypeName} → ${newTypeName}`);
      }
    }

    const locationInfo = step1Data?.locationInfo || [];
    const totalSpace = locationInfo.reduce((sum: number, location: any) =>
      sum + (parseFloat(location.tlt_space) || 0), 0);

    const contractPeriod = step1Data?.tlt_bdate && step1Data?.tlt_edate
      ? `${step1Data.tlt_bdate} ~ ${step1Data.tlt_edate}`
      : '未設定';

    const operationPeriod = step1Data?.tlt_contract_bdate && step1Data?.tlt_contract_edate
      ? `${step1Data.tlt_contract_bdate} ~ ${step1Data.tlt_contract_edate}`
      : '未設定';

    return {
      hasChanges: keyChanges.length > 0,
      talent_id: step1Data?.talent_id || originalData?.talent_id || '',
      apply_no: step1Data?.apply_no || originalData?.apply_no || '',
      tlt_name: step1Data?.tlt_name || originalData?.tlt_name || '',
      VEN_Name: step1Data?.VEN_Name || originalData?.VEN_Name || '',
      comm_comp_type: step1Data?.comm_comp_type || originalData?.comm_comp_type || '',
      comm_comp_type_name: this.getCommissionTypeName(step1Data?.comm_comp_type || originalData?.comm_comp_type),
      locationCount: locationInfo.length,
      totalSpace: totalSpace,
      contractPeriod: contractPeriod,
      operationPeriod: operationPeriod,
      keyChanges: keyChanges
    };
  }

  // 🎯 生成扣款資訊摘要
  private generateDeductionSummary(step2Data: any): DeductionSummary {
    if (!step2Data || typeof step2Data !== 'object') {
      return {
        hasData: false,
        totalItems: 0,
        selectedItems: 0,
        typeBreakdown: {},
        selectedItemsList: []
      };
    }

    const typeNames: { [key: string]: string } = {
      'A': '一次扣款',
      'B': '每月扣款',
      'C': '平均分攤',
      'D': '比率分攤',
      'E': '活動扣款'
    };

    let totalItems = 0;
    let selectedItems = 0;
    const typeBreakdown: { [key: string]: { total: number; selected: number; name: string } } = {};
    const selectedItemsList: any[] = [];

    Object.keys(typeNames).forEach(capType => {
      const items = step2Data[capType] || [];
      const selectedInType = items.filter((item: any) => item.is_selected);

      totalItems += items.length;
      selectedItems += selectedInType.length;

      typeBreakdown[capType] = {
        total: items.length,
        selected: selectedInType.length,
        name: typeNames[capType]
      };

      selectedInType.forEach((item: any) => {
        selectedItemsList.push({
          type: capType,
          typeName: typeNames[capType],
          item: item.cap_item || '',
          name: item.cap_name || '',
          amount: item.tpy_amount,
          period: item.tpy_bdate && item.tpy_edate
            ? `${item.tpy_bdate} ~ ${item.tpy_edate}`
            : item.tpy_bdate || ''
        });
      });
    });

    return {
      hasData: totalItems > 0,
      totalItems,
      selectedItems,
      typeBreakdown,
      selectedItemsList
    };
  }

  // 🎯 生成抽成資訊摘要
  private generateCommissionSummary(step3Data: any): CommissionSummary {
    if (!step3Data || !Array.isArray(step3Data) || step3Data.length === 0) {
      return {
        hasData: false,
        totalItems: 0,
        itemsList: []
      };
    }

    const itemsList = step3Data.map((item: any) => ({
      id: item.id,
      commissionTypeName: item.commissionTypeName || `抽成類別${item.id}`,
      taxTypeName: item.taxType === 1 ? '應稅' : '免稅',
      discountSummary: item.discountSummary || '未設定',
      transactionAmount: item.transactionAmount || 0,
      specialCommission: item.specialCommission || 0,
      settingsCount: {
        discount: (item.discountSettingItems || []).filter((d: any) => d.selected).length,
        annual: (item.annualPerformanceItems || []).filter((a: any) => a.selected).length,
        level: (item.discountLevelItems || []).filter((l: any) => l.selected).length
      }
    }));

    return {
      hasData: true,
      totalItems: step3Data.length,
      itemsList
    };
  }

  // 🎯 生成條件資訊摘要
  private generateConditionSummary(step4Data: any): ConditionSummary {
    const step1Data = this.contractFlowService.getStep1Data();
    const commissionType = step1Data?.comm_comp_type || this.currentContractData?.comm_comp_type || '';
    const commissionTypeName = this.getCommissionTypeName(commissionType);

    let conditionCount = 0;
    const conditionDetails: string[] = [];

    if (step4Data) {
      if (step4Data.graduatedItems?.length > 0) {
        const checkedItems = step4Data.graduatedItems.filter((item: any) => item.ischeck);
        conditionCount += checkedItems.length;
        if (checkedItems.length > 0) {
          conditionDetails.push(`階梯式抽成: ${checkedItems.length} 筆設定`);
        }
      }

      if (step4Data.baseTierItems?.length > 0) {
        const checkedItems = step4Data.baseTierItems.filter((item: any) => item.ischeck);
        conditionCount += checkedItems.length;
        if (checkedItems.length > 0) {
          conditionDetails.push(`包底加階梯: ${checkedItems.length} 筆設定`);
        }
      }

      if (step4Data.baseCommissionItems?.length > 0) {
        const checkedItems = step4Data.baseCommissionItems.filter((item: any) => item.ischeck);
        conditionCount += checkedItems.length;
        if (checkedItems.length > 0) {
          conditionDetails.push(`包底抽成: ${checkedItems.length} 筆設定`);
        }
      }

      if (step4Data.fixedRentItems?.length > 0) {
        const checkedItems = step4Data.fixedRentItems.filter((item: any) => item.ischeck);
        conditionCount += checkedItems.length;
        if (checkedItems.length > 0) {
          conditionDetails.push(`固定租金: ${checkedItems.length} 筆設定`);
        }
      }

      if (step4Data.baseRentHigherItems?.length > 0) {
        const checkedItems = step4Data.baseRentHigherItems.filter((item: any) => item.ischeck);
        conditionCount += checkedItems.length;
        if (checkedItems.length > 0) {
          conditionDetails.push(`底租抽成取高者: ${checkedItems.length} 筆設定`);
        }
      }
    }

    return {
      hasData: conditionCount > 0,
      commissionType,
      commissionTypeName,
      conditionCount,
      conditionDetails
    };
  }

  // 🎯 取得抽成類型名稱
  private getCommissionTypeName(commissionType: string): string {
    const option = TLS13010_DROPDOWN_OPTIONS.commissionCompType.find(
      opt => opt.value === commissionType
    );
    return option ? option.label : commissionType || '未設定';
  }

  // 🎯 檢查是否有任何資料
  hasAnyData(): boolean {
    if (!this.dataSummary) return false;
    return this.dataSummary.deductionInfo.hasData ||
      this.dataSummary.commissionInfo.hasData ||
      this.dataSummary.conditionInfo.hasData;
  }

  // 🎯 取得變更摘要文字
  getChangesSummaryText(): string {
    if (!this.dataSummary) return '';

    const changes: string[] = [];

    if (this.dataSummary.contractInfo.hasChanges) {
      changes.push(`契約資訊異動 ${this.dataSummary.contractInfo.keyChanges.length} 項`);
    }

    if (this.dataSummary.deductionInfo.hasData) {
      changes.push(`已選擇 ${this.dataSummary.deductionInfo.selectedItems} 個扣款項目`);
    }

    if (this.dataSummary.commissionInfo.hasData) {
      changes.push(`設定 ${this.dataSummary.commissionInfo.totalItems} 個抽成項目`);
    }

    if (this.dataSummary.conditionInfo.hasData) {
      changes.push(`設定 ${this.dataSummary.conditionInfo.conditionCount} 個條件項目`);
    }

    return changes.join('、') || '無重要變更';
  }

  // 🎯 確認送出
  onConfirm(): void {
    console.log('✅ 使用者確認送出');
    this.loading = true;
    this.messageService.blockUi();
    this.performFinalSubmit();
  }

  // 🎯 取消送出
  onCancel(): void {
    console.log('❌ 使用者取消送出');
    this.visible = false;
    this.visibleChange.emit(false);
    this.confirmed.emit(false);
  }

  // 🎯 執行最終送出
  private performFinalSubmit(): void {
    console.log('🚀 執行最終送出流程');

    try {
      // 🚨 TODO: 未來這裡會呼叫真正的 API

      // 模擬送出過程
      setTimeout(() => {
        this.loading = false;
        this.messageService.unblockUi();
        this.messageService.successBubble('契約資料送出成功！');

        // 關閉對話框
        this.visible = false;
        this.visibleChange.emit(false);
        this.confirmed.emit(true);

        // 清除暫存資料
        this.contractFlowService.clearTempData();

        // 返回查詢頁面
        this.router.navigate(['/TLS/TLS13010']);
      }, 2000);

    } catch (error) {
      console.error('❌ 送出失敗:', error);
      this.loading = false;
      this.messageService.unblockUi();
      this.messageService.errorBubble('送出失敗，請重試');
    }
  }
}
