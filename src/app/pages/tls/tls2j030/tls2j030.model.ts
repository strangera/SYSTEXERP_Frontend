import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateMaxNumber, validateRequired } from '@shared/components/table-edit/validate-field.model';
import { Column, formatAmount, formatDate } from '@others/component/table/table.model';

// 換開狀態選項
export const GUI_STATUS_OPTIONS = [
  { label: '正常', value: '0' },
  { label: '作廢', value: '1' }
];
// 發票聯式選項
export const GUI_PAPER_OPTIONS = [
  { label: '二聯式', value: '2' },
  { label: '三聯式', value: '3' },
  { label: '電子發票', value: 'E' }
];
// 後端來源發票稅別選項（TXN_TaxType）
export const TXN_TAXTYPE_OPTIONS = [
  { label: '免稅', value: '0' },
  { label: '應稅', value: '1' },
];
// 零稅註記選項
export const INV_NONETAX_OPTIONS = [
  { label: '正常', value: '0' },
  { label: '零稅', value: '1' }
];
// 丁種發票選項
export const GUI_DINGTYPE_OPTIONS = [
  { label: '非丁種', value: 'N' },
  { label: '丁種', value: 'Y' }
];

/**
 * FIX：
 * 補正一致邏輯，統一所有計算方式
 */
export function calculateNetTax(row: Record<string, unknown>) {
  // 從 row 取得必要的欄位值
  const taxType = String(row['PLU_TaxType'] ?? ''); // 稅別
  const zeroTax = String(row['INV_NoneTax'] ?? '0'); // 零稅註記

  let saleTax = parseFloat(String(row['TXN_SaleTax'] ?? 0)) || 0;
  let saleNoTax = parseFloat(String(row['TXN_SaleNoTax'] ?? 0)) || 0;

  // ===================================
  // ⭐️ 修正邏輯：根據稅別重置不相關的金額欄位
  // ===================================

  if (taxType === '0') {
    // 稅別 = 免稅 (PLU_TaxType = '0')
    // 應稅發票金額 (TXN_SaleTax) 應該被清空/重置為 0 (因為該欄位 disabled)
    saleTax = 0;
  } else if (taxType === '1') {
    // 稅別 = 應稅 (PLU_TaxType = '1')
    // 免稅發票金額 (TXN_SaleNoTax) 應該被清空/重置為 0 (因為該欄位 disabled)
    saleNoTax = 0;
  }

  // 總銷售發票金額 (含稅/免稅)
  const saleAmt = saleTax + saleNoTax;

  let TXN_Net = 0; // 未稅發票金額
  let TXN_Tax = 0; // 稅額

  if (taxType === '0') {
    // 1. 稅別 = 免稅 (PLU_TaxType = '0')
    // 未稅 = 免稅發票金額 (因為應稅金額 saleTax 已被重置為 0)
    // TXN_Net = saleNoTax; // 庭瑋說免稅時TXN_Net不用等於saleNoTax
    TXN_Tax = 0;
  } else if (taxType === '1') {
    // 2. 稅別 = 應稅 (PLU_TaxType = '1')
    if (zeroTax === '0') {
      // 2a. 應稅 + 正常 (INV_NoneTax = '0')
      // 總銷售金額 saleAmt 僅包含應稅金額 saleTax (因為 saleNoTax 已被重置為 0)
      TXN_Tax = Math.round(saleAmt / 21);
      TXN_Net = saleAmt - TXN_Tax;
    } else if (zeroTax === '1') {
      // 2b. 應稅 + 零稅 (INV_NoneTax = '1')
      // 總銷售金額 saleAmt 僅包含應稅金額 saleTax (因為 saleNoTax 已被重置為 0)
      TXN_Net = saleAmt;
      TXN_Tax = 0;
    } else {
      // 處理意外的 zeroTax 值
      TXN_Net = saleAmt;
      TXN_Tax = 0;
    }
  } else {
    // 3. 處理意外的 taxType 值
    TXN_Net = saleAmt;
    TXN_Tax = 0;
  }

  // 返回計算後的結果，同時將重置後的 saleTax 和 saleNoTax 一併返回
  return {
    TXN_SaleAmt: saleAmt,
    TXN_Net,
    TXN_Tax,
    TXN_SaleTax: saleTax,     // ⭐️ 返回重置後的值
    TXN_SaleNoTax: saleNoTax, // ⭐️ 返回重置後的值
  };
}

