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
import { PaymentMethodService } from '../../../service/basic/payment-method.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';

//1.2.5.1 產生電匯付款資料 CRU
@Component({
  selector: 'app-fin25010-cru',
  templateUrl: './fin25010-cru.component.html',
  styleUrl: './fin25010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputNumberRangeComponent, InputNumberComponent, DropdownComponent, NgIf, TranslateModule]
})
export class FIN25010CRUComponent extends BasicCrupageComponent implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    settlementDate: [, [Validators.required]], // 收/付款日
    startFactoryID: [, [this.validationService.numberValidator, Validators.max(99999999999999)]], // 廠客代號
    endFactoryID: [, [this.validationService.numberValidator, Validators.max(99999999999999)]], // 廠客代號
    shouldPayId: [, [this.validationService.numberValidator, Validators.maxLength(14)]], // 應付帳款ID
    Subpoenastatus: [], // 傳票型態
    payoutMethod: [], // 付款方式
  });
  //
  // ----------------------------------------------------------------
  //
  Subpoenastatus: any[] = [
    { value: 1, label: '作廢' },
    { value: 2, label: '建立' },
    { value: 3, label: '確認' },
    { value: 4, label: '過帳' },
    { value: 5, label: '刪除' },
  ];
  payoutMethodOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private translate: TranslateService,
    private validationService: ValidationService,
    //
    private paymentMethodService: PaymentMethodService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120017';
    //
    // ----------------------------------------------------------------
    //
    // ----------------------------------------------------------------
    //
    this.paymentMethodService.getSystemTypes().subscribe(data => {
      this.payoutMethodOptions = data;
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
    this.router.navigate(['/FIN2000/FIN25010']);
  }
}
