import { CurrentPageService } from './../../../layout/app.menulist/current-page.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, map, Observable, Subscription, debounceTime } from 'rxjs';
// 🎯 直接導入需要的服務，不再繼承
import { AuthService } from '@service/system/auth.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
// import { CurrentPageService } from '@core/services/current-page.service';

// 工作流程服務 - 保持不變
import { ContractFlowService } from '../tls13010/services/contract-flow.service';

// 下拉選單服務和選項 - 保持不變
import { TLS13010_DROPDOWN_OPTIONS, TLS13010DropdownService } from '../tls13010/tls13010.dropdown';

// API 服務 - 保持不變
import { VendorService } from '../../../service/basic/vendor.service';
import { ContractStatusService } from '../../../service/basic/contract-status.service';
import { SettlementMethodService } from '../../../service/basic/settlement-method.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';
import { CounterCategoryService } from '../../../service/basic/counter-category.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { BankOptionsService } from '../../../service/api/dropdownservice/bank-option.service';
import { AutoCompleteOption, AutoCompleteComponent } from '../../../shared/componentkit/app-autocomplete/app-autocomplete.component';
import { ColumnDef, ExpandableEditTableComponent, SelectorTableColumn } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { CategoryItem, ContractInfo, LocationItem } from '../tls13010/tls13010.model';
import { DropdownOption } from '../tls13010/tls13010.dropdown';

// UI 組件 - 保持不變
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';
import { NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RadiobuttonComponent } from "@shared/componentkit/radiobutton/radiobutton.component";
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";

@Component({
  selector: 'app-tls13010-cru',
  templateUrl: './tls13010-cru.component.html',
  styleUrls: ['./tls13010-cru.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    ExpandableEditTableComponent,
    MultiSelectComponent,
    CheckboxModule,
    AutoCompleteComponent,
    InputTextareaComponent,
    ButtonModule,
    InputTextModule,
    RadiobuttonComponent,
    InputNumberComponent
  ],

})
export class TLS13010CRUComponent implements OnInit, OnDestroy {
  // ========== 🎯 核心屬性（取代繼承的部分） ==========
  ProgNo = 'TLS13010';
  formTitle = '';
  submitted = false;
  loading = false;
  crudstatus = CRUDStatus.Edit; // 固定為 Edit，避免表單被 disable

  // 用戶和權限
  user: any;
  funInfo: any;

  // ========== 🎯 檢視模式管理 ==========
  isViewMode = false;
  private viewModeSubscription?: Subscription;
  // 位置選項資料
  locationWithDetailsOptions: DropdownOption[] = [];
  displayLocationData: LocationItem[] = [];

  //廠商統一編號
  pos2013Options: DropdownOption[] = [];

  // 洽談者選項
  negotiatorOptions: DropdownOption[] = [];

  // 新的位置表格欄位定義
  locationColumns: ColumnDef[] = [
    {
      field: 'location_no',
      header: '位置編號',
      type: 'selector-panel',  // 🎯 改用 selector-panel
      editable: true,
      style: 'min-width: 200px',
      selectorConfig: {
        valuePropertyName: 'value',
        labelPropertyName: 'label',
        displayFieldsConfig: [
          {
            fieldName: 'value',
            displayLabel: '',
            isPrimaryField: true
          },
        ],
        panelTableColumns: [
          { field: 'value', header: '位置編號', sortable: true },
          { field: 'building_desc', header: '館別', sortable: true },
          { field: 'floor_desc', header: '樓層' },
          { field: 'area_desc', header: '區域' },
          { field: 'tlt_space', header: '營業坪數' },
          // { field: 'status', header: '狀態' }
        ] as SelectorTableColumn[],
        searchFormFields: [
          {
            name: 'building_code',
            label: '館別',
            type: 'dropdown',
            colClass: 'col-4',
            options: [], // 🎯 會在 updateSelectorPanelOptions 中更新
            placeholder: '選擇館別',
          },
          {
            name: 'floor_code',
            label: '樓層',
            type: 'dropdown',
            colClass: 'col-4',
            options: [], //會在 updateSelectorPanelOptions 中更新
            placeholder: '選擇樓層'
          },
          {
            name: 'area_code',
            label: '區域代號',
            type: 'dropdown',
            options: [], // 會在 updateSelectorPanelOptions 中更新
            colClass: 'col-4',
            placeholder: '輸入區域代號'
          },
        ],
        searchMethod: this.searchLocationOptions.bind(this),
        panelDataSource: [],
        totalDataCount: 0,
      }
    },
    {
      field: 'building_desc',
      header: '館別',
      type: 'text',
      editable: false,
      style: 'min-width: 100px'
    },
    {
      field: 'floor_desc',
      header: '樓層',
      type: 'text',
      editable: false,
      style: 'min-width: 100px'
    },
    {
      field: 'area_desc',
      header: '區域',
      type: 'text',
      editable: false,
      style: 'min-width: 100px'
    },
    {
      field: 'tlt_space',
      header: '營業坪數',
      type: 'number',
      editable: false,
      style: 'min-width: 120px'
    }
  ];

  // 新的位置資料陣列
  locationData: LocationItem[] = [];

  // ==========  主要表單定義 ==========
  dataForm = this.formBuilder.group({
    talent_id: [''], // 必填但系統自動給號
    apply_no: [''], // 必填但系統自動給號
    approve_status: ['1', [Validators.required]], // 必填，預設未審核
    tlt_name: ['', [Validators.required, Validators.maxLength(100)]], // 必填
    tlt_no: [''], // 必填但系統自動給號
    ven_no: ['', [Validators.required, Validators.maxLength(16)]], // 必填
    ven_uniform: ['', [Validators.required, Validators.maxLength(10)]], // 必填
    VEN_Name: ['']
    , // 必填但自動帶入
    paper_type: ['', [Validators.maxLength(2)]],
    bus_type: ['', [Validators.required, Validators.maxLength(2)]], // 必填
    bus_class: ['', [Validators.required, Validators.maxLength(2)]], // 必填
    bus_sclass: ['', [Validators.maxLength(2)]],
    contract_no: ['', [Validators.required, Validators.maxLength(12)]], // 必填
    contract_subno: ['', [Validators.required]], // 必填

    // 洽談階段資訊
    tlt_bdate: ['', [Validators.required]], // 必填
    tlt_edate: ['', [Validators.required]], // 必填
    contact_Date: [''],
    contact_USR_No: ['', [Validators.maxLength(16)]],
    contact_USR_Name: ['', [Validators.maxLength(20)]],
    feedback_date: [''],
    due_date: [''],

    // 營運資訊
    org_id: ['', [Validators.required, Validators.maxLength(20)]], // 必填
    tlt_contract_bdate: ['', [Validators.required]], // 必填
    tlt_contract_edate: ['', [Validators.required]], // 必填

    // 商務條件
    tlt_kind: [''],
    deco_type: [''],
    tlt_term_type: ['', [Validators.required, Validators.maxLength(2)]], // 必填
    comm_comp_type: ['2', [Validators.required]], // 必填，預設值 '2'
    edc_yn: [''],
    tlt_ctype_mtotal: [''],
    overall_status: [''],
    rent_ahead: ['N'],
    rent_period: [0],
    base_rent: [0],
    deposit: [0],
    total_amt: [''],
    total_amt_vendor: [''],

    check_day: [0, [Validators.required]], // 必填，預設值 0

    // 業務設定
    comm_yn: ['N'],
    rece_yn: ['N'],
    pos_yn: ['N'],
    cash_yn: ['N'],
    money_type: ['', [Validators.maxLength(2)]],
    store_way: [''],
    check_type: ['', [Validators.maxLength(10)]],
    paytype: [''],
    vip_yn: [''],
    credit_card: [''],
    invoice_type: ['', [Validators.required]], // 必填

    // 其他設定
    water_flag: [''],
    electric_flag: [''],
    gas_flag: [''],

    paymentMethods: [[]],
    ticket_remarks: ['', [Validators.maxLength(1000)]],

    // 聯絡資訊
    email: ['', [Validators.email, Validators.maxLength(100)]],
    invoice_email: ['', [Validators.email, Validators.maxLength(100)]],
    CHECK_TITLE: ['', [Validators.maxLength(100)]],
    store_tel: ['', [Validators.maxLength(50)]],
    bank_id: ['', [Validators.maxLength(10)]],
    vendor_acct_name: ['', [Validators.maxLength(60)]],
    vendor_acct_no: ['', [Validators.maxLength(20)]],
    contact_tel: ['', [Validators.maxLength(20)]],
    contact_fax: ['', [Validators.maxLength(15)]],
    contact_addr: ['', [Validators.maxLength(100)]],
    tlt_remark: ['', [Validators.maxLength(2000)]],

    // 狀態欄位
    tlt_openflag: [''],
    cap_saletype1: [''],
    cap_saletype2: [''],
    cap_saletype3: [''],
    cap_saletype4: [''],
    open_deposit: [''],
    open_fees: [0], //準時開業保證金
    construct_deposit: [''],
    construct_fees: [0], //施工保證金額
    expiration_deposit: [''],
    expiration_fees: [0], //契約屆滿保證金金額
    total_amt_unit: [''],
    total_amt_vendor_unit: [''],
    company_register_address: [''],
    selectedBankInfo: [null]
  });

