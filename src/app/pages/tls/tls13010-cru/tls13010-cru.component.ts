// tls13010-cru.component.ts (整理後版本 - 移除無用程式碼)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';

// 基礎組件
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

// 工作流程服務
import { ContractFlowService } from '../../../service/API/tls/tls13010contract-flow/contract-flow.service';

// 下拉選單服務和選項
import { TLS13010_DROPDOWN_OPTIONS, TLS13010DropdownService } from '../tls13010/tls13010.dropdown';

// API 服務
import { VendorService } from '../../../service/basic/vendor.service';
import { ContractStatusService } from '../../../service/basic/contract-status.service';
import { SettlementMethodService } from '../../../service/basic/settlement-method.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';
import { CounterCategoryService } from '../../../service/basic/counter-category.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { BankOptionsService } from '../../../service/API/dropdownservice/bank-option.service';
import { AutoCompleteOption } from '../../../shared/componentkit/app-autocomplete/app-autocomplete.component';
import { ColumnDef } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { LocationOptionsService } from '../../../service/API/dropdownservice/location-options.service';

interface CategoryItem {
  id: number;
  bus_type: string;
  bus_type_name: string;
  bus_class: string;
  bus_class_name: string;
  bus_sclass: string;
  bus_sclass_name: string;
  bus_sclass_desc: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

// 地點資訊相關介面
interface LocationItem {
  id: number;
  location_no?: string;        // 店位代碼（可選）
  locationCode: string;        // 位置編號
  tlt_building: string;        // 館別代碼
  tlt_floor: string;          // 樓層
  area_no: string;            // 區域代碼
  businessArea: number;       // 營業坪數
  startDate?: Date;           // 使用起始日（可選）
  endDate?: Date;             // 使用截止日（可選）
  performanceShare?: number;  // 業績分攤(%)（可選）
  _status?: 'new' | 'modified' | 'deleted' | 'original';
  _originalData?: any;
  locationCodeOptions?: any[]; // 新增：下拉選單選項
}

interface LocationDetailItem {
  id: number;
  locationCode: string;       // 位置編號
  tlt_building: string;       // 館別
  tlt_floor: string;          // 樓層
  area_no: string;            // 區域
  businessArea: number;       // 營業坪數
  _status?: 'new' | 'modified' | 'deleted' | 'original';
}

@Component({
  selector: 'app-tls13010-cru',
  templateUrl: './tls13010-cru.component.html',
  styleUrls: ['./tls13010-cru.component.scss'],
})
export class TLS13010CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {
  // 地點資訊資料
  locationItems: LocationItem[] = [];

  // 位置選項資料
  locationWithDetailsOptions: any[] = [];

  // 新的位置表格欄位定義
  locationColumns: ColumnDef[] = [
    {
      field: 'locationCode',
      header: '位置編號',
      type: 'dropdown',
      editable: true,
      style: 'min-width: 150px'
    },
    {
      field: 'tlt_building',
      header: '館別',
      type: 'text',
      editable: false,
      style: 'min-width: 100px'
    },
    {
      field: 'tlt_floor',
      header: '樓層',
      type: 'text',
      editable: false,
      style: 'min-width: 100px'
    },
    {
      field: 'area_no',
      header: '區域',
      type: 'text',
      editable: false,
      style: 'min-width: 100px'
    },
    {
      field: 'businessArea',
      header: '營業坪數',
      type: 'number',
      editable: true,
      style: 'min-width: 120px'
    }
  ];

  // 新的位置資料陣列
  locationData: any[] = [];

  // ==========  地點資訊表格 ==========
  data: any[] = [
    {
      isNew: false,
      locationCode: 'B123',
      floor: '2樓',
      area: 'B區',
      businessArea: '100坪',
      startDate: '2023/12/01',
      endDate: '2024/11/30',
      performanceShare: 100,
    },
  ];

  filteredData: any[] = [...this.data];

