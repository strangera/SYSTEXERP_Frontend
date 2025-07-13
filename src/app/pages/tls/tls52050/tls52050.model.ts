import { Column, formatDate, formatTimeHHMM, formatYN } from "../../../shared/componentkit/table/table.model";

export const MAM_StatusOptions: { label: string; value: string }[] = [
  { label: '已申請', value: '0' },
  { label: '已審核', value: '1' },
  { label: '變價生效中', value: '2' },
  { label: '變價結束', value: '3' },
  { label: '作廢', value: '9' },
];

export const POS2008M_COLUMNS: Column[] = [
  { field: 'MAM_No', header: '促銷編號', visible: true },
  { field: 'SYS_StoreNo', header: '門市店號', visible: true },
  { field: 'VEN_No', header: '廠商編號', visible: true },
  { field: 'LOGO_No', header: '品牌代碼', visible: true },
  { field: 'MAM_BegDate', header: '生效起始日期', visible: true, format: formatDate },
  { field: 'MAM_EndDate', header: '生效結束日期', visible: true, format: formatDate },
  {
    field: 'MAM_Status',
    header: '變價狀態',
    visible: true,
    format: (value: string) => {
      switch (value) {
        case '0': return '已申請';
        case '1': return '已審核';
        case '2': return '變價生效中';
        case '3': return '變價結束';
        case '9': return '作廢';
        default: return value;
      }
    }
  },
  {
    field: 'MAM_Method',
    header: '促銷方式',
    visible: true,
    format: (value: string) => {
      switch (value) {
        case '1': return '永久變價';
        case 'H': return '降價促銷';
        default: return value;
      }
    }
  },
  { field: 'MAM_TotAmt', header: '組合價格/滿額金額', visible: true },
  { field: 'MAM_MaxCondition', header: '限購組數', visible: true },
  {
    field: 'MAM_DiscType',
    header: '優惠方式',
    visible: true,
    format: (value: string) => {
      switch (value) {
        case 'Y': return '優惠價';
        case 'N': return '折扣%';
        default: return value;
      }
    }
  },
  {
    field: 'MAM_Source',
    header: '優先等級',
    visible: true,
    format: (value: number) => {
      switch (value) {
        case 1: return '低';
        case 2: return '中';
        case 3: return '高';
        default: return value;
      }
    }
  },
  { field: 'MAM_InvDesc', header: 'POS顯示說明', visible: true },
  { field: 'APPLY_Date', header: '申請日期', visible: true, format: formatDate },
  { field: 'APPLY_USR_Name', header: '申請人員姓名', visible: true },
  { field: 'APRV_Date', header: '審核日期', visible: true, format: formatDate },
  { field: 'APRV_USR_Name', header: '審核人員姓名', visible: true },
  { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDate }, // 預設隱藏
  { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false }, // 預設隱藏
  { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDate }, // 預設隱藏
  { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false }, // 預設隱藏

  // 以下欄位預設為隱藏，可根據需求調整 visible: true
  { field: 'id', header: 'ID', visible: false },
  { field: 'MID', header: '商戶編號', visible: false },
  { field: 'MAM_Remark', header: '變價備註', visible: false },
  { field: 'MAM_ActiveDate', header: '變價啟動日期', visible: false, format: formatDate },
  { field: 'MAM_FirstActiveDate', header: '第一次變價啟動日期', visible: false, format: formatDate },
  { field: 'MAM_RecoverDate', header: '變價回復日期', visible: false, format: formatDate },
  { field: 'MAM_PLU_MagNo', header: '促銷條碼貨號', visible: false },
  { field: 'MAM_BegTime', header: '促銷開始時段', visible: false, format: formatTimeHHMM },
  { field: 'MAM_EndTime', header: '促銷結束時段', visible: false, format: formatTimeHHMM },
  {
    field: 'MAM_DateType',
    header: '日期種類',
    visible: false,
    format: (value: string) => {
      switch (value) {
        case '1': return '每日';
        case '2': return '每週';
        case '3': return '每月';
        default: return value;
      }
    }
  },
  { field: 'MAM_Week1', header: '星期一', visible: false, format: formatYN },
  { field: 'MAM_Week2', header: '星期二', visible: false, format: formatYN },
  { field: 'MAM_Week3', header: '星期三', visible: false, format: formatYN },
  { field: 'MAM_Week4', header: '星期四', visible: false, format: formatYN },
  { field: 'MAM_Week5', header: '星期五', visible: false, format: formatYN },
  { field: 'MAM_Week6', header: '星期六', visible: false, format: formatYN },
  { field: 'MAM_Week7', header: '星期日', visible: false, format: formatYN },
  { field: 'MAM_Day', header: '每月幾號', visible: false },
  {
    field: 'MAM_Type',
    header: '價格種類',
    visible: false,
    format: (value: string) => {
      switch (value) {
        case '1': return '售價促銷';
        case '2': return '進價促銷';
        case '3': return '售價及進價促銷';
        default: return value;
      }
    }
  },
  { field: 'APPLY_USR_No', header: '申請人員編號', visible: false },
  { field: 'APRV_USR_No', header: '審核人員編號', visible: false },
  { field: 'ReAPRV_Date', header: '反審核日期', visible: false, format: formatDate },
  { field: 'ReAPRV_USR_No', header: '反審核人員編號', visible: false },
  { field: 'ReAPRV_USR_Name', header: '反審核人員姓名', visible: false },
  { field: 'Void_Date', header: '作廢日期', visible: false, format: formatDate },
  { field: 'Void_USR_No', header: '作廢人員編號', visible: false },
  { field: 'Void_USR_Name', header: '作廢人員姓名', visible: false },
  { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
  { field: 'UPD_USR_No', header: '變更人員編號', visible: false },
];
