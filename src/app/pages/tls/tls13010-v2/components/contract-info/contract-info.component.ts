/**
 * TLS13010-V2 合約基本資料組件 (Step 1)
 *
 * 職責：
 * - 合約基本資料輸入
 * - 位置設定管理
 * - 導航到代扣款設定頁面
 */
import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription, distinctUntilChanged, firstValueFrom, of, switchMap, debounceTime } from 'rxjs';

// 基礎組件
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

// PrimeNG
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

// 共用組件
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ColumnDef, ExpandableEditTableComponent, SelectorTableColumn } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { AutoCompleteComponent } from '@shared/componentkit/app-autocomplete/app-autocomplete.component';

// V2 服務與類型
import { CommissionType, WorkflowStep } from '../../core/constants';
import { ContractInfo, LocationItem } from '../../core/models/contract';
import { WorkflowFacadeService } from '../../services/workflow';
import { ContractValidatorService } from '../../services/validation';

// 共用服務
import { TLS13010Service } from '@service/api/tls/tls13010.service';
import { Tls12010Service } from '@service/api/tls/tls12010.service';
import { DropdownOption, TLS13010DropdownService, TLS13010_DROPDOWN_OPTIONS } from '../../../tls13010/tls13010.dropdown';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { VendorCategoryOptionsService } from '@service/api/dropdownservice/vendor-category-options.service';
import { BankOptionsService } from '@service/api/dropdownservice/bank-option.service';
import { NegotiatorOptionsService } from '@service/api/dropdownservice/negotiator-options.service';
import { TlsContractBaseService } from '@shared/services/tls/tls-contract-base.service';

interface CategoryItem {
  id: number;
}