  columns: any[] = [
    {
      field: 'locationCode',
      header: '位置編號',
      visible: true,
      type: 'dropdown',
      options: [],
    },
    { field: 'tlt_building', header: '館別', visible: true, type: 'dropdown' },
    { field: 'area_no', header: '區域', visible: true, type: 'dropdown' },
    {
      field: 'tlt_floor',
      header: '樓層',
      visible: true,
      type: 'dropdown',
      options: [],
    },
    { field: 'businessArea', header: '營業坪數', visible: true, type: 'input' },
    { field: 'startDate', header: '使用起始日', visible: true, type: 'date' },
    { field: 'endDate', header: '使用截止日', visible: true, type: 'date' },
    { field: 'performanceShare', header: '業績分攤(%)', visible: true, type: 'input' },
  ];

  // ==========  主要表單定義 ==========
  dataForm = this.formBuilder.group({
    // 基本資訊
    talent_id: [''],
    apply_no: ['', [Validators.required]],
    tlt_name: ['', [Validators.required, Validators.maxLength(100)]],
    tlt_no: [{ value: '契約書審核後才給號', disabled: true }],
    ven_uniform: ['', [Validators.required]],
    VEN_Name: [''],
    paper_type: ['', [Validators.required]],
    bus_type: [''],
    bus_class: [''],
    bus_sclass: [''],
    contract_subno: [''],

    // 洽談階段資訊
    tlt_bdate: [''],
    tlt_edate: [''],
    contact_Date: [''],
    contact_USR_Name: [''],
    feedback_date: [''],
    due_date: [''],

    // 營運資訊
    org_id: [''],
    tlt_contract_bdate: [''],
    tlt_contract_edate: [''],

    // 商務條件
    tlt_kind: [''],
    deco_type: [''],
    tlt_term_type: [''],
    comm_comp_type: ['2', [Validators.required]], // 預設為除稅
    edc_yn: [''],
    tlt_ctype_mtotal: [''],
    overall_status: [''],
    rent_ahead: [''],
    rent_period: [''],
    base_rent: [''],
    deposit: [''],
    total_amt: [''],
    total_amt_vendor: [''],
    construct_fees: [''],
    check_day: [''],

    // 業務設定
    comm_yn: [''],
    rece_yn: [''],
    pos_yn: [''],
    cash_yn: [''],
    money_type: [''],
    store_way: [''],
    check_type: [''],
    paytype: [''],
    vip_yn: [''],
    credit_card: [''],
    invoice_type: [''],

    // 其他設定
    meter_typeList: [[]],
    paymentMethods: [[]],
    ticket_remarks: [''],

    // 聯絡資訊
    email: ['', [Validators.email]],
    invoice_email: ['', [Validators.email]],
    CHECK_TITLE: [''],
    store_tel: [''],
    bank_id: [''],
    vendor_acct_name: [''],
    vendor_acct_no: [''],
    contact_tel: [''],
    contact_fax: [''],
    contact_addr: [''],
    tlt_remark: [''],

    // 狀態欄位
    tlt_openflag: [''],
    cap_saletype1: ['N'],
    cap_saletype2: ['N'],
    activity3: [false],
    activity4: [false],
    open_deposit: [''],

    // 銀行 AutoComplete
    selectedBankInfo: null
  });

