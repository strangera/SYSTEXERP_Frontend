import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { SelectItem } from 'primeng/api';
import { ColumnDef } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { ContractFlowService, WorkflowStep } from '../tls13010/services/contract-flow.service';
import { TLS13010Service } from '../../../service/API/tls/tls13010.service';
import { TLS13010_DROPDOWN_OPTIONS } from '../tls13010/tls13010.dropdown';
import { LocationOptionsService } from '../../../service/API/dropdownservice/location-options.service';
import { ContractInfo, CommissionItem, DiscountSettingItem, AnnualPerformanceItem, DiscountLevelItem } from '../tls13010/tls13010.model';

// ... 介面定義保持不變 ...

@Component({
  selector: 'app-tls13010-next2',
  templateUrl: './tls13010-next2.component.html',
  styleUrls: ['./tls13010-next2.component.scss']
})
export class TLS13010Next2Component extends BasicCruPageComponent<ContractInfo> implements OnInit, OnDestroy {
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
    {
      field: 'cag_barcode',
      header: '折扣別',
      type: 'dropdown',
      editable: true,
      options: []  // 這裡會被 updateDiscountColumnOptions 更新
    },
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
    {
      field: 'cag_barcode',
      header: '折扣別',
      type: 'dropdown',
      editable: true,
      options: []  // 這裡會被 updateDiscountColumnOptions 更新
    },
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
    // { field: 'discountSummary', header: '設定摘要', editable: true },
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

