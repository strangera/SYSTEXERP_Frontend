import { ChangeDetectorRef, DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { FormLabelService } from '@shared/service/form-label.service';
import { ValidationService } from '@shared/service/validation.service';
/**
 * 明確宣告欄位規則，取代對 FormControl 驗證器的探測反推。
 * 未提供的屬性會 fallback 用原本的驗證器探測（過渡期相容，行為不變）。
 */
export interface FieldMeta {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  numberOnly?: boolean;
}
/**
 * hostDirectives 示範版：與 BasicKitComponent 相同的欄位狀態推導邏輯，
 * 改用組合（hostDirectives）而非繼承提供給元件使用。
 * controlName/label 刻意不放進這裡，由 host 元件自己持有，
 * 呼叫 initControl 時傳入即可，減少 template 需要跟著改的範圍。
 */
@Directive({
  selector: '[appFieldState]',
  standalone: true,
})
export class FieldStateDirective {
  placeholder: string | undefined;
  placeholder2: string | undefined;
  isRequired = false;
  isRequired2 = false;
  maxLength: number | null = null;
  minLength: number | null = null;
  maxValue: number | null = null;
  minValue: number | null = null;
  isNumberOnly = false;

  private readonly formLabelService = inject(FormLabelService);
  private readonly validService = inject(ValidationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * 取得欄位目前的錯誤訊息文字，取代個別頁面各自套用 <app-control-messages> 的寫法。
   * 呼叫端仍需自行決定何時顯示（submitted / touched && invalid）。
   */
  getErrorMessage(control: AbstractControl | null, errorForGroup = false): string | null {
    if (!control) return null;

    if (control.errors) {
      for (const propertyName in control.errors) {
        if (Object.prototype.hasOwnProperty.call(control.errors, propertyName)) {
          return this.validService.getValidatorErrorMessage(propertyName, control.errors[propertyName]);
        }
      }
    }

    if (errorForGroup && control.parent?.errors) {
      for (const propertyName in control.parent.errors) {
        if (Object.prototype.hasOwnProperty.call(control.parent.errors, propertyName)) {
          return this.validService.getValidatorErrorMessage(propertyName, control.parent.errors[propertyName]);
        }
      }
    }

    return null;
  }

  initControl(control: FormControl, controlName?: string, label?: string, meta?: FieldMeta): void {
    if (controlName && label) {
      this.formLabelService.registerLabel(controlName, label);
    }
    // 訂閱 control 的狀態變化
    control.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updateControlState(control, 0, meta);
      this.cdr.markForCheck();
    });
    this.updateControlState(control, 0, meta);
    this.cdr.markForCheck();
  }

  updateControlState(control: FormControl, index = 0, meta?: FieldMeta): void {
    this.checkRequiredValidator(control, index, meta);
    this.checkIntLengthValidator(control, meta);
    this.checkMinMaxValidator(control, meta);
    this.checkNumberValidator(control, meta);
    this.setPlaceholder(control, index);
  }

  checkRequiredValidator(control: FormControl, index = 0, meta?: FieldMeta): void {
    const isRequired = meta?.required ?? control?.hasValidator(Validators.required) ?? false;
    if (index === 0) this.isRequired = isRequired;
    if (index === 1) this.isRequired2 = isRequired;
  }

  checkIntLengthValidator(control: AbstractControl, meta?: FieldMeta): void {
    if (meta?.minLength !== undefined || meta?.maxLength !== undefined) {
      this.maxLength = meta.maxLength ?? null;
      this.minLength = meta.minLength ?? null;
      return;
    }

    const validator = control.validator;
    if (!validator) return;

    const maxLengthErrors = validator(new FormControl({ length: Infinity })) ?? {};
    this.maxLength = "maxlength" in maxLengthErrors ? maxLengthErrors['maxlength'].requiredLength : null;

    const minLengthErrors = validator(new FormControl('a')) ?? {};
    this.minLength = "minlength" in minLengthErrors ? minLengthErrors['minlength'].requiredLength : null;
  }

  checkMinMaxValidator(control: AbstractControl, meta?: FieldMeta): void {
    if (meta?.min !== undefined || meta?.max !== undefined) {
      this.maxValue = meta.max ?? null;
      this.minValue = meta.min ?? null;
      if (this.maxValue !== null && !Number.isNaN(this.maxValue)) {
        this.maxLength = this.maxValue.toString().length;
      }
      return;
    }

    const validator = control.validator;
    if (!validator) {
      this.maxValue = null;
      this.minValue = null;
      return;
    }

    // 用超過最大值來觸發 max 錯誤
    const maxTest = validator(new FormControl(Number.MAX_SAFE_INTEGER));
    this.maxValue = maxTest?.['max']?.max ?? null;
    if (this.maxValue !== null && !Number.isNaN(this.maxValue)) {
      this.maxLength = this.maxValue.toString().length;
    }
    // 用小於最小值來觸發 min 錯誤
    const minTest = validator(new FormControl(-Number.MAX_SAFE_INTEGER));
    this.minValue = minTest?.['min']?.min ?? null;
  }

  checkNumberValidator(control: AbstractControl, meta?: FieldMeta): void {
    if (meta?.numberOnly !== undefined) {
      this.isNumberOnly = meta.numberOnly;
      return;
    }

    const validator = control.validator;
    if (!validator) {
      this.isNumberOnly = false;
      return;
    }

    const errors = validator(new FormControl('b')) ?? {};
    this.isNumberOnly = 'invalidNumber' in errors;
  }

  setPlaceholder(control: FormControl, index = 0): void {
    if (control.disabled) {
      if (index === 0) this.placeholder = ''; this.isRequired = false;
      if (index === 1) this.placeholder2 = ''; this.isRequired2 = false;
      return;
    }

    if (this.placeholder && this.placeholder2) {
      return;
    }
    const placeholderParts: string[] = [];

    if (control.hasValidator(Validators.required)) {
      placeholderParts.push('必填');
    }
    if (this.maxLength && this.minLength && this.maxLength === this.minLength && !this.maxValue) {
      placeholderParts.push(`${this.minLength}個字`);
    } else if (this.maxLength && !this.maxValue) {
      placeholderParts.push(`最多${this.maxLength}個字`);
    } else if (this.minLength) {
      placeholderParts.push(`最少${this.minLength}個字`);
    }
    if (this.minValue !== null && this.maxValue !== null && this.minValue === this.maxValue) {
      placeholderParts.push(`須為${this.minValue}`);
    } else {
      if (this.minValue !== null) {
        placeholderParts.push(`最小值${this.minValue}`);
      }
      if (this.maxValue !== null) {
        placeholderParts.push(`最大值${this.maxValue}`);
      }
    }
    const finalPlaceholder = placeholderParts.join(', ');
    if (index === 0) this.placeholder = finalPlaceholder;
    if (index === 1) this.placeholder2 = finalPlaceholder;
  }
}
