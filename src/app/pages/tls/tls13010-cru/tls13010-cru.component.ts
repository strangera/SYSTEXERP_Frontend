// tls13010-cru.component.ts (整理後版本 - 移除無用程式碼)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { distinctUntilChanged, map, Observable, Subscription, debounceTime } from 'rxjs';

// 基礎組件
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

// 工作流程服務
import { ContractFlowService } from '../tls13010/services/contract-flow.service';

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
import { BankOptionsService } from '../../../service/api/dropdownservice/bank-option.service';
import { AutoCompleteOption, AutoCompleteComponent } from '../../../shared/componentkit/app-autocomplete/app-autocomplete.component';
import { ColumnDef, ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { CategoryItem, ContractInfo, LocationItem } from '../tls13010/tls13010.model';
import { DropdownOption } from '../tls13010/tls13010.dropdown';
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
  ],

})
export class TLS13010CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {
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
      type: 'dropdown',
      editable: true,
      style: 'min-width: 150px',
      options: [] // 這裡會在 updateLocationColumnOptions 中更新
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
    // 基本資訊
    talent_id: [''],
    apply_no: [''],
    tlt_name: [''],
    tlt_no: [''],
    ven_uniform: [''],
    VEN_Name: [''],
    paper_type: [''],
    bus_type: [''],
    bus_class: [''],
    bus_sclass: [''],
    contract_subno: [''],

