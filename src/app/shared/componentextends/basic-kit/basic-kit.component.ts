import { AbstractControl, FormControl, Validators } from '@angular/forms';

export class BasicKitComponent {
  placeholder: string | undefined;
  placeholder2: string | undefined;
  isRequired = false;
  isRequired2 = false;
  maxLength: number | null = null;
  minLength: number | null = null;
  maxValue: number | null = null;
  minValue: number | null = null;
  isNumberOnly = false;

  updateControlState(...controls: FormControl[]) {
    controls.forEach((control, index) => {
      this.checkRequiredValidator(control, index);
      this.checkIntLengthValidator(control);
      this.checkMinMaxValidator(control);
      this.checkNumberValidator(control);
      this.setPlaceholder(control, index);
    });
  }

  checkRequiredValidator(control: FormControl, index = 0): void {
    const isRequired = control?.hasValidator(Validators.required) ?? false;
    if (index === 0) this.isRequired = isRequired;
    if (index === 1) this.isRequired2 = isRequired;
  }

  checkIntLengthValidator(control: AbstractControl): void {
    const validator = control.validator;
    if (!validator) return;

    const maxLengthErrors = validator(new FormControl({ length: Infinity })) ?? {};
    this.maxLength = "maxlength" in maxLengthErrors ? maxLengthErrors['maxlength'].requiredLength : null;

    const minLengthErrors = validator(new FormControl('a')) ?? {};
    this.minLength = "minlength" in minLengthErrors ? minLengthErrors['minlength'].requiredLength : null;
  }

  checkMinMaxValidator(control: AbstractControl): void {
    const validator = control.validator;
    if (!validator) {
      this.maxValue = null;
      this.minValue = null;
      return;
    }

    // 用超過最大值來觸發 max 錯誤
    const maxTest = validator(new FormControl(Number.MAX_SAFE_INTEGER));
    this.maxValue = maxTest?.['max']?.max ?? null;
    if (this.maxValue !== null && !isNaN(this.maxValue)) {
      this.maxLength = this.maxValue.toString().length;
    }

    // 用小於最小值來觸發 min 錯誤
    const minTest = validator(new FormControl(-Number.MAX_SAFE_INTEGER));
    this.minValue = minTest?.['min']?.min ?? null;
  }

  checkNumberValidator(control: AbstractControl): void {
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
      if (index === 0) this.placeholder = '';
      if (index === 1) this.placeholder2 = '';
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
      placeholderParts.push(`必須為${this.minLength}個字`);
    } else if (this.maxLength && !this.maxValue) {
      placeholderParts.push(`最多${this.maxLength}個字`);
    } else if (this.minLength) {
      placeholderParts.push(`最少${this.minLength}個字`);
    }
    if (this.minValue !== null && this.maxValue !== null && this.minValue === this.maxValue) {
      placeholderParts.push(`必須為${this.minValue}`);
    } else {
      if (this.minValue !== null) {
        placeholderParts.push(`最小值為${this.minValue}`);
      }
      if (this.maxValue !== null) {
        placeholderParts.push(`最大值為${this.maxValue}`);
      }
    }
    if (this.isNumberOnly) {
      placeholderParts.unshift('請輸入數字');
    }
    const finalPlaceholder = placeholderParts.join(', ');
    if (index === 0) this.placeholder = finalPlaceholder;
    if (index === 1) this.placeholder2 = finalPlaceholder;
  }

  copyText(control: FormControl): void {
    const textToCopy = control.value;
    navigator.clipboard.writeText(textToCopy).then(() => {
      console.log('Text copied to clipboard');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }
}