/** 金額四捨五入至小數 2 位，避免浮點數相減產生 0.1 + 0.2 類誤差 */
export function roundAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

/* =====================================
   零稅必填檢核
   ===================================== */
export function validateBusTaxExmpCardRequired(value: unknown, row: Record<string, unknown>, data?: Record<string, unknown>[], field?: string, header = '免徵營業稅證明卡卡號'): { isValid: boolean; errorMessage: string[] } {
  const invNoneTax = String(row?.['INV_NoneTax'] ?? '');
  // 當零稅註記 = '1' → 必填
  if (invNoneTax === '1') {
    const isEmpty = value === null || value === undefined || String(value).trim() === '';
    if (isEmpty) { return { isValid: false, errorMessage: [`${header}為必填欄位`] }; }
  }
  return { isValid: true, errorMessage: [] };
}

export function validateUniformNumber(value: unknown, row: Record<string, unknown>, data?: Record<string, unknown>[], field?: string, header = '統一編號'): { isValid: boolean; errorMessage: string[] } {
  // 允許空值（非必填）
  if (value === null || value === undefined || String(value).trim() === '') {
    return { isValid: true, errorMessage: [] };
  }
  if (!/^\d{8}$/.test(String(value))) {
    return { isValid: false, errorMessage: [`須為8碼半形阿拉伯數字`] };
  }
  return { isValid: true, errorMessage: [] };
}

// ===== 來源發票欄位定義 =====
/** 新增模式用的來源發票欄位（用於 table-edit） */
export const COLUMNS_NATURAL_EDIT: Column[] = [
  { field: 'TXN_GUIBegNo', header: '發票號碼' },
  { field: 'TXN_Date', header: '交易日期', format: formatDate },
  { field: 'TXN_TotGUI', header: '發票金額', format: formatAmount, style: 'text-right' },
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易序號' },
  { field: 'TXN_Uniform', header: '統一編號' },
  { field: 'TXN_TotGUISaleTax', header: '應稅金額', format: formatAmount, style: 'text-right' },
  { field: 'TXN_TotGUISaleNoTax', header: '免稅金額', format: formatAmount, style: 'text-right' },
  { field: 'TXN_TotTax', header: '稅額', format: formatAmount, style: 'text-right' },
  { field: 'TXN_TaxType', header: '稅別', format: (v: any) => TXN_TAXTYPE_OPTIONS.find(o => o.value === String(v ?? ''))?.label ?? '未知' },
];

/** 查看模式用的來源發票欄位（用於 app-table） */
export const COLUMNS_NATURAL_VIEW: Column[] = [
  { field: 'CHG_No', header: '換開編號' },
  { field: 'GUI_InputDate', header: '換開日期', format: formatDate },
  { field: 'TXN_Date', header: '來源發票日期', format: formatDate },
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易序號' },
  { field: 'TXN_GUIBegNo', header: '來源發票號碼' },
  { field: 'TXN_TotGui', header: '來源發票發票金額', format: formatAmount },
  { field: 'GUI_Status', header: '換開狀態', format: (value: string | number) => GUI_STATUS_OPTIONS.find(o => o.value === String(value))?.label ?? String(value) },
  { field: 'GUI_CancelDate', header: '刪除日期', format: formatDate },
];

