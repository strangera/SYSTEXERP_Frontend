import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NegotiatorOptionsService } from '@service/api/dropdownservice/negotiator-options.service';
import { VendorCategoryOptionsService } from '@service/api/dropdownservice/vendor-category-options.service';
import { Tls12010Service } from '@service/api/tls/tls12010.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { RadiobuttonComponent } from "@shared/componentkit/radiobutton/radiobutton.component";
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime, distinctUntilChanged, firstValueFrom, map, Observable, of, Subscription, switchMap } from 'rxjs';
import { BankOptionsService } from '../../../service/api/dropdownservice/bank-option.service';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AutoCompleteComponent, AutoCompleteOption } from '../../../shared/componentkit/app-autocomplete/app-autocomplete.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ColumnDef, ExpandableEditTableComponent, SelectorTableColumn } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { ContractFlowService } from '../tls13010/services/contract-flow.service';
import { DropdownOption, Pos2013DropdownOption, TLS13010_DROPDOWN_OPTIONS, TLS13010DropdownService } from '../tls13010/tls13010.dropdown';
import { ContractInfo, LocationItem } from '../tls13010/tls13010.model';
import { CommissionTypeChangeService } from './services/commission-type-change.service';
import { TLS13010DataLoaderService } from './services/data-loader.service';
import { FormStateService } from './services/form-state.service';
import { LocationDataManagementService } from './services/location-data-management.service';
import { RentCalculationService } from './services/rent-calculation.service';
import { TlsContractBaseService } from '@shared/services/tls/tls-contract-base.service';
import { sanitizeDateFields } from '@shared/services/tls/tls-form-defaults.constants';
import { DateValidationService } from './validation/date-validation.service';
import { EmailValidationService } from './validation/email-validation.service';
import { TLS13010ValidationService } from './validation/tls13010-validation.service';

interface CategoryItem {
  id: number;
}

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
export class TLS13010CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {
  // ========== 核心屬性（取代繼承的部分） ==========
  // ========== CRUD 狀態管理 (參考 TLS12040) ==========
  override crudstatus: CRUDStatus = CRUDStatus.Create;

  // 將 CRUDStatus 暴露給模板使用
  readonly CRUDStatus = CRUDStatus;

