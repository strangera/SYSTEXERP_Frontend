import { Component, OnInit, } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { ValidationService } from '../../../shared/service/validation.service';
import { DeductionCategoryService } from '../../../service/basic/deduction-category.service';
import { TicketPaymentService } from './../../../service/basic/ticket-payment.service';
import { InstallmentPeriodService } from './../../../service/basic/installment-period.service';
import { SalesTypeService } from './../../../service/basic/sales-type.service';
import { ConfirmationService } from 'primeng/api';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

@Component({
  selector: 'app-tls11020-cru',
  templateUrl: './tls11020-cru.component.html',
  styleUrl: './tls11020-cru.component.scss'
})
// 2.1.2.1 扣款項目維護作業 CRU
export class TLS11020CRUComponent extends BasicCruPageComponent<any> {
  deductionCategoryOptions: any[] = [];

  inputForm = this.formBuilder.group({
    deductionItemNumber: [
      { value: '由系統帶入', disabled: true },
      [Validators.required, this.validationService.numberValidator, Validators.maxLength(3)]
    ],
    deductionItemName: ['', [Validators.required, Validators.maxLength(40)]],
    deductionCategory: [null, [Validators.required]],
    accNo: ['', [Validators.maxLength(14)]],
    guiFlag: ['Y', [Validators.required]],
    capTaxType: ['1', [Validators.required]],
    isCommonlyUsed: ['N', [Validators.required]],
    printArea: ['', [Validators.maxLength(5)]],
    remark: ['', [Validators.maxLength(160)]],
  });

  constructor(
    private translate: TranslateService,
    private validationService: ValidationService,
    private deductionCategoryService: DeductionCategoryService,
    private confirmationService: ConfirmationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS11020', this.inputForm);

    this.deductionCategoryService.getDeductionCategories().subscribe(data => {
      this.deductionCategoryOptions = data;
    });
  }

  Edit(rowdata: any) {
    this.inputForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.inputForm.patchValue(rowdata);
    this.inputForm.disable();
  }

  onSubmit() {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.inputForm.invalid) {
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  onClearForm() {
    this.inputForm.reset({
      deductionItemNumber: '由系統帶入',
      guiFlag: 'Y',
      capTaxType: '1',
      isCommonlyUsed: 'N',
    });
  }
}