// ===== 換開發票欄位定義 =====
/** 新增模式用的換開發票欄位（用於 table-edit） */
export const COLUMNS_CHANGE_EDIT: EditColumn[] = [
  { field: 'PLU_TaxType', header: '稅別', type: 'dropdown', options: () => getSYS1000Options('PLU_TaxType'), calculate: (row) => calculateNetTax(row), optionLabel: 'label', optionValue: 'value', validate: [validateRequired] },
  { field: 'TXN_SaleTax', header: '應稅發票金額', type: 'inputNumber', calculate: (row) => calculateNetTax(row), disabled: (v: any, i?: number, row?: any) => String(row?.['PLU_TaxType']) === '0', minFractionDigits: 0, maxFractionDigits: 2, max: 999999999999, validate: [validateRequired, validateMaxNumber(999999999999)] },
  { field: 'TXN_SaleNoTax', header: '免稅發票金額', type: 'inputNumber', calculate: (row) => calculateNetTax(row), disabled: (v: any, i?: number, row?: any) => String(row?.['PLU_TaxType']) === '1', minFractionDigits: 0, maxFractionDigits: 2, max: 999999999999, validate: [validateRequired, validateMaxNumber(999999999999)] },
  { field: 'TXN_Net', header: '未稅發票金額', type: 'inputNumber', disabled: (v, i, row) => String(row?.['PLU_TaxType']) !== '1', minFractionDigits: 0, maxFractionDigits: 2, max: 999999999999, validate: [validateRequired, validateMaxNumber(999999999999)] },
  { field: 'TXN_Tax', header: '稅額', type: 'inputNumber', disabled: (v, i, row) => String(row?.['PLU_TaxType']) !== '1', minFractionDigits: 0, maxFractionDigits: 2, max: 999999999999, validate: [validateRequired, validateMaxNumber(999999999999)] },
  { field: 'TXN_SaleAmt', header: '銷售發票金額', type: 'inputNumber', disabled: () => true, max: 999999999999, validate: [validateMaxNumber(999999999999)] },
  { field: 'INV_CompanyName', header: '公司名稱', type: 'input', maxLength: 80, minWidth: '200px' },
  { field: 'TXN_Uniform', header: '統一編號', type: 'input', maxLength: 8 },
  { field: 'INV_NoneTax', header: '零稅註記', type: 'dropdown', options: INV_NONETAX_OPTIONS, calculate: (row) => calculateNetTax(row), optionLabel: 'label', optionValue: 'value', validate: [validateRequired] },
  { field: 'BusTaxExmpCard', header: '免徵營業稅證明卡卡號', type: 'input', minWidth: '200px', disabled: (v, i, row) => row['INV_NoneTax'] !== '1', validate: [validateBusTaxExmpCardRequired] },
  { field: 'TXN_Notes', header: '備註', type: 'input', maxLength: 100, minWidth: '200px' },
];

/** 查看模式用的換開發票欄位（用於 app-table） */
export const COLUMNS_CHANGE_VIEW: Column[] = [
  { field: 'TXN_Date', header: '發票日期', format: formatDate },
  { field: 'TXN_GUIPaper', header: '發票聯式', format: (v) => GUI_PAPER_OPTIONS.find(o => o.value === String(v))?.label ?? v },
  { field: 'TXN_GUINo', header: '發票號碼' },
  { field: 'PLU_TaxType', header: '稅別', format: (v) => getSYS1000('PLU_TaxType', v) },
  { field: 'TXN_SaleTax', header: '應稅發票金額', format: formatAmount },
  { field: 'TXN_SaleNoTax', header: '免稅發票金額', format: formatAmount },
  { field: 'TXN_Net', header: '未稅發票金額', disabled: () => true },
  { field: 'TXN_Tax', header: '稅額', disabled: () => true },
  { field: 'TXN_SaleAmt', header: '發票發票金額', format: formatAmount },
  { field: 'INV_CompanyName', header: '公司名稱' },
  { field: 'TXN_Uniform', header: '統一編號' },
  { field: 'INV_NoneTax', header: '零稅註記', format: (v) => INV_NONETAX_OPTIONS.find(o => o.value === String(v))?.label ?? v },
  { field: 'BusTaxExmpCard', header: '免徵營業稅證明卡卡號' },
  { field: 'GUI_DingType', header: '是否為丁種發票', format: (v) => GUI_DINGTYPE_OPTIONS.find(o => o.value === String(v))?.label ?? v },
  { field: 'TXN_GUIRemark', header: '電子發票隨機碼' },
  { field: 'TXN_Notes', header: '備註' },
];

