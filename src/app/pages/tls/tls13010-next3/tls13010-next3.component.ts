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
  ContractInfo,
  FixedRentCondition,
  BaseRentHigherCondition,
  BaseCommissionCondition,
  GraduatedCommissionCondition,
  BaseTierCondition,
  GeneralCommissionCondition,
  ConditionItem,
  WorkflowStep,
  RentSettingApiData,
  CleanSubmitData,
} from '../tls13010/tls13010.model';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';

@Component({
  selector: 'app-tls13010-next3',
  templateUrl: './tls13010-next3.component.html',
  styleUrls: ['./tls13010-next3.component.scss']
})
export class Tls13010Next3Component extends BasicCruPageComponent<ConditionItem> implements OnInit, OnDestroy {

  private discountOptions: any[] = [];
  private subscriptions: Subscription[] = [];
  dataForm: FormGroup;
  showConfirmDialog = false;
  dataLoaded = false;
  conditionDataLoaded = false;

  // 當前合約資料
  currentTalentId: string = '';
  currentContractData: any = null;
  contractInfoData: ContractInfo[] = [];

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
    { field: 'cag_barcode', header: '折扣別', type: 'dropdown', editable: true, autoWidth: true, options: [] },
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
    private cdr: ChangeDetectorRef,
    private paperTypeService: LocationOptionsService
  ) {
    super();
    this.dataForm = this.formBuilder.group({});
  }

  ngOnInit(): void {
    console.log('🚀 TLS13010Next3Component 初始化開始');
    this.initializePage('TLS13010', this.dataForm);

    this.loadDiscountOptions().then(() => {
      this.loadWorkflowData();
    });
  }

  ngOnDestroy(): void {
    console.log('🔄 Next3 組件銷毀前暫存資料');

    // 🎯 ⭐ 重要：組件銷毀前暫存
    this.saveConditionDataToWorkflow();

    // 清理訂閱
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadWorkflowData(): void {
    console.log('🚀 Next3 開始載入工作流程資料...');

    const workflowData = this.contractFlowService.getCurrentData();
    console.log('📋 工作流程資料:', workflowData);

    // 🎯 統一使用 ContractFlowService 的模式判定
    if (workflowData.contractId || this.contractFlowService.isNewContractMode()) {
      // 🎯 統一獲取模式資訊和 talent_id
      const modeInfo = this.contractFlowService.getWorkflowModeInfo();
      this.currentTalentId = modeInfo.talentId;
      this.currentContractData = workflowData?.queryRowData;

      console.log('✅ 工作流程狀態確認:', {
        mode: modeInfo.modeName,
        currentTalentId: this.currentTalentId,
        contractId: modeInfo.contractId
      });

      // 🎯 準備合約資訊顯示
      this.prepareContractInfoDisplay();

      // 🎯 載入資料的優先順序
      this.loadDataWithPriority();

    } else {
      console.warn('❌ 沒有有效的工作流程資料，重導向到前一步');
      console.warn('   - 缺少 contractId 或新增模式標記');
      this.router.navigate(['account/tls/tls13010cru']);
    }
  }

  private prepareContractInfoDisplay(): void {
    console.log('📊 準備合約資訊顯示...');

    // 🎯 優先使用 CRU 頁面編輯後的資料
    const step1Data = this.contractFlowService.getStep1Data();
    console.log('📝 Step1 編輯資料:', step1Data);

    // 🎯 準備合約資訊
    const contractInfo = {
      talent_id: step1Data?.talent_id || this.currentContractData?.talent_id || '',
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
  }

  // 🎯 新增：按優先順序載入資料
  private loadDataWithPriority(): void {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    console.log('🔍 載入資料優先順序判定:', {
      commissionType: commissionType,
      isNewContract: this.contractFlowService.isNewContractMode(),
      currentTalentId: this.currentTalentId
    });

    // 第一優先：檢查是否有 Next3 暫存資料
    const savedNext3Data = this.contractFlowService.getStepData(WorkflowStep.CONDITION);

    if (savedNext3Data && Array.isArray(savedNext3Data) && savedNext3Data.length > 0) {
      console.log('📦 使用 Next3 暫存資料，項目數量:', savedNext3Data.length);
      this.loadConditionDataFromCache(savedNext3Data);
      this.conditionDataLoaded = true;
      this.dataLoaded = true;
      return;
    }

    // 第二優先：根據模式載入
    if (this.contractFlowService.isNewContractMode()) {
      console.log('🆕 新增模式：初始化空的條件設定');
      this.initializeNewContractConditionData(commissionType || '3');
    } else {
      console.log('📝 編輯模式：載入條件設定');
      this.loadOtherConditionData();
    }
  }
  private initializeNewContractConditionData(commissionType: string): void {
    console.log('🆕 新增模式：初始化條件設定，抽成類型:', commissionType);
    // 🎯 新增模式：根據抽成類型初始化空的條件設定
    this.initializeConditionDataByCommissionType(commissionType);

    this.conditionDataLoaded = true;
    this.dataLoaded = true;

    console.log('✅ 新增模式條件設定初始化完成');
  }


  // 🎯 載入其他條件設定資料
  private loadOtherConditionData(): void {
    const commissionType = this.contractInfoData[0]?.tlt_term_type || '3';
    console.log('🔍 載入其他條件設定資料，抽成類型:', commissionType);

    // 🎯 檢查是否為新增模式
    if (this.contractFlowService.isNewContractMode()) {
      console.log('🆕 新增模式：跳過 API 載入，使用空的條件設定');
      this.initializeConditionDataByCommissionType(commissionType);
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
      console.log('🔍 分類項目:', {
        id: item.id,
        _fromNext2: (item as any)._fromNext2,
        _status: (item as any)._status,
        hasBaseRent: 'base_rent' in item,
        hasChargeRate: 'cag_charge_rate' in item
      });

      if ('base_rent' in item && 'cag_charge_rate' in item) {
        // 🎯 ⭐ 重要：完整保留所有屬性
        this.baseRentHigherItems.push({
          ...item,
          _fromNext2: (item as any)._fromNext2 || false,
          _status: (item as any)._status || 'original',
          _readonly: (item as any)._readonly || false
        } as BaseRentHigherCondition);

        console.log('✅ 已分類為底租抽成取高者，保留屬性:', {
          id: item.id,
          _fromNext2: (item as any)._fromNext2,
          _status: (item as any)._status
        });
      } else if ('base_rent' in item) {
        this.fixedRentItems.push({
          ...item,
          _status: (item as any)._status || 'original'
        } as FixedRentCondition);
      } else if ('limit_amt' in item && 'seq_no' in item) {
        this.baseTierItems.push({
          ...item,
          _status: (item as any)._status || 'original'
        } as BaseTierCondition);
      } else if ('limit_amt' in item) {
        this.baseCommissionItems.push({
          ...item,
          _status: (item as any)._status || 'original'
        } as BaseCommissionCondition);
      } else if ('seq_no' in item) {
        this.graduatedItems.push({
          ...item,
          _status: (item as any)._status || 'original'
        } as GraduatedCommissionCondition);
      }
    });

    console.log('📊 分類結果統計:', {
      底租抽成取高者: this.baseRentHigherItems.length,
      來自Next2的項目: this.baseRentHigherItems.filter(item => item._fromNext2).length,
      已修改的項目: this.baseRentHigherItems.filter(item => item._status === 'modified').length
    });
  }

  // 🎯 初始化空的條件資料
  private initializeEmptyConditionData(): void {
    this.fixedRentItems = [];
    this.baseRentHigherItems = [];
    this.baseCommissionItems = [];
    this.graduatedItems = [];
    this.baseTierItems = [];
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
        this.baseRentHigherItems = [this.createBaseRentHigherItem()];
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
    return false; // 直接返回 false
  }

  getNext2IntegrationMessage(): string {
    return ''; // 直接返回空字串
  }

  // 🎯 取得來自 Next2 的項目數量
  getNext2ItemCount(): number {
    return 0; // 直接返回 0
  }
  // 🎯 取得新增的項目數量
  getNewItemCount(): number {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    switch (commissionType) {
      case '1':
        return this.fixedRentItems.filter(item => item._status === 'new').length;
      case '2':
        return this.baseRentHigherItems.filter(item => item._status === 'new').length;
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

  // onAddGeneralCommissionItem(): void {
  //   const newItem = this.createGeneralCommissionItem();
  //   this.generalCommissionItems.push(newItem);
  //   this.saveConditionDataToWorkflow();
  //   this.notificationService.successBubble('已新增一般抽成項目');
  // }

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
        if (type === 'baseRentHigher') {
          console.log('💡 底租抽成取高者資料，租金可編輯，抽成率來自 Next2');

          // 🎯 檢查是否有人試圖修改抽成率
          if (event.oldData.cag_charge_rate !== event.newData.cag_charge_rate) {
            this.notificationService.warnBubble('抽成率來自抽成設定，無法編輯');
            event.newData.cag_charge_rate = event.oldData.cag_charge_rate;
          }
        }
      }

      // 🎯 ⭐ 重要：標記為已修改，避免被同步覆蓋
      if (event.newData._status !== 'new') {
        event.newData._status = 'modified';
        console.log(`🏷️ 項目 ${event.newData.id} 標記為 modified`);
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
      ...this.baseRentHigherItems.map(item => ({
        ...item,
        // 🎯 ⭐ 重要：確保所有重要屬性都被保存
        _fromNext2: item._fromNext2 || false,
        _status: item._status || 'original',
        _readonly: item._readonly || false
      })),
      ...this.baseCommissionItems,
      ...this.graduatedItems,
      ...this.baseTierItems
    ];

    console.log('💾 Next3 儲存條件設定資料到工作流程');
    console.log('📊 儲存資料統計:', {
      總項目數: allConditionItems.length,
      底租抽成取高者: this.baseRentHigherItems.length,
      來自Next2的項目: this.baseRentHigherItems.filter(item => item._fromNext2).length,
      已修改的項目: this.baseRentHigherItems.filter(item => item._status === 'modified').length,
      新增的項目: this.baseRentHigherItems.filter(item => item._status === 'new').length
    });

    try {
      this.contractFlowService.saveStep4Data(allConditionItems);

      // 🎯 ⭐ 重要：詳細驗證儲存結果
      const savedData = this.contractFlowService.getStepData(WorkflowStep.CONDITION);
      if (Array.isArray(savedData)) {
        console.log('✅ 儲存驗證 - 暫存資料項目數:', savedData.length);

        // 🎯 檢查關鍵屬性是否保存完整
        const baseRentHigherInSaved = savedData.filter(item =>
          'base_rent' in item && 'cag_charge_rate' in item
        );

        console.log('📊 暫存中的底租抽成取高者:', {
          數量: baseRentHigherInSaved.length,
          來自Next2: baseRentHigherInSaved.filter(item => (item as any)._fromNext2).length,
          已修改: baseRentHigherInSaved.filter(item => (item as any)._status === 'modified').length
        });
      }

      console.log('✅ 已儲存條件設定資料到工作流程');
    } catch (error) {
      console.error('❌ Next3 儲存條件設定資料失敗:', error);
      this.notificationService.errorBubble('儲存條件設定資料失敗');
    }
  }

  private verifyStoredConditionData(): void {
    const savedData = this.contractFlowService.getStepData(WorkflowStep.CONDITION);
    const currentItemCount = this.getConditionItemCount();

    console.log('🔍 驗證 Next3 儲存結果:', {
      savedDataType: Array.isArray(savedData) ? '陣列' : typeof savedData,
      savedDataLength: Array.isArray(savedData) ? savedData.length : 0,
      currentItemCount: currentItemCount
    });

    if (Array.isArray(savedData) && savedData.length !== currentItemCount) {
      console.warn('⚠️ 儲存後的條件項目數量不匹配:', {
        saved: savedData.length,
        current: currentItemCount
      });
    }

    // 🎯 統計各類型項目數量
    const commissionType = this.contractInfoData[0]?.tlt_term_type;
    console.log('📊 條件設定統計:', {
      commissionType: commissionType,
      fixedRent: this.fixedRentItems.filter(item => item._status !== 'deleted').length,
      baseRentHigher: this.baseRentHigherItems.filter(item => item._status !== 'deleted').length,
      generalCommission: this.generalCommissionItems.filter(item => item._status !== 'deleted').length,
      baseCommission: this.baseCommissionItems.filter(item => item._status !== 'deleted').length,
      graduated: this.graduatedItems.filter(item => item._status !== 'deleted').length,
      baseTier: this.baseTierItems.filter(item => item._status !== 'deleted').length
    });
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
    console.log('📤 Next3: 開始送出合約資料（使用清理後資料）...');

    // 🆕 檢查與 Next2 的數量一致性（簡化版）
    if (!this.validateNext2DataConsistency()) {
      return;
    }

    this.loading = true;
    this.notificationService.blockUi();

    try {
      // 🎯 最後一次暫存條件設定資料
      this.saveConditionDataToWorkflow();

      // 🎯 使用新的清理資料方法
      const cleanSubmitData = this.contractFlowService.generateCleanSubmitData();

      console.log('🚀 Next3: 最終送出的完整 JSON:');
      console.log(JSON.stringify(cleanSubmitData, null, 2));

      // 🎯 驗證資料
      const validation = this.contractFlowService.validateCleanSubmitData(cleanSubmitData);

      if (!validation.isValid) {
        console.error('❌ Next3: 資料驗證失敗:', validation.errors);
        this.loading = false;
        this.notificationService.unblockUi();
        this.notificationService.errorBubble(`資料驗證失敗: ${validation.errors[0]}`);
        return;
      }

      // 🎯 顯示警告（如果有）
      if (validation.warnings.length > 0) {
        console.warn('⚠️ Next3: 提交警告:', validation.warnings);
        validation.warnings.forEach(warning => {
          this.notificationService.warnBubble(warning);
        });
      }

      // 🎯 調用真實的 API
      this.callCleanSubmitAPI(cleanSubmitData);

    } catch (error) {
      console.error('❌ Next3: 準備提交資料時發生錯誤:', error);
      this.loading = false;
      this.notificationService.unblockUi();
      this.notificationService.errorBubble(`準備提交資料時發生錯誤: ${error}`);
    }
  }

  private callCleanSubmitAPI(cleanData: CleanSubmitData): void {
    console.log('📤 Next3: 調用真實 API 提交契約資料...');

    // 🎯 調用真實的 API
    this.tls13010Service.submitFinalTLS13010(cleanData).subscribe({
      next: (response) => {
        console.log('✅ Next3: 契約提交成功:', response);
        this.handleSubmitSuccess(response);
      },
      error: (error) => {
        console.error('❌ Next3: 契約提交失敗:', error);
        this.handleSubmitError(error);
      }
    });
  }

  private handleSubmitSuccess(response: any): void {
    this.loading = false;
    this.notificationService.unblockUi();

    console.log('🎉 Next3: 處理提交成功回應:', response);

    // 🎯 準備成功訊息
    let successMessage = '契約資料提交成功！';
    const details: string[] = [];

    if (response.talentId) {
      details.push(`專櫃編號: ${response.talentId}`);
    }
    if (response.contractNo) {
      details.push(`合約編號: ${response.contractNo}`);
    }
    if (response.totalProcessed) {
      details.push(`處理項目數: ${response.totalProcessed}`);
    }
    if (response.processingTime) {
      details.push(`處理時間: ${response.processingTime}`);
    }

    if (details.length > 0) {
      successMessage += '\n\n' + details.join('\n');
    }

    this.notificationService.successBubble(successMessage);

    // 🎯 顯示警告（如果有）
    if (response.warnings && response.warnings.length > 0) {
      console.warn('⚠️ Next3: 收到警告訊息:', response.warnings);
      response.warnings.forEach((warning: string) => {
        this.notificationService.warnBubble(warning);
      });
    }

    // 🎯 額外的成功後處理
    this.onContractSubmitSuccess(response);

    // 🎯 提交成功後清理暫存並導航
    this.contractFlowService.onSubmitSuccess();

    // 🎯 延遲導航，讓使用者看到成功訊息
    setTimeout(() => {
      this.router.navigate(['account/tls/tls13010']);
    }, 3000); // Next3 給更多時間讓使用者閱讀詳細資訊
  }

  private handleSubmitError(error: any): void {
    this.loading = false;
    this.notificationService.unblockUi();

    console.error('💥 Next3: 處理提交錯誤:', error);

    let errorMessage = '契約資料提交失敗';
    let additionalInfo: string[] = [];

    // 🎯 解析錯誤訊息
    if (error?.error?.Message) {
      errorMessage += `: ${error.error.Message}`;
    } else if (error?.message) {
      errorMessage += `: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage += `: ${error}`;
    }

    // 🎯 特殊錯誤處理和建議
    if (error?.status === 400) {
      errorMessage = '資料格式錯誤，請檢查輸入內容';
      additionalInfo.push('請檢查所有必填欄位是否已正確填寫');
      additionalInfo.push('確認日期格式和數值範圍是否正確');
    } else if (error?.status === 500) {
      errorMessage = '伺服器內部錯誤，請稍後重試或聯繫管理員';
      additionalInfo.push('您的資料已暫存，可稍後重新提交');
    } else if (error?.status === 0) {
      errorMessage = '網路連線錯誤，請檢查網路狀態';
      additionalInfo.push('請確認網路連線正常後重試');
    } else if (error?.status === 409) {
      errorMessage = '資料衝突，可能有其他使用者正在編輯相同資料';
      additionalInfo.push('請重新載入最新資料後再試');
    }

    // 🎯 顯示主要錯誤訊息
    this.notificationService.errorBubble(errorMessage);

    // 🎯 顯示額外建議（如果有）
    if (additionalInfo.length > 0) {
      setTimeout(() => {
        additionalInfo.forEach(info => {
          this.notificationService.infoBubble(info);
        });
      }, 1000);
    }

    // 🎯 記錄詳細錯誤資訊供除錯
    console.group('❌ Next3: 詳細錯誤資訊');
    console.log('Status:', error?.status);
    console.log('StatusText:', error?.statusText);
    console.log('URL:', error?.url);
    console.log('Error Object:', error?.error);
    console.log('Full Error:', error);
    console.groupEnd();

    // 🎯 額外的錯誤後處理
    this.onContractSubmitError(error);
  }

  // 🎯 新增：提交成功後的額外處理
  private onContractSubmitSuccess(response: any): void {
    console.log('🎊 Next3: 執行提交成功後的額外處理');

    // 可以在這裡加入額外的成功後邏輯，例如：
    // - 發送統計資料
    // - 更新本地暫存
    // - 記錄操作日誌

    // 🎯 如果有處理摘要，可以記錄
    if (response.data?.Summary) {
      console.log('📊 處理摘要:', response.data.Summary);
    }
  }

  // 🎯 新增：提交錯誤後的額外處理
  private onContractSubmitError(error: any): void {
    console.log('🔧 Next3: 執行提交錯誤後的額外處理');

    // 可以在這裡加入額外的錯誤後邏輯，例如：
    // - 自動儲存錯誤報告
    // - 發送錯誤統計
    // - 提供復原建議

    // 🎯 保持資料暫存狀態，方便使用者重試
    console.log('💾 錯誤後保持資料暫存狀態，使用者可重新提交');
  }

  private validateNext2DataConsistency(): boolean {
    const commissionType = this.contractInfoData[0]?.tlt_term_type;

    if (commissionType !== '2') {
      return true; // 非底租抽成取高者不需檢查
    }

    try {
      // 🎯 簡化檢查：使用清理後的資料
      const cleanData = this.contractFlowService.generateCleanSubmitData();

      const next2MasterCount = cleanData.commissions.masters.toInsert.length +
        cleanData.commissions.masters.toUpdate.length;

      const next3RentCount = cleanData.conditions.baseRentHigher.toInsert.length +
        cleanData.conditions.baseRentHigher.toUpdate.length;

      console.log('🔍 Next3: 數量一致性檢查:', {
        next2MasterCount,
        next3RentCount,
        isConsistent: next2MasterCount === next3RentCount
      });

      if (next2MasterCount !== next3RentCount) {
        this.notificationService.errorBubble(
          `資料不一致：抽成設定有 ${next2MasterCount} 個項目，` +
          `但條件設定有 ${next3RentCount} 個項目。請檢查資料後再送出。`
        );
        return false;
      }

      return true;

    } catch (error) {
      console.error('❌ Next3: 一致性檢查失敗:', error);
      this.notificationService.warnBubble('無法驗證資料一致性，請檢查資料完整性');
      return true; // 允許繼續，但給出警告
    }
  }

  // 🎯 導航方法
  override onCancel(): void {
    console.log('🔄 Next3 返回前一頁，先暫存資料');
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

  private loadDiscountOptions(): Promise<void> {
    return new Promise((resolve) => {
      console.log('🔽 Next3 開始載入折數選項...');
      this.paperTypeService.getPaperTypeOptions('T102').subscribe({
        next: (options: any[]) => {
          console.log('📥 Next3 API 回傳的折扣選項:', options);
          this.discountOptions = options;
          console.log('🔄 Next3 設定折扣選項:', this.discountOptions);
          this.updateGeneralCommissionColumnOptions();
          resolve();
        },
        error: (error: any) => {
          console.error('❌ Next3 載入折數選項失敗:', error);
          this.discountOptions = [];
          this.updateGeneralCommissionColumnOptions();
          resolve();
        }
      });
    });
  }

  private updateGeneralCommissionColumnOptions(): void {
    console.log('🟢 Next3 更新折扣選項:', this.discountOptions);

    this.generalCommissionColumns = this.generalCommissionColumns.map(col => {
      if (col.field === 'cag_barcode') {
        return { ...col, options: [...this.discountOptions] };
      }
      return col;
    });

    console.log('✅ Next3 一般抽成欄位選項已更新');
  }
}
