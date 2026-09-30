import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { formatDate } from '@others/component/table/table.model';
@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    const config: any = {
      required: '必填',
      pattern: '格式錯誤，請重新輸入。',
      invalidNumber: '只能輸入數字',
      email: '「電子郵件」格式錯誤，請重新輸入。',
      invalidCreditCard: 'Is invalid credit card number',
      invalidEmailAddress: '「電子郵件」格式錯誤，請重新輸入。',
      invalidPassword: `輸入無效。長度至少為 6 個字元，且必須包含一個數字。`,
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
      passwordsMismatch: '兩次輸入不一致，請重新輸入。', // NOSONAR
      invalidPasswordStrength: '強度不足，至少包含一個英文小寫字母與一個數字。', // NOSONAR
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
      timeGreaterThan: `時間必須大於等於 ${(formatDate(validatorValue.requiredTime))}`,
      max: `最大值為${validatorValue.max}`,
      min: `最小值為${validatorValue.min}`,
      textRange: '起號不可大於迄號',
      invalidGuiVehicle: '格式錯誤：需以「/」為開頭，長度8碼，且第2碼後只能包含半形英數字+-.等符號',
      dateNotAfterToday: '日期必須大於等於今日',
      containsFullWidth: '不可輸入全形字元，請切換為半形輸入。',
      accNoClassNoMismatch: '「科目代號」與「三碼代號」不符',
      requireOneGroup: '請輸入「退出/折讓單號」或「發票號碼」擇一輸入',
      bnkIdDuplicate: '此【公司銀行科目】已有【帳戶編號】使用，請重新輸入。',
      invalidCompanyId: '統一編號格式錯誤',
      invalidIdCard: '身份證字號格式錯誤',
      reserveAmtTooLarge: '保留款金額不可大於應付金額',
      invalidIp: 'IP 位址格式錯誤 (範例: 192.168.1.1)',
      renewalDateTooEarly: `日期不可早於上份契約截止日後一天（最早可選 ${validatorValue?.min}）`,
      renewalOperDateTooEarly: `日期不可早於上份營運截止日後一天（最早可選 ${validatorValue?.min}）`,
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
    // 0414 農保加保增加檢核說明 : 邏輯檢核，若有錯誤顯示＂身分證號邏輯檢核錯誤，確定要繼續申報嗎?”，若回應確定，則繼續進行作業。
    // }

    // ====NA=====
    // 長度最限不得超過10個長度，且為必填，否則顯示錯誤訊息="{對應欄位名稱}為必填"。"

    if (typeof control.value !== 'string') {
      return { invalidId: true };
    }

    if (control.value !== null) {
      if (!RegExp(/^[A-Za-z][12]\d{8}$/).exec(control.value)) {
        return { invalidIdn: true };
      }
    }
    return null;
  }
  // 電子信箱
  emailValidator(control: { value: string | null; }): ValidationErrors | null {
    // [驗證]
    // 非必填,若有輸入值,檢核輸入資料需為英數字含特殊符號並檢查是否有@符號
    // 長度限制40個字元,非必填,若有輸入值,檢核輸入資料需為英數字含特殊符號並檢查是否有@符號
    // [回傳]
    // 若檢核有誤,顯示提示訊息:「電子郵件」,格式錯誤,請重新輸入。
    const value = control.value;

    // 如果值為 null 或空字串,則不進行驗證
    if (value === null || value === '') {
      return null;
    }

    // RFC 2822 compliant regex - 檢查電子郵件格式
    const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

    if (!emailRegex.test(value)) {
      return { invalidEmailAddress: true };
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
    return (control: AbstractControl): Record<string, any> | null => {
      const value = control.value || ''; // Handle null or undefined
      const isValid = value.toString().length === length;
      return isValid ? null : { exactLength: { requiredLength: length } };
    };
  }

  // 強度驗證器
  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);

      const isValid = hasLowerCase && hasNumber;

      return isValid ? null : { invalidPasswordStrength: true };
    };
  }
  // 匹配驗證
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

        if (!Number.isNaN(beg) && !Number.isNaN(end)) {
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
  // GUI_YYMM 驗證：只能為單數月
  oddMonthValidator(control: { value: Date | null }) {
    const value = control.value;

    if (value !== null && value instanceof Date && !Number.isNaN(value.getTime())) {
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

  // GUI_YYMM 驗證：只能為雙數月
  evenMonthValidator(control: { value: Date | null }): ValidationErrors | null {
    const value = control.value;

    if (value !== null && value instanceof Date && !Number.isNaN(value.getTime())) {
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


  // 輸入日期不能小於前一個月
  minMonthValidator(control: { value: Date | null }): ValidationErrors | null {
    const value = control.value;

    if (value !== null && value instanceof Date && !Number.isNaN(value.getTime())) {
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
  //輸入的字串YYYYMM 不能小於前一個月
  minMonthValidator2(control: { value: string | null }): ValidationErrors | null {
    const value = control.value;
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 當前月的前一個月 1 號
    if (value?.length === 6) {
      const year = Number.parseInt(value.substring(0, 4), 10);
      const month = Number.parseInt(value.substring(4, 6), 10) - 1; // JS 月份從 0 開始
      if (!Number.isNaN(year) && !Number.isNaN(month)) {
        const inputDate = new Date(year, month, 1);
        if (inputDate < prevMonth) {
          return { invalidMinMonthDate: true };
        }
      }
    }
    return null;
  }

  // 輸入日期不能大於當前月份
  maxMonthValidator(control: { value: Date | null }): ValidationErrors | null {
    const value = control.value;

    if (value !== null && value instanceof Date && !Number.isNaN(value.getTime())) {
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

  dateAfterTodayValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // 1. 處理空值 (由 required 處理，這裡跳過)
      if (value === null || value === undefined || value === '') {
        return null;
      }

      // 2. 嚴格檢查：只接受 Date 物件
      // 這是最關鍵的一步，直接擋掉 `{length: Infinity}`, 'a', 'b' 等垃圾資料
      if (!(value instanceof Date)) {
        return null;
      }

      // 3. 檢查是否為有效的日期 (防止 Invalid Date)
      if (Number.isNaN(value.getTime())) {
        return null;
      }

      // 4. 邏輯比較 (使用 YYYYMMDD 格式比較，不受時區影響)
      const formatDate = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
      const today = new Date();

      return formatDate(value) >= formatDate(today) ? null : { dateNotAfterToday: true };
    };
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
   * 只能輸入半形英文、數字和特殊符號（不含中文或全形字元） > 支援空字串
   * @description 該驗證器同時檢查是否為純空白字串。
   */
  englishNumberSpaceSymbolValidator(control: { value: string | null }) {
    const value = control.value;

    // 如果值為 null 或 undefined，則不進行驗證。
    if (value === null || value === undefined) {
      return null;
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
   * 只允許數字和連字號(-或#)
   */
  phoneNumberValidator(control: { value: string | null }) {
    const value = control.value;
    if (value === null || value === '') {
      return null;
    }

    // 只允許數字和連字號
    const phoneRegex = /^[0-9\-#]+$/;

    if (!phoneRegex.test(value)) {
      return { invalidPhoneNumber: true };
    }

    return null;
  }

  // 時間必須大於指定的時間
  timeGreaterThanValidator(requiredDate: Date): ValidatorFn {
    const requiredDateOnly = new Date(requiredDate.getFullYear(), requiredDate.getMonth(), requiredDate.getDate());
    return (control: AbstractControl): ValidationErrors | null => {
      const inputTime = control.value;
      if (!inputTime || !(inputTime instanceof Date) || Number.isNaN(inputTime.getTime())) {
        return null;
      }
      const inputDateOnly = new Date(inputTime.getFullYear(), inputTime.getMonth(), inputTime.getDate());
      if (inputDateOnly < requiredDateOnly) {
        return {
          timeGreaterThan: {
            requiredTime: requiredDate.toISOString().split('T')[0] // 傳回 YYYY-MM-DD 格式
          }
        };
      }
      return null;
    };
  }

  // 字串範圍 驗證器 - 起號不能大於迄號
  textRangeValidator(startControlName: string, endControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      // 確保傳入的是 FormGroup
      if (!(formGroup instanceof FormGroup)) {
        return null;
      }

      const startControl = formGroup.get(startControlName);
      const endControl = formGroup.get(endControlName);

      // 如果任何一個控制項不存在，或是兩者皆為空，則不驗證
      // 這樣可以讓 `required` 驗證器來處理必填邏輯
      const startValue = startControl?.value;
      const endValue = endControl?.value;

      // 如果起號或迄號其中一個沒有值，則不執行此驗證
      if (!startValue || !endValue) {
        return null;
      }

      // 進行值比較，並返回錯誤
      if (startValue > endValue) {
        return { textRange: true };
      }

      // 驗證通過
      return null;
    };
  }

  /**
 * 檢查是否包含全形字元（包含數字、符號、空格）
 */
  containsFullWidth(control: { value: any }) {
    const value = control.value;
    if (value === null || value === '' || value === undefined) {
      return null;
    }

    // 使用正則表達式檢查是否包含全形字元或全形空格
    const fullWidthRegex = /[！-～　]/;

    if (fullWidthRegex.test(value.toString())) {
      return { containsFullWidth: true };
    }

    return null;
  }

  // 科目代號與三碼代號是否相符檢核
  accNoClassNoMatchValidator(accNoControlName: string, classNoControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      if (!(formGroup instanceof FormGroup)) {
        return null;
      }

      const accNoControl = formGroup.get(accNoControlName);
      const classNoControl = formGroup.get(classNoControlName);

      if (!accNoControl || !classNoControl) {
        return null;
      }

      const accNo = accNoControl.value;
      const classNo = classNoControl.value;

      if (accNoControl.hasError('accNoClassNoMismatch')) {
        const errors = { ...accNoControl.errors };
        delete errors['accNoClassNoMismatch'];
        if (Object.keys(errors).length === 0) {
          accNoControl.setErrors(null);
        } else {
          accNoControl.setErrors(errors);
        }
      }

      if (accNo && classNo && accNo.length >= 3) {
        if (accNo.slice(0, 3) !== classNo) {
          accNoControl.setErrors({ ...accNoControl.errors, accNoClassNoMismatch: true });
          return { accNoClassNoMismatch: true };
        }
      }

      return null;
    };
  }

  // 公司統一編號（8碼數字，加權檢核碼驗證）
  // 演算法：每位數字乘以對應權重 [1,2,1,2,1,2,4,1]，
  // 乘積若為兩位數則將十位與個位相加，最終各位結果總和需為 5 的倍數。
  // 特例：第7碼為 7 時（7×4=28，2+8=10），提供兩種合法總和（取 1 或 0 皆可接受）。
  companyIdValidator(control: { value: string | null }): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    if (!/^\d{8}$/.test(value)) return { invalidCompanyId: true };

    const weights = [1, 2, 1, 2, 1, 2, 4, 1];
    const digitSums: number[] = [];
    let altDigit = -1;

    for (let i = 0; i < 8; i++) {
      let product = Number.parseInt(value[i]) * weights[i];
      if (product >= 10) product = Math.floor(product / 10) + (product % 10);
      // 僅第 7 碼(index 6)數字為 7 時會再次 >= 10（7×4=28 → 2+8=10）
      if (product >= 10) { altDigit = product % 10; product = Math.floor(product / 10); }
      digitSums.push(product);
    }

    const sum = digitSums.reduce((a, b) => a + b, 0);
    const valid = altDigit === -1
      ? sum % 5 === 0
      : (sum % 5 === 0) || ((sum - digitSums[6] + altDigit) % 5 === 0);

    return valid ? null : { invalidCompanyId: true };
  }

  // 身份證字號（10碼：1碼大寫英文字母代表戶籍地 + 9碼數字，含檢查碼）
  // 演算法：首碼英文字母轉換為兩位數值（A=10...），計算式：
  // N1十位數 + N1個位數x9 + N2x8 + N3x7 + N4x6 + N5x5 + N6x4 + N7x3 + N8x2 + N9x1 + N10x1
  // 總和需為 10 的倍數（餘數為 0）才合法。
  private readonly idCardLetterMap: Record<string, number> = {
    A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34, J: 18,
    K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25, S: 26, T: 27,
    U: 28, V: 29, W: 30, X: 31, Y: 32, Z: 33,
  };

  idCardValidator(control: { value: string | null }): ValidationErrors | null {
    const value = control.value;
    // FieldStateDirective 會用非字串假值（{length:Infinity}、數字）探測 maxLength/min/max，
    // 這裡務必先擋型別，否則 toUpperCase() 會拋例外炸掉整個 Validators.compose 鏈。
    if (!value || typeof value !== 'string') return null;

    const upper = value.toUpperCase();
    if (!/^[A-Z][0-9]{9}$/.test(upper)) return { invalidIdCard: true };

    const letterValue = this.idCardLetterMap[upper[0]];
    const tens = Math.floor(letterValue / 10);
    const ones = letterValue % 10;
    const digits = upper.slice(1).split('').map(Number); // N2~N10 共 9 碼
    const weights = [8, 7, 6, 5, 4, 3, 2, 1, 1];

    const sum = tens + ones * 9 + digits.reduce((acc, d, i) => acc + d * weights[i], 0);

    return sum % 10 === 0 ? null : { invalidIdCard: true };
  }

  invoicePeriodValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value || typeof value !== 'string' || value.length < 6) return null;

      const year = Number.parseInt(value.substring(0, 4), 10);
      const month = Number.parseInt(value.substring(4, 6), 10);

      // 邏輯：今天 2026/05/01，當期起點是 202605
      // 鎖死不可小於 202605
      if (year < 2026 || (year === 2026 && month < 5)) {
        return { invalidMinMonthDate: true }; // 借用現有的錯誤 key
      }
      return null;
    };
  }

  // 只能輸入正確的 IPv4 格式
  ipValidator(control: { value: string | null }): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === '') {
      return null;
    }
    // IP 位址正規表達式
    const ipPattern = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

    if (!ipPattern.test(value)) {
      return { invalidIp: true }; // 定義錯誤 key 為 invalidIp
    }
    return null;
  }
}
