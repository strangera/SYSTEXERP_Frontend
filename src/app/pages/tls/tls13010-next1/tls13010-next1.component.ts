import { ColumnDef } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
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
  styleUrls: ['./tls13010-next1.component.scss']
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
      type: 'date',
      editable: true,
      autoWidth: true,
      dateFormat: 'year-month'
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
    console.log('🚀 開始載入工作流程資料...');

    const workflowData = this.contractFlowService.getCurrentData();
    console.log('📋 工作流程資料:', workflowData);

    if (workflowData.queryRowData?.talent_id) {
      this.currentTalentId = workflowData.queryRowData.talent_id;
      this.currentContractData = workflowData.queryRowData;

      console.log('✅ 取得合約ID:', this.currentTalentId);

      // 優先使用 CRU 頁面編輯後的資料
      const step1Data = this.contractFlowService.getStep1Data();
      console.log('📝 Step1 編輯資料:', step1Data);

      // 準備合約資訊
      const contractInfo = {
        talent_id: step1Data?.talent_id || this.currentContractData.talent_id || '-',
        apply_no: step1Data?.apply_no || this.currentContractData.apply_no || '-',
        tlt_name: step1Data?.tlt_name || this.currentContractData.tlt_name || '-',
        VEN_Name: step1Data?.VEN_Name || this.currentContractData.VEN_Name || '-',
        ven_uniform: step1Data?.ven_uniform || this.currentContractData.ven_uniform || '-',
        contract_subno: step1Data?.contract_subno || this.currentContractData.contract_subno || '-',
        tlt_term_type: (step1Data?.tlt_term_type || this.currentContractData.tlt_term_type || '').toString().trim() || '-',
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

      this.initializeDataStructure();

      // 🔧 修復：檢查暫存資料的邏輯
      console.log('🔍 檢查是否有暫存的扣款資料...');
      const savedFareData = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);
      console.log('📦 取得的暫存資料:', savedFareData);

      // ✅ 修復：正確判斷陣列格式的資料是否為空
      let isAllEmpty = false;

      if (!savedFareData) {
        isAllEmpty = true;
        console.log('❌ 沒有暫存資料');
      } else if (Array.isArray(savedFareData)) {
        isAllEmpty = savedFareData.length === 0;
        console.log(`📊 暫存資料是陣列格式，長度: ${savedFareData.length}`);
      } else if (typeof savedFareData === 'object') {
        // 物件格式的向下相容
        isAllEmpty = Object.values(savedFareData).every(arr => !Array.isArray(arr) || arr.length === 0);
        console.log('📊 暫存資料是物件格式');
      } else {
        isAllEmpty = true;
        console.log('❌ 暫存資料格式不正確');
      }

      if (isAllEmpty) {
        console.log('📭 沒有暫存資料，從 API 載入');
        this.loadFareDataFromAPI();
      } else {
        console.log('📦 發現暫存資料，載入暫存資料');
        try {
          this.originalFareData = this.validateAndFixData(savedFareData);
          this.filterData();
          console.log('✅ 暫存資料載入完成');
          console.log('📊 載入的資料詳情:', this.originalFareData);
        } catch (error) {
          console.error('❌ 暫存資料處理失敗，重新載入:', error);
          this.loadFareDataFromAPI();
        }
      }
    } else {
      console.warn('❌ 沒有 talent_id，重導向到前一步');
      this.router.navigate(['account/tls/tls13010cru']);
    }
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
    if (!this.currentTalentId) {
      console.warn('沒有 talent_id，無法載入扣款資料');
      return;
    }

    this.loading = true;
    this.messageService.blockUi();

    const subscription = this.tls13010Service.queryTLS13010Fare({
      talentId: this.currentTalentId,
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
          // this.messageService.successBubble('扣款資料載入成功');
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
    const {
      // 🗑️ 移除前端專用欄位（但暫存時保留 _status 等追蹤欄位）
      _originalData,
      _originalSelected,
      ...itemForStorage
    } = item;

    // ✅ 清理空 key
    const cleanedItem = this.cleanObjectKeys(itemForStorage);

    return cleanedItem as FareItem;
  }

  // ✅ 修改現有的 saveFareDataToWorkflow 方法
  private saveFareDataToWorkflow(): void {
    try {
      console.log('💾 準備儲存暫存資料...');

      let totalItems = 0;
      let selectedItems = 0;

      // ✅ 合併成陣列格式，但保留 cap_type 資訊
      const mergedFareItems: FareItem[] = [];
      Object.keys(this.originalFareData).forEach(capType => {
        if (!Array.isArray(this.originalFareData[capType])) {
          console.warn(`⚠️ 修正儲存資料：${capType} 不是陣列，重置為空陣列`);
          this.originalFareData[capType] = [];
        } else {
          totalItems += this.originalFareData[capType].length;
          const selected = this.originalFareData[capType].filter(item => item.is_selected);
          selectedItems += selected.length;

          // ✅ 確保每個項目都有 cap_type 並清理前端欄位
          this.originalFareData[capType].forEach(item => {
            if (!item.cap_type) {
              item.cap_type = capType;
            }

            // ✅ 清理前端專用欄位和空 key
            const cleanedItem = this.cleanFareItemForStorage(item);
            mergedFareItems.push(cleanedItem);
          });

          console.log(`📝 ${capType} 類型: ${this.originalFareData[capType].length} 筆 (選中 ${selected.length} 筆)`);
        }
      });

      console.log(`💾 總共要儲存 ${totalItems} 筆資料，其中 ${selectedItems} 筆已選中`);

      // ✅ 儲存清理後的陣列格式
      this.contractFlowService.saveStep2Data(mergedFareItems);
      console.log('✅ 已成功暫存扣款資料到工作流程');
    } catch (error) {
      console.error('❌ 儲存暫存資料時發生錯誤:', error);
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
      newData: event.newData
    });

    const { newData } = event;

    // 🔥 強制檢查是否有變更
    const hasChanges = this.hasDataChanges(newData);
    const originallySelected = newData._originalSelected || false;

    if (hasChanges && originallySelected && newData.is_selected) {
      // 有變更的既有項目
      newData._status = 'modified';
      console.log(`📝 ${newData.cap_item} 編輯後有變更: → modified`);
    } else if (!hasChanges && originallySelected && newData.is_selected) {
      // 沒變更的既有項目
      newData._status = 'original';
      console.log(`📝 ${newData.cap_item} 編輯後無變更: → original`);
    } else if (!originallySelected && newData.is_selected) {
      // 新增的項目
      newData._status = 'new';
      console.log(`📝 ${newData.cap_item} 新增項目編輯: → new`);
    }

    // 更新原始資料
    const originalIndex = this.originalFareData[capType].findIndex(item => item.id === newData.id);
    if (originalIndex > -1) {
      this.originalFareData[capType][originalIndex] = { ...newData };
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
      const originallySelected = item._originalSelected || false;

      if (item.is_selected) {
        // ✅ 被勾選
        if (originallySelected) {
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
        if (originallySelected) {
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

    // 定義需要比較的欄位
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
          目前: currentValue
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
    this.messageService.infoBubble('已返回合約資訊頁面');
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

  // debugCheckSavedData(): void {
  //   console.log('=== 🔍 暫存資料檢查 ===');

  //   // 1. 檢查目前選中的項目
  //   const selectedItems: any[] = [];
  //   Object.keys(this.originalFareData).forEach(capType => {
  //     const selected = this.originalFareData[capType].filter(item => item.is_selected);
  //     if (selected.length > 0) {
  //       selectedItems.push(...selected.map(item => ({
  //         cap_type: capType,
  //         cap_item: item.cap_item,
  //         cap_name: item.cap_name,
  //         is_selected: item.is_selected,
  //         _status: item._status
  //       })));
  //     }
  //   });

  //   console.log('📋 目前選中項目:', selectedItems);

  //   // 2. 檢查工作流程中的暫存
  //   const savedData = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);
  //   console.log('💾 工作流程暫存:', savedData);
  //   console.log('💾 暫存資料類型:', Array.isArray(savedData) ? '陣列' : typeof savedData);

  //   if (Array.isArray(savedData)) {
  //     const savedSelected = savedData.filter(item => item.is_selected);
  //     console.log('💾 暫存中選中的項目:', savedSelected);
  //   }

  //   // 3. 檢查 sessionStorage
  //   const sessionData = sessionStorage.getItem('TLS13010_CONTRACT_FLOW');
  //   if (sessionData) {
  //     const parsed = JSON.parse(sessionData);
  //     console.log('🗄️ SessionStorage step2:', parsed.contractData?.step2);
  //   }

  //   this.messageService.infoBubble(
  //     `選中 ${selectedItems.length} 個項目，暫存${savedData ? '有資料' : '無資料'}`
  //   );
  // }

  // debugStatusDistribution(): void {
  //   console.log('=== 🔍 狀態分布檢查 ===');

  //   Object.keys(this.originalFareData).forEach(capType => {
  //     const items = this.originalFareData[capType];
  //     const statusCount = {
  //       no_status: 0,
  //       original: 0,
  //       new: 0,
  //       modified: 0,
  //       deleted: 0
  //     };

  //     const selectedItems: any[] = [];

  //     items.forEach(item => {
  //       const status = item._status || 'no_status';
  //       statusCount[status]++;

  //       if (item.is_selected) {
  //         selectedItems.push({
  //           cap_item: item.cap_item,
  //           status: item._status || 'no_status'
  //         });
  //       }
  //     });

  //     if (items.length > 0) {
  //       console.log(`📊 ${capType} 類型狀態分布:`, statusCount);
  //       console.log(`✅ ${capType} 選中項目:`, selectedItems);
  //     }
  //   });

  //   this.messageService.infoBubble('狀態分布已輸出到 console');
  // }

  // debugCheckIds(): void {
  //   console.log('=== 🔍 ID 檢查 ===');

  //   Object.keys(this.originalFareData).forEach(capType => {
  //     const items = this.originalFareData[capType];

  //     if (items.length > 0) {
  //       console.log(`📊 ${capType} 類型 ID 檢查:`);

  //       items.slice(0, 5).forEach((item, index) => {
  //         console.log(`   ${index + 1}. ID: ${item.id} (${typeof item.id}) - ${item.cap_item}`);
  //       });

  //       // 檢查是否有重複 ID
  //       const ids = items.map(item => item.id);
  //       const uniqueIds = new Set(ids);

  //       if (ids.length !== uniqueIds.size) {
  //         console.warn(`⚠️ ${capType} 類型有重複 ID！總數: ${ids.length}, 唯一: ${uniqueIds.size}`);
  //       } else {
  //         console.log(`✅ ${capType} 類型 ID 唯一性檢查通過`);
  //       }
  //     }
  //   });
  // }
}