@Component({
  selector: 'app-tls13010v2-contract-info',
  templateUrl: './contract-info.component.html',
  styleUrls: ['./contract-info.component.scss'],
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
  ]
})
export class ContractInfoComponent extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  // ========== CRUD 狀態管理 ==========
  override crudstatus: CRUDStatus = CRUDStatus.Create;
  readonly CRUDStatus = CRUDStatus;

  get isFormReadonly(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  // ========== 位置資料 ==========
  locationData: LocationItem[] = [];
  displayLocationData: LocationItem[] = [];

  // 新的位置表格欄位定義 - 使用 selector-panel 類型
  locationColumns: ColumnDef[] = [
    {
      field: 'location_no',
      header: '位置編號',
      type: 'selector-panel',  // 使用 selector-panel 讓使用者可以點選開啟選擇視窗
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
            options: [], // 會在 updateSelectorPanelOptions 中更新
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

  // ========== 主要表單定義 ==========
  dataForm = this.formBuilder.group({
    // 基本資訊
    talent_id: [''],
    apply_no: [''],
    approve_status: ['1', [Validators.required]],
    tlt_name: ['', [Validators.required, Validators.maxLength(100)]],
    tlt_no: [''],
    ven_no: ['', [Validators.required, Validators.maxLength(16)]],
    ven_uniform: ['', [Validators.maxLength(10)]],
    VEN_Name: ['', [Validators.maxLength(100)]],
    VEN_Address: [''],
    vendor_ven_no: [''],
    vendor_no: [''],
    paper_type: ['', [Validators.maxLength(2)]],
    bus_type: ['', [Validators.required, Validators.maxLength(2)]],
    bus_class: ['', [Validators.required, Validators.maxLength(2)]],
    bus_sclass: ['', [Validators.required, Validators.maxLength(2)]],
    contract_no: ['', [Validators.maxLength(12)]],
    contract_subno: ['', [Validators.required]],

    // 日期資訊
    tlt_bdate: ['', [Validators.required]],
    tlt_edate: ['', [Validators.required]],
    tlt_contract_bdate: ['', [Validators.required]],
    tlt_contract_edate: ['', [Validators.required]],
    contact_Date: [''],
    contact_USR_No: ['', [Validators.maxLength(16)]],
    contact_USR_Name: ['', [Validators.maxLength(20)]],
    feedback_date: [''],
    due_date: [''],

    // 組織與營運資訊
    org_id: ['', [Validators.required, Validators.maxLength(20)]],
    tlt_openflag: [''],

    // 商務條件
    tlt_kind: [''],
    deco_type: [''],
    tlt_term_type: ['', [Validators.required, Validators.maxLength(2)]],
    comm_comp_type: ['2', [Validators.required]],
    overall_status: [''],
    rent_ahead: ['N'],
    rent_period: [0],
    base_rent: [0],
    deposit: [0],
    total_amt: [''],
    total_amt_vendor: [''],
    check_day: [0, [Validators.required]],

    // 業務設定
    comm_yn: ['N'],
    rece_yn: ['N'],
    pos_yn: ['N'],
    cash_yn: ['N'],
    money_type: ['', [Validators.maxLength(2)]],
    store_way: [''],
    check_type: [''],
    check_typeList: [[] as string[]],
    paytype: [''],
    vip_yn: [''],
    credit_card: [''],
    invoice_type: ['', [Validators.required]],

    // 抄表設定
    water_flag: [''],
    electric_flag: [''],
    gas_flag: [''],

    // 保證金設定
    paymentMethods: [[]],
    open_deposit: [''],
    open_fees: [0],
    construct_deposit: [''],
    construct_fees: [0],
    expiration_deposit: [''],
    expiration_fees: [0],

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
    ticket_remarks: ['', [Validators.maxLength(1000)]],

    // 銷售類型
    cap_saletype1: ['N'],
    cap_saletype2: ['N'],
    cap_saletype3: ['N'],
    cap_saletype4: ['N'],
    cap_saletype5: ['N'],

    // 目標營業額單位
    total_amt_unit: [''],
    total_amt_vendor_unit: [''],

    // EDC
    edc_yn: [''],
    tlt_ctype_mtotal: [''],
    selectedBankInfo: [null]
  });

  // ========== 下拉選單選項 ==========
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
  depositPaymentOptions = [...TLS13010_DROPDOWN_OPTIONS.depositPayment];
  total_amt_unitOptions = [...TLS13010_DROPDOWN_OPTIONS.total_amt_unit];
  total_amt_vendor_unit_options = [...TLS13010_DROPDOWN_OPTIONS.total_amt_vendor_unit];
  approveStatusOptions = [...TLS13010_DROPDOWN_OPTIONS.approveStatusOptions];

  meterReadingOptions = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' }
  ];

  // 包底類別選項
  tltctypemtotalOption = [...TLS13010_DROPDOWN_OPTIONS.tltCtypeMtotal];

  // 廠商選項 (由 dropdown service 提供)
  pos2013Options: any[] = [];
  negotiatorOptions: any[] = [];
  organizationOptions: any[] = [];
  bankDropdownOptions: any[] = [];

  // 抽成別原始值 (用於判斷是否變更)
  private originalCommissionType = '';

  private subscriptions: Subscription[] = [];

  constructor(
    public override router: Router,
    private cdr: ChangeDetectorRef,
    private workflowFacade: WorkflowFacadeService,
    private contractValidator: ContractValidatorService,
    public dropdownService: TLS13010DropdownService,
    private apiService: TLS13010Service,
    private tls12010Service: Tls12010Service,
    private locationOptionsService: LocationOptionsService,
    private vendorCategoryService: VendorCategoryOptionsService,
    private bankService: BankOptionsService,
    private negotiatorService: NegotiatorOptionsService,
    private tlsBaseService: TlsContractBaseService
  ) {
    super();
  }

  // ========== 生命週期方法 ==========
  async ngOnInit(): Promise<void> {
    this.initializeBasics();
    await this.loadDropdowns();
    await this.initializeFromWorkflow();
    this.setupFormSubscriptions();
    this.setupBusTypeListener();
    this.setupBusClassListener();
    this.setupDateAutoFillListeners();
    this.setFormControlsState();
    this.updateSelectorPanelOptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ========== 初始化方法 ==========
  private initializeBasics(): void {
    this.ProgNo = 'TLS13010';

    // 根據工作流程狀態設定 CRUD 模式
    const status = this.workflowFacade.getCurrentStatus();
    if (status.isNewMode) {
      this.crudstatus = CRUDStatus.Create;
    } else if (status.isViewMode) {
      this.crudstatus = CRUDStatus.Read;
    } else {
      this.crudstatus = CRUDStatus.Edit;
    }
  }

  private async loadDropdowns(): Promise<void> {
    try {
      // 並行載入所有下拉選單
      await Promise.all([
        firstValueFrom(this.dropdownService.initialize()),
        this.loadVendorOptions(),
        this.loadBankOptions(),
        this.loadNegotiatorOptions(),
      ]);

      // 從 dropdown service 取得選項
      this.organizationOptions = this.dropdownService.orgOptions;

    } catch (error) {
      console.error('下拉選單載入失敗:', error);
    }
  }

  private async loadVendorOptions(): Promise<void> {
    try {
      this.pos2013Options = await firstValueFrom(
        this.vendorCategoryService.getVendorCategoryNoNameOptions()
      );
    } catch (error) {
      console.error('廠商選項載入失敗:', error);
      this.pos2013Options = [];
    }
  }

  private async loadBankOptions(): Promise<void> {
    try {
      this.bankDropdownOptions = await firstValueFrom(
        this.bankService.getBankOptions()
      );
    } catch (error) {
      console.error('銀行選項載入失敗:', error);
      this.bankDropdownOptions = [];
    }
  }

  private async loadNegotiatorOptions(): Promise<void> {
    try {
      this.negotiatorOptions = await firstValueFrom(
        this.negotiatorService.getNegotiatorOptions()
      );
    } catch (error) {
      console.error('洽談者選項載入失敗:', error);
      this.negotiatorOptions = [];
    }
  }

  private async initializeFromWorkflow(): Promise<void> {
    const step1Data = this.workflowFacade.getStep1Data();
    const queryRowData = this.workflowFacade.getQueryRowData();

    // 新建模式：設定所有預設值
    if (this.workflowFacade.isNewContractMode()) {
      // 使用 TlsContractBaseService 初始化表單預設值
      this.tlsBaseService.initializeEmptyForm(this.dataForm, 'TLS13010');
      console.log('✅ 已設定新增模式預設值');
      return;
    }

    // 如果有 step1Data，直接使用
    if (step1Data) {
      this.dataForm.patchValue(step1Data as any, { emitEvent: false });

      // 確保分類資料已載入
      if (step1Data.bus_type) {
        await this.ensureClassificationDataLoaded(step1Data.bus_type, step1Data.bus_class || '');
      }
    } else if (queryRowData?.talent_id) {
      // 從 API 載入資料
      await this.loadContractDetailAsync(queryRowData.talent_id);
    }

    // 載入位置資料
    const locationData = this.workflowFacade.getLocationData();
    if (locationData && locationData.length > 0) {
      this.locationData = locationData;
      this.displayLocationData = locationData.filter(loc => loc._status !== 'deleted');
    }
  }

  /**
   * 從 API 載入合約詳細資料
   */
  private async loadContractDetailAsync(talentId: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.apiService.queryTLS13010Detail(talentId)
      );

      if (response.Status === '0000' && response.Data) {
        await this.patchFormWithDetailData(response.Data);
      } else {
        this.messageService.warnBubble('查無詳細資料');
      }
    } catch (error) {
      console.error('載入詳細資料失敗:', error);
      this.messageService.errorBubble('載入詳細資料失敗');
    }
  }

  /**
   * 將 API 資料填充到表單
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async patchFormWithDetailData(detailData: any): Promise<void> {
    // 處理 check_type 轉換為 check_typeList
    if (detailData.check_type && typeof detailData.check_type === 'string') {
      detailData.check_typeList = detailData.check_type.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    }

    // 解析日期
    const dateFields = ['tlt_bdate', 'tlt_edate', 'tlt_contract_bdate', 'tlt_contract_edate', 'feedback_date', 'due_date', 'contact_Date'];
    dateFields.forEach(field => {
      if (detailData[field] && typeof detailData[field] === 'string') {
        const dateObj = new Date(detailData[field] as string);
        if (!isNaN(dateObj.getTime())) {
          detailData[field] = dateObj;
        }
      }
    });

    // 填充表單
    this.dataForm.patchValue(detailData, { emitEvent: false });

    // 記錄原始抽成別
    this.originalCommissionType = detailData.tlt_term_type || '';

    // 載入分類資料
    if (detailData.bus_type) {
      await this.ensureClassificationDataLoaded(detailData.bus_type, detailData.bus_class || '');
    }

    // 載入位置資料
    if (detailData.locationInfo && Array.isArray(detailData.locationInfo)) {
      this.locationData = detailData.locationInfo;
      this.displayLocationData = this.locationData.filter(loc => loc._status !== 'deleted');
    }

    // 儲存到 workflow
    this.saveToWorkflow();
  }

  /**
   * 確保分類資料已載入
   */
  private async ensureClassificationDataLoaded(busType: string, busClass: string): Promise<void> {
    try {
      // 載入中分類
      await firstValueFrom(this.dropdownService.loadBusClassOptions(busType));

      // 載入小分類
      if (busClass) {
        await firstValueFrom(this.dropdownService.loadBusSClassOptions(busType, busClass));
      }
    } catch (error) {
      console.error('分類資料載入失敗:', error);
    }
  }

  private setupFormSubscriptions(): void {
    // 抽成類型變更監聽
    const termTypeSub = this.dataForm.controls.tlt_term_type.valueChanges.subscribe(
      (value) => this.onCommissionTypeChange(value)
    );
    this.subscriptions.push(termTypeSub);

    // 日期變更監聯
    const bdateSub = this.dataForm.controls.tlt_bdate.valueChanges.subscribe(
      () => this.onContractDateChange()
    );
    this.subscriptions.push(bdateSub);

    // 自動儲存
    const autoSaveSub = this.dataForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.saveToWorkflow();
    });
    this.subscriptions.push(autoSaveSub);
  }

  /**
   * 監聽大分類變更，自動載入中分類選項
   */
  private setupBusTypeListener(): void {
    const subscription = this.dataForm.get('bus_type')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        switchMap(busType => {
          if (!busType) return of([]);
          return this.dropdownService.loadBusClassOptions(busType);
        })
      )
      .subscribe({
        next: (options) => {
          const currentBusClass = this.dataForm.get('bus_class')?.value;
          const validBusClass = options.find((opt: DropdownOption) => opt.value === currentBusClass);

          if (currentBusClass && !validBusClass) {
            this.dataForm.patchValue({
              bus_class: '',
              bus_sclass: ''
            }, { emitEvent: false });
          }
        },
        error: (err) => console.error('載入中分類失敗:', err)
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
          this.dropdownService.clearBusSClassOptions();

          if (!busClass || !busType) {
            return of([]);
          }

          return this.dropdownService.loadBusSClassOptions(busType, busClass);
        })
      )
      .subscribe({
        next: (options: DropdownOption[]) => {
          const currentBusSClass = this.dataForm.get('bus_sclass')?.value;
          const validBusSClass = options.find((opt: DropdownOption) => opt.value === currentBusSClass);

          if (currentBusSClass && !validBusSClass) {
            this.dataForm.patchValue({
              bus_sclass: ''
            }, { emitEvent: false });
          }
        },
        error: (err) => {
          console.error('載入小分類失敗:', err);
        }
      });

    if (subscription) {
      this.subscriptions.push(subscription);
    }
  }

  /**
   * 設定日期自動填充監聽器
   * 1. 新建模式：回函日期、洽談日期預帶今天，回函截止日預帶今天+15天，洽談者預帶當前使用者
   * 2. 回函日期變更時，自動更新回函截止日（+15天）
   * 3. 契約起始日/截止日輸入完，營運起始日/截止日預帶相同日期
   */
  private setupDateAutoFillListeners(): void {
    // 1. 新建模式：預設日期與洽談者
    if (this.workflowFacade.isNewContractMode()) {
      const today = new Date();
      const todayStr = this.formatDateString(today);

      // 預設回函日期為今天
      if (!this.dataForm.get('feedback_date')?.value) {
        this.dataForm.patchValue({ feedback_date: todayStr }, { emitEvent: false });
      }

      // 預設回函截止日為今天+15天
      if (!this.dataForm.get('due_date')?.value) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15);
        this.dataForm.patchValue({ due_date: this.formatDateString(dueDate) }, { emitEvent: false });
      }

      // 預設洽談日期為今天
      if (!this.dataForm.get('contact_Date')?.value) {
        this.dataForm.patchValue({ contact_Date: todayStr }, { emitEvent: false });
      }

      // 預設洽談者為當前使用者
      this.tlsBaseService.setCurrentUserAsNegotiator(this.dataForm);
    }

    // 2. 監聽回函日期變更，自動更新回函截止日（+15天）
    const feedbackDateSub = this.dataForm.get('feedback_date')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(feedbackDate => {
        if (feedbackDate && this.crudstatus !== CRUDStatus.Read) {
          const date = new Date(feedbackDate);
          if (!isNaN(date.getTime())) {
            date.setDate(date.getDate() + 15);
            this.dataForm.patchValue({ due_date: this.formatDateString(date) }, { emitEvent: false });
          }
        }
      });

    // 3. 監聽契約起始日變更，自動更新營運起始日
    const contractStartSub = this.dataForm.get('tlt_bdate')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(contractStart => {
        if (contractStart && this.crudstatus !== CRUDStatus.Read) {
          this.dataForm.patchValue({ tlt_contract_bdate: contractStart }, { emitEvent: false });
        }
      });

    // 4. 監聽契約截止日變更，自動更新營運截止日
    const contractEndSub = this.dataForm.get('tlt_edate')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(contractEnd => {
        if (contractEnd && this.crudstatus !== CRUDStatus.Read) {
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
  private formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 更新 Selector Panel 的下拉選項
   */
  private updateSelectorPanelOptions(): void {
    const locationColumn = this.locationColumns.find(col => col.field === 'location_no');

    if (locationColumn?.selectorConfig?.searchFormFields) {
      // 更新館別選項
      const buildingField = locationColumn.selectorConfig.searchFormFields.find(
        field => field.name === 'building_code'
      );
      if (buildingField) {
        buildingField.options = this.dropdownService.buildingOptions || [];
      }

      // 更新樓層選項
      const floorField = locationColumn.selectorConfig.searchFormFields.find(
        field => field.name === 'floor_code'
      );
      if (floorField) {
        floorField.options = this.dropdownService.floorOptions || [];
      }

      // 更新區域選項
      const areaField = locationColumn.selectorConfig.searchFormFields.find(
        field => field.name === 'area_code'
      );
      if (areaField) {
        areaField.options = this.dropdownService.regionOptions || [];
      }
    }
  }

  /**
   * 位置搜尋方法 (供 selector-panel 使用)
   */
  searchLocationOptions(searchParams: Record<string, unknown>): Observable<DropdownOption[]> {
    // 轉換 SortBy 的欄位名稱
    if (searchParams['SortBy'] && Array.isArray(searchParams['SortBy'])) {
      searchParams['SortBy'] = (searchParams['SortBy'] as { field: string; order: number }[]).map((sort) => ({
        field: sort.field === 'value' ? 'location_no' : sort.field,
        order: sort.order
      }));
    }

    return this.locationOptionsService.getLocationWithDetailsOptions(searchParams);
  }

  private setFormControlsState(): void {
    if (this.isFormReadonly) {
      this.dataForm.disable();
    } else {
      this.dataForm.enable();
      // 系統自動產生的欄位保持唯讀
      this.dataForm.controls.talent_id.disable();
      this.dataForm.controls.apply_no.disable();
      this.dataForm.controls.tlt_no.disable();
    }
  }

  // ========== 事件處理 ==========
  private onCommissionTypeChange(value: string | null): void {
    // 當抽成類型變更時，可能需要清除或初始化相關設定
    if (value) {
      this.workflowFacade.setCommissionType(value as CommissionType);
    }
  }

  private onContractDateChange(): void {
    // 日期變更時可能需要重新計算相關欄位
  }

  // ========== 導航方法 ==========
  goToNextStep(): void {
    // 驗證表單
    const formValue = this.dataForm.getRawValue();
    const validation = this.contractValidator.validate(formValue as unknown as ContractInfo, this.crudstatus === CRUDStatus.Edit);

    if (!validation.isValid) {
      this.messageService.errorBubble(validation.errors.join('\n'));
      return;
    }

    // 顯示警告
    if (validation.warnings.length > 0) {
      console.warn('驗證警告:', validation.warnings);
    }

    // 儲存到工作流程
    this.saveToWorkflow();

    // 導航到下一步 (代扣款設定)
    this.router.navigate(['account/tls/tls13010v2next1']);
  }

  goBack(): void {
    // 儲存當前資料
    this.saveToWorkflow();

    // 返回查詢頁面
    this.router.navigate(['account/tls/tls13010v2']);
  }

  private saveToWorkflow(): void {
    const formValue = this.dataForm.getRawValue();
    this.workflowFacade.setStep1Data(formValue as unknown as ContractInfo);
    this.workflowFacade.setLocationData(this.locationData);
  }

  // ========== 位置管理 ==========
  onLocationDataChange(data: LocationItem[]): void {
    this.locationData = data;
  }

  onLocationSave(event: { oldData: LocationItem, newData: LocationItem }): void {
    // 更新位置資料
    const index = this.locationData.findIndex(loc => loc.id === event.oldData.id);
    if (index !== -1) {
      this.locationData[index] = { ...event.newData, _status: event.oldData._status === 'new' ? 'new' : 'modified' };
      this.displayLocationData = this.locationData.filter(loc => loc._status !== 'deleted');
    }
  }

  addLocation(): void {
    const newLocation: LocationItem = {
      id: Date.now(),
      location_no: '',
      tlt_building: '',
      building_desc: '',
      tlt_floor: '',
      floor_desc: '',
      area_no: '',
      area_desc: '',
      tlt_space: 0,
      _status: 'new'
    };
    this.locationData = [...this.locationData, newLocation];
    this.displayLocationData = [...this.locationData];
  }

  removeLocation(index: number): void {
    const item = this.locationData[index];
    if (item._status === 'new') {
      // 新增的項目直接移除
      this.locationData.splice(index, 1);
    } else {
      // 既有項目標記為刪除
      item._status = 'deleted';
    }
    this.displayLocationData = this.locationData.filter(loc => loc._status !== 'deleted');
  }

  // ========== 輔助方法 ==========
  get isNewMode(): boolean {
    return this.crudstatus === CRUDStatus.Create;
  }

  get isEditMode(): boolean {
    return this.crudstatus === CRUDStatus.Edit;
  }

  get isViewMode(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  // ========== 廠商變更處理 ==========
  /**
   * 廠商變更事件處理
   * 當使用者選擇廠商統一編號時，自動帶入相關欄位
   * @param vendorVenNo - 廠商統一編號 (完整編號, 例如: "00000000-2")
   */
  onVendorChange(vendorVenNo: string): void {
    console.log('📝 使用者變更廠商統一編號:', vendorVenNo);

    if (!vendorVenNo || !vendorVenNo.trim()) {
      // 清空所有相關欄位 (包含潛在客戶欄位)
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
        contact_fax: '',     // 清空傳真
        contact_addr: ''     // 清空郵寄地址
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedOption = this.pos2013Options.find((opt: any) => opt.value === vendorVenNo);

    if (!selectedOption) {
      console.warn('⚠ 找不到對應的廠商選項');
      return;
    }

    console.log('✅ 找到廠商資料:', selectedOption);

    // A. 帶入廠商基本資料
    this.dataForm.patchValue({
      vendor_ven_no: selectedOption.VEN_No || selectedOption.value,   // 完整編號
      vendor_no: selectedOption.No || '',                              // 統編
      ven_no: selectedOption.VEN_No || selectedOption.value,          // 完整編號
      ven_uniform: selectedOption.No || '',                            // 統編 - 必填欄位
      VEN_Name: selectedOption.Name || selectedOption.label || '',
      VEN_Address: selectedOption.VEN_Address || '',
      vendor_acct_name: selectedOption.Name || selectedOption.label || ''
    }, { emitEvent: false });

    // 標記為已觸碰
    this.dataForm.get('ven_no')?.markAsTouched();
    this.dataForm.get('ven_uniform')?.markAsTouched();
    this.dataForm.get('VEN_Name')?.markAsTouched();
    this.dataForm.get('VEN_Address')?.markAsTouched();
    this.dataForm.get('vendor_acct_name')?.markAsTouched();

    console.log('✅ 已更新廠商資料，包含 ven_uniform:', this.dataForm.get('ven_uniform')?.value);

    // B. 載入潛在客戶資料 (tlt_name, bus_type, contact_addr, contact_tel, contact_fax)
    const vendorNo = selectedOption.No || '';
    if (vendorNo) {
      console.log('🔍 準備載入潛在客戶資料，統編:', vendorNo);
      this.loadPotentialCustomerData(vendorNo);
    } else {
      this.saveToWorkflow();
    }
  }

  /**
   * 載入潛在客戶資料
   * 從 TLS12010 (潛在客戶) 查詢該廠商的相關資料
   */
  private loadPotentialCustomerData(vendorNo: string): void {
    const request = {
      PageSize: 1,
      PageIndex: 1,
      OrderBy: '',
      Offset: 0,
      SortBy: [],
      CreatedDateStart: null,
      CreatedDateEnd: null,
      contact_USR_Name: '',
      cus_uniform_id: [vendorNo],
      VEN_Name: '',
      VEN_EngName: '',
      tlt_name: '',
      tlt_EngName: '',
      bus_type: []
    };

    this.tls12010Service.queryTLS12010(request).subscribe({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (result: any) => {
        if (result.Data && result.Data.length > 0) {
          const potentialData = result.Data[0];

          // 回填欄位
          this.dataForm.patchValue({
            tlt_name: potentialData.tlt_name || '',
            bus_type: potentialData.bus_type || '',
            contact_tel: potentialData.VEN_BossTel || '',
            contact_fax: potentialData.VEN_BossFax || '',
            contact_addr: potentialData.VEN_Addr || ''  // 郵寄地址帶入 VEN_Addr
          }, { emitEvent: true });

          console.log('✅ 已載入潛在客戶資料:', {
            tlt_name: potentialData.tlt_name,
            bus_type: potentialData.bus_type,
            contact_addr: potentialData.VEN_Addr
          });

          this.messageService.successBubble('已自動帶入潛在客戶資料');
        } else {
          // 清空欄位
          this.dataForm.patchValue({
            tlt_name: '',
            bus_type: '',
            contact_tel: '',
            contact_fax: '',
            contact_addr: ''
          }, { emitEvent: true });

          console.log('⚠️ 查無潛在客戶資料');
          this.messageService.infoBubble('查無潛在客戶資料，已帶入廠商基本資料');
        }

        this.saveToWorkflow();
      },
      error: (err) => {
        console.error('載入潛在客戶資料失敗:', err);
        this.messageService.warnBubble('查詢潛在客戶資料失敗，僅帶入廠商基本資料');
        this.saveToWorkflow();
      }
    });
  }

  // ========== 抽成別變更檢查 ==========
  hasCommissionTypeChanged(): boolean {
    const currentType = this.dataForm.get('tlt_term_type')?.value;
    return this.originalCommissionType !== '' && currentType !== this.originalCommissionType;
  }

  // ========== Email 格式化 ==========
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formatEmailField(fieldName: string, _event?: string): void {
    const control = this.dataForm.get(fieldName);
    if (control && control.value) {
      // 將全形分號轉換為半形分號，並移除多餘空格
      const formatted = (control.value as string)
        .replace(/；/g, ';')
        .replace(/\s*;\s*/g, ';')
        .trim();
      control.setValue(formatted);
    }
  }

  // ========== 位置表格事件處理 ==========
  onBatchDeleteLocation(items: LocationItem[]): void {
    items.forEach(item => {
      const index = this.locationData.findIndex(loc => loc.id === item.id);
      if (index !== -1) {
        if (this.locationData[index]._status === 'new') {
          this.locationData.splice(index, 1);
        } else {
          this.locationData[index]._status = 'deleted';
        }
      }
    });
    this.displayLocationData = this.locationData.filter(loc => loc._status !== 'deleted');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLocationTableEdit(_event: LocationItem): void {
    // 編輯事件處理
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLocationTableCancel(_event: LocationItem): void {
    // 取消事件處理
  }

  /**
   * 處理位置下拉選單變更（位置編號選擇時自動帶入館別、樓層、區域、營業坪數）
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLocationDropdownChange(event: { rowData: LocationItem; field: string; newValue: string; oldValue: string; selectedOption?: any }): void {
    const { rowData, field, newValue, selectedOption } = event;

    console.log('🔄 位置欄位變更事件:', {
      field,
      newValue,
      hasSelectedOption: !!selectedOption,
      rowId: rowData.id
    });

    if (field === 'location_no' && newValue) {
      // 檢查是否重複
      const isDuplicate = this.isLocationNoDuplicate(newValue, String(rowData.id));

      if (isDuplicate) {
        console.log('❌ 發現重複位置，阻止選擇');
        rowData.location_no = '';
        this.messageService.errorBubble(`位置編號 ${newValue} 已存在!`);
        return;
      }

      // 使用 selector-panel 提供的 selectedOption 資料
      if (selectedOption) {
        console.log('📋 使用 selector-panel 提供的完整資料:', selectedOption);

        // 更新 rowData 的欄位
        rowData.location_no = selectedOption.value || newValue;
        rowData.building_desc = selectedOption.building_desc || '';
        rowData.floor_desc = selectedOption.floor_desc || '';
        rowData.area_desc = selectedOption.area_desc || '';
        rowData.tlt_space = selectedOption.tlt_space || 0;

        // 同步更新 locationData 陣列
        const targetIndex = this.locationData.findIndex(item => item.id === rowData.id);
        if (targetIndex !== -1) {
          const currentStatus = this.locationData[targetIndex]._status;
          const newStatus = currentStatus === 'new' ? 'new' : 'modified';

          this.locationData[targetIndex] = {
            ...this.locationData[targetIndex],
            location_no: selectedOption.value || newValue,
            building_desc: selectedOption.building_desc || '',
            floor_desc: selectedOption.floor_desc || '',
            area_desc: selectedOption.area_desc || '',
            tlt_space: selectedOption.tlt_space || 0,
            _status: newStatus
          };

          // 觸發變更檢測
          this.locationData = [...this.locationData];
          this.displayLocationData = this.locationData.filter(loc => loc._status !== 'deleted');
        }
      }

      // 移除空資料標記
      delete (rowData as LocationItem & { _isEmpty?: boolean })._isEmpty;
      delete (rowData as LocationItem & { _isNew?: boolean })._isNew;

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
   * 檢查位置編號是否重複
   */
  private isLocationNoDuplicate(locationNo: string, currentId: string): boolean {
    return this.locationData.some(item =>
      item.location_no === locationNo &&
      String(item.id) !== currentId &&
      item._status !== 'deleted'
    );
  }

  /**
   * 取得位置總營業坪數
   */
  getTotalLocationSpace(): number {
    return this.locationData
      .filter(loc => loc._status !== 'deleted')
      .reduce((sum, loc) => sum + (loc.tlt_space || 0), 0);
  }
}