/** 新增模式用的商品明細欄位（用於 table-edit） */
export const COLUMNS_DETAIL_EDIT: EditColumn[] = [
  { field: 'bus_type_name', header: '大分類名稱', type: 'dropdown', validate: [validateRequired] },
  { field: 'INV_ItemName', header: '項目名稱', type: 'dropdown', validate: [validateRequired] },
  { field: 'PLU_TaxType', header: '稅別', type: 'dropdown', options: () => getSYS1000Options('PLU_TaxType'), optionLabel: 'label', optionValue: 'value', validate: [validateRequired] },
  { field: 'INV_Qty', header: '數量', type: 'inputNumber', min: 1, minFractionDigits: 0, maxFractionDigits: 3, max: 999999999999, validate: [validateRequired, validateMaxNumber(999999999999)], defaultValueFunction: () => 1 },
  // 未稅/稅額：預設由換開發票稅額依銷售金額比例分攤，可手動調整，改其中一個自動回推另一個
  { field: 'INV_Net', header: '未稅金額', type: 'inputNumber', calculate: (row) => ({ INV_Tax: roundAmount((Number(row['INV_SaleAmt']) || 0) - (Number(row['INV_Net']) || 0)) }), minFractionDigits: 0, maxFractionDigits: 2, max: 999999999999, validate: [validateRequired, validateMaxNumber(999999999999)] },
  { field: 'INV_Tax', header: '稅額', type: 'inputNumber', calculate: (row) => ({ INV_Net: roundAmount((Number(row['INV_SaleAmt']) || 0) - (Number(row['INV_Tax']) || 0)) }), minFractionDigits: 0, maxFractionDigits: 2, max: 999999999999, validate: [validateRequired, validateMaxNumber(999999999999)] },
  { field: 'INV_SaleAmt', header: '銷售金額', type: 'inputNumber', minFractionDigits: 0, maxFractionDigits: 2, max: 999999999999, validate: [validateRequired, validateMaxNumber(999999999999)] },
];
/** 查看模式用的商品明細欄位（用於 app-table） */
export const COLUMNS_DETAIL_VIEW: Column[] = [
  { field: 'TXN_Item', header: '項次' },
  { field: 'INV_ItemName', header: '項目名稱' },
  { field: 'PLU_TaxType', header: '稅別', format: (v) => getSYS1000('PLU_TaxType', v) },
  { field: 'INV_Qty', header: '銷售數量' },
  { field: 'TXN_Net', header: '未稅金額', format: formatAmount },
  { field: 'TXN_Tax', header: '稅額', format: formatAmount },
  { field: 'TXN_SaleAmt', header: '銷售金額', format: formatAmount },
];

// ===== 介面定義 =====

/** TLS2J030 資料介面 */
export interface TLS2J030Data {
  _TABLE_KEY?: string;
  status?: string;
  _isAutoInsertCandidate?: boolean;
  _validationErrors?: Record<string, string>;
  _rowValidationError?: { isValid: boolean; errorMessage: string };
  CHG_No?: string;
  GUI_Status?: string;
  changeEcrNo?: string; // 目前使用的換開收銀機號
  // 換開發票欄位
  TXN_Date?: string;
  ECR_No?: string;
  TXN_No?: number;
  TXN_GUIPaper?: string;
  TXN_GUINo?: string;
  PLU_TaxType?: string;
  TXN_SaleTax?: number;
  TXN_SaleNoTax?: number;
  TXN_Net?: number;
  TXN_Tax?: number;
  TXN_SaleAmt?: number;
  TXN_Uniform?: string;
  INV_NoneTax?: string;
  INV_CompanyName?: string;
  BusTaxExmpCard?: string;
  GUI_DingType?: string;
  TXN_GUIRemark?: string;
  TXN_Notes?: string;
  // 商品明細
  ID?: number;           // 後端回傳的資料庫 ID
  TXN_Item?: number;     // 項次
  INV_ItemName?: string;
  INV_Qty?: number;
  INV_SaleAmt?: number;  // 編輯時使用 (注：TXN_SaleAmt 已在換開發票欄位中定義，用於後端回傳/查看時使用)
  INV_Net?: number;      // 明細未稅金額 (編輯時使用，送出對應 POS21011.TXN_Net)
  INV_Tax?: number;      // 明細稅額 (編輯時使用，送出對應 POS21011.TXN_Tax)
  isInvoiceClose?: string; // 是否已關帳 (Y/N)
  ORG_TXN_Date?: string;    // 來源發票日期(多筆以逗號區隔，前端依此換行顯示)
}
export interface TLS2J030Source {
  /** 發票號碼起 */
  TXN_GUIBegNo: string;
  /** 發票號碼迄(不用顯示，但新增要回傳) */
  TXN_GUIEndNo: string;
  /** 交易日期 */
  TXN_Date: string;
  /** 發票金額 */
  TXN_TotGUI: number;
  /** 收銀機號 */
  ECR_No: string;
  /** 交易序號 */
  TXN_No: number;
  /** 統一編號 */
  TXN_Uniform: string | null;
  /** 應稅金額 */
  TXN_TotGUISaleTax: number;
  /** 免稅金額 */
  TXN_TotGUISaleNoTax: number;
  /** 稅額 */
  TXN_TotTax: number;
  /** 稅別 */
  TXN_TaxType: string | null;
  /** 稅別(名稱) */
  TXN_TaxType_Name: string | null;
  /** 應稅金額(不用顯示，但新增要回傳) */
  TXN_TotSaleTax: number;
  /** 免稅金額(不用顯示，但新增要回傳) */
  TXN_TotSaleNoTax: number;
}
