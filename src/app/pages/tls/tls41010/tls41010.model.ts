// import { formatDate, formatDateTime } from "../../../shared/componentkit/table/table.model";
import { getSYS1000, SystemOptionsService } from '../../../service/system/sys1000.service';
import { Column, formatDate, formatDateTime, formatTimeHHMM, formatYN } from "../../../shared/componentkit/table/table.model";

export interface TLS41010QueryParams {
  id: number;
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
  ECR_No?: string;
  ECR_Name?: string;
  ECR_TLT_No?: string;
  ECR_TLT_Name?: string;
  ECR_ActiveDateStart?: string;
  ECR_ActiveDateEnd?: string;
  ECR_CloseDateStart?: string;
  ECR_CloseDateEnd?: string;
  ECR_Status?: string;
  ECR_AreaNo?: string;
  ECR_SubGroup?: string;
  ECR_LocNo?: string;
  ECR_Type?: string;
  ECR_SAL_Type?: string;
  ECR_GUI_Type?: string;
  ECR_USR_No?: string;
  ECR_USR_Name?: string;
  ECR_ComName?: string;
  ECR_IP?: string;
  ECR_SrvIP?: string;
  ECR_TmplNo?: string;
  ECR_SchNo?: string;

}
export interface TLS41010Data {
  ECR_SchNo?: string;
  id: number;
  SYS_StoreNo: string;
  ECR_No: string;
  ECR_Name: string;
  ECR_Type: string;
  ECR_TLT_No: string;
  ECR_TLT_Name: string;
  ECR_USR_No: string;
  ECR_USR_Name: string;
  ECR_ActiveDate?: string | null;
  ECR_ExpireDate: string;
  ECR_CloseDate: string;
  ECR_Status: string;
  ECR_Group: string;
  ECR_SubGroup: string;
  ECR_AreaNo: string;
  ECR_LocNo: string;
  HOS_No: string;
  ECR_SAL_Type: string;
  ECR_ComName: string;
  ECR_IP: string;
  ECR_SrvIP: string;
  ECR_TmplNo: string;
  ECR_SernoType: string;
  ECR_GUI_Type: string;
  ECR_TimeTickInvl: number;
  ECR_Interval: number;
  ECR_MaxQty: number;
  ECR_MaxAmt: number;
  ECR_MaxItemAmt: number;
  ECR_MaxDisc: number;
  ECR_EdcTimeout: number;
  ECR_EdcSettle: string;
  ECR_ForceInput: string;
  ECR_CustCntEntry: string;
  ECR_CustTypeEntry: string;
  ECR_ClerkEntry: string;
  ECR_ForceMember: string;
  ECR_BoxReqCode: string;
  ECR_SelfReport: string;
  ECR_SaleRpt1: string;
  ECR_SaleRpt2: string;
  ECR_SaleRpt3: string;
  ECR_SaleRpt4: string;
  ECR_SaleRpt5: string;
  ECR_SaleRpt6: string;
  ECR_SaleRpt7: string;
  ECR_SaleRpt8: string;
  ECR_SaleRpt9: string;
  ECR_SaleRpt10: string;
  ECR_PcashValid: string;
  ECR_PickUpValid: string;
  ECR_ReprintGUI: string;
  ECR_PrnLogo: string;
  ECR_Logo1: string | null;
  ECR_Logo2: string | null;
  ECR_Logo3: string | null;
  ECR_Logo4: string | null;
  ECR_Logo5: string | null;
  ECR_Logo6: string | null;
  ECR_VoidTxn: string;
  ECR_VoidRstDay: number;
  ECR_CreditNote: string;
  ECR_GUI_PeriodQty: number;
  ECR_GUI_MinQty: number;
  ECR_SettleDD: string;
  ECR_SettleHHNN: string | Date | null;
  CRT_Date?: string | null;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date?: string | null;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}


export interface TLS41010Item {
  ECR_SchNo?: string;

