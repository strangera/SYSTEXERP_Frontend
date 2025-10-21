import { CurrentPageService } from './../../../core/layout/app.menulist/current-page.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { distinctUntilChanged, map, Observable, Subscription, debounceTime } from 'rxjs';
import { AuthService } from '@service/system/auth.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { ContractFlowService } from '../tls13010/services/contract-flow.service';
import { Pos2013DropdownOption, TLS13010_DROPDOWN_OPTIONS, TLS13010DropdownService } from '../tls13010/tls13010.dropdown';
import { BankOptionsService } from '../../../service/api/dropdownservice/bank-option.service';
import { AutoCompleteOption, AutoCompleteComponent } from '../../../shared/componentkit/app-autocomplete/app-autocomplete.component';
import { ColumnDef, ExpandableEditTableComponent, SelectorTableColumn } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { TLS13010Service } from '../../../service/api/tls/tls13010.service';
import { ContractInfo, LocationItem } from '../tls13010/tls13010.model';
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
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RadiobuttonComponent } from "@shared/componentkit/radiobutton/radiobutton.component";
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { VendorCategoryOptionsService } from '@service/api/dropdownservice/vendor-category-options.service';
import { NegotiatorOptionsService } from '@service/api/dropdownservice/negotiator-options.service';
import { TLS13010ValidationService } from './validation/tls13010-validation.service';
import { DateValidationService } from './validation/date-validation.service';
import { EmailValidationService } from './validation/email-validation.service';
import { TLS13010FormInitService } from './services/tls13010-cru.formInit.service';
import { LocationDataManagementService } from './services/location-data-management.service';
import { TLS13010DataLoaderService } from './services/data-loader.service';
import { RentCalculationService } from './services/rent-calculation.service';
import { CommissionTypeChangeService } from './services/commission-type-change.service';
import { FormStateService } from './services/form-state.service';
import { Tls12010Service } from '@service/api/tls/tls12010.service';

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
  // ========== 核心屬性（取代繼承的部分） ==========
  isFormReadonly = false;
  ProgNo = 'TLS13010';
  formTitle = '';
  submitted = false;
  loading = false;
  crudstatus = CRUDStatus.Edit; // 固定為 Edit，避免表單被 disable

  // 用戶和權限
  user: any;
  funInfo: any;

  // ========== 檢視模式管理 ==========
  isViewMode = false;
  private viewModeSubscription?: Subscription;
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
    ven_uniform: ['', [Validators.required, Validators.maxLength(10)]], // 必填
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
    cap_saletype1: [''],
    cap_saletype2: [''],
    cap_saletype3: [''],
    cap_saletype4: [''],
    cap_saletype5: [''],

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
    private formInitService: TLS13010FormInitService,
    private locationManagementService: LocationDataManagementService,
    private dataLoaderService: TLS13010DataLoaderService,

    private rentCalculationService: RentCalculationService,
    private commissionTypeChangeService: CommissionTypeChangeService,

    private formStateService: FormStateService,

    public router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder, // ← 新增這行
    private authService: AuthService,
    private messageService: NotificationService,
    private currentPageService: CurrentPageService,
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
    private emailValidationService: EmailValidationService
  ) { }

  // ==========  生命週期方法 ==========
  ngOnInit(): void {
    window.scrollTo({ top: 0 });
    this.initializeBasics();
    this.initializeViewMode();
    this.initializeWorkflow();
    this.initializeData();
    this.setupListeners();
    this.setupDynamicValidators();
  }

  ngOnDestroy(): void {
    // 清理訂閱
    if (this.viewModeSubscription) {
      this.viewModeSubscription.unsubscribe();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());

    // ✅ 清理 FormStateService
    this.formStateService.cleanup();
  }


  private initializeBasics(): void {
    // 基本設定
    if (this.authService.currentUserValue) {
      this.user = this.authService.currentUserValue;
    }
    this.currentPageService.setCurrentProgNo(this.ProgNo);
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 固定為 Edit,避免表單被 disable
    this.crudstatus = CRUDStatus.Edit;

    //使用 service 取得標題
    this.formTitle = this.formInitService.getFormTitle(
      this.contractFlowService.isNewContractMode(),
      this.isViewMode
    );

    // 延遲設定初始控制狀態
    setTimeout(() => {
      this.setFormControlsState();
    }, 100);
  }



  /**
 * 檢查特定欄位的 readonly 狀態（供 UI 參考）
 */
  isFieldReadonly(fieldName: string): boolean {
    return this.formStateService.isFieldReadonly(
      fieldName,
      this.isViewMode,
      this.contractFlowService.isNewContractMode()
    );
  }


  private initializeViewMode(): void {
    // 從服務取得檢視模式狀態
    this.isViewMode = this.contractFlowService.isViewMode();

    // 設定檢視模式 UI 監聽
    this.setupViewModeUI();

    // 如果是檢視模式，設定表單為唯讀
    if (this.isViewMode) {
      setTimeout(() => {
        // this.setFormReadonly(true);
      }, 0);
    }
  }

  private initializeWorkflow(): void {
    // 處理 router state
    this.handleRouterState();

    // 載入工作流程資料
    this.dataLoaderService.loadWorkflowData(this);
  }

  private initializeData(): void {
    // 使用 service 載入所有下拉選單
    this.dataLoaderService.loadAllInitialDropdownOptions(this).subscribe({
      next: () => {
        console.log(' 所有初始資料載入完成');
        // === 新增這一行：自動設定洽談者預設值 ===
        if (this.contractFlowService.isNewContractMode()) {
          // 呼叫 Service 處理預設值設定
          this.formInitService.setCurrentUserAsNegotiator(this.dataForm);

          // 如果有自動設定，接著進行自動儲存
          this.saveToWorkflow();
        }
        setTimeout(() => {
          this.validateWorkflowData();
          this.updateDisplayLocationData();

          // 檢查並重新載入分類資料
          const currentBusType = this.dataForm.get('bus_type')?.value;
          if (currentBusType) {
            this.dataLoaderService.ensureClassificationDataLoaded(this, currentBusType);
          }
        }, 500);

        setTimeout(() => {
          this.updateSelectorPanelOptions();
        }, 1000);
      },
      error: (err) => {
        console.error('❌ 初始資料載入失敗:', err);
        this.messageService.errorBubble('載入資料失敗,請重新整理頁面');
      }
    });
  }

  private setupListeners(): void {
    // 設定監聽
    this.setupAutoSave();
    this.setupBusTypeListener();
    this.setupVendorUniformListener();

    setTimeout(() => {
      this.validateWorkflowData();
      this.updateDisplayLocationData();

      // 檢查並重新載入分類資料
      const currentBusType = this.dataForm.get('bus_type')?.value;
      if (currentBusType) {
        this.dataLoaderService.ensureClassificationDataLoaded(this, currentBusType);
      }
    }, 500);

    setTimeout(() => {
      this.updateSelectorPanelOptions();
    }, 1000);
  }

  // private setupVendorUniformListener(): void {
  //   // 改為監聽 vendor_ven_no (下拉選單綁定的欄位)
  //   const venUniformSubscription = this.dataForm.get('vendor_ven_no')?.valueChanges.subscribe(vendorVenNo => {
  //     console.log('📝 vendor_ven_no 變更:', vendorVenNo);

  //     if (vendorVenNo && vendorVenNo.trim()) {
  //       // 從選項中找到對應的廠商
  //       const selectedOption = this.pos2013Options.find(opt => opt.value === vendorVenNo);

  //       if (selectedOption) {
  //         // 自動帶入其他欄位
  //         this.dataForm.patchValue({
  //           vendor_no: selectedOption.No,              // 統編
  //           ven_no: selectedOption.VEN_No,             // 廠商編號 (如果你還需要)
  //           ven_uniform: selectedOption.No,            // 統一編號 (如果你還需要)
  //           VEN_Name: selectedOption.Name,
  //           VEN_Address: selectedOption.VEN_Address
  //         }, { emitEvent: false });

  //         this.saveToWorkflow();

  //         console.log('已自動帶入廠商資料:', {
  //           VEN_No: vendorVenNo,
  //           統編: selectedOption.No,
  //           名稱: selectedOption.Name
  //         });
  //       }
  //     } else {
  //       // 清空相關欄位
  //       this.dataForm.patchValue({
  //         vendor_no: '',
  //         ven_no: '',
  //         ven_uniform: '',
  //         VEN_Name: '',
  //         VEN_Address: ''
  //       }, { emitEvent: false });
  //     }
  //   });

  //   if (venUniformSubscription) this.subscriptions.push(venUniformSubscription);
  // }

  private setupVendorUniformListener(): void {
    const venUniformSubscription = this.dataForm.get('vendor_ven_no')?.valueChanges
      .subscribe(vendorVenNo => {
        console.log('📝 vendor_ven_no 變更:', vendorVenNo);

        if (vendorVenNo && vendorVenNo.trim()) {
          const selectedOption = this.pos2013Options.find(opt => opt.value === vendorVenNo);

          if (selectedOption) {
            // A. 帶入廠商基本資料
            this.dataForm.patchValue({
              vendor_no: selectedOption.No,
              ven_no: selectedOption.VEN_No,
              ven_uniform: selectedOption.No,
              VEN_Name: selectedOption.Name,
              VEN_Address: selectedOption.VEN_Address,
              vendor_acct_name: selectedOption.Name
            }, { emitEvent: false });

            // B. 使用 DataLoaderService 載入潛在客戶資料
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

            console.log('✅ 已帶入廠商基本資料');
          }
        } else {
          // 清空所有欄位
          this.dataForm.patchValue({
            vendor_no: '',
            ven_no: '',
            ven_uniform: '',
            VEN_Name: '',
            VEN_Address: '',
            vendor_acct_name: '',
            tlt_name: '',
            bus_type: '',
            contact_tel: '',
            contact_fax: ''
          }, { emitEvent: false });
        }
      });

    if (venUniformSubscription) {
      this.subscriptions.push(venUniformSubscription);
    }
  }


  /**
   * 統一設定表單欄位的 readonly 狀態
   */
  private setFormControlsState(): void {
    this.formStateService.setFormControlsState(
      this.dataForm,
      this.isViewMode,
      this.contractFlowService.isNewContractMode()
    );
    this.isFormReadonly = this.isViewMode;
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
    // 監聽大分類變更
    const busTypeSubscription = this.dataForm.get('bus_type')?.valueChanges.subscribe(busType => {
      if (busType) {
        this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
          next: (options: DropdownOption[]) => {
            const currentBusClass = this.dataForm.get('bus_class')?.value;
            const validBusClass = options.find(option => option.value === currentBusClass);

            if (currentBusClass && !validBusClass) {
              // 中分類無效時,清空中分類和小分類
              this.dataForm.get('bus_class')?.setValue('');
              this.dataForm.get('bus_sclass')?.setValue('');
              this.tls13010DropdownService.clearBusSClassOptions();
            } else if (currentBusClass && validBusClass) {
              // 中分類有效時,檢查並載入小分類
              this.dataLoaderService.loadAndValidateBusSClass(this, busType, currentBusClass);
            } else {
              // 沒有中分類值時,清空小分類
              this.dataForm.get('bus_sclass')?.setValue('');
              this.tls13010DropdownService.clearBusSClassOptions();
            }
          },
          error: (err) => {
            console.error('❌ 載入中分類失敗:', err);
            this.messageService.warnBubble('載入中分類選項失敗,請重新選擇大分類');
            // 發生錯誤時清空所有下級分類
            this.dataForm.get('bus_class')?.setValue('');
            this.dataForm.get('bus_sclass')?.setValue('');
            this.tls13010DropdownService.clearBusSClassOptions();
          }
        });
      } else {
        // 大分類清空時,清空所有下級分類
        this.tls13010DropdownService.clearBusClassOptions();
        this.tls13010DropdownService.clearBusSClassOptions();
        this.dataForm.get('bus_class')?.setValue('');
        this.dataForm.get('bus_sclass')?.setValue('');
      }
    });

    // 監聽中分類變更
    const busClassSubscription = this.dataForm.get('bus_class')?.valueChanges.subscribe(busClass => {
      const busType = this.dataForm.get('bus_type')?.value;

      if (busType && busClass) {
        //  使用 service 方法
        this.dataLoaderService.loadAndValidateBusSClass(this, busType, busClass);
      } else {
        // 中分類清空時,清空小分類
        this.tls13010DropdownService.clearBusSClassOptions();
        this.dataForm.get('bus_sclass')?.setValue('');
      }
    });

    if (busTypeSubscription) this.subscriptions.push(busTypeSubscription);
    if (busClassSubscription) this.subscriptions.push(busClassSubscription);
  }

  // ==========  表單操作方法 ==========
  private saveToWorkflow(): void {
    const currentTotalSpace = this.getTotaltlt_space();
    const formData = this.dataForm.getRawValue();
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

      // 業務欄位
      ven_uniform: formData.vendor_no || '', // "00000000" (統編)
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
  }

  onSubmitNext(): void {


    if (this.isViewMode) {
      // 檢視模式：直接導航，不帶參數
      this.router.navigate(['account/tls/tls13010next1']);
      return;
    }

    // 🔍 找出所有無效的欄位
    const invalidControls: string[] = [];
    Object.keys(this.dataForm.controls).forEach(key => {
      const control = this.dataForm.get(key);
      if (control && control.invalid && control.enabled) { // 只檢查啟用的控件
        invalidControls.push(key);
      }
    });

    if (invalidControls.length > 0) {
      // this.messageService.warnBubble(`請檢查以下欄位: ${invalidControls.join(', ')}`);
      this.messageService.warnBubble(`請檢查必填`);
      this.markFormGroupTouched(this.dataForm);
      return;
    }

    // 編輯模式的原有邏輯
    if (this.dataForm.valid) {
      this.saveToWorkflow();
      this.router.navigate(['account/tls/tls13010next1']);
    } else {
      // 🚨 臨時解決方案：強制通過
      console.warn(' 強制通過驗證（臨時解決方案）');
      this.saveToWorkflow();
      this.router.navigate(['account/tls/tls13010next1']);
    }
  }

  onCancel(): void {
    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };
    if (this.isViewMode) {
      this.contractFlowService.clearViewMode();
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
      // 使用 service 重設表單
      this.formInitService.resetFormToDefaults(this.dataForm);

      this.locationData = []; // 清除位置資料
      this.contractFlowService.clearTempData();
      this.messageService.infoBubble('表單已清除');
    }
  }

  // ==========  位置表格事件處理 ==========

  onAddLocationItem(): void {
    if (this.isViewMode) return;

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

        // 延遲一點點確保訊息顯示
        setTimeout(() => {
          this.removeLocationItem(String(rowData.id));
        }, 100);

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
    if (this.isViewMode) return;

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
      this.isViewMode = true;
      this.handleViewModeChange(true);
    }

    // 訂閱後續變更
    this.viewModeSubscription = this.contractFlowService.isViewMode$.subscribe(isViewMode => {
      console.log('🔍 檢視模式變更:', isViewMode);
      this.isViewMode = isViewMode;
      this.handleViewModeChange(isViewMode);
    });
  }

  private handleViewModeChange(isViewMode: boolean): void {
    this.isFormReadonly = isViewMode;
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
    this.router.navigate(['account/tls/tls13010']);
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
    if (this.isViewMode) {
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
    const canEdit = !this.isViewMode;

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
        order: 1  // 固定為升序，或保持原值 sort.order
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
    return this.formInitService.getApplyNoPlaceholder(
      this.contractFlowService.isNewContractMode()
    );
  }

  //檢查必填欄位 (可用於提交前驗證)
  private checkRequiredFieldsBeforeSubmit(): boolean {
    const result = this.formInitService.checkRequiredFields(this.dataForm);

    if (!result.isComplete) {
      const missingFieldNames = result.missingFields
        .map(field => this.formInitService.getFieldDisplayName(field))
        .join('、');

      this.messageService.warnBubble(`請填寫必填欄位: ${missingFieldNames}`);
      return false;
    }

    return true;
  }

  //=================動態驗證====================================
  /**
   * 新增：設定動態驗證器
   */
  private setupDynamicValidators(): void {
    // 設定抽成別變更監聽
    this.dataForm.get('tlt_term_type')?.valueChanges.subscribe(() => {
      this.validationService.updateFieldValidators(this.dataForm);
    });

    // 設定付款方式變更監聽
    this.dataForm.get('paytype')?.valueChanges.subscribe(() => {
      this.validationService.updatePaymentValidators(this.dataForm);
    });

    // // 設定信用卡配合變更監聽
    // this.dataForm.get('vip_yn')?.valueChanges.subscribe(() => {
    //   this.validationService.updateCreditCardValidators(this.dataForm);
    // });

    //  簡化: 設定預收租金相關監聽
    const rentSubscriptions = this.rentCalculationService.setupRentAheadCalculation(
      this.dataForm,
      this.messageService
    );
    // 將訂閱加入管理
    this.subscriptions.push(...rentSubscriptions);

    // 設定保證金付款方式變更監聽
    ['open_deposit', 'construct_deposit', 'expiration_deposit'].forEach(fieldName => {
      this.dataForm.get(fieldName)?.valueChanges.subscribe(() => {
        this.validationService.updateDepositValidators(this.dataForm);
      });
    });

    // 初始驗證器設定
    this.validationService.updateAllValidators(this.dataForm);
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
 * 廠商選項被選中
 */
  onVendorOptionSelected(selectedOption: any): void {
    this.dataForm.patchValue({
      vendor_ven_no: selectedOption.VEN_No,   // "00000000-2"
      vendor_no: selectedOption.No,           // "00000000"
      VEN_Name: selectedOption.Name,
      VEN_Address: selectedOption.VEN_Address
    }, { emitEvent: false });
  }
}
