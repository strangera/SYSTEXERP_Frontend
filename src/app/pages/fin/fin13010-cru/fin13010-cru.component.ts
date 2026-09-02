/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { FIN13010Service } from '../../../service/api/fin/fin13010.service';

// UI
import { NgIf } from '@angular/common';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

interface RuleError {
  controlName: string;
  message: string;
  key: string;
}

@Component({
  selector: 'app-fin13010-cru',
  templateUrl: './fin13010-cru.component.html',
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
export class FIN13010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  CRUDStatus = CRUDStatus;

  /** 金額規則是否通過，用來控制「確認」按鈕 disabled */
  isAmountValid = true;

  /** 發票格式（進項） */
  voucherTypeOptions = [
    { value: '21', label: '21-進項三聯式、電子計算機統一發票' },
    { value: '22', label: '22-進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: '23', label: '23-三聯式、電子計算機及三聯式收銀機統一發票之進貨退出或折讓證明單' },
    { value: '24', label: '24-二聯式收銀機統一發票及載有稅額之其他憑證之進貨退出或折讓證明單' },
    { value: '25', label: '25-進項三聯式收銀機統一發票' },
    { value: '26', label: '26-彙總登錄每張稅額500元以下之進項三聯式、電子計算機統一發票' },
    { value: '27', label: '27-彙總登錄每張稅額500元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證' },
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

  /** 已退出/折讓歷史總金額（Total_hitory_PUR_Amt），用於判斷是否已有先前紀錄 */
  private originalHistoryAmt: number | null = null;

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
    private fin13010Service: FIN13010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13010', this.dataForm);
    this.updateDisabledState();
    this.setupAmountRelations();
    this.dataForm.valueChanges.subscribe(() => this.refreshAmountValidFlag());

    if (this.crudstatus === CRUDStatus.Create) {
      this.setupTrackNoWatcher();
      this.setupGuiNoAndCorrespondWatcher();
      const today = new Date();
      const month = today.getMonth() + 1;
      let evenMonth = month % 2 === 0 ? month : month + 1;
      if (evenMonth > 12) evenMonth = 12;
      const repYYYYMM = `${today.getFullYear()}${String(evenMonth).padStart(2, '0')}`;
      this.dataForm.patchValue({ PUR_GUIDate: today, PUR_RepYYYYMM: repYYYYMM }, { emitEvent: false });
    } else {
      // Edit / Read：全部資料從後端 ById API 取得，不從 rowdata 拼湊
      const row: any = (this as any).rowdata;
      if (row?.id) {
        this.loadByIdForEditRead(row.id);
      }
    }

    this.refreshAmountValidFlag();
  }
  /* ==================== GUI_Track + PUR_GUINo 對應資料 ==================== */

  /**
   * Edit / Read 模式：從後端 queryFIN13010ById 取得完整資料並填入表單。
   * Total_Amt 已由後端排除當前筆計算，直接作為 originalRemainingAmt。
   */
  private loadByIdForEditRead(id: number): void {
    this.fin13010Service.queryFIN13010ById(id).subscribe((res: any) => {
      const d = res?.Data;
      if (!d) return;

      this.originalRemainingAmt = d.Total_Amt != null ? Math.round(Number(d.Total_Amt)) : null;
      this.originalHistoryAmt = d.Total_hitory_PUR_Amt != null ? Math.round(Number(d.Total_hitory_PUR_Amt)) : 0;

      // Read / Edit 模式：顯示扣除當前筆後的實際剩餘；Edit 模式修改金額時再由 setupAmountRelations 基於 originalRemainingAmt 重算
      const displayTotalAmt = d.Total_Amt != null && d.PUR_Amt != null
        ? Math.round(Number(d.Total_Amt) - Number(d.PUR_Amt))
        : (d.Total_Amt ?? null);

      this.dataForm.patchValue({
        id: d.id,
        TXN_Ret_No: d.TXN_Ret_No ?? '系統自動帶入',
        GUI_Track: d.GUI_Track ?? null,
        PUR_GUINo: d.PUR_GUINo ?? null,
        InvoiceNumber_Correspond: (d.GUI_Track ?? '') + (d.PUR_GUINo ?? ''),
        Inv_Date: d.Inv_Date ?? null,
        PUR_GUIDate: d.PUR_GUIDate ?? null,
        PUR_VoucherType: this.normalizeVoucherType(d.PUR_VoucherType),
        PUR_RepYYYYMM: this.normalizeYYYYMMForControl(d.PUR_RepYYYYMM),
        Credit_Type: d.Credit_Type ?? null,
        PUR_TaxType: d.PUR_TaxType ?? null,
        Inv_Net: d.Inv_Net ?? null,
        Inv_Tax: d.Inv_Tax ?? null,
        PUR_Net: d.PUR_Net ?? null,
        PUR_Tax: d.PUR_Tax ?? null,
        PUR_Amt: d.PUR_Amt ?? null,
        Total_hitory_PUR_Amt: d.Total_hitory_PUR_Amt ?? null,
        Total_Amt: displayTotalAmt,
        Source_Doc_No: d.Source_Doc_No ?? null,
        Voucher_No: d.Voucher_No ?? null,
      }, { emitEvent: false });

      if (d.GUI_Track) {
        this.fin13010Service
          .queryINV1000List({ GUI_Track: String(d.GUI_Track).trim() })
          .subscribe((listRes) => {
            this.guiNumberOptions = (listRes.Data || []).map((item: any) => ({
              label: item.PUR_GUINo,
              value: item.PUR_GUINo,
            }));
          });
      }

      this.refreshAmountValidFlag();
    });
  }

  /**
   * Create 模式：依使用者選的字軌+發票號，查對應原始發票參考欄位。
   * 找到則填入所有衍生欄位；找不到則清空。
   */
  private loadInvoiceInfoByCurrentGUINo(): void {
    const track = (this.dataForm.get('GUI_Track')?.value as string)?.trim();
    const guiNo = (this.dataForm.get('PUR_GUINo')?.value as string)?.trim();
    if (!track || !guiNo) return;

    const full = `${track}${guiNo}`;
    this.dataForm.patchValue({ InvoiceNumber_Correspond: full }, { emitEvent: false });

    this.fin13010Service
      .queryCorrespondByGUINoCorrespond({ PUR_GUINo_Correspond: full })
      .subscribe((res) => {
        const detail = res?.Data?.[0];

        if (detail) {
          const apiAmt = detail.Total_Amt ?? null;
          this.originalRemainingAmt = apiAmt != null ? Math.round(Number(apiAmt)) : null;
          this.originalHistoryAmt = detail.Total_hitory_PUR_Amt != null
            ? Math.round(Number(detail.Total_hitory_PUR_Amt))
            : 0;

          const currentAmtRaw = this.dataForm.get('PUR_Amt')?.value;
          const currentTotal = currentAmtRaw == null || currentAmtRaw === ''
            ? null : Math.round(Number(currentAmtRaw));

          const remaining = this.originalRemainingAmt !== null && currentTotal !== null
            ? Math.round(this.originalRemainingAmt - currentTotal) : this.originalRemainingAmt;

          this.dataForm.patchValue({
            Inv_Date: detail.PUR_GUIDate ?? null,
            Inv_Net: detail.PUR_Net,
            Inv_Tax: detail.PUR_Tax,
            PUR_VoucherType: this.normalizeVoucherType(detail.PUR_VoucherType) || '',
            PUR_TaxType: detail.PUR_TaxType,
            Total_hitory_PUR_Amt: detail.Total_hitory_PUR_Amt ?? null,
            Total_Amt: remaining,

            // 查完發票後帶入
            Source_Doc_No: detail.Source_Doc_No ?? '',
            Voucher_No: detail.Voucher_No ?? '',
          }, { emitEvent: false });

          this.updateCreditTypeByAmount(currentTotal);
        } else {
          this.originalRemainingAmt = null;
          this.dataForm.patchValue({
            Inv_Date: null,
            Inv_Net: null,
            Inv_Tax: null,
            PUR_VoucherType: '',
            PUR_TaxType: '',
            PUR_Amt: null,
            Total_hitory_PUR_Amt: null,
            Total_Amt: null,
            Credit_Type: '',
            Source_Doc_No: '',
            Voucher_No: '',
          }, { emitEvent: false });
        }

        this.refreshAmountValidFlag();
      });
  }

  private setupTrackNoWatcher(): void {
    this.dataForm.get('GUI_Track')?.valueChanges.subscribe((trackNo) => {
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
    this.dataForm.get('GUI_Track')?.valueChanges.subscribe(() => this.loadInvoiceInfoByCurrentGUINo());
    this.dataForm.get('PUR_GUINo')?.valueChanges.subscribe(() => this.loadInvoiceInfoByCurrentGUINo());
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
      const editableFields = ['PUR_GUIDate', 'PUR_RepYYYYMM', 'Source_Doc_No', 'Voucher_No', 'PUR_Net', 'PUR_Tax', 'PUR_Amt'];
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

    // 唯讀欄位（系統自動計算或帶入，不開放編輯）
    this.dataForm.get('TXN_Ret_No')?.disable();
    this.dataForm.get('PUR_TaxType')?.disable();
    this.dataForm.get('Inv_Tax')?.disable();
    this.dataForm.get('Inv_Net')?.disable();
    this.dataForm.get('Inv_Date')?.disable();
    this.dataForm.get('Total_hitory_PUR_Amt')?.disable();
    this.dataForm.get('Total_Amt')?.disable();
    this.dataForm.get('Credit_Type')?.disable();
    this.dataForm.get('PUR_VoucherType')?.disable();
    // this.dataForm.get('Voucher_No')?.disable();
  }

  /* ==================== 金額互算 ==================== */

  private setupAmountRelations(): void {
    const netControl = this.dataForm.get('PUR_Net');
    const taxControl = this.dataForm.get('PUR_Tax');
    const amtControl = this.dataForm.get('PUR_Amt');
    const remainingControl = this.dataForm.get('Total_Amt');

    if (!netControl || !taxControl || !amtControl || !remainingControl) return;

    let updatingFromNet = false;
    let updatingFromTax = false;
    let updatingFromAmt = false;

    // 由「退出/折讓金額」自動算稅額與總金額
    netControl.valueChanges.subscribe((value) => {
      if (updatingFromAmt || updatingFromTax) return;
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

      const netInt = Math.round(netVal);
      const taxInt = Math.round(netInt * 0.05);
      const totalInt = netInt + taxInt;

      netControl.setValue(netInt, { emitEvent: false });
      taxControl.setValue(taxInt, { emitEvent: false });
      amtControl.setValue(totalInt, { emitEvent: false });

      const remaining =
        this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
          ? Math.round(this.originalRemainingAmt - totalInt)
          : null;
      remainingControl.setValue(remaining, { emitEvent: false });

      this.updateCreditTypeByAmount(totalInt);
      updatingFromNet = false;
    });

    // 由「退出/折讓稅額」調整淨額（總金額固定不動，Net = Amt - Tax）
    taxControl.valueChanges.subscribe((value) => {
      if (updatingFromNet || updatingFromAmt) return;
      updatingFromTax = true;

      const taxVal = this.parseAmount(value);
      const amtVal = this.parseAmount(amtControl.value);

      if (taxVal === null || amtVal === null) {
        updatingFromTax = false;
        return;
      }

      const taxInt = Math.round(taxVal);
      const totalInt = Math.round(amtVal);
      const netInt = totalInt - taxInt;

      taxControl.setValue(taxInt, { emitEvent: false });
      netControl.setValue(netInt, { emitEvent: false });
      // Amt 與 Remaining 不變，維持原值

      updatingFromTax = false;
    });

    // 由「退回/折讓總金額」反推淨額與稅額
    amtControl.valueChanges.subscribe((value) => {
      if (updatingFromNet || updatingFromTax) return;
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

      const totalInt = Math.round(totalVal);
      const netInt = Math.round(totalInt / 1.05);
      const taxInt = totalInt - netInt;

      amtControl.setValue(totalInt, { emitEvent: false });
      netControl.setValue(netInt, { emitEvent: false });
      taxControl.setValue(taxInt, { emitEvent: false });

      const remaining =
        this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
          ? Math.round(this.originalRemainingAmt - totalInt)
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

    const t = Math.round(totalAmt);
    const origin = Math.round(this.originalRemainingAmt);
    const historyAmt = this.originalHistoryAmt ?? 0;

    // 若已有歷史紀錄（先前已開過退出/折讓），一律為折讓
    if (historyAmt > 0) {
      creditControl.setValue('C', { emitEvent: false });
    } else if (t === origin) {
      creditControl.setValue('R', { emitEvent: false });   // 第一次且全額用完 → 退出
    } else if (t < origin) {
      creditControl.setValue('C', { emitEvent: false });   // 第一次但部分金額 → 折讓
    } else {
      creditControl.setValue('', { emitEvent: false });
    }
  }

  /* ==================== 商業規則驗證 ==================== */

  private collectBusinessRuleErrors(form: FormGroup): RuleError[] {
    const raw = form.getRawValue() as any;

    const totalAmt = this.parseAmount(raw.PUR_Amt);
    const netAmt = this.parseAmount(raw.PUR_Net);
    const invNet = this.parseAmount(raw.Inv_Net);

    const remainingBase =
      this.originalRemainingAmt !== null && !isNaN(this.originalRemainingAmt)
        ? this.originalRemainingAmt
        : (this.parseAmount(raw.Total_Amt) ?? 0);

    const errors: RuleError[] = [];

    if (totalAmt !== null && !isNaN(totalAmt) && totalAmt > remainingBase) {
      errors.push({
        controlName: 'PUR_Amt',
        key: 'amtOverRemaining',
        message: `退回/折讓總金額不可大於剩餘總金額（目前：${totalAmt}，上限：${remainingBase}）`,
      });
    }

    if (invNet !== null && netAmt !== null && !isNaN(invNet) && !isNaN(netAmt) && netAmt > invNet) {
      errors.push({
        controlName: 'PUR_Net',
        key: 'netOverInvNet',
        message: `退出/折讓金額不可大於銷售額（目前：${netAmt}，銷售額：${invNet}）`,
      });
    }

    return errors;
  }

  private clearBusinessRuleErrors(form: FormGroup): void {
    const keys = ['amtOverRemaining', 'netOverInvNet'];
    for (const controlName of ['PUR_Amt', 'PUR_Net']) {
      const ctrl = form.get(controlName);
      if (!ctrl?.errors) continue;
      const newErrors = { ...ctrl.errors };
      keys.forEach((k) => delete (newErrors as any)[k]);
      ctrl.setErrors(Object.keys(newErrors).length ? newErrors : null);
    }
  }

  private applyAndShowBusinessRuleErrors(form: FormGroup, errors: RuleError[]): void {
    if (!errors.length) return;
    errors.forEach((e) => {
      const ctrl = form.get(e.controlName);
      ctrl?.setErrors({ ...(ctrl.errors || {}), [e.key]: true });
      ctrl?.markAsTouched();
    });
    form.markAsDirty();
    errors.forEach((e) => this.messageService.errorBubble(e.message));
  }

  private refreshAmountValidFlag(): void {
    this.isAmountValid = this.collectBusinessRuleErrors(this.dataForm).length === 0;
  }

  /* ==================== 年月處理 ==================== */

  private normalizeYYYYMMForControl(raw: any): string | null {
    if (!raw) return null;
    const only = String(raw).replace(/\D/g, '');
    return only.length >= 6 ? only.slice(0, 6) : null;
  }

  private toYYYYMM(input: any): string | null {
    if (!input) return null;
    if (typeof input === 'string') {
      const onlyDigits = input.replace(/\D/g, '');
      if (onlyDigits.length >= 6) return onlyDigits.slice(0, 6);
    }
    const d = input instanceof Date ? input : new Date(input);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    return null;
  }

  private parseAmount(raw: any): number | null {
    if (raw == null || raw === '') return null;
    if (typeof raw === 'number') return isNaN(raw) ? null : raw;
    if (typeof raw === 'string') {
      const n = Number(raw.replace(/,/g, '').trim());
      return isNaN(n) ? null : n;
    }
    const n = Number(raw);
    return isNaN(n) ? null : n;
  }

  /* ==================== 送出 ==================== */

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    this.clearBusinessRuleErrors(form);

    form.markAllAsTouched();
    form.updateValueAndValidity({ emitEvent: false });

    if (form.invalid) {
      this.messageService.warnBubble('欄位驗證未通過，請先修正紅框欄位');
      return;
    }

    const ruleErrors = this.collectBusinessRuleErrors(form);
    this.isAmountValid = ruleErrors.length === 0;

    if (ruleErrors.length) {
      this.applyAndShowBusinessRuleErrors(form, ruleErrors);
      return;
    }

    this.handleSubmit(form, () => {
      const raw = form.getRawValue() as any;
      raw.PUR_RepYYYYMM = this.toYYYYMM(raw.PUR_RepYYYYMM);

      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        this.fin13010Service.insertFIN13010(raw).subscribe(() => {
          this.messageService.successBubble(this.translate.instant('success_message'));
          this.router.navigate(['/account/fin', 'fin13010'], { state: { fromCru: true } });
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        raw.id = this.rowdata?.id;
        this.fin13010Service.updateFIN13010(raw).subscribe(() => {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
          this.router.navigate(['/account/fin', 'fin13010'], { state: { fromCru: true } });
        });
      }
    });
  }

  override onCancel(): void {
    this.router.navigate(['/account/fin', 'fin13010'], { state: { fromCru: true } });
  }

  onClear(): void {
    this.dataForm.reset();
    this.dataForm.markAsPristine();
    this.originalRemainingAmt = null;
    this.originalHistoryAmt = null;
    this.updateDisabledState();
    this.refreshAmountValidFlag();
  }

  get canSubmit(): boolean {
    return this.isAmountValid && this.dataForm.valid;
  }
}
