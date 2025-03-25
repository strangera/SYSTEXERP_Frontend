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
import { VendorService } from '../../../service/basic/vendor.service';
import { PaymentMethodService } from '../../../service/basic/payment-method.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';

//1.2.3.1 暫付款申請作業 CRU
@Component({
  selector: 'app-fin23010-cru',
  templateUrl: './fin23010-cru.component.html',
  styleUrl: './fin23010-cru.component.scss'
})
export class FIN23010CRUComponent extends BasicCrupageComponent implements OnInit{
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    advanceSheetNumber: [, [Validators.required, Validators.maxLength(13)]], // 預支單號
    requestDate: [, [Validators.required]], //申請日期
    advanceAmount: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(10)]], // 預支金額
    writeOffDate: [, [Validators.required]], //預計核銷日
    requsetEmployee: [, [Validators.required]], //申請廠商/員工
    payoutMethod: [], //付款方式
    transferAccount: [, [Validators.maxLength(20)]], //匯款銀行代號
    bankAccount: [, [Validators.maxLength(20)]], // 銀行帳號
    accountName: ['', [Validators.maxLength(64)]], // 帳戶名稱
    ticketTransfer: [], // 票據禁止背書轉讓
    ticketTitle: ['', [Validators.maxLength(20)]], // 票據抬頭
    eExpectPayDate: [, [Validators.required]], //預計付款日
    organization: [, [Validators.required]], //費用組織
    summary: ['', [Validators.maxLength(160)]], // 摘要
  });
  //
  // ----------------------------------------------------------------
  //
  requsetEmployeeOptions:any[]=[];
  payoutMethodOptions:any[]=[];
  whetherOptions:any[]=[];
  organizationOptions:any[]=[];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,
    //
    private vendorService: VendorService,
    private paymentMethodService: PaymentMethodService,
    private whetherService: WhetherService,
    private organizationNumberService: OrganizationNumberService,
    ) {
      super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120007';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    //
    this.vendorService.getVendors().subscribe(data => {
      this.requsetEmployeeOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationOptions = data;
    });
    //
    this.paymentMethodService.getSystemTypes().subscribe(data => {
      this.payoutMethodOptions = data;
      // 全選填入
      // let allSystemValues = this.payoutMethodOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   payoutMethod: allSystemValues
      // });
    });
    //
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;
      // 全選填入
      // let allSystemValues = this.whetherOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   ticketTransfer: allSystemValues
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
    this.router.navigate(['/FIN2000/FIN23010']);
  }
}
