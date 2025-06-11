import { Column } from './../../../shared/componentkit/table/table.model';
import { ColumnDef } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS13010Service } from '../../../service/API/tls/tls13010.service';
import { ContractFlowService, WorkflowStep } from '../../../service/API/tls/tls13010contract-flow/contract-flow.service';

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
  cap_item: string;           // 扣款代碼
  cap_name: string;           // 扣款名稱
  tpy_bdate?: string;         // 扣款起始年月
  tpy_edate?: string;         // 扣款結束年月
  tpy_type?: string;          // 費用計算方式
  tpy_qty?: number;           // 數量
  tpy_unitamt?: number;       // 單價
  tpy_amount?: number;        // 每月扣款金額
  tpy_totalamt?: number;      // 扣款總金額
  day_account?: string;       // 是否以日計算
  interval?: number;          // 計算週期
  down_payment?: number;      // 頭期款
  period_nos?: number;        // 期數
  tpy_1stamt?: number;        // 首期金額
  cap_saletype?: string;      // 銷售類型
  edc_bank?: string;          // 收單行
  instms_type?: string;       // 分期期數
  pay_no?: string;            // 扣款別編號
  gui_flag?: string;          // 是否開立發票
  tpy_rate?: number;          // 費用計算比率
  org_id?: string;            // 組織代碼
  is_commonly_used?: string;  // 是否為常用
  cap_tax_type?: string;      // 課稅別
  acc_no?: string;            // 會計科目

  // 新增的 API 標記欄位
  data_source: string;        // CONTRACT_EXISTING, APS_COMMON, APS_ALL
  is_selected: boolean;       // 是否已選取
  is_new_item: boolean;       // 是否為新項目

  // 保留原有的狀態欄位
  _status?: 'new' | 'modified' | 'deleted' | 'original';
}

interface ContractInfo {
  id: string;
  talent_id: string;
  apply_no: string;
  tlt_name: string;
  VEN_Name: string;
}

