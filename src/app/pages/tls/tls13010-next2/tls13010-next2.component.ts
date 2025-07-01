import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { SelectItem } from 'primeng/api';
import { ColumnDef } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { ContractFlowService, WorkflowStep } from '../tls13010/services/contract-flow.service';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { TLS13010_DROPDOWN_OPTIONS } from '../tls13010/tls13010.dropdown';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { ContractInfo, CommissionItem, DiscountSettingItem, AnnualPerformanceItem, DiscountLevelItem, Step3DataChangeTracker } from '../tls13010/tls13010.model';

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
  // commissionItems: CommissionItem[] = [];
  commissionData: CommissionItem[] = []; // 改名並加強狀態管理

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
      this.setupAutoSave(); // 🎯 新增這行
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupAutoSave(): void {
    // 監聽表單變更（如果有的話）
    if (this.dataForm) {
      const formSubscription = this.dataForm.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        this.saveToWorkflow();
      });
      this.subscriptions.push(formSubscription);
    }
  }

  private saveToWorkflow(): void {
    if (this.hasCommissionChanges()) {
      // 🔧 重要：確保 talent_id 正確設定
      Step3DataChangeTracker.setCurrentTalentId(this.currentTalentId);

      const processedData = this.prepareCommissionDataForSubmit();
      this.contractFlowService.saveStep3Data(processedData);
      console.log('✅ 已暫存抽成資料到工作流程:', processedData);
    }
  }

  private hasCommissionChanges(): boolean {
    return this.commissionData.some(item =>
      item._status === 'new' ||
      item._status === 'modified' ||
      item._status === 'deleted' ||
      this.hasDetailItemChanges(item)
    );
  }

  // 檢查明細項目是否有變更
  private hasDetailItemChanges(commissionItem: CommissionItem): boolean {
    const hasDiscountChanges = commissionItem.discountSettingItems.some(item =>
      item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
    );

    const hasAnnualChanges = commissionItem.annualPerformanceItems.some(item =>
      item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
    );

    const hasLevelChanges = commissionItem.discountLevelItems.some(item =>
      item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
    );

    return hasDiscountChanges || hasAnnualChanges || hasLevelChanges;
  }

  private prepareCommissionDataForSubmit(): CommissionItem[] {
    console.log('🔄 準備抽成資料供提交，原始資料:', this.commissionData);

    // 🎯 重要：直接回傳 CommissionItem 陣列，讓 contractFlowService 統一處理
    const processedData = this.commissionData.map(item => {
      // 🎯 確保每個主項目都有正確的狀態
      const processedItem = {
        ...item,
        _status: item._status || (this.hasItemId(item) ? 'original' : 'new'),

        // 🎯 確保明細項目也有正確的狀態
        discountSettingItems: item.discountSettingItems.map(detail => ({
          ...detail,
          _status: detail._status || (this.hasItemId(detail) ? 'original' : 'new')
        })),

        annualPerformanceItems: item.annualPerformanceItems.map(detail => ({
          ...detail,
          _status: detail._status || (this.hasItemId(detail) ? 'original' : 'new')
        })),

        discountLevelItems: item.discountLevelItems.map(detail => ({
          ...detail,
          _status: detail._status || (this.hasItemId(detail) ? 'original' : 'new')
        }))
      };

      return processedItem;
    });

    console.log('✅ 處理後的抽成資料:', processedData);
    return processedData;
  }

  private prepareCommissionMasters(): any[] {
    return this.commissionData
      .filter(item => item._status !== 'deleted')
      .map(item => ({
        id: this.hasItemId(item) ? item.id : undefined,
        talent_id: this.currentTalentId,
        tlt_id: item.commissionType,
        tlt_id_desc: item.commissionTypeName,
        cag_bdate: item.mainStartDate || this.contractInfoData[0]?.tlt_bdate,
        cag_edate: item.mainEndDate || this.contractInfoData[0]?.tlt_edate,
        cag_taxtype: item.taxType === 1 ? '1' : '0',
        sst_amount: item.transactionAmount,
        sst_rate: item.specialCommission,
        cap_saletype1: item.thousandDiscount ? 'Y' : 'N',
        cap_saletype2: item.fullPointActivity ? 'Y' : 'N',
        _status: item._status,
        _operation: this.getOperationType(item._status)
      }));
  }

  // 🎯 準備折扣設定明細 (TLTTALENT_CHARGED)
  private prepareChargeDetails(): any[] {
    const allChargeDetails: any[] = [];

    this.commissionData.forEach(commission => {
      commission.discountSettingItems.forEach(detail => {
        // 🎯 只要明細項目有狀態就加入
        if (detail._status) {
          allChargeDetails.push({
            id: this.hasItemId(detail) ? detail.id : undefined,
            talent_id: this.currentTalentId,
            tlt_id: commission.commissionType,
            cag_barcode: detail.cag_barcode,
            tlt_bdate: detail.startDate,
            tlt_edate: detail.endDate,
            cag_charge_rate: detail.rate,
            _status: detail._status,
            _operation: this.getOperationType(detail._status),
            _parentId: commission.id  // 追蹤關聯
          });
        }
      });
    });

    return allChargeDetails;
  }

  // 🎯 準備年度業績明細 (TLTTALENT_YEARCHARGED)
  private prepareYearChargeDetails(): any[] {
    const allYearDetails: any[] = [];

    this.commissionData.forEach(commission => {
      commission.annualPerformanceItems.forEach(detail => {
        if (detail._status) {
          allYearDetails.push({
            id: this.hasItemId(detail) ? detail.id : undefined,
            talent_id: this.currentTalentId,
            tlt_id: commission.commissionType,
            tlt_bdate: detail.startDate,
            tlt_edate: detail.endDate,
            year_amount: detail.discountAmount,
            extra_rate: detail.rate,
            _status: detail._status,
            _operation: this.getOperationType(detail._status),
            _parentId: commission.id
          });
        }
      });
    });

    return allYearDetails;
  }

  // 🎯 準備層級抽成明細 (TLTTALENT_LEVEL_CHARGED)
  private prepareLevelChargeDetails(): any[] {
    const allLevelDetails: any[] = [];

    this.commissionData.forEach(commission => {
      commission.discountLevelItems.forEach((detail, index) => {
        if (detail._status) {
          allLevelDetails.push({
            id: this.hasItemId(detail) ? detail.id : undefined,
            talent_id: this.currentTalentId,
            tlt_id: commission.commissionType,
            seq_no: index + 1, // 序號
            cag_barcode: detail.cag_barcode,
            level_bmount: detail.startAmount,
            level_eamount: detail.endAmount,
            level_charge_rate: detail.rate,
            _status: detail._status,
            _operation: this.getOperationType(detail._status),
            _parentId: commission.id
          });
        }
      });
    });

    return allLevelDetails;
  }

  private getOperationType(status?: string): string {
    switch (status) {
      case 'new': return 'INSERT';
      case 'modified': return 'UPDATE';
      case 'deleted': return 'DELETE';
      default: return 'NONE';
    }
  }

  createAnnualPerformanceItem(): AnnualPerformanceItem {
    return {
      id: this.generateTempId(), // 🎯 給每個明細項目一個 ID
      selected: false,
      startDate: new Date(),
      endDate: new Date(),
      discountAmount: 0,
      rate: 0,
      _status: 'new'
    };
  }

  private cleanDetailItems<T extends { _status?: string }>(items: T[]): T[] {
    return items.filter(item => {
      // 過濾掉新增後又刪除的項目
      if (item._status === 'deleted' && !this.hasItemId(item)) {
        return false;
      }
      return true;
    }).map(item => ({
      ...item,
      _status: item._status || 'original'
    }));
  }

  private hasItemId(item: any): boolean {
    return item.id && item.id !== 'temp_' && !item.id.toString().startsWith('temp_');
  }

  // 檢查是否為新增的抽成項目
  private isNewCommissionItem(item: CommissionItem): boolean {
    return !this.hasItemId(item) || item._status === 'new';
  }

  // 生成臨時ID
  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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

      Step3DataChangeTracker.setCurrentTalentId(this.currentTalentId);

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
        tlt_contract_edate: step1Data?.tlt_contract_edate || this.currentContractData.tlt_contract_edate || '',
        tlt_term_type: (step1Data?.tlt_term_type || this.currentContractData.tlt_term_type || '').toString().trim() || '-',
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
      this.commissionData = savedCommissionData.map(item => ({
        ...item,
        _status: item._status || 'original' // 🎯 確保狀態正確
      }));
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

        // 🎯 重要：載入完成後立即更新顯示並保存
        this.updateDetailItemsForDisplay();
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
    this.commissionData = [];

    if (apiData.ChargeSettings && Array.isArray(apiData.ChargeSettings)) {
      apiData.ChargeSettings.forEach((chargeSetting: any, index: number) => {
        const commissionItem: CommissionItem = {
          id: chargeSetting.id || (index + 1),
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
          detailItems: [],
          _status: 'original' // 🎯 新增這行
        };

        this.updateCommissionItemDetails(commissionItem);
        this.commissionData.push(commissionItem);
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
        id: detail.id || this.generateTempId(), // 🎯 確保有 ID
        selected: true,
        cag_barcode: cag_barcode,
        startDate: detail.tlt_bdate ? new Date(detail.tlt_bdate) : new Date(),
        endDate: detail.tlt_edate ? new Date(detail.tlt_edate) : new Date(),
        rate: detail.cag_charge_rate || 0,
        _status: 'original'
      };
    });
  }

  private convertYearChargeDetails(yearDetails: any[]): AnnualPerformanceItem[] {
    if (!Array.isArray(yearDetails)) {
      return [];
    }

    return yearDetails.map(detail => {
      return {
        id: detail.id || this.generateTempId(), // 🎯 確保有 ID
        selected: true,
        startDate: detail.tlt_bdate ? new Date(detail.tlt_bdate) : new Date(),
        endDate: detail.tlt_edate ? new Date(detail.tlt_edate) : new Date(),
        discountAmount: detail.year_amount || 0,
        rate: detail.extra_rate || 0,
        _status: 'original'
      };
    });
  }

  private convertLevelChargeDetails(levelDetails: any[]): DiscountLevelItem[] {
    console.log('🔄 開始轉換層級抽成資料:', levelDetails);

    return levelDetails.map(detail => {
      const cag_barcode = detail.cag_barcode || '';
      console.log(`📝 處理層級抽成項目，原始 cag_barcode: ${cag_barcode}`);

      return {
        id: detail.id || this.generateTempId(), // 🎯 確保有 ID
        selected: true,
        cag_barcode: cag_barcode,
        startAmount: detail.level_bmount || 0,
        endAmount: detail.level_eamount || 0,
        rate: detail.level_charge_rate || 0,
        _status: 'original'
      };
    });
  }

  // 🎯 修改：初始化空的抽成設定資料
  private initializeEmptyCommissionData(): void {
    this.commissionData = [];
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
    const hasData = this.dataLoaded && this.commissionData && this.commissionData.length > 0;
    return hasData;
  }

  // 儲存抽成設定到工作流程
  private saveCommissionDataToWorkflow(): void {
    this.contractFlowService.saveStep3Data(this.commissionData);
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
    console.log('🔄 更新顯示資料，當前選項卡:', this.selectedSettingTab);

    this.commissionData.forEach((item, index) => {
      // 清空當前 detailItems
      item.detailItems = [];

      // 根據當前選擇的選項卡類型複製對應的詳細數據
      switch (this.selectedSettingTab) {
        case 'discount':
          if (item.discountSettingItems && item.discountSettingItems.length > 0) {
            // 🎯 只顯示未刪除的項目，並確保所有欄位完整
            item.discountSettingItems
              .filter(discountItem => discountItem._status !== 'deleted')
              .forEach(discountItem => {
                const displayItem = {
                  ...discountItem,
                  cag_barcode: discountItem.cag_barcode || '',
                  rate: discountItem.rate || 0,
                  startDate: discountItem.startDate || new Date(),
                  endDate: discountItem.endDate || new Date()
                };
                item.detailItems.push(displayItem);
              });
          }
          break;

        case 'annual':
          if (item.annualPerformanceItems && item.annualPerformanceItems.length > 0) {
            item.annualPerformanceItems
              .filter(annualItem => annualItem._status !== 'deleted')
              .forEach(annualItem => {
                const displayItem = {
                  ...annualItem,
                  startDate: annualItem.startDate || new Date(),
                  endDate: annualItem.endDate || new Date(),
                  discountAmount: annualItem.discountAmount || 0,
                  rate: annualItem.rate || 0
                };
                item.detailItems.push(displayItem);
              });
          }
          break;

        case 'level':
          if (item.discountLevelItems && item.discountLevelItems.length > 0) {
            item.discountLevelItems
              .filter(levelItem => levelItem._status !== 'deleted')
              .forEach(levelItem => {
                const displayItem = {
                  ...levelItem,
                  cag_barcode: levelItem.cag_barcode || '',
                  startAmount: levelItem.startAmount || 0,
                  endAmount: levelItem.endAmount || 0,
                  rate: levelItem.rate || 0
                };
                item.detailItems.push(displayItem);
              });
          }
          break;
      }

      console.log(`✅ 項目 ${index} 的明細資料已更新，共 ${item.detailItems.length} 筆`);
      if (item.detailItems.length > 0) {
        console.log('✅ 明細資料內容:', item.detailItems);
      }
    });

    // 🎯 強制觸發變更檢測
    this.commissionData = [...this.commissionData];
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
      id: this.generateTempId(), // 🎯 確保有 ID
      selected: false,
      cag_barcode: '',
      startDate: startDate,
      endDate: endDate,
      rate: 0,
      _status: 'new'
    };
  }

  // 創建折扣等級項目
  createDiscountLevelItem(): DiscountLevelItem {
    return {
      id: this.generateTempId(), // 🎯 確保有 ID
      selected: false,
      cag_barcode: '',
      startAmount: 0,
      endAmount: 0,
      rate: 0,
      _status: 'new'
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
      detailItems: [],
      _status: 'new'
    };

    // 新增時內層 table 不帶任何預設資料
    item.detailItems = [];

    return item;
  }

  // 添加新的佣金項目
  onAddCommissionItem(): void {
    console.log('➕ 新增抽成項目');

    const newCommissionItem: CommissionItem = {
      id: this.generateTempId(),
      commissionType: '',
      commissionTypeName: '抽成類別' + (this.commissionData.length + 1),
      taxType: 1,
      discountSummary: '尚未設定',
      transactionAmount: 0,
      specialCommission: 0,
      fullPointActivity: false,
      thousandDiscount: false,
      selectedSettingOption: 'discount',
      discountSettingItems: [],
      annualPerformanceItems: [],
      discountLevelItems: [],
      detailItems: [],
      _status: 'new' // 🎯 明確標記為新增
    };

    this.commissionData = [...this.commissionData, newCommissionItem];
    this.updateDetailItemsForDisplay();
    this.saveToWorkflow();

    console.log('✅ 新增抽成項目完成，ID:', newCommissionItem.id);
    this.messageService.infoBubble('已新增抽成項目');
  }


  // 設置選項改變
  onSettingOptionChange(item: CommissionItem): void {
    this.saveCommissionDataToWorkflow();
  }

  // 添加折扣設置項目
  addDiscountSettingItem(item: CommissionItem): void {
    console.log('➕ 新增折扣設定項目');

    const newItem = this.createDiscountSettingItem();
    newItem._status = 'new'; // 🎯 明確標記新增狀態
    newItem.id = this.generateTempId(); // 🎯 確保有 ID

    item.discountSettingItems.push(newItem);
    this.updateDetailItemsForDisplay();
    this.saveToWorkflow();

    console.log('✅ 新增折扣設定項目完成');
  }

  // 添加年度業績項目
  addAnnualPerformanceItem(item: CommissionItem): void {
    console.log('➕ 新增年度業績項目');

    const newItem = this.createAnnualPerformanceItem();
    newItem._status = 'new';
    newItem.id = this.generateTempId();

    item.annualPerformanceItems.push(newItem);
    this.updateDetailItemsForDisplay();
    this.saveToWorkflow();

    console.log('✅ 新增年度業績項目完成');
  }

  addDiscountLevelItem(item: CommissionItem): void {
    console.log('➕ 新增折扣層級項目');

    const newItem = this.createDiscountLevelItem();
    newItem._status = 'new';
    newItem.id = this.generateTempId();

    item.discountLevelItems.push(newItem);
    this.updateDetailItemsForDisplay();
    this.saveToWorkflow();

    console.log('✅ 新增折扣層級項目完成');
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
    this.saveToWorkflow();
  }

  // 刪除年度業績項目
  removeAnnualPerformanceItem(item: CommissionItem, index: number): void {
    const target = item.annualPerformanceItems[index];
    if (target._status === 'new') {
      item.annualPerformanceItems.splice(index, 1);
    } else {
      target._status = 'deleted';
    }

    this.updateDetailItemsForDisplay();
    this.saveToWorkflow();
  }

  // 刪除折扣等級項目
  removeDiscountLevelItem(item: CommissionItem, index: number): void {
    const target = item.discountLevelItems[index];
    if (target._status === 'new') {
      item.discountLevelItems.splice(index, 1);
    } else {
      target._status = 'deleted';
    }

    this.updateDetailItemsForDisplay();
    this.saveToWorkflow();
  }
  // 表格項目編輯事件
  onItemEdit(item: any): void {
  }

  // 表格項目保存事件
  onItemSave(event: { oldData: any, newData: any }): void {
    console.log('💾 主表格儲存事件:', event);

    const { oldData, newData } = event;

    // 🎯 強制檢查資料是否有變更
    const hasMainDataChanges = this.hasMainDataChanges(oldData, newData);

    if (hasMainDataChanges && oldData._status === 'original') {
      newData._status = 'modified';
      console.log(`📝 主項目 ${newData.commissionType} 有變更，標記為 modified`);
    } else if (!newData._status && !this.hasItemId(newData)) {
      newData._status = 'new';
      console.log(`🆕 主項目 ${newData.commissionType} 是新項目，標記為 new`);
    }

    // 🎯 同步到原始資料陣列
    const index = this.commissionData.findIndex(item => item.id === newData.id);
    if (index > -1) {
      this.commissionData[index] = { ...newData };
    }

    this.syncDetailItemsToSource(newData);
    this.updateDetailItemsForDisplay();
    this.saveToWorkflow();

    console.log('💾 主表格儲存完成，當前狀態:', newData._status);
  }

  private hasMainDataChanges(oldData: any, newData: any): boolean {
    const mainFields = [
      'commissionType', 'commissionTypeName', 'taxType',
      'transactionAmount', 'specialCommission',
      'fullPointActivity', 'thousandDiscount'
    ];

    return mainFields.some(field =>
      this.normalizeValue(oldData[field]) !== this.normalizeValue(newData[field])
    );
  }

  private normalizeValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    if (value instanceof Date) return value.getTime().toString();
    if (typeof value === 'string') return value.trim();
    return String(value);
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
  onItemCancel(item: any): void { }

  // 🎯 新增：處理下拉選單變更事件
  onDropdownChange(event: { rowData: any, field: string, newValue: any, oldValue: any }): void {
    console.log('🔄 下拉選單變更:', event);

    const { rowData, field, newValue, oldValue } = event;

    // 🎯 更新資料
    rowData[field] = newValue;

    // 🎯 如果是明細項目的變更，標記狀態
    if (rowData._status === 'original' && newValue !== oldValue) {
      rowData._status = 'modified';
      console.log(`📝 下拉選單變更，標記為 modified: ${field} = ${newValue}`);
    } else if (!rowData._status) {
      rowData._status = 'new';
    }

    // 🎯 重要：如果是內層表格的下拉變更，需要找到父項目並同步
    const parentData = this.findParentCommissionItem(rowData);
    if (parentData) {
      this.syncDetailBackToSource(rowData, parentData);
    }

    // 🎯 立即保存
    this.saveToWorkflow();
  }



  private findParentCommissionItem(detailData: any): CommissionItem | null {
    for (const commissionItem of this.commissionData) {
      // 檢查各個明細陣列
      const foundInDiscount = commissionItem.discountSettingItems.some(item => item.id === detailData.id);
      const foundInAnnual = commissionItem.annualPerformanceItems.some(item => item.id === detailData.id);
      const foundInLevel = commissionItem.discountLevelItems.some(item => item.id === detailData.id);

      if (foundInDiscount || foundInAnnual || foundInLevel) {
        return commissionItem;
      }
    }
    return null;
  }


  // 詳細內容保存
  nDetailSave(event: { oldData: any, newData: any, parentData: any }): void {
    console.log('💾 明細表格儲存事件:', event);
    // console.log('💾 舊資料:', this.extractRelevantFields(event.oldData));
    // console.log('💾 新資料:', this.extractRelevantFields(event.newData));

    const { oldData, newData, parentData } = event;

    // 🎯 重要：確保 newData 有正確的 ID
    if (!newData.id) {
      newData.id = oldData.id || this.generateTempId();
    }

    // 🎯 詳細記錄每個欄位的變更
    this.logFieldChanges(oldData, newData);

    // 🎯 檢查明細項目是否有變更
    const hasDetailChanges = this.hasDetailDataChanges(oldData, newData);

    // 🎯 重要：即使沒有變更也要確保狀態正確
    if (hasDetailChanges || !newData._status) {
      if (oldData._status === 'original' && hasDetailChanges) {
        newData._status = 'modified';
        console.log(`📝 明細項目有變更，標記為 modified`);
      } else if (!newData._status || newData._status === 'new') {
        newData._status = newData._status || 'new';
        console.log(`🆕 明細項目標記為 ${newData._status}`);
      }
    }

    // 🎯 確保所有必要欄位都有值
    this.ensureDetailFieldValues(newData);

    // 🎯 重要：立即同步回主資料結構
    this.syncDetailBackToSource(newData, parentData);

    // 🎯 強制更新顯示資料
    this.updateDetailItemsForDisplay();

    // 🎯 立即保存到暫存
    this.saveToWorkflow();

    console.log('💾 明細表格儲存完成，當前狀態:', newData._status);
    // console.log('💾 明細表格儲存完成，最終資料:', this.extractRelevantFields(newData));
  }

  private logFieldChanges(oldData: any, newData: any): void {
    let fieldsToCheck: string[] = [];

    switch (this.selectedSettingTab) {
      case 'discount':
        fieldsToCheck = ['cag_barcode', 'startDate', 'endDate', 'rate'];
        break;
      case 'annual':
        fieldsToCheck = ['startDate', 'endDate', 'discountAmount', 'rate'];
        break;
      case 'level':
        fieldsToCheck = ['cag_barcode', 'startAmount', 'endAmount', 'rate'];
        break;
    }

    console.log('🔍 欄位變更檢查:');
    fieldsToCheck.forEach(field => {
      const oldValue = oldData[field];
      const newValue = newData[field];

      if (this.normalizeValue(oldValue) !== this.normalizeValue(newValue)) {
        console.log(`🔄 欄位變更 ${field}: "${oldValue}" → "${newValue}"`);
      } else {
        console.log(`⚪ 欄位無變更 ${field}: "${oldValue}"`);
      }
    });
  }


  private ensureDetailFieldValues(detailData: any): void {
    // console.log('🔧 確保欄位完整性，處理前:', this.extractRelevantFields(detailData));

    switch (this.selectedSettingTab) {
      case 'discount':
        // 確保折扣設定的所有欄位都有值
        if (detailData.cag_barcode === undefined || detailData.cag_barcode === null) {
          detailData.cag_barcode = '';
        }
        if (detailData.rate === undefined || detailData.rate === null || detailData.rate === '') {
          detailData.rate = 0;
        } else {
          detailData.rate = Number(detailData.rate);
        }
        if (!detailData.startDate) {
          detailData.startDate = this.contractInfoData[0]?.tlt_bdate
            ? new Date(this.contractInfoData[0].tlt_bdate)
            : new Date();
        }
        if (!detailData.endDate) {
          detailData.endDate = this.contractInfoData[0]?.tlt_edate
            ? new Date(this.contractInfoData[0].tlt_edate)
            : new Date();
        }
        break;

      case 'annual':
        // 確保年度業績的所有欄位都有值
        if (!detailData.startDate) {
          detailData.startDate = new Date();
        }
        if (!detailData.endDate) {
          detailData.endDate = new Date();
        }
        if (detailData.discountAmount === undefined || detailData.discountAmount === null || detailData.discountAmount === '') {
          detailData.discountAmount = 0;
        } else {
          detailData.discountAmount = Number(detailData.discountAmount);
        }
        if (detailData.rate === undefined || detailData.rate === null || detailData.rate === '') {
          detailData.rate = 0;
        } else {
          detailData.rate = Number(detailData.rate);
        }
        break;

      case 'level':
        // 確保層級抽成的所有欄位都有值
        if (detailData.cag_barcode === undefined || detailData.cag_barcode === null) {
          detailData.cag_barcode = '';
        }
        if (detailData.startAmount === undefined || detailData.startAmount === null || detailData.startAmount === '') {
          detailData.startAmount = 0;
        } else {
          detailData.startAmount = Number(detailData.startAmount);
        }
        if (detailData.endAmount === undefined || detailData.endAmount === null || detailData.endAmount === '') {
          detailData.endAmount = 0;
        } else {
          detailData.endAmount = Number(detailData.endAmount);
        }
        if (detailData.rate === undefined || detailData.rate === null || detailData.rate === '') {
          detailData.rate = 0;
        } else {
          detailData.rate = Number(detailData.rate);
        }
        break;
    }

    // console.log('🔧 確保欄位完整性，處理後:', this.extractRelevantFields(detailData));
  }

  private syncDetailBackToSource(detailData: any, parentData: CommissionItem): void {
    console.log('🔄 同步明細資料回主資料結構:', detailData);
    console.log('🔄 當前選項卡:', this.selectedSettingTab);

    switch (this.selectedSettingTab) {
      case 'discount':
        const discountIndex = parentData.discountSettingItems.findIndex(item => item.id === detailData.id);
        if (discountIndex > -1) {
          // 🎯 重要：完整複製所有欄位
          parentData.discountSettingItems[discountIndex] = {
            ...parentData.discountSettingItems[discountIndex],
            ...detailData,
            cag_barcode: detailData.cag_barcode || '',
            rate: detailData.rate || 0,
            startDate: detailData.startDate || new Date(),
            endDate: detailData.endDate || new Date(),
            _status: detailData._status || 'original'
          };
          console.log(`✅ 已更新折扣設定項目 [${discountIndex}]:`, parentData.discountSettingItems[discountIndex]);
        }
        break;

      case 'annual':
        const annualIndex = parentData.annualPerformanceItems.findIndex(item => item.id === detailData.id);
        if (annualIndex > -1) {
          // 🎯 重要：完整複製所有欄位
          parentData.annualPerformanceItems[annualIndex] = {
            ...parentData.annualPerformanceItems[annualIndex],
            ...detailData,
            startDate: detailData.startDate || new Date(),
            endDate: detailData.endDate || new Date(),
            discountAmount: detailData.discountAmount || 0,
            rate: detailData.rate || 0,
            _status: detailData._status || 'original'
          };
          console.log(`✅ 已更新年度業績項目 [${annualIndex}]:`, parentData.annualPerformanceItems[annualIndex]);
        }
        break;

      case 'level':
        const levelIndex = parentData.discountLevelItems.findIndex(item => item.id === detailData.id);
        if (levelIndex > -1) {
          // 🎯 重要：完整複製所有欄位
          parentData.discountLevelItems[levelIndex] = {
            ...parentData.discountLevelItems[levelIndex],
            ...detailData,
            cag_barcode: detailData.cag_barcode || '',
            startAmount: detailData.startAmount || 0,
            endAmount: detailData.endAmount || 0,
            rate: detailData.rate || 0,
            _status: detailData._status || 'original'
          };
          console.log(`✅ 已更新層級抽成項目 [${levelIndex}]:`, parentData.discountLevelItems[levelIndex]);
        }
        break;
    }

    // 🎯 重要：同步更新主資料陣列中的項目
    const mainIndex = this.commissionData.findIndex(item => item.id === parentData.id);
    if (mainIndex > -1) {
      this.commissionData[mainIndex] = { ...parentData };
      console.log(`✅ 已同步更新主資料陣列項目 [${mainIndex}]`);
    }
  }

  private hasDetailDataChanges(oldData: any, newData: any): boolean {
    console.log('🔍 檢查明細資料變更:', { oldData, newData, selectedTab: this.selectedSettingTab });

    let fieldsToCheck: string[] = [];

    // 根據當前的設定類型檢查不同欄位
    switch (this.selectedSettingTab) {
      case 'discount':
        fieldsToCheck = ['cag_barcode', 'startDate', 'endDate', 'rate'];
        break;
      case 'annual':
        fieldsToCheck = ['startDate', 'endDate', 'discountAmount', 'rate'];
        break;
      case 'level':
        fieldsToCheck = ['cag_barcode', 'startAmount', 'endAmount', 'rate'];
        break;
      default:
        return false;
    }

    const hasChanges = fieldsToCheck.some(field => {
      const oldValue = this.normalizeValue(oldData[field]);
      const newValue = this.normalizeValue(newData[field]);
      const changed = oldValue !== newValue;

      if (changed) {
        console.log(`🔍 欄位 ${field} 有變更: "${oldValue}" → "${newValue}"`);
      }

      return changed;
    });

    console.log('🔍 檢查結果:', hasChanges ? '有變更' : '無變更');
    return hasChanges;
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
        if (item._status === 'new' || !this.hasItemId(item)) {
          // 新增的項目直接從陣列移除
          const index = this.commissionData.findIndex(x => x.id === item.id);
          if (index > -1) {
            this.commissionData.splice(index, 1);
          }
        } else {
          // 既有項目標記為刪除
          item._status = 'deleted';
        }
      });

      this.saveToWorkflow();
      console.log(`✅ 已處理 ${selectedItems.length} 個項目的刪除`);
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
        if (detail._status === 'new' || !this.hasItemId(detail)) {
          // 新增的明細直接移除
          this.removeDetailFromArrays(detail, parentData);
        } else {
          // 既有明細標記為刪除
          detail._status = 'deleted';
          this.markDetailAsDeleted(detail, parentData);
        }
      });

      this.updateDetailItemsForDisplay();
      this.saveToWorkflow();
      console.log(`✅ 已處理 ${selectedDetails.length} 個明細項目的刪除`);
    }
  }

  // 🎯 輔助方法：從陣列中移除明細項目
  private removeDetailFromArrays(detail: any, parentData: CommissionItem): void {
    switch (this.selectedSettingTab) {
      case 'discount':
        const discountIndex = parentData.discountSettingItems.findIndex(d => d.id === detail.id);
        if (discountIndex > -1) {
          parentData.discountSettingItems.splice(discountIndex, 1);
        }
        break;
      case 'annual':
        const annualIndex = parentData.annualPerformanceItems.findIndex(d => d.id === detail.id);
        if (annualIndex > -1) {
          parentData.annualPerformanceItems.splice(annualIndex, 1);
        }
        break;
      case 'level':
        const levelIndex = parentData.discountLevelItems.findIndex(d => d.id === detail.id);
        if (levelIndex > -1) {
          parentData.discountLevelItems.splice(levelIndex, 1);
        }
        break;
    }
  }

  // 🎯 輔助方法：標記明細為刪除
  private markDetailAsDeleted(detail: any, parentData: CommissionItem): void {
    switch (this.selectedSettingTab) {
      case 'discount':
        const discountItem = parentData.discountSettingItems.find(d => d.id === detail.id);
        if (discountItem) discountItem._status = 'deleted';
        break;
      case 'annual':
        const annualItem = parentData.annualPerformanceItems.find(d => d.id === detail.id);
        if (annualItem) annualItem._status = 'deleted';
        break;
      case 'level':
        const levelItem = parentData.discountLevelItems.find(d => d.id === detail.id);
        if (levelItem) levelItem._status = 'deleted';
        break;
    }
  }


  // 導航方法
  onSubmitNext(): void {
    this.saveCommissionDataToWorkflow();

    const hasCommissionItems = this.commissionData.length > 0;

    if (!hasCommissionItems) {
      this.messageService.warnBubble('請至少設定一個抽成項目');
      return;
    }
    Step3DataChangeTracker.setCurrentTalentId(this.currentTalentId);


    console.log('🧪 測試 Step3 變更追蹤...');
    const step3Changes = Step3DataChangeTracker.generateStep3ChangeSummary(this.commissionData);
    console.log('📊 Step3 變更追蹤結果:', step3Changes);
    this.router.navigate(['TLS/TLS13010NEXT3']);
    // this.messageService.infoBubble('進入下一步');
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
    return this.commissionData.length;
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
