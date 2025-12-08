// validation/tls13010-validation.service.ts
import { Injectable } from '@angular/core';
import { BaseTLSValidationService, TLSValidationConfig } from '@shared/services/tls/base-tls-validation.service';

/**
 * TLS13010 專櫃契約書維護 - 驗證服務
 *
 * 繼承自 BaseTLSValidationService，所有驗證邏輯已在基底類別中實作
 * 此服務只需提供模組特定的設定
 *
 * 使用方式：
 * ```typescript
 * constructor(private validationService: TLS13010ValidationService) {}
 *
 * ngOnInit() {
 *   this.validationService.updateAllValidators(this.dataForm);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TLS13010ValidationService extends BaseTLSValidationService {
  /**
   * 提供 TLS13010 模組設定
   */
  protected getModuleConfig(): TLSValidationConfig {
    return {
      identifierField: 'talent_id',  // TLS13010 使用 talent_id 作為主鍵
      moduleName: 'TLS13010'
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

  // 如果 TLS13010 有特殊的驗證邏輯，可以在這裡 override 基底方法
  // 例如：
  // override updateFieldValidators(form: FormGroup): void {
  //   super.updateFieldValidators(form);
  //   // TLS13010 特有的額外驗證邏輯
  // }
}
