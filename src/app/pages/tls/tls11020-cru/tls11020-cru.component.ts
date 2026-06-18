import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { TLS11020Service } from '../../../service/api/tls/tls11020.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { ValidationService } from '../../../shared/service/validation.service';

import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
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
    NgIf,
    TranslateModule,
  ],
})
export class TLS11020CRUComponent extends BasicCruPageComponent<any> {
  // 讓 HTML 可以用 CRUDStatus
  CRUDStatus = CRUDStatus;

  deductionCategoryOptions = [
    { value: 'A', label: 'A-一次扣款' },
    { value: 'B', label: 'B-每月扣款' },
    { value: 'C', label: 'C-平均分攤' },
    { value: 'D', label: 'D-比率分攤' },
    { value: 'E', label: 'E-活動扣款' },
    { value: 'Z', label: 'Z-其他扣款' },
  ];
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
    Print_Area: ['', [Validators.maxLength(100)]],
    CAP_BaseRate: ['', [Validators.maxLength(5), Validators.required]],
    CAP_Remark: ['', [Validators.maxLength(160)]],
  });

  constructor(
    private translate: TranslateService,
    private validationService: ValidationService,
    private tls11020Service: TLS11020Service,
    private dropdownApiService: DropdownApiService
  ) {
    super();
  }

ngOnInit(): void {
  this.initializePage('TLS11020', this.dataForm);

  if (this.crudstatus === CRUDStatus.Edit) {
    this.dataForm.get('CAP_Type')?.disable();
  }

  this.dropdownApiService.queryGls1005().subscribe((data) => {
    this.accountOptions = (data ?? []).map((x: any) => ({
      label: `${x.No} - ${x.Name}`,
      formLabel: `${x.No} - ${x.Name}`,
      value: x.No,
    }));
  });

  // ✅ 在「表單值 & disable 狀態」都確定後，存起來當作清除時要回到的預設
  this.initialFormSnapshot = this.dataForm.getRawValue();
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

        this.tls11020Service.updateTLS11020(raw).subscribe({
          next: () => {
            this.messageService.successBubble(
              this.translate.instant('updated-successfully')
            );
            this.onCancel();          // 回列表（帶 fromCru）
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
  // 沒快照就退回你原本的 resetFormToDefault()
  if (!this.initialFormSnapshot) {
    this.resetFormToDefault();
    return;
  }

  // 1) 先 reset
  this.dataForm.reset();

  // 2) 再回填「進頁面時的預設值」
  this.dataForm.patchValue(this.initialFormSnapshot, { emitEvent: false });

  // 3) 還原 disabled 狀態（CAP_Item 永遠 disabled；Edit 時 CAP_Type disabled）
  this.dataForm.get('CAP_Item')?.disable();
  if (this.crudstatus === CRUDStatus.Edit) {
    this.dataForm.get('CAP_Type')?.disable();
  }

  this.dataForm.markAsPristine();
  this.dataForm.markAsUntouched();
}

private initialFormSnapshot: any = null;
  private resetFormToDefault(): void {
    this.dataForm.reset();
    this.dataForm.get('CAP_Item')?.disable();
    this.dataForm.patchValue({
      CAP_Item: '由系統帶入',
      GUI_FLAG: 'Y',
      CAP_TaxType: '1',
      IsCommonlyUsed: 'Y',
      Print_Area: '',
      CAP_BaseRate: '',
    });
    this.dataForm.markAsPristine();
  }
}
