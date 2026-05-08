/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { ValidationService } from '@shared/service/validation.service';
import { FIN13010Service } from '../../../service/api/fin/fin13010.service';

// UI
import { NgIf } from '@angular/common';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

type RuleError = {
  /** 哪一個欄位出錯（用來 setErrors / markAsTouched） */
  controlName: string;
  /** 告訴使用者的訊息 */
  message: string;
  /** 錯誤 key（方便 UI 顯示、或後續客製） */
  key: string;
};

@Component({
  selector: 'app-fin13010-cru',
  templateUrl: './fin13010-cru.component.html',
  styleUrls: ['./fin13010-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    YearMonthComponent,
    InputNumberComponent,
    NgIf,
    TranslateModule,
  ],
})
export class FIN13010CRUComponent extends BasicCruPageComponent<any> {
  CRUDStatus = CRUDStatus;

  /** 金額規則是否通過，用來控制「確認」按鈕 disabled */
  isAmountValid = true;

  /** 發票格式（進項） */
  voucherTypeOptions = [
    { value: '21', label: '21-進項三聯式、電子計算機統一發票' },
    { value: '22', label: '22-進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    {
      value: '23',
      label:
        '23-三聯式、電子計算機及三聯式收銀機統一發票之進貨退出或折讓證明單',
    },
    {
      value: '24',
      label:
        '24-二聯式收銀機統一發票及載有稅額之其他憑證之進貨退出或折讓證明單',
    },
    { value: '25', label: '25-進項三聯式收銀機統一發票' },
    {
      value: '26',
      label: '26-彙總登錄每張稅額500元以下之進項三聯式、電子計算機統一發票',
    },
    {
      value: '27',
      label:
        '27-彙總登錄每張稅額500元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證',
    },
    { value: '28', label: '28-進項海關代徵營業稅繳納證' },
    { value: '29', label: '29-進項海關退還溢繳營業稅申報單' },
  ];

  /** 區別 */
  creditTypeOptions = [
    { value: 'C', label: '折讓' },
    { value: 'R', label: '退出' },
  ];

  /** 課稅別 */
  taxTypeOptions = [
    { value: '1', label: '應稅' },
    { value: '2', label: '零稅率' },
    { value: '3', label: '免稅' },
  ];

  /** 依字軌撈回來的發票號碼清單 */
  guiNumberOptions: { label: string; value: string }[] = [];

  /** 原始的「剩餘總金額」（APS 對應資料） */
  private originalRemainingAmt: number | null = null;

  dataForm = this.formBuilder.nonNullable.group({
    id: [null as number | null],

    TXN_Ret_No: ['系統自動帶入', [Validators.required, Validators.maxLength(20)]],
    GUI_Track: ['', [Validators.required, Validators.maxLength(2)]],
    PUR_GUINo: ['', [Validators.required, Validators.maxLength(10)]],
    InvoiceNumber_Correspond: [''],

    Inv_Date: [null as any],
    PUR_GUIDate: [null as any, Validators.required],

    PUR_VoucherType: ['', Validators.required],
    PUR_RepYYYYMM: [null as string | null],
    Credit_Type: ['', Validators.required],
    PUR_TaxType: ['', Validators.required],

    Inv_Net: [null as any],
    Inv_Tax: [null as any],

    PUR_Net: [null as any],
    PUR_Tax: [null as any],
    PUR_Amt: [null as any],

    Total_hitory_PUR_Amt: [null as any],
    Total_Amt: [null as any],

    Source_Doc_No: ['', [Validators.maxLength(16)]],
    Voucher_No: ['', [Validators.maxLength(16)]],
  });

