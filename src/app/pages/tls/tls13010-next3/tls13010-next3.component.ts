// tls13010-next3.component.ts - 完整修正版 (新增資料標記和新增功能)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ContractFlowService, WorkflowStep } from '../tls13010/services/contract-flow.service';
import { TLS13010Service } from '../../../service/API/tls/tls13010.service';
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
  CommissionResponseData,
  CommissionDataStructure,
  ChargedDetail,
  LevelDetail,
  RentDetail,
  LimitDetail,
  GeneralCommissionCondition,
  ConditionItem
} from '../tls13010/tls13010.model';

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

  // 🎯 修正：使用更明確的資料結構
  fixedRentItems: FixedRentCondition[] = [];
  baseRentHigherItems: BaseRentHigherCondition[] = [];
  generalCommissionItems: GeneralCommissionCondition[] = [];
  baseCommissionItems: BaseCommissionCondition[] = [];
  graduatedItems: GraduatedCommissionCondition[] = [];
  baseTierItems: BaseTierCondition[] = [];

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
      field: 'tlt_term_type',
      header: '抽成別',
      type: 'dropdown',
      editable: false,
      options: TLS13010_DROPDOWN_OPTIONS.tltTermType,
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

  // 🎯 修正：各類型的欄位定義對應資料表欄位
  // 固定租金欄位 (TLTTALENT_RENT)
  fixedRentColumns: ColumnDef[] = [
    { field: 'tlt_id', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'base_rent', header: '租金金額', type: 'number', editable: true, autoWidth: true }
  ];

  // 底租抽成取高者欄位 (TLTTALENT_RENT + TLTTALENT_CHARGED)
  baseRentHigherColumns: ColumnDef[] = [
    { field: 'tlt_id', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'base_rent', header: '租金金額', type: 'number', editable: true, autoWidth: true },
    { field: 'cag_charge_rate', header: '抽成率(%)', type: 'number', editable: true, autoWidth: true }
  ];

  generalCommissionColumns: ColumnDef[] = [
    {
      field: 'tlt_id',
      header: '抽成類別',
      type: 'text',
      editable: true,
      autoWidth: true
    },
    {
      field: 'tlt_id_desc',
      header: '抽成類別名稱',
      type: 'text',
      editable: true,
      autoWidth: true
    },
    {
      field: 'cag_taxtype',
      header: '稅別',
      type: 'dropdown',
      editable: true,
      autoWidth: true,
      options: [
        { label: '應稅', value: '1' },
        { label: '免稅', value: '2' },
        { label: '零稅率', value: '3' }
      ]
    },
    {
      field: 'cag_bdate',
      header: '帳務起',
      type: 'date',
      editable: true,
      autoWidth: true
    },
    {
      field: 'cag_edate',
      header: '帳務迄',
      type: 'date',
      editable: true,
      autoWidth: true
    },
    {
      field: 'cag_barcode',
      header: '折扣別',
      type: 'text',
      editable: true,
      autoWidth: true
    },
    {
      field: 'cag_charge_rate',
      header: '抽成率(%)',
      type: 'number',
      editable: true,
      autoWidth: true
    }
  ];

  // 包底抽成欄位 (TLTTALENT_LIMIT)
  baseCommissionColumns: ColumnDef[] = [
    { field: 'tlt_id', header: '帳務期別', type: 'text', editable: true, autoWidth: true },
    { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'limit_amt', header: '包底金額', type: 'number', editable: true, autoWidth: true },
    { field: 'limit_charge_rate', header: '抽成率(%)', type: 'number', editable: true, autoWidth: true }
  ];

  // 階梯式抽成欄位 (TLTTALENT_LEVEL + TLTTALENT_LEVELD)
  graduatedColumns: ColumnDef[] = [
    { field: 'seq_no', header: '序號', type: 'number', editable: true, autoWidth: true },
    { field: 'cag_bdate', header: '帳務起', type: 'date', editable: true, autoWidth: true },
    { field: 'cag_edate', header: '帳務迄', type: 'date', editable: true, autoWidth: true },
    { field: 'start_number', header: '階梯金額(起值)', type: 'number', editable: true, autoWidth: true },
    { field: 'end_number', header: '階梯金額(迄值)', type: 'number', editable: true, autoWidth: true },
    { field: 'charge_rate', header: '抽成率(%)', type: 'number', editable: true, autoWidth: true }
  ];

  // 包底加階梯欄位 (TLTTALENT_LIMIT + TLTTALENT_LEVEL + TLTTALENT_LEVELD)
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
        tlt_contract_edate: step1Data?.tlt_contract_edate || this.currentContractData.tlt_contract_edate || '',
        tlt_term_type: (step1Data?.tlt_term_type || this.currentContractData.tlt_term_type || '').toString().trim() || '-',
      };

      this.contractInfoData = [{
        id: '1',
        ...contractInfo
      }];

      console.log('📊 準備顯示的合約資訊:', this.contractInfoData);
      console.log('🏷️ 抽成別:', contractInfo.tlt_term_type);

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

      if (Array.isArray(savedData)) {
        // 🎯 直接分類到各個陣列
        this.categorizeConditionItems(savedData);
      } else {
        // 向下相容：如果是舊格式物件
        this.fixedRentItems = savedData.fixedRentItems || [];
        this.baseRentHigherItems = savedData.baseRentHigherItems || [];
        this.generalCommissionItems = savedData.generalCommissionItems || [];
        this.baseCommissionItems = savedData.baseCommissionItems || [];
        this.graduatedItems = savedData.graduatedItems || [];
        this.baseTierItems = savedData.baseTierItems || [];
      }

      console.log('✅ 暫存條件資料載入完成');
    } catch (error) {
      console.error('❌ 暫存條件資料載入失敗:', error);
      this.initializeEmptyConditionData();
    }
  }

  private categorizeConditionItems(conditionItems: ConditionItem[]): void {
    console.log('🏷️ 分類條件項目:', conditionItems);

    this.initializeEmptyConditionData();

    conditionItems.forEach(item => {
      if ('base_rent' in item && 'cag_charge_rate' in item) {
        // 底租抽成取高者
        this.baseRentHigherItems.push(item as BaseRentHigherCondition);
      } else if ('base_rent' in item) {
        // 固定租金
        this.fixedRentItems.push(item as FixedRentCondition);
      } else if ('tlt_id_desc' in item && 'cag_barcode' in item) {
        // 一般抽成
        this.generalCommissionItems.push(item as GeneralCommissionCondition);
      } else if ('limit_amt' in item && 'seq_no' in item) {
        // 包底加階梯
        this.baseTierItems.push(item as BaseTierCondition);
      } else if ('limit_amt' in item) {
        // 包底抽成
        this.baseCommissionItems.push(item as BaseCommissionCondition);
      } else if ('seq_no' in item) {
        // 階梯式抽成
        this.graduatedItems.push(item as GraduatedCommissionCondition);
      }
    });

    console.log('📊 分類結果:');
    console.log('   - 固定租金:', this.fixedRentItems.length);
    console.log('   - 底租抽成取高者:', this.baseRentHigherItems.length);
    console.log('   - 一般抽成:', this.generalCommissionItems.length);
    console.log('   - 包底抽成:', this.baseCommissionItems.length);
    console.log('   - 階梯式抽成:', this.graduatedItems.length);
    console.log('   - 包底加階梯:', this.baseTierItems.length);
  }
  // 🎯 初始化空的條件資料
  private initializeEmptyConditionData(): void {
    console.log('📝 初始化空的條件設定資料');

    this.fixedRentItems = [];
    this.baseRentHigherItems = [];
    this.baseCommissionItems = [];
    this.graduatedItems = [];
    this.baseTierItems = [];
    this.generalCommissionItems = [];
  }

  // 🎯 儲存條件設定到工作流程
  private saveConditionDataToWorkflow(): void {
    console.log('💾 儲存條件設定資料到工作流程');

    const allConditionItems: ConditionItem[] = [
      ...this.fixedRentItems,
      ...this.baseRentHigherItems,
      ...this.generalCommissionItems,
      ...this.baseCommissionItems,
      ...this.graduatedItems,
      ...this.baseTierItems
    ];

    try {
      this.contractFlowService.saveStep4Data(allConditionItems);
      console.log('✅ 已成功暫存條件設定資料到工作流程');
    } catch (error) {
      console.error('❌ 儲存條件設定資料時發生錯誤:', error);
    }
  }

  // 🎯 判斷是否顯示特定抽成類型的條件設定
  shouldShowCommissionType(commissionTypeCode: string): boolean {
    const currentCommissionType = this.contractInfoData[0]?.tlt_term_type;
    // console.log('🔍 檢查抽成類型:', { current: currentCommissionType, target: commissionTypeCode });
    return currentCommissionType === commissionTypeCode;
  }

  get existingCommissionTypes(): string[] {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;
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
      // 🎯 使用新的資料結構生成方法
      const submitDataStructure = this.contractFlowService.generateSubmitData();

      // 🎯 詳細的 console 輸出，讓你知道要打什麼 API
      console.log('='.repeat(80));
      console.log('📋 完整提交資料結構:');
      console.log('='.repeat(80));

      // Step 1 資料
      console.log('📝 Step 1 - 合約基本資料:');
      console.log(`   操作類型: ${submitDataStructure.step1.operation}`);
      console.log('   資料內容:', submitDataStructure.step1.data);
      console.log('');

      // Step 2 資料
      console.log('💰 Step 2 - 代扣款設定:');
      console.log('   摘要:', submitDataStructure.step2.summary);
      if (submitDataStructure.step2.operations.toInsert.length > 0) {
        console.log('   🟢 要新增的項目 (' + submitDataStructure.step2.operations.toInsert.length + ' 筆):');
        submitDataStructure.step2.operations.toInsert.forEach((item, index) => {
          console.log(`      ${index + 1}.`, item);
        });
      }
      if (submitDataStructure.step2.operations.toUpdate.length > 0) {
        console.log('   🟡 要修改的項目 (' + submitDataStructure.step2.operations.toUpdate.length + ' 筆):');
        submitDataStructure.step2.operations.toUpdate.forEach((item, index) => {
          console.log(`      ${index + 1}.`, item);
        });
      }
      if (submitDataStructure.step2.operations.toDelete.length > 0) {
        console.log('   🔴 要刪除的項目 (' + submitDataStructure.step2.operations.toDelete.length + ' 筆):');
        submitDataStructure.step2.operations.toDelete.forEach((item, index) => {
          console.log(`      ${index + 1}.`, item);
        });
      }
      console.log('');

      // Step 3 資料
      console.log('📊 Step 3 - 抽成設定:');
      console.log('   摘要:', submitDataStructure.step3.summary);
      if (submitDataStructure.step3.operations.toInsert.length > 0) {
        console.log('   🟢 要新增的項目 (' + submitDataStructure.step3.operations.toInsert.length + ' 筆):');
        submitDataStructure.step3.operations.toInsert.forEach((item, index) => {
          console.log(`      ${index + 1}.`, item);
        });
      }
      if (submitDataStructure.step3.operations.toUpdate.length > 0) {
        console.log('   🟡 要修改的項目 (' + submitDataStructure.step3.operations.toUpdate.length + ' 筆):');
        submitDataStructure.step3.operations.toUpdate.forEach((item, index) => {
          console.log(`      ${index + 1}.`, item);
        });
      }
      if (submitDataStructure.step3.operations.toDelete.length > 0) {
        console.log('   🔴 要刪除的項目 (' + submitDataStructure.step3.operations.toDelete.length + ' 筆):');
        submitDataStructure.step3.operations.toDelete.forEach((item, index) => {
          console.log(`      ${index + 1}.`, item);
        });
      }
      console.log('');

      // Step 4 資料
      console.log('⚙️ Step 4 - 條件設定:');
      console.log('   摘要:', submitDataStructure.step4.summary);
      if (submitDataStructure.step4.operations.toInsert.length > 0) {
        console.log('   🟢 要新增的項目 (' + submitDataStructure.step4.operations.toInsert.length + ' 筆):');
        submitDataStructure.step4.operations.toInsert.forEach((item, index) => {
          console.log(`      ${index + 1}.`, item);
        });
      }
      if (submitDataStructure.step4.operations.toUpdate.length > 0) {
        console.log('   🟡 要修改的項目 (' + submitDataStructure.step4.operations.toUpdate.length + ' 筆):');
        submitDataStructure.step4.operations.toUpdate.forEach((item, index) => {
          console.log(`      ${index + 1}.`, item);
        });
      }
      if (submitDataStructure.step4.operations.toDelete.length > 0) {
        console.log('   🔴 要刪除的項目 (' + submitDataStructure.step4.operations.toDelete.length + ' 筆):');
        submitDataStructure.step4.operations.toDelete.forEach((item, index) => {
          console.log(`      ${index + 1}.`, item);
        });
      }
      console.log('');

      // 總覽
      console.log('📈 操作總覽:');
      console.log(`   總操作數: ${submitDataStructure.metadata.totalOperations}`);
      console.log(`   合約ID: ${submitDataStructure.metadata.contractId}`);
      console.log(`   提交時間: ${submitDataStructure.metadata.submittedAt}`);
      console.log('='.repeat(80));

      // 🎯 建議的 API 呼叫結構
      console.log('🔧 建議的 API 呼叫:');
      console.log('POST /api/contracts/submit-complete');
      console.log('Request Body:');
      console.log(JSON.stringify(submitDataStructure, null, 2));
      console.log('='.repeat(80));

      // 🎯 實際 API 呼叫 (目前模擬)
      this.callSubmitAPI(submitDataStructure);

    } catch (error) {
      console.error('❌ 準備提交資料時發生錯誤:', error);
      this.loading = false;
      this.notificationService.errorBubble('準備提交資料時發生錯誤');
    }
  }

  private callSubmitAPI(submitData: SubmitDataStructure): void {
    console.log('📡 準備呼叫後端 API...');

    // 🎯 暫時模擬 API 呼叫，你可以在這裡看到完整的提交資料
    console.log('📤 實際要送給後端的完整 JSON:');
    console.log(JSON.stringify(submitData, null, 2));

    setTimeout(() => {
      this.loading = false;
      this.notificationService.successBubble('契約資料提交成功！');
      this.contractFlowService.clearAllData();
      this.router.navigate(['/TLS/TLS13010']);
    }, 2000);

    // 🎯 實際 API 呼叫應該像這樣（先註解掉）:
    /*
    this.tls13010Service.submitCompleteContract(submitData).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.successBubble('契約資料提交成功！');
        this.contractFlowService.clearAllData();
        this.router.navigate(['/TLS/TLS13010']);
      },
      error: (error) => {
        console.error('❌ 提交失敗:', error);
        this.loading = false;
        this.notificationService.errorBubble('契約資料提交失敗，請稍後再試');
      }
    });
    */
  }

  // 🔧 修正：使用父類的 onCancel，但自定義行為
  override onCancel(): void {
    console.log('🔙 準備回到前一步...');
    this.saveConditionDataToWorkflow();
    this.router.navigate(['/TLS/TLS13010NEXT2']);
    // this.notificationService.infoBubble('已返回抽成設定頁面');
  }

  onRealCancel(): void {
    if (confirm('確定要離開契約編輯流程嗎？所有暫存資料將會保留。')) {
      this.saveConditionDataToWorkflow();
      this.router.navigate(['/TLS/TLS13010']);
      // this.notificationService.infoBubble('已離開契約編輯流程');
    }
  }

  // 🎯 新增：各類型條件項目的新增功能

  // 新增固定租金項目
  onAddFixedRentItem(): void {
    console.log('➕ 新增固定租金項目');
    const newItem: FixedRentCondition = this.createFixedRentItem();
    this.fixedRentItems.push(newItem);
    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('已新增固定租金項目');
  }

  // 新增底租抽成取高者項目
  onAddBaseRentHigherItem(): void {
    console.log('➕ 新增底租抽成取高者項目');
    const newItem: BaseRentHigherCondition = this.createBaseRentHigherItem();
    this.baseRentHigherItems.push(newItem);
    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('已新增底租抽成取高者項目');
  }

  // 新增包底抽成項目
  onAddBaseCommissionItem(): void {
    console.log('➕ 新增包底抽成項目');
    const newItem: BaseCommissionCondition = this.createBaseCommissionItem();
    this.baseCommissionItems.push(newItem);
    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('已新增包底抽成項目');
  }

  // 新增階梯式抽成項目
  onAddGraduatedItem(): void {
    console.log('➕ 新增階梯式抽成項目');
    const newItem: GraduatedCommissionCondition = this.createGraduatedItem();
    this.graduatedItems.push(newItem);
    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('已新增階梯式抽成項目');
  }

  // 新增包底加階梯項目
  onAddBaseTierItem(): void {
    console.log('➕ 新增包底加階梯項目');
    const newItem: BaseTierCondition = this.createBaseTierItem();
    this.baseTierItems.push(newItem);
    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('已新增包底加階梯項目');
  }

  // 🎯 新增：一般抽成新增項目方法
  onAddGeneralCommissionItem(): void {
    console.log('➕ 新增一般抽成項目');
    const newItem: GeneralCommissionCondition = this.createGeneralCommissionItem();
    this.generalCommissionItems.push(newItem);
    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('已新增一般抽成項目');
  }

  private createFixedRentItem(): FixedRentCondition {
    return {
      id: Date.now() + Math.random(), // 臨時 ID
      talent_id: this.currentTalentId,
      tlt_id: '', // 帳務期別
      cag_bdate: this.contractInfoData[0]?.tlt_bdate || new Date().toISOString().split('T')[0],
      cag_edate: this.contractInfoData[0]?.tlt_edate || new Date().toISOString().split('T')[0],
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
      cag_bdate: this.contractInfoData[0]?.tlt_bdate || new Date().toISOString().split('T')[0],
      cag_edate: this.contractInfoData[0]?.tlt_edate || new Date().toISOString().split('T')[0],
      base_rent: 0,
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
      cag_bdate: this.contractInfoData[0]?.tlt_bdate || new Date().toISOString().split('T')[0],
      cag_edate: this.contractInfoData[0]?.tlt_edate || new Date().toISOString().split('T')[0],
      limit_amt: 0,
      limit_charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  private createGraduatedItem(): GraduatedCommissionCondition {
    const nextSeqNo = this.graduatedItems.length + 1;
    return {
      id: Date.now() + Math.random(),
      talent_id: this.currentTalentId,
      seq_no: nextSeqNo,
      cag_bdate: this.contractInfoData[0]?.tlt_bdate || new Date().toISOString().split('T')[0],
      cag_edate: this.contractInfoData[0]?.tlt_edate || new Date().toISOString().split('T')[0],
      start_number: 0,
      end_number: 0,
      charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  private createBaseTierItem(): BaseTierCondition {
    const nextSeqNo = this.baseTierItems.length + 1;
    return {
      id: Date.now() + Math.random(),
      talent_id: this.currentTalentId,
      seq_no: nextSeqNo,
      tlt_id: '',
      cag_bdate: this.contractInfoData[0]?.tlt_bdate || new Date().toISOString().split('T')[0],
      cag_edate: this.contractInfoData[0]?.tlt_edate || new Date().toISOString().split('T')[0],
      limit_amt: 0,
      start_number: 0,
      end_number: 0,
      charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  private createGeneralCommissionItem(): GeneralCommissionCondition {
    return {
      id: Date.now() + Math.random(),
      talent_id: this.currentTalentId,
      tlt_id: '0', // 預設抽成類別
      tlt_id_desc: '',
      cag_taxtype: '1', // 預設稅別
      cag_bdate: this.contractInfoData[0]?.tlt_bdate || new Date().toISOString().split('T')[0],
      cag_edate: this.contractInfoData[0]?.tlt_edate || new Date().toISOString().split('T')[0],
      cag_barcode: '000', // 預設折數
      cag_charge_rate: 0,
      _status: 'new',
      _isNew: true
    };
  }

  // 🎯 表格事件處理
  onTableSave(event: any, type: string): void {
    console.log(`${type} 表格儲存:`, event);

    // 🎯 修正：標記為已修改
    if (event.newData && event.newData._status !== 'new') {
      event.newData._status = 'modified';
    }

    this.saveConditionDataToWorkflow();
    this.notificationService.successBubble('條件設定已儲存');
  }

  onTableEdit(event: any, type: string): void {
    console.log(`${type} 表格編輯:`, event);
  }

  onTableCancel(event: any, type: string): void {
    console.log(`${type} 表格取消:`, event);
  }

  // 🎯 新增：批次刪除處理
  // 修改這個方法
  onBatchDelete(selectedItems: any[], type: string): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.notificationService.warnBubble('請選擇要刪除的項目');
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
        if (fixedIndex > -1) {
          this.fixedRentItems.splice(fixedIndex, 1);
        }
        break;
      case 'baseRentHigher':
        const baseRentIndex = this.baseRentHigherItems.findIndex(x => x.id === item.id);
        if (baseRentIndex > -1) {
          this.baseRentHigherItems.splice(baseRentIndex, 1);
        }
        break;
      case 'generalCommission': // 🎯 新增
        const generalIndex = this.generalCommissionItems.findIndex(x => x.id === item.id);
        if (generalIndex > -1) {
          this.generalCommissionItems.splice(generalIndex, 1);
        }
        break;
      case 'baseCommission':
        const baseCommIndex = this.baseCommissionItems.findIndex(x => x.id === item.id);
        if (baseCommIndex > -1) {
          this.baseCommissionItems.splice(baseCommIndex, 1);
        }
        break;
      case 'graduated':
        const gradIndex = this.graduatedItems.findIndex(x => x.id === item.id);
        if (gradIndex > -1) {
          this.graduatedItems.splice(gradIndex, 1);
        }
        break;
      case 'baseTier':
        const tierIndex = this.baseTierItems.findIndex(x => x.id === item.id);
        if (tierIndex > -1) {
          this.baseTierItems.splice(tierIndex, 1);
        }
        break;
    }
  }

  // 🎯 載入後端抽成設定資料的方法
  private loadCommissionDataFromBackend(): void {
    if (!this.currentTalentId) {
      console.warn('❌ 沒有 talent_id，無法載入後端資料');
      this.initializeEmptyConditionData();
      return;
    }

    const commissionType = this.contractInfoData[0]?.tlt_term_type;

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
          // this.notificationService.warnBubble('載入現有抽成設定失敗，可新增條件設定');
        }
      });

    this.subscriptions.push(subscription);
  }

  // 🎯 修正：處理後端回應資料
  private processBackendCommissionData(data: CommissionResponseData): void {
    try {
      console.log('🔄 處理後端抽成設定資料:', data);

      // 🎯 檢查是否有錯誤
      if (data.HasError) {
        console.error('❌ 後端回傳錯誤:', data.ErrorMessage);
        this.initializeConditionDataByCommissionType(data.CurrentTltTermType);
        this.notificationService.errorBubble(data.ErrorMessage || '載入抽成設定資料時發生錯誤');
        return;
      }

      // 🔧 修復：清理空格後再比較
      const originalType = (data.OriginalTltTermType || '').toString().trim();
      const currentType = (data.CurrentTltTermType || '').toString().trim();

      console.log('🔍 清理後的抽成別比較:', {
        原始_原值: data.OriginalTltTermType,
        原始_清理後: originalType,
        目前_原值: data.CurrentTltTermType,
        目前_清理後: currentType,
        後端判斷: data.IsTermTypeChanged,
        實際是否不同: originalType !== currentType
      });

      if (data.IsTermTypeChanged && originalType !== currentType) {
        console.log('⚠️ 抽成別確實有改變，需要處理資料變更');
        this.notificationService.warnBubble(
          `抽成別已從 ${originalType} 變更為 ${currentType}，舊資料將被清除`
        );
        this.handleCommissionTypeChange(data);
      } else {
        console.log('ℹ️ 抽成別未改變，載入現有資料');
        this.loadExistingCommissionData(data);
      }

      this.saveConditionDataToWorkflow();

    } catch (error) {
      console.error('❌ 處理後端抽成設定資料時發生錯誤:', error);
      this.notificationService.errorBubble('處理抽成設定資料時發生錯誤');
    }
  }

  // 🎯 處理抽成別改變
  private handleCommissionTypeChange(data: CommissionResponseData): void {
    console.log('🔄 處理抽成別改變:', data);

    // 🎯 顯示詳細的警告訊息
    if (data.Warning) {
      this.notificationService.warnBubble(data.Warning.Message);

      // 如果有要刪除的項目，可以詳細列出
      if (data.Warning.ItemsToBeDeleted && data.Warning.ItemsToBeDeleted.length > 0) {
        console.log('🗑️ 將被刪除的項目:', data.Warning.ItemsToBeDeleted);
      }
    }

    // 🎯 標記要刪除的舊資料（供後續提交時使用）
    if (data.DataToDelete) {
      console.log('🗑️ 記錄要刪除的舊資料:', data.DataToDelete);
      // 可以將 DataToDelete 存到 contractFlowService 中，供最終提交時使用
      this.contractFlowService.setDataToDelete(data.DataToDelete);
    }

    // 🎯 根據新的抽成別初始化空資料
    if (data.NewDataStructure?.TermType) {
      console.log('📝 初始化新的資料結構:', data.NewDataStructure.TermType);
      this.initializeConditionDataByCommissionType(data.NewDataStructure.TermType);
    } else {
      // 備援方案
      this.initializeConditionDataByCommissionType(data.CurrentTltTermType);
    }
  }

  // 🎯 載入現有抽成資料
  private loadExistingCommissionData(data: CommissionResponseData): void {
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
        this.fixedRentItems = [this.createFixedRentItem()];
        console.log('✅ 初始化固定租金空項目');
        break;
      case '2': // 底租抽成取高者
        this.baseRentHigherItems = [this.createBaseRentHigherItem()];
        console.log('✅ 初始化底租抽成取高者空項目');
        break;
      case '3': // 一般抽成
        console.log('ℹ️ 一般抽成無需額外條件設定');
        break;
      case '4': // 包底抽成
        this.baseCommissionItems = [this.createBaseCommissionItem()];
        console.log('✅ 初始化包底抽成空項目');
        break;
      case '5': // 階梯式抽成
        this.graduatedItems = [this.createGraduatedItem()];
        console.log('✅ 初始化階梯式抽成空項目');
        break;
      case '6': // 包底加階梯
        this.baseTierItems = [this.createBaseTierItem()];
        console.log('✅ 初始化包底加階梯空項目');
        break;
      default:
        console.warn('❌ 不支援的抽成類型:', commissionType);
    }
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

  // 🎯 對應固定租金資料 (TLTTALENT_RENT)
  private mapRentData(data: CommissionDataStructure): void {
    if (data.RentDetails && data.RentDetails.length > 0) {
      this.fixedRentItems = data.RentDetails.map((item: { id: any; talent_id: { toString: () => any; }; tlt_id: any; cag_bdate: any; cag_edate: any; base_rent: any; }): FixedRentCondition => ({
        id: item.id,
        talent_id: item.talent_id.toString(),
        tlt_id: item.tlt_id || '',
        cag_bdate: item.cag_bdate || '',
        cag_edate: item.cag_edate || '',
        base_rent: item.base_rent || 0,
        _status: 'original'
      }));
      console.log('✅ 載入固定租金資料:', this.fixedRentItems.length, '筆');
    } else {
      this.initializeConditionDataByCommissionType('1');
    }
  }

  // 🎯 對應底租抽成取高者資料 (TLTTALENT_RENT + TLTTALENT_CHARGED)
  private mapBaseRentHigherData(data: CommissionDataStructure): void {
    if (data.RentDetails && data.ChargedDetails) {
      // 結合租金和抽成資料
      this.baseRentHigherItems = data.RentDetails.map((rentItem: RentDetail, index: number): BaseRentHigherCondition => {
        const chargedItem = data.ChargedDetails?.[index] || {} as ChargedDetail;
        return {
          id: rentItem.id,
          talent_id: rentItem.talent_id.toString(),
          tlt_id: rentItem.tlt_id || chargedItem.tlt_id || '',
          cag_bdate: rentItem.cag_bdate || chargedItem.tlt_bdate || '',
          cag_edate: rentItem.cag_edate || chargedItem.tlt_edate || '',
          base_rent: rentItem.base_rent || 0,
          cag_charge_rate: chargedItem.cag_charge_rate || 0,
          _status: 'original'
        };
      });
      console.log('✅ 載入底租抽成取高者資料:', this.baseRentHigherItems.length, '筆');
    } else {
      this.initializeConditionDataByCommissionType('2');
    }
  }

  // 🎯 一般抽成
  private mapGeneralCommissionData(data: CommissionDataStructure): void {
    console.log('🔄 載入一般抽成資料:', data);

    // 🎯 一般抽成需要載入現有的抽成設定資料，而不是初始化空資料
    if (data.CommissionMasters && data.ChargedDetails) {
      console.log('📋 發現一般抽成設定資料:');
      console.log('   - CommissionMasters:', data.CommissionMasters.length, '筆');
      console.log('   - ChargedDetails:', data.ChargedDetails.length, '筆');

      // 🎯 將一般抽成資料轉換為 GeneralCommissionCondition 格式
      const generalCommissionItems: GeneralCommissionCondition[] = [];

      // 結合 CommissionMasters 和 ChargedDetails
      data.CommissionMasters.forEach(master => {
        // 找到對應的 ChargedDetails
        const relatedChargedDetails = data.ChargedDetails?.filter(
          charged => charged.tlt_id === master.tlt_id && charged.talent_id === master.talent_id
        ) || [];

        if (relatedChargedDetails.length > 0) {
          // 每個 ChargedDetail 建立一個條件項目
          relatedChargedDetails.forEach(charged => {
            generalCommissionItems.push({
              id: master.id, // 組合 ID
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
        } else {
          // 如果沒有對應的 ChargedDetail，建立基本項目
          generalCommissionItems.push({
            id: master.id,
            talent_id: master.talent_id.toString(),
            tlt_id: master.tlt_id,
            tlt_id_desc: master.tlt_id_desc,
            cag_taxtype: master.cag_taxtype,
            cag_bdate: master.cag_bdate?.split('T')[0] || '',
            cag_edate: master.cag_edate?.split('T')[0] || '',
            cag_barcode: '',
            cag_charge_rate: 0,
            _status: 'original'
          });
        }
      });

      // 🎯 儲存到對應的陣列（您可能需要新增這個陣列）
      this.generalCommissionItems = generalCommissionItems;

      console.log('✅ 載入一般抽成資料:', this.generalCommissionItems.length, '筆');
      console.log('📊 一般抽成項目詳細:', this.generalCommissionItems);

    } else {
      console.log('📭 沒有一般抽成資料，初始化空資料供新增');
      this.generalCommissionItems = [this.createGeneralCommissionItem()];
    }
  }

  private mapBaseCommissionData(data: CommissionDataStructure): void {
    console.log('🔄 載入包底抽成資料:', data);

    if (data.LimitDetails && data.LimitDetails.length > 0) {
      this.baseCommissionItems = data.LimitDetails.map((item: LimitDetail): BaseCommissionCondition => ({
        id: item.id,
        talent_id: item.talent_id.toString(),
        tlt_id: item.tlt_id || '',
        cag_bdate: item.cag_bdate?.split('T')[0] || '', // 🎯 處理日期格式
        cag_edate: item.cag_edate?.split('T')[0] || '',
        limit_amt: item.limit_amt || 0,
        limit_charge_rate: item.limit_charge_rate || 0,
        _status: 'original'
      }));
      console.log('✅ 載入包底抽成資料:', this.baseCommissionItems.length, '筆');
      console.log('📊 包底抽成項目詳細:', this.baseCommissionItems);
    } else {
      console.log('📭 沒有包底抽成資料，初始化空資料供新增');
      this.initializeConditionDataByCommissionType('4');
    }
  }

  // 🎯 對應階梯式抽成資料 (TLTTALENT_LEVEL + TLTTALENT_LEVELD)
  private mapGraduatedCommissionData(data: CommissionDataStructure): void {
    if (data.LevelDetails && data.LevelDetails.length > 0) {
      this.graduatedItems = data.LevelDetails.map((item: LevelDetail): GraduatedCommissionCondition => ({
        id: item.id,
        talent_id: item.talent_id.toString(),
        seq_no: item.seq_no || 0,
        cag_bdate: item.cag_bdate || '',
        cag_edate: item.cag_edate || '',
        start_number: item.start_number || 0,
        end_number: item.end_number || 0,
        charge_rate: item.charge_rate || 0,
        _status: 'original'
      }));
      console.log('✅ 載入階梯式抽成資料:', this.graduatedItems.length, '筆');
    } else {
      this.initializeConditionDataByCommissionType('5');
    }
  }

  // 🎯 修正：對應包底加階梯資料
  private mapBaseTierData(data: CommissionDataStructure): void {
    if (data.LimitDetails && data.LevelDetails) {
      // 結合包底和階梯資料
      this.baseTierItems = data.LevelDetails.map((levelItem: LevelDetail): BaseTierCondition => ({
        id: levelItem.id,
        talent_id: levelItem.talent_id.toString(),
        seq_no: levelItem.seq_no || 0,
        tlt_id: '', // 從 LimitDetails 取得
        cag_bdate: levelItem.cag_bdate || '',
        cag_edate: levelItem.cag_edate || '',
        limit_amt: levelItem.limit_amt || data.LimitDetails?.[0]?.limit_amt || 0,
        start_number: levelItem.start_number || 0,
        end_number: levelItem.end_number || 0,
        charge_rate: levelItem.charge_rate || 0,
        _status: 'original'
      }));
      console.log('✅ 載入包底加階梯資料:', this.baseTierItems.length, '筆');
    } else {
      this.initializeConditionDataByCommissionType('6');
    }
  }
  private getCommissionTypeName(code: string): string {
    const option = TLS13010_DROPDOWN_OPTIONS.tltTermType.find(opt => opt.value === code);
    return option ? option.label : `代碼 ${code}`;
  }

  getCurrentCommissionTypeName(): string {
    const code = this.contractInfoData[0]?.tlt_term_type;
    const option = TLS13010_DROPDOWN_OPTIONS.tltTermType.find(opt => opt.value === code);
    return option ? option.label : code || '未載入';
  }

  // 🎯 新增：檢查是否有條件資料
  hasConditionData(): boolean {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    switch (commissionType) {
      case '1': // 固定租金
        return this.fixedRentItems.length > 0;
      case '2': // 底租抽成取高者
        return this.baseRentHigherItems.length > 0;
      case '3': // 一般抽成
        return this.generalCommissionItems && this.generalCommissionItems.length > 0; // 🎯 修正
      case '4': // 包底抽成
        return this.baseCommissionItems.length > 0;
      case '5': // 階梯式抽成
        return this.graduatedItems.length > 0;
      case '6': // 包底加階梯
        return this.baseTierItems.length > 0;
      default:
        return false;
    }
  }

  // 🎯 新增：取得當前條件項目數量
  getConditionItemCount(): number {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    switch (commissionType) {
      case '1':
        return this.fixedRentItems.filter(item => item._status !== 'deleted').length;
      case '2':
        return this.baseRentHigherItems.filter(item => item._status !== 'deleted').length;
      case '3':
        return this.generalCommissionItems ? this.generalCommissionItems.filter(item => item._status !== 'deleted').length : 0; // 🎯 修正
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


  // 🎯 顯示詳細的用戶訊息
  private showCommissionTypeChangeMessage(data: CommissionResponseData): void {
    const originalTypeName = this.getCommissionTypeName(data.OriginalTltTermType);
    const currentTypeName = this.getCommissionTypeName(data.CurrentTltTermType);

    const message = `
    抽成別已從「${originalTypeName}」變更為「${currentTypeName}」
    ${data.Warning?.ItemsToBeDeleted ?
        `\n將清除：${data.Warning.ItemsToBeDeleted.join('、')}` : ''
      }
    \n請重新設定條件參數
  `;

    this.notificationService.warnBubble(message);
  }

  private formatDate(date: any): string {
    if (!date) return '';
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch {
      return String(date).split('T')[0] || '';
    }
  }
}
