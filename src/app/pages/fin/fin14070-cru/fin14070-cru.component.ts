import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
//
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';
import { InvoiceCategoryService } from '../../../service/basic/invoice-category.service';

//1.1.4.7 二聯收銀機發票維護 CRU
@Component({
  selector: 'app-fin14070-cru',
  templateUrl: './fin14070-cru.component.html',
  styleUrl: './fin14070-cru.component.scss'
})
export class FIN14070CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    invoiceCategory: [], // 發票類別
    vendorUid: [, [Validators.maxLength(8)]], // 廠商編號(統一編號)
    registerID: [, [Validators.maxLength(6)]], // 收銀機編號
    declareYm: [], // 申報年月
    salesDate: [], // 	銷售日期
    wordTrack: ['', [Validators.maxLength(2)]], // 字軌
    invoiceIDStart: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票號碼(起)
    invoiceIDEnd: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票號碼(迄)
    invoiceNumber: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 發票張數
    taxPrice: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 應稅總金額

    notaxPrice: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 免稅銷售額
    notaxRatePrice: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 零稅率銷售額
    tax: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 稅額
    status: [], // 狀態碼

  });
  //
  // ----------------------------------------------------------------
  //
  statusOptions: any[] = [
    { value: 1, label: '正常' },
    { value: 2, label: '作廢' },
    { value: 3, label: '空白' },
  ];
  invoiceCategoryOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    //
    private validationService: ValidationService,
    private invoiceCategoryService: InvoiceCategoryService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110022';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.invoiceCategoryService.getSystemTypes().subscribe(data => {
      this.invoiceCategoryOptions = data;
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
    this.router.navigate(['/FIN1000/FIN14070']);
  }
}
