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

import { NgIf } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

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
  capSaletypeOptions: any[] = [];
  edcBankOptions: any[] = [];
  instmsTypeOptions: any[] = [];
  payNoOptions: any[] = [];
  calcTypeOptions: any[] = [];

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
    Print_Area: ['', [Validators.maxLength(100)]],
    CAP_BaseRate: ['', [Validators.maxLength(5)]],
    CAP_Remark: ['', [Validators.maxLength(160)]],
    CAP_SALETYPE: [null as string | null],
    EDC_BANK: [null as string | null],
    INSTMS_TYPE: [null as string | null],
    PAY_NO: [null as string | null],
    CALC_TYPE: [null as string | null],
    DOWN_PAYMENT: [null as number | null],
    OVER_BASE_RATE: [null as number | null],
  });

  constructor(
    private translate: TranslateService,
    private validationService: ValidationService,
    private tls11020Service: TLS11020Service,
    private readonly dropdownApiService: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS11020', this.dataForm);

    if (this.crudstatus === CRUDStatus.Edit) {
      this.dataForm.get('CAP_Type')?.disable();
    }

    this.dataForm.get('CAP_Type')?.valueChanges.subscribe((v) => {
      this.applyBaseRateRule(v as string | null);
    });
    this.applyBaseRateRule(this.dataForm.get('CAP_Type')?.value ?? null);

    this.dropdownApiService.queryGls1005().subscribe((data) => {
      this.accountOptions = (data ?? []).map((x: any) => ({
        label: `${x.No} - ${x.Name}`,
        formLabel: `${x.No} - ${x.Name}`,
        value: x.No,
      }));
    });

    this.dropdownApiService.querySys1000({ SYS_Type: 'CAP_SALETYPE' }).subscribe((data) => {
      this.capSaletypeOptions = (data ?? []).map((x: any) => ({
        label: `${x.No} - ${x.Name}`,
        value: x.No,
      }));
    });

    this.dropdownApiService.querySys1000({ SYS_Type: 'EDC_Bank' }).subscribe((data) => {
      this.edcBankOptions = (data ?? []).map((x: any) => ({
        label: `${x.No} - ${x.Name}`,
        value: x.No,
      }));
    });

    this.dropdownApiService.querySys1000({ SYS_Type: 'instms_type' }).subscribe((data) => {
      this.instmsTypeOptions = (data ?? []).map((x: any) => ({
        label: `${x.No} - ${x.Name}`,
        value: x.No,
      }));
    });

    this.dropdownApiService.querySys1000({ SYS_Type: 'pay_no' }).subscribe((data) => {
      this.payNoOptions = (data ?? []).map((x: any) => ({
        label: `${x.No} - ${x.Name}`,
        value: x.No,
      }));
    });

    this.dropdownApiService.querySys1000({ SYS_Type: 'CALC_TYPE' }).subscribe((data) => {
      this.calcTypeOptions = (data ?? []).map((x: any) => ({
        label: `${x.No} - ${x.Name}`,
        value: x.No,
      }));
    });

    this.initialFormSnapshot = this.dataForm.getRawValue();
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const raw = this.dataForm.getRawValue();
      const capType = raw.CAP_Type as string | null | undefined;

      if (!capType || capType.length !== 1) {
        this.messageService.errorBubble('扣款類別(CAP_Type) 必須是一個單一字元');
        return;
      }

      (raw as any).CAP_BaseRate =
        raw.CAP_BaseRate === '' || raw.CAP_BaseRate == null
          ? null
          : raw.CAP_BaseRate;

      (raw as any).DOWN_PAYMENT =
        raw.DOWN_PAYMENT === null || raw.DOWN_PAYMENT === undefined || (raw.DOWN_PAYMENT as any) === ''
          ? null
          : parseFloat(String(raw.DOWN_PAYMENT));

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
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        (raw as any).id = this.rowdata?.id;
        raw.CAP_Item = this.rowdata?.CAP_Item;

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

  onClear(): void {
    if (!this.initialFormSnapshot) {
      this.resetFormToDefault();
      return;
    }

    this.dataForm.reset();
    this.dataForm.patchValue(this.initialFormSnapshot, { emitEvent: false });
    this.dataForm.get('CAP_Item')?.disable();
    if (this.crudstatus === CRUDStatus.Edit) {
      this.dataForm.get('CAP_Type')?.disable();
    }
    this.dataForm.markAsPristine();
    this.dataForm.markAsUntouched();
  }

  get isBaseRateVisible(): boolean {
    return String(this.dataForm.get('CAP_Type')?.value ?? '') === 'D';
  }

  get isCalcTypeVisible(): boolean {
    return this.isBaseRateVisible && String(this.dataForm.get('CAP_SALETYPE')?.value ?? '') === '5';
  }

  get isDownPaymentVisible(): boolean {
    return this.isCalcTypeVisible && String(this.dataForm.get('CALC_TYPE')?.value ?? '') === '1';
  }

  get isOverBaseRateVisible(): boolean {
    return this.isCalcTypeVisible && String(this.dataForm.get('CALC_TYPE')?.value ?? '') === '2';
  }

  private applyBaseRateRule(capType: string | null): void {
    const ctrl = this.dataForm.get('CAP_BaseRate');
    if (!ctrl) return;

    if (capType === 'D') {
      ctrl.setValidators([Validators.maxLength(5), Validators.required]);
    } else {
      ctrl.setValidators([Validators.maxLength(5)]);
      ctrl.setValue('', { emitEvent: false });
    }
    ctrl.updateValueAndValidity({ emitEvent: false });
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
      CAP_SALETYPE: null,
      EDC_BANK: null,
      INSTMS_TYPE: null,
      PAY_NO: null,
      CALC_TYPE: null,
      DOWN_PAYMENT: null,
      OVER_BASE_RATE: null,
    });
    this.dataForm.markAsPristine();
  }
}
