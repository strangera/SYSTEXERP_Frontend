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
import { WhetherService } from './../../../service/basic/whether.service';
import { AllInvoiceCategoryService } from '../../../service/basic/all-invoice-category.service';
import { ValidationService } from '../../../shared/service/validation.service';

//1.1.1.2 發票基本資料維護 CRU
@Component({
  selector: 'app-fin11020-cru',
  templateUrl: './fin11020-cru.component.html',
  styleUrl: './fin11020-cru.component.scss'
})
export class FIN11020CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    onedatemm: [, [Validators.required]], // 發票年月
    track: ['', [Validators.required, Validators.maxLength(2)]], // 字軌
    startserialticket: [, [this.validationService.numberValidator, Validators.max(99999999), Validators.required]], // 發票號碼(起)
    endserialticket: [, [this.validationService.numberValidator, Validators.max(99999999), Validators.required]], // 發票號碼(迄)
    invoiceCategory: [, [Validators.required]], // 類別
    viceTicket: [], // 有無副聯
    declareYm: [, [Validators.required]], // 申報年月
    rollNumber: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 卷數
  });
  //
  invoiceCategoryOptions: any[] = [];
  whetherOptions: any[] = [];
  // ----------------------------------------------------------------
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    //
    private validationService: ValidationService,
    private allInvoiceCategoryService: AllInvoiceCategoryService,
    private whetherService: WhetherService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110002';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    //
    this.allInvoiceCategoryService.getAllInvoiceCategorys().subscribe(data => {
      this.invoiceCategoryOptions = data;
    });
    //
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;
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
    this.router.navigate(['/FIN1000/FIN11020']);
  }
}
