import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';

@Component({
  selector: 'app-sysb100.cru',
  templateUrl: './sysb100.cru.component.html',
  styleUrl: './sysb100.cru.component.scss'
})
//4.1.1.1 公司基本資料維護作業 CRU
export class SYSB100CRUComponent extends BasicCrupageComponent implements OnInit{
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    branchCode: ['', [Validators.required, Validators.maxLength(4)]], //分店代號
    unifiedNumber: [, [Validators.required, Validators.maxLength(8)]], // 公司代號(統一編號)
    companyCName: ['', [Validators.required, Validators.maxLength(60)]], // 公司名稱(中文)
    mallName: ['', [Validators.required, Validators.maxLength(40)]], // 商場名稱
    companyEName: ['', [Validators.required, Validators.maxLength(60)]], // 公司名稱(英文)
    taxNumber: [, [Validators.required, Validators.maxLength(9)]], // 稅籍編號
    principal: ['', [Validators.required, Validators.maxLength(12)]], // 負責人
    contactPerson: ['', [Validators.required, Validators.maxLength(12)]], // 聯絡人
    contactPersonPhone: ['', [Validators.required, Validators.maxLength(15)]], // 聯絡人電話
    contactPersonFax: ['', [Validators.required, Validators.maxLength(15)]], // 聯絡人傳真
    postalCode: [, [Validators.required, Validators.maxLength(5)]], // 郵遞區號
    BusinessCertificateNumber: [, [Validators.maxLength(10)]], // 營業登記證號
    companyPhone: ['', [Validators.maxLength(15)]], // 公司電話
    companyCAddress: ['', [Validators.required, Validators.maxLength(100)]], // 公司(營業處)地址(中文)
    companyEAddress: ['', [Validators.required, Validators.maxLength(100)]], // 公司(營業處)地址(英文)
    registeredCAddress: ['', [Validators.required, Validators.maxLength(100)]], // 公司登記地址(中文)
    registeredEAddress: ['', [Validators.required, Validators.maxLength(100)]], //公司登記地址(英文)
    invoiceAddress: ['', [Validators.maxLength(60)]], //發票地址
    mailingPhone: ['', [Validators.maxLength(15)]], // 郵寄電話
    mailingFex: ['', [Validators.maxLength(15)]], // 郵寄傳真
    mailingAddress: ['', [Validators.maxLength(60)]], // 郵寄地址
    email: ['', [Validators.maxLength(60)]], // 電子郵件信箱
    companyWebsite: ['', [Validators.maxLength(60)]], // 公司網址
  });
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
    this.ProgNo = '410001';
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
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU

  onCancel() {
    this.router.navigate(['/SYSB000/SYSB100']);
  }
}
