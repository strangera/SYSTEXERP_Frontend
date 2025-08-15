import { SystemOptionsService } from "@service/system/sys1000.service";
import { Column, formatDateTime } from "../../../shared/componentkit/table/table.model";

export interface TDS1008Data {
  ID: number,
  INV_ItemNo: string,
  INV_ItemName: string,
  INV_UsageType: string,
  CRT_Date: string,
  CRT_USR_No: string,
  CRT_USR_Name: string,
  UPD_Date: string,
  UPD_USR_No: string,
  UPD_USR_Name: string
}

export const columns: Column[] = [
  { field: 'INV_ItemNo', header: '品項代號', visible: true },
  { field: 'INV_ItemName', header: '品項名稱', visible: true },
  { field: 'INV_UsageType', header: '使用別', visible: true, format: (val: string) => SystemOptionsService.getOptions('T205').find(item => item.SYS_Code === val)?.SYS_Name || val },
  { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
  { field: 'CRT_USR_No', header: '建立人員', visible: false },
  { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
  { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
  { field: 'UPD_USR_No', header: '變更人員', visible: false },
  { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
];

