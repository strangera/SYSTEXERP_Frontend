// tls13010-next3.component.ts - 完整修正版
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ContractFlowService, WorkflowStep } from '../../../service/API/tls/tls13010contract-flow/contract-flow.service';
import { TLS13010Service } from '../../../service/API/tls/tls13010.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ColumnDef } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { TLS13010_DROPDOWN_OPTIONS } from '../tls13010/tls13010.dropdown';

// 🎯 後端 API Response 介面定義
interface TLS13010CommissionResponse {
  Status: string;
  Data: CommissionData;
  Error?: any;
  Meta?: any;
  Message?: string;
  TotalCount?: number;
  TotalPage?: number;
}

interface CommissionData {
  TalentId: string;
  TalentName: string;
  OriginalTltTermType: string;
  CurrentTltTermType: string;
  IsTermTypeChanged: boolean;
  HasError: boolean;
  ErrorMessage?: string;
  DataToDelete?: CommissionDataStructure;
  NewDataStructure?: {
    TermType: string;
  };
  ExistingData?: CommissionDataStructure;
}

interface CommissionDataStructure {
  CommissionMasters?: CommissionMaster[];
  ChargedDetails?: ChargedDetail[];
  RentDetails?: RentDetail[];
  LimitDetails?: LimitDetail[];
  LevelDetails?: LevelDetail[];
}

interface CommissionMaster {
  id: number;
  talent_id: number;
  tlt_id: string;
  tlt_id_desc: string;
  cag_bdate: string;
  cag_edate: string;
  cag_taxtype: string;
  sst_amount: number;
  sst_rate: number;
  cap_saletype1: string;
  cap_saletype2: string;
  cag_remark: string;
}

interface ChargedDetail {
  id: number;
  talent_id: number;
  tlt_id: string;
  cag_barcode: string;
  tlt_bdate: string;
  tlt_edate: string;
  cag_charge_rate: number;
}

interface RentDetail {
  id: number;
  talent_id: number;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  base_rent: number;
}

interface LimitDetail {
  id: number;
  talent_id: number;
  tlt_id: string;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  limit_charge_rate: number;
}

interface LevelDetail {
  id: number;
  talent_id: number;
  seq_no: number;
  cag_bdate: string;
  cag_edate: string;
  limit_amt: number;
  start_number: number;
  end_number: number;
  charge_rate: number;
}

// 🔧 前端資料模型
interface ConditionDataItem {
  id?: number | string;
  ischeck: boolean;
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
  F: string;
  G: string;
}

interface ContractInfo {
  id: string | number;
  talent_id: string;
  apply_no: string;
  tlt_name: string;
  VEN_Name: string;
  contract_subno?: string;
  ven_uniform?: any;
  comm_comp_type?: any;
  tlt_bdate?: string;
  tlt_edate?: string;
  tlt_contract_bdate?: string;
  tlt_contract_edate?: string;
}

interface GraduatedItems extends ConditionDataItem { }
interface BaseTierItems extends ConditionDataItem { }
interface BaseCommissionItems extends ConditionDataItem { }
interface FixedRentItems extends ConditionDataItem { }
type BaseRentHigherItems = FixedRentItems;

