// ['只能輸入英文與數字', '格式錯誤']
export function validateAlphanumeric(value: string): { isValid: boolean; errorMessage: string[] } {
  const regex = /^[a-zA-Z0-9]+$/;
  if (regex.test(value)) {
    return { isValid: true, errorMessage: [] };
  } else {
    return { isValid: false, errorMessage: ['只能輸入英文與數字', '格式錯誤'] };
  }
}

// ['只能輸入英文、數字與特殊符號', '格式錯誤']
export function validateAlphanumericSpecial(value: string): { isValid: boolean; errorMessage: string[] } {
  const regex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
  if (regex.test(value)) {
    return { isValid: true, errorMessage: [] };
  } else {
    return { isValid: false, errorMessage: ['只能輸入英文、數字與特殊符號', '格式錯誤'] };
  }
}

// ['只能輸入數字', '格式錯誤']
export function validateNumber(value: string): { isValid: boolean; errorMessage: string[] } {
  const regex = /^[0-9]+$/;
  if (value && regex.test(value)) {
    return { isValid: true, errorMessage: [] };
  }
  return { isValid: false, errorMessage: ['只能輸入數字', '格式錯誤'] };
}

// [`${header}不能小於 ${min}`, '格式錯誤']
export function validateMinNumber(min: number): (value: string | number, rowData: any, data: any[], field: string, header: string) => {
  isValid: boolean;
  errorMessage: string[];
} {
  return (value: string | number, rowData: any, data: any[], field: string, header: string): { isValid: boolean; errorMessage: string[] } => {
    // 先將值轉換為數字。如果是非數字字串，Number() 會返回 NaN。
    const numericValue = Number(value);

    // 檢查是否是有效數字且大於等於最小值
    const isValid = !isNaN(numericValue) && numericValue >= min;

    return {
      isValid,
      errorMessage: isValid ? [] : [`「${header}」不能小於 ${min}`, '格式錯誤'],
    };
  };
}

// [`${header}已重複`, '資料錯誤']
export function validateDuplicate(
  value: string,
  rowData: any,
  data: any[],
  field: string,
  header: string
): { isValid: boolean; errorMessage: string[] } {
  const duplicate = data.some(item => item[field] === value && item !== rowData);
  return {
    isValid: !duplicate,
    errorMessage: [`「${header}」已重複`, '資料錯誤'],
  };
}

// ['欄位不能為空', '資料錯誤']
export function validateRequired(
  value: string,
  rowData: any,
  data: any[],
  field: string,
  header: string
): { isValid: boolean; errorMessage: string[] } {
  return {
    isValid: value !== null && value !== '',
    errorMessage: [`「${header}」為必填項目，欄位不能為空`, '資料錯誤'],
  };
}

// [`長度不能超過 ${maxLength} 個字`, '格式錯誤']
export function validateMaxLength(maxLength: number): (value: string, rowData: any, data: any[], field: string, header: string) => { isValid: boolean; errorMessage: string[] } {
  return (value: string, rowData: any, data: any[], field: string, header: string): { isValid: boolean; errorMessage: string[] } => {
    return {
      isValid: value.length <= maxLength,
      errorMessage: [`「${header}」長度不能超過 ${maxLength} 個字`, '格式錯誤'],
    };
  };
}
// [`${header}不能超過 ${max}`, '格式錯誤']
export function validateMaxNumber(max: number): (value: string, rowData: any, data: any[], field: string, header: string) => {
  isValid: boolean;
  errorMessage: string[];
} {
  return (value: string, rowData: any, data: any[], field: string, header: string): { isValid: boolean; errorMessage: string[] } => {
    const numericValue = Number(value);
    const isValid = !isNaN(numericValue) && numericValue <= max;

    return {
      isValid,
      errorMessage: isValid ? [] : [`「${header}」不能超過 ${max}`, '格式錯誤'],
    };
  };
}
