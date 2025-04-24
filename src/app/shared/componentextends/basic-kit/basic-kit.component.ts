import { AbstractControl, FormControl, Validators } from '@angular/forms';

export class BasicKitComponent {
  placeholder: string | undefined; // 顯示註解
  isRequired = false; // 控制 * 顯示或隱藏
  maxLength: number | null = null; // 設定最長輸入數
  minLength: number | null = null; // 設定最短輸入數
  updateControlState(control1: FormControl, control2?: FormControl) {
    this.checkRequiredValidator(control1, control2);
    this.checkIntLengthValidator(control1);
    this.setPlaceholder(control1);
  }
  // Required
  // ----------------------------------------------------------------
  // 檢查是否必填 - 單一欄位
  checkRequiredValidator(control1: FormControl, control2?: FormControl): void {
    if (control2) {
      this.isRequired = control1?.hasValidator(Validators.required) || control2?.hasValidator(Validators.required);
    } else {
      this.isRequired = control1?.hasValidator(Validators.required) ?? false;
    }
  }
  // 檢查是否有長度限制
  // ----------------------------------------------------------------
  checkIntLengthValidator(control: AbstractControl): void {
    const validator = control.validator;
    if (validator === null) {
      return;
    }
    // 檢查 maxLength
    const maxLengthErrors = validator(new FormControl({ length: Infinity })) ?? {};
    this.maxLength = "maxlength" in maxLengthErrors ? maxLengthErrors['maxlength'].requiredLength : null;
    // 檢查 minLength
    const minLengthErrors = validator(new FormControl('a')) ?? {};
    this.minLength = "minlength" in minLengthErrors ? minLengthErrors['minlength'].requiredLength : null;
  }

  // Placeholder
  // ----------------------------------------------------------------
  setPlaceholder(control: FormControl) {
    if (this.placeholder) {
      return;
    }
    this.placeholder = '請輸入...';
    const placeholderParts: string[] = [];

    if (control.hasValidator(Validators.required)) {
      placeholderParts.push('必填');
    }

    if (this.maxLength) {
      placeholderParts.push(`最多${this.maxLength}個字`);
    }
    if (this.minLength) {
      placeholderParts.push(`最少${this.minLength}個字`);
    }

    this.placeholder = placeholderParts.join(', ');
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
