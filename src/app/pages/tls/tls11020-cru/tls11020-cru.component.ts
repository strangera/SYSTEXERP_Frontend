import { Component } from '@angular/core';
import {
  FormControl,
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
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

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
    MultiSelectComponent,
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
  payNoVoucherOptions: { label: string; value: string }[] = []; // POS1006 券類用（pay_type IN ('6','F')）
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
    PAY_NO: [null as string | null],       // 非券類單選
    PAY_NO_MULTI: new FormControl<string[] | null>(null), // 券類多選
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

    // 若編輯/明細且是券類，將 PAY_NO 字串拆成陣列給 multi-select
    if (this.crudstatus !== CRUDStatus.Create) {
      const payNo = this.dataForm.get('PAY_NO')?.value;
      if (this.dataForm.get('CAP_SALETYPE')?.value === '5' && payNo) {
        this.dataForm.patchValue({ PAY_NO_MULTI: payNo.split(',') }, { emitEvent: false });
      }
    }

    this.dataForm.get('CAP_Type')?.valueChanges.subscribe((v) => {
      this.applyBaseRateRule(v as string | null);
    });
    this.applyBaseRateRule(this.dataForm.get('CAP_Type')?.value ?? null);

    // 切換銷售類型時清空所有從屬欄位，避免舊值殘留
    this.dataForm.get('CAP_SALETYPE')?.valueChanges.subscribe((v) => {
      if (v !== '3') {
        this.dataForm.patchValue({ INSTMS_TYPE: null }, { emitEvent: false });
      }
      if (v !== '5') {
        this.dataForm.patchValue(
          { PAY_NO_MULTI: null, CALC_TYPE: null, DOWN_PAYMENT: null, OVER_BASE_RATE: null },
          { emitEvent: false }
        );
      } else {
        this.dataForm.patchValue({ PAY_NO: null }, { emitEvent: false });
      }
    });

    // 切換卷類計算方式時清掉從屬欄位
    this.dataForm.get('CALC_TYPE')?.valueChanges.subscribe((v) => {
      if (v !== '1') this.dataForm.patchValue({ DOWN_PAYMENT: null }, { emitEvent: false });
      if (v !== '2' && v !== '3') this.dataForm.patchValue({ OVER_BASE_RATE: null }, { emitEvent: false });
    });

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

    // 券類支付別：POS1006 where pay_type IN ('6','F')
    this.dropdownApiService.queryPos1006().subscribe((data) => {
      this.payNoVoucherOptions = (data ?? [])
        .filter(x => x.PAY_Type === '6' || x.PAY_Type === 'F')
        .map(x => ({ label: `${x.No} - ${x.Name}`, value: x.No }));
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

      const payload = {
        ...raw,
        CAP_BaseRate: raw.CAP_BaseRate === '' || raw.CAP_BaseRate == null ? null : raw.CAP_BaseRate,
        DOWN_PAYMENT: raw.DOWN_PAYMENT == null || String(raw.DOWN_PAYMENT) === ''
          ? null : parseFloat(String(raw.DOWN_PAYMENT)),
        PAY_NO: this.isPayNoMulti ? (raw.PAY_NO_MULTI ?? []).join(',') || null : raw.PAY_NO,
        PAY_NO_MULTI: undefined, // 後端不需要此欄位
      };

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        this.tls11020Service.insertTLS11020(payload).subscribe({
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
        this.tls11020Service.updateTLS11020({ ...payload, id: this.rowdata?.id, CAP_Item: this.rowdata?.CAP_Item }).subscribe({
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

  get isInstmsTypeVisible(): boolean {
    return this.isBaseRateVisible && String(this.dataForm.get('CAP_SALETYPE')?.value ?? '') === '3';
  }

  get isCalcTypeVisible(): boolean {
    return this.isBaseRateVisible && String(this.dataForm.get('CAP_SALETYPE')?.value ?? '') === '5';
  }

  /** 券類(5) 時支付別改為多選 */
  get isPayNoMulti(): boolean {
    return this.isBaseRateVisible && String(this.dataForm.get('CAP_SALETYPE')?.value ?? '') === '5';
  }

  get isDownPaymentVisible(): boolean {
    return this.isCalcTypeVisible && String(this.dataForm.get('CALC_TYPE')?.value ?? '') === '1';
  }

  get isOverBaseRateVisible(): boolean {
    const calcType = String(this.dataForm.get('CALC_TYPE')?.value ?? '');
    return this.isCalcTypeVisible && (calcType === '2' || calcType === '3');
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
      PAY_NO_MULTI: null,
      CALC_TYPE: null,
      DOWN_PAYMENT: null,
      OVER_BASE_RATE: null,
    });
    this.dataForm.markAsPristine();
  }
}
