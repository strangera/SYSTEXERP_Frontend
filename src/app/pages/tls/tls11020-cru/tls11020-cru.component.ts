import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { TranslateService } from '@ngx-translate/core';
import { ValidationService } from '../../../shared/service/validation.service';
import { DeductionCategoryService } from '../../../service/basic/deduction-category.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-tls11020-cru',
  templateUrl: './tls11020-cru.component.html',
  styleUrls: ['./tls11020-cru.component.scss'],
})
export class TLS11020CRUComponent extends BasicCruPageComponent<any> {
  deductionCategoryOptions: any[] = [];

  inputForm = this.formBuilder.group({
    deductionItemNumber: [
      { value: '由系統帶入', disabled: true },
      [
        Validators.required,
        this.validationService.numberValidator,
        Validators.maxLength(3),
      ],
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
    private http: HttpClient,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS11020', this.inputForm);

    this.deductionCategoryService.getDeductionCategories().subscribe((data) => {
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

  onSubmit(): void {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.inputForm.invalid) {
      this.messageService.errorBubble(
        this.translate.instant('form_error_message'),
      );
      this.messageService.unblockUi();
      return;
    }

    const raw = this.inputForm.getRawValue();
    const capType = (raw.deductionCategory ?? '') as string;

    if (capType.length !== 1) {
      this.messageService.errorBubble('扣款類別(CAP_Type) 必須是一個單一字元');
      this.messageService.unblockUi();
      return;
    }

    const payload = {
 
        CAP_Type: capType,
        CAP_Name: raw.deductionItemName,
        AccNo: raw.accNo,
        GUI_FLAG: raw.guiFlag,
        CAP_TaxType: raw.capTaxType,
        IsCommonlyUsed: raw.isCommonlyUsed,
        Print_Area: raw.printArea,
        CAP_Remark: raw.remark,
      
    };
    console.log('🚀 送出 payload:', payload);
    if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
      this.http
        .post(`${environment.ApiUrl}/TLS0000/TLS1000/insertTLS11020`, payload)
        .subscribe({
          next: () => {
            this.messageService.successBubble(
              this.translate.instant('success_message'),
            );
            this.router.navigate(['/TLS11020']);
          },
          error: () => {
            this.messageService.errorBubble(
              this.translate.instant('create_failed'),
            );
          },
          complete: () => {
            this.messageService.unblockUi();
            this.submitted = false;
          },
        });
    } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
      this.messageService.successBubble(
        this.translate.instant('updated-successfully'),
      );
      this.messageService.unblockUi();
      this.submitted = false;
    } else {
      this.messageService.unblockUi();
    }
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