  // ==========  固定下拉選單選項 ==========
  decorationOptions = [...TLS13010_DROPDOWN_OPTIONS.decorationType];
  moneyTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.moneyType];
  checkTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.checkType];
  yesNoOptions = [...TLS13010_DROPDOWN_OPTIONS.yesNo];
  meterTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.meterType];
  paytypeOptions = [...TLS13010_DROPDOWN_OPTIONS.paytype];
  storeWayOptions = [...TLS13010_DROPDOWN_OPTIONS.storeWay];
  invoiceTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.invoiceType];
  tltKindOptions = [...TLS13010_DROPDOWN_OPTIONS.tltKind];
  openflagStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.openflagStatus];
  overallStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.overallStatus];
  depositTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.depositType];
  commissionCompTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.commissionCompType];
  commCompTypeDropdown = [...TLS13010_DROPDOWN_OPTIONS.commCompType];
  tltopenflagOption = [...TLS13010_DROPDOWN_OPTIONS.openflagStatus];
  tltctypemtotalOption = [...TLS13010_DROPDOWN_OPTIONS.tltCtypeMtotal];

  // ==========  API 載入的下拉選單選項 ==========
  vendorOptions: any[] = [];
  contractStatusOptions: any[] = [];
  settlementMethodOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  cooperationMethodOptions: any[] = [];
  counterCategoryOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  organizationOptions: any[] = [];

  // 訂閱管理
  private subscriptions: Subscription[] = [];
  selectedBankInfo: AutoCompleteOption | null = null;

  constructor(
    public override router: Router,
    private contractFlowService: ContractFlowService,
    public tls13010DropdownService: TLS13010DropdownService,
    private vendorService: VendorService,
    private contractStatusService: ContractStatusService,
    private settlementMethodService: SettlementMethodService,
    private paymentMethodService: PaymentMethod2Service,
    private cooperationMethodService: CooperationMethodService,
    private counterCategoryService: CounterCategoryService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private bankService: BankOptionsService,
    private locationOptionsService: LocationOptionsService,
  ) {
    super();
  }

  // ==========  生命週期方法 ==========
  ngOnInit(): void {
    this.initializePage('TLS13010', this.dataForm);
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.loadDropdownOptions();
    this.loadWorkflowData();
    this.setupAutoSave();
    this.setupBusTypeListener();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ==========  資料載入方法 ==========
  private loadDropdownOptions(): void {
    // 廠商選項
    this.vendorService.getVendors().subscribe({
      next: (data) => this.vendorOptions = data,
      error: (err) => console.warn('載入廠商選項失敗:', err)
    });

    // 合約狀態選項
    this.contractStatusService.getContractStatuses().subscribe({
      next: (data) => this.contractStatusOptions = data,
      error: (err) => console.warn('載入合約狀態選項失敗:', err)
    });

    // 結帳方式選項
    this.settlementMethodService.getSettlementMethods().subscribe({
      next: (data) => this.settlementMethodOptions = data,
      error: (err) => console.warn('載入結帳方式選項失敗:', err)
    });

    // 付款方式選項
    this.paymentMethodService.getPaymentMethods().subscribe({
      next: (data) => this.paymentMethodOptions = data,
      error: (err) => console.warn('載入付款方式選項失敗:', err)
    });

    // 配合方式選項
    this.cooperationMethodService.getCooperationMethods().subscribe({
      next: (data) => this.cooperationMethodOptions = data,
      error: (err) => console.warn('載入配合方式選項失敗:', err)
    });

    // 櫃別選項
    this.counterCategoryService.getCounterCategories().subscribe({
      next: (data) => this.counterCategoryOptions = data,
      error: (err) => console.warn('載入櫃別選項失敗:', err)
    });

    // 大分類選項
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe({
      next: (data) => this.businessTypeCodeOptions = data,
      error: (err) => console.warn('載入大分類選項失敗:', err)
    });

    // 組織選項
    this.organizationNumberService.getOrganizationNumbers().subscribe({
      next: (data) => this.organizationOptions = data,
      error: (err) => console.warn('載入組織選項失敗:', err)
    });


    this.updateTableColumnOptions();
    // 載入位置詳細選項
    this.loadLocationWithDetailsOptions();
  }

  // 載入位置詳細選項
  private loadLocationWithDetailsOptions(): void {
    this.locationOptionsService.getLocationWithDetailsOptions().subscribe({
      next: (data) => {
        this.locationWithDetailsOptions = data;
        this.updateLocationColumnOptions();
        console.log('位置詳細選項載入完成:', data.length);
      },
      error: (err) => {
        console.warn('載入位置詳細選項失敗:', err);
        this.messageService.warnBubble('載入位置選項失敗，請重新整理頁面');
      }
    });
  }

  // 更新位置欄位的下拉選單選項
  private updateLocationColumnOptions(): void {
    // 為每個位置項目設定下拉選單選項
    this.locationData.forEach(item => {
      item.locationCodeOptions = this.locationWithDetailsOptions.map(option => ({
        label: option.label,
        value: option.value
      }));
    });
  }

  private updateTableColumnOptions(): void {
    const locationColumn = this.columns.find(col => col.field === 'locationCode');
    if (locationColumn) {
      locationColumn.options = this.tls13010DropdownService.locationOptions;
    }

    const floorColumn = this.columns.find(col => col.field === 'floor');
    if (floorColumn) {
      floorColumn.options = this.tls13010DropdownService.floorOptions;
    }
  }

  private loadWorkflowData(): void {
    const workflowData = this.contractFlowService.getCurrentData();
    console.log('載入工作流程資料:', workflowData);

    if (workflowData.contractId) {
      const savedFormData = this.contractFlowService.getStep1Data();

      if (savedFormData && Object.keys(savedFormData).length > 0) {
        this.dataForm.patchValue(savedFormData);
        this.loadBusinessClassifications(savedFormData.bus_type, savedFormData.bus_class);
      } else if (workflowData.queryRowData) {
        this.loadDataFromQueryResult(workflowData.queryRowData);
      }

      if (workflowData.locationInfo && workflowData.locationInfo.length > 0) {
        this.data = workflowData.locationInfo;
        this.filteredData = [...this.data];
      }
    } else {
      console.warn('沒有工作流程資料，重導向到查詢頁面');
      this.router.navigate(['/TLS/TLS13010']);
    }
  }

  private loadDataFromQueryResult(queryData: any): void {
    this.dataForm.patchValue({
      // 基本資訊
      talent_id: queryData.talent_id,
      apply_no: queryData.apply_no,
      tlt_name: queryData.tlt_name,
      tlt_no: queryData.tlt_no,
      VEN_Name: queryData.VEN_Name,
      ven_uniform: queryData.ven_uniform,
      paper_type: queryData.paper_type,
      bus_type: queryData.bus_type,
      bus_class: queryData.bus_class,
      bus_sclass: queryData.bus_sclass,
      contract_subno: queryData.contract_subno,

      // 合約資訊
      feedback_date: queryData.feedback_date,
      due_date: queryData.due_date,
      tlt_bdate: queryData.tlt_bdate,
      tlt_edate: queryData.tlt_edate,
      contact_Date: queryData.contact_Date,
      tlt_contract_bdate: queryData.tlt_contract_bdate,
      tlt_contract_edate: queryData.tlt_contract_edate,

      // 商務條件
      deco_type: queryData.deco_type,
      money_type: queryData.money_type,
      check_type: queryData.check_type,
      tlt_term_type: queryData.tlt_term_type,
      comm_comp_type: queryData.comm_comp_type || '2',
      store_way: queryData.store_way,
      rece_yn: queryData.rece_yn,
      pos_yn: queryData.pos_yn,
      cash_yn: queryData.cash_yn,
      org_id: queryData.org_id,
      overall_status: queryData.overall_status,
      paytype: queryData.paytype,
      invoice_type: queryData.invoice_type,

      // 聯絡資訊
      email: queryData.email,
      invoice_email: queryData.invoice_email,
      CHECK_TITLE: queryData.CHECK_TITLE,
      store_tel: queryData.store_tel,
      bank_id: queryData.bank_id,
      vendor_acct_name: queryData.vendor_acct_name,
      vendor_acct_no: queryData.vendor_acct_no,
      contact_tel: queryData.contact_tel,
      contact_fax: queryData.contact_fax,
      contact_addr: queryData.contact_addr,
      tlt_remark: queryData.tlt_remark,

      // 其他欄位
      comm_yn: queryData.comm_yn,
      base_rent: queryData.base_rent,
      tlt_kind: queryData.tlt_kind,
      edc_yn: queryData.edc_yn,
      tlt_ctype_mtotal: queryData.tlt_ctype_mtotal,
      rent_ahead: queryData.rent_ahead,
      rent_period: queryData.rent_period,
      deposit: queryData.deposit,
      vip_yn: queryData.vip_yn,
      credit_card: queryData.credit_card,
      total_amt: queryData.total_amt,
      total_amt_vendor: queryData.total_amt_vendor,
      construct_fees: queryData.construct_fees,
      ticket_remarks: queryData.ticket_remarks,
      cap_saletype1: queryData.cap_saletype1,
      cap_saletype2: queryData.cap_saletype2,
    });

    this.loadBusinessClassifications(queryData.bus_type, queryData.bus_class);
  }

  private loadBusinessClassifications(busType: string, busClass?: string): void {
    if (busType) {
      this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
        next: (options) => {
          if (busClass) {
            this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
              next: (sClassOptions) => console.log('小分類載入完成:', sClassOptions.length),
              error: (error) => console.warn('載入小分類失敗:', error)
            });
          }
        },
        error: (error) => console.warn('載入中分類失敗:', error)
      });
    }
  }

  // ==========  表單監聽與自動儲存 ==========
  private setupAutoSave(): void {
    const formSubscription = this.dataForm.valueChanges.subscribe(() => {
      this.saveToWorkflow();
    });
    this.subscriptions.push(formSubscription);
  }

  private setupBusTypeListener(): void {
    // 監聽大分類變化
    const busTypeSubscription = this.dataForm.get('bus_type')?.valueChanges.subscribe(busType => {
      if (busType) {
        this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
          next: (options: any[]) => {
            const currentBusClass = this.dataForm.get('bus_class')?.value;
            const validBusClass = options.find(option => option.value === currentBusClass);
            if (currentBusClass && !validBusClass) {
              this.dataForm.get('bus_class')?.setValue('');
              this.dataForm.get('bus_sclass')?.setValue('');
            }
          },
          error: (error: any) => this.messageService.warnBubble('載入中分類選項失敗，請重新選擇大分類')
        });
      } else {
        this.tls13010DropdownService.clearBusClassOptions();
        this.tls13010DropdownService.clearBusSClassOptions();
        this.dataForm.get('bus_class')?.setValue('');
        this.dataForm.get('bus_sclass')?.setValue('');
      }
    });

    // 監聽中分類變化
    const busClassSubscription = this.dataForm.get('bus_class')?.valueChanges.subscribe(busClass => {
      const busType = this.dataForm.get('bus_type')?.value;
      if (busType && busClass) {
        this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
          next: (options: any[]) => {
            const currentBusSClass = this.dataForm.get('bus_sclass')?.value;
            const validBusSClass = options.find(option => option.value === currentBusSClass);
            if (currentBusSClass && !validBusSClass) {
              this.dataForm.get('bus_sclass')?.setValue('');
            }
          },
          error: (error: any) => this.messageService.warnBubble('載入小分類選項失敗，請重新選擇中分類')
        });
      } else {
        this.tls13010DropdownService.clearBusSClassOptions();
        this.dataForm.get('bus_sclass')?.setValue('');
      }
    });

    if (busTypeSubscription) this.subscriptions.push(busTypeSubscription);
    if (busClassSubscription) this.subscriptions.push(busClassSubscription);
  }

  // ==========  表單操作方法 ==========
  private saveToWorkflow(): void {
    if (this.dataForm.dirty) {
      const formData = this.dataForm.getRawValue();
      const workflowData = {
        ...formData,
        locationInfo: this.data
      };
      this.contractFlowService.saveStep1Data(workflowData);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // ==========  按鈕事件處理 ==========
  onSave(): void {
    this.saveToWorkflow();
    this.messageService.successBubble('資料已儲存');
  }

  onSubmit(frm: FormGroup): void {
    this.submitted = true;
    if (!frm.valid) {
      this.messageService.warnBubble('請檢查必填欄位');
      this.markFormGroupTouched(frm);
      return;
    }
    this.saveToWorkflow();
    this.messageService.successBubble('Step 1 完成，可以進入下一步');
  }

  onSubmitNext(): void {
    if (this.dataForm.valid) {
      this.saveToWorkflow();
      this.router.navigate(['/TLS/TLS13010NEXT1']);
      this.messageService.infoBubble('進入下一步：代扣款設定');
    } else {
      this.submitted = true;
      this.markFormGroupTouched(this.dataForm);
      this.messageService.warnBubble('請完成必填欄位後再進入下一步');
    }
  }

  override onCancel(): void {
    if (this.dataForm.dirty) {
      if (confirm('是否要儲存目前的編輯內容？')) {
        this.saveToWorkflow();
        this.messageService.infoBubble('已儲存草稿');
      }
    }
    this.router.navigate(['/TLS/TLS13010']);
  }

  onClearForm(): void {
    if (confirm('確定要清除所有輸入的資料嗎？此操作無法復原。')) {
      this.dataForm.reset();
      this.dataForm.patchValue({
        comm_comp_type: '2',
        invoice_type: '1'
      });
      this.data = [];
      this.filteredData = [];
      this.contractFlowService.clearTempData();
      this.messageService.infoBubble('表單已清除');
    }
  }

  calculatePerformanceShare(): void {
    const totalArea = this.data.reduce((sum, item) => {
      const area = parseFloat(item.businessArea) || 0;
      return sum + area;
    }, 0);

    if (totalArea > 0) {
      this.data.forEach(item => {
        const area = parseFloat(item.businessArea) || 0;
        item.performanceShare = Math.round((area / totalArea) * 100);
      });
      this.filteredData = [...this.data];
      this.saveToWorkflow();
      this.messageService.successBubble('業績分攤計算完成');
    } else {
      this.messageService.warnBubble('請先輸入營業坪數');
    }
  }

  // ==========  位置表格事件處理 ==========

  // 新增位置項目
  onAddLocationItem(): void {
    const newLocationItem: LocationItem = {
      id: Date.now(),
      locationCode: '',
      tlt_building: '',
      tlt_floor: '',
      area_no: '',
      businessArea: 0,
      _status: 'new'
    };

    // 為新項目設定下拉選單選項
    newLocationItem.locationCodeOptions = this.locationWithDetailsOptions.map(option => ({
      label: option.label,
      value: option.value
    }));

    this.locationData.push(newLocationItem);
    this.saveToWorkflow();
    this.messageService.infoBubble('已新增位置項目，請選擇位置編號');
  }

  // 批次刪除位置項目
  onBatchDeleteLocation(selectedItems: any[]): void {
    if (confirm(`確定要刪除 ${selectedItems.length} 個位置項目嗎？`)) {
      selectedItems.forEach(item => {
        const index = this.locationData.findIndex(d => d.id === item.id);
        if (index > -1) {
          this.locationData.splice(index, 1);
        }
      });

      this.saveToWorkflow();
      this.messageService.successBubble(`已刪除 ${selectedItems.length} 個位置項目`);
    }
  }

  // 位置表格儲存事件
  onLocationTableSave(event: { oldData: any, newData: any }): void {
    console.log('位置資料已儲存:', event);
    this.saveToWorkflow();
    this.messageService.successBubble('位置資料已儲存');
  }

  // 位置表格編輯事件
  onLocationTableEdit(rowData: any): void {
    console.log('開始編輯位置資料:', rowData);
  }

  // 位置表格取消事件
  onLocationTableCancel(rowData: any): void {
    console.log('取消編輯位置資料:', rowData);
  }

  // 處理下拉選單變更（位置編號選擇時自動帶入）
  onLocationDropdownChange(event: { rowData: any, field: string, newValue: any, oldValue: any }): void {
    const { rowData, field, newValue, oldValue } = event;

    if (field === 'locationCode' && newValue !== oldValue) {
      const selectedLocation = this.locationWithDetailsOptions.find(
        location => location.value === newValue
      );

      if (selectedLocation) {
        // 自動帶入相關資訊
        rowData.tlt_building = selectedLocation.buildingNo || '';
        rowData.tlt_floor = selectedLocation.floorNo || '';
        rowData.area_no = selectedLocation.areaNo || '';

        this.saveToWorkflow();
        this.messageService.infoBubble(`已自動帶入位置 ${newValue} 的相關資訊`);
      }
    }

    // 其他欄位變更也觸發儲存
    this.saveToWorkflow();
  }

  // 清除所有位置
  onClearAllLocations(): void {
    if (confirm('確定要清除所有位置資訊嗎？此操作無法復原。')) {
      this.locationData = [];
      this.data = [];
      this.filteredData = [];
      this.saveToWorkflow();
      this.messageService.infoBubble('已清除所有位置資訊');
    }
  }

  // 取得位置總營業坪數
  getTotalBusinessArea(): number {
    return this.locationData.reduce((total, item) => {
      const area = parseFloat(item.businessArea) || 0;
      return total + area;
    }, 0);
  }

  // 取得位置設定狀態
  getLocationSetupStatus(): { text: string, class: string } {
    if (this.locationData.length === 0) {
      return { text: '未設定', class: 'text-red-500' };
    } else {
      const hasEmptyLocation = this.locationData.some(item => !item.locationCode);
      if (hasEmptyLocation) {
        return { text: '設定不完整', class: 'text-orange-500' };
      } else {
        return { text: '設定完成', class: 'text-green-500' };
      }
    }
  }

  // ==========  銀行相關事件處理 ==========
  onBankSelect(selectedBank: AutoCompleteOption): void {
    this.selectedBankInfo = selectedBank;
    this.dataForm.patchValue({ bank_id: selectedBank.value });
    this.saveToWorkflow();
  }

  onBankUnselect(): void {
    this.selectedBankInfo = null;
    this.dataForm.patchValue({ bank_id: '' });
    this.saveToWorkflow();
  }

  searchBankOptions(searchKeyword: string): Observable<string[]> {
    return this.bankService.getBankOptions(searchKeyword).pipe(
      map((data: any[]) => data.map(item => `${item.value}${item.label}`))
    );
  }

  // ==========  輔助方法 ==========
  canQuery(): boolean {
    return true;
  }

  onSubmitQuery(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  getWorkflowStatus() {
    return this.contractFlowService.getCurrentStatus();
  }

  getProgressPercentage(): number {
    return this.contractFlowService.getProgressPercentage();
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.dataForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.dataForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return '此欄位為必填';
      if (field.errors['email']) return '請輸入正確的 Email 格式';
      if (field.errors['maxlength']) return `最多可輸入 ${field.errors['maxlength'].requiredLength} 個字元`;
    }
    return '';
  }

  onRefreshBusClass(): void {
    const busType = this.dataForm.get('bus_type')?.value;
    if (busType) {
      this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
        next: () => this.messageService.infoBubble('中分類選項已重新載入'),
        error: () => this.messageService.warnBubble('重新載入失敗')
      });
    } else {
      this.messageService.warnBubble('請先選擇大分類');
    }
  }

  onRefreshBusSClass(): void {
    const busType = this.dataForm.get('bus_type')?.value;
    const busClass = this.dataForm.get('bus_class')?.value;

    if (busType && busClass) {
      this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
        next: () => this.messageService.infoBubble('小分類選項已重新載入'),
        error: () => this.messageService.warnBubble('重新載入失敗')
      });
    } else {
      this.messageService.warnBubble('請先選擇大分類和中分類');
    }
  }
}
