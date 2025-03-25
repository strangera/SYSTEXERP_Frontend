import { UserCodeService } from './../../../service/basic/user-code.service';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { TranslateService } from '@ngx-translate/core';
import { NavigationExtras } from '@angular/router';
// Services
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
// Shared
import { VendorService } from '../../../service/basic/vendor.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { ViolationCategoryService } from '../../../service/basic/violation-category.service';
import { DeductionItemService } from '../../../service/basic/deduction-item.service';
import { OrganizationNumberService } from './../../../service/basic/organization-number.service';

@Component({
  selector: 'app-fin72010-cru',
  templateUrl: './fin72010-cru.component.html',
  styleUrl: './fin72010-cru.component.scss',
})
export class FIN72010CRUComponent
  extends BasicCrupageComponent
  implements OnInit
{
  ngOnInit(): void {
    // 初始化
    this.ProgNo = '170003';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.userCodeService
      .getUserCode()
      .subscribe((data) => (this.founder = data));
    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayOptions = data)
    );
    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayOptions2 = data)
    );
    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });
    this.userCodeService
      .getUserCode()
      .subscribe((data) => (this.usercode = data));
    this.counterCodeService.getCounterCodes().subscribe((data) => {
      this.counterCodeOptions = data;
    });

    this.violationCategoryService.getViolationCategories().subscribe((data) => {
      this.violationCategoryOptions = data;
    });

    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });

    this.deductionItemService.getDeductionItems().subscribe((data) => {
      this.deductionItemOptions = data;
    });
    this.OrganizationNumberService.getOrganizationNumbers().subscribe(
      (data) => {
        this.organizationNumberOptions = data;
      }
    );

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
      Accountcode: [],
      vendorCodeOptions: [],
      summary: [],
      Debitamount: [],
      Creditamount: [],
      Organizationcode: [],
      StandingInstructionCode: [],
      Activitycode: [],
      Objectnumber: [],
      ReconciliationKEYvalue: [],
      usercode: [],
      ExpenseAccount: [],
      Detailedcategory: [],
      Invoiceformat: [],
      receiptnumber: [],
      Invoicedate: [],
      YMdeclaration: [],
      vendorUnifiedNumber: [],
      invoicePurpose: [],
      TIA: [],
      taxCategory: [],
      invoiceAmtExclTax: [],
      ITA: [],
      deductionCode: [],
      totalSheetCount : [],
    });
  }

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    invoicePurpose: [],
    Subpoenanumber: [],
    Subpoenatype: [],
    Subpoenadate: [],
    Subpoenastatus: [],
    Subpoenasummary: [],
    Makeupinvoice: [],
    builder: [],
    modifyer: [],
    builddate: [],
    modifydate: [],
    uickMenu: [],
    Companybankcode: [],
    status: [],
    usercode: [],
    Employeename: [],
    Organizationcode: [],
    dialnumber: [],
    creationDate: [],
    transferdate: [],
    TCBAC: [],
    TOCBAC: [],
    founder: [],
    counterCode: [], // 專櫃編號
    counterName: [], // 專櫃名稱
    violationCategory: [], // 違規類別編號
    deductionItem: [], // 扣款項目
    amountStart: [], // 金額開始
    amountEnd: [], // 金額結束
    deductionDateStart: [], // 扣款日期起
    deductionDateEnd: [], // 扣款日期迄
    violationDateStart: [], // 違規日期起
    violationDateEnd: [], // 違規日期迄
    documentNumber: [], // 單據編號
    issuingUnit: [], // 開立單位
    createdBy: [], // 建立者(輸入代號)
    floor: [], // 樓層
    Applicationdate: [], // 維護日
    PettyCashOrderNumber: [],
    Pettycashapplicant: [],
    Pettycashcustodian: [],
    Applicantorganizationcode: [],
    Custodianorganizationcode: [],
    ExpenseAccount: [],
    Detailedcategory: [],
    Invoiceformat: [],
    receiptnumber: [],
    Invoicedate: [],
    YMdeclaration: [],
    vendorUnifiedNumber: [],
    TIA: [],
    taxCategory: [],
    invoiceAmtExclTax: [],
    ITA: [],
    deductionCode: [],
    totalSheetCount : [],
    // ----------------------------------------------------------------
    items: this.formBuilder.array([this.createItem()]),
  });
  // Dropdown options
  deductionCode: any[] = [
    { value: 1, label: '代表進項可扣抵之進貨及費用' },
    { value: 2, label: '代表進項可扣抵之固定資產' },
    { value: 3, label: '代表進項不可扣抵之進貨及費用' },
    { value: 4, label: '代表進項不可扣抵之固定資產' },
  ];
  taxCategory: any[] = [
    { value: 1, label: '應稅' },
    { value: 2, label: '免稅' },
    { value: 3, label: '零稅率' },
    { value: 4, label: '內含稅' },
  ];
  invoicePurpose: any[] = [
    { value: 1, label: '共同使用' },
    { value: 2, label: '營業用' },
  ];
  Detailedcategory: any[] = [
    { value: 1, label: '發票' },
    { value: 2, label: '不折扣抵憑證' },
    { value: 3, label: '收據' },

  ];
  Invoiceformat
  : any[] = [
    { value: 1, label: '21' },
    { value: 2, label: '22' },
    { value: 3, label: '25' },
    { value: 4, label: '26' },
    { value: 5, label: '27' },

  ];
  ExpenseAccount: any[] = [
    { value: 1, label: '610101' },
    { value: 2, label: '610102' },
    { value: 3, label: '610103' },
    { value: 4, label: '610104' },
    { value: 5, label: '610105' },
    { value: 6, label: '610106' },
    { value: 7, label: '610107' },
    { value: 8, label: '610108' },
    { value: 9, label: '610109' },
    { value: 10, label: '610110' },
  ];
  PettyCashOrderNumber: any[] = [
    { value: 201407170001, label: 'C201407170001' },
    { value: 201407170002, label: 'C201407170002' },
    { value: 201407170003, label: 'C201407170003' },
    { value: 201407170004, label: 'C201407170004' },
    { value: 201407210001, label: 'C201407210001' },
    { value: 201407210002, label: 'C201407210002' },
    { value: 201407280001, label: 'C201407280001' },
    { value: 201407280002, label: 'C201407280002' },
    { value: 201407280003, label: 'C201407280003' },
    { value: 201407290002, label: 'C201407290002' },
  ];
  usercode: any[] = [];
  Feespayable: any[] = [
    { value: 210101, label: '銀行短期借款' },
    { value: 210201, label: '應付商業本票-中華' },
    { value: 210202, label: '應付商業本票-合庫' },
    { value: 210203, label: '應付商業本票-聯邦' },
    { value: 210301, label: '應付商業本票折價' },
    { value: 210401, label: '一年或一年營業週期內到期長期負債' },
    { value: 2111, label: '應付票據' },
    { value: 211101, label: '應付票據-專櫃' },
    { value: 211102, label: '應付票據-自營' },
    { value: 211103, label: '應付票據-固資及費用' },
  ];
  Inputtax: any[] = [
    { value: 1, label: '1101_庫存現金' },
    { value: 2, label: '110101_庫存現金-營收及正負差' },
    { value: 3, label: '110102_庫存現金-其他收入' },
    { value: 4, label: '110103_庫存現金-財務部' },
    { value: 5, label: '110111_庫存現金-外幣' },
    { value: 6, label: '110112_庫存現金-人民幣' },
    { value: 7, label: '110199_庫存現金-其他' },
    { value: 8, label: '1102_零用金' },
    { value: 9, label: '110200_零用金-總經理室' },
    { value: 10, label: '110201_零用金-採購組' },
  ];
  statusOptions: any[] = [
    { value: 1, label: '建立' },
    { value: 2, label: '請款' },
    { value: 3, label: '拋轉' },
    { value: 4, label: '撥補' },
  ];
  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  displayOptions: any[] = [];
  displayOptions2: any[] = [];
  Billingordernumber: any[] = [
    { value: 1, label: 'B20150208001' },
    { value: 2, label: 'B20150208002' },
    { value: 3, label: 'B20150410001' },
  ];
  vendorOptions: any[] = [];
  counterCodeOptions: any[] = [];
  violationCategoryOptions: any[] = [];
  floorOptions: any[] = [];
  deductionItemOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  founder: any[] = [];
  TOCBACOptions: any[] = [];
  TCBACOptions: any[] = [];
  status: any[] = [
    { value: 1, label: '停用' },
    { value: 2, label: '手開' },
    { value: 3, label: '電腦' },
  ];
  Companybankcode: any[] = [{ value: 1, label: '110306' }];
  Activitycode: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },
    { value: 3, label: '003' },
    { value: 4, label: '004' },
    { value: 5, label: '005' },
    { value: 6, label: '006' },
    { value: 7, label: '007' },
    { value: 8, label: '008' },
    { value: 9, label: '009' },
    { value: 10, label: '010' },
  ];
  StandingInstructionCode: any[] = [];
  Organizationcode: any[] = [
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
  Makeupinvoice: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];
  Subpoenatype: any[] = [
    { value: 1, label: '現金收入傳票' },
    { value: 2, label: '現金支出傳票' },
    { value: 3, label: '轉帳傳票' },
  ];
  Subpoenastatus: any[] = [
    { value: 1, label: '現金收入傳票' },
    { value: 2, label: '現金支出傳票' },
    { value: 3, label: '轉帳傳票' },
  ];
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
    private translate: TranslateService,
    private IfdisplayService: IfdisplayService,
    private vendorService: VendorService,
    private userCodeService: UserCodeService,
    private counterCodeService: CounterCodeService, // 專櫃編號 service
    private violationCategoryService: ViolationCategoryService, // 違規類別編號 service
    private floorService: FloorService, // 樓層 service
    private deductionItemService: DeductionItemService, // 扣款項目 service
    private OrganizationNumberService: OrganizationNumberService
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
    this.router.navigate(['FIN7000/FIN72010']);
  }
}