  meterReadingOptions = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' }
  ];

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
  overallStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.overallStatus];
  depositTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.depositType];
  tltTermTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.tltTermType];
  commCompTypeDropdown = [...TLS13010_DROPDOWN_OPTIONS.commCompType];
  tltopenflagOption = [...TLS13010_DROPDOWN_OPTIONS.openflagStatus];
  tltctypemtotalOption = [...TLS13010_DROPDOWN_OPTIONS.tltCtypeMtotal];

  total_amt_unitOptions = [...TLS13010_DROPDOWN_OPTIONS.total_amt_unit];

  total_amt_vendor_unit_options = [...TLS13010_DROPDOWN_OPTIONS.total_amt_vendor_unit];

  depositPaymentOptions = [...TLS13010_DROPDOWN_OPTIONS.depositPayment];

  // ==========  API 載入的下拉選單選項 ==========
  vendorOptions: DropdownOption[] = [];
  contractStatusOptions: DropdownOption[] = [];
  settlementMethodOptions: DropdownOption[] = [];
  paymentMethodOptions: DropdownOption[] = [];
  cooperationMethodOptions: DropdownOption[] = [];
  counterCategoryOptions: DropdownOption[] = [];
  businessTypeCodeOptions: DropdownOption[] = [];
  organizationOptions: DropdownOption[] = [];

  // 訂閱管理
  private subscriptions: Subscription[] = [];
  selectedBankInfo: AutoCompleteOption | null = null;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder, // ← 新增這行
    private authService: AuthService,
    private messageService: NotificationService,
    private currentPageService: CurrentPageService,
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
    private tls13010Service: TLS13010Service,
  ) { }

  // ==========  生命週期方法 ==========
  ngOnInit(): void {
    // 🎯 自定義初始化，完全控制流程
    this.initializeBasics();
    this.initializeViewMode();
    this.initializeWorkflow();
    this.initializeData();
    this.setupListeners();
  }

  ngOnDestroy(): void {
    // 🎯 清理訂閱
    if (this.viewModeSubscription) {
      this.viewModeSubscription.unsubscribe();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  private initializeBasics(): void {
    // 🎯 基本設定
    if (this.authService.currentUserValue) {
      this.user = this.authService.currentUserValue;
    }
    this.currentPageService.setCurrentProgNo(this.ProgNo);
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 🎯 固定為 Edit，避免表單被 disable
    this.crudstatus = CRUDStatus.Edit;

    // 🎯 設定標題
    this.formTitle = this.getCustomTitle();

    // 🎯 延遲設定初始控制狀態
    setTimeout(() => {
      this.setFormControlsState();
    }, 100);
  }

  /**
 * 🎯 檢查特定欄位的 readonly 狀態（供 UI 參考）
 */
  isFieldReadonly(fieldName: string): boolean {
    // 永遠 readonly 的欄位
    const alwaysReadonlyFields = ['apply_no', 'tlt_no', 'VEN_Name', 'contract_subno', 'company_register_address'];

    if (alwaysReadonlyFields.includes(fieldName)) {
      return true;
    }

    // 檢視模式下全部 readonly
    if (this.isViewMode) {
      return true;
    }

    // 營運狀況的特殊邏輯
    if (fieldName === 'tlt_openflag') {
      return this.contractFlowService.isNewContractMode(); // 新增模式下 readonly
    }

    return false;
  }

  private initializeViewMode(): void {
    // 🎯 從服務取得檢視模式狀態
    this.isViewMode = this.contractFlowService.isViewMode();

    // 🎯 設定檢視模式 UI 監聽
    this.setupViewModeUI();

    // 🎯 如果是檢視模式，設定表單為唯讀
    if (this.isViewMode) {
      setTimeout(() => {
        // this.setFormReadonly(true);
      }, 0);
    }
  }

  private initializeWorkflow(): void {
    // 🎯 處理 router state
    this.handleRouterState();

    // 🎯 載入工作流程資料
    this.loadWorkflowData();
  }

  private initializeData(): void {
    // 🎯 載入下拉選單和位置選項
    this.loadDropdownOptions();
    this.loadLocationWithDetailsOptions();
    this.loadPOS2013Options();
    this.loadNegotiatorOptions();
  }

  private setupListeners(): void {
    // 🎯 設定監聽
    this.setupAutoSave();
    this.setupBusTypeListener();

    setTimeout(() => {
      this.validateWorkflowData();
      this.updateDisplayLocationData();

      // 🎯 檢查並重新載入分類資料
      const currentBusType = this.dataForm.get('bus_type')?.value;
      if (currentBusType) {
        console.log('🔄 重新確認分類資料載入');
        this.ensureClassificationDataLoaded(currentBusType);
      }
    }, 500);

    setTimeout(() => {
      this.updateSelectorPanelOptions();
    }, 1000);
  }
  private getCustomTitle(): string {
    if (this.contractFlowService.isViewMode()) {
      return '檢視契約資料';
    }
    return this.contractFlowService.isNewContractMode() ? '新增契約資料' : '編輯契約資料';
  }

  /**
   *從 URL 檢查是否為檢視模式
   */
  private checkViewModeFromURL(): void {
    const queryParams = this.route.snapshot.queryParams;
    const mode = queryParams['mode'];

    console.log('🔍 檢查 URL 參數:', { mode });

    if (mode === 'view') {
      console.log('🔒 URL 檢測到檢視模式，設定為唯讀');
      this.isViewMode = true;
      this.contractFlowService.setViewMode(true);

      // 🎯 立即設定表單為 disabled
      setTimeout(() => {
        // this.setFormReadonly(true);
      }, 0);
    } else {
      console.log('📝 URL 未檢測到檢視模式，設定為編輯模式');
      this.isViewMode = false;
      this.contractFlowService.setViewMode(false);
    }
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

  }

  private loadLocationWithDetailsOptions(): void {
    console.log('🔄 開始載入位置選項...');

    // 取得目前的 talentId（如果是編輯模式）
    const workflowData = this.contractFlowService.getCurrentData();
    const talentId = workflowData.queryRowData?.talent_id;

    this.locationOptionsService.getLocationWithDetailsOptions(talentId).subscribe({
      next: (data) => {
        console.log('📥 API回傳的位置資料:', data);
        this.locationWithDetailsOptions = data;

        // 🎯 資料載入完成後，更新 selector 面板選項
        setTimeout(() => {
          this.updateSelectorPanelOptions();
        }, 100);

        console.log('✅ 位置選項載入完成，共', this.locationWithDetailsOptions.length, '筆');
      },
      error: (err) => {
        console.warn('❌ 載入位置選項失敗:', err);
        this.messageService.warnBubble('載入位置選項失敗，請重新整理頁面');
      }
    });
  }

  private loadPOS2013Options(): void {
    // 直接從服務取得
    this.pos2013Options = this.tls13010DropdownService.pos2013Options;

    // 或者等服務載入完成
    if (this.pos2013Options.length === 0) {
      setTimeout(() => {
        this.pos2013Options = this.tls13010DropdownService.getPOS2013Options();
      }, 500);
    }
  }

  private loadNegotiatorOptions(): void {
    // 直接從服務取得
    this.negotiatorOptions = this.tls13010DropdownService.negotiatorOptions;

    // 或者等服務載入完成
    if (this.negotiatorOptions.length === 0) {
      setTimeout(() => {
        this.negotiatorOptions = this.tls13010DropdownService.getNegotiatorOptionsData();
        console.log('洽談者選項載入完成 (CRU頁面):', this.negotiatorOptions.length);
      }, 500);
    }
  }

  // 更新位置欄位的下拉選單選項
  private updateLocationColumnOptions(): void {
    console.log('開始更新表格欄位選項...');

    // const locationColumn = this.locationColumns.find(col => col.field === 'location_no');
    // if (locationColumn) {
    //   locationColumn.options = this.locationWithDetailsOptions.map(option => ({
    //     label: option.label,  // 用 service 轉換後的 label
    //     value: option.value   // 用 service 轉換後的 value
    //   }));

    //   console.log('已更新表格下拉選單選項:', locationColumn.options.length, '筆');
    // } else {
    //   console.warn('找不到 location_no 欄位！'); // 改回原本的訊息
    // }
  }

  // 載入工作流程資料（修改，正確載入位置資料）
  private loadWorkflowData(): void {
    const workflowData = this.contractFlowService.getCurrentData();
    console.log('🚀 CRU 載入工作流程資料:', workflowData);

    if (workflowData.contractId) {
      // 🎯 統一使用 ContractFlowService 的模式判定
      if (this.contractFlowService.isNewContractMode()) {
        console.log('🆕 新增模式：檢查是否有暫存資料');
        this.loadNewModeData();
      } else {
        console.log('📝 編輯模式：載入資料');
        this.loadEditModeData(workflowData);
      }
    } else {
      console.warn('❌ 沒有工作流程資料，重導向到查詢頁面');
      this.router.navigate(['account/tls/tls13010']);
    }
  }

  private loadNewModeData(): void {
    console.log('🆕 載入新增模式資料');

    // 🎯 檢查是否有暫存的 Step1 資料
    const savedFormData = this.contractFlowService.getStep1Data();
    console.log('📦 檢查 Step1 暫存資料:', savedFormData);

    if (savedFormData && Object.keys(savedFormData).length > 0) {
      console.log('📝 載入新增模式暫存表單資料');
      this.loadSavedFormData(savedFormData);
    } else {
      console.log('🆕 新增模式：初始化空表單');
      this.initializeEmptyForm();
    }
  }


  private loadEditModeData(workflowData: any): void {
    const savedFormData = this.contractFlowService.getStep1Data();

    if (savedFormData && Object.keys(savedFormData).length > 0) {
      console.log('📝 載入編輯模式暫存表單資料');
      this.loadSavedFormData(savedFormData);
    } else if (workflowData.queryRowData) {
      console.log('📋 載入查詢結果資料');
      this.loadDataFromQueryResult(workflowData.queryRowData);

      // ✅ 確保載入既有位置資料
      const currentTalentId = this.contractFlowService.getCurrentTalentId();
      if (currentTalentId) {
        console.log('🔄 載入既有位置資料 (編輯模式)');
        this.loadExistingLocationData(currentTalentId);
      }
    }
  }


  private loadSavedFormData(savedFormData: any): void {
    // 載入表單資料
    this.dataForm.patchValue(savedFormData);

    if (savedFormData.selectedBankInfo) {
      console.log('🏦 恢復銀行選擇資訊:', savedFormData.selectedBankInfo);
      this.selectedBankInfo = savedFormData.selectedBankInfo;
    } else if (savedFormData.bank_id) {
      console.log('🔄 嘗試根據 bank_id 重建銀行資訊:', savedFormData.bank_id);
      this.reconstructBankInfo(savedFormData.bank_id);
    } else {
      this.selectedBankInfo = null;
    }

    // 載入分類資料
    if (savedFormData.bus_type) {
      setTimeout(() => {
        this.loadBusinessClassifications(savedFormData.bus_type);
      }, 100);
    }

    // 🎯 載入位置資料
    if (savedFormData.locationInfo && Array.isArray(savedFormData.locationInfo) && savedFormData.locationInfo.length > 0) {
      console.log('📍 載入暫存位置資料');
      this.locationData = savedFormData.locationInfo.map((item: any) => ({
        ...item,
        _status: item._status || 'original',
        _isNew: item._isNew || false
      }));
    } else {
      const currentTalentId = this.contractFlowService.getCurrentTalentId();
      if (currentTalentId && !this.contractFlowService.isNewContractMode()) {
        console.log('📍 沒有暫存位置，載入既有位置資料');
        this.loadExistingLocationData(currentTalentId);
      } else {
        this.locationData = [];
      }
    }

    // 🎯 重新設定控制狀態
    setTimeout(() => {
      this.setFormControlsState();
    }, 100);
  }

  private reconstructBankInfo(bankId: string): void {
    if (!bankId) {
      this.selectedBankInfo = null;
      return;
    }

    this.bankService.getBankOptions(bankId).subscribe({
      next: (options) => {
        // API 回傳：[{ label: "臺灣銀行營業部", value: "0040037" }]
        const matchedBank = options.find(option => option.value === bankId);

        if (matchedBank) {
          // 🎯 重建完整格式
          const fullText = `${matchedBank.value}${matchedBank.label}`;
          this.selectedBankInfo = {
            value: matchedBank.value,     // "0040037"
            label: fullText,              // "0040037臺灣銀行營業部"
            fullText: fullText            // "0040037臺灣銀行營業部"
          };
        }
      }
    });
  }

  /**
   * 🎯 統一設定表單欄位的 disabled 狀態
   */
  private setFormControlsState(): void {
    console.log('🔧 開始設定表單控制狀態...');

    const isNewMode = this.contractFlowService.isNewContractMode();
    const isViewMode = this.isViewMode;

    console.log('📊 當前模式:', {
      isNewMode,
      isViewMode,
      mode: isViewMode ? '檢視' : (isNewMode ? '新增' : '編輯')
    });

    // 🎯 第一步：先啟用所有欄位
    Object.keys(this.dataForm.controls).forEach(key => {
      const control = this.dataForm.get(key);
      if (control && control.disabled) {
        control.enable();
      }
    });

    // 🎯 第二步：設定永遠 readonly 的欄位
    const alwaysReadonlyFields = [
      'apply_no',                    // 專櫃招募編號
      'tlt_no',                      // 專櫃編號
      'VEN_Name',                    // 廠商名稱
      'contract_subno',              // 版次
      'company_register_address'     // 公司登記地址
    ];

    alwaysReadonlyFields.forEach(fieldName => {
      const control = this.dataForm.get(fieldName);
      if (control) {
        control.disable();
        console.log(`🔒 永遠 readonly: ${fieldName}`);
      }
    });

    // 🎯 第三步：處理條件 readonly - 營運狀況
    const tltOpenflagControl = this.dataForm.get('tlt_openflag');
    if (tltOpenflagControl) {
      if (isNewMode) {
        // 新增模式：設定為 '9' 且 readonly
        tltOpenflagControl.setValue('9');
        tltOpenflagControl.disable();
        console.log('🔒 新增模式：營運狀況設為 "9" 且 readonly');
      } else if (!isViewMode) {
        // 編輯模式：可以編輯
        tltOpenflagControl.enable();
        console.log('🔓 編輯模式：營運狀況可編輯');
      }
    }

    // 🎯 第四步：檢視模式 - 全部 readonly
    if (isViewMode) {
      Object.keys(this.dataForm.controls).forEach(key => {
        const control = this.dataForm.get(key);
        if (control) {
          control.disable();
        }
      });
      console.log('🔒 檢視模式：全部欄位 readonly');
    }

    console.log('✅ 表單控制狀態設定完成');
  }

  private initializeEmptyForm(): void {
    console.log('🆕 初始化空表單');

    // 🎯 設定預設值
    this.dataForm.patchValue({
      talent_id: '',
      apply_no: '',
      tlt_name: '',
      tlt_no: '',
      ven_uniform: '',
      VEN_Name: '',
      paper_type: '',
      bus_type: '',
      bus_class: '',
      bus_sclass: '',
      contract_subno: '1', // 預設版次為 1

      // 🎯 預設值
      tlt_term_type: '3', // 一般抽成
      comm_comp_type: '2', // 除稅
      tlt_openflag: '9',

      // 🎯 其他預設值
      org_id: '',
      tlt_kind: '',
      deco_type: '',
      edc_yn: 'Y',
      tlt_ctype_mtotal: '',
      overall_status: '1',
      deposit: 0,
      rece_yn: 'N',
      pos_yn: 'N',
      cash_yn: 'N',
      comm_yn: 'N',
      rent_ahead: 'N', //預收租金, 當抽成別為【固定租金】、 【底租抽成取高者】時, default 是 TODO:
      // 🎯 Y/N 欄位預設值
      invoice_type: '0', /*請款單據別 0:發票 1:收據*/
      vip_yn: 'Y',
      credit_card: '',
      total_amt_unit: 'M', // 預設為月
      total_amt_vendor_unit: 'M', // 預設為月
      paytype: '1',
      money_type: '30',
      store_way: '1',
      water_flag: 'N',
      electric_flag: 'N',
      gas_flag: 'N'
    });

    // 🎯 清空位置資料
    this.locationData = [];
    this.selectedBankInfo = null;

    console.log('✅ 空表單初始化完成');
  }



  private loadDataFromQueryResult(queryData: Record<string, unknown>): void {
    this.dataForm.patchValue({
      // 基本資訊
      talent_id: queryData['talent_id'] as string,
      apply_no: queryData['apply_no'] as string,
      tlt_name: queryData['tlt_name'] as string,
      tlt_no: queryData['tlt_no'] as string,
      VEN_Name: queryData['VEN_Name'] as string,
      ven_uniform: queryData['ven_uniform'] as string,
      paper_type: queryData['paper_type'] as string,
      bus_type: queryData['bus_type'] as string,
      bus_class: queryData['bus_class'] as string,
      bus_sclass: queryData['bus_sclass'] as string,
      contract_subno: queryData['contract_subno'] as string,

      // 合約資訊
      feedback_date: queryData['feedback_date'] as string,
      due_date: queryData['due_date'] as string,
      tlt_bdate: queryData['tlt_bdate'] as string,
      tlt_edate: queryData['tlt_edate'] as string,
      contact_Date: queryData['contact_Date'] as string,
      tlt_contract_bdate: queryData['tlt_contract_bdate'] as string,
      tlt_contract_edate: queryData['tlt_contract_edate'] as string,

      // 商務條件
      deco_type: queryData['deco_type'] as string,
      money_type: queryData['money_type'] as string,
      check_type: queryData['check_type'] as string,
      tlt_term_type: (queryData['tlt_term_type'] as string)?.trim() || '',
      comm_comp_type: queryData['comm_comp_type'] as string || '2',
      store_way: queryData['store_way'] as string,
      rece_yn: queryData['rece_yn'] as string,
      pos_yn: queryData['pos_yn'] as string,
      cash_yn: queryData['cash_yn'] as string,
      org_id: queryData['org_id'] as string,
      overall_status: queryData['overall_status'] as string,
      paytype: queryData['paytype'] as string,
      invoice_type: queryData['invoice_type'] as string,

      tlt_openflag: String(queryData['tlt_openflag'] || '').trim(),
      // 聯絡資訊
      email: queryData['email'] as string,
      invoice_email: queryData['invoice_email'] as string,
      CHECK_TITLE: queryData['CHECK_TITLE'] as string,
      store_tel: queryData['store_tel'] as string,
      bank_id: queryData['bank_id'] as string,
      vendor_acct_name: queryData['vendor_acct_name'] as string,
      vendor_acct_no: queryData['vendor_acct_no'] as string,
      contact_tel: queryData['contact_tel'] as string,
      contact_fax: queryData['contact_fax'] as string,
      contact_addr: queryData['contact_addr'] as string,
      company_register_address: queryData['company_register_address'] as string,
      tlt_remark: queryData['tlt_remark'] as string,

      // 其他欄位
      comm_yn: queryData['comm_yn'] as string,
      base_rent: queryData['base_rent'] as number,
      tlt_kind: queryData['tlt_kind'] as string,
      edc_yn: queryData['edc_yn'] as string,
      tlt_ctype_mtotal: queryData['tlt_ctype_mtotal'] as string,
      rent_ahead: queryData['rent_ahead'] as string,
      rent_period: queryData['rent_period'] as number,
      deposit: queryData['deposit'] as number,
      vip_yn: queryData['vip_yn'] as string,
      credit_card: queryData['credit_card'] as string,
      total_amt: queryData['total_amt'] as string,
      total_amt_vendor: queryData['total_amt_vendor'] as string,
      construct_fees: queryData['construct_fees'] as number,
      ticket_remarks: queryData['ticket_remarks'] as string,
      cap_saletype1: queryData['cap_saletype1'] as string,
      cap_saletype2: queryData['cap_saletype2'] as string,
      cap_saletype3: queryData['cap_saletype3'] as string,
      cap_saletype4: queryData['cap_saletype4'] as string,
      contact_USR_No: queryData['contact_USR_No'] as string,
      contact_USR_Name: queryData['contact_USR_Name'] as string,
      total_amt_unit: queryData['total_amt_unit'] as string,
      total_amt_vendor_unit: queryData['total_amt_vendor_unit'] as string,
      water_flag: queryData['water_flag'] as string || 'N',
      electric_flag: queryData['electric_flag'] as string || 'N',
      gas_flag: queryData['gas_flag'] as string || 'N',
    });

    const bankId = queryData['bank_id'] as string;
    if (bankId) {
      console.log('🏦 載入查詢結果的銀行資訊:', bankId);
      this.reconstructBankInfo(bankId);
    } else {
      this.selectedBankInfo = null;
    }

    const busType = queryData['bus_type'] as string;
    if (busType) {
      // 延遲執行，確保表單值已設定
      setTimeout(() => {
        this.loadBusinessClassifications(busType);
      }, 100);
    }

    // 🎯 重新設定控制狀態
    setTimeout(() => {
      this.setFormControlsState();
    }, 100);
  }

  private loadBusinessClassifications(busType: string | undefined): void {
    if (!busType) return;

    const currentBusClass = this.dataForm.get('bus_class')?.value;
    const currentBusSClass = this.dataForm.get('bus_sclass')?.value;

    console.log('🔍 載入業務分類:', { busType, currentBusClass, currentBusSClass });

    // 先載入中分類
    this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
      next: (busClassOptions: DropdownOption[]) => {
        console.log('📋 中分類選項載入完成:', busClassOptions.length);

        const validBusClass = busClassOptions.find(option => option.value === currentBusClass);

        if (currentBusClass && validBusClass) {
          console.log('✅ 中分類有效，載入小分類');
          // 中分類有效，載入小分類
          this.loadBusSClassWithValidation(busType, currentBusClass, currentBusSClass ?? undefined);
        } else if (currentBusClass && !validBusClass) {
          console.warn('❌ 中分類無效，清空相關欄位');
          // 中分類無效，清空相關欄位
          this.dataForm.get('bus_class')?.setValue('');
          this.dataForm.get('bus_sclass')?.setValue('');
        }
        // 如果 currentBusClass 為空，保持原狀
      },
      error: (err) => {
        console.error('載入中分類失敗:', err);
        this.messageService.warnBubble('載入中分類選項失敗，請重新選擇大分類');
      }
    });
  }

  private loadBusSClassWithValidation(busType: string, busClass: string, currentBusSClass?: string): void {
    console.log('🔍 載入小分類:', { busType, busClass, currentBusSClass });

    this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
      next: (busSClassOptions: DropdownOption[]) => {
        console.log('📋 小分類選項載入完成:', busSClassOptions.length);

        if (currentBusSClass) {
          const validBusSClass = busSClassOptions.find(option => option.value === currentBusSClass);

          if (validBusSClass) {
            console.log('✅ 小分類有效，保持原值');
            // 小分類有效，確保表單值正確
            this.dataForm.get('bus_sclass')?.setValue(currentBusSClass);
          } else {
            console.warn('❌ 小分類無效，清空欄位');
            // 小分類無效，清空欄位
            this.dataForm.get('bus_sclass')?.setValue('');
          }
        }
      },
      error: (err) => {
        console.error('載入小分類失敗:', err);
        this.messageService.warnBubble('載入小分類選項失敗');
      }
    });
  }

  // ==========  表單監聽與自動儲存 ==========
  private setupAutoSave(): void {
    // 加入去抖動機制
    const formSubscription = this.dataForm.valueChanges.pipe(
      debounceTime(300),  // 300ms 去抖動
      distinctUntilChanged()
    ).subscribe(() => {
      this.saveToWorkflow();
    });

    this.subscriptions.push(formSubscription);
  }

  private setupBusTypeListener(): void {
    // 監聽大分類變化
    const busTypeSubscription = this.dataForm.get('bus_type')?.valueChanges.subscribe(busType => {
      if (busType) {
        console.log('🔄 大分類變更，載入中分類選項:', busType);

        this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
          next: (options: DropdownOption[]) => {
            console.log('📋 中分類選項載入完成:', options.length);

            const currentBusClass = this.dataForm.get('bus_class')?.value;
            const validBusClass = options.find(option => option.value === currentBusClass);

            if (currentBusClass && !validBusClass) {
              // 🎯 中分類無效時，清空中分類和小分類
              console.log('❌ 中分類無效，清空中分類和小分類');
              this.dataForm.get('bus_class')?.setValue('');
              this.dataForm.get('bus_sclass')?.setValue('');
              // 清空小分類選項
              this.tls13010DropdownService.clearBusSClassOptions();
            } else if (currentBusClass && validBusClass) {
              // 🎯 中分類有效時，檢查並載入小分類
              console.log('✅ 中分類有效，檢查小分類');
              this.loadAndValidateBusSClass(busType, currentBusClass);
            } else {
              // 🎯 沒有中分類值時，清空小分類
              console.log('📝 沒有中分類值，清空小分類');
              this.dataForm.get('bus_sclass')?.setValue('');
              this.tls13010DropdownService.clearBusSClassOptions();
            }
          },
          error: (err) => {
            console.error('❌ 載入中分類失敗:', err);
            this.messageService.warnBubble('載入中分類選項失敗，請重新選擇大分類');
            // 發生錯誤時清空所有下級分類
            this.dataForm.get('bus_class')?.setValue('');
            this.dataForm.get('bus_sclass')?.setValue('');
            this.tls13010DropdownService.clearBusSClassOptions();
          }
        });
      } else {
        // 🎯 大分類清空時，清空所有下級分類
        console.log('🗑️ 大分類清空，清空所有下級分類');
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
        console.log('🔄 中分類變更，載入小分類選項:', { busType, busClass });
        this.loadAndValidateBusSClass(busType, busClass);
      } else {
        // 🎯 中分類清空時，清空小分類
        console.log('🗑️ 中分類清空，清空小分類');
        this.tls13010DropdownService.clearBusSClassOptions();
        this.dataForm.get('bus_sclass')?.setValue('');
      }
    });

    if (busTypeSubscription) this.subscriptions.push(busTypeSubscription);
    if (busClassSubscription) this.subscriptions.push(busClassSubscription);
  }

  /**
   * 🎯 新增：載入並驗證小分類
   */
  private loadAndValidateBusSClass(busType: string, busClass: string): void {
    this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
      next: (options: DropdownOption[]) => {
        console.log('📋 小分類選項載入完成:', options.length);

        const currentBusSClass = this.dataForm.get('bus_sclass')?.value;

        if (currentBusSClass) {
          const validBusSClass = options.find(option => option.value === currentBusSClass);

          if (!validBusSClass) {
            // 🎯 小分類無效時清空
            console.log('❌ 小分類無效，清空小分類');
            this.dataForm.get('bus_sclass')?.setValue('');
          } else {
            console.log('✅ 小分類有效，保持原值');
          }
        }
      },
      error: (err) => {
        console.error('❌ 載入小分類失敗:', err);
        this.messageService.warnBubble('載入小分類選項失敗');
        this.dataForm.get('bus_sclass')?.setValue('');
      }
    });
  }

  // ==========  表單操作方法 ==========
  private saveToWorkflow(): void {
    const formData = this.dataForm.getRawValue();

    console.log('💾 準備儲存工作流程資料...');

    // 🎯 型別轉換輔助函數
    const convertToString = (value: any): string | undefined => {
      if (value === null || value === undefined) return undefined;
      return String(value);
    };

    // 🎯 準備符合 ContractInfo 介面的資料
    const contractInfo: ContractInfo = {
      id: formData.talent_id || '',
      talent_id: formData.talent_id || '',
      apply_no: formData.apply_no || '',
      tlt_name: formData.tlt_name || '',
      VEN_Name: formData.VEN_Name || '',
      contract_subno: formData.contract_subno || '',

      // 🎯 補充 FormBuilder 有但之前缺少的欄位
      approve_status: formData.approve_status || '',
      ven_no: formData.ven_no || '',
      contract_no: formData.contract_no || '',

      // 🎯 日期欄位
      tlt_bdate: formData.tlt_bdate || '',
      tlt_edate: formData.tlt_edate || '',
      tlt_contract_bdate: formData.tlt_contract_bdate || '',
      tlt_contract_edate: formData.tlt_contract_edate || '',
      feedback_date: formData.feedback_date || '',
      due_date: formData.due_date || '',
      contact_Date: formData.contact_Date || '',

      // 🎯 業務欄位
      ven_uniform: formData.ven_uniform || '',
      paper_type: formData.paper_type || '',
      bus_type: formData.bus_type || '',
      bus_class: formData.bus_class || '',
      bus_sclass: formData.bus_sclass || '',
      tlt_term_type: formData.tlt_term_type || '',
      comm_comp_type: formData.comm_comp_type || '',
      org_id: formData.org_id || '',
      contact_USR_No: formData.contact_USR_No || '',
      contact_USR_Name: formData.contact_USR_Name || '',

      // 🎯 數值欄位轉字串
      base_rent: convertToString(formData.base_rent),
      deposit: convertToString(formData.deposit),
      credit_card: convertToString(formData.credit_card),
      rent_period: convertToString(formData.rent_period),
      open_fees: convertToString(formData.open_fees),
      total_amt: convertToString(formData.total_amt),
      total_amt_vendor: convertToString(formData.total_amt_vendor),
      construct_fees: convertToString(formData.construct_fees),
      check_day: convertToString(formData.check_day),
      construct_deposit: convertToString(formData.construct_deposit),    // 🎯 新增
      expiration_fees: convertToString(formData.expiration_fees),        // 🎯 新增

      // 🎯 其他字串欄位
      deco_type: formData.deco_type || '',
      money_type: formData.money_type || '',
      check_type: formData.check_type || '',
      edc_yn: formData.edc_yn || '',
      tlt_openflag: formData.tlt_openflag || '',
      comm_yn: formData.comm_yn || '',
      rece_yn: formData.rece_yn || '',
      pos_yn: formData.pos_yn || '',
      cash_yn: formData.cash_yn || '',
      store_way: formData.store_way || '',
      paytype: formData.paytype || '',
      vip_yn: formData.vip_yn || '',
      invoice_type: formData.invoice_type || '',

      // 🎯 聯絡資訊
      email: formData.email || '',
      invoice_email: formData.invoice_email || '',
      CHECK_TITLE: formData.CHECK_TITLE || '',
      store_tel: formData.store_tel || '',
      bank_id: formData.bank_id || '',
      vendor_acct_name: formData.vendor_acct_name || '',
      vendor_acct_no: formData.vendor_acct_no || '',
      contact_tel: formData.contact_tel || '',
      contact_fax: formData.contact_fax || '',
      contact_addr: formData.contact_addr || '',
      company_register_address: formData.company_register_address || '',
      tlt_remark: formData.tlt_remark || '',
      ticket_remarks: formData.ticket_remarks || '',

      // 🎯 其他設定
      tlt_kind: formData.tlt_kind || '',
      tlt_ctype_mtotal: formData.tlt_ctype_mtotal || '',
      overall_status: formData.overall_status || '',
      rent_ahead: formData.rent_ahead || '',
      open_deposit: formData.open_deposit || '',
      expiration_deposit: formData.expiration_deposit || '',              // 🎯 新增
      cap_saletype1: formData.cap_saletype1 || '',
      cap_saletype2: formData.cap_saletype2 || '',
      cap_saletype3: formData.cap_saletype3 || '',                       // 🎯 新增
      cap_saletype4: formData.cap_saletype4 || '',                       // 🎯 新增
      water_flag: formData.water_flag || '',
      electric_flag: formData.electric_flag || '',
      gas_flag: formData.gas_flag || '',
      total_amt_unit: formData.total_amt_unit || '',
      total_amt_vendor_unit: formData.total_amt_vendor_unit || '',

      // 🎯 陣列欄位
      paymentMethods: formData.paymentMethods || [],                     // 🎯 新增

      // 🎯 特殊欄位
      locationInfo: this.prepareLocationDataForSubmit(),
      selectedBankInfo: this.selectedBankInfo
    };
    this.contractFlowService.saveStep1Data(contractInfo);
    console.log('✅ 已暫存到工作流程');
  }

  // 檢查位置資料是否有變更
  private hasLocationChanges(): boolean {
    return this.locationData.some(item =>
      item._status === 'new' ||
      item._status === 'modified' ||
      item._status === 'deleted'
    );
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

  // 載入既有的地點資料 - 加入已使用位置到選項中
  private loadExistingLocationData(talentId: string): void {
    this.tls13010Service.queryTLS13010Location(talentId).subscribe({
      next: (response) => {
        if (response?.Data?.Locations && response.Data.Locations.length > 0) {
          this.locationData = response.Data.Locations.map((item: LocationItem) => {
            const locationOption = this.locationWithDetailsOptions.find(
              opt => opt.value === item.location_no
            );

            return {
              ...item,
              building_desc: String(item.building_desc ||
                (locationOption as any)?.building_desc || ''),
              floor_desc: String(item.floor_desc ||
                (locationOption as any)?.floor_desc || ''),
              area_desc: String(item.area_desc ||
                (locationOption as any)?.area_desc || ''),
              _status: 'original',  // ✅ 明確設定為原始狀態
              _isNew: false         // ✅ 標記為既有資料
            };
          });

          // ✅ 強制觸發變更檢測
          this.locationData = [...this.locationData];
          console.log('載入既有位置資料完成:', this.locationData);
        }
      },
      error: (err) => {
        console.warn('載入位置資料失敗:', err);
        this.messageService.warnBubble('載入位置資料失敗');
      }
    });
  }

  private validateLocationDataIntegrity(): boolean {
    let hasErrors = false;

    this.locationData.forEach((item, index) => {
      // 檢查必要欄位
      if (!item.id) {
        console.error(`位置項目 ${index} 缺少 ID`);
        hasErrors = true;
      }

      // 檢查狀態一致性
      if (item._status === 'new' && !item._isNew) {
        console.warn(`位置項目 ${index} 狀態不一致: _status=new 但 _isNew=false`);
      }

      // 檢查已刪除項目是否還在顯示列表中
      if (item._status === 'deleted') {
        console.warn(`位置項目 ${index} 已標記刪除但仍在列表中`);
      }
    });

    return !hasErrors;
  }

  private prepareLocationDataForSubmit(): LocationItem[] {
    // 過濾掉標記為刪除且為新增的項目
    const validLocationData = this.locationData.filter(item => {
      if (item._status === 'deleted' && item._isNew) {
        return false;  // 新增後又刪除的不需要提交
      }
      if (!item.location_no || item.location_no.trim() === '') {
        console.warn('過濾掉沒有位置編號的項目:', item);
        return false;
      }
      return true;
    });

    // ✅ 確保所有項目都有正確的狀態並清理空 key
    return validLocationData.map(item => {
      const cleanedItem = this.cleanObjectKeys({
        ...item,
        _status: item._status || 'original'
      });

      // ✅ 確保必要欄位存在且有效
      return {
        id: cleanedItem.id,
        talent_id: cleanedItem.talent_id,
        location_no: cleanedItem.location_no || '',
        tlt_building: cleanedItem.tlt_building || '',
        tlt_floor: cleanedItem.tlt_floor || '',
        area_no: cleanedItem.area_no || '',
        tlt_space: cleanedItem.tlt_space || 0,
        building_desc: cleanedItem.building_desc || '',
        floor_desc: cleanedItem.floor_desc || '',
        area_desc: cleanedItem.area_desc || '',
        _status: cleanedItem._status,
        _isNew: cleanedItem._isNew || false
      } as LocationItem;
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
    // this.messageService.successBubble('Step 1 完成，可以進入下一步');
  }

  onSubmitNext(): void {
    if (this.isViewMode) {
      // 🎯 檢視模式：直接導航，不帶參數
      this.router.navigate(['account/tls/tls13010next1']);
      return;
    }

    // 🎯 編輯模式的原有邏輯
    if (this.dataForm.valid) {
      this.saveToWorkflow();
      this.router.navigate(['account/tls/tls13010next1']);
    } else {
      this.messageService.warnBubble('請檢查必填欄位');
      this.markFormGroupTouched(this.dataForm);
    }
  }

  onCancel(): void {
    if (this.isViewMode) {
      this.contractFlowService.clearViewMode();
      this.router.navigate(['account/tls/tls13010']);
      this.messageService.infoBubble('已退出檢視模式');
      return;
    }

    // 編輯模式：使用父類邏輯或自訂
    if (this.dataForm.dirty) {
      if (confirm('是否要儲存目前的編輯內容？')) {
        this.saveToWorkflow();
      }
    }
    this.router.navigate(['account/tls/tls13010']);
  }

  onClearForm(): void {
    if (confirm('確定要清除所有輸入的資料嗎？此操作無法復原。')) {
      this.dataForm.reset();
      this.dataForm.patchValue({
        comm_comp_type: '2',
        invoice_type: '1'
      });
      this.locationData = []; // 加入這行清除位置資料
      this.contractFlowService.clearTempData();
      this.messageService.infoBubble('表單已清除');
    }
  }

  // ==========  位置表格事件處理 ==========

  onAddLocationItem(): void {
    if (this.isViewMode) return;
    console.log('➕ 新增位置項目');
    console.log('🔍 新增前狀態:', {
      總數: this.locationData.length,
      可顯示: this.getDisplayLocationData().length
    });
    this.updateDisplayLocationData(); // ✅ 手動更新
    const newLocationItem: LocationItem = {
      id: this.generateTempId(),
      location_no: '',
      tlt_building: '',
      tlt_floor: '',
      area_no: '',
      tlt_space: 0,
      building_desc: '',
      floor_desc: '',
      area_desc: '',
      _status: 'new',  //設定為新增狀態
      _isNew: true //標記新資料
    };

    this.locationData = [...this.locationData, newLocationItem];
    this.saveToWorkflow();
    this.messageService.infoBubble('已新增位置項目，請選擇位置編號');
  }

  /**
   * 🎯 新增：檢查是否為新增模式
   */
  isNewContractMode(): boolean {
    return this.contractFlowService.isNewContractMode();
  }

  /**
   * 🎯 新增：取得頁面標題
   */
  getPageTitle(): string {
    return this.isNewContractMode() ? '新增契約資料' : '編輯契約資料';
  }


  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 位置表格儲存事件
  onLocationTableSave(event: { oldData: LocationItem; newData: LocationItem }): void {
    const { oldData, newData } = event;
    this.updateDisplayLocationData();
    console.log('💾 表格儲存事件:', {
      ID: newData.id,
      位置編號: `${oldData.location_no} → ${newData.location_no}`,
      原狀態: oldData._status,
      新狀態: newData._status
    });

    // ✅ 詳細的狀態判斷邏輯
    if (newData._status === 'new' || newData._isNew) {
      // 新增的資料保持 new 狀態
      newData._status = 'new';
      console.log('✅ 保持新增狀態');
    } else if (this.hasLocationDataChanged(oldData, newData)) {
      // 既有資料有變更時設為 modified
      newData._status = 'modified';
      console.log('📝 設為修改狀態');
    } else {
      // 既有資料無變更保持 original
      newData._status = 'original';
      console.log('🔄 保持原始狀態');
    }

    // 找到對應項目並更新
    const index = this.locationData.findIndex(item => item.id === newData.id);
    if (index > -1) {
      console.log(`🎯 找到對應項目，索引: ${index}`);
      this.locationData[index] = { ...newData };

      // ✅ 強制觸發變更檢測
      this.locationData = [...this.locationData];
    } else {
      console.error(`❌ 找不到對應項目: ID=${newData.id}`);
    }

    this.saveToWorkflow();
    this.messageService.successBubble('位置資料已儲存');

    console.log('💾 儲存後狀態:', {
      總數: this.locationData.length,
      可顯示: this.getDisplayLocationData().length
    });
  }

  private hasLocationDataChanged(oldData: LocationItem, newData: LocationItem): boolean {
    const fieldsToCheck = [
      'location_no', 'tlt_building', 'tlt_floor',
      'area_no', 'tlt_space'
    ];

    return fieldsToCheck.some(field =>
      (oldData as any)[field] !== (newData as any)[field]
    );
  }

  onBatchDeleteLocation(selectedItems: LocationItem[]): void {
    if (this.isViewMode) return;
    console.log('🔥 刪除方法開始');
    console.log('📝 選中的項目:', selectedItems);
    console.log('📊 刪除前資料狀態:', {
      總數: this.locationData.length,
      顯示數: this.getDisplayLocationData().length,
      原始資料: this.locationData.map(item => ({
        id: item.id,
        location_no: item.location_no,
        status: item._status
      }))
    });

    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.warnBubble('請選擇要刪除的項目');
      return;
    }
    // 過濾有效項目
    const validItems = selectedItems.filter((item): item is LocationItem & { id: string } => {
      if (!item.id) {
        console.warn('⚠️ 發現沒有 ID 的項目:', item);
        return false;
      }
      return true;
    });

    console.log('✅ 有效項目:', validItems.map(item => ({ id: item.id, status: item._status, isNew: item._isNew })));

    if (validItems.length === 0) {
      this.messageService.warnBubble('沒有有效的項目可以刪除');
      return;
    }

    // 分類處理
    const idsToRemove = new Set<string>();
    const idsToMarkDeleted = new Set<string>();

    validItems.forEach(item => {
      const itemId = String(item.id);
      if (item._status === 'new' || item._isNew) {
        idsToRemove.add(itemId);
        console.log(`🗑️ 新增項目將直接移除: ${itemId}`);
      } else {
        idsToMarkDeleted.add(itemId);
        console.log(`🏷️ 既有項目將標記刪除: ${itemId}`);
      }
    });

    console.log('📋 處理計畫:', {
      直接移除: Array.from(idsToRemove),
      標記刪除: Array.from(idsToMarkDeleted)
    });

    // 記錄舊資料長度
    const oldLength = this.locationData.length;

    // ✅ 處理資料
    this.locationData = this.locationData
      .filter(item => {
        // 移除新增項目
        if (item.id && idsToRemove.has(String(item.id))) {
          console.log(`❌ 移除項目: ${item.id} (${item.location_no})`);
          return false;
        }
        return true;
      })
      .map(item => {
        // 標記既有項目為刪除
        if (item.id && idsToMarkDeleted.has(String(item.id))) {
          console.log(`🏷️ 標記刪除: ${item.id} (${item.location_no})`);
          return { ...item, _status: 'deleted' as const };
        }
        return item;
      });

    // 檢查結果
    const newLength = this.locationData.length;
    const displayLength = this.getDisplayLocationData().length;

    console.log('📊 刪除後資料狀態:', {
      原長度: oldLength,
      新長度: newLength,
      顯示長度: displayLength,
      移除數量: oldLength - newLength,
      處理後資料: this.locationData.map(item => ({
        id: item.id,
        location_no: item.location_no,
        status: item._status
      })),
      顯示資料: this.getDisplayLocationData().map(item => ({
        id: item.id,
        location_no: item.location_no
      }))
    });
    this.displayLocationData = this.getDisplayLocationData();

    // 儲存並顯示訊息
    this.saveToWorkflow();
    this.messageService.successBubble(`已刪除 ${validItems.length} 個位置項目`);

    console.log('✅ 刪除流程完成');
  }

  // 位置表格編輯事件
  onLocationTableEdit(rowData: LocationItem): void {
    console.log('開始編輯位置資料:', rowData);
  }

  // 位置表格取消事件
  onLocationTableCancel(rowData: LocationItem): void {
    console.log('取消編輯位置資料:', rowData);
  }

  // 處理下拉選單變更（位置編號選擇時自動帶入）
  onLocationDropdownChange(event: {
    rowData: LocationItem;
    field: string;
    newValue: string;
    oldValue: string;
    selectedOption?: any; // 🎯 關鍵：selector-panel 應該提供這個
  }): void {
    const { rowData, field, newValue, oldValue, selectedOption } = event;

    console.log('🔄 位置欄位變更事件:', {
      field,
      newValue,
      oldValue,
      hasSelectedOption: !!selectedOption,
      rowId: rowData.id
    });

    if (field === 'location_no' && newValue) {
      // 🎯 優先使用 selectedOption（來自 selector-panel）
      if (selectedOption) {
        console.log('📋 使用 selector-panel 提供的完整資料:', selectedOption);
        this.handleLocationSelectionFromSelectorPanel(rowData, selectedOption);
      }
    }
    this.saveToWorkflow();
  }

  // 🎯 新增：專門處理來自 selector-panel 的選擇
  private handleLocationSelectionFromSelectorPanel(rowData: LocationItem, selectedOption: any): void {
    const targetIndex = this.locationData.findIndex(item => item.id === rowData.id);

    if (targetIndex === -1) {
      console.error('❌ 找不到對應項目:', rowData.id);
      return;
    }

    // 🎯 從 selectedOption 取得所有需要的資料
    const locationData = {
      location_no: selectedOption.value || selectedOption.location_no || '',
      tlt_building: selectedOption.tlt_building || '',
      tlt_floor: selectedOption.tlt_floor || '',
      area_no: selectedOption.area_no || '',
      tlt_space: Number(selectedOption.tlt_space) || 0,
      building_desc: selectedOption.building_desc || '',
      floor_desc: selectedOption.floor_desc || '',
      area_desc: selectedOption.area_desc || ''
    };

    console.log('📋 從 selector-panel 取得的位置資料:', locationData);

    // 🎯 更新資料
    const currentStatus = this.locationData[targetIndex]._status;
    const newStatus = currentStatus === 'new' ? 'new' : 'modified';

    this.locationData[targetIndex] = {
      ...this.locationData[targetIndex],
      ...locationData,
      _status: newStatus
    };

    // 🎯 同步更新 rowData（讓表格立即顯示）
    Object.assign(rowData, this.locationData[targetIndex]);

    // 🎯 觸發變更檢測
    this.locationData = [...this.locationData];
    this.updateDisplayLocationData();

    // this.messageService.infoBubble(`已選擇位置：${locationData.location_no}（${locationData.building_desc}）`);
  }


  // 清除所有位置
  onClearAllLocations(): void {
    if (confirm('確定要清除所有位置資訊嗎？此操作無法復原。')) {
      this.locationData = [];
      this.saveToWorkflow();
      this.messageService.infoBubble('已清除所有位置資訊');
    }
  }

  // 取得位置總營業坪數
  getTotaltlt_space(): number {
    return this.locationData.reduce((total: number, item: LocationItem) => {
      const area = parseFloat(item.tlt_space.toString()) || 0;
      return total + area;
    }, 0);
  }

  // 取得位置設定狀態
  getLocationSetupStatus(): { text: string; class: string } {
    if (this.locationData.length === 0) {
      return { text: '未設定', class: 'text-red-500' };
    } else {
      const hasEmptyLocation = this.locationData.some((item: LocationItem) => !item.location_no);
      if (hasEmptyLocation) {
        return { text: '設定不完整', class: 'text-orange-500' };
      } else {
        return { text: '設定完成', class: 'text-green-500' };
      }
    }
  }

  // ==========  銀行相關事件處理 ==========
  onBankSelect(selectedBank: AutoCompleteOption): void {
    console.log('🏦 銀行選擇事件:', selectedBank);

    // 🎯 確保 selectedBank 有完整的屬性
    // AutoComplete 組件應該已經提供完整的 AutoCompleteOption 物件
    this.selectedBankInfo = {
      value: selectedBank.value,      // 例如: "0040037"
      label: selectedBank.label,      // 例如: "臺灣銀行營業部"
      fullText: selectedBank.fullText // 例如: "0040037臺灣銀行營業部"
    };

    this.dataForm.patchValue({ bank_id: selectedBank.value });

    // 🎯 立即儲存到工作流程
    this.saveToWorkflow();

    console.log('✅ 銀行選擇完成並儲存:', {
      bank_id: selectedBank.value,
      selectedBankInfo: this.selectedBankInfo
    });
  }

  onBankUnselect(): void {
    console.log('🏦 銀行取消選擇');

    this.selectedBankInfo = null;
    this.dataForm.patchValue({ bank_id: '' });

    // 🎯 立即儲存到工作流程
    this.saveToWorkflow();

    console.log('✅ 銀行取消選擇並儲存');
  }

  searchBankOptions(searchKeyword: string): Observable<string[]> {
    return this.bankService.getBankOptions(searchKeyword).pipe(
      map((data: DropdownOption[]) => data.map(item => `${item.value}${item.label}`))
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

  private getOperationType(status?: string): string {
    switch (status) {
      case 'new': return 'INSERT';
      case 'modified': return 'UPDATE';
      case 'deleted': return 'DELETE';
      default: return 'NONE';
    }
  }

  //新增取得可顯示位置資料的方法
  getDisplayLocationData(): LocationItem[] {
    // 過濾掉標記為刪除的資料
    return this.locationData.filter(item => item._status !== 'deleted');
  }

  private validateWorkflowData(): void {
    const savedData = this.contractFlowService.getStep1Data();
    console.log('🔍 暫存資料驗證:');

    if (!savedData) {
      console.log('❌ 沒有暫存資料');
      return;
    }

    console.log('📋 暫存資料基本資訊:', {
      talent_id: savedData.talent_id,
      apply_no: savedData.apply_no,
      tlt_name: savedData.tlt_name
    });

    if (savedData.locationInfo) {
      console.log('📍 暫存位置資料:', {
        類型: Array.isArray(savedData.locationInfo) ? '陣列' : typeof savedData.locationInfo,
        數量: Array.isArray(savedData.locationInfo) ? savedData.locationInfo.length : '非陣列',
        內容: savedData.locationInfo
      });

      if (Array.isArray(savedData.locationInfo)) {
        savedData.locationInfo.forEach((item, index) => {
          console.log(`  ${index + 1}. ID: ${item.id}, 位置: ${item.location_no}, 狀態: ${item._status}`);
        });
      }
    } else {
      console.log('📭 沒有位置暫存資料');
    }
  }

  private updateDisplayLocationData(): void {
    this.displayLocationData = this.locationData.filter(item => item._status !== 'deleted');
  }

  onCommissionTypeChange(newValue: string): void {
    if (!this.contractFlowService.isNewContractMode()) {
      const originalData = this.contractFlowService.getCurrentData()?.queryRowData;
      const originalCommissionType = originalData?.tlt_term_type?.toString().trim();

      if (originalCommissionType && originalCommissionType !== newValue?.trim()) {
        const originalName = this.getTermTypeName(originalCommissionType);
        const newName = this.getTermTypeName(newValue);

        // 🎯 生成具體的清除資訊
        const clearOps = this.generateClearOperations(originalCommissionType);
        const clearDetails = this.generateClearDetails(clearOps);

        const warningMessage = `⚠️ 抽成別變更警告\n\n` +
          `原始抽成別：${originalName}\n` +
          `新抽成別：${newName}\n\n` +
          `${clearDetails}\n\n` +
          `請確認是否要繼續？`;

        if (!confirm(warningMessage)) {
          // 使用者取消，恢復原值
          this.dataForm.patchValue({ tlt_term_type: originalCommissionType });
          return;
        } else {
          // 使用者確認變更
          this.messageService.warnBubble('抽成別已變更，相關條件設定將在送出時被清除');
        }
      }
    }

    // 儲存變更
    this.saveToWorkflow();
  }

  private generateClearOperations(originalTermType: string): any {
    return {
      clearRentDetails: originalTermType === '1' || originalTermType === '2',
      clearLimitDetails: originalTermType === '4' || originalTermType === '6',
      clearLevelDetails: originalTermType === '5' || originalTermType === '6'
    };
  }


  private generateClearDetails(clearOps: any): string {
    const willClear: string[] = [];
    const willKeep: string[] = ['抽成設定 (主檔、明細、年度業績、層級)'];

    if (clearOps.clearRentDetails) willClear.push('租金設定');
    if (clearOps.clearLimitDetails) willClear.push('包底設定');
    if (clearOps.clearLevelDetails) willClear.push('階梯設定');

    let message = '';

    if (willClear.length > 0) {
      message += `將清除：${willClear.join('、')}\n`;
    } else {
      message += `無需清除條件設定\n`;
    }

    message += `將保留：${willKeep.join('、')}`;

    return message;
  }

  /**
   * 🎯 新增：取得抽成別名稱
   */
  private getTermTypeName(termType: string): string {
    const option = this.tltTermTypeOptions.find(opt => opt.value === termType);
    return option ? option.label : `未知類型(${termType})`;
  }

  /**
   * 檢查是否有抽成別變更
   */
  hasCommissionTypeChanged(): boolean {
    if (this.contractFlowService.isNewContractMode()) {
      return false;
    }

    const originalData = this.contractFlowService.getCurrentData()?.queryRowData;
    const originalCommissionType = originalData?.tlt_term_type?.toString().trim();
    const currentCommissionType = this.dataForm.get('tlt_term_type')?.value?.toString().trim();

    return originalCommissionType !== currentCommissionType;
  }

  private ensureClassificationDataLoaded(busType: string): void {
    const currentBusClass = this.dataForm.get('bus_class')?.value;
    const currentBusSClass = this.dataForm.get('bus_sclass')?.value;

    console.log('🔍 確認分類資料:', { busType, currentBusClass, currentBusSClass });

    // 檢查中分類選項是否已載入
    if (currentBusClass && this.tls13010DropdownService.busClassOptions.length === 0) {
      console.log('🔄 重新載入中分類選項');
      this.tls13010DropdownService.loadBusClassOptions(busType).subscribe();
    }

    // 檢查小分類選項是否已載入
    if (currentBusClass && currentBusSClass && this.tls13010DropdownService.busSClassOptions.length === 0) {
      console.log('🔄 重新載入小分類選項');
      this.tls13010DropdownService.loadBusSClassOptions(busType, currentBusClass).subscribe();
    }
  }

  /**
   * 🎯 新增：處理 router state
   */
  private async handleRouterState(): Promise<void> {
    try {
      const navigation = this.router.getCurrentNavigation();
      const routerState = navigation?.extras?.state;

      console.log('🔍 檢查 router state:', routerState);

      if (routerState && (routerState['mode'] || routerState['talentId'])) {
        // 🎯 從其他程式跳轉進來
        console.log('🚀 從其他程式跳轉，初始化工作流程');

        const success = await this.contractFlowService.initializeFromRouterState(routerState);

        if (success) {
          console.log('✅ 工作流程初始化成功');

          // 🎯 延遲一點再載入工作流程資料，確保初始化完成
          setTimeout(() => {
            this.loadWorkflowData();
          }, 100);

        } else {
          console.error('❌ 工作流程初始化失敗');
          this.messageService.errorBubble('載入資料失敗，請重新選擇要檢視的項目');
          this.router.navigate(['account/tls/tls13010']);
        }

      } else {
        // 🎯 正常流程：從查詢頁面進來，不做額外處理
        console.log('📋 正常流程，將在後續載入工作流程資料');
      }

    } catch (error) {
      console.error('❌ 處理 router state 失敗:', error);
      this.messageService.errorBubble('初始化失敗，請重新操作');
      this.router.navigate(['account/tls/tls13010']);
    }
  }

  /**
   * 🎯 新增：設定檢視模式 UI
   */
  private setupViewModeUI(): void {
    console.log('🔧 設定檢視模式 UI 監聽');

    // 🎯 先檢查當前狀態
    const currentViewMode = this.contractFlowService.isViewMode();
    console.log('📋 當前檢視模式狀態:', currentViewMode);

    // 🎯 如果已經是檢視模式，立即設定
    if (currentViewMode) {
      this.isViewMode = true;
      this.handleViewModeChange(true);
    }

    // 🎯 訂閱後續變更
    this.viewModeSubscription = this.contractFlowService.isViewMode$.subscribe(isViewMode => {
      console.log('🔍 檢視模式變更:', isViewMode);
      this.isViewMode = isViewMode;
      this.handleViewModeChange(isViewMode);
    });
  }

  private handleViewModeChange(isViewMode: boolean): void {
    console.log('🔄 處理檢視模式變更:', isViewMode);

    if (isViewMode) {
      this.formTitle = '檢視契約資料';
      console.log('🔒 切換到檢視模式');
    } else {
      this.formTitle = this.contractFlowService.isNewContractMode() ? '新增契約資料' : '編輯契約資料';
      console.log('🔓 切換到編輯模式');
    }

    // 🎯 重新設定控制狀態
    setTimeout(() => {
      this.setFormControlsState();
    }, 0);
  }


  // /**
  //  * 🎯 新增：設定表單為唯讀
  //  */
  // private setFormReadonly(readonly: boolean): void {
  //   if (readonly) {
  //     this.dataForm.disable();
  //     console.log('🔒 表單已設為唯讀');
  //   } else {
  //     this.dataForm.enable();
  //     console.log('🔓 表單已設為可編輯');

  //     // 🎯 立即恢復必要的欄位約束
  //     setTimeout(() => {
  //       this.restoreFieldConstraints();
  //     }, 0);
  //   }
  // }

  // /**
  //  * 🎯 新增：恢復欄位約束（不破壞 selector-panel）
  //  */
  // private restoreFieldConstraints(): void {
  //   console.log('🔄 恢復欄位約束');

  //   // 🎯 版次永遠禁用
  //   const contractSubnoControl = this.dataForm.get('contract_subno');
  //   if (contractSubnoControl) {
  //     contractSubnoControl.disable();
  //     console.log('🔒 版次欄位已禁用');
  //   }

  //   // 🎯 公司登記地址永遠禁用（因為是從其他系統帶入的）
  //   const companyAddressControl = this.dataForm.get('company_register_address');
  //   if (companyAddressControl) {
  //     companyAddressControl.disable();
  //     console.log('🔒 公司登記地址欄位已禁用');
  //   }

  //   // 🎯 如果不是新增模式，某些欄位禁用
  //   if (!this.contractFlowService.isNewContractMode()) {
  //     const nonEditableFields = [
  //       'talent_id',    // 專櫃ID
  //       'apply_no',     // 專櫃招募編號
  //       'tlt_no',       // 專櫃編號
  //       'VEN_Name',     // 廠商名稱
  //       'tlt_name'      // 櫃位名稱
  //     ];

  //     nonEditableFields.forEach(fieldName => {
  //       const control = this.dataForm.get(fieldName);
  //       if (control) {
  //         control.disable();
  //         console.log(`🔒 編輯模式禁用欄位: ${fieldName}`);
  //       }
  //     });
  //   } else {
  //     // 🎯 新增模式下，確保這些欄位是可編輯的
  //     const editableInNewMode = ['apply_no', 'tlt_no', 'VEN_Name', 'tlt_name'];

  //     editableInNewMode.forEach(fieldName => {
  //       const control = this.dataForm.get(fieldName);
  //       if (control && control.disabled) {
  //         control.enable();
  //         console.log(`🔓 新增模式啟用欄位: ${fieldName}`);
  //       }
  //     });
  //   }
  // }

  /**
   * 🎯 新增：處理初始化失敗
   */
  private handleInitializationFailure(): void {
    this.messageService.errorBubble('載入資料失敗，請重新選擇要檢視的項目');
    this.router.navigate(['account/tls/tls13010']);
  }

  /**
   * 🎯 新增：按鈕顯示控制
   */
  showEditButtons(): boolean {
    return !this.isViewMode;
  }

  showViewButtons(): boolean {
    return this.isViewMode;
  }

  /**
   * 退出檢視模式
   */
  exitViewMode(): void {
    this.contractFlowService.clearViewMode();
    this.router.navigate(['account/tls/tls13010']);
    this.messageService.infoBubble('已退出檢視模式');
  }

  /**
   * 切換到編輯模式（移除 URL 參數）
   */
  switchToEditMode(): void {
    if (confirm('確定要切換到編輯模式嗎？')) {
      // 🎯 移除 URL 參數，導航到乾淨的編輯頁面
      this.router.navigate(['account/tls/tls13010cru'], {
        queryParams: {}  // 清空參數
      });

      this.messageService.infoBubble('已切換到編輯模式');
    }
  }

  /**
 * 🎯 新增：取得公司登記地址
 */
  getCompanyAddress(): string {
    const address = this.dataForm.get('company_register_address')?.value;
    return address?.trim() || '';
  }

  /**
   * 🎯 新增：複製公司登記地址到郵寄地址
   */
  copyCompanyAddressToContact(): void {
    const companyAddress = this.getCompanyAddress();

    if (!companyAddress) {
      this.messageService.warnBubble('公司登記地址為空，無法複製');
      return;
    }

    // 檢查是否為檢視模式
    if (this.isViewMode) {
      this.messageService.warnBubble('檢視模式下無法修改資料');
      return;
    }

    // // 檢查郵寄地址是否已有值
    // const currentContactAddr = this.dataForm.get('contact_addr')?.value?.trim();
    // if (currentContactAddr) {
    //   if (!confirm('郵寄地址已有內容，確定要覆蓋嗎？')) {
    //     return;
    //   }
    // }

    // 複製地址
    this.dataForm.patchValue({
      contact_addr: companyAddress
    });

    // 標記欄位為已修改（觸發驗證樣式）
    this.dataForm.get('contact_addr')?.markAsTouched();
    this.dataForm.get('contact_addr')?.markAsDirty();

    // 自動儲存
    this.saveToWorkflow();

    this.messageService.successBubble('已複製公司登記地址到郵寄地址');

    console.log('📋 地址複製完成:', {
      from: companyAddress,
      to: this.dataForm.get('contact_addr')?.value
    });
  }

  /**
   * 🎯 新增：檢查按鈕是否可用
   */
  canCopyAddress(): boolean {
    return !this.isViewMode && !!this.getCompanyAddress();
  }

  searchLocationOptions(searchParams: any): Observable<any[]> {
    console.log('🔍 CRU 收到搜尋參數:', searchParams);

    // 🎯 轉換 SortBy 的欄位名稱
    if (searchParams.SortBy && Array.isArray(searchParams.SortBy)) {
      searchParams.SortBy = searchParams.SortBy.map((sort: any) => ({
        field: sort.field === 'value' ? 'location_no' : sort.field,  // 🎯 轉換欄位名
        order: 1  // 🎯 固定為升序，或保持原值 sort.order
      }));
    }

    console.log('🔄 轉換後參數:', searchParams);

    return this.locationOptionsService.getLocationWithDetailsOptions(searchParams);
  }


  private updateSelectorPanelOptions(): void {
    const locationColumn = this.locationColumns.find(col => col.field === 'location_no');

    if (locationColumn?.selectorConfig?.searchFormFields) {
      // 🎯 使用 dropdown 服務中已載入的館別選項
      const buildingField = locationColumn.selectorConfig.searchFormFields.find(
        field => field.name === 'building_code'
      );
      if (buildingField) {
        buildingField.options = this.tls13010DropdownService.buildingOptions || [];
        console.log('🏢 館別選項已更新:', buildingField.options.length);
      }

      // 🎯 使用 dropdown 服務中已載入的樓層選項
      const floorField = locationColumn.selectorConfig.searchFormFields.find(
        field => field.name === 'floor_code'
      );
      if (floorField) {
        floorField.options = this.tls13010DropdownService.floorOptions || [];
        console.log('🏢 樓層選項已更新:', floorField.options.length);
      }

      // 🎯 使用 dropdown 服務中已載入的區域選項
      const areaField = locationColumn.selectorConfig.searchFormFields.find(
        field => field.name === 'area_code'
      );
      if (areaField) {
        areaField.options = this.tls13010DropdownService.regionOptions || [];
        console.log('📍 區域選項已更新:', areaField.options.length);
      }

      console.log('✅ Selector 面板選項更新完成');
    }
  }
}