@Component({
  selector: 'app-tls13010-next1',
  templateUrl: './tls13010-next1.component.html',
  styleUrls: ['./tls13010-next1.component.scss']
})
export class TLS13010Next1Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  // 顯示模式控制
  showOnlyCommonlyUsed = true; // 預設顯示常用項目
  showOnlySelected = false; // 是否只顯示已勾選項目
  isShowingAll = false; // 追蹤目前是否載入全部資料

  // 當前合約資料
  currentTalentId: string = '';
  currentContractData: any = null;
  contractInfoData: ContractInfo[] = [];



  // 合約資訊表格欄位定義
  contractInfoColumns: ColumnDef[] = [
    { field: 'talent_id', header: '合約編號', type: 'text', editable: false, style: 'min-width: 150px' },
    { field: 'apply_no', header: '招募編號', type: 'text', editable: false, style: 'min-width: 150px' },
    { field: 'tlt_name', header: '櫃位名稱', type: 'text', editable: false, style: 'min-width: 200px' },
    { field: 'VEN_Name', header: '廠商名稱', type: 'text', editable: false, style: 'min-width: 200px' }
  ];

  // A 類型（一次扣款
  deductionAColumns: ColumnDef[] = [
    {
      field: 'is_selected',
      header: '選取',
      type: 'checkbox',
      editable: true,
      // width: '60px'
      autoWidth: true  // 🔧 使用類型預設寬度
    },
    {
      field: 'cap_item',
      header: '代號',
      type: 'text',
      editable: false,
      autoWidth: true  // 🔧 使用類型預設寬度
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
      autoWidth: true
    },
    {
      field: 'tpy_type',
      header: '單位',
      type: 'text',
      editable: true,
      width: '70px'   // 🔧 單位很短
    },
    {
      field: 'tpy_unitamt',
      header: '單價',
      type: 'number',
      editable: true,
      width: '90px'   // 🔧 價格
    },
    {
      field: 'tpy_qty',
      header: '數量',
      type: 'number',
      editable: true,
      width: '70px'   // 🔧 單位很短
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
      width: '80px'  // 🔧 縮小核取方塊
    },
    {
      field: 'cap_item',
      header: '扣款代號',
      type: 'text',
      editable: false,
      width: '100px'  // 🔧 代號適中寬度
    },
    {
      field: 'cap_name',
      header: '扣款名稱',
      type: 'text',
      editable: false,
      minWidth: '120px',  // 🔧 主要欄位使用彈性寬度
      flex: 2
    },
    {
      field: 'tpy_bdate',
      header: '扣款起始年月',
      type: 'date',
      editable: true,
      width: '130px'  // 🔧 日期欄位適中
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'date',
      editable: true,
      width: '130px'  // 🔧 與起始日期同寬
    },
    {
      field: 'tpy_type',
      header: '單位',
      type: 'dropdown',
      editable: true,
      options: [
        { label: '坪數', value: '01' },
        { label: '收銀機台數', value: '02' },
        { label: '人數', value: '03' },
        { label: '度數', value: '04' },
        { label: '每坪每天', value: '05' },
        { label: '線數', value: '06' },
      ],
      autoWidth: true,
    },
    {
      field: 'tpy_unitamt',
      header: '單價',
      type: 'number',
      editable: true,
      width: '90px'   // 🔧 數字欄位
    },
    {
      field: 'tpy_qty',
      header: '數量',
      type: 'number',
      editable: true,
      width: '70px'   // 🔧 數量通常不大
    },
    {
      field: 'tpy_amount',
      header: '扣款金額(未稅)',
      type: 'number',
      editable: true,
      width: '120px'  // 🔧 重要金額欄位稍寬
    },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: true,
      width: '110px',  // 🔧 下拉選單適中
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
      width: '110px',  // 🔧 下拉選單適中
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
      width: '120px'   // 🔧 較長標題給適當寬度
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
      flex: 2           // 🔧 主要欄位彈性寬度
    },
    {
      field: 'tpy_bdate',
      header: '扣款起始年月',
      type: 'date',
      editable: true,
      width: '130px'
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'date',
      editable: true,
      width: '130px'
    },
    {
      field: 'tpy_totalamt',
      header: '總金額',
      type: 'number',
      editable: true,
      width: '100px'    // 🔧 重要金額欄位
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
      width: '70px'     // 🔧 期數通常是小數字
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
      flex: 1           // 🔧 次要彈性欄位
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

  // D 類型（比率分攤）- 你已經完成的版本
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
      width: '130px'
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'date',
      editable: true,
      width: '130px'
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
        // 🔧 預留給未來 API 載入的選項
        // { label: '102220', value: '102220' },
        // { label: '102221', value: '102221' },
        // { label: '102222', value: '102222' }
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

  // E 類型（活動扣款）- 與 D 類型相同結構
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
      flex: 2           // 🔧 主要欄位彈性寬度
    },
    {
      field: 'tpy_bdate',
      header: '扣款起始年月',
      type: 'date',
      editable: true,
      width: '130px'
    },
    {
      field: 'tpy_edate',
      header: '扣款結束年月',
      type: 'date',
      editable: true,
      width: '130px'
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
        // 🔧 預留給未來 API 載入的選項
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
  // 原始資料（用於篩選）
  originalFareData: { [key: string]: FareItem[] } = {
    'A': [],
    'B': [],
    'C': [],
    'D': [],
    'E': []
  };

  // 顯示的資料（篩選後）
  fareData: { [key: string]: FareItem[] } = {
    'A': [],
    'B': [],
    'C': [],
    'D': [],
    'E': []
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

    // 🏗️ 先初始化資料結構
    this.initializeDataStructure();

    this.initializePage('TLS13010', this.dataForm);
    this.loadWorkflowData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // 載入工作流程資料 - 準備合約資訊
  // private loadWorkflowData(): void {
  //   const workflowData = this.contractFlowService.getCurrentData();
  //   console.log('載入工作流程資料:', workflowData);

  //   if (workflowData.queryRowData?.talent_id) {
  //     this.currentTalentId = workflowData.queryRowData.talent_id;
  //     this.currentContractData = workflowData.queryRowData;

  //     // 準備合約資訊資料給表格使用
  //     this.contractInfoData = [{
  //       id: '1',
  //       talent_id: this.currentContractData.talent_id || '-',
  //       apply_no: this.currentContractData.apply_no || '-',
  //       tlt_name: this.currentContractData.tlt_name || '-',
  //       VEN_Name: this.currentContractData.VEN_Name || '-'
  //     }];

  //     // 🔧 確保資料結構正確初始化
  //     this.initializeDataStructure();

  //     // 載入已暫存的扣款資料
  //     const savedFareData = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);
  //     if (savedFareData && Object.keys(savedFareData).length > 0) {
  //       console.log('載入已暫存的扣款資料:', savedFareData);

  //       // 🔧 驗證並修正暫存資料格式
  //       this.originalFareData = this.validateAndFixData(savedFareData);
  //       this.filterData();
  //     } else {
  //       // 沒有暫存資料，從 API 載入（預設只載入常用）
  //       this.loadFareDataFromAPI(false);
  //     }
  //   } else {
  //     console.warn('沒有 talent_id，重導向到前一步');
  //     this.router.navigate(['/TLS/TLS13010CRU']);
  //   }
  // }

  // 修正 loadWorkflowData，加入更詳細的載入記錄
  private loadWorkflowData(): void {
    console.log('🚀 開始載入工作流程資料...');

    const workflowData = this.contractFlowService.getCurrentData();
    console.log('📋 工作流程資料:', workflowData);

    if (workflowData.queryRowData?.talent_id) {
      this.currentTalentId = workflowData.queryRowData.talent_id;
      this.currentContractData = workflowData.queryRowData;

      console.log('✅ 取得合約ID:', this.currentTalentId);

      // 準備合約資訊資料給表格使用
      this.contractInfoData = [{
        id: '1',
        talent_id: this.currentContractData.talent_id || '-',
        apply_no: this.currentContractData.apply_no || '-',
        tlt_name: this.currentContractData.tlt_name || '-',
        VEN_Name: this.currentContractData.VEN_Name || '-'
      }];

      // 確保資料結構正確初始化
      this.initializeDataStructure();

      // 載入已暫存的扣款資料
      console.log('🔍 檢查是否有暫存的扣款資料...');
      const savedFareData = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);

      if (savedFareData && Object.keys(savedFareData).length > 0) {
        console.log('📦 發現暫存的扣款資料:', savedFareData);
        console.log('暫存資料的類型:', typeof savedFareData);
        console.log('暫存資料是否為陣列:', Array.isArray(savedFareData));

        try {
          // 🔧 修正：檢查暫存資料格式並處理
          let processedData;

          if (Array.isArray(savedFareData)) {
            // 如果是陣列格式（舊版本錯誤格式），嘗試修正
            console.warn('⚠️ 發現陣列格式的暫存資料，嘗試修正...');
            if (savedFareData.length > 0 && savedFareData[0] && typeof savedFareData[0] === 'object') {
              // 如果陣列第一個元素是我們要的物件
              processedData = savedFareData[0];
            } else {
              console.error('❌ 無法修正陣列格式的暫存資料，重新從 API 載入');
              this.loadFareDataFromAPI(false);
              return;
            }
          } else if (savedFareData && typeof savedFareData === 'object') {
            // 正確的物件格式
            processedData = savedFareData;
          } else {
            console.error('❌ 暫存資料格式不正確，重新從 API 載入');
            this.loadFareDataFromAPI(false);
            return;
          }

          console.log('🔄 處理後的資料:', processedData);

          // 驗證並修正暫存資料格式
          this.originalFareData = this.validateAndFixData(processedData);

          // 檢查資料完整性
          const isDataValid = this.checkDataIntegrity();

          if (isDataValid) {
            console.log('✅ 暫存資料驗證通過，使用暫存資料');
            this.filterData();
          } else {
            console.warn('❌ 暫存資料驗證失敗，重新從 API 載入');
            this.loadFareDataFromAPI(false);
          }
        } catch (error) {
          console.error('❌ 處理暫存資料時發生錯誤:', error);
          console.warn('⚠️ 暫存資料處理失敗，重新從 API 載入');
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


  private checkDataIntegrity(): boolean {
    console.log('=== 詳細資料完整性檢查 ===');
    console.log('原始暫存資料:', JSON.stringify(this.originalFareData, null, 2));

    try {
      let hasValidData = false;
      let totalItems = 0;
      let isValid = true; // 🔧 新增：用來追蹤整體驗證狀態

      // 檢查整體結構
      if (!this.originalFareData || typeof this.originalFareData !== 'object') {
        console.error('❌ originalFareData 不是物件:', this.originalFareData);
        return false;
      }

      // 🔧 修正：使用 for...of 迴圈，讓 return 能正確運作
      for (const capType of Object.keys(this.originalFareData)) {
        const items = this.originalFareData[capType];
        console.log(`\n📋 檢查 ${capType} 類型:`);

        if (!Array.isArray(items)) {
          console.error(`❌ ${capType} 不是陣列:`, typeof items, items);
          isValid = false;
          break; // 🔧 使用 break 而不是 return
        }

        console.log(`✅ ${capType} 是陣列，長度: ${items.length}`);
        totalItems += items.length;

        if (items.length > 0) {
          hasValidData = true;

          // 檢查每個項目的詳細資訊
          for (let index = 0; index < items.length; index++) {
            const item = items[index];
            console.log(`  📝 ${capType}[${index}]:`, {
              id: item.id,
              cap_item: item.cap_item,
              cap_name: item.cap_name,
              data_source: item.data_source,
              is_selected: item.is_selected,
              is_new_item: item.is_new_item,
              _status: item._status
            });

            // 檢查必要欄位
            const missingFields = [];
            if (!item.data_source) missingFields.push('data_source');
            if (!item.cap_item) missingFields.push('cap_item');
            if (!item.cap_name) missingFields.push('cap_name');
            if (typeof item.is_selected !== 'boolean') missingFields.push('is_selected');
            if (typeof item.is_new_item !== 'boolean') missingFields.push('is_new_item');

            if (missingFields.length > 0) {
              console.warn(`⚠️ ${capType}[${index}] 缺少必要欄位:`, missingFields);
            }
          }
        } else {
          console.log(`📭 ${capType} 類型無資料`);
        }
      }

      console.log(`\n📊 總計: ${totalItems} 筆資料`);
      console.log('資料完整性檢查結果:', (hasValidData && isValid) ? '✅ 通過' : '❌ 失敗');
      console.log('==================');

      return hasValidData && isValid; // 🔧 確保方法最後有 return
    } catch (error) {
      console.error('❌ 資料完整性檢查發生錯誤:', error);
      return false;
    }
  }


  private initializeDataStructure(): void {
    // 🏗️ 確保資料結構正確初始化
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

  // private validateAndFixData(data: any): { [key: string]: FareItem[] } {
  //   console.log('驗證暫存資料格式:', data);

  //   const validatedData: { [key: string]: FareItem[] } = {
  //     'A': [],
  //     'B': [],
  //     'C': [],
  //     'D': [],
  //     'E': []
  //   };

  //   // 🔍 檢查並修正每個類型的資料
  //   Object.keys(validatedData).forEach(capType => {
  //     if (data[capType] && Array.isArray(data[capType])) {
  //       validatedData[capType] = data[capType].map((item: any) => ({
  //         ...item,
  //         // 🔧 確保必要欄位存在
  //         id: item.id || `${capType}_${Date.now()}_${Math.random()}`,
  //         cap_type: item.cap_type || capType,
  //         data_source: item.data_source || 'APS_COMMON',
  //         is_selected: Boolean(item.is_selected),
  //         is_new_item: Boolean(item.is_new_item),
  //         _status: item._status || 'original'
  //       }));
  //     } else {
  //       console.warn(`暫存資料中 ${capType} 類型格式不正確，使用空陣列`);
  //       validatedData[capType] = [];
  //     }
  //   });

  //   console.log('修正後的資料:', validatedData);
  //   return validatedData;
  // }

  private validateAndFixData(data: any): { [key: string]: FareItem[] } {
    console.log('驗證暫存資料格式:', data);

    const validatedData: { [key: string]: FareItem[] } = {
      'A': [],
      'B': [],
      'C': [],
      'D': [],
      'E': []
    };

    // 🔧 檢查資料結構
    if (!data || typeof data !== 'object') {
      console.error('❌ 暫存資料不是物件，使用空資料');
      return validatedData;
    }

    // 檢查是否為正確的格式 { A: [], B: [], C: [], D: [], E: [] }
    const hasCorrectStructure = Object.keys(validatedData).every(capType =>
      data.hasOwnProperty(capType)
    );

    if (!hasCorrectStructure) {
      console.error('❌ 暫存資料結構不正確，缺少必要的類型鍵值');
      return validatedData;
    }

    // 🔍 檢查並修正每個類型的資料
    Object.keys(validatedData).forEach(capType => {
      if (data[capType] && Array.isArray(data[capType])) {
        validatedData[capType] = data[capType].map((item: any) => {
          // 基本驗證
          if (!item || typeof item !== 'object') {
            console.warn(`⚠️ ${capType} 中發現無效項目:`, item);
            return null;
          }

          // 🔧 確保所有必要欄位存在
          const fixedItem: FareItem = {
            // 基本識別資訊
            id: item.id || `${capType}_${Date.now()}_${Math.random()}`,
            talent_id: item.talent_id || parseInt(this.currentTalentId) || 0,
            cap_type: item.cap_type || capType,
            cap_item: item.cap_item || '',
            cap_name: item.cap_name || '',

            // 業務欄位（可為空）
            tpy_bdate: item.tpy_bdate || null,
            tpy_edate: item.tpy_edate || null,
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

            // 🏷️ API 標記欄位（必須存在）
            data_source: item.data_source || 'APS_COMMON',
            is_selected: Boolean(item.is_selected),
            is_new_item: Boolean(item.is_new_item),

            // 狀態欄位
            _status: item._status || 'original'
          };

          return fixedItem;
        }).filter(item => item !== null); // 過濾掉無效項目
      } else {
        console.warn(`暫存資料中 ${capType} 類型格式不正確，使用空陣列`);
        validatedData[capType] = [];
      }
    });

    console.log('修正後的資料:', validatedData);
    return validatedData;
  }


  // 從 API 載入扣款資料
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
          // 🔧 確保 API 回傳的資料格式正確
          const apiData = response.Data.FaresByType;
          console.log('API 資料結構:', {
            type: typeof apiData,
            isArray: Array.isArray(apiData),
            keys: Object.keys(apiData),
            sample: apiData
          });

          // 直接使用 API 回傳的資料
          this.originalFareData = apiData;
          this.isShowingAll = showAll;
          this.filterData();

          // 🔧 確保儲存正確格式
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


  // 轉換 API 資料格式
  // private transformApiData(apiData: any): { [key: string]: FareItem[] } {
  //   const transformed: { [key: string]: FareItem[] } = {
  //     'A': [],
  //     'B': [],
  //     'C': [],
  //     'D': [],
  //     'E': []
  //   };

  //   Object.keys(apiData).forEach(capType => {
  //     if (transformed[capType] && Array.isArray(apiData[capType])) {
  //       transformed[capType] = apiData[capType].map((item: any, index: number) => ({
  //         id: item.id || `${capType}_${index}_${Date.now()}`,
  //         serialNumber: index + 1,
  //         isNew: false, // 從 API 載入的都是既有資料
  //         cap_item: item.cap_item || '',
  //         cap_name: item.cap_name || '',
  //         tpy_bdate: item.tpy_bdate || '',
  //         tpy_edate: item.tpy_edate || '',
  //         tpy_type: item.tpy_type || '',
  //         tpy_qty: item.tpy_qty || 0,
  //         tpy_unitamt: item.tpy_unitamt || 0,
  //         tpy_amount: item.tpy_amount || 0,
  //         tpy_totalamt: item.tpy_totalamt || 0,
  //         day_account: item.day_account || 'N',
  //         interval: item.interval || 1,
  //         down_payment: item.down_payment || 0,
  //         period_nos: item.period_nos || 0,
  //         tpy_1stamt: item.tpy_1stamt || 0,
  //         cap_saletype: item.cap_saletype || '',
  //         edc_bank: item.edc_bank || '',
  //         instms_type: item.instms_type || '',
  //         pay_no: item.pay_no || '',
  //         gui_flag: item.gui_flag || 'Y',
  //         tpy_rate: item.tpy_rate || 0,
  //         org_id: item.org_id || '102220',
  //         is_commonly_used: item.is_commonly_used || 'N',
  //         _status: 'original'
  //       }));
  //     }
  //   });

  //   console.log('轉換後的資料:', transformed);
  //   return transformed;
  // }

  // 更新篩選邏輯，配合新的欄位名稱
  filterData(): void {
    console.log('開始篩選資料，原始資料:', this.originalFareData);

    // 🔧 確保資料結構存在
    this.initializeDataStructure();

    Object.keys(this.originalFareData).forEach(capType => {
      // 🔒 安全檢查：確保原始資料是陣列
      if (!Array.isArray(this.originalFareData[capType])) {
        console.warn(`originalFareData[${capType}] 不是陣列，重置為空陣列`);
        this.originalFareData[capType] = [];
      }

      if (this.showOnlySelected) {
        // 只顯示已勾選的項目
        this.fareData[capType] = this.originalFareData[capType].filter(item =>
          item && item.is_selected
        );
      } else if (this.showOnlyCommonlyUsed) {
        // 顯示常用項目 + 契約已有項目
        this.fareData[capType] = this.originalFareData[capType].filter(item =>
          item && (item.data_source === 'CONTRACT_EXISTING' || item.data_source === 'APS_COMMON')
        );
      } else {
        // 顯示所有項目
        this.fareData[capType] = [...this.originalFareData[capType]];
      }
    });

    console.log('篩選後的資料:', this.fareData);
  }


  // 暫存扣款資料到工作流程
  private saveFareDataToWorkflow(): void {
    try {
      console.log('💾 準備儲存暫存資料...');

      // 檢查要儲存的資料
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
      console.log('儲存的資料結構:', JSON.stringify(dataToSave, null, 2));

      this.contractFlowService.saveStep2Data(dataToSave);
      console.log('✅ 已成功暫存扣款資料到工作流程');
    } catch (error) {
      console.error('❌ 儲存暫存資料時發生錯誤:', error);
    }
  }

  // 切換顯示模式的方法
  toggleCommonlyUsed(): void {
    if (this.showOnlyCommonlyUsed) {
      // 目前是常用模式，切換到全部模式
      if (!this.isShowingAll) {
        // 如果還沒載入全部資料，重新載入
        this.loadFareDataFromAPI(true);
      }
      this.showOnlyCommonlyUsed = false;
      this.showOnlySelected = false;
    } else {
      // 切換到常用模式
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
      // 如果還沒載入全部資料，重新載入
      this.loadFareDataFromAPI(true);
    }
    this.showOnlyCommonlyUsed = false;
    this.showOnlySelected = false;
    this.filterData();
  }

  // 獲取顯示按鈕的文字
  getToggleCommonlyUsedText(): string {
    return this.showOnlyCommonlyUsed ? '顯示全部項目' : '僅顯示常用項目';
  }

  getToggleSelectedText(): string {
    return this.showOnlySelected ? '顯示全部項目' : '僅顯示已勾選項目';
  }

  // 更新選擇相關方法，使用 is_selected
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

  // 更新原始資料中的選取狀態
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

    // 標記狀態
    if (newData._status === 'original') {
      newData._status = 'modified';
      console.log(`📝 ${capType} 項目狀態變更: original → modified`);
    }

    // 更新原始資料
    const originalIndex = this.originalFareData[capType].findIndex(item => item.id === newData.id);
    if (originalIndex > -1) {
      console.log(`🔄 更新 ${capType}[${originalIndex}] 資料`);
      this.originalFareData[capType][originalIndex] = { ...newData };

      // 驗證更新後的資料
      const updatedItem = this.originalFareData[capType][originalIndex];
      console.log('更新後的項目:', {
        id: updatedItem.id,
        cap_item: updatedItem.cap_item,
        data_source: updatedItem.data_source,
        is_selected: updatedItem.is_selected,
        _status: updatedItem._status
      });
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

  // 處理項目選擇變更
  onItemSelectionChange(capType: string): void {
    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
  }

  // 獲取已選擇項目數量
  getSelectedCount(capType: string): number {
    // 🔒 安全檢查：確保 fareData[capType] 存在且是陣列
    if (!this.fareData[capType] || !Array.isArray(this.fareData[capType])) {
      return 0;
    }
    return this.fareData[capType].filter(item => item && item.is_selected).length;
  }

  // 獲取總項目數量
  getTotalCount(capType: string): number {
    // 🔒 安全檢查
    if (!this.fareData[capType] || !Array.isArray(this.fareData[capType])) {
      return 0;
    }
    return this.fareData[capType].length;
  }

  // 獲取扣款類型的中文名稱
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

  // 獲取對應的表格欄位定義
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

  // 導航相關方法
  onSubmitNext(): void {
    // 確保最新資料已暫存
    this.saveFareDataToWorkflow();

    // 檢查是否有勾選的項目
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
    // 🔧 修正：回到前一步時，先確保資料已儲存，然後直接導航
    console.log('🔙 準備回到前一步...');

    // 確保最新的變更已經暫存
    this.saveFareDataToWorkflow();

    // 直接導航到前一步，不需要確認提示
    this.router.navigate(['/TLS/TLS13010CRU']);
    this.messageService.infoBubble('已返回合約資訊頁面');
  }

  onRealCancel(): void {
    if (confirm('確定要離開契約編輯流程嗎？所有暫存資料將會保留。')) {
      // 確保資料已儲存
      this.saveFareDataToWorkflow();

      // 回到查詢頁面
      this.router.navigate(['/TLS/TLS13010']);
      this.messageService.infoBubble('已離開契約編輯流程');
    }
  }

  // 🔧 新增：如果需要清空所有暫存資料的操作
  onClearAndExit(): void {
    if (confirm('確定要清空所有暫存資料並離開嗎？此操作無法復原。')) {
      // 清空暫存資料
      this.contractFlowService.clearTempData();

      // 回到查詢頁面
      this.router.navigate(['/TLS/TLS13010']);
      this.messageService.infoBubble('已清空暫存資料並離開');
    }
  }

  // 表單提交相關方法
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

  // 匯出給模板使用的變數
  get capTypes(): string[] {
    return ['A', 'B', 'C', 'D', 'E'];
  }

  // 檢查是否有資料變更
  hasUnsavedChanges(): boolean {
    return Object.keys(this.originalFareData).some(capType =>
      this.originalFareData[capType].some(item =>
        item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
      )
    );
  }

  // 重新載入資料
  reloadData(): void {
    if (confirm('確定要重新載入資料嗎？未儲存的變更將會遺失。')) {
      this.loadFareDataFromAPI(this.isShowingAll);
      this.messageService.infoBubble('已重新載入資料');
    }
  }

  // 儲存所有變更
  saveAllChanges(): void {
    this.saveFareDataToWorkflow();
    this.messageService.successBubble('所有變更已儲存');
  }

  // 檢查是否有資料可顯示
  hasAnyData(): boolean {
    return Object.keys(this.originalFareData).some(capType =>
      this.originalFareData[capType].length > 0
    );
  }

  // 獲取總選擇項目數
  getTotalSelectedCount(): number {
    return Object.keys(this.originalFareData).reduce((total, capType) =>
      total + this.getSelectedCount(capType), 0
    );
  }

  // 獲取總項目數
  getTotalItemCount(): number {
    return Object.keys(this.originalFareData).reduce((total, capType) =>
      total + this.getTotalCount(capType), 0
    );
  }

  // 檢查特定類型是否有資料
  hasDataForType(capType: string): boolean {
    // 🔒 安全檢查
    return this.fareData[capType] && Array.isArray(this.fareData[capType]) && this.fareData[capType].length > 0;
  }

  // 獲取目前顯示模式描述
  getCurrentDisplayMode(): string {
    if (this.showOnlyCommonlyUsed) {
      return '僅常用項目';
    } else if (this.showOnlySelected) {
      return '僅已勾選項目';
    } else {
      return '全部項目';
    }
  }

  // 新增：檢查暫存服務的狀態
  debugCheckCacheService(): void {
    console.log('🔍 檢查暫存服務狀態...');

    try {
      const allCacheData = this.contractFlowService.getCurrentData();
      console.log('完整的暫存資料:', allCacheData);

      const step2Data = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);
      console.log('Step2 暫存資料:', step2Data);

      // 測試儲存功能
      const testData = { test: 'data' };
      this.contractFlowService.saveStep2Data(testData);

      const retrievedTestData = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);
      console.log('測試儲存後取回的資料:', retrievedTestData);

      if (JSON.stringify(testData) === JSON.stringify(retrievedTestData)) {
        console.log('✅ 暫存服務正常運作');
      } else {
        console.error('❌ 暫存服務有問題');
      }
    } catch (error) {
      console.error('❌ 檢查暫存服務時發生錯誤:', error);
    }
  }
}
