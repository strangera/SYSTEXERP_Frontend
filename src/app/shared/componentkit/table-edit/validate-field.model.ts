// 必填
export function validateRequired(value: any): { isValid: boolean; errorMessage: string[] } {
  const val = (value === null || value === undefined) ? '' : value.toString().trim();
  return {
    isValid: val !== '',
    errorMessage: ['必填'],
  };
}
// 只能輸入英文
export function validateEnglish(value: string): { isValid: boolean; errorMessage: string[] } {
  const regex = /^[a-zA-Z]+$/;
  if (value && regex.test(value)) {
    return { isValid: true, errorMessage: [] };
  }
  return { isValid: false, errorMessage: ['只能輸入英文'] };
}
// 只能輸入數字
export function validateNumber(value: string): { isValid: boolean; errorMessage: string[] } {
  const regex = /^[0-9]+$/;
  if (value && regex.test(value)) {
    return { isValid: true, errorMessage: [] };
  }
  return { isValid: false, errorMessage: ['只能輸入數字'] };
}
// 只能輸入英文與數字
export function validateAlphanumeric(value: string) {
  const val = value ?? '';
  if (val === '') return { isValid: true, errorMessage: [] }; // 沒填就不檢查
  const regex = /^[a-zA-Z0-9]+$/;
  const isValid = regex.test(val.toString());
  return { isValid, errorMessage: isValid ? [] : ['只能輸入英文與數字'] };
}
// 只能輸入英文、數字與特殊符號
export function validateAlphanumericSpecial(value: string): { isValid: boolean; errorMessage: string[] } {
  const regex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
  if (regex.test(value)) {
    return { isValid: true, errorMessage: [] };
  } else {
    return { isValid: false, errorMessage: ['只能輸入英文、數字與特殊符號'] };
  }
}
// 不可輸入中文
export function validateNoChinese(): (value: string, rowData: any, data: any[], field: string, header: string) => { isValid: boolean; errorMessage: string[] } {
  return (value: string) => {
    const hasChinese = /[\u4e00-\u9fa5]/.test(value ?? '');
    return {
      isValid: !hasChinese,
      errorMessage: ['不可輸入中文']
    };
  };
}
// 最小值為 ${min}
export function validateMinNumber(min: number): (value: string | number, rowData: any, data: any[], field: string, header: string) => { isValid: boolean; errorMessage: string[]; } {
  return (value: string | number): { isValid: boolean; errorMessage: string[] } => {
    // 先將值轉換為數字。如果是非數字字串，Number() 會返回 NaN。
    const numericValue = Number(value);
    // 檢查是否是有效數字且大於等於最小值
    const isValid = !isNaN(numericValue) && numericValue >= min;
    return {
      isValid,
      errorMessage: isValid ? [] : [`最小值為 ${min}`],
    };
  };
}
// 最大值為 ${max}
export function validateMaxNumber(max: number): (value: string, rowData: any, data: any[], field: string, header: string) => { isValid: boolean; errorMessage: string[]; } {
  return (value: string): { isValid: boolean; errorMessage: string[] } => {
    const numericValue = Number(value);
    const isValid = !isNaN(numericValue) && numericValue <= max;
    return { isValid, errorMessage: isValid ? [] : [`最大值為 ${max}`] };
  };
}
// 長度不能超過 ${maxLength} 個字
export function validateMaxLength(maxLength: number) {
  return (value: string): { isValid: boolean; errorMessage: string[] } => {
    const val = value ?? ''; // 如果是 null/undefined 變為空字串
    return {
      isValid: val.toString().length <= maxLength,
      errorMessage: [`長度不能超過 ${maxLength} 個字`],
    };
  };
}
// 長度不能小於 ${minLength} 個字
export function validateMinLength(minLength: number) {
  return (value: string): { isValid: boolean; errorMessage: string[] } => {
    const val = value ?? '';
    // 如果沒填值，則不觸發長度不足的錯誤 (必填交給 validateRequired)
    if (val.toString().length === 0) return { isValid: true, errorMessage: [] };

    return {
      isValid: val.toString().length >= minLength,
      errorMessage: [`長度不能小於 ${minLength} 個字`],
    };
  };
}
// ${header}」已重複
export function validateDuplicate(value: string, rowData: any, data: any[], field: string, header: string) {
  if (!data || !Array.isArray(data)) return { isValid: true, errorMessage: [] };

  const val = value ?? '';
  if (val === '') return { isValid: true, errorMessage: [] }; // 空值不檢查重複

  const duplicate = data.some(item => item[field] === val && item !== rowData);
  return { isValid: !duplicate, errorMessage: [`「${header}」已重複`] };
}
