import { Component } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '../../../shared/service/validation.service';
import { DeductionService } from '../../../service/basic/deduction.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS11020Service } from '../../../service/api/tls/tls11020.service';
import { AccountingaccountService } from '../../../service/basic/accountingaccount.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';
import { Button } from 'primeng/button';

@Component({
    selector: 'app-tls11020-cru',
    templateUrl: './tls11020-cru.component.html',
    styleUrls: ['./tls11020-cru.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextComponent,
        DropdownComponent,
        NgIf,
   
        TranslateModule,
    ],
})
export class TLS11020CRUComponent extends BasicCruPageComponent<any> {
  deductionCategoryOptions: any[] = [];

  dataForm = this.formBuilder.group({
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
    AccNo: ['', [Validators.required, Validators.maxLength(14)]],
    GUI_FLAG: ['Y', [Validators.required]],
    CAP_TaxType: ['1', [Validators.required]],
    IsCommonlyUsed: ['Y', [Validators.required]],
   
    CAP_Remark: ['', [Validators.maxLength(160)]],
  });
  accountOptions: any[] = [];
  constructor(
    private translate: TranslateService,
    private validationService: ValidationService,
    private deductionService: DeductionService,
    private tls11020Service: TLS11020Service,
    private accountingaccountService: AccountingaccountService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS11020', this.dataForm);

    // 編輯狀態時禁用 CAP_Type
    if (this.crudstatus === CRUDStatus.Edit) {
      this.dataForm.get('CAP_Type')?.disable();
    }

    this.deductionService.getDeductionCategories().subscribe((data) => {
      this.deductionCategoryOptions = data;
    });

    this.accountingaccountService.getOptions().subscribe((data) => {
      this.accountOptions = (data || []).map(x => ({
        label: x.Name,
        formLabel: `${x.No} - ${x.Name}`,
        value: x.No
      }));
    });
  }


  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const raw = this.dataForm.getRawValue();
      const capType = raw.CAP_Type;

      // ✅ CAP_Type 長度檢查
      if (!capType || (capType as string).length !== 1) {
        this.messageService.errorBubble('扣款類別(CAP_Type) 必須是一個單一字元');
        return;
      }

      // ✅ 新增處理
      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        console.log('📤 新增送出的 payload：', raw);

        this.tls11020Service.insertTLS11020(raw).subscribe({
          next: () => {
            this.messageService.successBubble(this.translate.instant('success_message'));


            // ✅ 清空表單（保留 CAP_Item 為預設值）
            this.dataForm.reset();
            this.dataForm.get('CAP_Item')?.disable(); // 再次禁用
            this.dataForm.patchValue({
              CAP_Item: '由系統帶入',
              GUI_FLAG: 'Y',
              CAP_TaxType: '1',
              IsCommonlyUsed: 'Y'
            });
          },
          error: () => {
            this.messageService.errorBubble(this.translate.instant('create_failed'));
          },
        });
      }

      // ✅ 編輯處理
      else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        (raw as any).id = this.rowdata?.id;
        raw.CAP_Item = this.rowdata?.CAP_Item;

        console.log('📤 更新送出的 payload：', raw);

        this.tls11020Service.updateTLS11020(raw).subscribe({
          next: () => {
            this.messageService.successBubble(this.translate.instant('updated-successfully'));
            this.onCancel() // ✅ 導回查詢頁
            // ✅ 清空表單並保留預設值（同新增時處理）
            this.dataForm.reset();
            this.dataForm.get('CAP_Item')?.disable();
            this.dataForm.patchValue({
              CAP_Item: '由系統帶入',
              GUI_FLAG: 'Y',
              CAP_TaxType: '1',
              IsCommonlyUsed: 'Y'
            });
          },
          error: () => {
            this.messageService.errorBubble(this.translate.instant('update_failed'));
          },
        });
      }
    });
  }
  onClear(): void {
    const keepValues = {
      CAP_Item: this.dataForm.get('CAP_Item')?.value,
      CAP_Type: this.dataForm.get('CAP_Type')?.value,

    };
    // 重設表單
    this.dataForm.reset();
    // 設回保留欄位的值
    this.dataForm.patchValue(keepValues);
    this.dataForm.markAsPristine();
  }
  clearBtnConfig = {
    label: '清除',
    class: 'button-clear',
    text: true
  };

}





