import { Column, formatDateTime, formatYYYYMM } from '../../../shared/componentkit/table/table.model';

export interface Pos1018 {
  ID: number; // 唯一識別碼
  STO_No: string; // 分店編號
  GUI_YYMM: string; // 發票年月YYYYMM (西元年)
  ECR_No: string; // 收銀機號
  SER_NOS: string; // 發票號碼序號
  GUI_Status: string; // 使用狀態 '00':未使用 '01':使用中 '02':己用完 '03':停用
  GUI_TRACK: string; // 發票字軌
  GUI_SNOS: string; // 發票起始號
  GUI_ENOS: string; // 發票結束號碼
  NEXT_SNOS: string; // 下一個發票號碼
  USED_NOS: number; // 已用張數
  TOT_NOS: number; // 全部張數
  FREE_NOS: number; // 未用張數
  REMARK: string; // 備註
  STO_Uniform: string; // 分店統編
  GUI_Type: string; // 發票類型
  GUI_DownDate: string; // 發票下載日期 (ISO 8601 格式字串)
  GUI_DownUsrNo: string; // 發票下載人員編號
  GUI_Down_UsrName: string; // 發票下載人員名稱
  CRT_Date: string; // 建檔日期 (ISO 8601 格式字串)
  CRT_USR_No: string; // 建檔人員編號
  CRT_USR_Name: string; // 建檔人員名稱
  UPD_Date: string; // 異動日期 (ISO 8601 格式字串)
  UPD_USR_No: string; // 異動人員編號
  UPD_USR_Name: string; // 異動人員名稱
}

export const columns: Column[] = [
  { field: 'GUI_YYMM', header: '發票年月', visible: true, format: formatYYYYMM },
  { field: 'ECR_No', header: '收銀機號', visible: true },
  { field: 'SER_NOS', header: '發票號碼序號', visible: true },
  { field: 'GUI_Status', header: '使用狀態', visible: true, format: (value: string) => statusOptions.find(item => item.value === value)?.label || value },
  { field: 'GUI_TRACK', header: '發票字軌', visible: true },
  { field: 'GUI_SNOS', header: '發票起始號碼', visible: true },
  { field: 'GUI_ENOS', header: '發票結束號碼', visible: true },
  { field: 'NEXT_SNOS', header: '下一個發票號碼', visible: true },
  { field: 'USED_NOS', header: '已用張數', visible: true },
  { field: 'TOT_NOS', header: '全部張數', visible: true },
  { field: 'FREE_NOS', header: '未用張數', visible: true },
  { field: 'REMARK', header: '備註', visible: true },
  { field: 'STO_Uniform', header: '門市統一編號(賣方統編)', visible: true },
  { field: 'GUI_Type', header: '發票類別', visible: true, format: (value: string) => value === '02' ? '二聯式' : '電子發票' },
  { field: 'GUI_DownDate', header: '發票下傳日期時間', visible: true, format: formatDateTime },
  { field: 'GUI_DownUsrNo', header: '發票下傳人員', visible: true },
  { field: 'GUI_Down_UsrName', header: '發票下傳人員姓名', visible: true },
  { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime },
  { field: 'CRT_USR_No', header: '建立人員', visible: true },
  { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
  { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDateTime },
  { field: 'UPD_USR_No', header: '變更人員', visible: true },
  { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true },
];

export const statusOptions = [
  { value: '00', label: '未使用' },
  { value: '01', label: '使用中' },
  { value: '02', label: '己用完' },
  { value: '03', label: '停用' },
];

export const monthOptions = [
  { value: '01', label: '一月' },
  { value: '03', label: '三月' },
  { value: '05', label: '五月' },
  { value: '07', label: '七月' },
  { value: '09', label: '九月' },
  { value: '11', label: '十一月' },
];

export interface POS1002 {
  ECR_No: string;
  ECR_Name: string;
}
