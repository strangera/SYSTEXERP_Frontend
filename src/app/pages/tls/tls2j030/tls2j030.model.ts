import { Column, formatAmount, formatDateToYYYY_MM_DD } from '@shared/componentkit/table/table.model';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
/**
 * TLS2J030 後台發票換開補登作業 - 欄位定義
 */

// 換開狀態選項
export const GUI_STATUS_OPTIONS = [
  { label: '正常', value: '0' },
  { label: '刪除', value: '1' }
];

// 換開狀態格式化函數
export function formatGUIStatus(value: string | number): string {
  const stringValue = String(value);
  const item = GUI_STATUS_OPTIONS.find(o => o.value === stringValue);
  return item?.label ?? String(value);
}

// 發票聯式選項
export const GUI_PAPER_OPTIONS = [
  { label: '二聯式', value: '2' },
  { label: '三聯式', value: '3' },
  { label: '電子發票', value: 'E' }
];

export const PLU_TAXTYPE_OPTIONS = [
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

// 發票聯式格式化函數
export function formatGUIPaper(value: string | number): string {
  const stringValue = String(value);
  const item = GUI_PAPER_OPTIONS.find(o => o.value === stringValue);
  return item?.label ?? String(value);
}

// 稅別格式化函數
export function formatPLUTaxType(value: string | number): string {
  const stringValue = String(value);
  const item = PLU_TAXTYPE_OPTIONS.find(o => o.value === stringValue);
  return item?.label ?? String(value);
}

// 零稅註記格式化函數
export function formatINVNoneTax(value: string | number): string {
  const stringValue = String(value);
  const item = INV_NONETAX_OPTIONS.find(o => o.value === stringValue);
  return item?.label ?? String(value);
}

// 丁種發票格式化函數
export function formatGUIDingType(value: string | number): string {
  const stringValue = String(value);
  const item = GUI_DINGTYPE_OPTIONS.find(o => o.value === stringValue);
  return item?.label ?? String(value);
}

/**
 * 計算發票金額 (TXN_SaleAmt = TXN_SALETAX + TXN_SALENOTAX)
 * @param rowData 當前行資料
 * @returns 更新後的資料物件
 */
export function calculateSaleAmt(rowData: Record<string, unknown>): Record<string, unknown> {
  const saleTax = parseFloat(String(rowData['TXN_SALETAX'] || '0')) || 0;
  const saleNoTax = parseFloat(String(rowData['TXN_SALENOTAX'] || '0')) || 0;
  const saleAmt = saleTax + saleNoTax;

  return {
    TXN_SaleAmt: saleAmt
  };
}

/**
 * 稅別變更時的計算邏輯
 * 當稅別 = 0 (免稅) 時：應稅金額 = 0，只有免稅金額有數字
 * 當稅別 = 1 (應稅) 時：免稅金額 = 0，只有應稅金額有數字
 * @param rowData 當前行資料
 * @returns 更新後的資料物件
 */
export function calculateTaxType(rowData: Record<string, unknown>): Record<string, unknown> {
  const taxType = String(rowData['PLU_TAXTYPE'] || '');

  if (taxType === '0') {
    // 免稅時：應稅金額 = 0，未稅金額 = 0，稅額 = 0，發票金額 = 免稅金額
    const saleNoTax = parseFloat(String(rowData['TXN_SALENOTAX'] || '0')) || 0;
    return {
      TXN_SALETAX: 0,
      TXN_NET: 0,
      TXN_TAX: 0,
      TXN_SaleAmt: saleNoTax
    };
  } else if (taxType === '1') {
    // 應稅時：免稅金額 = 0，發票金額 = 應稅金額
    const saleTax = parseFloat(String(rowData['TXN_SALETAX'] || '0')) || 0;
    return {
      TXN_SALENOTAX: 0,
      TXN_SaleAmt: saleTax
    };
  }

  // 其他情況保持原有邏輯
  return calculateSaleAmt(rowData);
}

/**
 * 判斷應稅金額欄位是否應被禁用
 * 當稅別 = 0 (免稅) 時禁用
 */
export function isSaleTaxDisabled(value: unknown, index?: number, rowData?: Record<string, unknown>): boolean {
  const taxType = String(rowData?.['PLU_TAXTYPE'] || '');
  return taxType === '0'; // 免稅時禁用應稅金額
}

/**
 * 判斷免稅金額欄位是否應被禁用
 * 當稅別 = 1 (應稅) 時禁用
 */
export function isSaleNoTaxDisabled(value: unknown, index?: number, rowData?: Record<string, unknown>): boolean {
  const taxType = String(rowData?.['PLU_TAXTYPE'] || '');
  return taxType === '1'; // 應稅時禁用免稅金額
}

/**
 * 判斷未稅金額欄位是否應被禁用
 * 當稅別 = 0 (免稅) 時禁用
 */
export function isNetAmountDisabled(value: unknown, index?: number, rowData?: Record<string, unknown>): boolean {
  const taxType = String(rowData?.['PLU_TAXTYPE'] || '');
  return taxType === '0'; // 免稅時禁用未稅金額
}

/**
 * 判斷稅額欄位是否應被禁用
 * 當稅別 = 0 (免稅) 時禁用
 */
export function isTaxAmountDisabled(value: unknown, index?: number, rowData?: Record<string, unknown>): boolean {
  const taxType = String(rowData?.['PLU_TAXTYPE'] || '');
  return taxType === '0'; // 免稅時禁用稅額
}

/**
 * 條件必填驗證：當零稅註記='1'時，免徵營業稅證明卡卡號為必填
 */
export function validateBusTaxExmpCardRequired(
  value: unknown,
  rowData: Record<string, unknown>,
  data: Record<string, unknown>[],
  field: string,
  header: string
): { isValid: boolean, errorMessage: string[] } {
  const invNoneTax = String(rowData?.['INV_NoneTax'] || '');

  // 當零稅註記='1'時，此欄位為必填
  if (invNoneTax === '1') {
    const isEmpty = value === null || value === undefined || String(value).trim() === '';
    if (isEmpty) {
      return {
        isValid: false,
        errorMessage: [`${header}為必填欄位`]
      };
    }
  }

  return {
    isValid: true,
    errorMessage: []
  };
}

// ===== 來源發票欄位定義 =====

/** 新增模式用的來源發票欄位（用於 table-edit） */
export const COLUMNS_NATURAL_EDIT: EditColumn[] = [
  { field: 'TXN_GUIBegNo', header: '發票號碼起' },
  { field: 'TXN_GUIEndNo', header: '發票號碼迄', disabled: () => true },
  { field: 'TXN_Date', header: '交易日期' },
  { field: 'TXN_TotGUI', header: '發票金額' },
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'TXN_No', header: '交易序號' },
  { field: 'TXN_Uniform', header: '統一編號' },
  { field: 'TXN_TotGUISaleTax', header: '應稅金額' },
  { field: 'TXN_TotGUISaleNoTax', header: '免稅金額' },
  { field: 'TXN_TotTax', header: '稅額' },
  { field: 'TXN_TaxType', header: '稅別' },
  { field: 'TXN_TaxType_Name', header: '稅別(名稱)' },
  { field: 'TXN_TotSaleTax', header: '應稅金額', disabled: () => true },
  { field: 'TXN_TotSaleNoTax', header: '免稅金額', disabled: () => true },
];

