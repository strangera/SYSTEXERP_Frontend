import { option } from './../../../shared/models/sys/sysb000.module';
import { Column, formatDate } from './../../../shared/componentkit/table/table.model';
import { ColumnDef } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS13010Service } from '../../../service/API/tls/tls13010.service';
import { ContractFlowService, WorkflowStep } from '../../../service/API/tls/tls13010contract-flow/contract-flow.service';
import { TLS13010_DROPDOWN_OPTIONS } from '../tls13010/tls13010.dropdown';

// 介面定義
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
}

// 統一的扣款項目介面
interface FareItem {
  id?: string | number;
  serialNumber?: number;
  talent_id: number;
  cap_type: string;
  cap_item: string;
  cap_name: string;
  tpy_bdate?: string;
  tpy_edate?: string;
  tpy_type?: string;
  tpy_qty?: number;
  tpy_unitamt?: number;
  tpy_amount?: number;
  tpy_totalamt?: number;
  day_account?: string;
  interval?: number;
  down_payment?: number;
  period_nos?: number;
  tpy_1stamt?: number;
  cap_saletype?: string;
  edc_bank?: string;
  instms_type?: string;
  pay_no?: string;
  gui_flag?: string;
  tpy_rate?: number;
  org_id?: string;
  is_commonly_used?: string;
  cap_tax_type?: string;
  acc_no?: string;

  // API 標記欄位
  data_source: string;
  is_selected: boolean;
  is_new_item: boolean;

  // 狀態欄位
  _status?: 'new' | 'modified' | 'deleted' | 'original';
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

@Component({
  selector: 'app-tls13010-next1',
  templateUrl: './tls13010-next1.component.html',
  styleUrls: ['./tls13010-next1.component.scss']
})
export class TLS13010Next1Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  // 顯示模式控制
  showOnlyCommonlyUsed = true;
  showOnlySelected = false;
  isShowingAll = false;

  // 當前合約資料
  currentTalentId: string = '';
  currentContractData: any = null;
  contractInfoData: ContractInfo[] = [];

  // 🎯 簡化：只定義欄位結構，日期處理交給共通組件
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
      dateFormat: 'full-date' // 🎯 只需要指定格式
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

