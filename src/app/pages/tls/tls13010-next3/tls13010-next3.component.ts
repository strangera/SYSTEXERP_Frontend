import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ContractFlowService, WorkflowStep } from '../../../service/API/tls/tls13010contract-flow/contract-flow.service';
import { TLS13010Service } from '../../../service/API/tls/tls13010.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ColumnDef } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { TLS13010_DROPDOWN_OPTIONS } from '../tls13010/tls13010.dropdown';

interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_MRemark: string | null;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  CanDel: boolean;
}

interface ContractInfo {
  id: string | number;
  talent_id: string;
  apply_no: string;
  tlt_name: string;
  VEN_Name: string;
  contract_subno?: string;
  cap_name?: string;
  cap_item?: string;
  org_id?: string;
  tpy_type?: string;
  tlt_contract_bdate?: string;
  tlt_contract_edate?: string;
  tlt_bdate?: string;
  tlt_edate?: string;
  tpy_amount?: number;
  tpy_unitamt?: number;
  tpy_qty?: number;
  ven_uniform?: any;
  comm_comp_type?: any;
  originalFareData?: any;
}

// 🎯 你現有的介面，保持不變
interface GraduatedItems {
  ischeck: boolean;
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
  G: string;
}

interface BaseTierItems {
  ischeck: boolean;
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
  G: string;
}

interface BaseCommissionItems {
  ischeck: boolean;
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
  G: string;
}

// 🎯 固定租金和底租抽成取高者使用相同的介面
interface FixedRentItems {
  ischeck: boolean;
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
  G: string;
}

// 底租抽成取高者使用相同的介面
type BaseRentHigherItems = FixedRentItems;