/** 查看模式用的來源發票欄位（用於 app-table） */
export const COLUMNS_NATURAL_VIEW: Column[] = [
  { field: 'CHG_No', header: '換開編號', visible: true },
  { field: 'GUI_InputDate', header: '換開日期', visible: true, format: formatDateToYYYY_MM_DD },
  { field: 'TXN_Date', header: '來源發票日期', visible: true, format: formatDateToYYYY_MM_DD },
  { field: 'ECR_No', header: '收銀機號', visible: true },
  { field: 'TXN_No', header: '交易序號', visible: true },
  { field: 'TXN_GUIBegNo', header: '來源發票號碼', visible: true },
  { field: 'TXN_TotGui', header: '來源發票金額', visible: true, format: formatAmount },
  { field: 'GUI_Status', header: '換開狀態', visible: true, format: formatGUIStatus },
  { field: 'GUI_CancelDate', header: '刪除日期', visible: true, format: formatDateToYYYY_MM_DD },
];

// ===== 換開發票欄位定義 =====

/** 新增模式用的換開發票欄位（用於 table-edit） */
export const COLUMNS_CHANGE_EDIT: EditColumn[] = [
  { field: 'TXN_Date', header: '發票日期', type: 'date', width: '150px', validate: [validateRequired] },
  { field: 'TXN_GUIPaper', header: '發票聯式', type: 'dropdown', options: GUI_PAPER_OPTIONS, optionLabel: 'label', optionValue: 'value', validate: [validateRequired] },
  { field: 'TXN_GUINo', header: '發票號碼', validate: [validateRequired] },
  { field: 'PLU_TaxType', header: '稅別', type: 'dropdown', options: PLU_TAXTYPE_OPTIONS, calculate: (rowData) => calculateTaxType(rowData), optionLabel: 'label', optionValue: 'value', validate: [validateRequired] },
  { field: 'TXN_SaleTax', header: '應稅金額', type: 'inputNumber', calculate: (rowData) => calculateSaleAmt(rowData), disabled: isSaleTaxDisabled, minFractionDigits: 0, maxFractionDigits: 2, validate: [validateRequired] },
  { field: 'TXN_SaleNoTax', header: '免稅金額', type: 'inputNumber', calculate: (rowData) => calculateSaleAmt(rowData), disabled: isSaleNoTaxDisabled, minFractionDigits: 0, maxFractionDigits: 2, validate: [validateRequired] },
  { field: 'TXN_Net', header: '未稅金額', type: 'inputNumber', disabled: isNetAmountDisabled, minFractionDigits: 0, maxFractionDigits: 2, validate: [validateRequired] },
  { field: 'TXN_Tax', header: '稅額', type: 'inputNumber', disabled: isTaxAmountDisabled, minFractionDigits: 0, maxFractionDigits: 2, validate: [validateRequired] },
  { field: 'TXN_SaleAmt', header: '銷售金額', type: 'inputNumber', disabled: () => true, minFractionDigits: 0, maxFractionDigits: 2, validate: [validateRequired] },
  { field: 'TXN_Uniform', header: '統一編號', type: 'input', maxLength: 8 },
  { field: 'INV_NoneTax', header: '零稅註記', type: 'dropdown', options: INV_NONETAX_OPTIONS, optionLabel: 'label', optionValue: 'value', validate: [validateRequired] },
  { field: 'BusTaxExmpCard', header: '免徵營業稅證明卡卡號', type: 'input', validate: [validateBusTaxExmpCardRequired] },
  { field: 'GUI_DingType', header: '是否為丁種發票', type: 'dropdown', options: GUI_DINGTYPE_OPTIONS, optionLabel: 'label', optionValue: 'value' },
  { field: 'TXN_GUIRemark', header: '電子發票隨機碼', type: 'input', disabled: () => true },
  { field: 'TXN_Notes', header: '備註', type: 'input', maxLength: 100, },
];

