import { Component } from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { ValidationService } from '../../../shared/service/validation.service';
import { DeductionService } from '../../../service/basic/deduction.service';
import { TLS11020Service } from '../../../service/api/tls/tls11020.service';
import { AccountingaccountService } from '../../../service/basic/accountingaccount.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';

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
    // NgIf,
    TranslateModule,
  ],
})
export class TLS11020CRUComponent extends BasicCruPageComponent<any> {
  deductionCategoryOptions: any[] = [];
  accountOptions: any[] = [];

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
    // ✅ 合約列印區分
    Print_Area: ['', [Validators.maxLength(10)]],
    CAP_Remark: ['', [Validators.maxLength(160)]],
  });

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
    // 初始化，帶入 crudstatus / rowdata / 權限
    this.initializePage('TLS11020', this.dataForm);

    // 編輯時 CAP_Type 不可改
    if (this.crudstatus === CRUDStatus.Edit) {
      this.dataForm.get('CAP_Type')?.disable();
    }

    this.deductionService.getDeductionCategories().subscribe((data) => {
      this.deductionCategoryOptions = data;
    });

    this.accountingaccountService.getOptions().subscribe((data) => {
      this.accountOptions = (data || []).map((x: any) => ({
        label: x.Name,
        formLabel: `${x.No} - ${x.Name}`,
        value: x.No,
      }));
    });
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const raw = this.dataForm.getRawValue();
      const capType = raw.CAP_Type as string | null | undefined;

      // ✅ CAP_Type 必須剛好 1 個字元
      if (!capType || capType.length !== 1) {
        this.messageService.errorBubble('扣款類別(CAP_Type) 必須是一個單一字元');
        return;
      }

      // === 新增 ===
      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        console.log('📤 新增送出的 payload：', raw);

        this.tls11020Service.insertTLS11020(raw).subscribe({
          next: () => {
            this.messageService.successBubble(
              this.translate.instant('success_message')
            );
            this.resetFormToDefault();
          },
          error: () => {
            this.messageService.errorBubble(
              this.translate.instant('create_failed')
            );
          },
        });
      }

      // === 編輯 ===
      else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        (raw as any).id = this.rowdata?.id;
        raw.CAP_Item = this.rowdata?.CAP_Item;

        console.log('📤 更新送出的 payload：', raw);

        this.tls11020Service.updateTLS11020(raw).subscribe({
          next: () => {
            this.messageService.successBubble(
              this.translate.instant('updated-successfully')
            );
            this.onCancel();
            this.resetFormToDefault();
          },
          error: () => {
            this.messageService.errorBubble(
              this.translate.instant('update_failed')
            );
          },
        });
      }
    });
  }

  // 自訂清除：保留 CAP_Item & CAP_Type
  onClear(): void {
    const keepValues = {
      CAP_Item: this.dataForm.get('CAP_Item')?.value,
      CAP_Type: this.dataForm.get('CAP_Type')?.value,
    };

    this.dataForm.reset();
    this.dataForm.patchValue(keepValues);
    this.dataForm.markAsPristine();
  }

  private resetFormToDefault(): void {
    this.dataForm.reset();
    this.dataForm.get('CAP_Item')?.disable();
    this.dataForm.patchValue({
      CAP_Item: '由系統帶入',
      GUI_FLAG: 'Y',
      CAP_TaxType: '1',
      IsCommonlyUsed: 'Y',
      Print_Area: '',
    });
    this.dataForm.markAsPristine();
  }
}
