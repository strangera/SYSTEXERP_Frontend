import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { SelectItem } from 'primeng/api';
import { ColumnDef } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { ContractFlowService, WorkflowStep } from '../../../service/API/tls/tls13010contract-flow/contract-flow.service';
import { TLS13010Service } from '../../../service/API/tls/tls13010.service';
import { TLS13010_DROPDOWN_OPTIONS } from '../tls13010/tls13010.dropdown';

interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
}

// 合約基本資料介面
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

// 佣金項目接口
interface CommissionItem {
  id: number;
  commissionType: string;
  commissionTypeName: string;
  taxType: number;
  discountSummary: string;
  transactionAmount: number;
  specialCommission: number;
  fullPointActivity: boolean;
  thousandDiscount: boolean;
  selectedSettingOption: string;
  discountSettingItems: DiscountSettingItem[];
  annualPerformanceItems: AnnualPerformanceItem[];
  discountLevelItems: DiscountLevelItem[];
  detailItems: any[];
}

// 折扣設置項目接口
interface DiscountSettingItem {
  selected: boolean;
  discountType: number;
  startDate: Date;
  endDate: Date;
  rate: number;
}

// 年度業績項目接口
interface AnnualPerformanceItem {
  selected: boolean;
  startDate: Date;
  endDate: Date;
  discountAmount: number;
  rate: number;
}

// 折扣等級項目接口
interface DiscountLevelItem {
  selected: boolean;
  discountType: number;
  startAmount: number;
  endAmount: number;
  rate: number;
}

@Component({
  selector: 'app-tls13010-next2',
  templateUrl: './tls13010-next2.component.html',
  styleUrls: ['./tls13010-next2.component.scss']
})
export class TLS13010Next2Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {
  @ViewChild('expandedContent') expandedContentTemplate!: TemplateRef<any>;

  private subscriptions: Subscription[] = [];

  dataForm: FormGroup;

  // 當前合約資料
  currentTalentId: string = '';
  currentContractData: any = null;
  contractInfoData: ContractInfo[] = [];

  // 頂部選項卡選擇
  selectedSettingTab: string = 'discount';

  // 展開區域表格的動態列定義
  detailColumns: ColumnDef[] = [];

  // 🎯 合約資訊欄位定義 - 與 Next1 完全一致
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

  // 各類型的列定義
  discountColumns: ColumnDef[] = [
    { field: 'selected', header: '選擇', type: 'checkbox', editable: true, },
    { field: 'discountType', header: '折扣別', type: 'dropdown', editable: true, },
    { field: 'startDate', header: '合約起始日', type: 'date', editable: true, },
    { field: 'endDate', header: '合約終止日', type: 'date', editable: true, },
    { field: 'rate', header: '抽成率 (%)', type: 'number', editable: true, }
  ];

  annualColumns: ColumnDef[] = [
    { field: 'selected', header: '選擇', type: 'checkbox', editable: true },
    { field: 'startDate', header: '帳務起', type: 'date', editable: true },
    { field: 'endDate', header: '帳務迄', type: 'date', editable: true },
    { field: 'discountAmount', header: '業績超過金額含', type: 'number', editable: true },
    { field: 'rate', header: '抽成率', type: 'number', editable: true }
  ];

  levelColumns: ColumnDef[] = [
    { field: 'selected', header: '選擇', type: 'checkbox', editable: true },
    { field: 'discountType', header: '折扣別', type: 'dropdown', editable: true },
    { field: 'startAmount', header: '業績計算金額(起)', type: 'number', editable: true },
    { field: 'endAmount', header: '業績計算金額(迄)', type: 'number', editable: true },
    { field: 'rate', header: '抽成率', type: 'number', editable: true }
  ];

  settingOptions: SelectItem[] = [
    { label: '折扣設定', value: 'discount' },
    { label: '年度總業績抽成設定', value: 'annual' },
    { label: '折扣別層級抽成設定', value: 'level' }
  ];

  settingTabs = [
    { id: 'discount', label: '折扣設定' },
    { id: 'annual', label: '年度總業績抽成設定' },
    { id: 'level', label: '折扣別層級抽成設定' }
  ];

