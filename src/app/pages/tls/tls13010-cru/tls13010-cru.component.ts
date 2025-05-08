import { LocationCodeService } from './../../../service/basic/locationcode.service';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ValidationService } from '../../../shared/service/validation.service';
import { PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
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

  dataForm = this.formBuilder.group({
    recruitmentCode: [{ value: '自動給號', disabled: true }],
    counterNumber: [{ value: '契約書審核後才給號', disabled: true }],
    vendorCode: [1, Validators.required],
    vendorName: ['', Validators.required],
    brandName: ['', Validators.required],
    version: ['1'],
    businessType: [''],
    organizationCode: ['', Validators.required],
    industryType: ['', Validators.required],
    productCategory: ['', Validators.required],
    subCategory: ['', Validators.required],
    contractStartDate: ['', Validators.required],
    contractEndDate: ['', Validators.required],
    startBusinessStartDate: ['', Validators.required],
    startBusinessEndDate: ['', Validators.required],
    callbackDate: [''],
    callbackEndDate: [''],
    discussDate: ['', Validators.required],
    discussPerson: ['', Validators.required],
    activity1: [false],
    activity2: [false],
    activity3: [false],
    activity4: [false],
    counterCategory: [],
    decorationStyle: [''],
    commissionType: [''],
    commissionCalculation: [''],
    useOwnerStoreCode: [false],
    packageCategory: [''],
    excessHandlingMethod: [''],
    advanceRent: [false],
    advanceRentPeriods: [''],
    fixedRent: [''],
    deposit: [''],
    issueOwnerInvoice: [false],
    useOwnerCashRegister: [false],
    isOwnerCashCollection: [false],
    isCommission: [false],
    checkoutMethod: [''],
    cooperationMethod: [''],
    reconciliationMethod: [''],
    paymentMethod: [''],
    isCooperationWithCard: [false],
    cardDiscount: [''],
    annualOwnerTarget: [''],
    annualVendorEstimate: [''],
    depositPaymentMethod: [''],
    performanceBond: [''],
    constructionDepositPaymentMethod: [''],
    constructionBond: [''],
    paymentDaysAfterCheckout: ['', Validators.required],
    invoiceDocumentType: [1, Validators.required],
    email: ['', Validators.required],
    invoiceEmail: ['', Validators.required],
    billTitle: [''],
    counterPhone: [''],
    bankCode: [''],
    vendorAccountName: [''],
    bankAccountNumber: [''],
    companyPhone: ['', Validators.required],
    companyFax: [''],
    mailingAddress: [''],
    remarks: [''],
    meterReading: [[]],
    guaranteeNote: [[]],
    depositRemarks: ['']
  });

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
  vendorOptions: any[] = [];
  businessTypeOptions: any[] = [];
  OrganizationNumberOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  productCategoryOptions: any[] = [];
  smallCategoryOptions: any[] = [];
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

  constructor(
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

    if (state && state['rowdata'] && state['rowdata']['recruitmentCode']) {
      this.dataForm.controls['recruitmentCode'].setValue(state['rowdata']['recruitmentCode']);
    }
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.fetchDropdownOptions();
  }

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
    this.commissionCalculationService.getCommissionCalculations().subscribe((options) => {
      this.commissionCalculationOptions = options;
    });
    this.baseTypeService.getBaseTypes().subscribe((options) => {
      this.packageCategoryOptions = options;
    });
    this.excessHandlingMethodService.getExcessHandlingMethods().subscribe((options) => {
      this.excessHandlingMethodOptions = options;
    });
    this.checkoutMethodService.getSettlementMethods().subscribe((options) => {
      this.checkoutMethodOptions = options;
    });
    this.cooperationMethodService.getCooperationMethods().subscribe((options) => {
      this.cooperationMethodOptions = options;
    });
    this.reconciliationMethodService.getReconciliationMethods().subscribe((options) => {
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
    this.depositPaymentMethodService.getPaymentMethods().subscribe((options) => {
      this.depositPaymentMethodOptions = options;
    });
    this.constructionDepositPaymentMethodService.getPaymentMethods().subscribe((options) => {
      this.constructionDepositPaymentMethodOptions = options;
    });
    this.whetherService.getWhetherOptions().subscribe((options) => {
      this.whetherOptions = options;
    });
  }

  canQuery(): boolean {
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.query) as boolean;
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
}