  // A 類型（一次扣款）
  deductionAColumns: ColumnDef[] = [
    {
      field: 'is_selected',
      header: '選取',
      type: 'checkbox',
      editable: true,
      autoWidth: true
    },
    {
      field: 'cap_item',
      header: '代號',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'cap_name',
      header: '扣款名稱',
      type: 'text',
      editable: false,
      autoWidth: true
    },
    {
      field: 'tpy_bdate',
      header: '起始年月',
      type: 'date',
      editable: true,
      autoWidth: true,
      dateFormat: 'year-month' // 🎯 共通組件會自動處理
    },
    {
      field: 'tpy_type',
      header: '單位',
      type: 'text',
      editable: true,
      width: '70px'
    },
    {
      field: 'tpy_unitamt',
      header: '單價',
      type: 'number',
      editable: true,
      width: '90px'
    },
    {
      field: 'tpy_qty',
      header: '數量',
      type: 'number',
      editable: true,
      width: '70px'
    },
    {
      field: 'tpy_amount',
      header: '扣款金額',
      type: 'number',
      editable: true,
      autoWidth: true
    },
    {
      field: 'org_id',
      header: '組織',
      type: 'text',
      editable: true,
      autoWidth: true
    },
    {
      field: 'gui_flag',
      header: '開立發票',
      type: 'dropdown',
      editable: true,
      autoWidth: true,
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ]
    }
  ];

  // B 類型（每月扣款）
  deductionBColumns: ColumnDef[] = [
    {
      field: 'is_selected',
      header: '是否新增',
      type: 'checkbox',
      editable: true,
      width: '80px'
    },
    {
      field: 'cap_item',
      header: '扣款代號',
      type: 'text',
      editable: false,
      width: '100px'
    },
    {
      field: 'cap_name',
      header: '扣款名稱',
      type: 'text',
      editable: false,
      minWidth: '120px',
      flex: 2
    },
    {
      field: 'tpy_bdate',
      header: '扣款起始年月',
      type: 'date',
      editable: true,
      width: '130px',
      dateFormat: 'full-date' // 🎯 這裡就是你想要的功能！
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'date',
      editable: true,
      width: '130px',
      dateFormat: 'full-date'
    },
    {
      field: 'tpy_type',
      header: '單位',
      type: 'dropdown',
      editable: true,
      options: TLS13010_DROPDOWN_OPTIONS.tpyTypeOption,
      autoWidth: true,
    },
    {
      field: 'tpy_unitamt',
      header: '單價',
      type: 'number',
      editable: true,
      width: '90px'
    },
    {
      field: 'tpy_qty',
      header: '數量',
      type: 'number',
      editable: true,
      width: '70px'
    },
    {
      field: 'tpy_amount',
      header: '扣款金額(未稅)',
      type: 'number',
      editable: true,
      width: '120px'
    },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: true,
      width: '110px',
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ]
    },
    {
      field: 'day_account',
      header: '是否以日計算',
      type: 'dropdown',
      editable: true,
      width: '110px',
      options: [
        { label: '是', value: 'Y' },
        { label: '否', value: 'N' }
      ]
    },
    {
      field: 'interval',
      header: '扣款週期數(月)',
      type: 'number',
      editable: true,
      width: '120px'
    }
  ];

  // C 類型（平均分攤）
  deductionCColumns: ColumnDef[] = [
    {
      field: 'is_selected',
      header: '是否新增',
      type: 'checkbox',
      editable: true,
      width: '80px'
    },
    {
      field: 'cap_item',
      header: '扣款代號',
      type: 'text',
      editable: false,
      width: '100px'
    },
    {
      field: 'cap_name',
      header: '扣款名稱',
      type: 'text',
      editable: false,
      minWidth: '120px',
      flex: 2
    },
    {
      field: 'tpy_bdate',
      header: '扣款起始年月',
      type: 'date',
      editable: true,
      width: '130px',
      dateFormat: 'full-date'
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'date',
      editable: true,
      width: '130px',
      dateFormat: 'full-date'
    },
    {
      field: 'tpy_totalamt',
      header: '總金額',
      type: 'number',
      editable: true,
      width: '100px'
    },
    {
      field: 'down_payment',
      header: '預收款',
      type: 'number',
      editable: true,
      width: '90px'
    },
    {
      field: 'period_nos',
      header: '期數',
      type: 'number',
      editable: true,
      width: '70px'
    },
    {
      field: 'tpy_amount',
      header: '每月金額',
      type: 'number',
      editable: true,
      width: '100px'
    },
    {
      field: 'tpy_1stamt',
      header: '首期金額',
      type: 'number',
      editable: true,
      width: '100px'
    },
    {
      field: 'org_id',
      header: '組織',
      type: 'text',
      editable: true,
      minWidth: '70px',
      flex: 1
    },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: true,
      width: '110px',
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ]
    }
  ];

  // D 類型（比率分攤）
  deductionDColumns: ColumnDef[] = [
    {
      field: 'is_selected',
      header: '是否新增',
      type: 'checkbox',
      editable: true,
      width: '80px'
    },
    {
      field: 'cap_item',
      header: '扣款代號',
      type: 'text',
      editable: false,
      width: '100px'
    },
    {
      field: 'cap_name',
      header: '扣款名稱',
      type: 'text',
      editable: false,
      minWidth: '120px',
      flex: 2
    },
    {
      field: 'tpy_bdate',
      header: '扣款起始年月',
      type: 'date',
      editable: true,
      width: '130px',
      dateFormat: 'full-date'
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'date',
      editable: true,
      width: '130px',
      dateFormat: 'full-date'
    },
    {
      field: 'tpy_type',
      header: '單位',
      type: 'text',
      editable: true,
      width: '70px'
    },
    {
      field: 'tpy_rate',
      header: '比率或元',
      type: 'number',
      editable: true,
      width: '100px'
    },
    {
      field: 'org_id',
      header: '組織',
      type: 'dropdown',
      editable: true,
      width: '90px',
      options: []
    },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: true,
      width: '110px',
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ]
    }
  ];

  // E 類型（活動扣款）
  deductionEColumns: ColumnDef[] = [
    {
      field: 'is_selected',
      header: '是否新增',
      type: 'checkbox',
      editable: true,
      width: '80px'
    },
    {
      field: 'cap_item',
      header: '扣款代號',
      type: 'text',
      editable: false,
      width: '100px'
    },
    {
      field: 'cap_name',
      header: '扣款名稱',
      type: 'text',
      editable: false,
      minWidth: '120px',
      flex: 2
    },
    {
      field: 'tpy_bdate',
      header: '扣款起始年月',
      type: 'date',
      editable: true,
      width: '130px',
      dateFormat: 'full-date'
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'date',
      editable: true,
      width: '130px',
      dateFormat: 'full-date'
    },
    {
      field: 'tpy_type',
      header: '單位',
      type: 'text',
      editable: true,
      width: '70px'
    },
    {
      field: 'tpy_rate',
      header: '比率或元',
      type: 'number',
      editable: true,
      width: '100px'
    },
    {
      field: 'org_id',
      header: '組織',
      type: 'dropdown',
      editable: true,
      width: '90px',
      options: [
        { label: '102220', value: '102220' },
        { label: '102221', value: '102221' },
        { label: '102222', value: '102222' }
      ]
    },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: true,
      width: '110px',
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ]
    }
  ];

  // 資料陣列
  originalFareData: { [key: string]: FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  fareData: { [key: string]: FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  dataForm = this.formBuilder.group({});

  constructor(
    private tls13010Service: TLS13010Service,
    private contractFlowService: ContractFlowService
  ) {
    super();
  }

  ngOnInit(): void {
    console.log('TLS13010Next1Component 初始化開始');
    this.initializeDataStructure();
    this.initializePage('TLS13010', this.dataForm);
    this.loadWorkflowData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadWorkflowData(): void {
    console.log('🚀 開始載入工作流程資料...');

    const workflowData = this.contractFlowService.getCurrentData();
    console.log('📋 工作流程資料:', workflowData);

    if (workflowData.queryRowData?.talent_id) {
      this.currentTalentId = workflowData.queryRowData.talent_id;
      this.currentContractData = workflowData.queryRowData;

      console.log('✅ 取得合約ID:', this.currentTalentId);

      // 🎯 關鍵修正：優先使用 CRU 頁面編輯後的資料
      const step1Data = this.contractFlowService.getStep1Data();
      console.log('📝 Step1 編輯資料:', step1Data);

      // 準備合約資訊 - 優先使用編輯後的資料，沒有才用原始查詢資料
      const contractInfo = {
        // 基本資訊 - 優先使用編輯資料
        talent_id: step1Data?.talent_id || this.currentContractData.talent_id || '-',
        apply_no: step1Data?.apply_no || this.currentContractData.apply_no || '-',
        tlt_name: step1Data?.tlt_name || this.currentContractData.tlt_name || '-',
        VEN_Name: step1Data?.VEN_Name || this.currentContractData.VEN_Name || '-',
        ven_uniform: step1Data?.ven_uniform || this.currentContractData.ven_uniform || '-',
        contract_subno: step1Data?.contract_subno || this.currentContractData.contract_subno || '-',

        // 商務條件 - 優先使用編輯資料
        comm_comp_type: step1Data?.comm_comp_type || this.currentContractData.comm_comp_type || '-',

        // 日期資訊 - 優先使用編輯資料
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

      this.initializeDataStructure();

      // 檢查暫存資料
      console.log('🔍 檢查是否有暫存的扣款資料...');
      const savedFareData = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);

      if (savedFareData && Object.keys(savedFareData).length > 0) {
        console.log('📦 發現暫存的扣款資料，直接使用');
        try {
          this.originalFareData = this.validateAndFixData(savedFareData);
          this.filterData();
          console.log('✅ 暫存資料載入完成');
        } catch (error) {
          console.error('❌ 暫存資料處理失敗，重新載入:', error);
          this.loadFareDataFromAPI(false);
        }
      } else {
        console.log('📭 沒有暫存資料，從 API 載入');
        this.loadFareDataFromAPI(false);
      }
    } else {
      console.warn('❌ 沒有 talent_id，重導向到前一步');
      this.router.navigate(['/TLS/TLS13010CRU']);
    }
  }
  // 🎯 簡化：資料驗證和修正（移除日期處理）
  private validateAndFixData(data: any): { [key: string]: FareItem[] } {
    console.log('驗證暫存資料格式:', data);

    const validatedData: { [key: string]: FareItem[] } = {
      'A': [], 'B': [], 'C': [], 'D': [], 'E': []
    };

    if (!data || typeof data !== 'object') {
      console.error('❌ 暫存資料不是物件，使用空資料');
      return validatedData;
    }

    const hasCorrectStructure = Object.keys(validatedData).every(capType =>
      data.hasOwnProperty(capType)
    );

    if (!hasCorrectStructure) {
      console.error('❌ 暫存資料結構不正確，缺少必要的類型鍵值');
      return validatedData;
    }

    // 🎯 簡化：只做基本資料驗證，不處理日期
    Object.keys(validatedData).forEach(capType => {
      if (data[capType] && Array.isArray(data[capType])) {
        validatedData[capType] = data[capType].map((item: any) => {
          if (!item || typeof item !== 'object') {
            console.warn(`⚠️ ${capType} 中發現無效項目:`, item);
            return null;
          }

          // 基本欄位確保存在，日期欄位保持原樣
          const fixedItem: FareItem = {
            id: item.id || `${capType}_${Date.now()}_${Math.random()}`,
            talent_id: item.talent_id || parseInt(this.currentTalentId) || 0,
            cap_type: item.cap_type || capType,
            cap_item: item.cap_item || '',
            cap_name: item.cap_name || '',

            // 🎯 關鍵：保持日期欄位原樣，讓共通組件處理
            tpy_bdate: item.tpy_bdate,
            tpy_edate: item.tpy_edate,

            tpy_type: item.tpy_type || null,
            tpy_qty: item.tpy_qty || null,
            tpy_unitamt: item.tpy_unitamt || null,
            tpy_amount: item.tpy_amount || null,
            tpy_totalamt: item.tpy_totalamt || null,
            day_account: item.day_account || null,
            interval: item.interval || null,
            down_payment: item.down_payment || null,
            period_nos: item.period_nos || null,
            tpy_1stamt: item.tpy_1stamt || null,
            cap_saletype: item.cap_saletype || null,
            edc_bank: item.edc_bank || null,
            instms_type: item.instms_type || null,
            pay_no: item.pay_no || null,
            gui_flag: item.gui_flag || null,
            tpy_rate: item.tpy_rate || null,
            org_id: item.org_id || null,
            is_commonly_used: item.is_commonly_used || null,
            cap_tax_type: item.cap_tax_type || null,
            acc_no: item.acc_no || null,

            data_source: item.data_source || 'APS_COMMON',
            is_selected: Boolean(item.is_selected),
            is_new_item: Boolean(item.is_new_item),
            _status: item._status || 'original'
          };

          return fixedItem;
        }).filter(item => item !== null);
      } else {
        console.warn(`暫存資料中 ${capType} 類型格式不正確，使用空陣列`);
        validatedData[capType] = [];
      }
    });

    console.log('修正後的資料:', validatedData);
    return validatedData;
  }

  // 從 API 載入扣款資料（簡化版）
  private loadFareDataFromAPI(showAll: boolean = false): void {
    if (!this.currentTalentId) {
      console.warn('沒有 talent_id，無法載入扣款資料');
      return;
    }

    this.loading = true;
    this.messageService.blockUi();

    const subscription = this.tls13010Service.queryTLS13010Fare({
      talentId: this.currentTalentId,
      showAll: showAll
    }).subscribe({
      next: (response) => {
        console.log('API 回傳的扣款資料:', response);

        if (response && response.Data && response.Data.FaresByType) {
          // 🎯 簡化：直接使用 API 資料，讓共通組件處理日期
          this.originalFareData = response.Data.FaresByType;
          this.isShowingAll = showAll;
          this.filterData();
          this.saveFareDataToWorkflow();
          this.messageService.successBubble('扣款資料載入成功');
        } else {
          console.log('API 沒有回傳扣款資料');
          this.messageService.infoBubble('沒有找到既有的扣款資料');
          this.initializeEmptyData();
        }

        this.loading = false;
        this.messageService.unblockUi();
      },
      error: (error) => {
        console.error('載入扣款資料失敗:', error);
        this.messageService.warnBubble('載入扣款資料失敗');
        this.loading = false;
        this.messageService.unblockUi();
        this.initializeEmptyData();
      }
    });

    this.subscriptions.push(subscription);
  }

  private initializeEmptyData(): void {
    this.originalFareData = {
      'A': [], 'B': [], 'C': [], 'D': [], 'E': []
    };
    this.filterData();
    this.saveFareDataToWorkflow();
  }

  private initializeDataStructure(): void {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    capTypes.forEach(capType => {
      if (!this.originalFareData[capType]) {
        this.originalFareData[capType] = [];
      }
      if (!this.fareData[capType]) {
        this.fareData[capType] = [];
      }
    });
  }

  filterData(): void {
    console.log('開始篩選資料，原始資料:', this.originalFareData);
    this.initializeDataStructure();

    Object.keys(this.originalFareData).forEach(capType => {
      if (!Array.isArray(this.originalFareData[capType])) {
        console.warn(`originalFareData[${capType}] 不是陣列，重置為空陣列`);
        this.originalFareData[capType] = [];
      }

      if (this.showOnlySelected) {
        this.fareData[capType] = this.originalFareData[capType].filter(item =>
          item && item.is_selected
        );
      } else if (this.showOnlyCommonlyUsed) {
        this.fareData[capType] = this.originalFareData[capType].filter(item =>
          item && (item.data_source === 'CONTRACT_EXISTING' || item.data_source === 'APS_COMMON')
        );
      } else {
        this.fareData[capType] = [...this.originalFareData[capType]];
      }
    });

    console.log('篩選後的資料:', this.fareData);
  }

  private saveFareDataToWorkflow(): void {
    try {
      console.log('💾 準備儲存暫存資料...');
      const dataToSave = { ...this.originalFareData };
      let totalItems = 0;

      Object.keys(dataToSave).forEach(capType => {
        if (!Array.isArray(dataToSave[capType])) {
          console.warn(`⚠️ 修正儲存資料：${capType} 不是陣列，重置為空陣列`);
          dataToSave[capType] = [];
        } else {
          totalItems += dataToSave[capType].length;
          console.log(`📝 ${capType} 類型: ${dataToSave[capType].length} 筆`);
        }
      });

      console.log(`💾 總共要儲存 ${totalItems} 筆資料`);
      this.contractFlowService.saveStep2Data(dataToSave);
      console.log('✅ 已成功暫存扣款資料到工作流程');
    } catch (error) {
      console.error('❌ 儲存暫存資料時發生錯誤:', error);
    }
  }

  // 顯示模式切換
  toggleCommonlyUsed(): void {
    if (this.showOnlyCommonlyUsed) {
      if (!this.isShowingAll) {
        this.loadFareDataFromAPI(true);
      }
      this.showOnlyCommonlyUsed = false;
      this.showOnlySelected = false;
    } else {
      this.showOnlyCommonlyUsed = true;
      this.showOnlySelected = false;
    }
    this.filterData();
  }

  toggleSelectedOnly(): void {
    this.showOnlySelected = !this.showOnlySelected;
    this.showOnlyCommonlyUsed = false;
    this.filterData();
  }

  showAllItems(): void {
    if (!this.isShowingAll) {
      this.loadFareDataFromAPI(true);
    }
    this.showOnlyCommonlyUsed = false;
    this.showOnlySelected = false;
    this.filterData();
  }

  getToggleCommonlyUsedText(): string {
    return this.showOnlyCommonlyUsed ? '顯示全部項目' : '僅顯示常用項目';
  }

  getToggleSelectedText(): string {
    return this.showOnlySelected ? '顯示全部項目' : '僅顯示已勾選項目';
  }

  selectAllByType(capType: string): void {
    this.fareData[capType].forEach(item => item.is_selected = true);
    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
  }

  deselectAllByType(capType: string): void {
    this.fareData[capType].forEach(item => item.is_selected = false);
    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
  }

  private updateOriginalData(capType: string): void {
    this.fareData[capType].forEach(displayItem => {
      const originalItem = this.originalFareData[capType].find(item => item.id === displayItem.id);
      if (originalItem) {
        originalItem.is_selected = displayItem.is_selected;
      }
    });
  }

  // 表格事件處理
  onFareTableSave(event: { oldData: any, newData: any }, capType: string): void {
    console.log('🔄 表格資料更新事件:', {
      capType: capType,
      oldData: event.oldData,
      newData: event.newData
    });

    const { newData } = event;

    if (newData._status === 'original') {
      newData._status = 'modified';
      console.log(`📝 ${capType} 項目狀態變更: original → modified`);
    }

    const originalIndex = this.originalFareData[capType].findIndex(item => item.id === newData.id);
    if (originalIndex > -1) {
      console.log(`🔄 更新 ${capType}[${originalIndex}] 資料`);
      this.originalFareData[capType][originalIndex] = { ...newData };
    } else {
      console.error(`❌ 找不到要更新的項目: ${capType}, id: ${newData.id}`);
    }

    console.log(`${capType} 類型扣款資料已更新`);
    this.saveFareDataToWorkflow();
    this.messageService.successBubble('扣款資料已儲存');
  }

  onFareTableEdit(rowData: any, capType: string): void {
    console.log(`開始編輯 ${capType} 類型扣款資料:`, rowData);
  }

  onFareTableCancel(rowData: any, capType: string): void {
    console.log(`取消編輯 ${capType} 類型扣款資料:`, rowData);
  }

  onItemSelectionChange(capType: string): void {
    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
  }

  // 輔助方法
  getSelectedCount(capType: string): number {
    if (!this.fareData[capType] || !Array.isArray(this.fareData[capType])) {
      return 0;
    }
    return this.fareData[capType].filter(item => item && item.is_selected).length;
  }

  getTotalCount(capType: string): number {
    if (!this.fareData[capType] || !Array.isArray(this.fareData[capType])) {
      return 0;
    }
    return this.fareData[capType].length;
  }

  getCapTypeName(capType: string): string {
    const typeNames: { [key: string]: string } = {
      'A': '一次扣款',
      'B': '每月扣款',
      'C': '平均分攤',
      'D': '比率分攤',
      'E': '活動扣款'
    };
    return typeNames[capType] || capType;
  }

  getColumnsForType(capType: string): ColumnDef[] {
    switch (capType) {
      case 'A': return this.deductionAColumns;
      case 'B': return this.deductionBColumns;
      case 'C': return this.deductionCColumns;
      case 'D': return this.deductionDColumns;
      case 'E': return this.deductionEColumns;
      default: return [];
    }
  }

  // 導航
  onSubmitNext(): void {
    this.saveFareDataToWorkflow();

    const hasSelectedItems = Object.keys(this.originalFareData).some(capType =>
      this.originalFareData[capType].some(item => item.is_selected)
    );

    if (!hasSelectedItems) {
      this.messageService.warnBubble('請至少選擇一個扣款項目');
      return;
    }

    this.router.navigate(['TLS/TLS13010NEXT2']);
    this.messageService.infoBubble('進入下一步：抽成設定');
  }

  override onCancel(): void {
    console.log('🔙 準備回到前一步...');
    this.saveFareDataToWorkflow();
    this.router.navigate(['/TLS/TLS13010CRU']);
    this.messageService.infoBubble('已返回合約資訊頁面');
  }

  onRealCancel(): void {
    if (confirm('確定要離開契約編輯流程嗎？所有暫存資料將會保留。')) {
      this.saveFareDataToWorkflow();
      this.router.navigate(['/TLS/TLS13010']);
      this.messageService.infoBubble('已離開契約編輯流程');
    }
  }

  onClearAndExit(): void {
    if (confirm('確定要清空所有暫存資料並離開嗎？此操作無法復原。')) {
      this.contractFlowService.clearTempData();
      this.router.navigate(['/TLS/TLS13010']);
      this.messageService.infoBubble('已清空暫存資料並離開');
    }
  }

  // 表單相關
  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onSubmit(frm: FormGroup): void {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      console.log('扣款資料提交:', this.originalFareData);
      this.saveFareDataToWorkflow();
      this.messageService.successBubble('扣款資料已儲存');
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  canQuery(): boolean {
    return true;
  }

  // 匯出屬性
  get capTypes(): string[] {
    return ['A', 'B', 'C', 'D', 'E'];
  }

  hasUnsavedChanges(): boolean {
    return Object.keys(this.originalFareData).some(capType =>
      this.originalFareData[capType].some(item =>
        item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
      )
    );
  }

  reloadData(): void {
    if (confirm('確定要重新載入資料嗎？未儲存的變更將會遺失。')) {
      this.loadFareDataFromAPI(this.isShowingAll);
      this.messageService.infoBubble('已重新載入資料');
    }
  }

  saveAllChanges(): void {
    this.saveFareDataToWorkflow();
    this.messageService.successBubble('所有變更已儲存');
  }

  hasAnyData(): boolean {
    return Object.keys(this.originalFareData).some(capType =>
      this.originalFareData[capType].length > 0
    );
  }

  getTotalSelectedCount(): number {
    return Object.keys(this.originalFareData).reduce((total, capType) =>
      total + this.getSelectedCount(capType), 0
    );
  }

  getTotalItemCount(): number {
    return Object.keys(this.originalFareData).reduce((total, capType) =>
      total + this.getTotalCount(capType), 0
    );
  }

  hasDataForType(capType: string): boolean {
    return this.fareData[capType] && Array.isArray(this.fareData[capType]) && this.fareData[capType].length > 0;
  }

  getCurrentDisplayMode(): string {
    if (this.showOnlyCommonlyUsed) {
      return '僅常用項目';
    } else if (this.showOnlySelected) {
      return '僅已勾選項目';
    } else {
      return '全部項目';
    }
  }
}