  constructor(
    private translate: TranslateService,
    private validationService: ValidationService,
    private fin13010Service: FIN13010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13010', this.dataForm);

    const row: any = (this as any).rowdata;

    if (row) {
      const repRaw =
        row.PUR_RepYYYYMM ??
        row.INV_DeclareYM ??
        this.dataForm.get('PUR_RepYYYYMM')?.value;

      const rawVoucherType =
        row.PUR_VoucherType ??
        row.InvoiceType ??
        this.dataForm.get('PUR_VoucherType')?.value;

      this.dataForm.patchValue(
        {
          id: row.id ?? row.ID ?? null,
          TXN_Ret_No: row.TXN_Ret_No ?? this.dataForm.get('TXN_Ret_No')?.value,
          GUI_Track:
            row.GUI_Track ??
            row.InvoiceTrack ??
            this.dataForm.get('GUI_Track')?.value,
          PUR_GUINo:
            row.PUR_GUINo ??
            row.InvoiceNumber ??
            this.dataForm.get('PUR_GUINo')?.value,
          Inv_Date: row.Inv_Date ?? row.InvoiceDate ?? this.dataForm.get('Inv_Date')?.value,
          PUR_GUIDate:
            row.PUR_GUIDate ?? row.Ret_Date ?? this.dataForm.get('PUR_GUIDate')?.value,

          PUR_VoucherType: this.normalizeVoucherType(rawVoucherType),
          PUR_RepYYYYMM: this.normalizeYYYYMMForControl(repRaw),

          Credit_Type: row.Credit_Type ?? this.dataForm.get('Credit_Type')?.value,
          PUR_TaxType: row.PUR_TaxType ?? this.dataForm.get('PUR_TaxType')?.value,

          Inv_Net: row.Inv_Net ?? row.PUR_Net ?? this.dataForm.get('Inv_Net')?.value,
          Inv_Tax: row.Inv_Tax ?? row.PUR_Tax ?? this.dataForm.get('Inv_Tax')?.value,

          PUR_Net: row.PUR_Net ?? this.dataForm.get('PUR_Net')?.value,
          PUR_Tax: row.PUR_Tax ?? this.dataForm.get('PUR_Tax')?.value,
          PUR_Amt: row.PUR_Amt ?? this.dataForm.get('PUR_Amt')?.value,

          Total_hitory_PUR_Amt:
            row.Total_hitory_PUR_Amt ?? this.dataForm.get('Total_hitory_PUR_Amt')?.value,
          Total_Amt: row.Total_Amt ?? this.dataForm.get('Total_Amt')?.value,

          Source_Doc_No: row.Source_Doc_No ?? this.dataForm.get('Source_Doc_No')?.value,
          Voucher_No: row.Voucher_No ?? this.dataForm.get('Voucher_No')?.value,
        },
        { emitEvent: false },
      );
    }

    this.updateDisabledState();
    this.setupTrackNoWatcher();
    this.setupGuiNoAndCorrespondWatcher();
    this.setupAmountRelations();

    if (this.crudstatus === CRUDStatus.Create) {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      let evenMonth = month % 2 === 0 ? month : month + 1;
      if (evenMonth > 12) evenMonth = 12;

      const repYYYYMM = `${year}${String(evenMonth).padStart(2, '0')}`;

      this.dataForm.patchValue(
        { PUR_GUIDate: today, PUR_RepYYYYMM: repYYYYMM },
        { emitEvent: false },
      );
    }

    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      this.loadInvoiceInfoByCurrentGUINo();
    }

    // 任一欄位變化就重新計算一次 isAmountValid（只算布林，不改值）
    this.dataForm.valueChanges.subscribe(() => this.refreshAmountValidFlag());

