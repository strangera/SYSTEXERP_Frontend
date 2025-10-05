// validation/tls12040-validation.service.ts
import { Injectable } from '@angular/core';
import { FormGroup, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class TLS12040ValidationService {

  /**
   * 更新所有動態驗證器
   */
  updateAllValidators(form: FormGroup): void {
    this.updateFieldValidators(form);
    this.updatePaymentValidators(form);
    // this.updateCreditCardValidators(form); // 如果需要信用卡驗證，可啟用
    this.updateDepositValidators(form);
  }

  /**
   * 根據抽成別更新欄位驗證器
   */
  updateFieldValidators(form: FormGroup): void {
    const tltTermType = form.get('tlt_term_type')?.value;

    this.updateBaodiValidators(form, tltTermType ?? '');
    this.updateRentAheadValidators(form, tltTermType ?? '');
    this.updateCommissionValidators(form, tltTermType ?? '');
    this.updateOverallStatusValidators(form, tltTermType ?? '');

    form.updateValueAndValidity();
  }

  /**
   * 包底類別驗證
   */
  private updateBaodiValidators(form: FormGroup, tltTermType: string): void {
    const baodiControl = form.get('tlt_ctype_mtotal');
    if (!baodiControl) return;

    baodiControl.clearValidators();

    if (['2', '4', '6'].includes(tltTermType)) {
      baodiControl.setValidators([Validators.required]);
    }

    baodiControl.updateValueAndValidity();
  }

  /**
   * 預收租金相關驗證
   */
  private updateRentAheadValidators(form: FormGroup, tltTermType: string): void {
    const rentAheadControl = form.get('rent_ahead');

    if (['1', '2'].includes(tltTermType)) {
      if (rentAheadControl?.value !== 'Y') {
        rentAheadControl?.setValue('Y');
      }
    }

    this.updateBaseRentValidators(form);
  }

  /**
   * 固定租金驗證
   */
  private updateBaseRentValidators(form: FormGroup): void {
    const baseRentControl = form.get('base_rent');
    const rentAhead = form.get('rent_ahead')?.value;

    if (!baseRentControl) return;

    baseRentControl.clearValidators();

    if (rentAhead === 'Y') {
      baseRentControl.setValidators([Validators.required, Validators.min(1)]);
    } else {
      baseRentControl.setValidators([Validators.min(0)]);
    }

    baseRentControl.updateValueAndValidity();
  }

  /**
   * 是否為抽成驗證
   */
  private updateCommissionValidators(form: FormGroup, tltTermType: string): void {
    const commYnControl = form.get('comm_yn');

    if (['2', '3', '4', '5'].includes(tltTermType)) {
      commYnControl?.setValue('Y');
    } else {
      commYnControl?.setValue('N');
    }
  }

  /**
   * 超出部份處理方式驗證
   */
  private updateOverallStatusValidators(form: FormGroup, tltTermType: string): void {
    const overallStatusControl = form.get('overall_status');
    if (!overallStatusControl) return;

    overallStatusControl.clearValidators();

    if (['4', '5', '6'].includes(tltTermType)) {
      overallStatusControl.setValidators([Validators.required]);
    }

    overallStatusControl.updateValueAndValidity();
  }

  /**
   * 付款方式相關驗證
   */
  updatePaymentValidators(form: FormGroup): void {
    const paytype = form.get('paytype')?.value;
    const checkTitleControl = form.get('CHECK_TITLE');
    const bankIdControl = form.get('bank_id');
    const vendorAcctNameControl = form.get('vendor_acct_name');
    const vendorAcctNoControl = form.get('vendor_acct_no');

    // 清除現有驗證器
    [checkTitleControl, bankIdControl, vendorAcctNameControl, vendorAcctNoControl]
      .forEach(control => control?.clearValidators());

    if (paytype === '1') { // 匯款
      bankIdControl?.setValidators([Validators.required]);
      vendorAcctNameControl?.setValidators([Validators.required, Validators.maxLength(60)]);
      vendorAcctNoControl?.setValidators([Validators.required, Validators.maxLength(20)]);
    } else if (paytype === '2') { // 支票
      checkTitleControl?.setValidators([Validators.required, Validators.maxLength(100)]);
    }

    // 更新驗證狀態
    [checkTitleControl, bankIdControl, vendorAcctNameControl, vendorAcctNoControl]
      .forEach(control => control?.updateValueAndValidity());
  }

  /**
   * 會員卡相關驗證（如果 tls12040 需要，可啟用）
   */
  updateCreditCardValidators(form: FormGroup): void {
    const vipYn = form.get('vip_yn')?.value;
    const creditCardControl = form.get('credit_card');

    if (!creditCardControl) return;

    creditCardControl.clearValidators();

    if (vipYn === 'Y') {
      creditCardControl.setValidators([Validators.required]);
    } else {
      creditCardControl.setValue(null);
    }

    creditCardControl.updateValueAndValidity();
  }

  /**
   * 保證金相關驗證
   */
  updateDepositValidators(form: FormGroup): void {
    this.validateDepositPair(form, 'open_deposit', 'open_fees', '履約保證金');
    this.validateDepositPair(form, 'construct_deposit', 'construct_fees', '施工保證金');
    this.validateDepositPair(form, 'expiration_deposit', 'expiration_fees', '合約屆滿保證金');
  }

  /**
   * 驗證保證金配對
   */
  private validateDepositPair(form: FormGroup, paymentMethodField: string, amountField: string, displayName: string): void {
    const paymentMethodControl = form.get(paymentMethodField);
    const amountControl = form.get(amountField);

    if (!paymentMethodControl || !amountControl) return;

    const hasPaymentMethod = paymentMethodControl.value && paymentMethodControl.value.trim() !== '';

    amountControl.clearValidators();

    if (hasPaymentMethod) {
      amountControl.setValidators([Validators.required, Validators.min(1)]);
    } else {
      amountControl.setValidators([Validators.min(0)]);
    }

    amountControl.updateValueAndValidity();
  }

  /**
   * 自訂驗證器 - 保證金依賴驗證
   */
  createDepositDependencyValidator(paymentMethodField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control.parent;
      if (!form) return null;

      const paymentMethodControl = form.get(paymentMethodField);
      const hasPaymentMethod = paymentMethodControl?.value && paymentMethodControl.value.trim() !== '';

      if (hasPaymentMethod && (!control.value || control.value <= 0)) {
        return { depositRequired: { requiredFor: paymentMethodField } };
      }

      return null;
    };
  }

  /**
   * 取得欄位錯誤訊息
   */
  getFieldErrorMessage(fieldName: string, field: AbstractControl): string {
    if (field && field.errors) {
      if (field.errors['required']) {
        return this.getRequiredErrorMessage(fieldName);
      }
      if (field.errors['email']) return '請輸入正確的 Email 格式';
      if (field.errors['maxlength']) {
        return `最多可輸入 ${field.errors['maxlength'].requiredLength} 個字元`;
      }
      if (field.errors['min']) {
        return `最小值為 ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `最大值為 ${field.errors['max'].max}`;
      }
      if (field.errors['depositRequired']) {
        return '付款方式有值時此欄位為必填';
      }
    }
    return '';
  }

  /**
   * 根據欄位取得必填錯誤訊息
   */
  private getRequiredErrorMessage(fieldName: string): string {
    const requiredMessages: { [key: string]: string } = {
      'tlt_ctype_mtotal': '當前抽成別需要選擇包底類別',
      'overall_status': '當前抽成別需要選擇超出部份處理方式',
      'base_rent': '預收租金為是時固定租金為必填',
      'CHECK_TITLE': '支票付款時票據抬頭為必填',
      'bank_id': '匯款付款時銀行代號為必填',
      'vendor_acct_name': '匯款付款時帳戶名稱為必填',
      'vendor_acct_no': '匯款付款時銀行帳號為必填',
      'credit_card': '配合會員卡時會員卡折數為必填',
      'open_fees': '履約保證金付款方式有值時此欄位為必填',
      'construct_fees': '施工保證金付款方式有值時此欄位為必填',
      'expiration_fees': '合約屆滿保證金付款方式有值時此欄位為必填'
    };

    return requiredMessages[fieldName] || '此欄位為必填';
  }
}
