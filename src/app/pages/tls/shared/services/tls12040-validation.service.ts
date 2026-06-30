// validation/tls12040-validation.service.ts
import { Injectable } from '@angular/core';
import { BaseTLSValidationService, TLSValidationConfig } from '@others/services/tls/base-tls-validation.service';

/**
 * TLS12040 專櫃要約書 - 驗證服務
 *
 * 繼承自 BaseTLSValidationService，所有驗證邏輯已在基底類別中實作
 * 此服務只需提供模組特定的設定
 *
 * 使用方式：
 * ```typescript
 * constructor(private validationService: TLS12040ValidationService) {}
 *
 * ngOnInit() {
 *   this.validationService.updateAllValidators(this.dataForm);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TLS12040ValidationService extends BaseTLSValidationService {
  /**
   * 提供 TLS12040 模組設定
   */
  protected getModuleConfig(): TLSValidationConfig {
    return {
      identifierField: 'apply_no',  // TLS12040 使用 apply_no 作為主鍵
      moduleName: 'TLS12040'
    };
  }

  // 所有驗證方法都已在 BaseTLSValidationService 中實作：
  // - updateAllValidators(form: FormGroup)
  // - updateFieldValidators(form: FormGroup)
  // - updatePaymentValidators(form: FormGroup)
  // - updateCreditCardValidators(form: FormGroup)
  // - updateDepositValidators(form: FormGroup)
  // - createDepositDependencyValidator(paymentMethodField: string)
  // - getFieldErrorMessage(fieldName: string, field: AbstractControl)

  // 如果 TLS12040 有特殊的驗證邏輯，可以在這裡 override 基底方法
  // 例如：
  // override updateFieldValidators(form: FormGroup): void {
  //   super.updateFieldValidators(form);
  //   // TLS12040 特有的額外驗證邏輯
  // }
}