  // 修改：載入折數選項，返回 Promise
  private loadDiscountOptions(): Promise<void> {
    return new Promise((resolve) => {
      console.log('🔽 開始載入折數選項...');
      console.log('discountOptions:', this.discountOptions);
      this.paperTypeService.getPaperTypeOptions('T102').subscribe({
        next: (options: any[]) => {
          console.log('📥 API 回傳的折扣選項:', options);

          // 直接使用 service 回傳的格式
          this.discountOptions = options;
          this.discounts = [...this.discountOptions];

          console.log('🔄 設定折扣選項:', this.discountOptions);
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
    console.log('🟢 options:', this.discountOptions);
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

    // 🎯 新增：同時更新 detailColumns 以確保顯示正確
    this.updateDetailColumns();
  }

  // 🎯 修改：載入工作流程資料
  private loadWorkflowData(): void {
    const workflowData = this.contractFlowService.getCurrentData();

    if (workflowData.queryRowData?.talent_id) {
      this.currentTalentId = workflowData.queryRowData.talent_id;
      this.currentContractData = workflowData.queryRowData;

      const step1Data = this.contractFlowService.getStep1Data();

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

      this.loadCommissionData();
    } else {
      this.router.navigate(['/TLS/TLS13010CRU']);
    }
  }

  // 🎯 修改：載入抽成設定資料
  private loadCommissionData(): void {
    this.loading = true;
    this.commissionDataLoaded = false;

    // 先檢查暫存資料
    const savedCommissionData = this.contractFlowService.getStepData(WorkflowStep.COMMISSION);

    if (savedCommissionData && Array.isArray(savedCommissionData) && savedCommissionData.length > 0) {
      console.log('📦 找到暫存抽成資料，使用暫存資料', JSON.stringify(savedCommissionData, null, 2));
      this.commissionItems = savedCommissionData;
      this.commissionDataLoaded = true;
      this.dataLoaded = true;
      this.loading = false;
      this.updateDetailItemsForDisplay();
    } else {
      console.log('📭 沒有暫存抽成資料，從 API 載入');
      this.loadCommissionDataFromAPI();
    }
  }

  private loadCommissionDataFromAPI(): void {
    if (!this.currentTalentId) {
      this.initializeEmptyCommissionData();
      return;
    }

    this.loading = true;
    this.dataLoaded = false;
    this.commissionDataLoaded = false;

    this.tls13010Service.queryTLS13010Charge(this.currentTalentId).subscribe({
      next: (response) => {
        if (response?.Data?.ChargeSettings && Array.isArray(response.Data.ChargeSettings)) {
          this.convertAPIDataToCommissionItems(response.Data);
          this.commissionDataLoaded = true;
        } else if (response?.Data && Array.isArray(response.Data)) {
          this.convertAPIDataToCommissionItems({ ChargeSettings: response.Data });
          this.commissionDataLoaded = true;
        } else {
          this.initializeEmptyCommissionData();
        }

        this.dataLoaded = true;
        this.loading = false;

        // 儲存到暫存
        this.saveCommissionDataToWorkflow();
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
    const option = this.discountOptions.find(opt => String(opt.value) === String(value));
    if (option) return option.label;
    return value || '未設定';
  }

  // 生成折扣摘要
  private generateDiscountSummary(chargeSetting: any): string {
    console.log('🏷️ 生成折扣摘要，輸入資料:', chargeSetting);

    const summaryParts: string[] = [];

    if (chargeSetting.ChargeDetails && chargeSetting.ChargeDetails.length > 0) {
      console.log('📊 處理折扣設定:', chargeSetting.ChargeDetails);
      const discountSummary = chargeSetting.ChargeDetails.map((detail: any) => {
        const discountLabel = this.getDiscountLabelByValue(detail.cag_barcode);
        console.log(`🔍 折扣設定項目: ${detail.cag_barcode} -> ${discountLabel}`);
        return `${discountLabel}(${detail.cag_charge_rate}%)`;
      }).join(', ');
      summaryParts.push(`折扣設定: ${discountSummary}`);
    }

    if (chargeSetting.YearChargeDetails && chargeSetting.YearChargeDetails.length > 0) {
      console.log('📊 處理年度業績:', chargeSetting.YearChargeDetails);
      const yearSummary = chargeSetting.YearChargeDetails.map((detail: any) => {
        return `${detail.year_amount}以上(+${detail.extra_rate}%)`;
      }).join(', ');
      summaryParts.push(`年度業績: ${yearSummary}`);
    }

    if (chargeSetting.LevelChargeDetails && chargeSetting.LevelChargeDetails.length > 0) {
      console.log('📊 處理層級抽成:', chargeSetting.LevelChargeDetails);
      const levelSummary = chargeSetting.LevelChargeDetails.map((detail: any) => {
        const discountLabel = this.getDiscountLabelByValue(detail.cag_barcode);
        console.log(`🔍 層級抽成項目: ${detail.cag_barcode} -> ${discountLabel}`);
        return `${discountLabel}(${detail.level_charge_rate}%)`;
      }).join(', ');
      summaryParts.push(`層級抽成: ${levelSummary}`);
    }

    const summary = summaryParts.join('; ') || '尚未設定';
    console.log('🏷️ 生成的摘要:', summary);
    return summary;
  }

  private convertAPIDataToCommissionItems(apiData: any): void {
    this.commissionItems = [];

    if (apiData.ChargeSettings && Array.isArray(apiData.ChargeSettings)) {
      apiData.ChargeSettings.forEach((chargeSetting: any, index: number) => {
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
          discountSettingItems: this.convertChargeDetails(chargeSetting.ChargeDetails || []),
          annualPerformanceItems: this.convertYearChargeDetails(chargeSetting.YearChargeDetails || []),
          discountLevelItems: this.convertLevelChargeDetails(chargeSetting.LevelChargeDetails || []),
          detailItems: []
        };

        this.updateCommissionItemDetails(commissionItem);
        this.commissionItems.push(commissionItem);
      });
    }

    this.updateDetailItemsForDisplay();
  }

  private convertChargeDetails(chargeDetails: any[]): DiscountSettingItem[] {
    console.log('🔄 開始轉換折扣設定資料:', chargeDetails);

    return chargeDetails.map(detail => {
      const cag_barcode = detail.cag_barcode || '';
      console.log(`📝 處理折扣設定項目，原始 cag_barcode: ${cag_barcode}`);

      return {
        selected: true,
        cag_barcode: cag_barcode,
        startDate: detail.tlt_bdate ? new Date(detail.tlt_bdate) : new Date(),
        endDate: detail.tlt_edate ? new Date(detail.tlt_edate) : new Date(),
        rate: detail.cag_charge_rate || 0
      };
    });
  }

  private convertYearChargeDetails(yearDetails: any[]): AnnualPerformanceItem[] {
    if (!Array.isArray(yearDetails)) {
      return [];
    }

    return yearDetails.map(detail => {
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
    console.log('🔄 開始轉換層級抽成資料:', levelDetails);

    return levelDetails.map(detail => {
      const cag_barcode = detail.cag_barcode || '';
      console.log(`📝 處理層級抽成項目，原始 cag_barcode: ${cag_barcode}`);

      return {
        selected: true,
        cag_barcode: cag_barcode,
        startAmount: detail.level_bmount || 0,
        endAmount: detail.level_eamount || 0,
        rate: detail.level_charge_rate || 0
      };
    });
  }

  // 🎯 修改：初始化空的抽成設定資料
  private initializeEmptyCommissionData(): void {
    this.commissionItems = [];
    this.commissionDataLoaded = true;
    this.dataLoaded = true; // 🎯 重要：確保狀態正確
  }

  private updateCommissionItemDetails(commissionItem: CommissionItem): void {
    switch (this.selectedSettingTab) {
      case 'discount':
        commissionItem.detailItems = [...commissionItem.discountSettingItems];
        break;
      case 'annual':
        commissionItem.detailItems = [...commissionItem.annualPerformanceItems];
        break;
      case 'level':
        commissionItem.detailItems = [...commissionItem.discountLevelItems];
        break;
      default:
        commissionItem.detailItems = [...commissionItem.discountSettingItems];
    }
  }

  // 🎯 修改：檢查是否有抽成資料的方法
  hasCommissionData(): boolean {
    const hasData = this.dataLoaded && this.commissionItems && this.commissionItems.length > 0;
    return hasData;
  }

  // 儲存抽成設定到工作流程
  private saveCommissionDataToWorkflow(): void {
    this.contractFlowService.saveStep3Data(this.commissionItems);
  }

  // 切換設置選項卡
  changeSettingTab(tab: string): void {
    this.selectedSettingTab = tab;
    this.updateDetailColumns();
    this.updateDetailItemsForDisplay();
  }

  // 更新詳情列定義
  updateDetailColumns(): void {
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
        return rowData.discountSettingItems.filter(i => i._status !== 'deleted');
      case 'annual':
        return rowData.annualPerformanceItems.filter(i => i._status !== 'deleted');
      case 'level':
        return rowData.discountLevelItems.filter(i => i._status !== 'deleted');
      default:
        return rowData.discountSettingItems.filter(i => i._status !== 'deleted');
    }
  }

  // 添加新項目
  addDetailItem(rowData: CommissionItem): void {
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
    this.commissionItems.forEach((item, index) => {
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
    const annualPerformanceItems: AnnualPerformanceItem[] = [];
    const discountLevelItems: DiscountLevelItem[] = [];

    const item: CommissionItem = {
      id: id,
      commissionType: '',
      commissionTypeName: '',
      taxType: 1,
      discountSummary: '尚未設定',
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

    // 新增時內層 table 不帶任何預設資料
    item.detailItems = [];

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
    this.saveCommissionDataToWorkflow();
  }

  // 添加折扣設置項目
  addDiscountSettingItem(item: CommissionItem): void {
    const newItem = this.createDiscountSettingItem();
    newItem._status = 'new';
    item.discountSettingItems.push(newItem);
    this.updateDetailItemsForDisplay();
    this.saveCommissionDataToWorkflow();
  }

  // 添加年度業績項目
  addAnnualPerformanceItem(item: CommissionItem): void {
    const newItem = this.createAnnualPerformanceItem();
    newItem._status = 'new';
    item.annualPerformanceItems.push(newItem);
    this.updateDetailItemsForDisplay();
    this.saveCommissionDataToWorkflow();
  }

  addDiscountLevelItem(item: CommissionItem): void {
    const newItem = this.createDiscountLevelItem();
    newItem._status = 'new';
    item.discountLevelItems.push(newItem);
    this.updateDetailItemsForDisplay();
    this.saveCommissionDataToWorkflow();
  }

  // 刪除折扣設置項目
  removeDiscountSettingItem(item: CommissionItem, index: number): void {
    const target = item.discountSettingItems[index];
    if (target._status === 'new') {
      // 新增的直接移除
      item.discountSettingItems.splice(index, 1);
    } else {
      // 既有的標記為 deleted
      target._status = 'deleted';
    }
    this.updateDetailItemsForDisplay();
    this.saveCommissionDataToWorkflow();
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
  }

  // 表格項目保存事件
  onItemSave(event: { oldData: any, newData: any }): void {
    if (event.oldData._status === 'original') {
      event.newData._status = 'modified';
    }
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
  }

  // 🎯 新增：處理下拉選單變更事件
  onDropdownChange(event: { rowData: any, field: string, newValue: any, oldValue: any }): void {
    console.log('🔄 下拉選單變更:', event);

    // 更新資料後立即儲存到暫存
    this.saveCommissionDataToWorkflow();
  }

  // 詳細內容保存
  onDetailSave(item: CommissionItem, settingType: string): void {
    let formattedItems = '';
    this.syncDetailItemsToSource(item);

    switch (settingType) {
      case 'discount':
        const selectedDiscounts = item.discountSettingItems.filter(i => i.selected);
        const formattedDiscounts = selectedDiscounts.map((discountItem, idx) => {
          const discountLabel = this.getDiscountLabelByValue(discountItem.cag_barcode);
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
          const discountLabel = this.getDiscountLabelByValue(levelItem.cag_barcode);
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
      this.saveCommissionDataToWorkflow();
    }
  }

  onRowCancel(event: any) {
  }

  onDetailEdit(event: any): void {
  }

  onDetailTabChange(event: { rowData: any, tabId: string }) {
    const { rowData, tabId } = event;
    this.selectedSettingTab = tabId;
    this.updateDetailColumns();
    this.updateDetailItemsForDisplay();
  }

  // 批次刪除處理
  onBatchDelete(selectedItems: any[]) {
    if (confirm(`確定要刪除選取的 ${selectedItems.length} 個項目嗎？`)) {
      selectedItems.forEach(item => {
        const index = this.commissionItems.findIndex(x => x.id === item.id);
        if (index > -1) {
          this.commissionItems.splice(index, 1);
        }
      });

      this.saveCommissionDataToWorkflow();
    }
  }

  // 新增明細項目處理
  onAddDetailItem(parentData: any) {
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
