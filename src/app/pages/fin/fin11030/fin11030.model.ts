import { getSYS1000, getSYS1000Options } from "@service/system/sys1000.service";
import { transformOptionsForExport } from "@shared/componentextends/basic-print/basic-print-data.component";
import { ReportColumn } from "@shared/componentkit/table-report/table-report.model";
import { formatAmount, formatDateTime, formatYN, formatYYYYMM } from "../../../shared/componentkit/table/table.model";

export interface APS2001Data {
  id: number;
  SAL_GUIYYYYMM: string; // 發票年月
  SAL_GUIBegMM: string; // 起始月份
  SAL_GUIEndMM: string; // 終止月份
  SAL_GUITrack: string; // 字軌
  SAL_GUIBegNo: string; // 發票起始號碼
  SAL_GUIEndNo: string; // 發票結束號碼
  SAL_GUIPaper: string; // 發票類別
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

export const columns: ReportColumn[] = [
  // { field: 'id', header: '序號', visible: true },
  { field: 'SAL_GUIYYYYMM', header: '發票年月', visible: true, format: formatYYYYMM },
  { field: 'SAL_GUIBegMM', header: '起始月份', visible: false },
  { field: 'SAL_GUIEndMM', header: '終止月份', visible: false },
  { field: 'SAL_GUITrack', header: '字軌', visible: true },
  { field: 'SAL_GUIBegNo', header: '發票起始號碼', visible: true },
  { field: 'SAL_GUIEndNo', header: '發票結束號碼', visible: true },
  { field: 'SAL_GUIPaper', header: '發票類別', visible: true, format: (value: string) => getSYS1000('SAL_GUIPaper', value) },
  { field: 'SAL_LastUsedGUINo', header: '已使用的發票號', visible: false },
  { field: 'SAL_VoidGUICnt', header: '作廢發票張數', visible: false },
  { field: 'SAL_BlankCnt', header: '發票張數', visible: false },
  { field: 'SAL_SAmt', header: '應稅金額', visible: false, format: formatAmount },
  { field: 'SAL_TaxAmt', header: '稅額', visible: false, format: formatAmount },
  { field: 'SAL_NoTaxAmt', header: '免稅金額', visible: false, format: formatAmount },
  { field: 'SAL_ZeroTaxAmt', header: '零稅金額', visible: false, format: formatAmount },
  { field: 'STR_Uniform', header: '統一編號', visible: false },
  { field: 'STO_No', header: '分店編號', visible: false },
  // { field: 'SAL_Type', header: '發票類別', visible: false },
  { field: 'GUI_DingType', header: '是否為丁種發票', visible: true, format: formatYN, exportFormat: transformOptionsForExport(getSYS1000Options('YES_NO')) },
  { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
  { field: 'CRT_USR_No', header: '建立人員代碼', visible: false },
  { field: 'CRT_USR_Name', header: '建立人員', visible: false },
  { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
  { field: 'UPD_USR_No', header: '變更人員代碼', visible: false },
  { field: 'UPD_USR_Name', header: '變更人員', visible: false }
];