  // ========== 表單唯讀狀態 (衍生自 crudstatus) ==========
  get isFormReadonly(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  // ========== 資料載入狀態旗標 ==========
  // ✅ 已移除 isLoadingExistingData flag,因為改用 (optionSelected) 事件,不需要 flag 了
  // 位置選項資料
  locationWithDetailsOptions: DropdownOption[] = [];
  displayLocationData: LocationItem[] = [];

  //廠商統一編號
  pos2013Options: Pos2013DropdownOption[] = [];

  // 洽談者選項
  negotiatorOptions: DropdownOption[] = [];

  // 新的位置表格欄位定義
  locationColumns: ColumnDef[] = [
    {
      field: 'location_no',
      header: '位置編號',
      type: 'selector-panel',  // 改用 selector-panel
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
            options: [], // 會在 updateSelectorPanelOptions 中更新
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
    vendor_ven_no: [''],    // VEN_No (完整編號) - 下拉選單用
    vendor_no: [''],        // No (統編) - 後端用
    talent_id: [''], // 必填但系統自動給號
    apply_no: [''], // 必填但系統自動給號
    approve_status: ['1', [Validators.required]], // 必填，預設未審核
    tlt_name: ['', [Validators.required, Validators.maxLength(100)]], // 必填
    tlt_no: [''], // 必填但系統自動給號
    ven_no: ['', [Validators.required, Validators.maxLength(16)]],
    ven_uniform: ['', [Validators.maxLength(10)]], // 必填
    VEN_Name: ['', [Validators.maxLength(100)]], // 必填但自動帶入
    VEN_Address: [''],
    paper_type: ['', [Validators.maxLength(2)]],
    bus_type: ['', [Validators.required, Validators.maxLength(2)]], // 必填
    bus_class: ['', [Validators.required, Validators.maxLength(2)]], // 必填
    bus_sclass: ['', [Validators.required, Validators.maxLength(2)]],
    contract_no: ['', [Validators.maxLength(12)]], // 必填
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
    check_typeList: [[] as string[]],
    check_type: [''],
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
    email: ['', [Validators.maxLength(100)]],
    invoice_email: ['', [Validators.maxLength(100)]],
    CHECK_TITLE: ['', [Validators.maxLength(100)]],
    store_tel: ['', [Validators.maxLength(50)]],
    bank_id: ['', [Validators.maxLength(10)]],
    vendor_acct_name: ['', [Validators.maxLength(60)]],
    vendor_acct_no: ['', [Validators.maxLength(16)]],
    contact_tel: ['', [Validators.maxLength(20)]],
    contact_fax: ['', [Validators.maxLength(15)]],
    contact_addr: ['', [Validators.maxLength(100)]],
    tlt_remark: ['', [Validators.maxLength(2000)]],

    // 狀態欄位
    tlt_openflag: [''],
    cap_saletype1: ['N'],
    cap_saletype2: ['N'],
    cap_saletype3: ['N'],
    cap_saletype4: ['N'],
    cap_saletype5: ['N'],

    open_deposit: [''],
    open_fees: [0], //準時開業保證金
    construct_deposit: [''],
    construct_fees: [0], //施工保證金額
    expiration_deposit: [''],
    expiration_fees: [0], //契約屆滿保證金金額
    total_amt_unit: [''],
    total_amt_vendor_unit: [''],
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
  approveStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.approveStatusOptions]

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
  bankDropdownOptions: DropdownOption[] = [];
  selectedBankInfo: AutoCompleteOption | null = null;

  constructor(
    // 核心服務
    private tlsBaseService: TlsContractBaseService,
    private locationManagementService: LocationDataManagementService,
    private dataLoaderService: TLS13010DataLoaderService,

    private rentCalculationService: RentCalculationService,
    private commissionTypeChangeService: CommissionTypeChangeService,

    private formStateService: FormStateService,
    private route: ActivatedRoute,
    private contractFlowService: ContractFlowService,
    public tls13010DropdownService: TLS13010DropdownService,
    private bankService: BankOptionsService,
    private locationOptionsService: LocationOptionsService,
    private tls13010Service: TLS13010Service,
    private tls12010Service: Tls12010Service,
    private vendorCategoryService: VendorCategoryOptionsService,
    private negotiatorService: NegotiatorOptionsService,
    private validationService: TLS13010ValidationService,
    private dateValidationService: DateValidationService,
    private emailValidationService: EmailValidationService,
    private cdr: ChangeDetectorRef,
    // private systemDataService: SystemDataService
  ) { super(); }

  // ==========  生命週期方法 ==========
  async ngOnInit(): Promise<void> {
    try {
      console.log('🚀 ========== TLS13010 元件初始化開始 ==========');

      // 步驟 1: 基本初始化（同步）
      this.initializeBasics();

      // 步驟 2: 初始化檢視模式（同步）
      this.initializeViewMode();

      // ✅ 步驟 3: 初始化工作流程（同步）- 移到 dropdown 之前，避免阻塞
      this.initializeWorkflow();

      // ⚡ 步驟 4: 並行載入下拉選單與資料 - 這是關鍵優化！
      // 不再等待 dropdown 全部載入完成才載入資料，而是同時進行
      const [dropdownsLoaded] = await Promise.all([
        this.loadAllDropdownOptions(),
        this.loadDataIfNeeded() // 與 dropdown 並行載入
      ]);

      // 步驟 5: 設定監聽器（同步）
      this.setupListeners();

      // 步驟 6: 設定動態驗證器（同步）
      this.setupDynamicValidators();

      // 步驟 7: 設定表單控制項狀態（同步）
      this.setFormControlsState();

      // 步驟 8: 執行初始驗證（同步）
      this.performInitialValidation();

      // 步驟 9: 更新 UI（同步）
      this.updateUI();

      console.log('✅ ========== TLS13010 元件初始化完成 ==========');

    } catch (error) {
      console.error('❌ ========== TLS13010 元件初始化失敗 ==========');
      console.error('錯誤詳情:', error);
      this.messageService.errorBubble('載入失敗，請重新整理頁面');
    }
  }

  ngOnDestroy(): void {
    // 清理訂閱
    this.subscriptions.forEach(sub => sub.unsubscribe());

    //  清理 FormStateService
    this.formStateService.cleanup();
  }

  private initializeBasics(): void {
    console.log('📝 步驟 1: 基本初始化');

    // 初始化頁面
    this.initializePage('TLS13010', this.dataForm, { useReadonly: true });
    window.scrollTo({ top: 0 });

    // 設定用戶資訊
    if (this.authService.currentUserValue) {
      this.user = this.authService.currentUserValue;
    }

    // 設定當前程式編號
    this.currentPageService.setCurrentProgNo(this.ProgNo);
    this.funInfo = this.systemDataService.getUserPermissions(this.ProgNo);

    // 固定為 Edit，避免表單被 disable
    this.crudstatus = CRUDStatus.Edit;

    // 使用 service 取得標題
    this.formTitle = this.getFormTitle(
      this.contractFlowService.isNewContractMode(),
      this.contractFlowService.isViewMode()
    );

    console.log('   基本初始化完成');
  }



  /**
 * 檢查特定欄位的 readonly 狀態（供 UI 參考）
 */
  isFieldReadonly(fieldName: string): boolean {
    return this.formStateService.isFieldReadonly(
      fieldName,
      this.crudstatus === CRUDStatus.Read,
      this.contractFlowService.isNewContractMode()
    );
  }


  private initializeViewMode(): void {
    console.log('📝 步驟 2: 初始化 CRUD 狀態');

    // 🔑 優先從 workflowStatus 恢復 crudStatus (支援頁面重新整理)
    const workflowStatus = this.contractFlowService.getCurrentStatus();
    if (workflowStatus?.crudStatus) {
      this.crudstatus = workflowStatus.crudStatus;
      console.log(`   從 workflowStatus 恢復 CRUD 狀態: ${this.crudstatus}`);

      // 同步 isViewMode 狀態
      const isViewMode = this.crudstatus === CRUDStatus.Read;
      this.contractFlowService.setViewMode(isViewMode);
    } else {
      // fallback: 從服務取得檢視模式狀態並設定 CRUD 狀態
      const isViewMode = this.contractFlowService.isViewMode();
      this.crudstatus = isViewMode ? CRUDStatus.Read : CRUDStatus.Edit;
      console.log(`   從 isViewMode 推斷 CRUD 狀態: ${this.crudstatus}`);
    }

    // 設定檢視模式 UI 監聽
    this.setupViewModeUI();

    console.log(`   最終 CRUD 狀態: ${this.crudstatus}`);
  }

  private initializeWorkflow(): void {
    console.log('📝 步驟 3: 初始化工作流程');

    // 處理 router state
    this.handleRouterState();

    // 載入工作流程資料
    this.dataLoaderService.loadWorkflowData(this);

    console.log('   工作流程初始化完成');
  }

  private async loadAllDropdownOptions(): Promise<void> {
    console.log('📝 步驟 4: 載入所有下拉選單選項');
    console.log('  📥 開始並行載入...');

    try {
      await Promise.all([
        this.loadOption('paper_type', () =>
          firstValueFrom(this.tls13010DropdownService.initLocationOptionsWithRetry().pipe(
            switchMap(() => of(this.tls13010DropdownService.paperTypeOptions))
          ))
        ),
        this.loadOption('org', () =>
          firstValueFrom(of(this.tls13010DropdownService.orgOptions))
        ),
        this.loadOption('bus_type', () =>
          firstValueFrom(this.tls13010DropdownService.initBustypeOptionsWithRetry())
        ),
        this.loadOption('building', () =>
          firstValueFrom(of(this.tls13010DropdownService.buildingOptions))
        ),
        this.loadOption('floor', () =>
          firstValueFrom(of(this.tls13010DropdownService.floorOptions))
        ),
        this.loadOption('region', () =>
          firstValueFrom(of(this.tls13010DropdownService.regionOptions))
        ),
        this.loadVendorOptions(),
        this.loadBankOptions(),
        this.loadNegotiatorOptions(),
        this.loadPayNoOptions(),
      ]);

      console.log('   所有下拉選單選項載入完成');
      this.validateDropdownOptions();
      this.updateSelectorPanelOptions();

    } catch (error) {
      console.error('  ❌ 載入下拉選單選項失敗:', error);
      throw error;
    }
  }

  /**
 * 統一的選項載入方法
 */
  private async loadOption(name: string, loadFn: () => Promise<any>): Promise<void> {
    try {
      await loadFn();
      console.log(`     ${name} 選項已載入`);
    } catch (error) {
      console.error(`    ❌ ${name} 選項載入失敗:`, error);
      // 不中斷整體流程
    }
  }

  /**
   * 載入廠商選項
   */
  private async loadVendorOptions(): Promise<void> {
    try {
      this.pos2013Options = await firstValueFrom(
        this.vendorCategoryService.getVendorCategoryNoNameOptions()
      );
      console.log(`     廠商選項已載入 (${this.pos2013Options.length} 個)`);
    } catch (error) {
      console.error('    ❌ 廠商選項載入失敗:', error);
      this.pos2013Options = [];
    }
  }

  /**
   * 載入銀行選項
   */
  private async loadBankOptions(): Promise<void> {
    try {
      this.bankDropdownOptions = await firstValueFrom(
        this.bankService.getBankOptions()
      );
      console.log(`     銀行選項已載入 (${this.bankDropdownOptions.length} 個)`);
    } catch (error) {
      console.error('    ❌ 銀行選項載入失敗:', error);
      this.bankDropdownOptions = [];
    }
  }

  /**
   * 載入洽談者選項
   */
  private async loadNegotiatorOptions(): Promise<void> {
    try {
      this.negotiatorOptions = await firstValueFrom(
        this.negotiatorService.getNegotiatorOptions()
      );
      console.log(`     洽談者選項已載入 (${this.negotiatorOptions.length} 個)`);
    } catch (error) {
      console.error('    ❌ 洽談者選項載入失敗:', error);
      this.negotiatorOptions = [];
    }
  }

  /**
   * 載入支付編號選項
   */
  private async loadPayNoOptions(): Promise<void> {
    try {
      await firstValueFrom(
        this.tls13010DropdownService.initPayNoOptionsWithRetry()
      );
      console.log(`     支付編號選項已載入 (${this.tls13010DropdownService.payNoOptions.length} 個)`);
    } catch (error) {
      console.error('    ❌ 支付編號選項載入失敗:', error);
      this.tls13010DropdownService.payNoOptions = [];
    }
  }

  /**
   * 驗證下拉選單選項
   */
  private validateDropdownOptions(): void {
    console.log('  🔍 驗證下拉選單選項...');

    const optionsToCheck = [
      { name: '營業型態', options: this.tls13010DropdownService.paperTypeOptions },
      { name: '組織代碼', options: this.tls13010DropdownService.orgOptions },
      { name: '大分類', options: this.tls13010DropdownService.bustypeOptions },
      { name: '館別', options: this.tls13010DropdownService.buildingOptions },
      { name: '樓層', options: this.tls13010DropdownService.floorOptions },
      { name: '區域', options: this.tls13010DropdownService.regionOptions },
      { name: '廠商', options: this.pos2013Options },
      { name: '銀行', options: this.bankDropdownOptions },
      { name: '洽談者', options: this.negotiatorOptions },
    ];

    let hasEmptyOptions = false;
    optionsToCheck.forEach(({ name, options }) => {
      const count = options?.length || 0;
      if (count === 0) {
        console.warn(`    ⚠️ ${name}: 選項數量為 0`);
        hasEmptyOptions = true;
      } else {
        console.log(`     ${name}: ${count} 個選項`);
      }
    });

    if (hasEmptyOptions) {
      this.messageService.warnBubble('部分選項載入失敗，請重新整理頁面');
    }
  }

  private async loadDataIfNeeded(): Promise<void> {
    console.log('📝 步驟 5: 載入資料（如果需要）');

    // 新建模式：設定預設值
    if (this.contractFlowService.isNewContractMode()) {
      console.log('  🆕 新建模式：設定預設值');
      this.tlsBaseService.setCurrentUserAsNegotiator(this.dataForm);
      this.saveToWorkflow();
      console.log('   預設值設定完成');
      return;
    }

    //  修正：編輯/檢視模式先檢查 session
    const queryRowData = this.contractFlowService.getCurrentData()?.queryRowData;
    if (!queryRowData?.talent_id) {
      console.log('  📭 無需載入資料');
      return;
    }

    //  🔥 檢視模式策略：優先從 API 載入最新資料（參考 TLS12040）
    if (this.crudstatus === CRUDStatus.Read) {
      console.log('  🔍 檢視模式：無條件從 API 載入最新資料');
      await this.loadContractDetailAsync(String(queryRowData.talent_id));
      console.log('   資料載入完成');
      return;
    }

    //  編輯模式策略：優先使用 session，避免覆蓋未儲存的修改
    const savedFormData = this.contractFlowService.getStep1Data();

    if (savedFormData && this.isSessionDataComplete(savedFormData)) {
      console.log('   編輯模式：Session 資料完整，使用 session（不打 API）');
      // 使用 session 資料填充表單
      this.loadFromSessionData(savedFormData);
      return;
    }

    // ❌ Session 無資料或不完整，才打 API
    console.log('  ⚠️ Session 無有效資料，從 API 載入');
    await this.loadContractDetailAsync(String(queryRowData.talent_id));
    console.log('   資料載入完成');
  }

  /**
 *  新增：檢查 session 資料是否完整
 */
  private isSessionDataComplete(sessionData: any): boolean {
    if (!sessionData || typeof sessionData !== 'object') {
      console.log('  ❌ Session 資料格式錯誤');
      return false;
    }

    // 檢查關鍵欄位
    const requiredFields = [
      'talent_id',
      'tlt_no',
      'tlt_name',
      'ven_no',
      'tlt_bdate',
      'tlt_edate'
    ];

    for (const field of requiredFields) {
      const value = sessionData[field];
      if (value === null || value === undefined || value === '') {
        console.log(`  ⚠️ Session 缺少欄位: ${field}`);
        return false;
      }
    }

    console.log('Session 資料完整');
    return true;
  }

  /**
   *  新增：從 session 載入資料
   */
  private loadFromSessionData(sessionData: any): void {
    // ✅ check_type 轉換處理
    if ((!sessionData.check_typeList || sessionData.check_typeList.length === 0) && sessionData.check_type) {
      const checkTypeStr = String(sessionData.check_type);
      sessionData.check_typeList = checkTypeStr.split(',').map((x: string) => String(x.trim())).filter((x: string) => x);
      console.log(`[檢視-Session轉換] "${checkTypeStr}" → [${sessionData.check_typeList.join(', ')}]`);
    }

    if (sessionData.check_type && Array.isArray(sessionData.check_typeList) && sessionData.check_typeList.length === 0) {
      const checkTypeStr = String(sessionData.check_type);
      if (checkTypeStr && checkTypeStr !== '' && checkTypeStr !== 'null' && checkTypeStr !== 'undefined') {
        sessionData.check_typeList = checkTypeStr.split(',').map((x: string) => String(x.trim())).filter((x: string) => x);
        console.log(`[檢視-Session強制轉換] "${checkTypeStr}" → [${sessionData.check_typeList.join(', ')}]`);
      }
    }

    if (Array.isArray(sessionData.check_typeList) && sessionData.check_typeList.length > 0) {
      sessionData.check_typeList = sessionData.check_typeList.map((x: any) => String(x));
    }

    // 將 ISO 日期字串轉為 Date 物件（避免日期欄位顯示時間戳）
    const sanitizedData = sanitizeDateFields(sessionData);
    this.dataForm.patchValue(sanitizedData, { emitEvent: false });

    if (sessionData.selectedBankInfo) {
      this.selectedBankInfo = sessionData.selectedBankInfo;
    }

    if (sessionData.locationInfo && Array.isArray(sessionData.locationInfo)) {
      this.locationData = sessionData.locationInfo;
    }

    queueMicrotask(() => {
      this.setFormControlsState();
      this.triggerAllDynamicValidators();
      // ✅ 使用 detectChanges 而不是 markForCheck，確保立即更新視圖
      this.cdr.detectChanges();
      console.log(`[檢視-最終表單值] check_typeList:`, this.dataForm.get('check_typeList')?.value);
    });
  }

  private async loadContractDetailAsync(talentId: string): Promise<void> {
    if (!talentId) {
      console.warn('    ⚠️ 沒有 talent_id，無法載入資料');
      return;
    }

    this.loading = true;

    try {
      const response = await firstValueFrom(
        this.tls13010Service.queryTLS13010Detail(talentId)
      );

      if (response.Status === '0000' && response.Data) {
        console.log('     API 回應成功');
        await this.patchFormWithDetailDataAsync(response.Data);
      } else {
        console.warn('    ⚠️ 查無詳細資料');
        this.messageService.warnBubble('查無詳細資料');
      }
    } catch (error) {
      console.error('    ❌ 載入詳細資料失敗:', error);
      this.messageService.errorBubble('載入詳細資料失敗');
      throw error;
    } finally {
      this.loading = false;
    }
  }

  private async patchFormWithDetailDataAsync(detailData: any): Promise<void> {
    console.log('    📝 開始填充表單資料');

    // ✅ 處理 check_type 轉換為 check_typeList（強化版）
    if (detailData.check_type && (!detailData.check_typeList || detailData.check_typeList.length === 0)) {
      const checkTypeStr = String(detailData.check_type);
      if (checkTypeStr && checkTypeStr !== '' && checkTypeStr !== 'null' && checkTypeStr !== 'undefined') {
        detailData.check_typeList = checkTypeStr.split(',').map((x: string) => x.trim()).filter((x: string) => x);
        console.log(`     check_type "${checkTypeStr}" 已轉換為 check_typeList:`, detailData.check_typeList);
      }
    }

    // ✅ 額外防護：如果轉換後仍然是空陣列，但 check_type 有值，再次強制轉換
    if (detailData.check_type && Array.isArray(detailData.check_typeList) && detailData.check_typeList.length === 0) {
      const checkTypeStr = String(detailData.check_type);
      if (checkTypeStr && checkTypeStr !== '' && checkTypeStr !== 'null' && checkTypeStr !== 'undefined') {
        detailData.check_typeList = checkTypeStr.split(',').map((x: string) => x.trim()).filter((x: string) => x);
        console.log(`     🔧 [patchForm] 強制轉換 check_type "${checkTypeStr}" 為 check_typeList:`, detailData.check_typeList);
      }
    }

    //  步驟 1: 解析日期字串為 Date 物件（參考 TLS12040）
    const dataWithDates = this.parseDateStringsToDates(detailData);

    //  步驟 2: 清理字串欄位
    const cleanedData = this.cleanStringFields(dataWithDates);

    //  步驟 3: 根據模式決定如何填充（參考 TLS12040）
    if (this.crudstatus === CRUDStatus.Read || this.isFormReadonly) {
      console.log('    🔒 Readonly 模式填充');
      console.log('     cleanedData.check_typeList:', cleanedData.check_typeList);
      console.log('     checkTypeOptions:', this.checkTypeOptions);
      // Readonly 模式：enable → 填充 → 重新建立陣列參照 → disable → 觸發變更檢測
      // 使用 emitEvent: false 避免 enable 觸發 valueChanges，防止驗證服務覆蓋 API 載入的值
      this.dataForm.enable({ emitEvent: false });
      this.dataForm.patchValue(cleanedData, { emitEvent: false });
      console.log('     填充後 check_typeList 值:', this.dataForm.get('check_typeList')?.value);
      // ✅ 關鍵修正：重新建立 checkTypeOptions 陣列參照，觸發 Angular 變更檢測（參考 TLS12040）
      this.checkTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.checkType];
      console.log('     ✅ 已重新建立 checkTypeOptions 陣列參照');
      this.dataForm.disable();
      // ✅ 觸發變更檢測，確保 multi-select 的 readonly 模式正確顯示
      this.cdr.detectChanges();
      console.log('     ✅ 已觸發變更檢測');
    } else {
      console.log('    ✏️ 一般模式填充');
      console.log('     cleanedData.check_typeList:', cleanedData.check_typeList);
      // 一般模式：直接填充
      this.dataForm.patchValue(cleanedData, { emitEvent: false });
      console.log('     填充後 check_typeList 值:', this.dataForm.get('check_typeList')?.value);
    }

    console.log('     表單資料填充完成');

    //  步驟 3.5: 載入位置資料（Locations）
    if (detailData.Locations && Array.isArray(detailData.Locations) && detailData.Locations.length > 0) {
      this.locationData = detailData.Locations.map((item: LocationItem) => ({
        ...item,
        _status: item._status || 'original',
        _isNew: false
      }));
      this.displayLocationData = this.getDisplayLocationData();
      console.log('     ✅ 已載入位置資料:', this.locationData.length, '筆');
    }

    //  步驟 4: 載入相關分類資料
    if (detailData.bus_type) {
      await this.ensureClassificationDataLoaded(detailData.bus_type);
    }

    //  步驟 5: 儲存到 workflow
    this.saveToWorkflow();
  }

  /**
   *  新增：解析日期字串為 Date 物件（參考 TLS12040）
   */
  private parseDateStringsToDates(data: any): any {
    if (!data) return data;

    const dateFields = [
      'tlt_bdate', 'tlt_edate',
      'tlt_contract_bdate', 'tlt_contract_edate',
      'feedback_date', 'due_date', 'contact_Date'
    ];

    const parsedData = { ...data };

    dateFields.forEach(field => {
      const dateString = parsedData[field];
      if (dateString && typeof dateString === 'string') {
        try {
          // 移除時間部分，只取日期
          const datePart = dateString.split(/[T\s]/)[0];
          const match = datePart.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
          if (match) {
            parsedData[field] = new Date(
              parseInt(match[1], 10),
              parseInt(match[2], 10) - 1,
              parseInt(match[3], 10)
            );
            console.log(`      📅 ${field}: "${dateString}" → Date`);
          }
        } catch (error) {
          console.error(`      ❌ ${field}: 日期解析失敗`, error);
        }
      }
    });

    return parsedData;
  }

  /**
   *  新增：清理字串欄位（去除空格）
   */
  private cleanStringFields(data: any): any {
    const safeTrim = (value: any): string => {
      if (value === null || value === undefined) return '';
      return String(value).trim();
    };

    return {
      // 基本資訊
      talent_id: data.talent_id || '',
      apply_no: data.apply_no || '',
      tlt_no: data.tlt_no || '',
      contract_subno: data.contract_subno || '',

      // 廠商資訊（清理空格）
      vendor_ven_no: safeTrim(data.ven_no || data.vendor_ven_no),
      ven_uniform: safeTrim(data.ven_uniform),
      ven_no: safeTrim(data.ven_no),
      VEN_Name: safeTrim(data.VEN_Name),
      VEN_Address: safeTrim(data.VEN_Address),
      tlt_name: safeTrim(data.tlt_name),

      // 下拉選單（清理空格）
      paper_type: safeTrim(data.paper_type),
      bus_type: safeTrim(data.bus_type),
      bus_class: safeTrim(data.bus_class),
      bus_sclass: safeTrim(data.bus_sclass),
      org_id: safeTrim(data.org_id),
      deco_type: safeTrim(data.deco_type),
      money_type: safeTrim(data.money_type),
      tlt_term_type: safeTrim(data.tlt_term_type),
      comm_comp_type: safeTrim(data.comm_comp_type),
      comm_yn: safeTrim(data.comm_yn),
      store_way: safeTrim(data.store_way),
      rece_yn: safeTrim(data.rece_yn),
      pos_yn: safeTrim(data.pos_yn),
      cash_yn: safeTrim(data.cash_yn),
      tlt_openflag: safeTrim(data.tlt_openflag),
      rent_ahead: safeTrim(data.rent_ahead),
      paytype: safeTrim(data.paytype),
      vip_yn: safeTrim(data.vip_yn),
      invoice_type: safeTrim(data.invoice_type),
      water_flag: safeTrim(data.water_flag),
      electric_flag: safeTrim(data.electric_flag),
      gas_flag: safeTrim(data.gas_flag),
      approve_status: safeTrim(data.approve_status),
      tlt_kind: safeTrim(data.tlt_kind),
      edc_yn: safeTrim(data.edc_yn),
      tlt_ctype_mtotal: safeTrim(data.tlt_ctype_mtotal),
      overall_status: safeTrim(data.overall_status),
      bank_id: safeTrim(data.bank_id),
      open_deposit: safeTrim(data.open_deposit),
      construct_deposit: safeTrim(data.construct_deposit),
      expiration_deposit: safeTrim(data.expiration_deposit),

      // 日期欄位（已在 parseDateStringsToDates 中處理為 Date 物件）
      tlt_bdate: data.tlt_bdate,
      tlt_edate: data.tlt_edate,
      tlt_contract_bdate: data.tlt_contract_bdate,
      tlt_contract_edate: data.tlt_contract_edate,
      feedback_date: data.feedback_date,
      due_date: data.due_date,
      contact_Date: data.contact_Date,

      // 其他字串欄位
      email: safeTrim(data.email),
      invoice_email: safeTrim(data.invoice_email),
      CHECK_TITLE: safeTrim(data.CHECK_TITLE),
      store_tel: safeTrim(data.store_tel),
      vendor_acct_name: safeTrim(data.vendor_acct_name),
      vendor_acct_no: safeTrim(data.vendor_acct_no),
      contact_tel: safeTrim(data.contact_tel),
      contact_fax: safeTrim(data.contact_fax),
      contact_addr: safeTrim(data.contact_addr),
      tlt_remark: safeTrim(data.tlt_remark),
      ticket_remarks: safeTrim(data.ticket_remarks),
      contact_USR_No: safeTrim(data.contact_USR_No),
      contact_USR_Name: safeTrim(data.contact_USR_Name),

      // 數字欄位
      rent_period: data.rent_period || '',
      base_rent: data.base_rent || '',
      deposit: data.deposit || '',
      total_amt: data.total_amt || '',
      total_amt_vendor: data.total_amt_vendor || '',
      open_fees: data.open_fees || '',
      construct_fees: data.construct_fees || '',
      expiration_fees: data.expiration_fees || '',
      check_day: data.check_day || '',
      credit_card: data.credit_card || '',
      total_amt_unit: data.total_amt_unit || '',
      total_amt_vendor_unit: data.total_amt_vendor_unit || '',

      // 參加資訊 (checkbox 欄位)
      cap_saletype1: data.cap_saletype1 || 'N',
      cap_saletype2: data.cap_saletype2 || 'N',
      cap_saletype3: data.cap_saletype3 || 'N',
      cap_saletype4: data.cap_saletype4 || 'N',
      cap_saletype5: data.cap_saletype5 || 'N',

      // 其他欄位
      check_typeList: data.check_type && typeof data.check_type === 'string'
        ? data.check_type.split(',').map((s: string) => s.trim()).filter((s: string) => s)
        : (Array.isArray(data.check_typeList) ? data.check_typeList : []),
      check_type: data.check_type || '',
    };
  }


  private performInitialValidation(): void {
    console.log('📝 步驟 9: 執行初始驗證');

    // 檢視模式不需要執行驗證（避免驗證服務的商業規則覆蓋 API 載入的實際值）
    if (this.crudstatus === CRUDStatus.Read || this.isFormReadonly) {
      console.log('   檢視模式：跳過初始驗證');
      return;
    }

    this.validationService.updateAllValidators(this.dataForm);
    this.validateWorkflowData();

    console.log('   初始驗證完成');
  }

  private updateUI(): void {
    console.log('📝 步驟 10: 更新 UI');

    this.updateDisplayLocationData();
    this.updateSelectorPanelOptions();

    console.log('   UI 更新完成');
  }

  /**
   *  確保分類資料已載入
   */
  private async ensureClassificationDataLoaded(busType: string): Promise<void> {
    try {
      await firstValueFrom(
        this.tls13010DropdownService.loadBusClassOptions(busType)
      );

      const busClass = this.dataForm.get('bus_class')?.value;
      if (busClass) {
        await firstValueFrom(
          this.tls13010DropdownService.loadBusSClassOptions(busType, busClass)
        );
      }

      console.log('     分類資料載入完成');
    } catch (error) {
      console.error('    ❌ 分類資料載入失敗:', error);
    }
  }

  /**
  * 載入合約詳細資料
  */
  loadContractDetail(talentId: string | number): void {
    console.log('🔍 開始載入合約詳細資料，talent_id:', talentId);

    if (!talentId) {
      console.warn('⚠️ 沒有提供 talent_id，無法載入詳細資料');
      return;
    }

    this.loading = true;

    // 確保 talentId 是字串格式
    const talentIdParam = typeof talentId === 'string' ? talentId : String(talentId);

    this.tls13010Service.queryTLS13010Detail(talentIdParam).subscribe({
      next: (response: any) => {
        console.log('📦 API 回應:', response);

        // 🔥 Data 是物件，不是陣列
        if (response.Status === '0000' && response.Data && typeof response.Data === 'object') {
          const detailData = response.Data;
          console.log(' 詳細資料載入成功:', detailData);

          // 將 detail 資料填充到表單中
          this.patchFormWithDetailData(detailData);
        } else {
          console.warn('⚠️ 查無詳細資料');
          this.messageService.warnBubble('查無詳細資料');
        }
      },
      error: (err: any) => {
        console.error('❌ 載入詳細資料失敗:', err);
        this.messageService.errorBubble('載入詳細資料失敗');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  /**
 * 將 detail 資料填充到表單
 */
  private patchFormWithDetailData(detailData: any): void {
    console.log('📝 開始填充表單資料');
    let checkTypeList: string[] = [];
    if (detailData.check_type && typeof detailData.check_type === 'string') {
      // 從 check_type 字串轉換為陣列
      checkTypeList = detailData.check_type.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      console.log(' API check_type 轉換為 check_typeList:', checkTypeList);
    } else if (Array.isArray(detailData.check_typeList) && detailData.check_typeList.length > 0) {
      // 已經是陣列，直接使用
      checkTypeList = detailData.check_typeList;
      console.log(' 使用現有的 check_typeList:', checkTypeList);
    }

    // 同步更新 check_type（用於儲存）
    const checkType = checkTypeList.length > 0 ? checkTypeList.join(',') : '';

    // 🔥 將日期字串轉換為符合表單格式的字串 (yy/mm/dd)
    const formatDate = (dateStr: string | null | undefined): string => {
      if (!dateStr) return '';

      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';

        // 轉換為 yy/mm/dd 格式的字串
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}/${month}/${day}`;
      } catch {
        return '';
      }
    };

    // 將 API 回傳的資料對應到表單
    this.dataForm.patchValue({
      talent_id: detailData.talent_id || '',
      apply_no: detailData.apply_no || '',
      tlt_no: detailData.tlt_no || '',
      tlt_name: detailData.tlt_name || '',
      vendor_ven_no: detailData.ven_no || '',
      ven_uniform: detailData.ven_uniform || '',
      ven_no: detailData.ven_no || '',
      VEN_Name: detailData.VEN_Name || '',
      paper_type: detailData.paper_type || '',
      contract_subno: detailData.contract_subno || '',

      // 🔥 日期欄位轉換為 yy/mm/dd 格式字串
      feedback_date: formatDate(detailData.feedback_date),
      due_date: formatDate(detailData.due_date),
      tlt_bdate: formatDate(detailData.tlt_bdate),
      tlt_edate: formatDate(detailData.tlt_edate),
      contact_Date: formatDate(detailData.contact_Date),
      tlt_contract_bdate: formatDate(detailData.tlt_contract_bdate),
      tlt_contract_edate: formatDate(detailData.tlt_contract_edate),
      cap_saletype1: detailData.cap_saletype1 || 'N',
      cap_saletype2: detailData.cap_saletype2 || 'N',
      cap_saletype3: detailData.cap_saletype3 || 'N',
      cap_saletype4: detailData.cap_saletype4 || 'N',
      cap_saletype5: detailData.cap_saletype5 || 'N',
      bus_type: detailData.bus_type || '',
      bus_class: detailData.bus_class || '',
      bus_sclass: detailData.bus_sclass || '',
      deco_type: detailData.deco_type || '',
      money_type: detailData.money_type || '',
      check_typeList: checkTypeList,
      check_type: checkType,
      tlt_term_type: detailData.tlt_term_type?.trim() || '',
      comm_comp_type: detailData.comm_comp_type || '',
      comm_yn: detailData.comm_yn || '',
      store_way: detailData.store_way || '',
      rece_yn: detailData.rece_yn || '',
      pos_yn: detailData.pos_yn || '',
      cash_yn: detailData.cash_yn || '',
      tlt_openflag: detailData.tlt_openflag || '',
      org_id: detailData.org_id || '',
      rent_ahead: detailData.rent_ahead || '',
      rent_period: detailData.rent_period || '',
      base_rent: detailData.base_rent || '',
      deposit: detailData.deposit || '',
      total_amt: detailData.total_amt || '',
      total_amt_vendor: detailData.total_amt_vendor || '',
      open_deposit: detailData.open_deposit || '',
      open_fees: detailData.open_fees || '',
      construct_deposit: detailData.construct_deposit || '',
      construct_fees: detailData.construct_fees || '',
      expiration_deposit: detailData.expiration_deposit || '',
      expiration_fees: detailData.expiration_fees || '',
      check_day: detailData.check_day || '',
      tlt_kind: detailData.tlt_kind || '',
      edc_yn: detailData.edc_yn || '',
      tlt_ctype_mtotal: detailData.tlt_ctype_mtotal || '',
      overall_status: detailData.overall_status || '',
      paytype: detailData.paytype || '',
      vip_yn: detailData.vip_yn || '',
      credit_card: detailData.credit_card || '',
      invoice_type: detailData.invoice_type || '',
      water_flag: detailData.water_flag || '',
      electric_flag: detailData.electric_flag || '',
      gas_flag: detailData.gas_flag || '',
      email: detailData.email || '',
      invoice_email: detailData.invoice_email || '',
      CHECK_TITLE: detailData.CHECK_TITLE || '',
      store_tel: detailData.store_tel || '',
      bank_id: detailData.bank_id || '',
      vendor_acct_name: detailData.vendor_acct_name || '',
      vendor_acct_no: detailData.vendor_acct_no || '',
      contact_tel: detailData.contact_tel || '',
      contact_fax: detailData.contact_fax || '',
      contact_addr: detailData.contact_addr || '',
      tlt_remark: detailData.tlt_remark || '',
      ticket_remarks: detailData.ticket_remarks || '',
      contact_USR_No: detailData.contact_USR_No || '',
      contact_USR_Name: detailData.contact_USR_Name || '',
      total_amt_unit: detailData.total_amt_unit || '',
      total_amt_vendor_unit: detailData.total_amt_vendor_unit || '',
      VEN_Address: detailData.VEN_Address || '',
      approve_status: detailData.approve_status || '',
    }, { emitEvent: false });

    console.log(' 表單資料填充完成');

    // ✅ 使用 queueMicrotask 替代 setTimeout
    queueMicrotask(() => {
      this.saveToWorkflow();
    });
  }

  private setupListeners(): void {
    console.log('📝 步驟 6: 設定監聽器');

    this.setupAutoSave();
    this.setupBusTypeListener();
    this.setupBusClassListener(); // 新增：監聽中分類變更
    // this.setupVendorUniformListener(); // ✅ 已改用 HTML 的 (optionSelected)="onVendorOptionSelected($event)" 事件
    this.setupDateAutoFillListeners();

    console.log('   監聽器設定完成');
  }

  // ✅ 已移除 setupVendorUniformListener(),改用 HTML 的 (optionSelected)="onVendorOptionSelected($event)" 事件

  /**
   * 設定日期自動填充監聽器
   * 1. 新建模式：回函日期、洽談日期預帶今天，回函截止日預帶今天+15天
   * 2. 回函日期變更時，自動更新回函截止日（+15天）
   * 3. 契約起始日/截止日輸入完，營運起始日/截止日預帶相同日期
   */
  private setupDateAutoFillListeners(): void {
    // 1. 監聽新建模式：回函日期、洽談日期預帶今天，回函截止日預帶今天+15天
    if (this.contractFlowService.isNewContractMode()) {
      const today = new Date();
      const todayStr = this.formatDate(today);

      // 預設回函日期為今天
      if (!this.dataForm.get('feedback_date')?.value) {
        this.dataForm.patchValue({ feedback_date: todayStr }, { emitEvent: false });
      }

      // 預設回函截止日為今天+15天（重新創建 Date 物件避免污染）
      if (!this.dataForm.get('due_date')?.value) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15);
        this.dataForm.patchValue({ due_date: this.formatDate(dueDate) }, { emitEvent: false });
      }

      // ✅ 新增：預設洽談日期為今天
      if (!this.dataForm.get('contact_Date')?.value) {
        this.dataForm.patchValue({ contact_Date: todayStr }, { emitEvent: false });
      }
    }

    // 2. 監聽回函日期變更，自動更新回函截止日（+15天）
    const feedbackDateSub = this.dataForm.get('feedback_date')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(feedbackDate => {
        if (feedbackDate && this.crudstatus !== CRUDStatus.Read) {
          const date = new Date(feedbackDate);
          if (!isNaN(date.getTime())) {
            date.setDate(date.getDate() + 15);
            this.dataForm.patchValue({ due_date: this.formatDate(date) }, { emitEvent: false });
          }
        }
      });

    // 3. 監聽契約起始日變更，自動更新營運起始日
    const contractStartSub = this.dataForm.get('tlt_bdate')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(contractStart => {
        if (contractStart && this.crudstatus !== CRUDStatus.Read) {
          // 每次契約起始日變更都自動帶入營運起始日
          this.dataForm.patchValue({ tlt_contract_bdate: contractStart }, { emitEvent: false });
        }
      });

    // 4. 監聽契約截止日變更，自動更新營運截止日
    const contractEndSub = this.dataForm.get('tlt_edate')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(contractEnd => {
        if (contractEnd && this.crudstatus !== CRUDStatus.Read) {
          // 每次契約截止日變更都自動帶入營運截止日
          this.dataForm.patchValue({ tlt_contract_edate: contractEnd }, { emitEvent: false });
        }
      });

    // 加入訂閱清單
    if (feedbackDateSub) this.subscriptions.push(feedbackDateSub);
    if (contractStartSub) this.subscriptions.push(contractStartSub);
    if (contractEndSub) this.subscriptions.push(contractEndSub);
  }

  /**
   * 格式化日期為 YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 統一設定表單欄位的 readonly 狀態
   */
  private setFormControlsState(): void {
    this.formStateService.setFormControlsState(
      this.dataForm,
      this.crudstatus === CRUDStatus.Read,
      this.contractFlowService.isNewContractMode()
    );
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
    const subscription = this.dataForm.get('bus_type')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        switchMap(busType => {
          if (!busType) return of([]);
          return this.tls13010DropdownService.loadBusClassOptions(busType);
        })
      )
      .subscribe({
        next: (options) => {
          const currentBusClass = this.dataForm.get('bus_class')?.value;
          const validBusClass = options.find((opt: any) => opt.value === currentBusClass);

          if (currentBusClass && !validBusClass) {
            this.dataForm.patchValue({
              bus_class: '',
              bus_sclass: ''
            }, { emitEvent: false });
          }
        },
        error: (err) => console.error('❌ 載入中分類失敗:', err)
      });

    if (subscription) {
      this.subscriptions.push(subscription);
    }
  }

  /**
   * 監聽中分類變更，自動載入小分類選項
   */
  private setupBusClassListener(): void {
    const subscription = this.dataForm.get('bus_class')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        switchMap(busClass => {
          const busType = this.dataForm.get('bus_type')?.value;

          // 清空小分類選項
          this.tls13010DropdownService.clearBusSClassOptions();

          // 如果中分類或大分類為空，返回空陣列
          if (!busClass || !busType) {
            return of([]);
          }

          // 載入小分類選項
          console.log('🔄 載入小分類選項 - 大分類:', busType, '中分類:', busClass);
          return this.tls13010DropdownService.loadBusSClassOptions(busType, busClass);
        })
      )
      .subscribe({
        next: (options: DropdownOption[]) => {
          console.log('✅ 小分類選項已載入:', options.length, '個');

          const currentBusSClass = this.dataForm.get('bus_sclass')?.value;
          const validBusSClass = options.find((opt: DropdownOption) => opt.value === currentBusSClass);

          // 如果當前小分類值無效，清空
          if (currentBusSClass && !validBusSClass) {
            console.warn('⚠️ 當前小分類無效，已清空');
            this.dataForm.patchValue({
              bus_sclass: ''
            }, { emitEvent: false });
          }
        },
        error: (err) => {
          console.error('❌ 載入小分類失敗:', err);
          this.messageService.warnBubble('載入小分類選項失敗');
        }
      });

    if (subscription) {
      this.subscriptions.push(subscription);
    }
  }

  // ==========  表單操作方法 ==========
  private saveToWorkflow(): void {
    const currentTotalSpace = this.getTotaltlt_space();
    const formData = this.dataForm.getRawValue();

    const checkTypeList = formData.check_typeList || [];
    const checkTypeString = Array.isArray(checkTypeList) ? checkTypeList.join(';') : '';
    // 型別轉換輔助函數
    const convertToString = (value: any): string | undefined => {
      if (value === null || value === undefined) return undefined;
      return String(value);
    };

    // 修正：統一的 Y/N 字串轉換方法
    const convertBooleanToYN = (value: any): string => {
      if (value === true || value === 'true' || value === 'Y') return 'Y';
      if (value === false || value === 'false' || value === 'N') return 'N';
      return String(value || 'N'); // 預設為 N
    };

    // 準備符合 ContractInfo 介面的資料
    const contractInfo: ContractInfo = {
      id: formData.talent_id || '',
      talent_id: formData.talent_id || '',
      apply_no: formData.apply_no || '',
      tlt_name: formData.tlt_name || '',
      VEN_Name: formData.VEN_Name || '',
      contract_subno: formData.contract_subno || '',
      tlt_no: formData.tlt_no || '',
      approve_status: formData.approve_status || '',
      ven_no: formData.vendor_ven_no || '',  // "00000000-2" (完整編號)
      contract_no: formData.contract_no || '',
      // 日期欄位
      tlt_bdate: formData.tlt_bdate || '',
      tlt_edate: formData.tlt_edate || '',
      tlt_contract_bdate: formData.tlt_contract_bdate || '',
      tlt_contract_edate: formData.tlt_contract_edate || '',
      feedback_date: formData.feedback_date || '',
      due_date: formData.due_date || '',
      contact_Date: formData.contact_Date || '',
      vendor_ven_no: formData.vendor_ven_no || '',
      // 業務欄位
      ven_uniform: formData.ven_uniform || formData.vendor_no || '',
      paper_type: formData.paper_type || '',
      bus_type: formData.bus_type || '',
      bus_class: formData.bus_class || '',
      bus_sclass: formData.bus_sclass || '',
      tlt_term_type: formData.tlt_term_type || '',
      comm_comp_type: formData.comm_comp_type || '',
      org_id: formData.org_id || '',
      contact_USR_No: formData.contact_USR_No || '',
      contact_USR_Name: formData.contact_USR_Name || '',

      //數值欄位轉字串
      base_rent: convertToString(formData.base_rent),
      deposit: convertToString(formData.deposit),
      credit_card: convertToString(formData.credit_card),
      rent_period: convertToString(formData.rent_period),
      open_fees: convertToString(formData.open_fees),
      total_amt: convertToString(formData.total_amt),
      total_amt_vendor: convertToString(formData.total_amt_vendor),
      construct_fees: convertToString(formData.construct_fees),
      check_day: convertToString(formData.check_day),
      construct_deposit: formData.construct_deposit || '',
      expiration_fees: convertToString(formData.expiration_fees),
      // 其他字串欄位
      deco_type: formData.deco_type || '',
      money_type: formData.money_type || '',
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
      // 聯絡資訊
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
      VEN_Address: formData.VEN_Address || '',
      tlt_remark: formData.tlt_remark || '',
      ticket_remarks: formData.ticket_remarks || '',
      tlt_kind: formData.tlt_kind || '',
      tlt_ctype_mtotal: formData.tlt_ctype_mtotal || '',
      overall_status: formData.overall_status || '',
      rent_ahead: formData.rent_ahead || '',
      open_deposit: formData.open_deposit || '',
      expiration_deposit: formData.expiration_deposit || '',
      cap_saletype1: convertBooleanToYN(formData.cap_saletype1),
      cap_saletype2: convertBooleanToYN(formData.cap_saletype2),
      cap_saletype3: convertBooleanToYN(formData.cap_saletype3),
      cap_saletype4: convertBooleanToYN(formData.cap_saletype4),
      cap_saletype5: convertBooleanToYN(formData.cap_saletype5),

      water_flag: formData.water_flag || '',
      electric_flag: formData.electric_flag || '',
      gas_flag: formData.gas_flag || '',
      total_amt_unit: formData.total_amt_unit || '',
      total_amt_vendor_unit: formData.total_amt_vendor_unit || '',
      paymentMethods: formData.paymentMethods || [],
      check_typeList: formData.check_typeList || [],
      check_type: checkTypeString,
      //特殊欄位
      totalLocationSpace: currentTotalSpace, // 計算總營業坪數
      locationInfo: this.prepareLocationDataForSubmit(), // 新增總營業坪數
    };
    this.contractFlowService.saveStep1Data(contractInfo);
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

  private prepareLocationDataForSubmit(): LocationItem[] {
    return this.locationManagementService.prepareLocationDataForSubmit(this.locationData);
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
        // 過濾空 key 和無效 key
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
    this.checkRequiredFieldsBeforeSubmit();
  }

  onSubmitNext(): void {
    // 檢視模式：直接導航，不驗證
    if (this.crudstatus === CRUDStatus.Read) {
      this.router.navigate(['account/tls/tls13010next1']);
      return;
    }

    // 使用統一的必填檢查方法
    if (!this.checkRequiredFieldsBeforeSubmit()) {
      this.markFormGroupTouched(this.dataForm);
      return;
    }

    // 所有驗證通過，儲存並導航
    this.saveToWorkflow();
    this.router.navigate(['account/tls/tls13010next1']);
    // this.messageService.successBubble('Step 1 完成，進入下一步');
  }

  override onCancel(): void {
    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };
    if (this.crudstatus === CRUDStatus.Read) {
      this.contractFlowService.clearViewMode();
      this.contractFlowService.clearTempData();
      this.router.navigate(['account/tls/tls13010'], extras);
      this.messageService.infoBubble('已退出檢視模式');
      return;
    }

    // 編輯模式：使用父類邏輯或自訂
    if (this.dataForm.dirty) {
      // if (confirm('是否要儲存目前的編輯內容？')) {
      this.saveToWorkflow();
      // }
    }
    this.router.navigate(['account/tls/tls13010'], extras);
  }

  onClearForm(): void {
    if (confirm('確定要清除所有輸入的資料嗎?此操作無法復原。')) {
      // 使用共用 service 重設表單
      this.tlsBaseService.resetToDefaults(this.dataForm, 'TLS13010', ['apply_no', 'tlt_no']);

      this.locationData = []; // 清除位置資料
      this.contractFlowService.clearTempData();
      this.messageService.infoBubble('表單已清除');
    }
  }

  // ==========  位置表格事件處理 ==========

  onAddLocationItem(): void {
    if (this.crudstatus === CRUDStatus.Read) return;

    this.updateDisplayLocationData();

    // 檢查是否有空白行
    if (this.locationManagementService.hasEmptyNewRow(this.locationData)) {
      this.messageService.warnBubble('請先完成目前新增的櫃位資料後再新增下一筆');
      return;
    }

    // 建立新項目
    const newLocationItem = this.locationManagementService.createEmptyLocationItem();

    this.locationData = [...this.locationData, newLocationItem];
    this.saveToWorkflow();
    this.messageService.infoBubble('已新增位置項目,請選擇位置編號');
  }

  /**
 * 🔥 櫃位欄位變更時的處理
 */
  onLocationFieldChange(event: { fieldName: string, newValue: any, rowData: any }): void {
    const { fieldName, newValue, rowData } = event;

    console.log('🔄 櫃位欄位變更:', {
      欄位: fieldName,
      新值: newValue,
      行ID: rowData.id
    });

    // 🚨 特別處理櫃位編號的重複檢查
    if (fieldName === 'location_no' && newValue) {
      const isDuplicate = this.validateDuplicateLocationNo(newValue, rowData);

      if (isDuplicate) {
        // 🔥 發現重複,立即移除這筆資料
        console.log('❌ 發現重複櫃位,準備移除');

        // ✅ 使用 queueMicrotask 替代 setTimeout,確保訊息顯示後再移除
        queueMicrotask(() => {
          this.removeLocationItem(String(rowData.id));
        });

        return; // 不繼續處理
      }
    }

    // 🔄 如果是新增行且有填值,移除空白標記
    if (rowData._isNew && newValue) {
      rowData._isEmpty = false;
      console.log('移除空白標記');
    }

    // 🔄 任何欄位變更都自動儲存
    this.saveToWorkflow();
  }

  /**
   * 驗證櫃位編號是否重複(即時驗證)
   */
  private validateDuplicateLocationNo(locationNo: string, currentRow: any): boolean {
    const isDuplicate = this.locationManagementService.validateDuplicateLocationNo(
      locationNo,
      currentRow.id,
      this.locationData
    );

    if (isDuplicate) {
      currentRow._hasDuplicateError = true;
      currentRow._hasError = true;
      currentRow._errorMessage = `位置編號「${locationNo}」已存在`;
      this.messageService.warnBubble(`位置編號「${locationNo}」已存在, 已自動移除重複項`);
      return true;
    } else {
      this.locationManagementService.clearLocationError(currentRow);
      return false;
    }
  }

  /**
   * 🗑️ 焦點失去時自動清理空白新增行
   */
  onLocationTableCancel(rowData: LocationItem): void {
    console.log('⬅️ 取消編輯櫃位地點:', rowData.location_no);

    // 🔥 檢查是否為空白新增行
    const isEmptyNewRow = this.isEmptyLocationRow(rowData);

    if (isEmptyNewRow) {
      console.log('🗑️ 偵測到空白新增行, 自動移除');

      const index = this.locationData.findIndex(item => item.id === rowData.id);
      if (index > -1) {
        this.locationData.splice(index, 1);
        this.locationData = [...this.locationData];
        console.log(`已從索引 ${index} 移除空白櫃位資料`);
      }

      this.messageService.infoBubble('已取消新增櫃位');
      return;
    }

    // 📋 清除錯誤標記
    this.locationManagementService.clearLocationError(rowData);


    console.log('取消編輯完成(非空白行)');
  }

  /**
   * 判斷是否為空白櫃位新增行
   */
  private isEmptyLocationRow(locationData: LocationItem): boolean {
    return this.locationManagementService.isEmptyLocationRow(locationData);
  }

  /**
   * 新增：檢查是否為新增模式
   */
  isNewContractMode(): boolean {
    return this.contractFlowService.isNewContractMode();
  }

  // 位置表格儲存事件
  onLocationTableSave(event: { oldData: LocationItem; newData: LocationItem }): void {
    const { oldData, newData } = event;

    console.log('💾 位置表格儲存事件:', {
      ID: newData.id,
      位置編號: `${oldData.location_no} → ${newData.location_no}`,
      原狀態: oldData._status,
      新狀態: newData._status
    });

    // 重點：檢查位置編號是否重複
    if (newData.location_no && newData.location_no.trim() !== '') {
      const isDuplicate = this.checkLocationDuplicate(newData);

      if (isDuplicate) {
        console.log('❌ 發現重複位置，準備移除');

        // 顯示錯誤訊息
        this.messageService.errorBubble(`位置編號 ${newData.location_no} 重複！`);

        // 直接從陣列中移除這筆資料
        this.removeLocationItem(String(newData.id));

        return; // 不繼續後續處理
      }
    }

    // 沒有重複，正常處理儲存邏輯
    this.updateDisplayLocationData();

    // 詳細的狀態判斷邏輯
    if (newData._status === 'new' || newData._isNew) {
      newData._status = 'new';
      console.log('保持新增狀態');
    } else if (this.hasLocationDataChanged(oldData, newData)) {
      newData._status = 'modified';
      console.log('📝 設為修改狀態');
    } else {
      newData._status = 'original';
      console.log('📄 保持原始狀態');
    }

    // 找到對應項目並更新
    const index = this.locationData.findIndex(item => item.id === newData.id);
    if (index > -1) {
      console.log(`🎯 找到對應項目，索引: ${index}`);
      this.locationData[index] = { ...newData };
      this.locationData = [...this.locationData];
    } else {
      console.error(`❌ 找不到對應項目: ID=${newData.id}`);
    }
    const newTotalSpace = this.getTotaltlt_space();
    console.log('📊 位置異動後總坪數:', newTotalSpace);
    this.saveToWorkflow();
    this.messageService.successBubble('位置資料已儲存');

    console.log('💾 儲存後狀態:', {
      總數: this.locationData.length,
      可顯示: this.getDisplayLocationData().length
    });
  }

  private updateTotalLocationSpace(): void {
    const totalSpace = this.getTotaltlt_space();

    // 立即更新到工作流程
    const currentStep1Data = this.contractFlowService.getStep1Data();
    if (currentStep1Data) {
      currentStep1Data.totalLocationSpace = totalSpace;
      this.contractFlowService.saveStep1Data(currentStep1Data);
    }

    console.log('🔄 總坪數已更新:', totalSpace);
  }

  //檢查重複
  private checkLocationDuplicate(newData: LocationItem): boolean {
    return this.locationManagementService.checkLocationDuplicate(newData, this.locationData);
  }


  // 新增：移除位置項目
  private removeLocationItem(itemId: string): void {
    console.log('🗑️ 開始移除位置項目:', itemId);

    this.locationData = this.locationManagementService.removeLocationItem(itemId, this.locationData);

    this.updateDisplayLocationData();
    this.saveToWorkflow();

    console.log(' 位置項目移除完成');
  }

  private hasLocationDataChanged(oldData: LocationItem, newData: LocationItem): boolean {
    return this.locationManagementService.hasLocationDataChanged(oldData, newData);
  }

  onBatchDeleteLocation(selectedItems: LocationItem[]): void {
    if (this.crudstatus === CRUDStatus.Read) return;

    const result = this.locationManagementService.processBatchDelete(
      selectedItems,
      this.locationData
    );

    if (result.deletedCount === 0) {
      this.messageService.warnBubble(result.message);
      return;
    }

    // 更新資料
    this.locationData = result.updatedData;
    this.displayLocationData = this.getDisplayLocationData();
    this.updateTotalLocationSpace();
    this.saveToWorkflow();

    this.messageService.successBubble(result.message);
  }

  // 位置表格編輯事件
  onLocationTableEdit(rowData: LocationItem): void {
    console.log('開始編輯位置資料:', rowData);
  }

  // 處理下拉選單變更（位置編號選擇時自動帶入）
  onLocationDropdownChange(event: {
    rowData: LocationItem;
    field: string;
    newValue: string;
    oldValue: string;
    selectedOption?: any;
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
      // 🔥 關鍵:先檢查是否重複(在更新資料之前)
      const isDuplicate = this.isLocationNoDuplicate(newValue, String(rowData.id));

      if (isDuplicate) {
        console.log('❌ 發現重複位置,阻止選擇');

        // 🔥 重點1:立即阻止並清空
        rowData.location_no = '';

        // 🔥 重點2:如果是新增的空行,直接移除
        if (rowData._isNew && !rowData.location_no) {
          console.log('🗑️ 移除重複的新增空行');
          this.removeLocationItem(String(rowData.id));
        }

        // 顯示錯誤訊息
        this.messageService.errorBubble(`位置編號 ${newValue} 已存在!`);

        return; // ❌ 中斷,不繼續處理
      }

      // 沒有重複,正常處理
      if (selectedOption) {
        console.log('📋 使用 selector-panel 提供的完整資料:', selectedOption);
        this.handleLocationSelectionFromSelectorPanel(rowData, selectedOption);
      }

      // 移除空資料標記
      delete rowData._isEmpty;
      delete rowData._isNew;

      // 更新狀態
      if (rowData._status === 'new') {
        // 保持 new 狀態
      } else if (!rowData._status) {
        rowData._status = 'modified';
      }
    }

    this.saveToWorkflow();
  }

  /**
   * 🔍 檢查位置編號是否重複
   */
  private isLocationNoDuplicate(locationNo: string, currentId: string): boolean {
    return this.locationManagementService.isLocationNoDuplicate(
      locationNo,
      currentId,
      this.locationData
    );
  }

  // 專門處理來自 selector-panel 的選擇
  private handleLocationSelectionFromSelectorPanel(rowData: LocationItem, selectedOption: any): void {
    const targetIndex = this.locationData.findIndex(item => item.id === rowData.id);

    if (targetIndex === -1) {
      console.error('❌ 找不到對應項目:', rowData.id);
      return;
    }

    // 使用 service 處理選擇的資料
    const locationData = this.locationManagementService.handleLocationSelectionFromSelectorPanel(selectedOption);

    // 更新資料
    const currentStatus = this.locationData[targetIndex]._status;
    const newStatus = currentStatus === 'new' ? 'new' : 'modified';

    this.locationData[targetIndex] = {
      ...this.locationData[targetIndex],
      ...locationData,
      _status: newStatus
    };

    // 同步更新 rowData(讓表格立即顯示)
    Object.assign(rowData, this.locationData[targetIndex]);

    // 觸發變更檢測
    this.locationData = [...this.locationData];
    this.updateDisplayLocationData();
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
    return this.locationManagementService.calculateTotalSpace(this.locationData);
  }

  // 取得位置設定狀態
  getLocationSetupStatus(): { text: string; class: string } {
    return this.locationManagementService.getLocationSetupStatus(this.locationData);
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

  hasFieldError(fieldName: string): boolean {
    const field = this.dataForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  //新增取得可顯示位置資料的方法
  getDisplayLocationData(): LocationItem[] {
    return this.locationManagementService.getDisplayLocationData(this.locationData);
  }

  private validateWorkflowData(): void {
    this.dataLoaderService.validateWorkflowData();
  }

  // 更新顯示資料
  private updateDisplayLocationData(): void {
    this.displayLocationData = this.locationManagementService.getDisplayLocationData(this.locationData);
  }

  onCommissionTypeChange(newValue: string): void {
    this.commissionTypeChangeService.handleCommissionTypeChange(
      newValue,
      this.dataForm,
      this.tltTermTypeOptions,
      this.contractFlowService.isNewContractMode(),
      () => this.saveToWorkflow()
    );
  }

  /**
  *  檢查抽成別是否變更(用於 UI 顯示警告)
  */
  hasCommissionTypeChanged(): boolean {
    return this.commissionTypeChangeService.hasCommissionTypeChanged(
      this.dataForm,
      this.contractFlowService.isNewContractMode()
    );
  }

  private async handleRouterState(): Promise<void> {
    const success = await this.dataLoaderService.handleRouterState(this);

    if (!success) {
      this.handleInitializationFailure();
    }
  }

  /**
   * 新增：設定檢視模式 UI
   */
  private setupViewModeUI(): void {
    console.log('🎨 設定檢視模式 UI 監聽');

    // 先檢查當前狀態
    const currentViewMode = this.contractFlowService.isViewMode();
    console.log('📋 當前檢視模式狀態:', currentViewMode);

    // 如果已經是檢視模式,立即設定
    if (currentViewMode) {
      this.crudstatus = CRUDStatus.Read;
      this.handleViewModeChange(true);
    }

    // 訂閱後續變更
    const viewModeSubscription = this.contractFlowService.isViewMode$.subscribe(isViewMode => {
      console.log('🔍 檢視模式變更:', isViewMode);
      this.crudstatus = isViewMode ? CRUDStatus.Read : CRUDStatus.Edit;
      this.handleViewModeChange(isViewMode);
    });
    this.subscriptions.push(viewModeSubscription);
  }

  private handleViewModeChange(isViewMode: boolean): void {
    this.formTitle = this.formStateService.handleViewModeChange(
      isViewMode,
      this.dataForm,
      this.contractFlowService.isNewContractMode()
    );
  }

  /**
   * 新增：處理初始化失敗
   */
  private handleInitializationFailure(): void {
    this.messageService.errorBubble('載入資料失敗，請重新選擇要檢視的項目');
    this.router.navigate(['account/tls/tls13010'], {
      state: { fromRoute: this.router.url }
    });
  }

  /**
 * 取得公司登記地址
 */
  getCompanyAddress(): string {
    const address = this.dataForm.get('VEN_Address')?.value;
    const trimmedAddress = address?.trim() || '';
    return trimmedAddress;
  }

  /**
   * 複製公司登記地址到郵寄地址
   */
  copyCompanyAddressToContact(): void {
    const companyAddress = this.getCompanyAddress();

    if (!companyAddress) {
      this.messageService.warnBubble('公司登記地址為空，無法複製');
      return;
    }

    // 檢查是否為檢視模式
    if (this.crudstatus === CRUDStatus.Read) {
      this.messageService.warnBubble('檢視模式下無法修改資料');
      return;
    }

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
   * 檢查按鈕是否可用
   */
  canCopyAddress(): boolean {
    // 只要有公司登記地址且不是檢視模式就可以複製
    const hasAddress = !!this.getCompanyAddress();
    const canEdit = this.crudstatus !== CRUDStatus.Read;

    // console.log('🔍 檢查複製按鈕狀態:', {
    //   hasAddress,
    //   canEdit,
    //   isViewMode: this.isViewMode,
    //   address: this.getCompanyAddress()
    // });

    return hasAddress && canEdit;
  }

  searchLocationOptions(searchParams: any): Observable<any[]> {
    console.log('🔍 CRU 收到搜尋參數:', searchParams);

    // 轉換 SortBy 的欄位名稱
    if (searchParams.SortBy && Array.isArray(searchParams.SortBy)) {
      searchParams.SortBy = searchParams.SortBy.map((sort: any) => ({
        field: sort.field === 'value' ? 'location_no' : sort.field,  // 轉換欄位名
        order: sort.order  // 保持原值,讓用戶可以切換排序順序
      }));
    }

    console.log('🔄 轉換後參數:', searchParams);

    return this.locationOptionsService.getLocationWithDetailsOptions(searchParams);
  }


  private updateSelectorPanelOptions(): void {
    const locationColumn = this.locationColumns.find(col => col.field === 'location_no');

    if (locationColumn?.selectorConfig?.searchFormFields) {
      // 使用 dropdown 服務中已載入的館別選項
      const buildingField = locationColumn.selectorConfig.searchFormFields.find(
        field => field.name === 'building_code'
      );
      if (buildingField) {
        buildingField.options = this.tls13010DropdownService.buildingOptions || [];
        console.log('🏢 館別選項已更新:', buildingField.options.length);
      }

      // 使用 dropdown 服務中已載入的樓層選項
      const floorField = locationColumn.selectorConfig.searchFormFields.find(
        field => field.name === 'floor_code'
      );
      if (floorField) {
        floorField.options = this.tls13010DropdownService.floorOptions || [];
        console.log('🏢 樓層選項已更新:', floorField.options.length);
      }

      // 使用 dropdown 服務中已載入的區域選項
      const areaField = locationColumn.selectorConfig.searchFormFields.find(
        field => field.name === 'area_code'
      );
      if (areaField) {
        areaField.options = this.tls13010DropdownService.regionOptions || [];
        console.log('📍 區域選項已更新:', areaField.options.length);
      }

      console.log('Selector 面板選項更新完成');
    }
  }

  getApplyNoPlaceholder(): string {
    return this.contractFlowService.isNewContractMode() ? "'系統自動產生'" : '';
  }

  /**
   * 根據模式取得表單標題
   */
  private getFormTitle(isNewMode: boolean, isViewMode: boolean): string {
    if (isViewMode) {
      return '檢視合約資料';
    }
    return isNewMode ? '新增合約資料' : '編輯合約資料';
  }

  private checkRequiredFieldsBeforeSubmit(): boolean {
    // 🔍 先打印表單的所有錯誤
    console.log('========== 表單驗證檢查 ==========');
    console.log('表單是否有效:', this.dataForm.valid);
    console.log('表單狀態:', this.dataForm.status);

    // 🔍 檢查每個欄位的狀態
    Object.keys(this.dataForm.controls).forEach(key => {
      const control = this.dataForm.get(key);
      if (control && control.errors) {
        console.log(`❌ 欄位 "${key}" 有錯誤:`, {
          value: control.value,
          errors: control.errors,
          touched: control.touched,
          dirty: control.dirty
        });
      }
    });
    const venUniform = this.dataForm.get('ven_uniform')?.value;
    const vendorNo = this.dataForm.get('vendor_no')?.value;
    if (!venUniform && vendorNo) {
      this.dataForm.patchValue({ ven_uniform: vendorNo }, { emitEvent: false });
    }

    // 檢查必填欄位
    const requiredFields = [
      'tlt_name', 'bus_type', 'bus_class', 'tlt_bdate', 'tlt_edate',
      'org_id', 'tlt_contract_bdate', 'tlt_contract_edate',
      'tlt_term_type', 'comm_comp_type', 'invoice_type'
    ];

    const missingFields: string[] = [];
    requiredFields.forEach(fieldName => {
      const control = this.dataForm.get(fieldName);
      if (control && !control.value) {
        missingFields.push(fieldName);
      }
    });

    if (missingFields.length > 0) {
      console.log('❌ 缺失的必填欄位:', missingFields);

      const missingFieldNames = missingFields
        .map(field => {
          const displayName = this.tlsBaseService.getFieldDisplayName(field);
          const currentValue = this.dataForm.get(field)?.value;
          console.log(`  - ${field} (${displayName}): 當前值 =`, currentValue);
          return displayName;
        })
        .join('、');

      this.messageService.warnBubble(`請填寫必填欄位: ${missingFieldNames}`);
      console.log('========== 調試完成 ==========');
      return false;
    }

    console.log(' 所有必填欄位已填寫');
    console.log('========== 調試完成 ==========');
    return true;
  }

  //=================動態驗證====================================
  /**
   * 新增：設定動態驗證器
   */
  private setupDynamicValidators(): void {
    console.log('📝 步驟 7: 設定動態驗證器');

    // 設定抽成別變更監聽
    const termTypeSub = this.dataForm.get('tlt_term_type')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.validationService.updateFieldValidators(this.dataForm);
      });

    // 設定付款方式變更監聽
    const paytypeSub = this.dataForm.get('paytype')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.validationService.updatePaymentValidators(this.dataForm);
      });

    // ✅ 設定預收租金相關監聽
    const rentSubscriptions = this.rentCalculationService.setupRentAheadCalculation(
      this.dataForm,
      this.messageService
    );

    // [暫時註解] 保證金付款方式變更監聽 - 選擇付款方式時金額變必填
    // ['open_deposit', 'construct_deposit', 'expiration_deposit'].forEach(fieldName => {
    //   const sub = this.dataForm.get(fieldName)?.valueChanges
    //     .pipe(distinctUntilChanged())
    //     .subscribe(() => {
    //       this.validationService.updateDepositValidators(this.dataForm);
    //     });
    //   if (sub) this.subscriptions.push(sub);
    // });

    // 將訂閱加入管理
    if (termTypeSub) this.subscriptions.push(termTypeSub);
    if (paytypeSub) this.subscriptions.push(paytypeSub);
    this.subscriptions.push(...rentSubscriptions);

    console.log('   動態驗證器設定完成');
  }

  // //設定初始必填欄位
  // private updateInitialRequiredFields(): void {
  //   // 聯名卡折數 - 預設 vip_yn = 'Y'，所以一開始就設為必填
  //   this.updateCreditCardValidators();

  //   // 銀行相關欄位 - 預設 paytype = '1' (匯款)，所以一開始就設為必填
  //   this.updatePaymentValidators();
  // }

  /**
   * 新增：自訂錯誤訊息處理
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.dataForm.get(fieldName);
    if (field) {
      return this.validationService.getFieldErrorMessage(fieldName, field);
    }
    return '';
  }

  /**
 * 觸發所有動態驗證器（用於初始化和資料載入後）
 */
  private triggerAllDynamicValidators(): void {
    this.validationService.updateAllValidators(this.dataForm);
  }

  onClearAndExit(): void {
    this.contractFlowService.clearTempData();
    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };
    this.router.navigate(['account/tls/tls13010'], extras);
    this.messageService.infoBubble('已清空暫存資料並離開');
  }

  /**
 * 格式化 email 欄位（當使用者離開輸入框時觸發）
 */
  formatEmailField(fieldName: string, value: string): void {
    this.emailValidationService.formatEmailField(this.dataForm, fieldName, value, this.messageService);
    this.saveToWorkflow();
  }

  /**
   * ✨ 廠商變更事件處理 (替代監聽器的優雅方案)
   * 此方法只在使用者手動操作 dropdown 時觸發,不會在 patchValue 時觸發
   * @param vendorVenNo - 廠商統一編號 (完整編號, 例如: "00000000-2")
   */
  onVendorChange(vendorVenNo: string): void {
    console.log('📝 使用者變更廠商統一編號:', vendorVenNo);

    if (!vendorVenNo || !vendorVenNo.trim()) {
      // 清空所有相關欄位(包含潛在客戶欄位)
      this.dataForm.patchValue({
        vendor_ven_no: '',
        vendor_no: '',
        ven_no: '',
        ven_uniform: '',
        VEN_Name: '',
        VEN_Address: '',
        vendor_acct_name: '',
        tlt_name: '',        // 清空專櫃名稱
        bus_type: '',        // 清空大分類
        contact_tel: '',     // 清空電話
        contact_fax: ''      // 清空傳真
      }, { emitEvent: false });
      this.saveToWorkflow();
      return;
    }

    // 檢查 pos2013Options 是否已載入
    if (!this.pos2013Options || this.pos2013Options.length === 0) {
      console.warn('⚠ pos2013Options 尚未載入');
      return;
    }

    // 找到選中的廠商資料
    const selectedOption = this.pos2013Options.find(opt => opt.value === vendorVenNo);

    if (!selectedOption) {
      console.warn('⚠ 找不到對應的廠商選項');
      return;
    }

    console.log('✅ 找到廠商資料:', selectedOption);

    // A. 帶入廠商基本資料
    this.dataForm.patchValue({
      vendor_ven_no: selectedOption.VEN_No,   // "00000000-2" (完整編號)
      vendor_no: selectedOption.No,           // "00000000" (統編)
      ven_no: selectedOption.VEN_No,          // "00000000-2"
      ven_uniform: selectedOption.No,         // "00000000" (統編) - 必填欄位！
      VEN_Name: selectedOption.Name,
      VEN_Address: selectedOption.VEN_Address,
      vendor_acct_name: selectedOption.Name
    }, { emitEvent: false });

    // 標記為已觸碰
    this.dataForm.get('ven_no')?.markAsTouched();
    this.dataForm.get('ven_uniform')?.markAsTouched();
    this.dataForm.get('VEN_Name')?.markAsTouched();
    this.dataForm.get('VEN_Address')?.markAsTouched();
    this.dataForm.get('vendor_acct_name')?.markAsTouched();

    console.log('✅ 已更新廠商資料，包含 ven_uniform:', this.dataForm.get('ven_uniform')?.value);

    // B. 📞 使用 DataLoaderService 載入潛在客戶資料
    console.log('🔍 準備載入潛在客戶資料，統編:', selectedOption.No);

    this.dataLoaderService.loadPotentialCustomerData(
      selectedOption.No,
      this.dataForm
    ).subscribe({
      next: (hasData) => {
        if (hasData) {
          this.messageService.successBubble('已自動帶入潛在客戶資料');
        } else {
          this.messageService.infoBubble('查無潛在客戶資料，已帶入廠商基本資料');
        }
      },
      error: () => {
        this.messageService.warnBubble('查詢潛在客戶資料失敗，僅帶入廠商基本資料');
      },
      complete: () => {
        this.saveToWorkflow();
      }
    });
  }
}
