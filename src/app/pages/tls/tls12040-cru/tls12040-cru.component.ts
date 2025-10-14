
// --Commonly used imports--
import { ChangeDetectorRef, Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '../../../shared/service/validation.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CheckboxModule } from 'primeng/checkbox';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { NgFor, NgIf } from '@angular/common';

import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';

import { InputTextareaComponent } from "@shared/componentkit/input-textarea/input-textarea.component";
import { AccordionModule } from "primeng/accordion";
import { ColumnDef, ExpandableEditTableComponent } from "@shared/componentkit/expandable-edit-table/expandable-edit-table.component";
import { RadiobuttonComponent } from "@shared/componentkit/radiobutton/radiobutton.component";
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { SharedDropdownService } from '@shared/services/shared-dropdown.service';
import { debounceTime, forkJoin, Observable, Subscription } from 'rxjs';
import { TLS12040Service } from '@service/api/tls/tls12040.service';
import { LocationDetails, TLS12040DetailModel, TLS12040RequestModel, Tls12040SelectorTableColumn } from './models/tls12040-cru.model';
import { TLS12040Response } from '../tls12040/tls12040.component';
import { BusinessClassificationService } from './services/business-classification.service';
import { TLS12040FlowService } from '../tls12040/Workflow/tls12040-contract-flow.service';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS12040ValidationService } from './validation/tls12040-validation.service';
import { DateValidationService } from '../tls13010-cru/validation/date-validation.service';
import { EmailValidationService } from '../tls13010-cru/validation/email-validation.service';
import { VendorCategoryOptionsService } from '@service/api/dropdownservice/vendor-category-options.service';
import { CrudModeService } from '../tls12040/Workflow/crud-mode.service';
import { DropdownOption } from '@shared/constants/business.constants';
import { TLS12040FormInitService } from './services/tls12040-form-init.service';

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
  locationData: LocationDetails[] = [];
  displayLocationData: LocationDetails[] = [];
  private subscriptions: Subscription[] = [];

  locationColumns: ColumnDef[] = [
    {
      field: 'location_no',
      header: '位置編號',
      type: 'selector-panel',  // 改用 selector-panel
      editable: true,
      directEdit: true,
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

  //寫死用getter API 用附值
  get decorationOptions() { return this.sharedDropdownService.decorationOptions; }  // 裝潢方式

  get moneyTypeOptions() { return this.sharedDropdownService.moneyTypeOptions; }  // 結帳方式

  get checkTypeOptions() { return this.sharedDropdownService.checkTypeOptions; }  // 對帳方式

  get storeWayOptions() { return this.sharedDropdownService.storeWayOptions; }  // 抽成別

  get paytypeOptions() { return this.sharedDropdownService.paytypeOptions; }  // 抽成別

  get invoiceTypeOptions() { return this.sharedDropdownService.invoiceTypeOptions; }  // 抽成別

  get tltKindOptions() { return this.sharedDropdownService.tltKindOptions; }  // 抽成別

  get tltopenflagOption() { return this.sharedDropdownService.openflagOptions; }  // 抽成別

  get commCompTypeDropdown() { return this.sharedDropdownService.commCompTypeOptions; }

  get approveStatusOptions() { return this.sharedDropdownService.approveStatusOptions; }

  get yesNoOptions() { return this.sharedDropdownService.yesNoOptions; }

  get tltTermTypeOptions() { return this.sharedDropdownService.tltTermTypeOptions; }

  get tltctypemtotalOptions() { return this.sharedDropdownService.tltctypemtotalOptions; }  // 包底類別

  get totalAmtOptions() { return this.sharedDropdownService.totalAmtOptions; }  // 目標營業額單位(廠商)

  get totalAmtVendorOptions() { return this.sharedDropdownService.totalAmtVendorOptions; }  // 目標營業額單位(業主)

  get depositPaymentOptions() { return this.sharedDropdownService.depositPaymentOptions; }  // 保證金

  get overallStatusOptions() { return this.sharedDropdownService.overallStatusOptions; }

  get applyTypeOptions() { return this.sharedDropdownService.applyTypeOptions; }

  get contractTypeOptions() { return this.sharedDropdownService.contractTypeOptions; }

  get applyStatusOptions() { return this.sharedDropdownService.applyStatusOptions; }
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
    talent_id: [''], // 必填但系統自動給號
    apply_no: [''], // 必填但系統自動給號
    apply_type: [''],
    apply_date: [''],
    apply_status: [''],
    contract_type: [''],
    approve_status: ['1', [Validators.required]], // 必填，預設未審核
    tlt_name: ['', [Validators.required, Validators.maxLength(100)]], // 必填
    tlt_no: [''], // 必填但系統自動給號
    ven_no: ['', [Validators.required, Validators.maxLength(16)]],
    ven_uniform: ['', [Validators.required, Validators.maxLength(10)]], // 必填
    VEN_Name: [''], // 必填但自動帶入
    paper_type: ['', [Validators.maxLength(2)]],
    bus_type: ['', [Validators.required, Validators.maxLength(2)]], // 必填
    bus_class: ['', [Validators.required, Validators.maxLength(2)]], // 必填
    bus_sclass: ['', [Validators.maxLength(2)]],
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
    private formInitService: TLS12040FormInitService,
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
    public crudModeService: CrudModeService

  ) { super(); }

  ngOnInit() {
    this.initializePage('TLS12040', this.dataForm, { useReadonly: true });
    this.handleRouterState();
    this.initializeFormDefaults();
    this.setupVendorUniformListener();
    //  調試當前狀態
    console.log('=== CRU 狀態調試 ===');
    console.log('當前 CRUD 狀態:', this.crudstatus);
    console.log('表單標題:', this.formTitle);
    console.log('表單是否禁用:', this.dataForm.disabled);
    this.setupDynamicValidators();
    // 先保護現有資料
    const existingData = this.flowService.getCruData() as any;

    // 先初始化下拉選項
    this.initializeDropdownOptions();

    // 如果之前有資料，確保不被覆蓋
    if (existingData && Object.keys(existingData).length > 0) {
      console.log(' 使用暫存資料，跳過 API 載入');

      // 直接載入暫存資料（包含分類）
      this.loadCachedDataWithClassifications(existingData);

      // ⚠️ 關鍵：延遲載入 selector panel 選項（背景執行）
      setTimeout(() => {
        this.updateSelectorPanelOptions();
      }, 100);

    } else {
      console.log(' 首次載入，需要打 API');
      // 首次載入才打 API
      this.initializeDropdownOptions();
    }
  }

  private loadCachedDataWithClassifications(cruData: any): void {
    console.log('📄 開始載入暫存表單資料（含分類處理）');

    // 先載入基本資料（不包括分類）
    const basicData = { ...cruData };
    delete basicData.bus_type;
    delete basicData.bus_class;
    delete basicData.bus_sclass;
    delete basicData.locationData;

    this.dataForm.patchValue(basicData);

    // 處理位置資料
    if (cruData.locationData) {
      this.locationData = cruData.locationData;
      this.updateDisplayLocationData();
    }

    // 關鍵修正：確保分類按正確順序載入
    if (cruData.bus_type) {
      this.loadClassificationChain(cruData);
    } else {
      // 沒有分類資料時，直接重新保存
      this.flowService.setCruData({
        ...cruData,
        ...this.dataForm.value,
        locationData: this.locationData
      });
    }
  }

  // 🔥 新增方法：按順序載入分類鏈
  private loadClassificationChain(cruData: any): void {
    console.log('🏷️ 開始載入分類鏈:', {
      bus_type: cruData.bus_type,
      bus_class: cruData.bus_class,
      bus_sclass: cruData.bus_sclass
    });

    // 1. 設定大分類
    this.dataForm.patchValue({ bus_type: cruData.bus_type });

    // 2. 載入中分類選項
    this.businessClassificationService.getBusClassOptions(cruData.bus_type).subscribe({
      next: (busClassOptions) => {
        this.busClassOptions = busClassOptions;
        console.log(' 中分類選項載入完成:', busClassOptions.length);

        // 3. 如果有中分類值，設定並載入小分類
        if (cruData.bus_class) {
          this.dataForm.patchValue({ bus_class: cruData.bus_class });

          // 4. 載入小分類選項
          this.businessClassificationService.getBusSClassOptions(cruData.bus_type, cruData.bus_class).subscribe({
            next: (busSClassOptions) => {
              this.busSClassOptions = busSClassOptions;
              console.log(' 小分類選項載入完成:', busSClassOptions.length);

              // 5. 如果有小分類值，設定
              if (cruData.bus_sclass) {
                this.dataForm.patchValue({ bus_sclass: cruData.bus_sclass });
              }

              // 6. 所有分類載入完成後，重新保存
              this.saveCompleteDataToFlow(cruData);
            },
            error: (error) => {
              console.error('❌ 載入小分類失敗:', error);
              // 即使失敗也要保存其他資料
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
        // 即使失敗也要保存其他資料
        this.saveCompleteDataToFlow(cruData);
      }
    });
  }

  // 🔥 新增方法：保存完整資料到流程
  private saveCompleteDataToFlow(originalData: any): void {
    const completeData = {
      ...originalData,
      ...this.dataForm.value,
      locationData: this.locationData
    };

    this.flowService.setCruData(completeData);
    console.log(' 完整資料已保存到流程');
  }


  private handleRouterState(): void {
    const state = this.router.lastSuccessfulNavigation?.extras?.state;

    // 先檢查是否已經有工作流程在進行
    const currentState = this.flowService.getCurrentState();
    const hasExistingFlow = currentState.contractId && currentState.contractId !== '';

    console.log('=== 路由狀態處理開始 ===');
    console.log('路由狀態:', state);
    console.log('是否有現有流程:', hasExistingFlow);

    if (state) {
      const rowdata = state['rowdata'] as TLS12040Response;
      const crudstatus = state['crudstatus'] as CRUDStatus;

      console.log('接收到的狀態:', { crudstatus, rowdata });

      if (rowdata && (rowdata.id || rowdata.apply_no)) {
        // 設定 CRUD 狀態和標題
        this.crudstatus = crudstatus;
        this.formTitle = this.getFormTitle(crudstatus);
        this.crudModeService.setCrudStatus(this.crudstatus);
        console.log('設定 CRUD 狀態:', this.crudstatus);
        console.log('表單標題:', this.formTitle);

        // 工作流程處理：只在沒有現有流程時才初始化新流程
        if (!hasExistingFlow) {
          console.log('初始化新的工作流程');
          this.flowService.startFlow({
            applyNo: rowdata.apply_no,
            isNewContract: crudstatus === CRUDStatus.Create
          }, rowdata);
        } else {
          console.log('使用現有工作流程，跳過重新初始化');
        }

        // 載入詳細資料
        this.loadContractDetail(rowdata);
      } else {
        // 沒有 rowdata，但有路由狀態 - 通常是新增模式
        this.crudstatus = CRUDStatus.Create;
        this.formTitle = '新增專櫃要約書';
        console.log('無 rowdata，設定為新增模式');

        if (!hasExistingFlow) {
          this.flowService.startFlow({
            applyNo: '',
            isNewContract: true
          });
          console.log('初始化空流程（新增模式）');
        }
      }
    } else {
      // 沒有路由狀態 - 直接訪問頁面，預設為新增模式
      this.crudstatus = CRUDStatus.Create;
      this.formTitle = '新增專櫃要約書';
      console.log('無路由狀態，預設新增模式');

      if (!hasExistingFlow) {
        this.flowService.startFlow({
          applyNo: '',
          isNewContract: true
        });
        console.log('預設初始化空流程');
      }
    }

    console.log('=== 路由狀態處理完成 ===');
    console.log('最終 CRUD 狀態:', this.crudstatus);
    console.log('最終表單標題:', this.formTitle);
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
    console.log('⚠️ 處理載入錯誤');

    // 3秒後返回列表頁面
    setTimeout(() => {
      this.router.navigate(['account/tls/tls12040']);
    }, 3000);
  }

  private loadContractDetail(rowData: TLS12040Response): void {
    console.log(' 開始載入合約詳細資料:', rowData);
    this.loading = true;

    const request: TLS12040RequestModel = {
      id: rowData.id,
      apply_no: rowData.apply_no
    };

    if (!this.tls12040Service) {
      console.error('❌ tls12040Service 未正確注入!');
      this.messageService.errorBubble('服務未正確初始化');
      this.loading = false;
      return;
    }

    this.tls12040Service.queryTLS12040Detail(request).subscribe({
      next: (response: any) => {
        if (response && response.Status === '0000' && response.Data) {
          console.log(' API 回應:', response.Data);
          console.log('📍 LocationDetails:', response.Data.LocationDetails);
          this.populateForm(response.Data);
          this.loadLocationData(response.Data.LocationDetails || []); // 使用 LocationDetails
          this.loadDependentDropdowns(response.Data);
          console.log(' 合約資料載入完成');
        } else {
          const errorMessage = response?.Message || '未知錯誤';
          console.error('❌ API 返回錯誤:', errorMessage);
          this.messageService.errorBubble(`載入資料失敗：${errorMessage}`);
          this.handleLoadError();
        }
      },
      error: (error) => {
        console.error('❌ API 請求錯誤:', error);
        this.messageService.errorBubble('載入資料失敗');
        this.handleLoadError();
      },
      complete: () => {
        this.loading = false;
        console.log('🏁 API 請求完成');
      }
    });
  }



  private loadDependentDropdowns(data: TLS12040DetailModel): void {
    if (data.bus_type) {
      this.onBusTypeChange(data.bus_type);  // 大分類變更邏輯（會清空中小分類，這在 load 時是OK的，因為我們會重新載入）
      if (data.bus_class) {
        this.businessClassificationService.getBusClassOptions(data.bus_type).subscribe({
          next: (options) => {
            this.busClassOptions = options;
            this.dataForm.patchValue({ bus_class: data.bus_class });
            if (data.bus_sclass) {
              // 直接載入小分類，不要呼叫 onBusClassChange（避免清空）
              this.businessClassificationService.getBusSClassOptions(data.bus_type, data.bus_class).subscribe({
                next: (sOptions) => {
                  this.busSClassOptions = sOptions;
                  this.dataForm.patchValue({ bus_sclass: data.bus_sclass });
                },
                error: (error) => {
                  console.error('載入小分類失敗:', error);
                  // this.notificationService.errorBubble('載入小分類失敗');
                }
              });
            }
          },
          error: (error) => {
            console.error('載入中分類失敗:', error);
            // this.notificationService.errorBubble('載入中分類失敗');
          }
        });
      }
    }
  }

  private populateForm(data: TLS12040DetailModel): void {
    // 基本資訊
    this.dataForm.patchValue({
      talent_id: data.talent_id,
      apply_no: data.apply_no,
      tlt_no: data.tlt_no,
      tlt_name: data.tlt_name,
      ven_uniform: data.ven_uniform,
      ven_no: data.ven_no,
      VEN_Name: data.VEN_Name,
      contract_subno: data.contract_subno,
      approve_status: data.approve_status,
      apply_type: data.apply_type,
      apply_date: data.apply_date,
      apply_status: data.apply_status,
      contract_type: data.contract_type,
      // 日期欄位
      tlt_bdate: data.tlt_bdate,
      tlt_edate: data.tlt_edate,
      tlt_contract_bdate: data.tlt_contract_bdate,
      tlt_contract_edate: data.tlt_contract_edate,
      feedback_date: data.feedback_date,
      due_date: data.due_date,
      contact_Date: data.contact_Date,

      // 分類與商務條件
      tlt_term_type: data.tlt_term_type.trim(), // 去除前後空格 char(2)型別會自動產生
      comm_comp_type: data.comm_comp_type,
      paper_type: data.paper_type,
      bus_type: data.bus_type,
      bus_class: data.bus_class,
      bus_sclass: data.bus_sclass,

      // 組織與人員
      org_id: data.org_id,
      contact_USR_No: data.contact_USR_No,
      contact_USR_Name: data.contact_USR_Name,

      // 其他條件
      deco_type: data.deco_type,
      money_type: data.money_type,
      check_typeList: data.check_typeList || [],
      edc_yn: data.edc_yn,
      tlt_openflag: data.tlt_openflag,
      comm_yn: data.comm_yn,
      rece_yn: data.rece_yn,
      pos_yn: data.pos_yn,
      cash_yn: data.cash_yn,
      store_way: data.store_way,
      paytype: data.paytype,
      vip_yn: data.vip_yn,

      // 費用相關
      base_rent: data.base_rent,
      deposit: data.deposit,
      credit_card: data.credit_card,
      check_day: data.check_day,
      open_fees: data.open_fees,
      total_amt: data.total_amt,
      total_amt_vendor: data.total_amt_vendor,
      construct_deposit: data.construct_deposit,
      construct_fees: data.construct_fees,
      expiration_deposit: data.expiration_deposit,
      expiration_fees: data.expiration_fees,
      open_deposit: data.open_deposit,

      // 其他設定
      invoice_type: data.invoice_type,
      tlt_kind: data.tlt_kind,
      tlt_ctype_mtotal: data.tlt_ctype_mtotal,
      overall_status: data.overall_status,
      rent_ahead: data.rent_ahead,
      rent_period: data.rent_period,
      water_flag: data.water_flag,
      electric_flag: data.electric_flag,
      gas_flag: data.gas_flag,

      // 聯絡資訊
      email: data.email,
      invoice_email: data.invoice_email,
      CHECK_TITLE: data.CHECK_TITLE,
      store_tel: data.store_tel,
      bank_id: data.bank_id,
      vendor_acct_name: data.vendor_acct_name,
      vendor_acct_no: data.vendor_acct_no,
      contact_tel: data.contact_tel,
      contact_fax: data.contact_fax,
      contact_addr: data.contact_addr,
      tlt_remark: data.tlt_remark,
      ticket_remarks: data.ticket_remarks,
      total_amt_unit: data.total_amt_unit,
      total_amt_vendor_unit: data.total_amt_vendor_unit,
      VEN_Address: data.VEN_Address,

      // 狀態欄位
      cap_saletype1: data.cap_saletype1,
      cap_saletype2: data.cap_saletype2,
      cap_saletype3: data.cap_saletype3,
      cap_saletype4: data.cap_saletype4,
      cap_saletype5: data.cap_saletype5,

    });

    // 處理位置資訊（如果需要的話）
    this.loadLocationData(data.locationInfo);
  }

  private loadLocationData(locationDetails: any[]): void {
    if (!locationDetails || !Array.isArray(locationDetails)) {
      console.warn('⚠️ LocationDetails 為空或格式不正確:', locationDetails);
      this.locationData = [];
      this.updateDisplayLocationData();
      return;
    }

    this.locationData = locationDetails.map(item => ({
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
    console.log('📍 位置資料已載入:', this.locationData);
  }

  private initializeDropdownOptions() {
    // 固定選項不需要任何處理，直接通過 getter 使用
    // API 選項需要載入
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

  // 大分類變更時載入中分類（需要屬性方式）
  onBusTypeChange(busType: string) {
    this.busClassOptions = [];  // 清空中分類
    this.busSClassOptions = [];  // 清空小分類（級聯清空）

    if (!busType) return;

    this.businessClassificationService.getBusClassOptions(busType).subscribe(options => {
      this.busClassOptions = options;
    });
  }

  onBusClassChange(busClass: string) {
    const busType = this.dataForm.get('bus_type')?.value;
    this.busSClassOptions = [];  // 清空小分類

    if (!busType || !busClass) return;

    this.businessClassificationService.getBusSClassOptions(busType, busClass).subscribe(options => {
      this.busSClassOptions = options;
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
      this.router.navigate(['account/tls/tls12040'], extras);
      this.messageService.infoBubble('已退出檢視模式');
      return;
    }

    // 編輯模式：暫存包含位置資料
    if (this.dataForm.dirty || this.hasLocationChanges()) {
      const completeData = {
        ...this.dataForm.value,
        locationData: this.locationData  // 包含位置資料
      };
      this.flowService.setCruData(completeData);
    }
    this.flowService.clearAll();
    this.router.navigate(['account/tls/tls12040'], extras);

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
      locationData: this.locationData  // 加入位置資料
    };

    // 保存表單資料到 cru 步驟
    const isSaved = this.flowService.setCruData(completeData);
    if (isSaved) {
      this.messageService.successBubble('資料已暫存，可以進入下一步');
      // 導航到下一步（如果需要）
      this.router.navigate(['account/tls/tls12040next1']);
    } else {
      this.messageService.errorBubble('資料儲存失敗，請重試');
    }
  }

  onSubmitNext(): void {
    // 確保表單有效性
    if (this.dataForm.invalid) {
      this.messageService.warnBubble('請檢查必填欄位');
      this.markFormGroupTouched(this.dataForm);
      return;
    }

    const completeData = {
      ...this.dataForm.value,
      locationData: this.locationData
    };

    // 保存到工作流程
    const saveResult = this.flowService.setCruData(completeData);

    if (!saveResult) {
      this.messageService.errorBubble('資料儲存失敗，請重試');
      return;
    }

    // 確保狀態正確傳遞
    const navigationExtras: NavigationExtras = {
      state: {
        crudstatus: this.crudstatus, // 確保這個值是正確的
        fromRoute: this.router.url,
        // 添加額外的標識
        fromCRU: true,
        applyNo: this.dataForm.get('apply_no')?.value || ''
      }
    };

    console.log('🚀 CRU 導航到 Next1，傳遞狀態:', navigationExtras.state);

    this.router.navigate(['account/tls/tls12040next1'], navigationExtras);
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
    return this.locationData.filter(item => item._status !== 'deleted');
  }


  searchLocationOptions(searchParams: any): Observable<any[]> {
    console.log(' CRU 收到搜尋參數:', searchParams);

    // 轉換 SortBy 的欄位名稱
    if (searchParams.SortBy && Array.isArray(searchParams.SortBy)) {
      searchParams.SortBy = searchParams.SortBy.map((sort: any) => ({
        field: sort.field === 'value' ? 'location_no' : sort.field,  // 轉換欄位名
        order: 1  // 固定為升序，或保持原值 sort.order
      }));
    }

    console.log(' 轉換後參數:', searchParams);

    return this.locationOptionsService.getLocationWithDetailsOptions(searchParams);
  }

  private generateTempId(): string {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  private updateDisplayLocationData(): void {
    this.displayLocationData = this.locationData.filter(item => item._status !== 'deleted');
  }

  /**
   *  改良版 - 新增櫃位地點項目(防止重複新增空白行)
   */
  onAddLocationItem(): void {
    console.log('🆕 準備新增櫃位地點項目');

    // 🚨 檢查是否已有未填寫的新增行
    const hasEmptyNewRow = this.locationData.some(item =>
      item._isNew &&
      item._isEmpty &&
      !item.location_no
    );

    if (hasEmptyNewRow) {
      this.messageService.warnBubble('請先完成目前新增的櫃位資料後再新增下一筆');
      console.log('❌ 阻止新增:已有未填寫的新增行');
      return;
    }

    // ✅ 沒有未填寫的行,允許新增
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

    this.locationData = [...this.locationData, newLocationItem];

    console.log('✅ 櫃位地點項目新增成功:', {
      新增ID: newId,
      當前資料數量: this.locationData.length
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
    const oldLength = this.locationData.length;

    //  處理資料
    this.locationData = this.locationData
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
    return this.locationData
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
    // this.saveToWorkflow();
    this.messageService.successBubble('位置資料已儲存');

    console.log('💾 儲存後狀態:', {
      總數: this.locationData.length,
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
      // 🔥 關鍵：先檢查是否重複（在更新資料之前）
      const isDuplicate = this.isLocationNoDuplicate(newValue, rowData.id);

      if (isDuplicate) {
        console.log('❌ 發現重複位置，阻止選擇');

        // 🔥 重點1：立即阻止並清空
        rowData.location_no = '';

        // 🔥 重點2：如果是新增的空行，直接移除
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

      // ✅ 沒有重複，正常處理
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
    const targetIndex = this.locationData.findIndex(item => item.id === rowData.id);

    if (targetIndex === -1) {
      console.error('❌ 找不到對應項目:', rowData.id);
      return;
    }

    // 從 selectedOption 取得所有需要的資料
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

    // 更新資料
    const currentStatus = this.locationData[targetIndex]._status;
    const newStatus = currentStatus === 'new' ? 'new' : 'modified';

    this.locationData[targetIndex] = {
      ...this.locationData[targetIndex],
      ...locationData,
      _status: newStatus
    };

    // 同步更新 rowData（讓表格立即顯示）
    Object.assign(rowData, this.locationData[targetIndex]);

    // 觸發變更檢測
    this.locationData = [...this.locationData];
    this.updateDisplayLocationData();

    // this.messageService.infoBubble(`已選擇位置：${locationData.location_no}（${locationData.building_desc}）`);
  }

  private removeLocationItem(itemId: string): void {
    console.log('🗑️ 開始移除櫃位項目:', itemId);

    const beforeLength = this.locationData.length;

    // 從陣列中移除
    this.locationData = this.locationData.filter(item => item.id !== itemId);

    const afterLength = this.locationData.length;

    console.log('📊 移除結果:', {
      移除前數量: beforeLength,
      移除後數量: afterLength,
      是否成功: beforeLength > afterLength
    });

    // 更新顯示資料
    this.updateDisplayLocationData();

    // 強制觸發變更檢測
    this.locationData = [...this.locationData];

    // 儲存到工作流程
    this.autoSaveToWorkflow();

    console.log('✅ 櫃位項目移除完成');
  }

  private isLocationNoDuplicate(locationNo: string, currentId: string): boolean {
    if (!locationNo || !locationNo.trim()) {
      return false;
    }

    const trimmedLocationNo = locationNo.trim();

    // 檢查是否有其他行使用相同的位置編號
    const hasDuplicate = this.locationData.some(item =>
      item.id !== currentId &&              // 排除自己
      item._status !== 'deleted' &&         // 排除已刪除
      item.location_no?.trim() === trimmedLocationNo
    );

    console.log('🔍 重複檢查:', {
      檢查位置: trimmedLocationNo,
      當前ID: currentId,
      是否重複: hasDuplicate,
      現有位置: this.locationData
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
    if (this.dataForm.dirty || this.hasLocationChanges()) {
      const completeData = {
        ...this.dataForm.value,
        locationData: this.locationData
      };

      this.flowService.setCruData(completeData);
      console.log(' 已自動暫存資料');
    }
  }

  private hasLocationChanges(): boolean {
    // 檢查位置資料是否有異動
    return this.locationData.some(item =>
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
    const fieldNames: { [key: string]: string } = {
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

    // 設定保證金付款方式變更監聽
    ['open_deposit', 'construct_deposit', 'expiration_deposit'].forEach(fieldName => {
      this.dataForm.get(fieldName)?.valueChanges.subscribe(() => {
        this.validationService.updateDepositValidators(this.dataForm);
      });
    });

    // 初始驗證器設定
    this.validationService.updateAllValidators(this.dataForm);
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

  private setupVendorUniformListener(): void {
    const venUniformSubscription = this.dataForm.get('ven_uniform')?.valueChanges.subscribe(venUniform => {
      if (venUniform && venUniform.trim()) {
        this.loadVendorInfo(venUniform);
      } else {
        // 清空相關欄位
        this.dataForm.patchValue({
          VEN_Name: '',
          ven_no: ''
        });
      }
    });

    if (venUniformSubscription) this.subscriptions.push(venUniformSubscription);
  }

  private loadVendorInfo(venUniform: string): void {
    this.loading = true;

    this.vendorCategoryService.getVendorCategoryNoNameOptions("1").subscribe({
      next: (vendors: any[]) => {
        const matchedVendor = vendors.find((vendor: { value: string; }) => vendor.value === venUniform);

        if (matchedVendor) {
          // 更新廠商編號、廠商名稱和公司地址
          this.dataForm.patchValue({
            ven_no: matchedVendor.ven_no || '',
            VEN_Name: matchedVendor.Name || matchedVendor.label || '',
            VEN_Address: matchedVendor.VEN_Address || ''
          });

          // 立即標記為已觸碰，不需要延遲
          this.dataForm.get('ven_no')?.markAsTouched();
          this.dataForm.get('VEN_Name')?.markAsTouched();
          this.dataForm.get('VEN_Address')?.markAsTouched();

          this.messageService.successBubble('已自動填入廠商編號、廠商名稱和公司登記地址');
          console.log(' 自動填入廠商資料:', matchedVendor);

          // 立即儲存
          this.autoSaveToWorkflow();
        } else {
          this.messageService.warnBubble('查無此廠商統一編號對應的資料');
          this.dataForm.patchValue({
            ven_no: '',
            VEN_Name: '',
            VEN_Address: ''
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ 查詢廠商資訊失敗:', error);
        this.messageService.errorBubble('查詢廠商資訊失敗，請檢查統一編號是否正確');
        this.dataForm.patchValue({
          ven_no: '',
          VEN_Name: '',
          VEN_Address: ''
        });
        this.loading = false;
      }
    });
  }

  //利用 Service 快取同步載入分類
  private loadClassificationChainSync(cruData: any): void {
    console.log('🏷️ 同步載入分類鏈（使用快取）');

    // 1. 設定大分類
    this.dataForm.patchValue({ bus_type: cruData.bus_type });

    // 2. 同時請求中分類和小分類（平行處理）
    const requests = [
      this.businessClassificationService.getBusClassOptions(cruData.bus_type)
    ];

    if (cruData.bus_class) {
      requests.push(
        this.businessClassificationService.getBusSClassOptions(
          cruData.bus_type,
          cruData.bus_class
        )
      );
    }

    //  使用 forkJoin 平行處理
    forkJoin(requests).subscribe({
      next: ([busClassOptions, busSClassOptions]) => {
        this.busClassOptions = busClassOptions;

        if (cruData.bus_class) {
          this.dataForm.patchValue({ bus_class: cruData.bus_class });
        }

        if (busSClassOptions) {
          this.busSClassOptions = busSClassOptions;
          if (cruData.bus_sclass) {
            this.dataForm.patchValue({ bus_sclass: cruData.bus_sclass });
          }
        }

        this.saveCompleteDataToFlow(cruData);
      },
      error: (error) => {
        console.error('❌ 載入分類失敗:', error);
        this.saveCompleteDataToFlow(cruData);
      }
    });
  }

  // 3. 初始化預設值的方法
  private initializeFormDefaults(): void {
    const existingData = this.flowService.getCruData() as any;

    if (existingData && Object.keys(existingData).length > 0) {
      console.log(' 使用暫存資料，跳過預設值設定');
      this.loadCachedDataWithClassifications(existingData);
    } else {
      console.log('🆕 新增模式，設定預設值');
      this.formInitService.initializeByMode(this.dataForm, this.crudstatus);

      // 立即觸發驗證器
      this.triggerAllDynamicValidators();
    }
  }

  // 4. 監聽抽成別變更，自動更新相關預設值
  private setupTermTypeListener(): void {
    this.dataForm.get('tlt_term_type')?.valueChanges.subscribe(termType => {
      if (termType && this.crudstatus === CRUDStatus.Create) {
        // 只在新增模式下自動更新
        this.formInitService.updateDefaultsByTermType(this.dataForm, termType);
      }
    });
  }

  // 5. 清除表單時使用（如果需要）
  onClearForm(): void {
    if (confirm('確定要清除所有輸入的資料嗎?此操作無法復原。')) {
      // 保留某些系統欄位
      this.formInitService.resetToDefaults(this.dataForm, ['apply_no', 'tlt_no']);

      this.locationData = [];
      this.flowService.clearAll();
      this.messageService.infoBubble('表單已清除');
    }
  }


  /**
 *  櫃位欄位變更時的處理
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
      console.log('✅ 移除空白標記');
    }

    // 🔄 任何欄位變更都自動儲存
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
    const duplicates = this.locationData.filter(item =>
      item.id !== currentRow.id && // 排除自己
      item._status !== 'deleted' && // 排除已刪除的
      item.location_no &&
      item.location_no.trim().toLowerCase() === locationNo.trim().toLowerCase()
    );

    if (duplicates.length > 0) {
      // 🚨 發現重複
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
      // ✅ 沒有重複
      this.clearLocationError(currentRow);
      console.log('✅ 櫃位編號可用:', locationNo);
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
   *  驗證櫃位資料
   */
  private validateLocationData(locationData: any): {
    isValid: boolean;
    errorMessage: string;
    errors: string[]
  } {
    const errors: string[] = [];

    // 必填欄位檢查
    if (!locationData.location_no || locationData.location_no.trim() === '') {
      errors.push('櫃位編號為必填');
    }

    if (!locationData.tlt_space || locationData.tlt_space <= 0) {
      errors.push('坪數必須大於 0');
    }

    const isValid = errors.length === 0;
    const errorMessage = errors.join('、');

    return { isValid, errorMessage, errors };
  }

  /**
   * 🗑️ 焦點失去時自動清理空白新增行
   */
  onLocationCancel(locationData: any): void {
    console.log('⬅️ 取消編輯櫃位地點:', locationData.location_no);

    // 🔥 檢查是否為空白新增行
    const isEmptyNewRow = this.isEmptyLocationRow(locationData);

    if (isEmptyNewRow) {
      console.log('🗑️ 偵測到空白新增行,自動移除');

      const index = this.locationData.findIndex(item => item.id === locationData.id);
      if (index > -1) {
        this.locationData.splice(index, 1);
        this.locationData = [...this.locationData];
        console.log(`✅ 已從索引 ${index} 移除空白櫃位資料`);
      }

      this.messageService.infoBubble('已取消新增櫃位');
      this.cdr.detectChanges();
      return;
    }

    // 📋 清除錯誤標記
    this.clearLocationError(locationData);

    console.log('✅ 取消編輯完成(非空白行)');
  }

  /**
   *  判斷是否為空白櫃位新增行
   */
  private isEmptyLocationRow(locationData: any): boolean {
    if (!locationData._isNew) {
      return false;
    }

    const keyFields = ['location_no', 'location_name', 'tlt_space'];

    const isEmpty = keyFields.every(field => {
      const value = locationData[field];
      return value === null ||
        value === undefined ||
        value === '' ||
        (typeof value === 'string' && value.trim() === '');
    });

    return isEmpty;
  }

  // /**
  //  *  檢查是否有櫃位資料錯誤(用於顯示錯誤提示)
  //  */
  // hasLocationErrors(): boolean {
  //   return this.locationData.some(item =>
  //     item._hasError || item._hasDuplicateError
  //   );
  // }

  // /**
  //  * 📊 取得所有錯誤訊息
  //  */
  // getLocationErrors(): string[] {
  //   return this.locationData
  //     .filter(item => item._errorMessage)
  //     .map(item => `${item.location_no || '(未填寫)'}: ${item._errorMessage}`);
  // }
}
