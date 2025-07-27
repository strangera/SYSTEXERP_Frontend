import { Column, formatDateTime, formatYYYYMM } from "../../../shared/componentkit/table/table.model";

export interface MainInvoiceData {
  ID: number;
  GUI_YYMM: string;
  GUI_SerNo: number;
  GUI_Track: string;
  GUI_BegNo: string;
  GUI_EndNo: string;
  GUI_TotQty: number;
  GUI_AssignQty: number;
  GUI_Status: string;
  GUI_Type?: string;
  GUI_VERIFY1?: string;
  GUI_VERIFY1_Name?: string;
  GUI_VERIFY2?: string | null;
  GUI_VERIFY2_Name?: string | null;
  GUI_File?: string;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  details: SubInvoiceData[]; // 包含子表資料
}

interface SubInvoiceData {
  STO_No: string;
  GUI_YYMM: string;
  GUI_SerNo: number;
  GUI_Track: string;
  GUI_BegNo: string;
  GUI_EndNo: string;
  GUI_TotQty: number;
  GUI_AssignQty: number;
  GUI_Status: string;
  GUI_ProcStatus?: string | null;
  GUI_ProcDate?: string | null;
  GUI_Type?: string;
  STO_Uniform?: string;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

// GUI_Status 的選項
export const guiStatusOptions = [
  { label: '未使用', value: '00' },
  { label: '使用中', value: '01' },
  { label: '已用完', value: '02' },
  { label: '顯示停用', value: '03' },
];

// GUI_Type 的選項
export const guiTypeOptions = [
  { label: '三聯式', value: '01' },
  { label: '二聯式', value: '02' },
  { label: '二聯式收銀機發票', value: '03' },
  { label: '特種稅額', value: '04' },
  { label: '電子計算機發票', value: '05' },
  { label: '三聯式收銀機發票', value: '06' },
  { label: '電子發票', value: '07' },
];

export const columns: Column[] = [
  { field: 'GUI_YYMM', header: '發票年月', visible: true, format: formatYYYYMM }, // 發票年月YYYYMM (西元年單數月)
  { field: 'GUI_SerNo', header: '序號', visible: true }, // 序號
  { field: 'GUI_Track', header: '發票字軌', visible: true }, // 發票字軌
  { field: 'GUI_BegNo', header: '發票起始號碼', visible: true }, // 發票起始號碼
  { field: 'GUI_EndNo', header: '發票結束號碼', visible: true }, // 發票結束號碼
  { field: 'GUI_TotQty', header: '發票張數', visible: true }, // 發票張數
  { field: 'GUI_AssignQty', header: '發票號碼已分配張數', visible: true }, // 發票號碼已分配張數
  {
    field: 'GUI_Status', header: '發票號碼狀態', visible: true,
    format: (value: string) => guiStatusOptions.find(x => x.value === value)?.label || value
  }, // 發票號碼狀態，00=未使用、01=使用中、02=己用完、03=顯示停用
  {
    field: 'GUI_Type', header: '發票類別', visible: true,
    format: (value: string) => guiTypeOptions.find(x => x.value === value)?.label || value
  }, // 發票類別 01=三聯式 02=二聯式 03=二聯式收銀機發票 04=特種稅額 05=電子計算機發票 06=三聯式收銀機發票 07=電子發票
  { field: 'GUI_File', header: '匯入檔案名稱', visible: true }, // 匯入檔案名稱
  { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime }, // 建立日期
  { field: 'CRT_USR_No', header: '建立人員', visible: false }, // 建立人員
  { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false }, // 建立人員姓名
  { field: 'CRT_Date', header: '變更日期', visible: false, format: formatDateTime }, // 變更日期
  { field: 'CRT_USR_No', header: '變更人員', visible: false }, // 變更人員
  { field: 'CRT_USR_Name', header: '變更人員姓名', visible: false }, // 變更人員姓名
];
export const subColumns: Column[] = [
  { field: 'STO_No', header: '分店編號', visible: true }, // 分店編號
  { field: 'GUI_YYMM', header: '發票年月', visible: true }, // 發票年月YYYYMM (西元年單數月)
  { field: 'GUI_SerNo', header: '序號', visible: true }, // 序號
  { field: 'GUI_Track', header: '發票字軌', visible: true }, // 發票字軌
  { field: 'GUI_BegNo', header: '發票起始號碼', visible: true }, // 發票起始號碼
  { field: 'GUI_EndNo', header: '發票結束號碼', visible: true }, // 發票結束號碼
  { field: 'GUI_TotQty', header: '發票張數', visible: true }, // 發票張數
  { field: 'GUI_AssignQty', header: '發票號碼已分配張數', visible: true }, // 發票號碼已分配張數
  {
    field: 'GUI_Status', header: '發票號碼狀態', visible: true,
    format: (value: string) => guiStatusOptions.find(x => x.value === value)?.label || value
  }, // 發票號碼狀態 00=未使用 01=使用中 02=己用完 03=顯示停用
  {
    field: 'GUI_ProcStatus', header: '是否完成上傳', visible: true,
    format: (value: string) => (value === 'Y' ? '是' : '否')
  }, // 是否完成上傳
  { field: 'GUI_ProcDate', header: '上傳日期', visible: true, format: formatDateTime }, // 上傳日期
  {
    field: 'GUI_Type', header: '發票類別', visible: true,
    format: (value: string) => guiTypeOptions.find(x => x.value === value)?.label || value
  }, // 發票類別 01=三聯式 02=二聯式 03=二聯式收銀機發票 04=特種稅額 05=電子計算機發票 06=三聯式收銀機發票 07=電子發票
  { field: 'STO_Uniform', header: '門市統一編號', visible: true }, // 門市統一編號(賣方統編)
  { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime }, // 建立日期
  { field: 'CRT_USR_No', header: '建立人員', visible: true }, // 建立人員
  { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true }, // 建立人員姓名
];
