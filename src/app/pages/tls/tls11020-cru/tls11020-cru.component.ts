import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
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
    CAP_Item: [
      { value: '由系統帶入', disabled: true },
      [
        Validators.required,
        this.validationService.numberValidator,
        Validators.maxLength(3),
      ],
    ],
    CAP_Name: ['', [Validators.required, Validators.maxLength(40)]],
    CAP_Type: [null, [Validators.required]],
    AccNo: ['', [Validators.maxLength(14)]],
    GUI_FLAG: ['Y', [Validators.required]],
    CAP_TaxType: ['1', [Validators.required]],
    IsCommonlyUsed: ['Y', [Validators.required]],
    Print_Area: ['', [Validators.maxLength(5)]],
    CAP_Remark: ['', [Validators.maxLength(160)]],
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
    const capType = (raw.CAP_Type ?? '') as string;

    if (capType.length !== 1) {
      this.messageService.errorBubble('扣款類別(CAP_Type) 必須是一個單一字元');
      this.messageService.unblockUi();
      return;
    }

    const payload: any = {
      CAP_Type: capType,
      CAP_Name: raw.CAP_Name,
      AccNo: raw.AccNo,
      GUI_FLAG: raw.GUI_FLAG,
      CAP_TaxType: raw.CAP_TaxType,
      IsCommonlyUsed: raw.IsCommonlyUsed,
      Print_Area: raw.Print_Area,
      CAP_Remark: raw.CAP_Remark,
    };

    if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
      this.http
        .post(`${environment.ApiUrl}/TLS0000/TLS1000/insertTLS11020`, payload)
        .subscribe({
          next: () => {
            this.messageService.successBubble(
              this.translate.instant('success_message'),
            );
            this.router.navigate(['/TLS', 'TLS11020']);
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
      payload.id = this.rowdata?.id;
      payload.CAP_Item = this.rowdata?.CAP_Item;

      this.http
        .post(`${environment.ApiUrl}/TLS0000/TLS1000/updateTLS11020`, payload)
        .subscribe({
          next: () => {
            this.messageService.successBubble(
              this.translate.instant('updated-successfully'),
            );
            this.router.navigate(['/TLS', 'TLS11020']);
          },
          error: () => {
            this.messageService.errorBubble(
              this.translate.instant('update_failed'),
            );
          },
          complete: () => {
            this.messageService.unblockUi();
            this.submitted = false;
          },
        });
    } else {
      this.messageService.unblockUi();
    }
  }

  onClearForm(): void {
    this.inputForm.reset({
      CAP_Item: '由系統帶入',
      GUI_FLAG: 'Y',
      CAP_TaxType: '1',
      IsCommonlyUsed: 'N',
    });
  }
}
