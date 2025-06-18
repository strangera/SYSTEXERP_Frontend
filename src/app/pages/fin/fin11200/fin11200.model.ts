import { Column, formatDate, formatYYYYMM } from '../../../shared/componentkit/table/table.model';

export interface Pos1018 {
  guiYymm: string;             // 發票年月 YYYYMM (西元年)
  posNos: string;              // 收銀機號
  serNos: string;              // 發票號碼序號
  status?: string;             // 使用狀態 '00':未使用'01':使用中'02':己用完'03':停用
  guiTrack?: string;           // 發票字軌
  guiSnos?: string;            // 發票起始號
  guiEnos?: string;            // 發票終止號
  nextSnos?: string;           // 下一個發票號碼
  usedNos?: number;            // 已用張數
  totNos?: number;             // 全部張數
  freeNos?: number;            // 未用張數
  remark?: string;             // 備註
  creDate?: Date;              // 建檔日期
  updDate?: Date;              // 異動日期
  updUser?: string;            // 異動者
  guiOpenYn?: string;          // 跨月開立旗標
  stoNo: string;               // 分店編號
  guiOverBegDate?: Date;       // 跨月開立起始日期
  guiOverEndDate?: Date;       // 跨月開立終止日期
  einvFlag?: string;           // 電子發票註記
}

export const columns: Column[] = [
  { field: 'guiYymm', header: '發票年月', visible: true, format: formatYYYYMM },
  { field: 'posNos', header: '收銀機號', visible: true },
  { field: 'serNos', header: '發票號碼序號', visible: true },
  { field: 'status', header: '使用狀態', visible: true, format: (value: string) => statusOptions.find(item => item.value === value)?.label || value },
  { field: 'guiTrack', header: '發票字軌', visible: true },
  { field: 'guiSnos', header: '發票起始號', visible: true },
  { field: 'guiEnos', header: '發票終止號', visible: true },
  { field: 'nextSnos', header: '下一個發票號碼', visible: true },
  { field: 'usedNos', header: '已用張數', visible: true },
  { field: 'totNos', header: '全部張數', visible: true },
  { field: 'freeNos', header: '未用張數', visible: true },
  { field: 'remark', header: '備註', visible: true },
  { field: 'creDate', header: '建檔日期', visible: true, format: formatDate },
  { field: 'updDate', header: '異動日期', visible: true, format: formatDate },
  { field: 'updUser', header: '異動者', visible: true },
  { field: 'guiOpenYn', header: '跨月開立旗標', visible: true },
  { field: 'stoNo', header: '分店編號', visible: true },
  { field: 'guiOverBegDate', header: '跨月開立起始日期', visible: true, format: formatDate },
  { field: 'guiOverEndDate', header: '跨月開立終止日期', visible: true, format: formatDate },
  { field: 'einvFlag', header: '電子發票註記', visible: true },
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
