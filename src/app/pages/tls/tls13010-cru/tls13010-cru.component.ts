import { LocationCodeService } from './../../../service/basic/locationcode.service';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../../../service/system/auth.service';
import { ValidationService } from '../../../shared/service/validation.service';
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';

// Importing the specific services for each dropdown
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
@Component({
  selector: 'app-tls13010-cru',
  templateUrl: './tls13010-cru.component.html',
  styleUrls: ['./tls13010-cru.component.scss'],
})
export class TLS13010CRUComponent implements OnInit {
  // Additional component state variables
  loading: boolean = false;
  submitted: boolean = false;
  ProgNo: string = '210010';
  formTitle: string = '';   //CRU
  showConfirm: boolean = false;//CRU
  crudstatus: CRUDStatus = CRUDStatus.Read;//CRU

  // Data and columns for the table
  data: any[] = [
    {
      isNew: false,
      locationCode: '',
      floor: '',
      area: '',
      businessArea: '',
      startDate: '',
      endDate: '',
      performanceShare: 100,
    },
    // Additional data
  ];

  filteredData: any[] = [...this.data];

  columns: any[] = [
    { field: 'isNew', header: '是否新增', visible: true },
    { field: 'locationCode', header: '位置編號', visible: true },
    { field: 'floor', header: '樓層', visible: true },
    { field: 'area', header: '區域', visible: true },
    { field: 'businessArea', header: '營業坪數', visible: true },
    { field: 'startDate', header: '使用起始日', visible: true },
    { field: 'endDate', header: '使用截止日', visible: true },
    { field: 'performanceShare', header: '業績分攤(%)', visible: true },
  ];



  // Form controls
  dataForm = this.formBuilder.group({
    // 專櫃招募編號
    recruitmentCode: [{ value: '自動給號', disabled: true }],
    // 專櫃編號
    counterNumber: [{ value: '契約書審核後才給號', disabled: true }],
    // 廠商統一編號
    vendorCode: [1, Validators.required],
    // 廠商名稱
    vendorName: ['', Validators.required],
    // 品牌(專櫃名稱)
    brandName: ['', Validators.required],
    // 版本編號
    version: ['1'],

    // 營業型態
    businessType: [''],
    // 組織代碼
    organizationCode: ['', Validators.required],
    // 業種
    industryType: ['', Validators.required],
    // 商品類別
    productCategory: ['', Validators.required],
    // 小分類
    subCategory: ['', Validators.required],
    // 契約起始日
    contractStartDate: ['', Validators.required],
    // 契約截止日
    contractEndDate: ['', Validators.required],
    // 營運起始日
    startBusinessStartDate: ['', Validators.required],
    // 營運截止日
    startBusinessEndDate: ['', Validators.required],
    // 回函日期
    callbackDate: [''],
    // 回函截止日
    callbackEndDate: [''],
    // 洽談日期
    discussDate: ['', Validators.required],
    // 洽談者
    discussPerson: ['', Validators.required],
    // 全館消費滿額集點活動
    activity1: [false],
    // 滿仟送佰
    activity2: [false],
    // 有價券
    activity3: [false],
    // 會員卡
    activity4: [false],

    // 櫃別
    counterCategory: [],
    // 裝潢方式
    decorationStyle: [''],
    // 抽成別
    commissionType: [''],
    // 抽成額計算方式
    commissionCalculation: [''],
    // 是否使用業主商店代號
    useOwnerStoreCode: [false],
    // 包底類別
    packageCategory: [''],
    // 超出部份處理方式
    excessHandlingMethod: [''],
    // 預收租金
    advanceRent: [false],
    // 預收租金期數
    advanceRentPeriods: [''],
    // 固定租金
    fixedRent: [''],
    // 押金
    deposit: [''],
    // 是否開立業主發票
    issueOwnerInvoice: [false],
    // 是否使用業主收銀機
    useOwnerCashRegister: [false],
    // 是否為業主收現
    isOwnerCashCollection: [false],
    // 是否為抽成
    isCommission: [false],
    // 結帳方式
    checkoutMethod: [''],
    // 配合方式
    cooperationMethod: [''],
    // 對帳方式
    reconciliationMethod: [''],
    // 付款方式
    paymentMethod: [''],
    // 是否配合聯名卡
    isCooperationWithCard: [false],
    // 聯名卡折數
    cardDiscount: [''],
    // 年目標營業額(業主)
    annualOwnerTarget: [''],
    // 年預估營業額(廠商)
    annualVendorEstimate: [''],
    // 保證金付款方式
    depositPaymentMethod: [''],
    // 履約保證金
    performanceBond: [''],
    // 施工保證金付款方式
    constructionDepositPaymentMethod: [''],
    // 施工保證金
    constructionBond: [''],
    // 付款期限(天數)
    paymentDaysAfterCheckout: ['', Validators.required],
    // 請款單據別
    invoiceDocumentType: [1, Validators.required],
    // 電子郵件
    email: ['', Validators.required],
    // 發票電子郵件
    invoiceEmail: ['', Validators.required],
    // 票據抬頭
    billTitle: [''],
    // 專櫃電話號碼
    counterPhone: [''],
    // 廠商匯款銀行代號
    bankCode: [''],
    // 廠商帳戶名稱
    vendorAccountName: [''],
    // 廠商銀行帳號
    bankAccountNumber: [''],
    // 公司電話號碼(O)
    companyPhone: ['', Validators.required],
    // 公司傳真號碼(F)
    companyFax: [''],
    // 郵寄地址
    mailingAddress: [''],
    // 備註
    remarks: [''],
  });