@Component({
  selector: 'app-tls13010-next3',
  templateUrl: './tls13010-next3.component.html',
  styleUrls: ['./tls13010-next3.component.scss']
})
export class Tls13010Next3Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  dataForm: FormGroup;

  // 當前合約資料
  currentTalentId: string = '';
  currentContractData: any = null;
  contractInfoData: ContractInfo[] = [];

  // 🎯 你現有的資料結構，保持不變
  graduatedItems: GraduatedItems[] = [];
  baseTierItems: BaseTierItems[] = [];
  baseCommissionItems: BaseCommissionItems[] = [];
  fixedRentItems: FixedRentItems[] = [];
  baseRentHigherItems: BaseRentHigherItems[] = []; // 🎯 新增：底租抽成取高者

  // 🎯 你現有的欄位定義，保持不變
  contractInfoColumns: ColumnDef[] = [
    {
      field: 'apply_no',
      header: '專櫃招募編號',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'talent_id',
      header: '專櫃編號',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'tlt_name',
      header: '品牌(專櫃)名稱',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'ven_uniform',
      header: '廠商統編',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'VEN_Name',
      header: '廠商名稱',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'contract_subno',
      header: '版本編號',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'comm_comp_type',
      header: '抽成別',
      type: 'dropdown',
      editable: false,
      options: TLS13010_DROPDOWN_OPTIONS.commissionCompType,
      autoWidth: true
    },
    {
      field: 'tlt_bdate',
      header: '合約起始日',
      type: 'date',
      editable: false,
      autoWidth: true,
      dateFormat: 'full-date'
    },
    {
      field: 'tlt_edate',
      header: '合約終止日',
      type: 'date',
      editable: false,
      autoWidth: true,
      dateFormat: 'full-date'
    },
    {
      field: 'tlt_contract_bdate',
      header: '營運起始日',
      type: 'date',
      editable: false,
      autoWidth: true,
      dateFormat: 'full-date'
    },
    {
      field: 'tlt_contract_edate',
      header: '營運終止日',
      type: 'date',
      editable: false,
      autoWidth: true,
      dateFormat: 'full-date'
    }
  ];

  // 🎯 你現有的欄位定義，保持不變
  graduatedColumns: ColumnDef[] = [
    { field: 'ischeck', header: '是否新增', type: 'checkbox', editable: true, autoWidth: true },
    { field: 'A', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'B', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'C', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'D', header: '階梯金額(起值)', type: 'number', editable: true, autoWidth: true },
    { field: 'E', header: '階梯金額(迄值)', type: 'number', editable: true, autoWidth: true },
    { field: 'F', header: '抽成率', type: 'number', editable: true, autoWidth: true },
  ];

  baseTierColumns: ColumnDef[] = [
    { field: 'ischeck', header: '是否新增', type: 'checkbox', editable: true, autoWidth: true },
    { field: 'A', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'B', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'C', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'D', header: '包底金額', type: 'number', editable: true, autoWidth: true },
    { field: 'E', header: '階梯金額(起值)', type: 'number', editable: true, autoWidth: true },
    { field: 'F', header: '階梯金額(迄值)', type: 'number', editable: true, autoWidth: true },
    { field: 'G', header: '抽成率', type: 'number', editable: true, autoWidth: true },
  ];

  baseCommissionColumns: ColumnDef[] = [
    { field: 'ischeck', header: '是否新增', type: 'checkbox', editable: true, autoWidth: true },
    { field: 'A', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'B', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'C', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'D', header: '包底金額', type: 'number', editable: true, autoWidth: true },
    { field: 'E', header: '抽成率', type: 'number', editable: true, autoWidth: true },
  ];

  // 🎯 固定租金和底租抽成取高者使用相同欄位定義
  fixedRentColumns: ColumnDef[] = [
    { field: 'ischeck', header: '是否新增', type: 'checkbox', editable: true, autoWidth: true },
    { field: 'A', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'B', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'C', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'D', header: '包底金額', type: 'number', editable: true, autoWidth: true },
    { field: 'E', header: '抽成率', type: 'number', editable: true, autoWidth: true },
  ];

  // 🎯 底租抽成取高者使用相同的欄位定義
  baseRentHigherColumns: ColumnDef[] = [
    { field: 'ischeck', header: '是否新增', type: 'checkbox', editable: true, autoWidth: true },
    { field: 'A', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'B', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'C', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'D', header: '包底金額', type: 'number', editable: true, autoWidth: true },
    { field: 'E', header: '抽成率', type: 'number', editable: true, autoWidth: true },
  ];

  constructor(
    private contractFlowService: ContractFlowService,
    private tls13010Service: TLS13010Service,
    private notificationService: NotificationService
  ) {
    super();
    this.dataForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    console.log('TLS13010Next3Component 初始化開始');
    this.initializePage('TLS13010', this.dataForm);
    this.loadWorkflowData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // 🎯 載入工作流程資料
  private loadWorkflowData(): void {
    console.log('🚀 開始載入工作流程資料...');

    const workflowData = this.contractFlowService.getCurrentData();
    console.log('📋 工作流程資料:', workflowData);

    if (workflowData.queryRowData?.talent_id) {
      this.currentTalentId = workflowData.queryRowData.talent_id;
      this.currentContractData = workflowData.queryRowData;

      console.log('✅ 取得合約ID:', this.currentTalentId);

      // 🎯 從暫存取得 Step1 資料
      const step1Data = this.contractFlowService.getStep1Data();
      console.log('📝 Step1 編輯資料:', step1Data);

      // 🎯 準備合約資訊顯示 - 優先使用 Step1 暫存資料
      const contractInfo = {
        talent_id: step1Data?.talent_id || this.currentContractData.talent_id || '-',
        apply_no: step1Data?.apply_no || this.currentContractData.apply_no || '-',
        tlt_name: step1Data?.tlt_name || this.currentContractData.tlt_name || '-',
        VEN_Name: step1Data?.VEN_Name || this.currentContractData.VEN_Name || '-',
        ven_uniform: step1Data?.ven_uniform || this.currentContractData.ven_uniform || '-',
        contract_subno: step1Data?.contract_subno || this.currentContractData.contract_subno || '-',
        comm_comp_type: step1Data?.comm_comp_type || this.currentContractData.comm_comp_type || '-',
        tlt_bdate: step1Data?.tlt_bdate || this.currentContractData.tlt_bdate || '',
        tlt_edate: step1Data?.tlt_edate || this.currentContractData.tlt_edate || '',
        tlt_contract_bdate: step1Data?.tlt_contract_bdate || this.currentContractData.tlt_contract_bdate || '',
        tlt_contract_edate: step1Data?.tlt_contract_edate || this.currentContractData.tlt_contract_edate || ''
      };

      this.contractInfoData = [{
        id: '1',
        ...contractInfo
      }];

      console.log('📊 準備顯示的合約資訊:', this.contractInfoData);
      console.log('🏷️ 抽成別:', contractInfo.comm_comp_type);

      // 🎯 載入條件設定資料
      this.loadConditionData();
    } else {
      console.warn('❌ 沒有 talent_id，重導向到前一步');
      this.router.navigate(['/TLS/TLS13010CRU']);
    }
  }

  // 🎯 載入條件設定資料
  private loadConditionData(): void {
    console.log('🔍 開始載入條件設定資料...');

    // 檢查是否有暫存資料
    const savedConditionData = this.contractFlowService.getStepData(WorkflowStep.CONDITION);

    if (savedConditionData && Object.keys(savedConditionData).length > 0) {
      console.log('📦 發現暫存的條件資料，直接使用');
      this.loadConditionDataFromCache(savedConditionData);
    } else {
      console.log('📭 沒有暫存資料，從 API 載入');
      this.loadConditionDataFromAPI();
    }
  }

  // 🎯 從暫存載入條件資料
  private loadConditionDataFromCache(savedData: any): void {
    try {
      console.log('🔄 從暫存載入條件資料:', savedData);

      this.graduatedItems = savedData.graduatedItems || [];
      this.baseTierItems = savedData.baseTierItems || [];
      this.baseCommissionItems = savedData.baseCommissionItems || [];
      this.fixedRentItems = savedData.fixedRentItems || [];
      this.baseRentHigherItems = savedData.baseRentHigherItems || []; // 🎯 新增

      console.log('✅ 暫存條件資料載入完成');
    } catch (error) {
      console.error('❌ 暫存條件資料載入失敗:', error);
      this.loadConditionDataFromAPI();
    }
  }

  // 🎯 從 API 載入條件資料（未來實作）
  private loadConditionDataFromAPI(): void {
    if (!this.currentTalentId) {
      console.warn('❌ 沒有 talent_id，無法載入條件設定');
      this.initializeEmptyConditionData();
      return;
    }

    this.loading = true;

    // 🚨 TODO: 未來這裡會呼叫真正的 API
    // this.tls13010Service.queryTLS13010Condition(this.currentTalentId).subscribe({
    //   next: (response) => {
    //     this.convertAPIDataToConditionItems(response.Data);
    //   },
    //   error: (error) => {
    //     console.error('❌ 載入條件設定資料失敗:', error);
    //     this.initializeEmptyConditionData();
    //   }
    // });

    // 🎯 暫時用假資料模擬
    console.log('📝 模擬 API 載入，使用假資料');
    setTimeout(() => {
      this.initializeEmptyConditionData();
      this.loading = false;
    }, 500);
  }

  // 🎯 初始化空的條件資料
  private initializeEmptyConditionData(): void {
    console.log('📝 初始化空的條件設定資料');

    this.graduatedItems = [];
    this.baseTierItems = [];
    this.baseCommissionItems = [];
    this.fixedRentItems = [];
    this.baseRentHigherItems = []; // 🎯 新增
  }

  // 🎯 儲存條件設定到工作流程
  private saveConditionDataToWorkflow(): void {
    console.log('💾 儲存條件設定資料到工作流程');

    const conditionData = {
      graduatedItems: this.graduatedItems,
      baseTierItems: this.baseTierItems,
      baseCommissionItems: this.baseCommissionItems,
      fixedRentItems: this.fixedRentItems,
      baseRentHigherItems: this.baseRentHigherItems // 🎯 新增
    };

    try {
      this.contractFlowService.saveStep4Data(conditionData);
      console.log('✅ 已成功暫存條件設定資料到工作流程');
    } catch (error) {
      console.error('❌ 儲存條件設定資料時發生錯誤:', error);
    }
  }

  // 🎯 你現有的方法，但改用數字判斷
  shouldShowCommissionType(commissionTypeCode: string): boolean {
    // 🎯 從契約資訊取得抽成別（應該是數字）
    const currentCommissionType = this.contractInfoData[0]?.comm_comp_type;
    console.log('檢查抽成類型:', {
      check: commissionTypeCode,
      current: currentCommissionType,
      match: currentCommissionType === commissionTypeCode
    });
    return currentCommissionType === commissionTypeCode;
  }

  // 🎯 你現有的方法，保持不變
  get existingCommissionTypes(): string[] {
    const commissionType = this.contractInfoData[0]?.comm_comp_type;
    return commissionType ? [commissionType] : [];
  }

  // 🎯 導航方法
  onSubmitNext(): void {
    this.saveConditionDataToWorkflow();
    // 🚨 TODO: 決定下一步要去哪裡
    // this.router.navigate(['TLS/TLS13010NEXT4']); // 如果還有下一步
    // this.router.navigate(['TLS/TLS13010FINAL']); // 如果是最終確認
    this.notificationService.infoBubble('條件設定已儲存，準備進入下一步');
  }

  override onCancel(): void {
    console.log('🔙 準備回到前一步...');
    this.saveConditionDataToWorkflow();
    this.router.navigate(['/TLS/TLS13010NEXT2']);
    this.notificationService.infoBubble('已返回抽成設定頁面');
  }

  onRealCancel(): void {
    if (confirm('確定要離開契約編輯流程嗎？所有暫存資料將會保留。')) {
      this.saveConditionDataToWorkflow();
      this.router.navigate(['/TLS/TLS13010']);
      this.notificationService.infoBubble('已離開契約編輯流程');
    }
  }

  // 🎯 表格事件處理（未來需要時可以加上）
  onTableSave(event: any, type: string): void {
    console.log(`${type} 表格儲存:`, event);
    this.saveConditionDataToWorkflow();
  }

  onTableEdit(event: any, type: string): void {
    console.log(`${type} 表格編輯:`, event);
  }

  onTableCancel(event: any, type: string): void {
    console.log(`${type} 表格取消:`, event);
  }
}
