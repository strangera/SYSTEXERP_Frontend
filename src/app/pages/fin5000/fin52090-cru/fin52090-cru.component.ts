import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { VendorService } from '../../../service/basic/vendor.service';
import { MargintypeService } from '../../../service/basic/margintype.service';
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
import { AnalysisdateCService } from './../../../service/basic/analysisdate-c.service';
import { FlippingstateService } from './../../../service/basic/flippingstate.service';
import { TranslateService } from '@ngx-translate/core';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { AccountingaccountService } from '../../../service/basic/accountingaccount.service';

@Component({
  selector: 'app-fin52090-cru',
  templateUrl: './fin52090-cru.component.html',
  styleUrl: './fin52090-cru.component.scss',
})
export class FIN52090CRUComponent
  extends BasicCrupageComponent
  implements OnInit {
  ngOnInit(): void {
    // 初始化
    this.ProgNo = '150015';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayOptions2 = data)
    );
    this.AnalysisdateCService.getOptions().subscribe(
      (data) => (this.AnalysisdateCOptions = data)
    );
    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });
    this.flippingstateService.getOptions().subscribe((data) => {
      this.FlippingstateOptions = data;
    });
    this.margintypeService.getOptions().subscribe((data) => {
      this.margintypeOptions = data;
    });
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayOptions2 = data)
    );
    this.AnalysisdateCService.getOptions().subscribe(
      (data) => (this.AnalysisdateCOptions = data)
    );
    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });
    this.flippingstateService.getOptions().subscribe((data) => {
      this.FlippingstateOptions = data;
    });

    //
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.accordionTabCss = 'create-accordionTab';
        this.crudstatus = CRUDStatus.Create;
        this.showConfirm = this.canAdd();
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
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

    console.log(this.accordionTabCss);
  }
  createItem(): FormGroup {
    return this.formBuilder.group({
      remark: [], // Input Text
      startdate: [],
      enddate: [],
      SMarginserialnumber: [],
      EMarginserialnumber: [],
      vendorCode: [],
      Flippingstate: [1, Validators.required],
      Checknumber: [],
      margintype: [],
      borrowloan: [],
      type: [],
      Accountcode: [],
      vendorCodeOptions: [],
      name: [],
      organizationCodeOptions: [],
      unifiedNumberOptions: [],
      categoryCodeOptions: [],
    });
  }
  CashRegisterTypeItems: any[] = [
    { label: '業主', value: '1' },
    { label: '非業主', value: '2' },
  ];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    systemYear: [], // 系統年結年度
    accountingStartMonth: [], // 系統開帳年月
    accountingEndMonth: [], // 系統關帳年月
    defaultVoucherDate: [], // 傳票日期預設
    defaultOrganization: [, Validators.required], // 預設組織
    accumulatedProfitLossAccount: [], // 累積盈虧科目
    currentProfitLossAccount: [], // 本期損益科目
    cashAccount: [], // 現金科目
    accountsReceivableAccount: [], // 應收帳款科目
    accountsPayableAccount: [], // 應付帳款科目
    inputTaxAccount: [], // 進項稅額科目
    outputTaxAccount: [], // 銷項稅額科目
    postAndTelecomFeeAccount: [], // 郵電費科目
    discountRate: [], // 貼現日利率
    discountFeeRevenueAccount: [], // 貼現手續費收入科目
    discountOutputTaxAccount: [], // 貼現銷項稅額科目
    startdate: [], // 貼現銷項稅額科目起始日
    enddate: [], // 貼現銷項稅額科目結束日
    bankTransferFeeAccount: [], // 銀行匯款手續費科目
    advanceExpenseAccount: [], // 預支費用科目
    billTransferCondition: [], // 應付票據是否需領用才拋轉傳票
    typecode: [],
    typename: [],
    Subpoenatype: [],
    usagec: [],
    name: [],
    threecodecategoryEname: [],
    threecodecategoryname: [],
    threecodecategorycode: [],
    categoryCodeOptions: [],
    accountcategoryEname: [],
    accountcategoryname: [],
    accountcategorycode: [],
    mediumcategorycode: [],
    borrowloan: [],
    detail: [],
    offsetcode: [],
    Subpoenaformatl: [],
    Budgetaccount: [],
    Departmentcode: [],
    input: [],
    Residualvalueyears: [],
    Depreciation: [],
    Accumulateddepreciation: [],
    Accountcode: [],
    // ----------------------------------------------------------------
    items: this.formBuilder.array([this.createItem()]),
  });
  // Dropdown options
  Accumulateddepreciation: any[] = [
    { value: 1, label: '110101' },
    { value: 2, label: '110102' },
    { value: 3, label: '110103' },
    { value: 4, label: '110111' },
    { value: 5, label: '110112' },
    { value: 6, label: '110199' },
    { value: 7, label: '110200' },
    { value: 8, label: '110201' },
    { value: 9, label: '110210' },
    { value: 10, label: '110220' },
  ];
  Depreciation: any[] = [
    { value: 1, label: '110101' },
    { value: 2, label: '110102' },
    { value: 3, label: '110103' },
    { value: 4, label: '110111' },
    { value: 5, label: '110112' },
    { value: 6, label: '110199' },
    { value: 7, label: '110200' },
    { value: 8, label: '110201' },
    { value: 9, label: '110210' },
    { value: 10, label: '110220' },
  ];
  departmentOptions: any[] = [];
  ifOptions: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];
  detail: any[] = [
    { value: 1, label: '統制' },
    { value: 2, label: '明細' },
  ];
  Subpoenaformatl: any[] = [
    { value: 1, label: '無特定' },
    { value: 2, label: '應付票據' },
    { value: 3, label: '應收票據' },
  ];
  threecodecategorycodeOptions: any[] = [
    { value: 110, label: '現金及約當現金' },
    { value: 111, label: '金融資產' },
    { value: 112, label: '應收票據' },
    { value: 113, label: '應收票據-關係人' },
    { value: 114, label: '應收帳款' },
    { value: 115, label: '應收帳款-關係人' },
    { value: 116, label: '其他應收款' },
    { value: 117, label: '其他應收款-關係人' },
    { value: 118, label: '應收保證票' },
    { value: 120, label: '存貨' },
  ];
  borrowloanOptions: any[] = [
    { value: 1, label: '借' },
    { value: 2, label: '貸' },
  ];

  accountingaccountOptions: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];

  statusOptions: any[] = [
    { value: 1, label: '未拋轉' },
    { value: 2, label: '已拋轉' },
    { value: 3, label: '已退回' },
  ];

  unitOptions: any[] = [
    { value: 1, label: '元' },
    { value: 2, label: '千' },
    { value: 3, label: '萬' },
  ];

  typeOptions: any[] = [
    { value: 1, label: '統制' },
    { value: 2, label: '明細' },
  ];

  SubpoenatypeOptions: any[] = [
    { value: 1, label: '現金收入傳票' },
    { value: 2, label: '現金支出傳票' },
    { value: 3, label: '轉帳傳票' },
  ];

  SubpoenastatusOptions: any[] = [
    { value: 1, label: '作廢' },
    { value: 2, label: '建立' },
    { value: 3, label: '確認' },
    { value: 4, label: '過帳' },
    { value: 5, label: '刪除' },
  ];

  codeOptions: any[] = [
    { value: 1, label: '68919301_臺南紡織股份有限公司' },
    { value: 2, label: '73251209_統一企業股份有限公司' },
    { value: 3, label: '96978370_統正開發股份有限公司' },
  ];

  vendorOptions: any[] = [];
  displayOptions2: any[] = [];
  AnalysisdateCOptions: any[] = [];
  FlippingstateOptions: any[] = [];
  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  displayOptions: any[] = [];
  Accountcode: any[] = [
    { value: 1, label: '110101' },
    { value: 2, label: '110102' },
    { value: 3, label: '110103' },
    { value: 4, label: '110111' },
    { value: 5, label: '110112' },
    { value: 6, label: '110199' },
    { value: 7, label: '110200' },
    { value: 8, label: '110201' },
    { value: 9, label: '110210' },
    { value: 10, label: '110220' },
  ];
  unifiedNumberOptions: any[] = [
    { value: 1, label: '00000000' },
    { value: 2, label: '00000000' },
    { value: 3, label: '00000000' },
    { value: 4, label: '00000000' },
    { value: 5, label: '00000000' },
    { value: 6, label: '00000000' },
    { value: 7, label: '00852492' },
    { value: 8, label: '01052878' },
    { value: 9, label: '01508949' },
  ];

  organizationCodeOptions: any[] = [
    { value: 1, label: '100000' },
    { value: 2, label: '100100' },
    { value: 3, label: '101000' },
    { value: 4, label: '101100' },
    { value: 5, label: '101200' },
    { value: 6, label: '101300' },
    { value: 7, label: '101400' },
    { value: 8, label: '101500' },
    { value: 9, label: '101600' },
    { value: 10, label: '101700' },
  ];
  categoryCodeOptions: any[] = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8' },
    { value: 9, label: '9' },
  ];
  margintypeOptions: any[] = [];
  vendorCodeOptions: any[] = [
    { value: 1, label: '00000000-1' },
    { value: 2, label: '00000000-2' },
    { value: 3, label: '00000000-4' },
    { value: 4, label: '00000000-5' },
    { value: 5, label: '00000000-7' },
    { value: 6, label: '00000000-8' },
    { value: 7, label: '00852492-1' },
    { value: 8, label: '01052878-1' },
    { value: 9, label: '01508949-1' },
    { value: 10, label: '01515462-1' },
  ];

  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private IfdisplayService: IfdisplayService,
    private AnalysisdateCService: AnalysisdateCService,
    private vendorService: VendorService,
    private flippingstateService: FlippingstateService,
    private margintypeService: MargintypeService,
    private translate: TranslateService
  ) {
    super(); // 呼叫父類建構子
  }

  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // ----------------------------------------------------------------

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
      this.messageService.errorBubble(
        this.translate.instant('form_error_message')
      );
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(
            this.translate.instant('success_message')
          );
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(
            this.translate.instant('updated-successfully')
          );
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  } //CRU

  onCancel() {
    this.router.navigate(['FIN5000/FIN52090']);
  }
}