    // 洽談階段資訊
    tlt_bdate: [''],
    tlt_edate: [''],
    contact_Date: [''],
    contact_USR_No: [''],
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
  overallStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.overallStatus];
  depositTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.depositType];
  tltTermTypeOptions = [...TLS13010_DROPDOWN_OPTIONS.tltTermType];
  commCompTypeDropdown = [...TLS13010_DROPDOWN_OPTIONS.commCompType];
  tltopenflagOption = [...TLS13010_DROPDOWN_OPTIONS.openflagStatus];
  tltctypemtotalOption = [...TLS13010_DROPDOWN_OPTIONS.tltCtypeMtotal];

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
    private tls13010Service: TLS13010Service,
  ) {
    super();
  }

  // ==========  生命週期方法 ==========
  ngOnInit(): void {
    this.initializePage('TLS13010', this.dataForm);
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 載入下拉選單和位置選項
    this.loadDropdownOptions();
    this.loadLocationWithDetailsOptions();
    this.loadPOS2013Options();
    this.loadNegotiatorOptions();

    // 載入工作流程資料
    this.loadWorkflowData();

    // 設定監聽
    this.setupAutoSave();
    this.setupBusTypeListener();

    // 延遲驗證（開發用）
    setTimeout(() => {
      this.validateWorkflowData();
      this.updateDisplayLocationData(); // 移到這裡
    }, 500); // 增加延遲時間
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

  }

  private loadLocationWithDetailsOptions(): void {
    console.log('開始載入位置選項...');

    // 取得目前的 talentId（如果是編輯模式）
    const workflowData = this.contractFlowService.getCurrentData();
    const talentId = workflowData.queryRowData?.talent_id;

    this.locationOptionsService.getLocationWithDetailsOptions(talentId).subscribe({
      next: (data) => {
        console.log('API回傳的資料:', data);
        this.locationWithDetailsOptions = data;
        this.updateLocationColumnOptions();
        console.log('位置選項載入完成，共', this.locationWithDetailsOptions.length, '筆');
      },
      error: (err) => {
        console.warn('載入位置選項失敗:', err);
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

    const locationColumn = this.locationColumns.find(col => col.field === 'location_no');
    if (locationColumn) {
      locationColumn.options = this.locationWithDetailsOptions.map(option => ({
        label: option.label,  // 用 service 轉換後的 label
        value: option.value   // 用 service 轉換後的 value
      }));

      console.log('已更新表格下拉選單選項:', locationColumn.options.length, '筆');
    } else {
      console.warn('找不到 location_no 欄位！'); // 改回原本的訊息
    }
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

    // 載入分類資料
    if (savedFormData.bus_type) {
      this.loadBusinessClassifications(savedFormData.bus_type);
    }

    // 🎯 改進位置資料載入邏輯
    if (savedFormData.locationInfo && Array.isArray(savedFormData.locationInfo) && savedFormData.locationInfo.length > 0) {
      console.log('📍 載入暫存位置資料');
      this.locationData = savedFormData.locationInfo.map((item: any) => ({
        ...item,
        _status: item._status || 'original',
        _isNew: item._isNew || false
      }));
    } else {
      // ✅ 沒有暫存位置時，嘗試載入既有位置
      const currentTalentId = this.contractFlowService.getCurrentTalentId();
      if (currentTalentId && !this.contractFlowService.isNewContractMode()) {
        console.log('📍 沒有暫存位置，載入既有位置資料');
        this.loadExistingLocationData(currentTalentId);
      } else {
        this.locationData = [];
      }
    }
  }

  private initializeEmptyForm(): void {
    console.log('🆕 初始化空表單');

    // 🎯 設定預設值
    this.dataForm.patchValue({
      talent_id: '', // 🎯 新增模式 talent_id 為空
      apply_no: '',
      tlt_name: '',
      tlt_no: '',
      ven_uniform: '',
      VEN_Name: '',
      paper_type: '',
      bus_type: '',
      bus_class: '',
      bus_sclass: '',
      contract_subno: '',

      // 🎯 預設值
      tlt_term_type: '3', // 一般抽成
      comm_comp_type: '2', // 除稅
      tlt_openflag: '9',

      // 🎯 其他預設值
      org_id: '',
      tlt_kind: '',
      deco_type: '',
      edc_yn: '',
      tlt_ctype_mtotal: '',
      overall_status: '',

      // 🎯 Y/N 欄位預設值
      rece_yn: '',
      pos_yn: '',
      cash_yn: '',
      vip_yn: '',
      credit_card: '',

      // 🎯 清空銀行資訊
      selectedBankInfo: null
    });

    // 🎯 清空位置資料
    this.locationData = [];

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
      tlt_remark: queryData['tlt_remark'] as string,

      // 其他欄位
      comm_yn: queryData['comm_yn'] as string,
      base_rent: queryData['base_rent'] as string,
      tlt_kind: queryData['tlt_kind'] as string,
      edc_yn: queryData['edc_yn'] as string,
      tlt_ctype_mtotal: queryData['tlt_ctype_mtotal'] as string,
      rent_ahead: queryData['rent_ahead'] as string,
      rent_period: queryData['rent_period'] as string,
      deposit: queryData['deposit'] as string,
      vip_yn: queryData['vip_yn'] as string,
      credit_card: queryData['credit_card'] as string,
      total_amt: queryData['total_amt'] as string,
      total_amt_vendor: queryData['total_amt_vendor'] as string,
      construct_fees: queryData['construct_fees'] as string,
      ticket_remarks: queryData['ticket_remarks'] as string,
      cap_saletype1: queryData['cap_saletype1'] as string,
      cap_saletype2: queryData['cap_saletype2'] as string,
      contact_USR_No: queryData['contact_USR_No'] as string,
      contact_USR_Name: queryData['contact_USR_Name'] as string,
    });

    this.loadBusinessClassifications(queryData['bus_type'] as string);
  }

  private loadBusinessClassifications(busType: string | undefined): void {
    if (busType) {
      this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
        next: (options: DropdownOption[]) => {
          const currentBusClass = this.dataForm.get('bus_class')?.value;
          const validBusClass = options.find(option => option.value === currentBusClass);
          if (currentBusClass && !validBusClass) {
            this.dataForm.get('bus_class')?.setValue('');
            this.dataForm.get('bus_sclass')?.setValue('');
          }
        },
        error: () => this.messageService.warnBubble('載入中分類選項失敗，請重新選擇大分類')
      });
    }
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
        this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
          next: (options: DropdownOption[]) => {
            const currentBusClass = this.dataForm.get('bus_class')?.value;
            const validBusClass = options.find(option => option.value === currentBusClass);
            if (currentBusClass && !validBusClass) {
              this.dataForm.get('bus_class')?.setValue('');
              this.dataForm.get('bus_sclass')?.setValue('');
            }
          },
          error: () => this.messageService.warnBubble('載入中分類選項失敗，請重新選擇大分類')
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
          next: (options: DropdownOption[]) => {
            const currentBusSClass = this.dataForm.get('bus_sclass')?.value;
            const validBusSClass = options.find(option => option.value === currentBusSClass);
            if (currentBusSClass && !validBusSClass) {
              this.dataForm.get('bus_sclass')?.setValue('');
            }
          },
          error: () => this.messageService.warnBubble('載入小分類選項失敗，請重新選擇中分類')
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
    // 移除條件檢查，總是儲存
    const formData = this.dataForm.getRawValue();

    console.log('💾 準備儲存工作流程資料...');
    console.log('📋 表單資料:', {
      talent_id: formData.talent_id,
      apply_no: formData.apply_no,
      tlt_name: formData.tlt_name,
      isNewMode: this.contractFlowService.isNewContractMode()
    });

    // 🎯 準備位置資料
    const workflowData = {
      ...formData,
      locationInfo: this.prepareLocationDataForSubmit()
    };

    const contractInfo = {
      id: formData.talent_id || '',
      ...workflowData
    } as ContractInfo;

    // 🎯 移除自訂處理，讓 ContractFlowService 統一處理 talent_id
    this.contractFlowService.saveStep1Data(contractInfo);

    console.log('✅ 已暫存到工作流程');
  }


  private generateTempTalentId(): string {
    return 'new_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
    console.log('🔍 CRU onSubmitNext 開始執行');
    console.log('📋 表單狀態:', {
      valid: this.dataForm.valid,
      mode: this.contractFlowService.isNewContractMode() ? '新增' : '編輯'
    });

    if (this.dataForm.valid) {
      const formData = this.dataForm.getRawValue();
      console.log('📋 表單資料:', {
        talent_id: formData.talent_id,
        apply_no: formData.apply_no,
        tlt_name: formData.tlt_name
      });

      // 🎯 儲存到工作流程
      this.saveToWorkflow();

      // 🎯 檢查工作流程狀態
      const workflowStatus = this.contractFlowService.getCurrentStatus();
      console.log('🚀 工作流程狀態:', workflowStatus);

      // 🎯 導向下一步
      console.log('🔄 導向 Next1');
      this.router.navigate(['account/tls/tls13010next1']);
    } else {
      console.warn('❌ 表單驗證失敗');
      this.messageService.warnBubble('請檢查必填欄位');
      this.markFormGroupTouched(this.dataForm);
    }
  }

  override onCancel(): void {
    if (this.dataForm.dirty) {
      if (confirm('是否要儲存目前的編輯內容？')) {
        this.saveToWorkflow();
        this.messageService.infoBubble('已儲存草稿');
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

    if (confirm(`確定要刪除 ${selectedItems.length} 個位置項目嗎？`)) {
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
    oldValue: string
  }): void {
    const { rowData, field, newValue, oldValue } = event;

    console.log('下拉選單變更:', { field, newValue, oldValue, currentStatus: rowData._status });

    if (field === 'location_no' && newValue) {
      // 位置編號變更時自動帶入詳細資訊
      const selectedLocation = this.locationWithDetailsOptions.find(
        location => location.value === newValue
      );

      if (selectedLocation) {
        const targetIndex = this.locationData.findIndex(item => item.id === rowData.id);

        if (targetIndex > -1) {
          const selected = selectedLocation as unknown as Record<string, unknown>;

          // ✅ 統一的狀態更新邏輯
          const currentStatus = this.locationData[targetIndex]._status;
          let newStatus: 'new' | 'modified' | 'original' | 'deleted' | undefined;

          if (currentStatus === 'new') {
            newStatus = 'new';  // 新增資料保持 new
          } else if (currentStatus === 'original' || currentStatus === 'modified') {
            newStatus = 'modified';  // 既有資料變更為 modified
          } else {
            newStatus = 'modified';  // 預設為 modified
          }

          // 更新資料
          this.locationData[targetIndex] = {
            ...this.locationData[targetIndex],
            location_no: newValue,
            tlt_building: String(selected['tlt_building'] ?? ''),
            tlt_floor: String(selected['tlt_floor'] ?? ''),
            area_no: String(selected['area_no'] ?? ''),
            tlt_space: Number(selected['tlt_space'] ?? 0),
            building_desc: String(selected['building_desc'] ?? ''),
            floor_desc: String(selected['floor_desc'] ?? ''),
            area_desc: String(selected['area_desc'] ?? ''),
            _status: newStatus
          };

          // ✅ 強制觸發變更檢測
          this.locationData = [...this.locationData];

          // 同步更新 rowData 參考
          Object.assign(rowData, this.locationData[targetIndex]);

          this.saveToWorkflow();
          this.messageService.infoBubble(`已自動帶入位置 ${newValue} 的詳細資訊`);
        }
      }
    } else {
      // ✅ 其他欄位變更的狀態處理
      if (rowData._status === 'new') {
        // 新增資料保持 new 狀態
        rowData._status = 'new';
      } else if (!rowData._status || rowData._status === 'original') {
        // 既有資料變更為 modified
        rowData._status = 'modified';
      }
      // 如果已經是 modified，保持不變
    }

    this.saveToWorkflow();
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

}
