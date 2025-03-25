import { AbstractControl, FormControl, Validators } from '@angular/forms';

export class BasicKitComponent {
  isRequired: boolean = false; // 控制 * 顯示或隱藏
  placeholder: string = ''; // 顯示註解
  intLength: number = 0; // 設定最長輸入數
  minLength: number = 0; // 設定最長輸入數
  // Required
  // ----------------------------------------------------------------
  checkRequiredValidator(control: FormControl): void {
    if (control && control.validator) {
      const validator = control.validator({} as FormControl);
      this.isRequired = validator && validator['required'] ? true : false;
    }
  }

  checkTwoRequiredValidator(startControl: FormControl, endControl: FormControl): void {
    if (startControl && startControl.validator) {
      const validator = startControl.validator({} as FormControl);
      this.isRequired = validator && validator['required'] ? true : false;
      return;
    }

    if (endControl && endControl.validator) {
      const validator = endControl.validator({} as FormControl);
      this.isRequired = validator && validator['required'] ? true : false;
      return;
    }
  }
  // Placeholder
  // ----------------------------------------------------------------
  hasMaxLengthValidator(control: AbstractControl): boolean {
    const validator = control.validator;

    if (validator === null) {
      return false;
    }

    const errors = validator(new FormControl({ length: Infinity })) ?? {};
    return "maxlength" in errors;
  }

  getMaxLengthValidator(control: AbstractControl, fallback: number): number;
  getMaxLengthValidator(control: AbstractControl): number | undefined;
  getMaxLengthValidator(control: AbstractControl, fallback?: number): number | undefined {
    const validatorFn = control.validator;

    if (validatorFn === null) {
      return fallback;
    }

    const errors = validatorFn(new FormControl({ length: Infinity }));

    if (errors && errors['maxlength']) {
        return errors['maxlength']['requiredLength'];
    }

    return fallback;
  }

  hasMinLengthValidator(control: AbstractControl): boolean {
    const validator = control.validator;

    if (validator === null) {
      return false;
    }

    const errors = validator(new FormControl({ length: Infinity })) ?? {};
    return "minlength" in errors;
  }

  getMinLengthValidator(control: AbstractControl, fallback: number): number;
  getMinLengthValidator(control: AbstractControl): number | undefined;
  getMinLengthValidator(control: AbstractControl, fallback?: number): number | undefined {
    const validatorFn = control.validator;

    if (validatorFn === null) {
      return fallback; // 確保返回 fallback 或 undefined
    }

    const errors = validatorFn(new FormControl({ length: Infinity }));

    if (errors && errors['minlength']) {
        return errors['minlength']['requiredLength'];
    }

    return fallback; // 確保返回 fallback 或 undefined
  }

  getExactLengthValidator(control: FormControl): number | undefined {
    const validator = control.validator ? control.validator({} as AbstractControl) : null;
    if (validator && validator['exactLength']) {
      return validator['exactLength'].requiredLength;
    }
    return undefined;
  }

  setDefaultPlaceholder(defaultplaceholder: string) {
    if (defaultplaceholder) {
      this.placeholder = defaultplaceholder;
    }
  }
  setPlaceholder(defaultplaceholder: string, control: FormControl) {
    let placeholderParts: string[] = [];

    // required
    if (control.hasValidator(Validators.required)) {
      placeholderParts.push('必填');
    }

    // Check if the control has the exactLength validator
    const exactLengthValue = this.getExactLengthValidator(control);
    if (exactLengthValue) {
      placeholderParts.push(`長度必須為${exactLengthValue}個字串`);
    } else {
        // maxLength
        const maxLengthValue = this.getMaxLengthValidator(control);
        if (maxLengthValue) {
            placeholderParts.push(`最長${maxLengthValue}個字串`);
        }

        // minLength
        const minLengthValue = this.getMinLengthValidator(control);
        if (minLengthValue) {
            placeholderParts.push(`最少${minLengthValue}個字串`);
        }
    }
    // If there are validation messages, concatenate them; otherwise, use the default placeholder
    this.placeholder = placeholderParts.length > 0 ? placeholderParts.join(', ') : defaultplaceholder;
  }
  // maxlength
  // ----------------------------------------------------------------
  checkIntLengthValidator(control: FormControl): void {
    // Check for exactLengthValidator first
    const exactLengthValue = this.getExactLengthValidator(control);
    if (exactLengthValue) {
      this.intLength = exactLengthValue;
    } else {
      // If exactLengthValidator is not present, check for maxLengthValidator
      const maxLengthValue = this.getMaxLengthValidator(control);
      const minLengthValue = this.getMinLengthValidator(control);
      if (maxLengthValue) {
        this.intLength = maxLengthValue;
      }
      // minLength
      else if (minLengthValue) {
        this.minLength = minLengthValue;
      }
    }
  }
}
