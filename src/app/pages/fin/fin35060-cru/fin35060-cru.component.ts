import { Component, OnInit, ViewEncapsulation, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

@Component({
  selector: 'app-fin35060-cru',
  templateUrl: './fin35060-cru.component.html',
  styleUrl: './fin35060-cru.component.scss'
})
export class FIN35060CRUComponent extends BasicCrupageComponent implements OnInit {
  CashRegisterTypeItems: any[] = [
    { label: '業主', value: '1' },
    { label: '非業主', value: '2' },
  ];
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    depositSerialNumberStart: [], // 保證金序號
    depositSerialNumberEnd: [],

    vendorCode: [], // 廠商編號
    counterCode: [], // 專櫃編號
    documentType: [], // 單據別
    amountStart: [], // 金額
    amountEnd: [],

    receiptDate: [], // 收款日期
    receiptDateEnd: [],

    depositDueDate: [], // 保證金到期日
    depositDueDateEnd: [],

    checkNumber: [], // 支票號碼
    financialInstitution: [], // 金融機構
    summary: [], // 摘要

    status: [], // 狀態
    statusChangeDate: [], // 狀態變更日期
    statusChangeDateEnd: [],

    debitAccount: [], // 收款會計科目(借)
    creditAccount: [], // 保證金會計科目(貸)

    voucherNumberStart: [], // 傳票編號
    voucherNumberEnd: [],

    clearingCode: [], // 立沖代號
    sourceSystem: [], // 來源系統別
    recruitmentNumberStart: [], // 專櫃招募編號
    recruitmentNumberEnd: [],

    depositType: [], // 保證金類型
    organizationCode: [], // 組織代號
    targetCode: [], // 對象別編號
    reconciliationKey: [], // 對帳KEY值
    depositSerialNumber: [],
    billDueDate: [],
    EbillDueDate: [],
    isPostVoucher: [],
    recruitmentNumber: [],
    voucherNumber: [],
    amount: [],
    // ----------------------------------------------------------------
    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // Dropdown options
  debitAccount: any[] = [
    { value: 1, label: '110302' },


  ];
  creditAccount: any[] = [
    { value: 1, label: '110301' },
    { value: 2, label: '110302' },

  ];
  isPostVoucher: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },

  ];
  vendorCodeOptions: any[] = [
    { value: 1, label: '00000000-1' },
    { value: 2, label: '00000000-2' },
    { value: 3, label: '00000000-3' },
    { value: 4, label: '00000000-4' },
    { value: 5, label: '00000000-5' },
    { value: 6, label: '00000000-7' },
    { value: 7, label: '00000000-8' },
    { value: 8, label: '00852492-1' },
    { value: 9, label: '01052878-1' },
    { value: 10, label: '01508949-1' },
  ];
  documentTypeOptions: any[] = [
    { value: 1, label: '現金' },
    { value: 2, label: '支票' },
    { value: 3, label: '商業本票' },
  ];
  financialInstitutionOptions: any[] = [
    { value: 1, label: '000000' },
    { value: 2, label: '000022' },
    { value: 3, label: '0040037' },
    { value: 4, label: '0040059' },
    { value: 5, label: '0040071' },
    { value: 6, label: '0040082' },
    { value: 7, label: '0040093' },
    { value: 8, label: '0040107' },
    { value: 9, label: '0040118' },
    { value: 10, label: '0040129' },
  ];
  statusOptions: any[] = [
    { value: 1, label: '建立' },

  ];
  // { value: 2, label: '已退還' },
  // { value: 3, label: '收款挪轉' },
  depositTypeOptions: any[] = [
    { value: 1, label: '押金' },
    { value: 2, label: '履約保證金' },
    { value: 3, label: '施工保證金' },
  ];
  organizationCodeOptions: any[] = [
    { value: 1, label: '全公司' },
    { value: 2, label: '稽核室' },
    { value: 3, label: '經營企劃部(停用)' },
    { value: 4, label: '行政Team(停用)' },
    { value: 5, label: '公關Team(停用)' },
    { value: 6, label: '營企Team(停用)' },
    { value: 7, label: '電子商務team(停用)' },
    { value: 8, label: '外商Team(停用)' },
    { value: 9, label: '個資小組' },
    { value: 10, label: '品牌代理小組(停用)' },
  ];
  targetCodeOptions: any[] = [
    { value: 1, label: '臺南紡織股份有限公司' },
    { value: 2, label: '統一企業股份有限公司' },
    { value: 3, label: '統正開發股份有限公司' },
  ];

  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '130011';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
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
      name: ['', [Validators.required, Validators.maxLength(14)]], // Input Text
      CashRegisterType: ['1', Validators.required], // 收銀機型態
      SalesDate: ['', Validators.required], // 銷售日期
      CashRegisterCode: ['', Validators.required], // 收銀機代號
      TransactionSerialNumber: ['', Validators.required], // 交易流水號
      CounterNumber: ['', Validators.required], // 專櫃編號
      TwoPartInvoiceNumberStart: ['', Validators.required], // 二聯發票號碼(起號)
      TwoPartInvoiceNumberEnd: ['', Validators.required], // 二聯發票號碼(迄號)
      TaxableAmount: ['', Validators.required], // 應稅金額
      TaxFreeAmount: ['', Validators.required], // 免稅金額
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
  }//CRU

  onCancel() {
    this.router.navigate(['/demo/demofin35060']);
  }
}