  // Dropdown options populated via individual services
  counterCategoryOptions: any[] = [];
  decorationStyleOptions: any[] = [];
  commissionTypeOptions: any[] = [];
  commissionCalculationOptions: any[] = [];
  packageCategoryOptions: any[] = [];
  excessHandlingMethodOptions: any[] = [];
  checkoutMethodOptions: any[] = [];
  cooperationMethodOptions: any[] = [];
  reconciliationMethodOptions: any[] = [];
  paymentMethodOptions: any[] = [];
  invoiceDocumentTypeOptions: any[] = [];
  bankCodeOptions: any[] = [];
  depositPaymentMethodOptions: any[] = [];
  constructionDepositPaymentMethodOptions: any[] = [];
  whetherOptions: any[] = [];
  vendorIdOptions: any[] = [];
  businessTypeOptions: any[] = [];
  organizationCodeOptions: any[] = [];
  industryTypeOptions: any[] = [];
  productCategoryOptions: any[] = [];
  smallCategoryOptions: any[] = [];
  discussPersonOptions: any[] = [];
  vendorOptions: any[] = [];
  OrganizationNumberOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  UserCodeOptions: any[] = [];
  floorOptions: any[] = [];
  LocationCodeOptions: any[] = [];

  options1: any[] = [
    { value: 1, label: '水錶' },
    { value: 2, label: '電錶' },
    { value: 3, label: '瓦斯錶' },

  ];

  options2: any[] = [
    { value: 1, label: '準時開業' },
    { value: 2, label: '施工保證' },
    { value: 3, label: '契約屆滿保證票' },
  ];