  ECR_Group?: string;
  ECR_SubGroup?: string;
  ECR_AreaNo?: string;
  ECR_LocNo?: string;
  ECR_TmplNo?: string;
  ECR_No: string;
  id: number;
  ECR_TmplDesc: string;
  ECR_TmplStatus: string;
  ECR_TmplBegDate: string;
  ECR_TmplEndDate: string;
  ECR_SernoType: string;
  ECR_GUI_Type: string;
  ECR_TimeTickInvl: number;
  ECR_Interval: number;
  ECR_MaxQty: number;
  ECR_MaxAmt: number;
  ECR_MaxItemAmt: number;
  ECR_MaxDisc: number;
  ECR_EdcTimeout: number;
  ECR_EdcSettle: string;
  ECR_ForceInput: string;
  ECR_CustCntEntry: string;
  ECR_CustTypeEntry: string;
  ECR_ClerkEntry: string;
  ECR_ForceMember: string;
  ECR_SettleDD: string;
  ECR_SettleHHNN: string | Date | null;
  ECR_VoidTxn: string;
  ECR_VoidRstDay: number;
  ECR_CreditNote: string;
  ECR_RestoreVoid: string;
  ECR_GUI_PeriodQty: number;
  ECR_GUI_MinQty: number;
  ECR_SelfReport: string;
  ECR_SaleRpt1: string;
  ECR_SaleRpt2: string;
  ECR_SaleRpt3: string;
  ECR_SaleRpt4: string;
  ECR_SaleRpt5: string;
  ECR_SaleRpt6: string;
  ECR_SaleRpt7: string;
  ECR_SaleRpt8: string;
  ECR_SaleRpt9: string;
  ECR_SaleRpt10: string;
  ECR_PcashValid: string;
  ECR_PickUpValid: string;
  ECR_ReprintGUI: string;
  ECR_PrnLogo: string;
  ECR_Logo1: string | null;
  ECR_Logo2: string | null;
  ECR_Logo3: string | null;
  ECR_Logo4: string | null;
  ECR_Logo5: string | null;
  ECR_Logo6: string | null;
  ECR_KBLevel: string | null;
  ECR_KBType: string | null;
  ECR_Scanner: string | null;
  ECR_ScannerCom: number | null;
  ECR_MSR: string | null;
  ECR_MSRCom: number | null;
  ECR_ScrType: string | null;
  ECR_CD: string | null;
  ECR_CDCom: number | null;
  ECR_ExtScr: string | null;
  ECR_ExtScrCom: number | null;
  ECR_GUIPrn: string | null;
  ECR_GUICom: number | null;
  ECR_SlipPrn: string | null;
  ECR_SlipPrnCom: number | null;
  ECR_OrderPrn: string | null;
  ECR_OrderPrnCom: number | null;
  ECR_LablePrn: string | null;
  ECR_LablePrnCom: number | null;
  ECR_EDC: string | null;
  ECR_EDCCom: number | null;
  ECR_EDC2: string | null;
  ECR_EDC2Com: number | null;
  ECR_EDC3: string | null;
  ECR_EDC3Com: number | null;
  ECR_ElecSVCrdA: string | null;
  ECR_ElecSVCrdACom: number | null;
  ECR_ElecSVCrdB: string | null;
  ECR_ElecSVCrdBCom: number | null;
  ECR_ElecSVCrdC: string | null;
  ECR_ElecSVCrdCCom: number | null;
  ECR_ElecPay: string | null;
  ECR_ElecPayCom: number | null;
  ECR_Drawer: string | null;
  ECR_DrawerCom: number | null;
  ECR_Device1Name: string | null;
  ECR_Device1Com: number | null;
  ECR_Device2Name: string | null;
  ECR_Device2Com: number | null;
  ECR_Device3Name: string | null;
  ECR_Device3Com: number | null;
  ECR_Device4Name: string | null;
  ECR_Device4Com: number | null;
  ECR_Device5Name: string | null;
  ECR_Device5Com: number | null;
  ECR_Device6Name: string | null;
  ECR_Device6Com: number | null;
  ECR_Device7Name: string | null;
  ECR_Device7Com: number | null;
  ECR_Device8Name: string | null;
  ECR_Device8Com: number | null;
  ECR_Device9Name: string | null;
  ECR_Device9Com: number | null;
  ECR_Device10Name: string | null;
  ECR_Device10Com: number | null;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  CRT_Date?: string | null;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  UPD_Date?: string | null;
}


