import { LocationCodeService } from './../../../service/basic/locationcode.service';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { BaseTypeService } from '../../../service/basic/base-type-service.service';
import { ExcessHandlingMethodService } from '../../../service/basic/excess-handling-method.service';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { SettlementMethodService } from '../../../service/basic/settlement-method.service';
import { ReconciliationMethodService } from '../../../service/basic/reconciliation-method.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';
import { PaperTypeService } from '../../../service/basic/paper-type.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { BankAccountCodeService } from '../../../service/basic/bank-account-code.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';
import { CounterCategoryService } from '../../../service/basic/counter-category.service';
import { DecorationStyleService } from '../../../service/basic/decoration-style.service';
import { CommissionCalculationService } from '../../../service/basic/commission-calculation.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { BusinessTypeService } from '../../../service/basic/businesstype.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { ProductCategoryService } from '../../../service/basic/product-category.service';
import { SmallCategoryService } from '../../../service/basic/small-category.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ContractFlowService } from '../../../service/api/tls/tls13010contract-flow/contract-flow.service';
import { TLS13010_DROPDOWN_OPTIONS } from '../tls13010/tls13010.dropdown';

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

const storageKey = 'SYSB920';

@Component({
  selector: 'app-tls13010-cru',
  templateUrl: './tls13010-cru.component.html',
  styleUrls: ['./tls13010-cru.component.scss'],
})
export class TLS13010CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  // 加入這一行
  private originalData: any = null;

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
      field: 'isNew', header: '是否新增', visible: true,
      type: 'checkbox',
      checkboxTrueLabel: '是', // 非編輯模式顯示「新增」表示 true
      checkboxFalseLabel: '否', // 非編輯模式顯示「非新增」表示 false
    },
    {
      field: 'locationCode', header: '位置編號', visible: true, type: 'dropdown',
      options: [
        { label: 'B123', value: 'B123' },
        { label: 'C234', value: 'C234' },
      ],
    },
    {
      field: 'floor', header: '樓層', visible: true,
      type: 'dropdown',
      options: [
        { label: '1樓', value: '1樓' },
        { label: '2樓', value: '2樓' },
        { label: '3樓', value: '3樓' },
        { label: '4樓', value: '4樓' },
        { label: '5樓', value: '5樓' },
      ],
    },
    { field: 'area', header: '區域', visible: true, type: 'input', },
    { field: 'businessArea', header: '營業坪數', visible: true, type: 'input' },
    { field: 'startDate', header: '使用起始日', visible: true, type: 'date' },
    { field: 'endDate', header: '使用截止日', visible: true, type: 'date' },
    { field: 'performanceShare', header: '業績分攤(%)', visible: true, type: 'input' },
  ];

  dataForm = this.formBuilder.group({
    /** @description 合約ID */
    talent_id: [''],
    /** @description 專櫃招募編號 */
    apply_no: [''],

    // 基本資訊
    /** @description 專櫃名稱 */
    tlt_name: ['', Validators.required],
    /** @description 專櫃編號 */
    tlt_no: [{ value: '契約書審核後才給號', disabled: true }],
    /** @description 廠商統一編號 */
    ven_uniform: ['', Validators.required],
    /** @description 廠商名稱 */
    VEN_Name: ['', Validators.required],
    /** @description 營業型態 */
    paper_type: [''],
    /** @description 大分類 */
    bus_type: ['', Validators.required],
    /** @description 中分類 */
    bus_class: [''],
    /** @description 小分類 */
    bus_sclass: [''],

    // 合約資訊
    /** @description 合約起始日 */
    tlt_bdate: ['', Validators.required],
    /** @description 合約終止日 */
    tlt_edate: ['', Validators.required],
    /** @description 洽談日期 */
    contact_Date: ['', Validators.required],
    /** @description 洽談人員姓名 */
    contact_USR_Name: ['', Validators.required],
    /** @description 回函日期 */
    feedback_date: [''],
    /** @description 回函截止日 */
    due_date: [''],

    // 營運資訊
    /** @description 組織代號 */
    org_id: ['', Validators.required],
    /** @description 營運起始日 */
    tlt_contract_bdate: ['', Validators.required],
    /** @description 營運截止日 */
    tlt_contract_edate: ['', Validators.required],

    // 財務資訊
    /** @description 抽成別 */
    tlt_term_type: [''],
    /** @description 抽成額計算方式，預設為除稅 */
    comm_comp_type: ['2'],
    /** @description 是否為抽成 */
    comm_yn: [''],
    /** @description 預收租金 */
    rent_ahead: [''],
    /** @description 預收租金期數 */
    rent_period: [''],
    /** @description 固定租金 */
    base_rent: [''],
    /** @description 押金 */
    deposit: [''],
    /** @description 年目標營業額(業主) */
    total_amt: [''],
    /** @description 年預估營業額(廠商) */
    total_amt_vendor: [''],
    /** @description 準時開業保證金付款方式 */
    open_deposit: [''],
    /** @description 準時開業保證金 */
    open_fees: [''],
    /** @description 裝潢方式 */
    deco_type: [''],
    /** @description // 保證金付款方式: [''], */
    paymentMethods: [[]], // 保證金付款方式: [''],
    /** @description 施工保證金 */
    construct_fees: [''],
    /** @description 付款期限(天數) */
    check_day: ['', Validators.required],

    // 業務資訊
    /** @description 櫃別 */
    tlt_kind: [''],
    /** @description 是否使用業主商店代號 */
    edc_yn: [''],
    /** @description 包底類別 */
    tlt_ctype_mtotal: [''],
    /** @description 超出部份處理方式 */
    overall_status: [''],
    /** @description 是否開立業主發票 */
    rece_yn: [''],
    /** @description 是否使用業主收銀機 */
    pos_yn: [''],
    /** @description 是否為業主收現 */
    cash_yn: [''],
    /** @description 結帳方式 */
    money_type: [''],
    /** @description 配合方式 */
    store_way: [''],
    /** @description 對帳方式 */
    check_type: [''],
    /** @description 付款方式 */
    paytype: [''],
    /** @description 是否配合聯名卡 */
    vip_yn: [''],
    /** @description 聯名卡折數 */
    credit_card: [''],
    /** @description 請款單據別 */
    invoice_type: ['1', Validators.required],

    // 抄表類型
    /** @description 抄表類型清單 */
    meter_typeList: [[]],

    // 保證金相關
    /** @description 保證金備註 */
    ticket_remarks: [''],

    // 聯絡資訊
    /** @description 電子信箱 */
    email: ['', Validators.required],
    /** @description 發票電子郵件 */
    invoice_email: ['', Validators.required],
    /** @description 票據抬頭 */
    CHECK_TITLE: [''],
    /** @description 專櫃電話號碼 */
    store_tel: [''],
    /** @description 廠商匯款銀行代號 */
    bank_id: [''],
    /** @description 廠商帳戶名稱 */
    vendor_acct_name: [''],
    /** @description 廠商銀行帳號 */
    vendor_acct_no: [''],
    /** @description 公司電話號碼 */
    contact_tel: ['', Validators.required],
    /** @description 公司傳真號碼 */
    contact_fax: [''],
    /** @description 郵寄地址 */
    contact_addr: [''],
    /** @description 備註 */
    tlt_remark: [''],
  });


  // 固定選項 (從 constants 來的)
  decorationOptions = TLS13010_DROPDOWN_OPTIONS.decorationType;
  moneyTypeOptions = TLS13010_DROPDOWN_OPTIONS.moneyType;
  checkTypeOptions = TLS13010_DROPDOWN_OPTIONS.checkType;
  yesNoOptions = TLS13010_DROPDOWN_OPTIONS.yesNo;
  meterTypeOptions = TLS13010_DROPDOWN_OPTIONS.meterType;
  paytypeOptions = TLS13010_DROPDOWN_OPTIONS.paytype;
  storeWayOptions = TLS13010_DROPDOWN_OPTIONS.storeWay;
  invoiceTypeOptions = TLS13010_DROPDOWN_OPTIONS.invoiceType;
  tltKindOptions = TLS13010_DROPDOWN_OPTIONS.tltKind;
  openflagStatusOptions = TLS13010_DROPDOWN_OPTIONS.openflagStatus;
  overallStatusOptions = TLS13010_DROPDOWN_OPTIONS.overallStatus;
  depositTypeOptions = TLS13010_DROPDOWN_OPTIONS.depositType;
  depositPaymentOptions = TLS13010_DROPDOWN_OPTIONS.depositPayment;
  commissionCompTypeOptions = TLS13010_DROPDOWN_OPTIONS.commissionCompType;
  businessTypeOptions = TLS13010_DROPDOWN_OPTIONS.businessType;
  commCompTypeDropdown = TLS13010_DROPDOWN_OPTIONS.commCompType;
  // API 來的選項 (保留原來的)
  // businessTypeOptions: any[] = [];
  vendorOptions: any[] = [];
  locationOptions: any[] = [];
  contractStatusOptions: any[] = [];
  regionOptions: any[] = [];
  buildingOptions: any[] = [];
  floorOptions: any[] = [];
  negotiatorOptions: any[] = [];
  organizationOptions: any[] = [];
  operationStatusOptions: any[] = [];
  commissionCalculationOptions: any[] = [];
  counterCategoryOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  settlementMethodOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  cooperationMethodOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];

  constructor(
    private contractFlowService: ContractFlowService, // 加入這個
    private validationService: ValidationService,
    private counterCategoryService: CounterCategoryService,
    private decorationStyleService: DecorationStyleService,
    private commissionTypeService: CommissionTypeService,
    private commissionCalculationService: CommissionCalculationService,
    private baseTypeService: BaseTypeService,
    private excessHandlingMethodService: ExcessHandlingMethodService,
    private checkoutMethodService: SettlementMethodService,
    private cooperationMethodService: CooperationMethodService,
    private reconciliationMethodService: ReconciliationMethodService,
    private paymentMethodService: PaymentMethod2Service,
    private bankAccountCodeService: BankAccountCodeService,
    private invoiceDocumentTypeService: PaperTypeService,
    private depositPaymentMethodService: PaymentMethod2Service,
    private constructionDepositPaymentMethodService: PaymentMethod2Service,
    private whetherService: WhetherService,
    private vendorService: VendorService,
    private businessTypeService: BusinessTypeService,
    private OrganizationNumberService: OrganizationNumberService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private productCategoryService: ProductCategoryService,
    private smallCategoryService: SmallCategoryService,
    private userCodeService: UserCodeService,
    private LocationCodeService: LocationCodeService,
  ) {
    super();
  }

  onSubmitNext(): void {
    this.router.navigate(['TLS/TLS13010NEXT1']);
  }

  ngOnInit(): void {
    this.initializePage('TLS13010', this.dataForm);
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { [key: string]: any };

    // if (state && state['rowdata'] && state['rowdata']['recruitmentCode']) {
    //   this.dataForm.controls['recruitmentCode'].setValue(state['rowdata']['recruitmentCode']);
    // }
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // this.fetchDropdownOptions();

    // // 從導航狀態取得資料
    // const navigation = this.router.getCurrentNavigation();
    // const state = navigation?.extras.state as { [key: string]: any };

    if (state && state['rowdata']) {
      this.originalData = state['rowdata'];
      console.log('從查詢頁面帶來的資料:', this.originalData);

      // 檢查有沒有暫存資料
      const tempData = this.contractFlowService.getStep1Data(this.originalData);
      console.log('檢查暫存資料:', tempData);

      if (tempData) {
        console.log('找到暫存資料，使用暫存的');
        this.dataForm.patchValue(tempData);
      } else {
        console.log('沒有暫存資料，使用查詢結果');
        this.loadDataFromQueryResult(this.originalData);
      }
    } else {
      console.log('沒有從查詢頁面帶來資料');
    }

    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // this.fetchDropdownOptions();
  }

  // fetchDropdownOptions() {
  //   this.counterCategoryService.getCounterCategories().subscribe((options) => {
  //     this.counterCategoryOptions = options;
  //   });
  //   this.userCodeService.getUserCode().subscribe((data) => {
  //     this.UserCodeOptions = data;
  //   });
  //   this.LocationCodeService.getSystemTypes().subscribe((data) => {
  //     this.LocationCodeOptions = data;
  //   });
  //   this.smallCategoryService.getSmallCategories().subscribe(data => this.smallCategoryOptions = data);
  //   this.productCategoryService.getSystemTypes().subscribe((options) => {
  //     this.productCategoryOptions = options;
  //   });
  //   this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
  //     this.businessTypeCodeOptions = data;
  //   });
  //   this.businessTypeService.getBusinessTypes().subscribe((data) => {
  //     this.businessTypeOptions = data;
  //   });
  //   this.OrganizationNumberService.getOrganizationNumbers().subscribe(
  //     (data) => {
  //       this.OrganizationNumberOptions = data;
  //     }
  //   );
  //   this.decorationStyleService.getSystemTypes().subscribe((options) => {
  //     this.decorationStyleOptions = options;
  //   });
  //   this.vendorService.getVendors().subscribe((data) => {
  //     this.vendorOptions = data;
  //   });
  //   this.commissionTypeService.getCommissionTypes().subscribe((options) => {
  //     this.commissionTypeOptions = options;
  //   });
  //   this.commissionCalculationService.getCommissionCalculations().subscribe((options) => {
  //     this.commissionCalculationOptions = options;


  //   });
  //   this.baseTypeService.getBaseTypes().subscribe((options) => {
  //     this.packageCategoryOptions = options;
  //   });
  //   this.excessHandlingMethodService.getExcessHandlingMethods().subscribe((options) => {
  //     this.excessHandlingMethodOptions = options;
  //   });
  //   this.checkoutMethodService.getSettlementMethods().subscribe((options) => {
  //     this.checkoutMethodOptions = options;
  //   });
  //   this.cooperationMethodService.getCooperationMethods().subscribe((options) => {
  //     this.cooperationMethodOptions = options;
  //   });
  //   this.reconciliationMethodService.getReconciliationMethods().subscribe((options) => {
  //     this.reconciliationMethodOptions = options;
  //   });
  //   this.paymentMethodService.getPaymentMethods().subscribe((options) => {
  //     this.paymentMethodOptions = options;
  //   });
  //   this.bankAccountCodeService.getSystemTypes().subscribe((options) => {
  //     this.bankCodeOptions = options;
  //   });
  //   this.invoiceDocumentTypeService.getSystemTypes().subscribe((options) => {
  //     this.invoiceDocumentTypeOptions = options;
  //   });
  //   this.depositPaymentMethodService.getPaymentMethods().subscribe((options) => {
  //     this.depositPaymentMethodOptions = options;
  //   });
  //   this.constructionDepositPaymentMethodService.getPaymentMethods().subscribe((options) => {
  //     this.constructionDepositPaymentMethodOptions = options;
  //   });
  //   this.whetherService.getWhetherOptions().subscribe((options) => {
  //     this.whetherOptions = options;
  //   });
  // }

  canQuery(): boolean {
    return true;
  }

  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    // this.messageService.blockUI();

    if (frm.valid && this.canQuery()) {
      console.log(frm.value);
    }

    this.loading = false;
    // this.messageService.unblockUI();
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset();
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  cruForm = this.formBuilder.group({
    items: this.formBuilder.array([this.createItem()]),
  });

  get items(): FormArray {
    return this.cruForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      systemTypeDetailOptions: [],
      organizationNumberOptions: [],
      LocationCodeOptions: [],
      useStartDate: [],
      useEndDate: [],
      Performancesharing: [],
      floor: [{ value: '選完位置編號自動帶入', disabled: true }],
      area: [{ value: '選完位置編號自動帶入', disabled: true }],
      squaremeters: [{ value: '選完位置編號自動帶入', disabled: true }],
    });
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }

  calculatePerformanceShare(): void {
    console.log('Calculating performance share based on business area');
  }

  // 載入查詢結果到表單
  private loadDataFromQueryResult(rowData: any) {
    console.log('載入查詢結果到表單:', rowData);

    this.dataForm.patchValue({
      // 隱藏的ID欄位
      talent_id: rowData.talent_id,
      apply_no: rowData.apply_no,

      // // 顯示的欄位 - 根據你的查詢結果對應
      // recruitmentCode: rowData.apply_no,
      // brandName: rowData.tlt_name,
      // counterNumber: rowData.tlt_no,
      // vendorName: rowData.VEN_Name,
      // 你可以根據需要對應更多欄位
    });
  }
}