/** 查看模式用的換開發票欄位（用於 app-table） */
export const COLUMNS_CHANGE_VIEW: Column[] = [
  { field: 'TXN_Date', header: '發票日期', visible: true, format: formatDateToYYYY_MM_DD },
  { field: 'TXN_GUIPaper', header: '發票聯式', visible: true, format: formatGUIPaper },
  { field: 'TXN_GUINo', header: '發票號碼', visible: true },
  { field: 'PLU_TaxType', header: '稅別', visible: true, format: formatPLUTaxType },
  { field: 'TXN_SaleTax', header: '應稅金額', visible: true, format: formatAmount },
  { field: 'TXN_SaleNoTax', header: '免稅金額', visible: true, format: formatAmount },
  { field: 'TXN_Net', header: '未稅金額', visible: true, format: formatAmount },
  { field: 'TXN_Tax', header: '稅額', visible: true, format: formatAmount },
  { field: 'TXN_SaleAmt', header: '發票金額', visible: true, format: formatAmount },
  { field: 'TXN_Uniform', header: '統一編號', visible: true },
  { field: 'INV_NoneTax', header: '零稅註記', visible: true, format: formatINVNoneTax },
  { field: 'BusTaxExmpCard', header: '免徵營業稅證明卡卡號', visible: true },
  { field: 'GUI_DingType', header: '是否為丁種發票', visible: true, format: formatGUIDingType },
  { field: 'TXN_GUIRemark', header: '電子發票隨機碼', visible: true },
  { field: 'TXN_Notes', header: '備註', visible: true },
];

/** 新增模式用的商品明細欄位（用於 table-edit） */
export const COLUMNS_DETAIL_EDIT: EditColumn[] = [
  // { field: 'txn_item', header: '項次', type: 'inputNumber', maxLength: 6, validate: [validateRequired] },
  { field: 'INV_ItemName', header: '項目名稱', type: 'input', maxLength: 50, validate: [validateRequired] },
  { field: 'INV_Qty', header: '數量', type: 'inputNumber', minFractionDigits: 0, maxFractionDigits: 3, validate: [validateRequired] },
  { field: 'TXN_SaleAmt', header: '金額', type: 'inputNumber', minFractionDigits: 0, maxFractionDigits: 2, validate: [validateRequired] },
];

/** 查看模式用的商品明細欄位（用於 app-table） */
export const COLUMNS_DETAIL_VIEW: Column[] = [
  // { field: 'TXN_Item', header: '項次', visible: true },
  { field: 'INV_ItemName', header: '項目名稱', visible: true },
  { field: 'INV_Qty', header: '銷售數量', visible: true },
  { field: 'TXN_SaleAmt', header: '銷售金額', visible: true, format: formatAmount },
];

// ===== 介面定義 =====

/** TLS2J030 資料介面 */
export interface TLS2J030Data {
  CHG_No?: string;

  // 換開發票欄位（對應 COLUMNS_CHANGE_EDIT）
  TXN_Date?: string;           // 發票日期
  TXN_GUIPaper?: string;       // 發票聯式
  TXN_GUINo?: string;          // 發票號碼
  PLU_TaxType?: string;        // 稅別
  TXN_SaleTax?: number;        // 應稅金額
  TXN_SaleNoTax?: number;      // 免稅金額
  TXN_Net?: number;            // 未稅金額
  TXN_Tax?: number;            // 稅額
  TXN_SaleAmt?: number;        // 銷售金額
  TXN_Uniform?: string;        // 統一編號
  INV_NoneTax?: string;        // 零稅註記
  BusTaxExmpCard?: string;     // 免徵營業稅證明卡卡號
  GUI_DingType?: string;       // 是否為丁種發票
  TXN_GUIRemark?: string;      // 電子發票隨機碼
  TXN_Notes?: string;          // 備註

  // 商品明細欄位（對應 COLUMNS_DETAIL_EDIT）
  txn_item?: number;           // 項次
  INV_ItemName?: string;       // 項目名稱
  INV_Qty?: number;            // 數量
  // TXN_SaleAmt 已在上面定義，這裡是商品的金額
}