  // Permissions
  funInfo?: FunsrightInfo;
  addPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.add,
  };
  queryPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.query,
  };
  editPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.edit,
  };

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private counterCategoryService: CounterCategoryService, // 新增的服務
    private decorationStyleService: DecorationStyleService, // 新增的服務
    private commissionTypeService: CommissionTypeService, // 新增的服務
    private commissionCalculationService: CommissionCalculationService, // 新增的服務
    private baseTypeService: BaseTypeService, // 新增的服務
    private excessHandlingMethodService: ExcessHandlingMethodService, // 新增的服務
    private checkoutMethodService: SettlementMethodService, // 結帳方式服務
    private cooperationMethodService: CooperationMethodService, // 配合方式服務
    private reconciliationMethodService: ReconciliationMethodService, // 對帳方式服務
    private paymentMethodService: PaymentMethod2Service, // 付款方式服務
    private bankAccountCodeService: BankAccountCodeService, // 廠商匯款銀行代號
    private invoiceDocumentTypeService: PaperTypeService, // 請款單據別
    private depositPaymentMethodService: PaymentMethod2Service, // 保證金付款方式
    private constructionDepositPaymentMethodService: PaymentMethod2Service, // 施工保證金付款方式
    private whetherService: WhetherService, // 是否相關服務
    private vendorService: VendorService,
    private businessTypeService: BusinessTypeService,
    private OrganizationNumberService: OrganizationNumberService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private productCategoryService: ProductCategoryService,
    private smallCategoryService: SmallCategoryService,
    private userCodeService: UserCodeService,
    private LocationCodeService: LocationCodeService,
    private activatedRoute: ActivatedRoute  // 正確的名稱
  ) { }
  onSubmitNext(): void {
    this.router.navigate(['TLS1000/TLS13010NEXT1']);
  }
  ngOnInit(): void {
    // 讀取導航狀態中的專櫃招募編號
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { [key: string]: any };

    // 確保使用方括號來存取 rowdata 和 counterName 屬性
    if (state && state['rowdata'] && state['rowdata']['recruitmentCode']) {
      this.dataForm.controls['recruitmentCode'].setValue(state['rowdata']['recruitmentCode']);  // 自動填入專櫃招募編號
    }
    // Fetch user permissions
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // Fetch dropdown options using individual services
    this.fetchDropdownOptions();

  }

  // Fetch options for dropdowns using their respective services
  fetchDropdownOptions() {
    this.counterCategoryService.getCounterCategories().subscribe((options) => {
      this.counterCategoryOptions = options;
    });
    this.userCodeService.getUserCode().subscribe((data) => {
      this.UserCodeOptions = data;
    });
    this.LocationCodeService.getSystemTypes().subscribe((data) => {
      this.LocationCodeOptions = data;
    });
    this.smallCategoryService.getSmallCategories().subscribe(data => this.smallCategoryOptions = data);
    this.productCategoryService.getSystemTypes().subscribe((options) => {
      this.productCategoryOptions = options;
    });
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
      this.businessTypeCodeOptions = data;
    });
    this.businessTypeService.getBusinessTypes().subscribe((data) => {
      this.businessTypeOptions = data;
    });
    this.OrganizationNumberService.getOrganizationNumbers().subscribe(
      (data) => {
        this.OrganizationNumberOptions = data;
      }
    );
    this.decorationStyleService.getSystemTypes().subscribe((options) => {
      this.decorationStyleOptions = options;
    });
    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });

    this.commissionTypeService.getCommissionTypes().subscribe((options) => {
      this.commissionTypeOptions = options;
    });

    this.commissionCalculationService
      .getCommissionCalculations()
      .subscribe((options) => {
        this.commissionCalculationOptions = options;
      });

    this.baseTypeService.getBaseTypes().subscribe((options) => {
      this.packageCategoryOptions = options;
    });

    this.excessHandlingMethodService
      .getExcessHandlingMethods()
      .subscribe((options) => {
        this.excessHandlingMethodOptions = options;
      });

    this.checkoutMethodService.getSettlementMethods().subscribe((options) => {
      this.checkoutMethodOptions = options;
    });

    this.cooperationMethodService
      .getCooperationMethods()
      .subscribe((options) => {
        this.cooperationMethodOptions = options;
      });

    this.reconciliationMethodService
      .getReconciliationMethods()
      .subscribe((options) => {
        this.reconciliationMethodOptions = options;
      });

    this.paymentMethodService.getPaymentMethods().subscribe((options) => {
      this.paymentMethodOptions = options;
    });

    this.bankAccountCodeService.getSystemTypes().subscribe((options) => {
      this.bankCodeOptions = options;
    });

    this.invoiceDocumentTypeService.getSystemTypes().subscribe((options) => {
      this.invoiceDocumentTypeOptions = options;
    });

    this.depositPaymentMethodService
      .getPaymentMethods()
      .subscribe((options) => {
        this.depositPaymentMethodOptions = options;
      });

    this.constructionDepositPaymentMethodService
      .getPaymentMethods()
      .subscribe((options) => {
        this.constructionDepositPaymentMethodOptions = options;
      });

    this.whetherService.getWhetherOptions().subscribe((options) => {
      this.whetherOptions = options;
    });
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };//CRU

    switch (state.crudstatus) {
      case CRUDStatus.Create:
        this.formTitle = '新增資料';
        this.showConfirm = this.canAdd();
        break;
      case CRUDStatus.Edit:
        console.log(state.rowdata);
        this.formTitle = '編輯資料';
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = '顯示資料';
        this.Read(state.rowdata);
        break;
    }//CRU
  }
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // Check if the user has query permission
  canQuery(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.query) as boolean;
  }

  // Check if the user has add permission
  canAdd(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.add) as boolean;
  }

  // Check if the user has edit permission
  canEdit(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.edit) as boolean;
  }

  // Form submission logic
  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Implement your form submission logic here
      console.log(frm.value);
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(CRUDStatus.Create);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(CRUDStatus.Read, data);
  }

  // Navigation method
  navigateWithState(crudstatus: CRUDStatus, rowdata?: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
      },
    };

    this.router.navigate(['TLS1000/TLS13010'], extras);
  }
  get isFormEditable(): boolean {
    return (this.crudstatus === CRUDStatus.Create && this.canAdd()) || (this.crudstatus === CRUDStatus.Edit && this.canEdit());
  }//CRU

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU

  onCancel() {
    this.router.navigate(['TLS1000/TLS13010']);
  }//CRU

  // 初始化CRU表單
  cruForm = this.formBuilder.group({
    items: this.formBuilder.array([this.createItem()]), // 項目列表
  });

  //
  get items(): FormArray {
    return this.cruForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  //
  createItem(): FormGroup {
    return this.formBuilder.group({
      systemTypeDetailOptions: [], // 系統代碼
      organizationNumberOptions: [], // 組織代碼
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
}
