import { Column } from '@shared/componentkit/table/table.model';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';

/**
 * TLS2J030 後台發票換開補登作業 - 欄位定義
 */

// ===== 來源發票欄位定義 =====

/** 新增模式用的來源發票欄位（用於 table-edit） */
export const COLUMNS_NATURAL_EDIT: EditColumn[] = [
  { field: 'TXN_DATE', header: '發票日期' },
  { field: 'TXN_GUIPAPER', header: '發票聯式' },
  { field: 'TXN_GUINO', header: '發票號碼' },
  { field: 'PLU_TAXTYPE', header: '稅別' },
  { field: 'TXN_SALETAX', header: '應稅金額' },
  { field: 'TXN_SALENOTAX', header: '免稅金額' },
  { field: 'TXN_NET', header: '未稅金額' },
  { field: 'TXN_TAX', header: '稅額' },
  { field: 'TXN_SaleAmt', header: '發票金額' },
  { field: 'TXN_UNIFORM', header: '統一編號' },
  { field: 'INV_NoneTax', header: '零稅註記' },
  { field: 'TXN_GUIRemark', header: '免徵營業稅證明卡卡號' },
  { field: 'GUI_DingType', header: '是否為丁種發票' },
  { field: 'TXN_GUIRemark', header: '電子發票隨機碼' },
  { field: 'txn_notes', header: '備註' },
];

/** 查看模式用的來源發票欄位（用於 app-table） */
export const COLUMNS_NATURAL_VIEW: Column[] = [
  { field: 'TXN_DATE', header: '發票日期', visible: true },
  { field: 'TXN_GUIPAPER', header: '發票聯式', visible: true },
  { field: 'TXN_GUINO', header: '發票號碼', visible: true },
  { field: 'PLU_TAXTYPE', header: '稅別', visible: true },
  { field: 'TXN_SALETAX', header: '應稅金額', visible: true },
  { field: 'TXN_SALENOTAX', header: '免稅金額', visible: true },
  { field: 'TXN_NET', header: '未稅金額', visible: true },
  { field: 'TXN_TAX', header: '稅額', visible: true },
  { field: 'TXN_SaleAmt', header: '發票金額', visible: true },
  { field: 'TXN_UNIFORM', header: '統一編號', visible: true },
  { field: 'INV_NoneTax', header: '零稅註記', visible: true },
  { field: 'TXN_GUIRemark', header: '免徵營業稅證明卡卡號', visible: true },
  { field: 'GUI_DingType', header: '是否為丁種發票', visible: true },
  { field: 'TXN_GUIRemark', header: '電子發票隨機碼', visible: true },
  { field: 'txn_notes', header: '備註', visible: true },
];

// ===== 換開發票欄位定義 =====

/** 新增模式用的換開發票欄位（用於 table-edit） */
export const COLUMNS_CHANGE_EDIT: EditColumn[] = [
  { field: 'TXN_DATE', header: '發票日期' },
  { field: 'TXN_GUIPAPER', header: '發票聯式' },
  { field: 'TXN_GUINO', header: '發票號碼' },
  { field: 'PLU_TAXTYPE', header: '稅別' },
  { field: 'TXN_SALETAX', header: '應稅金額' },
  { field: 'TXN_SALENOTAX', header: '免稅金額' },
  { field: 'TXN_NET', header: '未稅金額' },
  { field: 'TXN_TAX', header: '稅額' },
  { field: 'TXN_SaleAmt', header: '發票金額' },
  { field: 'TXN_UNIFORM', header: '統一編號' },
  { field: 'INV_NoneTax', header: '零稅註記' },
  { field: 'TXN_GUIRemark', header: '免徵營業稅證明卡卡號' },
  { field: 'GUI_DingType', header: '是否為丁種發票' },
  { field: 'TXN_GUIRemark', header: '電子發票隨機碼' },
  { field: 'txn_notes', header: '備註' },
];

/** 查看模式用的換開發票欄位（用於 app-table） */
export const COLUMNS_CHANGE_VIEW: Column[] = [
  { field: 'TXN_DATE', header: '發票日期', visible: true },
  { field: 'TXN_GUIPAPER', header: '發票聯式', visible: true },
  { field: 'TXN_GUINO', header: '發票號碼', visible: true },
  { field: 'PLU_TAXTYPE', header: '稅別', visible: true },
  { field: 'TXN_SALETAX', header: '應稅金額', visible: true },
  { field: 'TXN_SALENOTAX', header: '免稅金額', visible: true },
  { field: 'TXN_NET', header: '未稅金額', visible: true },
  { field: 'TXN_TAX', header: '稅額', visible: true },
  { field: 'TXN_SaleAmt', header: '發票金額', visible: true },
  { field: 'TXN_UNIFORM', header: '統一編號', visible: true },
  { field: 'INV_NoneTax', header: '零稅註記', visible: true },
  { field: 'TXN_GUIRemark', header: '免徵營業稅證明卡卡號', visible: true },
  { field: 'GUI_DingType', header: '是否為丁種發票', visible: true },
  { field: 'TXN_GUIRemark', header: '電子發票隨機碼', visible: true },
  { field: 'txn_notes', header: '備註', visible: true },
];

// ===== 商品明細欄位定義 =====

/** 新增模式用的商品明細欄位（用於 table-edit） */
export const COLUMNS_DETAIL_EDIT: EditColumn[] = [
  { field: 'txn_item', header: '項次' },
  { field: 'txn_itemname', header: '項目名稱' },
  { field: 'inv_qty', header: '數量' },
  { field: 'txn_saleamt', header: '金額' },
];

/** 查看模式用的商品明細欄位（用於 app-table） */
export const COLUMNS_DETAIL_VIEW: Column[] = [
  { field: 'txn_item', header: '項次', visible: true },
  { field: 'txn_itemname', header: '項目名稱', visible: true },
  { field: 'inv_qty', header: '數量', visible: true },
  { field: 'txn_saleamt', header: '金額', visible: true },
];

// ===== 介面定義 =====

/** TLS2J030 資料介面 */
export interface TLS2J030Data {
  // 發票基本資訊
  TXN_DATE?: string;
  TXN_GUIPAPER?: string;
  TXN_GUINO?: string;
  PLU_TAXTYPE?: string;
  TXN_SALETAX?: number;
  TXN_SALENOTAX?: number;
  TXN_NET?: number;
  TXN_TAX?: number;
  TXN_SaleAmt?: number;
  TXN_UNIFORM?: string;
  INV_NoneTax?: string;
  TXN_GUIRemark?: string;
  GUI_DingType?: string;
  txn_notes?: string;

  // 商品明細
  txn_item?: number;
  txn_itemname?: string;
  inv_qty?: number;
  txn_saleamt?: number;
}
