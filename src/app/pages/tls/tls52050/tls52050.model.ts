import { Column, formatAmount, formatDate, formatTimeHHMM, formatYN } from "../../../shared/componentkit/table/table.model";

export const enum MAMStatus {
  已申請 = '0',
  已審核 = '1',
  變價生效中 = '2',
  變價結束 = '3',
  作廢 = '9'
}

export const MAM_StatusOptions: { label: string; value: string }[] = [
  { label: '已申請', value: '0' },
  { label: '已審核', value: '1' },
  { label: '變價生效中', value: '2' },
  { label: '變價結束', value: '3' },
  { label: '作廢', value: '9' },
];
export const POS2008M_COLUMNS: Column[] = [
  { field: 'MAM_No', header: '變價單號', visible: true },
  { field: 'LOGO_No', header: '品牌代碼', visible: true },
  { field: 'MAM_BegDate', header: '啟用日期', visible: true, format: formatDate },
  { field: 'MAM_EndDate', header: '結束日期', visible: false, format: formatDate },
  { field: 'VEN_No', header: '廠商編號', visible: true },
  { field: 'MAM_Status', header: '單據狀態', visible: true, format: (value: string) => MAM_StatusOptions.find(x => x.value === value)?.label || value },
  { field: 'MAM_Method', header: '促銷方式', visible: false, format: (value: string) => { switch (value) { case '1': return '永久變價'; case 'H': return '降價促銷'; default: return value; } } },
  { field: 'MAM_TotAmt', header: '組合價格/滿額金額', visible: false, format: formatAmount },
  { field: 'MAM_MaxCondition', header: '限購組數', visible: false },
  { field: 'MAM_DiscType', header: '優惠方式', visible: false, format: (value: string) => { switch (value) { case 'Y': return '優惠價'; case 'N': return '折扣%'; default: return value; } } },
  { field: 'MAM_Source', header: '優先等級', visible: false, format: (value: number) => { switch (value) { case 1: return '低'; case 2: return '中'; case 3: return '高'; default: return value; } } },
  { field: 'MAM_InvDesc', header: 'POS顯示說明', visible: false },
  { field: 'APPLY_USR_Name', header: '申請人員', visible: true },
  { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDate },
  { field: 'APRV_USR_Name', header: '審核人員', visible: true },
  { field: 'APRV_Date', header: '審核日期', visible: true, format: formatDate },
];
