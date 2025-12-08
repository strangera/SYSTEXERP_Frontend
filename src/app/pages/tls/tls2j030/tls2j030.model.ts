import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { Column, formatAmount, formatDate } from '@shared/componentkit/table/table.model';

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
  const item = GUI_STATUS_OPTIONS.find(o => o.value === String(value));
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

// 格式化函數
export function formatGUIPaper(v: any) { return GUI_PAPER_OPTIONS.find(o => o.value === String(v))?.label ?? v; }
export function formatPLUTaxType(v: any) { return PLU_TAXTYPE_OPTIONS.find(o => o.value === String(v))?.label ?? v; }
export function formatINVNoneTax(v: any) { return INV_NONETAX_OPTIONS.find(o => o.value === String(v))?.label ?? v; }
export function formatGUIDingType(v: any) { return GUI_DINGTYPE_OPTIONS.find(o => o.value === String(v))?.label ?? v; }

/* =====================================
   核心修正：統一稅額＋未稅金額計算
   ===================================== */

/**
 * FIX：
 * 補正一致邏輯，統一所有計算方式
 */
function calculateNetTax(row: Record<string, unknown>) {
  const taxType = String(row['PLU_TaxType'] ?? '');
  const zeroTax = String(row['INV_NoneTax'] ?? '0');

  const saleTax = parseFloat(String(row['TXN_SaleTax'] ?? 0)) || 0;
  const saleNoTax = parseFloat(String(row['TXN_SaleNoTax'] ?? 0)) || 0;
  const saleAmt = saleTax + saleNoTax;

  let TXN_Net = 0;
  let TXN_Tax = 0;

  if (taxType === '0') {
    // 免稅
    TXN_Net = saleNoTax;
    TXN_Tax = 0;
  } else {
    // 應稅
    if (zeroTax === '1') {
      // 應稅 + 零稅
      TXN_Tax = Math.round(saleAmt / 21);
      TXN_Net = saleAmt - TXN_Tax;
    } else {
      // 應稅 + 正常
      TXN_Net = saleAmt;
      TXN_Tax = 0;
    }
  }

  return { TXN_SaleAmt: saleAmt, TXN_Net, TXN_Tax };
}

/**
 * 原邏輯保留，但強制統一稅額邏輯 (FIX)
 */
export function calculateSaleAmt(row: Record<string, unknown>): Record<string, unknown> {
  return calculateNetTax(row);
}

/**
 * 稅別變更邏輯：保留原流程，但改用一致邏輯 (FIX)
 */
export function calculateTaxType(row: Record<string, unknown>): Record<string, unknown> {
  return calculateNetTax(row);
}

/**
 * 未稅 + 稅額邏輯：保留原功能，但統一 (FIX)
 */
export function calculateNetAndTax(row: Record<string, unknown>): Record<string, unknown> {
  return calculateNetTax(row);
}

/* =====================================
   欄位是否禁用
   ===================================== */

export const isSaleTaxDisabled = (v: any, i?: number, row?: any) =>
  String(row?.['PLU_TaxType']) === '0';

export const isSaleNoTaxDisabled = (v: any, i?: number, row?: any) =>
  String(row?.['PLU_TaxType']) === '1';

export const isNetAmountDisabled = (v: any, i?: number, row?: any) =>
  String(row?.['PLU_TaxType']) === '0';

export const isTaxAmountDisabled = (v: any, i?: number, row?: any) =>
  String(row?.['PLU_TaxType']) === '0';


/* =====================================
   零稅必填檢核
   ===================================== */
