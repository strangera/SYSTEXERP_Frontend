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
import { LocationOptionsService } from '../../../service/API/dropdownservice/location-options.service';

// ... 介面定義保持不變 ...
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
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

interface DiscountSettingItem {
  selected: boolean;
  cag_barcode: string;
  startDate: Date;
  endDate: Date;
  rate: number;
}

interface AnnualPerformanceItem {
  selected: boolean;
  startDate: Date;
  endDate: Date;
  discountAmount: number;
  rate: number;
}

interface DiscountLevelItem {
  selected: boolean;
  cag_barcode: string;
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

  // 🎯 新增：資料載入狀態控制
  dataLoaded: boolean = false;
  commissionDataLoaded: boolean = false;

  // 當前合約資料
  currentTalentId: string = '';
  currentContractData: any = null;
  contractInfoData: ContractInfo[] = [];

  // 頂部選項卡選擇
  selectedSettingTab: string = 'discount';

  // 展開區域表格的動態列定義
  detailColumns: ColumnDef[] = [];

  // 合約資訊欄位定義
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
    { field: 'cag_barcode', header: '折扣別', type: 'dropdown', editable: true, options: [] },
    { field: 'startDate', header: '合約起始日', type: 'date', editable: true, },
    { field: 'endDate', header: '合約終止日', type: 'date', editable: true, },
    { field: 'rate', header: '抽成率 (%)', type: 'number', editable: true, }
  ];

  annualColumns: ColumnDef[] = [
    { field: 'startDate', header: '帳務起', type: 'date', editable: true },
    { field: 'endDate', header: '帳務迄', type: 'date', editable: true },
    { field: 'discountAmount', header: '業績超過金額含', type: 'number', editable: true },
    { field: 'rate', header: '抽成率', type: 'number', editable: true }
  ];

  levelColumns: ColumnDef[] = [
    { field: 'cag_barcode', header: '折扣別', type: 'dropdown', editable: true, options: [] },
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
    { field: 'taxType', header: '稅別', editable: true, type: 'dropdown', options: TLS13010_DROPDOWN_OPTIONS.cagTaxTypeOption },
    { field: 'discountSummary', header: '設定摘要', editable: true },
    { field: 'transactionAmount', header: '單筆交易金額(含)以上', editable: true, type: 'number' },
    { field: 'specialCommission', header: '特價抽成(%)', editable: true, type: 'number' },
    { field: 'fullPointActivity', header: '全館消費滿額集點活動', editable: true, type: 'checkbox' },
    { field: 'thousandDiscount', header: '滿仟送佰', editable: true, type: 'checkbox' },
  ];

  // 數據
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
  private discountOptions: any[] = [];

  constructor(
    private notificationService: NotificationService,
    private contractFlowService: ContractFlowService,
    private tls13010Service: TLS13010Service,
    private paperTypeService: LocationOptionsService,
  ) {
    super();
    this.dataForm = this.formBuilder.group({});
    this.updateDetailColumns();
  }

  ngOnInit(): void {
    console.log('TLS13010Next2Component 初始化開始');
    this.initializePage('TLS13010', this.dataForm);

    // 🎯 修改：確保載入順序
    this.loadDiscountOptions().then(() => {
      this.loadWorkflowData();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // 🎯 修改：載入折數選項，返回 Promise
  private loadDiscountOptions(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🔽 開始載入折數選項...');

      this.paperTypeService.getPaperTypeOptions('T102').subscribe({
        next: (options: any[]) => {
          // ✅ 確保轉換成正確的格式
          this.discountOptions = options.map(option => ({
            value: option.SYS_Code,
            label: option.SYS_Name
          }));

          // ✅ 立即更新 discounts 屬性
          this.discounts = [...this.discountOptions];

          console.log('✅ 載入折數選項成功:', this.discountOptions);
          console.log('✅ 更新 discounts 成功:', this.discounts);

          this.updateDiscountColumnOptions();
          resolve();
        },
        error: (error: any) => {
          console.error('❌ 載入折數選項失敗:', error);
          this.discountOptions = [];
          this.discounts = [];
          this.updateDiscountColumnOptions();
          resolve();
        }
      });
    });
  }

  // 🎯 修改：更新表格欄位的折數選項
  private updateDiscountColumnOptions(): void {
    // ✅ 強制重新建立陣列以觸發變更檢測
    this.discountColumns = this.discountColumns.map(col => {
      if (col.field === 'cag_barcode') {  // ✅ 修正為 cag_barcode
        return { ...col, options: [...this.discountOptions] };
      }
      return col;
    });

    this.levelColumns = this.levelColumns.map(col => {
      if (col.field === 'cag_barcode') {  // ✅ 修正為 cag_barcode
        return { ...col, options: [...this.discountOptions] };
      }
      return col;
    });
  }

  // 🎯 修改：載入工作流程資料
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

      // 準備合約資訊
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

      // 🎯 關鍵修改：載入抽成設定資料
      this.loadCommissionData();
    } else {
      console.warn('❌ 沒有 talent_id，重導向到前一步');
      this.router.navigate(['/TLS/TLS13010CRU']);
    }
  }

  // 🎯 修改：載入抽成設定資料
  private loadCommissionData(): void {
    console.log('🔍 開始載入抽成設定資料...');

    // 🎯 使用現有方法清除 step3 資料
    console.log('🗑️ 清除 step3 暫存資料');
    this.contractFlowService.saveStep3Data([]); // 儲存空陣列來清除

    this.loading = true;
    this.commissionDataLoaded = false;
    this.loadCommissionDataFromAPI();
    return;
  }

  private loadCommissionDataFromAPI(): void {
    if (!this.currentTalentId) {
      console.warn('❌ 沒有 talentId，無法載入抽成設定');
      this.initializeEmptyCommissionData();
      return;
    }

    this.loading = true;
    this.dataLoaded = false; // 🎯 重要：重置狀態
    this.commissionDataLoaded = false;

    console.log('📞 開始調用 API，talentId:', this.currentTalentId);

    this.tls13010Service.queryTLS13010Charge(this.currentTalentId).subscribe({
      next: (response) => {
        console.log('🎯 API 完整回應:', response);
        console.log('🔍 response.Data:', response.Data);
        console.log('🔍 response.Data.ChargeSettings:', response.Data?.ChargeSettings);

        // 🔧 修正：根據實際 API 結構調整
        if (response?.Data?.ChargeSettings && Array.isArray(response.Data.ChargeSettings)) {
          console.log('✅ 成功載入抽成設定資料，共', response.Data.ChargeSettings.length, '筆');
          this.convertAPIDataToCommissionItems(response.Data);
          this.commissionDataLoaded = true;
        } else if (response?.Data && Array.isArray(response.Data)) {
          // 如果 Data 本身就是陣列
          console.log('✅ 使用 Data 陣列作為抽成設定資料');
          this.convertAPIDataToCommissionItems({ ChargeSettings: response.Data });
          this.commissionDataLoaded = true;
        } else {
          console.log('📭 API 回傳空資料或格式不正確');
          this.initializeEmptyCommissionData();
        }

        this.dataLoaded = true; // 🎯 重要：設定載入完成
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ 載入抽成設定資料失敗:', error);
        this.notificationService.errorBubble('載入抽成設定資料失敗');
        this.initializeEmptyCommissionData();
        this.loading = false;
      }
    });
  }

  // 根據 barcode 取得折扣類型
  private getDiscountTypeByBarcode(barcode: string): string {
    return barcode || '000';
  }

  // 🎯 修改：根據折數選項取得顯示名稱
  private getDiscountLabelByValue(value: string): string {
    console.log(`🔍 尋找 value: ${value}, 可用選項:`, this.discountOptions);
    const option = this.discountOptions.find(opt => opt.value === value);
    console.log(`🔍 找到選項:`, option);
    return option ? option.label : value;
  }

  // 生成折扣摘要
  private generateDiscountSummary(chargeSetting: any): string {
    console.log('🏷️ 生成折扣摘要，輸入:', chargeSetting);

    const summaryParts: string[] = [];

    // 🔧 修正：使用大寫的欄位名稱
    if (chargeSetting.ChargeDetails && chargeSetting.ChargeDetails.length > 0) {
      const discountSummary = chargeSetting.ChargeDetails.map((detail: any) => {
        const discountLabel = this.getDiscountLabelByValue(detail.cag_barcode);
        return `${discountLabel}(${detail.cag_charge_rate}%)`;
      }).join(', ');
      summaryParts.push(`折扣設定: ${discountSummary}`);
    }

    if (chargeSetting.YearChargeDetails && chargeSetting.YearChargeDetails.length > 0) {
      const yearSummary = chargeSetting.YearChargeDetails.map((detail: any) => {
        return `${detail.year_amount}以上(+${detail.extra_rate}%)`;
      }).join(', ');
      summaryParts.push(`年度業績: ${yearSummary}`);
    }

    if (chargeSetting.LevelChargeDetails && chargeSetting.LevelChargeDetails.length > 0) {
      const levelSummary = chargeSetting.LevelChargeDetails.map((detail: any) => {
        const discountLabel = this.getDiscountLabelByValue(detail.cag_barcode);
        return `${discountLabel}(${detail.level_charge_rate}%)`;
      }).join(', ');
      summaryParts.push(`層級抽成: ${levelSummary}`);
    }

    const summary = summaryParts.join('; ') || '尚未設定';
    console.log('🏷️ 生成的摘要:', summary);
    return summary;
  }

  private convertAPIDataToCommissionItems(apiData: any): void {
    console.log('🔄 開始轉換 API 資料...');
    console.log('🔍 輸入的 apiData:', apiData);

    this.commissionItems = [];

    // 🔧 修正：使用正確的欄位名稱（大寫）
    if (apiData.ChargeSettings && Array.isArray(apiData.ChargeSettings)) {
      console.log('📊 處理', apiData.ChargeSettings.length, '個抽成設定項目');

      apiData.ChargeSettings.forEach((chargeSetting: any, index: number) => {
        console.log(`🔄 處理第 ${index + 1} 個項目:`, chargeSetting);

        const commissionItem: CommissionItem = {
          id: index + 1,
          commissionType: chargeSetting.tlt_id || '',
          commissionTypeName: chargeSetting.tlt_id_desc || '抽成類別' + (index + 1),
          taxType: chargeSetting.cag_taxtype === '1' ? 1 : 0,
          discountSummary: this.generateDiscountSummary(chargeSetting),
          transactionAmount: chargeSetting.sst_amount || 0,
          specialCommission: chargeSetting.sst_rate || 0,
          fullPointActivity: chargeSetting.cap_saletype2 === 'Y',
          thousandDiscount: chargeSetting.cap_saletype1 === 'Y',
          selectedSettingOption: 'discount',

          // 🔧 修正：使用正確的欄位名稱（大寫）
          discountSettingItems: this.convertChargeDetails(chargeSetting.ChargeDetails || []),
          annualPerformanceItems: this.convertYearChargeDetails(chargeSetting.YearChargeDetails || []),
          discountLevelItems: this.convertLevelChargeDetails(chargeSetting.LevelChargeDetails || []),
          detailItems: []
        };

        // 初始化 detailItems
        this.updateCommissionItemDetails(commissionItem);
        this.commissionItems.push(commissionItem);

        console.log(`✅ 完成第 ${index + 1} 個項目轉換:`, commissionItem);
      });
    } else {
      console.warn('⚠️ ChargeSettings 不存在或不是陣列');
    }

    // 更新顯示
    this.updateDetailItemsForDisplay();
    console.log('✅ 轉換完成，共', this.commissionItems.length, '個抽成項目');
    console.log('🎯 最終的 commissionItems:', this.commissionItems);
  }

  private convertChargeDetails(chargeDetails: any[]): DiscountSettingItem[] {
    return chargeDetails.map(detail => {
      return {
        selected: true,
        cag_barcode: detail.cag_barcode || '000',
        startDate: detail.tlt_bdate ? new Date(detail.tlt_bdate) : new Date(),
        endDate: detail.tlt_edate ? new Date(detail.tlt_edate) : new Date(),
        rate: detail.cag_charge_rate || 0
      };
    });
  }

  private convertYearChargeDetails(yearDetails: any[]): AnnualPerformanceItem[] {
    console.log('🔄 轉換 YearChargeDetails:', yearDetails);

    if (!Array.isArray(yearDetails)) {
      console.warn('⚠️ yearDetails 不是陣列:', yearDetails);
      return [];
    }

    return yearDetails.map(detail => {
      console.log('🔄 轉換單個 YearChargeDetail:', detail);

      return {
        selected: true,
        startDate: detail.tlt_bdate ? new Date(detail.tlt_bdate) : new Date(),
        endDate: detail.tlt_edate ? new Date(detail.tlt_edate) : new Date(),
        discountAmount: detail.year_amount || 0,
        rate: detail.extra_rate || 0
      };
    });
  }

  private convertLevelChargeDetails(levelDetails: any[]): DiscountLevelItem[] {
    return levelDetails.map(detail => {
      return {
        selected: true,
        cag_barcode: detail.cag_barcode,
        startAmount: detail.level_bmount || 0,
        endAmount: detail.level_eamount || 0,
        rate: detail.level_charge_rate || 0
      };
    });
  }

  // 🎯 修改：初始化空的抽成設定資料
  private initializeEmptyCommissionData(): void {
    console.log('📝 初始化空的抽成設定資料');
    this.commissionItems = [];
    this.commissionDataLoaded = true;
    this.dataLoaded = true; // 🎯 重要：確保狀態正確
  }

  private updateCommissionItemDetails(commissionItem: CommissionItem): void {
    console.log('🔄 更新委員會項目詳情，當前標籤:', this.selectedSettingTab);
    console.log('🔍 項目資料:', commissionItem);

    switch (this.selectedSettingTab) {
      case 'discount':
        commissionItem.detailItems = [...commissionItem.discountSettingItems];
        console.log('📊 設定折扣詳情項目數量:', commissionItem.detailItems.length);
        break;
      case 'annual':
        commissionItem.detailItems = [...commissionItem.annualPerformanceItems];
        console.log('📊 設定年度詳情項目數量:', commissionItem.detailItems.length);
        break;
      case 'level':
        commissionItem.detailItems = [...commissionItem.discountLevelItems];
        console.log('📊 設定層級詳情項目數量:', commissionItem.detailItems.length);
        break;
      default:
        commissionItem.detailItems = [...commissionItem.discountSettingItems];
        console.log('📊 設定預設詳情項目數量:', commissionItem.detailItems.length);
    }
  }

  // 🎯 修改：檢查是否有抽成資料的方法
  hasCommissionData(): boolean {
    const hasData = this.dataLoaded && this.commissionItems && this.commissionItems.length > 0;
    return hasData;
  }

  // 儲存抽成設定到工作流程
  private saveCommissionDataToWorkflow(): void {
    console.log('💾 ⚠️  儲存抽成設定資料被調用！');
    console.trace('📍 誰調用了儲存？完整調用堆疊:');
    console.log('💾 當前 commissionItems 長度:', this.commissionItems.length);

    try {
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

    // 🎯 先更新選項
    this.updateDiscountColumnOptions();

    switch (this.selectedSettingTab) {
      case 'discount':
        this.detailColumns = [...this.discountColumns];  // 🎯 用展開運算子強制更新
        break;
      case 'annual':
        this.detailColumns = this.annualColumns;
        break;
      case 'level':
        this.detailColumns = [...this.levelColumns];  // 🎯 用展開運算子強制更新
        break;
      default:
        this.detailColumns = [...this.discountColumns];
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
    console.log('🔄 更新詳細項目顯示, 選項卡:', this.selectedSettingTab);
    console.log('🔍 當前 commissionItems 數量:', this.commissionItems.length);

    this.commissionItems.forEach((item, index) => {
      console.log(`🔄 處理第 ${index + 1} 個項目:`, item.id);

      // 清空當前 detailItems
      item.detailItems = [];

      // 根據當前選擇的選項卡類型複製對應的詳細數據
      switch (this.selectedSettingTab) {
        case 'discount':
          if (item.discountSettingItems && item.discountSettingItems.length > 0) {
            item.discountSettingItems.forEach(discountItem => {
              item.detailItems.push({ ...discountItem });
            });
            console.log(`📊 項目 ${item.id} 折扣設定項目數量:`, item.detailItems.length);
          } else {
            console.log(`📭 項目 ${item.id} 沒有折扣設定項目`);
          }
          break;
        case 'annual':
          if (item.annualPerformanceItems && item.annualPerformanceItems.length > 0) {
            item.annualPerformanceItems.forEach(annualItem => {
              item.detailItems.push({ ...annualItem });
            });
            console.log(`📊 項目 ${item.id} 年度業績項目數量:`, item.detailItems.length);
          } else {
            console.log(`📭 項目 ${item.id} 沒有年度業績項目`);
          }
          break;
        case 'level':
          if (item.discountLevelItems && item.discountLevelItems.length > 0) {
            item.discountLevelItems.forEach(levelItem => {
              item.detailItems.push({ ...levelItem });
            });
            console.log(`📊 項目 ${item.id} 層級抽成項目數量:`, item.detailItems.length);
          } else {
            console.log(`📭 項目 ${item.id} 沒有層級抽成項目`);
          }
          break;
      }

      console.log(`✅ 項目 ${item.id} 最終詳細項目數量:`, item.detailItems.length);
    });

    console.log('✅ 所有項目詳細顯示更新完成');
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
      cag_barcode: '',  // ✅ 修正為 cag_barcode
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
      cag_barcode: '',  // ✅ 修正為 cag_barcode
      startAmount: 0,
      endAmount: 0,
      rate: 0
    };
  }

  // 創建佣金項目
  createCommissionItem(id: number): CommissionItem {
    const discountSettingItems: DiscountSettingItem[] = [];
    for (let i = 0; i < 5; i++) {
      discountSettingItems.push(this.createDiscountSettingItem());
    }

    const annualPerformanceItems: AnnualPerformanceItem[] = [];
    for (let i = 0; i < 5; i++) {
      annualPerformanceItems.push(this.createAnnualPerformanceItem());
    }

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
      selectedSettingOption: 'discount',
      discountSettingItems: discountSettingItems,
      annualPerformanceItems: annualPerformanceItems,
      discountLevelItems: discountLevelItems,
      detailItems: []
    };

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
    console.log('🚨 onAddCommissionItem 被調用！');
    console.trace('📍 誰調用了 onAddCommissionItem？');

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
    let formattedItems = '';
    this.syncDetailItemsToSource(item);

    switch (settingType) {
      case 'discount':
        const selectedDiscounts = item.discountSettingItems.filter(i => i.selected);
        const formattedDiscounts = selectedDiscounts.map((discountItem, idx) => {
          const discountLabel = this.getDiscountLabelByValue(discountItem.cag_barcode);  // ✅ 修正為 cag_barcode
          const startDate = discountItem.startDate ? this.formatDate(discountItem.startDate) : '';
          const endDate = discountItem.endDate ? this.formatDate(discountItem.endDate) : '';
          return `折扣設定 ${idx + 1}: ${discountLabel}, ${startDate}, ${endDate}, ${discountItem.rate}%`;
        }).join('; ');
        formattedItems = formattedDiscounts;
        break;

      case 'annual':
        const selectedAnnuals = item.annualPerformanceItems.filter(i => i.selected);
        const formattedAnnuals = selectedAnnuals.map((annualItem, idx) => {
          const startDate = annualItem.startDate ? this.formatDate(annualItem.startDate) : '';
          const endDate = annualItem.endDate ? this.formatDate(annualItem.endDate) : '';
          return `年度業績 ${idx + 1}: ${startDate}-${endDate}, ${annualItem.discountAmount}, ${annualItem.rate}%`;
        }).join('; ');
        formattedItems = formattedAnnuals;
        break;

      case 'level':
        const selectedLevels = item.discountLevelItems.filter(i => i.selected);
        const formattedLevels = selectedLevels.map((levelItem, idx) => {
          const discountLabel = this.getDiscountLabelByValue(levelItem.cag_barcode);  // ✅ 修正為 cag_barcode
          return `折扣層級 ${idx + 1}: ${discountLabel}, ${levelItem.startAmount}-${levelItem.endAmount}, ${levelItem.rate}%`;
        }).join('; ');
        formattedItems = formattedLevels;
        break;
    }

    if (formattedItems) {
      item.discountSummary = formattedItems;
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
    switch (settingType) {
      case 'discount':
        item.discountSettingItems.forEach(i => {
          i.selected = false;
          i.cag_barcode = '';  // ✅ 修正為 cag_barcode
          i.rate = 0;
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
          i.startDate = new Date();
          i.endDate = new Date();
        });
        break;
      case 'level':
        item.discountLevelItems.forEach(i => {
          i.selected = false;
          i.cag_barcode = '';  // ✅ 修正為 cag_barcode
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
