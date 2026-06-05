import { getSYS1000 } from "@service/system/sys1000.service";
import { EditColumn } from "@shared/componentkit/table-edit/table-edit.model";
import { validateMinNumber, validateRequired } from "@shared/componentkit/table-edit/validate-field.model";
import { ReportColumn } from "@shared/componentkit/table-report/table-report.model";
import { formatAmount, formatDate } from "@shared/componentkit/table/table.model";

export const enum MAMStatus {
  已申請 = '0',
  已審核 = '1',
  變價生效中 = '2',
  變價結束 = '3',
  作廢 = '9'
}

export const POS2008M_COLUMNS: ReportColumn[] = [
  { field: 'MAM_No', header: '變價單號', visible: true, width: '110px' },
  { field: 'LOGO_No', header: '品牌代碼', visible: true },
  { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
  { field: 'MAM_BegDate', header: '啟用日期', visible: true, format: formatDate },
  { field: 'MAM_EndDate', header: '結束日期', visible: false, format: formatDate },
  { field: 'VEN_No', header: '廠商編號', visible: true, width: '75px' },
  { field: 'VEN_Name', header: '廠商名稱', visible: true },
  { field: 'MAM_Status', header: '單據狀態', visible: true, format: (value: string) => getSYS1000('MAM_Status', value) },
  // { field: 'MAM_Method', header: '促銷方式', visible: true, format: (value: string) => getSYS1000('MAM_Method', value) },
  { field: 'MAM_TotAmt', header: '組合價格/滿額金額', visible: false, format: formatAmount },
  { field: 'MAM_MaxCondition', header: '限購組數', visible: false },
  { field: 'MAM_DiscType', header: '優惠方式', visible: false, format: (value: string) => getSYS1000('MAM_DiscType', value) },
  { field: 'MAM_Source', header: '優先等級', visible: false, format: (value: number) => getSYS1000('MAM_Source', value) },
  { field: 'MAM_InvDesc', header: 'POS顯示說明', visible: false },
  { field: 'APPLY_USR_Name', header: '申請人員', visible: true },
  { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDate, width: '80px' },
  { field: 'APRV_USR_Name', header: '審核人員', visible: true },
  { field: 'APRV_Date', header: '審核日期', visible: true, format: formatDate, width: '80px' },
];

export const EXPORT_LABEL_COLUMNS: EditColumn[] = [
  { field: 'PLU_MagNo', header: '商品管理編號' },
  { field: 'PLU_Name', header: '商品名稱' },
  { field: 'Label_Qty', header: '標籤數量', type: 'inputNumber', width: '100px', validate: [validateRequired, validateMinNumber(1)] },
  { field: 'PLU_SalePrc', header: '商品售價' },
  { field: 'PLU_Unit', header: '商品單位' },
  { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
  { field: 'PLU_No', header: '國際條碼' },
]
