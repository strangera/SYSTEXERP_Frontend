// tls13010-next3.component.ts - 修正版：解決 Next2/Next3 資料同步問題
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ContractFlowService } from '../tls13010/services/contract-flow.service';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ColumnDef } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { TLS13010_DROPDOWN_OPTIONS } from '../tls13010/tls13010.dropdown';
import {
  ConditionDataItem,
  ContractInfo,
  FixedRentCondition,
  BaseRentHigherCondition,
  BaseCommissionCondition,
  GraduatedCommissionCondition,
  BaseTierCondition,
  SubmitDataStructure,
  GeneralCommissionCondition,
  ConditionItem,
  WorkflowStep,
  UnifiedCommissionResponse,
  RentSettingApiData,
  CommissionItem
} from '../tls13010/tls13010.model';

@Component({
  selector: 'app-tls13010-next3',
  templateUrl: './tls13010-next3.component.html',
  styleUrls: ['./tls13010-next3.component.scss']
})
export class Tls13010Next3Component extends BasicCruPageComponent<ConditionDataItem> implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  dataForm: FormGroup;
  showConfirmDialog = false;
  dataLoaded = false;
  conditionDataLoaded = false;

  // 當前合約資料
  currentTalentId: string = '';
  currentContractData: any = null;
  contractInfoData: ContractInfo[] = [];

  // 🎯 Next2 整合資料
  commissionDataFromNext2: CommissionItem[] = [];
  hasNext2Data = false;

  // 🎯 新增：暫存版本控制
  private next2DataVersion = 0;
  private next3DataVersion = 0;
  private lastSyncVersion = 0;

  // 條件設定資料
  fixedRentItems: FixedRentCondition[] = [];
  baseRentHigherItems: BaseRentHigherCondition[] = [];
  generalCommissionItems: GeneralCommissionCondition[] = [];
  baseCommissionItems: BaseCommissionCondition[] = [];
  graduatedItems: GraduatedCommissionCondition[] = [];
  baseTierItems: BaseTierCondition[] = [];

  // 契約資訊欄位定義
  contractInfoColumns: ColumnDef[] = [
    { field: 'apply_no', header: '專櫃招募編號', type: 'text', editable: false, autoWidth: true },
    { field: 'talent_id', header: '專櫃編號', type: 'text', editable: false, autoWidth: true },
    { field: 'tlt_name', header: '品牌(專櫃)名稱', type: 'text', editable: false, autoWidth: true },
    { field: 'ven_uniform', header: '廠商統編', type: 'text', editable: false, autoWidth: true },
    { field: 'VEN_Name', header: '廠商名稱', type: 'text', editable: false, autoWidth: true },
    { field: 'contract_subno', header: '版本編號', type: 'text', editable: false, autoWidth: true },
    { field: 'tlt_term_type', header: '抽成別', type: 'dropdown', editable: false, options: TLS13010_DROPDOWN_OPTIONS.tltTermType, autoWidth: true },
    { field: 'tlt_bdate', header: '合約起始日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
    { field: 'tlt_edate', header: '合約終止日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
    { field: 'tlt_contract_bdate', header: '營運起始日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' },
    { field: 'tlt_contract_edate', header: '營運終止日', type: 'date', editable: false, autoWidth: true, dateFormat: 'full-date' }
  ];

  // 各類型的欄位定義
  fixedRentColumns: ColumnDef[] = [
    { field: 'tlt_id', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'base_rent', header: '租金金額', type: 'number', editable: true, autoWidth: true }
  ];

  baseRentHigherColumns: ColumnDef[] = [
    { field: 'tlt_id', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'base_rent', header: '租金金額', type: 'number', editable: true, autoWidth: true },
    { field: 'cag_charge_rate', header: '抽成率(%)', type: 'number', editable: false, autoWidth: true, readonly: true }
  ];

  generalCommissionColumns: ColumnDef[] = [
    { field: 'tlt_id', header: '抽成類別', type: 'text', editable: false, autoWidth: true, readonly: true },
    { field: 'tlt_id_desc', header: '抽成類別名稱', type: 'text', editable: false, autoWidth: true, readonly: true },
    {
      field: 'cag_taxtype', header: '稅別', type: 'dropdown', editable: false, autoWidth: true, readonly: true, options: [
        { label: '應稅', value: '1' },
        { label: '免稅', value: '2' },
        { label: '零稅率', value: '3' }
      ]
    },
    { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'cag_barcode', header: '折扣別', type: 'dropdown', editable: true, autoWidth: true, options: TLS13010_DROPDOWN_OPTIONS.tltTermType },
    { field: 'cag_charge_rate', header: '抽成率(%)', type: 'number', editable: true, autoWidth: true }
  ];

  baseCommissionColumns: ColumnDef[] = [
    { field: 'tlt_id', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'limit_amt', header: '包底金額', type: 'number', editable: true, autoWidth: true },
    { field: 'limit_charge_rate', header: '抽成率(%)', type: 'number', editable: true, autoWidth: true }
  ];

  graduatedColumns: ColumnDef[] = [
    { field: 'seq_no', header: '序號', type: 'number', editable: true, autoWidth: true },
    { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'start_number', header: '階梯金額(起值)', type: 'number', editable: true, autoWidth: true },
    { field: 'end_number', header: '階梯金額(迄值)', type: 'number', editable: true, autoWidth: true },
    { field: 'charge_rate', header: '抽成率(%)', type: 'number', editable: true, autoWidth: true }
  ];

  baseTierColumns: ColumnDef[] = [
    { field: 'seq_no', header: '序號', type: 'number', editable: true, autoWidth: true },
    { field: 'tlt_id', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'limit_amt', header: '包底金額', type: 'number', editable: true, autoWidth: true },
    { field: 'start_number', header: '階梯金額(起值)', type: 'number', editable: true, autoWidth: true },
    { field: 'end_number', header: '階梯金額(迄值)', type: 'number', editable: true, autoWidth: true },
    { field: 'charge_rate', header: '抽成率(%)', type: 'number', editable: true, autoWidth: true }
  ];

  constructor(
    private contractFlowService: ContractFlowService,
    private tls13010Service: TLS13010Service,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    super();
    this.dataForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    console.log('🚀 TLS13010Next3Component 初始化開始');
    this.initializePage('TLS13010', this.dataForm);

    // 🎯 載入工作流程資料
    this.loadWorkflowData();

    // 🎯 設定定時檢查 Next2 資料變更
    this.setupNext2DataWatcher();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // 🎯 新增：設定 Next2 資料監聽器
  private setupNext2DataWatcher(): void {
    const watcherSubscription = setInterval(() => {
      this.checkNext2DataChanges();
    }, 1000); // 每秒檢查一次

    // 在組件銷毀時清除定時器
    this.subscriptions.push({
      unsubscribe: () => clearInterval(watcherSubscription)
    } as any);
  }

  // 🎯 新增：檢查 Next2 資料變更
  private checkNext2DataChanges(): void {
    const currentNext2Data = this.contractFlowService.getStep3Data();
    const currentVersion = this.contractFlowService.getDataVersion('step3');

    if (currentVersion > this.lastSyncVersion) {
      console.log('🔄 偵測到 Next2 資料變更，重新同步...');
      this.lastSyncVersion = currentVersion;
      this.syncFromNext2Data(currentNext2Data);
    }
  }

  // 🎯 修正：同步 Next2 資料
  private syncFromNext2Data(next2Data: CommissionItem[]): void {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    if (!this.shouldIntegrateNext2Data(commissionType || '')) {
      return;
    }

    console.log('🔄 同步 Next2 資料到 Next3...');
    console.log('📋 Next2 資料:', next2Data);

    // 🎯 重要：保留現有的 Next3 自建項目
    const existingNext3Items = this.getExistingNext3Items(commissionType || '');
    console.log('📋 現有 Next3 項目:', existingNext3Items);

    // 🎯 更新 Next2 資料
    this.commissionDataFromNext2 = next2Data || [];
    this.hasNext2Data = this.commissionDataFromNext2.length > 0;

    // 🎯 重新生成來自 Next2 的項目
    if (this.hasNext2Data) {
      this.generateConditionDataFromNext2(commissionType || '');
    }

    // 🎯 合併現有的 Next3 項目
    this.mergeNext3Items(existingNext3Items, commissionType || '');

    // 🎯 儲存更新後的資料
    this.saveConditionDataToWorkflow();
    this.cdr.detectChanges();

    console.log('✅ Next2 資料同步完成');
  }

  // 🎯 新增：取得現有的 Next3 自建項目
  private getExistingNext3Items(commissionType: string): any[] {
    const existingItems: any[] = [];

    switch (commissionType) {
      case '2':
        // 底租抽成取高者：保留非來自 Next2 的項目
        existingItems.push(...this.baseRentHigherItems.filter(item => !item._fromNext2));
        break;
      case '3':
        // 一般抽成：保留非來自 Next2 的項目
        existingItems.push(...this.generalCommissionItems.filter(item => !item._fromNext2));
        break;
    }

    return existingItems;
  }

  // 🎯 新增：合併 Next3 項目
  private mergeNext3Items(existingNext3Items: any[], commissionType: string): void {
    switch (commissionType) {
      case '2':
        // 將現有的 Next3 項目加回到陣列末尾
        this.baseRentHigherItems.push(...existingNext3Items);
        console.log(`✅ 合併底租抽成取高者項目，總數: ${this.baseRentHigherItems.length}`);
        break;
      case '3':
        // 將現有的 Next3 項目加回到陣列末尾
        this.generalCommissionItems.push(...existingNext3Items);
        console.log(`✅ 合併一般抽成項目，總數: ${this.generalCommissionItems.length}`);
        break;
    }
  }

  private loadWorkflowData(): void {
    console.log('🚀 Next3 開始載入工作流程資料...');

    const workflowData = this.contractFlowService.getCurrentData();
    console.log('📋 工作流程資料:', workflowData);

    // 🎯 詳細檢查工作流程資料結構
    console.log('🔍 詳細檢查工作流程資料:');
    console.log('  - workflowData:', workflowData);
    console.log('  - workflowData.queryRowData:', workflowData?.queryRowData);
    console.log('  - workflowData.queryRowData?._isNewContract:', workflowData?.queryRowData?._isNewContract);
    console.log('  - workflowData.contractId:', workflowData?.contractId);

    // 🎯 修正：檢查是否有工作流程資料（支援新增和編輯模式）
    const isNewContract = workflowData?.queryRowData?._isNewContract;
    const hasContractId = workflowData?.contractId;
    const hasQueryRowData = !!workflowData?.queryRowData;

    console.log('🔍 模式判定結果:');
    console.log('  - isNewContract:', isNewContract);
    console.log('  - hasContractId:', hasContractId);
    console.log('  - hasQueryRowData:', hasQueryRowData);
    console.log('  - typeof isNewContract:', typeof isNewContract);

    // 🎯 關鍵修正：新增模式或有工作流程資料就可以繼續
    if (hasContractId || isNewContract || hasQueryRowData) {
      // 🎯 修正：新增模式使用空字串，編輯模式使用原有 ID
      this.currentTalentId = workflowData?.queryRowData?.talent_id || '';
      this.currentContractData = workflowData?.queryRowData;

      console.log('✅ 工作流程狀態確認:', {
        isNewContract: isNewContract,
        currentTalentId: this.currentTalentId,
        contractId: workflowData?.contractId,
        hasContractId: hasContractId,
        mode: isNewContract ? '新增模式' : '編輯模式'
      });

      // 🎯 新增模式下設定 currentTalentId 用於追蹤
      if (isNewContract && !this.currentTalentId) {
        this.currentTalentId = 'NEW_CONTRACT'; // 設定一個識別符
        console.log('🆕 新增模式：設定臨時 talent_id =', this.currentTalentId);
      }

      // 優先使用 CRU 頁面編輯後的資料
      const step1Data = this.contractFlowService.getStep1Data();
      console.log('📝 Step1 編輯資料:', step1Data);

      // 🎯 修正：準備合約資訊，新增模式下某些欄位可能為空
      const contractInfo = {
        talent_id: step1Data?.talent_id || this.currentContractData?.talent_id || '', // 🎯 新增模式可能為空
        apply_no: step1Data?.apply_no || this.currentContractData?.apply_no || '',
        tlt_name: step1Data?.tlt_name || this.currentContractData?.tlt_name || '',
        VEN_Name: step1Data?.VEN_Name || this.currentContractData?.VEN_Name || '',
        ven_uniform: step1Data?.ven_uniform || this.currentContractData?.ven_uniform || '',
        contract_subno: step1Data?.contract_subno || this.currentContractData?.contract_subno || '',
        comm_comp_type: step1Data?.comm_comp_type || this.currentContractData?.comm_comp_type || '',
        tlt_bdate: step1Data?.tlt_bdate || this.currentContractData?.tlt_bdate || '',
        tlt_edate: step1Data?.tlt_edate || this.currentContractData?.tlt_edate || '',
        tlt_contract_bdate: step1Data?.tlt_contract_bdate || this.currentContractData?.tlt_contract_bdate || '',
        tlt_contract_edate: step1Data?.tlt_contract_edate || this.currentContractData?.tlt_contract_edate || '',
        tlt_term_type: (step1Data?.tlt_term_type || this.currentContractData?.tlt_term_type || '3').toString().trim(),
      };

      console.log('📊 準備顯示的合約資訊:', contractInfo);

      this.contractInfoData = [{
        id: contractInfo.talent_id || 'new', // 🎯 新增模式顯示 'new'
        ...contractInfo
      }];

      console.log('📊 最終合約資訊陣列:', this.contractInfoData);
      console.log('📊 合約資訊設定完成');

      // 🎯 載入資料的優先順序
      this.loadDataWithPriority();

    } else {
      console.warn('❌ 沒有有效的工作流程資料，重導向到前一步');
      console.warn('   - 缺少 contractId, isNewContract 標記或 queryRowData');
      this.router.navigate(['account/tls/tls13010cru']);
    }
  }

  // 🎯 新增：按優先順序載入資料
  private loadDataWithPriority(): void {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    // 🎯 檢查是否為新增模式
    const workflowData = this.contractFlowService.getCurrentData();
    const isNewContract = workflowData?.queryRowData?._isNewContract;

    console.log('🔍 載入資料優先順序判定:', {
      commissionType: commissionType,
      isNewContract: isNewContract,
      currentTalentId: this.currentTalentId
    });

    // 🎯 第一優先：檢查是否有 Next4 暫存資料
    const savedNext4Data = this.contractFlowService.getStepData(WorkflowStep.CONDITION);

    if (savedNext4Data && Array.isArray(savedNext4Data) && savedNext4Data.length > 0) {
      console.log('📦 使用 Next4 暫存資料');
      this.loadConditionDataFromCache(savedNext4Data);
      this.loadNext2CommissionData(); // 同時載入 Next2 資料以便監聽
      this.conditionDataLoaded = true;
      this.dataLoaded = true;
      return;
    }

    // 🎯 第二優先：從 Next2 載入並生成條件設定
    this.loadNext2CommissionData();

    // 🎯 第三優先：根據模式載入其他條件設定
    setTimeout(() => {
      if (isNewContract) {
        // 🎯 新增模式：初始化空的條件設定
        console.log('🆕 新增模式：初始化空的條件設定');
        this.initializeNewContractConditionData(commissionType || '3');
      } else {
        // 🎯 編輯模式：從 API 載入
        console.log('📝 編輯模式：載入其他條件設定');
        this.loadOtherConditionData();
      }
    }, 100);
  }

  private initializeNewContractConditionData(commissionType: string): void {
    console.log('🆕 新增模式：初始化條件設定，抽成類型:', commissionType);

    // 🎯 如果已經有 Next2 資料生成的條件設定，不要覆蓋
    if (this.hasNext2Data && this.shouldIntegrateNext2Data(commissionType)) {
      console.log('✅ 已有 Next2 生成的條件設定，跳過初始化');
      this.conditionDataLoaded = true;
      this.dataLoaded = true;
      return;
    }

    // 🎯 新增模式：根據抽成類型初始化空的條件設定
    this.initializeConditionDataByCommissionType(commissionType);

    this.conditionDataLoaded = true;
    this.dataLoaded = true;

    console.log('✅ 新增模式條件設定初始化完成');
  }

  // 🎯 載入 Next2 的抽成設定資料
  private loadNext2CommissionData(): void {
    console.log('🔍 載入 Next2 抽成設定資料...');

    const step3Data = this.contractFlowService.getStep3Data();
    console.log('📋 Step3 原始資料:', step3Data);

    // 🎯 檢查是否為新增模式
    const workflowData = this.contractFlowService.getCurrentData();
    const isNewContract = workflowData?.queryRowData?._isNewContract;

    if (step3Data && Array.isArray(step3Data) && step3Data.length > 0) {
      this.commissionDataFromNext2 = step3Data;
      this.hasNext2Data = true;

      console.log('✅ 載入 Next2 抽成設定資料成功');
      console.log('📋 資料數量:', this.commissionDataFromNext2.length);
      console.log('📋 模式:', isNewContract ? '新增模式' : '編輯模式');

      // 🎯 立即檢查是否需要生成條件設定
      const commissionType = this.contractInfoData[0]?.tlt_term_type;
      if (this.shouldIntegrateNext2Data(commissionType || '')) {
        this.generateConditionDataFromNext2(commissionType || '');
        this.conditionDataLoaded = true;
        this.dataLoaded = true;
      }
    } else {
      console.log('📭 沒有 Next2 抽成設定資料');
      this.hasNext2Data = false;

      // 🎯 新增模式下，沒有 Next2 資料是正常的
      if (isNewContract) {
        console.log('🆕 新增模式：沒有 Next2 資料是正常情況');
      }
    }
  }

  // 🎯 載入其他條件設定資料
  private loadOtherConditionData(): void {
    const commissionType = this.contractInfoData[0]?.tlt_term_type || '3';
    console.log('🔍 載入其他條件設定資料，抽成類型:', commissionType);

    // 🎯 檢查是否為新增模式
    const workflowData = this.contractFlowService.getCurrentData();
    const isNewContract = workflowData?.queryRowData?._isNewContract;

    if (isNewContract) {
      console.log('🆕 新增模式：跳過 API 載入，使用空的條件設定');
      this.initializeConditionDataByCommissionType(commissionType);
      this.conditionDataLoaded = true;
      this.dataLoaded = true;
      return;
    }

    // 🎯 如果已經有 Next2 資料生成的條件設定，不要覆蓋
    if (this.hasNext2Data && this.shouldIntegrateNext2Data(commissionType)) {
      console.log('✅ 已有 Next2 生成的條件設定，跳過載入');
      this.conditionDataLoaded = true;
      this.dataLoaded = true;
      return;
    }

    // 🎯 編輯模式：使用統一 API 資料
    const unifiedCommissionData = this.contractFlowService.getUnifiedCommissionData();
    if (unifiedCommissionData?.RentSettingData) {
      console.log('📋 使用統一 API 條件設定資料');
      this.loadConditionDataFromUnifiedAPI(unifiedCommissionData.RentSettingData);
    } else {
      console.log('📭 根據抽成類型初始化條件設定');
      this.initializeConditionDataByCommissionType(commissionType);
    }

    this.conditionDataLoaded = true;
    this.dataLoaded = true;
  }


  // 🎯 檢查是否需要整合 Next2 資料
  private shouldIntegrateNext2Data(commissionType: string): boolean {
    const shouldIntegrate = commissionType === '2' || commissionType === '3';
    console.log('🔍 檢查是否需要整合 Next2 資料:', {
      commissionType: commissionType,
      shouldIntegrate: shouldIntegrate
    });
    return shouldIntegrate;
  }

  // 🎯 從 Next2 資料生成條件設定
  private generateConditionDataFromNext2(commissionType: string): void {
    console.log('🔄 === 開始生成條件設定資料 ===');
    console.log('📋 抽成別:', commissionType);
    console.log('📋 Next2 資料:', this.commissionDataFromNext2);

    if (!this.shouldIntegrateNext2Data(commissionType)) {
      console.log('ℹ️ 此抽成類型不需要整合 Next2 資料');
      return;
    }

    // 🎯 根據抽成類型清空對應的來自 Next2 的資料
    if (commissionType === '2') {
      this.baseRentHigherItems = this.baseRentHigherItems.filter(item => !item._fromNext2);
      console.log('🧹 已清空來自 Next2 的底租抽成取高者項目');
    } else if (commissionType === '3') {
      this.generalCommissionItems = this.generalCommissionItems.filter(item => !item._fromNext2);
      console.log('🧹 已清空來自 Next2 的一般抽成項目');
    }

    // 🎯 過濾有效的抽成資料
    const validCommissionData = this.commissionDataFromNext2.filter(commission => {
      const isValid = commission &&
        (commission.commissionType || commission.id) &&
        commission._status !== 'deleted';

      console.log('📋 抽成資料有效性檢查:', {
        commission: commission,
        hasCommissionType: !!(commission.commissionType || commission.id),
        status: commission._status,
        isValid: isValid
      });

      return isValid;
    });

    console.log('📋 有效的抽成項目數量:', validCommissionData.length);

    // 🎯 根據抽成類型生成對應的條件設定
    if (commissionType === '2') {
      console.log('🔄 開始生成底租抽成取高者條件設定');
      this.generateBaseRentHigherConditions(validCommissionData);
    } else if (commissionType === '3') {
      console.log('🔄 開始生成一般抽成條件設定');
      this.generateGeneralCommissionConditions(validCommissionData);
    }

    // 🎯 檢查生成結果
    const finalItemCount = this.getConditionItemCount();
    console.log('📊 最終生成的條件設定數量:', finalItemCount);

    console.log('✅ 條件設定資料生成完成');

    // 🎯 確保 UI 更新
    this.cdr.detectChanges();
  }

  // 🎯 生成底租抽成取高者條件設定
  private generateBaseRentHigherConditions(validCommissionData: CommissionItem[]): void {
    console.log('🔄 === 生成底租抽成取高者條件設定 ===');

    validCommissionData.forEach((commission, index) => {
      console.log(`🔄 處理抽成項目 ${index + 1}:`, {
        id: commission.id,
        commissionType: commission.commissionType,
        commissionTypeName: commission.commissionTypeName,
        discountSettingItems: commission.discountSettingItems?.length || 0
      });

      // 🎯 處理折扣設定明細
      if (commission.discountSettingItems && Array.isArray(commission.discountSettingItems)) {
        const validDiscountItems = commission.discountSettingItems.filter(item => {
          const isValid = item && item._status !== 'deleted';
          return isValid;
        });

        console.log(`📋 有效的折扣設定項目數量: ${validDiscountItems.length}`);

        if (validDiscountItems.length > 0) {
          validDiscountItems.forEach((discount, discountIndex) => {
            const baseRentHigherItem: BaseRentHigherCondition = {
              id: `from_next2_base_rent_${commission.id}_${discount.id || discountIndex}`,
              talent_id: this.currentTalentId,
              tlt_id: commission.commissionType || '0',
              cag_bdate: this.formatDate(discount.startDate) || this.getDefaultStartDate(),
              cag_edate: this.formatDate(discount.endDate) || this.getDefaultEndDate(),
              base_rent: 0, // 預設租金，可編輯
              cag_charge_rate: discount.rate || 0, // 來自 Next2 的抽成率
              _status: 'original',
              _fromNext2: true,
              _readonly: false
            };

            this.baseRentHigherItems.push(baseRentHigherItem);
            console.log(`   ✅ 已新增底租抽成取高者項目:`, baseRentHigherItem);
          });
        }
      }

      // 🎯 如果沒有折扣設定明細，建立一個基本項目
      if (!commission.discountSettingItems || commission.discountSettingItems.length === 0) {
        const baseRentHigherItem: BaseRentHigherCondition = {
          id: `from_next2_base_rent_main_${commission.id}`,
          talent_id: this.currentTalentId,
          tlt_id: commission.commissionType || '0',
          cag_bdate: this.getDefaultStartDate(),
          cag_edate: this.getDefaultEndDate(),
          base_rent: 0,
          cag_charge_rate: 0,
          _status: 'original',
          _fromNext2: true,
          _readonly: false
        };

        this.baseRentHigherItems.push(baseRentHigherItem);
        console.log(`   ✅ 已新增基本底租抽成取高者項目:`, baseRentHigherItem);
      }
    });

    console.log('📋 最終底租抽成取高者條件設定數量:', this.baseRentHigherItems.length);
  }

  // 🎯 生成一般抽成條件設定
  private generateGeneralCommissionConditions(validCommissionData: CommissionItem[]): void {
    console.log('🔄 生成一般抽成條件設定');

    validCommissionData.forEach((commission, index) => {
      console.log(`🔄 處理抽成項目 ${index + 1}:`, {
        id: commission.id,
        commissionType: commission.commissionType,
        commissionTypeName: commission.commissionTypeName,
        taxType: commission.taxType,
        discountSettingItems: commission.discountSettingItems?.length || 0,
        annualPerformanceItems: commission.annualPerformanceItems?.length || 0,
        discountLevelItems: commission.discountLevelItems?.length || 0
      });

      let hasDetails = false;

      // 🎯 處理折扣設定明細
      if (commission.discountSettingItems && Array.isArray(commission.discountSettingItems)) {
        const validDiscountItems = commission.discountSettingItems.filter(item =>
          item && item._status !== 'deleted'
        );

        if (validDiscountItems.length > 0) {
          hasDetails = true;
          console.log(`📋 處理 ${validDiscountItems.length} 個折扣設定明細`);

          validDiscountItems.forEach((discount, discountIndex) => {
            const detailItem: GeneralCommissionCondition = {
              id: `from_next2_discount_${commission.id}_${discount.id || discountIndex}`,
              talent_id: this.currentTalentId,
              tlt_id: commission.commissionType || '0',
              tlt_id_desc: commission.commissionTypeName || `抽成類別${index + 1}`,
              cag_taxtype: commission.taxType === 1 ? '1' : '0',
              cag_bdate: this.formatDate(discount.startDate) || this.getDefaultStartDate(),
              cag_edate: this.formatDate(discount.endDate) || this.getDefaultEndDate(),
              cag_barcode: discount.cag_barcode || '000',
              cag_charge_rate: discount.rate || 0,
              _status: 'original',
              _fromNext2: true,
              _readonly: true
            };

            this.generalCommissionItems.push(detailItem);
            console.log(`✅ 新增一般抽成明細: ${detailItem.tlt_id_desc} - ${detailItem.cag_barcode}`);
          });
        }
      }

      // 🎯 處理年度業績明細
      if (commission.annualPerformanceItems && Array.isArray(commission.annualPerformanceItems)) {
        const validAnnualItems = commission.annualPerformanceItems.filter(item =>
          item && item._status !== 'deleted'
        );

        if (validAnnualItems.length > 0) {
          hasDetails = true;
          console.log(`📋 處理 ${validAnnualItems.length} 個年度業績明細`);

          validAnnualItems.forEach((annual, annualIndex) => {
            const annualItem: GeneralCommissionCondition = {
              id: `from_next2_annual_${commission.id}_${annual.id || annualIndex}`,
              talent_id: this.currentTalentId,
              tlt_id: commission.commissionType || '0',
              tlt_id_desc: commission.commissionTypeName || `抽成類別${index + 1}`,
              cag_taxtype: commission.taxType === 1 ? '1' : '0',
              cag_bdate: this.formatDate(annual.startDate) || this.getDefaultStartDate(),
              cag_edate: this.formatDate(annual.endDate) || this.getDefaultEndDate(),
              cag_barcode: '年度業績',
              cag_charge_rate: annual.rate || 0,
              _status: 'original',
              _fromNext2: true,
              _readonly: true
            };

            this.generalCommissionItems.push(annualItem);
            console.log(`✅ 新增年度業績明細: ${annualItem.tlt_id_desc} - 年度業績`);
          });
        }
      }

      // 🎯 處理層級抽成明細
      if (commission.discountLevelItems && Array.isArray(commission.discountLevelItems)) {
        const validLevelItems = commission.discountLevelItems.filter(item =>
          item && item._status !== 'deleted'
        );

        if (validLevelItems.length > 0) {
          hasDetails = true;
          console.log(`📋 處理 ${validLevelItems.length} 個層級抽成明細`);

          validLevelItems.forEach((level, levelIndex) => {
            const levelItem: GeneralCommissionCondition = {
              id: `from_next2_level_${commission.id}_${level.id || levelIndex}`,
              talent_id: this.currentTalentId,
              tlt_id: commission.commissionType || '0',
              tlt_id_desc: commission.commissionTypeName || `抽成類別${index + 1}`,
              cag_taxtype: commission.taxType === 1 ? '1' : '0',
              cag_bdate: this.getDefaultStartDate(),
              cag_edate: this.getDefaultEndDate(),
              cag_barcode: level.cag_barcode || '層級',
              cag_charge_rate: level.rate || 0,
              _status: 'original',
              _fromNext2: true,
              _readonly: true
            };

            this.generalCommissionItems.push(levelItem);
            console.log(`✅ 新增層級抽成明細: ${levelItem.tlt_id_desc} - ${levelItem.cag_barcode}`);
          });
        }
      }

      // 🎯 如果沒有任何明細，建立一個主要項目
      if (!hasDetails) {
        const mainItem: GeneralCommissionCondition = {
          id: `from_next2_main_${commission.id}`,
          talent_id: this.currentTalentId,
          tlt_id: commission.commissionType || '0',
          tlt_id_desc: commission.commissionTypeName || `抽成類別${index + 1}`,
          cag_taxtype: commission.taxType === 1 ? '1' : '0',
          cag_bdate: this.getDefaultStartDate(),
          cag_edate: this.getDefaultEndDate(),
          cag_barcode: '000',
          cag_charge_rate: 0,
          _status: 'original',
          _fromNext2: true,
          _readonly: true
        };

        this.generalCommissionItems.push(mainItem);
        console.log(`✅ 新增主要一般抽成項目: ${mainItem.tlt_id_desc}`);
      }
    });

    console.log('📋 一般抽成條件設定數量:', this.generalCommissionItems.length);
  }

  // 🎯 從 Step4 暫存載入條件資料
  private loadConditionDataFromCache(savedData: ConditionItem[]): void {
    try {
      console.log('🔄 從暫存載入條件資料:', savedData);
      this.categorizeConditionItems(savedData);
      console.log('✅ 暫存條件資料載入完成');
    } catch (error) {
      console.error('❌ 暫存條件資料載入失敗:', error);
      this.initializeEmptyConditionData();
    }
  }

  // 🎯 從統一 API 載入條件資料
  private loadConditionDataFromUnifiedAPI(rentSettingData: RentSettingApiData): void {
    try {
      console.log('🔄 從統一 API 載入條件設定:', rentSettingData);
      const commissionType = this.contractInfoData[0]?.tlt_term_type || '3';

      const convertedData = {
        CommissionMasters: (rentSettingData.CommissionMasters || []).map((item: any) => ({
          ...item,
          sst_amount: item.sst_amount ?? 0
        })),
        ChargedDetails: rentSettingData.ChargedDetails || [],
        RentDetails: rentSettingData.RentDetails || [],
        LimitDetails: rentSettingData.LimitDetails || [],
        LevelDetails: rentSettingData.LevelDetails || []
      };

      this.mapBackendDataToFrontend(convertedData, commissionType);
      console.log('✅ 統一 API 條件資料載入完成');
    } catch (error) {
      console.error('❌ 處理統一 API 條件資料時發生錯誤:', error);
      const safeCommissionType = this.contractInfoData[0]?.tlt_term_type || '3';
      this.initializeConditionDataByCommissionType(safeCommissionType);
    }
  }

  // 🎯 分類條件項目
  private categorizeConditionItems(conditionItems: ConditionItem[]): void {
    console.log('🏷️ 分類條件項目:', conditionItems);
    this.initializeEmptyConditionData();

    conditionItems.forEach(item => {
      if ('base_rent' in item && 'cag_charge_rate' in item) {
        this.baseRentHigherItems.push(item as BaseRentHigherCondition);
      } else if ('base_rent' in item) {
        this.fixedRentItems.push(item as FixedRentCondition);
      } else if ('tlt_id_desc' in item && 'cag_barcode' in item) {
        this.generalCommissionItems.push(item as GeneralCommissionCondition);
      } else if ('limit_amt' in item && 'seq_no' in item) {
        this.baseTierItems.push(item as BaseTierCondition);
      } else if ('limit_amt' in item) {
        this.baseCommissionItems.push(item as BaseCommissionCondition);
      } else if ('seq_no' in item) {
        this.graduatedItems.push(item as GraduatedCommissionCondition);
      }
    });
  }

  // 🎯 初始化空的條件資料
  private initializeEmptyConditionData(): void {
    this.fixedRentItems = [];
    this.baseRentHigherItems = [];
    this.baseCommissionItems = [];
    this.graduatedItems = [];
    this.baseTierItems = [];
    this.generalCommissionItems = [];
  }

  // 🎯 根據抽成類型初始化條件資料
  private initializeConditionDataByCommissionType(commissionType: string): void {
    console.log('📝 根據抽成類型初始化條件資料:', commissionType);

    this.initializeEmptyConditionData();

    const safeCommissionType = commissionType || '3';

    switch (safeCommissionType) {
      case '1':
        this.fixedRentItems = [this.createFixedRentItem()];
        break;
      case '2':
        if (!this.hasNext2Data) {
          this.baseRentHigherItems = [this.createBaseRentHigherItem()];
        }
        break;
      case '3':
        if (!this.hasNext2Data) {
          this.generalCommissionItems = [this.createGeneralCommissionItem()];
        }
        break;
      case '4':
        this.baseCommissionItems = [this.createBaseCommissionItem()];
        break;
      case '5':
        this.graduatedItems = [this.createGraduatedItem()];
        break;
      case '6':
        this.baseTierItems = [this.createBaseTierItem()];
        break;
    }
  }

  // 🎯 對應後端資料到前端模型
  private mapBackendDataToFrontend(existingData: any, commissionType: string): void {
    console.log('🗺️ 對應後端資料到前端模型:', { existingData, commissionType });
    this.initializeEmptyConditionData();

    switch (commissionType) {
      case '1':
        this.mapRentData(existingData);
        break;
      case '2':
        this.mapBaseRentHigherData(existingData);
        break;
      case '3':
        this.mapGeneralCommissionData(existingData);
        break;
      case '4':
        this.mapBaseCommissionData(existingData);
        break;
      case '5':
        this.mapGraduatedCommissionData(existingData);
        break;
      case '6':
        this.mapBaseTierData(existingData);
        break;
    }
  }

  // 各種對應方法的實現
  private mapRentData(data: any): void {
    if (data.RentDetails && data.RentDetails.length > 0) {
      this.fixedRentItems = data.RentDetails.map((item: any) => ({
        id: item.id,
        talent_id: item.talent_id.toString(),
        tlt_id: item.tlt_id || '',
        cag_bdate: this.formatDate(item.cag_bdate),
        cag_edate: this.formatDate(item.cag_edate),
        base_rent: item.base_rent || 0,
        _status: 'original'
      }));
    }
  }

  private mapBaseRentHigherData(data: any): void {
    if (data.RentDetails && data.ChargedDetails) {
      this.baseRentHigherItems = data.RentDetails.map((rentItem: any, index: number) => ({
        id: rentItem.id,
        talent_id: rentItem.talent_id.toString(),
        tlt_id: rentItem.tlt_id || '',
        cag_bdate: this.formatDate(rentItem.cag_bdate),
        cag_edate: this.formatDate(rentItem.cag_edate),
        base_rent: rentItem.base_rent || 0,
        cag_charge_rate: data.ChargedDetails?.[index]?.cag_charge_rate || 0,
        _status: 'original'
      }));
    }
  }

  private mapGeneralCommissionData(data: any): void {
    if (data.CommissionMasters && data.ChargedDetails) {
      const generalCommissionItems: GeneralCommissionCondition[] = [];

      data.CommissionMasters.forEach((master: any) => {
        const relatedChargedDetails = data.ChargedDetails?.filter(
          (charged: any) => charged.tlt_id === master.tlt_id && charged.talent_id === master.talent_id
        ) || [];

        if (relatedChargedDetails.length > 0) {
          relatedChargedDetails.forEach((charged: any) => {
            generalCommissionItems.push({
              id: `${master.id}_${charged.id}`,
              talent_id: master.talent_id.toString(),
              tlt_id: master.tlt_id,
              tlt_id_desc: master.tlt_id_desc,
              cag_taxtype: master.cag_taxtype,
              cag_bdate: this.formatDate(master.cag_bdate),
              cag_edate: this.formatDate(master.cag_edate),
              cag_barcode: charged.cag_barcode || '',
              cag_charge_rate: charged.cag_charge_rate || 0,
              _status: 'original'
            });
          });
        }
      });

      this.generalCommissionItems = generalCommissionItems;
    }
  }

  private mapBaseCommissionData(data: any): void {
    if (data.LimitDetails && data.LimitDetails.length > 0) {
      this.baseCommissionItems = data.LimitDetails.map((item: any) => ({
        id: item.id,
        talent_id: item.talent_id.toString(),
        tlt_id: item.tlt_id || '',
        cag_bdate: this.formatDate(item.cag_bdate),
        cag_edate: this.formatDate(item.cag_edate),
        limit_amt: item.limit_amt || 0,
        limit_charge_rate: item.limit_charge_rate || 0,
        _status: 'original'
      }));
    }
  }

  private mapGraduatedCommissionData(data: any): void {
    if (data.LevelDetails && data.LevelDetails.length > 0) {
      this.graduatedItems = data.LevelDetails.map((item: any) => ({
        id: item.id,
        talent_id: item.talent_id.toString(),
        seq_no: item.seq_no || 0,
        cag_bdate: this.formatDate(item.cag_bdate),
        cag_edate: this.formatDate(item.cag_edate),
        start_number: item.start_number || 0,
        end_number: item.end_number || 0,
        charge_rate: item.charge_rate || 0,
        _status: 'original'
      }));
    }
  }

  private mapBaseTierData(data: any): void {
    if (data.LimitDetails && data.LevelDetails) {
      this.baseTierItems = data.LevelDetails.map((levelItem: any) => ({
        id: levelItem.id,
        talent_id: levelItem.talent_id.toString(),
        seq_no: levelItem.seq_no || 0,
        tlt_id: '',
        cag_bdate: this.formatDate(levelItem.cag_bdate),
        cag_edate: this.formatDate(levelItem.cag_edate),
        limit_amt: levelItem.limit_amt || data.LimitDetails?.[0]?.limit_amt || 0,
        start_number: levelItem.start_number || 0,
        end_number: levelItem.end_number || 0,
        charge_rate: levelItem.charge_rate || 0,
        _status: 'original'
      }));
    }
  }

  // 🎯 建立條件項目的工廠方法
  private createFixedRentItem(): FixedRentCondition {
    return {
      id: Date.now() + Math.random(),
      talent_id: this.currentTalentId,
      tlt_id: '',
      cag_bdate: this.getDefaultStartDate(),
      cag_edate: this.getDefaultEndDate(),
      base_rent: 0,
      _status: 'new',
      _isNew: true
    };
  }

  private createBaseRentHigherItem(): BaseRentHigherCondition {
    return {
      id: Date.now() + Math.random(),
      talent_id: this.currentTalentId,
      tlt_id: '',
      cag_bdate: this.getDefaultStartDate(),
      cag_edate: this.getDefaultEndDate(),
      base_rent: 0,
      cag_charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  private createGeneralCommissionItem(): GeneralCommissionCondition {
    return {
      id: Date.now() + Math.random(),
      talent_id: this.currentTalentId,
      tlt_id: '0',
      tlt_id_desc: '',
      cag_taxtype: '1',
      cag_bdate: this.getDefaultStartDate(),
      cag_edate: this.getDefaultEndDate(),
      cag_barcode: '000',
      cag_charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  private createBaseCommissionItem(): BaseCommissionCondition {
    return {
      id: Date.now() + Math.random(),
      talent_id: this.currentTalentId,
      tlt_id: '',
      cag_bdate: this.getDefaultStartDate(),
      cag_edate: this.getDefaultEndDate(),
      limit_amt: 0,
      limit_charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  private createGraduatedItem(): GraduatedCommissionCondition {
    return {
      id: Date.now() + Math.random(),
      talent_id: this.currentTalentId,
      seq_no: this.graduatedItems.length + 1,
      cag_bdate: this.getDefaultStartDate(),
      cag_edate: this.getDefaultEndDate(),
      start_number: 0,
      end_number: 0,
      charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  private createBaseTierItem(): BaseTierCondition {
    return {
      id: Date.now() + Math.random(),
      talent_id: this.currentTalentId,
      seq_no: this.baseTierItems.length + 1,
      tlt_id: '',
      cag_bdate: this.getDefaultStartDate(),
      cag_edate: this.getDefaultEndDate(),
      limit_amt: 0,
      start_number: 0,
      end_number: 0,
      charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  // 🎯 判斷是否顯示特定抽成類型的條件設定
  shouldShowCommissionType(commissionTypeCode: string): boolean {
    const currentCommissionType = this.contractInfoData[0]?.tlt_term_type;
    return currentCommissionType === commissionTypeCode;
  }

  // 🎯 檢查是否有來自 Next2 的資料
  hasNext2IntegrationData(): boolean {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;
    return this.shouldIntegrateNext2Data(commissionType || '') && this.hasNext2Data;
  }

  getNext2IntegrationMessage(): string {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;
    const commissionName = this.getCurrentCommissionTypeName();

    if (commissionType === '2') {
      return `已整合來自「抽成設定」的折扣資料到「${commissionName}」，抽成率唯讀（來自Next2），租金可編輯`;
    } else if (commissionType === '3') {
      return `已整合來自「抽成設定」的抽成資料到「${commissionName}」，抽成類別、名稱、稅別為唯讀`;
    }
    return '';
  }

  // 🎯 取得來自 Next2 的項目數量
  getNext2ItemCount(): number {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    switch (commissionType) {
      case '2':
        return this.baseRentHigherItems.filter(item => item._fromNext2).length;
      case '3':
        return this.generalCommissionItems.filter(item => item._fromNext2).length;
      default:
        return 0;
    }
  }

  // 🎯 取得新增的項目數量
  getNewItemCount(): number {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    switch (commissionType) {
      case '1':
        return this.fixedRentItems.filter(item => item._status === 'new').length;
      case '2':
        return this.baseRentHigherItems.filter(item => item._status === 'new').length;
      case '3':
        return this.generalCommissionItems.filter(item => item._status === 'new').length;
      case '4':
        return this.baseCommissionItems.filter(item => item._status === 'new').length;
      case '5':
        return this.graduatedItems.filter(item => item._status === 'new').length;
      case '6':
        return this.baseTierItems.filter(item => item._status === 'new').length;
      default:
        return 0;
    }
  }

  // 🎯 取得總項目數量
  getConditionItemCount(): number {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    switch (commissionType) {
      case '1':
        return this.fixedRentItems.filter(item => item._status !== 'deleted').length;
      case '2':
        return this.baseRentHigherItems.filter(item => item._status !== 'deleted').length;
      case '3':
        return this.generalCommissionItems.filter(item => item._status !== 'deleted').length;
      case '4':
        return this.baseCommissionItems.filter(item => item._status !== 'deleted').length;
      case '5':
        return this.graduatedItems.filter(item => item._status !== 'deleted').length;
      case '6':
        return this.baseTierItems.filter(item => item._status !== 'deleted').length;
      default:
        return 0;
    }
  }

  // 🎯 檢查是否有條件資料
  hasConditionData(): boolean {
    return this.getConditionItemCount() > 0;
  }

  // 🎯 取得當前抽成類型名稱
  getCurrentCommissionTypeName(): string {
    const code = this.contractInfoData[0]?.tlt_term_type;
    const option = TLS13010_DROPDOWN_OPTIONS.tltTermType.find(opt => opt.value === code);
    return option ? option.label : code || '未載入';
  }

  // 🎯 新增項目的方法
  onAddFixedRentItem(): void {
    const newItem = this.createFixedRentItem();
    this.fixedRentItems.push(newItem);
    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('已新增固定租金項目');
  }

  onAddBaseRentHigherItem(): void {
    const newItem = this.createBaseRentHigherItem();
    this.baseRentHigherItems.push(newItem);
    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('已新增底租抽成取高者項目');
  }

  onAddGeneralCommissionItem(): void {
    const newItem = this.createGeneralCommissionItem();
    this.generalCommissionItems.push(newItem);
    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('已新增一般抽成項目');
  }

  onAddBaseCommissionItem(): void {
    const newItem = this.createBaseCommissionItem();
    this.baseCommissionItems.push(newItem);
    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('已新增包底抽成項目');
  }

  onAddGraduatedItem(): void {
    const newItem = this.createGraduatedItem();
    this.graduatedItems.push(newItem);
    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('已新增階梯式抽成項目');
  }

  onAddBaseTierItem(): void {
    const newItem = this.createBaseTierItem();
    this.baseTierItems.push(newItem);
    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('已新增包底加階梯項目');
  }

  // 🎯 表格事件處理
  onTableSave(event: any, type: string): void {
    console.log(`${type} 表格儲存:`, event);

    if (event.newData) {
      // 🎯 檢查是否為來自 Next2 的資料
      if (event.newData._fromNext2) {
        // 🎯 底租抽成取高者：只有租金可編輯
        if (type === 'baseRentHigher') {
          console.log('💡 底租抽成取高者資料，租金可編輯，抽成率來自 Next2');

          // 🎯 檢查是否有人試圖修改抽成率
          if (event.oldData.cag_charge_rate !== event.newData.cag_charge_rate) {
            this.notificationService.warnBubble('抽成率來自抽成設定，無法編輯');
            event.newData.cag_charge_rate = event.oldData.cag_charge_rate; // 還原
          }
        }
        // 🎯 一般抽成：三個欄位唯讀
        else if (type === 'generalCommission') {
          const readonlyFields = ['tlt_id', 'tlt_id_desc', 'cag_taxtype'];
          const changedReadonlyFields = readonlyFields.filter(field =>
            event.oldData[field] !== event.newData[field]
          );

          if (changedReadonlyFields.length > 0) {
            this.notificationService.warnBubble(`欄位 ${changedReadonlyFields.join(', ')} 來自抽成設定，無法編輯`);
            // 還原唯讀欄位的值
            changedReadonlyFields.forEach(field => {
              event.newData[field] = event.oldData[field];
            });
          }
        }
      }

      if (event.newData._status !== 'new') {
        event.newData._status = 'modified';
      }
    }

    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('條件設定已儲存');
  }

  onTableEdit(event: any, type: string): boolean {
    console.log(`${type} 表格編輯:`, event);

    // 🎯 檢查是否為來自 Next2 的唯讀資料
    if (event._fromNext2 && event._readonly) {
      this.notificationService.warnBubble('來自抽成設定的資料不可編輯');
      return false;
    }

    return true;
  }

  onTableCancel(event: any, type: string): void {
    console.log(`${type} 表格取消:`, event);
  }

  // 🎯 批次刪除處理
  onBatchDelete(selectedItems: any[], type: string): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.notificationService.warnBubble('請選擇要刪除的項目');
      return;
    }

    // 🎯 檢查是否包含來自 Next2 的唯讀資料
    const hasReadonlyItems = selectedItems.some(item => item._fromNext2 && item._readonly);
    if (hasReadonlyItems) {
      this.notificationService.warnBubble('無法刪除來自抽成設定的資料');
      return;
    }

    if (confirm(`確定要刪除選取的 ${selectedItems.length} 個項目嗎？`)) {
      selectedItems.forEach(item => {
        if (item._status === 'new') {
          this.removeItemFromArray(item, type);
        } else {
          item._status = 'deleted';
        }
      });

      this.saveConditionDataToWorkflow();
      this.notificationService.successBubble(`已刪除 ${selectedItems.length} 個項目`);
    }
  }

  private removeItemFromArray(item: any, type: string): void {
    switch (type) {
      case 'fixedRent':
        const fixedIndex = this.fixedRentItems.findIndex(x => x.id === item.id);
        if (fixedIndex > -1) this.fixedRentItems.splice(fixedIndex, 1);
        break;
      case 'baseRentHigher':
        const baseRentIndex = this.baseRentHigherItems.findIndex(x => x.id === item.id);
        if (baseRentIndex > -1) this.baseRentHigherItems.splice(baseRentIndex, 1);
        break;
      case 'generalCommission':
        const generalIndex = this.generalCommissionItems.findIndex(x => x.id === item.id);
        if (generalIndex > -1) this.generalCommissionItems.splice(generalIndex, 1);
        break;
      case 'baseCommission':
        const baseCommIndex = this.baseCommissionItems.findIndex(x => x.id === item.id);
        if (baseCommIndex > -1) this.baseCommissionItems.splice(baseCommIndex, 1);
        break;
      case 'graduated':
        const gradIndex = this.graduatedItems.findIndex(x => x.id === item.id);
        if (gradIndex > -1) this.graduatedItems.splice(gradIndex, 1);
        break;
      case 'baseTier':
        const tierIndex = this.baseTierItems.findIndex(x => x.id === item.id);
        if (tierIndex > -1) this.baseTierItems.splice(tierIndex, 1);
        break;
    }
  }

  // 🎯 儲存條件設定到工作流程
  private saveConditionDataToWorkflow(): void {
    const allConditionItems: ConditionItem[] = [
      ...this.fixedRentItems,
      ...this.baseRentHigherItems,
      ...this.generalCommissionItems,
      ...this.baseCommissionItems,
      ...this.graduatedItems,
      ...this.baseTierItems
    ];

    console.log('💾 儲存條件設定資料到工作流程，項目數量:', allConditionItems.length);
    this.contractFlowService.saveStep4Data(allConditionItems);
    console.log('✅ 已儲存條件設定資料到工作流程');
  }

  // 🎯 提交相關方法
  onSubmitNext(): void {
    this.saveConditionDataToWorkflow();
    this.showConfirmDialog = true;
  }

  onConfirmDialogResult(confirmed: boolean): void {
    this.showConfirmDialog = false;
    if (confirmed) {
      this.submitContractData();
    }
  }

  private submitContractData(): void {
    this.loading = true;
    try {
      const submitDataStructure = this.contractFlowService.generateSubmitData();
      console.log('📋 完整提交資料結構:', submitDataStructure);
      this.callSubmitAPI(submitDataStructure);
    } catch (error) {
      console.error('❌ 準備提交資料時發生錯誤:', error);
      this.loading = false;
      this.notificationService.errorBubble('準備提交資料時發生錯誤');
    }
  }

  private callSubmitAPI(submitData: SubmitDataStructure): void {
    setTimeout(() => {
      this.loading = false;
      this.notificationService.successBubble('契約資料提交成功！');
      this.contractFlowService.clearAllData();
      this.router.navigate(['account/tls/tls13010']);
    }, 2000);
  }

  // 🎯 導航方法
  override onCancel(): void {
    this.saveConditionDataToWorkflow();
    this.router.navigate(['account/tls/tls13010next2']);
  }

  onRealCancel(): void {
    if (confirm('確定要離開契約編輯流程嗎？所有暫存資料將會保留。')) {
      this.saveConditionDataToWorkflow();
      this.router.navigate(['account/tls/tls13010']);
    }
  }

  // 🎯 工具方法
  private formatDate(date: any): string {
    if (!date) return '';
    try {
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      return new Date(date).toISOString().split('T')[0];
    } catch {
      return String(date).split('T')[0] || '';
    }
  }

  private getDefaultStartDate(): string {
    return this.contractInfoData[0]?.tlt_bdate || new Date().toISOString().split('T')[0];
  }

  private getDefaultEndDate(): string {
    return this.contractInfoData[0]?.tlt_edate || new Date().toISOString().split('T')[0];
  }

  // 🎯 取得欄位值的輔助方法
  getFieldValue(rowData: any, field: string): string {
    if (!rowData || !field) return '';

    const value = rowData[field];
    if (value === null || value === undefined) return '';

    if (field.includes('date') && value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    return value.toString();
  }

  // 🎯 檢查欄位是否為唯讀
  isFieldReadonly(rowData: any, field: string): boolean {
    if (!rowData._fromNext2) return false;

    // 🎯 來自 Next2 的資料，三個欄位設為唯讀
    const readonlyFields = ['tlt_id', 'tlt_id_desc', 'cag_taxtype'];
    return readonlyFields.includes(field);
  }

  // 🎯 取得欄位樣式
  getFieldClass(rowData: any, field: string): string {
    let classes = '';

    if (rowData._fromNext2) {
      classes += 'from-next2 ';
    }

    if (this.isFieldReadonly(rowData, field)) {
      classes += 'readonly-field ';
    }

    return classes.trim();
  }

  // 🎯 檢查載入狀態的除錯方法
  checkLoadingStatus(): void {
    console.log('🔍 === 檢查載入狀態 ===');

    const commissionType = this.contractInfoData[0]?.tlt_term_type;
    console.log('📋 抽成類型:', commissionType);
    console.log('📋 資料載入狀態:', {
      dataLoaded: this.dataLoaded,
      conditionDataLoaded: this.conditionDataLoaded,
      hasNext2Data: this.hasNext2Data,
      commissionDataFromNext2Count: this.commissionDataFromNext2.length
    });

    console.log('📋 條件設定資料狀態:', {
      fixedRentItemsCount: this.fixedRentItems.length,
      baseRentHigherItemsCount: this.baseRentHigherItems.length,
      generalCommissionItemsCount: this.generalCommissionItems.length,
      baseCommissionItemsCount: this.baseCommissionItems.length,
      graduatedItemsCount: this.graduatedItems.length,
      baseTierItemsCount: this.baseTierItems.length
    });

    console.log('📋 當前應該顯示的資料類型:', this.getCurrentCommissionTypeName());
    console.log('📋 實際條件設定項目數量:', this.getConditionItemCount());
  }

  // 🎯 強制重新整理資料的方法（用於測試）
  forceRefreshData(): void {
    console.log('🔄 強制重新整理資料');
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    if (this.hasNext2Data && this.shouldIntegrateNext2Data(commissionType || '')) {
      this.generateConditionDataFromNext2(commissionType || '');
      this.saveConditionDataToWorkflow();

      const itemCount = this.getConditionItemCount();
      const message = `已重新生成 ${itemCount} 個條件設定項目`;
      console.log('✅', message);
      this.notificationService.infoBubble(message);

      this.cdr.detectChanges();
    } else {
      this.notificationService.warnBubble('沒有 Next2 資料或此抽成類型不需要整合');
    }
  }

}
