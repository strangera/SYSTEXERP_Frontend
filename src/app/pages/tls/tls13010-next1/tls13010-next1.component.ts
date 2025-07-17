import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { ContractFlowService } from '../tls13010/services/contract-flow.service';
import { TLS13010_DROPDOWN_OPTIONS } from '../tls13010/tls13010.dropdown';
import { FareItem, ContractInfo, WorkflowStep } from '../tls13010/tls13010.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf, NgFor } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from 'primeng/accordion';

// 介面定義
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
}

@Component({
  selector: 'app-tls13010-next1',
  templateUrl: './tls13010-next1.component.html',
  styleUrls: ['./tls13010-next1.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, NgIf, ProgressSpinnerModule, AccordionModule, ExpandableEditTableComponent, NgFor]
})
export class TLS13010Next1Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  private routerSubscription: any;

  // 顯示模式控制
  showOnlySelected = false;  // 控制是否只顯示已勾選項目
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
      header: '是否新增',
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
      type: 'text',
      editable: true,
      autoWidth: true,
      dateFormat: 'year-month'
    },
    {
      field: 'tpy_type',
      header: '單位',
      type: 'dropdown',
      editable: true,
      width: '70px',
      options: TLS13010_DROPDOWN_OPTIONS.tpyTypeOption,
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
      type: 'dropdown',
      editable: true,
      width: '90px',
      options: []
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
      type: 'text',
      editable: true,
      width: '130px',
      dateFormat: 'year-month'
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'text',
      editable: true,
      width: '130px',
      dateFormat: 'year-month'
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
      type: 'text',
      editable: true,
      width: '130px',
      dateFormat: 'full-date'
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'text',
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
      type: 'text',
      editable: true,
      width: '130px',
      dateFormat: 'full-date'
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'text',
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
      type: 'text',
      editable: true,
      width: '130px',
      dateFormat: 'full-date'
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'text',
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

  // 資料陣列
  originalFareData: { [key: string]: FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  fareData: { [key: string]: FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  dataForm = this.formBuilder.group({});

  // 顯示模式狀態，僅有 common 與 all
  showMode: 'common' | 'all' = 'common';

  constructor(
    private tls13010Service: TLS13010Service,
    private contractFlowService: ContractFlowService,
    public override router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    console.log('TLS13010Next1Component 初始化開始');
    this.initializeDataStructure();
    this.initializePage('TLS13010', this.dataForm);
    this.loadWorkflowData();
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadWorkflowData();
      });
  }

  ngOnDestroy(): void {
    console.log('🔄 NEXT1 組件銷毀，確保資料儲存');

    // ✅ 確保退出前儲存
    this.saveFareDataToWorkflow();

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadWorkflowData(): void {
    console.log('🚀 Next1 開始載入工作流程資料...');

    const workflowData = this.contractFlowService.getCurrentData();
    console.log('📋 工作流程資料:', workflowData);

    // 🎯 統一使用 ContractFlowService 的模式判定
    if (workflowData.contractId || this.contractFlowService.isNewContractMode()) {
      // 🎯 統一獲取 talent_id 和模式資訊
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

      // 🎯 初始化資料結構
      this.initializeDataStructure();

      // 🎯 統一的資料載入邏輯
      this.loadFareDataWithPriority();
    } else {
      console.warn('❌ 沒有工作流程資料，重導向到前一步');
      this.router.navigate(['account/tls/tls13010cru']);
    }
  }

  private prepareContractInfoDisplay(): void {
    console.log('📊 準備合約資訊顯示...');

    // 🎯 優先使用 Step1 編輯後的資料
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
      tlt_term_type: (step1Data?.tlt_term_type || this.currentContractData?.tlt_term_type || '3').toString().trim(),
      comm_comp_type: step1Data?.comm_comp_type || this.currentContractData?.comm_comp_type || '2',
      tlt_bdate: step1Data?.tlt_bdate || this.currentContractData?.tlt_bdate || '',
      tlt_edate: step1Data?.tlt_edate || this.currentContractData?.tlt_edate || '',
      tlt_contract_bdate: step1Data?.tlt_contract_bdate || this.currentContractData?.tlt_contract_bdate || '',
      tlt_contract_edate: step1Data?.tlt_contract_edate || this.currentContractData?.tlt_contract_edate || ''
    };

    this.contractInfoData = [{
      id: contractInfo.talent_id || 'new',
      ...contractInfo
    }];

    console.log('📊 合約資訊顯示準備完成:', this.contractInfoData);
  }


  private loadFareDataWithPriority(): void {
    console.log('🔍 載入扣款資料優先順序判定...');

    // 🎯 第一優先：檢查暫存資料
    const savedFareData = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);
    console.log('📦 檢查 Step2 暫存資料:', savedFareData);

    if (savedFareData && Array.isArray(savedFareData) && savedFareData.length > 0) {
      console.log('📦 使用暫存扣款資料');
      this.loadSavedFareData(savedFareData);
      return;
    }

    // 🎯 第二優先：根據模式載入
    if (this.contractFlowService.isNewContractMode()) {
      console.log('🆕 新增模式：載入可用扣款項目');
      this.loadAvailableFareData();
    } else {
      console.log('📝 編輯模式：從 API 載入');
      this.loadFareDataFromAPI();
    }
  }

  private loadSavedFareData(savedData: FareItem[]): void {
    console.log('📦 載入暫存扣款資料:', savedData);

    try {
      // 🎯 驗證和修復資料格式
      this.originalFareData = this.validateAndFixData(savedData);
      this.filterData();

      console.log('✅ 暫存扣款資料載入完成');
      console.log('📊 載入的資料詳情:', this.originalFareData);

      // 🎯 檢查資料完整性
      this.verifyStoredData();

    } catch (error) {
      console.error('❌ 暫存扣款資料處理失敗，重新載入:', error);

      // 🎯 暫存資料有問題時的降級處理
      if (this.contractFlowService.isNewContractMode()) {
        this.loadAvailableFareData();
      } else {
        this.loadFareDataFromAPI();
      }
    }
  }


  private loadAvailableFareData(): void {
    console.log('🔄 新增模式：載入可用扣款項目...');

    this.loading = true;
    this.messageService.blockUi();

    const subscription = this.tls13010Service.queryTLS13010Fare({
      talentId: '', // 🎯 新增模式傳空字串，載入所有可用項目
      showAll: true  // 載入全部可用項目
    }).subscribe({
      next: (response) => {
        console.log('🆕 新增模式 API 回傳資料:', response);

        if (response && response.Data && response.Data.FaresByType) {
          // 🎯 處理 API 資料，新增模式下所有項目都是未選中狀態
          this.originalFareData = this.processNewContractAPIData(response.Data.FaresByType);
          this.isShowingAll = true;
          this.filterData();
          this.saveFareDataToWorkflow();

          console.log('🆕 新增模式：載入可用扣款項目成功');
          console.log('📊 載入的可用項目數量:', this.getTotalItemCount());
        } else {
          console.log('🆕 新增模式：API 沒有回傳可用扣款項目');
          this.messageService.infoBubble('目前沒有可用的扣款項目');
          this.initializeEmptyData();
        }

        this.loading = false;
        this.messageService.unblockUi();
      },
      error: (error) => {
        console.error('🆕 新增模式載入可用扣款項目失敗:', error);
        this.messageService.warnBubble('載入可用扣款項目失敗');
        this.loading = false;
        this.messageService.unblockUi();
        this.initializeEmptyData();
      }
    });

    this.subscriptions.push(subscription);
  }



  // 🆕 新增：處理新增模式的 API 資料
  private processNewContractAPIData(faresByType: any): Record<string, FareItem[]> {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    const processedData: Record<string, FareItem[]> = { A: [], B: [], C: [], D: [], E: [] };

    console.log('🆕 處理新增模式 API 資料...');

    capTypes.forEach(capType => {
      if (Array.isArray(faresByType[capType])) {
        console.log(`📊 新增模式處理 ${capType} 類型，共 ${faresByType[capType].length} 筆`);

        processedData[capType] = faresByType[capType].map((item: FareItem, index: number) => {
          // 🎯 新增模式：所有項目都是未選中的可用項目
          const processedItem = {
            ...item,
            id: `temp_new_${capType}_${item.cap_item}_${Date.now()}_${index}`, // 生成新的臨時 ID
            cap_type: item.cap_type || capType,
            is_selected: false, // 🎯 新增模式預設都是未選中
            data_source: 'APS_AVAILABLE', // 標記為可用項目
            _status: undefined, // 新增模式初始無狀態
            _originalSelected: false, // 新增模式原始都是未選中
            _originalData: { ...item }
          } as FareItem;

          console.log(`🆕 新增模式項目 ${item.cap_item}: ID=${processedItem.id}`);

          return processedItem;
        });

        console.log(`📊 新增模式 ${capType} 類型處理完成: ${processedData[capType].length} 筆`);
      }
    });

    return processedData;
  }

  private validateAndFixData(data: any): Record<string, FareItem[]> {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    const validatedData: Record<string, FareItem[]> = { A: [], B: [], C: [], D: [], E: [] };

    console.log('🔍 驗證和修復暫存資料...');

    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item && item.cap_type && capTypes.includes(item.cap_type)) {

          // 🎯 關鍵修改：確保 _originalSelected 存在
          if (typeof item._originalSelected === 'undefined') {
            item._originalSelected = item.data_source === 'CONTRACT_EXISTING' && item.is_selected;
            console.warn(`⚠️ 補充暫存資料 ${item.cap_item}: 設定 _originalSelected = ${item._originalSelected}`);
          }

          // 🎯 關鍵修改：修正狀態邏輯
          let validStatus = item._status;

          if (item.is_selected && !validStatus && item._originalSelected) {
            validStatus = 'original';
            console.warn(`⚠️ 修復暫存資料 ${item.cap_item}: 已勾選的原有項目補上 original 狀態`);
          }

          const validatedItem: FareItem = {
            ...item,
            id: item.id ? item.id.toString() : `missing_id_${Date.now()}_${Math.random()}`,
            cap_type: item.cap_type,
            _status: validStatus,
            _originalSelected: item._originalSelected,
            _originalData: item._originalData || { ...item }
          };

          validatedData[item.cap_type].push(validatedItem);
        }
      });
    }

    return validatedData;
  }

  // 從 API 載入扣款資料（簡化版）
  private loadFareDataFromAPI(): void {
    console.log('🔄 載入扣款資料，talent_id:', this.currentTalentId);

    this.loading = true;
    this.messageService.blockUi();

    const subscription = this.tls13010Service.queryTLS13010Fare({
      talentId: this.currentTalentId, // 🎯 直接傳遞，空字串也沒關係
      showAll: true  // 固定載入全部資料
    }).subscribe({
      next: (response) => {
        console.log('API 回傳的扣款資料:', response);

        if (response && response.Data && response.Data.FaresByType) {
          // 🎯 處理 API 資料，設定正確的初始狀態
          this.originalFareData = this.processAPIData(response.Data.FaresByType);
          this.isShowingAll = true;  // 標記為已載入全部資料
          this.filterData();
          this.saveFareDataToWorkflow();

          const workflowData = this.contractFlowService.getCurrentData();
          const isNewContract = workflowData.queryRowData?._isNewContract;

          if (isNewContract) {
            console.log('🆕 新增模式：載入可用扣款項目成功');
          } else {
            console.log('📝 編輯模式：載入既有扣款資料成功');
          }
        } else {
          console.log('API 沒有回傳扣款資料');
          this.messageService.infoBubble('沒有找到扣款資料');
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

  // 🎯 新增：處理 API 資料，設定正確的初始狀態
  private processAPIData(faresByType: any): Record<string, FareItem[]> {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    const processedData: Record<string, FareItem[]> = { A: [], B: [], C: [], D: [], E: [] };

    console.log('🔄 處理 API 資料，設定正確的初始狀態...');
    console.log('🔍 API 原始資料檢查:', faresByType);

    capTypes.forEach(capType => {
      if (Array.isArray(faresByType[capType])) {
        console.log(`📊 處理 ${capType} 類型，共 ${faresByType[capType].length} 筆`);

        processedData[capType] = faresByType[capType].map((item: FareItem, index: number) => {

          // 🔍 先記錄原始資料
          console.log(`📋 ${capType}[${index}] ${item.cap_item}:`);
          console.log(`   - 原始 ID: ${item.id} (type: ${typeof item.id})`);
          console.log(`   - data_source: ${item.data_source}`);
          console.log(`   - is_selected: ${item.is_selected}`);

          // 🎯 關鍵修改：記錄初始選中狀態
          const originalSelected = item.is_selected || false;

          // 🎯 關鍵修改：正確設定初始 _status
          let initialStatus: 'original' | 'new' | 'modified' | 'deleted' | undefined = undefined;

          if (originalSelected && item.data_source === 'CONTRACT_EXISTING') {
            // 合約原有且已選中的項目
            initialStatus = 'original';
            console.log(`📋 ${item.cap_item} (${capType}) - 合約原有資料，狀態: original`);
          }

          // 🎯 關鍵修正：根據 data_source 決定 ID 處理
          let finalId: string;

          if (item.data_source === 'CONTRACT_EXISTING') {
            // 合約已有的項目：保持原有 ID
            if (item.id && item.id.toString() !== '0' && item.id.toString() !== '') {
              finalId = item.id.toString();
              console.log(`🔑 保持合約原有 ID: ${finalId} (${item.cap_item})`);
            } else {
              console.error(`❌ 合約項目 ${item.cap_item} 缺少有效 ID！原始 ID: ${item.id}`);
              finalId = `error_missing_id_${item.cap_item}_${Date.now()}`;
            }
          } else {
            // APS 可用項目：生成臨時 ID
            finalId = `temp_${this.currentTalentId}_${capType}_${item.cap_item}_${Date.now()}_${index}`;
            console.log(`🆕 生成臨時 ID: ${finalId} (${item.cap_item})`);
          }

          const processedItem = {
            ...item,
            id: finalId,  // 🎯 使用正確的 ID
            cap_type: item.cap_type || capType,
            _status: initialStatus,

            // 🎯 新增：記錄初始狀態用於後續比較
            _originalSelected: originalSelected,
            _originalData: { ...item }
          } as FareItem;

          console.log(`✅ 處理完成 ${item.cap_item}: ID=${finalId}, _status=${initialStatus}, _originalSelected=${originalSelected}`);

          return processedItem;
        });

        console.log(`📊 ${capType} 類型處理完成: ${processedData[capType].length} 筆`);
      }
    });

    // 🔍 驗證處理結果
    this.verifyProcessedData(processedData);

    return processedData;
  }

  private verifyProcessedData(processedData: Record<string, FareItem[]>): void {
    console.log('=== 🔍 處理結果驗證 ===');

    Object.keys(processedData).forEach(capType => {
      if (processedData[capType].length > 0) {
        console.log(`📊 ${capType} 類型驗證:`);

        processedData[capType].forEach((item, index) => {
          const idStr = item.id?.toString() || '';

          if (item.data_source === 'CONTRACT_EXISTING') {
            if (idStr.startsWith('temp_') || idStr.includes('new')) {
              console.error(`❌ 合約項目 ${item.cap_item} 的 ID 不正確: ${item.id}`);
            } else {
              console.log(`✅ 合約項目 ${item.cap_item} ID 正確: ${item.id}`);
            }
          } else if (item.data_source === 'APS_AVAILABLE') {
            if (!idStr.startsWith('temp_')) {
              console.warn(`⚠️ APS 項目 ${item.cap_item} 的 ID 格式異常: ${item.id}`);
            } else {
              console.log(`✅ APS 項目 ${item.cap_item} 臨時 ID 正確: ${item.id}`);
            }
          }
        });
      }
    });
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
    console.log('【DEBUG】originalFareData:', this.originalFareData);
    this.initializeDataStructure();

    Object.keys(this.originalFareData).forEach(capType => {
      if (!Array.isArray(this.originalFareData[capType])) {
        this.originalFareData[capType] = [];
      }

      let filteredData = [...this.originalFareData[capType]];

      // 根據常用/全部模式過濾
      if (this.showMode === 'common') {
        // 常用模式：顯示契約已有的項目 + 常用項目
        filteredData = filteredData.filter(item =>
          item.data_source === 'CONTRACT_EXISTING' || item.is_commonly_used === 'Y'
        );
      }
      // 全部模式：顯示所有項目（契約已有的 + 常用 + 不常用）

      // 根據已勾選模式過濾
      if (this.showOnlySelected) {
        // 只顯示已勾選的項目
        filteredData = filteredData.filter(item => item.is_selected);
      }

      this.fareData[capType] = filteredData;
    });
  }

  private cleanObjectKeys(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanObjectKeys(item));
    }

    if (typeof obj === 'object') {
      const cleaned: any = {};

      Object.keys(obj).forEach(key => {
        // ✅ 過濾空 key 和無效 key
        if (key && key.trim() !== '' && key !== 'undefined' && key !== 'null') {
          const value = obj[key];

          // 遞迴清理嵌套物件
          if (typeof value === 'object' && value !== null) {
            cleaned[key] = this.cleanObjectKeys(value);
          } else {
            cleaned[key] = value;
          }
        } else {
          console.warn(`⚠️ 發現並移除空/無效 key: "${key}"`);
        }
      });

      return cleaned;
    }

    return obj;
  }

  // ✅ 新增：清理扣款項目用於儲存
  private cleanFareItemForStorage(item: FareItem): FareItem {
    // 🎯 修正：明確列出所有業務欄位，避免遺漏
    const cleanedItem: FareItem = {
      // 基本資訊
      id: item.id,
      cap_item: item.cap_item,
      cap_name: item.cap_name,
      cap_type: item.cap_type,
      is_selected: item.is_selected,
      data_source: item.data_source,
      talent_id: item.talent_id,
      is_new_item: item.is_new_item,

      // 🎯 重點：明確保留所有日期和業務欄位
      tpy_bdate: item.tpy_bdate,
      tpy_edate: item.tpy_edate,
      tpy_type: item.tpy_type,
      tpy_qty: item.tpy_qty,
      tpy_unitamt: item.tpy_unitamt,
      tpy_amount: item.tpy_amount,
      tpy_totalamt: item.tpy_totalamt,
      tpy_rate: item.tpy_rate,
      tpy_1stamt: item.tpy_1stamt,
      down_payment: item.down_payment,
      period_nos: item.period_nos,

      // 🔥 關鍵修正：確保這兩個欄位被保留
      day_account: item.day_account,
      interval: item.interval,

      gui_flag: item.gui_flag,
      org_id: item.org_id,

      // 系統欄位
      _status: item._status,
      _originalSelected: item._originalSelected,
      _originalData: item._originalData,

      // 🎯 新增：保留其他可能的業務欄位
      cap_saletype: item.cap_saletype,
      edc_bank: item.edc_bank,
      instms_type: item.instms_type,
      pay_no: item.pay_no,
      is_commonly_used: item.is_commonly_used,
      cap_tax_type: item.cap_tax_type,
      acc_no: item.acc_no
    };

    console.log(`🔍 清理項目 ${item.cap_item}:`, {
      原始day_account: item.day_account,
      清理後day_account: cleanedItem.day_account,
      原始interval: item.interval,
      清理後interval: cleanedItem.interval,
      原始gui_flag: item.gui_flag,
      清理後gui_flag: cleanedItem.gui_flag
    });

    return cleanedItem;
  }


  private saveFareDataToWorkflow(): void {
    try {
      console.log('💾 準備儲存暫存資料...');

      let totalItems = 0;
      let selectedItems = 0;

      // 🎯 合併成陣列格式，但保留 cap_type 資訊
      const mergedFareItems: FareItem[] = [];
      Object.keys(this.originalFareData).forEach(capType => {
        if (!Array.isArray(this.originalFareData[capType])) {
          console.warn(`⚠️ 修正儲存資料：${capType} 不是陣列，重置為空陣列`);
          this.originalFareData[capType] = [];
        } else {
          totalItems += this.originalFareData[capType].length;
          const selected = this.originalFareData[capType].filter(item => item.is_selected);
          selectedItems += selected.length;

          // 🎯 確保每個項目都有 cap_type 並清理前端欄位
          this.originalFareData[capType].forEach(item => {
            if (!item.cap_type) {
              item.cap_type = capType;
            }

            // 🎯 清理前端專用欄位和空 key
            const cleanedItem = this.cleanFareItemForStorage(item);
            mergedFareItems.push(cleanedItem);
          });

          console.log(`📝 ${capType} 類型: ${this.originalFareData[capType].length} 筆 (選中 ${selected.length} 筆)`);
        }
      });

      console.log(`💾 總共要儲存 ${totalItems} 筆資料，其中 ${selectedItems} 筆已選中`);

      // 🎯 儲存清理後的陣列格式
      this.contractFlowService.saveStep2Data(mergedFareItems);
      console.log('✅ 已成功暫存扣款資料到工作流程');

      // 🎯 驗證儲存結果
      this.verifyStoredData();

    } catch (error) {
      console.error('❌ 儲存暫存資料時發生錯誤:', error);
      this.messageService.warnBubble('儲存暫存資料失敗');
    }
  }


  private verifyStoredData(): void {
    const savedData = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);
    console.log('🔍 驗證儲存結果:', {
      savedDataType: Array.isArray(savedData) ? '陣列' : typeof savedData,
      savedDataLength: Array.isArray(savedData) ? savedData.length : 0,
      originalDataLength: this.getTotalItemCount()
    });

    if (Array.isArray(savedData)) {
      const selectedInSaved = savedData.filter(item => item.is_selected).length;
      const selectedInOriginal = this.getTotalSelectedCount();

      if (selectedInSaved !== selectedInOriginal) {
        console.warn('⚠️ 儲存後的選中項目數量不匹配:', {
          saved: selectedInSaved,
          original: selectedInOriginal
        });
      }
    }
  }


  selectAllByType(capType: string): void {
    console.log(`🔄 ${capType} 類型全部選擇`);

    this.fareData[capType].forEach(item => {
      const wasSelected = item.is_selected;
      item.is_selected = true;

      // 🎯 只有狀態改變時才更新 _status
      if (!wasSelected) {
        // 原本沒勾選，現在勾選
        if (!item._status) {
          item._status = 'new';
          console.log(`✅ 項目 ${item.cap_item} 全部選擇，狀態: 無 → new`);
        } else if (item._status === 'deleted') {
          item._status = 'original';
          console.log(`✅ 項目 ${item.cap_item} 全部選擇，狀態: deleted → original`);
        }
      }
    });

    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
  }

  deselectAllByType(capType: string): void {
    console.log(`🔄 ${capType} 類型取消全部選擇`);

    this.fareData[capType].forEach(item => {
      const wasSelected = item.is_selected;
      item.is_selected = false;

      // 🎯 只有狀態改變時才更新 _status
      if (wasSelected) {
        // 原本有勾選，現在取消
        if (item._status === 'original' || item._status === 'modified') {
          item._status = 'deleted';
          console.log(`❌ 項目 ${item.cap_item} 取消選擇，狀態: ${item._status || 'original'} → deleted`);
        } else if (item._status === 'new') {
          delete item._status;
          console.log(`❌ 項目 ${item.cap_item} 取消選擇，狀態: new → 無狀態`);
        }
      }
    });

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
      newData: event.newData,
      // 🎯 特別檢查重要欄位
      oldFields: {
        tpy_bdate: event.oldData?.tpy_bdate,
        tpy_edate: event.oldData?.tpy_edate,
        day_account: event.oldData?.day_account,
        interval: event.oldData?.interval,
        tpy_type: event.oldData?.tpy_type,
        gui_flag: event.oldData?.gui_flag,
        org_id: event.oldData?.org_id
      },
      newFields: {
        tpy_bdate: event.newData?.tpy_bdate,
        tpy_edate: event.newData?.tpy_edate,
        day_account: event.newData?.day_account,
        interval: event.newData?.interval,
        tpy_type: event.newData?.tpy_type,
        gui_flag: event.newData?.gui_flag,
        org_id: event.newData?.org_id
      }
    });

    const { newData } = event;

    // A類型特殊處理：自動設定結束日期等於開始日期
    if (capType === 'A' && newData.tpy_bdate) {
      newData.tpy_edate = newData.tpy_bdate;
      console.log(`✅ A類型自動設定 tpy_edate = tpy_bdate: ${newData.tpy_edate}`);
    }

    // 🎯 關鍵修正：確保所有重要欄位都被正確保存
    const criticalFields = [
      'tpy_bdate', 'tpy_edate', 'tpy_type', 'tpy_qty', 'tpy_unitamt',
      'tpy_amount', 'tpy_totalamt', 'day_account', 'interval',
      'down_payment', 'period_nos', 'tpy_1stamt', 'gui_flag',
      'tpy_rate', 'org_id'
    ];

    criticalFields.forEach(field => {
      if (!newData[field] && event.oldData?.[field] !== undefined && event.oldData?.[field] !== null) {
        console.warn(`⚠️ ${field} 遺失，從舊資料復原:`, event.oldData[field]);
        newData[field] = event.oldData[field];
      }
    });

    // 🔥 強制檢查是否有變更
    const hasChanges = this.hasDataChanges(newData);
    // 🎯 直接用 data_source 判斷是否為合約原有項目
    const isContractExisting = newData.data_source === 'CONTRACT_EXISTING';

    // 🎯 狀態邏輯判定
    if (newData.is_selected) {
      // ✅ 被勾選
      if (isContractExisting) {
        // 原本就存在於合約的項目
        if (newData._status === 'deleted') {
          // 從刪除狀態恢復
          newData._status = hasChanges ? 'modified' : 'original';
          console.log(`✅ 項目 ${newData.cap_item} 恢復勾選，狀態: deleted → ${newData._status}`);
        } else {
          // 檢查資料是否有變更
          if (hasChanges) {
            newData._status = 'modified';
            console.log(`📝 項目 ${newData.cap_item} 資料已變更，狀態: → modified`);
          } else {
            newData._status = 'original';
            console.log(`✅ 項目 ${newData.cap_item} 無變更，狀態: → original`);
          }
        }
      } else {
        // 原本不存在於合約的項目 → 新增
        newData._status = 'new';
        console.log(`✅ 項目 ${newData.cap_item} 勾選，狀態: 無 → new`);
      }
    } else {
      // ❌ 取消勾選
      if (isContractExisting) {
        // 原本存在於合約的項目 → 刪除
        newData._status = 'deleted';
        console.log(`❌ 項目 ${newData.cap_item} 取消勾選，狀態: → deleted`);
      } else {
        // 原本不存在於合約的項目 → 回到無狀態
        delete newData._status;
        console.log(`❌ 項目 ${newData.cap_item} 取消勾選，狀態: new → 無狀態`);
      }
    }

    // 更新原始資料
    const originalIndex = this.originalFareData[capType].findIndex(item => item.id === newData.id);
    if (originalIndex > -1) {
      // 🎯 確保更新時保留所有欄位
      const updatedItem = {
        ...this.originalFareData[capType][originalIndex],
        ...newData,
        // 明確保留關鍵欄位
        tpy_bdate: newData.tpy_bdate,
        tpy_edate: newData.tpy_edate,
        day_account: newData.day_account,
        interval: newData.interval,
        tpy_type: newData.tpy_type,
        gui_flag: newData.gui_flag,
        org_id: newData.org_id
      };

      this.originalFareData[capType][originalIndex] = updatedItem;

      console.log('📝 更新原始資料:', {
        項目: newData.cap_item,
        更新後tpy_bdate: updatedItem.tpy_bdate,
        更新後tpy_edate: updatedItem.tpy_edate,
        更新後day_account: updatedItem.day_account,
        更新後interval: updatedItem.interval,
        更新後gui_flag: updatedItem.gui_flag
      });
    }

    this.saveFareDataToWorkflow();
  }

  onFareTableEdit(rowData: any, capType: string): void {
    console.log(`開始編輯 ${capType} 類型扣款資料:`, rowData);
  }

  onFareTableCancel(rowData: any, capType: string): void {
    console.log(`取消編輯 ${capType} 類型扣款資料:`, rowData);
  }

  onItemSelectionChange(capType: string): void {
    console.log(`🔄 ${capType} 類型項目選擇狀態改變`);

    this.fareData[capType].forEach(item => {
      // 🎯 直接用 data_source 判斷是否為合約原有項目
      const isContractExisting = item.data_source === 'CONTRACT_EXISTING';

      if (item.is_selected) {
        // ✅ 被勾選
        if (isContractExisting) {
          // 原本就存在於合約的項目
          if (item._status === 'deleted') {
            // 從刪除狀態恢復
            item._status = this.hasDataChanges(item) ? 'modified' : 'original';
            console.log(`✅ 項目 ${item.cap_item} 恢復勾選，狀態: deleted → ${item._status}`);
          } else {
            // 🔥 關鍵修正：檢查資料是否有變更
            if (this.hasDataChanges(item)) {
              item._status = 'modified';
              console.log(`📝 項目 ${item.cap_item} 資料已變更，狀態: → modified`);
            } else {
              item._status = 'original';
              console.log(`✅ 項目 ${item.cap_item} 無變更，狀態: → original`);
            }
          }
        } else {
          // 原本不存在於合約的項目 → 新增
          item._status = 'new';
          console.log(`✅ 項目 ${item.cap_item} 勾選，狀態: 無 → new`);
        }
      } else {
        // ❌ 取消勾選
        if (isContractExisting) {
          // 原本存在於合約的項目 → 刪除
          item._status = 'deleted';
          console.log(`❌ 項目 ${item.cap_item} 取消勾選，狀態: → deleted`);
        } else {
          // 原本不存在於合約的項目 → 回到無狀態
          delete item._status;
          console.log(`❌ 項目 ${item.cap_item} 取消勾選，狀態: new → 無狀態`);
        }
      }
    });

    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
  }

  // 🎯 新增：檢查資料是否有變更
  private hasDataChanges(item: FareItem): boolean {
    if (!item._originalData) {
      console.log(`⚠️ 項目 ${item.cap_item} 沒有原始資料，視為無變更`);
      return false;
    }

    // 🎯 擴充需要比較的欄位列表
    const editableFields = [
      'tpy_bdate', 'tpy_edate', 'tpy_type', 'tpy_qty', 'tpy_unitamt',
      'tpy_amount', 'tpy_totalamt', 'day_account', 'interval',
      'down_payment', 'period_nos', 'tpy_1stamt', 'gui_flag',
      'tpy_rate', 'org_id'
    ];

    for (const field of editableFields) {
      const currentValue = (item as any)[field];
      const originalValue = (item._originalData as any)[field];

      // 處理 null/undefined/空字串的比較
      const normalizedCurrent = this.normalizeValue(currentValue);
      const normalizedOriginal = this.normalizeValue(originalValue);

      if (normalizedCurrent !== normalizedOriginal) {
        console.log(`📝 項目 ${item.cap_item} 欄位 ${field} 有變更:`, {
          原始: originalValue,
          目前: currentValue,
          標準化原始: normalizedOriginal,
          標準化目前: normalizedCurrent
        });
        return true;
      }
    }

    return false;
  }

  private normalizeValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    return String(value);
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

    this.router.navigate(['account/tls/tls13010next2']);
    // this.messageService.infoBubble('進入下一步：抽成設定');
  }

  override onCancel(): void {
    console.log('🔙 準備回到前一步...');
    this.saveFareDataToWorkflow();
    this.router.navigate(['account/tls/tls13010cru']);
    // this.messageService.infoBubble('已返回合約資訊頁面');
  }

  onRealCancel(): void {
    if (confirm('確定要離開契約編輯流程嗎？所有暫存資料將會保留。')) {
      this.saveFareDataToWorkflow();
      this.router.navigate(['account/tls/tls13010']);
      this.messageService.infoBubble('已離開契約編輯流程');
    }
  }

  onClearAndExit(): void {
    if (confirm('確定要清空所有暫存資料並離開嗎？此操作無法復原。')) {
      this.contractFlowService.clearTempData();
      this.router.navigate(['account/tls/tls13010']);
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
      // this.messageService.successBubble('扣款資料已儲存');
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
      this.loadFareDataFromAPI();
      this.messageService.infoBubble('已重新載入資料');
    }
  }

  saveAllChanges(): void {
    this.saveFareDataToWorkflow();
    // this.messageService.successBubble('所有變更已儲存');
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
    let mode = '';

    // 常用/全部模式
    if (this.showMode === 'common') {
      mode += '契約項目 + 常用項目';
    } else {
      mode += '全部項目';
    }

    // 已勾選模式
    if (this.showOnlySelected) {
      mode += '（已勾選）';
    }

    return mode;
  }

  // 切換常用/全部模式
  toggleCommonMode(): void {
    if (this.showMode === 'common') {
      // 從常用模式切換到全部模式
      this.showMode = 'all';
    } else {
      // 從全部模式切換到常用模式
      this.showMode = 'common';
    }
    this.filterData();
  }

  // 切換已勾選模式
  toggleSelectedMode(): void {
    this.showOnlySelected = !this.showOnlySelected;
    this.filterData();
  }

  // 取得常用模式按鈕文字
  getCommonModeText(): string {
    return this.showMode === 'common' ? '顯示全部項目' : '只顯示常用';
  }

  // 取得已勾選模式按鈕文字
  getSelectedModeText(): string {
    return this.showOnlySelected ? '顯示全部項目' : '只顯示已勾選';
  }
}
