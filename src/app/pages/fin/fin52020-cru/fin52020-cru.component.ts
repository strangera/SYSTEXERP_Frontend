import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { VendorService } from '../../../service/basic/vendor.service';
import { MargintypeService } from '../../../service/basic/margintype.service';
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
import { AnalysisdateCService } from './../../../service/basic/analysisdate-c.service';
import { FlippingstateService } from './../../../service/basic/flippingstate.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-fin52020-cru',
  templateUrl: './fin52020-cru.component.html',
  styleUrl: './fin52020-cru.component.scss'
})
export class FIN52020CRUComponent
  extends BasicCrupageComponent
  implements OnInit {
  ngOnInit(): void {
    // 初始化
    this.ProgNo = '150008';
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
    // ----------------------------------------------------------------
    items: this.formBuilder.array([this.createItem()]),
  });
  // Dropdown options

  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  displayOptions: any[] = [];
  displayOptions2: any[] = [];
  AnalysisdateCOptions: any[] = [];
  vendorOptions: any[] = [];
  FlippingstateOptions: any[] = [];
  margintypeOptions: any[] = [];
  borrowloanOptions: any[] = [{ value: 1, label: '借' },
  { value: 2, label: '貸' },];
  typeOptions: any[] = [{ value: 1, label: '存入保證金' },
  { value: 2, label: '存出保證金' },];
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
    this.router.navigate(['FIN5000/FIN52020']);
  }
}