export function validateBusTaxExmpCardRequired(
  value: unknown,
  row: Record<string, unknown>,
  data?: Record<string, unknown>[],
  field?: string,
  header = '免徵營業稅證明卡卡號'
): { isValid: boolean; errorMessage: string[] } {
  const invNoneTax = String(row?.['INV_NoneTax'] ?? '');

  // 當零稅註記 = '1' → 必填
  if (invNoneTax === '1') {
    const isEmpty =
      value === null ||
      value === undefined ||
      String(value).trim() === '';

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
  { field: 'TXN_TaxType', header: '稅別' },
];


/** 查看模式用的來源發票欄位（用於 app-table） */
export const COLUMNS_NATURAL_VIEW: Column[] = [
  { field: 'CHG_No', header: '換開編號', visible: true },
  { field: 'GUI_InputDate', header: '換開日期', visible: true, format: formatDate },
  { field: 'TXN_Date', header: '來源發票日期', visible: true, format: formatDate },
  { field: 'ECR_No', header: '收銀機號', visible: true },
  { field: 'TXN_No', header: '交易序號', visible: true },
  { field: 'TXN_GUIBegNo', header: '來源發票號碼', visible: true },
  { field: 'TXN_TotGui', header: '來源發票發票金額', visible: true, format: formatAmount },
  { field: 'GUI_Status', header: '換開狀態', visible: true, format: formatGUIStatus },
  { field: 'GUI_CancelDate', header: '刪除日期', visible: true, format: formatDate },
];

// ===== 換開發票欄位定義 =====

/** 新增模式用的換開發票欄位（用於 table-edit） */
export const COLUMNS_CHANGE_EDIT: EditColumn[] = [
  {
    field: 'TXN_Date',
    header: '發票日期',
    type: 'date',
    validate: [validateRequired],
    width: '150px',
  },
  { field: 'TXN_GUIPaper', header: '發票聯式', type: 'dropdown', options: GUI_PAPER_OPTIONS, optionLabel: 'label', optionValue: 'value', validate: [validateRequired] },
  // { field: 'TXN_GUINo', header: '發票號碼', validate: [validateRequired] },
  { field: 'PLU_TaxType', header: '稅別', type: 'dropdown', options: PLU_TAXTYPE_OPTIONS, calculate: (row) => calculateTaxType(row), optionLabel: 'label', optionValue: 'value', validate: [validateRequired] },
  { field: 'TXN_SaleTax', header: '應稅發票金額', type: 'inputNumber', calculate: (row) => calculateSaleAmt(row), disabled: isSaleTaxDisabled, minFractionDigits: 0, maxFractionDigits: 2, validate: [validateRequired] },
  { field: 'TXN_SaleNoTax', header: '免稅發票金額', type: 'inputNumber', calculate: (row) => calculateSaleAmt(row), disabled: isSaleNoTaxDisabled, minFractionDigits: 0, maxFractionDigits: 2, validate: [validateRequired] },
  { field: 'TXN_Net', header: '未稅發票金額', type: 'inputNumber', calculate: (row) => calculateNetAndTax(row), disabled: isNetAmountDisabled, minFractionDigits: 0, maxFractionDigits: 2, validate: [validateRequired] },
  { field: 'TXN_Tax', header: '稅額', type: 'inputNumber', calculate: (row) => calculateNetAndTax(row), disabled: isTaxAmountDisabled, minFractionDigits: 0, maxFractionDigits: 2, validate: [validateRequired] },
  {
    field: 'TXN_SaleAmt',
    header: '銷售發票金額',
    type: 'inputNumber',
    calculate: (row) => calculateSaleAmt(row),
    disabled: () => true,
  },
  { field: 'TXN_Uniform', header: '統一編號', type: 'input', maxLength: 8 },
  { field: 'INV_NoneTax', header: '零稅註記', type: 'dropdown', options: INV_NONETAX_OPTIONS, calculate: (row) => calculateNetAndTax(row), optionLabel: 'label', optionValue: 'value', validate: [validateRequired] },
  { field: 'BusTaxExmpCard', header: '免徵營業稅證明卡卡號', type: 'input', validate: [validateBusTaxExmpCardRequired] },
  // { field: 'GUI_DingType', header: '是否為丁種發票', type: 'dropdown', options: GUI_DINGTYPE_OPTIONS, optionLabel: 'label', optionValue: 'value' },
  // { field: 'TXN_GUIRemark', header: '電子發票隨機碼', type: 'input', disabled: () => true },
  { field: 'TXN_Notes', header: '備註', type: 'input', maxLength: 100, },
];

/** 查看模式用的換開發票欄位（用於 app-table） */
export const COLUMNS_CHANGE_VIEW: Column[] = [
  { field: 'TXN_Date', header: '發票日期', visible: true, format: formatDate },
  { field: 'TXN_GUIPaper', header: '發票聯式', visible: true, format: formatGUIPaper },
  { field: 'TXN_GUINo', header: '發票號碼', visible: true },
  { field: 'PLU_TaxType', header: '稅別', visible: true, format: formatPLUTaxType },
  { field: 'TXN_SaleTax', header: '應稅發票金額', visible: true, format: formatAmount },
  { field: 'TXN_SaleNoTax', header: '免稅發票金額', visible: true, format: formatAmount },
  { field: 'TXN_Net', header: '未稅發票金額', visible: true, format: formatAmount },
  { field: 'TXN_Tax', header: '稅額', visible: true, format: formatAmount },
  { field: 'TXN_SaleAmt', header: '發票發票金額', visible: true, format: formatAmount },
  { field: 'TXN_Uniform', header: '統一編號', visible: true },
  { field: 'INV_NoneTax', header: '零稅註記', visible: true, format: formatINVNoneTax },
  { field: 'BusTaxExmpCard', header: '免徵營業稅證明卡卡號', visible: true },
  { field: 'GUI_DingType', header: '是否為丁種發票', visible: true, format: formatGUIDingType },
  { field: 'TXN_GUIRemark', header: '電子發票隨機碼', visible: true },
  { field: 'TXN_Notes', header: '備註', visible: true },
];

/** 新增模式用的商品明細欄位（用於 table-edit） */
export const COLUMNS_DETAIL_EDIT: EditColumn[] = [

  {
    field: 'bus_type_name',
    header: '大分類名稱',
    type: 'dropdown',
    width: '100%',
    validate: [validateRequired]
  },
  {
    field: 'INV_ItemName',
    header: '項目名稱',
    type: 'dropdown',
    width: '100%',
    validate: [validateRequired]
  },
  { field: 'INV_Qty', header: '數量', type: 'inputNumber', minFractionDigits: 0, maxFractionDigits: 3, validate: [validateRequired] },
  { field: 'INV_SaleAmt', header: '發票金額', type: 'inputNumber', minFractionDigits: 0, maxFractionDigits: 2, validate: [validateRequired] },
];
/** 查看模式用的商品明細欄位（用於 app-table） */
export const COLUMNS_DETAIL_VIEW: Column[] = [
  { field: 'TXN_Item', header: '項次', visible: true },
  { field: 'INV_ItemName', header: '項目名稱', visible: true },
  { field: 'INV_Qty', header: '銷售數量', visible: true },
  { field: 'TXN_SaleAmt', header: '銷售發票金額', visible: true, format: formatAmount },
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

  // 換開發票欄位
  TXN_Date?: string;
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
}
export interface TLS2J030Source {
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number | string;
  TXN_GUIBegNo: string;
  TXN_GUIEndNo: string;
  TXN_TotGUI: number;
  TXN_TaxType: string;
  TXN_TotSaleTax: number;
  TXN_TotSaleNoTax: number;
  TXN_TotTax: number;
}