  // 佣金表格列定義
  commissionColumns: ColumnDef[] = [
    { field: 'commissionType', header: '抽成類別', editable: true },
    { field: 'commissionTypeName', header: '抽成類別名稱', editable: true },
    { field: 'taxType', header: '稅別', editable: true },
    { field: 'discountSummary', header: '設定摘要', editable: true },
    { field: 'transactionAmount', header: '單筆交易金額(含)以上', editable: true, type: 'number' },
    { field: 'specialCommission', header: '特價抽成(%)', editable: true, type: 'number' },
    { field: 'fullPointActivity', header: '全館消費滿額集點活動', editable: true, type: 'checkbox' },
    { field: 'thousandDiscount', header: '滿仟送佰', editable: true, type: 'checkbox' },
  ];

  // 數據 - 移除假資料，初始化為空
  commissionItems: CommissionItem[] = [];

  // 下拉選項
  taxTypeOptions: any[] = [
    { label: '應稅', value: 1 },
    { label: '免稅', value: 2 }
  ];

  discounts: any[] = [
    { value: 1, label: '正品' },
    { value: 2, label: '95折' },
    { value: 3, label: '90折' },
    { value: 4, label: '85折' },
    { value: 5, label: '80折' },
    { value: 6, label: '75折' },
    { value: 7, label: '70折' },
    { value: 8, label: '65折' },
    { value: 9, label: '60折' },
    { value: 10, label: '55折' },
    { value: 11, label: '50折' },
    { value: 12, label: '特價' }
  ];

  constructor(
    private notificationService: NotificationService,
    private contractFlowService: ContractFlowService,
    private tls13010Service: TLS13010Service
  ) {
    super();
    this.dataForm = this.formBuilder.group({});
    this.updateDetailColumns();
  }

