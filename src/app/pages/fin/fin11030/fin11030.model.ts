import { Column, formatDateTime, formatYYYYMM } from "../../../shared/componentkit/table/table.model";

export interface APS2001Data {
  id: number;
  SAL_GUIYYYYMM: string; // 發票年月
  SAL_GUIBegMM: string; // 起始月份
  SAL_GUIEndMM: string; // 終止月份
  SAL_GUITrack: string; // 字軌
  SAL_GUIBegNo: string; // 發票起號
  SAL_GUIEndNo: string; // 發票迄號
  SAL_GUIPaper: string; // 發票聯式
  SAL_LastUsedGUINo?: string; // 已使用的發票號 (可為空)
  SAL_VoidGUICnt?: number; // 作廢發票張數 (可為空)
  SAL_BlankCnt?: number; // 發票張數 (可為空)
  SAL_SAmt?: number; // 應稅金額 (可為空)
  SAL_TaxAmt?: number; // 稅額 (可為空)
  SAL_NoTaxAmt?: number; // 免稅金額 (可為空)
  SAL_ZeroTaxAmt?: number; // 零稅金額 (可為空)
  STR_Uniform?: string; // 統一編號 (可為空)
  STO_No?: string; // 分店編號 (可為空)
  SAL_Type?: string; // 發票用途 (可為空)
  GUI_DingType?: string; // 是否為丁種發票 (可為空)
  CRT_Date?: Date; // 建立日期 (可為空)
  CRT_USR_No?: string; // 建立人員 (可為空)
  CRT_USR_Name?: string; // 建立人員姓名 (可為空)
  UPD_Date?: Date; // 變更日期 (可為空)
  UPD_USR_No?: string; // 變更人員 (可為空)
  UPD_USR_Name?: string; // 變更人員姓名 (可為空)
}

// SAL_GUIPaper 的選項
export const SAL_GUIPaperOptions = [
  { label: '二聯式手開發票', value: '32' },
  { label: '三聯式手開發票', value: '31' },
  { label: '電子發票', value: '35' },
];

export const columns: Column[] = [
  { field: 'id', header: '序號', visible: true },
  { field: 'SAL_GUIYYYYMM', header: '發票年月', visible: true, format: formatYYYYMM },
  { field: 'SAL_GUITrack', header: '字軌', visible: true },
  { field: 'SAL_GUIBegNo', header: '發票號碼(起)', visible: true },
  { field: 'SAL_GUIEndNo', header: '發票號碼(迄)', visible: true },
  {
    field: 'SAL_Type', header: '發票類別', visible: true,
    format: (value: string) => SAL_GUIPaperOptions.find(x => x.value === value)?.label || value
  },
  { field: 'GUI_DingType', header: '是否為丁種發票', visible: true, format: (value: string) => value === 'Y' ? '是' : '否' },
  { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime },
  { field: 'CRT_USR_Name', header: '建立人員', visible: true },
  { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDateTime },
  { field: 'UPD_USR_Name', header: '變更人員', visible: true },
];
