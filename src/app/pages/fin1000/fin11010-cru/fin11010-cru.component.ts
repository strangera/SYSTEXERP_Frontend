import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
//
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { AllpayCodeService } from './../../../service/basic/allpay-code.service';
import { WhetherService } from './../../../service/basic/whether.service';

//1.1.1.1 營業人申報設定 CRU
@Component({
  selector: 'app-fin11010-cru',
  templateUrl: './fin11010-cru.component.html',
  styleUrl: './fin11010-cru.component.scss'
})
export class FIN11010CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    bId: [, [Validators.required, Validators.maxLength(8)]], // 公司代號(統一編號)
    bName: ['', [Validators.required, Validators.maxLength(60)]], // 營業人名稱
    taxNumber: [, [Validators.required, Validators.maxLength(9)]], // 稅籍編號
    chargePerson: ['', [Validators.required, Validators.maxLength(12)]], // 負責人姓名
    bAddress: ['', [Validators.required, Validators.maxLength(100)]], // 營業地址
    allPayCode: [, [Validators.required]], // 總繳代號
    directDeduction: [, [Validators.required]], // 是否採直接扣扺法
    ubId: [, [Validators.maxLength(8)]], // 總公司統編
    apply: [, [Validators.required]], // 自行或委託辦理申報註記
    notifierName: ['', [Validators.required, Validators.maxLength(12)]], // (代理)申報人姓名
    notifierPhone: [, [Validators.required, Validators.maxLength(20)]], // (代理)申報人電話
    notifierCertificate: [, [Validators.maxLength(50)]], // 代理申報人證書(登錄)字號
    startdate: [, [Validators.required]], // 申報年月起
  });
  //
  payMethodOptions: any[] = [];
  whetherOptions: any[] = [];
  applyOptions: any[] = [
    { value: 1, label: '本事業或關係企業職員(自行申報)' },
    { value: 2, label: '記帳及報稅代理業務人申報' },
  ];
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    //
    private allpayCodeService: AllpayCodeService,
    private whetherService: WhetherService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110001';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;
    });
    // 
    this.allpayCodeService.getAllpayCodes().subscribe(data => {
      this.payMethodOptions = data;
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
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
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
    this.router.navigate(['/FIN1000/FIN11010']);
  }
}
