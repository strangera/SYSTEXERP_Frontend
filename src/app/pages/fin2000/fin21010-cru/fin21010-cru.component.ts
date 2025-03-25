import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
//
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';
import { BankAccountCodeService } from '../../../service/basic/bank-account-code.service';
import { DepositCodeService } from '../../../service/basic/deposit-code.service';
import { NeedPayTicketService } from '../../../service/basic/need-pay-ticket.service';

//1.2.1.1 公司銀行資料維護 CRU
@Component({
  selector: 'app-fin21010-cru',
  templateUrl: './fin21010-cru.component.html',
  styleUrl: './fin21010-cru.component.scss'
})
export class FIN21010CRUComponent extends BasicCrupageComponent implements OnInit{
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    companyBankCode: [, [Validators.required]], // 公司銀行科目代號
    companyBankName: ['', [Validators.maxLength(40)]], // 公司銀行科目名稱
    bankCode: [], // 全省銀行代號
    account: [, [Validators.maxLength(15)]], // 帳號
    accountName: ['', [Validators.maxLength(80)]], // 帳戶名稱
    edi: [, [Validators.maxLength(12)]], // EDI用戶代號(統一編號)
    depositCode: [], // 存款代號
    needPayTicket: [], // 應付票據
    needReceiveTicket: [, [Validators.required]], // 應收票據
  });
  //
  // ----------------------------------------------------------------
  //
  bankCodeOptions:any[]=[];
  depositCodeOptions:any[]=[];
  needPayTicketOptions:any[]=[];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,
    //
    private bankAccountCodeService: BankAccountCodeService,
    private depositCodeService: DepositCodeService,
    private needPayTicketService: NeedPayTicketService,
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120001';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.bankAccountCodeService.getSystemTypes().subscribe(data => {
      this.bankCodeOptions = data;
    });
    //
    this.needPayTicketService.getNeedPayTickets().subscribe(data => {
      this.needPayTicketOptions = data;
    });
    //
    this.depositCodeService.getDepositCodes().subscribe(data => {
      this.depositCodeOptions = data;
      // 全選填入
      // let allSystemValues = this.depositCodeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   depositCode: allSystemValues
      // });
    });
    // ----------------------------------------------------------------
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
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onSubmit(frm: FormGroup){
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid){
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
    this.onSubmit(frm);
  }

  onCancel() {
    this.router.navigate(['/FIN2000/FIN21010']);
  }
}