  ngOnInit(): void {
    console.log('TLS13010Next2Component 初始化開始');
    this.initializePage('TLS13010', this.dataForm);
    this.loadWorkflowData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // 🎯 載入工作流程資料 - 與 Next1 一致
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

      // 檢查暫存的抽成設定資料
      this.loadCommissionData();
    } else {
      console.warn('❌ 沒有 talent_id，重導向到前一步');
      this.router.navigate(['/TLS/TLS13010CRU']);
    }
  }

  // 載入抽成設定資料 (待實作 API)
  private loadCommissionData(): void {
    console.log('🔍 檢查是否有暫存的抽成設定資料...');

    const savedCommissionData = this.contractFlowService.getStepData(WorkflowStep.COMMISSION);

    if (savedCommissionData && Array.isArray(savedCommissionData)) {
      console.log('📦 發現暫存的抽成設定資料，直接使用');
      this.commissionItems = savedCommissionData;
      this.updateDetailItemsForDisplay();
    } else {
      console.log('📭 沒有暫存資料，初始化空的抽成設定');
      this.initializeEmptyCommissionData();
    }
  }

  // 初始化空的抽成設定資料
  private initializeEmptyCommissionData(): void {
    this.commissionItems = [];
    // 可以添加一個初始的空項目
    this.addInitialCommissionItem();
  }

  // 儲存抽成設定到工作流程
  private saveCommissionDataToWorkflow(): void {
    try {
      console.log('💾 準備儲存抽成設定資料...');
      this.contractFlowService.saveStep3Data(this.commissionItems);
      console.log('✅ 已成功暫存抽成設定資料到工作流程');
    } catch (error) {
      console.error('❌ 儲存抽成設定資料時發生錯誤:', error);
    }
  }

  // 切換設置選項卡
  changeSettingTab(tab: string): void {
    console.log('切換設置選項卡', tab);
    this.selectedSettingTab = tab;
    this.updateDetailColumns();
    this.updateDetailItemsForDisplay();
  }

  // 更新詳情列定義
  updateDetailColumns(): void {
    console.log('更新詳情列定義', this.selectedSettingTab);
    switch (this.selectedSettingTab) {
      case 'discount':
        this.detailColumns = this.discountColumns;
        break;
      case 'annual':
        this.detailColumns = this.annualColumns;
        break;
      case 'level':
        this.detailColumns = this.levelColumns;
        break;
      default:
        this.detailColumns = this.discountColumns;
    }
  }

  // 獲取當前設置類型下的數據項
  getCurrentItems(rowData: CommissionItem): any[] {
    switch (this.selectedSettingTab) {
      case 'discount':
        return rowData.discountSettingItems;
      case 'annual':
        return rowData.annualPerformanceItems;
      case 'level':
        return rowData.discountLevelItems;
      default:
        return rowData.discountSettingItems;
    }
  }

  // 添加新項目
  addDetailItem(rowData: CommissionItem): void {
    console.log('添加新項目', this.selectedSettingTab);
    switch (this.selectedSettingTab) {
      case 'discount':
        this.addDiscountSettingItem(rowData);
        break;
      case 'annual':
        this.addAnnualPerformanceItem(rowData);
        break;
      case 'level':
        this.addDiscountLevelItem(rowData);
        break;
    }
    this.updateDetailItemsForDisplay();
    this.saveCommissionDataToWorkflow();
  }

  // 刪除項目
  removeDetailItem(rowData: CommissionItem, index: number): void {
    switch (this.selectedSettingTab) {
      case 'discount':
        this.removeDiscountSettingItem(rowData, index);
        break;
      case 'annual':
        this.removeAnnualPerformanceItem(rowData, index);
        break;
      case 'level':
        this.removeDiscountLevelItem(rowData, index);
        break;
    }
    this.updateDetailItemsForDisplay();
    this.saveCommissionDataToWorkflow();
  }

  // 獲取設置項標題
  getSettingTitle(): string {
    switch (this.selectedSettingTab) {
      case 'discount':
        return '折扣設定';
      case 'annual':
        return '年度總業績抽成設定';
      case 'level':
        return '折扣別層級抽成設定';
      default:
        return '折扣設定';
    }
  }

  updateDetailItemsForDisplay(): void {
    console.log('更新詳細項目顯示, 選項卡:', this.selectedSettingTab);

    this.commissionItems.forEach(item => {
      // 清空當前 detailItems
      item.detailItems = [];

      // 根據當前選擇的選項卡類型複製對應的詳細數據
      switch (this.selectedSettingTab) {
        case 'discount':
          if (item.discountSettingItems && item.discountSettingItems.length > 0) {
            item.discountSettingItems.forEach(discountItem => {
              item.detailItems.push({ ...discountItem });
            });
          }
          break;
        case 'annual':
          if (item.annualPerformanceItems && item.annualPerformanceItems.length > 0) {
            item.annualPerformanceItems.forEach(annualItem => {
              item.detailItems.push({ ...annualItem });
            });
          }
          break;
        case 'level':
          if (item.discountLevelItems && item.discountLevelItems.length > 0) {
            item.discountLevelItems.forEach(levelItem => {
              item.detailItems.push({ ...levelItem });
            });
          }
          break;
      }

      console.log(`項目 ${item.id} 詳細項目數量:`, item.detailItems.length);
    });
  }

  // 創建折扣設置項目
  createDiscountSettingItem(): DiscountSettingItem {
    const startDate = this.contractInfoData[0]?.tlt_bdate
      ? new Date(this.contractInfoData[0].tlt_bdate)
      : new Date();
    const endDate = this.contractInfoData[0]?.tlt_edate
      ? new Date(this.contractInfoData[0].tlt_edate)
      : new Date();

    return {
      selected: false,
      discountType: 0,
      startDate: startDate,
      endDate: endDate,
      rate: 0
    };
  }

  // 創建年度業績項目
  createAnnualPerformanceItem(): AnnualPerformanceItem {
    return {
      selected: false,
      startDate: new Date(),
      endDate: new Date(),
      discountAmount: 0,
      rate: 0
    };
  }

  // 創建折扣等級項目
  createDiscountLevelItem(): DiscountLevelItem {
    return {
      selected: false,
      discountType: 0,
      startAmount: 0,
      endAmount: 0,
      rate: 0
    };
  }

  // 添加初始佣金項目
  addInitialCommissionItem(): void {
    const newId = this.commissionItems.length + 1;
    this.commissionItems.push(this.createCommissionItem(newId));
    this.saveCommissionDataToWorkflow();
  }

  // 創建佣金項目
  createCommissionItem(id: number): CommissionItem {
    const discountSettingItems: DiscountSettingItem[] = [];
    for (let i = 0; i < 5; i++) {
      discountSettingItems.push(this.createDiscountSettingItem());
    }

    // 創建5個空的年度業績項目
    const annualPerformanceItems: AnnualPerformanceItem[] = [];
    for (let i = 0; i < 5; i++) {
      annualPerformanceItems.push(this.createAnnualPerformanceItem());
    }

    // 創建5個空的折扣等級項目
    const discountLevelItems: DiscountLevelItem[] = [];
    for (let i = 0; i < 5; i++) {
      discountLevelItems.push(this.createDiscountLevelItem());
    }

    const item: CommissionItem = {
      id: id,
      commissionType: '',
      commissionTypeName: '',
      taxType: 1,
      discountSummary: '',
      transactionAmount: 0,
      specialCommission: 0,
      fullPointActivity: false,
      thousandDiscount: false,
      selectedSettingOption: 'discount', // 默認選擇折扣設定
      discountSettingItems: discountSettingItems,
      annualPerformanceItems: annualPerformanceItems,
      discountLevelItems: discountLevelItems,
      detailItems: [] // 初始化為空陣列
    };

    // 根據當前選擇的選項卡類型初始化 detailItems
    switch (this.selectedSettingTab) {
      case 'discount':
        item.detailItems = [...discountSettingItems];
        break;
      case 'annual':
        item.detailItems = [...annualPerformanceItems];
        break;
      case 'level':
        item.detailItems = [...discountLevelItems];
        break;
      default:
        item.detailItems = [...discountSettingItems];
    }

    return item;
  }

  // 添加新的佣金項目
  onAddCommissionItem(): void {
    const newId = this.commissionItems.length + 1;
    this.commissionItems.push(this.createCommissionItem(newId));
    this.updateDetailItemsForDisplay();
    this.saveCommissionDataToWorkflow();
  }

  // 設置選項改變
  onSettingOptionChange(item: CommissionItem): void {
    console.log('設置選項改變:', item.selectedSettingOption);
    this.saveCommissionDataToWorkflow();
  }

  // 添加折扣設置項目
  addDiscountSettingItem(item: CommissionItem): void {
    item.discountSettingItems.push(this.createDiscountSettingItem());
    this.updateDetailItemsForDisplay();
  }

  // 添加年度業績項目
  addAnnualPerformanceItem(item: CommissionItem): void {
    item.annualPerformanceItems.push(this.createAnnualPerformanceItem());
    this.updateDetailItemsForDisplay();
  }

  // 添加折扣等級項目
  addDiscountLevelItem(item: CommissionItem): void {
    item.discountLevelItems.push(this.createDiscountLevelItem());
    this.updateDetailItemsForDisplay();
  }

  // 刪除折扣設置項目
  removeDiscountSettingItem(item: CommissionItem, index: number): void {
    item.discountSettingItems.splice(index, 1);
    this.updateDetailItemsForDisplay();
  }

  // 刪除年度業績項目
  removeAnnualPerformanceItem(item: CommissionItem, index: number): void {
    item.annualPerformanceItems.splice(index, 1);
    this.updateDetailItemsForDisplay();
  }

  // 刪除折扣等級項目
  removeDiscountLevelItem(item: CommissionItem, index: number): void {
    item.discountLevelItems.splice(index, 1);
    this.updateDetailItemsForDisplay();
  }

  // 表格項目編輯事件
  onItemEdit(item: any): void {
    console.log('項目編輯:', item);
  }

  // 表格項目保存事件
  onItemSave(event: { oldData: any, newData: any }): void {
    console.log('項目保存:', event);
    this.syncDetailItemsToSource(event.newData);
    this.updateDetailItemsForDisplay();
    this.saveCommissionDataToWorkflow();
  }

  // 同步詳細項目到源數據
  syncDetailItemsToSource(itemData: CommissionItem): void {
    switch (this.selectedSettingTab) {
      case 'discount':
        itemData.discountSettingItems = [];
        itemData.detailItems.forEach(detail => {
          itemData.discountSettingItems.push({ ...detail });
        });
        break;
      case 'annual':
        itemData.annualPerformanceItems = [];
        itemData.detailItems.forEach(detail => {
          itemData.annualPerformanceItems.push({ ...detail });
        });
        break;
      case 'level':
        itemData.discountLevelItems = [];
        itemData.detailItems.forEach(detail => {
          itemData.discountLevelItems.push({ ...detail });
        });
        break;
    }
  }

  // 表格項目取消事件
  onItemCancel(item: any): void {
    console.log('項目取消:', item);
  }

  // 詳細內容保存
  onDetailSave(item: CommissionItem, settingType: string): void {
    // 根據設置類型生成摘要內容
    let formattedItems = '';
    this.syncDetailItemsToSource(item);
    switch (settingType) {
      case 'discount':
        // 處理折扣設置項目
        const selectedDiscounts = item.discountSettingItems.filter(i => i.selected);
        const formattedDiscounts = selectedDiscounts.map((discountItem, idx) => {
          const discountLabel = this.discounts.find(d => d.value == discountItem.discountType)?.label || '';
          const startDate = discountItem.startDate ? this.formatDate(discountItem.startDate) : '';
          const endDate = discountItem.endDate ? this.formatDate(discountItem.endDate) : '';
          return `折扣設定 ${idx + 1}: ${discountLabel}, ${startDate}, ${endDate}, ${discountItem.rate}%`;
        }).join('; ');
        formattedItems = formattedDiscounts;
        break;

      case 'annual':
        // 處理年度業績項目
        const selectedAnnuals = item.annualPerformanceItems.filter(i => i.selected);
        const formattedAnnuals = selectedAnnuals.map((annualItem, idx) => {
          const startDate = annualItem.startDate ? this.formatDate(annualItem.startDate) : '';
          const endDate = annualItem.endDate ? this.formatDate(annualItem.endDate) : '';
          return `年度業績 ${idx + 1}: ${startDate}-${endDate}, ${annualItem.discountAmount}, ${annualItem.rate}%`;
        }).join('; ');
        formattedItems = formattedAnnuals;
        break;

      case 'level':
        // 處理折扣等級項目
        const selectedLevels = item.discountLevelItems.filter(i => i.selected);
        const formattedLevels = selectedLevels.map((levelItem, idx) => {
          const discountLabel = this.discounts.find(d => d.value == levelItem.discountType)?.label || '';
          return `折扣層級 ${idx + 1}: ${discountLabel}, ${levelItem.startAmount}-${levelItem.endAmount}, ${levelItem.rate}%`;
        }).join('; ');
        formattedItems = formattedLevels;
        break;
    }

    // 更新摘要
    if (formattedItems) {
      item.discountSummary = formattedItems;
      // 更新選定的設置選項
      item.selectedSettingOption = settingType;
    }

    this.saveCommissionDataToWorkflow();
  }

  // 詳細內容取消
  onDetailCancel(item: CommissionItem): void {
    console.log('詳細內容取消:', item);
    this.updateDetailItemsForDisplay();
  }

  // 詳細內容清除
  onDetailClear(item: CommissionItem, settingType: string): void {
    // 按類型清除不同的內容
    switch (settingType) {
      case 'discount':
        item.discountSettingItems.forEach(i => {
          i.selected = false;
          i.discountType = 0;
          i.rate = 0;
          // 保留起止日期
          i.startDate = this.contractInfoData[0]?.tlt_bdate
            ? new Date(this.contractInfoData[0].tlt_bdate)
            : new Date();
          i.endDate = this.contractInfoData[0]?.tlt_edate
            ? new Date(this.contractInfoData[0].tlt_edate)
            : new Date();
        });
        break;
      case 'annual':
        item.annualPerformanceItems.forEach(i => {
          i.selected = false;
          i.discountAmount = 0;
          i.rate = 0;
          // 重置日期
          i.startDate = new Date();
          i.endDate = new Date();
        });
        break;
      case 'level':
        item.discountLevelItems.forEach(i => {
          i.selected = false;
          i.discountType = 0;
          i.startAmount = 0;
          i.endAmount = 0;
          i.rate = 0;
        });
        break;
    }
    this.updateDetailItemsForDisplay();
    this.saveCommissionDataToWorkflow();
  }

  // 日期格式化輔助函數
  formatDate(date: Date): string {
    if (!date) return '';

    try {
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  }

  // 展開式表格的事件處理方法
  onRowSave(event: any) {
    if (event && 'oldData' in event && 'newData' in event) {
      console.log('儲存主表格行:', event);
      this.saveCommissionDataToWorkflow();
    } else {
      console.warn('收到未預期的事件格式:', event);
    }
  }

  onRowCancel(event: any) {
    console.log('取消主表格編輯:', event);
  }

  onDetailEdit(event: any): void {
    console.log('詳細編輯開始:', event);
  }

  onDetailTabChange(event: { rowData: any, tabId: string }) {
    const { rowData, tabId } = event;
    console.log('詳細選項卡切換:', tabId);

    // 更新詳細內容顯示
    this.selectedSettingTab = tabId;
    this.updateDetailColumns();
    this.updateDetailItemsForDisplay();
  }

  // 批次刪除處理
  onBatchDelete(selectedItems: any[]) {
    console.log('批次刪除項目:', selectedItems);

    if (confirm(`確定要刪除選取的 ${selectedItems.length} 個項目嗎？`)) {
      selectedItems.forEach(item => {
        const index = this.commissionItems.findIndex(x => x.id === item.id);
        if (index > -1) {
          this.commissionItems.splice(index, 1);
        }
      });

      this.saveCommissionDataToWorkflow();
      console.log('刪除完成');
    }
  }

  // 新增明細項目處理
  onAddDetailItem(parentData: any) {
    console.log('新增明細項目:', parentData);

    switch (this.selectedSettingTab) {
      case 'discount':
        this.addDiscountSettingItem(parentData);
        break;
      case 'annual':
        this.addAnnualPerformanceItem(parentData);
        break;
      case 'level':
        this.addDiscountLevelItem(parentData);
        break;
    }
  }

  // 明細批次刪除處理
  onDetailBatchDelete(event: { selectedDetails: any[], parentData: any, rowIndex: number }) {
    console.log('明細批次刪除:', event);

    const { selectedDetails, parentData } = event;

    if (confirm(`確定要刪除選取的 ${selectedDetails.length} 個明細項目嗎？`)) {
      selectedDetails.forEach(detail => {
        const detailIndex = parentData.detailItems.findIndex((d: any) => d.id === detail.id);
        if (detailIndex > -1) {
          parentData.detailItems.splice(detailIndex, 1);
        }

        switch (this.selectedSettingTab) {
          case 'discount':
            const discountIndex = parentData.discountSettingItems.findIndex((d: any) => d.id === detail.id);
            if (discountIndex > -1) {
              parentData.discountSettingItems.splice(discountIndex, 1);
            }
            break;
          case 'annual':
            const annualIndex = parentData.annualPerformanceItems.findIndex((d: any) => d.id === detail.id);
            if (annualIndex > -1) {
              parentData.annualPerformanceItems.splice(annualIndex, 1);
            }
            break;
          case 'level':
            const levelIndex = parentData.discountLevelItems.findIndex((d: any) => d.id === detail.id);
            if (levelIndex > -1) {
              parentData.discountLevelItems.splice(levelIndex, 1);
            }
            break;
        }
      });

      this.updateDetailItemsForDisplay();
      this.saveCommissionDataToWorkflow();
      console.log('明細刪除完成');
    }
  }

  // 導航方法
  onSubmitNext(): void {
    this.saveCommissionDataToWorkflow();

    const hasCommissionItems = this.commissionItems.length > 0;

    if (!hasCommissionItems) {
      this.messageService.warnBubble('請至少設定一個抽成項目');
      return;
    }

    this.router.navigate(['TLS/TLS13010NEXT3']);
    this.messageService.infoBubble('進入下一步');
  }

  override onCancel(): void {
    console.log('🔙 準備回到前一步...');
    this.saveCommissionDataToWorkflow();
    this.router.navigate(['/TLS/TLS13010NEXT1']);
    this.messageService.infoBubble('已返回扣款設定頁面');
  }

  onRealCancel(): void {
    if (confirm('確定要離開契約編輯流程嗎？所有暫存資料將會保留。')) {
      this.saveCommissionDataToWorkflow();
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

  // 輔助方法
  hasCommissionData(): boolean {
    return this.commissionItems.length > 0;
  }

  getCommissionItemCount(): number {
    return this.commissionItems.length;
  }

  reloadData(): void {
    if (confirm('確定要重新載入資料嗎？未儲存的變更將會遺失。')) {
      this.loadCommissionData();
      this.messageService.infoBubble('已重新載入資料');
    }
  }

  saveAllChanges(): void {
    this.saveCommissionDataToWorkflow();
    this.messageService.successBubble('所有變更已儲存');
  }
}
