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
import { TaxTypeService } from '../../../service/basic/tax-type.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';

//1.1.4.2 進貨退出或折讓資料維護 CRU
@Component({
  selector: 'app-fin14020-cru',
  templateUrl: './fin14020-cru.component.html',
  styleUrl: './fin14020-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, CalendarComponent, DropdownComponent, ButtonComponent, NgIf, TranslateModule]
})
export class FIN14020CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    returnTicket: [, [this.validationService.numberValidator, Validators.required, Validators.maxLength(12)]], // 退出/折讓單號
    wordTrack: ['', [Validators.maxLength(2)]], // 字軌
    invoiceTicket: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 發票號碼
    invoiceDate: [], // 	發票日期
    returnDate: [, [Validators.required]], // 退出/折讓日期
    invoiceFormat: [], // 發票格式
    onedatemm: [], // 申報年月
    usage: [], // 區別
    taxType: [, [Validators.required]], // 課稅別
    salesAmount: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 	銷售額
    tax: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 	稅額
    returnCash: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 退出/折讓金額
    returnTax: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 退出/折讓稅額
    returnTotal: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 退出/折讓總金額
    already_ReturnTotal: [, [this.validationService.numberValidator, Validators.maxLength(8)]], //已退出/折讓歷史總金額
    remaining_Total: [, [this.validationService.numberValidator, Validators.maxLength(8)]], //剩餘總金額
    voucherTicket: [, [this.validationService.numberValidator, Validators.maxLength(14)]], // 憑證單號
    summonsTicket: [, [this.validationService.numberValidator, Validators.maxLength(11)]], // 傳票編號
  });
  //
  // ----------------------------------------------------------------
  //
  invoiceFormatOptions: any[] = [
    { value: 1, label: 21 },
    { value: 2, label: 22 },
    { value: 3, label: 23 },
  ];
  //
  categoryOptions: any[] = [
    { value: 1, label: '退出' },
    { value: 2, label: '折讓' },
  ];
  taxTypeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    //
    private validationService: ValidationService,
    private taxTypeService: TaxTypeService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110017';
    //

    //
    this.taxTypeService.getTaxTypes().subscribe(data => {
      this.taxTypeOptions = data;
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
    this.router.navigate(['/FIN1000/FIN14020']);
  }
}