    // 初始化一次
    this.refreshAmountValidFlag();
  }

  /* ==================== GUI_Track + PUR_GUINo 對應資料 ==================== */

  private loadInvoiceInfoByCurrentGUINo(): void {
    const trackRaw = this.dataForm.get('GUI_Track')?.value as string | null;
    const guiNoRaw = this.dataForm.get('PUR_GUINo')?.value as string | null;

    const track = trackRaw?.trim();
    const guiNo = guiNoRaw?.trim();
    if (!track || !guiNo) return;

    const full = `${track}${guiNo}`;
    this.dataForm.patchValue({ InvoiceNumber_Correspond: full }, { emitEvent: false });

    this.fin13010Service
      .queryCorrespondByGUINoCorrespond({ PUR_GUINo_Correspond: full })
      .subscribe((res) => {
        const detail = res?.Data?.[0];
        if (detail) {
          const rawVoucherType =
            (detail as any).PUR_VoucherType ?? (detail as any).InvoiceType ?? '';
          const voucherType = this.normalizeVoucherType(rawVoucherType);

          const rawOriginal =
            (detail as any).Total_Amt ??
            (detail as any).PUR_Amount ??
            (detail as any).PUR_Amt ??
            null;

          const original =
            rawOriginal !== null && rawOriginal !== undefined ? Number(rawOriginal) : null;

          this.originalRemainingAmt =
            original !== null && !isNaN(original) ? this.roundToInt(original) : null;

          const currentAmtRaw = this.dataForm.get('PUR_Amt')?.value;
          const currentTotal =
            currentAmtRaw === null || currentAmtRaw === undefined || currentAmtRaw === ''
              ? null
              : this.roundToInt(Number(currentAmtRaw));

          const remaining =
            this.originalRemainingAmt !== null &&
              !isNaN(this.originalRemainingAmt) &&
              currentTotal !== null &&
              !isNaN(currentTotal)
              ? this.roundToInt(this.originalRemainingAmt - currentTotal)
              : this.originalRemainingAmt;

          this.dataForm.patchValue(
            {
              Inv_Date: (detail as any).PUR_GUIDate ?? (detail as any).InvoiceDate,
              Inv_Net: (detail as any).PUR_Net,
              Inv_Tax: (detail as any).PUR_Tax,
              PUR_VoucherType: voucherType ? String(voucherType) : '',
              PUR_TaxType: (detail as any).PUR_TaxType,
              Total_hitory_PUR_Amt:
                (detail as any).Total_history_PUR_Amt ?? (detail as any).Total_hitory_PUR_Amt,
              Total_Amt: remaining,
            },
            { emitEvent: false },
          );

          this.updateCreditTypeByAmount(currentTotal);
        } else {
          this.originalRemainingAmt = null;
          this.dataForm.patchValue(
            {
              Inv_Date: null,
              Inv_Net: null,
              Inv_Tax: null,
              PUR_VoucherType: '',
              PUR_TaxType: '',
              PUR_Amt: null,
              Total_hitory_PUR_Amt: null,
              Total_Amt: null,
              Credit_Type: '',
            },
            { emitEvent: false },
          );
        }

        this.refreshAmountValidFlag();
      });
  }

  private setupTrackNoWatcher(): void {
    const trackControl = this.dataForm.get('GUI_Track');
    if (!trackControl) return;

    trackControl.valueChanges.subscribe((trackNo) => {
      if (typeof trackNo === 'string' && trackNo.trim().length >= 2) {
        this.fin13010Service
          .queryINV1000List({ GUI_Track: trackNo.trim() })
          .subscribe((res) => {
            this.guiNumberOptions = (res.Data || []).map((item: any) => ({
              label: item.PUR_GUINo,
              value: item.PUR_GUINo,
            }));
          });
      } else {
        this.guiNumberOptions = [];
      }
    });
  }

  private setupGuiNoAndCorrespondWatcher(): void {
    const trackControl = this.dataForm.get('GUI_Track');
    const noControl = this.dataForm.get('PUR_GUINo');
    if (!trackControl || !noControl) return;

    const trigger = () => this.loadInvoiceInfoByCurrentGUINo();
    trackControl.valueChanges.subscribe(trigger);
    noControl.valueChanges.subscribe(trigger);
  }

  private normalizeVoucherType(raw: any): string {
    const v = String(raw ?? '').trim();
    if (v === '21' || v === '25') return '23';
    if (v === '22') return '24';
    return v;
  }

  /* ==================== 欄位啟用 / 停用 ==================== */

  private updateDisabledState(): void {
    if (this.crudstatus === CRUDStatus.Edit) {
      const editableFields = [
        'PUR_GUIDate',
        'PUR_RepYYYYMM',
        'Source_Doc_No',
        'PUR_Net',
        'PUR_Amt',
        'Voucher_No',
      ];

      Object.keys(this.dataForm.controls).forEach((key) => {
        const control = this.dataForm.get(key);
        if (editableFields.includes(key)) control?.enable();
        else control?.disable();
      });
    } else if (this.crudstatus === CRUDStatus.Read) {
      this.dataForm.disable();
    } else {
      this.dataForm.enable();
    }

    // 一律鎖死（你想改哪些可編輯，就把它移到上面 editableFields 控制）
    this.dataForm.get('TXN_Ret_No')?.disable();
    this.dataForm.get('PUR_Tax')?.disable();
    this.dataForm.get('PUR_TaxType')?.disable();
    this.dataForm.get('Inv_Tax')?.disable();
    this.dataForm.get('Inv_Net')?.disable();
    this.dataForm.get('Inv_Date')?.disable();
    this.dataForm.get('Total_hitory_PUR_Amt')?.disable();
    this.dataForm.get('Total_Amt')?.disable();
    this.dataForm.get('Credit_Type')?.disable();
    this.dataForm.get('PUR_VoucherType')?.disable();
    this.dataForm.get('Voucher_No')?.disable();
  }

  /* ==================== 金額互算（不強制修正超出數值，只是同步計算） ==================== */

  private setupAmountRelations(): void {
    const netControl = this.dataForm.get('PUR_Net');
    const taxControl = this.dataForm.get('PUR_Tax');
    const amtControl = this.dataForm.get('PUR_Amt');
    const remainingControl = this.dataForm.get('Total_Amt');

    if (!netControl || !taxControl || !amtControl || !remainingControl) return;

    let updatingFromNet = false;
    let updatingFromAmt = false;

    // 由「退出/折讓金額」反推稅額與總金額
    netControl.valueChanges.subscribe((value) => {
      if (updatingFromAmt) return;
      updatingFromNet = true;

      const netVal = this.parseAmount(value);
      if (netVal === null) {
        taxControl.setValue(null, { emitEvent: false });
        amtControl.setValue(null, { emitEvent: false });
        remainingControl.setValue(this.originalRemainingAmt, { emitEvent: false });
        this.updateCreditTypeByAmount(null);
        updatingFromNet = false;
        return;
      }

      const netInt = this.roundToInt(netVal);
      const taxInt = this.roundToInt(netInt * 0.05);
      const totalInt = this.roundToInt(netInt + taxInt);

      netControl.setValue(netInt, { emitEvent: false });
      taxControl.setValue(taxInt, { emitEvent: false });
      amtControl.setValue(totalInt, { emitEvent: false });

      const remaining =
        this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
          ? this.roundToInt(this.originalRemainingAmt - totalInt)
          : null;
      remainingControl.setValue(remaining, { emitEvent: false });

      this.updateCreditTypeByAmount(totalInt);
      updatingFromNet = false;
    });

    // 由「退回/折讓總金額」反推淨額與稅額
    amtControl.valueChanges.subscribe((value) => {
      if (updatingFromNet) return;
      updatingFromAmt = true;

      const totalVal = this.parseAmount(value);
      if (totalVal === null) {
        netControl.setValue(null, { emitEvent: false });
        taxControl.setValue(null, { emitEvent: false });
        remainingControl.setValue(this.originalRemainingAmt, { emitEvent: false });
        this.updateCreditTypeByAmount(null);
        updatingFromAmt = false;
        return;
      }

      const totalInt = this.roundToInt(totalVal);
      const approxNet = totalInt / 1.05;
      const netInt = this.roundToInt(approxNet);
      const taxInt = totalInt - netInt;

      amtControl.setValue(totalInt, { emitEvent: false });
      netControl.setValue(netInt, { emitEvent: false });
      taxControl.setValue(taxInt, { emitEvent: false });

      const remaining =
        this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
          ? this.roundToInt(this.originalRemainingAmt - totalInt)
          : null;
      remainingControl.setValue(remaining, { emitEvent: false });

      this.updateCreditTypeByAmount(totalInt);
      updatingFromAmt = false;
    });
  }

  private updateCreditTypeByAmount(totalAmt: number | null): void {
    const creditControl = this.dataForm.get('Credit_Type');
    if (!creditControl) return;

    if (
      totalAmt === null ||
      isNaN(totalAmt) ||
      totalAmt <= 0 ||
      this.originalRemainingAmt === null ||
      isNaN(this.originalRemainingAmt) ||
      this.originalRemainingAmt <= 0
    ) {
      creditControl.setValue('', { emitEvent: false });
      return;
    }

    const t = this.roundToInt(totalAmt);
    const origin = this.roundToInt(this.originalRemainingAmt);

    if (t === origin) creditControl.setValue('R', { emitEvent: false }); // 退出
    else if (t < origin) creditControl.setValue('C', { emitEvent: false }); // 折讓
    else creditControl.setValue('', { emitEvent: false });
  }

  /* ==================== submit 時：清楚告訴使用者違反哪個規則 ==================== */

  /** 回傳所有違反的規則（可一次顯示多個） */
  private collectBusinessRuleErrors(form: FormGroup): RuleError[] {
    const raw = form.getRawValue() as any;

    const totalAmt = this.parseAmount(raw.PUR_Amt);
    const netAmt = this.parseAmount(raw.PUR_Net);

    const invNet =
      this.parseAmount(raw.Inv_Net) ??
      this.parseAmount(this.dataForm.get('Inv_Net')?.value);

    // 「剩餘總金額」的上限來源：優先 originalRemainingAmt；沒有才用表單上的 Total_Amt
    const remainingBaseRawFromForm = this.parseAmount(raw.Total_Amt);
    const remainingBaseRaw =
      this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
        ? this.originalRemainingAmt
        : remainingBaseRawFromForm;

    const remainingBase =
      remainingBaseRaw !== null && !isNaN(remainingBaseRaw) ? remainingBaseRaw : 0;

    const errors: RuleError[] = [];

    // 規則 A：退回/折讓總金額 ≤ 剩餘總金額
    if (totalAmt !== null && !isNaN(totalAmt) && totalAmt > remainingBase) {
      errors.push({
        controlName: 'PUR_Amt',
        key: 'amtOverRemaining',
        message: `退回/折讓總金額不可大於剩餘總金額（目前：${totalAmt}，上限：${remainingBase}）`,
      });
    }

    // 規則 B：退出/折讓金額 ≤ 銷售額
    if (
      invNet !== null &&
      netAmt !== null &&
      !isNaN(invNet) &&
      !isNaN(netAmt) &&
      netAmt > invNet
    ) {
      errors.push({
        controlName: 'PUR_Net',
        key: 'netOverInvNet',
        message: `退出/折讓金額不可大於銷售額（目前：${netAmt}，銷售額：${invNet}）`,
      });
    }

    return errors;
  }

  /** 清掉舊的 business rule errors */
  private clearBusinessRuleErrors(form: FormGroup): void {
    const keys = ['amtOverRemaining', 'netOverInvNet'];

    const clearOnControl = (controlName: string) => {
      const ctrl = form.get(controlName);
      if (!ctrl?.errors) return;

      const newErrors = { ...ctrl.errors };
      keys.forEach((k) => delete (newErrors as any)[k]);
      ctrl.setErrors(Object.keys(newErrors).length ? newErrors : null);
    };

    clearOnControl('PUR_Amt');
    clearOnControl('PUR_Net');

    // form-level（如果你也想放 form 的 errors）
    if (form.errors) {
      const newFormErrors = { ...form.errors };
      keys.forEach((k) => delete (newFormErrors as any)[k]);
      form.setErrors(Object.keys(newFormErrors).length ? newFormErrors : null);
    }
  }

  /** 套用 errors + 提示訊息 */
  private applyAndShowBusinessRuleErrors(form: FormGroup, errors: RuleError[]): void {
    if (!errors.length) return;

    // 一次把所有錯的欄位都標記 touched
    errors.forEach((e) => {
      const ctrl = form.get(e.controlName);
      ctrl?.setErrors({ ...(ctrl.errors || {}), [e.key]: true });
      ctrl?.markAsTouched();
    });

    form.markAsDirty();

    // 逐條提示（你也可以改成合併成一個訊息）
    errors.forEach((e) => this.messageService.errorBubble(e.message));
  }

  private refreshAmountValidFlag(): void {
    const errors = this.collectBusinessRuleErrors(this.dataForm);
    this.isAmountValid = errors.length === 0;
  }

  /* ==================== 年月處理 ==================== */

  private normalizeYYYYMMForControl(raw: any): string | null {
    if (!raw) return null;
    const only = String(raw).replace(/\D/g, '');
    if (only.length < 6) return null;
    return only.slice(0, 6);
  }

  private toYYYYMM(input: any): string | null {
    if (!input) return null;

    if (typeof input === 'string') {
      const onlyDigits = input.replace(/\D/g, '');
      if (onlyDigits.length >= 6) return onlyDigits.slice(0, 6);
      const d = new Date(input);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}${m}`;
      }
      return null;
    }

    if (input instanceof Date) {
      const y = input.getFullYear();
      const m = String(input.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }

    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }
    return null;
  }

  private parseAmount(raw: any): number | null {
    if (raw === null || raw === undefined || raw === '') return null;
    if (typeof raw === 'number') return isNaN(raw) ? null : raw;
    if (typeof raw === 'string') {
      const cleaned = raw.replace(/,/g, '').trim();
      if (!cleaned) return null;
      const n = Number(cleaned);
      return isNaN(n) ? null : n;
    }
    const n = Number(raw);
    return isNaN(n) ? null : n;
  }

  private roundToInt(value: number): number {
    return Math.round(value);
  }

  /* ==================== 送出 ==================== */

  onSubmit(form: FormGroup): void {
    // 你若有 submitted flag（BasicCruPageComponent 常見），這裡順便打開
    this.submitted = true;

    // 先清掉舊的 business rule errors
    this.clearBusinessRuleErrors(form);

    // 先跑「一般必填/格式」驗證：讓使用者知道哪個必填沒填
    form.markAllAsTouched();
    form.updateValueAndValidity({ emitEvent: false });

    if (form.invalid) {
      this.messageService.warnBubble('欄位驗證未通過，請先修正紅框欄位');
      return;
    }

    // 再跑「商業規則」：一次收集全部錯誤，清楚告訴使用者違反哪些規則
    const ruleErrors = this.collectBusinessRuleErrors(form);
    this.isAmountValid = ruleErrors.length === 0;

    if (ruleErrors.length) {
      this.applyAndShowBusinessRuleErrors(form, ruleErrors);
      return;
    }

    // 到這裡才真的送出
    this.handleSubmit(form, () => {
      const raw = form.getRawValue() as any;
      raw.PUR_RepYYYYMM = this.toYYYYMM(raw.PUR_RepYYYYMM);

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        this.fin13010Service.insertFIN13010(raw).subscribe({
          next: () => {
            this.messageService.successBubble(this.translate.instant('success_message'));
            this.router.navigate(['/account/fin', 'fin13010'], {
              state: { fromCru: true },
            });
          },
          error: () => {
            this.messageService.errorBubble(this.translate.instant('create_failed'));
          },
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        raw.id = this.rowdata?.id;

        this.fin13010Service.updateFIN13010(raw).subscribe({
          next: () => {
            this.messageService.successBubble(
              this.translate.instant('updated-successfully'),
            );
            this.router.navigate(['/account/fin', 'fin13010'], {
              state: { fromCru: true },
            });
          },
          error: () => {
            this.messageService.errorBubble(this.translate.instant('update_failed'));
          },
        });
      }
    });
  }

  override onCancel(): void {
    this.router.navigate(['/account/fin', 'fin13010'], {
      state: { fromCru: true },
    });
  }

  onClear(): void {
    this.dataForm.reset();
    this.dataForm.markAsPristine();
    this.originalRemainingAmt = null;
    this.updateDisabledState();
    this.refreshAmountValidFlag();
  }

  /** 只有金額合法且表單本身沒有錯誤，才能送出 */
  get canSubmit(): boolean {
    return this.isAmountValid && this.dataForm.valid;
  }
}