@Component({
  selector: 'app-tls13010-next3',
  templateUrl: './tls13010-next3.component.html',
  styleUrls: ['./tls13010-next3.component.scss']
})
export class Tls13010Next3Component extends BasicCruPageComponent<ConditionDataItem> implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  dataForm: FormGroup;

  // 🎯 確認對話框控制
  showConfirmDialog = false;

  // 當前合約資料
  currentTalentId: string = '';
  currentContractData: any = null;
  contractInfoData: ContractInfo[] = [];

  // 條件設定資料結構
  graduatedItems: GraduatedItems[] = [];
  baseTierItems: BaseTierItems[] = [];
  baseCommissionItems: BaseCommissionItems[] = [];
  fixedRentItems: FixedRentItems[] = [];
  baseRentHigherItems: BaseRentHigherItems[] = [];

  // 契約資訊欄位定義
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

  // 各類型條件設定的欄位定義
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

  fixedRentColumns: ColumnDef[] = [
    { field: 'ischeck', header: '是否新增', type: 'checkbox', editable: true, autoWidth: true },
    { field: 'A', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'B', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'C', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'D', header: '租金金額', type: 'number', editable: true, autoWidth: true },
  ];

  baseRentHigherColumns: ColumnDef[] = [
    { field: 'ischeck', header: '是否新增', type: 'checkbox', editable: true, autoWidth: true },
    { field: 'A', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'B', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'C', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'D', header: '租金金額', type: 'number', editable: true, autoWidth: true },
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

      const step1Data = this.contractFlowService.getStep1Data();
      console.log('📝 Step1 編輯資料:', step1Data);

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

      this.loadConditionData();
    } else {
      console.warn('❌ 沒有 talent_id，重導向到前一步');
      this.router.navigate(['/TLS/TLS13010CRU']);
    }
  }

  // 🎯 修正：載入條件設定資料
  private loadConditionData(): void {
    console.log('🔍 開始載入條件設定資料...');

    const savedConditionData = this.contractFlowService.getStepData(WorkflowStep.CONDITION);

    if (savedConditionData && Object.keys(savedConditionData).length > 0) {
      console.log('📦 發現暫存的條件資料，先使用暫存資料');
      this.loadConditionDataFromCache(savedConditionData);
      // 🎯 但仍然要呼叫後端 API 來檢查是否有更新
      this.loadCommissionDataFromBackend();
    } else {
      console.log('📭 沒有暫存資料，從後端 API 載入');
      // 🎯 沒有暫存資料時，直接從後端載入
      this.loadCommissionDataFromBackend();
    }
  }

  // 🎯 修正：從暫存載入條件資料
  private loadConditionDataFromCache(savedData: any): void {
    try {
      console.log('🔄 從暫存載入條件資料:', savedData);

      this.graduatedItems = savedData.graduatedItems || [];
      this.baseTierItems = savedData.baseTierItems || [];
      this.baseCommissionItems = savedData.baseCommissionItems || [];
      this.fixedRentItems = savedData.fixedRentItems || [];
      this.baseRentHigherItems = savedData.baseRentHigherItems || [];

      console.log('✅ 暫存條件資料載入完成');
    } catch (error) {
      console.error('❌ 暫存條件資料載入失敗:', error);
      this.initializeEmptyConditionData();
    }
  }

  // 🎯 初始化空的條件資料
  private initializeEmptyConditionData(): void {
    console.log('📝 初始化空的條件設定資料');

    this.graduatedItems = [];
    this.baseTierItems = [];
    this.baseCommissionItems = [];
    this.fixedRentItems = [];
    this.baseRentHigherItems = [];
  }

  // 🎯 儲存條件設定到工作流程
  private saveConditionDataToWorkflow(): void {
    console.log('💾 儲存條件設定資料到工作流程');

    const conditionData = {
      graduatedItems: this.graduatedItems,
      baseTierItems: this.baseTierItems,
      baseCommissionItems: this.baseCommissionItems,
      fixedRentItems: this.fixedRentItems,
      baseRentHigherItems: this.baseRentHigherItems
    };

    try {
      this.contractFlowService.saveStep4Data(conditionData);
      console.log('✅ 已成功暫存條件設定資料到工作流程');
    } catch (error) {
      console.error('❌ 儲存條件設定資料時發生錯誤:', error);
    }
  }

  // 🎯 判斷是否顯示特定抽成類型的條件設定
  shouldShowCommissionType(commissionTypeCode: string): boolean {
    const currentCommissionType = this.contractInfoData[0]?.comm_comp_type;
    return currentCommissionType === commissionTypeCode;
  }

  get existingCommissionTypes(): string[] {
    const commissionType = this.contractInfoData[0]?.comm_comp_type;
    return commissionType ? [commissionType] : [];
  }

  // 🎯 修改：顯示確認對話框而非直接跳轉
  onSubmitNext(): void {
    console.log('🎯 準備顯示確認對話框');
    this.saveConditionDataToWorkflow();
    this.showConfirmDialog = true;
  }

  // 🎯 新增：處理確認對話框結果
  onConfirmDialogResult(confirmed: boolean): void {
    console.log('🔔 確認對話框結果:', confirmed);
    this.showConfirmDialog = false;

    if (confirmed) {
      console.log('✅ 使用者確認送出，開始提交流程');
      this.submitContractData();
    } else {
      console.log('❌ 使用者取消送出');
    }
  }

  // 🔧 修正：實際提交契約資料的方法
  private submitContractData(): void {
    console.log('🚀 開始提交契約資料...');
    this.loading = true;

    try {
      // 收集所有步驟的資料
      const step1Data = this.contractFlowService.getStep1Data();
      const step2Data = this.contractFlowService.getStep2Data();
      const step3Data = this.contractFlowService.getStep3Data();
      const step4Data = this.contractFlowService.getStep4Data();

      const submitData = {
        contractInfo: step1Data,
        deductionData: step2Data,
        commissionData: step3Data,
        conditionData: step4Data,
        talentId: this.currentTalentId
      };

      console.log('📋 準備提交的資料:', submitData);

      // 🎯 目前先用模擬的成功回應
      setTimeout(() => {
        this.loading = false;
        this.notificationService.successBubble('契約資料提交成功！');
        this.contractFlowService.clearAllData();
        this.router.navigate(['/TLS/TLS13010']);
      }, 2000);

    } catch (error) {
      console.error('❌ 提交契約資料時發生錯誤:', error);
      this.loading = false;
      this.notificationService.errorBubble('契約資料提交失敗，請稍後再試');
    }
  }

  // 🔧 修正：使用父類的 onCancel，但自定義行為
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

  // 🎯 表格事件處理
  onTableSave(event: any, type: string): void {
    console.log(`${type} 表格儲存:`, event);
    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('條件設定已儲存');
  }

  onTableEdit(event: any, type: string): void {
    console.log(`${type} 表格編輯:`, event);
  }

  onTableCancel(event: any, type: string): void {
    console.log(`${type} 表格取消:`, event);
  }

  // 🎯 載入後端抽成設定資料的方法
  private loadCommissionDataFromBackend(): void {
    if (!this.currentTalentId) {
      console.warn('❌ 沒有 talent_id，無法載入後端資料');
      this.initializeEmptyConditionData();
      return;
    }

    const commissionType = this.contractInfoData[0]?.comm_comp_type;

    if (!commissionType) {
      console.warn('❌ 沒有抽成別資訊，無法載入後端資料');
      this.initializeEmptyConditionData();
      return;
    }

    console.log('🔍 開始從後端載入抽成設定資料...');
    console.log('📋 請求參數:', { talentId: this.currentTalentId, commissionType });

    this.loading = true;

    const request = {
      TalentId: this.currentTalentId,
      CurrentTltTermType: commissionType
    };

    const subscription = this.tls13010Service.queryTLS13010Commission(request)
      .subscribe({
        next: (response) => {
          console.log('✅ 後端抽成設定資料載入成功:', response);
          this.processBackendCommissionData(response.Data);
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ 載入後端抽成設定資料失敗:', error);
          this.loading = false;
          this.initializeConditionDataByCommissionType(commissionType);
          this.notificationService.warnBubble('載入現有抽成設定失敗，可新增條件設定');
        }
      });

    this.subscriptions.push(subscription);
  }

  // 🎯 修正：處理後端回應資料
  private processBackendCommissionData(data: CommissionData): void {
    try {
      console.log('🔄 處理後端抽成設定資料:', data);

      // 🎯 檢查是否有錯誤
      if (data.HasError) {
        console.error('❌ 後端回傳錯誤:', data.ErrorMessage);
        this.initializeConditionDataByCommissionType(data.CurrentTltTermType);
        this.notificationService.errorBubble(data.ErrorMessage || '載入抽成設定資料時發生錯誤');
        return;
      }

      if (data.IsTermTypeChanged) {
        console.log('⚠️ 抽成別已改變，需要處理資料變更');
        this.handleCommissionTypeChange(data);
      } else {
        console.log('ℹ️ 抽成別未改變，載入現有資料');
        this.loadExistingCommissionData(data);
      }

      this.saveConditionDataToWorkflow();

    } catch (error) {
      console.error('❌ 處理後端抽成設定資料時發生錯誤:', error);
      this.initializeConditionDataByCommissionType(this.contractInfoData[0]?.comm_comp_type);
      this.notificationService.errorBubble('處理抽成設定資料時發生錯誤');
    }
  }

  // 🎯 處理抽成別改變
  private handleCommissionTypeChange(data: CommissionData): void {
    console.log('🔄 處理抽成別改變:', data);

    this.notificationService.warnBubble(
      `抽成別已從 ${data.OriginalTltTermType} 變更為 ${data.CurrentTltTermType}，舊資料將被清除`
    );

    if (data.DataToDelete) {
      console.log('🗑️ 有資料需要刪除:', data.DataToDelete);
    }

    if (data.NewDataStructure) {
      console.log('📝 載入新的資料結構:', data.NewDataStructure);
      this.initializeConditionDataByCommissionType(data.NewDataStructure.TermType);
    } else {
      this.initializeConditionDataByCommissionType(data.CurrentTltTermType);
    }
  }

  // 🎯 載入現有抽成資料
  private loadExistingCommissionData(data: CommissionData): void {
    console.log('🔄 載入現有抽成資料:', data);

    if (data.ExistingData) {
      console.log('📋 發現現有資料，開始對應到前端模型');
      this.mapBackendDataToFrontend(data.ExistingData, data.CurrentTltTermType);
    } else {
      console.log('📭 沒有現有資料，初始化空資料供新增');
      this.initializeConditionDataByCommissionType(data.CurrentTltTermType);
    }
  }

  // 🎯 根據抽成類型初始化空資料
  private initializeConditionDataByCommissionType(commissionType: string): void {
    console.log('📝 根據抽成類型初始化條件資料:', commissionType);

    this.initializeEmptyConditionData();

    switch (commissionType) {
      case '1': // 固定租金
        this.fixedRentItems = [this.createEmptyItem()];
        console.log('✅ 初始化固定租金空項目');
        break;
      case '2': // 底租抽成取高者
        this.baseRentHigherItems = [this.createEmptyItem()];
        console.log('✅ 初始化底租抽成取高者空項目');
        break;
      case '3': // 一般抽成
        console.log('ℹ️ 一般抽成無需額外條件設定');
        break;
      case '4': // 包底抽成
        this.baseCommissionItems = [this.createEmptyItem()];
        console.log('✅ 初始化包底抽成空項目');
        break;
      case '5': // 階梯式抽成
        this.graduatedItems = [this.createEmptyItem()];
        console.log('✅ 初始化階梯式抽成空項目');
        break;
      case '6': // 包底加階梯
        this.baseTierItems = [this.createEmptyItem()];
        console.log('✅ 初始化包底加階梯空項目');
        break;
      default:
        console.warn('❌ 不支援的抽成類型:', commissionType);
    }
  }

  // 🎯 建立空白項目
  private createEmptyItem(): ConditionDataItem {
    return {
      id: Date.now() + Math.random(),
      ischeck: false,
      A: '', B: '', C: '', D: '', E: '', F: '', G: ''
    };
  }

  // 🎯 對應後端資料到前端模型
  private mapBackendDataToFrontend(existingData: CommissionDataStructure, commissionType: string): void {
    console.log('🗺️ 對應後端資料到前端模型:', { existingData, commissionType });

    // 先初始化空資料
    this.initializeEmptyConditionData();

    switch (commissionType) {
      case '1': // 固定租金
        this.mapRentData(existingData);
        break;
      case '2': // 底租抽成取高者
        this.mapBaseRentHigherData(existingData);
        break;
      case '3': // 一般抽成
        this.mapGeneralCommissionData(existingData);
        break;
      case '4': // 包底抽成
        this.mapBaseCommissionData(existingData);
        break;
      case '5': // 階梯式抽成
        this.mapGraduatedCommissionData(existingData);
        break;
      case '6': // 包底加階梯
        this.mapBaseTierData(existingData);
        break;
      default:
        console.warn('❌ 不支援的抽成類型:', commissionType);
        this.initializeConditionDataByCommissionType(commissionType);
    }
  }

  // 🎯 對應固定租金資料
  private mapRentData(data: CommissionDataStructure): void {
    if (data.RentDetails && data.RentDetails.length > 0) {
      this.fixedRentItems = data.RentDetails.map((item, index) => ({
        id: item.id,
        ischeck: true,
        A: item.tlt_id || '',
        B: item.cag_bdate || '',
        C: item.cag_edate || '',
        D: item.base_rent?.toString() || '',
        E: '', F: '', G: ''
      }));
      console.log('✅ 載入固定租金資料:', this.fixedRentItems.length, '筆');
    } else {
      this.initializeConditionDataByCommissionType('1');
    }
  }

  // 🎯 對應底租抽成取高者資料
  private mapBaseRentHigherData(data: CommissionDataStructure): void {
    if (data.RentDetails && data.ChargedDetails) {
      // 結合租金和抽成資料
      this.baseRentHigherItems = data.RentDetails.map((rentItem, index) => {
        const chargedItem = data.ChargedDetails?.[index] || {} as ChargedDetail;
        return {
          id: rentItem.id,
          ischeck: true,
          A: rentItem.tlt_id || chargedItem.tlt_id || '',
          B: rentItem.cag_bdate || chargedItem.tlt_bdate || '',
          C: rentItem.cag_edate || chargedItem.tlt_edate || '',
          D: rentItem.base_rent?.toString() || '',
          E: chargedItem.cag_charge_rate?.toString() || '',
          F: '', G: ''
        };
      });
      console.log('✅ 載入底租抽成取高者資料:', this.baseRentHigherItems.length, '筆');
    } else {
      this.initializeConditionDataByCommissionType('2');
    }
  }

  // 🎯 對應一般抽成資料
  private mapGeneralCommissionData(data: CommissionDataStructure): void {
    console.log('ℹ️ 一般抽成無需額外條件設定');
    this.initializeEmptyConditionData();
  }

  // 🎯 對應包底抽成資料
  private mapBaseCommissionData(data: CommissionDataStructure): void {
    if (data.LimitDetails && data.LimitDetails.length > 0) {
      this.baseCommissionItems = data.LimitDetails.map((item, index) => ({
        id: item.id,
        ischeck: true,
        A: item.tlt_id || '',
        B: item.cag_bdate || '',
        C: item.cag_edate || '',
        D: item.limit_amt?.toString() || '',
        E: item.limit_charge_rate?.toString() || '',
        F: '', G: ''
      }));
      console.log('✅ 載入包底抽成資料:', this.baseCommissionItems.length, '筆');
    } else {
      this.initializeConditionDataByCommissionType('4');
    }
  }

  // 🎯 對應階梯式抽成資料
  private mapGraduatedCommissionData(data: CommissionDataStructure): void {
    if (data.LevelDetails && data.LevelDetails.length > 0) {
      this.graduatedItems = data.LevelDetails.map((item, index) => ({
        id: item.id,
        ischeck: true,
        A: item.seq_no?.toString() || '',
        B: item.cag_bdate || '',
        C: item.cag_edate || '',
        D: item.start_number?.toString() || '',
        E: item.end_number?.toString() || '',
        F: item.charge_rate?.toString() || '',
        G: ''
      }));
      console.log('✅ 載入階梯式抽成資料:', this.graduatedItems.length, '筆');
    } else {
      this.initializeConditionDataByCommissionType('5');
    }
  }

  // 🎯 對應包底加階梯資料
  private mapBaseTierData(data: CommissionDataStructure): void {
    if (data.LimitDetails && data.LevelDetails) {
      // 結合包底和階梯資料
      this.baseTierItems = data.LevelDetails.map((levelItem, index) => ({
        id: levelItem.id,
        ischeck: true,
        A: levelItem.seq_no?.toString() || '',
        B: levelItem.cag_bdate || '',
        C: levelItem.cag_edate || '',
        D: data.LimitDetails?.[0]?.limit_amt?.toString() || '', // 使用第一筆包底金額
        E: levelItem.start_number?.toString() || '',
        F: levelItem.end_number?.toString() || '',
        G: levelItem.charge_rate?.toString() || ''
      }));
      console.log('✅ 載入包底加階梯資料:', this.baseTierItems.length, '筆');
    } else {
      this.initializeConditionDataByCommissionType('6');
    }
  }
}
