import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';

import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { VendorCategoryOptionsService } from '@service/api/dropdownservice/vendor-category-options.service';
import { Tls12010Service } from '@service/api/tls/tls12010.service';
import { TLS12040Service, RenewalBasicInfo, RenewalLocationInfo } from '@service/api/tls/tls12040.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ColumnDef, ExpandableEditTableComponent } from "@shared/componentkit/expandable-edit-table/expandable-edit-table.component";
import { InputTextareaComponent } from "@shared/componentkit/input-textarea/input-textarea.component";
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { RadiobuttonComponent } from "@shared/componentkit/radiobutton/radiobutton.component";
import { SharedDropdownService } from '@shared/services/shared-dropdown.service';
import { AccordionModule } from "primeng/accordion";
import { debounceTime, distinctUntilChanged, forkJoin, Observable, Subscription } from 'rxjs';
import { CrudModeService } from '../tls12040/Workflow/crud-mode.service';
import { TLS12040FlowService } from '../tls12040/Workflow/tls12040-contract-flow.service';
import { DateValidationService } from '../tls13010-cru/validation/date-validation.service';
import { EmailValidationService } from '../tls13010-cru/validation/email-validation.service';
import { LocationDetails, TLS12040DetailModel, TLS12040RequestModel, Tls12040SelectorTableColumn } from './models/tls12040-cru.model';
import { BusinessClassificationService } from './services/business-classification.service';
import { TlsContractBaseService } from '@shared/services/tls/tls-contract-base.service';
import { sanitizeDateFields } from '@shared/services/tls/tls-form-defaults.constants';
import { TLS12040ValidationService } from './validation/tls12040-validation.service';

interface CategoryItem {
  id: number;
}

