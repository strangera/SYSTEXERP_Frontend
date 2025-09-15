import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { formatDate } from '@shared/componentkit/table/table.model';
// taiwan-id-validator
// https://github.com/enylin/taiwan-id-validator
@Injectable({
  providedIn: 'root',
})
//
export class ValidationService {
  getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    const config: any = {
      required: '必填',
      invalidNumber: '只能輸入數字',
      email: '「電子郵件」，格式錯誤，請重新輸入。',
      invalidCreditCard: 'Is invalid credit card number',
      invalidEmailAddress: '「電子郵件」，格式錯誤，請重新輸入。',
      invalidPassword: `密碼無效。密碼長度至少為 6 個字元，且必須包含一個數字。`,
      minlength: `最短長度為 ${validatorValue.requiredLength}`,
      maxlength: `最長長度為 ${validatorValue.requiredLength}`,
      exactLength: `長度只能為 ${validatorValue.requiredLength}`,
      invalidIdn: '身分證號為必填，不符合規則',
      invalidDate: '請補上錯誤訊息',
      invalidDate2: '日期格式錯誤',
      invalidHealthInsurance: '請補上錯誤訊息',
      invalidTaxID: '請補上錯誤訊息',
      invalidHddocnum: '請補上錯誤訊息',
      invalidElectronicnum: '請補上錯誤訊息',
      invalidDateRange: '日期起不可大於日期迄',
      invalidNumberRange: '起始數字不可大於結束數字',
      passwordsMismatch: '兩次輸入的密碼不一致，請重新輸入。',
      invalidPasswordStrength: '密碼強度不足，至少包含一個大小寫字母、一個數字和一個特殊符號。',
      invalidGuiTrack: '僅能輸入大寫英文字母',
      invalidGuiBegNo: '起號結尾只能為 00 或 50',
      invalidGuiEndNo: '迄號結尾只能為 49 或 99',
      invalidGuiNumberRange: '結束號碼不可小於起始號碼',
      invalidOddMonth: '只能選擇單數月',
      invalidMinMonthDate: '不能小於本期',
      invalidEvenMonth: '只能選擇雙數月',
      invalidMaxMonthDate: '不能大於本期',
      notMultipleOf50: '請輸入 50 的倍數',
      pureEnglish: '只能輸入純英文',
      englishAndSymbol: '只能輸入英文和符號',
      containsChinese: '不可輸入中文或全形字元',
      invalidAlphanumeric: '只能輸入半形英文和數字',
      invalidEnglishNumberSymbol: '只能輸入英文和數字和符號',
      invalidPhoneNumber: '電話號碼格式錯誤',
      warehouseMismatch: '調出倉別與調入倉別必需不同',
      timeGreaterThan: `時間必須大於 ${(formatDate(validatorValue.requiredTime))}`,
      max: `最大值為${validatorValue.max}`,
      min: `最小值為${validatorValue.min}`,
    };
    return config[validatorName];
  }
  // 身分證號
  identityValidator(control: { value: string | null; }) {

    // 這段被刪除了!! {
    // "英數字10碼，英數轉半形大寫，第一字為英文，第二字為數字"1"或"2"，其餘為數字
    // ＝＝＝
    // 第一碼必須為英文，第二碼若為數字１或２請以國民身分證驗證方式進行，若第二碼為英文Ａ、Ｂ、Ｃ、Ｄ請以統一居留證號驗證方式進行，第二碼非上述數字或代碼者，為異常資料。
    // ====
    // 0414 農保加保增加檢核說明 :　邏輯檢核，若有錯誤顯示＂身分證號邏輯檢核錯誤，確定要繼續申報嗎?”，若回應確定，則繼續進行作業。
    // }

    // ====NA=====
    // 長度最限不得超過10個長度，且為必填，否則顯示錯誤訊息="{對應欄位名稱}為必填"。"

    if (typeof control.value !== 'string') {
      return { invalidId: true };
    }

    if (control.value !== null) {
      if (!control.value.match(/^[A-Za-z][12]\d{8}$/)) {
        return { invalidIdn: true };
      }
    }
    return null;
  }
  // 電子信箱
  emailValidator(control: { value: string | null; }) {
    // [驗證]
    // 非必填，若有輸入值，檢核輸入資料需為英數字含特殊符號並檢查是否有@符號
    // 長度限制40個字元，非必填，若有輸入值，檢核輸入資料需為英數字含特殊符號並檢查是否有@符號
    // [回傳]
    // 若檢核有誤，顯示提示訊息:「電子郵件」，格式錯誤，請重新輸入。
    // RFC 2822 compliant regex
    if (control.value !== null) {
      if (
        !control.value.match(
          /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        )
      ) {
        return { invalidEmailAddress: true };
      }
    }

    return null;
  }

  // 數字
  numberValidator(control: { value: string | null }) {
    const value = control.value;
    if (value !== null && value !== undefined) {
      const stringValue = value.toString();
      if (!/^[0-9]*$/.test(stringValue)) {
        return { invalidNumber: true };
      }
    }
    return null;
  }
  //
  exactLengthValidator(length: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value || ''; // Handle null or undefined
      const isValid = value.toString().length === length;
      return isValid ? null : { exactLength: { requiredLength: length } };
    };
  }

  // 密碼強度驗證器
  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\-_+=`~[\]\\;']/.test(value);

      const isValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

      return isValid ? null : { invalidPasswordStrength: true };
    };
  }
  // 密碼匹配驗證
  passwordsMatchValidator(password: string, rePassword: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const passwordControl = control.get(password);
      const rePasswordControl = control.get(rePassword);
      if (!passwordControl || !rePasswordControl) return null;

      const passwordsMatch = passwordControl.value === rePasswordControl.value;

      return passwordsMatch ? null : { passwordsMismatch: true };
    };
  }
  // GUI Track - 僅允許大寫英文
  guiTrackValidator(control: { value: string | null }) {
    const value = control.value;
    if (value !== null && value !== '') {
      if (!/^[A-Z]+$/.test(value)) {
        return { invalidGuiTrack: true };
      }
    }
    return null;
  }
  // GUI_BegNo 驗證：純數字，結尾只能是 00 或 50
  guiBegNoValidator(control: { value: string | null }) {
    const value = control.value;
    if (value !== null && value !== '') {
      if (!/^\d+$/.test(value)) {
        return { invalidNumber: true };
      }
      if (!/(00|50)$/.test(value)) {
        return { invalidGuiBegNo: true };
      }
    }
    return null;
  }

  // GUI_EndNo 驗證：純數字，結尾只能是 49 或 99
  guiEndNoValidator(control: { value: string | null }) {
    const value = control.value;
    if (value !== null && value !== '') {
      if (!/^\d+$/.test(value)) {
        return { invalidNumber: true };
      }
      if (!/(49|99)$/.test(value)) {
        return { invalidGuiEndNo: true };
      }
    }
    return null;
  }
  guiNumberRangeValidator(
    begNoControlName: string,
    endNoControlName: string
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // 確保 control 是一個 FormGroup，因為我們需要訪問其子控制項
      if (!(control instanceof FormGroup)) {
        return null;
      }
      const begNoControl = control.get(begNoControlName);
      const endNoControl = control.get(endNoControlName);
      // 檢查子控制項是否存在
      if (!begNoControl || !endNoControl) {
        console.warn(`驗證器錯誤：找不到控制項 ${begNoControlName} 或 ${endNoControlName}。`);
        return null;
      }
      const begNo = begNoControl.value;
      const endNo = endNoControl.value;
      if (endNoControl.hasError('invalidGuiNumberRange')) {
        endNoControl.setErrors(null);
      }
      if (begNoControl.hasError('invalidGuiNumberRange')) {
        begNoControl.setErrors(null);
      }

      if (begNo && endNo) {
        const beg = Number(begNo);
        const end = Number(endNo);

        if (!isNaN(beg) && !isNaN(end)) {
          if (beg > end) {
            // 如果起始號大於迄號，將錯誤設置在『結束號』的控制項上
            // 這樣錯誤訊息會顯示在 GUI_EndNo 的欄位上
            endNoControl.setErrors({ invalidGuiNumberRange: true });

            // 同時在 FormGroup 上返回錯誤，以便整體表單狀態反映錯誤
            return { invalidGuiNumberRange: true };
          }
        }
      }

      // 如果沒有錯誤，返回 null
      return null;
    };
  }
  // GUI_YYMM 驗證：只能為單數月，且只能是當月的前一個月
  oddMonthValidator(control: { value: Date | null }) {
    const value = control.value;

    if (value !== null && value instanceof Date && !isNaN(value.getTime())) {
      const month = value.getMonth() + 1; // JS 月份是 0-based，要+1
      // 檢查是否為單數月
      if (month % 2 === 0) {
        return { invalidOddMonth: true };
      }

    } else {
      // 如果不是有效的 Date 物件
      return { invalidDate2: true };
    }

    return null;
  }

  // 輸入日期不能小於前一個月
  minMonthValidator(control: { value: Date | null }): ValidationErrors | null {
    const value = control.value;

    if (value !== null && value instanceof Date && !isNaN(value.getTime())) {
      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 當前月的前一個月 1 號
      const inputDate = new Date(value.getFullYear(), value.getMonth(), 1);

      // 輸入日期不能小於前一個月
      if (inputDate < prevMonth) {
        return { invalidMinMonthDate: true };
      }
    } else {
      // 如果不是有效的 Date 物件
      return { invalidDate2: true };
    }

    return null;
  }

  // 輸入日期不能大於當前月份
  maxMonthValidator(control: { value: Date | null }): ValidationErrors | null {
    const value = control.value;

    if (value !== null && value instanceof Date && !isNaN(value.getTime())) {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1); // 當前月 1 號
      const inputDate = new Date(value.getFullYear(), value.getMonth(), 1);

      // 輸入日期不能大於當前月份
      if (inputDate > currentMonth) {
        return { invalidMaxMonthDate: true };
      }
    } else {
      // 如果不是有效的 Date 物件
      return { invalidDate2: true };
    }

    return null;
  }


  // GUI_YYMM 驗證：只能為雙數月，且不能大於當前月份
  evenMonthValidator(control: { value: Date | null }): ValidationErrors | null {
    const value = control.value;

    if (value !== null && value instanceof Date && !isNaN(value.getTime())) {
      const month = value.getMonth() + 1; // JS 月份是 0-based，要+1
      // 檢查是否為雙數月
      if (month % 2 !== 0) {
        return { invalidEvenMonth: true };
      }
    } else {
      // 如果不是有效的 Date 物件
      return { invalidDate2: true };
    }

    return null;
  }


  // optionalMultipleOfFiftyValidator：非必填，但若有填值，必須是 50 的倍數
  optionalMultipleOfFiftyValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;
      if (typeof value !== 'number') return { notMultipleOf50: true };
      return value % 50 === 0 ? null : { notMultipleOf50: true };
    };
  }

  // 只能輸入純英文（大小寫皆可）
  pureEnglishValidator(control: { value: string | null }) {
    const value = control.value;
    if (value !== null && value !== '') {
      if (!/^[A-Za-z]+$/.test(value)) {
        return { pureEnglish: true };
      }
    }
    return null;
  }

  /**
  * 只能輸入半形英文和數字
  */
  alphanumericValidator(control: { value: string | null }) {
    const value = control.value;
    // 如果值為空，則不進行驗證，因為這應該由 `required` 驗證器來處理
    if (value === null || value === '') {
      return null;
    }

    // 使用正規表達式檢查是否只包含英文字母和數字
    const isValid = /^[a-zA-Z0-9]+$/.test(value);

    return isValid ? null : { invalidAlphanumeric: true };
  }

  // 只能輸入英文（A-Z, a-z）和符號（不包含數字與空白）
  englishAndSymbolValidator(control: { value: string | null }) {
    const value = control.value;
    if (value !== null && value !== '') {
      // 僅允許英文大小寫 + 一般符號，不含數字與空白
      if (!/^[A-Za-z!@#$%^&*(),.?":{}|<>_\-+=`~[\]\\;'/]+$/.test(value)) {
        return { englishAndSymbol: true };
      }
    }
    return null;
  }

  // 不可輸入中文（含全形中文字或符號）
  noChineseValidator(control: { value: string | null }) {
    const value = control.value;
    if (value !== null && value !== '') {
      // 使用 Unicode 範圍 + u flag 來匹配 CJK 漢字（基本、擴充A~E）
      const chineseRegex = /[\u4E00-\u9FFF\u3400-\u4DBF\u{20000}-\u{2A6DF}\u{2A700}-\u{2B73F}\u{2B740}-\u{2B81F}\u{2B820}-\u{2CEAF}]/u;
      if (chineseRegex.test(value)) {
        return { containsChinese: true };
      }
    }
    return null;
  }
  /**
   * 只能輸入半形英文、數字和特殊符號（不含中文或全形字元）
   * @description 該驗證器同時檢查是否為純空白字串。
   */
  englishNumberSymbolValidator(control: { value: string | null }) {
    const value = control.value;

    // 如果值為 null 或 undefined，則不進行驗證。
    if (value === null || value === undefined) {
      return null;
    }

    // 檢查值是否為空白字串（包含空格、tab 等）。
    // 如果是，返回錯誤。
    if (typeof value === 'string' && value.trim() === '') {
      return { invalidEnglishNumberSymbol: true };
    }

    // 檢查是否只包含半形英數字和半形特殊符號。
    // 這個正則表達式會匹配所有 ASCII 字元（0-127），
    // 這樣可以有效地排除所有全形字元和中文字。
    const isValid = /^[\x20-\x7E]*$/.test(value);

    // 如果驗證不通過，返回錯誤；否則返回 null。
    return isValid ? null : { invalidEnglishNumberSymbol: true };
  }

  /**
   * 電話號碼驗證器
   * 只允許數字和連字號(-)
   */
  phoneNumberValidator(control: { value: string | null }) {
    const value = control.value;
    if (value === null || value === '') {
      return null;
    }

    // 只允許數字和連字號
    const phoneRegex = /^[0-9\-]+$/;

    if (!phoneRegex.test(value)) {
      return { invalidPhoneNumber: true };
    }

    return null;
  }

  // 時間必須大於指定的時間
  timeGreaterThanValidator(requiredTime: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const inputTime = control.value;
      // 確保輸入值是有效日期
      if (inputTime && inputTime instanceof Date && !isNaN(inputTime.getTime())) {
        if (inputTime <= requiredTime) { // 使用 <= 以確保時間不能等於
          return { timeGreaterThan: { requiredTime: requiredTime } };
        }
      }
      return null;
    };
  }
}
