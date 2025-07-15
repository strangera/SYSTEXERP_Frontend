import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
//
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';
import { TransportationMethodService } from '../../../service/basic/transportation-method.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';

//3.1.1.6 供應商資料維護作業  CRU
@Component({
    selector: 'app-ass11060-cru',
    templateUrl: './ass11060-cru.component.html',
    styleUrl: './ass11060-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, DropdownComponent, EditorTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class ASS11060CRUComponent extends BasicCrupageComponent implements OnInit {
  //
  deliveryMethodOptions: any[] = [];
  returnMethodOptions: any[] = [
    { value: 1, label: '貨運' },
    { value: 2, label: '自取' },
    { value: 3, label: '其他' },
  ];

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    vendorId: [, [Validators.required, Validators.maxLength(12)]], // 廠商編號
    vendorUid: [, [Validators.maxLength(10)]], // 廠商統一編號
    vendorCName: ['', [Validators.required, Validators.maxLength(60)]], // 廠商名稱(中文)
    vendorEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    vendorSName: ['', [Validators.required, Validators.maxLength(10)]], // 廠商簡稱
    // invoiceAddress: ['', [Validators.maxLength(60)]], // 發票地址
    //
    principal: ['', [Validators.maxLength(12)]], // 負責人
    principalTitle: ['', [Validators.maxLength(16)]], // 負責人職稱
    principalUid: ['', [Validators.maxLength(10)]], // 負責人身份証字號
    principalPhone: [, [Validators.maxLength(15)]], // 負責人電話
    principalAddress: ['', [Validators.maxLength(100)]], // 負責人聯絡地址
    principalEmail: ['', [Validators.maxLength(60)]], // 負責人電子郵件
    //
    companyAddress: ['', [Validators.required, Validators.maxLength(100)]], // 公司登記地址
    companyContactAddress: ['', [Validators.required, Validators.maxLength(100)]], // 通訊地址 *
    companyPhone: [, [Validators.maxLength(15)]], // 公司登記電話
    companyFax: [, [Validators.maxLength(15)]], // 公司傳真
    //
    orderingAddress: ['', [Validators.maxLength(100)]], // 訂貨地址
    orderingPhone: [, [Validators.maxLength(12)]], // 訂貨電話
    orderingFax: [, [Validators.maxLength(12)]], // 訂貨傳真
    //
    factoryAddress: ['', [Validators.maxLength(100)]], // 工廠地址
    factoryPhone: [, [Validators.maxLength(12)]], // 工廠電話
    factoryFax: [, [Validators.maxLength(12)]], // 工廠傳真
    //
    deliveryMethod: [[] as number[]], // 送貨方式
    returnMethod: [[] as number[]], // 退貨處理方式
    //
    deliveryDate: [, [Validators.maxLength(8)]], // 廠商送貨期限
    //
    remark: [,], // 附註
  });
  //
  // ----------------------------------------------------------------
  //

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,
    //
    private transportationMethodService: TransportationMethodService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310006';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    //
    this.transportationMethodService.getSystemTypes().subscribe(data => {
      this.deliveryMethodOptions = data;
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
    this.router.navigate(['/ASS1000/ASS11060']);
  }
}