// 2.1.2.4 專櫃要約書維護CRU
@Component({
  selector: 'app-tls12040-cru',
  templateUrl: './tls12040-cru.component.html',
  styleUrl: './tls12040-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, InputTextComponent, CalendarComponent, CheckboxModule, EditorTextComponent, NgFor, CalendarRangeComponent, NgIf, TranslateModule, InputTextareaComponent, AccordionModule, ExpandableEditTableComponent, RadiobuttonComponent, MultiSelectComponent]
})
export class TLS12040CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  locationInfo: LocationDetails[] = [];
  displayLocationData: LocationDetails[] = [];
  private subscriptions: Subscription[] = [];
  private isLoadingExistingData = false;
  private isLoadingRenewalData = false;
  private lastRenewalVenNo: string | null = null;

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
        ] as Tls12040SelectorTableColumn[],
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

  decorationOptions = this.sharedDropdownService.decorationOptions; // 裝潢方式
  moneyTypeOptions = this.sharedDropdownService.moneyTypeOptions;   // 結帳方式
  checkTypeOptions = this.sharedDropdownService.checkTypeOptions;   // 對帳方式
  storeWayOptions = this.sharedDropdownService.storeWayOptions;     // 抽成別
  paytypeOptions = this.sharedDropdownService.paytypeOptions;       // 抽成別
  invoiceTypeOptions = this.sharedDropdownService.invoiceTypeOptions; // 抽成別
  tltKindOptions = this.sharedDropdownService.tltKindOptions;       // 抽成別
  tltopenflagOption = this.sharedDropdownService.openflagOptions;   // 抽成別
  commCompTypeDropdown = this.sharedDropdownService.commCompTypeOptions;
  approveStatusOptions = this.sharedDropdownService.approveStatusOptions;
  yesNoOptions = this.sharedDropdownService.yesNoOptions;
  tltTermTypeOptions = this.sharedDropdownService.tltTermTypeOptions;
  tltctypemtotalOptions = this.sharedDropdownService.tltctypemtotalOptions; // 包底類別
  totalAmtOptions = this.sharedDropdownService.totalAmtOptions;             // 目標營業額單位(廠商)
  totalAmtVendorOptions = this.sharedDropdownService.totalAmtVendorOptions; // 目標營業額單位(業主)
  depositPaymentOptions = this.sharedDropdownService.depositPaymentOptions; // 保證金
  overallStatusOptions = this.sharedDropdownService.overallStatusOptions;
  applyTypeOptions = this.sharedDropdownService.applyTypeOptions;
  contractTypeOptions = this.sharedDropdownService.contractTypeOptions;
  applyStatusOptions = this.sharedDropdownService.applyStatusOptions;

  // API 選項
  bustypeOptions: any[] = [];
  busClassOptions: any[] = [];
  busSClassOptions: any[] = [];
  buildingOptions: any[] = [];
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  orgOptions: any[] = [];
  locationOptions: any[] = [];
  paperTypeOptions: any[] = [];
  vendorOptions: any[] = [];
  pos2013Options: any[] = [];
  negotiatorOptions: any[] = [];

  bankDropdownOptions: any[] = [];
  total_amt_unitOptions: any[] = [];
  total_amt_vendor_unit_options: any[] = [];

  // meterReadingOptions: any[] = [];

  tltctypemtotalOption: any[] = [];

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.group({
    id: [''], // 必填但系統自動給號
    talent_id: [''], // 必填但系統自動給號
    apply_no: [''], // 必填但系統自動給號
    apply_type: [''],
    apply_date: [''],
    apply_status: [''],
    contract_type: [''],
    approve_status: ['1', [Validators.required]], // 必填，預設未審核
    tlt_name: ['', [Validators.required, Validators.maxLength(100)]], // 必填
    tlt_no: [''], // 必填但系統自動給號
    vendor_ven_no: [''],    // VEN_No (完整編號) - 下拉選單用
    vendor_no: [''],        // No (統編) - 後端用
    ven_no: ['', [Validators.required, Validators.maxLength(16)]],
    ven_uniform: ['', [Validators.required, Validators.maxLength(10)]], // 必填
    VEN_Name: [''], // 必填但自動帶入
    paper_type: ['', [Validators.maxLength(2)]],
    bus_type: ['', [Validators.required, Validators.maxLength(2)]], // 必填
    bus_class: ['', [Validators.required, Validators.maxLength(2)]], // 必填
    bus_sclass: ['', [Validators.required, Validators.maxLength(2)]],
    contract_no: ['', [Validators.maxLength(12)]], // 必填
    contract_subno: ['1', [Validators.required]], // 必填

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
    total_amt: [0],
    total_amt_vendor: [0],
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
    credit_card: [0],
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
    company_addr: ['', [Validators.maxLength(100)]],
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
    VEN_Address: [''],
  });
  // ----------------------------------------------------------------
  constructor(
    private tlsBaseService: TlsContractBaseService,
    private translate: TranslateService,
    // private validationService: ValidationService,
    private sharedDropdownService: SharedDropdownService,
    private route: ActivatedRoute, // 新增
    private tls12040Service: TLS12040Service, // 新增

    private locationOptionsService: LocationOptionsService,

    private flowService: TLS12040FlowService,
    private businessClassificationService: BusinessClassificationService,
    private cdr: ChangeDetectorRef,

    private validationService: TLS12040ValidationService,
    private dateValidationService: DateValidationService,
    private emailValidationService: EmailValidationService,
    private vendorCategoryService: VendorCategoryOptionsService,
    public crudModeService: CrudModeService,
    private tls12010Service: Tls12010Service,

  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS12040', this.dataForm, { useReadonly: true });
    this.handleRouterState(); // 1. 處理路由狀態

    // 先獲取暫存資料
    const existingData = this.flowService.getCruData() as TLS12040DetailModel | undefined;
    console.log('CRU ngOnInit，檢查 sessionStorage:',
      JSON.stringify(existingData?.locationInfo || [], null, 2));

    // 初始化表單和下拉選項
    this.initializeFormDefaults(); // 2. 初始化預設值，包含 existingData 處理
    this.initializeDropdownOptions(); // 3. 初始化下拉選項
    // this.setupVendorUniformListener(); // 4. 已改用 HTML 的 (valueChange) 事件
    this.setupBusinessClassificationListeners();// 5. 設定大分類監聽器 (新增)
    this.setupDynamicValidators(); // 6. 設定動態驗證
    this.setupContractDateSync(); // 7. 設定契約日期與營運日期的同步

    // 調試當前狀態
    console.log('=== CRU 狀態調試 ===');
    console.log('當前 CRUD 狀態:', this.crudstatus);
    console.log('表單標題:', this.formTitle);
    console.log('表單是否禁用:', this.dataForm.disabled);
    console.log('當前 locationInfo:', JSON.stringify(this.locationInfo, null, 2));

    // 構造 rawData，確保符合 TLS12040DetailModel
    const formValue = this.dataForm.value;
    const rawData: TLS12040DetailModel = {
      id: formValue.id || null,
      talent_id: formValue.talent_id || '',
      apply_no: formValue.apply_no || '',
      tlt_no: formValue.tlt_no || undefined,
      tlt_name: formValue.tlt_name || '',
      ven_uniform: formValue.ven_uniform || '',
      ven_no: formValue.ven_no || '',
      vendor_ven_no: formValue.ven_no || '',
      vendor_no: formValue.vendor_no || '',
      VEN_Name: formValue.VEN_Name || '',
      contract_subno: formValue.contract_subno || undefined,
      contract_no: formValue.contract_no || undefined,
      apply_type: formValue.apply_type || '',
      apply_date: formValue.apply_date || '',
      contract_type: formValue.contract_type || undefined,
      apply_status: formValue.apply_status || '',
      tlt_bdate: formValue.tlt_bdate || '',
      tlt_edate: formValue.tlt_edate || '',
      tlt_contract_bdate: formValue.tlt_contract_bdate || '',
      tlt_contract_edate: formValue.tlt_contract_edate || '',
      feedback_date: formValue.feedback_date || null,
      due_date: formValue.due_date || null,
      contact_Date: formValue.contact_Date || null,
      tlt_term_type: formValue.tlt_term_type || '',
      comm_comp_type: formValue.comm_comp_type || '',
      paper_type: formValue.paper_type || undefined,
      bus_type: formValue.bus_type || '',
      bus_class: formValue.bus_class || '',
      bus_sclass: formValue.bus_sclass || undefined,
      org_id: formValue.org_id || undefined,
      contact_USR_No: formValue.contact_USR_No || undefined,
      contact_USR_Name: formValue.contact_USR_Name || undefined,
      deco_type: formValue.deco_type || undefined,
      money_type: formValue.money_type || undefined,
      check_typeList: formValue.check_typeList || undefined,
      check_type: formValue.check_type || undefined,
      edc_yn: formValue.edc_yn || undefined,
      tlt_openflag: formValue.tlt_openflag || undefined,
      comm_yn: formValue.comm_yn || undefined,
      rece_yn: formValue.rece_yn || undefined,
      pos_yn: formValue.pos_yn || undefined,
      cash_yn: formValue.cash_yn || undefined,
      store_way: formValue.store_way || undefined,
      paytype: formValue.paytype || undefined,
      vip_yn: formValue.vip_yn || undefined,
      base_rent: formValue.base_rent || undefined,
      deposit: formValue.deposit || undefined,
      credit_card: formValue.credit_card || undefined,
      check_day: formValue.check_day || undefined,
      total_amt: formValue.total_amt || undefined,
      total_amt_vendor: formValue.total_amt_vendor || undefined,
      construct_deposit: formValue.construct_deposit || undefined,
      construct_fees: formValue.construct_fees || undefined,
      expiration_deposit: formValue.expiration_deposit || undefined,
      expiration_fees: formValue.expiration_fees || undefined,
      open_deposit: formValue.open_deposit || undefined,
      open_fees: formValue.open_fees || undefined,
      invoice_type: formValue.invoice_type || undefined,
      tlt_kind: formValue.tlt_kind || undefined,
      tlt_ctype_mtotal: formValue.tlt_ctype_mtotal || undefined,
      overall_status: formValue.overall_status || undefined,
      rent_ahead: formValue.rent_ahead || undefined,
      rent_period: formValue.rent_period || undefined,
      water_flag: formValue.water_flag || undefined,
      electric_flag: formValue.electric_flag || undefined,
      gas_flag: formValue.gas_flag || undefined,
      cap_saletype1: formValue.cap_saletype1 || undefined,
      cap_saletype2: formValue.cap_saletype2 || undefined,
      cap_saletype3: formValue.cap_saletype3 || undefined,
      cap_saletype4: formValue.cap_saletype4 || undefined,
      cap_saletype5: formValue.cap_saletype5 || undefined,
      email: formValue.email || undefined,
      invoice_email: formValue.invoice_email || undefined,
      CHECK_TITLE: formValue.CHECK_TITLE || undefined,
      store_tel: formValue.store_tel || undefined,
      bank_id: formValue.bank_id || undefined,
      vendor_acct_name: formValue.vendor_acct_name || undefined,
      vendor_acct_no: formValue.vendor_acct_no || undefined,
      contact_tel: formValue.contact_tel || undefined,
      contact_fax: formValue.contact_fax || undefined,
      contact_addr: formValue.contact_addr || undefined,
      company_addr: formValue.company_addr || undefined,
      tlt_remark: formValue.tlt_remark || undefined,
      ticket_remarks: formValue.ticket_remarks || undefined,
      total_amt_unit: formValue.total_amt_unit || undefined,
      total_amt_vendor_unit: formValue.total_amt_vendor_unit || undefined,
      approve_status: formValue.approve_status || '',
      VEN_Address: formValue.VEN_Address || '',
      locationInfo: this.locationInfo || []
    };

    console.log('儲存 cru 前，rawData.locationInfo:', JSON.stringify(rawData.locationInfo, null, 2));
    this.flowService.setCruData(rawData);

    // 如果有暫存資料，載入分類和選項
    if (existingData && Object.keys(existingData).length > 0) {
      console.log('使用暫存資料，跳過 API 載入');
      this.loadCachedDataWithClassifications(existingData);
      setTimeout(() => {
        this.updateSelectorPanelOptions();
      }, 100);
    } else {
      console.log('首次載入，需要打 API');
      // 打 API 載入資料
      // 假設這會更新 this.dataForm 和 this.locationInfo
    }

    this.cdr.detectChanges();
  }

  private loadCachedDataWithClassifications(cruData: any): void {
    console.log('📄 開始載入暫存表單資料（含分類處理）');

    if (cruData.check_type && !cruData.check_typeList) {
      cruData.check_typeList = cruData.check_type.split(',').map((s: string) => s.trim());
    }

    // 新做法：保留分類，只分開處理 locationInfo
    const formData = { ...cruData };
    delete formData.locationInfo;  // 只刪除 locationInfo

    // 使用 { emitEvent: false } 不觸發監聽器
    this.dataForm.patchValue(formData, { emitEvent: false });

    // 處理位置資料
    if (cruData.locationInfo) {
      this.locationInfo = cruData.locationInfo;
      this.updateDisplayLocationData();
    }

    // 關鍵：只載入選項，不重新設定值
    if (cruData.bus_type) {
      this.loadClassificationOptionsOnly(cruData);
    } else {
      // 沒有分類資料時，直接重新保存
      this.flowService.setCruData({
        ...cruData,
        ...this.dataForm.getRawValue(),  // 使用 getRawValue() 取得包含 disabled 欄位的值
        locationInfo: this.locationInfo
      });
    }
  }

  private loadClassificationOptionsOnly(cruData: any): void {
    console.log('🔧 載入分類選項（不設定值）:', {
      bus_type: cruData.bus_type,
      bus_class: cruData.bus_class,
      bus_sclass: cruData.bus_sclass
    });

    // 只載入中分類選項，不設定值
    this.businessClassificationService.getBusClassOptions(cruData.bus_type).subscribe({
      next: (busClassOptions) => {
        this.busClassOptions = busClassOptions;
        console.log('中分類選項載入完成:', busClassOptions.length, '筆');

        // 如果有中分類，載入小分類選項
        if (cruData.bus_class) {
          this.businessClassificationService.getBusSClassOptions(cruData.bus_type, cruData.bus_class).subscribe({
            next: (busSClassOptions) => {
              this.busSClassOptions = busSClassOptions;
              console.log('小分類選項載入完成:', busSClassOptions.length, '筆');

              // 選項載入完成，觸發變更偵測
              this.cdr.detectChanges();

              // 重新保存完整資料
              this.saveCompleteDataToFlow(cruData);
            },
            error: (error) => {
              console.error('❌ 載入小分類失敗:', error);
              this.saveCompleteDataToFlow(cruData);
            }
          });
        } else {
          // 沒有中分類時，直接保存
          this.saveCompleteDataToFlow(cruData);
        }
      },
      error: (error) => {
        console.error('❌ 載入中分類失敗:', error);
        this.saveCompleteDataToFlow(cruData);
      }
    });
  }

  //  新增方法：保存完整資料到流程
  private saveCompleteDataToFlow(originalData: any): void {
    const completeData = {
      ...originalData,
      ...this.dataForm.getRawValue(),  //  使用 getRawValue() 確保取得所有值
      locationInfo: this.locationInfo
    };

    this.flowService.setCruData(completeData);

    console.log(' 完整資料已保存到流程:', {
      bus_type: completeData.bus_type,
      bus_class: completeData.bus_class,
      bus_sclass: completeData.bus_sclass
    });
  }

  private handleRouterState(): void {
    const state = this.router.lastSuccessfulNavigation?.extras?.state;

    if (state) {
      const crudstatus = state['crudstatus'] as CRUDStatus;
      const fromNext1 = state['fromNext1'] as boolean;

      if (fromNext1) {
        console.log('⬅️ 從 Next1 返回,保持原狀態');
        this.crudstatus = crudstatus;
        this.formTitle = this.getFormTitle(crudstatus);
        this.crudModeService.setCrudStatus(this.crudstatus);

        const cruData = this.flowService.getCruData();
        if (cruData) {
          console.log('💾 載入暫存的 CRU 資料');

          //  根據模式選擇載入方式
          if (this.crudstatus === CRUDStatus.Read) {
            // Readonly 模式
            this.dataForm.enable(); // 暫時啟用
            this.loadCachedDataWithClassifications(cruData);
            this.dataForm.disable(); // 重新禁用
          } else {
            // Edit 模式
            this.loadCachedDataWithClassifications(cruData);
          }

          // 處理位置資料
          if (cruData.locationInfo && Array.isArray(cruData.locationInfo)) {
            this.locationInfo = cruData.locationInfo.map(item => ({
              ...item,
              id: item.id || this.generateTempId(),
              _status: item._status || 'original',
              _isNew: item._isNew || false,
              _isEmpty: item._isEmpty || false
            }));
            console.log(' 位置資料已恢復:', this.locationInfo.length, '筆');
          }

          this.updateDisplayLocationData();
          return;
        } else {
          console.warn(' 沒有暫存的 CRU 資料');
        }
      }

      // 🔴 來自列表的新進入
      const rowdata = state['rowdata'] as TLS12040DetailModel;
      if (rowdata && (rowdata.id || rowdata.apply_no)) {
        this.crudstatus = crudstatus;
        this.formTitle = this.getFormTitle(crudstatus);
        this.crudModeService.setCrudStatus(this.crudstatus);

        // 初始化工作流程
        this.flowService.startFlow({
          applyNo: rowdata.apply_no,
          isNewContract: crudstatus === CRUDStatus.Create
        }, rowdata);

        // 載入詳細資料
        this.loadContractDetail(rowdata);
        return;
      }

      // 🟡 其他情況（可能是新增）
      if (crudstatus) {
        this.crudstatus = crudstatus;
        this.formTitle = this.getFormTitle(crudstatus);
        this.crudModeService.setCrudStatus(this.crudstatus);

        // 新增模式初始化
        if (crudstatus === CRUDStatus.Create) {
          console.log('🆕 新增模式初始化');
          this.initializeFormDefaults();
          this.locationInfo = [];
          this.updateDisplayLocationData();
        }
      }
    } else {
      // 沒有路由狀態，檢查是否有暫存資料
      const savedData = this.flowService.getCruData();
      if (savedData) {
        console.log('📦 使用暫存資料初始化');

        // 恢復狀態
        const flowState = this.flowService.getCurrentState();
        this.crudstatus = flowState.crudstatus || CRUDStatus.Read;
        this.formTitle = this.getFormTitle(this.crudstatus);
        this.crudModeService.setCrudStatus(this.crudstatus);

        // 載入資料
        if (savedData.locationInfo && Array.isArray(savedData.locationInfo)) {
          this.locationInfo = savedData.locationInfo;
          console.log('恢復位置資料:', this.locationInfo.length, '筆');
        }

        this.updateDisplayLocationData();
        this.loadCachedDataWithClassifications(savedData);
      } else {
        console.log('🆕 全新開始，無暫存資料');
        this.crudstatus = CRUDStatus.Create;
        this.formTitle = this.getFormTitle(this.crudstatus);
        this.crudModeService.setCrudStatus(this.crudstatus);
        this.initializeFormDefaults();
      }
    }
  }

  private getFormTitle(crudstatus: CRUDStatus): string {
    switch (crudstatus) {
      case CRUDStatus.Create: return '新增專櫃要約書';
      case CRUDStatus.Edit: return '編輯專櫃要約書';
      case CRUDStatus.Read: return '查看專櫃要約書';
      default: return '專櫃要約書維護';
    }
  }
  /**
   * 處理載入錯誤的情況
   */
  private handleLoadError(): void {
    console.log(' 處理載入錯誤');

    // 3秒後返回列表頁面
    setTimeout(() => {
      this.router.navigate(['account/tls/tls12040v1'], {
        state: { fromRoute: this.router.url }
      });
    }, 3000);
  }

  private loadContractDetail(rowData: TLS12040DetailModel): void {
    console.log('🔍 開始載入合約詳細資料:', rowData);

    this.loading = true;
    this.isLoadingExistingData = true; //  設定旗標：開始載入

    const request: TLS12040RequestModel = {
      id: rowData.id,
      apply_no: rowData.apply_no
    };

    this.tls12040Service.queryTLS12040Detail(request).subscribe({
      next: (response: any) => {
        if (response && response.Status === '0000' && response.Data) {
          console.log('📦 API 回應資料:', response.Data);

          //  根據模式選擇載入方式
          if (this.crudstatus === CRUDStatus.Read) {
            this.populateFormForReadMode(response.Data);
          } else {
            this.populateForm(response.Data);
          }

          this.loadLocationData(response.Data.LocationDetails || []);

          //  載入業種分類選項（不會清空值）
          this.loadDependentDropdowns(response.Data);

          // 強制更新選項
          this.refreshAllDropdownOptions();

          this.cdr.detectChanges();
          console.log(' 合約資料載入完成');
        }
      },
      error: (error) => {
        console.error('❌ 載入合約資料失敗:', error);
        this.messageService.errorBubble('載入資料失敗');
        this.loading = false;
        this.isLoadingExistingData = false; //  重置旗標
      },
      complete: () => {
        this.loading = false;

        // ⚠️ 延遲重置旗標，確保所有非同步操作完成
        setTimeout(() => {
          this.isLoadingExistingData = false; //  重置旗標
          console.log('🏁 資料載入完成，已重置旗標');
        }, 500);
      }
    });
  }



  private refreshAllDropdownOptions(): void {
    this.applyTypeOptions = [...this.sharedDropdownService.applyTypeOptions];
    this.contractTypeOptions = [...this.sharedDropdownService.contractTypeOptions];
    this.applyStatusOptions = [...this.sharedDropdownService.applyStatusOptions];
    this.applyTypeOptions = [...this.sharedDropdownService.applyTypeOptions];
    this.decorationOptions = [...this.sharedDropdownService.decorationOptions]; // 裝潢方式
    this.moneyTypeOptions = [...this.sharedDropdownService.moneyTypeOptions];   // 結帳方式
    this.checkTypeOptions = [...this.sharedDropdownService.checkTypeOptions];   // 對帳方式
    this.storeWayOptions = [...this.sharedDropdownService.storeWayOptions];     // 抽成別
    this.paytypeOptions = [...this.sharedDropdownService.paytypeOptions];       // 抽成別
    this.invoiceTypeOptions = [...this.sharedDropdownService.invoiceTypeOptions]; // 抽成別
    this.tltKindOptions = [...this.sharedDropdownService.tltKindOptions];       // 抽成別
    this.tltopenflagOption = [...this.sharedDropdownService.openflagOptions];   // 抽成別
    this.commCompTypeDropdown = [...this.sharedDropdownService.commCompTypeOptions];
    this.approveStatusOptions = [...this.sharedDropdownService.approveStatusOptions];
    this.yesNoOptions = [...this.sharedDropdownService.yesNoOptions];
    this.tltTermTypeOptions = [...this.sharedDropdownService.tltTermTypeOptions];
    this.tltctypemtotalOptions = [...this.sharedDropdownService.tltctypemtotalOptions]; // 包底類別
    this.totalAmtOptions = [...this.sharedDropdownService.totalAmtOptions];             // 目標營業額單位(廠商)
    this.totalAmtVendorOptions = [...this.sharedDropdownService.totalAmtVendorOptions]; // 目標營業額單位(業主)
    this.depositPaymentOptions = [...this.sharedDropdownService.depositPaymentOptions]; // 保證金
    this.overallStatusOptions = [...this.sharedDropdownService.overallStatusOptions];
    this.applyTypeOptions = [...this.sharedDropdownService.applyTypeOptions];
    this.contractTypeOptions = [...this.sharedDropdownService.contractTypeOptions];
    this.applyStatusOptions = [...this.sharedDropdownService.applyStatusOptions];
  }

  private loadDependentDropdowns(data: TLS12040DetailModel): void {
    console.log('🔄 載入業種分類資料:', {
      bus_type: data.bus_type,
      bus_class: data.bus_class,
      bus_sclass: data.bus_sclass
    });

    if (!data.bus_type) {
      console.warn('⚠️ 沒有大分類代碼');
      return;
    }

    //  關鍵：不要呼叫 onBusTypeChange，直接載入選項
    // ❌ 錯誤：this.onBusTypeChange(data.bus_type); // 這會清空值！

    //  正確：直接載入中分類選項（不清空值）
    this.businessClassificationService.getBusClassOptions(data.bus_type).subscribe({
      next: (options) => {
        this.busClassOptions = options;
        console.log(' 中分類選項已載入:', options.length, '筆');

        // ⚠️ 如果有中分類資料，繼續載入小分類
        if (data.bus_class) {
          this.businessClassificationService.getBusSClassOptions(data.bus_type, data.bus_class).subscribe({
            next: (sOptions) => {
              this.busSClassOptions = sOptions;
              console.log(' 小分類選項已載入:', sOptions.length, '筆');

              //  選項載入完成後，強制觸發變更偵測
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('❌ 載入小分類失敗:', error);
              this.busSClassOptions = [];
            }
          });
        }
      },
      error: (error) => {
        console.error('❌ 載入中分類失敗:', error);
        this.busClassOptions = [];
      }
    });

    console.log('📝 注意：不要清空表單值，保留既有的 bus_class 和 bus_sclass');
  }


  private populateForm(data: any): void {
    console.log('🔍 populateForm 開始,原始資料:', data);

    // 📅 日期欄位預處理:確保格式正確
    const dateFields = [
      'apply_date', 'tlt_bdate', 'tlt_edate',
      'tlt_contract_bdate', 'tlt_contract_edate',
      'feedback_date', 'due_date', 'contact_Date'
    ];

    const processedData = {
      ...data,
      vendor_ven_no: data.ven_no || data.vendor_ven_no || '',
      check_typeList: data.check_type
        ? data.check_type.split(',').map((s: string) => s.trim())
        : []
    };

    // 🔧 將日期字串轉換為 Date 物件，確保 Calendar 元件正確顯示
    dateFields.forEach(field => {
      if (processedData[field]) {
        const dateValue = this.parseDateToDateObject(processedData[field]);
        if (dateValue) {
          processedData[field] = dateValue;
          console.log(`📅 日期欄位 ${field}: 已轉換為 Date 物件`, dateValue);
        }
      }
    });

    // 填充表單
    this.dataForm.patchValue(processedData, {
      emitEvent: false  // 關鍵：不觸發 valueChanges
    });

    //  在 readonly 模式下,立即保存到 session
    if (this.crudstatus === CRUDStatus.Read) {
      setTimeout(() => {
        this.forceSaveToSession();
      }, 100);
    }

    // ... 其他處理邏輯
    this.triggerAllDynamicValidators();
    this.dataForm.markAsPristine();

    console.log(' populateForm 完成');
  }

  private loadLocationData(locationDetails: any[]): void {
    if (!locationDetails || !Array.isArray(locationDetails)) {
      console.warn(' LocationDetails 為空或格式不正確:', locationDetails);
      this.locationInfo = [];
      this.updateDisplayLocationData();
      return;
    }

    this.locationInfo = locationDetails.map(item => ({
      id: item.id || this.generateTempId(),
      mid: item.mid || '',
      apply_no: item.apply_no || '',
      location_no: item.location_no || '',
      tlt_building: item.tlt_building || '',
      tlt_floor: item.tlt_floor || '',
      area_no: item.area_no || '',
      tlt_space: Number(item.tlt_space) || 0,
      building_desc: item.building_desc || '',
      floor_desc: item.floor_desc || '',
      area_desc: item.area_desc || '',
      _status: 'original',
      _isNew: false
    }));

    this.updateDisplayLocationData();
    console.log('📍 位置資料已載入:', this.locationInfo);
  }

  private initializeDropdownOptions() {
    this.applyTypeOptions = this.sharedDropdownService.applyTypeOptions;
    this.decorationOptions = this.sharedDropdownService.decorationOptions; // 裝潢方式
    this.moneyTypeOptions = this.sharedDropdownService.moneyTypeOptions;   // 結帳方式
    this.checkTypeOptions = this.sharedDropdownService.checkTypeOptions;   // 對帳方式
    this.storeWayOptions = this.sharedDropdownService.storeWayOptions;     // 抽成別
    this.paytypeOptions = this.sharedDropdownService.paytypeOptions;       // 抽成別
    this.invoiceTypeOptions = this.sharedDropdownService.invoiceTypeOptions; // 抽成別
    this.tltKindOptions = this.sharedDropdownService.tltKindOptions;       // 抽成別
    this.tltopenflagOption = this.sharedDropdownService.openflagOptions;   // 抽成別
    this.commCompTypeDropdown = this.sharedDropdownService.commCompTypeOptions;
    this.approveStatusOptions = this.sharedDropdownService.approveStatusOptions;
    this.yesNoOptions = this.sharedDropdownService.yesNoOptions;
    this.tltTermTypeOptions = this.sharedDropdownService.tltTermTypeOptions;
    this.tltctypemtotalOptions = this.sharedDropdownService.tltctypemtotalOptions; // 包底類別
    this.totalAmtOptions = this.sharedDropdownService.totalAmtOptions;             // 目標營業額單位(廠商)
    this.totalAmtVendorOptions = this.sharedDropdownService.totalAmtVendorOptions; // 目標營業額單位(業主)
    this.depositPaymentOptions = this.sharedDropdownService.depositPaymentOptions; // 保證金
    this.overallStatusOptions = this.sharedDropdownService.overallStatusOptions;
    this.applyTypeOptions = this.sharedDropdownService.applyTypeOptions;
    this.contractTypeOptions = this.sharedDropdownService.contractTypeOptions;
    this.applyStatusOptions = this.sharedDropdownService.applyStatusOptions;
    this.loadApiOptions();
  }

  private loadApiOptions() {
    //  檢查是否已經載入過
    if (this.bustypeOptions.length > 0) {
      console.log(' API 選項已存在，跳過載入');
      return;
    }

    this.loading = true;

    const loadTasks = [
      this.sharedDropdownService.getBustypeOptions(),
      this.sharedDropdownService.getNegotiatorOptions(),
      this.sharedDropdownService.getBuildingOptions(),
      this.sharedDropdownService.getOrgOptions(),
      this.sharedDropdownService.getLocationOptions(),
      this.sharedDropdownService.getPaperTypeOptions(),
      this.sharedDropdownService.getVendorOptions(),
      this.sharedDropdownService.getBankOptions(),
    ];

    forkJoin(loadTasks).subscribe({
      next: ([busTypes, negotiators, buildings, orgs, locations, paperTypes, vendors, banks]) => {
        this.bustypeOptions = busTypes;
        this.negotiatorOptions = negotiators;
        this.buildingOptions = buildings;
        this.orgOptions = orgs;
        this.locationOptions = locations;
        this.paperTypeOptions = paperTypes;
        this.vendorOptions = vendors;
        this.bankDropdownOptions = banks;

        console.log(' 所有 API 選項載入完成');
        this.updateSelectorPanelOptions();
        this.loading = false;
      },
      error: (error) => {
        console.error('載入選項失敗:', error);
        this.loading = false;
      }
    });
  }

  /**
   * ✨ 廠商變更事件處理 (替代監聽器的更優雅方案)
   * 此方法只在使用者手動操作 dropdown 時觸發,不會在 patchValue 時觸發
   */
  onVendorChange(vendorVenNo: string): void {
    console.log('🔍 使用者變更廠商統一編號:', vendorVenNo);

    if (!vendorVenNo || !vendorVenNo.trim()) {
      // 清空所有相關欄位
      this.dataForm.patchValue({
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
      return;
    }

    // 檢查 vendorOptions 是否已載入
    if (!this.vendorOptions || this.vendorOptions.length === 0) {
      console.warn('⚠ vendorOptions 尚未載入');
      return;
    }

    // 找到選中的廠商資料
    const selectedOption = this.vendorOptions.find(opt => opt.value === vendorVenNo);

    if (!selectedOption) {
      console.warn('⚠ 找不到對應的廠商選項');
      return;
    }

    const vendorData = selectedOption as any;

    // A. 帶入廠商基本資料
    this.dataForm.patchValue({
      vendor_no: vendorData.No || '',
      ven_no: vendorVenNo,
      ven_uniform: vendorData.No || '',
      VEN_Name: vendorData.Name || vendorData.label || '',
      VEN_Address: vendorData.VEN_Address || '',
      vendor_acct_name: vendorData.Name || vendorData.label || ''
    }, { emitEvent: false });

    // 標記為已觸碰
    this.dataForm.get('ven_no')?.markAsTouched();
    this.dataForm.get('ven_uniform')?.markAsTouched();
    this.dataForm.get('VEN_Name')?.markAsTouched();
    this.dataForm.get('VEN_Address')?.markAsTouched();
    this.dataForm.get('vendor_acct_name')?.markAsTouched();

    console.log('✅ 已設定表單值');
    this.messageService.successBubble('已自動填入廠商編號、廠商名稱、公司登記地址和帳戶名稱');

    // B. 📞 載入潛在客戶資料或續約資料
    if (vendorVenNo) {
      // 檢查是否為續約模式
      const applyType = this.dataForm.get('apply_type')?.value;
      if (applyType === '2') {
        // 續約模式：載入原合約資料 (使用 ven_no 作為唯一識別)
        this.loadRenewalData(vendorVenNo);
      } else {
        // 非續約模式：載入潛在客戶資料
        this.loadPotentialCustomerData(vendorData.No || '');
      }
    }
  }

  // 大分類變更時載入中分類（需要屬性方式）
  onBusTypeChange(busType: string) {
    console.log('🔄 大分類變更:', busType);

    // ✅ 因為使用 (valueChange) 事件,只會在使用者手動操作時觸發
    // 所以不需要 isLoadingExistingData flag 檢查
    this.dataForm.patchValue({
      bus_class: '',
      bus_sclass: ''
    }, { emitEvent: false });

    // 清空選項（這是必要的）
    this.busClassOptions = [];
    this.busSClassOptions = [];

    if (!busType) {
      return;
    }

    // 載入中分類選項
    this.businessClassificationService.getBusClassOptions(busType).subscribe({
      next: (options) => {
        this.busClassOptions = options;
        console.log('中分類選項已載入:', options.length, '筆');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ 載入中分類失敗:', error);
        this.busClassOptions = [];
      }
    });
  }

  onBusClassChange(busClass: string) {
    console.log('🔄 中分類變更:', busClass);

    const busType = this.dataForm.get('bus_type')?.value;

    // ✅ 因為使用 (valueChange) 事件,只會在使用者手動操作時觸發
    this.dataForm.patchValue({
      bus_sclass: ''
    }, { emitEvent: false });

    // 清空選項
    this.busSClassOptions = [];

    if (!busType || !busClass) {
      return;
    }

    // 載入小分類選項
    this.businessClassificationService.getBusSClassOptions(busType, busClass).subscribe({
      next: (options) => {
        this.busSClassOptions = options;
        console.log('小分類選項已載入:', options.length, '筆');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ 載入小分類失敗:', error);
        this.busSClassOptions = [];
      }
    });
  }

  onBusSClassChange(busSClass: string): void {
    // 如果需要處理小分類變更的邏輯，可以在這裡添加
  }

  override onCancel(): void {
    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };

    if (this.crudstatus === CRUDStatus.Read) {
      this.router.navigate(['account/tls/tls12040v1'], extras);
      this.messageService.infoBubble('已退出檢視模式');
      return;
    }

    // 編輯模式：暫存包含位置資料
    if (this.dataForm.dirty || this.hasLocationChanges()) {
      const completeData = {
        ...this.dataForm.value,
        locationInfo: this.locationInfo  // 包含位置資料
      };
      this.flowService.setCruData(completeData);
    }
    this.flowService.clearAll();
    this.router.navigate(['account/tls/tls12040v1'], extras);

  }

  onSubmit(frm: FormGroup): void {
    this.submitted = true;
    if (!frm.valid) {
      this.messageService.warnBubble('請檢查必填欄位');
      this.markFormGroupTouched(frm);
      return;
    }

    // 合併表單資料和位置資料
    const completeData = {
      ...frm.value,
      locationInfo: this.locationInfo  // 加入位置資料
    };

    // 保存表單資料到 cru 步驟
    const isSaved = this.flowService.setCruData(completeData);
    if (isSaved) {
      this.messageService.successBubble('資料已暫存，可以進入下一步');
      // 導航到下一步（如果需要）
      this.router.navigate(['account/tls/tls12040v1next1']);
    } else {
      this.messageService.errorBubble('資料儲存失敗，請重試');
    }
  }
  onSubmitNext(): void {
    // 確保表單有效
    if (this.dataForm.invalid) {
      this.messageService.warnBubble('請檢查必填欄位');
      this.markFormGroupTouched(this.dataForm);
      return;
    }

    const completeData = {
      ...this.dataForm.value,
      locationInfo: this.locationInfo
    };

    // 🔍 調試：檢查要保存的日期
    console.log('📅 CRU 準備保存的日期資料:', {
      tlt_bdate: completeData.tlt_bdate,
      tlt_edate: completeData.tlt_edate,
      tlt_contract_bdate: completeData.tlt_contract_bdate,
      tlt_contract_edate: completeData.tlt_contract_edate,
      型別檢查: {
        tlt_bdate: typeof completeData.tlt_bdate,
        tlt_edate: typeof completeData.tlt_edate,
        tlt_contract_bdate: typeof completeData.tlt_contract_bdate,
        tlt_contract_edate: typeof completeData.tlt_contract_edate
      }
    });

    // 保存到工作流程
    const saveResult = this.flowService.setCruData(completeData);

    if (!saveResult) {
      this.messageService.errorBubble('資料儲存失敗，請重試');
      return;
    }

    // 🔍 驗證保存後的資料
    const savedData = this.flowService.getCruData();
    console.log(' 保存後驗證:', {
      tlt_bdate: savedData?.tlt_bdate,
      tlt_edate: savedData?.tlt_edate,
      tlt_contract_bdate: savedData?.tlt_contract_bdate,
      tlt_contract_edate: savedData?.tlt_contract_edate
    });

    // 確保狀態正確傳遞
    const navigationExtras: NavigationExtras = {
      state: {
        crudstatus: this.crudstatus,
        fromRoute: this.router.url,
        fromCRU: true,
        applyNo: this.dataForm.get('apply_no')?.value || ''
      }
    };

    this.router.navigate(['account/tls/tls12040v1next1'], navigationExtras);
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

  hasCommissionTypeChanged(): boolean {
    if (this.crudstatus === CRUDStatus.Create) {
      return false;
    }

    // const originalData = this.flowService.getCurrentData()?.queryRowData;
    // const originalCommissionType = originalData?.tlt_term_type?.toString().trim();
    // const currentCommissionType = this.dataForm.get('tlt_term_type')?.value?.toString().trim();

    // return originalCommissionType !== currentCommissionType;
    return false;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.dataForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  canCopyAddress(): boolean {
    // 只要有公司登記地址且不是檢視模式就可以複製
    const hasAddress = !!this.getCompanyAddress();
    const canEdit = this.crudstatus !== CRUDStatus.Read;
    return hasAddress && canEdit;
  }

  getCompanyAddress(): string {
    const address = this.dataForm.get('VEN_Address')?.value;
    const trimmedAddress = address?.trim() || '';

    return trimmedAddress;
  }

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

    // 檢查郵寄地址是否已有值
    const currentContactAddr = this.dataForm.get('contact_addr')?.value?.trim();
    if (currentContactAddr) {
      //TODO:到時候使用彈跳視窗元件 待實作
      if (!confirm('郵寄地址已有內容，確定要覆蓋嗎？')) {
        return;
      }
    }

    // 複製地址
    this.dataForm.patchValue({
      contact_addr: companyAddress
    });

    // 標記欄位為已修改（觸發驗證樣式）
    this.dataForm.get('contact_addr')?.markAsTouched();
    this.dataForm.get('contact_addr')?.markAsDirty();

    // 自動儲存
    // this.saveToWorkflow();

    this.messageService.successBubble('已複製公司登記地址到郵寄地址');

    console.log('📋 地址複製完成:', {
      from: companyAddress,
      to: this.dataForm.get('contact_addr')?.value
    });
  }

  getDisplayLocationData(): LocationDetails[] {
    // 過濾掉標記為刪除的資料
    return this.locationInfo.filter(item => item._status !== 'deleted');
  }


  searchLocationOptions(searchParams: any): Observable<any[]> {
    console.log(' CRU 收到搜尋參數:', searchParams);

    // 轉換 SortBy 的欄位名稱
    if (searchParams.SortBy && Array.isArray(searchParams.SortBy)) {
      searchParams.SortBy = searchParams.SortBy.map((sort: any) => ({
        field: sort.field === 'value' ? 'location_no' : sort.field,  // 轉換欄位名
        order: sort.order  // 保持原值,讓用戶可以切換排序順序
      }));
    }

    console.log(' 轉換後參數:', searchParams);

    return this.locationOptionsService.getLocationWithDetailsOptions(searchParams);
  }

  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  private updateDisplayLocationData(): void {
    this.displayLocationData = this.locationInfo.filter(item => item._status !== 'deleted');
  }

  /**
   *  改良版 - 新增櫃位地點項目(防止重複新增空白行)
   */
  onAddLocationItem(): void {
    console.log('🆕 準備新增櫃位地點項目');

    //  檢查是否已有未填寫的新增行
    const hasEmptyNewRow = this.locationInfo.some(item =>
      item._isNew &&
      item._isEmpty &&
      !item.location_no
    );

    if (hasEmptyNewRow) {
      this.messageService.warnBubble('請先完成目前新增的櫃位資料後再新增下一筆');
      console.log('❌ 阻止新增:已有未填寫的新增行');
      return;
    }

    //  沒有未填寫的行,允許新增
    const newId = `new_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newLocationItem: LocationDetails = {
      id: newId,
      apply_no: '',
      location_no: '',
      tlt_building: '',
      tlt_floor: '',
      area_no: '',
      tlt_space: 0,
      building_desc: '',
      floor_desc: '',
      area_desc: '',
      _status: 'new',
      _isNew: true,
      _isEmpty: true
    };

    this.locationInfo = [...this.locationInfo, newLocationItem];

    console.log(' 櫃位地點項目新增成功:', {
      新增ID: newId,
      當前資料數量: this.locationInfo.length
    });
  }


  onBatchDeleteLocation(selectedItems: LocationDetails[]): void {
    if (this.crudstatus === CRUDStatus.Read) return;
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.warnBubble('請選擇要刪除的項目');
      return;
    }
    // 過濾有效項目
    const validItems = selectedItems.filter((item): item is LocationDetails & { id: string } => {
      if (!item.id) {
        return false;
      }
      return true;
    });

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
      } else {
        idsToMarkDeleted.add(itemId);
      }
    });

    // 記錄舊資料長度
    const oldLength = this.locationInfo.length;

    //  處理資料
    this.locationInfo = this.locationInfo
      .filter(item => {
        // 移除新增項目
        if (item.id && idsToRemove.has(String(item.id))) {
          return false;
        }
        return true;
      })
      .map(item => {
        // 標記既有項目為刪除
        if (item.id && idsToMarkDeleted.has(String(item.id))) {
          return { ...item, _status: 'deleted' as const };
        }
        return item;
      });

    // 檢查結果
    const newLength = this.locationInfo.length;
    const displayLength = this.getDisplayLocationData().length;

    console.log('📊 刪除後資料狀態:', {
      原長度: oldLength,
      新長度: newLength,
      顯示長度: displayLength,
      移除數量: oldLength - newLength,
      處理後資料: this.locationInfo.map(item => ({
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
    this.updateTotalLocationSpace();
    // 儲存並顯示訊息
    this.autoSaveToWorkflow();
    this.messageService.successBubble(`已刪除 ${validItems.length} 個位置項目`);

    console.log(' 刪除流程完成');
  }

  // 位置表格編輯事件
  onLocationTableEdit(rowData: LocationDetails): void {
    console.log('開始編輯位置資料:', rowData);
  }

  private updateTotalLocationSpace(): void {
    const totalSpace = this.getTotaltlt_space();

    // // 立即更新到工作流程
    // const currentStep1Data = this.contractFlowService.getStep1Data();
    // if (currentStep1Data) {
    //   currentStep1Data.totalLocationSpace = totalSpace;
    //   this.contractFlowService.saveStep1Data(currentStep1Data);
    // }

    console.log(' 總坪數已更新:', totalSpace);
  }

  getTotaltlt_space(): number {
    return this.locationInfo
      .filter(item => item._status !== 'deleted')  //  排除已刪除的項目
      .reduce((total: number, item: LocationDetails) => {
        const area = parseFloat(item.tlt_space.toString()) || 0;
        return total + area;
      }, 0);
  }

  onLocationTableSave(event: { oldData: LocationDetails; newData: LocationDetails }): void {
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
      console.log(' 保持新增狀態');
    } else if (this.hasLocationDataChanged(oldData, newData)) {
      newData._status = 'modified';
      console.log('📝 設為修改狀態');
    } else {
      newData._status = 'original';
      console.log('📄 保持原始狀態');
    }

    // 找到對應項目並更新
    const index = this.locationInfo.findIndex(item => item.id === newData.id);
    if (index > -1) {
      console.log(` 找到對應項目，索引: ${index}`);
      this.locationInfo[index] = { ...newData };
      this.locationInfo = [...this.locationInfo];
    } else {
      console.error(`❌ 找不到對應項目: ID=${newData.id}`);
    }
    const newTotalSpace = this.getTotaltlt_space();
    console.log('📊 位置異動後總坪數:', newTotalSpace);
    // this.saveToWorkflow();
    this.messageService.successBubble('位置資料已儲存');

    console.log('💾 儲存後狀態:', {
      總數: this.locationInfo.length,
      可顯示: this.getDisplayLocationData().length
    });

    this.autoSaveToWorkflow();
  }

  private hasLocationDataChanged(oldData: LocationDetails, newData: LocationDetails): boolean {
    const fieldsToCheck = [
      'location_no', 'tlt_building', 'tlt_floor',
      'area_no', 'tlt_space'
    ];

    return fieldsToCheck.some(field =>
      (oldData as any)[field] !== (newData as any)[field]
    );
  }

  onLocationTableCancel(rowData: LocationDetails): void {
    console.log('取消編輯位置資料:', rowData);
  }

  onLocationDropdownChange(event: {
    rowData: any;
    field: string;
    newValue: string;
    oldValue: string;
    selectedOption?: any;
  }): void {
    const { rowData, field, newValue, oldValue, selectedOption } = event;

    console.log('📄 位置欄位變更事件:', {
      field,
      newValue,
      oldValue,
      hasSelectedOption: !!selectedOption,
      rowId: rowData.id
    });

    if (field === 'location_no' && newValue) {
      //  關鍵：先檢查是否重複（在更新資料之前）
      const isDuplicate = this.isLocationNoDuplicate(newValue, rowData.id);

      if (isDuplicate) {
        console.log('❌ 發現重複位置，阻止選擇');

        //  重點1：立即阻止並清空
        rowData.location_no = '';

        //  重點2：如果是新增的空行，直接移除
        if (rowData._isNew && !rowData.location_no) {
          console.log('🗑️ 移除重複的新增空行');
          this.removeLocationItem(String(rowData.id));
        }

        // 顯示錯誤訊息
        this.messageService.errorBubble(`位置編號 ${newValue} 已存在！`);

        // 強制更新
        this.cdr.detectChanges();

        return; // ❌ 中斷，不繼續處理
      }

      //  沒有重複，正常處理
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

    // 自動保存
    this.autoSaveToWorkflow();
  }

  private handleLocationSelectionFromSelectorPanel(rowData: LocationDetails, selectedOption: any): void {
    const targetIndex = this.locationInfo.findIndex(item => item.id === rowData.id);

    if (targetIndex === -1) {
      console.error('❌ 找不到對應項目:', rowData.id);
      return;
    }

    // 從 selectedOption 取得所有需要的資料
    const locationInfo = {
      location_no: selectedOption.value || selectedOption.location_no || '',
      tlt_building: selectedOption.tlt_building || '',
      tlt_floor: selectedOption.tlt_floor || '',
      area_no: selectedOption.area_no || '',
      tlt_space: Number(selectedOption.tlt_space) || 0,
      building_desc: selectedOption.building_desc || '',
      floor_desc: selectedOption.floor_desc || '',
      area_desc: selectedOption.area_desc || ''
    };

    console.log('📋 從 selector-panel 取得的位置資料:', locationInfo);

    // 更新資料
    const currentStatus = this.locationInfo[targetIndex]._status;
    const newStatus = currentStatus === 'new' ? 'new' : 'modified';

    this.locationInfo[targetIndex] = {
      ...this.locationInfo[targetIndex],
      ...locationInfo,
      _status: newStatus
    };

    // 同步更新 rowData（讓表格立即顯示）
    Object.assign(rowData, this.locationInfo[targetIndex]);

    // 觸發變更檢測
    this.locationInfo = [...this.locationInfo];
    this.updateDisplayLocationData();

    // this.messageService.infoBubble(`已選擇位置：${locationInfo.location_no}（${locationInfo.building_desc}）`);
  }

  private removeLocationItem(itemId: string): void {
    console.log('🗑️ 開始移除櫃位項目:', itemId);

    const beforeLength = this.locationInfo.length;

    // 從陣列中移除
    this.locationInfo = this.locationInfo.filter(item => item.id !== itemId);

    const afterLength = this.locationInfo.length;

    console.log('📊 移除結果:', {
      移除前數量: beforeLength,
      移除後數量: afterLength,
      是否成功: beforeLength > afterLength
    });

    // 更新顯示資料
    this.updateDisplayLocationData();

    // 強制觸發變更檢測
    this.locationInfo = [...this.locationInfo];

    // 儲存到工作流程
    this.autoSaveToWorkflow();

    console.log(' 櫃位項目移除完成');
  }

  private isLocationNoDuplicate(locationNo: string, currentId: string): boolean {
    if (!locationNo || !locationNo.trim()) {
      return false;
    }

    const trimmedLocationNo = locationNo.trim();

    // 檢查是否有其他行使用相同的位置編號
    const hasDuplicate = this.locationInfo.some(item =>
      item.id !== currentId &&              // 排除自己
      item._status !== 'deleted' &&         // 排除已刪除
      item.location_no?.trim() === trimmedLocationNo
    );

    console.log('🔍 重複檢查:', {
      檢查位置: trimmedLocationNo,
      當前ID: currentId,
      是否重複: hasDuplicate,
      現有位置: this.locationInfo
        .filter(item => item._status !== 'deleted')
        .map(item => ({
          id: item.id,
          location_no: item.location_no
        }))
    });

    return hasDuplicate;
  }

  private checkLocationDuplicate(newData: LocationDetails): boolean {
    return this.isLocationNoDuplicate(newData.location_no || '', String(newData.id));
  }

  private updateSelectorPanelOptions(): void {
    const locationColumn = this.locationColumns.find(col => col.field === 'location_no');
    if (locationColumn?.selectorConfig?.searchFormFields) {
      // 🏢 呼叫 API 取得館別選項
      const buildingField = locationColumn.selectorConfig.searchFormFields.find(
        field => field.name === 'building_code'
      );
      if (buildingField) {
        this.sharedDropdownService.getBuildingOptions().subscribe(options => {
          buildingField.options = options || [];
          console.log('🏢 館別選項已更新:', buildingField.options.length);
        });
      }
      // 🏢 呼叫 API 取得樓層選項
      const floorField = locationColumn.selectorConfig.searchFormFields.find(
        field => field.name === 'floor_code'
      );
      if (floorField) {
        this.sharedDropdownService.getFloorOptions().subscribe(options => {
          floorField.options = options || [];
          console.log('🏢 樓層選項已更新:', floorField.options.length);
        });
      }
      // 📍 呼叫 API 取得區域選項
      const areaField = locationColumn.selectorConfig.searchFormFields.find(
        field => field.name === 'area_code'
      );
      if (areaField) {
        this.sharedDropdownService.getRegionOptions().subscribe(options => {
          areaField.options = options || [];
          console.log('📍 區域選項已更新:', areaField.options.length);
        });
      }
      console.log(' Selector 面板選項更新開始');
    }
  }

  private autoSaveToWorkflow(): void {
    const today = new Date().toISOString().split('T')[0];
    const formValue = this.dataForm.value;

    // 確保 locationInfo 不會被覆蓋
    const cleanedFormValue = {
      ...formValue,
      apply_date: formValue.apply_date || today,
      tlt_bdate: formValue.tlt_bdate || today,
      tlt_contract_bdate: formValue.tlt_contract_bdate || today,
      tlt_contract_edate: formValue.tlt_contract_edate || '',
      tlt_edate: formValue.tlt_edate || '',
      feedback_date: formValue.feedback_date || '',
      due_date: formValue.due_date || '',
      contact_Date: formValue.contact_Date || today,
      check_typeList: formValue.check_typeList || [],
      // 關鍵修正：使用 locationInfo 而非 locationInfo
      locationInfo: this.locationInfo.map((item: LocationDetails) => ({
        ...item,
        id: item.id || new Date().getTime(),
        _status: item._status || 'original',
        _isNew: item._isNew || false,
        _isEmpty: item._isEmpty || false
      })) || []
    };

    this.flowService.setCruData(cleanedFormValue);
    console.log('自動儲存修正後資料:', cleanedFormValue);
  }

  private hasLocationChanges(): boolean {
    // 檢查位置資料是否有異動
    return this.locationInfo.some(item =>
      item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
    );
  }

  /**
* 格式化 email 欄位（當使用者離開輸入框時觸發）
*/
  formatEmailField(fieldName: string, value: string): void {
    console.log(`格式化 ${fieldName} 欄位:`, value);

    if (!value || value.trim() === '') {
      return;
    }

    // 檢查是否包含分隔符號，如果沒有就不需要格式化
    if (!value.includes(',') && !value.includes(';')) {
      // 單一 email，只需要驗證格式
      this.validateSingleEmail(fieldName, value.trim());
      return;
    }

    // 格式化多個 email
    const formattedValue = this.formatMultipleEmails(value);

    // 如果格式有改變，更新表單值
    if (formattedValue !== value) {
      const control = this.dataForm.get(fieldName);
      control?.setValue(formattedValue);

      this.messageService.infoBubble(`已自動格式化 ${this.getFieldDisplayName(fieldName)}`);

      // 自動儲存
      // this.saveToWorkflow();
    }

    // 驗證格式化後的 email
    this.validateMultipleEmails(fieldName, formattedValue);
  }

  /**
   * 格式化多個 email 字串
   */
  private formatMultipleEmails(emailString: string): string {
    return emailString
      .split(/[;,]/) // 支援分號和逗號分隔
      .map(email => email.trim()) // 去除前後空格
      .filter(email => email !== '') // 過濾空字串
      .join(';'); // 統一用分號連接
  }

  /**
   * 驗證單一 email
   */
  private validateSingleEmail(fieldName: string, email: string): void {
    if (email && !this.isValidEmailFormat(email)) {
      this.messageService.warnBubble(`${this.getFieldDisplayName(fieldName)} 格式不正確`);
    }
  }

  /**
   * 驗證多個 email
   */
  private validateMultipleEmails(fieldName: string, emailString: string): void {
    if (!emailString) return;

    const emails = emailString.split(';');
    const invalidEmails: string[] = [];

    emails.forEach(email => {
      if (email && !this.isValidEmailFormat(email)) {
        invalidEmails.push(email);
      }
    });

    if (invalidEmails.length > 0) {
      this.messageService.warnBubble(
        `${this.getFieldDisplayName(fieldName)} 中有無效格式：${invalidEmails.join(', ')}`
      );
    }
  }

  /**
   * 驗證 email 格式
   */
  private isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * 取得欄位顯示名稱
   */
  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: Record<string, string> = {
      'email': '聯絡信箱',
      'invoice_email': '發票信箱'
    };
    return fieldNames[fieldName] || fieldName;
  }

  // 新增：設定動態驗證器（從 tls13010 複製）
  private setupDynamicValidators(): void {
    // 設定抽成別變更監聽
    this.dataForm.get('tlt_term_type')?.valueChanges.subscribe(() => {
      this.validationService.updateFieldValidators(this.dataForm);
    });

    // 設定付款方式變更監聽
    this.dataForm.get('paytype')?.valueChanges.subscribe(() => {
      this.validationService.updatePaymentValidators(this.dataForm);
    });

    // 設定信用卡配合變更監聽（如果需要）
    // this.dataForm.get('vip_yn')?.valueChanges.subscribe(() => {
    //   this.validationService.updateCreditCardValidators(this.dataForm);
    // });

    // 設定日期驗證器
    this.dateValidationService.setupDateValidators(this.dataForm, this.messageService);

    // 設定預收租金相關監聽
    this.setupRentAheadCalculation();

    // [暫時註解] 保證金付款方式變更監聽 - 選擇付款方式時金額變必填
    // ['open_deposit', 'construct_deposit', 'expiration_deposit'].forEach(fieldName => {
    //   this.dataForm.get(fieldName)?.valueChanges.subscribe(() => {
    //     this.validationService.updateDepositValidators(this.dataForm);
    //   });
    // });

    // 初始驗證器設定
    this.validationService.updateAllValidators(this.dataForm);
  }

  /**
   * 設定契約日期與營運日期的同步
   */
  private setupContractDateSync(): void {
    const dateSyncSubs = this.tlsBaseService.setupContractDateSync(this.dataForm);
    this.subscriptions.push(...dateSyncSubs);
    console.log('✅ 契約日期同步監聽已設定');
  }

  // 新增：設定預收租金計算邏輯（從 tls13010 複製）
  private setupRentAheadCalculation(): void {
    // 監聽預收租金選項變更
    this.dataForm.get('rent_ahead')?.valueChanges.subscribe((rentAhead) => {
      console.log('📊 預收租金選項變更:', rentAhead);

      if (rentAhead === 'Y') {
        this.calculateRentPeriodIfPossible();
        // 設定固定租金為必填
        this.updateBaseRentValidators();
      } else {
        // 預收租金為否時，清空期數
        this.dataForm.get('rent_period')?.setValue(0);
        this.updateBaseRentValidators();
      }
    });

    // 監聽契約起始日變更（使用 blur 事件模擬）
    this.dataForm.get('tlt_bdate')?.valueChanges.pipe(
      debounceTime(500) // 延遲觸發，模擬 blur 效果
    ).subscribe(() => {
      console.log('📅 契約起始日變更，檢查是否需要重新計算');
      this.dateValidationService.validateContractDates(this.dataForm, this.messageService);
      this.calculateRentPeriodIfPossible();
    });

    // 監聽契約迄日變更（使用 blur 事件模擬）
    this.dataForm.get('tlt_edate')?.valueChanges.pipe(
      debounceTime(500) // 延遲觸發，模擬 blur 效果
    ).subscribe(() => {
      this.calculateRentPeriodIfPossible();
    });
  }

  // 檢查條件並計算預收租金期數
  private calculateRentPeriodIfPossible(): void {
    const rentAhead = this.dataForm.get('rent_ahead')?.value;
    const startDate = this.dataForm.get('tlt_bdate')?.value;
    const endDate = this.dataForm.get('tlt_edate')?.value;
    if (rentAhead !== 'Y' || !startDate || !endDate) {
      return;
    }
    // 使用 service 計算
    this.dateValidationService.calculateAndSetRentPeriod(
      this.dataForm,
      this.messageService
    );
  }

  private updateBaseRentValidators(): void {
    const baseRentControl = this.dataForm.get('base_rent');
    const rentAhead = this.dataForm.get('rent_ahead')?.value;

    if (!baseRentControl) return;

    baseRentControl.clearValidators();

    if (rentAhead === 'Y') {
      baseRentControl.setValidators([Validators.required, Validators.min(1)]);
      console.log(' 預收租金為"是"：固定租金設為必填');
    } else {
      baseRentControl.setValidators([Validators.min(0)]);
      console.log('ℹ️ 預收租金為"否"：固定租金非必填');
    }

    baseRentControl.updateValueAndValidity();
  }

  /**
   * 觸發所有動態驗證器（用於初始化和資料載入後）
   */
  private triggerAllDynamicValidators(): void {
    this.validationService.updateAllValidators(this.dataForm);
  }

  // 新增：自訂錯誤訊息處理（從 tls13010 複製）
  getFieldErrorMessage(fieldName: string): string {
    const field = this.dataForm.get(fieldName);
    if (field) {
      return this.validationService.getFieldErrorMessage(fieldName, field);
    }
    return '';
  }

  // ✅ 已移除 setupVendorUniformListener(),改用 HTML 的 (valueChange)="onVendorChange($event)" 事件

  /**
 * 🔧 設定業種分類的連動監聽
 * 大分類 → 中分類 → 小分類
 */
  private setupBusinessClassificationListeners(): void {
    console.log('🎧 設定業種分類監聽器');

    // 監聽大分類變更
    const busTypeSubscription = this.dataForm.get('bus_type')?.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged()
      )
      .subscribe(busType => {
        console.log('🔔 大分類變更事件觸發:', busType);

        //  關鍵：如果是載入既有資料，不要清空
        if (this.isLoadingExistingData) {
          console.log('⏭️ 正在載入既有資料，跳過清空邏輯');

          // 但還是要載入選項
          if (busType) {
            this.businessClassificationService.getBusClassOptions(busType).subscribe({
              next: (options) => {
                this.busClassOptions = options;
                console.log(' 已載入中分類選項:', options.length, '筆');
                this.cdr.detectChanges();
              }
            });
          }
          return; // ⚠️ 關鍵：直接 return，不執行下面的清空邏輯
        }

        //  只有使用者手動變更時，才執行清空邏輯
        console.log('👤 使用者手動變更大分類，執行清空邏輯');

        if (busType) {
          // 清空中分類和小分類的值
          this.dataForm.patchValue({
            bus_class: '',
            bus_sclass: ''
          }, { emitEvent: false });

          // 清空選項
          this.busClassOptions = [];
          this.busSClassOptions = [];

          // 載入中分類選項
          this.businessClassificationService.getBusClassOptions(busType).subscribe({
            next: (options) => {
              this.busClassOptions = options;
              console.log(' 已載入中分類選項:', options.length, '筆');
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('❌ 載入中分類失敗:', err);
              this.busClassOptions = [];
            }
          });
        } else {
          // 清空所有分類
          this.dataForm.patchValue({
            bus_class: '',
            bus_sclass: ''
          }, { emitEvent: false });

          this.busClassOptions = [];
          this.busSClassOptions = [];
        }

        // 自動保存
        this.autoSaveToWorkflow();
      });

    // 監聽中分類變更
    const busClassSubscription = this.dataForm.get('bus_class')?.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged()
      )
      .subscribe(busClass => {
        console.log('🔔 中分類變更事件觸發:', busClass);

        //  如果是載入既有資料，不要清空
        if (this.isLoadingExistingData) {
          console.log('⏭️ 正在載入既有資料，跳過清空邏輯');

          // 但還是要載入小分類選項
          const busType = this.dataForm.get('bus_type')?.value;
          if (busType && busClass) {
            this.businessClassificationService.getBusSClassOptions(busType, busClass).subscribe({
              next: (options) => {
                this.busSClassOptions = options;
                console.log(' 已載入小分類選項:', options.length, '筆');
                this.cdr.detectChanges();
              }
            });
          }
          return; // ⚠️ 關鍵：直接 return
        }

        //  只有使用者手動變更時，才執行清空邏輯
        console.log('👤 使用者手動變更中分類，執行清空邏輯');

        const busType = this.dataForm.get('bus_type')?.value;

        if (busType && busClass) {
          // 清空小分類的值
          this.dataForm.patchValue({
            bus_sclass: ''
          }, { emitEvent: false });

          // 清空選項
          this.busSClassOptions = [];

          // 載入小分類選項
          this.businessClassificationService.getBusSClassOptions(busType, busClass).subscribe({
            next: (options) => {
              this.busSClassOptions = options;
              console.log(' 已載入小分類選項:', options.length, '筆');
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('❌ 載入小分類失敗:', err);
              this.busSClassOptions = [];
            }
          });
        } else {
          // 清空小分類
          this.dataForm.patchValue({
            bus_sclass: ''
          }, { emitEvent: false });

          this.busSClassOptions = [];
        }

        // 自動保存
        this.autoSaveToWorkflow();
      });

    // 記得取消訂閱
    if (busTypeSubscription) {
      this.subscriptions.push(busTypeSubscription);
    }
    if (busClassSubscription) {
      this.subscriptions.push(busClassSubscription);
    }

    console.log(' 業種分類監聽器設定完成');
  }


  private loadPotentialCustomerData(venUniform: string): void {
    console.log('🔍 開始查詢潛在客戶資料, 統編:', venUniform);

    const request = {
      PageSize: 1,
      PageIndex: 1,
      OrderBy: "",
      Offset: 0,
      SortBy: [],
      CreatedDateStart: null,
      CreatedDateEnd: null,
      contact_USR_Name: "",
      cus_uniform_id: [venUniform],
      VEN_Name: "",
      VEN_EngName: "",
      tlt_name: "",
      tlt_EngName: "",
      bus_type: []
    };

    this.tls12010Service.queryTLS12010(request).subscribe({
      next: (result) => {
        console.log('📦 API 回應:', result);

        if (result.Data && result.Data.length > 0) {
          const potentialData = result.Data[0];

          console.log(' 找到潛在客戶資料:', potentialData);

          // 回填欄位
          this.dataForm.patchValue({
            tlt_name: potentialData.tlt_name || '',
            bus_type: potentialData.bus_type || '',
            contact_tel: potentialData.VEN_BossTel || '',
            contact_fax: potentialData.VEN_BossFax || '',
            contact_addr: potentialData.VEN_Addr || ''  // 郵寄地址帶入 VEN_Addr
          }, { emitEvent: true }); // 👈 設為 true 以觸發 bus_type 的連動

          // 標記為已觸碰
          this.dataForm.get('tlt_name')?.markAsTouched();
          this.dataForm.get('bus_type')?.markAsTouched();

          this.messageService.successBubble('已自動帶入潛在客戶資料');
          console.log(' 已載入潛在客戶資料');

        } else {
          //  查無資料時清空相關欄位
          console.log('ℹ️ 查無潛在客戶資料');

          this.dataForm.patchValue({
            tlt_name: '',
            bus_type: '',
            contact_tel: '',
            contact_fax: '',
            contact_addr: ''
          }, { emitEvent: false });

          this.messageService.infoBubble('查無潛在客戶資料,僅帶入廠商基本資料');
        }
      },
      error: (err) => {
        console.error('❌ 載入潛在客戶資料失敗:', err);

        //  錯誤時也要清空欄位
        this.dataForm.patchValue({
          tlt_name: '',
          bus_type: '',
          contact_tel: '',
          contact_fax: '',
          contact_addr: ''
        }, { emitEvent: false });

        this.messageService.warnBubble('查詢潛在客戶資料失敗,僅帶入廠商基本資料');
      },
      complete: () => {
        this.autoSaveToWorkflow();
      }
    });
  }

  // 3. 初始化預設值的方法
  private initializeFormDefaults(): void {
    const existingData = this.flowService.getCruData() as TLS12040DetailModel;
    console.log('🔄 CRU 初始化時 cruData:', JSON.stringify(existingData?.locationInfo, null, 2));

    if (existingData && Object.keys(existingData).length > 0) {
      console.log('📦 使用暫存資料，跳過預設值設定');

      // ⚠️ 設定旗標
      this.isLoadingExistingData = true;

      // 將 ISO 日期字串轉為 Date 物件（避免日期欄位顯示時間戳）
      const sanitizedData = sanitizeDateFields(existingData);

      // 使用 { emitEvent: false } 避免觸發監聯器
      this.dataForm.patchValue(sanitizedData, { emitEvent: false });

      this.locationInfo = existingData.locationInfo || [];
      this.displayLocationData = this.locationInfo.filter(item => item._status !== 'deleted');
      this.cdr.detectChanges();

      // 載入分類
      this.loadCachedDataWithClassifications(existingData);

      // ⚠️ 延遲重置旗標
      setTimeout(() => {
        this.isLoadingExistingData = false;
        console.log('🏁 初始化完成，重置旗標');
      }, 1000);
    } else {
      console.log('🆕 新增模式，設定預設值');
      this.tlsBaseService.initializeFormByMode(this.dataForm, 'TLS12040', this.crudstatus);

      if (this.crudstatus === CRUDStatus.Create) {
        this.tlsBaseService.setCurrentUserAsNegotiator(this.dataForm);
      }

      this.triggerAllDynamicValidators();
    }
  }

  // 5. 清除表單時使用（如果需要）
  onClearForm(): void {
    if (confirm('確定要清除所有輸入的資料嗎?此操作無法復原。')) {
      // 保留某些系統欄位
      this.tlsBaseService.resetToDefaults(this.dataForm, 'TLS12040', ['apply_no', 'tlt_no']);

      this.locationInfo = [];
      this.flowService.clearAll();
      this.messageService.infoBubble('表單已清除');
    }
  }


  /**
 *  櫃位欄位變更時的處理
 */
  onLocationFieldChange(event: { fieldName: string, newValue: any, rowData: any }): void {
    const { fieldName, newValue, rowData } = event;

    console.log(' 櫃位欄位變更:', {
      欄位: fieldName,
      新值: newValue,
      行ID: rowData.id
    });

    //  特別處理櫃位編號的重複檢查
    if (fieldName === 'location_no' && newValue) {
      const isDuplicate = this.validateDuplicateLocationNo(newValue, rowData);

      if (isDuplicate) {
        //  發現重複,立即移除這筆資料
        console.log('❌ 發現重複櫃位,準備移除');

        // 延遲一點點確保訊息顯示
        setTimeout(() => {
          this.removeLocationItem(String(rowData.id));
        }, 100);

        return; // 不繼續處理
      }
    }

    //  如果是新增行且有填值,移除空白標記
    if (rowData._isNew && newValue) {
      rowData._isEmpty = false;
      console.log(' 移除空白標記');
    }

    //  任何欄位變更都自動儲存
    this.autoSaveToWorkflow();
  }

  /**
   *  驗證櫃位編號是否重複(即時驗證)
   */
  private validateDuplicateLocationNo(locationNo: string, currentRow: any): boolean {
    if (!locationNo || locationNo.trim() === '') {
      this.clearLocationError(currentRow);
      return false;
    }

    // 檢查是否有其他行使用相同的櫃位編號
    const duplicates = this.locationInfo.filter(item =>
      item.id !== currentRow.id && // 排除自己
      item._status !== 'deleted' && // 排除已刪除的
      item.location_no &&
      item.location_no.trim().toLowerCase() === locationNo.trim().toLowerCase()
    );

    if (duplicates.length > 0) {
      //  發現重複
      currentRow._hasDuplicateError = true;
      currentRow._hasError = true;
      currentRow._errorMessage = `櫃位編號「${locationNo}」已存在`;

      this.messageService.warnBubble(`櫃位編號「${locationNo}」已存在,已自動移除重複項`);

      console.warn('❌ 櫃位編號重複:', {
        當前行: currentRow.id,
        重複編號: locationNo,
        重複數量: duplicates.length
      });

      return true; // 重複
    } else {
      //  沒有重複
      this.clearLocationError(currentRow);
      console.log(' 櫃位編號可用:', locationNo);
      return false; // 不重複
    }
  }

  /**
   * 🧹 清除櫃位錯誤標記
   */
  private clearLocationError(rowData: any): void {
    delete rowData._hasDuplicateError;
    delete rowData._hasError;
    delete rowData._errorMessage;
  }

  /**
   * 🗑️ 焦點失去時自動清理空白新增行
   */
  onLocationCancel(locationInfo: any): void {
    console.log('⬅️ 取消編輯櫃位地點:', locationInfo.location_no);

    //  檢查是否為空白新增行
    const isEmptyNewRow = this.isEmptyLocationRow(locationInfo);

    if (isEmptyNewRow) {
      console.log('🗑️ 偵測到空白新增行,自動移除');

      const index = this.locationInfo.findIndex(item => item.id === locationInfo.id);
      if (index > -1) {
        this.locationInfo.splice(index, 1);
        this.locationInfo = [...this.locationInfo];
        console.log(` 已從索引 ${index} 移除空白櫃位資料`);
      }

      this.messageService.infoBubble('已取消新增櫃位');
      this.cdr.detectChanges();
      return;
    }

    // 📋 清除錯誤標記
    this.clearLocationError(locationInfo);

    console.log(' 取消編輯完成(非空白行)');
  }

  /**
   *  判斷是否為空白櫃位新增行
   */
  private isEmptyLocationRow(locationInfo: any): boolean {
    if (!locationInfo._isNew) {
      return false;
    }

    const keyFields = ['location_no', 'location_name', 'tlt_space'];

    const isEmpty = keyFields.every(field => {
      const value = locationInfo[field];
      return value === null ||
        value === undefined ||
        value === '' ||
        (typeof value === 'string' && value.trim() === '');
    });

    return isEmpty;
  }

  /**
 * 設定當前使用者為洽談者
 */
  private setCurrentUserAsNegotiator(): void {
    const currentUser = this.authService.currentUserValue;

    if (!currentUser) {
      console.warn(' 無法取得當前使用者資訊');
      return;
    }

    console.log('👤 當前使用者資訊:', {
      user_No: currentUser.user_No,
      user_Name: currentUser.user_Name,
      // user_CName: currentUser.user_CName
    });

    // 設定洽談者欄位
    this.dataForm.patchValue({
      contact_USR_No: currentUser.user_No,
      contact_USR_Name: currentUser.user_Name,
      // 如果還需要設定洽談日期為今天
      // contact_Date: new Date()
    });

    // 標記為已觸碰(顯示驗證樣式)
    this.dataForm.get('contact_USR_No')?.markAsTouched();
    this.dataForm.get('contact_USR_Name')?.markAsTouched();

    console.log(' 已自動設定洽談者:', {
      編號: currentUser.user_No,
      姓名: currentUser.user_Name
    });

    // 自動保存
    this.autoSaveToWorkflow();
  }

  private populateFormForReadMode(data: any): void {
    console.log('🔍 Readonly 模式載入資料');

    // 1️⃣ 暫時啟用所有表單控制項
    this.dataForm.enable();
    const dataWithParsedDates = this.parseDateStringsToDates(data);

    const processedData = {
      ...dataWithParsedDates,
      check_typeList: data.check_type
        ? data.check_type.split(',').map((s: string) => s.trim())
        : []
    };

    // 2️⃣ 填充資料 (包含日期欄位)
    this.populateForm(dataWithParsedDates);


    // 3️⃣ 重新禁用表單 (readonly 模式)
    if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
    }

    // 4️⃣ 強制保存到 session
    this.forceSaveToSession();
  }

  /**
 * 🔧 強制保存到 session (即使在 readonly 模式)
 */
  private forceSaveToSession(): void {
    // 暫時移除 viewMode 檢查
    const originalViewMode = this.flowService.isViewMode();
    this.flowService.setViewMode(false);

    // 構建完整資料
    const completeData = {
      ...this.dataForm.getRawValue(), //  使用 getRawValue() 取得 disabled 欄位的值
      locationInfo: this.locationInfo
    };

    console.log('💾 強制保存資料到 session:', {
      tlt_bdate: completeData.tlt_bdate,
      tlt_edate: completeData.tlt_edate,
      日期型別: typeof completeData.tlt_bdate
    });

    // 保存
    this.flowService.setCruData(completeData);

    // 恢復 viewMode
    this.flowService.setViewMode(originalViewMode);
  }

  private parseDateStringsToDates(data: any): any {
    if (!data) return data;

    const dateFields = [
      'tlt_start_date',
      'tlt_end_date',
      'contract_date',
      'tlt_contract_bdate',
      'tlt_contract_edate',
      'tlt_bdate',
      'tlt_edate',
      'apply_date',
      'feedback_date',
      'due_date',
      'contact_Date'

      //  請根據您的 TLS12040DetailModel 補上所有日期欄位
    ];

    const parsedData = { ...data };

    dateFields.forEach(field => {
      const dateString = parsedData[field];
      if (dateString && typeof dateString === 'string') {
        // 移除時間部分，只取日期
        const datePart = dateString.split(/[T\s]/)[0];
        const match = datePart.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
        if (match) {
          parsedData[field] = new Date(
            parseInt(match[1], 10),
            parseInt(match[2], 10) - 1,
            parseInt(match[3], 10)
          );
        }
      }
    });

    return parsedData;
  }

  // ========== 續約功能 ==========

  /**
   * 申請案件內容變更事件
   * 當使用者選擇續約(apply_type = '2')時，需要特殊處理
   */
  onApplyTypeChange(applyType: string): void {
    console.log('📋 申請案件內容變更:', applyType);

    if (applyType === '2') {
      // 續約模式
      console.log('🔄 進入續約模式');
      this.messageService.infoBubble('請選擇廠商統一編號以載入原合約資料');

      // 檢查是否已選擇廠商 (使用 ven_no 作為唯一識別)
      const venNo = this.dataForm.get('ven_no')?.value;
      if (venNo) {
        // 已有廠商，詢問是否載入續約資料
        this.loadRenewalData(venNo);
      }
    } else {
      // 非續約模式，清除續約資料
      this.flowService.clearRenewalData();
      this.lastRenewalVenNo = null; // 重置，允許下次進入續約模式時重新載入
    }
  }

  /**
   * 載入續約資料
   * @param venNo 廠商編號 (唯一值，如 27669188-1)
   */
  private loadRenewalData(venNo: string): void {
    // 防止重複呼叫：如果正在載入則跳過
    if (this.isLoadingRenewalData) {
      console.log('⏳ 續約資料載入中，跳過重複請求');
      return;
    }
    // 如果是相同廠商且已有資料，跳過重複請求
    if (this.lastRenewalVenNo === venNo && this.flowService.getRenewalData()) {
      console.log('✅ 已載入相同廠商的續約資料，跳過重複請求');
      return;
    }

    console.log('🔄 開始載入續約資料，廠商編號:', venNo);

    // 🔥 載入新資料前，先清除舊的續約資料
    this.clearPreviousRenewalData();

    this.isLoadingRenewalData = true;
    this.lastRenewalVenNo = venNo;
    this.loading = true;
    this.tls12040Service.queryContractForRenewal(venNo).subscribe({
      next: (renewalData) => {
        console.log('✅ 續約資料載入成功:', renewalData);

        // 儲存續約資料到 FlowService
        this.flowService.setRenewalData({
          sourceContractId: renewalData.source_talent_id,
          sourceApplyNo: renewalData.source_apply_no,
          sourceContractSubno: renewalData.source_contract_subno,
          nextContractSubno: renewalData.next_contract_subno,
          basicInfo: renewalData.BasicInfo,
          locations: renewalData.Locations,
          fareData: renewalData.FareData,
          chargeData: renewalData.ChargeData,
          commissionData: renewalData.CommissionData
        });

        // 回填基本資料到表單
        this.patchFormForRenewal(renewalData.BasicInfo, renewalData.next_contract_subno);

        // 回填位置資料
        if (renewalData.Locations && renewalData.Locations.length > 0) {
          this.patchLocationForRenewal(renewalData.Locations);
        }

        this.messageService.successBubble(
          `已載入原合約資料（第 ${renewalData.source_contract_subno} 版），將建立第 ${renewalData.next_contract_subno} 版續約`
        );

        this.isLoadingRenewalData = false;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.warn('⚠️ 載入續約資料失敗:', error);
        // 顯示後端回傳的具體錯誤訊息，而非通用訊息
        const errorMessage = error?.message || '查無原合約資料或載入失敗';
        this.messageService.warnBubble(errorMessage);
        this.flowService.clearRenewalData();
        this.lastRenewalVenNo = null; // 重置，允許重新嘗試
        this.isLoadingRenewalData = false;
        this.loading = false;
      }
    });
  }

  /**
   * 清除先前載入的續約資料（在載入新資料前呼叫）
   * 並重設為表單預設值
   */
  private clearPreviousRenewalData(): void {
    console.log('🗑️ 清除先前的續約資料並重設為預設值');

    // 清除 FlowService 中的續約資料
    this.flowService.clearRenewalData();

    // 清除位置資料
    this.locationInfo = [];
    this.displayLocationData = [];

    // 重設表單欄位為預設值（保留廠商資訊）
    // 取得今天日期 (Date 物件，供 Calendar 使用)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 計算回函截止日 (今天 + 15 天)
    const dueDate = new Date();
    dueDate.setHours(0, 0, 0, 0);
    dueDate.setDate(dueDate.getDate() + 15);

    // 取得當前使用者資訊
    const currentUser = this.authService.currentUserValue;

    const defaultValues: Record<string, string | number | string[] | Date> = {
      // 專櫃基本資訊
      tlt_no: '',
      tlt_shortname: '',
      tlt_name: '',
      paper_type: '',
      org_id: '',

      // 業種分類
      bus_type: '',
      bus_class: '',
      bus_sclass: '',

      // 狀態欄位
      approve_status: '1',        // 預設值 '1' (未審核)
      tlt_openflag: '9',          // 預設值 '9' (合約未生效)

      // 商務條件 - 帶入預設值 (依據 tls12040-defaults.constants.ts)
      tlt_term_type: '3',         // 預設值 '3' (一般抽成)
      comm_comp_type: '2',        // 預設值 '2' (除稅)
      tlt_kind: '1',              // 預設值 '1' (正櫃)
      deco_type: '1',             // 預設值 '1' (統設統裝)
      edc_yn: 'Y',                // 預設值 'Y' (是)
      tlt_ctype_mtotal: '',       // 預設值 '' (清空)
      overall_status: '1',        // 預設值 '1' (全部)
      rent_ahead: 'N',            // 預設值 'N'
      rent_period: 0,             // 預設值 0
      base_rent: 0,               // 預設值 0
      deposit: 0,                 // 預設值 0

      // 業務設定 - 帶入預設值 (依據 tls12040-defaults.constants.ts)
      rece_yn: 'Y',               // 預設值 'Y' (是)
      pos_yn: 'Y',                // 預設值 'Y' (是)
      cash_yn: 'N',               // 預設值 'N' (否)
      comm_yn: 'Y',               // 預設值 'Y' (是)
      vip_yn: 'N',                // 預設值 'N' (否)
      money_type: '30',           // 預設值 '30' (月結)
      store_way: '1',             // 預設值 '1' (專櫃)
      check_type: '3',            // 預設值 '3' (網路)
      check_typeList: ['1', '2', '3'],  // 預設值 ['1', '2', '3'] (郵寄、Email、網路)
      paytype: '1',               // 預設值 '1' (匯款)
      credit_card: 0,             // 預設值 0
      total_amt: 0,               // 預設值 0
      total_amt_vendor: 0,        // 預設值 0
      total_amt_unit: 'M',        // 預設值 'M' (月)
      total_amt_vendor_unit: 'M', // 預設值 'M' (月)
      paymentMethods: [],         // 預設值 []

      // 保證金 - 帶入預設值 (依據 tls12040-defaults.constants.ts)
      open_deposit: '',           // 預設值 '' (清空)
      open_fees: 0,               // 預設值 0
      construct_deposit: '',      // 預設值 '' (清空)
      construct_fees: 0,          // 預設值 0
      expiration_deposit: '',     // 預設值 '' (清空)
      expiration_fees: 0,         // 預設值 0

      // 其他設定
      ticket_remarks: '',
      check_day: 0,               // 預設值 0
      invoice_type: '0',          // 預設值 '0' (發票)

      // 聯絡資訊
      email: '',
      invoice_email: '',
      CHECK_TITLE: '',
      store_tel: '',
      bank_id: '',
      vendor_acct_name: '',
      vendor_acct_no: '',
      contact_tel: '',
      contact_fax: '',
      contact_addr: '',
      company_addr: '',

      // 公用事業 - 帶入預設值 (依據 tls12040-defaults.constants.ts)
      water_flag: 'N',            // 預設值 'N' (否)
      electric_flag: 'N',         // 預設值 'N' (否)
      gas_flag: 'N',              // 預設值 'N' (否)

      // 銷售類型 - 帶入預設值 (依據 tls12040-defaults.constants.ts)
      cap_saletype1: 'N',         // 預設值 'N' (否)
      cap_saletype2: 'N',         // 預設值 'N' (否)
      cap_saletype3: 'N',         // 預設值 'N' (否)
      cap_saletype4: 'N',         // 預設值 'N' (否)
      cap_saletype5: 'N',         // 預設值 'N' (否)

      // 備註
      tlt_remark: '',

      // 版次 - 預設值 '1'
      contract_subno: '1',

      // 日期欄位 - 設定預設值
      apply_date: today,          // 申請日期 - 預設今天
      tlt_bdate: today,           // 契約起始日 - 預設今天
      tlt_edate: '',              // 契約截止日 - 清空
      tlt_contract_bdate: today,  // 營運起始日 - 預設今天
      tlt_contract_edate: '',     // 營運截止日 - 清空
      contact_Date: today,        // 洽談日期 - 預設今天
      feedback_date: today,       // 回函日期 - 預設今天
      due_date: dueDate,          // 回函截止日 - 預設今天 + 15 天

      // 洽談者資訊 - 設定當前使用者
      contact_USR_No: currentUser?.user_No || '',
      contact_USR_Name: currentUser?.user_Name || '',
    };

    this.dataForm.patchValue(defaultValues, { emitEvent: false });

    // 清空中分類和小分類選項 (因為大分類被清空了)
    this.busClassOptions = [];
    this.busSClassOptions = [];
  }

  /**
   * 將日期字串轉換為 Date 物件
   * 支援格式: YYYY-MM-DD, YYYY/MM/DD, ISO 格式 (含時間)
   * @param value 日期字串或 Date 物件
   * @returns Date 物件或 null
   */
  private parseDateToDateObject(value: string | Date | null | undefined): Date | null {
    if (!value) return null;

    // 已經是 Date 物件
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }

    if (typeof value !== 'string') return null;

    const dateStr = value.trim();
    if (!dateStr) return null;

    // 移除時間部分 (處理 ISO 格式如 2026-01-26T16:00:00.000Z)
    const datePart = dateStr.split(/[T\s]/)[0];

    // 嘗試 YYYY-MM-DD 或 YYYY/MM/DD 格式
    const match = datePart.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // JavaScript 月份從 0 開始
      const day = parseInt(match[3], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return null;
  }

  /**
   * 將續約基本資料回填到表單
   */
  private patchFormForRenewal(basicInfo: RenewalBasicInfo, nextContractSubno: number): void {
    console.log('📝 回填續約基本資料');

    // 需要從原合約帶入的欄位（不包含 ID 類欄位）
    const renewalFields = {
      // 專櫃基本資訊
      tlt_no: basicInfo.tlt_no,
      tlt_shortname: basicInfo.tlt_shortname,
      tlt_name: basicInfo.tlt_name,
      paper_type: basicInfo.paper_type,
      org_id: basicInfo.org_id,

      // 業種分類
      bus_type: basicInfo.bus_type,
      bus_class: basicInfo.bus_class,
      bus_sclass: basicInfo.bus_sclass,

      // 商務條件
      tlt_term_type: basicInfo.tlt_term_type,
      comm_comp_type: basicInfo.comm_comp_type,
      tlt_kind: basicInfo.tlt_kind,
      deco_type: basicInfo.deco_type,
      edc_yn: basicInfo.edc_yn,
      tlt_ctype_mtotal: basicInfo.tlt_ctype_mtotal,
      overall_status: basicInfo.overall_status,
      rent_ahead: basicInfo.rent_ahead,
      rent_period: basicInfo.rent_period,
      base_rent: basicInfo.base_rent,
      deposit: basicInfo.deposit,

      // 業務設定
      rece_yn: basicInfo.rece_yn,
      pos_yn: basicInfo.pos_yn,
      cash_yn: basicInfo.cash_yn,
      comm_yn: basicInfo.comm_yn,
      money_type: basicInfo.money_type,
      store_way: basicInfo.store_way,
      check_type: basicInfo.check_type,
      paytype: basicInfo.paytype,
      vip_yn: basicInfo.vip_yn,
      credit_card: basicInfo.credit_card,
      total_amt: basicInfo.total_amt,
      total_amt_vendor: basicInfo.total_amt_vendor,
      total_amt_unit: basicInfo.total_amt_unit,
      total_amt_vendor_unit: basicInfo.total_amt_vendor_unit,

      // 保證金
      open_deposit: basicInfo.open_deposit,
      open_fees: basicInfo.open_fees,
      construct_deposit: basicInfo.construct_deposit,
      construct_fees: basicInfo.construct_fees,
      expiration_deposit: basicInfo.expiration_deposit,
      expiration_fees: basicInfo.expiration_fees,

      // 其他設定
      ticket_remarks: basicInfo.ticket_remarks,
      check_day: basicInfo.check_day,
      invoice_type: basicInfo.invoice_type,

      // 聯絡資訊
      email: basicInfo.email,
      invoice_email: basicInfo.invoice_email,
      CHECK_TITLE: basicInfo.CHECK_TITLE,
      store_tel: basicInfo.store_tel,
      bank_id: basicInfo.bank_id,
      vendor_acct_name: basicInfo.vendor_acct_name,
      vendor_acct_no: basicInfo.vendor_acct_no,
      contact_tel: basicInfo.contact_tel,
      contact_fax: basicInfo.contact_fax,
      contact_addr: basicInfo.contact_addr,

      // 公用事業
      water_flag: basicInfo.water_flag,
      electric_flag: basicInfo.electric_flag,
      gas_flag: basicInfo.gas_flag,

      // 銷售類型
      cap_saletype1: basicInfo.cap_saletype1,
      cap_saletype2: basicInfo.cap_saletype2,
      cap_saletype3: basicInfo.cap_saletype3,
      cap_saletype4: basicInfo.cap_saletype4,
      cap_saletype5: basicInfo.cap_saletype5,

      // 備註
      tlt_remark: basicInfo.tlt_remark,

      // 更新版次（新的版次號）
      contract_subno: nextContractSubno.toString(),

      // 處理 check_typeList（對帳方式多選）
      check_typeList: basicInfo.check_type ? basicInfo.check_type.split(',').map((s: string) => s.trim()) : []
    };

    // 設定旗標避免觸發不必要的監聽
    this.isLoadingExistingData = true;

    // 回填表單
    this.dataForm.patchValue(renewalFields, { emitEvent: false });

    // 載入分類選項
    if (basicInfo.bus_type) {
      this.loadDependentDropdowns(basicInfo as unknown as TLS12040DetailModel);
    }

    // 延遲重置旗標
    setTimeout(() => {
      this.isLoadingExistingData = false;
    }, 500);
  }

  /**
   * 將續約位置資料回填到 locationInfo
   */
  private patchLocationForRenewal(locations: RenewalLocationInfo[]): void {
    console.log('📍 回填續約位置資料:', locations.length, '筆');

    // 將原合約位置轉換為新的位置資料（移除 ID，標記為新增）
    this.locationInfo = locations.map((loc) => ({
      id: this.generateTempId(),
      apply_no: '', // 新合約，尚無 apply_no
      location_no: loc.location_no,
      tlt_building: loc.tlt_building,
      tlt_floor: loc.tlt_floor,
      area_no: loc.area_no,
      tlt_space: loc.tlt_space,
      building_desc: loc.building_desc,
      floor_desc: loc.floor_desc,
      area_desc: loc.area_desc,
      _status: 'new' as const,
      _isNew: true,
      _isEmpty: false
    }));

    this.updateDisplayLocationData();
  }

  /**
   * 檢查是否為續約模式
   */
  isRenewalMode(): boolean {
    return this.dataForm.get('apply_type')?.value === '2' && this.flowService.isRenewalMode();
  }
}