export const columns: Column[] = [
  { field: 'SYS_StoreNo', header: '收銀機所屬門市店號', visible: false },
  { field: 'ECR_No', header: '收銀機號', visible: true },
  { field: 'ECR_Name', header: '機台名稱', visible: true },
  {
    field: 'ECR_Type', header: '機台類型', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_Type')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  { field: 'ECR_TLT_No', header: '專櫃編號' },
  { field: 'ECR_TLT_Name', header: '櫃位名稱' },
  { field: 'ECR_USR_No', header: '收銀員', visible: true },
  { field: 'ECR_USR_Name', header: '姓名', visible: true },
  { field: 'ECR_ActiveDate', header: '啟用日期', visible: true, format: formatDate },
  { field: 'ECR_ExpireDate', header: '到期日期', visible: true, format: formatDate },
  { field: 'ECR_CloseDate', header: '停用日期', visible: true, format: formatDate },
  {
    field: 'ECR_Status',
    header: '機台狀態',
    visible: true,
    format: (value) => getSYS1000('ECR_Status', value)
  },
  { field: 'ECR_Group', header: '館別', visible: true },
  { field: 'ECR_SubGroup', header: '樓層', visible: true },
  { field: 'ECR_AreaNo', header: '區域', visible: true },
  { field: 'ECR_LocNo', header: '位置編號', visible: true },
  { field: 'HOS_No', header: '倉庫編號', visible: true },
  {
    field: 'ECR_SAL_Type', header: '用途別', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_SAL_Type')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  { field: 'ECR_ComName', header: '電腦名稱', visible: true },
  { field: 'ECR_IP', header: '網路IP', visible: true },
  { field: 'ECR_SrvIP', header: '後台主機IP', visible: true },
  { field: 'ECR_TmplNo', header: '環境變數編號', visible: true },
  {
    field: 'ECR_SernoType',
    header: '交易序號模式',
    visible: true,
    format: (value) => getSYS1000('ECR_SernoType', value)
  },

  {
    field: 'ECR_GUI_Type', header: '發票類別', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_GUI_Type')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  { field: 'ECR_TimeTickInvl', header: '系統對時間隔(秒)', visible: true },
  { field: 'ECR_Interval', header: '上下傳異動檔間隔(秒)', visible: true },
  { field: 'ECR_MaxQty', header: '單筆交易數量上限', visible: true },
  { field: 'ECR_MaxAmt', header: '單筆交易金額上限', visible: true },
  { field: 'ECR_MaxItemAmt', header: '單一明細金額上限', visible: true },
  { field: 'ECR_MaxDisc', header: '單筆交易最大折扣比率限制', visible: true },
  { field: 'ECR_EdcTimeout', header: '信用卡刷卡機連線時限(秒)', visible: true },
  { field: 'ECR_EdcSettle', header: '信用卡刷卡機連動日結', visible: true, format: formatYN },
  { field: 'ECR_ForceInput', header: '是否強制輸入付款金額', visible: true, format: formatYN },
  { field: 'ECR_CustCntEntry', header: '是否輸入來客數', visible: true, format: formatYN },
  // // { field: 'ECR_CustTypeEntry', header: '是否輸入客層數', visible: false, format: formatYN },
  // { field: 'ECR_ClerkEntry', header: '是否強制輸入營業員', visible: false, format: formatYN },
  // { field: 'ECR_ForceMember', header: '是否強制輸入會員編號', visible: false, format: formatYN },
  { field: 'ECR_BoxReqCode', header: '開抽屜是否輸入密碼', visible: true, format: formatYN },
  { field: 'ECR_SelfReport', header: '是否執行自我報帳', visible: true, format: formatYN },
  { field: 'ECR_SaleRpt1', header: '是否列印收銀員交班表', visible: true, format: formatYN },
  { field: 'ECR_SaleRpt2', header: '是否列印收銀機財務報表', visible: true, format: formatYN },
  { field: 'ECR_SaleRpt3', header: '是否列印時段銷售報表', visible: true, format: formatYN },
  { field: 'ECR_SaleRpt4', header: '是否列印部門銷售報表', visible: true, format: formatYN },
  { field: 'ECR_SaleRpt5', header: '是否列印單品銷售報表', visible: true, format: formatYN },
  { field: 'ECR_SaleRpt6', header: '是否列印銷貨明細表', visible: true, format: formatYN },
  { field: 'ECR_SaleRpt7', header: '是否列印作廢明細表', visible: true, format: formatYN },
  { field: 'ECR_SaleRpt8', header: '是否列印自我報帳(現額報告)帳條', visible: true, format: formatYN },
  { field: 'ECR_SaleRpt9', header: '是否列印保全現金帳條(現金明細表)', visible: true, format: formatYN },
  { field: 'ECR_SaleRpt10', header: '保留', visible: true, format: formatYN },
  { field: 'ECR_PcashValid', header: '零用金是否需要認證', visible: true, format: formatYN },
  { field: 'ECR_PickUpValid', header: '中途取現是否需要認證', visible: true, format: formatYN },
  { field: 'ECR_ReprintGUI', header: '是否允許執行補印發票', visible: true, format: formatYN },
  { field: 'ECR_PrnLogo', header: '是否列印商標', visible: true, format: formatYN },
  { field: 'ECR_Logo1', header: '商標1 (店名)', visible: true },
  { field: 'ECR_Logo2', header: '商標2 (地址)', visible: true },
  { field: 'ECR_Logo3', header: '商標3 (電話)', visible: true },
  { field: 'ECR_Logo4', header: '商標4 (統一編號)', visible: true },
  { field: 'ECR_Logo5', header: '商標5', visible: true },
  { field: 'ECR_Logo6', header: '商標6', visible: true },
  { field: 'ECR_VoidTxn', header: '是否允許作廢交易', visible: true, format: formatYN },
  { field: 'ECR_VoidRstDay', header: '作廢交易限制天數', visible: true },
  { field: 'ECR_CreditNote', header: '是否允許開立折讓單', visible: true, format: formatYN },
  { field: 'ECR_GUI_PeriodQty', header: '機台每期電子發票預設配號數量', visible: true },
  { field: 'ECR_GUI_MinQty', header: '機台電子發票最小安全存量', visible: true },
  {
    field: 'ECR_SettleDD',
    header: '清機提示日期',
    visible: true,
    format: (value) => getSYS1000('ECR_SettleDD', value)
  },
  { field: 'ECR_SettleHHNN', header: '清機提示時間-時分', visible: true, format: formatTimeHHMM },
  { field: 'ECR_KBLevel', header: '機台鍵盤等級', visible: true },
  {
    field: 'ECR_KBType', header: '訂單印表機型態', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_KBType')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_KBType', header: '訂單印表機連接埠', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_KBType')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  { field: 'ECR_OrderPrn', header: '鍵盤型態', visible: true },
  {
    field: 'ECR_MSR', header: '磁條讀卡機型態', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_MSR')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_MSRCom', header: '磁條讀卡機連接埠', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_MSRCom')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_Scanner', header: '掃描器型態', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_Scanner')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_ScannerCom', header: '掃描器連接埠', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_ScannerCom')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  { field: 'ECR_ScrType', header: '收銀畫面樣式', visible: true },
  {
    field: 'ECR_CD', header: '客戶顯示器型態', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_CD')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_CDCom', header: '客戶顯示器連接埠', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_CDCom')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_ExtScr', header: '收銀外接顯示器名稱', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_ExtScr')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_ExtScrCom', header: '收銀外接顯示器連接埠', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_ExtScrCom')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_GUIPrn', header: '發票印表機型態', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_GUIPrn')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_GUICom', header: '發票印表機連接埠', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_GUICom')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_SlipPrn', header: '菜單印表機型態', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_SlipPrn')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_SlipPrnCom', header: '菜單印表機連接埠', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_SlipPrnCom')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_LablePrn', header: '標籤印表機型態', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_LablePrn')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_LablePrnCom', header: '標籤印表機連接埠', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_LablePrnCom')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_EDC', header: '信用卡刷卡機型態', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_EDC')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_EDCCom', header: '信用卡刷卡機連接埠', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_EDCCom')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_EDC2', header: '第二台信用卡刷卡機型態', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_EDC2')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_EDC2Com', header: '第二台信用卡刷卡機連接埠', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_EDC2Com')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  { field: 'ECR_ElecSVCrdA', header: '悠遊卡', visible: true },
  { field: 'ECR_ElecSVCrdACom', header: '悠遊卡連接埠', visible: true },
  { field: 'ECR_ElecSVCrdB', header: '一卡通', visible: true },
  { field: 'ECR_ElecSVCrdBCom', header: '一卡通連接埠', visible: true },
  { field: 'ECR_ElecSVCrdC', header: '愛金卡', visible: true },
  { field: 'ECR_ElecSVCrdCCom', header: '愛金卡連接埠', visible: true },
  {
    field: 'ECR_ElecPay', header: '電子支付', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_ElecPay')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  {
    field: 'ECR_ElecPayCom', header: '電子支付連接埠', visible: true,
    format: (value) => SystemOptionsService.getOptions('ECR_ElecPayCom')?.find((v) => v.SYS_Code === value)?.SYS_Name || value
  },
  { field: 'ECR_Drawer', header: '錢櫃型態', visible: true },
  { field: 'ECR_DrawerCom', header: '錢櫃連接埠', visible: true },
  { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime },
  { field: 'CRT_USR_No', header: '建立人員', visible: true },
  { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
  { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDateTime },
  { field: 'UPD_USR_No', header: '變更人員', visible: true },
  { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true },
]
