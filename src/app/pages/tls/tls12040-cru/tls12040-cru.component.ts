import { PayWithCashService } from './../../../service/basic/pay-with-cash.service';
import { PostOptionService } from './../../../service/basic/post-option.service';
import { PaperTypeService } from './../../../service/basic/paper-type.service';
import { BankAccountCodeService } from './../../../service/basic/bank-account-code.service';
import { PackageCategoryService } from './../../../service/basic/package-category.service';
import { ProductCategoryService } from './../../../service/basic/product-category.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { BusinessTypeService } from '../../../service/basic/businesstype.service';
import { PaymentMethod2Service } from '../../../service/basic/payment-method2.service';
import { CooperationMethodService } from './../../../service/basic/cooperation-method.service';
import { SettlementMethodService } from './../../../service/basic/settlement-method.service';
import { CommissionTypeService } from './../../../service/basic/commission-type.service';
import { CommissionCalculationService } from './../../../service/basic/commission-calculation.service';
import { DecorationStyleService } from './../../../service/basic/decoration-style.service';
import { CounterCategoryService } from './../../../service/basic/counter-category.service';
import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { FloorService } from './../../../service/basic/floor.service';
import { RegionService } from './../../../service/basic/region-code.service';
import { LocationService } from './../../../service/basic/location.service';
import { BusinessTypeCodeService } from './../../../service/basic/business-type-code-service.service';
import { VendorService } from './../../../service/basic/vendor.service';
// --Commonly used imports--
import { Component, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { ValidationService } from '../../../shared/service/validation.service';

// 2.1.2.4 專櫃要約書維護CRU
@Component({
  selector: 'app-tls12040-cru',
  templateUrl: './tls12040-cru.component.html',
  styleUrl: './tls12040-cru.component.scss'
})
export class TLS12040CRUComponent extends BasicCrupageComponent implements OnInit {
  vendorUIDOptions: any[] = [];
  negotiatorOptions: any[] = [];
  industryCodeOptions: any[] = [];
  locationNumberOptions: any[] = [];
  regionOptions: any[] = [];
  floorOptions: any[] = [];
  contractStatusOptions: any[] = [];
  businessTypeOptions: any[] = [];
  organizationCodeOptions: any[] = [];
  calculationMethodOptions: any[] = [];
  counterTypeOptions: any[] = [];
  decorationStyleOptions: any[] = [];
  chargeTypeOptions: any[] = [];
  checkoutOptions: any[] = [];
  paymentOptions: any[] = [];
  cooerationTypeOptions: any[] = [];
  productCategoryOptions: any[] = [];
  packageTypeOptions: any[] = [];
  bankCodeOptions: any[] = [];
  exceededPartOptions: any[] = [
    { value: 1, label: '全部' },
    { value: 2, label: '部分' },
  ];
  reconciliationMethodOptions: any[] = [];
  paymentWithCashOptions: any[] = [];
  requestFormOptions: any[] = [];

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    recruitmentNumber: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 專櫃招募編號
    counterID: [, [this.validationService.numberValidator, Validators.maxLength(6)]], // 專櫃編號
    versionNumber: [, [this.validationService.numberValidator, Validators.maxLength(10)]], // 版本編號

    vendorUID: [, [Validators.required]], // 廠商統一編號
    businessType: [,], // 營業型態
    organizationCode: [, [Validators.required]], // 組織代碼
    industryCode: [, [Validators.required]], // 大分類
    productCategory: [, [Validators.required]], // 中分類

    negotiator: [, [Validators.required]], // 洽談者
    counterType: [,], // 櫃別
    decorationStyle: [,], // 裝潢方式
    chargeType: [,], // 抽成別
    calculationMethod: [,], // 抽成額計算方式
    packageType: [,], // 包底類別
    exceededPart: [,], // 超出部份處理方式
    checkout: [,], // 結帳方式
    cooerationType: [,], // 配合方式
    reconciliationMethod: [,], // 對帳方式
    payment: [,], // 付款方式
    recognizancePaymentMethod: [, [Validators.required]], // 保證金付款方式
    constructionPaymentMethod: [,], // 施工保證金付款方式
    requestForm: [, [Validators.required]], // 請款單據別
    bankCode: [, [Validators.required]], // 廠商匯款銀行代號

    contractStartDate: [, [Validators.required]], // 契約起始日
    contractEndDate: [, [Validators.required]], // 契約截止日
    operationStartDate: [, [Validators.required]], // 營運起始日
    operationEndDate: [, [Validators.required]], // 營運截止日
    replyStartDate: [,], // 回函日期
    replyEndDate: [,], // 回函截止日
    negotiationDate: [,], // 洽談日期

    advanceRentPeriod: [, [Validators.maxLength(50)]], // 預收租金期數
    fixedRent: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 固定租金

    deposit: [, [Validators.maxLength(50)]], // 押金
    brandedCardDiscount: [, [Validators.maxLength(20)]], // 聯名卡折數
    ownerAnnualTurnover: [, [Validators.maxLength(20)]], // 年目標營業額(業主)
    venderAnnualTurnover: [, [Validators.maxLength(20)]], // 年預估營業額(廠商)
    recognizance: [, [Validators.required, Validators.maxLength(20)]], // 履約保證金
    constructionRecognizance: [, [Validators.maxLength(20)]], // 施工保證金
    payDay: [, [Validators.required, Validators.maxLength(20)]], // 付款期限(天數)

    ownerStoreCode: [,], // 是否使用業主商店代號
    advanceRent: [,], // 預收租金
    venderInvoice: [,], // 是否開立業主發票
    venderRegister: [,], // 是否使用業主收銀機
    venderCash: [,], // 是否為業主收現
    commissionCheck: [,], // 是否為抽成
    brandedCardCooperate: [,], // 是否配合聯名卡

    vendorName: ['', [Validators.required, Validators.maxLength(60)]], // 廠商名稱
    counterName: ['', [Validators.required, Validators.maxLength(50)]], // 品牌(櫃位名稱)
    email: ['', [Validators.required, Validators.maxLength(20)]], // 電子郵件
    invoiceEmail: ['', [Validators.required, Validators.maxLength(20)]], // 發票電子郵件
    ticketTitle: ['', [Validators.maxLength(20)]], // 票據抬頭
    counterPhone: ['', [Validators.maxLength(20)]], // 專櫃電話號碼
    venderAccountName: ['', [Validators.maxLength(20)]], // 廠商帳戶名稱
    venderAccount: ['', [Validators.maxLength(20)]], // 廠商銀行帳號
    companyPhone: ['', [Validators.required, Validators.maxLength(17)]], // 公司電話號碼(O)
    companyFex: ['', [Validators.required, Validators.maxLength(12)]], // 公司傳真號碼(F)
    postAddress: ['', [Validators.required, Validators.maxLength(100)]], // 郵寄地址
    remark: [,], // 備註

    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,

    //----constructor replace---
    private vendorService: VendorService,
    private userCodeService: UserCodeService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private locationService: LocationService,
    private RegionService: RegionService,
    private floorService: FloorService,
    private businessTypeService: BusinessTypeService,
    private organizationNumberService: OrganizationNumberService,
    private counterCategoryService: CounterCategoryService,
    private decorationStyleService: DecorationStyleService,
    private commissionCalculationService: CommissionCalculationService,
    private commissionTypeService: CommissionTypeService,
    private settlementMethodService: SettlementMethodService,
    private paymentMethod2Service: PaymentMethod2Service,
    private cooperationMethodService: CooperationMethodService,
    private productCategoryService: ProductCategoryService,
    private packageCategoryService: PackageCategoryService,
    private bankAccountCodeService: BankAccountCodeService,
    private paperTypeService: PaperTypeService,
    private postOptionService: PostOptionService,
    private payWithCashService: PayWithCashService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '210006';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.vendorService.getVendors().subscribe(data => {
      this.vendorUIDOptions = data;
    });
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.negotiatorOptions = data;
    });
    //
    this.locationService.getLocations().subscribe(data => {
      this.locationNumberOptions = data;
    });
    //
    this.RegionService.getRegionOptions().subscribe(data => {
      this.regionOptions = data;
    });
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    //
    this.productCategoryService.getSystemTypes().subscribe(data => {
      this.productCategoryOptions = data;
    });
    //
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe(data => {
      this.industryCodeOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationCodeOptions = data;
    });
    //
    this.businessTypeService.getBusinessTypes().subscribe(data => {
      this.businessTypeOptions = data;
    });
    //
    this.counterCategoryService.getCounterCategories().subscribe(data => {
      this.counterTypeOptions = data;
    });
    //
    this.decorationStyleService.getSystemTypes().subscribe(data => {
      this.decorationStyleOptions = data;
    });
    //
    this.commissionCalculationService.getCommissionCalculations().subscribe(data => {
      this.calculationMethodOptions = data;
    });
    //
    this.paperTypeService.getSystemTypes().subscribe(data => {
      this.requestFormOptions = data;
    });
    //
    this.commissionTypeService.getCommissionTypes().subscribe(data => {
      this.chargeTypeOptions = data;
    });
    //
    this.settlementMethodService.getSettlementMethods().subscribe(data => {
      this.checkoutOptions = data;
    });
    //
    this.paymentMethod2Service.getPaymentMethods().subscribe(data => {
      this.paymentOptions = data;
    });
    //
    this.cooperationMethodService.getCooperationMethods().subscribe(data => {
      this.cooerationTypeOptions = data;
    });
    //
    this.packageCategoryService.getSystemTypes().subscribe(data => {
      this.packageTypeOptions = data;
    });
    //
    this.bankAccountCodeService.getSystemTypes().subscribe(data => {
      this.bankCodeOptions = data;
    });
    //
    this.postOptionService.getSystemTypes().subscribe(data => {
      this.reconciliationMethodOptions = data;
    });
    //
    this.payWithCashService.getSystemTypes().subscribe(data => {
      this.paymentWithCashOptions = data;
    });
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;
        this.showConfirm = this.canEdit();
        this.Edit(state.rowdata);
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }
  }

  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // ----------------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      locationNumber: [[] as number[]], // 位置編號
      region: [[] as number[]], // 區域
      floor: [[] as number[]], // 樓層
      squareMeters: ['', [Validators.maxLength(5)]], // 營業坪數
      startdate: [], // 使用期間
      enddate: [], // 使用期間
    });
  }
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset();  // 重置表單
  }

  onCancel() {
    this.router.navigate(['/TLS1000/TLS12040']);
  }
  //-------------------------------------------------------------------------------------------------------------
}
